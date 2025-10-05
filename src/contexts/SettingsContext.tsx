'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Currency, DEFAULT_CURRENCY, getCurrencyByCode } from '@/utils/currency'

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
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('lifesync-settings')
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings)
          setSettings({
            ...defaultSettings,
            ...parsed,
            defaultCurrency: getCurrencyByCode(parsed.defaultCurrency?.code || 'USD')
          })
        } catch (error) {
          console.error('Failed to parse saved settings:', error)
        }
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifesync-settings', JSON.stringify(settings))
    }
  }, [settings])

  const updateCurrency = (currency: Currency) => {
    setSettings(prev => ({ ...prev, defaultCurrency: currency }))
  }

  const updateTheme = (theme: 'light' | 'dark' | 'system') => {
    setSettings(prev => ({ ...prev, theme }))
  }

  const updateNotifications = (notifications: boolean) => {
    setSettings(prev => ({ ...prev, notifications }))
  }

  const updateLanguage = (language: string) => {
    setSettings(prev => ({ ...prev, language }))
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