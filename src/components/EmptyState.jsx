import { Icon } from './Icon'

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <Icon name="inbox" size={28} />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}
