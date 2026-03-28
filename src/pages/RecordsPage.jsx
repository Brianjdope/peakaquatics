import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RECORDS_HERO, RECORDS_TABLES } from '../data'

const RECORDS_HERO_IMG = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/f3c1b432-f659-45a9-85b1-3ebc4b019133/AdobeStock_132941702.jpg'

const COURSE_TABS = [
  { key: 'scy', label: 'Short Course (SCY)' },
  { key: 'lcm', label: 'Long Course (LCM)' },
]

const GROUP_TABS = [
  { key: 'boys-14', label: 'Boys 14 & Under' },
  { key: 'girls-14', label: 'Girls 14 & Under' },
  { key: 'men', label: "Men's Open" },
  { key: 'women', label: "Women's Open" },
]

const Medal = ({ place }) => {
  const colors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: colors[place] || '#666',
      color: '#1a1a2e',
      fontSize: '0.7rem',
      fontWeight: 800,
      flexShrink: 0,
    }}>
      {place}
    </span>
  )
}

export default function RecordsPage() {
  const [course, setCourse] = useState('scy')
  const [group, setGroup] = useState('boys-14')

  const tableKey = `${course}-${group}`
  const table = RECORDS_TABLES[tableKey]

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header-bg" style={{ backgroundImage: `url(${RECORDS_HERO_IMG})` }} />
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="section-label">Records</p>
            <h1 className="page-title">Program Records</h1>
            <p style={{ color: 'var(--muted)', marginTop: '0.75rem', fontSize: '0.9rem' }}>
              All records were set under individual club teams and with Peak Aquatic Sports.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="page-section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          {/* All-Time Hero Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="section-label" style={{ marginBottom: '1.5rem' }}>All-Time Program Bests</p>
            <div className="records-hero-grid" style={{ marginBottom: '3rem' }}>
              {RECORDS_HERO.map((r, i) => (
                <div className="record-hero-card" key={i}>
                  {r.photo && (
                    <img
                      src={r.photo}
                      alt={r.swimmer}
                      style={{
                        width: 88, height: 88, borderRadius: '50%',
                        objectFit: 'cover', objectPosition: 'center 20%',
                        marginBottom: '0.75rem', border: '2px solid var(--accent)',
                        ...r.photoStyle,
                      }}
                    />
                  )}
                  <div className="record-badge">{r.badge}</div>
                  <div className="record-time">{r.time}</div>
                  <div className="record-event">{r.event}</div>
                  <div className="record-swimmer">{r.swimmer}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Course Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              justifyContent: 'center',
            }}>
              {COURSE_TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setCourse(t.key)}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: 20,
                    border: 'none',
                    background: course === t.key ? 'var(--text)' : 'var(--surface2)',
                    color: course === t.key ? 'var(--bg)' : 'var(--muted)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Group Tabs */}
            <div style={{
              display: 'flex',
              gap: '0.35rem',
              marginBottom: '2rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              {GROUP_TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setGroup(t.key)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: 6,
                    border: group === t.key ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: group === t.key ? 'rgba(74,158,255,0.1)' : 'transparent',
                    color: group === t.key ? 'var(--accent)' : 'var(--muted)',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Records Cards */}
            {table && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={tableKey}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                >
                  {table.rows.map((row, i) => {
                    const [event, n1, t1, y1, n2, t2, y2, n3, t3, y3] = row
                    return (
                      <div
                        key={`${tableKey}-${i}`}
                        style={{
                          background: 'var(--surface2)',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          padding: '1rem 1.25rem',
                        }}
                      >
                        {/* Event Name */}
                        <div style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--text)',
                          marginBottom: '0.75rem',
                          paddingBottom: '0.5rem',
                          borderBottom: '1px solid var(--border)',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                        }}>
                          {event}
                        </div>

                        {/* Places */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {[
                            { medal: 1, name: n1, time: t1, year: y1 },
                            { medal: 2, name: n2, time: t2, year: y2 },
                            { medal: 3, name: n3, time: t3, year: y3 },
                          ].filter(p => p.name).map(p => (
                            <div
                              key={p.medal}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                              }}
                            >
                              <Medal place={p.medal} />
                              <span style={{
                                flex: 1,
                                fontSize: '0.85rem',
                                color: 'var(--text2)',
                                fontWeight: 500,
                              }}>
                                {p.name}
                              </span>
                              <span style={{
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: 'var(--text)',
                                fontFamily: 'monospace',
                                minWidth: 70,
                                textAlign: 'right',
                              }}>
                                {p.time}
                              </span>
                              <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--muted)',
                                minWidth: 32,
                                textAlign: 'right',
                              }}>
                                {p.year}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
