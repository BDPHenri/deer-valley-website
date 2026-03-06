document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const checkinInput = form.querySelector('[name="checkin"]');
  const checkoutInput = form.querySelector('[name="checkout"]');

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

    const errorEl = form.querySelector('.form-error');
    const successEl = form.querySelector('.form-success');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Basic validation
    const email = form.querySelector('[name="email"]').value;
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errorEl.textContent = 'Please enter a valid email address.';
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
        form.style.display = 'none';
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
