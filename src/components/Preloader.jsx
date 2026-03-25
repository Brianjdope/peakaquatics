import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LOGO_URL = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/7fd6ea37-8f94-4626-ac71-1fe5e214471e/peak-aquatic-primary-logo-black.png'

const LETTERS = 'PEAK AQUATICS'.split('')

export default function Preloader({ onComplete }) {
  // Phases: logo → logoOut → text → tagline → exit → done
  const [phase, setPhase] = useState('logo')
  const timeouts = useRef([])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('logoOut'), 1200)
    const t2 = setTimeout(() => setPhase('text'), 1700)
    const t3 = setTimeout(() => setPhase('tagline'), 2800)
    const t4 = setTimeout(() => setPhase('exit'), 3800)
    const t5 = setTimeout(() => { setPhase('done'); onComplete?.() }, 4400)
    timeouts.current = [t1, t2, t3, t4, t5]
    return () => timeouts.current.forEach(clearTimeout)
  }, [onComplete])

  if (phase === 'done') return null

  const showLogo = phase === 'logo' || phase === 'logoOut'
  const showText = phase === 'text' || phase === 'tagline' || phase === 'exit'
  const showTagline = phase === 'tagline' || phase === 'exit'
  const isExit = phase === 'exit'

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
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
          {/* Phase 1: Logo emblem only (cropped), centered */}
          {showLogo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: phase === 'logoOut' ? 0 : 1,
              }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{
                height: 'clamp(90px, 18vw, 200px)',
                overflow: 'hidden',
                userSelect: 'none',
              }}
            >
              <img
                src={LOGO_URL}
                alt="Peak Aquatic Sports"
                style={{
                  height: 'clamp(160px, 32vw, 360px)',
                  width: 'auto',
                  filter: 'brightness(0) invert(1)',
                  objectPosition: 'top',
                  display: 'block',
                }}
              />
            </motion.div>
          )}

          {/* Phase 2: PEAK AQUATICS in massive letters, McCann-style */}
          {showText && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 2vw',
            }}>
              {/* Big name */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'nowrap',
              }}>
                {LETTERS.map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{
                      opacity: isExit ? 0 : 1,
                      y: isExit ? -20 : 0,
                    }}
                    transition={{
                      duration: isExit ? 0.3 : 0.4,
                      delay: isExit ? 0 : 0.05 * i,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      display: 'inline-block',
                      fontFamily: "'Anton', Arial, sans-serif",
                      fontSize: 'clamp(3rem, 12vw, 10rem)',
                      color: '#fcfcfc',
                      letterSpacing: char === ' ' ? '0.15em' : '0.02em',
                      fontWeight: 400,
                      lineHeight: 1,
                      userSelect: 'none',
                      width: char === ' ' ? 'clamp(0.8rem, 2.5vw, 2rem)' : 'auto',
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </div>

              {/* Tagline: RISE ABOVE ALL */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isExit ? 0 : showTagline ? 1 : 0,
                  y: isExit ? -10 : showTagline ? 0 : 20,
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  marginTop: 'clamp(1rem, 3vw, 2.5rem)',
                  fontFamily: "'Anton', Arial, sans-serif",
                  fontSize: 'clamp(1rem, 3vw, 2.2rem)',
                  color: '#fcfcfc',
                  letterSpacing: '0.15em',
                  fontWeight: 400,
                  userSelect: 'none',
                  textTransform: 'uppercase',
                }}
              >
                Rise Above All
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
