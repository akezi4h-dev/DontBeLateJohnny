import { createContext, useContext, useState } from 'react'

// ── Built-in categories ────────────────────────────────────────────────────────
export const BUILTIN_CATEGORIES = [
  { key: 'publix',            name: 'Publix',           color: '#00A651', emoji: '💊', builtin: true },
  { key: 'vanderbilt',        name: 'Vanderbilt',        color: '#CFB87C', emoji: '🏥', builtin: true },
  { key: 'nashville_general', name: 'Nashville General', color: '#2D6DB5', emoji: '🏨', builtin: true },
]

// Used when a shift's employer key isn't found in any category
export const FALLBACK_CATEGORY = { key: 'other', name: 'Other', color: '#6B7280', emoji: '📋', builtin: false }

// ── Preset color palettes ──────────────────────────────────────────────────────
export const PALETTE_PRESETS = {
  Neon:        ['#FF2D55', '#FF9F0A', '#30D158', '#64D2FF', '#BF5AF2', '#FFD60A'],
  Pastel:      ['#FF8FA3', '#FFB84C', '#A8E6CF', '#89CFF3', '#D4A8FF', '#FFD6A5'],
  'Dark Mode': ['#4A9EFF', '#FF6B9D', '#50E3C2', '#F5A623', '#8B5CF6', '#EF4444'],
  Retro:       ['#E63946', '#F1A208', '#2A9D8F', '#264653', '#E9C46A', '#F4A261'],
}

// ── Emoji options ──────────────────────────────────────────────────────────────
export const EMOJI_OPTIONS = [
  '💊','🏥','🏨','🧪','💉','🩺','🏢','🏦','🛒','📦',
  '🚒','✈️','🚌','🌿','⭐','🔬','🧬','💻','📋','🎯',
  '🌙','☀️','🌟','💼','🔑','🎓','🏋️','🌍','❤️','🦋',
]

// ── Storage keys ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'shiftstack_all_categories'

function loadCategories() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* fall through */ }
  return BUILTIN_CATEGORIES
}

// ── Context ────────────────────────────────────────────────────────────────────
const CategoriesContext = createContext(null)

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState(loadCategories)

  const persist = (next) => {
    setCategories(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  /** Returns the category for a key, or FALLBACK_CATEGORY if not found. */
  const getCategoryByKey = (key) =>
    categories.find((c) => c.key === key) ?? FALLBACK_CATEGORY

  /** Creates a new custom category and returns it. */
  const createCategory = ({ name, color, emoji }) => {
    const key = `custom_${Date.now()}`
    const cat = { key, name, color, emoji, builtin: false }
    persist([...categories, cat])
    return cat
  }

  /** Updates any field on any category (built-in or custom). */
  const updateCategory = (key, changes) =>
    persist(categories.map((c) => (c.key === key ? { ...c, ...changes } : c)))

  /** Deletes a custom category. Built-in categories cannot be deleted. */
  const deleteCategory = (key) => {
    const cat = categories.find((c) => c.key === key)
    if (!cat || cat.builtin) return
    persist(categories.filter((c) => c.key !== key))
  }

  return (
    <CategoriesContext.Provider
      value={{ categories, getCategoryByKey, createCategory, updateCategory, deleteCategory }}
    >
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  return useContext(CategoriesContext)
}
