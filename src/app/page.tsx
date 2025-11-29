"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { AIInsights } from "@/components/ai/AIIntegration";
import { DailyBudgetWidget } from "@/components/DailyBudgetWidget";
import { FamilyRemittanceWidget } from "@/components/FamilyRemittanceWidget";
import { QuickInsightsWidget } from "@/components/QuickInsightsWidget";
import ExchangeRateWidget from "@/components/ExchangeRateWidget";
import { selectExpenses } from "@/store/slices/expensesSlice";
import { selectIncomes } from "@/store/slices/incomeSlice";
import { selectGoals } from "@/store/slices/goalsSlice";
import {
  DollarSign,
  Users,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Target,
  Activity,
  Lightbulb,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from "lucide-react";

// Data interfaces
interface ActivityItem {
  type: string;
  desc: string;
  time: string;
  amount?: string;
  isPositive?: boolean;
}

const useFinanceData = () => {
  const expenses = useAppSelector(selectExpenses);
  const incomes = useAppSelector(selectIncomes);
  const goals = useAppSelector(selectGoals);
  const friends = useAppSelector((state) => state.splits.friends);
  const bills = useAppSelector((state) => state.splits.bills);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate real statistics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  const thisMonthIncome = incomes.filter((income) => {
    const incomeDate = new Date(income.eventDate);
    return (
      incomeDate.getMonth() === currentMonth &&
      incomeDate.getFullYear() === currentYear
    );
  });

  const thisMonthExpenseTotal = thisMonthExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const thisMonthIncomeTotal = thisMonthIncome.reduce(
    (sum, income) => sum + income.amount,
    0
  );
  const netSavings = thisMonthIncomeTotal - thisMonthExpenseTotal;

  const pendingBills = bills.filter((bill) => bill.status !== "settled");
  const pendingAmount = pendingBills.reduce(
    (sum, bill) => sum + bill.totalAmount,
    0
  );

  const activeGoals = goals.filter(
    (goal) => goal.currentAmount < goal.targetAmount
  );
  const totalGoalProgress =
    goals.length > 0
      ? (goals.reduce(
          (sum, goal) => sum + goal.currentAmount / goal.targetAmount,
          0
        ) /
          goals.length) *
        100
      : 0;

  // Generate recent activity from real data
  const generateRecentActivity = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    // Add recent expenses
    expenses.slice(0, 3).forEach((expense) => {
      activities.push({
        type: "expense",
        desc: expense.description,
        time: formatTimeAgo(expense.createdAt),
        amount: `$${expense.amount.toFixed(2)}`,
        isPositive: false,
      });
    });

    // Add recent income
    incomes.slice(0, 2).forEach((income) => {
      activities.push({
        type: "income",
        desc: income.source,
        time: formatTimeAgo(income.createdAt),
        amount: `$${income.amount.toFixed(2)}`,
        isPositive: true,
      });
    });

    // Add recent splits
    bills.slice(0, 1).forEach((bill) => {
      activities.push({
        type: "split",
        desc: `Split: ${bill.description || bill.id}`,
        time: formatTimeAgo(bill.createdAt),
        amount: `$${bill.totalAmount.toFixed(2)}`,
        isPositive: false,
      });
    });

    return activities.slice(0, 5);
  };

  const formatTimeAgo = (date: Date | string) => {
    if (!isClient) return "Recently";
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return "Just now";
  };

  return {
    expenses: {
      thisMonth: isClient ? thisMonthExpenseTotal : 0,
      count: isClient ? expenses.length : 0,
    },
    income: {
      thisMonth: isClient ? thisMonthIncomeTotal : 0,
      count: isClient ? incomes.length : 0,
    },
    netSavings: isClient ? netSavings : 0,
    goals: {
      active: isClient ? activeGoals.length : 0,
      total: isClient ? goals.length : 0,
      avgProgress: isClient ? totalGoalProgress : 0,
    },
    splits: {
      pending: isClient ? pendingAmount : 0,
      friends: isClient ? friends.length : 0,
    },
    recentActivity: isClient ? generateRecentActivity() : [],
    isClient,
  };
};

export default function Home() {
  const data = useFinanceData();

  const getActivityIcon = (type: string, isPositive?: boolean) => {
    if (isPositive)
      return <ArrowUpRight size={16} className='text-green-600' />;
    if (type === "expense")
      return <ArrowDownRight size={16} className='text-red-600' />;
    if (type === "split")
      return <Users size={16} className='text-purple-600' />;
    return <Activity size={16} className='text-gray-600' />;
  };

  return (
    <div className='space-y-8'>
      {/* Welcome Header */}
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>
          Welcome to WealthPulse
        </h1>
        <p className='text-xl text-gray-600'>
          Your AI-powered personal finance advisor
        </p>
        <div className='mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500'>
          <div className='flex items-center space-x-1'>
            <Calendar size={16} />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className='flex items-center space-x-1'>
            <Clock size={16} />
            <span>
              {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Advisor Widgets */}
      <DailyBudgetWidget />
      <FamilyRemittanceWidget />

      {/* Exchange Rates & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickInsightsWidget />
        </div>
        <div className="lg:col-span-1">
          <ExchangeRateWidget compact />
        </div>
      </div>

      {/* Financial Overview */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                This Month Income
              </p>
              <p className='text-2xl font-bold text-green-600'>
                ${data.income.thisMonth.toFixed(0)}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {data.income.count} income sources
              </p>
            </div>
            <div className='p-3 bg-green-100 rounded-full'>
              <TrendingUp className='h-6 w-6 text-green-600' />
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                This Month Expenses
              </p>
              <p className='text-2xl font-bold text-red-600'>
                ${data.expenses.thisMonth.toFixed(0)}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {data.expenses.count} transactions
              </p>
            </div>
            <div className='p-3 bg-red-100 rounded-full'>
              <TrendingDown className='h-6 w-6 text-red-600' />
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Net Savings</p>
              <p
                className={`text-2xl font-bold ${
                  data.netSavings >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                ${Math.abs(data.netSavings).toFixed(0)}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {data.netSavings >= 0 ? "You're saving!" : "Over budget"}
              </p>
            </div>
            <div
              className={`p-3 rounded-full ${
                data.netSavings >= 0 ? "bg-green-100" : "bg-red-100"
              }`}>
              <Wallet
                className={`h-6 w-6 ${
                  data.netSavings >= 0 ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Goal Progress</p>
              <p className='text-2xl font-bold text-blue-600'>
                {data.goals.avgProgress.toFixed(0)}%
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {data.goals.active} active goals
              </p>
            </div>
            <div className='p-3 bg-blue-100 rounded-full'>
              <Target className='h-6 w-6 text-blue-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Link
          href='/advisor'
          className='bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group text-white'>
          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors'>
              <Lightbulb className='h-8 w-8' />
            </div>
            <div>
              <h3 className='text-lg font-semibold'>Financial Advisor</h3>
              <p className='text-sm text-white/80'>Get AI-powered insights</p>
            </div>
          </div>
        </Link>

        <Link
          href='/expenses'
          className='bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group'>
          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='p-3 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors'>
              <DollarSign className='h-8 w-8 text-red-600' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>
                Track Expenses
              </h3>
              <p className='text-sm text-gray-600'>Monitor your spending</p>
            </div>
            <div className='flex items-center text-blue-600 text-sm font-medium'>
              <Plus className='h-4 w-4 mr-1' />
              Add Expense
            </div>
          </div>
        </Link>

        <Link
          href='/income'
          className='bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group'>
          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors'>
              <TrendingUp className='h-8 w-8 text-green-600' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>
                Track Income
              </h3>
              <p className='text-sm text-gray-600'>Log your earnings</p>
            </div>
            <div className='flex items-center text-blue-600 text-sm font-medium'>
              <Plus className='h-4 w-4 mr-1' />
              Add Income
            </div>
          </div>
        </Link>

        <Link
          href='/goals'
          className='bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group'>
          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors'>
              <PiggyBank className='h-8 w-8 text-blue-600' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>
                Savings Goals
              </h3>
              <p className='text-sm text-gray-600'>Plan for the future</p>
            </div>
            <div className='flex items-center text-blue-600 text-sm font-medium'>
              <Plus className='h-4 w-4 mr-1' />
              Add Goal
            </div>
          </div>
        </Link>
      </div>

      {/* AI Insights */}
      <AIInsights />

      {/* Recent Activity */}
      <div className='bg-white rounded-lg shadow-sm border'>
        <div className='p-6 border-b'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Recent Transactions
            </h2>
            <Link
              href='/expenses'
              className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
              View All →
            </Link>
          </div>
        </div>
        <div className='p-6'>
          {data.recentActivity.length === 0 ? (
            <div className='text-center text-gray-500 py-8'>
              <Activity className='h-12 w-12 mx-auto mb-4 text-gray-300' />
              <p>No recent transactions yet.</p>
              <p className='text-sm mt-1'>
                Start tracking your expenses and income!
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {data.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className='flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors'>
                  <div className='flex-shrink-0 p-2 bg-gray-100 rounded-full'>
                    {getActivityIcon(activity.type, activity.isPositive)}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900'>
                      {activity.desc}
                    </p>
                    <p className='text-xs text-gray-500'>{activity.time}</p>
                  </div>
                  {activity.amount && (
                    <div className='flex-shrink-0'>
                      <span
                        className={`text-sm font-semibold ${
                          activity.isPositive
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                        {activity.isPositive ? "+" : "-"}
                        {activity.amount}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending Splits */}
      {data.splits.pending > 0 && (
        <div className='bg-purple-50 rounded-lg p-6 border border-purple-200'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='p-3 bg-purple-100 rounded-full'>
                <Users className='h-6 w-6 text-purple-600' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Pending Bill Splits
                </h3>
                <p className='text-sm text-gray-600'>
                  You have ${data.splits.pending.toFixed(2)} in unsettled splits
                </p>
              </div>
            </div>
            <Link
              href='/splits'
              className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'>
              View Splits
            </Link>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border'>
        <div className='flex items-start space-x-4'>
          <div className='flex-shrink-0'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <Lightbulb className='h-6 w-6 text-blue-600' />
            </div>
          </div>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Financial Tips
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600'>
              <div className='space-y-2'>
                <p>
                  💰 <strong>50/30/20 Rule:</strong> Needs, wants, savings
                </p>
                <p>
                  📊 <strong>Track Everything:</strong> Small expenses add up
                </p>
              </div>
              <div className='space-y-2'>
                <p>
                  🎯 <strong>Set Goals:</strong> Specific targets work better
                </p>
                <p>
                  🔄 <strong>Review Weekly:</strong> Stay on top of spending
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
