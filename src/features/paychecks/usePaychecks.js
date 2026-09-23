import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { createPaycheck, deletePaycheck, listPaychecks, updatePaycheck } from '../../api/paychecks'

export function usePaychecks() {
  const { idToken, signOut } = useAuth()
  const [paychecks, setPaychecks] = useState([])
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
      setPaychecks(await listPaychecks(idToken))
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

  const addPaycheck = useCallback(async (paycheck) => {
    try {
      const created = await createPaycheck(idToken, paycheck)
      await refresh()
      return created
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const editPaycheck = useCallback(async (id, patch) => {
    try {
      await updatePaycheck(idToken, id, patch)
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const removePaycheck = useCallback(async (id) => {
    try {
      await deletePaycheck(idToken, id)
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  return { paychecks, loading, error, refresh, addPaycheck, editPaycheck, removePaycheck }
}
