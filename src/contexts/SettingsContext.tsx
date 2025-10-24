'use client'

import { createContext, useContext, ReactNode } from 'react'
import { Currency, DEFAULT_CURRENCY } from '@/utils/currency'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { 
  updateSetting,
  selectSettings
} from '@/store/slices/settingsSlice'

interface UserSettings {
  defaultCurrency: Currency
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  language: string
}

interface SettingsContextType {
  settings: UserSettings
  updateCurrency: (currency: Currency) => void
  updateTheme: (theme: 'light' | 'dark' | 'system') => void
  updateNotifications: (enabled: boolean) => void
  updateLanguage: (language: string) => void
}

const defaultSettings: UserSettings = {
  defaultCurrency: DEFAULT_CURRENCY,
  theme: 'light',
  notifications: true,
  language: 'en'
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)

  const updateCurrency = (currency: Currency) => {
    dispatch(updateSetting({ key: 'defaultCurrency', value: currency }))
  }

  const updateTheme = (theme: 'light' | 'dark' | 'system') => {
    dispatch(updateSetting({ key: 'theme', value: theme }))
  }

  const updateNotifications = (notifications: boolean) => {
    dispatch(updateSetting({ key: 'notifications', value: notifications }))
  }

  const updateLanguage = (language: string) => {
    dispatch(updateSetting({ key: 'language', value: language }))
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      updateCurrency,
      updateTheme,
      updateNotifications,
      updateLanguage
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}