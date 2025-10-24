# Simple AI Test Script
Write-Host "Testing LifeSync AI Features..." -ForegroundColor Green

# Test server
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    Write-Host "Server Status: OK" -ForegroundColor Green
} catch {
    Write-Host "Server Status: FAILED - Start with npm run dev" -ForegroundColor Red
    exit 1
}

# Test AI Categorization
Write-Host "Testing AI Categorization..." -ForegroundColor Yellow
try {
    $headers = @{ "Content-Type" = "application/json" }
    $body = '{"description":"Starbucks coffee","amount":5.50}'
    
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/ai/categorize" -Method POST -Headers $headers -Body $body
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "AI Categorization: WORKING" -ForegroundColor Green
    Write-Host "Result: $($result.category) ($($result.confidence * 100)% confidence)" -ForegroundColor Cyan
    
} catch {
    Write-Host "AI Categorization: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test AI Suggestions  
Write-Host "Testing AI Suggestions..." -ForegroundColor Yellow
try {
    $headers = @{ "Content-Type" = "application/json" }
    $body = '{"type":"general"}'
    
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/ai/suggestions" -Method POST -Headers $headers -Body $body
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "AI Suggestions: WORKING" -ForegroundColor Green
    Write-Host "Suggestions: $($result.suggestions.Count) items" -ForegroundColor Cyan
    
} catch {
    Write-Host "AI Suggestions: FAILED - $($_.Exception.Message)" -ForegroundColor Red  
}

Write-Host "Testing complete! Open http://localhost:3000/ai-test.html for interactive tests" -ForegroundColor Green