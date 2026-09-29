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
  /* The language shown (TR | EN switch, initLang). Every page carries both; LANG follows the switch.
     There are no separate English pages any more, so links never get a prefix. */
  var LANG = document.documentElement.classList.contains('lang-en') ? 'en' : 'tr';
  var LANG_PREFIX = '';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  /* Runs fn on the frame after next, so a class added inside it reliably starts a CSS
     transition from the element's just-applied "closed" state. Same goal as the classic
     "read el.offsetHeight to force a reflow" trick, without forcing that reflow synchronously. */
  var nextFrame = function (fn) { requestAnimationFrame(function () { requestAnimationFrame(fn); }); };

  /* ---------------------------------------------------------------
     0. Language: TR | EN. Every text is on the page in both languages, as a pair of wrappers
        (.l-tr / .l-en, written by tools/build.ps1, or by LT() below for text made here), and
        html.lang-en shows the English one. Attributes carry their English in data-en-<name>.
        Until a reader picks one, <head> chooses before the first paint: Turkish in Turkey's time
        zone or with a Turkish browser, English everywhere else. A choice made with the switch is
        kept in localStorage and wins from then on. Switching keeps the passage being read where
        it is on the screen.
     --------------------------------------------------------------- */
  var LANG_KEY = 'kd-lang-choice';
  function isEn() { return document.documentElement.classList.contains('lang-en'); }
  /* the same pair, for text this script writes into the page */
  function LT(tr, en) { return (!en || en === tr) ? tr : '<span class="l-tr">' + tr + '</span><span class="l-en" lang="en">' + en + '</span>'; }
  /* one of the two, for text that cannot hold markup (a confirm box, a document title) */
  function L2(tr, en) { return isEn() && en ? en : tr; }
  /* an attribute in both languages: swapAttrs() keeps it in step with the switch */
  function setAttr2(el, name, tr, en) {
    el.setAttribute('data-tr-' + name, tr); el.setAttribute('data-en-' + name, en || tr);
    el.setAttribute(name, isEn() && en ? en : tr);
  }
  var I18N_ATTRS = ['aria-label', 'title', 'placeholder', 'content', 'alt', 'data-tooltip', 'value'];
  function swapAttrs(root) {
    var en = isEn();
    I18N_ATTRS.forEach(function (a) {
      $$('[data-en-' + a + ']', root).forEach(function (el) {
        if (!el.hasAttribute('data-tr-' + a)) el.setAttribute('data-tr-' + a, el.getAttribute(a) || '');
        el.setAttribute(a, el.getAttribute(en ? 'data-en-' + a : 'data-tr-' + a));
      });
    });
    var tEn = $('meta[name="kd-title-en"]');
    if (tEn) {
      if (!document.documentElement.hasAttribute('data-title-tr')) document.documentElement.setAttribute('data-title-tr', document.title);
      document.title = en ? tEn.getAttribute('content') : document.documentElement.getAttribute('data-title-tr');
    }
  }
  /* the pair wrapper under the reading line, and where in it the line falls */
  function langAnchor() {
    var y = Math.min(window.innerHeight * 0.3, (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64) + 40);
    var el = document.elementFromPoint(window.innerWidth / 2, y), pair = null;
    for (var n = el; n && n !== document.body; n = n.parentElement) if (n.classList && (n.classList.contains('l-tr') || n.classList.contains('l-en'))) pair = n;
    if (pair) {
      var r = boxOf(pair); if (!r) return null;
      return { pair: pair, y: y, f: r.height ? (y - r.top) / r.height : 0 };
    }
    return el && el !== document.body ? { el: el, top: el.getBoundingClientRect().top } : null;
  }
  /* a display:contents wrapper has no box of its own: measure what it holds */
  function boxOf(node) {
    try { var rg = document.createRange(); rg.selectNodeContents(node); var r = rg.getBoundingClientRect(); return r.height || r.width ? r : null; } catch (e) { return null; }
  }
  /* Text taken from the page to label something else (the phone's rows and titles) keeps both
     languages: one string, "Türkçe\u0001English". pset() writes it back as a pair. */
  var PSEP = '\u0001';
  function langTextOf(el, lang) {
    var c = el.cloneNode(true);
    $$(lang === 'en' ? '.l-tr' : '.l-en', c).forEach(function (x) { x.remove(); });
    return c.textContent.replace(/\s+/g, ' ').trim();
  }
  function pmake(tr, en) { tr = tr == null ? '' : String(tr); en = en == null ? tr : String(en); return tr === en ? tr : tr + PSEP + en; }
  function psplit(v) { v = v == null ? '' : String(v); var i = v.indexOf(PSEP); return i < 0 ? [v, v] : [v.slice(0, i), v.slice(i + 1)]; }
  function pstr(el) {
    if (!el) return '';
    if (!(el.querySelector && el.querySelector('.l-tr, .l-en'))) return el.textContent.replace(/\s+/g, ' ').trim();
    return pmake(langTextOf(el, 'tr'), langTextOf(el, 'en'));
  }
  function pcat() { var tr = '', en = ''; for (var i = 0; i < arguments.length; i++) { var x = psplit(arguments[i]); tr += x[0]; en += x[1]; } return pmake(tr, en); }
  function pjoin(list, sep) { var a = list.filter(Boolean).map(psplit); return pmake(a.map(function (x) { return x[0]; }).join(sep), a.map(function (x) { return x[1]; }).join(sep)); }
  function pmap(v, fn) { var x = psplit(v); return pmake(fn(x[0], 'tr'), fn(x[1], 'en')); }
  function phtml(v) { var x = psplit(v); return x[0] === x[1] ? esc(x[0]) : LT(esc(x[0]), esc(x[1])); }
  function pset(el, v) { if (!el) return; if (String(v == null ? '' : v).indexOf(PSEP) < 0) el.textContent = v == null ? '' : v; else el.innerHTML = phtml(v); }
  function pnow(v) { var x = psplit(v); return isEn() ? x[1] : x[0]; }
  /* an attribute written into markup from a pair string, kept in step by swapAttrs() */
  function pattr(name, v) { var x = psplit(v); return name + '="' + esc(isEn() ? x[1] : x[0]) + '" data-tr-' + name + '="' + esc(x[0]) + '" data-en-' + name + '="' + esc(x[1]) + '"'; }
  /* html has smooth scrolling on: this move must not be seen */
  function jumpBy(d) { if (!d) return; try { window.scrollBy({ top: d, left: 0, behavior: 'instant' }); } catch (e) { window.scrollBy(0, d); } }
  function setLang(lang, keepView, remember) {
    var en = lang === 'en', root = document.documentElement;
    var a = keepView ? langAnchor() : null;
    root.classList.toggle('lang-en', en);
    root.lang = en ? 'en' : 'tr';
    LANG = en ? 'en' : 'tr';
    if (remember) try { localStorage.setItem(LANG_KEY, LANG); } catch (e) { /* private mode */ }
    swapAttrs(document);
    $$('[data-set-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === LANG)); });
    if (a) {
      if (a.pair) {
        var other = a.pair.classList.contains('l-tr') ? a.pair.nextElementSibling : a.pair.previousElementSibling;
        var r = other && boxOf(other);
        if (r) jumpBy(r.top + a.f * r.height - a.y);
      } else if (a.el) {
        jumpBy(a.el.getBoundingClientRect().top - a.top);
      }
    }
    try { document.dispatchEvent(new CustomEvent('kd:lang', { detail: LANG })); } catch (e) { /* old browsers */ }
  }
  function initLang() {
    setLang(isEn() ? 'en' : 'tr', false);
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-set-lang]');
      if (!b) return;
      var want = b.getAttribute('data-set-lang');
      /* a tap on the language already shown flips to the other one, like a switch */
      if (want === LANG && b.closest('.lang-pill')) want = LANG === 'en' ? 'tr' : 'en';
      setLang(want, true, true);
    });
  }

  /* ---------------------------------------------------------------
     1. Theme (navy/gold dark, ivory/gold light) follows the sun: light from sunrise to sunset
        where the reader is, dark after. Where that is comes from the device's time zone alone
        (a table of zones below, or the zone's offset), worked out here and never sent anywhere.
        Today's sunrise and sunset are kept (kd-sun) so <head> can pick the theme before the
        first paint. The switch overrides the sun until its next rise or set (kd-theme-choice).
     --------------------------------------------------------------- */
  var THEME_CHOICE = 'kd-theme-choice', SUN_KEY = 'kd-sun';
  var SUN_ZONES = {
    'Europe/Istanbul': [41, 29], 'Asia/Istanbul': [41, 29], 'Europe/London': [51.5, -0.1], 'Europe/Dublin': [53.3, -6.3],
    'Europe/Berlin': [52.5, 13.4], 'Europe/Paris': [48.9, 2.4], 'Europe/Rome': [41.9, 12.5], 'Europe/Madrid': [40.4, -3.7],
    'Europe/Amsterdam': [52.4, 4.9], 'Europe/Brussels': [50.8, 4.4], 'Europe/Vienna': [48.2, 16.4], 'Europe/Zurich': [47.4, 8.5],
    'Europe/Stockholm': [59.3, 18.1], 'Europe/Oslo': [59.9, 10.8], 'Europe/Copenhagen': [55.7, 12.6], 'Europe/Warsaw': [52.2, 21],
    'Europe/Athens': [38, 23.7], 'Europe/Lisbon': [38.7, -9.1], 'Europe/Moscow': [55.8, 37.6], 'Europe/Kiev': [50.5, 30.5], 'Europe/Kyiv': [50.5, 30.5],
    'Asia/Nicosia': [35.2, 33.4], 'Europe/Nicosia': [35.2, 33.4], 'Asia/Beirut': [33.9, 35.5], 'Asia/Jerusalem': [31.8, 35.2], 'Asia/Baghdad': [33.3, 44.4],
    'Asia/Tbilisi': [41.7, 44.8], 'Asia/Yerevan': [40.2, 44.5], 'Asia/Baku': [40.4, 49.9], 'Asia/Dubai': [25.2, 55.3], 'Asia/Tehran': [35.7, 51.4],
    'America/New_York': [40.7, -74], 'America/Detroit': [42.3, -83], 'America/Chicago': [41.9, -87.6], 'America/Denver': [39.7, -105],
    'America/Phoenix': [33.4, -112.1], 'America/Los_Angeles': [34.1, -118.2], 'America/Anchorage': [61.2, -149.9], 'Pacific/Honolulu': [21.3, -157.9],
    'America/Toronto': [43.7, -79.4], 'America/Montreal': [45.5, -73.6], 'America/Halifax': [44.6, -63.6], 'America/St_Johns': [47.6, -52.7],
    'America/Winnipeg': [49.9, -97.1], 'America/Regina': [50.4, -104.6], 'America/Edmonton': [53.5, -113.5], 'America/Vancouver': [49.3, -123.1],
    'America/Mexico_City': [19.4, -99.1], 'America/Sao_Paulo': [-23.6, -46.6], 'America/Argentina/Buenos_Aires': [-34.6, -58.4],
    'Australia/Sydney': [-33.9, 151.2], 'Australia/Melbourne': [-37.8, 145], 'Australia/Brisbane': [-27.5, 153], 'Australia/Adelaide': [-34.9, 138.6],
    'Australia/Perth': [-31.9, 115.9], 'Australia/Hobart': [-42.9, 147.3], 'Australia/Darwin': [-12.5, 130.8], 'Pacific/Auckland': [-36.8, 174.8],
    'Asia/Tokyo': [35.7, 139.7], 'Asia/Seoul': [37.6, 127], 'Asia/Shanghai': [31.2, 121.5], 'Asia/Hong_Kong': [22.3, 114.2], 'Asia/Singapore': [1.3, 103.8],
    'Asia/Kolkata': [22.6, 77], 'Asia/Manila': [14.6, 121], 'Africa/Johannesburg': [-26.2, 28], 'Africa/Cairo': [30, 31.2], 'Africa/Lagos': [6.5, 3.4], 'Africa/Nairobi': [-1.3, 36.8]
  };
  function sunPlace(d) {
    var tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { /* old browser */ }
    if (SUN_ZONES[tz]) return SUN_ZONES[tz];
    /* a zone not in the table: its clock offset gives the longitude, its region the hemisphere */
    var south = /^(Australia|Antarctica)\/|^Pacific\/(Auckland|Chatham|Fiji|Noumea|Tongatapu)|^America\/(Argentina|Sao_Paulo|Santiago|Montevideo|Asuncion|Lima|La_Paz)|^Africa\/(Johannesburg|Maputo|Harare|Lusaka|Windhoek|Gaborone)|^Indian\/(Mauritius|Reunion)/.test(tz);
    return [south ? -30 : 40, -d.getTimezoneOffset() / 4];
  }
  /* sunrise or sunset on the day of d, in minutes after local midnight (null: the sun does not rise or set that day) */
  function sunMin(d, lat, lon, rise) {
    var R = Math.PI / 180, N = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 864e5);
    var lh = lon / 15, t = N + ((rise ? 6 : 18) - lh) / 24, M = 0.9856 * t - 3.289;
    var L = (M + 1.916 * Math.sin(M * R) + 0.020 * Math.sin(2 * M * R) + 282.634 + 720) % 360;
    var RA = (Math.atan(0.91764 * Math.tan(L * R)) / R + 720) % 360;
    RA = (RA + Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90) / 15;
    var sinD = 0.39782 * Math.sin(L * R), cosD = Math.cos(Math.asin(sinD));
    var cosH = (Math.cos(90.833 * R) - sinD * Math.sin(lat * R)) / (cosD * Math.cos(lat * R));
    if (cosH > 1 || cosH < -1) return null;
    var Hh = (rise ? 360 - Math.acos(cosH) / R : Math.acos(cosH) / R) / 15;
    var UT = ((Hh + RA - 0.06571 * t - 6.622 - lh) % 24 + 24) % 24;
    return Math.round(((UT * 60 - d.getTimezoneOffset()) % 1440 + 1440) % 1440);
  }
  function sunToday() {
    var d = new Date(), p = sunPlace(d), r = sunMin(d, p[0], p[1], true), s = sunMin(d, p[0], p[1], false);
    var sun = r == null || s == null || s <= r ? { r: 420, s: 1140 } : { r: r, s: s };
    try { localStorage.setItem(SUN_KEY, JSON.stringify(sun)); } catch (e) { /* private mode */ }
    return sun;
  }
  /* the theme the sun gives now, and the moment it next changes */
  function sunTheme() {
    var sun = sunToday(), d = new Date(), m = d.getHours() * 60 + d.getMinutes();
    var mid = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    var next = m < sun.r ? mid + sun.r * 6e4 : m < sun.s ? mid + sun.s * 6e4 : mid + 864e5 + sun.r * 6e4;
    return { t: m >= sun.r && m < sun.s ? 'light' : 'dark', next: next };
  }
  function themeChoice() {
    try { var c = JSON.parse(localStorage.getItem(THEME_CHOICE) || 'null'); return c && c.until > Date.now() ? c.t : null; } catch (e) { return null; }
  }
  function wantedTheme() { return themeChoice() || sunTheme().t; }
  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
  function syncTheme() {
    $$('.theme-toggle').forEach(function (b) {
      b.setAttribute('aria-checked', String(isDark()));
      setAttr2(b, 'aria-label', isDark() ? 'Açık temaya geç' : 'Koyu temaya geç', isDark() ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }
  /* The browser's own bars follow the theme too: through the theme-color meta (Safari up to
     iOS 18, Chrome on Android); Safari 26 reads the solid header and tab bar instead. */
  function syncChrome() {
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--chrome').trim() || (isDark() ? '#16161a' : '#f7f2e8'));
  }
  function applyTheme(t) {
    if (document.documentElement.getAttribute('data-theme') === t) return;
    document.documentElement.setAttribute('data-theme', t);
    syncTheme(); syncChrome();
  }
  function initTheme() {
    applyTheme(wantedTheme());
    syncTheme();
    $$('.theme-toggle').forEach(function (b) {
      b.addEventListener('click', function () {
        var next = isDark() ? 'light' : 'dark';
        try { localStorage.setItem(THEME_CHOICE, JSON.stringify({ t: next, until: sunTheme().next })); } catch (e) { /* private mode */ }
        applyTheme(next);
      });
    });
    /* the page left open over sunrise or sunset changes with it */
    setInterval(function () { applyTheme(wantedTheme()); }, 60000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) applyTheme(wantedTheme()); });
    /* Back to a page the browser kept in memory (Safari's swipe back, the back button): it comes
       back as it was left, so a theme, text size or accessibility setting changed on a later page
       would not show. Read the saved choices again. */
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      var H = document.documentElement;
      applyTheme(wantedTheme());
      try {
        var fs = localStorage.getItem('kkio-fontsize');
        if (fs === '1' || fs === '2') H.setAttribute('data-fontsize', fs); else H.removeAttribute('data-fontsize');
        var a11y = JSON.parse(localStorage.getItem('kkio-a11y') || '{}');
        ['reader', 'contrast', 'saturation', 'spacing', 'links', 'dyslexia', 'cursor'].forEach(function (k) {
          if (a11y[k]) H.setAttribute('data-a11y-' + k, '1'); else H.removeAttribute('data-a11y-' + k);
        });
      } catch (err) { /* private mode */ }
    });
  }

  /* ---------------------------------------------------------------
     1b. Text size (0 = default, 1 = large, 2 = larger), persisted like
     the theme. Scales the root font-size, so every rem-based measurement
     on the page (type, spacing, icons) grows together.
     --------------------------------------------------------------- */
  var FONTSIZE_KEY = 'kkio-fontsize';
  var FONTSIZE_LABELS = ['Yazı boyutunu büyüt', 'Yazı boyutunu büyüt', 'Yazı boyutunu sıfırla'];
  var FONTSIZE_LABELS_EN = ['Make the text bigger', 'Make the text bigger', 'Reset the text size'];
  function fontsizeLevel() { return document.documentElement.getAttribute('data-fontsize') || '0'; }
  function syncFontsize() {
    var level = fontsizeLevel();
    $$('.fontsize-toggle').forEach(function (b) {
      setAttr2(b, 'aria-label', FONTSIZE_LABELS[Number(level)], FONTSIZE_LABELS_EN[Number(level)]);
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
  function liturgicalDay(now, lang) {
    var L = LIT_TEXT[lang || LANG], y = now.getFullYear();
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
    var now = new Date(), lit = liturgicalDay(now, 'tr'), litEn = liturgicalDay(now, 'en');
    var label = LIT_TEXT.tr.colour + ': ' + LIT_TEXT.tr.colours[lit.colour], labelEn = LIT_TEXT.en.colour + ': ' + LIT_TEXT.en.colours[lit.colour];
    val.innerHTML = LT(lit.name, litEn.name);
    val.classList.remove('hint');
    if (dot) {
      dot.className = 'lit-dot lit-' + lit.colour;
      dot.setAttribute('role', 'img');
      setAttr2(dot, 'aria-label', label, labelEn);
      setAttr2(dot, 'title', label, labelEn);
    }
  }
  /* today's date in both languages, as a pair */
  function todayDateHtml() { return LT(todayDateText('tr'), todayDateText('en')); }
  function todayDateText(lang) {
    var d = new Date();
    try {
      if ((lang || LANG) === 'en') return new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(d);
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
      val.innerHTML = set ? LT(set.tr, set.en) : LT('Bulunamadı', 'Unavailable');
      val.classList.remove('hint');
      var link = val.closest('a');
      if (link && set) link.setAttribute('href', ROOT + 'tesbih-duasi.html#gizem-' + set.id);
    })['catch'](function () { val.innerHTML = LT('Bulunamadı', 'Unavailable'); val.classList.remove('hint'); });
  }
  function fillTodaySaint() {
    var val = $('[data-ns-saint]');
    if (!val) return;
    getTodaySaint().then(function (s) {
      val.innerHTML = s.html;
      val.classList.remove('hint');
      var link = val.closest('a');
      if (link) link.setAttribute('href', s.href);
    })['catch'](function () {
      val.innerHTML = LT('Bulunamadı', 'Unavailable');
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
    if (dateEl) dateEl.innerHTML = todayDateHtml();
    tickNavTime();
    fillTodaySeason();
    fillTodayMystery();
    fillTodaySaint();
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
          var e = { n: it.n, page: ROOT + PAGES[pi], part: p.tr, partEn: p.en, q: plain(it.tr.q), a: plain(it.tr.a), qe: plain(it.en.q), ae: plain(it.en.a) };
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
    var qx = '“' + esc(raw.trim()) + '”', n = res.hits.length, more = n > MAX_RESULTS;
    var html = '<p class="sr-head" role="status">' + (n
      ? LT(qx + ' için ' + n + ' soru' + (more ? ' (ilk ' + MAX_RESULTS + ' gösteriliyor)' : ''), n + (n === 1 ? ' question' : ' questions') + ' for ' + qx + (more ? ' (first ' + MAX_RESULTS + ' shown)' : ''))
      : LT(qx + ' için sonuç bulunamadı.', 'No results for ' + qx + '.')) + '</p>';
    res.hits.slice(0, MAX_RESULTS).forEach(function (h) {
      var e = h.e, t0 = res.terms[0];
      /* the snippet in each language: where the words were found, else the answer */
      var snipTr = h.en ? null : snippet(e.a, res.terms, 150);
      var snipEn = snippet(fold(e.qe).indexOf(t0) !== -1 && fold(e.ae).indexOf(t0) === -1 ? e.qe : e.ae, res.terms, 150);
      html += '<a class="sr-item" href="' + e.page + '#soru-' + e.n + '"><span class="sr-num">' + e.n + '</span><span class="sr-body">' +
        '<span class="sr-q">' + LT(highlight(e.q, res.terms), highlight(e.qe, res.terms)) + '</span>' +
        '<span class="sr-snip">' + LT(snipTr === null ? '<span lang="en">' + highlight(snipEn, res.terms) + '</span>' : highlight(snipTr, res.terms), highlight(snipEn, res.terms)) + '</span>' +
        '<span class="sr-meta">' + LT(esc(e.part) + (h.en ? '<span class="sr-en">EN</span>' : ''), esc(e.partEn || e.part)) + '</span></span></a>';
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
          .catch(function () { box.hidden = false; box.innerHTML = '<p class="sr-empty">' + LT('Arama verileri yüklenemedi.', 'The search data could not be loaded.') + '</p>'; });
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
    /* phones' app view shows the questions level by level instead of the reading bar */
    if (!content || document.documentElement.classList.contains('av')) return;
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
    var defaultTitle = current ? pstr(current) : '';
    var header = $('.site-header');
    var links = {};
    $$('.toc a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var tocBox = $('.toc');
    var activeLink = null, stopIndex = -1, ticking = false;

    function titleOf(h) { var t = $('.sec-title', h); return pstr(t || h); }
    function update() {
      ticking = false;
      var line = (header ? header.offsetHeight : 64) + 80;
      var cur = null, si = -1;
      for (var i = 0; i < heads.length; i++) { if (heads[i].getBoundingClientRect().top <= line) cur = heads[i]; else break; }
      for (var j = 0; j < stops.length; j++) { if (stops[j].getBoundingClientRect().top <= line) si = j; else break; }
      stopIndex = si;
      if (current) pset(current, si >= 0 ? titleOf(stops[si]) : defaultTitle);
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
    if (panel) panel.addEventListener('click', function (e) {
      /* the arrow beside Katekizm folds its parts open or closed */
      var more = e.target.closest('.ns-more');
      if (more) {
        var fold = more.closest('.ns-fold'), open = !fold.classList.contains('is-open');
        fold.classList.toggle('is-open', open);
        more.setAttribute('aria-expanded', open ? 'true' : 'false');
        return;
      }
      if (e.target.closest('a')) closeSheet(false);
    });
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
  /* The footer's popups: Kaynaklar ve telif, and İletişim, Erişilebilirlik and Gizlilik (which
     are links to their own pages without JS) */
  function initSources() {
    function open(dlg) { if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', ''); }
    function close(dlg) { if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open'); }
    var src = $('#sources-dialog');
    if (src) $$('.foot-sources').forEach(function (b) { b.addEventListener('click', function () { open(src); }); });
    $$('[data-dialog]').forEach(function (a) {
      var dlg = document.getElementById(a.getAttribute('data-dialog'));
      if (dlg) a.addEventListener('click', function (e) { e.preventDefault(); open(dlg); });
    });
    $$('.sources-dialog').forEach(function (dlg) {
      $('.sources-close', dlg).addEventListener('click', function () { close(dlg); });
      dlg.addEventListener('click', function (e) {
        var r = dlg.getBoundingClientRect();
        if (e.target === dlg && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) close(dlg);
      });
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
      var head = topBar(), topLimit = (head ? head.getBoundingClientRect().bottom : 0) + m;
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
      var head = topBar(), top = head ? head.getBoundingClientRect().bottom : 0;
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
       bar: $('.rt-progress span', sheet), live: $('.rt-live', sheet), grip: $('.rt-grip', sheet),
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
    /* the sets' names in the list, in the language shown, today's marked */
    function nameOptions() {
      $$('option', select).forEach(function (o) {
        var st = sets[o.value]; if (!st) return;
        o.textContent = (LANG === 'en' ? st.en : st.tr) + (o.hasAttribute('data-today') ? ' (' + T.today + ')' : '');
      });
    }
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
        ui.next.setAttribute('aria-label', T.again); ui.next.title = T.again;
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
        var nl = idx === steps.length - 1 ? T.finish : T.next; ui.next.setAttribute('aria-label', nl); ui.next.title = nl;
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
      var r = b.getBoundingClientRect(), head = topBar();
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
        if (days.indexOf(today) !== -1) { o.setAttribute('data-today', '1'); select.value = o.value; }
      });
      nameOptions();
      var saved = savedProgress();
      if (saved) {
        select.value = saved.set; idx = saved.idx; done = !!saved.done;
        if (idx > 0 && !done) { ui.resume.textContent = T.resumed; ui.resume.hidden = false; }
      }
      wire();
      render(false);
      /* the TR | EN switch: the guide's own words and the prayer in the other language */
      document.addEventListener('kd:lang', function () {
        T = RT_TEXT[LANG];
        nameOptions();
        if (!ui.resume.hidden) ui.resume.textContent = T.resumed;
        ui.grip.setAttribute('aria-label', sheet.classList.contains('is-collapsed') ? T.show : T.hide);
        render(false);
      });
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
    var chev = $('.saint-item summary .ico', cal), AZ_CHEV = chev ? chev.outerHTML : '';

    function localParts() {
      var d = new Date();
      return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
    }
    function addDays(base, year, n) {
      var dt = new Date(Date.UTC(year, base.m - 1, base.d));
      dt.setUTCDate(dt.getUTCDate() + n);
      return { m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
    }

    /* month names as pair strings (Turkish, English) */
    var MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'].map(function (t, i) {
      return pmake(t, ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][i]);
    });
    var today = localParts();
    var easterThis = easterMD(today.year);
    var movableTodayCard = null;

    /* Resolve this year's movable feasts and graft each onto its fixed-calendar day */
    $$('.movable-card').forEach(function (card) {
      var offset = parseInt(card.getAttribute('data-offset'), 10);
      var date = addDays(easterThis, today.year, offset);
      var dateEl = $('[data-movable-date]', card);
      if (dateEl) pset(dateEl, pcat(' · ' + date.d + ' ', MONTHS[date.m - 1]));
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
      var h3 = $('h3', card), bio = $('.m-bio', card), rank = $('.m-rank', card);
      if (!h3 || !bio) return;
      /* the feast leads its day, and its rank becomes the day's when it is the higher one */
      var RK = ['rk-other', 'rk-optional', 'rk-memorial', 'rk-feast', 'rk-solemn', 'rk-hi'];
      var rk = card.getAttribute('data-rk') || 'rk-other', had = RK.filter(function (c) { return cell.classList.contains(c); })[0] || 'rk-other';
      if (RK.indexOf(rk) > RK.indexOf(had) || had === 'rk-other') {
        cell.classList.remove(had); cell.classList.add(rk);
        var dr = $('.day-rank', cell);
        if (!dr) { dr = document.createElement('span'); dr.className = 'day-rank label'; cell.insertBefore(dr, wrap); }
        if (rank) { var rc = rank.cloneNode(true); var md = $('.m-date', rc); if (md) md.remove(); dr.innerHTML = rc.innerHTML; }
      }
      var det = document.createElement('details');
      det.className = 'saint-item movable-item';
      det.innerHTML = '<summary><span class="s-name">' + h3.innerHTML + '</span>' + AZ_CHEV + '</summary><div class="saint-bio">' + bio.innerHTML + '</div>';
      wrap.insertBefore(det, wrap.firstChild);
      if (isToday) cell.classList.add('is-today');
    });
    if (!movableTodayCard) {
      var fixedToday = $('.day-cell[data-m="' + today.month + '"][data-d="' + today.day + '"]');
      if (fixedToday) fixedToday.classList.add('is-today');
    }

    /* Hero: today's saint(s), in full, above the fold */
    var dateLabel = $('[data-today-date]');
    if (dateLabel) pset(dateLabel, pcat(today.day + ' ', MONTHS[today.month - 1]));
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
          var moreSlug = top20Id || null;
          var more = moreSlug ? '<a class="today-more-link" href="' + ROOT + moreSlug + '.html">' + LT('Devamını oku', 'Read more') +
            '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></a>' : '';
          pieces.push('<div class="today-more"><span class="today-name">' + it.name + '</span>' +
            (it.title ? '<span class="today-title">' + it.title + '</span>' : '') +
            '<div class="today-bio">' + it.bio + '</div>' + more + '</div>');
        });
      }
      if (pieces.length) body.innerHTML = pieces.join('');
    }

    buildCalendar(cal, today, MONTHS);

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
      var slug = top20Id || 'azizler';
      /* a saint without a page of their own: straight to today in the calendar, their life open */
      var href = ROOT + slug + '.html' + (top20Id ? '' : '#gun-' + today.month + '-' + today.day);
      return { html: s ? LT(esc(s.name), esc(s.nameEn || s.name)) : LT('Bugün için yok', 'None for today'), href: href };
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
  /* ---------------------------------------------------------------
     11b. The saints' calendar as a calendar. The page's own HTML keeps
          every day of the year as text (what search engines and readers
          without JS get); from it this lays out:
          - on a computer, a month at a time on a real grid (Monday first,
            this year's weekdays), each day showing its saints, with the
            chosen day's saints and lives beside it, and a year view to
            jump across the months;
          - on a phone, the Takvim screen as a year of small months (a
            tap opens that month) and each month as a grid of its days
            (a tap opens that day).
     --------------------------------------------------------------- */
  var RANKS = ['rk-hi', 'rk-solemn', 'rk-feast', 'rk-memorial', 'rk-optional', 'rk-other', 'genel'];
  function buildCalendar(cal, today, MONTHS) {
    /* every word of the calendar as a pair string (Turkish, English): phtml() and pattr() write it */
    function pairs(tr, en) { return tr.map(function (t, i) { return pmake(t, en[i]); }); }
    function pobj(tr, en) { var o = {}; Object.keys(tr).forEach(function (k) { o[k] = Array.isArray(tr[k]) ? pairs(tr[k], en[k]) : pmake(tr[k], en[k]); }); return o; }
    var WD = pairs(['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    var WD1 = pairs(['P', 'S', 'Ç', 'P', 'C', 'C', 'P'], ['M', 'T', 'W', 'T', 'F', 'S', 'S']);
    var WDL = pairs(['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'], ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    var TX = pobj({ prev: 'Önceki ay', next: 'Sonraki ay', today: 'Bugün', month: 'Ay', year: 'Yıl', more: 'daha', legend: ['Büyük Bayram', 'Bayram', 'Anma', 'İhtiyari Anma'], none: 'Bu gün için kayıtlı bir aziz yok.' },
      { prev: 'Previous month', next: 'Next month', today: 'Today', month: 'Month', year: 'Year', more: 'more', legend: ['Solemnity', 'Feast', 'Memorial', 'Optional memorial'], none: 'No saint is listed for this day.' });
    /* short weekday names: three letters in Turkish, two in English */
    function wdShort(w) { return phtml(pmap(w, function (x, l) { return x.slice(0, l === 'en' ? 2 : 3); })); }
    /* "5 March: Saint A, Saint B" */
    function dayLabel(d, m, withWd, n) { return pcat(d + ' ', MONTHS[m - 1], withWd ? pcat(', ', WDL[wd(m, d)]) : '', n && n.length ? pcat(': ', pjoin(n, ', ')) : ''); }
    var Y = today.year;
    function rankOf(cell) { for (var i = 0; i < RANKS.length; i++) if (cell.classList.contains(RANKS[i])) return RANKS[i]; return 'rk-other'; }
    function dayOf(m, d) { return $('.day-cell[data-m="' + m + '"][data-d="' + d + '"]', cal); }
    function daysIn(m) { return new Date(Y, m, 0).getDate(); }
    function lead(m) { return (new Date(Y, m - 1, 1).getDay() + 6) % 7; }
    function wd(m, d) { return (new Date(Y, m - 1, d).getDay() + 6) % 7; }
    function isToday(m, d) { return m === today.month && d === today.day; }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function names(cell) { return cell ? $$('.s-name', cell).map(pstr) : []; }
    /* the first paragraph of a saint's life, in both languages */
    function bioStart(it) {
      var t = $('.saint-bio .l-tr p', it) || $('.saint-bio p', it), e = $('.saint-bio .l-en p', it);
      return t ? pmake(t.textContent.replace(/\s+/g, ' ').trim(), e ? e.textContent.replace(/\s+/g, ' ').trim() : null) : '';
    }
    var LEG_RK = ['rk-solemn', 'rk-feast', 'rk-memorial', 'rk-optional'];
    function legend() {
      return '<p class="cal-legend">' + LEG_RK.map(function (r, i) { return '<span><i class="cal-dot ' + r + '"></i>' + phtml(TX.legend[i]) + '</span>'; }).join('') + '</p>';
    }

    /* ----- a phone: the year, and each month's grid, inside the page's own levels */
    var pills = $('.month-pills');
    if (document.documentElement.classList.contains('av')) {
      var year = document.createElement('div');
      year.className = 'cal-year cal-phone';
      year.innerHTML = '<p class="cal-year-y">' + Y + '</p>' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (m) {
        var cells = '';
        for (var i = 0; i < lead(m); i++) cells += '<span></span>';
        for (var d = 1; d <= daysIn(m); d++) {
          var c = dayOf(m, d), r = c ? rankOf(c) : '';
          cells += '<span class="' + (isToday(m, d) ? 'is-today ' : '') + (/rk-(hi|solemn|feast)/.test(r) ? 'is-big ' + r : '') + '">' + d + '</span>';
        }
        return '<a class="cal-mini' + (m === today.month ? ' is-now' : '') + '" href="#ay-' + m + '"><span class="cal-mini-h">' + phtml(MONTHS[m - 1]) + '</span><span class="cal-mini-g" aria-hidden="true">' + cells + '</span></a>';
      }).join('') + legend();
      if (pills) pills.parentNode.insertBefore(year, pills.nextSibling); else cal.parentNode.insertBefore(year, cal);
      /* a day's own screen: its month and weekday beside the number */
      $$('.day-cell', cal).forEach(function (c) {
        var m = +c.getAttribute('data-m'), d = +c.getAttribute('data-d'), n = $('.day-num', c);
        if (!n) return;
        var s = document.createElement('span'); s.className = 'day-mon';
        pset(s, pcat(MONTHS[m - 1], ', ', WDL[wd(m, d)]));
        n.parentNode.insertBefore(s, n.nextSibling);
      });
      /* the Takvim screen itself: this month, the chosen day's saints under it (today's at
         first), arrows for the other months, and "Tüm yıl" for the twelve at a glance */
      var now = document.createElement('div');
      now.className = 'cal-now cal-phone';
      var nst = { m: today.month, sel: { m: today.month, d: today.day } };
      var TXP = pobj({ year: 'Tüm yıl', month: 'Bu ay', read: 'Hayatını oku', prev: 'Önceki ay', next: 'Sonraki ay' },
        { year: 'Full year', month: 'This month', read: 'Read their life', prev: 'Previous month', next: 'Next month' });
      function nowRender() {
        var m = nst.m, g = '';
        WD.forEach(function (w, i) { g += '<span class="cal-wd' + (i > 4 ? ' is-we' : '') + '">' + wdShort(w) + '</span>'; });
        for (var i = 0; i < lead(m); i++) g += '<span></span>';
        for (var d = 1; d <= daysIn(m); d++) {
          var c = dayOf(m, d), n = names(c), sel = nst.sel.m === m && nst.sel.d === d;
          g += '<button type="button" class="cal-md ' + (c ? rankOf(c) : '') + (isToday(m, d) ? ' is-today' : '') + (sel ? ' is-sel' : '') + (wd(m, d) > 4 ? ' is-we' : '') +
            '" data-m="' + m + '" data-d="' + d + '" aria-pressed="' + sel + '" ' + pattr('aria-label', dayLabel(d, m, false, n)) + '><span class="cal-n">' + d + '</span><i class="cal-dot"></i></button>';
        }
        var sm = nst.sel.m, sd = nst.sel.d, c = dayOf(sm, sd), rank = c ? $('.day-rank', c) : null;
        var day = '<p class="cal-now-date"><b>' + phtml(pcat(sd + ' ', MONTHS[sm - 1])) + '</b>, ' + phtml(WDL[wd(sm, sd)]) + '</p>' +
          (rank && rank.textContent.trim() ? '<p class="cal-now-rank"><i class="cal-dot ' + (c ? rankOf(c) : '') + '"></i>' + phtml(pstr(rank)) + '</p>' : '') +
          (c ? $$('.saint-item', c).map(function (it) {
            var nm = $('.s-name', it), t = $('.s-title', it), b = bioStart(it), lk = $('.s-links', it);
            return '<div class="cal-now-saint"><p class="cal-now-n">' + (nm ? nm.innerHTML : '') + '</p>' + (t ? '<p class="cal-now-st">' + t.innerHTML + '</p>' : '') +
              (b ? '<p class="cal-now-bio">' + phtml(b) + '</p>' : '') + (lk ? lk.outerHTML : '') + '</div>';
          }).join('') : '') +
          '<a class="cal-now-go" href="#gun-' + sm + '-' + sd + '">' + phtml(TXP.read) + ' ›</a>';
        now.innerHTML = '<div class="cal-now-bar"><button type="button" class="cal-now-arrow" data-step="-1" ' + pattr('aria-label', TXP.prev) + (m === 1 ? ' disabled' : '') + '>‹</button>' +
          '<p class="cal-now-t">' + phtml(pcat(MONTHS[m - 1], ' ' + Y)) + '</p><button type="button" class="cal-now-arrow" data-step="1" ' + pattr('aria-label', TXP.next) + (m === 12 ? ' disabled' : '') + '>›</button>' +
          '<button type="button" class="cal-now-year" aria-expanded="false">' + phtml(TXP.year) + '</button></div>' +
          '<div class="cal-mgrid">' + g + '</div><div class="cal-now-day" aria-live="polite">' + day + '</div>' + legend();
      }
      now.addEventListener('click', function (e) {
        var t = e.target.closest('button'); if (!t) return;
        if (t.hasAttribute('data-step')) { nst.m = Math.min(12, Math.max(1, nst.m + +t.getAttribute('data-step'))); nowRender(); return; }
        if (t.classList.contains('cal-now-year')) { year.classList.add('is-open'); now.classList.add('is-hidden'); year.scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); return; }
        if (t.hasAttribute('data-d')) { nst.sel = { m: +t.getAttribute('data-m'), d: +t.getAttribute('data-d') }; nowRender(); }
      });
      nowRender();
      year.insertAdjacentHTML('afterbegin', '<button type="button" class="cal-now-year cal-year-back">' + phtml(TXP.month) + '</button>');
      year.addEventListener('click', function (e) {
        if (!e.target.closest('.cal-year-back')) return;
        year.classList.remove('is-open'); now.classList.remove('is-hidden'); nst.m = today.month; nst.sel = { m: today.month, d: today.day }; nowRender();
      });
      year.parentNode.insertBefore(now, year);
      $$('.month', cal).forEach(function (sec) {
        var m = +sec.getAttribute('data-month'), g = '';
        WD.forEach(function (w, i) { g += '<span class="cal-wd' + (i > 4 ? ' is-we' : '') + '">' + wdShort(w) + '</span>'; });
        for (var i = 0; i < lead(m); i++) g += '<span></span>';
        for (var d = 1; d <= daysIn(m); d++) {
          var c = dayOf(m, d), n = names(c);
          g += '<a class="cal-md ' + (c ? rankOf(c) : '') + (isToday(m, d) ? ' is-today' : '') + (wd(m, d) > 4 ? ' is-we' : '') + '" href="#gun-' + m + '-' + d + '" ' + pattr('aria-label', dayLabel(d, m, false, n)) + '><span class="cal-n">' + d + '</span><i class="cal-dot"></i></a>';
        }
        var grid = document.createElement('div');
        grid.className = 'cal-mgrid cal-phone';
        grid.innerHTML = g;
        var legendBox = document.createElement('div'); legendBox.className = 'cal-phone'; legendBox.innerHTML = legend();
        var t = $('.month-title', sec);
        sec.insertBefore(legendBox, t.nextSibling);
        sec.insertBefore(grid, t.nextSibling);
      });
      return;
    }

    /* ----- a computer: the calendar itself */
    var app = document.createElement('div');
    app.className = 'cal-app';
    app.innerHTML =
      '<div class="cal-bar"><div class="cal-nav"><button type="button" class="cal-arrow" data-cal-step="-1" ' + pattr('aria-label', TX.prev) + '><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button>' +
      '<h3 class="cal-title" aria-live="polite"></h3><button type="button" class="cal-arrow" data-cal-step="1" ' + pattr('aria-label', TX.next) + '><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button></div>' +
      '<button type="button" class="cal-todaybtn">' + phtml(TX.today) + '</button>' +
      '<div class="cal-seg" role="group"><button type="button" data-cal-view="month" aria-pressed="true">' + phtml(TX.month) + '</button><button type="button" data-cal-view="year" aria-pressed="false">' + phtml(TX.year) + '</button></div></div>' +
      '<div class="cal-body"><div class="cal-main"></div><aside class="cal-day" aria-live="polite"></aside></div>' + legend();
    if (pills) pills.parentNode.insertBefore(app, pills); else cal.parentNode.insertBefore(app, cal);
    cal.classList.add('cal-on');
    if (pills) pills.classList.add('cal-on');
    var main = $('.cal-main', app), side = $('.cal-day', app), title = $('.cal-title', app);
    var st = { view: 'month', m: today.month, sel: { m: today.month, d: today.day } };

    function monthHtml(m) {
      var h = '<div class="cal-grid" role="grid" ' + pattr('aria-label', pcat(MONTHS[m - 1], ' ' + Y)) + '><div class="cal-row cal-head" role="row">' +
        WD.map(function (w, i) { return '<span role="columnheader" class="' + (i > 4 ? 'is-we' : '') + '">' + phtml(w) + '</span>'; }).join('') + '</div><div class="cal-days">';
      for (var i = 0; i < lead(m); i++) h += '<span class="cal-cell is-out" aria-hidden="true"></span>';
      for (var d = 1; d <= daysIn(m); d++) {
        var c = dayOf(m, d), n = names(c), r = c ? rankOf(c) : 'rk-other';
        var ev = n.slice(0, 2).map(function (x) { return '<span class="cal-ev ' + r + '">' + phtml(x) + '</span>'; }).join('') +
          (n.length > 2 ? '<span class="cal-more">+' + (n.length - 2) + ' ' + phtml(TX.more) + '</span>' : '');
        var sel = st.sel.m === m && st.sel.d === d;
        h += '<button type="button" role="gridcell" class="cal-cell ' + r + (isToday(m, d) ? ' is-today' : '') + (sel ? ' is-sel' : '') + (wd(m, d) > 4 ? ' is-we' : '') +
          '" data-m="' + m + '" data-d="' + d + '" aria-selected="' + sel + '" tabindex="' + (sel ? 0 : -1) + '" ' + pattr('aria-label', dayLabel(d, m, true, n)) + '>' +
          '<span class="cal-n">' + d + '</span>' + ev + '</button>';
      }
      var tail = (7 - (lead(m) + daysIn(m)) % 7) % 7;
      for (var k = 0; k < tail; k++) h += '<span class="cal-cell is-out" aria-hidden="true"></span>';
      return h + '</div></div>';
    }
    function yearHtml() {
      return '<div class="cal-year">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (m) {
        var g = WD1.map(function (w) { return '<span class="cal-wd">' + phtml(w) + '</span>'; }).join('');
        for (var i = 0; i < lead(m); i++) g += '<span></span>';
        for (var d = 1; d <= daysIn(m); d++) {
          var c = dayOf(m, d), r = c ? rankOf(c) : '';
          g += '<button type="button" class="cal-yd' + (isToday(m, d) ? ' is-today' : '') + (/rk-(hi|solemn|feast)/.test(r) ? ' is-big ' + r : '') + '" data-m="' + m + '" data-d="' + d + '" ' + pattr('aria-label', dayLabel(d, m, false)) + '>' + d + '</button>';
        }
        return '<section class="cal-mini' + (m === today.month ? ' is-now' : '') + '"><button type="button" class="cal-mini-h" data-m="' + m + '">' + phtml(MONTHS[m - 1]) + '</button><div class="cal-mini-g">' + g + '</div></section>';
      }).join('') + '</div>';
    }
    function dayHtml(m, d) {
      var c = dayOf(m, d), r = c ? rankOf(c) : '';
      var rank = c ? $('.day-rank', c) : null;
      var h = '<p class="cal-day-date"><span class="cal-day-n">' + d + '</span><span><span class="cal-day-m">' + phtml(pcat(MONTHS[m - 1], ' ' + Y)) + '</span><span class="cal-day-w">' + phtml(WDL[wd(m, d)]) + '</span></span></p>';
      if (rank && rank.textContent.trim()) h += '<p class="cal-day-rank"><i class="cal-dot ' + r + '"></i>' + phtml(pstr(rank)) + '</p>';
      var items = c ? $$('.saint-item', c) : [];
      if (!items.length) return h + '<p class="hint">' + phtml(TX.none) + '</p>';
      return h + items.map(function (it) {
        var n = $('.s-name', it), t = $('.s-title', it), b = $('.saint-bio', it);
        return '<article class="cal-saint"><h4>' + (n ? n.innerHTML : '') + '</h4>' + (t ? '<p class="cal-saint-t">' + t.innerHTML + '</p>' : '') + (b ? '<div class="cal-saint-bio">' + b.innerHTML + '</div>' : '') + '</article>';
      }).join('');
    }
    function render(focus) {
      app.setAttribute('data-view', st.view);
      pset(title, st.view === 'year' ? String(Y) : pcat(MONTHS[st.m - 1], ' ' + Y));
      $$('[data-cal-view]', app).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-cal-view') === st.view)); });
      $$('.cal-arrow', app).forEach(function (b) { var s = +b.getAttribute('data-cal-step'); b.disabled = st.view === 'year' || (s < 0 ? st.m === 1 : st.m === 12); });
      main.innerHTML = st.view === 'year' ? yearHtml() : monthHtml(st.m);
      side.innerHTML = dayHtml(st.sel.m, st.sel.d);
      if (focus) { var f = $('.cal-cell.is-sel', main); if (f) f.focus(); }
    }
    function pick(m, d, focus) { st.sel = { m: m, d: d }; st.m = m; st.view = 'month'; render(focus); }
    app.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t || !app.contains(t)) return;
      if (t.hasAttribute('data-cal-step')) { st.m = Math.min(12, Math.max(1, st.m + +t.getAttribute('data-cal-step'))); render(); return; }
      if (t.hasAttribute('data-cal-view')) { st.view = t.getAttribute('data-cal-view'); render(); return; }
      if (t.classList.contains('cal-todaybtn')) { pick(today.month, today.day); return; }
      if (t.classList.contains('cal-mini-h')) { st.m = +t.getAttribute('data-m'); st.view = 'month'; render(); return; }
      if (t.hasAttribute('data-d')) pick(+t.getAttribute('data-m'), +t.getAttribute('data-d'));
    });
    /* arrow keys walk the days, across the months */
    main.addEventListener('keydown', function (e) {
      var step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (!step || st.view !== 'month') return;
      e.preventDefault();
      var dt = new Date(Y, st.sel.m - 1, st.sel.d + step);
      if (dt.getFullYear() !== Y) return;
      pick(dt.getMonth() + 1, dt.getDate(), true);
    });
    render();
    /* a link to a day (the home page's saint of the day): that day chosen, the calendar in view */
    var dm = /^#gun-(\d{1,2})-(\d{1,2})$/.exec(location.hash);
    if (dm && dayOf(+dm[1], +dm[2])) {
      pick(+dm[1], +dm[2]);
      requestAnimationFrame(function () { app.scrollIntoView({ block: 'start' }); });
    }
  }

  function initHome() {
    var home = $('.home-v2');
    if (!home) return;
    var now = new Date();
    /* the date and the season, in both languages */
    var dayEl = $('[data-hd-day]'), yearEl = $('[data-hd-year]'), litCard = $('[data-home-lit]');
    try {
      var fmt = function (loc, o) { return new Intl.DateTimeFormat(loc, o).format(now); };
      dayEl.innerHTML = LT(fmt('tr-TR', { day: 'numeric', month: 'long' }), fmt('en-US', { month: 'long', day: 'numeric' }));
      yearEl.innerHTML = now.getFullYear() + ' · ' + LT(fmt('tr-TR', { weekday: 'long' }), fmt('en-US', { weekday: 'long' }));
    } catch (e) { dayEl.textContent = now.toDateString(); }
    var lit = liturgicalDay(now, 'tr'), litEn = liturgicalDay(now, 'en');
    $('[data-hd-season]').innerHTML = LT(lit.name, litEn.name);
    $('[data-hd-colour]').innerHTML = LT(LIT_TEXT.tr.colour + ': ' + LIT_TEXT.tr.colours[lit.colour], LIT_TEXT.en.colour + ': ' + LIT_TEXT.en.colours[lit.colour]);
    litCard.setAttribute('data-lit', lit.colour);
    /* the saint */
    var saintCard = $('[data-home-saint]'), m = now.getMonth() + 1, key = m + '-' + now.getDate();
    getTodaySaint().then(function (sn) {
      $('[data-hs-name]', saintCard).innerHTML = sn.html;
      saintCard.setAttribute('href', sn.href);
      return loadDataScript('data/azizler-ozet-' + m + '.js', 'SAINT_SUMMARY_' + m);
    }).then(function () {
      var x = (window['SAINT_SUMMARY_' + m] || {})[key];
      if (!x) return;
      $('[data-hs-title]', saintCard).innerHTML = LT(esc(x[0] || ''), esc(x[1] || x[0] || ''));
      $('[data-hs-bio]', saintCard).innerHTML = LT(esc(x[2] || ''), esc(x[3] || x[2] || ''));
    })['catch'](function () { $('[data-hs-name]', saintCard).innerHTML = LT('Yılın azizleri', 'Saints of the year'); });
    /* the mysteries */
    var myst = $('[data-home-mystery]');
    loadDataScript('data/tespih.js', 'COMPENDIUM_ROSARY').then(function () {
      var set = window.COMPENDIUM_ROSARY.sets.filter(function (x) { return x.days.indexOf(now.getDay()) !== -1; })[0];
      if (!set) return;
      $('[data-hm-name]', myst).innerHTML = LT(set.tr, set.en);
      /* the days this set is prayed on */
      $('[data-hm-days]', myst).innerHTML = '(' + LT(set.dayTr, set.dayEn) + ')';
      /* "Tesbihe başla": the rosary itself, which opens on today's mysteries */
      myst.setAttribute('href', ROOT + 'tesbih-duasi.html#tesbih-rehberi');
    })['catch'](function () { $('[data-hm-name]', myst).innerHTML = LT('Tesbih', 'The Rosary'); });

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
    /* An open app is a history entry, so the browser's own back (Safari's swipe from the left
       edge, Android's back gesture) closes it. Its rows open the pages themselves, which a phone
       shows as the app's next screens (initAppView); their back button returns here. */
    var marked = false, skipPop = 0;
    function iconTransform(icon, box) {
      var r = icon.getBoundingClientRect(), b = box.getBoundingClientRect();
      var sx = r.width / b.width, sy = r.height / b.height;
      return { t: 'translate(' + ((r.left + r.width / 2) - (b.left + b.width / 2)) + 'px,' + ((r.top + r.height / 2) - (b.top + b.height / 2)) + 'px) scale(' + sx + ',' + sy + ')', rad: (18 / sx) + 'px ' + (18 / sy) + 'px' };
    }
    function boxOf(app) { return app.classList.contains('ios-spot') ? $('.ios-spot-panel', app) : app; }
    /* Ara: the field in the middle of what can be seen (above the keyboard, when it is up), or
       near the top once there are results, with the room under it for them */
    var spotEl = document.getElementById('app-ara'), spotBox = spotEl && $('.ios-spot-panel', spotEl);
    function placeSpot() {
      if (!spotEl || spotEl.hidden) return;
      var vv = window.visualViewport, vh = vv ? vv.height : window.innerHeight, vt = vv ? vv.offsetTop : 0;
      var field = $('.search-field', spotBox), res = $('.search-results', spotBox), fh = field.offsetHeight;
      var top = res && !res.hidden ? vt + Math.max(16, Math.round(vh * 0.07)) : vt + Math.round((vh - fh) / 2);
      spotBox.style.top = top + 'px';
      spotBox.style.setProperty('--spot-room', Math.max(140, vt + vh - top - fh - 30) + 'px');
    }
    if (spotEl) {
      var spotRes = $('.search-results', spotEl);
      if (spotRes && window.MutationObserver) new MutationObserver(placeSpot).observe(spotRes, { attributes: true, attributeFilter: ['hidden'] });
      if (window.visualViewport) { window.visualViewport.addEventListener('resize', placeSpot); window.visualViewport.addEventListener('scroll', placeSpot); }
      window.addEventListener('resize', placeSpot);
      window.addEventListener('resize', function () { if (openApp) setPill(fromBtn); });
    }
    /* the capsule behind the open app's icon, as in the App Store's bar */
    var dockBar = $('.hm-apps'), pill = $('.hm-pill');
    function setPill(btn) {
      $$('.hm-app', dockBar).forEach(function (b) { if (b === btn) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      if (!pill) return;
      if (!btn) { pill.classList.remove('is-on'); return; }
      pill.style.width = btn.offsetWidth + 'px';
      pill.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
      pill.classList.add('is-on');
    }
    /* from one open app straight to another: no closing and opening, just the other list */
    function switchTo(btn) {
      var id = btn.getAttribute('data-app-open'), app = document.getElementById('app-' + id), old = openApp;
      if (!app || !old || app === old) return;
      var oldBox = boxOf(old);
      old.classList.add('is-instant'); app.classList.add('is-instant');
      old.classList.remove('is-open'); old.hidden = true;
      oldBox.style.transition = 'none'; oldBox.style.transform = ''; oldBox.style.borderRadius = ''; oldBox.style.opacity = '';
      if (oldBox !== old) { var q0 = $('input', old), rs0 = $('.search-results', old); if (q0) q0.value = ''; if (rs0) { rs0.hidden = true; rs0.innerHTML = ''; } }
      var sc0 = $('.ios-scroll', old); if (sc0) sc0.scrollTop = 0;
      openApp = app; fromBtn = btn; fromIcon = $('.hm-icon', btn);
      setPill(btn);
      app.hidden = false;
      var box = boxOf(app);
      box.style.transition = 'none'; box.style.transform = ''; box.style.borderRadius = ''; box.style.opacity = '';
      if (box !== app) placeSpot();
      app.classList.add('is-open');
      setPill(btn);
      if (marked) { try { history.replaceState({ homeApp: id }, ''); } catch (e) { /* file:// */ } }
      /* Ara: the cursor in the field within the tap, so the keyboard comes up */
      if (box !== app) { var inp = $('input', app); if (inp) inp.focus({ preventScroll: true }); }
      requestAnimationFrame(function () { requestAnimationFrame(function () { old.classList.remove('is-instant'); app.classList.remove('is-instant'); }); });
    }
    function mark(app) { try { history.pushState({ homeApp: app.id.slice(4) }, ''); marked = true; } catch (e) { /* file:// */ } }
    function open(btn, instant) {
      var id = btn.getAttribute('data-app-open'), app = document.getElementById('app-' + id);
      if (!app || openApp) return;
      openApp = app; fromBtn = btn; fromIcon = $('.hm-icon', btn);
      setPill(btn);
      app.hidden = false;
      document.documentElement.classList.add('app-open');
      var box = boxOf(app), spot = box !== app;
      if (spot) { box.style.transition = 'none'; placeSpot(); }
      if (!still && !instant) {
        var tf = iconTransform(fromIcon, box);
        box.style.transition = 'none'; box.style.transform = tf.t; box.style.borderRadius = tf.rad;
        if (spot) box.style.opacity = '0';
        box.getBoundingClientRect();
        box.style.transition = 'transform .5s ' + EASE + ', border-radius .5s ' + EASE + ', opacity .25s, top .45s ' + EASE;
      }
      requestAnimationFrame(function () {
        box.style.transform = ''; box.style.borderRadius = ''; box.style.opacity = '';
        app.classList.add('is-open');
      });
      if (!instant) mark(app);
      var focusTo = spot ? $('input', app) : $('.ios-done', app);
      /* Ara: the field takes the cursor within the tap itself, which is what lets a phone
         bring its keyboard up (a moment later, it would not) */
      if (focusTo && !instant) { if (spot) focusTo.focus({ preventScroll: true }); else setTimeout(function () { focusTo.focus({ preventScroll: true }); }, 350); }
    }
    function finishClose(app) {
      var box = boxOf(app);
      app.hidden = true;
      box.style.transition = 'none'; box.style.transform = ''; box.style.borderRadius = ''; box.style.opacity = '';
      /* Ara opens empty next time, in the middle again */
      if (box !== app) { var q = $('input', app), rs = $('.search-results', app); if (q) q.value = ''; if (rs) { rs.hidden = true; rs.innerHTML = ''; } }
      var sc = $('.ios-scroll', app); if (sc) sc.scrollTop = 0;
      document.documentElement.classList.remove('app-open');
      if (openApp === app) openApp = null;
    }
    function close(fromHistory) {
      var app = openApp;
      if (!app) return;
      var box = boxOf(app), spot = box !== app;
      setPill(null);
      app.classList.remove('is-open');
      if (!still) {
        var tf = iconTransform(fromIcon, box);
        box.style.transition = 'transform .38s ' + EASE + ', border-radius .38s ' + EASE + ', opacity .3s';
        box.style.transform = tf.t; box.style.borderRadius = tf.rad;
        if (spot) box.style.opacity = '0';
      }
      setTimeout(function () { finishClose(app); if (fromBtn) fromBtn.focus({ preventScroll: true }); }, still ? 0 : 390);
      if (!fromHistory && marked) { marked = false; skipPop++; history.back(); }
      else marked = false;
      if (location.hash && /^#app-(ogren|tartis|dua|kesfet)$/.test(location.hash)) { try { history.replaceState(history.state, '', location.pathname); } catch (e) { /* file:// */ } }
    }
    window.addEventListener('popstate', function () {
      if (skipPop) { skipPop--; return; }
      if (openApp) close(true);
    });
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target : e.target.parentNode;
      var o = t.closest('[data-app-open]');
      if (o) {
        /* the icons stay over an open app: its own icon closes it, another one switches to that app */
        if (!openApp) { open(o); return; }
        if (openApp.id === 'app-' + o.getAttribute('data-app-open')) close(); else switchTo(o);
        return;
      }
      if (openApp && t.closest('[data-app-close]')) close();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openApp) close(); });
    /* As in the App Store's bar: a finger drawn along it carries the capsule with it, a lens
       over the icons, and where it is lifted, that app opens */
    if (dockBar && pill && window.PointerEvent) {
      var drag = null, noClick = 0;
      var appAt = function (x) {
        var best = null, bd = 1e9;
        $$('.hm-app', dockBar).forEach(function (b) { var r = b.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - x); if (d < bd) { bd = d; best = b; } });
        return best;
      };
      var overTo = function (b) { $$('.hm-app', dockBar).forEach(function (x) { x.classList.toggle('is-over', x === b); }); };
      var endDrag = function (e, cancel) {
        if (!drag || e.pointerId !== drag.id) return;
        var d = drag; drag = null;
        if (!d.moved) return;
        dockBar.classList.remove('is-drag'); overTo(null);
        noClick = Date.now();
        var b = cancel ? null : appAt(e.clientX);
        if (!b) { setPill(openApp ? fromBtn : null); return; }
        if (!openApp) open(b);
        else if (openApp.id !== 'app-' + b.getAttribute('data-app-open')) switchTo(b);
        else setPill(b);
      };
      dockBar.addEventListener('pointerdown', function (e) {
        if (e.button > 0) return;
        var b = e.target.closest('.hm-app'); if (!b) return;
        drag = { id: e.pointerId, x0: e.clientX, moved: false, w: b.offsetWidth };
      });
      dockBar.addEventListener('pointermove', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        if (!drag.moved) {
          if (Math.abs(e.clientX - drag.x0) < 6) return;
          drag.moved = true;
          try { dockBar.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
          dockBar.classList.add('is-drag');
        }
        var bs = $$('.hm-app', dockBar), lo = bs[0].offsetLeft, hi = bs[bs.length - 1].offsetLeft;
        var x = e.clientX - dockBar.getBoundingClientRect().left - dockBar.clientLeft - drag.w / 2;
        pill.style.width = drag.w + 'px';
        pill.style.transform = 'translateX(' + Math.max(lo, Math.min(hi, x)) + 'px) scale(1.1)';
        pill.classList.add('is-on');
        overTo(appAt(e.clientX));
      });
      dockBar.addEventListener('pointerup', function (e) { endDrag(e, false); });
      dockBar.addEventListener('pointercancel', function (e) { endDrag(e, true); });
      /* the tap that ends a drag is not a tap on an icon as well */
      dockBar.addEventListener('click', function (e) { if (Date.now() - noClick < 400) { e.preventDefault(); e.stopPropagation(); } }, true);
    }
    /* the footer fades in once the home screen is scrolled (see the styles) */
    if (dockBar) {
      var footIn = function () { document.documentElement.classList.toggle('foot-in', window.pageYOffset > 24); };
      window.addEventListener('scroll', footIn, { passive: true });
      footIn();
    }
    $$('.ios-scroll').forEach(function (sc) {
      sc.addEventListener('scroll', function () { sc.parentNode.classList.toggle('is-scrolled', sc.scrollTop > 40); }, { passive: true });
    });

    /* Back here from one of an app's pages (its back button, or the browser's back when the page
       was not kept in memory): the history entry says which app was open. A page opened without
       coming from here (from a search engine, say) links back to its app as #app-ogren, #app-tartis, #app-dua or #app-kesfet. */
    var st = history.state, want = st && st.homeApp ? st.homeApp : (location.hash || '').replace(/^#app-/, '');
    var btn0 = /^(ogren|tartis|dua|kesfet)$/.test(want) && $('[data-app-open="' + want + '"]');
    if (btn0) { open(btn0, true); marked = !!(st && st.homeApp); }
    else if (st && st.homeApp) { try { history.replaceState(null, ''); } catch (e) { /* file:// */ } }
  }

  /* ---------------------------------------------------------------
     Phones: each page as a screen of an app (html.av, set in the page's
     head before the first paint). Every word of the page stays in its
     HTML, just as on a computer: search engines read the phone's page
     and must find all of it there, and they do not tap. The phone shows
     it one level at a time, like the Settings app: the page's sections
     as a list; a section's text, with its items as a list; an item on
     its own. Each level is a history entry at its own #anchor, so the
     browser's back (Safari's swipe from the left edge too) steps back a
     level, and any link to #something opens the level that holds it.
     --------------------------------------------------------------- */
  var AV_TX = {
    tr: { top: 'Sayfanın başına dön', sections: 'Bölümler', share: 'Paylaş', copied: 'Bağlantı kopyalandı', text: 'Metin', q: 'Soru', swipe: 'Kaydırarak geçin', prev: 'Önceki', next: 'Sonraki', toc: 'İçindekiler', done: 'Bitti', today: 'Bugünün Azizi', calendar: 'Takvim', church: 'kilise', churches: 'kilise' },
    en: { top: 'Back to the start of the page', sections: 'Sections', share: 'Share', copied: 'Link copied', text: 'Text', q: 'Question', swipe: 'Swipe for the next one', prev: 'Previous', next: 'Next', toc: 'Contents', done: 'Done', today: 'Saint of the Day', calendar: 'Calendar', church: 'church', churches: 'churches' }
  };
  /* ---------------------------------------------------------------
     Katekizm: which questions this reader has read. A question counts
     once it has been on screen for a few seconds (or "Sonraki" is
     tapped past it); the list stays in this browser only. A read
     question gets a gold tick; each chapter, part and contents entry a
     ring that fills as its questions are read.
     --------------------------------------------------------------- */
  var KKREAD = (function () {
    var KEY = 'kkio-read', set = {}, subs = [];
    try { (localStorage.getItem(KEY) || '').split(',').forEach(function (x) { if (+x) set[+x] = 1; }); } catch (e) { /* private mode */ }
    function save() { try { localStorage.setItem(KEY, Object.keys(set).join(',')); } catch (e) { /* private mode */ } }
    function count(a, b) { var c = 0; for (var i = a; i <= b; i++) if (set[i]) c++; return c; }
    return {
      has: function (n) { return !!set[n]; },
      mark: function (n) { if (!n || set[n]) return; set[n] = 1; save(); subs.forEach(function (f) { f(n); }); },
      clear: function () { set = {}; save(); subs.forEach(function (f) { f(0); }); },
      count: count, total: function () { return Object.keys(set).length; },
      on: function (f) { subs.push(f); }
    };
  })();
  var RD_TICK = '<svg class="rd-tick" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9"/><path d="m6 10.3 2.7 2.7L14.2 7.4"/></svg>';
  /* a ring for "k of n read": empty, part-filled, or full with a tick */
  function rdRing(k, n) {
    if (!n) return '';
    if (k >= n) return '<span class="rd rd-full" title="' + k + ' / ' + n + '">' + RD_TICK + '</span>';
    var C = 2 * Math.PI * 7.5, off = C * (1 - k / n);
    return '<span class="rd' + (k ? ' rd-some' : '') + '" title="' + k + ' / ' + n + '"><svg class="rd-ring" viewBox="0 0 20 20" aria-hidden="true"><circle class="rd-bg" cx="10" cy="10" r="7.5"/>' +
      (k ? '<circle class="rd-fg" cx="10" cy="10" r="7.5" stroke-dasharray="' + C.toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2) + '"/>' : '') + '</svg>' +
      (k ? '<span class="rd-k">' + k + '/' + n + '</span>' : '') + '</span>';
  }
  function rdRange(txt) { var m = /(\d+)\s*[–-]\s*(\d+)/.exec(txt || ''); if (m) return [+m[1], +m[2]]; m = /^\s*(\d+)\s*$/.exec(txt || ''); return m ? [+m[1], +m[1]] : null; }
  /* a computer: the questions' own number badges, the contents' ranges, the overview's parts */
  function initReadMarks() {
    var H = document.documentElement;
    function paint() {
      $$('article.qa[data-n]').forEach(function (a) { a.classList.toggle('is-read', KKREAD.has(+a.getAttribute('data-n'))); });
      $$('.toc a, .acc-list a').forEach(function (a) {
        var r = rdRange(avText($('.rng, .toc-rng, .count', a)) || (a.getAttribute('data-rng') || ''));
        var old = $('.rd', a); if (old) old.remove();
        if (!r) return;
        a.insertAdjacentHTML('beforeend', rdRing(KKREAD.count(r[0], r[1]), r[1] - r[0] + 1));
      });
      $$('.part-acc > summary .p-meta').forEach(function (s) {
        var old = $('.rd', s); if (old) old.remove();
        var r = rdRange(avText(s).split('·').pop());
        if (r) s.insertAdjacentHTML('beforeend', rdRing(KKREAD.count(r[0], r[1]), r[1] - r[0] + 1));
      });
      var tot = $('.rd-total');
      if (tot) {
        var k = KKREAD.total();
        tot.hidden = !k;
        $('.rd-total-n', tot).textContent = k + ' / 598';
        $('.rd-total-bar i', tot).style.width = (k / 5.98) + '%';
      }
    }
    /* the overview: how far the reader has come, and a way to start over */
    var hero = $('.work-hero');
    if (hero && $('.parts')) {
      var tot = document.createElement('p');
      tot.className = 'rd-total'; tot.hidden = true;
      tot.innerHTML = '<span class="rd-total-t">' + LT('Okuduğunuz sorular', 'Questions you have read') + ' <b class="rd-total-n"></b></span>' +
        '<span class="rd-total-bar" aria-hidden="true"><i></i></span><button type="button" class="rd-reset">' + LT('Sıfırla', 'Start over') + '</button>';
      hero.appendChild(tot);
      $('.rd-reset', tot).addEventListener('click', function () {
        if (window.confirm(L2('Okuduğunuz soruların kaydı silinsin mi?', 'Forget which questions you have read?'))) KKREAD.clear();
      });
    }
    paint();
    KKREAD.on(paint);
    /* a question read on a computer: most of it in view for three seconds */
    if (H.classList.contains('av') || !window.IntersectionObserver) return;
    var timers = {};
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var n = +e.target.getAttribute('data-n');
        if (e.isIntersecting && !KKREAD.has(n)) { if (!timers[n]) timers[n] = setTimeout(function () { KKREAD.mark(n); }, 3000); }
        else { clearTimeout(timers[n]); timers[n] = null; }
      });
    }, { threshold: 0.6 });
    $$('article.qa[data-n]').forEach(function (a) { io.observe(a); });
  }
  var AV_CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var AV_OUT = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-8.5 8.5"/><path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/></svg>';
  var AV_SHARE = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M8 11H6.5A1.5 1.5 0 0 0 5 12.5v7A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5H16"/></svg>';
  function avText(el) { return pstr(el); }
  /* A heading's text without its small label or English gloss */
  function avHead(h) {
    if (!h) return '';
    var c = h.cloneNode(true);
    $$('.label, .en, .gloss, .sec-label, svg', c).forEach(function (x) { x.remove(); });
    return avText(c);
  }
  function avNode(el, t, s, norow) {
    if (!el) return;
    el.setAttribute('data-av-node', '');
    if (t) el.setAttribute('data-av-t', t);
    if (s) el.setAttribute('data-av-s', s);
    if (norow) el.setAttribute('data-av-norow', '');
  }
  function avLink(el, t, s) { if (!el) return; el.setAttribute('data-av-link', ''); if (t) el.setAttribute('data-av-t', t); if (s) el.setAttribute('data-av-s', s); }
  /* A flat run of "heading, then its text" into one box per heading, so a section is one element */
  function avWrap(box, headSel, stopSel) {
    var cur = null, out = [];
    if (!box) return out;
    Array.prototype.slice.call(box.children).forEach(function (el) {
      if (el.matches(headSel)) {
        cur = document.createElement('div'); cur.className = 'av-sec'; cur.setAttribute('data-av-id', el.id);
        box.insertBefore(cur, el); cur.appendChild(el); out.push(cur); return;
      }
      if (stopSel && el.matches(stopSel)) { cur = null; return; }
      if (cur) cur.appendChild(el);
    });
    return out;
  }
  /* The Katekizm's parts: sections (h2) holding chapters (h3) holding the questions, with the
     smaller headings left in place as the headings of groups of questions */
  function avNest(box) {
    var stack = [{ lv: 1, el: box }];
    Array.prototype.slice.call(box.children).forEach(function (el) {
      var m = / sec-l([23])( |$)/.exec(' ' + el.className + ' ');
      if (m) {
        var lv = +m[1];
        while (stack[stack.length - 1].lv >= lv) stack.pop();
        var w = document.createElement('div'); w.className = 'av-sec'; w.setAttribute('data-av-id', el.id);
        var parent = stack[stack.length - 1].el;
        if (parent === box) box.insertBefore(w, el); else parent.appendChild(w);
        w.appendChild(el);
        avNode(w, avText($('.sec-title', el)) || avHead(el), avText($('.sec-label', el)));
        stack.push({ lv: lv, el: w });
        return;
      }
      var top = stack[stack.length - 1].el;
      if (top !== box) top.appendChild(el);
    });
  }
  var AV_PAGES = {
    'neden-katoligiz.html': function (m) {
      $$('.why-item', m).forEach(function (d) { avNode(d, avText($('.why-hook', d)), avText($('.why-hook-k', d))); });
      avNode($('.why-end', m), avHead($('h2', $('.why-end', m))));
    },
    'sss.html': function (m) {
      $$('.faq-cat', m).forEach(function (s) { avNode(s, avHead($('h2', s)), avText($('.faq-cat-en', s))); });
      $$('.faq-item', m).forEach(function (d) { avNode(d, avText($('.faq-q', d)) || avText($('summary', d))); });
    },
    'meseller.html': function (m) { AV_PAGES['mucizeler.html'](m); },
    'mucizeler.html': function (m) {
      $$('.mira-cat', m).forEach(function (s) { avNode(s, avHead($('h2', s)), avText($('.faq-cat-en', s))); });
      $$('.mira-item', m).forEach(function (d) { avNode(d, avText($('.mira-name', d)), avText($('.mira-place', d))); });
    },
    'kutsal-ayin.html': function (m) {
      $$('.mass-part', m).forEach(function (d) { avNode(d, avText($('h2', d)), avText($('.mass-part-n', d))); });
    },
    /* the summary, then each part holding its sections, the closing and the sources; the
       footnote on the word "Allah" stays under the rows, at the foot of the page's list */
    'islama-cevap.html': function (m) {
      avNode($('#kisaca', m), avHead($('#kisaca-h', m)), pcat(String($$('.ic-tl-list > li', m).length), ' ', pmake('madde', 'points')));
      $$('.ic-part', m).forEach(function (p) { avNode(p, avText($('.ic-part-t', p)), avText($('.ic-part-n', p))); });
      $$('.ic-part .ic-sec', m).forEach(function (s) { avNode(s, avHead($('.ic-sec-t', s))); });
      var end = $('.ic-closing', m); if (end) avNode(end, avText($('.ic-part-t', end)));
      avNode($('.ic-sources', m), avHead($('#ic-kaynak-h', m)));
    },
    'katolik-sureci.html': function (m) {
      avWrap($('.wrap', m), 'h2.section-title[id]', 'p.conventions').forEach(function (w) { avNode(w, avHead($('h2', w))); });
      $$('.faq-list > details', m).forEach(function (d) { avNode(d, avText($('summary', d))); });
    },
    'gunah-cikarma.html': function (m) {
      avWrap($('.wrap', m), 'h2.section-title[id]', 'aside, p.conventions').forEach(function (w) { avNode(w, avHead($('h2', w))); });
      var a = $('#muhur-sehitleri', m); if (a) avNode(a, pmap(avText($('.footnote-label', a)), function (x) { return x.replace(/^\*\s*/, ''); }));
      $$('.faq-list > details', m).forEach(function (d) { avNode(d, avText($('summary', d))); });
    },
    'ekler.html': function (m) {
      avWrap($('.wrap', m), 'h2.section-title[id]', 'p.conventions').forEach(function (w) { avNode(w, avHead($('h2', w))); });
      $$('.text-card[id]', m).forEach(function (c) { avNode(c, avText($('.t-title', c))); });
    },
    'tesbih-duasi.html': function (m) {
      var rt = $('#tesbih-rehberi', m); avNode(rt, avHead($('h2', rt)));
      avWrap($('.wrap', m), 'h2.section-title[id]:not(#rt-h)', 'p.conventions').forEach(function (w) { avNode(w, avHead($('h2', w))); });
      $$('.myst[id]', m).forEach(function (a) { avNode(a, avText($('h3', a)), avText($('.m-day', a))); });
    },
    'kutsal-kitap.html': function (m) {
      $$('.kk-sec', m).forEach(function (d) { avNode(d, avHead($('summary h2', d))); });
    },
    'azizler.html': function (m, T) {
      var wrap = $('.wrap', m), today = $('#bugun-azizi', m);
      avNode(today, T.today, avText($('[data-today-date]', today)));
      /* the calendar: the month links and the months into one box */
      var pills = $('#takvim', m), cal = $('.saints-cal', m);
      if (pills && cal) {
        var box = document.createElement('div'); box.className = 'av-sec'; box.setAttribute('data-av-id', 'takvim');
        pills.parentNode.insertBefore(box, pills); box.appendChild(pills);
        var cn = $('.cal-now', m); if (cn) box.appendChild(cn);
        var yr = $('.cal-year', m); if (yr) box.appendChild(yr);
        box.appendChild(cal);
        avNode(box, T.calendar);
      }
      avWrap(wrap, 'h2.section-title[id]', 'p.conventions').forEach(function (w) { avNode(w, avHead($('h2', w))); });
      $$('.saints-cal .month', m).forEach(function (mo) {
        var mn = avText($('.month-title', mo));
        avNode(mo, mn);
        $$('.day-cell', mo).forEach(function (c) {
          var d = c.getAttribute('data-d'), mm = c.getAttribute('data-m');
          c.setAttribute('data-av-id', 'gun-' + mm + '-' + d);
          var names = pjoin($$('.s-name', c).map(avText), ', ');
          avNode(c, pmake(d + ' ' + psplit(mn)[0], psplit(mn)[1] + ' ' + d), names || avText($('.day-rank', c)));
        });
      });
      /* the twenty saints: their list is open here, each saint a row to its page */
      var gd = $('[data-gs-drop]', m); if (gd) gd.open = true;
      $$('.gs-item', m).forEach(function (a) { avLink(a, avText($('.gs-n', a)), avText($('.gs-s', a))); });
    },
    'topraklarimizda-hristiyanlik.html': function (m) {
      var map = $('#harita', m), first = $('.wrap.narrow > section[id]', m);
      if (map && first) first.parentNode.insertBefore(map, first);
      $$('main > .wrap > section[id]', document).forEach(function (s) { avNode(s, avHead($('h2', s))); });
      $$('.amap-card[id]', m).forEach(function (c) { avNode(c, avText($('.amap-c-name', c)), avText($('.amap-c-place', c)), true); });
    },
    'katekizm.html': function (m) {
      $$('.part-acc', m).forEach(function (d) {
        avNode(d, avText($('.p-title', d)), avText($('.p-meta', d)));
        /* its sections and chapters as lists of links */
        $$('.acc-section', d).forEach(function (sec) {
          var head = $(':scope > a', sec), list = $('.acc-list', sec), rows = document.createElement('div');
          rows.className = 'av-rows';
          $$('a', list).forEach(function (a) {
            var r = document.createElement('a'), lab = avText($('.c-label', a)), rng = avText($('.rng', a));
            r.className = 'av-row' + (a.parentNode.classList.contains('lv4') ? ' av-row-sub' : ''); r.href = a.getAttribute('href');
            r.innerHTML = '<span class="av-rt"><span class="av-t"></span><span class="av-s"></span></span>' + AV_CHEV;
            var hd = psplit(avHead($('span', a))), lp = psplit(lab), tt = pmake(hd[0].replace(lp[0], '').trim(), hd[1].replace(lp[1], '').trim());
            pset($('.av-t', r), psplit(tt)[0] ? tt : avText(a));
            pset($('.av-s', r), pjoin([lab, rng], ' · '));
            rows.appendChild(r);
          });
          if (head) { var g = document.createElement('a'); g.className = 'av-gh av-gh-link'; g.href = head.getAttribute('href'); pset(g, pjoin([avText($('.label', head)), avText($('.s-title', head))], ': ')); sec.insertBefore(g, sec.firstChild); }
          sec.appendChild(rows);
        });
      });
      $$('.more-texts .text-link', m).forEach(function (a) { avLink(a, avText($('.t-title', a)), avText($('.t-sub', a))); });
    },
    'katekizm-part': function (m) {
      var c = $('#content', m);
      if (!c) return;
      avNest(c);
      $$('article.qa', c).forEach(function (a) { a.setAttribute('data-av-qn', a.id.replace('soru-', '')); avNode(a, pcat(avText($('.qa-num', a)), '. ', avText($('.qa-q', a)))); });
    }
  };
  ['iman-ikrari.html', 'kutsal-sirlar.html', 'mesihte-yasam.html', 'hristiyan-duasi.html'].forEach(function (f) { AV_PAGES[f] = AV_PAGES['katekizm-part']; });

  /* A page other than the home screen is laid out as a phone's app screens or as a computer's
     page when it loads (html.av, set in <head>). Resizing the window across that width loads
     the page again in the other layout, at the same place */
  /* ----- Kilise Bul's map: Turkey, fixed, with the cities that have a Catholic church. A city's
     dot lights up under the pointer; a tap or click opens the list of its churches beside the dot
     (on the side with room: to the east of Istanbul, to the west of Trabzon; on a phone, under
     the dot), each name leading to the church's own page. Istanbul's list has two columns, one
     for each side of the Bosphorus. */
  function initChurchMap() {
    var sec = $('.cmap'); if (!sec) return;
    var svg = $('.cmap-svg', sec), frame = $('.cmap-frame', sec);
    var pin = function (el) { el._x = +el.getAttribute('data-x'); el._y = +el.getAttribute('data-y'); return el; };
    var cities = $$('.cmap-city', svg).map(pin), texts = $$('.cmap-texts text', svg).map(pin);
    var line = document.createElement('div'); line.className = 'cmap-line'; line.hidden = true; frame.appendChild(line);
    var vb = null, open = null;

    /* the view: the whole country, as wide as the frame's own shape needs */
    function whole() {
      var a = (frame.clientHeight / frame.clientWidth) || 0.594;
      var x0 = 10, x1 = 995, y0 = 60, y1 = 430, w = Math.max(x1 - x0, (y1 - y0) / a), h = w * a;
      return { x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w: w, h: h };
    }
    function draw() {
      vb = whole();
      svg.setAttribute('viewBox', vb.x + ' ' + vb.y + ' ' + vb.w + ' ' + vb.h);
      /* dots and names keep their size on screen (a little smaller in a phone's narrow frame) */
      var fw = svg.clientWidth || 1, k = Math.max(.8, Math.min(1, fw / 640)), s = vb.w / fw * k;
      cities.forEach(function (c) { c.setAttribute('transform', 'translate(' + c._x + ' ' + c._y + ') scale(' + s + ')'); });
      texts.forEach(function (t) { t.setAttribute('transform', 'translate(' + t._x + ' ' + t._y + ') scale(' + s + ')'); });
      if (open) place(open);
    }
    function popOf(c) { return document.getElementById('cmap-pop-' + c.getAttribute('data-city')); }
    /* the list beside its city: vertically round the dot, kept inside the frame where it fits */
    function place(c) {
      var pop = popOf(c); if (!pop) return;
      var f = frame.getBoundingClientRect(), d = $('.cc-dot', c).getBoundingClientRect();
      var cx = d.left + d.width / 2 - f.left, cy = d.top + d.height / 2 - f.top;
      var w = pop.offsetWidth, h = pop.offsetHeight, narrow = f.width < 600, gap = 26;
      pop.classList.toggle('is-below', narrow);
      if (narrow) {
        var x = Math.max(0, Math.min(f.width - w, cx - w / 2));
        pop.style.left = x + 'px'; pop.style.top = (cy + 16) + 'px';
        pop.style.setProperty('--ax', (cx - x) + 'px');
        line.hidden = true;
        return;
      }
      var right = c.getAttribute('data-open') !== 'l';
      var left = right ? cx + gap : cx - gap - w;
      /* never past the edge of the window */
      var vw = document.documentElement.clientWidth;
      left = Math.max(8 - f.left, Math.min(vw - 8 - f.left - w, left));
      var top = Math.max(-10, Math.min(f.height - h + 30, cy - h * 0.38));
      pop.style.left = left + 'px'; pop.style.top = top + 'px';
      line.hidden = false;
      line.style.top = cy + 'px';
      line.style.left = (right ? cx + 7 : left + w) + 'px';
      line.style.width = (gap - 7) + 'px';
      line.classList.toggle('is-l', !right);
    }
    function show(c, focus) {
      if (open === c) { hide(); return; }
      hide();
      var pop = popOf(c); if (!pop) return;
      open = c; c.classList.add('is-sel'); c.setAttribute('aria-expanded', 'true');
      pop.hidden = false; place(c);
      requestAnimationFrame(function () { pop.classList.add('is-open'); });
      if (focus) { var a = $('a', pop); if (a) a.focus({ preventScroll: true }); }
    }
    function hide(back) {
      if (!open) return;
      var c = open, pop = popOf(c);
      open = null; line.hidden = true;
      c.classList.remove('is-sel'); c.setAttribute('aria-expanded', 'false');
      if (pop) { pop.classList.remove('is-open'); pop.hidden = true; }
      if (back) c.focus({ preventScroll: true });
    }
    svg.addEventListener('click', function (e) {
      var c = e.target.closest('.cmap-city');
      if (c) show(c, false); else hide();
    });
    svg.addEventListener('keydown', function (e) {
      var c = e.target.closest && e.target.closest('.cmap-city');
      if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(c, true); }
    });
    document.addEventListener('click', function (e) { if (open && !frame.contains(e.target)) hide(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) hide(true); });
    var lastW = 0;
    var refit = function () { var fw = frame.clientWidth; if (!fw || fw === lastW) return; lastW = fw; draw(); };
    if (window.ResizeObserver) new ResizeObserver(refit).observe(frame); else window.addEventListener('resize', refit);
    draw();
  }

  /* "En üste kaydır": at the foot of a page (or a phone's level) that runs well past one screen */
  function initToTop() {
    var av = document.documentElement.classList.contains('av');
    var foot = av ? $('.av-foot') : $('.site-footer');
    if (!foot || !window.scrollTo) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'to-top'; b.hidden = true;
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg><span>' + LT('En üste kaydır', 'Scroll to top') + '</span>';
    if (av) {
      var row = document.createElement('div'), share = $('.av-share', foot);
      row.className = 'av-foot-row';
      foot.insertBefore(row, foot.firstChild);
      row.appendChild(b);
      if (share) row.appendChild(share);
    } else {
      var w = document.createElement('div');
      w.className = 'wrap to-top-wrap';
      w.appendChild(b);
      foot.parentNode.insertBefore(w, foot);
    }
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var check = function () { b.hidden = document.documentElement.scrollHeight < window.innerHeight * 1.25; };
    b.addEventListener('click', function () {
      try { window.scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
    });
    if (window.ResizeObserver) new ResizeObserver(check).observe(document.body);
    window.addEventListener('resize', check);
    check();
  }

  function initLayoutSwitch() {
    if (!document.body.hasAttribute('data-avp') || !window.matchMedia) return;
    var mq = window.matchMedia('(max-width: 979px)'), was = document.documentElement.classList.contains('av');
    /* laying the page out for printing changes its width too: that must not reload it (the
       browser's print dialog would close at once) */
    var printing = false;
    window.addEventListener('beforeprint', function () { printing = true; });
    window.addEventListener('afterprint', function () { setTimeout(function () { printing = false; }, 500); });
    var isPrint = function () { return printing || (window.matchMedia && window.matchMedia('print').matches); };
    var check = function () {
      if (isPrint()) return;
      setTimeout(function () { if (!isPrint() && mq.matches !== was) location.reload(); }, 250);
    };
    if (mq.addEventListener) mq.addEventListener('change', check); else if (mq.addListener) mq.addListener(check);
  }
  function initAppView() {
    var H = document.documentElement, main = $('#main'), nav = $('.av-nav');
    if (!H.classList.contains('av')) return;
    if (!main || !nav) { H.classList.remove('av'); return; }
    /* its own words in both languages, as pair strings (pset/phtml write them) */
    var T = {}; Object.keys(AV_TX.tr).forEach(function (k) { T[k] = pmake(AV_TX.tr[k], AV_TX.en[k]); });
    var key = document.body.getAttribute('data-avp') || '';
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try { history.scrollRestoration = 'manual'; } catch (e) { /* old browsers */ }

    /* the page's icon, name and description: its hero, first in the page */
    var hero = $('.work-hero', main) || $('.page-head', main);
    if (hero) { hero.classList.add('av-hero'); main.insertBefore(hero, main.firstChild); }
    var pageT = avText($('h1', hero || main)) || document.title;
    var prep = AV_PAGES[key];
    if (prep) prep(main, T);

    /* the language of the originals: Türkçe, English or Latina, where a level has them */
    var seg = document.createElement('div');
    seg.className = 'av-lang av-fixed'; seg.setAttribute('role', 'group'); setAttr2(seg, 'aria-label', AV_TX.tr.text, AV_TX.en.text);
    if (hero) hero.parentNode.insertBefore(seg, hero.nextSibling); else main.insertBefore(seg, main.firstChild);
    /* the page's own list heading, and the button to share the level being read */
    var foot = document.createElement('div');
    foot.className = 'av-foot';
    foot.innerHTML = '<button type="button" class="av-share">' + AV_SHARE + '<span>' + phtml(T.share) + '</span></button><p class="av-toast" role="status" aria-live="polite"></p>';
    main.parentNode.insertBefore(foot, main.nextSibling);

    /* In a level further in, the page's small icon and name lead back to its start; a level
       deeper still also shows the levels between as a trail under them */
    var crumbs = document.createElement('p');
    crumbs.className = 'av-crumbs';
    if (hero) {
      hero.appendChild(crumbs);
      var toTop = function (e) { if (cur && !(e.target.closest && e.target.closest('a, button, input, select'))) { e.preventDefault(); popTo(null); } };
      hero.addEventListener('click', toTop);
      hero.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') toTop(e); });
    }
    /* rows of questions: a gold tick once read; rows of chapters: a ring filling up */
    function readRows(level) {
      $$('.av-row', level).forEach(function (a) {
        var k = a._avSrc; if (!k) return;
        var old = $('.rd', a); if (old) old.remove();
        a.classList.remove('is-read');
        if (k.hasAttribute('data-av-qn')) {
          if (KKREAD.has(+k.getAttribute('data-av-qn'))) { a.classList.add('is-read'); a.lastElementChild.insertAdjacentHTML('beforebegin', '<span class="rd rd-full">' + RD_TICK + '</span>'); }
          return;
        }
        var qs = $$('article.qa[data-n]', k);
        if (!qs.length) return;
        var got = qs.filter(function (q) { return KKREAD.has(+q.getAttribute('data-n')); }).length;
        a.lastElementChild.insertAdjacentHTML('beforebegin', rdRing(got, qs.length));
      });
    }
    KKREAD.on(function () { if (cur !== undefined) readRows(cur || main); });
    function trailFor(n) {
      var list = [];
      for (var p = parentOf(parentOf(n)); p; p = parentOf(p)) list.unshift(p);
      crumbs.innerHTML = list.map(function (p) { return '<a href="#' + idOf(p) + '" data-av-pop="' + idOf(p) + '"></a>'; }).join(AV_CHEV);
      $$('a', crumbs).forEach(function (a, i) { pset(a, titleOf(list[i])); });
      crumbs.hidden = !list.length;
      if (!hero) return;
      if (n) { hero.setAttribute('role', 'button'); hero.setAttribute('tabindex', '0'); setAttr2(hero, 'aria-label', AV_TX.tr.top + ': ' + psplit(pageT)[0], AV_TX.en.top + ': ' + psplit(pageT)[1]); }
      else { hero.removeAttribute('role'); hero.removeAttribute('tabindex'); hero.removeAttribute('aria-label'); }
    }
    var navTitle = $('.av-title', nav), backA = $('[data-av-back]', nav), backL = $('[data-av-back-label]', nav);
    var homeBack = { href: backA.getAttribute('href'), label: pstr(backL) };
    /* Came here from another of the site's pages: back goes there, under its name */
    var ref = null;
    try { if (document.referrer && new URL(document.referrer).origin === location.origin) ref = new URL(document.referrer); } catch (e) { /* no URL() */ }
    try { sessionStorage.setItem('avt:' + location.pathname, pageT); } catch (e) { /* private mode */ }
    if (ref && ref.pathname !== location.pathname) {
      var refT = null; try { refT = sessionStorage.getItem('avt:' + ref.pathname); } catch (e) { /* private mode */ }
      if (refT) homeBack.label = refT;
      homeBack.history = window.history.length > 1;
    }

    function nodeOf(el) { var n = el && el.closest ? el.closest('[data-av-node]') : null; return n && main.contains(n) ? n : null; }
    function parentOf(n) { return n ? nodeOf(n.parentElement) : null; }
    function idOf(n) {
      if (!n.id && !n.getAttribute('data-av-id')) n.setAttribute('data-av-id', 'av-' + (++idOf.k));
      return n.id || n.getAttribute('data-av-id');
    }
    idOf.k = 0;
    function titleOf(n) { return n ? (n.getAttribute('data-av-t') || avHead($('h2, h3, summary', n)) || pageT) : pageT; }
    function depthOf(n) { var d = 0; while (n) { d++; n = parentOf(n); } return d; }
    function byId(id) {
      if (!id) return null;
      var el = document.getElementById(id) || $('[data-av-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]', main);
      return el && main.contains(el) ? el : null;
    }

    /* A level's list: a row for each of its items, in their place in the text */
    function rowsFor(level) {
      if (level._avRows) return;
      level._avRows = true;
      var kids = $$('[data-av-node], [data-av-link]', level).filter(function (k) { return nodeOf(k.parentElement) === (level === main ? null : level) && !k.hasAttribute('data-av-norow'); });
      var runs = [], last = null;
      kids.forEach(function (k) {
        if (last && last.end.nextElementSibling === k) last.list.push(k);
        else { last = { list: [k] }; runs.push(last); }
        last.end = k;
      });
      runs.forEach(function (r, i) {
        var box = document.createElement('div');
        box.className = 'av-rows';
        r.list.forEach(function (k) {
          var a = document.createElement('a'), s = k.getAttribute('data-av-s'), out = k.hasAttribute('data-av-link');
          a.className = 'av-row';
          a.href = out ? k.getAttribute('href') : '#' + idOf(k);
          a.innerHTML = '<span class="av-rt"><span class="av-t"></span>' + (s ? '<span class="av-s"></span>' : '') + '</span>' + AV_CHEV;
          pset($('.av-t', a), titleOf(k));
          if (s) pset($('.av-s', a), s);
          a._avSrc = k;
          if (k.hidden) a.hidden = true;
          box.appendChild(a);
        });
        if (level === main && i === 0 && !$('.cmap, [data-av-nogh]', main)) {
          var gh = document.createElement('p'); gh.className = 'av-gh'; pset(gh, T.sections);
          r.list[0].parentNode.insertBefore(gh, r.list[0]);
        }
        r.list[0].parentNode.insertBefore(box, r.list[0]);
      });
    }
    /* a filter elsewhere on the page (the churches' rite) hides some items: so do their rows */
    function syncRows() {
      $$('.av-row', main).forEach(function (a) {
        var k = a._avSrc; if (!k) return;
        a.hidden = !!k.hidden;
        if (k.classList.contains('church-city')) { var n = $$('.church-card', k).filter(function (c) { return !c.hidden; }).length, sEl = $('.av-s', a); if (sEl) pset(sEl, pmake(n + ' ' + AV_TX.tr.church, n + ' ' + (n === 1 ? AV_TX.en.church : AV_TX.en.churches))); }
      });
    }
    var rite = $('#rite-select'); if (rite) rite.addEventListener('change', function () { setTimeout(syncRows, 0); });

    /* ----- which level is on screen */
    var cur = null, scrolls = {};
    function place(n) {
      $$('.av-cur, .av-path', main.parentNode).forEach(function (e) { e.classList.remove('av-cur', 'av-path'); });
      var target = n || main;
      target.classList.add('av-cur');
      if (n) for (var p = n.parentElement; p && p !== main.parentElement; p = p.parentElement) p.classList.add('av-path');
      rowsFor(target);
      if (n && n.tagName === 'DETAILS') n.open = true;
      /* collapsed parts inside the level (a church's Mass times, a day's saints) open */
      $$('details:not([data-av-node]):not(.latin)', target).forEach(function (d) { if (nodeOf(d.parentElement) === n) d.open = true; });
      H.classList.toggle('av-sub', !!n);
      /* a level with no levels under it is read, not chosen from: its heading sits on the left */
      H.classList.toggle('av-leaf', !!n && !$('[data-av-node]', n));
      H.classList.toggle('av-reader', !!(n && n.hasAttribute('data-av-qn')));
      cur = n;
      var par = parentOf(n);
      pset(navTitle, n ? titleOf(n) : pageT);
      pset(backL, n ? (par ? titleOf(par) : pageT) : homeBack.label);
      backA.setAttribute('href', n ? '#' + (par ? idOf(par) : '') : homeBack.href);
      langFor(target);
      trailFor(n);
      readRows(target);
      if (n && n.hasAttribute('data-av-qn')) reader(n);
      setTitle();
    }
    /* the tab's title: the level's name and the page's, in the language shown */
    function setTitle() { document.title = cur ? pnow(titleOf(cur)) + ' | ' + pnow(pageT) : pageT0(); }
    function pageT0() { return document.documentElement.getAttribute(isEn() ? 'data-title-en' : 'data-title-tr') || document.title; }
    (function () {
      var m = $('meta[name="kd-title-en"]');
      if (!H.hasAttribute('data-title-tr')) H.setAttribute('data-title-tr', isEn() && m ? '' : document.title);
      H.setAttribute('data-title-en', m ? m.getAttribute('content') : H.getAttribute('data-title-tr'));
    })();
    document.addEventListener('kd:lang', function () { setTitle(); });
    function keyOf(n) { return n ? idOf(n) : ''; }
    /* Slide the new level in (forward) or back, with the page's icon and title shrinking or
       growing between them; the browser's own back swipe has already shown its picture of the
       level underneath, so that one is put in place at once */
    /* The new level slides in from the side it comes from (the page's own animation, not the
       browser's view transitions: Safari could leave one of those hanging over a blank level) */
    function swap(fn, dir) {
      fn();
      if (still || !dir || !main.animate) return;
      var from = dir === 'fwd' ? '34%' : '-34%';
      var parts = cur ? [cur] : $$(':scope > *', main).filter(function (el) { return el !== hero && !el.classList.contains('av-fixed') && el.offsetHeight; });
      parts.forEach(function (el) {
        try {
          el.animate([{ transform: 'translateX(' + from + ')', opacity: 0 }, { transform: 'none', opacity: 1 }],
            { duration: 380, easing: 'cubic-bezier(.32, .72, 0, 1)' });
        } catch (e) { /* no Web Animations */ }
      });
    }
    function show(n, how, scrollTo) {
      var from = cur;
      scrolls[keyOf(from)] = window.pageYOffset;
      var dir = how === 'none' ? null : (depthOf(n) >= depthOf(from) ? 'fwd' : 'back');
      /* the phone's own swipe back has already shown the level underneath as it was: it is put
         in place as it is, without the icon and title resizing again */
      if (how === 'none') {
        H.classList.add('av-still');
        requestAnimationFrame(function () { requestAnimationFrame(function () { H.classList.remove('av-still'); }); });
      }
      swap(function () {
        place(n);
        var y = scrollTo != null ? scrollTo : (dir === 'back' || how === 'none' ? (scrolls[keyOf(n)] || 0) : 0);
        window.scrollTo(0, y);
        onScroll();
        /* a screen reader carries on from the new level's heading (the page's, back at its list) */
        var h = n ? $('h2, h3, h4, summary, .day-num', n) : $('h1', hero || main);
        if (h && how !== 'none') { if (!h.hasAttribute('tabindex') && h.tagName !== 'SUMMARY') h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      }, dir);
    }
    /* The levels this page's history entries hold, oldest first, so a level further up can be
       reached by going back that many steps at once */
    function trail() { var s = history.state; return s && s.av && s.trail ? s.trail.slice() : [keyOf(cur)]; }
    function popTo(a) {
      var tr = trail(), k = tr.lastIndexOf(keyOf(a));
      if (a === cur) return;
      if (k >= 0 && k < tr.length - 1) { viaButton = true; history.go(k - (tr.length - 1)); }
      else go(a, 'replace');
    }
    function urlFor(n) { return n ? '#' + idOf(n) : location.pathname + location.search; }
    function go(n, how) {
      if (n === cur) return;
      try {
        var tr = trail();
        if (how === 'replace') history.replaceState({ av: 1, pushed: !!(history.state && history.state.pushed), trail: tr.slice(0, -1).concat(keyOf(n)) }, '', urlFor(n));
        else history.pushState({ av: 1, pushed: true, trail: tr.concat(keyOf(n)) }, '', urlFor(n));
      } catch (e) { /* file:// */ }
      show(n, how === 'replace' ? 'back' : 'push');
    }
    function step(n) {
      if (!n || n === cur) return;
      /* into another part, the back button leads to that part's list rather than the history */
      var same = parentOf(n) === parentOf(cur);
      try { history.replaceState({ av: 1, pushed: same && !!(history.state && history.state.pushed), trail: trail().slice(0, -1).concat(keyOf(n)) }, '', urlFor(n)); } catch (e) { /* file:// */ }
      show(n, 'push');
    }
    /* an element anywhere on the page: open the level that holds it, then bring it into view */
    function reveal(el, how) {
      var n = el.hasAttribute('data-av-node') ? el : nodeOf(el);
      /* a section's own heading carries its anchor: that is the section itself */
      if (n && el.id && n.getAttribute('data-av-id') === el.id) el = n;
      if (n !== cur) go(n, how);
      if (el !== n) requestAnimationFrame(function () { requestAnimationFrame(function () {
        var y = el.getBoundingClientRect().top + window.pageYOffset - nav.offsetHeight - 12;
        window.scrollTo(0, Math.max(0, y));
      }); });
    }

    /* the browser's back and forward */
    var viaButton = false;
    window.addEventListener('popstate', function () {
      var n = nodeOf(byId(decodeURIComponent(location.hash.slice(1))));
      /* anything but the page's own back button (a swipe from the edge, the browser's back or
         forward) has already been drawn by the browser: no slide of our own on top of it */
      var native = !viaButton;
      viaButton = false;
      show(n, native ? 'none' : 'pop');
    });
    /* links to a place on this page */
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === '_blank') return;
      if (a === backA) { e.preventDefault(); back(); return; }
      if (a.hasAttribute('data-av-pop')) { e.preventDefault(); popTo(nodeOf(byId(a.getAttribute('data-av-pop')))); return; }
      /* the previous or next section: it takes the place of the one being read, so the back
         button still leads to the list the reader came from, not through every section read */
      if (a.hasAttribute('data-av-step')) { e.preventDefault(); step(nodeOf(byId(a.getAttribute('href').slice(1)))); return; }
      var u; try { u = new URL(a.href, location.href); } catch (err) { return; }
      if (u.origin !== location.origin || u.pathname !== location.pathname || !u.hash) return;
      var el = byId(decodeURIComponent(u.hash.slice(1)));
      if (!el) return;
      e.preventDefault();
      reveal(el, 'push');
    });
    /* a level's collapsed title is its heading here, not a switch */
    document.addEventListener('click', function (e) {
      var s = e.target.closest && e.target.closest('summary');
      if (s && s.parentNode.hasAttribute('data-av-node') && main.contains(s)) e.preventDefault();
    }, true);
    function back() {
      if (cur) {
        if (history.state && history.state.pushed) { viaButton = true; history.back(); }
        else go(parentOf(cur), 'replace');
        return;
      }
      if (homeBack.history) history.back(); else location.href = homeBack.href;
    }
    /* the settings are the header's: opened once this tap has finished, so the panel's own
       "tap outside closes it" doesn't take this tap for one */
    /* The Katekizm's search: the magnifier opens the field across the bar and puts the cursor
       in it in the same tap (so a phone's keyboard comes up); a tap elsewhere folds it away */
    var findBtn = $('.av-find', nav), findBar = $('#av-findbar');
    if (findBtn && findBar) {
      var findIn = $('input', findBar);
      var setFind = function (on) {
        findBar.hidden = false;
        findBtn.setAttribute('aria-expanded', String(on));
        H.classList.toggle('av-finding', on);
        if (on) findIn.focus();
        else { findIn.blur(); setTimeout(function () { if (!H.classList.contains('av-finding')) findBar.hidden = true; }, 320); }
      };
      findBar.hidden = true;
      findBtn.addEventListener('click', function () { setFind(!H.classList.contains('av-finding')); });
      document.addEventListener('click', function (e) { if (H.classList.contains('av-finding') && !findBar.contains(e.target) && !findBtn.contains(e.target)) setFind(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && H.classList.contains('av-finding')) { setFind(false); findBtn.focus(); } });
      /* a result on this page opens its question here */
      findBar.addEventListener('click', function (e) { if (e.target.closest('.sr-item')) setFind(false); });
    }
    $('.av-gear', nav).addEventListener('click', function () { var g = $('.site-header .settings-btn'); if (g) setTimeout(function () { g.click(); }, 0); });

    /* the title in the bar once the page's own has scrolled away */
    function onScroll() {
      var lim = hero ? hero.offsetTop + hero.offsetHeight - nav.offsetHeight : 40;
      H.classList.toggle('av-scrolled', window.pageYOffset > Math.max(8, lim));
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ----- Share: the address of the level being read */
    var toast = $('.av-toast', foot), toastT = null;
    $('.av-share', foot).addEventListener('click', function () {
      var url = location.href, title = document.title;
      if (navigator.share) { navigator.share({ title: title, url: url })['catch'](function () { /* dismissed */ }); return; }
      var done = function () { toast.textContent = pnow(T.copied); clearTimeout(toastT); toastT = setTimeout(function () { toast.textContent = ''; }, 2200); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { /* blocked */ }); else done();
    });

    /* ----- Türkçe / English / Latina: the originals where a level has them, in place of the
       Turkish, remembered from page to page */
    var ORIG_KEY = 'kkio-orig', pref = 'tr';
    try { pref = localStorage.getItem(ORIG_KEY) || 'tr'; } catch (e) { /* private mode */ }
    var LABELS = { tr: LT('Türkçe', 'English'), la: 'Latina' };
    function mine(el, target) { return nodeOf(el) === (target === main ? null : target); }
    function langFor(target) {
      var has = { la: $$('details.latin', target).some(function (x) { return mine(x, target); }) };
      var opts = ['tr'].concat(has.la ? ['la'] : []);
      H.classList.toggle('av-orig', opts.length > 1);
      if (opts.length < 2) { H.removeAttribute('data-orig'); return; }
      var eff = opts.indexOf(pref) >= 0 ? pref : 'tr';
      seg.innerHTML = opts.map(function (o) { return '<button type="button" data-orig="' + o + '" aria-pressed="' + (o === eff) + '"' + (o === 'la' ? ' lang="la"' : '') + '>' + LABELS[o] + '</button>'; }).join('');
      setOrig(eff, target);
    }
    function setOrig(o, target) {
      if (o === 'tr') H.removeAttribute('data-orig'); else H.setAttribute('data-orig', o);
      /* the Latin shows only as Latina: back in Turkish or English it folds away again */
      $$('details.latin', target).forEach(function (d) { d.open = o === 'la'; });
      $$('button', seg).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-orig') === o)); });
    }
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-orig]'); if (!b) return;
      pref = b.getAttribute('data-orig');
      try { localStorage.setItem(ORIG_KEY, pref); } catch (err) { /* private mode */ }
      var target = cur || main;
      main.classList.remove('av-fade'); void main.offsetWidth; main.classList.add('av-fade');
      setOrig(pref, target);
    });

    /* ----- The Katekizm: a question on its own, with Previous / Next under it, a swipe left or
       right for the next or the one before, and a contents button at the bottom right: a slider
       over all 598 and the questions of this chapter. Past the first or the last question of a
       part, the next part's page opens at that question. */
    var KQ_TOTAL = 598, KQ_STARTS = [1, 218, 357, 534];
    function kqUrl(n) { var pi = 0; KQ_STARTS.forEach(function (s, i) { if (n >= s) pi = i; }); return ROOT + PAGES[pi] + '#soru-' + n; }
    function kqGo(n, dir) {
      if (n < 1 || n > KQ_TOTAL) return;
      var el = document.getElementById('soru-' + n);
      if (!el) { location.href = kqUrl(n); return; }
      var same = parentOf(el) === parentOf(cur);
      try { history.replaceState({ av: 1, pushed: same && !!(history.state && history.state.pushed), trail: trail().slice(0, -1).concat('soru-' + n) }, '', '#soru-' + n); } catch (e) { /* file:// */ }
      scrolls[keyOf(cur)] = 0;
      swap(function () { place(el); window.scrollTo(0, 0); onScroll(); }, dir > 0 ? 'next' : 'prev');
    }
    function reader(a) {
      if (!a._avKq) {
        a._avKq = true;
        var n = +a.getAttribute('data-av-qn');
        var top = document.createElement('p'); top.className = 'kq-count av-keepl';
        top.innerHTML = '<span>' + phtml(T.q) + ' ' + n + ' / ' + KQ_TOTAL + '</span><span class="kq-hint">' + phtml(T.swipe) + '</span>';
        a.insertBefore(top, a.firstChild);
        var pager = document.createElement('div'); pager.className = 'kq-pager av-keepl';
        pager.innerHTML = '<button type="button" class="kq-btn" data-kq="-1"' + (n <= 1 ? ' disabled' : '') + '><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg><span>' + phtml(T.prev) + '</span></button>' +
          '<button type="button" class="kq-btn kq-next" data-kq="1"' + (n >= KQ_TOTAL ? ' disabled' : '') + '><span>' + phtml(T.next) + '</span>' + AV_CHEV + '</button>';
        a.appendChild(pager);
      }
      kqTools();
      var qn = +a.getAttribute('data-av-qn');
      clearTimeout(reader.t);
      if (!KKREAD.has(qn)) reader.t = setTimeout(function () { if (cur === a) { KKREAD.mark(qn); readMark(a); } }, 3000);
      readMark(a);
    }
    /* the question's own line: "Okundu" with a tick once it has been read */
    function readMark(a) {
      var top = $('.kq-count', a); if (!top) return;
      var had = $('.kq-read', top), on = KKREAD.has(+a.getAttribute('data-av-qn'));
      if (on && !had) top.insertAdjacentHTML('beforeend', '<span class="kq-read">' + RD_TICK + '<span>' + LT('Okundu', 'Read') + '</span></span>');
      else if (!on && had) had.remove();
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-kq]');
      if (!b || !cur) return;
      var d = +b.getAttribute('data-kq');
      if (d > 0) KKREAD.mark(+cur.getAttribute('data-av-qn'));
      kqGo(+cur.getAttribute('data-av-qn') + d, d);
    });
    /* a swipe across the question (not from the edge, which is the browser's back) */
    var rs = null;
    document.addEventListener('touchstart', function (e) {
      rs = null;
      var t = e.touches[0];
      if (!cur || !cur.hasAttribute('data-av-qn') || t.clientX < 40 || e.touches.length > 1 || !cur.contains(e.target)) return;
      rs = { x: t.clientX, y: t.clientY, t0: Date.now(), live: false, dx: 0 };
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      if (!rs) return;
      var t = e.touches[0], dx = t.clientX - rs.x, dy = t.clientY - rs.y;
      if (!rs.live) { if (Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) { rs = null; return; } if (Math.abs(dx) < 12) return; rs.live = true; }
      rs.dx = dx;
      cur.style.transition = 'none'; cur.style.transform = 'translateX(' + dx * 0.5 + 'px)'; cur.style.opacity = String(1 - Math.min(0.4, Math.abs(dx) / 800));
    }, { passive: true });
    document.addEventListener('touchend', function () {
      var r0 = rs; rs = null;
      if (!r0 || !r0.live || !cur) return;
      var el = cur, n = +el.getAttribute('data-av-qn'), dir = r0.dx < 0 ? 1 : -1;
      var fast = Math.abs(r0.dx) / Math.max(1, Date.now() - r0.t0) > 0.45;
      el.style.transition = 'transform .25s, opacity .25s'; el.style.transform = ''; el.style.opacity = '';
      setTimeout(function () { el.style.transition = ''; }, 260);
      if ((Math.abs(r0.dx) > 70 || (fast && Math.abs(r0.dx) > 30)) && n + dir >= 1 && n + dir <= KQ_TOTAL) kqGo(n + dir, dir);
    });
    var kq = null;
    function kqTools() {
      if (kq) return;
      var fab = document.createElement('button');
      fab.type = 'button'; fab.className = 'kq-fab av-kq-fab'; setAttr2(fab, 'aria-label', AV_TX.tr.toc, AV_TX.en.toc); fab.setAttribute('aria-haspopup', 'dialog');
      fab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.1" fill="currentColor" stroke="none"/></svg>';
      var sh = document.createElement('div');
      sh.className = 'kq-sheet av-kq-sheet'; sh.hidden = true;
      sh.innerHTML = '<div class="kq-sheet-bg" data-kq-close></div><div class="kq-sheet-panel" role="dialog" aria-modal="true" aria-label="' + esc(pnow(T.toc)) + '" data-tr-aria-label="' + AV_TX.tr.toc + '" data-en-aria-label="' + AV_TX.en.toc + '">' +
        '<div class="kq-grab" aria-hidden="true"></div><div class="kq-sheet-head"><p class="kq-sheet-t">' + phtml(T.toc) + '</p><button type="button" class="ios-done" data-kq-close>' + phtml(T.done) + '</button></div>' +
        '<div class="kq-slider"><p class="kq-slider-l"></p><input type="range" min="1" max="' + KQ_TOTAL + '" step="1" aria-label="' + esc(pnow(T.q)) + '" data-tr-aria-label="' + AV_TX.tr.q + '" data-en-aria-label="' + AV_TX.en.q + '"><p class="kq-slider-q"></p></div>' +
        '<div class="kq-sheet-scroll"><p class="av-gh kq-sheet-gh"></p><div class="av-rows kq-sheet-list"></div></div></div>';
      document.body.appendChild(fab); document.body.appendChild(sh);
      var range = $('input', sh), lab = $('.kq-slider-l', sh), qt = $('.kq-slider-q', sh);
      function label() {
        var n = +range.value, el = document.getElementById('soru-' + n);
        lab.innerHTML = phtml(T.q) + ' ' + n + ' / ' + KQ_TOTAL;
        pset(qt, el ? avText($('.qa-q', el)) : '');
      }
      function openSheet(on) {
        if (!on) { sh.classList.remove('is-open'); setTimeout(function () { if (!sh.classList.contains('is-open')) sh.hidden = true; }, 260); fab.focus({ preventScroll: true }); return; }
        var n = +cur.getAttribute('data-av-qn'), par = parentOf(cur);
        range.value = n; label();
        pset($('.kq-sheet-gh', sh), par ? titleOf(par) : pageT);
        var list = $('.kq-sheet-list', sh);
        list.innerHTML = '';
        $$('[data-av-qn]', par || main).filter(function (q) { return parentOf(q) === par; }).forEach(function (q) {
          var b = document.createElement('button'), here = q === cur;
          b.type = 'button'; b.className = 'av-row' + (here ? ' is-here' : ''); b.setAttribute('data-kq-go', q.getAttribute('data-av-qn'));
          if (here) b.setAttribute('aria-current', 'true');
          b.innerHTML = '<span class="av-rt"><span class="av-t"></span></span>';
          pset($('.av-t', b), titleOf(q));
          list.appendChild(b);
        });
        sh.hidden = false;
        requestAnimationFrame(function () {
          sh.classList.add('is-open');
          var sc = $('.kq-sheet-scroll', sh), h = $('.is-here', sh);
          if (h) sc.scrollTop = Math.max(0, h.offsetTop - sc.clientHeight / 2 + h.offsetHeight / 2);
        });
        setTimeout(function () { range.focus({ preventScroll: true }); }, 60);
      }
      range.addEventListener('input', label);
      range.addEventListener('change', function () { var n = +range.value, c = +cur.getAttribute('data-av-qn'); openSheet(false); if (n !== c) kqGo(n, n > c ? 1 : -1); });
      fab.addEventListener('click', function () { openSheet(true); });
      sh.addEventListener('click', function (e) {
        if (e.target.closest('[data-kq-close]')) { openSheet(false); return; }
        var g = e.target.closest('[data-kq-go]');
        if (g) { var n = +g.getAttribute('data-kq-go'), c = +cur.getAttribute('data-av-qn'); openSheet(false); if (n !== c) kqGo(n, n > c ? 1 : -1); }
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sh.hidden) openSheet(false); });
      kq = { fab: fab, sheet: sh };
    }

    /* ----- start: at the level the address points to */
    var start = byId(decodeURIComponent(location.hash.slice(1)));
    /* the hero takes its size at once on load; after that every change of level resizes it */
    H.classList.add('av-still');
    requestAnimationFrame(function () { requestAnimationFrame(function () { H.classList.remove('av-still'); }); });
    place(null);
    if (start) {
      var sn = start.hasAttribute('data-av-node') ? start : nodeOf(start);
      if (sn && start.id && sn.getAttribute('data-av-id') === start.id) start = sn;
      place(sn);
      /* a reload keeps the entry's own record of the levels before it */
      var st0 = history.state;
      if (!(st0 && st0.av && st0.trail && st0.trail[st0.trail.length - 1] === keyOf(sn))) {
        try { history.replaceState({ av: 1, pushed: false, trail: [keyOf(sn)] }, '', location.href); } catch (e) { /* file:// */ }
      }
      /* the browser jumps to the #anchor itself as the page finishes loading: after that, put
         the level at its top (or the linked element under the bar) */
      var settle = function () { if (start !== sn) reveal(start, 'none'); else window.scrollTo(0, 0); onScroll(); };
      settle();
      if (document.readyState !== 'complete') window.addEventListener('load', function () { requestAnimationFrame(settle); }, { once: true });
      else requestAnimationFrame(settle);
    }
    onScroll();
    H.classList.add('av-ready');
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
      select.value = rite;
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

    /* Phones' app view lists every city, and opens the one an address points to by itself */
    if (document.documentElement.classList.contains('av')) return;
    showOnlyCity('istanbul');
    markCurrentCity('istanbul');
    /* Arriving at a city or a church (from the home screen's Kilise Bul, say): open that city */
    var hashEl = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    var hashCity = hashEl && (hashEl.classList.contains('church-city') ? hashEl : hashEl.closest && hashEl.closest('.church-city'));
    if (hashCity) { goToCity(hashCity.id); requestAnimationFrame(function () { hashEl.scrollIntoView(); }); }
  }

  /* ---------------------------------------------------------------
     Neden Katoliğiz? / Why We're Catholic: every topic is a one-line
     hook that opens in place. A link to a topic (#ince-ayar, say)
     opens it and brings it into view; the phone view does its own.
     --------------------------------------------------------------- */
  function initWhyHooks() {
    var wrap = $('.why-wrap');
    if (!wrap || document.documentElement.classList.contains('av')) return;
    function openHash() {
      var id = decodeURIComponent(location.hash.slice(1)), el = id && document.getElementById(id);
      if (!el || !wrap.contains(el) || !el.classList.contains('why-item')) return;
      el.open = true;
      requestAnimationFrame(function () { el.scrollIntoView({ block: 'start' }); });
    }
    window.addEventListener('hashchange', openHash);
    openHash();
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
      /* only the language the TR | EN switch is showing */
      $$(isEn() ? '.l-tr' : '.l-en', clone).forEach(function (n) { n.remove(); });
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
    var header = topBar();
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

  /* The bar at the top of the screen: the site's header, or on phones the app view's own bar */
  function topBar() { return $(document.documentElement.classList.contains('av') ? '.av-nav' : '.site-header'); }
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    initFrameBust(); initLang(); initHeaderHeight(); initTheme(); initFontSize(); initEmail(); initNavToday();
    initSearch(); initReader(); initDrawer(); initNav(); initSources(); initRosary(); initRosaryTracker(); initAnatoliaMap(); initSaints(); initMass(); initHome(); initPrintExpand();
    initChurchFilter(); initStickyToc(); initWhyHooks(); initMapLinks(); initA11y(); initAppView(); initReadMarks(); initToTop(); initChurchMap(); initLayoutSwitch();
  });
})();
