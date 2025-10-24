import { NextRequest, NextResponse } from 'next/server'

// Type definitions
interface CategoryResult {
  category: string
  confidence: number
  reason: string
  suggestions?: string[]
}

// This will be our AI categorization endpoint
export async function POST(request: NextRequest) {
  try {
    const { description, amount, context } = await request.json()

    // For now, we'll use rule-based categorization
    // Later, this will call external AI services (OpenAI, Claude, etc.)
    const result = categorizeExpense(description, amount, context)
    const suggestions = await getSuggestions(description, amount, result.category)

    return NextResponse.json({
      success: true,
      category: result.category,
      confidence: result.confidence,
      suggestions,
      reasoning: result.reason,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('AI Categorization error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to categorize expense',
      category: 'Other',
      confidence: 0
    }, { status: 500 })
  }
}

// Smart expense categorization logic
function categorizeExpense(description: string, amount: number, context?: { date?: string; location?: string }): CategoryResult {
  const desc = description.toLowerCase()
  
  // Food & Dining patterns
  if (desc.match(/restaurant|food|lunch|dinner|breakfast|cafe|pizza|burger|sushi|takeout|delivery|eat|meal|groceries|grocery|supermarket|market|carrefour|spinneys|lulu|union coop|fresh|produce|vegetables|fruits/)) {
    return { category: 'Food & Dining', confidence: 0.9, reason: 'Contains food/dining/grocery keywords' }
  }
  
  // Transportation patterns
  if (desc.match(/gas|fuel|uber|lyft|taxi|bus|train|metro|parking|toll|car|vehicle|transport/)) {
    return { category: 'Transportation', confidence: 0.85, reason: 'Contains transportation keywords' }
  }
  
  // Shopping patterns
  if (desc.match(/amazon|target|walmart|store|shop|buy|purchase|mall|retail|clothes|clothing/)) {
    return { category: 'Shopping', confidence: 0.8, reason: 'Contains shopping keywords' }
  }
  
  // Bills & Utilities patterns
  if (desc.match(/electric|water|gas bill|internet|phone|cell|mobile|utility|bill|subscription|netflix|spotify/)) {
    return { category: 'Bills & Utilities', confidence: 0.95, reason: 'Contains utility/subscription keywords' }
  }
  
  // Entertainment patterns
  if (desc.match(/movie|cinema|theater|game|entertainment|fun|party|bar|club|concert|show/)) {
    return { category: 'Entertainment', confidence: 0.85, reason: 'Contains entertainment keywords' }
  }
  
  // Healthcare patterns
  if (desc.match(/doctor|hospital|pharmacy|medical|health|dentist|clinic|medicine|drug|prescription/)) {
    return { category: 'Healthcare', confidence: 0.9, reason: 'Contains healthcare keywords' }
  }
  
  // Housing patterns
  if (desc.match(/rent|mortgage|housing|apartment|home|property|maintenance|repair/)) {
    return { category: 'Housing', confidence: 0.95, reason: 'Contains housing keywords' }
  }
  
  // Amount-based categorization
  if (amount > 1000) {
    return { category: 'Large Purchase', confidence: 0.7, reason: 'High amount suggests major purchase' }
  }
  
  return { category: 'Other', confidence: 0.5, reason: 'No specific patterns matched' }
}

// Calculate confidence score for categorization
function calculateConfidence(description: string, category: string): number {
  const desc = description.toLowerCase()
  let confidence = 0.5 // Base confidence
  
  // Category-specific confidence boosts
  const categoryPatterns: Record<string, RegExp[]> = {
    'Food & Dining': [/restaurant|food|lunch|dinner|breakfast|groceries|grocery|supermarket|carrefour/],
    'Transportation': [/gas|fuel|uber|taxi|parking|metro|bus/],
    'Shopping': [/amazon|store|shop|buy|purchase|mall|retail/],
    'Bills & Utilities': [/bill|utility|subscription|electric|water|internet/],
    'Entertainment': [/movie|game|bar|entertainment|cinema|concert/],
    'Healthcare': [/doctor|hospital|medical|pharmacy|clinic/],
    'Housing': [/rent|mortgage|apartment|home|maintenance/]
  }
  
  const patterns = categoryPatterns[category] || []
  const matches = patterns.filter(pattern => pattern.test(desc))
  
  // Boost confidence based on pattern matches
  confidence += matches.length * 0.2
  
  // Cap confidence at 0.95
  return Math.min(confidence, 0.95)
}

// Generate AI-powered suggestions
async function getSuggestions(description: string, amount: number, category: string) {
  const suggestions = []
  
  // Budget suggestions
  if (amount > 100) {
    suggestions.push({
      type: 'budget',
      message: `This is a significant expense. Consider budgeting for ${category} category.`,
      action: 'set_budget'
    })
  }
  
  // Recurring expense detection
  if (description.toLowerCase().includes('subscription') || description.toLowerCase().includes('monthly')) {
    suggestions.push({
      type: 'recurring',
      message: 'This looks like a recurring expense. Set up automatic tracking?',
      action: 'setup_recurring'
    })
  }
  
  // Split suggestion
  if (description.toLowerCase().match(/dinner|lunch|meal|restaurant/) && amount > 30) {
    suggestions.push({
      type: 'split',
      message: 'Shared meal? Consider splitting this expense with friends.',
      action: 'suggest_split'
    })
  }
  
  // Tax deduction hint
  if (category === 'Healthcare' || description.toLowerCase().includes('business')) {
    suggestions.push({
      type: 'tax',
      message: 'This expense might be tax deductible. Save the receipt!',
      action: 'mark_deductible'
    })
  }
  
  return suggestions
}