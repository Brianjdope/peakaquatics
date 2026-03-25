// ==========================================
// PASTE THIS INTO GOOGLE APPS SCRIPT
// (Extensions → Apps Script in your Google Sheet)
// ==========================================
//
// COLUMN LAYOUT:
// A: BookingID | B: Name | C: Session | D: Email | E: Date | F: Phone | G: Status
//
// ==========================================

var SHEET_NAME = 'Sheet1'
var PHIL_EMAIL = 'Philip.jkang@gmail.com'
var LOGO_URL = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/7fd6ea37-8f94-4626-ac71-1fe5e214471e/peak-aquatic-primary-logo-black.png'
var SITE_URL = 'https://brianjdope.github.io/peakaquatics1/'
var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrjipV5xZuIqxs24i_luWULoMSJNIrxlchsXxZTWn7OLWOXlA0w7Y3qGF03S8ZzFzW/exec'

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  var data = JSON.parse(e.postData.contents)

  if (data.action === 'book') {
    return handleBooking(sheet, data)
  } else if (data.action === 'cancel') {
    return handleCancellation(sheet, data)
  }

  return jsonResponse({ success: false, error: 'Invalid action' })
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  var action = e.parameter.action

  // NOTE: Cancellations are NOT allowed via GET requests.
  // Email security systems (Microsoft Defender, Proofpoint, etc.) auto-click
  // links in emails, which would trigger unwanted cancellations.
  // Cancellations must go through POST only (from the website cancel page).

  if (action === 'lookup') {
    return handleLookup(sheet, e.parameter.email)
  }

  return jsonResponse({ success: false, error: 'Invalid action' })
}

function handleBooking(sheet, data) {
  var bookingId = 'PAS-' + Math.random().toString(36).substring(2, 8).toUpperCase()
  var dateTime = data.date + ' at ' + data.time

  // A: BookingID | B: Name | C: Session | D: Email | E: Date | F: Phone | G: Status
  sheet.appendRow([
    bookingId,
    data.name,
    data.session,
    data.email,
    dateTime,
    data.phone || '',
    'Confirmed',
  ])

  // Color the new row green
  var lastRow = sheet.getLastRow()
  sheet.getRange(lastRow, 1, 1, 7).setBackground('#d9ead3')

  // Email Phil (plain text is fine for internal)
  MailApp.sendEmail(
    PHIL_EMAIL,
    'New Booking: ' + data.session + ' — ' + dateTime,
    'New booking request:\n\n' +
    'Booking ID: ' + bookingId + '\n' +
    'Session: ' + data.session + '\n' +
    'Date & Time: ' + dateTime + '\n\n' +
    'Client: ' + data.name + '\n' +
    'Email: ' + data.email + '\n' +
    'Phone: ' + (data.phone || 'Not provided') + '\n'
  )

  // Professional HTML confirmation email to client
  // Link to the website cancel page (NOT the API directly) to prevent
  // email security scanners from auto-cancelling bookings
  var cancelUrl = SITE_URL + '#cancel?id=' + bookingId + '&email=' + encodeURIComponent(data.email)

  var html = emailTemplate(
    'Booking Confirmed',
    'Hi ' + data.name + ',',
    'Your booking has been confirmed! Here are your details:',
    [
      { label: 'Session', value: data.session },
      { label: 'Date & Time', value: dateTime },
      { label: 'Booking ID', value: bookingId },
    ],
    [
      { url: cancelUrl, label: 'Cancel Booking', color: '#dc2626' },
      { url: SITE_URL, label: 'Visit Website', color: '#1a1a2e' },
    ],
    'Save your Booking ID to manage your appointment. If you have any questions, call us at 201-359-5688.'
  )

  MailApp.sendEmail({
    to: data.email,
    subject: 'Booking Confirmed — Peak Aquatic Sports',
    htmlBody: html,
    body: 'Booking Confirmed — ' + data.session + ' on ' + dateTime + '. Booking ID: ' + bookingId,
  })

  return jsonResponse({ success: true, bookingId: bookingId })
}

function parseBookingDate(dateStr) {
  // Parses "March 25, 2026 at 10:00 AM" into a Date object
  var parts = dateStr.toString().split(' at ')
  if (parts.length < 2) return null
  var d = new Date(parts[0])
  var timeParts = parts[1].match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (timeParts) {
    var hours = parseInt(timeParts[1])
    var mins = parseInt(timeParts[2])
    if (timeParts[3].toUpperCase() === 'PM' && hours !== 12) hours += 12
    if (timeParts[3].toUpperCase() === 'AM' && hours === 12) hours = 0
    d.setHours(hours, mins, 0, 0)
  }
  return d
}

function handleCancellation(sheet, data) {
  var rows = sheet.getDataRange().getValues()

  for (var i = 1; i < rows.length; i++) {
    // A (0) = BookingID, D (3) = Email, G (6) = Status
    if (rows[i][0] === data.bookingId && rows[i][3].toString().toLowerCase() === data.email.toLowerCase()) {
      // Check 24-hour cancellation policy
      var bookingDate = parseBookingDate(rows[i][4])
      if (bookingDate) {
        var hoursUntil = (bookingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60)
        if (hoursUntil < 24) {
          return jsonResponse({ success: false, error: 'Cannot cancel within 24 hours of your appointment. Please call 201-359-5688.' })
        }
      }

      // Set status to Cancelled (column G = 7th column)
      sheet.getRange(i + 1, 7).setValue('Cancelled')
      // Color the row red
      sheet.getRange(i + 1, 1, 1, 7).setBackground('#f4cccc')

      // Notify Phil
      MailApp.sendEmail(
        PHIL_EMAIL,
        'Booking Cancelled: ' + rows[i][0],
        'Booking ' + rows[i][0] + ' has been cancelled.\n\n' +
        'Client: ' + rows[i][1] + '\n' +
        'Session: ' + rows[i][2] + '\n' +
        'Date: ' + rows[i][4]
      )

      // Professional HTML cancellation email to client
      var html = emailTemplate(
        'Booking Cancelled',
        'Hi ' + rows[i][1] + ',',
        'Your booking has been cancelled. Here are the details:',
        [
          { label: 'Session', value: rows[i][2] },
          { label: 'Date & Time', value: rows[i][4] },
          { label: 'Booking ID', value: rows[i][0] },
        ],
        [
          { url: SITE_URL, label: 'Book Again', color: '#1a1a2e' },
        ],
        'If you did not request this cancellation, please call us immediately at 201-359-5688.'
      )

      MailApp.sendEmail({
        to: rows[i][3],
        subject: 'Booking Cancelled — Peak Aquatic Sports',
        htmlBody: html,
        body: 'Booking Cancelled — ' + rows[i][2] + ' on ' + rows[i][4] + '. Booking ID: ' + rows[i][0],
      })

      return jsonResponse({ success: true, message: 'Booking cancelled' })
    }
  }

  return jsonResponse({ success: false, error: 'Booking not found. Check your Booking ID and email.' })
}

function handleLookup(sheet, email) {
  var rows = sheet.getDataRange().getValues()
  var bookings = []

  for (var i = 1; i < rows.length; i++) {
    // D (3) = Email, G (6) = Status
    if (rows[i][3].toString().toLowerCase() === email.toLowerCase() && rows[i][6] === 'Confirmed') {
      bookings.push({
        bookingId: rows[i][0],
        session: rows[i][2],
        date: rows[i][4],
        time: '',
      })
    }
  }

  return jsonResponse({ success: true, bookings: bookings })
}

function emailTemplate(title, greeting, message, details, buttons, footer) {
  var detailRows = ''
  for (var i = 0; i < details.length; i++) {
    detailRows += '<tr>' +
      '<td style="padding:8px 12px;color:#6b7280;font-size:14px;border-bottom:1px solid #f3f4f6;">' + details[i].label + '</td>' +
      '<td style="padding:8px 12px;color:#111827;font-size:14px;font-weight:600;border-bottom:1px solid #f3f4f6;">' + details[i].value + '</td>' +
      '</tr>'
  }

  var buttonHtml = ''
  for (var j = 0; j < buttons.length; j++) {
    buttonHtml += '<a href="' + buttons[j].url + '" style="display:inline-block;background:' + buttons[j].color + ';color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;margin:0 8px 8px 0;">' + buttons[j].label + '</a>'
  }

  return '<!DOCTYPE html>' +
    '<html><head><meta charset="utf-8"></head>' +
    '<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,Helvetica,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">' +
    '<tr><td align="center">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">' +

    // Header
    '<tr><td style="background:#1a1a2e;padding:32px 40px;text-align:center;">' +
    '<img src="' + LOGO_URL + '" alt="Peak Aquatic Sports" width="60" style="display:block;margin:0 auto 12px;filter:invert(1)brightness(2);">' +
    '<h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">PEAK AQUATIC SPORTS</h1>' +
    '</td></tr>' +

    // Title bar
    '<tr><td style="background:' + (title === 'Booking Confirmed' ? '#059669' : '#dc2626') + ';padding:14px 40px;text-align:center;">' +
    '<span style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">' + title + '</span>' +
    '</td></tr>' +

    // Body
    '<tr><td style="padding:32px 40px;">' +
    '<p style="margin:0 0 8px;color:#111827;font-size:16px;font-weight:600;">' + greeting + '</p>' +
    '<p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">' + message + '</p>' +

    // Details table
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;margin-bottom:24px;">' +
    detailRows +
    '</table>' +

    // Buttons
    '<div style="text-align:center;padding:8px 0 16px;">' +
    buttonHtml +
    '</div>' +

    // Footer note
    '<p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">' + footer + '</p>' +
    '</td></tr>' +

    // Email footer
    '<tr><td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">' +
    '<p style="margin:0 0 4px;color:#6b7280;font-size:13px;font-weight:600;">Peak Aquatic Sports</p>' +
    '<p style="margin:0 0 4px;color:#9ca3af;font-size:12px;">Elite Swimming Coaching & Consulting</p>' +
    '<p style="margin:0 0 8px;color:#9ca3af;font-size:12px;">Ramsey, NJ &bull; 201-359-5688</p>' +
    '<p style="margin:0;color:#9ca3af;font-size:11px;">Instagram: <a href="https://instagram.com/philkangg" style="color:#6b7280;text-decoration:none;">@philkangg</a></p>' +
    '</td></tr>' +

    '</table>' +
    '</td></tr></table>' +
    '</body></html>'
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}
