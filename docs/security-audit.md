# Security, performance and quality audit (closed)

Audit of the whole repo on 2026-10-29: the Turkish site katolikdunyasi.com (everything outside
`verbumdomini/`) and the English site verbumdomini.ca (`verbumdomini/`), against live production
(157 pages from both sitemaps, live headers) plus every source file, workflow and Worker.
All findings are fixed, verified live, or closed by decision. The owner's dashboard and GitHub
steps are in `docs/owner-steps.md`.

## Fixed in the repo (deployed and verified live)

| ID | Fix | Commits |
|---|---|---|
| H1 | Open redirect closed: `worker.js` collapses repeated slashes and only changes the path of the request's own URL | `3528410` |
| H2 | CI: exact npm versions, English deploy split into `build` and `publish` (token only in publish), Turkish deploy rights only in the deploy job. With M4: actions pinned to commit SHAs, `persist-credentials: false`, timeouts | `3528410`, `22f7a5b` |
| M1, M6 | verbumdomini.ca security headers via `_headers` (written by `verbumdomini/tools/build.ps1`) and `secure()` in `worker.js`; caching (CSS/JS/data/vendor 1y immutable, art/fonts 30d, HTML max-age=0) | `3528410` |
| M3 | CSP `script-src` uses SHA-256 hashes of inline scripts (`Pin-InlineScripts` in both builds), no `'unsafe-inline'` | `8fb8f64`, `a900f1c` |
| M5 | `hashId()` helper; each `init*` in its own try/catch | `8fb8f64`, `a900f1c` |
| M7 | AVIF (q55) and WebP (q78) next to every top-level painting, made in CI before the build (the step fails if one is missing); `Art-Img` writes `<picture>`; `picture { display: contents }`; the 21 `rd-*-2560.jpg` re-encoded at q72. AVIF is about 41% smaller than the JPEGs | `1d4343b`, `6a16cf8` |
| M8 | External-link icon is one CSS mask (`<i class="ext">`) instead of an inline SVG per link | `8fb8f64`, `a900f1c` |
| L1 | Both contact Workers: Origin required, 16 KB cap, `CONTACT_LIMIT` rate limit (3/min per IP), 5 s siteverify timeout, Turnstile hostname check | `6ef10bc`, `fa12498` |
| L2 | `workers_dev: false` for verbumdomini.ca | `6ef10bc` |
| L3 | `rosary3d.js` loaded with a `?v=` content hash; English `/assets/vendor/*` immutable | `6ef10bc`, `fa12498` |
| L4 | English 404 search form goes to `/compendium.html` | `6ef10bc` |
| L5 | Header logo glow is a static `drop-shadow`, no endless filter animation | `6ef10bc`, `fa12498` |
| L6 | Dead Turkish selectors removed (language pill and switch, `.l-tr`/`.l-en`, `.faq-cat-en`, `.rt-lead`, `.rosary-jump`); overridden declarations dropped and repeated blocks merged only where the cascade cannot change | `1d4343b`, `6a16cf8` |
| L7 | Theme poll skips background tabs | `6ef10bc`, `fa12498` |
| L8 | Turkish contact Worker deployed from CI (`cloudflare/wrangler.jsonc`, `.github/workflows/deploy-contact.yml`) | `6a16cf8` |
| L9 | `/.well-known/security.txt` on verbumdomini.ca | `6ef10bc` |
| L11 | `Crumbs` without unreachable code; the church pages' icon renamed `$IcoExternalCh` | `6ef10bc`, `fa12498` |
| CI | Turkish deploy runs `tools/qa/links.py` and fails unless `total bad 0` | `fa12498` |

## Done by the owner in Cloudflare (verified live 2026-10-29)

| ID | Setting |
|---|---|
| M2 | katolikdunyasi.com Response Header Transform Rule: X-Frame-Options, CSP frame-ancestors/base-uri/object-src, Referrer-Policy, Permissions-Policy, COOP, nosniff. HSTS 12 months with includeSubDomains. securityheaders.com grade A+ |
| L3 | Browser TTL for `/assets/art/*` and `/assets/fonts/*` lowered to 1 month |
| L10 | Email Address Obfuscation off: no `email-protection` links on the 55 church pages |
| Extra | GitHub Pages' `Access-Control-Allow-Origin: *` removed by the same Transform Rule |
| L8 | API token allowed on the katolikdunyasi.com zone; the Worker kept its secrets |

## Closed without change

- **L5, L6 leftovers** (about 60 `backdrop-filter`s, transitions on width/margin/height, about 80
  `!important` per stylesheet): owner's decision, not worth the visual risk.
- **L11 `data/tesbih-tarihi.js`**: not an outlier. It uses the same commented header plus
  `/*JSON-START*/ … /*JSON-END*/` format as 23 other build-input data files that `Read-Data` reads.
- **Cloudflare JavaScript Detections**: injected by Cloudflare and blocked by the M3 CSP (one console
  error, nothing visible). It cannot be switched off on the Free plan, and allowing it would mean
  `'unsafe-inline'` on every page.

## Things to keep in mind

- Don't bump `upload-pages-artifact` to v4+ without `include-hidden-files` (it would drop
  `.well-known/` and `.nojekyll`).
- A `<picture>` source that 404s does not fall back to the JPEG: any new painting must go through the
  CI step that makes its AVIF and WebP (top level of `assets/art/` only).
- Never edit the Turkish contact Worker in the dashboard: the next deploy replaces it.
- Not looked at in a browser: the `.ext` icon, the L6 CSS cleanup and the AVIF/WebP paintings.

## Checked and clean at audit time

No secrets in tree or history (the IndexNow key is public by design). No `pull_request_target`.
Client XSS sinks escape input; the build escapes `<` in JSON-LD and `</` in embedded JSON. All pages:
lang set, one h1, no skipped heading levels, landmarks, every img with alt and dimensions, lazy below
the fold, `noopener` on every `target=_blank`, scripts deferred, no mixed content. HTTP to HTTPS and
www to apex redirects work; 404s return 404.
