const NAV = [
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
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: 'upload',
    label: 'Upload',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
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

export default function BottomNav({ onTabChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden border-t border-white/10"
      style={{ backgroundColor: 'rgba(15,15,15,0.96)', backdropFilter: 'blur(12px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex">
        {NAV.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex-1 flex flex-col items-center py-3 gap-1 transition-colors text-white/35 hover:text-white/70 active:text-white"
          >
            {icon}
            <span className="text-[10px] font-semibold tracking-wide">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
