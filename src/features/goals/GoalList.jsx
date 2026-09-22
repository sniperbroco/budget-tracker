import { Icon } from '../../components/Icon'
import { ProgressBar } from '../../components/ProgressBar'
import { formatCurrency } from '../../utils/currency'
import { formatDateLabel } from '../../utils/date'

export function GoalList({ goals, onEdit, onArchive, onContribute }) {
  return (
    <ul className="goal-list">
      {goals.map((goal) => (
        <li key={goal.id} className={`goal-row ${goal.archived ? 'is-archived' : ''}`.trim()}>
          <span className="category-swatch" style={{ backgroundColor: goal.color }} />
          <div className="goal-main">
            <span className="goal-name">{goal.name}</span>
            <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
            <span className="goal-figures">
              {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
              {goal.targetDate ? ` · by ${formatDateLabel(goal.targetDate)}` : ''}
            </span>
          </div>
          <div className="row-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => onContribute(goal)}
              aria-label={`Add funds to ${goal.name}`}
            >
              <Icon name="plus" size={16} />
            </button>
            <button type="button" className="icon-btn" onClick={() => onEdit(goal)} aria-label={`Edit ${goal.name}`}>
              <Icon name="edit" size={16} />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => onArchive(goal)}
              aria-label={goal.archived ? `Restore ${goal.name}` : `Archive ${goal.name}`}
            >
              <Icon name={goal.archived ? 'plus' : 'trash'} size={16} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
