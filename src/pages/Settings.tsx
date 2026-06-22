import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useSettings } from '../hooks/useSettings'

export function SettingsPage() {
  const { settings, loading, updateSettings } = useSettings()
  const [maxTrades, setMaxTrades] = useState(2)
  const [lossLimit, setLossLimit] = useState(100)
  const [gainLimit, setGainLimit] = useState(200)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) {
      setMaxTrades(settings.max_trades_per_day)
      setLossLimit(settings.daily_loss_limit)
      setGainLimit(settings.daily_gain_limit)
    }
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    await updateSettings({
      max_trades_per_day: maxTrades,
      daily_loss_limit: lossLimit,
      daily_gain_limit: gainLimit,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-400 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <Card>
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-white">Daily Limits</h2>
          <p className="text-sm text-dark-300">
            Set your daily trading limits. You'll see a warning when limits are reached, but trades won't be blocked.
          </p>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1.5">
              Max trades per day
            </label>
            <Input
              type="number"
              min={1}
              max={50}
              value={maxTrades}
              onChange={e => setMaxTrades(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1.5">
              Daily loss limit ($)
            </label>
            <Input
              type="number"
              min={0}
              step={10}
              value={lossLimit}
              onChange={e => setLossLimit(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1.5">
              Daily gain limit ($)
            </label>
            <Input
              type="number"
              min={0}
              step={10}
              value={gainLimit}
              onChange={e => setGainLimit(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              <span className="flex items-center gap-2">
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Settings'}
              </span>
            </Button>
            {saved && (
              <span className="text-green-400 text-sm">Settings saved!</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
