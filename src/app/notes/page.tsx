'use client'

import { useState } from 'react'
import { Plus, X, Edit3, Save, Upload } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { 
  addNote as addNoteAction, 
  updateNote, 
  deleteNote,
  type Note
} from '@/store/slices/notesSlice'
import BulkImport from '@/components/BulkImport'

// Using Redux Note interface - no local interface needed

const noteColors = [
  'bg-yellow-100 border-yellow-300',
  'bg-blue-100 border-blue-300',
  'bg-green-100 border-green-300',
  'bg-pink-100 border-pink-300',
  'bg-purple-100 border-purple-300',
  'bg-orange-100 border-orange-300',
]

// Map note color types to CSS classes
const getColorClass = (color?: 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'pink'): string => {
  const colorMap: Record<string, string> = {
    default: 'bg-gray-100 border-gray-300',
    blue: 'bg-blue-100 border-blue-300',
    green: 'bg-green-100 border-green-300',
    yellow: 'bg-yellow-100 border-yellow-300',
    red: 'bg-red-100 border-red-300',
    purple: 'bg-purple-100 border-purple-300',
    pink: 'bg-pink-100 border-pink-300',
  }
  return colorMap[color || 'default'] || colorMap.default
}

export default function NotesPage() {
  const dispatch = useAppDispatch()
  const notes = useAppSelector((state) => state.notes.notes)
  const [newNote, setNewNote] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [showBulkImport, setShowBulkImport] = useState(false)

  const handleAddNote = () => {
    if (newNote.trim()) {
      const colorOptions: Array<'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'pink'> = ['default', 'blue', 'green', 'yellow', 'red', 'purple', 'pink'];
      const note: Note = {
        id: Date.now().toString(),
        title: '', // Default empty title
        content: newNote.trim(),
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: false,
        isEncrypted: false,
      }
      dispatch(addNoteAction(note))
      setNewNote('')
    }
  }

  const handleDeleteNote = (id: string) => {
    dispatch(deleteNote(id))
  }

  const startEdit = (note: Note) => {
    setEditingId(note.id)
    setEditContent(note.content)
  }

  const saveEdit = () => {
    if (editingId && editContent.trim()) {
      dispatch(updateNote({
        id: editingId,
        updates: { content: editContent.trim() }
      }))
      setEditingId(null)
      setEditContent('')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAddNote()
    }
  }

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  const handleBulkImport = (data: unknown[]) => {
    const importedNotes = data as Note[]
    importedNotes.forEach(note => {
      dispatch(addNoteAction(note))
    })
    setShowBulkImport(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Quick Notes</h1>
        <p className="text-gray-600">Capture your thoughts and ideas instantly</p>
      </div>

      {/* Add Note Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="space-y-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Write a quick note... (Ctrl+Enter to save)"
            className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Tip: Use Ctrl+Enter to quickly add a note
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={20} />
                <span>Add Note</span>
              </button>
              <button
                onClick={() => setShowBulkImport(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload size={20} />
                <span>Bulk Import</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Stats */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Total Notes: <span className="font-semibold text-gray-900">{notes.length}</span>
            </div>
            <div className="text-sm text-gray-600">
              Latest: {notes.length > 0 ? new Date(notes[0].createdAt).toLocaleDateString() : 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Edit3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
          <p className="text-gray-600">Start by adding your first note above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow ${getColorClass(note.color)}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="text-xs text-gray-500">
                  {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => startEdit(note)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {editingId === note.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={handleEditKeyPress}
                    className="w-full p-2 border border-gray-300 rounded resize-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={saveEdit}
                      className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      <Save size={12} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-800 whitespace-pre-wrap break-words">
                  {note.content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImport
          feature="notes"
          onImport={handleBulkImport}
          onClose={() => setShowBulkImport(false)}
        />
      )}
    </div>
  )
}