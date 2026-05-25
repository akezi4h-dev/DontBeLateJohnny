const API_URL = 'https://api.anthropic.com/v1/messages'

const SVG_PROMPT =
  'Generate a minimal, clean SVG icon. Requirements: viewBox="0 0 32 32", simple enough to display ' +
  'at 32×32 pixels, use 1-2 colors maximum (use currentColor for the main shapes so they inherit ' +
  'the surrounding text color), no text, no labels, no fine details — flat app-icon style. ' +
  'Return ONLY the raw SVG code, no markdown fences, no backticks, no explanation.'

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
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages,
    }),
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`API ${resp.status}: ${text.slice(0, 200)}`)
  }

  const data = await resp.json()
  let svg = data.content[0].text.trim()
  // Strip markdown fences if the model wraps in ```svg ... ```
  svg = svg.replace(/^```[^\n]*\n?/, '').replace(/\n?```$/, '').trim()
  return svg
}

export async function generateIconFromImage(base64, mediaType) {
  return callAnthropic([{
    role: 'user',
    content: [
      { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
      { type: 'text', text: `Look at this image and ${SVG_PROMPT}` },
    ],
  }])
}

export async function generateIconFromDescription(description) {
  return callAnthropic([{
    role: 'user',
    content: `For a category called "${description}", ${SVG_PROMPT}`,
  }])
}
