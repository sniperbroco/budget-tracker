import { Icon } from '../../components/Icon'
import { formatCurrency } from '../../utils/currency'

const TYPE_LABELS = { cash: 'Cash', bank: 'Bank', credit: 'Credit card', ewallet: 'E-wallet' }

export function AccountList({ accounts, balances, onEdit, onArchive }) {
  return (
    <ul className="account-list">
      {accounts.map((account) => {
        const balance = balances[account.id] ?? 0
        return (
          <li key={account.id} className={`account-row ${account.archived ? 'is-archived' : ''}`.trim()}>
            <span className="category-swatch" style={{ backgroundColor: account.color }} />
            <div className="account-main">
              <span className="account-name">{account.name}</span>
              <span className="account-type">{TYPE_LABELS[account.type] ?? account.type}</span>
            </div>
            <span className={`account-balance ${balance < 0 ? 'is-negative' : ''}`.trim()}>
              {formatCurrency(balance)}
            </span>
            <div className="row-actions">
              <button
                type="button"
                className="icon-btn"
                onClick={() => onEdit(account)}
                aria-label={`Edit ${account.name}`}
              >
                <Icon name="edit" size={16} />
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => onArchive(account)}
                aria-label={account.archived ? `Restore ${account.name}` : `Archive ${account.name}`}
              >
                <Icon name={account.archived ? 'plus' : 'trash'} size={16} />
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
