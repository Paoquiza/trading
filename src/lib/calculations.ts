import { JPY_PAIRS, PIP_VALUES } from './constants'
import type { CalculatorInputs, CalculatorResult, Trade, TradeStats } from './types'

export function calculatePips(
  pair: string,
  direction: 'buy' | 'sell',
  entryPrice: number,
  exitPrice: number
): number {
  const isJpy = JPY_PAIRS.includes(pair)
  const multiplier = isJpy ? 100 : 10000
  const diff = direction === 'buy'
    ? (exitPrice - entryPrice) * multiplier
    : (entryPrice - exitPrice) * multiplier
  return Math.round(diff * 10) / 10
}

export function calculateProfitLoss(
  pair: string,
  pips: number,
  lotSize: number
): number {
  const pipValue = PIP_VALUES[pair] ?? 10
  return Math.round(pips * pipValue * lotSize * 100) / 100
}

export function calculatePositionSize(inputs: CalculatorInputs): CalculatorResult {
  const { capital, riskPercent, stopLossPips, pair } = inputs
  const maxLoss = capital * (riskPercent / 100)
  const pipValue = PIP_VALUES[pair] ?? 10

  // positionSize in standard lots
  const positionSize = maxLoss / (stopLossPips * pipValue)
  const roundedSize = Math.round(positionSize * 100) / 100

  return {
    maxLoss: Math.round(maxLoss * 100) / 100,
    positionSize: roundedSize,
    pipValue,
  }
}

export function calculateTradeStats(trades: Trade[]): TradeStats {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.profit_loss !== null)
  const totalTrades = closedTrades.length

  if (totalTrades === 0) {
    return { totalTrades: 0, winRate: 0, avgPips: 0, totalPL: 0, winners: 0, losers: 0 }
  }

  const winners = closedTrades.filter(t => (t.profit_loss ?? 0) > 0).length
  const losers = closedTrades.filter(t => (t.profit_loss ?? 0) < 0).length
  const winRate = Math.round((winners / totalTrades) * 100)
  const totalPips = closedTrades.reduce((sum, t) => sum + (t.pips ?? 0), 0)
  const avgPips = Math.round((totalPips / totalTrades) * 10) / 10
  const totalPL = Math.round(closedTrades.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0) * 100) / 100

  return { totalTrades, winRate, avgPips, totalPL, winners, losers }
}

export function getEquityCurve(trades: Trade[], startingCapital: number = 0): { date: string; equity: number }[] {
  const closedTrades = trades
    .filter(t => t.status === 'closed' && t.profit_loss !== null)
    .sort((a, b) => a.date.localeCompare(b.date))

  let equity = startingCapital
  return closedTrades.map(t => {
    equity += t.profit_loss ?? 0
    return { date: t.date, equity: Math.round(equity * 100) / 100 }
  })
}

export function getDailyPL(trades: Trade[]): Record<string, number> {
  const dailyPL: Record<string, number> = {}
  trades
    .filter(t => t.status === 'closed' && t.profit_loss !== null)
    .forEach(t => {
      dailyPL[t.date] = (dailyPL[t.date] ?? 0) + (t.profit_loss ?? 0)
    })
  return dailyPL
}
