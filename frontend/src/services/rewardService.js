const STORAGE_PREFIX = 'swachhmitra_rewards_v1'

export function getRewardsStorageKey(userKey) {
  const key = userKey || 'anon'
  return `${STORAGE_PREFIX}:${key}`
}

export function loadRewards(userKey) {
  const storageKey = getRewardsStorageKey(userKey)
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return { totalPoints: 0, events: [] }
    const parsed = JSON.parse(raw)
    return {
      totalPoints: Number(parsed.totalPoints || 0),
      events: Array.isArray(parsed.events) ? parsed.events : [],
    }
  } catch {
    return { totalPoints: 0, events: [] }
  }
}

export function addRewardEvent(userKey, event) {
  const storageKey = getRewardsStorageKey(userKey)
  const current = loadRewards(userKey)

  const points = Math.max(0, Math.floor(Number(event?.points || 0)))
  const safeEvent = {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    at: new Date().toISOString(),
    points,
    percent: Math.max(0, Math.min(100, Math.round(Number(event?.percent || 0)))),
    label: event?.label || '',
  }

  const next = {
    totalPoints: current.totalPoints + points,
    events: [safeEvent, ...current.events].slice(0, 30), // keep last 30 events
  }

  localStorage.setItem(storageKey, JSON.stringify(next))
  return next
}

