# katolikdunyasi.com

A static, primarily Turkish-language Catholic resource site, with a growing English section. It includes a full translation of the **Compendium of the Catechism of the Catholic Church** (Libreria Editrice Vaticana, 2005; all 598 questions and answers, the Motu Proprio, the Introduction, both Creeds, the Decalogue table, the Our Father, and the full Appendix), plus original Turkish sections making the case for the Catholic faith, the OCIA/RCIA process for becoming Catholic, how Confession works, the Mass explained step by step, the parables of Jesus explained plainly, the Rosary and common prayers, a calendar of the saints, a guide to the Bible in Turkish, well-known Catholic miracles, Christianity's roots in Anatolia, frequently asked questions, and a directory of active Catholic churches in Turkey.

The site uses plain HTML, CSS and JavaScript. It loads no libraries and makes no CDN requests; the EB Garamond font (and Lexend, used only when a visitor turns on the dyslexia-friendly font) is self-hosted in `assets/fonts/`. You can open `index.html` straight from disk, or upload the folder to any static host.

The site makes no outside network calls and never asks for the visitor's location. The full-menu overlay (opened from the header's hamburger icon) shows the day's liturgical season with a disc in the colour the priest wears (green, violet, white, red or rose), worked out in the browser from the date alone by `assets/script.js`'s `liturgicalDay()`, alongside the day's Rosary mystery and saint.

## English section (`/en/`)

The main site is Turkish by default. A parallel `en/` directory (e.g. `en/saints.html` for `azizler.html`) carries English pages under their own English slugs, built from the same `data/*.js` files via `-Lang 'en'` calls in `tools/build.ps1`; TR/EN filename pairs are declared explicitly in `$EnAltMap` near the top of the script (`Add-EnAlt 'azizler.html' 'saints.html'`, etc.), which drives the header/footer language switcher (SVG flag icons) and the `hreflang` alternate tags on every page. The Compendium's English pages (`en/compendium.html`, `en/profession-of-faith.html`, etc.) show the original English Compendium text as the primary language, with a "Türkçesi" toggle per question, mirroring the Turkish pages' "English" toggle in reverse. Fully translated so far: the homepage, Compendium, FAQ, Confession, Becoming Catholic, Find a Church, Why We're Catholic, the Mass, the Rosary, the Parables of Jesus, the Bible guide, Miracles, Christianity in Anatolia, Contact, Accessibility, and the Privacy Policy. `en/saints.html` is a partial hub (translated intro, calendar and saint biographies still Turkish-only, linked back clearly). The rest of the site (the 365-day saint calendar entries and the 20 saint biographies) remains Turkish-only for now and is queued for future translation.

## Folder layout

```
index.html              Home: search box, section cards, today's saint
neden-katoligiz.html    Why we're Catholic: a five-step case for the faith, reason to doctrine, one step
                        at a time (a skeptic's question, short answer, key points, objection per card)
iman-ikrari.html        Compendium Part I · Q 1–217   (reading page: sticky contents sidebar, chapter
kutsal-sirlar.html      Compendium Part II · Q 218–356  prev/next, "English" button per question +
mesihte-yasam.html      Compendium Part III · Q 357–533 "show all English")
hristiyan-duasi.html    Compendium Part IV · Q 534–598
motu-proprio.html       Motu Proprio (Turkish, English paragraph by paragraph on demand)
giris.html              Introduction (same)
ekler.html              Appendix: prayers (TR/EN/LA) + formulas of Catholic doctrine
katolik-sureci.html     Becoming Catholic: the OCIA/RCIA process
gunah-cikarma.html      Confession: how it works step by step, an examination-of-conscience
                        checklist, and common first-timer fears/questions
kutsal-ayin.html        The Mass, part by part
meseller.html           The parables of Jesus, retold and explained plainly, by theme
tesbih-duasi.html       The Rosary: an interactive 59-bead SVG tracker (tap a bead or press Next;
                        prayer text in a bottom sheet, mystery of the day preselected, vibration
                        feedback on phones), then the prayers and the four sets of mysteries
azizler.html            Calendar of the saints (current month shown, other months a click away),
                        plus a "20 best-known saints" list, each linking to its own page below
<saint-id>.html         One page per saint in the "20 best-known" list (e.g. meryem-ana.html),
                        a long original Turkish biography
kutsal-kitap.html       Guide to reading the Bible in Turkish (approved translations, sources)
mucizeler.html          Catholic miracles: apparitions, relics, Eucharistic miracles, incorrupt saints
topraklarimizda-hristiyanlik.html  Christianity's roots in Anatolia: an interactive SVG map of 24
                        places (hover for a card that follows the pointer, click to pin it),
                        then Paul's homeland, the Seven Churches, Nicaea, the Church Fathers
sss.html                Frequently asked questions, grouped by topic
kiliseler.html          Parish locator: active Catholic churches in Turkey, grouped by city
iletisim.html           Contact page (email)
404.html                "Page not found" page (GitHub Pages serves it for unknown URLs)
sitemap.xml, robots.txt
assets/styles.css       All styling, hand-edited. Theme tokens at the top: dark = navy/gold, light = ivory/gold
assets/script.js        Theme, clock, English reveal, search, reading bar, contents drawer, widgets
assets/styles.min.css   ← generated by build.ps1 from styles.css; the file pages actually load
assets/script.min.js    ← generated by build.ps1 from script.js; the file pages actually load
assets/fonts/           EB Garamond and Lexend .woff2 files (both SIL Open Font License; OFL.txt, OFL-Lexend.txt)
assets/og-image.jpg     1200×630 social preview image
data/compendium-1..4.js ← Compendium content (Turkish + English pairs), one file per part
data/extras.js          ← Motu Proprio, Introduction, Creeds, Decalogue, Our Father, Appendix
data/katolik-sureci.js  ← OCIA/RCIA process content
data/gunah-cikarma.js   ← Confession guide content
data/kutsal-ayin.js     ← The Mass content
data/meseller.js        ← The parables of Jesus (six thematic categories)
data/tespih.js          ← Rosary prayers and mysteries
data/azizler.js         ← Saints calendar (one entry per day)
data/buyuk-azizler.js   ← The 20 best-known saints: long original biography per saint, one page each
data/sss.js             ← FAQ content
data/mucizeler.js       ← Catholic miracles (four thematic categories)
data/topraklarimizda-hristiyanlik.js ← Christianity's roots in Anatolia content
data/anadolu-haritasi.js  ← The Anatolian Roots map's places: coordinates, history, Scripture references
data/anadolu-harita-sekli.js ← The map's outline (generated from Natural Earth, public domain; don't edit)
data/neden-katoligiz.js ← "Why we're Catholic" content
data/azizler-adlar.js   ← Generated by the build: just each day's saint name, for the today's-saint pill
data/kiliseler.js       ← Parish locator: churches in Turkey by city and rite
content/kutsal-kitap.md ← Bible guide text (Markdown)
content/hakkinda.md     ← Footer text: the one-line "about" sentence and the "Kaynaklar ve telif" (sources and copyright) dialog (Markdown; -en.md for English)
tools/build.ps1         Regenerates the static pages from data/ and content/
tools/anadolu-harita-sekli.mjs  Regenerates the map outline (Node; only if the map frame should change)
.github/workflows/deploy.yml  Builds and publishes the site on every push to main
CNAME                   Your domain (one line). Also used for canonical/sitemap URLs
```

Search works on every page: it loads the four data files the first time someone uses it, then searches the Turkish and English text, or jumps straight to a question number. `index.html?q=...` opens the home page with a search already filled in.

## Editing content

1. Edit the text in `data/compendium-N.js` or `data/extras.js`. The format is described at the top of each file. A Q&A entry looks like this:
   ```js
   { "type": "qa", "n": 16, "id": "soru-16", "ccc": "85–90, 100",
     "tr": { "q": "…", "a": "… [[Petrus'un|Peter]] ardılı …" },
     "en": { "q": "…", "a": "…" } }
   ```
   - `[[Türkçe|English]]` marks a name that is spelled differently in Turkish. It is displayed as "Petrus'un (Peter)".
   - In an answer, `\n` starts a new paragraph, and a line that starts with `- ` becomes a bullet point.
   - Keep the text between the `/*JSON-START*/` and `/*JSON-END*/` markers as strict JSON: use double quotes and no trailing commas.
2. Rebuild the static pages:
   ```
   powershell -ExecutionPolicy Bypass -File tools\build.ps1
   ```
   On macOS or Linux, run `pwsh tools/build.ps1` instead. The build takes about one second. On GitHub this happens automatically on every push (see below).

Search reads the data files at runtime, so edits show up in search results immediately. The pages themselves are pre-rendered for search engines, so they need the build.

**Domain:** the build reads your domain from the `CNAME` file (one line, e.g. `ornekalan.com`) and uses `https://<that domain>` for canonical, Open Graph and sitemap URLs. The file currently holds the placeholder `alanadiniz.com`, so the build prints a warning and falls back to `https://www.example.com` until you replace it.

## Mobile tab bar

Below 980px wide, every page has a glass tab bar pinned to the bottom of the screen. Pages with sections of their own show four of them plus "Diğer" (a drawer with the rest of the page and the site's core pages); every other page shows the five core destinations (Neden?, Tarih, Katekizm, Kiliseler, Sorular). Which page gets which items is set in `tools/build.ps1`, in `$TbSets` (the item lists, Turkish and English labels, icons) and `$TbPages` (which Turkish page uses which set; English pages follow through `$EnAltMap`). An in-page item is an `#id` that exists on both languages' pages; `he` overrides it for English when the ids differ. In Markdown content, `## Heading {#id}` gives a heading that id.

## Editing the sources and copyright text

Edit `content/hakkinda.md` (and `content/hakkinda-en.md` for the English pages). On github.com, open the file, click the pencil icon and commit. The workflow rebuilds every page in about a minute, since the text appears in each page's footer. In the top block (between the `---` lines), `title` is the footer link and dialog heading, and `about` is the one-line sentence under the site name in the footer. The rest is Markdown, shown in the "Kaynaklar ve telif" dialog:

| Write | Result |
|---|---|
| `## Heading` / `### Smaller heading` | section headings |
| blank line between lines | new paragraph |
| `**bold**`, `*italic*` | **bold**, *italic* |
| `[link text](https://…)` | link |
| `- item` or `1. item` | bullet / numbered list |
| `> text` | highlighted quote |
| `---` | divider line |

Raw HTML is shown as plain text, so the page can't be broken by accident.

## Publishing on GitHub Pages with your Cloudflare domain

**1. Put the files in the repository.** The *contents* of this folder go at the root of the repository, so `index.html` is at the top level. Include the hidden files (`.github/`, `.nojekyll`, `.gitignore`, `.gitattributes`). The branch must be called `main`.
- With GitHub Desktop or git: add everything, commit, push.
- In the browser: repository → **Add file → Upload files**, drag in everything *inside* this folder (not the folder itself), then commit.

**2. Turn on Pages (one time).** Repository → **Settings → Pages → Build and deployment → Source: "GitHub Actions"**. Pushing now runs the workflow; watch it under the **Actions** tab (a green tick means it's live).

**3. Set your domain.**
- Put your domain in `CNAME` (e.g. `ornekalan.com` or `www.ornekalan.com`) and commit.
- Settings → Pages → **Custom domain**: enter the same domain → Save. (With Actions deployments, this setting, not the CNAME file, is what GitHub uses for serving; the file feeds the build.)

**4. Cloudflare DNS** (Cloudflare → your domain → DNS → Records). Keep your existing GitHub verification TXT record.
- Apex domain (`ornekalan.com`): four **A** records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Optional **AAAA** records for `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.
- `www`: a **CNAME** record `www` → `<your-github-username>.github.io`. GitHub then redirects between www and the apex automatically.
- Set these records to **DNS only** (grey cloud) at first, so GitHub can issue its HTTPS certificate.

**5. HTTPS.** Once Settings → Pages shows the DNS check passed and the certificate is ready (minutes to a few hours), tick **Enforce HTTPS**. After that you may switch the Cloudflare records to **Proxied** (orange cloud) if you want Cloudflare's CDN. If you do, set Cloudflare **SSL/TLS mode to "Full (strict)"**. Never use "Flexible", which causes a redirect loop.

**Updating later:** edit `data/*.js`, `content/hakkinda.md` or the assets, then commit. The workflow rebuilds and republishes. You don't need to run `tools/build.ps1` yourself (only for previewing locally).

## Translation conventions

- **Terminology** follows Turkish Catholic usage: Kutsal Sır (sacrament), Efkaristiya, Konfirmasyon, Tövbe ve Barışma, Kutsal Üçlü, Havari, Öğretim Makamı (Magisterium), Araf, Kutsal Ayin (Missa), and so on.
- **Names:** when a name is spelled differently in Turkish, the first mention in each card shows the Turkish form followed by the English in parentheses, e.g. Petrus (Peter), Aziz Augustinus (Saint Augustine), İznik (Nicaea), Kadıköy (Kalkedon) (Chalcedon). İsa (Jesus) and Meryem (Mary) appear on almost every card, so they are not glossed each time. The footer explains this.
- **Scripture:** citations keep the Catholic canon and the verse numbering of the Vatican source. That includes the Deuterocanonical books (e.g. 2 Makabeler 7:28, Bilgelik, Sirak) and the Catholic Psalm verse numbering (e.g. Mezmurlar 51:19). Book names are in Turkish.
- **Source corrections:** a few errors in the Vatican page were fixed, and each fix is marked:
  - Q420: "Galatians 1:25" becomes James 1:25. There is an editor's note on the card.
  - Q39: the CCC reference "2112–213" becomes 212–213.
  - Introduction footnote: "Laetarum magnopere" becomes *Laetamur magnopere*.
- **Q469 (death penalty):** the card translates the 2005 text faithfully and adds an editor's note about Pope Francis' 2018 revision of CCC 2267.

## Notes before publishing

- This is an **unofficial translation**. The original text is © Libreria Editrice Vaticana, and publishing a translation publicly normally requires LEV's permission. You may also want a Turkish Catholic reviewer (for example, someone connected to the Episcopal Conference of Türkiye) to check the terminology before launch.
- Serve the files with gzip or brotli. Most hosts do this automatically. With compression, the largest page (Part 1) is about 110 KB.

## Contact

Translation corrections, content suggestions and general feedback are welcome at **david@katolikdunyasi.com**, or through the site's own [İletişim page](https://katolikdunyasi.com/iletisim.html).
