import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { TESTIMONIALS } from '../data'
import { useInView } from '../hooks/useInView'

export default function Testimonials() {
  const [ref, inView] = useInView(0.1)
  const carouselRef = useRef(null)

  const scroll = (dir) => {
    if (!carouselRef.current) return
    carouselRef.current.scrollBy({ left: dir * 400, behavior: 'smooth' })
  }

  return (
    <section className="testimonials" id="testimonials" ref={ref}>
      <div className="container">
        <motion.div
          style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
        >
          <div>
            <p className="section-label">Athlete Voices</p>
            <h2>What Our Swimmers Say</h2>
          </div>
          <div className="carousel-nav" style={{ marginBottom: '0.5rem' }}>
            <button className="carousel-btn" onClick={() => scroll(-1)} aria-label="Previous">←</button>
            <button className="carousel-btn" onClick={() => scroll(1)}  aria-label="Next">→</button>
          </div>
        </motion.div>

        <motion.div
          className="testimonials-carousel"
          ref={carouselRef}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.95, delay: 0.2 }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div className="testimonial-card" key={i}>
              {t.image && (
                <div className="testimonial-avatar">
                  <img src={t.image} alt={t.name} style={t.imageStyle} />
                </div>
              )}
              <div className="testimonial-quote-mark">"</div>
              <p className="testimonial-text">{t.quote}</p>
              <div className="testimonial-name">{t.name}</div>
              <div className="testimonial-school">{t.school}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
