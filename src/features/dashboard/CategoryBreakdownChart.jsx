import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../../utils/currency'
import { EmptyState } from '../../components/EmptyState'

export function CategoryBreakdownChart({ data }) {
  if (!data.length) {
    return (
      <EmptyState
        title="No expenses yet"
        description="Add a transaction to see your spending by category."
      />
    )
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey="amount" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.categoryId} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
