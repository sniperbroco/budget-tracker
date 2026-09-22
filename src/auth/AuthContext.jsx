import { useCallback, useState } from 'react'
import { googleLogout } from '@react-oauth/google'
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

function readStoredSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed?.idToken ? parsed : EMPTY_SESSION
  } catch {
    return EMPTY_SESSION
  }
}

export function AuthProvider({ children }) {
  // Restored lazily from sessionStorage (same tab only — ID tokens expire
  // in ~1hr, so persisting across browser restarts via localStorage would
  // just imply a false "still signed in" state).
  const [session, setSession] = useState(readStoredSession)

  const signIn = useCallback((credential) => {
    const decoded = decodeIdToken(credential)
    const nextProfile = decoded
      ? { name: decoded.name, email: decoded.email, picture: decoded.picture }
      : null
    const next = { idToken: credential, profile: nextProfile }
    setSession(next)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // sessionStorage may be unavailable (private browsing); the session
      // still works in-memory for the rest of the tab's lifetime.
    }
  }, [])

  const signOut = useCallback(() => {
    setSession(EMPTY_SESSION)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    googleLogout()
  }, [])

  return (
    <AuthContext.Provider value={{ idToken: session.idToken, profile: session.profile, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
