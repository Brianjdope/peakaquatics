const SHEETS_API = process.env.BOOKING_SHEETS_API || ''

async function parse(res) {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return { success: false, error: text || 'Unexpected Sheets response.' }
  }
}

export async function sheetsAvailability(date, day) {
  if (!SHEETS_API) return null
  const params = new URLSearchParams({ action: 'available', date, day })
  const res = await fetch(`${SHEETS_API}?${params.toString()}`)
  return parse(res)
}

export async function sheetsLookup(email) {
  if (!SHEETS_API) return null
  const params = new URLSearchParams({ action: 'lookup', email })
  const res = await fetch(`${SHEETS_API}?${params.toString()}`)
  return parse(res)
}

export async function sheetsCancel(bookingId, email) {
  if (!SHEETS_API) return null
  const res = await fetch(SHEETS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'cancel', bookingId, email }),
  })
  return parse(res)
}
