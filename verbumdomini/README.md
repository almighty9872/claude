# Verbum Domini (verbumdomini.ca)

The English site, on its own. Everything it is built from lives in this folder; nothing here is
shared with the Turkish site (katolikdunyasi.com), which is the rest of the repository.

```
pwsh -NoProfile -File ./verbumdomini/tools/build.ps1 -EnglishSite   # builds verbumdomini/_site_en/
```

A push that changes this folder deploys it to Cloudflare (`.github/workflows/deploy-english.yml`).
Notes, rules and tools: `docs/english-site.md`.
