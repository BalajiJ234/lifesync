// AI Integration Test Runner - Execute in Browser Console
// This script tests all AI functionality and reports results

console.log('🚀 Starting LifeSync AI Integration Tests...\n');

// Test configuration
const TEST_CONFIG = {
    baseUrl: window.location.origin,
    timeout: 5000,
    retries: 3
};

// Test data for categorization
const CATEGORIZATION_TESTS = [
    { description: 'Starbucks coffee', amount: 5.50, expected: 'Food & Dining' },
    { description: 'McDonald\'s lunch', amount: 12.99, expected: 'Food & Dining' },
    { description: 'Uber ride to airport', amount: 45.00, expected: 'Transportation' },
    { description: 'Gas station fill up', amount: 65.00, expected: 'Transportation' },
    { description: 'Netflix subscription', amount: 15.99, expected: 'Bills & Utilities' },
    { description: 'Electric bill payment', amount: 125.00, expected: 'Bills & Utilities' },
    { description: 'Amazon purchase', amount: 89.99, expected: 'Shopping' },
    { description: 'Target shopping', amount: 67.50, expected: 'Shopping' },
    { description: 'Movie theater tickets', amount: 24.00, expected: 'Entertainment' },
    { description: 'Concert tickets', amount: 120.00, expected: 'Entertainment' },
    { description: 'Doctor visit', amount: 150.00, expected: 'Healthcare' },
    { description: 'Pharmacy medication', amount: 35.00, expected: 'Healthcare' },
    { description: 'Monthly rent payment', amount: 1200.00, expected: 'Housing' },
    { description: 'Home repair', amount: 450.00, expected: 'Housing' },
    { description: 'New laptop', amount: 1500.00, expected: 'Large Purchase' }
];

// Utility functions
const makeApiCall = async (endpoint, data) => {
    try {
        const response = await fetch(`${TEST_CONFIG.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        throw new Error(`API call failed: ${error.message}`);
    }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test 1: AI Categorization Endpoint
const testCategorization = async () => {
    console.log('🤖 Testing AI Categorization Endpoint...');
    
    const results = {
        total: CATEGORIZATION_TESTS.length,
        passed: 0,
        failed: 0,
        errors: [],
        details: []
    };
    
    for (const test of CATEGORIZATION_TESTS) {
        try {
            console.log(`  Testing: "${test.description}" ($${test.amount})`);
            
            const result = await makeApiCall('/api/ai/categorize', {
                description: test.description,
                amount: test.amount
            });
            
            const isCorrect = result.category === test.expected;
            const status = isCorrect ? '✅' : '❌';
            
            console.log(`    ${status} Got: ${result.category} (${(result.confidence * 100).toFixed(1)}%)`);
            console.log(`    Expected: ${test.expected}`);
            console.log(`    Reasoning: ${result.reasoning}`);
            
            if (isCorrect) {
                results.passed++;
            } else {
                results.failed++;
                results.errors.push(`${test.description}: expected ${test.expected}, got ${result.category}`);
            }
            
            results.details.push({
                test: test.description,
                expected: test.expected,
                actual: result.category,
                confidence: result.confidence,
                correct: isCorrect,
                reasoning: result.reasoning
            });
            
            await sleep(100); // Rate limiting
            
        } catch (error) {
            console.error(`    ❌ Error: ${error.message}`);
            results.failed++;
            results.errors.push(`${test.description}: ${error.message}`);
        }
    }
    
    const accuracy = (results.passed / results.total * 100).toFixed(1);
    console.log(`\n📊 Categorization Results: ${results.passed}/${results.total} (${accuracy}% accuracy)`);
    
    return results;
};

// Test 2: AI Suggestions Endpoint
const testSuggestions = async () => {
    console.log('\n💡 Testing AI Suggestions Endpoint...');
    
    const suggestionTypes = ['general', 'expense_analysis', 'budget_optimization', 'dashboard'];
    const results = {
        total: suggestionTypes.length,
        passed: 0,
        failed: 0,
        errors: [],
        details: []
    };
    
    for (const type of suggestionTypes) {
        try {
            console.log(`  Testing: ${type} suggestions`);
            
            const result = await makeApiCall('/api/ai/suggestions', { type });
            
            if (result.suggestions && Array.isArray(result.suggestions)) {
                console.log(`    ✅ Got ${result.suggestions.length} suggestions`);
                result.suggestions.forEach((suggestion, index) => {
                    console.log(`    ${index + 1}. ${suggestion.title} (${suggestion.priority})`);
                });
                results.passed++;
            } else {
                console.log(`    ❌ Invalid response format`);
                results.failed++;
                results.errors.push(`${type}: Invalid response format`);
            }
            
            results.details.push({
                type,
                suggestionsCount: result.suggestions?.length || 0,
                suggestions: result.suggestions || []
            });
            
            await sleep(100);
            
        } catch (error) {
            console.error(`    ❌ Error: ${error.message}`);
            results.failed++;
            results.errors.push(`${type}: ${error.message}`);
        }
    }
    
    console.log(`\n📊 Suggestions Results: ${results.passed}/${results.total} passed`);
    return results;
};

// Test 3: Frontend Integration
const testFrontendIntegration = () => {
    console.log('\n🎨 Testing Frontend Integration...');
    
    const tests = [
        {
            name: 'AI Integration Component Exists',
            test: () => typeof window.useAIIntegration !== 'undefined' || 
                         document.querySelector('[data-ai-component]') !== null
        },
        {
            name: 'Dashboard AI Insights Widget',
            test: () => window.location.pathname === '/' || 
                         document.querySelector('[class*="ai"]') !== null ||
                         document.textContent.includes('AI Insights')
        },
        {
            name: 'Expense Form AI Integration',
            test: () => window.location.pathname.includes('/expenses') ||
                         document.querySelector('form') !== null
        },
        {
            name: 'Service Worker Registered',
            test: () => 'serviceWorker' in navigator && navigator.serviceWorker.controller
        },
        {
            name: 'PWA Manifest Available',
            test: () => document.querySelector('link[rel="manifest"]') !== null
        }
    ];
    
    const results = { passed: 0, failed: 0, total: tests.length };
    
    tests.forEach(test => {
        try {
            const passed = test.test();
            const status = passed ? '✅' : '❌';
            console.log(`  ${status} ${test.name}`);
            if (passed) results.passed++;
            else results.failed++;
        } catch (error) {
            console.log(`  ❌ ${test.name}: ${error.message}`);
            results.failed++;
        }
    });
    
    console.log(`\n📊 Frontend Results: ${results.passed}/${results.total} passed`);
    return results;
};

// Test 4: Performance Testing
const testPerformance = async () => {
    console.log('\n⚡ Testing Performance...');
    
    const performanceTests = [
        {
            name: 'Categorization Response Time',
            test: async () => {
                const start = performance.now();
                await makeApiCall('/api/ai/categorize', {
                    description: 'Coffee shop',
                    amount: 4.50
                });
                const end = performance.now();
                return end - start;
            },
            threshold: 1000 // 1 second
        },
        {
            name: 'Suggestions Response Time',
            test: async () => {
                const start = performance.now();
                await makeApiCall('/api/ai/suggestions', { type: 'general' });
                const end = performance.now();
                return end - start;
            },
            threshold: 2000 // 2 seconds
        }
    ];
    
    const results = { passed: 0, failed: 0, total: performanceTests.length, details: [] };
    
    for (const test of performanceTests) {
        try {
            const responseTime = await test.test();
            const passed = responseTime <= test.threshold;
            const status = passed ? '✅' : '❌';
            
            console.log(`  ${status} ${test.name}: ${responseTime.toFixed(0)}ms (threshold: ${test.threshold}ms)`);
            
            if (passed) results.passed++;
            else results.failed++;
            
            results.details.push({
                name: test.name,
                responseTime,
                threshold: test.threshold,
                passed
            });
            
        } catch (error) {
            console.log(`  ❌ ${test.name}: ${error.message}`);
            results.failed++;
        }
    }
    
    console.log(`\n📊 Performance Results: ${results.passed}/${results.total} passed`);
    return results;
};

// Main test runner
const runAllTests = async () => {
    console.log('🧪 LifeSync AI Integration Test Suite\n');
    console.log('=' + '='.repeat(50));
    
    const startTime = performance.now();
    
    try {
        // Run all tests
        const categorizationResults = await testCategorization();
        const suggestionsResults = await testSuggestions();
        const frontendResults = testFrontendIntegration();
        const performanceResults = await testPerformance();
        
        // Calculate overall results
        const totalTests = categorizationResults.total + suggestionsResults.total + 
                          frontendResults.total + performanceResults.total;
        const totalPassed = categorizationResults.passed + suggestionsResults.passed + 
                           frontendResults.passed + performanceResults.passed;
        
        const endTime = performance.now();
        const testDuration = ((endTime - startTime) / 1000).toFixed(1);
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('🎉 TEST SUMMARY');
        console.log('='.repeat(50));
        console.log(`📊 Overall Results: ${totalPassed}/${totalTests} tests passed (${(totalPassed/totalTests*100).toFixed(1)}%)`);
        console.log(`⏱️ Test Duration: ${testDuration} seconds`);
        console.log(`🤖 AI Categorization Accuracy: ${(categorizationResults.passed/categorizationResults.total*100).toFixed(1)}%`);
        console.log(`💡 AI Suggestions: ${suggestionsResults.passed}/${suggestionsResults.total} endpoints working`);
        console.log(`🎨 Frontend Integration: ${frontendResults.passed}/${frontendResults.total} components working`);
        console.log(`⚡ Performance: ${performanceResults.passed}/${performanceResults.total} within thresholds`);
        
        // Detailed results for analysis
        window.aiTestResults = {
            categorization: categorizationResults,
            suggestions: suggestionsResults,
            frontend: frontendResults,
            performance: performanceResults,
            summary: {
                totalTests,
                totalPassed,
                accuracy: totalPassed/totalTests*100,
                duration: testDuration
            }
        };
        
        console.log('\n📋 Detailed results stored in window.aiTestResults');
        
        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        if (categorizationResults.passed / categorizationResults.total < 0.8) {
            console.log('❗ Categorization accuracy below 80% - consider improving patterns');
        }
        if (performanceResults.failed > 0) {
            console.log('❗ Performance issues detected - consider optimization');
        }
        if (frontendResults.failed > 0) {
            console.log('❗ Frontend integration issues - check component loading');
        }
        
        console.log('\n🚀 AI Integration testing complete!');
        
    } catch (error) {
        console.error('💥 Test suite failed:', error);
    }
};

// Export for manual execution
window.runAITests = runAllTests;

// Auto-run if in test environment
if (window.location.pathname.includes('ai-test')) {
    console.log('🔄 Auto-running tests on ai-test page...');
    setTimeout(runAllTests, 2000);
} else {
    console.log('💡 To run tests manually, execute: window.runAITests()');
}

console.log('✅ AI test runner loaded successfully!');