import { Card } from '../ui/Card'
import { formatCurrency, formatPercent, plColor } from '../../lib/formatters'
import type { TradeStats } from '../../lib/types'

interface TradeSummaryProps {
  stats: TradeStats
}

export function TradeSummary({ stats }: TradeSummaryProps) {
  const items = [
    { label: 'Total Trades', value: stats.totalTrades.toString() },
    { label: 'Win Rate', value: formatPercent(stats.winRate), color: stats.winRate >= 50 ? 'text-green-400' : 'text-red-400' },
    { label: 'Avg Pips', value: `${stats.avgPips > 0 ? '+' : ''}${stats.avgPips}`, color: plColor(stats.avgPips) },
    { label: 'Total P&L', value: formatCurrency(stats.totalPL), color: plColor(stats.totalPL) },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map(item => (
        <Card key={item.label} className="text-center">
          <p className="text-xs text-dark-300 mb-1">{item.label}</p>
          <p className={`text-lg font-semibold ${item.color ?? 'text-white'}`}>
            {item.value}
          </p>
        </Card>
      ))}
    </div>
  )
}
