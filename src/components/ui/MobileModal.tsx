'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface ResponsiveModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'full' | 'large' | 'medium' | 'small'
}

export default function ResponsiveModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'large' 
}: ResponsiveModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      // Re-enable body scroll when modal closes
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(onClose, 300) // Match animation duration
  }

  const getDesktopSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-96 max-h-96'
      case 'medium':
        return 'w-2/3 max-w-md max-h-[70vh]'
      case 'large':
        return 'w-full max-w-2xl max-h-[80vh]'
      case 'full':
        return 'w-full max-w-4xl max-h-[90vh]'
      default:
        return 'w-full max-w-2xl max-h-[80vh]'
    }
  }

  const getMobileSizeClasses = () => {
    switch (size) {
      case 'full':
        return 'h-full'
      case 'medium':
        return 'h-3/4 rounded-t-3xl'
      case 'small':
        return 'h-1/2 rounded-t-3xl'
      case 'large':
      default:
        return 'h-5/6 rounded-t-3xl'
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Desktop Modal */}
      {!isMobile && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
            isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className={`bg-white rounded-2xl shadow-2xl ${getDesktopSizeClasses()} flex flex-col`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Modal */}
      {isMobile && (
        <div 
          className={`fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 transition-transform duration-300 ease-out ${
            getMobileSizeClasses()
          } ${
            isAnimating ? 'transform translate-y-0' : 'transform translate-y-full'
          } flex flex-col`}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      )}
    </>
  )
}

// Hook for managing modal state
export function useMobileModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)
  const toggleModal = () => setIsOpen(!isOpen)

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  }
}