import { useState, useRef, useEffect, useCallback } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'
import { useShifts } from '../hooks/useShifts'
import { useCategories } from '../hooks/useCategories'
import { supabase } from '../lib/supabase'
import { formatTime } from '../utils/dateHelpers'
import { FACILITY_INFO } from '../utils/commuteCalc'
import CategoryEditor from './CategoryEditor'
import CatIcon from './CatIcon'

const MAPS_LIBRARIES = ['places']

export default function AddShift({ onBack, defaultDate, onSuccess, onNewCategory }) {
  const { addShift } = useShifts()
  const { categories, getCategoryByKey, createCategory, updateCategory } = useCategories()

  // ── Google Maps Places (for location autocomplete) ────────────────────────
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { isLoaded: mapsLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? '',
    libraries: MAPS_LIBRARIES,
  })

  // ── Shared ────────────────────────────────────────────────────────────────
  const [mode, setMode]       = useState('manual') // 'manual' | 'screenshot'
  const [employer, setEmployer] = useState(() => categories[0]?.key ?? 'publix')
  const [editorMode, setEditorMode] = useState(null)
  const selectedCat = getCategoryByKey(employer)

  // ── Manual entry ─────────────────────────────────────────────────────────
  const [date, setDate]           = useState(defaultDate || '')
  const [startTime, setStartTime] = useState('07:00')
  const [endTime, setEndTime]     = useState('15:00')
  const [notes, setNotes]         = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  // ── Location autocomplete ─────────────────────────────────────────────────
  const [location, setLocation]         = useState('')
  const [locationValid, setLocationValid] = useState(false)
  const [suggestions, setSuggestions]   = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [noResults, setNoResults]       = useState(false)
  const [locLoading, setLocLoading]     = useState(false)
  const [activeIndex, setActiveIndex]   = useState(-1)
  const debounceRef     = useRef(null)
  const locationWrapRef = useRef(null)
  const pendingLocationRef = useRef('')

  useEffect(() => {
    const onMouseDown = (e) => {
      if (locationWrapRef.current && !locationWrapRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const placesReady = () => !!window.google?.maps?.places?.AutocompleteService

  const queryPlaces = useCallback((value) => {
    if (!placesReady() || !value.trim()) return
    const svc = new window.google.maps.places.AutocompleteService()
    svc.getPlacePredictions({ input: value }, (preds, status) => {
      setLocLoading(false)
      const OK = window.google.maps.places.PlacesServiceStatus.OK
      if (status === OK && preds?.length) {
        setSuggestions(preds)
        setActiveIndex(-1)
        setNoResults(false)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setActiveIndex(-1)
        setNoResults(true)
        setShowSuggestions(true)
      }
    })
  }, [])

  // Re-fire when Maps API loads after user has already typed
  useEffect(() => {
    if (mapsLoaded && pendingLocationRef.current && !locationValid) {
      queryPlaces(pendingLocationRef.current)
    }
  }, [mapsLoaded, locationValid, queryPlaces])

  const handleLocationChange = (value) => {
    setLocation(value)
    setLocationValid(false)
    setNoResults(false)
    setActiveIndex(-1)
    pendingLocationRef.current = value
    clearTimeout(debounceRef.current)
    if (!value.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      setLocLoading(false)
      return
    }
    setLocLoading(true)
    setShowSuggestions(true)
    debounceRef.current = setTimeout(() => queryPlaces(value), 300)
  }

  const handleSelectSuggestion = (pred) => {
    setLocation(pred.description)
    setLocationValid(true)
    setSuggestions([])
    setNoResults(false)
    setShowSuggestions(false)
    setLocLoading(false)
    setActiveIndex(-1)
  }

  const handleLocationKeyDown = (e) => {
    if (!showSuggestions || !suggestions.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelectSuggestion(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setActiveIndex(-1)
    }
  }

  const highlightMatch = (text, matches) => {
    if (!matches?.length) return <span>{text}</span>
    const parts = []
    let last = 0
    matches.forEach(({ offset, length }, idx) => {
      if (offset > last) parts.push(<span key={`t${idx}`} className="text-white/60">{text.slice(last, offset)}</span>)
      parts.push(<span key={`m${idx}`} className="text-white font-semibold">{text.slice(offset, offset + length)}</span>)
      last = offset + length
    })
    if (last < text.length) parts.push(<span key="end" className="text-white/60">{text.slice(last)}</span>)
    return parts
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!date) return setError('Date is required')
    if (location.trim() && !locationValid) {
      return setError('Please select a location from the suggestions, or clear the field to use the default.')
    }
    setSaving(true)
    try {
      await addShift({ employer, date, startTime, endTime, notes, location: location.trim() || null, source: 'manual' })
      onSuccess?.()
      onBack()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  // ── Screenshot / OCR ─────────────────────────────────────────────────────
  const fileRef = useRef()
  const [ocrStage, setOcrStage] = useState('idle') // idle | processing | review | done
  const [progress, setProgress] = useState(0)
  const [parsed,   setParsed]   = useState([])
  const [selected, setSelected] = useState({})
  const [ocrSaving, setOcrSaving] = useState(false)

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload  = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleFile = async (file) => {
    if (!file) return
    setOcrStage('processing')
    setProgress(50)
    try {
      const image     = await toBase64(file)
      const mediaType = file.type || 'image/jpeg'
      const company   = getCategoryByKey(employer)?.name ?? 'Unknown'

      const { data, error } = await supabase.functions.invoke('extract-shifts', {
        body: { image, mediaType, year: new Date().getFullYear(), company },
      })
      if (error) throw error

      setProgress(100)
      const raw    = typeof data === 'string' ? JSON.parse(data) : data
      const shifts = Array.isArray(raw) ? raw : []

      const currentYear = new Date().getFullYear()
      const detected = shifts
        .filter((s) => s.startTime && s.endTime)
        .map((s) => ({
          employer,
          date:      s.date?.replace(/^\d{4}/, String(currentYear)) ?? s.date,
          startTime: s.startTime,
          endTime:   s.endTime,
          notes:     '',
        }))

      if (detected.length === 0) {
        setOcrStage('idle')
        alert('No work shifts found — only days off detected in this screenshot.')
        return
      }

      const withIds = detected.map((s, i) => ({ ...s, _id: String(i) }))
      setParsed(withIds)
      setSelected(Object.fromEntries(withIds.map((s) => [s._id, true])))
      setOcrStage('review')
    } catch (err) {
      console.error(err)
      setOcrStage('idle')
      alert('Could not read screenshot — try again.')
    }
  }

  const updateParsed = (id, key, value) =>
    setParsed((prev) => prev.map((s) => s._id === id ? { ...s, [key]: value } : s))

  const handleImport = async () => {
    setOcrSaving(true)
    const toImport = parsed.filter((s) => selected[s._id])
    for (const shift of toImport) {
      try {
        await addShift({
          employer:  shift.employer,
          date:      shift.date,
          startTime: shift.startTime,
          endTime:   shift.endTime,
          notes:     '',
        })
      } catch (e) { console.error(e) }
    }
    setOcrSaving(false)
    onSuccess?.(toImport.length)
    setOcrStage('done')
  }

  const selectedCount = Object.values(selected).filter(Boolean).length

  // ── Category editor ───────────────────────────────────────────────────────
  const handleCategoryEditorSave = ({ name, color, emoji, svgIcon }) => {
    if (editorMode === 'create') {
      const newCat = createCategory({ name, color, emoji, svgIcon: svgIcon || undefined })
      setEmployer(newCat.key)
      onNewCategory?.()
    } else if (editorMode?.editKey) {
      updateCategory(editorMode.editKey, { name, color, emoji, svgIcon: svgIcon || null })
    }
    setEditorMode(null)
  }

  const color = selectedCat?.color ?? '#ffffff'

  return (
    <>
      <div className="flex flex-col min-h-full bg-[#0f0f0f] pb-24 md:pb-8">

        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-6 pb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 -ml-1 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div>
            <div className="text-white/40 text-xs uppercase tracking-widest">New</div>
            <div className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>Add Shift</div>
          </div>
        </div>

        <div className="px-4 space-y-4">

          {/* ── Category picker ───────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className="text-white/35 text-[10px] uppercase tracking-widest"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Category
              </label>
              <button
                type="button"
                onClick={() => setEditorMode({ editKey: employer })}
                className="text-[10px] uppercase tracking-widest text-white/25 hover:text-white/60 transition-colors flex items-center gap-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setEmployer(cat.key)}
                  className="py-3 px-3 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center gap-2"
                  style={
                    employer === cat.key
                      ? { backgroundColor: cat.color, color: '#0f0f0f' }
                      : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }
                  }
                >
                  <CatIcon cat={cat} size={18} />
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setEditorMode('create')}
                className="py-3 px-3 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center gap-2"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.3)',
                  border: '2px dashed rgba(255,255,255,0.12)',
                }}
              >
                <span className="text-base leading-none">+</span>
                <span>New Category</span>
              </button>
            </div>
          </div>

          {/* ── Mode toggle ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'manual',     label: 'Manual Entry',   icon: '✍️' },
              { id: 'screenshot', label: 'From Screenshot', icon: '📸' },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => { setMode(id); setOcrStage('idle') }}
                className="py-3 px-3 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: mode === id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                  color: mode === id ? '#ffffff' : 'rgba(255,255,255,0.35)',
                  border: `1.5px solid ${mode === id ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* ── Manual entry fields ───────────────────────────────────────── */}
          {mode === 'manual' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label
                  className="text-white/35 text-[10px] uppercase tracking-widest block mb-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-[#1a1a1a] rounded-xl px-4 py-3.5 text-white outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="text-white/35 text-[10px] uppercase tracking-widest block mb-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Start
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-[#1a1a1a] rounded-xl px-4 py-3.5 text-white outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <label
                    className="text-white/35 text-[10px] uppercase tracking-widest block mb-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    End
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-[#1a1a1a] rounded-xl px-4 py-3.5 text-white outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div ref={locationWrapRef}>
                <label
                  className="text-white/35 text-[10px] uppercase tracking-widest block mb-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Location
                </label>
                <div className="relative">
                  {/* Left icon */}
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm select-none pointer-events-none">
                    {locationValid ? '✅' : '📍'}
                  </span>

                  {/* Right: spinner or clear */}
                  {locLoading && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="block w-4 h-4 rounded-full border-2 border-white/15 border-t-white/50 animate-spin" />
                    </span>
                  )}
                  {!locLoading && location.trim() && !locationValid && (
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); handleLocationChange('') }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                      tabIndex={-1}
                    >
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
                        <path d="M1 1l8 8M9 1l-8 8" />
                      </svg>
                    </button>
                  )}

                  <input
                    type="text"
                    value={location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    onFocus={() => { if (location.trim() && !locationValid) setShowSuggestions(true) }}
                    onKeyDown={handleLocationKeyDown}
                    placeholder={FACILITY_INFO[employer]?.address || 'Search for an address or place…'}
                    className="w-full rounded-xl pl-9 pr-9 py-3.5 text-white placeholder-white/20 outline-none transition-all text-sm"
                    style={{
                      backgroundColor: '#1a1a1a',
                      boxShadow: location.trim() && !locationValid && !locLoading
                        ? '0 0 0 1px rgba(239,68,68,0.5)'
                        : locationValid
                          ? '0 0 0 1px rgba(74,222,128,0.4)'
                          : showSuggestions
                            ? '0 0 0 1px rgba(255,255,255,0.18)'
                            : '0 0 0 1px rgba(255,255,255,0.08)',
                    }}
                    autoComplete="off"
                  />

                  {/* Autocomplete dropdown */}
                  {showSuggestions && (
                    <div
                      className="absolute z-50 left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-xl"
                      style={{ backgroundColor: '#1e1e1e', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                      {locLoading ? (
                        <div className="px-4 py-3 flex items-center gap-3">
                          <span className="block w-3.5 h-3.5 rounded-full border-2 border-white/15 border-t-white/45 animate-spin flex-shrink-0" />
                          <span className="text-white/35 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Searching…
                          </span>
                        </div>
                      ) : suggestions.length > 0 ? (
                        <ul>
                          {suggestions.map((pred, i) => {
                            const fmt  = pred.structured_formatting
                            const main = fmt?.main_text ?? pred.description
                            const sub  = fmt?.secondary_text
                            const highlighted = highlightMatch(main, fmt?.main_text_matched_substrings)
                            const isActive = i === activeIndex
                            return (
                              <li key={pred.place_id}>
                                <button
                                  type="button"
                                  onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(pred) }}
                                  onMouseEnter={() => setActiveIndex(i)}
                                  onMouseLeave={() => setActiveIndex(-1)}
                                  className="w-full text-left px-4 py-3 text-sm flex items-start gap-3 transition-colors"
                                  style={{
                                    backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                                    borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                  }}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                  </svg>
                                  <span>
                                    <span className="block leading-snug">{highlighted}</span>
                                    {sub && (
                                      <span className="text-white/35 text-xs mt-0.5 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                        {sub}
                                      </span>
                                    )}
                                  </span>
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      ) : noResults ? (
                        <div className="px-4 py-3.5 flex items-center gap-3">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" className="flex-shrink-0">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                          </svg>
                          <div>
                            <span className="text-white/45 text-sm block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              No locations found
                            </span>
                            <span className="text-white/25 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              Try a different address or place name
                            </span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Hint / error state */}
                {location.trim() && !locationValid && !locLoading ? (
                  <p className="text-red-400/80 text-[10px] mt-1.5 px-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Select a result from the list — unrecognised locations won't appear on the map.
                  </p>
                ) : (
                  <p className="text-white/25 text-[10px] mt-1.5 px-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {locationValid ? `✓ Location confirmed` : 'Leave blank to use the default address for this category.'}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="text-white/35 text-[10px] uppercase tracking-widest block mb-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-[#1a1a1a] rounded-xl px-4 py-3.5 text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={saving}
                className="w-full font-bold rounded-xl py-4 transition-all active:scale-95 disabled:opacity-50 text-black"
                style={{ backgroundColor: color, fontFamily: "'Syne', sans-serif" }}
              >
                {saving ? 'Saving…' : 'Save Shift'}
              </button>
            </form>
          )}

          {/* ── Screenshot / OCR flow ────────────────────────────────────── */}
          {mode === 'screenshot' && (
            <div className="space-y-4">

              {/* Upload tap zone */}
              {ocrStage === 'idle' && (
                <>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full rounded-2xl p-12 flex flex-col items-center gap-4 transition-all active:scale-98 hover:border-white/20"
                    style={{
                      border: `2px dashed ${color}50`,
                      backgroundColor: `${color}08`,
                    }}
                  >
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={`${color}80`} strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <div>
                      <div className="text-white/70 text-sm font-semibold text-center">
                        Tap to upload your shift screenshot
                      </div>
                      <div
                        className="text-white/30 text-xs text-center mt-1"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        Dates and times are read automatically
                      </div>
                    </div>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </>
              )}

              {/* Processing */}
              {ocrStage === 'processing' && (
                <div className="flex flex-col items-center justify-center py-16 gap-5">
                  <div className="text-5xl">🔍</div>
                  <div className="font-black text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Reading your schedule…
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              )}

              {/* Review */}
              {ocrStage === 'review' && (
                <>
                  <p
                    className="text-white/40 text-sm"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Found {parsed.length} shift{parsed.length !== 1 ? 's' : ''}. Deselect any that look wrong.
                  </p>

                  <div className="space-y-3">
                    {parsed.map((shift) => {
                      const cat = getCategoryByKey(shift.employer)
                      const on  = selected[shift._id]
                      return (
                        <div
                          key={shift._id}
                          className="bg-[#1a1a1a] rounded-2xl p-4 transition-all"
                          style={{
                            opacity: on ? 1 : 0.35,
                            borderLeft: `4px solid ${on ? cat.color : 'rgba(255,255,255,0.1)'}`,
                          }}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <div
                                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2"
                                style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                              >
                                <CatIcon cat={cat} size={12} />
                                <span>{cat.name}</span>
                              </div>
                              <div
                                className="font-black text-2xl leading-none"
                                style={{ fontFamily: "'Syne', sans-serif" }}
                              >
                                {formatTime(shift.startTime)}&thinsp;→&thinsp;{formatTime(shift.endTime)}
                              </div>
                              <div
                                className="text-white/45 text-sm mt-1"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                              >
                                {shift.date}
                              </div>
                            </div>
                            <button
                              onClick={() => setSelected((p) => ({ ...p, [shift._id]: !p[shift._id] }))}
                              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all"
                              style={{ backgroundColor: on ? cat.color : 'rgba(255,255,255,0.1)' }}
                            >
                              {on && (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="3.5">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                              )}
                            </button>
                          </div>

                          <select
                            value={shift.employer}
                            onChange={(e) => updateParsed(shift._id, 'employer', e.target.value)}
                            className="w-full text-sm rounded-lg px-3 py-2 outline-none text-white"
                            style={{ backgroundColor: 'rgba(255,255,255,0.07)', colorScheme: 'dark' }}
                          >
                            {categories.map((c) => (
                              <option key={c.key} value={c.key} style={{ backgroundColor: '#1a1a1a' }}>
                                {c.emoji} {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )
                    })}
                  </div>

                  <button
                    onClick={handleImport}
                    disabled={ocrSaving || selectedCount === 0}
                    className="w-full font-bold rounded-xl py-4 transition-all active:scale-95 disabled:opacity-40 text-black"
                    style={{ backgroundColor: color, fontFamily: "'Syne', sans-serif" }}
                  >
                    {ocrSaving ? 'Importing…' : `Import ${selectedCount} shift${selectedCount !== 1 ? 's' : ''}`}
                  </button>
                </>
              )}

              {/* Done */}
              {ocrStage === 'done' && (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <div className="text-5xl">✅</div>
                  <div className="font-black text-2xl" style={{ fontFamily: "'Syne', sans-serif" }}>Done!</div>
                  <p
                    className="text-white/40 text-sm"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Shifts added. They'll show up on the calendar.
                  </p>
                  <button
                    onClick={onBack}
                    className="mt-3 bg-white text-black font-bold rounded-xl px-8 py-3.5 active:scale-95 transition-all"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Back to calendar
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* Category editor modal */}
      {editorMode && (
        <CategoryEditor
          title={editorMode === 'create' ? 'New Category' : `Edit ${getCategoryByKey(editorMode.editKey)?.name}`}
          initial={editorMode === 'create' ? {} : (() => {
            const cat = getCategoryByKey(editorMode.editKey)
            return { name: cat.name, color: cat.color, emoji: cat.emoji, svgIcon: cat.svgIcon }
          })()}
          onSave={handleCategoryEditorSave}
          onClose={() => setEditorMode(null)}
        />
      )}
    </>
  )
}
