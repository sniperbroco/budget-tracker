export function Button({ variant = 'primary', icon, children, className = '', ...props }) {
  return (
    <button className={`btn btn-${variant} ${className}`.trim()} {...props}>
      {icon}
      {children}
    </button>
  )
}
