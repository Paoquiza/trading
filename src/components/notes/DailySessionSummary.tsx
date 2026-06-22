import { useMemo } from 'react'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '../ui/Card'
import { formatCurrency, formatPips, plColor } from '../../lib/formatters'
import type { Trade } from '../../lib/types'

interface DailySessionSummaryProps {
  trades: Trade[]
  date: string
}

export function DailySessionSummary({ trades, date }: DailySessionSummaryProps) {
  const summary = useMemo(() => {
    const dayTrades = trades.filter(t => t.date === date)
    const closed = dayTrades.filter(t => t.status === 'closed')
    const winners = closed.filter(t => (t.profit_loss ?? 0) > 0)
    const losers = closed.filter(t => (t.profit_loss ?? 0) < 0)
    const totalPL = closed.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0)
    const totalPips = closed.reduce((sum, t) => sum + (t.pips ?? 0), 0)

    return {
      total: dayTrades.length,
      closed: closed.length,
      winners: winners.length,
      losers: losers.length,
      totalPL,
      totalPips,
    }
  }, [trades, date])

  if (summary.total === 0) {
    return (
      <Card>
        <div className="flex items-center gap-2 text-dark-400 text-sm">
          <BarChart3 size={16} />
          <span>No trades for this date</span>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-accent-400" />
          <h3 className="text-sm font-semibold text-white">Session Summary</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <p className="text-xs text-dark-400">Trades</p>
            <p className="text-lg font-bold text-white">{summary.total}</p>
          </div>
          <div>
            <p className="text-xs text-dark-400">P&L</p>
            <p className={`text-lg font-bold ${plColor(summary.totalPL)}`}>
              {formatCurrency(summary.totalPL)}
            </p>
          </div>
          <div>
            <p className="text-xs text-dark-400">W / L</p>
            <p className="text-lg font-bold text-white">
              <span className="text-green-400">{summary.winners}</span>
              {' / '}
              <span className="text-red-400">{summary.losers}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Pips</p>
            <p className={`text-lg font-bold ${plColor(summary.totalPips)}`}>
              {formatPips(summary.totalPips)}
            </p>
          </div>
        </div>

        {summary.closed > 0 && (
          <div className="flex items-center gap-4 pt-1 text-xs text-dark-300">
            <span className="flex items-center gap-1">
              <TrendingUp size={12} className="text-green-400" />
              {summary.winners} winning
            </span>
            <span className="flex items-center gap-1">
              <TrendingDown size={12} className="text-red-400" />
              {summary.losers} losing
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}
