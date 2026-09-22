export function ProgressBar({ value, max }) {
  const safeMax = max > 0 ? max : 1
  const percent = Math.min(100, Math.round((value / safeMax) * 100))
  const over = max > 0 && value > max

  return (
    <div className={`progress-bar ${over ? 'is-over' : ''}`.trim()}>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="progress-bar-label">{percent}%</span>
    </div>
  )
}
