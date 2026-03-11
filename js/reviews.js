/* global window, document */
(function () {
  const REVIEWS_FEED_URL = window.DEER_VALLEY_REVIEWS_FEED_URL || '';

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizePlatform(raw) {
    const value = String(raw || '').toLowerCase();
    if (value.includes('book')) return 'booking';
    if (value.includes('vrbo')) return 'vrbo';
    return 'airbnb';
  }

  function platformLabel(platform) {
    if (platform === 'booking') return 'Booking.com';
    if (platform === 'vrbo') return 'VRBO';
    return 'Airbnb';
  }

  function initialsFromName(name) {
    const parts = String(name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return 'GV';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  function starsHtml(rating) {
    const safeRating = Math.max(1, Math.min(5, Number(rating) || 5));
    return '&#9733;'.repeat(safeRating);
  }

  function normalizeReview(input) {
    const platform = normalizePlatform(input.platform || input.source || input.channel);
    const guestName = input.guest_name || input.reviewer_name || input.guestName || 'Guest';
    return {
      id: input.id || input.review_id || `${platform}-${guestName}-${input.created_at || input.date || ''}`,
      platform: platform,
      platformLabel: platformLabel(platform),
      guestName: guestName,
      dateText: input.date_text || input.dateText || input.review_month || input.date || 'Recent stay',
      rating: Number(input.rating || input.stars || 5) || 5,
      text: input.text || input.review_text || input.comment || '',
    };
  }

  function reviewCardHtml(review) {
    return `
      <div class="review-card fade-in visible" data-platform="${escapeHtml(review.platform)}">
        <div class="review-header">
          <div class="review-avatar">${escapeHtml(initialsFromName(review.guestName))}</div>
          <div class="review-info">
            <div class="review-name">${escapeHtml(review.guestName)}</div>
            <div class="review-date">${escapeHtml(review.dateText)}</div>
          </div>
          <div class="review-platform-badge">${escapeHtml(review.platformLabel)}</div>
        </div>
        <div class="review-stars">${starsHtml(review.rating)}</div>
        <p class="review-text">"${escapeHtml(review.text)}"</p>
      </div>
    `;
  }

  function renderReviews(reviews) {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;
    grid.innerHTML = reviews.map(reviewCardHtml).join('');
  }

  function renderEmptyState(message) {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;
    grid.innerHTML = `
      <div class="reviews-empty">
        <h3>Real guest reviews will appear here automatically.</h3>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }

  function setStatus(text) {
    const statusEl = document.getElementById('reviews-status');
    if (!statusEl) return;
    statusEl.textContent = text;
  }

  function updateSummary(reviews) {
    const total = reviews.length;
    const avg = total
      ? (reviews.reduce((sum, review) => sum + (Number(review.rating) || 5), 0) / total).toFixed(1)
      : '—';

    const scoreEl = document.getElementById('rating-score');
    const countEl = document.getElementById('rating-count');
    if (scoreEl) scoreEl.textContent = avg;
    if (countEl) {
      countEl.textContent = total
        ? `Across ${total} reviews on Airbnb, VRBO & Booking.com`
        : 'No live reviews yet. Connect Hospitable webhook to populate automatically.';
    }

    const byPlatform = { airbnb: 0, vrbo: 0, booking: 0 };
    reviews.forEach((review) => {
      if (byPlatform[review.platform] !== undefined) {
        byPlatform[review.platform] += 1;
      }
    });

    const airbnbCount = document.getElementById('platform-count-airbnb');
    const vrboCount = document.getElementById('platform-count-vrbo');
    const bookingCount = document.getElementById('platform-count-booking');

    if (airbnbCount) airbnbCount.textContent = String(byPlatform.airbnb || 0);
    if (vrboCount) vrboCount.textContent = String(byPlatform.vrbo || 0);
    if (bookingCount) bookingCount.textContent = String(byPlatform.booking || 0);
  }

  function initFilters() {
    const tabs = Array.from(document.querySelectorAll('.reviews-tabs .cat-tab'));
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', function () {
        tabs.forEach((item) => item.classList.remove('active'));
        tab.classList.add('active');

        const selected = tab.getAttribute('data-platform');
        const cards = Array.from(document.querySelectorAll('.review-card'));

        cards.forEach((card) => {
          const platform = card.getAttribute('data-platform');
          const show = selected === 'all' || platform === selected;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  async function loadReviewsFromFeed() {
    if (!REVIEWS_FEED_URL) {
      throw new Error('Live reviews feed URL is not configured.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(REVIEWS_FEED_URL, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Feed request failed: ${response.status}`);
      }

      const payload = await response.json();
      const rawReviews = Array.isArray(payload) ? payload : payload.reviews;
      if (!Array.isArray(rawReviews)) {
        throw new Error('Feed payload must be an array or { reviews: [] }');
      }

      const normalized = rawReviews
        .map(normalizeReview)
        .filter((review) => review.text && review.guestName);

      return normalized;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function init() {
    try {
      const liveReviews = await loadReviewsFromFeed();
      if (!liveReviews.length) {
        renderEmptyState('No published reviews found in your connected feed yet.');
        updateSummary([]);
        setStatus('Connected. Waiting for first published review.');
      } else {
        renderReviews(liveReviews);
        updateSummary(liveReviews);
        setStatus(`Live feed connected. ${liveReviews.length} reviews loaded.`);
      }
    } catch (error) {
      console.error('Reviews feed error:', error);
      renderEmptyState('Feed not connected. Set DEER_VALLEY_REVIEWS_FEED_URL to your Supabase public reviews function.');
      updateSummary([]);
      setStatus('Feed unavailable. No fallback reviews are displayed.');
    }

    initFilters();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
