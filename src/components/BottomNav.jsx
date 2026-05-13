const TABS = [
  {
    id: 'month',
    label: 'Month',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    id: 'commute',
    label: 'Commute',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
]

export default function BottomNav({ activeTab, onTabChange, accentColor }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden border-t border-white/10 z-30"
      style={{
        backgroundColor: 'rgba(17,17,17,0.97)',
        backdropFilter: 'blur(12px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex">
        {TABS.map(({ id, label, icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex-1 flex flex-col items-center pt-2 pb-2 gap-1 transition-colors relative"
              style={{ color: active ? '#ffffff' : '#666666' }}
            >
              {/* Active dot indicator */}
              <span
                className="absolute top-1 w-1 h-1 rounded-full transition-all"
                style={{
                  backgroundColor: active ? accentColor : 'transparent',
                  opacity: active ? 1 : 0,
                }}
              />
              {/* Icon */}
              <span style={{ color: active ? '#ffffff' : '#444444' }}>{icon}</span>
              {/* Label */}
              <span
                className="text-[10px] font-medium uppercase tracking-[0.08em]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
