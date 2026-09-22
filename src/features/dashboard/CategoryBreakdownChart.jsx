import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../../utils/currency'
import { EmptyState } from '../../components/EmptyState'

const MAX_SLICES = 6
const OTHER_COLOR = '#9ca3af'

export function CategoryBreakdownChart({ data }) {
  if (!data.length) {
    return (
      <EmptyState
        title="No expenses yet"
        description="Add a transaction to see your spending by category."
      />
    )
  }

  // Cap the number of simultaneous hues — beyond ~6-7 a pie chart stops
  // being readable, so the smallest categories fold into "Other".
  const sorted = [...data].sort((a, b) => b.amount - a.amount)
  const visible = sorted.slice(0, MAX_SLICES)
  const rest = sorted.slice(MAX_SLICES)
  const otherTotal = rest.reduce((sum, item) => sum + item.amount, 0)
  const chartData =
    otherTotal > 0
      ? [...visible, { categoryId: 'other', name: 'Other', color: OTHER_COLOR, amount: otherTotal }]
      : visible
  const total = chartData.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="category-chart">
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={chartData} dataKey="amount" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
              {chartData.map((entry) => (
                <Cell key={entry.categoryId} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="category-chart-legend">
        {chartData.map((entry) => (
          <li key={entry.categoryId} className="category-chart-legend-row">
            <span className="category-swatch" style={{ backgroundColor: entry.color }} />
            <span className="category-chart-legend-name">{entry.name}</span>
            <span className="category-chart-legend-value">
              {formatCurrency(entry.amount)}
              <span className="category-chart-legend-pct"> · {Math.round((entry.amount / total) * 100)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
