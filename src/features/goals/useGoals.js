import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { archiveGoal, contributeToGoal, createGoal, listGoals, updateGoal } from '../../api/goals'

export function useGoals({ includeArchived = false } = {}) {
  const { idToken, signOut } = useAuth()
  const [goals, setGoals] = useState([])
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
      setGoals(await listGoals(idToken, { includeArchived }))
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

  const addGoal = useCallback(async (goal) => {
    try {
      const created = await createGoal(idToken, goal)
      await refresh()
      return created
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const editGoal = useCallback(async (id, patch) => {
    try {
      await updateGoal(idToken, id, patch)
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const setArchived = useCallback(async (id, archived) => {
    try {
      await archiveGoal(idToken, id, archived)
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const contribute = useCallback(async (id, amount) => {
    try {
      await contributeToGoal(idToken, id, amount)
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  return { goals, loading, error, refresh, addGoal, editGoal, setArchived, contribute }
}
