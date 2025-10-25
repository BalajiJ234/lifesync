import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

// Import slices
import expensesReducer from './slices/expensesSlice'
import incomeReducer from './slices/incomeSlice'
import todosReducer from './slices/todosSlice'
import goalsReducer from './slices/goalsSlice'
import splitsReducer from './slices/splitsSlice'
import notesReducer from './slices/notesSlice'
import settingsReducer from './slices/settingsSlice'
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

const persistConfig = {
  key: 'lifesync',
  storage,
  whitelist: ['expenses', 'income', 'todos', 'goals', 'splits', 'notes', 'settings'], // Only persist these slices, not API cache
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