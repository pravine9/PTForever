// Our Favorites Quiz - Let's see how well you know us!

let quizData = {};
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;

// Load our quiz questions
async function loadQuizData() {
    try {
        const response = await fetch('data/favorites-quiz.json');
        quizData = await response.json();
    } catch (error) {
        console.error('Error loading quiz data:', error);
    }
}

// Let's start the quiz!
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
    
    // Show the category
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

// Check your answer
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
        
        // Show why that's correct
        if (question.explanation) {
            const container = document.getElementById('questionContainer');
            const explanationDiv = document.createElement('div');
            explanationDiv.style.marginTop = '1.5rem';
            explanationDiv.style.padding = '1rem';
            explanationDiv.style.background = 'linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 161, 105, 0.1) 100%)';
            explanationDiv.style.borderRadius = '10px';
            explanationDiv.style.borderLeft = '4px solid var(--success)';
            explanationDiv.innerHTML = `<strong>✓ You got it!</strong> ${question.explanation}`;
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
    
    const totalQuestions = quizData.questions.length;
    const percentage = (score / totalQuestions) * 100;
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('totalScore').textContent = totalQuestions;
    
    const messageContainer = document.getElementById('scoreMessage');
    let message = '';
    let emoji = '';
    
    if (percentage === 100) {
        emoji = '🏆';
        message = 'Perfect score! You know us so perfectly! Amazing!';
    } else if (percentage >= 90) {
        emoji = '⭐';
        message = 'Outstanding! You really know me so well! Impressive!';
    } else if (percentage >= 80) {
        emoji = '🎉';
        message = 'Great job! You know so much about our favorites!';
    } else if (percentage >= 70) {
        emoji = '😊';
        message = 'Good effort! You know us pretty well!';
    } else if (percentage >= 50) {
        emoji = '🙂';
        message = 'Not bad! There\'s still more to learn about us!';
    } else {
        emoji = '📚';
        message = 'Keep learning! Spend more time with me to discover my favorites!';
    }
    
    messageContainer.innerHTML = `
        <div style="font-size: 4rem; margin: 1rem 0;">${emoji}</div>
        <p style="font-size: 1.2rem; margin: 1rem 0;">${message}</p>
        <p style="font-size: 1rem; color: var(--secondary); margin-top: 1rem;">
            You got ${Math.round(percentage)}% correct!
        </p>
    `;
}

// Try again!
function restartQuiz() {
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizStart').style.display = 'block';
}

// Load everything when the page is ready
document.addEventListener('DOMContentLoaded', () => {
    loadQuizData();
    populateTimelineSidebar();
});

