import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
const port = process.env.PORT || 3001
const allowedOrigin = process.env.CLAUDE_ALLOWED_ORIGIN || '*'

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('ANTHROPIC_API_KEY is not set. Claude API calls will fail.')
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

app.use(cors({ origin: allowedOrigin }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/claude', async (req, res) => {
  try {
    const prompt = typeof req.body?.message === 'string' ? req.body.message.trim() : ''
    if (!prompt) {
      return res.status(400).json({ error: 'Message is required.' })
    }

    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5',
      max_tokens: 700,
      system:
        'You are Peak Aquatic Sports assistant. Keep responses short, friendly, and useful for swimmers and parents.',
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')

    return res.json({ reply: text || 'No response returned.' })
  } catch (error) {
    const statusCode = error?.status || 500
    return res.status(statusCode).json({
      error: error?.message || 'Claude request failed.',
    })
  }
})

app.listen(port, () => {
  console.log(`Claude API server running on http://localhost:${port}`)
})
