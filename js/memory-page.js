// Memory Page JavaScript

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
            
            // Create page filename from memory ID
            const pageUrl = getMemoryPageUrl(memory);
            link.href = pageUrl;
            
            link.className = 'timeline-date';
            const dateStr = new Date(memory.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            link.textContent = dateStr;
            
            // Highlight if this is the current page
            if (window.location.pathname.includes(memory.id) || 
                window.location.pathname.includes(formatDateForUrl(memory.date))) {
                link.classList.add('active');
            }
            
            container.appendChild(link);
        });
    } catch (error) {
        console.error('Error loading timeline:', error);
    }
}

// Get memory page URL
function getMemoryPageUrl(memory) {
    // For the first memory, use the specific page we created
    if (memory.id === 'first-hello') {
        return 'october-20-2024.html';
    }
    
    // For other memories, link to main page with anchor
    return `index.html#memory-${memory.id}`;
}

// Format date for URL
function formatDateForUrl(dateStr) {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
}

// Load on page ready
document.addEventListener('DOMContentLoaded', () => {
    populateTimelineSidebar();
});

