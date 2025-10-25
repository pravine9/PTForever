// Shared utility functions used across all pages

// Create the sidebar/navbar HTML - used on all pages to avoid duplication
function createSidebar(activePage) {
    return `
        <div class="sidebar-header">
            <h1 class="sidebar-title">P&T Forever ∞</h1>
            <p class="sidebar-subtitle">Our Story, Our Memories</p>
        </div>
        
        <nav class="sidebar-nav">
            <div class="nav-section">
                <div class="nav-section-title">Navigation</div>
                <a href="index.html" class="nav-item ${activePage === 'memories' ? 'active' : ''}">📖 All Memories</a>
                <a href="gallery.html" class="nav-item ${activePage === 'gallery' ? 'active' : ''}">📸 Gallery</a>
                <a href="quiz.html" class="nav-item ${activePage === 'quiz' ? 'active' : ''}">🎯 Birthday Quiz</a>
                <a href="favorites-quiz.html" class="nav-item ${activePage === 'favorites' ? 'active' : ''}">💝 Favorites Quiz</a>
                <a href="whiteboard-game.html" class="nav-item ${activePage === 'whiteboard' ? 'active' : ''}">🎲 Whiteboard Game</a>
            </div>
            
            <div class="nav-section timeline-nav">
                <button class="timeline-toggle" onclick="toggleTimeline()">
                    <span>⏱️ Timeline</span>
                    <span class="timeline-arrow">▶</span>
                </button>
                <div class="timeline-dates" id="timelineDates">
                    <!-- Timeline dates will be populated here -->
                </div>
            </div>
        </nav>
        
        <div class="sidebar-footer">
            Est. October 2024 💕
        </div>
    `;
}

// Initialize sidebar on page load
function initializeSidebar(activePage) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.innerHTML = createSidebar(activePage);
    }
}

// Toggle the sidebar when I'm on mobile
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// Expand/collapse our timeline in the sidebar
function toggleTimeline() {
    const toggle = document.querySelector('.timeline-toggle');
    const dates = document.getElementById('timelineDates');
    
    toggle.classList.toggle('active');
    dates.classList.toggle('expanded');
}

// Scroll to a specific memory on the timeline (used by hash navigation)
function scrollToMemory(memoryId) {
    const memoryCard = document.querySelector(`[data-memory-id="${memoryId}"]`);
    
    if (memoryCard) {
        const cardRect = memoryCard.getBoundingClientRect();
        const absoluteTop = cardRect.top + window.scrollY;
        const scrollToPosition = absoluteTop - 150;
        
        window.scrollTo({
            top: scrollToPosition,
            behavior: 'smooth'
        });
        
        // Add pulse animation
        setTimeout(() => {
            memoryCard.style.opacity = '1';
            memoryCard.style.animation = 'pulse 0.5s ease';
        }, 600);
    }
}

// Fill the sidebar with all our memory dates
async function populateTimelineSidebar() {
    try {
        const response = await fetch('data/memories.json');
        const memories = await response.json();
        const container = document.getElementById('timelineDates');
        
        if (!container) return;
        
        // Sort our memories by date (oldest first for sidebar)
        const sortedMemories = [...memories].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Check if we're on the index page (where memory cards exist)
        const onIndexPage = document.getElementById('timeline') !== null;
        
        container.innerHTML = '';
        sortedMemories.forEach(memory => {
            const link = document.createElement('a');
            
            // Link to the memory's dedicated page or scroll to it on the timeline
            if (memory.hasPage) {
                link.href = `memory.html?id=${memory.id}`;
                link.onclick = null;
            } else if (onIndexPage) {
                // On index page - scroll to memory card
                link.href = 'javascript:void(0)'; // Don't use hash to prevent it from sticking
                link.onclick = (e) => {
                    e.preventDefault();
                    
                    // Inline scroll implementation
                    const memoryCard = document.querySelector(`[data-memory-id="${memory.id}"]`);
                    
                    if (memoryCard) {
                        const cardRect = memoryCard.getBoundingClientRect();
                        const absoluteTop = cardRect.top + window.scrollY;
                        const scrollToPosition = absoluteTop - 150;
                        
                        window.scrollTo({
                            top: scrollToPosition,
                            behavior: 'smooth'
                        });
                        
                        // Add pulse animation after scroll
                        setTimeout(() => {
                            memoryCard.style.opacity = '1'; // Ensure card stays visible
                            memoryCard.style.animation = 'pulse 0.5s ease';
                        }, 600);
                    }
                    
                    if (window.innerWidth <= 768) {
                        toggleSidebar();
                    }
                };
            } else {
                // On other pages - navigate to index page with anchor
                link.href = 'index.html#memory-' + memory.id;
                link.onclick = null;
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

