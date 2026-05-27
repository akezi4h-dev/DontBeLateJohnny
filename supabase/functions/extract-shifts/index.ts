const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set in Supabase edge function secrets')
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration: ANTHROPIC_API_KEY secret is missing. Set it in Supabase Dashboard → Edge Functions → Secrets.' }),
        { status: 500, headers: { ...CORS, 'content-type': 'application/json' } }
      )
    }

    const { image, mediaType, year, company } = await req.json()
    const currentYear = year ?? new Date().getFullYear()
    const companyName = company ?? 'Unknown'

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: image },
              },
              {
                type: 'text',
                text: `This is a work schedule screenshot for ${companyName}. The year is ${currentYear} — use this year for ALL dates.

INCLUDE only confirmed, scheduled work shifts.

SKIP all of the following:
- Shifts shown with dashed or dotted borders (these are pending, open, or unconfirmed — not real assignments)
- Any entry labeled "Off", "Day Off", "Time Off", "All Day Off", "RDO", "Holiday" (with no hours), or any wording that means the person is not working
- Dates that belong to an adjacent month shown in the calendar overflow (e.g. June dates visible in a July calendar) — only extract shifts for the primary month shown in the header

PARSING RULES:
- 4-digit numbers like "2036", "1234" etc. appearing beneath or near shift times are store or location codes — they are NOT times or years, ignore them entirely
- Convert shorthand times: "9a"=09:00, "10a"=10:00, "11a"=11:00, "12p"=12:00, "1p"=13:00, "2p"=14:00, "3p"=15:00, "4p"=16:00, "5p"=17:00, "6p"=18:00, "7p"=19:00, "8p"=20:00, "9p"=21:00, "10p"=22:00
- All times must be in 24-hour HH:MM format

Return ONLY a raw JSON array — no markdown, no backticks, no explanation:
[{"date":"${currentYear}-MM-DD","startTime":"HH:MM","endTime":"HH:MM","role":"","location":"","company":"${companyName}"}]

If no confirmed shifts are found, return [].`,
              },
            ],
          },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok || data.type === 'error') {
      const errMsg = data.error?.message ?? JSON.stringify(data.error ?? data)
      console.error('Anthropic API error:', JSON.stringify(data))
      return new Response(
        JSON.stringify({ error: `Anthropic API error (${response.status}): ${errMsg}` }),
        { status: 502, headers: { ...CORS, 'content-type': 'application/json' } }
      )
    }

    const content = data.content?.[0]?.text ?? '[]'
    console.log('Claude response:', content)

    return new Response(content, {
      headers: { ...CORS, 'content-type': 'application/json' },
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'content-type': 'application/json' },
    })
  }
})
