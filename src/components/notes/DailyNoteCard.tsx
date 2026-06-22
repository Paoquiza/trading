import { formatDate } from '../../lib/formatters'
import type { DailyNote } from '../../lib/types'

interface DailyNoteCardProps {
  note: DailyNote
  selected: boolean
  onClick: () => void
}

export function DailyNoteCard({ note, selected, onClick }: DailyNoteCardProps) {
  const preview = note.content.slice(0, 100) + (note.content.length > 100 ? '...' : '')

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer ${
        selected
          ? 'bg-accent-500/10 border border-accent-500/30'
          : 'bg-dark-800 border border-dark-600 hover:border-dark-400'
      }`}
    >
      <p className="text-sm font-medium text-white">{formatDate(note.date)}</p>
      <p className="text-xs text-dark-300 mt-1 line-clamp-2">{preview || 'Empty note'}</p>
    </button>
  )
}
