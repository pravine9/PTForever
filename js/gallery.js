let memories = [];
let allPhotos = [];
let filteredPhotos = [];

// Load memories and extract all photos
async function loadGallery() {
    try {
        const response = await fetch('data/memories.json');
        memories = await response.json();
        await extractAllPhotos();
        displayGalleryStats();
        displayGallery();
        populateGalleryFilterTags();
        populateTimelineSidebar();
    } catch (error) {
        console.error('Error loading gallery:', error);
        document.getElementById('gallery').innerHTML = '<p style="text-align: center;">Error loading photos.</p>';
    }
}

// Extract all photos from all memories
async function extractAllPhotos() {
    allPhotos = [];
    
    for (const memory of memories) {
        // Skip private memories that aren't unlocked
        if (memory.private && !isUnlocked(memory.id)) {
            continue;
        }
        
        // Get auto-detected images
        const images = await getImagesForDate(memory.date);
        
        // Add each image with memory context
        images.forEach(imageUrl => {
            allPhotos.push({
                url: imageUrl,
                memory: memory,
                date: memory.date,
                title: memory.title,
                tags: memory.tags || []
            });
        });
    }
    
    // Sort by date (newest first)
    allPhotos.sort((a, b) => new Date(b.date) - new Date(a.date));
    filteredPhotos = [...allPhotos];
}

// Auto-detect images based on date (same as memories.js)
async function getImagesForDate(date) {
    const images = [];
    const supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    // First check for single image without number suffix
    for (const format of supportedFormats) {
        const imageUrl = `images/${date}.${format}`;
        try {
            const response = await fetch(imageUrl, { method: 'HEAD' });
            if (response.ok) {
                images.push(imageUrl);
                return images;
            }
        } catch {
            continue;
        }
    }
    
    // Try numbered images
    let imageNum = 1;
    while (true) {
        let foundImage = false;
        
        for (const format of supportedFormats) {
            const imageUrl = `images/${date}-${imageNum}.${format}`;
            try {
                const response = await fetch(imageUrl, { method: 'HEAD' });
                if (response.ok) {
                    images.push(imageUrl);
                    foundImage = true;
                    break;
                }
            } catch {
                continue;
            }
        }
        
        if (foundImage) {
            imageNum++;
        } else {
            break;
        }
    }
    
    return images;
}

// Display gallery stats
function displayGalleryStats() {
    const stats = document.getElementById('galleryStats');
    const photoCount = filteredPhotos.length;
    const memoryCount = new Set(filteredPhotos.map(p => p.memory.id)).size;
    
    stats.innerHTML = `
        <div class="stat-item">
            <span class="stat-number">${photoCount}</span>
            <span class="stat-label">${photoCount === 1 ? 'Photo' : 'Photos'}</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${memoryCount}</span>
            <span class="stat-label">${memoryCount === 1 ? 'Memory' : 'Memories'}</span>
        </div>
    `;
}

// Display gallery photos
function displayGallery() {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    
    if (filteredPhotos.length === 0) {
        gallery.innerHTML = '<p class="no-photos">No photos found</p>';
        return;
    }
    
    filteredPhotos.forEach((photo, index) => {
        const photoCard = createPhotoCard(photo, index);
        gallery.appendChild(photoCard);
    });
}

// Create a photo card
function createPhotoCard(photo, index) {
    const card = document.createElement('div');
    card.className = 'gallery-photo-card';
    card.style.animationDelay = `${Math.min(index * 0.02, 0.5)}s`;
    
    const dateStr = formatDate(photo.date);
    
    card.innerHTML = `
        <div class="gallery-photo-wrapper" onclick='openGalleryViewer(${index}, ${JSON.stringify(filteredPhotos.map(p => p.url)).replace(/"/g, '&quot;')})'>
            <img src="${photo.url}" alt="${photo.title}" loading="lazy">
            <div class="gallery-photo-overlay">
                <div class="gallery-photo-title">${photo.title}</div>
                <div class="gallery-photo-date">${dateStr}</div>
            </div>
        </div>
    `;
    
    return card;
}

// Format date
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

// Populate filter tags
function populateGalleryFilterTags() {
    const allTags = new Set();
    allPhotos.forEach(photo => {
        photo.tags.forEach(tag => allTags.add(tag));
    });
    
    const filterContainer = document.getElementById('galleryFilterTags');
    filterContainer.innerHTML = '';
    
    allTags.forEach(tag => {
        const button = document.createElement('button');
        button.className = 'tag';
        button.textContent = tag;
        button.dataset.tag = tag;
        button.onclick = function() { filterGalleryByTag(tag, this); };
        filterContainer.appendChild(button);
    });
}

// Filter gallery by tag
function filterGalleryByTag(tag, element) {
    document.querySelectorAll('.tag').forEach(btn => btn.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    }
    
    if (tag === 'all') {
        filteredPhotos = [...allPhotos];
    } else {
        filteredPhotos = allPhotos.filter(photo => photo.tags.includes(tag));
    }
    
    displayGalleryStats();
    displayGallery();
}

// Check if memory is unlocked
function isUnlocked(memoryId) {
    const unlocked = JSON.parse(localStorage.getItem('unlockedMemories') || '[]');
    return unlocked.includes(memoryId);
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
    document.body.style.overflow = 'hidden';
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
    
    viewer.querySelector('.gallery-viewer-overlay').addEventListener('click', closeGalleryViewer);
    document.addEventListener('keydown', handleGalleryKeyboard);
}

// Update gallery viewer
function updateGalleryViewer() {
    const image = document.getElementById('galleryImage');
    const counter = document.querySelector('.gallery-counter');
    
    image.src = galleryState.images[galleryState.currentIndex];
    counter.textContent = `${galleryState.currentIndex + 1} / ${galleryState.images.length}`;
    
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    
    prevBtn.style.display = galleryState.currentIndex === 0 ? 'none' : 'block';
    nextBtn.style.display = galleryState.currentIndex === galleryState.images.length - 1 ? 'none' : 'block';
}

// Navigate gallery
function navigateGallery(direction) {
    galleryState.currentIndex += direction;
    
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
        document.body.style.overflow = '';
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
    loadGallery();
});

