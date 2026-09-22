import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export function RequireAuth({ children }) {
  const { idToken } = useAuth()
  const location = useLocation()

  if (!idToken) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
