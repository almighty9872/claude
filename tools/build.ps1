<#
.SYNOPSIS
  Static page generator for katolikdunyasi.com, a Turkish and English Catholic
  resource site: the Compendium of the Catechism of the Catholic Church,
  the OCIA/RCIA process, the Mass explained, prayers and the Rosary, a
  calendar of the saints, the Bible in Turkish, miracles, and an FAQ.

.DESCRIPTION
  Reads the single source of truth, data/*.js and content/*.md, and writes
  crawlable static HTML pages (all content pre-rendered for SEO), each in Turkish
  at the site root and in English under en/, with JSON-LD structured data
  (WebSite, Book, Article, Church, BreadcrumbList), sitemap.xml, robots.txt and
  llms.txt into the site root.

  The generated files are not committed (see .gitignore): the deploy workflow
  runs this on every push. Run it locally to preview the site.
  No dependencies (esbuild is used for minifying when it is installed): Windows PowerShell 5.1 or PowerShell 7+ (Windows/macOS/Linux).
  Keep this file saved as UTF-8 WITH BOM so Windows PowerShell 5.1 reads the
  Turkish text correctly, and do not use typographic quote characters in string
  literals (PowerShell treats them as quotes); use &#8220; &#8221; in markup, and
  $Apos for the Turkish suffix apostrophe in text that Attr() will escape.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools\build.ps1 -SiteUrl https://www.yourdomain.com
  pwsh tools/build.ps1 -SiteUrl https://www.yourdomain.com
#>
param(
  # Absolute site root for canonical, og:url and sitemap URLs (no trailing slash).
  # Leave empty to use the domain in the CNAME file (https://<domain>).
  [string]$SiteUrl = '',
  # The live site is Turkish, with English only on the Katekizm pages. -WithEnglish builds every
  # page in both languages, with its English twin under en/, as the site was before.
  [switch]$WithEnglish
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$CnamePlaceholder = 'alanadiniz.com'
if (-not $SiteUrl) {
  $cnameFile = Join-Path $Root 'CNAME'
  $domain = if (Test-Path $cnameFile) { ([IO.File]::ReadAllText($cnameFile)).Trim() } else { '' }
  if ($domain -and $domain -ne $CnamePlaceholder) { $SiteUrl = "https://$domain" }
  else { $SiteUrl = 'https://www.example.com'; Write-Warning "CNAME is missing or still the placeholder: canonical/sitemap URLs use $SiteUrl" }
}
$SiteUrl = $SiteUrl.TrimEnd('/')
$BuildDate = (Get-Date).ToString('yyyy-MM-dd')
# Last-changed date of a page: the newest git commit touching the data it is built from
# (sitemap <lastmod>, Article dateModified). Template-only changes don't count, and with no
# git history (a plain folder, a shallow clone) pages simply carry no date.
$PageSources = @{
  'katekizm.html' = @('data/compendium-1.js', 'data/compendium-2.js', 'data/compendium-3.js', 'data/compendium-4.js')
  'iman-ikrari.html' = @('data/compendium-1.js'); 'kutsal-sirlar.html' = @('data/compendium-2.js')
  'mesihte-yasam.html' = @('data/compendium-3.js'); 'hristiyan-duasi.html' = @('data/compendium-4.js', 'data/extras.js')
  'ekler.html' = @('data/extras.js'); 'motu-proprio.html' = @('data/extras.js'); 'giris.html' = @('data/extras.js')
  'sss.html' = @('data/sss.js'); 'katolik-sureci.html' = @('data/katolik-sureci.js'); 'gunah-cikarma.html' = @('data/gunah-cikarma.js')
  'topraklarimizda-hristiyanlik.html' = @('data/topraklarimizda-hristiyanlik.js', 'data/anadolu-haritasi.js')
  'neden-katoligiz.html' = @('data/neden-katoligiz.js'); 'azizler.html' = @('data/azizler.js', 'data/buyuk-azizler.js')
  'kutsal-ayin.html' = @('data/kutsal-ayin.js'); 'meseller.html' = @('data/meseller.js'); 'mucizeler.html' = @('data/mucizeler.js')
  'tesbih-duasi.html' = @('data/tespih.js'); 'tesbih-tarihi.html' = @('data/tesbih-tarihi.js'); 'kiliseler.html' = @('data/kiliseler.js')
  'islama-cevap.html' = @('data/islama-cevap.js'); 'ateizme-cevap.html' = @('data/ateizme-cevap.js')
  'kutsal-kitap.html' = @('content/kutsal-kitap.md', 'content/kutsal-kitap-en.md'); 'erisilebilirlik.html' = @('content/erisilebilirlik.md', 'content/erisilebilirlik-en.md')
  'gizlilik.html' = @('content/gizlilik.md', 'content/gizlilik-en.md'); 'kaynaklar-ve-telif.html' = @('content/hakkinda.md', 'content/hakkinda-en.md', 'data/tablolar.json', 'data/aziz-portreleri.json')
  'index.html' = @('data/kilise-tarihi.json', 'data/tarih-gorseller.json', 'data/tablolar.json', 'data/azizler.js', 'data/buyuk-azizler.js')
  'kilise-tarihi.html' = @('data/kilise-tarihi.json', 'data/tarih-gorseller.json')
  'iletisim.html' = @('cloudflare/contact-worker.js')   # the form and the worker that sends it on
}
$script:GitDates = @{}
$script:HasGit = [bool](Get-Command git -ErrorAction SilentlyContinue) -and (Test-Path (Join-Path $Root '.git'))
function Page-LastMod([string]$file) {
  if (-not $script:HasGit) { return '' }
  $src = $PageSources[$file]
  if (-not $src) {
    if ($file -like 'kilise/*') { $src = @('data/kiliseler.js') }
    elseif ($file -match '^[a-z0-9-]+\.html$' -and $GreatSaintIds -and $GreatSaintIds.ContainsKey(($file -replace '\.html$', ''))) { $src = @('data/buyuk-azizler.js') }
    else { return '' }
  }
  $key = $src -join '|'
  if (-not $script:GitDates.ContainsKey($key)) {
    $d = ''
    try { $d = (& git -C $Root log -1 --format=%cs -- @src 2>$null | Select-Object -First 1) } catch {}
    $script:GitDates[$key] = if ($d) { "$d".Trim() } else { '' }
  }
  return $script:GitDates[$key]
}
$MonthNamesTr = @('Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık')
$MonthNamesEn = @('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')
$BuildDateTr = "$((Get-Date).Day) $($MonthNamesTr[(Get-Date).Month - 1]) $((Get-Date).Year)"
$BuildDateEn = (Get-Date).ToString('d MMMM yyyy', [Globalization.CultureInfo]::GetCultureInfo('en-US'))
$Utf8 = New-Object System.Text.UTF8Encoding $false
$script:PageInfo = @()
# Cache-busting query string for the shared CSS/JS: a short hash of the minified
# file's own content, so every page automatically requests a fresh copy the
# moment either one changes, instead of browsers reusing a stale cached
# assets/styles.min.css or script.min.js indefinitely across deploys (both
# files keep the same name release to release).
function File-Ver([byte[]]$bytes) {
  $hash = [Security.Cryptography.MD5]::Create().ComputeHash($bytes)
  return ([BitConverter]::ToString($hash) -replace '-', '').Substring(0, 10).ToLowerInvariant()
}
# Minifies CSS: strips /* */ comments, collapses whitespace runs, and removes
# the space around { } : ; , . Safe for this file specifically because it has
# no string values containing those characters with meaningful surrounding
# space (checked: quoted values here are single tokens like font names), and
# calc()/attribute-selector spacing never touches those five characters.
function Minify-Css([string]$css) {
  $css = [regex]::Replace($css, '/\*[\s\S]*?\*/', '')
  $css = [regex]::Replace($css, '\s+', ' ')
  $css = [regex]::Replace($css, '\s*([{};,])\s*', '$1')
  # A space before ':' can be a descendant combinator ('.a :is(...)'), so only the one after goes
  $css = [regex]::Replace($css, ':\s+', ':')
  $css = $css -replace ';}', '}'
  return $css.Trim()
}
# Minifies JS conservatively: strips /* */ comments (safe here, verified no
# string/regex literal in the file contains an unmatched */ that would close
# a comment early) and trims each line's leading/trailing whitespace and
# blank lines. Does not join lines or touch in-line spacing, so it cannot
# affect ASI or regex-literal parsing. script.js has no template literals,
# so no string ever depends on preserved newlines/indentation either.
function Minify-Js([string]$js) {
  $js = [regex]::Replace($js, '/\*[\s\S]*?\*/', '')
  # A line that starts with // is a whole-line comment (script.js has no multi-line strings)
  $lines = $js -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' -and -not $_.StartsWith('//') }
  return ($lines -join "`n")
}
# esbuild, where it is installed (the deploy installs it): a real minifier, a good deal smaller
# than the simple one above, which stays as the fallback
function Esbuild-Min([string]$code, [string]$ext) {
  $eb = Get-Command esbuild -ErrorAction SilentlyContinue
  if (-not $eb) { return $null }
  $tmp = Join-Path ([IO.Path]::GetTempPath()) ("kd-" + [guid]::NewGuid().ToString('N'))
  [IO.File]::WriteAllText("$tmp.$ext", $code, $Utf8)
  & $eb.Source "$tmp.$ext" --minify --charset=utf8 --log-level=error "--outfile=$tmp.min.$ext" | Out-Null
  $ok = $LASTEXITCODE -eq 0 -and (Test-Path "$tmp.min.$ext")
  $r = if ($ok) { [IO.File]::ReadAllText("$tmp.min.$ext").TrimEnd() } else { $null }
  Remove-Item "$tmp.$ext", "$tmp.min.$ext" -ErrorAction SilentlyContinue
  return $r
}
$CssSrc = [IO.File]::ReadAllText((Join-Path $Root 'assets/styles.css'))
$CssMin = Esbuild-Min $CssSrc 'css'
if (-not $CssMin) { $CssMin = Minify-Css $CssSrc }
[IO.File]::WriteAllText((Join-Path $Root 'assets/styles.min.css'), $CssMin, $Utf8)
$CssVer = File-Ver ([IO.File]::ReadAllBytes((Join-Path $Root 'assets/styles.min.css')))
# (script.min.js is written further down, once data/azizler-adlar.js exists: it carries a
# version hash for every data file.)
# Turkish suffix apostrophe (U+2019). Built from its code point on purpose: PowerShell
# treats a typographic quote as a string delimiter, so it must not appear in a literal,
# and &#8217; is no use in text that Attr() escapes. Interpolate it as $Apos instead.
$Apos = [char]0x2019
# The site is the brand now; the Compendium is one work published on it.
$SiteName = 'katolikdunyasi.com'
$SiteTag = 'Türkçe Katolik Portalı'
$SiteTagEn = 'Turkish Catholic Portal'
$WorkName = 'Katolik Kilisesi İnanç Esasları Özeti'
$SiteNameEn = 'Compendium of the Catechism of the Catholic Church'

# en/ holds the English site: every Turkish page has an English twin there, with English as its
# language (lang, title, description, canonical, hreflang), so search engines index both. The
# page's text is the same pair of TR/EN wrappers; the address decides which one is shown.
# The folder is rebuilt from scratch on every build.
$EnDir = Join-Path $Root 'en'
if (Test-Path $EnDir) { Remove-Item -Recurse -Force $EnDir }
New-Item -ItemType Directory -Path $EnDir | Out-Null
New-Item -ItemType Directory -Path (Join-Path $EnDir 'church') | Out-Null
# Maps every page to its English twin, keyed both directions (e.g. 'sss.html' -> 'en/faq.html'
# and 'en/faq.html' -> 'sss.html'). English pages use English slugs, listed explicitly below;
# the church pages keep their names under en/church/.
$EnAltMap = @{}
# The pages that keep their English on the Turkish-only site: the Katekizm and its parts
$BilingualPages = @('katekizm.html', 'giris.html', 'motu-proprio.html', 'iman-ikrari.html', 'kutsal-sirlar.html', 'mesihte-yasam.html', 'hristiyan-duasi.html', 'ekler.html')
function Add-EnAlt([string]$trFile, [string]$enFile) {
  if (-not $WithEnglish -and $BilingualPages -notcontains $trFile) { return }
  $EnAltMap[$trFile] = "en/$enFile"; $EnAltMap["en/$enFile"] = $trFile
}
# The public path of a page: the two homepages are served (and canonical) at / and /en/
function Page-Path([string]$file) { if ($file -eq 'index.html') { '' } elseif ($file -eq 'en/index.html') { 'en/' } else { $file } }
# The English twin of a Turkish page ('en/…'), or $null when it has none (404.html)
function En-Of([string]$file) {
  if ($file -eq '' -or $file -eq '/') { $file = 'index.html' }
  if ($file.StartsWith('en/') -or $file -eq '404.html') { return $null }
  if ($EnAltMap.ContainsKey($file)) { return $EnAltMap[$file] }
  if ($WithEnglish -and $file -like 'kilise/*.html') { return 'en/church/' + $file.Substring(7) }
  return $null
}
# Root-relative links and form targets to Turkish pages -> their English twins (on English pages)
$EnLinkEval = [System.Text.RegularExpressions.MatchEvaluator]{
  param($m)
  $e = En-Of $m.Groups[2].Value
  if (-not $e) { return $m.Value }
  return $m.Groups[1].Value + '="/' + (Page-Path $e) + $m.Groups[3].Value + '"'
}
function Map-EnLinks([string]$html) {
  return [regex]::Replace($html, '(href|action)="/((?:kilise/)?[a-z0-9-]*(?:\.html)?)((?:\?[^"#]*)?(?:#[^"]*)?)"', $EnLinkEval)
}
# Absolute site URLs inside structured data -> their English twins
$EnUrlEval = [System.Text.RegularExpressions.MatchEvaluator]{
  param($m)
  $e = En-Of $m.Groups[1].Value
  if (-not $e) { return $m.Value }
  return '"' + $SiteUrl + '/' + (Page-Path $e) + '"'
}
Add-EnAlt 'index.html' 'index.html'
Add-EnAlt 'katekizm.html' 'compendium.html'
Add-EnAlt 'giris.html' 'introduction.html'
Add-EnAlt 'motu-proprio.html' 'motu-proprio.html'
Add-EnAlt 'iman-ikrari.html' 'profession-of-faith.html'
Add-EnAlt 'kutsal-sirlar.html' 'celebration-of-christian-mystery.html'
Add-EnAlt 'mesihte-yasam.html' 'life-in-christ.html'
Add-EnAlt 'hristiyan-duasi.html' 'christian-prayer.html'
Add-EnAlt 'ekler.html' 'appendix.html'
Add-EnAlt 'sss.html' 'faq.html'
Add-EnAlt 'gunah-cikarma.html' 'confession.html'
Add-EnAlt 'katolik-sureci.html' 'becoming-catholic.html'
Add-EnAlt 'kiliseler.html' 'find-a-church.html'
Add-EnAlt 'azizler.html' 'saints.html'
Add-EnAlt 'iletisim.html' 'contact.html'
Add-EnAlt 'erisilebilirlik.html' 'accessibility.html'
Add-EnAlt 'gizlilik.html' 'privacy.html'
Add-EnAlt 'tesbih-duasi.html' 'rosary.html'
Add-EnAlt 'tesbih-tarihi.html' 'history-of-the-rosary.html'
Add-EnAlt 'kutsal-kitap.html' 'bible.html'
Add-EnAlt 'neden-katoligiz.html' 'why-were-catholic.html'
Add-EnAlt 'topraklarimizda-hristiyanlik.html' 'anatolia.html'
Add-EnAlt 'mucizeler.html' 'miracles.html'
Add-EnAlt 'kutsal-ayin.html' 'mass.html'
Add-EnAlt 'meseller.html' 'parables.html'
Add-EnAlt 'meryem-ana.html' 'mary.html'
Add-EnAlt 'aziz-yusuf.html' 'saint-joseph.html'
Add-EnAlt 'havari-petrus.html' 'saint-peter.html'
Add-EnAlt 'havari-pavlus.html' 'saint-paul.html'
Add-EnAlt 'vaftizci-yahya.html' 'john-the-baptist.html'
Add-EnAlt 'havari-yuhanna.html' 'saint-john.html'
Add-EnAlt 'aziz-augustinus.html' 'saint-augustine.html'
Add-EnAlt 'aziz-thomas-aquinas.html' 'thomas-aquinas.html'
Add-EnAlt 'assisili-aziz-francis.html' 'francis-of-assisi.html'
Add-EnAlt 'sienali-aziz-catharina.html' 'catherine-of-siena.html'
Add-EnAlt 'avilali-aziz-teresa.html' 'teresa-of-avila.html'
Add-EnAlt 'lisieuxlu-kucuk-teresa.html' 'therese-of-lisieux.html'
Add-EnAlt 'aziz-ignatius-loyola.html' 'ignatius-of-loyola.html'
Add-EnAlt 'aziz-benedictus.html' 'saint-benedict.html'
Add-EnAlt 'aziz-patrick.html' 'saint-patrick.html'
Add-EnAlt 'padovali-aziz-antonius.html' 'anthony-of-padua.html'
Add-EnAlt 'kalkutali-aziz-teresa.html' 'mother-teresa.html'
Add-EnAlt 'aziz-ii-yuhanna-pavlus.html' 'john-paul-ii.html'
Add-EnAlt 'padre-pio.html' 'padre-pio.html'
Add-EnAlt 'aziz-hieronymus.html' 'saint-jerome.html'
Add-EnAlt 'islama-cevap.html' 'answering-islam.html'
Add-EnAlt 'ateizme-cevap.html' 'answering-atheism.html'
Add-EnAlt 'kaynaklar-ve-telif.html' 'sources-and-copyright.html'

# ------------------------------------------------------------------ data
function Read-Data([string]$file) {
  $path = Join-Path (Join-Path $Root 'data') $file
  $t = [IO.File]::ReadAllText($path, [Text.Encoding]::UTF8)
  $s = $t.IndexOf('/*JSON-START*/'); $e = $t.IndexOf('/*JSON-END*/')
  if ($s -lt 0 -or $e -lt 0) { throw "${file}: JSON-START / JSON-END markers not found." }
  try { return ($t.Substring($s + 14, $e - $s - 14) | ConvertFrom-Json) }
  catch { throw "${file}: JSON syntax error: $($_.Exception.Message)" }
}
$Parts = @(1..4 | ForEach-Object { Read-Data "compendium-$_.js" })
$X = Read-Data 'extras.js'
$FaqData = Read-Data 'sss.js'
$Rosary = Read-Data 'tespih.js'
$Sureci = Read-Data 'katolik-sureci.js'
$Confession = Read-Data 'gunah-cikarma.js'
$Anatolia = Read-Data 'topraklarimizda-hristiyanlik.js'
$WhyCatholic = Read-Data 'neden-katoligiz.js'
$Saints = Read-Data 'azizler.js'
# data/azizler-adlar.js: just each day's first saint name (Turkish, English) for the
# today's-saint pill on the home page and in the menu, instead of the full calendar.
$saintNames = [ordered]@{}
foreach ($day in $Saints.days) {
  $first = @($day.saints)[0]
  if ($first) { $saintNames["$($day.m)-$($day.d)"] = @($first.name, $first.nameEn) }
}
$saintNamesJson = ConvertTo-Json -InputObject $saintNames -Compress -Depth 4
[IO.File]::WriteAllText((Join-Path $Root 'data/azizler-adlar.js'),
  "/* Generated by tools/build.ps1 from data/azizler.js; do not edit. */`nwindow.SAINT_NAMES = $saintNamesJson;`n", $Utf8)
# data/azizler-ozet-<month>.js: the title and the opening of each day's first saint's life, for
# the home page's saint card; one small file a month, so the card never loads the whole calendar.
function Clip-Text([string]$t, [int]$max = 190) {
  if (-not $t -or $t.Length -le $max) { return $t }
  $cut = $t.Substring(0, $max); $sp = $cut.LastIndexOf(' ')
  if ($sp -gt 100) { $cut = $cut.Substring(0, $sp) }
  return $cut.TrimEnd(',', ';', ':', ' ') + '…'
}
foreach ($month in 1..12) {
  $sum = [ordered]@{}
  foreach ($day in @($Saints.days | Where-Object { $_.m -eq $month })) {
    $first = @($day.saints)[0]
    if ($first) { $sum["$($day.m)-$($day.d)"] = @($first.title, $first.titleEn, (Clip-Text $first.bio), (Clip-Text $first.bioEn)) }
  }
  $sumJson = ConvertTo-Json -InputObject $sum -Compress -Depth 4
  [IO.File]::WriteAllText((Join-Path $Root "data/azizler-ozet-$month.js"),
    "/* Generated by tools/build.ps1 from data/azizler.js; do not edit. */`nwindow.SAINT_SUMMARY_$month = $sumJson;`n", $Utf8)
}
# script.min.js, with a content hash for each data file so the data URLs change with their content
# (only the data files the browser loads; the rest are build input and are not published, see
# .github/workflows/deploy.yml)
$RuntimeData = @('compendium-1.js', 'compendium-2.js', 'compendium-3.js', 'compendium-4.js', 'tespih.js', 'azizler-adlar.js', 'refs-bible.js', 'refs-quran.js', 'refs-hadith.js') + (1..12 | ForEach-Object { "azizler-ozet-$_.js" })
$dataVer = [ordered]@{}
Get-ChildItem (Join-Path $Root 'data') -Filter '*.js' | Where-Object { $RuntimeData -contains $_.Name } | Sort-Object Name | ForEach-Object {
  $dataVer["data/$($_.Name)"] = File-Ver ([IO.File]::ReadAllBytes($_.FullName))
}
# and every Turkish page's English twin, for links the script writes on English pages
$enMap = [ordered]@{}
foreach ($k in ($EnAltMap.Keys | Sort-Object)) { if (-not $k.StartsWith('en/')) { $enMap[$k] = Page-Path $EnAltMap[$k] } }
$JsSrc = [IO.File]::ReadAllText((Join-Path $Root 'assets/script.js'))
$JsFull = $JsSrc.Replace('{"__DATA_VER__": 1}', (ConvertTo-Json -InputObject $dataVer -Compress)).Replace('{"__EN_MAP__": 1}', (ConvertTo-Json -InputObject $enMap -Compress))
$JsMin = Esbuild-Min $JsFull 'js'
if (-not $JsMin) { $JsMin = Minify-Js $JsFull }
[IO.File]::WriteAllText((Join-Path $Root 'assets/script.min.js'), $JsMin, $Utf8)
$JsVer = File-Ver ([IO.File]::ReadAllBytes((Join-Path $Root 'assets/script.min.js')))
$GreatSaints = Read-Data 'buyuk-azizler.js'
$GreatSaintIds = @{}; foreach ($s in $GreatSaints.saints) { $GreatSaintIds[$s.id] = $true }
$Mass = Read-Data 'kutsal-ayin.js'

# Page file, ordinal label and meta description per part (descriptions are for search engines only)
$PartMeta = @{
  1 = @{ file = 'iman-ikrari.html';     fileEn = 'profession-of-faith.html';               ord = 'Birinci Kısım';  roman = 'I';
         desc = "Katolik Kilisesi Katekizmi Özeti, Birinci Kısım: İnanç Beyanı. Vahiy, Kutsal Üçlü, Mesih İsa, Kilise ve ebedi hayat üzerine 1–217. sorular."
         ordEn = 'Part One'; descEn = 'Compendium of the Catechism, Part One: The Profession of Faith. Questions 1-217 on Revelation, the Trinity, Christ, the Church and eternal life.' }
  2 = @{ file = 'kutsal-sirlar.html';   fileEn = 'celebration-of-christian-mystery.html';  ord = 'İkinci Kısım';   roman = 'II';
         desc = "Katolik Kilisesi Katekizmi Özeti, İkinci Kısım: Hristiyan Gizeminin Kutlanması. Litürji ve yedi Kutsal Sır üzerine 218–356. sorular."
         ordEn = 'Part Two'; descEn = 'Compendium of the Catechism, Part Two: The Celebration of the Christian Mystery. Questions 218-356 on the liturgy and the seven sacraments.' }
  3 = @{ file = 'mesihte-yasam.html';   fileEn = 'life-in-christ.html';                    ord = 'Üçüncü Kısım';   roman = 'III';
         desc = "Katolik Kilisesi Katekizmi Özeti, Üçüncü Kısım: Mesih$($Apos)te Yaşam. İnsan onuru, vicdan, erdemler, günah, lütuf ve On Emir üzerine 357–533. sorular."
         ordEn = 'Part Three'; descEn = 'Compendium of the Catechism, Part Three: Life in Christ. Questions 357-533 on human dignity, conscience, virtue, sin, grace and the Ten Commandments.' }
  4 = @{ file = 'hristiyan-duasi.html'; fileEn = 'christian-prayer.html';                  ord = 'Dördüncü Kısım'; roman = 'IV';
         desc = "Katolik Kilisesi Katekizmi Özeti, Dördüncü Kısım: Hristiyan Duası. Dua ve Rab$($Apos)bin Duası (Göklerdeki Pederimiz) üzerine 534–598. sorular."
         ordEn = 'Part Four'; descEn = "Compendium of the Catechism of the Catholic Church, Part Four: Christian Prayer. Questions 534-598 on prayer and the Lord's Prayer (Our Father)." }
}

# ------------------------------------------------------------------ helpers
$GlossRx = '\[\[([^|\]]+)\|([^\]]+)\]\]'
function Inline([string]$s) { if (-not $s) { return '' }; return [regex]::Replace($s, $GlossRx, '$1<span class="gloss" lang="en"> ($2)</span>') }
function Plain([string]$s)  { if (-not $s) { return '' }; $s = [regex]::Replace($s, $GlossRx, '$1 ($2)'); return (($s -replace '<[^>]+>', '') -replace '\s+', ' ').Trim() }
function Attr([string]$s)   { return ($s -replace '&', '&amp;' -replace '"', '&quot;' -replace '<', '&lt;' -replace '>', '&gt;') }
# ---- Both languages on every page. Each text is written in Turkish and English side by side and
# the TR | EN switch (script.js, initLang) shows one of them, in place, without reloading:
#   T  "Metin" "Text"                a pair of spans, for text inside an element (no blocks)
#   TB "<p>..</p>" "<p>..</p>"        a pair of wrapper divs, for whole blocks of HTML
#   TA 'aria-label' "Kapat" "Close"  an attribute, with its English in data-en-aria-label
# The wrappers take no room of their own (display: contents), so the page's layout and CSS see
# the text as if it were written straight into its element. Without an English text the Turkish
# stands alone, in both languages.
function T([string]$tr, [string]$en) {
  if (-not $en -or $en -ceq $tr) { return $tr }
  return "<span class=`"l-tr`">$tr</span><span class=`"l-en`" lang=`"en`">$en</span>"
}
function TB([string]$tr, [string]$en) {
  if (-not $en -or $en -ceq $tr) { return $tr }
  return "<div class=`"l-tr`">$tr</div><div class=`"l-en`" lang=`"en`">$en</div>"
}
# TO: something that belongs to the Turkish only (an English gloss under a Turkish title would say
# the same thing twice in English)
function TO([string]$html) { if (-not $html) { return '' }; return "<div class=`"l-tr l-sub-en`">$html</div>" }
# A page without an English twin, on the Turkish-only site: its English taken out, the Turkish
# left as plain text (the l-tr / l-en wrappers nest, so the patterns balance their own tags)
function Strip-En([string]$h) {
  foreach ($t in 'div', 'span', 'tspan') {
    $bal = "(?>(?<o><$t\b)|(?<-o></$t>)|(?!</?$t\b)[\s\S])*(?(o)(?!))"
    $h = [regex]::Replace($h, "<$t class=`"l-en`"[^>]*>$bal</$t>", '')
    $h = [regex]::Replace($h, "<$t class=`"l-tr l-sub-en`">$bal</$t>", '')
    $rx = [regex]"<$t class=`"l-tr`">(?<c>$bal)</$t>"
    do { $before = $h; $h = $rx.Replace($h, '${c}') } while ($h -ne $before)
  }
  return [regex]::Replace($h, ' data-en-[a-z-]+="[^"]*"', '')
}
function TA([string]$name, [string]$tr, [string]$en) {
  $a = "$name=`"$(Attr $tr)`""
  if ($en -and $en -cne $tr) { $a += " data-en-$name=`"$(Attr $en)`"" }
  return $a
}
# Shortens text for a <meta name="description"> so search engines don't cut it
# off mid-sentence; trims at the last full word within the limit. Only for the
# meta tag, never for text shown on the page.
function Meta-Trim([string]$s, [int]$max = 160) {
  if ($s.Length -le $max) { return $s }
  $cut = $s.Substring(0, $max)
  $lastSpace = $cut.LastIndexOf(' ')
  if ($lastSpace -gt 0) { $cut = $cut.Substring(0, $lastSpace) }
  return $cut.TrimEnd('.', ',', ';', ':') + '…'
}
function Blocks([string]$s) {
  $sb = New-Object Text.StringBuilder; $list = New-Object Collections.ArrayList
  foreach ($line in ($s -split "`n")) {
    $l = $line.Trim(); if (-not $l) { continue }
    if ($l.StartsWith('- ')) { [void]$list.Add($l.Substring(2)); continue }
    if ($list.Count) { [void]$sb.Append('<ul>' + (($list | ForEach-Object { '<li>' + (Inline $_) + '</li>' }) -join '') + '</ul>'); $list.Clear() }
    if ($l.StartsWith('### ')) { [void]$sb.Append('<h3 class="blk-sub">' + (Inline $l.Substring(4)) + '</h3>'); continue }
    [void]$sb.Append('<p>' + (Inline $l) + '</p>')
  }
  if ($list.Count) { [void]$sb.Append('<ul>' + (($list | ForEach-Object { '<li>' + (Inline $_) + '</li>' }) -join '') + '</ul>') }
  return $sb.ToString()
}
function Verse([string]$s) { return ((($s -split "`n`n+") | ForEach-Object { '<p>' + ((Inline $_) -replace "`n", '<br>') + '</p>' }) -join '') }
function HTag([int]$lvl) { return 'h' + [Math]::Min(6, [Math]::Max(2, $lvl)) }
# JSON string for JSON-LD ('<' escaped so the script block can never be closed early)
function JStr([string]$s) {
  if ($null -eq $s) { return 'null' }
  $s = $s -replace '\\', '\\' -replace '"', '\"' -replace "`r", '' -replace "`n", '\n' -replace "`t", ' ' -replace '<', ('\' + 'u003c')
  return '"' + $s + '"'
}
function Range-Text($r) { if ($null -eq $r -or $null -eq $r[0]) { return '' }; if ($r[0] -eq $r[1]) { return "$($r[0])" }; return "$($r[0])–$($r[1])" }
# For each heading id: @(first question, last question) until the next heading of the same or higher level
function Get-Ranges($items) {
  $list = @($items); $res = @{}
  for ($i = 0; $i -lt $list.Count; $i++) {
    $it = $list[$i]; if ($it.type -ne 'heading') { continue }
    $first = $null; $last = $null
    for ($j = $i + 1; $j -lt $list.Count; $j++) {
      $x = $list[$j]
      if ($x.type -eq 'heading' -and $x.level -le $it.level) { break }
      if ($x.type -eq 'qa') { if ($null -eq $first) { $first = $x.n }; $last = $x.n }
    }
    $res[$it.id] = @($first, $last)
  }
  return $res
}
# "Birinci Bölüm: X" -> @('Birinci Bölüm', 'X');  "Section One: X" -> @('Section One', 'X')
function Split-Heading([string]$s) {
  $m = [regex]::Match($s, '^((?:Birinci|İkinci|Üçüncü|Dördüncü) (?:Kısım|Bölüm|Başlık)|(?:Part|Section|Chapter) (?:One|Two|Three|Four)):\s*(.+)$')
  if ($m.Success) { return @($m.Groups[1].Value, $m.Groups[2].Value) }
  return @('', $s)
}
function Split-Attr([string]$s) { $m = [regex]::Match($s, '^([\s\S]*?)\s*\(([^()]*)\)\s*$'); if ($m.Success) { return @($m.Groups[1].Value, $m.Groups[2].Value) }; return @($s, '') }

# ---------------- minimal Markdown (content/hakkinda.md feeds the footer's sources dialog)
# Defined here rather than further down because the footer renders the dialog on every page.
function Md-Inline([string]$s) {
  $s = $s -replace '&', '&amp;' -replace '<', '&lt;' -replace '>', '&gt;'
  $s = [regex]::Replace($s, '`([^`]+)`', '<code>$1</code>')
  $s = [regex]::Replace($s, '\[([^\]]+)\]\(([^)\s]+)\)', [Text.RegularExpressions.MatchEvaluator]{
    param($m) $u = $m.Groups[2].Value
    $rel = if ($u -match '^https?://') { ' target="_blank" rel="noopener"' } else { '' }
    "<a href=`"$u`"$rel>$($m.Groups[1].Value)</a>" })
  $s = [regex]::Replace($s, '\*\*(.+?)\*\*', '<strong>$1</strong>')
  $s = [regex]::Replace($s, '(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', '<em>$1</em>')
  $s = [regex]::Replace($s, '(?<![\w])_(?!\s)(.+?)(?<!\s)_(?![\w])', '<em>$1</em>')
  return $s
}
function Convert-Markdown([string]$md) {
  $lines = ($md -replace "`r", '') -split "`n"
  $sb = New-Object Text.StringBuilder
  $para = New-Object Collections.ArrayList; $items = New-Object Collections.ArrayList; $quote = New-Object Collections.ArrayList
  $listTag = 'ul'
  $flush = {
    if ($para.Count)  { [void]$sb.Append('<p>' + (Md-Inline ($para -join ' ')) + '</p>'); $para.Clear() }
    if ($items.Count) { [void]$sb.Append("<$listTag>" + (($items | ForEach-Object { '<li>' + (Md-Inline $_) + '</li>' }) -join '') + "</$listTag>"); $items.Clear() }
    if ($quote.Count) { [void]$sb.Append('<blockquote><p>' + (Md-Inline ($quote -join ' ')) + '</p></blockquote>'); $quote.Clear() }
  }
  foreach ($raw in $lines) {
    $l = $raw.TrimEnd()
    if ($l -match '^\s*$') { . $flush; continue }
    # "## Heading {#some-id}" gives the heading an id (for in-page links such as the mobile tab bar)
    if ($l -match '^(#{1,4})\s+(.+?)(?:\s+\{#([a-z0-9-]+)\})?$') { . $flush; $lvl = [Math]::Max(2, $Matches[1].Length); $hid = if ($Matches[3]) { " id=`"$($Matches[3])`"" } else { '' }; [void]$sb.Append("<h$lvl$hid>" + (Md-Inline $Matches[2]) + "</h$lvl>"); continue }
    if ($l -match '^\s*(-{3,}|\*{3,}|_{3,})\s*$') { . $flush; [void]$sb.Append('<hr>'); continue }
    if ($l -match '^>\s?(.*)$') { $q = $Matches[1]; if ($para.Count -or $items.Count) { . $flush }; [void]$quote.Add($q); continue }
    if ($l -match '^\s{0,3}[-*+]\s+(.+)$') { $v = $Matches[1]; if ($para.Count -or $quote.Count -or ($items.Count -and $listTag -ne 'ul')) { . $flush }; $listTag = 'ul'; [void]$items.Add($v); continue }
    if ($l -match '^\s{0,3}\d+[.)]\s+(.+)$') { $v = $Matches[1]; if ($para.Count -or $quote.Count -or ($items.Count -and $listTag -ne 'ol')) { . $flush }; $listTag = 'ol'; [void]$items.Add($v); continue }
    if ($items.Count -and $raw -match '^\s{2,}\S') { $items[$items.Count - 1] = $items[$items.Count - 1] + ' ' + $l.Trim(); continue }
    if ($quote.Count) { [void]$quote.Add($l.Trim()); continue }
    if ($items.Count) { . $flush }
    [void]$para.Add($l.Trim())
  }
  . $flush
  return $sb.ToString()
}
# ------------------------------------------------------------------ icons (inline SVG, no image files)
# Sprite emitted once per page; repeated icons reference it with <use>
$Sprite = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">' +
  '<symbol id="i-chev" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/></symbol>' +
  '<symbol id="i-globe" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></g></symbol>' +
  '</svg>'
$IcoChev   = '<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-chev"/></svg>'
$IcoChevLg = '<svg class="chev" aria-hidden="true" focusable="false"><use href="#i-chev"/></svg>'
$IcoGlobe  = '<svg aria-hidden="true" focusable="false"><use href="#i-globe"/></svg>'
$IcoSearch = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>'
$IcoSun    = '<svg class="ico-sun" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>'
$IcoMoon   = '<svg class="ico-moon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z"/></svg>'
$IcoList   = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>'
# Three independent lines (not one path) so open/close can animate each into an X via CSS,
# driven purely by the button's own aria-expanded state -- no JS beyond the existing toggle.
$IcoMenuToggle = '<svg class="menu-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><line class="mi-l1" x1="4" y1="6" x2="20" y2="6"/><line class="mi-l2" x1="4" y1="12" x2="20" y2="12"/><line class="mi-l3" x1="4" y1="18" x2="20" y2="18"/></svg>'
$IcoTextSize = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/><path d="M10.5 7.8v5.4M7.8 10.5h5.4"/></svg>'
$IcoPrev   = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>'
$IcoNext   = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>'
$IcoClose  = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>'
# Page-head icons: replace the small-caps section label on a few pages where the label was
# purely decorative (repeating the nav category, or just the page's own title back at itself).
$IcoDoor     = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21V4.5A1.5 1.5 0 0 1 8.5 3h5L18 6.5V21"/><path d="M4 21h16"/><circle cx="14.3" cy="12.5" r=".6" fill="currentColor" stroke="none"/></svg>'
$IcoKey      = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.2" cy="7.2" r="3.7"/><path d="M9.8 9.8 18.5 18.5"/><path d="M15 15l2.2-2.2"/><path d="M17.8 17.8l2.2-2.2"/></svg>'
# Kilise'nin tarihi: an hourglass
$IcoHourglass = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3h11M6.5 21h11"/><path d="M7.5 3c0 4.6 4.5 6 4.5 9s-4.5 4.4-4.5 9"/><path d="M16.5 3c0 4.6-4.5 6-4.5 9s4.5 4.4 4.5 9"/><path d="M9.6 18.6h4.8"/></svg>'
$IcoRoots    = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="3.1"/><path d="M12 9.1V14"/><path d="M12 14 8 20M12 14v6M12 14l4 6"/></svg>'
$IcoCompass  = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.3 8.7 13.2 13.2 8.7 15.3 10.8 10.8Z"/></svg>'
$IcoChalice  = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10"/><path d="M7.5 4c0 4.5 1.3 8 4.5 8s4.5-3.5 4.5-8"/><path d="M12 12v5.5"/><path d="M8 21h8"/><path d="M12 17.5v3.5"/></svg>'
$IcoBookOpen = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5c-1.6-1.3-3.6-2-6-2-.6 0-1 .4-1 1v11.5c0 .6.4 1 1 1 2.4 0 4.4.7 6 2 1.6-1.3 3.6-2 6-2 .6 0 1-.4 1-1V5.5c0-.6-.4-1-1-1-2.4 0-4.4.7-6 2Z"/><path d="M12 6.5v13"/></svg>'
$IcoBible    = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4.5A1.5 1.5 0 0 1 7.5 3H19v16.5a1 1 0 0 1-1 1H7.5A1.5 1.5 0 0 1 6 19Z"/><path d="M6 19a1.5 1.5 0 0 1 1.5-1.5H19"/><path d="M9.5 3v5.2l2-1.4 2 1.4V3"/></svg>'
$IcoQuestion = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.3 9.4a2.7 2.7 0 1 1 4 2.4c-.9.5-1.3 1.1-1.3 2.1v.4"/><circle cx="12" cy="17.6" r=".7" fill="currentColor" stroke="none"/></svg>'
$IcoSparkle  = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" stroke="none"><path d="M12 2c.9 4.6 3.1 6.8 7.7 7.7-4.6.9-6.8 3.1-7.7 7.7-.9-4.6-3.1-6.8-7.7-7.7C8.9 8.8 11.1 6.6 12 2Z"/></svg>'
$IcoChevDown = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9.5 12 15l6-5.5"/></svg>'
function Page-Ico([string]$svg) { return "<span class=`"page-ico`">$svg</span>" }

# The paintings (data/tablolar.json): which page's header shows which painting, and each
# painting's title, painter, home and source. The images are in assets/art (1600 and 800 wide).
$Tablolar = Get-Content -Raw -Encoding UTF8 (Join-Path $Root 'data/tablolar.json') | ConvertFrom-Json
# The home page's strip of Church history and the credits of its pictures
$Tarih = Get-Content -Raw -Encoding UTF8 (Join-Path $Root 'data/kilise-tarihi.json') | ConvertFrom-Json
$tgFile = Join-Path $Root 'data/tarih-gorseller.json'
$TarihImg = if (Test-Path $tgFile) { Get-Content -Raw -Encoding UTF8 $tgFile | ConvertFrom-Json } else { [pscustomobject]@{} }
function Art-Img([string]$key, [string]$cls, [string]$sizes = '100vw', [string]$prio = 'auto') {
  $a = $Tablolar.art.$key
  $fp = if ($prio -eq 'high') { ' fetchpriority="high"' } else { ' loading="lazy"' }
  return "<img class=`"$cls`" src=`"assets/art/$key.jpg`" srcset=`"/assets/art/$key-800.jpg 800w, /assets/art/$key.jpg 1600w`" sizes=`"$sizes`" width=`"$($a.w)`" height=`"$($a.h)`" alt=`"`" decoding=`"async`" style=`"object-position:50% $($a.y)%`"$fp>"
}
# a picture inside a story (data file "art": a key of data/tablolar.json), with its credit under it
function Mira-Fig([string]$key) {
  if (-not $key) { return '' }
  $a = $Tablolar.art.$key
  return "<figure class=`"mira-fig`">$(Art-Img $key 'mira-img' '(min-width: 980px) 44rem, 100vw')<figcaption>$($a.a) · <cite>$($a.t)</cite></figcaption></figure>"
}
function Art-Cap([string]$key) {
  $a = $Tablolar.art.$key
  return "<p class=`"ph-cap`">$(T "$($a.a) · <cite>$($a.t)</cite>" "$($a.a) · <cite>$($a.te)</cite>")</p>"
}
# A page whose header has a painting: the painting behind the title, its name underneath. A
# painting smaller than the screen is shown whole, in a frame, over a blurred copy of itself.
# A section that has a painting (data/tablolar.json "sections"): the painting, with its name, in
# place of the section's line drawing
function Paint-Sections([string]$body, [string]$file) {
  $map = $Tablolar.sections.$file
  if (-not $map) { return $body }
  foreach ($p in $map.PSObject.Properties) {
    $key = $p.Value; $a = $Tablolar.art.$key
    # a landscape painting runs the width of the text; an upright one stands in the middle of it
    $shape = if ([int]$a.w -ge [int]$a.h * 1.15) { 'ill-wide' } else { 'ill-tall' }
    $fig = "<figure class=`"ill-art ill-photo $shape`">$(Art-Img $key 'ill-img' '(min-width: 980px) 46rem, 100vw')<figcaption>$(T "$($a.a) · <cite>$($a.t)</cite>" "$($a.a) · <cite>$($a.te)</cite>")</figcaption></figure>"
    # the painting goes under the section's heading, in the run of the text
    $rx = '(<(?:section|article)\b[^>]*\bid="' + [regex]::Escape($p.Name) + '"[^>]*>)<div class="ill-art" aria-hidden="true"><svg[\s\S]*?</svg></div>(<div class="ill-body">(?:<p class="ill-kick">[\s\S]*?</p>)?<h2[\s\S]*?</h2>)'
    $body = [regex]::Replace($body, $rx, { param($m) $m.Groups[1].Value + $m.Groups[2].Value + $fig })
  }
  return $body
}
function Paint-Head([string]$body, [string]$file) {
  $key = $Tablolar.pages.$file
  if (-not $key) { return $body }
  $m = [regex]::Match($body, '<header class="page-head([^"]*)"([^>]*)>')
  if (-not $m.Success) {
    # a page with a hero section instead of a page header (the Katekizm's own page): the banner opens it
    $h = [regex]::Match($body, '<section class="hero work-hero">')
    if (-not $h.Success) { return $body }
    $at = $h.Index + $h.Length
    return $body.Substring(0, $at) + "<header class=`"page-head painted banner-only`" data-art=`"$key`">$(Art-Img $key 'ph-art' '100vw' 'high')$(Art-Cap $key)</header>" + $body.Substring($at)
  }
  # the painting runs the full width of the page as a banner (header paintings are all landscape),
  # its name on it at the lower right, the page's title under it
  $cls = "page-head$($m.Groups[1].Value) painted"
  $imgs = Art-Img $key 'ph-art' '100vw' 'high'
  # a few banners are a window onto the whole painting, which moves inside it as the page
  # scrolls, so more of it comes into view before it leaves (script.js, initBannerPan)
  if (@('tesbih-duasi.html') -contains $file) { $cls += ' ph-pan'; $imgs = "<div class=`"ph-win`">$imgs</div>" }
  $open = "<header class=`"$cls`" data-art=`"$key`"$($m.Groups[2].Value)>$imgs"
  $end = $body.IndexOf('</header>', $m.Index)
  $inner = $body.Substring($m.Index + $m.Length, $end - $m.Index - $m.Length)
  return $body.Substring(0, $m.Index) + $open + "<div class=`"ph-text`">$inner</div>" + (Art-Cap $key) + $body.Substring($end)
}

# ---- Illustrated sections: a page section with a line drawing of its own beside it (in the section's
# colour, "tone"), a small kicker over a large heading. The drawing draws itself as the section scrolls
# into view (initDrawings in script.js); without JavaScript or with reduced motion it is simply shown.
# Every drawing is plain strokes on a 120 x 120 grid, one path per stroke so they draw one after another.
$Ill = @{
  'ship'      = '<path d="M18 80h84l-9 13H27z"/><path d="M60 80V22"/><path d="M62 26l28 46H62z"/><path d="M58 30L36 70h22"/><path d="M60 22l11 4-11 4"/><path d="M8 104q8-6 16 0t16 0 16 0 16 0 16 0 16 0 16 0"/>'
  'lampstand' = '<path d="M60 40v56"/><path d="M48 40v4a12 12 0 0 0 24 0v-4"/><path d="M36 40v4a24 24 0 0 0 48 0v-4"/><path d="M24 40v4a36 36 0 0 0 72 0v-4"/><path d="M44 104q16-12 32 0z"/><path d="M24 36c-3-4-3-8 0-12 3 4 3 8 0 12z"/><path d="M36 36c-3-4-3-8 0-12 3 4 3 8 0 12z"/><path d="M48 36c-3-4-3-8 0-12 3 4 3 8 0 12z"/><path d="M60 36c-3-4-3-8 0-12 3 4 3 8 0 12z"/><path d="M72 36c-3-4-3-8 0-12 3 4 3 8 0 12z"/><path d="M84 36c-3-4-3-8 0-12 3 4 3 8 0 12z"/><path d="M96 36c-3-4-3-8 0-12 3 4 3 8 0 12z"/>'
  'church'    = '<path d="M14 98h92"/><path d="M24 98V60h72v38"/><path d="M36 60a24 24 0 0 1 48 0"/><path d="M60 36V20M53 26h14"/><path d="M54 98V84a6 6 0 0 1 12 0v14"/><path d="M33 80v-8a4 4 0 0 1 8 0v8M79 80v-8a4 4 0 0 1 8 0v8"/><path d="M18 60l42-6 42 6"/>'
  'book'      = '<path d="M14 88q23-10 46 0 23-10 46 0V46q-23-10-46 0-23-10-46 0z"/><path d="M60 46v42"/><path d="M24 56q14-5 28 0M24 66q14-5 28 0M24 76q14-5 28 0"/><path d="M68 56q14-5 28 0M68 66q14-5 28 0"/><path d="M86 18q18-8 22-4-2 10-20 24l-10 4z"/><path d="M78 42l-8 14"/>'
  'keys'      = '<path d="M22 30a10 10 0 1 0 20 0a10 10 0 1 0-20 0"/><path d="M39 37l55 55"/><path d="M86 84l8-8M77 75l6-6"/><path d="M78 30a10 10 0 1 0 20 0a10 10 0 1 0-20 0"/><path d="M81 37L26 92"/><path d="M34 84l-8-8M43 75l-6-6"/>'
  'tablets'   = '<path d="M18 102V42a19 19 0 0 1 38 0v60z"/><path d="M64 102V42a19 19 0 0 1 38 0v60z"/><path d="M28 50h18M28 60h18M28 70h18"/><path d="M28 80h18M28 90h18"/><path d="M74 50h18M74 60h18M74 70h18"/><path d="M74 80h18M74 90h18"/>'
  'cosmos'    = '<path d="M60 18c3 24 9 30 32 33-23 3-29 9-32 33-3-24-9-30-32-33 23-3 29-9 32-33z"/><path d="M96 78c1 8 3 10 10 11-7 1-9 3-10 11-1-8-3-10-10-11 7-1 9-3 10-11z"/><path d="M22 82c1 6 2 7 8 8-6 1-7 2-8 8-1-6-2-7-8-8 6-1 7-2 8-8z"/><path d="M24 22v8M20 26h8"/><path d="M98 18v6M95 21h6"/><path d="M60 100v6M57 103h6"/>'
  'tomb'      = '<path d="M4 104h112"/><path d="M10 104q12-40 50-42t50 42"/><path d="M44 104V88a16 16 0 0 1 32 0v16"/><path d="M80 94a10 10 0 1 0 20 0a10 10 0 1 0-20 0"/><path d="M51 32a9 9 0 1 0 18 0a9 9 0 1 0-18 0"/><path d="M60 14v-6M44 20l-4-4M76 20l4-4M38 34h-6M82 34h6"/>'
  'basilica'  = '<path d="M14 104h92"/><path d="M22 100V72h76v28"/><path d="M32 78v22M44 78v22M56 78v22M64 78v22M76 78v22M88 78v22"/><path d="M34 72v-8h52v8"/><path d="M38 64a22 22 0 0 1 44 0"/><path d="M56 42v-6h8v6"/><path d="M60 36V24M55 29h10"/>'
  'door'      = '<path d="M24 104h72"/><path d="M38 104V30h44v74"/><path d="M82 30l16 8v72l-16-6"/><path d="M92 70v4"/><path d="M60 46v12M48 52l-5-5M72 52l5-5M44 66h-7M76 66h7"/><path d="M46 104l-14 12M74 104l14 12"/>'
  'mary'      = '<path d="M46 26a14 14 0 1 0 28 0a14 14 0 1 0-28 0"/><path d="M60 16c-11 0-15 11-15 21 0 15-9 36-15 66h60c-6-30-15-51-15-66 0-10-4-21-15-21z"/><path d="M54 36a6 7 0 1 0 12 0a6 7 0 1 0-12 0"/><path d="M55 70l5-9 5 9"/><path d="M24 30v6M21 33h6"/><path d="M96 30v6M93 33h6"/><path d="M18 62v4M16 64h4M102 62v4M100 64h4"/>'
  'reliquary' = '<path d="M28 104h64"/><path d="M36 104V62h48v42"/><path d="M32 62l28-20 28 20"/><path d="M60 42V22M53 29h14"/><path d="M50 72h20v22H50z"/><path d="M60 78v10M56 83h8"/>'
  'chalice'   = '<path d="M38 52h44c0 20-9 32-22 32S38 72 38 52z"/><path d="M60 84v12"/><path d="M42 104q18-14 36 0z"/><path d="M48 30a12 12 0 1 0 24 0a12 12 0 1 0-24 0"/><path d="M60 23v14M53 30h14"/><path d="M60 10V6M42 16l-3-3M78 16l3-3M34 30h-4M86 30h4"/>'
  'lily'      = '<path d="M60 106V58"/><path d="M60 96c-8-1-14-6-17-14 8 0 14 5 17 14z"/><path d="M60 58c-8-6-10-24-2-40 2 14 6 26 2 40z"/><path d="M60 58c-14 2-30-8-36-24 14 0 28 8 36 24z"/><path d="M60 58c14 2 30-8 36-24-14 0-28 8-36 24z"/><path d="M57 46l-5-12M63 46l5-12M60 46V32"/><path d="M51 33h2M67 33h2M59 31h2"/>'
  'wheat'     = '<path d="M60 108V22"/><path d="M60 40c-7 -2 -10 -8 -10 -14 7 2 10 8 10 14z"/><path d="M60 40c7 -2 10 -8 10 -14 -7 2 -10 8 -10 14z"/><path d="M60 54c-7 -2 -10 -8 -10 -14 7 2 10 8 10 14z"/><path d="M60 54c7 -2 10 -8 10 -14 -7 2 -10 8 -10 14z"/><path d="M60 68c-7 -2 -10 -8 -10 -14 7 2 10 8 10 14z"/><path d="M60 68c7 -2 10 -8 10 -14 -7 2 -10 8 -10 14z"/><path d="M60 30c-4-4-4-10 0-14 4 4 4 10 0 14z"/><path d="M60 108q-6-30-28-52"/><path d="M60 108q6-30 28-52"/><path d="M32 56c-1-8 2-14 8-16 1 7-2 13-8 16z M88 56c1-8-2-14-8-16-1 7 2 13 8 16z"/>'
  'sheep'     = '<path d="M34 58a6 6 0 0 1 12 0a6 6 0 0 1 12 0a6 6 0 0 1 12 0a6 6 0 0 1 12 0a8 8 0 0 1 0 16a6 6 0 0 1 -12 0a6 6 0 0 1 -12 0a6 6 0 0 1 -12 0a6 6 0 0 1 -12 0a8 8 0 0 1 0 -16z"/><path d="M84 60c3-7 15-8 18 0 2 8-4 13-12 11"/><path d="M88 58l-5-7"/><path d="M97 63v1"/><path d="M42 74v16M52 74v16M66 74v16M76 74v16"/><path d="M16 92h88"/>'
  'knock'     = '<path d="M30 104h60"/><path d="M38 104V40a22 22 0 0 1 44 0v64"/><path d="M60 22v82"/><path d="M68 64a5 5 0 1 0 10 0a5 5 0 1 0-10 0"/><path d="M92 54q6 6 0 12M98 48q10 12 0 24"/>'
  'oillamp'   = '<path d="M18 76q40-26 80-6q-38 18-80 6z"/><path d="M18 76c-10-2-10-14 0-14"/><path d="M50 62c0-6 14-6 14 0"/><path d="M98 64c-6-6-6-14 0-22 6 8 6 16 0 22z"/><path d="M48 84h28l-4 10H52z"/><path d="M98 34v-6M86 40l-4-4M110 40l4-4"/>'
  'grapes'    = '<path d="M60 14v14"/><path d="M60 22c10-8 24-6 30 2-10 6-22 6-30-2z"/><path d="M39 40a7 7 0 1 0 14 0a7 7 0 1 0-14 0"/><path d="M53 40a7 7 0 1 0 14 0a7 7 0 1 0-14 0"/><path d="M67 40a7 7 0 1 0 14 0a7 7 0 1 0-14 0"/><path d="M46 53a7 7 0 1 0 14 0a7 7 0 1 0-14 0"/><path d="M60 53a7 7 0 1 0 14 0a7 7 0 1 0-14 0"/><path d="M39 66a7 7 0 1 0 14 0a7 7 0 1 0-14 0"/><path d="M53 66a7 7 0 1 0 14 0a7 7 0 1 0-14 0"/><path d="M67 66a7 7 0 1 0 14 0a7 7 0 1 0-14 0"/><path d="M46 79a7 7 0 1 0 14 0a7 7 0 1 0-14 0"/><path d="M60 79a7 7 0 1 0 14 0a7 7 0 1 0-14 0"/><path d="M53 92a7 7 0 1 0 14 0a7 7 0 1 0-14 0"/>'
  'feast'     = '<path d="M10 82h100"/><path d="M20 82v22M100 82v22"/><path d="M28 60h14l-2 14h-10z"/><path d="M35 74v8M30 82h10"/><path d="M52 82c0-12 9-18 20-18s20 6 20 18"/><path d="M62 70l4 4M72 68l4 4M82 70l4 4"/><path d="M40 40v-6M60 30v-8M80 40v6"/>'
  'bell'      = '<path d="M60 18v10"/><path d="M38 78c0-26 7-48 22-48s22 22 22 48z"/><path d="M32 78h56"/><path d="M55 84a5 5 0 0 0 10 0"/><path d="M22 44q-7 12 0 24M98 44q7 12 0 24"/>'
  'lectern'   = '<path d="M24 58q18-9 36 0 18-9 36 0V34q-18-9-36 0-18-9-36 0z"/><path d="M60 34v24"/><path d="M32 42q10-4 20 0M32 50q10-4 20 0M68 42q10-4 20 0M68 50q10-4 20 0"/><path d="M60 60v36"/><path d="M48 96h24M42 104h36"/>'
  'gifts'     = '<path d="M10 92h100"/><path d="M16 92c0-16 12-26 28-26s28 10 28 26"/><path d="M30 76l6 6M42 72l6 6M54 76l6 6"/><path d="M84 38h12M86 38v8c-8 4-10 14-8 26 1 14 6 20 12 20s11-6 12-20c2-12 0-22-8-26v-8"/><path d="M82 64h28"/>'
  'monstrance'= '<path d="M48 40a12 12 0 1 0 24 0a12 12 0 1 0-24 0"/><path d="M60 16v-6M60 64v6M36 40h-6M84 40h6M43 23l-4-4M77 23l4-4M43 57l-4 4M77 57l4 4"/><path d="M60 70v24"/><path d="M53 80h14"/><path d="M42 104q18-14 36 0z"/>'
  'cross'     = '<path d="M60 16v88"/><path d="M38 42h44"/><path d="M24 30l8 6M96 30l-8 6"/><path d="M18 62h10M102 62H92"/><path d="M26 92l8-5M94 92l-8-5"/>'
  'shell'     = '<path d="M18 72a42 42 0 0 1 84 0"/><path d="M18 72l42 20 42-20"/><path d="M60 92L26 50M60 92L38 36M60 92L52 29M60 92L68 29M60 92L82 36M60 92L94 50"/><path d="M60 98c-3 4-3 7 0 8 3-1 3-4 0-8z"/><path d="M48 104c-2 3-2 5 0 6 2-1 2-3 0-6zM72 104c-2 3-2 5 0 6 2-1 2-3 0-6z"/>'
  'trinity'   = '<path d="M38 46a22 22 0 1 0 44 0a22 22 0 1 0-44 0"/><path d="M21 76a22 22 0 1 0 44 0a22 22 0 1 0-44 0"/><path d="M55 76a22 22 0 1 0 44 0a22 22 0 1 0-44 0"/><path d="M60 58l-7 12h14z"/>'
  'shield'    = '<path d="M60 14l38 14v26c0 26-16 44-38 52-22-8-38-26-38-52V28z"/><path d="M60 34v52M42 52h36"/><path d="M60 22v-8"/>'
  'scroll'    = '<path d="M30 30h56a8 8 0 0 1 8 8v52"/><path d="M30 30a8 8 0 0 0 0 16h8V30"/><path d="M38 46v52a8 8 0 0 0 8 8h52a8 8 0 0 0 0-16H46"/><path d="M48 52h34M48 62h34M48 72h24"/><path d="M90 90a8 8 0 0 1-8 8"/>'
  'rose'      = '<path d="M60 36c-7 0-11 5-9 11 2 5 9 6 13 2 3-3 2-9-3-10"/><path d="M48 46c-9 0-14 8-11 16 4 9 20 11 28 3"/><path d="M72 46c9 0 14 8 11 16-3 8-13 12-22 9"/><path d="M36 58c-7 13 3 28 24 28s31-15 24-28"/><path d="M60 86v26"/><path d="M60 102c-9-1-15-7-17-14 9 0 15 6 17 14z"/><path d="M60 96c8-1 13-6 15-12-8 0-13 5-15 12z"/>'
  'beads'     = '<path d="M60 78v12"/><path d="M41.5 74.0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0"/><path d="M30.5 63.0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0"/><path d="M26.5 48.0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0"/><path d="M30.5 33.0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0"/><path d="M41.5 22.0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0"/><path d="M56.5 18.0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0"/><path d="M71.5 22.0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0"/><path d="M82.5 33.0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0"/><path d="M86.5 48.0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0"/><path d="M82.5 63.0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0"/><path d="M71.5 74.0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0"/><path d="M60 92v20M53 99h14"/>'
  'scales'    = '<path d="M60 18v82"/><path d="M42 104h36"/><path d="M22 34h76"/><path d="M56 22a4 4 0 1 0 8 0a4 4 0 1 0-8 0"/><path d="M22 34L10 66M22 34l12 32"/><path d="M98 34L86 66M98 34l12 32"/><path d="M8 66q14 14 28 0z"/><path d="M84 66q14 14 28 0z"/>'
  'candle'    = '<path d="M34 104h52"/><path d="M47 104V58h26v46"/><path d="M60 58v-8"/><path d="M60 48c-7-6-7-15 0-24 7 9 7 18 0 24z"/><path d="M60 14V6M40 22l-5-5M80 22l5-5M32 38h-7M88 38h7"/>'
  'star'      = '<path d="M60 12l6 34 32 6-32 6-6 50-6-50-32-6 32-6z"/><path d="M45 37l-7-7M75 37l7-7M45 67l-7 7M75 67l7 7"/><path d="M22 22v6M19 25h6"/><path d="M98 90v6M95 93h6"/><path d="M16 106h88"/>'
  'thorns'    = '<path d="M16 60a44 20 0 1 0 88 0a44 20 0 1 0-88 0"/><path d="M18 52c20 18 64 20 84 2M18 68c20-18 64-20 84-2"/><path d="M28 46l-5-9M46 42l-2-10M66 41l2-10M84 44l5-9M100 52l9-3M20 54l-9-4M28 75l-5 8M48 80l-2 10M70 80l2 10M90 75l5 8"/>'
  'dove'      = '<path d="M60 75c-5 0-8-4-8-10 0-12 3-24 8-34 5 10 8 22 8 34 0 6-3 10-8 10z"/><path d="M55 81a5 5 0 1 0 10 0a5 5 0 1 0-10 0"/><path d="M54 48C40 34 24 32 10 38c10 4 18 10 22 18 8-2 16-4 22-6z"/><path d="M66 48c14-14 30-16 44-10-10 4-18 10-22 18-8-2-16-4-22-6z"/><path d="M56 32l-5-16h18l-5 16"/><path d="M60 94v12M46 92l-6 10M74 92l6 10"/>'
  'tabor'     = '<path d="M6 104L42 58l12 12 20-34 40 68"/><path d="M58 52l8-6M74 36l4 12"/><path d="M74 26v-12M58 30l-7-8M90 30l7-8M54 44h-9M94 44h9"/><path d="M14 112h92"/>'
  'stars12'   = '<path d="M60.0 12.5v7.0M56.5 16.0h7.0M81.0 18.1v7.0M77.5 21.6h7.0M96.4 33.5v7.0M92.9 37.0h7.0M102.0 54.5v7.0M98.5 58.0h7.0M96.4 75.5v7.0M92.9 79.0h7.0M81.0 90.9v7.0M77.5 94.4h7.0M60.0 96.5v7.0M56.5 100.0h7.0M39.0 90.9v7.0M35.5 94.4h7.0M23.6 75.5v7.0M20.1 79.0h7.0M18.0 54.5v7.0M14.5 58.0h7.0M23.6 33.5v7.0M20.1 37.0h7.0M39.0 18.1v7.0M35.5 21.6h7.0"/><path d="M42 74V44l18 22 18-22v30"/>'
  'tools'     = '<path d="M22 26h12v62h66v12H22z"/><path d="M58 22h40v14H58z"/><path d="M76 36v44"/><path d="M98 29h8"/>'
  'sword'     = '<path d="M60 10l6 10v62H54V20z"/><path d="M60 22v56"/><path d="M38 82h44"/><path d="M60 82v16"/><path d="M55 104a5 5 0 1 0 10 0a5 5 0 1 0-10 0"/>'
  'eagle'     = '<path d="M60 44c-6 0-9 8-9 18s4 20 9 28c5-8 9-18 9-28s-3-18-9-18z"/><path d="M54 34a6 6 0 1 0 12 0a6 6 0 1 0-12 0"/><path d="M66 33l9 3-8 3"/><path d="M48 32a12 12 0 0 1 24 0"/><path d="M52 56C40 34 24 26 8 28c10 6 14 14 16 22-6 1-10 5-12 9 12-3 26-2 40 2z"/><path d="M68 56c12-22 28-30 44-28-10 6-14 14-16 22 6 1 10 5 12 9-12-3-26-2-40 2z"/><path d="M54 88l-8 16h28l-8-16"/>'
  'heart'     = '<path d="M60 102C32 84 20 68 20 52a20 20 0 0 1 40-8 20 20 0 0 1 40 8c0 16-12 32-40 50z"/><path d="M60 34c-7-6-7-15 0-24 7 9 7 18 0 24z"/><path d="M14 98L104 34"/><path d="M104 34l-11 1M104 34l-2 11"/><path d="M14 98l1-9M14 98l9-1"/>'
  'sun'       = '<path d="M42 60a18 18 0 1 0 36 0a18 18 0 1 0-36 0"/><path d="M60.0 35.0L60.0 14.0M69.6 36.9L73.8 26.7M77.7 42.3L92.5 27.5M83.1 50.4L93.3 46.2M85.0 60.0L106.0 60.0M83.1 69.6L93.3 73.8M77.7 77.7L92.5 92.5M69.6 83.1L73.8 93.3M60.0 85.0L60.0 106.0M50.4 83.1L46.2 93.3M42.3 77.7L27.5 92.5M36.9 69.6L26.7 73.8M35.0 60.0L14.0 60.0M36.9 50.4L26.7 46.2M42.3 42.3L27.5 27.5M50.4 36.9L46.2 26.7"/>'
  'tau'       = '<path d="M22 24h76v16H68v66H52V40H22z"/><path d="M60 14v-4M44 16l-3-3M76 16l3-3"/>'
  'ihs'       = '<path d="M30 60a30 30 0 1 0 60 0a30 30 0 1 0-60 0"/><path d="M60.0 25.0L60.0 8.0M69.1 26.2L71.4 17.5M77.5 29.7L86.0 15.0M84.7 35.3L91.1 28.9M90.3 42.5L105.0 34.0M93.8 50.9L102.5 48.6M95.0 60.0L112.0 60.0M93.8 69.1L102.5 71.4M90.3 77.5L105.0 86.0M84.7 84.7L91.1 91.1M77.5 90.3L86.0 105.0M69.1 93.8L71.4 102.5M60.0 95.0L60.0 112.0M50.9 93.8L48.6 102.5M42.5 90.3L34.0 105.0M35.3 84.7L28.9 91.1M29.7 77.5L15.0 86.0M26.2 69.1L17.5 71.4M25.0 60.0L8.0 60.0M26.2 50.9L17.5 48.6M29.7 42.5L15.0 34.0M35.3 35.3L28.9 28.9M42.5 29.7L34.0 15.0M50.9 26.2L48.6 17.5"/><path d="M45 52v18"/><path d="M52 52v18M52 61h10M62 52v18"/><path d="M77 54c-1-3-9-3-9 1.5s9 3.5 9 8.5-8 5-10 1.5"/><path d="M57 46v-10M53 40h8"/>'
  'cupsnake'  = '<path d="M38 46h44c0 18-9 28-22 28S38 64 38 46z"/><path d="M60 74v16"/><path d="M44 104q16-14 32 0z"/><path d="M58 46c-8-6 6-12-2-18-6-5 4-12 10-8"/><path d="M66 20l6-2-3 6"/>'
  'shamrock'  = '<path d="M60 58c-12-4-18-14-12-22 4-5 10-3 12 2 2-5 8-7 12-2 6 8 0 18-12 22z"/><path transform="rotate(120 60 58)" d="M60 58c-12-4-18-14-12-22 4-5 10-3 12 2 2-5 8-7 12-2 6 8 0 18-12 22z"/><path transform="rotate(240 60 58)" d="M60 58c-12-4-18-14-12-22 4-5 10-3 12 2 2-5 8-7 12-2 6 8 0 18-12 22z"/><path d="M60 58q6 26 20 46"/>'
  'arms'      = '<path d="M22 16h76v44c0 28-18 42-38 50-20-8-38-22-38-50z"/><path d="M70 16v86"/><path d="M22 42h76"/><path d="M32 86V62l9 12 9-12v24"/>'
  'hand'      = '<path d="M46 108V70l-10-16c-3-5 3-9 7-5l9 11V28c0-5 8-5 8 0v26-32c0-5 8-5 8 0v32-26c0-5 8-5 8 0v30-20c0-5 8-5 8 0v40c0 18-8 30-20 30z"/><path d="M58 80a4 4 0 1 0 8 0a4 4 0 1 0-8 0"/>'
  'lion'      = '<path d="M60.0 20.0Q71.6 9.3 77.4 24.0Q92.4 19.3 91.3 35.1Q106.9 37.4 99.0 51.1Q112.0 60.0 99.0 68.9Q106.9 82.6 91.3 84.9Q92.4 100.7 77.4 96.0Q71.6 110.7 60.0 100.0Q48.4 110.7 42.6 96.0Q27.6 100.7 28.7 84.9Q13.1 82.6 21.0 68.9Q8.0 60.0 21.0 51.1Q13.1 37.4 28.7 35.1Q27.6 19.3 42.6 24.0Q48.4 9.3 60.0 20.0z"/><path d="M36 54c0-16 10-26 24-26s24 10 24 26c0 18-10 32-24 32S36 72 36 54z"/><path d="M48 52h4M68 52h4"/><path d="M54 66h12l-6 6z"/><path d="M60 72v4M52 80q8 4 16 0"/>'
}
function Ill-Art([string]$name) {
  if (-not $Ill[$name]) { return '' }
  "<div class=`"ill-art`" aria-hidden=`"true`"><svg viewBox=`"0 0 120 120`">$($Ill[$name] -replace '<path ', '<path pathLength="1" ' -replace '/>', '></path>')</svg></div>"
}
# -Kick and -Sub may be empty; -Body is the section's own content, under the heading
function Ill-Sec([string]$Id, [string]$Art, [string]$Tone, [string]$Kick, [string]$Head, [string]$Body, [string]$Sub = '', [string]$HeadId = '', [string]$Class = '') {
  $k = if ($Kick) { "<p class=`"ill-kick`">$Kick</p>" } else { '' }
  $hid = if ($HeadId) { " id=`"$HeadId`"" } else { '' }
  $lab = if ($HeadId) { " aria-labelledby=`"$HeadId`"" } else { '' }
  "<section id=`"$Id`" class=`"ill-sec tone-$Tone$(if ($Class) { " $Class" })`"$lab>$(Ill-Art $Art)<div class=`"ill-body`">$k<h2 class=`"ill-h`"$hid>$Head</h2>$Sub$Body</div></section>"
}
# Jerusalem cross: large cross potent in the centre, a small cross in each quadrant (100x100 grid)
$CrossShapes = '<rect x="44" y="12" width="12" height="76"/><rect x="12" y="44" width="76" height="12"/><rect x="33" y="8" width="34" height="9"/><rect x="33" y="83" width="34" height="9"/><rect x="8" y="33" width="9" height="34"/><rect x="83" y="33" width="9" height="34"/><rect x="23.5" y="18" width="5" height="16"/><rect x="18" y="23.5" width="16" height="5"/><rect x="71.5" y="18" width="5" height="16"/><rect x="66" y="23.5" width="16" height="5"/><rect x="23.5" y="66" width="5" height="16"/><rect x="18" y="71.5" width="16" height="5"/><rect x="71.5" y="66" width="5" height="16"/><rect x="66" y="71.5" width="16" height="5"/>'
$Logo = '<svg class="logo" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g fill="currentColor">' + $CrossShapes + '</g></svg>'

# The header's mark: a Christian fish (ichthys) facing left with a small cross in its body, softly
# glowing like the rosary's cross; on hover or focus it turns over to a static Jerusalem cross.
# The cross: a cross potent (arms ending in bars) with four small crosses, drawn on a 100 grid with
# every gap the same, so it stays crisp at 28px
$IchthysSvg = '<svg viewBox="0 0 48 24" focusable="false"><path d="M3 12C13-.5 33-1 45 20.5M3 12C13 24.5 33 25 45 3.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M24 6.5v11M19.5 11h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
$JerusalemSvg = '<svg viewBox="0 0 100 100" focusable="false"><g fill="currentColor"><rect x="44.5" y="10" width="11" height="80" rx="1"/><rect x="10" y="44.5" width="80" height="11" rx="1"/><rect x="32" y="7" width="36" height="9" rx="1"/><rect x="32" y="84" width="36" height="9" rx="1"/><rect x="7" y="32" width="9" height="36" rx="1"/><rect x="84" y="32" width="9" height="36" rx="1"/><rect x="24.5" y="18" width="5" height="18" rx=".6"/><rect x="18" y="24.5" width="18" height="5" rx=".6"/><rect x="70.5" y="18" width="5" height="18" rx=".6"/><rect x="64" y="24.5" width="18" height="5" rx=".6"/><rect x="24.5" y="64" width="5" height="18" rx=".6"/><rect x="18" y="70.5" width="18" height="5" rx=".6"/><rect x="70.5" y="64" width="5" height="18" rx=".6"/><rect x="64" y="70.5" width="18" height="5" rx=".6"/></g></svg>'
$BrandMark = '<span class="bm" aria-hidden="true"><span class="bm-in"><span class="bm-face bm-fish"><span class="bm-halo"></span>' + $IchthysSvg + '</span><span class="bm-face bm-cross">' + $JerusalemSvg + '</span></span></span>'
# The name in capitals (a tiny EB Garamond subset holding only these letters, preloaded); read as
# words by screen readers
$BrandName = '<span class="brand-name"><span class="visually-hidden">Katolik Dünyası</span><span class="bn" lang="tr" aria-hidden="true"><span class="bn-c">K</span>ATOLİK <span class="bn-c">D</span>ÜNYASI</span></span>'
$Favicon = 'data:image/svg+xml,' + ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#16161a"/><g fill="#d6b16b" transform="translate(12 12) scale(.76)">' + $CrossShapes + '</g></svg>').Replace('<', '%3C').Replace('>', '%3E').Replace('#', '%23').Replace('"', "'")

# ------------------------------------------------------------------ components
$IcoExternal = '<svg class="ext" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>'
# ---- References to the Catechism (CCC / KKK) and to Scripture, linked to their sources
# CCC paragraphs go to the Catechism on vatican.va, in a new window. data/ccc-vatican.json, when
# present, maps paragraph ranges to the vatican.va page holding them ([{ "from": 1420, "to": 1498,
# "url": "https://www.vatican.va/content/catechism/en/..." }]); a paragraph it does not cover
# goes to the Catechism's contents page there.
$CccHome = 'https://www.vatican.va/content/catechism/en.html'
$CccMapFile = Join-Path $Root 'data/ccc-vatican.json'
$CccMap = if (Test-Path $CccMapFile) { @(Get-Content -Raw -Encoding UTF8 $CccMapFile | ConvertFrom-Json) } else { @() }
function Ccc-Url([int]$n) {
  foreach ($r in $CccMap) { if ($n -ge [int]$r.from -and $n -le [int]$r.to) { return $r.url } }
  return $CccHome
}
# "971, 2096–2097, 2132": one link per paragraph or range; a "CIC kan." (canon law) part stays text
function Ccc-Link([string]$text, [string]$lang) {
  $title = TA 'title' "Katolik Kilisesi Katekizmi, vatican.va (yeni pencerede açılır)" 'Catechism of the Catholic Church, vatican.va (opens in a new window)'
  $parts = $text -split ' · '
  $out = foreach ($part in $parts) {
    if ($part -match '^\s*CIC') { if ($part -match 'kan\.') { T $part ($part -replace 'kan\.', 'can.') } else { $part }; continue }
    $pre = ''; $body = $part
    if ($part -match '^(\s*(?:CCC|KKK)\s)(.*)$') { $pre = $Matches[1]; $body = $Matches[2] }
    $items = $body -split ',\s*'
    $pre + (($items | ForEach-Object {
      if ($_ -match '^(\d{1,4})') { "<a href=`"$(Ccc-Url ([int]$Matches[1]))`" target=`"_blank`" rel=`"noopener`" $title>$_</a>" } else { $_ }
    }) -join ', ')
  }
  $h = $out -join ' · '
  # the small "opens elsewhere" arrow rides inside the last link, so it never wraps onto a line alone
  $i = $h.LastIndexOf('</a>')
  if ($i -ge 0) { return $h.Substring(0, $i) + $IcoExternal + $h.Substring($i) }
  return $h
}
# Scripture: every "Matta 13:1–23", "1. Korintliler 12:13", "Luke 15:3–7" in a page's text links
# to that passage on BibleGateway, in the Revised Standard Version, Catholic Edition.
$BibleBooks = [ordered]@{
  'Yaratılış' = 'Genesis'; "Mısır’dan Çıkış" = 'Exodus'; "Mısır'dan Çıkış" = 'Exodus'; 'Çıkış' = 'Exodus'; 'Levililer' = 'Leviticus'
  'Çölde Sayım' = 'Numbers'; 'Sayılar' = 'Numbers'; "Yasa’nın Tekrarı" = 'Deuteronomy'; "Yasa'nın Tekrarı" = 'Deuteronomy'
  'Yeşu' = 'Joshua'; 'Hakimler' = 'Judges'; 'Rut' = 'Ruth'; 'Samuel' = 'Samuel'; 'Krallar' = 'Kings'; 'Tarihler' = 'Chronicles'
  'Ezra' = 'Ezra'; 'Nehemya' = 'Nehemiah'; 'Tobit' = 'Tobit'; 'Yudit' = 'Judith'; 'Ester' = 'Esther'
  'Makabeler' = 'Maccabees'; 'Makkabiler' = 'Maccabees'; 'Eyüp' = 'Job'; 'Mezmurlar' = 'Psalm'; 'Mezmur' = 'Psalm'
  "Süleyman’ın Özdeyişleri" = 'Proverbs'; "Süleyman'ın Özdeyişleri" = 'Proverbs'; 'Özdeyişler' = 'Proverbs'; 'Vaiz' = 'Ecclesiastes'
  'Ezgiler Ezgisi' = 'Song of Songs'; 'Neşideler Neşidesi' = 'Song of Songs'; 'Bilgelik' = 'Wisdom'; 'Sirak' = 'Sirach'
  'Yeşaya' = 'Isaiah'; 'Yeremya' = 'Jeremiah'; 'Ağıtlar' = 'Lamentations'; 'Baruk' = 'Baruch'; 'Hezekiel' = 'Ezekiel'; 'Daniel' = 'Daniel'
  'Hoşea' = 'Hosea'; 'Yoel' = 'Joel'; 'Amos' = 'Amos'; 'Ovadya' = 'Obadiah'; 'Yunus' = 'Jonah'; 'Mika' = 'Micah'; 'Nahum' = 'Nahum'
  'Habakkuk' = 'Habakkuk'; 'Sefanya' = 'Zephaniah'; 'Hagay' = 'Haggai'; 'Zekeriya' = 'Zechariah'; 'Malaki' = 'Malachi'
  'Matta' = 'Matthew'; 'Markos' = 'Mark'; 'Luka' = 'Luke'; 'Yuhanna' = 'John'; 'Elçilerin İşleri' = 'Acts'; 'Romalılar' = 'Romans'
  'Korintliler' = 'Corinthians'; 'Galatyalılar' = 'Galatians'; 'Efesliler' = 'Ephesians'; 'Filipililer' = 'Philippians'
  'Koloseliler' = 'Colossians'; 'Selanikliler' = 'Thessalonians'; 'Timoteos' = 'Timothy'; 'Titus' = 'Titus'; 'Filimon' = 'Philemon'
  'İbraniler' = 'Hebrews'; 'Yakup' = 'James'; 'Petrus' = 'Peter'; 'Yahuda' = 'Jude'; 'Vahiy' = 'Revelation'
  'Genesis' = 'Genesis'; 'Exodus' = 'Exodus'; 'Leviticus' = 'Leviticus'; 'Numbers' = 'Numbers'; 'Deuteronomy' = 'Deuteronomy'
  'Psalms' = 'Psalm'; 'Psalm' = 'Psalm'; 'Proverbs' = 'Proverbs'; 'Isaiah' = 'Isaiah'; 'Jeremiah' = 'Jeremiah'; 'Wisdom' = 'Wisdom'; 'Sirach' = 'Sirach'
  'Matthew' = 'Matthew'; 'Mark' = 'Mark'; 'Luke' = 'Luke'; 'John' = 'John'; 'Jn' = 'John'; 'Acts' = 'Acts'; 'Romans' = 'Romans'
  'Corinthians' = 'Corinthians'; 'Galatians' = 'Galatians'; 'Ephesians' = 'Ephesians'; 'Philippians' = 'Philippians'
  'Colossians' = 'Colossians'; 'Thessalonians' = 'Thessalonians'; 'Timothy' = 'Timothy'; 'Hebrews' = 'Hebrews'; 'James' = 'James'
  'Peter' = 'Peter'; 'Revelation' = 'Revelation'; 'Joshua' = 'Joshua'; 'Judges' = 'Judges'; 'Ruth' = 'Ruth'; 'Kings' = 'Kings'
  'Chronicles' = 'Chronicles'; 'Nehemiah' = 'Nehemiah'; 'Judith' = 'Judith'; 'Esther' = 'Esther'; 'Maccabees' = 'Maccabees'; 'Job' = 'Job'
  'Ecclesiastes' = 'Ecclesiastes'; 'Song of Songs' = 'Song of Songs'; 'Lamentations' = 'Lamentations'; 'Baruch' = 'Baruch'; 'Ezekiel' = 'Ezekiel'
  'Hosea' = 'Hosea'; 'Joel' = 'Joel'; 'Obadiah' = 'Obadiah'; 'Jonah' = 'Jonah'; 'Micah' = 'Micah'; 'Zephaniah' = 'Zephaniah'; 'Haggai' = 'Haggai'
  'Zechariah' = 'Zechariah'; 'Malachi' = 'Malachi'; 'Philemon' = 'Philemon'; 'Jude' = 'Jude'
}
$bookAlt = (($BibleBooks.Keys | Sort-Object { -$_.Length }) | ForEach-Object { [regex]::Escape($_) }) -join '|'
$VerseList = '\d{1,3}(?:\s?[-–]\s?\d{1,3})?(?:,\s?\d{1,3}(?:[-–]\d{1,3})?(?!\d*:))*'
$ScriptureRx = [regex]"(?<![\p{L}\d’'])(?:(?<n>[1-3])\.?\s)?(?<b>$bookAlt)\s(?<c>\d{1,3}):(?<v>$VerseList)"
$ScriptureMoreRx = [regex]"(?<a><a class=`"bref`" data-b=`"(?<eb>[^`"]+)`"[^>]*>[^<]*</a>)(?<sep>;\s?)(?<c>\d{1,3}):(?<v>$VerseList)"
$KkkRx = [regex]"(?<![\p{L}\d])(?<k>KKK|CCC)\s(?<p>\d{1,4}(?:\s?[-–]\s?\d{1,4})?(?:,\s?\d{1,4}(?:[-–]\d{1,4})?)*)"
function Bible-Url([string]$book, [string]$c, [string]$v) {
  $q = "$book $($c):$(($v -replace '–', '-') -replace '\s', '')"
  return "https://www.biblegateway.com/passage/?search=$([uri]::EscapeDataString($q))&amp;version=RSVCE"
}
$ScriptureEval = [System.Text.RegularExpressions.MatchEvaluator]{
  param($m)
  $en = $BibleBooks[$m.Groups['b'].Value]
  if ($m.Groups['n'].Success) { $en = "$($m.Groups['n'].Value) $en" }
  "<a class=`"bref`" data-b=`"$en`" href=`"$(Bible-Url $en $m.Groups['c'].Value $m.Groups['v'].Value)`" target=`"_blank`" rel=`"noopener`">$($m.Value)</a>"
}
$ScriptureMoreEval = [System.Text.RegularExpressions.MatchEvaluator]{
  param($m)
  $en = $m.Groups['eb'].Value; $t = "$($m.Groups['c'].Value):$($m.Groups['v'].Value)"
  "$($m.Groups['a'].Value)$($m.Groups['sep'].Value)<a class=`"bref`" data-b=`"$en`" href=`"$(Bible-Url $en $m.Groups['c'].Value $m.Groups['v'].Value)`" target=`"_blank`" rel=`"noopener`">$t</a>"
}
$KkkEval = [System.Text.RegularExpressions.MatchEvaluator]{
  param($m)
  $first = [int]([regex]::Match($m.Groups['p'].Value, '\d+').Value)
  "<a class=`"cref`" href=`"$(Ccc-Url $first)`" target=`"_blank`" rel=`"noopener`" title=`"Katolik Kilisesi Katekizmi, vatican.va`" data-en-title=`"Catechism of the Catholic Church, vatican.va`">$($m.Value)</a>"
}
# Only the text between tags, and none inside a link, a script or a style, is looked at
function Link-Refs([string]$html) {
  $parts = [regex]::Split($html, '(<[^>]+>)')
  $inA = 0; $skip = 0
  $sb = [System.Text.StringBuilder]::new()
  foreach ($p in $parts) {
    if ($p.StartsWith('<')) {
      if ($p -match '^<a[\s>]') { $inA++ } elseif ($p -match '^</a>') { $inA = [Math]::Max(0, $inA - 1) }
      elseif ($p -match '^<(script|style|textarea|title|summary)[\s>]') { $skip++ } elseif ($p -match '^</(script|style|textarea|title|summary)>') { $skip = [Math]::Max(0, $skip - 1) }
      [void]$sb.Append($p); continue
    }
    if ($inA -or $skip -or $p.Length -lt 6) { [void]$sb.Append($p); continue }
    $t = $ScriptureRx.Replace($p, $ScriptureEval)
    for ($k = 0; $k -lt 6; $k++) { $t2 = $ScriptureMoreRx.Replace($t, $ScriptureMoreEval); if ($t2 -eq $t) { break }; $t = $t2 }
    $t = $KkkRx.Replace($t, $KkkEval)
    [void]$sb.Append($t)
  }
  return $sb.ToString()
}
function Qa-Html($it, [int]$hl) {
  $n = $it.n; $tag = HTag $hl
  # a translator's note belongs to the Turkish only
  $note = if ($it.note) { TO "<p class=`"note`"><b>Not:</b> $(Inline $it.note)</p>" } else { '' }
  return "<article class=`"qa`" id=`"soru-$n`" data-n=`"$n`">" +
    "<header class=`"qa-head`"><a class=`"qa-num`" href=`"#soru-$n`" $(TA 'aria-label' "Soru $n bağlantısı" "Link to question $n")>$n</a><$tag class=`"qa-q`">$(T (Inline $it.tr.q) (Inline $it.en.q))</$tag></header>" +
    "<p class=`"qa-ref`" $(TA 'title' 'Katolik Kilisesi Katekizmi madde numaraları' 'Paragraph numbers in the Catechism of the Catholic Church')>$(Ccc-Link $it.ccc 'tr')</p>" +
    "<div class=`"qa-a`">$(TB (Blocks $it.tr.a) (Blocks $it.en.a))</div>$note" +
    "</article>"
}
# $tagLevel is the true HTML heading level (never skips a level in the DOM); it can
# differ from $it.level, which only sets the sec-l$level class (visual size) — e.g. a
# bridging title like "The Creed" sits right under a Part heading and is styled a size
# smaller (sec-l4) even though it is only one level deep, not four.
function Heading-Html($it, [int]$tagLevel) {
  $tag = HTag $tagLevel
  $tr = Split-Heading $it.tr
  $enH = Split-Heading $it.en
  $label = if ($tr[0]) { "<span class=`"sec-label`">$(T $tr[0] $enH[0])</span>" } else { '' }
  return "<$tag class=`"sec sec-l$($it.level)`" id=`"$($it.id)`">$label<span class=`"sec-title`">$(T (Inline $tr[1]) (Inline $enH[1]))</span></$tag>"
}
function Quote-Html($it) {
  $t = Split-Attr $it.tr; $e = Split-Attr $it.en
  $cap = if ($t[1]) { "<figcaption class=`"attr`">$(T (Inline $t[1]) $e[1])</figcaption>" } else { '' }
  return "<figure class=`"quote`"><blockquote><p>$(T (Inline $t[0]) (Inline $e[0]))</p></blockquote>$cap</figure>"
}
# Card with Turkish text, English original on demand and optional Latin
function Text-Card($obj, [string]$id, [int]$hl, [string]$bodyTr, [string]$bodyEn) {
  $tag = HTag $hl
  $html = "<article class=`"text-card`" id=`"$id`"><$tag class=`"t-title`">$(T (Inline $obj.tr.title) (Inline $obj.en.title))</$tag>$(TB $bodyTr $bodyEn)"
  if ($obj.la) { $html += "<details class=`"latin`"><summary>$(T 'Latince metin' 'Latin text'): $($obj.la.title)</summary><div class=`"verse`" lang=`"la`">$(Verse $obj.la.text)</div></details>" }
  return $html + '</article>'
}
function Decalogue-Table($d) {
  $head = '<thead><tr>' + (($d.cols | ForEach-Object { "<th scope=`"col`">$_</th>" }) -join '') + '</tr></thead>'
  $rows = @($d.rows); $body = New-Object Text.StringBuilder
  for ($r = 0; $r -lt $rows.Count; $r++) {
    [void]$body.Append('<tr>'); $row = @($rows[$r])
    for ($c = 0; $c -lt $row.Count; $c++) {
      if ($null -eq $row[$c]) { continue }
      $span = if ($c -eq 0 -and $r + 1 -lt $rows.Count -and $null -eq @($rows[$r + 1])[0]) { ' rowspan="2"' } else { '' }
      [void]$body.Append("<td data-label=`"$(Attr $d.cols[$c])`"$span>$(Verse $row[$c])</td>")
    }
    [void]$body.Append('</tr>')
  }
  return "<div class=`"verse`"><table>$head<tbody>$($body.ToString())</tbody></table></div>"
}
function Special-Html([string]$ref, [int]$hl) {
  switch ($ref) {
    'creeds' {
      $cards = ($X.creeds | ForEach-Object { Text-Card $_ $_.id $hl "<div class=`"verse`">$(Verse $_.tr.text)</div>" "<div class=`"verse`">$(Verse $_.en.text)</div>" }) -join ''
      return "<div class=`"text-grid two`">$cards</div>"
    }
    'decalogue' {
      $d = $X.decalogue
      $obj = [pscustomobject]@{ tr = [pscustomobject]@{ title = $d.tr.title }; en = [pscustomobject]@{ title = $d.en.title }; la = $null }
      return "<div class=`"text-grid decalogue`">$(Text-Card $obj 'on-emir-tablosu' $hl (Decalogue-Table $d.tr) (Decalogue-Table $d.en))</div>"
    }
    'our-father' {
      $o = $X.ourFather
      $trV = '<div class="verse">' + (Verse $o.tr.text) + '</div>'
      $enV = '<div class="verse">' + (Verse $o.en.text) + '</div>'
      return '<div class="text-grid">' + (Text-Card $o 'goklerdeki-babamiz-duasi' $hl $trV $enV) + '</div>'
    }
  }
  return ''
}
# Renders a part's items in order; the level-1 heading is the page <h1>, so it is skipped
function Render-Items($items) {
  $sb = New-Object Text.StringBuilder; $current = 1
  foreach ($it in $items) {
    switch ($it.type) {
      'heading' {
        if ($it.level -gt 1) {
          $tagLevel = [Math]::Min([int]$it.level, $current + 1)
          [void]$sb.Append((Heading-Html $it $tagLevel))
          $current = $tagLevel
        } else {
          $current = [int]$it.level
        }
      }
      'qa'      { [void]$sb.Append((Qa-Html $it ($current + 1))) }
      'quote'   { [void]$sb.Append((Quote-Html $it)) }
      'special' { [void]$sb.Append((Special-Html $it.ref ($current + 1))) }
    }
    [void]$sb.Append("`n")
  }
  return $sb.ToString()
}

# English mirror of the Render-Items pipeline above: English primary, Turkish behind the
# toggle (reverse of the Turkish pages). Kept as separate functions rather than threading a
# $lang flag through the existing ones, so the well-tested Turkish rendering can never regress
# from a change made for the English side.

# ------------------------------------------------------------------ page shell
# ---------------- content/*.md pages (front matter + minimal Markdown)
function Read-Md([string]$name) {
  $p = Join-Path (Join-Path $Root 'content') $name
  $md = if (Test-Path $p) { [IO.File]::ReadAllText($p, [Text.Encoding]::UTF8) } else { '' }
  $meta = @{}
  $fmm = [regex]::Match($md, '^\uFEFF?\s*---\s*\r?\n([\s\S]*?)\r?\n---\s*(\r?\n|$)')
  if ($fmm.Success) {
    foreach ($line in ($fmm.Groups[1].Value -split "`n")) { $kv = [regex]::Match($line, '^\s*([A-Za-z_]+)\s*:\s*(.*?)\s*$'); if ($kv.Success) { $meta[$kv.Groups[1].Value.ToLower()] = $kv.Groups[2].Value.Trim('"', "'") } }
    $md = $md.Substring($fmm.Length)
  }
  return @{ meta = $meta; body = $md }
}

# ---------------- "Kaynaklar ve telif": content/hakkinda.md (+ -en) is the list shown in the footer's
# sources dialog; its front-matter "about" line is the one-sentence description under the footer tagline.
$aboutFile = Join-Path (Join-Path $Root 'content') 'hakkinda.md'
$aboutMd = if (Test-Path $aboutFile) { [IO.File]::ReadAllText($aboutFile, [Text.Encoding]::UTF8) } else { '' }
$aboutMd = $aboutMd -replace '\{\{TARIH\}\}', $BuildDateTr
$fm = @{}
$fmMatch = [regex]::Match($aboutMd, '^\uFEFF?\s*---\s*\r?\n([\s\S]*?)\r?\n---\s*(\r?\n|$)')
if ($fmMatch.Success) {
  foreach ($line in ($fmMatch.Groups[1].Value -split "`n")) { $kv = [regex]::Match($line, '^\s*([A-Za-z_]+)\s*:\s*(.*?)\s*$'); if ($kv.Success) { $fm[$kv.Groups[1].Value.ToLower()] = $kv.Groups[2].Value.Trim('"', "'") } }
  $aboutMd = $aboutMd.Substring($fmMatch.Length)
}
$h1m = [regex]::Match($aboutMd, '(?m)^#\s+(.+?)\s*$')
if ($h1m.Success) { $aboutMd = $aboutMd.Remove($h1m.Index, $h1m.Length) }
$InfoHtml = Convert-Markdown $aboutMd

$Kk = Read-Md 'kutsal-kitap.md'
$KkMeta = $Kk.meta
$Er = Read-Md 'erisilebilirlik.md'
$ErMeta = $Er.meta
$Gz = Read-Md 'gizlilik.md'
$GzMeta = $Gz.meta
# The English of each of those pages, and of the sources list, in the same files' -en twins
$KkEn = Read-Md 'kutsal-kitap-en.md'
$ErEn = Read-Md 'erisilebilirlik-en.md'
$GzEn = Read-Md 'gizlilik-en.md'
$AboutEn = Read-Md 'hakkinda-en.md'
$fmEn = $AboutEn.meta
$InfoHtmlEn = Convert-Markdown ($AboutEn.body -replace '\{\{TARIH\}\}', $BuildDateEn)

# Top bar: brand, the settings gear (accessibility), the five core links and the
# hamburger that opens the full menu.
$TextNav = @(
  @{ href = 'motu-proprio.html';    t = 'Motu Proprio';                       s = 'XVI. Benediktus, 2005';    te = 'Motu Proprio'; se = 'Benedict XVI, 2005' },
  @{ href = 'giris.html';           t = 'Giriş';                              s = 'Kardinal Ratzinger, 2005'; te = 'Introduction'; se = 'Cardinal Ratzinger, 2005' },
  @{ href = 'iman-ikrari.html';     t = 'I. İnanç Beyanı';                    s = 'Sorular 1–217';            te = 'I. The Profession of Faith'; se = 'Questions 1–217' },
  @{ href = 'kutsal-sirlar.html';   t = 'II. Hristiyan Gizeminin Kutlanması'; s = 'Sorular 218–356';          te = 'II. The Celebration of the Christian Mystery'; se = 'Questions 218–356' },
  @{ href = 'mesihte-yasam.html';   t = "III. Mesih$($Apos)te Yaşam";         s = 'Sorular 357–533';          te = 'III. Life in Christ'; se = 'Questions 357–533' },
  @{ href = 'hristiyan-duasi.html'; t = 'IV. Hristiyan Duası';                s = 'Sorular 534–598';          te = 'IV. Christian Prayer'; se = 'Questions 534–598' },
  @{ href = 'ekler.html';           t = 'Ekler';                              s = 'Dualar ve formüller';      te = 'Appendix'; se = 'Prayers and formulas' }
)
# Every page that belongs to the Compendium, for the 'is-section' state and the breadcrumb
$PrayerNav = @(
  @{ href = 'tesbih-duasi.html'; t = 'Tesbih Duası';          s = 'Meryem Ana Tesbih Duası';    te = 'The Holy Rosary'; se = 'Prayers and the mysteries' },
  @{ href = 'ekler.html';        t = 'Sık Kullanılan Dualar'; s = 'Günlük dualar ve formüller'; te = 'Common Prayers'; se = 'Everyday prayers and formulas' }
)
# Katekizm gets its own top-level nav menu (mirrors the English site's "Compendium" dropdown):
# the overview page plus each of its seven chapters.
$KatekizmNav = @(@{ href = 'katekizm.html'; t = 'Genel Bakış'; s = '598 soru ve yanıtın tam listesi'; te = 'Overview'; se = 'All 598 questions and answers' }) + $TextNav
# "Kaynaklar": pages that stand on their own but are grouped under one menu now that there are many.
$KaynaklarNav = @(
  @{ href = 'katolik-sureci.html'; t = 'Katolik Olma Süreci';  s = 'Katolik olma süreci';           te = 'Becoming Catholic'; se = 'The OCIA/RCIA process' },
  @{ href = 'gunah-cikarma.html';  t = 'Günah Çıkarma';        s = 'Nasıl işler, adım adım';        te = 'Confession'; se = 'Step by step, how it works' },
  @{ href = 'kutsal-ayin.html';    t = 'Kutsal Ayin';          s = 'Ayinin sırası, adım adım';      te = 'The Holy Mass'; se = 'The order of Mass, step by step' },
  @{ href = 'meseller.html';       t = "İsa$($Apos)nın Meselleri"; s = 'Otuz iki mesel, düz bir dille'; te = 'The Parables of Jesus'; se = 'Thirty-two parables, plainly explained' },
  @{ href = 'kutsal-kitap.html';   t = 'Kutsal Kitap';         s = 'Onaylı çeviriler';              te = 'The Bible'; se = 'Approved translations' },
  @{ href = 'kiliseler.html';      t = 'Kilise Bul';           s = "Türkiye$($Apos)de kilise adresleri"; te = 'Find a Church'; se = 'Catholic churches in Turkey' },
  @{ href = 'topraklarimizda-hristiyanlik.html'; t = 'Topraklarımızda Hristiyanlık'; s = "Pavlus$($Apos)tan İznik$($Apos)e"; te = 'Christianity in Anatolia'; se = 'From Paul to Nicaea' },
  @{ href = 'kilise-tarihi.html'; t = "Kilise$($Apos)nin Tarihi"; s = 'Havarilerden bugüne'; te = 'History of the Church'; se = 'From the apostles to today' }
)
$KatekizmPages = @('katekizm.html') + ($TextNav | ForEach-Object { $_.href })
# The five links shown directly in the bar at all times; everything else (including these
# five again, for completeness) lives in the hamburger's full-screen overlay only.
$CoreNav = @(
  @{ href = 'neden-katoligiz.html'; t = 'Neden Katoliğiz?'; te = "Why We're Catholic" },
  @{ href = 'katekizm.html';        t = 'Katekizm'; te = 'Catechism' },
  @{ href = 'topraklarimizda-hristiyanlik.html'; t = 'Topraklarımızda Hristiyanlık'; te = 'Christianity in Anatolia' },
  @{ href = 'kiliseler.html';       t = 'Kilise Bul'; te = 'Find a Church' },
  @{ href = 'sss.html';             t = 'Sorular'; te = 'FAQ' }
)
$IcoBook = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.6C10.6 5.4 8.6 4.8 6 4.8H3.6v13.4H6c2.6 0 4.6.6 6 1.8 1.4-1.2 3.4-1.8 6-1.8h2.4V4.8H18c-2.6 0-4.6.6-6 1.8z"/><path d="M12 6.6v13.4"/></svg>'
$IcoBeads = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="14.6" r="6.4"/><circle cx="12" cy="5.2" r="1.5"/><path d="M12 6.7v1.5" stroke-linecap="round"/><path d="M10.4 3.3h3.2M12 1.7v3.2" stroke-linecap="round"/></svg>'
$IcoWay = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21c3-6 3-11 0-17"/><path d="M19 21c-3-6-3-11 0-17"/><path d="M9.5 15h5M9 10h6"/><circle cx="12" cy="4" r="1.4" fill="currentColor" stroke="none"/></svg>'
$IcoStar = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2c1 2.8 1.9 4.4 3.4 5.8 1.5 1.4 3.1 2.1 5.4 2.7-2.3.6-3.9 1.4-5.4 2.7-1.5 1.4-2.4 3-3.4 5.8-1-2.8-1.9-4.4-3.4-5.8-1.5-1.3-3.1-2.1-5.4-2.7 2.3-.6 3.9-1.3 5.4-2.7 1.5-1.4 2.4-3 3.4-5.8z"/></svg>'
$IcoChalice = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10"/><path d="M7.6 4c0 4.4 1.3 7.6 4.4 7.6s4.4-3.2 4.4-7.6"/><path d="M12 11.6V19"/><path d="M8 19h8"/></svg>'
$IcoRadiance = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/></svg>'
$IcoHome = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9.5a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1V10"/></svg>'
$IcoMail = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.2" y="5.5" width="17.6" height="13" rx="1.6"/><path d="m4 6.5 8 6.5 8-6.5"/></svg>'
$IcoPrayers = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v14"/><path d="M8 5.5c0 5-1 8-3.5 10"/><path d="M16 5.5c0 5 1 8 3.5 10"/><path d="M8 20.5c1.3-1 2.7-1 4 0 1.3-1 2.7-1 4 0"/></svg>'
$IcoScroll = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4.5h11a2 2 0 0 1 2 2V8H9a2 2 0 0 0-2 2Z"/><path d="M7 4.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-1.5H9a2 2 0 0 1-2-2Z"/><path d="M11.5 11.5h5M11.5 14.5h5"/></svg>'
$IcoAsk = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.2"/><path d="M9.3 9.2a2.8 2.8 0 1 1 3.5 3.1c-.6.2-.9.7-.9 1.3v.6"/><circle cx="12" cy="17.2" r="1.05" fill="currentColor" stroke="none"/></svg>'
$IcoPin = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>'
$SmallCross = '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="currentColor">' + $CrossShapes + '</g></svg>'
# Tartış: two speech bubbles; İslam'a Cevap: a speech bubble with a cross in it
$IcoDebate = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.6h9.6a1.6 1.6 0 0 1 1.6 1.6v5.2a1.6 1.6 0 0 1-1.6 1.6H8.4l-3.6 3v-3H4a1.6 1.6 0 0 1-1.6-1.6V6.2A1.6 1.6 0 0 1 4 4.6Z"/><path d="M15.2 8.6H20a1.6 1.6 0 0 1 1.6 1.6v5.2A1.6 1.6 0 0 1 20 17h-.8v3l-3.6-3h-4.4a1.6 1.6 0 0 1-1.6-1.6V13"/></svg>'
$IcoAnswer = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3.8h14a1.8 1.8 0 0 1 1.8 1.8v9.2a1.8 1.8 0 0 1-1.8 1.8h-7.4L7 20.4v-3.8H5a1.8 1.8 0 0 1-1.8-1.8V5.6A1.8 1.8 0 0 1 5 3.8Z"/><path d="M12 6.6v7.2M9.4 9.2h5.2"/></svg>'
# Ateizme Cevap: a planet with its ring and a small star
$IcoCosmos = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="13.5" r="5"/><path d="M4.6 17.8c-1.9-1.2.6-4.6 5.6-7.1s9.9-3.2 11-1.5c.6 1-.4 2.6-2.5 4.3"/><path d="M18.5 2.8v3.6M16.7 4.6h3.6"/></svg>'
# href -> icon lookup for the mobile menu sheet (each real destination gets a small icon; the
# plain-text ns-label section headers do not). Defined early, before Header-Html is first called
# by the Compendium part-page loop below, so every icon it references must already exist here.
$NavIcons = @{
  'index.html'          = $IcoHome
  'katekizm.html'        = $SmallCross
  'katolik-sureci.html'  = $IcoWay
  'gunah-cikarma.html'   = $IcoKey
  'kutsal-ayin.html'     = $IcoChalice
  'meseller.html'        = $IcoScroll
  'kutsal-kitap.html'    = $IcoBook
  'tesbih-duasi.html'    = $IcoBeads
  'ekler.html'           = $IcoPrayers
  'mucizeler.html'       = $IcoRadiance
  'azizler.html'         = $IcoStar
  'sss.html'             = $IcoAsk
  'kiliseler.html'       = $IcoPin
  'topraklarimizda-hristiyanlik.html' = $IcoRoots
  'kilise-tarihi.html'   = $IcoHourglass
  'islama-cevap.html'    = $IcoAnswer
  'ateizme-cevap.html'   = $IcoCosmos
  'iletisim.html'        = $IcoMail
}
$IcoA11yPerson = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.2"/><circle cx="12" cy="7.4" r="1.3" fill="currentColor" stroke="none"/><path d="M7.6 10.2 12 11l4.4-.8M12 11v3.2l-2.2 4M12 14.2l2.2 4"/></svg>'
$IcoShield = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2 5 6v5.4c0 4.4 3 8 7 9.4 4-1.4 7-5 7-9.4V6Z"/><path d="m9.2 12.2 2 2 3.8-4"/></svg>'
# The full-screen menu: the same three groups as the home screen's apps (Öğren, Dua Et, Keşfet)
# and a fourth for the site itself. The Katekizm is one row; the arrow beside it folds its seven
# parts open underneath (open already when the page shown is one of them).
$SheetNav = @(
  @{ label = 'Öğren'; labelEn = 'Learn'; items = @(
    @{ href = 'neden-katoligiz.html'; t = 'Neden Katoliğiz?'; s = 'Tanrı, İsa ve Kilise, kısaca'; te = "Why We're Catholic"; se = 'God, Jesus and the Church, briefly'; ico = $IcoCompass },
    @{ href = 'katekizm.html'; t = 'Katekizm'; s = '598 soru ve yanıt'; te = 'Catechism'; se = '598 questions and answers' },
    @{ href = 'kutsal-kitap.html'; t = 'Kutsal Kitap'; s = 'Onaylı çeviriler'; te = 'The Bible'; se = 'Approved translations' },
    @{ href = 'sss.html'; t = 'Sorular'; s = 'Sıkça sorulan sorular'; te = 'FAQ'; se = 'Frequently asked questions' },
    @{ href = 'katolik-sureci.html'; t = 'Katolik Olma Süreci'; s = 'OCIA, adım adım'; te = 'Becoming Catholic'; se = 'OCIA, step by step' },
    @{ href = 'meseller.html'; t = "İsa$($Apos)nın Meselleri"; s = 'Otuz iki mesel'; te = 'The Parables of Jesus'; se = 'Thirty-two parables' }) },
  @{ label = 'Tartış'; labelEn = 'Debate'; items = @(
    @{ href = 'islama-cevap.html'; t = "İslam$($Apos)a Cevap"; s = 'İslam, kendi kaynaklarıyla'; te = 'Answering Islam'; se = 'Islam, by its own sources' },
    @{ href = 'ateizme-cevap.html'; t = 'Ateizme Cevap'; s = 'Akıl ve kanıtla Tanrı'; te = 'Answering Atheism'; se = 'God, by reason and evidence' }) },
  @{ label = 'Dua Et'; labelEn = 'Pray'; items = @(
    @{ href = 'kutsal-ayin.html'; t = 'Kutsal Ayin'; s = 'Ayinin sırası'; te = 'The Mass'; se = 'The order of Mass' },
    @{ href = 'tesbih-duasi.html'; t = 'Tesbih Duası'; s = 'Dualar ve gizemler'; te = 'The Rosary'; se = 'Prayers and mysteries' },
    @{ href = 'ekler.html'; t = 'Sık Kullanılan Dualar'; s = 'Günlük dualar ve formüller'; te = 'Common Prayers'; se = 'Daily prayers and formulas' },
    @{ href = 'gunah-cikarma.html'; t = 'Günah Çıkarma'; s = 'Nasıl işler, adım adım'; te = 'Confession'; se = 'How it works, step by step' }) },
  @{ label = 'Keşfet'; labelEn = 'Explore'; items = @(
    @{ href = 'azizler.html'; t = 'Azizler'; s = 'Yılın her günü için bir aziz'; te = 'Saints'; se = 'A saint for every day of the year' },
    @{ href = 'mucizeler.html'; t = 'Mucizeler'; s = 'Görünmeler, kalıntılar, mucizeler'; te = 'Miracles'; se = 'Apparitions, relics, miracles' },
    @{ href = 'topraklarimizda-hristiyanlik.html'; t = 'Topraklarımızda Hristiyanlık'; s = "Pavlus$($Apos)tan İznik$($Apos)e"; te = 'Christianity in Anatolia'; se = 'From Paul to Nicaea' },
    @{ href = 'kilise-tarihi.html'; t = "Kilise$($Apos)nin Tarihi"; s = 'Havarilerden bugüne'; te = 'History of the Church'; se = 'From the apostles to today' },
    @{ href = 'kiliseler.html'; t = 'Kilise Bul'; s = "Türkiye$($Apos)de kiliseler"; te = 'Find a Church'; se = 'Churches in Turkey' }) },
  @{ label = 'Site'; labelEn = 'Site'; items = @(
    @{ href = 'iletisim.html'; t = 'İletişim'; s = 'Bize ulaşın'; te = 'Contact'; se = 'Get in touch' },
    @{ href = 'erisilebilirlik.html'; t = 'Erişilebilirlik'; s = 'Herkes için okunur bir site'; te = 'Accessibility'; se = 'A site everyone can read'; ico = $IcoA11yPerson },
    @{ href = 'gizlilik.html'; t = 'Gizlilik Politikası'; s = 'Hangi veri, nasıl korunur'; te = 'Privacy Policy'; se = 'What data, and how it is kept'; ico = $IcoShield },
    @{ href = 'kaynaklar-ve-telif.html'; t = 'Kaynaklar ve Telif'; s = 'Metinler, tablolar, lisanslar'; te = 'Sources and Copyright'; se = 'Texts, paintings, licences'; ico = $IcoBook }) }
)
$IcoFold = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'
function Ns-Item($it, [string]$current, [string]$cls = 'ns-item') {
  $ico = if ($it.ico) { $it.ico } elseif ($NavIcons[$it.href]) { $NavIcons[$it.href] } else { $SmallCross }
  $sHtml = if ($it.s) { "<span class=`"ns-s`">$(T $it.s $it.se)</span>" } else { '' }
  return "<a class=`"$cls`" href=`"$($it.href)`"$(Cur $it.href $current)><span class=`"ns-ico`">$ico</span><span class=`"ns-body`"><span class=`"ns-t`">$(T $it.t $it.te)</span>$sHtml</span></a>"
}
function Nav-Sheet([string]$lang, [string]$current) {
  $i = 0
  return (($SheetNav | ForEach-Object {
    $links = ($_.items | ForEach-Object {
      $it = $_
      if (-not $it.fold) { return (Ns-Item $it $current) }
      $open = ($current -eq $it.href) -or (@($it.fold | Where-Object { $_.href -eq $current }).Count -gt 0)
      $subs = ($it.fold | ForEach-Object { Ns-Item $_ $current 'ns-item ns-sub' }) -join ''
      $st = if ($open) { ' is-open' } else { '' }; $ex = if ($open) { 'true' } else { 'false' }
      "<div class=`"ns-fold$st`"><div class=`"ns-fold-row`">$(Ns-Item $it $current)" +
        "<button type=`"button`" class=`"ns-more`" aria-expanded=`"$ex`" aria-controls=`"ns-fold-$i`" $(TA 'aria-label' "$($it.t) bölümleri" "$($it.te) sections")>$IcoFold</button></div>" +
        "<div class=`"ns-fold-body`" id=`"ns-fold-$i`"><div class=`"ns-fold-in`">$subs</div></div></div>"
    }) -join ''
    $delay = ([double]$i * 0.04).ToString([Globalization.CultureInfo]::InvariantCulture); $i++
    "      <div class=`"ns-group`" style=`"animation-delay:$($delay)s`"><p class=`"ns-label`">$(T $_.label $_.labelEn)</p>$links</div>"
  }) -join "`n")
}
# ------------------------------------------------------------------ phones: apps and app screens
# The church icon of the home screen's Dua Et app
$TbSvg = { param($d, $extra = '') "<svg viewBox=`"0 0 24 24`" aria-hidden=`"true`" fill=`"none`" stroke=`"currentColor`" stroke-width=`"1.7`" stroke-linecap=`"round`" stroke-linejoin=`"round`"$extra>$d</svg>" }
$TbChurch = & $TbSvg '<path d="M12 2.4v4.2M10.1 4.3h3.8"/><path d="M5.6 21v-9.3L12 6.9l6.4 4.8V21"/><path d="M3.4 21h17.2"/><path d="M10.1 21v-4a1.9 1.9 0 0 1 3.8 0v4"/>'
# The home screen app each page belongs to (Öğren, Dua Et, Keşfet): its colour on phones, set as
# data-app on the page's body by Write-Page; the home page's own lists follow the same grouping.
$AppOf = @{}
foreach ($f in @('neden-katoligiz.html', 'katekizm.html', 'kutsal-kitap.html', 'sss.html', 'katolik-sureci.html', 'meseller.html',
                 'motu-proprio.html', 'giris.html', 'iman-ikrari.html', 'kutsal-sirlar.html', 'mesihte-yasam.html', 'hristiyan-duasi.html')) { $AppOf[$f] = 'ogren' }
foreach ($f in @('kutsal-ayin.html', 'tesbih-duasi.html', 'tesbih-tarihi.html', 'ekler.html', 'gunah-cikarma.html')) { $AppOf[$f] = 'dua' }
$AppOf['islama-cevap.html'] = 'tartis'
$AppOf['ateizme-cevap.html'] = 'tartis'
foreach ($f in @('azizler.html', 'mucizeler.html', 'topraklarimizda-hristiyanlik.html', 'kilise-tarihi.html', 'kiliseler.html')) { $AppOf[$f] = 'kesfet' }
foreach ($gs in $GreatSaints.saints) { $AppOf["$($gs.id).html"] = 'kesfet' }

# ---- Phones: every page but the home screen is shown as an app screen (script.js, initAppView).
# All of the page's text stays in its HTML, as on a computer; the phone shows it one level at a
# time. The bar at the top leads back to where the page belongs: its app on the home screen, or
# the page it is part of.
$AppNames = @{ ogren = @('Öğren', 'Learn'); tartis = @('Tartış', 'Debate'); dua = @('Dua Et', 'Pray'); kesfet = @('Keşfet', 'Explore') }
$KatekizmSub = @('motu-proprio.html', 'giris.html', 'iman-ikrari.html', 'kutsal-sirlar.html', 'mesihte-yasam.html', 'hristiyan-duasi.html')
function Av-Parent([string]$trFile, [bool]$en) {
  if ($trFile -like 'kilise/*') { return @{ href = 'kiliseler.html'; t = 'Kilise Bul'; te = 'Find a Church' } }
  if ($KatekizmSub -contains $trFile) { return @{ href = 'katekizm.html'; t = 'Katekizm'; te = 'Catechism' } }
  if ($trFile -eq 'tesbih-tarihi.html') { return @{ href = 'tesbih-duasi.html'; t = 'Tesbih Duası'; te = 'The Rosary' } }
  if ($GreatSaints.saints | Where-Object { "$($_.id).html" -eq $trFile }) { return @{ href = 'azizler.html#buyuk-azizler'; t = 'Azizler'; te = 'Saints' } }
  $app = $AppOf[$trFile]
  if ($app) { return @{ href = "index.html#app-$app"; t = $AppNames[$app][0]; te = $AppNames[$app][1] } }
  return @{ href = 'index.html'; t = 'Ana Sayfa'; te = 'Home' }
}
$IcoAvBack = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>'
function Av-Nav([string]$trFile, [bool]$en) {
  $p = Av-Parent $trFile $en
  $navL = TA 'aria-label' 'Sayfa gezintisi' 'Page navigation'
  $setL = TA 'aria-label' 'Ayarlar: erişilebilirlik' 'Settings: accessibility'
  $thL = TA 'aria-label' 'Koyu temaya geç' 'Switch to dark theme'
  # The Katekizm's own pages: a magnifier that opens into a search field across the bar
  $find = ''; $findBar = ''
  if (($KatekizmSub + @('ekler.html')) -contains $trFile) {
    $find = "<button type=`"button`" class=`"av-find`" $(TA 'aria-label' "Katekizm$($Apos)de ara" 'Search the Catechism') aria-expanded=`"false`" aria-controls=`"av-findbar`">$IcoSearch</button>"
    $findBar = "<div class=`"av-findbar`" id=`"av-findbar`" hidden>$(Search-Form 'av-find-form' 'q-av' "Katekizm$($Apos)de ara: Türkçe, İngilizce ya da numara" 'tr' 'Search the Catechism: English, Turkish or a number')</div>"
  }
  return "<nav class=`"av-nav`" $navL><a class=`"av-back`" href=`"$($p.href)`" data-av-back>$IcoAvBack<span data-av-back-label>$(T $p.t $p.te)</span></a>" +
    "<span class=`"av-title`" aria-hidden=`"true`"></span><span class=`"av-tools`">$find<button type=`"button`" class=`"theme-toggle av-theme`" role=`"switch`" aria-checked=`"false`" $thL>$IcoSun$IcoMoon</button>" +
    "<button type=`"button`" class=`"av-gear`" $setL aria-haspopup=`"dialog`" aria-controls=`"settings-panel`">$IcoGear</button>" +
    "<a class=`"av-close`" href=`"index.html`" $(TA 'aria-label' 'Kapat: ana ekrana dön' 'Close: back to the home screen')>$IcoClose</a></span>$findBar</nav>"
}
# The home screen's four icons, small, at the foot of every page on a phone: each opens its app
# on the home screen, so another part of the site is always one tap away.
function Av-Dock([string]$trFile) {
  $app = $AppOf[$trFile]
  $items = @(@('ogren', (T 'Öğren' 'Learn'), $SmallCross), @('tartis', (T 'Tartış' 'Debate'), $IcoDebate), @('dua', (T 'Dua Et' 'Pray'), $TbChurch), @('kesfet', (T 'Keşfet' 'Explore'), $IcoCompass))
  $links = ($items | ForEach-Object {
    $cur = if ($_[0] -eq $app) { ' aria-current="true"' } else { '' }
    "<a class=`"av-dock-a`" href=`"index.html#app-$($_[0])`"$cur><span class=`"hm-icon app-$($_[0])`">$($_[2])</span><span class=`"av-dock-t`">$($_[1])</span></a>"
  }) -join ''
  # On the Katekizm's pages the icons sit on a solid bar across the screen, clear of the text
  $solid = if ($KatekizmPages -contains $trFile) { ' av-dock-solid' } else { '' }
  return "<nav class=`"av-dock$solid`" $(TA 'aria-label' 'Bölümler' 'Sections')>$links</nav>"
}
$MassIcons = @{
  gather   = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V11a7 7 0 0 1 14 0v10"/><path d="M4 21h16"/><circle cx="12" cy="9" r="1" fill="currentColor" stroke="none"/></svg>'
  book     = $IcoBook
  gifts    = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.4" cy="8" r="3.3"/><path d="M14.6 5h5"/><path d="M15.2 5c0 3.4 1 5.8 3.4 5.8s3.4-2.4 3.4-5.8" transform="translate(-1 0)"/><path d="M18.1 10.8V19"/><path d="M15 19h6.2"/></svg>'
  chalice  = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 5h10"/><path d="M7.6 5c0 4.4 1.3 7.6 4.4 7.6s4.4-3.2 4.4-7.6"/><path d="M12 12.6V19"/><path d="M8 19h8"/><path d="M4.6 3.4 6.4 5M19.4 3.4 17.6 5"/></svg>'
  host     = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14c2.4 3 5.6 4.4 8 4.4s5.6-1.4 8-4.4"/><circle cx="12" cy="7.6" r="3.4"/><path d="M12 5.6v.01M10.2 8.3h3.6"/></svg>'
  blessing = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M5 12H3M21 12h-2M6.5 6.5 5 5M19 5l-1.5 1.5M6.5 17.5 5 19M19 19l-1.5-1.5"/><circle cx="12" cy="12" r="3.4"/></svg>'
}
$IcoGear = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10.11 4.95 L10.50 2.52 L13.50 2.52 L13.89 4.95 A7.3 7.3 0 0 1 15.65 5.68 L17.64 4.23 L19.77 6.36 L18.32 8.35 A7.3 7.3 0 0 1 19.05 10.11 L21.48 10.50 L21.48 13.50 L19.05 13.89 A7.3 7.3 0 0 1 18.32 15.65 L19.77 17.64 L17.64 19.77 L15.65 18.32 A7.3 7.3 0 0 1 13.89 19.05 L13.50 21.48 L10.50 21.48 L10.11 19.05 A7.3 7.3 0 0 1 8.35 18.32 L6.36 19.77 L4.23 17.64 L5.68 15.65 A7.3 7.3 0 0 1 4.95 13.89 L2.52 13.50 L2.52 10.50 L4.95 10.11 A7.3 7.3 0 0 1 5.68 8.35 L4.23 6.36 L6.36 4.23 L8.35 5.68 A7.3 7.3 0 0 1 10.11 4.95Z"/><circle cx="12" cy="12" r="3"/></svg>'

# ---------------------------------------------------------------- accessibility widget icons
$IcoWheelchair = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.2" cy="5" r="1.5" fill="currentColor" stroke="none"/><path d="M11.4 8v5.2l4.4 4.4"/><path d="M11.4 13.2h5"/><path d="M7.8 13.2a5 5 0 1 0 4.9 6"/></svg>'
$IcoEyeOff = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 3.5l17 17"/><path d="M10.6 5.4A10.6 10.6 0 0 1 12 5.3c5 0 8.7 3.4 10 6.7-.5 1.3-1.4 2.7-2.6 3.9M6.6 6.6C4.6 8 3 9.9 2 12c1.3 3.3 5 6.7 10 6.7 1.4 0 2.7-.3 3.9-.7"/><path d="M9.9 10a3 3 0 0 0 4.2 4.2"/></svg>'
$IcoDroplet = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5c3 4 6 7.4 6 10.8a6 6 0 0 1-12 0c0-3.4 3-6.8 6-10.8Z"/></svg>'
$IcoBookOpen = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.6C10.6 5.4 8.6 4.8 6 4.8H3.6v13.4H6c2.6 0 4.6.6 6 1.8 1.4-1.2 3.4-1.8 6-1.8h2.4V4.8H18c-2.6 0-4.6.6-6 1.8z"/><path d="M12 6.6v13.4"/></svg>'
$IcoSpeaker = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.4L12 6v12l-4.6-3.5H4z"/><path d="M16 9.2a4 4 0 0 1 0 5.6M18.6 6.8a7.8 7.8 0 0 1 0 10.4"/></svg>'
$IcoContrast = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9.2"/><path d="M12 2.8a9.2 9.2 0 0 1 0 18.4Z" fill="currentColor" stroke="none"/></svg>'
$IcoSpacing = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v16M18 4v16"/><path d="M9 12h6M9.4 9.6 7 12l2.4 2.4M14.6 9.6 17 12l-2.4 2.4"/></svg>'
$IcoLink = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 14.5 14.5 9.5"/><path d="M11 7l1.3-1.3a3.5 3.5 0 0 1 4.9 4.9L15.9 12"/><path d="M13 17l-1.3 1.3a3.5 3.5 0 0 1-4.9-4.9L8.1 12"/></svg>'
$IcoCursor = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M6 3.5 18 13l-5 .8 2.6 5.3-2 1-2.6-5.3L7.5 18Z"/></svg>'
$IcoRefresh = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5"/><path d="M20 4v4.5h-4.5"/><path d="M20 12a8 8 0 0 1-13.7 5.7L4 15.5"/><path d="M4 20v-4.5h4.5"/></svg>'
$IcoCheckSquare = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8.5 12.2 2.4 2.4 4.6-4.9"/></svg>'
$IcoPlay = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.2"/><path d="M10.2 8.7v6.6l5.3-3.3z" fill="currentColor" stroke="none"/></svg>'
# Settings panel, opened by the gear beside the logo: accessibility
# profile presets + individual toggles, state kept in localStorage (see script.js), CSS driven
# entirely by data-a11y-* attributes on <html> so it never touches position:fixed elements via
# `filter` (which would break their containing block). Defined here (before the first
# Write-Page call) and included on every page via Write-Page.
$A11yWidgetHtml = @"
<div class="a11y-panel glass" id="settings-panel" role="dialog" aria-modal="false" aria-labelledby="settings-title" hidden>
  <div class="a11y-head"><p class="a11y-title" id="settings-title">$IcoGear $(T 'Ayarlar' 'Settings')</p><button type="button" class="a11y-close icon-btn" $(TA 'aria-label' 'Kapat' 'Close')>$IcoClose</button></div>
  <div class="a11y-body">
    <p class="a11y-group-label">$(T 'Erişilebilirlik Profilleri' 'Accessibility Profiles')</p>
    <div class="a11y-profiles">
      <button type="button" class="a11y-profile" data-a11y-profile="motor" aria-pressed="false">$IcoWheelchair<span>$(T 'Hareket Kısıtlılığı' 'Motor Impaired')</span></button>
      <button type="button" class="a11y-profile" data-a11y-profile="blind" aria-pressed="false">$IcoEyeOff<span>$(T 'Görme Engelli' 'Blind')</span></button>
      <button type="button" class="a11y-profile" data-a11y-profile="colorblind" aria-pressed="false">$IcoDroplet<span>$(T 'Renk Körlüğü' 'Color Blind')</span></button>
      <button type="button" class="a11y-profile" data-a11y-profile="dyslexia" aria-pressed="false">$IcoBookOpen<span>$(T 'Disleksi' 'Dyslexia')</span></button>
    </div>
    <p class="a11y-group-label">$(T 'Erişilebilirlik Ayarları' 'Accessibility Settings')</p>
    <div class="a11y-toggles">
      <button type="button" class="a11y-tile" data-a11y-toggle="reader" aria-pressed="false">$IcoSpeaker<span>$(T 'Ekran Okuyucu' 'Screen Reader')</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="contrast" aria-pressed="false">$IcoContrast<span>$(T 'Kontrast Artır' 'Increase Contrast')</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="saturation" aria-pressed="false">$IcoDroplet<span>$(T 'Doygunluğu Azalt' 'Reduce Saturation')</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="bigtext" aria-pressed="false">$IcoTextSize<span>$(T 'Büyük Yazı' 'Bigger Text')</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="spacing" aria-pressed="false">$IcoSpacing<span>$(T 'Harf Aralığı' 'Text Spacing')</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="links" aria-pressed="false">$IcoLink<span>$(T 'Bağlantıları Vurgula' 'Highlight Links')</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="dyslexia" aria-pressed="false">$IcoBookOpen<span>$(T 'Disleksi Dostu Yazı' 'Dyslexia-Friendly Font')</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="cursor" aria-pressed="false">$IcoCursor<span>$(T 'Büyük İmleç' 'Big Cursor')</span></button>
    </div>
    <button type="button" class="a11y-reset">$IcoRefresh $(T 'Tüm Ayarları Sıfırla' 'Reset All Settings')</button>
    <p class="a11y-note">$(T 'Ekran Okuyucu, tarayıcınızın konuşma sentezini kullanarak üzerine geldiğiniz metni sesli okur; gerçek bir ekran okuyucunun (VoiceOver, NVDA, TalkBack vb.) yerini tutmaz, sitenin kendisi zaten onlarla uyumludur.' 'Screen Reader uses your browser''s built-in speech synthesis to read aloud whatever you point at; it is not a substitute for a real screen reader (VoiceOver, NVDA, TalkBack, etc.), which the site already works with on its own.')</p>
  </div>
</div>
"@


# The TR | EN switch: a small pill that floats in the corner of every page, over the text, so the
# reader can flip between the two languages at any point of a long page (script.js, initLang)
# The inline <head> script, around the phone-view flag ($avJs): picks the language (the page's
# address decides it; the Turkish home page sends someone who reads English, by choice or by browser,
# to the English home page, deep links are never redirected; crawlers are never sent anywhere), the theme and the reading settings,
# all before the first paint.
$HeadJs = 'document.documentElement.classList.add(''js'');'
$HeadJs2 = '(function(H){var L=null,T=null,d=new Date();try{L=localStorage.getItem(''kd-lang-choice'');if(!L&&localStorage.getItem(''kd-lang'')===''en'')L=''en''}catch(e){}if(!L){var tz='''';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''''}catch(e){}var nl=((navigator.languages&&navigator.languages[0])||navigator.language||'''').toLowerCase();L=(/bot|crawl|spider|slurp|lighthouse|headless|inspection/i.test(navigator.userAgent||'''')||/Istanbul$/.test(tz)||nl.slice(0,2)===''tr'')?''tr'':''en''}var U=H.getAttribute(''data-url-lang'');if(U){if(U===''tr''&&L===''en''&&/^\/(index\.html)?$/.test(location.pathname)&&!/bot|crawl|spider|slurp|lighthouse|headless|inspection|preview|facebookexternalhit/i.test(navigator.userAgent||'''')){var a=document.querySelector(''link[hreflang=en]'');if(a){location.replace(a.getAttribute(''href'').replace(/^https?:\/\/[^\/]+/,'''')+location.search+location.hash);return}}L=U}if(L===''en''){H.classList.add(''lang-en'');H.lang=''en''}try{var c=JSON.parse(localStorage.getItem(''kd-theme-choice'')||''null'');if(c&&c.until>d.getTime())T=c.t}catch(e){}if(!T){var u=null;try{u=JSON.parse(localStorage.getItem(''kd-sun'')||''null'')}catch(e){}var m=d.getHours()*60+d.getMinutes();T=m>=(u?u.r:420)&&m<(u?u.s:1140)?''light'':''dark''}H.setAttribute(''data-theme'',T);if(T===''light''){var tc=document.querySelector(''meta[name=theme-color]'');if(tc)tc.setAttribute(''content'',''#f7f2e8'')}})(document.documentElement);try{var fs=localStorage.getItem(''kkio-fontsize'');if(fs===''1''||fs===''2'')document.documentElement.setAttribute(''data-fontsize'',fs);var a11y=JSON.parse(localStorage.getItem(''kkio-a11y'')||''{}'');[''contrast'',''saturation'',''spacing'',''links'',''dyslexia'',''cursor''].forEach(function(k){if(a11y[k])document.documentElement.setAttribute(''data-a11y-''+k,''1'')})}catch(e){}'
$LangPillHtml = '<nav class="lang-pill" aria-label="Dil / Language"><span class="lp-knob" aria-hidden="true"></span>' +
  '<button type="button" class="lp-btn" data-set-lang="tr" lang="tr" aria-pressed="true" title="Türkçe">TR</button>' +
  '<button type="button" class="lp-btn" data-set-lang="en" lang="en" aria-pressed="false" title="English">EN</button></nav>'
function Search-Form([string]$cls, [string]$id, [string]$placeholder, [string]$lang = 'tr', [string]$placeholderEn = 'Search the Catechism: English, Turkish or a question number') {
  $action = if ($lang -eq 'en') { 'en/compendium.html' } else { 'katekizm.html' }
  $label = T "Katekizm$($Apos)de ara (Türkçe veya İngilizce, ya da soru numarası)" 'Search the Catechism (English or Turkish, or a question number)'
  return "<form class=`"search $cls`" role=`"search`" data-search action=`"$action`"><div class=`"search-field`">$IcoSearch" +
    "<label class=`"visually-hidden`" for=`"$id`">$label</label>" +
    "<input id=`"$id`" type=`"search`" name=`"q`" $(TA 'placeholder' $placeholder $placeholderEn) autocomplete=`"off`" enterkeyhint=`"search`"></div>" +
    "<div class=`"search-results`" hidden></div></form>"
}
# Desktop (980px and up): the four groups of the phone's home screen as the bar's own menus,
# each opening a panel of its pages; a few pages open a further list beside it (the Katekizm's
# parts, the Rosary's two pages, the saints). Below 980px the hamburger's overlay takes over.
$DnSubs = @{
  'katekizm.html' = $KatekizmNav
  'tesbih-duasi.html' = @(
    @{ href = 'tesbih-duasi.html'; t = 'Tesbih Duası'; s = 'Dualar ve gizemler'; te = 'The Rosary'; se = 'Prayers and mysteries' },
    @{ href = 'tesbih-duasi.html#tesbih-rehberi'; t = 'Adım Adım Tesbih'; s = 'Boncuk boncuk, birlikte dua edin'; te = 'Pray It Bead by Bead'; se = 'A guided rosary, on screen' },
    @{ href = 'tesbih-tarihi.html'; t = 'Tesbihin Tarihi'; s = "İncil$($Apos)den Fatima$($Apos)ya"; te = 'History of the Rosary'; se = 'From the Gospel to Fatima' })
  'azizler.html' = @(
    @{ href = 'azizler.html'; t = 'Azizler Takvimi'; s = 'Yılın her günü için bir aziz'; te = 'Calendar of Saints'; se = 'A saint for every day of the year' },
    @{ href = 'azizler.html#buyuk-azizler'; t = 'En Çok Bilinen 20 Aziz'; s = 'Hayat hikâyeleri'; te = '20 Best-Known Saints'; se = 'Their lives'; saints = $true })
}
$IcoChevDown = '<svg class="dn-chev" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'
$IcoChevRight = '<svg class="dn-more" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>'
function Dn-Link($it, [string]$current, [string]$cls = 'dn-a', [string]$more = '') {
  $ico = if ($it.ico) { $it.ico } elseif ($NavIcons[$it.href]) { $NavIcons[$it.href] } else { '' }
  $icoHtml = if ($ico) { "<span class=`"dn-ico`">$ico</span>" } else { '' }
  $sHtml = if ($it.s) { "<span class=`"dn-s`">$(T $it.s $it.se)</span>" } else { '' }
  return "<a class=`"$cls`" href=`"$($it.href)`"$(Cur $it.href $current)>$icoHtml<span class=`"dn-body`"><span class=`"dn-t`">$(T $it.t $it.te)</span>$sHtml</span>$more</a>"
}
function Desk-Nav([string]$current) {
  $ids = @('ogren', 'tartis', 'dua', 'kesfet'); $n = 0
  $curApp = $AppOf[$current]
  return (($SheetNav | Select-Object -First 4 | ForEach-Object {
    $grp = $_; $id = $ids[$n]; $n++
    $items = ($grp.items | ForEach-Object {
      $it = $_; $sub = $DnSubs[$it.href]
      if (-not $sub) { return "<li class=`"dn-item`">$(Dn-Link $it $current)</li>" }
      $subLis = ($sub | ForEach-Object {
        $si = $_
        if (-not $si.saints) { return "<li>$(Dn-Link $si $current 'dn-a dn-sa')</li>" }
        $gs = ($GreatSaints.saints | ForEach-Object { "<li><a class=`"dn-gs`" href=`"$($_.id).html`"$(Cur "$($_.id).html" $current)>$(T $_.name $_.en)</a></li>" }) -join ''
        "<li class=`"dn-item has-sub`">$(Dn-Link $si $current 'dn-a dn-sa' $IcoChevRight)<div class=`"dn-sub dn-sub2`"><ul class=`"dn-gs-list`">$gs</ul></div></li>"
      }) -join ''
      "<li class=`"dn-item has-sub`">$(Dn-Link $it $current 'dn-a' $IcoChevRight)<div class=`"dn-sub`"><ul class=`"dn-list`">$subLis</ul></div></li>"
    }) -join ''
    $sec = if ($curApp -eq $id) { ' is-section' } else { '' }
    "<li class=`"dn-top`"><button type=`"button`" class=`"nav-link dn-btn$sec`" aria-expanded=`"false`" aria-controls=`"dn-$id`">$(T $grp.label $grp.labelEn)$IcoChevDown</button>" +
      "<div class=`"dn-panel glass`" id=`"dn-$id`"><ul class=`"dn-list`">$items</ul></div></li>"
  }) -join '') + (Dn-Contact $current)
}
# The last menu, İletişim: the contact page first, then the pages about the site itself under a small heading
$DnSitePages = @(
  @{ href = 'erisilebilirlik.html'; t = 'Erişilebilirlik'; s = 'Herkes için okunur bir site'; te = 'Accessibility'; se = 'A site everyone can read'; ico = $IcoA11yPerson },
  @{ href = 'gizlilik.html'; t = 'Gizlilik Politikası'; s = 'Hangi veri, nasıl korunur'; te = 'Privacy Policy'; se = 'What data, and how it is kept'; ico = $IcoShield },
  @{ href = 'kaynaklar-ve-telif.html'; t = 'Kaynaklar ve Telif'; s = 'Metinler ve izinler'; te = 'Sources and Copyright'; se = 'Texts and permissions'; ico = $IcoBook })
function Dn-Contact([string]$current) {
  $contact = @{ href = 'iletisim.html'; t = 'Bize Ulaşın'; s = 'Sorularınızı bize yazın'; te = 'Contact Us'; se = 'Write to us with your questions' }
  $site = ($DnSitePages | ForEach-Object { "<li class=`"dn-item`">$(Dn-Link $_ $current)</li>" }) -join ''
  $sec = if ((@('iletisim.html') + @($DnSitePages | ForEach-Object { $_.href })) -contains $current) { ' is-section' } else { '' }
  "<li class=`"dn-top`"><button type=`"button`" class=`"nav-link dn-btn$sec`" aria-expanded=`"false`" aria-controls=`"dn-iletisim`">$(T 'İletişim' 'Contact')$IcoChevDown</button>" +
    "<div class=`"dn-panel glass`" id=`"dn-iletisim`"><ul class=`"dn-list`"><li class=`"dn-item`">$(Dn-Link $contact $current)</li>" +
    "<li class=`"dn-head`" role=`"presentation`">$(T 'Site Hakkında' 'About the Site')</li>$site</ul></div></li>"
}
function Cur([string]$href, [string]$current) { if ($href -eq $current) { return ' aria-current="page"' }; return '' }
function Header-Html([string]$current) {
  $coreMenu = Desk-Nav $current
  return @"
$Sprite
<a class="skip-link" href="#main">$(T 'İçeriğe geç' 'Skip to content')</a>
<header class="site-header">
  <div class="wrap">
    <div class="header-row">
      <div class="brand-group">
        <a class="brand" href="index.html"$(Cur 'index.html' $current)>$BrandMark<span class="brand-rule" aria-hidden="true"></span>$BrandName</a>
        <button type="button" class="settings-btn" $(TA 'aria-label' 'Ayarlar: erişilebilirlik' 'Settings: accessibility') aria-haspopup="dialog" aria-expanded="false" aria-controls="settings-panel">$IcoGear</button>
      </div>
      <nav class="mainnav dnav" $(TA 'aria-label' 'Ana menü' 'Main menu')>
        <ul>$coreMenu</ul>
      </nav>
      <button type="button" class="icon-btn menu-toggle" $(TA 'aria-label' 'Menü' 'Menu') aria-expanded="false" aria-controls="navsheet" $(TA 'data-tooltip' 'Tüm Menü' 'Full Menu')>$IcoMenuToggle</button>
      <div class="header-tools">
        <button type="button" class="theme-toggle" role="switch" aria-checked="false" $(TA 'aria-label' 'Koyu temaya geç' 'Switch to dark theme')>$IcoSun$IcoMoon<span class="knob" aria-hidden="true"></span></button>
      </div>
    </div>
  </div>
</header>
<div class="navsheet" id="navsheet" hidden>
  <div class="navsheet-panel glass" role="dialog" aria-modal="true" $(TA 'aria-label' 'Menü' 'Menu')>
    <div class="ns-head">
      <p class="ns-date"><span data-ns-date></span> <time class="ns-time" data-ns-time>--:--:--</time></p>
    </div>
    <nav class="ns-nav" $(TA 'aria-label' 'Menü' 'Menu')>
$(Nav-Sheet 'tr' $current)
    </nav>
  </div>
</div>
"@
}
# The footer's site map follows the header's menus (Öğren, Tartış, Dua Et, Keşfet, Site), with the
# Katekizm's parts as a column of their own and the Rosary's history beside the Rosary
function Foot-Group([string]$label, [string]$labelEn, $items) {
  $lis = ($items | ForEach-Object { "<li><a href=`"$($_.href)`">$(T $_.t $_.te)</a></li>" }) -join ''
  return "<p class=`"foot-label`">$(T $label $labelEn)</p><ul>$lis</ul>"
}
$fgLearn = $SheetNav[0]; $fgDebate = $SheetNav[1]; $fgPray = $SheetNav[2]; $fgExplore = $SheetNav[3]; $fgSite = $SheetNav[4]
$footLearn = @($fgLearn.items | Where-Object { $_.href -ne 'katekizm.html' })
$footCat = @(@{ href = 'katekizm.html'; t = 'Genel Bakış'; te = 'Overview' }) + @($TextNav | Where-Object { $_.href -ne 'ekler.html' })
$footPray = foreach ($it in $fgPray.items) { $it; if ($it.href -eq 'tesbih-duasi.html') { @{ href = 'tesbih-tarihi.html'; t = 'Tesbihin Tarihi'; te = 'History of the Rosary' } } }
$footSite = @($fgSite.items)
$FootCols = "      <div class=`"foot-col`">$(Foot-Group $fgLearn.label $fgLearn.labelEn $footLearn)</div>`n" +
  "      <div class=`"foot-col`">$(Foot-Group 'Katekizm' 'Catechism' $footCat)</div>`n" +
  "      <div class=`"foot-col`">$(Foot-Group $fgDebate.label $fgDebate.labelEn $fgDebate.items)$(Foot-Group $fgPray.label $fgPray.labelEn $footPray)</div>`n" +
  "      <div class=`"foot-col`">$(Foot-Group $fgExplore.label $fgExplore.labelEn $fgExplore.items)$(Foot-Group $fgSite.label $fgSite.labelEn $footSite)</div>"

# İletişim, Erişilebilirlik and Gizlilik also open over the page from the footer, like
# "Kaynaklar ve telif" (their own pages stay, for search engines and links from elsewhere)
function Foot-Dialog([string]$id, [string]$title, [string]$inner, [string]$src = '') {
  # The longer texts (Erişilebilirlik, Gizlilik) aren't repeated in every page: the popup fetches
  # them from their own page the first time it opens (the link is the fallback)
  $box = if ($src) { "<div class=`"info-inner`" data-lazy><p><a href=`"$src`" data-no-dlg>$(T 'Sayfayı aç' 'Open the page')</a></p></div>" } else { "<div class=`"info-inner`">$inner</div>" }
  return "<dialog class=`"sources-dialog`" id=`"$id`" aria-labelledby=`"$id-t`"><button type=`"button`" class=`"sources-close`" $(TA 'aria-label' 'Kapat' 'Close')>$IcoClose</button>" +
    "<h2 class=`"sources-title`" id=`"$id-t`">$title</h2>$box</dialog>"
}
# İletişim: no address is published anywhere; the form posts to a Cloudflare Worker on
# /api/contact (cloudflare/contact-worker.js), which checks it with Turnstile and emails it on.
# $TurnstileSiteKey is the widget's public site key (Cloudflare > Turnstile); the one below is
# katolikdunyasi.com's own key.
$TurnstileSiteKey = '0x4AAAAAAFLZFP4-Scpg6ov1'
$ContactIntro = TB "<p>Bir hata gördüyseniz, bir konu önermek ya da merhaba demek istiyorsanız aşağıdaki formdan yazın.</p>" "<p>If you've spotted a mistake in a translation, there's a topic, saint or miracle you'd like to see added, or you'd simply like to say hello, you can write to us with the form below.</p>"
$ContactOutro = TB "<p>Gelen her mesajı bizzat okuyorum. Yoğunluğa bağlı olarak yanıt vermem biraz zaman alabilir; fakat paylaştığınız tüm geri bildirimler için şimdiden içtenlikle teşekkür ederim.</p>" "<p>I read every message myself. Depending on how busy things are, a reply may take a little while, but thank you, sincerely, for any feedback you send.</p>"
$FooterHtml = @"
<footer class="site-footer">
  <div class="wrap foot-grid">
    <div class="foot-about">
      <p class="foot-brand"><span class="foot-fish" aria-hidden="true">$IchthysSvg</span>$BrandName</p>
      <p class="foot-tag">$(T $SiteTag $SiteTagEn)</p>
      <p class="foot-desc">$(T $fm['about'] $fmEn['about'])</p>
      <p class="foot-copy foot-src"><a class="foot-sources" href="kaynaklar-ve-telif.html" data-dialog="sources-dialog">$(T $fm['title'] $fmEn['title'])</a><a class="foot-contact" href="iletisim.html">$(T 'İletişim' 'Contact')</a><a class="foot-contact foot-extra" href="erisilebilirlik.html" data-dialog="dlg-erisilebilirlik">$(T 'Erişilebilirlik' 'Accessibility')</a><a class="foot-contact foot-extra" href="gizlilik.html" data-dialog="dlg-gizlilik">$(T 'Gizlilik' 'Privacy')</a></p>
    </div>
    <nav class="foot-sitemap" $(TA 'aria-label' 'Site haritası' 'Sitemap')>
$FootCols
    </nav>
  </div>
</footer>
$(Foot-Dialog 'dlg-erisilebilirlik' (T $ErMeta.title $ErEn.meta.title) '' 'erisilebilirlik.html')
$(Foot-Dialog 'dlg-gizlilik' (T $GzMeta.title $GzEn.meta.title) '' 'gizlilik.html')
<dialog class="sources-dialog" id="sources-dialog" aria-labelledby="sources-title">
  <button type="button" class="sources-close" $(TA 'aria-label' 'Kapat' 'Close')>$IcoClose</button>
  <h2 class="sources-title" id="sources-title">$(T $fm['title'] $fmEn['title'])</h2>
  <div class="info-inner">$(TB $InfoHtml $InfoHtmlEn)</div>
</dialog>
"@
# ---- Links between the site's own pages. The first mention of a saint, a miracle or a topic that
# has a page of its own becomes a link to it, once per page and language, in running text only
# (paragraphs and list items; never in headings, links, buttons, prayers or quotations' sources).
# Each rule: the page it leads to, then the Turkish and the English pattern (.NET regex).
$XrefRules = @(
  @('padre-pio.html', 'Padre Pio', 'Padre Pio'),
  @('aziz-augustinus.html', "(?:Hipponlu (?:Aziz )?|Aziz )Augustinus", "(?:St |Saint )Augustine(?! of Canterbury)|Augustine of Hippo"),
  @('aziz-thomas-aquinas.html', 'Thomas Aquinas', 'Thomas Aquinas'),
  @('assisili-aziz-francis.html', 'Assisili (?:Aziz )?Fransuva', 'Francis of Assisi'),
  @('sienali-aziz-catharina.html', "Sienal$([char]0x131) (?:Azize )?Katerina", 'Catherine of Siena'),
  @('avilali-aziz-teresa.html', "Avilal$([char]0x131) (?:Azize )?Teresa", "Teresa of [AÁ]vila"),
  @('lisieuxlu-kucuk-teresa.html', "Lisieux[’']l$([char]0xfc) (?:Azize )?(?:K$([char]0xfc)$([char]0xe7)$([char]0xfc)k )?Teresa", "Th$([char]0xe9)r$([char]0xe8)se of Lisieux"),
  @('aziz-ignatius-loyola.html', "Loyolal$([char]0x131) (?:Aziz )?$([char]0x130)gnatius", 'Ignatius of Loyola'),
  @('aziz-benedictus.html', "Nursial$([char]0x131) (?:Aziz )?Benedictus", 'Benedict of Nursia'),
  @('aziz-patrick.html', 'Aziz Patrick', "(?:St |Saint )Patrick"),
  @('padovali-aziz-antonius.html', "Padoval$([char]0x131) (?:Aziz )?Antuan", 'Anthony of Padua'),
  @('kalkutali-aziz-teresa.html', "Kalk$([char]0xfc)tal$([char]0x131) (?:Rahibe |Azize )?Teresa|Rahibe Teresa", "Mother Teresa|Teresa of Calcutta"),
  @('aziz-ii-yuhanna-pavlus.html', "II\. Ioannes Paulus", 'John Paul II'),
  @('aziz-hieronymus.html', 'Aziz Hieronymus', "(?:St |Saint )Jerome"),
  @('aziz-yusuf.html', 'Aziz Yusuf', "(?:St |Saint )Joseph(?! of)"),
  @('havari-petrus.html', 'Havari Petrus', "(?:St |Saint )Peter(?![’']s)(?! (?:Square|Basilica|Chanel|Claver|Canisius|Damian|Nolasco|Julian))|Peter the Apostle"),
  @('havari-pavlus.html', 'Havari Pavlus', "(?:St |Saint )Paul(?![’']s)(?! (?:Miki|of the Cross|VI))|Paul the Apostle"),
  @('vaftizci-yahya.html', 'Vaftizci Yahya', 'John the Baptist'),
  @('havari-yuhanna.html', 'Havari Yuhanna', 'John the Apostle'),
  @('mucizeler.html#fatima', "Fatima(?! Duas$([char]0x131))", 'Fatima(?! Prayer)', 'islama-cevap.html'),
  @('mucizeler.html#lourdes', 'Lourdes', 'Lourdes'),
  @('mucizeler.html#guadalupe', 'Guadalupe', 'Guadalupe'),
  @('mucizeler.html#zeytun', 'Zeytun', 'Zeitoun'),
  @('mucizeler.html#kefen', 'Torino Kefeni', 'Shroud of Turin'),
  @('mucizeler.html#lanciano', 'Lanciano', 'Lanciano'),
  @('mucizeler.html#bolsena', 'Bolsena', 'Bolsena'),
  @('mucizeler.html#bernadette', 'Bernadette', 'Bernadette'),
  @('mucizeler.html#vianney', "Jean-Marie Vianney|Ars Curesi", "Jean-Marie Vianney|John Vianney|Cur$([char]0xe9) of Ars"),
  @('tesbih-duasi.html', "[Tt]esbih [Dd]uas$([char]0x131)", 'the Rosary'),
  @('tesbih-tarihi.html#inebahti', "$([char]0x130)nebaht$([char]0x131)", 'Lepanto'),
  @('kutsal-ayin.html', "Kutsal Ayin|Pazar Ayini|Ayin(?=[’'])", "(?:Holy )?Mass(?! readings)", 'kilise/*'),
  @('gunah-cikarma.html', "[Gg]$([char]0xfc)nah [$([char]0xc7)$([char]0xe7)]$([char]0x131)kar\p{L}*", '(?<=(?:go|goes|going|went|come|comes|came) to )confession|hear(?:s|d|ing)? confessions?|[Ss]acrament of (?:Penance|Confession)|Confession(?= and)'),
  @('katolik-sureci.html', "Katolik olma(?:k|ya|n$([char]0x131)n)?|Katolik olmak isteyen", 'becoming Catholic|become Catholic|OCIA'),
  @('meseller.html', "[Mm]esel(?:ler|leri|lerinde|leriyle|lerle|i|ini|inde|iyle)?", '[Pp]arables?'),
  @('topraklarimizda-hristiyanlik.html#iznik', "$([char]0x130)znik Konsili|Efes Konsili", 'Council of Nicaea|Council of Ephesus'),
  @('topraklarimizda-hristiyanlik.html#yedi-kilise', "[Yy]edi [Kk]ilise", '[Ss]even [Cc]hurches'),
  @('topraklarimizda-hristiyanlik.html#yer-antakya', 'Antakya', 'Antioch'),
  @('topraklarimizda-hristiyanlik.html#yer-demre', "Myra|Demre", "Myra"),
  @('topraklarimizda-hristiyanlik.html#yer-kapadokya', 'Kapadokya', 'Cappadocia'),
  @('sss.html#araf', 'Araf', 'Purgatory', 'islama-cevap.html'),
  # plain "tesbih" (and its suffixed forms) for the Rosary; off where it also means Muslim prayer beads
  @('tesbih-duasi.html', "[Tt]esbih\p{L}*", '(?!)', 'islama-cevap.html'),
  @('meryem-ana.html', "Meryem Ana(?! Evi)", "(?<!House of the )(?:Blessed )?Virgin Mary"),
  @('katekizm.html', "(?<!Kilisesi )Katekizm\p{L}*", "Compendium(?: of the Catechism)?|Catechism(?! of the Catholic Church)"),
  @('kutsal-kitap.html', "Kutsal Kitap|Kutsal Kitab\p{L}+", "(?:the )?Bible")
) | ForEach-Object {
  $b = '(?<![\p{L}\d])'; $a = '(?![\p{L}\d])'
  # a fourth item names the pages (wildcards allowed) where the rule stays off
  @{ to = $_[0]; file = ($_[0] -split '#')[0]; tr = [regex]"$b(?:$($_[1]))$a"; en = [regex]"$b(?:$($_[2]))$a"; off = $(if ($_.Count -gt 3) { $_[3] } else { '' }) }
}
# The official texts (the Compendium and its parts) and the pages that are only lists or forms stay as they are
$XrefSkipPages = @('index.html', 'katekizm.html', 'iman-ikrari.html', 'kutsal-sirlar.html', 'mesihte-yasam.html', 'hristiyan-duasi.html',
  'motu-proprio.html', 'giris.html', 'ekler.html', '404.html', 'gizlilik.html', 'erisilebilirlik.html', 'kaynaklar-ve-telif.html', 'iletisim.html')
$XrefBlockTags = @('p', 'li', 'td')
$XrefSkipTags = @('a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'summary', 'button', 'label', 'select', 'option', 'script', 'style', 'svg', 'nav', 'header', 'footer', 'cite', 'figcaption', 'textarea')
$XrefSkipClass = [regex]'(?:^|\s)(?:verse|rt-[\w-]+|conventions|gloss|ic-tl[\w-]*|crumbs|text-link|faq-ref|th-link|ref-[\w-]+|m-day|label|th-quote)(?:\s|$)'
$XrefVoid = @('br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'wbr', 'col', 'area', 'embed', 'track')
function Link-Xrefs([string]$html, [string]$file) {
  if ($XrefSkipPages -contains $file) { return $html }
  $parts = [regex]::Split($html, '(<[^>]+>)')
  $stack = New-Object Collections.ArrayList   # each: @(tag, isBlock, isSkip, lang)
  $used = @{}
  $sb = [System.Text.StringBuilder]::new()
  foreach ($p in $parts) {
    if ($p.StartsWith('<')) {
      [void]$sb.Append($p)
      if ($p -match '^<!--') { continue }
      if ($p -match '^</([a-zA-Z0-9]+)') {
        $t = $Matches[1].ToLower()
        for ($i = $stack.Count - 1; $i -ge 0; $i--) { if ($stack[$i][0] -eq $t) { $stack.RemoveRange($i, $stack.Count - $i); break } }
        continue
      }
      if ($p -match '^<([a-zA-Z0-9]+)') {
        $t = $Matches[1].ToLower()
        if ($XrefVoid -contains $t -or $p.EndsWith('/>')) { continue }
        $cls = if ($p -match '\sclass="([^"]*)"') { $Matches[1] } else { '' }
        $lang = if ($cls -match '(?:^|\s)l-en(?:\s|$)') { 'en' } elseif ($cls -match '(?:^|\s)l-tr(?:\s|$)') { 'tr' } else { $null }
        $skip = ($XrefSkipTags -contains $t) -or $XrefSkipClass.IsMatch($cls)
        [void]$stack.Add(@($t, ($XrefBlockTags -contains $t), $skip, $lang))
      }
      continue
    }
    if (-not $p.Trim()) { [void]$sb.Append($p); continue }
    $inBlock = $false; $inSkip = $false; $lang = 'tr'
    foreach ($e in $stack) { if ($e[1]) { $inBlock = $true }; if ($e[2]) { $inSkip = $true }; if ($e[3]) { $lang = $e[3] } }
    if (-not $inBlock -or $inSkip) { [void]$sb.Append($p); continue }
    # the earliest mention in this text of a page not linked yet in this language, then the rest after it
    $rest = $p
    while ($rest) {
      $best = $null; $bestRule = $null
      foreach ($r in $XrefRules) {
        if ($r.file -eq $file -or ($r.off -and $file -like $r.off) -or $used.ContainsKey("$($r.to)|$lang")) { continue }
        $m = $r[$lang].Match($rest)
        if ($m.Success -and ($null -eq $best -or $m.Index -lt $best.Index)) { $best = $m; $bestRule = $r }
      }
      if ($null -eq $best) { [void]$sb.Append($rest); break }
      $used["$($bestRule.to)|$lang"] = $true
      [void]$sb.Append($rest.Substring(0, $best.Index)).Append("<a class=`"xref`" href=`"$($bestRule.to)`">$($best.Value)</a>")
      $rest = $rest.Substring($best.Index + $best.Length)
    }
  }
  return $sb.ToString()
}
$ShortTitles = @{
  'kilise/verapokhumin-buyukada.html' = @('Verapokhumin Ermeni Katolik Kilisesi, Büyükada', 'Verapokhumin Armenian Catholic Church, Büyükada')
}
function Write-Page {
  param([string]$File, [string]$Title, [string]$Description, [string]$Path, [string]$Body,
        [string[]]$JsonLd = @(), [string]$OgType = 'website',
        [string]$Robots = 'index,follow,max-snippet:-1,max-image-preview:large', [bool]$Canonical = $true, [bool]$RootRelative = $false,
        [string]$Lang = 'tr', [string]$TitleEn = '', [string]$DescriptionEn = '')
  $Body = Link-Refs $Body
  $Body = Link-Xrefs $Body $File
  $Body = Paint-Head $Body $File
  $Body = Paint-Sections $Body $File
  # Search results show roughly 60 characters of a title; a long page name keeps its words
  # and drops the site-name suffix instead (og:site_name still carries it).
  $suffix = " | $SiteName"
  if ($Title.Length -gt 60 -and $Title.EndsWith($suffix)) { $Title = $Title.Substring(0, $Title.Length - $suffix.Length) }
  if ($TitleEn.Length -gt 60 -and $TitleEn.EndsWith($suffix)) { $TitleEn = $TitleEn.Substring(0, $TitleEn.Length - $suffix.Length) }
  # Still too long: a hand-made short form where one exists, else drop the bracketed part
  # (an alternate name, a question range)
  $short = $ShortTitles[$File]
  if ($short) { if ($Title.Length -gt 60) { $Title = $short[0] }; if ($TitleEn.Length -gt 60) { $TitleEn = $short[1] } }
  if ($Title.Length -gt 60) { $Title = ($Title -replace '\s*\([^)]*\)', '').Trim() }
  if ($TitleEn.Length -gt 60) { $TitleEn = ($TitleEn -replace '\s*\([^)]*\)', '').Trim() }
  # Every page has an English twin under en/ (404.html excepted). Its description: the one
  # given, or else the page's first sizeable English paragraph.
  $enFile = En-Of $File
  $trOnly = -not $enFile -and -not $WithEnglish
  if ($trOnly) { $TitleEn = ''; $DescriptionEn = '' }
  if ($enFile -and -not $DescriptionEn) {
    foreach ($dm in [regex]::Matches($Body, 'class="l-en"[^>]*>(.*?)</(?:span|div)>', 'Singleline')) {
      $t = Plain $dm.Groups[1].Value
      if ($t.Length -ge 70) { $DescriptionEn = $t; break }
    }
  }
  if ($DescriptionEn) { $DescriptionEn = Meta-Trim $DescriptionEn 158 }
  $trUrl = "$SiteUrl/$Path"
  $enUrl = if ($enFile) { "$SiteUrl/$(Page-Path $enFile)" } else { '' }
  $hreflang = if ($enFile) { "<link rel=`"alternate`" hreflang=`"tr`" href=`"$trUrl`">`n<link rel=`"alternate`" hreflang=`"en`" href=`"$enUrl`">`n<link rel=`"alternate`" hreflang=`"x-default`" href=`"$trUrl`">" } else { '' }
  $headerHtml = Header-Html $File
  $footerHtml = $FooterHtml
  # The home screen app a page belongs to (Öğren, Dua Et, Keşfet), for its colour on phones
  $appAttr = if ($AppOf -and $AppOf[$File]) { " data-app=`"$($AppOf[$File])`"" } else { '' }
  # Every page but the home screen becomes an app screen on phones (see Av-Nav); the class is set
  # before the first paint so the page doesn't jump
  $isHome = $File -match '(^|/)index\.html$'
  $avJs = if ($isHome) { '' } else { "if(window.matchMedia&&matchMedia('(max-width: 979px)').matches){document.documentElement.classList.add('av');setTimeout(function(){document.documentElement.classList.add('av-ready')},3000)}" }
  $avNav = if ($isHome) { '' } else { Av-Nav $File $false }
  $appAttr += if ($isHome) { '' } else { " data-avp=`"$File`"" }
  # An article (every page but the home page, the Katekizm's, the calendar of saints, the
  # churches and the contact form): read as one long page that grows as it is scrolled, with a
  # bar at the top for how far along the reader is (script.js, initArticleFlow)
  $notArticle = $isHome -or $File -like 'en/*' -or ($KatekizmPages -contains $File) -or (@('azizler.html', 'kiliseler.html', 'iletisim.html', '404.html', 'katesizm.html') -contains $File)
  if (-not $notArticle) { $appAttr += ' data-article' }
  $a11yHtml = $A11yWidgetHtml
  # The TR | EN switch: links to the page's two addresses (so crawlers find both), a pair of
  # buttons that switch in place where there is only one (404.html)
  $pill = if ($enFile) {
    "<nav class=`"lang-pill`" aria-label=`"Dil / Language`"><span class=`"lp-knob`" aria-hidden=`"true`"></span>" +
    "<a class=`"lp-btn`" data-set-lang=`"tr`" lang=`"tr`" hreflang=`"tr`" href=`"/$Path`" title=`"Türkçe`">TR</a>" +
    "<a class=`"lp-btn`" data-set-lang=`"en`" lang=`"en`" hreflang=`"en`" href=`"/$(Page-Path $enFile)`" title=`"English`">EN</a></nav>"
  } elseif ($trOnly) { '' } else { $LangPillHtml }
  # Articles carry an image and a publisher, as search engines ask of them
  $JsonLd = @($JsonLd | ForEach-Object {
    if ($_ -match '"@type":"Article"' -and $_ -notmatch '"image"') {
      $pub = if ($_ -notmatch '"publisher"') { '"publisher":{"@type":"Organization","name":' + (JStr $SiteName) + ',"url":"' + $SiteUrl + '/","logo":{"@type":"ImageObject","url":"' + $SiteUrl + '/apple-touch-icon.png"}},' } else { '' }
      $mod = Page-LastMod $File
      $dm = if ($mod -and $_ -notmatch '"dateModified"') { '"dateModified":"' + $mod + '",' } else { '' }
      $_.Replace('"@type":"Article",', '"@type":"Article","image":"' + $SiteUrl + '/assets/og-image.jpg",' + $pub + $dm)
    } else { $_ }
  })
  $ldTr = ($JsonLd | ForEach-Object { "<script type=`"application/ld+json`">$_</script>" }) -join "`n"
  $csp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"
  if ($File -eq 'iletisim.html') { $csp = $csp.Replace("script-src 'self' 'unsafe-inline'", "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com") + "; frame-src https://challenges.cloudflare.com" }
  # One page, in the language its address gives: $pl ('tr' | 'en'), with that language's head
  $render = {
    param([string]$pl)
    $en = $pl -eq 'en'
    $t = if ($en -and $TitleEn) { $TitleEn } else { $Title }
    $d = if ($en -and $DescriptionEn) { $DescriptionEn } else { $Description }
    $u = if ($en) { $enUrl } else { $trUrl }
    $canon = if ($Canonical) { "<link rel=`"canonical`" href=`"$u`">" } else { '' }
    $loc = if ($en) { 'en_US' } else { 'tr_TR' }
    $locAlt = if ($enFile) { "<meta property=`"og:locale:alternate`" content=`"$(if ($en) { 'tr_TR' } else { 'en_US' })`">" } else { '' }
    $htmlAttr = if ($en) { ' lang="en" class="lang-en" data-url-lang="en" data-root="/"' }
      elseif ($enFile -or $trOnly) { " lang=`"tr`" data-url-lang=`"tr`"$(if ($RootRelative) { ' data-root="/"' })" }
      else { " lang=`"$Lang`"$(if ($RootRelative) { ' data-root="/"' })" }
    $ld = $ldTr
    if ($en) {
      $ld = $ld -replace '"inLanguage":"tr"', '"inLanguage":"en"' -replace '"name":"Ana Sayfa"', '"name":"Home"'
      # The page's own crumb and headline in English (its title without the site name)
      $tEn = if ($TitleEn) { $TitleEn -replace ([regex]::Escape($suffix) + '$'), '' } else { '' }
      if ($tEn) {
        $ld = [regex]::Replace($ld, '("position":\d+,"name":)"[^"]*"(,"item":"[^"]*"\}\]\})', { param($m) $m.Groups[1].Value + (JStr $tEn) + $m.Groups[2].Value })
        $ld = [regex]::Replace($ld, '"headline":"(?:[^"\\]|\\.)*"', { param($m) '"headline":' + (JStr $tEn) })
        $ld = [regex]::Replace($ld, '("@type":"Church","name":)"(?:[^"\\]|\\.)*"', { param($m) $m.Groups[1].Value + (JStr $tEn) })
      }
      $ld = $ld.Replace('"name":"Katekizm"', '"name":"Compendium"').Replace('"name":"Azizler"', '"name":"Saints"').Replace('"name":"Kilise Bul"', '"name":"Find a Church"').Replace('"Kardinal ', '"Cardinal ').Replace('"Papa XVI. Benediktus"', '"Pope Benedict XVI"')
      $ld = [regex]::Replace($ld, ('"' + [regex]::Escape($SiteUrl) + '/((?:kilise/)?[a-z0-9-]*(?:\.html)?)"'), $EnUrlEval)
      $ld = $ld.Replace('"description":' + (JStr $SiteTag), '"description":' + (JStr $SiteTagEn))
    }
    $kdTitleEn = if (-not $en -and $TitleEn) { "<meta name=`"kd-title-en`" content=`"$(Attr $TitleEn)`">" } else { '' }
@"
<!DOCTYPE html>
<html$htmlAttr>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>$(Attr $t)</title>
$kdTitleEn
<meta name="description" content="$(Attr $d)">
<meta name="robots" content="$Robots">
$canon
$hreflang
<meta name="theme-color" content="#16161a">
<meta http-equiv="Content-Security-Policy" content="$csp">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta property="og:type" content="$OgType">
<meta property="og:locale" content="$loc">
$locAlt
<meta property="og:site_name" content="$(Attr $SiteName)">
<meta property="og:title" content="$(Attr $t)">
<meta property="og:description" content="$(Attr $d)">
<meta property="og:url" content="$u">
<meta property="og:image" content="$SiteUrl/assets/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="$(Attr $SiteName)">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="$(Attr $t)">
<meta name="twitter:description" content="$(Attr $d)">
<meta name="twitter:image" content="$SiteUrl/assets/og-image.jpg">
<link rel="icon" href="favicon.ico" sizes="48x48">
<link rel="icon" href="$Favicon" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preload" href="assets/fonts/kd-brand-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/kd-brand-ext.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/lexend-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/lexend-ext-a.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/styles.min.css?v=$CssVer">
<script>$HeadJs$($avJs)$HeadJs2</script>
$ld
<script src="assets/script.min.js?v=$JsVer" defer></script>
</head>
<body$appAttr>
$headerHtml
$avNav
<main id="main">
$Body
</main>
$footerHtml
<!--KD-PILL-->
$a11yHtml
</body>
</html>
"@
  }
  # 404.html, the church pages and every English page are not at the site's top level (or are
  # served at any address), so their links start at the site root rather than at the file.
  $rootRx = '(href|src|action)="(?!https?:|#|/|data:|mailto:|tel:)'
  $html = & $render 'tr'
  if ($RootRelative) { $html = [regex]::Replace($html, $rootRx, '$1="/') }
  $html = $html.Replace('<!--KD-PILL-->', $pill)
  if ($trOnly) { $html = Strip-En $html }
  [IO.File]::WriteAllText((Join-Path $Root $File), $html, $Utf8)
  if ($enFile) {
    $h = & $render 'en'
    $h = (Map-EnLinks ([regex]::Replace($h, $rootRx, '$1="/'))).Replace('<!--KD-PILL-->', $pill)
    [IO.File]::WriteAllText((Join-Path $Root $enFile), $h, $Utf8)
  }
  $script:PageInfo += ,@{ File = $File; Path = $Path; En = $enFile; Title = $Title; TitleEn = $TitleEn; Desc = $Description; DescEn = $DescriptionEn; Robots = $Robots }
  Write-Host "  + $File$(if ($enFile) { " + $enFile" })"
}
function Breadcrumb-Ld([string]$name, [string]$path, [string]$parentName = '', [string]$parentPath = '', [string]$lang = 'tr') {
  $homeName = if ($lang -eq 'en') { 'Home' } else { 'Ana Sayfa' }
  $items = '{"@type":"ListItem","position":1,"name":' + (JStr $homeName) + ',"item":' + (JStr "$SiteUrl/") + '}'
  $pos = 2
  if ($parentName) {
    $items += ',{"@type":"ListItem","position":2,"name":' + (JStr $parentName) + ',"item":' + (JStr "$SiteUrl/$parentPath") + '}'
    $pos = 3
  }
  $items += ',{"@type":"ListItem","position":' + $pos + ',"name":' + (JStr $name) + ',"item":' + (JStr "$SiteUrl/$path") + '}'
  return '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[' + $items + ']}'
}
# The visible breadcrumb trail was removed from every page (the BreadcrumbList structured data
# stays, for search results); both functions are kept so the page code calling them is unchanged.
function Crumbs([string]$here, [string]$parentName = '', [string]$parentPath = '') {
  return ''
  $mid = if ($parentName) { "<a href=`"$parentPath`">$parentName</a><span aria-hidden=`"true`">›</span>" } else { '' }
  return "<nav class=`"crumbs`" aria-label=`"Konum`"><a href=`"index.html`">Ana Sayfa</a><span aria-hidden=`"true`">›</span>$mid<span aria-current=`"page`">$here</span></nav>"
}

Write-Host "Building pages ($SiteUrl)..."

# ================================================================== PART PAGES (1–4)
for ($i = 0; $i -lt 4; $i++) {
  $p = $Parts[$i]; $pn = [int]$p.part; $meta = $PartMeta[$pn]
  $items = @($p.items); $ranges = Get-Ranges $items
  $l1 = $items | Where-Object { $_.type -eq 'heading' -and $_.level -eq 1 } | Select-Object -First 1

  $toc = ($items | Where-Object { $_.type -eq 'heading' -and $_.level -ge 2 } | ForEach-Object {
    $title = (Split-Heading $_.tr)[1]; $titleEn = (Split-Heading $_.en)[1]
    "<li class=`"t$($_.level)`"><a href=`"#$($_.id)`"><span>$(T (Inline $title) (Inline $titleEn))</span><span class=`"rng`">$(Range-Text $ranges[$_.id])</span></a></li>"
  }) -join ''

  $prev = if ($pn -gt 1) { "<a class=`"prev`" href=`"$($PartMeta[$pn - 1].file)`"><span class=`"label`">← $(T $PartMeta[$pn - 1].ord $PartMeta[$pn - 1].ordEn)</span><strong>$(T $Parts[$i - 1].tr $Parts[$i - 1].en)</strong></a>" } else { "<a class=`"prev`" href=`"giris.html`"><span class=`"label`">←</span><strong>$(T 'Giriş' 'Introduction')</strong></a>" }
  $next = if ($pn -lt 4) { "<a class=`"next`" href=`"$($PartMeta[$pn + 1].file)`"><span class=`"label`">$(T $PartMeta[$pn + 1].ord $PartMeta[$pn + 1].ordEn) →</span><strong>$(T $Parts[$i + 1].tr $Parts[$i + 1].en)</strong></a>" } else { "<a class=`"next`" href=`"ekler.html`"><span class=`"label`">→</span><strong>$(T 'Ekler' 'Appendix')</strong></a>" }

  $body = @"
<div class="wrap">
  $(Crumbs $meta.ord 'Katekizm' 'katekizm.html')
  <header class="page-head">
    <div><p class="label">$(T "$($meta.ord) · Sorular $($p.from)–$($p.to)" "$($meta.ordEn) · Questions $($p.from)–$($p.to)")</p><h1>$(T $p.tr $p.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($l1.en)</p>")</div>
  </header>
  <div class="reader">
    <nav class="toc" id="toc" $(TA 'aria-label' 'Bu kısmın içindekiler listesi' 'Contents of this part')>
      <div class="toc-inner">
        <button type="button" class="icon-btn toc-close" $(TA 'aria-label' 'İçindekileri kapat' 'Close the contents')>$IcoClose</button>
        <p class="toc-title label">$(T 'İçindekiler' 'Contents')</p>
        <ol>$toc</ol>
      </div>
    </nav>
    <div class="content" id="content" data-reader>
      <div class="readbar">
        <button type="button" class="icon-btn toc-open" aria-controls="toc" aria-expanded="false" $(TA 'aria-label' 'İçindekiler' 'Contents')>$IcoList</button>
        <p class="current">$(T $p.tr $p.en)</p>
        <button type="button" class="icon-btn" data-chapter="prev" $(TA 'aria-label' 'Önceki başlık' 'Previous chapter')>$IcoPrev</button>
        <button type="button" class="icon-btn" data-chapter="next" $(TA 'aria-label' 'Sonraki başlık' 'Next chapter')>$IcoNext</button>
        <button type="button" class="icon-btn rb-search-btn" aria-controls="rb-search" aria-expanded="false" $(TA 'aria-label' "Katekizm$($Apos)de ara" 'Search the Catechism')>$IcoSearch</button>
        <div class="rb-search" id="rb-search" hidden>$(Search-Form 'rb-form' 'q-part' 'Soru ara: Türkçe, İngilizce ya da numara' 'tr' 'Search questions: English, Turkish or a number')</div>
      </div>
$(Render-Items $items)
      <nav class="pager" $(TA 'aria-label' 'Kısımlar arası geçiş' 'Between the parts')>$prev$next</nav>
    </div>
  </div>
</div>
"@
  $qas = $items | Where-Object { $_.type -eq 'qa' }
  Write-Page -File $meta.file -Title "$($meta.ord): $($p.tr) (Sorular $($p.from)–$($p.to)) | $SiteName" -TitleEn "$($meta.ordEn): $($p.en) (Questions $($p.from)–$($p.to)) | $SiteName" -Description $meta.desc -DescriptionEn $meta.descEn `
    -Path $meta.file -Body $body -JsonLd @((Breadcrumb-Ld $p.tr $meta.file 'Katekizm' 'katekizm.html')) -OgType 'article'
}

# ================================================================== HOME (index.html): search + accordion of the four parts
$acc = ($Parts | ForEach-Object {
  $p = $_; $meta = $PartMeta[[int]$p.part]; $items = @($p.items); $ranges = Get-Ranges $items
  $nQ = @($items | Where-Object { $_.type -eq 'qa' }).Count
  $nS = @($items | Where-Object { $_.type -eq 'heading' -and $_.level -eq 2 }).Count
  $sb = New-Object Text.StringBuilder; $open = $false
  # The questions that sit straight under a heading, before its first subheading (question 1,
  # under "Birinci Bölüm", say): listed as rows of their own, so they are not taken for a mere title
  $direct = @{}; $hasSub = @{}; $curH = $null; $stack = New-Object Collections.ArrayList
  foreach ($it in $items) {
    if ($it.type -eq 'heading') {
      while ($stack.Count -and $stack[$stack.Count - 1].level -ge $it.level) { $stack.RemoveAt($stack.Count - 1) }
      if ($stack.Count) { $hasSub[$stack[$stack.Count - 1].id] = $true }
      [void]$stack.Add($it)
      $curH = $it.id; $direct[$curH] = New-Object Collections.ArrayList
    }
    elseif ($it.type -eq 'qa' -and $curH) { [void]$direct[$curH].Add($it) }
  }
  $ownRows = {
    param($h, [string]$cls)
    $qs = @($direct[$h.id])
    # a heading with no subheadings is itself the row for its questions (but a section always lists them)
    if (-not $qs.Count -or ($h.level -gt 2 -and -not $hasSub[$h.id])) { return '' }
    ($qs | ForEach-Object { "<li class=`"$cls lv-own`"><a href=`"$($meta.file)#soru-$($_.n)`"><span><span class=`"c-label`">$(T "Soru $($_.n)" "Question $($_.n)")</span>$(T (Inline $_.tr.q) (Inline $_.en.q))</span><span class=`"rng`"></span></a></li>" }) -join ''
  }
  foreach ($h in ($items | Where-Object { $_.type -eq 'heading' -and $_.level -ge 2 -and $_.level -le 4 })) {
    $sp = Split-Heading $h.tr; $spe = Split-Heading $h.en; $href = "$($meta.file)#$($h.id)"; $rt = Range-Text $ranges[$h.id]
    if ($h.level -eq 2) {
      if ($open) { [void]$sb.Append('</ul></div>') }
      [void]$sb.Append("<div class=`"acc-section`"><a href=`"$href`"><span class=`"label`">$(T $sp[0] $spe[0])</span><span class=`"s-title`">$(T (Inline $sp[1]) (Inline $spe[1]))</span></a><ul class=`"acc-list`">")
      [void]$sb.Append((& $ownRows $h 'lv3'))
      $open = $true
    } elseif ($h.level -eq 3) {
      $lab = if ($sp[0]) { "<span class=`"c-label`">$(T $sp[0] $spe[0])</span>" } else { '' }
      [void]$sb.Append("<li class=`"lv3`"><a href=`"$href`"><span>$lab$(T (Inline $sp[1]) (Inline $spe[1]))</span><span class=`"rng`">$rt</span></a></li>")
      [void]$sb.Append((& $ownRows $h 'lv4'))
    } else {
      [void]$sb.Append("<li class=`"lv4`"><a href=`"$href`"><span>$(T (Inline $sp[1]) (Inline $spe[1]))</span><span class=`"rng`">$rt</span></a></li>")
    }
  }
  if ($open) { [void]$sb.Append('</ul></div>') }
@"
<details class="part-acc" id="kisim-$($p.part)">
  <summary><span class="roman" aria-hidden="true">$($meta.roman)</span><span><span class="p-title"><span class="visually-hidden">$(T $meta.ord $meta.ordEn): </span>$(T $p.tr $p.en)</span><span class="p-meta label">$(T "$nQ soru · $nS bölüm" "$nQ questions · $nS sections") · $($p.from)–$($p.to)</span></span>$IcoChevLg</summary>
  <div class="part-body">$($sb.ToString())<a class="btn btn-gold open-part" href="$($meta.file)">$(T 'Kısmı oku' 'Read this part')</a></div>
</details>
"@
}) -join "`n"

# ---------------- katekizm.html: the Compendium landing page (search + the four parts)
$katekizmBody = @"
<div class="wrap narrow">
  $(Crumbs 'Katekizm')
  <section class="hero work-hero">
    $Logo
    <h1>$(T $WorkName $SiteNameEn)</h1>
    $(TO "<p class=`"subtitle`" lang=`"en`">$SiteNameEn</p>")
    <p class="hint">$(T 'Başlıklarını görmek için bir kısmı açın ya da bir soru arayın.' 'Open a part to see its headings, or search for a question.')</p>
    $(Search-Form 'hero-search' 'q-katekizm' '598 soruda ara: Türkçe, İngilizce ya da soru numarası' 'tr' 'Search 598 questions: English, Turkish or a question number')
  </section>
  <div class="parts">
$acc
  </div>
  <div class="ornament">$SmallCross</div>
  <div class="more-texts">
    <a class="text-link" href="motu-proprio.html"><span class="label">$(T 'Önsöz' 'Preface')</span><span class="t-title">Motu Proprio</span><span class="t-sub">$(T 'XVI. Benediktus, 28 Haziran 2005' 'Benedict XVI, 28 June 2005')</span></a>
    <a class="text-link" href="giris.html"><span class="label">$(T 'Önsöz' 'Preface')</span><span class="t-title">$(T 'Giriş' 'Introduction')</span><span class="t-sub">$(T 'Kardinal Joseph Ratzinger, 20 Mart 2005' 'Cardinal Joseph Ratzinger, 20 March 2005')</span></a>
    <a class="text-link" href="ekler.html"><span class="label">$(T 'Ekler' 'Appendix')</span><span class="t-title">$(T 'Dualar ve Formüller' 'Prayers and Formulas')</span><span class="t-sub">$(T 'A. Sık Kullanılan Dualar · B. Katolik Öğretinin Formülleri' 'A. Common Prayers · B. Formulas of Catholic Doctrine')</span></a>
  </div>
  $(TB "<p class=`"conventions`">Kutsal Kitap göndermeleri Katolik kanonuna (Deuterokanonik kitaplar dahil) ve kaynak metindeki Katolik ayet numaralandırmasına göre verilmiştir. Türkçede farklı yazılan özel adların İngilizcesi ilk geçtikleri yerde parantez içinde verilir; ör. Petrus <span class=`"gloss`">(Peter)</span>. İsa <span class=`"gloss`">(Jesus)</span> ve Meryem <span class=`"gloss`">(Mary)</span> adları sık geçtiği için yinelenmez. Her sorunun altındaki sayılar, Katolik Kilisesi Katekizmi$($Apos)nin ilgili madde numaralarıdır.</p>" "<p class=`"conventions`">Scripture references follow the Catholic canon (including the deuterocanonical books) and the Catholic verse numbering of the source text. The numbers under each question are the matching paragraph numbers of the Catechism of the Catholic Church.</p>")
</div>
"@
$bookLd = '{"@context":"https://schema.org","@type":"Book","name":' + (JStr $WorkName) + ',"alternateName":' + (JStr "$SiteNameEn (Türkçe)") +
  ',"inLanguage":"tr","url":' + (JStr "$SiteUrl/katekizm.html") + ',"about":{"@type":"Thing","name":"Katolik Kilisesi"},' +
  '"translationOfWork":{"@type":"Book","name":' + (JStr $SiteNameEn) + ',"inLanguage":"en","datePublished":"2005-06-28","publisher":{"@type":"Organization","name":"Libreria Editrice Vaticana"}},' +
  '"hasPart":[' + (($Parts | ForEach-Object { '{"@type":"Chapter","name":' + (JStr $_.tr) + ',"url":' + (JStr "$SiteUrl/$($PartMeta[[int]$_.part].file)") + '}' }) -join ',') + ']}'
Write-Page -File 'katekizm.html' -Title "$WorkName | $SiteName" -TitleEn "$SiteNameEn | $SiteName" `
  -Description "Katolik Kilisesi Katekizmi Özeti$($Apos)nin (Compendium) Türkçe çevirisi: iman, kutsal sırlar, Hristiyan ahlakı ve dua üzerine 598 soru ve yanıt, İngilizce aslıyla." -DescriptionEn "The Compendium of the Catechism of the Catholic Church in Turkish and English: 598 questions and answers on faith, the sacraments, Christian life and prayer." `
  -Path 'katekizm.html' -Body $katekizmBody -JsonLd @($bookLd, (Breadcrumb-Ld 'Katekizm' 'katekizm.html'))

# ================================================================== ARTICLE PAGES: Motu Proprio, Giriş (Turkish paragraph + English original on demand)
function Parallel-Paragraphs($trList, $enList) {
  $tr = @($trList); $en = @($enList); $sb = New-Object Text.StringBuilder
  for ($k = 0; $k -lt $tr.Count; $k++) {
    $e = if ($k -lt $en.Count) { "<p>$(Inline $en[$k])</p>" } else { '' }
    [void]$sb.Append((TB "<p>$(Inline $tr[$k])</p>" $e))
  }
  return $sb.ToString()
}
function Article-Page([string]$file, [string]$crumb, [string]$label, [string]$h1, [string]$sub, [string]$bodyHtml, [string]$desc, [string]$ld, [string]$titleOverride = '', [string]$labelEn = '', [string]$titleEn = '', [string]$descEn = '') {
  $body = @"
<div class="wrap">
  $(Crumbs $crumb 'Katekizm' 'katekizm.html')
  <article class="article" id="article">
    <header class="page-head center"><p class="label">$(T $label $labelEn)</p><h1>$(T $h1 $sub)</h1>$(TO "<p class=`"sub`" lang=`"en`">$sub</p>")</header>
    <div class="body">$bodyHtml</div>
  </article>
</div>
"@
  $pageTitle = if ($titleOverride) { $titleOverride } else { $h1 }
  Write-Page -File $file -Title "$pageTitle | $SiteName" -TitleEn "$(if ($titleEn) { $titleEn } else { $sub }) | $SiteName" -Description $desc -DescriptionEn $descEn -Path $file -Body $body -JsonLd @($ld, (Breadcrumb-Ld $crumb $file 'Katekizm' 'katekizm.html')) -OgType 'article'
}
$mp = $X.motuProprio
$mpBody = (TB "<p class=`"address`">$($mp.tr.address)</p>" "<p class=`"address`">$($mp.en.address)</p>") +
  (Parallel-Paragraphs $mp.tr.paragraphs $mp.en.paragraphs) +
  "<div class=`"signature`">$(TB ((($mp.tr.closing | ForEach-Object { "<p>$(Inline $_)</p>" }) -join '')) ((($mp.en.closing | ForEach-Object { "<p>$_</p>" }) -join '')))</div>"
$mpLd = '{"@context":"https://schema.org","@type":"Article","headline":' + (JStr "Motu Proprio: $($mp.tr.title)") + ',"inLanguage":"tr","datePublished":"2005-06-28","author":{"@type":"Person","name":"Papa XVI. Benediktus"},"publisher":{"@type":"Organization","name":"Libreria Editrice Vaticana"},"mainEntityOfPage":' + (JStr "$SiteUrl/motu-proprio.html") + '}'
Article-Page 'motu-proprio.html' 'Motu Proprio' 'Motu Proprio' "Katolik Kilisesi Katekizmi Özeti$($Apos)nin Onaylanması ve Yayımlanması İçin Motu Proprio" `
  'Motu Proprio for the approval and publication of the Compendium of the Catechism of the Catholic Church' $mpBody `
  (Meta-Trim "Papa XVI. Benediktus$($Apos)un 28 Haziran 2005 tarihli Motu Proprio$($Apos)su: Katolik Kilisesi Katekizmi Özeti$($Apos)nin onaylanması ve yayımlanması, İngilizce aslıyla.") $mpLd `
  "Motu Proprio: Katekizm Özeti$($Apos)nin Onaylanması" 'Motu Proprio' 'Motu Proprio: Approval of the Compendium' `
  'The Motu Proprio of Pope Benedict XVI of 28 June 2005 approving and publishing the Compendium of the Catechism of the Catholic Church, in Turkish and English.'

$in = $X.introduction
$inBody = (Parallel-Paragraphs $in.tr.paragraphs $in.en.paragraphs) +
  "<div class=`"signature`">$(TB ((($in.tr.closing | ForEach-Object { "<p>$_</p>" }) -join '')) ((($in.en.closing | ForEach-Object { "<p>$_</p>" }) -join '')))</div>" +
  "<div class=`"footnotes`">$(Parallel-Paragraphs $in.tr.footnotes $in.en.footnotes)</div>"
$inLd = '{"@context":"https://schema.org","@type":"Article","headline":"Giriş","inLanguage":"tr","datePublished":"2005-03-20","author":{"@type":"Person","name":"Kardinal Joseph Ratzinger"},"mainEntityOfPage":' + (JStr "$SiteUrl/giris.html") + '}'
Article-Page 'giris.html' 'Giriş' 'Önsöz' 'Giriş' 'Introduction' $inBody `
  (Meta-Trim "Katolik Kilisesi Katekizmi Özeti$($Apos)nin Girişi (Kardinal Joseph Ratzinger, 2005): Özet$($Apos)in hazırlanışı, üç temel özelliği ve dört kısmı, İngilizce aslıyla.") $inLd '' 'Preface' '' `
  'Introduction to the Compendium of the Catechism by Cardinal Joseph Ratzinger (2005): how it was prepared, its three main features and four parts.'

# ================================================================== APPENDIX (ekler.html)
$prayers = ($X.appendix.prayers | ForEach-Object { Text-Card $_ $_.id 3 "<div class=`"verse`">$(Verse $_.tr.text)</div>" "<div class=`"verse`">$(Verse $_.en.text)</div>" }) -join "`n"
$formulas = ($X.appendix.formulas | ForEach-Object {
  $cls = if ($_.tr.plain) { ' class="plain"' } else { '' }
  $tr = "<div class=`"verse`"><ol$cls>" + (($_.tr.items | ForEach-Object { "<li>$(Inline $_)</li>" }) -join '') + '</ol></div>'
  $en = "<div class=`"verse`"><ol$cls>" + (($_.en.items | ForEach-Object { "<li>$_</li>" }) -join '') + '</ol></div>'
  Text-Card ([pscustomobject]@{ tr = $_.tr; en = $_.en; la = $null }) $_.id 3 $tr $en
}) -join "`n"
# Read like a prayer book: one column, no boxes, a short gold rule between prayers,
# and a row of links at the top of each part to jump straight to a prayer
function Pb-Index($items, [string]$label, [string]$labelEn) {
  $links = ($items | ForEach-Object { "<li><a href=`"#$($_.id)`">$(T (Inline $_.tr.title) (Inline $_.en.title))</a></li>" }) -join ''
  return "<nav class=`"pb-index`" $(TA 'aria-label' $label $labelEn)><ul>$links</ul></nav>"
}
$eklerBody = @"
<div class="wrap narrow" id="ekler">
  $(Crumbs 'Ekler' 'Katekizm' 'katekizm.html')
  <header class="page-head center"><p class="label">$(T 'Ekler' 'Appendix')</p><h1>$(T 'Ekler' 'Appendix')</h1>$(TO '<p class="sub" lang="en">Appendix</p>')</header>
  <h2 class="section-title" id="ek-a"><span class="label">A</span>$(T 'Sık Kullanılan Dualar' 'Common Prayers')</h2>
  $(Pb-Index $X.appendix.prayers 'Dualar' 'Prayers')
  <div class="prayer-book pb-prayers">
$prayers
  </div>
  <h2 class="section-title" id="ek-b"><span class="label">B</span>$(T 'Katolik Öğretinin Formülleri' 'Formulas of Catholic Doctrine')</h2>
  $(Pb-Index $X.appendix.formulas 'Formüller' 'Formulas')
  <div class="prayer-book pb-formulas">
$formulas
  </div>
</div>
"@
Write-Page -File 'ekler.html' -Title "Ekler: Dualar ve Katolik Öğreti Formülleri | $SiteName" -TitleEn "Appendix: Prayers and Formulas of Catholic Doctrine | $SiteName" `
  -Description "Katolik Kilisesi Katekizmi Özeti Ekleri: Türkçe, İngilizce ve Latince sık kullanılan dualar ve Katolik öğretinin formülleri." -DescriptionEn "Appendix to the Compendium of the Catechism: common Catholic prayers in Turkish, English and Latin, and the formulas of Catholic doctrine." `
  -Path 'ekler.html' -Body $eklerBody -JsonLd @((Breadcrumb-Ld 'Ekler' 'ekler.html' 'Katekizm' 'katekizm.html'))

# ================================================================== SSS (sss.html): questions from non-Catholics and newcomers
# Plain <details>/<summary> accordions: they open without JavaScript, are searchable by the
# browser find-in-page in supporting browsers, and each carries the CCC paragraphs it rests on.
$script:FaqN = 0
$faqToc = ($FaqData.categories | ForEach-Object { "<li><a href=`"#$($_.id)`">$(T (Inline $_.title) $_.en)</a></li>" }) -join ''
$faqCats = ($FaqData.categories | ForEach-Object {
  $script:FaqN++; $cat = $_
  $qs = ($cat.items | ForEach-Object {
    "<details class=`"faq-item`" id=`"$($_.id)`">" +
      "<summary><span class=`"faq-q`">$(T (Inline $_.q) (Inline $_.qEn))</span>$IcoChevLg</summary>" +
      "<div class=`"faq-a`">" +
        "<p class=`"faq-ref`" $(TA 'title' 'Katolik Kilisesi Katekizmi madde numaraları' 'Paragraph numbers in the Catechism of the Catholic Church')>$(Ccc-Link $_.ccc 'tr')</p>" +
        "$(TB (Blocks $_.a) (Blocks $_.aEn))</div>" +
    "</details>"
  }) -join "`n"
  $ma = @{ 'teolojik-yanilgilar' = @('trinity', 'blue'); 'kutsal-sirlar-uygulamalar' = @('shell', 'green'); 'otorite-ogretiler' = @('keys', 'gold'); 'akla-gelen-itirazlar' = @('oillamp', 'purple'); 'savunma-ve-guncel-sorular' = @('shield', 'red') }[$cat.id]
  if (-not $ma) { $ma = @('candle', 'gold') }
  $cnt = @($cat.items).Count
  Ill-Sec -Id $cat.id -Art $ma[0] -Tone $ma[1] -Class 'faq-cat' -Kick (T "$cnt soru" "$cnt questions") -Head (T (Inline $cat.title) $cat.en) `
    -Sub (TO "<p class=`"faq-cat-en`" lang=`"en`">$($cat.en)</p>") -Body "<div class=`"faq-list`">$qs</div>"
}) -join "`n"
$sssBody = @"
<div class="wrap narrow ill-page">
  $(Crumbs 'Sıkça Sorulan Sorular')
  <header class="page-head center">$(Page-Ico $IcoQuestion)<h1>$(T (Inline $FaqData.title) $FaqData.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($FaqData.en)</p>")</header>
  <nav class="faq-toc is-sticky" $(TA 'aria-label' 'Kategoriler' 'Categories')><ul>$faqToc</ul></nav>
$faqCats
</div>
"@
Write-Page -File 'sss.html' -Title "$($FaqData.title) | $SiteName" -TitleEn "$($FaqData.en) | $SiteName" `
  -Description "Katolik Kilisesi hakkında sık sorulan sorular ve Katekizm$($Apos)e dayanan yanıtlar: Meryem ve azizlere saygı, Kutsal Üçlü, günah çıkarma, papalık, araf, evrim." -DescriptionEn "Common questions about the Catholic Church, answered from the Catechism: Mary and the saints, the Trinity, confession, the papacy, purgatory and more." `
  -Path 'sss.html' -Body $sssBody -JsonLd @((Breadcrumb-Ld 'Sıkça Sorulan Sorular' 'sss.html'))

# ================================================================== KUTSAL KITAP (kutsal-kitap.html)
# Three quick answers first (what to read in Turkish, what in English, how to spot a Catholic
# edition); the guide's sections follow folded away, each opening in place. The closing source
# note stays outside the folds.
function Kk-Fold([string]$html, [string]$sfx = '') {
  $tail = ''
  $i = $html.IndexOf('<blockquote')
  if ($i -ge 0) { $tail = $html.Substring($i); $html = $html.Substring(0, $i) }
  $parts = [regex]::Split($html, '(?=<h2 id=")')
  $out = ($parts | Where-Object { $_.Trim() } | ForEach-Object {
    $m = [regex]::Match($_, '^<h2 id="([^"]+)">(.*?)</h2>(.*)$', 'Singleline')
    if (-not $m.Success) { return $_ }
    "<details class=`"kk-sec`" id=`"$($m.Groups[1].Value)$sfx`"><summary><h3>$($m.Groups[2].Value)</h3>$IcoChevLg</summary><div class=`"kk-sec-body`">$($m.Groups[3].Value)</div></details>"
  }) -join "`n"
  return "<div class=`"kk-secs`">$out</div><div class=`"kk-note`">$tail</div>"
}
$kkRead = 'https://www.bible.com/tr/versions/2308-kkdeu-kutsal-kitap-ve-deuterokanonik-kitaplar'
$kkQuick = @(
  @((T 'Türkçe okumak için' 'In Turkish'), (T 'Kutsal Kitap ve Deuterokanonik Kitaplar (2003)' 'Kutsal Kitap ve Deuterokanonik Kitaplar (2003)'),
    (T '73 kitabın tamamı, kolay okunur bir dille.' 'All 73 books, in easy modern Turkish.'),
    "<a href=`"$kkRead`" target=`"_blank`" rel=`"noopener`">$(T 'Ücretsiz oku' 'Read it free') $IcoExternal</a>"),
  @((T 'İngilizce için' 'In English'), 'RSV-CE (The Ignatius Bible)',
    (T 'Özgün metne yakın ama okunur; genel kullanım için en iyi seçim.' 'Close to the original yet readable; the best choice for general use.'),
    "<a href=`"https://www.ewtn.com/bible`" target=`"_blank`" rel=`"noopener`">$(T 'Ücretsiz oku' 'Read it free') $IcoExternal</a>"),
  @((T 'Satın alırken' 'When buying a Bible'), (T '73 kitap ve Imprimatur' '73 books and an Imprimatur'),
    (T 'Katolik baskıda 73 kitap vardır; iç kapakta Nihil obstat ve Imprimatur yazar.' 'A Catholic edition has 73 books, with Nihil obstat and Imprimatur inside the cover.'), '')
)
$kkQuickHtml = ($kkQuick | ForEach-Object {
  $act = if ($_[3]) { '<p class="kk-q-a">' + $_[3] + '</p>' } else { '' }
  '<div class="kk-q"><p class="kk-q-k">' + $_[0] + '</p><p class="kk-q-t">' + $_[1] + '</p><p class="kk-q-s">' + $_[2] + '</p>' + $act + '</div>'
}) -join ''
$kkLogosTr = @'
<h2>Çeviri neden bu kadar önemli?</h2><p>Yeni Ahit Grekçe yazıldı. Eski Grekçe, tek bir kelimeye koca bir felsefeyi sığdırabilen bir dildir; bu yüzden onu daha dar anlamlı dillere aktarmak zordur. Yuhanna İncili şöyle başlar: <em>“Başlangıçta Söz vardı. Söz Tanrı’yla birlikteydi ve Söz Tanrı’ydı”</em> (Yuhanna 1:1). Burada “Söz” diye çevrilen kelime, Grekçe <em lang="grc">logos</em>’tur.</p><p>Eski Grek felsefesinde logos, evrene düzen veren akıl ve ilahi zekâdır: her şeyi birbirine bağlayan ve yöneten evrensel ilke. Stoacı filozoflar için logos, doğa, kader ya da takdirle bir tutulan etkin, akıllı ve ruhani bir güçtü. Yuhanna bu kelimeyi seçerek şunu söyler: Evrenin anlamı ve düzeni olan bu Akıl, Tanrı’nın kendisidir ve İsa’da insan oldu (Yuhanna 1:14).</p><p>“Söz” ya da “Tanrısal Söz” gibi karşılıklar bu derinliği taşıyamaz; birçok okur için anlamı bile açık değildir. Grekçenin bu zenginliği, her kelimenin bağlamıyla birlikte dikkatle yorumlanmasını gerektirir. İyi bir çeviri ve Kilise’nin rehberliği bu yüzden bu kadar önemlidir.</p>
'@
$kkLogosEn = @'
<h2>Why translation matters so much</h2><p>The New Testament was written in Greek. Ancient Greek can fit a whole philosophy into a single word, which makes it hard to carry into languages with narrower words. John’s Gospel opens: <em>“In the beginning was the Word, and the Word was with God, and the Word was God”</em> (John 1:1). The word translated “Word” is the Greek <em lang="grc">logos</em>.</p><p>In ancient Greek philosophy, logos is the reason and divine intelligence that orders the cosmos: the universal principle that connects and governs all things. For the Stoics it was an active, rational, spiritual principle, equated with nature, fate or providence. By choosing this word, John says that this Reason, the meaning and order of the universe, is God himself, and became man in Jesus (John 1:14).</p><p>Renderings such as “Söz” (“Word”) or “Tanrısal Söz” (“Divine Word”) in Turkish cannot carry this depth; to many readers they barely make sense. Greek’s semantic breadth means every word must be read carefully in its context. That is why a good translation, and the Church’s guidance, matter so much.</p>
'@
# the Logos note: its heading becomes the section's, the rest its body
function Kk-Split([string]$h) { $m = [regex]::Match($h.Trim(), '^<h2>(.*?)</h2>(.*)$', 'Singleline'); return @($m.Groups[1].Value, $m.Groups[2].Value) }
$kkLT = Kk-Split $kkLogosTr; $kkLE = Kk-Split $kkLogosEn
$kkGuideN = ([regex]::Matches((Convert-Markdown $Kk.body), '<h2 id="')).Count
$kkBody = @"
<div class="wrap narrow ill-page">
  $(Crumbs 'Kutsal Kitap')
  <header class="page-head center">$(Page-Ico $IcoBible)<h1>$(T $KkMeta.title $KkEn.meta.title)</h1><p class="sub">$(T $KkMeta.subtitle $KkEn.meta.subtitle)</p></header>
$(Ill-Sec -Id 'kisaca' -HeadId 'kk-quick-h' -Art 'book' -Tone 'gold' -Kick (T 'Hangi Kutsal Kitap?' 'Which Bible?') -Head (T 'Kısaca' 'In short') `
    -Body "<div class=`"kk-quick`">$kkQuickHtml</div><p class=`"kk-motto`">$(T 'En iyi çeviri, okuyacağınız çeviridir.' 'The best translation is the one you will read.')</p>")
$(Ill-Sec -Id 'logos' -Art 'scroll' -Tone 'blue' -Kick (T 'Logos' 'Logos') -Head (T (Inline $kkLT[0]) (Inline $kkLE[0])) `
    -Body "<div class=`"prose ill-prose`">$(TB (Inline $kkLT[1]) (Inline $kkLE[1]))</div>")
$(Ill-Sec -Id 'rehber' -Art 'lectern' -Tone 'red' -Kick (T "$kkGuideN bölüm" "$kkGuideN sections") -Head (T 'Rehberin tamamı' 'The full guide') `
    -Body "<div class=`"body prose kk-body`">$(TB (Kk-Fold (Convert-Markdown $Kk.body)) (Kk-Fold (Convert-Markdown $KkEn.body) '-en'))</div>")
</div>
"@
Write-Page -File 'kutsal-kitap.html' -Title "$($KkMeta.title) | $SiteName" -TitleEn "$($KkEn.meta.title) | $SiteName" -Description $KkMeta.description -DescriptionEn $KkEn.meta.description `
  -Path 'kutsal-kitap.html' -Body $kkBody -JsonLd @((Breadcrumb-Ld 'Kutsal Kitap' 'kutsal-kitap.html'))

$IcoArrowR = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
# ================================================================== KATOLIK SURECI (katolik-sureci.html)
# Two doors up top (never baptized / baptized in another church), the first step in one line, the
# OCIA steps as a short numbered list, and everything else (the baptized path, conditional
# baptism, the wait, practical questions) folded away, each opening in place.
$sureciDoors = (@($Sureci.paths) | ForEach-Object -Begin { $di = 0 } -Process {
  $to = if ($di -eq 0) { 'surec' } else { 'zaten-hristiyan' }; $di++
  "<a class=`"why-door`" href=`"#$to`"><span class=`"why-door-t`">$(T (Inline $_.door) (Inline $_.doorEn))</span><span class=`"why-door-s`">$(T (Inline $_.doorSub) (Inline $_.doorSubEn))</span>$IcoArrowR</a>"
}) -join ''
$stageList = ($Sureci.steps | ForEach-Object {
  $i = [array]::IndexOf(@($Sureci.steps), $_) + 1
  "<li class=`"stage`"><span class=`"stage-n`">$i</span><div class=`"stage-body`"><h3>$(T (Inline $_.title) (Inline $_.en))</h3><p>$(T (Inline $_.text) (Inline $_.textEn))</p></div></li>"
}) -join "`n"
function Sureci-Fold([string]$id, $title, $body) {
  "<details class=`"kk-sec`" id=`"$id`"><summary><h3>$title</h3>$IcoChevLg</summary><div class=`"kk-sec-body prose`">$body</div></details>"
}
$sureciFolds = @(
  (Sureci-Fold 'zaten-hristiyan' (T $Sureci.already.title $Sureci.already.titleEn) (TB (Blocks $Sureci.already.body) (Blocks $Sureci.already.bodyEn))),
  (Sureci-Fold 'sartli-vaftiz' (T $Sureci.conditional.title $Sureci.conditional.titleEn) (TB (Blocks $Sureci.conditional.body) (Blocks $Sureci.conditional.bodyEn))),
  (Sureci-Fold 'beklerken' (T $Sureci.waiting.title $Sureci.waiting.titleEn) (TB (Blocks $Sureci.waiting.body) (Blocks $Sureci.waiting.bodyEn)))
) + @($Sureci.faq | ForEach-Object { Sureci-Fold $_.id (T (Inline $_.q) (Inline $_.qEn)) "<p>$(T (Inline $_.a) (Inline $_.aEn))</p>" })
$sureciBody = @"
<div class="wrap narrow sureci-wrap ill-page" data-av-nogh>
  $(Crumbs 'Katolik Olma Süreci')
  <header class="page-head center">$(Page-Ico $IcoDoor)<h1>$(T $Sureci.title $Sureci.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($Sureci.en)</p>")</header>
  <p class="why-intro">$(T (Inline $Sureci.intro) (Inline $Sureci.introEn))</p>
  <nav class="why-doors two" $(TA 'aria-label' 'Hangi yol sizin için?' 'Which path is yours?')>$sureciDoors</nav>
  <p class="sureci-first">$(T (Inline $Sureci.firstStep) (Inline $Sureci.firstStepEn)) <a href="kiliseler.html">$IcoPin $(T 'Kilise Bul' 'Find a Church')</a></p>
$(Ill-Sec -Id 'surec' -HeadId 'h-surec' -Art 'shell' -Tone 'blue' -Kick (T 'OCIA · yaklaşık altı ay' 'OCIA · about six months') -Head (T 'Hazırlık adım adım' 'The preparation, step by step') `
    -Body "<p class=`"why-thesis`">$(T (Inline $Sureci.processIntro) (Inline $Sureci.processIntroEn))</p><ol class=`"stage-list`">$stageList</ol>")
$(Ill-Sec -Id 'sorular' -HeadId 'h-sorular' -Art 'candle' -Tone 'gold' -Kick (T 'Sorular ve özel durumlar' 'Questions and special cases') -Head (T 'Merak edilenler' 'Good to know') `
    -Body "<div class=`"kk-secs`">$($sureciFolds -join '')</div>")
  $(TB "<p class=`"conventions`">Bu sayfadaki OCIA süreci, Kilise$($Apos)nin bütün dünyada geçerli düzenlemesidir (1972, Tanrısal Kült Cemaati). Paskalya Nöbeti dışında kabul ve günah çıkarmanın zamanı gibi bazı ayrıntılar, ABD Katolik Episkoposlar Konferansı$($Apos)nın Katekümenlik İçin Ulusal Tüzüğü$($Apos)nden (1986) alınmıştır. Kendi bölgenizdeki uygulama için en yakın kiliseye danışın.</p>" "<p class=`"conventions`">The general OCIA process on this page is a universal Church regulation (1972, Congregation for Divine Worship); some details above (such as reception outside the Easter Vigil, or the timing of confession) are drawn from the U.S. Conference of Catholic Bishops' National Statutes for the Catechumenate (1986). For practice in your own region, ask your nearest parish.</p>")
</div>
"@
Write-Page -File 'katolik-sureci.html' -Title "$($Sureci.title) | $SiteName" -TitleEn "$($Sureci.en) | $SiteName" `
  -Description "Katolik olmak isteyenler için: OCIA/RCIA süreci nedir, vaftizli ve vaftizsiz adaylar için adım adım nasıl işler, hangi hazırlık gerekir." -DescriptionEn "How to become Catholic: what OCIA (RCIA) is, how it works step by step for baptized and unbaptized adults, and how to prepare." `
  -Path 'katolik-sureci.html' -Body $sureciBody -JsonLd @((Breadcrumb-Ld 'Katolik Olma Süreci' 'katolik-sureci.html'))

# ================================================================== GUNAH CIKARMA (gunah-cikarma.html)
# Two doors (how it works / preparing), the steps as a light timeline, and the rest folded: one fold
# per commandment in the examination of conscience (what it covers, then the questions) and one per
# question and fear. The seal martyrs footnote stays open under the questions.
$confessionSteps = ($Confession.steps | ForEach-Object {
  $i = [array]::IndexOf(@($Confession.steps), $_) + 1
  "<li class=`"stage`"><span class=`"stage-n`">$i</span><div class=`"stage-body`"><h3>$(T (Inline $_.title) (Inline $_.en))</h3><p>$(T (Inline $_.text) (Inline $_.textEn))</p></div></li>"
}) -join "`n"
$examenFolds = ($Confession.examenGroups | ForEach-Object {
  $group = $_
  $items = ($group.items | ForEach-Object { '<li>' + (Inline $_) + '</li>' }) -join ''
  $itemsEn = ($group.itemsEn | ForEach-Object { '<li>' + (Inline $_) + '</li>' }) -join ''
  $lists = TB ('<ul class="examen-list">' + $items + '</ul>') ('<ul class="examen-list">' + $itemsEn + '</ul>')
  $note = ''
  if ($group.noteMark) { $note = '<p class="examen-note">* ' + (T (Inline $Confession.examenNote) (Inline $Confession.examenNoteEn)) + '</p>' }
  $title = (T (Inline $group.title) (Inline $group.titleEn)) + $(if ($group.noteMark) { '*' } else { '' })
  $slug = 'emir-' + (([regex]::Match($group.title, '^[\d ve]+')).Value.Trim() -replace '\s+ve\s+', '-' -replace '\s', '')
  '<details class="kk-sec" id="' + $slug + '"><summary><h3>' + $title + '</h3>' + $IcoChevLg + '</summary><div class="kk-sec-body">' +
    '<p class="examen-about">' + (T (Inline $group.about) (Inline $group.aboutEn)) + '</p>' + $lists + $note + '</div></details>'
}) -join "`n"
# the questions are short and all worth reading, so they are simply listed open, question over answer
$confessionFaq = ($Confession.faq | ForEach-Object {
  '<div class="ill-qa" id="' + $_.id + '"><h3 class="ill-q">' + (T (Inline $_.q) (Inline $_.qEn)) + '</h3><p class="ill-a">' + (T (Inline $_.a) (Inline $_.aEn)) + '</p></div>'
}) -join "`n"
$sealMartyrsItems = ($Confession.sealMartyrs.items | ForEach-Object { '<li><strong>' + (Inline $_.name) + '</strong> ' + (Inline $_.detail) + '</li>' }) -join "`n"
$sealMartyrsItemsEn = ($Confession.sealMartyrs.itemsEn | ForEach-Object { '<li><strong>' + (Inline $_.name) + '</strong> ' + (Inline $_.detail) + '</li>' }) -join "`n"
$sealLists = TB ('<ul class="footnote-list">' + $sealMartyrsItems + '</ul>') ('<ul class="footnote-list">' + $sealMartyrsItemsEn + '</ul>')
$sealMartyrsHtml = '<aside class="footnote-block" id="muhur-sehitleri"><p class="footnote-label">* ' + (T (Inline $Confession.sealMartyrs.title) (Inline $Confession.sealMartyrs.titleEn)) + '</p><p>' + (T (Inline $Confession.sealMartyrs.intro) (Inline $Confession.sealMartyrs.introEn)) + '</p>' + $sealLists + '</aside>'
$confessionDoors = '<a class="why-door" href="#adim-adim"><span class="why-door-t">' + (T 'İlk kez ya da uzun bir aradan sonra gidiyorum' 'I''m going for the first time, or for the first time in a long time') + '</span><span class="why-door-s">' + (T 'Adım adım neler olacağını görün' 'See what happens, step by step') + '</span>' + $IcoArrowR + '</a>' +
  '<a class="why-door" href="#vicdan-muhasebesi"><span class="why-door-t">' + (T 'Hazırlanmak istiyorum' 'I want to prepare') + '</span><span class="why-door-s">' + (T "On Emir$($Apos)e göre vicdan muhasebesi" 'An examination of conscience based on the Ten Commandments') + '</span>' + $IcoArrowR + '</a>'
$confessionBody = @"
<div class="wrap narrow sureci-wrap ill-page" data-av-nogh>
  $(Crumbs 'Günah Çıkarma')
  <header class="page-head center">$(Page-Ico $IcoKey)<h1>$(T $Confession.title $Confession.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($Confession.en)</p>")</header>
  <p class="why-intro">$(T (Inline $Confession.intro) (Inline $Confession.introEn))</p>
  <nav class="why-doors two" $(TA 'aria-label' 'Nereden başlamak istersiniz?' 'Where would you like to start?')>$confessionDoors</nav>
$(Ill-Sec -Id 'adim-adim' -HeadId 'h-adim' -Art 'keys' -Tone 'purple' -Kick (T 'Ayin nasıl ilerler' 'How the rite unfolds') -Head (T 'Adım adım' 'Step by step') `
    -Body "<ol class=`"stage-list`">$confessionSteps</ol>")
$(Ill-Sec -Id 'vicdan-muhasebesi' -HeadId 'h-vicdan' -Art 'tablets' -Tone 'red' -Kick (T 'Hazırlık' 'Preparation') -Head (T 'Vicdan muhasebesi' 'Examination of conscience') `
    -Body "<p class=`"why-thesis`">$(T (Inline $Confession.examenIntro) (Inline $Confession.examenIntroEn))</p><div class=`"kk-secs`">$examenFolds</div>")
$(Ill-Sec -Id 'sorular-ve-korkular' -HeadId 'h-sorular' -Art 'candle' -Tone 'green' -Kick (T 'Merak edilenler' 'What people ask') -Head (T 'Sık sorulan sorular ve korkular' 'Common questions and fears') `
    -Body "<div class=`"ill-qas`">$confessionFaq</div>$sealMartyrsHtml")
  $(TB "<p class=`"conventions`">Bu sayfa, Katolik Kilisesi Katekizmi$($Apos)nin Tövbe ve Barışma Kutsal Sırrı üzerine öğretisine (<a href=`"https://www.vatican.va/content/catechism/en/part_two/section_two/chapter_two/article_4/vi_the_sacrament_of_penance_and_reconciliation.html`" target=`"_blank`" rel=`"noopener`">KKK 1420-1498</a>) ve Kilise hukukuna dayanır; ayin sözlerinin tam metni bölgeden bölgeye küçük farklar gösterebilir. Uygulamadaki ayrıntılar için (örneğin günah çıkarma saatleri) en yakın cemaat kilisenize danışın; <a href=`"kiliseler.html`">Kilise Bul</a> sayfası size yardımcı olabilir.</p>" "<p class=`"conventions`">This page is grounded in the Catechism of the Catholic Church's teaching on the Sacrament of Penance and Reconciliation (<a href=`"https://www.vatican.va/content/catechism/en/part_two/section_two/chapter_two/article_4/vi_the_sacrament_of_penance_and_reconciliation.html`" target=`"_blank`" rel=`"noopener`">CCC 1420-1498</a>) and canon law; the exact wording of the rite can vary slightly from region to region. For practical details (such as confession times), ask your nearest parish; the <a href=`"kiliseler.html`">Find a Church</a> page can help.</p>")
</div>
"@
Write-Page -File 'gunah-cikarma.html' -Title "$($Confession.title) | $SiteName" -TitleEn "$($Confession.en) | $SiteName" `
  -Description "Günah çıkarma nasıl işler? Adım adım pratik rehber, vicdan muhasebesi listesi ve ilk kez günah çıkaracaklar için sık sorulan sorular." -DescriptionEn "How to go to confession: a practical step-by-step guide, an examination of conscience and answers for those going for the first time." `
  -Path 'gunah-cikarma.html' -Body $confessionBody -JsonLd @((Breadcrumb-Ld 'Günah Çıkarma' 'gunah-cikarma.html'))

# ================================================================== ANADOLU'DAKI KOKLER HARITASI (on the page below)
# The places come from data/anadolu-haritasi.js, the outline from data/anadolu-harita-sekli.js
# (generated, see tools/anadolu-harita-sekli.mjs). Every place also gets a server-rendered card:
# initAnatoliaMap() in assets/script.js shows it in the popup, and without JavaScript the cards
# simply stay visible as a list under the map.
$AnMap = Read-Data 'anadolu-haritasi.js'
$AnShape = Read-Data 'anadolu-harita-sekli.js'
function Map-Num([double]$v) { return ([Math]::Round($v, 1)).ToString([Globalization.CultureInfo]::InvariantCulture) }
function Map-XY([double]$lat, [double]$lon) {
  $x = $AnShape.tx + $AnShape.k * $lon * [Math]::PI / 180
  $y = $AnShape.ty - $AnShape.k * [Math]::Log([Math]::Tan([Math]::PI / 4 + $lat * [Math]::PI / 360))
  return @((Map-Num $x), (Map-Num $y))
}
# SVG text cannot hold the page's span pairs: its two languages are two tspans (CSS hides one)
function TS([string]$tr, [string]$en) {
  if (-not $en -or $en -ceq $tr) { return $tr }
  return "<tspan class=`"l-tr`">$tr</tspan><tspan class=`"l-en`">$en</tspan>"
}
function Anatolia-Map([string]$lang) {
  $catName = @{}; foreach ($c in $AnMap.cats) { $catName[$c.id] = (T $c.tr $c.en) }
  $seas = @(@{ n = 'Karadeniz'; ne = 'Black Sea'; lat = 42.55; lon = 34.6 }, @{ n = 'Akdeniz'; ne = 'Mediterranean Sea'; lat = 35.25; lon = 31.2 }, @{ n = 'Ege Denizi'; ne = 'Aegean Sea'; lat = 36.0; lon = 26.22 })
  $seaText = ($seas | ForEach-Object { $p = Map-XY $_.lat $_.lon; "<text x=`"$($p[0])`" y=`"$($p[1])`">$(TS $_.n $_.ne)</text>" }) -join ''
  $markers = New-Object Text.StringBuilder
  $cards = New-Object Text.StringBuilder
  foreach ($s in $AnMap.sites) {
    $c = $s.tr; $e = $s.en
    $p = Map-XY $s.lat $s.lon
    $label = if ($c.label) { $c.label } else { $c.name }
    $labelEn = if ($e.label) { $e.label } else { $e.name }
    [void]$markers.Append("<g class=`"amap-site c-$($s.cat)`" data-site=`"$($s.id)`" transform=`"translate($($p[0]) $($p[1]))`" tabindex=`"0`" role=`"button`" $(TA 'aria-label' $c.name $e.name) aria-controls=`"amap-pop`">" +
      "<circle class=`"amap-hit`" r=`"11`"></circle><circle class=`"amap-dot`" r=`"6`"></circle>" +
      "<text class=`"amap-label`" x=`"$(if ($null -ne $c.lx) { $c.lx } else { $s.lx })`" y=`"$(if ($null -ne $c.ly) { $c.ly } else { $s.ly })`" text-anchor=`"$(if ($c.la) { $c.la } else { $s.la })`">$(TS $label $labelEn)</text></g>")
    $old = if ($c.old) { " <span class=`"amap-c-old`">($(T $c.old $e.old))</span>" } else { '' }
    $refs = if (@($c.refs).Count) { "<div class=`"amap-c-refs`"><span class=`"label`">$(T "Kutsal Kitap$($Apos)ta" 'In Scripture')</span>" + (TB ((@($c.refs) | ForEach-Object { "<span class=`"amap-ref`">$_</span>" }) -join '') ((@($e.refs) | ForEach-Object { "<span class=`"amap-ref`">$_</span>" }) -join '')) + '</div>' } else { '' }
    $more = if ($s.section) { "<a class=`"amap-c-more`" href=`"#$($s.section)`">$(T 'Bu sayfada devamını okuyun' 'Read more on this page')$IcoChevDown</a>" } else { '' }
    [void]$cards.Append("<article class=`"amap-card c-$($s.cat)`" id=`"yer-$($s.id)`" data-site=`"$($s.id)`" hidden>" +
      "<p class=`"amap-c-cat`"><span class=`"amap-key`"></span>$($catName[$s.cat])</p>" +
      "<h3 class=`"amap-c-name`">$(T $c.name $e.name)$old</h3><p class=`"amap-c-place`">$(T $c.place $e.place)</p>" +
      "<p class=`"amap-c-text`">$(T (Inline $c.text) (Inline $e.text))</p>$refs$more</article>")
  }
  # the groups, listed small in the map's lower right corner: pointing at one lights up its places
  $legend = ($AnMap.cats | ForEach-Object {
    "<li><button type=`"button`" class=`"amap-lg c-$($_.id)`" data-cat=`"$($_.id)`"><span class=`"amap-key`"></span>$(T $_.tr $_.en)</button></li>"
  }) -join ''
  return @"
<section class="amap" id="harita" aria-labelledby="amap-h">
  <h2 class="section-title" id="amap-h">$(T $AnMap.title $AnMap.en)</h2>
  <p class="amap-lead">$(T $AnMap.lead $AnMap.leadEn)</p>
  <div class="amap-frame">
    <div class="amap-scroll">
      <svg class="amap-svg" viewBox="0 0 $($AnShape.W) $($AnShape.H)" role="group" $(TA 'aria-label' 'Hristiyanlığın ilk tarihinden yerlerle Türkiye haritası' 'Map of Turkey with places from the early history of Christianity')>
        <rect class="amap-sea" width="$($AnShape.W)" height="$($AnShape.H)"></rect>
        <path class="amap-land" d="$($AnShape.land)"></path>
        <path class="amap-tr" d="$($AnShape.turkey)"></path>
        <path class="amap-lake" d="$($AnShape.lakes)"></path>
        <g class="amap-seas" aria-hidden="true">$seaText</g>
        <g class="amap-sites">$($markers.ToString())</g>
      </svg>
    </div>
    <ul class="amap-legend" $(TA 'aria-label' 'Haritadaki yer grupları' 'Groups of places on the map')>$legend</ul>
    <div class="amap-pop" id="amap-pop" role="dialog" aria-labelledby="amap-pop-h" hidden>
      <button type="button" class="amap-pop-close" $(TA 'aria-label' 'Kapat' 'Close')>$IcoClose</button>
      <div class="amap-pop-body"></div>
      <p class="amap-pop-hint">$(T 'Kartı açık tutmak için tıklayın' 'Click to keep this card open')</p>
    </div>
  </div>
  <p class="amap-swipe">$(T 'Haritanın tamamını görmek için yana kaydırın' 'Swipe the map sideways to see all of it')</p>
  <div class="amap-cards">$($cards.ToString())</div>
</section>
"@
}

# ================================================================== TOPRAKLARIMIZDA HRISTIYANLIK (topraklarimizda-hristiyanlik.html)
# Each section as an illustrated section (Ill-Sec), its kicker naming the map group it belongs to, in that group's colour
$AnaArt = @{ 'pavlus' = 'ship'; 'yedi-kilise' = 'lampstand'; 'iznik' = 'church'; 'kilise-babalari' = 'book' }
$AnaCat = @{ 'pavlus' = 'pavlus'; 'yedi-kilise' = 'kilise'; 'iznik' = 'konsil'; 'kilise-babalari' = 'gelenek' }
$AnaTone = @{ 'pavlus' = 'gold'; 'kilise' = 'red'; 'konsil' = 'blue'; 'gelenek' = 'green' }
$anatoliaSections = ($Anatolia.sections | ForEach-Object {
  $cid = $AnaCat[$_.id]
  $cat = if ($cid) { $AnMap.cats | Where-Object { $_.id -eq $cid } | Select-Object -First 1 } else { $null }
  Ill-Sec -Id $_.id -Art $AnaArt[$_.id] -Tone $(if ($cid) { $AnaTone[$cid] } else { 'gold' }) -Kick $(if ($cat) { T $cat.tr $cat.en } else { '' }) `
    -Head (T (Inline $_.title) $_.en) -Sub (TO "<p class=`"faq-cat-en`" lang=`"en`">$($_.en)</p>") `
    -Body "<div class=`"prose ill-prose`">$(TB (Blocks $_.body) (Blocks $_.bodyEn))</div>"
}) -join "`n"
$anatoliaBody = @"
<div class="wrap narrow">
  $(Crumbs 'Topraklarımızda Hristiyanlık')
  <header class="page-head center">$(Page-Ico $IcoRoots)<h1>$(T $Anatolia.title $Anatolia.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($Anatolia.en)</p>")</header>
</div>
<div class="wrap">
$(Anatolia-Map 'tr')
</div>
<div class="wrap narrow">
$anatoliaSections
  <p class="conventions closing-note">$(T (Inline $Anatolia.closing) (Inline $Anatolia.closingEn))</p>
</div>
"@
Write-Page -File 'topraklarimizda-hristiyanlik.html' -Title "$($Anatolia.title) | $SiteName" -TitleEn "$($Anatolia.en) | $SiteName" `
  -Description "Hristiyanlığın Anadolu'daki kökleri: Pavlus'un memleketi Tarsus, Vahiy Kitabı'nın yedi kilisesi, İznik Konsili, Antakya ve İzmir'deki ilk Kilise Babaları." -DescriptionEn "Christianity's roots in Anatolia, today's Turkey: Paul's hometown Tarsus, the seven churches of Revelation, the Council of Nicaea, Antioch and Smyrna." `
  -Path 'topraklarimizda-hristiyanlik.html' -Body $anatoliaBody -JsonLd @((Breadcrumb-Ld 'Topraklarımızda Hristiyanlık' 'topraklarimizda-hristiyanlik.html'))

# ================================================================== İSLAM'A CEVAP (islama-cevap.html)
# The Tartış section's first page: a short summary ("Kısaca"), each point leading to its section,
# then the full case in parts. In the text, "Kur’an 9:29" (and "; 6:114" after it) links to that
# verse on quran.com, and "Buhari 25", "Müslim 1452a", "Ebu Davud 4002", "Tirmizi 2653", "İbn Mace 1944" or
# "Nesai 3959" to the hadith on sunnah.com
# (in the English text: "Qur’an 9:29", "Bukhari 25", "Muslim 1452a", "Abu Dawud 4002", "Tirmidhi 2653",
# "Ibn Majah 1944", "Nasa’i 3959").
$Ic = Read-Data 'islama-cevap.js'
$QuranRx = [regex]("(Kur$($Apos)an|Qur$($Apos)an) " + '(\d{1,3}:\d{1,3}(?:-\d{1,3})?(?:;\s?\d{1,3}:\d{1,3}(?:-\d{1,3})?)*)')
$QuranEval = [System.Text.RegularExpressions.MatchEvaluator]{
  param($m)
  $refs = ($m.Groups[2].Value -split ';\s?' | ForEach-Object {
    $cv = $_ -split ':'
    "<a class=`"qref`" href=`"https://quran.com/$($cv[0])/$($cv[1])`" target=`"_blank`" rel=`"noopener`">$_</a>"
  }) -join '; '
  "$($m.Groups[1].Value) $refs"
}
$HadithRx = [regex]'(?<![\p{L}])(Buhari|Müslim|Ebu Davud|Tirmizi|İbn Mace|Nesai|Bukhari|Muslim|Abu Dawud|Tirmidhi|Ibn Majah|Nasa.i) (\d{1,5}[a-z]?)(?![\d\p{L}])'
$HadithBooks = @{ 'Buhari' = 'bukhari'; 'Müslim' = 'muslim'; 'Ebu Davud' = 'abudawud'; 'Tirmizi' = 'tirmidhi'; 'İbn Mace' = 'ibnmajah'; 'Nesai' = 'nasai'
  'Bukhari' = 'bukhari'; 'Muslim' = 'muslim'; 'Abu Dawud' = 'abudawud'; 'Tirmidhi' = 'tirmidhi'; 'Ibn Majah' = 'ibnmajah' }
$HadithEval = [System.Text.RegularExpressions.MatchEvaluator]{
  param($m)
  $book = if ($m.Groups[1].Value -like 'Nasa*') { 'nasai' } else { $HadithBooks[$m.Groups[1].Value] }
  "<a class=`"hdref`" href=`"https://sunnah.com/$($book):$($m.Groups[2].Value)`" target=`"_blank`" rel=`"noopener`">$($m.Value)</a>"
}
function Ic-Link([string]$s) { return $HadithRx.Replace($QuranRx.Replace($s, $QuranEval), $HadithEval) }
# One paragraph per line; "- " list items, "### " a subheading, "> text || source" a quotation
function Ic-Blocks([string]$s) {
  $sb = New-Object Text.StringBuilder; $list = New-Object Collections.ArrayList
  $flush = { if ($list.Count) { [void]$sb.Append('<ul>' + (($list | ForEach-Object { "<li>$(Ic-Link $_)</li>" }) -join '') + '</ul>'); $list.Clear() } }
  foreach ($line in ($s -split "`n")) {
    $l = $line.Trim(); if (-not $l) { continue }
    if ($l.StartsWith('- ')) { [void]$list.Add($l.Substring(2)); continue }
    . $flush
    if ($l.StartsWith('### ')) { [void]$sb.Append("<h4>$(Ic-Link $l.Substring(4))</h4>"); continue }
    if ($l.StartsWith('> ')) {
      $qs = $l.Substring(2) -split ' \|\| ', 2
      $cite = if ($qs.Count -gt 1) { "<cite>$(Ic-Link $qs[1])</cite>" } else { '' }
      [void]$sb.Append("<blockquote class=`"ic-quote`"><p>$($qs[0])</p>$cite</blockquote>"); continue
    }
    [void]$sb.Append("<p>$(Ic-Link $l)</p>")
  }
  . $flush
  return $sb.ToString()
}
$IcoArrowL = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>'
$IcoSections = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/></svg>'
# One case page of the Tartış section (İslam'a Cevap, Ateizme Cevap): the summary, the parts, the
# closing, the sources and the footnote, from one data file of the same shape

# Each part of a case page, and its closing, as an illustrated section: drawing and colour by part id
$CaseArt = @{
  'islama-cevap' = @{ kitap = @('scroll', 'blue'); peygamber = @('scales', 'gold'); tanri = @('cosmos', 'purple'); itirazlar = @('shield', 'red'); sonuc = @('door', 'green') }
  'ateizme-cevap' = @{ ring = @('scales', 'purple'); tanri = @('cosmos', 'blue'); isa = @('tomb', 'gold'); itirazlar = @('shield', 'red'); sonuc = @('door', 'green') }
}
function Case-Body($Ic, $Ico, [string]$Page) {
  $arts = $CaseArt[$Page]
  # Which part each section belongs to, for the small label on each summary card
  $icPartOf = @{}
  foreach ($pt in @($Ic.parts)) {
    # A part may name its label itself ("kicker"); otherwise the part title up to its colon
    $k = if ($pt.kicker) { @($pt.kicker, $pt.kickerEn) } else { @((($pt.title -split ':')[0]).Trim(), (($pt.titleEn -split ':')[0]).Trim()) }
    foreach ($sc in @($pt.sections)) { $icPartOf[$sc.id] = $k }
  }
  $icTotal = @($Ic.tldr).Count
  $icTldr = ($Ic.tldr | ForEach-Object -Begin { $i = 0 } -Process {
    $i++
    $pn = $icPartOf[$_.href]
    $kick = if ($pn) { "<span class=`"ic-tl-k`" aria-hidden=`"true`">$i / $icTotal · $(T $pn[0] $pn[1])</span>" } else { "<span class=`"ic-tl-k`" aria-hidden=`"true`">$i / $icTotal</span>" }
    "<li><a class=`"ic-tl`" href=`"#$($_.href)`">$kick<span class=`"ic-tl-n`">$i</span><span class=`"ic-tl-b`"><span class=`"ic-tl-t`">$(T $_.t $_.tEn)</span><span class=`"ic-tl-s`">$(T $_.text $_.textEn)<span class=`"ic-tl-more`">$(T 'Tümünü oku' 'Read all') $IcoArrowR</span></span></span></a></li>"
  }) -join ''
  $icRoman = @('I', 'II', 'III', 'IV', 'V', 'VI')
  # Every section, the closing too, in reading order: each ends with a way to the one before, the
  # one after and back to the start (on a phone, the page's list of parts)
  $icSeq = @(@($Ic.parts) | ForEach-Object { $_.sections }) + @($Ic.closing)
  function Ic-Nav($k) {
    $prev = if ($k -gt 0) { $p = $icSeq[$k - 1]; "<a class=`"ic-nav-prev`" href=`"#$($p.id)`" data-av-step><span class=`"ic-nav-l`">$IcoArrowL $(T 'Önceki bölüm' 'Previous section')</span><span class=`"ic-nav-t`">$(T $p.title $p.titleEn)</span></a>" } else { '<span></span>' }
    $next = if ($k -lt $icSeq.Count - 1) { $n = $icSeq[$k + 1]; "<a class=`"ic-nav-next`" href=`"#$($n.id)`" data-av-step><span class=`"ic-nav-l`">$(T 'Sonraki bölüm' 'Next section') $IcoArrowR</span><span class=`"ic-nav-t`">$(T $n.title $n.titleEn)</span></a>" } else { '<span></span>' }
    $c = $icSeq[$k]
    return "<nav class=`"ic-nav`" aria-label=`"$(Attr "$(Plain $c.title): bölümler arasında")`" data-en-aria-label=`"$(Attr "$(Plain $c.titleEn): between sections")`">$prev$next<a class=`"ic-nav-start`" href=`"#bas`" data-av-pop=`"bas`">$IcoSections $(T 'Bölümlere dön' 'Back to sections')</a></nav>"
  }
  $script:icN = 0
  $icParts = (@($Ic.parts) | ForEach-Object -Begin { $pi = 0 } -Process {
    $part = $_
    $secs = ($part.sections | ForEach-Object {
      $script:icN++
      "<section class=`"ic-sec`" id=`"$($_.id)`"><h3 class=`"ic-sec-t`"><span class=`"label`">$($script:icN)</span><span>$(T $_.title $_.titleEn)</span></h3>" +
        "<div class=`"prose`">$(TB (Ic-Blocks $_.body) (Ic-Blocks $_.bodyEn))</div>$(Ic-Nav ($script:icN - 1))</section>"
    }) -join "`n"
    $pi++
    $a = $arts[$part.id]; if (-not $a) { $a = @('candle', 'gold') }
    Ill-Sec -Id $part.id -HeadId "$($part.id)-h" -Art $a[0] -Tone $a[1] -Class 'ic-part' -Kick (T "$($icRoman[$pi - 1]). Bölüm" "Part $($icRoman[$pi - 1])") -Head (T $part.title $part.titleEn) -Body $secs
  }) -join "`n"
  $icSources = ($Ic.sources | ForEach-Object {
    $t = T $_[0] $_[2]
    if ($_[1]) { "<li><a href=`"$($_[1])`" target=`"_blank`" rel=`"noopener`">$t</a></li>" } else { "<li>$t</li>" }
  }) -join ''
  $icBody = @"
  <div class="wrap narrow ic-page ill-page">
    <header class="page-head center" id="bas">$(Page-Ico $Ico)<h1>$(T $Ic.title $Ic.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($Ic.en)</p>")</header>
    <p class="ic-lead">$(T $Ic.lead $Ic.leadEn)<a class="ic-fn-ref" href="#dipnot" aria-label="Dipnot" data-en-aria-label="Footnote">*</a></p>
    <section class="ic-tldr" id="kisaca" aria-labelledby="kisaca-h">
      <h2 class="section-title" id="kisaca-h">$(T $Ic.tldrTitle $Ic.tldrTitleEn)</h2>
      <ol class="ic-tl-list ic-tl-v">$icTldr</ol>
    </section>
  $icParts
$(Ill-Sec -Id $Ic.closing.id -HeadId "$($Ic.closing.id)-h" -Art $arts['sonuc'][0] -Tone $arts['sonuc'][1] -Class 'ic-closing' -Kick (T 'Sonuç' 'In the end') -Head (T $Ic.closing.title $Ic.closing.titleEn) -Body ("<div class=`"prose`">$(TB ((Ic-Blocks $Ic.closing.body) -replace '<h4>', '<h3 class="ic-sub">' -replace '</h4>', '</h3>') ((Ic-Blocks $Ic.closing.bodyEn) -replace '<h4>', '<h3 class="ic-sub">' -replace '</h4>', '</h3>'))</div>" + (Ic-Nav ($icSeq.Count - 1))))
    <section class="ic-sources" aria-labelledby="ic-kaynak-h"><h2 class="section-title" id="ic-kaynak-h">$(T 'Kaynaklar' 'Sources')</h2><ul>$icSources</ul></section>
    <aside class="ic-footnote" id="dipnot" aria-label="Dipnot" data-en-aria-label="Footnote"><p><span class="ic-fn-mark" aria-hidden="true">*</span>$(T (Ic-Link $Ic.note) (Ic-Link $Ic.noteEn))</p></aside>
  </div>
"@
  return $icBody
}
$icBody = Case-Body $Ic $IcoAnswer 'islama-cevap'
$icLd = '{"@context":"https://schema.org","@type":"Article","headline":' + (JStr (Plain $Ic.title)) + ',"inLanguage":"tr","author":{"@type":"Organization","name":' + (JStr $SiteName) + '},"mainEntityOfPage":' + (JStr "$SiteUrl/islama-cevap.html") + '}'
Write-Page -File 'islama-cevap.html' -Title "$(Plain $Ic.title): Kur'an ve Hadislerle | $SiteName" -TitleEn "$($Ic.en): From the Qur$($Apos)an and the Hadith | $SiteName" `
  -Description (Meta-Trim "İslam'ın iddiaları kendi kaynaklarıyla sınanıyor: İslam ikilemi, Kur'an'ın korunmuşluğu, Muhammed'in karakteri, Kâbe'nin putu Hübel. Kısa özet ve tam tartışma.") -DescriptionEn "Islam's claims tested by its own sources: the Islamic dilemma, the preservation of the Qur'an, the character of Muhammad, and Hubal, the idol of the Kaaba." `
  -Path 'islama-cevap.html' -Body $icBody -JsonLd @($icLd, (Breadcrumb-Ld "İslam$($Apos)a Cevap" 'islama-cevap.html'))

# ================================================================== ATEIZME CEVAP (ateizme-cevap.html)
# The Tartış section's second page, built like İslam'a Cevap from data/ateizme-cevap.js: God's
# existence argued from reason and evidence, then the testimony of miracles and converts, then the
# objections (evil, hiddenness, many religions, science).
$Ac = Read-Data 'ateizme-cevap.js'
$acBody = Case-Body $Ac $IcoCosmos 'ateizme-cevap'
$acLd = '{"@context":"https://schema.org","@type":"Article","headline":' + (JStr (Plain $Ac.title)) + ',"inLanguage":"tr","author":{"@type":"Organization","name":' + (JStr $SiteName) + '},"mainEntityOfPage":' + (JStr "$SiteUrl/ateizme-cevap.html") + '}'
Write-Page -File 'ateizme-cevap.html' -Title "$(Plain $Ac.title): Akıl ve Kanıtla | $SiteName" -TitleEn "$($Ac.en): Reason and Evidence | $SiteName" `
  -Description (Meta-Trim "Tanrı var mı? Ateizm ve agnostisizm akıl ve kanıtla sınanıyor: evrenin varlığı, ince ayar, bilinç, ahlak, İsa’nın dirilişi, mucizeler ve kötülük sorunu.") -DescriptionEn "Does God exist? Atheism and agnosticism tested by reason and evidence: the universe, fine-tuning, consciousness, the resurrection of Jesus, miracles and evil." `
  -Path 'ateizme-cevap.html' -Body $acBody -JsonLd @($acLd, (Breadcrumb-Ld 'Ateizme Cevap' 'ateizme-cevap.html'))

# ================================================================== NEDEN KATOLIGIZ (neden-katoligiz.html + en/why-were-catholic.html)
# A short case in three parts, read in one calm column. Two "doors" at the top send a skeptic to
# the start and a Christian straight to the Church. Each part lists its topics as one-line hooks;
# each hook is a <details> that opens to the skeptic's question, a one-line answer, the key points,
# and an "Ama..." line that opens the objection's reply. On a phone each hook is a row that opens
# the whole topic as its own screen (script.js, AV_PAGES).
function Why-Page([string]$lang) {
  $W = $WhyCatholic
  # every text in both languages: a field and its ...En twin
  function F2($o, [string]$k) { T (Inline $o.$k) (Inline $o.($k + 'En')) }
  $L = @{ doors = @('Nereden başlamak istersiniz?', 'Where would you like to start?'); but = @('Ama', 'Objection'); q = @('Soru', 'The question')
          together = @('Hepsi bir arada', 'Putting it together'); where = @('Buradan nereye?', 'Where to go from here') }
  function LL([string]$k) { T $L[$k][0] $L[$k][1] }
  $parts = @($W.parts); $n = $parts.Count
  $doors = @(
    @($parts[0].id, "Tanrı$($Apos)ya inanmakta zorlanıyorum", 'Baştan başlayın: Tanrı var mı?', 'I find it hard to believe in God', 'Start at the beginning: is there a God?'),
    @($parts[1].id, "Tanrı$($Apos)ya inanıyorum, ama dinlere güvenemiyorum", 'İsa kim? bölümüne geçin', 'I believe in God, but I struggle with religion', 'Go to: Who is Jesus?'),
    @($parts[$n - 1].id, 'Hristiyanım, ama neden Katolik?', 'Doğrudan Kilise bölümüne geçin', "I$($Apos)m a Christian, but why Catholic?", 'Go straight to the Church')
  )
  $doorsHtml = ($doors | ForEach-Object { "<a class=`"why-door`" href=`"#$($_[0])`"><span class=`"why-door-t`">$(T $_[1] $_[3])</span><span class=`"why-door-s`">$(T $_[2] $_[4])</span>$IcoArrowR</a>" }) -join ''
  $panels = (0..($n - 1) | ForEach-Object {
    $k = $_; $pt = $parts[$k]
    $aside = ''
    if ($k -eq 0) {
      $aside = '<p class="why-aside">' + (T 'Ateist ya da agnostikseniz: <a href="ateizme-cevap.html">Ateizme Cevap</a>' 'If you are an atheist or an agnostic: <a href="ateizme-cevap.html">Answering Atheism</a>') + '</p>'
    }
    if ($k -eq 1) {
      $trA = 'Müslüman bir arka plandan geliyorsanız: <a href="islama-cevap.html">İslam' + $Apos + 'a Cevap</a>'
      $enA = 'If you come from a Muslim background: <a href="islama-cevap.html">Answering Islam</a>'
      $aside = '<p class="why-aside">' + (T $trA $enA) + '</p>'
    }
    $items = ($pt.topics | ForEach-Object {
      $tp = $_
      $pts = (@($tp.points) | ForEach-Object { "<li>$(Inline $_)</li>" }) -join ''
      $ptsEn = (@($tp.pointsEn) | ForEach-Object { "<li>$(Inline $_)</li>" }) -join ''
      "<details class=`"why-item`" id=`"$($tp.id)`">" +
        "<summary><span class=`"why-hook-k`">$(T (Inline $tp.title) (Inline $tp.en))</span><span class=`"why-hook`">$(F2 $tp 'hook')</span>$IcoChevLg</summary>" +
        "<div class=`"why-body`">" +
          "<p class=`"why-q`"><span class=`"why-q-label`">$(LL 'q')</span>$(F2 $tp 'q')</p>" +
          "<p class=`"why-lede`">$(F2 $tp 'lede')</p>" +
          (TB "<ul class=`"why-points`">$pts</ul>" "<ul class=`"why-points`">$ptsEn</ul>") +
          "<details class=`"why-obj`"><summary><span class=`"why-obj-label`">$(LL 'but')</span><span class=`"why-obj-q`">$(F2 $tp 'objection')</span>$IcoChev</summary><p>$(F2 $tp 'reply')</p></details>" +
        "</div>" +
      "</details>"
    }) -join "`n"
    $art = @('cosmos', 'tomb', 'basilica')[[math]::Min($k, 2)]; $tone = @('blue', 'gold', 'red')[[math]::Min($k, 2)]
    Ill-Sec -Id $pt.id -HeadId "h-$($pt.id)" -Art $art -Tone $tone -Class 'why-part' -Kick (T "Bölüm $($k + 1) / $n" "Part $($k + 1) of $n") `
      -Head (T (Inline $pt.title) (Inline $pt.en)) -Body ("<p class=`"why-thesis`">$(F2 $pt 'thesis')</p><div class=`"why-list`">$items</div>" + $aside)
  }) -join "`n"
  $chain = (@($W.chain) | ForEach-Object -Begin { $i2 = 0 } -Process { $i2++; "<li><span class=`"why-chain-n`">$i2</span>$(T (Inline $_) (Inline @($W.chainEn)[$i2 - 1]))</li>" }) -join ''
  $ctaItems = @(@('katolik-sureci.html', 'Katolik Olma Süreci', 'Yol adım adım nasıl ilerler', 'Becoming Catholic', 'What the path looks like, step by step'),
    @('sss.html', 'Sık Sorulan Sorular', 'Sık sorulan diğer sorulara cevaplar', 'Frequently Asked Questions', 'More answers to common questions'),
    @('kiliseler.html', 'Kilise Bul', "Türkiye$($Apos)deki Katolik kiliseleri", 'Find a Church', 'Catholic parishes across Turkey'),
    @('iletisim.html', 'İletişim', 'Sorularınızı bize yazın', 'Contact', 'Write to us with your questions'))
  $cta = ($ctaItems | ForEach-Object { "<a class=`"why-cta`" href=`"$($_[0])`"><span class=`"why-cta-t`">$(T $_[1] $_[3])</span><span class=`"why-cta-s`">$(T $_[2] $_[4])</span>$IcoArrowR</a>" }) -join ''
  $crumb = Crumbs 'Neden Katoliğiz?'
  $body = @"
<div class="wrap why-wrap ill-page" data-av-nogh>
  $crumb
  <header class="page-head center">$(Page-Ico $IcoCompass)<h1>$(T $W.title $W.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($W.en)</p>")</header>
  <p class="why-intro">$(F2 $W 'intro')</p>
  <nav class="why-doors" $(TA 'aria-label' $L.doors[0] $L.doors[1])>$doorsHtml</nav>
$panels
$(Ill-Sec -Id 'sonuc' -HeadId 'h-sonuc' -Art 'door' -Tone 'green' -Class 'why-end' -Kick (T 'Sonuç' 'In the end') -Head (LL 'together') `
    -Body "<ol class=`"why-chain`">$chain</ol><p class=`"why-closing`">$(F2 $W 'closing')</p><h3 class=`"why-where`">$(LL 'where')</h3><div class=`"why-ctas`">$cta</div>")
</div>
"@
  $page = 'neden-katoligiz.html'
  Write-Page -File $page -Title "$($W.title) | $SiteName" -TitleEn "$($W.en) | $SiteName" `
    -Description "Katolik inancının akla ve kalbe hitap eden kısa özeti: Tanrı var mı, İsa kim ve neden Katolik Kilise?" -DescriptionEn "A short case for the Catholic faith for mind and heart: does God exist, who is Jesus, and why the Catholic Church?" `
    -Path $page -Body $body -JsonLd @((Breadcrumb-Ld 'Neden Katoliğiz?' $page))
}
Why-Page 'tr'

# ================================================================== AZIZLER (azizler.html)
function Rank-Class([string]$rank) {
  if (-not $rank) { return 'rk-other' }
  if ($rank -match 'En Büyük Bayram') { return 'rk-hi' }
  if ($rank -match 'Büyük Bayram') { return 'rk-solemn' }
  if ($rank -match '^Bayram$') { return 'rk-feast' }
  if ($rank -match 'İhtiyari') { return 'rk-optional' }
  if ($rank -match 'Anma') { return 'rk-memorial' }
  return 'rk-other'
}
# The calendar's saints (and Marian feasts) who have a page of their own here: their card leads to
# it. Every other saint's card ends in a Google search for the name.
$SaintPageRe = [ordered]@{
  'meryem-ana'             = "Meryem Ana(?!.*Bazilika)"
  'aziz-yusuf'             = "^(İşçi )?Yusuf$"
  'havari-petrus'          = "Petrus.un Kürsüsü|^Havariler Petrus ve Pavlus$"
  'havari-pavlus'          = "Pavlus.un İmana Dönüşü|^Havariler Petrus ve Pavlus$"
  'vaftizci-yahya'         = "^Vaftizci Yahya"
  'havari-yuhanna'         = "^Havari ve İncil Yazarı Ioannes|Latin Kapısı Önündeki Aziz Yuhanna"
  'aziz-augustinus'        = "^Augustinus of Hippo"
  'aziz-thomas-aquinas'    = "^Thomas Aquinas"
  'assisili-aziz-francis'  = "^Franciscus of Assisi"
  'sienali-aziz-catharina' = "^Catharina of Siena"
  'avilali-aziz-teresa'    = "^Teresia of Ávila"
  'lisieuxlu-kucuk-teresa' = "Lisieux"
  'aziz-ignatius-loyola'   = "^Ignatius of Loyola"
  'aziz-benedictus'        = "^Benedictus$"
  'aziz-patrick'           = "^Patricius$"
  'padovali-aziz-antonius' = "^Antonius of Padua"
  'kalkutali-aziz-teresa'  = "^Teresa of Calcutta"
  'aziz-ii-yuhanna-pavlus' = "^Ioannes Paulus II"
  'padre-pio'              = "Padre Pio"
  'aziz-hieronymus'        = "^Hieronymus$"
}
function Saint-Links($s) {
  $pages = @($SaintPageRe.Keys | Where-Object { $s.name -cmatch $SaintPageRe[$_] })
  if ($pages.Count) {
    # one page: "Devamını oku"; two (Petrus and Pavlus): each by its name
    return '<p class="s-links">' + (($pages | ForEach-Object {
      $id = $_
      $gs = $GreatSaints.saints | Where-Object { $_.id -eq $id } | Select-Object -First 1
      $label = if ($pages.Count -gt 1) { T $gs.name $gs.en } else { (T 'Devamını oku' 'Read more') + '<span class="visually-hidden">: ' + (T $gs.name $gs.en) + '</span>' }
      "<a class=`"s-page`" href=`"$id.html`">$label$IcoNext</a>"
    }) -join '') + '</p>'
  }
  # a search for the name, in the language shown
  $plain = ($s.name -replace '<[^>]+>', '')
  $q = if ($plain -match '(^|\s)(Aziz|Havari|Havariler|Meryem|Vaftizci|Bazilika)') { $plain } else { "Aziz $plain" }
  $plainEn = if ($s.nameEn) { ($s.nameEn -replace '<[^>]+>', '') } else { $plain }
  $qEn = if ($plainEn -match '(^|\s)(Saint|St\.|Apostle|Mary|Our Lady|Blessed|Basilica)') { $plainEn } else { "Saint $plainEn" }
  return "<p class=`"s-links`">" + (T "<a class=`"s-google`" href=`"https://www.google.com/search?q=$([uri]::EscapeDataString($q))`" target=`"_blank`" rel=`"noopener nofollow`">Google$($Apos)da ara</a>" "<a class=`"s-google`" href=`"https://www.google.com/search?q=$([uri]::EscapeDataString($qEn))`" target=`"_blank`" rel=`"noopener nofollow`">Search on Google</a>") + "</p>"
}
$RankEn = @{ 'En Büyük Bayram' = 'Principal Solemnity'; 'Büyük Bayram' = 'Solemnity'; 'Bayram' = 'Feast'; 'Anma Günü' = 'Memorial'; 'Anma' = 'Memorial'
  'İhtiyari Anma Günü' = 'Optional Memorial'; 'Roma Azizler Cetveli' = 'Roman Martyrology'; 'Ortaçağ Batı Geleneği' = 'Medieval Western Tradition' }
function Saint-Item($s) {
  $titlePart = if ($s.title) { "<span class=`"s-title`">$(T (Inline $s.title) (Inline $s.titleEn))</span>" } else { '' }
  return "<details class=`"saint-item`"><summary><span class=`"s-name`">$(T (Inline $s.name) (Inline $s.nameEn))</span>$titlePart$IcoChev</summary><div class=`"saint-bio`">$(TB (Blocks $s.bio) (Blocks $s.bioEn))$(Saint-Links $s)</div></details>"
}
$monthSectionsHtml = (1..12 | ForEach-Object {
  $mo = $_
  $monthDays = @($Saints.days | Where-Object { $_.m -eq $mo }) | Sort-Object d
  $cells = ($monthDays | ForEach-Object {
    $day = $_
    if ($day.genel) {
      "<div class=`"day-cell genel`" data-m=`"$mo`" data-d=`"$($day.d)`"><span class=`"day-num`">$($day.d)</span><details class=`"saint-item genel-item`"><summary><span class=`"s-name`">$(T (Inline $Saints.genelTitle) (Inline $Saints.genelTitleEn))</span>$IcoChev</summary><div class=`"saint-bio`">$(TB (Blocks $Saints.genelBio) (Blocks $Saints.genelBioEn))</div></details></div>"
    } else {
      $rc = Rank-Class $day.rank
      $saintsHtml = (($day.saints | ForEach-Object { Saint-Item $_ }) -join '')
      "<div class=`"day-cell $rc`" data-m=`"$mo`" data-d=`"$($day.d)`"><span class=`"day-num`">$($day.d)</span><span class=`"day-rank label`">$(T $day.rank $RankEn[$day.rank])</span><div class=`"day-saints`">$saintsHtml</div></div>"
    }
  }) -join "`n"
  "<section class=`"month`" id=`"ay-$mo`" data-month=`"$mo`"><h2 class=`"month-title`">$(T $MonthNamesTr[$mo - 1] $MonthNamesEn[$mo - 1])</h2><div class=`"day-grid`">$cells</div></section>"
}) -join "`n"
$monthPillsHtml = (1..12 | ForEach-Object { "<a href=`"#ay-$_`" data-month-link=`"$_`">$(T $MonthNamesTr[$_ - 1].Substring(0, 3) $MonthNamesEn[$_ - 1].Substring(0, 3))</a>" }) -join ''
# The feasts that move with Easter: script.js dates them for the year shown and puts each on its
# day in the calendar; the cards themselves stay hidden, as that script's source
$movableCardsHtml = ($Saints.movable | ForEach-Object {
  "<article class=`"movable-card`" data-movable=`"$($_.id)`" data-offset=`"$($_.offset)`" data-rk=`"$(Rank-Class $_.rank)`"><h3>$(T (Inline $_.title) (Inline $_.titleEn))</h3><p class=`"m-rank label`">$(T $_.rank $_.rankEn)<span class=`"m-date`" data-movable-date></span></p><div class=`"m-bio`">$(TB (Blocks $_.bio) (Blocks $_.bioEn))</div></article>"
}) -join "`n"
# The twenty best-known saints: one compact list, folded into a dropdown
# Each saint's page opens with a drawing of the saint's traditional emblem, named under it
$SaintEmblems = @{
  'meryem-ana'             = @('stars12', 'blue', 'On iki yıldızlı taç', 'The crown of twelve stars')
  'aziz-yusuf'             = @('tools', 'gold', 'Marangoz gönyesi ve çekici', "The carpenter's square and hammer")
  'havari-petrus'          = @('keys', 'gold', 'Cennetin anahtarları', 'The keys of the kingdom')
  'havari-pavlus'          = @('sword', 'red', 'Kılıç', 'The sword')
  'vaftizci-yahya'         = @('shell', 'blue', 'Vaftiz kabuğu', 'The baptismal shell')
  'havari-yuhanna'         = @('eagle', 'purple', 'Kartal', 'The eagle')
  'aziz-augustinus'        = @('heart', 'red', 'Alevli ve oklu yürek', 'The flaming, pierced heart')
  'aziz-thomas-aquinas'    = @('sun', 'gold', 'Göğsündeki güneş', 'The sun on his breast')
  'assisili-aziz-francis'  = @('tau', 'green', 'Tau haçı', 'The tau cross')
  'sienali-aziz-catharina' = @('thorns', 'red', 'Dikenli taç', 'The crown of thorns')
  'avilali-aziz-teresa'    = @('book', 'purple', 'Kitap ve kalem', 'The book and quill')
  'lisieuxlu-kucuk-teresa' = @('rose', 'red', 'Gül', 'The rose')
  'aziz-ignatius-loyola'   = @('ihs', 'gold', 'IHS mührü', 'The IHS seal')
  'aziz-benedictus'        = @('cupsnake', 'purple', 'Yılanlı kadeh', 'The cup with the serpent')
  'aziz-patrick'           = @('shamrock', 'green', 'Yonca', 'The shamrock')
  'padovali-aziz-antonius' = @('lily', 'gold', 'Zambak', 'The lily')
  'kalkutali-aziz-teresa'  = @('beads', 'blue', 'Tesbih', 'The rosary')
  'aziz-ii-yuhanna-pavlus' = @('arms', 'blue', 'Totus Tuus arması', 'The Totus Tuus coat of arms')
  'padre-pio'              = @('hand', 'red', 'Kutsal yaralar', 'The stigmata')
  'aziz-hieronymus'        = @('lion', 'gold', 'Aslan', 'The lion')
}
function Saint-Emblem([string]$id) {
  $e = $SaintEmblems[$id]
  if (-not $e) { return '' }
  "<div class=`"emblem ill-card tone-$($e[1])`">$(Ill-Art $e[0])<p class=`"emblem-cap`">$(T "Simgesi: $($e[2])" "Emblem: $($e[3])")</p></div>"
}
# the twenty on Azizler: a round portrait of each, ringed like a story not yet seen until the
# saint's page has been read (script.js, initSaintStories); the pictures' credits are on
# kaynaklar-ve-telif.html (data/aziz-portreleri.json)
$SaintPortraits = Get-Content -Raw -Encoding UTF8 (Join-Path $Root 'data/aziz-portreleri.json') | ConvertFrom-Json
$greatSaintsCardsHtml = ($GreatSaints.saints | ForEach-Object {
  "<a class=`"gs-st`" href=`"$($_.id).html`" data-gs=`"$($_.id)`"><span class=`"gs-ring`"><img src=`"assets/art/saints/$($_.id).jpg`" alt=`"`" width=`"256`" height=`"256`" loading=`"lazy`" decoding=`"async`"></span><span class=`"gs-n`">$(T (Inline $_.name) $_.en)</span><span class=`"gs-s`">$(T (Inline $_.epithet) (Inline $_.epithetEn))</span></a>"
}) -join ''
$azizlerBody = @"
<div class="wrap narrow">
  $(Crumbs 'Azizler')
  <header class="page-head center">$(Page-Ico $IcoStar)<h1>$(T (Inline $Saints.title) $Saints.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($Saints.en)</p>")</header>
  <p class="faq-intro">$(T (Inline $Saints.intro) (Inline $Saints.introEn))</p>
  <section class="today-saint glass" id="bugun-azizi" data-today>
    <p class="label">$(T 'Bugün' 'Today') <span data-today-date>...</span></p>
    <div class="today-body" data-today-body><p class="hint">$(T "Bugünün azizini görmek için JavaScript$($Apos)i etkinleştirin." "Enable JavaScript to see today's saint.")</p></div>
  </section>
  <nav class="month-pills" id="takvim" $(TA 'aria-label' 'Aylar' 'Months') data-month-pills>$monthPillsHtml</nav>
  <div class="saints-cal" data-saints-cal>
$monthSectionsHtml
  </div>
  <h2 class="section-title" id="buyuk-azizler">$(T (Inline $GreatSaints.title) (Inline $GreatSaints.en))</h2>
  <p class="faq-intro">$(T (Inline $GreatSaints.intro) (Inline $GreatSaints.introEn))</p>
  <div class="gs-stories">$greatSaintsCardsHtml</div>
  <p class="gs-credit">Portreler kamu malı tablolardan ve fotoğraflardan alınmıştır; künyeleri <a href="kaynaklar-ve-telif.html#aziz-portreleri">Kaynaklar ve Telif</a> sayfasındadır.</p>
  <div class="movable-list" data-movable-list hidden>
$movableCardsHtml
  </div>
  $(TB "<p class=`"conventions`">Tarihler ve ayin dereceleri Roma Genel Takvimi$($Apos)ne göredir. Hareketli bayramlar, Meeus/Jones/Butcher algoritmasıyla hesaplanan Paskalya tarihine göre yerleştirilir. Roma Genel Takvimi$($Apos)nde boş kalan günler için Roma Azizler Cetveli$($Apos)nden (Martyrologium Romanum) ya da Batı$($Apos)nın eski takvim geleneğinden bir aziz seçtik. Bu azizlerin rütbesi <em>Roma Azizler Cetveli</em> olarak gösterilir. Kilise bu anmaları o gün için zorunlu tutmaz; bunlar sitenin sunduğu ek bilgilerdir. Aziz hayat öyküleri bu site için Türkçe olarak yazıldı ve yazarın kendi bilgisine dayanır. Özellikle az bilinen azizlerde tarih ya da ayrıntı hataları olabilir. Güvenilir bir kaynağa dayandırılamayan birkaç gün için Kilise$($Apos)nin genel bir açıklaması kullanıldı.</p>" "<p class=`"conventions`">Dates and liturgical ranks follow the General Roman Calendar; the year's movable feasts are set according to the date of Easter, calculated with the Meeus/Jones/Butcher algorithm. For dates the General Roman Calendar leaves open, a saint ranked <em>Roman Martyrology</em> has been chosen from the Roman Martyrology (Martyrologium Romanum) or the West's historical calendar tradition; this means it is not a commemoration the Church requires for that day, but additional information the site offers. The saint biographies were written for this site, from the author's own knowledge; small errors of date or detail are possible, especially for lesser-known saints. For a very small number of days that could not be grounded in any reliable source, the Church's own general description is used instead.</p>")
</div>
<div class="hover-panel glass" id="saint-panel" role="tooltip" hidden></div>
"@
Write-Page -File 'azizler.html' -Title "$($Saints.title) | $SiteName" -TitleEn "$($Saints.en) | $SiteName" `
  -Description "Katolik ayin takviminin azizleri: bugünün azizini Türkiye saatiyle görün, yılın her günü için Türkçe aziz hayat hikayelerini keşfedin." -DescriptionEn "Saints of the Catholic calendar: today's saint, and the life of a saint for every day of the year, in Turkish and English." `
  -Path 'azizler.html' -Body $azizlerBody -JsonLd @((Breadcrumb-Ld 'Azizler' 'azizler.html'))

# ------------------------------------------------------------------ one page per great saint
$GreatSaints.saints | ForEach-Object {
  $s = $_
  $saintBody = @"
<div class="wrap narrow">
  $(Crumbs $s.name 'Azizler' 'azizler.html')
  <article class="article" id="article">
    <header class="page-head center saint-head" data-saint-page="$($s.id)">$(Page-Ico $IcoStar)$(Saint-Emblem $s.id)<p class="label">$(T "$(Inline $s.epithet) · $($s.era)" "$(Inline $s.epithetEn) · $(if ($s.eraEn) { $s.eraEn } else { $s.era })")</p><h1>$(T (Inline $s.name) $s.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($s.en)</p>")</header>
    <div class="body prose">$(TB (Convert-Markdown $s.body) (Convert-Markdown $s.bodyEn))</div>
  </article>
</div>
"@
  $saintLd = '{"@context":"https://schema.org","@type":"Article","headline":' + (JStr $s.name) + ',"inLanguage":"tr","author":{"@type":"Organization","name":' + (JStr $SiteName) + '},"mainEntityOfPage":' + (JStr "$SiteUrl/$($s.id).html") + '}'
  Write-Page -File "$($s.id).html" -Title "$($s.name) | $SiteName" -TitleEn "$($s.en) | $SiteName" `
    -Description (Meta-Trim (Plain $s.summary)) -DescriptionEn (Plain $s.summaryEn) -Path "$($s.id).html" -Body $saintBody `
    -JsonLd @($saintLd, (Breadcrumb-Ld $s.name "$($s.id).html" 'Azizler' 'azizler.html')) -OgType 'article'
}

# ================================================================== KUTSAL AYIN (kutsal-ayin.html)
function Mass-Lines($lines, [string]$lang) {
  $roleLabels = if ($lang -eq 'en') { $Mass.roleLabelsEn } else { $Mass.roleLabels }
  $sb = New-Object Text.StringBuilder
  foreach ($ln in $lines) {
    $txt = if ($lang -eq 'en') { $ln.en } else { $ln.tr }
    switch ($ln.role) {
      'N'  { [void]$sb.Append("<p class=`"mass-note`"><em>$(Inline $txt)</em></p>") }
      'PC' { [void]$sb.Append("<p class=`"mass-line mass-pc`"><span class=`"mass-role label`">$($roleLabels.PC)</span>$(Inline $txt)</p>") }
      'P'  { [void]$sb.Append("<p class=`"mass-line mass-p`"><span class=`"mass-role label`">$($roleLabels.P)</span>$(Inline $txt)</p>") }
      'C'  { [void]$sb.Append("<p class=`"mass-line mass-c`"><span class=`"mass-role label`">$($roleLabels.C)</span>$(Inline $txt)</p>") }
    }
  }
  return $sb.ToString()
}
$massPillsHtml = ($Mass.parts | ForEach-Object {
  "<a href=`"#$($_.id)`" data-part-link=`"$($_.n)`" $(TA 'data-tooltip' $_.title $_.en) $(TA 'title' $_.title $_.en)>$($MassIcons[$_.icon])<span class=`"visually-hidden`">$(T $_.title $_.en)</span></a>"
}) -join ''
$massPartsHtml = ($Mass.parts | ForEach-Object {
  $p = $_
  $icon = $MassIcons[$p.icon]
  $trHtml = Mass-Lines $p.lines 'tr'
  $enHtml = Mass-Lines $p.lines 'en'
  $ma = @{ 'gather' = @('bell', 'gold'); 'book' = @('lectern', 'blue'); 'gifts' = @('gifts', 'green'); 'chalice' = @('chalice', 'red'); 'host' = @('monstrance', 'gold'); 'blessing' = @('cross', 'purple') }[$p.icon]
  if (-not $ma) { $ma = @('candle', 'gold') }
  # the part's short explanation is always on screen; its words (priest and people) fold away beneath it
  $words = "<details class=`"kk-sec mass-text`"><summary><h3>$(T 'Ayinin sözleri' 'The words of the Mass')</h3>$IcoChevLg</summary>" +
    "<div class=`"kk-sec-body`"><div class=`"mass-dialogue`" data-tr>$(TB $trHtml $enHtml)</div></div></details>"
  (Ill-Sec -Id $p.id -Art $ma[0] -Tone $ma[1] -Class 'mass-sec' -Kick (T "Bölüm $($p.n)" "Part $($p.n)") -Head (T (Inline $p.title) $p.en) `
    -Sub (TO "<p class=`"faq-cat-en`" lang=`"en`">$($p.en)</p>") `
    -Body ("<p class=`"mass-lead`">$(T (Inline $p.lead) (Inline $p.leadEn))</p>" + $words)) -replace '^<section ', "<section data-part=`"$($p.n)`" "
}) -join "`n"
$massBody = @"
<div class="wrap narrow ill-page">
  $(Crumbs 'Kutsal Ayin')
  <header class="page-head center">$(Page-Ico $IcoChalice)<h1>$(T $Mass.title $Mass.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($Mass.en)</p>")</header>
  <p class="faq-intro">$(T (Inline $Mass.intro) (Inline $Mass.introEn))</p>
  <p class="mass-video-note">$IcoPlay $(T 'Ayinin akışını izleyerek takip etmek isterseniz <a href="https://www.youtube.com/watch?v=RS8NrJ0Y5O8" target="_blank" rel="noopener">bu İngilizce video</a> yardımcı olabilir.' 'If you would like to follow the flow of the Mass by watching it, you may find <a href="https://www.youtube.com/watch?v=RS8NrJ0Y5O8" target="_blank" rel="noopener">this video</a> helpful.')</p>
  <nav class="mass-pills" $(TA 'aria-label' 'Ayinin bölümleri' 'The parts of the Mass') data-mass-pills>$massPillsHtml</nav>
  <div class="mass-parts" data-mass-parts>
$massPartsHtml
  </div>
</div>
"@
Write-Page -File 'kutsal-ayin.html' -Title "$($Mass.title) | $SiteName" -TitleEn "$($Mass.en) | $SiteName" `
  -Description "Kutsal Ayin$($Apos)in sırası: cemaatin toplanmasından son takdise, Kutsal Kitabın okunmasından Efkaristiya$($Apos)nın kutsanmasına dek altı bölüm, Türkçe ve İngilizce." -DescriptionEn "The order of the Catholic Mass, from the gathering of the people to the final blessing: its six parts in Turkish and English, explained step by step." `
  -Path 'kutsal-ayin.html' -Body $massBody -JsonLd @((Breadcrumb-Ld 'Kutsal Ayin' 'kutsal-ayin.html'))

# ================================================================== ISA'NIN MESELLERI (meseller.html)
$Parables = Read-Data 'meseller.js'
$ParableIcons = @{
  sprout = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V11.5"/><path d="M12 11.5C12 7 8.4 5.8 5 5.8 5 10.4 7.8 11.5 12 11.5z"/><path d="M12 11.5c0-3.6 2.7-4.6 5.5-4.6 0 3.6-1.9 4.6-5.5 4.6z"/></svg>'
  heart  = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.3s-7.3-4.5-9.6-9.1C.9 7.6 2.6 4.5 5.8 4c2-.3 3.9.8 6.2 3.2C14.3 4.8 16.2 3.7 18.2 4c3.2.5 4.9 3.6 3.4 7.2-2.3 4.6-9.6 9.1-9.6 9.1z"/></svg>'
  prayer = $IcoPrayers
  lamp   = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c2 2.4 3.1 4.4 3.1 6.3a3.1 3.1 0 1 1-6.2 0C8.9 7.4 10 5.4 12 3z"/><path d="M8.2 18.6h7.6M9.6 15.6h4.8"/></svg>'
  coins  = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6.3" rx="7" ry="2.6"/><path d="M5 6.3v5c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-5"/><path d="M5 11.3v5c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-5"/></svg>'
  door   = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V9a6 6 0 0 1 12 0v12"/><path d="M4 21h16"/><circle cx="14.3" cy="14" r=".9" fill="currentColor" stroke="none"/></svg>'
}
# The English of a parable is the Douay-Rheims text: its source line names the passage and the
# translation, and links to that passage in the same translation on BibleGateway (DRA)
function Dr-Source([string]$ref) {
  $r = ($ref -replace '\s*\(Douay-Rheims\)\s*$', '').Trim()
  $link = $r
  $m = [regex]::Match($r, '^(?:(?<n>[1-3])\s)?(?<b>[A-Za-z]+)\s(?<c>\d+):(?<v>[\d–\-, ]+)$')
  if ($m.Success) {
    $book = $m.Groups['b'].Value; if ($m.Groups['n'].Success) { $book = "$($m.Groups['n'].Value) $book" }
    $q = "$book $($m.Groups['c'].Value):$(($m.Groups['v'].Value -replace '–', '-') -replace '\s', '')"
    $link = "<a class=`"bref`" href=`"https://www.biblegateway.com/passage/?search=$([uri]::EscapeDataString($q))&amp;version=DRA`" target=`"_blank`" rel=`"noopener`">$r</a>"
  }
  return "<p class=`"p-en-src`">$link <span class=`"p-en-tr`">· Douay-Rheims Bible</span></p>"
}
$script:MeselN = 0
$meselToc = ($Parables.categories | ForEach-Object { "<li><a href=`"#$($_.id)`">$(T (Inline $_.title) $_.en)</a></li>" }) -join ''
$meselCats = ($Parables.categories | ForEach-Object {
  $script:MeselN++; $cat = $_
  $icon = $ParableIcons[$cat.icon]
  $items = ($cat.items | ForEach-Object {
    # in English: the retelling, then the passage itself in the Douay-Rheims
    $bioEn = (Blocks $_.bioEn) + '<div class="p-en">' + (Dr-Source $_.en.ref) + (Verse $_.en.text) + '</div>'
    "<details class=`"mira-item`" id=`"$($_.id)`"><summary><span class=`"mira-ico`">$icon</span><span class=`"mira-head`"><span class=`"mira-name`">$(T (Inline $_.name) (Inline $_.nameEn))</span><span class=`"mira-place label`">$(T $_.ref $_.refEn)</span></span>$IcoChevLg</summary><div class=`"mira-bio`">$(TB (Blocks $_.bio) $bioEn)</div></details>"
  }) -join "`n"
  $ma = @{ 'hukumdarlik' = @('wheat', 'gold'); 'merhamet' = @('sheep', 'green'); 'dua' = @('knock', 'purple'); 'uyaniklik' = @('oillamp', 'blue'); 'sorumluluk' = @('grapes', 'red'); 'cagri' = @('feast', 'gold') }[$cat.id]
  if (-not $ma) { $ma = @('book', 'gold') }
  $cnt = @($cat.items).Count
  Ill-Sec -Id $cat.id -Art $ma[0] -Tone $ma[1] -Class 'mira-cat' -Kick (T "$cnt mesel" "$cnt parables") -Head (T (Inline $cat.title) $cat.en) `
    -Sub (TO "<p class=`"faq-cat-en`" lang=`"en`">$($cat.en)</p>") `
    -Body ("<p class=`"faq-intro`">$(T (Inline $cat.lead) (Inline $cat.leadEn))</p>" + "<div class=`"mira-list`">$items</div>")
}) -join "`n"
$MeselTitle = "İsa$($Apos)nın Meselleri"
$meselBody = @"
<div class="wrap narrow ill-page">
  $(Crumbs $MeselTitle)
  <header class="page-head center">$(Page-Ico $IcoBookOpen)<h1>$(T $Parables.title $Parables.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($Parables.en)</p>")</header>
  <p class="faq-intro">$(T (Inline $Parables.intro) (Inline $Parables.introEn))</p>
  <nav class="faq-toc is-sticky" $(TA 'aria-label' 'Kategoriler' 'Categories')><ul>$meselToc</ul></nav>
$meselCats
</div>
"@
Write-Page -File 'meseller.html' -Title "$($Parables.title) | $SiteName" -TitleEn "$($Parables.en) | $SiteName" `
  -Description "Mesih İsa$($Apos)nın İnciller$($Apos)deki başlıca meselleri: kısaca yeniden anlatılmış ve konularına göre bölümlere ayrılmış, düz bir dille açıklanmış otuz ikisi bir arada." -DescriptionEn "The main parables of Jesus in the Gospels, retold briefly, grouped by theme and explained in plain language, with the text of Scripture." `
  -Path 'meseller.html' -Body $meselBody -JsonLd @((Breadcrumb-Ld $MeselTitle 'meseller.html'))

# ================================================================== TESBIH DUASI (tesbih-duasi.html)
# An interactive tracker (a full 59-bead rosary as inline SVG, walked prayer by prayer by
# initRosaryTracker() in assets/script.js) followed by the prayers as collapsible cards,
# grouped into the order they are said: opening, each decade (said five times), close.
#
# Bead ids are what the script keys on: #crucifix, #intro-bead-1..5 (pendant, from the
# crucifix up), #centerpiece, #decade-N-bead-1..10, and #decade-N-our-father for decades
# 2-5 (decade 1's Our Father is #intro-bead-5, the pendant bead next to the centerpiece).
function Rosary-Svg([string]$label) {
  $cx = 180.0; $cy = 200.0; $a = 150.0; $b = 178.0
  $rS = 6.5; $rL = 10.0
  $fmt = { param($v) ([Math]::Round($v, 1)).ToString([Globalization.CultureInfo]::InvariantCulture) }
  # Loop items in prayer order: from the centerpiece at the bottom, counter-clockwise on screen.
  $items = @(@{ id = 'centerpiece'; kind = 'medal'; s = 26.0 })
  for ($d = 1; $d -le 5; $d++) {
    if ($d -gt 1) { $items += @{ id = "decade-$d-our-father"; kind = 'lg'; s = 2 * $rL } }
    for ($k = 1; $k -le 10; $k++) { $items += @{ id = "decade-$d-bead-$k"; kind = 'sm'; s = 2 * $rS } }
  }
  # Beads are spaced by arc length (an ellipse's angle parameter would bunch them at the ends).
  $N = 3600; $arc = [double[]]::new($N + 1); $ptX = [double[]]::new($N + 1); $ptY = [double[]]::new($N + 1)
  for ($j = 0; $j -le $N; $j++) {
    $t = (90.0 - 360.0 * $j / $N) * [Math]::PI / 180.0
    $ptX[$j] = $cx + $a * [Math]::Cos($t); $ptY[$j] = $cy + $b * [Math]::Sin($t)
    if ($j -gt 0) { $arc[$j] = $arc[$j - 1] + [Math]::Sqrt([Math]::Pow($ptX[$j] - $ptX[$j - 1], 2) + [Math]::Pow($ptY[$j] - $ptY[$j - 1], 2)) }
  }
  $sumS = 0.0; foreach ($it in $items) { $sumS += $it.s }
  $gap = ($arc[$N] - $sumS) / $items.Count
  $pos = 0.0; $j = 0; $order = @{}; $seq = 0
  # Prayer order for the staggered "complete" shimmer (--i): pendant first, then the loop.
  foreach ($id in @('crucifix', 'intro-bead-1', 'intro-bead-2', 'intro-bead-3', 'intro-bead-4', 'intro-bead-5')) { $order[$id] = $seq; $seq++ }
  for ($i = 1; $i -lt $items.Count; $i++) { $order[$items[$i].id] = $seq; $seq++ }
  $order['centerpiece'] = $seq
  $loop = New-Object Text.StringBuilder
  for ($i = 0; $i -lt $items.Count; $i++) {
    if ($i -gt 0) { $pos += $items[$i - 1].s / 2 + $gap + $items[$i].s / 2 }
    while ($j -lt $N -and $arc[$j + 1] -lt $pos) { $j++ }
    $f = if ($arc[$j + 1] -gt $arc[$j]) { ($pos - $arc[$j]) / ($arc[$j + 1] - $arc[$j]) } else { 0 }
    $bx = & $fmt ($ptX[$j] + ($ptX[$j + 1] - $ptX[$j]) * $f); $by = & $fmt ($ptY[$j] + ($ptY[$j + 1] - $ptY[$j]) * $f)
    $it = $items[$i]
    if ($it.kind -eq 'medal') { continue }
    $r = if ($it.kind -eq 'lg') { $rL } else { $rS }
    [void]$loop.Append("<circle id=`"$($it.id)`" class=`"bead $($it.kind) unprayed`" cx=`"$bx`" cy=`"$by`" r=`"$r`" style=`"--i:$($order[$it.id])`"></circle>")
  }
  $my = $cy + $b
  $pend = @(
    @{ id = 'intro-bead-5'; kind = 'lg'; y = 413.0 }, @{ id = 'intro-bead-4'; kind = 'sm'; y = 439.5 },
    @{ id = 'intro-bead-3'; kind = 'sm'; y = 462.5 }, @{ id = 'intro-bead-2'; kind = 'sm'; y = 485.5 },
    @{ id = 'intro-bead-1'; kind = 'lg'; y = 512.0 }
  ) | ForEach-Object {
    $r = if ($_.kind -eq 'lg') { $rL } else { $rS }
    "<circle id=`"$($_.id)`" class=`"bead $($_.kind) unprayed`" cx=`"180`" cy=`"$($_.y)`" r=`"$r`" style=`"--i:$($order[$_.id])`"></circle>"
  }
  return "<svg class=`"rt-svg`" viewBox=`"0 0 360 624`" role=`"img`" $label focusable=`"false`">" +
    "<ellipse class=`"chain`" cx=`"$cx`" cy=`"$cy`" rx=`"$a`" ry=`"$b`"></ellipse>" +
    "<path class=`"chain`" d=`"M180 $my V 540`"></path>" +
    # The glow behind whichever bead is being prayed: a soft disc that script.js moves to that bead.
    # (A CSS drop-shadow on the bead itself would be simpler, but Safari ignores filters on SVG shapes.)
    "<defs><radialGradient id=`"rt-halo-g`"><stop class=`"rt-halo-in`" offset=`"0`"/><stop class=`"rt-halo-mid`" offset=`".45`"/><stop class=`"rt-halo-out`" offset=`"1`"/></radialGradient></defs>" +
    "<circle class=`"rt-halo`" cx=`"180`" cy=`"568`" r=`"44`" fill=`"url(#rt-halo-g)`"></circle>" +
    "<g id=`"rt-loop`">$($loop.ToString())</g>" +
    "<g id=`"rt-pendant`">$($pend -join '')" +
    "<g id=`"centerpiece`" class=`"bead medal unprayed`" data-cx=`"180`" data-cy=`"$my`" data-r=`"15`" style=`"--i:$($order['centerpiece'])`">" +
      "<ellipse cx=`"180`" cy=`"$my`" rx=`"12`" ry=`"15`"></ellipse><path class=`"medal-mark`" d=`"M173.5 384 V372.5 L180 379.5 L186.5 372.5 V384`"></path></g>" +
    "<g id=`"crucifix`" class=`"bead cross active`" data-cx=`"180`" data-cy=`"568`" data-r=`"36`" style=`"--i:0`">" +
      "<rect x=`"173`" y=`"532`" width=`"14`" height=`"80`" rx=`"3`"></rect><rect x=`"154`" y=`"549`" width=`"52`" height=`"14`" rx=`"3`"></rect></g>" +
    "</g></svg>"
}

# The tracker block. The sheet is server-rendered on its first step (the Sign of the Cross)
# so it never paints empty; the script takes over once data/tespih.js has loaded.
function Rosary-Tracker([string]$lang) {
  $first = $PrayerById['hac-isareti']
  # the list's names are set by script.js in the language shown; Turkish until then
  $opts = ($Rosary.sets | ForEach-Object { "<option value=`"$($_.id)`" data-days=`"$($_.days -join ',')`">$($_.tr)</option>" }) -join ''
  return @"
  <section class="rt" id="tesbih-rehberi" aria-labelledby="rt-h">
    <h2 class="section-title" id="rt-h">$(T 'Adım Adım Tesbih' 'Pray the Rosary, Bead by Bead')</h2>
    <p class="rt-lead">$(T 'Parlayan taneye dokunun ya da ileri okuna basın; her tanenin duası dua panelinde görünür. Günün gizemleri kendiliğinden seçilir.' "Tap the glowing bead or press Next; the prayer for each bead appears in the prayer panel. Today's mysteries are chosen for you.")</p>
    <div class="rt-bar">
      <label class="rt-select"><span class="label">$(T 'Gizemler' 'Mysteries')</span><select id="rt-set">$opts</select></label>
      <button type="button" class="rt-restart">$IcoRefresh<span>$(T 'Baştan başla' 'Start over')</span></button>
    </div>
    <div class="rt-body">
      <div class="rt-stage">
        $(Rosary-Svg (TA 'aria-label' 'Beş onluklu tesbih: bir taneye geçmek için dokunun' 'A five-decade rosary: tap a bead to move to it'))
        <div class="rt-center" aria-hidden="true"><p class="rt-c-set"></p><p class="rt-c-count"></p><p class="rt-c-myst">$(T 'Giriş' 'Opening')</p></div>
      </div>
      <div class="rt-sheet glass" role="region" $(TA 'aria-label' 'Dua paneli' 'Prayer panel')>
        <button type="button" class="rt-grip" aria-expanded="true" aria-controls="rt-text" $(TA 'aria-label' 'Dua metnini gizle' 'Hide prayer text')><span></span></button>
        <div class="rt-progress" aria-hidden="true"><span></span></div>
        <p class="rt-resume" hidden></p>
        <p class="rt-context label">$(T 'Giriş' 'Opening')</p>
        <p class="rt-mystery" hidden><span class="rt-m-label"></span><span class="rt-m-title"></span></p>
        <h3 class="rt-title">$(T (Inline $first.tr.title) (Inline $first.en.title))</h3>
        <div class="rt-text" id="rt-text">$(TB ((Verse $first.tr.text) -replace '<br>', ' <br>') ((Verse $first.en.text) -replace '<br>', ' <br>'))</div>
        <div class="rt-nav">
          <button type="button" class="rt-prev" disabled $(TA 'aria-label' 'Önceki' 'Previous') $(TA 'title' 'Önceki' 'Previous')>$IcoPrev</button>
          <button type="button" class="rt-next" $(TA 'aria-label' 'Sonraki' 'Next') $(TA 'title' 'Sonraki' 'Next')>$IcoNext</button>
        </div>
        <p class="visually-hidden rt-live" aria-live="polite"></p>
      </div>
    </div>
  </section>
"@
}
# each set of mysteries with a drawing of its own: the star of Bethlehem, Mount Tabor's light, the
# crown of thorns, the dove of Pentecost
$MystArt = @{ 'sevinc' = @('star', 'blue'); 'isik' = @('tabor', 'gold'); 'aci' = @('thorns', 'red'); 'yucelik' = @('dove', 'purple') }
$mysterySets = ($Rosary.sets | ForEach-Object {
  $items = ($_.items | ForEach-Object { "<li><span class=`"m-tr`">$(T (Inline $_.tr) $_.en)</span></li>" }) -join ''
  $ma = $MystArt[$_.id]
  "<article class=`"myst ill-card tone-$($ma[1])`" data-days=`"$($_.days -join ',')`" id=`"gizem-$($_.id)`">" +
    "$(Ill-Art $ma[0])<header><h3>$(T (Inline $_.tr) $_.en)</h3><p class=`"m-day label`">$(T $_.dayTr $_.dayEn)</p>$(TO ('<p class="m-en-title" lang="en">' + $_.en + '</p>'))</header>" +
    "<ol class=`"myst-list`">$items</ol></article>"
}) -join "`n"
$stepList = ($Rosary.steps | ForEach-Object {
  "<li><span class=`"s-tr`">$(T (Inline $_.tr) $_.en)</span></li>"
}) -join ''

$PrayerById = @{}
$Rosary.prayers | ForEach-Object { $PrayerById[$_.id] = $_ }
# Two short plain paragraphs around the steps (the prayers themselves come from the script),
# so search engines see what the page is about; the history page carries the long story
$rosaryLead = if ($Rosary.about) { '<p class="rosary-note">' + (T $Rosary.about.tr $Rosary.about.en) + '</p>' } else { '' }
$rosaryTip = if ($Rosary.about.tipTr) { '<p class="rosary-note">' + (T $Rosary.about.tipTr $Rosary.about.tipEn) + '</p>' } else { '' }
$tespihBody = @"
<div class="wrap narrow">
  $(Crumbs 'Tesbih Duası')
  <header class="page-head center">$(Page-Ico $IcoBeads)<h1>$(T $Rosary.title $Rosary.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($Rosary.en)</p>")</header>
  <p class="rosary-jump"><a class="btn" href="#tesbih-rehberi">$(T 'Hemen dua etmeye başlayın' 'Start praying now')<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg></a></p>
  <p class="faq-intro">$(T (Inline $Rosary.intro) (Inline $Rosary.introEn))</p>
  <a class="text-link th-link" href="tesbih-tarihi.html"><span class="label">$(T 'Okuyun' 'Read')</span><span class="t-title">$(T 'Tesbihin Tarihi' 'The History of the Rosary')</span><span class="t-sub">$(T "İncil$($Apos)deki kökünden Aziz Dominik$($Apos)e, İnebahtı$($Apos)dan Fatima$($Apos)ya" 'From its roots in the Gospel to St. Dominic, from Lepanto to Fatima')</span></a>
$(Rosary-Tracker 'tr')
  <h2 class="section-title" id="gizemler">$(T 'Gizemler' 'The Mysteries')</h2>
  <div class="myst-grid">
$mysterySets
  </div>
  <h2 class="section-title" id="nasil">$(T 'Tesbih nasıl dua edilir?' 'How to pray the Rosary')</h2>
  $rosaryLead
  <ol class="steps">$stepList</ol>
  $rosaryTip
  <p class="conventions">$(T "Dua metinleri, İstanbul$($Apos)daki Sant$($Apos)Antuan (Aziz Antuan) Bazilikası$($Apos)nda tesbih duası için kullanılan Türkçe gelenek esas alınarak düzenlenmiştir." "The Turkish prayers follow the tradition used for the Rosary at the Basilica of Saint Anthony of Padua (Sant'Antuan) in Istanbul; the English versions are the prayers as they are commonly said in English.")</p>
</div>
"@
Write-Page -File 'tesbih-duasi.html' -Title "$($Rosary.title) | $SiteName" -TitleEn "$($Rosary.en) | $SiteName" `
  -Description "Meryem Ana Tesbih Duası: duaların Türkçesi ve İngilizcesi, Sevinç, Işık, Acı ve Yücelik gizemleri ve tesbihin nasıl dua edileceği." -DescriptionEn "How to pray the Rosary: the prayers in Turkish and English, the Joyful, Luminous, Sorrowful and Glorious Mysteries, and a bead-by-bead guide." `
  -Path 'tesbih-duasi.html' -Body $tespihBody -JsonLd @((Breadcrumb-Ld 'Tesbih Duası' 'tesbih-duasi.html'))

# ================================================================== TESBIHIN TARIHI (tesbih-tarihi.html)
# The history of the Rosary, linked from the Tesbih Duası page under its intro. Read like the
# Tartış pages (numbered sections, quotes, sources); the two lists of Bible references fold away.
$RosaryHistory = Read-Data 'tesbih-tarihi.js'
function Th-Inline([string]$s) { return [regex]::Replace([regex]::Replace($s, '\*\*(.+?)\*\*', '<strong>$1</strong>'), '(?<![\*\w])\*([^*]+)\*(?!\*)', '<em>$1</em>') }
# One paragraph per line; "- " list item, "> " quotation, "[[+ Title]] ... [[-]]" a part that folds away
function Th-Blocks([string]$s) {
  $sb = New-Object Text.StringBuilder; $list = New-Object Collections.ArrayList
  $flush = { if ($list.Count) { [void]$sb.Append('<ul>' + (($list | ForEach-Object { "<li>$(Th-Inline $_)</li>" }) -join '') + '</ul>'); $list.Clear() } }
  foreach ($line in ($s -split "`n")) {
    $l = $line.Trim(); if (-not $l) { continue }
    if ($l.StartsWith('- ')) { [void]$list.Add($l.Substring(2)); continue }
    . $flush
    if ($l -match '^\[\[\+ (.+)\]\]$') { [void]$sb.Append("<details class=`"faq-item th-fold`"><summary><span class=`"faq-q`">$($Matches[1])</span>$IcoChevLg</summary><div class=`"faq-a`">"); continue }
    if ($l -eq '[[-]]') { [void]$sb.Append('</div></details>'); continue }
    if ($l.StartsWith('> ')) { [void]$sb.Append("<blockquote class=`"ic-quote`"><p>$(Th-Inline $l.Substring(2))</p></blockquote>"); continue }
    [void]$sb.Append("<p>$(Th-Inline $l)</p>")
  }
  . $flush
  return $sb.ToString()
}
# The closing line (to the bead-by-bead guide) ends the last section
$thToGuide = { param($s, $name) $s.Replace($name, "<a href=`"tesbih-duasi.html#tesbih-rehberi`">$name</a>") }
$thClosing = @("<p class=`"th-closing`">$(& $thToGuide $RosaryHistory.closing 'Adım Adım Tesbih')</p>", "<p class=`"th-closing`">$(& $thToGuide $RosaryHistory.closingEn 'Pray the Rosary, Bead by Bead')</p>")
$thAll = @($RosaryHistory.sections)
# The thirteen sections in six illustrated parts (Ill-Sec); each section keeps its own anchor and heading
$thParts = @(
  @{ id = 'baslangic'; art = 'rose'; tone = 'red'; k = @('Başlangıç', 'The beginning'); h = @("Gül bahçesinden İncil$($Apos)e", 'From a rose garden to the Gospel'); s = @('adi', 'kokleri', 'bos-tekrar') },
  @{ id = 'orta-cag'; art = 'beads'; tone = 'gold'; k = @('Orta Çağ', 'The Middle Ages'); h = @("Çakıl taşlarından Aziz Dominik$($Apos)e", 'From pebbles to St. Dominic'); s = @('cakil-taslari', 'aziz-dominik', 'yeniden-dogus') },
  @{ id = 'inebahti-ve-sonrasi'; art = 'ship'; tone = 'blue'; k = @('1571 ve sonrası', '1571 and after'); h = @('İnebahtı ve dünyaya yayılış', 'Lepanto and the spread across the world'); s = @('inebahti', 'dunyaya-yayilan') },
  @{ id = 'gorunmeler'; art = 'mary'; tone = 'purple'; k = @('19. ve 20. yüzyıl', 'The 19th and 20th centuries'); h = @('Bartolo Longo, Lourdes ve Fatima', 'Bartolo Longo, Lourdes and Fatima'); s = @('bartolo-longo', 'lourdes-fatima') },
  @{ id = 'gunumuz'; art = 'candle'; tone = 'green'; k = @('Bugün', 'Today'); h = @('Işık Gizemleri ve tesbihin özü', 'The Luminous Mysteries and the heart of the Rosary'); s = @('ioannes-paulus', 'tesbihin-ozu') },
  @{ id = 'savas'; art = 'shield'; tone = 'red'; k = @('Ruhsal savaş', 'Spiritual warfare'); h = @("Şeytan $([char]0x201C)Selam Sana Meryem$([char]0x201D)den neden korkar?", 'Why does the devil fear the Hail Mary?'); s = @('ruhsal-savas') }
)
$thById = @{}; foreach ($x in $thAll) { $thById[$x.id] = $x }
$thLast = $thAll[-1].id
$thSecs = ($thParts | ForEach-Object {
  $pt = $_
  $inner = ($pt.s | ForEach-Object {
    $x = $thById[$_]
    $end = if ($x.id -eq $thLast) { $thClosing } else { @('', '') }
    $head = if (@($pt.s).Count -gt 1) { "<h3 class=`"ic-sec-t`"><span>$(T $x.title $x.titleEn)</span></h3>" } else { "<h3 class=`"ic-sec-t visually-hidden`"><span>$(T $x.title $x.titleEn)</span></h3>" }
    "<section class=`"ic-sec th-sub`" id=`"$($x.id)`">$head" +
      "<div class=`"prose ill-prose`">$(TB ((Th-Blocks $x.body) + $end[0]) ((Th-Blocks $x.bodyEn) + $end[1]))</div></section>"
  }) -join ''
  Ill-Sec -Id $pt.id -Art $pt.art -Tone $pt.tone -Kick (T $pt.k[0] $pt.k[1]) -Head (T $pt.h[0] $pt.h[1]) -Class 'th-part' -Body $inner
}) -join "`n"
$thSources = (@($RosaryHistory.sources) | ForEach-Object {
  "<h3 class=`"th-src-g`">$(T $_.g $_.gEn)</h3><ul>" + ((@($_.items) | ForEach-Object { "<li>$(T (Th-Inline $_[0]) (Th-Inline $_[1]))</li>" }) -join '') + '</ul>'
}) -join ''
$thBody = @"
<div class="wrap narrow ic-page th-page ill-page">
  $(Crumbs 'Tesbihin Tarihi' 'Tesbih Duası' 'tesbih-duasi.html')
  <header class="page-head center" id="bas">$(Page-Ico $IcoBeads)<h1>$(T $RosaryHistory.title $RosaryHistory.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($RosaryHistory.en)</p>")</header>
  <figure class="quote th-quote"><blockquote><p>$(T $RosaryHistory.quote $RosaryHistory.quoteEn)</p></blockquote><figcaption class="attr">$(T $RosaryHistory.quoteBy $RosaryHistory.quoteByEn)</figcaption></figure>
$thSecs
  <section class="ic-sources" aria-labelledby="th-kaynak-h"><h2 class="section-title" id="th-kaynak-h">$(T 'Kaynaklar' 'Sources')</h2>$thSources</section>
</div>
"@
$thLd = '{"@context":"https://schema.org","@type":"Article","headline":"Tesbihin Tarihi","inLanguage":"tr","mainEntityOfPage":' + (JStr "$SiteUrl/tesbih-tarihi.html") + '}'
Write-Page -File 'tesbih-tarihi.html' -Title "Tesbihin Tarihi | $SiteName" -TitleEn "The History of the Rosary | $SiteName" `
  -Description "Tesbihin tarihi: Kutsal Kitap'taki kökleri, çakıl taşlarından boncuklara, Aziz Dominik, İnebahtı, Lourdes, Fatima, Işık Gizemleri ve ruhsal savaş." -DescriptionEn "The history of the Rosary: its roots in Scripture, from pebbles to beads, St. Dominic, Lepanto, Lourdes, Fatima, the Luminous Mysteries and spiritual warfare." `
  -Path 'tesbih-tarihi.html' -Body $thBody -JsonLd @($thLd, (Breadcrumb-Ld 'Tesbihin Tarihi' 'tesbih-tarihi.html' 'Tesbih Duası' 'tesbih-duasi.html')) -OgType 'article'

# ================================================================== KILISE'NIN TARIHI (kilise-tarihi.html)
# The whole of data/kilise-tarihi.json as one article: an era bar to jump with, then each era
# (its years, a short introduction) and its events down a line of dates, each with its picture,
# its short line and the full story. The home page's strip links each event here (#olay-N).
$ktN = 0; $ktEraNav = New-Object System.Collections.Generic.List[string]
$ktEras = ($Tarih.eras | ForEach-Object {
  $era = $_
  $ktEraNav.Add("<a href=`"#donem-$($era.id)`"><span class=`"kt-en`">$($era.t)</span><span class=`"kt-ey`">$($era.span)</span></a>")
  $evs = ($Tarih.items | Where-Object { $_.era -eq $era.id } | ForEach-Object {
    $it = $_; $script:ktN++
    $g = $TarihImg.($it.img)
    $cap = if ($g) { "<figcaption>$($g.a) · <cite>$($g.t)</cite></figcaption>" } else { '' }
    $more = if ($it.link) { "<a class=`"kt-more`" href=`"$($it.link)`">Devamını okuyun<svg viewBox=`"0 0 24 24`" aria-hidden=`"true`" fill=`"none`" stroke=`"currentColor`" stroke-width=`"2`" stroke-linecap=`"round`" stroke-linejoin=`"round`"><path d=`"m9 6 6 6-6 6`"/></svg></a>" } else { '' }
    "<li class=`"kt-ev`" id=`"olay-$script:ktN`"><span class=`"kt-dot`" aria-hidden=`"true`"></span>" +
      "<figure class=`"kt-img`"><img src=`"assets/art/tl/$($it.img).jpg`" alt=`"`" width=`"600`" height=`"400`" loading=`"lazy`" decoding=`"async`">$cap</figure>" +
      "<div class=`"kt-body`"><p class=`"kt-y`">$($it.y)</p><h3 class=`"kt-t`">$($it.t)</h3><p class=`"kt-s`">$($it.s)</p><p class=`"kt-d`">$($it.d)</p>$more</div></li>"
  }) -join ''
  "<section class=`"kt-era`" id=`"donem-$($era.id)`" aria-labelledby=`"donem-$($era.id)-h`"><header class=`"kt-era-head`"><p class=`"kt-span`">$($era.span)</p>" +
    "<h2 id=`"donem-$($era.id)-h`">$($era.t)</h2><p class=`"kt-intro`">$($era.intro)</p></header><ol class=`"kt-list`">$evs</ol></section>"
}) -join "`n"
$ktBody = @"
<div class="wrap kt-page">
  <header class="page-head center" id="bas">$(Page-Ico $IcoHourglass)<h1>Kilise$($Apos)nin Tarihi</h1><p class="sub">Pentikost$($Apos)tan II. Vatikan Konsili$($Apos)ne, $ktN olay.</p></header>
  <nav class="kt-nav" aria-label="Dönemler">$($ktEraNav -join '')</nav>
$ktEras
  <p class="kt-end">Hikâye sürüyor. Devamı için <a href="topraklarimizda-hristiyanlik.html">Topraklarımızda Hristiyanlık</a> ve <a href="azizler.html">Azizler</a>.</p>
</div>
"@
$ktLd = '{"@context":"https://schema.org","@type":"Article","headline":"Kilise' + "'" + 'nin Tarihi","inLanguage":"tr","mainEntityOfPage":' + (JStr "$SiteUrl/kilise-tarihi.html") + '}'
Write-Page -File 'kilise-tarihi.html' -Title "Kilise$($Apos)nin Tarihi | $SiteName" -TitleEn "History of the Church | $SiteName" `
  -Description "Kilise'nin tarihi: Pentikost'tan İznik ve Efes konsillerine, manastırlardan Trento'ya, I. ve II. Vatikan konsillerine kadar $ktN olay, tablolarıyla." -DescriptionEn "The history of the Church: $ktN events from Pentecost to the Second Vatican Council, each with its painting." `
  -Path 'kilise-tarihi.html' -Body $ktBody -JsonLd @($ktLd, (Breadcrumb-Ld "Kilise$($Apos)nin Tarihi" 'kilise-tarihi.html')) -OgType 'article'

# ================================================================== MUCIZELER (mucizeler.html)
$Miracles = Read-Data 'mucizeler.js'
$MiracleIcons = @{
  apparition = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.2 13.3 10.7 17 12 13.3 13.3 12 16.8 10.7 13.3 7 12 10.7 10.7Z"/></svg>'
  relic      = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="3.5" width="15" height="19" rx="1.2"/><path d="M12 8.5v8M8.5 12.5h7"/></svg>'
  eucharist  = $IcoChalice
  incorrupt  = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 20V11a7 7 0 0 1 14 0v9"/><path d="M4 20h16"/><path d="M12 3.4v2.2M10.8 4.5h2.4"/></svg>'
}
$script:MiraN = 0
$miraToc = ($Miracles.categories | ForEach-Object { "<li><a href=`"#$($_.id)`">$(T (Inline $_.title) $_.en)</a></li>" }) -join ''
$miraCats = ($Miracles.categories | ForEach-Object {
  $script:MiraN++; $cat = $_
  $icon = $MiracleIcons[$cat.icon]
  $items = ($cat.items | ForEach-Object {
    $mid = $_.id
    $more = if ($GreatSaintIds.ContainsKey($mid)) { $gsN = @($GreatSaints.saints | Where-Object { $_.id -eq $mid })[0]; '<a class="today-more-link" href="' + $mid + '.html">' + (T 'Devamını oku' 'Read more') + '<span class="visually-hidden">: ' + (T $gsN.name $gsN.en) + '</span>' + $IcoNext + '</a>' } else { '' }
    "<details class=`"mira-item`" id=`"$($_.id)`"><summary><span class=`"mira-ico`">$icon</span><span class=`"mira-head`"><span class=`"mira-name`">$(T (Inline $_.name) (Inline $_.nameEn))</span><span class=`"mira-place label`">$(T $_.place $_.placeEn)</span></span>$IcoChevLg</summary><div class=`"mira-bio`">$(Mira-Fig $_.art)$(TB (Blocks $_.bio) (Blocks $_.bioEn))$more</div></details>"
  }) -join "`n"
  $ma = @{ 'gorunmeler' = @('mary', 'blue'); 'kalintilar' = @('reliquary', 'gold'); 'efkaristiya' = @('chalice', 'red'); 'curumeyen-azizler' = @('lily', 'green') }[$cat.id]
  if (-not $ma) { $ma = @('candle', 'gold') }
  # the kicker names the places the section goes to
  $kTr = (@($cat.items) | ForEach-Object { ($_.place -split ',')[0].Trim() }) -join ' · '
  $kEn = (@($cat.items) | ForEach-Object { ($(if ($_.placeEn) { $_.placeEn } else { $_.place }) -split ',')[0].Trim() }) -join ' · '
  Ill-Sec -Id $cat.id -Art $ma[0] -Tone $ma[1] -Class 'mira-cat' -Kick (T $kTr $kEn) -Head (T (Inline $cat.title) $cat.en) `
    -Sub (TO "<p class=`"faq-cat-en`" lang=`"en`">$($cat.en)</p>") `
    -Body ("<p class=`"faq-intro`">$(T (Inline $cat.lead) (Inline $cat.leadEn))</p>" + "<div class=`"mira-list`">$items</div>")
}) -join "`n"
$mucizelerBody = @"
<div class="wrap narrow ill-page">
  $(Crumbs 'Mucizeler')
  <header class="page-head center">$(Page-Ico $IcoSparkle)<h1>$(T $Miracles.title $Miracles.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($Miracles.en)</p>")</header>
  <p class="faq-intro">$(T (Inline $Miracles.intro) (Inline $Miracles.introEn))</p>
  <nav class="faq-toc is-sticky" $(TA 'aria-label' 'Kategoriler' 'Categories')><ul>$miraToc</ul></nav>
$miraCats
</div>
"@
Write-Page -File 'mucizeler.html' -Title "Mucizeler | $SiteName" -TitleEn "$($Miracles.en) | $SiteName" `
  -Description "Katolik Kilisesi$($Apos)nde bilinen mucizeler: Meryem Ana görünmeleri (Fatima, Lourdes, Guadalupe, Zeytun), Torino Kefeni, Efkaristiya mucizeleri ve çürümeyen azizler." -DescriptionEn "Catholic miracles and the evidence: Fatima, Lourdes, Guadalupe, Zeitoun, the Shroud of Turin, Eucharistic miracles such as Lanciano, and Padre Pio." `
  -Path 'mucizeler.html' -Body $mucizelerBody -JsonLd @((Breadcrumb-Ld 'Mucizeler' 'mucizeler.html'))

# ================================================================== KILISELER (kiliseler.html): parish locator
# The map of Turkey with the cities that have a Catholic church (kiliseler.html), and a page of
# its own for every church (kilise/<id>.html): its history, Mass times, visiting hours, contact
# details and the sources they came from.
$Churches = Read-Data 'kiliseler.js'
$RiteLabels = @{}
$Churches.rites | ForEach-Object { $RiteLabels[$_.id] = @{ tr = $_.tr; en = $_.en } }
# Searches Google Maps by the church's own name and city: these are all named, independently
# mappable landmarks, so a name search resolves more reliably than a sourced street address.
function Map-Url([string]$q) { return 'https://www.google.com/maps/search/?api=1&query=' + [uri]::EscapeDataString($q) }
$IcoClock = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.2"/><path d="M12 7.4V12l3.2 2"/></svg>'
$IcoPhone = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5.2 4h3.1l1.3 4-2 1.4a12.5 12.5 0 0 0 5.9 5.9l1.4-2 4 1.3v3.1a1.6 1.6 0 0 1-1.7 1.6A16.3 16.3 0 0 1 3.6 5.7 1.6 1.6 0 0 1 5.2 4Z"/></svg>'
$IcoExternal = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/><path d="M14 4h6v6"/><path d="M20 4 10.5 13.5"/></svg>'
$IcoWarn = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 2.6 18.2a1.6 1.6 0 0 0 1.4 2.4h16a1.6 1.6 0 0 0 1.4-2.4L13.7 3.9a1.6 1.6 0 0 0-2.8 0Z"/><path d="M12 9.5v4.4"/><circle cx="12" cy="16.8" r="1" fill="currentColor" stroke="none"/></svg>'
$IcoChurch = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.6v3.1M10.6 4.1h2.8"/><path d="M5 10.8 12 6l7 4.8V21H5Z"/><path d="M9.6 21v-4.6a2.4 2.4 0 0 1 4.8 0V21"/></svg>'
$IcoMailSm = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.4" y="5.4" width="17.2" height="13.2" rx="2"/><path d="m4 7 8 6 8-6"/></svg>'
$IcoGlobe = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/></svg>'
$IcoDoor = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4.6A1.6 1.6 0 0 1 6.6 3h10.8A1.6 1.6 0 0 1 19 4.6V21"/><path d="M3 21h18"/><circle cx="15" cy="12.4" r=".9" fill="currentColor" stroke="none"/></svg>'
# a phone number as shown ("0212 244 09 35 (14:00–17:00)") and as dialled (+902122440935)
function Tel-Href([string]$p) { $d = (($p -replace '\(.*$', '') -replace '[^\d]', ''); if ($d.StartsWith('0')) { $d = $d.Substring(1) }; return "tel:+90$d" }
function Site-Host([string]$u) { return (($u -replace '^https?://(www\.)?', '') -replace '/$', '') }
# where each church belongs on phones and in the bar at the top: Keşfet, under Kilise Bul
$ChurchPages = @()
foreach ($city in $Churches.cities) { foreach ($ch in $city.churches) { $AppOf["kilise/$($ch.id).html"] = 'kesfet'; $ChurchPages += "kilise/$($ch.id).html" } }
$ChurchDir = Join-Path $Root 'kilise'
if (-not (Test-Path $ChurchDir)) { New-Item -ItemType Directory -Path $ChurchDir | Out-Null }
# pages of churches no longer in the data are removed, so no stale page stays online
Get-ChildItem $ChurchDir -Filter '*.html' | Where-Object { $ChurchPages -notcontains "kilise/$($_.Name)" } | Remove-Item

foreach ($city in $Churches.cities) {
  $cityName = $city.name -replace ' \(.*\)$', ''
  $cityEn = if ($city.nameEn) { $city.nameEn } else { $cityName }
  foreach ($ch in $city.churches) {
    $rite = $RiteLabels[$ch.rite]
    $file = "kilise/$($ch.id).html"
    # the notice: closed, or something to know before going
    $notice = ''
    if ($ch.notice) {
      $head = if ($ch.status -eq 'closed') { T 'Şu anda kapalı.' 'Currently closed.' } elseif ($ch.status -eq 'active') { T 'Duyuru.' 'Notice.' } else { T 'Gitmeden önce.' 'Before you go.' }
      $notice = "<div class=`"ch-notice is-$($ch.status)`" role=`"note`">$IcoWarn<p><strong>$head</strong> $(T (Inline $ch.notice) (Inline $ch.noticeEn))</p></div>"
    }
    # contact: address (with a map link), phones, e-mail, website
    $mapQ = "$(Plain $ch.name), $cityName"
    $rows = New-Object Text.StringBuilder
    [void]$rows.Append("<div class=`"ch-row`"><dt>$IcoPin<span>$(T 'Adres' 'Address')</span></dt><dd>$(Inline $ch.address)<br><a class=`"map-link`" href=`"$(Map-Url $mapQ)`" data-map-q=`"$(Attr $mapQ)`" target=`"_blank`" rel=`"noopener`">$(T 'Haritada aç' 'Open in Maps') $IcoExternal</a></dd></div>")
    if (@($ch.phones).Count) {
      $ph = (@($ch.phones) | ForEach-Object { "<a href=`"$(Tel-Href $_)`">$_</a>" }) -join '<br>'
      [void]$rows.Append("<div class=`"ch-row`"><dt>$IcoPhone<span>$(T 'Telefon' 'Phone')</span></dt><dd>$ph</dd></div>")
    }
    if ($ch.email) { [void]$rows.Append("<div class=`"ch-row`"><dt>$IcoMailSm<span>$(T 'E-posta' 'Email')</span></dt><dd><a href=`"mailto:$($ch.email)`">$($ch.email)</a></dd></div>") }
    if ($ch.website) { [void]$rows.Append("<div class=`"ch-row`"><dt>$IcoGlobe<span>$(T 'Web' 'Website')</span></dt><dd><a href=`"$($ch.website)`" target=`"_blank`" rel=`"noopener`">$(Site-Host $ch.website) $IcoExternal</a></dd></div>") }
    $massEn = @($ch.massEn)
    $times = (0..(@($ch.mass).Count - 1) | ForEach-Object { $m = @($ch.mass)[$_]; $e = $massEn[$_]; "<tr><th scope=`"row`">$(T (Inline $m[0]) (Inline $e[0]))</th><td>$(T (Inline $m[1]) (Inline $e[1]))</td></tr>" }) -join ''
    $massNote = if ($ch.massNote) { "<p class=`"ch-note`">$(T (Inline $ch.massNote) (Inline $ch.massNoteEn))</p>" } else { '' }
    $ocia = if ($ch.ocia) { "<section class=`"ch-sec ch-ocia`" id=`"ocia`"><h2 class=`"ch-h`">$IcoCompass $(T 'Katolik Olmak İsteyenler İçin' 'For Those Who Want to Become Catholic')</h2><p>$(T (Inline $ch.ocia) (Inline $ch.ociaEn))</p></section>" } else { '' }
    $visits = if ($ch.visits) { "<section class=`"ch-sec`" id=`"ziyaret`"><h2 class=`"ch-h`">$IcoDoor $(T 'Ziyaret' 'Visiting')</h2><p>$(T (Inline $ch.visits) (Inline $ch.visitsEn))</p></section>" } else { '' }
    $hist = TB ((@($ch.history) | ForEach-Object { "<p>$(Inline $_)</p>" }) -join "`n") ((@($ch.historyEn) | ForEach-Object { "<p>$(Inline $_)</p>" }) -join "`n")
    $srcs = (@($ch.sources) | ForEach-Object { "<li><a href=`"$($_[1])`" target=`"_blank`" rel=`"noopener`">$(T (Inline $_[0]) (Inline $_[2]))</a></li>" }) -join ''
    $body = @"
<div class="wrap narrow">
  <article class="article church-page" id="article">
    <header class="page-head center">$(Page-Ico $IcoChurch)<p class="label">$(T "$($rite.tr) · $cityName" "$($rite.en) · $cityEn")</p><h1>$(T (Inline $ch.name) (Inline $ch.nameEn))</h1><p class="sub">$(T "$(Inline $ch.district), $cityName" "$(Inline $ch.district), $cityEn")</p></header>
    $notice
    <section class="ch-sec ch-contact"><dl class="ch-list">$($rows.ToString())</dl></section>
    <section class="ch-sec" id="ayin-saatleri"><h2 class="ch-h">$IcoClock $(T 'Ayin Saatleri' 'Mass Times')</h2><table class="ch-times"><tbody>$times</tbody></table>$massNote</section>
    $visits
    $ocia
    <section class="ch-sec" id="tarihce"><h2 class="ch-h">$IcoBook $(T 'Tarihçe' 'History')</h2><div class="prose">$hist</div></section>
    <section class="ch-sec ch-sources" id="kaynaklar"><h2 class="ch-h">$(T 'Kaynaklar' 'Sources')</h2><ul>$srcs</ul>
      $(TB "<p class=`"conventions`">Son kontrol: $($Churches.updated). Ayin ve ziyaret saatleri bayramlarda ve mevsime göre değişebilir; gitmeden önce kiliseyle teyit edin. Bir hata gördüyseniz <a href=`"iletisim.html`">bize bildirin</a>.</p>" "<p class=`"conventions`">Last checked: $($Churches.updatedEn). Mass and visiting times can change on feast days and with the seasons; check with the church before you go. If you spot a mistake, <a href=`"iletisim.html`">let us know</a>.</p>")</section>
  </article>
  <p class="ch-back"><a class="btn" href="kiliseler.html#harita">$IcoPin $(T 'Kilise Bul haritasına dön' 'Back to the Find a Church map')</a></p>
</div>
"@
    $desc = "$(Plain $ch.name), $(Plain $ch.district), $($cityName): ayin saatleri, ziyaret saatleri, adres ve tarihçe."
    $descEn = "$(Plain $ch.nameEn), $(Plain $ch.district), $($cityEn): Mass times, visiting hours, address and history."
    $ld = '{"@context":"https://schema.org","@type":"Church","name":' + (JStr (Plain $ch.name)) + ',"address":{"@type":"PostalAddress","streetAddress":' + (JStr (Plain $ch.address)) + ',"addressLocality":' + (JStr $cityName) + ',"addressCountry":"TR"}' +
      $(if (@($ch.phones).Count) { ',"telephone":' + (JStr ((Tel-Href @($ch.phones)[0]) -replace '^tel:', '')) } else { '' }) +
      $(if ($ch.website) { ',"sameAs":' + (JStr $ch.website) } else { '' }) + ',"url":' + (JStr "$SiteUrl/$file") + '}'
    Write-Page -File $file -Title "$(Plain $ch.name), $cityName | $SiteName" -TitleEn "$(Plain $ch.nameEn), $cityEn | $SiteName" -Description (Meta-Trim $desc) -Path $file -DescriptionEn $descEn -Body $body `
      -JsonLd @($ld, (Breadcrumb-Ld (Plain $ch.name) $file 'Kilise Bul' 'kiliseler.html')) -OgType 'article' -RootRelative $true
  }
}

# ---------------- The map: Turkey, fixed, with the cities that have a Catholic church. A city's dot
# lights up under the pointer and opens the list of its churches (script.js, initChurchMap), each
# name leading to the church's page. The shape is the Anatolian Roots map's outline, with the
# Marmara coast in full detail.
$CmShape = Read-Data 'kilise-harita-sekli.js'
function Cm-Pin([double]$lat, [double]$lon) { $p = Map-XY $lat $lon; return "data-x=`"$($p[0])`" data-y=`"$($p[1])`"" }
$cmCities = New-Object Text.StringBuilder; $cmPops = New-Object Text.StringBuilder
# the columns of a city's list: Istanbul's two sides of the Bosphorus; İzmir and Selçuk (Efes)
$SideLabel = @{ avrupa = (T 'Avrupa Yakası' 'European side'); anadolu = (T 'Anadolu Yakası' 'Asian side'); merkez = (T 'Şehir merkezi' 'City center'); selcuk = (T 'Selçuk (Efes)' 'Selçuk (Ephesus)') }
foreach ($city in $Churches.cities) {
  $lab = $city.label; $cityName = $city.name -replace ' \(.*\)$', ''
  $cityEn = if ($city.nameEn) { $city.nameEn } else { $cityName }
  [void]$cmCities.Append("<g class=`"cmap-city`" data-city=`"$($city.id)`" data-open=`"$($city.open)`" $(Cm-Pin $city.lat $city.lon) tabindex=`"0`" role=`"button`" aria-haspopup=`"true`" aria-expanded=`"false`" aria-controls=`"cmap-pop-$($city.id)`" $(TA 'aria-label' "$($city.name): kiliseleri göster" "$($cityEn): show its churches")>" +
    "<circle class=`"cc-hit`" r=`"18`"></circle><circle class=`"cc-glow`" r=`"13`"></circle><circle class=`"cc-dot`" r=`"5.5`"></circle>" +
    "<text class=`"cc-name`" x=`"$($lab[0])`" y=`"$($lab[1])`" text-anchor=`"$($lab[2])`">$(TS $cityName $cityEn)</text></g>")
  $li = { param($list) ($list | ForEach-Object { "<li><a href=`"kilise/$($_.id).html`">$(T (Inline $_.short) (Inline $_.shortEn))</a></li>" }) -join '' }
  $sides = @($city.churches | Where-Object { $_.side } | ForEach-Object { $_.side } | Select-Object -Unique)
  if ($sides.Count -gt 1) {
    $cols = ($sides | ForEach-Object { ,@($_, $SideLabel[$_]) } | ForEach-Object {
      $s = $_; $in = @($city.churches | Where-Object { $_.side -eq $s[0] }); $long = if ($in.Count -gt 12) { ' is-long' } else { '' }
      $rows = if ($long) { " style=`"--rows:$([Math]::Ceiling($in.Count / 2))`"" } else { '' }
      "<div class=`"cmap-pop-col$long`"><p class=`"cmap-pop-h`">$($s[1])</p><ul$rows>$(& $li $in)</ul></div>"
    }) -join ''
  } else { $cols = "<div class=`"cmap-pop-col`"><ul>$(& $li @($city.churches))</ul></div>" }
  [void]$cmPops.Append("<div class=`"cmap-pop`" id=`"cmap-pop-$($city.id)`" role=`"group`" $(TA 'aria-label' "$($city.name) kiliseleri" "Churches in $cityEn") hidden><p class=`"cmap-pop-t`">$(T $city.name $cityEn)</p><div class=`"cmap-pop-cols`">$cols</div></div>")
}
$cmTexts = (@(
  @{ t = 'Karadeniz'; e = 'Black Sea'; lat = 42.55; lon = 34.6 }
  @{ t = 'Akdeniz'; e = 'Mediterranean Sea'; lat = 35.25; lon = 31.2 }
) | ForEach-Object { "<text class=`"cm-sea`" $(Cm-Pin $_.lat $_.lon)>$(TS $_.t $_.e)</text>" }) -join ''
$cmBox = $CmShape.box
$churchMapHtml = @"
<section class="cmap" id="harita" $(TA 'aria-label' 'Kilise haritası' 'Church map')>
  <div class="cmap-frame">
    <svg class="cmap-svg" viewBox="0 0 $($AnShape.W) $($AnShape.H)" role="group" $(TA 'aria-label' "Türkiye$($Apos)deki Katolik kiliselerinin haritası: bir şehir seçin" 'Map of the Catholic churches in Turkey: choose a city')>
      <defs><clipPath id="cmap-out"><path clip-rule="evenodd" d="M-500-500H1500V1100H-500ZM$($cmBox[0]) $($cmBox[1])H$($cmBox[2])V$($cmBox[3])H$($cmBox[0])Z"></path></clipPath></defs>
      <rect class="cmap-sea" x="-500" y="-500" width="2000" height="1600"></rect>
      <path class="cmap-land" d="$($AnShape.land)"></path>
      <path class="cmap-tr" d="$($AnShape.turkey)" clip-path="url(#cmap-out)"></path>
      <path class="cmap-tr" d="$($CmShape.marmara)"></path>
      <path class="cmap-lake" d="$($AnShape.lakes)"></path>
      <g class="cmap-texts" aria-hidden="true">$cmTexts</g>
      <g class="cmap-cities">$($cmCities.ToString())</g>
    </svg>
    $($cmPops.ToString())
  </div>
</section>
"@
# ---------------- The same churches as a dropdown list under the map, grouped by city (and by side
# of the city where it has two): choosing one opens its page (script.js, initChurchPick). One list
# per language; the page shows the one in the language being read
$PickSide = @{ avrupa = @('Avrupa Yakası', 'European side'); anadolu = @('Anadolu Yakası', 'Asian side'); merkez = @('Şehir merkezi', 'City center'); selcuk = @('Selçuk (Efes)', 'Selçuk (Ephesus)') }
function Church-Pick([string]$lang) {
  $en = $lang -eq 'en'; $ix = if ($en) { 1 } else { 0 }
  $sb = New-Object Text.StringBuilder
  foreach ($city in $Churches.cities) {
    $cn = $city.name -replace ' \(.*\)$', ''; if ($en -and $city.nameEn) { $cn = $city.nameEn }
    $sides = @($city.churches | Where-Object { $_.side } | ForEach-Object { $_.side } | Select-Object -Unique)
    if ($sides.Count -lt 2) { $sides = @('') }
    foreach ($sd in $sides) {
      $list = if ($sd) { @($city.churches | Where-Object { $_.side -eq $sd }) } else { @($city.churches) }
      $gl = if ($sd) { "$cn · $($PickSide[$sd][$ix])" } else { $cn }
      [void]$sb.Append("<optgroup label=`"$(Attr $gl)`">")
      foreach ($ch in $list) { $nm = if ($en -and $ch.shortEn) { $ch.shortEn } else { $ch.short }; [void]$sb.Append("<option value=`"$($ch.id)`">$(Attr (Plain $nm))</option>") }
      [void]$sb.Append('</optgroup>')
    }
  }
  $groups = $sb.ToString()
  $id = "ch-pick-$lang"
  $label = if ($en) { 'Or choose from the list' } else { 'Ya da listeden seçin' }
  $ph = if ($en) { 'Choose a church…' } else { 'Bir kilise seçin…' }
  $go = if ($en) { 'Go' } else { 'Git' }
  return "<form class=`"ch-pick`" data-ch-pick action=`"#`"><label for=`"$id`">$label</label><div class=`"ch-pick-row`"><select id=`"$id`" name=`"kilise`" required><option value=`"`" selected disabled>$ph</option>$groups</select><button type=`"submit`" class=`"btn`">$go</button></div></form>"
}
$churchPickHtml = TB (Church-Pick 'tr') (Church-Pick 'en')
$kiliselerBody = @"
<div class="wrap narrow">
  $(Crumbs 'Kilise Bul')
  <header class="page-head center">$(Page-Ico $IcoChurch)<h1>$(T $Churches.title $Churches.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($Churches.en)</p>")</header>
$churchMapHtml
  $churchPickHtml
  <p class="conventions">$(T (Inline $Churches.note) (Inline $Churches.noteEn))</p>
  <div class="faq-list">
    <details class="faq-item" id="katolik-bulunamadiginda" open><summary><span class="faq-q">$(T 'Yakınımda Katolik kilisesi yoksa ne yapmalıyım?' 'What if there is no Catholic church near me?')</span>$IcoChevLg</summary>
      <div class="faq-a"><p>$(T (Inline $Churches.orthodoxNote) (Inline $Churches.orthodoxNoteEn))</p></div></details>
  </div>
</div>
"@
Write-Page -File 'kiliseler.html' -Title "$($Churches.title) | $SiteName" -TitleEn "$($Churches.en) | $SiteName" `
  -Description "Türkiye$($Apos)deki Katolik kiliseleri haritası: Latin, Ermeni, Süryani ve Keldani Katolik kiliseleri; ayin ve ziyaret saatleri, adres ve tarihçe." -DescriptionEn "Map of Catholic churches in Turkey: Latin, Armenian, Syriac and Chaldean Catholic churches, with Mass times, visiting hours, addresses and history." `
  -Path 'kiliseler.html' -Body $kiliselerBody -JsonLd @((Breadcrumb-Ld 'Kilise Bul' 'kiliseler.html'))

# ================================================================== ILETISIM (iletisim.html)
$cfMsgs = @(
  @('ok', 'Teşekkürler, mesajınız bize ulaştı. En kısa sürede yanıt vereceğim.', 'Thank you, your message has reached us. I will reply as soon as I can.'),
  @('fields', 'Lütfen geçerli bir e-posta adresi ve bir mesaj yazın.', 'Please enter a valid email address and a message.'),
  @('check', 'Güvenlik doğrulaması tamamlanamadı. Lütfen kutunun yüklenmesini bekleyip yeniden deneyin.', 'The security check could not be completed. Please wait for the box to load and try again.'),
  @('error', 'Mesajınız şu an gönderilemedi. Lütfen biraz sonra yeniden deneyin.', 'Your message could not be sent just now. Please try again a little later.'))
$cfMsgHtml = ($cfMsgs | ForEach-Object { "<p class=`"cf-msg cf-$($_[0])`" data-msg=`"$($_[0])`" hidden>$(T $_[1] $_[2])</p>" }) -join ''
$iletisimBody = @"
<div class="wrap narrow">
  $(Crumbs 'İletişim')
  <header class="page-head center">$(Page-Ico $IcoMail)<h1>$(T 'İletişim' 'Contact')</h1></header>
  <div class="contact-wrap">
    <div class="contact-intro">$ContactIntro</div>
    <form class="cform" id="mesaj" action="/api/contact" method="post">
      <div class="cf-row">
        <label class="cf-field"><span class="cf-label">$(T 'Adınız' 'Your name') <em>$(T '(isteğe bağlı)' '(optional)')</em></span><input type="text" name="name" autocomplete="name" maxlength="100"></label>
        <label class="cf-field"><span class="cf-label">$(T 'E-posta adresiniz' 'Your email address')</span><input type="email" name="email" autocomplete="email" maxlength="200" required></label>
      </div>
      <label class="cf-field"><span class="cf-label">$(T 'Mesajınız' 'Your message')</span><textarea name="message" rows="7" minlength="5" maxlength="5000" required></textarea></label>
      <div class="cf-trap" aria-hidden="true"><label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
      <input type="hidden" name="lang" value="tr">
      <div class="cf-turnstile" data-sitekey="$TurnstileSiteKey" data-theme="auto" data-size="flexible"></div>
      <div class="cf-foot">
        <button type="submit" class="btn cf-send">$IcoMail<span>$(T 'Gönder' 'Send')</span></button>
        <p class="cf-note">$(T 'E-posta adresiniz yalnızca size yanıt vermek için kullanılır. Ayrıntılar: <a href="gizlilik.html" data-no-dlg>Gizlilik Politikası</a>.' 'Your email address is used only to reply to you. Details: <a href="gizlilik.html" data-no-dlg>Privacy Policy</a>.')</p>
      </div>
      <div class="cf-status" role="status" aria-live="polite">$cfMsgHtml</div>
      <noscript><p class="cf-msg cf-error">$(T 'Formun çalışması için JavaScript gerekir.' 'The form needs JavaScript to work.')</p></noscript>
    </form>
    <div class="contact-outro">$ContactOutro</div>
  </div>
</div>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
"@
Write-Page -File 'iletisim.html' -Title "İletişim | $SiteName" -TitleEn "Contact | $SiteName" `
  -Description "katolikdunyasi.com$($Apos)a nasıl ulaşabileceğiniz: çeviri düzeltmeleri, içerik önerileri ve sorularınız için iletişim formu." -DescriptionEn "How to reach katolikdunyasi.com: a contact form for translation corrections, content suggestions and your questions." `
  -Path 'iletisim.html' -Body $iletisimBody -JsonLd @((Breadcrumb-Ld 'İletişim' 'iletisim.html'))

# ================================================================== ERISILEBILIRLIK (erisilebilirlik.html)
$erBody = @"
<div class="wrap narrow">
  $(Crumbs 'Erişilebilirlik')
  <header class="page-head center">$(Page-Ico $IcoA11yPerson)<h1>$(T $ErMeta.title $ErEn.meta.title)</h1><p class="sub">$(T $ErMeta.subtitle $ErEn.meta.subtitle)</p></header>
  <div class="body prose">$(TB (Convert-Markdown $Er.body) (Convert-Markdown $ErEn.body))</div>
</div>
"@
Write-Page -File 'erisilebilirlik.html' -Title "$($ErMeta.title) | $SiteName" -TitleEn "$($ErEn.meta.title) | $SiteName" -Description $ErMeta.description -DescriptionEn $ErEn.meta.description `
  -Path 'erisilebilirlik.html' -Body $erBody -JsonLd @((Breadcrumb-Ld 'Erişilebilirlik' 'erisilebilirlik.html'))

# ================================================================== GIZLILIK (gizlilik.html)
$gzBody = @"
<div class="wrap narrow">
  $(Crumbs 'Gizlilik Politikası')
  <header class="page-head center">$(Page-Ico $IcoShield)<h1>$(T $GzMeta.title $GzEn.meta.title)</h1><p class="sub">$(T $GzMeta.subtitle $GzEn.meta.subtitle)</p></header>
  <div class="body prose">$(TB (Convert-Markdown $Gz.body) (Convert-Markdown $GzEn.body))</div>
</div>
"@
Write-Page -File 'gizlilik.html' -Title "$($GzMeta.title) | $SiteName" -TitleEn "$($GzEn.meta.title) | $SiteName" -Description $GzMeta.description -DescriptionEn $GzEn.meta.description `
  -Path 'gizlilik.html' -Body $gzBody -JsonLd @((Breadcrumb-Ld 'Gizlilik Politikası' 'gizlilik.html'))

# ================================================================== KAYNAKLAR VE TELIF (kaynaklar-ve-telif.html)
# The same text as the footer's "Kaynaklar ve telif" popup, as a page of its own for search
# engines, shared links and visitors without JavaScript
$ArtListHtml = (($Tablolar.art.PSObject.Properties | Sort-Object { $_.Value.a }, { $_.Value.t }) | ForEach-Object {
  $a = $_.Value
  "<li><span><a href=`"$($a.src)`" target=`"_blank`" rel=`"noopener`">$(T "<cite>$($a.t)</cite>" "<cite>$($a.te)</cite>")</a><br>$($a.a) · $(T $a.loc $a.loce)</span></li>"
}) -join ''
$seenImg = @{}
$TarihListHtml = (($Tarih.items | ForEach-Object { $_.img } | Where-Object { if ($seenImg[$_]) { $false } else { $seenImg[$_] = 1; $true } }) | ForEach-Object {
  $g = $TarihImg.$_
  if ($g) { "<li><span><a href=`"$($g.src)`" target=`"_blank`" rel=`"noopener`"><cite>$(Attr $g.t)</cite></a><br>$(Attr $g.a) · $($g.lic)</span></li>" }
}) -join ''
$PortraitListHtml = ($GreatSaints.saints | ForEach-Object {
  $p = $SaintPortraits.($_.id)
  if ($p) { "<li><span><a href=`"$($p.src)`" target=`"_blank`" rel=`"noopener`">$(Inline $_.name)</a><br>$($p.t) · $($p.lic)</span></li>" }
}) -join ''
$ktBody = @"
<div class="wrap narrow">
  $(Crumbs $fm['title'])
  <header class="page-head center">$(Page-Ico $IcoBook)<h1>$(T $fm['title'] $fmEn['title'])</h1></header>
  <div class="body prose">$(TB $InfoHtml $InfoHtmlEn)
  <h2 id="tablolar">$(T 'Tablolar' 'Paintings')</h2>
  <p>$(T 'Sayfa başlıklarında, bölümlerde ve ana sayfada kullanılan tablolar. Hepsi kamu malıdır; bağlantılar görüntülerin alındığı sayfaları açar.' 'The paintings used in the page headers and on the home page. All are in the public domain; the links open the Web Gallery of Art pages the images come from.')</p>
  <ul class="art-list">$ArtListHtml</ul>
  <h2 id="tarih-gorselleri">Kilise’nin tarihi görselleri</h2>
  <p>Kilise’nin tarihi sayfasındaki ve ana sayfa şeridindeki görseller, sırasıyla. Kamu malı olmayanlar, belirtilen Creative Commons lisansıyla ve sahiplerinin adıyla kullanılır.</p>
  <ul class="art-list">$TarihListHtml</ul>
  <h2 id="aziz-portreleri">Aziz portreleri</h2>
  <p>Azizler sayfasındaki en bilinen yirmi azizin portreleri. Creative Commons lisanslı olanlar, lisansları ve kaynak sayfaları belirtilerek kullanılır.</p>
  <ul class="art-list">$PortraitListHtml</ul></div>
</div>
"@
Write-Page -File 'kaynaklar-ve-telif.html' -Title "$($fm['title']) | $SiteName" -TitleEn "$($fmEn['title']) | $SiteName" -Description $fm['description'] -DescriptionEn $fmEn['description'] `
  -Path 'kaynaklar-ve-telif.html' -Body $ktBody -JsonLd @((Breadcrumb-Ld $fm['title'] 'kaynaklar-ve-telif.html'))

# ================================================================== 404.html (served by GitHub Pages for unknown URLs)
$notFoundBody = @"
<div class="wrap narrow">
  <section class="hero">
    $Logo
    <p class="label">404</p>
    <h1>$(T 'Sayfa bulunamadı' 'Page not found')</h1>
    <p class="hint">$(T 'Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir. Bir soru arayın ya da ana sayfaya dönün.' 'The page you were looking for may have moved, or may never have existed. Search for a question, or go back to the home page.')</p>
    $(Search-Form 'hero-search' 'q-404' '598 soruda ara' 'tr' 'Search 598 questions')
    <p class="about-link"><a class="btn" href="index.html">$(T 'Ana sayfaya dön' 'Back to the home page')</a></p>
  </section>
</div>
"@
Write-Page -File '404.html' -Title "Sayfa bulunamadı | $SiteName" -TitleEn "Page not found | $SiteName" -Description 'Sayfa bulunamadı.' -Path '404.html' -Body $notFoundBody `
  -Robots 'noindex' -Canonical $false -RootRelative $true

# ---------------- index.html / en/index.html: the home page
# Phones: an iPhone-like home screen. Today's saint, the date with the liturgical season (the card
# takes the season's colour) and the day's rosary mysteries, then four app icons: Ara opens the
# Katekizm search over the blurred screen, and Öğren, Dua Et and Keşfet open Settings-style pages
# listing their pages, with each page's own sections one level further in (see initHome). Tartış
# (İslam'a Cevap) took Ara's place; the Katekizm's own pages keep their search.
# Desktop: the same three cards in a row, a search bar, and the three lists side by side.
# Each page's own content, down to single questions and prayers, is laid out in the browser from
# the site's data files once a page is opened in its app (initHomeTree in assets/script.js).
$HomeApps = @(
  @{ id = 'ogren'; t = 'Öğren'; te = 'Learn'; s = 'İnancın ne olduğu ve nedeni'; se = 'What the faith is, and why'; ico = $SmallCross; pages = @(
    @{ f = 'neden-katoligiz.html'; ico = $IcoCompass; t = 'Neden Katoliğiz?'; te = "Why We're Catholic"
       s = 'Tanrı var mı, İsa kim, neden Katolik Kilise? Kısa cümlelerle.'; se = 'Is there a God, who is Jesus, why the Catholic Church? In short sentences.' },
    @{ f = 'katekizm.html'; ico = $SmallCross; t = 'Katekizm'; te = 'Catechism'
       s = 'İman, kutsal sırlar, ahlak ve dua üzerine 598 soru ve yanıt.'; se = '598 questions and answers on faith, the sacraments, morality and prayer.' },
    @{ f = 'kutsal-kitap.html'; ico = $IcoBook; t = 'Kutsal Kitap'; te = 'The Bible'; s = $KkMeta.short; se = $KkEn.meta.short },
    @{ f = 'sss.html'; ico = $IcoAsk; t = 'Sorular'; te = 'FAQ'
       s = 'Katolik inancı üzerine en sık sorulan sorular.'; se = 'The most common questions about the Catholic faith.' },
    @{ f = 'katolik-sureci.html'; ico = $IcoWay; t = 'Katolik Olma Süreci'; te = 'Becoming Catholic'
       s = 'Katolik olmak isteyenler için OCIA süreci, adım adım.'; se = 'The OCIA process for those who want to become Catholic, step by step.' },
    @{ f = 'meseller.html'; ico = $IcoScroll; t = "İsa$($Apos)nın Meselleri"; te = 'The Parables of Jesus'
       s = 'Otuz iki mesel, düz bir dille açıklanmış.'; se = 'Thirty-two parables, plainly explained.' }) },
  @{ id = 'tartis'; t = 'Tartış'; te = 'Debate'; s = 'İtirazlara cevap, inancın savunusu'; se = 'Answers to objections, a defense of the faith'; ico = $IcoDebate; pages = @(
    @{ f = 'islama-cevap.html'; ico = $IcoAnswer; t = "İslam$($Apos)a Cevap"; te = 'Answering Islam'
       s = "İslam$($Apos)ın iddiaları, Kur$($Apos)an ve hadislerle sınanıyor."; se = "Islam's claims, tested by the Qur'an and the hadith." },
    @{ f = 'ateizme-cevap.html'; ico = $IcoCosmos; t = 'Ateizme Cevap'; te = 'Answering Atheism'
       s = 'Tanrı var mı? Ateizm, akıl ve kanıtla sınanıyor.'; se = 'Does God exist? Atheism, tested by reason and evidence.' }) },
  @{ id = 'dua'; t = 'Dua Et'; te = 'Pray'; s = 'Ayin, tesbih ve günlük dualar'; se = 'The Mass, the Rosary and daily prayers'; ico = $TbChurch; pages = @(
    @{ f = 'kutsal-ayin.html'; ico = $IcoChalice; t = 'Kutsal Ayin'; te = 'The Mass'
       s = 'Ayinin sırası, toplanmadan son takdise altı bölüm.'; se = 'The order of the Mass, in six parts.' },
    @{ f = 'tesbih-duasi.html'; ico = $IcoBeads; t = 'Tesbih Duası'; te = 'The Rosary'
       s = 'Duaların Türkçesi ve İngilizcesi, bütün gizemleriyle.'; se = 'The prayers and all four sets of mysteries.' },
    @{ f = 'ekler.html'; ico = $IcoPrayers; t = 'Sık Kullanılan Dualar'; te = 'Common Prayers'
       s = 'Günlük dualar ve formüller, tek sayfada.'; se = 'Daily prayers and formulas of Catholic doctrine, on one page.' },
    @{ f = 'gunah-cikarma.html'; ico = $IcoKey; t = 'Günah Çıkarma'; te = 'Confession'
       s = 'Nasıl işler, adım adım; vicdan muhasebesi ve sık sorulan sorular.'; se = 'How it works, step by step; an examination of conscience and common questions.' }) },
  @{ id = 'kesfet'; t = 'Keşfet'; te = 'Explore'; s = 'Azizler, mucizeler ve bu toprakların kökleri'; se = "Saints, miracles and our faith's roots in this land"; ico = $IcoCompass; pages = @(
    @{ f = 'azizler.html'; ico = $IcoStar; t = 'Azizler'; te = 'Saints'
       s = 'Bugünün azizini görün, yılın her günü için hayat hikâyeleri.'; se = 'A saint for every day of the year, and the twenty best-known names.' },
    @{ f = 'mucizeler.html'; ico = $IcoRadiance; t = 'Mucizeler'; te = 'Miracles'
       s = 'Meryem Ana görünmeleri, Torino Kefeni, Efkaristiya mucizeleri ve çürümeyen azizler.'; se = 'Marian apparitions, the Shroud of Turin, Eucharistic miracles and the incorrupt saints.' },
    @{ f = 'topraklarimizda-hristiyanlik.html'; ico = $IcoRoots; t = 'Topraklarımızda Hristiyanlık'; te = 'Christianity in Anatolia'
       s = "Pavlus$($Apos)un memleketi, Vahiy$($Apos)in yedi kilisesi, İznik Konsili."; se = "Paul's homeland, the seven churches of Revelation, the Council of Nicaea." },
    @{ f = 'kilise-tarihi.html'; ico = $IcoHourglass; t = "Kilise$($Apos)nin Tarihi"; te = 'History of the Church'
       s = 'Pentikost$($Apos)tan II. Vatikan Konsili$($Apos)ne, iki bin yıl.'; se = 'From Pentecost to the Second Vatican Council, two thousand years in brief.' },
    @{ f = 'kiliseler.html'; ico = $IcoPin; t = 'Kilise Bul'; te = 'Find a Church'
       s = "Türkiye$($Apos)de ayine gidebileceğiniz kiliseler, şehir şehir."; se = 'Catholic churches in Turkey where you can attend Mass, city by city.' }) }
)

# The faint religious images in the corners of the home page's three cards
$DecoSvg = { param($d) "<svg class=`"hm-deco`" viewBox=`"0 0 64 64`" aria-hidden=`"true`" fill=`"none`" stroke=`"currentColor`" stroke-width=`"2.2`" stroke-linecap=`"round`" stroke-linejoin=`"round`">$d</svg>" }
$DecoDove = & $DecoSvg '<path d="M32 42c-2.6 0-4.6-2-4.6-4.6 0-4.2 2.4-8.6 4.6-12.6 2.2 4 4.6 8.4 4.6 12.6 0 2.6-2 4.6-4.6 4.6Z"/><path d="M28 30c-6-4.6-14.6-5.6-22-2.6 7.2 1 13.4 4.2 19 9"/><path d="M36 30c6-4.6 14.6-5.6 22-2.6-7.2 1-13.4 4.2-19 9"/><path d="M29.4 22.6 32 18l2.6 4.6"/><circle cx="32" cy="46" r="2.6"/><path d="M32 51v7M25 50l-3.6 6M39 50l3.6 6M20 46l-5.4 3.4M44 46l5.4 3.4"/>'
$DecoCross = & $DecoSvg '<path d="M32 6v52M18 20h28"/><path d="M32 20m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0" stroke-width="1.4"/><path d="M26 58h12" stroke-width="1.6"/>'
$DecoChalice = & $DecoSvg '<circle cx="32" cy="9" r="5"/><path d="M32 6.4v5.2M29.4 9h5.2" stroke-width="1.4"/><path d="M18 18h28c0 11-5.6 18-14 18S18 29 18 18Z"/><path d="M32 36v12"/><path d="M22 58c0-5.6 4.4-10 10-10s10 4.4 10 10Z"/>'
$IcoChevR = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>'
# The home page's saint and mystery cards take the painting of the day's saint page (Azizler's
# when the saint has none) and of the day's mysteries; script.js picks it from these maps
$SaintArtJson = '{' + (($Tablolar.pages.PSObject.Properties | ForEach-Object { "`"$($_.Name)`":`"$($_.Value)`"" }) -join ',') + ',"*":"05franc"}'
$SetArtJson = '{"sevinc":"66annunc","isik":"47emmau","aci":"55flagel","yucelik":"45death","*":"58rosar"}'
function Home-Page([string]$lang) {
  # Every text in both languages (T), the TR | EN switch shows one
  function L([string]$tr, [string]$enText) { T $tr $enText }
  function F([string]$f) { $f }
  $loading = L 'Yükleniyor…' 'Loading…'
  $cards = @"
  <div class="hm-today" id="bugun">
    <a class="hm-card hm-saint" href="$(F 'azizler.html')" data-home-saint data-art-map="$(Attr $SaintArtJson)"><span class="hm-art" aria-hidden="true"></span>$DecoChalice
      <span class="hm-label">$IcoStar $(L 'Bugünün Azizi' 'Saint of the Day')</span>
      <span class="hm-sn" data-hs-name>$loading</span><span class="hm-sub" data-hs-title></span><span class="hm-bio" data-hs-bio></span>
      <span class="hm-go">$(L 'Hayatını oku' 'Read their life') $IcoChevR</span>
    </a>
    <div class="hm-card hm-date" data-home-lit>$(Art-Img '13fligh' 'hm-art' '(min-width: 980px) 40vw, 100vw' 'high')$DecoDove
      <span class="hm-label">$(L 'Bugün' 'Today')</span>
      <span class="hm-day" data-hd-day>$loading</span><span class="hm-year" data-hd-year></span><time class="hm-time" data-hd-time></time>
      <span class="hm-season" data-hd-season></span><span class="hm-sub" data-hd-colour></span>
    </div>
    <a class="hm-card hm-myst" href="$(F 'tesbih-duasi.html')#tesbih-rehberi" data-home-mystery data-art-map="$(Attr $SetArtJson)"><span class="hm-art" aria-hidden="true"></span>$DecoCross
      <span class="hm-label">$IcoBeads $(L 'Günün Gizemi' 'Mysteries')</span>
      <span class="hm-mn" data-hm-name>$loading</span><span class="hm-sub" data-hm-days></span>
      <span class="hm-go">$(L 'Tesbihe başla' 'Pray the Rosary') $IcoChevR</span>
    </a>
  </div>
"@
  $placeholder = "Katekizm$($Apos)de ara: Türkçe, İngilizce ya da soru numarası"
  $searchDesk = "<div class=`"hm-search`">$(Search-Form 'hm-search-form' 'q-home' $placeholder 'tr' 'Search the Catechism: English, Turkish or a question number')</div>"
  # Desktop lists
  $cols = ($HomeApps | ForEach-Object {
    $app = $_
    $rows = ($app.pages | ForEach-Object { "<a class=`"hm-row`" href=`"$(F $_.f)`"><span class=`"hm-ri`">$($_.ico)</span><span class=`"hm-rt`"><span class=`"hm-t`">$(L $_.t $_.te)</span><span class=`"hm-s`">$(L $_.s $_.se)</span></span>$IcoChevR</a>" }) -join ''
    "<section class=`"hm-col`"><h2>$(L $app.t $app.te)</h2><div class=`"hm-list`">$rows</div></section>"
  }) -join ''
  # Desktop, under the search: "Choose your own path" (five starting points, each with the pages
  # that answer it), a featured article, a quotation and the great saints beside it, and a short
  # timeline of the Church's history whose stops open the pages that tell them.
  $jSteps = @(
    @{ t = 'Merak ediyorum'; te = "I'm curious"; d = "Tanrı var mı, İsa kim, neden Katolik Kilise?"; de = 'Is there a God, who is Jesus, why the Catholic Church?'
       l = @(@('neden-katoligiz.html', 'Neden Katoliğiz?', "Why We're Catholic"), @('ateizme-cevap.html', 'Ateizme Cevap', 'Answering Atheism'), @('mucizeler.html', 'Mucizeler', 'Miracles')) },
    @{ t = 'Sorularım var'; te = 'I have questions'; d = "En çok sorulan sorular ve Kilise$($Apos)nin öğretisi."; de = 'The most common questions, and what the Church teaches.'
       l = @(@('sss.html', 'Sorular', 'FAQ'), @('katekizm.html', 'Katekizm', 'Catechism'), @('kutsal-kitap.html', 'Kutsal Kitap', 'The Bible'), @('islama-cevap.html', "İslam$($Apos)a Cevap", 'Answering Islam')) },
    @{ t = 'Katolik olmak istiyorum'; te = 'I want to become Catholic'; d = 'Vaftizli ya da vaftizsiz, süreç adım adım.'; de = 'Baptized or not, the process step by step.'
       l = @(@('katolik-sureci.html', 'Katolik Olma Süreci', 'Becoming Catholic'), @('kiliseler.html', 'Kilise Bul', 'Find a Church')) },
    @{ t = 'Dua etmek istiyorum'; te = 'I want to pray'; d = 'Tesbih, Ayin ve günlük dualar.'; de = 'The Rosary, the Mass and daily prayers.'
       l = @(@('tesbih-duasi.html', 'Tesbih Duası', 'The Rosary'), @('kutsal-ayin.html', 'Kutsal Ayin', 'The Mass'), @('ekler.html', 'Sık Kullanılan Dualar', 'Common Prayers')) },
    @{ t = 'Yeniden başlamak istiyorum'; te = 'I want to start again'; d = 'Yıllardır gitmediyseniz bile kapı açık.'; de = "Even if it's been years, the door is open."
       l = @(@('gunah-cikarma.html', 'Günah Çıkarma', 'Confession'), @('meseller.html#musrif-ogul', 'Müsrif Oğul', 'The Prodigal Son')) }
  )
  $n = 0
  $stepsHtml = ($jSteps | ForEach-Object {
    $n++
    $links = ($_.l | ForEach-Object { "<a href=`"$($_[0])`">$(L $_[1] $_[2])$IcoChevR</a>" }) -join ''
    "<li class=`"hj-step`"><span class=`"hj-dot`" aria-hidden=`"true`">$n</span><div><h3 class=`"hj-st`">$(L $_.t $_.te)</h3><p>$(L $_.d $_.de)</p><div class=`"hj-links`">$links</div></div></li>"
  }) -join ''
  # The Church's history as a strip of small round pictures, oldest first (data/kilise-tarihi.json):
  # each with its year, title and a short line; hovering or focusing one shows the longer text,
  # clicking it opens the event on kilise-tarihi.html. A scale of dates and a slider under the
  # strip move along it; a mouse can drag it sideways (script.js, initHistory)
  $tlItems = New-Object System.Collections.Generic.List[string]; $n = 0
  $tlMarks = @(0, 18, 31, 36, 48, 61)
  $tlTicks = New-Object System.Collections.Generic.List[string]
  foreach ($it in $Tarih.items) {
    $yr = [regex]::Match($it.y, '\d+').Value
    if ($tlMarks -contains $n) { $tlTicks.Add("<button type=`"button`" class=`"hx-tick`" data-hx-to=`"$n`" style=`"left:$([math]::Round($n * 100 / ($Tarih.items.Count - 1), 2))%`" aria-label=`"$yr yılına git`">$yr</button>") }
    $n++
    $tlItems.Add("<li class=`"hx-it`" data-y=`"$yr`"><a class=`"hx-a`" href=`"kilise-tarihi.html#olay-$n`"><span class=`"hx-ph`"><img src=`"assets/art/tl/$($it.img).jpg`" alt=`"`" width=`"600`" height=`"400`" loading=`"lazy`" decoding=`"async`" draggable=`"false`"></span>" +
      "<span class=`"hx-y`">$($it.y)</span><span class=`"hx-t`">$($it.t)</span><span class=`"hx-s`">$($it.s)</span></a><span class=`"hx-d`" hidden>$($it.d)</span></li>")
  }
  $gsHtml = (($GreatSaints.saints | Select-Object -First 10) | ForEach-Object { "<a href=`"$($_.id).html`">$(L $_.name $_.en)</a>" }) -join ''
  $lists = @"
<div class="hm-journey">
  <div class="hj-grid">
    <section class="hj-debate" aria-labelledby="hj-h"><p class="hj-kick">Tartış</p><h2 class="hj-h" id="hj-h">Sorular ve itirazlar</h2>
      <div class="hd-grid">
        <a class="hd-card" href="islama-cevap.html">$(Art-Img 'w-sultan' 'hd-art' '(min-width: 980px) 24vw, 100vw')<span class="hd-t">İslam$($Apos)a Cevap</span><span class="hd-d">Kur$($Apos)an, hadisler ve İslam tarihi ışığında Hristiyanlığa yöneltilen sorulara cevaplar.</span><span class="hd-more">Okuyun$IcoChevR</span></a>
        <a class="hd-card" href="ateizme-cevap.html">$(Art-Img '34thomas' 'hd-art' '(min-width: 980px) 24vw, 100vw')<span class="hd-t">Ateizme Cevap</span><span class="hd-d">Tanrı var mı, İsa dirildi mi? Aklın ve tarihin söyledikleri.</span><span class="hd-more">Okuyun$IcoChevR</span></a>
      </div>
    </section>
    <aside class="hj-aside">
      <a class="hj-feat" href="tesbih-tarihi.html">$(Art-Img '42loreto' 'hj-art' '30vw')<span class="hj-kick">$(L 'Öne çıkan yazı' 'Featured')</span><span class="hj-ft">$(L $RosaryHistory.title $RosaryHistory.en)</span><span class="hj-fd">$(L $RosaryHistory.lead $RosaryHistory.leadEn)</span><span class="hj-more">$(L 'Okuyun' 'Read')$IcoChevR</span></a>
      <figure class="hj-q"><blockquote><p>$(L '“Bizi kendin için yarattın ve kalbimiz sende huzur bulana dek huzursuzdur.”' '“You have made us for yourself, and our heart is restless until it rests in you.”')</p></blockquote><figcaption>$(L 'Aziz Augustinus, İtiraflar' 'St. Augustine, Confessions')</figcaption></figure>
      <div class="hj-saints"><p class="hj-kick">$(L 'En çok bilinen 20 aziz' 'The 20 best-known saints')</p><div>$gsHtml<a class="hj-all" href="azizler.html#buyuk-azizler">$(L 've diğerleri…' 'and more…')</a></div></div>
    </aside>
  </div>
  <section class="hx" aria-labelledby="hx-h">
    <div class="hx-head"><div><p class="hj-kick">Tarih</p><h2 class="hj-h" id="hx-h"><a class="hx-hl" href="kilise-tarihi.html">Kilise$($Apos)nin tarihi$IcoChevR</a></h2><p class="hx-lead">Havarilerden bugüne Kilise tarihinin önemli olayları.</p></div>
    <div class="hx-ctl"><button type="button" class="hx-btn" data-hx-step="-1" aria-label="Önceki"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg></button><button type="button" class="hx-btn" data-hx-step="1" aria-label="Sonraki">$IcoChevR</button></div></div>
    <ol class="hx-track" tabindex="0" aria-label="Kilise tarihi, $n olay, eskiden yeniye">$($tlItems -join '')</ol>
    <div class="hx-scale"><div class="hx-ticks">$($tlTicks -join '')</div>
      <input class="hx-range" type="range" min="0" max="1000" value="0" step="1" aria-label="Zaman çizelgesinde ilerle" aria-valuetext="33"></div>
  </section>
</div>
"@
  # Phone: the icons, the search overlay and the three apps
  # The bar at the foot of the home screen, as in the App Store: a glyph and a name for each app,
  # the open one in a capsule that glides to it (script.js moves .hm-pill)
  $dockGlyph = @{
    ara    = '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="10.4" cy="10.4" r="6.6"/><path d="m15.3 15.3 5.2 5.2"/></g></svg>'
    ogren  = '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor" transform="translate(2 2) scale(.2)">' + $CrossShapes + '</g></svg>'
    dua    = '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor"><circle cx="12" cy="3.4" r="1.25"/><circle cx="15.9" cy="4.5" r="1.25"/><circle cx="18.4" cy="7.6" r="1.25"/><circle cx="18.4" cy="11.4" r="1.25"/><circle cx="8.1" cy="4.5" r="1.25"/><circle cx="5.6" cy="7.6" r="1.25"/><circle cx="5.6" cy="11.4" r="1.25"/><circle cx="8.1" cy="14.4" r="1.25"/><circle cx="15.9" cy="14.4" r="1.25"/><circle cx="12" cy="15.6" r="1.6"/><rect x="11.25" y="17.2" width="1.5" height="5.6" rx=".4"/><rect x="9.6" y="18.6" width="4.8" height="1.4" rx=".4"/></g></svg>'
    tartis = '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor"><path d="M3.8 3.6h10.4a2 2 0 0 1 2 2v5.8a2 2 0 0 1-2 2H8.6l-4 3.2v-3.2h-.8a2 2 0 0 1-2-2V5.6a2 2 0 0 1 2-2Z"/><path d="M17.8 8.2h2.4a2 2 0 0 1 2 2v5.6a2 2 0 0 1-2 2h-.6V21l-3.8-3.2h-4.4a2 2 0 0 1-2-2v-1.4h4.8a3.6 3.6 0 0 0 3.6-3.6Z" opacity=".78"/></g></svg>'
    kesfet = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.2c.9 3.4 1.9 5.4 3.4 6.7 1.5 1.4 3.4 2.2 6.4 3.1-3 .9-4.9 1.7-6.4 3.1-1.5 1.3-2.5 3.3-3.4 6.7-.9-3.4-1.9-5.4-3.4-6.7-1.5-1.4-3.4-2.2-6.4-3.1 3-.9 4.9-1.7 6.4-3.1 1.5-1.3 2.5-3.3 3.4-6.7Z"/></svg>'
  }
  $icons = "<span class=`"hm-pill`" aria-hidden=`"true`"></span>" +
    (($HomeApps | ForEach-Object { "<button type=`"button`" class=`"hm-app`" data-app-open=`"$($_.id)`" aria-haspopup=`"dialog`" aria-controls=`"app-$($_.id)`"><span class=`"hm-icon`">$($dockGlyph[$_.id])</span><span class=`"hm-app-t`">$(L $_.t $_.te)</span></button>" }) -join '')
  $close = T 'Kapat' 'Close'
  $apps = ($HomeApps | ForEach-Object {
    $app = $_; $appT = T $app.t $app.te; $appA = TA 'aria-label' $app.t $app.te; $i = 0
    # Each row opens the page itself, which a phone shows as the next screen of this app
    $rows = ($app.pages | ForEach-Object {
      "<a class=`"ios-row`" href=`"$(F $_.f)`" data-app-page><span class=`"ios-ri`">$($_.ico)</span><span class=`"ios-rt`"><span class=`"ios-t`">$(L $_.t $_.te)</span><span class=`"ios-s`">$(L $_.s $_.se)</span></span>$IcoChevR</a>"
    }) -join ''
    $pagesHtml = "<section class=`"ios-page is-current`" data-page=`"root`"><header class=`"ios-nav`"><span></span><span class=`"ios-nt`">$appT</span><button type=`"button`" class=`"ios-done`" data-app-close>$close</button></header>" +
      "<div class=`"ios-scroll`"><h2 class=`"ios-large`">$appT</h2><p class=`"ios-lead`">$(L $app.s $app.se)</p><div class=`"ios-group`">$rows</div></div></section>"
    "<div class=`"ios-app`" id=`"app-$($app.id)`" data-app=`"$($app.id)`" role=`"dialog`" aria-modal=`"true`" $appA hidden><div class=`"ios-splash app-$($app.id)`">$($app.ico)</div><div class=`"ios-stack`">$pagesHtml</div></div>"
  }) -join "`n"
  $tag = T $SiteTag $SiteTagEn
  $body = @"
<div class="wrap home-v2">
  <h1 class="visually-hidden">$tag</h1>
  <div class="hm-about"><p class="hm-about-t">$tag</p><p class="hm-about-s">$(T $fm['about'] $fmEn['about'])</p></div>
$cards
  $searchDesk
  <nav class="hm-apps" $(TA 'aria-label' 'Bölümler' 'Sections')>$icons</nav>
  $lists
</div>
$apps
"@
  $homePath = ''
  $q = 'katekizm.html'
  $ld = '{"@context":"https://schema.org","@type":"WebSite","name":' + (JStr $SiteName) +
    ',"url":' + (JStr "$SiteUrl/$homePath") + ',"inLanguage":"tr","description":' + (JStr $SiteTag) + '}'
  Write-Page -File 'index.html' -Title "$SiteName | $SiteTag" -TitleEn "$SiteName | $SiteTagEn" `
    -Description "Türkçe Katolik Portalı: Katolik Kilisesi Katekizmi Özeti$($Apos)nin tam çevirisi ve Katolik inancı üzerine sıkça sorulan sorular." `
    -DescriptionEn "A Turkish Catholic portal in English and Turkish: the Compendium of the Catechism, the saints, prayers, the Mass, churches in Turkey and answers about the faith." `
    -Path '' -Body $body -JsonLd @($ld)
}
Home-Page 'tr'

# The Katekizm overview's old address (katesizm.html): forwards with any ?q= search and #question
$html = "<!DOCTYPE html>`n<html lang=`"tr`">`n<head>`n<meta charset=`"utf-8`">`n<title>Katekizm | $SiteName</title>`n<meta name=`"robots`" content=`"noindex`">`n" +
  "<link rel=`"canonical`" href=`"$SiteUrl/katekizm.html`">`n<meta http-equiv=`"refresh`" content=`"0; url=/katekizm.html`">`n" +
  "<script>location.replace('/katekizm.html' + location.search + location.hash)</script>`n</head>`n<body><p><a href=`"/katekizm.html`">Katekizm</a></p></body>`n</html>`n"
[IO.File]::WriteAllText((Join-Path $Root 'katesizm.html'), $html, $Utf8)

# ================================================================== sitemap.xml & robots.txt
$pages = @(
  @{ p = ''; pr = '1.0' }, @{ p = 'katekizm.html'; pr = '0.9' },
  @{ p = 'iman-ikrari.html'; pr = '0.9' }, @{ p = 'kutsal-sirlar.html'; pr = '0.9' },
  @{ p = 'mesihte-yasam.html'; pr = '0.9' }, @{ p = 'hristiyan-duasi.html'; pr = '0.9' }, @{ p = 'ekler.html'; pr = '0.8' },
  @{ p = 'kutsal-kitap.html'; pr = '0.9' }, @{ p = 'tesbih-duasi.html'; pr = '0.9' }, @{ p = 'tesbih-tarihi.html'; pr = '0.8' }, @{ p = 'katolik-sureci.html'; pr = '0.9' },
  @{ p = 'gunah-cikarma.html'; pr = '0.9' }, @{ p = 'topraklarimizda-hristiyanlik.html'; pr = '0.9' }, @{ p = 'kilise-tarihi.html'; pr = '0.8' },
  @{ p = 'neden-katoligiz.html'; pr = '0.9' }, @{ p = 'islama-cevap.html'; pr = '0.8' }, @{ p = 'ateizme-cevap.html'; pr = '0.8' },
  @{ p = 'azizler.html'; pr = '0.9' }, @{ p = 'kutsal-ayin.html'; pr = '0.9' },
  @{ p = 'sss.html'; pr = '0.9' }, @{ p = 'kiliseler.html'; pr = '0.7' }, @{ p = 'motu-proprio.html'; pr = '0.6' },
  @{ p = 'giris.html'; pr = '0.6' }, @{ p = 'mucizeler.html'; pr = '0.7' },
  @{ p = 'iletisim.html'; pr = '0.4' }, @{ p = 'meseller.html'; pr = '0.9' }, @{ p = 'erisilebilirlik.html'; pr = '0.3' },
  @{ p = 'gizlilik.html'; pr = '0.3' }, @{ p = 'kaynaklar-ve-telif.html'; pr = '0.3' }
) + ($GreatSaints.saints | ForEach-Object { @{ p = "$($_.id).html"; pr = '0.6' } }) + ($ChurchPages | ForEach-Object { @{ p = $_; pr = '0.5' } })
# Both languages, each address listing its twin (hreflang) so search engines pair them. <lastmod>
# is the date the page's data last changed in git (Page-LastMod), never simply the build date.
$smUrls = foreach ($pg in $pages) {
  $tr = if ($pg.p) { $pg.p } else { 'index.html' }
  $trU = "$SiteUrl/$($pg.p)"
  $enF = En-Of $tr
  $lm = Page-LastMod $tr
  $lmTag = if ($lm) { "<lastmod>$lm</lastmod>" } else { '' }
  if (-not $enF) { "  <url><loc>$trU</loc>$lmTag</url>"; continue }
  $enU = "$SiteUrl/$(Page-Path $enF)"
  $alts = "<xhtml:link rel=`"alternate`" hreflang=`"tr`" href=`"$trU`"/><xhtml:link rel=`"alternate`" hreflang=`"en`" href=`"$enU`"/><xhtml:link rel=`"alternate`" hreflang=`"x-default`" href=`"$trU`"/>"
  "  <url><loc>$trU</loc>$lmTag$alts</url>"
  "  <url><loc>$enU</loc>$lmTag$alts</url>"
}
$sm = '<?xml version="1.0" encoding="UTF-8"?>' + "`n" + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' + "`n" +
  ($smUrls -join "`n") + "`n</urlset>`n"
[IO.File]::WriteAllText((Join-Path $Root 'sitemap.xml'), $sm, $Utf8)
# Every crawler is welcome: search engines and the AI assistants that answer people's questions
# (ChatGPT, Claude, Perplexity, Gemini…) can read and cite the whole site.
[IO.File]::WriteAllText((Join-Path $Root 'robots.txt'), "User-agent: *`nAllow: /`n`nSitemap: $SiteUrl/sitemap.xml`n", $Utf8)

# llms.txt (llmstxt.org): a plain map of the site for AI assistants, English first, then
# Turkish, each page with its one-line description.
$llmSkip = @('404.html', 'katesizm.html')
$llmPages = @($script:PageInfo | Where-Object { $llmSkip -notcontains $_.File -and $_.Robots -notmatch 'noindex' } | Sort-Object -Stable { if ($_.File -eq 'index.html') { 0 } else { 1 } })
$llmCut = { param($t) ($t -replace ([regex]::Escape(" | $SiteName") + '$'), '') -replace ('^' + [regex]::Escape($SiteName) + ' \| '), '' }
$llmLangs = if ($WithEnglish) { 'with every page in Turkish and English' } else { 'in Turkish (the Catechism also in English)' }
$llmTwins = if ($WithEnglish) { 'Every page has a Turkish address and an English twin under /en/.' } else { 'The Catechism pages have English twins under /en/.' }
$llms = "# $SiteName`n`n> A Turkish Catholic portal $($llmLangs): the Compendium of the Catechism of the Catholic Church (598 questions and answers), the saints of the calendar, prayers and the Rosary, the order of the Mass, Catholic churches in Turkey with Mass times, and answers about the faith, Islam and atheism.`n`n" +
  "$llmTwins Quotations of the Catechism follow the official Turkish translation and the English Compendium (Libreria Editrice Vaticana).`n`n## English`n`n" +
  (($llmPages | Where-Object { $_.En } | ForEach-Object { "- [$(& $llmCut $(if ($_.TitleEn) { $_.TitleEn } else { $_.Title }))]($SiteUrl/$(Page-Path $_.En)): $(if ($_.DescEn) { $_.DescEn } else { $_.Desc })" }) -join "`n") +
  "`n`n## Türkçe`n`n" +
  (($llmPages | ForEach-Object { "- [$(& $llmCut $_.Title)]($SiteUrl/$($_.Path)): $($_.Desc)" }) -join "`n") + "`n"
[IO.File]::WriteAllText((Join-Path $Root 'llms.txt'), $llms, $Utf8)
# IndexNow: the key file that proves the site is ours when the deploy tells Bing, Yandex and
# the others which addresses changed (see .github/workflows/deploy.yml)
$IndexNowKey = '6d932ac291e035e4f4741e45a828f802'
[IO.File]::WriteAllText((Join-Path $Root "$IndexNowKey.txt"), $IndexNowKey, $Utf8)

# security.txt (RFC 9116): how to report a vulnerability, without publicly guessing at one.
# Expires a year out from each build, so the file never goes silently stale.
$wellKnownDir = Join-Path $Root '.well-known'
if (-not (Test-Path $wellKnownDir)) { New-Item -ItemType Directory -Path $wellKnownDir | Out-Null }
$secExpires = (Get-Date).AddYears(1).ToString('yyyy-MM-ddT00:00:00.000Z')
$secTxt = "Contact: $SiteUrl/iletisim.html`nExpires: $secExpires`nPreferred-Languages: tr`nCanonical: $SiteUrl/.well-known/security.txt`n"
[IO.File]::WriteAllText((Join-Path $wellKnownDir 'security.txt'), $secTxt, $Utf8)
Write-Host "  + sitemap.xml, robots.txt, llms.txt, IndexNow key, .well-known/security.txt"
Write-Host "Done."
