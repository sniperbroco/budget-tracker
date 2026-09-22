import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { archiveCategory, createCategory, listCategories, updateCategory } from '../../api/categories'

export function useCategories({ includeArchived = false } = {}) {
  const { idToken, signOut } = useAuth()
  const [categories, setCategories] = useState([])
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
      setCategories(await listCategories(idToken, { includeArchived }))
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

  const addCategory = useCallback(async (category) => {
    try {
      const created = await createCategory(idToken, category)
      await refresh()
      return created
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const editCategory = useCallback(async (id, patch) => {
    try {
      await updateCategory(idToken, id, patch)
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const setArchived = useCallback(async (id, archived) => {
    try {
      await archiveCategory(idToken, id, archived)
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  return { categories, loading, error, refresh, addCategory, editCategory, setArchived }
}
