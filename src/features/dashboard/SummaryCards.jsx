import { Icon } from '../../components/Icon'
import { formatCurrency } from '../../utils/currency'

export function SummaryCards({ income, expense, net }) {
  return (
    <div className="summary-cards">
      <div className="summary-card summary-card-income">
        <div className="summary-card-icon">
          <Icon name="arrowUp" size={16} />
        </div>
        <div>
          <span className="summary-label">Income</span>
          <span className="summary-value summary-value-income">{formatCurrency(income)}</span>
        </div>
      </div>
      <div className="summary-card summary-card-expense">
        <div className="summary-card-icon">
          <Icon name="arrowDown" size={16} />
        </div>
        <div>
          <span className="summary-label">Expenses</span>
          <span className="summary-value summary-value-expense">{formatCurrency(expense)}</span>
        </div>
      </div>
      <div className="summary-card summary-card-net">
        <div className="summary-card-icon">
          <Icon name="wallet" size={16} />
        </div>
        <div>
          <span className="summary-label">Net</span>
          <span className={`summary-value ${net >= 0 ? 'summary-value-income' : 'summary-value-expense'}`}>
            {formatCurrency(net)}
          </span>
        </div>
      </div>
    </div>
  )
}
