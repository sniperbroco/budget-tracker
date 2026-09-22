import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from './useAuth'

export function GoogleSignInButton({ onSignedIn }) {
  const { signIn } = useAuth()

  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        if (!credentialResponse.credential) return
        signIn(credentialResponse.credential)
        onSignedIn?.()
      }}
      onError={() => {
        console.error('Google sign-in failed.')
      }}
    />
  )
}
