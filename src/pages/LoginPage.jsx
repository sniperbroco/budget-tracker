import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { GoogleSignInButton } from '../auth/GoogleSignInButton'
import { Icon } from '../components/Icon'

export function LoginPage() {
  const { idToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (idToken) navigate('/', { replace: true })
  }, [idToken, navigate])

  return (
    <div className="login-page">
      <div className="login-card">
        <span className="brand-mark brand-mark-lg">
          <Icon name="wallet" size={28} />
        </span>
        <h1>Budget Tracker</h1>
        <p>Sign in with the Google account that owns your budget spreadsheet.</p>
        <div className="login-action">
          <GoogleSignInButton onSignedIn={() => navigate('/', { replace: true })} />
        </div>
      </div>
    </div>
  )
}
