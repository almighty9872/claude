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
$MonthNamesEn = @('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')
$BuildDateTr = "$((Get-Date).Day) $($MonthNamesTr[(Get-Date).Month - 1]) $((Get-Date).Year)"
$BuildDateEn = (Get-Date).ToString('d MMMM yyyy', [Globalization.CultureInfo]::GetCultureInfo('en-US'))
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
$SiteTagEn = 'Turkish Catholic Portal'
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
function TO([string]$html) { if (-not $html) { return '' }; return "<div class=`"l-tr`">$html</div>" }
function TA([string]$name, [string]$tr, [string]$en) {
  $a = "$name=`"$(Attr $tr)`""
  if ($en -and $en -cne $tr) { $a += " data-en-$name=`"$(Attr $en)`"" }
  return $a
}
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
    if ($part -match '^\s*CIC') { $part; continue }
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
      elseif ($p -match '^<(script|style|textarea|title)[\s>]') { $skip++ } elseif ($p -match '^</(script|style|textarea|title)>') { $skip = [Math]::Max(0, $skip - 1) }
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
  @{ href = 'topraklarimizda-hristiyanlik.html'; t = 'Topraklarımızda Hristiyanlık'; s = "Pavlus$($Apos)tan İznik$($Apos)e"; te = 'Christianity in Anatolia'; se = 'From Paul to Nicaea' }
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
  'islama-cevap.html'    = $IcoAnswer
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
    @{ href = 'katekizm.html'; t = 'Katekizm'; s = '598 soru ve yanıt'; te = 'Catechism'; se = '598 questions and answers'; fold = $TextNav },
    @{ href = 'kutsal-kitap.html'; t = 'Kutsal Kitap'; s = 'Onaylı çeviriler'; te = 'The Bible'; se = 'Approved translations' },
    @{ href = 'sss.html'; t = 'Sorular'; s = 'Sıkça sorulan sorular'; te = 'FAQ'; se = 'Frequently asked questions' },
    @{ href = 'katolik-sureci.html'; t = 'Katolik Olma Süreci'; s = 'OCIA, adım adım'; te = 'Becoming Catholic'; se = 'OCIA, step by step' },
    @{ href = 'meseller.html'; t = "İsa$($Apos)nın Meselleri"; s = 'Otuz iki mesel'; te = 'The Parables of Jesus'; se = 'Thirty-two parables' }) },
  @{ label = 'Tartış'; labelEn = 'Debate'; items = @(
    @{ href = 'islama-cevap.html'; t = "İslam$($Apos)a Cevap"; s = 'İslam, kendi kaynaklarıyla'; te = 'Answering Islam'; se = 'Islam, by its own sources' }) },
  @{ label = 'Dua Et'; labelEn = 'Pray'; items = @(
    @{ href = 'kutsal-ayin.html'; t = 'Kutsal Ayin'; s = 'Ayinin sırası'; te = 'The Mass'; se = 'The order of Mass' },
    @{ href = 'tesbih-duasi.html'; t = 'Tesbih Duası'; s = 'Dualar ve gizemler'; te = 'The Rosary'; se = 'Prayers and mysteries' },
    @{ href = 'ekler.html'; t = 'Sık Kullanılan Dualar'; s = 'Günlük dualar ve formüller'; te = 'Common Prayers'; se = 'Daily prayers and formulas' },
    @{ href = 'gunah-cikarma.html'; t = 'Günah Çıkarma'; s = 'Nasıl işler, adım adım'; te = 'Confession'; se = 'How it works, step by step' }) },
  @{ label = 'Keşfet'; labelEn = 'Explore'; items = @(
    @{ href = 'azizler.html'; t = 'Azizler'; s = 'Yılın her günü için bir aziz'; te = 'Saints'; se = 'A saint for every day of the year' },
    @{ href = 'mucizeler.html'; t = 'Mucizeler'; s = 'Görünmeler, kalıntılar, mucizeler'; te = 'Miracles'; se = 'Apparitions, relics, miracles' },
    @{ href = 'topraklarimizda-hristiyanlik.html'; t = 'Topraklarımızda Hristiyanlık'; s = "Pavlus$($Apos)tan İznik$($Apos)e"; te = 'Christianity in Anatolia'; se = 'From Paul to Nicaea' },
    @{ href = 'kiliseler.html'; t = 'Kilise Bul'; s = "Türkiye$($Apos)de kiliseler"; te = 'Find a Church'; se = 'Churches in Turkey' }) },
  @{ label = 'Site'; labelEn = 'Site'; items = @(
    @{ href = 'iletisim.html'; t = 'İletişim'; s = 'Bize ulaşın'; te = 'Contact'; se = 'Get in touch' },
    @{ href = 'erisilebilirlik.html'; t = 'Erişilebilirlik'; s = 'Herkes için okunur bir site'; te = 'Accessibility'; se = 'A site everyone can read'; ico = $IcoA11yPerson },
    @{ href = 'gizlilik.html'; t = 'Gizlilik Politikası'; s = 'Kişisel veri toplanmaz'; te = 'Privacy Policy'; se = 'No personal data collected'; ico = $IcoShield }) }
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
foreach ($f in @('kutsal-ayin.html', 'tesbih-duasi.html', 'ekler.html', 'gunah-cikarma.html')) { $AppOf[$f] = 'dua' }
$AppOf['islama-cevap.html'] = 'tartis'
foreach ($f in @('azizler.html', 'mucizeler.html', 'topraklarimizda-hristiyanlik.html', 'kiliseler.html')) { $AppOf[$f] = 'kesfet' }
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
$LangPillHtml = '<div class="lang-pill" role="group" aria-label="Dil / Language"><span class="lp-knob" aria-hidden="true"></span>' +
  '<button type="button" class="lp-btn" data-set-lang="tr" lang="tr" aria-pressed="true" title="Türkçe">TR</button>' +
  '<button type="button" class="lp-btn" data-set-lang="en" lang="en" aria-pressed="false" title="English">EN</button></div>'
function Search-Form([string]$cls, [string]$id, [string]$placeholder, [string]$lang = 'tr', [string]$placeholderEn = 'Search the Catechism: English, Turkish or a question number') {
  $action = if ($lang -eq 'en') { 'en/compendium.html' } else { 'katekizm.html' }
  $label = T "Katekizm$($Apos)de ara (Türkçe veya İngilizce, ya da soru numarası)" 'Search the Catechism (English or Turkish, or a question number)'
  return "<form class=`"search $cls`" role=`"search`" data-search action=`"$action`"><div class=`"search-field`">$IcoSearch" +
    "<label class=`"visually-hidden`" for=`"$id`">$label</label>" +
    "<input id=`"$id`" type=`"search`" name=`"q`" $(TA 'placeholder' $placeholder $placeholderEn) autocomplete=`"off`" enterkeyhint=`"search`"></div>" +
    "<div class=`"search-results`" hidden></div></form>"
}
function Cur([string]$href, [string]$current) { if ($href -eq $current) { return ' aria-current="page"' }; return '' }
function Header-Html([string]$current) {
  $coreMenu = ($CoreNav | ForEach-Object {
    $cls = if ($_.href -eq 'katekizm.html' -and $KatekizmPages -contains $current) { 'nav-link is-section' } else { 'nav-link' }
    "<li><a class=`"$cls`" href=`"$($_.href)`"$(Cur $_.href $current)>$(T $_.t $_.te)</a></li>"
  }) -join ''
  return @"
$Sprite
<a class="skip-link" href="#main">$(T 'İçeriğe geç' 'Skip to content')</a>
<header class="site-header">
  <div class="wrap">
    <div class="header-row">
      <div class="brand-group">
        <a class="brand" href="index.html"$(Cur 'index.html' $current)>$Logo<span class="brand-name">$SiteName</span></a>
        <button type="button" class="settings-btn" $(TA 'aria-label' 'Ayarlar: erişilebilirlik' 'Settings: accessibility') aria-haspopup="dialog" aria-expanded="false" aria-controls="settings-panel">$IcoGear</button>
      </div>
      <nav class="mainnav" $(TA 'aria-label' 'Ana menü' 'Main menu')>
        <ul>$coreMenu</ul>
      </nav>
      <button type="button" class="icon-btn menu-toggle" $(TA 'aria-label' 'Menü' 'Menu') aria-expanded="false" aria-controls="navsheet" $(TA 'data-tooltip' 'Tüm Menü' 'Full Menu')>$IcoMenuToggle</button>
      <div class="header-tools">
        <button type="button" class="theme-toggle" role="switch" aria-checked="false" aria-label="Koyu temaya geç">$IcoSun$IcoMoon<span class="knob" aria-hidden="true"></span></button>
      </div>
    </div>
  </div>
</header>
<div class="navsheet" id="navsheet" hidden>
  <div class="navsheet-panel glass" role="dialog" aria-modal="true" $(TA 'aria-label' 'Menü' 'Menu')>
    <div class="ns-head">
      <p class="ns-date"><span data-ns-date></span> <time class="ns-time" data-ns-time>--:--:--</time></p>
      <div class="today-pills ns-today">
        <div class="today-pill"><span class="tp-ico"><span class="lit-dot" data-ns-season-dot></span></span><span><span class="tp-label">$(T 'Litürjik Dönem' 'Liturgical Season')</span><span class="tp-value hint" data-ns-season>$(T 'Yükleniyor…' 'Loading…')</span></span></div>
        <a class="today-pill" href="tesbih-duasi.html"><span class="tp-ico">$IcoBeads</span><span><span class="tp-label">$(T 'Günün Gizemi' "Today's Mystery")</span><span class="tp-value hint" data-ns-mystery>$(T 'Yükleniyor…' 'Loading…')</span></span></a>
        <a class="today-pill" href="azizler.html"><span class="tp-ico">$IcoStar</span><span><span class="tp-label">$(T 'Bugünün Azizi' "Today's Saint")</span><span class="tp-value hint" data-ns-saint>$(T 'Yükleniyor…' 'Loading…')</span></span></a>
      </div>
    </div>
    <nav class="ns-nav" $(TA 'aria-label' 'Menü' 'Menu')>
$(Nav-Sheet 'tr' $current)
    </nav>
  </div>
</div>
"@
}
$footKatekizm = (@(@{ href = 'katekizm.html'; t = 'Katekizm'; te = 'Catechism' }) + $TextNav) | ForEach-Object { "<li><a href=`"$($_.href)`">$(T $_.t $_.te)</a></li>" }
$footKaynaklar = $KaynaklarNav | ForEach-Object { "<li><a href=`"$($_.href)`">$(T $_.t $_.te)</a></li>" }
$footDualar = $PrayerNav | ForEach-Object { "<li><a href=`"$($_.href)`">$(T $_.t $_.te)</a></li>" }
# İletişim, Erişilebilirlik and Gizlilik also open over the page from the footer, like
# "Kaynaklar ve telif" (their own pages stay, for search engines and links from elsewhere)
function Foot-Dialog([string]$id, [string]$title, [string]$inner) {
  return "<dialog class=`"sources-dialog`" id=`"$id`" aria-labelledby=`"$id-t`"><button type=`"button`" class=`"sources-close`" $(TA 'aria-label' 'Kapat' 'Close')>$IcoClose</button>" +
    "<h2 class=`"sources-title`" id=`"$id-t`">$title</h2><div class=`"info-inner`">$inner</div></dialog>"
}
$FootContactHtml = (TB "<p>Bir çeviride hata fark ettiyseniz, eklenmesini istediğiniz bir konu, aziz ya da mucize varsa ya da sadece merhaba demek istiyorsanız, aşağıdaki e-posta adresinden bize yazabilirsiniz.</p>" "<p>If you've spotted a mistake in a translation, there's a topic, saint or miracle you'd like to see added, or you'd simply like to say hello, you can get in touch at the email address below.</p>") +
  "<p class=`"contact-email`"><a class=`"btn`" href=`"mailto:david@katolikdunyasi.com`">david@katolikdunyasi.com</a></p>" +
  (TB "<p>Gelen her mesajı bizzat okuyorum. Yoğunluğa bağlı olarak yanıt vermem biraz zaman alabilir; fakat paylaştığınız tüm geri bildirimler için şimdiden içtenlikle teşekkür ederim.</p>" "<p>I read every message myself. Depending on how busy things are, a reply may take a little while, but thank you in advance, sincerely, for any feedback you share.</p>")
$FooterHtml = @"
<footer class="site-footer">
  <div class="wrap foot-grid">
    <div class="foot-about">
      <p class="foot-brand">$Logo<span>$SiteName</span></p>
      <p class="foot-tag">$(T $SiteTag $SiteTagEn)</p>
      <p class="foot-desc">$(T $fm['about'] $fmEn['about'])</p>
      <p class="foot-copy">$(T "Türkçe çeviriler ve özgün içerik © 2026 $SiteName" "Translations and original content © 2026 $SiteName")</p>
      <p class="foot-copy foot-src"><button type="button" class="foot-sources" aria-haspopup="dialog" aria-controls="sources-dialog">$(T $fm['title'] $fmEn['title'])</button><a class="foot-contact" href="iletisim.html" data-dialog="dlg-iletisim">$(T 'İletişim' 'Contact')</a><a class="foot-contact foot-extra" href="erisilebilirlik.html" data-dialog="dlg-erisilebilirlik">$(T 'Erişilebilirlik' 'Accessibility')</a><a class="foot-contact foot-extra" href="gizlilik.html" data-dialog="dlg-gizlilik">$(T 'Gizlilik' 'Privacy')</a></p>
      <p class="foot-copy"><a href="mailto:david@katolikdunyasi.com">david@katolikdunyasi.com</a></p>
    </div>
    <nav class="foot-sitemap" $(TA 'aria-label' 'Site haritası' 'Sitemap')>
      <div class="foot-col"><p class="foot-label">$(T 'Katekizm' 'Catechism')</p><ul>$($footKatekizm -join '')</ul></div>
      <div class="foot-col"><p class="foot-label">$(T 'Kaynaklar' 'Resources')</p><ul>$($footKaynaklar -join '')</ul></div>
      <div class="foot-col"><p class="foot-label">$(T 'Dualar' 'Prayers')</p><ul>$($footDualar -join '')</ul></div>
      <div class="foot-col"><p class="foot-label">$(T 'Diğer' 'Other')</p><ul><li><a href="neden-katoligiz.html">$(T 'Neden Katoliğiz?' "Why We're Catholic")</a></li><li><a href="islama-cevap.html">$(T "İslam$($Apos)a Cevap" 'Answering Islam')</a></li><li><a href="mucizeler.html">$(T 'Mucizeler' 'Miracles')</a></li><li><a href="azizler.html">$(T 'Azizler' 'Saints')</a></li><li><a href="sss.html">$(T 'Sorular' 'FAQ')</a></li><li><a href="iletisim.html">$(T 'İletişim' 'Contact')</a></li><li><a href="erisilebilirlik.html">$(T 'Erişilebilirlik' 'Accessibility')</a></li><li><a href="gizlilik.html">$(T 'Gizlilik Politikası' 'Privacy Policy')</a></li></ul></div>
    </nav>
  </div>
</footer>
$(Foot-Dialog 'dlg-iletisim' (T 'İletişim' 'Contact') $FootContactHtml)
$(Foot-Dialog 'dlg-erisilebilirlik' (T $ErMeta.title $ErEn.meta.title) (TB (Convert-Markdown $Er.body) (Convert-Markdown $ErEn.body)))
$(Foot-Dialog 'dlg-gizlilik' (T $GzMeta.title $GzEn.meta.title) (TB (Convert-Markdown $Gz.body) (Convert-Markdown $GzEn.body)))
<dialog class="sources-dialog" id="sources-dialog" aria-labelledby="sources-title">
  <button type="button" class="sources-close" $(TA 'aria-label' 'Kapat' 'Close')>$IcoClose</button>
  <h2 class="sources-title" id="sources-title">$(T $fm['title'] $fmEn['title'])</h2>
  <div class="info-inner">$(TB $InfoHtml $InfoHtmlEn)</div>
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
        [string]$Lang = 'tr', [string]$TitleEn = '')
  $Body = Link-Refs $Body
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
  # The text is set in the device's own San Francisco or Inter (loaded only where needed): nothing to preload
  $fontFiles = @()
  $preload = ($fontFiles | Where-Object { Test-Path (Join-Path $Root "assets/fonts/$_") } | ForEach-Object {
    "<link rel=`"preload`" href=`"assets/fonts/$_`" as=`"font`" type=`"font/woff2`" crossorigin>"
  }) -join "`n"
  # /en/ pages need root-relative asset/internal links too, same mechanism as 404.html.
  $rootRelativeEffective = $RootRelative
  $rootAttr = if ($rootRelativeEffective) { ' data-root="/"' } else { '' }
  $ogLocale = 'tr_TR'
  $headerHtml = Header-Html $File
  $footerHtml = $FooterHtml
  # The home screen app a page belongs to (Öğren, Dua Et, Keşfet), for its colour on phones
  $trOf = $File
  $appAttr = if ($AppOf -and $AppOf[$trOf]) { " data-app=`"$($AppOf[$trOf])`"" } else { '' }
  # Every page but the home screen becomes an app screen on phones (see Av-Nav); the class is set
  # before the first paint so the page doesn't jump
  $isHome = $File -match '(^|/)index\.html$'
  $avJs = if ($isHome) { '' } else { "if(window.matchMedia&&matchMedia('(max-width: 979px)').matches)document.documentElement.classList.add('av');" }
  $avNav = if ($isHome) { '' } else { Av-Nav $File $false }
  # The home screen's icons live on the home screen only; elsewhere the X beside the gear leads there
  $avDock = ''
  $appAttr += if ($isHome) { '' } else { " data-avp=`"$(if ($trOf) { $trOf } else { $File })`"" }
  $a11yHtml = $A11yWidgetHtml
  $html = @"
<!DOCTYPE html>
<html lang="$Lang"$rootAttr>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>$(Attr $Title)</title>
$(if ($TitleEn) { "<meta name=`"kd-title-en`" content=`"$(Attr $TitleEn)`">" })
<meta name="description" content="$(Attr $Description)">
<meta name="robots" content="$Robots">
$canon
<meta name="theme-color" content="#16161a">
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
<script>document.documentElement.classList.add('js');$($avJs)(function(H){var L=null,T=null,d=new Date();try{L=localStorage.getItem('kd-lang-choice');if(!L&&localStorage.getItem('kd-lang')==='en')L='en'}catch(e){}if(!L){var tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){}var nl=((navigator.languages&&navigator.languages[0])||navigator.language||'').toLowerCase();L=(/bot|crawl|spider|slurp|lighthouse|headless|inspection/i.test(navigator.userAgent||'')||/Istanbul$/.test(tz)||nl.slice(0,2)==='tr')?'tr':'en'}if(L==='en'){H.classList.add('lang-en');H.lang='en'}try{var c=JSON.parse(localStorage.getItem('kd-theme-choice')||'null');if(c&&c.until>d.getTime())T=c.t}catch(e){}if(!T){var u=null;try{u=JSON.parse(localStorage.getItem('kd-sun')||'null')}catch(e){}var m=d.getHours()*60+d.getMinutes();T=m>=(u?u.r:420)&&m<(u?u.s:1140)?'light':'dark'}H.setAttribute('data-theme',T);if(T==='light'){var tc=document.querySelector('meta[name=theme-color]');if(tc)tc.setAttribute('content','#f7f2e8')}})(document.documentElement);try{var fs=localStorage.getItem('kkio-fontsize');if(fs==='1'||fs==='2')document.documentElement.setAttribute('data-fontsize',fs);var a11y=JSON.parse(localStorage.getItem('kkio-a11y')||'{}');['contrast','saturation','spacing','links','dyslexia','cursor'].forEach(function(k){if(a11y[k])document.documentElement.setAttribute('data-a11y-'+k,'1')})}catch(e){}</script>
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
$avDock
$LangPillHtml
$a11yHtml
</body>
</html>
"@
  # 404.html and /en/ pages are not at a fixed directory depth (or are one level deep), so their
  # links must start at the site root rather than being relative to the file's own location.
  if ($rootRelativeEffective) { $html = [regex]::Replace($html, '(href|src)="(?!https?:|#|/|data:|mailto:|tel:)', '$1="/') }
  # The contact address is public on every page (footer) and a few others (İletişim, the About
  # panel, Erişilebilirlik, Gizlilik); catching it here once, after every page is assembled,
  # keeps it out of the raw HTML for basic scrapers without touching the markdown/build source
  # that writes it in plainly. JS reassembles the real mailto link on page load (see initEmail).
  $script:EmailFallback = '(e-posta için JavaScript gerekli)'
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
    <span class="roman" aria-hidden="true">$($meta.roman)</span>
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
  $partFaqLd = '{"@context":"https://schema.org","@type":"FAQPage","inLanguage":"tr","name":' + (JStr "$($p.tr) - $SiteName") +
    ',"url":' + (JStr "$SiteUrl/$($meta.file)") + ',"mainEntity":[' + (($qas | ForEach-Object {
      '{"@type":"Question","name":' + (JStr "$($_.n). $(Plain $_.tr.q)") + ',"url":' + (JStr "$SiteUrl/$($meta.file)#soru-$($_.n)") +
      ',"acceptedAnswer":{"@type":"Answer","text":' + (JStr (Plain (($_.tr.a -split "`n") -join ' '))) + '}}'
    }) -join ',') + ']}'
  Write-Page -File $meta.file -Title "$($meta.ord): $($p.tr) (Sorular $($p.from)–$($p.to)) | $SiteName" -TitleEn "$($meta.ordEn): $($p.en) (Questions $($p.from)–$($p.to)) | $SiteName" -Description $meta.desc `
    -Path $meta.file -Body $body -JsonLd @($partFaqLd, (Breadcrumb-Ld $p.tr $meta.file 'Katekizm' 'katekizm.html')) -OgType 'article'
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
  -Description "Katolik Kilisesi Katekizmi Özeti$($Apos)nin (Compendium) Türkçe çevirisi: iman, kutsal sırlar, Hristiyan ahlakı ve dua üzerine 598 soru ve yanıt, İngilizce aslıyla." `
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
function Article-Page([string]$file, [string]$crumb, [string]$label, [string]$h1, [string]$sub, [string]$bodyHtml, [string]$desc, [string]$ld, [string]$titleOverride = '', [string]$labelEn = '', [string]$titleEn = '') {
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
  Write-Page -File $file -Title "$pageTitle | $SiteName" -TitleEn "$(if ($titleEn) { $titleEn } else { $sub }) | $SiteName" -Description $desc -Path $file -Body $body -JsonLd @($ld, (Breadcrumb-Ld $crumb $file 'Katekizm' 'katekizm.html')) -OgType 'article'
}
$mp = $X.motuProprio
$mpBody = (TB "<p class=`"address`">$($mp.tr.address)</p>" "<p class=`"address`">$($mp.en.address)</p>") +
  (Parallel-Paragraphs $mp.tr.paragraphs $mp.en.paragraphs) +
  "<div class=`"signature`">$(TB ((($mp.tr.closing | ForEach-Object { "<p>$(Inline $_)</p>" }) -join '')) ((($mp.en.closing | ForEach-Object { "<p>$_</p>" }) -join '')))</div>"
$mpLd = '{"@context":"https://schema.org","@type":"Article","headline":' + (JStr "Motu Proprio: $($mp.tr.title)") + ',"inLanguage":"tr","datePublished":"2005-06-28","author":{"@type":"Person","name":"Papa XVI. Benediktus"},"publisher":{"@type":"Organization","name":"Libreria Editrice Vaticana"},"mainEntityOfPage":' + (JStr "$SiteUrl/motu-proprio.html") + '}'
Article-Page 'motu-proprio.html' 'Motu Proprio' 'Motu Proprio' "Katolik Kilisesi Katekizmi Özeti$($Apos)nin Onaylanması ve Yayımlanması İçin Motu Proprio" `
  'Motu Proprio for the approval and publication of the Compendium of the Catechism of the Catholic Church' $mpBody `
  (Meta-Trim "Papa XVI. Benediktus$($Apos)un 28 Haziran 2005 tarihli Motu Proprio$($Apos)su: Katolik Kilisesi Katekizmi Özeti$($Apos)nin onaylanması ve yayımlanması. Türkçe çeviri ve İngilizce asıl metin.") $mpLd `
  "Motu Proprio: Katekizm Özeti$($Apos)nin Onaylanması" 'Motu Proprio' 'Motu Proprio: Approval of the Compendium'

$in = $X.introduction
$inBody = (Parallel-Paragraphs $in.tr.paragraphs $in.en.paragraphs) +
  "<div class=`"signature`">$(TB ((($in.tr.closing | ForEach-Object { "<p>$_</p>" }) -join '')) ((($in.en.closing | ForEach-Object { "<p>$_</p>" }) -join '')))</div>" +
  "<div class=`"footnotes`">$(Parallel-Paragraphs $in.tr.footnotes $in.en.footnotes)</div>"
$inLd = '{"@context":"https://schema.org","@type":"Article","headline":"Giriş","inLanguage":"tr","datePublished":"2005-03-20","author":{"@type":"Person","name":"Kardinal Joseph Ratzinger"},"mainEntityOfPage":' + (JStr "$SiteUrl/giris.html") + '}'
Article-Page 'giris.html' 'Giriş' 'Önsöz' 'Giriş' 'Introduction' $inBody `
  (Meta-Trim "Katolik Kilisesi Katekizmi Özeti$($Apos)nin Girişi (Kardinal Joseph Ratzinger, 2005): Özet$($Apos)in hazırlanışı, üç temel özelliği ve dört kısmı. Türkçe çeviri ve İngilizce asıl metin.") $inLd '' 'Preface'

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
  $(Crumbs 'Ekler' 'Katekizm' 'katekizm.html')
  <header class="page-head center"><p class="label">$(T 'Ekler' 'Appendix')</p><h1>$(T 'Ekler' 'Appendix')</h1>$(TO '<p class="sub" lang="en">Appendix</p>')</header>
  <h2 class="section-title" id="ek-a"><span class="label">A</span>$(T 'Sık Kullanılan Dualar' 'Common Prayers')</h2>
  <div class="text-grid two">
$prayers
  </div>
  <h2 class="section-title" id="ek-b"><span class="label">B</span>$(T 'Katolik Öğretinin Formülleri' 'Formulas of Catholic Doctrine')</h2>
  <div class="text-grid two">
$formulas
  </div>
</div>
"@
Write-Page -File 'ekler.html' -Title "Ekler: Dualar ve Katolik Öğreti Formülleri | $SiteName" -TitleEn "Appendix: Prayers and Formulas of Catholic Doctrine | $SiteName" `
  -Description "Katolik Kilisesi Katekizmi Özeti Ekleri: Türkçe, İngilizce ve Latince sık kullanılan dualar ve Katolik öğretinin formülleri." `
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
  "<section class=`"faq-cat`" id=`"$($cat.id)`">" +
    "<h2 class=`"section-title`"><span class=`"label`">$($script:FaqN)</span>$(T (Inline $cat.title) $cat.en)</h2>" +
    (TO "<p class=`"faq-cat-en`" lang=`"en`">$($cat.en)</p>") +
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
  <header class="page-head center">$(Page-Ico $IcoQuestion)<h1>$(T (Inline $FaqData.title) $FaqData.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($FaqData.en)</p>")</header>
  <nav class="faq-toc is-sticky" $(TA 'aria-label' 'Kategoriler' 'Categories')><ul>$faqToc</ul></nav>
$faqCats
</div>
"@
Write-Page -File 'sss.html' -Title "$($FaqData.title) | $SiteName" -TitleEn "$($FaqData.en) | $SiteName" `
  -Description "Katolik Kilisesi hakkında sık sorulan sorular ve Katekizm$($Apos)e dayanan yanıtlar: Meryem ve azizlere saygı, Kutsal Üçlü, günah çıkarma, papalık, araf, evrim." `
  -Path 'sss.html' -Body $sssBody -JsonLd @($faqLd, (Breadcrumb-Ld 'Sıkça Sorulan Sorular' 'sss.html'))

# ================================================================== KUTSAL KITAP (kutsal-kitap.html)
# Three quick answers first (what to read in Turkish, what in English, how to spot a Catholic
# edition); the guide's sections follow folded away, each opening in place. The closing source
# note stays outside the folds.
function Kk-Fold([string]$html) {
  $tail = ''
  $i = $html.IndexOf('<blockquote')
  if ($i -ge 0) { $tail = $html.Substring($i); $html = $html.Substring(0, $i) }
  $parts = [regex]::Split($html, '(?=<h2 id=")')
  $out = ($parts | Where-Object { $_.Trim() } | ForEach-Object {
    $m = [regex]::Match($_, '^<h2 id="([^"]+)">(.*?)</h2>(.*)$', 'Singleline')
    if (-not $m.Success) { return $_ }
    "<details class=`"kk-sec`" id=`"$($m.Groups[1].Value)`"><summary><h2>$($m.Groups[2].Value)</h2>$IcoChevLg</summary><div class=`"kk-sec-body`">$($m.Groups[3].Value)</div></details>"
  }) -join "`n"
  return "<div class=`"kk-secs`">$out</div><div class=`"kk-note`">$tail</div>"
}
$kkRead = 'https://www.bible.com/tr/versions/2308-kkdeu-kutsal-kitap-ve-deuterokanonik-kitaplar'
$kkQuick = @(
  @((T 'Türkçe okumak için' 'To read in Turkish'), (T 'Kutsal Kitap ve Deuterokanonik Kitaplar (2003)' 'Kutsal Kitap ve Deuterokanonik Kitaplar (2003)'),
    (T '73 kitabın tamamı, kolay okunur bir dille.' 'All 73 books, in easy modern Turkish.'),
    "<a href=`"$kkRead`" target=`"_blank`" rel=`"noopener`">$(T 'Ücretsiz oku' 'Read it free') $IcoExternal</a>"),
  @((T 'İngilizce için' 'In English'), 'RSV-CE (The Ignatius Bible)',
    (T 'Özgün metne yakın ama okunur; genel kullanım için en iyi seçim.' 'Close to the original yet readable; the best choice for general use.'), ''),
  @((T 'Satın alırken' 'When buying one'), (T '73 kitap ve Imprimatur' '73 books and an Imprimatur'),
    (T 'Katolik baskıda 73 kitap vardır; iç kapakta Nihil obstat ve Imprimatur yazar.' 'A Catholic edition has 73 books, with Nihil obstat and Imprimatur inside the cover.'), '')
)
$kkQuickHtml = ($kkQuick | ForEach-Object {
  $act = if ($_[3]) { '<p class="kk-q-a">' + $_[3] + '</p>' } else { '' }
  '<div class="kk-q"><p class="kk-q-k">' + $_[0] + '</p><p class="kk-q-t">' + $_[1] + '</p><p class="kk-q-s">' + $_[2] + '</p>' + $act + '</div>'
}) -join ''
$kkBody = @"
<div class="wrap narrow">
  $(Crumbs 'Kutsal Kitap')
  <header class="page-head center">$(Page-Ico $IcoBible)<h1>$(T $KkMeta.title $KkEn.meta.title)</h1><p class="sub">$(T $KkMeta.subtitle $KkEn.meta.subtitle)</p></header>
  <section class="kk-quick" aria-labelledby="kk-quick-h"><h2 class="visually-hidden" id="kk-quick-h">$(T 'Kısaca' 'In short')</h2>$kkQuickHtml</section>
  <p class="kk-motto">$(T 'En iyi çeviri, okuyacağınız çeviridir.' 'The best translation is the one you will read.')</p>
  <div class="body prose kk-body">$(TB (Kk-Fold (Convert-Markdown $Kk.body)) (Kk-Fold (Convert-Markdown $KkEn.body)))</div>
</div>
"@
Write-Page -File 'kutsal-kitap.html' -Title "$($KkMeta.title) | $SiteName" -TitleEn "$($KkEn.meta.title) | $SiteName" -Description $KkMeta.description `
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
<div class="wrap narrow sureci-wrap" data-av-nogh>
  $(Crumbs 'Katolik Olma Süreci')
  <header class="page-head center">$(Page-Ico $IcoDoor)<h1>$(T $Sureci.title $Sureci.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($Sureci.en)</p>")</header>
  <p class="why-intro">$(T (Inline $Sureci.intro) (Inline $Sureci.introEn))</p>
  <nav class="why-doors two" $(TA 'aria-label' 'Hangi yol sizin için?' 'Which path is yours?')>$sureciDoors</nav>
  <p class="sureci-first">$(T (Inline $Sureci.firstStep) (Inline $Sureci.firstStepEn)) <a href="kiliseler.html">$IcoPin $(T 'Kilise Bul' 'Find a Church')</a></p>
  <section class="sureci-sec" id="surec" aria-labelledby="h-surec">
    <h2 id="h-surec">$(T 'Hazırlık adım adım' 'The preparation, step by step')</h2>
    <p class="why-thesis">$(T (Inline $Sureci.processIntro) (Inline $Sureci.processIntroEn))</p>
    <ol class="stage-list">
$stageList
    </ol>
  </section>
  <section class="sureci-sec" id="sorular" aria-labelledby="h-sorular">
    <h2 id="h-sorular">$(T 'Merak edilenler' 'Good to know')</h2>
    <div class="kk-secs">$($sureciFolds -join "`n")</div>
  </section>
  $(TB "<p class=`"conventions`">Bu sayfadaki OCIA süreci, Kilise$($Apos)nin bütün dünyada geçerli düzenlemesidir (1972, Tanrısal Kült Cemaati). Paskalya Nöbeti dışında kabul ve günah çıkarmanın zamanı gibi bazı ayrıntılar, ABD Katolik Episkoposlar Konferansı$($Apos)nın Katekümenlik İçin Ulusal Tüzüğü$($Apos)nden (1986) alınmıştır. Kendi bölgenizdeki uygulama için en yakın kiliseye danışın.</p>" "<p class=`"conventions`">The general OCIA process on this page is a universal Church regulation (1972, Congregation for Divine Worship); some details above (such as reception outside the Easter Vigil, or the timing of confession) are drawn from the U.S. Conference of Catholic Bishops' National Statutes for the Catechumenate (1986). For practice in your own region, ask your nearest parish.</p>")
</div>
"@
Write-Page -File 'katolik-sureci.html' -Title "$($Sureci.title) | $SiteName" -TitleEn "$($Sureci.en) | $SiteName" `
  -Description "Katolik olmak isteyenler için: OCIA/RCIA süreci nedir, vaftizli ve vaftizsiz adaylar için adım adım nasıl işler, hangi hazırlık gerekir." `
  -Path 'katolik-sureci.html' -Body $sureciBody -JsonLd @((Breadcrumb-Ld 'Katolik Olma Süreci' 'katolik-sureci.html'))

# ================================================================== GUNAH CIKARMA (gunah-cikarma.html)
$confessionSteps = ($Confession.steps | ForEach-Object {
  $i = [array]::IndexOf(@($Confession.steps), $_) + 1
  "<li class=`"stage`"><span class=`"stage-n`">$i</span><div class=`"stage-body`"><h3>$(T (Inline $_.title) (Inline $_.en))</h3>$(TO "<p class=`"stage-en label`" lang=`"en`">$($_.en)</p>")<p>$(T (Inline $_.text) (Inline $_.textEn))</p></div></li>"
}) -join "`n"
$examenGroups = ($Confession.examenGroups | ForEach-Object {
  $group = $_
  $items = ($group.items | ForEach-Object { "<li>$(Inline $_)</li>" }) -join ''
  $itemsEn = ($group.itemsEn | ForEach-Object { "<li>$(Inline $_)</li>" }) -join ''
  $lists = TB ('<ul class="examen-list">' + $items + '</ul>') ('<ul class="examen-list">' + $itemsEn + '</ul>')
  $mark = if ($group.noteMark) { '<a class="fn-mark" href="#dokuz-on" aria-label="Dipnot">*</a>' } else { '' }
  "<article class=`"text-card examen-card`"><h3 class=`"t-title examen-title`">$(T (Inline $group.title) (Inline $group.titleEn))$mark</h3>" +
    "<p class=`"examen-about`">$(T (Inline $group.about) (Inline $group.aboutEn))</p>" +
    $lists + '</article>'
}) -join "`n"
$examenNote = "<aside class=`"footnote-block`" id=`"dokuz-on`"><p>* $(T (Inline $Confession.examenNote) (Inline $Confession.examenNoteEn))</p></aside>"
$confessionFaq = ($Confession.faq | ForEach-Object {
  "<details class=`"faq-item`" id=`"$($_.id)`"><summary><span class=`"faq-q`">$(T (Inline $_.q) (Inline $_.qEn))</span>$IcoChevLg</summary>" +
    "<div class=`"faq-a`"><p>$(T (Inline $_.a) (Inline $_.aEn))</p></div></details>"
}) -join "`n"
$sealMartyrsItems = ($Confession.sealMartyrs.items | ForEach-Object { "<li><strong>$(Inline $_.name)</strong> $(Inline $_.detail)</li>" }) -join "`n"
$sealMartyrsItemsEn = ($Confession.sealMartyrs.itemsEn | ForEach-Object { "<li><strong>$(Inline $_.name)</strong> $(Inline $_.detail)</li>" }) -join "`n"
$sealMartyrsHtml = "<aside class=`"footnote-block`" id=`"muhur-sehitleri`"><p class=`"footnote-label`">* $(T (Inline $Confession.sealMartyrs.title) (Inline $Confession.sealMartyrs.titleEn))</p><p>$(T (Inline $Confession.sealMartyrs.intro) (Inline $Confession.sealMartyrs.introEn))</p>$(TB "<ul class=`"footnote-list`">$sealMartyrsItems</ul>" "<ul class=`"footnote-list`">$sealMartyrsItemsEn</ul>")</aside>"
$confessionBody = @"
<div class="wrap narrow">
  $(Crumbs 'Günah Çıkarma')
  <header class="page-head center">$(Page-Ico $IcoKey)<h1>$(T $Confession.title $Confession.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($Confession.en)</p>")</header>
  <p class="faq-intro">$(T (Inline $Confession.intro) (Inline $Confession.introEn))</p>
  <h2 class="section-title" id="adim-adim"><span class="label">1</span>$(T 'Nasıl İşler? Adım Adım' 'How It Works, Step by Step')</h2>
  <ol class="stage-list">
$confessionSteps
  </ol>
  <h2 class="section-title" id="vicdan-muhasebesi"><span class="label">2</span>$(T 'Vicdan Muhasebesi' 'Examination of Conscience')</h2>
  <p class="faq-intro">$(T (Inline $Confession.examenIntro) (Inline $Confession.examenIntroEn))</p>
  <div class="text-grid two examen-grid">
$examenGroups
  </div>
  $examenNote
  <h2 class="section-title" id="sorular-ve-korkular"><span class="label">3</span>$(T 'Sık Sorulan Sorular ve Korkular' 'Frequently Asked Questions and Fears')</h2>
  <div class="faq-list">
$confessionFaq
  </div>
  $sealMartyrsHtml
  $(TB "<p class=`"conventions`">Bu sayfa, Katolik Kilisesi Katekizmi$($Apos)nin Tövbe ve Barışma Kutsal Sırrı üzerine öğretisine (<a href=`"https://www.vatican.va/content/catechism/en/part_two/section_two/chapter_two/article_4/vi_the_sacrament_of_penance_and_reconciliation.html`" target=`"_blank`" rel=`"noopener`">KKK 1420-1498</a>) ve Kilise hukukuna dayanır; ayin sözlerinin tam metni bölgeden bölgeye küçük farklar gösterebilir. Uygulamadaki ayrıntılar için (örneğin günah çıkarma saatleri) en yakın cemaat kilisenize danışın; <a href=`"kiliseler.html`">Kilise Bul</a> sayfası size yardımcı olabilir.</p>" "<p class=`"conventions`">This page is grounded in the Catechism of the Catholic Church's teaching on the Sacrament of Penance and Reconciliation (<a href=`"https://www.vatican.va/content/catechism/en/part_two/section_two/chapter_two/article_4/vi_the_sacrament_of_penance_and_reconciliation.html`" target=`"_blank`" rel=`"noopener`">CCC 1420-1498</a>) and canon law; the exact wording of the rite can vary slightly from region to region. For practical details (such as confession times), ask your nearest parish; the <a href=`"kiliseler.html`">Find a Church</a> page can help.</p>")
</div>
"@
Write-Page -File 'gunah-cikarma.html' -Title "$($Confession.title) | $SiteName" -TitleEn "$($Confession.en) | $SiteName" `
  -Description "Günah çıkarma nasıl işler? Adım adım pratik rehber, vicdan muhasebesi listesi ve ilk kez günah çıkaracaklar için sık sorulan sorular." `
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
    $refs = if (@($c.refs).Count) { "<p class=`"amap-c-refs`"><span class=`"label`">$(T "Kutsal Kitap$($Apos)ta" 'In Scripture')</span>" + (TB ((@($c.refs) | ForEach-Object { "<span class=`"amap-ref`">$_</span>" }) -join '') ((@($e.refs) | ForEach-Object { "<span class=`"amap-ref`">$_</span>" }) -join '')) + '</p>' } else { '' }
    $more = if ($s.section) { "<a class=`"amap-c-more`" href=`"#$($s.section)`">$(T 'Bu sayfada devamını okuyun' 'Read more on this page')$IcoChevDown</a>" } else { '' }
    [void]$cards.Append("<article class=`"amap-card c-$($s.cat)`" id=`"yer-$($s.id)`" data-site=`"$($s.id)`" hidden>" +
      "<p class=`"amap-c-cat`"><span class=`"amap-key`"></span>$($catName[$s.cat])</p>" +
      "<h3 class=`"amap-c-name`">$(T $c.name $e.name)$old</h3><p class=`"amap-c-place`">$(T $c.place $e.place)</p>" +
      "<p class=`"amap-c-text`">$(T (Inline $c.text) (Inline $e.text))</p>$refs$more</article>")
  }
  $index = ($AnMap.cats | ForEach-Object {
    $cid = $_.id
    $chips = ($AnMap.sites | Where-Object { $_.cat -eq $cid } | ForEach-Object {
      "<li><a class=`"amap-chip`" href=`"#yer-$($_.id)`" data-site=`"$($_.id)`">$(T $_.tr.name $_.en.name)</a></li>"
    }) -join ''
    "<div class=`"amap-cat c-$cid`"><h3 class=`"amap-cat-h`"><span class=`"amap-key`"></span>$($catName[$cid])</h3><ul>$chips</ul></div>"
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
    <p class="amap-swipe">$(T 'Haritanın tamamını görmek için yana kaydırın' 'Swipe the map sideways to see all of it')</p>
    <div class="amap-pop" id="amap-pop" role="dialog" aria-labelledby="amap-pop-h" hidden>
      <button type="button" class="amap-pop-close" $(TA 'aria-label' 'Kapat' 'Close')>$IcoClose</button>
      <div class="amap-pop-body"></div>
      <p class="amap-pop-hint">$(T 'Kartı açık tutmak için tıklayın' 'Click to keep this card open')</p>
    </div>
  </div>
  <nav class="amap-index" $(TA 'aria-label' 'Haritadaki bütün yerler' 'All places on the map')>$index</nav>
  <div class="amap-cards">$($cards.ToString())</div>
</section>
"@
}

# ================================================================== TOPRAKLARIMIZDA HRISTIYANLIK (topraklarimizda-hristiyanlik.html)
$anatoliaSections = ($Anatolia.sections | ForEach-Object {
  $i = [array]::IndexOf(@($Anatolia.sections), $_) + 1
  "<section id=`"$($_.id)`">" +
    "<h2 class=`"section-title`"><span class=`"label`">$i</span>$(T (Inline $_.title) $_.en)</h2>" +
    (TO "<p class=`"faq-cat-en`" lang=`"en`">$($_.en)</p>") +
    "<div class=`"prose`">$(TB (Blocks $_.body) (Blocks $_.bodyEn))</div></section>"
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
  -Description "Hristiyanlığın Anadolu'daki kökleri: Pavlus'un memleketi Tarsus, Vahiy Kitabı'nın yedi kilisesi, İznik Konsili, Antakya ve İzmir'deki ilk Kilise Babaları." `
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
$icTldr = ($Ic.tldr | ForEach-Object -Begin { $i = 0 } -Process {
  $i++
  "<li><a class=`"ic-tl`" href=`"#$($_.href)`"><span class=`"ic-tl-n`">$i</span><span class=`"ic-tl-b`"><span class=`"ic-tl-t`">$(T $_.t $_.tEn)</span><span class=`"ic-tl-s`">$(T $_.text $_.textEn)<span class=`"ic-tl-more`">$(T 'Tümünü oku' 'Read all') $IcoArrowR</span></span></span></a></li>"
}) -join ''
$icRoman = @('I', 'II', 'III', 'IV', 'V', 'VI')
# Every section, the closing too, in reading order: each ends with a way to the one before, the
# one after and back to the start (on a phone, the page's list of parts)
$icSeq = @(@($Ic.parts) | ForEach-Object { $_.sections }) + @($Ic.closing)
function Ic-Nav($k) {
  $prev = if ($k -gt 0) { $p = $icSeq[$k - 1]; "<a class=`"ic-nav-prev`" href=`"#$($p.id)`" data-av-step><span class=`"ic-nav-l`">$IcoArrowL $(T 'Önceki bölüm' 'Previous section')</span><span class=`"ic-nav-t`">$(T $p.title $p.titleEn)</span></a>" } else { '<span></span>' }
  $next = if ($k -lt $icSeq.Count - 1) { $n = $icSeq[$k + 1]; "<a class=`"ic-nav-next`" href=`"#$($n.id)`" data-av-step><span class=`"ic-nav-l`">$(T 'Sonraki bölüm' 'Next section') $IcoArrowR</span><span class=`"ic-nav-t`">$(T $n.title $n.titleEn)</span></a>" } else { '<span></span>' }
  return "<nav class=`"ic-nav`" aria-label=`"Bölümler arasında`" data-en-aria-label=`"Between sections`">$prev$next<a class=`"ic-nav-start`" href=`"#bas`" data-av-pop=`"bas`">$IcoSections $(T 'Bölümlere dön' 'Back to sections')</a></nav>"
}
$icN = 0
$icParts = (@($Ic.parts) | ForEach-Object -Begin { $pi = 0 } -Process {
  $part = $_
  $secs = ($part.sections | ForEach-Object {
    $script:icN++
    "<section class=`"ic-sec`" id=`"$($_.id)`"><h3 class=`"ic-sec-t`"><span class=`"label`">$($script:icN)</span><span>$(T $_.title $_.titleEn)</span></h3>" +
      "<div class=`"prose`">$(TB (Ic-Blocks $_.body) (Ic-Blocks $_.bodyEn))</div>$(Ic-Nav ($script:icN - 1))</section>"
  }) -join "`n"
  $pi++
  "<section class=`"ic-part`" id=`"$($part.id)`" aria-labelledby=`"$($part.id)-h`"><header class=`"ic-part-head`"><p class=`"ic-part-n`">$(T "$($icRoman[$pi - 1]). Bölüm" "Part $($icRoman[$pi - 1])")</p><h2 class=`"ic-part-t`" id=`"$($part.id)-h`">$(T $part.title $part.titleEn)</h2></header>`n$secs</section>"
}) -join "`n"
$icSources = ($Ic.sources | ForEach-Object {
  $t = T $_[0] $_[2]
  if ($_[1]) { "<li><a href=`"$($_[1])`" target=`"_blank`" rel=`"noopener`">$t</a></li>" } else { "<li>$t</li>" }
}) -join ''
$icBody = @"
<div class="wrap narrow ic-page">
  <header class="page-head center" id="bas">$(Page-Ico $IcoAnswer)<h1>$(T $Ic.title $Ic.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($Ic.en)</p>")</header>
  <p class="ic-lead">$(T $Ic.lead $Ic.leadEn)<a class="ic-fn-ref" href="#dipnot" aria-label="Dipnot" data-en-aria-label="Footnote">*</a></p>
  <section class="ic-tldr" id="kisaca" aria-labelledby="kisaca-h">
    <h2 class="section-title" id="kisaca-h">$(T $Ic.tldrTitle $Ic.tldrTitleEn)</h2>
    <ol class="ic-tl-list">$icTldr</ol>
    <p class="ic-full"><a href="#$($Ic.parts[0].id)">$(T 'Tam tartışma aşağıda' 'The full case below') $IcoChevDown</a></p>
  </section>
$icParts
  <section class="ic-sec ic-closing" id="$($Ic.closing.id)" aria-labelledby="$($Ic.closing.id)-h"><h2 class="ic-part-t" id="$($Ic.closing.id)-h">$(T $Ic.closing.title $Ic.closing.titleEn)</h2><div class="prose">$(TB (Ic-Blocks $Ic.closing.body) (Ic-Blocks $Ic.closing.bodyEn))</div>$(Ic-Nav ($icSeq.Count - 1))</section>
  <section class="ic-sources" aria-labelledby="ic-kaynak-h"><h2 class="section-title" id="ic-kaynak-h">$(T 'Kaynaklar' 'Sources')</h2><ul>$icSources</ul></section>
  <aside class="ic-footnote" id="dipnot" aria-label="Dipnot" data-en-aria-label="Footnote"><p><span class="ic-fn-mark" aria-hidden="true">*</span>$(T (Ic-Link $Ic.note) (Ic-Link $Ic.noteEn))</p></aside>
</div>
"@
$icLd = '{"@context":"https://schema.org","@type":"Article","headline":' + (JStr (Plain $Ic.title)) + ',"inLanguage":"tr","author":{"@type":"Organization","name":' + (JStr $SiteName) + '},"mainEntityOfPage":' + (JStr "$SiteUrl/islama-cevap.html") + '}'
Write-Page -File 'islama-cevap.html' -Title "$(Plain $Ic.title): Kur'an ve Hadislerle | $SiteName" -TitleEn "$($Ic.en): From the Qur$($Apos)an and the Hadith | $SiteName" `
  -Description (Meta-Trim "İslam'ın iddiaları kendi kaynaklarıyla sınanıyor: İslam ikilemi, Kur'an'ın korunmuşluğu, Muhammed'in karakteri, Kâbe'nin putu Hübel. Kısa özet ve tam tartışma.") `
  -Path 'islama-cevap.html' -Body $icBody -JsonLd @($icLd, (Breadcrumb-Ld "İslam$($Apos)a Cevap" 'islama-cevap.html'))

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
  $L = @{ doors = @('Nereden başlamak istersiniz?', 'Where would you like to start?'); but = @('Ama', 'But'); q = @('Soru', 'The question')
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
    "<section class=`"why-part`" id=`"$($pt.id)`" aria-labelledby=`"h-$($pt.id)`">" +
      "<header class=`"why-part-head`"><p class=`"label`">$(T "Bölüm $($k + 1) / $n" "Part $($k + 1) of $n")</p><h2 id=`"h-$($pt.id)`">$(T (Inline $pt.title) (Inline $pt.en))</h2><p class=`"why-thesis`">$(F2 $pt 'thesis')</p></header>" +
      "<div class=`"why-list`">$items</div>" +
      $aside +
    "</section>"
  }) -join "`n"
  $chain = (@($W.chain) | ForEach-Object -Begin { $i2 = 0 } -Process { $i2++; "<li><span class=`"why-chain-n`">$i2</span>$(T (Inline $_) (Inline @($W.chainEn)[$i2 - 1]))</li>" }) -join ''
  $ctaItems = @(@('katolik-sureci.html', 'Katolik Olma Süreci', 'Yol adım adım nasıl ilerler', 'Becoming Catholic', 'What the path looks like, step by step'),
    @('sss.html', 'Sık Sorulan Sorular', 'Sık sorulan diğer sorulara cevaplar', 'Frequently Asked Questions', 'More answers to common questions'),
    @('kiliseler.html', 'Kilise Bul', "Türkiye$($Apos)deki Katolik kiliseleri", 'Find a Church', 'Catholic parishes across Turkey'),
    @('iletisim.html', 'İletişim', 'Sorularınızı bize yazın', 'Contact', 'Write to us with your questions'))
  $cta = ($ctaItems | ForEach-Object { "<a class=`"why-cta`" href=`"$($_[0])`"><span class=`"why-cta-t`">$(T $_[1] $_[3])</span><span class=`"why-cta-s`">$(T $_[2] $_[4])</span>$IcoArrowR</a>" }) -join ''
  $crumb = Crumbs 'Neden Katoliğiz?'
  $body = @"
<div class="wrap why-wrap" data-av-nogh>
  $crumb
  <header class="page-head center">$(Page-Ico $IcoCompass)<h1>$(T $W.title $W.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($W.en)</p>")</header>
  <p class="why-intro">$(F2 $W 'intro')</p>
  <nav class="why-doors" $(TA 'aria-label' $L.doors[0] $L.doors[1])>$doorsHtml</nav>
$panels
  <section class="why-end" id="sonuc" aria-labelledby="h-sonuc">
    <h2 id="h-sonuc">$(LL 'together')</h2>
    <ol class="why-chain">$chain</ol>
    <p class="why-closing">$(F2 $W 'closing')</p>
    <h3 class="why-where">$(LL 'where')</h3>
    <div class="why-ctas">$cta</div>
  </section>
</div>
"@
  $page = 'neden-katoligiz.html'
  $faqLdWhy = '{"@context":"https://schema.org","@type":"FAQPage","inLanguage":"tr","name":' + (JStr $W.title) +
    ',"url":' + (JStr "$SiteUrl/$page") + ',"mainEntity":[' + ((($parts | ForEach-Object { $_.topics }) | ForEach-Object {
      '{"@type":"Question","name":' + (JStr (Plain $_.q)) + ',"url":' + (JStr "$SiteUrl/$page#$($_.id)") +
      ',"acceptedAnswer":{"@type":"Answer","text":' + (JStr (Plain ($_.lede + ' ' + (@($_.points) -join ' ')))) + '}}'
    }) -join ',') + ']}'
  Write-Page -File $page -Title "$($W.title) | $SiteName" -TitleEn "$($W.en) | $SiteName" `
    -Description "Katolik inancının akla ve kalbe hitap eden kısa özeti: Tanrı var mı, İsa kim ve neden Katolik Kilise?" `
    -Path $page -Body $body -JsonLd @((Breadcrumb-Ld 'Neden Katoliğiz?' $page), $faqLdWhy)
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
      $label = if ($pages.Count -gt 1) { T $gs.name $gs.en } else { T 'Devamını oku' 'Read more' }
      "<a class=`"s-page`" href=`"$id.html`">$label$IcoNext</a>"
    }) -join '') + '</p>'
  }
  # a search for the name, in the language shown
  $plain = ($s.name -replace '<[^>]+>', '')
  $q = if ($plain -match '(^|\s)(Aziz|Havari|Havariler|Meryem|Vaftizci|Bazilika)') { $plain } else { "Aziz $plain" }
  $plainEn = if ($s.nameEn) { ($s.nameEn -replace '<[^>]+>', '') } else { $plain }
  $qEn = if ($plainEn -match '(^|\s)(Saint|St\.|Apostle|Mary|Our Lady|Blessed|Basilica)') { $plainEn } else { "Saint $plainEn" }
  return "<p class=`"s-links`">" + (T "<a class=`"s-google`" href=`"https://www.google.com/search?q=$([uri]::EscapeDataString($q))`" target=`"_blank`" rel=`"noopener nofollow`">Google$($Apos)da ara$IcoExternal</a>" "<a class=`"s-google`" href=`"https://www.google.com/search?q=$([uri]::EscapeDataString($qEn))`" target=`"_blank`" rel=`"noopener nofollow`">Search on Google$IcoExternal</a>") + "</p>"
}
$RankEn = @{ 'En Büyük Bayram' = 'The Greatest Solemnity'; 'Büyük Bayram' = 'Solemnity'; 'Bayram' = 'Feast'; 'Anma Günü' = 'Memorial'; 'Anma' = 'Memorial'
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
$greatSaintsCardsHtml = ($GreatSaints.saints | ForEach-Object {
  "<a class=`"gs-item`" href=`"$($_.id).html`"><span class=`"gs-n`">$(T (Inline $_.name) $_.en)</span><span class=`"gs-s`">$(T (Inline $_.epithet) (Inline $_.epithetEn))</span></a>"
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
  <details class="gs-drop" data-gs-drop><summary><span>$(T 'Yirmi azizin listesi' 'The list of twenty saints')</span>$IcoChev</summary><div class="gs-list">$greatSaintsCardsHtml</div></details>
  <div class="movable-list" data-movable-list hidden>
$movableCardsHtml
  </div>
  $(TB "<p class=`"conventions`">Tarihler ve ayin dereceleri Roma Genel Takvimi$($Apos)ne göredir. Hareketli bayramlar, Meeus/Jones/Butcher algoritmasıyla hesaplanan Paskalya tarihine göre yerleştirilir. Roma Genel Takvimi$($Apos)nde boş kalan günler için Roma Azizler Cetveli$($Apos)nden (Martyrologium Romanum) ya da Batı$($Apos)nın eski takvim geleneğinden bir aziz seçtik. Bu azizlerin rütbesi <em>Roma Azizler Cetveli</em> olarak gösterilir. Kilise bu anmaları o gün için zorunlu tutmaz; bunlar sitenin sunduğu ek bilgilerdir. Aziz hayat öyküleri bu site için Türkçe olarak yazıldı ve yazarın kendi bilgisine dayanır. Özellikle az bilinen azizlerde tarih ya da ayrıntı hataları olabilir. Güvenilir bir kaynağa dayandırılamayan birkaç gün için Kilise$($Apos)nin genel bir açıklaması kullanıldı.</p>" "<p class=`"conventions`">Dates and liturgical ranks follow the General Roman Calendar; the year's movable feasts are set according to the date of Easter, calculated with the Meeus/Jones/Butcher algorithm. For dates the General Roman Calendar leaves open, a saint ranked <em>Roman Martyrology</em> has been chosen from the Roman Martyrology (Martyrologium Romanum) or the West's historical calendar tradition; this means it is not a commemoration the Church requires for that day, but additional information the site offers. The saint biographies were written for this site, from the author's own knowledge; small errors of date or detail are possible, especially for lesser-known saints. For a very small number of days that could not be grounded in any reliable source, the Church's own general description is used instead.</p>")
</div>
<div class="hover-panel glass" id="saint-panel" role="tooltip" hidden></div>
"@
Write-Page -File 'azizler.html' -Title "$($Saints.title) | $SiteName" -TitleEn "$($Saints.en) | $SiteName" `
  -Description "Katolik ayin takviminin azizleri: bugünün azizini Türkiye saatiyle görün, yılın her günü için Türkçe aziz hayat hikayelerini keşfedin." `
  -Path 'azizler.html' -Body $azizlerBody -JsonLd @((Breadcrumb-Ld 'Azizler' 'azizler.html'))

# ------------------------------------------------------------------ one page per great saint
$GreatSaints.saints | ForEach-Object {
  $s = $_
  $saintBody = @"
<div class="wrap narrow">
  $(Crumbs $s.name 'Azizler' 'azizler.html')
  <article class="article" id="article">
    <header class="page-head center">$(Page-Ico $IcoStar)<p class="label">$(T "$(Inline $s.epithet) · $($s.era)" "$(Inline $s.epithetEn) · $($s.eraEn)")</p><h1>$(T (Inline $s.name) $s.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($s.en)</p>")</header>
    <div class="body prose">$(TB (Convert-Markdown $s.body) (Convert-Markdown $s.bodyEn))</div>
  </article>
</div>
"@
  $saintLd = '{"@context":"https://schema.org","@type":"Article","headline":' + (JStr $s.name) + ',"inLanguage":"tr","author":{"@type":"Organization","name":' + (JStr $SiteName) + '},"mainEntityOfPage":' + (JStr "$SiteUrl/$($s.id).html") + '}'
  Write-Page -File "$($s.id).html" -Title "$($s.name) | $SiteName" -TitleEn "$($s.en) | $SiteName" `
    -Description (Meta-Trim (Plain $s.summary)) -Path "$($s.id).html" -Body $saintBody `
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
  "<details class=`"mass-part`" id=`"$($p.id)`" data-part=`"$($p.n)`">" +
    "<summary class=`"mass-part-head`"><span class=`"mass-ico`">$icon</span><div><p class=`"mass-part-n label`">$(T "Bölüm $($p.n)" "Part $($p.n)")</p><h2>$(T (Inline $p.title) $p.en)</h2>$(TO "<p class=`"sub`" lang=`"en`">$($p.en)</p>")</div>$IcoChevLg</summary>" +
    "<div class=`"mass-part-body`">" +
    "<p class=`"mass-lead`">$(T (Inline $p.lead) (Inline $p.leadEn))</p>" +
    "<div class=`"mass-dialogue`" data-tr>$(TB $trHtml $enHtml)</div>" +
    "</div>" +
  "</details>"
}) -join "`n"
$massBody = @"
<div class="wrap narrow">
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
  -Description "Kutsal Ayin$($Apos)in sırası: cemaatin toplanmasından son takdise, Kutsal Kitabın okunmasından Efkaristiya$($Apos)nın kutsanmasına dek altı bölüm, Türkçe ve İngilizce." `
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
  "<section class=`"mira-cat`" id=`"$($cat.id)`">" +
    "<h2 class=`"section-title`"><span class=`"label`">$($script:MeselN)</span>$(T (Inline $cat.title) $cat.en)</h2>" +
    (TO "<p class=`"faq-cat-en`" lang=`"en`">$($cat.en)</p>") +
    "<p class=`"faq-intro`">$(T (Inline $cat.lead) (Inline $cat.leadEn))</p>" +
    "<div class=`"mira-list`">$items</div></section>"
}) -join "`n"
$MeselTitle = "İsa$($Apos)nın Meselleri"
$meselBody = @"
<div class="wrap narrow">
  $(Crumbs $MeselTitle)
  <header class="page-head center">$(Page-Ico $IcoBookOpen)<h1>$(T $Parables.title $Parables.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($Parables.en)</p>")</header>
  <p class="faq-intro">$(T (Inline $Parables.intro) (Inline $Parables.introEn))</p>
  <nav class="faq-toc is-sticky" $(TA 'aria-label' 'Kategoriler' 'Categories')><ul>$meselToc</ul></nav>
$meselCats
</div>
"@
Write-Page -File 'meseller.html' -Title "$($Parables.title) | $SiteName" -TitleEn "$($Parables.en) | $SiteName" `
  -Description "Mesih İsa$($Apos)nın İnciller$($Apos)deki başlıca meselleri: kısaca yeniden anlatılmış ve konularına göre bölümlere ayrılmış, düz bir dille açıklanmış otuz ikisi bir arada." `
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
$mysterySets = ($Rosary.sets | ForEach-Object {
  $items = ($_.items | ForEach-Object { "<li><span class=`"m-tr`">$(T (Inline $_.tr) $_.en)</span></li>" }) -join ''
  "<article class=`"myst`" data-days=`"$($_.days -join ',')`" id=`"gizem-$($_.id)`">" +
    "<header><h3>$(T (Inline $_.tr) $_.en)</h3><p class=`"m-day label`">$(T $_.dayTr $_.dayEn)</p>$(TO "<p class=`"m-en-title`" lang=`"en`">$($_.en)</p>")</header>" +
    "<ol class=`"myst-list`">$items</ol></article>"
}) -join "`n"
$stepList = ($Rosary.steps | ForEach-Object {
  "<li><span class=`"s-tr`">$(T (Inline $_.tr) $_.en)</span></li>"
}) -join ''

$PrayerById = @{}
$Rosary.prayers | ForEach-Object { $PrayerById[$_.id] = $_ }
$tespihBody = @"
<div class="wrap narrow">
  $(Crumbs 'Tesbih Duası')
  <header class="page-head center">$(Page-Ico $IcoBeads)<h1>$(T $Rosary.title $Rosary.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($Rosary.en)</p>")</header>
  <p class="faq-intro">$(T (Inline $Rosary.intro) (Inline $Rosary.introEn))</p>
$(Rosary-Tracker 'tr')
  <h2 class="section-title" id="gizemler">$(T 'Gizemler' 'The Mysteries')</h2>
  <div class="myst-grid">
$mysterySets
  </div>
  <h2 class="section-title" id="nasil">$(T 'Tesbih nasıl dua edilir?' 'How to pray the Rosary')</h2>
  <ol class="steps">$stepList</ol>
  <p class="conventions">$(T "Dua metinleri, İstanbul$($Apos)daki Sant$($Apos)Antuan (Aziz Antuan) Bazilikası$($Apos)nda tesbih duası için kullanılan Türkçe gelenek esas alınarak düzenlenmiştir." "The Turkish prayers follow the tradition used for the Rosary at the Basilica of Saint Anthony of Padua (Sant'Antuan) in Istanbul; the English are the prayers as they are commonly said.")</p>
</div>
"@
Write-Page -File 'tesbih-duasi.html' -Title "$($Rosary.title) | $SiteName" -TitleEn "$($Rosary.en) | $SiteName" `
  -Description "Meryem Ana Tesbih Duası: duaların Türkçesi ve İngilizcesi, Sevinç, Işık, Acı ve Yücelik gizemleri ve tesbihin nasıl dua edileceği." `
  -Path 'tesbih-duasi.html' -Body $tespihBody -JsonLd @((Breadcrumb-Ld 'Tesbih Duası' 'tesbih-duasi.html'))

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
    $more = if ($GreatSaintIds.ContainsKey($_.id)) { "<a class=`"today-more-link`" href=`"$($_.id).html`">$(T 'Devamını oku' 'Read more')$IcoNext</a>" } else { '' }
    "<details class=`"mira-item`" id=`"$($_.id)`"><summary><span class=`"mira-ico`">$icon</span><span class=`"mira-head`"><span class=`"mira-name`">$(T (Inline $_.name) (Inline $_.nameEn))</span><span class=`"mira-place label`">$(T $_.place $_.placeEn)</span></span>$IcoChevLg</summary><div class=`"mira-bio`">$(TB (Blocks $_.bio) (Blocks $_.bioEn))$more</div></details>"
  }) -join "`n"
  "<section class=`"mira-cat`" id=`"$($cat.id)`">" +
    "<h2 class=`"section-title`"><span class=`"label`">$($script:MiraN)</span>$(T (Inline $cat.title) $cat.en)</h2>" +
    (TO "<p class=`"faq-cat-en`" lang=`"en`">$($cat.en)</p>") +
    "<p class=`"faq-intro`">$(T (Inline $cat.lead) (Inline $cat.leadEn))</p>" +
    "<div class=`"mira-list`">$items</div></section>"
}) -join "`n"
$mucizelerBody = @"
<div class="wrap narrow">
  $(Crumbs 'Mucizeler')
  <header class="page-head center">$(Page-Ico $IcoSparkle)<h1>$(T $Miracles.title $Miracles.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($Miracles.en)</p>")</header>
  <p class="faq-intro">$(T (Inline $Miracles.intro) (Inline $Miracles.introEn))</p>
  <nav class="faq-toc is-sticky" $(TA 'aria-label' 'Kategoriler' 'Categories')><ul>$miraToc</ul></nav>
$miraCats
</div>
"@
Write-Page -File 'mucizeler.html' -Title "Mucizeler | $SiteName" -TitleEn "$($Miracles.en) | $SiteName" `
  -Description "Katolik Kilisesi$($Apos)nde bilinen mucizeler: Meryem Ana görünmeleri (Fatima, Lourdes, Guadalupe, Zeytun), Torino Kefeni, Efkaristiya mucizeleri ve çürümeyen azizler." `
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
    if ($ch.status -ne 'active' -and $ch.notice) {
      $head = if ($ch.status -eq 'closed') { T 'Şu anda kapalı.' 'Closed at present.' } else { T 'Gitmeden önce.' 'Before you go.' }
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
    if ($ch.website) { [void]$rows.Append("<div class=`"ch-row`"><dt>$IcoGlobe<span>Web</span></dt><dd><a href=`"$($ch.website)`" target=`"_blank`" rel=`"noopener`">$(Site-Host $ch.website) $IcoExternal</a></dd></div>") }
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
    $desc = "$(Plain $ch.name), $(Plain $ch.district), $($cityName): ayin saatleri, ziyaret saatleri, adres, iletişim bilgileri ve kilisenin tarihçesi."
    $ld = '{"@context":"https://schema.org","@type":"Church","name":' + (JStr (Plain $ch.name)) + ',"address":' + (JStr (Plain $ch.address)) +
      $(if (@($ch.phones).Count) { ',"telephone":' + (JStr ((Tel-Href @($ch.phones)[0]) -replace '^tel:', '')) } else { '' }) +
      $(if ($ch.website) { ',"sameAs":' + (JStr $ch.website) } else { '' }) + ',"url":' + (JStr "$SiteUrl/$file") + '}'
    Write-Page -File $file -Title "$(Plain $ch.name), $cityName | $SiteName" -TitleEn "$(Plain $ch.nameEn), $cityEn | $SiteName" -Description (Meta-Trim $desc) -Path $file -Body $body `
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
$kiliselerBody = @"
<div class="wrap narrow">
  $(Crumbs 'Kilise Bul')
  <header class="page-head center">$(Page-Ico $IcoChurch)<h1>$(T $Churches.title $Churches.en)</h1>$(TO "<p class=`"sub`" lang=`"en`">$($Churches.en)</p>")</header>
$churchMapHtml
  <p class="conventions">$(T (Inline $Churches.note) (Inline $Churches.noteEn))</p>
  <div class="faq-list">
    <details class="faq-item" id="katolik-bulunamadiginda" open><summary><span class="faq-q">$(T 'Yakınımda Katolik kilisesi yoksa ne yapmalıyım?' 'What if there is no Catholic church near me?')</span>$IcoChevLg</summary>
      <div class="faq-a"><p>$(T (Inline $Churches.orthodoxNote) (Inline $Churches.orthodoxNoteEn))</p></div></details>
  </div>
</div>
"@
Write-Page -File 'kiliseler.html' -Title "$($Churches.title) | $SiteName" -TitleEn "$($Churches.en) | $SiteName" `
  -Description "Türkiye$($Apos)deki Katolik kiliseleri haritası: Latin, Ermeni, Süryani ve Keldani Katolik kiliseleri; her birinin ayin saatleri, ziyaret saatleri, adresi ve tarihçesi." `
  -Path 'kiliseler.html' -Body $kiliselerBody -JsonLd @((Breadcrumb-Ld 'Kilise Bul' 'kiliseler.html'))

# ================================================================== ILETISIM (iletisim.html)
$iletisimBody = @"
<div class="wrap narrow">
  $(Crumbs 'İletişim')
  <header class="page-head center">$(Page-Ico $IcoMail)<h1>$(T 'İletişim' 'Contact')</h1></header>
  <div class="placeholder-page contact-page">
    $IcoMail
    <p class="placeholder-lead">$(T 'Bize ulaşın' 'Get in touch')</p>
    $FootContactHtml
  </div>
</div>
"@
Write-Page -File 'iletisim.html' -Title "İletişim | $SiteName" -TitleEn "Contact | $SiteName" `
  -Description "katolikdunyasi.com$($Apos)a nasıl ulaşabileceğiniz: çeviri düzeltmeleri, içerik önerileri ve sorularınız için e-posta adresi." `
  -Path 'iletisim.html' -Body $iletisimBody -JsonLd @((Breadcrumb-Ld 'İletişim' 'iletisim.html'))

# ================================================================== ERISILEBILIRLIK (erisilebilirlik.html)
$erBody = @"
<div class="wrap narrow">
  $(Crumbs 'Erişilebilirlik')
  <header class="page-head center">$(Page-Ico $IcoA11yPerson)<h1>$(T $ErMeta.title $ErEn.meta.title)</h1><p class="sub">$(T $ErMeta.subtitle $ErEn.meta.subtitle)</p></header>
  <div class="body prose">$(TB (Convert-Markdown $Er.body) (Convert-Markdown $ErEn.body))</div>
</div>
"@
Write-Page -File 'erisilebilirlik.html' -Title "$($ErMeta.title) | $SiteName" -TitleEn "$($ErEn.meta.title) | $SiteName" -Description $ErMeta.description `
  -Path 'erisilebilirlik.html' -Body $erBody -JsonLd @((Breadcrumb-Ld 'Erişilebilirlik' 'erisilebilirlik.html'))

# ================================================================== GIZLILIK (gizlilik.html)
$gzBody = @"
<div class="wrap narrow">
  $(Crumbs 'Gizlilik Politikası')
  <header class="page-head center">$(Page-Ico $IcoShield)<h1>$(T $GzMeta.title $GzEn.meta.title)</h1><p class="sub">$(T $GzMeta.subtitle $GzEn.meta.subtitle)</p></header>
  <div class="body prose">$(TB (Convert-Markdown $Gz.body) (Convert-Markdown $GzEn.body))</div>
</div>
"@
Write-Page -File 'gizlilik.html' -Title "$($GzMeta.title) | $SiteName" -TitleEn "$($GzEn.meta.title) | $SiteName" -Description $GzMeta.description `
  -Path 'gizlilik.html' -Body $gzBody -JsonLd @((Breadcrumb-Ld 'Gizlilik Politikası' 'gizlilik.html'))

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
  @{ id = 'tartis'; t = 'Tartış'; te = 'Debate'; s = 'İtirazlara cevap, inancın savunusu'; se = 'Answers to objections, a defence of the faith'; ico = $IcoDebate; pages = @(
    @{ f = 'islama-cevap.html'; ico = $IcoAnswer; t = "İslam$($Apos)a Cevap"; te = 'Answering Islam'
       s = "İslam$($Apos)ın iddiaları, Kur$($Apos)an ve hadislerle sınanıyor."; se = "Islam's claims, tested by the Qur'an and the hadith." }) },
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

# The faint religious images in the corners of the home page's three cards
$DecoSvg = { param($d) "<svg class=`"hm-deco`" viewBox=`"0 0 64 64`" aria-hidden=`"true`" fill=`"none`" stroke=`"currentColor`" stroke-width=`"2.2`" stroke-linecap=`"round`" stroke-linejoin=`"round`">$d</svg>" }
$DecoDove = & $DecoSvg '<path d="M32 42c-2.6 0-4.6-2-4.6-4.6 0-4.2 2.4-8.6 4.6-12.6 2.2 4 4.6 8.4 4.6 12.6 0 2.6-2 4.6-4.6 4.6Z"/><path d="M28 30c-6-4.6-14.6-5.6-22-2.6 7.2 1 13.4 4.2 19 9"/><path d="M36 30c6-4.6 14.6-5.6 22-2.6-7.2 1-13.4 4.2-19 9"/><path d="M29.4 22.6 32 18l2.6 4.6"/><circle cx="32" cy="46" r="2.6"/><path d="M32 51v7M25 50l-3.6 6M39 50l3.6 6M20 46l-5.4 3.4M44 46l5.4 3.4"/>'
$DecoCross = & $DecoSvg '<path d="M32 6v52M18 20h28"/><path d="M32 20m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0" stroke-width="1.4"/><path d="M26 58h12" stroke-width="1.6"/>'
$DecoChalice = & $DecoSvg '<circle cx="32" cy="9" r="5"/><path d="M32 6.4v5.2M29.4 9h5.2" stroke-width="1.4"/><path d="M18 18h28c0 11-5.6 18-14 18S18 29 18 18Z"/><path d="M32 36v12"/><path d="M22 58c0-5.6 4.4-10 10-10s10 4.4 10 10Z"/>'
$IcoChevR = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>'
function Home-Page([string]$lang) {
  # Every text in both languages (T), the TR | EN switch shows one
  function L([string]$tr, [string]$enText) { T $tr $enText }
  function F([string]$f) { $f }
  $loading = L 'Yükleniyor…' 'Loading…'
  $cards = @"
  <div class="hm-today" id="bugun">
    <a class="hm-card hm-saint" href="$(F 'azizler.html')" data-home-saint>$DecoChalice
      <span class="hm-label">$IcoStar $(L 'Bugünün Azizi' 'Saint of the Day')</span>
      <span class="hm-sn" data-hs-name>$loading</span><span class="hm-sub" data-hs-title></span><span class="hm-bio" data-hs-bio></span>
      <span class="hm-go">$(L 'Hayatını oku' 'Read their life') $IcoChevR</span>
    </a>
    <div class="hm-card hm-date" data-home-lit>$DecoDove
      <span class="hm-label">$(L 'Bugün' 'Today')</span>
      <span class="hm-day" data-hd-day>$loading</span><span class="hm-year" data-hd-year></span><time class="hm-time" data-hd-time></time>
      <span class="hm-season" data-hd-season></span><span class="hm-sub" data-hd-colour></span>
    </div>
    <a class="hm-card hm-myst" href="$(F 'tesbih-duasi.html')#tesbih-rehberi" data-home-mystery>$DecoCross
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
  $lists = "<div class=`"hm-lists`">$cols</div>"
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
    ',"url":' + (JStr "$SiteUrl/$homePath") + ',"inLanguage":"tr","description":' + (JStr $SiteTag) +
    ',"potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":' +
    (JStr "$SiteUrl/$($q)?q={search_term_string}") + '},"query-input":"required name=search_term_string"}}'
  Write-Page -File 'index.html' -Title "$SiteName | $SiteTag" -TitleEn "$SiteName | $SiteTagEn" `
    -Description "Türkçe Katolik Portalı: Katolik Kilisesi Katekizmi Özeti$($Apos)nin tam çevirisi ve Katolik inancı üzerine sıkça sorulan sorular." `
    -Path '' -Body $body -JsonLd @($ld)
}
Home-Page 'tr'

# ---------------- the English site's old addresses
# The site is Turkish only now. Each old English address forwards to the Turkish page that
# replaced it, keeping any #section, so links and search results still land somewhere real;
# search engines read an instant refresh as a permanent move and follow the canonical.
if (Test-Path $EnDir) { Get-ChildItem $EnDir -Filter *.html | Remove-Item }
else { New-Item -ItemType Directory -Path $EnDir | Out-Null }
foreach ($k in @($EnAltMap.Keys)) {
  if (-not $k.StartsWith('en/')) { continue }
  $tr = $EnAltMap[$k]
  $to = if ($tr -eq 'index.html') { '/' } else { "/$tr" }
  $html = "<!DOCTYPE html>`n<html lang=`"tr`">`n<head>`n<meta charset=`"utf-8`">`n<title>$SiteName</title>`n<meta name=`"robots`" content=`"noindex`">`n" +
    "<link rel=`"canonical`" href=`"$SiteUrl$to`">`n<meta http-equiv=`"refresh`" content=`"0; url=$to`">`n" +
    "<script>location.replace('$to' + location.hash)</script>`n</head>`n<body><p><a href=`"$to`">$SiteName</a></p></body>`n</html>`n"
  [IO.File]::WriteAllText((Join-Path $Root $k), $html, $Utf8)
}
Write-Host "  + en/: $(@($EnAltMap.Keys | Where-Object { $_.StartsWith('en/') }).Count) forwarding pages"
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
  @{ p = 'kutsal-kitap.html'; pr = '0.9' }, @{ p = 'tesbih-duasi.html'; pr = '0.9' }, @{ p = 'katolik-sureci.html'; pr = '0.9' },
  @{ p = 'gunah-cikarma.html'; pr = '0.9' }, @{ p = 'topraklarimizda-hristiyanlik.html'; pr = '0.9' },
  @{ p = 'neden-katoligiz.html'; pr = '0.9' }, @{ p = 'islama-cevap.html'; pr = '0.8' },
  @{ p = 'azizler.html'; pr = '0.9' }, @{ p = 'kutsal-ayin.html'; pr = '0.9' },
  @{ p = 'sss.html'; pr = '0.9' }, @{ p = 'kiliseler.html'; pr = '0.7' }, @{ p = 'motu-proprio.html'; pr = '0.6' },
  @{ p = 'giris.html'; pr = '0.6' }, @{ p = 'mucizeler.html'; pr = '0.7' },
  @{ p = 'iletisim.html'; pr = '0.4' }, @{ p = 'meseller.html'; pr = '0.9' }, @{ p = 'erisilebilirlik.html'; pr = '0.3' },
  @{ p = 'gizlilik.html'; pr = '0.3' }
) + ($GreatSaints.saints | ForEach-Object { @{ p = "$($_.id).html"; pr = '0.6' } }) + ($ChurchPages | ForEach-Object { @{ p = $_; pr = '0.5' } })
$sm = '<?xml version="1.0" encoding="UTF-8"?>' + "`n" + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "`n" +
  (($pages | ForEach-Object {
    "  <url><loc>$SiteUrl/$($_.p)</loc><lastmod>$BuildDate</lastmod><changefreq>monthly</changefreq><priority>$($_.pr)</priority></url>"
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
$secTxt = "Contact: mailto:david@katolikdunyasi.com`nExpires: $secExpires`nPreferred-Languages: tr`nCanonical: $SiteUrl/.well-known/security.txt`n"
[IO.File]::WriteAllText((Join-Path $wellKnownDir 'security.txt'), $secTxt, $Utf8)
Write-Host "  + sitemap.xml, robots.txt, .well-known/security.txt"
Write-Host "Done."
