document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxCounter = document.getElementById('lightbox-counter');
  let currentIndex = 0;
  let visibleItems = [];

  function updateVisibleItems() {
    visibleItems = Array.from(document.querySelectorAll('.gallery-item:not([style*="display: none"])'));
  }

  function openLightbox(index) {
    updateVisibleItems();
    currentIndex = index;
    const img = visibleItems[currentIndex].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCounter.textContent = `${currentIndex + 1} / ${visibleItems.length}`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigate(direction) {
    currentIndex = (currentIndex + direction + visibleItems.length) % visibleItems.length;
    const img = visibleItems[currentIndex].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCounter.textContent = `${currentIndex + 1} / ${visibleItems.length}`;
  }

  // Click handlers on gallery items
  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      updateVisibleItems();
      const idx = visibleItems.indexOf(item);
      if (idx !== -1) openLightbox(idx);
    });
  });

  // Lightbox controls
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev').addEventListener('click', () => navigate(-1));
  document.getElementById('lightbox-next').addEventListener('click', () => navigate(1));

  // Click outside image to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // Touch swipe
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  lightbox.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      navigate(diff > 0 ? 1 : -1);
    }
  });

  // Category filter
  const tabs = document.querySelectorAll('.gallery-tabs .cat-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.dataset.category;
      items.forEach(item => {
        if (cat === 'all' || item.dataset.category === cat) {
          item.style.display = '';
          item.classList.remove('visible');
          setTimeout(() => item.classList.add('visible'), 50);
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
});
