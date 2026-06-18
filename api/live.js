// Returns {live:bool, videoId:string|null}. Uses a stored refresh token to see the channel's OWN
// active broadcasts (works for UNLISTED). Falls back to {live:false} on any error.
let _cache = { at: 0, data: null };
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=30"); // edge-cache 30s to save quota
  const now = Date.now();
  if (_cache.data && now - _cache.at < 25000) { res.status(200).json(_cache.data); return; }

  const CLIENT_ID = process.env.YT_CLIENT_ID;
  const CLIENT_SECRET = process.env.YT_CLIENT_SECRET;
  const REFRESH = process.env.YT_REFRESH_TOKEN;
  const out = { live: false, videoId: null };
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH) { res.status(200).json(out); return; }
  try {
    // 1) refresh -> access token
    const tr = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, refresh_token: REFRESH, grant_type: "refresh_token" })
    });
    const tj = await tr.json();
    if (!tj.access_token) { res.status(200).json(out); return; }
    // 2) active broadcasts on MY channel (sees unlisted/private)
    const br = await fetch("https://www.googleapis.com/youtube/v3/liveBroadcasts?part=id,status&broadcastStatus=active&broadcastType=all&maxResults=1", {
      headers: { Authorization: "Bearer " + tj.access_token }
    });
    const bj = await br.json();
    if (bj.items && bj.items.length) { out.live = true; out.videoId = bj.items[0].id; }
    _cache = { at: now, data: out };
    res.status(200).json(out);
  } catch (e) { res.status(200).json(out); }
}
