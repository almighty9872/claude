# English site: Verbum Domini (verbumdomini.ca)

Handoff notes for whoever works on the English site. The Turkish site (katolikdunyasi.com) is handled separately; don't change Turkish text from the English workstream.

## Ground rules

- Never commit, push or deploy without the owner's explicit "commit and deploy".
- No em dashes anywhere (content, commits, PRs).
- The owner's name and email never appear in the repo, commits, PRs or pages.
- Secrets (Cloudflare API token, Turnstile secret key) go into GitHub secrets by the owner. Never ask for them in chat and never write them to files.
- Don't use Wikimedia for new images.
- English should read like it was written in English: direct, plain, not "translated", not AI-sounding.
- The live katolikdunyasi.com stays Turkish-only. Its Catechism pages still have an English toggle.

## How it's built

Both sites come from the same source. Every bilingual field has a Turkish and an English value (`xxx` / `xxxEn` in `data/*.js|json`, `content/*-en.md` for the English Markdown pages). `T(tr,en)` in `tools/build.ps1` renders the pair; an empty English value falls back to Turkish, so never blank an English field.

```
pwsh -NoProfile -File ./tools/build.ps1                 # Turkish site (what main deploys)
pwsh -NoProfile -File ./tools/build.ps1 -EnglishSite    # English site -> _site_en/ (gitignored)
```

`-EnglishSite` also writes `en/` twins into the working tree. After an English build, run `rm -rf en` and rebuild the Turkish site so the tree is back to its committed state.

What `-EnglishSite` does (the block before `Write-Host "Done."` in build.ps1):
- copies the `en/*.html` twins to the root of `_site_en/` and strips the Turkish halves
- removes the language pill and sets `data-en-base=""`
- rewrites `https://katolikdunyasi.com/en/` to `https://verbumdomini.ca/` and `/en/` links to `/`
- drops pages not offered in English (Find a Church and the church pages, Christianity in Our Lands): menu items are removed, links in running text are unwrapped
- swaps the brand to "Verbum Domini" (font `assets/fonts/kd-brand-en.woff2`), and replaces the text "katolikdunyasi.com" with "Verbum Domini" except in hreflang lines and in "and katolikdunyasi.com"
- writes its own sitemap, robots.txt, llms.txt and site.webmanifest
- `$EnSiteUrl = 'https://verbumdomini.ca'`, `$EnTagline = 'Spreading and defending the Gospel'`

Brand-neutral writing: in shared text (footer, Sources page), write "katolikdunyasi.com" and let the English build swap it, so each site names itself.

## Tools

- `tools/en-rewrite/`: edit English fields in data files without touching Turkish.
  - `python3 tools/en-rewrite/dump.py data/sss.js` prints every English field with its path.
  - `apply.py <file> <patch.json>`: patch is `{ "/path": "new text" }`; replaces whole fields, refuses empty values and em dashes.
  - `sub.py <file> <patch.json>`: patch is `[[path, old, new], ...]`; replaces one unique substring in a field.
  - `data/tespih.js` doesn't round-trip; edit it with plain string replacement.
- `tools/yahudilere-cagri/`: `data/yahudilere-cagri.js` is generated. Turkish text lives in `gen.py`, English in `en.py`, auto-links in `linker.py`. Edit those, then `python3 tools/yahudilere-cagri/gen.py data/yahudilere-cagri.js`.
- `tools/qa/links.py _site_en`: internal link and anchor check (expects `total bad 0`).
- `tools/qa/runtime.js <dir>`: Playwright run of every page on desktop and phone; reports JS errors, horizontal overflow and possible Turkish leaks. Serve the folder on port 8772 first (`python3 -m http.server 8772`). Needs the `playwright` package. The leak check has false positives; read them.
- HTML validation: `npx --yes html-validate@9 --config .htmlvalidate.json "_site_en/*.html"`.

## Status

Done:
1. English gaps filled; every page has English.
2. Build split (`-EnglishSite`), 48 pages, valid HTML, no broken links, no JS errors.
3. Native-English rewrite of interface, homepage, guides, Bible guide, Mass, Rosary, debate pages, the 20 great saints, Privacy and Accessibility. The 365-day saint calendar was only spot-checked.

Next:
4. Deploy a preview to workers.dev with Cloudflare Workers static assets. Needs the owner to add the verbumdomini.ca zone in Cloudflare and a Workers API token as a GitHub secret. Add a separate workflow that runs `build.ps1 -EnglishSite` and deploys `_site_en/`.
5. At cutover:
   - Point verbumdomini.ca at the Worker.
   - Repoint the old katolikdunyasi.com `/en/...` redirects (Cloudflare bulk redirects CSV) to verbumdomini.ca.
   - Make the Turkish site's hreflang point to verbumdomini.ca and stop shipping `en/` on the Turkish site, except the 8 Catechism English pages, which move to the English site.
   - Turn off GitHub Pages only if the Turkish site also moves to Cloudflare.
