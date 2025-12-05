'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  Repeat,
  Clock,
  Filter,
  Upload
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addIncome,
  updateIncome,
  deleteIncome,
  bulkImportIncome,
  selectIncomes,
  selectIncomeTotals,
  type Income,
  type IncomeCategory,
  type IncomeRecurrence
} from '@/store/slices/incomeSlice'
import { useSettings } from '@/contexts/SettingsContext'
import { formatAmount, getCurrencyByCode, SUPPORTED_CURRENCIES } from '@/utils/currency'
import ResponsiveModal, { useMobileModal } from '@/components/ui/MobileModal'
import BulkImport from '@/components/BulkImport'

const incomeCategories: { value: IncomeCategory; label: string; color: string }[] = [
  { value: 'salary', label: 'Salary', color: 'bg-green-100 text-green-800' },
  { value: 'bonus', label: 'Bonus', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'freelance', label: 'Freelance', color: 'bg-purple-100 text-purple-800' },
  { value: 'investment', label: 'Investment', color: 'bg-blue-100 text-blue-800' },
  { value: 'refund', label: 'Refund', color: 'bg-pink-100 text-pink-800' },
  { value: 'rental', label: 'Rental', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'gift', label: 'Gift', color: 'bg-rose-100 text-rose-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
]

const recurrenceOptions: { value: IncomeRecurrence; label: string }[] = [
  { value: 'one-time', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

export default function IncomePage() {
  const dispatch = useAppDispatch()
  const incomes = useAppSelector(selectIncomes)
  const { totalReceived, totalScheduled } = useAppSelector(selectIncomeTotals)
  const { settings } = useSettings()
  const [isClient, setIsClient] = useState(false)

  const addIncomeModal = useMobileModal()
  const editIncomeModal = useMobileModal()
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'received' | 'scheduled'>('all')
  const [showBulkImport, setShowBulkImport] = useState(false)

  useEffect(() => {
    setIsClient(true)
    document.title = 'Income - WealthPulse'
  }, [])

  const handleAddIncome = (incomeData: Partial<Income>) => {
    const newIncome: Income = {
      id: Date.now().toString(),
      amount: incomeData.amount || 0,
      source: incomeData.source || '',
      category: incomeData.category || 'salary',
      currency: incomeData.currency || settings.currency,
      status: incomeData.status || 'received',
      eventDate: incomeData.eventDate || new Date().toISOString().split('T')[0],
      recurrence: incomeData.recurrence || 'one-time',
      tags: incomeData.tags || [],
      notes: incomeData.notes,
      linkedGoalIds: incomeData.linkedGoalIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dispatch(addIncome(newIncome))
    addIncomeModal.closeModal()
  }

  const handleEditIncome = (incomeData: Partial<Income>) => {
    if (editingIncome) {
      dispatch(
        updateIncome({
          id: editingIncome.id,
          updates: {
            ...incomeData,
            updatedAt: new Date().toISOString(),
          },
        })
      )
      setEditingIncome(null)
      editIncomeModal.closeModal()
    }
  }

  const handleDeleteIncome = (id: string) => {
    if (confirm('Are you sure you want to delete this income entry?')) {
      dispatch(deleteIncome(id))
    }
  }

  const handleBulkImport = (data: unknown[]) => {
    dispatch(bulkImportIncome(data as Income[]))
    setShowBulkImport(false)
  }

  const startEdit = (income: Income) => {
    setEditingIncome(income)
    editIncomeModal.openModal()
  }

  const filteredIncomes = incomes.filter((income) => {
    if (filterStatus === 'all') return true
    return income.status === filterStatus
  })

  if (!isClient) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={32} />
            Income Tracking
          </h1>
          <p className="text-gray-600 mt-1">Track your income sources and cashflow</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowBulkImport(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload size={20} />
            <span className="hidden sm:inline">Bulk Import</span>
          </button>
          <button
            onClick={addIncomeModal.openModal}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Received</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">
                {formatAmount(totalReceived, getCurrencyByCode(settings.currency))}
              </p>
              <p className="text-green-200 text-xs mt-1">
                Currency: {settings.currency}
              </p>
            </div>
            <DollarSign size={32} className="text-green-100" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Scheduled</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">
                {formatAmount(totalScheduled, getCurrencyByCode(settings.currency))}
              </p>
              <p className="text-blue-200 text-xs mt-1">
                Currency: {settings.currency}
              </p>
            </div>
            <Clock size={40} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Entries</p>
              <p className="text-2xl font-bold mt-1">{incomes.length}</p>
            </div>
            <TrendingUp size={40} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter size={20} className="text-gray-500" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Income</option>
          <option value="received">Received</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {/* Income List */}
      {filteredIncomes.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No income entries yet</h3>
          <p className="text-gray-600 mb-4">Start tracking your income to get insights into your cashflow</p>
          <button
            onClick={addIncomeModal.openModal}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Your First Income</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncomes.map((income) => {
            const category = incomeCategories.find((c) => c.value === income.category)
            return (
              <div
                key={income.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{income.source}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${category?.color}`}>
                        {category?.label}
                      </span>
                      {income.status === 'scheduled' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Scheduled
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1 font-semibold text-green-700">
                        <DollarSign size={16} />
                        {formatAmount(income.amount, getCurrencyByCode(income.currency))}
                        <span className="text-xs text-gray-500 font-normal">({income.currency})</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {new Date(income.eventDate).toLocaleDateString()}
                      </span>
                      {income.recurrence !== 'one-time' && (
                        <span className="flex items-center gap-1">
                          <Repeat size={16} />
                          {recurrenceOptions.find((r) => r.value === income.recurrence)?.label}
                        </span>
                      )}
                    </div>
                    {income.notes && (
                      <p className="text-sm text-gray-600 mt-2">{income.notes}</p>
                    )}
                    {income.tags && income.tags.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <Tag size={14} className="text-gray-400" />
                        {income.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => startEdit(income)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteIncome(income.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Add Income Modal */}
      <ResponsiveModal
        isOpen={addIncomeModal.isOpen}
        onClose={addIncomeModal.closeModal}
        title="Add Income"
      >
        <IncomeForm onSubmit={handleAddIncome} onCancel={addIncomeModal.closeModal} />
      </ResponsiveModal>

      {/* Edit Income Modal */}
      <ResponsiveModal
        isOpen={editIncomeModal.isOpen}
        onClose={editIncomeModal.closeModal}
        title="Edit Income"
      >
        <IncomeForm
          income={editingIncome}
          onSubmit={handleEditIncome}
          onCancel={editIncomeModal.closeModal}
        />
      </ResponsiveModal>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImport
          feature="income"
          onImport={handleBulkImport}
          onClose={() => setShowBulkImport(false)}
        />
      )}
    </div>
  )
}

function IncomeForm({
  income,
  onSubmit,
  onCancel,
}: {
  income?: Income | null
  onSubmit: (data: Partial<Income>) => void
  onCancel: () => void
}) {
  const { settings } = useSettings()
  const [formData, setFormData] = useState<Partial<Income>>({
    source: income?.source || '',
    amount: income?.amount || 0,
    category: income?.category || 'salary',
    currency: income?.currency || settings.currency,
    status: income?.status || 'received',
    eventDate: income?.eventDate || new Date().toISOString().split('T')[0],
    recurrence: income?.recurrence || 'one-time',
    notes: income?.notes || '',
    tags: income?.tags || [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.source || !formData.amount) {
      alert('Please fill in all required fields')
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Source <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          placeholder="e.g., Monthly Salary, Freelance Project"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {SUPPORTED_CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.code} - {curr.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as IncomeCategory })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {incomeCategories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'received' | 'scheduled' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="received">Received</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={formData.eventDate}
            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence</label>
          <select
            value={formData.recurrence}
            onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as IncomeRecurrence })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {recurrenceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Optional notes..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          {income ? 'Update' : 'Add'} Income
        </button>
      </div>
    </form>
  )
}
