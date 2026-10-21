import { useState } from 'react'
import { Field } from '../../components/Field'
import { Button } from '../../components/Button'
import { formatCurrency } from '../../utils/currency'

// Reconciles an account to its real bank balance by shifting the starting
// balance by the difference; transactions are left untouched.
export function AdjustBalanceForm({ account, currentBalance, linkedDebt, onSubmit, onCancel }) {
  const [actual, setActual] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const actualNumber = Number(actual)
  const hasValue = actual !== '' && Number.isFinite(actualNumber)
  const difference = hasValue ? actualNumber - currentBalance : 0
  const nextStarting = (Number(account.startingBalance) || 0) + difference

  async function handleSubmit(event) {
    event.preventDefault()
    if (!hasValue) {
      setError('Enter your real balance.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      // A card linked to a debt takes its balance from the debt's available
      // limit, so the real balance is saved there instead of as a starting balance.
      await onSubmit(linkedDebt ? actualNumber : Math.round(nextStarting * 100) / 100)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <p className="field-hint">
        {account.name} currently shows <strong>{formatCurrency(currentBalance)}</strong> in the app.
      </p>
      {linkedDebt && (
        <p className="field-hint">
          This card is linked to the debt &quot;{linkedDebt.name}&quot;, so its balance is the debt&apos;s available
          limit. Enter the available credit your bank shows.
        </p>
      )}
      <Field
        id="adjust-actual"
        type="number"
        step="0.01"
        label={linkedDebt ? 'Available credit in your bank' : 'Real balance in your bank'}
        value={actual}
        onChange={(e) => setActual(e.target.value)}
        placeholder="0.00"
      />
      {hasValue && (
        <p className="field-hint">
          Difference: {difference >= 0 ? '+' : '-'}{formatCurrency(Math.abs(difference))}.{' '}
          {linkedDebt
            ? `Available limit will change from ${formatCurrency(currentBalance)} to ${formatCurrency(actualNumber)}.`
            : `Starting balance will change from ${formatCurrency(account.startingBalance)} to ${formatCurrency(nextStarting)}.`}
        </p>
      )}
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting || !hasValue || difference === 0}>
          {submitting ? 'Saving…' : 'Adjust balance'}
        </Button>
      </div>
    </form>
  )
}
