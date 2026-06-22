import { DailyNoteCard } from './DailyNoteCard'
import type { DailyNote } from '../../lib/types'

interface DailyNotesListProps {
  notes: DailyNote[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

export function DailyNotesList({ notes, selectedDate, onSelectDate }: DailyNotesListProps) {
  if (notes.length === 0) {
    return <p className="text-dark-400 text-sm py-4">No notes yet. Pick a date to start writing.</p>
  }

  return (
    <div className="space-y-2">
      {notes.map(note => (
        <DailyNoteCard
          key={note.id}
          note={note}
          selected={note.date === selectedDate}
          onClick={() => onSelectDate(note.date)}
        />
      ))}
    </div>
  )
}
