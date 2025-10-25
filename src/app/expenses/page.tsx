'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  DollarSign,
  Edit3,
  Trash2,
  Search,
  Calendar,
  TrendingUp,
  Receipt,
  PieChart,
  BarChart3,
  Share2,
  Users,
  X,
  Upload
} from 'lucide-react'
import BulkImport from '@/components/BulkImport'
import { useSettings } from '@/contexts/SettingsContext'
import { formatAmount, convertCurrency, SUPPORTED_CURRENCIES } from '@/utils/currency'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addExpense,
  updateExpense,
  deleteExpense,
  bulkImportExpenses,
  type Expense as ReduxExpense
} from '@/store/slices/expensesSlice'
import type { RootState } from '@/store/index'
import ResponsiveModal, { useMobileModal } from '@/components/ui/MobileModal'
import MobileExpenseForm from '@/components/forms/MobileExpenseForm'

// Friend interface now comes from Redux splits slice

// SplitBill interface temporarily unused during sharing feature development
interface SplitBill {
  id: string
  description: string
  totalAmount: number
  paidBy: string // friend id
  participants: string[] // friend ids
  splitType: 'equal' | 'custom'
  customAmounts?: Record<string, number>
  date: string
  settled: boolean
  createdAt: Date
  notes?: string
  currency: string
}

// Using Redux Expense interface - no local interface needed

const expenseTypes = [
  {
    value: 'recurring',
    name: 'Recurring Payment',
    icon: '🔄',
    color: 'bg-blue-100 text-blue-800',
    description: 'Subscriptions, utilities, rent, etc.'
  },
  {
    value: 'essential',
    name: 'Monthly Essential',
    icon: '🏠',
    color: 'bg-orange-100 text-orange-800',
    description: 'Groceries, fuel, necessities'
  },
  {
    value: 'one-time',
    name: 'One-Time Purchase',
    icon: '🛒',
    color: 'bg-green-100 text-green-800',
    description: 'Regular shopping, entertainment, etc.'
  },
  {
    value: 'luxury',
    name: 'Luxury / Optional',
    icon: '💎',
    color: 'bg-purple-100 text-purple-800',
    description: 'Non-essential, luxury items, treats'
  },
  {
    value: 'emergency',
    name: 'Emergency Expense',
    icon: '🚨',
    color: 'bg-red-100 text-red-800',
    description: 'Unexpected medical, repairs, etc.'
  }
]

const expenseCategories = [
  { name: 'Food & Dining', icon: '🍽️', color: 'bg-orange-100 text-orange-800' },
  { name: 'Transportation', icon: '🚗', color: 'bg-blue-100 text-blue-800' },
  { name: 'Shopping', icon: '🛍️', color: 'bg-pink-100 text-pink-800' },
  { name: 'Entertainment', icon: '🎬', color: 'bg-purple-100 text-purple-800' },
  { name: 'Bills & Utilities', icon: '💡', color: 'bg-yellow-100 text-yellow-800' },
  { name: 'Healthcare', icon: '🏥', color: 'bg-red-100 text-red-800' },
  { name: 'Education', icon: '📚', color: 'bg-indigo-100 text-indigo-800' },
  { name: 'Travel', icon: '✈️', color: 'bg-green-100 text-green-800' },
  { name: 'Personal Care', icon: '💄', color: 'bg-rose-100 text-rose-800' },
  { name: 'Rental', icon: '🏠', color: 'bg-cyan-100 text-cyan-800' },
  { name: 'Others', icon: '📦', color: 'bg-gray-100 text-gray-800' }
]

export default function ExpensesPage() {
  const { settings } = useSettings()
  const dispatch = useAppDispatch()
  const expenses = useAppSelector((state: RootState) => state.expenses?.expenses || [])
  // Remove unused totalSpent variable

  // Set page title
  useEffect(() => {
    document.title = 'Expenses - LifeSync'
  }, [])

  // Load friends and bills from Redux
  const friends = useAppSelector((state: RootState) => state.splits?.friends || [])
  // const bills = useAppSelector((state: RootState) => state.splits?.bills || []) // Temporarily unused

  // Mobile Modal States
  const addModal = useMobileModal()
  const editModal = useMobileModal()
  const [editingExpense, setEditingExpense] = useState<ReduxExpense | null>(null)

  const [shareModalExpense, setShareModalExpense] = useState<ReduxExpense | null>(null)
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)
  const [showQuickAddFriend, setShowQuickAddFriend] = useState(false)
  const [quickFriendForm, setQuickFriendForm] = useState({ name: '', email: '' })
  const [showBulkImport, setShowBulkImport] = useState(false)

  // Client-side only rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all') // all, today, this-week, this-month

  const handleAddExpense = (formData: {
    amount: string
    currency: string
    category: string
    isRecurring?: boolean
    description: string
    date: string
    recurringFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    notes: string
  }) => {
    const expense: ReduxExpense = {
      id: Date.now().toString(),
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      category: formData.category,
      date: formData.date,
      currency: formData.currency,
      createdAt: new Date().toISOString(),
      // Map additional fields to Redux schema
      notes: formData.notes.trim() || undefined,
      isRecurring: formData.isRecurring || false,
      recurringPeriod: formData.isRecurring ? formData.recurringFrequency as 'daily' | 'weekly' | 'monthly' | 'yearly' : undefined,
    }

    dispatch(addExpense(expense))
    addModal.closeModal()
  }

  const handleEditExpense = (formData: {
    amount: string
    currency: string
    category: string
    isRecurring?: boolean
    description: string
    date: string
    recurringFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    notes: string
  }) => {
    if (editingExpense) {
      dispatch(updateExpense({
        id: editingExpense.id,
        updates: {
          amount: parseFloat(formData.amount),
          description: formData.description.trim(),
          category: formData.category,
          isRecurring: formData.isRecurring || false,
          recurringPeriod: formData.isRecurring ? formData.recurringFrequency as 'daily' | 'weekly' | 'monthly' | 'yearly' : undefined,
          date: formData.date,
          notes: formData.notes.trim() || undefined,
          currency: formData.currency
        }
      }))
      setEditingExpense(null)
      editModal.closeModal()
    }
  }

  const handleDeleteExpense = (id: string) => {
    dispatch(deleteExpense(id))
  }

  // Sharing functionality temporarily disabled due to interface incompatibility
  const shareExpense = (expenseId: string, selectedFriends: string[]) => {
    // TODO: Implement sharing once Redux expense interface includes sharing fields
    return
  }

  // Unsharing functionality temporarily disabled
  const unshareExpense = (expenseId: string) => {
    // TODO: Implement unsharing once Redux expense interface includes sharing fields
    return
  }

  const openShareModal = (expense: ReduxExpense) => {
    setShareModalExpense(expense)
    // Pre-populate selected friends - sharing temporarily disabled
    setSelectedFriends([])
  }

  const addQuickFriend = () => {
    if (quickFriendForm.name.trim()) {
      const defaultAvatars = ['👤', '👨', '👩', '🧑', '👱', '👶', '🧓', '👴', '👵', '🤵', '👰']
      const newFriend = {
        id: Date.now().toString(),
        name: quickFriendForm.name.trim(),
        email: quickFriendForm.email.trim(),
        avatar: defaultAvatars[friends.length % defaultAvatars.length],
        isCustomAvatar: false,
        createdAt: new Date()
      }

      // Update friends list (assuming we have access to setFriends)
      const updatedFriends = [...friends, newFriend]
      // We need to use localStorage directly since we don't have setFriends
      localStorage.setItem('friends', JSON.stringify(updatedFriends))

      // Reset form and close
      setQuickFriendForm({ name: '', email: '' })
      setShowQuickAddFriend(false)

      // Trigger a page refresh to reload friends data
      window.location.reload()
    }
  }

  const handleBulkImport = (data: unknown[]) => {
    const importedExpenses = data as ReduxExpense[]
    dispatch(bulkImportExpenses(importedExpenses))
    setShowBulkImport(false)
  }

  const startEdit = (expense: ReduxExpense) => {
    setEditingExpense(expense)
    editModal.openModal()
  }

  // Removed old form functions - now using mobile modals

  // Filter expenses
  const filteredExpenses = (expenses as ReduxExpense[]).filter((expense: ReduxExpense) => {
    // Search filter
    if (searchTerm && !expense.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !expense.category.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Category filter
    if (categoryFilter !== 'all' && expense.category !== categoryFilter) {
      return false
    }

    // Date filter
    const expenseDate = new Date(expense.date)
    const today = new Date()

    if (dateFilter === 'today') {
      if (expenseDate.toDateString() !== today.toDateString()) return false
    } else if (dateFilter === 'this-week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      if (expenseDate < weekAgo) return false
    } else if (dateFilter === 'this-month') {
      if (expenseDate.getMonth() !== today.getMonth() ||
        expenseDate.getFullYear() !== today.getFullYear()) return false
    }

    return true
  })

  // Calculate statistics
  const stats = {
    total: filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    count: filteredExpenses.length,
    avgPerDay: 0,
    topCategory: '',
    thisMonth: 0,
    thisWeek: 0
  }

  // Calculate this month and week totals
  const today = new Date()
  const thisMonth = (expenses as ReduxExpense[]).filter((e: ReduxExpense) => {
    const date = new Date(e.date)
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }).reduce((sum, e) => sum + e.amount, 0)

  const thisWeek = (expenses as ReduxExpense[]).filter((e: ReduxExpense) => {
    const date = new Date(e.date)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    return date >= weekAgo
  }).reduce((sum, e) => sum + e.amount, 0)

  stats.thisMonth = thisMonth
  stats.thisWeek = thisWeek

  // Calculate top category
  const categoryTotals = (expenses as ReduxExpense[]).reduce((acc, expense: ReduxExpense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  stats.topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] || 'None'

  // Calculate average per day (last 30 days)
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  const last30Days = (expenses as ReduxExpense[]).filter((e: ReduxExpense) => new Date(e.date) >= thirtyDaysAgo)
  stats.avgPerDay = last30Days.length > 0 ? last30Days.reduce((sum, e) => sum + e.amount, 0) / 30 : 0

  const getCategoryInfo = (categoryName: string) => {
    return expenseCategories.find(cat => cat.name === categoryName) || expenseCategories[expenseCategories.length - 1]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 Expense Tracker</h1>
        <p className="text-gray-600">Track your spending and manage your budget</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(
                  filteredExpenses
                    .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
                    .reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, settings.currency), 0),
                  SUPPORTED_CURRENCIES.find(c => c.code === settings.currency) || SUPPORTED_CURRENCIES[0]
                )}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(
                  filteredExpenses
                    .filter(e => {
                      const expenseDate = new Date(e.date)
                      const weekStart = new Date()
                      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
                      return expenseDate >= weekStart
                    })
                    .reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, settings.currency), 0),
                  SUPPORTED_CURRENCIES.find(c => c.code === settings.currency) || SUPPORTED_CURRENCIES[0]
                )}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg/Day (30d)</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(
                  filteredExpenses.length > 0 ?
                    filteredExpenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, settings.currency), 0) / 30
                    : 0,
                  SUPPORTED_CURRENCIES.find(c => c.code === settings.currency) || SUPPORTED_CURRENCIES[0]
                )}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Category</p>
              <p className="text-lg font-bold text-gray-900">{stats.topCategory}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <PieChart className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Button */}
      <div className="text-center space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={addModal.openModal}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => setShowBulkImport(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload size={20} />
            <span>Bulk Import</span>
          </button>
        </div>
      </div>

      {/* Responsive Modals for Add/Edit Forms */}
      <ResponsiveModal
        isOpen={addModal.isOpen}
        onClose={addModal.closeModal}
        title="Add New Expense"
        size="large"
      >
        <MobileExpenseForm
          onSubmit={handleAddExpense}
          onCancel={addModal.closeModal}
          isEditing={false}
        />
      </ResponsiveModal>

      <ResponsiveModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        title="Edit Expense"
        size="large"
      >
        {editingExpense && (
          <MobileExpenseForm
            initialData={{
              amount: editingExpense.amount.toString(),
              currency: editingExpense.currency,
              category: editingExpense.category,
              isRecurring: editingExpense.isRecurring,
              description: editingExpense.description,
              date: editingExpense.date,
              recurringFrequency: (editingExpense.recurringPeriod as 'daily' | 'weekly' | 'monthly' | 'yearly') || 'monthly',
              notes: editingExpense.notes || '',
            }}
            onSubmit={handleEditExpense}
            onCancel={editModal.closeModal}
            isEditing={true}
          />
        )}
      </ResponsiveModal>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search expenses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {expenseCategories.map(category => (
              <option key={category.name} value={category.name}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
          </select>
        </div>

        {filteredExpenses.length !== expenses.length && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredExpenses.length} of {expenses.length} expenses
            {filteredExpenses.length > 0 && (
              <span className="ml-2 font-medium">
                Total: {formatAmount(
                  filteredExpenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, settings.currency), 0),
                  SUPPORTED_CURRENCIES.find(c => c.code === settings.currency) || SUPPORTED_CURRENCIES[0]
                )}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {expenses.length === 0 ? 'No expenses yet' : 'No matching expenses'}
          </h3>
          <p className="text-gray-600">
            {expenses.length === 0
              ? 'Add your first expense to start tracking your spending'
              : 'Try adjusting your filters or search term'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense: ReduxExpense) => {
            const categoryInfo = getCategoryInfo(expense.category)

            return (
              <div
                key={expense.id}
                className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  {/* Category Icon */}
                  <div className={`p-3 rounded-full flex-shrink-0 ${categoryInfo.color}`}>
                    <span className="text-xl">{categoryInfo.icon}</span>
                  </div>

                  {/* Expense Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{expense.description}</h3>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-lg sm:text-xl font-bold text-gray-900">
                          {formatAmount(expense.amount, SUPPORTED_CURRENCIES.find(c => c.code === expense.currency) || SUPPORTED_CURRENCIES.find(c => c.code === settings.currency) || SUPPORTED_CURRENCIES[0])}
                        </span>
                        {expense.currency !== settings.currency && (
                          <div className="text-xs sm:text-sm text-gray-500">
                            ≈ {formatAmount(
                              convertCurrency(expense.amount, expense.currency, settings.currency),
                              SUPPORTED_CURRENCIES.find(c => c.code === settings.currency) || SUPPORTED_CURRENCIES[0]
                            )}
                          </div>
                        )}
                      </div>
                    </div>                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${categoryInfo.color}`}>
                        {expense.category}
                      </span>

                      <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${expense.isRecurring ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {expense.isRecurring ? '🔄' : '💰'} {expense.isRecurring ? 'Recurring' : 'One-time'}
                        {expense.isRecurring && expense.recurringPeriod && (
                          <span className="ml-1">({expense.recurringPeriod})</span>
                        )}
                      </span>

                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {isClient ? new Date(expense.date).toLocaleDateString() : 'Recent'}
                      </span>

                      {expense.notes && (
                        <span className="text-gray-400" title={expense.notes}>
                          📝 Notes
                        </span>
                      )}
                    </div>

                    {expense.notes && (
                      <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {expense.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openShareModal(expense)}
                      className="text-gray-400 hover:text-green-600 transition-colors"
                      title="Share Expense"
                    >
                      <Share2 size={18} />
                    </button>
                    <button
                      onClick={() => startEdit(expense)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Expense"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Expense"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Share Expense Modal */}
      {shareModalExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Share Expense
                  </h3>
                  {false && (
                    <p className="text-sm text-green-600">This expense is already shared - updating participants</p>
                  )}
                </div>
                <button
                  onClick={() => setShareModalExpense(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">{shareModalExpense.description}</h4>
                <p className="text-sm text-gray-600">
                  {formatAmount(shareModalExpense.amount, SUPPORTED_CURRENCIES.find(c => c.code === shareModalExpense.currency) || SUPPORTED_CURRENCIES.find(c => c.code === settings.currency) || SUPPORTED_CURRENCIES[0])}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select friends to share with:
                </label>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">{friends.length} friends available</span>
                  <button
                    onClick={() => setShowQuickAddFriend(true)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                  >
                    <Plus size={14} />
                    Add Friend
                  </button>
                </div>

                {friends.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p>No friends added yet.</p>
                    <p className="text-sm">Click &quot;Add Friend&quot; above to add your first friend.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends.map((friend) => (
                      <label
                        key={friend.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFriends.includes(friend.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFriends([...selectedFriends, friend.id])
                            } else {
                              setSelectedFriends(selectedFriends.filter(id => id !== friend.id))
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {friend.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{friend.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Quick Add Friend Form */}
                {showQuickAddFriend && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">Add New Friend</h5>
                      <button
                        onClick={() => {
                          setShowQuickAddFriend(false)
                          setQuickFriendForm({ name: '', email: '' })
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={quickFriendForm.name}
                        onChange={(e) => setQuickFriendForm({ ...quickFriendForm, name: e.target.value })}
                        placeholder="Friend's name"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="email"
                        value={quickFriendForm.email}
                        onChange={(e) => setQuickFriendForm({ ...quickFriendForm, email: e.target.value })}
                        placeholder="Email (optional)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <button
                      onClick={addQuickFriend}
                      disabled={!quickFriendForm.name.trim()}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Add Friend
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShareModalExpense(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                {false && (
                  <button
                    onClick={() => {
                      if (shareModalExpense) {
                        unshareExpense(shareModalExpense.id)
                        setShareModalExpense(null)
                        setSelectedFriends([])
                      }
                    }}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Unshare
                  </button>
                )}
                <button
                  onClick={() => {
                    shareExpense(shareModalExpense.id, selectedFriends)
                    setShareModalExpense(null)
                    setSelectedFriends([])
                  }}
                  disabled={selectedFriends.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Share Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImport
          feature="expenses"
          onImport={handleBulkImport}
          onClose={() => setShowBulkImport(false)}
        />
      )}
    </div>
  )
}