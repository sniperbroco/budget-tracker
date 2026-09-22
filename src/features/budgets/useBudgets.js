import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { deleteBudget, listBudgets, upsertBudget } from '../../api/budgets'

export function useBudgets(month) {
  const { idToken, signOut } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const applyError = useCallback((err) => {
    setError(err.message)
    if (err.authFailed) signOut()
  }, [signOut])

  const refresh = useCallback(async () => {
    if (!idToken || !month) return
    setLoading(true)
    setError(null)
    try {
      setBudgets(await listBudgets(idToken, { month }))
    } catch (err) {
      applyError(err)
    } finally {
      setLoading(false)
    }
  }, [idToken, month, applyError])

  useEffect(() => {
    // Fetch-on-mount/filter-change via a custom hook, per
    // https://react.dev/learn/you-might-not-need-an-effect#fetching-data —
    // not a cascading-render loop, just the initial/refresh data load.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
  }, [refresh])

  const saveBudget = useCallback(async (budget) => {
    try {
      const saved = await upsertBudget(idToken, budget)
      await refresh()
      return saved
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const removeBudget = useCallback(async (id) => {
    try {
      await deleteBudget(idToken, id)
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  return { budgets, loading, error, refresh, saveBudget, removeBudget }
}
