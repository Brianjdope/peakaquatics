import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Nav from './components/Nav'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import NewsPage from './pages/NewsPage'
import RecordsPage from './pages/RecordsPage'
import ServicesPage from './pages/ServicesPage'
import PlacementsPage from './pages/PlacementsPage'
import ContactPage from './pages/ContactPage'
import TermsPage from './pages/TermsPage'
import GalleryPage from './pages/GalleryPage'

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.3 } },
}

// Parse cancel hash from confirmation emails: #cancel?id=XXX&email=YYY
function parseCancelHash() {
  const hash = window.location.hash
  if (hash.startsWith('#cancel')) {
    const params = new URLSearchParams(hash.replace('#cancel?', ''))
    const id = params.get('id')
    const email = params.get('email')
    if (id && email) {
      return { bookingId: id, email }
    }
  }
  return null
}

export default function App() {
  const initialCancel = parseCancelHash()
  const [page, setPage] = useState(initialCancel ? 'services' : 'home')
  const [scrollPct, setScrollPct] = useState(0)
  const [scrollToBooking, setScrollToBooking] = useState(!!initialCancel)
  const [cancelParams, setCancelParams] = useState(initialCancel)

  // Clean up hash after reading it, and handle future hash changes
  useEffect(() => {
    if (window.location.hash.startsWith('#cancel')) {
      window.history.replaceState(null, '', window.location.pathname)
    }
    const handleHash = () => {
      const cancel = parseCancelHash()
      if (cancel) {
        setCancelParams(cancel)
        setScrollToBooking(true)
        setPage('services')
        setTimeout(() => { window.history.replaceState(null, '', window.location.pathname) }, 0)
      }
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const goToBooking = () => {
    if (page === 'services') {
      const el = document.getElementById('booking')
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
    }
    setScrollToBooking(true)
    setPage('services')
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (scrollToBooking && page === 'services') {
      setTimeout(() => {
        const el = document.getElementById('booking')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setScrollToBooking(false)
      }, 600)
    }
  }, [page])

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100
      setScrollPct(Math.min(pct || 0, 100))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const renderPage = () => {
    switch (page) {
      case 'home':       return <HomePage setPage={setPage} goToBooking={goToBooking} />
      case 'about':      return <AboutPage />
      case 'news':       return <NewsPage />
      case 'records':    return <RecordsPage />
      case 'services':   return <ServicesPage setPage={setPage} cancelParams={cancelParams} onCancelParamsUsed={() => setCancelParams(null)} />
      case 'placements': return <PlacementsPage />
      case 'contact':    return <ContactPage />
      case 'gallery':    return <GalleryPage />
      case 'terms':      return <TermsPage />
      default:           return <HomePage setPage={setPage} />
    }
  }

  return (
    <>
      <div className="scroll-progress" style={{ width: `${scrollPct}%` }} />
      <Nav page={page} setPage={setPage} goToBooking={goToBooking} />

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      <Footer setPage={setPage} />

      {/* Floating Book button */}
      <button
        onClick={goToBooking}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          background: '#fcfcfc',
          color: '#030303',
          border: 'none',
          borderRadius: 50,
          padding: '0.75rem 1.5rem',
          fontSize: '0.82rem',
          fontWeight: 700,
          letterSpacing: '0.5px',
          cursor: 'pointer',
          zIndex: 90,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.5)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)' }}
      >
        Book Now
      </button>
    </>
  )
}
