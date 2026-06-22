import { AlertTriangle } from 'lucide-react'
import type { UserSettings } from '../../lib/types'

interface DailyLimitWarningProps {
  tradesToday: number
  dailyPL: number
  settings: UserSettings | null
}

export function DailyLimitWarning({ tradesToday, dailyPL, settings }: DailyLimitWarningProps) {
  if (!settings) return null

  const warnings: string[] = []

  if (tradesToday >= settings.max_trades_per_day) {
    warnings.push(
      `Has alcanzado tu limite de ${settings.max_trades_per_day} operaciones hoy (llevas ${tradesToday})`
    )
  }

  if (dailyPL < 0 && Math.abs(dailyPL) >= settings.daily_loss_limit) {
    warnings.push(
      `Tu perdida del dia ($${Math.abs(dailyPL).toFixed(2)}) supera tu limite de $${settings.daily_loss_limit}`
    )
  }

  if (dailyPL > 0 && dailyPL >= settings.daily_gain_limit) {
    warnings.push(
      `Tu ganancia del dia ($${dailyPL.toFixed(2)}) supera tu limite de $${settings.daily_gain_limit}`
    )
  }

  if (warnings.length === 0) return null

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
      <div className="flex items-start gap-2">
        <AlertTriangle size={18} className="text-yellow-400 mt-0.5 shrink-0" />
        <div className="space-y-1">
          {warnings.map((msg, i) => (
            <p key={i} className="text-yellow-300 text-sm">{msg}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
