import { APPS_SCRIPT_URL } from '../config'

const AUTH_ERROR_MARKERS = [
  'idtoken',
  'unauthorized',
  'token audience',
  'invalid idtoken',
  'missing idtoken',
]

export class ApiError extends Error {
  constructor(message, { authFailed = false } = {}) {
    super(message)
    this.name = 'ApiError'
    this.authFailed = authFailed
  }
}

function looksLikeAuthError(message) {
  const lower = (message || '').toLowerCase()
  return AUTH_ERROR_MARKERS.some((marker) => lower.includes(marker))
}

/**
 * Every request is a POST with a text/plain body (not application/json and
 * no custom headers) so the browser treats it as a CORS "simple request"
 * and skips the OPTIONS preflight that Apps Script Web Apps can't answer.
 */
export function postAction(action, payload, idToken) {
  if (!READ_ACTION.test(action)) return enqueue(() => sendAction(action, payload, idToken))

  // Reads issued in the same tick (a page mounting several hooks) are
  // collected and sent as one `batch` request, so a page load costs one
  // Apps Script execution instead of one per hook. Identical reads share
  // a single slot.
  const key = action + JSON.stringify(payload ?? {})
  const existing = pendingReads.get(key)
  if (existing) return existing.promise

  const entry = { action, payload: payload ?? {}, idToken }
  entry.promise = new Promise((resolve, reject) => {
    entry.resolve = resolve
    entry.reject = reject
  })
  pendingReads.set(key, entry)
  if (!flushTimer) flushTimer = setTimeout(flushReads, BATCH_WINDOW_MS)
  return entry.promise
}

const READ_ACTION = /\.(list|balances)$/
const BATCH_WINDOW_MS = 10
const pendingReads = new Map()
let flushTimer = null

function flushReads() {
  flushTimer = null
  const entries = [...pendingReads.values()]
  pendingReads.clear()
  if (entries.length === 0) return

  if (entries.length === 1) {
    const [only] = entries
    enqueue(() => sendAction(only.action, only.payload, only.idToken)).then(only.resolve, only.reject)
    return
  }

  const requests = entries.map(({ action, payload }) => ({ action, payload }))
  enqueue(() => sendAction('batch', { requests }, entries[0].idToken)).then(
    (results) => {
      entries.forEach((entry, index) => {
        const result = results[index]
        if (result?.ok) {
          entry.resolve(result.data)
        } else {
          const message = result?.error || 'Request failed.'
          entry.reject(new ApiError(message, { authFailed: looksLikeAuthError(message) }))
        }
      })
    },
    (err) => entries.forEach((entry) => entry.reject(err)),
  )
}

// Apps Script allows only ~30 simultaneous executions per account, and the
// dashboard alone fires 8+ requests on load. Cap how many run at once and
// queue the rest.
const MAX_CONCURRENT_REQUESTS = 3
const queue = []
let activeRequests = 0

function enqueue(task) {
  return new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject })
    drainQueue()
  })
}

function drainQueue() {
  while (activeRequests < MAX_CONCURRENT_REQUESTS && queue.length > 0) {
    const { task, resolve, reject } = queue.shift()
    activeRequests += 1
    task()
      .then(resolve, reject)
      .finally(() => {
        activeRequests -= 1
        drainQueue()
      })
  }
}

async function sendAction(action, payload, idToken) {
  if (!APPS_SCRIPT_URL) {
    throw new ApiError(
      'VITE_APPS_SCRIPT_URL is not configured. Add it to your .env file.',
    )
  }

  let response
  try {
    response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, idToken, payload }),
    })
  } catch {
    throw new ApiError('Could not reach the server. Check your connection and try again.')
  }

  let json
  try {
    json = await response.json()
  } catch {
    throw new ApiError('Received an unexpected response from the server.')
  }

  if (!json.ok) {
    throw new ApiError(json.error || 'Request failed.', {
      authFailed: looksLikeAuthError(json.error),
    })
  }

  return json.data
}
