import { useState } from 'react'
import { useShifts } from '../hooks/useShifts'
import { useCategories } from '../hooks/useCategories'

const GREETINGS = [
  'Hey Johnny 👋',
  "What's up Johnny",
  'Hello Johnny 🙂',
  'Yo Johnny 🤙',
  "How's it going Johnny",
  'Welcome back Johnny',
  "Good to see you Johnny",
  "What's good Johnny",
  'Sup Johnny 🫡',
  "Ready to go Johnny?",
]

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const TABS = [
  {
    id: 'month',
    label: 'Month',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'today',
    label: 'Today',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    id: 'commute',
    label: 'Commute',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: 'add',
    label: 'Add',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
]

export default function Sidebar({ activeTab, onTabChange, accentColor }) {
  const { categories } = useCategories()
  const builtins = categories.filter((c) => c.builtin)

  // Pick a greeting once per mount (changes on page refresh)
  const [greeting] = useState(
    () => GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
  )

  return (
    <aside
      className="fixed top-0 left-0 h-full hidden md:flex flex-col z-30"
      style={{
        width: '240px',
        backgroundColor: '#111111',
        borderRight: '1px solid #2a2a2a',
      }}
    >
      {/* App name */}
      <div className="px-5 pt-7 pb-5">
        <div
          className="text-xl font-black tracking-tight leading-snug"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {greeting}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #2a2a2a' }} />

      {/* Tabs */}
      <nav className="flex-1 px-3 pt-3 space-y-0.5">
        {TABS.map(({ id, label, icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
              style={{
                backgroundColor: active ? '#1e1e1e' : 'transparent',
                color: active ? '#ffffff' : '#666666',
                borderLeft: `2px solid ${active ? accentColor : 'transparent'}`,
              }}
            >
              <span style={{ color: active ? '#ffffff' : '#444444', flexShrink: 0 }}>
                {icon}
              </span>
              <span
                className="text-xs font-medium uppercase tracking-[0.1em]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Legend */}
      <div style={{ borderTop: '1px solid #2a2a2a' }}>
        <div className="px-5 py-4 space-y-2">
          <div
            className="text-[9px] uppercase tracking-[0.15em] mb-2"
            style={{ color: '#444444', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Employers
          </div>
          {builtins.map((cat) => (
            <div key={cat.key} className="flex items-center gap-2">
              <span className="text-sm leading-none">{cat.emoji}</span>
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-xs" style={{ color: '#666666' }}>
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
