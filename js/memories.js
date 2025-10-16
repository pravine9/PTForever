let memories = [];
let currentLockedMemory = null;

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

// Load memories from JSON
async function loadMemories() {
    try {
        const response = await fetch('data/memories.json');
        memories = await response.json();
        displayMemories();
        populateFilterTags();
        populateTimelineSidebar();
    } catch (error) {
        console.error('Error loading memories:', error);
        document.getElementById('timeline').innerHTML = '<p style="text-align: center;">No memories found. Add some in data/memories.json!</p>';
    }
}

// Populate timeline dates in sidebar
function populateTimelineSidebar() {
    const container = document.getElementById('timelineDates');
    if (!container) return;
    
    // Sort memories by date
    const sortedMemories = [...memories].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = '';
    sortedMemories.forEach(memory => {
        const link = document.createElement('a');
        
        // Link to dynamic page if hasPage flag is set, otherwise scroll to card
        if (memory.hasPage) {
            link.href = `memory.html?id=${memory.id}`;
            link.onclick = null; // Let it navigate normally
        } else {
            link.href = '#memory-' + memory.id;
            link.onclick = (e) => {
                e.preventDefault();
                scrollToMemory(memory.id);
                if (window.innerWidth <= 768) {
                    toggleSidebar();
                }
            };
        }
        
        link.className = 'timeline-date';
        link.textContent = formatDate(memory.date);
        container.appendChild(link);
    });
}

// Scroll to specific memory
function scrollToMemory(memoryId) {
    const memoryCard = document.querySelector(`[data-memory-id="${memoryId}"]`);
    if (memoryCard) {
        memoryCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        memoryCard.style.animation = 'none';
        setTimeout(() => {
            memoryCard.style.animation = 'pulse 0.5s ease';
        }, 10);
    }
}

// Display memories on the timeline
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

// Create a memory card element
function createMemoryCard(memory, index) {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.setAttribute('data-memory-id', memory.id);
    card.style.animationDelay = `${index * 0.1}s`;
    
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

// Format date nicely
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

// Populate filter tags
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
        button.onclick = () => filterByTag(tag);
        filterContainer.appendChild(button);
    });
}

// Filter memories by tag
function filterByTag(tag) {
    document.querySelectorAll('.tag').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    displayMemories(tag);
}

// Password modal functions
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

// Memory detail modal
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

// Local storage functions for unlocked memories
function unlockMemory(memoryId) {
    const unlocked = JSON.parse(localStorage.getItem('unlockedMemories') || '[]');
    if (!unlocked.includes(memoryId)) {
        unlocked.push(memoryId);
        localStorage.setItem('unlockedMemories', JSON.stringify(unlocked));
    }
}

function isUnlocked(memoryId) {
    const unlocked = JSON.parse(localStorage.getItem('unlockedMemories') || '[]');
    return unlocked.includes(memoryId);
}

// Handle Enter key in password input
document.addEventListener('DOMContentLoaded', () => {
    loadMemories();
    
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }
    
    // Close modals when clicking outside
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
});

