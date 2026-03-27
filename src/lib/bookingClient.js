const SHEETS_API = 'https://script.google.com/macros/s/AKfycbx-uHBQCihrDhT5umH6yhM4S5pEgcqBpIJieuljItveEpgOiHg2XSWovk_UTd8dcAo-/exec'

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

// Step 1: Get a resumable upload URL from Apps Script
async function getUploadUrl(fileName, fileSize, contentType) {
  const res = await fetch(SHEETS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: 'uploadUrl',
      fileName,
      fileSize,
      contentType,
      origin: window.location.origin,
    }),
  })
  return readJson(res)
}

// Step 2: Upload file directly to Google Drive (browser → Drive, no size limit)
function uploadToDrive(uploadUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4')

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)) }
        catch { resolve({ id: null }) }
      } else {
        reject(new Error('Upload failed (status ' + xhr.status + ')'))
      }
    }

    xhr.onerror = () => reject(new Error('Upload network error'))
    xhr.send(file)
  })
}

// Step 3: Tell Apps Script to set sharing + notify coach
async function linkVideo(fileId, bookingId) {
  const res = await fetch(SHEETS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'linkVideo', fileId, bookingId }),
  })
  return readJson(res)
}

// Main upload function — direct browser-to-Drive, no file size limit
export async function uploadVideo(fileName, bookingId, file, onProgress) {
  // Step 1: Get upload URL from Apps Script
  if (onProgress) onProgress(0)
  const urlData = await getUploadUrl(fileName, file.size, file.type || 'video/mp4')
  if (!urlData.success) {
    return { success: false, error: urlData.error || 'Could not start upload.' }
  }

  // Step 2: Upload directly to Google Drive (with progress)
  const driveRes = await uploadToDrive(urlData.uploadUrl, file, onProgress)

  // Step 3: Set sharing + notify coach
  if (driveRes?.id) {
    const linked = await linkVideo(driveRes.id, bookingId)
    return { success: true, videoUrl: linked.videoUrl || '' }
  }

  return { success: true }
}
