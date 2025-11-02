# Test script for Exam API endpoints
$API_BASE = "http://192.168.1.191:8000/api/v1"
$TOKEN = ""
$attemptId = $null

Write-Host "===== EXAM API TEST SUITE =====" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "1. Logging in..." -ForegroundColor Yellow
$loginData = @{
    username = "testuser"
    password = "testpass123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login/" -Method Post -Body $loginData -ContentType "application/json"
    $TOKEN = $loginResponse.tokens.access

    if ($TOKEN) {
        Write-Host "✓ Login successful!" -ForegroundColor Green
        Write-Host "Token: $($TOKEN.Substring(0, [Math]::Min(20, $TOKEN.Length)))..." -ForegroundColor Gray
    }
    else {
        Write-Host "✗ Login failed!" -ForegroundColor Red
        exit
    }
}
catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# Step 2: List all exams
Write-Host "2. Fetching all exams..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $TOKEN"
}

try {
    $examResponse = Invoke-RestMethod -Uri "$API_BASE/exams/" -Method Get -Headers $headers
    $exams = $examResponse.results
    Write-Host "✓ Found $($exams.count) exams:" -ForegroundColor Green
    foreach ($exam in $exams) {
        Write-Host "  - $($exam.title) [$($exam.difficulty)] - $($exam.question_count) questions" -ForegroundColor Gray
    }
}
catch {
    Write-Host "✗ Failed to fetch exams: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# Step 3: Get exam details
$examId = $exams[0].id
Write-Host "3. Getting details for: $($exams[0].title)" -ForegroundColor Yellow
try {
    $examDetail = Invoke-RestMethod -Uri "$API_BASE/exams/$examId/" -Method Get -Headers $headers
    Write-Host "✓ Exam details retrieved:" -ForegroundColor Green
    Write-Host "  Title: $($examDetail.title)" -ForegroundColor Gray
    Write-Host "  Category: $($examDetail.category)" -ForegroundColor Gray
    Write-Host "  Duration: $($examDetail.duration_minutes) minutes" -ForegroundColor Gray
    Write-Host "  Total Marks: $($examDetail.total_marks)" -ForegroundColor Gray
    Write-Host "  Questions: $($examDetail.questions.count)" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Failed to get exam details: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# Step 4: Start exam attempt
Write-Host "4. Starting exam attempt..." -ForegroundColor Yellow
try {
    $startResponse = Invoke-RestMethod -Uri "$API_BASE/exams/$examId/start/" -Method Post -Headers $headers
    $attemptId = $startResponse.attempt.id
    Write-Host "✓ Exam attempt started!" -ForegroundColor Green
    Write-Host "  Attempt ID: $attemptId" -ForegroundColor Gray
    Write-Host "  Status: $($startResponse.attempt.status)" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Failed to start exam: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# Step 5: Get exam questions
Write-Host "5. Fetching exam questions..." -ForegroundColor Yellow
try {
    $questions = Invoke-RestMethod -Uri "$API_BASE/exams/$examId/questions/" -Method Get -Headers $headers
    Write-Host "✓ Retrieved $($questions.count) questions" -ForegroundColor Green
}
catch {
    Write-Host "✗ Failed to fetch questions: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# Step 6: Submit answers
Write-Host "6. Submitting answers..." -ForegroundColor Yellow
$answeredCount = 0
$answersList = @()
foreach ($question in $questions) {
    Write-Host "  Question: $($question.question_text.Substring(0, [Math]::Min(50, $question.question_text.Length)))..." -ForegroundColor Gray
    
    # Get the correct answer (for testing, we'll just pick the first option)
    $userAnswer = @($question.options[0].id)
    
    $answerData = @{
        question_id = $question.id
        user_answer = $userAnswer
    } | ConvertTo-Json
    
    try {
        $null = Invoke-RestMethod -Uri "$API_BASE/attempts/$attemptId/submit_answer/" -Method Post -Body $answerData -ContentType "application/json" -Headers $headers
        Write-Host "  ✓ Answer submitted: $userAnswer" -ForegroundColor Green
        $answeredCount++
        
        # Add to answers list for final submit
        $answersList += @{
            question_id        = $question.id
            user_answer        = $userAnswer
            time_spent_seconds = 10
        }
    }
    catch {
        Write-Host "  ✗ Failed to submit answer: $_" -ForegroundColor Red
    }
}

Write-Host "✓ Submitted $answeredCount answers" -ForegroundColor Green

Write-Host ""

# Step 7: Submit exam
Write-Host "7. Submitting exam..." -ForegroundColor Yellow
try {
    $submitData = @{
        answers = $answersList
    } | ConvertTo-Json -Depth 5
    
    $submitResponse = Invoke-RestMethod -Uri "$API_BASE/attempts/$attemptId/submit/" -Method Post -Body $submitData -ContentType "application/json" -Headers $headers
    Write-Host "✓ Exam submitted successfully!" -ForegroundColor Green
    Write-Host "  Status: $($submitResponse.status)" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Failed to submit exam: $_" -ForegroundColor Red
}

Write-Host ""

# Step 8: Get results
Write-Host "8. Fetching exam results..." -ForegroundColor Yellow
try {
    $results = Invoke-RestMethod -Uri "$API_BASE/attempts/$attemptId/results/" -Method Get -Headers $headers
    Write-Host "✓ Results retrieved!" -ForegroundColor Green
    Write-Host "  Score: $($results.marks_obtained)/$($results.total_marks)" -ForegroundColor Cyan
    Write-Host "  Percentage: $([math]::Round($results.percentage, 2))%" -ForegroundColor Cyan
    $passFailColor = if ($results.is_passed) { "Green" } else { "Red" }
    $passFailStatus = if ($results.is_passed) { "PASSED" } else { "FAILED" }
    Write-Host "  Pass/Fail: $passFailStatus" -ForegroundColor $passFailColor
    $correctCount = ($results.answers | Where-Object { $_.is_correct -eq $true }).Count
    Write-Host "  Correct Answers: $correctCount/$($results.answers.Count)" -ForegroundColor Gray
    Write-Host "  Time Taken: $($results.time_taken_minutes) minutes" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Failed to fetch results: $_" -ForegroundColor Red
}

Write-Host ""

# Step 9: Get my attempts
Write-Host "9. Fetching user's exam history..." -ForegroundColor Yellow
try {
    $attemptResponse = Invoke-RestMethod -Uri "$API_BASE/attempts/my_attempts/" -Method Get -Headers $headers
    $myAttempts = if ($attemptResponse.results) { $attemptResponse.results } else { $attemptResponse }
    Write-Host "✓ Found $($myAttempts.count) attempts:" -ForegroundColor Green
    foreach ($attempt in $myAttempts) {
        Write-Host "  - $($attempt.exam.title) - Score: $($attempt.marks_obtained)/$($attempt.total_marks) [$($attempt.status)]" -ForegroundColor Gray
    }
}
catch {
    Write-Host "✗ Failed to fetch attempts: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "===== ALL TESTS COMPLETED =====" -ForegroundColor Cyan
