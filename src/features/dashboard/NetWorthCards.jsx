import { Icon } from '../../components/Icon'
import { formatCurrency } from '../../utils/currency'

export function NetWorthCards({ savingsTotal, availableCreditTotal, debtsTotal }) {
  return (
    <div className="summary-cards">
      <div className="summary-card summary-card-income">
        <div className="summary-card-icon">
          <Icon name="layers" size={16} />
        </div>
        <div>
          <span className="summary-label">Savings total</span>
          <span className="summary-value summary-value-income">{formatCurrency(savingsTotal)}</span>
        </div>
      </div>
      <div className="summary-card summary-card-net">
        <div className="summary-card-icon">
          <Icon name="wallet" size={16} />
        </div>
        <div>
          <span className="summary-label">Available credit</span>
          <span className="summary-value">{formatCurrency(availableCreditTotal)}</span>
        </div>
      </div>
      <div className="summary-card summary-card-expense">
        <div className="summary-card-icon">
          <Icon name="trendingDown" size={16} />
        </div>
        <div>
          <span className="summary-label">Debts total</span>
          <span className="summary-value summary-value-expense">{formatCurrency(debtsTotal)}</span>
        </div>
      </div>
    </div>
  )
}
