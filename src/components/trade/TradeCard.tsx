import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowDownRight, ChevronRight, Check, X } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { formatCurrency, formatDate, plColor } from '../../lib/formatters'
import type { Trade } from '../../lib/types'

interface TradeCardProps {
  trade: Trade
  onWin?: (trade: Trade) => void
  onLoss?: (trade: Trade) => void
}

export function TradeCard({ trade, onWin, onLoss }: TradeCardProps) {
  const isBuy = trade.direction === 'buy'
  const isOpen = trade.status === 'open'
  const canResolve = isOpen && trade.stop_loss != null && trade.take_profit != null

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 hover:border-dark-400 transition-colors">
      <div className="flex items-center justify-between">
        <Link to={`/trades/${trade.id}`} className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg ${isBuy ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
            {isBuy
              ? <ArrowUpRight size={18} className="text-green-400" />
              : <ArrowDownRight size={18} className="text-red-400" />
            }
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{trade.pair}</span>
              <Badge variant={isBuy ? 'green' : 'red'}>
                {trade.direction.toUpperCase()}
              </Badge>
              <Badge variant={isOpen ? 'blue' : 'gray'}>
                {trade.status}
              </Badge>
            </div>
            <p className="text-sm text-dark-300">{formatDate(trade.date)} &middot; {trade.lot_size} lots &middot; Entry: {trade.entry_price}</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {trade.status === 'closed' && trade.profit_loss != null && (
            <div className="text-right">
              <p className={`font-semibold ${plColor(trade.profit_loss)}`}>
                {formatCurrency(trade.profit_loss)}
              </p>
              <p className={`text-sm ${plColor(trade.pips ?? 0)}`}>
                {trade.pips != null ? `${trade.pips > 0 ? '+' : ''}${trade.pips.toFixed(3)} pts` : ''}
              </p>
            </div>
          )}

          {canResolve && (
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.preventDefault(); onWin?.(trade) }}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-900/40 border border-green-700 rounded-lg text-green-400 text-sm font-medium hover:bg-green-900/60 transition-colors cursor-pointer"
              >
                <Check size={14} /> Win
              </button>
              <button
                onClick={(e) => { e.preventDefault(); onLoss?.(trade) }}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-900/40 border border-red-700 rounded-lg text-red-400 text-sm font-medium hover:bg-red-900/60 transition-colors cursor-pointer"
              >
                <X size={14} /> Loss
              </button>
            </div>
          )}

          <Link to={`/trades/${trade.id}`}>
            <ChevronRight size={18} className="text-dark-400" />
          </Link>
        </div>
      </div>
    </div>
  )
}
