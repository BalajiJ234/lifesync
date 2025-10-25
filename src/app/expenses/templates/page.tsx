'use client'

import { useState, useEffect } from 'react'
import {
  Repeat,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Zap
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplateActive,
  selectTemplates,
  getUpcomingTemplates,
  getMissedTemplates,
  calculateNextDueDate,
  type RecurringTemplate,
  type RecurringFrequency
} from '@/store/slices/recurringTemplatesSlice'
import { addExpense } from '@/store/slices/expensesSlice'
import { useSettings } from '@/contexts/SettingsContext'
import { formatAmount, getCurrencyByCode, SUPPORTED_CURRENCIES } from '@/utils/currency'
import ResponsiveModal, { useMobileModal } from '@/components/ui/MobileModal'

const frequencyOptions: { value: RecurringFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

const expenseCategories = [
  'Housing', 'Transportation', 'Food', 'Utilities', 'Healthcare',
  'Entertainment', 'Shopping', 'Education', 'Insurance', 'Subscriptions', 'Other'
]

export default function RecurringTemplatesPage() {
  const dispatch = useAppDispatch()
  const templates = useAppSelector(selectTemplates)
  const { settings } = useSettings()
  const [isClient, setIsClient] = useState(false)

  const addModal = useMobileModal()
  const editModal = useMobileModal()
  const [editingTemplate, setEditingTemplate] = useState<RecurringTemplate | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all')

  useEffect(() => {
    setIsClient(true)
    document.title = 'Recurring Templates - LifeSync'
  }, [])

  const upcoming = isClient ? getUpcomingTemplates(templates, 30) : []
  const missed = isClient ? getMissedTemplates(templates, 7) : []

  const filteredTemplates = templates.filter((t) => {
    if (filter === 'active') return t.isActive
    if (filter === 'paused') return !t.isActive
    return true
  })

  const handleAddTemplate = (data: Partial<RecurringTemplate>) => {
    const newTemplate: RecurringTemplate = {
      id: Date.now().toString(),
      name: data.name || '',
      amount: data.amount || 0,
      currency: data.currency || settings.currency,
      category: data.category || 'Other',
      frequency: data.frequency || 'monthly',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      dayOfMonth: data.dayOfMonth,
      dayOfWeek: data.dayOfWeek,
      notes: data.notes,
      isActive: true,
      reminderDays: data.reminderDays || 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dispatch(addTemplate(newTemplate))
    addModal.closeModal()
  }

  const handleEditTemplate = (data: Partial<RecurringTemplate>) => {
    if (editingTemplate) {
      dispatch(updateTemplate({ id: editingTemplate.id, updates: data }))
      editModal.closeModal()
      setEditingTemplate(null)
    }
  }

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Delete this recurring template?')) {
      dispatch(deleteTemplate(id))
    }
  }

  const handleToggleActive = (id: string) => {
    dispatch(toggleTemplateActive(id))
  }

  const handleCreateFromTemplate = (template: RecurringTemplate) => {
    const nextDue = calculateNextDueDate(
      template.startDate,
      template.frequency,
      template.lastGenerated,
      template.dayOfMonth,
      template.dayOfWeek
    )

    const newExpense = {
      id: Date.now().toString(),
      description: template.name,
      amount: template.amount,
      currency: template.currency,
      category: template.category,
      date: nextDue,
      notes: template.notes || 'Created from recurring template',
      createdAt: new Date().toISOString(),
      templateId: template.id, // Track which template created this expense
    }

    dispatch(addExpense(newExpense))
    dispatch(updateTemplate({
      id: template.id,
      updates: { lastGenerated: nextDue }
    }))
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recurring Templates</h1>
          <p className="text-gray-600 mt-1">Manage recurring bills and subscriptions</p>
        </div>
        <button
          onClick={addModal.openModal}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>New Template</span>
        </button>
      </div>

      {/* Alerts for Missed Payments */}
      {missed.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Missed Recurring Payments</h3>
              <p className="text-sm text-red-700 mt-1">
                {missed.length} template{missed.length > 1 ? 's' : ''} appear to have missed payments:
              </p>
              <ul className="mt-2 space-y-1">
                {missed.map((t) => (
                  <li key={t.id} className="text-sm text-red-800">
                    • {t.name} - Expected around{' '}
                    {new Date(
                      calculateNextDueDate(t.startDate, t.frequency, t.lastGenerated, t.dayOfMonth, t.dayOfWeek)
                    ).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Expenses */}
      {upcoming.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming (Next 30 Days)</h2>
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((item) => {
              const currency = getCurrencyByCode(item.currency)
              const daysUntil = Math.ceil(
                (new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              )
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${item.isOverdue ? 'bg-red-100' : 'bg-blue-100'}`}>
                      <Repeat className={`h-4 w-4 ${item.isOverdue ? 'text-red-600' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.isOverdue ? 'Overdue' : `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`} •{' '}
                        {new Date(item.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-gray-900">
                      {formatAmount(item.amount, currency)}
                    </span>
                    <button
                      onClick={() => handleCreateFromTemplate(item)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      <Zap size={14} className="inline mr-1" />
                      Create
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {(['all', 'active', 'paused'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f} ({templates.filter(t => f === 'all' || (f === 'active' ? t.isActive : !t.isActive)).length})
          </button>
        ))}
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const currency = getCurrencyByCode(template.currency)
          const nextDue = calculateNextDueDate(
            template.startDate,
            template.frequency,
            template.lastGenerated,
            template.dayOfMonth,
            template.dayOfWeek
          )
          return (
            <div
              key={template.id}
              className={`bg-white rounded-lg shadow-sm border p-4 ${
                !template.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{template.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleActive(template.id)}
                    className={`p-1.5 rounded ${
                      template.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}
                    title={template.isActive ? 'Pause' : 'Activate'}
                  >
                    {template.isActive ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingTemplate(template)
                      editModal.openModal()
                    }}
                    className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatAmount(template.amount, currency)}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded capitalize">
                    {template.frequency}
                  </span>
                </div>

                <div className="text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>Next: {new Date(nextDue).toLocaleDateString()}</span>
                  </div>
                  {template.lastGenerated && (
                    <div className="flex items-center space-x-1 mt-1">
                      <CheckCircle size={14} />
                      <span>Last: {new Date(template.lastGenerated).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleCreateFromTemplate(template)}
                  className="w-full mt-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                  disabled={!template.isActive}
                >
                  <Zap size={16} />
                  <span>Create Expense</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <Repeat className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recurring templates</h3>
          <p className="text-gray-500 mb-4">Create templates for bills and subscriptions</p>
          <button
            onClick={addModal.openModal}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            <span>Create Template</span>
          </button>
        </div>
      )}

      {/* Add Template Modal */}
      <ResponsiveModal isOpen={addModal.isOpen} onClose={addModal.closeModal} title="New Recurring Template">
        <TemplateForm onSubmit={handleAddTemplate} onCancel={addModal.closeModal} />
      </ResponsiveModal>

      {/* Edit Template Modal */}
      <ResponsiveModal isOpen={editModal.isOpen} onClose={editModal.closeModal} title="Edit Recurring Template">
        {editingTemplate && (
          <TemplateForm
            onSubmit={handleEditTemplate}
            onCancel={editModal.closeModal}
            initialData={editingTemplate}
          />
        )}
      </ResponsiveModal>
    </div>
  )
}

// Template Form Component
function TemplateForm({
  onSubmit,
  onCancel,
  initialData,
}: {
  onSubmit: (data: Partial<RecurringTemplate>) => void
  onCancel: () => void
  initialData?: RecurringTemplate
}) {
  const { settings } = useSettings()
  const [formData, setFormData] = useState<Partial<RecurringTemplate>>(
    initialData || {
      name: '',
      amount: 0,
      currency: settings.currency,
      category: 'Subscriptions',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      reminderDays: 3,
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Netflix Subscription"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            type="number"
            required
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {expenseCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
        <select
          value={formData.frequency}
          onChange={(e) => setFormData({ ...formData, frequency: e.target.value as RecurringFrequency })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {frequencyOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {formData.frequency === 'monthly' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month</label>
            <input
              type="number"
              min="1"
              max="31"
              value={formData.dayOfMonth || ''}
              onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 15"
            />
          </div>
        )}

        {formData.frequency === 'weekly' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
            <select
              value={formData.dayOfWeek ?? ''}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="0">Sunday</option>
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reminder (days before)</label>
        <input
          type="number"
          min="0"
          max="30"
          value={formData.reminderDays}
          onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Additional details..."
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {initialData ? 'Update' : 'Create'} Template
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
