'use client'

import { useState, useEffect } from 'react'
import { X, Rocket, Code, Zap, Users, GitBranch, Cloud, Database } from 'lucide-react'

interface NotificationBannerProps {
  variant?: 'info' | 'success' | 'warning' | 'learning'
  persistent?: boolean
  autoHide?: boolean
  hideDelay?: number
}

export default function NotificationBanner({ 
  variant = 'learning', 
  persistent = false,
  autoHide = false,
  hideDelay = 10000 
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [currentMessage, setCurrentMessage] = useState(0)

  // Learning journey messages - simplified and beginner-friendly
  const messages = [
    {
      icon: <Rocket className="h-5 w-5" />,
      title: "🚀 LifeSync - Learning AI Integration",
      description: "Integrating AI - basic things - evolving day by day. Simple expense categorization with smart suggestions.",
      badge: "Learning Mode",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <Code className="h-5 w-5" />,
      title: "🤖 Basic AI Features",
      description: "Started with simple pattern matching - will evolve to more advanced AI features soon!",
      badge: "Growing",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "⚡ Step by Step Progress",
      description: "Building modern web app features one step at a time - learning and improving daily.",
      badge: "Progressive",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: <GitBranch className="h-5 w-5" />,
      title: "� Clean & Simple Code",
      description: "Focus on clean, understandable code that beginners can learn from and contribute to.",
      badge: "Beginner Friendly",
      color: "from-purple-500 to-pink-600"
    }
  ]

  // Auto-rotate messages every 8 seconds
  useEffect(() => {
    if (!persistent) {
      const interval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length)
      }, 8000)
      return () => clearInterval(interval)
    }
  }, [persistent, messages.length])

  // Auto-hide functionality
  useEffect(() => {
    if (autoHide && hideDelay) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, hideDelay)
      return () => clearTimeout(timer)
    }
  }, [autoHide, hideDelay])

  // Check if banner was dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('lifesync-banner-dismissed')
    if (dismissed && !persistent) {
      const dismissedTime = parseInt(dismissed)
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
      if (dismissedTime > oneDayAgo) {
        setIsVisible(false)
      }
    }
  }, [persistent])

  const handleDismiss = () => {
    setIsVisible(false)
    if (!persistent) {
      localStorage.setItem('lifesync-banner-dismissed', Date.now().toString())
    }
  }

  const message = messages[currentMessage]

  if (!isVisible) return null

  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    learning: `bg-gradient-to-r ${message.color} text-white`
  }

  return (
    <div className={`relative border-b transition-all duration-500 ${variantStyles[variant]}`}>
      {/* Gradient overlay for learning variant */}
      {variant === 'learning' && (
        <div className="absolute inset-0 bg-black/10" />
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            {/* Icon */}
            <div className={`flex-shrink-0 ${variant === 'learning' ? 'text-white/90' : ''}`}>
              {message.icon}
            </div>
            
            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-3">
                <h3 className={`text-sm font-semibold ${variant === 'learning' ? 'text-white' : ''}`}>
                  {message.title}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  variant === 'learning' 
                    ? 'bg-white/20 text-white border border-white/30' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {message.badge}
                </span>
              </div>
              <p className={`text-sm mt-1 ${variant === 'learning' ? 'text-white/90' : 'text-gray-600'}`}>
                {message.description}
              </p>
            </div>
          </div>
          
          {/* Progress indicators for rotating messages */}
          {!persistent && messages.length > 1 && (
            <div className="hidden sm:flex items-center space-x-2 mx-4">
              {messages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMessage(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentMessage
                      ? variant === 'learning' ? 'bg-white' : 'bg-blue-600'
                      : variant === 'learning' ? 'bg-white/40' : 'bg-gray-300'
                  }`}
                  title={`Message ${index + 1}: ${messages[index].title}`}
                />
              ))}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            {/* Learn More button */}
            <button
              onClick={() => window.open('http://localhost:3000/ai-test.html', '_blank')}
              className={`hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                variant === 'learning'
                  ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              <Zap className="h-3 w-3 mr-1" />
              Try Basic AI
            </button>
            
            {/* GitHub link */}
            <button
              onClick={() => window.open('https://github.com/BalajiJ234/lifesync', '_blank')}
              className={`hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                variant === 'learning'
                  ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <GitBranch className="h-3 w-3 mr-1" />
              View Source
            </button>
            
            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className={`p-1 rounded-md transition-colors ${
                variant === 'learning'
                  ? 'text-white/70 hover:text-white hover:bg-white/20'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Mobile action buttons */}
        <div className="sm:hidden pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => window.open('http://localhost:3000/ai-test.html', '_blank')}
              className={`flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                variant === 'learning'
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              <Zap className="h-3 w-3 mr-1" />
              Try AI
            </button>
            <button
              onClick={() => window.open('https://github.com/BalajiJ234/lifesync', '_blank')}
              className={`flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                variant === 'learning'
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <GitBranch className="h-3 w-3 mr-1" />
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}