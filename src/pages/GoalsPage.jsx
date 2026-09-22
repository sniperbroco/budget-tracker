import { useMemo, useState } from 'react'
import { useGoals } from '../features/goals/useGoals'
import { GoalList } from '../features/goals/GoalList'
import { GoalForm } from '../features/goals/GoalForm'
import { GoalContributeForm } from '../features/goals/GoalContributeForm'
import { Modal } from '../components/Modal'
import { Button } from '../components/Button'
import { Spinner } from '../components/Spinner'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { ErrorBanner } from '../components/ErrorBanner'

export function GoalsPage() {
  const [showArchived, setShowArchived] = useState(false)
  const { goals, loading, error, addGoal, editGoal, setArchived, contribute } = useGoals({
    includeArchived: showArchived,
  })
  const [modalState, setModalState] = useState(null) // null | 'create' | goal
  const [contributeTarget, setContributeTarget] = useState(null)

  const sorted = useMemo(() => [...goals].sort((a, b) => a.name.localeCompare(b.name)), [goals])

  async function handleSubmit(values) {
    if (modalState && modalState !== 'create') {
      await editGoal(modalState.id, values)
    } else {
      await addGoal(values)
    }
    setModalState(null)
  }

  async function handleContribute(amount) {
    await contribute(contributeTarget.id, amount)
    setContributeTarget(null)
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <label className="toggle">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          Show archived
        </label>
        <Button icon={<Icon name="plus" size={16} />} onClick={() => setModalState('create')}>
          Add goal
        </Button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner />
      ) : sorted.length === 0 ? (
        <EmptyState title="No savings goals yet" description="Set a target to start tracking progress toward it." />
      ) : (
        <GoalList
          goals={sorted}
          onEdit={setModalState}
          onArchive={(goal) => setArchived(goal.id, !goal.archived)}
          onContribute={setContributeTarget}
        />
      )}

      {modalState && (
        <Modal title={modalState === 'create' ? 'Add goal' : 'Edit goal'} onClose={() => setModalState(null)}>
          <GoalForm
            goal={modalState === 'create' ? null : modalState}
            onSubmit={handleSubmit}
            onCancel={() => setModalState(null)}
          />
        </Modal>
      )}

      {contributeTarget && (
        <Modal title={contributeTarget.name} onClose={() => setContributeTarget(null)}>
          <GoalContributeForm
            goal={contributeTarget}
            onSubmit={handleContribute}
            onCancel={() => setContributeTarget(null)}
          />
        </Modal>
      )}
    </div>
  )
}
