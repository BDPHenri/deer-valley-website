// Shared header and footer injection
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  function isActive(page) {
    if (page === 'index.html' && (currentPage === 'index.html' || currentPage === '')) return true;
    return currentPage === page;
  }

  function activeClass(page) {
    return isActive(page) ? 'active' : '';
  }

  // Header
  const header = document.getElementById('site-header');
  if (header) {
    header.innerHTML = `
      <header class="site-header">
        <nav class="nav-container">
          <a href="index.html" class="nav-logo">
            <img src="images/logo.png" alt="Deer Valley Basecamp" loading="lazy">
            <span class="nav-logo-text">Deer Valley Basecamp</span>
          </a>
          <div class="nav-links" id="nav-links">
            <a href="index.html" class="nav-link ${activeClass('index.html')}">Home</a>
            <a href="gallery.html" class="nav-link ${activeClass('gallery.html')}">Gallery</a>
            <a href="guide.html" class="nav-link ${activeClass('guide.html')}">Guide</a>
            <a href="reviews.html" class="nav-link ${activeClass('reviews.html')}">Reviews</a>
            <a href="book.html" class="nav-cta">Book Now</a>
          </div>
          <button class="nav-hamburger" id="nav-hamburger" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
        <div class="nav-overlay" id="nav-overlay"></div>
      </header>
    `;

    // Mobile menu
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks = document.getElementById('nav-links');
    const overlay = document.getElementById('nav-overlay');

    function toggleMenu() {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
      overlay.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    }

    hamburger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (navLinks.classList.contains('open')) toggleMenu();
      });
    });
  }

  // Footer
  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.innerHTML = `
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <div class="footer-logo-img">
              <img src="images/logo.png" alt="Deer Valley Basecamp">
            </div>
            <div class="footer-logo">Deer Valley Basecamp</div>
            <div class="footer-tagline">Heber City, Utah · Mountain Retreat</div>
            <div class="footer-social-link">
              <a href="https://instagram.com/deervalleybasecamp" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
                <span>@deervalleybasecamp</span>
              </a>
            </div>
          </div>
          <div>
            <div class="footer-col-title">Navigate</div>
            <ul class="footer-links">
              <li><a href="index.html">Home</a></li>
              <li><a href="gallery.html">Gallery</a></li>
              <li><a href="guide.html">Guest Guide</a></li>
              <li><a href="reviews.html">Reviews</a></li>
              <li><a href="book.html">Book Now</a></li>
            </ul>
          </div>
          <div>
            <div class="footer-col-title">Contact</div>
            <ul class="footer-links">
              <li><a href="tel:+14355271971">(435) 527-1971</a></li>
              <li><a href="mailto:info@deervalleybasecamp.com">Email Us</a></li>
            </ul>
          </div>
          <div>
            <div class="footer-col-title">Also On</div>
            <div class="footer-platforms">
              <a href="#airbnb-listing" class="footer-platform-badge" target="_blank" rel="noopener">Airbnb</a>
              <a href="#vrbo-listing" class="footer-platform-badge" target="_blank" rel="noopener">VRBO</a>
              <a href="#booking-listing" class="footer-platform-badge" target="_blank" rel="noopener">Booking.com</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="footer-copyright">&copy; ${new Date().getFullYear()} Deer Valley Basecamp. All rights reserved.</div>
        </div>
      </footer>
    `;
  }
});
