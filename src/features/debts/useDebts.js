import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { archiveDebt, createDebt, listDebts, recordDebtPayment, updateDebt } from '../../api/debts'

export function useDebts({ includeArchived = false } = {}) {
  const { idToken, signOut } = useAuth()
  const [debts, setDebts] = useState([])
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
      setDebts(await listDebts(idToken, { includeArchived }))
    } catch (err) {
      applyError(err)
    } finally {
      setLoading(false)
    }
  }, [idToken, includeArchived, applyError])

  useEffect(() => {
    // Fetch-on-mount/filter-change via a custom hook, per
    // https://react.dev/learn/you-might-not-need-an-effect#fetching-data —
    // not a cascading-render loop, just the initial/refresh data load.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
  }, [refresh])

  const addDebt = useCallback(async (debt) => {
    try {
      const created = await createDebt(idToken, debt)
      await refresh()
      return created
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const editDebt = useCallback(async (id, patch) => {
    try {
      await updateDebt(idToken, id, patch)
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const setArchived = useCallback(async (id, archived) => {
    try {
      await archiveDebt(idToken, id, archived)
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const recordPayment = useCallback(async (id, amount) => {
    try {
      await recordDebtPayment(idToken, id, amount)
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  return { debts, loading, error, refresh, addDebt, editDebt, setArchived, recordPayment }
}
