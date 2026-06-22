import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { UserSettings } from '../lib/types'

const DEFAULTS = {
  max_trades_per_day: 2,
  daily_loss_limit: 100,
  daily_gain_limit: 200,
}

export function useSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching settings:', error)
      setLoading(false)
      return
    }

    if (data) {
      setSettings(data as UserSettings)
    } else {
      // Create defaults
      const { data: created, error: createError } = await supabase
        .from('user_settings')
        .insert({ user_id: user.id, ...DEFAULTS })
        .select()
        .single()

      if (createError) console.error('Error creating default settings:', createError)
      setSettings(created as UserSettings | null)
    }

    setLoading(false)
  }, [user])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const updateSettings = async (updates: Partial<Pick<UserSettings, 'max_trades_per_day' | 'daily_loss_limit' | 'daily_gain_limit'>>) => {
    if (!settings) return null

    const { data, error } = await supabase
      .from('user_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', settings.id)
      .select()
      .single()

    if (error) { console.error('Error updating settings:', error); return null }
    setSettings(data as UserSettings)
    return data as UserSettings
  }

  return { settings, loading, updateSettings }
}
