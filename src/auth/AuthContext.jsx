import { useCallback, useEffect, useState } from 'react'
import { googleLogout, useGoogleOneTapLogin } from '@react-oauth/google'
import { AuthContext } from './authContextObject'

const STORAGE_KEY = 'budget-tracker-auth'
const EMPTY_SESSION = { idToken: null, profile: null }

function decodeIdToken(idToken) {
  try {
    const payload = idToken.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(json)))
  } catch {
    return null
  }
}

function tokenExpiryMs(idToken) {
  const decoded = decodeIdToken(idToken)
  return decoded?.exp ? decoded.exp * 1000 : 0
}

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (!parsed?.idToken) return EMPTY_SESSION
    // A token surviving in storage across a browser restart can still be
    // past its ~1hr expiry — discard it rather than trusting a stale one.
    if (tokenExpiryMs(parsed.idToken) <= Date.now()) return EMPTY_SESSION
    return parsed
  } catch {
    return EMPTY_SESSION
  }
}

export function AuthProvider({ children }) {
  // Persisted in localStorage (survives browser restarts, unlike
  // sessionStorage) — safe because every read checks the token's own
  // expiry below, so a stale copy is never trusted as "still signed in".
  const [session, setSession] = useState(readStoredSession)

  const signIn = useCallback((credential) => {
    const decoded = decodeIdToken(credential)
    const nextProfile = decoded
      ? { name: decoded.name, email: decoded.email, picture: decoded.picture }
      : null
    const next = { idToken: credential, profile: nextProfile }
    setSession(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // localStorage may be unavailable (private browsing); the session
      // still works in-memory for the rest of the tab's lifetime.
    }
  }, [])

  const signOut = useCallback(() => {
    setSession(EMPTY_SESSION)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    googleLogout()
  }, [])

  // Auto-clear the session at the exact moment the ID token expires, so
  // the one-tap re-auth below (or the login redirect) kicks in right away
  // instead of the app silently calling the API with a dead token.
  useEffect(() => {
    if (!session.idToken) return
    const msLeft = Math.max(0, tokenExpiryMs(session.idToken) - Date.now())
    const timer = setTimeout(() => setSession(EMPTY_SESSION), msLeft)
    return () => clearTimeout(timer)
  }, [session.idToken])

  // Silently fetch a fresh ID token whenever we're signed out — on first
  // load, after the timer above expires one, or after a manual sign-out —
  // as long as the browser still has an active Google session for the
  // owner's account. This is what avoids clicking "Sign in" every time.
  useGoogleOneTapLogin({
    onSuccess: (credentialResponse) => {
      if (credentialResponse.credential) signIn(credentialResponse.credential)
    },
    onError: () => {},
    disabled: Boolean(session.idToken),
    auto_select: true,
    cancel_on_tap_outside: false,
  })

  return (
    <AuthContext.Provider value={{ idToken: session.idToken, profile: session.profile, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
