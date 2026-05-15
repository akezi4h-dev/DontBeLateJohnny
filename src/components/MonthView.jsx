import { useState, useRef } from 'react'
import { getCalendarDays, toISODate, isToday, DAY_LABELS, MONTH_NAMES } from '../utils/dateHelpers'
import { useShifts } from '../hooks/useShifts'
import { useCategories } from '../hooks/useCategories'
import { useTasks } from '../hooks/useTasks.jsx'

const DRAG_THRESHOLD = 8 // px of movement before drag begins

const GREETINGS = [
  'Hey Johnny',
  "What's up Johnny",
  'Hello Johnny',
  'Yo Johnny',
  "How's it going Johnny",
  'Welcome back Johnny',
  'Good to see you Johnny',
  "What's good Johnny",
  'Sup Johnny',
  'Ready to go Johnny',
]

const PHRASES = [
  "you're doing a lot. that counts.",
  "one shift at a time.",
  "built for the ones who show up.",
  "three hospitals. zero excuses.",
  "rest is part of the job too.",
  "another month, still standing.",
  "johnny, you got this.",
  "every shift is a choice to show up.",
  "the schedule says a lot about you.",
  "not many people do what you do.",
  "you make it look easy.",
  "hard weeks don't last forever.",
  "real estate can wait. you're saving lives.",
  "showing up is half the battle.",
  "this is what commitment looks like.",
]

function randIdx(arr) { return Math.floor(Math.random() * arr.length) }

export default function MonthView({ onDaySelect, selectedDate, onAdd, onUpload, onSignOut }) {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const [greeting]  = useState(() => GREETINGS[randIdx(GREETINGS)])
  const [phraseIdx, setPhraseIdx] = useState(() => randIdx(PHRASES))
  const rotatePhrease = () => setPhraseIdx(randIdx(PHRASES))

  // ── Drag state ─────────────────────────────────────────────────────────────
  // Refs hold mutable drag internals without triggering re-renders
  const draggingRef   = useRef(null)  // { shift, pointerId, startX, startY, moved }
  const dragDateRef   = useRef(null)  // ISO date string currently hovered
  const justDraggedRef = useRef(false) // suppress click after a drag completes

  // State drives visual feedback
  const [draggingShift, setDraggingShift] = useState(null)
  const [dragOverDate,  setDragOverDate]  = useState(null)
  const [dragPos,       setDragPos]       = useState({ x: 0, y: 0 })

  const { getShiftsForDate, updateShift } = useShifts()
  const { getCategoryByKey } = useCategories()
  const { hasTasksForShift, allDoneForShift } = useTasks()

  const cells = getCalendarDays(year, month)

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
    rotatePhrease()
  }
  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
    rotatePhrease()
  }
  const jumpToToday = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }

  // ── Pointer handlers (work on mouse + touch + stylus) ─────────────────────

  const handlePointerDown = (e, shift) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId) // keep events flowing to this element
    draggingRef.current = {
      shift,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    }
    setDragPos({ x: e.clientX, y: e.clientY })
  }

  const handlePointerMove = (e) => {
    const drag = draggingRef.current
    if (!drag || e.pointerId !== drag.pointerId) return

    const dist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY)

    // Dead-zone: don't start drag until finger moves enough
    if (!drag.moved) {
      if (dist < DRAG_THRESHOLD) return
      drag.moved = true
      setDraggingShift(drag.shift) // show floating clone + dim source
    }

    setDragPos({ x: e.clientX, y: e.clientY })

    // Find day cell under the pointer. The floating clone has pointer-events:none
    // so elementsFromPoint sees through it to the calendar cells behind.
    const els = document.elementsFromPoint(e.clientX, e.clientY)
    const cell = els.find((el) => el.dataset?.date)
    const date = cell?.dataset.date ?? null

    if (date !== dragDateRef.current) {
      dragDateRef.current = date
      setDragOverDate(date)
    }
  }

  const handlePointerUp = async (e) => {
    const drag = draggingRef.current
    if (!drag || e.pointerId !== drag.pointerId) return

    const targetDate = dragDateRef.current
    const didMove    = drag.moved

    // Clear everything synchronously so UI snaps back
    draggingRef.current  = null
    dragDateRef.current  = null
    setDraggingShift(null)
    setDragOverDate(null)

    if (!didMove) return // pure tap → let the click on the day button fire normally

    // Briefly suppress the day button's onClick so it doesn't also open the panel
    justDraggedRef.current = true
    setTimeout(() => { justDraggedRef.current = false }, 200)

    if (targetDate && targetDate !== drag.shift.date) {
      try {
        await updateShift(drag.shift.id, {
          employer:  drag.shift.employer,
          date:      targetDate,
          startTime: drag.shift.startTime,
          endTime:   drag.shift.endTime,
          notes:     drag.shift.notes ?? '',
        })
      } catch (err) {
        console.error('Reschedule failed:', err)
      }
    }
  }

  const handlePointerCancel = (e) => {
    const drag = draggingRef.current
    if (!drag || e.pointerId !== drag.pointerId) return
    draggingRef.current = null
    dragDateRef.current = null
    setDraggingShift(null)
    setDragOverDate(null)
  }

  return (
    <div className="flex flex-col h-full select-none">

      {/* ── Floating emoji clone (follows finger/cursor) ─────────────────── */}
      {draggingShift && (
        <div
          style={{
            position:      'fixed',
            left:          dragPos.x,
            top:           dragPos.y,
            transform:     'translate(-50%, -70%) scale(2.2)',
            pointerEvents: 'none',
            zIndex:        9999,
            fontSize:      '20px',
            lineHeight:    1,
            filter:        'drop-shadow(0 6px 14px rgba(0,0,0,0.65))',
            willChange:    'left, top',
          }}
        >
          {getCategoryByKey(draggingShift.employer).emoji}
        </div>
      )}

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

        <div className="text-center">
          {/* Line 1 — greeting */}
          <div
            className="text-xl font-black tracking-tight leading-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {greeting}
          </div>
          {/* Line 2 — month / year (tap to jump to today) */}
          <button
            onClick={jumpToToday}
            className="text-sm font-semibold leading-snug transition-colors hover:text-white/60"
            style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {MONTH_NAMES[month]} {year}
          </button>
          {/* Line 3 — rotating phrase */}
          <div
            key={phraseIdx}
            className="animate-fade-in-up"
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.25)',
              fontFamily: "'Space Grotesk', sans-serif",
              marginTop: '1px',
              letterSpacing: '0.02em',
            }}
          >
            {PHRASES[phraseIdx]}
          </div>
        </div>

        <div className="flex items-center gap-1">
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
      <div className="grid grid-cols-7 px-3 flex-1" style={{ gridAutoRows: 'minmax(56px, 1fr)' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />

          const dateStr    = toISODate(year, month, day)
          const shifts     = getShiftsForDate(dateStr)
          const todayBadge = isToday(year, month, day)
          const selected   = selectedDate === dateStr
          const isDragOver = dragOverDate === dateStr
          const isSource   = draggingShift !== null && shifts.some((s) => s.id === draggingShift.id)
          const hasTasks   = shifts.some((s) => hasTasksForShift(s.id))
          const allDone    = hasTasks && shifts.every((s) => !hasTasksForShift(s.id) || allDoneForShift(s.id))

          return (
            <button
              key={dateStr}
              data-date={dateStr}
              onClick={() => { if (!justDraggedRef.current) onDaySelect(dateStr) }}
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
                opacity:   isSource   ? 0.35 : 1,
                transition: 'background-color 0.1s, box-shadow 0.1s, transform 0.1s, opacity 0.15s',
              }}
            >
              {/* Date number */}
              <span
                className={`
                  text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1
                  ${todayBadge ? 'bg-white text-black font-bold animate-pulse-ring' : 'text-white/80'}
                `}
              >
                {day}
              </span>

              {/* Shift emoji indicators — each draggable */}
              <div className="flex flex-wrap gap-px justify-center max-w-[44px]">
                {shifts.slice(0, 3).map((shift) => {
                  const cat       = getCategoryByKey(shift.employer)
                  const isDragged = draggingShift?.id === shift.id
                  return (
                    <span
                      key={shift.id}
                      onPointerDown={(e) => handlePointerDown(e, shift)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerCancel}
                      className="text-[11px] leading-none cursor-grab active:cursor-grabbing"
                      style={{
                        opacity:     isDragged ? 0.2 : 1,
                        touchAction: 'none',   // prevent browser scroll-hijack on mobile
                        userSelect:  'none',
                        transition:  'opacity 0.15s',
                      }}
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

              {/* Task indicator — dot when tasks exist, green check when all done */}
              {hasTasks && (
                <span
                  className="text-[8px] leading-none mt-px"
                  style={{ color: allDone ? 'rgba(74,222,128,0.7)' : 'rgba(255,255,255,0.28)' }}
                >
                  {allDone ? '✓' : '·'}
                </span>
              )}
            </button>
          )
        })}
      </div>

    </div>
  )
}
