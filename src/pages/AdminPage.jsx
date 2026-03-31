import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'

// Instagram Graph API config — update these after connecting your account
const IG_CONFIG = {
  accessToken: '', // Long-lived access token (set after Meta app setup)
  igUserId: '',    // Instagram Business Account ID
}

const ADMIN_PASSWORD = 'peakaquatic2026' // Simple gate — change this

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // Instagram post state
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [posting, setPosting] = useState(false)
  const [postResult, setPostResult] = useState(null)
  const [postError, setPostError] = useState('')
  const fileRef = useRef(null)

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

  const handlePost = async () => {
    if (!caption.trim()) {
      setPostError('Please enter a caption.')
      return
    }

    // Need either a public image URL or an uploaded image
    const finalImageUrl = imageUrl.trim()
    if (!finalImageUrl && !imageFile) {
      setPostError('Please provide an image URL or upload an image.')
      return
    }

    if (!IG_CONFIG.accessToken || !IG_CONFIG.igUserId) {
      setPostError('Instagram API not configured yet. Please provide your Instagram account details to Brian.')
      return
    }

    setPosting(true)
    setPostError('')
    setPostResult(null)

    try {
      // If user uploaded a file but no URL, we need a publicly accessible URL
      // Instagram API requires a public URL — uploaded files need to go through a hosting service
      let pubUrl = finalImageUrl

      if (!pubUrl && imageFile) {
        // Upload to a temporary image host or use the Apps Script to host on Drive
        pubUrl = await uploadImageToDrive(imageFile)
      }

      if (!pubUrl) {
        setPostError('Could not get a public URL for the image. Please paste a direct image URL instead.')
        setPosting(false)
        return
      }

      // Step 1: Create media container
      const containerRes = await fetch(
        `https://graph.facebook.com/v19.0/${IG_CONFIG.igUserId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: pubUrl,
            caption: caption,
            access_token: IG_CONFIG.accessToken,
          }),
        }
      )
      const containerData = await containerRes.json()

      if (containerData.error) {
        throw new Error(containerData.error.message)
      }

      const creationId = containerData.id

      // Step 2: Wait a moment for Instagram to process
      await new Promise(r => setTimeout(r, 3000))

      // Step 3: Publish the container
      const publishRes = await fetch(
        `https://graph.facebook.com/v19.0/${IG_CONFIG.igUserId}/media_publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: creationId,
            access_token: IG_CONFIG.accessToken,
          }),
        }
      )
      const publishData = await publishRes.json()

      if (publishData.error) {
        throw new Error(publishData.error.message)
      }

      setPostResult({
        success: true,
        postId: publishData.id,
        message: 'Successfully posted to Instagram!'
      })

      // Reset form
      setCaption('')
      setImageFile(null)
      setImagePreview(null)
      setImageUrl('')
      if (fileRef.current) fileRef.current.value = ''

    } catch (err) {
      setPostError('Failed to post: ' + err.message)
    } finally {
      setPosting(false)
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

      const SHEETS_API = 'https://script.google.com/macros/s/AKfycbxiGm4FBKULvmZVze3IlRYDO741OcmexbSk0-cDpSQhYhoy4X95RE6WIAVw0X7o6tT7/exec'
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
      if (data.success && data.imageUrl) {
        return data.imageUrl
      }
      return null
    } catch {
      return null
    }
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
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {authError && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '0.75rem' }}>{authError}</p>}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.6rem',
                background: 'var(--text)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
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

            {/* Image Upload */}
            <label style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
              Image
            </label>

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
                position: 'relative',
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '100%', display: 'block', borderRadius: 10 }}
                />
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
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </div>

            {/* Or paste image URL */}
            <label style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
              Or paste image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => { setImageUrl(e.target.value); setPostResult(null); setPostError('') }}
              placeholder="https://example.com/image.jpg"
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            {/* Caption */}
            <label style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
              Caption
            </label>
            <textarea
              value={caption}
              onChange={e => { setCaption(e.target.value); setPostResult(null); setPostError('') }}
              placeholder="Write your caption here... Include hashtags at the end."
              rows={6}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: '0.85rem',
                resize: 'vertical',
                fontFamily: 'var(--font-body)',
                marginBottom: '0.5rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <p style={{ color: 'var(--muted)', fontSize: '0.7rem', marginBottom: '1.25rem', textAlign: 'right' }}>
              {caption.length} / 2,200
            </p>

            {/* Error / Success */}
            {postError && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8,
                padding: '0.75rem',
                marginBottom: '1rem',
                color: '#ef4444',
                fontSize: '0.8rem',
              }}>
                {postError}
              </div>
            )}

            {postResult?.success && (
              <div style={{
                background: 'rgba(52,211,153,0.1)',
                border: '1px solid rgba(52,211,153,0.3)',
                borderRadius: 8,
                padding: '0.75rem',
                marginBottom: '1rem',
                color: '#34d399',
                fontSize: '0.8rem',
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
                width: '100%',
                padding: '0.75rem',
                background: posting ? 'var(--border)' : 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: posting ? 'not-allowed' : 'pointer',
                opacity: posting ? 0.7 : 1,
                transition: 'opacity 0.2s',
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
