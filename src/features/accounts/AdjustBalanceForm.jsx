import { useState } from 'react'
import { Field } from '../../components/Field'
import { Button } from '../../components/Button'
import { formatCurrency } from '../../utils/currency'

// Reconciles an account to its real bank balance by shifting the starting
// balance by the difference; transactions are left untouched.
export function AdjustBalanceForm({ account, currentBalance, onSubmit, onCancel }) {
  const [actual, setActual] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const actualNumber = Number(actual)
  const hasValue = actual !== '' && Number.isFinite(actualNumber)
  const difference = hasValue ? actualNumber - currentBalance : 0
  const nextStarting = (Number(account.startingBalance) || 0) + difference
  const isCredit = account.type === 'credit'

  async function handleSubmit(event) {
    event.preventDefault()
    if (!hasValue) {
      setError('Enter your real balance.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(Math.round(nextStarting * 100) / 100)
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
      {isCredit && (
        <p className="field-hint">
          If this card is linked to a debt, its balance comes from the debt&apos;s available limit — update that on
          the Debts page instead.
        </p>
      )}
      <Field
        id="adjust-actual"
        type="number"
        step="0.01"
        label="Real balance in your bank"
        value={actual}
        onChange={(e) => setActual(e.target.value)}
        placeholder="0.00"
      />
      {hasValue && (
        <p className="field-hint">
          Difference: {difference >= 0 ? '+' : '-'}{formatCurrency(Math.abs(difference))}. Starting balance will change
          from {formatCurrency(account.startingBalance)} to {formatCurrency(nextStarting)}.
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
