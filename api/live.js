// Returns {live, videoId}. OAuth as the channel owner -> sees UNLISTED lives.
// Robust: lists recent broadcasts, then confirms true live via liveStreamingDetails
// (actualStartTime present, actualEndTime absent). Handles "stream now" broadcasts
// that don't reliably show under broadcastStatus=active.
let _cache = { at: 0, data: null };
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=30");
  const now = Date.now();
  if (_cache.data && now - _cache.at < 25000) { return res.status(200).json(_cache.data); }

  const { YT_CLIENT_ID:CID, YT_CLIENT_SECRET:SECRET, YT_REFRESH_TOKEN:REFRESH } = process.env;
  const out = { live:false, videoId:null };
  if (!CID || !SECRET || !REFRESH) return res.status(200).json(out);
  try {
    const tr = await fetch("https://oauth2.googleapis.com/token", {
      method:"POST", headers:{ "Content-Type":"application/x-www-form-urlencoded" },
      body:new URLSearchParams({ client_id:CID, client_secret:SECRET, refresh_token:REFRESH, grant_type:"refresh_token" })
    });
    const tj = await tr.json();
    if (!tj.access_token) { return res.status(200).json(out); }
    const auth = { Authorization:"Bearer "+tj.access_token };

    // 1) fast path: active broadcasts
    let ids = [];
    try {
      const ar = await fetch("https://www.googleapis.com/youtube/v3/liveBroadcasts?part=id&broadcastStatus=active&broadcastType=all&maxResults=5", { headers:auth });
      const aj = await ar.json();
      ids = (aj.items||[]).map(i=>i.id);
    } catch(e){}

    // 2) fallback: recent broadcasts, verify real live state
    if (!ids.length) {
      const lr = await fetch("https://www.googleapis.com/youtube/v3/liveBroadcasts?part=id&mine=true&maxResults=10", { headers:auth });
      const lj = await lr.json();
      ids = (lj.items||[]).map(i=>i.id);
    }
    if (ids.length) {
      const vr = await fetch("https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails,snippet&id="+ids.join(","), { headers:auth });
      const vj = await vr.json();
      for (const it of (vj.items||[])) {
        const d = it.liveStreamingDetails||{};
        const sn = it.snippet||{};
        const isLive = (sn.liveBroadcastContent==="live") || (d.actualStartTime && !d.actualEndTime);
        if (isLive) { out.live=true; out.videoId=it.id; break; }
      }
    }
    _cache = { at:now, data:out };
    return res.status(200).json(out);
  } catch(e) { return res.status(200).json(out); }
}
