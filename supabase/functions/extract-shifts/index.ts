const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const { image, mediaType } = await req.json()

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
                text: 'Extract all work shifts from this image. Return ONLY a JSON array with no other text, markdown, or backticks. Format: [{ "date": "2024-01-15", "startTime": "09:00", "endTime": "17:00", "role": "Cashier", "location": "Store A" }]',
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
