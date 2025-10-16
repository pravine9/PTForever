// Dynamic Memory Page - Loads content from JSON

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

// Get memory ID from URL
function getMemoryIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Load and display memory
async function loadMemory() {
    const memoryId = getMemoryIdFromUrl();
    
    if (!memoryId) {
        showError('No memory specified');
        return;
    }
    
    try {
        const response = await fetch('data/memories.json');
        const memories = await response.json();
        const memory = memories.find(m => m.id === memoryId);
        
        if (!memory) {
            showError('Memory not found');
            return;
        }
        
        displayMemory(memory);
        populateTimelineSidebar(memories, memoryId);
        
    } catch (error) {
        console.error('Error loading memory:', error);
        showError('Error loading memory');
    }
}

// Display memory content
function displayMemory(memory) {
    const container = document.getElementById('memoryPageContent');
    const dateStr = new Date(memory.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Get full content or use regular content
    const fullContent = memory.fullContent || memory.content;
    const paragraphs = fullContent.split('\n\n').map(p => `<p>${p}</p>`).join('');
    
    // Get quote if available
    const quoteHtml = memory.quote ? `
        <div class="memory-quote">
            <div class="quote-mark">"</div>
            <p>${memory.quote}</p>
        </div>
    ` : '';
    
    // Get media if available
    let mediaHtml = '';
    if (memory.media) {
        if (memory.media.type === 'image') {
            mediaHtml = `
                <div class="memory-media-section">
                    <img src="${memory.media.url}" alt="${memory.title}">
                </div>
            `;
        } else if (memory.media.type === 'video') {
            mediaHtml = `
                <div class="memory-media-section">
                    <video controls src="${memory.media.url}"></video>
                </div>
            `;
        }
    }
    
    // Tags HTML
    const tagsHtml = memory.tags ? memory.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
    
    container.innerHTML = `
        <div class="memory-page-hero">
            <div class="hero-background"></div>
            <div class="hero-content">
                <div class="memory-breadcrumb">
                    <a href="index.html">Home</a>
                    <span>›</span>
                    <span>${dateStr}</span>
                </div>
                <div class="memory-date-large">${dateStr}</div>
                <h1 class="memory-title-large">${memory.title}</h1>
                <div class="memory-tags-hero">
                    ${tagsHtml}
                </div>
            </div>
        </div>

        <div class="memory-page-content">
            <div class="memory-story">
                <div class="story-icon">✨</div>
                <div class="story-text">
                    ${paragraphs}
                </div>
            </div>

            ${mediaHtml}
            ${quoteHtml}

            <div class="memory-timeline-marker">
                <div class="marker-line"></div>
                <div class="marker-dot"></div>
                <div class="marker-label">${memory.markerLabel || 'A Special Moment'}</div>
            </div>

            <div class="memory-actions">
                <a href="index.html" class="btn-secondary">← Back to All Memories</a>
                <a href="quiz.html" class="btn-primary">Take the Quiz →</a>
            </div>
        </div>
    `;
}

// Show error message
function showError(message) {
    const container = document.getElementById('memoryPageContent');
    container.innerHTML = `
        <div style="text-align: center; padding: 4rem;">
            <h2>Oops!</h2>
            <p>${message}</p>
            <a href="index.html" class="btn-primary" style="margin-top: 2rem;">Back to Memories</a>
        </div>
    `;
}

// Populate timeline in sidebar
async function populateTimelineSidebar(memories, currentId) {
    const container = document.getElementById('timelineDates');
    if (!container) return;
    
    // Sort memories by date
    const sortedMemories = [...memories].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = '';
    sortedMemories.forEach(memory => {
        const link = document.createElement('a');
        
        // Link to dynamic page if hasPage, otherwise to index
        if (memory.hasPage) {
            link.href = `memory.html?id=${memory.id}`;
        } else {
            link.href = `index.html#memory-${memory.id}`;
        }
        
        link.className = 'timeline-date';
        if (memory.id === currentId) {
            link.classList.add('active');
        }
        
        const dateStr = new Date(memory.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        link.textContent = dateStr;
        
        container.appendChild(link);
    });
}

// Load on page ready
document.addEventListener('DOMContentLoaded', () => {
    loadMemory();
});

