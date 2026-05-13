import { useState, useRef } from 'react'
import { useShifts, EMPLOYER_COLORS, EMPLOYER_NAMES } from '../hooks/useShifts'
import { formatTime } from '../utils/dateHelpers'
import { supabase } from '../lib/supabase'

const EMPLOYERS = Object.keys(EMPLOYER_NAMES)

export default function OCRUpload({ onBack }) {
  const { addShift } = useShifts()
  const fileRef = useRef()
  const [stage, setStage] = useState('idle') // idle | processing | review | done
  const [progress, setProgress] = useState(0)
  const [parsed, setParsed] = useState([])
  const [selected, setSelected] = useState({})
  const [saving, setSaving] = useState(false)

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleFile = async (file) => {
    if (!file) return
    setStage('processing')
    setProgress(50)

    try {
      const image = await toBase64(file)
      const mediaType = file.type || 'image/jpeg'

      const { data, error } = await supabase.functions.invoke('extract-shifts', {
        body: { image, mediaType },
      })

      console.log('[extract-shifts]', { data, error })
      if (error) throw error
      setProgress(100)

      const raw = typeof data === 'string' ? JSON.parse(data) : data
      const shifts = Array.isArray(raw) ? raw : []

      const detected = shifts.map((s) => ({
        employer: detectEmployer(s.location ?? s.role ?? ''),
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        notes: s.role ?? '',
      }))

      if (detected.length === 0) {
        setStage('idle')
        alert("Couldn't find shifts in that screenshot.")
        return
      }

      const withIds = detected.map((s, i) => ({ ...s, _id: String(i) }))
      setParsed(withIds)
      setSelected(Object.fromEntries(withIds.map((s) => [s._id, true])))
      setStage('review')
    } catch (err) {
      console.error(err)
      setStage('idle')
      alert('Could not read screenshot — try again.')
    }
  }

  function detectEmployer(text) {
    const t = text.toLowerCase()
    if (t.includes('publix')) return 'publix'
    if (t.includes('vanderbilt') || t.includes('vumc')) return 'vanderbilt'
    if (t.includes('nashville') || t.includes('ngh')) return 'nashville_general'
    return 'other'
  }

  const updateParsed = (id, key, value) =>
    setParsed((prev) => prev.map((s) => s._id === id ? { ...s, [key]: value } : s))

  const handleImport = async () => {
    setSaving(true)
    for (const shift of parsed.filter((s) => selected[s._id])) {
      try {
        await addShift({ employer: shift.employer, date: shift.date, startTime: shift.startTime, endTime: shift.endTime, notes: '' })
      } catch (e) { console.error(e) }
    }
    setSaving(false)
    setStage('done')
  }

  const selectedCount = Object.values(selected).filter(Boolean).length

  return (
    <div className="flex flex-col min-h-full bg-[#0f0f0f] pb-24 md:pb-8">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-6 pb-4">
        <button onClick={onBack} className="w-9 h-9 -ml-1 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div>
          <div className="text-white/40 text-xs uppercase tracking-widest">Import</div>
          <div className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>Upload Schedule</div>
        </div>
      </div>

      <div className="px-4 space-y-4">

        {/* Idle */}
        {stage === 'idle' && (
          <>
            <p className="text-white/40 text-sm leading-relaxed">
              Screenshot your Science Provider or Teams schedule, then upload it here. Shift dates and times will be read automatically.
            </p>
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-white/15 rounded-2xl p-12 flex flex-col items-center gap-3 hover:border-white/30 active:scale-98 transition-all"
            >
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-white/35 text-sm font-medium">Tap to choose screenshot</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          </>
        )}

        {/* Processing */}
        {stage === 'processing' && (
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div className="text-5xl">🔍</div>
            <div className="font-black text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>Reading your schedule…</div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: '#00A651' }}
              />
            </div>
            <div className="text-white/35 text-sm">{progress}%</div>
          </div>
        )}

        {/* Review */}
        {stage === 'review' && (
          <>
            <p className="text-white/40 text-sm">
              Found {parsed.length} shift{parsed.length !== 1 ? 's' : ''}. Deselect any that look wrong, fix the employer if needed.
            </p>

            <div className="space-y-3">
              {parsed.map((shift) => {
                const color = EMPLOYER_COLORS[shift.employer]
                const on = selected[shift._id]
                return (
                  <div
                    key={shift._id}
                    className="bg-[#1a1a1a] rounded-2xl p-4 transition-all"
                    style={{ opacity: on ? 1 : 0.35, borderLeft: `4px solid ${on ? color : 'rgba(255,255,255,0.1)'}` }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color }}>
                          {EMPLOYER_NAMES[shift.employer]}
                        </div>
                        <div className="font-black text-2xl leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
                          {formatTime(shift.startTime)}&thinsp;→&thinsp;{formatTime(shift.endTime)}
                        </div>
                        <div className="text-white/45 text-sm mt-1">{shift.date}</div>
                      </div>
                      <button
                        onClick={() => setSelected((p) => ({ ...p, [shift._id]: !p[shift._id] }))}
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all"
                        style={{ backgroundColor: on ? color : 'rgba(255,255,255,0.1)' }}
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
                      {EMPLOYERS.map((e) => (
                        <option key={e} value={e} style={{ backgroundColor: '#1a1a1a' }}>
                          {EMPLOYER_NAMES[e]}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>

            <button
              onClick={handleImport}
              disabled={saving || selectedCount === 0}
              className="w-full bg-white text-black font-bold rounded-xl py-4 transition-all active:scale-95 disabled:opacity-40"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {saving ? 'Importing…' : `Import ${selectedCount} shift${selectedCount !== 1 ? 's' : ''}`}
            </button>
          </>
        )}

        {/* Done */}
        {stage === 'done' && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="text-5xl">✅</div>
            <div className="font-black text-2xl" style={{ fontFamily: "'Syne', sans-serif" }}>Done!</div>
            <p className="text-white/40 text-sm">Shifts added. They'll sync to all your devices.</p>
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
    </div>
  )
}
