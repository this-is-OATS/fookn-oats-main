// One-time: exchanges the code for a refresh token and displays it ONCE so it can be stored as an env var.
export default async function handler(req, res) {
  const CLIENT_ID = process.env.YT_CLIENT_ID;
  const CLIENT_SECRET = process.env.YT_CLIENT_SECRET;
  const REDIRECT = "https://fookn-oats.enterprises/api/oauth-callback";
  const code = (req.query && req.query.code) || "";
  if (!code) { res.status(400).send("No code"); return; }
  if (!CLIENT_ID || !CLIENT_SECRET) { res.status(500).send("Missing YT_CLIENT_ID / YT_CLIENT_SECRET env vars"); return; }
  try {
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT, grant_type: "authorization_code"
      })
    });
    const j = await r.json();
    if (!j.refresh_token) { res.status(200).send("No refresh_token returned. Make sure you used prompt=consent and the account hasn't already authorized. Response: " + JSON.stringify(j)); return; }
    res.setHeader("Content-Type", "text/html");
    res.status(200).send("<body style='font-family:monospace;background:#090909;color:#ffb400;padding:40px;line-height:1.7'>" +
      "<h2>Refresh token captured</h2><p>Copy this and store it as the Vercel env var <b>YT_REFRESH_TOKEN</b>, then redeploy. Do not share it.</p>" +
      "<textarea style='width:100%;height:120px;background:#000;color:#fff;border:1px solid #333;padding:12px'>" + j.refresh_token + "</textarea>" +
      "<p>After saving the env var, you can delete /api/oauth-start and /api/oauth-callback.</p></body>");
  } catch (e) { res.status(500).send("Error: " + e.message); }
}
