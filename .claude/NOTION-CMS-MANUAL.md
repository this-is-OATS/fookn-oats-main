# FOOK'N OATS — Notion CMS User Manual
*How to write site copy in Notion and push it live*

---

## The Big Picture

Your site copy lives in Notion. You write and edit it there. When you're happy with something, you mark it **Approved**. Then you open a Claude Code session and run `/deploy-from-notion` — Claude reads every Approved section, updates the site files, and pushes live. Done.

```
Notion (write here)
  → mark section Approved
  → open Claude Code session
  → type: /deploy-from-notion
  → live at fookn-oats.enterprises in ~30 seconds
```

---

## The Database: FOOK'N OATS — Site Content Engine

This Notion database is your control panel. One row per site section.

### Columns

| Column | What it is |
|--------|-----------|
| **Section** | Name of the site section (e.g. "Master Electrician") |
| **Site Key** | The code that tells the deploy command where this copy goes |
| **Status** | Where it is in the workflow |
| **Last Deployed** | Date it was last pushed live |
| **Notes** | Internal notes, reminders, ideas |

### Status Workflow

```
Not Started → In Interview → Draft Ready → Approved → Shipped
```

- **Not Started** — hasn't been touched yet
- **In Interview** — Claude is interviewing you about this section
- **Draft Ready** — copy is written, needs your review
- **Approved** — you've signed off, ready to deploy
- **Shipped** — deployed to the live site

---

## Every Section and Its Site Key

| Section Name | Site Key | What it controls |
|---|---|---|
| Home | `home` | Homepage description + eyebrow text |
| Services Overview | `services` | Services section tagline + intro |
| CAD & Drafting | `dept.cad` | CAD service tagline, desc, bullets |
| Master Electrician | `dept.gaffer` | ME service tagline, desc, bullets |
| LED Wall Tech | `dept.led` | LED service tagline, desc, bullets |
| Consulting & Quotes | `dept.consult` | Consulting service tagline, desc, bullets |
| Maker-Lab | `dept.makerlab` | Maker-Lab service tagline, desc, bullets |
| Design Network | `dept.designnet` | Design Network tagline, desc, bullets |
| Brands Overview | `brands` | Brands section tagline + intro |
| Revelator Illuminae | `brand.revelator` | Revelator brand desc + bullets |
| Sleepwell Sweetheart | `brand.sleepwell` | Sleepwell brand desc + bullets |
| AI Oatmeal | `brand.aioatmeal` | AI Oatmeal brand desc + bullets |
| Ghosted Oats | `brand.ghosted` | Ghosted Oats brand desc + bullets |
| Cryptos4Oats | `brand.crypto` | Crypto brand desc + bullets |
| Falling Star | `brand.fallingstar` | Falling Star brand desc + bullets |
| Studio | `studio` | Studio section desc + bullets |
| Stories | `stories` | Stories section tagline + desc |
| EDM Feed | `edm` | EDM section desc + bullets |
| Connect | `connect` | Connect section desc + bullets |
| About — Paragraphs | `about` | The 4 main About paragraphs |
| About — Tree | `about.tree` | The 5 "How I Work / The Tech / etc." items |
| Ticker | `ticker` | The scrolling top banner text |

---

## How to Write Copy in Notion

Each section row in the database opens into a page. The page has three sections:

### 1. Questions
The interview questions for that section. Read these to know what to address.

### 2. Your Answers
Write rough notes here. Bullet points, voice memo transcripts, stream of consciousness — anything. This is your raw material. Claude reads this when generating copy.

### 3. Generated Copy
Polished, site-ready copy that Claude writes based on your answers. This is what gets deployed. You can edit it directly here before approving.

---

## Workflow Option A: Interview Mode (Recommended)

Use this when you want Claude to pull the copy out of you conversationally.

1. Open a Claude Code session
2. Type: `/interview` — Claude picks the next Not Started section automatically
   - Or: `/interview CAD` — target a specific section by name
   - Or: `/interview all` — queue every Not Started section
3. Answer Claude's questions one at a time — be as raw or polished as you want
4. Claude summarizes what it heard and shows you the generated copy
5. Say "looks good" → Claude marks it **Approved** in Notion
6. Or say "change X" → Claude revises and shows you again
7. When done interviewing, run `/deploy-from-notion` to push everything Approved

---

## Workflow Option B: Write It Yourself

Use this when you already know what you want to say.

1. Open the Content Engine database in Notion
2. Click into the section you want to update
3. Write your copy directly in the **Generated Copy** section
4. Change Status to **Approved**
5. Open a Claude Code session
6. Type: `/deploy-from-notion`
7. Claude reads all Approved sections, shows you what will change, asks for confirmation
8. Say yes → it pushes live and marks those sections **Shipped**

---

## Workflow Option C: Quick Edit (Bypass Notion)

Use this for fast one-liner changes that don't need a full copy review.

Just tell Claude directly in the chat:

> "Change the ticker text to: FOOK'N OATS • AVAILABLE FOR FESTIVAL SEASON 2027"

> "Update the Maker-Lab tagline to: 3D printing, embroidery, vinyl — in Kenosha."

> "Add vinyl cutting to the LED Wall bullets."

Claude makes the change, bumps the version, and pushes immediately. No Notion needed.

---

## The Deploy Command: What Happens

When you run `/deploy-from-notion`, Claude:

1. Reads the Content Engine database
2. Finds every row with Status = **Approved**
3. Reads the Generated Copy from each page
4. Shows you a diff of exactly what will change — **nothing is written yet**
5. Asks for your confirmation
6. Writes changes to `site.js` and `index.html`
7. Bumps the version number
8. Commits and pushes to GitHub
9. Marks those sections **Shipped** in Notion

The site goes live in ~30 seconds via GitHub Actions.

---

## Rules

- **Never deploy without reviewing the diff.** Claude always shows you before writing.
- **Only Approved sections deploy.** Draft Ready, In Interview — those never touch the live site.
- **Version bumps on every push.** The version badge in the nav updates automatically.
- **Coding/architecture content from voice memos → Claude Cowork, not Daily Field Logs.**

---

## Tone Guide (for writing copy yourself)

The site tone is:
- **Professional but not corporate** — real names, real places, real tools
- **Specific over vague** — "Vectorworks" not "drafting software", "grandMA2/3" not "lighting console"
- **First person, active voice** — "I run load-ins" not "load-ins are managed"
- **Short sentences. No filler.** Cut "leverage", "synergy", "solutions"
- **Confident without overselling** — state what you do, let it speak

---

## Quick Reference

| I want to... | Do this |
|---|---|
| Write copy for a new section | `/interview [section name]` |
| Update copy I already wrote | Edit Generated Copy in Notion → mark Approved → `/deploy-from-notion` |
| Make a quick one-line change | Tell Claude directly in chat |
| Push everything approved | `/deploy-from-notion` |
| See what's been written so far | Open FOOK'N OATS — Site Content Engine in Notion |
| Check what's live on the site | Visit fookn-oats.enterprises |

---

*Last updated: 2026.06.22*
