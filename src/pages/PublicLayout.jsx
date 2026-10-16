import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'

export function PublicLayout({ children }) {
  return (
    <div className="public-page">
      <header className="public-header">
        <Link to="/" className="public-brand">
          <span className="brand-mark">
            <Icon name="wallet" size={18} />
          </span>
          <span className="brand-name">Personal Budget Tracker</span>
        </Link>
        <Link to="/login" className="public-link">
          Sign in
        </Link>
      </header>
      <main className="public-main">{children}</main>
      <footer className="public-footer">
        <span>© {new Date().getFullYear()} Personal Budget Tracker</span>
        <Link to="/privacy">Privacy Policy</Link>
      </footer>
    </div>
  )
}
