/* PULSE universal portal switcher — available on login screens and dashboards. */
(() => {
  const portals = [
    { id: 'student', label: 'Student', short: 'PULSE', href: 'index.html', icon: '🎓' },
    { id: 'teacher', label: 'Teacher', short: 'PULSE-T', href: 'teacher.html', icon: '👩‍🏫' },
    { id: 'parent', label: 'Parent', short: 'PULSE-P', href: 'parent.html', icon: '👨‍👩‍👧' }
  ];

  const currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const current = currentFile.startsWith('teacher') ? 'teacher'
    : currentFile.startsWith('parent') ? 'parent' : 'student';

  function mount() {
    if (!document.body || document.getElementById('pulsePortalSwitcher')) return;
    const root = document.createElement('div');
    root.id = 'pulsePortalSwitcher';
    root.innerHTML = `
      <style>
        #pulsePortalSwitcher{position:fixed;right:16px;bottom:16px;z-index:11000;font-family:inherit}
        #pulsePortalSwitcher *{box-sizing:border-box}
        #pulsePortalSwitcher .pulse-switch-trigger{display:flex;align-items:center;gap:9px;min-height:46px;padding:10px 15px;border:1px solid rgba(148,163,184,.3);border-radius:14px;background:#171d35;color:#fff;font:inherit;font-size:13px;font-weight:700;box-shadow:0 10px 32px rgba(0,0,0,.3);cursor:pointer}
        #pulsePortalSwitcher .pulse-switch-trigger:focus-visible,#pulsePortalSwitcher a:focus-visible{outline:3px solid #38bdf8;outline-offset:3px}
        #pulsePortalSwitcher .pulse-switch-trigger .pulse-switch-chevron{font-size:11px;opacity:.75}
        #pulsePortalSwitcher .pulse-switch-menu{position:absolute;right:0;bottom:56px;width:min(260px,calc(100vw - 32px));padding:9px;border:1px solid rgba(148,163,184,.25);border-radius:16px;background:#151b30;box-shadow:0 18px 48px rgba(0,0,0,.38);display:none}
        #pulsePortalSwitcher[data-open="true"] .pulse-switch-menu{display:grid;gap:5px}
        #pulsePortalSwitcher .pulse-switch-heading{padding:8px 10px 5px;color:#a8b2c7;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
        #pulsePortalSwitcher .pulse-switch-menu a{display:flex;align-items:center;gap:11px;padding:11px 12px;border:1px solid transparent;border-radius:11px;color:#e5e7eb;text-decoration:none;font-size:13px;font-weight:650}
        #pulsePortalSwitcher .pulse-switch-menu a:hover{background:rgba(148,163,184,.12);border-color:rgba(148,163,184,.2)}
        #pulsePortalSwitcher .pulse-switch-menu a[aria-current="page"]{background:rgba(99,102,241,.2);border-color:rgba(129,140,248,.4);color:#fff}
        #pulsePortalSwitcher .pulse-switch-menu small{display:block;margin-top:2px;color:#a8b2c7;font-size:11px;font-weight:500}
        #pulsePortalSwitcher .pulse-switch-note{padding:8px 10px 5px;color:#a8b2c7;font-size:10px;line-height:1.45}
        @media(max-width:480px){#pulsePortalSwitcher{right:12px;bottom:12px}#pulsePortalSwitcher .pulse-switch-trigger{min-height:44px;padding:9px 12px}}
        @media(prefers-reduced-motion:no-preference){#pulsePortalSwitcher .pulse-switch-trigger{transition:transform .16s ease,background .16s ease}#pulsePortalSwitcher .pulse-switch-trigger:active{transform:scale(.98)}}
      </style>
      <button class="pulse-switch-trigger" type="button" aria-expanded="false" aria-controls="pulsePortalSwitchMenu">
        <span aria-hidden="true">🔄</span><span>Switch portal</span><span class="pulse-switch-chevron" aria-hidden="true">▲</span>
      </button>
      <nav class="pulse-switch-menu" id="pulsePortalSwitchMenu" aria-label="Choose a PULSE portal">
        <div class="pulse-switch-heading">Go to portal</div>
        ${portals.map(portal => `
          <a href="${portal.href}" ${portal.id === current ? 'aria-current="page"' : ''}>
            <span aria-hidden="true">${portal.icon}</span>
            <span>${portal.label}<small>${portal.short}${portal.id === current ? ' · Current portal' : ''}</small></span>
          </a>`).join('')}
        <div class="pulse-switch-note">Your next portal will verify its own sign-in. Switching here does not grant access to another role.</div>
      </nav>`;
    document.body.appendChild(root);
    const trigger = root.querySelector('.pulse-switch-trigger');
    const close = () => { root.dataset.open = 'false'; trigger.setAttribute('aria-expanded', 'false'); };
    trigger.addEventListener('click', () => {
      const open = root.dataset.open !== 'true';
      root.dataset.open = String(open);
      trigger.setAttribute('aria-expanded', String(open));
    });
    root.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('click', event => { if (!root.contains(event.target)) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') { close(); trigger.focus(); } });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();

  // Student auth replaces the body to render its login screen; restore the switcher afterward.
  const observer = new MutationObserver(() => mount());
  const startObserver = () => { if (document.body) observer.observe(document.body, { childList: true }); };
  if (document.body) startObserver();
  else document.addEventListener('DOMContentLoaded', startObserver, { once: true });
})();