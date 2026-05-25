function stripBackground(svgStr) {
  // Remove full-coverage background rectangles (width/height >= 28, x/y near 0)
  let s = svgStr.replace(
    /<rect\b[^>]*(?=.*\bwidth=["'](?:2[89]|3[0-9])(?:\.\d+)?["'])(?=.*\bheight=["'](?:2[89]|3[0-9])(?:\.\d+)?["'])[^>]*\/?>/gi,
    ''
  )
  // Remove full-coverage background circles (r >= 14)
  s = s.replace(
    /<circle\b[^>]*\br=["'](?:1[4-9]|[2-9]\d)(?:\.\d+)?["'][^>]*\/?>/gi,
    ''
  )
  // Remove full-coverage ellipses
  s = s.replace(
    /<ellipse\b[^>]*(?=.*\brx=["'](?:1[4-9]|[2-9]\d)(?:\.\d+)?["'])(?=.*\bry=["'](?:1[4-9]|[2-9]\d)(?:\.\d+)?["'])[^>]*\/?>/gi,
    ''
  )
  return s
}

function normalizeSvg(svgStr, size) {
  const stripped = stripBackground(svgStr)
  return stripped.replace(/<svg([^>]*)>/i, (_, attrs) => {
    const cleaned = attrs
      .replace(/\s+width="[^"]*"/g, '')
      .replace(/\s+height="[^"]*"/g, '')
    return `<svg${cleaned} width="${size}" height="${size}" style="display:block">`
  })
}

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
