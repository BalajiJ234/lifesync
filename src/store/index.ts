import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import type { PersistedState } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

// Import slices
import expensesReducer from './slices/expensesSlice'
import todosReducer from './slices/todosSlice'
import goalsReducer, { type GoalsState, type Goal } from './slices/goalsSlice'
import splitsReducer from './slices/splitsSlice'
import notesReducer from './slices/notesSlice'
import settingsReducer from './slices/settingsSlice'
import incomeReducer, { type IncomeState, type Income } from './slices/incomeSlice'
import { lifesyncApi } from './api/lifesyncApi'

const rootReducer = combineReducers({
  expenses: expensesReducer,
  income: incomeReducer,
  todos: todosReducer,
  goals: goalsReducer,
  splits: splitsReducer,
  notes: notesReducer,
  settings: settingsReducer,
  [lifesyncApi.reducerPath]: lifesyncApi.reducer,
})

const emptyIncomeState: IncomeState = {
  incomes: [],
  totalReceived: 0,
  totalScheduled: 0,
  loading: false,
  error: null,
}

const normalizeIncomeState = (raw: unknown): IncomeState => {
  if (!raw || typeof raw !== 'object') {
    return { ...emptyIncomeState }
  }

  const candidate = raw as Partial<IncomeState>
  const incomes = Array.isArray(candidate.incomes) ? (candidate.incomes as Income[]) : []

  const sanitizedIncomes = incomes.map(income => ({
    ...income,
    linkedGoalIds: income.linkedGoalIds ?? [],
  }))

  const totals = sanitizedIncomes.reduce(
    (acc, income) => {
      if (income.status === 'received') {
        acc.totalReceived += income.amount
      }
      if (income.status === 'scheduled') {
        acc.totalScheduled += income.amount
      }
      return acc
    },
    { totalReceived: 0, totalScheduled: 0 }
  )

  return {
    incomes: sanitizedIncomes,
    totalReceived: totals.totalReceived,
    totalScheduled: totals.totalScheduled,
    loading: typeof candidate.loading === 'boolean' ? candidate.loading : false,
    error: typeof candidate.error === 'string' ? candidate.error : null,
  }
}

const defaultGoalsState: GoalsState = {
  goals: [],
  loading: false,
  error: null,
}

const ensureGoalIntents = (raw: unknown): GoalsState => {
  if (!raw || typeof raw !== 'object') {
    return { ...defaultGoalsState }
  }

  const candidate = raw as Partial<GoalsState>
  const goalsArray = Array.isArray(candidate.goals) ? (candidate.goals as Goal[]) : []

  const goalsWithIntent = goalsArray.map((goal: Goal) => ({
    ...goal,
    intent: goal.intent ?? 'future-expense',
    linkedIncomeIds: goal.linkedIncomeIds ?? [],
  }))

  return {
    goals: goalsWithIntent,
    loading: typeof candidate.loading === 'boolean' ? candidate.loading : false,
    error: typeof candidate.error === 'string' ? candidate.error : null,
  }
}

const migrateState = async (state: PersistedState): Promise<PersistedState> => {
  if (!state) {
    return state
  }

  const persistedRecord = state as Record<string, unknown>
  const incomeSliceState = normalizeIncomeState(persistedRecord['income'])
  const goalsSliceState = ensureGoalIntents(persistedRecord['goals'])

  const baseState = state as PersistedState & Record<string, unknown>

  return {
    ...baseState,
    income: incomeSliceState,
    goals: goalsSliceState,
  } as PersistedState
}

const persistConfig = {
  key: 'lifesync',
  storage,
  version: 1,
  whitelist: ['expenses', 'income', 'todos', 'goals', 'splits', 'notes', 'settings'], // Only persist these slices, not API cache
  migrate: migrateState,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(lifesyncApi.middleware),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch