import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import Ticker from '../components/Ticker'
import SchoolLogo from '../components/SchoolLogo'
import Testimonials from '../components/Testimonials'
import Preloader from '../components/Preloader'
import { ABOUT, STATS } from '../data'

const SPLIT_IMG = '/peakaquatics1/photos/richard-action.jpg'
const LOGO_URL = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/7fd6ea37-8f94-4626-ac71-1fe5e214471e/peak-aquatic-primary-logo-black.png'

const ATHLETE_SLIDES = [
  {
    img: '/peakaquatics1/photos/chloe-kim-v3.jpg',
    label: 'PRINCETON UNIVERSITY',
    title: 'CHLOE KIM',
    subtitle: '4th Place, World Junior Championships 2025',
    bgPosition: 'center 30%',
  },
  {
    img: '/peakaquatics1/photos/kate-diving.jpg',
    label: 'UNIVERSITY OF TEXAS',
    title: 'KATE HURST',
    subtitle: 'World Junior Aquatics Champion 2023 · USA National Team 2024–2026',
    bgPosition: 'center 30%',
  },
  {
    img: '/peakaquatics1/photos/richard-hometown-hero.jpg',
    label: 'HARVARD UNIVERSITY',
    title: 'RICHARD POPLAWSKI',
    subtitle: 'Top 50 at Olympic Trials',
    bgPosition: 'center 15%',
    bgSize: '105%',
  },
  {
    img: '/peakaquatics1/photos/team-trials.jfif',
    label: 'THE BIGGEST STAGE',
    title: 'BEFORE TAKING ON THE WORLD',
    bgPosition: 'center 35%',
  },
]

const FEATURED_SCHOOLS = [
  'Princeton University','University of Texas','Harvard University',
  'Brown University','West Point','Wesleyan University',
  'Tufts University','Cornell University','Northwestern University',
  'Purdue University','Colgate University','University of Maine',
]

const FEATURES = [
  'Personalized stroke analysis & technique coaching',
  'Collegiate recruitment consulting & guidance',
  'Race strategy & mental performance training',
  'Year-round structured training programs',
]

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

function RevealSection({ children, delay = 0, className = '', style = {} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 40 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

function FullSlide({ img, video, label, title, subtitle, onClick, isHero, bgSize, bgPosition, contain, titleStyle }) {
  return (
    <section
      className={`full-slide${isHero ? ' full-slide--hero' : ''}`}
      onClick={onClick}
    >
      {video && (
        <>
          <video className="hero-video-bg" autoPlay muted loop playsInline src={video} />
          <div className="full-slide-overlay" />
        </>
      )}
      {img && !contain && (
        <>
          <div className="full-slide-bg" style={{ backgroundImage: `url(${img})`, backgroundSize: bgSize || 'cover', backgroundPosition: bgPosition || 'center' }} />
          <div className="full-slide-overlay" />
        </>
      )}
      {img && contain && (
        <>
          <img src={img} alt={title} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', objectPosition:'center top' }} />
          <div className="full-slide-overlay" style={{ background:'linear-gradient(to top, rgba(3,3,3,0.9) 0%, rgba(3,3,3,0.1) 40%, rgba(3,3,3,0.0) 100%)' }} />
        </>
      )}
      <div className={`full-slide-text${isHero ? ' full-slide-text--center' : ''}`}>
        {label && (
          <motion.div
            className="full-slide-label"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {label}
          </motion.div>
        )}
        <motion.h2
          className="full-slide-title"
          style={titleStyle}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.div
            className="full-slide-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {subtitle}
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default function HomePage({ setPage, goToBooking }) {
  const statsRef     = useRef(null)
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

      {/* ── PRELOADER ── */}
      {!preloaderDone && <Preloader onComplete={handlePreloaderComplete} />}

      {/* ── SLIDE 1: HERO — matches preloader layout exactly ── */}
      <section className="full-slide full-slide--hero">
        <div className="full-slide-text full-slide-text--center">
          <div style={{
            height: 'clamp(70px, 14vw, 150px)',
            overflow: 'hidden',
            marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
          }}>
            <img
              src={LOGO_URL}
              alt="Peak Aquatic Sports"
              style={{
                height: 'clamp(130px, 26vw, 280px)',
                width: 'auto',
                filter: 'brightness(0) invert(1) contrast(10)',
                objectPosition: 'top',
                display: 'block',
                margin: '0 auto',
              }}
            />
          </div>
          <h2 className="full-slide-title">PEAK AQUATIC SPORTS</h2>
          <div className="full-slide-subtitle" style={{ opacity: 1 }}>Rise Higher</div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── WHAT WE DO ── */}
      <section style={{ background:'var(--bg)', padding:'9rem 0', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
        <div className="container">
          <div className="what-we-do-grid">
            <RevealSection delay={0}>
              <p className="section-label">What We Do</p>
              <h2 style={{ lineHeight:1.05, marginTop:'0.5rem' }}>
                A Consultancy<br />Built for<br />Excellence
              </h2>
            </RevealSection>
            <RevealSection delay={0.15}>
              <div className="what-we-do-content">
                <p>{ABOUT.homeIntro}</p>
                <p>{ABOUT.homeBody}</p>
                <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', marginBottom:'2.5rem' }}>
                  <button className="btn btn-solid" onClick={() => setPage('about')}>Learn More</button>
                  <button className="btn" onClick={goToBooking}>Book a Session</button>
                </div>
                <div className="feature-list">
                  {FEATURES.map((f, i) => (
                    <motion.div
                      className="feature-item"
                      key={i}
                      initial={{ opacity:0, x:-16 }}
                      whileInView={{ opacity:1, x:0 }}
                      viewport={{ once:true }}
                      transition={{ duration:0.5, delay: i * 0.07, ease:[0.16,1,0.3,1] }}
                    >
                      <span className="feature-dot" />
                      {f}
                    </motion.div>
                  ))}
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ── VIDEO + COACHING SPLIT ── */}
      <div className="img-split" style={{ minHeight: '70vh' }}>
        <div className="img-split-photo" style={{ overflow: 'hidden' }}>
          <video
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            autoPlay
            muted
            loop
            playsInline
            src="/peakaquatics1/hero-video.mp4"
          />
        </div>
        <div className="img-split-content">
          <RevealSection delay={0.1}>
            <p className="section-label">Our Approach</p>
            <h2 style={{ marginBottom:'1.2rem', marginTop:'0.5rem' }}>Coaching That<br />Gets Results</h2>
            <p style={{ color: 'var(--muted)', marginBottom:'2rem', maxWidth: '420px', lineHeight: 1.7 }}>
              Race strategy, and video analysis to give every swimmer an advantage in the pool and the recruiting process.
            </p>
            <button className="btn btn-solid" onClick={goToBooking}>Book a Session</button>
          </RevealSection>
        </div>
      </div>

      {/* ── RICHARD SLIDE ── */}
      <FullSlide
        img={ATHLETE_SLIDES[1].img}
        label={ATHLETE_SLIDES[1].label}
        title={ATHLETE_SLIDES[1].title}
        subtitle={ATHLETE_SLIDES[1].subtitle}
        bgPosition={ATHLETE_SLIDES[1].bgPosition}
        onClick={() => setPage('placements')}
      />

      {/* ── CHLOE & KATE SIDE BY SIDE ── */}
      <section className="dual-athlete-section" onClick={() => setPage('placements')} style={{ cursor: 'pointer' }}>
        {[ATHLETE_SLIDES[0], ATHLETE_SLIDES[2]].map((slide, i) => (
          <div className="dual-athlete-card" key={i}>
            <div className="dual-athlete-bg" style={{ backgroundImage: `url(${slide.img})`, backgroundSize: slide.bgSize || 'cover', backgroundPosition: slide.bgPosition || 'center' }} />
            <div className="dual-athlete-overlay" />
            <div className="dual-athlete-text">
              <motion.div
                className="full-slide-label"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                {slide.label}
              </motion.div>
              <motion.h2
                className="full-slide-title"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.8rem)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                {slide.title}
              </motion.h2>
              {slide.subtitle && (
                <motion.div
                  className="full-slide-subtitle"
                  style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.95rem)' }}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.7, delay: 0.2 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  {slide.subtitle}
                </motion.div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* ── COACHING SLIDE ── */}
      <FullSlide
        img={ATHLETE_SLIDES[3].img}
        label={ATHLETE_SLIDES[3].label}
        title={ATHLETE_SLIDES[3].title}
        titleStyle={{ fontSize: 'clamp(1.8rem, 5vw, 5rem)' }}
        onClick={() => setPage('placements')}
      />

      {/* ── STATS ── */}
      <section style={{ background:'var(--bg)', padding:'5rem 0 0', borderTop:'1px solid var(--border)' }}>
        <div className="container">
          <div className="hero-stat-strip" ref={statsRef}>
            {STATS.map((s, i) => <StatItem key={i} s={s} inView={statsInView} />)}
          </div>
        </div>
      </section>

      {/* ── WHERE OUR ATHLETES GO ── */}
      <section style={{ background:'var(--bg)', padding:'5rem 0', borderBottom:'1px solid var(--border)' }}>
        <div className="container">
          <RevealSection>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'3.5rem', flexWrap:'wrap', gap:'1.5rem' }}>
              <div>
                <p className="section-label">Academic Excellence</p>
                <h2 style={{ marginTop:'0.5rem' }}>Where Our<br />Athletes Go</h2>
              </div>
              <p style={{ color:'var(--muted)', maxWidth:'280px', fontSize:'0.88rem', lineHeight:1.8 }}>
                Our athletes compete at the nation's most prestigious universities.
              </p>
            </div>
          </RevealSection>

          <div className="schools-emblem-grid">
            {FEATURED_SCHOOLS.map((school, i) => (
              <motion.button
                key={school}
                className="school-emblem-card"
                onClick={() => setPage('placements')}
                title={school}
                initial={{ opacity:0, y:24 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ duration:0.5, delay: i * 0.05, ease:[0.16,1,0.3,1] }}
                whileHover={{ y:-4, transition:{ duration:0.2 } }}
              >
                <SchoolLogo school={school} size={64} />
                <span className="school-emblem-name">{school}</span>
              </motion.button>
            ))}
          </div>

          <div style={{ marginTop:'3rem', display:'flex', justifyContent:'center' }}>
            <button className="btn" onClick={() => setPage('placements')}>
              View All Placements →
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <Testimonials />
    </div>
  )
}
