import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { TradeForm } from '../components/trade/TradeForm'
import { TradeList } from '../components/trade/TradeList'
import { TradeFilters } from '../components/trade/TradeFilters'
import { TradeSummary } from '../components/trade/TradeSummary'
import { DailyLimitWarning } from '../components/trade/DailyLimitWarning'
import { useTrades } from '../hooks/useTrades'
import { useTradeStats } from '../hooks/useTradeStats'
import { useSettings } from '../hooks/useSettings'
import { toInputDate } from '../lib/formatters'
import type { TradeFilters as FilterType } from '../lib/types'

export function TradesPage() {
  const [filters, setFilters] = useState<FilterType>({})
  const { trades, loading, createTrade } = useTrades(filters)
  const { stats } = useTradeStats(trades)
  const { settings } = useSettings()
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  const today = toInputDate(new Date())

  const { tradesToday, dailyPL } = useMemo(() => {
    const todayTrades = trades.filter(t => t.date === today)
    return {
      tradesToday: todayTrades.length,
      dailyPL: todayTrades.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0),
    }
  }, [trades, today])

  const handleCreate = async (data: Parameters<typeof createTrade>[0]) => {
    setFormLoading(true)
    await createTrade(data)
    setFormLoading(false)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Trades</h1>
        <Button onClick={() => setShowForm(true)}>
          <span className="flex items-center gap-2"><Plus size={16} /> New Trade</span>
        </Button>
      </div>

      <TradeSummary stats={stats} />
      <TradeFilters filters={filters} onChange={setFilters} />
      <TradeList trades={trades} loading={loading} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Trade">
        <DailyLimitWarning tradesToday={tradesToday} dailyPL={dailyPL} settings={settings} />
        <TradeForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={formLoading} />
      </Modal>
    </div>
  )
}
