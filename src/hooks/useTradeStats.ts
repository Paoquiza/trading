import { useMemo } from 'react'
import { calculateTradeStats, getEquityCurve, getDailyPL } from '../lib/calculations'
import type { Trade } from '../lib/types'

export function useTradeStats(trades: Trade[]) {
  const stats = useMemo(() => calculateTradeStats(trades), [trades])
  const equityCurve = useMemo(() => getEquityCurve(trades), [trades])
  const dailyPL = useMemo(() => getDailyPL(trades), [trades])

  return { stats, equityCurve, dailyPL }
}
