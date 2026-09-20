/* =========================================================================
   Katolik Kilisesi İnanç Esasları Özeti · script.js
   Vanilla JavaScript, no libraries. Loaded (defer) on every page.
   1. Theme toggle            5. Search (lazy-loads data/*.js on first use)
   2. Live clock              6. Reading bar: current chapter, prev/next
   3. English-original reveal 7. Table-of-contents drawer (small screens)
   4. "Show all English"       8. Main nav: dropdown + mobile sheet
   9. Info panel (i)   10. Rosary
   ========================================================================= */
(function () {
  'use strict';

  var THEME_KEY = 'kkio-theme';
  /* Part number → page. Keep in sync with tools/build.ps1 ($PartMeta). */
  var PAGES = ['iman-ikrari.html', 'kutsal-sirlar.html', 'mesihte-yasam.html', 'hristiyan-duasi.html'];
  var DATA_FILES = ['data/compendium-1.js', 'data/compendium-2.js', 'data/compendium-3.js', 'data/compendium-4.js'];
  var MAX_RESULTS = 50;
  /* Pages served at arbitrary URLs (404.html) declare <html data-root="/"> so data and links resolve from the site root */
  var ROOT = document.documentElement.getAttribute('data-root') || '';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------------
     1. Theme (navy/gold dark, ivory/gold light), persisted in localStorage
     --------------------------------------------------------------- */
  function storedTheme() { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } }
  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
  function syncTheme() {
    $$('.theme-toggle').forEach(function (b) {
      b.setAttribute('aria-checked', String(isDark()));
      b.setAttribute('aria-label', isDark() ? 'Açık temaya geç' : 'Koyu temaya geç');
    });
  }
  function initTheme() {
    /* Light is the default: the site does not follow the OS setting, only an explicit choice. */
    var saved = storedTheme();
    document.documentElement.setAttribute('data-theme', saved === 'dark' ? 'dark' : 'light');
    syncTheme();
    $$('.theme-toggle').forEach(function (b) {
      b.addEventListener('click', function () {
        var next = isDark() ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* private mode */ }
        syncTheme();
      });
    });
  }

  /* ---------------------------------------------------------------
     2. Live clock: full Turkish date + 24-hour time with seconds
        e.g. "Cuma, 18 Eylül 2026  14:05:09"
     --------------------------------------------------------------- */
  function initClock() {
    var clocks = $$('.clock');
    if (!clocks.length) return;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var dateFmt = null;
    try { dateFmt = new Intl.DateTimeFormat('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { /* fallback below */ }
    function dateText(d) {
      if (dateFmt && dateFmt.formatToParts) {
        var p = {};
        dateFmt.formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
        return p.weekday + ', ' + p.day + ' ' + p.month + ' ' + p.year;
      }
      return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();
    }
    function tick() {
      var d = new Date();
      var date = dateText(d), time = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
      var iso = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + time;
      clocks.forEach(function (c) {
        $('.clock-date', c).textContent = date;
        $('.clock-time', c).textContent = time;
        c.setAttribute('datetime', iso);
      });
      setTimeout(tick, 1000 - (Date.now() % 1000) + 5); // aligned to the next full second
    }
    tick();
  }

  /* ---------------------------------------------------------------
     3. English original: per-item reveal (toggles the [hidden] block;
        CSS plays a short opacity fade, no layout-heavy animation)
     --------------------------------------------------------------- */
  function setReveal(btn, open) {
    var block = document.getElementById(btn.getAttribute('aria-controls'));
    if (!block) return;
    block.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  }
  function initReveal() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.en-toggle');
      if (btn) setReveal(btn, btn.getAttribute('aria-expanded') !== 'true');
    });
  }

  /* ---------------------------------------------------------------
     4. "Show all English" (reading bar / article pages)
     --------------------------------------------------------------- */
  function initRevealAll() {
    $$('[data-en-all]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var on = btn.getAttribute('aria-pressed') !== 'true';
        var scope = document.getElementById(btn.getAttribute('data-en-all')) || document.body;
        $$('[data-en-all]').forEach(function (b) { b.setAttribute('aria-pressed', String(on)); });
        scope.classList.toggle('show-en', on);
        $$('.en-toggle', scope).forEach(function (t) { setReveal(t, on); });
        $$('.en-par', scope).forEach(function (p) { p.hidden = !on; });
        var label = btn.querySelector('.btn-label'); if (label) label.textContent = on ? 'İngilizce aslını gizle' : 'İngilizce aslını göster';
      });
    });
  }

  /* ---------------------------------------------------------------
     5. Search: Turkish + English, loads the data files on first use
     --------------------------------------------------------------- */
  var foldCache = {};
  /* Case/diacritic folding that preserves string length ("İsa" ~ "isa", "şükran" ~ "sukran") */
  function fold(s) {
    var lower = s.toLocaleLowerCase('tr');
    if (lower.length !== s.length) lower = s.toLowerCase();
    if (lower.length !== s.length) return s;
    var out = '';
    for (var i = 0; i < lower.length; i++) {
      var code = lower.charCodeAt(i);
      if (code < 128) { out += lower[i]; continue; }
      var m = foldCache[code];
      if (m === undefined) {
        m = lower[i].normalize ? lower[i].normalize('NFD')[0] : lower[i];
        if (m === 'ı') m = 'i';
        if (m === '’' || m === '‘') m = "'";
        foldCache[code] = m;
      }
      out += m;
    }
    return out;
  }
  /* Data text → plain text: [[Petrus|Peter]] → "Petrus (Peter)", tags removed */
  function plain(s) {
    return String(s || '').replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$1 ($2)').replace(/<[^>]+>/g, '').replace(/\n- /g, ' ').replace(/\s+/g, ' ').trim();
  }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function highlight(text, terms) {
    var f = fold(text), ranges = [];
    terms.forEach(function (t) { var i = f.indexOf(t); while (i !== -1) { ranges.push([i, i + t.length]); i = f.indexOf(t, i + t.length); } });
    if (!ranges.length) return esc(text);
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var out = '', pos = 0;
    ranges.forEach(function (r) {
      if (r[0] < pos) { if (r[1] > pos) { out += '<mark>' + esc(text.slice(pos, r[1])) + '</mark>'; pos = r[1]; } return; }
      out += esc(text.slice(pos, r[0])) + '<mark>' + esc(text.slice(r[0], r[1])) + '</mark>'; pos = r[1];
    });
    return out + esc(text.slice(pos));
  }
  function snippet(text, terms, len) {
    var f = fold(text), at = -1;
    terms.forEach(function (t) { var i = f.indexOf(t); if (i !== -1 && (at === -1 || i < at)) at = i; });
    if (at === -1 || text.length <= len) return text.length > len ? text.slice(0, len).replace(/\s+\S*$/, '') + '…' : text;
    var start = Math.max(0, at - Math.floor(len / 3));
    var s = text.slice(start, start + len);
    if (start > 0) s = '…' + s.replace(/^\S*\s/, '');
    if (start + len < text.length) s = s.replace(/\s+\S*$/, '') + '…';
    return s;
  }

  var index = null, loading = null;
  function loadIndex() {
    if (index) return Promise.resolve(index);
    if (loading) return loading;
    loading = Promise.all(DATA_FILES.map(function (src, i) {
      return new Promise(function (resolve, reject) {
        if (window.COMPENDIUM && window.COMPENDIUM.parts && window.COMPENDIUM.parts[i]) return resolve();
        var s = document.createElement('script');
        s.src = ROOT + src; s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    })).then(function () {
      index = [];
      window.COMPENDIUM.parts.forEach(function (p, pi) {
        p.items.forEach(function (it) {
          if (it.type !== 'qa') return;
          var e = { n: it.n, page: ROOT + PAGES[pi], part: p.tr, q: plain(it.tr.q), a: plain(it.tr.a), qe: plain(it.en.q), ae: plain(it.en.a) };
          e.fq = fold(e.q); e.fa = fold(e.a); e.fe = fold(e.qe + ' ' + e.ae);
          index.push(e);
        });
      });
      return index;
    });
    return loading;
  }

  function search(raw) {
    var q = fold(raw.trim()).replace(/[“”"]/g, '');
    var terms = q.split(/\s+/).filter(function (t) { return t.length > 1 || /^\d$/.test(t); });
    if (!terms.length) return { terms: [], hits: [] };
    var num = /^\d{1,3}$/.test(q) ? parseInt(q, 10) : null;
    var hits = [];
    index.forEach(function (e) {
      var all = function (s) { return terms.every(function (t) { return s.indexOf(t) !== -1; }); };
      var score = 0, en = false;
      if (num !== null && e.n === num) score = 100;
      else if (all(e.fq)) score = 3;
      else if (all(e.fq + ' ' + e.fa)) score = 2;
      else if (all(e.fe)) { score = 1; en = true; }
      if (score) hits.push({ e: e, score: score, en: en });
    });
    hits.sort(function (a, b) { return b.score - a.score || a.e.n - b.e.n; });
    return { terms: terms, hits: hits };
  }

  function renderResults(box, raw, res) {
    if (!res.terms.length) { box.hidden = true; box.innerHTML = ''; return; }
    var html = '<p class="sr-head" role="status">' + (res.hits.length
      ? '“' + esc(raw.trim()) + '” için ' + res.hits.length + ' soru' + (res.hits.length > MAX_RESULTS ? ' (ilk ' + MAX_RESULTS + ' gösteriliyor)' : '')
      : '“' + esc(raw.trim()) + '” için sonuç bulunamadı.') + '</p>';
    res.hits.slice(0, MAX_RESULTS).forEach(function (h) {
      var e = h.e, snip;
      if (h.en) snip = snippet(fold(e.qe).indexOf(res.terms[0]) !== -1 && fold(e.ae).indexOf(res.terms[0]) === -1 ? e.qe : e.ae, res.terms, 150);
      else snip = snippet(e.a, res.terms, 150);
      html += '<a class="sr-item" href="' + e.page + '#soru-' + e.n + '"><span class="sr-num">' + e.n + '</span><span class="sr-body">' +
        '<span class="sr-q">' + highlight(e.q, res.terms) + '</span>' +
        '<span class="sr-snip"' + (h.en ? ' lang="en"' : '') + '>' + highlight(snip, res.terms) + '</span>' +
        '<span class="sr-meta">' + esc(e.part) + (h.en ? '<span class="sr-en">EN</span>' : '') + '</span></span></a>';
    });
    box.innerHTML = html;
    box.hidden = false;
  }

  function initSearch() {
    $$('[data-search]').forEach(function (wrap) {
      var input = $('input', wrap), box = $('.search-results', wrap), timer = null;
      function run() {
        var raw = input.value;
        if (!raw.trim()) { renderResults(box, raw, { terms: [], hits: [] }); return; }
        loadIndex().then(function () { if (input.value === raw) renderResults(box, raw, search(raw)); })
          .catch(function () { box.hidden = false; box.innerHTML = '<p class="sr-empty">Arama verileri yüklenemedi.</p>'; });
      }
      input.addEventListener('focus', function () { loadIndex().catch(function () {}); if (input.value.trim() && box.innerHTML) box.hidden = false; });
      input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 120); });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { var first = $('.sr-item', box); if (first && !box.hidden) { e.preventDefault(); first.focus(); } }
        else if (e.key === 'Enter') { e.preventDefault(); clearTimeout(timer); run(); loadIndex().then(function () { var f = $('.sr-item', box); if (f) location.href = f.getAttribute('href'); }); }
        else if (e.key === 'Escape') { box.hidden = true; }
      });
      box.addEventListener('keydown', function (e) {
        var items = $$('.sr-item', box), i = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown' && i < items.length - 1) { e.preventDefault(); items[i + 1].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (i > 0) items[i - 1].focus(); else input.focus(); }
        else if (e.key === 'Escape') { box.hidden = true; input.focus(); }
      });
      box.addEventListener('click', function (e) { if (e.target.closest('.sr-item')) box.hidden = true; });
      document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) box.hidden = true; });
      wrap.addEventListener('submit', function (e) { e.preventDefault(); });
    });
    /* Mobile: magnifier button opens the header search */
    $$('.search-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var header = btn.closest('.site-header'), open = !header.classList.contains('search-open');
        header.classList.toggle('search-open', open);
        btn.setAttribute('aria-expanded', String(open));
        if (open) { var i = $('.header-search input', header); if (i) i.focus(); }
      });
    });
    /* ?q=… (used by the WebSite SearchAction on the home page) */
    var q = new URLSearchParams(location.search).get('q');
    var hero = $('.hero-search input');
    if (q && hero) { hero.value = q; hero.dispatchEvent(new Event('input')); hero.focus(); }
  }

  /* ---------------------------------------------------------------
     6. Reading bar: current chapter title, prev/next chapter,
        and TOC highlighting (rAF-throttled scroll handler)
     --------------------------------------------------------------- */
  function initReader() {
    var content = $('.content[data-reader]');
    if (!content) return;
    var heads = $$('.sec', content);
    var stops = heads.filter(function (h) { return h.classList.contains('sec-l2') || h.classList.contains('sec-l3'); });
    var current = $('.readbar .current');
    var defaultTitle = current ? current.textContent : '';
    var header = $('.site-header');
    var links = {};
    $$('.toc a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var tocBox = $('.toc');
    var activeLink = null, stopIndex = -1, ticking = false;

    function titleOf(h) { var t = $('.sec-title', h); return (t || h).textContent.trim(); }
    function update() {
      ticking = false;
      var line = (header ? header.offsetHeight : 64) + 80;
      var cur = null, si = -1;
      for (var i = 0; i < heads.length; i++) { if (heads[i].getBoundingClientRect().top <= line) cur = heads[i]; else break; }
      for (var j = 0; j < stops.length; j++) { if (stops[j].getBoundingClientRect().top <= line) si = j; else break; }
      stopIndex = si;
      if (current) current.textContent = si >= 0 ? titleOf(stops[si]) : defaultTitle;
      var link = cur ? links[cur.id] : null;
      if (link !== activeLink) {
        if (activeLink) activeLink.removeAttribute('aria-current');
        if (link) {
          link.setAttribute('aria-current', 'location');
          if (tocBox && getComputedStyle(tocBox).position === 'sticky') {
            var lt = link.offsetTop, st = tocBox.scrollTop, h = tocBox.clientHeight;
            if (lt < st + 40 || lt > st + h - 60) tocBox.scrollTop = lt - h / 3;
          }
        }
        activeLink = link;
      }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    function go(target) { if (target) { target.scrollIntoView({ block: 'start' }); history.replaceState(null, '', '#' + target.id); } }
    $$('[data-chapter="prev"]').forEach(function (b) { b.addEventListener('click', function () { go(stops[Math.max(0, stopIndex - 1)]); }); });
    $$('[data-chapter="next"]').forEach(function (b) { b.addEventListener('click', function () { go(stops[Math.min(stops.length - 1, stopIndex + 1)]); }); });
  }

  /* ---------------------------------------------------------------
     7. Table of contents as a drawer on small screens
     --------------------------------------------------------------- */
  function initDrawer() {
    var toc = $('.toc');
    if (!toc) return;
    var backdrop = null, opener = null;
    function close(refocus) {
      if (!toc.classList.contains('open')) return;
      toc.classList.remove('open');
      if (backdrop) { backdrop.remove(); backdrop = null; }
      $$('.toc-open').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      if (opener && refocus !== false) opener.focus();
    }
    function open(btn) {
      opener = btn;
      toc.classList.add('open');
      backdrop = document.createElement('div'); backdrop.className = 'toc-backdrop';
      backdrop.addEventListener('click', function () { close(); });
      document.body.appendChild(backdrop);
      btn.setAttribute('aria-expanded', 'true');
      var first = $('a[aria-current], a', toc); if (first) first.focus();
    }
    $$('.toc-open').forEach(function (b) { b.addEventListener('click', function () { open(b); }); });
    $$('.toc-close').forEach(function (b) { b.addEventListener('click', function () { close(); }); });
    toc.addEventListener('click', function (e) { if (e.target.closest('a')) close(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ---------------------------------------------------------------
     8. Main navigation: the "Ozet Metni" dropdown on wide screens and
        the bottom sheet on phones. Both are plain DOM, no dependencies.
     --------------------------------------------------------------- */
  function initNav() {
    /* Every dropdown in the bar (Katesizm, Dualar, ...): $$ so a second and third
       .has-menu are not silently skipped the way a single $() would skip them. */
    $$('.has-menu').forEach(function (item) {
      var trigger = $('.nav-trigger', item);
      if (!trigger) return;
      /* A trigger that is a real link (Katesizm -> katesizm.html) must still navigate on
         click, so hover and keyboard focus open it instead. A trigger with no page of its
         own (Dualar) is a <button>, so a click is the only way to open or close it. */
      var openMenu = function () { item.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); };
      var closeMenu = function () { item.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); };
      if (trigger.tagName === 'BUTTON') {
        trigger.addEventListener('click', function (e) {
          e.stopPropagation();
          if (item.classList.contains('open')) closeMenu(); else openMenu();
        });
        document.addEventListener('click', function (e) { if (!item.contains(e.target)) closeMenu(); });
      }
      item.addEventListener('mouseenter', openMenu);
      item.addEventListener('mouseleave', closeMenu);
      item.addEventListener('focusin', openMenu);
      item.addEventListener('focusout', function () {
        setTimeout(function () { if (!item.contains(document.activeElement)) closeMenu(); }, 0);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && item.classList.contains('open')) { closeMenu(); trigger.blur(); }
      });
    });

    var sheet = $('#navsheet');
    if (!sheet) return;
    var toggles = $$('.menu-toggle'), panel = $('.navsheet-panel', sheet), hideTimer = null;
    function openSheet() {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      sheet.hidden = false;
      void sheet.offsetHeight;            /* force a frame so the slide-up actually animates */
      sheet.classList.add('open');
      document.body.classList.add('sheet-open');
      toggles.forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
      var first = $('.ns-item[aria-current="page"]', sheet) || $('.ns-item', sheet);
      if (first) first.focus();
    }
    function closeSheet(refocus) {
      if (!sheet.classList.contains('open')) return;
      sheet.classList.remove('open');
      document.body.classList.remove('sheet-open');
      toggles.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      if (refocus && toggles[0]) toggles[0].focus();
      hideTimer = setTimeout(function () { sheet.hidden = true; hideTimer = null; }, 400);
    }
    toggles.forEach(function (b) {
      b.addEventListener('click', function () {
        if (sheet.classList.contains('open')) closeSheet(true); else openSheet();
      });
    });
    /* Tapping the dimmed area outside the panel closes it */
    sheet.addEventListener('click', function (e) { if (e.target === sheet) closeSheet(false); });
    if (panel) panel.addEventListener('click', function (e) { if (e.target.closest('a')) closeSheet(false); });
    var grab = $('.navsheet-grab', sheet);
    if (grab) grab.addEventListener('click', function () { closeSheet(true); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(true); });
    /* Growing past the phone breakpoint while the sheet is open would leave the page locked */
    window.addEventListener('resize', function () { if (window.innerWidth >= 900) closeSheet(false); });
  }

  /* Offset from the cursor, flipping near an edge rather than clamping. Shared
     by the (i) panel and the rosary prayer list. */
  function placePanel(panel, x, y) {
    panel.classList.remove('centered');
    var w = panel.offsetWidth, h = panel.offsetHeight, m = 12, gap = 18;
    var left = x + gap;
    if (left + w > window.innerWidth - m) left = x - w - gap;
    left = Math.max(m, Math.min(left, window.innerWidth - w - m));
    var top = y + 20;
    if (top + h > window.innerHeight - m) top = Math.max(m, y - h - gap);
    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
  }
  var FINE = !window.matchMedia || window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------------------------------------------------------------
     9. The (i) panel: content/hakkinda.md, revealed on hover and
        tracking the pointer. Click pins it; touch opens it centred.
     --------------------------------------------------------------- */
  function initInfo() {
    var panel = $('#info-panel');
    if (!panel) return;
    var btn = $('.info-btn'), sheetBtns = $$('.info-open'), pinned = false, hideTimer = null;
    var fine = FINE;

    function mark(open) {
      [btn].concat(sheetBtns).forEach(function (b) { if (b) b.setAttribute('aria-expanded', String(open)); });
    }
    function show() {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      panel.hidden = false;
      void panel.offsetHeight;
      panel.classList.add('open');
      mark(true);
    }
    function hide() {
      pinned = false;
      panel.classList.remove('open', 'pinned');
      mark(false);
      hideTimer = setTimeout(function () { panel.hidden = true; hideTimer = null; }, 220);
    }
    function place(x, y) { placePanel(panel, x, y); }
    function centre() {
      panel.classList.add('centered');
      panel.style.left = ''; panel.style.top = '';
    }

    if (btn) {
      if (fine) {
        btn.addEventListener('mouseenter', function (e) { show(); place(e.clientX, e.clientY); });
        btn.addEventListener('mousemove', function (e) { if (!pinned) place(e.clientX, e.clientY); });
        btn.addEventListener('mouseleave', function () { if (!pinned) hide(); });
      }
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        if (pinned) { hide(); return; }
        pinned = true;
        show();
        panel.classList.add('pinned');
        if (!fine) centre();
      });
      /* Keyboard: focus reveals it, blur puts it away again */
      btn.addEventListener('focus', function () {
        if (pinned) return;
        show();
        var r = btn.getBoundingClientRect();
        place(r.left, r.bottom - 8);
      });
      btn.addEventListener('blur', function () { if (!pinned) hide(); });
    }
    sheetBtns.forEach(function (sheetBtn) {
      sheetBtn.addEventListener('click', function () {
        var toggle = $('.menu-toggle');
        if (toggle && $('#navsheet') && $('#navsheet').classList.contains('open') && sheetBtn.closest('#navsheet')) toggle.click();
        pinned = true;
        setTimeout(function () { show(); panel.classList.add('pinned'); centre(); }, 60);
      });
    });
    document.addEventListener('click', function (e) {
      if (pinned && !panel.contains(e.target) && e.target !== btn && sheetBtns.indexOf(e.target) === -1) hide();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { hide(); if (btn) btn.blur(); }
    });
    window.addEventListener('resize', function () { if (!panel.hidden && !pinned) hide(); });
  }

  /* ---------------------------------------------------------------
     10. Rosary: today's mysteries in Istanbul time, and a prayer list
         whose hover shows the text and lights up where it is prayed.
     --------------------------------------------------------------- */
  function initRosary() {
    var svg = $('.rosary');
    if (!svg) return;

    /* The day is the one in Turkey, not the visitor's own time zone. */
    function istanbulDay() {
      try {
        var name = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Istanbul', weekday: 'short' }).format(new Date());
        var i = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(name);
        if (i !== -1) return i;
      } catch (e) { /* fall through */ }
      return new Date().getDay();
    }
    var day = istanbulDay(), todaySet = null;
    $$('.myst').forEach(function (m) {
      var days = (m.getAttribute('data-days') || '').split(',').map(Number);
      if (days.indexOf(day) !== -1) { m.classList.add('is-today'); todaySet = m; }
    });
    if (todaySet) {
      var label = $('[data-today-set]'), list = $('[data-today-list]');
      if (label) label.textContent = $('h3', todaySet).textContent;
      if (list) {
        list.innerHTML = '';
        $$('.m-tr', todaySet).forEach(function (li) {
          var el = document.createElement('li'); el.textContent = li.textContent; list.appendChild(el);
        });
      }
    }

    /* Which beads belong to each prayer. The last two are prayed at points the
       rosary has no bead for, so they mark their anchor faintly instead. */
    var SPOT = {
      'cross':  { sel: '.bead.cross', ghost: false },
      'lg':     { sel: '.bead.lg', ghost: false },
      'sm':     { sel: '.bead.sm', ghost: false },
      'lg-end': { sel: '.bead.lg', ghost: true },
      'end':    { sel: '.bead.medal, .bead.cross', ghost: true }
    };
    var panel = $('#prayer-panel'), store = $('.pray-store'), cap = $('[data-rosary-cap]');
    var capDefault = cap ? cap.textContent : '';
    var pinned = null;

    function clearBeads() {
      $$('.bead.hl, .bead.hl-ghost', svg).forEach(function (b) { b.classList.remove('hl', 'hl-ghost'); });
    }
    function lightUp(spot) {
      clearBeads();
      var s = SPOT[spot];
      if (!s) return;
      $$(s.sel, svg).forEach(function (b) { b.classList.add(s.ghost ? 'hl-ghost' : 'hl'); });
    }
    function fill(id) {
      if (!panel || !store) return false;
      var src = $('[data-pray="' + id + '"]', store);
      if (!src) return false;
      panel.innerHTML = '<div class="info-inner">' + src.innerHTML + '</div>';
      return true;
    }
    function open(btn, x, y) {
      if (!fill(btn.getAttribute('data-p'))) return;
      panel.hidden = false;
      void panel.offsetHeight;
      panel.classList.add('open');
      if (x === undefined) {
        var r = btn.getBoundingClientRect(); x = r.left; y = r.bottom - 8;
      }
      placePanel(panel, x, y);
      lightUp(btn.getAttribute('data-spot'));
      var note = $('.p-note', panel);
      if (cap && note) cap.textContent = note.textContent;
      btn.classList.add('is-on');
    }
    function close() {
      if (!panel) return;
      panel.classList.remove('open', 'pinned');
      setTimeout(function () { if (!panel.classList.contains('open')) panel.hidden = true; }, 200);
      clearBeads();
      if (cap) cap.textContent = capDefault;
      $$('.pray-link.is-on').forEach(function (b) { b.classList.remove('is-on'); });
      pinned = null;
    }

    $$('.pray-link').forEach(function (btn) {
      if (FINE) {
        btn.addEventListener('mouseenter', function (e) { if (!pinned) open(btn, e.clientX, e.clientY); });
        btn.addEventListener('mousemove', function (e) { if (!pinned && panel && !panel.hidden) placePanel(panel, e.clientX, e.clientY); });
        btn.addEventListener('mouseleave', function () { if (!pinned) close(); });
      }
      /* Click pins it, which is also how it works on a touch screen. On touch it opens as a
         bottom sheet instead of a centered dialog, so the sticky rosary figure above stays
         visible and the lit-up bead is visible at the same time as the prayer text. */
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (pinned === btn) { close(); return; }
        close();
        pinned = btn;
        open(btn);
        if (panel) {
          panel.classList.add('pinned');
          if (!FINE) { panel.classList.add('sheet'); panel.style.left = ''; panel.style.top = ''; }
        }
      });
      btn.addEventListener('focus', function () { if (!pinned) open(btn); });
      btn.addEventListener('blur', function () { if (!pinned) close(); });
    });
    document.addEventListener('click', function (e) {
      if (pinned && panel && !panel.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ---------------------------------------------------------------
     11. Azizler: today's saint in Istanbul time, movable feasts
         (Easter and everything computed from it) grafted onto the
         fixed calendar, month scroll-spy, and hover panel for bios.
     --------------------------------------------------------------- */
  function initSaints() {
    var cal = $('.saints-cal');
    if (!cal) return;

    function istanbulParts() {
      try {
        var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Istanbul', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date());
        var o = {};
        parts.forEach(function (p) { if (p.type !== 'literal') o[p.type] = parseInt(p.value, 10); });
        if (o.year && o.month && o.day) return o;
      } catch (e) { /* fall through */ }
      var d = new Date();
      return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
    }
    /* Meeus/Jones/Butcher Gregorian Easter algorithm (public domain method) */
    function easter(year) {
      var a = year % 19, b = Math.floor(year / 100), c = year % 100;
      var d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
      var g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
      var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
      var m = Math.floor((a + 11 * h + 22 * l) / 451);
      var month = Math.floor((h + l - 7 * m + 114) / 31);
      var day = ((h + l - 7 * m + 114) % 31) + 1;
      return { m: month, d: day };
    }
    function addDays(base, year, n) {
      var dt = new Date(Date.UTC(year, base.m - 1, base.d));
      dt.setUTCDate(dt.getUTCDate() + n);
      return { m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
    }

    var MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    var today = istanbulParts();
    var easterThis = easter(today.year);
    var movableTodayCard = null;

    /* Resolve this year's movable feasts and graft each onto its fixed-calendar day */
    $$('.movable-card').forEach(function (card) {
      var offset = parseInt(card.getAttribute('data-offset'), 10);
      var date = addDays(easterThis, today.year, offset);
      var dateEl = $('[data-movable-date]', card);
      if (dateEl) dateEl.textContent = ' · ' + date.d + ' ' + MONTHS[date.m - 1];
      var isToday = date.m === today.month && date.d === today.day;
      if (isToday) movableTodayCard = card;
      var cell = $('.day-cell[data-m="' + date.m + '"][data-d="' + date.d + '"]');
      if (!cell) return;
      cell.classList.add('has-movable');
      if (cell.classList.contains('genel')) {
        cell.classList.remove('genel');
        var oldItem = $('.saint-item', cell);
        if (oldItem) oldItem.remove();
      }
      var wrap = $('.day-saints', cell);
      if (!wrap) { wrap = document.createElement('div'); wrap.className = 'day-saints'; cell.appendChild(wrap); }
      var h3 = $('h3', card), bio = $('.m-bio', card);
      if (!h3 || !bio) return;
      var det = document.createElement('details');
      det.className = 'saint-item';
      det.innerHTML = '<summary><span class="s-name">' + h3.innerHTML + '</span></summary><div class="saint-bio">' + bio.innerHTML + '</div>';
      wrap.appendChild(det);
      if (isToday) cell.classList.add('is-today');
    });
    if (!movableTodayCard) {
      var fixedToday = $('.day-cell[data-m="' + today.month + '"][data-d="' + today.day + '"]');
      if (fixedToday) fixedToday.classList.add('is-today');
    }

    /* Hero: today's saint(s), in full, above the fold */
    var dateLabel = $('[data-today-date]');
    if (dateLabel) dateLabel.textContent = today.day + ' ' + MONTHS[today.month - 1];
    var body = $('[data-today-body]');
    if (body) {
      var source = movableTodayCard || $('.day-cell.is-today');
      var pieces = [];
      if (source) {
        var items = movableTodayCard ? [{ name: $('h3', source).innerHTML, title: '', bio: $('.m-bio', source).innerHTML }] :
          $$('.saint-item', source).map(function (it) {
            var t = $('.s-title', it);
            return { name: $('.s-name', it).innerHTML, title: t ? t.innerHTML : '', bio: $('.saint-bio', it).innerHTML };
          });
        items.forEach(function (it) {
          pieces.push('<div class="today-more"><span class="today-name">' + it.name + '</span>' +
            (it.title ? '<span class="today-title">' + it.title + '</span>' : '') +
            '<div class="today-bio">' + it.bio + '</div></div>');
        });
      }
      if (pieces.length) body.innerHTML = pieces.join('');
    }

    /* Month pills: smooth-scroll anchors (native) plus a scroll-spy active state */
    var pills = $$('.month-pills a');
    if (pills.length && window.IntersectionObserver) {
      var byMonth = {};
      pills.forEach(function (a) { byMonth[a.getAttribute('data-month-link')] = a; });
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var m = en.target.getAttribute('data-month');
          pills.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('data-month-link') === m); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      $$('.month').forEach(function (sec) { obs.observe(sec); });
    }

    /* Desktop: hover a saint's name for a floating bio panel (reuses placePanel).
       Touch/no-hover: the native <details> disclosure handles it instead. */
    var panel = $('#saint-panel');
    if (panel && FINE) {
      cal.classList.add('fine-hover');
      var pinned = null;
      function fillPanel(item) {
        var name = $('.s-name', item), t = $('.s-title', item), bio = $('.saint-bio', item);
        panel.innerHTML = '<div class="info-inner"><span class="s-panel-name">' + (name ? name.innerHTML : '') + '</span>' +
          (t ? '<span class="s-panel-title">' + t.innerHTML + '</span>' : '') + (bio ? bio.innerHTML : '') + '</div>';
      }
      function openPanel(item, x, y) {
        fillPanel(item);
        panel.hidden = false;
        void panel.offsetHeight;
        panel.classList.add('open');
        if (x === undefined) { var r = item.getBoundingClientRect(); x = r.left; y = r.bottom - 8; }
        placePanel(panel, x, y);
      }
      function closePanel() {
        panel.classList.remove('open', 'pinned');
        setTimeout(function () { if (!panel.classList.contains('open')) panel.hidden = true; }, 200);
        pinned = null;
      }
      cal.addEventListener('mouseover', function (e) {
        var summary = e.target.closest('.saint-item > summary');
        if (!summary || pinned) return;
        openPanel(summary.parentElement, e.clientX, e.clientY);
      });
      cal.addEventListener('mousemove', function (e) {
        if (pinned || !panel || panel.hidden) return;
        if (e.target.closest('.saints-cal') === cal) placePanel(panel, e.clientX, e.clientY);
      });
      cal.addEventListener('mouseout', function (e) {
        if (pinned) return;
        var leaving = e.target.closest('.saint-item > summary');
        if (leaving && !leaving.contains(e.relatedTarget)) closePanel();
      });
      cal.addEventListener('click', function (e) {
        var summary = e.target.closest('.saint-item > summary');
        if (!summary) return;
        e.preventDefault();
        var item = summary.parentElement;
        if (pinned === item) { closePanel(); return; }
        closePanel();
        pinned = item;
        openPanel(item);
        panel.classList.add('pinned');
      });
      document.addEventListener('click', function (e) {
        if (pinned && panel && !panel.contains(e.target) && !cal.contains(e.target)) closePanel();
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });
    }
  }

  /* ---------------------------------------------------------------
     12. Kutsal Ayin: scroll-spy on the six part icons
     --------------------------------------------------------------- */
  function initMass() {
    var pills = $$('.mass-pills a');
    if (!pills.length || !window.IntersectionObserver) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var n = en.target.getAttribute('data-part');
        pills.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('data-part-link') === n); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('.mass-part').forEach(function (sec) { obs.observe(sec); });
  }

  /* ---------------------------------------------------------------
     13. Home page: today's saint and today's rosary mystery, each
         lazy-loaded from its own data file (same pattern as search)
         only when the home page actually has the widgets to fill.
     --------------------------------------------------------------- */
  function loadDataScript(src, globalName) {
    return new Promise(function (resolve, reject) {
      if (window[globalName]) return resolve();
      var s = document.createElement('script');
      s.src = ROOT + src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function initHomeWidgets() {
    var saintBox = $('[data-home-saint] .side-body'), mysteryBox = $('[data-home-mystery] .side-body');
    if (!saintBox && !mysteryBox) return;

    function istanbulToday() {
      try {
        var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Istanbul', year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' }).formatToParts(new Date());
        var o = {};
        parts.forEach(function (p) { if (p.type === 'weekday') o.weekday = p.value; else if (p.type !== 'literal') o[p.type] = parseInt(p.value, 10); });
        if (o.year && o.month && o.day) return o;
      } catch (e) { /* fall through */ }
      var d = new Date();
      return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), weekday: null };
    }
    var today = istanbulToday();

    if (saintBox) {
      loadDataScript('data/azizler.js', 'SAINTS').then(function () {
        var day = window.SAINTS.days.filter(function (d) { return d.m === today.month && d.d === today.day; })[0];
        if (!day || !day.saints || !day.saints.length) { saintBox.innerHTML = '<p class="hint">Bugün için özel bir aziz yok.</p>'; return; }
        var s = day.saints[0];
        var bio = s.bio.length > 170 ? s.bio.slice(0, 170).replace(/\s+\S*$/, '') + '…' : s.bio;
        saintBox.innerHTML = '<span class="side-name">' + s.name + '</span>' +
          (s.title ? '<span class="side-title">' + s.title + '</span>' : '') +
          '<p class="side-snippet">' + bio + '</p>';
      })['catch'](function () { saintBox.innerHTML = '<p class="hint">Yüklenemedi.</p>'; });
    }
    if (mysteryBox) {
      loadDataScript('data/tespih.js', 'COMPENDIUM_ROSARY').then(function () {
        var dayIdx = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(today.weekday);
        if (dayIdx === -1) dayIdx = new Date().getDay();
        var set = window.COMPENDIUM_ROSARY.sets.filter(function (s) { return s.days.indexOf(dayIdx) !== -1; })[0];
        if (!set) { mysteryBox.innerHTML = '<p class="hint">Bulunamadı.</p>'; return; }
        var items = set.items.slice(0, 2).map(function (it) { return it.tr; }).join('; ');
        mysteryBox.innerHTML = '<span class="side-name">' + set.tr + '</span>' +
          '<span class="side-title">' + set.dayTr + '</span>' +
          '<p class="side-snippet">' + items + '…</p>';
      })['catch'](function () { mysteryBox.innerHTML = '<p class="hint">Yüklenemedi.</p>'; });
    }
  }

  /* Keep --header-h equal to the real (sticky) header height so the reading bar and anchors never hide under it */
  function initHeaderHeight() {
    var header = $('.site-header');
    if (!header) return;
    function set() { document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px'); }
    set();
    if (window.ResizeObserver) new ResizeObserver(set).observe(header); else window.addEventListener('resize', set);
  }

  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    initHeaderHeight(); initTheme(); initClock(); initReveal(); initRevealAll();
    initSearch(); initReader(); initDrawer(); initNav(); initInfo(); initRosary(); initSaints(); initMass(); initHomeWidgets();
  });
})();
