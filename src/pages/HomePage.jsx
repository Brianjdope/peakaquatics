import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import { ChevronDown, ArrowRight, Waves } from 'lucide-react'
import Ticker from '../components/Ticker'
import SchoolLogo from '../components/SchoolLogo'
import Testimonials from '../components/Testimonials'
import Preloader from '../components/Preloader'
import { ABOUT, STATS } from '../data'

const LOGO_URL = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/7fd6ea37-8f94-4626-ac71-1fe5e214471e/peak-aquatic-primary-logo-black.png'

const ATHLETE_SLIDES = [
  {
    img: '/photos/kate-diving.jpg',
    univ: 'University of Texas',
    name: 'Kate Hurst',
    achievement: 'World Junior Aquatics Champion 2023 · USA National Team 2024–2026',
    bgPosition: 'center 30%',
    credit: 'Photo by Jack Spitser',
  },
  {
    img: '/photos/chloe-kim-v3.jpg',
    univ: 'Princeton University',
    name: 'Chloe Kim',
    achievement: '4th Place · World Junior Aquatics Championships 2025',
    bgPosition: '70% center',
    bgPositionMobile: '78% center',
    credit: 'Photo by Jack Spitser',
  },
  {
    img: '/photos/richard-hometown-hero.jpg',
    univ: 'Harvard University',
    name: 'Richard Poplawski',
    achievement: 'Top 50 at Olympic Trials · 12th All-Time US 200M IM',
    bgPosition: 'center 15%',
    credit: 'Photo by USA Swimming',
  },
]

const FEATURED_SCHOOLS = [
  'Princeton University', 'University of Texas', 'Harvard University',
  'Brown University', 'West Point', 'Wesleyan University',
  'Tufts University', 'Cornell University', 'Northwestern University',
  'Purdue University', 'Colgate University', 'University of Maine',
]

const FEATURES = [
  'Personalized stroke analysis & technique coaching',
  'Collegiate recruitment consulting & guidance',
  'Race strategy & mental performance training',
  'Year-round structured training programs',
]

// ── COUNT-UP HOOK ──
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    const num = parseInt(target.replace(/\D/g, '')) || 0
    if (num === 0) { setCount(target); return }
    const suffix = target.replace(/[0-9]/g, '')
    let startTime = null
    const step = (ts) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * num) + suffix)
      if (progress < 1) requestAnimationFrame(step)
      else setCount(target)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return count
}

function StatItem({ s, inView }) {
  const val = useCountUp(s.num, 1800, inView)
  return (
    <div className="hero-stat-item">
      <span className="hero-stat-num">{inView ? val : '0'}</span>
      <span className="hero-stat-label">{s.label}</span>
    </div>
  )
}

// ── REVEAL WRAPPER ──
function Reveal({ children, delay = 0, className = '', style = {} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 36 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// ── FULL-VIEWPORT ATHLETE SLIDE ──
function AthleteSlide({ slide, onClick }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <section
      ref={ref}
      className="pas-athlete-slide"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <motion.div
        className="pas-athlete-bg"
        style={{
          backgroundImage: `url(${slide.img})`,
          backgroundPosition: slide.bgPosition || 'center',
          '--bg-position-mobile': slide.bgPositionMobile || slide.bgPosition || 'center',
        }}
        animate={{ scale: inView ? 1 : 1.06 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <div className="pas-athlete-overlay" />
      <div className="pas-athlete-text">
        <motion.div
          className="pas-athlete-univ"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {slide.univ}
        </motion.div>
        <motion.h2
          className="pas-athlete-name"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.95, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {slide.name}
        </motion.h2>
        <motion.div
          className="pas-athlete-achievement"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {slide.achievement}
        </motion.div>
      </div>
      {slide.credit && (
        <div className="pas-athlete-credit">{slide.credit}</div>
      )}
    </section>
  )
}

// ── MAIN HOMEPAGE ──
export default function HomePage({ setPage, goToBooking }) {
  const statsRef = useRef(null)
  const [statsInView, setStatsInView] = useState(false)
  const [preloaderDone, setPreloaderDone] = useState(false)
  const handlePreloaderComplete = useCallback(() => setPreloaderDone(true), [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsInView(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div>
      {/* PRELOADER */}
      {!preloaderDone && <Preloader onComplete={handlePreloaderComplete} />}

      {/* ── HERO ── */}
      <section className="pas-hero">
        <motion.div
          className="pas-hero-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="pas-hero-logo-wrap">
            <img
              className="pas-hero-logo"
              src={LOGO_URL}
              alt="Peak Aquatic Sports"
            />
          </div>
          <h1 className="pas-hero-h1">Peak Aquatic Sports</h1>
          <p className="pas-hero-tagline">Rise Higher</p>
        </motion.div>
        <motion.div
          className="pas-hero-scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
        >
          <div className="pas-hero-scroll-line" />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            Scroll <ChevronDown size={14} strokeWidth={1.5} />
          </span>
        </motion.div>
      </section>

      {/* TICKER */}
      <Ticker />

      {/* ── WHAT WE DO ── */}
      <section style={{ background: 'var(--bg)', padding: '9rem 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container">
          <div className="what-we-do-grid">
            <Reveal delay={0}>
              <p className="section-label">What We Do</p>
              <h2 style={{ lineHeight: 1.0, marginTop: '0.5rem' }}>
                A Consultancy<br />Built for<br />Excellence
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="what-we-do-content">
                <p>{ABOUT.homeIntro}</p>
                <p>{ABOUT.homeBody}</p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                  <button className="btn btn-solid" onClick={() => setPage('about')}>Learn More</button>
                </div>
                <div className="feature-list">
                  {FEATURES.map((f, i) => (
                    <motion.div
                      className="feature-item"
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Waves size={16} strokeWidth={1.75} style={{ flexShrink: 0, color: 'var(--accent, #fff)', opacity: 0.85 }} />
                      {f}
                    </motion.div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── VIDEO SPLIT ── */}
      <div className="img-split" style={{ minHeight: '60vh' }}>
        <div className="img-split-photo" style={{ overflow: 'hidden' }}>
          <video
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            autoPlay muted loop playsInline
            src="/hero-video.mp4"
          />
        </div>
        <div className="img-split-content">
          <Reveal delay={0.1}>
            <p className="section-label">Our Approach</p>
            <h2 style={{ marginBottom: '1.2rem', marginTop: '0.5rem' }}>Coaching That<br />Gets Results</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '2rem', maxWidth: '420px', lineHeight: 1.7 }}>
              We combine elite stroke technique, race strategy and video analysis to give our swimmers an advantage in the pool and in the recruitment process.
            </p>
          </Reveal>
        </div>
      </div>

      {/* ── ATHLETE SLIDES ── */}
      {ATHLETE_SLIDES.map((slide, i) => (
        <AthleteSlide key={i} slide={slide} onClick={() => setPage('placements')} />
      ))}

      {/* ── STATS STRIP ── */}
      <section style={{ background: 'var(--bg)', padding: '5rem 0 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="hero-stat-strip" ref={statsRef}>
            {STATS.map((s, i) => <StatItem key={i} s={s} inView={statsInView} />)}
          </div>
        </div>
      </section>

      {/* ── WHERE OUR ATHLETES GO ── */}
      <section style={{ background: 'var(--bg)', padding: '5rem 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <p className="section-label">Academic Excellence</p>
                <h2 style={{ marginTop: '0.5rem' }}>Where Our<br />Athletes Go</h2>
              </div>
              <p style={{ color: 'var(--muted)', maxWidth: '280px', fontSize: '0.88rem', lineHeight: 1.8 }}>
                Our athletes compete at the nation's most prestigious universities.
              </p>
            </div>
          </Reveal>

          <div className="schools-emblem-grid">
            {FEATURED_SCHOOLS.map((school, i) => (
              <motion.button
                key={school}
                className="school-emblem-card"
                onClick={() => setPage('placements')}
                title={school}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <SchoolLogo school={school} size={64} />
                <span className="school-emblem-name">{school}</span>
              </motion.button>
            ))}
          </div>

          <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
            <button
              className="btn"
              onClick={() => setPage('placements')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              View All Placements <ArrowRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <Testimonials />
    </div>
  )
}
