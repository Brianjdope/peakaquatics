import React, { useState } from 'react'

export default function ClaudeAssistant() {
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Request failed.')
      }

      setReply(data.reply || 'No response returned.')
      setMessage('')
    } catch (err) {
      setError(err.message || 'Unable to contact Claude right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="claude-panel">
      <p className="section-label">AI Assistant</p>
      <h3 className="claude-title">Ask Claude</h3>
      <p className="claude-subtitle">
        Ask training, recruiting, or scheduling questions and get a quick answer.
      </p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="claude-message">Your question</label>
          <textarea
            id="claude-message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Example: How many private sessions per week should a 13-year-old sprinter do?"
            required
          />
        </div>
        <button className="form-submit" type="submit" disabled={loading}>
          {loading ? 'Asking Claude...' : 'Ask Claude'}
        </button>
      </form>

      {error ? <p className="claude-error">{error}</p> : null}

      {reply ? (
        <div className="claude-reply">
          <div className="contact-detail-label">Claude Reply</div>
          <p>{reply}</p>
        </div>
      ) : null}
    </div>
  )
}
