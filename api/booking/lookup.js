import { listBookingsByEmail } from '../_lib/bookingStore.js'
import { sheetsLookup } from '../_lib/sheetsGateway.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' })
  const email = String(req.query.email || '')
  if (!email) return res.status(400).json({ success: false, error: 'Email is required.' })

  try {
    const proxy = await sheetsLookup(email)
    if (proxy?.success) return res.status(200).json(proxy)
  } catch {}

  const bookings = await listBookingsByEmail(email)
  return res.status(200).json({ success: true, bookings })
}
