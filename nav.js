/**
 * RELAY: navigation behaviour.
 *
 * The nav markup itself lives in the page (see _partials/nav.html and
 * build.py). This file only adds behaviour on top: active state, the
 * mobile menu, and scroll reveal. If it fails to load, the nav still
 * renders and every link still works.
 */
(function () {
  'use strict';

  /* Tell CSS that JS is running, so scroll-reveal elements are safe to
     hide. Without this class they stay visible : no JS, no blank page. */
  document.documentElement.classList.add('js');

  var nav = document.querySelector('.site-nav');
  if (!nav) return;

  /* ── Active page ──
     School's sub-pages (how it works, evidence) aren't in the primary
     nav directly, so they light up "School" there; the dropdown item
     for the exact current page gets its own active state too. */
  var sectionPages = {
    'school-evidence.html': 'school.html',
    'data-privacy.html':    'school.html'
  };
  var current = location.pathname.split('/').pop() || 'index.html';
  var navKey = sectionPages[current] || current;

  var navActive = nav.querySelector('[data-nav="' + navKey + '"]');
  if (navActive) {
    navActive.classList.add('active');
    navActive.setAttribute('aria-current', 'page');
  }

  var dropdownActive = nav.querySelector('.nav-submenu [data-nav="' + current + '"]');
  if (dropdownActive) {
    dropdownActive.classList.add('active');
    dropdownActive.setAttribute('aria-current', 'page');
  }

  /* ── Nav dropdown (School) ──
     Hover handles pointer users via CSS alone. This adds click/Enter
     support via the caret, for touch and keyboard, and closes on
     outside click or Escape. */
  nav.querySelectorAll('[data-nav-group]').forEach(function (item) {
    var caret = item.querySelector('.nav-caret');
    if (!caret) return;

    var setOpen = function (open) {
      item.classList.toggle('open', open);
      caret.setAttribute('aria-expanded', String(open));
    };

    caret.addEventListener('click', function (e) {
      e.preventDefault();
      setOpen(!item.classList.contains('open'));
    });

    document.addEventListener('click', function (e) {
      if (!item.contains(e.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && item.classList.contains('open')) {
        setOpen(false);
        caret.focus();
      }
    });
  });

  /* ── Mobile menu ── */
  var burger = nav.querySelector('.nav-hamburger');
  var list = nav.querySelector('.nav-links');
  if (!burger || !list) return;

  list.id = list.id || 'primary-menu';

  /* The open class goes on the nav, not on the list: every mobile rule
     in shared.css is written as `.site-nav.open .nav-links`, `.site-nav.open
     .nav-item` and so on. Toggling it on the list matched no rule at all,
     so the menu stayed display:none while aria-expanded claimed it was
     open. */
  var setMenu = function (open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    /* Collapse any expanded submenu when the whole menu closes, so it
       does not reappear already open next time. */
    if (!open) {
      nav.querySelectorAll('[data-nav-group].open').forEach(function (item) {
        item.classList.remove('open');
        var c = item.querySelector('.nav-caret');
        if (c) c.setAttribute('aria-expanded', 'false');
      });
    }
  };

  burger.addEventListener('click', function () {
    setMenu(!nav.classList.contains('open'));
  });

  /* Escape closes it and returns focus to the button: otherwise a
     keyboard user is stranded inside a menu they can't dismiss. */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      setMenu(false);
      burger.focus();
    }
  });

  list.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });

  /* ── Scroll reveal ──
     One observer for the whole site. Elements marked [data-reveal] fade
     up once as they enter view. Respects prefers-reduced-motion, because
     the distance and duration are CSS variables that media query zeroes. */
  var revealables = document.querySelectorAll('[data-reveal]');
  if (!revealables.length) return;

  if (!('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealables.forEach(function (el) { observer.observe(el); });
})();

/* ── Tabs ──
   Runs once per [role="tablist"] on the page, so a page with more than
   one tab group (or none at all) works without extra wiring. Shared
   here rather than inlined per-page since more than one page uses it. */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('[role="tablist"]'), function (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));

    function panelFor(tab) {
      return document.getElementById(tab.getAttribute('aria-controls'));
    }

    /* A panel marked [data-arrow] draws a pointer back at the tab that
       opened it. Position it over the centre of that tab rather than
       leaving it stranded in the middle of the panel. */
    function aimArrow(tab, panel) {
      if (!panel || !panel.hasAttribute('data-arrow')) return;
      var t = tab.getBoundingClientRect();
      var p = panel.getBoundingClientRect();
      if (!p.width) return;
      var x = t.left + t.width / 2 - p.left;
      x = Math.max(18, Math.min(p.width - 18, x));
      panel.style.setProperty('--arrow-x', x.toFixed(1) + 'px');
    }

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = panelFor(t);
        if (!panel) return;
        panel.hidden = !on;
        panel.classList.remove('is-live');
      });
      var live = panelFor(tab);
      if (live) {
        void live.offsetWidth;
        live.classList.add('is-live');
        aimArrow(tab, live);
      }
      if (focus) tab.focus();

      var rowLeft = tablist.scrollLeft;
      var rowRight = rowLeft + tablist.clientWidth;
      if (tab.offsetLeft < rowLeft) {
        tablist.scrollLeft = Math.max(0, tab.offsetLeft - 16);
      } else if (tab.offsetLeft + tab.offsetWidth > rowRight) {
        tablist.scrollLeft = tab.offsetLeft + tab.offsetWidth - tablist.clientWidth + 16;
      }
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (!next) return;
        e.preventDefault();
        select(next, true);
      });
    });

    var hash = (location.hash || '').replace('#', '');
    var landed = null;
    if (hash) {
      landed = tabs.filter(function (t) { return t.id === hash; })[0] || null;
      if (landed) {
        select(landed, false);
        setTimeout(function () {
          var sec = tablist.closest('section[id]');
          if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
      }
    }

    var firstTab = landed || tabs[0];
    var first = panelFor(firstTab);
    if (first && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          first.classList.add('is-live');
          io.disconnect();
        });
      }, { threshold: 0.25 });
      io.observe(first);
    } else if (first) {
      first.classList.add('is-live');
    }

    /* The opening panel is shown by markup rather than by select(), so
       aim its arrow here too. Measuring once on parse is not enough: the
       web font lands later and reflows the pill row, which moves the tab
       centres out from under the arrow. Re-aim after layout settles and
       on every resize. */
    function reaim() {
      var current = tabs.filter(function (t) {
        return t.getAttribute('aria-selected') === 'true';
      })[0] || firstTab;
      if (current) aimArrow(current, panelFor(current));
    }

    reaim();
    requestAnimationFrame(reaim);
    window.addEventListener('load', reaim);
    window.addEventListener('resize', reaim);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(reaim);
  });
})();
