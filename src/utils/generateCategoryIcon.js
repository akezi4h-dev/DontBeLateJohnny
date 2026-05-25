const API_URL = 'https://api.anthropic.com/v1/messages'

const SVG_PROMPT = `Create a single clean SVG icon following these rules exactly:
- viewBox="0 0 32 32", no width/height attributes
- Flat design, solid shapes only — no gradients, no strokes, no drop shadows, no fine detail
- 1 to 3 shapes maximum. Think bold silhouette, like an iOS app icon simplified to its core shape
- All fills must use fill="currentColor" so the icon inherits its display color
- No text, no letters, no numbers
- The shape must be immediately recognizable at 16px
- Return ONLY the raw SVG element — no markdown, no backticks, no comments, no explanation`

async function callAnthropic(messages) {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key) throw new Error('API key not configured — add VITE_ANTHROPIC_API_KEY as a GitHub Actions secret and redeploy')

  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages,
    }),
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`API ${resp.status}: ${text.slice(0, 200)}`)
  }

  const data = await resp.json()
  let svg = data.content[0].text.trim()
  svg = svg.replace(/^```[^\n]*\n?/, '').replace(/\n?```$/, '').trim()
  return svg
}

export async function generateIconFromImage(base64, mediaType) {
  return callAnthropic([{
    role: 'user',
    content: [
      { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
      { type: 'text', text: `Look at this image and identify the main subject or logo shape. Then:\n${SVG_PROMPT}` },
    ],
  }])
}

export async function generateIconFromDescription(description) {
  return callAnthropic([{
    role: 'user',
    content: `Create an icon for a work category called "${description}".\n${SVG_PROMPT}`,
  }])
}
