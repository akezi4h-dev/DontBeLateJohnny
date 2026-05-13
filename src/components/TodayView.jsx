import { useState, useEffect } from 'react'
import { useShifts } from '../hooks/useShifts'
import { useCategories } from '../hooks/useCategories'
import { useTasks } from '../hooks/useTasks.jsx'
import { formatTime, subtractMinutes } from '../utils/dateHelpers'
import { FACILITY_INFO } from '../utils/commuteCalc'

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Minutes from now until a given "HH:MM" time string (negative = already passed)
function minutesUntil(timeStr) {
  const now = new Date()
  const [h, m] = timeStr.split(':').map(Number)
  const target = new Date(now)
  target.setHours(h, m, 0, 0)
  return Math.round((target - now) / 60000)
}

function formatCountdown(mins) {
  if (mins <= 0) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function TaskRow({ task, onToggle, onRemove, color }) {
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
        className="flex-1 text-sm transition-all duration-200"
        style={
          task.completed
            ? { textDecoration: 'line-through', color: 'rgba(255,255,255,0.25)' }
            : { color: 'rgba(255,255,255,0.85)' }
        }
      >
        {task.text}
      </span>
      <button
        onClick={() => onRemove(task.id)}
        className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 flex-shrink-0 text-white/25 hover:text-white/60 transition-all text-lg leading-none pb-0.5"
      >
        ×
      </button>
    </div>
  )
}

function ShiftProgress({ startTime, endTime }) {
  const minsToStart = minutesUntil(startTime)
  const minsToEnd   = minutesUntil(endTime)

  // Not started yet or already ended — no bar
  if (minsToStart > 0 || minsToEnd <= 0) return null

  const [h1, m1] = startTime.split(':').map(Number)
  const [h2, m2] = endTime.split(':').map(Number)
  const totalMins   = (h2 * 60 + m2) - (h1 * 60 + m1)
  const elapsedMins = totalMins + minsToEnd  // minsToEnd is negative while in progress
  const pct = Math.min(100, Math.max(0, (elapsedMins / totalMins) * 100))

  return (
    <div className="mt-4">
      <div className="flex justify-between text-[10px] text-white/30 mb-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <span>In progress</span>
        <span>{formatCountdown(-minsToEnd)} left</span>
      </div>
      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: 'rgba(255,255,255,0.5)' }}
        />
      </div>
    </div>
  )
}

export default function TodayView() {
  const today = new Date()

  // Live clock — re-renders every 30 s so urgency updates without refresh
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const { getShiftsForDate } = useShifts()
  const { getCategoryByKey }  = useCategories()
  const { getTasksForShift, addTask, toggleTask, removeTask } = useTasks()

  const [taskInputs, setTaskInputs] = useState({}) // { shiftId → text }

  const dateStr = todayISO()
  const shifts  = getShiftsForDate(dateStr)

  const dayName     = today.toLocaleDateString('en-US', { weekday: 'long' })
  const dateDisplay = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  return (
    <div className="flex flex-col min-h-screen pb-24 md:pb-8 animate-slide-in">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-7 pb-4">
        <div
          className="text-white/35 text-[10px] uppercase tracking-[0.18em] mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {dayName}
        </div>
        <div
          className="text-3xl font-black tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {dateDisplay}
        </div>
      </div>

      {/* ── Day off ─────────────────────────────────────────────────────────── */}
      {shifts.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center pb-16">
          <div className="text-6xl mb-2">😴</div>
          <div
            className="text-2xl font-black"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Day off
          </div>
          <div className="text-white/35 text-sm leading-relaxed">
            No shifts today.{'\n'}Enjoy the break.
          </div>
        </div>
      )}

      {/* ── Shift blocks ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 px-4">
        {shifts.map((shift) => {
          const cat      = getCategoryByKey(shift.employer)
          const facility = FACILITY_INFO[shift.employer] ?? FACILITY_INFO.other
          const leaveAt  = subtractMinutes(shift.startTime, facility.driveMinutes)

          const minsToLeave = minutesUntil(leaveAt)
          const minsToStart = minutesUntil(shift.startTime)
          const minsToEnd   = minutesUntil(shift.endTime)

          const shiftEnded = minsToEnd <= 0

          // Urgency levels
          const isLeaveNow  = !shiftEnded && minsToStart > 0 && minsToLeave <= 0
          const isUrgent    = !shiftEnded && minsToStart > 0 && minsToLeave > 0 && minsToLeave <= 30
          const isInProgress = minsToStart <= 0 && !shiftEnded

          const urgencyColor = isLeaveNow ? '#EF4444'
            : isUrgent         ? '#F59E0B'
            : cat.color

          // Commute label
          const commuteLabel = shiftEnded
            ? 'Shift complete'
            : isLeaveNow
              ? 'Leave now!'
              : isInProgress
                ? 'In progress'
                : isUrgent
                  ? `Leave in ${formatCountdown(minsToLeave)}`
                  : `Leave by ${formatTime(leaveAt)}`

          const tasks     = getTasksForShift(shift.id)
          const taskInput = taskInputs[shift.id] ?? ''

          return (
            <div key={shift.id} className="flex flex-col gap-3">

              {/* ── Hero card ──────────────────────────────────────────────── */}
              <div
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: `${cat.color}18`,
                  borderLeft: `4px solid ${cat.color}`,
                }}
              >
                {/* Employer */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl leading-none">{cat.emoji}</span>
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: cat.color, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {cat.name}
                  </span>
                </div>

                {/* Big time */}
                <div
                  className="font-black leading-none tracking-tight mb-3"
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 'clamp(2.4rem, 10vw, 3.4rem)',
                    color: shiftEnded ? 'rgba(255,255,255,0.3)' : '#fff',
                  }}
                >
                  {formatTime(shift.startTime)}&thinsp;→&thinsp;{formatTime(shift.endTime)}
                </div>

                <div className="text-white/60 text-sm font-medium">{facility.name}</div>
                {facility.address && (
                  <div className="text-white/30 text-xs mt-0.5">{facility.address}</div>
                )}

                {/* Shift progress bar (only while in progress) */}
                <ShiftProgress startTime={shift.startTime} endTime={shift.endTime} />
              </div>

              {/* ── Commute alert ───────────────────────────────────────────── */}
              {!shiftEnded && (
                <div
                  className="rounded-2xl p-4 flex items-center justify-between gap-3 transition-colors"
                  style={{
                    backgroundColor: isLeaveNow
                      ? 'rgba(239,68,68,0.12)'
                      : isUrgent
                        ? 'rgba(245,158,11,0.1)'
                        : '#1a1a1a',
                  }}
                >
                  <div>
                    <div
                      className="text-[10px] uppercase tracking-widest mb-1"
                      style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Commute
                    </div>
                    <div
                      className="font-bold text-base"
                      style={{ color: urgencyColor, fontFamily: "'Syne', sans-serif" }}
                    >
                      {commuteLabel}
                    </div>
                    {!isInProgress && (
                      <div className="text-white/40 text-xs mt-0.5">
                        ~{facility.driveMinutes} min from home
                      </div>
                    )}
                  </div>

                  {/* Urgency icon */}
                  <div
                    className="text-3xl flex-shrink-0"
                    style={{
                      filter: (isLeaveNow || isUrgent)
                        ? 'drop-shadow(0 0 8px currentColor)'
                        : 'none',
                    }}
                  >
                    {isInProgress ? '⚡' : '🚗'}
                  </div>
                </div>
              )}

              {/* ── Tasks ───────────────────────────────────────────────────── */}
              <div className="bg-[#1a1a1a] rounded-2xl p-4">
                <div
                  className="text-[10px] uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Tasks
                </div>

                {tasks.length === 0 && (
                  <p className="text-white/20 text-sm pb-1">No tasks yet</p>
                )}

                {tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onRemove={removeTask}
                    color={cat.color}
                  />
                ))}

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (taskInput.trim()) {
                      addTask(shift.id, taskInput.trim())
                      setTaskInputs((p) => ({ ...p, [shift.id]: '' }))
                    }
                  }}
                  className="flex gap-2 mt-3"
                >
                  <input
                    type="text"
                    value={taskInput}
                    onChange={(e) =>
                      setTaskInputs((p) => ({ ...p, [shift.id]: e.target.value }))
                    }
                    placeholder="Add a task…"
                    className="flex-1 bg-white/5 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:bg-white/8 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!taskInput.trim()}
                    className="w-10 h-10 rounded-xl text-xl font-bold flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-25 active:scale-95"
                    style={{ backgroundColor: `${cat.color}28`, color: cat.color }}
                  >
                    +
                  </button>
                </form>
              </div>

            </div>
          )
        })}
      </div>

    </div>
  )
}
