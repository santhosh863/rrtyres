// ============================================================
// RR Tyres — Google Apps Script (Smart Booking + Auto Email)
// WITH DEDUPLICATION — prevents duplicate entries
// ============================================================
// SETUP:
// 1. Go to https://script.google.com → New Project
// 2. Paste this entire code
// 3. Replace SHEET_ID below with your Google Sheet ID
// 4. Deploy → New Deployment → Web app → Anyone → Deploy
// 5. Copy the URL into your website's config.js
// ============================================================

const SHEET_ID = '1EEyjeoXzILPk5axyJwLaq-XxN1lj4Dbr0gnuPtazq6c';

const TABS = {
  enquiries: 'Enquiries',
  appointments: 'Appointments',
  orders: 'Orders'
};

// SETTINGS
const SHOP_EMAIL = 'santhoshlives7641@gmail.com';
const SHOP_NAME = 'RR Tyres';
const SHOP_PHONE = '9445209525';
const CALLMEBOT_API_KEY = 'YOUR_API_KEY_HERE'; // <-- REPLACE THIS WITH YOUR 6-DIGIT API KEY
const MAX_PER_SLOT = 2; // Allow 2 bookings per time slot
const DEDUP_WINDOW_MS = 5 * 60 * 1000;

// ===== MAIN (GET — avoids CORS issues) =====
function doGet(e) {
  try {
    const data = JSON.parse(e.parameter.data);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    switch (data.type) {
      case 'enquiry':  return handleEnquiry(ss, data, timestamp);
      case 'appointment': return handleAppointment(ss, data, timestamp);
      case 'order':    return handleOrder(ss, data, timestamp);
      default: return jsonResponse({ status: 'error', message: 'Unknown type' });
    }
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() });
  }
}

// ===== MAIN (POST — fallback) =====
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    switch (data.type) {
      case 'enquiry':  return handleEnquiry(ss, data, timestamp);
      case 'appointment': return handleAppointment(ss, data, timestamp);
      case 'order':    return handleOrder(ss, data, timestamp);
      default: return jsonResponse({ status: 'error', message: 'Unknown type' });
    }
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() });
  }
}



// ===== DEDUPLICATION HELPER =====
// Checks if a matching row exists within the time window
function isDuplicateEntry(sheet, matchColumns, matchValues, timeColIndex) {
  if (!sheet || sheet.getLastRow() <= 1) return false;

  const allData = sheet.getDataRange().getValues();
  const now = new Date();

  for (let i = allData.length - 1; i >= 1; i--) {
    const row = allData[i];

    // Check time window (if timeColIndex provided)
    if (timeColIndex !== undefined && timeColIndex >= 0) {
      const rowTime = new Date(row[timeColIndex]);
      if (isNaN(rowTime.getTime())) continue;
      if ((now.getTime() - rowTime.getTime()) > DEDUP_WINDOW_MS) {
        // Past the dedup window — no need to check older rows
        break;
      }
    }

    // Check if all match columns have the same values
    let isMatch = true;
    for (let j = 0; j < matchColumns.length; j++) {
      if (String(row[matchColumns[j]]).trim().toLowerCase() !== String(matchValues[j]).trim().toLowerCase()) {
        isMatch = false;
        break;
      }
    }

    if (isMatch) return true;
  }

  return false;
}


// ===== ENQUIRY =====
function handleEnquiry(ss, data, timestamp) {
  const sheet = getOrCreateSheet(ss, TABS.enquiries,
    ['Date/Time', 'Name', 'Phone', 'Email', 'Service', 'Message', 'Source'], '#e8f5e9');

  // DEDUP CHECK: same name + phone + message within 5 minutes
  const isDupe = isDuplicateEntry(sheet,
    [1, 2, 5],  // columns: Name(1), Phone(2), Message(5)
    [data.name || '', data.phone || '', data.message || ''],
    0  // time column: Date/Time(0)
  );

  if (isDupe) {
    return jsonResponse({ status: 'duplicate', message: 'This enquiry was already submitted.' });
  }

  sheet.appendRow([timestamp, data.name||'', data.phone||'', data.email||'',
    data.service||'', data.message||'', data.source||'Website']);

  // Notify shop owner
  try {
    MailApp.sendEmail({
      to: SHOP_EMAIL,
      subject: '💬 New Enquiry — ' + (data.name || 'Website'),
      htmlBody: buildNotificationEmail('enquiry', data, timestamp)
    });
  } catch(e) {}

  sendWhatsAppNotification('enquiry', data, timestamp);

  return jsonResponse({ status: 'success', message: 'Enquiry saved' });
}

// ===== ORDER =====
function handleOrder(ss, data, timestamp) {
  const sheet = getOrCreateSheet(ss, TABS.orders,
    ['Date/Time', 'Name', 'Phone', 'Vehicle', 'Tyre Size', 'Tool Used', 'Source'], '#fce4ec');

  // DEDUP CHECK: same name + phone + vehicle + tyre size within 5 minutes
  const isDupe = isDuplicateEntry(sheet,
    [1, 2, 3, 4],  // columns: Name(1), Phone(2), Vehicle(3), Tyre Size(4)
    [data.name || '', data.phone || '', data.vehicle || '', data.tyreSize || ''],
    0  // time column: Date/Time(0)
  );

  if (isDupe) {
    return jsonResponse({ status: 'duplicate', message: 'This order was already submitted.' });
  }

  sheet.appendRow([timestamp, data.name||'', data.phone||'', data.vehicle||'',
    data.tyreSize||'', data.toolUsed||'Size Finder', 'Website']);

  // Notify shop
  try {
    MailApp.sendEmail({
      to: SHOP_EMAIL,
      subject: '🛒 New Tyre Order — ' + (data.vehicle || 'Customer'),
      htmlBody: buildNotificationEmail('order', data, timestamp)
    });
  } catch(e) {}

  sendWhatsAppNotification('order', data, timestamp);

  return jsonResponse({ status: 'success', message: 'Order saved' });
}

// ===== SMART APPOINTMENT =====
function handleAppointment(ss, data, timestamp) {
  const sheet = getOrCreateSheet(ss, TABS.appointments,
    ['Date/Time Booked', 'Name', 'Phone', 'Email', 'Appt Date', 'Appt Time',
     'Service', 'Shop', 'Vehicle', 'Status', 'Confirmation'], '#e3f2fd');

  const reqDate = String(data.date || '').trim();
  const reqTime = String(data.time || '').trim();
  const reqShop = String(data.shop || '').trim();
  const custEmail = data.email || '';

  // Check existing appointments
  const allData = sheet.getDataRange().getValues();
  const existing = allData.slice(1);

  // DEDUP CHECK: same name + phone + date + time + shop (no time window — exact slot match)
  for (let i = 0; i < existing.length; i++) {
    const row = existing[i];
    if (
      String(row[1]).trim().toLowerCase() === String(data.name || '').trim().toLowerCase() &&
      String(row[2]).trim().toLowerCase() === String(data.phone || '').trim().toLowerCase() &&
      String(row[4]).trim() === reqDate &&
      String(row[5]).trim() === reqTime &&
      String(row[7]).trim() === reqShop &&
      String(row[9]).trim() !== 'Cancelled'
    ) {
      return jsonResponse({
        status: 'duplicate',
        message: 'This appointment was already booked.',
        confirmationId: String(row[10] || '')
      });
    }
  }

  // Count slot occupancy
  let slotCount = 0;
  existing.forEach(function(row) {
    if (String(row[4]).trim() == reqDate && String(row[5]).trim() == reqTime && String(row[7]).trim() == reqShop && String(row[9]).trim() !== 'Cancelled') {
      slotCount++;
    }
  });

  // FULL — suggest alternative
  if (slotCount >= MAX_PER_SLOT) {
    const nextSlot = findNextAvailableSlot(existing, reqDate, reqShop, reqTime);
    return jsonResponse({
      status: 'slot_full',
      message: 'This slot is full at ' + reqShop,
      currentCount: slotCount,
      maxPerSlot: MAX_PER_SLOT,
      nextAvailable: nextSlot.time,
      nextDate: nextSlot.date,
      sameDay: nextSlot.sameDay
    });
  }

  // Count day total
  let dayCount = 0;
  existing.forEach(function(row) {
    if (String(row[4]).trim() == reqDate && String(row[7]).trim() == reqShop && String(row[9]).trim() !== 'Cancelled') dayCount++;
  });
  const isImmediate = (dayCount === 0);

  // SAVE
  const confirmationId = 'RRT-' + Date.now().toString(36).toUpperCase();

  sheet.appendRow([
    timestamp, data.name||'', data.phone||'', custEmail,
    reqDate, reqTime, data.service||'', reqShop,
    data.vehicle||'', 'Confirmed', confirmationId
  ]);

  // Style the row
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 10).setBackground('#c8e6c9').setFontWeight('bold');
  sheet.getRange(lastRow, 11).setFontWeight('bold').setFontColor('#1565c0');

  // ✉️ AUTO-SEND CONFIRMATION EMAIL TO CUSTOMER
  if (custEmail) {
    try {
      MailApp.sendEmail({
        to: custEmail,
        subject: '✅ Appointment Confirmed — ' + SHOP_NAME + ' (' + confirmationId + ')',
        htmlBody: buildConfirmationEmail(data, confirmationId, isImmediate)
      });
    } catch(e) {
      Logger.log('Email to customer failed: ' + e.toString());
    }
  }

  // 📧 NOTIFY SHOP OWNER
  try {
    MailApp.sendEmail({
      to: SHOP_EMAIL,
      subject: '📅 New Appointment — ' + (data.name || 'Customer') + ' at ' + reqTime,
      htmlBody: buildNotificationEmail('appointment', data, timestamp, confirmationId)
    });
  } catch(e) {}

  sendWhatsAppNotification('appointment', data, timestamp, confirmationId);

  return jsonResponse({
    status: 'confirmed',
    message: isImmediate
      ? 'No queue! Appointment confirmed. You can come directly.'
      : 'Appointment confirmed! We will be ready for you.',
    confirmationId: confirmationId,
    immediate: isImmediate,
    currentCount: slotCount + 1,
    maxPerSlot: MAX_PER_SLOT,
    emailSent: !!custEmail
  });
}

// ===== CONFIRMATION EMAIL TO CUSTOMER =====
function buildConfirmationEmail(data, confirmId, isImmediate) {
  return `
  <div style="font-family:'Segoe UI',Arial,sans-serif; max-width:600px; margin:0 auto; background:#f8f9fa; border-radius:16px; overflow:hidden;">
    <div style="background:linear-gradient(135deg,#1a1a2e,#16213e); padding:32px; text-align:center;">
      <h1 style="color:#7ed348; margin:0; font-size:28px;">✅ Appointment Confirmed!</h1>
      <p style="color:#a0aec0; margin:8px 0 0; font-size:15px;">${SHOP_NAME} — Chennai</p>
    </div>
    <div style="padding:32px;">
      <div style="background:#fff; border-radius:12px; padding:24px; border-left:4px solid #7ed348;">
        <h3 style="margin:0 0 16px; color:#1a1a2e;">Booking Details</h3>
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style="padding:8px 0; color:#666; width:140px;">📋 Confirmation</td><td style="padding:8px 0; font-weight:700; color:#1a1a2e; font-size:16px;">${confirmId}</td></tr>
          <tr><td style="padding:8px 0; color:#666;">👤 Name</td><td style="padding:8px 0; color:#1a1a2e;">${data.name || ''}</td></tr>
          <tr><td style="padding:8px 0; color:#666;">📞 Phone</td><td style="padding:8px 0; color:#1a1a2e;">${data.phone || ''}</td></tr>
          <tr><td style="padding:8px 0; color:#666;">📅 Date</td><td style="padding:8px 0; font-weight:600; color:#1a1a2e;">${data.date || ''}</td></tr>
          <tr><td style="padding:8px 0; color:#666;">⏰ Time</td><td style="padding:8px 0; font-weight:600; color:#1a1a2e;">${data.time || ''}</td></tr>
          <tr><td style="padding:8px 0; color:#666;">🔧 Service</td><td style="padding:8px 0; color:#1a1a2e;">${data.service || ''}</td></tr>
          <tr><td style="padding:8px 0; color:#666;">📍 Shop</td><td style="padding:8px 0; color:#1a1a2e;">${data.shop || ''}</td></tr>
          ${data.vehicle ? '<tr><td style="padding:8px 0; color:#666;">🏍️ Vehicle</td><td style="padding:8px 0; color:#1a1a2e;">' + data.vehicle + '</td></tr>' : ''}
        </table>
      </div>

      ${isImmediate ? '<div style="background:#e8f5e9; border-radius:10px; padding:16px; margin-top:20px; text-align:center;"><p style="margin:0; color:#2e7d32; font-weight:600; font-size:15px;">🟢 No queue right now! You can come directly.</p></div>' : ''}

      <div style="background:#fff3e0; border-radius:10px; padding:16px; margin-top:20px;">
        <p style="margin:0; color:#e65100; font-size:14px;">
          <strong>📌 Important:</strong> Please save this confirmation ID. Show it when you arrive at the shop.
          If you need to cancel, call us at <strong>${SHOP_PHONE}</strong> or WhatsApp us.
        </p>
      </div>

      <div style="text-align:center; margin-top:24px;">
        <a href="https://wa.me/919445209525?text=Hi!%20My%20confirmation%20ID%20is%20${confirmId}" style="display:inline-block; background:#25D366; color:#fff; padding:12px 32px; border-radius:50px; text-decoration:none; font-weight:600; font-size:15px;">💬 Chat with us on WhatsApp</a>
      </div>
    </div>
    <div style="background:#1a1a2e; padding:20px; text-align:center;">
      <p style="color:#a0aec0; margin:0; font-size:13px;">
        ${SHOP_NAME} | ${SHOP_PHONE}<br>
        Shop 1: Royapuram | Shop 2: Washermanpet, Chennai
      </p>
    </div>
  </div>`;
}

// ===== NOTIFICATION EMAIL TO SHOP =====
function buildNotificationEmail(type, data, timestamp, confirmId) {
  let details = '';
  if (type === 'enquiry') {
    details = `<p><strong>Name:</strong> ${data.name||'N/A'}</p>
    <p><strong>Phone:</strong> ${data.phone||'N/A'}</p>
    <p><strong>Email:</strong> ${data.email||'N/A'}</p>
    <p><strong>Service:</strong> ${data.service||'N/A'}</p>
    <p><strong>Message:</strong> ${data.message||'N/A'}</p>`;
  } else if (type === 'order') {
    details = `<p><strong>Name:</strong> ${data.name||'N/A'}</p>
    <p><strong>Phone:</strong> ${data.phone||'N/A'}</p>
    <p><strong>Vehicle:</strong> ${data.vehicle||'N/A'}</p>
    <p><strong>Tyre Size:</strong> ${data.tyreSize||'N/A'}</p>`;
  } else if (type === 'appointment') {
    details = `<p><strong>Confirmation:</strong> ${confirmId||'N/A'}</p>
    <p><strong>Name:</strong> ${data.name||'N/A'}</p>
    <p><strong>Phone:</strong> ${data.phone||'N/A'}</p>
    <p><strong>Email:</strong> ${data.email||'N/A'}</p>
    <p><strong>Date:</strong> ${data.date||'N/A'}</p>
    <p><strong>Time:</strong> ${data.time||'N/A'}</p>
    <p><strong>Service:</strong> ${data.service||'N/A'}</p>
    <p><strong>Shop:</strong> ${data.shop||'N/A'}</p>
    <p><strong>Vehicle:</strong> ${data.vehicle||'N/A'}</p>`;
  }

  return `<div style="font-family:Arial,sans-serif; padding:20px;">
    <h2>New ${type} at ${timestamp}</h2>
    ${details}
  </div>`;
}

// ===== WHATSAPP NOTIFICATION TO SHOP (CallMeBot) =====
function sendWhatsAppNotification(type, data, timestamp, confirmId) {
  if (CALLMEBOT_API_KEY === 'YOUR_API_KEY_HERE' || !CALLMEBOT_API_KEY) return;
  
  let msg = `*New ${type.toUpperCase()}!*\n`;
  if (type === 'enquiry') {
    msg += `Name: ${data.name||'N/A'}\nPhone: ${data.phone||'N/A'}\nService: ${data.service||'N/A'}\nMessage: ${data.message||'N/A'}`;
  } else if (type === 'order') {
    msg += `Name: ${data.name||'N/A'}\nPhone: ${data.phone||'N/A'}\nVehicle: ${data.vehicle||'N/A'}\nTyre: ${data.tyreSize||'N/A'}`;
  } else if (type === 'appointment') {
    msg += `ID: ${confirmId||'N/A'}\nName: ${data.name||'N/A'}\nPhone: ${data.phone||'N/A'}\nDate: ${data.date||'N/A'}\nTime: ${data.time||'N/A'}\nShop: ${data.shop||'N/A'}\nVehicle: ${data.vehicle||'N/A'}`;
  }
  
  const text = encodeURIComponent(msg);
  const url = `https://api.callmebot.com/whatsapp.php?phone=91${SHOP_PHONE}&text=${text}&apikey=${CALLMEBOT_API_KEY}`;
  
  try {
    UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  } catch(e) {
    Logger.log("WhatsApp Send Failed: " + e.toString());
  }
}

// ===== FIND NEXT SLOT =====
function findNextAvailableSlot(appointments, date, shop, afterTime) {
  const slots = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM',
    '1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM',
    '7:00 PM','8:00 PM','9:00 PM','10:00 PM'];

  const idx = slots.indexOf(afterTime);
  for (let i = idx + 1; i < slots.length; i++) {
    let count = 0;
    appointments.forEach(function(row) {
      if (String(row[4]).trim() == date && String(row[5]).trim() == slots[i] && String(row[7]).trim() == shop && String(row[9]).trim() !== 'Cancelled') count++;
    });
    if (count < MAX_PER_SLOT) return { time: slots[i], date: date, sameDay: true };
  }

  var nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  return { time: slots[0], date: Utilities.formatDate(nextDate, 'Asia/Kolkata', 'yyyy-MM-dd'), sameDay: false };
}

// ===== UTILITIES =====
function getOrCreateSheet(ss, tabName, headers, color) {
  let sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.appendRow(headers);
    sheet.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground(color).setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    for (let i = 1; i <= headers.length; i++) sheet.setColumnWidth(i, 140);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ===== TEST SETUP =====
function testSetup() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    Logger.log('✅ Connected: ' + ss.getName());
    getOrCreateSheet(ss, TABS.enquiries, ['Date/Time','Name','Phone','Email','Service','Message','Source'], '#e8f5e9');
    getOrCreateSheet(ss, TABS.appointments, ['Date/Time Booked','Name','Phone','Email','Appt Date','Appt Time','Service','Shop','Vehicle','Status','Confirmation'], '#e3f2fd');
    getOrCreateSheet(ss, TABS.orders, ['Date/Time','Name','Phone','Vehicle','Tyre Size','Tool Used','Source'], '#fce4ec');
    Logger.log('✅ All tabs ready!');
    Logger.log('📧 Daily email quota: ' + MailApp.getRemainingDailyQuota() + ' emails left today');
  } catch(e) {
    Logger.log('❌ Error: ' + e.toString());
  }
}
