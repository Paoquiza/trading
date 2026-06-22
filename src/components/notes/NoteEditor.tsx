import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { Button } from '../ui/Button'

interface NoteEditorProps {
  content: string
  onSave: (content: string) => Promise<void>
  saving?: boolean
}

export function NoteEditor({ content, onSave, saving }: NoteEditorProps) {
  const [text, setText] = useState(content)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setText(content)
    setDirty(false)
  }, [content])

  const handleChange = (value: string) => {
    setText(value)
    setDirty(value !== content)
  }

  const handleSave = async () => {
    await onSave(text)
    setDirty(false)
  }

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={e => handleChange(e.target.value)}
        rows={12}
        className="w-full bg-dark-700 border border-dark-500 rounded-lg px-4 py-3 text-dark-100 placeholder-dark-300 focus:outline-none focus:border-accent-500 transition-colors resize-none"
        placeholder="Write your daily reflections, market observations, lessons learned..."
      />
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!dirty || saving} size="sm">
          <span className="flex items-center gap-2">
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Note'}
          </span>
        </Button>
      </div>
    </div>
  )
}
