import { useState, useEffect } from 'react'

export function useTasks(shiftId) {
  const key = `tasks_${shiftId}`

  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(tasks))
  }, [tasks, key])

  const addTask = (text) => {
    setTasks((prev) => [...prev, { id: crypto.randomUUID(), shiftId, text, completed: false }])
  }

  const toggleTask = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const removeTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  return { tasks, addTask, toggleTask, removeTask }
}
