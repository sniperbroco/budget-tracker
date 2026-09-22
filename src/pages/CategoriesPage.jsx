import { useMemo, useState } from 'react'
import { useCategories } from '../features/categories/useCategories'
import { CategoryList } from '../features/categories/CategoryList'
import { CategoryForm } from '../features/categories/CategoryForm'
import { Modal } from '../components/Modal'
import { Button } from '../components/Button'
import { Spinner } from '../components/Spinner'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { ErrorBanner } from '../components/ErrorBanner'

export function CategoriesPage() {
  const [showArchived, setShowArchived] = useState(false)
  const { categories, loading, error, addCategory, editCategory, setArchived } = useCategories({
    includeArchived: showArchived,
  })
  const [modalState, setModalState] = useState(null) // null | 'create' | category

  const sorted = useMemo(() => [...categories].sort((a, b) => a.name.localeCompare(b.name)), [categories])

  async function handleSubmit(values) {
    if (modalState && modalState !== 'create') {
      await editCategory(modalState.id, values)
    } else {
      await addCategory(values)
    }
    setModalState(null)
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <label className="toggle">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          Show archived
        </label>
        <Button icon={<Icon name="plus" size={16} />} onClick={() => setModalState('create')}>
          Add category
        </Button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner />
      ) : sorted.length === 0 ? (
        <EmptyState title="No categories yet" description="Add a category to start tagging transactions." />
      ) : (
        <CategoryList
          categories={sorted}
          onEdit={setModalState}
          onArchive={(category) => setArchived(category.id, !category.archived)}
        />
      )}

      {modalState && (
        <Modal title={modalState === 'create' ? 'Add category' : 'Edit category'} onClose={() => setModalState(null)}>
          <CategoryForm
            category={modalState === 'create' ? null : modalState}
            onSubmit={handleSubmit}
            onCancel={() => setModalState(null)}
          />
        </Modal>
      )}
    </div>
  )
}
