import { useState } from 'react'
import { getCalendarDays, toISODate, isToday, DAY_LABELS, MONTH_NAMES } from '../utils/dateHelpers'
import { useShifts, EMPLOYER_COLORS } from '../hooks/useShifts'

export default function MonthView({ onDaySelect, selectedDate }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const { getShiftsForDate } = useShifts()

  const cells = getCalendarDays(year, month)

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  const jumpToToday = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }

  return (
    <div className="flex flex-col h-full select-none">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <button
          onClick={prevMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          onClick={jumpToToday}
          className="text-xl font-bold tracking-tight hover:text-white/70 transition-colors"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {MONTH_NAMES[month]} {year}
        </button>

        <button
          onClick={nextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 px-3 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs text-white/30 font-medium py-1 tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 px-3 flex-1" style={{ gridAutoRows: 'minmax(56px, 1fr)' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />

          const dateStr = toISODate(year, month, day)
          const shifts = getShiftsForDate(dateStr)
          const todayBadge = isToday(year, month, day)
          const selected = selectedDate === dateStr

          return (
            <button
              key={dateStr}
              onClick={() => onDaySelect(dateStr)}
              className={`
                flex flex-col items-center pt-1 pb-1.5 mx-0.5 my-0.5 rounded-xl transition-all active:scale-95
                ${selected ? 'bg-white/15 ring-1 ring-white/30' : 'hover:bg-white/5'}
              `}
            >
              {/* Date number */}
              <span
                className={`
                  text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1 transition-colors
                  ${todayBadge ? 'bg-white text-black font-bold' : 'text-white/80'}
                `}
              >
                {day}
              </span>

              {/* Employer dots */}
              <div className="flex flex-wrap gap-0.5 justify-center max-w-[40px]">
                {shifts.map((shift) => (
                  <span
                    key={shift.id}
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: EMPLOYER_COLORS[shift.employer] }}
                  />
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 px-4 pb-4 pt-3 border-t border-white/5 flex-wrap">
        {Object.entries(EMPLOYER_COLORS).map(([key, color]) => (
          key !== 'other' && (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-white/40">
                {key === 'publix' ? 'Publix' : key === 'vanderbilt' ? 'Vanderbilt' : 'Nashville Gen'}
              </span>
            </div>
          )
        ))}
      </div>
    </div>
  )
}
