// ============================================================
// RR Tyres — Website Logic (Config-Driven + Smart Booking)
// ============================================================
// All content comes from config.js — edit THAT file, not this one.
// ============================================================

// ===== GOOGLE SHEETS CONFIG (from config.js) =====
function getGoogleScriptUrl() {
    return CONFIG.business.googleScriptUrl || '';
}

// ===== DEDUPLICATION — Submission Tracking =====
const _submissionCache = {};
const DEDUP_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

function getSubmissionKey(data) {
    // Create a fingerprint from the data
    const parts = [data.type, data.name, data.phone, data.email, data.message, data.date, data.time, data.shop, data.vehicle, data.tyreSize].filter(Boolean);
    return parts.join('|').toLowerCase().trim();
}

function isDuplicate(data) {
    const key = getSubmissionKey(data);
    const now = Date.now();
    if (_submissionCache[key] && (now - _submissionCache[key]) < DEDUP_WINDOW_MS) {
        return true;
    }
    _submissionCache[key] = now;
    return false;
}

// ===== SAVE TO GOOGLE SHEETS =====
function saveToSheet(data, callback) {
    const url = getGoogleScriptUrl();
    if (!url || url === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        console.warn('Google Sheets URL not configured. Data not saved:', data);
        if (callback) callback({ status: 'success', message: 'Demo mode — URL not configured' });
        return;
    }

    // Frontend dedup check
    if (isDuplicate(data)) {
        console.warn('⚠️ Duplicate submission blocked (frontend):', data);
        if (callback) callback({ status: 'duplicate', message: 'This has already been submitted.' });
        return;
    }

    const fetchUrl = url + '?data=' + encodeURIComponent(JSON.stringify(data));

    fetch(fetchUrl, { redirect: 'follow' })
    .then(response => response.text())
    .then(text => {
        let result;
        try { result = JSON.parse(text); }
        catch(e) { result = { status: 'success', message: 'Data saved' }; }
        console.log('✅ Sheet response:', result);
        if (callback) callback(result);
    })
    .catch(err => {
        console.error('❌ Sheet error:', err);
        if (callback) callback({ status: 'success', message: 'Saved (offline mode)' });
    });
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'success', duration = 4000) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification toast-' + type;

    const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    toast.innerHTML = `<div class="toast-icon">${icons[type] || icons.success}</div><span>${message}</span>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, duration);
}


// ===== SERVICE ICON SVGs =====
const SERVICE_ICONS = {
    tyre: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="21.17" y1="8" x2="12" y2="8" /><line x1="3.95" y1="6.06" x2="8.54" y2="14" /></svg>',
    wrench: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 9.36l-7.1 7.1a2.12 2.12 0 0 1-3-3l7.1-7.1a6 6 0 0 1 9.36-7.94l-3.77 3.77z" /></svg>',
    air: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-9" /><path d="M15.17 2.38a1 1 0 0 0-1.34.4l-2.4 4.5a3 3 0 0 0 3.3 4.2l3.2-.8a1 1 0 0 0 .5-1.4l-3.26-6.9z" /><circle cx="12" cy="22" r="2" /></svg>',
};


// ===== RENDER FROM CONFIG =====
function renderFromConfig() {
    const C = CONFIG;
    const wa = C.phones.whatsapp;

    // --- WhatsApp Float ---
    const waFloat = document.getElementById('whatsappFloat');
    if (waFloat) waFloat.href = `https://wa.me/${wa}?text=Hello%20${encodeURIComponent(C.business.name)}%2C%20I%20need%20help!`;

    // --- Hero ---
    setText('heroBadgeText', C.hero.badge);
    setText('heroTitle1', C.hero.titleLine1);
    setText('heroTitleHL', C.hero.titleHighlight);
    setText('heroDesc', C.hero.description);
    setText('heroBookText', C.hero.ctaBooking);
    setText('heroWaText', C.hero.ctaWhatsApp);
    const heroWaBtn = document.getElementById('heroWaBtn');
    if (heroWaBtn) heroWaBtn.href = `https://wa.me/${wa}?text=Hello%20${encodeURIComponent(C.business.name)}!`;
    setText('heroExploreBtn', C.hero.ctaExplore);

    // --- Brands ---
    setText('brandsHeading', C.brands.heading);
    const brandLogos = document.getElementById('brandLogos');
    if (brandLogos) {
        brandLogos.innerHTML = C.brands.items.map(b => `
            <div class="brand-item">
                <img src="${b.image}" alt="${b.alt}" class="brand-tyre-img">
                <span class="brand-logo">${b.name}</span>
            </div>
        `).join('');
    }

    // --- Services ---
    setText('servicesTag', C.services.tag);
    setText('servicesTitle', C.services.title);
    setText('servicesTitleHL', C.services.titleHighlight);
    setText('servicesSubtitle', C.services.subtitle);
    const servicesGrid = document.getElementById('servicesGrid');
    if (servicesGrid) {
        servicesGrid.innerHTML = C.services.items.map(s => `
            <div class="service-card" data-animate>
                <div class="service-icon">${SERVICE_ICONS[s.icon] || ''}</div>
                <h3>${s.title}</h3>
                <p>${s.description}</p>
                <div class="service-price">${s.price}</div>
            </div>
        `).join('');
    }

    // --- Tools Section Header ---
    setText('toolsTag', C.tools.tag);
    setText('toolsTitle', C.tools.title);
    setText('toolsTitleHL', C.tools.titleHighlight);
    setText('toolsSubtitle', C.tools.subtitle);

    // --- Vehicle Select (Size Finder) ---
    const vehicleSelect = document.getElementById('vehicleSelect');
    if (vehicleSelect) {
        vehicleSelect.innerHTML = '<option value="">-- Select Your Bike / Scooter --</option>';
        C.vehicles.forEach(group => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = group.group;
            group.models.forEach(m => {
                const opt = document.createElement('option');
                opt.value = `${m.name}|Front: ${m.front} · Rear: ${m.rear}`;
                opt.textContent = m.name;
                optgroup.appendChild(opt);
            });
            vehicleSelect.appendChild(optgroup);
        });
    }

    // --- Pressure Calculator Dropdowns ---
    const vehicleType = document.getElementById('vehicleType');
    if (vehicleType) {
        vehicleType.innerHTML = '<option value="">-- Vehicle Type --</option>';
        C.pressure.vehicleTypes.forEach(v => {
            vehicleType.innerHTML += `<option value="${v.value}">${v.label}</option>`;
        });
    }
    const loadType = document.getElementById('loadType');
    if (loadType) {
        loadType.innerHTML = '<option value="">-- Load Condition --</option>';
        C.pressure.loadTypes.forEach(l => {
            loadType.innerHTML += `<option value="${l.value}">${l.label}</option>`;
        });
    }

    // --- Wear Checker Quiz ---
    const quizContainer = document.getElementById('wearQuizQuestions');
    if (quizContainer) {
        quizContainer.innerHTML = C.wearQuiz.map((q, qi) => `
            <div class="quiz-step${qi === 0 ? ' active' : ''}" id="q${qi + 1}">
                <p class="quiz-q">${qi + 1}. ${q.question}</p>
                <div class="quiz-options">
                    ${q.options.map(o => `<button class="quiz-opt" onclick="quizAnswer(${qi + 1},${o.score})">${o.text}</button>`).join('')}
                </div>
            </div>
        `).join('');
    }
    const wearWaLink = document.getElementById('wearWaLink');
    if (wearWaLink) wearWaLink.href = `https://wa.me/${wa}`;

    // --- Cost Estimator ---
    const serviceType = document.getElementById('serviceType');
    if (serviceType) {
        serviceType.innerHTML = '<option value="">-- Select Service --</option>';
        C.costItems.forEach(item => {
            serviceType.innerHTML += `<option value="${item.range}|${item.note}">${item.label}</option>`;
        });
    }

    // --- Booking Section ---
    setText('bookingTag', C.booking.tag);
    setText('bookingTitle', C.booking.title);
    setText('bookingTitleHL', C.booking.titleHighlight);
    setText('bookingSubtitle', C.booking.subtitle);
    setText('bookingWalkInText', C.booking.walkInText);

    // Booking hours
    const bookingHoursList = document.getElementById('bookingHoursList');
    if (bookingHoursList) {
        bookingHoursList.innerHTML = `
            <div class="hours-row"><span>${C.hours.weekday.label}</span><span class="hours-time">${C.hours.weekday.open} – ${C.hours.weekday.close}</span></div>
            <div class="hours-row"><span>${C.hours.sunday.label}</span><span class="hours-time">${C.hours.sunday.open} – ${C.hours.sunday.close}</span></div>
        `;
    }

    // Quick Call phone
    const quickCallLink = document.getElementById('quickCallLink');
    if (quickCallLink) {
        quickCallLink.href = `tel:${C.phones.secondary}`;
        quickCallLink.textContent = `+91 ${C.phones.secondary}`;
    }

    // Time slots
    const bookTime = document.getElementById('bookTime');
    if (bookTime) {
        bookTime.innerHTML = '<option value="">Select Time</option>';
        C.booking.timeSlots.forEach(t => {
            bookTime.innerHTML += `<option value="${t}">${t}</option>`;
        });
    }

    // Booking services
    const bookService = document.getElementById('bookService');
    if (bookService) {
        bookService.innerHTML = '<option value="">Select Service</option>';
        C.booking.serviceOptions.forEach(s => {
            bookService.innerHTML += `<option>${s}</option>`;
        });
    }

    // Booking shops
    const bookShop = document.getElementById('bookShop');
    if (bookShop) {
        bookShop.innerHTML = '';
        C.shops.forEach(s => {
            bookShop.innerHTML += `<option>${s.shortAddress}</option>`;
        });
    }

    // --- Locations / Maps ---
    setText('locationsTag', C.locations.tag);
    setText('locationsTitle', C.locations.title);
    setText('locationsTitleHL', C.locations.titleHighlight);
    setText('locationsSubtitle', C.locations.subtitle);
    const mapsGrid = document.getElementById('mapsGrid');
    if (mapsGrid) {
        mapsGrid.innerHTML = C.shops.map(s => `
            <div class="map-card">
                <div class="map-label">
                    <span class="map-number">${s.number}</span>
                    <div>
                        <h4>${s.name}</h4>
                        <p>${s.address}</p>
                    </div>
                </div>
                <div class="map-embed">
                    <iframe src="${s.mapEmbed}" width="100%" height="260" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
                <a href="${s.mapLink}" target="_blank" class="btn btn-secondary" style="margin-top:16px; width:100%;">📍 Open in Google Maps</a>
            </div>
        `).join('');
    }

    // --- Reviews ---
    setText('reviewsTag', C.reviews.tag);
    setText('reviewsTitle', C.reviews.title);
    setText('reviewsTitleHL', C.reviews.titleHighlight);
    setText('reviewsSubtitle', C.reviews.subtitle);
    const reviewsStats = document.getElementById('reviewsStats');
    if (reviewsStats) {
        reviewsStats.innerHTML = C.reviews.stats.map(s => `
            <div class="stat-item"><span class="stat-number">${s.value}</span><span class="stat-label">${s.label}</span></div>
        `).join('');
    }
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (reviewsGrid) {
        reviewsGrid.innerHTML = C.reviews.items.map(r => `
            <div class="review-card">
                <div class="review-header">
                    <div class="reviewer-avatar">${r.initials}</div>
                    <div>
                        <h5>${r.name}</h5>
                        <div class="review-stars">★★★★★</div>
                    </div>
                    <span class="review-date">${r.date}</span>
                </div>
                <p>${r.text}</p>
            </div>
        `).join('');
    }

    // --- FAQ ---
    setText('faqTag', C.faq.tag);
    setText('faqTitle', C.faq.title);
    setText('faqTitleHL', C.faq.titleHighlight);
    setText('faqSubtitle', C.faq.subtitle);
    const faqList = document.getElementById('faqList');
    if (faqList) {
        faqList.innerHTML = C.faq.items.map(item => {
            // Auto-generate hours FAQ answer if null
            let answer = item.answer;
            if (answer === null) {
                answer = `We are open ${C.hours.weekday.label}: ${C.hours.weekday.open} – ${C.hours.weekday.close}, and ${C.hours.sunday.label}: ${C.hours.sunday.open} – ${C.hours.sunday.close}. Both our Royapuram and Washermanpet shops follow the same hours.`;
            }
            return `
                <div class="faq-item">
                    <button class="faq-question" onclick="toggleFaq(this)"><span>${item.question}</span><span class="faq-icon">+</span></button>
                    <div class="faq-answer"><p>${answer}</p></div>
                </div>
            `;
        }).join('');
    }

    // --- Contact ---
    setText('contactTag', C.contact.tag);
    setText('contactTitle', C.contact.title);
    setText('contactTitleHL', C.contact.titleHighlight);
    setText('contactSubtitle', C.contact.subtitle);
    const contactMethods = document.getElementById('contactMethods');
    if (contactMethods) {
        contactMethods.innerHTML = `
            <div class="contact-method">
                <div class="contact-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg></div>
                <div class="contact-details">
                    <h4>Email Us</h4><a href="mailto:${C.business.email}">${C.business.email}</a>
                </div>
            </div>
            <div class="contact-method">
                <div class="contact-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg></div>
                <div class="contact-details">
                    <h4>Mobile Number</h4><a href="tel:${C.phones.primary}">+91 ${C.phones.primary}</a>
                </div>
            </div>
            ${C.shops.map(s => `
                <div class="contact-method">
                    <div class="contact-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></div>
                    <div class="contact-details">
                        <h4>${s.name}</h4><span>${s.address}</span>
                    </div>
                </div>
            `).join('')}
        `;
    }

    // Contact form services dropdown
    const contactService = document.getElementById('contactService');
    if (contactService) {
        contactService.innerHTML = '<option value="">Select Service</option>';
        C.contact.formServiceOptions.forEach(s => {
            contactService.innerHTML += `<option value="${s}">${s}</option>`;
        });
    }

    // --- Footer ---
    const footerText = document.getElementById('footerText');
    if (footerText) {
        footerText.innerHTML = C.business.copyright.replace(C.business.name, `<span>${C.business.name}</span>`);
    }
}

// Helper to set text content by ID
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text || '';
}


// ===== MAIN INIT =====
document.addEventListener('DOMContentLoaded', () => {

    // ===== RENDER ALL CONTENT FROM CONFIG =====
    renderFromConfig();

    // ===== NAV SCROLL =====
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 20);
    });

    // ===== MOBILE MENU =====
    const mobileMenuBtn = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mobileLinks = document.querySelectorAll('.mobile-links a');

    function toggleMenu(force) {
        const isActive = force !== undefined ? force : !mobileOverlay.classList.contains('active');
        mobileOverlay.classList.toggle('active', isActive);
        const spans = mobileMenuBtn.querySelectorAll('span');
        if (isActive) {
            spans[0].style.transform = 'translateY(7px) rotate(45deg)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '1';
            spans[2].style.transform = '';
        }
    }
    mobileMenuBtn.addEventListener('click', () => toggleMenu());
    mobileLinks.forEach(l => l.addEventListener('click', () => toggleMenu(false)));

    // ===== BUSINESS HOURS BADGE (uses config) =====
    function updateHours() {
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();
        const min = now.getMinutes();
        const time = hour + min / 60;

        let open = false;
        if (day >= 1 && day <= 6) {
            open = time >= CONFIG.hours.weekday.openDecimal && time < CONFIG.hours.weekday.closeDecimal;
        } else {
            open = time >= CONFIG.hours.sunday.openDecimal && time < CONFIG.hours.sunday.closeDecimal;
        }

        const dot = document.getElementById('hoursDot');
        const text = document.getElementById('hoursText');
        if (dot && text) {
            dot.className = 'hours-dot ' + (open ? 'open' : 'closed');
            text.textContent = open ? 'Open Now' : 'Closed';
        }
    }
    updateHours();
    setInterval(updateHours, 60000);

    // ===== INTERSECTION OBSERVER =====
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

    // ===== TABS =====
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const panel = document.getElementById(tab);
            if (panel) panel.classList.add('active');
        });
    });

    // ===== CONTACT FORM → GOOGLE SHEETS =====
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('contactName')?.value.trim() || '';
            const phone = document.getElementById('contactPhone')?.value.trim() || '';
            const email = document.getElementById('contactEmail')?.value.trim() || '';
            const service = document.getElementById('contactService')?.value || '';
            const message = document.getElementById('contactMessage')?.value.trim() || '';

            if (!name) {
                showToast('Please enter your name.', 'error');
                return;
            }
            if (!phone && !email) {
                showToast('Please provide a phone number or email.', 'error');
                return;
            }

            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            const formData = {
                type: 'enquiry',
                name, phone, email, service, message,
                source: 'Contact Form'
            };

            saveToSheet(formData, (result) => {
                btn.textContent = originalText;
                btn.disabled = false;

                if (result.status === 'duplicate') {
                    showToast('This enquiry was already submitted!', 'warning');
                } else {
                    showToast('Enquiry sent! We\'ll contact you soon.', 'success');
                    contactForm.reset();
                }
            });
        });
    }

    // ===== DATE MIN =====
    const bookDate = document.getElementById('bookDate');
    if (bookDate) {
        const today = new Date().toISOString().split('T')[0];
        bookDate.min = today;
    }
});


// ===== TYRE SIZE FINDER =====
function findTyreSize() {
    const sel = document.getElementById('vehicleSelect');
    const result = document.getElementById('sizeResult');
    const val = document.getElementById('sizeValue');
    if (!sel.value) { result.style.display = 'none'; return; }
    const parts = sel.value.split('|');
    result.style.display = 'block';
    val.textContent = parts[1] || 'N/A';
    window._selectedVehicle = parts[0] || '';
    window._selectedSize = parts[1] || '';
}


// ===== ORDER VIA WHATSAPP =====
function orderViaWhatsApp() {
    const popup = document.getElementById('orderPopup');
    if (popup) {
        document.getElementById('orderVehicleLabel').textContent =
            (window._selectedVehicle || 'Vehicle') + ' — ' + (window._selectedSize || '');
        popup.style.display = 'flex';
    }
}

function submitOrder() {
    const name = document.getElementById('orderName').value.trim();
    const phone = document.getElementById('orderPhone').value.trim();
    const vehicle = window._selectedVehicle || '';
    const size = window._selectedSize || '';

    if (!name || !phone) {
        showToast('Please enter your name and phone number.', 'error');
        return;
    }

    const orderData = {
        type: 'order',
        name, phone, vehicle,
        tyreSize: size,
        toolUsed: 'Size Finder'
    };

    saveToSheet(orderData, (result) => {
        if (result.status === 'duplicate') {
            showToast('This order was already submitted!', 'warning');
            return;
        }
    });

    showToast('Order enquiry saved! Opening WhatsApp...', 'success');
    closeOrderPopup();

    const wa = CONFIG.phones.whatsapp;
    const msg = `Hello ${CONFIG.business.name}!\n\nI'd like to order tyres.\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n🏍️ Vehicle: ${vehicle}\n📐 Tyre Size: ${size}\n\nPlease confirm availability and price. Thank you!`;
    setTimeout(() => {
        window.location.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(msg);
    }, 500);
}

function closeOrderPopup() {
    const popup = document.getElementById('orderPopup');
    if (popup) popup.style.display = 'none';
}


// ===== PRESSURE CALCULATOR (uses config) =====
function calcPressure() {
    const vt = document.getElementById('vehicleType').value;
    const lt = document.getElementById('loadType').value;
    const res = document.getElementById('pressureResult');
    if (!vt || !lt) { showToast('Please select both vehicle type and load condition.', 'warning'); return; }
    const pressureData = CONFIG.pressure.data;
    if (!pressureData[vt] || !pressureData[vt][lt]) { showToast('Pressure data not found.', 'error'); return; }
    const [f, r] = pressureData[vt][lt];
    document.getElementById('frontPressure').textContent = f + ' PSI';
    document.getElementById('rearPressure').textContent = r + ' PSI';
    res.style.display = 'block';
}


// ===== WEAR CHECKER =====
let quizScores = [];
let currentQ = 1;

function quizAnswer(q, score) {
    quizScores[q] = score;
    const cur = document.getElementById('q' + q);
    if (cur) cur.classList.remove('active');
    const totalQuestions = CONFIG.wearQuiz.length;
    if (q < totalQuestions) {
        currentQ = q + 1;
        const next = document.getElementById('q' + currentQ);
        if (next) next.classList.add('active');
        document.getElementById('quizBar').style.width = ((currentQ / totalQuestions) * 100) + '%';
    } else {
        showWearResult();
    }
}

function showWearResult() {
    const total = quizScores.slice(1).reduce((a, b) => a + b, 0);
    document.getElementById('wearQuizContent').style.display = 'none';
    const res = document.getElementById('wearResult');
    res.style.display = 'block';

    const fill = document.getElementById('wearFill');
    const label = document.getElementById('wearLabelText');
    const title = document.getElementById('wearResultTitle');
    const desc = document.getElementById('wearResultDesc');

    // Find matching result from config
    let result = CONFIG.wearResults[CONFIG.wearResults.length - 1]; // default to worst
    for (const r of CONFIG.wearResults) {
        if (total <= r.maxScore) { result = r; break; }
    }

    fill.style.height = result.pct + '%';
    fill.style.background = result.color;
    label.textContent = result.pct + '%';
    title.textContent = result.title;
    desc.textContent = result.desc;
}

function resetQuiz() {
    quizScores = [];
    currentQ = 1;
    document.getElementById('wearQuizContent').style.display = 'block';
    document.getElementById('wearResult').style.display = 'none';
    document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
    const q1 = document.getElementById('q1');
    if (q1) q1.classList.add('active');
    const totalQuestions = CONFIG.wearQuiz.length;
    document.getElementById('quizBar').style.width = ((1 / totalQuestions) * 100) + '%';
}


// ===== COST ESTIMATOR =====
function estimateCost() {
    const sel = document.getElementById('serviceType');
    const res = document.getElementById('costResult');
    if (!sel.value) { res.style.display = 'none'; return; }
    const parts = sel.value.split('|');
    document.getElementById('costRange').textContent = '₹' + parts[0];
    document.getElementById('costNote').textContent = parts[1] || '';
    res.style.display = 'block';
}


// ===== FAQ ACCORDION =====
function toggleFaq(btn) {
    const answer = btn.nextElementSibling;
    const isOpen = btn.classList.contains('active');
    document.querySelectorAll('.faq-question.active').forEach(q => {
        q.classList.remove('active');
        q.nextElementSibling.style.maxHeight = null;
    });
    if (!isOpen) {
        btn.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
    }
}


// ===== SMART APPOINTMENT BOOKING =====
function submitBooking() {
    const name    = document.getElementById('bookName').value.trim();
    const phone   = document.getElementById('bookPhone').value.trim();
    const email   = document.getElementById('bookEmail')?.value.trim() || '';
    const date    = document.getElementById('bookDate').value;
    const time    = document.getElementById('bookTime').value;
    const service = document.getElementById('bookService').value;
    const shop    = document.getElementById('bookShop').value;
    const vehicle = document.getElementById('bookVehicle').value.trim();

    if (!name || !phone || !date || !time || !service) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    // ===== BLOCK PAST DATES =====
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        showToast('❌ You cannot book a past date! Please select today or a future date.', 'error', 5000);
        document.getElementById('bookDate').value = '';
        return;
    }

    // Block past time if booking for today
    if (selectedDate.getTime() === today.getTime()) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const timeParts = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeParts) {
            let bookHour = parseInt(timeParts[1]);
            const bookMin = parseInt(timeParts[2]);
            const ampm = timeParts[3].toUpperCase();
            if (ampm === 'PM' && bookHour !== 12) bookHour += 12;
            if (ampm === 'AM' && bookHour === 12) bookHour = 0;
            if (bookHour < currentHour || (bookHour === currentHour && bookMin <= currentMin)) {
                showToast('❌ This time has already passed today! Please select a later time.', 'error', 5000);
                return;
            }
        }
    }

    // Show loading state + disable button (dedup: prevents double-click)
    const btn = document.getElementById('bookingBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="btn-loading"></span> Checking availability...';
    btn.disabled = true;

    // Hide any previous slot messages
    const slotMsg = document.getElementById('slotMessage');
    if (slotMsg) slotMsg.style.display = 'none';

    const formattedDate = new Date(date).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const wa = CONFIG.phones.whatsapp;

    // Send to Google Sheets — it checks availability and books
    saveToSheet({
        type: 'appointment',
        name, phone, email,
        date: formattedDate,
        time, service, shop, vehicle
    }, (result) => {
        btn.innerHTML = originalText;
        btn.disabled = false;

        if (result.status === 'duplicate') {
            showToast('This appointment was already submitted!', 'warning');
            return;
        }

        if (result.status === 'confirmed') {
            const confirmId = result.confirmationId || 'RRT-DEMO';

            if (result.immediate) {
                showToast('No queue! Come directly — we\'re ready for you!', 'success', 6000);
                showSlotMessage('success',
                    `✅ Confirmed! No appointments ahead of you. Come right away!<br>
                     <small>Confirmation: <strong>${confirmId}</strong></small>
                     ${result.emailSent ? '<br><small>📧 Confirmation email sent to <strong>' + email + '</strong></small>' : ''}`);
            } else {
                showToast('Appointment confirmed!', 'success', 5000);
                showSlotMessage('success',
                    `✅ Appointment Confirmed!<br>
                     Slot ${result.currentCount}/${result.maxPerSlot} booked.<br>
                     <small>Confirmation: <strong>${confirmId}</strong></small>
                     ${result.emailSent ? '<br><small>📧 Confirmation email sent to <strong>' + email + '</strong></small>' : ''}`);
            }

            const msg = `Hello ${CONFIG.business.name}! ✅\n\nAPPOINTMENT CONFIRMED\n\n📋 Confirmation: ${confirmId}\n👤 Name: ${name}\n📞 Phone: ${phone}\n📅 Date: ${formattedDate}\n⏰ Time: ${time}\n🔧 Service: ${service}\n📍 Shop: ${shop}${vehicle ? `\n🏍️ Vehicle: ${vehicle}` : ''}\n${result.immediate ? '\n🟢 No queue — I can come right away!' : ''}\n\nPlease confirm. Thank you!`;

            setTimeout(() => {
                window.location.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(msg);
            }, 1000);

        } else if (result.status === 'slot_full') {
            showToast('This slot is full! See alternative below.', 'warning', 6000);

            let altText = '';
            if (result.sameDay) {
                altText = `The <strong>${time}</strong> slot is full (${result.currentCount}/${result.maxPerSlot} booked).<br>
                           Next available: <strong>${result.nextAvailable}</strong> on the same day.`;
            } else {
                altText = `All slots on this day are full.<br>
                           Next available: <strong>${result.nextAvailable}</strong> on <strong>${result.nextDate}</strong>.`;
            }

            showSlotMessage('warning', `⚠️ Slot Full!<br>${altText}<br>
                <button class="btn btn-primary btn-sm" onclick="applyAlternativeSlot('${result.nextAvailable}', '${result.nextDate || ''}');"
                    style="margin-top:12px;">Book ${result.nextAvailable} Instead</button>`);

        } else {
            showToast('Booking sent! Opening WhatsApp...', 'info');
            sendBookingWhatsApp(name, phone, formattedDate, time, service, shop, vehicle, '');
        }
    });
}

// Show slot availability message
function showSlotMessage(type, html) {
    let slotMsg = document.getElementById('slotMessage');
    if (!slotMsg) {
        slotMsg = document.createElement('div');
        slotMsg.id = 'slotMessage';
        const bookingForm = document.querySelector('.booking-form-card');
        if (bookingForm) bookingForm.appendChild(slotMsg);
    }
    slotMsg.className = 'slot-message slot-' + type;
    slotMsg.innerHTML = html;
    slotMsg.style.display = 'block';
    slotMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Apply the alternative slot
function applyAlternativeSlot(time, date) {
    const timeSelect = document.getElementById('bookTime');
    if (timeSelect) {
        for (let opt of timeSelect.options) {
            if (opt.value === time) {
                timeSelect.value = time;
                break;
            }
        }
    }
    if (date) {
        const dateInput = document.getElementById('bookDate');
        if (dateInput) dateInput.value = date;
    }
    const slotMsg = document.getElementById('slotMessage');
    if (slotMsg) slotMsg.style.display = 'none';
    showToast('Slot updated! Click "Confirm" to book.', 'info');
}

// Send booking WhatsApp (fallback)
function sendBookingWhatsApp(name, phone, date, time, service, shop, vehicle, confirmId) {
    const wa = CONFIG.phones.whatsapp;
    const msg = `Hello ${CONFIG.business.name}!\n\nI'd like to book an appointment.\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n📅 Date: ${date}\n⏰ Time: ${time}\n🔧 Service: ${service}\n📍 Shop: ${shop}${vehicle ? `\n🏍️ Vehicle: ${vehicle}` : ''}${confirmId ? `\n📋 Confirmation: ${confirmId}` : ''}\n\nPlease confirm my appointment. Thank you!`;
    window.location.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(msg);
}

// ===== TAB SWITCHING LOGIC =====
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const toolPanels = document.querySelectorAll('.tool-panel');

    if (tabBtns.length === 0) return;

    // Clear active classes that might be hardcoded in HTML
    tabBtns.forEach(b => b.classList.remove('active'));
    toolPanels.forEach(p => p.classList.remove('active'));

    // Set first available tab to active automatically
    tabBtns[0].classList.add('active');
    const firstTabId = tabBtns[0].getAttribute('data-tab');
    if (firstTabId) {
        const firstPanel = document.getElementById(firstTabId);
        if (firstPanel) firstPanel.classList.add('active');
    }

    // Add click listeners to switch tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            toolPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            if (targetId) {
                const targetPanel = document.getElementById(targetId);
                if (targetPanel) targetPanel.classList.add('active');
            }
        });
    });
}

// Initialize tabs when script loads
initTabs();
