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

// Scroll to a specific memory on the timeline
function scrollToMemory(memoryId) {
    console.log('IMMEDIATE: scrollToMemory entered');
    try {
        console.log('=== SCROLL TO MEMORY DEBUG ===');
        console.log('scrollToMemory function called!');
        console.log('Memory ID:', memoryId);
        console.log('Type of memoryId:', typeof memoryId);
        
        const memoryCard = document.querySelector(`[data-memory-id="${memoryId}"]`);
        console.log('Memory card found:', memoryCard);
        
        if (memoryCard) {
            // Log initial CSS state
            const initialStyles = window.getComputedStyle(memoryCard);
            console.log('Initial card CSS:', {
                display: initialStyles.display,
                visibility: initialStyles.visibility,
                opacity: initialStyles.opacity,
                position: initialStyles.position,
                zIndex: initialStyles.zIndex
            });
            
            // Log initial state
            console.log('Current window.scrollY:', window.scrollY);
            console.log('Window innerHeight:', window.innerHeight);
            console.log('Document height:', document.documentElement.scrollHeight);
            
            // Get card position
            const rect = memoryCard.getBoundingClientRect();
            console.log('Card getBoundingClientRect():', {
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                right: rect.right,
                width: rect.width,
                height: rect.height
            });
            
            const cardTop = rect.top + window.scrollY;
            console.log('Card absolute top position:', cardTop);
            
            const offset = 150;
            const scrollToPosition = cardTop - offset;
            console.log('Target scroll position:', scrollToPosition);
            console.log('Offset:', offset);
            console.log('Will scroll be needed?', scrollToPosition !== window.scrollY);
            
            // Scroll to the card with offset
            console.log('Initiating scroll...');
            window.scrollTo({
                top: scrollToPosition,
                behavior: 'smooth'
            });
            
            // Check scroll position after scrolling
            setTimeout(() => {
                console.log('--- After scroll check (600ms) ---');
                console.log('After scroll - window.scrollY:', window.scrollY);
                const newRect = memoryCard.getBoundingClientRect();
                console.log('After scroll - card getBoundingClientRect():', {
                    top: newRect.top,
                    bottom: newRect.bottom,
                    left: newRect.left,
                    right: newRect.right
                });
                
                const viewportHeight = window.innerHeight;
                const isInViewport = newRect.top >= 0 && 
                                    newRect.bottom <= viewportHeight && 
                                    newRect.left >= 0 && 
                                    newRect.right <= window.innerWidth;
                
                console.log('Is card in viewport?', isInViewport);
                console.log('Card top relative to viewport:', newRect.top);
                console.log('Viewport height:', viewportHeight);
                
                // Check CSS after scroll
                const finalStyles = window.getComputedStyle(memoryCard);
                console.log('Final card CSS:', {
                    display: finalStyles.display,
                    visibility: finalStyles.visibility,
                    opacity: finalStyles.opacity,
                    transform: finalStyles.transform,
                    animation: finalStyles.animation
                });
            }, 600);
            
            // Add pulse animation after scroll
            console.log('Adding pulse animation...');
            setTimeout(() => {
                memoryCard.style.opacity = '1'; // Ensure card stays visible
                memoryCard.style.animation = 'pulse 0.5s ease';
                console.log('Pulse animation applied, current animation value:', memoryCard.style.animation);
            }, 500);
        } else {
            console.error('Memory card not found for ID:', memoryId);
            console.log('All memory cards on page:');
            const allCards = document.querySelectorAll('[data-memory-id]');
            console.log('Total cards found:', allCards.length);
            allCards.forEach(card => {
                console.log('- Card ID:', card.getAttribute('data-memory-id'));
            });
        }
        console.log('=== END DEBUG ===');
    } catch (error) {
        console.error('ERROR in scrollToMemory:', error);
        console.error('Error stack:', error.stack);
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
                    console.log('Timeline link clicked for memory:', memory.id);
                    e.preventDefault();
                    
                    // Inline scroll implementation
                    const memoryCard = document.querySelector(`[data-memory-id="${memory.id}"]`);
                    console.log('Found memory card:', memoryCard);
                    
                    if (memoryCard) {
                        // Log CSS before scroll
                        const beforeStyles = window.getComputedStyle(memoryCard);
                        console.log('BEFORE scroll CSS:', {
                            display: beforeStyles.display,
                            visibility: beforeStyles.visibility,
                            opacity: beforeStyles.opacity,
                            transform: beforeStyles.transform,
                            position: beforeStyles.position
                        });
                        
                        const cardRect = memoryCard.getBoundingClientRect();
                        const absoluteTop = cardRect.top + window.scrollY;
                        const scrollToPosition = absoluteTop - 150;
                        
                        console.log('Current scroll:', window.scrollY);
                        console.log('Card position:', absoluteTop);
                        console.log('Scrolling to:', scrollToPosition);
                        
                        window.scrollTo({
                            top: scrollToPosition,
                            behavior: 'smooth'
                        });
                        
                        // Check CSS after scroll
                        setTimeout(() => {
                            const afterStyles = window.getComputedStyle(memoryCard);
                            console.log('AFTER scroll CSS:', {
                                display: afterStyles.display,
                                visibility: afterStyles.visibility,
                                opacity: afterStyles.opacity,
                                transform: afterStyles.transform,
                                position: afterStyles.position
                            });
                            
                            const afterRect = memoryCard.getBoundingClientRect();
                            console.log('AFTER scroll position:', {
                                top: afterRect.top,
                                bottom: afterRect.bottom,
                                left: afterRect.left,
                                width: afterRect.width,
                                height: afterRect.height,
                                inViewport: afterRect.top >= 0 && afterRect.bottom <= window.innerHeight
                            });
                            
                            // Add pulse animation - ensure opacity stays at 1
                            memoryCard.style.opacity = '1'; // Force opacity to stay visible
                            memoryCard.style.animation = 'pulse 0.5s ease';
                            console.log('Animation applied');
                        }, 600);
                    } else {
                        console.error('Memory card not found for:', memory.id);
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

