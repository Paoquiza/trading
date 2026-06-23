import type { Trade, TradeStats } from './types'

// XAU/USD: 1 standard lot = 100 troy ounces
// P&L per $1 price move = lot_size × 100
const GOLD_CONTRACT_SIZE = 100

export function calculatePips(
  direction: 'buy' | 'sell',
  entryPrice: number,
  exitPrice: number
): number {
  // For gold, we measure in price points (dollars), not pips
  const diff = direction === 'buy'
    ? exitPrice - entryPrice
    : entryPrice - exitPrice
  return Math.round(diff * 1000) / 1000
}

export function calculateProfitLoss(
  priceDiff: number,
  lotSize: number
): number {
  // P&L = lot_size × 100 oz × price_difference
  return Math.round(priceDiff * lotSize * GOLD_CONTRACT_SIZE * 100) / 100
}

export interface SLTPResult {
  slPrice: number
  tpPrice: number
  slDistance: number
  tpDistance: number
  riskAmount: number
  potentialProfit: number
}

export function calculateSLTP(
  direction: 'buy' | 'sell',
  entryPrice: number,
  riskAmount: number,
  lotSize: number,
  ratio: number
): SLTPResult {
  // For XAU/USD: risk = lot_size × 100 × sl_distance
  // So: sl_distance = risk_amount / (lot_size × 100)
  const slDistance = riskAmount / (lotSize * GOLD_CONTRACT_SIZE)
  const tpDistance = slDistance * ratio

  let slPrice: number
  let tpPrice: number

  if (direction === 'buy') {
    slPrice = entryPrice - slDistance
    tpPrice = entryPrice + tpDistance
  } else {
    slPrice = entryPrice + slDistance
    tpPrice = entryPrice - tpDistance
  }

  return {
    slPrice: Math.round(slPrice * 1000) / 1000,
    tpPrice: Math.round(tpPrice * 1000) / 1000,
    slDistance: Math.round(slDistance * 1000) / 1000,
    tpDistance: Math.round(tpDistance * 1000) / 1000,
    riskAmount: Math.round(riskAmount * 100) / 100,
    potentialProfit: Math.round(riskAmount * ratio * 100) / 100,
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
