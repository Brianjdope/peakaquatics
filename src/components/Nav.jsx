import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LINKS = [
  { label: 'Academic Excellence', page: 'placements' },
  { label: 'Our Mission', page: 'about' },
  { label: 'Records',    page: 'records' },
  { label: 'Services',   page: 'services' },
  { label: 'News & Events', page: 'news' },
  { label: 'Gallery',    page: 'gallery' },
  { label: 'Contact',    page: 'contact' },
]

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
)
const InstagramIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
)
const EmailIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
)
const PhoneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
)

export default function Nav({ page, setPage, goToBooking }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [phoneAvailable, setPhoneAvailable] = useState(() => {
    const h = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })).getHours()
    return h >= 9 && h < 21
  })

  useEffect(() => {
    const checkPhone = () => {
      const h = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })).getHours()
      setPhoneAvailable(h >= 9 && h < 21)
    }
    const id = setInterval(checkPhone, 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleNav = (pg) => {
    setPage(pg)
    setMenuOpen(false)
  }

  return (
    <>
      {/* Top bar — hamburger left, social icons right */}
      <nav className={`nav${scrolled || page !== 'home' ? ' scrolled' : ''}`} style={menuOpen ? { background: '#0c1a33', backdropFilter: 'none' } : {}}>
        <div className="nav-left">
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className={`hamburger-line${menuOpen ? ' open' : ''}`} />
            <span className={`hamburger-line${menuOpen ? ' open' : ''}`} />
          </button>
          {page !== 'home' && (
            <button
              className="nav-home-btn"
              onClick={() => { setPage('home'); setMenuOpen(false) }}
              aria-label="Home"
            >
              <HomeIcon />
            </button>
          )}
        </div>
        <div className="nav-social">
          <a href="https://www.instagram.com/philkangg/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>
          <a href="mailto:peakaquaticsports@gmail.com" aria-label="Email"><EmailIcon /></a>
          {phoneAvailable ? (
            <a href="tel:+12013595688" aria-label="Phone"><PhoneIcon /></a>
          ) : (
            <span style={{ opacity: 0.3, cursor: 'default' }} title="Available 9 AM – 9 PM ET"><PhoneIcon /></span>
          )}
        </div>
      </nav>

      {/* Full-screen McCann-style drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="nav-drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Links — bottom-left aligned like McCann */}
            <div className="nav-drawer-content">
              {LINKS.map((l, i) => (
                <motion.button
                  key={l.label}
                  className={`nav-drawer-link${page === l.page ? ' active' : ''}`}
                  onClick={() => handleNav(l.page)}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  {l.label}
                </motion.button>
              ))}
            </div>

            <div className="nav-drawer-footer">
              <button
                className="nav-drawer-terms"
                onClick={() => handleNav('terms')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: '0.5rem',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >
                Legal
              </button>
              <span>Peak Aquatic Sports</span>
              <span>Ramsey, NJ</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
