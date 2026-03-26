import { getDb } from './firebaseAdmin.js'

const memory = { bookings: [] }
const COLLECTION = 'bookings'

function normalizeDate(date, time) {
  const base = date?.split(' at ')[0] || date || ''
  return `${base}${time ? ` at ${time}` : ''}`
}

function dateOnly(date) {
  return (date || '').split(' at ')[0]
}

export async function listBookingsByEmail(email) {
  const normalized = String(email).toLowerCase()
  const db = getDb()
  if (!db) {
    return memory.bookings.filter((b) => b.email.toLowerCase() === normalized && b.status !== 'cancelled')
  }
  const snap = await db
    .collection(COLLECTION)
    .where('emailLower', '==', normalized)
    .where('status', '!=', 'cancelled')
    .orderBy('status')
    .orderBy('createdAt', 'desc')
    .get()
  return snap.docs.map((doc) => doc.data())
}

export async function listBookedTimes(date) {
  const baseDate = dateOnly(date)
  const db = getDb()
  if (!db) {
    return memory.bookings.filter((b) => b.dateOnly === baseDate && b.status !== 'cancelled').map((b) => b.time)
  }
  const snap = await db
    .collection(COLLECTION)
    .where('dateOnly', '==', baseDate)
    .where('status', '!=', 'cancelled')
    .orderBy('status')
    .get()
  return snap.docs.map((doc) => doc.data().time).filter(Boolean)
}

export async function createBookingRecord(input) {
  const bookingId = `PK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const record = {
    bookingId,
    name: input.name,
    email: input.email,
    phone: input.phone || '',
    session: input.session,
    skillLevel: input.skillLevel || '',
    date: normalizeDate(input.date, input.time),
    dateOnly: dateOnly(input.date),
    time: input.time || '',
    emailLower: String(input.email).toLowerCase(),
    status: 'pending_payment',
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString(),
  }
  const db = getDb()
  if (db) {
    await db.collection(COLLECTION).doc(bookingId).set(record)
  } else {
    memory.bookings.push(record)
  }
  return record
}

export async function markBookingPaid(bookingId) {
  const db = getDb()
  if (db) {
    const ref = db.collection(COLLECTION).doc(bookingId)
    const doc = await ref.get()
    if (!doc.exists) return null
    await ref.update({ paymentStatus: 'paid', status: 'confirmed' })
    return { ...doc.data(), paymentStatus: 'paid', status: 'confirmed' }
  }
  const booking = memory.bookings.find((b) => b.bookingId === bookingId)
  if (!booking) return null
  booking.paymentStatus = 'paid'
  booking.status = 'confirmed'
  return booking
}

export async function cancelBookingRecord(bookingId, email) {
  const normalized = String(email).toLowerCase()
  const db = getDb()
  if (db) {
    const ref = db.collection(COLLECTION).doc(bookingId)
    const doc = await ref.get()
    if (!doc.exists) return null
    const data = doc.data()
    if (String(data.emailLower || '').toLowerCase() !== normalized) return null
    await ref.update({ status: 'cancelled' })
    return { ...data, status: 'cancelled' }
  }
  const booking = memory.bookings.find((b) => b.bookingId === bookingId && b.email.toLowerCase() === normalized)
  if (!booking) return null
  booking.status = 'cancelled'
  return booking
}
