# /deploy-from-notion — Deploy approved Notion copy to the live site

Read all "Approved" sections from the FOOK'N OATS Site Content Engine database,
map generated copy to the right fields in site.js, index.html, and ticker.json, commit, and push.

## Steps

1. **Fetch approved sections** — search Notion for "FOOK'N OATS — Site Content Engine",
   filter rows where Status = "Approved". List them for the user before making any changes.

2. **Read generated copy** — for each approved section, fetch the Notion page and
   extract the text under the "Generated Copy" heading.

3. **Map to site files** — use the section's "Site Key" field to know where to write:

   | Site Key          | File        | What to update                            |
   |-------------------|-------------|-------------------------------------------|
   | home              | index.html  | home-desc text, eyebrow                   |
   | services          | index.html  | SECTIONS[0] tagline + desc                |
   | dept.cad          | index.html  | DEPARTMENTS[0] tagline + desc + bullets   |
   | dept.gaffer       | index.html  | DEPARTMENTS[1] tagline + desc + bullets   |
   | dept.led          | index.html  | DEPARTMENTS[2] tagline + desc + bullets   |
   | dept.consult      | index.html  | DEPARTMENTS[3] tagline + desc + bullets   |
   | dept.makerlab     | index.html  | DEPARTMENTS[4] tagline + desc + bullets   |
   | dept.designnet    | index.html  | DEPARTMENTS[5] tagline + desc + bullets   |
   | brands            | index.html  | SECTIONS[1] tagline + desc                |
   | brand.revelator   | index.html  | BRANDS[0] tagline + desc + bullets        |
   | brand.sleepwell   | index.html  | BRANDS[1] tagline + desc + bullets        |
   | brand.aioatmeal   | index.html  | BRANDS[2] tagline + desc + bullets        |
   | brand.ghosted     | index.html  | BRANDS[3] tagline + desc + bullets        |
   | brand.crypto      | index.html  | BRANDS[4] tagline + desc + bullets        |
   | brand.fallingstar | index.html  | BRANDS[5] tagline + desc + bullets        |
   | studio            | index.html  | studio detailPage desc + bullets          |
   | stories           | index.html  | SECTIONS[3] tagline + desc + bullets      |
   | edm               | index.html  | EDM detailPage desc + bullets             |
   | connect           | index.html  | Connect detailPage desc + bullets         |
   | about             | site.js     | about.paragraphs array                    |
   | about.tree        | site.js     | about.tree array                          |
   | ticker            | ticker.json | .text field (NOT site.js — ticker.json is the live source)

4. **Show diff** — show the user exactly what will change before writing anything.
   Get confirmation before proceeding.

5. **Write changes** — apply all updates to the files.

6. **Bump version** — increment the patch version in site.js and index.html
   (e.g., v1.0.2 → v1.0.3) and update the date to today.

7. **Commit and push** — commit with message:
   "Deploy approved copy from Notion Content Engine — [section list]"
   Push to main.

8. **Mark Shipped in Notion** — update Status of all deployed sections to "Shipped".

## Safety rules

- Never deploy a section with Status other than "Approved"
- Always show the diff and get confirmation before writing to files
- If a Site Key is missing or unrecognized, skip that section and warn the user
