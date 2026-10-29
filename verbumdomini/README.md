# Verbum Domini (verbumdomini.ca)

The English Catholic site, https://verbumdomini.ca. Everything it is built from lives in this
folder; nothing here is shared with the Turkish site (katolikdunyasi.com), which is the rest of the
repository (`almighty9872/katolikdunyasi`). The folder was copied from the shared source on
8 October 2026, and the two sites have evolved separately since.

## Build and check

Run from the repository root:

```
pwsh -NoProfile -File ./verbumdomini/tools/build.ps1 -EnglishSite   # builds verbumdomini/_site_en/
npx --yes html-validate@9 --config verbumdomini/.htmlvalidate.json "verbumdomini/_site_en/*.html"
python3 verbumdomini/tools/qa/links.py verbumdomini/_site_en          # expects "total bad 0"
```

The build needs PowerShell 7 and Python 3 (esbuild is optional; it minifies the CSS and JS).
`_site_en/` is build output and is not kept in git.

## Deploy

A push to `main` that changes this folder runs `.github/workflows/deploy-english.yml`: it builds
the site, validates the HTML, checks the links, then publishes `_site_en/` with Wrangler to two
Cloudflare Workers. It can also be started by hand from the Actions tab.

- `verbumdomini` serves the site on verbumdomini.ca (`cloudflare/wrangler.jsonc`, `worker.js`) and
  answers the contact form at `/api/contact` (`contact.js`: trap field, Turnstile, then mail through
  Cloudflare Email Routing).
- `verbumdomini-www` redirects www.verbumdomini.ca to verbumdomini.ca (`cloudflare/www.jsonc`,
  `www-redirect.js`).

The workflow uses the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The
contact form's `TO_ADDRESS` and `TURNSTILE_SECRET` are Worker secrets set in the Cloudflare
dashboard, never in the repository.

## Folder layout

```
data/           Page content (the English halves are what this site uses)
content/        Markdown pages: Bible guide, privacy, accessibility, sources (*-en.md) and the glossary
assets/         styles.css, script.js, fonts, paintings (art/) and the Rosary's 3D beads (vendor/)
tools/          build.ps1, en-rewrite/ (edit English fields), en-site/ (glossary, strip_tr.py),
                yahudilere-cagri/ (generates that page's data), qa/ (link and runtime checks)
cloudflare/     The Workers' code and config
CNAME           Read by the build for its base URL; the English pages use https://verbumdomini.ca
```

The copied build still carries bilingual pairs (`xxx` / `xxxEn`, `content/*-en.md`);
`-EnglishSite` keeps the English and `strip_tr.py` empties the Turkish from the output.

Rules, tools and status for the English site: `docs/english-site.md`. Rules for both sites:
`CLAUDE.md` at the repository root.
