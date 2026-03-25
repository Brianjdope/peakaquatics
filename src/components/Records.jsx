import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { RECORDS_HERO, RECORDS_TABLES } from '../data'
import { useInView } from '../hooks/useInView'

const TAB_KEYS = ['scy-men', 'scy-women', 'lcm-men', 'lcm-women']

export default function Records() {
  const [ref, inView] = useInView(0.1)
  const [activeTab, setActiveTab] = useState('scy-men')

  const table = RECORDS_TABLES[activeTab]

  return (
    <section className="records" id="records" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
        >
          <p className="section-label">Program Records</p>
          <h2>All-Time Bests</h2>
        </motion.div>

        {/* Hero Cards */}
        <motion.div
          className="records-hero-grid"
          style={{ marginTop: '2.5rem' }}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.95, delay: 0.15 }}
        >
          {RECORDS_HERO.map((r, i) => (
            <div className="record-hero-card" key={i}>
              <div className="record-badge">{r.badge}</div>
              <div className="record-time">{r.time}</div>
              <div className="record-event">{r.event}</div>
              <div className="record-swimmer">{r.swimmer}</div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.3 }}
          style={{ marginTop: '3rem' }}
        >
          <div className="records-tabs">
            {TAB_KEYS.map(key => (
              <button
                key={key}
                className={`tab-btn${activeTab === key ? ' active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {RECORDS_TABLES[key].label.replace(' — ', ' ')}
              </button>
            ))}
          </div>

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
                <th>3rd Place</th>
                <th>Time</th>
                <th>Year</th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map(([event, n1, t1, y1, n2, t2, y2, n3, t3, y3], i) => (
                <tr key={i}>
                  <td>{event}</td>
                  <td className="rank-1">{n1}</td>
                  <td className="rank-1">{t1}</td>
                  <td>{y1}</td>
                  <td className="rank-2">{n2}</td>
                  <td>{t2}</td>
                  <td>{y2}</td>
                  <td className="rank-3">{n3}</td>
                  <td>{t3}</td>
                  <td>{y3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  )
}
