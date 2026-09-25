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
  /* Part number → page. Keep in sync with tools/build.ps1 ($PartMeta). The English pages use
     their own English slugs (not a literal mirror of the Turkish filename), so a parallel list
     is needed; keep it in sync with $PartMeta's fileEn values. */
  var PAGES = ['iman-ikrari.html', 'kutsal-sirlar.html', 'mesihte-yasam.html', 'hristiyan-duasi.html'];
  var PAGES_EN = ['profession-of-faith.html', 'celebration-of-christian-mystery.html', 'life-in-christ.html', 'christian-prayer.html'];
  var DATA_FILES = ['data/compendium-1.js', 'data/compendium-2.js', 'data/compendium-3.js', 'data/compendium-4.js'];
  var MAX_RESULTS = 50;
  /* Pages served at arbitrary URLs (404.html), and every /en/ page, declare <html data-root="/">
     so data and links resolve from the site root */
  var ROOT = document.documentElement.getAttribute('data-root') || '';
  var LANG = document.documentElement.lang === 'en' ? 'en' : 'tr';
  var LANG_PREFIX = LANG === 'en' ? 'en/' : '';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  /* Runs fn on the frame after next, so a class added inside it reliably starts a CSS
     transition from the element's just-applied "closed" state. Same goal as the classic
     "read el.offsetHeight to force a reflow" trick, without forcing that reflow synchronously. */
  var nextFrame = function (fn) { requestAnimationFrame(function () { requestAnimationFrame(fn); }); };

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
     1b. Text size (0 = default, 1 = large, 2 = larger), persisted like
     the theme. Scales the root font-size, so every rem-based measurement
     on the page (type, spacing, icons) grows together.
     --------------------------------------------------------------- */
  var FONTSIZE_KEY = 'kkio-fontsize';
  var FONTSIZE_LABELS = ['Yazı boyutunu büyüt', 'Yazı boyutunu büyüt', 'Yazı boyutunu sıfırla'];
  function fontsizeLevel() { return document.documentElement.getAttribute('data-fontsize') || '0'; }
  function syncFontsize() {
    var level = fontsizeLevel();
    $$('.fontsize-toggle').forEach(function (b) {
      b.setAttribute('aria-label', FONTSIZE_LABELS[Number(level)]);
    });
  }
  function initFontSize() {
    syncFontsize();
    $$('.fontsize-toggle').forEach(function (b) {
      b.addEventListener('click', function () {
        var next = (Number(fontsizeLevel()) + 1) % 3;
        if (next === 0) { document.documentElement.removeAttribute('data-fontsize'); }
        else { document.documentElement.setAttribute('data-fontsize', String(next)); }
        try { localStorage.setItem(FONTSIZE_KEY, String(next)); } catch (e) { /* private mode */ }
        syncFontsize();
      });
    });
  }

  /* ---------------------------------------------------------------
     2. Full-site menu overlay header: today's full date and a live
        clock, plus three at-a-glance pills: the liturgical season (with
        its vestment colour), today's rosary mystery and today's saint.
     --------------------------------------------------------------- */
  /* Gregorian Easter (Meeus/Jones/Butcher), shared by the saints calendar and the season pill */
  function easterMD(year) {
    var a = year % 19, b = Math.floor(year / 100), c = year % 100;
    var d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    return { m: Math.floor((h + l - 7 * m + 114) / 31), d: ((h + l - 7 * m + 114) % 31) + 1 };
  }
  /* Where today falls in the Roman liturgical year, in the visitor's own time zone: the season
     (with its week) and the colour the priest wears. Special days of the Proper of Time that
     change the colour are included: rose on Gaudete and Laetare Sundays, red on Palm Sunday,
     Good Friday and Pentecost, white through the Triduum's feasts, Trinity Sunday and Christ
     the King. Feasts of individual saints are left out: this is the season's colour. */
  var LIT_TEXT = {
    tr: {
      advent: 'Advent', christmas: 'Noel Dönemi', ordinary: 'Olağan Zaman', lent: 'Büyük Perhiz', easter: 'Paskalya Dönemi',
      week: function (n) { return n + '. Hafta'; }, ash: 'Kül Çarşambası', palm: 'Hurma Pazarı', holyWeek: 'Kutsal Hafta',
      thu: 'Kutsal Perşembe', fri: 'Kutsal Cuma', sat: 'Kutsal Cumartesi', easterDay: 'Paskalya', pentecost: 'Pentekost',
      trinity: 'Kutsal Üçlü Birlik', king: 'Evrenin Kralı Mesih', colour: 'Litürjik renk',
      colours: { green: 'yeşil', violet: 'mor', white: 'beyaz', red: 'kırmızı', rose: 'pembe' }
    },
    en: {
      advent: 'Advent', christmas: 'Christmas Season', ordinary: 'Ordinary Time', lent: 'Lent', easter: 'Easter Season',
      week: function (n) { return 'Week ' + n; }, ash: 'Ash Wednesday', palm: 'Palm Sunday', holyWeek: 'Holy Week',
      thu: 'Holy Thursday', fri: 'Good Friday', sat: 'Holy Saturday', easterDay: 'Easter Sunday', pentecost: 'Pentecost',
      trinity: 'The Holy Trinity', king: 'Christ the King', colour: 'Liturgical colour',
      colours: { green: 'green', violet: 'violet', white: 'white', red: 'red', rose: 'rose' }
    }
  };
  function liturgicalDay(now) {
    var L = LIT_TEXT[LANG], y = now.getFullYear();
    var today = new Date(y, now.getMonth(), now.getDate());
    function date(m, d) { return new Date(y, m - 1, d); }
    function add(dt, n) { var x = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()); x.setDate(x.getDate() + n); return x; }
    function days(a, b) { return Math.round((a - b) / 86400000); }
    function same(a, b) { return days(a, b) === 0; }
    function res(name, week, colour) { return { name: name + (week ? ' · ' + L.week(week) : ''), colour: colour }; }
    var e = easterMD(y), easter = date(e.m, e.d), ash = add(easter, -46), palm = add(easter, -7);
    var pentecost = add(easter, 49), christmas = date(12, 25);
    var advent = add(christmas, -(christmas.getDay() || 7) - 21), king = add(advent, -7);
    var epiphany = date(1, 6), baptism = add(epiphany, 7 - epiphany.getDay());

    if (today >= christmas || today <= baptism) return res(L.christmas, 0, 'white');
    if (today >= advent) {
      var aw = Math.floor(days(today, advent) / 7) + 1;
      return res(L.advent, aw, same(today, add(advent, 14)) ? 'rose' : 'violet');
    }
    if (today < ash) return res(L.ordinary, Math.floor(days(today, baptism) / 7) + 1, 'green');
    if (same(today, ash)) return res(L.ash, 0, 'violet');
    if (today < palm) {
      var lentSun = add(ash, 4), lw = today < lentSun ? 0 : Math.floor(days(today, lentSun) / 7) + 1;
      return res(L.lent, lw, same(today, add(lentSun, 21)) ? 'rose' : 'violet');
    }
    if (same(today, palm)) return res(L.palm, 0, 'red');
    if (today < add(easter, -3)) return res(L.holyWeek, 0, 'violet');
    if (same(today, add(easter, -3))) return res(L.thu, 0, 'white');
    if (same(today, add(easter, -2))) return res(L.fri, 0, 'red');
    if (same(today, add(easter, -1))) return res(L.sat, 0, 'white');
    if (same(today, easter)) return res(L.easterDay, 0, 'white');
    if (today < pentecost) return res(L.easter, Math.floor(days(today, easter) / 7) + 1, 'white');
    if (same(today, pentecost)) return res(L.pentecost, 0, 'red');
    if (same(today, add(pentecost, 7))) return res(L.trinity, 0, 'white');
    if (same(today, king)) return res(L.king, 0, 'white');
    var sunday = add(today, -today.getDay());
    return res(L.ordinary, 34 - Math.round(days(king, sunday) / 7), 'green');
  }
  function fillTodaySeason() {
    var val = $('[data-ns-season]'), dot = $('[data-ns-season-dot]');
    if (!val) return;
    var lit = liturgicalDay(new Date()), L = LIT_TEXT[LANG], label = L.colour + ': ' + L.colours[lit.colour];
    val.textContent = lit.name;
    val.classList.remove('hint');
    if (dot) {
      dot.className = 'lit-dot lit-' + lit.colour;
      dot.setAttribute('role', 'img');
      dot.setAttribute('aria-label', label);
      dot.title = label;
    }
  }
  function todayDateText() {
    var d = new Date();
    try {
      if (LANG === 'en') return new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(d);
      var p = {};
      new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }).formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
      return p.day + ' ' + p.month + ' ' + p.year + ' ' + p.weekday;
    } catch (e) {
      return d.toDateString();
    }
  }
  function fillTodayMystery() {
    var val = $('[data-ns-mystery]');
    if (!val) return;
    loadDataScript('data/tespih.js', 'COMPENDIUM_ROSARY').then(function () {
      var day = new Date().getDay();
      var set = window.COMPENDIUM_ROSARY.sets.filter(function (s) { return s.days.indexOf(day) !== -1; })[0];
      val.textContent = set ? (LANG === 'en' ? set.en : set.tr) : (LANG === 'en' ? 'Unavailable' : 'Bulunamadı');
      val.classList.remove('hint');
      var link = val.closest('a');
      if (link && set) {
        var file = LANG === 'en' ? 'rosary.html' : 'tesbih-duasi.html';
        link.setAttribute('href', ROOT + LANG_PREFIX + file + '#gizem-' + set.id);
      }
    })['catch'](function () { val.textContent = LANG === 'en' ? 'Unavailable' : 'Bulunamadı'; val.classList.remove('hint'); });
  }
  function fillTodaySaint() {
    var val = $('[data-ns-saint]');
    if (!val) return;
    getTodaySaint().then(function (s) {
      val.textContent = s.text;
      val.classList.remove('hint');
      var link = val.closest('a');
      if (link) link.setAttribute('href', s.href);
    })['catch'](function () {
      val.textContent = LANG === 'en' ? 'Unavailable' : 'Bulunamadı';
      val.classList.remove('hint');
    });
  }
  function tickNavTime() {
    var timeEl = $('[data-ns-time]');
    if (!timeEl) return;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    function tick() {
      var d = new Date();
      var time = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
      timeEl.textContent = time;
      timeEl.setAttribute('datetime', time);
      setTimeout(tick, 1000 - (Date.now() % 1000) + 5); // aligned to the next full second
    }
    tick();
  }
  function initNavToday() {
    var dateEl = $('[data-ns-date]');
    if (dateEl) dateEl.textContent = todayDateText();
    tickNavTime();
    fillTodaySeason();
    fillTodayMystery();
    fillTodaySaint();
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
          var e = { n: it.n, page: ROOT + LANG_PREFIX + (LANG === 'en' ? PAGES_EN[pi] : PAGES[pi]), part: p.tr, q: plain(it.tr.q), a: plain(it.tr.a), qe: plain(it.en.q), ae: plain(it.en.a) };
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
     8. Main navigation: four plain links in the bar plus a hamburger,
        shown at every width, that opens the full-site overlay menu.
        Plain DOM, no dependencies.
     --------------------------------------------------------------- */
  function initNav() {
    var sheet = $('#navsheet');
    if (!sheet) return;
    var toggles = $$('.menu-toggle'), panel = $('.navsheet-panel', sheet), hideTimer = null;
    function openSheet() {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      sheet.hidden = false;
      nextFrame(function () { sheet.classList.add('open'); });
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
    if (panel) panel.addEventListener('click', function (e) { if (e.target.closest('a')) closeSheet(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(true); });
    /* Growing past the phone breakpoint while the sheet is open would leave the page locked */
    window.addEventListener('resize', function () { if (window.innerWidth >= 900) closeSheet(false); });
  }

  /* Offset from the cursor, flipping near an edge rather than clamping (the saints' bio panel). */
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
     9. Footer "Kaynaklar ve telif": a native modal <dialog> (focus
        trap, Esc and focus return come from the browser); a click on
        the blurred backdrop closes it too.
     --------------------------------------------------------------- */
  function initSources() {
    var dlg = $('#sources-dialog');
    if (!dlg) return;
    $$('.foot-sources').forEach(function (b) {
      b.addEventListener('click', function () {
        if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
      });
    });
    function close() { if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open'); }
    $('.sources-close', dlg).addEventListener('click', close);
    dlg.addEventListener('click', function (e) {
      var r = dlg.getBoundingClientRect();
      if (e.target === dlg && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) close();
    });
  }

  /* ---------------------------------------------------------------
     10. Rosary: highlights today's set of mysteries, in the visitor's
         own local time zone. The prayer cards are plain <details>.
     --------------------------------------------------------------- */
  function initRosary() {
    if (!$('.myst')) return;

    var day = new Date().getDay();
    $$('.myst').forEach(function (m) {
      var days = (m.getAttribute('data-days') || '').split(',').map(Number);
      if (days.indexOf(day) !== -1) m.classList.add('is-today');
    });
  }

  /* ---------------------------------------------------------------
     10a. Anatolian Roots map (topraklarimizda-hristiyanlik.html): a
          place's card follows the mouse while hovering; a click, tap,
          Enter or an index chip pins it. The card content is the
          server-rendered <article class="amap-card"> for that place.
     --------------------------------------------------------------- */
  function initAnatoliaMap() {
    var root = $('.amap');
    if (!root) return;
    var svg = $('.amap-svg', root), frame = $('.amap-frame', root), scroller = $('.amap-scroll', root);
    var pop = $('.amap-pop', root), body = $('.amap-pop-body', pop), closeBtn = $('.amap-pop-close', pop);
    var sites = {}, cards = {}, chips = $$('.amap-chip', root), shown = null, pinned = false, returnFocus = null, queued = false, lastX = 0, lastY = 0;
    var sheetMq = window.matchMedia ? window.matchMedia('(max-width: 640px)') : { matches: false };
    $$('.amap-site', svg).forEach(function (g) { sites[g.getAttribute('data-site')] = g; });
    $$('.amap-card', root).forEach(function (c) { cards[c.getAttribute('data-site')] = c; });

    function fill(id) {
      if (shown === id) return;
      var card = cards[id];
      body.textContent = '';
      Array.prototype.forEach.call(card.childNodes, function (n) { body.appendChild(n.cloneNode(true)); });
      var h = $('.amap-c-name', body); if (h) h.id = 'amap-pop-h';
      pop.className = 'amap-pop ' + ((card.className.match(/\bc-\w+/) || [''])[0]);
      if (shown && sites[shown]) sites[shown].classList.remove('is-active');
      sites[id].classList.add('is-active');
      chips.forEach(function (c) { if (c.getAttribute('data-site') === id) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current'); });
      shown = id;
    }
    /* x, y: viewport point to sit beside; flips left/up near the screen edges, like placePanel() */
    function place(x, y) {
      if (pop.classList.contains('is-sheet')) return;
      var fr = frame.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight, gap = 16, m = 8;
      var head = $('.site-header'), topLimit = (head ? head.getBoundingClientRect().bottom : 0) + m;
      var left = x + gap;
      if (left + w > window.innerWidth - m) left = x - w - gap;
      left = Math.max(m, Math.min(left, window.innerWidth - w - m));
      var top = y + gap;
      if (top + h > window.innerHeight - m) top = Math.max(topLimit, y - h - gap);
      pop.style.left = (left - fr.left) + 'px';
      pop.style.top = (top - fr.top) + 'px';
    }
    function hide() {
      pop.hidden = true;
      pop.classList.remove('is-pinned', 'is-sheet');
      if (shown && sites[shown]) sites[shown].classList.remove('is-active');
      chips.forEach(function (c) { c.removeAttribute('aria-current'); });
      shown = null; pinned = false;
    }
    function hover(id, x, y) {
      if (pinned) return;
      fill(id);
      pop.hidden = false;
      place(x, y);
    }
    function pin(id, x, y) {
      fill(id);
      pinned = true;
      pop.hidden = false;
      pop.classList.add('is-pinned');
      pop.classList.toggle('is-sheet', sheetMq.matches);
      if (x == null) { var r = sites[id].getBoundingClientRect(); x = r.right; y = r.top + r.height / 2; }
      place(x, y);
      if (pop.classList.contains('is-sheet')) requestAnimationFrame(function () { keepAboveSheet(id); });
    }
    /* Phones: the docked card covers the lower part of the screen, so scroll the chosen place above it */
    function keepAboveSheet(id) {
      var r = sites[id].querySelector('.amap-dot').getBoundingClientRect(), sheetTop = pop.getBoundingClientRect().top;
      var head = $('.site-header'), top = head ? head.getBoundingClientRect().bottom : 0;
      if (r.top > top + 12 && r.bottom < sheetTop - 12) return;
      window.scrollBy({ top: (r.top + r.bottom) / 2 - (top + sheetTop) / 2, behavior: 'auto' });
    }
    function close() {
      var back = returnFocus;
      hide();
      returnFocus = null;
      if (back && back.focus) back.focus();
    }
    function siteAt(e) {
      var g = e.target.closest && e.target.closest('.amap-site');
      if (g) return g.getAttribute('data-site');
      /* Taps between markers (small on phones): the nearest place within reach */
      var best = null, bestD = 24;
      Object.keys(sites).forEach(function (id) {
        var r = sites[id].querySelector('.amap-dot').getBoundingClientRect();
        var d = Math.sqrt(Math.pow(r.left + r.width / 2 - e.clientX, 2) + Math.pow(r.top + r.height / 2 - e.clientY, 2));
        if (d < bestD) { best = id; bestD = d; }
      });
      return best;
    }
    /* Keep a pinned place in view inside the sideways-scrolling map (phones) */
    function reveal(id) {
      var g = sites[id], sr = scroller.getBoundingClientRect(), r = g.getBoundingClientRect();
      if (r.left < sr.left + 24 || r.right > sr.right - 24) scroller.scrollLeft += (r.left + r.width / 2) - (sr.left + sr.width / 2);
    }

    svg.addEventListener('pointerover', function (e) {
      if (e.pointerType !== 'mouse') return;
      var g = e.target.closest('.amap-site');
      if (g) hover(g.getAttribute('data-site'), e.clientX, e.clientY);
    });
    svg.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || pinned || !shown) return;
      lastX = e.clientX; lastY = e.clientY;
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; if (!pinned && shown) place(lastX, lastY); });
    });
    svg.addEventListener('pointerout', function (e) {
      if (e.pointerType !== 'mouse' || pinned) return;
      var from = e.target.closest('.amap-site'), to = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest('.amap-site') : null;
      if (from && from !== to) hide();
    });
    svg.addEventListener('click', function (e) {
      var id = siteAt(e);
      if (!id) { if (pinned) close(); return; }
      if (pinned && shown === id) { close(); return; }
      returnFocus = sites[id];
      pin(id, e.clientX, e.clientY);
    });
    svg.addEventListener('keydown', function (e) {
      var g = e.target.closest && e.target.closest('.amap-site');
      if (!g || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      returnFocus = g;
      pin(g.getAttribute('data-site'));
      closeBtn.focus();
    });
    chips.forEach(function (chip) {
      chip.addEventListener('click', function (e) {
        e.preventDefault();
        var id = chip.getAttribute('data-site'), fr = frame.getBoundingClientRect();
        if (fr.top < 0 || fr.bottom > window.innerHeight) frame.scrollIntoView({ block: 'center', behavior: 'auto' });
        reveal(id);
        returnFocus = chip;
        pin(id);
        closeBtn.focus();
      });
    });
    closeBtn.addEventListener('click', close);
    pop.addEventListener('click', function (e) { if (e.target.closest('.amap-c-more')) hide(); });
    document.addEventListener('click', function (e) {
      if (pinned && !pop.contains(e.target) && !svg.contains(e.target) && chips.indexOf(e.target) === -1) hide();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) close(); });
    window.addEventListener('resize', function () { if (!pop.hidden) hide(); });
  }

  /* ---------------------------------------------------------------
     10b. Rosary tracker: walks a five-decade Rosary prayer by prayer
          over the 59-bead SVG from build.ps1 (Rosary-Svg). One step is
          one prayer, so a bead can hold several steps: the large bead
          between two decades carries the Glory Be and Fatima Prayer
          closing one decade, then the Our Father opening the next.
     --------------------------------------------------------------- */
  var RT_TEXT = {
    tr: {
      opening: 'Giriş', closing: 'Kapanış', today: 'bugün',
      decade: function (d) { return d + '. Gizem'; }, endOf: function (d) { return d + '. onluğun sonu'; },
      ord: ['Birinci Gizem', 'İkinci Gizem', 'Üçüncü Gizem', 'Dördüncü Gizem', 'Beşinci Gizem'],
      announce: 'Gizemi anın', intentions: ['İman için', 'Umut için', 'Sevgi için'],
      doneTitle: 'Tesbih tamamlandı', doneText: 'Beş onluğun hepsini tamamladınız. Dualarınız kabul olsun.',
      next: 'Sonraki', finish: 'Bitir', again: 'Yeniden başla', hide: 'Dua metnini gizle', show: 'Dua metnini göster',
      resumed: 'Kaldığınız yerden devam ediyorsunuz.',
      loadFail: 'Dualar yüklenemedi. Lütfen sayfayı yenileyin.'
    },
    en: {
      opening: 'Opening', closing: 'Closing', today: 'today',
      decade: function (d) { return 'Mystery ' + d; }, endOf: function (d) { return 'End of decade ' + d; },
      ord: ['First Mystery', 'Second Mystery', 'Third Mystery', 'Fourth Mystery', 'Fifth Mystery'],
      announce: 'Announce the mystery', intentions: ['For faith', 'For hope', 'For charity'],
      doneTitle: 'Rosary complete', doneText: 'You have prayed all five decades. May your prayers be heard.',
      next: 'Next', finish: 'Finish', again: 'Pray again', hide: 'Hide prayer text', show: 'Show prayer text',
      resumed: 'Picking up where you left off.',
      loadFail: 'The prayers could not be loaded. Please reload the page.'
    }
  };
  function rosarySteps() {
    var s = [];
    function add(el, p, extra) { var o = { el: el, p: p }; for (var k in extra) o[k] = extra[k]; s.push(o); }
    add('crucifix', 'hac-isareti', { phase: 'open' });
    add('crucifix', 'iman-aciklamasi', { phase: 'open' });
    add('intro-bead-1', 'goklerdeki-pederimiz', { phase: 'open' });
    for (var i = 1; i <= 3; i++) add('intro-bead-' + (i + 1), 'selam-sana-meryem', { phase: 'open', n: i, of: 3, intent: i - 1 });
    add('intro-bead-5', 'pedere-san', { phase: 'open' });
    for (var d = 1; d <= 5; d++) {
      var ofBead = d === 1 ? 'intro-bead-5' : 'decade-' + d + '-our-father';
      if (d > 1) {
        add(ofBead, 'pedere-san', { phase: 'end', decade: d - 1 });
        add(ofBead, 'fatima-duasi', { phase: 'end', decade: d - 1 });
      }
      add(ofBead, 'goklerdeki-pederimiz', { phase: 'decade', decade: d, announce: true });
      for (var k = 1; k <= 10; k++) add('decade-' + d + '-bead-' + k, 'selam-sana-meryem', { phase: 'decade', decade: d, n: k, of: 10 });
    }
    add('centerpiece', 'pedere-san', { phase: 'end', decade: 5 });
    add('centerpiece', 'fatima-duasi', { phase: 'end', decade: 5 });
    add('centerpiece', 'selam-sana-kralice', { phase: 'close' });
    add('centerpiece', 'bitiris-duasi', { phase: 'close' });
    add('crucifix', 'hac-isareti', { phase: 'close' });
    return s;
  }
  function initRosaryTracker() {
    var root = $('.rt');
    if (!root) return;
    var T = RT_TEXT[LANG];
    var svg = $('.rt-svg', root), sheet = $('.rt-sheet', root), select = $('#rt-set', root);
    var ui = {
      context: $('.rt-context', sheet), myst: $('.rt-mystery', sheet), mLabel: $('.rt-m-label', sheet), mTitle: $('.rt-m-title', sheet),
      title: $('.rt-title', sheet), text: $('.rt-text', sheet), prev: $('.rt-prev', sheet), next: $('.rt-next', sheet),
      nextLabel: $('.rt-next span', sheet), bar: $('.rt-progress span', sheet), live: $('.rt-live', sheet), grip: $('.rt-grip', sheet),
      resume: $('.rt-resume', sheet),
      center: $('.rt-center', root), cSet: $('.rt-c-set', root), cCount: $('.rt-c-count', root), cMyst: $('.rt-c-myst', root)
    };
    var steps = rosarySteps(), idx = 0, done = false, prayers = {}, sets = {}, firstSet = null, lastCenter = '';
    var beads = {}, stepsFor = {}, hits = [];
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = window.matchMedia ? window.matchMedia('(max-width: 899.98px)') : { matches: true };

    $$('.bead', svg).forEach(function (b) {
      beads[b.id] = b;
      hits.push({
        id: b.id,
        x: parseFloat(b.getAttribute('cx') || b.getAttribute('data-cx')),
        y: parseFloat(b.getAttribute('cy') || b.getAttribute('data-cy')),
        r: parseFloat(b.getAttribute('r') || b.getAttribute('data-r'))
      });
    });
    steps.forEach(function (st, i) { (stepsFor[st.el] = stepsFor[st.el] || []).push(i); });

    /* Progress is kept in this browser only (localStorage), and only for the day it was
       prayed on: a new day starts fresh on that day's mysteries. */
    var SAVE_KEY = 'kkio-rosary';
    function dayStamp() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
    function saveProgress() {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify({ day: dayStamp(), set: select.value, idx: idx, done: done })); } catch (e) { /* private mode */ }
    }
    function savedProgress() {
      try {
        var s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
        if (s && s.day === dayStamp() && sets[s.set] && s.idx >= 0 && s.idx < steps.length) return s;
      } catch (e) { /* private mode or bad data */ }
      return null;
    }

    function currentSet() { return sets[select.value] || firstSet; }
    function setName() { var s = currentSet(); return LANG === 'en' ? s.en : s.tr; }
    function mysteryName(d) { var it = currentSet().items[d - 1]; return plain(LANG === 'en' ? it.en : it.tr); }
    function setText(el, text) {
      el.textContent = '';
      String(text || '').split(/\n{2,}/).forEach(function (para) {
        var p = document.createElement('p');
        /* The space before each <br> keeps words apart where CSS hides the breaks (phones) */
        para.split('\n').forEach(function (line, i) {
          if (i) { p.appendChild(document.createTextNode(' ')); p.appendChild(document.createElement('br')); }
          p.appendChild(document.createTextNode(line));
        });
        el.appendChild(p);
      });
    }
    function buzz(pattern) { try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* unsupported */ } }

    function paintBeads(st) {
      var visited = {}, upto = done ? steps.length : idx;
      for (var i = 0; i < upto; i++) visited[steps[i].el] = true;
      Object.keys(beads).forEach(function (id) {
        var b = beads[id], state = st && st.el === id ? 'active' : (visited[id] ? 'prayed' : 'unprayed');
        if (!b.classList.contains(state)) { b.classList.remove('unprayed', 'active', 'prayed'); b.classList.add(state); }
        b.classList.toggle('announce', !!(st && st.el === id && st.announce));
      });
      svg.classList.toggle('is-complete', done);
    }
    function paintCenter(st) {
      ui.cSet.textContent = setName();
      ui.cCount.textContent = '';
      if (st && st.n) {
        ui.cCount.appendChild(document.createTextNode(String(st.n)));
        var small = document.createElement('small'); small.textContent = '/' + st.of; ui.cCount.appendChild(small);
      }
      var key;
      ui.cMyst.textContent = '';
      if (done) { key = 'done'; ui.cMyst.textContent = T.doneTitle; }
      else if (st.decade) {
        key = setName() + st.decade;
        var strong = document.createElement('strong'); strong.textContent = T.ord[st.decade - 1];
        ui.cMyst.appendChild(strong); ui.cMyst.appendChild(document.createTextNode(mysteryName(st.decade)));
      } else { key = st.phase; ui.cMyst.textContent = st.phase === 'open' ? T.opening : T.closing; }
      if (key !== lastCenter) {
        ui.center.classList.remove('is-fresh');
        void ui.center.offsetWidth; // restart the fade-in for the new mystery
        ui.center.classList.add('is-fresh');
        lastCenter = key;
      }
    }
    function render(user) {
      var st = done ? null : steps[idx];
      paintBeads(st);
      paintCenter(st);
      sheet.classList.toggle('is-done', done);
      if (done) {
        ui.context.textContent = T.closing;
        ui.myst.hidden = true;
        ui.title.textContent = T.doneTitle;
        setText(ui.text, T.doneText);
        ui.prev.disabled = false;
        ui.nextLabel.textContent = T.again;
        ui.bar.style.width = '100%';
        ui.live.textContent = T.doneTitle;
      } else {
        var p = prayers[st.p][LANG], ctx;
        if (st.phase === 'open') ctx = T.opening + (st.n ? ' · ' + T.intentions[st.intent] + ' · ' + st.n + '/' + st.of : '');
        else if (st.phase === 'decade') ctx = T.decade(st.decade) + (st.n ? ' · ' + st.n + '/' + st.of : '');
        else if (st.phase === 'end') ctx = T.endOf(st.decade);
        else ctx = T.closing;
        ui.context.textContent = ctx;
        if (st.decade) {
          ui.myst.hidden = false;
          ui.myst.classList.toggle('is-announce', !!st.announce);
          ui.mLabel.textContent = st.announce ? T.announce : '';
          ui.mTitle.textContent = T.ord[st.decade - 1] + ': ' + mysteryName(st.decade);
        } else {
          ui.myst.hidden = true;
          ui.myst.classList.remove('is-announce');
        }
        ui.title.textContent = p.title;
        setText(ui.text, p.text);
        ui.text.scrollTop = 0;
        ui.prev.disabled = idx === 0;
        ui.nextLabel.textContent = idx === steps.length - 1 ? T.finish : T.next;
        ui.bar.style.width = (idx / steps.length * 100) + '%';
        ui.live.textContent = p.title + ', ' + ctx + (st.announce ? ', ' + ui.mTitle.textContent : '');
      }
      if (user) ui.resume.hidden = true;
      saveProgress();
      if (user) keepVisible();
    }

    /* Keep the active bead on screen, between the sticky header and (on phones) the docked
       sheet: the whole rosary when it fits there, otherwise the bead centred. */
    function keepVisible() {
      if (done) return;
      var b = beads[steps[idx].el];
      if (!b) return;
      var r = b.getBoundingClientRect(), head = $('.site-header');
      var top = head ? head.getBoundingClientRect().bottom : 0, bottom = window.innerHeight, pad = 14;
      if (narrow.matches) { var sr = sheet.getBoundingClientRect(); if (sr.top > top && sr.top < bottom) bottom = sr.top; }
      if (r.top >= top + pad && r.bottom <= bottom - pad) return;
      var stage = svg.getBoundingClientRect();
      var delta = stage.height <= bottom - top - 2 * pad ? stage.top - top - pad : (r.top + r.bottom) / 2 - (top + bottom) / 2;
      window.scrollBy({ top: delta, behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    function goTo(i, pattern) {
      done = false;
      idx = Math.max(0, Math.min(steps.length - 1, i));
      render(true);
      buzz(steps[idx].announce ? [40, 60, 40] : pattern);
    }
    function next() {
      if (done) { goTo(0, 50); return; }
      if (idx === steps.length - 1) { done = true; render(true); buzz([60, 80, 60, 80, 120]); return; }
      goTo(idx + 1, 50);
    }
    function prev() {
      if (done) { done = false; render(true); buzz(30); return; }
      if (idx > 0) goTo(idx - 1, 30);
    }

    function wire() {
      ui.next.addEventListener('click', next);
      ui.prev.addEventListener('click', prev);
      $('.rt-restart', root).addEventListener('click', function () { goTo(0, 50); });
      select.addEventListener('change', function () { render(false); });
      ui.grip.addEventListener('click', function () {
        var collapsed = sheet.classList.toggle('is-collapsed');
        ui.grip.setAttribute('aria-expanded', String(!collapsed));
        ui.grip.setAttribute('aria-label', collapsed ? T.show : T.hide);
      });
      root.addEventListener('keydown', function (e) {
        if (e.target === select || e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      });
      /* Beads sit closer together than a 44px touch target, so taps are resolved to the
         nearest bead within reach -- and the glowing bead always wins inside its own 44px
         circle, so the thumb can keep tapping it without precision. */
      svg.addEventListener('click', function (e) {
        var ctm = svg.getScreenCTM();
        if (!ctm) return;
        var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        var p = pt.matrixTransform(ctm.inverse()), scale = svg.getBoundingClientRect().width / 360;
        var activeId = done ? null : steps[idx].el, activeHit = null, best = null, bestD = Infinity;
        hits.forEach(function (h) {
          var d = Math.sqrt((h.x - p.x) * (h.x - p.x) + (h.y - p.y) * (h.y - p.y)) * scale;
          if (d > Math.max(22, h.r * scale + 8)) return;
          if (h.id === activeId) activeHit = h;
          if (d < bestD) { best = h; bestD = d; }
        });
        var hit = activeHit || best;
        if (!hit) return;
        if (hit.id === activeId) { next(); return; }
        var list = stepsFor[hit.id], cur = done ? steps.length : idx, pick = list[0];
        list.forEach(function (i) { if (Math.abs(i - cur) < Math.abs(pick - cur)) pick = i; });
        goTo(pick, 50);
      });
    }

    loadDataScript('data/tespih.js', 'COMPENDIUM_ROSARY').then(function () {
      var data = window.COMPENDIUM_ROSARY;
      data.prayers.forEach(function (p) { prayers[p.id] = p; });
      data.sets.forEach(function (s) { sets[s.id] = s; });
      firstSet = data.sets[0];
      var today = new Date().getDay();
      $$('option', select).forEach(function (o) {
        var days = (o.getAttribute('data-days') || '').split(',').map(Number);
        if (days.indexOf(today) !== -1) { o.textContent += ' (' + T.today + ')'; select.value = o.value; }
      });
      var saved = savedProgress();
      if (saved) {
        select.value = saved.set; idx = saved.idx; done = !!saved.done;
        if (idx > 0 && !done) { ui.resume.textContent = T.resumed; ui.resume.hidden = false; }
      }
      wire();
      render(false);
    })['catch'](function () {
      ui.title.textContent = T.loadFail;
      ui.text.textContent = '';
      ui.next.disabled = true;
    });
  }

  /* ---------------------------------------------------------------
     11. Azizler: today's saint in the visitor's own local time zone,
         movable feasts (Easter and everything computed from it)
         grafted onto the fixed calendar, month scroll-spy, and hover
         panel for bios.
     --------------------------------------------------------------- */
  function initSaints() {
    var cal = $('.saints-cal');
    if (!cal) return;

    function localParts() {
      var d = new Date();
      return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
    }
    function addDays(base, year, n) {
      var dt = new Date(Date.UTC(year, base.m - 1, base.d));
      dt.setUTCDate(dt.getUTCDate() + n);
      return { m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
    }

    var MONTHS = LANG === 'en'
      ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      : ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    var today = localParts();
    var easterThis = easterMD(today.year);
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
        var top20Id = !movableTodayCard && typeof TOP20_BY_DATE !== 'undefined' ? TOP20_BY_DATE[today.month + '-' + today.day] : null;
        var items = movableTodayCard ? [{ name: $('h3', source).innerHTML, title: '', bio: $('.m-bio', source).innerHTML }] :
          $$('.saint-item', source).map(function (it) {
            var t = $('.s-title', it);
            return { name: $('.s-name', it).innerHTML, title: t ? t.innerHTML : '', bio: $('.saint-bio', it).innerHTML };
          });
        items.forEach(function (it) {
          var moreSlug = top20Id ? (LANG === 'en' ? TOP20_EN_SLUGS[top20Id] : top20Id) : null;
          var more = moreSlug ? '<a class="today-more-link" href="' + ROOT + LANG_PREFIX + moreSlug + '.html">' + (LANG === 'en' ? 'Read more' : 'Devamını oku') +
            '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></a>' : '';
          pieces.push('<div class="today-more"><span class="today-name">' + it.name + '</span>' +
            (it.title ? '<span class="today-title">' + it.title + '</span>' : '') +
            '<div class="today-bio">' + it.bio + '</div>' + more + '</div>');
        });
      }
      if (pieces.length) body.innerHTML = pieces.join('');
    }

    /* Month pills: without JS these are plain #ay-N anchors and every month shows, full
       year, scroll-to-jump. With JS, only one month shows at a time (today's, at first)
       and a pill click swaps which one instead of scrolling past the other eleven. */
    var pills = $$('.month-pills a');
    var months = $$('.month', cal);
    if (pills.length && months.length) {
      cal.classList.add('month-filter');
      var pillsNav = $('.month-pills');
      function showMonth(m) {
        months.forEach(function (sec) { sec.classList.toggle('is-shown', sec.getAttribute('data-month') === String(m)); });
        pills.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('data-month-link') === String(m)); });
      }
      pills.forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          showMonth(a.getAttribute('data-month-link'));
          if (pillsNav) pillsNav.scrollIntoView({ block: 'start', behavior: FINE ? 'smooth' : 'auto' });
        });
      });
      showMonth(today.month);
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
        nextFrame(function () { panel.classList.add('open'); });
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
    if (!pills.length) return;
    pills.forEach(function (a) {
      a.addEventListener('click', function () {
        var target = document.getElementById(a.getAttribute('href').slice(1));
        if (target && target.tagName === 'DETAILS') target.open = true;
      });
    });
    /* All six parts start closed. Opening one (by clicking its own summary/icon, or via a
       pill above, which also fires this same native toggle event) closes every other part,
       so only one part's text is ever on screen at a time -- a plain accordion. */
    var parts = $$('.mass-part');
    parts.forEach(function (part) {
      part.addEventListener('toggle', function () {
        if (!part.open) return;
        parts.forEach(function (other) { if (other !== part) other.open = false; });
      });
    });
    if (!window.IntersectionObserver) return;
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
     12b. Examination of Conscience generator (Confession page): checked
          items become a personal checklist. Nothing is stored (no
          localStorage, no network); it lives only in the checkbox state
          already in the DOM, so a reload clears it on its own.
     --------------------------------------------------------------- */
  function initExamen() {
    var tool = $('.examen-tool');
    if (!tool) return;
    var generateBtn = $('.examen-generate', tool);
    var clearBtn = $('.examen-clear', tool);
    var result = $('#examen-result', tool);
    var resultBody = $('#examen-result-body', tool);
    var emptyText = LANG === 'en' ? "You haven't checked anything yet." : 'Henüz hiçbir şey işaretlemediniz.';
    generateBtn.addEventListener('click', function () {
      var groups = [];
      $$('.examen-card').forEach(function (card) {
        var checked = $$('[data-examen-item]:checked', card);
        if (!checked.length) return;
        var title = $('.examen-title', card).textContent;
        var items = checked.map(function (box) { return $('label[for="' + box.id + '"]', card).textContent; });
        groups.push({ title: title, items: items });
      });
      if (!groups.length) {
        resultBody.innerHTML = '<p class="examen-empty">' + emptyText + '</p>';
      } else {
        resultBody.innerHTML = groups.map(function (g) {
          var lis = g.items.map(function (t) { return '<li>' + t + '</li>'; }).join('');
          return '<div class="examen-result-group"><h4>' + g.title + '</h4><ul>' + lis + '</ul></div>';
        }).join('');
      }
      result.hidden = false;
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    if (clearBtn) clearBtn.addEventListener('click', function () {
      $$('[data-examen-item]').forEach(function (box) { box.checked = false; });
      result.hidden = true;
      resultBody.innerHTML = '';
      tool.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------------------------------------------------------------
     13. Home page: today's saint, lazy-loaded from its own data file
         (same pattern as search) only when the home page actually has
         the widget to fill.
     --------------------------------------------------------------- */
  function loadDataScript(src, globalName) {
    return new Promise(function (resolve, reject) {
      if (window[globalName]) return resolve();
      var s = document.createElement('script');
      s.src = ROOT + src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  /* "M-D" -> the Top-20 saint page for every calendar day that honours one of
     them, so the home page's today's-saint links can go straight to that
     saint's own page instead of the general calendar. Hand-built from
     data/azizler.js and data/buyuk-azizler.js, since it's a fixed calendar
     fact, not something to recompute client-side. June 29 (Petrus and Pavlus
     together) is deliberately left out: it's one calendar entry for two
     people, so it falls back to the general azizler.html like any other day. */
  var TOP20_BY_DATE = {
    '1-1': 'meryem-ana', '1-28': 'aziz-thomas-aquinas',
    '2-11': 'meryem-ana',
    '3-17': 'aziz-patrick', '3-19': 'aziz-yusuf',
    '4-29': 'sienali-aziz-catharina',
    '5-1': 'aziz-yusuf', '5-13': 'meryem-ana', '5-24': 'meryem-ana', '5-31': 'meryem-ana',
    '6-13': 'padovali-aziz-antonius', '6-24': 'vaftizci-yahya',
    '7-11': 'aziz-benedictus', '7-16': 'meryem-ana', '7-31': 'aziz-ignatius-loyola',
    '8-15': 'meryem-ana', '8-22': 'meryem-ana', '8-28': 'aziz-augustinus', '8-29': 'vaftizci-yahya',
    '9-5': 'kalkutali-aziz-teresa', '9-8': 'meryem-ana', '9-12': 'meryem-ana', '9-15': 'meryem-ana',
    '9-23': 'padre-pio', '9-24': 'meryem-ana', '9-30': 'aziz-hieronymus',
    '10-1': 'lisieuxlu-kucuk-teresa', '10-4': 'assisili-aziz-francis', '10-7': 'meryem-ana',
    '10-15': 'avilali-aziz-teresa', '10-22': 'aziz-ii-yuhanna-pavlus',
    '11-21': 'meryem-ana',
    '12-8': 'meryem-ana', '12-10': 'meryem-ana', '12-12': 'meryem-ana', '12-27': 'havari-yuhanna'
  };
  /* English slugs for the same Top-20 ids (see Add-EnAlt calls in build.ps1). */
  var TOP20_EN_SLUGS = {
    'meryem-ana': 'mary', 'aziz-yusuf': 'saint-joseph', 'havari-petrus': 'saint-peter',
    'havari-pavlus': 'saint-paul', 'vaftizci-yahya': 'john-the-baptist', 'havari-yuhanna': 'saint-john',
    'aziz-augustinus': 'saint-augustine', 'aziz-thomas-aquinas': 'thomas-aquinas',
    'assisili-aziz-francis': 'francis-of-assisi', 'sienali-aziz-catharina': 'catherine-of-siena',
    'avilali-aziz-teresa': 'teresa-of-avila', 'lisieuxlu-kucuk-teresa': 'therese-of-lisieux',
    'aziz-ignatius-loyola': 'ignatius-of-loyola', 'aziz-benedictus': 'saint-benedict',
    'aziz-patrick': 'saint-patrick', 'padovali-aziz-antonius': 'anthony-of-padua',
    'kalkutali-aziz-teresa': 'mother-teresa', 'aziz-ii-yuhanna-pavlus': 'john-paul-ii',
    'padre-pio': 'padre-pio', 'aziz-hieronymus': 'saint-jerome'
  };
  /* Shared by the home page's "Saint of the Day" pill and the nav overlay's today-pill. */
  function getTodaySaint() {
    var todayDate = new Date();
    var today = { year: todayDate.getFullYear(), month: todayDate.getMonth() + 1, day: todayDate.getDate() };
    return loadDataScript('data/azizler.js', 'SAINTS').then(function () {
      var day = window.SAINTS.days.filter(function (d) { return d.m === today.month && d.d === today.day; })[0];
      var s = day && day.saints && day.saints[0];
      var top20Id = TOP20_BY_DATE[today.month + '-' + today.day];
      var slug = top20Id ? (LANG === 'en' ? TOP20_EN_SLUGS[top20Id] : top20Id) : (LANG === 'en' ? 'saints' : 'azizler');
      var href = ROOT + LANG_PREFIX + slug + '.html';
      var noSaintText = LANG === 'en' ? 'None for today' : 'Bugün için yok';
      return { text: s ? (LANG === 'en' ? s.nameEn : s.name) : noSaintText, href: href };
    });
  }
  function initHomeWidgets() {
    var saintPill = $('[data-home-saint-pill] .tp-value');
    if (!saintPill) return;
    getTodaySaint().then(function (s) {
      saintPill.textContent = s.text;
      saintPill.classList.remove('hint');
      var pillLink = saintPill.closest('a');
      if (pillLink) pillLink.setAttribute('href', s.href);
    })['catch'](function () {
      saintPill.textContent = LANG === 'en' ? 'Failed to load' : 'Yüklenemedi';
      saintPill.classList.remove('hint');
    });
  }

  /* Home page only: the Katekizm card's search icon pops out a large, backdrop-blurred
     search dialog instead of the old always-visible hero search box. The button is hidden
     on mobile by CSS, so this never wires up there; the card itself still needs a plain
     click-to-navigate handler since (unlike its siblings) it is a <div>, not one big <a>,
     to give the search button its own valid, separately clickable target. */
  function initHomeSearch() {
    var overlay = $('#home-katekizm-search'), btn = $('.card-search-btn'), card = $('.katekizm-card');
    if (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.card-search-btn')) return;
        location.href = ROOT + LANG_PREFIX + (LANG === 'en' ? 'compendium.html' : 'katesizm.html');
      });
    }
    if (!overlay || !btn) return;
    var open = false;
    function show() {
      open = true;
      overlay.hidden = false;
      nextFrame(function () { overlay.classList.add('open'); });
      btn.setAttribute('aria-expanded', 'true');
      var input = $('input', overlay);
      if (input) input.focus();
    }
    function hide() {
      open = false;
      overlay.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      setTimeout(function () { if (!open) overlay.hidden = true; }, 220);
      btn.focus();
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); show(); });
    $$('[data-kso-close]', overlay).forEach(function (el) { el.addEventListener('click', hide); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) hide(); });
  }

  /* GitHub Pages doesn't send an X-Frame-Options/frame-ancestors header, and that CSP
     directive is ignored when set via a <meta> tag, so this is the remaining defense
     against the site being loaded inside someone else's iframe (clickjacking). */
  function initFrameBust() {
    try { if (window.top !== window.self) window.top.location = window.self.location.href; } catch (e) { /* cross-origin top: assume framed and bail the same way */ window.top.location = window.self.location.href; }
  }

  /* Build.ps1 writes the public contact address as a placeholder with the user/domain split
     across two data attributes, not as plain "name@domain" text, so a basic scraper reading
     the raw HTML finds nothing to harvest. Real visitors with JS never notice the difference. */
  function initEmail() {
    $$('.email-link').forEach(function (a) {
      var addr = a.getAttribute('data-u') + '@' + a.getAttribute('data-d');
      a.href = 'mailto:' + addr;
      a.textContent = addr;
    });
  }

  /* Printing (or Save as PDF) should show every <details> section in full,
     not just the ones the reader happened to have open (saint bios, FAQ
     answers). Opens them all right before the browser's print dialog, then
     restores whichever ones were actually open. Latin prayer text (.latin)
     is excluded: the print stylesheet hides it outright, screen/mobile keep
     it as a collapsed toggle either way. */
  function initPrintExpand() {
    var reopen = [];
    window.addEventListener('beforeprint', function () {
      reopen = [];
      $$('details:not(.latin):not([open])').forEach(function (d) { d.setAttribute('open', ''); reopen.push(d); });
    });
    window.addEventListener('afterprint', function () {
      reopen.forEach(function (d) { d.removeAttribute('open'); });
      reopen = [];
    });
  }

  /* ---------------------------------------------------------------
     14. Kiliseler (parish locator): a rite <select> plus a
         one-city-at-a-time browsing mode. Every city is a native
         <details> (collapsed by default, works with no JS at all);
         this script only adds on top of that:
           - on load, only İstanbul's <details> is left visible, so
             the page opens on one manageable city instead of all ten;
           - a city pill shows only that city and opens it;
           - "Tüm Kiliseler" in the rite <select> shows every city,
             already expanded; a specific rite (e.g. Süryani Katolik)
             instead reveals and expands only the cities that actually
             have a matching church, wherever they are.
         The Mass-times disclosure per card is a separate, plain
         native <details>; its expanded body is styled as a floating
         popup on wide screens purely in CSS, no JS needed for that.
     --------------------------------------------------------------- */
  function initChurchFilter() {
    var select = $('#rite-select');
    if (!select) return;
    var cityLinks = $$('[data-city-link]');
    var cities = $$('.church-city');
    var cards = $$('.church-card');

    function showOnlyCity(id) { cities.forEach(function (sec) { sec.hidden = sec.id !== id; }); }
    function showAllCities() { cities.forEach(function (sec) { sec.hidden = false; }); }
    function markCurrentCity(id) {
      cityLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('data-city-link') === id); });
    }

    function applyRite(rite, expandAll) {
      cards.forEach(function (c) { c.hidden = rite !== 'all' && c.getAttribute('data-rite') !== rite; });
      showAllCities();
      if (rite !== 'all') {
        cities.forEach(function (sec) {
          var anyMatch = $$('.church-card', sec).some(function (c) { return !c.hidden; });
          sec.hidden = !anyMatch;
          if (anyMatch) sec.open = true;
        });
      } else if (expandAll) {
        cities.forEach(function (sec) { sec.open = true; });
      }
      markCurrentCity(null);
    }

    function goToCity(id) {
      applyRite('all', false); // a fresh city view shows everything in it, regardless of any prior rite filter
      select.value = 'all';
      showOnlyCity(id);
      var sec = document.getElementById(id);
      if (sec) sec.open = true;
      markCurrentCity(id);
    }

    select.addEventListener('change', function () { applyRite(select.value, select.value === 'all'); });
    cityLinks.forEach(function (a) { a.addEventListener('click', function () { goToCity(a.getAttribute('data-city-link')); }); });

    showOnlyCity('istanbul');
    markCurrentCity('istanbul');
  }

  /* ---------------------------------------------------------------
     Pinned section links (Kilise Bul, Meseller, Mucizeler, Sorular): the row
     gets .is-stuck once it reaches the header (for its glass band)
     and publishes its height as --toc-h so in-page jumps land below
     it. On the long lists it also highlights the section
     being read; Kilise Bul marks its one open city itself. When the
     row is too long for one line it scrolls sideways, keeping the
     highlighted link in view.
     --------------------------------------------------------------- */
  function initStickyToc() {
    var nav = $('.faq-toc.is-sticky');
    if (!nav) return;
    var root = document.documentElement, list = $('ul', nav);
    var links = $$('a[href^="#"]', nav);
    var spy = !links.some(function (a) { return a.hasAttribute('data-city-link'); });
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var smooth = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var top = 64, current, ticking = false;

    function measure() {
      root.style.setProperty('--toc-h', nav.offsetHeight + 'px');
      top = parseFloat(getComputedStyle(nav).top) || 64;
    }
    function reveal(a) {
      if (!a || list.scrollWidth <= list.clientWidth) return;
      var left = a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2;
      list.scrollTo({ left: Math.max(0, left), behavior: smooth ? 'smooth' : 'auto' });
    }
    function update() {
      ticking = false;
      nav.classList.toggle('is-stuck', nav.getBoundingClientRect().top <= top + 1);
      if (!spy) return;
      var line = top + nav.offsetHeight + 24, pick = null;
      targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= line) pick = links[i]; });
      if (pick === current) return;
      current = pick;
      links.forEach(function (a) {
        a.classList.toggle('is-current', a === pick);
        if (a === pick) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
      reveal(pick);
    }
    function queue() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

    // Fade (and, for a mouse, an arrow on) whichever end of the row has links out of view
    function ends() {
      var max = list.scrollWidth - list.clientWidth;
      nav.classList.toggle('fade-l', max > 1 && list.scrollLeft > 1);
      nav.classList.toggle('fade-r', max > 1 && list.scrollLeft < max - 1);
    }
    var chev = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>'; };
    [['prev', 'm15 18-6-6 6-6', -1], ['next', 'm9 18 6-6-6-6', 1]].forEach(function (x) {
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'toc-arrow ' + x[0]; btn.tabIndex = -1; btn.setAttribute('aria-hidden', 'true');
      btn.innerHTML = chev(x[1]);
      btn.addEventListener('click', function () { list.scrollBy({ left: x[2] * list.clientWidth * 0.7, behavior: smooth ? 'smooth' : 'auto' }); });
      nav.appendChild(btn);
    });
    list.addEventListener('scroll', ends, { passive: true });

    measure(); update(); ends();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', function () { measure(); ends(); queue(); });
    if (window.ResizeObserver) new ResizeObserver(function () { measure(); ends(); queue(); }).observe(nav);
    links.forEach(function (a) { a.addEventListener('click', function () { reveal(a); }); });
  }


  /* ---------------------------------------------------------------
     11. Settings panel (the gear beside the logo): the language switch,
         then accessibility profile presets and individual settings
         (contrast, text spacing, a
         hover-to-read "screen reader" using the Web Speech API, etc.).
         All visual effects are CSS driven by data-a11y-* attributes on
         <html> (see styles.css) rather than a `filter`, which would
         otherwise break position:fixed descendants (header, dialogs).
         State persists in localStorage like the theme and text-size
         toggles; "Bigger Text" reuses that existing font-size toggle
         instead of keeping its own separate state.
     --------------------------------------------------------------- */
  function initA11y() {
    var toggleBtn = $('.settings-btn'), panel = $('#settings-panel');
    if (!toggleBtn || !panel) return;
    var closeBtn = $('.a11y-close', panel);
    var A11Y_KEY = 'kkio-a11y';
    var KEYS = ['reader', 'contrast', 'saturation', 'spacing', 'links', 'dyslexia', 'cursor'];
    var PROFILES = {
      motor:      { keys: ['cursor', 'spacing', 'links'], bigtext: false },
      blind:      { keys: ['reader', 'contrast'], bigtext: true },
      colorblind: { keys: ['saturation', 'links', 'contrast'], bigtext: false },
      dyslexia:   { keys: ['dyslexia', 'spacing'], bigtext: true }
    };
    var state = (function () { try { return JSON.parse(localStorage.getItem(A11Y_KEY) || '{}'); } catch (e) { return {}; } })();
    var speaking = null;

    function saveState() { try { localStorage.setItem(A11Y_KEY, JSON.stringify(state)); } catch (e) { /* private mode */ } }
    function bigTextOn() { return fontsizeLevel() !== '0'; }
    function setBigText(on) {
      if (on) document.documentElement.setAttribute('data-fontsize', '2'); else document.documentElement.removeAttribute('data-fontsize');
      try { localStorage.setItem(FONTSIZE_KEY, on ? '2' : '0'); } catch (e) { /* private mode */ }
      syncFontsize();
    }
    function stopReading() {
      try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { /* unsupported */ }
      if (speaking) { speaking.classList.remove('a11y-reading'); speaking = null; }
    }
    function speakEl(el) {
      if (!('speechSynthesis' in window) || el === speaking) return;
      /* Many elements carry a nested translation/original in a different
         language (e.g. a heading's English gloss span, a hidden Latin or
         "original English" toggle block) purely for sighted/print use.
         textContent would pull all of it in regardless of visibility or
         language, so the wrong-language portion gets read aloud in the
         page's voice. Strip any descendant whose lang doesn't match the
         language of the element actually being read. */
      var effLang = ((el.closest('[lang]') || document.documentElement).getAttribute('lang') || document.documentElement.lang || 'tr').split('-')[0];
      var clone = el.cloneNode(true);
      $$('[lang]', clone).forEach(function (n) {
        var l = (n.getAttribute('lang') || '').split('-')[0];
        if (l && l !== effLang) n.remove();
      });
      var text = (clone.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 500);
      if (!text) return;
      try { window.speechSynthesis.cancel(); } catch (e) { /* unsupported */ }
      if (speaking) speaking.classList.remove('a11y-reading');
      speaking = el;
      el.classList.add('a11y-reading');
      try {
        var u = new SpeechSynthesisUtterance(text);
        u.lang = effLang === 'en' ? 'en-US' : effLang === 'tr' ? 'tr-TR' : effLang;
        window.speechSynthesis.speak(u);
      } catch (e) { /* unsupported */ }
    }
    function apply() {
      KEYS.forEach(function (k) {
        if (state[k]) document.documentElement.setAttribute('data-a11y-' + k, '1');
        else document.documentElement.removeAttribute('data-a11y-' + k);
      });
      $$('.a11y-tile', panel).forEach(function (t) {
        var k = t.getAttribute('data-a11y-toggle');
        t.setAttribute('aria-pressed', String(k === 'bigtext' ? bigTextOn() : !!state[k]));
      });
      $$('.a11y-profile', panel).forEach(function (p) {
        var def = PROFILES[p.getAttribute('data-a11y-profile')];
        var on = !!def && def.keys.every(function (k) { return !!state[k]; }) && (!def.bigtext || bigTextOn());
        p.setAttribute('aria-pressed', String(on));
      });
      if (!state.reader) stopReading();
    }

    $$('.a11y-tile', panel).forEach(function (t) {
      var k = t.getAttribute('data-a11y-toggle');
      t.addEventListener('click', function () {
        if (k === 'bigtext') { setBigText(!bigTextOn()); apply(); return; }
        state[k] = !state[k];
        saveState();
        apply();
      });
    });
    $$('.a11y-profile', panel).forEach(function (p) {
      p.addEventListener('click', function () {
        var def = PROFILES[p.getAttribute('data-a11y-profile')];
        if (!def) return;
        var allOn = def.keys.every(function (k) { return !!state[k]; }) && (!def.bigtext || bigTextOn());
        def.keys.forEach(function (k) { state[k] = !allOn; });
        saveState();
        if (def.bigtext) setBigText(!allOn);
        apply();
      });
    });
    var resetBtn = $('.a11y-reset', panel);
    if (resetBtn) resetBtn.addEventListener('click', function () {
      state = {};
      saveState();
      setBigText(false);
      apply();
    });

    var open = false;
    /* Drops down under the gear beside the logo; on phones (CSS) it spans the width instead */
    function position() {
      if (window.innerWidth <= 480) { panel.style.left = ''; return; }
      var r = toggleBtn.getBoundingClientRect(), w = panel.offsetWidth;
      panel.style.left = Math.max(12, Math.min(r.left - 16, window.innerWidth - w - 12)) + 'px';
    }
    function show() {
      open = true;
      panel.hidden = false;
      position();
      nextFrame(function () { panel.classList.add('open'); });
      toggleBtn.setAttribute('aria-expanded', 'true');
      var first = $('.a11y-lang-switch', panel);
      if (first) first.focus({ preventScroll: true });
    }
    function hide() {
      open = false;
      panel.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      setTimeout(function () { if (!open) panel.hidden = true; }, 220);
    }
    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (open) hide(); else show();
    });
    if (closeBtn) closeBtn.addEventListener('click', hide);
    document.addEventListener('click', function (e) {
      if (open && !panel.contains(e.target) && e.target !== toggleBtn && !toggleBtn.contains(e.target)) hide();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) { hide(); toggleBtn.focus(); }
    });
    window.addEventListener('resize', function () { if (open) position(); });

    var READ_SEL = 'h1,h2,h3,h4,p,a,li,button,summary,figcaption';
    document.addEventListener('mouseover', function (e) {
      if (!state.reader || panel.contains(e.target) || toggleBtn.contains(e.target)) return;
      var el = e.target.closest(READ_SEL);
      if (el) speakEl(el);
    });
    document.addEventListener('focusin', function (e) {
      if (!state.reader) return;
      var el = e.target.closest(READ_SEL);
      if (el) speakEl(el);
    });

    apply();
  }

  /* Keep --header-h equal to the real (sticky) header height so the reading bar and anchors never hide under it */
  function initMapLinks() {
    var links = $$('.map-link');
    if (!links.length) return;
    var ua = window.navigator.userAgent || '';
    var isIOS = /iPad|iPhone|iPod/.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    if (!isIOS) return;
    links.forEach(function (a) {
      var q = a.getAttribute('data-map-q');
      if (q) a.href = 'https://maps.apple.com/?q=' + encodeURIComponent(q);
    });
  }

  function initHeaderHeight() {
    var header = $('.site-header');
    if (!header) return;
    function set() { document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px'); }
    set();
    if (window.ResizeObserver) new ResizeObserver(set).observe(header); else window.addEventListener('resize', set);
  }

  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    initFrameBust(); initHeaderHeight(); initTheme(); initFontSize(); initEmail(); initNavToday(); initReveal(); initRevealAll();
    initSearch(); initReader(); initDrawer(); initNav(); initSources(); initRosary(); initRosaryTracker(); initAnatoliaMap(); initSaints(); initMass(); initExamen(); initHomeWidgets(); initHomeSearch(); initPrintExpand();
    initChurchFilter(); initStickyToc(); initMapLinks(); initA11y();
  });
})();
