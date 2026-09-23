import { PaycheckRow } from './PaycheckRow'

export function PaycheckList({
  paychecks,
  envelopesByPaycheck,
  expandedId,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddEnvelope,
  onEditEnvelope,
  onDeleteEnvelope,
}) {
  return (
    <ul className="paycheck-list">
      {paychecks.map((paycheck) => (
        <PaycheckRow
          key={paycheck.id}
          paycheck={paycheck}
          envelopes={envelopesByPaycheck.get(paycheck.id) ?? []}
          expanded={expandedId === paycheck.id}
          onToggleExpand={() => onToggleExpand(paycheck.id)}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddEnvelope={onAddEnvelope}
          onEditEnvelope={onEditEnvelope}
          onDeleteEnvelope={onDeleteEnvelope}
        />
      ))}
    </ul>
  )
}
