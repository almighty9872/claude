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
  /* A content hash per data file, written in by tools/build.ps1, so every data file URL
     changes whenever its content does (and so can be cached for a long time) */
  var DATA_VER = {"__DATA_VER__": 1};
  function dataUrl(src) { return ROOT + src + (DATA_VER[src] ? '?v=' + DATA_VER[src] : ''); }
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
  /* The browser's own bars follow the theme too: through the theme-color meta (Safari up to
     iOS 18, Chrome on Android); Safari 26 reads the solid header and tab bar instead. */
  function syncChrome() {
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--chrome').trim() || (isDark() ? '#0f1728' : '#f8f5ee'));
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
        syncChrome();
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
        s.src = dataUrl(src); s.onload = resolve; s.onerror = reject;
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
    /* Search button (phones): opens the question search under the reading bar */
    var rbBtn = $('.rb-search-btn', content), rbBox = $('#rb-search');
    if (rbBtn && rbBox) {
      rbBtn.addEventListener('click', function () {
        var on = rbBox.hidden;
        rbBox.hidden = !on;
        rbBtn.setAttribute('aria-expanded', String(on));
        if (on) { var inp = $('input', rbBox); if (inp) inp.focus({ preventScroll: true }); }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !rbBox.hidden && rbBox.contains(document.activeElement)) { rbBox.hidden = true; rbBtn.setAttribute('aria-expanded', 'false'); rbBtn.focus(); }
      });
    }
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
    var halo = $('.rt-halo', root);
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
      if (halo) {
        var on = st && !done && beads[st.el];
        halo.style.display = on ? '' : 'none';
        if (on) {
          var b = beads[st.el], g = b.tagName.toLowerCase() === 'g';
          var r = parseFloat(b.getAttribute(g ? 'data-r' : 'r'));
          halo.setAttribute('cx', b.getAttribute(g ? 'data-cx' : 'cx'));
          halo.setAttribute('cy', b.getAttribute(g ? 'data-cy' : 'cy'));
          halo.setAttribute('r', String(Math.round(r * (g ? 1.35 : 2.9))));
        }
      }
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
     13. Home page: today's saint, lazy-loaded from its own data file
         (same pattern as search) only when the home page actually has
         the widget to fill.
     --------------------------------------------------------------- */
  function loadDataScript(src, globalName) {
    return new Promise(function (resolve, reject) {
      if (window[globalName]) return resolve();
      var s = document.createElement('script');
      s.src = dataUrl(src); s.onload = resolve; s.onerror = reject;
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
    /* Just the names (data/azizler-adlar.js, a few KB written by the build), not the whole
       calendar with its biographies: this runs on the home page and in every page's menu */
    return loadDataScript('data/azizler-adlar.js', 'SAINT_NAMES').then(function () {
      var s = window.SAINT_NAMES[today.month + '-' + today.day];
      if (s) s = { name: s[0], nameEn: s[1] };
      var top20Id = TOP20_BY_DATE[today.month + '-' + today.day];
      var slug = top20Id ? (LANG === 'en' ? TOP20_EN_SLUGS[top20Id] : top20Id) : (LANG === 'en' ? 'saints' : 'azizler');
      var href = ROOT + LANG_PREFIX + slug + '.html';
      var noSaintText = LANG === 'en' ? 'None for today' : 'Bugün için yok';
      return { text: s ? (LANG === 'en' ? s.nameEn : s.name) : noSaintText, href: href };
    });
  }
  /* ---------------------------------------------------------------
     Home page. Three cards for today: the saint (with the opening of
     their life, from a small file per month), the date with the
     liturgical season (the card takes the season's colour) and the
     day's rosary mysteries. On phones, four app icons below them:
     Ara opens the Katekizm search over the blurred screen, and the
     others open Settings-style pages that grow out of their icon,
     slide further in to a page's sections, and shrink back into the
     icon on Kapat. A swipe in from the left edge goes back a level.
     --------------------------------------------------------------- */
  function initHome() {
    var home = $('.home-v2');
    if (!home) return;
    var now = new Date(), en = LANG === 'en';
    /* the date and the season */
    var dayEl = $('[data-hd-day]'), yearEl = $('[data-hd-year]'), litCard = $('[data-home-lit]');
    try {
      var loc = en ? 'en-US' : 'tr-TR';
      dayEl.textContent = new Intl.DateTimeFormat(loc, en ? { month: 'long', day: 'numeric' } : { day: 'numeric', month: 'long' }).format(now);
      yearEl.textContent = now.getFullYear() + ' · ' + new Intl.DateTimeFormat(loc, { weekday: 'long' }).format(now);
    } catch (e) { dayEl.textContent = now.toDateString(); }
    var lit = liturgicalDay(now), LT = LIT_TEXT[LANG];
    $('[data-hd-season]').textContent = lit.name;
    $('[data-hd-colour]').textContent = LT.colour + ': ' + LT.colours[lit.colour];
    litCard.setAttribute('data-lit', lit.colour);
    /* the saint */
    var saintCard = $('[data-home-saint]'), m = now.getMonth() + 1, key = m + '-' + now.getDate();
    getTodaySaint().then(function (sn) {
      $('[data-hs-name]', saintCard).textContent = sn.text;
      saintCard.setAttribute('href', sn.href);
      return loadDataScript('data/azizler-ozet-' + m + '.js', 'SAINT_SUMMARY_' + m);
    }).then(function () {
      var x = (window['SAINT_SUMMARY_' + m] || {})[key];
      if (!x) return;
      $('[data-hs-title]', saintCard).textContent = en ? x[1] : x[0];
      $('[data-hs-bio]', saintCard).textContent = en ? x[3] : x[2];
    })['catch'](function () { $('[data-hs-name]', saintCard).textContent = en ? 'Saints of the year' : 'Yılın azizleri'; });
    /* the mysteries */
    var myst = $('[data-home-mystery]');
    loadDataScript('data/tespih.js', 'COMPENDIUM_ROSARY').then(function () {
      var set = window.COMPENDIUM_ROSARY.sets.filter(function (x) { return x.days.indexOf(now.getDay()) !== -1; })[0];
      if (!set) return;
      $('[data-hm-name]', myst).textContent = en ? set.en : set.tr;
      /* the days this set is prayed on, and its name in the other language */
      $('[data-hm-days]', myst).textContent = '(' + (en ? set.dayEn : set.dayTr) + ') ' + (en ? set.tr : set.en);
      myst.setAttribute('href', ROOT + LANG_PREFIX + (en ? 'rosary.html' : 'tesbih-duasi.html') + '#gizem-' + set.id);
    })['catch'](function () { $('[data-hm-name]', myst).textContent = en ? 'The Rosary' : 'Tesbih'; });

    /* the date card's clock: 24-hour, with seconds */
    var clock = $('[data-hd-time]');
    if (clock) {
      var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
      (function tick() {
        var d = new Date(), t = pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
        clock.textContent = t; clock.setAttribute('datetime', t);
        setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
      })();
    }

    /* the apps */
    var EASE = 'cubic-bezier(.2,.9,.22,1)', openApp = null, fromIcon = null, fromBtn = null;
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var TREES = homeTrees(home);
    /* Each level of an open app, down to the content levels under Bölümler, is a history
       entry, so the browser's own back (Safari's swipe from the left edge, Android's back
       gesture, the back button) steps back one level, as in an iPhone app. depth counts the
       entries this page has added. */
    var depth = 0, skipPop = 0, edgeAt = 0;
    function iconTransform(icon, box) {
      var r = icon.getBoundingClientRect(), b = box.getBoundingClientRect();
      var sx = r.width / b.width, sy = r.height / b.height;
      return { t: 'translate(' + ((r.left + r.width / 2) - (b.left + b.width / 2)) + 'px,' + ((r.top + r.height / 2) - (b.top + b.height / 2)) + 'px) scale(' + sx + ',' + sy + ')', rad: (18 / sx) + 'px ' + (18 / sy) + 'px' };
    }
    function boxOf(app) { return app.classList.contains('ios-spot') ? $('.ios-spot-panel', app) : app; }
    function currentPage(app) { return $('.ios-page.is-current', app); }
    function stateOf(app) {
      var pg = currentPage(app), t = pg && pg._tree;
      return { homeApp: app.id.slice(4), page: pg ? pg.getAttribute('data-page') : 'root', tree: t ? t.stack.slice(1).map(function (l) { return l.k; }) : [] };
    }
    function mark(app) { try { history.pushState(stateOf(app), ''); depth++; } catch (e) { /* file:// */ } }
    function open(btn, instant) {
      var id = btn.getAttribute('data-app-open'), app = document.getElementById('app-' + id);
      if (!app || openApp) return;
      openApp = app; fromBtn = btn; fromIcon = $('.hm-icon', btn);
      app.hidden = false;
      document.documentElement.classList.add('app-open');
      var box = boxOf(app), spot = box !== app;
      if (!still && !instant) {
        var tf = iconTransform(fromIcon, box);
        box.style.transition = 'none'; box.style.transform = tf.t; box.style.borderRadius = tf.rad;
        if (spot) box.style.opacity = '0';
        box.getBoundingClientRect();
        box.style.transition = 'transform .5s ' + EASE + ', border-radius .5s ' + EASE + ', opacity .25s';
      }
      requestAnimationFrame(function () {
        box.style.transform = ''; box.style.borderRadius = ''; box.style.opacity = '';
        app.classList.add('is-open');
      });
      if (!instant) mark(app);
      var focusTo = spot ? $('input', app) : $('.ios-page.is-current .ios-done', app);
      if (focusTo && !instant) setTimeout(function () { focusTo.focus({ preventScroll: true }); }, spot ? 60 : 350);
    }
    function finishClose(app) {
      var box = boxOf(app);
      app.hidden = true;
      box.style.transition = 'none'; box.style.transform = ''; box.style.borderRadius = ''; box.style.opacity = '';
      $$('.ios-page', app).forEach(function (p) {
        p.classList.toggle('is-current', p.getAttribute('data-page') === 'root'); p.classList.remove('is-behind', 'is-scrolled'); p.style.transform = ''; p.style.transition = '';
        if (p._tree) treeReset(p);
      });
      document.documentElement.classList.remove('app-open');
      openApp = null;
    }
    function close(fromHistory) {
      var app = openApp;
      if (!app) return;
      var box = boxOf(app), spot = box !== app;
      app.classList.remove('is-open');
      if (!still) {
        var tf = iconTransform(fromIcon, box);
        box.style.transition = 'transform .38s ' + EASE + ', border-radius .38s ' + EASE + ', opacity .3s';
        box.style.transform = tf.t; box.style.borderRadius = tf.rad;
        if (spot) box.style.opacity = '0';
      }
      setTimeout(function () { finishClose(app); if (fromBtn) fromBtn.focus({ preventScroll: true }); }, still ? 0 : 390);
      /* Kapat from deep inside: take all of this app's entries off the history at once */
      if (!fromHistory && depth) { skipPop++; var n = depth; depth = 0; history.go(-n); }
      else depth = 0;
    }
    function push(app, id, instant) {
      var cur = currentPage(app), next = $('[data-page="' + id + '"]', app);
      if (!next) return;
      if (instant) { cur.style.transition = next.style.transition = 'none'; }
      cur.classList.remove('is-current'); cur.classList.add('is-behind');
      next.classList.remove('is-scrolled'); $('.ios-scroll', next).scrollTop = 0;
      next.classList.add('is-current');
      if (instant) requestAnimationFrame(function () { cur.style.transition = ''; next.style.transition = ''; });
      treeStart(next);
      if (!instant) {
        mark(app);
        var bk = $('.ios-back', next); if (bk) setTimeout(function () { bk.focus({ preventScroll: true }); }, 350);
      }
    }
    /* One level back. instant: the page is already where it should be (a finished swipe, or
       the browser's own swipe, which has animated it with its snapshot) */
    function popDom(app, instant) {
      var cur = currentPage(app), prev = $$('.ios-page.is-behind', app).pop();
      if (!prev) return false;
      if (instant) { cur.style.transition = prev.style.transition = 'none'; }
      cur.classList.remove('is-current'); prev.classList.remove('is-behind'); prev.classList.add('is-current');
      cur.style.transform = ''; prev.style.transform = '';
      if (instant) requestAnimationFrame(function () { cur.style.transition = ''; prev.style.transition = ''; });
      return true;
    }
    /* Back one level, whichever kind: a content level under Bölümler, then the page itself */
    function stepBack(app, instant) {
      var pg = currentPage(app);
      if (pg && pg._kq && !pg._kq.sheet.hidden) kqSheet(pg, false);
      if (pg && pg._tree && pg._tree.stack.length > 1) { treePop(pg, instant); return true; }
      return popDom(app, instant);
    }
    function back() {
      if (!openApp) return;
      if (depth) history.back();
      else if (!stepBack(openApp)) close();
    }
    window.addEventListener('popstate', function () {
      if (skipPop) { skipPop--; return; }
      if (!openApp) return;
      depth = Math.max(0, depth - 1);
      var nativeSwipe = Date.now() - edgeAt < 900;
      if (!stepBack(openApp, nativeSwipe)) close(true);
      /* a question's next / previous may have moved on to another section since this entry was
         made: record where the reader really is now */
      else { try { history.replaceState(stateOf(openApp), ''); } catch (e) { /* file:// */ } }
    });

    /* ----- Bölümler: the page's content, one level at a time. The page's icon, title,
       description and Sayfayı Aç stay put while the levels slide under the heading. */
    var L = LANG === 'en'
      ? { sections: 'Sections', loading: 'Loading…', failed: 'Could not load this. Please try again.', q: 'Question', swipe: 'Swipe for the next one', prev: 'Previous', next: 'Next', toc: 'Contents', done: 'Done' }
      : { sections: 'Bölümler', loading: 'Yükleniyor…', failed: 'Yüklenemedi. Lütfen tekrar deneyin.', q: 'Soru', swipe: 'Kaydırarak geçin', prev: 'Önceki', next: 'Sonraki', toc: 'İçindekiler', done: 'Bitti' };
    var chevR = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
    var openI = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-8.5 8.5"/><path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/></svg>';
    function escH(x) { return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function resolveNode(node) {
      if (!node.load) return Promise.resolve(node);
      if (!node._loading) node._loading = node.load().then(function (more) { for (var k in more) node[k] = more[k]; node.load = null; return node; });
      return node._loading;
    }
    function levelEl(node) {
      var el = document.createElement('div');
      el.className = 'tree-level';
      if (node.qn) { el.innerHTML = kqHtml(node); return el; }
      var html = node.html ? '<div class="tree-text">' + node.html + '</div>' : '';
      if (node.kids && node.kids.length) {
        var out = [], openG = false;
        node.kids.forEach(function (kid, i) {
          if (kid.group) {
            if (openG) out.push('</div>');
            out.push('<p class="ios-gh tree-gh">' + escH(plainT(kid.group)) + '</p>' + (kid.note ? '<div class="tree-text tree-gnote">' + kid.note + '</div>' : '') + '<div class="ios-group">');
            openG = true; return;
          }
          if (!openG) { out.push('<div class="ios-group">'); openG = true; }
          var inner = '<span class="ios-rt"><span class="ios-t">' + escH(plainT(kid.t)) + '</span>' + (kid.s ? '<span class="ios-s">' + escH(kid.s) + '</span>' : '') + '</span>';
          out.push(kid.go ? '<a class="ios-row" href="' + escH(kid.go) + '">' + inner + openI + '</a>'
                          : '<button type="button" class="ios-row" data-tree-k="' + i + '">' + inner + chevR + '</button>');
        });
        if (openG) out.push('</div>');
        html += out.join('');
      }
      el.innerHTML = html;
      return el;
    }

    /* ----- The Katekizm's questions: one at a time, with Previous / Next under the answer,
       a swipe left or right for the next or previous question, and a contents button at the
       bottom right (a slider over all 598, and the questions around this one) */
    var KQ_TOTAL = 598, KQ_STARTS = [1, 218, 357, 534];
    var chevL = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>';
    var listI = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.1" fill="currentColor" stroke="none"/></svg>';
    var checkI = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
    function kqHtml(q) {
      return '<div class="kq" data-qn="' + q.qn + '">' +
        '<p class="kq-count"><span>' + L.q + ' ' + q.qn + ' / ' + KQ_TOTAL + '</span><span class="kq-hint">' + L.swipe + '</span></p>' +
        '<h4 class="kq-q">' + escH(plainT(q.q)) + '</h4>' +
        '<div class="tree-text kq-a">' + q.html + '</div>' +
        '<div class="kq-pager">' +
          '<button type="button" class="kq-btn" data-kq="-1"' + (q.qn <= 1 ? ' disabled' : '') + '>' + chevL + '<span>' + L.prev + '</span></button>' +
          '<button type="button" class="kq-btn kq-next" data-kq="1"' + (q.qn >= KQ_TOTAL ? ' disabled' : '') + '><span>' + L.next + '</span>' + chevR + '</button>' +
        '</div></div>';
    }
    function navH(pg) { var n = $('.ios-nav', pg); return n ? n.offsetHeight : 0; }
    function kqPartOf(n) { var pi = 0; KQ_STARTS.forEach(function (st, i) { if (n >= st) pi = i; }); return pi; }
    function qIndex(pn) {
      if (pn._q) return pn._q;
      var m = {};
      (function walk(node, path) {
        (node.kids || []).forEach(function (kd, i) { if (kd.qn) m[kd.qn] = path.concat(i); else if (kd.kids) walk(kd, path.concat(i)); });
      })(pn, []);
      return (pn._q = m);
    }
    function kqTop(pg) { var t = pg._tree; return t && t.stack.length ? t.stack[t.stack.length - 1] : null; }
    function kqSwap(pg, lvl, q, dir) {
      var old = $('.kq', lvl), holder = document.createElement('div');
      holder.innerHTML = kqHtml(q);
      var nu = holder.firstChild;
      if (still || !old) { if (old) lvl.removeChild(old); lvl.appendChild(nu); }
      else {
        old.style.position = 'absolute'; old.style.top = '0'; old.style.left = '0'; old.style.right = '0';
        nu.style.transform = 'translateX(' + (dir > 0 ? 45 : -45) + '%)'; nu.style.opacity = '0';
        lvl.appendChild(nu);
        nu.getBoundingClientRect();
        old.style.transition = nu.style.transition = 'transform .32s cubic-bezier(.2,.8,.2,1), opacity .24s';
        old.style.transform = 'translateX(' + (dir > 0 ? -45 : 45) + '%)'; old.style.opacity = '0';
        nu.style.transform = ''; nu.style.opacity = '';
        setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); nu.style.transition = ''; }, 340);
      }
      var scroller = $('.ios-scroll', pg), head = $('[data-tree-head]', pg), limit = head.offsetTop - navH(pg) - 8;
      if (scroller.scrollTop > limit) scroller.scrollTop = limit;
    }
    /* Go to question n: load its part if need be, and set the levels under it (its section and
       chapter) to the ones it belongs to, so that back always leads to its own list */
    function kqGo(pg, n, dir) {
      var t = pg._tree;
      if (!t || t.busy || n < 1 || n > KQ_TOTAL) return Promise.resolve(false);
      var root = t.stack[0].node, pi = kqPartOf(n), pk = -1;
      root.kids.forEach(function (kd, i) { if (kd.part === pi) pk = i; });
      if (pk < 0) return Promise.resolve(false);
      t.busy = true;
      return resolveNode(root.kids[pk]).then(function (partNode) {
        var rel = qIndex(partNode)[n];
        if (!rel) throw 0;
        var path = [pk].concat(rel), nodes = [], cur = root;
        path.forEach(function (k) { cur = cur.kids[k]; nodes.push(cur); });
        var q = nodes[nodes.length - 1], top = kqTop(pg);
        var same = t.stack.length === nodes.length + 1 && nodes.slice(0, -1).every(function (nd, i) { return t.stack[i + 1].node === nd; });
        if (!same) {
          t.stack.slice(1, -1).forEach(function (l) { if (l.el.parentNode) l.el.parentNode.removeChild(l.el); });
          var mids = nodes.slice(0, -1).map(function (nd, i) {
            var el = levelEl(nd); el.classList.add('is-hidden'); t.box.insertBefore(el, top.el);
            return { node: nd, el: el, k: path[i] };
          });
          t.stack = [t.stack[0]].concat(mids, [top]);
        }
        top.node = q; top.k = path[path.length - 1];
        kqSwap(pg, top.el, q, dir);
        treeChrome(pg);
        try { history.replaceState(stateOf(openApp), ''); } catch (e) { /* file:// */ }
        t.busy = false;
        return true;
      })['catch'](function () { t.busy = false; return false; });
    }
    function kqTools(pg) {
      if (pg._kq) return pg._kq;
      var fab = document.createElement('button');
      fab.type = 'button'; fab.className = 'kq-fab'; fab.setAttribute('aria-label', L.toc); fab.setAttribute('aria-haspopup', 'dialog');
      fab.innerHTML = listI;
      var sh = document.createElement('div');
      sh.className = 'kq-sheet'; sh.hidden = true;
      sh.innerHTML = '<div class="kq-sheet-bg" data-kq-close></div>' +
        '<div class="kq-sheet-panel" role="dialog" aria-modal="true" aria-label="' + L.toc + '">' +
          '<div class="kq-grab" aria-hidden="true"></div>' +
          '<div class="kq-sheet-head"><p class="kq-sheet-t">' + L.toc + '</p><button type="button" class="ios-done" data-kq-close>' + L.done + '</button></div>' +
          '<div class="kq-slider"><p class="kq-slider-l"></p><input type="range" min="1" max="' + KQ_TOTAL + '" step="1" aria-label="' + L.q + '"><p class="kq-slider-q"></p></div>' +
          '<div class="kq-sheet-scroll"><p class="ios-gh kq-sheet-gh"></p><div class="ios-group kq-sheet-list"></div></div>' +
        '</div>';
      pg.appendChild(fab); pg.appendChild(sh);
      var range = $('input', sh), lab = $('.kq-slider-l', sh), prev = $('.kq-slider-q', sh);
      function lookup(n) {
        var root = pg._tree.stack[0].node, pi = kqPartOf(n), pn = null;
        root.kids.forEach(function (kd) { if (kd.part === pi && kd.kids) pn = kd; });
        if (!pn) return null;
        var rel = qIndex(pn)[n], cur = pn;
        if (!rel) return null;
        rel.forEach(function (k) { cur = cur.kids[k]; });
        return cur;
      }
      function label() {
        var n = +range.value, q = lookup(n);
        lab.textContent = L.q + ' ' + n + ' / ' + KQ_TOTAL;
        prev.textContent = q ? plainT(q.q) : '';
      }
      range.addEventListener('input', label);
      range.addEventListener('change', function () {
        var n = +range.value, cur = kqTop(pg).node.qn;
        kqSheet(pg, false);
        if (n !== cur) kqGo(pg, n, n > cur ? 1 : -1);
      });
      pg._kq = { fab: fab, sheet: sh, range: range, label: label };
      return pg._kq;
    }
    function kqSheet(pg, on) {
      var k = pg._kq; if (!k) return;
      if (!on) { k.sheet.classList.remove('is-open'); setTimeout(function () { if (!k.sheet.classList.contains('is-open')) k.sheet.hidden = true; }, 260); k.fab.focus({ preventScroll: true }); return; }
      var st = pg._tree.stack, q = st[st.length - 1].node, par = st[st.length - 2].node;
      k.range.value = q.qn; k.label();
      $('.kq-sheet-gh', k.sheet).textContent = plainT(par.t);
      $('.kq-sheet-list', k.sheet).innerHTML = par.kids.filter(function (kd) { return kd.qn; }).map(function (kd) {
        var here = kd.qn === q.qn;
        return '<button type="button" class="ios-row' + (here ? ' is-here' : '') + '" data-kq-go="' + kd.qn + '"' + (here ? ' aria-current="true"' : '') + '><span class="ios-rt"><span class="ios-t">' + escH(plainT(kd.t)) + '</span></span>' + (here ? checkI : '') + '</button>';
      }).join('');
      k.sheet.hidden = false;
      requestAnimationFrame(function () {
        k.sheet.classList.add('is-open');
        var sc = $('.kq-sheet-scroll', k.sheet), cur = $('.is-here', k.sheet);
        if (cur) sc.scrollTop = Math.max(0, cur.offsetTop - sc.clientHeight / 2 + cur.offsetHeight / 2);
      });
      setTimeout(function () { k.range.focus({ preventScroll: true }); }, 60);
    }
    function treeStart(pg) {
      var box = $('.ios-tree', pg);
      if (!box || pg._tree) return pg._tree && pg._tree.ready;
      var build = TREES[box.getAttribute('data-tree')];
      var t = pg._tree = { box: box, stack: [], title: box.getAttribute('data-title') };
      box.innerHTML = '<p class="tree-wait">' + L.loading + '</p>';
      t.ready = (build ? build() : Promise.reject()).then(function (kids) {
        var root = { t: t.title, kids: kids };
        var el = levelEl(root);
        box.innerHTML = ''; box.appendChild(el);
        t.stack = [{ node: root, el: el, k: -1 }];
        treeChrome(pg);
      })['catch'](function () { box.innerHTML = '<p class="tree-wait">' + L.failed + '</p>'; pg._tree = null; });
      return t.ready;
    }
    function treeReset(pg) {
      var t = pg._tree; if (!t || !t.stack.length) return;
      t.stack.slice(1).forEach(function (l) { if (l.el.parentNode) l.el.parentNode.removeChild(l.el); });
      t.stack.length = 1;
      var el = t.stack[0].el; el.className = 'tree-level'; el.style.transform = el.style.transition = '';
      treeChrome(pg);
    }
    /* The heading above the levels, the back button and the centre title, and Sayfayı Aç:
       it opens the page at the deepest section that has its own place on the page */
    function treeChrome(pg) {
      var t = pg._tree, st = t.stack, top = st[st.length - 1];
      var head = $('[data-tree-head]', pg), backL = $('[data-back-label]', pg), nt = $('.ios-nt', pg), openA = $('[data-open-page]', pg);
      if (!pg._base) pg._base = { back: backL.textContent, href: openA.getAttribute('href'), page: t.box.getAttribute('data-tree') };
      var reader = !!top.node.qn;
      head.textContent = plainT(reader ? st[st.length - 2].node.t : st.length > 1 ? top.node.t : L.sections);
      backL.textContent = plainT(st.length > 2 ? st[st.length - 2].node.t : st.length > 1 ? t.title : pg._base.back);
      nt.textContent = plainT(reader ? L.q + ' ' + top.node.qn : st.length > 1 ? top.node.t : t.title);
      /* the Katekizm keeps the current section's title in its bar once past the first level */
      pg.classList.toggle('is-deep', t.box.getAttribute('data-tree') === 'katesizm.html' && st.length > 1);
      pg.classList.toggle('has-reader', reader);
      if (reader) kqTools(pg);
      var page = null, anchor = '';
      st.slice(1).forEach(function (l) { if (l.node.page) { page = l.node.page; anchor = ''; } if (l.node.u) anchor = l.node.u; });
      openA.setAttribute('href', (page ? pageUrl(page) : pg._base.href) + (anchor ? '#' + anchor : ''));
    }
    function slide(inEl, outEl, forward, instant, done) {
      var dur = instant || still ? 0 : 450;
      outEl.classList.add('is-leaving');
      inEl.style.transition = outEl.style.transition = 'none';
      /* the level that goes underneath fades as it goes: the levels have no background of
         their own (the wallpaper shows through), so the two must not show through each other */
      var under = forward ? outEl : inEl;
      inEl.style.transform = forward ? 'translateX(100%)' : 'translateX(-28%)';
      outEl.style.transform = 'translateX(0)';
      under.style.opacity = forward ? '1' : '0';
      inEl.getBoundingClientRect();
      if (dur) inEl.style.transition = outEl.style.transition = 'transform .45s cubic-bezier(.32,.72,0,1), opacity .3s';
      inEl.style.transform = 'translateX(0)';
      outEl.style.transform = forward ? 'translateX(-28%)' : 'translateX(100%)';
      under.style.opacity = forward ? '0' : '1';
      setTimeout(function () {
        outEl.classList.remove('is-leaving');
        inEl.style.transition = outEl.style.transition = ''; inEl.style.transform = ''; under.style.opacity = '';
        done();
      }, dur);
    }
    function treePush(pg, k, instant) {
      var t = pg._tree, top = t.stack[t.stack.length - 1], node = top.node.kids[k];
      if (!node || t.busy) return Promise.resolve();
      t.busy = true;
      var scroller = $('.ios-scroll', pg);
      top.scroll = scroller.scrollTop;
      return resolveNode(node).then(function () {
        var el = levelEl(node);
        t.box.appendChild(el);
        t.stack.push({ node: node, el: el, k: k });
        var head = $('[data-tree-head]', pg), limit = head.offsetTop - navH(pg) - 8;
        if (scroller.scrollTop > limit) scroller.scrollTop = limit;
        treeChrome(pg);
        if (!instant) mark(openApp);
        return new Promise(function (res) {
          slide(el, top.el, true, instant, function () { top.el.classList.add('is-hidden'); t.busy = false; res(); });
        });
      }, function () { t.busy = false; });
    }
    function treePop(pg, instant) {
      var t = pg._tree; if (t.stack.length < 2) return;
      var top = t.stack.pop(), prev = t.stack[t.stack.length - 1];
      prev.el.classList.remove('is-hidden');
      treeChrome(pg);
      slide(prev.el, top.el, false, instant, function () { if (top.el.parentNode) top.el.parentNode.removeChild(top.el); });
      $('.ios-scroll', pg).scrollTop = prev.scroll || 0;
    }

    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target : e.target.parentNode;
      var o = t.closest('[data-app-open]'); if (o) { open(o); return; }
      if (!openApp) return;
      if (t.closest('[data-app-close]')) { close(); return; }
      var kb = t.closest('[data-kq]');
      if (kb) { var pk2 = kb.closest('.ios-page'), d = +kb.getAttribute('data-kq'); kqGo(pk2, kqTop(pk2).node.qn + d, d); return; }
      if (t.closest('.kq-fab')) { kqSheet(t.closest('.ios-page'), true); return; }
      if (t.closest('[data-kq-close]')) { kqSheet(t.closest('.ios-page'), false); return; }
      var kg = t.closest('[data-kq-go]');
      if (kg) { var pk3 = kg.closest('.ios-page'), n3 = +kg.getAttribute('data-kq-go'), c3 = kqTop(pk3).node.qn; kqSheet(pk3, false); if (n3 !== c3) kqGo(pk3, n3, n3 > c3 ? 1 : -1); return; }
      var tk = t.closest('[data-tree-k]');
      if (tk) { var pg = tk.closest('.ios-page'); if (pg._tree) treePush(pg, +tk.getAttribute('data-tree-k')); return; }
      var ps = t.closest('[data-push]'); if (ps) { push(openApp, ps.getAttribute('data-push')); return; }
      if (t.closest('[data-pop]')) back();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !openApp) return;
      var sh = $('.ios-page.is-current .kq-sheet.is-open', openApp);
      if (sh) kqSheet(sh.closest('.ios-page'), false); else back();
    });
    $$('.ios-scroll').forEach(function (sc) {
      sc.addEventListener('scroll', function () { sc.parentNode.classList.toggle('is-scrolled', sc.scrollTop > 40); }, { passive: true });
    });
    /* Swipe in from the left edge: what is on top (a content level, or else the page) follows
       the finger and what is under it slides back into place; let go past a third of the way,
       or with a flick, to go back */
    $$('.ios-app').forEach(function (app) {
      var x0 = null, y0 = 0, t0 = 0, dx = 0, live = false, cur = null, prev = null, w = 1, isTree = false, pg = null;
      function reset() {
        if (cur) { cur.style.transition = ''; cur.style.transform = ''; }
        if (prev) { prev.style.transition = ''; prev.style.transform = ''; prev.style.filter = ''; prev.style.opacity = ''; if (isTree) prev.classList.add('is-hidden'); prev.classList.remove('is-leaving'); }
      }
      app.addEventListener('touchstart', function (e) {
        var t = e.touches[0];
        if (t.clientX < 40) edgeAt = Date.now();
        x0 = null;
        if (t.clientX >= 40) return;
        pg = currentPage(app);
        var tr = pg && pg._tree;
        isTree = !!(tr && tr.stack.length > 1 && !tr.busy);
        if (isTree) { cur = tr.stack[tr.stack.length - 1].el; prev = tr.stack[tr.stack.length - 2].el; }
        else { cur = pg; prev = $$('.ios-page.is-behind', app).pop(); }
        if (!prev) return;
        x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); dx = 0; live = false; w = app.clientWidth;
      }, { passive: true });
      function stillOnTop() { return isTree ? (pg._tree && pg._tree.stack.length > 1 && pg._tree.stack[pg._tree.stack.length - 1].el === cur) : cur.classList.contains('is-current'); }
      app.addEventListener('touchmove', function (e) {
        if (x0 === null) return;
        /* the browser's own back swipe got there first (see popstate): leave it to that */
        if (!stillOnTop()) { x0 = null; reset(); return; }
        var t = e.touches[0], mx = t.clientX - x0, my = t.clientY - y0;
        if (!live) {
          if (Math.abs(my) > 12 && Math.abs(my) > Math.abs(mx)) { x0 = null; return; }
          if (mx < 8) return;
          live = true;
          if (isTree) { prev.classList.remove('is-hidden'); prev.classList.add('is-leaving'); }
        }
        dx = Math.max(0, mx);
        var f = dx / w;
        cur.style.transition = prev.style.transition = 'none';
        cur.style.transform = 'translateX(' + dx + 'px)';
        prev.style.transform = 'translateX(' + (-28 + 28 * f) + '%)';
        if (isTree) prev.style.opacity = String(f);
        if (!isTree) prev.style.filter = 'brightness(' + (0.94 + 0.06 * f) + ')';
      }, { passive: true });
      function end() {
        if (x0 === null || !live) { x0 = null; return; }
        x0 = null;
        if (!stillOnTop()) { reset(); return; }
        var fast = dx / Math.max(1, Date.now() - t0) > 0.5;
        var go = dx > w * 0.33 || (fast && dx > 30);
        cur.style.transition = prev.style.transition = 'transform .3s cubic-bezier(.2,.8,.2,1), filter .3s, opacity .3s';
        cur.style.transform = go ? 'translateX(100%)' : 'translateX(0)';
        prev.style.transform = go ? 'translateX(0)' : 'translateX(-28%)';
        if (isTree) prev.style.opacity = go ? '1' : '0';
        if (!isTree) prev.style.filter = go ? 'brightness(1)' : 'brightness(.94)';
        var c = cur, p = prev, tree = isTree, page = pg;
        setTimeout(function () {
          /* only if the browser's own back hasn't already taken this level off meanwhile */
          var onTop = tree ? (page._tree && page._tree.stack[page._tree.stack.length - 1].el === c) : c.classList.contains('is-current');
          if (go && onTop) {
            if (tree) treePop(page, true); else popDom(app, true);
            if (depth) { skipPop++; depth--; history.back(); }
          } else if (tree) { p.classList.add('is-hidden'); }
          p.classList.remove('is-leaving');
          c.style.transform = ''; p.style.transform = ''; p.style.filter = ''; p.style.opacity = '';
          requestAnimationFrame(function () { c.style.transition = ''; p.style.transition = ''; });
        }, 300);
      }
      app.addEventListener('touchend', end);
      app.addEventListener('touchcancel', function () { x0 = null; reset(); });
    });
    /* A swipe across a question (not from the edge, which is back): left for the next one,
       right for the one before; the question follows the finger a little on the way */
    $$('.ios-app').forEach(function (app) {
      var rs = null;
      app.addEventListener('touchstart', function (e) {
        rs = null;
        var t = e.touches[0];
        if (t.clientX < 40 || e.touches.length > 1) return;
        var kq = e.target.closest && e.target.closest('.kq'), lvl = kq && kq.closest('.tree-level');
        if (!lvl || lvl.classList.contains('is-hidden') || lvl.classList.contains('is-leaving')) return;
        rs = { x: t.clientX, y: t.clientY, kq: kq, live: false, dx: 0, t0: Date.now() };
      }, { passive: true });
      app.addEventListener('touchmove', function (e) {
        if (!rs) return;
        var t = e.touches[0], dx = t.clientX - rs.x, dy = t.clientY - rs.y;
        if (!rs.live) {
          if (Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) { rs = null; return; }
          if (Math.abs(dx) < 12) return;
          rs.live = true;
        }
        rs.dx = dx;
        rs.kq.style.transition = 'none';
        rs.kq.style.transform = 'translateX(' + dx * 0.5 + 'px)';
        rs.kq.style.opacity = String(1 - Math.min(0.4, Math.abs(dx) / 800));
      }, { passive: true });
      function done() {
        var r0 = rs; rs = null;
        if (!r0 || !r0.live) return;
        var pg = r0.kq.closest('.ios-page'), top = kqTop(pg), n = top && top.node.qn, dir = r0.dx < 0 ? 1 : -1;
        var fast = Math.abs(r0.dx) / Math.max(1, Date.now() - r0.t0) > 0.45;
        if (n && (Math.abs(r0.dx) > 70 || (fast && Math.abs(r0.dx) > 30)) && n + dir >= 1 && n + dir <= KQ_TOTAL) {
          kqGo(pg, n + dir, dir).then(function (ok) { if (!ok) snap(r0.kq); });
        } else snap(r0.kq);
      }
      function snap(kq) { kq.style.transition = 'transform .25s, opacity .25s'; kq.style.transform = ''; kq.style.opacity = ''; }
      app.addEventListener('touchend', done);
      app.addEventListener('touchcancel', function () { if (rs && rs.live) snap(rs.kq); rs = null; });
    });

    /* Back on this page from a page opened inside an app, when the browser reloaded it rather
       than keeping it in memory: the history entry says which app, page and content level */
    var st = history.state;
    if (st && st.homeApp) {
      var btn = $('[data-app-open="' + st.homeApp + '"]');
      if (btn && st.homeApp !== 'ara') {
        open(btn, true);
        var app0 = openApp;
        depth = 1;
        if (st.page && st.page !== 'root' && $('[data-page="' + st.page + '"]', app0)) {
          push(app0, st.page, true); depth = 2;
          var pg0 = currentPage(app0), path = st.tree || [];
          (treeStart(pg0) || Promise.resolve()).then(function () {
            return path.reduce(function (pr, k) { return pr.then(function () { return treePush(pg0, k, true).then(function () { depth++; }); }); }, Promise.resolve());
          });
        }
      } else { try { history.replaceState(null, ''); } catch (e) { /* file:// */ } }
    }
  }

  /* ---------------------------------------------------------------
     The home screen apps' content trees: for each page, its sections,
     their parts and the text itself, from the site's data files (loaded
     only once a page is opened). A node: t title, s a subtitle, u its
     anchor on the page, page another page it lives on, go a link to
     follow instead, html its text, kids the next level, load a promise
     for the rest of the node.
     --------------------------------------------------------------- */
  var PAGE_MAP = null;
  /* [[Türkçe|English]]: a term with its English original, as on the pages; as plain text in
     titles and rows */
  var GLOSS = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;
  function plainT(x) { return String(x == null ? '' : x).replace(GLOSS, '$1 ($2)').replace(/<[^>]+>/g, ''); }
  function pageUrl(f) { return ROOT + (LANG === 'en' ? ((PAGE_MAP && PAGE_MAP[f]) || f) : f); }
  function homeTrees(home) {
    try { PAGE_MAP = JSON.parse(home.getAttribute('data-pages') || 'null'); } catch (e) { PAGE_MAP = null; }
    var EN = LANG === 'en';
    function tx(o, k) { return EN && o[k + 'En'] != null ? o[k + 'En'] : o[k]; }
    function esc(x) { return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function inl(x) {
      return String(x == null ? '' : x).replace(GLOSS, '$1<span class="gloss" lang="en"> ($2)</span>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        .replace(/\n/g, '<br>');
    }
    function P(x) { return x ? '<p>' + inl(x) + '</p>' : ''; }
    function paras(x) { return x ? String(x).split(/\n\s*\n/).map(P).join('') : ''; }
    function note(x) { return x ? '<p class="tree-note">' + inl(x) + '</p>' : ''; }
    function list(items, ordered) { var tag = ordered ? 'ol' : 'ul'; return '<' + tag + '>' + items.map(function (i) { return '<li>' + inl(i) + '</li>'; }).join('') + '</' + tag + '>'; }
    function data(src, name) { return loadDataScript(src, name).then(function () { return window[name]; }); }
    function part(i) {
      return new Promise(function (resolve, reject) {
        var have = function () { return window.COMPENDIUM && window.COMPENDIUM.parts && window.COMPENDIUM.parts[i]; };
        if (have()) return resolve(have());
        var sc = document.createElement('script');
        sc.src = dataUrl('data/compendium-' + (i + 1) + '.js');
        sc.onload = function () { have() ? resolve(have()) : reject(); }; sc.onerror = reject;
        document.head.appendChild(sc);
      });
    }
    var T = function (tr, en) { return EN ? en : tr; };
    var ccc = T('KKK ', 'CCC ');
    function partTree(pt) {
      var root = { kids: [] }, stack = [{ level: 1, node: root }];
      pt.items.forEach(function (it) {
        var top = stack[stack.length - 1].node;
        if (it.type === 'heading') {
          var lv = +it.level; if (lv < 2) return;
          /* the smaller headings head groups of rows within their section, as in Settings,
             rather than adding another level to tap through */
          if (lv >= 4) { if (top !== root) top.kids.push({ group: EN ? it.en : it.tr, u: it.id }); return; }
          while (stack.length > 1 && stack[stack.length - 1].level >= lv) stack.pop();
          var n = { t: EN ? it.en : it.tr, u: it.id, kids: [] };
          stack[stack.length - 1].node.kids.push(n);
          stack.push({ level: lv, node: n });
        } else if (it.type === 'qa') {
          var qa = EN ? it.en : it.tr;
          top.kids.push({ t: it.n + '. ' + qa.q, qn: +it.n, q: qa.q, u: it.id, html: paras(qa.a) + (it.ccc ? note(ccc + it.ccc) : '') });
        } else if (it.type === 'quote' && top !== root) {
          var last = top.kids[top.kids.length - 1];
          if (last && last.group) last.note = (last.note || '') + P(EN ? it.en : it.tr);
          else top.html = (top.html || '') + P(EN ? it.en : it.tr);
        }
      });
      return root.kids;
    }
    function prayer(pr) { var x = EN ? pr.en : pr.tr; return { t: x.title, u: pr.id, html: P(x.text) }; }
    function formula(fm) { var x = EN ? fm.en : fm.tr; return { t: x.title, u: fm.id, html: list(x.items) }; }
    function prayersAndFormulas(X) {
      return X.appendix.prayers.map(prayer).concat([{ t: T('Katolik Öğretinin Formülleri', 'Formulas of Catholic Doctrine'), u: 'ek-b', kids: X.appendix.formulas.map(formula) }]);
    }
    var MONTHS = EN ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                    : ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    function dayDate(d) { return EN ? MONTHS[d.m - 1] + ' ' + d.d : d.d + ' ' + MONTHS[d.m - 1]; }
    function dayHtml(S, d) {
      if (!d.saints || !d.saints.length) return P(tx(S, 'genelTitle')) + paras(tx(S, 'genelBio'));
      return (d.rank ? note(EN && d.rankEn ? d.rankEn : d.rank) : '') + d.saints.map(function (sn) {
        return '<p><strong>' + inl(tx(sn, 'name')) + '</strong>' + (tx(sn, 'title') ? ' · ' + inl(tx(sn, 'title')) : '') + '</p>' + paras(tx(sn, 'bio'));
      }).join('');
    }
    return {
      'neden-katoligiz.html': function () {
        return data('data/neden-katoligiz.js', 'WHY_CATHOLIC').then(function (W) {
          var ask = T('Bir şüpheci sorabilir:', 'A skeptic might ask:');
          return W.parts.map(function (pt) {
            return { t: EN ? pt.en : pt.title, u: pt.id, html: P(tx(pt, 'thesis')), kids: pt.topics.map(function (tp) {
              return { t: EN ? tp.en : tp.title, u: tp.id, html: '<p><strong>' + inl(tx(tp, 'q')) + '</strong></p>' + P(tx(tp, 'lede')) +
                tx(tp, 'points').map(P).join('') + '<p><strong>' + ask + '</strong> ' + inl(tx(tp, 'objection')) + '</p>' + P(tx(tp, 'reply')) };
            }) };
          }).concat([{ t: T('Hepsi bir arada', 'Putting it together'), u: 'sonuc', html: list(tx(W, 'chain'), true) + P(tx(W, 'closing')) }]);
        });
      },
      'katesizm.html': function () {
        var X = function () { return data('data/extras.js', 'COMPENDIUM_EXTRAS'); };
        function letter(k) { return function () { return X().then(function (x) { var d = EN ? x[k].en : x[k].tr; return { html: (d.address ? P(d.address) : '') + d.paragraphs.map(P).join('') + (d.closing || []).map(P).join('') }; }); }; }
        var names = EN ? ['I. The Profession of Faith', 'II. The Celebration of the Christian Mystery', 'III. Life in Christ', 'IV. Christian Prayer']
                       : ['I. İnanç Beyanı', 'II. Hristiyan Gizeminin Kutlanması', 'III. Mesih’te Yaşam', 'IV. Hristiyan Duası'];
        var ranges = EN ? ['Questions 1–217', 'Questions 218–356', 'Questions 357–533', 'Questions 534–598'] : ['Sorular 1–217', 'Sorular 218–356', 'Sorular 357–533', 'Sorular 534–598'];
        return Promise.resolve([
          { t: 'Motu Proprio', s: T('XVI. Benediktus, 2005', 'Benedict XVI, 2005'), page: 'motu-proprio.html', load: letter('motuProprio') },
          { t: T('Giriş', 'Introduction'), s: T('Kardinal Ratzinger, 2005', 'Cardinal Ratzinger, 2005'), page: 'giris.html', load: letter('introduction') }
        ].concat(names.map(function (nm, i) {
          return { t: nm, s: ranges[i], page: PAGES[i], part: i, load: function () { return part(i).then(function (pt) { return { kids: partTree(pt) }; }); } };
        })).concat([{ t: T('Ekler', 'Appendix'), s: T('Dualar ve formüller', 'Prayers and formulas'), page: 'ekler.html', load: function () { return X().then(function (x) { return { kids: prayersAndFormulas(x) }; }); } }]));
      },
      'kutsal-kitap.html': function () {
        return fetch(pageUrl('kutsal-kitap.html')).then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (h) {
          var doc = new DOMParser().parseFromString(h, 'text/html'), out = [], cur = null;
          var prose = doc.querySelector('main .prose') || doc.querySelector('main');
          Array.prototype.forEach.call(prose.children, function (el) {
            if (el.tagName === 'H2') { cur = { t: el.textContent.trim(), u: el.id, html: '' }; out.push(cur); return; }
            if (!cur || !/^(P|UL|OL)$/.test(el.tagName)) return;
            var c = el.cloneNode(true);
            Array.prototype.forEach.call(c.querySelectorAll('[class]'), function (x) { x.removeAttribute('class'); });
            c.removeAttribute('class');
            cur.html += c.outerHTML;
          });
          return out;
        });
      },
      'sss.html': function () {
        return data('data/sss.js', 'COMPENDIUM_FAQ').then(function (F) {
          return F.categories.map(function (c) {
            return { t: EN ? c.en : c.title, u: c.id, kids: c.items.map(function (it) { return { t: tx(it, 'q'), u: it.id, html: paras(tx(it, 'a')) + (it.ccc ? note(ccc + it.ccc) : '') }; }) };
          });
        });
      },
      'katolik-sureci.html': function () {
        return data('data/katolik-sureci.js', 'COMPENDIUM_SURECI').then(function (S) {
          function box(o, u) { return { t: tx(o, 'title'), u: u, html: paras(tx(o, 'body')) }; }
          return [
            { t: T('İki Yol', 'Two Paths'), u: 'iki-yol', kids: S.paths.map(function (p) { return { t: tx(p, 'title'), html: paras(tx(p, 'text')) }; }) },
            { t: T('Süreç Adım Adım', 'The Process, Step by Step'), u: 'surec', html: P(tx(S, 'processIntro')), kids: S.steps.map(function (st, i) { return { t: (i + 1) + '. ' + (EN ? st.en : st.title), html: paras(tx(st, 'text')) }; }) },
            box(S.already, 'zaten-hristiyan'), box(S.conditional, 'sartli-vaftiz'), box(S.waiting, 'beklerken'),
            { t: T('Pratik Sorular', 'Practical Questions'), u: 'pratik-sorular', kids: S.faq.map(function (f) { return { t: tx(f, 'q'), u: f.id, html: paras(tx(f, 'a')) }; }) }
          ];
        });
      },
      'meseller.html': function () {
        return data('data/meseller.js', 'PARABLES').then(function (M) {
          return M.categories.map(function (c) {
            return { t: EN ? c.en : c.title, u: c.id, html: P(tx(c, 'lead')), kids: c.items.map(function (it) { return { t: tx(it, 'name'), u: it.id, html: note(tx(it, 'ref')) + paras(tx(it, 'bio')) }; }) };
          });
        });
      },
      'kutsal-ayin.html': function () {
        return data('data/kutsal-ayin.js', 'MASS').then(function (M) {
          var roles = EN ? M.roleLabelsEn : M.roleLabels;
          return M.parts.map(function (pt) {
            return { t: (EN ? pt.en : pt.title), u: pt.id, html: P(tx(pt, 'lead')) + pt.lines.map(function (ln) {
              var who = roles[ln.role];
              return '<p' + (ln.role === 'N' ? ' class="tree-note"' : '') + '>' + (who ? '<strong>' + esc(who) + ':</strong> ' : '') + inl(EN ? ln.en : ln.tr) + '</p>';
            }).join('') };
          });
        });
      },
      'tesbih-duasi.html': function () {
        return data('data/tespih.js', 'COMPENDIUM_ROSARY').then(function (R) {
          return [
            { t: T('Tesbih nasıl dua edilir?', 'How to Pray the Rosary'), u: 'nasil', html: list(R.steps.map(function (st) { return EN ? st.en : st.tr; }), true) },
            { t: T('Gizemler', 'The Mysteries'), u: 'gizemler', kids: R.sets.map(function (set) {
              return { t: EN ? set.en : set.tr, s: EN ? set.dayEn : set.dayTr, u: 'gizem-' + set.id, html: list(set.items.map(function (it) { return EN ? it.en : it.tr; }), true) };
            }) },
            { t: T('Adım Adım Tesbih', 'Pray the Rosary, Bead by Bead'), go: pageUrl('tesbih-duasi.html') + '#tesbih-rehberi' },
            { t: T('Dualar', 'Prayers'), kids: R.prayers.map(function (pr) { var x = EN ? pr.en : pr.tr; return { t: x.title, html: P(x.text) }; }) }
          ];
        });
      },
      'ekler.html': function () {
        return data('data/extras.js', 'COMPENDIUM_EXTRAS').then(prayersAndFormulas);
      },
      'gunah-cikarma.html': function () {
        return data('data/gunah-cikarma.js', 'CONFESSION').then(function (C) {
          var sm = C.sealMartyrs;
          return [
            { t: T('Nasıl İşler? Adım Adım', 'How It Works, Step by Step'), u: 'adim-adim', kids: C.steps.map(function (st, i) { return { t: (i + 1) + '. ' + (EN ? st.en : st.title), html: paras(tx(st, 'text')) }; }) },
            { t: T('Vicdan Muhasebesi', 'Examination of Conscience'), u: 'vicdan-muhasebesi', html: P(tx(C, 'examenIntro')), kids: C.examenGroups.map(function (g) { return { t: tx(g, 'title'), html: list(EN ? g.itemsEn : g.items) }; }) },
            { t: T('Sık Sorulan Sorular ve Korkular', 'Frequently Asked Questions and Fears'), u: 'sorular-ve-korkular', kids: C.faq.map(function (f) { return { t: tx(f, 'q'), u: f.id, html: paras(tx(f, 'a')) }; }) },
            { t: tx(sm, 'title'), u: 'muhur-sehitleri', html: P(tx(sm, 'intro')) + (EN ? sm.itemsEn : sm.items).map(function (m) { return '<p><strong>' + inl(m.name) + '</strong> ' + inl(m.detail) + '</p>'; }).join('') }
          ];
        });
      },
      'azizler.html': function () {
        var S = function () { return data('data/azizler.js', 'SAINTS'); };
        var now = new Date();
        return Promise.resolve([
          { t: T('Bugünün Azizi', 'Saint of the Day'), s: dayDate({ m: now.getMonth() + 1, d: now.getDate() }), u: 'bugun-azizi', load: function () {
            return S().then(function (sa) { var d = sa.days.filter(function (x) { return x.m === now.getMonth() + 1 && x.d === now.getDate(); })[0]; return { html: d ? dayHtml(sa, d) : '' }; });
          } },
          { t: T('Takvim', 'Calendar'), u: 'takvim', load: function () {
            return S().then(function (sa) {
              return { kids: MONTHS.map(function (mn, mi) {
                return { t: mn, u: 'ay-' + (mi + 1), kids: sa.days.filter(function (x) { return x.m === mi + 1; }).map(function (d) {
                  return { t: dayDate(d), s: (d.saints || []).map(function (sn) { return tx(sn, 'name'); }).join(', '), html: dayHtml(sa, d) };
                }) };
              }) };
            });
          } },
          { t: T('En Çok Bilinen 20 Aziz', "20 of the Church's Best-Known Saints"), u: EN ? 'best-known-saints' : 'buyuk-azizler', load: function () {
            return data('data/buyuk-azizler.js', 'BUYUK_AZIZLER').then(function (B) {
              return { kids: B.saints.map(function (sn) {
                return { t: EN ? sn.en : sn.name, s: tx(sn, 'epithet'), page: sn.id + '.html', html: note(tx(sn, 'era')) + P(tx(sn, 'summary')) + paras(tx(sn, 'body')) };
              }) };
            });
          } },
          { t: T('Yıla Göre Değişen Bayramlar', 'Feasts That Move With the Year'), u: 'hareketli-bayramlar', load: function () {
            return S().then(function (sa) { return { kids: sa.movable.map(function (f) { return { t: tx(f, 'title'), s: tx(f, 'rank'), html: paras(tx(f, 'bio')) }; }) }; });
          } }
        ]);
      },
      'mucizeler.html': function () {
        return data('data/mucizeler.js', 'MIRACLES').then(function (M) {
          return M.categories.map(function (c) {
            return { t: EN ? c.en : c.title, u: c.id, html: P(tx(c, 'lead')), kids: c.items.map(function (it) { return { t: tx(it, 'name'), u: it.id, html: note(tx(it, 'place')) + paras(tx(it, 'bio')) }; }) };
          });
        });
      },
      'topraklarimizda-hristiyanlik.html': function () {
        return data('data/topraklarimizda-hristiyanlik.js', 'ANATOLIA').then(function (A) {
          return A.sections.map(function (sc) { return { t: EN ? sc.en : sc.title, u: sc.id, html: paras(tx(sc, 'body')) }; })
            .concat([{ t: T('Anadolu’daki Kökler Haritası', 'Map of Our Anatolian Roots'), go: pageUrl('topraklarimizda-hristiyanlik.html') + '#amap-h' }]);
        });
      },
      'kiliseler.html': function () {
        return data('data/kiliseler.js', 'CHURCHES').then(function (C) {
          var rites = {}; C.rites.forEach(function (r) { rites[r.id] = EN ? r.en : r.tr; });
          var hoursL = T('Ayin saatleri:', 'Mass times:'), siteL = T('Resmi site', 'Official website'), closedL = T('Şu anda kapalı.', 'Currently closed.');
          return C.cities.map(function (city) {
            return { t: city.name, s: city.churches.length + ' ' + T('kilise', city.churches.length === 1 ? 'church' : 'churches'), u: city.id, kids: city.churches.map(function (ch) {
              return { t: tx(ch, 'name'), s: rites[ch.rite], html: (ch.inactive ? '<p><strong>' + closedL + '</strong> ' + inl(tx(ch, 'inactiveNote')) + '</p>' : '') +
                P(rites[ch.rite] + ' · ' + ch.district + ', ' + city.name) + P(ch.address) + (ch.phone ? P(ch.phone) : '') +
                '<p><strong>' + hoursL + '</strong> ' + inl(tx(ch, 'hours')) + '</p>' + (ch.website ? '<p><a href="' + esc(ch.website) + '" target="_blank" rel="noopener">' + siteL + '</a></p>' : '') };
            }) };
          }).concat([{ t: T('Yakınımda Katolik kilisesi yoksa', 'If there is no Catholic church near me'), u: EN ? 'no-catholic-church-nearby' : 'katolik-bulunamadiginda', html: paras(tx(C, 'orthodoxNote')) }]);
        });
      }
    };
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
    /* Mobile tab bar: a button per rite, and "Şehirler" for the city drawer */
    var riteBtns = $$('.tabbar [data-tb-rite]'), citiesBtn = $('.tabbar .tb-more');
    function markBar(rite) {
      riteBtns.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-tb-rite') === rite); });
      if (citiesBtn) citiesBtn.classList.toggle('is-active', !rite);
    }

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
      select.value = rite;
      markBar(rite === 'all' ? null : rite);
    }

    function goToCity(id) {
      applyRite('all', false); // a fresh city view shows everything in it, regardless of any prior rite filter
      select.value = 'all';
      showOnlyCity(id);
      var sec = document.getElementById(id);
      if (sec) sec.open = true;
      markCurrentCity(id);
      markBar(null);
    }

    $$('[data-tb-rite]').forEach(function (b) {
      b.addEventListener('click', function () {
        applyRite(b.getAttribute('data-tb-rite'), true);
        var first = cities.filter(function (sec) { return !sec.hidden; })[0];
        if (first) {
          var top = first.getBoundingClientRect().top + window.pageYOffset -
            (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64) - 12;
          window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
        }
      });
    });
    select.addEventListener('change', function () { applyRite(select.value, select.value === 'all'); });
    cityLinks.forEach(function (a) { a.addEventListener('click', function () { goToCity(a.getAttribute('data-city-link')); }); });

    showOnlyCity('istanbul');
    markCurrentCity('istanbul');
    markBar(null);
    /* Arriving at a city or a church (from the home screen's Kilise Bul, say): open that city */
    var hashEl = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    var hashCity = hashEl && (hashEl.classList.contains('church-city') ? hashEl : hashEl.closest && hashEl.closest('.church-city'));
    if (hashCity) { goToCity(hashCity.id); requestAnimationFrame(function () { hashEl.scrollIntoView(); }); }
  }

  /* ---------------------------------------------------------------
     Neden Katoliğiz? / Why We're Catholic: one step of the five on
     screen at a time. The stepper links and the Previous / Next links
     under each step switch panels; the closing summary shows with the
     last step. A link to a step or to a single topic card (#ince-ayar,
     say) opens the step that holds it. Without JavaScript nothing is
     hidden and every link is a plain in-page anchor.
     --------------------------------------------------------------- */
  function initWhySteps() {
    var wrap = $('.why-wrap');
    if (!wrap) return;
    var tabs = $$('[data-why-tab]', wrap), steps = $$('.why-step', wrap), end = $('.why-end', wrap);
    var navBox = $('.why-tabs', wrap), last = steps[steps.length - 1];
    var smooth = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    function stepFor(id) {
      var el = id && document.getElementById(id);
      if (!el || !wrap.contains(el)) return null;
      if (el === end) return last;
      return el.closest('.why-step');
    }
    function show(step) {
      var k = steps.indexOf(step);
      steps.forEach(function (s) { s.classList.toggle('is-active', s === step); });
      if (end) end.classList.toggle('is-active', step === last);
      tabs.forEach(function (t, i) {
        if (i === k) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current');
        t.classList.toggle('is-done', i < k);
      });
      var cur = tabs[k], list = cur && cur.closest('ol');
      if (list && list.scrollWidth > list.clientWidth) list.scrollTo({ left: Math.max(0, cur.offsetLeft - 16), behavior: smooth ? 'smooth' : 'auto' });
      document.dispatchEvent(new Event('why:step'));
    }
    function go(id, focus) {
      var step = stepFor(id); if (!step) return false;
      show(step);
      /* Scroll so the step (or the linked card) starts just below the pinned stepper. Measure the
         step itself, never the stepper: once pinned, the stepper's own position is where it is
         stuck on screen, not where it sits in the page, and scrolling to it would go nowhere. */
      var target = document.getElementById(id);
      var top = target.getBoundingClientRect().top + window.pageYOffset;
      var pinned = navBox && getComputedStyle(navBox).position === 'sticky' && navBox.offsetParent;
      var offset = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64) +
        (pinned ? navBox.offsetHeight + 8 : 0) + 16;
      window.scrollTo({ top: Math.max(0, top - offset), behavior: smooth ? 'smooth' : 'auto' });
      if (focus) { var h = step.querySelector('h2'); if (id === 'sonuc' && end) h = end.querySelector('h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
      return true;
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-why-tab], [data-why-go]');
      if (!a) return;
      var id = a.getAttribute('data-why-tab') || a.getAttribute('data-why-go');
      if (go(id, a.hasAttribute('data-why-go'))) {
        e.preventDefault();
        try { history.replaceState(null, '', '#' + id); } catch (err) { /* file:// */ }
      }
    });
    window.addEventListener('hashchange', function () { go(location.hash.slice(1), false); });
    var start = location.hash && stepFor(decodeURIComponent(location.hash.slice(1)));
    show(start || steps[0]);
    wrap.classList.add('why-ready');
    if (start) requestAnimationFrame(function () { go(decodeURIComponent(location.hash.slice(1)), false); });
  }

  /* ---------------------------------------------------------------
     Mobile tab bar (below 980px): "Diğer" opens a drawer with the
     rest of the page's own sections. The item for the section being
     read lights up; while that section is one of the drawer's, "Diğer"
     lights up instead. The Neden Katoliğiz steps and the Kilise Bul
     rites and cities are switched by their own scripts, which the bar
     reaches through data-why-go, data-tb-rite and data-city-link.
     --------------------------------------------------------------- */
  function initTabBar() {
    var bar = $('.tabbar');
    if (!bar) return;
    var moreBtn = $('.tb-more', bar), drawer = $('#tb-drawer');
    function openDrawer(on, keepFocus) {
      if (!drawer || !moreBtn) return;
      drawer.hidden = !on;
      moreBtn.setAttribute('aria-expanded', String(on));
      if (on) { var first = $('.tb-link, .tb-chip', drawer); if (first) first.focus({ preventScroll: true }); }
      else if (!keepFocus) moreBtn.focus({ preventScroll: true });
    }
    if (moreBtn && drawer) {
      moreBtn.addEventListener('click', function () { openDrawer(drawer.hidden); });
      drawer.addEventListener('click', function (e) {
        if (e.target.closest('[data-tb-close]')) { openDrawer(false); return; }
        if (e.target.closest('a, [data-tb-rite]')) openDrawer(false, true);
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) openDrawer(false); });
    }
    /* Labels that would be cut off (a long word on a narrow phone) take the bar's text down a
       half-point at a time until every one fits */
    var labels = $$('.tb-t', bar), items = $$('.tb-item', bar);
    function fitLabels() {
      items.forEach(function (it) { it.style.fontSize = ''; });
      if (getComputedStyle(bar).display === 'none' || !items.length) return;
      var size = parseFloat(getComputedStyle(items[0]).fontSize);
      function over() { return labels.some(function (l) { return l.scrollWidth > l.clientWidth + 1; }); }
      while (over() && size > 10.5) {
        size -= .5;
        items.forEach(function (it) { it.style.fontSize = size + 'px'; });
      }
    }
    fitLabels();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitLabels);
    var fitTimer; window.addEventListener('resize', function () { clearTimeout(fitTimer); fitTimer = setTimeout(fitLabels, 120); });
    /* Tesbih: "Baştan Başla" presses the rosary's own restart button */
    $$('[data-tb-action]', bar).forEach(function (b) {
      b.addEventListener('click', function () {
        var target = $('.' + b.getAttribute('data-tb-action'));
        if (target) target.click();
      });
    });
    /* Section spy over the bar's and the drawer's in-page links */
    var links = $$('a.tb-item[href^="#"]', bar).concat(drawer ? $$('a.tb-link[href^="#"]', drawer) : []);
    if (!links.length) return;
    var items = links.map(function (a) { return a.classList.contains('tb-link') ? moreBtn : a; });
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var whyWrap = $('.why-wrap'), ticking = false, tapped = -1;
    links.forEach(function (a, i) { a.addEventListener('click', function () { tapped = i; queue(); }); });
    ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, function () { tapped = -1; }, { passive: true }); });
    function spy() {
      ticking = false;
      if (getComputedStyle(bar).display === 'none') return;
      var pick = -1;
      if (whyWrap) {
        /* One step on screen at a time: the lit item is the step being shown */
        var step = $('.why-step.is-active', whyWrap), end = $('.why-end.is-active', whyWrap);
        var line0 = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64) + 140;
        targets.forEach(function (t, i) {
          if (!t) return;
          if (t.classList.contains('why-end')) { if (end && end.getBoundingClientRect().top <= line0) pick = i; }
          else if (pick === -1 && t.closest('.why-step') === step) pick = i;
        });
      } else {
        /* The section whose top most recently passed the reading line (in page order, which
           need not be the bar's order: the rosary sits above its how-to, say) */
        var line = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64) + Math.max(140, window.innerHeight / 3), best = -Infinity;
        /* At the foot of the page the last sections can't scroll up to the line: then the
           lowest one that is on screen */
        var atEnd = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 4;
        if (atEnd) line = window.innerHeight - 80;
        targets.forEach(function (t, i) {
          if (!t || t.offsetParent === null) return;
          var top = t.getBoundingClientRect().top;
          if (top <= line && top > best) { best = top; pick = i; }
        });
      }
      /* The item just tapped stays lit until the reader scrolls on their own: a short section
         (a search box, say) never reaches the reading line before the next one does */
      if (tapped > -1 && targets[tapped]) pick = tapped;
      var on = pick === -1 ? null : items[pick];
      items.forEach(function (it) { if (it) it.classList.toggle('is-active', it === on); });
    }
    function queue() { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    document.addEventListener('why:step', queue);
    requestAnimationFrame(spy);
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

    // First measurement: from the observer once the page has laid itself out, not synchronously here
    if (window.ResizeObserver) new ResizeObserver(function () { measure(); ends(); queue(); }).observe(nav);
    else requestAnimationFrame(function () { measure(); ends(); update(); });
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', function () { measure(); ends(); queue(); });
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
    function set(h) { document.documentElement.style.setProperty('--header-h', Math.round(h) + 'px'); }
    /* The observer reports the header's size right after the browser's own first layout, so
       nothing here makes it lay the page out early (reading offsetHeight at startup did) */
    if (window.ResizeObserver) {
      new ResizeObserver(function (entries) {
        var e = entries[0], box = e.borderBoxSize && (e.borderBoxSize[0] || e.borderBoxSize);
        set(box && box.blockSize ? box.blockSize : header.offsetHeight);
      }).observe(header);
    } else {
      var old = function () { set(header.offsetHeight); };
      requestAnimationFrame(old); window.addEventListener('resize', old);
    }
  }

  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    initFrameBust(); initHeaderHeight(); initTheme(); initFontSize(); initEmail(); initNavToday(); initReveal(); initRevealAll();
    initSearch(); initReader(); initDrawer(); initNav(); initSources(); initRosary(); initRosaryTracker(); initAnatoliaMap(); initSaints(); initMass(); initHome(); initPrintExpand();
    initChurchFilter(); initStickyToc(); initWhySteps(); initTabBar(); initMapLinks(); initA11y();
  });
})();
