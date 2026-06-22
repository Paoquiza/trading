import { useState, useMemo } from 'react'
import { Card } from '../components/ui/Card'
import { RiskCalculatorForm } from '../components/calculator/RiskCalculatorForm'
import { PositionSizeResult } from '../components/calculator/PositionSizeResult'
import { ProjectionsTable } from '../components/calculator/ProjectionsTable'
import { PipValueTable } from '../components/calculator/PipValueTable'
import { calculatePositionSize } from '../lib/calculations'
import type { CalculatorInputs } from '../lib/types'

export function CalculatorPage() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    capital: 10000,
    riskPercent: 1,
    stopLossPips: 20,
    pair: 'EUR/USD',
  })

  const result = useMemo(() => {
    if (inputs.capital > 0 && inputs.riskPercent > 0 && inputs.stopLossPips > 0) {
      return calculatePositionSize(inputs)
    }
    return null
  }, [inputs])

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Risk Calculator</h1>

      <Card>
        <h2 className="text-sm font-semibold text-white mb-4">Position Size Calculator</h2>
        <RiskCalculatorForm inputs={inputs} onChange={setInputs} />
      </Card>

      {result && (
        <>
          <PositionSizeResult
            result={result}
            riskPercent={inputs.riskPercent}
            stopLossPips={inputs.stopLossPips}
          />
          <ProjectionsTable
            result={result}
            capital={inputs.capital}
            riskPercent={inputs.riskPercent}
          />
        </>
      )}

      <PipValueTable />
    </div>
  )
}
