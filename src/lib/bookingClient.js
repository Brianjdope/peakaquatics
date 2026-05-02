const SHEETS_API = 'https://script.google.com/macros/s/AKfycbxXftEZLmAm-vQ4MQi2GZgycipF-JXo4-ZdnxAWT8kuIojrhhvSyP9XjKJh9WzO3a4d/exec'

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

// Upload directly to Google Drive via resumable upload URL from Apps Script
function uploadToDrive(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4')

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(10 + Math.round((e.loaded / e.total) * 85))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ success: true })
      } else {
        reject(new Error(`Upload failed (${xhr.status})`))
      }
    }

    xhr.onerror = () => reject(new Error('Upload failed'))
    xhr.send(file)
  })
}

// Upload video — tries direct Google Drive upload first, falls back to base64 via Apps Script
export async function uploadVideo(fileName, bookingId, file, onProgress) {
  const MAX_DIRECT_SIZE = 200 * 1024 * 1024 // 200 MB via direct Google Drive upload
  const MAX_BASE64_SIZE = 35 * 1024 * 1024  // 35 MB via Apps Script base64 fallback

  if (file.size > MAX_DIRECT_SIZE) {
    return { success: false, error: 'Video must be under 200 MB. Please trim or compress it, or email it to peakaquaticsports@gmail.com.' }
  }

  // Try direct Google Drive upload via resumable upload URL
  try {
    if (onProgress) onProgress(5)

    const urlRes = await fetch(SHEETS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'getUploadUrl',
        fileName: `${bookingId}_${fileName}`,
        contentType: file.type || 'video/mp4',
        fileSize: file.size,
        bookingId,
      }),
    })
    const urlData = await readJson(urlRes)

    if (urlData.success && urlData.uploadUrl) {
      const result = await uploadToDrive(urlData.uploadUrl, file, onProgress)
      if (onProgress) onProgress(100)
      return result
    }
  } catch {
    // Direct upload failed — fall through to base64 fallback
  }

  // Fallback: base64 through Apps Script (only works for smaller files)
  if (file.size > MAX_BASE64_SIZE) {
    return { success: false, error: 'Video must be under 35 MB. Please trim or compress it, or email it to peakaquaticsports@gmail.com.' }
  }

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
