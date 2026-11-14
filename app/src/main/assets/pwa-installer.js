// PWA Service Worker Registration & Install Button Handler
(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((err) => {
        console.warn('PWA Service Worker registration failed:', err);
      });
    });
  }

  let deferredPrompt = null;

  function createInstallButton() {
    if (document.getElementById('pwaInstallBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'pwaInstallBtn';
    btn.className = 'btn pwa-install-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Install PULSE Application');
    btn.innerHTML = '📲 Install App';
    btn.style.cssText = `
      background: linear-gradient(135deg, var(--accent-primary, #8b5cf6), var(--accent-blue, #0284c7));
      color: #ffffff;
      font-weight: 700;
      border: none;
      padding: 8px 16px;
      border-radius: 99px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      font-size: 0.88rem;
    `;

    btn.addEventListener('mouseenter', () => { btn.style.transform = 'translateY(-2px)'; });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'translateY(0)'; });

    btn.addEventListener('click', async () => {
      if (!deferredPrompt) {
        alert('To install PULSE on your device, tap your browser menu (⋮ or Share) and select "Add to Home Screen" or "Install App".');
        return;
      }
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
        btn.style.display = 'none';
      }
      deferredPrompt = null;
    });

    const headerBar = document.querySelector('.header-bar');
    if (headerBar) {
      headerBar.appendChild(btn);
    } else {
      const floatWrap = document.createElement('div');
      floatWrap.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;';
      floatWrap.appendChild(btn);
      document.body.appendChild(floatWrap);
    }
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    createInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    console.log('PULSE PWA installed successfully!');
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.style.display = 'none';
  });

  // Also check standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.style.display = 'none';
  }
})();
