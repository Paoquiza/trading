import { Card } from '../ui/Card'
import type { CalculatorResult } from '../../lib/types'

interface PositionSizeResultProps {
  result: CalculatorResult
  riskPercent: number
  stopLossPips: number
}

export function PositionSizeResult({ result, riskPercent, stopLossPips }: PositionSizeResultProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="text-center">
        <p className="text-xs text-dark-300 mb-1">Max Loss</p>
        <p className="text-xl font-semibold text-red-400">${result.maxLoss.toFixed(2)}</p>
        <p className="text-xs text-dark-400 mt-1">{riskPercent}% risk</p>
      </Card>
      <Card className="text-center">
        <p className="text-xs text-dark-300 mb-1">Position Size</p>
        <p className="text-xl font-semibold text-accent-400">{result.positionSize.toFixed(2)} lots</p>
        <p className="text-xs text-dark-400 mt-1">{stopLossPips} pip SL</p>
      </Card>
      <Card className="text-center">
        <p className="text-xs text-dark-300 mb-1">Pip Value</p>
        <p className="text-xl font-semibold text-white">${result.pipValue.toFixed(2)}</p>
        <p className="text-xs text-dark-400 mt-1">per std lot</p>
      </Card>
    </div>
  )
}
