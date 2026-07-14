/**
 * EQV Group — shared navigation
 * Edit this ONE file to update the nav across all pages.
 *
 * To add a new page: add an entry to NAV_LINKS below.
 */

const NAV_LINKS = [
  { label: 'Home',       href: 'index.html'   },
  { label: 'About',      href: 'about.html'   },
  { label: 'Contact Us', href: 'contact.html' },
];
/* RELAY is temporarily pulled from the public nav while patent filing is
   in progress — the file itself lives in _relay-hold/relay.html so it can
   be moved straight back to the root and re-added above when it's safe to
   disclose again. The dark-lockup logic just below is left in place so
   restoring it is a two-step job: move the file back, add the line above. */

(function injectNav() {
  const current = location.pathname.split('/').pop() || 'index.html';

  /* RELAY gets its own distinct lockup — "RELAY" leads, with a small
     "by eqv Group" caption underneath — while every other page keeps
     the standard eqv/GROUP brand mark. */
  const brandHTML = current === 'relay.html'
    ? `
    <a class="nav-brand nav-brand--relay" href="relay.html">
      <span class="brand-relay">RELAY</span>
      <span class="brand-relay-by">by eqv Group</span>
    </a>`
    : `
    <a class="nav-brand" href="index.html">
      <span class="brand-eqv">eqv</span>
      <span class="brand-group">Group</span>
    </a>`;

  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.innerHTML = `
    ${brandHTML}
    <ul class="nav-links">
      ${NAV_LINKS.map(link => `
        <li>
          <a href="${link.href}"
             class="nav-link${current === link.href ? ' active' : ''}"
          >${link.label}</a>
        </li>
      `).join('')}
    </ul>
    <button class="nav-hamburger" aria-label="Open menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  `;

  document.body.prepend(nav);

  /* mobile toggle */
  const btn = nav.querySelector('.nav-hamburger');
  const ul  = nav.querySelector('.nav-links');
  btn.addEventListener('click', () => {
    const open = ul.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
})();
