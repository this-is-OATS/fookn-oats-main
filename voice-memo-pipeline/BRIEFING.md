# VOICE MEMO PIPELINE — BUILD BRIEFING
*Paste this at the start of a new Claude chat to continue the build.*

---

## What We're Building

A Mac daemon (Python, runs 24/7 on a Mac Mini) that:
1. Watches the Apple Voice Memos folder for new recordings
2. Extracts the Apple-generated transcription
3. Uploads the audio file + transcription text to a Google Drive folder
4. Creates a new entry in a Notion database (Daily Field Logs) with Status: Draft

No third-party automation tools (no Zapier/Make). Self-contained. Runs as a launchd service.

---

## Architecture

```
iPhone → Voice Memo recorded
  → iCloud sync → Mac Mini
  → ~/Library/Group Containers/
      group.com.apple.VoiceMemos.shared/Recordings/
  → [DAEMON watches this folder]
  → detects new .m4a + .compositeMeta (Apple transcription JSON)
  → uploads audio to Google Drive folder
  → creates Notion Daily Field Log entry (Draft)
     - Has Audio: true
     - Date: recording date
     - Source Recording table: filename, length, Drive link
     - Raw transcript in Notes section
  → (optional) removes local copy from iCloud cache
```

---

## Notion Database

**Database:** Daily Field Logs  
**URL:** https://app.notion.com/p/5c29346dd2624814858fd9d11fab4e7d  
**Collection ID:** `88f987c1-dd6a-4561-bf19-14d19590c656`

### Schema
| Property | Type | Options |
|----------|------|---------|
| Day | title | — |
| Date | date | — |
| Has Audio | checkbox | — |
| Location | text | — |
| Status | select | Logged, Needs Review, Draft |
| Tags | multi_select | Warehouse, Errands, Platform/Numbers, Ideas, Action Items |

### Entry Template Structure
Each Daily Field Log entry has these sections:
- **Today's Vibe** (callout)
- **Warehouse / Ops Log** (callout)
- **Errands** (checklist)
- **Platform Numbers** (two-column: YouTube channels, etc.)
- **Stray Ideas** (callout)
- **Action Items** (checklist)
- **Source Recording** (table: Date, Audio File, Length, Transcript Source)
- **Notes** (raw transcript goes here initially)

> Note from template: "Coding/architecture content from voice memos should be routed to Claude Cowork, not logged here."

---

## Tech Stack

- **Language:** Python 3
- **File watching:** `watchdog`
- **Google Drive:** `google-api-python-client`, `google-auth-oauthlib`
- **Notion:** `notion-client`
- **Audio metadata:** `mutagen` (for duration/length)
- **Run as:** macOS launchd plist (`~/Library/LaunchAgents/`)

---

## What Needs to Be Set Up First

### 1. Verify Voice Memos Sync on Mac Mini
Check that memos are appearing at:
```
~/Library/Group Containers/group.com.apple.VoiceMemos.shared/Recordings/
```
Each memo has:
- `{UUID}.m4a` — the audio
- `{UUID}.compositeMeta` — JSON with transcription, title, date

### 2. Google Drive API Credentials
- Go to console.cloud.google.com
- Create a project (or use existing)
- Enable Google Drive API
- Create OAuth 2.0 credentials (Desktop app)
- Download `credentials.json`
- Target folder: create a folder in Drive called "Voice Memo Archive" and get its folder ID

### 3. Notion API Token
- Go to notion.so/my-integrations
- Create an integration, get the token
- Share the Daily Field Logs database with the integration

---

## Files to Create

```
voice-memo-pipeline/
├── watcher.py          # main daemon — watches folder, orchestrates upload + Notion
├── drive_uploader.py   # Google Drive upload logic
├── notion_logger.py    # Notion page creation logic
├── transcript.py       # extract text from .compositeMeta files
├── config.py           # paths, folder IDs, settings
├── credentials.json    # Google OAuth (not committed to git)
├── token.json          # auto-generated after first auth (not committed to git)
├── requirements.txt
└── com.fooknoats.memowatcher.plist  # launchd service file
```

---

## Starting Prompt for New Chat

> I'm building a Mac daemon in Python that watches the Apple Voice Memos folder, extracts Apple's transcription from .compositeMeta files, uploads audio + transcript to Google Drive, and creates a Draft entry in a Notion database. No existing code yet. Mac Mini runs 24/7. Read the briefing above and let's start with the core watcher and transcript extractor first, then wire in Drive and Notion.
