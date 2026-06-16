// ============================================================
// FOOK'N OATS — SITE CONTENT
// Edit this file to update your site. Then hit Deploy in Cowork.
// v1.0.2 · 2026.06.16
// ============================================================

const SITE = {
  title: "FOOK'N OATS",
  calendly: {
    url: "https://calendly.com/fookn-oats-enterprises/30min",
    text: "LET'S TALK →",
    color: "#0069ff",
    textColor: "#ffffff"
  },
  ticker: {
    enabled: true,
    text: "FOOK'N OATS • LIGHTING · CAD · LED · CREW • AVAILABLE TO TRAVEL"
  },
  nav: [
    { id: "home",     label: "HOME" },
    { id: "services", label: "SERVICES" },
    { id: "brands",   label: "BRANDS" },
    { id: "studio",   label: "STUDIO" },
    { id: "stories",  label: "STORIES" },
    { id: "edm",      label: "EDM FEED" },
    { id: "about",    label: "ABOUT" },
    { id: "connect",  label: "CONNECT" }
  ],
  services: [
    { icon: "◈", label: "CAD & Drafting",       tagline: "Precision drafts. Light plots. Venue drawings.",         desc: "Vectorworks and AutoCAD drafting for lighting plots, rigging designs, stage layouts, and venue paperwork. Remote-deliverable. Turn around in days, not weeks." },
    { icon: "⚡", label: "Master Electrician",   tagline: "On-site crew chief. Lighting supervision.",             desc: "Experienced Master Electrician and Lighting Crew Chief available for tours, installs, and one-offs. Brings leadership, problem-solving, and a full toolkit to any rig." },
    { icon: "▦", label: "LED Wall Tech",         tagline: "Pixel-perfect builds. LED wall systems.",               desc: "LED wall construction, configuration, and in-show technician services. From spec to strike. Novastar, Brompton, ROE, and custom panels." },
    { icon: "◎", label: "Consulting & Quotes",  tagline: "Not sure what you need? Start here.",            desc: "Project scoping, vendor recommendations, budget reviews, and production planning — without the agency markup." },
    { icon: "⚙", label: "Maker-Lab",            tagline: "Fabrication. Prototyping. Hands-on builds.",            desc: "In-house maker lab for custom fabrication, prototyping, and production builds. Laser CNC, 3D printing, embroidery, and modular bench systems — from concept to physical product." },
    { icon: "◇", label: "Design Network",        tagline: "Need crew? I know who's good.",        desc: "Years on the road means a deep contact list of lighting techs and crew. If I can't take your gig, I can point you to someone who can." }
  ],
  brands: [
    { icon: "✦", label: "Revelator Illuminae",  tagline: "Lighting design. Visuals. Previz.",                    desc: "The creative lighting arm. Original lighting design, visuals programming, and previsualization services." },
    { icon: "♫", label: "Sleepwell Sweetheart", tagline: "The band that started it all. 20 years on.",               desc: "Two decades of music, from the early catalog to new EDM remixes and a 20-year reunion show." },
    { icon: "⬡", label: "AI Oatmeal",           tagline: "Where the memes and AI experiments live.",               desc: "AI-assisted content, memes, and storyboards. More playground than product." },
    { icon: "◌", label: "Ghosted Oats",          tagline: "The unpolished stuff. No brand rules.",                 desc: "Sketches, experiments, and personal shots that don't fit a clean brand. No filter, no plan." },
    { icon: "₿", label: "Cryptos4Oats",          tagline: "Market notes from a touring tech.",           desc: "Personal crypto and market-cycle notes — a side interest, shared openly. Not financial advice." },
    { icon: "☆", label: "ƒ//ing::st△r",         tagline: "The DJ side. Loud, neon, built for the floor.",        desc: "EDM sets, neon visuals, and the EDM Oatmeal crew." }
  ],
  stories: [
    { icon: "✦", label: "Pretty Lights Tour",   tagline: "Hampton · St. Augustine · Red Rocks · Vegas",         desc: "The Pretty Lights run — from Hampton to St. Augustine, the birthday show at Red Rocks, Halloween in Las Vegas." },
    { icon: "⚡", label: "Electric Forest",       tagline: "Wrong-way Ubers and Beam Team scooters.",             desc: "Electric Forest memories — the infamous wrong-way Uber story and the Beam Team scooter era." },
    { icon: "◎", label: "Road Trips + Camping",  tagline: "Joshua Tree · Integratron · Palm Desert",             desc: "Off-the-clock adventures — Joshua Tree desert trips, the Integratron sound bath experience, Palm Desert explorations." }
  ],
  social: [
    { platform: "Instagram",          handle: "@theoats",            icon: "◆", desc: "The Oats — main feed",              url: "https://instagram.com/theoats" },
    { platform: "Instagram / Threads",handle: "@sleepwellsweetheart",icon: "♫", desc: "Sleepwell Sweetheart — band + music",url: "https://instagram.com/sleepwellsweetheart" },
    { platform: "YouTube",            handle: "Go4Oats Show",        icon: "▶", desc: "Go4Oats Show — long-form content",  url: "https://youtube.com/@go4oats" },
    { platform: "YouTube",            handle: "A.I. Oatmeal",        icon: "⬡", desc: "A.I. Oatmeal Channel — AI content", url: "https://youtube.com/@aioatmeal" }
  ],
  about: {
    headline: "Built on the Road.",
    subheadline: "Twenty years of shows, songs, overnight drives, and building whatever wasn't already on the shelf.",
    paragraphs: [
      "I'm Johnny Bobeng III. Most people call me Oats. Fook'n Oats grew out of loading docks, overnight drives, half-finished songs in green rooms, and the habit of building whatever wasn't already on the shelf.",
      "Touring production is the backbone — lighting design, CAD drafting, LED wall builds, master electrician work. Pretty Lights at Red Rocks and Hampton. Electric Forest. Wiring stages and troubleshooting rigs until the problem is gone. On a real gig, the technical and the creative are the same thing. You don't get to choose just one.",
      "After 2025 — a year with five funerals in it — I stopped doing what was inefficient. Five-week tours mean five weeks of catch-up when you land, and nobody shows up for that part. I'm building toward remote CAD drafting, corporate AV systems, and the Maker-Lab in Kenosha. Things that compound instead of drain.",
      "Around all of it lives the rest: Sleepwell Sweetheart (20 years of music), Revelator Illuminae (creative lighting arm), Falling Star (DJ), AI Oatmeal, and everything else that refuses to fit a clean category. This site is the map. Not a polished deck. Just what I'm actually building and why."
    ],
    tree: [
      { label: "How I Work",    desc: "Show up prepared. Communicate straight. Leave the rig better than I found it. No exceptions." },
      { label: "The Tech",      desc: "Vectorworks. grandMA2/3. Novastar, Brompton, ROE. Twenty years of solving problems at 2 AM in dark rooms." },
      { label: "Creative Side", desc: "Revelator Illuminae for design. Sleepwell Sweetheart for music. Falling Star for DJ sets. AI Oatmeal for everything in between." },
      { label: "Building Now",  desc: "Remote CAD drafting. Corporate AV deployments. The Maker-Lab in Kenosha. Systems that work without five-week tours." },
      { label: "Road Stories",  desc: "Pretty Lights at Red Rocks. Electric Forest. The Integratron sound bath. Twenty years of them." }
    ]
  },
  shows: Array.from({length: 17}, (_, i) => {
    const nums = [1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18];
    return `./images/shows/show-${nums[i]}.jpg`;
  })
};
