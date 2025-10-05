'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useDataStorage } from '@/hooks/useLocalStorage'
import { 
  StickyNote, 
  DollarSign, 
  CheckSquare, 
  Users,
  Plus,
  TrendingUp,
  Clock,
  Calendar,
  Target,
  Activity 
} from 'lucide-react'

// Data interfaces
interface ActivityItem {
  type: string
  desc: string
  time: string
  amount?: string
}

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
}

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
}

interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  date: string
  createdAt: Date
}

interface Friend {
  id: string
  name: string
}

interface SplitBill {
  id: string
  totalAmount: number
  settled: boolean
  participants: string[]
  createdAt: Date
}

const useAppData = () => {
  // Load real data from localStorage
  const [notes] = useDataStorage<Note[]>('notes', [])
  const [todos] = useDataStorage<Todo[]>('todos', [])
  const [expenses] = useDataStorage<Expense[]>('expenses', [])
  const [friends] = useDataStorage<Friend[]>('friends', [])
  const [bills] = useDataStorage<SplitBill[]>('bills', [])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Calculate real statistics
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
  })
  
  const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const activeTodos = todos.filter(todo => !todo.completed)
  const completedTodos = todos.filter(todo => todo.completed)
  const pendingBills = bills.filter(bill => !bill.settled)
  const pendingAmount = pendingBills.reduce((sum, bill) => sum + bill.totalAmount, 0)

  // Generate recent activity from real data
  const generateRecentActivity = (): ActivityItem[] => {
    const activities: ActivityItem[] = []
    
    // Add recent expenses
    expenses.slice(0, 2).forEach(expense => {
      activities.push({
        type: 'expense',
        desc: `Added ${expense.description}`,
        time: formatTimeAgo(expense.createdAt),
        amount: `$${expense.amount.toFixed(2)}`
      })
    })
    
    // Add recent todos
    todos.slice(0, 2).forEach(todo => {
      activities.push({
        type: 'todo',
        desc: todo.completed ? `Completed "${todo.text}"` : `Added "${todo.text}"`,
        time: formatTimeAgo(todo.createdAt)
      })
    })
    
    // Add recent notes
    notes.slice(0, 1).forEach(note => {
      activities.push({
        type: 'note',
        desc: `Created "${note.title}"`,
        time: formatTimeAgo(note.createdAt)
      })
    })
    
    // Add recent splits
    bills.slice(0, 1).forEach(bill => {
      activities.push({
        type: 'split',
        desc: `Split bill: ${bill.id}`,
        time: formatTimeAgo(bill.createdAt),
        amount: `$${bill.totalAmount.toFixed(2)}`
      })
    })
    
    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)
  }

  const formatTimeAgo = (date: Date | string) => {
    if (!isClient) return 'Recently'
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  return {
    notes: isClient ? notes.length : 0,
    expenses: { 
      thisMonth: isClient ? thisMonthTotal : 0,
      count: isClient ? expenses.length : 0
    },
    todos: { 
      active: isClient ? activeTodos.length : 0,
      completed: isClient ? completedTodos.length : 0
    },
    splits: { 
      pending: isClient ? pendingAmount : 0,
      friends: isClient ? friends.length : 0
    },
    recentActivity: isClient ? generateRecentActivity() : []
  }
}

export default function Home() {
  const appData = useAppData()

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'expense': return <DollarSign size={16} className="text-green-600" />
      case 'todo': return <CheckSquare size={16} className="text-blue-600" />
      case 'note': return <StickyNote size={16} className="text-yellow-600" />
      case 'split': return <Users size={16} className="text-purple-600" />
      default: return <Activity size={16} className="text-gray-600" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to LifeSync
        </h1>
        <p className="text-xl text-gray-600">
          Your personal life management hub - expenses, todos, notes, and more
        </p>
        <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={16} />
            <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Notes</p>
              <p className="text-2xl font-bold text-gray-900">{appData.notes}</p>
              <p className="text-xs text-gray-500 mt-1">Quick thoughts & ideas</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <StickyNote className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">${appData.expenses.thisMonth}</p>
              <p className="text-xs text-gray-500 mt-1">{appData.expenses.count} expenses tracked</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Todos</p>
              <p className="text-2xl font-bold text-gray-900">{appData.todos.active}</p>
              <p className="text-xs text-gray-500 mt-1">{appData.todos.completed} completed</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CheckSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Splits</p>
              <p className="text-2xl font-bold text-gray-900">${appData.splits.pending}</p>
              <p className="text-xs text-gray-500 mt-1">{appData.splits.friends} friends</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link 
          href="/notes"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-yellow-100 rounded-full group-hover:bg-yellow-200 transition-colors">
              <StickyNote className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Notes</h3>
              <p className="text-sm text-gray-600">Jot down thoughts and ideas</p>
            </div>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </div>
          </div>
        </Link>

        <Link 
          href="/expenses"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Track Expenses</h3>
              <p className="text-sm text-gray-600">Monitor your spending</p>
            </div>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              <Plus className="h-4 w-4 mr-1" />
              Add Expense
            </div>
          </div>
        </Link>

        <Link 
          href="/todos"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
              <CheckSquare className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Manage Tasks</h3>
              <p className="text-sm text-gray-600">Stay organized and productive</p>
            </div>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </div>
          </div>
        </Link>

        <Link 
          href="/splits"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Split Bills</h3>
              <p className="text-sm text-gray-600">Share expenses with friends</p>
            </div>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              <Plus className="h-4 w-4 mr-1" />
              Split Bill
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Activity size={16} />
              <span>Last 7 days</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          {appData.recentActivity.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity yet. Start by adding a note, expense, or task!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.desc}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      {activity.amount && (
                        <span className="text-xs font-medium text-green-600">{activity.amount}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.type === 'expense' ? 'bg-green-100 text-green-800' :
                      activity.type === 'todo' ? 'bg-blue-100 text-blue-800' :
                      activity.type === 'note' ? 'bg-yellow-100 text-yellow-800' :
                      activity.type === 'split' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.type}
                    </span>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <Link 
                  href="/todos" 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all activity →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Getting Started Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="space-y-2">
                <p>📝 <strong>Notes:</strong> Use Ctrl+Enter for quick saves</p>
                <p>💰 <strong>Expenses:</strong> Set categories for better tracking</p>
              </div>
              <div className="space-y-2">
                <p>✅ <strong>Todos:</strong> Set priorities and due dates</p>
                <p>👥 <strong>Splits:</strong> Add friends first, then split bills</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}