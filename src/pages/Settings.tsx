import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { useSettings } from '../hooks/useSettings'
import { formatCurrency } from '../lib/formatters'

export function SettingsPage() {
  const { rules, saveRules } = useSettings()
  const [form, setForm] = useState(rules)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    saveRules(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const previewRiskPerTrade = Math.round(
    (form.balance * (form.maxDailyLossPercent / 100) / form.maxTradesPerDay) * 100
  ) / 100

  const previewMaxLoss = Math.round(form.balance * (form.maxDailyLossPercent / 100) * 100) / 100
  const previewMaxGain = Math.round(form.balance * (form.maxDailyGainPercent / 100) * 100) / 100

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Trading Rules</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <h2 className="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-4">Capital</h2>
          <Input
            label="Balance ($)"
            type="number"
            step="any"
            min="0"
            value={form.balance.toString()}
            onChange={e => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })}
            required
          />
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-4">Risk Management</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Daily Loss (%)"
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              value={form.maxDailyLossPercent.toString()}
              onChange={e => setForm({ ...form, maxDailyLossPercent: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Max Daily Gain (%)"
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              value={form.maxDailyGainPercent.toString()}
              onChange={e => setForm({ ...form, maxDailyGainPercent: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Max Trades / Day"
              type="number"
              step="1"
              min="1"
              max="20"
              value={form.maxTradesPerDay.toString()}
              onChange={e => setForm({ ...form, maxTradesPerDay: parseInt(e.target.value) || 1 })}
              required
            />
            <Input
              label="Ratio R:R (reward per 1 risk)"
              type="number"
              step="0.1"
              min="0.1"
              value={form.riskRewardRatio.toString()}
              onChange={e => setForm({ ...form, riskRewardRatio: parseFloat(e.target.value) || 1 })}
              required
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-4">Preview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-dark-300">Max Loss Diario</p>
              <p className="text-lg font-mono text-red-400">-{formatCurrency(previewMaxLoss)}</p>
            </div>
            <div>
              <p className="text-xs text-dark-300">Gain Target Diario</p>
              <p className="text-lg font-mono text-green-400">+{formatCurrency(previewMaxGain)}</p>
            </div>
            <div>
              <p className="text-xs text-dark-300">Risk por Trade</p>
              <p className="text-lg font-mono text-amber-400">{formatCurrency(previewRiskPerTrade)}</p>
            </div>
            <div>
              <p className="text-xs text-dark-300">Gain por Trade (si wins)</p>
              <p className="text-lg font-mono text-green-400">{formatCurrency(previewRiskPerTrade * form.riskRewardRatio)}</p>
            </div>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit">
            <span className="flex items-center gap-2"><Save size={16} /> Save Rules</span>
          </Button>
          {saved && <span className="text-green-400 text-sm">Saved!</span>}
        </div>
      </form>
    </div>
  )
}
