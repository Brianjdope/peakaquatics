import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

// ─── Behold.io widget ────────────────────────────────────────────────────────
// To activate the live feed:
//   1. Go to behold.io and create a free account
//   2. Connect your Instagram account (@scarletaquatics)
//   3. Create a widget and copy your Widget ID
//   4. Replace null below with your Widget ID string, e.g. 'abc123XYZ'
const BEHOLD_WIDGET_ID = null

function InstagramFeed() {
  const ref = useRef(null)

  useEffect(() => {
    if (!BEHOLD_WIDGET_ID) return
    // Load Behold embed script once
    if (!document.querySelector('script[src*="behold.so"]')) {
      const script = document.createElement('script')
      script.src = 'https://w.behold.so/widget.js'
      script.type = 'module'
      document.head.appendChild(script)
    }
  }, [])

  if (BEHOLD_WIDGET_ID) {
    return (
      <behold-widget feed-id={BEHOLD_WIDGET_ID} ref={ref} />
    )
  }

  // Placeholder — shown until Behold widget ID is configured
  return (
    <div style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '3rem 2rem',
      textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 12,
        background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
        margin: '0 auto 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5"/>
          <circle cx="12" cy="12" r="5"/>
          <circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none"/>
        </svg>
      </div>
      <p style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        @scarletaquatics
      </p>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 1.75rem' }}>
        Follow us on Instagram for race day photos, training highlights, and athlete milestones.
      </p>
      <a
        href="https://www.instagram.com/scarletaquatics/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '0.65rem 1.5rem',
          fontSize: '0.82rem',
          fontWeight: 700,
          textDecoration: 'none',
          letterSpacing: '0.04em',
        }}
      >
        Follow on Instagram
      </a>

      <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', lineHeight: 1.8 }}>
          To embed your live feed here, create a free account at behold.io,<br />
          connect @scarletaquatics, and add your Widget ID to GalleryPage.jsx.
        </p>
      </div>
    </div>
  )
}

export default function GalleryPage() {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="section-label">Follow Along</p>
            <h1 className="page-title">Gallery</h1>
          </motion.div>
        </div>
      </div>

      <section className="page-section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <InstagramFeed />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
