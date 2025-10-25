'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  Home,
  StickyNote,
  DollarSign,
  CheckSquare,
  Settings,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Menu,
  X
} from 'lucide-react'
import Logo from './Logo'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/income', label: 'Income', icon: TrendingUp },
  { href: '/expenses', label: 'Expenses', icon: DollarSign, hasSubmenu: true },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/notes', label: 'Notes', icon: StickyNote },
  { href: '/todos', label: 'Todos', icon: CheckSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const expenseSubmenuItems = [
  { href: '/expenses', label: 'My Expenses' },
  { href: '/splits', label: 'Bill Splitting' },
]

// Bottom tab items for mobile (main items only)
const bottomTabItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/income', label: 'Income', icon: TrendingUp },
  { href: '/expenses', label: 'Expenses', icon: DollarSign },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function MobileNavigation() {
  const pathname = usePathname()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showExpenseSubmenu, setShowExpenseSubmenu] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  return (
    <>
      {/* Desktop/Tablet Top Navigation */}
      <nav className="md:block bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Logo size="md" showText={true} animated={true} />

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex space-x-8 relative">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.hasSubmenu && (pathname === '/expenses' || pathname === '/splits'))

                if (item.hasSubmenu) {
                  return (
                    <div key={item.href} className="relative">
                      <button
                        onClick={() => setShowExpenseSubmenu(!showExpenseSubmenu)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                          }`}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                        {showExpenseSubmenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {showExpenseSubmenu && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          {expenseSubmenuItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-md last:rounded-b-md ${pathname === subItem.href
                                  ? 'text-blue-600 bg-blue-50'
                                  : 'text-gray-600 hover:text-blue-600'
                                }`}
                              onClick={() => setShowExpenseSubmenu(false)}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-gray-600 hover:text-blue-600 p-2"
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-out Menu */}
        {showMobileMenu && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Slide-out Menu */}
            <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || (item.hasSubmenu && (pathname === '/expenses' || pathname === '/splits'))

                    if (item.hasSubmenu) {
                      return (
                        <div key={item.href} className="space-y-2">
                          <button
                            onClick={() => setShowExpenseSubmenu(!showExpenseSubmenu)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                              }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon size={22} />
                              <span>{item.label}</span>
                            </div>
                            {showExpenseSubmenu ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>

                          {showExpenseSubmenu && (
                            <div className="ml-6 space-y-2">
                              {expenseSubmenuItems.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  className={`block px-4 py-3 rounded-lg text-base transition-colors ${pathname === subItem.href
                                      ? 'text-blue-600 bg-blue-50'
                                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                    }`}
                                  onClick={() => {
                                    setShowExpenseSubmenu(false)
                                    setShowMobileMenu(false)
                                  }}
                                >
                                  {subItem.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                          }`}
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <Icon size={22} />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Mobile Bottom Tab Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 md:hidden">
          <div className="flex items-center justify-around py-2">
            {bottomTabItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href ||
                (item.href === '/expenses' && (pathname === '/expenses' || pathname === '/splits'))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 text-center transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'
                    }`}
                >
                  <Icon size={20} className="mb-1" />
                  <span className="text-xs font-medium truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}