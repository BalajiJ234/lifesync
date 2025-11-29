import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface UserSettings {
  // Display preferences
  theme: 'light' | 'dark' | 'auto'
  currency: 'AED' | 'USD' | 'EUR' | 'GBP' | 'INR'
  language: 'en' | 'ar' | 'hi'
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  
  // Privacy & Security
  enableBiometric: boolean
  enableEncryption: boolean
  autoLockTimeout: number // minutes
  
  // Notifications
  enableNotifications: boolean
  expenseReminders: boolean
  goalReminders: boolean
  billReminders: boolean
  
  // AI Features
  enableAiCategorization: boolean
  enableAiSuggestions: boolean
  enableAiAnalytics: boolean
  aiConfidenceThreshold: number
  
  // Sync & Backup
  enableCloudSync: boolean
  enableAutoBackup: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  
  // Categories & Budgets
  customCategories: string[]
  monthlyBudget: number
  budgetAlerts: boolean
  
  // Financial Advisor
  savingsRate: number // 0.20 = 20%
  emergencyFundMonths: number // 3-6 months
  
  // Family Remittance
  familyRemittanceEnabled: boolean
  familyRemittanceAmount: number
  familyRemittanceDay: number // day of month
  familyRemittanceCurrency: string
  
  // Export/Import
  defaultExportFormat: 'csv' | 'xlsx' | 'pdf' | 'json'
  includeReceipts: boolean
  
  // First-time setup
  hasCompletedOnboarding: boolean
  lastSyncedAt?: string
}

interface SettingsState {
  settings: UserSettings
  loading: boolean
  error: string | null
}

const defaultSettings: UserSettings = {
  // Display preferences
  theme: 'auto',
  currency: 'AED',
  language: 'en',
  dateFormat: 'DD/MM/YYYY',
  
  // Privacy & Security
  enableBiometric: false,
  enableEncryption: true,
  autoLockTimeout: 15,
  
  // Notifications
  enableNotifications: true,
  expenseReminders: true,
  goalReminders: true,
  billReminders: true,
  
  // AI Features
  enableAiCategorization: true,
  enableAiSuggestions: true,
  enableAiAnalytics: true,
  aiConfidenceThreshold: 0.7,
  
  // Sync & Backup
  enableCloudSync: false,
  enableAutoBackup: true,
  backupFrequency: 'weekly',
  
  // Categories & Budgets
  customCategories: [],
  monthlyBudget: 0,
  budgetAlerts: true,
  
  // Financial Advisor
  savingsRate: 0.20, // 20% default
  emergencyFundMonths: 6, // 6 months default
  
  // Family Remittance
  familyRemittanceEnabled: false,
  familyRemittanceAmount: 0,
  familyRemittanceDay: 1, // 1st of month
  familyRemittanceCurrency: 'AED',
  
  // Export/Import
  defaultExportFormat: 'csv',
  includeReceipts: false,
  
  // First-time setup
  hasCompletedOnboarding: false,
}

const initialState: SettingsState = {
  settings: defaultSettings,
  loading: false,
  error: null,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSetting: <K extends keyof UserSettings>(
      state: SettingsState,
      action: PayloadAction<{ key: K; value: UserSettings[K] }>
    ) => {
      const { key, value } = action.payload
      state.settings[key] = value
    },
    updateMultipleSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      state.settings = { ...state.settings, ...action.payload }
    },
    addCustomCategory: (state, action: PayloadAction<string>) => {
      const category = action.payload.trim()
      if (category && !state.settings.customCategories.includes(category)) {
        state.settings.customCategories.push(category)
      }
    },
    removeCustomCategory: (state, action: PayloadAction<string>) => {
      state.settings.customCategories = state.settings.customCategories.filter(
        cat => cat !== action.payload
      )
    },
    completeOnboarding: (state) => {
      state.settings.hasCompletedOnboarding = true
    },
    updateLastSyncTime: (state) => {
      state.settings.lastSyncedAt = new Date().toISOString()
    },
    resetSettings: (state) => {
      state.settings = { ...defaultSettings, hasCompletedOnboarding: true }
    },
    importSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      state.settings = { ...defaultSettings, ...action.payload }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  updateSetting,
  updateMultipleSettings,
  addCustomCategory,
  removeCustomCategory,
  completeOnboarding,
  updateLastSyncTime,
  resetSettings,
  importSettings,
  setLoading,
  setError,
} = settingsSlice.actions

// Selectors
export const selectSettings = (state: { settings: SettingsState }) => state.settings.settings
export const selectSettingsLoading = (state: { settings: SettingsState }) => state.settings.loading
export const selectSettingsError = (state: { settings: SettingsState }) => state.settings.error

// Specific setting selectors
export const selectTheme = (state: { settings: SettingsState }) => state.settings.settings.theme
export const selectCurrency = (state: { settings: SettingsState }) => state.settings.settings.currency
export const selectLanguage = (state: { settings: SettingsState }) => state.settings.settings.language
export const selectDateFormat = (state: { settings: SettingsState }) => state.settings.settings.dateFormat

export const selectAiSettings = (state: { settings: SettingsState }) => ({
  enableAiCategorization: state.settings.settings.enableAiCategorization,
  enableAiSuggestions: state.settings.settings.enableAiSuggestions,
  enableAiAnalytics: state.settings.settings.enableAiAnalytics,
  aiConfidenceThreshold: state.settings.settings.aiConfidenceThreshold,
})

export const selectNotificationSettings = (state: { settings: SettingsState }) => ({
  enableNotifications: state.settings.settings.enableNotifications,
  expenseReminders: state.settings.settings.expenseReminders,
  goalReminders: state.settings.settings.goalReminders,
  billReminders: state.settings.settings.billReminders,
})

export const selectPrivacySettings = (state: { settings: SettingsState }) => ({
  enableBiometric: state.settings.settings.enableBiometric,
  enableEncryption: state.settings.settings.enableEncryption,
  autoLockTimeout: state.settings.settings.autoLockTimeout,
})

export const selectSyncSettings = (state: { settings: SettingsState }) => ({
  enableCloudSync: state.settings.settings.enableCloudSync,
  enableAutoBackup: state.settings.settings.enableAutoBackup,
  backupFrequency: state.settings.settings.backupFrequency,
  lastSyncedAt: state.settings.settings.lastSyncedAt,
})

export const selectBudgetSettings = (state: { settings: SettingsState }) => ({
  monthlyBudget: state.settings.settings.monthlyBudget,
  budgetAlerts: state.settings.settings.budgetAlerts,
  customCategories: state.settings.settings.customCategories,
})

export const selectHasCompletedOnboarding = (state: { settings: SettingsState }) => 
  state.settings.settings.hasCompletedOnboarding

export default settingsSlice.reducer