/**
 * Canonical API base for axios + fetch: exactly one `/api` suffix.
 * Handles Render env mistakes like `.../api` or `.../api/api` in `VITE_API_URL`.
 */
export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL

  let candidate
  if (fromEnv != null && String(fromEnv).trim() !== '') {
    candidate = String(fromEnv).trim()
  } else if (typeof window === 'undefined') {
    candidate = 'http://localhost:5000'
  } else {
    const { protocol, hostname } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      candidate = `${protocol}//${hostname}:5000`
    } else {
      candidate = 'https://swatchmitra-backend.onrender.com'
    }
  }

  candidate = candidate.replace(/\/+$/, '')
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate.replace(/^\/+/, '')}`
  }

  try {
    const u = new URL(candidate)
    let path = u.pathname.replace(/\/+$/, '')
    if (path === '/') path = ''
    let base = `${u.origin}${path}`
    base = base.replace(/(\/api)+$/i, '')
    return `${base}/api`
  } catch {
    return 'http://localhost:5000/api'
  }
}
