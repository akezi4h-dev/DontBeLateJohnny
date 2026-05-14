import { useState, useEffect } from 'react'
import { useShifts } from '../hooks/useShifts'
import { useCategories } from '../hooks/useCategories'
import { formatTime, subtractMinutes } from '../utils/dateHelpers'
import { FACILITY_INFO } from '../utils/commuteCalc'

// Build ISO date strings for the next N days starting today
function getUpcomingDates(days = 14) {
  const dates = []
  const today = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    dates.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    )
  }
  return dates
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Minutes from now until a given "HH:MM" time string
function minutesUntil(timeStr) {
  const now = new Date()
  const [h, m] = timeStr.split(':').map(Number)
  const target = new Date(now)
  target.setHours(h, m, 0, 0)
  return Math.round((target - now) / 60000)
}

function formatDayLabel(dateStr, isToday) {
  if (isToday) return 'Today'
  const d = new Date(`${dateStr}T12:00:00`)
  const diff = Math.round((d - new Date(new Date().toDateString())) / 86400000)
  if (diff === 1) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'long' })
}

function formatDateSub(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function CommuteView() {
  // Live clock so today's urgency updates without refresh
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const { getShiftsForDate } = useShifts()
  const { getCategoryByKey }  = useCategories()

  const today    = todayISO()
  const dates    = getUpcomingDates(14)

  // Collect only dates that have at least one shift
  const upcomingDays = dates
    .map((d) => ({ date: d, shifts: getShiftsForDate(d) }))
    .filter(({ shifts }) => shifts.length > 0)

  // Unique employers across all upcoming shifts — for the reference panel
  const upcomingEmployers = [
    ...new Set(upcomingDays.flatMap(({ shifts }) => shifts.map((s) => s.employer))),
  ]

  return (
    <div className="flex flex-col min-h-screen pb-24 md:pb-8 animate-slide-in">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-7 pb-5">
        <div
          className="text-white/35 text-[10px] uppercase tracking-[0.18em] mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Next 14 days
        </div>
        <div
          className="text-3xl font-black tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Commute
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {upcomingDays.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center pb-16">
          <div className="text-5xl mb-2">🛋️</div>
          <div
            className="text-2xl font-black"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Nothing coming up
          </div>
          <div className="text-white/35 text-sm">No shifts in the next 14 days.</div>
        </div>
      )}

      {/* ── Upcoming shift list ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 px-4">
        {upcomingDays.map(({ date, shifts }) => {
          const isToday  = date === today
          const dayLabel = formatDayLabel(date, isToday)
          const dateSub  = formatDateSub(date)

          return (
            <div key={date}>
              {/* Day label */}
              <div className="flex items-baseline gap-2 mb-2 px-1">
                <span
                  className="text-sm font-bold"
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    color: isToday ? '#ffffff' : 'rgba(255,255,255,0.55)',
                  }}
                >
                  {dayLabel}
                </span>
                <span
                  className="text-xs"
                  style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {dateSub}
                </span>
              </div>

              {/* Shift rows for this day */}
              <div className="flex flex-col gap-2">
                {shifts.map((shift) => {
                  const cat      = getCategoryByKey(shift.employer)
                  const facility = FACILITY_INFO[shift.employer] ?? FACILITY_INFO.other
                  const leaveAt  = subtractMinutes(shift.startTime, facility.driveMinutes)

                  // Urgency only applies to today's shifts
                  const minsToLeave = isToday ? minutesUntil(leaveAt)         : null
                  const minsToStart = isToday ? minutesUntil(shift.startTime) : null
                  const minsToEnd   = isToday ? minutesUntil(shift.endTime)   : null

                  const shiftEnded    = isToday && minsToEnd   !== null && minsToEnd   <= 0
                  const inProgress    = isToday && minsToStart !== null && minsToStart <= 0 && !shiftEnded
                  const isLeaveNow   = isToday && !inProgress && !shiftEnded && minsToLeave !== null && minsToLeave <= 0
                  const isUrgent     = isToday && !inProgress && !shiftEnded && minsToLeave !== null && minsToLeave > 0 && minsToLeave <= 30

                  const urgencyColor = isLeaveNow ? '#EF4444'
                    : isUrgent       ? '#F59E0B'
                    : cat.color

                  // What to show in the leave slot
                  const leaveLabel = shiftEnded  ? 'Done'
                    : inProgress                 ? 'In progress'
                    : isLeaveNow                 ? 'Leave now!'
                    : isUrgent                   ? `Leave in ${minsToLeave}m`
                    : `Leave by ${formatTime(leaveAt)}`

                  return (
                    <div
                      key={shift.id}
                      className="rounded-2xl p-4 flex items-center gap-4"
                      style={{
                        backgroundColor: isLeaveNow
                          ? 'rgba(239,68,68,0.1)'
                          : isUrgent
                            ? 'rgba(245,158,11,0.08)'
                            : shiftEnded
                              ? 'rgba(255,255,255,0.03)'
                              : '#1a1a1a',
                        borderLeft: `3px solid ${shiftEnded ? 'rgba(255,255,255,0.08)' : cat.color}`,
                        opacity: shiftEnded ? 0.5 : 1,
                      }}
                    >
                      {/* Employer emoji */}
                      <span className="text-2xl leading-none flex-shrink-0">{cat.emoji}</span>

                      {/* Centre — times + facility */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-black leading-none tracking-tight mb-1"
                          style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: 'clamp(1.35rem, 5vw, 1.65rem)',
                            color: shiftEnded ? 'rgba(255,255,255,0.3)' : '#fff',
                          }}
                        >
                          {formatTime(shift.startTime)}&thinsp;→&thinsp;{formatTime(shift.endTime)}
                        </div>
                        <div
                          className="text-xs truncate"
                          style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {facility.name}
                        </div>
                      </div>

                      {/* Right — leave time */}
                      <div className="flex-shrink-0 text-right">
                        <div
                          className="text-sm font-bold leading-tight"
                          style={{ color: urgencyColor, fontFamily: "'Syne', sans-serif" }}
                        >
                          {leaveLabel}
                        </div>
                        {!shiftEnded && !inProgress && (
                          <div
                            className="text-[10px] mt-0.5"
                            style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Space Grotesk', sans-serif" }}
                          >
                            ~{facility.driveMinutes} min
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Drive time reference ────────────────────────────────────────────── */}
      {upcomingEmployers.length > 0 && (
        <div className="px-4 mt-6 mb-2">
          <div
            className="text-[10px] uppercase tracking-[0.18em] mb-3 px-1"
            style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Drive times from home
          </div>
          <div className="flex flex-col gap-2">
            {upcomingEmployers.map((key) => {
              const cat      = getCategoryByKey(key)
              const facility = FACILITY_INFO[key] ?? FACILITY_INFO.other
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  <span className="text-lg leading-none">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white/80 truncate">{cat.name}</div>
                    {facility.address && (
                      <div
                        className="text-xs truncate mt-0.5"
                        style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {facility.address}
                      </div>
                    )}
                  </div>
                  <div
                    className="text-sm font-bold flex-shrink-0"
                    style={{ color: cat.color, fontFamily: "'Syne', sans-serif" }}
                  >
                    ~{facility.driveMinutes} min
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
