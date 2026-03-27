const SHEETS_API = 'https://script.google.com/macros/s/AKfycbxBoKfdZks4JK_Gm8N8JG2dVgroi1QTzfC1eYlp6bC0pGKg-SPS7td1-rN8U_LNa20m/exec'

const FALLBACK_MSG = 'Booking server is unavailable. Please email peakaquaticsports@gmail.com or call 201-359-5688.'

async function readJson(res) {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    if (text.includes('<html') || text.includes('<!DOCTYPE') || text.includes('Not Allowed')) {
      return { success: false, error: FALLBACK_MSG }
    }
    return { success: false, error: text || 'Unexpected server response.' }
  }
}

export async function fetchAvailability(date, day) {
  const params = new URLSearchParams({ action: 'available', date, day })
  const res = await fetch(`${SHEETS_API}?${params.toString()}`)
  return readJson(res)
}

export async function lookupBookings(email) {
  const params = new URLSearchParams({ action: 'lookup', email })
  const res = await fetch(`${SHEETS_API}?${params.toString()}`)
  return readJson(res)
}

export async function cancelBooking(bookingId, email) {
  const res = await fetch(SHEETS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'cancel', bookingId, email }),
  })
  return readJson(res)
}

export async function createBooking(payload) {
  const res = await fetch(SHEETS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: 'book',
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      session: payload.session,
      skillLevel: payload.skillLevel,
      date: payload.date,
      time: payload.time,
    }),
  })
  return readJson(res)
}
