import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LOGO_URL = '/icons/icon-512.svg'

export default function Preloader({ onComplete }) {
  // Phases: logo → reveal → done
  const [phase, setPhase] = useState('logo')
  const timeouts = useRef([])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 1400)
    const t2 = setTimeout(() => { setPhase('done'); onComplete?.() }, 2000)
    timeouts.current = [t1, t2]
    return () => timeouts.current.forEach(clearTimeout)
  }, [onComplete])

  if (phase === 'done') return null

  const isReveal = phase === 'reveal'

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isReveal ? 0 : 1 }}
          transition={{ duration: isReveal ? 0.6 : 0.3, ease: [0.16, 1, 0.3, 1] }}
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
          <motion.img
            src={LOGO_URL}
            alt="Peak Aquatic Sports"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              opacity: { duration: 0.8, ease: 'easeOut' },
              scale: { duration: 1, ease: [0.16, 1, 0.3, 1] },
            }}
            style={{
              height: 'clamp(130px, 26vw, 280px)',
              width: 'auto',
              userSelect: 'none',
              display: 'block',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
