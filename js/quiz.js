let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;

// Load my birthday quiz questions
async function loadQuizData() {
    try {
        const response = await fetch('data/quiz.json');
        quizData = await response.json();
    } catch (error) {
        console.error('Error loading quiz data:', error);
    }
}

// Let's start the birthday quiz!
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    selectedAnswer = null;
    
    document.getElementById('quizStart').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('totalQuestions').textContent = quizData.questions.length;
    
    showQuestion();
}

// Display the current question
function showQuestion() {
    const question = quizData.questions[currentQuestionIndex];
    const container = document.getElementById('questionContainer');
    
    // Update progress bar
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    const progress = ((currentQuestionIndex) / quizData.questions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    // Check if this is a photo/video or an actual question
    if (question.type === 'media') {
        displayMediaItem(question, container);
    } else {
        displayQuestion(question, container);
    }
    
    selectedAnswer = null;
    document.getElementById('nextBtn').style.display = 'none';
}

// Show a quiz question
function displayQuestion(question, container) {
    let mediaHtml = '';
    if (question.media) {
        if (question.media.type === 'image') {
            mediaHtml = `<div class="question-media"><img src="${question.media.url}" alt="Question image"></div>`;
        } else if (question.media.type === 'video') {
            mediaHtml = `<div class="question-media"><video controls src="${question.media.url}"></video></div>`;
        }
    }
    
    const answersHtml = question.answers.map((answer, index) => 
        `<button class="answer-btn" onclick="selectAnswer(${index})">${answer}</button>`
    ).join('');
    
    container.innerHTML = `
        <div class="question-text">${question.question}</div>
        ${mediaHtml}
        <div class="answers">${answersHtml}</div>
    `;
}

// Show a special photo or video
function displayMediaItem(item, container) {
    let mediaHtml = '';
    if (item.media.type === 'image') {
        mediaHtml = `<div class="question-media"><img src="${item.media.url}" alt="${item.title}"></div>`;
    } else if (item.media.type === 'video') {
        mediaHtml = `<div class="question-media"><video controls src="${item.media.url}"></video></div>`;
    }
    
    container.innerHTML = `
        <div class="question-text">${item.title}</div>
        ${mediaHtml}
        ${item.message ? `<p style="margin-top: 1rem; color: var(--secondary);">${item.message}</p>` : ''}
    `;
    
    // Automatically show next button for photos/videos
    document.getElementById('nextBtn').style.display = 'block';
}

// Check your answer
function selectAnswer(answerIndex) {
    if (selectedAnswer !== null) return;
    
    selectedAnswer = answerIndex;
    const question = quizData.questions[currentQuestionIndex];
    const buttons = document.querySelectorAll('.answer-btn');
    
    // Lock in the answer
    buttons.forEach(btn => btn.disabled = true);
    
    // Highlight the correct answer
    buttons[question.correctAnswer].classList.add('correct');
    
    if (answerIndex === question.correctAnswer) {
        score++;
        buttons[answerIndex].classList.add('correct');
    } else {
        buttons[answerIndex].classList.add('incorrect');
    }
    
    // Show the next button
    document.getElementById('nextBtn').style.display = 'block';
}

// Go to the next question
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quizData.questions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

// Show your final score
function showResults() {
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('quizResults').style.display = 'block';
    
    // Calculate the score (excluding photos/videos)
    const actualQuestions = quizData.questions.filter(q => q.type !== 'media').length;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('totalScore').textContent = actualQuestions;
    
    // See if you've unlocked something special!
    const percentage = (score / actualQuestions) * 100;
    const unlockContainer = document.getElementById('unlockContent');
    
    if (percentage >= quizData.passingScore) {
        let unlockHtml = `
            <div class="unlock-message">
                <h3>🎉 Amazing! You know us so well!</h3>
                <p>${quizData.successMessage || "You've unlocked a special surprise!"}</p>
        `;
        
        if (quizData.unlockContent) {
            if (quizData.unlockContent.type === 'message') {
                unlockHtml += `<p style="margin-top: 1rem; font-style: italic;">${quizData.unlockContent.content}</p>`;
            } else if (quizData.unlockContent.type === 'image') {
                unlockHtml += `<img src="${quizData.unlockContent.url}" style="max-width: 100%; margin-top: 1rem; border-radius: 8px;" alt="Unlocked content">`;
            } else if (quizData.unlockContent.type === 'video') {
                unlockHtml += `<video controls src="${quizData.unlockContent.url}" style="max-width: 100%; margin-top: 1rem; border-radius: 8px;"></video>`;
            }
        }
        
        unlockHtml += '</div>';
        unlockContainer.innerHTML = unlockHtml;
        
        // Unlock any private memories
        if (quizData.unlockMemoryId) {
            unlockMemory(quizData.unlockMemoryId);
        }
    } else {
        unlockContainer.innerHTML = `
            <p style="margin-top: 1rem;">You got ${percentage.toFixed(0)}% correct. Try again to unlock my special surprise!</p>
        `;
    }
}

// Try again!
function restartQuiz() {
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizStart').style.display = 'block';
}

// Unlock a private memory
function unlockMemory(memoryId) {
    const unlocked = JSON.parse(localStorage.getItem('unlockedMemories') || '[]');
    if (!unlocked.includes(memoryId)) {
        unlocked.push(memoryId);
        localStorage.setItem('unlockedMemories', JSON.stringify(unlocked));
    }
}

// Load everything when the page is ready
document.addEventListener('DOMContentLoaded', () => {
    loadQuizData();
    populateTimelineSidebar();
});

