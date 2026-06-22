import { TrendingUp, Target, BarChart3, DollarSign } from 'lucide-react'
import { Card } from '../ui/Card'
import { formatCurrency, formatPercent, plColor } from '../../lib/formatters'
import type { TradeStats } from '../../lib/types'

interface StatsOverviewProps {
  stats: TradeStats
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const items = [
    {
      label: 'Total Trades',
      value: stats.totalTrades.toString(),
      icon: BarChart3,
      color: 'text-accent-400',
      bgColor: 'bg-accent-500/10',
    },
    {
      label: 'Win Rate',
      value: formatPercent(stats.winRate),
      icon: Target,
      color: stats.winRate >= 50 ? 'text-green-400' : 'text-red-400',
      bgColor: stats.winRate >= 50 ? 'bg-green-900/30' : 'bg-red-900/30',
      sub: `${stats.winners}W / ${stats.losers}L`,
    },
    {
      label: 'Avg Pips',
      value: `${stats.avgPips > 0 ? '+' : ''}${stats.avgPips}`,
      icon: TrendingUp,
      color: plColor(stats.avgPips),
      bgColor: stats.avgPips >= 0 ? 'bg-green-900/30' : 'bg-red-900/30',
    },
    {
      label: 'Total P&L',
      value: formatCurrency(stats.totalPL),
      icon: DollarSign,
      color: plColor(stats.totalPL),
      bgColor: stats.totalPL >= 0 ? 'bg-green-900/30' : 'bg-red-900/30',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(item => {
        const Icon = item.icon
        return (
          <Card key={item.label}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <Icon size={18} className={item.color} />
              </div>
              <div>
                <p className="text-xs text-dark-300">{item.label}</p>
                <p className={`text-lg font-semibold ${item.color}`}>{item.value}</p>
                {item.sub && <p className="text-xs text-dark-400">{item.sub}</p>}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
