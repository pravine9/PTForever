let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;

// Sidebar toggle for mobile
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// Timeline toggle in sidebar
function toggleTimeline() {
    const toggle = document.querySelector('.timeline-toggle');
    const dates = document.getElementById('timelineDates');
    
    toggle.classList.toggle('active');
    dates.classList.toggle('expanded');
}

// Populate timeline in sidebar
async function populateTimelineSidebar() {
    try {
        const response = await fetch('data/memories.json');
        const memories = await response.json();
        const container = document.getElementById('timelineDates');
        
        if (!container) return;
        
        // Sort memories by date
        const sortedMemories = [...memories].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        container.innerHTML = '';
        sortedMemories.forEach(memory => {
            const link = document.createElement('a');
            
            // Link to dynamic page if hasPage, otherwise to main page
            if (memory.hasPage) {
                link.href = `memory.html?id=${memory.id}`;
            } else {
                link.href = 'index.html#memory-' + memory.id;
            }
            
            link.className = 'timeline-date';
            const dateStr = new Date(memory.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            link.textContent = dateStr;
            container.appendChild(link);
        });
    } catch (error) {
        console.error('Error loading timeline:', error);
    }
}

// Load quiz data
async function loadQuizData() {
    try {
        const response = await fetch('data/quiz.json');
        quizData = await response.json();
    } catch (error) {
        console.error('Error loading quiz data:', error);
    }
}

// Start the quiz
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    selectedAnswer = null;
    
    document.getElementById('quizStart').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('totalQuestions').textContent = quizData.questions.length;
    
    showQuestion();
}

// Show current question
function showQuestion() {
    const question = quizData.questions[currentQuestionIndex];
    const container = document.getElementById('questionContainer');
    
    // Update progress
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    const progress = ((currentQuestionIndex) / quizData.questions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    // Check if this is a media item (not a question)
    if (question.type === 'media') {
        displayMediaItem(question, container);
    } else {
        displayQuestion(question, container);
    }
    
    selectedAnswer = null;
    document.getElementById('nextBtn').style.display = 'none';
}

// Display a regular question
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

// Display a media item (photo/video between questions)
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
    
    // Auto show next button for media items
    document.getElementById('nextBtn').style.display = 'block';
}

// Handle answer selection
function selectAnswer(answerIndex) {
    if (selectedAnswer !== null) return; // Already answered
    
    selectedAnswer = answerIndex;
    const question = quizData.questions[currentQuestionIndex];
    const buttons = document.querySelectorAll('.answer-btn');
    
    // Disable all buttons
    buttons.forEach(btn => btn.disabled = true);
    
    // Mark correct and incorrect answers
    buttons[question.correctAnswer].classList.add('correct');
    
    if (answerIndex === question.correctAnswer) {
        score++;
        buttons[answerIndex].classList.add('correct');
    } else {
        buttons[answerIndex].classList.add('incorrect');
    }
    
    // Show next button
    document.getElementById('nextBtn').style.display = 'block';
}

// Move to next question
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quizData.questions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

// Show quiz results
function showResults() {
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('quizResults').style.display = 'block';
    
    // Calculate score (excluding media items)
    const actualQuestions = quizData.questions.filter(q => q.type !== 'media').length;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('totalScore').textContent = actualQuestions;
    
    // Check if they passed and show unlock content
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
        
        // Unlock any private memories if specified
        if (quizData.unlockMemoryId) {
            unlockMemory(quizData.unlockMemoryId);
        }
    } else {
        unlockContainer.innerHTML = `
            <p style="margin-top: 1rem;">You got ${percentage.toFixed(0)}% correct. Try again to unlock something special!</p>
        `;
    }
}

// Restart quiz
function restartQuiz() {
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizStart').style.display = 'block';
}

// Unlock memory (same as in memories.js)
function unlockMemory(memoryId) {
    const unlocked = JSON.parse(localStorage.getItem('unlockedMemories') || '[]');
    if (!unlocked.includes(memoryId)) {
        unlocked.push(memoryId);
        localStorage.setItem('unlockedMemories', JSON.stringify(unlocked));
    }
}

// Load quiz data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadQuizData();
    populateTimelineSidebar();
});

