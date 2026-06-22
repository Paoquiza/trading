import { Card } from '../ui/Card'
import type { CalculatorResult } from '../../lib/types'

interface ProjectionsTableProps {
  result: CalculatorResult
  capital: number
  riskPercent: number
}

export function ProjectionsTable({ result, capital, riskPercent }: ProjectionsTableProps) {
  const maxLoss = result.maxLoss
  const avgWin = maxLoss * 2 // Assuming 2:1 R:R
  const winRate = 0.5

  const dailyTrades = 2
  const weeklyTrades = dailyTrades * 5
  const monthlyTrades = weeklyTrades * 4

  const expectedPerTrade = (avgWin * winRate) - (maxLoss * (1 - winRate))
  const expectedDaily = expectedPerTrade * dailyTrades
  const expectedWeekly = expectedPerTrade * weeklyTrades
  const expectedMonthly = expectedPerTrade * monthlyTrades

  const rows = [
    {
      period: 'Per Trade',
      maxLoss: -maxLoss,
      maxWin: avgWin,
      expected: expectedPerTrade,
    },
    {
      period: `Daily (${dailyTrades} trades)`,
      maxLoss: -maxLoss * dailyTrades,
      maxWin: avgWin * dailyTrades,
      expected: expectedDaily,
    },
    {
      period: `Weekly (${weeklyTrades} trades)`,
      maxLoss: -maxLoss * weeklyTrades,
      maxWin: avgWin * weeklyTrades,
      expected: expectedWeekly,
    },
    {
      period: `Monthly (${monthlyTrades} trades)`,
      maxLoss: -maxLoss * monthlyTrades,
      maxWin: avgWin * monthlyTrades,
      expected: expectedMonthly,
    },
  ]

  return (
    <Card>
      <h3 className="text-sm font-semibold text-white mb-1">Projections</h3>
      <p className="text-xs text-dark-400 mb-4">Based on {riskPercent}% risk, 2:1 R:R, 50% win rate on ${capital.toLocaleString()} capital</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-dark-300 border-b border-dark-600">
              <th className="text-left py-2 pr-4">Period</th>
              <th className="text-right py-2 px-4">Max Loss</th>
              <th className="text-right py-2 px-4">Max Win</th>
              <th className="text-right py-2 pl-4">Expected</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.period} className="border-b border-dark-700">
                <td className="py-2 pr-4 text-dark-100">{row.period}</td>
                <td className="py-2 px-4 text-right text-red-400">-${Math.abs(row.maxLoss).toFixed(2)}</td>
                <td className="py-2 px-4 text-right text-green-400">+${row.maxWin.toFixed(2)}</td>
                <td className={`py-2 pl-4 text-right font-medium ${row.expected >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {row.expected >= 0 ? '+' : '-'}${Math.abs(row.expected).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
