/* =========================================================================
   Katolik Kilisesi İnanç Esasları Özeti · script.js
   Vanilla JavaScript, no libraries. Loaded (defer) on every page.
   1. Theme toggle            5. Search (lazy-loads data/*.js on first use)
   2. Live clock              6. Reading bar: current chapter, prev/next
   3. English-original reveal 7. Table-of-contents drawer (small screens)
   4. "Show all English"       8. Main nav: dropdown + mobile sheet
   9. Info panel (i)
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
    var item = $('.has-menu'), trigger = item && $('.nav-trigger', item);
    if (item && trigger) {
      /* The trigger is a real link to katesizm.html, so a click must navigate.
         Hover and keyboard focus open the menu instead. */
      var openMenu = function () { item.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); };
      var closeMenu = function () { item.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); };
      item.addEventListener('mouseenter', openMenu);
      item.addEventListener('mouseleave', closeMenu);
      item.addEventListener('focusin', openMenu);
      item.addEventListener('focusout', function () {
        setTimeout(function () { if (!item.contains(document.activeElement)) closeMenu(); }, 0);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && item.classList.contains('open')) { closeMenu(); trigger.blur(); }
      });
    }

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

  /* ---------------------------------------------------------------
     9. The (i) panel: content/hakkinda.md, revealed on hover and
        tracking the pointer. Click pins it; touch opens it centred.
     --------------------------------------------------------------- */
  function initInfo() {
    var panel = $('#info-panel');
    if (!panel) return;
    var btn = $('.info-btn'), sheetBtn = $('.ns-info'), pinned = false, hideTimer = null;
    var fine = !window.matchMedia || window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function mark(open) {
      [btn, sheetBtn].forEach(function (b) { if (b) b.setAttribute('aria-expanded', String(open)); });
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
    /* Offset from the cursor. Near an edge it flips to the other side rather than
       clamping, so the panel keeps tracking the pointer instead of sticking. */
    function place(x, y) {
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
    if (sheetBtn) {
      sheetBtn.addEventListener('click', function () {
        var toggle = $('.menu-toggle');
        if (toggle && $('#navsheet') && $('#navsheet').classList.contains('open')) toggle.click();
        pinned = true;
        setTimeout(function () { show(); panel.classList.add('pinned'); centre(); }, 60);
      });
    }
    document.addEventListener('click', function (e) {
      if (pinned && !panel.contains(e.target) && e.target !== btn) hide();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { hide(); if (btn) btn.blur(); }
    });
    window.addEventListener('resize', function () { if (!panel.hidden && !pinned) hide(); });
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
    initSearch(); initReader(); initDrawer(); initNav(); initInfo();
  });
})();
