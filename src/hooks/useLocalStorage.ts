import { useState, useEffect } from 'react'

/**
 * Custom hook for persisting state to localStorage
 * @param key - The localStorage key
 * @param initialValue - The initial value if no stored value exists
 * @returns [value, setValue] - Same interface as useState
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prevValue: T) => T)) => void] {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((prevValue: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

/**
 * Hook for data that should be backed up to localStorage with versioning
 */
export function useDataStorage<T>(key: string, initialValue: T, version: number = 1) {
  const fullKey = `lifesync-${key}-v${version}`
  
  // Migration logic for version changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Check for old versions and migrate if needed
    const oldKeys = Object.keys(localStorage).filter(k => k.startsWith(`lifesync-${key}-v`) && k !== fullKey)
    
    if (oldKeys.length > 0) {
      // Get the most recent old version
      const mostRecentOldKey = oldKeys.sort().pop()
      if (mostRecentOldKey) {
        try {
          const oldData = localStorage.getItem(mostRecentOldKey)
          if (oldData && !localStorage.getItem(fullKey)) {
            // Migrate old data to new version
            localStorage.setItem(fullKey, oldData)
            console.log(`Migrated data from ${mostRecentOldKey} to ${fullKey}`)
          }
          // Clean up old versions
          oldKeys.forEach(oldKey => localStorage.removeItem(oldKey))
        } catch (error) {
          console.error('Error migrating data:', error)
        }
      }
    }
  }, [fullKey, key])
  
  return useLocalStorage(fullKey, initialValue)
}

/**
 * Hook for exporting/importing data
 */
export function useDataBackup() {
  const exportData = () => {
    const data: Record<string, unknown> = {}
    
    // Get all LifeSync data from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('lifesync-')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '{}')
        } catch (error) {
          console.error(`Error parsing ${key}:`, error)
        }
      }
    })
    
    const exportObject = {
      version: 1,
      timestamp: new Date().toISOString(),
      data
    }
    
    // Create downloadable file
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `wealthpulse-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  
  const importData = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string)
          
          if (importData.version && importData.data) {
            // Import all data
            Object.entries(importData.data).forEach(([key, value]) => {
              localStorage.setItem(key, JSON.stringify(value))
            })
            
            // Reload the page to reflect changes
            window.location.reload()
            resolve(true)
          } else {
            resolve(false)
          }
        } catch (error) {
          console.error('Error importing data:', error)
          resolve(false)
        }
      }
      reader.readAsText(file)
    })
  }
  
  const clearAllData = () => {
    const keysToRemove = Object.keys(localStorage).filter(key => key.startsWith('lifesync-'))
    keysToRemove.forEach(key => localStorage.removeItem(key))
    window.location.reload()
  }
  
  return { exportData, importData, clearAllData }
}