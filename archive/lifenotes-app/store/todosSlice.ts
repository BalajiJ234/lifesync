import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Todo {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  category: string
  createdAt: string
  tags?: string[]
  notes?: string
}

interface TodosState {
  todos: Todo[]
  loading: boolean
  error: string | null
}

const initialState: TodosState = {
  todos: [],
  loading: false,
  error: null,
}

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<Todo>) => {
      state.todos.unshift(action.payload)
    },
    updateTodo: (state, action: PayloadAction<{ id: string; updates: Partial<Todo> }>) => {
      const { id, updates } = action.payload
      const todoIndex = state.todos.findIndex(todo => todo.id === id)
      
      if (todoIndex !== -1) {
        state.todos[todoIndex] = { ...state.todos[todoIndex], ...updates }
      }
    },
    deleteTodo: (state, action: PayloadAction<string>) => {
      state.todos = state.todos.filter(todo => todo.id !== action.payload)
    },
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find(todo => todo.id === action.payload)
      if (todo) {
        todo.completed = !todo.completed
      }
    },
    bulkImportTodos: (state, action: PayloadAction<Todo[]>) => {
      const newTodos = action.payload
      state.todos = [...newTodos, ...state.todos]
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearTodos: (state) => {
      state.todos = []
    },
    reorderTodos: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload
      const [movedTodo] = state.todos.splice(fromIndex, 1)
      state.todos.splice(toIndex, 0, movedTodo)
    },
  },
})

export const {
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  bulkImportTodos,
  setLoading,
  setError,
  clearTodos,
  reorderTodos,
} = todosSlice.actions

// Selectors
export const selectTodos = (state: { todos: TodosState }) => state.todos.todos
export const selectTodosLoading = (state: { todos: TodosState }) => state.todos.loading
export const selectTodosError = (state: { todos: TodosState }) => state.todos.error

// Advanced selectors
export const selectActiveTodos = (state: { todos: TodosState }) => {
  return state.todos.todos.filter(todo => !todo.completed)
}

export const selectCompletedTodos = (state: { todos: TodosState }) => {
  return state.todos.todos.filter(todo => todo.completed)
}

export const selectTodosByPriority = (state: { todos: TodosState }, priority: 'low' | 'medium' | 'high') => {
  return state.todos.todos.filter(todo => todo.priority === priority && !todo.completed)
}

export const selectOverdueTodos = (state: { todos: TodosState }) => {
  const now = new Date()
  return state.todos.todos.filter(todo => 
    !todo.completed && 
    todo.dueDate && 
    new Date(todo.dueDate) < now
  )
}

export const selectTodosStats = (state: { todos: TodosState }) => {
  const todos = state.todos.todos
  return {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
    overdue: selectOverdueTodos(state).length,
    dueToday: todos.filter(t => 
      !t.completed && 
      t.dueDate && 
      new Date(t.dueDate).toDateString() === new Date().toDateString()
    ).length,
  }
}

export default todosSlice.reducer