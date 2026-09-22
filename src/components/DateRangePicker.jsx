import { Field } from './Field'

export function DateRangePicker({ from, to, onFromChange, onToChange }) {
  return (
    <div className="date-range-picker">
      <Field type="date" label="From" value={from} onChange={(e) => onFromChange(e.target.value)} />
      <Field type="date" label="To" value={to} onChange={(e) => onToChange(e.target.value)} />
    </div>
  )
}
