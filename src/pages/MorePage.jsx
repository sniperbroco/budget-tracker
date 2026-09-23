import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'

const MORE_LINKS = [
  { to: '/paychecks', label: 'Paychecks', icon: 'download', description: 'Split each paycheck into what it needs to cover' },
  { to: '/categories', label: 'Categories', icon: 'tag', description: 'Manage income and expense categories' },
  { to: '/goals', label: 'Savings goals', icon: 'target', description: 'Track progress toward a target' },
  { to: '/debts', label: 'Debts', icon: 'trendingDown', description: 'Loans and credit cards you’re paying off' },
  { to: '/recurring', label: 'Recurring', icon: 'repeat', description: 'Rent, subscriptions, salary' },
]

export function MorePage() {
  return (
    <div className="page">
      <ul className="more-list">
        {MORE_LINKS.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className="more-link">
              <Icon name={item.icon} />
              <div className="more-link-text">
                <span className="more-link-label">{item.label}</span>
                <span className="more-link-description">{item.description}</span>
              </div>
              <Icon name="chevronRight" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
