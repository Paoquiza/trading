import { useState, useEffect } from 'react'
import { CalendarDays } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { NoteEditor } from '../components/notes/NoteEditor'
import { DailyNotesList } from '../components/notes/DailyNotesList'
import { useDailyNotes } from '../hooks/useDailyNotes'
import { toInputDate, formatDate } from '../lib/formatters'

export function NotesPage() {
  const { notes, loading, getNote, saveNote } = useDailyNotes()
  const [selectedDate, setSelectedDate] = useState(toInputDate(new Date()))
  const [currentContent, setCurrentContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingNote, setLoadingNote] = useState(false)

  useEffect(() => {
    const loadNote = async () => {
      setLoadingNote(true)
      const note = await getNote(selectedDate)
      setCurrentContent(note?.content ?? '')
      setLoadingNote(false)
    }
    loadNote()
  }, [selectedDate, getNote])

  const handleSave = async (content: string) => {
    setSaving(true)
    await saveNote(selectedDate, content)
    setCurrentContent(content)
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Daily Notes</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <CalendarDays size={18} className="text-dark-300" />
            <Input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
            <span className="text-dark-200 text-sm">{formatDate(selectedDate)}</span>
          </div>

          <Card>
            {loadingNote ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-accent-400 border-t-transparent" />
              </div>
            ) : (
              <NoteEditor content={currentContent} onSave={handleSave} saving={saving} />
            )}
          </Card>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-dark-200 mb-3">Recent Notes</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-accent-400 border-t-transparent" />
            </div>
          ) : (
            <DailyNotesList
              notes={notes}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          )}
        </div>
      </div>
    </div>
  )
}
