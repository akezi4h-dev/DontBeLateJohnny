import { useState, useEffect } from 'react'
import { useShifts } from '../hooks/useShifts'
import { useCategories } from '../hooks/useCategories'
import { useTasks } from '../hooks/useTasks.jsx'
import { formatTime, subtractMinutes } from '../utils/dateHelpers'
import { FACILITY_INFO } from '../utils/commuteCalc'

function TaskRow({ task, onToggle, onRemove }) {
  const color = '#00A651'
  return (
    <div className="flex items-center gap-3 py-2.5 group border-b border-white/5 last:border-0">
      <button
        onClick={() => onToggle(task.id)}
        className="flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200"
        style={
          task.completed
            ? { backgroundColor: color, borderColor: color }
            : { borderColor: 'rgba(255,255,255,0.25)' }
        }
      >
        {task.completed && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </button>

      <span
        className="flex-1 text-sm transition-all duration-300"
        style={task.completed
          ? { textDecoration: 'line-through', color: 'rgba(255,255,255,0.25)' }
          : { color: 'rgba(255,255,255,0.85)' }
        }
      >
        {task.text}
      </span>

      <button
        onClick={() => onRemove(task.id)}
        className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 text-white/25 hover:text-white/60 transition-all text-lg leading-none pb-0.5"
      >
        ×
      </button>
    </div>
  )
}

export default function ShiftCard({ date, onBack }) {
  const { getShiftsForDate, updateShift, removeShift } = useShifts()
  const { getCategoryByKey } = useCategories()
  const shifts = getShiftsForDate(date)
  const [activeIdx, setActiveIdx] = useState(0)
  const [newTask, setNewTask] = useState('')

  // Hero edit mode
  const [editing, setEditing]     = useState(false)
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd]     = useState('')
  const [editDate, setEditDate]   = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving]       = useState(false)

  // Inline notes edit (bottom card)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue]     = useState('')

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]           = useState(false)

  const shift = shifts[activeIdx] ?? null
  const { getTasksForShift, addTask, toggleTask, removeTask } = useTasks()
  const tasks = shift ? getTasksForShift(shift.id) : []

  // Sync notes value when the shift changes (realtime updates)
  useEffect(() => {
    setNotesValue(shift?.notes ?? '')
    setEditingNotes(false)
  }, [shift?.id, shift?.notes])

  // ── Hero edit handlers ────────────────────────────────────────────────────
  const startEdit = () => {
    if (!shift) return
    setEditStart(shift.startTime)
    setEditEnd(shift.endTime)
    setEditDate(shift.date)
    setEditNotes(shift.notes ?? '')
    setEditing(true)
  }

  const cancelEdit = () => setEditing(false)

  const handleSave = async () => {
    if (!shift) return
    setSaving(true)
    try {
      await updateShift(shift.id, {
        employer:  shift.employer,
        date:      editDate,
        startTime: editStart,
        endTime:   editEnd,
        notes:     editNotes,
      })
      setEditing(false)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  // ── Inline notes save (on blur) ───────────────────────────────────────────
  const saveNotes = async () => {
    setEditingNotes(false)
    if (!shift || notesValue === (shift.notes ?? '')) return
    try {
      await updateShift(shift.id, {
        employer:  shift.employer,
        date:      shift.date,
        startTime: shift.startTime,
        endTime:   shift.endTime,
        notes:     notesValue,
      })
    } catch (e) { console.error(e) }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    try {
      await removeShift(shift.id)
      onBack()
    } catch (e) {
      console.error(e)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  // ── Derived display values ────────────────────────────────────────────────
  const category     = shift ? getCategoryByKey(shift.employer) : null
  const color        = category?.color ?? '#6B7280'
  const employerName = category?.name  ?? ''
  const emoji        = category?.emoji ?? ''

  const facility  = shift ? (FACILITY_INFO[shift.employer] ?? FACILITY_INFO.other) : null
  const leaveTime = shift ? subtractMinutes(shift.startTime, facility.driveMinutes) : null

  const handleAddTask = (e) => {
    e.preventDefault()
    if (newTask.trim() && shift) { addTask(shift.id, newTask.trim()); setNewTask('') }
  }

  const handleRemind = () => {
    if (!shift || !leaveTime) return
    if (window.OneSignal) {
      window.OneSignal.push(() => {
        window.OneSignal.sendSelfNotification(
          'Time to go 🚑',
          `Leave now for ${employerName} — ~${facility.driveMinutes} min drive`,
          `${window.location.origin}/DontBeLateJohnny/`,
        )
      })
    } else {
      alert(`Reminder set: Leave by ${formatTime(leaveTime)} for ${employerName}`)
    }
  }

  const dateObj     = new Date(`${date}T12:00:00`)
  const dayName     = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
  const dateDisplay = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  return (
    <div className="flex flex-col min-h-full bg-[#0f0f0f] pb-24 md:pb-8 animate-slide-in">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-6 pb-3">
        <button
          onClick={onBack}
          className="md:hidden w-9 h-9 -ml-1 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div>
          <div className="text-white/40 text-xs uppercase tracking-widest">{dayName}</div>
          <div className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>{dateDisplay}</div>
        </div>
      </div>

      {/* Empty day */}
      {shifts.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/25 px-8 text-center">
          <div className="text-5xl">😴</div>
          <div className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>Day off</div>
          <div className="text-sm">No shifts scheduled</div>
        </div>
      )}

      {/* Shift tabs (multiple shifts same day) */}
      {shifts.length > 1 && (
        <div className="flex gap-2 px-4 pb-3">
          {shifts.map((s, i) => {
            const cat = getCategoryByKey(s.employer)
            return (
              <button
                key={s.id}
                onClick={() => { setActiveIdx(i); setEditing(false); setConfirmDelete(false) }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5"
                style={
                  i === activeIdx
                    ? { backgroundColor: cat.color, color: '#0f0f0f' }
                    : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
                }
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Shift content */}
      {shift && (
        <div className="flex flex-col gap-3 px-4">

          {/* Hero card */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: `${color}18`, borderLeft: `4px solid ${color}` }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl leading-none">{emoji}</span>
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
                  {employerName}
                </div>
              </div>
              {!editing && (
                <button
                  onClick={startEdit}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-white/10 active:bg-white/20"
                  title="Edit shift"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-3 mt-1">
                <div>
                  <label className="text-white/35 text-[10px] uppercase tracking-widest block mb-1">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-white text-sm outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', colorScheme: 'dark' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-white/35 text-[10px] uppercase tracking-widest block mb-1">Start</label>
                    <input
                      type="time"
                      value={editStart}
                      onChange={(e) => setEditStart(e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-white text-sm outline-none"
                      style={{ backgroundColor: 'rgba(255,255,255,0.08)', colorScheme: 'dark' }}
                    />
                  </div>
                  <div>
                    <label className="text-white/35 text-[10px] uppercase tracking-widest block mb-1">End</label>
                    <input
                      type="time"
                      value={editEnd}
                      onChange={(e) => setEditEnd(e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-white text-sm outline-none"
                      style={{ backgroundColor: 'rgba(255,255,255,0.08)', colorScheme: 'dark' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white/35 text-[10px] uppercase tracking-widest block mb-1">Notes</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-xl px-3 py-2.5 text-white placeholder-white/20 text-sm outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={cancelEdit}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
                    style={{ backgroundColor: color, color: '#0f0f0f', fontFamily: "'Syne', sans-serif" }}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="font-black leading-none mb-3 tracking-tight"
                  style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', color: '#fff' }}
                >
                  {formatTime(shift.startTime)}&thinsp;→&thinsp;{formatTime(shift.endTime)}
                </div>
                <div className="text-white/60 text-sm font-medium">{facility.name}</div>
                {facility.address && (
                  <div className="text-white/35 text-xs mt-0.5">{facility.address}</div>
                )}
              </>
            )}
          </div>

          {/* Commute card */}
          <div className="bg-[#1a1a1a] rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-white/35 text-[10px] uppercase tracking-widest mb-1">Commute</div>
              <div className="text-white font-semibold text-sm">~{facility.driveMinutes} min from home</div>
              <div className="text-white/50 text-sm mt-0.5">
                Leave by <span className="text-white font-bold">{formatTime(leaveTime)}</span>
              </div>
            </div>
            <button
              onClick={handleRemind}
              className="flex-shrink-0 text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all"
              style={{ backgroundColor: `${color}28`, color, border: `1px solid ${color}44` }}
            >
              Remind me
            </button>
          </div>

          {/* Tasks */}
          <div className="bg-[#1a1a1a] rounded-2xl p-4">
            <div className="text-white/35 text-[10px] uppercase tracking-widest mb-3">Tasks</div>
            {tasks.length === 0 && <p className="text-white/20 text-sm py-1">No tasks yet</p>}
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} onRemove={removeTask} />
            ))}
            <form onSubmit={handleAddTask} className="flex gap-2 mt-3">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a task…"
                className="flex-1 bg-white/5 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:bg-white/8 transition-colors"
              />
              <button
                type="submit"
                disabled={!newTask.trim()}
                className="w-10 h-10 rounded-xl text-xl font-bold flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-25 active:scale-95"
                style={{ backgroundColor: `${color}28`, color }}
              >
                +
              </button>
            </form>
          </div>

          {/* Notes — always visible, tap to edit inline */}
          <div className="bg-[#1a1a1a] rounded-2xl p-4">
            <div className="text-white/35 text-[10px] uppercase tracking-widest mb-2">Notes</div>
            {editingNotes ? (
              <textarea
                autoFocus
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                onBlur={saveNotes}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveNotes() } }}
                rows={3}
                placeholder="Add a note…"
                className="w-full bg-white/5 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none resize-none transition-colors"
              />
            ) : (
              <button
                onClick={() => setEditingNotes(true)}
                className="w-full text-left transition-colors rounded-lg"
              >
                {notesValue
                  ? <span className="text-white/65 text-sm whitespace-pre-wrap">{notesValue}</span>
                  : <span className="text-white/20 text-sm">Tap to add a note…</span>
                }
              </button>
            )}
          </div>

          {/* Delete shift */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            onBlur={() => setConfirmDelete(false)}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              backgroundColor: confirmDelete ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
              color: confirmDelete ? '#EF4444' : 'rgba(255,255,255,0.25)',
              border: `1px solid ${confirmDelete ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            {deleting ? 'Deleting…' : confirmDelete ? 'Tap again to confirm' : 'Delete shift'}
          </button>

        </div>
      )}
    </div>
  )
}
