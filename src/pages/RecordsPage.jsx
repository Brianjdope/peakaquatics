import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { RECORDS_HERO, RECORDS_TABLES } from '../data'

const TAB_KEYS = ['scy-boys-14','scy-girls-14','lcm-boys-14','lcm-girls-14','scy-men','scy-women','lcm-men','lcm-women']
const RECORDS_HERO_IMG = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/f3c1b432-f659-45a9-85b1-3ebc4b019133/AdobeStock_132941702.jpg'

export default function RecordsPage() {
  const [activeTab, setActiveTab] = useState('scy-boys-14')
  const table = RECORDS_TABLES[activeTab]

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header-bg" style={{ backgroundImage: `url(${RECORDS_HERO_IMG})` }} />
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="section-label">Program Records</p>
            <h1 className="page-title">Records</h1>
            <p style={{ color: 'var(--muted)', marginTop: '0.75rem', fontSize: '0.9rem' }}>
              All records were set under individual club teams and with Peak Aquatic Sports.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="page-section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          {/* All-Time Hero Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="section-label" style={{ marginBottom: '1.5rem' }}>All-Time Program Bests</p>
            <div className="records-hero-grid" style={{ marginBottom: '4rem' }}>
              {RECORDS_HERO.map((r, i) => (
                <div className="record-hero-card" key={i}>
                  {r.photo && (
                    <img
                      src={r.photo}
                      alt={r.swimmer}
                      style={{
                        width: 88,
                        height: 88,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        objectPosition: 'center 20%',
                        marginBottom: '0.75rem',
                        border: '2px solid var(--accent)',
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

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="records-tabs" style={{ flexWrap: 'wrap' }}>
              {TAB_KEYS.map(key => (
                <button
                  key={key}
                  className={`tab-btn${activeTab === key ? ' active' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  {RECORDS_TABLES[key].label}
                </button>
              ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="records-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>1st Place</th>
                    <th>Time</th>
                    <th>Year</th>
                    <th>2nd Place</th>
                    <th>Time</th>
                    <th>Year</th>
                    {table.threeCol && <><th>3rd Place</th><th>Time</th><th>Year</th></>}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, i) => {
                    const [event, n1,t1,y1, n2,t2,y2, n3,t3,y3] = row
                    return (
                      <tr key={i}>
                        <td>{event}</td>
                        <td className="rank-1">{n1}</td>
                        <td className="rank-1">{t1}</td>
                        <td>{y1}</td>
                        <td className="rank-2">{n2}</td>
                        <td>{t2}</td>
                        <td>{y2}</td>
                        {table.threeCol && (
                          <>
                            <td>{n3}</td>
                            <td style={{ color: 'var(--accent)', fontFamily: 'var(--serif)', fontWeight: 600 }}>{t3}</td>
                            <td>{y3}</td>
                          </>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
