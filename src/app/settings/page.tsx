'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Settings,
  Globe,
  Bell,
  Moon,
  Sun,
  Monitor,
  Check,
  Search,
  ChevronDown,
  Download,
  Upload,
  Trash2,
  Database,
  AlertTriangle
} from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { SUPPORTED_CURRENCIES, Currency } from '@/utils/currency'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearExpenses, addExpense } from '@/store/slices/expensesSlice'
import { clearTodos, addTodo } from '@/store/slices/todosSlice'
import { clearGoals, addGoal } from '@/store/slices/goalsSlice'
import { clearNotes, addNote } from '@/store/slices/notesSlice'
import { clearSplits, addFriend, addSplitBill } from '@/store/slices/splitsSlice'
import { resetSettings } from '@/store/slices/settingsSlice'

export default function SettingsPage() {
  const { settings, updateCurrency, updateTheme, updateNotifications } = useSettings()
  const dispatch = useAppDispatch()

  // Get all data from Redux store
  const expenses = useAppSelector((state) => state.expenses.expenses)
  const todos = useAppSelector((state) => state.todos.todos)
  const goals = useAppSelector((state) => state.goals.goals)
  const notes = useAppSelector((state) => state.notes.notes)
  const friends = useAppSelector((state) => state.splits.friends)
  const bills = useAppSelector((state) => state.splits.bills)

  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [currencySearch, setCurrencySearch] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set page title
  useEffect(() => {
    document.title = 'Settings - LifeSync'
  }, [])

  // Redux-based data management functions
  const exportData = () => {
    const allData = {
      expenses,
      todos,
      goals,
      notes,
      friends,
      bills,
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    const dataStr = JSON.stringify(allData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = `lifesync-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importData = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)

      console.log('Parsed backup file:', parsed)

      // Handle both new export format and old localStorage backup format
      let data = parsed

      // Check if it's the old localStorage backup format with nested data object
      if (parsed.data && parsed.version) {
        console.log('Detected old localStorage backup format')
        // Extract from nested structure
        const storageData = parsed.data
        data = {
          expenses: storageData['lifesync-expenses-v1'] || [],
          todos: storageData['lifesync-todos'] || [],
          goals: storageData['lifesync-goals'] || [],
          notes: storageData['lifesync-notes'] || [],
          friends: storageData['lifesync-friends'] || [],
          bills: storageData['lifesync-bills'] || [],
          settings: storageData['lifesync-settings'] || null
        }
        console.log('Converted data:', data)
      }

      let importedCount = 0

      // Import each data type using Redux actions
      if (data.expenses?.length) {
        console.log(`Importing ${data.expenses.length} expenses`)
        data.expenses.forEach((expense: unknown) => {
          dispatch(addExpense(expense as ReturnType<typeof addExpense>['payload']))
          importedCount++
        })
      }

      if (data.todos?.length) {
        console.log(`Importing ${data.todos.length} todos`)
        data.todos.forEach((todo: unknown) => {
          dispatch(addTodo(todo as ReturnType<typeof addTodo>['payload']))
          importedCount++
        })
      }

      if (data.goals?.length) {
        console.log(`Importing ${data.goals.length} goals`)
        data.goals.forEach((goal: unknown) => {
          dispatch(addGoal(goal as ReturnType<typeof addGoal>['payload']))
          importedCount++
        })
      }

      if (data.notes?.length) {
        console.log(`Importing ${data.notes.length} notes`)
        data.notes.forEach((note: unknown) => {
          dispatch(addNote(note as ReturnType<typeof addNote>['payload']))
          importedCount++
        })
      }

      if (data.friends?.length) {
        console.log(`Importing ${data.friends.length} friends`)
        data.friends.forEach((friend: unknown) => {
          dispatch(addFriend(friend as ReturnType<typeof addFriend>['payload']))
          importedCount++
        })
      }

      if (data.bills?.length) {
        console.log(`Importing ${data.bills.length} bills`)
        data.bills.forEach((bill: unknown) => {
          dispatch(addSplitBill(bill as ReturnType<typeof addSplitBill>['payload']))
          importedCount++
        })
      }

      // Import settings if available
      if (data.settings) {
        console.log('Importing settings:', data.settings)
        const importedSettings = data.settings
        if (importedSettings.defaultCurrency) {
          updateCurrency(importedSettings.defaultCurrency)
        }
        if (importedSettings.theme) {
          updateTheme(importedSettings.theme)
        }
        if (typeof importedSettings.notifications === 'boolean') {
          updateNotifications(importedSettings.notifications)
        }
      }

      console.log(`✅ Successfully imported ${importedCount} items`)
      alert(`✅ Successfully imported ${importedCount} items!`)
      return true
    } catch (error) {
      console.error('❌ Import failed:', error)
      alert(`❌ Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return false
    }
  }

  const clearAllData = () => {
    dispatch(clearExpenses())
    dispatch(clearTodos())
    dispatch(clearGoals())
    dispatch(clearNotes())
    dispatch(clearSplits())
    // Reset settings to defaults but keep onboarding status
    dispatch(resetSettings())
  }

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(currency =>
    currency.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
    currency.code.toLowerCase().includes(currencySearch.toLowerCase())
  )

  const handleCurrencySelect = (currency: Currency) => {
    updateCurrency(currency)
    setShowCurrencyDropdown(false)
    setCurrencySearch('')
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const success = await importData(file)
      if (!success) {
        alert('❌ Failed to import data. Please check the file format.')
      }
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearData = () => {
    if (showClearConfirm) {
      clearAllData()
    } else {
      setShowClearConfirm(true)
      // Auto-hide confirmation after 5 seconds
      setTimeout(() => setShowClearConfirm(false), 5000)
    }
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
                      <span className="mr-3">{SUPPORTED_CURRENCIES.find(c => c.code === settings.currency)?.flag || '🌍'}</span>
                      <div>
                        <div className="font-medium">{SUPPORTED_CURRENCIES.find(c => c.code === settings.currency)?.name || settings.currency}</div>
                        <div className="text-sm text-gray-500">
                          {settings.currency} ({SUPPORTED_CURRENCIES.find(c => c.code === settings.currency)?.symbol || settings.currency})
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
                            {settings.currency === currency.code && (
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
                  { value: 'auto', label: 'Auto', icon: Monitor }
                ].map(({ value, label, icon: Icon }) => {
                  const isActive = settings?.theme === value || (!settings?.theme && value === 'auto')
                  return (
                    <button
                      key={value}
                      onClick={() => {
                        console.log('Theme clicked:', value)
                        updateTheme(value as 'light' | 'dark' | 'auto')
                      }}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${isActive
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                    >
                      <Icon size={24} />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <Bell className="mr-3 text-yellow-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            </div>

            <div className="flex items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="font-medium text-gray-900">Push Notifications</div>
                <div className="text-sm text-gray-500 mt-1">
                  Get notified about due tasks, bill reminders, and updates
                </div>
              </div>
              <button
                onClick={() => {
                  console.log('Notification toggle clicked:', !settings.enableNotifications)
                  updateNotifications(!settings.enableNotifications)
                }}
                className={`relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.enableNotifications ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                role="switch"
                aria-checked={settings.enableNotifications}
              >
                <span className="sr-only">Enable notifications</span>
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${settings.enableNotifications ? 'translate-x-7' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <Database className="mr-3 text-indigo-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Data Management</h2>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={exportData}
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download size={20} className="mr-2" />
                  Export Data
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Upload size={20} className="mr-2" />
                  Import Data
                </button>

                <button
                  onClick={handleClearData}
                  className={`flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${showClearConfirm
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                >
                  {showClearConfirm ? (
                    <>
                      <AlertTriangle size={20} className="mr-2" />
                      Confirm Clear All
                    </>
                  ) : (
                    <>
                      <Trash2 size={20} className="mr-2" />
                      Clear All Data
                    </>
                  )}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Data Storage Info</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your data is stored locally in your browser</li>
                  <li>• Export regularly to backup your notes, todos, expenses, and bill splits</li>
                  <li>• Import data to restore from a backup file</li>
                  <li>• Clear all data will permanently delete everything</li>
                </ul>
              </div>
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
                    {SUPPORTED_CURRENCIES.find(c => c.code === settings.currency)?.symbol || settings.currency}{amount.toFixed(SUPPORTED_CURRENCIES.find(c => c.code === settings.currency)?.decimalPlaces || 2)}
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