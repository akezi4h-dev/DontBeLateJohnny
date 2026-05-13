import { useState } from 'react'
import MonthView from './components/MonthView'
import ShiftCard from './components/ShiftCard'
import BottomNav from './components/BottomNav'

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [activeTab, setActiveTab] = useState('month')

  const handleTabChange = (tab) => {
    if (tab === 'today') {
      setSelectedDate(todayISO())
      setActiveTab('month')
    } else {
      setActiveTab(tab)
      if (tab === 'month') setSelectedDate(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="md:flex md:h-screen">

        {/* Month panel — hidden on mobile when shift card open */}
        <div className={`md:w-1/2 md:overflow-y-auto md:border-r md:border-white/10 ${
          selectedDate ? 'hidden md:flex md:flex-col' : 'flex flex-col min-h-screen pb-20'
        }`}>
          <MonthView onDaySelect={setSelectedDate} selectedDate={selectedDate} />
        </div>

        {/* Shift card / desktop placeholder */}
        {selectedDate ? (
          <div className="md:w-1/2 md:overflow-y-auto flex flex-col min-h-screen md:min-h-0">
            <ShiftCard date={selectedDate} onBack={() => setSelectedDate(null)} />
          </div>
        ) : (
          <div className="hidden md:flex md:w-1/2 items-center justify-center text-white/20 flex-col gap-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span style={{ fontFamily: "'Syne', sans-serif" }} className="text-lg font-bold">Select a day</span>
          </div>
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}
