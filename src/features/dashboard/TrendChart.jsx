import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '../../utils/currency'
import { EmptyState } from '../../components/EmptyState'

export function TrendChart({ data }) {
  const hasActivity = data.some((point) => point.income !== 0 || point.expense !== 0)
  if (!hasActivity) {
    return (
      <EmptyState
        title="Not enough history yet"
        description="Trends will appear here after a few months of transactions."
      />
    )
  }

  const chartData = data.map((point) => ({ ...point, expenseNegative: -point.expense }))

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="monthLabel"
            tickLine={false}
            axisLine={{ stroke: 'var(--chart-axis)' }}
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(value).replace(/\.00$/, '')}
            width={64}
          />
          <Tooltip
            formatter={(value, name) => [formatCurrency(Math.abs(value)), name]}
            labelStyle={{ color: 'var(--text-h)' }}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="income" name="Income" fill="var(--income-mark)" radius={[4, 4, 0, 0]} maxBarSize={24} />
          <Bar
            dataKey="expenseNegative"
            name="Expense"
            fill="var(--expense-mark)"
            radius={[0, 0, 4, 4]}
            maxBarSize={24}
          />
          <Line
            type="monotone"
            dataKey="net"
            name="Net"
            stroke="var(--net)"
            strokeWidth={2}
            dot={{ r: 4, stroke: 'var(--surface)', strokeWidth: 2, fill: 'var(--net)' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
