// ============================================================
// FOOK'N OATS — SITE CONTENT
// Edit this file to update your site. Then hit Deploy in Cowork.
// Version: see SITE.version below (single source of truth)
// ============================================================

const SITE = {
  title: "FOOK'N OATS",
  version: "v1.7.0 · 2026.06.16",   // ← SINGLE SOURCE OF TRUTH for the badge. Bump this only.
  youtube: { channelId: "UCa-9QRISRcW6xVLrMvZ4Egg", fallbackVideoId: "_xyCffufcbs", liveVideoId: "" },  // SET liveVideoId to the stream video id when live (works for UNLISTED); clear to "" when done.
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
    { icon: "◈", label: "CAD & Drafting",       tagline: "Precision drafts. Light plots. Renderings and previz.",               desc: "Vectorworks drafting for lighting plots, rigging designs, stage layouts, venue paperwork, event site plans, and previsualization. Festivals, street fests, specialty activations. Remote-deliverable. Days, not weeks." },
    { icon: "⚡", label: "Master Electrician",   tagline: "On-site supervision. Efficiency under pressure.",        desc: "The ME job isn't doing everything — it's seeing everything. I run load-ins as an efficiency officer: observing the full operation, finding the problems others are too busy to notice, and correcting before showtime. Available for tours, installs, and one-offs." },
    { icon: "▦", label: "LED Wall Tech",         tagline: "Pixel-perfect builds. LED wall systems.",               desc: "LED wall construction, configuration, and in-show technician services. From spec to strike. Novastar, Brompton, ROE, and custom panels. LED is a team hire — I come in as the dedicated wall tech so the rig gets the attention it needs." },
    { icon: "◎", label: "Consulting & Quotes",  tagline: "Not sure what you need? Start here.",            desc: "Project scoping, vendor recommendations, budget reviews, and production planning — without the agency markup." },
    { icon: "⚙", label: "Maker-Lab",            tagline: "Fabrication. Prototyping. Hands-on builds.",            desc: "In-house maker lab for custom fabrication and production builds. Active now: 3D printing, embroidery, and vinyl cutting. Laser CNC is planned and sourced on demand. From concept to physical product." },
    { icon: "◇", label: "Design Network",        tagline: "Need crew? I know who's good.",        desc: "Years on the road means a deep contact list of lighting techs and crew. If I can't take your gig, I can point you to someone who can." }
  ],
  brands: [
    { icon: "✦", label: "Revelator Illuminae",  tagline: "Lighting design. Visuals. Previz.",                    desc: "The creative lighting arm. Original lighting design, visuals programming, and previsualization services." },
    { icon: "♫", label: "Sleepwell Sweetheart", tagline: "The band. Twenty years of catalog.",                        desc: "Two decades of music. The early catalog, new EDM remixes, and a reunion show actively in development." },
    { icon: "⬡", label: "AI Oatmeal",           tagline: "Content, experiments, and an active coding division.",   desc: "AI-assisted content, memes, storyboards, and a development arm building tools, automations, and web projects. The playground became a pipeline." },
    { icon: "◌", label: "Ghosted Oats",          tagline: "The unpolished stuff. No brand rules.",                 desc: "Sketches, experiments, and personal shots that don't fit a clean brand. No filter, no plan." },
    { icon: "₿", label: "Cryptos4Oats",          tagline: "Market notes from a touring tech.",           desc: "Personal crypto and market-cycle notes — a side interest, shared openly. Not financial advice." },
    { icon: "☆", label: "ƒ//ing::st△r",         tagline: "Electronic producer and composer. Built for the floor.", desc: "Original electronic production and composition — neon visuals, the EDM Oatmeal crew, and the sets that make a room move." }
  ],
  stories: [
    { icon: "✦", label: "Tour Runs",             tagline: "Theaters · Red Rocks · Vegas",                        desc: "The long ones — East Coast theaters, a birthday show at altitude, Halloween in Vegas. The kind that become stories." },
    { icon: "⚡", label: "Electric Forest",       tagline: "Wrong-way Ubers and the scooter era.",                desc: "Electric Forest — the wrong-way Uber, the Beam Team scooters, and the kind of chaos only a forest can produce." },
    { icon: "◎", label: "Desert Resets",          tagline: "Joshua Tree · Integratron · Palm Desert",             desc: "Off the clock and out of range — Joshua Tree, the Integratron sound bath, Palm Desert." }
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
      "Johnny Bobeng III — lighting designer, CAD drafter, LED wall tech, crew chief. Twenty years in live production across festival stages, theater runs, and corporate events. Based in the Chicago–Milwaukee corridor, available to travel.",
      "The work is technical and creative in equal measure. Vectorworks for plots, documentation, and previsualization. grandMA2/3 for programming. Novastar, Brompton, and ROE for LED builds. Master electrician on call for load-ins, installs, and one-offs. If the rig needs to be right by showtime, that's the job — and it always needs to be right by showtime.",
      "Fook'n Oats Enterprises is the umbrella — services, creative projects, and operational systems under one name. Current focus: remote CAD drafting, corporate AV deployments, and the Maker-Lab in Kenosha — 3D printing, embroidery, vinyl cutting, and custom fabrication from concept to physical product.",
      "On the creative side: Sleepwell Sweetheart (twenty years of catalog, reunion show in development), Revelator Illuminae (lighting design and previsualization), Falling Star (electronic production and composition), and AI Oatmeal — content, experiments, and an active coding division building tools and web projects. This site maps the full operation."
    ],
    tree: [
      { label: "How I Work",    desc: "Show up prepared. Communicate straight. Leave the rig better than I found it. No exceptions." },
      { label: "The Tech",      desc: "Vectorworks. grandMA2/3. Novastar, Brompton, ROE. Twenty years of solving problems at 2 AM in dark rooms." },
      { label: "Creative Side", desc: "Revelator Illuminae for design. Sleepwell Sweetheart for music. Falling Star for electronic production. AI Oatmeal for everything in between." },
      { label: "Building Now",  desc: "Remote CAD drafting. Corporate AV deployments. The Maker-Lab in Kenosha. Systems that work without five-week tours." },
      { label: "Road Stories",  desc: "Big festival runs. Electric Forest. The Integratron. A lot of road in between." }
    ]
  },
  shows: Array.from({length: 17}, (_, i) => {
    const nums = [1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18];
    return `./images/shows/show-${nums[i]}.jpg`;
  })
};
