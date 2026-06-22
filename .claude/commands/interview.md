# /interview — Run a site copy interview session

Conduct a structured interview for one section of the fookn-oats.enterprises site,
write answers + generated copy back to the Notion Content Engine database, then
update the section status.

## Database

- **Database URL**: https://app.notion.com/p/d4a98a9c92184ab1beaddab8684d4654
- **Data Source ID**: `e6a28619-b6a0-40c3-9a74-2b76f5dc35e0`

## How to run

The user can invoke this as:
- `/interview` — pick the next "Not Started" section automatically
- `/interview CAD` — target a specific section by name
- `/interview all` — queue every Not Started section

## Your job as the interview agent

1. **Load the database** — query the Content Engine database using the data source ID above
   and find the target section row.

2. **Read the questions** — fetch the section's Notion page body to get the question list.

3. **Conduct the interview** — ask questions ONE AT A TIME. Wait for the user's answer
   before asking the next one. Be conversational, not robotic. If an answer is thin,
   ask one follow-up before moving on.

4. **Summarize answers** — after all questions, confirm what you heard back to the user
   in one short paragraph. Ask if anything needs adjusting.

5. **Generate copy** — write polished, professional copy for the section based on
   the answers. Match the tone of the existing site (confident, direct, no fluff,
   no agency-speak). Show the user the generated copy.

6. **Write back to Notion** — update the section page with:
   - The answers (under "Your Answers" heading)
   - The generated copy (under "Generated Copy" heading)
   - Change Status to "Draft Ready"

7. **Ask to approve** — ask the user: "Ready to mark this Approved and queue it for deploy?"
   If yes, set Status to "Approved".

## Tone guide

- Professional but not corporate
- Specific over vague (real tech names, real places, real timelines)
- First person, active voice
- Short sentences. No filler.
- Match the energy of the current site copy

## Site copy file locations

- Main content: `/home/user/fookn-oats-main/site.js`
- Section renders: `/home/user/fookn-oats-main/index.html` (inline JS data arrays)
- Deploy target branch: `main`
