import { TradeCard } from './TradeCard'
import type { Trade } from '../../lib/types'

interface TradeListProps {
  trades: Trade[]
  loading: boolean
}

export function TradeList({ trades, loading }: TradeListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-400 border-t-transparent" />
      </div>
    )
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-12 text-dark-300">
        <p>No trades found.</p>
        <p className="text-sm mt-1">Create your first trade to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {trades.map(trade => (
        <TradeCard key={trade.id} trade={trade} />
      ))}
    </div>
  )
}
