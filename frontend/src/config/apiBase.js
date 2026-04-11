/**
 * Backend API base (e.g. http://192.168.1.5:5000/api).
 * - Set VITE_API_URL in .env for production or custom ports.
 * - Otherwise uses the same hostname as the current page with port 5000 so
 *   opening the app at http://<your-LAN-ip>:5173 talks to http://<same-ip>:5000
 *   instead of the device’s own localhost (which caused "Failed to fetch").
 */
export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL
  if (fromEnv != null && String(fromEnv).trim() !== '') {
    return String(fromEnv).replace(/\/$/, '')
  }
  if (typeof window === 'undefined') {
    return 'http://localhost:5000/api'
  }
  const { protocol, hostname } = window.location
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:5000/api`
  }
  return `${protocol}//${hostname}:5000/api`
}
