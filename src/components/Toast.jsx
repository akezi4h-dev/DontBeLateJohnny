import { useEffect, useState } from 'react'

/**
 * Celebration toast that slides up from the bottom.
 *
 * Props:
 *   emoji   — large emoji shown on the left
 *   text    — bold message text
 *   onDone  — called after the toast fully exits (use to clear state)
 */
export default function Toast({ emoji, text, onDone }) {
  // 'enter' → invisible (first frame) | 'show' → visible | 'exit' → fading out
  const [phase, setPhase] = useState('enter')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 16)    // next paint → fade in
    const t2 = setTimeout(() => setPhase('exit'), 2800)  // auto-dismiss
    const t3 = setTimeout(onDone, 3200)                  // cleanup after exit anim
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  const visible = phase === 'show'

  return (
    <div
      className="fixed bottom-28 md:bottom-10 left-1/2 z-50 pointer-events-none"
      style={{
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        opacity: visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible ? '0px' : '14px'})`,
      }}
    >
      <div className="bg-[#1e1e1e] rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-3 whitespace-nowrap"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <span className="text-2xl">{emoji}</span>
        <span className="font-bold text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>
          {text}
        </span>
      </div>
    </div>
  )
}
