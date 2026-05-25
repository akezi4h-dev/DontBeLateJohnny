function normalizeSvg(svgStr, size) {
  return svgStr.replace(/<svg([^>]*)>/i, (_, attrs) => {
    const cleaned = attrs
      .replace(/\s+width="[^"]*"/g, '')
      .replace(/\s+height="[^"]*"/g, '')
    return `<svg${cleaned} width="${size}" height="${size}" style="display:block">`
  })
}

/**
 * Renders a category icon — inline SVG if cat.svgIcon is set, otherwise the emoji.
 * Props:
 *   cat       — category object ({ emoji, svgIcon? })
 *   size      — pixel dimensions for SVG rendering (default 20)
 *   className — forwarded to the root element
 *   style     — forwarded to the root element
 */
export default function CatIcon({ cat, size = 20, className = '', style = {} }) {
  if (cat?.svgIcon) {
    const svg = normalizeSvg(cat.svgIcon, size)
    return (
      <span
        className={className}
        style={{
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          ...style,
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    )
  }
  return <span className={className} style={style}>{cat?.emoji ?? '📋'}</span>
}
