'use client'

import { useState } from 'react'
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
  BarChart3
} from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { formatAmount, convertCurrency, SUPPORTED_CURRENCIES } from '@/utils/currency'

interface Expense {
  id: string
  amount: number
  description: string
  category: string
  date: string
  notes?: string
  currency: string
  createdAt: Date
}

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
  { name: 'Other', icon: '📦', color: 'bg-gray-100 text-gray-800' }
]

export default function ExpensesPage() {
  const { settings } = useSettings()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  
  // Form states
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Food & Dining',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    currency: settings.defaultCurrency.code
  })
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all') // all, today, this-week, this-month
  
  const addExpense = () => {
    if (formData.amount && formData.description) {
      const expense: Expense = {
        id: Date.now().toString(),
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        category: formData.category,
        date: formData.date,
        notes: formData.notes.trim() || undefined,
        currency: formData.currency,
        createdAt: new Date()
      }
      
      setExpenses([expense, ...expenses])
      resetForm()
      setShowAddForm(false)
    }
  }
  
  const updateExpense = () => {
    if (editingId && formData.amount && formData.description) {
      setExpenses(expenses.map(expense => 
        expense.id === editingId 
          ? {
              ...expense,
              amount: parseFloat(formData.amount),
              description: formData.description.trim(),
              category: formData.category,
              date: formData.date,
              notes: formData.notes.trim() || undefined,
              currency: formData.currency
            }
          : expense
      ))
      resetForm()
      setEditingId(null)
    }
  }
  
  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id))
  }
  
  const startEdit = (expense: Expense) => {
    setFormData({
      amount: expense.amount.toString(),
      description: expense.description,
      category: expense.category,
      date: expense.date,
      notes: expense.notes || '',
      currency: expense.currency
    })
    setEditingId(expense.id)
    setShowAddForm(true)
  }
  
  const resetForm = () => {
    setFormData({
      amount: '',
      description: '',
      category: 'Food & Dining',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      currency: settings.defaultCurrency.code
    })
  }
  
  const cancelEdit = () => {
    resetForm()
    setEditingId(null)
    setShowAddForm(false)
  }
  
  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
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
  const thisMonth = expenses.filter(e => {
    const date = new Date(e.date)
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }).reduce((sum, e) => sum + e.amount, 0)
  
  const thisWeek = expenses.filter(e => {
    const date = new Date(e.date)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    return date >= weekAgo
  }).reduce((sum, e) => sum + e.amount, 0)
  
  stats.thisMonth = thisMonth
  stats.thisWeek = thisWeek
  
  // Calculate top category
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)
  
  stats.topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
  
  // Calculate average per day (last 30 days)
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  const last30Days = expenses.filter(e => new Date(e.date) >= thirtyDaysAgo)
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
                    .reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, settings.defaultCurrency.code), 0),
                  settings.defaultCurrency
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
                    .reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, settings.defaultCurrency.code), 0),
                  settings.defaultCurrency
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
                    filteredExpenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, settings.defaultCurrency.code), 0) / 30
                    : 0,
                  settings.defaultCurrency
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
      {!showAddForm && (
        <div className="text-center">
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Expense</span>
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Expense' : 'Add New Expense'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {SUPPORTED_CURRENCIES.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {expenseCategories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="What did you spend on?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any additional details..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={editingId ? updateExpense : addExpense}
              disabled={!formData.amount || !formData.description}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Receipt size={20} />
              <span>{editingId ? 'Update Expense' : 'Add Expense'}</span>
            </button>
            
            <button
              onClick={cancelEdit}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
                  filteredExpenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, settings.defaultCurrency.code), 0),
                  settings.defaultCurrency
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
          {filteredExpenses.map((expense) => {
            const categoryInfo = getCategoryInfo(expense.category)
            
            return (
              <div
                key={expense.id}
                className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Category Icon */}
                    <div className={`p-3 rounded-full ${categoryInfo.color}`}>
                      <span className="text-xl">{categoryInfo.icon}</span>
                    </div>
                    
                    {/* Expense Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                        <div className="text-right">
                          <span className="text-xl font-bold text-gray-900">
                            {formatAmount(expense.amount, SUPPORTED_CURRENCIES.find(c => c.code === expense.currency) || settings.defaultCurrency)}
                          </span>
                          {expense.currency !== settings.defaultCurrency.code && (
                            <div className="text-sm text-gray-500">
                              ≈ {formatAmount(
                                convertCurrency(expense.amount, expense.currency, settings.defaultCurrency.code),
                                settings.defaultCurrency
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${categoryInfo.color}`}>
                          {expense.category}
                        </span>
                        
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(expense.date).toLocaleDateString()}
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
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEdit(expense)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
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
    </div>
  )
}