import { Card } from '../ui/Card'
import { TradeCard } from '../trade/TradeCard'
import type { Trade } from '../../lib/types'

interface RecentTradesProps {
  trades: Trade[]
}

export function RecentTrades({ trades }: RecentTradesProps) {
  const recent = trades.slice(0, 5)

  return (
    <Card>
      <h3 className="text-sm font-semibold text-white mb-4">Recent Trades</h3>
      {recent.length === 0 ? (
        <p className="text-dark-400 text-sm text-center py-4">No trades yet.</p>
      ) : (
        <div className="space-y-2">
          {recent.map(trade => (
            <TradeCard key={trade.id} trade={trade} />
          ))}
        </div>
      )}
    </Card>
  )
}
