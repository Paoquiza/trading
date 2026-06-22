import { Card } from '../ui/Card'
import { PIP_VALUES } from '../../lib/constants'

export function PipValueTable() {
  const lotSizes = [
    { label: 'Standard (1.00)', multiplier: 1 },
    { label: 'Mini (0.10)', multiplier: 0.1 },
    { label: 'Micro (0.01)', multiplier: 0.01 },
  ]

  const pairs = Object.entries(PIP_VALUES).slice(0, 14)

  return (
    <Card>
      <h3 className="text-sm font-semibold text-white mb-1">Pip Value Reference</h3>
      <p className="text-xs text-dark-400 mb-4">Approximate pip value in USD for common lot sizes</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-dark-300 border-b border-dark-600">
              <th className="text-left py-2 pr-4">Pair</th>
              {lotSizes.map(ls => (
                <th key={ls.label} className="text-right py-2 px-3">{ls.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pairs.map(([pair, pipValue]) => (
              <tr key={pair} className="border-b border-dark-700">
                <td className="py-2 pr-4 text-dark-100 font-medium">{pair}</td>
                {lotSizes.map(ls => (
                  <td key={ls.label} className="py-2 px-3 text-right text-dark-200">
                    ${(pipValue * ls.multiplier).toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
