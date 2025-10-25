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


// Scroll to a specific memory on the timeline (legacy - kept for compatibility)
function scrollToMemory(memoryId) {
    const memoryCard = document.querySelector(`[data-memory-id="${memoryId}"]`);
    
    if (memoryCard) {
        memoryCard.style.opacity = '1'; // Ensure card is visible
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

// Auto-detect images based on date
async function getImagesForDate(date) {
    const images = [];
    const supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    // First check for single image without number suffix (2025-09-01.jpg)
    for (const format of supportedFormats) {
        const imageUrl = `images/${date}.${format}`;
        try {
            const response = await fetch(imageUrl, { method: 'HEAD' });
            if (response.ok) {
                images.push(imageUrl);
                return images; // Found single image, return immediately
            }
        } catch {
            continue;
        }
    }
    
    // If no single image found, try numbered images (2025-09-01-1.jpg, 2025-09-01-2.jpg, etc.)
    let imageNum = 1;
    while (true) {
        let foundImage = false;
        
        // Try each format for this image number
        for (const format of supportedFormats) {
            const imageUrl = `images/${date}-${imageNum}.${format}`;
            try {
                const response = await fetch(imageUrl, { method: 'HEAD' });
                if (response.ok) {
                    images.push(imageUrl);
                    foundImage = true;
                    break; // Found this number, move to next
                }
            } catch {
                continue; // Try next format
            }
        }
        
        if (foundImage) {
            imageNum++;
        } else {
            break; // No more images found
        }
    }
    
    return images;
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
    
    // Auto-detect images or use manual media
    let mediaHtml = '';
    if (!memory.private || isUnlocked(memory.id)) {
        // Check for auto-detected images first
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'memory-media-placeholder';
        mediaContainer.setAttribute('data-date', memory.date);
        
        // Also add manual media if specified
        if (memory.media) {
            if (memory.media.type === 'image') {
                mediaHtml = `<div class="memory-media"><img src="${memory.media.url}" alt="${memory.title}"></div>`;
            } else if (memory.media.type === 'video') {
                mediaHtml = `<div class="memory-media"><video controls src="${memory.media.url}"></video></div>`;
            }
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
    
    // Truncate content for card view
    const maxLength = 200;
    let displayContent = memory.content;
    if (memory.content.length > maxLength) {
        displayContent = memory.content.substring(0, maxLength) + '...';
    }
    
    card.innerHTML = `
        <div class="memory-date">${dateStr}</div>
        <h3 class="memory-title">${memory.title}</h3>
        ${lockIcon}
        <div class="${contentClass}">${displayContent}</div>
        <div class="photo-badge-placeholder" data-date="${memory.date}"></div>
        ${mediaHtml}
        ${tagsHtml}
    `;
    
    // Load images asynchronously and show badge
    if (!memory.private || isUnlocked(memory.id)) {
        getImagesForDate(memory.date).then(images => {
            if (images.length > 0) {
                const placeholder = card.querySelector('.photo-badge-placeholder');
                if (placeholder) {
                    placeholder.innerHTML = createPhotoBadge(images.length);
                }
            }
        });
    }
    
    return card;
}

// Create thumbnail gallery for modal view
function createThumbnailGallery(images) {
    if (images.length === 0) return '';
    
    return `
        <div class="memory-thumbnail-gallery">
            ${images.map((img, idx) => `
                <div class="thumbnail-item" onclick="openGalleryViewer(${idx}, ${JSON.stringify(images).replace(/"/g, '&quot;')})">
                    <img src="${img}" alt="Memory photo ${idx + 1}">
                </div>
            `).join('')}
        </div>
    `;
}

// Create photo count badge for timeline view
function createPhotoBadge(count) {
    if (count === 0) return '';
    return `<div class="photo-badge">📸 ${count} ${count === 1 ? 'photo' : 'photos'}</div>`;
}

// Format long content with better paragraph breaks
function formatLongContent(content) {
    // If content is shorter than 500 chars, return as is
    if (content.length < 500) return content;
    
    // Split into sentences
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
    
    // Group sentences into paragraphs (roughly every 3-4 sentences or 250 chars)
    let paragraphs = [];
    let currentParagraph = '';
    
    sentences.forEach((sentence, index) => {
        currentParagraph += sentence;
        
        // Create new paragraph if we've accumulated enough content or every 3-4 sentences
        if (currentParagraph.length > 250 || (index + 1) % 3 === 0) {
            paragraphs.push(currentParagraph.trim());
            currentParagraph = ' ';
        }
    });
    
    // Add remaining content
    if (currentParagraph.trim()) {
        paragraphs.push(currentParagraph.trim());
    }
    
    // Join with double line breaks for paragraph spacing
    return paragraphs.join('\n\n');
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
async function showMemoryDetail(memory) {
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
    
    // Check for auto-detected images
    const autoImages = await getImagesForDate(memory.date);
    let autoMediaHtml = '';
    if (autoImages.length > 0) {
        autoMediaHtml = createThumbnailGallery(autoImages);
    }
    
    let tagsHtml = '';
    if (memory.tags && memory.tags.length > 0) {
        tagsHtml = '<div class="memory-tags">' + 
            memory.tags.map(tag => `<span>${tag}</span>`).join('') + 
            '</div>';
    }
    
    const formattedContent = formatLongContent(memory.content);
    
    content.innerHTML = `
        <div class="memory-date">${formatDate(memory.date)}</div>
        <h3 class="memory-title">${memory.title}</h3>
        <div class="memory-content">${formattedContent}</div>
        ${autoMediaHtml}
        ${mediaHtml}
        ${tagsHtml}
    `;
    
    modal.classList.add('show');
}

function closeMemoryModal() {
    document.getElementById('memoryModal').classList.remove('show');
}

// Gallery viewer state
let galleryState = {
    images: [],
    currentIndex: 0
};

// Open full-screen gallery viewer
function openGalleryViewer(startIndex, images) {
    galleryState.images = images;
    galleryState.currentIndex = startIndex;
    
    const viewer = document.getElementById('galleryViewer');
    if (!viewer) {
        createGalleryViewer();
    }
    
    updateGalleryViewer();
    document.getElementById('galleryViewer').classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Create gallery viewer HTML
function createGalleryViewer() {
    const viewer = document.createElement('div');
    viewer.id = 'galleryViewer';
    viewer.className = 'gallery-viewer';
    viewer.innerHTML = `
        <div class="gallery-viewer-overlay"></div>
        <button class="gallery-close" onclick="closeGalleryViewer()">✕</button>
        <button class="gallery-prev" onclick="navigateGallery(-1)">‹</button>
        <button class="gallery-next" onclick="navigateGallery(1)">›</button>
        <div class="gallery-image-container">
            <img id="galleryImage" src="" alt="Gallery image">
        </div>
        <div class="gallery-counter"></div>
    `;
    document.body.appendChild(viewer);
    
    // Close on overlay click
    viewer.querySelector('.gallery-viewer-overlay').addEventListener('click', closeGalleryViewer);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleGalleryKeyboard);
}

// Update gallery viewer with current image
function updateGalleryViewer() {
    const image = document.getElementById('galleryImage');
    const counter = document.querySelector('.gallery-counter');
    
    image.src = galleryState.images[galleryState.currentIndex];
    counter.textContent = `${galleryState.currentIndex + 1} / ${galleryState.images.length}`;
    
    // Show/hide navigation buttons
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    
    prevBtn.style.display = galleryState.currentIndex === 0 ? 'none' : 'block';
    nextBtn.style.display = galleryState.currentIndex === galleryState.images.length - 1 ? 'none' : 'block';
}

// Navigate gallery
function navigateGallery(direction) {
    galleryState.currentIndex += direction;
    
    // Wrap around
    if (galleryState.currentIndex < 0) {
        galleryState.currentIndex = galleryState.images.length - 1;
    } else if (galleryState.currentIndex >= galleryState.images.length) {
        galleryState.currentIndex = 0;
    }
    
    updateGalleryViewer();
}

// Close gallery viewer
function closeGalleryViewer() {
    const viewer = document.getElementById('galleryViewer');
    if (viewer) {
        viewer.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Handle keyboard navigation
function handleGalleryKeyboard(e) {
    const viewer = document.getElementById('galleryViewer');
    if (!viewer || !viewer.classList.contains('show')) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            navigateGallery(-1);
            break;
        case 'ArrowRight':
            navigateGallery(1);
            break;
        case 'Escape':
            closeGalleryViewer();
            break;
    }
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

