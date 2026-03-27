const SHEETS_API = 'https://script.google.com/macros/s/AKfycbxG4F2UKEqaNEhydYqQRAw4z_Ys3mT8kt1ZdE0uuGe_F1yPoPBGZdSusAxwett649y4/exec'

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
  const body = {
    action: 'book',
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    session: payload.session,
    skillLevel: payload.skillLevel,
    date: payload.date,
    time: payload.time,
  }

  const res = await fetch(SHEETS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(body),
  })
  return readJson(res)
}

// Upload video as base64 through Apps Script → Google Drive
export async function uploadVideo(fileName, bookingId, file, onProgress) {
  const MAX_SIZE = 35 * 1024 * 1024 // 35 MB (becomes ~47MB as base64, within Apps Script limit)
  if (file.size > MAX_SIZE) {
    return { success: false, error: 'Video must be under 35 MB. Please trim or compress it, or email it to peakaquaticsports@gmail.com.' }
  }

  // Read file as base64
  if (onProgress) onProgress(5)
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 40))
    }
    reader.readAsDataURL(file)
  })

  if (onProgress) onProgress(50)

  // Send to Apps Script which saves to Google Drive
  const res = await fetch(SHEETS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: 'uploadVideo',
      fileName,
      bookingId,
      videoBase64: base64,
      contentType: file.type || 'video/mp4',
    }),
  })

  if (onProgress) onProgress(95)
  return readJson(res)
}
