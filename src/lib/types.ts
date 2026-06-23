export type TradeDirection = 'buy' | 'sell'
export type TradeStatus = 'open' | 'closed'

export interface Trade {
  id: string
  user_id: string
  date: string
  pair: string
  direction: TradeDirection
  entry_price: number
  exit_price: number | null
  lot_size: number
  pips: number | null
  profit_loss: number | null
  notes: string | null
  stop_loss: number | null
  take_profit: number | null
  status: TradeStatus
  balance: number | null
  risk_amount: number | null
  risk_reward_ratio: number | null
  created_at: string
}

export type TradeInsert = Omit<Trade, 'id' | 'created_at' | 'user_id'>
export type TradeUpdate = Partial<TradeInsert>

export interface TradeImage {
  id: string
  trade_id: string
  image_url: string
  storage_path: string
  created_at: string
}

export interface DailyNote {
  id: string
  user_id: string
  date: string
  content: string
  created_at: string
  updated_at: string
}

export interface TradeFilters {
  dateFrom?: string
  dateTo?: string
  result?: 'winner' | 'loser' | 'all'
}

export interface TradeStats {
  totalTrades: number
  winRate: number
  avgPips: number
  totalPL: number
  winners: number
  losers: number
}

export interface TradingRules {
  balance: number
  maxDailyLossPercent: number
  maxDailyGainPercent: number
  maxTradesPerDay: number
  riskRewardRatio: number
}

export interface NoteImage {
  id: string
  note_id: string
  image_url: string
  storage_path: string
  created_at: string
}
