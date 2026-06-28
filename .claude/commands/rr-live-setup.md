# /rr-live-setup — Rolled & Recorded Live Production Setup

**Rolled & Recorded is a play session for techies.** The whole point is that the room is small, the gear is real, and the production is visible. Keep it raw but tight.

## Camera: iPhone NDI (the witless cam)

Grab any spare iPhone. Install an NDI camera app:

- **NDI Camera** (Vizrt / NewTek — free) — the standard, works reliably
- **Mango NDI** — alternative, slightly better UI on older phones
- **Capture: NDI Camera** — another solid option

### Setup steps

1. Connect the iPhone to the same local network as the streaming machine (WiFi or hotspot off the production laptop)
2. Open the NDI camera app — it immediately starts broadcasting on the network
3. In OBS / vMix / Wirecast, add an **NDI Source** input — the iPhone will appear by name
4. Frame it as a wide room shot, crowd angle, or behind-the-DJ perspective
5. Label the scene in OBS: "iPhone — Room Wide" or similar

### OBS NDI plugin

If OBS doesn't have NDI natively:
- Install the **obs-ndi** plugin: https://github.com/obs-ndi/obs-ndi
- Restart OBS — NDI Source will appear as an input type

### Notes

- iPhone battery drains fast on NDI — keep it plugged in or top it up before the session
- Latency is low but not zero (~1–3 frames) — fine for a B-roll / cut camera, not for a main locked shot
- Works on any iPhone (even older ones) — no need for a high-end device
- Multiple iPhones can run simultaneously as separate NDI sources

---

## Stream target

Update `rr-events/[slug].json` when going live:

```json
"status": "live",
"live": {
  "videoId": "YOUTUBE_VIDEO_ID",
  "nowPlaying": "Feature Set — ƒalling Star"
}
```

`videoId` is the YouTube live stream ID from the broadcast dashboard.
`nowPlaying` should match a `label` in the `schedule` array exactly — the schedule renders a NOW indicator on the matching row.

---

## Pre-show checklist

- [ ] iPhone NDI camera connected + framed
- [ ] OBS NDI source live in scene
- [ ] YouTube stream key entered in OBS
- [ ] Stream started on YouTube (set to Public or Unlisted)
- [ ] `status` → `"live"` and `live.videoId` set in session JSON
- [ ] Push JSON, confirm deploy (~1 min)
- [ ] Reload event page — live player should appear
