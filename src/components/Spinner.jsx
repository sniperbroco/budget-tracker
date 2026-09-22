export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="spinner" role="status">
      <span className="spinner-circle" aria-hidden="true" />
      <span className="spinner-label">{label}</span>
    </div>
  )
}
