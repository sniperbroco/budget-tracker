import { formatCurrency } from '../../utils/currency'
import { EmptyState } from '../../components/EmptyState'

export function AccountBalancesOverview({ accounts, balances, availableCreditTotal, savingsTotal }) {
  if (!accounts.length) {
    return (
      <EmptyState title="No accounts yet" description="Add an account on the Accounts page to track balances." />
    )
  }

  return (
    <>
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
      {(savingsTotal > 0 || availableCreditTotal > 0) && (
        <div className="account-overview-totals">
          {savingsTotal > 0 && (
            <div className="account-overview-total-row">
              <span>Savings total</span>
              <span>{formatCurrency(savingsTotal)}</span>
            </div>
          )}
          {availableCreditTotal > 0 && (
            <div className="account-overview-total-row">
              <span>Available credit total</span>
              <span>{formatCurrency(availableCreditTotal)}</span>
            </div>
          )}
        </div>
      )}
    </>
  )
}
