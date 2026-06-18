// One-time: redirects you to Google consent to authorize the channel.
export default function handler(req, res) {
  const CLIENT_ID = process.env.YT_CLIENT_ID;
  const REDIRECT = "https://fookn-oats.enterprises/api/oauth-callback";
  if (!CLIENT_ID) { res.status(500).send("Missing YT_CLIENT_ID env var"); return; }
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: "https://www.googleapis.com/auth/youtube.force-ssl"
  });
  res.writeHead(302, { Location: "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString() });
  res.end();
}
