import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Note {
  id: string
  title: string
  content: string
  category?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
  isPinned: boolean
  isEncrypted: boolean
  color?: 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'pink'
  reminder?: {
    date: string
    completed: boolean
  }
  attachments?: {
    id: string
    name: string
    type: string
    size: number
    url?: string
  }[]
}

interface NotesState {
  notes: Note[]
  loading: boolean
  error: string | null
  searchTerm: string
  selectedCategory: string
}

const initialState: NotesState = {
  notes: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedCategory: 'all',
}

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote: (state, action: PayloadAction<Note>) => {
      state.notes.unshift(action.payload)
    },
    updateNote: (state, action: PayloadAction<{ id: string; updates: Partial<Note> }>) => {
      const { id, updates } = action.payload
      const noteIndex = state.notes.findIndex(note => note.id === id)
      
      if (noteIndex !== -1) {
        state.notes[noteIndex] = { 
          ...state.notes[noteIndex], 
          ...updates,
          updatedAt: new Date().toISOString()
        }
      }
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter(note => note.id !== action.payload)
    },
    togglePin: (state, action: PayloadAction<string>) => {
      const note = state.notes.find(note => note.id === action.payload)
      if (note) {
        note.isPinned = !note.isPinned
        note.updatedAt = new Date().toISOString()
      }
    },
    addTag: (state, action: PayloadAction<{ id: string; tag: string }>) => {
      const { id, tag } = action.payload
      const note = state.notes.find(note => note.id === id)
      
      if (note) {
        if (!note.tags) note.tags = []
        if (!note.tags.includes(tag)) {
          note.tags.push(tag)
          note.updatedAt = new Date().toISOString()
        }
      }
    },
    removeTag: (state, action: PayloadAction<{ id: string; tag: string }>) => {
      const { id, tag } = action.payload
      const note = state.notes.find(note => note.id === id)
      
      if (note && note.tags) {
        note.tags = note.tags.filter(t => t !== tag)
        note.updatedAt = new Date().toISOString()
      }
    },
    setReminder: (state, action: PayloadAction<{ id: string; reminder: Note['reminder'] }>) => {
      const { id, reminder } = action.payload
      const note = state.notes.find(note => note.id === id)
      
      if (note) {
        note.reminder = reminder
        note.updatedAt = new Date().toISOString()
      }
    },
    completeReminder: (state, action: PayloadAction<string>) => {
      const note = state.notes.find(note => note.id === action.payload)
      if (note && note.reminder) {
        note.reminder.completed = true
        note.updatedAt = new Date().toISOString()
      }
    },
    addAttachment: (state, action: PayloadAction<{ noteId: string; attachment: { id: string; name: string; type: string; size: number; url?: string } }>) => {
      const { noteId, attachment } = action.payload
      const note = state.notes.find(note => note.id === noteId)
      
      if (note) {
        if (!note.attachments) note.attachments = []
        note.attachments.push(attachment)
        note.updatedAt = new Date().toISOString()
      }
    },
    removeAttachment: (state, action: PayloadAction<{ noteId: string; attachmentId: string }>) => {
      const { noteId, attachmentId } = action.payload
      const note = state.notes.find(note => note.id === noteId)
      
      if (note && note.attachments) {
        note.attachments = note.attachments.filter(a => a.id !== attachmentId)
        note.updatedAt = new Date().toISOString()
      }
    },
    bulkImportNotes: (state, action: PayloadAction<Note[]>) => {
      const newNotes = action.payload
      state.notes = [...newNotes, ...state.notes]
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearNotes: (state) => {
      state.notes = []
    },
  },
})

export const {
  addNote,
  updateNote,
  deleteNote,
  togglePin,
  addTag,
  removeTag,
  setReminder,
  completeReminder,
  addAttachment,
  removeAttachment,
  bulkImportNotes,
  setSearchTerm,
  setSelectedCategory,
  setLoading,
  setError,
  clearNotes,
} = notesSlice.actions

// Selectors
export const selectNotes = (state: { notes: NotesState }) => state.notes.notes
export const selectNotesLoading = (state: { notes: NotesState }) => state.notes.loading
export const selectNotesError = (state: { notes: NotesState }) => state.notes.error
export const selectNotesSearchTerm = (state: { notes: NotesState }) => state.notes.searchTerm
export const selectNotesSelectedCategory = (state: { notes: NotesState }) => state.notes.selectedCategory

// Advanced selectors
export const selectPinnedNotes = (state: { notes: NotesState }) => {
  return state.notes.notes.filter(note => note.isPinned)
}

export const selectFilteredNotes = (state: { notes: NotesState }) => {
  const { notes, searchTerm, selectedCategory } = state.notes
  
  return notes.filter(note => {
    // Category filter
    if (selectedCategory !== 'all' && note.category !== selectedCategory) {
      return false
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        note.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
    
    return true
  })
}

export const selectNotesByCategory = (state: { notes: NotesState }) => {
  const notes = state.notes.notes
  return notes.reduce((acc, note) => {
    const category = note.category || 'uncategorized'
    if (!acc[category]) acc[category] = []
    acc[category].push(note)
    return acc
  }, {} as Record<string, Note[]>)
}

export const selectNotesWithReminders = (state: { notes: NotesState }) => {
  return state.notes.notes.filter(note => note.reminder && !note.reminder.completed)
}

export default notesSlice.reducer