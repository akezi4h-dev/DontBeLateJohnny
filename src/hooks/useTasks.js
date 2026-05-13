import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useTasks(shiftId) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    if (!shiftId || !user) return

    supabase
      .from('tasks')
      .select('*')
      .eq('shift_id', shiftId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setTasks(data?.map(rowToTask) ?? [])
      })

    const channel = supabase
      .channel(`tasks:${shiftId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `shift_id=eq.${shiftId}`,
      }, ({ eventType, new: newRow, old: oldRow }) => {
        if (eventType === 'INSERT') setTasks((p) => [...p, rowToTask(newRow)])
        else if (eventType === 'UPDATE') setTasks((p) => p.map((t) => t.id === newRow.id ? rowToTask(newRow) : t))
        else if (eventType === 'DELETE') setTasks((p) => p.filter((t) => t.id !== oldRow.id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [shiftId, user?.id])

  const addTask = async (text) => {
    await supabase.from('tasks').insert({
      user_id: user.id,
      shift_id: shiftId,
      text,
      completed: false,
    })
  }

  const toggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    await supabase.from('tasks').update({ completed: !task.completed }).eq('id', id)
  }

  const removeTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id)
  }

  return { tasks, addTask, toggleTask, removeTask }
}

function rowToTask(row) {
  return { id: row.id, shiftId: row.shift_id, text: row.text, completed: row.completed }
}
