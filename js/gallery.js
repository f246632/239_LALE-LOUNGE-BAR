/* ===================================
   LALE LOUNGE BAR - Gallery & Lightbox
   Image Gallery with Lightbox Modal
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    initGallery();
});

// ==================== GALLERY & LIGHTBOX ====================
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCounter = document.getElementById('lightboxCounter');

    let currentIndex = 0;
    const images = [];

    // Collect all gallery images
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        images.push({
            src: img.src,
            alt: img.alt
        });

        // Click event to open lightbox
        item.addEventListener('click', () => {
            openLightbox(index);
        });
    });

    // Open lightbox
    function openLightbox(index) {
        currentIndex = index;
        updateLightbox();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus trap
        lightboxClose.focus();
    }

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Update lightbox content
    function updateLightbox() {
        const image = images[currentIndex];
        lightboxImg.src = image.src;
        lightboxImg.alt = image.alt;
        lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;

        // Preload next and previous images for smoother experience
        preloadAdjacentImages();
    }

    // Preload adjacent images
    function preloadAdjacentImages() {
        const nextIndex = (currentIndex + 1) % images.length;
        const prevIndex = (currentIndex - 1 + images.length) % images.length;

        const nextImg = new Image();
        nextImg.src = images[nextIndex].src;

        const prevImg = new Image();
        prevImg.src = images[prevIndex].src;
    }

    // Navigate to previous image
    function showPrevious() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateLightbox();
        animateLightboxTransition('prev');
    }

    // Navigate to next image
    function showNext() {
        currentIndex = (currentIndex + 1) % images.length;
        updateLightbox();
        animateLightboxTransition('next');
    }

    // Animate lightbox transitions
    function animateLightboxTransition(direction) {
        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = direction === 'next' ? 'translateX(50px)' : 'translateX(-50px)';

        setTimeout(() => {
            lightboxImg.style.opacity = '1';
            lightboxImg.style.transform = 'translateX(0)';
        }, 50);
    }

    // Event listeners
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', showPrevious);
    lightboxNext.addEventListener('click', showNext);

    // Click outside image to close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPrevious();
                break;
            case 'ArrowRight':
                showNext();
                break;
        }
    });

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - show next
                showNext();
            } else {
                // Swipe right - show previous
                showPrevious();
            }
        }
    }

    // Pinch to zoom (optional enhancement)
    let initialDistance = 0;
    let currentScale = 1;

    lightboxImg.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialDistance = getDistance(e.touches[0], e.touches[1]);
        }
    }, { passive: true });

    lightboxImg.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            const scale = currentDistance / initialDistance;
            currentScale = Math.min(Math.max(scale, 0.5), 3); // Limit between 0.5x and 3x
            lightboxImg.style.transform = `scale(${currentScale})`;
        }
    });

    lightboxImg.addEventListener('touchend', () => {
        // Reset zoom on touch end
        setTimeout(() => {
            lightboxImg.style.transform = 'scale(1)';
            currentScale = 1;
        }, 300);
    });

    function getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Lazy load gallery images
    const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target.querySelector('img');
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                galleryObserver.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '50px'
    });

    galleryItems.forEach(item => {
        galleryObserver.observe(item);
    });

    // Add loading animation
    galleryItems.forEach((item, index) => {
        item.style.animation = `fadeInUp 0.6s ease forwards ${index * 0.1}s`;
        item.style.opacity = '0';
    });
}

// Add CSS for fade-in animation (if not already in CSS)
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    #lightboxImg {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .gallery-item {
        cursor: pointer;
        user-select: none;
    }

    .gallery-item img {
        pointer-events: none;
    }
`;
document.head.appendChild(style);

console.log('✨ Gallery initialized with', document.querySelectorAll('.gallery-item').length, 'images');