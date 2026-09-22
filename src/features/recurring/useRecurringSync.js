import { useEffect, useRef } from 'react'
import { useAuth } from '../../auth/useAuth'
import { syncRecurring } from '../../api/recurring'

// Fires once per sign-in: catches up any due recurring transactions before
// the rest of the app reads the Transactions sheet. No installed Apps
// Script trigger needed — it just runs whenever the app is opened.
export function useRecurringSync() {
  const { idToken } = useAuth()
  const hasSynced = useRef(false)

  useEffect(() => {
    if (!idToken || hasSynced.current) return
    hasSynced.current = true
    syncRecurring(idToken).catch(() => {
      hasSynced.current = false
    })
  }, [idToken])
}
