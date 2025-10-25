import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'

export interface RecurringTemplate {
  id: string
  name: string
  amount: number
  currency: string
  category: string
  frequency: RecurringFrequency
  startDate: string // ISO date when template starts
  endDate?: string // Optional end date
  dayOfMonth?: number // For monthly (1-31)
  dayOfWeek?: number // For weekly (0-6)
  notes?: string
  isActive: boolean
  lastGenerated?: string // Last time an expense was created from this
  nextDue?: string // Next expected expense date
  reminderDays?: number // Days before to show reminder (default 3)
  createdAt: string
  updatedAt: string
}

interface RecurringTemplatesState {
  templates: RecurringTemplate[]
}

const initialState: RecurringTemplatesState = {
  templates: [],
}

const recurringTemplatesSlice = createSlice({
  name: 'recurringTemplates',
  initialState,
  reducers: {
    addTemplate: (state, action: PayloadAction<RecurringTemplate>) => {
      state.templates.push(action.payload)
    },
    updateTemplate: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<RecurringTemplate> }>
    ) => {
      const template = state.templates.find((t) => t.id === action.payload.id)
      if (template) {
        Object.assign(template, action.payload.updates, {
          updatedAt: new Date().toISOString(),
        })
      }
    },
    deleteTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter((t) => t.id !== action.payload)
    },
    toggleTemplateActive: (state, action: PayloadAction<string>) => {
      const template = state.templates.find((t) => t.id === action.payload)
      if (template) {
        template.isActive = !template.isActive
        template.updatedAt = new Date().toISOString()
      }
    },
    updateLastGenerated: (
      state,
      action: PayloadAction<{ id: string; date: string }>
    ) => {
      const template = state.templates.find((t) => t.id === action.payload.id)
      if (template) {
        template.lastGenerated = action.payload.date
        template.updatedAt = new Date().toISOString()
      }
    },
    bulkImportTemplates: (state, action: PayloadAction<RecurringTemplate[]>) => {
      state.templates = [...state.templates, ...action.payload]
    },
    clearTemplates: (state) => {
      state.templates = []
    },
  },
})

export const {
  addTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplateActive,
  updateLastGenerated,
  bulkImportTemplates,
  clearTemplates,
} = recurringTemplatesSlice.actions

export default recurringTemplatesSlice.reducer

// Selectors
export const selectTemplates = (state: { recurringTemplates: RecurringTemplatesState }) =>
  state.recurringTemplates.templates

export const selectActiveTemplates = (state: { recurringTemplates: RecurringTemplatesState }) =>
  state.recurringTemplates.templates.filter((t) => t.isActive)

// Helper: Calculate next due date based on frequency
export function calculateNextDueDate(
  startDate: string,
  frequency: RecurringFrequency,
  lastGenerated?: string,
  dayOfMonth?: number,
  dayOfWeek?: number
): string {
  const base = lastGenerated ? new Date(lastGenerated) : new Date(startDate)
  const next = new Date(base)

  switch (frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7)
      if (dayOfWeek !== undefined) {
        // Adjust to specific day of week
        const currentDay = next.getDay()
        const diff = dayOfWeek - currentDay
        next.setDate(next.getDate() + diff + (diff < 0 ? 7 : 0))
      }
      break
    case 'biweekly':
      next.setDate(next.getDate() + 14)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      if (dayOfMonth) {
        next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()))
      }
      break
    case 'quarterly':
      next.setMonth(next.getMonth() + 3)
      break
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1)
      break
  }

  return next.toISOString().split('T')[0]
}

// Helper: Get upcoming templates in next N days
export function getUpcomingTemplates(
  templates: RecurringTemplate[],
  daysAhead: number = 30
): Array<RecurringTemplate & { dueDate: string; isOverdue: boolean }> {
  const today = new Date()
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + daysAhead)

  return templates
    .filter((t) => t.isActive)
    .map((t) => {
      const nextDue = calculateNextDueDate(
        t.startDate,
        t.frequency,
        t.lastGenerated,
        t.dayOfMonth,
        t.dayOfWeek
      )
      const dueDate = new Date(nextDue)
      const isOverdue = dueDate < today

      return {
        ...t,
        dueDate: nextDue,
        isOverdue,
      }
    })
    .filter((t) => {
      const due = new Date(t.dueDate)
      return due <= futureDate
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
}

// Helper: Check if template has missed payments
export function getMissedTemplates(
  templates: RecurringTemplate[],
  gracePeriodDays: number = 7
): RecurringTemplate[] {
  const today = new Date()
  const graceCutoff = new Date()
  graceCutoff.setDate(today.getDate() - gracePeriodDays)

  return templates
    .filter((t) => t.isActive)
    .filter((t) => {
      const nextDue = calculateNextDueDate(
        t.startDate,
        t.frequency,
        t.lastGenerated,
        t.dayOfMonth,
        t.dayOfWeek
      )
      const dueDate = new Date(nextDue)
      return dueDate < graceCutoff
    })
}
