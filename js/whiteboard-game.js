let questions = [];
let shuffledQuestions = [];
let currentQuestionIndex = 0;
let isFullscreen = false;

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

// Load questions from JSON
async function loadQuestions() {
    try {
        const response = await fetch('data/whiteboard-questions.json');
        const data = await response.json();
        questions = data.questions;
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Start the game
function startGame() {
    currentQuestionIndex = 0;
    shuffledQuestions = shuffleArray(questions);
    
    document.getElementById('gameStart').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    document.getElementById('totalQuestions').textContent = shuffledQuestions.length;
    
    showQuestion();
}

// Show current question
function showQuestion() {
    const question = shuffledQuestions[currentQuestionIndex];
    
    document.getElementById('questionText').textContent = question;
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    
    // Update button states
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = false;
}

// Go to next question
function nextQuestion() {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        // Game complete
        endGame();
    }
}

// Go to previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

// End game
function endGame() {
    if (isFullscreen) {
        exitFullscreen();
    }
    
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('gameComplete').style.display = 'block';
}

// Restart game
function restartGame() {
    if (isFullscreen) {
        exitFullscreen();
    }
    
    document.getElementById('gameComplete').style.display = 'none';
    document.getElementById('gameStart').style.display = 'block';
}

// Toggle fullscreen mode
function toggleFullscreen() {
    if (!isFullscreen) {
        enterFullscreen();
    } else {
        exitFullscreen();
    }
}

// Enter fullscreen mode
function enterFullscreen() {
    isFullscreen = true;
    const gameContainer = document.getElementById('gameContainer');
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    const mainContainer = document.getElementById('mainContainer');
    
    // Hide sidebar, mobile toggle, and other controls
    sidebar.style.display = 'none';
    mobileToggle.style.display = 'none';
    mainContainer.style.marginLeft = '0';
    mainContainer.style.padding = '0';
    
    // Make game container fullscreen
    gameContainer.classList.add('fullscreen-mode');
    
    // Hide all buttons in btn-group
    const btnGroup = gameContainer.querySelector('.btn-group');
    if (btnGroup) {
        btnGroup.style.display = 'none';
    }
    
    // Add exit button
    const exitBtn = document.createElement('button');
    exitBtn.className = 'exit-fullscreen';
    exitBtn.id = 'exitFullscreenBtn';
    exitBtn.textContent = '✕ Exit Fullscreen';
    exitBtn.onclick = exitFullscreen;
    document.body.appendChild(exitBtn);
    
    // Try to use native fullscreen API
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

// Exit fullscreen mode
function exitFullscreen() {
    isFullscreen = false;
    const gameContainer = document.getElementById('gameContainer');
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    const mainContainer = document.getElementById('mainContainer');
    const exitBtn = document.getElementById('exitFullscreenBtn');
    
    // Show sidebar and mobile toggle again
    sidebar.style.display = 'flex';
    mobileToggle.style.display = 'block';
    mainContainer.style.marginLeft = '';
    mainContainer.style.padding = '';
    
    // Remove fullscreen class
    gameContainer.classList.remove('fullscreen-mode');
    
    // Show button group again
    const btnGroup = gameContainer.querySelector('.btn-group');
    if (btnGroup) {
        btnGroup.style.display = 'flex';
    }
    
    // Remove exit button
    if (exitBtn) {
        exitBtn.remove();
    }
    
    // Exit native fullscreen
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

// Handle ESC key to exit fullscreen
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
    }
});

// Handle native fullscreen change events
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

// Load questions on page load
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    populateTimelineSidebar();
});

