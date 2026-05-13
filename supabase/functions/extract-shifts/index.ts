const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const { image, mediaType, year, company } = await req.json()
    const currentYear = year ?? new Date().getFullYear()
    const companyName = company ?? 'Unknown'

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
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
                text: `This is a work roster screenshot for ${companyName}. The current year is ${currentYear} — use this for all dates regardless of what year the image shows. Extract ONLY actual work shifts where the person is scheduled to work. Ignore and skip any entry that says 'Off', 'Day Off', 'All Day Off', 'RDO', or any variation meaning the person is not working. Also ignore entries that are just marked 'Holiday' with no work hours. Only include shifts that have a specific start time and end time, or a named shift type that implies actual work (like 'Morning', 'Night', 'On Call'). Return ONLY a JSON array with no other text, markdown or backticks. Format: [{ "date": "${currentYear}-05-28", "startTime": "09:30", "endTime": "18:00", "role": "Pharmacist", "location": "Pharmacy", "company": "${companyName}" }]. If no actual work shifts are found, return an empty array [].`,
              },
            ],
          },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok || data.type === 'error') {
      console.error('Claude API error:', JSON.stringify(data))
      return new Response(JSON.stringify({ error: data.error ?? data }), {
        status: 502,
        headers: { ...CORS, 'content-type': 'application/json' },
      })
    }

    const content = data.content?.[0]?.text ?? '[]'
    console.log('Claude response:', content)

    return new Response(content, {
      headers: { ...CORS, 'content-type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'content-type': 'application/json' },
    })
  }
})
