import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { createEnvelope, deleteEnvelope, listEnvelopes, updateEnvelope } from '../../api/paychecks'

// Fetches every envelope across all paychecks in one call — the page groups
// them by paycheckId client-side (same pattern BudgetsPage uses for
// spentByCategory), rather than re-fetching per paycheck when it's expanded.
export function useEnvelopes() {
  const { idToken, signOut } = useAuth()
  const [envelopes, setEnvelopes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const applyError = useCallback((err) => {
    setError(err.message)
    if (err.authFailed) signOut()
  }, [signOut])

  const refresh = useCallback(async () => {
    if (!idToken) return
    setLoading(true)
    setError(null)
    try {
      setEnvelopes(await listEnvelopes(idToken))
    } catch (err) {
      applyError(err)
    } finally {
      setLoading(false)
    }
  }, [idToken, applyError])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
  }, [refresh])

  const addEnvelope = useCallback(async (envelope) => {
    try {
      const created = await createEnvelope(idToken, envelope)
      await refresh()
      return created
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const editEnvelope = useCallback(async (id, patch) => {
    try {
      await updateEnvelope(idToken, id, patch)
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const removeEnvelope = useCallback(async (id) => {
    try {
      await deleteEnvelope(idToken, id)
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  return { envelopes, loading, error, refresh, addEnvelope, editEnvelope, removeEnvelope }
}
