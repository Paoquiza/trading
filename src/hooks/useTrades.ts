import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { calculatePips, calculateProfitLoss } from '../lib/calculations'
import type { Trade, TradeInsert, TradeUpdate, TradeFilters } from '../lib/types'

export function useTrades(filters?: TradeFilters) {
  const { user } = useAuth()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTrades = useCallback(async () => {
    if (!user) return
    setLoading(true)

    let query = supabase
      .from('trades')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters?.dateFrom) query = query.gte('date', filters.dateFrom)
    if (filters?.dateTo) query = query.lte('date', filters.dateTo)
    if (filters?.pair) query = query.eq('pair', filters.pair)
    if (filters?.result === 'winner') query = query.gt('profit_loss', 0)
    if (filters?.result === 'loser') query = query.lt('profit_loss', 0)

    const { data, error } = await query
    if (error) console.error('Error fetching trades:', error)
    setTrades((data as Trade[]) ?? [])
    setLoading(false)
  }, [user, filters?.dateFrom, filters?.dateTo, filters?.pair, filters?.result])

  useEffect(() => { fetchTrades() }, [fetchTrades])

  const createTrade = async (trade: TradeInsert) => {
    if (!user) return null

    let pips = trade.pips
    let profitLoss = trade.profit_loss

    if (trade.status === 'closed' && trade.exit_price != null) {
      pips = calculatePips(trade.pair, trade.direction, trade.entry_price, trade.exit_price)
      profitLoss = calculateProfitLoss(trade.pair, pips, trade.lot_size)
    }

    const { data, error } = await supabase
      .from('trades')
      .insert({ ...trade, user_id: user.id, pips, profit_loss: profitLoss })
      .select()
      .single()

    if (error) { console.error('Error creating trade:', error); return null }
    await fetchTrades()
    return data as Trade
  }

  const updateTrade = async (id: string, updates: TradeUpdate) => {
    const existing = trades.find(t => t.id === id)
    if (!existing) return null

    const merged = { ...existing, ...updates }
    let pips = merged.pips
    let profitLoss = merged.profit_loss

    if (merged.status === 'closed' && merged.exit_price != null) {
      pips = calculatePips(merged.pair, merged.direction, merged.entry_price, merged.exit_price)
      profitLoss = calculateProfitLoss(merged.pair, pips, merged.lot_size)
    }

    const { data, error } = await supabase
      .from('trades')
      .update({ ...updates, pips, profit_loss: profitLoss })
      .eq('id', id)
      .select()
      .single()

    if (error) { console.error('Error updating trade:', error); return null }
    await fetchTrades()
    return data as Trade
  }

  const deleteTrade = async (id: string) => {
    const { error } = await supabase.from('trades').delete().eq('id', id)
    if (error) { console.error('Error deleting trade:', error); return false }
    await fetchTrades()
    return true
  }

  return { trades, loading, fetchTrades, createTrade, updateTrade, deleteTrade }
}

export function useTrade(id: string) {
  const [trade, setTrade] = useState<Trade | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('id', id)
        .single()

      if (error) console.error('Error fetching trade:', error)
      setTrade(data as Trade | null)
      setLoading(false)
    }
    fetch()
  }, [id])

  return { trade, loading, setTrade }
}
