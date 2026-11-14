/* PULSE shared navigation drawer */
(() => {
  const sidebar = document.getElementById('aurawaySidebar');
  const toggle = document.getElementById('menuToggle');
  const backdrop = document.getElementById('menuBackdrop');
  if (!sidebar || !toggle || !backdrop) return;

  const mobile = () => window.matchMedia('(max-width: 767px)').matches;
  const isOpen = () => mobile()
    ? document.body.classList.contains('sidebar-open')
    : !document.body.classList.contains('sidebar-collapsed');

  function render() {
    const open = isOpen();
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    backdrop.hidden = !open || !mobile();
  }
  function closeMenu() {
    document.body.classList.remove('sidebar-open');
    document.body.classList.add('sidebar-collapsed');
    render();
  }
  toggle.addEventListener('click', () => {
    if (mobile()) {
      document.body.classList.toggle('sidebar-open');
    } else {
      document.body.classList.toggle('sidebar-collapsed');
    }
    render();
  });
  backdrop.addEventListener('click', closeMenu);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    document.body.classList.remove('sidebar-open');
    document.body.classList.remove('sidebar-collapsed');
    render();
  });

  const currentPage = location.pathname.split('/').pop() || 'index.html';
  sidebar.querySelectorAll('.nav-links a').forEach(link => {
    const active = link.getAttribute('href') === currentPage;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  render();
})();
