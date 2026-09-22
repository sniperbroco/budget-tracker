export function Select({ label, id, error, className = '', children, ...props }) {
  return (
    <label className={`field ${className}`.trim()} htmlFor={id}>
      {label && <span className="field-label">{label}</span>}
      <select id={id} className="field-control" {...props}>
        {children}
      </select>
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}
