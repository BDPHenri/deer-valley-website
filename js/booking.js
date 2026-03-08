document.addEventListener('DOMContentLoaded', () => {
  const config = window.SITE_CONFIG || {};
  const bookingConfig = config.booking || {};
  const contact = config.contact || {};
  const form = document.getElementById('booking-form');
  const iframe = document.getElementById('booking-iframe');
  const embedWrap = document.getElementById('booking-embed-wrap');
  const directLink = document.getElementById('booking-direct-link');
  const directNote = document.getElementById('booking-direct-note');
  const fallbackLink = document.getElementById('booking-fallback-link');
  const fallback = document.querySelector('.booking-widget-fallback');
  const directEmail = contact.email || 'vivian@docelarhomes.com';
  const directPhone = contact.displayPhone || '(435) 527-1971';

  if (bookingConfig.widgetUrl) {
    if (directLink) directLink.href = bookingConfig.widgetUrl;
    if (fallbackLink) fallbackLink.href = bookingConfig.widgetUrl;
    if (iframe) iframe.src = bookingConfig.widgetUrl;
    if (embedWrap) embedWrap.hidden = false;
  } else {
    if (directLink) {
      directLink.href = '#contact-form';
      directLink.removeAttribute('target');
      directLink.removeAttribute('rel');
      directLink.textContent = 'Use Contact Form';
    }
    if (directNote) {
      directNote.innerHTML = `
        Secure checkout link not configured yet. For now, contact us at
        <a href="mailto:${directEmail}">${directEmail}</a> /
        <a href="tel:${contact.phone || '+14355271971'}">${directPhone}</a>.
      `;
    }
    if (embedWrap) embedWrap.hidden = true;
  }

  if (iframe && fallback) {
    fallback.innerHTML = `
      <p>
        If the calendar does not appear, <a href="${bookingConfig.widgetUrl || '#contact-form'}" ${bookingConfig.widgetUrl ? 'target="_blank" rel="noopener"' : ''}>open secure booking</a>
        or use the inquiry form below.
      </p>
    `;
  }

  if (!form) return;

  const checkinInput = form.querySelector('[name="checkin"]');
  const checkoutInput = form.querySelector('[name="checkout"]');
  const errorEl = form.querySelector('.form-error');
  const successEl = form.querySelector('.form-success');
  const fieldsWrap = form.querySelector('.contact-form-fields');
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : '';

  if (bookingConfig.formEndpoint) {
    form.action = bookingConfig.formEndpoint;
  } else if (submitBtn) {
    submitBtn.textContent = 'Email Us Instead';
  }

  // Set minimum dates
  const today = new Date().toISOString().split('T')[0];
  if (checkinInput) checkinInput.min = today;
  if (checkoutInput) checkoutInput.min = today;

  // Update checkout min when checkin changes
  if (checkinInput && checkoutInput) {
    checkinInput.addEventListener('change', () => {
      checkoutInput.min = checkinInput.value;
      if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
        checkoutInput.value = '';
      }
    });
  }

  // Hospitable widget dynamic height
  window.addEventListener('message', (event) => {
    if (event.data.iframeHeight) {
      const iframe = document.getElementById('booking-iframe');
      if (iframe) iframe.style.height = event.data.iframeHeight + 'px';
    }
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    const email = form.querySelector('[name="email"]').value;
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errorEl.textContent = 'Please enter a valid email address.';
      errorEl.classList.add('active');
      return;
    }

    if (!bookingConfig.formEndpoint) {
      errorEl.innerHTML = `
        The inquiry form is not connected yet. Please email
        <a href="mailto:${directEmail}">${directEmail}</a> or call
        <a href="tel:${contact.phone || '+14355271971'}">${directPhone}</a>.
      `;
      errorEl.classList.add('active');
      return;
    }

    errorEl.classList.remove('active');
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        if (fieldsWrap) fieldsWrap.hidden = true;
        successEl.classList.add('active');
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      errorEl.textContent = 'Something went wrong. Please try again or contact us directly.';
      errorEl.classList.add('active');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
});
