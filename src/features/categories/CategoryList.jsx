import { Icon } from '../../components/Icon'

export function CategoryList({ categories, onEdit, onArchive }) {
  return (
    <ul className="category-list">
      {categories.map((category) => (
        <li key={category.id} className={`category-row ${category.archived ? 'is-archived' : ''}`.trim()}>
          <span className="category-swatch" style={{ backgroundColor: category.color }} />
          <span className="category-name">{category.name}</span>
          <span className={`badge badge-${category.type}`}>{category.type}</span>
          {category.archived && <span className="badge badge-muted">archived</span>}
          <div className="row-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => onEdit(category)}
              aria-label={`Edit ${category.name}`}
            >
              <Icon name="edit" size={16} />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => onArchive(category)}
              aria-label={category.archived ? `Restore ${category.name}` : `Archive ${category.name}`}
            >
              <Icon name={category.archived ? 'plus' : 'trash'} size={16} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
