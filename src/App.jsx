import { useState, useCallback } from 'react'
import { useAuth } from './hooks/useAuth'
import { ShiftsProvider } from './hooks/useShifts'
import { CategoriesProvider } from './hooks/useCategories'
import { useShifts } from './hooks/useShifts'
import { useCategories } from './hooks/useCategories'
import MonthView from './components/MonthView'
import ShiftCard from './components/ShiftCard'
import AddShift from './components/AddShift'
import OCRUpload from './components/OCRUpload'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import Confetti from './components/Confetti'

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function MainApp() {
  const { signOut } = useAuth()
  const { getShiftsForDate } = useShifts()
  const { getCategoryByKey } = useCategories()

  const [selectedDate, setSelectedDate] = useState(null)
  const [screen, setScreen] = useState('month') // month | add | upload | today | commute

  // Celebration state
  const [toast, setToast]       = useState(null)
  const [confetti, setConfetti] = useState(false)

  const celebrate = useCallback(({ emoji, text, withConfetti = false }) => {
    setToast({ emoji, text })
    if (withConfetti) setConfetti(true)
  }, [])

  // Accent color = today's first shift employer color, or gold default
  const todayShifts  = getShiftsForDate(todayISO())
  const accentColor  = todayShifts.length > 0
    ? getCategoryByKey(todayShifts[0].employer).color
    : '#CFB87C'

  const handleTabChange = (tab) => {
    setSelectedDate(null)
    setScreen(tab)
  }

  return (
    <div
      className="min-h-screen bg-[#0f0f0f] text-white"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
      <Sidebar activeTab={screen} onTabChange={handleTabChange} accentColor={accentColor} />

      {/* ── Main content — pushed right of sidebar on desktop ────────────── */}
      <div className="md:pl-[240px] min-h-screen flex flex-col">

        {/* ADD SHIFT */}
        {screen === 'add' && (
          <AddShift
            onBack={() => setScreen('month')}
            onSuccess={() => celebrate({ emoji: '✅', text: 'Shift saved!' })}
            onNewCategory={() => celebrate({ emoji: '🎨', text: 'Category created!', withConfetti: true })}
          />
        )}

        {/* UPLOAD */}
        {screen === 'upload' && (
          <OCRUpload
            onBack={() => setScreen('month')}
            onSuccess={(count) => celebrate({ emoji: '🎉', text: `${count} shift${count !== 1 ? 's' : ''} added!` })}
            onNewCategory={() => celebrate({ emoji: '🎨', text: 'Category created!', withConfetti: true })}
          />
        )}

        {/* TODAY — placeholder */}
        {screen === 'today' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8 pb-24 md:pb-0">
            <div className="text-5xl">⚡</div>
            <div
              className="text-2xl font-black"
              style={{ fontFamily: "'Syne', sans-serif", color: 'rgba(255,255,255,0.2)' }}
            >
              Today view coming soon
            </div>
          </div>
        )}

        {/* COMMUTE — placeholder */}
        {screen === 'commute' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8 pb-24 md:pb-0">
            <div className="text-5xl">🚗</div>
            <div
              className="text-2xl font-black"
              style={{ fontFamily: "'Syne', sans-serif", color: 'rgba(255,255,255,0.2)' }}
            >
              Commute view coming soon
            </div>
          </div>
        )}

        {/* MONTH — existing two-panel calendar layout, untouched */}
        {screen === 'month' && (
          <div className="md:flex md:h-screen flex-1">

            {/* Calendar panel */}
            <div
              className={`md:w-1/2 md:overflow-y-auto md:border-r md:border-white/10 ${
                selectedDate
                  ? 'hidden md:flex md:flex-col'
                  : 'flex flex-col min-h-screen pb-20 md:pb-0'
              }`}
            >
              <MonthView
                onDaySelect={setSelectedDate}
                selectedDate={selectedDate}
                onAdd={() => setScreen('add')}
                onUpload={() => setScreen('upload')}
                onSignOut={signOut}
              />
            </div>

            {/* Shift card / empty state */}
            {selectedDate ? (
              <div className="md:w-1/2 md:overflow-y-auto flex flex-col min-h-screen md:min-h-0">
                <ShiftCard
                  key={selectedDate}
                  date={selectedDate}
                  onBack={() => setSelectedDate(null)}
                />
              </div>
            ) : (
              <div className="hidden md:flex md:w-1/2 items-center justify-center text-white/20 flex-col gap-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span style={{ fontFamily: "'Syne', sans-serif" }} className="text-lg font-bold">
                  Select a day
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────────────────── */}
      <BottomNav activeTab={screen} onTabChange={handleTabChange} accentColor={accentColor} />

      {/* ── Celebration overlays ──────────────────────────────────────────── */}
      {toast && (
        <Toast emoji={toast.emoji} text={toast.text} onDone={() => setToast(null)} />
      )}
      {confetti && <Confetti onDone={() => setConfetti(false)} />}
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-white/25 text-sm">Loading…</div>
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <CategoriesProvider>
      <ShiftsProvider>
        <MainApp />
      </ShiftsProvider>
    </CategoriesProvider>
  )
}
