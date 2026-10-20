// Every built page of the Turkish site in a browser, on a desktop and a phone screen: script errors,
// files that fail to load, sideways overflow and a page not marked lang="tr". Serve the repository
// root first (python3 -m http.server 8775), then: node tools/qa/runtime.js [port]  (needs playwright)
// Turnstile refuses localhost, so the contact form's widget error there is expected and skipped.
const { chromium } = require('playwright');
const fs = require('fs');
const port = process.argv[2] || '8775', base = 'http://localhost:' + port + '/';
const files = [...fs.readdirSync('.').filter(f => f.endsWith('.html')), ...fs.readdirSync('kilise').filter(f => f.endsWith('.html')).map(f => 'kilise/' + f)];
(async () => {
  const b = await chromium.launch();
  const issues = [];
  for (const [vn, vp] of [['desktop', { viewport: { width: 1366, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]) {
    const ctx = await b.newContext({ ...vp, locale: 'tr-TR' }); const q = files.slice();
    await Promise.all(Array.from({ length: 4 }, async () => { while (q.length) { const f = q.shift(); const p = await ctx.newPage(); const errs = [], bad = [];
      p.on('pageerror', e => { if (!/Turnstile/.test(e.message)) errs.push(e.message.slice(0, 150)); });
      p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|Turnstile/.test(m.text())) errs.push(m.text().slice(0, 150)); });
      p.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400 && !r.url().endsWith('/404.html')) bad.push(r.status() + ' ' + r.url().slice(base.length)); });
      try {
        await p.goto(base + f, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(500);
        // scroll through, so pages that grow as they are read load all of their parts
        await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 1500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } });
        const r = await p.evaluate(() => ({ over: document.documentElement.scrollWidth - document.documentElement.clientWidth, lang: document.documentElement.lang }));
        if (r.over > 1) issues.push(vn + ' OVERFLOW ' + r.over + 'px ' + f);
        if (r.lang !== 'tr') issues.push(vn + ' LANG ' + r.lang + ' ' + f);
      } catch (e) { issues.push(vn + ' ERR ' + f + ' ' + e.message.slice(0, 80)); }
      if (errs.length) issues.push(vn + ' JS ' + f + ' ' + errs.join(' | '));
      if (bad.length) issues.push(vn + ' HTTP ' + f + ' ' + bad.slice(0, 3).join(' | '));
      await p.close(); } }));
    await ctx.close();
  }
  console.log(files.length + ' pages: ' + (issues.length ? '\n' + issues.join('\n') : 'no issues'));
  await b.close();
})();
