import { listBookedTimes } from '../_lib/bookingStore.js'
import { sheetsAvailability } from '../_lib/sheetsGateway.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' })
  const date = String(req.query.date || '')
  const day = String(req.query.day || '')
  if (!date || !day) return res.status(400).json({ success: false, error: 'Date and day are required.' })

  try {
    const proxy = await sheetsAvailability(date, day)
    if (proxy?.success) return res.status(200).json(proxy)
  } catch {}

  const booked = await listBookedTimes(date)
  return res.status(200).json({ success: true, booked })
}
