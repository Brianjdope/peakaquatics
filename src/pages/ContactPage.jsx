import React, { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CONTACT_INFO } from '../data'
import { lazy, Suspense } from 'react'
const BusinessCard3D = lazy(() => import('../components/BusinessCard3D'))

const LOGO = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/7fd6ea37-8f94-4626-ac71-1fe5e214471e/peak-aquatic-primary-logo-black.png'

function BusinessCard() {
  const cardRef = useRef(null)
  const [flipped, setFlipped] = useState(false)
  const [style, setStyle] = useState({})
  const [shinePos, setShinePos] = useState({ x: 50, y: 50 })
  const [hovering, setHovering] = useState(false)

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rotateX = ((y - cy) / cy) * -12
    const rotateY = ((x - cx) / cx) * 12
    setStyle({ transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)` })
    setShinePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setStyle({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)', transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)' })
    setHovering(false)
  }, [])

  const handleMouseEnter = useCallback(() => {
    setHovering(true)
  }, [])

  return (
    <div style={{ perspective: '1000px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <p style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', marginBottom: '1.2rem' }}>
        HOVER TO TILT · TAP TO FLIP
      </p>
      <motion.div
        initial={{ opacity: 0, y: 40, rotateY: -15 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 620, cursor: 'pointer' }}
      >
        {/* Card wrapper — handles 3D tilt */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
          onClick={() => setFlipped(f => !f)}
          style={{
            ...style,
            position: 'relative',
            width: '100%',
            aspectRatio: '1.75',
            transformStyle: 'preserve-3d',
            transition: hovering ? 'transform 0.08s linear' : 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
            userSelect: 'none',
          }}
        >
          {/* ── FRONT ── */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05) inset',
            overflow: 'hidden',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            padding: '2rem 2.5rem',
          }}>
            {/* Holographic shine */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none',
              background: `radial-gradient(circle at ${shinePos.x}% ${shinePos.y}%, rgba(255,255,255,0.12) 0%, rgba(100,180,255,0.06) 30%, transparent 60%)`,
              mixBlendMode: 'screen',
              opacity: hovering ? 1 : 0,
              transition: 'opacity 0.3s',
            }} />
            {/* Rainbow foil strip */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '16px 16px 0 0',
              background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6, #fb923c, #facc15, #4ade80, #60a5fa)',
              opacity: 0.7,
            }} />
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Elite Aquatic Coaching
                </p>
                <h2 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: '#fcfcfc', fontWeight: 400, lineHeight: 0.95, margin: 0, letterSpacing: '-0.02em' }}>
                  PEAK<br />AQUATIC<br />SPORTS
                </h2>
              </div>
              <img src={LOGO} alt="Peak Aquatic Sports"
                style={{ width: 52, height: 52, objectFit: 'contain', filter: 'invert(1) brightness(0.85)', opacity: 0.9 }}
              />
            </div>
            {/* Bottom row */}
            <div>
              <p style={{ fontFamily: 'var(--sans)', fontSize: '0.95rem', color: '#fcfcfc', fontWeight: 600, margin: '0 0 0.15rem' }}>
                Philip Kang
              </p>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', margin: 0 }}>
                HEAD COACH &amp; FOUNDER
              </p>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', marginTop: '1.2rem' }}>
                TAP TO FLIP
              </p>
            </div>
            {/* Embossed watermark */}
            <div style={{
              position: 'absolute', bottom: '1rem', right: '1.5rem',
              fontFamily: 'var(--display)', fontSize: '5rem', fontWeight: 400,
              color: 'rgba(255,255,255,0.03)', lineHeight: 1, userSelect: 'none', letterSpacing: '-0.04em',
            }}>PAS</div>
          </div>

          {/* ── BACK ── */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #0d1a2e 0%, #0a1020 50%, #0d1a2e 100%)',
            border: '1px solid rgba(96,165,250,0.2)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 40px rgba(96,165,250,0.05) inset',
            overflow: 'hidden',
            transform: flipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
            transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '2rem 2.5rem', gap: '0.9rem',
          }}>
            {/* Holographic shine back */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none',
              background: `radial-gradient(circle at ${100 - shinePos.x}% ${shinePos.y}%, rgba(96,165,250,0.1) 0%, transparent 60%)`,
              opacity: hovering ? 1 : 0, transition: 'opacity 0.3s',
            }} />
            {/* Rainbow foil strip */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '16px 16px 0 0',
              background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6, #fb923c, #facc15, #4ade80, #60a5fa)',
              opacity: 0.7,
            }} />
            {[
              { label: 'Phone', value: '201-359-5688', href: 'tel:+12013595688' },
              { label: 'Email', value: 'peakaquaticsports@gmail.com', href: 'mailto:peakaquaticsports@gmail.com' },
              { label: 'Instagram', value: '@philkangg', href: 'https://instagram.com/philkangg' },
              { label: 'Location', value: 'Ramsey, NJ 07446', href: null },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', letterSpacing: '0.18em', color: 'rgba(96,165,250,0.6)', textTransform: 'uppercase' }}>
                  {item.label}
                </span>
                {item.href ? (
                  <a href={item.href} onClick={e => e.stopPropagation()}
                    style={{ fontFamily: 'var(--sans)', fontSize: '0.82rem', color: '#fcfcfc', textDecoration: 'none', fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
                    onMouseLeave={e => e.currentTarget.style.color = '#fcfcfc'}
                  >{item.value}</a>
                ) : (
                  <span style={{ fontFamily: 'var(--sans)', fontSize: '0.82rem', color: '#fcfcfc', fontWeight: 500 }}>
                    {item.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </motion.div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <div className="page-wrapper">
      {/* Card section — centered, full dark width */}
      <section style={{ background: 'var(--surface)', paddingTop: '5.5rem', paddingBottom: '1rem' }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
          >
            <Suspense fallback={<div style={{ height: 320 }} />}>
              <BusinessCard3D />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* Contact details — info left, map right */}
      <section style={{ background: 'var(--bg)', padding: '2rem 0 5rem' }}>
        <div className="container">
          <div className="contact-grid">
            <motion.div
              className="contact-info"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="section-label">Contact</p>
              <h2 style={{ marginTop: '0.5rem', marginBottom: '2.5rem' }}>Get In Touch</h2>

              {CONTACT_INFO.hours.map((h, i) => (
                <div key={i} style={{ marginBottom: '1.8rem' }}>
                  <div className="contact-detail-label">{h.season}</div>
                  <div className="contact-detail-value" style={{ marginTop: '0.4rem' }}>{h.weekday}</div>
                  <div className="contact-detail-value">{h.weekend}</div>
                </div>
              ))}

              <div className="contact-detail" style={{ marginTop: '1.5rem' }}>
                <div className="contact-detail-item">
                  <span className="contact-detail-label">Location</span>
                  <a href="https://maps.google.com/maps?q=24+Hour+Fitness+Ramsey+150+Triangle+Blvd+Ramsey+NJ+07446" target="_blank" rel="noopener noreferrer" className="contact-detail-value" style={{ whiteSpace: 'pre-line', textDecoration: 'none', color: 'inherit' }}>{CONTACT_INFO.location}</a>
                </div>
                <div className="contact-detail-item" style={{ marginTop: '1rem' }}>
                  <span className="contact-detail-label">Email</span>
                  <a href={`mailto:${CONTACT_INFO.email}`} className="contact-detail-value" style={{ textDecoration: 'none', color: 'inherit' }}>{CONTACT_INFO.email}</a>
                </div>
                <div className="contact-detail-item" style={{ marginTop: '1rem' }}>
                  <span className="contact-detail-label">Instagram</span>
                  <a href="https://instagram.com/philkangg" target="_blank" rel="noopener noreferrer" className="contact-detail-value" style={{ textDecoration: 'none', color: 'inherit' }}>{CONTACT_INFO.instagram}</a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ borderRadius: 12, overflow: 'hidden', minHeight: 400 }}
            >
              <iframe
                title="Peak Aquatic Sports Location"
                src="https://maps.google.com/maps?q=24+Hour+Fitness+Ramsey+150+Triangle+Blvd+Ramsey+NJ+07446&t=&z=14&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: 400, filter: 'invert(0.9) hue-rotate(180deg) saturate(0.3) brightness(0.8)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
