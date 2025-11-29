'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Home,
  DollarSign,
  TrendingUp,
  Target,
  Settings,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from 'lucide-react'
import Logo from './Logo'

const navItems = [
  { href: '/advisor', label: 'Advisor', icon: Lightbulb },
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/expenses', label: 'Expenses', icon: DollarSign, hasSubmenu: true },
  { href: '/income', label: 'Income', icon: TrendingUp },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const expenseSubmenuItems = [
  { href: '/expenses', label: 'My Expenses' },
  { href: '/splits', label: 'Bill Splitting' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [showExpenseSubmenu, setShowExpenseSubmenu] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="md" showText={true} animated={true} />

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8 relative">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.hasSubmenu && (pathname === '/expenses' || pathname === '/splits' || pathname.startsWith('/expenses/')))

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
            <button className="text-gray-600 hover:text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden border-t pt-4 pb-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.hasSubmenu && (pathname === '/expenses' || pathname === '/splits'))

            if (item.hasSubmenu) {
              return (
                <div key={item.href} className="space-y-2">
                  <button
                    onClick={() => setShowExpenseSubmenu(!showExpenseSubmenu)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    {showExpenseSubmenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showExpenseSubmenu && (
                    <div className="ml-4 space-y-1">
                      {expenseSubmenuItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`block px-3 py-2 rounded-md text-sm transition-colors ${pathname === subItem.href
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
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
      </div>
    </nav>
  )
}