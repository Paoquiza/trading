import ReactCalendarHeatmap from 'react-calendar-heatmap'
import { Card } from '../ui/Card'
import { subMonths, format } from 'date-fns'

interface CalendarHeatmapProps {
  dailyPL: Record<string, number>
}

export function CalendarHeatmap({ dailyPL }: CalendarHeatmapProps) {
  const today = new Date()
  const startDate = subMonths(today, 6)

  const values = Object.entries(dailyPL).map(([date, pl]) => ({
    date,
    count: pl,
  }))

  const classForValue = (value: Record<string, unknown> | undefined) => {
    if (!value || !value.count || value.count === 0) return 'color-empty'
    const count = value.count as number
    if (count > 0) {
      if (count > 200) return 'color-scale-4'
      if (count > 100) return 'color-scale-3'
      if (count > 50) return 'color-scale-2'
      return 'color-scale-1'
    }
    if (count < -200) return 'color-loss-4'
    if (count < -100) return 'color-loss-3'
    if (count < -50) return 'color-loss-2'
    return 'color-loss-1'
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-white mb-4">Trading Calendar</h3>
      <ReactCalendarHeatmap
        startDate={format(startDate, 'yyyy-MM-dd')}
        endDate={format(today, 'yyyy-MM-dd')}
        values={values}
        classForValue={classForValue}
        titleForValue={(value) => {
          if (!value || !value.date) return 'No trades'
          const pl = value.count as number
          const sign = pl >= 0 ? '+' : ''
          return `${value.date}: ${sign}$${Math.abs(pl).toFixed(2)}`
        }}
        showWeekdayLabels
      />
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-dark-300">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-[#991b1b]" /> Loss
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#1a1a25' }} /> No trades
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-[#166534]" /> Profit
        </div>
      </div>
    </Card>
  )
}
