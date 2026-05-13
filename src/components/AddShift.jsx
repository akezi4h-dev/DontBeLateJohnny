import { useState } from 'react'
import { useShifts, EMPLOYER_COLORS, EMPLOYER_NAMES } from '../hooks/useShifts'

export default function AddShift({ onBack, defaultDate }) {
  const { addShift } = useShifts()
  const [employer, setEmployer] = useState('publix')
  const [date, setDate] = useState(defaultDate || '')
  const [startTime, setStartTime] = useState('07:00')
  const [endTime, setEndTime] = useState('15:00')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    if (!date) return setError('Date is required')
    setSaving(true)
    try {
      await addShift({ employer, date, startTime, endTime, notes })
      onBack()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
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

      <form onSubmit={handleSave} className="px-4 space-y-4">

        {/* Employer picker */}
        <div>
          <label className="text-white/35 text-[10px] uppercase tracking-widest block mb-2">Employer</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(EMPLOYER_NAMES).map(([key, name]) => (
              <button
                key={key}
                type="button"
                onClick={() => setEmployer(key)}
                className="py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={
                  employer === key
                    ? { backgroundColor: EMPLOYER_COLORS[key], color: '#0f0f0f' }
                    : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }
                }
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="text-white/35 text-[10px] uppercase tracking-widest block mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full bg-[#1a1a1a] rounded-xl px-4 py-3.5 text-white outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Start / End */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-white/35 text-[10px] uppercase tracking-widest block mb-2">Start</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-[#1a1a1a] rounded-xl px-4 py-3.5 text-white outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div>
            <label className="text-white/35 text-[10px] uppercase tracking-widest block mb-2">End</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-[#1a1a1a] rounded-xl px-4 py-3.5 text-white outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-white/35 text-[10px] uppercase tracking-widest block mb-2">Notes</label>
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
          className="w-full bg-white text-black font-bold rounded-xl py-4 transition-all active:scale-95 disabled:opacity-50"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {saving ? 'Saving…' : 'Save Shift'}
        </button>
      </form>
    </div>
  )
}
