import { NextRequest, NextResponse } from 'next/server'

/**
 * LOCAL AI SUGGESTIONS (Rule-based fallback)
 * 
 * TODO: Replace with Personal Assistant API call when fully integrated
 * This provides offline-capable financial suggestions using pattern analysis.
 * Once personal-assistant-api is connected, this should proxy to:
 * GET /api/assistant/insights
 */

// AI-powered insights and suggestions endpoint
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'general'
    const timeframe = searchParams.get('timeframe') || '30d'
    
    const insights = await generateInsights(type, timeframe)
    
    return NextResponse.json({
      success: true,
      insights,
      type,
      timeframe,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('AI Insights error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate insights'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data, analysisType, context } = await request.json()
    
    let suggestions = []
    
    switch (analysisType) {
      case 'expense_patterns':
        suggestions = await analyzeExpensePatterns(data)
        break
      case 'budget_optimization':
        suggestions = await optimizeBudget(data)
        break
      case 'spending_trends':
        suggestions = await analyzeSpendingTrends(data)
        break
      case 'bill_splitting':
        suggestions = await suggestBillSplitting(data)
        break
      default:
        suggestions = await generateGeneralSuggestions(data)
    }
    
    return NextResponse.json({
      success: true,
      suggestions,
      analysisType,
      context,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('AI Suggestions error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate suggestions'
    }, { status: 500 })
  }
}

// Generate insights based on type
async function generateInsights(type: string, timeframe: string) {
  // Mock data for now - in production, this would analyze actual user data
  const insights = []
  
  switch (type) {
    case 'spending':
      insights.push({
        title: 'Spending Pattern Detected',
        description: 'You spend 40% more on weekends compared to weekdays',
        type: 'pattern',
        importance: 'medium',
        action: 'Consider setting weekend spending limits',
        icon: '📊'
      })
      insights.push({
        title: 'Budget Alert',
        description: 'You\'re 80% through your monthly food budget with 10 days left',
        type: 'alert',
        importance: 'high',
        action: 'Reduce dining out this week',
        icon: '⚠️'
      })
      break
      
    case 'savings':
      insights.push({
        title: 'Savings Opportunity',
        description: 'Switch to annual subscriptions and save $240/year',
        type: 'opportunity',
        importance: 'medium',
        action: 'Review subscription plans',
        icon: '💰'
      })
      break
      
    case 'productivity':
      insights.push({
        title: 'Task Completion Rate',
        description: 'Your productivity is highest on Tuesday mornings',
        type: 'pattern',
        importance: 'low',
        action: 'Schedule important tasks on Tuesday mornings',
        icon: '📈'
      })
      break
      
    default:
      insights.push({
        title: 'Welcome to AI Insights',
        description: 'Start tracking your expenses and todos to get personalized insights',
        type: 'welcome',
        importance: 'low',
        action: 'Add your first expense or todo',
        icon: '🚀'
      })
  }
  
  return insights
}

// Analyze expense patterns  
async function analyzeExpensePatterns(expenses: { category: string; amount: number; date: string; description?: string }[]) {
  const suggestions = []
  
  // Category analysis
  const categoryTotals: Record<string, number> = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)
  
  const topCategory = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]
  
  if (topCategory) {
    const [category, amount] = topCategory
    suggestions.push({
      type: 'insight',
      title: 'Top Spending Category',
      message: `You spend most on ${category} ($${(amount as number).toFixed(2)})`,
      action: 'set_category_budget',
      priority: 'medium'
    })
  }
  
  // Frequency analysis
  const dailySpending: Record<string, number> = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date).toDateString()
    acc[date] = (acc[date] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)
  
  const averageDailySpend = Object.values(dailySpending).reduce((a: number, b: number) => a + b, 0) / Object.keys(dailySpending).length
  const highSpendDays = Object.entries(dailySpending).filter(([, amount]) => (amount as number) > averageDailySpend * 1.5)
  
  if (highSpendDays.length > 0) {
    suggestions.push({
      type: 'warning',
      title: 'High Spending Days',
      message: `You have ${highSpendDays.length} days with above-average spending`,
      action: 'review_high_spend_days',
      priority: 'high'
    })
  }
  
  return suggestions
}

// Budget optimization suggestions
async function optimizeBudget(_data: Record<string, unknown>) {
  const suggestions = []
  
  suggestions.push({
    type: 'optimization',
    title: 'Budget Allocation',
    message: 'Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
    action: 'setup_budget_categories',
    priority: 'medium'
  })
  
  suggestions.push({
    type: 'automation',
    title: 'Automatic Savings',
    message: 'Set up automatic transfers to savings account',
    action: 'setup_auto_savings',
    priority: 'low'
  })
  
  return suggestions
}

// Analyze spending trends
async function analyzeSpendingTrends(_data: Record<string, unknown>) {
  const suggestions = []
  
  // Mock trend analysis
  suggestions.push({
    type: 'trend',
    title: 'Spending Trend',
    message: 'Your spending increased by 15% compared to last month',
    action: 'review_recent_expenses',
    priority: 'high'
  })
  
  suggestions.push({
    type: 'forecast',
    title: 'Monthly Forecast',
    message: 'At current rate, you\'ll spend $2,300 this month',
    action: 'adjust_spending_rate',
    priority: 'medium'
  })
  
  return suggestions
}

// Smart bill splitting suggestions
async function suggestBillSplitting(data: { amount: number; description?: string }) {
  const suggestions = []
  
  if (data.amount > 50) {
    suggestions.push({
      type: 'split_suggestion',
      title: 'Large Expense Detected',
      message: 'This expense might be worth splitting with friends',
      action: 'suggest_split_options',
      priority: 'medium'
    })
  }
  
  if (data.description?.toLowerCase().includes('dinner') || data.description?.toLowerCase().includes('restaurant')) {
    suggestions.push({
      type: 'social_split',
      title: 'Shared Meal',
      message: 'Looks like a shared meal. Split evenly or by items?',
      action: 'create_split_bill',
      priority: 'high'
    })
  }
  
  return suggestions
}

// General AI suggestions
async function generateGeneralSuggestions(_data: Record<string, unknown>) {
  const suggestions = []
  
  suggestions.push({
    type: 'tip',
    title: 'Smart Tip',
    message: 'Use voice commands to quickly add expenses on the go',
    action: 'enable_voice_input',
    priority: 'low'
  })
  
  suggestions.push({
    type: 'feature',
    title: 'New Feature',
    message: 'Try the calendar view for your todos',
    action: 'switch_to_calendar_view',
    priority: 'low'
  })
  
  return suggestions
}