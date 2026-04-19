/**
 * Returns the backend base URL including `/api` (same convention as axios `baseURL` in authService).
 * `VITE_API_URL` may be set to either `https://host` or `https://host/api` on Render — both work.
 */
export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL

  let root
  if (fromEnv != null && String(fromEnv).trim() !== '') {
    root = String(fromEnv).trim().replace(/\/+$/, '')
  } else if (typeof window === 'undefined') {
    root = 'http://localhost:5000'
  } else {
    const { protocol, hostname } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      root = `${protocol}//${hostname}:5000`
    } else {
      root = 'https://swatchmitra-backend.onrender.com'
    }
  }

  if (!root.endsWith('/api')) {
    return `${root}/api`
  }
  return root
}
