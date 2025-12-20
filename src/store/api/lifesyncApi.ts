import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Expense } from "../slices/expensesSlice";
import type { Goal } from "../slices/goalsSlice";
import type { Split } from "../slices/splitsSlice";
import type {
  MonthlyBudgetPlan,
  BudgetInsight,
  IncomeSource,
  Debt,
  BudgetGoal,
  BudgetRuleSet,
} from "../slices/budgetSlice";

// Define API base URL - will be configurable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// Budget API types
interface CreateBudgetPlanRequest {
  userId: string;
  month: string;
  baseCurrency: string;
  homeCountry: string;
  incomes: IncomeSource[];
  debts: Debt[];
  goals: BudgetGoal[];
  rules: BudgetRuleSet;
}

interface LogTransactionRequest {
  userId: string;
  month: string;
  baseCurrency: string;
  bucket: "NEEDS" | "WANTS" | "SAVINGS" | "DEBT";
  category: string;
  amount: number;
  currency: string;
  description?: string;
}

interface TransactionResponse {
  updatedPlan: MonthlyBudgetPlan;
  insights: BudgetInsight[];
}

interface FxRatesResponse {
  base: string;
  rates: Record<string, number>;
  timestamp: string;
}

// Define API endpoints and data structures
export const lifesyncApi = createApi({
  reducerPath: "lifesyncApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      // Add auth headers when user authentication is implemented
      // const token = (getState() as RootState).auth?.token
      // if (token) {
      //   headers.set('authorization', `Bearer ${token}`)
      // }
      headers.set("content-type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Expense", "Goal", "Split", "User", "Budget", "FxRates"],
  endpoints: (builder) => ({
    // Expenses API
    getExpenses: builder.query<Expense[], void>({
      query: () => "/expenses",
      providesTags: ["Expense"],
    }),
    addExpense: builder.mutation<Expense, Partial<Expense>>({
      query: (expense) => ({
        url: "/expenses",
        method: "POST",
        body: expense,
      }),
      invalidatesTags: ["Expense"],
    }),
    updateExpense: builder.mutation<
      Expense,
      { id: string; updates: Partial<Expense> }
    >({
      query: ({ id, updates }) => ({
        url: `/expenses/${id}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: ["Expense"],
    }),
    deleteExpense: builder.mutation<void, string>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expense"],
    }),

    // Goals API
    getGoals: builder.query<Goal[], void>({
      query: () => "/goals",
      providesTags: ["Goal"],
    }),
    addGoal: builder.mutation<Goal, Partial<Goal>>({
      query: (goal) => ({
        url: "/goals",
        method: "POST",
        body: goal,
      }),
      invalidatesTags: ["Goal"],
    }),
    updateGoal: builder.mutation<Goal, { id: string; updates: Partial<Goal> }>({
      query: ({ id, updates }) => ({
        url: `/goals/${id}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: ["Goal"],
    }),
    deleteGoal: builder.mutation<void, string>({
      query: (id) => ({
        url: `/goals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Goal"],
    }),

    // Splits API
    getSplits: builder.query<Split[], void>({
      query: () => "/splits",
      providesTags: ["Split"],
    }),
    addSplit: builder.mutation<Split, Partial<Split>>({
      query: (split) => ({
        url: "/splits",
        method: "POST",
        body: split,
      }),
      invalidatesTags: ["Split"],
    }),
    updateSplit: builder.mutation<
      Split,
      { id: string; updates: Partial<Split> }
    >({
      query: ({ id, updates }) => ({
        url: `/splits/${id}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: ["Split"],
    }),
    deleteSplit: builder.mutation<void, string>({
      query: (id) => ({
        url: `/splits/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Split"],
    }),

    // AI-powered endpoints
    categorizeExpense: builder.mutation<
      { category: string; confidence: number },
      { description: string; amount: number }
    >({
      query: (expense) => ({
        url: "/ai/categorize",
        method: "POST",
        body: expense,
      }),
    }),

    analyzeGoal: builder.mutation<
      { feasibility: string; suggestions: string[]; monthlyRequired: number },
      { goal: Partial<Goal>; expenses: Expense[] }
    >({
      query: (data) => ({
        url: "/ai/analyze-goal",
        method: "POST",
        body: data,
      }),
    }),

    // Sync endpoints for offline support
    syncData: builder.mutation<
      void,
      {
        expenses?: Expense[];
        goals?: Goal[];
        splits?: Split[];
      }
    >({
      query: (data) => ({
        url: "/sync",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Expense", "Goal", "Split"],
    }),

    // ==================== Budget Engine API ====================

    // Create or regenerate a budget plan
    createBudgetPlan: builder.mutation<
      MonthlyBudgetPlan,
      CreateBudgetPlanRequest
    >({
      query: (data) => ({
        url: "/wealth/budget/plan",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Budget"],
    }),

    // Get budget plan for a specific month
    getBudgetPlan: builder.query<
      MonthlyBudgetPlan,
      { userId: string; month: string }
    >({
      query: ({ userId, month }) => `/wealth/budget/${month}?userId=${userId}`,
      providesTags: (result, error, { month }) => [
        { type: "Budget", id: month },
      ],
    }),

    // Log a transaction against a budget plan
    logTransaction: builder.mutation<
      TransactionResponse,
      LogTransactionRequest
    >({
      query: (data) => ({
        url: "/wealth/budget/transactions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { month }) => [
        { type: "Budget", id: month },
      ],
    }),

    // Get insights for a specific month
    getBudgetInsights: builder.query<
      BudgetInsight[],
      { userId: string; month: string }
    >({
      query: ({ userId, month }) =>
        `/wealth/budget/insights/${month}?userId=${userId}`,
      providesTags: ["Budget"],
    }),

    // Get current FX rates
    getFxRates: builder.query<FxRatesResponse, { base: string }>({
      query: ({ base }) => `/wealth/budget/fx-rates?base=${base}`,
      providesTags: ["FxRates"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Expenses
  useGetExpensesQuery,
  useAddExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,

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

  // AI
  useCategorizeExpenseMutation,
  useAnalyzeGoalMutation,

  // Sync
  useSyncDataMutation,

  // Budget Engine
  useCreateBudgetPlanMutation,
  useGetBudgetPlanQuery,
  useLogTransactionMutation,
  useGetBudgetInsightsQuery,
  useGetFxRatesQuery,
} = lifesyncApi;
