import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { createRecurring, deleteRecurring, listRecurring, updateRecurring } from '../../api/recurring'

export function useRecurring() {
  const { idToken, signOut } = useAuth()
  const [rules, setRules] = useState([])
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
      setRules(await listRecurring(idToken, { includeInactive: true }))
    } catch (err) {
      applyError(err)
    } finally {
      setLoading(false)
    }
  }, [idToken, applyError])

  useEffect(() => {
    // Fetch-on-mount via a custom hook, per
    // https://react.dev/learn/you-might-not-need-an-effect#fetching-data —
    // not a cascading-render loop, just the initial data load.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
  }, [refresh])

  const addRule = useCallback(async (rule) => {
    try {
      const created = await createRecurring(idToken, rule)
      await refresh()
      return created
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const editRule = useCallback(async (id, patch) => {
    try {
      await updateRecurring(idToken, id, patch)
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const removeRule = useCallback(async (id) => {
    try {
      await deleteRecurring(idToken, id)
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const toggleActive = useCallback(async (id, active) => {
    try {
      await updateRecurring(idToken, id, { active })
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  return { rules, loading, error, refresh, addRule, editRule, removeRule, toggleActive }
}
