import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SHEETS_API = 'https://script.google.com/macros/s/AKfycbwHsyLmVhtoHqSf0H7AUC1xKDurWrbJZWDwSq87azhcHSjAPp6cc8XPQQ-nGgF3JQCs/exec'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const SessionIcon = ({ id, color, size = 18 }) => {
  const icons = {
    intro: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    video: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
    private: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    semi: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    group: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        <circle cx="19" cy="11" r="2"/>
        <path d="M23 19v-1a2 2 0 0 0-2-2h-1"/>
      </svg>
    ),
    dryland: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
  }
  return icons[id] || null
}

const SESSION_TYPES = [
  { id: 'intro', label: 'Intro Call', duration: '15 min', color: '#4a9eff' },
  { id: 'video', label: 'Video Review', duration: '20 min', color: '#a78bfa' },
  { id: 'private', label: 'Private Session', duration: '1 hr', color: '#34d399' },
  { id: 'semi', label: 'Semi-Group', duration: '1.5 hr', color: '#fbbf24' },
  { id: 'group', label: 'Group Session', duration: '1.5 hr', color: '#f97316' },
  { id: 'dryland', label: 'Dryland', duration: '1 hr', color: '#ef4444' },
]

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']

function isWithin24Hours(dateStr) {
  // Parses "March 25, 2026 at 10:00 AM" or just "March 25, 2026"
  const parts = (dateStr || '').split(' at ')
  const d = new Date(parts[0])
  if (isNaN(d)) return false
  if (parts[1]) {
    const match = parts[1].match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (match) {
      let hrs = parseInt(match[1])
      const mins = parseInt(match[2])
      if (match[3].toUpperCase() === 'PM' && hrs !== 12) hrs += 12
      if (match[3].toUpperCase() === 'AM' && hrs === 12) hrs = 0
      d.setHours(hrs, mins, 0, 0)
    }
  }
  return (d.getTime() - Date.now()) < 24 * 60 * 60 * 1000
}

const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--text)',
  fontSize: '0.82rem',
  outline: 'none',
  boxSizing: 'border-box',
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

export default function BookingCalendar({ cancelParams, onCancelParamsUsed }) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [bookingId, setBookingId] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [skillLevel, setSkillLevel] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [bookedTimes, setBookedTimes] = useState([])
  const fileRef = useRef()

  // Cancellation state
  const [mode, setMode] = useState('book') // 'book' or 'cancel'
  const [cancelEmail, setCancelEmail] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [bookings, setBookings] = useState([])
  const [lookupDone, setLookupDone] = useState(false)
  const [cancellingId, setCancellingId] = useState('')
  const [cancelSuccess, setCancelSuccess] = useState('')

  // Handle cancel link from confirmation email — auto-cancel immediately
  useEffect(() => {
    if (cancelParams?.bookingId && cancelParams?.email) {
      setMode('cancel')
      setCancelEmail(cancelParams.email)
      setCancellingId(cancelParams.bookingId)
      onCancelParamsUsed?.()
      setTimeout(async () => {
        setError('')
        setCancelSuccess('')
        try {
          const res = await fetch(SHEETS_API, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              action: 'cancel',
              bookingId: cancelParams.bookingId,
              email: cancelParams.email,
            }),
          })
          const data = await res.json()
          if (data.success) {
            setCancelSuccess(cancelParams.bookingId)
          } else {
            setError(data.error || 'Cancellation failed.')
          }
        } catch {
          setError('Could not connect to booking system. Please try again.')
        }
        setCancellingId('')
      }, 100)
    }
  }, [cancelParams])

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const isToday = (day) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

  const isPast = (day) => {
    const d = new Date(currentYear, currentMonth, day)
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return d < t
  }

  const isWeekend = (day) => {
    const d = new Date(currentYear, currentMonth, day).getDay()
    return d === 0 || d === 6
  }

  const sendEmailFallback = () => {
    const subject = encodeURIComponent(`New Booking: ${sessionObj?.label} — ${dateStr} at ${selectedTime}`)
    const body = encodeURIComponent(
      `New booking request:\n\nSession: ${sessionObj?.label} (${sessionObj?.duration})\nDate: ${dateStr}\nTime: ${selectedTime}\n\nClient: ${clientName}\nEmail: ${clientEmail}\nPhone: ${clientPhone || 'Not provided'}\n`
    )
    window.open(`mailto:peakaquaticsports@gmail.com?subject=${subject}&body=${body}`, '_blank')
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    setError('')

    if (SHEETS_API) {
      try {
        const res = await fetch(SHEETS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'book',
            name: clientName,
            email: clientEmail,
            phone: clientPhone,
            session: sessionObj?.label,
            skillLevel: skillLevel,
            date: dateStr,
            time: selectedTime,
          }),
        })
        const text = await res.text()
        try {
          const data = JSON.parse(text)
          if (data.success) {
            setBookingId(data.bookingId)
            setConfirmed(true)
          } else {
            setError(data.error || 'Booking failed. Please try again.')
          }
        } catch {
          // API returned non-JSON (likely HTML error page) — fall back to email
          sendEmailFallback()
          setConfirmed(true)
        }
      } catch {
        // API failed — fall back to email
        sendEmailFallback()
        setConfirmed(true)
      }
    } else {
      sendEmailFallback()
      setConfirmed(true)
    }
    setSubmitting(false)
  }

  const handleLookup = async () => {
    if (!cancelEmail) return
    setLookupLoading(true)
    setError('')
    setBookings([])
    setLookupDone(false)
    setCancelSuccess('')

    if (!SHEETS_API) {
      setError('To cancel a booking, please email peakaquaticsports@gmail.com or call 201-359-5688.')
      setLookupLoading(false)
      return
    }

    try {
      const res = await fetch(`${SHEETS_API}?action=lookup&email=${encodeURIComponent(cancelEmail)}`)
      const text = await res.text()
      try {
        const data = JSON.parse(text)
        if (data.success) {
          setBookings(data.bookings || [])
          setLookupDone(true)
        } else {
          setError(data.error || 'Lookup failed.')
        }
      } catch {
        setError('To cancel a booking, please email peakaquaticsports@gmail.com or call 201-359-5688.')
      }
    } catch {
      setError('To cancel a booking, please email peakaquaticsports@gmail.com or call 201-359-5688.')
    }
    setLookupLoading(false)
  }

  const handleCancel = async (id) => {
    setCancellingId(id)
    setError('')
    setCancelSuccess('')

    try {
      const res = await fetch(SHEETS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'cancel',
          bookingId: id,
          email: cancelEmail,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCancelSuccess(id)
        setBookings(prev => prev.filter(b => b.bookingId !== id))
      } else {
        setError(data.error || 'Cancellation failed.')
      }
    } catch {
      setError('Could not connect to booking system. Please try again.')
    }
    setCancellingId('')
  }

  const sessionObj = SESSION_TYPES.find(s => s.id === selectedSession)
  const dateStr = selectedDate ? `${MONTHS[currentMonth]} ${selectedDate}, ${currentYear}` : ''

  if (confirmed) {
    const isVideo = selectedSession === 'video'
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '2.5rem 2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>&#10003;</div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
          {bookingId ? 'Booking Confirmed' : 'Booking Request Sent'}
        </h3>
        {bookingId && (
          <p style={{
            color: sessionObj?.color || 'var(--text)',
            fontSize: '0.9rem',
            fontWeight: 600,
            fontFamily: 'monospace',
            letterSpacing: '1px',
            marginBottom: '0.75rem',
          }}>
            {bookingId}
          </p>
        )}
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 340, margin: '0 auto 1.5rem' }}>
          {sessionObj?.label} on {dateStr} at {selectedTime}.
          {bookingId
            ? ' A confirmation email has been sent. Save your booking ID to manage your appointment.'
            : " We'll confirm via email within 24 hours."
          }
        </p>

        {isVideo && (
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '1.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Upload Your Video
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '0.78rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Attach your stroke or race video so Coach Phil can annotate it before your review call.
            </p>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed var(--border2)',
                borderRadius: 8,
                padding: '1.5rem 1rem',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#a78bfa'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
            >
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <p style={{ color: videoFile ? 'var(--text)' : 'var(--muted)', fontSize: '0.82rem' }}>
                {videoFile ? videoFile.name : 'Click to upload video (MP4, MOV)'}
              </p>
              <p style={{ color: 'var(--muted)', fontSize: '0.7rem', marginTop: '0.4rem' }}>Max 200MB · 30–60 seconds ideal</p>
            </div>
            {videoFile && (
              <p style={{ color: '#a78bfa', fontSize: '0.78rem', marginTop: '0.75rem' }}>
                Video attached — we'll review it before your call.
              </p>
            )}
          </div>
        )}

        <p style={{ color: 'var(--muted)', fontSize: '0.72rem', lineHeight: 1.6, maxWidth: 300, margin: '0 auto 1.25rem' }}>
          To cancel or reschedule, use the{' '}
          <span
            onClick={() => { setConfirmed(false); setMode('cancel'); setCancelEmail(clientEmail) }}
            style={{ color: 'var(--text)', textDecoration: 'underline', cursor: 'pointer' }}
          >Cancel Booking</span>
          {' '}tab below, or call <a href="tel:+12013595688" style={{ color: 'var(--text)', textDecoration: 'underline' }}>201-359-5688</a>.
        </p>

        <button
          onClick={() => { setConfirmed(false); setBookingId(''); setSelectedDate(null); setSelectedTime(null); setSelectedSession(null); setVideoFile(null); setClientName(''); setClientEmail(''); setClientPhone(''); setError('') }}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            color: 'var(--muted)',
            padding: '0.5rem 1.25rem',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          Book Another
        </button>
      </motion.div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg)', borderRadius: 8, padding: '0.2rem' }}>
        {[
          { key: 'book', label: 'Book Session' },
          { key: 'cancel', label: 'Cancel Booking' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setMode(tab.key); setError('') }}
            style={{
              flex: 1,
              background: mode === tab.key ? 'var(--surface2)' : 'transparent',
              color: mode === tab.key ? 'var(--text)' : 'var(--muted)',
              border: mode === tab.key ? '1px solid var(--border)' : '1px solid transparent',
              borderRadius: 6,
              padding: '0.55rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8,
          padding: '0.6rem 0.85rem',
          color: '#f87171',
          fontSize: '0.8rem',
        }}>
          {error}
        </div>
      )}

      {/* Cancel mode */}
      {mode === 'cancel' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>
            Enter the email you used when booking to look up your appointments.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="email"
              placeholder="Email address"
              value={cancelEmail}
              onChange={e => setCancelEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={handleLookup}
              disabled={!cancelEmail || lookupLoading}
              style={{
                background: cancelEmail ? 'var(--text)' : 'rgba(255,255,255,0.1)',
                color: cancelEmail ? '#000' : 'var(--muted)',
                border: 'none',
                borderRadius: 6,
                padding: '0.6rem 1.25rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: cancelEmail ? 'pointer' : 'default',
                whiteSpace: 'nowrap',
                opacity: lookupLoading ? 0.6 : 1,
              }}
            >
              {lookupLoading ? 'Searching...' : 'Look Up'}
            </button>
          </div>

          {cancelSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: 'rgba(52,211,153,0.1)',
                border: '1px solid rgba(52,211,153,0.3)',
                borderRadius: 8,
                padding: '0.75rem 1rem',
                color: '#34d399',
                fontSize: '0.82rem',
                textAlign: 'center',
              }}
            >
              Booking {cancelSuccess} has been cancelled. A confirmation email has been sent.
            </motion.div>
          )}

          {lookupDone && bookings.length === 0 && !cancelSuccess && (
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem', textAlign: 'center', padding: '1rem 0' }}>
              No active bookings found for this email.
            </p>
          )}

          {bookings.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{
                color: 'var(--muted)',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}>
                Your bookings ({bookings.length})
              </p>
              {bookings.map(b => {
                const tooLate = isWithin24Hours(b.date)
                return (
                <div
                  key={b.bookingId}
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: 'var(--text)', fontSize: '0.82rem', fontWeight: 500 }}>
                      {b.session}
                    </p>
                    <p style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>
                      {b.date}{b.time ? ` at ${b.time}` : ''}
                    </p>
                    <p style={{ color: 'var(--muted)', fontSize: '0.68rem', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                      {b.bookingId}
                    </p>
                  </div>
                  {tooLate ? (
                    <span style={{
                      color: 'var(--muted)',
                      fontSize: '0.68rem',
                      textAlign: 'right',
                      flexShrink: 0,
                      maxWidth: 100,
                      lineHeight: 1.4,
                    }}>
                      Within 24hrs — call to cancel
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCancel(b.bookingId)}
                      disabled={cancellingId === b.bookingId}
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        color: '#f87171',
                        border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: 6,
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: cancellingId === b.bookingId ? 'default' : 'pointer',
                        whiteSpace: 'nowrap',
                        opacity: cancellingId === b.bookingId ? 0.6 : 1,
                        transition: 'all 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      {cancellingId === b.bookingId ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
                )
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Book mode */}
      {mode === 'book' && <>
      {/* Session type selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
        {SESSION_TYPES.map((s, i) => {
          const isSelected = selectedSession === s.id
          return (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              whileHover={{ scale: 1.03, borderColor: s.color }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedSession(s.id)}
              style={{
                background: isSelected ? `${s.color}12` : 'transparent',
                border: `1px solid ${isSelected ? s.color : 'var(--border)'}`,
                borderRadius: 10,
                padding: '0.7rem 0.8rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.25s, box-shadow 0.25s',
                boxShadow: isSelected ? `0 0 12px ${s.color}20` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <motion.span
                  animate={isSelected ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}
                >
                  <SessionIcon id={s.id} color={isSelected ? s.color : 'var(--muted)'} size={16} />
                </motion.span>
                <span style={{ color: 'var(--text)', fontSize: '0.82rem', fontWeight: 500 }}>{s.label}</span>
              </div>
              <span style={{ color: 'var(--muted)', fontSize: '0.7rem', marginLeft: '1.55rem' }}>{s.duration}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Calendar */}
      <div style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '1rem',
        overflow: 'hidden',
      }}>
        {/* Month nav */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          padding: '0 0.25rem',
        }}>
          <button onClick={prevMonth} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            cursor: 'pointer', fontSize: '1rem', padding: '0.25rem 0.5rem',
            borderRadius: 4, transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >&#8249;</button>
          <span style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 600 }}>
            {MONTHS[currentMonth]} {currentYear}
          </span>
          <button onClick={nextMonth} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            cursor: 'pointer', fontSize: '1rem', padding: '0.25rem 0.5rem',
            borderRadius: 4, transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >&#8250;</button>
        </div>

        {/* Day headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0,
          marginBottom: '0.25rem',
        }}>
          {DAYS.map(d => (
            <div key={d} style={{
              textAlign: 'center',
              color: 'var(--muted)',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              padding: '0.25rem 0',
              textTransform: 'uppercase',
            }}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px',
        }}>
          {/* Empty cells for offset */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} style={{ aspectRatio: '1', padding: '0.2rem' }} />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const past = isPast(day)
            const weekend = isWeekend(day)
            const todayDay = isToday(day)
            const selected = selectedDate === day
            const disabled = past || weekend

            return (
              <button
                key={day}
                disabled={disabled}
                onClick={() => {
                  setSelectedDate(day)
                  setSelectedTime(null)
                  setBookedTimes([])
                  if (SHEETS_API) {
                    const dateStr = `${MONTHS[currentMonth]} ${day}, ${currentYear}`
                    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date(currentYear, currentMonth, day).getDay()]
                    fetch(`${SHEETS_API}?action=available&date=${encodeURIComponent(dateStr)}&day=${encodeURIComponent(dayName)}`)
                      .then(r => r.json())
                      .then(d => { if (d.success) setBookedTimes(d.booked || []) })
                      .catch(() => {})
                  }
                }}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: selected
                    ? (sessionObj?.color || 'var(--text)')
                    : todayDay
                      ? 'rgba(255,255,255,0.06)'
                      : 'transparent',
                  color: selected
                    ? '#000'
                    : disabled
                      ? 'rgba(255,255,255,0.12)'
                      : 'var(--text)',
                  border: todayDay && !selected ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: selected || todayDay ? 600 : 400,
                  cursor: disabled ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                  padding: 0,
                }}
                onMouseEnter={e => {
                  if (!disabled && !selected) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }}
                onMouseLeave={e => {
                  if (!disabled && !selected) e.currentTarget.style.background = todayDay ? 'rgba(255,255,255,0.06)' : 'transparent'
                }}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      <AnimatePresence>
        {selectedDate && selectedSession && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              color: 'var(--muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}>
              Available times — {MONTHS[currentMonth]} {selectedDate}
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.4rem',
            }}>
              {TIME_SLOTS.filter(t => !bookedTimes.includes(t)).map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  style={{
                    background: selectedTime === t ? (sessionObj?.color || 'var(--text)') : 'var(--surface2)',
                    color: selectedTime === t ? '#000' : 'var(--text)',
                    border: `1px solid ${selectedTime === t ? 'transparent' : 'var(--border)'}`,
                    borderRadius: 6,
                    padding: '0.5rem 0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (selectedTime !== t) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                  }}
                  onMouseLeave={e => {
                    if (selectedTime !== t) e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact info + Confirm */}
      <AnimatePresence>
        {selectedDate && selectedSession && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <div style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '0.75rem 1rem',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: sessionObj?.color,
                flexShrink: 0,
              }} />
              <div>
                <p style={{ color: 'var(--text)', fontSize: '0.82rem', fontWeight: 500 }}>
                  {sessionObj?.label} — {sessionObj?.duration}
                </p>
                <p style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>
                  {dateStr} at {selectedTime}
                </p>
              </div>
            </div>

            {/* Contact fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                type="text"
                placeholder="Your name"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  color: 'var(--text)',
                  fontSize: '0.82rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <input
                type="email"
                placeholder="Email address"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  color: 'var(--text)',
                  fontSize: '0.82rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  color: 'var(--text)',
                  fontSize: '0.82rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Skill level */}
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.72rem', marginBottom: '0.4rem' }}>Skill Level (optional)</p>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {[
                  { label: 'Novice',       color: '#34d399' },
                  { label: 'Intermediate', color: '#fbbf24' },
                  { label: 'Advanced',     color: '#ef4444' },
                ].map(({ label, color }) => (
                  <button
                    key={label}
                    onClick={() => setSkillLevel(skillLevel === label ? '' : label)}
                    style={{
                      flex: 1,
                      background: skillLevel === label ? color : 'var(--surface2)',
                      color: skillLevel === label ? '#000' : 'var(--muted)',
                      border: `1px solid ${skillLevel === label ? color : 'var(--border)'}`,
                      borderRadius: 6,
                      padding: '0.45rem 0.25rem',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={!clientName || !clientEmail || submitting}
              style={{
                width: '100%',
                background: clientName && clientEmail ? (sessionObj?.color || 'var(--text)') : 'rgba(255,255,255,0.1)',
                color: clientName && clientEmail ? '#000' : 'var(--muted)',
                border: 'none',
                borderRadius: 8,
                padding: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: clientName && clientEmail && !submitting ? 'pointer' : 'default',
                transition: 'opacity 0.2s',
                opacity: submitting ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (clientName && clientEmail && !submitting) e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!selectedSession && (
        <p style={{ color: 'var(--muted)', fontSize: '0.72rem', textAlign: 'center' }}>
          Select a session type, then pick a date and time.
        </p>
      )}
      </>}
    </div>
  )
}
