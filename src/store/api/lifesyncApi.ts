import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Expense } from '../slices/expensesSlice'
import type { Todo } from '../slices/todosSlice'
import type { Goal } from '../slices/goalsSlice'
import type { Split } from '../slices/splitsSlice'
import type { Note } from '../slices/notesSlice'

// Define API base URL - will be configurable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Define API endpoints and data structures
export const lifesyncApi = createApi({
  reducerPath: 'lifesyncApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      // Add auth headers when user authentication is implemented
      // const token = (getState() as RootState).auth?.token
      // if (token) {
      //   headers.set('authorization', `Bearer ${token}`)
      // }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Expense', 'Todo', 'Goal', 'Split', 'Note', 'User'],
  endpoints: (builder) => ({
    // Expenses API
    getExpenses: builder.query<Expense[], void>({
      query: () => '/expenses',
      providesTags: ['Expense'],
    }),
    addExpense: builder.mutation<Expense, Partial<Expense>>({
      query: (expense) => ({
        url: '/expenses',
        method: 'POST',
        body: expense,
      }),
      invalidatesTags: ['Expense'],
    }),
    updateExpense: builder.mutation<Expense, { id: string; updates: Partial<Expense> }>({
      query: ({ id, updates }) => ({
        url: `/expenses/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Expense'],
    }),
    deleteExpense: builder.mutation<void, string>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Expense'],
    }),

    // Todos API
    getTodos: builder.query<Todo[], void>({
      query: () => '/todos',
      providesTags: ['Todo'],
    }),
    addTodo: builder.mutation<Todo, Partial<Todo>>({
      query: (todo) => ({
        url: '/todos',
        method: 'POST',
        body: todo,
      }),
      invalidatesTags: ['Todo'],
    }),
    updateTodo: builder.mutation<Todo, { id: string; updates: Partial<Todo> }>({
      query: ({ id, updates }) => ({
        url: `/todos/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Todo'],
    }),
    deleteTodo: builder.mutation<void, string>({
      query: (id) => ({
        url: `/todos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Todo'],
    }),

    // Goals API
    getGoals: builder.query<Goal[], void>({
      query: () => '/goals',
      providesTags: ['Goal'],
    }),
    addGoal: builder.mutation<Goal, Partial<Goal>>({
      query: (goal) => ({
        url: '/goals',
        method: 'POST',
        body: goal,
      }),
      invalidatesTags: ['Goal'],
    }),
    updateGoal: builder.mutation<Goal, { id: string; updates: Partial<Goal> }>({
      query: ({ id, updates }) => ({
        url: `/goals/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Goal'],
    }),
    deleteGoal: builder.mutation<void, string>({
      query: (id) => ({
        url: `/goals/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Goal'],
    }),

    // Splits API
    getSplits: builder.query<Split[], void>({
      query: () => '/splits',
      providesTags: ['Split'],
    }),
    addSplit: builder.mutation<Split, Partial<Split>>({
      query: (split) => ({
        url: '/splits',
        method: 'POST',
        body: split,
      }),
      invalidatesTags: ['Split'],
    }),
    updateSplit: builder.mutation<Split, { id: string; updates: Partial<Split> }>({
      query: ({ id, updates }) => ({
        url: `/splits/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Split'],
    }),
    deleteSplit: builder.mutation<void, string>({
      query: (id) => ({
        url: `/splits/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Split'],
    }),

    // Notes API
    getNotes: builder.query<Note[], void>({
      query: () => '/notes',
      providesTags: ['Note'],
    }),
    addNote: builder.mutation<Note, Partial<Note>>({
      query: (note) => ({
        url: '/notes',
        method: 'POST',
        body: note,
      }),
      invalidatesTags: ['Note'],
    }),
    updateNote: builder.mutation<Note, { id: string; updates: Partial<Note> }>({
      query: ({ id, updates }) => ({
        url: `/notes/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Note'],
    }),
    deleteNote: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Note'],
    }),

    // AI-powered endpoints
    categorizeExpense: builder.mutation<{ category: string; confidence: number }, { description: string; amount: number }>({
      query: (expense) => ({
        url: '/ai/categorize',
        method: 'POST',
        body: expense,
      }),
    }),
    
    analyzeGoal: builder.mutation<{ feasibility: string; suggestions: string[]; monthlyRequired: number }, { goal: Partial<Goal>; expenses: Expense[] }>({
      query: (data) => ({
        url: '/ai/analyze-goal',
        method: 'POST',
        body: data,
      }),
    }),

    // Sync endpoints for offline support
    syncData: builder.mutation<void, { 
      expenses?: Expense[], 
      todos?: Todo[], 
      goals?: Goal[], 
      splits?: Split[], 
      notes?: Note[] 
    }>({
      query: (data) => ({
        url: '/sync',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Expense', 'Todo', 'Goal', 'Split', 'Note'],
    }),
  }),
})

// Export hooks for usage in components
export const {
  // Expenses
  useGetExpensesQuery,
  useAddExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  
  // Todos
  useGetTodosQuery,
  useAddTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
  
  // Goals
  useGetGoalsQuery,
  useAddGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  
  // Splits
  useGetSplitsQuery,
  useAddSplitMutation,
  useUpdateSplitMutation,
  useDeleteSplitMutation,
  
  // Notes
  useGetNotesQuery,
  useAddNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  
  // AI
  useCategorizeExpenseMutation,
  useAnalyzeGoalMutation,
  
  // Sync
  useSyncDataMutation,
} = lifesyncApi