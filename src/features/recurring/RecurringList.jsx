import { Icon } from '../../components/Icon'
import { formatCurrency } from '../../utils/currency'
import { formatDateLabel } from '../../utils/date'

export function RecurringList({ rules, categoriesById, onEdit, onDelete, onToggle }) {
  return (
    <ul className="recurring-list">
      {rules.map((rule) => {
        const category = categoriesById.get(rule.categoryId)
        return (
          <li key={rule.id} className={`recurring-row ${rule.active ? '' : 'is-archived'}`.trim()}>
            <span className="category-swatch" style={{ backgroundColor: category?.color ?? '#9ca3af' }} />
            <div className="recurring-main">
              <span className="recurring-category">{category?.name ?? 'Uncategorized'}</span>
              <span className="recurring-meta">
                {rule.frequency === 'weekly' ? 'Weekly' : 'Monthly'} · next {formatDateLabel(rule.nextRunDate)}
              </span>
            </div>
            <div className="recurring-trailing">
              <span className={`transaction-amount transaction-amount-${rule.type}`}>
                {rule.type === 'expense' ? '-' : '+'}{formatCurrency(rule.amount)}
              </span>
              <label className="toggle recurring-toggle">
                <input type="checkbox" checked={rule.active} onChange={(e) => onToggle(rule, e.target.checked)} />
                Active
              </label>
              <div className="row-actions">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => onEdit(rule)}
                  aria-label="Edit recurring rule"
                >
                  <Icon name="edit" size={16} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => onDelete(rule)}
                  aria-label="Delete recurring rule"
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
