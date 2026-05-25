import { useRef, useState } from 'react'
import { PALETTE_PRESETS, EMOJI_OPTIONS } from '../hooks/useCategories'
import { generateIconFromImage, generateIconFromDescription } from '../utils/generateCategoryIcon'
import { removeBackground } from '../utils/preprocessImage'

function normalizeSvg(svgStr, size) {
  return svgStr.replace(/<svg([^>]*)>/i, (_, attrs) => {
    const cleaned = attrs
      .replace(/\s+width="[^"]*"/g, '')
      .replace(/\s+height="[^"]*"/g, '')
    return `<svg${cleaned} width="${size}" height="${size}" style="display:block">`
  })
}

function SvgPreview({ svg, size = 32, color }) {
  const normalized = normalizeSvg(svg, size)
  return (
    <span
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
      }}
      dangerouslySetInnerHTML={{ __html: normalized }}
    />
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

/**
 * Full-screen bottom-sheet modal for creating or editing a category.
 *
 * Props:
 *   initial  — { name, color, emoji, svgIcon? } pre-filled values (optional)
 *   title    — header title string (default "New Category")
 *   onSave   — called with { name, color, emoji, svgIcon } on confirm
 *   onClose  — called when the user cancels
 */
export default function CategoryEditor({ initial = {}, title = 'New Category', onSave, onClose }) {
  const [name, setName]             = useState(initial.name  ?? '')
  const [color, setColor]           = useState(initial.color ?? PALETTE_PRESETS.Neon[0])
  const [emoji, setEmoji]           = useState(initial.emoji ?? '💊')
  const [activePalette, setActivePalette] = useState('Neon')

  // Icon mode: 'emoji' (default) or 'ai'
  const [iconMode, setIconMode]     = useState(initial.svgIcon ? 'ai' : 'emoji')
  // AI generation state
  const [aiMethod, setAiMethod]     = useState('describe')   // 'describe' | 'upload'
  const [descInput, setDescInput]   = useState(initial.name ?? '')
  const [svgIcon, setSvgIcon]       = useState(initial.svgIcon ?? null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError]     = useState(null)

  const fileInputRef = useRef(null)

  const canSave = name.trim().length > 0

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload  = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleGenerate = async (file) => {
    setGenerating(true)
    setGenError(null)
    try {
      let svg
      if (file) {
        const raw             = await toBase64(file)
        const rawMediaType    = file.type || 'image/jpeg'
        const { base64, mediaType } = await removeBackground(raw, rawMediaType)
        svg = await generateIconFromImage(base64, mediaType)
      } else {
        svg = await generateIconFromDescription(descInput || name || 'category')
      }
      setSvgIcon(svg)
    } catch (err) {
      setGenError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) handleGenerate(file)
    e.target.value = ''
  }

  const iconForPreview = iconMode === 'ai' && svgIcon
    ? <SvgPreview svg={svgIcon} size={36} color={color} />
    : <span className="text-3xl">{emoji}</span>

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
          {iconForPreview}
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

        {/* ── Icon section ─────────────────────────────────────────────────── */}
        <div>
          <label className="text-white/35 text-[10px] uppercase tracking-widest block mb-2">
            Icon
          </label>

          {/* Mode toggle: Emoji vs AI */}
          <div className="flex gap-1.5 mb-3">
            {(['emoji', 'ai']).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setIconMode(mode)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all active:scale-95"
                style={
                  iconMode === mode
                    ? { backgroundColor: color, color: '#0f0f0f' }
                    : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
                }
              >
                {mode === 'emoji' ? 'Emoji' : 'AI Icon'}
              </button>
            ))}
          </div>

          {/* ── Emoji picker ── */}
          {iconMode === 'emoji' && (
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
          )}

          {/* ── AI icon generator ── */}
          {iconMode === 'ai' && (
            <div className="space-y-3">
              {/* Method tabs */}
              <div className="flex gap-1.5">
                {(['describe', 'upload']).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setAiMethod(m)}
                    className="px-3 py-1 rounded-full text-xs font-semibold transition-all active:scale-95"
                    style={
                      aiMethod === m
                        ? { backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }
                        : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }
                    }
                  >
                    {m === 'describe' ? 'Type description' : 'Upload image'}
                  </button>
                ))}
              </div>

              {/* Describe method */}
              {aiMethod === 'describe' && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    placeholder="e.g. pharmacy, hospital, nail salon"
                    className="flex-1 bg-[#1e1e1e] rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none text-sm"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    onKeyDown={(e) => e.key === 'Enter' && !generating && handleGenerate(null)}
                  />
                  <button
                    type="button"
                    onClick={() => handleGenerate(null)}
                    disabled={generating}
                    className="px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
                    style={{ backgroundColor: color, color: '#0f0f0f' }}
                  >
                    {generating ? <Spinner /> : 'Generate'}
                  </button>
                </div>
              )}

              {/* Upload method */}
              {aiMethod === 'upload' && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={generating}
                    className="w-full py-4 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ border: `2px dashed ${color}60`, color: 'rgba(255,255,255,0.5)' }}
                  >
                    {generating ? (
                      <>
                        <span style={{ color }}><Spinner /></span>
                        <span>Generating icon…</span>
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload image
                      </>
                    )}
                  </button>
                </>
              )}

              {/* Error */}
              {genError && (
                <div className="text-xs rounded-xl px-4 py-3" style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                  {genError}
                </div>
              )}

              {/* Generated icon preview */}
              {svgIcon && !generating && (
                <div
                  className="flex items-center gap-4 rounded-2xl p-4"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <span
                    className="rounded-xl p-2 flex-shrink-0"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    <SvgPreview svg={svgIcon} size={36} color={color} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/50 mb-2">Icon preview</div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => aiMethod === 'upload' ? fileInputRef.current?.click() : handleGenerate(null)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all active:scale-95"
                        style={{ backgroundColor: `${color}25`, color }}
                      >
                        Regenerate
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSvgIcon(null); setIconMode('emoji') }}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all active:scale-95"
                        style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                      >
                        Use emoji instead
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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
          onClick={() => canSave && onSave({
            name:    name.trim(),
            color,
            emoji,
            svgIcon: (iconMode === 'ai' && svgIcon) ? svgIcon : null,
          })}
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
