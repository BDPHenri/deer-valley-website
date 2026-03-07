document.addEventListener('DOMContentLoaded', () => {
  const config = window.SITE_CONFIG || {};
  const bookingConfig = config.booking || {};
  const contact = config.contact || {};
  const form = document.getElementById('booking-form');
  const iframe = document.getElementById('booking-iframe');
  const fallback = document.querySelector('.booking-widget-fallback');
  const directEmail = contact.email || 'info@deervalleybasecamp.com';
  const directPhone = contact.displayPhone || '(435) 527-1971';

  if (iframe) {
    if (bookingConfig.widgetUrl) {
      iframe.src = bookingConfig.widgetUrl;
    } else {
      iframe.hidden = true;
      if (fallback) {
        fallback.innerHTML = `
          <p>
            Direct booking will be available here soon. For now, use the inquiry form below
            or contact us at <a href="mailto:${directEmail}">${directEmail}</a> /
            <a href="tel:${contact.phone || '+14355271971'}">${directPhone}</a>.
          </p>
        `;
      }
    }
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
