'use client'

import { createContext, useContext, ReactNode, useEffect } from 'react'
import { Currency } from '@/utils/currency'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { 
  updateSetting,
  selectSettings,
  UserSettings
} from '@/store/slices/settingsSlice'

interface SettingsContextType {
  settings: UserSettings
  updateCurrency: (currency: Currency) => void
  updateTheme: (theme: 'light' | 'dark' | 'auto') => void
  updateNotifications: (enabled: boolean) => void
  updateLanguage: (language: string) => void
}

// Remove unused defaultSettings - now using Redux defaults

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)

  // Apply theme to document when settings change
  useEffect(() => {
    const applyTheme = () => {
      const html = document.documentElement
      
      if (settings.theme === 'dark') {
        html.classList.add('dark')
        html.classList.remove('light')
      } else if (settings.theme === 'light') {
        html.classList.add('light')
        html.classList.remove('dark')
      } else {
        // Auto mode - check system preference
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
        html.classList.remove('light', 'dark')
        if (isDarkMode) {
          html.classList.add('dark')
        } else {
          html.classList.add('light')
        }
      }
    }

    applyTheme()

    // Listen for system theme changes when in auto mode
    if (settings.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme()
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [settings.theme])

  const updateCurrency = (currency: Currency) => {
    dispatch(updateSetting({ key: 'currency', value: currency.code }))
  }

  const updateTheme = (theme: 'light' | 'dark' | 'auto') => {
    dispatch(updateSetting({ key: 'theme', value: theme }))
  }

  const updateNotifications = (notifications: boolean) => {
    dispatch(updateSetting({ key: 'enableNotifications', value: notifications }))
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