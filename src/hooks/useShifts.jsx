import { createContext, useContext, useState, useEffect } from 'react'

export const EMPLOYER_COLORS = {
  publix: '#00A651',
  vanderbilt: '#CFB87C',
  nashville_general: '#2D6DB5',
  other: '#6B7280',
}

export const EMPLOYER_NAMES = {
  publix: 'Publix',
  vanderbilt: 'Vanderbilt',
  nashville_general: 'Nashville General',
  other: 'Other',
}

// Seed data so the app looks real for first contact on May 13
const SEED_SHIFTS = [
  { id: '1', employer: 'publix',            date: '2026-05-13', startTime: '07:00', endTime: '15:00', notes: '' },
  { id: '2', employer: 'vanderbilt',        date: '2026-05-14', startTime: '19:00', endTime: '07:00', notes: '' },
  { id: '3', employer: 'nashville_general', date: '2026-05-15', startTime: '07:00', endTime: '19:00', notes: '' },
  { id: '4', employer: 'publix',            date: '2026-05-16', startTime: '15:00', endTime: '23:00', notes: '' },
  { id: '5', employer: 'vanderbilt',        date: '2026-05-18', startTime: '07:00', endTime: '19:00', notes: '' },
  { id: '6', employer: 'nashville_general', date: '2026-05-20', startTime: '19:00', endTime: '07:00', notes: '' },
  { id: '7', employer: 'publix',            date: '2026-05-21', startTime: '07:00', endTime: '15:00', notes: '' },
  { id: '8', employer: 'vanderbilt',        date: '2026-05-22', startTime: '07:00', endTime: '19:00', notes: '' },
  { id: '9', employer: 'nashville_general', date: '2026-05-25', startTime: '19:00', endTime: '07:00', notes: '' },
  { id: '10', employer: 'publix',           date: '2026-05-27', startTime: '07:00', endTime: '15:00', notes: '' },
  { id: '11', employer: 'vanderbilt',       date: '2026-05-28', startTime: '07:00', endTime: '19:00', notes: '' },
  { id: '12', employer: 'publix',           date: '2026-05-13', startTime: '19:00', endTime: '23:00', notes: 'Evening overlap' },
]

const ShiftsContext = createContext(null)

export function ShiftsProvider({ children }) {
  const [shifts, setShifts] = useState(() => {
    try {
      const stored = localStorage.getItem('shifts')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return SEED_SHIFTS
  })

  useEffect(() => {
    localStorage.setItem('shifts', JSON.stringify(shifts))
  }, [shifts])

  const addShift = (data) => {
    const shift = { ...data, id: crypto.randomUUID() }
    setShifts((prev) => [...prev, shift])
    return shift
  }

  const removeShift = (id) => {
    setShifts((prev) => prev.filter((s) => s.id !== id))
  }

  const getShiftsForDate = (date) => shifts.filter((s) => s.date === date)

  return (
    <ShiftsContext.Provider value={{ shifts, addShift, removeShift, getShiftsForDate }}>
      {children}
    </ShiftsContext.Provider>
  )
}

export function useShifts() {
  return useContext(ShiftsContext)
}
