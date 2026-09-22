import { ProgressBar } from '../../components/ProgressBar'
import { formatCurrency } from '../../utils/currency'
import { EmptyState } from '../../components/EmptyState'

export function DebtsOverview({ debts }) {
  if (!debts.length) {
    return <EmptyState title="No debts tracked" description="Add a loan or credit card on the Debts page." />
  }

  return (
    <ul className="budget-overview-list">
      {debts.map((debt) => (
        <li key={debt.id} className="budget-overview-row">
          <span className="category-swatch" style={{ backgroundColor: debt.color }} />
          <span className="budget-overview-name">{debt.name}</span>
          <ProgressBar value={debt.balance} max={debt.originalAmount} />
          <span className="budget-overview-figure">{formatCurrency(debt.balance)} owed</span>
        </li>
      ))}
    </ul>
  )
}
