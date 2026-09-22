import { DebtRow } from './DebtRow'

export function DebtList({ debts, onEdit, onArchive, onLogPayment }) {
  return (
    <ul className="debt-list">
      {debts.map((debt) => (
        <DebtRow key={debt.id} debt={debt} onEdit={onEdit} onArchive={onArchive} onLogPayment={onLogPayment} />
      ))}
    </ul>
  )
}
