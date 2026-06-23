import { useState, useCallback } from 'react'
import type { TradingRules } from '../lib/types'

const STORAGE_KEY = 'forex-journal-rules'

const DEFAULT_RULES: TradingRules = {
  balance: 10000,
  maxDailyLossPercent: 2,
  maxDailyGainPercent: 4,
  maxTradesPerDay: 2,
  riskRewardRatio: 2,
}

function loadRules(): TradingRules {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_RULES, ...JSON.parse(stored) }
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_RULES
}

export function useSettings() {
  const [rules, setRulesState] = useState<TradingRules>(loadRules)

  const saveRules = useCallback((updated: TradingRules) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setRulesState(updated)
  }, [])

  const riskPerTrade = Math.round(
    (rules.balance * (rules.maxDailyLossPercent / 100) / rules.maxTradesPerDay) * 100
  ) / 100

  const maxDailyLoss = Math.round(rules.balance * (rules.maxDailyLossPercent / 100) * 100) / 100
  const maxDailyGain = Math.round(rules.balance * (rules.maxDailyGainPercent / 100) * 100) / 100

  const updateBalance = useCallback((profitLoss: number) => {
    const updated = { ...loadRules(), balance: Math.round((loadRules().balance + profitLoss) * 100) / 100 }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setRulesState(updated)
  }, [])

  return { rules, saveRules, updateBalance, riskPerTrade, maxDailyLoss, maxDailyGain }
}
