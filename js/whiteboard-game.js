let questions = [];
let shuffledQuestions = [];
let currentQuestionIndex = 0;
let isFullscreen = false;

// Load all our whiteboard questions
async function loadQuestions() {
    try {
        const response = await fetch('data/whiteboard-questions.json');
        const data = await response.json();
        questions = data.questions;
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// Shuffle the questions randomly
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Let's start the whiteboard game!
function startGame() {
    currentQuestionIndex = 0;
    shuffledQuestions = shuffleArray(questions);
    
    document.getElementById('gameStart').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    document.getElementById('totalQuestions').textContent = shuffledQuestions.length;
    
    showQuestion();
}

// Display the current question
function showQuestion() {
    const question = shuffledQuestions[currentQuestionIndex];
    
    document.getElementById('questionText').textContent = question;
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    
    // Enable/disable navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = false;
}

// Go to the next question
function nextQuestion() {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        // We've finished all questions!
        endGame();
    }
}

// Go back to the previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

// Finish the game
function endGame() {
    if (isFullscreen) {
        exitFullscreen();
    }
    
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('gameComplete').style.display = 'block';
}

// Play again!
function restartGame() {
    if (isFullscreen) {
        exitFullscreen();
    }
    
    document.getElementById('gameComplete').style.display = 'none';
    document.getElementById('gameStart').style.display = 'block';
}

// Switch fullscreen mode on/off
function toggleFullscreen() {
    if (!isFullscreen) {
        enterFullscreen();
    } else {
        exitFullscreen();
    }
}

// Go fullscreen for the whiteboard
function enterFullscreen() {
    isFullscreen = true;
    const gameContainer = document.getElementById('gameContainer');
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    const mainContainer = document.getElementById('mainContainer');
    
    // Hide sidebar and controls for distraction-free mode
    sidebar.style.display = 'none';
    mobileToggle.style.display = 'none';
    mainContainer.style.marginLeft = '0';
    mainContainer.style.padding = '0';
    
    // Make the game take up the whole screen
    gameContainer.classList.add('fullscreen-mode');
    
    // Hide the control buttons
    const btnGroup = gameContainer.querySelector('.btn-group');
    if (btnGroup) {
        btnGroup.style.display = 'none';
    }
    
    // Add an exit button
    const exitBtn = document.createElement('button');
    exitBtn.className = 'exit-fullscreen';
    exitBtn.id = 'exitFullscreenBtn';
    exitBtn.textContent = '✕ Exit Fullscreen';
    exitBtn.onclick = exitFullscreen;
    document.body.appendChild(exitBtn);
    
    // Use the browser's fullscreen feature
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
            console.log('Fullscreen request failed:', err);
        });
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

// Exit fullscreen and return to normal view
function exitFullscreen() {
    isFullscreen = false;
    const gameContainer = document.getElementById('gameContainer');
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    const mainContainer = document.getElementById('mainContainer');
    const exitBtn = document.getElementById('exitFullscreenBtn');
    
    // Bring back the sidebar and controls
    sidebar.style.display = '';
    mobileToggle.style.display = '';
    mainContainer.style.marginLeft = '';
    mainContainer.style.padding = '';
    
    // Return to normal mode
    gameContainer.classList.remove('fullscreen-mode');
    
    // Show the control buttons again
    const btnGroup = gameContainer.querySelector('.btn-group');
    if (btnGroup) {
        btnGroup.style.display = '';
    }
    
    // Remove the exit button
    if (exitBtn) {
        exitBtn.remove();
    }
    
    // Exit the browser's fullscreen mode
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
            console.log('Exit fullscreen failed:', err);
        });
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// Press ESC to exit fullscreen
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
    }
});

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && isFullscreen) {
        exitFullscreen();
    }
});

document.addEventListener('webkitfullscreenchange', () => {
    if (!document.webkitFullscreenElement && isFullscreen) {
        exitFullscreen();
    }
});

// Load everything when the page is ready
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    populateTimelineSidebar();
});

