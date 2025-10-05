'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Users, 
  DollarSign, 
  Trash2, 
  UserPlus,
  Calculator,
  Check,
  X,
  Send,
  Clock,
  CheckCircle,
  Percent,
  Equal
} from 'lucide-react'
import { useDataStorage } from '@/hooks/useLocalStorage'

interface Friend {
  id: string
  name: string
  email: string
  avatar: string
  createdAt: Date
}

interface SplitBill {
  id: string
  description: string
  totalAmount: number
  currency?: string
  paidBy: string // friend id or 'self' for logged in person
  participants: string[] // friend ids
  splitType: 'equal' | 'percentage' | 'custom'
  customAmounts?: Record<string, number>
  percentages?: Record<string, number>
  date: string
  settled: boolean
  createdAt: Date
  notes?: string
}

interface Settlement {
  fromId: string
  toId: string
  amount: number
}

const defaultAvatars = [
  '👤', '👨', '👩', '🧑', '👱', '👶', '🧓', '👴', '👵', '🤵', '👰', '🤴', '👸', '🦸', '🦹', '🧙'
]

export default function SplitsPage() {
  const [friends, setFriends] = useDataStorage<Friend[]>('friends', [])
  const [bills, setBills] = useDataStorage<SplitBill[]>('bills', [])
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [showAddBill, setShowAddBill] = useState(false)
  const [activeTab, setActiveTab] = useState<'bills' | 'friends' | 'balances'>('bills')
  const [shareMode, setShareMode] = useState<'equal' | 'percentage'>('equal')
  const [percentages, setPercentages] = useState<Record<string, number>>({})
  const [isClient, setIsClient] = useState(false)
  
  // Client-side only rendering to prevent hydration errors
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Data migration effect to handle existing records
  useEffect(() => {
    if (isClient && bills.length > 0) {
      // Migrate existing bills to include new fields
      const migratedBills = bills.map(bill => ({
        ...bill,
        splitType: bill.splitType || 'equal',
        customAmounts: bill.customAmounts || {},
        percentages: bill.percentages || {},
        currency: bill.currency || undefined,
        paidBy: bill.paidBy === 'me' ? 'self' : bill.paidBy // Migrate old 'me' to 'self'
      }))
      
      // Check if migration is needed
      const needsMigration = bills.some(bill => 
        !bill.splitType || 
        !bill.customAmounts || 
        !bill.percentages || 
        bill.paidBy === 'me'
      )
      
      if (needsMigration) {
        setBills(migratedBills)
      }
    }
  }, [isClient, bills.length]) // Only run when client is ready and bills exist
  
  // Friend form
  const [friendForm, setFriendForm] = useState({
    name: '',
    email: ''
  })
  
  // Bill form  
  const [billForm, setBillForm] = useState({
    description: '',
    totalAmount: '',
    paidBy: 'self', // Default to logged-in person
    participants: [] as string[],
    splitType: 'equal' as 'equal' | 'percentage' | 'custom',
    customAmounts: {} as Record<string, number>,
    percentages: {} as Record<string, number>,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const addFriend = () => {
    if (friendForm.name.trim()) {
      const friend: Friend = {
        id: Date.now().toString(),
        name: friendForm.name.trim(),
        email: friendForm.email.trim(),
        avatar: defaultAvatars[friends.length % defaultAvatars.length],
        createdAt: new Date()
      }
      setFriends([...friends, friend])
      setFriendForm({ name: '', email: '' })
      setShowAddFriend(false)
    }
  }

  const deleteFriend = (id: string) => {
    setFriends(friends.filter(f => f.id !== id))
    // Remove from any bills
    setBills(bills.filter(bill => 
      bill.paidBy !== id && !bill.participants.includes(id)
    ))
  }

  const addBill = () => {
    if (billForm.description.trim() && billForm.totalAmount && billForm.paidBy && billForm.participants.length > 0) {
      const totalAmount = parseFloat(billForm.totalAmount)
      let customAmounts: Record<string, number> = {}
      
      if (billForm.splitType === 'equal') {
        const perPerson = totalAmount / billForm.participants.length
        billForm.participants.forEach(id => {
          customAmounts[id] = perPerson
        })
      } else if (billForm.splitType === 'percentage') {
        billForm.participants.forEach(id => {
          const percentage = billForm.percentages[id] || 0
          customAmounts[id] = (totalAmount * percentage) / 100
        })
      } else {
        customAmounts = billForm.customAmounts
      }

      const bill: SplitBill = {
        id: Date.now().toString(),
        description: billForm.description.trim(),
        totalAmount,
        paidBy: billForm.paidBy,
        participants: billForm.participants,
        splitType: billForm.splitType,
        customAmounts,
        percentages: billForm.splitType === 'percentage' ? billForm.percentages : undefined,
        date: billForm.date,
        settled: false,
        notes: billForm.notes.trim() || undefined,
        createdAt: new Date()
      }
      
      setBills([bill, ...bills])
      resetBillForm()
      setShowAddBill(false)
    }
  }

  const resetBillForm = () => {
    setBillForm({
      description: '',
      totalAmount: '',
      paidBy: 'self',
      participants: [],
      splitType: 'equal',
      customAmounts: {},
      percentages: {},
      date: new Date().toISOString().split('T')[0],
      notes: ''
    })
    setPercentages({})
  }

  const toggleParticipant = (friendId: string) => {
    const participants = billForm.participants.includes(friendId)
      ? billForm.participants.filter(id => id !== friendId)
      : [...billForm.participants, friendId]
    
    setBillForm({ ...billForm, participants })
  }

  const updateCustomAmount = (friendId: string, amount: number) => {
    setBillForm({
      ...billForm,
      customAmounts: {
        ...billForm.customAmounts,
        [friendId]: amount
      }
    })
  }

  const updatePercentage = (friendId: string, percentage: number) => {
    setBillForm({
      ...billForm,
      percentages: {
        ...billForm.percentages,
        [friendId]: percentage
      }
    })
  }

  const toggleBillSettled = (billId: string) => {
    setBills(bills.map(bill => 
      bill.id === billId ? { ...bill, settled: !bill.settled } : bill
    ))
  }

  const deleteBill = (billId: string) => {
    setBills(bills.filter(bill => bill.id !== billId))
  }

  // Calculate balances
  const calculateBalances = (): Settlement[] => {
    const balances: Record<string, number> = {}
    
    // Initialize balances
    friends.forEach(friend => {
      balances[friend.id] = 0
    })
    
    // Calculate net balances from all bills
    bills.forEach(bill => {
      if (bill.settled) return
      
      // Person who paid gets positive balance
      balances[bill.paidBy] += bill.totalAmount
      
      // Participants get negative balance for their share
      bill.participants.forEach(participantId => {
        const share = bill.customAmounts?.[participantId] || 0
        balances[participantId] -= share
      })
    })
    
    // Convert to settlements (who owes whom)
    const settlements: Settlement[] = []
    const positiveBalances = Object.entries(balances).filter(([, amount]) => amount > 0)
    const negativeBalances = Object.entries(balances).filter(([, amount]) => amount < 0)
    
    positiveBalances.forEach(([creditorId, creditAmount]) => {
      negativeBalances.forEach(([debtorId, debtAmount]) => {
        if (creditAmount > 0 && debtAmount < 0) {
          const settlementAmount = Math.min(creditAmount, Math.abs(debtAmount))
          if (settlementAmount > 0) {
            settlements.push({
              fromId: debtorId,
              toId: creditorId,
              amount: settlementAmount
            })
            balances[creditorId] -= settlementAmount
            balances[debtorId] += settlementAmount
          }
        }
      })
    })
    
    return settlements.filter(s => s.amount > 0.01) // Filter out tiny amounts
  }

  const getFriendById = (id: string) => friends.find(f => f.id === id)

  const stats = {
    totalBills: bills.length,
    activeBills: bills.filter(b => !b.settled).length,
    totalAmount: bills.reduce((sum, bill) => sum + bill.totalAmount, 0),
    yourShare: 0 // Would calculate based on current user
  }

  const settlements = calculateBalances()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Bill Splitter</h1>
        <p className="text-gray-600">Split expenses and manage shared costs with friends</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBills}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Bills</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeBills}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Friends</p>
              <p className="text-2xl font-bold text-gray-900">{friends.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {(['bills', 'friends', 'balances'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Bills Tab */}
          {activeTab === 'bills' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Split Bills</h2>
                <button
                  onClick={() => setShowAddBill(true)}
                  disabled={friends.length === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={20} />
                  <span>Split Bill</span>
                </button>
              </div>

              {friends.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Add friends first</h3>
                  <p className="text-gray-600 mb-4">You need to add friends before you can split bills</p>
                  <button
                    onClick={() => setActiveTab('friends')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Go to Friends tab →
                  </button>
                </div>
              )}

              {/* Add Bill Form */}
              {showAddBill && friends.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Split a New Bill</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <input
                          type="text"
                          value={billForm.description}
                          onChange={(e) => setBillForm({...billForm, description: e.target.value})}
                          placeholder="e.g., Dinner at Restaurant"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Amount *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={billForm.totalAmount}
                          onChange={(e) => setBillForm({...billForm, totalAmount: e.target.value})}
                          placeholder="0.00"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Paid By *
                        </label>
                        <select
                          value={billForm.paidBy}
                          onChange={(e) => setBillForm({...billForm, paidBy: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="self">🙋‍♂️ Me (You)</option>
                          {friends.map(friend => (
                            <option key={friend.id} value={friend.id}>
                              {friend.avatar} {friend.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          value={billForm.date}
                          onChange={(e) => setBillForm({...billForm, date: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Split Between *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {friends.map(friend => (
                          <label
                            key={friend.id}
                            className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                              billForm.participants.includes(friend.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={billForm.participants.includes(friend.id)}
                              onChange={() => toggleParticipant(friend.id)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-lg">{friend.avatar}</span>
                            <span className="font-medium">{friend.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Split Type
                      </label>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="equal"
                            checked={billForm.splitType === 'equal'}
                            onChange={(e) => setBillForm({...billForm, splitType: e.target.value as 'equal'})}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <Equal className="w-4 h-4 ml-2 mr-1" />
                          <span>Split Equally</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="percentage"
                            checked={billForm.splitType === 'percentage'}
                            onChange={(e) => setBillForm({...billForm, splitType: e.target.value as 'percentage'})}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <Percent className="w-4 h-4 ml-2 mr-1" />
                          <span>By Percentage</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="custom"
                            checked={billForm.splitType === 'custom'}
                            onChange={(e) => setBillForm({...billForm, splitType: e.target.value as 'custom'})}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <DollarSign className="w-4 h-4 ml-2 mr-1" />
                          <span>Custom Amounts</span>
                        </label>
                      </div>
                    </div>

                    {billForm.splitType === 'percentage' && billForm.participants.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Percentage Split
                        </label>
                        <div className="space-y-2">
                          {billForm.participants.map(participantId => {
                            const friend = getFriendById(participantId)
                            const percentage = billForm.percentages[participantId] || 0
                            const amount = parseFloat(billForm.totalAmount) * percentage / 100
                            return (
                              <div key={participantId} className="flex items-center space-x-3">
                                <span className="text-lg">{friend?.avatar}</span>
                                <span className="w-24 font-medium">{friend?.name}</span>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    step="1"
                                    min="0"
                                    max="100"
                                    value={percentage || ''}
                                    onChange={(e) => updatePercentage(participantId, parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-16 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                  <span className="text-gray-500">%</span>
                                  <span className="text-sm text-gray-600 w-20">
                                    (${amount.toFixed(2)})
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                          <div className="text-sm text-gray-600 mt-2">
                            Total: {Object.values(billForm.percentages).reduce((sum, p) => sum + p, 0)}% 
                            {Object.values(billForm.percentages).reduce((sum, p) => sum + p, 0) !== 100 && (
                              <span className="text-red-500 ml-2">⚠ Should total 100%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {billForm.splitType === 'custom' && billForm.participants.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Amounts
                        </label>
                        <div className="space-y-2">
                          {billForm.participants.map(participantId => {
                            const friend = getFriendById(participantId)
                            return (
                              <div key={participantId} className="flex items-center space-x-3">
                                <span className="text-lg">{friend?.avatar}</span>
                                <span className="w-24 font-medium">{friend?.name}</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={billForm.customAmounts[participantId] || ''}
                                  onChange={(e) => updateCustomAmount(participantId, parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                  className="w-24 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={billForm.notes}
                        onChange={(e) => setBillForm({...billForm, notes: e.target.value})}
                        placeholder="Any additional details..."
                        rows={2}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={addBill}
                        disabled={!billForm.description || !billForm.totalAmount || !billForm.paidBy || billForm.participants.length === 0}
                        className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Calculator size={20} />
                        <span>Split Bill</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowAddBill(false)
                          resetBillForm()
                        }}
                        className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bills List */}
              {bills.length === 0 ? (
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bills yet</h3>
                  <p className="text-gray-600">Split your first bill to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bills.map(bill => {
                    const paidByFriend = getFriendById(bill.paidBy)
                    return (
                      <div
                        key={bill.id}
                        className={`bg-white border rounded-lg p-4 ${bill.settled ? 'opacity-75' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className={`font-semibold ${bill.settled ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {bill.description}
                              </h3>
                              <span className="text-xl font-bold text-green-600">
                                ${bill.totalAmount.toFixed(2)}
                              </span>
                              {bill.settled && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  <CheckCircle size={12} className="inline mr-1" />
                                  Settled
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-2 text-sm text-gray-600">
                              <p>Paid by {bill.paidBy === 'self' ? '🙋‍♂️ You' : `${paidByFriend?.avatar} ${paidByFriend?.name}`} on {isClient && bill.date ? new Date(bill.date).toLocaleDateString() : 'Recent'}</p>
                              <p>Split between: {bill.participants.map(id => getFriendById(id)?.name).join(', ')}</p>
                              {bill.notes && <p className="italic">&quot;{bill.notes}&quot;</p>}
                            </div>
                            
                            <div className="mt-3 space-y-1">
                              {bill.participants.map(participantId => {
                                const friend = getFriendById(participantId)
                                const amount = bill.customAmounts?.[participantId] || 0
                                return (
                                  <div key={participantId} className="flex items-center justify-between text-sm">
                                    <span>{friend?.avatar} {friend?.name}</span>
                                    <span className="font-medium">${amount.toFixed(2)}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => toggleBillSettled(bill.id)}
                              className={`p-2 rounded transition-colors ${
                                bill.settled
                                  ? 'text-gray-400 hover:text-orange-600'
                                  : 'text-gray-400 hover:text-green-600'
                              }`}
                              title={bill.settled ? 'Mark as unsettled' : 'Mark as settled'}
                            >
                              {bill.settled ? <X size={18} /> : <Check size={18} />}
                            </button>
                            <button
                              onClick={() => deleteBill(bill.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Friends</h2>
                <button
                  onClick={() => setShowAddFriend(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus size={20} />
                  <span>Add Friend</span>
                </button>
              </div>

              {/* Add Friend Form */}
              {showAddFriend && (
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Add New Friend</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={friendForm.name}
                        onChange={(e) => setFriendForm({...friendForm, name: e.target.value})}
                        placeholder="Friend's name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={friendForm.email}
                        onChange={(e) => setFriendForm({...friendForm, email: e.target.value})}
                        placeholder="friend@example.com"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={addFriend}
                      disabled={!friendForm.name.trim()}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <UserPlus size={20} />
                      <span>Add Friend</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowAddFriend(false)
                        setFriendForm({ name: '', email: '' })
                      }}
                      className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Friends List */}
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No friends added yet</h3>
                  <p className="text-gray-600">Add friends to start splitting bills together!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map(friend => (
                    <div key={friend.id} className="bg-white border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{friend.avatar}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{friend.name}</h3>
                            {friend.email && (
                              <p className="text-sm text-gray-600">{friend.email}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              Added {isClient && friend.createdAt ? new Date(friend.createdAt).toLocaleDateString() : 'Recently'}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => deleteFriend(friend.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Balances Tab */}
          {activeTab === 'balances' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Who Owes What</h2>
              
              {settlements.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All settled up!</h3>
                  <p className="text-gray-600">No outstanding balances between friends.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {settlements.map((settlement, index) => {
                    const fromFriend = getFriendById(settlement.fromId)
                    const toFriend = getFriendById(settlement.toId)
                    
                    return (
                      <div key={index} className="bg-white border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl">{fromFriend?.avatar}</span>
                            <div>
                              <p className="font-medium">
                                {fromFriend?.name} owes {toFriend?.avatar} {toFriend?.name}
                              </p>
                              <p className="text-2xl font-bold text-red-600">
                                ${settlement.amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                              <Send size={16} />
                              <span>Remind</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                              <Check size={16} />
                              <span>Settle</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}