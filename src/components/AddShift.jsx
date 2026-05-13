import { useState } from 'react'
import { useShifts } from '../hooks/useShifts'
import { useCategories } from '../hooks/useCategories'
import CategoryEditor from './CategoryEditor'

export default function AddShift({ onBack, defaultDate, onSuccess, onNewCategory }) {
  const { addShift } = useShifts()
  const { categories, getCategoryByKey, createCategory, updateCategory } = useCategories()

  const [employer, setEmployer]   = useState(() => categories[0]?.key ?? 'publix')
  const [date, setDate]           = useState(defaultDate || '')
  const [startTime, setStartTime] = useState('07:00')
  const [endTime, setEndTime]     = useState('15:00')
  const [notes, setNotes]         = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  // CategoryEditor state
  const [editorMode, setEditorMode]   = useState(null)  // null | 'create' | { editKey }
  const selectedCat = getCategoryByKey(employer)

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

        <form onSubmit={handleSave} className="px-4 space-y-4">

          {/* Category picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/35 text-[10px] uppercase tracking-widest">Category</label>
              {/* Edit selected category */}
              <button
                type="button"
                onClick={() => setEditorMode({ editKey: employer })}
                className="text-[10px] uppercase tracking-widest text-white/25 hover:text-white/60 transition-colors flex items-center gap-1"
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

              {/* + New Category button */}
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
            className="w-full font-bold rounded-xl py-4 transition-all active:scale-95 disabled:opacity-50 text-black"
            style={{ backgroundColor: selectedCat.color, fontFamily: "'Syne', sans-serif" }}
          >
            {saving ? 'Saving…' : 'Save Shift'}
          </button>
        </form>
      </div>

      {/* Category Editor modal */}
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
