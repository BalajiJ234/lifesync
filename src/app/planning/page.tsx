"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  Plane,
  Home,
  Car,
  GraduationCap,
  Heart,
  Shield,
  Plus,
  Edit3,
  Trash2,
  Sparkles,
  Calculator,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addGoal,
  updateGoal,
  deleteGoal as removeGoal,
  type Goal as ReduxGoal,
} from "@/store/slices/goalsSlice";
import {
  setSelectedMonth,
  createLocalBudgetPlan,
  logLocalTransaction,
  BucketType,
} from "@/store/slices/budgetSlice";
import { selectIncomes } from "@/store/slices/incomeSlice";
import { addExpense, type Expense } from "@/store/slices/expensesSlice";
import type { RootState } from "@/store/index";
import { formatAmount, getCurrencyByCode } from "@/utils/currency";
import ResponsiveModal, { useMobileModal } from "@/components/ui/MobileModal";
import BudgetBucketCard from "@/components/budget/BudgetBucketCard";
import TransactionForm from "@/components/budget/TransactionForm";
import BudgetInsightsPanel from "@/components/budget/BudgetInsightsPanel";

type GoalCategory =
  | "emergency-fund"
  | "debt-reduction"
  | "travel"
  | "purchase"
  | "investment"
  | "education"
  | "health"
  | "other";

const goalCategories = [
  {
    value: "travel",
    name: "Vacation & Travel",
    icon: Plane,
    color: "bg-blue-100 text-blue-800",
    description: "Travel and vacation expenses",
  },
  {
    value: "emergency-fund",
    name: "Emergency Fund",
    icon: Shield,
    color: "bg-red-100 text-red-800",
    description: "3-6 months of expenses",
  },
  {
    value: "purchase",
    name: "Home & Property",
    icon: Home,
    color: "bg-green-100 text-green-800",
    description: "House down payment, furniture",
  },
  {
    value: "vehicle",
    name: "Vehicle",
    icon: Car,
    color: "bg-gray-100 text-gray-800",
    description: "Car purchase or maintenance",
  },
  {
    value: "education",
    name: "Education",
    icon: GraduationCap,
    color: "bg-purple-100 text-purple-800",
    description: "Courses, degrees, certifications",
  },
  {
    value: "health",
    name: "Health & Wellness",
    icon: Heart,
    color: "bg-pink-100 text-pink-800",
    description: "Medical, fitness, wellness",
  },
  {
    value: "investment",
    name: "Investment",
    icon: TrendingUp,
    color: "bg-yellow-100 text-yellow-800",
    description: "Stocks, bonds, business",
  },
  {
    value: "other",
    name: "Other",
    icon: Target,
    color: "bg-indigo-100 text-indigo-800",
    description: "Custom financial goals",
  },
] as const;

type ActiveTab = "budget" | "goals";

export default function BudgetGoalsPage() {
  const dispatch = useAppDispatch();
  const goals = useAppSelector((state: RootState) => state.goals?.goals || []);
  const expenses = useAppSelector(
    (state: RootState) => state.expenses?.expenses || []
  );
  const { selectedMonth, currentPlan, allPlans, insights, loading } =
    useAppSelector((state) => state.budget);
  const { settings } = useAppSelector((state) => state.settings);
  const incomeEntries = useAppSelector(selectIncomes);
  const [isClient, setIsClient] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>("budget");

  // Goal modal states
  const addGoalModal = useMobileModal();
  const editGoalModal = useMobileModal();
  const [editingGoal, setEditingGoal] = useState<ReduxGoal | null>(null);
  const [aiAnalysisModal, setAiAnalysisModal] = useState<ReduxGoal | null>(
    null
  );

  // Budget states
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<BucketType>("NEEDS");
  const [isCreating, setIsCreating] = useState(false);

  // Get currency from settings
  const baseCurrency = settings?.currency || "USD";
  const currency = getCurrencyByCode(baseCurrency);

  useEffect(() => {
    setIsClient(true);
    document.title = "Budget & Goals - WealthPulse";
  }, []);

  // Calculate total monthly income from income entries for the SELECTED month
  const totalMonthlyIncome = useMemo(() => {
    const [selectedYear, selectedMonthNum] = selectedMonth
      .split("-")
      .map(Number);

    return incomeEntries
      .filter((income) => {
        const incomeDate = new Date(income.eventDate);
        return (
          incomeDate.getMonth() === selectedMonthNum - 1 &&
          incomeDate.getFullYear() === selectedYear
        );
      })
      .reduce((sum, income) => sum + income.amount, 0);
  }, [incomeEntries, selectedMonth]);

  // Find plan for selected month from allPlans
  const activePlan = useMemo(() => {
    return allPlans.find((p) => p.month === selectedMonth) || currentPlan;
  }, [allPlans, selectedMonth, currentPlan]);

  // Calculate month navigation
  const { prevMonth, nextMonth, displayMonth } = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const current = new Date(year, month - 1);

    const prev = new Date(year, month - 2);
    const next = new Date(year, month);

    return {
      prevMonth: `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(
        2,
        "0"
      )}`,
      nextMonth: `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(
        2,
        "0"
      )}`,
      displayMonth: current.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    };
  }, [selectedMonth]);

  // Goal helpers
  const getGoalProgress = (goal: ReduxGoal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    return Math.min(progress, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const targetDate = new Date(deadline);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate overall goal stats
  const goalStats = useMemo(() => {
    if (goals.length === 0)
      return { total: 0, saved: 0, avgProgress: 0, activeCount: 0 };

    const total = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const saved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const avgProgress =
      goals.reduce((sum, g) => sum + getGoalProgress(g), 0) / goals.length;
    const activeCount = goals.filter(
      (g) => g.currentAmount < g.targetAmount
    ).length;

    return { total, saved, avgProgress, activeCount };
  }, [goals]);

  // Budget handlers
  const handleCreatePlan = () => {
    setIsCreating(true);

    const incomeToUse = totalMonthlyIncome > 0 ? totalMonthlyIncome : 5000;

    dispatch(
      createLocalBudgetPlan({
        month: selectedMonth,
        baseCurrency,
        totalIncome: incomeToUse,
      })
    );

    setIsCreating(false);
  };

  const handleLogTransaction = (transaction: {
    bucket: BucketType;
    category: string;
    amount: number;
    currency: string;
    description?: string;
  }) => {
    dispatch(logLocalTransaction(transaction));

    if (transaction.bucket === "NEEDS" || transaction.bucket === "WANTS") {
      const newExpense = {
        id: `budget-${Date.now()}`,
        amount: transaction.amount,
        description: transaction.description || transaction.category,
        category: transaction.category,
        date: new Date().toISOString(),
        currency: transaction.currency,
        isRecurring: false,
        source: "budget" as const,
      };
      dispatch(addExpense(newExpense));
    }

    setShowTransactionForm(false);
  };

  // Goal handlers
  const handleAddGoal = (goalData: Partial<ReduxGoal>) => {
    const newGoal: ReduxGoal = {
      id: Date.now().toString(),
      title: goalData.title || "",
      description: goalData.description,
      category: goalData.category || "travel",
      targetAmount: goalData.targetAmount || 0,
      currentAmount: 0,
      currency: goalData.currency || baseCurrency,
      targetDate: goalData.targetDate,
      priority: goalData.priority || "medium",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch(addGoal(newGoal));
    addGoalModal.closeModal();
  };

  const handleEditGoal = (goalData: Partial<ReduxGoal>) => {
    if (editingGoal) {
      dispatch(
        updateGoal({
          id: editingGoal.id,
          updates: goalData,
        })
      );
      setEditingGoal(null);
      editGoalModal.closeModal();
    }
  };

  const deleteGoal = (goalId: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      dispatch(removeGoal(goalId));
    }
  };

  const updateGoalProgress = (goalId: string, amount: number) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      dispatch(
        updateGoal({
          id: goalId,
          updates: {
            currentAmount: Math.max(0, Math.min(goal.targetAmount, amount)),
          },
        })
      );
    }
  };

  const startEditGoal = (goal: ReduxGoal) => {
    setEditingGoal(goal);
    editGoalModal.openModal();
  };

  // AI-powered goal analysis
  const analyzeGoalWithAI = async (goal: ReduxGoal) => {
    const monthlyExpenses = expenses.reduce(
      (total: number, expense: Expense) => {
        const expenseDate = new Date(expense.date);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        if (expenseDate >= lastMonth) {
          return total + expense.amount;
        }
        return total;
      },
      0
    );

    const averageMonthlyExpense = monthlyExpenses || 2000;
    const daysRemaining = getDaysRemaining(goal.targetDate || "");
    const monthsRemaining = daysRemaining / 30;
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    const monthlyTarget =
      monthsRemaining > 0 ? remainingAmount / monthsRemaining : remainingAmount;

    let feasibility: "easy" | "moderate" | "challenging" = "moderate";
    const targetPercentage = (monthlyTarget / averageMonthlyExpense) * 100;

    if (targetPercentage < 10) feasibility = "easy";
    else if (targetPercentage > 25) feasibility = "challenging";

    let recommendation = "";
    if (feasibility === "easy") {
      recommendation = `Great! You can easily reach this goal by saving ${formatAmount(
        monthlyTarget,
        getCurrencyByCode(goal.currency)
      )} per month.`;
    } else if (feasibility === "challenging") {
      recommendation = `This goal is ambitious! Consider extending the deadline or reducing expenses to free up ${formatAmount(
        monthlyTarget,
        getCurrencyByCode(goal.currency)
      )}/month.`;
    } else {
      recommendation = `This goal is achievable with discipline. Save ${formatAmount(
        monthlyTarget,
        getCurrencyByCode(goal.currency)
      )} monthly.`;
    }

    const aiInsights = {
      feasibility,
      suggestions: [recommendation],
      monthlyRequired: monthlyTarget,
      timeframe: `${Math.ceil(monthsRemaining)} months`,
      confidence: expenses.length > 0 ? 0.85 : 0.6,
    };

    dispatch(
      updateGoal({
        id: goal.id,
        updates: { aiAnalysis: aiInsights },
      })
    );
    setAiAnalysisModal({ ...goal, aiAnalysis: aiInsights });
  };

  if (!isClient) {
    return <div className='container mx-auto px-4 py-8'>Loading...</div>;
  }

  return (
    <div className='container mx-auto px-4 py-4 md:py-8 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
            <PiggyBank className='text-blue-600' size={32} />
            Budget & Goals
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Plan your budget and track savings goals
          </p>
        </div>
        <button
          onClick={
            activeTab === "budget" ? handleCreatePlan : addGoalModal.openModal
          }
          disabled={activeTab === "budget" && isCreating}
          className='flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'>
          <Plus size={20} />
          <span>
            {activeTab === "budget" ? "Create Budget Plan" : "Add Goal"}
          </span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 md:p-6 rounded-lg shadow-md'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-blue-100 text-xs md:text-sm'>Monthly Income</p>
              <p className='text-xl md:text-2xl font-bold mt-1'>
                {formatAmount(totalMonthlyIncome, currency)}
              </p>
            </div>
            <DollarSign size={28} className='text-blue-200' />
          </div>
        </div>

        <div className='bg-gradient-to-br from-green-500 to-green-600 text-white p-4 md:p-6 rounded-lg shadow-md'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-green-100 text-xs md:text-sm'>Goals Saved</p>
              <p className='text-xl md:text-2xl font-bold mt-1'>
                {formatAmount(goalStats.saved, currency)}
              </p>
            </div>
            <Target size={28} className='text-green-200' />
          </div>
        </div>

        <div className='bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 md:p-6 rounded-lg shadow-md'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-purple-100 text-xs md:text-sm'>Avg Progress</p>
              <p className='text-xl md:text-2xl font-bold mt-1'>
                {goalStats.avgProgress.toFixed(0)}%
              </p>
            </div>
            <TrendingUp size={28} className='text-purple-200' />
          </div>
        </div>

        <div className='bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 md:p-6 rounded-lg shadow-md'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-orange-100 text-xs md:text-sm'>Active Goals</p>
              <p className='text-xl md:text-2xl font-bold mt-1'>
                {goalStats.activeCount}
              </p>
            </div>
            <Sparkles size={28} className='text-orange-200' />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex border-b border-gray-200 dark:border-gray-700'>
        <button
          onClick={() => setActiveTab("budget")}
          className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "budget"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}>
          <Calculator size={20} />
          Budget Planner
        </button>
        <button
          onClick={() => setActiveTab("goals")}
          className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "goals"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}>
          <Target size={20} />
          Savings Goals ({goals.length})
        </button>
      </div>

      {/* Budget Tab Content */}
      {activeTab === "budget" && (
        <div className='space-y-6'>
          {/* Month Navigation */}
          <div className='flex items-center justify-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm'>
            <button
              onClick={() => dispatch(setSelectedMonth(prevMonth))}
              className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full'>
              <ChevronLeft size={20} />
            </button>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white min-w-[200px] text-center'>
              {displayMonth}
            </h2>
            <button
              onClick={() => dispatch(setSelectedMonth(nextMonth))}
              className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full'>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Budget Content */}
          {!activePlan ? (
            <div className='text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm'>
              <Calculator size={64} className='mx-auto text-gray-300 mb-4' />
              <h3 className='text-xl font-medium text-gray-900 dark:text-white mb-2'>
                No Budget Plan for {displayMonth}
              </h3>
              <p className='text-gray-600 dark:text-gray-400 mb-2'>
                Monthly Income: {formatAmount(totalMonthlyIncome, currency)}
              </p>
              <p className='text-gray-600 dark:text-gray-400 mb-6'>
                Create a budget plan using the 50/30/20 rule to manage your
                spending.
              </p>
              <button
                onClick={handleCreatePlan}
                disabled={isCreating}
                className='inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'>
                <Plus size={20} />
                <span>Create Budget Plan</span>
              </button>
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Budget Overview */}
              <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                  Budget Overview
                </h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div className='text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Total Income
                    </p>
                    <p className='text-xl font-bold text-blue-600'>
                      {formatAmount(activePlan.totalIncome.amount, currency)}
                    </p>
                  </div>
                  <div className='text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg'>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Needs (50%)
                    </p>
                    <p className='text-xl font-bold text-green-600'>
                      {formatAmount(
                        activePlan.buckets.NEEDS.planned.amount,
                        currency
                      )}
                    </p>
                  </div>
                  <div className='text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg'>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Wants (30%)
                    </p>
                    <p className='text-xl font-bold text-yellow-600'>
                      {formatAmount(
                        activePlan.buckets.WANTS.planned.amount,
                        currency
                      )}
                    </p>
                  </div>
                  <div className='text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Savings (15%)
                    </p>
                    <p className='text-xl font-bold text-purple-600'>
                      {formatAmount(
                        activePlan.buckets.SAVINGS.planned.amount,
                        currency
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget Buckets */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {Object.values(activePlan.buckets).map((bucket) => (
                  <BudgetBucketCard
                    key={bucket.type}
                    bucket={bucket}
                    onClick={() => {
                      setSelectedBucket(bucket.type as BucketType);
                      setShowTransactionForm(true);
                    }}
                  />
                ))}
              </div>

              {/* Insights Panel */}
              <BudgetInsightsPanel insights={insights} />
            </div>
          )}

          {/* Transaction Form Modal */}
          {showTransactionForm && (
            <TransactionForm
              bucket={selectedBucket}
              plan={activePlan}
              onSubmit={handleLogTransaction}
              onClose={() => setShowTransactionForm(false)}
              isLoading={loading}
            />
          )}
        </div>
      )}

      {/* Goals Tab Content */}
      {activeTab === "goals" && (
        <div className='space-y-6'>
          {goals.length === 0 ? (
            <div className='text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm'>
              <Target size={64} className='mx-auto text-gray-300 mb-4' />
              <h3 className='text-xl font-medium text-gray-900 dark:text-white mb-2'>
                No Goals Yet
              </h3>
              <p className='text-gray-600 dark:text-gray-400 mb-6'>
                Start tracking your financial goals with AI-powered insights!
              </p>
              <button
                onClick={addGoalModal.openModal}
                className='inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'>
                <Plus size={20} />
                <span>Create Your First Goal</span>
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {(goals as ReduxGoal[]).map((goal: ReduxGoal) => {
                const category = goalCategories.find(
                  (c) => c.value === goal.category
                );
                const progress = getGoalProgress(goal);
                const daysRemaining = getDaysRemaining(goal.targetDate || "");
                const Icon = category?.icon || Target;

                return (
                  <div
                    key={goal.id}
                    className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow'>
                    {/* Goal Header */}
                    <div className='p-6 pb-4'>
                      <div className='flex items-start justify-between mb-4'>
                        <div className='flex items-center space-x-3'>
                          <div
                            className={`p-2 rounded-lg ${
                              category?.color || "bg-gray-100 text-gray-800"
                            }`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <h3 className='font-semibold text-gray-900 dark:text-white'>
                              {goal.title}
                            </h3>
                            <p className='text-sm text-gray-600 dark:text-gray-400'>
                              {category?.name}
                            </p>
                          </div>
                        </div>
                        <div className='flex space-x-1'>
                          <button
                            onClick={() => startEditGoal(goal)}
                            className='p-1 text-gray-400 hover:text-blue-600'>
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className='p-1 text-gray-400 hover:text-red-600'>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className='space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600 dark:text-gray-400'>
                            Progress
                          </span>
                          <span className='font-medium text-gray-900 dark:text-white'>
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                        <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                          <div
                            className='bg-green-600 h-2 rounded-full transition-all duration-300'
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-green-600 font-medium'>
                            {formatAmount(
                              goal.currentAmount,
                              getCurrencyByCode(goal.currency)
                            )}
                          </span>
                          <span className='text-gray-600 dark:text-gray-400'>
                            of{" "}
                            {formatAmount(
                              goal.targetAmount,
                              getCurrencyByCode(goal.currency)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Goal Footer */}
                    <div className='px-6 pb-6 space-y-3'>
                      {/* Days Remaining */}
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-gray-600 dark:text-gray-400 flex items-center gap-1'>
                          <Calendar size={14} />
                          {daysRemaining > 0
                            ? `${daysRemaining} days left`
                            : "Overdue"}
                        </span>
                        {goal.aiAnalysis && (
                          <span className='flex items-center gap-1 text-purple-600 text-xs'>
                            <Sparkles size={12} />
                            AI Optimized
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className='flex gap-2'>
                        <button
                          onClick={() => {
                            const newAmount = prompt(
                              "Enter new saved amount:",
                              goal.currentAmount.toString()
                            );
                            if (newAmount)
                              updateGoalProgress(
                                goal.id,
                                parseFloat(newAmount)
                              );
                          }}
                          className='flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'>
                          Update Progress
                        </button>
                        <button
                          onClick={() => analyzeGoalWithAI(goal)}
                          className='px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'>
                          <Sparkles size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Goal Modal */}
      <ResponsiveModal
        isOpen={addGoalModal.isOpen}
        onClose={addGoalModal.closeModal}
        title='Create New Goal'>
        <GoalForm
          onSubmit={handleAddGoal}
          onCancel={addGoalModal.closeModal}
          currency={baseCurrency}
        />
      </ResponsiveModal>

      {/* Edit Goal Modal */}
      <ResponsiveModal
        isOpen={editGoalModal.isOpen}
        onClose={editGoalModal.closeModal}
        title='Edit Goal'>
        {editingGoal && (
          <GoalForm
            onSubmit={handleEditGoal}
            onCancel={editGoalModal.closeModal}
            currency={baseCurrency}
            initialData={editingGoal}
          />
        )}
      </ResponsiveModal>

      {/* AI Analysis Modal */}
      {aiAnalysisModal && (
        <ResponsiveModal
          isOpen={!!aiAnalysisModal}
          onClose={() => setAiAnalysisModal(null)}
          title='AI Goal Analysis'>
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Sparkles className='text-purple-600' size={24} />
              <h3 className='text-lg font-semibold'>{aiAnalysisModal.title}</h3>
            </div>

            {aiAnalysisModal.aiAnalysis && (
              <>
                <div
                  className={`p-4 rounded-lg ${
                    aiAnalysisModal.aiAnalysis.feasibility === "easy"
                      ? "bg-green-100 text-green-800"
                      : aiAnalysisModal.aiAnalysis.feasibility === "challenging"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                  <p className='font-medium'>
                    Feasibility:{" "}
                    {aiAnalysisModal.aiAnalysis.feasibility
                      .charAt(0)
                      .toUpperCase() +
                      aiAnalysisModal.aiAnalysis.feasibility.slice(1)}
                  </p>
                  <p className='text-sm mt-1'>
                    Timeframe: {aiAnalysisModal.aiAnalysis.timeframe}
                  </p>
                  <p className='text-sm'>
                    Monthly Required:{" "}
                    {formatAmount(
                      aiAnalysisModal.aiAnalysis.monthlyRequired,
                      getCurrencyByCode(aiAnalysisModal.currency)
                    )}
                  </p>
                </div>

                <div className='space-y-2'>
                  <h4 className='font-medium text-gray-900 dark:text-white'>
                    Recommendations:
                  </h4>
                  <ul className='list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400'>
                    {aiAnalysisModal.aiAnalysis.suggestions.map(
                      (suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      )
                    )}
                  </ul>
                </div>

                <p className='text-sm text-gray-500'>
                  Confidence:{" "}
                  {(aiAnalysisModal.aiAnalysis.confidence * 100).toFixed(0)}%
                </p>
              </>
            )}

            <button
              onClick={() => setAiAnalysisModal(null)}
              className='w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'>
              Close
            </button>
          </div>
        </ResponsiveModal>
      )}
    </div>
  );
}

// Goal Form Component
interface GoalFormProps {
  onSubmit: (data: Partial<ReduxGoal>) => void;
  onCancel: () => void;
  currency: string;
  initialData?: ReduxGoal;
}

function GoalForm({
  onSubmit,
  onCancel,
  currency,
  initialData,
}: GoalFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "travel",
    targetAmount: initialData?.targetAmount || 0,
    currentAmount: initialData?.currentAmount || 0,
    currency: initialData?.currency || currency,
    targetDate: initialData?.targetDate || "",
    priority: initialData?.priority || "medium",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
          Goal Title
        </label>
        <input
          type='text'
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder='e.g., Vacation to Japan'
          className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
          required
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({
              ...formData,
              category: e.target.value as GoalCategory,
            })
          }
          className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'>
          {goalCategories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Target Amount
          </label>
          <input
            type='number'
            step='0.01'
            min='0'
            value={formData.targetAmount}
            onChange={(e) =>
              setFormData({
                ...formData,
                targetAmount: parseFloat(e.target.value) || 0,
              })
            }
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
            required
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Current Amount
          </label>
          <input
            type='number'
            step='0.01'
            min='0'
            value={formData.currentAmount}
            onChange={(e) =>
              setFormData({
                ...formData,
                currentAmount: parseFloat(e.target.value) || 0,
              })
            }
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
          />
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Target Date
          </label>
          <input
            type='date'
            value={formData.targetDate}
            onChange={(e) =>
              setFormData({ ...formData, targetDate: e.target.value })
            }
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData({
                ...formData,
                priority: e.target.value as "low" | "medium" | "high",
              })
            }
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'>
            <option value='low'>Low</option>
            <option value='medium'>Medium</option>
            <option value='high'>High</option>
          </select>
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
          Description (optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={2}
          className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
        />
      </div>

      <div className='flex gap-3 pt-4'>
        <button
          type='button'
          onClick={onCancel}
          className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700'>
          Cancel
        </button>
        <button
          type='submit'
          className='flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700'>
          Save Goal
        </button>
      </div>
    </form>
  );
}
