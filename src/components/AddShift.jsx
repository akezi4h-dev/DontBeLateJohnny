import { useState, useRef } from 'react'
import { useShifts } from '../hooks/useShifts'
import { useCategories } from '../hooks/useCategories'
import { supabase } from '../lib/supabase'
import { formatTime } from '../utils/dateHelpers'
import CategoryEditor from './CategoryEditor'

export default function AddShift({ onBack, defaultDate, onSuccess, onNewCategory }) {
  const { addShift } = useShifts()
  const { categories, getCategoryByKey, createCategory, updateCategory } = useCategories()

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

  const handleSave = async (e) => {
    e.preventDefault()
    if (!date) return setError('Date is required')
    setSaving(true)
    try {
      await addShift({ employer, date, startTime, endTime, notes })
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
  const handleCategoryEditorSave = ({ name, color, emoji }) => {
    if (editorMode === 'create') {
      const newCat = createCategory({ name, color, emoji })
      setEmployer(newCat.key)
      onNewCategory?.()
    } else if (editorMode?.editKey) {
      updateCategory(editorMode.editKey, { name, color, emoji })
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
                  <span className="text-base leading-none">{cat.emoji}</span>
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
                                <span>{cat.emoji}</span>
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
            return { name: cat.name, color: cat.color, emoji: cat.emoji }
          })()}
          onSave={handleCategoryEditorSave}
          onClose={() => setEditorMode(null)}
        />
      )}
    </>
  )
}
