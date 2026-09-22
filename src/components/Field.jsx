export function Field({ label, id, error, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()} htmlFor={id}>
      {label && <span className="field-label">{label}</span>}
      <input id={id} className="field-control" {...props} />
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}
