// ============================================================
// RR TYRES — MASTER CONFIGURATION FILE
// ============================================================
// ✅ EDIT THIS FILE to change ANY text, price, phone number,
//    review, FAQ, vehicle, or setting on your website.
//
// ✅ After editing, just SAVE and REFRESH your browser.
//    No need to touch index.html, style.css, or script.js.
// ============================================================

const CONFIG = {

  // ===== BUSINESS INFO =====
  business: {
    name: 'RR Tyres',
    tagline: 'Premium Two-Wheeler Tyre Sales & Services Chennai',
    email: 'santhoshlives7641@gmail.com',
    copyright: '© 2026 RR Tyres. All rights reserved.',
    googleScriptUrl: 'https://script.google.com/macros/s/AKfycbyx8stnzxx9EAIpAAhPH789OYKqculUISA-Ytp_4DJypFDlQWknu0CtsxJMe_4Mhzaj/exec',
  },

  // ===== PHONE NUMBERS =====
  phones: {
    primary: '9445209525',           // Main phone (used on WhatsApp + contact)
    secondary: '9445209525',          // Alternate phone (Quick Call in booking)
    whatsapp: '919445209525',         // WhatsApp with country code (no +)
  },

  // ===== BUSINESS HOURS =====
  // Change once here → updates everywhere (nav badge, booking section, FAQ)
  hours: {
    weekday: {
      label: 'Mon – Sat',
      open: '8:30 AM',
      close: '10:00 PM',
      openDecimal: 8.5,      // 8:30 = 8.5
      closeDecimal: 22.0,    // 10:00 PM = 22.0
    },
    sunday: {
      label: 'Sunday',
      open: '8:30 AM',
      close: '2:30 PM',
      openDecimal: 8.5,
      closeDecimal: 14.5,
    },
  },

  // ===== HERO SECTION =====
  hero: {
    badge: 'Premium Two-Wheeler Tyres & Auto Care — Chennai',
    titleLine1: 'Your Bike Deserves the',
    titleHighlight: 'Best Tyres',
    description: "Chennai's trusted two-wheeler tyre specialists. Premium tyres for bikes and scooters, professional puncture repairs, and nitrogen filling. Two shops. One commitment to quality.",
    ctaBooking: 'Book Appointment',
    ctaWhatsApp: 'WhatsApp Us',
    ctaExplore: 'Explore Services',
  },

  // ===== BRANDS =====
  brands: {
    heading: 'Authorized Dealer For',
    items: [
      { name: 'MRF', image: 'mrf.png', alt: 'MRF Tyres' },
      { name: 'Apollo', image: 'apollo.png', alt: 'Apollo Tyres' },
      { name: 'CEAT', image: 'ceat.png', alt: 'CEAT Tyres' },
    ],
  },

  // ===== SERVICES =====
  services: {
    tag: 'What We Do',
    title: 'Our Premium',
    titleHighlight: 'Services',
    subtitle: 'From buying new tyres to routine maintenance, we provide everything your wheels need.',
    items: [
      {
        title: 'Two-Wheeler Tyre Sales',
        description: 'Wide selection of premium bike and scooter tyres from MRF, Apollo, and CEAT. We help you choose the right fit for your two-wheeler and budget.',
        price: 'From ₹2,000',
        icon: 'tyre', // icon key — mapped in script.js
      },
      {
        title: 'Bike Puncture Repairs',
        description: 'Fast, reliable puncture repairs for all bikes and scooters — tube and tubeless. Back on the road in minutes.',
        price: 'From ₹80',
        icon: 'wrench',
      },
      {
        title: 'Air & Nitrogen Filling',
        description: 'Correct tyre pressure is critical for two-wheelers. We offer precise air and nitrogen filling for better mileage, grip, and tyre life.',
        price: 'From ₹20',
        icon: 'air',
      },
    ],
  },

  // ===== VEHICLE TYRE SIZES (for Size Finder Tool) =====
  // Format: { group: "Brand Name", models: [ { name, front, rear } ] }
  vehicles: [
    {
      group: 'Honda (Scooters)',
      models: [
        { name: 'Activa 6G', front: '90/90-12', rear: '90/100-10' },
        { name: 'Dio', front: '90/90-10', rear: '90/90-10' },
        { name: 'Grazia', front: '90/90-12', rear: '110/80-12' },
      ],
    },
    {
      group: 'Honda (Bikes)',
      models: [
        { name: 'CB Shine', front: '80/100-18', rear: '80/100-18' },
        { name: 'CB Hornet 160R', front: '80/100-17', rear: '120/80-17' },
        { name: 'CB300R', front: '110/70-17', rear: '150/60-17' },
      ],
    },
    {
      group: 'Hero MotoCorp',
      models: [
        { name: 'Splendor Plus', front: '2.75-18', rear: '3.00-17' },
        { name: 'HF Deluxe', front: '2.75-18', rear: '3.00-17' },
        { name: 'Passion Pro', front: '80/100-17', rear: '80/100-17' },
        { name: 'Xpulse 200', front: '90/90-21', rear: '120/80-17' },
        { name: 'Destini 125 (Scooter)', front: '90/90-12', rear: '90/100-10' },
      ],
    },
    {
      group: 'Bajaj',
      models: [
        { name: 'Pulsar 150', front: '80/100-17', rear: '100/90-17' },
        { name: 'Pulsar NS200', front: '100/80-17', rear: '130/70-17' },
        { name: 'Pulsar RS200', front: '100/80-17', rear: '130/70-17' },
        { name: 'Dominar 400', front: '110/70-17', rear: '150/60-17' },
        { name: 'Avenger 220', front: '90/90-19', rear: '120/80-17' },
        { name: 'Chetak (Scooter)', front: '90/90-12', rear: '90/90-12' },
      ],
    },
    {
      group: 'TVS',
      models: [
        { name: 'Jupiter (Scooter)', front: '90/90-12', rear: '90/100-10' },
        { name: 'NTORQ 125 (Scooter)', front: '90/90-12', rear: '110/70-12' },
        { name: 'Apache RTR 160', front: '90/90-17', rear: '110/80-17' },
        { name: 'Apache RTR 200', front: '100/80-17', rear: '130/70-17' },
        { name: 'Raider 125', front: '80/100-17', rear: '100/90-17' },
      ],
    },
    {
      group: 'Yamaha',
      models: [
        { name: 'FZ S V3', front: '100/80-17', rear: '140/60-17' },
        { name: 'MT-15 V2', front: '100/80-17', rear: '140/70-17' },
        { name: 'R15 V4', front: '100/80-17', rear: '140/70-17' },
        { name: 'Fascino 125 (Scooter)', front: '90/90-12', rear: '100/80-10' },
      ],
    },
    {
      group: 'Suzuki',
      models: [
        { name: 'Access 125 (Scooter)', front: '90/90-12', rear: '90/100-10' },
        { name: 'Gixxer 150', front: '100/80-17', rear: '130/70-17' },
        { name: 'Gixxer SF 250', front: '110/70-17', rear: '150/60-17' },
      ],
    },
    {
      group: 'Royal Enfield',
      models: [
        { name: 'Classic 350', front: '100/90-19', rear: '120/80-18' },
        { name: 'Meteor 350', front: '100/90-19', rear: '140/70-17' },
        { name: 'Himalayan', front: '90/90-21', rear: '120/90-17' },
        { name: 'Hunter 350', front: '100/80-17', rear: '120/70-17' },
      ],
    },
    {
      group: 'KTM',
      models: [
        { name: 'Duke 125', front: '110/70-17', rear: '150/60-17' },
        { name: 'Duke 200', front: '110/70-17', rear: '150/60-17' },
        { name: 'Duke 390', front: '110/70-17', rear: '150/60-17' },
        { name: 'RC 390', front: '110/70-17', rear: '150/60-17' },
      ],
    },
    {
      group: 'Electric Scooters',
      models: [
        { name: 'Ola S1 Pro', front: '110/70-12', rear: '110/70-12' },
        { name: 'Ather 450X', front: '90/80-12', rear: '110/80-12' },
        { name: 'TVS iQube', front: '90/90-12', rear: '90/90-12' },
      ],
    },
  ],

  // ===== PRESSURE GUIDE DATA =====
  pressure: {
    vehicleTypes: [
      { value: 'scooter_s', label: 'Small Scooter (Activa, Dio, Access)' },
      { value: 'scooter_l', label: 'Performance Scooter (NTORQ, Grazia)' },
      { value: 'commuter', label: 'Commuter Bike (Splendor, Shine, Passion)' },
      { value: 'sport_s', label: 'Sport Bike 150–200cc (Apache, Pulsar, FZ)' },
      { value: 'sport_l', label: 'Performance Bike 300cc+ (Duke, R15, Gixxer SF)' },
      { value: 'cruiser', label: 'Cruiser / Touring (RE Classic, Meteor, Avenger)' },
    ],
    loadTypes: [
      { value: 'solo', label: 'Solo rider' },
      { value: 'pillion', label: 'Rider + Pillion' },
      { value: 'loaded', label: 'Rider + Pillion + Luggage' },
    ],
    // [front PSI, rear PSI] per vehicle type + load
    data: {
      scooter_s: { solo: [25, 28], pillion: [27, 32], loaded: [28, 34] },
      scooter_l: { solo: [26, 28], pillion: [28, 32], loaded: [30, 35] },
      commuter: { solo: [26, 30], pillion: [28, 33], loaded: [30, 36] },
      sport_s: { solo: [28, 32], pillion: [30, 34], loaded: [32, 36] },
      sport_l: { solo: [30, 33], pillion: [32, 36], loaded: [34, 38] },
      cruiser: { solo: [28, 32], pillion: [30, 35], loaded: [32, 38] },
    },
  },

  // ===== WEAR CHECKER QUIZ =====
  wearQuiz: [
    {
      question: 'How old are your tyres?',
      options: [
        { text: 'Less than 2 years', score: 0 },
        { text: '2–4 years', score: 1 },
        { text: '4–6 years', score: 2 },
        { text: 'Over 6 years', score: 3 },
      ],
    },
    {
      question: 'Can you see the tread wear indicators (tiny bumps between treads)?',
      options: [
        { text: 'No, tread is still deep', score: 0 },
        { text: 'Slightly visible', score: 1 },
        { text: 'Clearly visible', score: 2 },
        { text: 'Tread is almost flat', score: 3 },
      ],
    },
    {
      question: 'Do you notice any of these issues?',
      options: [
        { text: 'None', score: 0 },
        { text: 'Uneven wear pattern', score: 1 },
        { text: 'Cracks or bulges on sidewall', score: 2 },
        { text: 'Vibration or poor grip', score: 3 },
      ],
    },
  ],

  // ===== WEAR RESULTS =====
  wearResults: [
    { maxScore: 2, pct: 85, color: '#22c55e', title: '✅ Tyres Look Good!', desc: 'Your tyres appear to be in good condition. Continue checking every 6 months or at every 5,000 km service.' },
    { maxScore: 4, pct: 50, color: '#f59e0b', title: '⚠️ Monitor Closely', desc: 'Your tyres are showing some wear. We recommend a professional inspection at our shop within the next month.' },
    { maxScore: 7, pct: 25, color: '#ef4444', title: '🚨 Replacement Recommended', desc: 'Your tyres are significantly worn and may be unsafe. Please visit our shop soon for a professional assessment.' },
    { maxScore: 99, pct: 5, color: '#dc2626', title: '🆘 Replace Immediately!', desc: 'Your tyres are in critical condition and pose a serious safety risk. Please visit us as soon as possible.' },
  ],

  // ===== COST ESTIMATOR =====
  costItems: [
    { label: 'Bike Tube Tyre Puncture Repair', range: '60-100', note: 'Tube tyre puncture for bikes and scooters. Quick, same-day repair.' },
    { label: 'Bike Tubeless Tyre Puncture Repair', range: '80-150', note: 'Tubeless tyre puncture repair using mushroom plug method.' },
    { label: 'Air / Nitrogen Filling (per tyre)', range: '20-30 per tyre', note: 'Nitrogen filling for two-wheelers — better grip and longer tyre life.' },
    { label: 'New Tyre — Economy (Scooter/Commuter)', range: '400-900', note: 'Economy range two-wheeler tyres for daily commuters.' },
    { label: 'New Tyre — Mid Range (Sport Bike)', range: '900-1,800', note: 'Mid-range two-wheeler tyres with good performance.' },
    { label: 'New Tyre — Premium (RE / 300cc+)', range: '1,800-3,500', note: 'Premium MRF / Apollo tyres for performance bikes.' },
    { label: 'Front + Rear Tyre Set (with fitting)', range: '1,800-7,000', note: 'Front + Rear tyre set with fitting for your two-wheeler.' },
  ],

  // ===== BOOKING =====
  booking: {
    tag: 'Book a Visit',
    title: 'Schedule Your',
    titleHighlight: 'Appointment',
    subtitle: 'Pick a slot and we\'ll be ready for you. No waiting, no hassle.',
    walkInText: 'No appointment needed for puncture repairs and air filling. Book ahead for new tyre purchases to avoid wait time.',
    timeSlots: [
      '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
      '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
    ],
    serviceOptions: [
      'Buy New Tyres',
      'Puncture Repair',
      'Air / Nitrogen Filling',
      'Tyre Inspection',
      'Other',
    ],
  },

  // ===== SHOP LOCATIONS =====
  shops: [
    {
      name: 'Royapuram Shop',
      number: '01',
      address: '49/23, Chetty Thottam, Royapuram, Chennai – 600013',
      shortAddress: 'Shop 1 – Royapuram (49/23, Chetty Thottam)',
      mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.2!2d80.2987!3d13.1080!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526f4bbbbbbbbb%3A0xabc123!2sChetty+Thottam%2C+Royapuram%2C+Chennai%2C+Tamil+Nadu+600013!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
      mapLink: 'https://www.google.com/maps/search/49+Chetty+Thottam+Royapuram+Chennai+600013',
    },
    {
      name: 'Washermanpet Shop',
      number: '02',
      address: '131/1, Old Gollavar Agraharam Rd, Washermanpet, Chennai – 600021',
      shortAddress: 'Shop 2 – Washermanpet (131/1, Gollavar Agraharam)',
      mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.0!2d80.2910!3d13.1130!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526f4ccccccccc%3A0xdef456!2sWashermanpet%2C+Chennai%2C+Tamil+Nadu+600021!5e0!3m2!1sen!2sin!4v1700000000001!5m2!1sen!2sin',
      mapLink: 'https://www.google.com/maps/search/131+Gollavar+Agraharam+Road+Washermanpet+Chennai+600021',
    },
  ],

  // ===== CUSTOMER REVIEWS =====
  reviews: {
    tag: 'Customer Reviews',
    title: 'What Our',
    titleHighlight: 'Customers Say',
    subtitle: 'Trusted by hundreds of vehicle owners across Chennai.',
    stats: [
      { value: '4.9★', label: 'Rating' },
      { value: '500+', label: 'Happy Customers' },
      { value: '10+', label: 'Years in Business' },
    ],
    items: [
      {
        name: 'Ramesh Kumar',
        initials: 'RK',
        date: 'March 2026',
        text: '"Got my Pulsar 150\'s tyres replaced here. Amazing service, very honest pricing, and done quickly. Highly recommend RR Tyres!"',
      },
      {
        name: 'Priya Sundar',
        initials: 'PS',
        date: 'Feb 2026',
        text: '"Had a puncture on my Activa late evening, rushed to their Royapuram shop. Fixed it within minutes. Lifesavers! Will always come back here."',
      },
      {
        name: 'Arjun Venkat',
        initials: 'AV',
        date: 'Jan 2026',
        text: '"Best tyre shop in Washermanpet. The nitrogen filling is great value and their advice on the right tyre for my Royal Enfield was spot on."',
      },
    ],
  },

  // ===== FAQ =====
  faq: {
    tag: 'FAQ',
    title: 'Common',
    titleHighlight: 'Questions',
    subtitle: 'Everything two-wheeler riders need to know before visiting us.',
    items: [
      {
        question: 'What brands of two-wheeler tyres do you stock?',
        answer: 'We are authorized dealers for MRF, Apollo, and CEAT — the top three tyre brands in India. We stock tyres for all two-wheelers including scooters, commuter bikes, sport bikes, cruisers, and electric scooters.',
      },
      {
        question: 'How much does a bike puncture repair cost?',
        answer: 'Tube tyre puncture repair for bikes/scooters starts at ₹60. Tubeless tyre puncture repair typically costs ₹80–₹150, depending on the puncture type and size.',
      },
      {
        question: 'Is nitrogen filling better than regular air?',
        answer: 'Yes! Nitrogen maintains tyre pressure more consistently, reduces moisture inside the tyre, and helps reduce the risk of blowouts. It leads to better fuel efficiency and longer tyre life. We offer nitrogen filling from just ₹20 per tyre.',
      },
      {
        question: 'Do I need an appointment to visit?',
        answer: 'No appointment needed for punctures and air filling — just walk in! For new tyre purchases, booking in advance ensures your preferred size is in stock and avoids any wait time.',
      },
      {
        question: 'When should I replace my bike\'s tyres?',
        answer: 'Look for: tread depth below 2mm, visible cracks or bulges on the sidewall, tyres older than 4–5 years, or if you experience wobbling, skidding, or poor braking. Two-wheeler tyres are even more critical for safety than car tyres — use our Tyre Wear Checker above!',
      },
      {
        question: 'What are your working hours?',
        answer: null, // Auto-generated from CONFIG.hours
      },
    ],
  },

  // ===== CONTACT SECTION =====
  contact: {
    tag: 'Get in Touch',
    title: 'Visit Us or',
    titleHighlight: 'Contact Us',
    subtitle: 'Drop us a message for inquiries or to schedule your next visit.',
    formServiceOptions: ['Other Queries'],
  },

  // ===== TOOLS SECTION =====
  tools: {
    tag: 'Smart Tools',
    title: 'Useful',
    titleHighlight: 'Tyre Tools',
    subtitle: 'Interactive tools to help you find the right two-wheeler tyre, check pressure, and estimate costs.',
  },

  // ===== LOCATIONS SECTION =====
  locations: {
    tag: 'Find Us',
    title: 'Our',
    titleHighlight: 'Locations',
    subtitle: 'Two convenient shops across Chennai to serve you better.',
  },

};
