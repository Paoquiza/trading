import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import type { TradeFilters as FilterType } from '../../lib/types'

interface TradeFiltersProps {
  filters: FilterType
  onChange: (filters: FilterType) => void
}

export function TradeFilters({ filters, onChange }: TradeFiltersProps) {
  const resultOptions = [
    { label: 'All Results', value: 'all' },
    { label: 'Winners', value: 'winner' },
    { label: 'Losers', value: 'loser' },
  ]

  const clearFilters = () => {
    onChange({ dateFrom: undefined, dateTo: undefined, result: 'all' })
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Input
        label="From"
        type="date"
        value={filters.dateFrom ?? ''}
        onChange={e => onChange({ ...filters, dateFrom: e.target.value || undefined })}
      />
      <Input
        label="To"
        type="date"
        value={filters.dateTo ?? ''}
        onChange={e => onChange({ ...filters, dateTo: e.target.value || undefined })}
      />
      <Select
        label="Result"
        options={resultOptions}
        value={filters.result ?? 'all'}
        onChange={e => onChange({ ...filters, result: e.target.value as FilterType['result'] })}
      />
      <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
    </div>
  )
}
