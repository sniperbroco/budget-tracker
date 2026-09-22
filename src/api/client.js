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
export async function postAction(action, payload, idToken) {
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
