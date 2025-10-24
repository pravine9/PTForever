// Shared utility functions used across all pages

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

// Fill the sidebar with all our memory dates
async function populateTimelineSidebar() {
    try {
        const response = await fetch('data/memories.json');
        const memories = await response.json();
        const container = document.getElementById('timelineDates');
        
        if (!container) return;
        
        // Sort our memories by date (newest first)
        const sortedMemories = [...memories].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        container.innerHTML = '';
        sortedMemories.forEach(memory => {
            const link = document.createElement('a');
            
            // Link to the memory's dedicated page or the main timeline
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

