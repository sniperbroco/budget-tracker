import { formatCurrency } from '../../utils/currency'
import { EmptyState } from '../../components/EmptyState'

export function AccountBalancesOverview({ accounts, balances }) {
  if (!accounts.length) {
    return (
      <EmptyState title="No accounts yet" description="Add an account on the Accounts page to track balances." />
    )
  }

  return (
    <ul className="account-overview-list">
      {accounts.map((account) => {
        const balance = balances[account.id] ?? 0
        return (
          <li key={account.id} className="account-overview-row">
            <span className="category-swatch" style={{ backgroundColor: account.color }} />
            <span className="account-overview-name">{account.name}</span>
            <span className={`account-overview-balance ${balance < 0 ? 'is-negative' : ''}`.trim()}>
              {formatCurrency(balance)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
