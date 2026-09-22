import { Icon } from '../../components/Icon'
import { formatCurrency } from '../../utils/currency'
import { formatDateLabel } from '../../utils/date'

export function TransactionList({ transactions, categoriesById, accountsById, onEdit, onDelete }) {
  return (
    <ul className="transaction-list">
      {transactions.map((transaction) => {
        const category = categoriesById.get(transaction.categoryId)
        const account = accountsById.get(transaction.accountId)
        const tags = transaction.tags
          ? transaction.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : []
        return (
          <li key={transaction.id} className="transaction-row">
            <span className="category-swatch" style={{ backgroundColor: category?.color ?? '#9ca3af' }} />
            <div className="transaction-main">
              <span className="transaction-category">
                {category?.name ?? 'Uncategorized'}
                {account ? <span className="transaction-account"> · {account.name}</span> : null}
              </span>
              {transaction.notes && <span className="transaction-notes">{transaction.notes}</span>}
              {tags.length > 0 && (
                <span className="transaction-tags">
                  {tags.map((tag) => (
                    <span key={tag} className="tag-chip">{tag}</span>
                  ))}
                </span>
              )}
            </div>
            <div className="transaction-trailing">
              <span className="transaction-date">{formatDateLabel(transaction.date)}</span>
              <span className={`transaction-amount transaction-amount-${transaction.type}`}>
                {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
              </span>
              <div className="row-actions">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => onEdit(transaction)}
                  aria-label="Edit transaction"
                >
                  <Icon name="edit" size={16} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => onDelete(transaction)}
                  aria-label="Delete transaction"
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
