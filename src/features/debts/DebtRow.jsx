import { Icon } from '../../components/Icon'
import { ProgressBar } from '../../components/ProgressBar'
import { formatCurrency } from '../../utils/currency'

const KIND_LABELS = { loan: 'Loan', credit_card: 'Credit card' }

function ordinalSuffix(day) {
  if (day % 10 === 1 && day !== 11) return 'st'
  if (day % 10 === 2 && day !== 12) return 'nd'
  if (day % 10 === 3 && day !== 13) return 'rd'
  return 'th'
}

export function DebtRow({ debt, onEdit, onArchive, onLogPayment }) {
  const isLoan = debt.kind === 'loan'

  return (
    <li className={`debt-row ${debt.archived ? 'is-archived' : ''}`.trim()}>
      <span className="category-swatch" style={{ backgroundColor: debt.color }} />
      <div className="debt-main">
        <span className="debt-name">
          {debt.name}
          <span className="badge badge-muted">{KIND_LABELS[debt.kind]}</span>
        </span>
        <ProgressBar value={debt.balance} max={debt.originalAmount} />
        <span className="debt-figures">
          {formatCurrency(debt.balance)} owed of {formatCurrency(debt.originalAmount)}
          {isLoan ? ' · outstanding' : ' · utilized'}
          {!isLoan && debt.availableLimit !== '' && debt.availableLimit !== undefined
            ? ` · ${formatCurrency(debt.availableLimit)} available`
            : ''}
          {debt.dueDay ? ` · due on the ${debt.dueDay}${ordinalSuffix(debt.dueDay)}` : ''}
        </span>
      </div>
      <div className="row-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={() => onLogPayment(debt)}
          aria-label={`Log payment for ${debt.name}`}
        >
          <Icon name="trendingDown" size={16} />
        </button>
        <button type="button" className="icon-btn" onClick={() => onEdit(debt)} aria-label={`Edit ${debt.name}`}>
          <Icon name="edit" size={16} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => onArchive(debt)}
          aria-label={debt.archived ? `Restore ${debt.name}` : `Archive ${debt.name}`}
        >
          <Icon name={debt.archived ? 'plus' : 'trash'} size={16} />
        </button>
      </div>
    </li>
  )
}
