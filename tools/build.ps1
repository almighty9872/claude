<#
.SYNOPSIS
  Static page generator for katolikdunyasi.com, a Turkish-language Catholic
  resource site: the Compendium of the Catechism of the Catholic Church,
  the OCIA/RCIA process, the Mass explained, prayers and the Rosary, a
  calendar of the saints, the Bible in Turkish, miracles, and an FAQ.

.DESCRIPTION
  Reads the single source of truth, data/*.js and content/*.md, and writes
  crawlable static HTML pages (all content pre-rendered for SEO), JSON-LD
  structured data (FAQPage, WebSite, Book, Article, BreadcrumbList), sitemap.xml
  and robots.txt into the site root.

  The generated files are committed, so the site works without running this.
  Run it only after editing data/ (or to set your real domain).
  No dependencies: Windows PowerShell 5.1 or PowerShell 7+ (Windows/macOS/Linux).
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
  [string]$SiteUrl = ''
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
$MonthNamesTr = @('Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık')
$BuildDateTr = "$((Get-Date).Day) $($MonthNamesTr[(Get-Date).Month - 1]) $((Get-Date).Year)"
$MonthNamesEn = @('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')
$BuildDateEn = "$($MonthNamesEn[(Get-Date).Month - 1]) $((Get-Date).Day), $((Get-Date).Year)"
$Utf8 = New-Object System.Text.UTF8Encoding $false
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
$CssSrc = [IO.File]::ReadAllText((Join-Path $Root 'assets/styles.css'))
$CssMin = Minify-Css $CssSrc
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
$SiteTagEn = 'Catholic World'
$WorkName = 'Katolik Kilisesi İnanç Esasları Özeti'
$SiteNameEn = 'Compendium of the Catechism of the Catholic Church'

# en/ holds the (currently partial) English mirror of the site; TR pages live at the root.
$EnDir = Join-Path $Root 'en'
if (-not (Test-Path $EnDir)) { New-Item -ItemType Directory -Path $EnDir | Out-Null }
# Maps every page that exists in both languages to its counterpart, keyed both directions
# (e.g. 'sss.html' -> 'en/faq.html' and 'en/faq.html' -> 'sss.html'). Used for the header/footer
# language-switcher target and for <link rel="alternate" hreflang> tags. A TR page with no entry
# here has no English version yet; its switcher falls back to the English homepage.
$EnAltMap = @{}
# English pages use their own English slugs (not a literal mirror of the Turkish filename), so
# each pair is listed explicitly: Turkish filename -> the English file's name under en/.
function Add-EnAlt([string]$trFile, [string]$enFile) { $EnAltMap[$trFile] = "en/$enFile"; $EnAltMap["en/$enFile"] = $trFile }
# The public path of a page: the two homepages are served (and canonical) at / and /en/
function Page-Path([string]$file) { if ($file -eq 'index.html') { '' } elseif ($file -eq 'en/index.html') { 'en/' } else { $file } }
Add-EnAlt 'index.html' 'index.html'
Add-EnAlt 'katesizm.html' 'compendium.html'
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
$dataVer = [ordered]@{}
Get-ChildItem (Join-Path $Root 'data') -Filter '*.js' | Sort-Object Name | ForEach-Object {
  $dataVer["data/$($_.Name)"] = File-Ver ([IO.File]::ReadAllBytes($_.FullName))
}
$JsSrc = [IO.File]::ReadAllText((Join-Path $Root 'assets/script.js'))
$JsMin = (Minify-Js $JsSrc).Replace('{"__DATA_VER__": 1}', (ConvertTo-Json -InputObject $dataVer -Compress))
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
# Shortens text for a <meta name="description"> so search engines don't cut it
# off mid-sentence; trims at the last full word within the limit. Only for the
# meta tag, never for text shown on the page (e.g. a blog post's own excerpt).
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
$IcoRoots    = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="3.1"/><path d="M12 9.1V14"/><path d="M12 14 8 20M12 14v6M12 14l4 6"/></svg>'
$IcoCompass  = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.3 8.7 13.2 13.2 8.7 15.3 10.8 10.8Z"/></svg>'
$IcoChalice  = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10"/><path d="M7.5 4c0 4.5 1.3 8 4.5 8s4.5-3.5 4.5-8"/><path d="M12 12v5.5"/><path d="M8 21h8"/><path d="M12 17.5v3.5"/></svg>'
$IcoBookOpen = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5c-1.6-1.3-3.6-2-6-2-.6 0-1 .4-1 1v11.5c0 .6.4 1 1 1 2.4 0 4.4.7 6 2 1.6-1.3 3.6-2 6-2 .6 0 1-.4 1-1V5.5c0-.6-.4-1-1-1-2.4 0-4.4.7-6 2Z"/><path d="M12 6.5v13"/></svg>'
$IcoBible    = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4.5A1.5 1.5 0 0 1 7.5 3H19v16.5a1 1 0 0 1-1 1H7.5A1.5 1.5 0 0 1 6 19Z"/><path d="M6 19a1.5 1.5 0 0 1 1.5-1.5H19"/><path d="M9.5 3v5.2l2-1.4 2 1.4V3"/></svg>'
$IcoQuestion = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.3 9.4a2.7 2.7 0 1 1 4 2.4c-.9.5-1.3 1.1-1.3 2.1v.4"/><circle cx="12" cy="17.6" r=".7" fill="currentColor" stroke="none"/></svg>'
$IcoSparkle  = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" stroke="none"><path d="M12 2c.9 4.6 3.1 6.8 7.7 7.7-4.6.9-6.8 3.1-7.7 7.7-.9-4.6-3.1-6.8-7.7-7.7C8.9 8.8 11.1 6.6 12 2Z"/></svg>'
$IcoChevDown = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9.5 12 15l6-5.5"/></svg>'
function Page-Ico([string]$svg) { return "<span class=`"page-ico`">$svg</span>" }
# Jerusalem cross: large cross potent in the centre, a small cross in each quadrant (100x100 grid)
$CrossShapes = '<rect x="44" y="12" width="12" height="76"/><rect x="12" y="44" width="76" height="12"/><rect x="33" y="8" width="34" height="9"/><rect x="33" y="83" width="34" height="9"/><rect x="8" y="33" width="9" height="34"/><rect x="83" y="33" width="9" height="34"/><rect x="23.5" y="18" width="5" height="16"/><rect x="18" y="23.5" width="16" height="5"/><rect x="71.5" y="18" width="5" height="16"/><rect x="66" y="23.5" width="16" height="5"/><rect x="23.5" y="66" width="5" height="16"/><rect x="18" y="71.5" width="16" height="5"/><rect x="71.5" y="66" width="5" height="16"/><rect x="66" y="71.5" width="16" height="5"/>'
$Logo = '<svg class="logo" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g fill="currentColor">' + $CrossShapes + '</g></svg>'
$Favicon = 'data:image/svg+xml,' + ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#0c1322"/><g fill="#d6b16b" transform="translate(12 12) scale(.76)">' + $CrossShapes + '</g></svg>').Replace('<', '%3C').Replace('>', '%3E').Replace('#', '%23').Replace('"', "'")

# ------------------------------------------------------------------ components
$script:EnSeq = 0
function En-Toggle([string]$targetId, [string]$label = 'İngilizcesi') {
  return "<button type=`"button`" class=`"en-toggle`" aria-expanded=`"false`" aria-controls=`"$targetId`">$label $IcoChev</button>"
}
$IcoExternal = '<svg class="ext" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>'
# Every "CCC ..." / "CIC kan. ..." reference (Compendium Q&A pages, FAQ page) links to our
# own Compendium overview -- see katesizm.html/en/compendium.html -- rather than guessing at
# individual paragraph URLs on vatican.va, which this generator has no way to verify.
function Ccc-Link([string]$text, [string]$lang) {
  $href = if ($lang -eq 'en') { 'en/compendium.html' } else { 'katesizm.html' }
  $label = if ($lang -eq 'en') { 'Open the Compendium' } else { 'Katekizm sayfasını aç' }
  return "<a href=`"$href`" target=`"_blank`" rel=`"noopener`" aria-label=`"$label`">$text$IcoExternal</a>"
}
function Qa-Html($it, [int]$hl) {
  $n = $it.n; $tag = HTag $hl
  $note = if ($it.note) { "<p class=`"note`"><b>Not:</b> $(Inline $it.note)</p>" } else { '' }
  return "<article class=`"qa`" id=`"soru-$n`" data-n=`"$n`">" +
    "<header class=`"qa-head`"><a class=`"qa-num`" href=`"#soru-$n`" aria-label=`"Soru $n bağlantısı`">$n</a><$tag class=`"qa-q`">$(Inline $it.tr.q)</$tag></header>" +
    "<p class=`"qa-ref`" title=`"Katolik Kilisesi Katekizmi madde numaraları`">$(Ccc-Link $it.ccc 'tr')</p>" +
    "<div class=`"qa-a`">$(Blocks $it.tr.a)</div>$note" +
    "<footer class=`"qa-foot end`">$(En-Toggle "en-$n")</footer>" +
    "<div class=`"en-block`" id=`"en-$n`" lang=`"en`" hidden><span class=`"label`" lang=`"tr`">İngilizce aslı</span><p class=`"qa-q`">$(Inline $it.en.q)</p><p class=`"qa-ref`">$(Ccc-Link $it.ccc 'en')</p><div class=`"qa-a`">$(Blocks $it.en.a)</div></div>" +
    "</article>"
}
# $tagLevel is the true HTML heading level (never skips a level in the DOM); it can
# differ from $it.level, which only sets the sec-l$level class (visual size) — e.g. a
# bridging title like "The Creed" sits right under a Part heading and is styled a size
# smaller (sec-l4) even though it is only one level deep, not four.
function Heading-Html($it, [int]$tagLevel) {
  $tag = HTag $tagLevel
  $tr = Split-Heading $it.tr
  $label = if ($tr[0]) { "<span class=`"sec-label`">$($tr[0])</span>" } else { '' }
  return "<$tag class=`"sec sec-l$($it.level)`" id=`"$($it.id)`">$label<span class=`"sec-title`">$(Inline $tr[1])</span><span class=`"en`" lang=`"en`">$(Inline $it.en)</span></$tag>"
}
function Quote-Html($it) {
  $script:EnSeq++; $id = "en-alinti-$($script:EnSeq)"
  $t = Split-Attr $it.tr; $e = Split-Attr $it.en
  $cap = if ($t[1]) { "<figcaption class=`"attr`">$(Inline $t[1])</figcaption>" } else { '' }
  $enAttr = if ($e[1]) { " <span class=`"attr`">$($e[1])</span>" } else { '' }
  return "<figure class=`"quote`"><blockquote><p>$(Inline $t[0])</p></blockquote>$cap$(En-Toggle $id)" +
    "<div class=`"en-block`" id=`"$id`" lang=`"en`" hidden><span class=`"label`" lang=`"tr`">İngilizce aslı</span><p>$(Inline $e[0])</p>$enAttr</div></figure>"
}
# Card with Turkish text, English original on demand and optional Latin
function Text-Card($obj, [string]$id, [int]$hl, [string]$bodyTr, [string]$bodyEn) {
  $tag = HTag $hl
  $html = "<article class=`"text-card`" id=`"$id`"><$tag class=`"t-title`">$(Inline $obj.tr.title)</$tag>$bodyTr" +
    "<footer class=`"qa-foot end`">$(En-Toggle "en-$id")</footer>" +
    "<div class=`"en-block`" id=`"en-$id`" lang=`"en`" hidden><span class=`"label`" lang=`"tr`">İngilizce aslı</span><p class=`"t-title`">$(Inline $obj.en.title)</p>$bodyEn</div>"
  if ($obj.la) { $html += "<details class=`"latin`"><summary>Latince metin: $($obj.la.title)</summary><div class=`"verse`" lang=`"la`">$(Verse $obj.la.text)</div></details>" }
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
      return "<div class=`"text-grid`">$(Text-Card $o 'goklerdeki-babamiz-duasi' $hl "<div class=`"verse`">$(Verse $o.tr.text)</div>" "<div class=`"verse`">$(Verse $o.en.text)</div>")</div>"
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
function Qa-Html-En($it, [int]$hl) {
  $n = $it.n; $tag = HTag $hl
  $note = if ($it.noteEn) { "<p class=`"note`"><b>Note:</b> $(Inline $it.noteEn)</p>" } elseif ($it.note) { "<p class=`"note`"><b>Note:</b> $(Inline $it.note)</p>" } else { '' }
  return "<article class=`"qa`" id=`"soru-$n`" data-n=`"$n`">" +
    "<header class=`"qa-head`"><a class=`"qa-num`" href=`"#soru-$n`" aria-label=`"Link to question $n`">$n</a><$tag class=`"qa-q`">$(Inline $it.en.q)</$tag></header>" +
    "<p class=`"qa-ref`" title=`"Catechism of the Catholic Church paragraph numbers`">$(Ccc-Link $it.ccc 'en')</p>" +
    "<div class=`"qa-a`">$(Blocks $it.en.a)</div>$note" +
    "<footer class=`"qa-foot end`">$(En-Toggle "tr-$n" 'Türkçesi')</footer>" +
    "<div class=`"en-block`" id=`"tr-$n`" lang=`"tr`" hidden><span class=`"label`" lang=`"en`">Turkish translation</span><p class=`"qa-q`">$(Inline $it.tr.q)</p><p class=`"qa-ref`">$(Ccc-Link $it.ccc 'tr')</p><div class=`"qa-a`">$(Blocks $it.tr.a)</div></div>" +
    "</article>"
}
function Heading-Html-En($it, [int]$tagLevel) {
  $tag = HTag $tagLevel
  $en = Split-Heading $it.en
  $label = if ($en[0]) { "<span class=`"sec-label`">$($en[0])</span>" } else { '' }
  return "<$tag class=`"sec sec-l$($it.level)`" id=`"$($it.id)`">$label<span class=`"sec-title`">$(Inline $en[1])</span></$tag>"
}
function Quote-Html-En($it) {
  $script:EnSeq++; $id = "tr-alinti-$($script:EnSeq)"
  $t = Split-Attr $it.tr; $e = Split-Attr $it.en
  $cap = if ($e[1]) { "<figcaption class=`"attr`">$($e[1])</figcaption>" } else { '' }
  $trAttr = if ($t[1]) { " <span class=`"attr`">$(Inline $t[1])</span>" } else { '' }
  return "<figure class=`"quote`"><blockquote><p>$(Inline $e[0])</p></blockquote>$cap$(En-Toggle $id 'Türkçesi')" +
    "<div class=`"en-block`" id=`"$id`" lang=`"tr`" hidden><span class=`"label`" lang=`"en`">Turkish translation</span><p>$(Inline $t[0])</p>$trAttr</div></figure>"
}
function Text-Card-En($obj, [string]$id, [int]$hl, [string]$bodyEn, [string]$bodyTr) {
  $tag = HTag $hl
  $html = "<article class=`"text-card`" id=`"$id`"><$tag class=`"t-title`">$(Inline $obj.en.title)</$tag>$bodyEn" +
    "<footer class=`"qa-foot end`">$(En-Toggle "tr-$id" 'Türkçesi')</footer>" +
    "<div class=`"en-block`" id=`"tr-$id`" lang=`"tr`" hidden><span class=`"label`" lang=`"en`">Turkish translation</span><p class=`"t-title`">$(Inline $obj.tr.title)</p>$bodyTr</div>"
  if ($obj.la) { $html += "<details class=`"latin`"><summary>Latin text: $($obj.la.title)</summary><div class=`"verse`" lang=`"la`">$(Verse $obj.la.text)</div></details>" }
  return $html + '</article>'
}
function Special-Html-En([string]$ref, [int]$hl) {
  switch ($ref) {
    'creeds' {
      $cards = ($X.creeds | ForEach-Object { Text-Card-En $_ $_.id $hl "<div class=`"verse`">$(Verse $_.en.text)</div>" "<div class=`"verse`">$(Verse $_.tr.text)</div>" }) -join ''
      return "<div class=`"text-grid two`">$cards</div>"
    }
    'decalogue' {
      $d = $X.decalogue
      $obj = [pscustomobject]@{ tr = [pscustomobject]@{ title = $d.tr.title }; en = [pscustomobject]@{ title = $d.en.title }; la = $null }
      return "<div class=`"text-grid decalogue`">$(Text-Card-En $obj 'on-emir-tablosu' $hl (Decalogue-Table $d.en) (Decalogue-Table $d.tr))</div>"
    }
    'our-father' {
      $o = $X.ourFather
      return "<div class=`"text-grid`">$(Text-Card-En $o 'goklerdeki-babamiz-duasi' $hl "<div class=`"verse`">$(Verse $o.en.text)</div>" "<div class=`"verse`">$(Verse $o.tr.text)</div>")</div>"
    }
  }
  return ''
}
function Render-Items-En($items) {
  $sb = New-Object Text.StringBuilder; $current = 1
  foreach ($it in $items) {
    switch ($it.type) {
      'heading' {
        if ($it.level -gt 1) {
          $tagLevel = [Math]::Min([int]$it.level, $current + 1)
          [void]$sb.Append((Heading-Html-En $it $tagLevel))
          $current = $tagLevel
        } else {
          $current = [int]$it.level
        }
      }
      'qa'      { [void]$sb.Append((Qa-Html-En $it ($current + 1))) }
      'quote'   { [void]$sb.Append((Quote-Html-En $it)) }
      'special' { [void]$sb.Append((Special-Html-En $it.ref ($current + 1))) }
    }
    [void]$sb.Append("`n")
  }
  return $sb.ToString()
}

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

$aboutFileEn = Join-Path (Join-Path $Root 'content') 'hakkinda-en.md'
$aboutMdEn = if (Test-Path $aboutFileEn) { [IO.File]::ReadAllText($aboutFileEn, [Text.Encoding]::UTF8) } else { '' }
$aboutMdEn = $aboutMdEn -replace '\{\{TARIH\}\}', $BuildDateEn
$fmMatchEn = [regex]::Match($aboutMdEn, '^﻿?\s*---\s*\r?\n([\s\S]*?)\r?\n---\s*(\r?\n|$)')
$fmEn = @{}
if ($fmMatchEn.Success) {
  foreach ($line in ($fmMatchEn.Groups[1].Value -split "`n")) { $kv = [regex]::Match($line, '^\s*([A-Za-z_]+)\s*:\s*(.*?)\s*$'); if ($kv.Success) { $fmEn[$kv.Groups[1].Value.ToLower()] = $kv.Groups[2].Value.Trim('"', "'") } }
  $aboutMdEn = $aboutMdEn.Substring($fmMatchEn.Length)
}
$h1mEn = [regex]::Match($aboutMdEn, '(?m)^#\s+(.+?)\s*$')
if ($h1mEn.Success) { $aboutMdEn = $aboutMdEn.Remove($h1mEn.Index, $h1mEn.Length) }
$InfoHtmlEn = Convert-Markdown $aboutMdEn
$Kk = Read-Md 'kutsal-kitap.md'
$KkMeta = $Kk.meta
$KkEn = Read-Md 'kutsal-kitap-en.md'
$KkMetaEn = $KkEn.meta
$Er = Read-Md 'erisilebilirlik.md'
$ErMeta = $Er.meta
$ErEn = Read-Md 'erisilebilirlik-en.md'
$ErMetaEn = $ErEn.meta
$Gz = Read-Md 'gizlilik.md'
$GzMeta = $Gz.meta
$GzEn = Read-Md 'gizlilik-en.md'
$GzMetaEn = $GzEn.meta

# Top bar: brand, the settings gear (language + accessibility), the five core links and the
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
$KatekizmNav = @(@{ href = 'katesizm.html'; t = 'Genel Bakış'; s = '598 soru ve yanıtın tam listesi'; te = 'Overview'; se = 'All 598 questions and answers' }) + $TextNav
# "Kaynaklar": pages that stand on their own but are grouped under one menu now that there are many.
$KaynaklarNav = @(
  @{ href = 'katolik-sureci.html'; t = 'Katolik Olma Süreci';  s = 'Katolik olma süreci';           te = 'Becoming Catholic'; se = 'The OCIA/RCIA process' },
  @{ href = 'gunah-cikarma.html';  t = 'Günah Çıkarma';        s = 'Nasıl işler, adım adım';        te = 'Confession'; se = 'Step by step, how it works' },
  @{ href = 'kutsal-ayin.html';    t = 'Kutsal Ayin';          s = 'Ayinin sırası, adım adım';      te = 'The Holy Mass'; se = 'The order of Mass, step by step' },
  @{ href = 'meseller.html';       t = "İsa$($Apos)nın Meselleri"; s = 'Otuz iki mesel, düz bir dille'; te = 'The Parables of Jesus'; se = 'Thirty-two parables, plainly explained' },
  @{ href = 'kutsal-kitap.html';   t = 'Kutsal Kitap';         s = 'Onaylı çeviriler';              te = 'The Bible'; se = 'Approved translations' },
  @{ href = 'kiliseler.html';      t = 'Kilise Bul';           s = "Türkiye$($Apos)de kilise adresleri"; te = 'Find a Church'; se = 'Catholic churches in Turkey' },
  @{ href = 'topraklarimizda-hristiyanlik.html'; t = 'Topraklarımızda Hristiyanlık'; s = "Pavlus$($Apos)tan İznik$($Apos)e"; te = 'Christianity in Anatolia'; se = 'From Paul to Nicaea' }
)
$KatekizmPages = @('katesizm.html') + ($TextNav | ForEach-Object { $_.href })
# The five links shown directly in the bar at all times; everything else (including these
# five again, for completeness) lives in the hamburger's full-screen overlay only.
$CoreNav = @(
  @{ href = 'neden-katoligiz.html'; t = 'Neden Katoliğiz?' },
  @{ href = 'katesizm.html';        t = 'Katekizm' },
  @{ href = 'topraklarimizda-hristiyanlik.html'; t = 'Topraklarımızda Hristiyanlık' },
  @{ href = 'kiliseler.html';       t = 'Kilise Bul' },
  @{ href = 'sss.html';             t = 'Sorular' }
)
$IcoBook = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.6C10.6 5.4 8.6 4.8 6 4.8H3.6v13.4H6c2.6 0 4.6.6 6 1.8 1.4-1.2 3.4-1.8 6-1.8h2.4V4.8H18c-2.6 0-4.6.6-6 1.8z"/><path d="M12 6.6v13.4"/></svg>'
$IcoBeads = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="14.6" r="6.4"/><circle cx="12" cy="5.2" r="1.5"/><path d="M12 6.7v1.5" stroke-linecap="round"/><path d="M10.4 3.3h3.2M12 1.7v3.2" stroke-linecap="round"/></svg>'
$IcoWay = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21c3-6 3-11 0-17"/><path d="M19 21c-3-6-3-11 0-17"/><path d="M9.5 15h5M9 10h6"/><circle cx="12" cy="4" r="1.4" fill="currentColor" stroke="none"/></svg>'
$IcoStar = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2c1 2.8 1.9 4.4 3.4 5.8 1.5 1.4 3.1 2.1 5.4 2.7-2.3.6-3.9 1.4-5.4 2.7-1.5 1.4-2.4 3-3.4 5.8-1-2.8-1.9-4.4-3.4-5.8-1.5-1.3-3.1-2.1-5.4-2.7 2.3-.6 3.9-1.3 5.4-2.7 1.5-1.4 2.4-3 3.4-5.8z"/></svg>'
$IcoFlagEn = '<svg class="flag-en" viewBox="0 0 24 16" aria-hidden="true" focusable="false"><rect width="24" height="16" fill="#1a237e"/><path d="M0 0 24 16M24 0 0 16" stroke="#fff" stroke-width="3"/><path d="M0 0 24 16M24 0 0 16" stroke="#c8102e" stroke-width="1.2"/><path d="M12 0V16M0 8H24" stroke="#fff" stroke-width="5.4"/><path d="M12 0V16M0 8H24" stroke="#c8102e" stroke-width="2.6"/></svg>'
$IcoFlagTr = '<svg class="flag-tr" viewBox="0 0 24 16" aria-hidden="true" focusable="false"><rect width="24" height="16" fill="#e30a17"/><circle cx="9.6" cy="8" r="4.3" fill="#fff"/><circle cx="10.7" cy="8" r="3.5" fill="#e30a17"/><polygon fill="#fff" points="15.6,6.95 15.85,7.66 16.6,7.68 16.0,8.13 16.22,8.85 15.6,8.42 14.98,8.85 15.2,8.13 14.6,7.68 15.35,7.66"/></svg>'
$IcoChalice = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10"/><path d="M7.6 4c0 4.4 1.3 7.6 4.4 7.6s4.4-3.2 4.4-7.6"/><path d="M12 11.6V19"/><path d="M8 19h8"/></svg>'
$IcoRadiance = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/></svg>'
$IcoHome = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9.5a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1V10"/></svg>'
$IcoMail = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.2" y="5.5" width="17.6" height="13" rx="1.6"/><path d="m4 6.5 8 6.5 8-6.5"/></svg>'
$IcoPrayers = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v14"/><path d="M8 5.5c0 5-1 8-3.5 10"/><path d="M16 5.5c0 5 1 8 3.5 10"/><path d="M8 20.5c1.3-1 2.7-1 4 0 1.3-1 2.7-1 4 0"/></svg>'
$IcoScroll = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4.5h11a2 2 0 0 1 2 2V8H9a2 2 0 0 0-2 2Z"/><path d="M7 4.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-1.5H9a2 2 0 0 1-2-2Z"/><path d="M11.5 11.5h5M11.5 14.5h5"/></svg>'
$IcoAsk = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.2"/><path d="M9.3 9.2a2.8 2.8 0 1 1 3.5 3.1c-.6.2-.9.7-.9 1.3v.6"/><circle cx="12" cy="17.2" r="1.05" fill="currentColor" stroke="none"/></svg>'
$IcoPin = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>'
$SmallCross = '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="currentColor">' + $CrossShapes + '</g></svg>'
# href -> icon lookup for the mobile menu sheet (each real destination gets a small icon; the
# plain-text ns-label section headers do not). Defined early, before Header-Html is first called
# by the Compendium part-page loop below, so every icon it references must already exist here.
$NavIcons = @{
  'index.html'          = $IcoHome
  'katesizm.html'        = $SmallCross
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
  'iletisim.html'        = $IcoMail
}
# The full-screen menu's groups, for both languages: each entry's English page comes from
# $EnAltMap, its English wording from te/se. One list, so the two menus can't drift apart.
$SheetNav = @(
  @{ items = @(@{ href = 'index.html'; t = 'Ana Sayfa'; te = 'Home' }) },
  @{ label = 'Neden Katoliğiz?'; le = "Why We're Catholic"; items = @(@{ href = 'neden-katoligiz.html'; t = 'Neden Katoliğiz?'; s = 'İmanın beş adımda özeti'; te = "Why We're Catholic"; se = 'The faith in five steps'; ico = $IcoCompass }) },
  @{ label = 'Katekizm'; le = 'Compendium'; sub = $true; ico = $SmallCross; items = $KatekizmNav },
  @{ label = 'Kaynaklar'; le = 'Resources'; sub = $true; items = $KaynaklarNav },
  @{ label = 'Dualar'; le = 'Prayers'; sub = $true; items = $PrayerNav },
  @{ label = 'Mucizeler'; le = 'Miracles'; items = @(@{ href = 'mucizeler.html'; t = 'Mucizeler'; s = 'Görünmeler, kalıntılar, Efkaristiya mucizeleri'; te = 'Miracles'; se = 'Apparitions, relics, Eucharistic miracles' }) },
  @{ label = 'Azizler'; le = 'Saints'; items = @(@{ href = 'azizler.html'; t = 'Azizler'; s = 'Ayin takviminin azizleri'; te = 'Saints'; se = 'Saints of the liturgical calendar' }) },
  @{ label = 'Sorular'; le = 'FAQ'; items = @(@{ href = 'sss.html'; t = 'Sorular'; s = 'Sıkça sorulan sorular'; te = 'FAQ'; se = 'Frequently asked questions' }) },
  @{ label = 'İletişim'; le = 'Contact'; items = @(@{ href = 'iletisim.html'; t = 'İletişim'; s = 'Bize ulaşın'; te = 'Contact'; se = 'Get in touch' }) }
)
function Nav-Sheet([string]$lang, [string]$current) {
  $en = $lang -eq 'en'; $i = 0
  return (($SheetNav | ForEach-Object {
    $g = $_
    $links = ($g.items | ForEach-Object {
      $h = if ($en) { $EnAltMap[$_.href] } else { $_.href }
      $t = if ($en) { $_.te } else { $_.t }; $sub = if ($en) { $_.se } else { $_.s }
      $ico = if ($_.ico) { $_.ico } elseif ($g.ico) { $g.ico } else { $NavIcons[$_.href] }
      $cls = if ($g.sub) { 'ns-item ns-sub' } else { 'ns-item' }
      $sHtml = if ($sub) { "<span class=`"ns-s`">$sub</span>" } else { '' }
      "<a class=`"$cls`" href=`"$h`"$(Cur $h $current)><span class=`"ns-ico`">$ico</span><span class=`"ns-body`"><span class=`"ns-t`">$t</span>$sHtml</span></a>"
    }) -join ''
    $lbl = if ($g.label) { "<p class=`"ns-label`">$(if ($en) { $g.le } else { $g.label })</p>" } else { '' }
    $delay = ([double]$i * 0.035).ToString([Globalization.CultureInfo]::InvariantCulture); $i++
    "      <div class=`"ns-group`" style=`"animation-delay:$($delay)s`">$lbl$links</div>"
  }) -join "`n")
}
# ------------------------------------------------------------------ mobile tab bar
# Phones and small tablets get a glass tab bar pinned to the bottom of every page. Pages with
# sections of their own show those (four, plus "Diğer" for the rest in a drawer); every other
# page shows the five core destinations. Entries with an '#' href are in-page anchors, the same
# id on both languages' pages; page hrefs are Turkish and mapped through $EnAltMap for English.
$TbSvg = { param($d, $extra = '') "<svg viewBox=`"0 0 24 24`" aria-hidden=`"true`" fill=`"none`" stroke=`"currentColor`" stroke-width=`"1.7`" stroke-linecap=`"round`" stroke-linejoin=`"round`"$extra>$d</svg>" }
$TbWhy    = & $TbSvg '<circle cx="12" cy="12" r="9.2"/><path d="M9.3 9.3a2.8 2.8 0 0 1 5.4 1c0 2-2.7 2.4-2.7 4.2"/><path d="M12 17.4h.01"/>'
$TbMap    = & $TbSvg '<path d="M9 4.2 3.6 6.1v13.7L9 17.9l6 1.9 5.4-1.9V4.2L15 6.1z"/><path d="M9 4.2v13.7M15 6.1v13.7"/>'
$TbChurch = & $TbSvg '<path d="M12 2.4v4.2M10.1 4.3h3.8"/><path d="M5.6 21v-9.3L12 6.9l6.4 4.8V21"/><path d="M3.4 21h17.2"/><path d="M10.1 21v-4a1.9 1.9 0 0 1 3.8 0v4"/>'
$TbChat   = & $TbSvg '<path d="M4.8 3.2h7.9a1.8 1.8 0 0 1 1.8 1.8v6.3a1.8 1.8 0 0 1-1.8 1.8H8.2l-3.6 3v-3h.2A1.8 1.8 0 0 1 3 11.3V5a1.8 1.8 0 0 1 1.8-1.8z"/><path d="M17.3 8.4h1.9A1.8 1.8 0 0 1 21 10.2v6a1.8 1.8 0 0 1-1.8 1.8H19v2.9L15.6 18H12.8a1.8 1.8 0 0 1-1.8-1.8v-.6"/><path d="M7.4 6.4a1.4 1.4 0 0 1 2.7.5c0 1-1.3 1.1-1.3 2M8.8 10.6h.01"/>'
$TbMore   = & $TbSvg '<circle cx="12" cy="12" r="9.2"/><circle cx="7.9" cy="12" r=".9" fill="currentColor"/><circle cx="12" cy="12" r=".9" fill="currentColor"/><circle cx="16.1" cy="12" r=".9" fill="currentColor"/>'
$TbSteps  = & $TbSvg '<path d="M10 6.5h10M10 12h10M10 17.5h10"/><path d="M4.2 5.6 5.4 4.8v3.4M4 12.6c0-.8.6-1.3 1.2-1.3s1.1.4 1.1 1c0 .9-2.3 1.7-2.3 2.4h2.4M4.1 16.3h2l-1 1.2c.7 0 1.2.4 1.2 1s-.5 1-1.1 1c-.5 0-.9-.2-1.1-.5"/>'
$TbCal    = & $TbSvg '<rect x="3.5" y="5" width="17" height="15.5" rx="2.4"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'
$TbToday  = & $TbSvg '<rect x="3.5" y="5" width="17" height="15.5" rx="2.4"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="12" cy="15.2" r="2" fill="currentColor" stroke="none"/>'
$TbFeast  = & $TbSvg '<path d="M12 3.2 14.3 8l5.2.6-3.9 3.6 1.1 5.1L12 14.8l-4.7 2.5 1.1-5.1-3.9-3.6L9.7 8z"/>'
$TbHome   = & $TbSvg '<path d="M4 10.8 12 4l8 6.8"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>'
$TbMenu   = & $TbSvg '<path d="M4 7h16M4 12h16M4 17h16"/>'
# Topic icons for the bars (more come from the page's own icon sets, named as 'ParableIcons.heart'
# and resolved when the page is built, since those sets are defined further down this script)
$TbBulb    = & $TbSvg '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.8 10.6c.6.5.8 1.1.8 1.9v.5h6v-.5c0-.8.3-1.4.8-1.9A6 6 0 0 0 12 3z"/>'
$TbScale   = & $TbSvg '<path d="M12 3.5v17M7.5 20.5h9M5 7h14"/><path d="M5 7 2.5 12.5a2.6 2.6 0 0 0 5 0zM19 7l-2.5 5.5a2.6 2.6 0 0 0 5 0z"/>'
$TbCross   = & $TbSvg '<path d="M12 2.5v19M6.5 8h11"/>'
$TbTablets = & $TbSvg '<path d="M3.5 20V8.5a4.25 4.25 0 0 1 8.5 0V20z"/><path d="M12 20V8.5a4.25 4.25 0 0 1 8.5 0V20z"/><path d="M6.2 11h3M6.2 14h3M6.2 17h3M14.7 11h3M14.7 14h3M14.7 17h3"/>'
$TbArmenian = & $TbSvg '<path d="M12 5v14M5 12h14"/><circle cx="12" cy="3.6" r="1.4"/><circle cx="12" cy="20.4" r="1.4"/><circle cx="3.6" cy="12" r="1.4"/><circle cx="20.4" cy="12" r="1.4"/>'
$TbSyriac  = & $TbSvg '<path d="M12 6.5v11M6.5 12h11"/><path d="M12 6.5 9.6 3h4.8zM12 17.5 9.6 21h4.8zM6.5 12 3 9.6v4.8zM17.5 12 21 9.6v4.8z"/>'
$TbChaldean = & $TbSvg '<circle cx="12" cy="12" r="9"/><path d="M12 5.5v13M5.5 12h13"/><path d="M10.3 6.8 12 5.5l1.7 1.3M10.3 17.2l1.7 1.3 1.7-1.3M6.8 10.3 5.5 12l1.3 1.7M17.2 10.3l1.3 1.7-1.3 1.7"/>'
$TbCity    = & $TbSvg '<path d="M3 21h18"/><path d="M5 21V10l5-3v14"/><path d="M10 21V4.5l9 4V21"/><path d="M13.5 10h2.5M13.5 13h2.5M13.5 16h2.5M7 13.5h1M7 16.5h1"/>'
$TbLetter  = & $TbSvg '<path d="M6 3.5h9l3 3V20.5H6z"/><path d="M15 3.5v3h3M9 10h6M9 13h6M9 16h4"/>'
$TbCouncil = & $TbSvg '<path d="M4 20h16M5.5 20v-8M9.8 20v-8M14.2 20v-8M18.5 20v-8"/><path d="M3.5 12h17L12 5z"/>'
$TbReset   = & $TbSvg '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4.5V11h-6.5"/>'
function Tb-Ico($x) {
  if (-not $x) { return '' }
  if ($x -like '*<svg*') { return $x }
  $parts = $x -split '\.', 2
  $v = (Get-Variable -Name $parts[0] -ValueOnly -ErrorAction SilentlyContinue)
  if ($parts.Count -gt 1) { return $v[$parts[1]] } else { return $v }
}
$TbSets = @{
  main = @{ main = $true; items = @(
    @{ h = 'neden-katoligiz.html'; t = 'Neden?'; te = 'Why?'; ico = $TbWhy },
    @{ h = 'topraklarimizda-hristiyanlik.html'; t = 'Tarih'; te = 'History'; ico = $TbMap },
    @{ h = 'katesizm.html'; t = 'Katekizm'; te = 'Catechism'; ico = $SmallCross },
    @{ h = 'kiliseler.html'; t = 'Kiliseler'; te = 'Churches'; ico = $TbChurch },
    @{ h = 'sss.html'; t = 'Sorular'; te = 'FAQ'; ico = $TbChat }) }
  katekizm = @{ items = @(
    @{ h = 'iman-ikrari.html'; t = 'İnanç'; te = 'Creed'; n = 'I' },
    @{ h = 'kutsal-sirlar.html'; t = 'Kutlama'; te = 'Celebration'; n = 'II' },
    @{ h = 'mesihte-yasam.html'; t = 'Yaşam'; te = 'Life'; n = 'III' },
    @{ h = 'hristiyan-duasi.html'; t = 'Dua'; te = 'Prayer'; n = 'IV' })
    more = @(
    @{ h = 'katesizm.html'; t = 'Genel Bakış'; te = 'Overview' },
    @{ h = 'motu-proprio.html'; t = 'Motu Proprio'; te = 'Motu Proprio' },
    @{ h = 'giris.html'; t = 'Giriş'; te = 'Introduction' },
    @{ h = 'ekler.html'; t = 'Ekler'; te = 'Appendix' }) }
  tesbih = @{ items = @(
    @{ h = '#nasil'; t = 'Nasıl?'; te = 'How To'; ico = $TbSteps },
    @{ h = '#gizemler'; t = 'Gizemler'; te = 'Mysteries'; ico = $IcoSparkle },
    @{ h = '#tesbih-rehberi'; t = 'Tesbih'; te = 'Rosary'; ico = $IcoBeads },
    @{ h = 'ekler.html#ek-a'; t = 'Dualar'; te = 'Prayers'; ico = $IcoPrayers },
    @{ action = 'rt-restart'; t = 'Baştan Başla'; te = 'Start Over'; ico = $TbReset }) }
  neden = @{ attr = 'data-why-go'; items = @(
    @{ h = '#hakikat-ve-tanri'; t = 'Hakikat'; te = 'Truth'; ico = $IcoCompass },
    @{ h = '#isa-ve-kutsal-kitap'; t = 'İsa'; te = 'Jesus'; ico = $TbCross },
    @{ h = '#kilise-ve-kutsal-sirlar'; t = 'Kilise'; te = 'Church'; ico = $TbChurch },
    @{ h = '#azizler-ve-gunahkarlar'; t = 'Azizler'; te = 'Saints'; ico = $IcoStar })
    more = @(
    @{ h = '#ahlak-ve-sonsuz-yazgi'; t = 'Ahlak ve Sonsuz Yazgı'; te = 'Morality and Destiny' },
    @{ h = '#sonuc'; t = 'Hepsi bir arada'; te = 'Putting it together' }) }
  tarih = @{ items = @(
    @{ h = '#pavlus'; t = 'Pavlus'; te = 'Paul'; ico = $TbLetter },
    @{ h = '#yedi-kilise'; t = '7 Kilise'; te = '7 Churches'; ico = $TbChurch },
    @{ h = '#iznik'; t = 'İznik'; te = 'Nicaea'; ico = $TbCouncil })
    more = @(@{ h = '#kilise-babalari'; t = 'Bu Topraklarda Yazan Kilise Babaları'; te = 'The Church Fathers of Anatolia' }) }
  kiliseler = @{ moreLabel = 'Şehirler'; moreLabelEn = 'Cities'; moreIco = $TbCity; cities = $true; items = @(
    @{ rite = 'latin'; t = 'Latin'; te = 'Latin'; ico = $TbCross },
    @{ rite = 'ermeni'; t = 'Ermeni'; te = 'Armenian'; ico = $TbArmenian },
    @{ rite = 'suryani'; t = 'Süryani'; te = 'Syriac'; ico = $TbSyriac },
    @{ rite = 'keldani'; t = 'Keldani'; te = 'Chaldean'; ico = $TbChaldean }) }
  meseller = @{ items = @(
    @{ h = '#hukumdarlik'; t = 'Hükümdarlık'; te = 'Kingdom'; ico = 'ParableIcons.sprout' },
    @{ h = '#merhamet'; t = 'Merhamet'; te = 'Mercy'; ico = 'ParableIcons.heart' },
    @{ h = '#dua'; t = 'Dua'; te = 'Prayer'; ico = 'ParableIcons.prayer' },
    @{ h = '#uyaniklik'; t = 'Uyanıklık'; te = 'Watchfulness'; ico = 'ParableIcons.lamp' })
    more = @(
    @{ h = '#sorumluluk'; t = 'Sorumluluk ve Yönetim Meselleri'; te = 'Parables of Stewardship' },
    @{ h = '#cagri'; t = 'Hükümdarlığa Çağrı ve Hesap Verme Meselleri'; te = 'Parables of the Call and the Reckoning' }) }
  mucizeler = @{ items = @(
    @{ h = '#gorunmeler'; t = 'Görünmeler'; te = 'Apparitions'; ico = 'MiracleIcons.apparition' },
    @{ h = '#kalintilar'; t = 'Kalıntılar'; te = 'Relics'; ico = 'MiracleIcons.relic' },
    @{ h = '#efkaristiya'; t = 'Efkaristiya'; te = 'Eucharist'; ico = 'MiracleIcons.eucharist' },
    @{ h = '#curumeyen-azizler'; t = 'Çürümeyenler'; te = 'Incorrupt'; ico = 'MiracleIcons.incorrupt' }) }
  sss = @{ items = @(
    @{ h = '#teolojik-yanilgilar'; t = 'Yanılgılar'; te = 'Misconceptions'; ico = $TbBulb },
    @{ h = '#kutsal-sirlar-uygulamalar'; t = 'Kutsal Sırlar'; te = 'Sacraments'; ico = $IcoChalice },
    @{ h = '#otorite-ogretiler'; t = 'Otorite'; te = 'Authority'; ico = $IcoKey },
    @{ h = '#akla-gelen-itirazlar'; t = 'İtirazlar'; te = 'Objections'; ico = $TbScale })
    more = @(@{ h = '#savunma-ve-guncel-sorular'; t = 'Kilise Savunması ve Güncel Sorular'; te = 'Church Apologetics and Questions from Today' }) }
  gunah = @{ items = @(
    @{ h = '#adim-adim'; t = 'Adımlar'; te = 'Steps'; ico = $TbSteps },
    @{ h = '#vicdan-muhasebesi'; t = '10 Emir'; te = '10 Commandments'; ico = $TbTablets },
    @{ h = '#sorular-ve-korkular'; t = 'Sorular'; te = 'Questions'; ico = $TbChat })
    more = @(@{ h = '#muhur-sehitleri'; t = 'Mührün şehitleri'; te = 'Martyrs of the seal' }) }
  surec = @{ items = @(
    @{ h = '#iki-yol'; t = 'İki Yol'; te = 'Two Paths'; ico = $IcoWay },
    @{ h = '#surec'; t = 'Süreç'; te = 'Process'; ico = $TbSteps },
    @{ h = '#zaten-hristiyan'; t = 'Vaftizliler'; te = 'Baptized'; ico = 'IcoDroplet' },
    @{ h = '#pratik-sorular'; t = 'Sorular'; te = 'Questions'; ico = $TbChat })
    more = @(
    @{ h = '#sartli-vaftiz'; t = 'Vaftizin geçerliliğinden kuşku duyuluyorsa'; te = 'If a baptism is in doubt' },
    @{ h = '#beklerken'; t = 'Bekleme süresi'; te = 'The waiting time' }) }
  ayin = @{ items = @(
    @{ h = '#toplanma'; t = 'Toplanma'; te = 'Gathering'; ico = 'MassIcons.gather' },
    @{ h = '#soz-liturjisi'; t = 'Söz'; te = 'Word'; ico = $IcoBook },
    @{ h = '#sunus'; t = 'Sunuş'; te = 'Gifts'; ico = 'MassIcons.gifts' },
    @{ h = '#sukran-duasi'; t = 'Şükran'; te = 'Eucharist'; ico = 'MassIcons.chalice' })
    more = @(
    @{ h = '#komunyon'; t = 'Komünyon'; te = 'The Communion Rite' },
    @{ h = '#son-takdis'; t = 'Son Takdis'; te = 'The Concluding Rites' }) }
  kitap = @{ items = @(
    @{ h = '#katolik-baski'; t = 'Katolik Baskı'; te = 'Catholic Edition'; ico = $SmallCross },
    @{ h = '#turkce'; t = 'Türkçe'; te = 'In Turkish'; ico = $IcoBook },
    @{ h = '#hangi-ceviri'; t = 'Hangi Çeviri?'; te = 'Which One?'; ico = $TbSteps },
    @{ h = '#oneri'; t = 'Önerimiz'; te = 'Our Pick'; ico = $IcoStar })
    more = @(@{ h = '#onayli'; t = 'Onaylı çeviriler'; te = 'Approved translations' }) }
  azizler = @{ items = @(
    @{ h = '#bugun-azizi'; t = 'Bugün'; te = 'Today'; ico = $TbToday },
    @{ h = '#takvim'; t = 'Takvim'; te = 'Calendar'; ico = $TbCal },
    @{ h = '#buyuk-azizler'; he = '#best-known-saints'; t = '20 Aziz'; te = 'Top 20'; ico = $IcoStar },
    @{ h = '#hareketli-bayramlar'; t = 'Bayramlar'; te = 'Feasts'; ico = $TbFeast }) }
}
$TbPages = @{
  'katesizm.html' = 'katekizm'; 'motu-proprio.html' = 'katekizm'; 'giris.html' = 'katekizm'; 'iman-ikrari.html' = 'katekizm'
  'kutsal-sirlar.html' = 'katekizm'; 'mesihte-yasam.html' = 'katekizm'; 'hristiyan-duasi.html' = 'katekizm'; 'ekler.html' = 'katekizm'
  'tesbih-duasi.html' = 'tesbih'; 'neden-katoligiz.html' = 'neden'; 'topraklarimizda-hristiyanlik.html' = 'tarih'
  'kiliseler.html' = 'kiliseler'; 'meseller.html' = 'meseller'; 'mucizeler.html' = 'mucizeler'; 'sss.html' = 'sss'
  'gunah-cikarma.html' = 'gunah'; 'katolik-sureci.html' = 'surec'; 'kutsal-ayin.html' = 'ayin'; 'azizler.html' = 'azizler'; 'kutsal-kitap.html' = 'kitap'
}
# The home screen app each page belongs to (Öğren, Dua Et, Keşfet): its colour on phones, set as
# data-app on the page's body by Write-Page; the home page's own lists follow the same grouping.
$AppOf = @{}
foreach ($f in @('neden-katoligiz.html', 'katesizm.html', 'kutsal-kitap.html', 'sss.html', 'katolik-sureci.html', 'meseller.html',
                 'motu-proprio.html', 'giris.html', 'iman-ikrari.html', 'kutsal-sirlar.html', 'mesihte-yasam.html', 'hristiyan-duasi.html')) { $AppOf[$f] = 'ogren' }
foreach ($f in @('kutsal-ayin.html', 'tesbih-duasi.html', 'ekler.html', 'gunah-cikarma.html')) { $AppOf[$f] = 'dua' }
foreach ($f in @('azizler.html', 'mucizeler.html', 'topraklarimizda-hristiyanlik.html', 'kiliseler.html')) { $AppOf[$f] = 'kesfet' }
foreach ($gs in $GreatSaints.saints) { $AppOf["$($gs.id).html"] = 'kesfet' }
function Tb-Href([string]$h, [bool]$en, [string]$he = '') {
  if ($en -and $he) { return $he }
  if ($h.StartsWith('#') -or -not $en) { return $h }
  $parts = $h -split '#', 2
  $p = $EnAltMap[$parts[0]]
  if ($parts.Count -gt 1) { return "$p#$($parts[1])" } else { return $p }
}
function Tab-Bar([string]$trFile, [string]$lang) {
  # The home page's own app icons do this job there
  if ($trFile -eq 'index.html') { return '' }
  $en = $lang -eq 'en'
  $key = $TbPages[$trFile]; if (-not $key) { $key = 'main' }
  $set = $TbSets[$key]
  $navLabel = if ($en) { 'Page menu' } else { 'Sayfa menüsü' }
  $closeLabel = if ($en) { 'Close' } else { 'Kapat' }
  $moreLabel = if ($en) { if ($set.moreLabelEn) { $set.moreLabelEn } else { 'More' } } else { if ($set.moreLabel) { $set.moreLabel } else { 'Diğer' } }
  $attrName = $set.attr
  $lis = ($set.items | ForEach-Object {
    $label = if ($en) { $_.te } else { $_.t }
    $ico = if ($_.n) { "<span class=`"tb-num`">$($_.n)</span>" } else { Tb-Ico $_.ico }
    $inner = "<span class=`"tb-ico`">$ico</span><span class=`"tb-t`">$label</span>"
    if ($_.rite) { "<li><button type=`"button`" class=`"tb-item`" data-tb-rite=`"$($_.rite)`">$inner</button></li>" }
    elseif ($_.action) { "<li><button type=`"button`" class=`"tb-item`" data-tb-action=`"$($_.action)`">$inner</button></li>" }
    else {
      $href = Tb-Href $_.h $en $_.he
      $isPage = -not $_.h.StartsWith('#')
      $active = if ($isPage -and $_.h -eq $trFile) { ' is-active" aria-current="page' } else { '' }
      $extra = if ($attrName -and -not $isPage) { " $attrName=`"$($href.Substring(1))`"" } else { '' }
      "<li><a class=`"tb-item$active`" href=`"$href`"$extra>$inner</a></li>"
    }
  }) -join ''
  $more = @($set.more | Where-Object { $_ })
  if (-not $set.cities -and $more.Count -eq 0) { return "<nav class=`"tabbar`" aria-label=`"$navLabel`"><ul class=`"tb-list`">$lis</ul></nav>" }
  # "Diğer": this page's remaining sections, nothing else. It lights up while one of them is the
  # page being read (build time, for page links) or the section on screen (script.js, for anchors).
  $moreActive = if ($more | Where-Object { $_.h -eq $trFile }) { ' is-active' } else { '' }
  $moreIco = if ($set.moreIco) { $set.moreIco } else { $TbMore }
  $lis += "<li><button type=`"button`" class=`"tb-item tb-more$moreActive`" aria-expanded=`"false`" aria-controls=`"tb-drawer`"><span class=`"tb-ico`">$moreIco</span><span class=`"tb-t`">$moreLabel</span></button></li>"
  if ($set.cities) {
    $allLabel = if ($en) { 'All Churches' } else { 'Tüm Kiliseler' }
    $body = "<button type=`"button`" class=`"tb-link tb-all`" data-tb-rite=`"all`">$allLabel</button><div class=`"tb-chips`">" +
      (($Churches.cities | ForEach-Object { "<a class=`"tb-chip`" href=`"#$($_.id)`" data-city-link=`"$($_.id)`">$($_.name)</a>" }) -join '') + "</div>"
  } else {
    $body = "<div class=`"tb-links`">" + (($more | ForEach-Object {
      $href = Tb-Href $_.h $en $_.he
      $extra = if ($attrName -and $_.h.StartsWith('#')) { " $attrName=`"$($href.Substring(1))`"" } else { '' }
      $cur = if ($_.h -eq $trFile) { ' aria-current="page"' } else { '' }
      "<a class=`"tb-link`" href=`"$href`"$extra$cur>$(if ($en) { $_.te } else { $_.t })</a>"
    }) -join '') + "</div>"
  }
  return "<nav class=`"tabbar`" aria-label=`"$navLabel`"><ul class=`"tb-list`">$lis</ul></nav>" +
    "<div class=`"tb-drawer`" id=`"tb-drawer`" hidden><div class=`"tb-backdrop`" data-tb-close></div>" +
    "<div class=`"tb-sheet`" role=`"dialog`" aria-modal=`"true`" aria-labelledby=`"tb-drawer-title`">" +
      "<div class=`"tb-sheet-head`"><p class=`"tb-drawer-title`" id=`"tb-drawer-title`">$moreLabel</p><button type=`"button`" class=`"tb-close icon-btn`" data-tb-close aria-label=`"$closeLabel`">$IcoClose</button></div>" +
      $body + "</div></div>"
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
# Settings panel, opened by the gear beside the logo: the language switch, then accessibility
# profile presets + individual toggles, state kept in localStorage (see script.js), CSS driven
# entirely by data-a11y-* attributes on <html> so it never touches position:fixed elements via
# `filter` (which would break their containing block). Defined here (before the first
# Write-Page call) and included on every page via Write-Page.
$A11yWidgetHtml = @"
<div class="a11y-panel glass" id="settings-panel" role="dialog" aria-modal="false" aria-labelledby="settings-title" hidden>
  <div class="a11y-head"><p class="a11y-title" id="settings-title">$IcoGear Ayarlar</p><button type="button" class="a11y-close icon-btn" aria-label="Kapat">$IcoClose</button></div>
  <div class="a11y-body">
    <p class="a11y-group-label">Dil</p>
    <a class="a11y-lang-switch" href="{{LANG_TARGET}}" lang="en" hreflang="en" aria-label="Switch to English">$IcoFlagEn<span>English</span></a>
    <p class="a11y-group-label">Erişilebilirlik Profilleri</p>
    <div class="a11y-profiles">
      <button type="button" class="a11y-profile" data-a11y-profile="motor" aria-pressed="false">$IcoWheelchair<span>Hareket Kısıtlılığı</span></button>
      <button type="button" class="a11y-profile" data-a11y-profile="blind" aria-pressed="false">$IcoEyeOff<span>Görme Engelli</span></button>
      <button type="button" class="a11y-profile" data-a11y-profile="colorblind" aria-pressed="false">$IcoDroplet<span>Renk Körlüğü</span></button>
      <button type="button" class="a11y-profile" data-a11y-profile="dyslexia" aria-pressed="false">$IcoBookOpen<span>Disleksi</span></button>
    </div>
    <p class="a11y-group-label">Erişilebilirlik Ayarları</p>
    <div class="a11y-toggles">
      <button type="button" class="a11y-tile" data-a11y-toggle="reader" aria-pressed="false">$IcoSpeaker<span>Ekran Okuyucu</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="contrast" aria-pressed="false">$IcoContrast<span>Kontrast Artır</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="saturation" aria-pressed="false">$IcoDroplet<span>Doygunluğu Azalt</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="bigtext" aria-pressed="false">$IcoTextSize<span>Büyük Yazı</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="spacing" aria-pressed="false">$IcoSpacing<span>Harf Aralığı</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="links" aria-pressed="false">$IcoLink<span>Bağlantıları Vurgula</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="dyslexia" aria-pressed="false">$IcoBookOpen<span>Disleksi Dostu Yazı</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="cursor" aria-pressed="false">$IcoCursor<span>Büyük İmleç</span></button>
    </div>
    <button type="button" class="a11y-reset">$IcoRefresh Tüm Ayarları Sıfırla</button>
    <p class="a11y-note">Ekran Okuyucu, tarayıcınızın konuşma sentezini kullanarak üzerine geldiğiniz metni sesli okur; gerçek bir ekran okuyucunun (VoiceOver, NVDA, TalkBack vb.) yerini tutmaz, sitenin kendisi zaten onlarla uyumludur.</p>
  </div>
</div>
"@
$A11yWidgetHtmlEn = @"
<div class="a11y-panel glass" id="settings-panel" role="dialog" aria-modal="false" aria-labelledby="settings-title" hidden>
  <div class="a11y-head"><p class="a11y-title" id="settings-title">$IcoGear Settings</p><button type="button" class="a11y-close icon-btn" aria-label="Close">$IcoClose</button></div>
  <div class="a11y-body">
    <p class="a11y-group-label">Language</p>
    <a class="a11y-lang-switch" href="{{LANG_TARGET}}" lang="tr" hreflang="tr" aria-label="Türkçeye geç">$IcoFlagTr<span>Türkçe</span></a>
    <p class="a11y-group-label">Accessibility Profiles</p>
    <div class="a11y-profiles">
      <button type="button" class="a11y-profile" data-a11y-profile="motor" aria-pressed="false">$IcoWheelchair<span>Motor Impaired</span></button>
      <button type="button" class="a11y-profile" data-a11y-profile="blind" aria-pressed="false">$IcoEyeOff<span>Blind</span></button>
      <button type="button" class="a11y-profile" data-a11y-profile="colorblind" aria-pressed="false">$IcoDroplet<span>Color Blind</span></button>
      <button type="button" class="a11y-profile" data-a11y-profile="dyslexia" aria-pressed="false">$IcoBookOpen<span>Dyslexia</span></button>
    </div>
    <p class="a11y-group-label">Accessibility Settings</p>
    <div class="a11y-toggles">
      <button type="button" class="a11y-tile" data-a11y-toggle="reader" aria-pressed="false">$IcoSpeaker<span>Screen Reader</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="contrast" aria-pressed="false">$IcoContrast<span>Increase Contrast</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="saturation" aria-pressed="false">$IcoDroplet<span>Reduce Saturation</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="bigtext" aria-pressed="false">$IcoTextSize<span>Bigger Text</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="spacing" aria-pressed="false">$IcoSpacing<span>Text Spacing</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="links" aria-pressed="false">$IcoLink<span>Highlight Links</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="dyslexia" aria-pressed="false">$IcoBookOpen<span>Dyslexia-Friendly Font</span></button>
      <button type="button" class="a11y-tile" data-a11y-toggle="cursor" aria-pressed="false">$IcoCursor<span>Big Cursor</span></button>
    </div>
    <button type="button" class="a11y-reset">$IcoRefresh Reset All Settings</button>
    <p class="a11y-note">Screen Reader uses your browser's built-in speech synthesis to read aloud whatever you point at; it is not a substitute for a real screen reader (VoiceOver, NVDA, TalkBack, etc.), which the site already works with on its own.</p>
  </div>
</div>
"@

function Search-Form([string]$cls, [string]$id, [string]$placeholder, [string]$lang = 'tr') {
  $action = if ($lang -eq 'en') { 'en/compendium.html' } else { 'katesizm.html' }
  $label = if ($lang -eq 'en') { 'Search the Compendium (English or Turkish, or a question number)' } else { "Özet$($Apos)te ara (Türkçe veya İngilizce, ya da soru numarası)" }
  return "<form class=`"search $cls`" role=`"search`" data-search action=`"$action`"><div class=`"search-field`">$IcoSearch" +
    "<label class=`"visually-hidden`" for=`"$id`">$label</label>" +
    "<input id=`"$id`" type=`"search`" name=`"q`" placeholder=`"$placeholder`" autocomplete=`"off`" enterkeyhint=`"search`"></div>" +
    "<div class=`"search-results`" hidden></div></form>"
}
function Cur([string]$href, [string]$current) { if ($href -eq $current) { return ' aria-current="page"' }; return '' }
function Header-Html([string]$current) {
  $coreMenu = ($CoreNav | ForEach-Object {
    $cls = if ($_.href -eq 'katesizm.html' -and $KatekizmPages -contains $current) { 'nav-link is-section' } else { 'nav-link' }
    "<li><a class=`"$cls`" href=`"$($_.href)`"$(Cur $_.href $current)>$($_.t)</a></li>"
  }) -join ''
  return @"
$Sprite
<a class="skip-link" href="#main">İçeriğe geç</a>
<header class="site-header">
  <div class="wrap">
    <div class="header-row">
      <div class="brand-group">
        <a class="brand" href="index.html"$(Cur 'index.html' $current)>$Logo<span class="brand-name">$SiteName</span></a>
        <button type="button" class="settings-btn" aria-label="Ayarlar: dil ve erişilebilirlik" aria-haspopup="dialog" aria-expanded="false" aria-controls="settings-panel">$IcoGear</button>
      </div>
      <nav class="mainnav" aria-label="Ana menü">
        <ul>$coreMenu</ul>
      </nav>
      <button type="button" class="icon-btn menu-toggle" aria-label="Menü" aria-expanded="false" aria-controls="navsheet" data-tooltip="Tüm Menü">$IcoMenuToggle</button>
      <div class="header-tools">
        <button type="button" class="theme-toggle" role="switch" aria-checked="false" aria-label="Koyu temaya geç">$IcoSun$IcoMoon<span class="knob" aria-hidden="true"></span></button>
      </div>
    </div>
  </div>
</header>
<div class="navsheet" id="navsheet" hidden>
  <div class="navsheet-panel glass" role="dialog" aria-modal="true" aria-label="Menü">
    <div class="ns-head">
      <p class="ns-date"><span data-ns-date></span> <time class="ns-time" data-ns-time>--:--:--</time></p>
      <div class="today-pills ns-today">
        <div class="today-pill"><span class="tp-ico"><span class="lit-dot" data-ns-season-dot></span></span><span><span class="tp-label">Litürjik Dönem</span><span class="tp-value hint" data-ns-season>Yükleniyor…</span></span></div>
        <a class="today-pill" href="tesbih-duasi.html"><span class="tp-ico">$IcoBeads</span><span><span class="tp-label">Günün Gizemi</span><span class="tp-value hint" data-ns-mystery>Yükleniyor…</span></span></a>
        <a class="today-pill" href="azizler.html"><span class="tp-ico">$IcoStar</span><span><span class="tp-label">Bugünün Azizi</span><span class="tp-value hint" data-ns-saint>Yükleniyor…</span></span></a>
      </div>
    </div>
    <nav class="ns-nav" aria-label="Menü">
$(Nav-Sheet 'tr' $current)
    </nav>
  </div>
</div>
"@
}
# The English site is a partial mirror (see $EnAltMap): only pages that actually have an English
# version appear in this nav. A page not yet translated is reached by staying on the Turkish site;
# the language switcher on an English page always has a valid Turkish target (every English page
# is generated from an existing Turkish one), and on a Turkish page with no translation yet it
# falls back to the English homepage rather than a dead link.
$TextNavEn = @(
  @{ href = 'en/motu-proprio.html';    t = 'Motu Proprio';                              s = 'Benedict XVI, 2005' },
  @{ href = 'en/introduction.html';           t = 'Introduction';                              s = 'Cardinal Ratzinger, 2005' },
  @{ href = 'en/profession-of-faith.html';     t = 'I. The Profession of Faith';                s = 'Questions 1–217' },
  @{ href = 'en/celebration-of-christian-mystery.html';   t = 'II. The Celebration of the Christian Mystery'; s = 'Questions 218–356' },
  @{ href = 'en/life-in-christ.html';   t = 'III. Life in Christ';                       s = 'Questions 357–533' },
  @{ href = 'en/christian-prayer.html'; t = 'IV. Christian Prayer';                      s = 'Questions 534–598' },
  @{ href = 'en/appendix.html';           t = 'Appendix';                                  s = 'Prayers and formulas' }
)
function Lang-Switch-Target([string]$current, [string]$lang) {
  $alt = $EnAltMap[$current]
  if ($alt) { return $alt }
  if ($lang -eq 'en') { return 'index.html' }
  return 'en/index.html'
}
# Mirrors the Turkish core four (Neden Katoliğiz?, Katekizm, Kilise Bul, Sorular).
$CoreNavEn = @(
  @{ href = 'en/why-were-catholic.html'; t = "Why We're Catholic" },
  @{ href = 'en/compendium.html';        t = 'Compendium' },
  @{ href = 'en/anatolia.html';          t = 'Christianity in Anatolia' },
  @{ href = 'en/find-a-church.html';     t = 'Find a Church' },
  @{ href = 'en/faq.html';               t = 'FAQ' }
)
$CompendiumPagesEn = @('en/compendium.html') + ($TextNavEn | ForEach-Object { $_.href })
function Header-Html-En([string]$current) {
  $coreMenu = ($CoreNavEn | ForEach-Object {
    $cls = if ($_.href -eq 'en/compendium.html' -and $CompendiumPagesEn -contains $current) { 'nav-link is-section' } else { 'nav-link' }
    "<li><a class=`"$cls`" href=`"$($_.href)`"$(Cur $_.href $current)>$($_.t)</a></li>"
  }) -join ''
  return @"
$Sprite
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <div class="header-row">
      <div class="brand-group">
        <a class="brand" href="en/index.html"$(Cur 'en/index.html' $current)>$Logo<span class="brand-name">$SiteName</span></a>
        <button type="button" class="settings-btn" aria-label="Settings: language and accessibility" aria-haspopup="dialog" aria-expanded="false" aria-controls="settings-panel">$IcoGear</button>
      </div>
      <nav class="mainnav" aria-label="Main menu">
        <ul>$coreMenu</ul>
      </nav>
      <button type="button" class="icon-btn menu-toggle" aria-label="Menu" aria-expanded="false" aria-controls="navsheet" data-tooltip="Full Menu">$IcoMenuToggle</button>
      <div class="header-tools">
        <button type="button" class="theme-toggle" role="switch" aria-checked="false" aria-label="Switch to dark theme">$IcoSun$IcoMoon<span class="knob" aria-hidden="true"></span></button>
      </div>
    </div>
  </div>
</header>
<div class="navsheet" id="navsheet" hidden>
  <div class="navsheet-panel glass" role="dialog" aria-modal="true" aria-label="Menu">
    <div class="ns-head">
      <p class="ns-date"><span data-ns-date></span> <time class="ns-time" data-ns-time>--:--:--</time></p>
      <div class="today-pills ns-today">
        <div class="today-pill"><span class="tp-ico"><span class="lit-dot" data-ns-season-dot></span></span><span><span class="tp-label">Liturgical Season</span><span class="tp-value hint" data-ns-season>Loading…</span></span></div>
        <a class="today-pill" href="en/rosary.html"><span class="tp-ico">$IcoBeads</span><span><span class="tp-label">Today's Mystery</span><span class="tp-value hint" data-ns-mystery>Loading…</span></span></a>
        <a class="today-pill" href="en/saints.html"><span class="tp-ico">$IcoStar</span><span><span class="tp-label">Today's Saint</span><span class="tp-value hint" data-ns-saint>Loading…</span></span></a>
      </div>
    </div>
    <nav class="ns-nav" aria-label="Menu">
$(Nav-Sheet 'en' $current)
    </nav>
  </div>
</div>
"@
}
$footKatekizm = (@(@{ href = 'katesizm.html'; t = 'Katekizm' }) + $TextNav) | ForEach-Object { "<li><a href=`"$($_.href)`">$($_.t)</a></li>" }
$footKaynaklar = $KaynaklarNav | ForEach-Object { "<li><a href=`"$($_.href)`">$($_.t)</a></li>" }
$footDualar = $PrayerNav | ForEach-Object { "<li><a href=`"$($_.href)`">$($_.t)</a></li>" }
$FooterHtml = @"
<footer class="site-footer">
  <div class="wrap foot-grid">
    <div class="foot-about">
      <a class="foot-brand" href="index.html">$Logo<span>$SiteName</span></a>
      <p class="foot-tag">$SiteTag</p>
      <p class="foot-desc">$($fm['about'])</p>
      <p class="foot-copy">Türkçe çeviriler ve özgün içerik © 2026 $SiteName</p>
      <p class="foot-copy foot-src"><button type="button" class="foot-sources" aria-haspopup="dialog" aria-controls="sources-dialog">$($fm['title'])</button><a class="foot-contact" href="iletisim.html">İletişim</a></p>
      <p class="foot-copy"><a href="mailto:david@katolikdunyasi.com">david@katolikdunyasi.com</a></p>
    </div>
    <nav class="foot-sitemap" aria-label="Site haritası">
      <div class="foot-col"><p class="foot-label">Katekizm</p><ul>$($footKatekizm -join '')</ul></div>
      <div class="foot-col"><p class="foot-label">Kaynaklar</p><ul>$($footKaynaklar -join '')</ul></div>
      <div class="foot-col"><p class="foot-label">Dualar</p><ul>$($footDualar -join '')</ul></div>
      <div class="foot-col"><p class="foot-label">Diğer</p><ul><li><a href="neden-katoligiz.html">Neden Katoliğiz?</a></li><li><a href="mucizeler.html">Mucizeler</a></li><li><a href="azizler.html">Azizler</a></li><li><a href="sss.html">Sorular</a></li><li><a href="iletisim.html">İletişim</a></li><li><a href="erisilebilirlik.html">Erişilebilirlik</a></li><li><a href="gizlilik.html">Gizlilik Politikası</a></li></ul></div>
    </nav>
  </div>
</footer>
<dialog class="sources-dialog" id="sources-dialog" aria-labelledby="sources-title">
  <button type="button" class="sources-close" aria-label="Kapat">$IcoClose</button>
  <h2 class="sources-title" id="sources-title">$($fm['title'])</h2>
  <div class="info-inner">$InfoHtml</div>
</dialog>
"@
# Same four columns as the Turkish footer; each only lists pages that have an English version.
$footCompendiumEn = (@(@{ href = 'en/compendium.html'; t = 'Compendium' }) + $TextNavEn) | ForEach-Object { "<li><a href=`"$($_.href)`">$($_.t)</a></li>" }
$footResourcesEn = @(
  @{ href = 'en/becoming-catholic.html'; t = 'Becoming Catholic' }, @{ href = 'en/confession.html'; t = 'Confession' },
  @{ href = 'en/mass.html'; t = 'The Holy Mass' }, @{ href = 'en/parables.html'; t = 'The Parables of Jesus' },
  @{ href = 'en/bible.html'; t = 'The Bible' }, @{ href = 'en/find-a-church.html'; t = 'Find a Church' },
  @{ href = 'en/anatolia.html'; t = 'Christianity in Anatolia' }
) | ForEach-Object { "<li><a href=`"$($_.href)`">$($_.t)</a></li>" }
$footPrayersEn = @(@{ href = 'en/rosary.html'; t = 'The Holy Rosary' }, @{ href = 'en/appendix.html'; t = 'Common Prayers' }) | ForEach-Object { "<li><a href=`"$($_.href)`">$($_.t)</a></li>" }
$FooterHtmlEn = @"
<footer class="site-footer">
  <div class="wrap foot-grid">
    <div class="foot-about">
      <a class="foot-brand" href="en/index.html">$Logo<span>$SiteName</span></a>
      <p class="foot-tag">$SiteTagEn</p>
      <p class="foot-desc">$($fmEn['about'])</p>
      <p class="foot-copy">English pages © 2026 $SiteName</p>
      <p class="foot-copy foot-src"><button type="button" class="foot-sources" aria-haspopup="dialog" aria-controls="sources-dialog">$($fmEn['title'])</button><a class="foot-contact" href="en/contact.html">Contact</a></p>
      <p class="foot-copy"><a href="mailto:david@katolikdunyasi.com">david@katolikdunyasi.com</a></p>
    </div>
    <nav class="foot-sitemap" aria-label="Sitemap">
      <div class="foot-col"><p class="foot-label">Compendium</p><ul>$($footCompendiumEn -join '')</ul></div>
      <div class="foot-col"><p class="foot-label">Resources</p><ul>$($footResourcesEn -join '')</ul></div>
      <div class="foot-col"><p class="foot-label">Prayers</p><ul>$($footPrayersEn -join '')</ul></div>
      <div class="foot-col"><p class="foot-label">Other</p><ul><li><a href="en/why-were-catholic.html">Why We're Catholic</a></li><li><a href="en/miracles.html">Miracles</a></li><li><a href="en/saints.html">Saints</a></li><li><a href="en/faq.html">FAQ</a></li><li><a href="en/contact.html">Contact</a></li><li><a href="en/accessibility.html">Accessibility</a></li><li><a href="en/privacy.html">Privacy Policy</a></li></ul></div>
    </nav>
  </div>
</footer>
<dialog class="sources-dialog" id="sources-dialog" aria-labelledby="sources-title">
  <button type="button" class="sources-close" aria-label="Close">$IcoClose</button>
  <h2 class="sources-title" id="sources-title">$($fmEn['title'])</h2>
  <div class="info-inner">$InfoHtmlEn</div>
</dialog>
"@
$EmailObfEval = [System.Text.RegularExpressions.MatchEvaluator]{
  param($m)
  $classMatch = [regex]::Match($m.Groups[1].Value, 'class="([^"]*)"')
  $cls = if ($classMatch.Success) { "$($classMatch.Groups[1].Value) email-link" } else { 'email-link' }
  "<a class=`"$cls`" data-u=`"david`" data-d=`"katolikdunyasi.com`" href=`"#`">$($script:EmailFallback)</a>"
}
function Write-Page {
  param([string]$File, [string]$Title, [string]$Description, [string]$Path, [string]$Body,
        [string[]]$JsonLd = @(), [string]$OgType = 'website',
        [string]$Robots = 'index,follow,max-snippet:-1,max-image-preview:large', [bool]$Canonical = $true, [bool]$RootRelative = $false,
        [string]$Lang = 'tr')
  $url = "$SiteUrl/$Path"
  # Search results show roughly 60 characters of a title; a long page name keeps its words
  # and drops the site-name suffix instead (og:site_name still carries it).
  $suffix = " | $SiteName"
  if ($Title.Length -gt 62 -and $Title.EndsWith($suffix)) { $Title = $Title.Substring(0, $Title.Length - $suffix.Length) }
  $ld = ($JsonLd | ForEach-Object { "<script type=`"application/ld+json`">$_</script>" }) -join "`n"
  $canon = if ($Canonical) { "<link rel=`"canonical`" href=`"$url`">" } else { '' }
  # Preload the regular text fonts so they start downloading with the stylesheet instead of
  # after it. Turkish body text needs both subsets (ç, ö, ü are in the base latin file; ğ, ş, İ
  # in latin-ext); English pages need only the base one.
  $fontFiles = if ($Lang -eq 'en') { @('eb-garamond-latin.woff2') } else { @('eb-garamond-latin.woff2', 'eb-garamond-latin-ext.woff2') }
  $preload = ($fontFiles | Where-Object { Test-Path (Join-Path $Root "assets/fonts/$_") } | ForEach-Object {
    "<link rel=`"preload`" href=`"assets/fonts/$_`" as=`"font`" type=`"font/woff2`" crossorigin>"
  }) -join "`n"
  # /en/ pages need root-relative asset/internal links too, same mechanism as 404.html.
  $rootRelativeEffective = $RootRelative -or ($Lang -eq 'en')
  $rootAttr = if ($rootRelativeEffective) { ' data-root="/"' } else { '' }
  $ogLocale = if ($Lang -eq 'en') { 'en_US' } else { 'tr_TR' }
  $altFile = $EnAltMap[$File]
  $hreflangTags = ''
  if ($altFile) {
    $altUrl = "$SiteUrl/$(Page-Path $altFile)"
    if ($Lang -eq 'en') {
      $hreflangTags = "<link rel=`"alternate`" hreflang=`"tr`" href=`"$altUrl`">`n<link rel=`"alternate`" hreflang=`"en`" href=`"$url`">`n<link rel=`"alternate`" hreflang=`"x-default`" href=`"$altUrl`">"
    } else {
      $hreflangTags = "<link rel=`"alternate`" hreflang=`"en`" href=`"$altUrl`">`n<link rel=`"alternate`" hreflang=`"tr`" href=`"$url`">`n<link rel=`"alternate`" hreflang=`"x-default`" href=`"$url`">"
    }
  }
  $headerHtml = if ($Lang -eq 'en') { Header-Html-En $File } else { Header-Html $File }
  $footerHtml = if ($Lang -eq 'en') { $FooterHtmlEn } else { $FooterHtml }
  $a11yLangTarget = Lang-Switch-Target $File $Lang
  # The home screen app a page belongs to (Öğren, Dua Et, Keşfet), for its colour on phones
  $trOf = if ($Lang -eq 'en') { $EnAltMap[$File] } else { $File }
  $appAttr = if ($AppOf -and $AppOf[$trOf]) { " data-app=`"$($AppOf[$trOf])`"" } else { '' }
  $a11yHtml = ($(if ($Lang -eq 'en') { $A11yWidgetHtmlEn } else { $A11yWidgetHtml })) -replace '\{\{LANG_TARGET\}\}', $a11yLangTarget
  $html = @"
<!DOCTYPE html>
<html lang="$Lang"$rootAttr>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>$(Attr $Title)</title>
<meta name="description" content="$(Attr $Description)">
<meta name="robots" content="$Robots">
$canon
$hreflangTags
<meta name="theme-color" content="#f8f5ee">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta property="og:type" content="$OgType">
<meta property="og:locale" content="$ogLocale">
<meta property="og:site_name" content="$(Attr $SiteName)">
<meta property="og:title" content="$(Attr $Title)">
<meta property="og:description" content="$(Attr $Description)">
<meta property="og:url" content="$url">
<meta property="og:image" content="$SiteUrl/assets/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="$(Attr $SiteName)">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="$(Attr $Title)">
<meta name="twitter:description" content="$(Attr $Description)">
<meta name="twitter:image" content="$SiteUrl/assets/og-image.jpg">
<link rel="icon" href="$Favicon" type="image/svg+xml">
$preload
<link rel="stylesheet" href="assets/styles.min.css?v=$CssVer">
<script>document.documentElement.classList.add('js');document.documentElement.setAttribute('data-theme','light');try{if(localStorage.getItem('kkio-theme')==='dark'){document.documentElement.setAttribute('data-theme','dark');var tc=document.querySelector('meta[name=theme-color]');if(tc)tc.setAttribute('content','#0f1728')}var fs=localStorage.getItem('kkio-fontsize');if(fs==='1'||fs==='2')document.documentElement.setAttribute('data-fontsize',fs);var a11y=JSON.parse(localStorage.getItem('kkio-a11y')||'{}');['contrast','saturation','spacing','links','dyslexia','cursor'].forEach(function(k){if(a11y[k])document.documentElement.setAttribute('data-a11y-'+k,'1')})}catch(e){}</script>
$ld
<script src="assets/script.min.js?v=$JsVer" defer></script>
</head>
<body$appAttr>
$headerHtml
<main id="main">
$Body
</main>
$footerHtml
$(Tab-Bar $(if ($Lang -eq 'en') { $EnAltMap[$File] } else { $File }) $Lang)
$a11yHtml
</body>
</html>
"@
  # 404.html and /en/ pages are not at a fixed directory depth (or are one level deep), so their
  # links must start at the site root rather than being relative to the file's own location.
  if ($rootRelativeEffective) { $html = [regex]::Replace($html, '(href|src)="(?!https?:|#|/|data:|mailto:)', '$1="/') }
  # The contact address is public on every page (footer) and a few others (İletişim, the About
  # panel, Erişilebilirlik, Gizlilik); catching it here once, after every page is assembled,
  # keeps it out of the raw HTML for basic scrapers without touching the markdown/build source
  # that writes it in plainly. JS reassembles the real mailto link on page load (see initEmail).
  $script:EmailFallback = if ($Lang -eq 'en') { '(email needs JavaScript)' } else { '(e-posta için JavaScript gerekli)' }
  $html = [regex]::Replace($html, '<a([^>]*)href="mailto:david@katolikdunyasi\.com"[^>]*>.*?</a>', $EmailObfEval)
  [IO.File]::WriteAllText((Join-Path $Root $File), $html, $Utf8)
  Write-Host "  + $File"
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
function Crumbs-En([string]$here, [string]$parentName = '', [string]$parentPath = '') {
  return ''
  $mid = if ($parentName) { "<a href=`"$parentPath`">$parentName</a><span aria-hidden=`"true`">›</span>" } else { '' }
  return "<nav class=`"crumbs`" aria-label=`"Breadcrumb`"><a href=`"en/index.html`">Home</a><span aria-hidden=`"true`">›</span>$mid<span aria-current=`"page`">$here</span></nav>"
}

Write-Host "Building pages ($SiteUrl)..."

# ================================================================== PART PAGES (1–4)
for ($i = 0; $i -lt 4; $i++) {
  $p = $Parts[$i]; $pn = [int]$p.part; $meta = $PartMeta[$pn]
  $items = @($p.items); $ranges = Get-Ranges $items
  $l1 = $items | Where-Object { $_.type -eq 'heading' -and $_.level -eq 1 } | Select-Object -First 1
  $script:EnSeq = 0

  $toc = ($items | Where-Object { $_.type -eq 'heading' -and $_.level -ge 2 } | ForEach-Object {
    $title = (Split-Heading $_.tr)[1]
    "<li class=`"t$($_.level)`"><a href=`"#$($_.id)`"><span>$(Inline $title)</span><span class=`"rng`">$(Range-Text $ranges[$_.id])</span></a></li>"
  }) -join ''

  $prev = if ($pn -gt 1) { "<a class=`"prev`" href=`"$($PartMeta[$pn - 1].file)`"><span class=`"label`">← $($PartMeta[$pn - 1].ord)</span><strong>$($Parts[$i - 1].tr)</strong></a>" } else { "<a class=`"prev`" href=`"giris.html`"><span class=`"label`">←</span><strong>Giriş</strong></a>" }
  $next = if ($pn -lt 4) { "<a class=`"next`" href=`"$($PartMeta[$pn + 1].file)`"><span class=`"label`">$($PartMeta[$pn + 1].ord) →</span><strong>$($Parts[$i + 1].tr)</strong></a>" } else { "<a class=`"next`" href=`"ekler.html`"><span class=`"label`">→</span><strong>Ekler</strong></a>" }

  $body = @"
<div class="wrap">
  $(Crumbs $meta.ord 'Katekizm' 'katesizm.html')
  <header class="page-head">
    <span class="roman" aria-hidden="true">$($meta.roman)</span>
    <div><p class="label">$($meta.ord) · Sorular $($p.from)–$($p.to)</p><h1>$($p.tr)</h1><p class="sub" lang="en">$($l1.en)</p></div>
  </header>
  <div class="reader">
    <nav class="toc" id="toc" aria-label="Bu kısmın içindekiler listesi">
      <div class="toc-inner">
        <button type="button" class="icon-btn toc-close" aria-label="İçindekileri kapat">$IcoClose</button>
        <p class="toc-title label">İçindekiler</p>
        <ol>$toc</ol>
      </div>
    </nav>
    <div class="content" id="content" data-reader>
      <div class="readbar">
        <button type="button" class="icon-btn toc-open" aria-controls="toc" aria-expanded="false" aria-label="İçindekiler">$IcoList</button>
        <p class="current">$($p.tr)</p>
        <button type="button" class="icon-btn" data-chapter="prev" aria-label="Önceki başlık">$IcoPrev</button>
        <button type="button" class="icon-btn" data-chapter="next" aria-label="Sonraki başlık">$IcoNext</button>
        <button type="button" class="btn" data-en-all="content" aria-pressed="false" title="Bütün soruların İngilizce aslını göster">$IcoGlobe<span class="btn-text">İngilizce</span></button>
        <button type="button" class="icon-btn rb-search-btn" aria-controls="rb-search" aria-expanded="false" aria-label="Katekizm$($Apos)de ara">$IcoSearch</button>
        <div class="rb-search" id="rb-search" hidden>$(Search-Form 'rb-form' 'q-part' 'Soru ara: Türkçe, İngilizce ya da numara')</div>
      </div>
$(Render-Items $items)
      <nav class="pager" aria-label="Kısımlar arası geçiş">$prev$next</nav>
    </div>
  </div>
</div>
"@
  $qas = $items | Where-Object { $_.type -eq 'qa' }
  $partFaqLd = '{"@context":"https://schema.org","@type":"FAQPage","inLanguage":"tr","name":' + (JStr "$($p.tr) - $SiteName") +
    ',"url":' + (JStr "$SiteUrl/$($meta.file)") + ',"mainEntity":[' + (($qas | ForEach-Object {
      '{"@type":"Question","name":' + (JStr "$($_.n). $(Plain $_.tr.q)") + ',"url":' + (JStr "$SiteUrl/$($meta.file)#soru-$($_.n)") +
      ',"acceptedAnswer":{"@type":"Answer","text":' + (JStr (Plain (($_.tr.a -split "`n") -join ' '))) + '}}'
    }) -join ',') + ']}'
  Write-Page -File $meta.file -Title "$($meta.ord): $($p.tr) (Sorular $($p.from)–$($p.to)) | $SiteName" -Description $meta.desc `
    -Path $meta.file -Body $body -JsonLd @($partFaqLd, (Breadcrumb-Ld $p.tr $meta.file 'Katekizm' 'katesizm.html')) -OgType 'article'
}

# ================================================================== EN PART PAGES (1–4): the original Compendium text, primary
for ($i = 0; $i -lt 4; $i++) {
  $p = $Parts[$i]; $pn = [int]$p.part; $meta = $PartMeta[$pn]
  $items = @($p.items); $ranges = Get-Ranges $items
  $l1 = $items | Where-Object { $_.type -eq 'heading' -and $_.level -eq 1 } | Select-Object -First 1
  $script:EnSeq = 0

  $tocEn = ($items | Where-Object { $_.type -eq 'heading' -and $_.level -ge 2 } | ForEach-Object {
    $titleEn = (Split-Heading $_.en)[1]
    "<li class=`"t$($_.level)`"><a href=`"#$($_.id)`"><span>$(Inline $titleEn)</span><span class=`"rng`">$(Range-Text $ranges[$_.id])</span></a></li>"
  }) -join ''

  $prevEn = if ($pn -gt 1) { "<a class=`"prev`" href=`"en/$($PartMeta[$pn - 1].fileEn)`"><span class=`"label`">← $($PartMeta[$pn - 1].ordEn)</span><strong>$($Parts[$i - 1].en)</strong></a>" } else { "<a class=`"prev`" href=`"en/introduction.html`"><span class=`"label`">←</span><strong>Introduction</strong></a>" }
  $nextEn = if ($pn -lt 4) { "<a class=`"next`" href=`"en/$($PartMeta[$pn + 1].fileEn)`"><span class=`"label`">$($PartMeta[$pn + 1].ordEn) →</span><strong>$($Parts[$i + 1].en)</strong></a>" } else { "<a class=`"next`" href=`"en/appendix.html`"><span class=`"label`">→</span><strong>Appendix</strong></a>" }

  $bodyEn = @"
<div class="wrap">
  $(Crumbs-En $meta.ordEn 'Compendium' 'en/compendium.html')
  <header class="page-head">
    <span class="roman" aria-hidden="true">$($meta.roman)</span>
    <div><p class="label">$($meta.ordEn) · Questions $($p.from)–$($p.to)</p><h1>$($p.en)</h1></div>
  </header>
  <div class="reader">
    <nav class="toc" id="toc" aria-label="Contents of this part">
      <div class="toc-inner">
        <button type="button" class="icon-btn toc-close" aria-label="Close contents">$IcoClose</button>
        <p class="toc-title label">Contents</p>
        <ol>$tocEn</ol>
      </div>
    </nav>
    <div class="content" id="content" data-reader>
      <div class="readbar">
        <button type="button" class="icon-btn toc-open" aria-controls="toc" aria-expanded="false" aria-label="Contents">$IcoList</button>
        <p class="current">$($p.en)</p>
        <button type="button" class="icon-btn" data-chapter="prev" aria-label="Previous heading">$IcoPrev</button>
        <button type="button" class="icon-btn" data-chapter="next" aria-label="Next heading">$IcoNext</button>
        <button type="button" class="btn" data-en-all="content" aria-pressed="false" title="Show the Turkish translation of every question">$IcoGlobe<span class="btn-text">Türkçe</span></button>
        <button type="button" class="icon-btn rb-search-btn" aria-controls="rb-search" aria-expanded="false" aria-label="Search the Compendium">$IcoSearch</button>
        <div class="rb-search" id="rb-search" hidden>$(Search-Form 'rb-form' 'q-part' 'Search: English, Turkish or a number' 'en')</div>
      </div>
$(Render-Items-En $items)
      <nav class="pager" aria-label="Between parts">$prevEn$nextEn</nav>
    </div>
  </div>
</div>
"@
  $enFile = "en/$($meta.fileEn)"
  $qasEn = $items | Where-Object { $_.type -eq 'qa' }
  $partFaqLdEn = '{"@context":"https://schema.org","@type":"FAQPage","inLanguage":"en","name":' + (JStr "$($p.en) - $SiteName") +
    ',"url":' + (JStr "$SiteUrl/$enFile") + ',"mainEntity":[' + (($qasEn | ForEach-Object {
      '{"@type":"Question","name":' + (JStr "$($_.n). $(Plain $_.en.q)") + ',"url":' + (JStr "$SiteUrl/$enFile#soru-$($_.n)") +
      ',"acceptedAnswer":{"@type":"Answer","text":' + (JStr (Plain (($_.en.a -split "`n") -join ' '))) + '}}'
    }) -join ',') + ']}'
  Write-Page -File $enFile -Title "$($meta.ordEn): $($p.en) (Questions $($p.from)–$($p.to)) | $SiteName" -Description $meta.descEn `
    -Path $enFile -Body $bodyEn -JsonLd @($partFaqLdEn, (Breadcrumb-Ld $p.en $enFile 'Compendium' 'en/compendium.html' 'en')) -OgType 'article' -Lang 'en'
}

# ================================================================== HOME (index.html): search + accordion of the four parts
$acc = ($Parts | ForEach-Object {
  $p = $_; $meta = $PartMeta[[int]$p.part]; $items = @($p.items); $ranges = Get-Ranges $items
  $nQ = @($items | Where-Object { $_.type -eq 'qa' }).Count
  $nS = @($items | Where-Object { $_.type -eq 'heading' -and $_.level -eq 2 }).Count
  $sb = New-Object Text.StringBuilder; $open = $false
  foreach ($h in ($items | Where-Object { $_.type -eq 'heading' -and $_.level -ge 2 -and $_.level -le 4 })) {
    $sp = Split-Heading $h.tr; $href = "$($meta.file)#$($h.id)"; $rt = Range-Text $ranges[$h.id]
    if ($h.level -eq 2) {
      if ($open) { [void]$sb.Append('</ul></div>') }
      [void]$sb.Append("<div class=`"acc-section`"><a href=`"$href`"><span class=`"label`">$($sp[0])</span><span class=`"s-title`">$(Inline $sp[1])</span></a><ul class=`"acc-list`">")
      $open = $true
    } elseif ($h.level -eq 3) {
      $lab = if ($sp[0]) { "<span class=`"c-label`">$($sp[0])</span>" } else { '' }
      [void]$sb.Append("<li class=`"lv3`"><a href=`"$href`"><span>$lab$(Inline $sp[1])</span><span class=`"rng`">$rt</span></a></li>")
    } else {
      [void]$sb.Append("<li class=`"lv4`"><a href=`"$href`"><span>$(Inline $sp[1])</span><span class=`"rng`">$rt</span></a></li>")
    }
  }
  if ($open) { [void]$sb.Append('</ul></div>') }
@"
<details class="part-acc" id="kisim-$($p.part)">
  <summary><span class="roman" aria-hidden="true">$($meta.roman)</span><span><span class="p-title"><span class="visually-hidden">$($meta.ord): </span>$($p.tr)</span><span class="p-meta label">$nQ soru · $nS bölüm · $($p.from)–$($p.to)</span></span>$IcoChevLg</summary>
  <div class="part-body">$($sb.ToString())<a class="btn btn-gold open-part" href="$($meta.file)">Kısmı oku</a></div>
</details>
"@
}) -join "`n"

# ---------------- katesizm.html: the Compendium landing page (search + the four parts)
$katesizmBody = @"
<div class="wrap narrow">
  $(Crumbs 'Katekizm')
  <section class="hero work-hero">
    $Logo
    <h1>$WorkName</h1>
    <p class="subtitle" lang="en">$SiteNameEn</p>
    <p class="hint">Başlıklarını görmek için bir kısmı açın ya da bir soru arayın.</p>
    $(Search-Form 'hero-search' 'q-katesizm' '598 soruda ara: Türkçe, İngilizce ya da soru numarası')
  </section>
  <div class="parts">
$acc
  </div>
  <div class="ornament">$SmallCross</div>
  <div class="more-texts">
    <a class="text-link" href="motu-proprio.html"><span class="label">Önsöz</span><span class="t-title">Motu Proprio</span><span class="t-sub">XVI. Benediktus, 28 Haziran 2005</span></a>
    <a class="text-link" href="giris.html"><span class="label">Önsöz</span><span class="t-title">Giriş</span><span class="t-sub">Kardinal Joseph Ratzinger, 20 Mart 2005</span></a>
    <a class="text-link" href="ekler.html"><span class="label">Ekler</span><span class="t-title">Dualar ve Formüller</span><span class="t-sub">A. Sık Kullanılan Dualar · B. Katolik Öğretinin Formülleri</span></a>
  </div>
  <p class="conventions">Kutsal Kitap göndermeleri Katolik kanonuna (Deuterokanonik kitaplar dahil) ve kaynak metindeki Katolik ayet numaralandırmasına göre verilmiştir. Türkçede farklı yazılan özel adların İngilizcesi ilk geçtikleri yerde parantez içinde verilir; ör. Petrus <span class="gloss">(Peter)</span>. İsa <span class="gloss">(Jesus)</span> ve Meryem <span class="gloss">(Mary)</span> adları sık geçtiği için yinelenmez. Her sorunun altındaki sayılar, Katolik Kilisesi Katekizmi’nin ilgili madde numaralarıdır.</p>
</div>
"@
$bookLd = '{"@context":"https://schema.org","@type":"Book","name":' + (JStr $WorkName) + ',"alternateName":' + (JStr "$SiteNameEn (Türkçe)") +
  ',"inLanguage":"tr","url":' + (JStr "$SiteUrl/katesizm.html") + ',"about":{"@type":"Thing","name":"Katolik Kilisesi"},' +
  '"translationOfWork":{"@type":"Book","name":' + (JStr $SiteNameEn) + ',"inLanguage":"en","datePublished":"2005-06-28","publisher":{"@type":"Organization","name":"Libreria Editrice Vaticana"}},' +
  '"hasPart":[' + (($Parts | ForEach-Object { '{"@type":"Chapter","name":' + (JStr $_.tr) + ',"url":' + (JStr "$SiteUrl/$($PartMeta[[int]$_.part].file)") + '}' }) -join ',') + ']}'
Write-Page -File 'katesizm.html' -Title "$WorkName | $SiteName" `
  -Description "Katolik Kilisesi Katekizmi Özeti$($Apos)nin (Compendium) Türkçe çevirisi: iman, kutsal sırlar, Hristiyan ahlakı ve dua üzerine 598 soru ve yanıt, İngilizce aslıyla." `
  -Path 'katesizm.html' -Body $katesizmBody -JsonLd @($bookLd, (Breadcrumb-Ld 'Katekizm' 'katesizm.html'))

# ---------------- en/compendium.html: the Compendium landing page, in English
$accEn = ($Parts | ForEach-Object {
  $p = $_; $meta = $PartMeta[[int]$p.part]; $items = @($p.items); $ranges = Get-Ranges $items
  $nQ = @($items | Where-Object { $_.type -eq 'qa' }).Count
  $nS = @($items | Where-Object { $_.type -eq 'heading' -and $_.level -eq 2 }).Count
  $sb = New-Object Text.StringBuilder; $open = $false
  foreach ($h in ($items | Where-Object { $_.type -eq 'heading' -and $_.level -ge 2 -and $_.level -le 4 })) {
    $sp = Split-Heading $h.en; $href = "en/$($meta.fileEn)#$($h.id)"; $rt = Range-Text $ranges[$h.id]
    if ($h.level -eq 2) {
      if ($open) { [void]$sb.Append('</ul></div>') }
      [void]$sb.Append("<div class=`"acc-section`"><a href=`"$href`"><span class=`"label`">$($sp[0])</span><span class=`"s-title`">$(Inline $sp[1])</span></a><ul class=`"acc-list`">")
      $open = $true
    } elseif ($h.level -eq 3) {
      $lab = if ($sp[0]) { "<span class=`"c-label`">$($sp[0])</span>" } else { '' }
      [void]$sb.Append("<li class=`"lv3`"><a href=`"$href`"><span>$lab$(Inline $sp[1])</span><span class=`"rng`">$rt</span></a></li>")
    } else {
      [void]$sb.Append("<li class=`"lv4`"><a href=`"$href`"><span>$(Inline $sp[1])</span><span class=`"rng`">$rt</span></a></li>")
    }
  }
  if ($open) { [void]$sb.Append('</ul></div>') }
@"
<details class="part-acc" id="kisim-$($p.part)">
  <summary><span class="roman" aria-hidden="true">$($meta.roman)</span><span><span class="p-title"><span class="visually-hidden">$($meta.ordEn): </span>$($p.en)</span><span class="p-meta label">$nQ questions · $nS sections · $($p.from)–$($p.to)</span></span>$IcoChevLg</summary>
  <div class="part-body">$($sb.ToString())<a class="btn btn-gold open-part" href="en/$($meta.fileEn)">Read this part</a></div>
</details>
"@
}) -join "`n"
$katesizmBodyEn = @"
<div class="wrap narrow">
  $(Crumbs-En 'Compendium')
  <section class="hero work-hero">
    $Logo
    <h1>$SiteNameEn</h1>
    <p class="hint">Open a part to see its headings, or search for a question.</p>
    $(Search-Form 'hero-search' 'q-katesizm' 'Search all 598 questions: English or Turkish, or a question number' 'en')
  </section>
  <div class="parts">
$accEn
  </div>
  <div class="ornament">$SmallCross</div>
  <div class="more-texts">
    <a class="text-link" href="en/motu-proprio.html"><span class="label">Foreword</span><span class="t-title">Motu Proprio</span><span class="t-sub">Benedict XVI, 28 June 2005</span></a>
    <a class="text-link" href="en/introduction.html"><span class="label">Foreword</span><span class="t-title">Introduction</span><span class="t-sub">Cardinal Joseph Ratzinger, 20 March 2005</span></a>
    <a class="text-link" href="en/appendix.html"><span class="label">Appendix</span><span class="t-title">Prayers and Formulas</span><span class="t-sub">A. Common Prayers · B. Formulas of Catholic Doctrine</span></a>
  </div>
  <p class="conventions">Scripture references follow the Catholic canon (including the Deuterocanonical books) and the Catholic verse numbering of the source text. The numbers under each question are the corresponding paragraph numbers of the Catechism of the Catholic Church. A Turkish translation of every question is available behind the "Türkçesi" toggle.</p>
</div>
"@
$bookLdEn = '{"@context":"https://schema.org","@type":"Book","name":' + (JStr $SiteNameEn) +
  ',"inLanguage":"en","url":' + (JStr "$SiteUrl/en/compendium.html") + ',"about":{"@type":"Thing","name":"Catholic Church"},' +
  '"datePublished":"2005-06-28","publisher":{"@type":"Organization","name":"Libreria Editrice Vaticana"},' +
  '"hasPart":[' + (($Parts | ForEach-Object { '{"@type":"Chapter","name":' + (JStr $_.en) + ',"url":' + (JStr "$SiteUrl/en/$($PartMeta[[int]$_.part].fileEn)") + '}' }) -join ',') + ']}'
Write-Page -File 'en/compendium.html' -Title "$SiteNameEn | $SiteName" `
  -Description 'The Compendium of the Catechism of the Catholic Church: 598 questions and answers on faith, sacraments, morality and prayer, each with a Turkish translation.' `
  -Path 'en/compendium.html' -Body $katesizmBodyEn -JsonLd @($bookLdEn, (Breadcrumb-Ld 'Compendium' 'en/compendium.html' '' '' 'en')) -Lang 'en'


# ================================================================== ARTICLE PAGES: Motu Proprio, Giriş (Turkish paragraph + English original on demand)
function Parallel-Paragraphs($trList, $enList) {
  $tr = @($trList); $en = @($enList); $sb = New-Object Text.StringBuilder
  for ($k = 0; $k -lt $tr.Count; $k++) {
    [void]$sb.Append("<p>$(Inline $tr[$k])</p>")
    if ($k -lt $en.Count) { [void]$sb.Append("<div class=`"en-block en-par`" lang=`"en`" hidden><p>$(Inline $en[$k])</p></div>") }
  }
  return $sb.ToString()
}
function Article-Page([string]$file, [string]$crumb, [string]$label, [string]$h1, [string]$sub, [string]$bodyHtml, [string]$desc, [string]$ld, [string]$titleOverride = '') {
  $body = @"
<div class="wrap">
  $(Crumbs $crumb 'Katekizm' 'katesizm.html')
  <article class="article" id="article">
    <header class="page-head center"><p class="label">$label</p><h1>$h1</h1><p class="sub" lang="en">$sub</p></header>
    <div class="article-tools"><button type="button" class="btn" data-en-all="article" aria-pressed="false">$IcoGlobe<span class="btn-label">İngilizce aslını göster</span></button></div>
    <div class="body">$bodyHtml</div>
  </article>
</div>
"@
  $pageTitle = if ($titleOverride) { $titleOverride } else { $h1 }
  Write-Page -File $file -Title "$pageTitle | $SiteName" -Description $desc -Path $file -Body $body -JsonLd @($ld, (Breadcrumb-Ld $crumb $file 'Katekizm' 'katesizm.html')) -OgType 'article'
}
function Parallel-Paragraphs-En($enList, $trList) {
  $en = @($enList); $tr = @($trList); $sb = New-Object Text.StringBuilder
  for ($k = 0; $k -lt $en.Count; $k++) {
    [void]$sb.Append("<p>$(Inline $en[$k])</p>")
    if ($k -lt $tr.Count) { [void]$sb.Append("<div class=`"en-block en-par`" lang=`"tr`" hidden><p>$(Inline $tr[$k])</p></div>") }
  }
  return $sb.ToString()
}
function Article-Page-En([string]$file, [string]$crumb, [string]$label, [string]$h1, [string]$bodyHtml, [string]$desc, [string]$ld, [string]$title = '') {
  $body = @"
<div class="wrap">
  $(Crumbs-En $crumb 'Compendium' 'en/compendium.html')
  <article class="article" id="article">
    <header class="page-head center"><p class="label">$label</p><h1>$h1</h1></header>
    <div class="article-tools"><button type="button" class="btn" data-en-all="article" aria-pressed="false">$IcoGlobe<span class="btn-label">Show Turkish translation</span></button></div>
    <div class="body">$bodyHtml</div>
  </article>
</div>
"@
  $t = if ($title) { $title } else { $h1 }
  Write-Page -File "en/$file" -Title "$t | $SiteName" -Description $desc -Path "en/$file" -Body $body -JsonLd @($ld, (Breadcrumb-Ld $crumb "en/$file" 'Compendium' 'en/compendium.html' 'en')) -OgType 'article' -Lang 'en'
}
$mp = $X.motuProprio
$mpBody = "<p class=`"address`">$($mp.tr.address)</p><div class=`"en-block en-par`" lang=`"en`" hidden><p class=`"address`">$($mp.en.address)</p></div>" +
  (Parallel-Paragraphs $mp.tr.paragraphs $mp.en.paragraphs) +
  "<div class=`"signature`">$((($mp.tr.closing | ForEach-Object { "<p>$(Inline $_)</p>" }) -join ''))<div class=`"en-block en-par`" lang=`"en`" hidden>$((($mp.en.closing | ForEach-Object { "<p>$_</p>" }) -join ''))</div></div>"
$mpLd = '{"@context":"https://schema.org","@type":"Article","headline":' + (JStr "Motu Proprio: $($mp.tr.title)") + ',"inLanguage":"tr","datePublished":"2005-06-28","author":{"@type":"Person","name":"Papa XVI. Benediktus"},"publisher":{"@type":"Organization","name":"Libreria Editrice Vaticana"},"mainEntityOfPage":' + (JStr "$SiteUrl/motu-proprio.html") + '}'
Article-Page 'motu-proprio.html' 'Motu Proprio' 'Motu Proprio' "Katolik Kilisesi Katekizmi Özeti$($Apos)nin Onaylanması ve Yayımlanması İçin Motu Proprio" `
  'Motu Proprio for the approval and publication of the Compendium of the Catechism of the Catholic Church' $mpBody `
  (Meta-Trim "Papa XVI. Benediktus$($Apos)un 28 Haziran 2005 tarihli Motu Proprio$($Apos)su: Katolik Kilisesi Katekizmi Özeti$($Apos)nin onaylanması ve yayımlanması. Türkçe çeviri ve İngilizce asıl metin.") $mpLd `
  "Motu Proprio: Katekizm Özeti$($Apos)nin Onaylanması"

$mpBodyEn = "<p class=`"address`">$($mp.en.address)</p><div class=`"en-block en-par`" lang=`"tr`" hidden><p class=`"address`">$($mp.tr.address)</p></div>" +
  (Parallel-Paragraphs-En $mp.en.paragraphs $mp.tr.paragraphs) +
  "<div class=`"signature`">$((($mp.en.closing | ForEach-Object { "<p>$_</p>" }) -join ''))<div class=`"en-block en-par`" lang=`"tr`" hidden>$((($mp.tr.closing | ForEach-Object { "<p>$(Inline $_)</p>" }) -join ''))</div></div>"
$mpLdEn = '{"@context":"https://schema.org","@type":"Article","headline":' + (JStr "Motu Proprio: $($mp.en.title)") + ',"inLanguage":"en","datePublished":"2005-06-28","author":{"@type":"Person","name":"Pope Benedict XVI"},"publisher":{"@type":"Organization","name":"Libreria Editrice Vaticana"},"mainEntityOfPage":' + (JStr "$SiteUrl/en/motu-proprio.html") + '}'
Article-Page-En 'motu-proprio.html' 'Motu Proprio' 'Motu Proprio' 'Motu Proprio: for the Approval and Publication of the Compendium of the Catechism of the Catholic Church' $mpBodyEn `
  (Meta-Trim "Pope Benedict XVI's Motu Proprio of 28 June 2005: the approval and publication of the Compendium of the Catechism of the Catholic Church.") $mpLdEn `
  -title 'Motu Proprio: Approving the Compendium'

$in = $X.introduction
$inBody = (Parallel-Paragraphs $in.tr.paragraphs $in.en.paragraphs) +
  "<div class=`"signature`">$((($in.tr.closing | ForEach-Object { "<p>$_</p>" }) -join ''))<div class=`"en-block en-par`" lang=`"en`" hidden>$((($in.en.closing | ForEach-Object { "<p>$_</p>" }) -join ''))</div></div>" +
  "<div class=`"footnotes`">$(Parallel-Paragraphs $in.tr.footnotes $in.en.footnotes)</div>"
$inLd = '{"@context":"https://schema.org","@type":"Article","headline":"Giriş","inLanguage":"tr","datePublished":"2005-03-20","author":{"@type":"Person","name":"Kardinal Joseph Ratzinger"},"mainEntityOfPage":' + (JStr "$SiteUrl/giris.html") + '}'
Article-Page 'giris.html' 'Giriş' 'Önsöz' 'Giriş' 'Introduction' $inBody `
  (Meta-Trim "Katolik Kilisesi Katekizmi Özeti$($Apos)nin Girişi (Kardinal Joseph Ratzinger, 2005): Özet$($Apos)in hazırlanışı, üç temel özelliği ve dört kısmı. Türkçe çeviri ve İngilizce asıl metin.") $inLd

$inBodyEn = (Parallel-Paragraphs-En $in.en.paragraphs $in.tr.paragraphs) +
  "<div class=`"signature`">$((($in.en.closing | ForEach-Object { "<p>$_</p>" }) -join ''))<div class=`"en-block en-par`" lang=`"tr`" hidden>$((($in.tr.closing | ForEach-Object { "<p>$_</p>" }) -join ''))</div></div>" +
  "<div class=`"footnotes`">$(Parallel-Paragraphs-En $in.en.footnotes $in.tr.footnotes)</div>"
$inLdEn = '{"@context":"https://schema.org","@type":"Article","headline":"Introduction","inLanguage":"en","datePublished":"2005-03-20","author":{"@type":"Person","name":"Cardinal Joseph Ratzinger"},"mainEntityOfPage":' + (JStr "$SiteUrl/en/introduction.html") + '}'
Article-Page-En 'introduction.html' 'Introduction' 'Foreword' 'Introduction' $inBodyEn `
  (Meta-Trim "The Introduction to the Compendium of the Catechism of the Catholic Church (Cardinal Joseph Ratzinger, 2005): how the Compendium was prepared, its three key features and its four parts.") $inLdEn

# ================================================================== APPENDIX (ekler.html)
$prayers = ($X.appendix.prayers | ForEach-Object { Text-Card $_ $_.id 3 "<div class=`"verse`">$(Verse $_.tr.text)</div>" "<div class=`"verse`">$(Verse $_.en.text)</div>" }) -join "`n"
$formulas = ($X.appendix.formulas | ForEach-Object {
  $cls = if ($_.tr.plain) { ' class="plain"' } else { '' }
  $tr = "<div class=`"verse`"><ol$cls>" + (($_.tr.items | ForEach-Object { "<li>$(Inline $_)</li>" }) -join '') + '</ol></div>'
  $en = "<div class=`"verse`"><ol$cls>" + (($_.en.items | ForEach-Object { "<li>$_</li>" }) -join '') + '</ol></div>'
  Text-Card ([pscustomobject]@{ tr = $_.tr; en = $_.en; la = $null }) $_.id 3 $tr $en
}) -join "`n"
$eklerBody = @"
<div class="wrap narrow" id="ekler">
  $(Crumbs 'Ekler' 'Katekizm' 'katesizm.html')
  <header class="page-head center"><p class="label">Ekler</p><h1>Ekler</h1><p class="sub" lang="en">Appendix</p></header>
  <div class="article-tools"><button type="button" class="btn" data-en-all="ekler" aria-pressed="false">$IcoGlobe<span class="btn-label">İngilizce aslını göster</span></button></div>
  <h2 class="section-title" id="ek-a"><span class="label">A</span>Sık Kullanılan Dualar</h2>
  <div class="text-grid two">
$prayers
  </div>
  <h2 class="section-title" id="ek-b"><span class="label">B</span>Katolik Öğretinin Formülleri</h2>
  <div class="text-grid two">
$formulas
  </div>
</div>
"@
Write-Page -File 'ekler.html' -Title "Ekler: Dualar ve Katolik Öğreti Formülleri | $SiteName" `
  -Description "Katolik Kilisesi Katekizmi Özeti Ekleri: Türkçe, İngilizce ve Latince sık kullanılan dualar ve Katolik öğretinin formülleri." `
  -Path 'ekler.html' -Body $eklerBody -JsonLd @((Breadcrumb-Ld 'Ekler' 'ekler.html' 'Katekizm' 'katesizm.html'))

$prayersEn = ($X.appendix.prayers | ForEach-Object { Text-Card-En $_ $_.id 3 "<div class=`"verse`">$(Verse $_.en.text)</div>" "<div class=`"verse`">$(Verse $_.tr.text)</div>" }) -join "`n"
$formulasEn = ($X.appendix.formulas | ForEach-Object {
  $cls = if ($_.tr.plain) { ' class="plain"' } else { '' }
  $tr = "<div class=`"verse`"><ol$cls>" + (($_.tr.items | ForEach-Object { "<li>$(Inline $_)</li>" }) -join '') + '</ol></div>'
  $en = "<div class=`"verse`"><ol$cls>" + (($_.en.items | ForEach-Object { "<li>$_</li>" }) -join '') + '</ol></div>'
  Text-Card-En ([pscustomobject]@{ tr = $_.tr; en = $_.en; la = $null }) $_.id 3 $en $tr
}) -join "`n"
$eklerBodyEn = @"
<div class="wrap narrow" id="ekler">
  $(Crumbs-En 'Appendix' 'Compendium' 'en/compendium.html')
  <header class="page-head center"><p class="label">Appendix</p><h1>Appendix</h1></header>
  <div class="article-tools"><button type="button" class="btn" data-en-all="ekler" aria-pressed="false">$IcoGlobe<span class="btn-label">Show Turkish translation</span></button></div>
  <h2 class="section-title" id="ek-a"><span class="label">A</span>Common Prayers</h2>
  <div class="text-grid two">
$prayersEn
  </div>
  <h2 class="section-title" id="ek-b"><span class="label">B</span>Formulas of Catholic Doctrine</h2>
  <div class="text-grid two">
$formulasEn
  </div>
</div>
"@
Write-Page -File 'en/appendix.html' -Title "Appendix: Common Prayers and Formulas of Catholic Doctrine | $SiteName" `
  -Description 'Appendix to the Compendium of the Catechism: common Catholic prayers and formulas of doctrine in English, with Turkish and Latin texts on demand.' `
  -Path 'en/appendix.html' -Body $eklerBodyEn -JsonLd @((Breadcrumb-Ld 'Appendix' 'en/appendix.html' 'Compendium' 'en/compendium.html' 'en')) -Lang 'en'

# ================================================================== SSS (sss.html): questions from non-Catholics and newcomers
# Plain <details>/<summary> accordions: they open without JavaScript, are searchable by the
# browser find-in-page in supporting browsers, and each carries the CCC paragraphs it rests on.
$script:FaqN = 0
$faqToc = ($FaqData.categories | ForEach-Object { "<li><a href=`"#$($_.id)`">$(Inline $_.title)</a></li>" }) -join ''
$faqCats = ($FaqData.categories | ForEach-Object {
  $script:FaqN++; $cat = $_
  $qs = ($cat.items | ForEach-Object {
    "<details class=`"faq-item`" id=`"$($_.id)`">" +
      "<summary><span class=`"faq-q`">$(Inline $_.q)</span>$IcoChevLg</summary>" +
      "<div class=`"faq-a`">" +
        "<p class=`"faq-ref`" title=`"Katolik Kilisesi Katekizmi madde numaraları`">$(Ccc-Link $_.ccc 'tr')</p>" +
        "$(Blocks $_.a)</div>" +
    "</details>"
  }) -join "`n"
  "<section class=`"faq-cat`" id=`"$($cat.id)`">" +
    "<h2 class=`"section-title`"><span class=`"label`">$($script:FaqN)</span>$(Inline $cat.title)</h2>" +
    "<p class=`"faq-cat-en`" lang=`"en`">$($cat.en)</p>" +
    "<div class=`"faq-list`">$qs</div></section>"
}) -join "`n"
$faqLd = '{"@context":"https://schema.org","@type":"FAQPage","inLanguage":"tr","name":' + (JStr $FaqData.title) +
  ',"url":' + (JStr "$SiteUrl/sss.html") + ',"mainEntity":[' + ((($FaqData.categories | ForEach-Object { $_.items }) | ForEach-Object {
    '{"@type":"Question","name":' + (JStr (Plain $_.q)) + ',"url":' + (JStr "$SiteUrl/sss.html#$($_.id)") +
    ',"acceptedAnswer":{"@type":"Answer","text":' + (JStr (Plain (($_.a -split "`n") -join ' '))) + '}}'
  }) -join ',') + ']}'
$sssBody = @"
<div class="wrap narrow">
  $(Crumbs 'Sıkça Sorulan Sorular')
  <header class="page-head center">$(Page-Ico $IcoQuestion)<h1>$(Inline $FaqData.title)</h1><p class="sub" lang="en">$($FaqData.en)</p></header>
  <nav class="faq-toc is-sticky" aria-label="Kategoriler"><ul>$faqToc</ul></nav>
$faqCats
</div>
"@
Write-Page -File 'sss.html' -Title "$($FaqData.title) | $SiteName" `
  -Description "Katolik Kilisesi hakkında sık sorulan sorular ve Katekizm$($Apos)e dayanan yanıtlar: Meryem ve azizlere saygı, Kutsal Üçlü, günah çıkarma, papalık, araf, evrim." `
  -Path 'sss.html' -Body $sssBody -JsonLd @($faqLd, (Breadcrumb-Ld 'Sıkça Sorulan Sorular' 'sss.html'))

# ---------------- en/faq.html: Frequently Asked Questions, in English
$script:FaqNEn = 0
$faqTocEn = ($FaqData.categories | ForEach-Object { "<li><a href=`"#$($_.id)`">$($_.en)</a></li>" }) -join ''
$faqCatsEn = ($FaqData.categories | ForEach-Object {
  $script:FaqNEn++; $cat = $_
  $qs = ($cat.items | ForEach-Object {
    "<details class=`"faq-item`" id=`"$($_.id)`">" +
      "<summary><span class=`"faq-q`">$(Inline $_.qEn)</span>$IcoChevLg</summary>" +
      "<div class=`"faq-a`">" +
        "<p class=`"faq-ref`" title=`"Catechism of the Catholic Church paragraph numbers`">$(Ccc-Link $_.ccc 'en')</p>" +
        "$(Blocks $_.aEn)</div>" +
    "</details>"
  }) -join "`n"
  "<section class=`"faq-cat`" id=`"$($cat.id)`">" +
    "<h2 class=`"section-title`"><span class=`"label`">$($script:FaqNEn)</span>$($cat.en)</h2>" +
    "<div class=`"faq-list`">$qs</div></section>"
}) -join "`n"
$faqLdEn = '{"@context":"https://schema.org","@type":"FAQPage","inLanguage":"en","name":' + (JStr $FaqData.en) +
  ',"url":' + (JStr "$SiteUrl/en/faq.html") + ',"mainEntity":[' + ((($FaqData.categories | ForEach-Object { $_.items }) | ForEach-Object {
    '{"@type":"Question","name":' + (JStr (Plain $_.qEn)) + ',"url":' + (JStr "$SiteUrl/en/faq.html#$($_.id)") +
    ',"acceptedAnswer":{"@type":"Answer","text":' + (JStr (Plain (($_.aEn -split "`n") -join ' '))) + '}}'
  }) -join ',') + ']}'
$sssBodyEn = @"
<div class="wrap narrow">
  $(Crumbs-En 'FAQ')
  <header class="page-head center">$(Page-Ico $IcoQuestion)<h1>$($FaqData.en)</h1></header>
  <nav class="faq-toc is-sticky" aria-label="Categories"><ul>$faqTocEn</ul></nav>
$faqCatsEn
</div>
"@
Write-Page -File 'en/faq.html' -Title "$($FaqData.en) | $SiteName" `
  -Description 'Common questions about the Catholic faith, answered from the Catechism: Mary and the saints, the Trinity, confession, the papacy, purgatory and more.' `
  -Path 'en/faq.html' -Body $sssBodyEn -JsonLd @($faqLdEn, (Breadcrumb-Ld 'FAQ' 'en/faq.html' '' '' 'en')) -Lang 'en'

# ================================================================== KUTSAL KITAP (kutsal-kitap.html)
$kkBody = @"
<div class="wrap narrow">
  $(Crumbs 'Kutsal Kitap')
  <header class="page-head center">$(Page-Ico $IcoBible)<h1>$($KkMeta.title)</h1><p class="sub">$($KkMeta.subtitle)</p></header>
  <div class="body prose kk-body">$(Convert-Markdown $Kk.body)</div>
</div>
"@
Write-Page -File 'kutsal-kitap.html' -Title "$($KkMeta.title) | $SiteName" -Description $KkMeta.description `
  -Path 'kutsal-kitap.html' -Body $kkBody -JsonLd @((Breadcrumb-Ld 'Kutsal Kitap' 'kutsal-kitap.html'))

# ---------------- en/bible.html: The Bible, in English
$kkBodyEn = @"
<div class="wrap narrow">
  $(Crumbs-En 'The Bible')
  <header class="page-head center">$(Page-Ico $IcoBible)<h1>$($KkMetaEn.title)</h1><p class="sub">$($KkMetaEn.subtitle)</p></header>
  <div class="body prose kk-body">$(Convert-Markdown $KkEn.body)</div>
</div>
"@
Write-Page -File 'en/bible.html' -Title "$($KkMetaEn.title) | $SiteName" -Description $KkMetaEn.description `
  -Path 'en/bible.html' -Body $kkBodyEn -JsonLd @((Breadcrumb-Ld 'The Bible' 'en/bible.html' '' '' 'en')) -Lang 'en'

# ================================================================== KATOLIK SURECI (katolik-sureci.html)
$pathCards = ($Sureci.paths | ForEach-Object {
  "<article class=`"text-card`"><h3 class=`"t-title`">$(Inline $_.title)</h3><div class=`"verse`">$(Verse $_.text)</div></article>"
}) -join ""
$stageList = ($Sureci.steps | ForEach-Object {
  $i = [array]::IndexOf(@($Sureci.steps), $_) + 1
  "<li class=`"stage`"><span class=`"stage-n`">$i</span><div class=`"stage-body`"><h3>$(Inline $_.title)</h3><p class=`"stage-en label`" lang=`"en`">$($_.en)</p><p>$(Inline $_.text)</p></div></li>"
}) -join "`n"
$sureciFaq = ($Sureci.faq | ForEach-Object {
  "<details class=`"faq-item`" id=`"$($_.id)`"><summary><span class=`"faq-q`">$(Inline $_.q)</span>$IcoChevLg</summary>" +
    "<div class=`"faq-a`"><p>$(Inline $_.a)</p></div></details>"
}) -join "`n"
$sureciBody = @"
<div class="wrap narrow">
  $(Crumbs 'Katolik Olma Süreci')
  <header class="page-head center">$(Page-Ico $IcoDoor)<h1>$($Sureci.title)</h1><p class="sub" lang="en">$($Sureci.en)</p></header>
  <p class="faq-intro">$(Inline $Sureci.intro)</p>
  <h2 class="section-title" id="iki-yol"><span class="label">1</span>İki Yol</h2>
  <div class="text-grid two">$pathCards</div>
  <h2 class="section-title" id="surec"><span class="label">2</span>Süreç Adım Adım</h2>
  <p class="faq-intro">$(Inline $Sureci.processIntro)</p>
  <ol class="stage-list">
$stageList
  </ol>
  <h2 class="section-title" id="zaten-hristiyan"><span class="label">3</span>$($Sureci.already.title)</h2>
  <div class="prose">$(Blocks $Sureci.already.body)</div>
  <h2 class="section-title" id="sartli-vaftiz"><span class="label">4</span>$($Sureci.conditional.title)</h2>
  <div class="prose">$(Blocks $Sureci.conditional.body)</div>
  <h2 class="section-title" id="beklerken"><span class="label">5</span>$($Sureci.waiting.title)</h2>
  <div class="prose">$(Blocks $Sureci.waiting.body)</div>
  <h2 class="section-title" id="pratik-sorular"><span class="label">6</span>Pratik Sorular</h2>
  <div class="faq-list">
$sureciFaq
  </div>
  <p class="conventions">Bu sayfadaki genel OCIA süreci evrensel bir Kilise düzenlemesidir (1972, Tanrısal Kült Cemaati); yukarıdaki bazı ayrıntılar (Paskalya Nöbeti dışında kabul, günah çıkarmanın zamanlaması gibi) ABD Katolik Episkoposlar Konferansı’nın Katekümenlik İçin Ulusal Tüzüğü’nden (1986) alınmıştır. Kendi bölgenizdeki uygulama için en yakın cemaat kilisenize danışın.</p>
</div>
"@
Write-Page -File 'katolik-sureci.html' -Title "$($Sureci.title) | $SiteName" `
  -Description "Katolik olmak isteyenler için: OCIA/RCIA süreci nedir, vaftizli ve vaftizsiz adaylar için adım adım nasıl işler, hangi hazırlık gerekir." `
  -Path 'katolik-sureci.html' -Body $sureciBody -JsonLd @((Breadcrumb-Ld 'Katolik Olma Süreci' 'katolik-sureci.html'))

# ---------------- en/becoming-catholic.html: Becoming Catholic (the OCIA process), in English
$pathCardsEn = ($Sureci.paths | ForEach-Object {
  "<article class=`"text-card`"><h3 class=`"t-title`">$(Inline $_.titleEn)</h3><div class=`"verse`">$(Verse $_.textEn)</div></article>"
}) -join ""
$stageListEn = ($Sureci.steps | ForEach-Object {
  $i = [array]::IndexOf(@($Sureci.steps), $_) + 1
  "<li class=`"stage`"><span class=`"stage-n`">$i</span><div class=`"stage-body`"><h3>$(Inline $_.en)</h3><p>$(Inline $_.textEn)</p></div></li>"
}) -join "`n"
$sureciFaqEn = ($Sureci.faq | ForEach-Object {
  "<details class=`"faq-item`" id=`"$($_.id)`"><summary><span class=`"faq-q`">$(Inline $_.qEn)</span>$IcoChevLg</summary>" +
    "<div class=`"faq-a`"><p>$(Inline $_.aEn)</p></div></details>"
}) -join "`n"
$sureciBodyEn = @"
<div class="wrap narrow">
  $(Crumbs-En 'Becoming Catholic')
  <header class="page-head center">$(Page-Ico $IcoDoor)<h1>Becoming Catholic</h1></header>
  <p class="faq-intro">$(Inline $Sureci.introEn)</p>
  <h2 class="section-title" id="iki-yol"><span class="label">1</span>Two Paths</h2>
  <div class="text-grid two">$pathCardsEn</div>
  <h2 class="section-title" id="surec"><span class="label">2</span>The Process, Step by Step</h2>
  <p class="faq-intro">$(Inline $Sureci.processIntroEn)</p>
  <ol class="stage-list">
$stageListEn
  </ol>
  <h2 class="section-title" id="zaten-hristiyan"><span class="label">3</span>$($Sureci.already.titleEn)</h2>
  <div class="prose">$(Blocks $Sureci.already.bodyEn)</div>
  <h2 class="section-title" id="sartli-vaftiz"><span class="label">4</span>$($Sureci.conditional.titleEn)</h2>
  <div class="prose">$(Blocks $Sureci.conditional.bodyEn)</div>
  <h2 class="section-title" id="beklerken"><span class="label">5</span>$($Sureci.waiting.titleEn)</h2>
  <div class="prose">$(Blocks $Sureci.waiting.bodyEn)</div>
  <h2 class="section-title" id="pratik-sorular"><span class="label">6</span>Practical Questions</h2>
  <div class="faq-list">
$sureciFaqEn
  </div>
  <p class="conventions">The general OCIA process on this page is a universal Church regulation (1972, Congregation for Divine Worship); some details above (such as reception outside the Easter Vigil, or the timing of confession) are drawn from the U.S. Conference of Catholic Bishops' National Statutes for the Catechumenate (1986). For practice in your own region, ask your nearest parish.</p>
</div>
"@
Write-Page -File 'en/becoming-catholic.html' -Title "Becoming Catholic | $SiteName" `
  -Description 'How to become Catholic: what the OCIA/RCIA process is, how it works step by step for baptized and unbaptized candidates, and how to prepare.' `
  -Path 'en/becoming-catholic.html' -Body $sureciBodyEn -JsonLd @((Breadcrumb-Ld 'Becoming Catholic' 'en/becoming-catholic.html' '' '' 'en')) -Lang 'en'

# ================================================================== GUNAH CIKARMA (gunah-cikarma.html)
$confessionSteps = ($Confession.steps | ForEach-Object {
  $i = [array]::IndexOf(@($Confession.steps), $_) + 1
  "<li class=`"stage`"><span class=`"stage-n`">$i</span><div class=`"stage-body`"><h3>$(Inline $_.title)</h3><p class=`"stage-en label`" lang=`"en`">$($_.en)</p><p>$(Inline $_.text)</p></div></li>"
}) -join "`n"
$examenGroups = ($Confession.examenGroups | ForEach-Object {
  $group = $_
  $items = ($group.items | ForEach-Object {
    "<li>$(Inline $_)</li>"
  }) -join ''
  "<article class=`"text-card examen-card`"><h3 class=`"t-title examen-title`">$(Inline $group.title)</h3><ul class=`"examen-list`">$items</ul></article>"
}) -join "`n"
$confessionFaq = ($Confession.faq | ForEach-Object {
  "<details class=`"faq-item`" id=`"$($_.id)`"><summary><span class=`"faq-q`">$(Inline $_.q)</span>$IcoChevLg</summary>" +
    "<div class=`"faq-a`"><p>$(Inline $_.a)</p></div></details>"
}) -join "`n"
$sealMartyrsItems = ($Confession.sealMartyrs.items | ForEach-Object {
  "<li><strong>$(Inline $_.name)</strong> $(Inline $_.detail)</li>"
}) -join "`n"
$sealMartyrsHtml = "<aside class=`"footnote-block`" id=`"muhur-sehitleri`"><p class=`"footnote-label`">* $(Inline $Confession.sealMartyrs.title)</p><p>$(Inline $Confession.sealMartyrs.intro)</p><ul class=`"footnote-list`">$sealMartyrsItems</ul></aside>"
$confessionBody = @"
<div class="wrap narrow">
  $(Crumbs 'Günah Çıkarma')
  <header class="page-head center">$(Page-Ico $IcoKey)<h1>$($Confession.title)</h1><p class="sub" lang="en">$($Confession.en)</p></header>
  <p class="faq-intro">$(Inline $Confession.intro)</p>
  <h2 class="section-title" id="adim-adim"><span class="label">1</span>Nasıl İşler? Adım Adım</h2>
  <ol class="stage-list">
$confessionSteps
  </ol>
  <h2 class="section-title" id="vicdan-muhasebesi"><span class="label">2</span>Vicdan Muhasebesi</h2>
  <p class="faq-intro">$(Inline $Confession.examenIntro)</p>
  <div class="text-grid two examen-grid">
$examenGroups
  </div>
  <h2 class="section-title" id="sorular-ve-korkular"><span class="label">3</span>Sık Sorulan Sorular ve Korkular</h2>
  <div class="faq-list">
$confessionFaq
  </div>
  $sealMartyrsHtml
  <p class="conventions">Bu sayfa, Katolik Kilisesi Katekizmi’nin Tövbe ve Barışma Kutsal Sırrı üzerine öğretisine (<a href="https://www.vatican.va/content/catechism/en/part_two/section_two/chapter_two/article_4/vi_the_sacrament_of_penance_and_reconciliation.html" target="_blank" rel="noopener">KKK 1420-1498</a>) ve Kilise hukukuna dayanır; ayin sözlerinin tam metni bölgeden bölgeye küçük farklar gösterebilir. Uygulamadaki ayrıntılar için (örneğin günah çıkarma saatleri) en yakın cemaat kilisenize danışın; <a href="kiliseler.html">Kilise Bul</a> sayfası size yardımcı olabilir.</p>
</div>
"@
Write-Page -File 'gunah-cikarma.html' -Title "$($Confession.title) | $SiteName" `
  -Description "Günah çıkarma nasıl işler? Adım adım pratik rehber, vicdan muhasebesi listesi ve ilk kez günah çıkaracaklar için sık sorulan sorular." `
  -Path 'gunah-cikarma.html' -Body $confessionBody -JsonLd @((Breadcrumb-Ld 'Günah Çıkarma' 'gunah-cikarma.html'))

# ---------------- en/confession.html: the Confession guide, in English
$confessionStepsEn = ($Confession.steps | ForEach-Object {
  $i = [array]::IndexOf(@($Confession.steps), $_) + 1
  "<li class=`"stage`"><span class=`"stage-n`">$i</span><div class=`"stage-body`"><h3>$(Inline $_.en)</h3><p>$(Inline $_.textEn)</p></div></li>"
}) -join "`n"
$examenGroupsEn = ($Confession.examenGroups | ForEach-Object {
  $group = $_
  $items = ($group.itemsEn | ForEach-Object {
    "<li>$(Inline $_)</li>"
  }) -join ''
  "<article class=`"text-card examen-card`"><h3 class=`"t-title examen-title`">$(Inline $group.titleEn)</h3><ul class=`"examen-list`">$items</ul></article>"
}) -join "`n"
$confessionFaqEn = ($Confession.faq | ForEach-Object {
  "<details class=`"faq-item`" id=`"$($_.id)`"><summary><span class=`"faq-q`">$(Inline $_.qEn)</span>$IcoChevLg</summary>" +
    "<div class=`"faq-a`"><p>$(Inline $_.aEn)</p></div></details>"
}) -join "`n"
$sealMartyrsItemsEn = ($Confession.sealMartyrs.itemsEn | ForEach-Object {
  "<li><strong>$(Inline $_.name)</strong> $(Inline $_.detail)</li>"
}) -join "`n"
$sealMartyrsHtmlEn = "<aside class=`"footnote-block`" id=`"muhur-sehitleri`"><p class=`"footnote-label`">* $(Inline $Confession.sealMartyrs.titleEn)</p><p>$(Inline $Confession.sealMartyrs.introEn)</p><ul class=`"footnote-list`">$sealMartyrsItemsEn</ul></aside>"
$confessionBodyEn = @"
<div class="wrap narrow">
  $(Crumbs-En 'Confession')
  <header class="page-head center">$(Page-Ico $IcoKey)<h1>Confession</h1></header>
  <p class="faq-intro">$(Inline $Confession.introEn)</p>
  <h2 class="section-title" id="adim-adim"><span class="label">1</span>How It Works, Step by Step</h2>
  <ol class="stage-list">
$confessionStepsEn
  </ol>
  <h2 class="section-title" id="vicdan-muhasebesi"><span class="label">2</span>Examination of Conscience</h2>
  <p class="faq-intro">$(Inline $Confession.examenIntroEn)</p>
  <div class="text-grid two examen-grid">
$examenGroupsEn
  </div>
  <h2 class="section-title" id="sorular-ve-korkular"><span class="label">3</span>Frequently Asked Questions and Fears</h2>
  <div class="faq-list">
$confessionFaqEn
  </div>
  $sealMartyrsHtmlEn
  <p class="conventions">This page is grounded in the Catechism of the Catholic Church's teaching on the Sacrament of Penance and Reconciliation (<a href="https://www.vatican.va/content/catechism/en/part_two/section_two/chapter_two/article_4/vi_the_sacrament_of_penance_and_reconciliation.html" target="_blank" rel="noopener">CCC 1420-1498</a>) and canon law; the exact wording of the rite can vary slightly from region to region. For practical details (such as confession times), ask your nearest parish; the <a href="en/find-a-church.html">Find a Church</a> page can help.</p>
</div>
"@
Write-Page -File 'en/confession.html' -Title "Confession | $SiteName" `
  -Description 'How Confession works, step by step: a practical guide, an examination of conscience, and frequently asked questions for first-time penitents.' `
  -Path 'en/confession.html' -Body $confessionBodyEn -JsonLd @((Breadcrumb-Ld 'Confession' 'en/confession.html' '' '' 'en')) -Lang 'en'

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
function Anatolia-Map([string]$lang) {
  $en = $lang -eq 'en'
  $catName = @{}; foreach ($c in $AnMap.cats) { $catName[$c.id] = $(if ($en) { $c.en } else { $c.tr }) }
  $t = if ($en) {
    @{ title = $AnMap.en; lead = $AnMap.leadEn; aria = 'Map of Turkey with places from the early history of Christianity'; refs = 'In Scripture'
       more = 'Read more on this page'; close = 'Close'; hint = 'Click to keep this card open'; swipe = 'Swipe the map sideways to see all of it'
       index = 'All places on the map'
       seas = @(@{ n = 'Black Sea'; lat = 42.55; lon = 34.6 }, @{ n = 'Mediterranean Sea'; lat = 35.25; lon = 31.2 }, @{ n = 'Aegean Sea'; lat = 36.0; lon = 26.22 }) }
  } else {
    @{ title = $AnMap.title; lead = $AnMap.lead; aria = 'Hristiyanlığın ilk tarihinden yerlerle Türkiye haritası'; refs = "Kutsal Kitap$($Apos)ta"
       more = 'Bu sayfada devamını okuyun'; close = 'Kapat'; hint = 'Kartı açık tutmak için tıklayın'; swipe = 'Haritanın tamamını görmek için yana kaydırın'
       index = 'Haritadaki bütün yerler'
       seas = @(@{ n = 'Karadeniz'; lat = 42.55; lon = 34.6 }, @{ n = 'Akdeniz'; lat = 35.25; lon = 31.2 }, @{ n = 'Ege Denizi'; lat = 36.0; lon = 26.22 }) }
  }
  $seaText = ($t.seas | ForEach-Object { $p = Map-XY $_.lat $_.lon; "<text x=`"$($p[0])`" y=`"$($p[1])`">$($_.n)</text>" }) -join ''
  $markers = New-Object Text.StringBuilder
  $cards = New-Object Text.StringBuilder
  foreach ($s in $AnMap.sites) {
    $c = if ($en) { $s.en } else { $s.tr }
    $p = Map-XY $s.lat $s.lon
    $label = if ($c.label) { $c.label } else { $c.name }
    [void]$markers.Append("<g class=`"amap-site c-$($s.cat)`" data-site=`"$($s.id)`" transform=`"translate($($p[0]) $($p[1]))`" tabindex=`"0`" role=`"button`" aria-label=`"$(Attr $c.name)`" aria-controls=`"amap-pop`">" +
      "<circle class=`"amap-hit`" r=`"11`"></circle><circle class=`"amap-dot`" r=`"6`"></circle>" +
      "<text class=`"amap-label`" x=`"$(if ($null -ne $c.lx) { $c.lx } else { $s.lx })`" y=`"$(if ($null -ne $c.ly) { $c.ly } else { $s.ly })`" text-anchor=`"$(if ($c.la) { $c.la } else { $s.la })`">$label</text></g>")
    $old = if ($c.old) { " <span class=`"amap-c-old`">($($c.old))</span>" } else { '' }
    $refs = if (@($c.refs).Count) { "<p class=`"amap-c-refs`"><span class=`"label`">$($t.refs)</span>" + ((@($c.refs) | ForEach-Object { "<span class=`"amap-ref`">$_</span>" }) -join '') + '</p>' } else { '' }
    $more = if ($s.section) { "<a class=`"amap-c-more`" href=`"#$($s.section)`">$($t.more)$IcoChevDown</a>" } else { '' }
    [void]$cards.Append("<article class=`"amap-card c-$($s.cat)`" id=`"yer-$($s.id)`" data-site=`"$($s.id)`" hidden>" +
      "<p class=`"amap-c-cat`"><span class=`"amap-key`"></span>$($catName[$s.cat])</p>" +
      "<h3 class=`"amap-c-name`">$($c.name)$old</h3><p class=`"amap-c-place`">$($c.place)</p>" +
      "<p class=`"amap-c-text`">$(Inline $c.text)</p>$refs$more</article>")
  }
  $index = ($AnMap.cats | ForEach-Object {
    $cid = $_.id
    $chips = ($AnMap.sites | Where-Object { $_.cat -eq $cid } | ForEach-Object {
      $c = if ($en) { $_.en } else { $_.tr }
      "<li><a class=`"amap-chip`" href=`"#yer-$($_.id)`" data-site=`"$($_.id)`">$($c.name)</a></li>"
    }) -join ''
    "<div class=`"amap-cat c-$cid`"><h3 class=`"amap-cat-h`"><span class=`"amap-key`"></span>$($catName[$cid])</h3><ul>$chips</ul></div>"
  }) -join ''
  return @"
<section class="amap" id="harita" aria-labelledby="amap-h">
  <h2 class="section-title" id="amap-h">$($t.title)</h2>
  <p class="amap-lead">$($t.lead)</p>
  <div class="amap-frame">
    <div class="amap-scroll">
      <svg class="amap-svg" viewBox="0 0 $($AnShape.W) $($AnShape.H)" role="group" aria-label="$($t.aria)">
        <rect class="amap-sea" width="$($AnShape.W)" height="$($AnShape.H)"></rect>
        <path class="amap-land" d="$($AnShape.land)"></path>
        <path class="amap-tr" d="$($AnShape.turkey)"></path>
        <path class="amap-lake" d="$($AnShape.lakes)"></path>
        <g class="amap-seas" aria-hidden="true">$seaText</g>
        <g class="amap-sites">$($markers.ToString())</g>
      </svg>
    </div>
    <p class="amap-swipe">$($t.swipe)</p>
    <div class="amap-pop" id="amap-pop" role="dialog" aria-labelledby="amap-pop-h" hidden>
      <button type="button" class="amap-pop-close" aria-label="$($t.close)">$IcoClose</button>
      <div class="amap-pop-body"></div>
      <p class="amap-pop-hint">$($t.hint)</p>
    </div>
  </div>
  <nav class="amap-index" aria-label="$($t.index)">$index</nav>
  <div class="amap-cards">$($cards.ToString())</div>
</section>
"@
}

# ================================================================== TOPRAKLARIMIZDA HRISTIYANLIK (topraklarimizda-hristiyanlik.html)
$anatoliaSections = ($Anatolia.sections | ForEach-Object {
  $i = [array]::IndexOf(@($Anatolia.sections), $_) + 1
  "<section id=`"$($_.id)`">" +
    "<h2 class=`"section-title`"><span class=`"label`">$i</span>$(Inline $_.title)</h2>" +
    "<p class=`"faq-cat-en`" lang=`"en`">$($_.en)</p>" +
    "<div class=`"prose`">$(Blocks $_.body)</div></section>"
}) -join "`n"
$anatoliaBody = @"
<div class="wrap narrow">
  $(Crumbs 'Topraklarımızda Hristiyanlık')
  <header class="page-head center">$(Page-Ico $IcoRoots)<h1>$($Anatolia.title)</h1><p class="sub" lang="en">$($Anatolia.en)</p></header>
</div>
<div class="wrap">
$(Anatolia-Map 'tr')
</div>
<div class="wrap narrow">
$anatoliaSections
  <p class="conventions closing-note">$(Inline $Anatolia.closing)</p>
</div>
"@
Write-Page -File 'topraklarimizda-hristiyanlik.html' -Title "$($Anatolia.title) | $SiteName" `
  -Description "Hristiyanlığın Anadolu'daki kökleri: Pavlus'un memleketi Tarsus, Vahiy Kitabı'nın yedi kilisesi, İznik Konsili, Antakya ve İzmir'deki ilk Kilise Babaları." `
  -Path 'topraklarimizda-hristiyanlik.html' -Body $anatoliaBody -JsonLd @((Breadcrumb-Ld 'Topraklarımızda Hristiyanlık' 'topraklarimizda-hristiyanlik.html'))

# ---------------- en/anatolia.html: Christianity in Anatolia, in English
$anatoliaSectionsEn = ($Anatolia.sections | ForEach-Object {
  $i = [array]::IndexOf(@($Anatolia.sections), $_) + 1
  "<section id=`"$($_.id)`">" +
    "<h2 class=`"section-title`"><span class=`"label`">$i</span>$(Inline $_.en)</h2>" +
    "<div class=`"prose`">$(Blocks $_.bodyEn)</div></section>"
}) -join "`n"
$anatoliaBodyEn = @"
<div class="wrap narrow">
  $(Crumbs-En 'Christianity in Anatolia')
  <header class="page-head center">$(Page-Ico $IcoRoots)<h1>$($Anatolia.en)</h1></header>
</div>
<div class="wrap">
$(Anatolia-Map 'en')
</div>
<div class="wrap narrow">
$anatoliaSectionsEn
  <p class="conventions closing-note">$(Inline $Anatolia.closingEn)</p>
</div>
"@
Write-Page -File 'en/anatolia.html' -Title "$($Anatolia.en) | $SiteName" `
  -Description "Christianity's roots in Anatolia: Paul's Tarsus, the seven churches of Revelation, the Council of Nicaea, and the Church Fathers of Antioch and Smyrna." `
  -Path 'en/anatolia.html' -Body $anatoliaBodyEn -JsonLd @((Breadcrumb-Ld 'Christianity in Anatolia' 'en/anatolia.html' '' '' 'en')) -Lang 'en'

# ================================================================== NEDEN KATOLIGIZ (neden-katoligiz.html + en/why-were-catholic.html)
# A guided case in five steps. Each step is a tab panel (script.js shows one at a time; without
# JavaScript all five simply follow each other), and each topic a card: the skeptic's question,
# a one-line answer, the key points as a list, and the strongest objection with its answer.
$IcoArrowR = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
$IcoArrowL = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>'
$IcoSkeptic = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z"/><path d="M9.8 9.6a2.3 2.3 0 0 1 4.4.8c0 1.6-2.2 2-2.2 3.3"/><path d="M12 16.4h.01"/></svg>'
function Why-Page([string]$lang) {
  $en = $lang -eq 'en'
  $W = $WhyCatholic
  $L = if ($en) {
    @{ steps = 'Steps'; step = 'Step'; of = 'of'; ask = 'A skeptic might ask'; answer = 'Answer'; prev = 'Previous step'; next = 'Next step'
       together = 'Putting it together'; where = 'Where to go from here'; prefix = 'en/' }
  } else {
    @{ steps = 'Adımlar'; step = 'Adım'; of = '/'; ask = 'Bir şüpheci sorabilir'; answer = 'Cevap'; prev = 'Önceki adım'; next = 'Sonraki adım'
       together = 'Hepsi bir arada'; where = 'Buradan nereye?'; prefix = '' }
  }
  function F($o, [string]$k) { if ($en) { $o.($k + 'En') } else { $o.$k } }
  $parts = @($W.parts); $n = $parts.Count
  $tabs = (0..($n - 1) | ForEach-Object {
    $pt = $parts[$_]; $t = if ($en) { $pt.en } else { $pt.title }
    "<li><a class=`"why-tab`" href=`"#$($pt.id)`" id=`"tab-$($pt.id)`" data-why-tab=`"$($pt.id)`"><span class=`"why-tab-n`">$($_ + 1)</span><span class=`"why-tab-t`">$(Inline $t)</span></a></li>"
  }) -join ''
  $panels = (0..($n - 1) | ForEach-Object {
    $k = $_; $pt = $parts[$k]; $t = if ($en) { $pt.en } else { $pt.title }
    $cards = ($pt.topics | ForEach-Object {
      $tp = $_; $tt = if ($en) { $tp.en } else { $tp.title }
      $pts = (@(F $tp 'points') | ForEach-Object { "<li>$(Inline $_)</li>" }) -join ''
      "<article class=`"why-card`" id=`"$($tp.id)`">" +
        "<p class=`"why-kicker`">$(Inline $tt)</p>" +
        "<h3 class=`"why-q`">$(Inline (F $tp 'q'))</h3>" +
        "<p class=`"why-lede`">$(Inline (F $tp 'lede'))</p>" +
        "<ul class=`"why-points`">$pts</ul>" +
        "<div class=`"why-obj`">$IcoSkeptic<p><span class=`"why-obj-label`">$($L.ask)</span><span class=`"why-obj-q`">$(Inline (F $tp 'objection'))</span> $(Inline (F $tp 'reply'))</p></div>" +
      "</article>"
    }) -join "`n"
    $prevLink = if ($k -gt 0) { $pp = $parts[$k - 1]; "<a class=`"why-go prev`" href=`"#$($pp.id)`" data-why-go=`"$($pp.id)`">$IcoArrowL<span><small>$($L.prev)</small>$(Inline $(if ($en) { $pp.en } else { $pp.title }))</span></a>" } else { '<span></span>' }
    $nextLink = if ($k -lt $n - 1) { $np = $parts[$k + 1]; "<a class=`"why-go next`" href=`"#$($np.id)`" data-why-go=`"$($np.id)`"><span><small>$($L.next)</small>$(Inline $(if ($en) { $np.en } else { $np.title }))</span>$IcoArrowR</a>" } else { "<a class=`"why-go next`" href=`"#sonuc`" data-why-go=`"sonuc`"><span><small>$($L.next)</small>$($L.together)</span>$IcoArrowR</a>" }
    "<section class=`"why-step`" id=`"$($pt.id)`" aria-labelledby=`"h-$($pt.id)`" data-why-panel>" +
      "<header class=`"why-step-head`"><span class=`"why-num`" aria-hidden=`"true`">$($k + 1)</span><div>" +
        "<p class=`"label`">$($L.step) $($k + 1) $($L.of) $n</p><h2 id=`"h-$($pt.id)`">$(Inline $t)</h2><p class=`"why-thesis`">$(Inline (F $pt 'thesis'))</p></div></header>" +
      "<div class=`"why-grid`">$cards</div>" +
      "<nav class=`"why-pager`" aria-label=`"$($L.steps)`">$prevLink$nextLink</nav>" +
    "</section>"
  }) -join "`n"
  $chain = (@(F $W 'chain') | ForEach-Object { $i2 = [array]::IndexOf(@(F $W 'chain'), $_) + 1; "<li><span class=`"why-chain-n`">$i2</span>$(Inline $_)</li>" }) -join ''
  $ctaItems = if ($en) {
    @(@('en/becoming-catholic.html', 'Becoming Catholic', 'What the path looks like, step by step'),
      @('en/faq.html', 'Frequently Asked Questions', 'More answers to common questions'),
      @('en/find-a-church.html', 'Find a Church', 'Catholic parishes across Turkey'),
      @('en/contact.html', 'Contact', 'Write to us with your questions'))
  } else {
    @(@('katolik-sureci.html', 'Katolik Olma Süreci', 'Yol adım adım nasıl ilerler'),
      @('sss.html', 'Sık Sorulan Sorular', 'Sık sorulan diğer sorulara cevaplar'),
      @('kiliseler.html', 'Kilise Bul', "Türkiye$($Apos)deki Katolik kiliseleri"),
      @('iletisim.html', 'İletişim', 'Sorularınızı bize yazın'))
  }
  $cta = ($ctaItems | ForEach-Object { "<a class=`"why-cta`" href=`"$($_[0])`"><span class=`"why-cta-t`">$($_[1])</span><span class=`"why-cta-s`">$($_[2])</span>$IcoArrowR</a>" }) -join ''
  $crumb = if ($en) { Crumbs-En "Why We're Catholic" } else { Crumbs 'Neden Katoliğiz?' }
  $sub = if ($en) { '' } else { "<p class=`"sub`" lang=`"en`">$($W.en)</p>" }
  $h1 = if ($en) { $W.en } else { $W.title }
  $body = @"
<div class="wrap why-wrap">
  $crumb
  <header class="page-head center">$(Page-Ico $IcoCompass)<h1>$h1</h1>$sub</header>
  <nav class="why-tabs" aria-label="$($L.steps)"><ol>$tabs</ol></nav>
$panels
  <section class="why-end" id="sonuc" aria-labelledby="h-sonuc" data-why-panel>
    <h2 id="h-sonuc">$($L.together)</h2>
    <ol class="why-chain">$chain</ol>
    <p class="why-closing">$(Inline (F $W 'closing'))</p>
    <h3 class="why-where">$($L.where)</h3>
    <div class="why-ctas">$cta</div>
  </section>
</div>
"@
  $page = if ($en) { 'en/why-were-catholic.html' } else { 'neden-katoligiz.html' }
  $faqLdWhy = '{"@context":"https://schema.org","@type":"FAQPage","inLanguage":"' + $lang + '","name":' + (JStr $h1) +
    ',"url":' + (JStr "$SiteUrl/$page") + ',"mainEntity":[' + ((($parts | ForEach-Object { $_.topics }) | ForEach-Object {
      '{"@type":"Question","name":' + (JStr (Plain (F $_ 'q'))) + ',"url":' + (JStr "$SiteUrl/$page#$($_.id)") +
      ',"acceptedAnswer":{"@type":"Answer","text":' + (JStr (Plain ((F $_ 'lede') + ' ' + (@(F $_ 'points') -join ' ')))) + '}}'
    }) -join ',') + ']}'
  if ($en) {
    Write-Page -File $page -Title "$($W.en) | $SiteName" `
      -Description "The Catholic faith in five steps, for reason and heart: truth and God, Jesus and the Bible, the Church and sacraments, saints, morality and destiny." `
      -Path $page -Body $body -JsonLd @((Breadcrumb-Ld "Why We're Catholic" $page '' '' 'en'), $faqLdWhy) -Lang 'en'
  } else {
    Write-Page -File $page -Title "$($W.title) | $SiteName" `
      -Description "Katolik inancının akla ve kalbe hitap eden beş adımlık özeti: hakikat ve Tanrı, İsa ve Kutsal Kitap, Kilise ve kutsal sırlar, azizler, ahlak ve sonsuz yazgı." `
      -Path $page -Body $body -JsonLd @((Breadcrumb-Ld 'Neden Katoliğiz?' $page), $faqLdWhy)
  }
}
Why-Page 'tr'
Why-Page 'en'

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
function Saint-Item($s) {
  $titlePart = if ($s.title) { "<span class=`"s-title`">$(Inline $s.title)</span>" } else { '' }
  return "<details class=`"saint-item`"><summary><span class=`"s-name`">$(Inline $s.name)</span>$titlePart$IcoChev</summary><div class=`"saint-bio`">$(Blocks $s.bio)</div></details>"
}
$RankLabelsEn = @{
  'Büyük Bayram' = 'Solemnity'; 'Bayram' = 'Feast'; 'Anma Günü' = 'Memorial';
  'İhtiyari Anma Günü' = 'Optional Memorial'; 'Roma Azizler Cetveli' = 'Roman Martyrology'
}
function Saint-Item-En($s) {
  $titlePart = if ($s.titleEn) { "<span class=`"s-title`">$(Inline $s.titleEn)</span>" } else { '' }
  return "<details class=`"saint-item`"><summary><span class=`"s-name`">$(Inline $s.nameEn)</span>$titlePart$IcoChev</summary><div class=`"saint-bio`">$(Blocks $s.bioEn)</div></details>"
}
$monthSectionsHtml = (1..12 | ForEach-Object {
  $mo = $_
  $monthDays = @($Saints.days | Where-Object { $_.m -eq $mo }) | Sort-Object d
  $cells = ($monthDays | ForEach-Object {
    $day = $_
    if ($day.genel) {
      "<div class=`"day-cell genel`" data-m=`"$mo`" data-d=`"$($day.d)`"><span class=`"day-num`">$($day.d)</span><details class=`"saint-item genel-item`"><summary><span class=`"s-name`">$(Inline $Saints.genelTitle)</span>$IcoChev</summary><div class=`"saint-bio`">$(Blocks $Saints.genelBio)</div></details></div>"
    } else {
      $rc = Rank-Class $day.rank
      $saintsHtml = (($day.saints | ForEach-Object { Saint-Item $_ }) -join '')
      "<div class=`"day-cell $rc`" data-m=`"$mo`" data-d=`"$($day.d)`"><span class=`"day-num`">$($day.d)</span><span class=`"day-rank label`">$($day.rank)</span><div class=`"day-saints`">$saintsHtml</div></div>"
    }
  }) -join "`n"
  "<section class=`"month`" id=`"ay-$mo`" data-month=`"$mo`"><h2 class=`"month-title`">$($MonthNamesTr[$mo - 1])</h2><div class=`"day-grid`">$cells</div></section>"
}) -join "`n"
$monthPillsHtml = (1..12 | ForEach-Object { "<a href=`"#ay-$_`" data-month-link=`"$_`">$($MonthNamesTr[$_ - 1].Substring(0, 3))</a>" }) -join ''
$monthSectionsHtmlEn = (1..12 | ForEach-Object {
  $mo = $_
  $monthDays = @($Saints.days | Where-Object { $_.m -eq $mo }) | Sort-Object d
  $cells = ($monthDays | ForEach-Object {
    $day = $_
    if ($day.genel) {
      "<div class=`"day-cell genel`" data-m=`"$mo`" data-d=`"$($day.d)`"><span class=`"day-num`">$($day.d)</span><details class=`"saint-item genel-item`"><summary><span class=`"s-name`">$(Inline $Saints.genelTitleEn)</span>$IcoChev</summary><div class=`"saint-bio`">$(Blocks $Saints.genelBioEn)</div></details></div>"
    } else {
      $rc = Rank-Class $day.rank
      $rankLabel = if ($RankLabelsEn.ContainsKey($day.rank)) { $RankLabelsEn[$day.rank] } else { $day.rank }
      $saintsHtml = (($day.saints | ForEach-Object { Saint-Item-En $_ }) -join '')
      "<div class=`"day-cell $rc`" data-m=`"$mo`" data-d=`"$($day.d)`"><span class=`"day-num`">$($day.d)</span><span class=`"day-rank label`">$rankLabel</span><div class=`"day-saints`">$saintsHtml</div></div>"
    }
  }) -join "`n"
  "<section class=`"month`" id=`"ay-$mo`" data-month=`"$mo`"><h2 class=`"month-title`">$($MonthNamesEn[$mo - 1])</h2><div class=`"day-grid`">$cells</div></section>"
}) -join "`n"
$monthPillsHtmlEn = (1..12 | ForEach-Object { "<a href=`"#ay-$_`" data-month-link=`"$_`">$($MonthNamesEn[$_ - 1].Substring(0, 3))</a>" }) -join ''
$movableCardsHtml = ($Saints.movable | ForEach-Object {
  "<article class=`"movable-card`" data-movable=`"$($_.id)`" data-offset=`"$($_.offset)`"><h3>$(Inline $_.title)</h3><p class=`"m-rank label`">$($_.rank)<span class=`"m-date`" data-movable-date></span></p><div class=`"m-bio`">$(Blocks $_.bio)</div></article>"
}) -join "`n"
$movableCardsHtmlEn = ($Saints.movable | ForEach-Object {
  "<article class=`"movable-card`" data-movable=`"$($_.id)`" data-offset=`"$($_.offset)`"><h3>$(Inline $_.titleEn)</h3><p class=`"m-rank label`">$($_.rankEn)<span class=`"m-date`" data-movable-date></span></p><div class=`"m-bio`">$(Blocks $_.bioEn)</div></article>"
}) -join "`n"
$greatSaintsCardsHtml = ($GreatSaints.saints | ForEach-Object {
  "<a class=`"text-link post-card`" href=`"$($_.id).html`"><span class=`"post-date label`">$(Inline $_.epithet) · $($_.era)</span><span class=`"t-title`">$(Inline $_.name)</span><span class=`"t-sub`" lang=`"en`">$($_.en)</span><p class=`"post-excerpt`">$(Inline $_.summary)</p></a>"
}) -join "`n"
$azizlerBody = @"
<div class="wrap narrow">
  $(Crumbs 'Azizler')
  <header class="page-head center"><p class="label">Ayin Takvimi</p><h1>$(Inline $Saints.title)</h1><p class="sub" lang="en">$($Saints.en)</p></header>
  <p class="faq-intro">$(Inline $Saints.intro)</p>
  <section class="today-saint glass" id="bugun-azizi" data-today>
    <p class="label">Bugün <span data-today-date>...</span></p>
    <div class="today-body" data-today-body><p class="hint">Bugünün azizini görmek için JavaScript$($Apos)i etkinleştirin.</p></div>
  </section>
  <nav class="month-pills" id="takvim" aria-label="Aylar" data-month-pills>$monthPillsHtml</nav>
  <div class="saints-cal" data-saints-cal>
$monthSectionsHtml
  </div>
  <h2 class="section-title" id="buyuk-azizler">$(Inline $GreatSaints.title)</h2>
  <p class="faq-intro">$(Inline $GreatSaints.intro)</p>
  <div class="post-list saint-grid">
$greatSaintsCardsHtml
  </div>
  <h2 class="section-title" id="hareketli-bayramlar">Yıla Göre Değişen Bayramlar</h2>
  <p class="faq-intro">Paskalya her yıl farklı bir tarihe denk gelir; ona bağlı bütün bayramlar da (Kül Çarşambası$($Apos)ndan Kutsal Kalp$($Apos)e dek) buna göre kayar. Aşağıdaki tarihler, sayfayı açtığınız yılın Paskalya$($Apos)sına göre otomatik hesaplanır.</p>
  <div class="myst-grid movable-list" data-movable-list>
$movableCardsHtml
  </div>
  <p class="conventions">Tarihler ve ayin dereceleri Roma Genel Takvimi$($Apos)ni esas alır; hareketli bayramların yılı, Meeus/Jones/Butcher algoritmasıyla hesaplanan Paskalya tarihine göre belirlenir. Roma Genel Takvimi$($Apos)nin boş bıraktığı günler için, rütbesi <em>Roma Azizler Cetveli</em> olarak etiketlenen bir aziz Roma Azizler Cetveli$($Apos)nden (Martyrologium Romanum) ya da Batı$($Apos)nın tarihî takvim geleneğinden seçilmiştir; bu, Kilise$($Apos)nin o gün için zorunlu kıldığı bir anma olmadığı, sitenin ek bir bilgi sunduğu anlamına gelir. Aziz hayat öyküleri bu site için Türkçe olarak özgün biçimde kaleme alınmıştır ve internet erişimi olmayan bir ortamda yazarın kendi bilgisine dayanır; özellikle daha az bilinen azizler için tarih ya da ayrıntıda küçük hatalar olabilir. Hiçbir güvenilir kaynağa dayandırılamayan çok az sayıda gün için Kilise$($Apos)nin kendi genel tanımı esas alınmıştır.</p>
</div>
<div class="hover-panel glass" id="saint-panel" role="tooltip" hidden></div>
"@
Write-Page -File 'azizler.html' -Title "$($Saints.title) | $SiteName" `
  -Description "Katolik ayin takviminin azizleri: bugünün azizini Türkiye saatiyle görün, yılın her günü için Türkçe aziz hayat hikayelerini keşfedin." `
  -Path 'azizler.html' -Body $azizlerBody -JsonLd @((Breadcrumb-Ld 'Azizler' 'azizler.html'))

# ---------------- en/saints.html: Saints, full calendar and Top-20 biographies, in English
$greatSaintsCardsHtmlEn = ($GreatSaints.saints | ForEach-Object {
  $enPath = $EnAltMap["$($_.id).html"]
  $eraTxt = if ($_.eraEn) { $_.eraEn } else { $_.era }
  "<a class=`"text-link post-card`" href=`"$enPath`"><span class=`"post-date label`">$(Inline $_.epithetEn) · $eraTxt</span><span class=`"t-title`">$(Inline $_.en)</span><p class=`"post-excerpt`">$(Inline $_.summaryEn)</p></a>"
}) -join "`n"
$azizlerBodyEn = @"
<div class="wrap narrow">
  $(Crumbs-En 'Saints')
  <header class="page-head center"><p class="label">Calendar of Saints</p><h1>Saints</h1></header>
  <p class="faq-intro">$(Inline $Saints.introEn)</p>
  <section class="today-saint glass" id="bugun-azizi" data-today>
    <p class="label">Today <span data-today-date>...</span></p>
    <div class="today-body" data-today-body><p class="hint">Enable JavaScript to see today's saint.</p></div>
  </section>
  <nav class="month-pills" id="takvim" aria-label="Months" data-month-pills>$monthPillsHtmlEn</nav>
  <div class="saints-cal" data-saints-cal>
$monthSectionsHtmlEn
  </div>
  <h2 class="section-title" id="best-known-saints">$(Inline $GreatSaints.en)</h2>
  <p class="faq-intro">$(Inline $GreatSaints.introEn)</p>
  <div class="post-list saint-grid">
$greatSaintsCardsHtmlEn
  </div>
  <h2 class="section-title" id="hareketli-bayramlar">Feasts That Move With the Year</h2>
  <p class="faq-intro">Easter falls on a different date each year, and every feast tied to it (from Ash Wednesday to the Sacred Heart) shifts along with it. The dates below are calculated automatically for the year in which you open the page.</p>
  <div class="myst-grid movable-list" data-movable-list>
$movableCardsHtmlEn
  </div>
  <p class="conventions">Dates and liturgical ranks follow the General Roman Calendar; the year's movable feasts are set according to the date of Easter, calculated with the Meeus/Jones/Butcher algorithm. For dates the General Roman Calendar leaves open, a saint ranked <em>Roman Martyrology</em> has been chosen from the Roman Martyrology (Martyrologium Romanum) or the West's historical calendar tradition; this means it is not a commemoration the Church requires for that day, but additional information the site offers. The saint biographies were originally written in Turkish for this site, drawn from the author's own knowledge without internet access; small errors of date or detail are possible, especially for lesser-known saints. For a very small number of days that could not be grounded in any reliable source, the Church's own general description is used instead.</p>
</div>
<div class="hover-panel glass" id="saint-panel" role="tooltip" hidden></div>
"@
Write-Page -File 'en/saints.html' -Title "Saints | $SiteName" `
  -Description "The Catholic calendar of saints: see today's saint in Turkey time, and explore saint biographies for every day of the year." `
  -Path 'en/saints.html' -Body $azizlerBodyEn -JsonLd @((Breadcrumb-Ld 'Saints' 'en/saints.html' '' '' 'en')) -Lang 'en'

# ------------------------------------------------------------------ one page per great saint
$GreatSaints.saints | ForEach-Object {
  $s = $_
  $saintBody = @"
<div class="wrap narrow">
  $(Crumbs $s.name 'Azizler' 'azizler.html')
  <article class="article" id="article">
    <header class="page-head center"><p class="label">$(Inline $s.epithet) · $($s.era)</p><h1>$(Inline $s.name)</h1><p class="sub" lang="en">$($s.en)</p></header>
    <div class="body prose">$(Convert-Markdown $s.body)</div>
  </article>
</div>
"@
  $saintLd = '{"@context":"https://schema.org","@type":"Article","headline":' + (JStr $s.name) + ',"inLanguage":"tr","author":{"@type":"Organization","name":' + (JStr $SiteName) + '},"mainEntityOfPage":' + (JStr "$SiteUrl/$($s.id).html") + '}'
  Write-Page -File "$($s.id).html" -Title "$($s.name) | $SiteName" `
    -Description (Meta-Trim (Plain $s.summary)) -Path "$($s.id).html" -Body $saintBody `
    -JsonLd @($saintLd, (Breadcrumb-Ld $s.name "$($s.id).html" 'Azizler' 'azizler.html')) -OgType 'article'
}

# ------------------------------------------------------------------ one EN page per great saint
$GreatSaints.saints | ForEach-Object {
  $s = $_
  $enPath = $EnAltMap["$($s.id).html"]
  $eraTxt = if ($s.eraEn) { $s.eraEn } else { $s.era }
  $saintBodyEn = @"
<div class="wrap narrow">
  $(Crumbs-En $s.en 'Saints' 'en/saints.html')
  <article class="article" id="article">
    <header class="page-head center"><p class="label">$(Inline $s.epithetEn) · $eraTxt</p><h1>$(Inline $s.en)</h1></header>
    <div class="body prose">$(Convert-Markdown $s.bodyEn)</div>
  </article>
</div>
"@
  $saintLdEn = '{"@context":"https://schema.org","@type":"Article","headline":' + (JStr $s.en) + ',"inLanguage":"en","author":{"@type":"Organization","name":' + (JStr $SiteName) + '},"mainEntityOfPage":' + (JStr "$SiteUrl/$enPath") + '}'
  Write-Page -File $enPath -Title "$($s.en) | $SiteName" `
    -Description (Meta-Trim (Plain $s.summaryEn)) -Path $enPath -Body $saintBodyEn `
    -JsonLd @($saintLdEn, (Breadcrumb-Ld $s.en $enPath 'Saints' 'en/saints.html' 'en')) -OgType 'article' -Lang 'en'
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
  "<a href=`"#$($_.id)`" data-part-link=`"$($_.n)`" data-tooltip=`"$(Attr $_.title)`" title=`"$(Attr $_.title)`">$($MassIcons[$_.icon])<span class=`"visually-hidden`">$($_.title)</span></a>"
}) -join ''
$massPartsHtml = ($Mass.parts | ForEach-Object {
  $p = $_
  $icon = $MassIcons[$p.icon]
  $trHtml = Mass-Lines $p.lines 'tr'
  $enHtml = Mass-Lines $p.lines 'en'
  "<details class=`"mass-part`" id=`"$($p.id)`" data-part=`"$($p.n)`">" +
    "<summary class=`"mass-part-head`"><span class=`"mass-ico`">$icon</span><div><p class=`"mass-part-n label`">Bölüm $($p.n)</p><h2>$(Inline $p.title)</h2><p class=`"sub`" lang=`"en`">$($p.en)</p></div>$IcoChevLg</summary>" +
    "<div class=`"mass-part-body`">" +
    "<p class=`"mass-lead`">$(Inline $p.lead)</p>" +
    "<div class=`"mass-dialogue`" data-tr>$trHtml</div>" +
    "<footer class=`"qa-foot end`">$(En-Toggle "en-$($p.id)")</footer>" +
    "<div class=`"en-block mass-dialogue`" id=`"en-$($p.id)`" lang=`"en`" hidden>$enHtml</div>" +
    "</div>" +
  "</details>"
}) -join "`n"
$massBody = @"
<div class="wrap narrow">
  $(Crumbs 'Kutsal Ayin')
  <header class="page-head center">$(Page-Ico $IcoChalice)<h1>$($Mass.title)</h1><p class="sub" lang="en">$($Mass.en)</p></header>
  <p class="faq-intro">$(Inline $Mass.intro)</p>
  <p class="mass-video-note">$IcoPlay Ayinin akışını görsel olarak izleyerek takip etmek isterseniz, <a href="https://www.youtube.com/watch?v=RS8NrJ0Y5O8" target="_blank" rel="noopener">bu İngilizce videoyu</a> yardımcı bulabilirsiniz.</p>
  <nav class="mass-pills" aria-label="Ayinin bölümleri" data-mass-pills>$massPillsHtml</nav>
  <div class="mass-parts" data-mass-parts>
$massPartsHtml
  </div>
</div>
"@
Write-Page -File 'kutsal-ayin.html' -Title "$($Mass.title) | $SiteName" `
  -Description "Kutsal Ayin$($Apos)in sırası: cemaatin toplanmasından son takdise, Kutsal Kitabın okunmasından Efkaristiya$($Apos)nın kutsanmasına dek altı bölüm, Türkçe ve İngilizce." `
  -Path 'kutsal-ayin.html' -Body $massBody -JsonLd @((Breadcrumb-Ld 'Kutsal Ayin' 'kutsal-ayin.html'))

# ---------------- en/mass.html: The Holy Mass, English primary with Turkish behind a toggle
$massPillsHtmlEn = ($Mass.parts | ForEach-Object {
  "<a href=`"#$($_.id)`" data-part-link=`"$($_.n)`" data-tooltip=`"$(Attr $_.en)`" title=`"$(Attr $_.en)`">$($MassIcons[$_.icon])<span class=`"visually-hidden`">$($_.en)</span></a>"
}) -join ''
$massPartsHtmlEn = ($Mass.parts | ForEach-Object {
  $p = $_
  $icon = $MassIcons[$p.icon]
  $trHtml = Mass-Lines $p.lines 'tr'
  $enHtml = Mass-Lines $p.lines 'en'
  "<details class=`"mass-part`" id=`"$($p.id)`" data-part=`"$($p.n)`">" +
    "<summary class=`"mass-part-head`"><span class=`"mass-ico`">$icon</span><div><p class=`"mass-part-n label`">Part $($p.n)</p><h2>$(Inline $p.en)</h2></div>$IcoChevLg</summary>" +
    "<div class=`"mass-part-body`">" +
    "<p class=`"mass-lead`">$(Inline $p.leadEn)</p>" +
    "<div class=`"mass-dialogue`" data-tr>$enHtml</div>" +
    "<footer class=`"qa-foot end`">$(En-Toggle "tr-$($p.id)" 'Türkçesi')</footer>" +
    "<div class=`"en-block mass-dialogue`" id=`"tr-$($p.id)`" lang=`"tr`" hidden><span class=`"label`" lang=`"en`">Turkish translation</span>$trHtml</div>" +
    "</div>" +
  "</details>"
}) -join "`n"
$massBodyEn = @"
<div class="wrap narrow">
  $(Crumbs-En $Mass.en)
  <header class="page-head center">$(Page-Ico $IcoChalice)<h1>$($Mass.en)</h1></header>
  <p class="faq-intro">$(Inline $Mass.introEn)</p>
  <p class="mass-video-note">$IcoPlay If you'd like to follow along visually, you may find <a href="https://www.youtube.com/watch?v=RS8NrJ0Y5O8" target="_blank" rel="noopener">this video</a> helpful.</p>
  <nav class="mass-pills" aria-label="Parts of the Mass" data-mass-pills>$massPillsHtmlEn</nav>
  <div class="mass-parts" data-mass-parts>
$massPartsHtmlEn
  </div>
</div>
"@
Write-Page -File 'en/mass.html' -Title "$($Mass.en) | $SiteName" `
  -Description "The order of the Mass step by step, from the Introductory Rites through the Liturgy of the Word and the Eucharist to the Concluding Rites, in six parts." `
  -Path 'en/mass.html' -Body $massBodyEn -JsonLd @((Breadcrumb-Ld $Mass.en 'en/mass.html' '' '' 'en')) -Lang 'en'

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
$script:MeselN = 0
$meselToc = ($Parables.categories | ForEach-Object { "<li><a href=`"#$($_.id)`">$(Inline $_.title)</a></li>" }) -join ''
$meselCats = ($Parables.categories | ForEach-Object {
  $script:MeselN++; $cat = $_
  $icon = $ParableIcons[$cat.icon]
  $items = ($cat.items | ForEach-Object {
    $enId = "en-$($_.id)"
    "<details class=`"mira-item`" id=`"$($_.id)`"><summary><span class=`"mira-ico`">$icon</span><span class=`"mira-head`"><span class=`"mira-name`">$(Inline $_.name)</span><span class=`"mira-place label`">$($_.ref)</span></span>$IcoChevLg</summary><div class=`"mira-bio`">$(Blocks $_.bio)$(En-Toggle $enId)</div><div class=`"en-block p-en`" id=`"$enId`" lang=`"en`" hidden><span class=`"label`">$($_.en.ref)</span>$(Verse $_.en.text)</div></details>"
  }) -join "`n"
  "<section class=`"mira-cat`" id=`"$($cat.id)`">" +
    "<h2 class=`"section-title`"><span class=`"label`">$($script:MeselN)</span>$(Inline $cat.title)</h2>" +
    "<p class=`"faq-cat-en`" lang=`"en`">$($cat.en)</p>" +
    "<p class=`"faq-intro`">$(Inline $cat.lead)</p>" +
    "<div class=`"mira-list`">$items</div></section>"
}) -join "`n"
$MeselTitle = "İsa$($Apos)nın Meselleri"
$meselBody = @"
<div class="wrap narrow">
  $(Crumbs $MeselTitle)
  <header class="page-head center">$(Page-Ico $IcoBookOpen)<h1>$($Parables.title)</h1><p class="sub" lang="en">$($Parables.en)</p></header>
  <p class="faq-intro">$(Inline $Parables.intro)</p>
  <nav class="faq-toc is-sticky" aria-label="Kategoriler"><ul>$meselToc</ul></nav>
$meselCats
</div>
"@
Write-Page -File 'meseller.html' -Title "$($Parables.title) | $SiteName" `
  -Description "Mesih İsa$($Apos)nın İnciller$($Apos)deki başlıca meselleri: kısaca yeniden anlatılmış ve konularına göre bölümlere ayrılmış, düz bir dille açıklanmış otuz ikisi bir arada." `
  -Path 'meseller.html' -Body $meselBody -JsonLd @((Breadcrumb-Ld $MeselTitle 'meseller.html'))

# ---------------- en/parables.html: The Parables of Jesus, in English (Scripture text behind a toggle)
$meselTocEn = ($Parables.categories | ForEach-Object { "<li><a href=`"#$($_.id)`">$(Inline $_.en)</a></li>" }) -join ''
$meselCatsEn = ($Parables.categories | ForEach-Object {
  $cat = $_
  $icon = $ParableIcons[$cat.icon]
  $items = ($cat.items | ForEach-Object {
    $scId = "sc-$($_.id)"
    "<details class=`"mira-item`" id=`"$($_.id)`"><summary><span class=`"mira-ico`">$icon</span><span class=`"mira-head`"><span class=`"mira-name`">$(Inline $_.nameEn)</span><span class=`"mira-place label`">$($_.refEn)</span></span>$IcoChevLg</summary><div class=`"mira-bio`">$(Blocks $_.bioEn)$(En-Toggle $scId 'Scripture text')</div><div class=`"en-block p-en`" id=`"$scId`" lang=`"en`" hidden><span class=`"label`">$($_.en.ref)</span>$(Verse $_.en.text)</div></details>"
  }) -join "`n"
  $n = [array]::IndexOf(@($Parables.categories), $cat) + 1
  "<section class=`"mira-cat`" id=`"$($cat.id)`">" +
    "<h2 class=`"section-title`"><span class=`"label`">$n</span>$(Inline $cat.en)</h2>" +
    "<p class=`"faq-intro`">$(Inline $cat.leadEn)</p>" +
    "<div class=`"mira-list`">$items</div></section>"
}) -join "`n"
$meselBodyEn = @"
<div class="wrap narrow">
  $(Crumbs-En $Parables.en)
  <header class="page-head center">$(Page-Ico $IcoBookOpen)<h1>$($Parables.en)</h1></header>
  <p class="faq-intro">$(Inline $Parables.introEn)</p>
  <nav class="faq-toc is-sticky" aria-label="Categories"><ul>$meselTocEn</ul></nav>
$meselCatsEn
</div>
"@
Write-Page -File 'en/parables.html' -Title "$($Parables.en) | $SiteName" `
  -Description "The main parables of Christ in the Gospels: thirty-two of them, briefly retold and explained in plain language, grouped by theme." `
  -Path 'en/parables.html' -Body $meselBodyEn -JsonLd @((Breadcrumb-Ld $Parables.en 'en/parables.html' '' '' 'en')) -Lang 'en'

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
  return "<svg class=`"rt-svg`" viewBox=`"0 0 360 624`" role=`"img`" aria-label=`"$label`" focusable=`"false`">" +
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
  $en = $lang -eq 'en'
  $first = $PrayerById['hac-isareti']
  $opts = ($Rosary.sets | ForEach-Object {
    $name = if ($en) { $_.en } else { $_.tr }
    "<option value=`"$($_.id)`" data-days=`"$($_.days -join ',')`">$name</option>"
  }) -join ''
  $t = if ($en) {
    @{ h = 'Pray the Rosary, Bead by Bead'; lead = 'Tap the glowing bead or press Next; the prayer for each bead appears in the prayer panel. Today''s mysteries are chosen for you.'
       sel = 'Mysteries'; restart = 'Start over'; panel = 'Prayer panel'; grip = 'Hide prayer text'; prev = 'Previous'; next = 'Next'
       svg = 'A five-decade rosary: tap a bead to move to it'; ctx = 'Opening'; title = $first.en.title; text = $first.en.text }
  } else {
    @{ h = 'Adım Adım Tesbih'; lead = "Parlayan taneye dokunun ya da Sonraki düğmesine basın; her tanenin duası dua panelinde görünür. Günün gizemleri kendiliğinden seçilir."
       sel = 'Gizemler'; restart = 'Baştan başla'; panel = 'Dua paneli'; grip = 'Dua metnini gizle'; prev = 'Önceki'; next = 'Sonraki'
       svg = 'Beş onluklu tesbih: bir taneye geçmek için dokunun'; ctx = 'Giriş'; title = $first.tr.title; text = $first.tr.text }
  }
  return @"
  <section class="rt" id="tesbih-rehberi" aria-labelledby="rt-h">
    <h2 class="section-title" id="rt-h">$($t.h)</h2>
    <p class="rt-lead">$($t.lead)</p>
    <div class="rt-bar">
      <label class="rt-select"><span class="label">$($t.sel)</span><select id="rt-set">$opts</select></label>
      <button type="button" class="rt-restart">$IcoRefresh<span>$($t.restart)</span></button>
    </div>
    <div class="rt-body">
      <div class="rt-stage">
        $(Rosary-Svg $t.svg)
        <div class="rt-center" aria-hidden="true"><p class="rt-c-set"></p><p class="rt-c-count"></p><p class="rt-c-myst">$($t.ctx)</p></div>
      </div>
      <div class="rt-sheet glass" role="region" aria-label="$($t.panel)">
        <button type="button" class="rt-grip" aria-expanded="true" aria-controls="rt-text" aria-label="$($t.grip)"><span></span></button>
        <div class="rt-progress" aria-hidden="true"><span></span></div>
        <p class="rt-resume" hidden></p>
        <p class="rt-context label">$($t.ctx)</p>
        <p class="rt-mystery" hidden><span class="rt-m-label"></span><span class="rt-m-title"></span></p>
        <h3 class="rt-title">$(Inline $t.title)</h3>
        <div class="rt-text" id="rt-text">$((Verse $t.text) -replace '<br>', ' <br>')</div>
        <div class="rt-nav">
          <button type="button" class="rt-prev" disabled>$IcoPrev<span>$($t.prev)</span></button>
          <button type="button" class="rt-next"><span>$($t.next)</span>$IcoNext</button>
        </div>
        <p class="visually-hidden rt-live" aria-live="polite"></p>
      </div>
    </div>
  </section>
"@
}

$mysterySets = ($Rosary.sets | ForEach-Object {
  $items = ($_.items | ForEach-Object { "<li><span class=`"m-tr`">$(Inline $_.tr)</span><span class=`"m-en`" lang=`"en`">$($_.en)</span></li>" }) -join ''
  "<article class=`"myst`" data-days=`"$($_.days -join ',')`" id=`"gizem-$($_.id)`">" +
    "<header><h3>$(Inline $_.tr)</h3><p class=`"m-day label`">$($_.dayTr)</p><p class=`"m-en-title`" lang=`"en`">$($_.en)</p></header>" +
    "<ol class=`"myst-list`">$items</ol></article>"
}) -join "`n"
$stepList = ($Rosary.steps | ForEach-Object {
  "<li><span class=`"s-tr`">$(Inline $_.tr)</span><span class=`"s-en`" lang=`"en`">$($_.en)</span></li>"
}) -join ''

$PrayerById = @{}
$Rosary.prayers | ForEach-Object { $PrayerById[$_.id] = $_ }
$tespihBody = @"
<div class="wrap narrow">
  $(Crumbs 'Tesbih Duası')
  <header class="page-head center"><p class="label">Dualar</p><h1>$($Rosary.title)</h1><p class="sub" lang="en">$($Rosary.en)</p></header>
  <p class="faq-intro">$(Inline $Rosary.intro)</p>
$(Rosary-Tracker 'tr')
  <h2 class="section-title" id="gizemler">Gizemler</h2>
  <div class="myst-grid">
$mysterySets
  </div>
  <h2 class="section-title" id="nasil">Tesbih nasıl dua edilir?</h2>
  <ol class="steps">$stepList</ol>
  <p class="conventions">Dua metinleri, İstanbul’daki Sant’Antuan (Aziz Antuan) Bazilikası’nda tesbih duası için kullanılan Türkçe gelenek esas alınarak düzenlenmiştir.</p>
</div>
"@
Write-Page -File 'tesbih-duasi.html' -Title "$($Rosary.title) | $SiteName" `
  -Description "Meryem Ana Tesbih Duası: duaların Türkçesi ve İngilizcesi, Sevinç, Işık, Acı ve Yücelik gizemleri ve tesbihin nasıl dua edileceği." `
  -Path 'tesbih-duasi.html' -Body $tespihBody -JsonLd @((Breadcrumb-Ld 'Tesbih Duası' 'tesbih-duasi.html'))

# ---------------- en/rosary.html: The Holy Rosary, in English
$mysterySetsEn = ($Rosary.sets | ForEach-Object {
  $items = ($_.items | ForEach-Object { "<li>$(Inline $_.en)</li>" }) -join ''
  "<article class=`"myst`" data-days=`"$($_.days -join ',')`" id=`"gizem-$($_.id)`">" +
    "<header><h3>$(Inline $_.en)</h3><p class=`"m-day label`">$($_.dayEn)</p></header>" +
    "<ol class=`"myst-list`">$items</ol></article>"
}) -join "`n"
$stepListEn = ($Rosary.steps | ForEach-Object { "<li>$(Inline $_.en)</li>" }) -join ''

$tespihBodyEn = @"
<div class="wrap narrow">
  $(Crumbs-En 'The Holy Rosary')
  <header class="page-head center"><p class="label">Prayers</p><h1>$($Rosary.en)</h1></header>
  <p class="faq-intro">$(Inline $Rosary.introEn)</p>
$(Rosary-Tracker 'en')
  <h2 class="section-title" id="gizemler">The Mysteries</h2>
  <div class="myst-grid">
$mysterySetsEn
  </div>
  <h2 class="section-title" id="nasil">How to Pray the Rosary</h2>
  <ol class="steps">$stepListEn</ol>
  <p class="conventions">The prayer texts follow the Turkish devotional tradition used for the Rosary at St. Anthony of Padua Basilica in Istanbul; this English page shows the original English wording of each prayer as given alongside it.</p>
</div>
"@
Write-Page -File 'en/rosary.html' -Title "$($Rosary.en) | $SiteName" `
  -Description 'The Holy Rosary: the prayers, the Joyful, Luminous, Sorrowful and Glorious Mysteries, and how to pray the Rosary.' `
  -Path 'en/rosary.html' -Body $tespihBodyEn -JsonLd @((Breadcrumb-Ld 'The Holy Rosary' 'en/rosary.html' '' '' 'en')) -Lang 'en'


# ================================================================== MUCIZELER (mucizeler.html)
$Miracles = Read-Data 'mucizeler.js'
$MiracleIcons = @{
  apparition = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.2 13.3 10.7 17 12 13.3 13.3 12 16.8 10.7 13.3 7 12 10.7 10.7Z"/></svg>'
  relic      = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="3.5" width="15" height="19" rx="1.2"/><path d="M12 8.5v8M8.5 12.5h7"/></svg>'
  eucharist  = $IcoChalice
  incorrupt  = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 20V11a7 7 0 0 1 14 0v9"/><path d="M4 20h16"/><path d="M12 3.4v2.2M10.8 4.5h2.4"/></svg>'
}
$script:MiraN = 0
$miraToc = ($Miracles.categories | ForEach-Object { "<li><a href=`"#$($_.id)`">$(Inline $_.title)</a></li>" }) -join ''
$miraCats = ($Miracles.categories | ForEach-Object {
  $script:MiraN++; $cat = $_
  $icon = $MiracleIcons[$cat.icon]
  $items = ($cat.items | ForEach-Object {
    $more = if ($GreatSaintIds.ContainsKey($_.id)) { "<a class=`"today-more-link`" href=`"$($_.id).html`">Devamını oku$IcoNext</a>" } else { '' }
    "<details class=`"mira-item`" id=`"$($_.id)`"><summary><span class=`"mira-ico`">$icon</span><span class=`"mira-head`"><span class=`"mira-name`">$(Inline $_.name)</span><span class=`"mira-place label`">$($_.place)</span></span>$IcoChevLg</summary><div class=`"mira-bio`">$(Blocks $_.bio)$more</div></details>"
  }) -join "`n"
  "<section class=`"mira-cat`" id=`"$($cat.id)`">" +
    "<h2 class=`"section-title`"><span class=`"label`">$($script:MiraN)</span>$(Inline $cat.title)</h2>" +
    "<p class=`"faq-cat-en`" lang=`"en`">$($cat.en)</p>" +
    "<p class=`"faq-intro`">$(Inline $cat.lead)</p>" +
    "<div class=`"mira-list`">$items</div></section>"
}) -join "`n"
$mucizelerBody = @"
<div class="wrap narrow">
  $(Crumbs 'Mucizeler')
  <header class="page-head center">$(Page-Ico $IcoSparkle)<h1>$($Miracles.title)</h1><p class="sub" lang="en">$($Miracles.en)</p></header>
  <p class="faq-intro">$(Inline $Miracles.intro)</p>
  <nav class="faq-toc is-sticky" aria-label="Kategoriler"><ul>$miraToc</ul></nav>
$miraCats
</div>
"@
Write-Page -File 'mucizeler.html' -Title "Mucizeler | $SiteName" `
  -Description "Katolik Kilisesi$($Apos)nde bilinen mucizeler: Meryem Ana görünmeleri (Fatima, Lourdes, Guadalupe, Zeytun), Torino Kefeni, Efkaristiya mucizeleri ve çürümeyen azizler." `
  -Path 'mucizeler.html' -Body $mucizelerBody -JsonLd @((Breadcrumb-Ld 'Mucizeler' 'mucizeler.html'))

# ---------------- en/miracles.html: Miracles, in English
$miraTocEn = ($Miracles.categories | ForEach-Object { "<li><a href=`"#$($_.id)`">$(Inline $_.en)</a></li>" }) -join ''
$miraCatsEn = ($Miracles.categories | ForEach-Object {
  $cat = $_
  $icon = $MiracleIcons[$cat.icon]
  $items = ($cat.items | ForEach-Object {
    $moreEn = if ($GreatSaintIds.ContainsKey($_.id)) { "<a class=`"today-more-link`" href=`"$($EnAltMap["$($_.id).html"])`">Read more$IcoNext</a>" } else { '' }
    "<details class=`"mira-item`" id=`"$($_.id)`"><summary><span class=`"mira-ico`">$icon</span><span class=`"mira-head`"><span class=`"mira-name`">$(Inline $_.nameEn)</span><span class=`"mira-place label`">$($_.placeEn)</span></span>$IcoChevLg</summary><div class=`"mira-bio`">$(Blocks $_.bioEn)$moreEn</div></details>"
  }) -join "`n"
  $n = [array]::IndexOf(@($Miracles.categories), $cat) + 1
  "<section class=`"mira-cat`" id=`"$($cat.id)`">" +
    "<h2 class=`"section-title`"><span class=`"label`">$n</span>$(Inline $cat.en)</h2>" +
    "<p class=`"faq-intro`">$(Inline $cat.leadEn)</p>" +
    "<div class=`"mira-list`">$items</div></section>"
}) -join "`n"
$mucizelerBodyEn = @"
<div class="wrap narrow">
  $(Crumbs-En 'Miracles')
  <header class="page-head center">$(Page-Ico $IcoSparkle)<h1>$($Miracles.en)</h1></header>
  <p class="faq-intro">$(Inline $Miracles.introEn)</p>
  <nav class="faq-toc is-sticky" aria-label="Categories"><ul>$miraTocEn</ul></nav>
$miraCatsEn
</div>
"@
Write-Page -File 'en/miracles.html' -Title "Miracles | $SiteName" `
  -Description "Well-known Catholic miracles: Marian apparitions (Fatima, Lourdes, Guadalupe, Zeitoun), the Shroud of Turin, Eucharistic miracles and incorrupt saints." `
  -Path 'en/miracles.html' -Body $mucizelerBodyEn -JsonLd @((Breadcrumb-Ld 'Miracles' 'en/miracles.html' '' '' 'en')) -Lang 'en'

# ================================================================== KILISELER (kiliseler.html): parish locator
$Churches = Read-Data 'kiliseler.js'
$RiteLabels = @{}
$Churches.rites | ForEach-Object { $RiteLabels[$_.id] = @{ tr = $_.tr; en = $_.en } }
# Deliberately searches Google Maps by the church's own name + district + city rather than a
# possibly-imprecise street address: these are all named, independently mappable landmarks, so
# a name search resolves reliably even where the sourced address text is only district-level.
function Map-Url([string]$q) { return 'https://www.google.com/maps/search/?api=1&query=' + [uri]::EscapeDataString($q) }
function Google-Url([string]$q) { return 'https://www.google.com/search?q=' + [uri]::EscapeDataString($q) }
$IcoClock = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.2"/><path d="M12 7.4V12l3.2 2"/></svg>'
$IcoPhone = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5.2 4h3.1l1.3 4-2 1.4a12.5 12.5 0 0 0 5.9 5.9l1.4-2 4 1.3v3.1a1.6 1.6 0 0 1-1.7 1.6A16.3 16.3 0 0 1 3.6 5.7 1.6 1.6 0 0 1 5.2 4Z"/></svg>'
$IcoExternal = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/><path d="M14 4h6v6"/><path d="M20 4 10.5 13.5"/></svg>'
$IcoWarn = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 2.6 18.2a1.6 1.6 0 0 0 1.4 2.4h16a1.6 1.6 0 0 0 1.4-2.4L13.7 3.9a1.6 1.6 0 0 0-2.8 0Z"/><path d="M12 9.5v4.4"/><circle cx="12" cy="16.8" r="1" fill="currentColor" stroke="none"/></svg>'
$IcoChurch = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.6v3.1M10.6 4.1h2.8"/><path d="M5 10.8 12 6l7 4.8V21H5Z"/><path d="M9.6 21v-4.6a2.4 2.4 0 0 1 4.8 0V21"/></svg>'
$riteSelectOpts = ($Churches.rites | ForEach-Object { "<option value=`"$($_.id)`">$($_.tr) ($($_.en))</option>" }) -join ''
$riteFilterHtml = "<div class=`"select-wrap rite-filter`">" +
  "<select id=`"rite-select`" aria-label=`"Kilise türüne göre filtrele`"><option value=`"all`">Tüm Kiliseler (All Churches)</option>$riteSelectOpts</select>$IcoChevDown" +
"</div>"
$kiliselerToc = ($Churches.cities | ForEach-Object { "<li><a href=`"#$($_.id)`" data-city-link=`"$($_.id)`">$($_.name)</a></li>" }) -join ''
$kiliselerCities = ($Churches.cities | ForEach-Object {
  $city = $_
  $cards = ($city.churches | ForEach-Object {
    $rite = $RiteLabels[$_.rite]
    # Skip the address line entirely when the sourced data was only district-level (the address
    # field then just repeats "district, city", which the line above already shows).
    $hasRealAddr = $_.address -ne "$($_.district), $($city.name)"
    # Searching by the church's own name (all 31 are unique) resolves to the right building far
    # more reliably in Google/Apple Maps than an assembled street address, which both apps have
    # sometimes mis-parsed or only matched down to the district centroid.
    $mapQ = "$($_.name), $($city.name)"
    $mapQAttr = $mapQ -replace '&', '&amp;' -replace '"', '&quot;'
    $phoneRow = if ($_.phone) { "<p class=`"church-meta`">$IcoPhone $($_.phone)</p>" } else { '' }
    $addrRow = if ($hasRealAddr) { "<p class=`"church-meta church-address`">$(Inline $_.address)</p>" } else { '' }
    $siteLink = if ($_.website) { "<a class=`"btn`" href=`"$($_.website)`" target=`"_blank`" rel=`"noopener`">Resmi Site $IcoExternal</a>" }
                else { "<a class=`"btn`" href=`"$(Google-Url "$($_.name) $($city.name)")`" target=`"_blank`" rel=`"noopener`">Web$($Apos)te Ara $IcoExternal</a>" }
    $warnRow = if ($_.inactive) {
      "<details class=`"church-warn`"><summary>$IcoWarn<strong>Şu anda kapalı</strong><span class=`"en`" lang=`"en`">(Currently closed)</span>" +
        "<span class=`"church-warn-more`">Devamını oku <span class=`"en`" lang=`"en`">(Read more)</span> $IcoChevDown</span></summary>" +
        "<div class=`"church-warn-body`"><p>$(Inline $_.inactiveNote)</p><p lang=`"en`">$(Inline $_.inactiveNoteEn)</p></div></details>"
    } else { '' }
    "<article class=`"text-card church-card`" id=`"$($_.id)`" data-rite=`"$($_.rite)`">" +
      "<header class=`"church-head`"><h3 class=`"t-title`">$(Inline $_.name)</h3><span class=`"church-rite rite-$($_.rite)`">$($rite.tr)</span></header>" +
      $warnRow +
      "<p class=`"sub`" lang=`"en`">$(Inline $_.nameEn) · $($rite.en)</p>" +
      "<p class=`"church-meta`">$IcoPin $($_.district), $($city.name)</p>" +
      $addrRow +
      $phoneRow +
      "<details class=`"church-hours-item`"><summary>$IcoClock Ayin Saatleri <span class=`"en`" lang=`"en`">(Mass Times)</span></summary>" +
        "<div class=`"church-hours-body`"><p class=`"church-hours`">$(Inline $_.hours)</p><p class=`"church-hours en`" lang=`"en`">$(Inline $_.hoursEn)</p></div></details>" +
      "<p class=`"church-actions`"><a class=`"btn map-link`" href=`"$(Map-Url $mapQ)`" data-map-q=`"$mapQAttr`" target=`"_blank`" rel=`"noopener`">Haritada Aç $IcoExternal</a>$siteLink</p>" +
    "</article>"
  }) -join "`n"
  $cityNames = (($city.churches | ForEach-Object { Inline $_.name }) -join ', ')
  "<details class=`"church-city`" id=`"$($city.id)`" open><summary class=`"church-city-head`">" +
    "<span class=`"church-city-ico`">$IcoChurch</span>" +
    "<span class=`"church-city-body`"><span class=`"church-city-name`">$($city.name)</span><span class=`"church-city-names`">$cityNames</span></span>" +
    "<span class=`"church-city-more`">Tüm Liste <span class=`"en`" lang=`"en`">(Full List)</span> $IcoChevDown</span>" +
    "</summary>" +
    "<div class=`"church-list`">$cards</div></details>"
}) -join "`n"
$kiliselerBody = @"
<div class="wrap narrow">
  $(Crumbs 'Kilise Bul')
  <header class="page-head center">$(Page-Ico $IcoChurch)<h1>$($Churches.title)</h1><p class="sub" lang="en">$($Churches.en)</p></header>
  <nav class="faq-toc is-sticky" aria-label="Şehirler"><ul>$kiliselerToc</ul></nav>
  $riteFilterHtml
$kiliselerCities
  <p class="conventions">$(Inline $Churches.note)</p>
  <div class="faq-list">
    <details class="faq-item" id="katolik-bulunamadiginda"><summary><span class="faq-q">Yakınımda Katolik kilisesi yoksa ne yapmalıyım?</span>$IcoChevLg</summary>
      <div class="faq-a"><p>$(Inline $Churches.orthodoxNote)</p></div></details>
  </div>
</div>
"@
Write-Page -File 'kiliseler.html' -Title "$($Churches.title) | $SiteName" `
  -Description "Türkiye$($Apos)deki etkin Katolik kiliselerinin listesi: Latin, Ermeni Katolik, Süryani Katolik ve Keldani Katolik cemaatleri, adres ve ayin saatleriyle." `
  -Path 'kiliseler.html' -Body $kiliselerBody -JsonLd @((Breadcrumb-Ld 'Kilise Bul' 'kiliseler.html'))

# ---------------- en/find-a-church.html: Find a Parish, in English
$riteSelectOptsEn = ($Churches.rites | ForEach-Object { "<option value=`"$($_.id)`">$($_.en)</option>" }) -join ''
$riteFilterHtmlEn = "<div class=`"select-wrap rite-filter`">" +
  "<select id=`"rite-select`" aria-label=`"Filter by church rite`"><option value=`"all`">All Churches</option>$riteSelectOptsEn</select>$IcoChevDown" +
"</div>"
$kiliselerTocEn = ($Churches.cities | ForEach-Object { "<li><a href=`"#$($_.id)`" data-city-link=`"$($_.id)`">$($_.name)</a></li>" }) -join ''
$kiliselerCitiesEn = ($Churches.cities | ForEach-Object {
  $city = $_
  $cards = ($city.churches | ForEach-Object {
    $rite = $RiteLabels[$_.rite]
    $hasRealAddr = $_.address -ne "$($_.district), $($city.name)"
    $mapQ = "$($_.name), $($city.name)"
    $mapQAttr = $mapQ -replace '&', '&amp;' -replace '"', '&quot;'
    $phoneRow = if ($_.phone) { "<p class=`"church-meta`">$IcoPhone $($_.phone)</p>" } else { '' }
    $addrRow = if ($hasRealAddr) { "<p class=`"church-meta church-address`">$(Inline $_.address)</p>" } else { '' }
    $siteLink = if ($_.website) { "<a class=`"btn`" href=`"$($_.website)`" target=`"_blank`" rel=`"noopener`">Official Site $IcoExternal</a>" }
                else { "<a class=`"btn`" href=`"$(Google-Url "$($_.nameEn) $($city.name)")`" target=`"_blank`" rel=`"noopener`">Search Online $IcoExternal</a>" }
    $warnRow = if ($_.inactive) {
      "<details class=`"church-warn`"><summary>$IcoWarn<strong>Currently closed</strong>" +
        "<span class=`"church-warn-more`">Read more $IcoChevDown</span></summary>" +
        "<div class=`"church-warn-body`"><p>$(Inline $_.inactiveNoteEn)</p></div></details>"
    } else { '' }
    "<article class=`"text-card church-card`" id=`"$($_.id)`" data-rite=`"$($_.rite)`">" +
      "<header class=`"church-head`"><h3 class=`"t-title`">$(Inline $_.nameEn)</h3><span class=`"church-rite rite-$($_.rite)`">$($rite.en)</span></header>" +
      $warnRow +
      "<p class=`"church-meta`">$IcoPin $($_.district), $($city.name)</p>" +
      $addrRow +
      $phoneRow +
      "<details class=`"church-hours-item`"><summary>$IcoClock Mass Times</summary>" +
        "<div class=`"church-hours-body`"><p class=`"church-hours`">$(Inline $_.hoursEn)</p></div></details>" +
      "<p class=`"church-actions`"><a class=`"btn map-link`" href=`"$(Map-Url $mapQ)`" data-map-q=`"$mapQAttr`" target=`"_blank`" rel=`"noopener`">Open on Map $IcoExternal</a>$siteLink</p>" +
    "</article>"
  }) -join "`n"
  $cityNamesEn = (($city.churches | ForEach-Object { Inline $_.nameEn }) -join ', ')
  "<details class=`"church-city`" id=`"$($city.id)`" open><summary class=`"church-city-head`">" +
    "<span class=`"church-city-ico`">$IcoChurch</span>" +
    "<span class=`"church-city-body`"><span class=`"church-city-name`">$($city.name)</span><span class=`"church-city-names`">$cityNamesEn</span></span>" +
    "<span class=`"church-city-more`">Full List $IcoChevDown</span>" +
    "</summary>" +
    "<div class=`"church-list`">$cards</div></details>"
}) -join "`n"
$kiliselerBodyEn = @"
<div class="wrap narrow">
  $(Crumbs-En 'Find a Parish')
  <header class="page-head center">$(Page-Ico $IcoChurch)<h1>Find a Parish</h1></header>
  <nav class="faq-toc is-sticky" aria-label="Cities"><ul>$kiliselerTocEn</ul></nav>
  $riteFilterHtmlEn
$kiliselerCitiesEn
  <p class="conventions">$(Inline $Churches.noteEn)</p>
  <div class="faq-list">
    <details class="faq-item" id="no-catholic-church-nearby"><summary><span class="faq-q">What should I do if there's no Catholic church nearby?</span>$IcoChevLg</summary>
      <div class="faq-a"><p>$(Inline $Churches.orthodoxNoteEn)</p></div></details>
  </div>
</div>
"@
Write-Page -File 'en/find-a-church.html' -Title "Find a Parish | $SiteName" `
  -Description 'A directory of active Catholic parishes in Turkey: Latin, Armenian Catholic, Syriac Catholic and Chaldean Catholic communities, with addresses and Mass times.' `
  -Path 'en/find-a-church.html' -Body $kiliselerBodyEn -JsonLd @((Breadcrumb-Ld 'Find a Parish' 'en/find-a-church.html' '' '' 'en')) -Lang 'en'

# ================================================================== ILETISIM (iletisim.html)
$iletisimBody = @"
<div class="wrap narrow">
  $(Crumbs 'İletişim')
  <header class="page-head center"><p class="label">Contact</p><h1>İletişim</h1></header>
  <div class="placeholder-page contact-page">
    $IcoMail
    <p class="placeholder-lead">Bize ulaşın</p>
    <p>Bir çeviride hata fark ettiyseniz, eklenmesini istediğiniz bir konu, aziz ya da mucize varsa veya sadece merhaba demek isterseniz, aşağıdaki e-posta adresi üzerinden iletişime geçebilirsiniz.</p>
    <p class="contact-email"><a class="btn" href="mailto:david@katolikdunyasi.com">david@katolikdunyasi.com</a></p>
    <p>Gelen her mesajı bizzat okuyorum. Yoğunluğa bağlı olarak yanıt vermem biraz zaman alabilir; fakat paylaştığınız tüm geri bildirimler için şimdiden içtenlikle teşekkür ederim.</p>
  </div>
</div>
"@
Write-Page -File 'iletisim.html' -Title "İletişim | $SiteName" `
  -Description "katolikdunyasi.com$($Apos)a nasıl ulaşabileceğiniz: çeviri düzeltmeleri, içerik önerileri ve sorularınız için e-posta adresi." `
  -Path 'iletisim.html' -Body $iletisimBody -JsonLd @((Breadcrumb-Ld 'İletişim' 'iletisim.html'))

# ---------------- en/contact.html: Contact, in English
$iletisimBodyEn = @"
<div class="wrap narrow">
  $(Crumbs-En 'Contact')
  <header class="page-head center"><p class="label">Contact</p><h1>Contact</h1></header>
  <div class="placeholder-page contact-page">
    $IcoMail
    <p class="placeholder-lead">Get in touch</p>
    <p>If you've spotted a translation error, have a topic, saint or miracle you'd like added, or just want to say hello, you can get in touch through the email address below.</p>
    <p class="contact-email"><a class="btn" href="mailto:david@katolikdunyasi.com">david@katolikdunyasi.com</a></p>
    <p>I read every message personally. Depending on how busy things are, my reply may take a little while; but thank you sincerely in advance for all the feedback you share.</p>
  </div>
</div>
"@
Write-Page -File 'en/contact.html' -Title "Contact | $SiteName" `
  -Description 'How to reach katolikdunyasi.com: an email address for translation corrections, content suggestions, and questions.' `
  -Path 'en/contact.html' -Body $iletisimBodyEn -JsonLd @((Breadcrumb-Ld 'Contact' 'en/contact.html' '' '' 'en')) -Lang 'en'

# ================================================================== ERISILEBILIRLIK (erisilebilirlik.html)
$erBody = @"
<div class="wrap narrow">
  $(Crumbs 'Erişilebilirlik')
  <header class="page-head center"><p class="label">Erişilebilirlik</p><h1>$($ErMeta.title)</h1><p class="sub">$($ErMeta.subtitle)</p></header>
  <div class="body prose">$(Convert-Markdown $Er.body)</div>
</div>
"@
Write-Page -File 'erisilebilirlik.html' -Title "$($ErMeta.title) | $SiteName" -Description $ErMeta.description `
  -Path 'erisilebilirlik.html' -Body $erBody -JsonLd @((Breadcrumb-Ld 'Erişilebilirlik' 'erisilebilirlik.html'))

# ---------------- en/accessibility.html: Accessibility, in English
$erBodyEn = @"
<div class="wrap narrow">
  $(Crumbs-En 'Accessibility')
  <header class="page-head center"><p class="label">Accessibility</p><h1>$($ErMetaEn.title)</h1><p class="sub">$($ErMetaEn.subtitle)</p></header>
  <div class="body prose">$(Convert-Markdown $ErEn.body)</div>
</div>
"@
Write-Page -File 'en/accessibility.html' -Title "$($ErMetaEn.title) | $SiteName" -Description $ErMetaEn.description `
  -Path 'en/accessibility.html' -Body $erBodyEn -JsonLd @((Breadcrumb-Ld 'Accessibility' 'en/accessibility.html' '' '' 'en')) -Lang 'en'

# ================================================================== GIZLILIK (gizlilik.html)
$gzBody = @"
<div class="wrap narrow">
  $(Crumbs 'Gizlilik Politikası')
  <header class="page-head center"><p class="label">Gizlilik</p><h1>$($GzMeta.title)</h1><p class="sub">$($GzMeta.subtitle)</p></header>
  <div class="body prose">$(Convert-Markdown $Gz.body)</div>
</div>
"@
Write-Page -File 'gizlilik.html' -Title "$($GzMeta.title) | $SiteName" -Description $GzMeta.description `
  -Path 'gizlilik.html' -Body $gzBody -JsonLd @((Breadcrumb-Ld 'Gizlilik Politikası' 'gizlilik.html'))

# ---------------- en/privacy.html: Privacy Policy, in English
$gzBodyEn = @"
<div class="wrap narrow">
  $(Crumbs-En 'Privacy Policy')
  <header class="page-head center"><p class="label">Privacy</p><h1>$($GzMetaEn.title)</h1><p class="sub">$($GzMetaEn.subtitle)</p></header>
  <div class="body prose">$(Convert-Markdown $GzEn.body)</div>
</div>
"@
Write-Page -File 'en/privacy.html' -Title "$($GzMetaEn.title) | $SiteName" -Description $GzMetaEn.description `
  -Path 'en/privacy.html' -Body $gzBodyEn -JsonLd @((Breadcrumb-Ld 'Privacy Policy' 'en/privacy.html' '' '' 'en')) -Lang 'en'

# ================================================================== 404.html (served by GitHub Pages for unknown URLs)
$notFoundBody = @"
<div class="wrap narrow">
  <section class="hero">
    $Logo
    <p class="label">404</p>
    <h1>Sayfa bulunamadı</h1>
    <p class="hint">Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir. Bir soru arayın ya da ana sayfaya dönün.</p>
    $(Search-Form 'hero-search' 'q-404' '598 soruda ara')
    <p class="about-link"><a class="btn" href="index.html">Ana sayfaya dön</a></p>
  </section>
</div>
"@
Write-Page -File '404.html' -Title "Sayfa bulunamadı | $SiteName" -Description 'Sayfa bulunamadı.' -Path '404.html' -Body $notFoundBody `
  -Robots 'noindex' -Canonical $false -RootRelative $true

# ---------------- index.html / en/index.html: the home page
# Phones: an iPhone-like home screen. Today's saint, the date with the liturgical season (the card
# takes the season's colour) and the day's rosary mysteries, then four app icons: Ara opens the
# Katekizm search over the blurred screen, and Öğren, Dua Et and Keşfet open Settings-style pages
# listing their pages, with each page's own sections one level further in (see initHome).
# Desktop: the same three cards in a row, a search bar, and the three lists side by side.
# Each page's own content, down to single questions and prayers, is laid out in the browser from
# the site's data files once a page is opened in its app (initHomeTree in assets/script.js).
$HomeApps = @(
  @{ id = 'ogren'; t = 'Öğren'; te = 'Learn'; s = 'İnancın ne olduğu ve nedeni'; se = 'What the faith is, and why'; ico = $SmallCross; pages = @(
    @{ f = 'neden-katoligiz.html'; ico = $IcoCompass; t = 'Neden Katoliğiz?'; te = "Why We're Catholic"
       s = 'İmanın beş adımda, akla ve kalbe birlikte hitap eden özeti.'; se = 'A five-step summary of the faith, speaking to reason and the heart together.' },
    @{ f = 'katesizm.html'; ico = $SmallCross; t = 'Katekizm'; te = 'Compendium'
       s = 'İman, kutsal sırlar, ahlak ve dua üzerine 598 soru ve yanıt.'; se = '598 questions and answers on faith, the sacraments, morality and prayer.' },
    @{ f = 'kutsal-kitap.html'; ico = $IcoBook; t = 'Kutsal Kitap'; te = 'The Bible'; s = $KkMeta.short; se = $KkMetaEn.short },
    @{ f = 'sss.html'; ico = $IcoAsk; t = 'Sorular'; te = 'FAQ'
       s = 'Katolik inancı üzerine en sık sorulan sorular.'; se = 'The most common questions about the Catholic faith.' },
    @{ f = 'katolik-sureci.html'; ico = $IcoWay; t = 'Katolik Olma Süreci'; te = 'Becoming Catholic'
       s = 'Katolik olmak isteyenler için OCIA süreci, adım adım.'; se = 'The OCIA process for those who want to become Catholic, step by step.' },
    @{ f = 'meseller.html'; ico = $IcoScroll; t = "İsa$($Apos)nın Meselleri"; te = 'The Parables of Jesus'
       s = 'Otuz iki mesel, düz bir dille açıklanmış.'; se = 'Thirty-two parables, plainly explained.' }) },
  @{ id = 'dua'; t = 'Dua Et'; te = 'Pray'; s = 'Ayin, tesbih ve günlük dualar'; se = 'The Mass, the Rosary and daily prayers'; ico = $TbChurch; pages = @(
    @{ f = 'kutsal-ayin.html'; ico = $IcoChalice; t = 'Kutsal Ayin'; te = 'The Mass'
       s = 'Ayinin sırası, toplanmadan son takdise altı bölüm.'; se = 'The order of the Mass, in six parts.' },
    @{ f = 'tesbih-duasi.html'; ico = $IcoBeads; t = 'Tesbih Duası'; te = 'The Rosary'
       s = 'Duaların Türkçesi ve İngilizcesi, bütün gizemleriyle.'; se = 'The prayers and all four sets of mysteries.' },
    @{ f = 'ekler.html'; ico = $IcoPrayers; t = 'Sık Kullanılan Dualar'; te = 'Common Prayers'
       s = 'Günlük dualar ve formüller, tek sayfada.'; se = 'Daily prayers and formulas of Catholic doctrine, on one page.' },
    @{ f = 'gunah-cikarma.html'; ico = $IcoKey; t = 'Günah Çıkarma'; te = 'Confession'
       s = 'Nasıl işler, adım adım; vicdan muhasebesi ve sık sorulan sorular.'; se = 'How it works, step by step; an examination of conscience and FAQ.' }) },
  @{ id = 'kesfet'; t = 'Keşfet'; te = 'Explore'; s = 'Azizler, mucizeler ve bu toprakların kökleri'; se = "Saints, miracles and our faith's roots in this land"; ico = $IcoCompass; pages = @(
    @{ f = 'azizler.html'; ico = $IcoStar; t = 'Azizler'; te = 'Saints'
       s = 'Bugünün azizini görün, yılın her günü için hayat hikâyeleri.'; se = 'A saint for every day of the year, and the twenty best-known names.' },
    @{ f = 'mucizeler.html'; ico = $IcoRadiance; t = 'Mucizeler'; te = 'Miracles'
       s = 'Meryem Ana görünmeleri, Torino Kefeni, Efkaristiya mucizeleri ve çürümeyen azizler.'; se = 'Marian apparitions, the Shroud of Turin, Eucharistic miracles and the incorrupt saints.' },
    @{ f = 'topraklarimizda-hristiyanlik.html'; ico = $IcoRoots; t = 'Topraklarımızda Hristiyanlık'; te = 'Christianity in Our Land'
       s = "Pavlus$($Apos)un memleketi, Vahiy$($Apos)in yedi kilisesi, İznik Konsili."; se = "Paul's homeland, the seven churches of Revelation, the Council of Nicaea." },
    @{ f = 'kiliseler.html'; ico = $IcoPin; t = 'Kilise Bul'; te = 'Find a Church'
       s = "Türkiye$($Apos)de ayine gidebileceğiniz kiliseler, şehir şehir."; se = 'Catholic churches you can attend Mass at in Turkey, city by city.' }) }
)

$IcoBack = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>'
$IcoChevR = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>'
$IcoOpenPage = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-8.5 8.5"/><path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/></svg>'
function Home-Page([string]$lang) {
  $en = $lang -eq 'en'
  function L([string]$tr, [string]$enText) { if ($en) { $enText } else { $tr } }
  function F([string]$f) { if ($en) { $EnAltMap[$f] } else { $f } }
  $loading = L 'Yükleniyor…' 'Loading…'
  $cards = @"
  <div class="hm-today" id="bugun">
    <a class="hm-card hm-saint" href="$(F 'azizler.html')" data-home-saint>
      <span class="hm-label">$IcoStar $(L 'Bugünün Azizi' 'Saint of the Day')</span>
      <span class="hm-sn" data-hs-name>$loading</span><span class="hm-sub" data-hs-title></span><span class="hm-bio" data-hs-bio></span>
      <span class="hm-go">$(L 'Hayatını oku' 'Read their life') $IcoChevR</span>
    </a>
    <div class="hm-card hm-date" data-home-lit>
      <span class="hm-label">$(L 'Bugün' 'Today')</span>
      <span class="hm-day" data-hd-day>$loading</span><span class="hm-year" data-hd-year></span><time class="hm-time" data-hd-time></time>
      <span class="hm-season" data-hd-season></span><span class="hm-sub" data-hd-colour></span>
    </div>
    <a class="hm-card hm-myst" href="$(F 'tesbih-duasi.html')" data-home-mystery>
      <span class="hm-label">$IcoBeads $(L 'Günün Gizemi' 'Mysteries')</span>
      <span class="hm-mn" data-hm-name>$loading</span><span class="hm-sub" data-hm-days></span>
      <span class="hm-go">$(L 'Tesbihe başla' 'Pray the Rosary') $IcoChevR</span>
    </a>
  </div>
"@
  $placeholder = L "Katekizm$($Apos)de ara: Türkçe, İngilizce ya da soru numarası" 'Search the Compendium: English or Turkish, or a question number'
  $searchDesk = "<div class=`"hm-search`">$(Search-Form 'hm-search-form' 'q-home' $placeholder $lang)</div>"
  # Desktop lists
  $cols = ($HomeApps | ForEach-Object {
    $app = $_
    $rows = ($app.pages | ForEach-Object { "<a class=`"hm-row`" href=`"$(F $_.f)`"><span class=`"hm-ri`">$($_.ico)</span><span class=`"hm-rt`"><span class=`"hm-t`">$(L $_.t $_.te)</span><span class=`"hm-s`">$(L $_.s $_.se)</span></span>$IcoChevR</a>" }) -join ''
    "<section class=`"hm-col`"><h2>$(L $app.t $app.te)</h2><div class=`"hm-list`">$rows</div></section>"
  }) -join ''
  $lists = "<div class=`"hm-lists`">$cols</div>"
  # Phone: the icons, the search overlay and the three apps
  $araLabel = L 'Ara' 'Search'
  $icons = "<button type=`"button`" class=`"hm-app`" data-app-open=`"ara`" aria-haspopup=`"dialog`" aria-controls=`"app-ara`"><span class=`"hm-icon app-ara`">$IcoSearch</span><span class=`"hm-app-t`">$araLabel</span></button>" +
    (($HomeApps | ForEach-Object { "<button type=`"button`" class=`"hm-app`" data-app-open=`"$($_.id)`" aria-haspopup=`"dialog`" aria-controls=`"app-$($_.id)`"><span class=`"hm-icon app-$($_.id)`">$($_.ico)</span><span class=`"hm-app-t`">$(L $_.t $_.te)</span></button>" }) -join '')
  $close = L 'Kapat' 'Close'
  $spot = "<div class=`"ios-spot`" id=`"app-ara`" role=`"dialog`" aria-modal=`"true`" aria-label=`"$araLabel`" hidden><div class=`"ios-spot-bg`" data-app-close></div>" +
    "<div class=`"ios-spot-panel`"><div class=`"ios-spot-row`">$(Search-Form 'spot-search' 'q-spot' $placeholder $lang)</div>" +
    "<button type=`"button`" class=`"ios-spot-x`" data-app-close>$(L 'Aramayı kapat' 'Close search')</button></div></div>"
  $apps = ($HomeApps | ForEach-Object {
    $app = $_; $appT = L $app.t $app.te; $i = 0
    $rows = ($app.pages | ForEach-Object {
      "<button type=`"button`" class=`"ios-row`" data-push=`"$($app.id)-$i`"><span class=`"ios-ri`">$($_.ico)</span><span class=`"ios-rt`"><span class=`"ios-t`">$(L $_.t $_.te)</span><span class=`"ios-s`">$(L $_.s $_.se)</span></span>$IcoChevR</button>"
      $i++
    }) -join ''
    $pagesHtml = "<section class=`"ios-page is-current`" data-page=`"root`"><header class=`"ios-nav`"><span></span><span class=`"ios-nt`">$appT</span><button type=`"button`" class=`"ios-done`" data-app-close>$close</button></header>" +
      "<div class=`"ios-scroll`"><h2 class=`"ios-large`">$appT</h2><p class=`"ios-lead`">$(L $app.s $app.se)</p><div class=`"ios-group`">$rows</div></div></section>"
    $i = 0
    foreach ($pg in $app.pages) {
      $pt = L $pg.t $pg.te
      $pagesHtml += "<section class=`"ios-page`" data-page=`"$($app.id)-$i`"><header class=`"ios-nav`"><button type=`"button`" class=`"ios-back`" data-pop>$IcoBack<span data-back-label>$appT</span></button><span class=`"ios-nt`">$pt</span><button type=`"button`" class=`"ios-done`" data-app-close>$close</button></header>" +
        "<div class=`"ios-scroll`"><div class=`"ios-hero`"><span class=`"ios-ri ios-ri-lg`">$($pg.ico)</span><h3 class=`"ios-large`">$pt</h3><p class=`"ios-lead`">$(L $pg.s $pg.se)</p></div>" +
        "<p class=`"ios-gh`" data-tree-head>$(L 'Bölümler' 'Sections')</p><div class=`"ios-tree`" data-tree=`"$($pg.f)`" data-title=`"$(Attr $pt)`"></div>" +
        "<p class=`"ios-more`"><a class=`"ios-open`" href=`"$(F $pg.f)`" data-open-page>$(L 'Bütün içeriği göster' 'Show all content')$IcoOpenPage</a></p></div></section>"
      $i++
    }
    "<div class=`"ios-app`" id=`"app-$($app.id)`" data-app=`"$($app.id)`" role=`"dialog`" aria-modal=`"true`" aria-label=`"$appT`" hidden><div class=`"ios-splash app-$($app.id)`">$($app.ico)</div><div class=`"ios-stack`">$pagesHtml</div></div>"
  }) -join "`n"
  $tag = if ($en) { $SiteTagEn } else { $SiteTag }
  # The English file for each Turkish page, for the apps' links (built in the browser)
  $pageMap = if ($en) { " data-pages=`"$(Attr (ConvertTo-Json -InputObject $EnAltMap -Compress))`"" } else { '' }
  $body = @"
<div class="wrap home-v2"$pageMap>
  <h1 class="visually-hidden">$tag</h1>
$cards
  $searchDesk
  <div class="hm-about"><p class="hm-about-t">$tag</p><p class="hm-about-s">$(if ($en) { $fmEn['about'] } else { $fm['about'] })</p></div>
  <nav class="hm-apps" aria-label="$(L 'Bölümler' 'Sections')">$icons</nav>
  $lists
</div>
$spot
$apps
"@
  $homePath = if ($en) { 'en/' } else { '' }
  $q = if ($en) { 'en/compendium.html' } else { 'katesizm.html' }
  $ld = '{"@context":"https://schema.org","@type":"WebSite","name":' + (JStr $SiteName) +
    ',"url":' + (JStr "$SiteUrl/$homePath") + ',"inLanguage":"' + $lang + '","description":' + (JStr $tag) +
    ',"potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":' +
    (JStr "$SiteUrl/$($q)?q={search_term_string}") + '},"query-input":"required name=search_term_string"}}'
  if ($en) {
    Write-Page -File 'en/index.html' -Title "$SiteName | $SiteTagEn" `
      -Description "Catholic World: the Compendium of the Catechism, becoming Catholic, the Mass, the saints, and answers to common questions about the Catholic faith." `
      -Path 'en/' -Body $body -JsonLd @($ld) -Lang 'en'
  } else {
    Write-Page -File 'index.html' -Title "$SiteName | $SiteTag" `
      -Description "Türkçe Katolik Portalı: Katolik Kilisesi Katekizmi Özeti$($Apos)nin tam çevirisi ve Katolik inancı üzerine sıkça sorulan sorular." `
      -Path '' -Body $body -JsonLd @($ld)
  }
}
Home-Page 'tr'
Home-Page 'en'

# ================================================================== sitemap.xml & robots.txt
$pages = @(
  @{ p = ''; pr = '1.0' }, @{ p = 'katesizm.html'; pr = '0.9' },
  @{ p = 'iman-ikrari.html'; pr = '0.9' }, @{ p = 'kutsal-sirlar.html'; pr = '0.9' },
  @{ p = 'mesihte-yasam.html'; pr = '0.9' }, @{ p = 'hristiyan-duasi.html'; pr = '0.9' }, @{ p = 'ekler.html'; pr = '0.8' },
  @{ p = 'kutsal-kitap.html'; pr = '0.9' }, @{ p = 'tesbih-duasi.html'; pr = '0.9' }, @{ p = 'katolik-sureci.html'; pr = '0.9' },
  @{ p = 'gunah-cikarma.html'; pr = '0.9' }, @{ p = 'topraklarimizda-hristiyanlik.html'; pr = '0.9' },
  @{ p = 'neden-katoligiz.html'; pr = '0.9' },
  @{ p = 'azizler.html'; pr = '0.9' }, @{ p = 'kutsal-ayin.html'; pr = '0.9' },
  @{ p = 'sss.html'; pr = '0.9' }, @{ p = 'kiliseler.html'; pr = '0.7' }, @{ p = 'motu-proprio.html'; pr = '0.6' },
  @{ p = 'giris.html'; pr = '0.6' }, @{ p = 'mucizeler.html'; pr = '0.7' },
  @{ p = 'iletisim.html'; pr = '0.4' }, @{ p = 'meseller.html'; pr = '0.9' }, @{ p = 'erisilebilirlik.html'; pr = '0.3' },
  @{ p = 'gizlilik.html'; pr = '0.3' },
  @{ p = 'en/'; pr = '0.9' }, @{ p = 'en/compendium.html'; pr = '0.8' },
  @{ p = 'en/profession-of-faith.html'; pr = '0.8' }, @{ p = 'en/celebration-of-christian-mystery.html'; pr = '0.8' },
  @{ p = 'en/life-in-christ.html'; pr = '0.8' }, @{ p = 'en/christian-prayer.html'; pr = '0.8' },
  @{ p = 'en/motu-proprio.html'; pr = '0.5' }, @{ p = 'en/introduction.html'; pr = '0.5' }, @{ p = 'en/appendix.html'; pr = '0.7' },
  @{ p = 'en/faq.html'; pr = '0.8' }, @{ p = 'en/becoming-catholic.html'; pr = '0.8' }, @{ p = 'en/confession.html'; pr = '0.8' },
  @{ p = 'en/saints.html'; pr = '0.9' }, @{ p = 'en/find-a-church.html'; pr = '0.6' },
  @{ p = 'en/why-were-catholic.html'; pr = '0.8' }, @{ p = 'en/rosary.html'; pr = '0.8' },
  @{ p = 'en/bible.html'; pr = '0.8' }, @{ p = 'en/miracles.html'; pr = '0.6' },
  @{ p = 'en/anatolia.html'; pr = '0.8' }, @{ p = 'en/contact.html'; pr = '0.4' },
  @{ p = 'en/accessibility.html'; pr = '0.3' }, @{ p = 'en/privacy.html'; pr = '0.3' },
  @{ p = 'en/mass.html'; pr = '0.9' }, @{ p = 'en/parables.html'; pr = '0.9' }
) + ($GreatSaints.saints | ForEach-Object { @{ p = "$($_.id).html"; pr = '0.6' } }) `
  + ($GreatSaints.saints | ForEach-Object { @{ p = $EnAltMap["$($_.id).html"]; pr = '0.6' } })
# Each TR/EN pair also lists both language versions (the same pairs as the pages' hreflang tags),
# so search engines tie the two together even before crawling either page's <head>.
function Sitemap-Key([string]$p) { if ($p -eq '') { 'index.html' } elseif ($p -eq 'en/') { 'en/index.html' } else { $p } }
$sm = '<?xml version="1.0" encoding="UTF-8"?>' + "`n" + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' + "`n" +
  (($pages | ForEach-Object {
    $k = Sitemap-Key $_.p; $alt = $EnAltMap[$k]; $links = ''
    if ($alt) {
      $trP = if ($k.StartsWith('en/')) { Page-Path $alt } else { $_.p }
      $enP = if ($k.StartsWith('en/')) { $_.p } else { Page-Path $alt }
      $links = "<xhtml:link rel=`"alternate`" hreflang=`"tr`" href=`"$SiteUrl/$trP`"/><xhtml:link rel=`"alternate`" hreflang=`"en`" href=`"$SiteUrl/$enP`"/><xhtml:link rel=`"alternate`" hreflang=`"x-default`" href=`"$SiteUrl/$trP`"/>"
    }
    "  <url><loc>$SiteUrl/$($_.p)</loc>$links<lastmod>$BuildDate</lastmod><changefreq>monthly</changefreq><priority>$($_.pr)</priority></url>"
  }) -join "`n") +
  "`n</urlset>`n"
[IO.File]::WriteAllText((Join-Path $Root 'sitemap.xml'), $sm, $Utf8)
# Dedicated AI-training crawlers (not the same user agent as that company's regular search
# crawler, e.g. Google-Extended vs Googlebot) are blocked by request; ordinary search engines
# are untouched by the User-agent: * block above them.
$AiCrawlers = @(
  'GPTBot', 'ChatGPT-User', 'Google-Extended', 'CCBot', 'anthropic-ai', 'ClaudeBot', 'Claude-Web',
  'Bytespider', 'Meta-ExternalAgent', 'Meta-ExternalFetcher', 'FacebookBot', 'Applebot-Extended',
  'Diffbot', 'PerplexityBot', 'cohere-ai', 'cohere-training-data-crawler', 'Omgilibot', 'Omgili',
  'Amazonbot', 'Timpibot', 'ImagesiftBot', 'Youbot', 'Kangaroo Bot', 'Panscient'
)
$aiBlock = ($AiCrawlers | ForEach-Object { "User-agent: $_`nDisallow: /`n" }) -join "`n"
[IO.File]::WriteAllText((Join-Path $Root 'robots.txt'), "User-agent: *`nAllow: /`nDisallow: /tools/`n`n# AI-training crawlers (search engines above are unaffected)`n$aiBlock`nSitemap: $SiteUrl/sitemap.xml`n", $Utf8)

# security.txt (RFC 9116): how to report a vulnerability, without publicly guessing at one.
# Expires a year out from each build, so the file never goes silently stale.
$wellKnownDir = Join-Path $Root '.well-known'
if (-not (Test-Path $wellKnownDir)) { New-Item -ItemType Directory -Path $wellKnownDir | Out-Null }
$secExpires = (Get-Date).AddYears(1).ToString('yyyy-MM-ddT00:00:00.000Z')
$secTxt = "Contact: mailto:david@katolikdunyasi.com`nExpires: $secExpires`nPreferred-Languages: tr, en`nCanonical: $SiteUrl/.well-known/security.txt`n"
[IO.File]::WriteAllText((Join-Path $wellKnownDir 'security.txt'), $secTxt, $Utf8)
Write-Host "  + sitemap.xml, robots.txt, .well-known/security.txt"
Write-Host "Done."
