'use client'

import { useEffect, useState } from 'react'
import { Wifi, WifiOff, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Initial check
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    window.location.reload()
  }

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  if (isOnline) {
    // Auto-redirect when back online
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon and Status */}
        <div className="mb-6">
          {isOnline ? (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wifi className="h-10 w-10 text-green-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="h-10 w-10 text-red-600" />
            </div>
          )}
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isOnline ? 'Back Online!' : 'You\'re Offline'}
          </h1>
          
          <p className="text-gray-600">
            {isOnline 
              ? 'Great! Your connection has been restored. Redirecting...'
              : 'Don\'t worry, LifeSync works offline too! Some features may be limited until you\'re back online.'
            }
          </p>
        </div>

        {/* Offline Features */}
        {!isOnline && (
          <div className="mb-8 text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Offline:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                View and add expenses (syncs when online)
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Create and manage todos
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Write and edit notes
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                AI features (queued for when online)
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                Bill splitting with friends
              </li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {!isOnline && (
            <button
              onClick={handleRetry}
              disabled={retryCount > 3}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${retryCount > 0 ? 'animate-spin' : ''}`} />
              <span>
                {retryCount > 3 ? 'Too many retries' : 'Try Again'}
              </span>
            </button>
          )}

          <div className="flex space-x-4">
            <button
              onClick={goBack}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back</span>
            </button>
            
            <Link
              href="/"
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Offline Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your data is saved locally and will sync when online</li>
            <li>• AI features will process once you&apos;re reconnected</li>
            <li>• Install LifeSync as a PWA for better offline experience</li>
          </ul>
        </div>

        {/* Connection Status */}
        <div className="mt-6 text-xs text-gray-500">
          Status: {isOnline ? '🟢 Online' : '🔴 Offline'} | 
          Retry attempts: {retryCount}/3
        </div>
      </div>
    </div>
  )
}

// Metadata handled by layout since this is a client component