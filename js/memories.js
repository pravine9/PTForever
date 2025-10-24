let memories = [];
let currentLockedMemory = null;

// Load all our memories
async function loadMemories() {
    try {
        const response = await fetch('data/memories.json');
        memories = await response.json();
        displayMemories();
        populateFilterTags();
        // Timeline sidebar is populated by shared.js
    } catch (error) {
        console.error('Error loading memories:', error);
        document.getElementById('timeline').innerHTML = '<p style="text-align: center;">No memories found. Add some in data/memories.json!</p>';
    }
}


// Scroll to a specific memory on the timeline
function scrollToMemory(memoryId) {
    console.log('scrollToMemory called with ID:', memoryId);
    const memoryCard = document.querySelector(`[data-memory-id="${memoryId}"]`);
    console.log('Memory card found:', memoryCard);
    
    if (memoryCard) {
        console.log('Scrolling to memory:', memoryId);
        // Don't remove animation - this causes opacity to go to 0!
        // memoryCard.style.animation = 'none';
        
        // Ensure card is visible
        memoryCard.style.opacity = '1';
        
        memoryCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
            memoryCard.style.animation = 'pulse 0.5s ease';
        }, 600);
    }
}

// Show all our memories on the timeline
function displayMemories(filterTag = 'all') {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';
    
    const filteredMemories = filterTag === 'all' 
        ? memories 
        : memories.filter(memory => memory.tags && memory.tags.includes(filterTag));
    
    // Sort by date (newest first)
    filteredMemories.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    filteredMemories.forEach((memory, index) => {
        const card = createMemoryCard(memory, index);
        timeline.appendChild(card);
    });
}

// Create a memory card
function createMemoryCard(memory, index) {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.setAttribute('data-memory-id', memory.id);
    // Reduced delay for faster loading - max 0.5s delay for any card
    card.style.animationDelay = `${Math.min(index * 0.05, 0.5)}s`;
    
    if (memory.private && !isUnlocked(memory.id)) {
        card.classList.add('memory-locked');
        card.onclick = () => showPasswordModal(memory);
    } else {
        card.onclick = () => showMemoryDetail(memory);
    }
    
    const dateStr = formatDate(memory.date);
    
    let mediaHtml = '';
    if (memory.media && !memory.private) {
        if (memory.media.type === 'image') {
            mediaHtml = `<div class="memory-media"><img src="${memory.media.url}" alt="${memory.title}"></div>`;
        } else if (memory.media.type === 'video') {
            mediaHtml = `<div class="memory-media"><video controls src="${memory.media.url}"></video></div>`;
        }
    }
    
    let tagsHtml = '';
    if (memory.tags && memory.tags.length > 0) {
        tagsHtml = '<div class="memory-tags">' + 
            memory.tags.map(tag => `<span>${tag}</span>`).join('') + 
            '</div>';
    }
    
    const contentClass = (memory.private && !isUnlocked(memory.id)) ? 'memory-content blur' : 'memory-content';
    const lockIcon = (memory.private && !isUnlocked(memory.id)) ? '<div class="lock-icon">🔒</div>' : '';
    
    card.innerHTML = `
        <div class="memory-date">${dateStr}</div>
        <h3 class="memory-title">${memory.title}</h3>
        ${lockIcon}
        <div class="${contentClass}">${memory.content}</div>
        ${mediaHtml}
        ${tagsHtml}
    `;
    
    return card;
}

// Make dates look pretty
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

// Create filter tags from our memories
function populateFilterTags() {
    const allTags = new Set();
    memories.forEach(memory => {
        if (memory.tags) {
            memory.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    const filterContainer = document.getElementById('filterTags');
    
    allTags.forEach(tag => {
        const button = document.createElement('button');
        button.className = 'tag';
        button.textContent = tag;
        button.dataset.tag = tag;
        button.onclick = function() { filterByTag(tag, this); };
        filterContainer.appendChild(button);
    });
}

// Filter our memories by tag
function filterByTag(tag, element) {
    document.querySelectorAll('.tag').forEach(btn => btn.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    }
    displayMemories(tag);
}

// Show the password prompt for locked memories
function showPasswordModal(memory) {
    currentLockedMemory = memory;
    document.getElementById('passwordModal').classList.add('show');
    document.getElementById('passwordError').textContent = '';
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordInput').focus();
}

function closeModal() {
    document.getElementById('passwordModal').classList.remove('show');
    currentLockedMemory = null;
}

function checkPassword() {
    const password = document.getElementById('passwordInput').value;
    const correctPassword = currentLockedMemory.password || 'forever';
    
    if (password === correctPassword) {
        unlockMemory(currentLockedMemory.id);
        closeModal();
        displayMemories();
    } else {
        document.getElementById('passwordError').textContent = 'Incorrect password. Try again!';
    }
}

// Show a memory in a popup
function showMemoryDetail(memory) {
    if (memory.private && !isUnlocked(memory.id)) {
        showPasswordModal(memory);
        return;
    }
    
    const modal = document.getElementById('memoryModal');
    const content = document.getElementById('memoryContent');
    
    let mediaHtml = '';
    if (memory.media) {
        if (memory.media.type === 'image') {
            mediaHtml = `<div class="memory-media"><img src="${memory.media.url}" alt="${memory.title}"></div>`;
        } else if (memory.media.type === 'video') {
            mediaHtml = `<div class="memory-media"><video controls src="${memory.media.url}"></video></div>`;
        }
    }
    
    let tagsHtml = '';
    if (memory.tags && memory.tags.length > 0) {
        tagsHtml = '<div class="memory-tags">' + 
            memory.tags.map(tag => `<span>${tag}</span>`).join('') + 
            '</div>';
    }
    
    content.innerHTML = `
        <div class="memory-date">${formatDate(memory.date)}</div>
        <h3 class="memory-title">${memory.title}</h3>
        <div class="memory-content">${memory.content}</div>
        ${mediaHtml}
        ${tagsHtml}
    `;
    
    modal.classList.add('show');
}

function closeMemoryModal() {
    document.getElementById('memoryModal').classList.remove('show');
}

// Save unlocked memories to your browser
function unlockMemory(memoryId) {
    const unlocked = JSON.parse(localStorage.getItem('unlockedMemories') || '[]');
    if (!unlocked.includes(memoryId)) {
        unlocked.push(memoryId);
        localStorage.setItem('unlockedMemories', JSON.stringify(unlocked));
    }
}

// Check if a memory has been unlocked
function isUnlocked(memoryId) {
    const unlocked = JSON.parse(localStorage.getItem('unlockedMemories') || '[]');
    return unlocked.includes(memoryId);
}

// Prevent auto-scroll immediately
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

// Clear any hash from URL on page load to prevent auto-scroll
if (window.location.hash && !sessionStorage.getItem('intentionalHash')) {
    // Remove the hash without reloading the page
    history.replaceState(null, null, window.location.pathname);
}

// Set up everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Force scroll to top on load
    console.log('Page loaded, scrolling to top');
    console.log('URL hash:', window.location.hash);
    window.scrollTo(0, 0);
    
    loadMemories();
    populateTimelineSidebar(); // Call the shared function
    
    // Add click handler for the "All" button
    const allButton = document.querySelector('[data-tag="all"]');
    if (allButton) {
        allButton.onclick = function() { filterByTag('all', this); };
    }
    
    // Check if there's a hash in the URL to scroll to a specific memory
    if (window.location.hash) {
        const hash = window.location.hash.substring(1); // Remove the # symbol
        if (hash.startsWith('memory-')) {
            const memoryId = hash.replace('memory-', '');
            // Wait for memories to load AND animations to complete before scrolling
            setTimeout(() => {
                scrollToMemory(memoryId);
            }, 1500);
        }
    }
    
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }
    
    // Close popups when clicking outside
    document.getElementById('passwordModal').addEventListener('click', (e) => {
        if (e.target.id === 'passwordModal') {
            closeModal();
        }
    });
    
    document.getElementById('memoryModal').addEventListener('click', (e) => {
        if (e.target.id === 'memoryModal') {
            closeMemoryModal();
        }
    });
    
    // Ensure page stays at top after everything loads
    setTimeout(() => {
        if (!window.location.hash) {
            window.scrollTo(0, 0);
        }
    }, 100);
});

