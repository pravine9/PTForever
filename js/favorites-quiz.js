// Favorites Quiz - All data loaded from JSON

let quizData = {};
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
        
        const sortedMemories = [...memories].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        container.innerHTML = '';
        sortedMemories.forEach(memory => {
            const link = document.createElement('a');
            
            if (memory.hasPage) {
                link.href = `memory.html?id=${memory.id}`;
            } else {
                link.href = 'index.html#memory-' + memory.id;
            }
            
            link.className = 'timeline-date';
            const dateStr = new Date(memory.date).toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric' 
            });
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
        const response = await fetch('data/favorites-quiz.json');
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
    
    // Update category
    document.getElementById('categoryText').textContent = `Category: ${question.category}`;
    
    const answersHtml = question.answers.map((answer, index) => 
        `<button class="answer-btn" onclick="selectAnswer(${index})">${answer}</button>`
    ).join('');
    
    container.innerHTML = `
        <div class="question-text">${question.question}</div>
        <div class="answers">${answersHtml}</div>
    `;
    
    selectedAnswer = null;
    document.getElementById('nextBtn').style.display = 'none';
}

// Handle answer selection
function selectAnswer(answerIndex) {
    if (selectedAnswer !== null) return;
    
    selectedAnswer = answerIndex;
    const question = quizData.questions[currentQuestionIndex];
    const buttons = document.querySelectorAll('.answer-btn');
    
    buttons.forEach(btn => btn.disabled = true);
    
    buttons[question.correctAnswer].classList.add('correct');
    
    if (answerIndex === question.correctAnswer) {
        score++;
        buttons[answerIndex].classList.add('correct');
        
        // Show explanation if available
        if (question.explanation) {
            const container = document.getElementById('questionContainer');
            const explanationDiv = document.createElement('div');
            explanationDiv.style.marginTop = '1.5rem';
            explanationDiv.style.padding = '1rem';
            explanationDiv.style.background = 'linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 161, 105, 0.1) 100%)';
            explanationDiv.style.borderRadius = '10px';
            explanationDiv.style.borderLeft = '4px solid var(--success)';
            explanationDiv.innerHTML = `<strong>✓ Correct!</strong> ${question.explanation}`;
            container.appendChild(explanationDiv);
        }
    } else {
        buttons[answerIndex].classList.add('incorrect');
        
        if (question.explanation) {
            const container = document.getElementById('questionContainer');
            const explanationDiv = document.createElement('div');
            explanationDiv.style.marginTop = '1.5rem';
            explanationDiv.style.padding = '1rem';
            explanationDiv.style.background = 'linear-gradient(135deg, rgba(252, 129, 129, 0.1) 0%, rgba(245, 101, 101, 0.1) 100%)';
            explanationDiv.style.borderRadius = '10px';
            explanationDiv.style.borderLeft = '4px solid #fc8181';
            explanationDiv.innerHTML = `<strong>✗ Not quite!</strong> ${question.explanation}`;
            container.appendChild(explanationDiv);
        }
    }
    
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
    
    const totalQuestions = quizData.questions.length;
    const percentage = (score / totalQuestions) * 100;
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('totalScore').textContent = totalQuestions;
    
    const messageContainer = document.getElementById('scoreMessage');
    let message = '';
    let emoji = '';
    
    if (percentage === 100) {
        emoji = '🏆';
        message = 'Perfect score! You know us better than we know ourselves! Amazing!';
    } else if (percentage >= 90) {
        emoji = '⭐';
        message = 'Outstanding! You really know us so well! Impressive!';
    } else if (percentage >= 80) {
        emoji = '🎉';
        message = 'Great job! You know a lot about our favorites!';
    } else if (percentage >= 70) {
        emoji = '😊';
        message = 'Good effort! You know us pretty well!';
    } else if (percentage >= 50) {
        emoji = '🙂';
        message = 'Not bad! There\'s still more to learn about us!';
    } else {
        emoji = '📚';
        message = 'Keep learning! Spend more time with us to know our favorites!';
    }
    
    messageContainer.innerHTML = `
        <div style="font-size: 4rem; margin: 1rem 0;">${emoji}</div>
        <p style="font-size: 1.2rem; margin: 1rem 0;">${message}</p>
        <p style="font-size: 1rem; color: var(--secondary); margin-top: 1rem;">
            You got ${Math.round(percentage)}% correct!
        </p>
    `;
}

// Restart quiz
function restartQuiz() {
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizStart').style.display = 'block';
}

// Load on page ready
document.addEventListener('DOMContentLoaded', () => {
    loadQuizData();
    populateTimelineSidebar();
});

