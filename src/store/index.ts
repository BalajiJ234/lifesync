import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

// Import slices
import expensesReducer from './slices/expensesSlice'
import todosReducer from './slices/todosSlice'
import goalsReducer from './slices/goalsSlice'
import splitsReducer from './slices/splitsSlice'
import notesReducer from './slices/notesSlice'
import settingsReducer from './slices/settingsSlice'

const rootReducer = combineReducers({
  expenses: expensesReducer,
  todos: todosReducer,
  goals: goalsReducer,
  splits: splitsReducer,
  notes: notesReducer,
  settings: settingsReducer,
})

const persistConfig = {
  key: 'lifesync',
  storage,
  whitelist: ['expenses', 'todos', 'goals', 'splits', 'notes', 'settings'], // Only persist these slices
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch