export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const bookingId = String(req.query.bookingId || '')
  const amount = Number(req.query.amount || 0)
  if (!bookingId || !amount) return res.status(400).json({ error: 'bookingId and amount required' })

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe is not configured.' })
  }

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const origin = process.env.APP_ORIGIN || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `Peak Session Booking (${bookingId})` },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId },
    success_url: `${origin}/?booking=paid&id=${bookingId}`,
    cancel_url: `${origin}/?booking=cancelled&id=${bookingId}`,
  })

  return res.redirect(303, session.url)
}
