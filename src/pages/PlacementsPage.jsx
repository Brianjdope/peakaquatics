import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { PLACEMENTS, TESTIMONIALS } from '../data'
import SchoolLogo from '../components/SchoolLogo'

export default function PlacementsPage() {
  const carouselRef = useRef(null)

  const scroll = (dir) => {
    if (!carouselRef.current) return
    carouselRef.current.scrollBy({ left: dir * 400, behavior: 'smooth' })
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="section-label">Academic Excellence</p>
            <h1 className="page-title">College Placements</h1>
          </motion.div>
        </div>
      </div>

      {/* Placements Grid */}
      <section className="page-section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p style={{ color: 'var(--muted)', marginBottom: '2.5rem', maxWidth: '600px' }}>
              Over 20 student-athletes placed at Division I, II, and III programs across the country — a testament to world-class coaching and comprehensive recruitment guidance.
            </p>
            <div className="placements-photo-grid">
              {PLACEMENTS.map((p, i) => (
                <div className="placement-photo-card" key={i}>
                  <div className="placement-photo-wrap">
                    {p.photo ? (
                      <img
                        src={p.photo}
                        alt={p.name}
                        className="placement-photo-img"
                        style={p.photoStyle}
                        onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
                      />
                    ) : null}
                    <div className="placement-photo-initials" style={{ display: p.photo ? 'none' : 'flex' }}>
                      {p.name.split(' ').map(w => w[0]).join('')}
                    </div>
                  </div>
                  <div className="placement-photo-info">
                    <SchoolLogo school={p.school} size={32} />
                    <div>
                      <div className="placement-name">{p.name}</div>
                      <div className="placement-school">{p.school}</div>
                      {p.year && <div className="placement-year">Class of {p.year}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="page-section" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p className="section-label">Athlete Voices</p>
                <h2>What Our Swimmers Say</h2>
              </div>
              <div className="carousel-nav">
                <button className="carousel-btn" onClick={() => scroll(-1)} aria-label="Previous">←</button>
                <button className="carousel-btn" onClick={() => scroll(1)}  aria-label="Next">→</button>
              </div>
            </div>
            <div className="testimonials-carousel" ref={carouselRef}>
              {TESTIMONIALS.map((t, i) => (
                <div className="testimonial-card" key={i}>
                  {t.image && (
                    <div className="testimonial-avatar">
                      <img src={t.image} alt={t.name} style={t.imageStyle} />
                    </div>
                  )}
                  <div className="testimonial-quote-mark">"</div>
                  <p className="testimonial-text">{t.quote}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                    <SchoolLogo school={t.school} size={32} />
                    <div>
                      <div className="testimonial-name">{t.name}</div>
                      <div className="testimonial-school">{t.school}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
