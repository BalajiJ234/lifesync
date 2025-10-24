# AI Feature Validation Script
# Run this to validate AI features are working

Write-Host "🚀 LifeSync AI Feature Validation" -ForegroundColor Green
Write-Host "=" * 50

# Test 1: Server Status
Write-Host "`n🔍 Testing server status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Server is running on http://localhost:3000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Server is not responding. Please start with 'npm run dev'" -ForegroundColor Red
    exit 1
}

# Test 2: AI Categorization Endpoint
Write-Host "`n🤖 Testing AI categorization..." -ForegroundColor Yellow
try {
    $headers = @{ "Content-Type" = "application/json" }
    $testData = @{
        description = "Starbucks coffee"
        amount = 5.50
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/ai/categorize" -Method POST -Headers $headers -Body $testData -TimeoutSec 10
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ AI Categorization working" -ForegroundColor Green
    Write-Host "   Category: $($result.category)" -ForegroundColor Cyan
    Write-Host "   Confidence: $([math]::Round($result.confidence * 100, 1))%" -ForegroundColor Cyan
    Write-Host "   Reasoning: $($result.reasoning)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ AI Categorization failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: AI Suggestions Endpoint  
Write-Host "`n💡 Testing AI suggestions..." -ForegroundColor Yellow
try {
    $headers = @{ "Content-Type" = "application/json" }
    $testData = @{ type = "general" } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/ai/suggestions" -Method POST -Headers $headers -Body $testData -TimeoutSec 10
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ AI Suggestions working" -ForegroundColor Green
    Write-Host "   Suggestions count: $($result.suggestions.Count)" -ForegroundColor Cyan
    if ($result.suggestions.Count -gt 0) {
        Write-Host "   First suggestion: $($result.suggestions[0].title)" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "❌ AI Suggestions failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: PWA Assets
Write-Host "`n📱 Testing PWA assets..." -ForegroundColor Yellow
try {
    # Test manifest
    $manifestResponse = Invoke-WebRequest -Uri "http://localhost:3000/manifest.json" -TimeoutSec 5
    if ($manifestResponse.StatusCode -eq 200) {
        Write-Host "✅ PWA manifest available" -ForegroundColor Green
    }
    
    # Test service worker
    $swResponse = Invoke-WebRequest -Uri "http://localhost:3000/sw.js" -TimeoutSec 5
    if ($swResponse.StatusCode -eq 200) {
        Write-Host "✅ Service worker available" -ForegroundColor Green
    }
    
    # Test AI test page
    $testPageResponse = Invoke-WebRequest -Uri "http://localhost:3000/ai-test.html" -TimeoutSec 5
    if ($testPageResponse.StatusCode -eq 200) {
        Write-Host "✅ AI test page available" -ForegroundColor Green
    }
    
} catch {
    Write-Host "⚠️ Some PWA assets may not be fully loaded" -ForegroundColor Yellow
}

# Summary
Write-Host "`n" + "=" * 50
Write-Host "🎉 Validation Complete!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3000 to test dashboard AI insights"
Write-Host "2. Open http://localhost:3000/expenses to test expense categorization"
Write-Host "3. Open http://localhost:3000/ai-test.html for comprehensive testing"
Write-Host "4. Press F12 in browser and run window.runAITests() for detailed analysis"

Write-Host "`n💡 Manual Testing Checklist:" -ForegroundColor Yellow
Write-Host "- Test expense categorization by adding new expense"
Write-Host "- Test AI insights widget on dashboard"  
Write-Host "- Verify PWA install prompt appears"
Write-Host "- Test offline functionality"
Write-Host "- Run comprehensive test suite in browser console"