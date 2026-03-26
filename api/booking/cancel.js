import { cancelBookingRecord } from '../_lib/bookingStore.js'
import { sheetsCancel } from '../_lib/sheetsGateway.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })
  const { bookingId, email } = req.body || {}
  if (!bookingId || !email) return res.status(400).json({ success: false, error: 'Booking ID and email are required.' })

  try {
    const proxy = await sheetsCancel(bookingId, email)
    if (proxy?.success) return res.status(200).json(proxy)
  } catch {}

  const cancelled = await cancelBookingRecord(bookingId, email)
  if (!cancelled) return res.status(404).json({ success: false, error: 'Booking not found.' })
  return res.status(200).json({ success: true, bookingId })
}
