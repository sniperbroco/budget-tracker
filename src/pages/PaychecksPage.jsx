import { useMemo, useState } from 'react'
import { usePaychecks } from '../features/paychecks/usePaychecks'
import { useEnvelopes } from '../features/paychecks/useEnvelopes'
import { PaycheckList } from '../features/paychecks/PaycheckList'
import { PaycheckForm } from '../features/paychecks/PaycheckForm'
import { EnvelopeForm } from '../features/paychecks/EnvelopeForm'
import { Modal } from '../components/Modal'
import { Button } from '../components/Button'
import { Spinner } from '../components/Spinner'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { ErrorBanner } from '../components/ErrorBanner'

export function PaychecksPage() {
  const { paychecks, loading: loadingPaychecks, error: paychecksError, addPaycheck, editPaycheck, removePaycheck } =
    usePaychecks()
  const {
    envelopes,
    loading: loadingEnvelopes,
    error: envelopesError,
    addEnvelope,
    editEnvelope,
    removeEnvelope,
  } = useEnvelopes()

  const [expandedId, setExpandedId] = useState(null)
  const [modalState, setModalState] = useState(null) // null | 'create' | paycheck
  const [envelopeModalState, setEnvelopeModalState] = useState(null) // null | { paycheck, envelope }

  const loadError = paychecksError || envelopesError
  const loading = loadingPaychecks || loadingEnvelopes

  const sorted = useMemo(
    () => [...paychecks].sort((a, b) => b.date.localeCompare(a.date)),
    [paychecks],
  )

  const envelopesByPaycheck = useMemo(() => {
    const map = new Map()
    envelopes.forEach((envelope) => {
      const list = map.get(envelope.paycheckId) ?? []
      list.push(envelope)
      map.set(envelope.paycheckId, list)
    })
    return map
  }, [envelopes])

  async function handlePaycheckSubmit(values) {
    if (modalState && modalState !== 'create') {
      await editPaycheck(modalState.id, values)
    } else {
      await addPaycheck(values)
    }
    setModalState(null)
  }

  async function handleEnvelopeSubmit(values) {
    if (envelopeModalState.envelope) {
      await editEnvelope(envelopeModalState.envelope.id, values)
    } else {
      await addEnvelope({ ...values, paycheckId: envelopeModalState.paycheck.id })
    }
    setEnvelopeModalState(null)
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <Button icon={<Icon name="plus" size={16} />} onClick={() => setModalState('create')}>
          Add paycheck
        </Button>
      </div>

      {loadError && <ErrorBanner message={loadError} />}

      {loading ? (
        <Spinner />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No paychecks logged yet"
          description="Add a paycheck, then split it into whatever it needs to cover this pay period."
        />
      ) : (
        <PaycheckList
          paychecks={sorted}
          envelopesByPaycheck={envelopesByPaycheck}
          expandedId={expandedId}
          onToggleExpand={(id) => setExpandedId((current) => (current === id ? null : id))}
          onEdit={setModalState}
          onDelete={(paycheck) => removePaycheck(paycheck.id)}
          onAddEnvelope={(paycheck) => setEnvelopeModalState({ paycheck, envelope: null })}
          onEditEnvelope={(envelope) =>
            setEnvelopeModalState({
              paycheck: sorted.find((p) => p.id === envelope.paycheckId),
              envelope,
            })
          }
          onDeleteEnvelope={(envelope) => removeEnvelope(envelope.id)}
        />
      )}

      {modalState && (
        <Modal title={modalState === 'create' ? 'Add paycheck' : 'Edit paycheck'} onClose={() => setModalState(null)}>
          <PaycheckForm
            paycheck={modalState === 'create' ? null : modalState}
            onSubmit={handlePaycheckSubmit}
            onCancel={() => setModalState(null)}
          />
        </Modal>
      )}

      {envelopeModalState && (
        <Modal
          title={
            envelopeModalState.envelope
              ? `Edit envelope — ${envelopeModalState.envelope.name}`
              : 'Add envelope'
          }
          onClose={() => setEnvelopeModalState(null)}
        >
          <EnvelopeForm
            envelope={envelopeModalState.envelope}
            onSubmit={handleEnvelopeSubmit}
            onCancel={() => setEnvelopeModalState(null)}
          />
        </Modal>
      )}
    </div>
  )
}
