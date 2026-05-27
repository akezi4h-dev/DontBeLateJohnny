const API_URL = 'https://api.anthropic.com/v1/messages'

/**
 * Calls Anthropic directly from the browser to extract shift data from a
 * base64-encoded schedule screenshot. Mirrors the edge-function logic but
 * runs client-side so no Supabase function deploy is required.
 */
export async function extractShiftsFromImage(base64, mediaType, { year, company } = {}) {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key) throw new Error('VITE_ANTHROPIC_API_KEY is not configured')

  const currentYear = year ?? new Date().getFullYear()
  const companyName = company ?? 'Unknown'

  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: `This is a work schedule screenshot for ${companyName}. The year is ${currentYear} — use this year for ALL dates.

INCLUDE only confirmed, scheduled work shifts.

SKIP all of the following:
- Shifts shown with dashed or dotted borders (pending, open, or unconfirmed)
- Any entry labeled "Off", "Day Off", "Time Off", "All Day Off", "RDO", "Holiday" (with no hours)
- Dates that belong to an adjacent month shown in the calendar overflow

PARSING RULES:
- 4-digit numbers like "2036", "1234" near shift times are store/location codes — NOT times or years, ignore them
- Convert shorthand times: "9a"=09:00, "10a"=10:00, "11a"=11:00, "12p"=12:00, "1p"=13:00, "2p"=14:00, "3p"=15:00, "4p"=16:00, "5p"=17:00, "6p"=18:00, "7p"=19:00, "8p"=20:00, "9p"=21:00, "10p"=22:00
- All times must be in 24-hour HH:MM format

Return ONLY a raw JSON array — no markdown, no backticks, no explanation:
[{"date":"${currentYear}-MM-DD","startTime":"HH:MM","endTime":"HH:MM"}]

If no confirmed shifts are found, return [].`,
          },
        ],
      }],
    }),
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Anthropic API ${resp.status}: ${text.slice(0, 300)}`)
  }

  const data = await resp.json()
  const raw = data.content?.[0]?.text?.trim() ?? '[]'
  // Strip markdown code fences the model sometimes adds despite instructions
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')
  return JSON.parse(cleaned)
}
