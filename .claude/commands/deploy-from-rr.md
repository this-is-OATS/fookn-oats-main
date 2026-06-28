# /deploy-from-rr — Deploy Rolled & Recorded content from Notion to the live site

Reads content from the **🥣 EDM Oatmeal Presents: Rolled & Recorded** Notion wiki
and writes it into `rolled-recorded.json`, commits, and pushes.

## Notion source pages

| Page | URL | Maps to |
|------|-----|---------|
| Concept & Format | https://app.notion.com/9516e6ecd9d045f495ef883612b5e00b | `concept` |
| Talent & Collabs (Artists) | https://app.notion.com/8477e91a0d2e452fb71c54c0eabdcf64 | `lineup[]` |
| Run of Show (Experience Design) | https://app.notion.com/a1e82a0faad04e57a6804b3583de772c | `schedule[]` |

## Steps

1. **Fetch all three Notion pages** using notion-fetch on each URL above.

2. **Extract content** from each page:

   ### Concept & Format → `concept`
   - `headline` — take the first heading or bold statement from "Core concept" section
   - `body` — synthesize the core concept bullets into 2–3 prose sentences
   - If the page has a "Published tagline" or "Event description" heading, use that text verbatim

   ### Talent & Collabs → `lineup[]`
   - Each artist entry (artist name, role, set time, bio) maps to one object in the array:
     ```json
     { "name": "...", "role": "...", "setTime": "...", "bio": "..." }
     ```
   - If the page has no confirmed artists yet, set `lineup` to `[]`
   - Roles: "Headliner", "DJ", "Live Act", "Support" — use what's in Notion

   ### Run of Show → `schedule[]`
   - Each line item in the "Flow" section maps to one object:
     ```json
     { "time": "...", "label": "...", "note": "..." }
     ```
   - If times are not set, use `"TBD"` for the time field
   - If notes are blank, use `""`

3. **Read the current `rolled-recorded.json`** to understand what's already there.

4. **Show the proposed changes** as a before/after diff of the JSON fields being updated.
   Do NOT write anything yet — show the diff and ask for confirmation.

5. **On confirmation** — write the updated `rolled-recorded.json`.

6. **Also update `event` fields** if the Notion pages reference them:
   - `event.date` — if a specific date is mentioned
   - `event.dateDisplay` — human-readable date string (e.g. "Saturday, Aug 16, 2026")
   - `event.status` — `"coming_soon"`, `"live"`, or `"past"`
   - `event.location` — if updated in Notion

7. **Commit and push**:
   ```
   git add rolled-recorded.json
   git commit -m "Deploy Rolled & Recorded content from Notion — [sections updated]"
   git push -u origin claude/edm-oatmeal-presents-6zqnb9
   ```

## Safety rules

- Never overwrite a field with an empty value unless the Notion source is explicitly cleared
- Always preserve fields not covered by this update (e.g. `rsvp.formspreeId`, `links`)
- Show the diff, get confirmation before writing
- If a Notion page is empty or unedited, skip that section and note it

## Adding a new event / Copycat session

When running a "Copycat Event" from the Notion template:
1. Fetch the Copycat Event page from the wiki
2. Treat it as the primary source for that session's lineup and schedule
3. Event-level fields (presenter, name, tagline) stay the same
4. Update `event.date`, `event.dateDisplay`, and `event.status` for the session
