import { useState, useEffect, useMemo } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Card } from '../ui/Card'
import { calculateSLTP } from '../../lib/calculations'
import { toInputDate, formatCurrency } from '../../lib/formatters'
import type { Trade, TradeInsert, TradeDirection, TradeStatus, TradingRules } from '../../lib/types'

interface TradeFormProps {
  trade?: Trade | null
  rules: TradingRules
  riskPerTrade: number
  onSubmit: (data: TradeInsert) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function TradeForm({ trade, rules, riskPerTrade, onSubmit, onCancel, loading }: TradeFormProps) {
  const [date, setDate] = useState(trade?.date ?? toInputDate(new Date()))
  const [direction, setDirection] = useState<TradeDirection>(trade?.direction ?? 'sell')
  const [lotSize, setLotSize] = useState(trade?.lot_size?.toString() ?? '0.01')
  const [entryPrice, setEntryPrice] = useState(trade?.entry_price?.toString() ?? '')
  const [exitPrice, setExitPrice] = useState(trade?.exit_price?.toString() ?? '')
  const [status, setStatus] = useState<TradeStatus>(trade?.status ?? 'open')
  const [notes, setNotes] = useState(trade?.notes ?? '')

  useEffect(() => {
    if (trade) {
      setDate(trade.date)
      setDirection(trade.direction)
      setLotSize(trade.lot_size.toString())
      setEntryPrice(trade.entry_price.toString())
      setExitPrice(trade.exit_price?.toString() ?? '')
      setStatus(trade.status)
      setNotes(trade.notes ?? '')
    }
  }, [trade])

  const calculated = useMemo(() => {
    const entry = parseFloat(entryPrice)
    const lot = parseFloat(lotSize)

    if (!entry || !lot || lot <= 0 || riskPerTrade <= 0) return null

    return calculateSLTP(direction, entry, riskPerTrade, lot, rules.riskRewardRatio)
  }, [entryPrice, lotSize, direction, riskPerTrade, rules.riskRewardRatio])

  const riskPercent = rules.balance > 0
    ? Math.round((riskPerTrade / rules.balance) * 10000) / 100
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      date,
      pair: 'XAU/USD',
      direction,
      entry_price: parseFloat(entryPrice),
      exit_price: exitPrice ? parseFloat(exitPrice) : null,
      lot_size: parseFloat(lotSize),
      stop_loss: calculated?.slPrice ?? null,
      take_profit: calculated?.tpPrice ?? null,
      status,
      notes: notes || null,
      pips: null,
      profit_loss: null,
      balance: rules.balance,
      risk_amount: riskPerTrade,
      risk_reward_ratio: rules.riskRewardRatio,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Risk summary from rules */}
      <div className="bg-dark-700/50 border border-dark-500 rounded-lg p-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-dark-300">Balance</span>
          <span className="text-white font-mono">{formatCurrency(rules.balance)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-dark-300">Risk por trade ({riskPercent}%)</span>
          <span className="text-amber-400 font-mono">{formatCurrency(riskPerTrade)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-dark-300">Ratio R:R</span>
          <span className="text-white font-mono">1:{rules.riskRewardRatio}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <Select
          label="Direction"
          options={[
            { label: 'Buy (Long)', value: 'buy' },
            { label: 'Sell (Short)', value: 'sell' },
          ]}
          value={direction}
          onChange={e => setDirection(e.target.value as TradeDirection)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Entry Price" type="number" step="any" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} required placeholder="4130.000" />
        <Input label="Lot Size" type="number" step="0.01" min="0.01" value={lotSize} onChange={e => setLotSize(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Exit Price" type="number" step="any" value={exitPrice} onChange={e => setExitPrice(e.target.value)} placeholder={status === 'open' ? 'N/A (trade abierto)' : ''} />
        <Select
          label="Status"
          options={[
            { label: 'Open', value: 'open' },
            { label: 'Closed', value: 'closed' },
          ]}
          value={status}
          onChange={e => setStatus(e.target.value as TradeStatus)}
        />
      </div>

      {calculated && (
        <div className="space-y-3">
          <p className="text-xs text-dark-300 uppercase tracking-wider font-medium">SL / TP Calculados (XAU/USD)</p>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-xs text-dark-300">Stop Loss</p>
              <p className="text-lg font-mono text-red-400">{calculated.slPrice.toFixed(3)}</p>
              <p className="text-xs text-dark-400">{calculated.slDistance.toFixed(3)} pts</p>
            </Card>
            <Card>
              <p className="text-xs text-dark-300">Take Profit</p>
              <p className="text-lg font-mono text-green-400">{calculated.tpPrice.toFixed(3)}</p>
              <p className="text-xs text-dark-400">{calculated.tpDistance.toFixed(3)} pts</p>
            </Card>
            <Card>
              <p className="text-xs text-dark-300">Riesgo</p>
              <p className="text-sm font-mono text-red-400">-{formatCurrency(calculated.riskAmount)}</p>
            </Card>
            <Card>
              <p className="text-xs text-dark-300">Ganancia Potencial</p>
              <p className="text-sm font-mono text-green-400">+{formatCurrency(calculated.potentialProfit)}</p>
            </Card>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm text-dark-200">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-dark-100 placeholder-dark-300 focus:outline-none focus:border-accent-500 transition-colors resize-none"
          placeholder="Notas del trade..."
        />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>{trade ? 'Update Trade' : 'Add Trade'}</Button>
      </div>
    </form>
  )
}
