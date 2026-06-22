import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { FOREX_PAIRS } from '../../lib/constants'
import type { CalculatorInputs } from '../../lib/types'

interface RiskCalculatorFormProps {
  inputs: CalculatorInputs
  onChange: (inputs: CalculatorInputs) => void
}

export function RiskCalculatorForm({ inputs, onChange }: RiskCalculatorFormProps) {
  const pairOptions = FOREX_PAIRS.map(p => ({ label: p, value: p }))

  return (
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Account Capital ($)"
        type="number"
        min="0"
        step="100"
        value={inputs.capital || ''}
        onChange={e => onChange({ ...inputs, capital: parseFloat(e.target.value) || 0 })}
        placeholder="10000"
      />
      <Input
        label="Risk per Trade (%)"
        type="number"
        min="0.1"
        max="100"
        step="0.1"
        value={inputs.riskPercent || ''}
        onChange={e => onChange({ ...inputs, riskPercent: parseFloat(e.target.value) || 0 })}
        placeholder="1"
      />
      <Input
        label="Stop Loss (pips)"
        type="number"
        min="1"
        step="1"
        value={inputs.stopLossPips || ''}
        onChange={e => onChange({ ...inputs, stopLossPips: parseFloat(e.target.value) || 0 })}
        placeholder="20"
      />
      <Select
        label="Currency Pair"
        options={pairOptions}
        value={inputs.pair}
        onChange={e => onChange({ ...inputs, pair: e.target.value })}
      />
    </div>
  )
}
