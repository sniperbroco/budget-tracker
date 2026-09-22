import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import {
  archiveAccount,
  createAccount,
  getAccountBalances,
  listAccounts,
  updateAccount,
} from '../../api/accounts'

export function useAccounts({ includeArchived = false } = {}) {
  const { idToken, signOut } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [balances, setBalances] = useState({})
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
      const [accountsResult, balancesResult] = await Promise.all([
        listAccounts(idToken, { includeArchived }),
        getAccountBalances(idToken),
      ])
      setAccounts(accountsResult)
      setBalances(balancesResult)
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

  const addAccount = useCallback(async (account) => {
    try {
      const created = await createAccount(idToken, account)
      await refresh()
      return created
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const editAccount = useCallback(async (id, patch) => {
    try {
      await updateAccount(idToken, id, patch)
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  const setArchived = useCallback(async (id, archived) => {
    try {
      await archiveAccount(idToken, id, archived)
      await refresh()
    } catch (err) {
      applyError(err)
      throw err
    }
  }, [idToken, refresh, applyError])

  return { accounts, balances, loading, error, refresh, addAccount, editAccount, setArchived }
}
