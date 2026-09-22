import { NavLink } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { NAV_ITEMS } from './nav'

export function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      <div className="sidebar-brand">
        <span className="brand-mark">B</span>
        <span className="brand-name">Budget Tracker</span>
      </div>
      <ul className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`.trim()}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
