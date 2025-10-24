#!/usr/bin/env node

/**
 * AI Integration Test Script
 * Tests the AI categorization and suggestions endpoints
 */

const BASE_URL = 'http://localhost:3000'

async function testAICategorization() {
  console.log('🤖 Testing AI Categorization Endpoint...\n')

  const testCases = [
    {
      description: 'Starbucks coffee',
      amount: 5.50,
      expected: 'Food & Dining'
    },
    {
      description: 'Uber ride to airport',
      amount: 45.00,
      expected: 'Transportation'
    },
    {
      description: 'Netflix subscription',
      amount: 15.99,
      expected: 'Bills & Utilities'
    },
    {
      description: 'Amazon purchase',
      amount: 89.99,
      expected: 'Shopping'
    },
    {
      description: 'Movie theater tickets',
      amount: 24.00,
      expected: 'Entertainment'
    },
    {
      description: 'Doctor visit',
      amount: 150.00,
      expected: 'Healthcare'
    },
    {
      description: 'Monthly rent payment',
      amount: 1200.00,
      expected: 'Housing'
    },
    {
      description: 'New laptop',
      amount: 1500.00,
      expected: 'Large Purchase'
    }
  ]

  for (const testCase of testCases) {
    try {
      console.log(`📝 Testing: "${testCase.description}" ($${testCase.amount})`)
      
      const response = await fetch(`${BASE_URL}/api/ai/categorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: testCase.description,
          amount: testCase.amount
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      const isCorrect = result.category === testCase.expected
      const status = isCorrect ? '✅' : '❌'
      
      console.log(`${status} Result: ${result.category} (confidence: ${(result.confidence * 100).toFixed(1)}%)`)
      console.log(`   Expected: ${testCase.expected}`)
      console.log(`   Reasoning: ${result.reasoning}`)
      
      if (result.suggestions && result.suggestions.length > 0) {
        console.log(`   💡 Suggestions: ${result.suggestions.join(', ')}`)
      }
      
      console.log('')
    } catch (error) {
      console.error(`❌ Error testing "${testCase.description}":`, error.message)
      console.log('')
    }
  }
}

async function testAISuggestions() {
  console.log('💡 Testing AI Suggestions Endpoint...\n')

  const testCases = [
    {
      type: 'general',
      description: 'General suggestions'
    },
    {
      type: 'expense_analysis',
      description: 'Expense analysis suggestions'
    },
    {
      type: 'budget_optimization',
      description: 'Budget optimization suggestions'
    }
  ]

  for (const testCase of testCases) {
    try {
      console.log(`📊 Testing: ${testCase.description}`)
      
      const response = await fetch(`${BASE_URL}/api/ai/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: testCase.type
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      console.log(`✅ Success: Received ${result.suggestions?.length || 0} suggestions`)
      
      if (result.suggestions && result.suggestions.length > 0) {
        result.suggestions.forEach((suggestion, index) => {
          console.log(`   ${index + 1}. ${suggestion.title} (${suggestion.priority})`)
          console.log(`      ${suggestion.message}`)
          console.log(`      Action: ${suggestion.action}`)
        })
      }
      
      console.log('')
    } catch (error) {
      console.error(`❌ Error testing ${testCase.description}:`, error.message)
      console.log('')
    }
  }
}

async function testAIIntegration() {
  console.log('🚀 AI Integration Test Suite')
  console.log('=' .repeat(50) + '\n')
  
  try {
    // Test server availability
    console.log('🔍 Checking server availability...')
    const healthResponse = await fetch(`${BASE_URL}`)
    if (!healthResponse.ok) {
      throw new Error('Server not responding')
    }
    console.log('✅ Server is running\n')
    
    // Test AI endpoints
    await testAICategorization()
    await testAISuggestions()
    
    console.log('🎉 AI Integration tests completed!')
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message)
    console.log('\n💡 Make sure the development server is running on http://localhost:3000')
    process.exit(1)
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testAIIntegration()
}

module.exports = { testAIIntegration, testAICategorization, testAISuggestions }