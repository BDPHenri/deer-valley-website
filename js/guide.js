document.addEventListener('DOMContentLoaded', () => {
  // Activity category filter
  const tabs = document.querySelectorAll('#activities .cat-tab');
  const items = document.querySelectorAll('#activities-list .place-item');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.dataset.cat;
      items.forEach(item => {
        if (cat === 'all' || item.dataset.cat === cat) {
          item.style.display = 'flex';
          item.classList.remove('visible');
          setTimeout(() => item.classList.add('visible'), 50);
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Guide section nav scrollspy
  const guideNav = document.querySelector('.guide-nav');
  if (!guideNav) return;

  const navLinks = guideNav.querySelectorAll('.guide-nav-link');
  const sectionIds = Array.from(navLinks).map(link => link.getAttribute('href').substring(1));

  window.addEventListener('scroll', () => {
    let current = '';
    sectionIds.forEach(id => {
      const section = document.getElementById(id);
      if (section) {
        const top = section.offsetTop - 140;
        if (pageYOffset >= top) current = id;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  });
});
