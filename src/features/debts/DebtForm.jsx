import { useState } from 'react'
import { Field } from '../../components/Field'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { ColorSwatchPicker } from '../../components/ColorSwatchPicker'
import { CATEGORY_COLORS } from '../../components/categoryColors'
import { formatCurrency } from '../../utils/currency'

export function DebtForm({ debt, accounts, onSubmit, onCancel }) {
  const [name, setName] = useState(debt?.name ?? '')
  const [kind, setKind] = useState(debt?.kind ?? 'loan')
  const [originalAmount, setOriginalAmount] = useState(debt?.originalAmount ?? '')
  const [balance, setBalance] = useState(debt?.balance ?? '')
  const [availableLimit, setAvailableLimit] = useState(debt?.availableLimit ?? '')
  const [interestRate, setInterestRate] = useState(debt?.interestRate ?? '')
  const [minimumPayment, setMinimumPayment] = useState(debt?.minimumPayment ?? '')
  const [dueDay, setDueDay] = useState(debt?.dueDay ?? '')
  const [accountId, setAccountId] = useState(debt?.accountId ?? '')
  const [color, setColor] = useState(debt?.color ?? CATEGORY_COLORS[0])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!name.trim()) nextErrors.name = 'Enter a name.'
    if (!(Number(originalAmount) > 0)) {
      nextErrors.originalAmount =
        kind === 'loan' ? 'Enter a principal greater than 0.' : 'Enter a credit limit greater than 0.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        name: name.trim(),
        kind,
        originalAmount: Number(originalAmount),
        ...(kind === 'credit_card' && !debt ? { balance: balance === '' ? 0 : Number(balance) } : {}),
        interestRate: interestRate === '' ? '' : Number(interestRate),
        minimumPayment: minimumPayment === '' ? '' : Number(minimumPayment),
        dueDay: dueDay === '' ? '' : Number(dueDay),
        availableLimit: availableLimit === '' ? '' : Number(availableLimit),
        accountId,
        color,
      })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Field
        id="debt-name"
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="e.g. Car loan"
      />
      <Select id="debt-kind" label="Type" value={kind} onChange={(e) => setKind(e.target.value)} disabled={Boolean(debt)}>
        <option value="loan">Fixed loan / installment</option>
        <option value="credit_card">Revolving credit card</option>
      </Select>
      <Field
        id="debt-amount"
        type="number"
        min="0"
        step="0.01"
        label={kind === 'loan' ? 'Principal amount' : 'Total spending limit'}
        value={originalAmount}
        onChange={(e) => setOriginalAmount(e.target.value)}
        error={errors.originalAmount}
        placeholder="0.00"
        disabled={Boolean(debt)}
      />
      {kind === 'credit_card' && !debt && (
        <Field
          id="debt-balance"
          type="number"
          min="0"
          step="0.01"
          label="Total balance owed / unbilled amount (optional)"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="0.00 — leave blank if the card has no balance yet"
        />
      )}
      {kind === 'credit_card' && (
        <Field
          id="debt-available-limit"
          type="number"
          min="0"
          step="0.01"
          label="Available spending limit (optional)"
          value={availableLimit}
          onChange={(e) => setAvailableLimit(e.target.value)}
          placeholder="0.00 — update this each statement cycle"
        />
      )}
      <Field
        id="debt-interest"
        type="number"
        min="0"
        step="0.01"
        label="Interest rate % (optional)"
        value={interestRate}
        onChange={(e) => setInterestRate(e.target.value)}
        placeholder="e.g. 2.5"
      />
      {kind === 'loan' && !debt && originalAmount !== '' && Number(interestRate) > 0 && (
        <p className="field-hint">
          Total owed will be calculated as{' '}
          {formatCurrency(Number(originalAmount) + Number(originalAmount) * (Number(interestRate) / 100))} (principal
          + {interestRate}% interest).
        </p>
      )}
      <Field
        id="debt-min-payment"
        type="number"
        min="0"
        step="0.01"
        label="Minimum monthly payment (optional)"
        value={minimumPayment}
        onChange={(e) => setMinimumPayment(e.target.value)}
        placeholder="0.00"
      />
      <Field
        id="debt-due-day"
        type="number"
        min="1"
        max="31"
        label="Due day of month (optional)"
        value={dueDay}
        onChange={(e) => setDueDay(e.target.value)}
        placeholder="e.g. 15"
      />
      {kind === 'credit_card' && accounts.length > 0 && (
        <Select
          id="debt-account"
          label="Linked account (optional)"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          <option value="">No linked account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>{account.name}</option>
          ))}
        </Select>
      )}
      {kind === 'credit_card' && accountId && (
        <p className="field-hint">
          Charges and refunds you log against this account will automatically update this card's
          balance. Payments you make from another account still need a manual "Log a payment" here.
        </p>
      )}
      <div className="field">
        <span className="field-label">Color</span>
        <ColorSwatchPicker value={color} onChange={setColor} />
      </div>
      {formError && <p className="form-error">{formError}</p>}
      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : debt ? 'Save changes' : 'Add debt'}
        </Button>
      </div>
    </form>
  )
}
