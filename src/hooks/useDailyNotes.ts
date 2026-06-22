import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { DailyNote } from '../lib/types'

export function useDailyNotes() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<DailyNote[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotes = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('daily_notes')
      .select('*')
      .order('date', { ascending: false })

    if (error) console.error('Error fetching notes:', error)
    setNotes((data as DailyNote[]) ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const getNote = useCallback(async (date: string): Promise<DailyNote | null> => {
    if (!user) return null
    const { data, error } = await supabase
      .from('daily_notes')
      .select('*')
      .eq('date', date)
      .maybeSingle()

    if (error) console.error('Error fetching note:', error)
    return data as DailyNote | null
  }, [user])

  const saveNote = async (date: string, content: string) => {
    if (!user) return null

    const existing = await getNote(date)

    if (existing) {
      const { data, error } = await supabase
        .from('daily_notes')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) { console.error('Error updating note:', error); return null }
      await fetchNotes()
      return data as DailyNote
    } else {
      const { data, error } = await supabase
        .from('daily_notes')
        .insert({ user_id: user.id, date, content })
        .select()
        .single()

      if (error) { console.error('Error creating note:', error); return null }
      await fetchNotes()
      return data as DailyNote
    }
  }

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from('daily_notes').delete().eq('id', id)
    if (error) { console.error('Error deleting note:', error); return false }
    await fetchNotes()
    return true
  }

  return { notes, loading, getNote, saveNote, deleteNote, fetchNotes }
}
