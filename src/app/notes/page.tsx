'use client'

import { useState } from 'react'
import { Plus, X, Edit3, Save } from 'lucide-react'
import { useDataStorage } from '@/hooks/useLocalStorage'

interface Note {
  id: string
  content: string
  color: string
  createdAt: Date
}

const noteColors = [
  'bg-yellow-100 border-yellow-300',
  'bg-blue-100 border-blue-300',
  'bg-green-100 border-green-300',
  'bg-pink-100 border-pink-300',
  'bg-purple-100 border-purple-300',
  'bg-orange-100 border-orange-300',
]

export default function NotesPage() {
  const [notes, setNotes] = useDataStorage<Note[]>('notes', [])
  const [newNote, setNewNote] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const addNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        content: newNote.trim(),
        color: noteColors[Math.floor(Math.random() * noteColors.length)],
        createdAt: new Date(),
      }
      setNotes([note, ...notes])
      setNewNote('')
    }
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id))
  }

  const startEdit = (note: Note) => {
    setEditingId(note.id)
    setEditContent(note.content)
  }

  const saveEdit = () => {
    if (editingId && editContent.trim()) {
      setNotes(notes.map(note => 
        note.id === editingId 
          ? { ...note, content: editContent.trim() }
          : note
      ))
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
      addNote()
    }
  }

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
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
            <button
              onClick={addNote}
              disabled={!newNote.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={20} />
              <span>Add Note</span>
            </button>
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
              Latest: {notes.length > 0 ? notes[0].createdAt.toLocaleDateString() : 'None'}
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
              className={`p-4 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow ${note.color}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="text-xs text-gray-500">
                  {note.createdAt.toLocaleDateString()} {note.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => startEdit(note)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
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
    </div>
  )
}