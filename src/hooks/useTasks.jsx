import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

function rowToTask(row) {
  return { id: row.id, shiftId: row.shift_id, text: row.text, completed: row.completed }
}

const TasksContext = createContext(null)

// ── Provider ───────────────────────────────────────────────────────────────
// Loads ALL tasks for the current user in one query so any component
// (calendar grid, shift card) can ask about any date/shift without extra fetches.

export function TasksProvider({ children }) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    if (!user) { setTasks([]); return }

    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => setTasks(data?.map(rowToTask) ?? []))

    const channel = supabase
      .channel(`tasks:user:${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`,
      }, ({ eventType, new: newRow, old: oldRow }) => {
        if (eventType === 'INSERT')
          setTasks((p) => [...p, rowToTask(newRow)])
        else if (eventType === 'UPDATE')
          setTasks((p) => p.map((t) => t.id === newRow.id ? rowToTask(newRow) : t))
        else if (eventType === 'DELETE')
          setTasks((p) => p.filter((t) => t.id !== oldRow.id))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user?.id])

  // ── Selectors ────────────────────────────────────────────────────────────

  const getTasksForShift = useCallback(
    (shiftId) => tasks.filter((t) => t.shiftId === shiftId),
    [tasks]
  )

  // Returns true if the shift has at least one task (open OR done)
  const hasTasksForShift = useCallback(
    (shiftId) => tasks.some((t) => t.shiftId === shiftId),
    [tasks]
  )

  // Returns true if every task for a shift is completed
  const allDoneForShift = useCallback(
    (shiftId) => {
      const ts = tasks.filter((t) => t.shiftId === shiftId)
      return ts.length > 0 && ts.every((t) => t.completed)
    },
    [tasks]
  )

  // ── Mutations ────────────────────────────────────────────────────────────

  const addTask = useCallback(async (shiftId, text) => {
    await supabase.from('tasks').insert({
      user_id: user.id,
      shift_id: shiftId,
      text,
      completed: false,
    })
  }, [user?.id])

  const toggleTask = useCallback(async (id) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    await supabase.from('tasks').update({ completed: !task.completed }).eq('id', id)
  }, [tasks])

  const removeTask = useCallback(async (id) => {
    await supabase.from('tasks').delete().eq('id', id)
  }, [])

  return (
    <TasksContext.Provider value={{
      getTasksForShift,
      hasTasksForShift,
      allDoneForShift,
      addTask,
      toggleTask,
      removeTask,
    }}>
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  return useContext(TasksContext)
}
