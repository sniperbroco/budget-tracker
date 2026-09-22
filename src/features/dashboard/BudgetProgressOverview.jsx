import { ProgressBar } from '../../components/ProgressBar'
import { formatCurrency } from '../../utils/currency'
import { EmptyState } from '../../components/EmptyState'

export function BudgetProgressOverview({ items }) {
  if (!items.length) {
    return (
      <EmptyState
        title="No budgets set"
        description="Set a monthly limit for a category on the Budgets page."
      />
    )
  }

  return (
    <ul className="budget-overview-list">
      {items.map((item) => (
        <li key={item.categoryId} className="budget-overview-row">
          <span className="category-swatch" style={{ backgroundColor: item.color }} />
          <span className="budget-overview-name">{item.name}</span>
          <ProgressBar value={item.spent} max={item.limitAmount} />
          <span className="budget-overview-figure">
            {formatCurrency(item.spent)} / {formatCurrency(item.limitAmount)}
          </span>
        </li>
      ))}
    </ul>
  )
}
