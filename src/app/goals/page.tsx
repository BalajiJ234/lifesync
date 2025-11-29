'use client'

import { useState, useEffect } from 'react'
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
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addGoal,
  updateGoal,
  deleteGoal as removeGoal,
  type Goal as ReduxGoal
} from '@/store/slices/goalsSlice'
import type { Expense } from '@/store/slices/expensesSlice'
import type { RootState } from '@/store/index'
import { formatAmount, getCurrencyByCode } from '@/utils/currency'
import ResponsiveModal, { useMobileModal } from '@/components/ui/MobileModal'

// Using Redux Goal interface - no local interface needed

type GoalCategory = 'emergency-fund' | 'debt-reduction' | 'travel' | 'purchase' | 'investment' | 'education' | 'health' | 'other'

const goalCategories = [
  { value: 'travel', name: 'Vacation & Travel', icon: Plane, color: 'bg-blue-100 text-blue-800', description: 'Travel and vacation expenses' },
  { value: 'emergency-fund', name: 'Emergency Fund', icon: Shield, color: 'bg-red-100 text-red-800', description: '3-6 months of expenses' },
  { value: 'purchase', name: 'Home & Property', icon: Home, color: 'bg-green-100 text-green-800', description: 'House down payment, furniture' },
  { value: 'purchase', name: 'Vehicle', icon: Car, color: 'bg-gray-100 text-gray-800', description: 'Car purchase or maintenance' },
  { value: 'education', name: 'Education', icon: GraduationCap, color: 'bg-purple-100 text-purple-800', description: 'Courses, degrees, certifications' },
  { value: 'health', name: 'Health & Wellness', icon: Heart, color: 'bg-pink-100 text-pink-800', description: 'Medical, fitness, wellness' },
  { value: 'investment', name: 'Investment', icon: TrendingUp, color: 'bg-yellow-100 text-yellow-800', description: 'Stocks, bonds, business' },
  { value: 'other', name: 'Other', icon: Target, color: 'bg-indigo-100 text-indigo-800', description: 'Custom financial goals' },
] as const

export default function GoalsPage() {
  const dispatch = useAppDispatch()
  const goals = useAppSelector((state: RootState) => state.goals?.goals || [])
  const expenses = useAppSelector((state: RootState) => state.expenses?.expenses || [])
  const [isClient, setIsClient] = useState(false)

  // Modal states
  const addGoalModal = useMobileModal()
  const editGoalModal = useMobileModal()
  const [editingGoal, setEditingGoal] = useState<ReduxGoal | null>(null)
  const [aiAnalysisModal, setAiAnalysisModal] = useState<ReduxGoal | null>(null)

  useEffect(() => {
    setIsClient(true)
    document.title = 'Goals - WealthPulse'
  }, [])

  // Calculate goal progress
  const getGoalProgress = (goal: ReduxGoal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100
    return Math.min(progress, 100)
  }

  // Get days remaining
  const getDaysRemaining = (deadline: string) => {
    const today = new Date()
    const targetDate = new Date(deadline)
    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // AI-powered goal analysis
  const analyzeGoalWithAI = async (goal: ReduxGoal) => {
    const monthlyExpenses = expenses.reduce((total: number, expense: Expense) => {
      const expenseDate = new Date(expense.date)
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      if (expenseDate >= lastMonth) {
        return total + expense.amount
      }
      return total
    }, 0)

    const averageMonthlyExpense = monthlyExpenses || 2000 // Default if no data
    const daysRemaining = getDaysRemaining(goal.targetDate || '')
    const monthsRemaining = daysRemaining / 30
    const remainingAmount = goal.targetAmount - goal.currentAmount
    const monthlyTarget = monthsRemaining > 0 ? remainingAmount / monthsRemaining : remainingAmount

    // Determine feasibility
    let feasibility: 'easy' | 'moderate' | 'challenging' = 'moderate'
    const targetPercentage = (monthlyTarget / averageMonthlyExpense) * 100

    if (targetPercentage < 10) feasibility = 'easy'
    else if (targetPercentage > 25) feasibility = 'challenging'

    // Generate AI recommendation
    let recommendation = ''
    if (feasibility === 'easy') {
      recommendation = `Great! You can easily reach this goal by saving ${formatAmount(monthlyTarget, getCurrencyByCode(goal.currency))} per month. Consider setting a higher target!`
    } else if (feasibility === 'challenging') {
      recommendation = `This goal is ambitious! Consider extending the deadline or reducing expenses in categories like dining out or entertainment to free up ${formatAmount(monthlyTarget, getCurrencyByCode(goal.currency))}/month.`
    } else {
      recommendation = `This goal is achievable with discipline. Save ${formatAmount(monthlyTarget, getCurrencyByCode(goal.currency))} monthly by tracking your expenses and cutting unnecessary spending.`
    }

    const aiInsights = {
      feasibility,
      suggestions: [recommendation],
      monthlyRequired: monthlyTarget,
      timeframe: `${Math.ceil(monthsRemaining)} months`,
      confidence: expenses.length > 0 ? 0.85 : 0.6 // Higher confidence if based on actual spending
    }

    // Update goal with AI insights
    dispatch(updateGoal({
      id: goal.id,
      updates: { aiAnalysis: aiInsights }
    }))
    setAiAnalysisModal({ ...goal, aiAnalysis: aiInsights })
  }

  // Handle goal operations  
  const handleAddGoal = (goalData: Partial<ReduxGoal>) => {
    const newGoal: ReduxGoal = {
      id: Date.now().toString(),
      title: goalData.title || '',
      description: goalData.description,
      category: goalData.category || 'travel',
      targetAmount: goalData.targetAmount || 0,
      currentAmount: 0,
      currency: goalData.currency || 'USD',
      targetDate: goalData.targetDate,
      priority: goalData.priority || 'medium',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dispatch(addGoal(newGoal))
    addGoalModal.closeModal()
  }

  const handleEditGoal = (goalData: Partial<ReduxGoal>) => {
    if (editingGoal) {
      dispatch(updateGoal({
        id: editingGoal.id,
        updates: goalData
      }))
      setEditingGoal(null)
      editGoalModal.closeModal()
    }
  }

  const deleteGoal = (goalId: string) => {
    dispatch(removeGoal(goalId))
  }

  const updateGoalProgress = (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId)
    if (goal) {
      dispatch(updateGoal({
        id: goalId,
        updates: { currentAmount: Math.max(0, Math.min(goal.targetAmount, amount)) }
      }))
    }
  }

  const startEdit = (goal: ReduxGoal) => {
    setEditingGoal(goal)
    editGoalModal.openModal()
  }

  if (!isClient) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="text-blue-600" size={32} />
            Financial Goals
          </h1>
          <p className="text-gray-600 mt-1">Set and track your savings goals with AI-powered insights</p>
        </div>
        <button
          onClick={addGoalModal.openModal}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="text-center py-12">
          <Target size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Goals Yet</h3>
          <p className="text-gray-600 mb-6">Start tracking your financial goals with AI-powered insights!</p>
          <button
            onClick={addGoalModal.openModal}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Create Your First Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(goals as ReduxGoal[]).map((goal: ReduxGoal) => {
            const category = goalCategories.find(c => c.value === goal.category)
            const progress = getGoalProgress(goal)
            const daysRemaining = getDaysRemaining(goal.targetDate || '')
            const Icon = category?.icon || Target

            return (
              <div key={goal.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                {/* Goal Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${category?.color || 'bg-gray-100 text-gray-800'}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                        <p className="text-sm text-gray-600">{category?.name}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEdit(goal)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-medium">
                        {formatAmount(goal.currentAmount, getCurrencyByCode(goal.currency))}
                      </span>
                      <span className="text-gray-600">
                        of {formatAmount(goal.targetAmount, getCurrencyByCode(goal.currency))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Goal Footer */}
                <div className="px-6 pb-6 space-y-3">
                  {/* Days Remaining */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Calendar size={14} />
                      {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                    </span>
                    {goal.aiAnalysis && (
                      <span className="flex items-center gap-1 text-purple-600 text-xs">
                        <Sparkles size={12} />
                        AI Optimized
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => analyzeGoalWithAI(goal)}
                      className="flex-1 py-2 px-3 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Sparkles size={14} />
                      AI Insights
                    </button>
                    <button
                      onClick={() => {
                        const amount = prompt(`Add to "${goal.title}" (Current: ${formatAmount(goal.currentAmount, getCurrencyByCode(goal.currency))}):`)
                        if (amount && !isNaN(Number(amount))) {
                          updateGoalProgress(goal.id, goal.currentAmount + Number(amount));
                        }
                      }}
                      className="flex-1 py-2 px-3 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Add Money
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      <ResponsiveModal
        isOpen={addGoalModal.isOpen}
        onClose={addGoalModal.closeModal}
        title="Create New Goal"
        size="large"
      >
        <GoalForm
          onSubmit={handleAddGoal}
          onCancel={addGoalModal.closeModal}
          isEditing={false}
        />
      </ResponsiveModal>

      {/* Edit Goal Modal */}
      <ResponsiveModal
        isOpen={editGoalModal.isOpen}
        onClose={editGoalModal.closeModal}
        title="Edit Goal"
        size="large"
      >
        {editingGoal && (
          <GoalForm
            initialData={editingGoal}
            onSubmit={handleEditGoal}
            onCancel={editGoalModal.closeModal}
            isEditing={true}
          />
        )}
      </ResponsiveModal>

      {/* AI Analysis Modal */}
      {aiAnalysisModal && (
        <ResponsiveModal
          isOpen={!!aiAnalysisModal}
          onClose={() => setAiAnalysisModal(null)}
          title="AI Goal Analysis"
          size="medium"
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Sparkles className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{aiAnalysisModal.title}</h3>
                <p className="text-sm text-gray-600">AI-powered financial analysis</p>
              </div>
            </div>

            {aiAnalysisModal.aiAnalysis && (
              <div className="space-y-4">
                {/* Monthly Target */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign size={18} className="text-blue-600" />
                    <span className="font-medium text-blue-900">Monthly Target</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatAmount(aiAnalysisModal.aiAnalysis.monthlyRequired, getCurrencyByCode(aiAnalysisModal.currency))}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Save this amount monthly to reach your goal
                  </p>
                </div>

                {/* Feasibility */}
                <div className={`p-4 rounded-lg ${aiAnalysisModal.aiAnalysis.feasibility === 'easy' ? 'bg-green-50' :
                  aiAnalysisModal.aiAnalysis.feasibility === 'moderate' ? 'bg-yellow-50' : 'bg-red-50'
                  }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp size={18} className={
                      aiAnalysisModal.aiAnalysis.feasibility === 'easy' ? 'text-green-600' :
                        aiAnalysisModal.aiAnalysis.feasibility === 'moderate' ? 'text-yellow-600' : 'text-red-600'
                    } />
                    <span className="font-medium">Feasibility: {aiAnalysisModal.aiAnalysis.feasibility.charAt(0).toUpperCase() + aiAnalysisModal.aiAnalysis.feasibility.slice(1)}</span>
                  </div>
                  <p className="text-sm">
                    {aiAnalysisModal.aiAnalysis.suggestions[0]}
                  </p>
                </div>

                {aiAnalysisModal.aiAnalysis.confidence < 0.7 && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle size={18} className="text-orange-600" />
                      <span className="font-medium text-orange-900">Limited Data</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      Add more expenses to get better AI insights based on your actual spending patterns.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={() => setAiAnalysisModal(null)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </ResponsiveModal>
      )}
    </div>
  )
}

// Goal Form Component
interface GoalFormProps {
  initialData?: Partial<ReduxGoal>
  onSubmit: (data: Partial<ReduxGoal>) => void
  onCancel: () => void
  isEditing: boolean
}

function GoalForm({ initialData, onSubmit, onCancel, isEditing }: GoalFormProps) {
  const { settings } = useSettings()
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    targetAmount: initialData?.targetAmount?.toString() || '',
    category: initialData?.category || 'travel' as GoalCategory,
    deadline: initialData?.targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: initialData?.priority || 'medium' as 'low' | 'medium' | 'high',
    currency: initialData?.currency || settings.currency
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title && formData.targetAmount) {
      onSubmit({
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        targetDate: formData.deadline, // Map deadline to targetDate for Redux interface
        status: initialData?.status || 'active' as const // Preserve status if editing, default to active for new goals
      })
    }
  }

  return (
    <div className="h-full flex flex-col">
      <form id="goal-form" onSubmit={handleSubmit} className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">

        {/* Goal Title */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
            <Target size={16} className="text-blue-600" />
            <span>Goal Name *</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Summer Vacation to Europe"
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
        </div>

        {/* Category & Target Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as GoalCategory })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
            >
              {goalCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
              <DollarSign size={16} className="text-green-600" />
              <span>Target Amount *</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              placeholder="5000.00"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>
        </div>

        {/* Deadline & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
              <Calendar size={16} className="text-red-600" />
              <span>Target Date *</span>
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your goal and why it's important to you..."
            rows={3}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg resize-none"
          />
        </div>
      </form>

      {/* Action Buttons */}
      <div className="flex space-x-3 p-4 md:p-6 border-t border-gray-100 bg-white flex-shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 md:py-4 px-4 md:px-6 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm md:text-base"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="goal-form"
          disabled={!formData.title || !formData.targetAmount}
          className="flex-1 py-3 md:py-4 px-4 md:px-6 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors text-sm md:text-base"
          onClick={handleSubmit}
        >
          {isEditing ? 'Update Goal' : 'Create Goal'}
        </button>
      </div>
    </div>
  )
}