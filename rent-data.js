// ============================================================
// RENT.OATS — GEAR & DONATIONS DATA
// Edit this file to update the borrow page. Then hit Deploy.
// Swap the placeholder items/QR links for the real thing whenever you're ready.
// ============================================================

const RENT = {
  brand: "RENT.OATS",
  tagline: "Borrow my photo & video gear.",
  eyebrow: "FOOK'N OATS ENTERPRISES",
  intro: "Twenty years on the road means a lot of cameras, lenses, lights, and audio gear sitting in cases between tours. Most of it is just collecting dust — so it's here to borrow. This is separate from the tour life, music, and everyday stuff on Instagram @the_oats. This is just the gear.",
  instagramHandle: "@the_oats",
  instagramUrl: "https://instagram.com/the_oats",
  contactEmail: "fookn.oats.enterprises@gmail.com",
  formEndpoint: "https://formspree.io/f/mlgwpppq",
  homeUrl: "https://fookn-oats.enterprises",

  howItWorks: [
    { step: "1", label: "Browse the gear", desc: "See what's available below — camera bodies, lenses, lighting, audio, and support gear." },
    { step: "2", label: "Request to borrow", desc: "Send dates and what it's for. Local pickup/return, or ship at your cost." },
    { step: "3", label: "Donate if you can", desc: "Borrowing is free. A donation via QR code (below) helps keep the gear maintained and the collection growing — never required." }
  ],

  // Placeholder listings — replace with your real gear, condition notes, and what's included.
  gear: [
    { id: "cam-body-1",  category: "Camera Body", icon: "◉", label: "Placeholder — Camera Body",        condition: "Good", tagline: "Full-frame mirrorless body.",           desc: "Swap in your real camera body — model, condition, what's included (batteries, charger, cards, strap)." },
    { id: "lens-1",      category: "Lens",        icon: "◍", label: "Placeholder — Zoom Lens",           condition: "Good", tagline: "Standard zoom, everyday range.",        desc: "Swap in your real lens — focal length, aperture, mount, condition notes." },
    { id: "lighting-1",  category: "Lighting",    icon: "☼", label: "Placeholder — LED Panel Kit",       condition: "Good", tagline: "On-camera or small-set lighting.",      desc: "Swap in your real lighting kit — panel count, power source, stands included or not." },
    { id: "audio-1",     category: "Audio",       icon: "◧", label: "Placeholder — Shotgun Mic + Recorder", condition: "Good", tagline: "On-location audio capture.",         desc: "Swap in your real audio gear — mic model, recorder, cables, windscreen." },
    { id: "support-1",   category: "Support",     icon: "⊥", label: "Placeholder — Tripod",              condition: "Good", tagline: "Stable support for stills or video.",   desc: "Swap in your real support gear — tripod/gimbal model, max load, head type." },
    { id: "drone-1",     category: "Drone",       icon: "✈", label: "Placeholder — Drone",               condition: "Good", tagline: "Aerial stills and video.",              desc: "Swap in your real drone — model, battery count, what's included, any flight restrictions." }
  ],

  // Optional donation QR codes — fully optional for the borrower, never required.
  // Set url to your real Venmo/CashApp/PayPal.me link and the QR + label update automatically.
  donations: [
    { label: "Venmo",    handle: "@your-venmo-handle", url: "https://venmo.com/u/your-venmo-handle" },
    { label: "Cash App", handle: "$your-cashtag",       url: "https://cash.app/$your-cashtag" },
    { label: "PayPal",   handle: "paypal.me/yourname",  url: "https://paypal.me/yourname" }
  ],

  terms: [
    "This is personal gear, made available informally to borrow — not a commercial rental business.",
    "Borrower is responsible for loss, theft, or damage while the gear is in their possession.",
    "A refundable deposit or ID may be requested at the owner's discretion before handoff.",
    "Local pickup/return preferred. Shipping (if arranged) is at the borrower's cost and risk.",
    "Donations via QR code are appreciated but never required to borrow."
  ]
};
