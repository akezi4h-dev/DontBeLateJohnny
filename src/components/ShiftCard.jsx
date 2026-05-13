import { useState } from 'react'
import { useShifts, EMPLOYER_COLORS, EMPLOYER_NAMES } from '../hooks/useShifts'
import { useTasks } from '../hooks/useTasks'
import { formatTime, subtractMinutes } from '../utils/dateHelpers'
import { FACILITY_INFO } from '../utils/commuteCalc'

function TaskRow({ task, onToggle, onRemove }) {
  const color = '#00A651' // checkmark always green — neutral, not shift-dependent
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
        style={task.completed ? { textDecoration: 'line-through', color: 'rgba(255,255,255,0.25)' } : { color: 'rgba(255,255,255,0.85)' }}
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
  const { getShiftsForDate } = useShifts()
  const shifts = getShiftsForDate(date)
  const [activeIdx, setActiveIdx] = useState(0)
  const [newTask, setNewTask] = useState('')

  const shift = shifts[activeIdx] ?? null
  const { tasks, addTask, toggleTask, removeTask } = useTasks(shift?.id ?? null)

  const facility = shift ? (FACILITY_INFO[shift.employer] ?? FACILITY_INFO.other) : null
  const color = shift ? EMPLOYER_COLORS[shift.employer] : '#6B7280'
  const employerName = shift ? EMPLOYER_NAMES[shift.employer] : ''

  const leaveTime = shift
    ? subtractMinutes(shift.startTime, facility.driveMinutes)
    : null

  const handleAddTask = (e) => {
    e.preventDefault()
    if (newTask.trim()) {
      addTask(newTask.trim())
      setNewTask('')
    }
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

  // Parse display date
  const dateObj = new Date(`${date}T12:00:00`)
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
  const dateDisplay = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  return (
    <div className="flex flex-col min-h-full bg-[#0f0f0f] pb-24 md:pb-8">

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
          {shifts.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveIdx(i)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={
                i === activeIdx
                  ? { backgroundColor: EMPLOYER_COLORS[s.employer], color: '#0f0f0f' }
                  : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
              }
            >
              {EMPLOYER_NAMES[s.employer]}
            </button>
          ))}
        </div>
      )}

      {/* Shift content */}
      {shift && (
        <div className="flex flex-col gap-3 px-4">

          {/* Hero card: employer + time */}
          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: `${color}18`,
              borderLeft: `4px solid ${color}`,
            }}
          >
            <div
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color }}
            >
              {employerName}
            </div>
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
          </div>

          {/* Commute card */}
          <div className="bg-[#1a1a1a] rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-white/35 text-[10px] uppercase tracking-widest mb-1">Commute</div>
              <div className="text-white font-semibold text-sm">~{facility.driveMinutes} min from home</div>
              <div className="text-white/50 text-sm mt-0.5">
                Leave by{' '}
                <span className="text-white font-bold">{formatTime(leaveTime)}</span>
              </div>
            </div>
            <button
              onClick={handleRemind}
              className="flex-shrink-0 text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all"
              style={{
                backgroundColor: `${color}28`,
                color,
                border: `1px solid ${color}44`,
              }}
            >
              Remind me
            </button>
          </div>

          {/* Tasks */}
          <div className="bg-[#1a1a1a] rounded-2xl p-4">
            <div className="text-white/35 text-[10px] uppercase tracking-widest mb-3">Tasks</div>

            {tasks.length === 0 && (
              <p className="text-white/20 text-sm py-1">No tasks yet</p>
            )}

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

          {/* Notes (if present) */}
          {shift.notes && (
            <div className="bg-[#1a1a1a] rounded-2xl p-4">
              <div className="text-white/35 text-[10px] uppercase tracking-widest mb-2">Notes</div>
              <div className="text-white/65 text-sm">{shift.notes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
