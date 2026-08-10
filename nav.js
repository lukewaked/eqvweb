/**
 * EQV Group: navigation behaviour.
 *
 * The nav markup itself now lives in the page (see _partials/nav.html and
 * build.py). This file only adds behaviour on top: active state, the
 * mobile menu, and the RELAY Suite dropdown. If it fails to load, the
 * nav still renders and every link still works.
 */
(function () {
  'use strict';

  /* Tell CSS that JS is running, so scroll-reveal elements are safe to
     hide. Without this class they stay visible : no JS, no blank page. */
  document.documentElement.classList.add('js');

  var nav = document.querySelector('.site-nav');
  if (!nav) return;

  /* ── Active page ── */
  var current = location.pathname.split('/').pop() || 'index.html';
  var active = nav.querySelector('[data-nav="' + current + '"]');
  if (active) {
    active.classList.add('active');
    active.setAttribute('aria-current', 'page');

    /* A subpage should also light up its parent in the nav. */
    var parentItem = active.closest('.nav-item');
    if (parentItem) {
      var parentLink = parentItem.querySelector('.nav-link');
      if (parentLink) parentLink.classList.add('active');
    }
  }

  /* ── Nav dropdowns (RELAY Suite, About, and any future group) ──
     Opens on hover for pointer users, and on click/Enter via the caret
     button for everyone else. The parent link always goes to the master
     page, so touch users are never trapped. There can be more than one
     of these in the nav, so each gets its own listeners rather than
     assuming it is the only group on the page. */
  var isDesktop = function () { return window.matchMedia('(min-width: 641px)').matches; };

  nav.querySelectorAll('[data-nav-group]').forEach(function (item) {
    var caret = item.querySelector('.nav-caret');

    var setOpen = function (open) {
      item.classList.toggle('open', open);
      if (caret) caret.setAttribute('aria-expanded', String(open));
    };

    if (caret) {
      caret.addEventListener('click', function (e) {
        e.preventDefault();
        setOpen(!item.classList.contains('open'));
      });
    }

    item.addEventListener('mouseenter', function () { if (isDesktop()) setOpen(true); });
    item.addEventListener('mouseleave', function () { if (isDesktop()) setOpen(false); });

    /* Keyboard: leaving the group entirely closes it. */
    item.addEventListener('focusout', function (e) {
      if (isDesktop() && !item.contains(e.relatedTarget)) setOpen(false);
    });

    document.addEventListener('click', function (e) {
      if (!item.contains(e.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && item.classList.contains('open')) {
        setOpen(false);
        if (caret) caret.focus();
      }
    });
  });

  /* ── Mobile menu ── */
  var burger = nav.querySelector('.nav-hamburger');
  var list = nav.querySelector('.nav-links');
  if (!burger || !list) return;

  list.id = list.id || 'primary-menu';

  var setMenu = function (open) {
    list.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  burger.addEventListener('click', function () {
    setMenu(!list.classList.contains('open'));
  });

  /* Escape closes it and returns focus to the button: otherwise a
     keyboard user is stranded inside a menu they can't dismiss. */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && list.classList.contains('open')) {
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
