'use client'

import { useState } from 'react'
import { 
  Settings, 
  Globe, 
  Bell, 
  Moon, 
  Sun, 
  Monitor,
  Check,
  Search,
  ChevronDown
} from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { SUPPORTED_CURRENCIES, Currency } from '@/utils/currency'

export default function SettingsPage() {
  const { settings, updateCurrency, updateTheme, updateNotifications } = useSettings()
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [currencySearch, setCurrencySearch] = useState('')

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(currency =>
    currency.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
    currency.code.toLowerCase().includes(currencySearch.toLowerCase())
  )

  const handleCurrencySelect = (currency: Currency) => {
    updateCurrency(currency)
    setShowCurrencyDropdown(false)
    setCurrencySearch('')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Settings className="mr-3 text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Currency Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <Globe className="mr-3 text-green-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Currency & Region</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Currency
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{settings.defaultCurrency.flag}</span>
                      <div>
                        <div className="font-medium">{settings.defaultCurrency.name}</div>
                        <div className="text-sm text-gray-500">
                          {settings.defaultCurrency.code} ({settings.defaultCurrency.symbol})
                        </div>
                      </div>
                    </div>
                    <ChevronDown 
                      size={20} 
                      className={`text-gray-400 transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} 
                    />
                  </button>

                  {showCurrencyDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                      <div className="p-3 border-b">
                        <div className="relative">
                          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search currencies..."
                            value={currencySearch}
                            onChange={(e) => setCurrencySearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredCurrencies.map((currency) => (
                          <button
                            key={currency.code}
                            onClick={() => handleCurrencySelect(currency)}
                            className="w-full px-4 py-3 hover:bg-gray-50 flex items-center justify-between text-left"
                          >
                            <div className="flex items-center">
                              <span className="mr-3">{currency.flag}</span>
                              <div>
                                <div className="font-medium">{currency.name}</div>
                                <div className="text-sm text-gray-500">
                                  {currency.code} ({currency.symbol})
                                </div>
                              </div>
                            </div>
                            {settings.defaultCurrency.code === currency.code && (
                              <Check size={18} className="text-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <Monitor className="mr-3 text-purple-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: Monitor }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => updateTheme(value as 'light' | 'dark' | 'system')}
                    className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                      settings.theme === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <Bell className="mr-3 text-yellow-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Push Notifications</div>
                <div className="text-sm text-gray-500">
                  Get notified about due tasks, bill reminders, and updates
                </div>
              </div>
              <button
                onClick={() => updateNotifications(!settings.notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Currency Preview */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[100, 1000, 5000, 10000].map((amount) => (
                <div key={amount} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Sample Amount</div>
                  <div className="font-semibold text-gray-900">
                    {settings.defaultCurrency.symbol}{amount.toFixed(settings.defaultCurrency.decimalPlaces)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}