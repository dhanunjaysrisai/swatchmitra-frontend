import { getApiBaseUrl } from '../config/apiBase'

/**
 * @param {FormData} formData — fields: image (File), perceptualHash, label, confidencePercent, points
 */
export async function submitMissionCapture(formData) {
  const token = localStorage.getItem('token')
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/mission/captures`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || data.error || 'Could not save capture')
    err.status = res.status
    err.duplicate = data.duplicate === true
    throw err
  }
  return data
}
