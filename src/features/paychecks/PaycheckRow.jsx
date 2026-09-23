import { Icon } from '../../components/Icon'
import { ProgressBar } from '../../components/ProgressBar'
import { Button } from '../../components/Button'
import { formatCurrency } from '../../utils/currency'
import { formatDateLabel } from '../../utils/date'

export function PaycheckRow({
  paycheck,
  envelopes,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddEnvelope,
  onEditEnvelope,
  onDeleteEnvelope,
}) {
  const allocated = envelopes.reduce((sum, envelope) => sum + envelope.amount, 0)
  const remaining = paycheck.amount - allocated

  return (
    <li className="paycheck-row">
      <div className="paycheck-header">
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleExpand}
          aria-label={expanded ? 'Collapse envelopes' : 'Expand envelopes'}
        >
          <Icon name={expanded ? 'chevronLeft' : 'chevronRight'} size={16} />
        </button>
        <div className="paycheck-main">
          <span className="paycheck-name">
            {formatDateLabel(paycheck.date)}
            {paycheck.label && <span className="badge badge-muted">{paycheck.label}</span>}
          </span>
          <ProgressBar value={allocated} max={paycheck.amount} />
          <span className="paycheck-figures">
            {formatCurrency(allocated)} allocated of {formatCurrency(paycheck.amount)} ·{' '}
            <span className={remaining < 0 ? 'paycheck-remaining-negative' : ''}>
              {formatCurrency(remaining)} remaining
            </span>
          </span>
        </div>
        <div className="row-actions">
          <button type="button" className="icon-btn" onClick={() => onEdit(paycheck)} aria-label="Edit paycheck">
            <Icon name="edit" size={16} />
          </button>
          <button type="button" className="icon-btn" onClick={() => onDelete(paycheck)} aria-label="Delete paycheck">
            <Icon name="trash" size={16} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="envelope-section">
          {envelopes.length === 0 ? (
            <p className="envelope-empty">No envelopes yet — split this paycheck into what it needs to cover.</p>
          ) : (
            <ul className="envelope-list">
              {envelopes.map((envelope) => (
                <li key={envelope.id} className="envelope-row">
                  <span className="envelope-name">{envelope.name}</span>
                  <span className="envelope-amount">{formatCurrency(envelope.amount)}</span>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => onEditEnvelope(envelope)}
                      aria-label={`Edit ${envelope.name}`}
                    >
                      <Icon name="edit" size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => onDeleteEnvelope(envelope)}
                      aria-label={`Remove ${envelope.name}`}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Button variant="ghost" icon={<Icon name="plus" size={14} />} onClick={() => onAddEnvelope(paycheck)}>
            Add envelope
          </Button>
        </div>
      )}
    </li>
  )
}
