import { createBookingRecord } from '../_lib/bookingStore.js'

const SESSION_PRICE_MAP = {
  'Intro Call': 1500,
  'Video Review': 4500,
  'Private Session': 12000,
  'Semi-Group': 9500,
  'Group Session': 8000,
  Dryland: 7000,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })
  const { name, email, phone, session, skillLevel, date, time } = req.body || {}
  if (!name || !email || !session || !date || !time) {
    return res.status(400).json({ success: false, error: 'Missing required booking fields.' })
  }

  const booking = await createBookingRecord({ name, email, phone, session, skillLevel, date, time })
  const amount = SESSION_PRICE_MAP[session] ?? 7500
  const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_FALLBACK_PRODUCT)

  if (!hasStripe) {
    return res.status(200).json({ success: true, bookingId: booking.bookingId, amount, paymentRequired: false })
  }

  const checkoutUrl = `/api/payments/checkout?bookingId=${encodeURIComponent(booking.bookingId)}&amount=${amount}`
  return res.status(200).json({ success: true, bookingId: booking.bookingId, paymentRequired: true, checkoutUrl })
}
