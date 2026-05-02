import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ARTICLES } from '../data'

const ADMIN_PASSWORD = 'peakaquatic2026'
const SHEETS_API = 'https://script.google.com/macros/s/AKfycbxXftEZLmAm-vQ4MQi2GZgycipF-JXo4-ZdnxAWT8kuIojrhhvSyP9XjKJh9WzO3a4d/exec'

// Convert article data into an Instagram caption
function articleToCaption(article) {
  let caption = `${article.title}\n\n${article.excerpt}`
  caption += '\n\n#peakaquaticsports #swimming #competitiveswimming #swimcoach #usaswimming'
  return caption
}

// Resolve article image to a full public URL
function resolveImageUrl(img) {
  if (!img) return ''
  if (img.startsWith('http')) return img
  // Local images like /photos/... need the deployed site URL prefix
  return 'https://brianjdope.github.io/peakaquatics1' + img
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // Tab: 'article' or 'custom'
  const [tab, setTab] = useState('article')

  // Article picker
  const [selectedArticle, setSelectedArticle] = useState('')

  // Custom post state
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')

  // Token setup
  const [tokenInput, setTokenInput] = useState('')
  const [tokenSaving, setTokenSaving] = useState(false)
  const [tokenMsg, setTokenMsg] = useState(null)

  // Post state
  const [posting, setPosting] = useState(false)
  const [postResult, setPostResult] = useState(null)
  const [postError, setPostError] = useState('')
  const fileRef = useRef(null)

  const articleKeys = Object.keys(ARTICLES)
  const currentArticle = selectedArticle ? ARTICLES[selectedArticle] : null

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setAuthError('')
    } else {
      setAuthError('Incorrect password')
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setPostResult(null)
    setPostError('')
  }

  // Save token to Apps Script (stores directly as long-lived token)
  const handleSaveToken = async () => {
    if (!tokenInput.trim()) return
    setTokenSaving(true)
    setTokenMsg(null)
    try {
      const res = await fetch(SHEETS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'setInstagramToken',
          longLivedToken: tokenInput.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setTokenMsg({ type: 'success', text: data.message })
        setTokenInput('')
      } else {
        setTokenMsg({ type: 'error', text: data.error })
      }
    } catch (err) {
      setTokenMsg({ type: 'error', text: 'Failed to save: ' + err.message })
    } finally {
      setTokenSaving(false)
    }
  }

  // Upload image to Google Drive and get a public URL
  async function uploadImageToDrive(file) {
    try {
      const reader = new FileReader()
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const res = await fetch(SHEETS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'uploadImage',
          fileName: file.name,
          contentType: file.type,
          imageBase64: base64,
        }),
      })
      const data = await res.json()
      if (data.success && data.imageUrl) return data.imageUrl
      throw new Error(data.error || 'Upload failed')
    } catch (err) {
      throw new Error('Image upload failed: ' + err.message)
    }
  }

  // Post to Instagram directly from the browser (bypasses UrlFetchApp)
  const handlePost = async () => {
    setPosting(true)
    setPostError('')
    setPostResult(null)

    try {
      let finalImageUrl = ''
      let finalCaption = ''

      if (tab === 'article') {
        if (!currentArticle) {
          setPostError('Please select an article.')
          setPosting(false)
          return
        }
        finalImageUrl = resolveImageUrl(currentArticle.img)
        finalCaption = articleToCaption(currentArticle)
      } else {
        finalCaption = caption.trim()
        if (!finalCaption) {
          setPostError('Please enter a caption.')
          setPosting(false)
          return
        }
        finalImageUrl = imageUrl.trim()
        if (!finalImageUrl && imageFile) {
          try {
            finalImageUrl = await uploadImageToDrive(imageFile)
          } catch (uploadErr) {
            setPostError(uploadErr.message)
            setPosting(false)
            return
          }
        }
        if (!finalImageUrl) {
          setPostError('Please provide an image URL or upload an image.')
          setPosting(false)
          return
        }
      }

      // 1. Retrieve stored token from Apps Script (no UrlFetchApp needed)
      const cfgRes = await fetch(SHEETS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'getInstagramConfig' }),
      })
      const cfg = await cfgRes.json()
      if (!cfg.success) {
        setPostError(cfg.error || 'Could not retrieve Instagram config.')
        setPosting(false)
        return
      }

      const { token: accessToken, igUserId } = cfg

      // 2. Create media container via Instagram Graph API
      const containerRes = await fetch(
        `https://graph.facebook.com/v19.0/${igUserId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: finalImageUrl,
            caption: finalCaption,
            access_token: accessToken,
          }),
        }
      )
      const containerData = await containerRes.json()
      if (containerData.error) {
        setPostError('Container error: ' + containerData.error.message)
        setPosting(false)
        return
      }

      // 3. Wait for Instagram to process the image
      await new Promise(r => setTimeout(r, 5000))

      // 4. Publish
      const publishRes = await fetch(
        `https://graph.facebook.com/v19.0/${igUserId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: containerData.id,
            access_token: accessToken,
          }),
        }
      )
      const publishData = await publishRes.json()
      if (publishData.error) {
        setPostError('Publish error: ' + publishData.error.message)
        setPosting(false)
        return
      }

      setPostResult({ success: true, message: 'Posted to Instagram!' })
      if (tab === 'custom') {
        setCaption('')
        setImageFile(null)
        setImagePreview(null)
        setImageUrl('')
        if (fileRef.current) fileRef.current.value = ''
      }
    } catch (err) {
      setPostError('Failed to post: ' + err.message)
    } finally {
      setPosting(false)
    }
  }

  const labelStyle = { color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }
  const inputStyle = {
    width: '100%', padding: '0.6rem 0.75rem', background: 'var(--bg)',
    border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)',
    fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
  }

  // Password gate
  if (!authenticated) {
    return (
      <div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '2.5rem',
            maxWidth: 380,
            width: '100%',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Admin Panel</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Enter password to continue</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              style={{ ...inputStyle, marginBottom: '1rem' }}
            />
            {authError && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '0.75rem' }}>{authError}</p>}
            <button
              type="submit"
              style={{
                width: '100%', padding: '0.6rem', background: 'var(--text)',
                color: 'var(--bg)', border: 'none', borderRadius: 8,
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page-wrapper" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
            Admin Panel
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
            Post to Instagram directly from here.
          </p>

          {/* Token Setup Section */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: 0 }}>Instagram Token</h2>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.7rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              Paste a token from Graph API Explorer. It will be exchanged for a 60-day token and stored securely in the server. You only need to do this once every 60 days.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="password"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                placeholder="Paste short-lived token here"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={handleSaveToken}
                disabled={tokenSaving || !tokenInput.trim()}
                style={{
                  padding: '0.6rem 1rem', background: 'var(--text)', color: 'var(--bg)',
                  border: 'none', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                  cursor: tokenSaving ? 'not-allowed' : 'pointer',
                  opacity: tokenSaving || !tokenInput.trim() ? 0.5 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {tokenSaving ? 'Saving...' : 'Save Token'}
              </button>
            </div>
            {tokenMsg && (
              <p style={{
                color: tokenMsg.type === 'success' ? '#34d399' : '#ef4444',
                fontSize: '0.75rem', marginTop: '0.5rem',
              }}>
                {tokenMsg.text}
              </p>
            )}
          </div>

          {/* Instagram Post Section */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>Post to Instagram</h2>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {[
                { id: 'article', label: 'From Article' },
                { id: 'custom', label: 'Custom Post' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setPostResult(null); setPostError('') }}
                  style={{
                    flex: 1, padding: '0.5rem', border: '1px solid var(--border)',
                    borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                    cursor: 'pointer',
                    background: tab === t.id ? 'var(--text)' : 'transparent',
                    color: tab === t.id ? 'var(--bg)' : 'var(--muted)',
                    transition: 'all 0.2s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Article Tab */}
            {tab === 'article' && (
              <>
                <label style={labelStyle}>Select Article</label>
                <select
                  value={selectedArticle}
                  onChange={e => { setSelectedArticle(e.target.value); setPostResult(null); setPostError('') }}
                  style={{
                    ...inputStyle,
                    marginBottom: '1rem',
                    appearance: 'auto',
                  }}
                >
                  <option value="">Choose an article...</option>
                  {articleKeys.map(key => (
                    <option key={key} value={key}>
                      {ARTICLES[key].title} ({ARTICLES[key].date})
                    </option>
                  ))}
                </select>

                {currentArticle && (
                  <div style={{
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    marginBottom: '1.25rem',
                  }}>
                    <img
                      src={resolveImageUrl(currentArticle.img)}
                      alt={currentArticle.title}
                      style={{ width: '100%', display: 'block', maxHeight: 250, objectFit: 'cover' }}
                    />
                    <div style={{ padding: '0.75rem' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>{currentArticle.title}</p>
                      <p style={{ color: 'var(--muted)', fontSize: '0.7rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {articleToCaption(currentArticle)}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Custom Tab */}
            {tab === 'custom' && (
              <>
                {/* Image Upload */}
                <label style={labelStyle}>Image</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `2px dashed ${imagePreview ? 'var(--text)' : 'var(--border)'}`,
                    borderRadius: 12,
                    padding: imagePreview ? 0 : '2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', display: 'block', borderRadius: 10 }} />
                  ) : (
                    <div>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.5rem' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: 0 }}>Click to upload image</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                </div>

                <label style={labelStyle}>Or paste image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => { setImageUrl(e.target.value); setPostResult(null); setPostError('') }}
                  placeholder="https://example.com/image.jpg"
                  style={{ ...inputStyle, marginBottom: '1rem' }}
                />

                <label style={labelStyle}>Caption</label>
                <textarea
                  value={caption}
                  onChange={e => { setCaption(e.target.value); setPostResult(null); setPostError('') }}
                  placeholder="Write your caption here... Include hashtags at the end."
                  rows={6}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    fontFamily: 'var(--font-body)',
                    marginBottom: '0.5rem',
                  }}
                />
                <p style={{ color: 'var(--muted)', fontSize: '0.7rem', marginBottom: '1.25rem', textAlign: 'right' }}>
                  {caption.length} / 2,200
                </p>
              </>
            )}

            {/* Error / Success */}
            {postError && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, padding: '0.75rem', marginBottom: '1rem',
                color: '#ef4444', fontSize: '0.8rem',
              }}>
                {postError}
              </div>
            )}

            {postResult?.success && (
              <div style={{
                background: 'rgba(52,211,153,0.1)',
                border: '1px solid rgba(52,211,153,0.3)',
                borderRadius: 8, padding: '0.75rem', marginBottom: '1rem',
                color: '#34d399', fontSize: '0.8rem',
              }}>
                {postResult.message}
              </div>
            )}

            {/* Post Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePost}
              disabled={posting}
              style={{
                width: '100%', padding: '0.75rem',
                background: posting ? 'var(--border)' : 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: '0.9rem', fontWeight: 700,
                cursor: posting ? 'not-allowed' : 'pointer',
                opacity: posting ? 0.7 : 1, transition: 'opacity 0.2s',
              }}
            >
              {posting ? 'Posting...' : 'Post to Instagram'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
