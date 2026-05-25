const API_URL = 'https://api.anthropic.com/v1/messages'

// For uploaded logos — priority is faithfully reproducing the actual mark
const IMAGE_PROMPT = `Reproduce the main logo mark or symbol from this image as a clean flat SVG icon.
Rules:
- viewBox="0 0 32 32", no width/height attributes
- Flat design, solid shapes only — no gradients, no drop shadows
- Use fill="currentColor" for ALL fills
- Faithfully capture the distinctive shape of the logo — if it contains a stylised letter, symbol, or icon mark, reproduce that exact shape with correct proportions
- No background rectangle, no outer border
- Return ONLY the raw SVG element — no markdown, no backticks, no explanation`

// For text descriptions — design a conceptual icon from scratch
const DESCRIPTION_PROMPT = `Design a clean flat SVG icon for a work category.
Rules:
- viewBox="0 0 32 32", no width/height attributes
- Flat design, solid shapes only — no gradients, no drop shadows
- Use fill="currentColor" for ALL fills
- Bold recognisable silhouette, immediately clear at 16px — think simplified app icon
- No text elements, no letters, no numbers
- 1–4 shapes maximum
- No background rectangle
- Return ONLY the raw SVG element — no markdown, no backticks, no explanation`

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
      { type: 'text', text: IMAGE_PROMPT },
    ],
  }])
}

export async function generateIconFromDescription(description) {
  return callAnthropic([{
    role: 'user',
    content: `Category: "${description}"\n\n${DESCRIPTION_PROMPT}`,
  }])
}
