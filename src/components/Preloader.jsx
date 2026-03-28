import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LOGO_URL = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/7fd6ea37-8f94-4626-ac71-1fe5e214471e/peak-aquatic-primary-logo-black.png'

const TITLE_LETTERS = 'PEAK AQUATIC SPORTS'.split('')

export default function Preloader({ onComplete }) {
  // Phases: logo → title → tagline → reveal → done
  const [phase, setPhase] = useState('logo')
  const timeouts = useRef([])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('title'), 1200)
    const t2 = setTimeout(() => setPhase('tagline'), 2300)
    const t3 = setTimeout(() => setPhase('reveal'), 3700)
    const t4 = setTimeout(() => { setPhase('done'); onComplete?.() }, 4300)
    timeouts.current = [t1, t2, t3, t4]
    return () => timeouts.current.forEach(clearTimeout)
  }, [onComplete])

  if (phase === 'done') return null

  const showTitle = phase === 'title' || phase === 'tagline' || phase === 'reveal'
  const showTagline = phase === 'tagline' || phase === 'reveal'
  const isReveal = phase === 'reveal'
  const isLogoOnly = phase === 'logo'

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isReveal ? 0 : 1 }}
          transition={{ duration: isReveal ? 0.8 : 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#030303',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 2vw',
          }}>
            {/* Logo — starts centered, slides up when title appears */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                marginBottom: isLogoOnly ? 0 : 'clamp(1.5rem, 3vw, 2.5rem)',
              }}
              transition={{
                opacity: { duration: 0.8, ease: 'easeOut' },
                scale: { duration: 1, ease: [0.16, 1, 0.3, 1] },
                marginBottom: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              }}
              style={{
                height: 'clamp(70px, 14vw, 150px)',
                overflow: 'hidden',
                userSelect: 'none',
              }}
            >
              <img
                src={LOGO_URL}
                alt="Peak Aquatic Sports"
                style={{
                  height: 'clamp(130px, 26vw, 280px)',
                  width: 'auto',
                  filter: 'brightness(0) invert(1) contrast(10)',
                  objectPosition: 'top',
                  display: 'block',
                }}
              />
            </motion.div>

            {/* PEAK AQUATIC SPORTS — letter by letter */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'nowrap',
              height: showTitle ? 'auto' : 0,
              overflow: 'hidden',
            }}>
              {showTitle && TITLE_LETTERS.map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.04 * i,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    display: 'inline-block',
                    fontFamily: "'Anton', Arial, sans-serif",
                    fontSize: 'clamp(3rem, 9vw, 9rem)',
                    color: '#fcfcfc',
                    letterSpacing: '-0.02em',
                    fontWeight: 400,
                    lineHeight: 0.9,
                    userSelect: 'none',
                    marginRight: char === ' ' ? 'clamp(0.5rem, 1.5vw, 1.2rem)' : 0,
                  }}
                >
                  {char === ' ' ? '' : char}
                </motion.span>
              ))}
            </div>

            {/* Rise Higher */}
            {showTagline && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  marginTop: 'clamp(0.8rem, 1.5vw, 1.5rem)',
                  fontFamily: "'Anton', Arial, sans-serif",
                  fontSize: 'clamp(0.9rem, 1.5vw, 1.3rem)',
                  color: 'rgba(252,252,252,0.6)',
                  letterSpacing: '0.12em',
                  fontWeight: 400,
                  userSelect: 'none',
                  textTransform: 'uppercase',
                }}
              >
                Rise Higher
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
