# Test Interview API Endpoints
# Run: .\test_interview_api.ps1

$baseUrl = "http://192.168.1.191:8000/api/v1"
$username = "testuser"
$password = "testpass123"

Write-Host "`n=== Testing Interview API Endpoints ===" -ForegroundColor Cyan

# 1. Login
Write-Host "`n1. Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    username = $username
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login/" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.access
    if (-not $token) {
        $token = $loginResponse.tokens.access
    }
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Get Interview Templates
Write-Host "`n2. Testing Get Templates..." -ForegroundColor Yellow
try {
    $templates = Invoke-RestMethod -Uri "$baseUrl/templates/" -Method Get -Headers $headers
    Write-Host "✅ Templates retrieved: $($templates.Count) templates" -ForegroundColor Green
    $templates | ForEach-Object {
        Write-Host "   • $($_.title) ($($_.interview_type) - $($_.difficulty))" -ForegroundColor Gray
    }
    $templateId = $templates[0].id
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# 3. Get All Interviews
Write-Host "`n3. Testing Get Interviews..." -ForegroundColor Yellow
try {
    $interviews = Invoke-RestMethod -Uri "$baseUrl/interviews/" -Method Get -Headers $headers
    Write-Host "✅ Interviews retrieved: $($interviews.results.Count) interviews" -ForegroundColor Green
    $interviews.results | ForEach-Object {
        Write-Host "   • $($_.title) - Status: $($_.status)" -ForegroundColor Gray
    }
    $scheduledId = ($interviews.results | Where-Object { $_.status -eq 'scheduled' })[0].id
    $completedId = ($interviews.results | Where-Object { $_.status -eq 'completed' })[0].id
    $inProgressId = ($interviews.results | Where-Object { $_.status -eq 'in_progress' })[0].id
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# 4. Get Interview Details
Write-Host "`n4. Testing Get Interview Details..." -ForegroundColor Yellow
try {
    $detail = Invoke-RestMethod -Uri "$baseUrl/interviews/$scheduledId/" -Method Get -Headers $headers
    Write-Host "✅ Interview details retrieved" -ForegroundColor Green
    Write-Host "   Title: $($detail.title)" -ForegroundColor Gray
    Write-Host "   Type: $($detail.interview_type)" -ForegroundColor Gray
    Write-Host "   Questions: $($detail.questions.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# 5. Get Interview Questions
Write-Host "`n5. Testing Get Interview Questions..." -ForegroundColor Yellow
try {
    $questions = Invoke-RestMethod -Uri "$baseUrl/interviews/$scheduledId/questions/" -Method Get -Headers $headers
    Write-Host "✅ Questions retrieved: $($questions.Count) questions" -ForegroundColor Green
    $questions | ForEach-Object {
        Write-Host "   Q$($_.order): $($_.question_text.Substring(0, 50))..." -ForegroundColor Gray
    }
    $questionId = $questions[0].id
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# 6. Create New Interview
Write-Host "`n6. Testing Create Interview..." -ForegroundColor Yellow
$createBody = @{
    title = "Test Interview - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    description = "Automated test interview"
    interview_type = "technical"
    difficulty = "medium"
    job_role = "Software Engineer"
    company_name = "Test Company"
    required_skills = @("Python", "Django", "React")
    duration_minutes = 30
    total_questions = 3
    use_ai = $true
} | ConvertTo-Json

try {
    $newInterview = Invoke-RestMethod -Uri "$baseUrl/interviews/" -Method Post -Body $createBody -Headers $headers
    Write-Host "✅ Interview created" -ForegroundColor Green
    Write-Host "   ID: $($newInterview.interview.id)" -ForegroundColor Gray
    Write-Host "   Title: $($newInterview.interview.title)" -ForegroundColor Gray
    Write-Host "   Questions generated: $($newInterview.interview.questions.Count)" -ForegroundColor Gray
    $newId = $newInterview.interview.id
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# 7. Start Interview
Write-Host "`n7. Testing Start Interview..." -ForegroundColor Yellow
try {
    $startResult = Invoke-RestMethod -Uri "$baseUrl/interviews/$newId/start/" -Method Post -Headers $headers
    Write-Host "✅ Interview started" -ForegroundColor Green
    Write-Host "   Status: $($startResult.interview.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# 8. Submit Response
Write-Host "`n8. Testing Submit Response..." -ForegroundColor Yellow
$responseBody = @{
    question_id = $startResult.interview.questions[0].id
    text_response = "This is a test response demonstrating my knowledge of the topic with specific examples."
    time_taken_seconds = 120
} | ConvertTo-Json

try {
    $submitResult = Invoke-RestMethod -Uri "$baseUrl/interviews/$newId/submit_response/" -Method Post -Body $responseBody -Headers $headers
    Write-Host "✅ Response submitted" -ForegroundColor Green
    Write-Host "   Score: $($submitResult.response.score)" -ForegroundColor Gray
    Write-Host "   Evaluated: $($submitResult.response.is_evaluated)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# 9. Complete Interview
Write-Host "`n9. Testing Complete Interview..." -ForegroundColor Yellow
try {
    $completeResult = Invoke-RestMethod -Uri "$baseUrl/interviews/$newId/complete/" -Method Post -Headers $headers
    Write-Host "✅ Interview completed" -ForegroundColor Green
    Write-Host "   Status: $($completeResult.interview.status)" -ForegroundColor Gray
    Write-Host "   Score: $($completeResult.interview.total_score)" -ForegroundColor Gray
    Write-Host "   Percentage: $($completeResult.interview.percentage)%" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# 10. Get Results
Write-Host "`n10. Testing Get Results..." -ForegroundColor Yellow
try {
    $results = Invoke-RestMethod -Uri "$baseUrl/interviews/$completedId/results/" -Method Get -Headers $headers
    Write-Host "✅ Results retrieved" -ForegroundColor Green
    Write-Host "   Total Score: $($results.total_score)" -ForegroundColor Gray
    Write-Host "   Percentage: $($results.percentage)%" -ForegroundColor Gray
    Write-Host "   Feedback: $($results.overall_feedback)" -ForegroundColor Gray
    Write-Host "   Strengths: $($results.strengths -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# 11. Get My Interviews
Write-Host "`n11. Testing My Interviews..." -ForegroundColor Yellow
try {
    $myInterviews = Invoke-RestMethod -Uri "$baseUrl/interviews/my_interviews/" -Method Get -Headers $headers
    Write-Host "✅ My interviews retrieved: $($myInterviews.Count) interviews" -ForegroundColor Green
    $myInterviews | ForEach-Object {
        Write-Host "   • $($_.title) - $($_.status) ($($_.percentage)%)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# 12. Filter by Status
Write-Host "`n12. Testing Filter by Status..." -ForegroundColor Yellow
try {
    $scheduled = Invoke-RestMethod -Uri "$baseUrl/interviews/?status=scheduled" -Method Get -Headers $headers
    Write-Host "✅ Scheduled interviews: $($scheduled.results.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# 13. Filter by Type
Write-Host "`n13. Testing Filter by Type..." -ForegroundColor Yellow
try {
    $technical = Invoke-RestMethod -Uri "$baseUrl/interviews/?type=technical" -Method Get -Headers $headers
    Write-Host "✅ Technical interviews: $($technical.results.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# 14. Use Template
Write-Host "`n14. Testing Use Template..." -ForegroundColor Yellow
$useTemplateBody = @{
    job_role = "Frontend Developer"
    company_name = "Template Test Corp"
} | ConvertTo-Json

try {
    $fromTemplate = Invoke-RestMethod -Uri "$baseUrl/templates/$templateId/use_template/" -Method Post -Body $useTemplateBody -Headers $headers
    Write-Host "✅ Interview created from template" -ForegroundColor Green
    Write-Host "   ID: $($fromTemplate.interview.id)" -ForegroundColor Gray
    Write-Host "   Title: $($fromTemplate.interview.title)" -ForegroundColor Gray
    Write-Host "   Questions: $($fromTemplate.interview.questions.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

Write-Host "`n" + ("="*60) -ForegroundColor Cyan
Write-Host "🎉 ALL INTERVIEW API TESTS COMPLETED!" -ForegroundColor Green
Write-Host ("="*60) -ForegroundColor Cyan
Write-Host "`nAPI Endpoints Tested:" -ForegroundColor Yellow
Write-Host "  ✅ POST   /auth/login/" -ForegroundColor White
Write-Host "  ✅ GET    /interviews/" -ForegroundColor White
Write-Host "  ✅ POST   /interviews/" -ForegroundColor White
Write-Host "  ✅ GET    /interviews/{id}/" -ForegroundColor White
Write-Host "  ✅ POST   /interviews/{id}/start/" -ForegroundColor White
Write-Host "  ✅ GET    /interviews/{id}/questions/" -ForegroundColor White
Write-Host "  ✅ POST   /interviews/{id}/submit_response/" -ForegroundColor White
Write-Host "  ✅ POST   /interviews/{id}/complete/" -ForegroundColor White
Write-Host "  ✅ GET    /interviews/{id}/results/" -ForegroundColor White
Write-Host "  ✅ GET    /interviews/my_interviews/" -ForegroundColor White
Write-Host "  ✅ GET    /templates/" -ForegroundColor White
Write-Host "  ✅ POST   /templates/{id}/use_template/" -ForegroundColor White
Write-Host "`n"
