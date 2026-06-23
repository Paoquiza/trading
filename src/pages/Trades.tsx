import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { TradeForm } from '../components/trade/TradeForm'
import { TradeList } from '../components/trade/TradeList'
import { TradeFilters } from '../components/trade/TradeFilters'
import { TradeSummary } from '../components/trade/TradeSummary'
import { useTrades } from '../hooks/useTrades'
import { useTradeStats } from '../hooks/useTradeStats'
import { useSettings } from '../hooks/useSettings'
import { toInputDate, formatCurrency } from '../lib/formatters'
import { calculatePips, calculateProfitLoss } from '../lib/calculations'
import type { Trade, TradeFilters as FilterType } from '../lib/types'

export function TradesPage() {
  const [filters, setFilters] = useState<FilterType>({})
  const { trades, loading, createTrade, updateTrade } = useTrades(filters)
  const { stats } = useTradeStats(trades)
  const { rules, riskPerTrade, maxDailyLoss, maxDailyGain, updateBalance } = useSettings()
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  const today = toInputDate(new Date())

  const daily = useMemo(() => {
    const todayTrades = trades.filter(t => t.date === today)
    const tradesToday = todayTrades.length
    const dailyPL = todayTrades.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0)
    const tradesRemaining = Math.max(0, rules.maxTradesPerDay - tradesToday)
    const hitGainTarget = dailyPL >= maxDailyGain
    const hitLossLimit = dailyPL <= -maxDailyLoss
    return { tradesToday, dailyPL, tradesRemaining, hitGainTarget, hitLossLimit }
  }, [trades, today, rules.maxTradesPerDay, maxDailyLoss, maxDailyGain])

  const canTrade = daily.tradesRemaining > 0 && !daily.hitGainTarget && !daily.hitLossLimit

  const handleWin = async (trade: Trade) => {
    if (trade.take_profit == null) return
    const exitPrice = trade.take_profit
    const pips = calculatePips(trade.direction, trade.entry_price, exitPrice)
    const profitLoss = calculateProfitLoss(pips, trade.lot_size)
    await updateTrade(trade.id, { status: 'closed', exit_price: exitPrice, pips, profit_loss: profitLoss })
    updateBalance(profitLoss)
  }

  const handleLoss = async (trade: Trade) => {
    if (trade.stop_loss == null) return
    const exitPrice = trade.stop_loss
    const pips = calculatePips(trade.direction, trade.entry_price, exitPrice)
    const profitLoss = calculateProfitLoss(pips, trade.lot_size)
    await updateTrade(trade.id, { status: 'closed', exit_price: exitPrice, pips, profit_loss: profitLoss })
    updateBalance(profitLoss)
  }

  const handleCreate = async (data: Parameters<typeof createTrade>[0]) => {
    setFormLoading(true)
    await createTrade(data)
    setFormLoading(false)
    setShowForm(false)
  }

  const plColor = daily.dailyPL > 0 ? 'text-green-400' : daily.dailyPL < 0 ? 'text-red-400' : 'text-dark-100'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Trades</h1>
        <Button onClick={() => setShowForm(true)} disabled={!canTrade}>
          <span className="flex items-center gap-2"><Plus size={16} /> New Trade</span>
        </Button>
      </div>

      {/* Daily Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <p className="text-xs text-dark-300">Trades Hoy</p>
          <p className="text-lg font-mono text-white">
            {daily.tradesToday}<span className="text-dark-400">/{rules.maxTradesPerDay}</span>
          </p>
        </Card>
        <Card>
          <p className="text-xs text-dark-300">P&L Hoy</p>
          <p className={`text-lg font-mono font-semibold ${plColor}`}>
            {formatCurrency(daily.dailyPL)}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-dark-300">Max Loss Diario</p>
          <p className="text-lg font-mono text-red-400">-{formatCurrency(maxDailyLoss)}</p>
        </Card>
        <Card>
          <p className="text-xs text-dark-300">Gain Target</p>
          <p className="text-lg font-mono text-green-400">+{formatCurrency(maxDailyGain)}</p>
        </Card>
      </div>

      {/* Warnings */}
      {daily.hitGainTarget && (
        <div className="bg-green-900/30 border border-green-700 rounded-lg px-4 py-3 text-green-300 text-sm">
          Target diario alcanzado ({formatCurrency(daily.dailyPL)}). No mas trades hoy.
        </div>
      )}
      {daily.hitLossLimit && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">
          Limite de perdida diaria alcanzado ({formatCurrency(daily.dailyPL)}). No mas trades hoy.
        </div>
      )}
      {daily.tradesRemaining === 0 && !daily.hitGainTarget && !daily.hitLossLimit && (
        <div className="bg-amber-900/30 border border-amber-700 rounded-lg px-4 py-3 text-amber-300 text-sm">
          Maximo de trades diarios alcanzado ({daily.tradesToday}/{rules.maxTradesPerDay}).
        </div>
      )}

      <TradeSummary stats={stats} />
      <TradeFilters filters={filters} onChange={setFilters} />
      <TradeList trades={trades} loading={loading} onWin={handleWin} onLoss={handleLoss} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Trade — XAU/USD">
        <TradeForm
          rules={rules}
          riskPerTrade={riskPerTrade}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          loading={formLoading}
        />
      </Modal>
    </div>
  )
}
