import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { formatCurrency, formatPips, formatDate, plColor } from '../../lib/formatters'
import type { Trade } from '../../lib/types'

interface TradeCardProps {
  trade: Trade
}

export function TradeCard({ trade }: TradeCardProps) {
  const isBuy = trade.direction === 'buy'

  return (
    <Link
      to={`/trades/${trade.id}`}
      className="block bg-dark-800 border border-dark-600 rounded-xl p-4 hover:border-dark-400 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isBuy ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
            {isBuy
              ? <ArrowUpRight size={18} className="text-green-400" />
              : <ArrowDownRight size={18} className="text-red-400" />
            }
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{trade.pair}</span>
              <Badge variant={isBuy ? 'green' : 'red'}>
                {trade.direction.toUpperCase()}
              </Badge>
              <Badge variant={trade.status === 'open' ? 'blue' : 'gray'}>
                {trade.status}
              </Badge>
            </div>
            <p className="text-sm text-dark-300">{formatDate(trade.date)} &middot; {trade.lot_size} lots</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {trade.status === 'closed' && trade.profit_loss != null && (
            <div className="text-right">
              <p className={`font-semibold ${plColor(trade.profit_loss)}`}>
                {formatCurrency(trade.profit_loss)}
              </p>
              <p className={`text-sm ${plColor(trade.pips ?? 0)}`}>
                {formatPips(trade.pips ?? 0)}
              </p>
            </div>
          )}
          <ChevronRight size={18} className="text-dark-400" />
        </div>
      </div>
    </Link>
  )
}
