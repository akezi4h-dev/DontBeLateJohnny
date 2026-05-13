import { useState } from 'react'
import { PALETTE_PRESETS, EMOJI_OPTIONS } from '../hooks/useCategories'

/**
 * Full-screen bottom-sheet modal for creating or editing a category.
 *
 * Props:
 *   initial  — { name, color, emoji } pre-filled values (optional)
 *   title    — header title string (default "New Category")
 *   onSave   — called with { name, color, emoji } on confirm
 *   onClose  — called when the user cancels
 */
export default function CategoryEditor({ initial = {}, title = 'New Category', onSave, onClose }) {
  const [name, setName]               = useState(initial.name  ?? '')
  const [color, setColor]             = useState(initial.color ?? PALETTE_PRESETS.Neon[0])
  const [emoji, setEmoji]             = useState(initial.emoji ?? '💊')
  const [activePalette, setActivePalette] = useState('Neon')

  const canSave = name.trim().length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full md:max-w-sm bg-[#141414] rounded-t-3xl md:rounded-3xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Drag handle (mobile) */}
        <div className="w-10 h-1 bg-white/15 rounded-full mx-auto -mt-1 mb-0 md:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-black text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white transition-colors text-xl leading-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            ×
          </button>
        </div>

        {/* Live preview card */}
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ backgroundColor: `${color}18`, borderLeft: `4px solid ${color}` }}
        >
          <span className="text-3xl">{emoji}</span>
          <div>
            <div
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color }}
            >
              {name.trim() || 'Category Name'}
            </div>
            <div
              className="font-black text-xl leading-none mt-0.5"
              style={{ fontFamily: "'Syne', sans-serif", color: '#fff' }}
            >
              9am&thinsp;→&thinsp;5pm
            </div>
          </div>
        </div>

        {/* Name input */}
        <div>
          <label className="text-white/35 text-[10px] uppercase tracking-widest block mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Nashville Gen"
            maxLength={30}
            className="w-full bg-[#1e1e1e] rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none text-sm"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            autoFocus
          />
        </div>

        {/* Emoji picker */}
        <div>
          <label className="text-white/35 text-[10px] uppercase tracking-widest block mb-2">
            Emoji
          </label>
          <div className="grid grid-cols-10 gap-1">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className="text-xl h-9 flex items-center justify-center rounded-lg transition-all active:scale-90"
                style={{
                  backgroundColor: emoji === e ? `${color}30` : 'rgba(255,255,255,0.05)',
                  outline: emoji === e ? `2px solid ${color}` : 'none',
                  outlineOffset: '-1px',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="text-white/35 text-[10px] uppercase tracking-widest block mb-2">
            Color
          </label>

          {/* Palette tabs */}
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {Object.keys(PALETTE_PRESETS).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setActivePalette(p)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all active:scale-95"
                style={
                  activePalette === p
                    ? { backgroundColor: color, color: '#0f0f0f' }
                    : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
                }
              >
                {p}
              </button>
            ))}
          </div>

          {/* Color swatches */}
          <div className="flex gap-2.5 flex-wrap items-center">
            {PALETTE_PRESETS[activePalette].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-9 h-9 rounded-full transition-all active:scale-90 flex-shrink-0"
                style={{
                  backgroundColor: c,
                  outline: color === c ? '3px solid white' : '3px solid transparent',
                  outlineOffset: '2px',
                }}
              />
            ))}
            {/* Custom color input */}
            <label
              className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden cursor-pointer flex items-center justify-center relative"
              style={{ border: '2px dashed rgba(255,255,255,0.2)' }}
              title="Pick custom color"
            >
              <span className="text-white/40 text-base leading-none pointer-events-none">+</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={() => canSave && onSave({ name: name.trim(), color, emoji })}
          disabled={!canSave}
          className="w-full font-bold rounded-xl py-4 transition-all active:scale-95 disabled:opacity-30 text-black"
          style={{ backgroundColor: canSave ? color : '#6B7280', fontFamily: "'Syne', sans-serif" }}
        >
          Save Category
        </button>
      </div>
    </div>
  )
}
