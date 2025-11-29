import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";

// Import slices
import expensesReducer from "./slices/expensesSlice";
import goalsReducer from "./slices/goalsSlice";
import splitsReducer from "./slices/splitsSlice";
import settingsReducer from "./slices/settingsSlice";
import incomeReducer from "./slices/incomeSlice";
import advisorReducer from "./slices/advisorSlice";
import recurringPatternsReducer from "./slices/recurringPatternsSlice";
import { lifesyncApi } from "./api/lifesyncApi";

const rootReducer = combineReducers({
  expenses: expensesReducer,
  goals: goalsReducer,
  splits: splitsReducer,
  settings: settingsReducer,
  income: incomeReducer,
  advisor: advisorReducer,
  recurringPatterns: recurringPatternsReducer,
  [lifesyncApi.reducerPath]: lifesyncApi.reducer,
});

const persistConfig = {
  key: "lifesync",
  storage,
  whitelist: [
    "expenses",
    "goals",
    "splits",
    "settings",
    "income",
    "advisor",
    "recurringPatterns",
  ], // Only persist these slices, not API cache
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(lifesyncApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
