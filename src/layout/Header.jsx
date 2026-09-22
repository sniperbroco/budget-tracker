import { useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Icon } from '../components/Icon'
import { NAV_ITEMS } from './nav'

export function Header() {
  const location = useLocation()
  const { profile, signOut } = useAuth()

  const current = NAV_ITEMS.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
  )
  const title = location.pathname === '/more' ? 'More' : current?.label ?? 'Budget Tracker'

  return (
    <header className="app-header">
      <h1 className="app-header-title">{title}</h1>
      <div className="app-header-user">
        {profile?.picture && (
          <img className="user-avatar" src={profile.picture} alt="" referrerPolicy="no-referrer" />
        )}
        <span className="user-email">{profile?.email}</span>
        <button type="button" className="icon-btn" onClick={signOut} aria-label="Sign out">
          <Icon name="logout" />
        </button>
      </div>
    </header>
  )
}
