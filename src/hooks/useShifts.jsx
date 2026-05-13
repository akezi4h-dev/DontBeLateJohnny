import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

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

function rowToShift(row) {
  return {
    id: row.id,
    employer: row.employer,
    date: row.date,
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    notes: row.notes || '',
  }
}

const ShiftsContext = createContext(null)

export function ShiftsProvider({ children }) {
  const { user } = useAuth()
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setShifts([])
      setLoading(false)
      return
    }

    setLoading(true)
    supabase
      .from('shifts')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setShifts(data.map(rowToShift))
        setLoading(false)
      })

    const channel = supabase
      .channel(`shifts:${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'shifts',
        filter: `user_id=eq.${user.id}`,
      }, ({ eventType, new: newRow, old: oldRow }) => {
        if (eventType === 'INSERT') setShifts((p) => [...p, rowToShift(newRow)])
        else if (eventType === 'DELETE') setShifts((p) => p.filter((s) => s.id !== oldRow.id))
        else if (eventType === 'UPDATE') setShifts((p) => p.map((s) => s.id === newRow.id ? rowToShift(newRow) : s))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  const addShift = async (data) => {
    const { data: row, error } = await supabase
      .from('shifts')
      .insert({
        user_id: user.id,
        employer: data.employer,
        date: data.date,
        start_time: data.startTime,
        end_time: data.endTime,
        notes: data.notes || '',
      })
      .select()
      .single()
    if (error) throw error
    return rowToShift(row)
  }

  const updateShift = async (id, data) => {
    const { data: row, error } = await supabase
      .from('shifts')
      .update({
        employer:   data.employer,
        date:       data.date,
        start_time: data.startTime,
        end_time:   data.endTime,
        notes:      data.notes ?? '',
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return rowToShift(row)
  }

  const removeShift = async (id) => {
    await supabase.from('shifts').delete().eq('id', id)
  }

  const getShiftsForDate = (date) => shifts.filter((s) => s.date === date)

  return (
    <ShiftsContext.Provider value={{ shifts, loading, addShift, updateShift, removeShift, getShiftsForDate }}>
      {children}
    </ShiftsContext.Provider>
  )
}

export function useShifts() {
  return useContext(ShiftsContext)
}
