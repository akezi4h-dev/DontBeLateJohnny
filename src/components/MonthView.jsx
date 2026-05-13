import { useState } from 'react'
import { getCalendarDays, toISODate, isToday, DAY_LABELS, MONTH_NAMES } from '../utils/dateHelpers'
import { useShifts } from '../hooks/useShifts'
import { useCategories } from '../hooks/useCategories'

export default function MonthView({ onDaySelect, selectedDate, onAdd, onUpload, onSignOut }) {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  // Drag-to-reschedule state
  const [draggingShift, setDraggingShift] = useState(null)
  const [dragOverDate,  setDragOverDate]  = useState(null)

  const { getShiftsForDate, updateShift } = useShifts()
  const { getCategoryByKey } = useCategories()

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

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const handleDragStart = (e, shift) => {
    e.stopPropagation()
    setDraggingShift(shift)
    e.dataTransfer.effectAllowed = 'move'
    // Minimal ghost so the cursor stays clean
    const ghost = document.createElement('span')
    ghost.textContent = getCategoryByKey(shift.employer).emoji
    ghost.style.cssText = 'position:fixed;top:-99px;font-size:22px;'
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 14, 14)
    setTimeout(() => document.body.removeChild(ghost), 0)
  }

  const handleDragOver = (e, dateStr) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverDate !== dateStr) setDragOverDate(dateStr)
  }

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverDate(null)
    }
  }

  const handleDrop = async (e, dateStr) => {
    e.preventDefault()
    setDragOverDate(null)
    const shift = draggingShift
    setDraggingShift(null)

    if (!shift || dateStr === shift.date) return

    try {
      await updateShift(shift.id, {
        employer:  shift.employer,
        date:      dateStr,
        startTime: shift.startTime,
        endTime:   shift.endTime,
        notes:     shift.notes ?? '',
      })
    } catch (err) {
      console.error('Reschedule failed:', err)
    }
  }

  const handleDragEnd = () => {
    setDraggingShift(null)
    setDragOverDate(null)
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

        <div className="flex items-center gap-1">
          {/* Upload — desktop only */}
          {onUpload && (
            <button
              onClick={onUpload}
              className="hidden md:flex w-9 h-9 items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
              title="Upload schedule"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </button>
          )}
          {/* Add shift — desktop only */}
          {onAdd && (
            <button
              onClick={onAdd}
              className="hidden md:flex w-9 h-9 items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
              title="Add shift"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
          <button
            onClick={nextMonth}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
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
      <div
        className="grid grid-cols-7 px-3 flex-1"
        style={{ gridAutoRows: 'minmax(56px, 1fr)' }}
        onDragEnd={handleDragEnd}
      >
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />

          const dateStr    = toISODate(year, month, day)
          const shifts     = getShiftsForDate(dateStr)
          const todayBadge = isToday(year, month, day)
          const selected   = selectedDate === dateStr
          const isDragOver = dragOverDate === dateStr
          const isSource   = draggingShift !== null && shifts.some((s) => s.id === draggingShift.id)

          return (
            <button
              key={dateStr}
              onClick={() => { if (!draggingShift) onDaySelect(dateStr) }}
              onDragOver={(e) => handleDragOver(e, dateStr)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, dateStr)}
              className="flex flex-col items-center pt-1 pb-1.5 mx-0.5 my-0.5 rounded-xl transition-all active:scale-95"
              style={{
                backgroundColor: isDragOver
                  ? 'rgba(255,255,255,0.15)'
                  : selected
                    ? 'rgba(255,255,255,0.08)'
                    : 'transparent',
                boxShadow: isDragOver
                  ? '0 0 0 2px rgba(255,255,255,0.45)'
                  : selected
                    ? '0 0 0 1px rgba(255,255,255,0.2)'
                    : 'none',
                transform: isDragOver ? 'scale(1.06)' : undefined,
                opacity: isSource ? 0.45 : 1,
              }}
            >
              {/* Date number */}
              <span
                className={`
                  text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1 transition-colors
                  ${todayBadge ? 'bg-white text-black font-bold animate-pulse-ring' : 'text-white/80'}
                `}
              >
                {day}
              </span>

              {/* Emoji shift indicators — each individually draggable */}
              <div className="flex flex-wrap gap-px justify-center max-w-[44px]">
                {shifts.slice(0, 3).map((shift) => {
                  const cat       = getCategoryByKey(shift.employer)
                  const isDragged = draggingShift?.id === shift.id
                  return (
                    <span
                      key={shift.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, shift)}
                      className="text-[11px] leading-none cursor-grab active:cursor-grabbing"
                      style={{ opacity: isDragged ? 0.25 : 1, transition: 'opacity 0.15s' }}
                      title={`Drag to reschedule — ${cat.name}`}
                    >
                      {cat.emoji}
                    </span>
                  )
                })}
                {shifts.length > 3 && (
                  <span className="text-[9px] text-white/40 leading-none">
                    +{shifts.length - 3}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

    </div>
  )
}
