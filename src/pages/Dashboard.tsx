import { StatsOverview } from '../components/dashboard/StatsOverview'
import { EquityCurveChart } from '../components/dashboard/EquityCurveChart'
import { CalendarHeatmap } from '../components/dashboard/CalendarHeatmap'
import { RecentTrades } from '../components/dashboard/RecentTrades'
import { useTrades } from '../hooks/useTrades'
import { useTradeStats } from '../hooks/useTradeStats'

export function DashboardPage() {
  const { trades, loading } = useTrades()
  const { stats, equityCurve, dailyPL } = useTradeStats(trades)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-400 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <StatsOverview stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EquityCurveChart data={equityCurve} />
        <CalendarHeatmap dailyPL={dailyPL} />
      </div>
      <RecentTrades trades={trades} />
    </div>
  )
}
