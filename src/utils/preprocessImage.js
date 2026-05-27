/**
 * Compresses/resizes an image file using Canvas and returns a JPEG Blob.
 * - Caps max dimension at 1920px (handles Mac Retina screenshots)
 * - Converts HEIC/HEIF to JPEG automatically (Safari on Mac can decode HEIC into Canvas)
 * - Output is always image/jpeg so Anthropic API accepts it reliably
 */
export function compressImage(file, maxDimension = 1920, quality = 0.88) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
      const w = Math.round(img.width  * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Canvas compression failed')),
        'image/jpeg',
        quality,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not load image — try PNG or JPG')) }
    img.src = url
  })
}

/**
 * Removes the background from an image using a corner-seeded flood fill on a
 * Canvas, then returns a base64-encoded PNG with a transparent background.
 *
 * Works best for logos on solid or near-solid backgrounds (the common case for
 * a category icon upload). Photos and complex backgrounds will only lose pixels
 * that are color-connected to the corners, but Claude still sees a cleaner
 * subject than the raw image.
 */
export function removeBackground(base64, mediaType, threshold = 40) {
  return new Promise((resolve) => {
    const img = new Image()

    img.onload = () => {
      // Cap at 512px so the Canvas work stays fast
      const MAX   = 512
      const scale = Math.min(1, MAX / Math.max(img.width, img.height))
      const w     = Math.round(img.width  * scale)
      const h     = Math.round(img.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)

      const imageData = ctx.getImageData(0, 0, w, h)
      const d = imageData.data   // flat RGBA array, length = w * h * 4

      // Sample the four corners and average them as the background colour
      const corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]]
      let rSum = 0, gSum = 0, bSum = 0
      for (const [cx, cy] of corners) {
        const i = (cy * w + cx) * 4
        rSum += d[i]; gSum += d[i + 1]; bSum += d[i + 2]
      }
      const bg = {
        r: Math.round(rSum / 4),
        g: Math.round(gSum / 4),
        b: Math.round(bSum / 4),
      }

      // Stack-based flood fill seeded from all four corners
      const visited = new Uint8Array(w * h)
      const stack   = corners.map(([cx, cy]) => cy * w + cx)
      for (const idx of stack) visited[idx] = 1

      while (stack.length > 0) {
        const idx = stack.pop()
        // Erase this pixel
        d[idx * 4 + 3] = 0

        const x = idx % w
        const y = (idx - x) / w

        for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue
          const nIdx = ny * w + nx
          if (visited[nIdx]) continue
          const ni = nIdx * 4
          const dr = d[ni] - bg.r, dg = d[ni + 1] - bg.g, db = d[ni + 2] - bg.b
          if (Math.sqrt(dr * dr + dg * dg + db * db) < threshold) {
            visited[nIdx] = 1
            stack.push(nIdx)
          }
        }
      }

      ctx.putImageData(imageData, 0, 0)
      const processed = canvas.toDataURL('image/png').split(',')[1]
      resolve({ base64: processed, mediaType: 'image/png' })
    }

    img.onerror = () => resolve({ base64, mediaType }) // fall back to original on error
    img.src = `data:${mediaType};base64,${base64}`
  })
}
