import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { FOREX_PAIRS } from '../../lib/constants'
import { toInputDate } from '../../lib/formatters'
import type { Trade, TradeInsert, TradeDirection, TradeStatus } from '../../lib/types'

interface TradeFormProps {
  trade?: Trade | null
  onSubmit: (data: TradeInsert) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function TradeForm({ trade, onSubmit, onCancel, loading }: TradeFormProps) {
  const [date, setDate] = useState(trade?.date ?? toInputDate(new Date()))
  const [pair, setPair] = useState(trade?.pair ?? 'EUR/USD')
  const [direction, setDirection] = useState<TradeDirection>(trade?.direction ?? 'buy')
  const [entryPrice, setEntryPrice] = useState(trade?.entry_price?.toString() ?? '')
  const [exitPrice, setExitPrice] = useState(trade?.exit_price?.toString() ?? '')
  const [lotSize, setLotSize] = useState(trade?.lot_size?.toString() ?? '0.01')
  const [stopLoss, setStopLoss] = useState(trade?.stop_loss?.toString() ?? '')
  const [takeProfit, setTakeProfit] = useState(trade?.take_profit?.toString() ?? '')
  const [status, setStatus] = useState<TradeStatus>(trade?.status ?? 'open')
  const [notes, setNotes] = useState(trade?.notes ?? '')

  useEffect(() => {
    if (trade) {
      setDate(trade.date)
      setPair(trade.pair)
      setDirection(trade.direction)
      setEntryPrice(trade.entry_price.toString())
      setExitPrice(trade.exit_price?.toString() ?? '')
      setLotSize(trade.lot_size.toString())
      setStopLoss(trade.stop_loss?.toString() ?? '')
      setTakeProfit(trade.take_profit?.toString() ?? '')
      setStatus(trade.status)
      setNotes(trade.notes ?? '')
    }
  }, [trade])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      date,
      pair,
      direction,
      entry_price: parseFloat(entryPrice),
      exit_price: exitPrice ? parseFloat(exitPrice) : null,
      lot_size: parseFloat(lotSize),
      stop_loss: stopLoss ? parseFloat(stopLoss) : null,
      take_profit: takeProfit ? parseFloat(takeProfit) : null,
      status,
      notes: notes || null,
      pips: null,
      profit_loss: null,
    })
  }

  const pairOptions = FOREX_PAIRS.map(p => ({ label: p, value: p }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <Select label="Pair" options={pairOptions} value={pair} onChange={e => setPair(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Direction"
          options={[
            { label: 'Buy (Long)', value: 'buy' },
            { label: 'Sell (Short)', value: 'sell' },
          ]}
          value={direction}
          onChange={e => setDirection(e.target.value as TradeDirection)}
        />
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

      <div className="grid grid-cols-2 gap-4">
        <Input label="Entry Price" type="number" step="any" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} required />
        <Input label="Exit Price" type="number" step="any" value={exitPrice} onChange={e => setExitPrice(e.target.value)} placeholder={status === 'open' ? 'N/A' : ''} />
      </div>

      <Input label="Lot Size" type="number" step="0.01" min="0.01" value={lotSize} onChange={e => setLotSize(e.target.value)} required />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Stop Loss" type="number" step="any" value={stopLoss} onChange={e => setStopLoss(e.target.value)} />
        <Input label="Take Profit" type="number" step="any" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-dark-200">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-dark-100 placeholder-dark-300 focus:outline-none focus:border-accent-500 transition-colors resize-none"
          placeholder="Trade notes..."
        />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>{trade ? 'Update Trade' : 'Add Trade'}</Button>
      </div>
    </form>
  )
}
