// Hostname-aware password gate.
//
// Goal: password-protect the bare Vercel domain(s) (e.g. fookn-oats-web.vercel.app
// and any other *.vercel.app alias) WITHOUT touching the real custom domain
// (fookn-oats.enterprises / www.fookn-oats.enterprises), and WITHOUT blocking
// the public decoy page (/edm-lite) or the assets/APIs it depends on, no matter
// which domain it's reached through.
//
// Credentials are read from environment variables so they're never committed
// to the repo. Set SITE_GATE_USER and SITE_GATE_PASS in Vercel project settings.

export const config = {
  runtime: 'edge',
};

// Paths that should NEVER be gated, regardless of hostname.
// Keep this in sync with whatever /edm-lite needs to render.
const ALWAYS_OPEN = [
  '/edm-lite',
  '/edm-lite-og.png',
  '/will-oats-tree-og.png',
  '/site.js',
  '/live.json',
  '/api/live',
  '/api/oauth-start',
  '/api/oauth-callback',
  '/favicon.ico',
];

// Hostnames that should NEVER be gated (the real production domain).
const OPEN_HOSTS = new Set([
  'fookn-oats.enterprises',
  'www.fookn-oats.enterprises',
]);

function isAlwaysOpenPath(pathname) {
  return ALWAYS_OPEN.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
}

function unauthorized() {
  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Restricted", charset="UTF-8"',
    },
  });
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const host = request.headers.get('host') || '';

  // Real domain: never gate.
  if (OPEN_HOSTS.has(host)) {
    return undefined; // fall through to normal routing
  }

  // Decoy page + its dependencies: never gate, on any host.
  if (isAlwaysOpenPath(url.pathname)) {
    return undefined;
  }

  // Everything else on the bare Vercel domain: require Basic Auth.
  const user = process.env.SITE_GATE_USER;
  const pass = process.env.SITE_GATE_PASS;

  // Safety: if env vars aren't set, don't lock everyone out accidentally —
  // fail open and log, rather than fail closed with no way to fix it without redeploying.
  if (!user || !pass) {
    console.warn('SITE_GATE_USER/SITE_GATE_PASS not set — skipping auth gate.');
    return undefined;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return unauthorized();
  }

  const base64Credentials = authHeader.slice('Basic '.length);
  let decoded;
  try {
    decoded = atob(base64Credentials);
  } catch {
    return unauthorized();
  }

  const sepIndex = decoded.indexOf(':');
  const suppliedUser = sepIndex >= 0 ? decoded.slice(0, sepIndex) : decoded;
  const suppliedPass = sepIndex >= 0 ? decoded.slice(sepIndex + 1) : '';

  if (suppliedUser !== user || suppliedPass !== pass) {
    return unauthorized();
  }

  return undefined; // credentials OK, continue to normal routing
}
