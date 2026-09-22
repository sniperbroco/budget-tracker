import { NavLink, useLocation } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { MOBILE_NAV_ITEMS, MORE_ROUTES } from './nav'

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {MOBILE_NAV_ITEMS.map((item) => {
        if (item.to === '/more') {
          const isActive = MORE_ROUTES.some((route) => location.pathname.startsWith(route))
          return (
            <NavLink key={item.to} to={item.to} className={`bottom-nav-link ${isActive ? 'is-active' : ''}`.trim()}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          )
        }
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `bottom-nav-link ${isActive ? 'is-active' : ''}`.trim()}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
