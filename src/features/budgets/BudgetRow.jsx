import { Icon } from '../../components/Icon'
import { ProgressBar } from '../../components/ProgressBar'
import { formatCurrency } from '../../utils/currency'

export function BudgetRow({ category, budget, spent, onEdit, onRemove }) {
  return (
    <li className="budget-row">
      <span className="category-swatch" style={{ backgroundColor: category.color }} />
      <div className="budget-main">
        <span className="budget-category">{category.name}</span>
        <ProgressBar value={spent} max={budget?.limitAmount ?? 0} />
      </div>
      <div className="budget-trailing">
        <div className="budget-figures">
          <span className="budget-spent">{formatCurrency(spent)}</span>
          <span className="budget-limit">
            {budget ? `of ${formatCurrency(budget.limitAmount)}` : 'No budget set'}
          </span>
        </div>
        <div className="row-actions">
          <button type="button" className="icon-btn" onClick={onEdit} aria-label={`Set budget for ${category.name}`}>
            <Icon name={budget ? 'edit' : 'plus'} size={16} />
          </button>
          {budget && (
            <button
              type="button"
              className="icon-btn"
              onClick={onRemove}
              aria-label={`Remove budget for ${category.name}`}
            >
              <Icon name="trash" size={16} />
            </button>
          )}
        </div>
      </div>
    </li>
  )
}
