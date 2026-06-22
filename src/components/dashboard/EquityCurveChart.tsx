import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '../ui/Card'
import { formatDateShort } from '../../lib/formatters'

interface EquityCurveChartProps {
  data: { date: string; equity: number }[]
}

export function EquityCurveChart({ data }: EquityCurveChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-white mb-4">Equity Curve</h3>
        <p className="text-dark-400 text-sm text-center py-8">No closed trades yet.</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-white mb-4">Equity Curve</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateShort}
            tick={{ fill: '#5a5a6a', fontSize: 12 }}
            stroke="#2a2a3a"
          />
          <YAxis
            tick={{ fill: '#5a5a6a', fontSize: 12 }}
            stroke="#2a2a3a"
            tickFormatter={v => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a25',
              border: '1px solid #2a2a3a',
              borderRadius: '8px',
              color: '#c0c0cc',
              fontSize: '13px',
            }}
            formatter={(value: unknown) => [`$${Number(value).toFixed(2)}`, 'Equity']}
            labelFormatter={(label: unknown) => formatDateShort(String(label))}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#equityGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
