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
  $css = [regex]::Replace($css, '\s*([{}:;,])\s*', '$1')
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
  $lines = $js -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
  return ($lines -join "`n")
}
$CssSrc = [IO.File]::ReadAllText((Join-Path $Root 'assets/styles.css'))
$JsSrc = [IO.File]::ReadAllText((Join-Path $Root 'assets/script.js'))
$CssMin = Minify-Css $CssSrc
$JsMin = Minify-Js $JsSrc
[IO.File]::WriteAllText((Join-Path $Root 'assets/styles.min.css'), $CssMin, $Utf8)
[IO.File]::WriteAllText((Join-Path $Root 'assets/script.min.js'), $JsMin, $Utf8)
$CssVer = File-Ver ([IO.File]::ReadAllBytes((Join-Path $Root 'assets/styles.min.css')))
$JsVer = File-Ver ([IO.File]::ReadAllBytes((Join-Path $Root 'assets/script.min.js')))
# Turkish suffix apostrophe (U+2019). Built from its code point on purpose: PowerShell
# treats a typographic quote as a string delimiter, so it must not appear in a literal,
# and &#8217; is no use in text that Attr() escapes. Interpolate it as $Apos instead.
$Apos = [char]0x2019
# The site is the brand now; the Compendium is one work published on it.
$SiteName = 'katolikdunyasi.com'
$SiteTag = 'Türkçe Katolik Portalı'
$WorkName = 'Katolik Kilisesi İnanç Esasları Özeti'
$SiteNameEn = 'Compendium of the Catechism of the Catholic Church'

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
$Saints = Read-Data 'azizler.js'
$GreatSaints = Read-Data 'buyuk-azizler.js'
$Mass = Read-Data 'kutsal-ayin.js'
$Blog = Read-Data 'blog.js'

# Page file, ordinal label and meta description per part (descriptions are for search engines only)
$PartMeta = @{
  1 = @{ file = 'iman-ikrari.html';     ord = 'Birinci Kısım';  roman = 'I';
         desc = "Katolik Kilisesi Katekizmi Özeti, Birinci Kısım: İnanç Beyanı. Vahiy, Kutsal Üçlü, Mesih İsa, Kilise ve ebedi hayat üzerine 1–217. sorular." }
  2 = @{ file = 'kutsal-sirlar.html';   ord = 'İkinci Kısım';   roman = 'II';
         desc = "Katolik Kilisesi Katekizmi Özeti, İkinci Kısım: Hristiyan Gizeminin Kutlanması. Litürji ve yedi Kutsal Sır üzerine 218–356. sorular." }
  3 = @{ file = 'mesihte-yasam.html';   ord = 'Üçüncü Kısım';   roman = 'III';
         desc = "Katolik Kilisesi Katekizmi Özeti, Üçüncü Kısım: Mesih$($Apos)te Yaşam. İnsan onuru, vicdan, erdemler, günah, lütuf ve On Emir üzerine 357–533. sorular." }
  4 = @{ file = 'hristiyan-duasi.html'; ord = 'Dördüncü Kısım'; roman = 'IV';
         desc = "Katolik Kilisesi Katekizmi Özeti, Dördüncü Kısım: Hristiyan Duası. Dua ve Rab$($Apos)bin Duası (Göklerdeki Pederimiz) üzerine 534–598. sorular." }
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

# ---------------- minimal Markdown (content/hakkinda.md feeds the info panel)
# Defined here rather than further down because Header-Html renders the panel on every page.
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
    if ($l -match '^(#{1,4})\s+(.+)$') { . $flush; $lvl = [Math]::Max(2, $Matches[1].Length); [void]$sb.Append("<h$lvl>" + (Md-Inline $Matches[2]) + "</h$lvl>"); continue }
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
$IcoTextSize = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/><path d="M10.5 7.8v5.4M7.8 10.5h5.4"/></svg>'
$IcoPrev   = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>'
$IcoNext   = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>'
$IcoClose  = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>'
# Jerusalem cross: large cross potent in the centre, a small cross in each quadrant (100x100 grid)
$CrossShapes = '<rect x="44" y="12" width="12" height="76"/><rect x="12" y="44" width="76" height="12"/><rect x="33" y="8" width="34" height="9"/><rect x="33" y="83" width="34" height="9"/><rect x="8" y="33" width="9" height="34"/><rect x="83" y="33" width="9" height="34"/><rect x="23.5" y="18" width="5" height="16"/><rect x="18" y="23.5" width="16" height="5"/><rect x="71.5" y="18" width="5" height="16"/><rect x="66" y="23.5" width="16" height="5"/><rect x="23.5" y="66" width="5" height="16"/><rect x="18" y="71.5" width="16" height="5"/><rect x="71.5" y="66" width="5" height="16"/><rect x="66" y="71.5" width="16" height="5"/>'
$Logo = '<svg class="logo" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g fill="currentColor">' + $CrossShapes + '</g></svg>'
$Favicon = 'data:image/svg+xml,' + ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#0c1322"/><g fill="#d6b16b" transform="translate(12 12) scale(.76)">' + $CrossShapes + '</g></svg>').Replace('<', '%3C').Replace('>', '%3E').Replace('#', '%23').Replace('"', "'")

# ------------------------------------------------------------------ components
$script:EnSeq = 0
function En-Toggle([string]$targetId, [string]$label = 'İngilizcesi') {
  return "<button type=`"button`" class=`"en-toggle`" aria-expanded=`"false`" aria-controls=`"$targetId`">$label $IcoChev</button>"
}
function Qa-Html($it, [int]$hl) {
  $n = $it.n; $tag = HTag $hl
  $note = if ($it.note) { "<p class=`"note`"><b>Not:</b> $(Inline $it.note)</p>" } else { '' }
  return "<article class=`"qa`" id=`"soru-$n`" data-n=`"$n`">" +
    "<header class=`"qa-head`"><a class=`"qa-num`" href=`"#soru-$n`" aria-label=`"Soru $n bağlantısı`">$n</a><$tag class=`"qa-q`">$(Inline $it.tr.q)</$tag></header>" +
    "<p class=`"qa-ref`" title=`"Katolik Kilisesi Katekizmi madde numaraları`">$($it.ccc)</p>" +
    "<div class=`"qa-a`">$(Blocks $it.tr.a)</div>$note" +
    "<footer class=`"qa-foot end`">$(En-Toggle "en-$n")</footer>" +
    "<div class=`"en-block`" id=`"en-$n`" lang=`"en`" hidden><span class=`"label`" lang=`"tr`">İngilizce aslı</span><p class=`"qa-q`">$(Inline $it.en.q)</p><p class=`"qa-ref`">$($it.ccc)</p><div class=`"qa-a`">$(Blocks $it.en.a)</div></div>" +
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

# ---------------- info panel (the old hakkinda.html, now a hover panel in the bar)
# content/hakkinda.md stays the editable source; only its rendering moved.
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

# Top bar: brand, Katesizm (a link that also opens a dropdown of the seven texts),
# Sorular, and an (i) that reveals content/hakkinda.md on hover.
$TextNav = @(
  @{ href = 'motu-proprio.html';    t = 'Motu Proprio';                       s = 'XVI. Benediktus, 2005' },
  @{ href = 'giris.html';           t = 'Giriş';                              s = 'Kardinal Ratzinger, 2005' },
  @{ href = 'iman-ikrari.html';     t = 'I. İnanç Beyanı';                    s = 'Sorular 1–217' },
  @{ href = 'kutsal-sirlar.html';   t = 'II. Hristiyan Gizeminin Kutlanması'; s = 'Sorular 218–356' },
  @{ href = 'mesihte-yasam.html';   t = "III. Mesih$($Apos)te Yaşam";         s = 'Sorular 357–533' },
  @{ href = 'hristiyan-duasi.html'; t = 'IV. Hristiyan Duası';                s = 'Sorular 534–598' },
  @{ href = 'ekler.html';           t = 'Ekler';                              s = 'Dualar ve formüller' }
)
# Every page that belongs to the Compendium, for the 'is-section' state and the breadcrumb
$PrayerNav = @(
  @{ href = 'tesbih-duasi.html'; t = 'Tesbih Duası';          s = 'Meryem Ana Tesbih Duası' },
  @{ href = 'ekler.html';        t = 'Sık Kullanılan Dualar'; s = 'Günlük dualar ve formüller' }
)
# "Kaynaklar": pages that stand on their own but are grouped under one menu now that there are many.
# Katekizm sits here too as a single link (no chapter submenu in the nav; katesizm.html itself is the way in).
$KaynaklarNav = @(
  @{ href = 'katesizm.html';       t = 'Katekizm';             s = '598 soru ve yanıt' },
  @{ href = 'katolik-sureci.html'; t = 'Katolik Süreci';       s = 'Katolik olma süreci' },
  @{ href = 'kutsal-ayin.html';    t = 'Kutsal Ayin';          s = 'Ayinin sırası, adım adım' },
  @{ href = 'meseller.html';       t = "İsa$($Apos)nın Meselleri"; s = 'Otuz iki mesel, düz bir dille' },
  @{ href = 'kutsal-kitap.html';   t = 'Kutsal Kitap';         s = 'Onaylı çeviriler' },
  @{ href = 'kiliseler.html';      t = 'Kilise Bul';           s = "Türkiye$($Apos)de kilise adresleri" }
)
$WorkPages = @('katesizm.html') + ($TextNav | ForEach-Object { $_.href })
$PrayerPages = @($PrayerNav | ForEach-Object { $_.href })
$KaynaklarPages = @($KaynaklarNav | ForEach-Object { $_.href }) + $WorkPages
$ClockHtml = '<time class="clock" aria-label="Tarih ve saat"><span class="clock-date"></span><span class="clock-time">--:--:--</span></time>'
$IcoBook = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.6C10.6 5.4 8.6 4.8 6 4.8H3.6v13.4H6c2.6 0 4.6.6 6 1.8 1.4-1.2 3.4-1.8 6-1.8h2.4V4.8H18c-2.6 0-4.6.6-6 1.8z"/><path d="M12 6.6v13.4"/></svg>'
$IcoBeads = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="14.6" r="6.4"/><circle cx="12" cy="5.2" r="1.5"/><path d="M12 6.7v1.5" stroke-linecap="round"/><path d="M10.4 3.3h3.2M12 1.7v3.2" stroke-linecap="round"/></svg>'
$IcoWay = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21c3-6 3-11 0-17"/><path d="M19 21c-3-6-3-11 0-17"/><path d="M9.5 15h5M9 10h6"/><circle cx="12" cy="4" r="1.4" fill="currentColor" stroke="none"/></svg>'
$IcoStar = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2c1 2.8 1.9 4.4 3.4 5.8 1.5 1.4 3.1 2.1 5.4 2.7-2.3.6-3.9 1.4-5.4 2.7-1.5 1.4-2.4 3-3.4 5.8-1-2.8-1.9-4.4-3.4-5.8-1.5-1.3-3.1-2.1-5.4-2.7 2.3-.6 3.9-1.3 5.4-2.7 1.5-1.4 2.4-3 3.4-5.8z"/></svg>'
$IcoChalice = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10"/><path d="M7.6 4c0 4.4 1.3 7.6 4.4 7.6s4.4-3.2 4.4-7.6"/><path d="M12 11.6V19"/><path d="M8 19h8"/></svg>'
$IcoQuill = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l4.2-1 10-10a2 2 0 0 0-2.8-2.8l-10 10z"/><path d="M13 6l3 3"/><path d="M4 20l1-4.2"/></svg>'
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
  'blog.html'            = $IcoQuill
  'katesizm.html'        = $SmallCross
  'katolik-sureci.html'  = $IcoWay
  'kutsal-ayin.html'     = $IcoChalice
  'meseller.html'        = $IcoScroll
  'kutsal-kitap.html'    = $IcoBook
  'tesbih-duasi.html'    = $IcoBeads
  'ekler.html'           = $IcoPrayers
  'mucizeler.html'       = $IcoRadiance
  'azizler.html'         = $IcoStar
  'sss.html'             = $IcoAsk
  'kiliseler.html'       = $IcoPin
  'iletisim.html'        = $IcoMail
}
$MassIcons = @{
  gather   = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V11a7 7 0 0 1 14 0v10"/><path d="M4 21h16"/><circle cx="12" cy="9" r="1" fill="currentColor" stroke="none"/></svg>'
  book     = $IcoBook
  gifts    = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.4" cy="8" r="3.3"/><path d="M14.6 5h5"/><path d="M15.2 5c0 3.4 1 5.8 3.4 5.8s3.4-2.4 3.4-5.8" transform="translate(-1 0)"/><path d="M18.1 10.8V19"/><path d="M15 19h6.2"/></svg>'
  chalice  = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 5h10"/><path d="M7.6 5c0 4.4 1.3 7.6 4.4 7.6s4.4-3.2 4.4-7.6"/><path d="M12 12.6V19"/><path d="M8 19h8"/><path d="M4.6 3.4 6.4 5M19.4 3.4 17.6 5"/></svg>'
  host     = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14c2.4 3 5.6 4.4 8 4.4s5.6-1.4 8-4.4"/><circle cx="12" cy="7.6" r="3.4"/><path d="M12 5.6v.01M10.2 8.3h3.6"/></svg>'
  blessing = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M5 12H3M21 12h-2M6.5 6.5 5 5M19 5l-1.5 1.5M6.5 17.5 5 19M19 19l-1.5-1.5"/><circle cx="12" cy="12" r="3.4"/></svg>'
}
$IcoInfo = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9.2"/><path d="M12 11.2v5.4"/><circle cx="12" cy="7.6" r="1.15" fill="currentColor" stroke="none"/></svg>'

function Search-Form([string]$cls, [string]$id, [string]$placeholder) {
  return "<form class=`"search $cls`" role=`"search`" data-search action=`"katesizm.html`"><div class=`"search-field`">$IcoSearch" +
    "<label class=`"visually-hidden`" for=`"$id`">Özet$($Apos)te ara (Türkçe veya İngilizce, ya da soru numarası)</label>" +
    "<input id=`"$id`" type=`"search`" name=`"q`" placeholder=`"$placeholder`" autocomplete=`"off`" enterkeyhint=`"search`"></div>" +
    "<div class=`"search-results`" hidden></div></form>"
}
function Cur([string]$href, [string]$current) { if ($href -eq $current) { return ' aria-current="page"' }; return '' }
function Header-Html([string]$current) {
  $inPray = $PrayerPages -contains $current
  $prayCls = if ($inPray) { 'nav-link nav-trigger is-section' } else { 'nav-link nav-trigger' }
  $prayerMenu = ($PrayerNav | ForEach-Object {
    "<li><a href=`"$($_.href)`"$(Cur $_.href $current)><span class=`"nm-t`">$($_.t)</span><span class=`"nm-s`">$($_.s)</span></a></li>"
  }) -join ''
  $inKaynaklar = $KaynaklarPages -contains $current
  $kaynaklarCls = if ($inKaynaklar) { 'nav-link nav-trigger is-section' } else { 'nav-link nav-trigger' }
  $kaynaklarMenu = ($KaynaklarNav | ForEach-Object {
    "<li><a href=`"$($_.href)`"$(Cur $_.href $current)><span class=`"nm-t`">$($_.t)</span><span class=`"nm-s`">$($_.s)</span></a></li>"
  }) -join ''
  $sheetPray = ($PrayerNav | ForEach-Object {
    "<a class=`"ns-item ns-sub`" href=`"$($_.href)`"$(Cur $_.href $current)><span class=`"ns-ico`">$($NavIcons[$_.href])</span><span class=`"ns-body`"><span class=`"ns-t`">$($_.t)</span><span class=`"ns-s`">$($_.s)</span></span></a>"
  }) -join ''
  $sheetKaynaklar = ($KaynaklarNav | ForEach-Object {
    "<a class=`"ns-item ns-sub`" href=`"$($_.href)`"$(Cur $_.href $current)><span class=`"ns-ico`">$($NavIcons[$_.href])</span><span class=`"ns-body`"><span class=`"ns-t`">$($_.t)</span><span class=`"ns-s`">$($_.s)</span></span></a>"
  }) -join ''
  return @"
$Sprite
<a class="skip-link" href="#main">İçeriğe geç</a>
<header class="site-header">
  <div class="wrap">
    <div class="header-row">
      <div class="brand-group">
        <a class="brand" href="index.html"$(Cur 'index.html' $current)>$Logo<span class="brand-name">$SiteName</span></a>
        <button type="button" class="info-btn" aria-label="Bu site hakkında" aria-expanded="false" aria-controls="info-panel">$IcoInfo</button>
      </div>
      <nav class="mainnav" aria-label="Ana menü">
        <ul>
          <li><a class="nav-link" href="blog.html"$(Cur 'blog.html' $current)>Blog</a></li>
          <li class="has-menu">
            <button type="button" class="$kaynaklarCls" aria-expanded="false" aria-controls="nav-kaynaklar" aria-haspopup="true">Kaynaklar$IcoChev</button>
            <div class="nav-menu glass" id="nav-kaynaklar"><ul>$kaynaklarMenu</ul></div>
          </li>
          <li class="has-menu">
            <button type="button" class="$prayCls" aria-expanded="false" aria-controls="nav-dualar" aria-haspopup="true">Dualar$IcoChev</button>
            <div class="nav-menu glass" id="nav-dualar"><ul>$prayerMenu</ul></div>
          </li>
          <li><a class="nav-link" href="mucizeler.html"$(Cur 'mucizeler.html' $current)>Mucizeler</a></li>
          <li><a class="nav-link" href="azizler.html"$(Cur 'azizler.html' $current)>Azizler</a></li>
          <li><a class="nav-link" href="sss.html"$(Cur 'sss.html' $current)>Sorular</a></li>
          <li><a class="nav-link" href="iletisim.html"$(Cur 'iletisim.html' $current)>İletişim</a></li>
        </ul>
      </nav>
      <div class="header-tools">
        $ClockHtml
        <button type="button" class="fontsize-toggle" aria-label="Yazı boyutunu büyüt">$IcoTextSize<span>Aa</span></button>
        <button type="button" class="theme-toggle" role="switch" aria-checked="false" aria-label="Koyu temaya geç">$IcoSun$IcoMoon<span class="knob" aria-hidden="true"></span></button>
        <button type="button" class="icon-btn menu-toggle" aria-label="Menü" aria-expanded="false" aria-controls="navsheet">$IcoList</button>
      </div>
    </div>
  </div>
</header>
<div class="info-panel glass" id="info-panel" role="dialog" aria-label="Site hakkında" hidden><button type="button" class="info-close" aria-label="Kapat">$IcoClose</button><div class="info-inner">$InfoHtml</div></div>
<div class="navsheet" id="navsheet" hidden>
  <div class="navsheet-panel glass" role="dialog" aria-modal="true" aria-label="Menü">
    <button type="button" class="navsheet-grab" aria-label="Menüyü kapat"><span aria-hidden="true"></span></button>
    <div class="ns-head">$ClockHtml</div>
    <nav class="ns-nav" aria-label="Menü">
      <a class="ns-item" href="index.html"$(Cur 'index.html' $current)><span class="ns-ico">$IcoHome</span><span class="ns-body"><span class="ns-t">Ana Sayfa</span></span></a>
      <p class="ns-label">Blog</p>
      <a class="ns-item" href="blog.html"$(Cur 'blog.html' $current)><span class="ns-ico">$IcoQuill</span><span class="ns-body"><span class="ns-t">Blog</span><span class="ns-s">Özgün yazılar</span></span></a>
      <p class="ns-label">Kaynaklar</p>
      $sheetKaynaklar
      <p class="ns-label">Dualar</p>
      $sheetPray
      <p class="ns-label">Mucizeler</p>
      <a class="ns-item" href="mucizeler.html"$(Cur 'mucizeler.html' $current)><span class="ns-ico">$IcoRadiance</span><span class="ns-body"><span class="ns-t">Mucizeler</span><span class="ns-s">Görünmeler, kalıntılar, Efkaristiya mucizeleri</span></span></a>
      <p class="ns-label">Azizler</p>
      <a class="ns-item" href="azizler.html"$(Cur 'azizler.html' $current)><span class="ns-ico">$IcoStar</span><span class="ns-body"><span class="ns-t">Azizler</span><span class="ns-s">Ayin takviminin azizleri</span></span></a>
      <p class="ns-label">Sorular</p>
      <a class="ns-item" href="sss.html"$(Cur 'sss.html' $current)><span class="ns-ico">$IcoAsk</span><span class="ns-body"><span class="ns-t">Sorular</span><span class="ns-s">Sıkça sorulan sorular</span></span></a>
      <p class="ns-label">İletişim</p>
      <a class="ns-item" href="iletisim.html"$(Cur 'iletisim.html' $current)><span class="ns-ico">$IcoMail</span><span class="ns-body"><span class="ns-t">İletişim</span><span class="ns-s">Bana ulaşın</span></span></a>
      <button type="button" class="ns-item info-open" aria-controls="info-panel" aria-expanded="false"><span class="ns-ico">$IcoInfo</span><span class="ns-body"><span class="ns-t">Hakkında</span></span></button>
    </nav>
  </div>
</div>
"@
}
$footKatekizm = (@(@{ href = 'katesizm.html'; t = 'Katekizm' }) + $TextNav) | ForEach-Object { "<li><a href=`"$($_.href)`">$($_.t)</a></li>" }
$footKaynaklar = ($KaynaklarNav | Where-Object { $_.href -ne 'katesizm.html' }) | ForEach-Object { "<li><a href=`"$($_.href)`">$($_.t)</a></li>" }
$footDualar = $PrayerNav | ForEach-Object { "<li><a href=`"$($_.href)`">$($_.t)</a></li>" }
$FooterHtml = @"
<footer class="site-footer">
  <div class="wrap foot-grid">
    <div class="foot-about">
      <a class="foot-brand" href="index.html">$Logo<span>$SiteName</span></a>
      <p class="foot-tag">$SiteTag</p>
      <p class="foot-copy">Türkçe çeviriler ve özgün içerik © 2026 $SiteName</p>
      <p class="foot-copy"><a href="mailto:david@katolikdunyasi.com">david@katolikdunyasi.com</a></p>
    </div>
    <nav class="foot-sitemap" aria-label="Site haritası">
      <div class="foot-col"><p class="foot-label">Katekizm</p><ul>$($footKatekizm -join '')</ul></div>
      <div class="foot-col"><p class="foot-label">Kaynaklar</p><ul>$($footKaynaklar -join '')</ul></div>
      <div class="foot-col"><p class="foot-label">Dualar</p><ul>$($footDualar -join '')</ul></div>
      <div class="foot-col"><p class="foot-label">Diğer</p><ul><li><a href="blog.html">Blog</a></li><li><a href="mucizeler.html">Mucizeler</a></li><li><a href="azizler.html">Azizler</a></li><li><a href="sss.html">Sorular</a></li><li><a href="iletisim.html">İletişim</a></li><li><a href="erisilebilirlik.html">Erişilebilirlik</a></li><li><a href="gizlilik.html">Gizlilik Politikası</a></li></ul></div>
    </nav>
  </div>
</footer>
"@
$EmailObfEval = [System.Text.RegularExpressions.MatchEvaluator]{
  param($m)
  $classMatch = [regex]::Match($m.Groups[1].Value, 'class="([^"]*)"')
  $cls = if ($classMatch.Success) { "$($classMatch.Groups[1].Value) email-link" } else { 'email-link' }
  "<a class=`"$cls`" data-u=`"david`" data-d=`"katolikdunyasi.com`" href=`"#`">(e-posta için JavaScript gerekli)</a>"
}
function Write-Page {
  param([string]$File, [string]$Title, [string]$Description, [string]$Path, [string]$Body,
        [string[]]$JsonLd = @(), [string]$OgType = 'website',
        [string]$Robots = 'index,follow,max-snippet:-1,max-image-preview:large', [bool]$Canonical = $true, [bool]$RootRelative = $false)
  $url = "$SiteUrl/$Path"
  $ld = ($JsonLd | ForEach-Object { "<script type=`"application/ld+json`">$_</script>" }) -join "`n"
  $canon = if ($Canonical) { "<link rel=`"canonical`" href=`"$url`">" } else { '' }
  # Preload the latin-ext subset, not the base latin one: nearly every word of
  # Turkish body text carries a character in that range (ç, ğ, ı, ö, ş, ü, İ),
  # and it is also the largest of the four font files, so it is the one worth
  # a head start on the request over the wire.
  $preload = if (Test-Path (Join-Path $Root 'assets/fonts/eb-garamond-latin-ext.woff2')) { '<link rel="preload" href="assets/fonts/eb-garamond-latin-ext.woff2" as="font" type="font/woff2" crossorigin>' } else { '' }
  $rootAttr = if ($RootRelative) { ' data-root="/"' } else { '' }
  $html = @"
<!DOCTYPE html>
<html lang="tr"$rootAttr>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>$(Attr $Title)</title>
<meta name="description" content="$(Attr $Description)">
<meta name="robots" content="$Robots">
$canon
<meta name="theme-color" content="#f5f2ea">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta property="og:type" content="$OgType">
<meta property="og:locale" content="tr_TR">
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
<script>document.documentElement.setAttribute('data-theme','light');try{if(localStorage.getItem('kkio-theme')==='dark')document.documentElement.setAttribute('data-theme','dark');var fs=localStorage.getItem('kkio-fontsize');if(fs==='1'||fs==='2')document.documentElement.setAttribute('data-fontsize',fs)}catch(e){}</script>
$ld
<script src="assets/script.min.js?v=$JsVer" defer></script>
</head>
<body>
$(Header-Html $File)
<main id="main">
$Body
</main>
$FooterHtml
</body>
</html>
"@
  # 404.html is served for any missing URL (e.g. /a/b/c), so its links must start at the site root
  if ($RootRelative) { $html = [regex]::Replace($html, '(href|src)="(?!https?:|#|/|data:|mailto:)', '$1="/') }
  # The contact address is public on every page (footer) and a few others (İletişim, the About
  # panel, Erişilebilirlik, Gizlilik); catching it here once, after every page is assembled,
  # keeps it out of the raw HTML for basic scrapers without touching the markdown/build source
  # that writes it in plainly. JS reassembles the real mailto link on page load (see initEmail).
  $html = [regex]::Replace($html, '<a([^>]*)href="mailto:david@katolikdunyasi\.com"[^>]*>.*?</a>', $EmailObfEval)
  [IO.File]::WriteAllText((Join-Path $Root $File), $html, $Utf8)
  Write-Host "  + $File"
}
function Breadcrumb-Ld([string]$name, [string]$path, [string]$parentName = '', [string]$parentPath = '') {
  $items = '{"@type":"ListItem","position":1,"name":"Ana Sayfa","item":' + (JStr "$SiteUrl/") + '}'
  $pos = 2
  if ($parentName) {
    $items += ',{"@type":"ListItem","position":2,"name":' + (JStr $parentName) + ',"item":' + (JStr "$SiteUrl/$parentPath") + '}'
    $pos = 3
  }
  $items += ',{"@type":"ListItem","position":' + $pos + ',"name":' + (JStr $name) + ',"item":' + (JStr "$SiteUrl/$path") + '}'
  return '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[' + $items + ']}'
}
function Crumbs([string]$here, [string]$parentName = '', [string]$parentPath = '') {
  $mid = if ($parentName) { "<a href=`"$parentPath`">$parentName</a><span aria-hidden=`"true`">›</span>" } else { '' }
  return "<nav class=`"crumbs`" aria-label=`"Konum`"><a href=`"index.html`">Ana Sayfa</a><span aria-hidden=`"true`">›</span>$mid<span aria-current=`"page`">$here</span></nav>"
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
  -Description (Meta-Trim "Katolik Kilisesi Katekizmi Özeti$($Apos)nin (Compendium) Türkçe çevirisi: iman, kutsal sırlar, Hristiyan ahlakı ve dua üzerine 598 soru ve yanıt, İngilizce aslıyla birlikte.") `
  -Path 'katesizm.html' -Body $katesizmBody -JsonLd @($bookLd, (Breadcrumb-Ld 'Katekizm' 'katesizm.html'))

# ---------------- index.html: the site hub
$latestPost = $Blog.posts[0]
$latestDateShort = $latestPost.dateLabel -replace '\s+\d{4}$', ''
$NotifIcon = '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="currentColor">' + $CrossShapes + '</g></svg>'
$homeBody = @"
<div class="wrap narrow">

  <section class="home-hero">
    <div class="glow"></div>
    $Logo
    <h1>$SiteTag</h1>
    <p class="lead">Katekizm, Katolik olma süreci, Kutsal Ayin, İsa$($Apos)nın meselleri, günlük dualar, azizlerin hayat hikâyeleri, mucizeler ve özgün yazılar: hepsi Türkçe, tek bir sitede.</p>
    <a class="notif-banner" href="$($latestPost.id).html">
      <span class="notif-icon">$NotifIcon</span>
      <span class="notif-body">
        <span class="notif-top"><span class="notif-app">Son Blog Yazısı</span><span class="notif-time">$latestDateShort</span></span>
        <span class="notif-title">$($latestPost.titleEn)</span>
        <span class="notif-text">$(Inline $latestPost.title)</span>
      </span>
    </a>
    <div class="today-pills">
      <a class="today-pill" href="azizler.html" data-home-saint-pill><span class="tp-ico">$IcoStar</span><span><span class="tp-label">Bugünün Azizi</span><span class="tp-value hint" aria-live="polite">Yükleniyor…</span></span></a>
      <a class="today-pill" href="tesbih-duasi.html" data-home-mystery-pill><span class="tp-ico">$IcoBeads</span><span><span class="tp-label">Bugünün Gizemi</span><span class="tp-value hint" aria-live="polite">Yükleniyor…</span></span></a>
    </div>
  </section>

  <div class="kso" id="home-katekizm-search" hidden>
    <div class="kso-backdrop" data-kso-close></div>
    <div class="kso-panel" role="dialog" aria-modal="true" aria-label="Katekizm$($Apos)de ara">
      <button type="button" class="kso-close" aria-label="Kapat" data-kso-close>$IcoClose</button>
      $(Search-Form 'kso-search' 'q-home-katekizm' "Katekizm$($Apos)de ara: Türkçe, İngilizce ya da soru numarası")
    </div>
  </div>

  <section class="lib-section">
    <div class="lib-head"><span class="roman">I</span><h2>Öğretiler</h2></div>
    <p class="lib-lead">Kilise$($Apos)nin resmî öğretisi: Katekizm$($Apos)in tam çevirisi, Katolik olma süreci ve hangi Kutsal Kitap çevirisini seçmeli sorusuna kısa bir rehber.</p>
    <div class="shelf cols-4">
      <div class="hub-card katekizm-card">
        <span class="hub-head">
          <span class="hub-ico">$SmallCross</span>
          <span class="hub-t">Katekizm<button type="button" class="card-search-btn" aria-label="Katekizm$($Apos)de ara" aria-haspopup="dialog" aria-expanded="false" aria-controls="home-katekizm-search">$IcoSearch</button></span>
        </span>
        <span class="hub-s">İman, kutsal sırlar, ahlak ve dua üzerine 598 soru ve yanıt.</span>
        <a class="hub-go" href="katesizm.html">Sayfaya Git$IcoNext</a>
      </div>
      <a class="hub-card" href="katolik-sureci.html">
        <span class="hub-head"><span class="hub-ico">$IcoWay</span><span class="hub-t">Katolik Süreci</span></span>
        <span class="hub-s">Katolik olmak isteyenler için OCIA süreci, adım adım.</span>
        <span class="hub-go">Sayfaya Git$IcoNext</span>
      </a>
      <a class="hub-card" href="kutsal-kitap.html">
        <span class="hub-head"><span class="hub-ico">$IcoBook</span><span class="hub-t">Kutsal Kitap</span></span>
        <span class="hub-s">$($KkMeta.short)</span>
        <span class="hub-go">Sayfaya Git$IcoNext</span>
      </a>
      <a class="hub-card" href="sss.html">
        <span class="hub-head"><span class="hub-ico">$IcoAsk</span><span class="hub-t">Sorular</span></span>
        <span class="hub-s">Katolik inancı üzerine en sık sorulan sorular.</span>
        <span class="hub-go">Sayfaya Git$IcoNext</span>
      </a>
    </div>
  </section>

  <section class="lib-section">
    <div class="lib-head"><span class="roman">II</span><h2>Yaşam ve Dua</h2></div>
    <p class="lib-lead">Ayine katılmaktan Meryem Ana Tesbihi$($Apos)ne, Mesih İsa$($Apos)nın mesellerinden günlük dualara: imanın günlük pratiği.</p>
    <div class="shelf cols-3">
      <a class="hub-card" href="kutsal-ayin.html">
        <span class="hub-head"><span class="hub-ico">$IcoChalice</span><span class="hub-t">Kutsal Ayin</span></span>
        <span class="hub-s">Ayinin sırası, toplanmadan son takdise altı bölüm.</span>
        <span class="hub-go">Sayfaya Git$IcoNext</span>
      </a>
      <a class="hub-card" href="meseller.html">
        <span class="hub-head"><span class="hub-ico">$IcoScroll</span><span class="hub-t">İsa$($Apos)nın Meselleri</span></span>
        <span class="hub-s">Otuz iki mesel, düz bir dille açıklanmış.</span>
        <span class="hub-go">Sayfaya Git$IcoNext</span>
      </a>
      <a class="hub-card" href="tesbih-duasi.html">
        <span class="hub-head"><span class="hub-ico">$IcoBeads</span><span class="hub-t">Tesbih Duası</span></span>
        <span class="hub-s">Duaların Türkçesi ve İngilizcesi, bütün gizemleriyle.</span>
        <span class="hub-go">Sayfaya Git$IcoNext</span>
      </a>
      <a class="hub-card" href="ekler.html">
        <span class="hub-head"><span class="hub-ico">$IcoPrayers</span><span class="hub-t">Sık Kullanılan Dualar</span></span>
        <span class="hub-s">Günlük dualar ve formüller, tek sayfada.</span>
        <span class="hub-go">Sayfaya Git$IcoNext</span>
      </a>
      <a class="hub-card" href="kiliseler.html">
        <span class="hub-head"><span class="hub-ico">$IcoPin</span><span class="hub-t">Kilise Bul</span></span>
        <span class="hub-s">Türkiye$($Apos)de ayine gidebileceğiniz kiliseler, şehir şehir.</span>
        <span class="hub-go">Sayfaya Git$IcoNext</span>
      </a>
    </div>
  </section>

  <section class="lib-section">
    <div class="lib-head"><span class="roman">III</span><h2>Azizler ve Mucizeler</h2></div>
    <p class="lib-lead">Yılın her günü için bir aziz, Kilise tarihinin görünmeleri, kalıntıları ve Efkaristiya mucizeleri.</p>
    <div class="shelf cols-2">
      <a class="hub-card" href="azizler.html">
        <span class="hub-head"><span class="hub-ico">$IcoStar</span><span class="hub-t">Azizler</span></span>
        <span class="hub-s">Bugünün azizini görün, yılın her günü için hayat hikâyeleri.</span>
        <span class="hub-go">Sayfaya Git$IcoNext</span>
      </a>
      <a class="hub-card" href="mucizeler.html">
        <span class="hub-head"><span class="hub-ico">$IcoRadiance</span><span class="hub-t">Mucizeler</span></span>
        <span class="hub-s">Meryem Ana görünmeleri, Torino Kefeni, Efkaristiya mucizeleri ve çürümeyen azizlerin öyküleri.</span>
        <span class="hub-go">Sayfaya Git$IcoNext</span>
      </a>
    </div>
  </section>

  <section class="lib-section">
    <div class="lib-head"><span class="roman">IV</span><h2>Blog</h2></div>
    <p class="lib-lead">Katolik inancı üzerine kişisel yazılar, İngilizce aslı ve Türkçe çevirisiyle bir arada.</p>
    <div class="shelf posts cols-2">
$(($Blog.posts | Select-Object -First 2 | ForEach-Object { "      <a class=`"mini-post`" href=`"$($_.id).html`"><span class=`"mp-date`">$($_.dateLabel)</span><span class=`"mp-title`">$($_.titleEn)</span><span class=`"mp-sub`">$(Inline $_.title)</span></a>" }) -join "`n")
    </div>
  </section>

</div>
"@
$webSiteLd = '{"@context":"https://schema.org","@type":"WebSite","name":' + (JStr $SiteName) +
  ',"url":' + (JStr "$SiteUrl/") + ',"inLanguage":"tr","description":' + (JStr $SiteTag) +
  ',"potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":' +
  (JStr "$SiteUrl/katesizm.html?q={search_term_string}") + '},"query-input":"required name=search_term_string"}}'
Write-Page -File 'index.html' -Title "$SiteName | $SiteTag" `
  -Description "Türkçe Katolik Portalı: Katolik Kilisesi Katekizmi Özeti$($Apos)nin tam çevirisi ve Katolik inancı üzerine sıkça sorulan sorular." `
  -Path '' -Body $homeBody -JsonLd @($webSiteLd)

# ================================================================== ARTICLE PAGES: Motu Proprio, Giriş (Turkish paragraph + English original on demand)
function Parallel-Paragraphs($trList, $enList) {
  $tr = @($trList); $en = @($enList); $sb = New-Object Text.StringBuilder
  for ($k = 0; $k -lt $tr.Count; $k++) {
    [void]$sb.Append("<p>$(Inline $tr[$k])</p>")
    if ($k -lt $en.Count) { [void]$sb.Append("<div class=`"en-block en-par`" lang=`"en`" hidden><p>$(Inline $en[$k])</p></div>") }
  }
  return $sb.ToString()
}
function Article-Page([string]$file, [string]$crumb, [string]$label, [string]$h1, [string]$sub, [string]$bodyHtml, [string]$desc, [string]$ld) {
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
  Write-Page -File $file -Title "$h1 | $SiteName" -Description $desc -Path $file -Body $body -JsonLd @($ld, (Breadcrumb-Ld $crumb $file 'Katekizm' 'katesizm.html')) -OgType 'article'
}
$mp = $X.motuProprio
$mpBody = "<p class=`"address`">$($mp.tr.address)</p><div class=`"en-block en-par`" lang=`"en`" hidden><p class=`"address`">$($mp.en.address)</p></div>" +
  (Parallel-Paragraphs $mp.tr.paragraphs $mp.en.paragraphs) +
  "<div class=`"signature`">$((($mp.tr.closing | ForEach-Object { "<p>$(Inline $_)</p>" }) -join ''))<div class=`"en-block en-par`" lang=`"en`" hidden>$((($mp.en.closing | ForEach-Object { "<p>$_</p>" }) -join ''))</div></div>"
$mpLd = '{"@context":"https://schema.org","@type":"Article","headline":' + (JStr "Motu Proprio: $($mp.tr.title)") + ',"inLanguage":"tr","datePublished":"2005-06-28","author":{"@type":"Person","name":"Papa XVI. Benediktus"},"publisher":{"@type":"Organization","name":"Libreria Editrice Vaticana"},"mainEntityOfPage":' + (JStr "$SiteUrl/motu-proprio.html") + '}'
Article-Page 'motu-proprio.html' 'Motu Proprio' 'Motu Proprio' "Katolik Kilisesi Katekizmi Özeti$($Apos)nin Onaylanması ve Yayımlanması İçin Motu Proprio" `
  'Motu Proprio for the approval and publication of the Compendium of the Catechism of the Catholic Church' $mpBody `
  (Meta-Trim "Papa XVI. Benediktus$($Apos)un 28 Haziran 2005 tarihli Motu Proprio$($Apos)su: Katolik Kilisesi Katekizmi Özeti$($Apos)nin onaylanması ve yayımlanması. Türkçe çeviri ve İngilizce asıl metin.") $mpLd

$in = $X.introduction
$inBody = (Parallel-Paragraphs $in.tr.paragraphs $in.en.paragraphs) +
  "<div class=`"signature`">$((($in.tr.closing | ForEach-Object { "<p>$_</p>" }) -join ''))<div class=`"en-block en-par`" lang=`"en`" hidden>$((($in.en.closing | ForEach-Object { "<p>$_</p>" }) -join ''))</div></div>" +
  "<div class=`"footnotes`">$(Parallel-Paragraphs $in.tr.footnotes $in.en.footnotes)</div>"
$inLd = '{"@context":"https://schema.org","@type":"Article","headline":"Giriş","inLanguage":"tr","datePublished":"2005-03-20","author":{"@type":"Person","name":"Kardinal Joseph Ratzinger"},"mainEntityOfPage":' + (JStr "$SiteUrl/giris.html") + '}'
Article-Page 'giris.html' 'Giriş' 'Önsöz' 'Giriş' 'Introduction' $inBody `
  (Meta-Trim "Katolik Kilisesi Katekizmi Özeti$($Apos)nin Girişi (Kardinal Joseph Ratzinger, 2005): Özet$($Apos)in hazırlanışı, üç temel özelliği ve dört kısmı. Türkçe çeviri ve İngilizce asıl metin.") $inLd

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
Write-Page -File 'ekler.html' -Title "Ekler: Sık Kullanılan Dualar ve Katolik Öğretinin Formülleri | $SiteName" `
  -Description "Katolik Kilisesi Katekizmi Özeti Ekleri: Türkçe, İngilizce ve Latince sık kullanılan dualar ve Katolik öğretinin formülleri." `
  -Path 'ekler.html' -Body $eklerBody -JsonLd @((Breadcrumb-Ld 'Ekler' 'ekler.html' 'Katekizm' 'katesizm.html'))

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
        "<p class=`"faq-ref`" title=`"Katolik Kilisesi Katekizmi madde numaraları`">$($_.ccc)</p>" +
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
  <header class="page-head center"><p class="label">Sıkça Sorulan Sorular</p><h1>$(Inline $FaqData.title)</h1><p class="sub" lang="en">$($FaqData.en)</p></header>
  <p class="faq-intro">$(Inline $FaqData.intro)</p>
  <nav class="faq-toc" aria-label="Kategoriler"><ul>$faqToc</ul></nav>
$faqCats
</div>
"@
Write-Page -File 'sss.html' -Title "$($FaqData.title) | $SiteName" `
  -Description "Katolik Kilisesi hakkında sık sorulan sorular ve Katekizm$($Apos)e dayanan yanıtlar: Meryem ve azizlere saygı, Kutsal Üçlü, günah çıkarma, papalık, araf, evrim." `
  -Path 'sss.html' -Body $sssBody -JsonLd @($faqLd, (Breadcrumb-Ld 'Sıkça Sorulan Sorular' 'sss.html'))

# ================================================================== KUTSAL KITAP (kutsal-kitap.html)
$kkBody = @"
<div class="wrap narrow">
  $(Crumbs 'Kutsal Kitap')
  <header class="page-head center"><p class="label">Kutsal Kitap</p><h1>$($KkMeta.title)</h1><p class="sub">$($KkMeta.subtitle)</p></header>
  <div class="body prose">$(Convert-Markdown $Kk.body)</div>
</div>
"@
Write-Page -File 'kutsal-kitap.html' -Title "$($KkMeta.title) | $SiteName" -Description $KkMeta.description `
  -Path 'kutsal-kitap.html' -Body $kkBody -JsonLd @((Breadcrumb-Ld 'Kutsal Kitap' 'kutsal-kitap.html'))

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
  $(Crumbs 'Katolik Süreci')
  <header class="page-head center"><p class="label">Katolik Süreci</p><h1>$($Sureci.title)</h1><p class="sub" lang="en">$($Sureci.en)</p></header>
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
  <p class="conventions">Bu sayfadaki genel OCIA süreci evrensel bir Kilise düzenlemesidir (1972, Tanrısal Kült Cemaati); yukarıdaki bazı ayrıntılar (Paskalya Nöbeti dışında kabul, günah çıkarmanın zamanlaması gibi) ABD Katolik Episkoposlar Konferansı’nın Kateşümenlik İçin Ulusal Tüzüğü’nden (1986) alınmıştır. Kendi bölgenizdeki uygulama için en yakın cemaat kilisenize danışın.</p>
</div>
"@
Write-Page -File 'katolik-sureci.html' -Title "$($Sureci.title) | $SiteName" `
  -Description "Katolik olmak isteyenler için: OCIA/RCIA süreci nedir, vaftizli ve vaftizsiz adaylar için adım adım nasıl işler, hangi hazırlık gerekir." `
  -Path 'katolik-sureci.html' -Body $sureciBody -JsonLd @((Breadcrumb-Ld 'Katolik Süreci' 'katolik-sureci.html'))

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
$movableCardsHtml = ($Saints.movable | ForEach-Object {
  "<article class=`"movable-card`" data-movable=`"$($_.id)`" data-offset=`"$($_.offset)`"><h3>$(Inline $_.title)</h3><p class=`"m-rank label`">$($_.rank)<span class=`"m-date`" data-movable-date></span></p><div class=`"m-bio`">$(Blocks $_.bio)</div></article>"
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
  <nav class="month-pills" aria-label="Aylar" data-month-pills>$monthPillsHtml</nav>
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
  "<a href=`"#$($_.id)`" data-part-link=`"$($_.n)`" title=`"$(Attr $_.title)`">$($MassIcons[$_.icon])<span class=`"visually-hidden`">$($_.title)</span></a>"
}) -join ''
$massPartsHtml = ($Mass.parts | ForEach-Object {
  $p = $_
  $icon = $MassIcons[$p.icon]
  $trHtml = Mass-Lines $p.lines 'tr'
  $enHtml = Mass-Lines $p.lines 'en'
  "<section class=`"mass-part`" id=`"$($p.id)`" data-part=`"$($p.n)`">" +
    "<div class=`"mass-part-head`"><span class=`"mass-ico`">$icon</span><div><p class=`"mass-part-n label`">Bölüm $($p.n)</p><h2>$(Inline $p.title)</h2><p class=`"sub`" lang=`"en`">$($p.en)</p></div></div>" +
    "<p class=`"mass-lead`">$(Inline $p.lead)</p>" +
    "<div class=`"mass-dialogue`" data-tr>$trHtml</div>" +
    "<footer class=`"qa-foot end`">$(En-Toggle "en-$($p.id)")</footer>" +
    "<div class=`"en-block mass-dialogue`" id=`"en-$($p.id)`" lang=`"en`" hidden>$enHtml</div>" +
  "</section>"
}) -join "`n"
$massBody = @"
<div class="wrap narrow">
  $(Crumbs 'Kutsal Ayin')
  <header class="page-head center"><p class="label">Kaynaklar</p><h1>$($Mass.title)</h1><p class="sub" lang="en">$($Mass.en)</p></header>
  <p class="faq-intro">$(Inline $Mass.intro)</p>
  <nav class="mass-pills" aria-label="Ayinin bölümleri" data-mass-pills>$massPillsHtml</nav>
  <div class="mass-parts" data-mass-parts>
$massPartsHtml
  </div>
</div>
"@
Write-Page -File 'kutsal-ayin.html' -Title "$($Mass.title) | $SiteName" `
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
  <header class="page-head center"><p class="label">Kaynaklar</p><h1>$($Parables.title)</h1><p class="sub" lang="en">$($Parables.en)</p></header>
  <p class="faq-intro">$(Inline $Parables.intro)</p>
  <nav class="faq-toc" aria-label="Kategoriler"><ul>$meselToc</ul></nav>
$meselCats
</div>
"@
Write-Page -File 'meseller.html' -Title "$($Parables.title) | $SiteName" `
  -Description "Mesih İsa$($Apos)nın İnciller$($Apos)deki başlıca meselleri: kısaca yeniden anlatılmış ve konularına göre bölümlere ayrılmış, düz bir dille açıklanmış otuz ikisi bir arada." `
  -Path 'meseller.html' -Body $meselBody -JsonLd @((Breadcrumb-Ld $MeselTitle 'meseller.html'))

# ================================================================== TESBIH DUASI (tesbih-duasi.html)
# A static, numbered diagram of the bead ring (no hover/click state at all, so it works the
# same way on every device) plus the prayers as collapsible cards, grouped into the order
# they are actually said: opening, the five decades (each ending in the Fatima Prayer), close.
$cx = 180.0; $cy = 372.0; $rr = 138.0
function DiagBead([double]$x, [double]$y, [string]$kind) {
  $cls = if ($kind -eq 'lg') { 'bead lg' } else { 'bead sm' }
  $rad = if ($kind -eq 'lg') { '8.5' } else { '5.6' }
  return "<circle class=`"$cls`" cx=`"$x`" cy=`"$y`" r=`"$rad`"></circle>"
}
function Callout([double]$x, [double]$y, [int]$n) {
  return "<g class=`"callout`"><circle cx=`"$x`" cy=`"$y`" r=`"9.5`"></circle><text x=`"$x`" y=`"$y`" dy=`".34em`" text-anchor=`"middle`">$n</text></g>"
}
$pend = (DiagBead 180 100 'lg') + ((175, 152, 129 | ForEach-Object { DiagBead 180 $_ 'sm' }) -join '') + (DiagBead 180 200 'lg')
$ring = ""
for ($i = 0; $i -lt 55; $i++) {
  $ang = (-90.0 + (($i + 1) * 360.0 / 56.0)) * [Math]::PI / 180.0
  $x = [Math]::Round($cx + $rr * [Math]::Cos($ang), 1)
  $y = [Math]::Round($cy + $rr * [Math]::Sin($ang), 1)
  $isBig = ($i % 11) -eq 0
  $ring += DiagBead $x $y ($(if ($isBig) { 'lg' } else { 'sm' }))
}
# Callout 5 sits on the ring's second large bead (i=11), well clear of the medal at the top.
$decadeAng = (-90.0 + (12 * 360.0 / 56.0)) * [Math]::PI / 180.0
$decadeX = [Math]::Round($cx + $rr * [Math]::Cos($decadeAng), 1)
$decadeY = [Math]::Round($cy + $rr * [Math]::Sin($decadeAng), 1)
$diagSvg = '<svg class="rosary" viewBox="0 0 360 560" role="img" aria-label="Tesbihin duaları, numaralandırılmış şema">' +
  '<circle class="ring-guide" cx="180" cy="372" r="138"></circle>' +
  '<path class="ring-guide" d="M180 100 V 234"></path>' +
  '<rect class="bead cross" x="172" y="28" width="16" height="62" rx="3"></rect>' +
  '<rect class="bead cross" x="152" y="46" width="56" height="16" rx="3"></rect>' +
  $pend +
  '<circle class="bead medal" cx="180" cy="234" r="10"></circle>' +
  $ring +
  (Callout 180 59 1) + (Callout 180 100 2) + (Callout 180 152 3) + (Callout 180 200 4) + (Callout $decadeX $decadeY 5) + (Callout 180 234 6) +
  '</svg>'
$rosaryLegendText = @(
  "Haç: Haç İşareti, ardından İman Açıklaması."
  "İlk büyük tane: Göklerdeki Pederimiz."
  "Üç küçük tane: Selam Sana Meryem (üç kez)."
  "Sıradaki büyük tane: Peder$($Apos)e Şan."
  "Halka üzerindeki her onluk (beş kez): büyük tane – Göklerdeki Pederimiz; on küçük tane – Selam Sana Meryem (on kez); ardından Peder$($Apos)e Şan ve Fatima Duası."
  "Madalyonda: Selam Sana Kraliçe, Tesbihi Bitiren Dua ve Haç İşareti ile bitirin."
)
$rosaryLegendHtml = ((1..$rosaryLegendText.Count) | ForEach-Object {
  "<li><span class=`"ln`">$_</span>$($rosaryLegendText[$_ - 1])</li>"
}) -join ''

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
function Pray-Inner($p, [string]$idSuffix) {
  $enId = "en-$idSuffix"
  return "<p class=`"p-note`">$(Inline $p.note)</p>" +
    "<div class=`"p-tr`">$(Verse $p.tr.text)</div>" +
    "$(En-Toggle $enId)" +
    "<div class=`"en-block p-en`" id=`"$enId`" lang=`"en`" hidden><span class=`"label`">$($p.en.title)</span>$(Verse $p.en.text)</div>"
}
function Pray-Card($p, [string]$idSuffix, [string]$count) {
  $countHtml = if ($count) { "<span class=`"pray-count`">$count</span>" } else { '' }
  return "<details class=`"pray-card`" id=`"$idSuffix`"><summary><span class=`"pray-name`">$(Inline $p.tr.title)</span>$countHtml$IcoChevLg</summary>" +
    "<div class=`"pray-card-body`">$(Pray-Inner $p $idSuffix)</div></details>"
}
function Pray-Sub($p, [string]$idSuffix, [string]$count) {
  $countHtml = if ($count) { "<span class=`"pray-count`">$count</span>" } else { '' }
  return "<div class=`"pray-sub`"><h4>$(Inline $p.tr.title)$countHtml</h4>$(Pray-Inner $p $idSuffix)</div>"
}
$girisCards =
  (Pray-Card $PrayerById['hac-isareti'] 'giris-hac' $null) +
  (Pray-Card $PrayerById['iman-aciklamasi'] 'giris-iman' $null) +
  (Pray-Card $PrayerById['goklerdeki-pederimiz'] 'giris-pederimiz' $null) +
  (Pray-Card $PrayerById['selam-sana-meryem'] 'giris-selam' '× 3') +
  (Pray-Card $PrayerById['pedere-san'] 'giris-san' $null)
$gizemNames = 'Birinci', 'İkinci', 'Üçüncü', 'Dördüncü', 'Beşinci'
$gizemCards = (1..5 | ForEach-Object {
  $n = $_; $ad = $gizemNames[$n - 1]
  $body =
    (Pray-Sub $PrayerById['goklerdeki-pederimiz'] "gizem-$n-pederimiz" $null) +
    (Pray-Sub $PrayerById['selam-sana-meryem'] "gizem-$n-selam" '× 10') +
    (Pray-Sub $PrayerById['pedere-san'] "gizem-$n-san" $null) +
    (Pray-Sub $PrayerById['fatima-duasi'] "gizem-$n-fatima" $null)
  "<details class=`"pray-card`" id=`"gizem-$n`"><summary><span class=`"pray-name`">$ad Gizem</span><span class=`"pray-hint`">Peder$($Apos)imiz · 10 Selam Sana Meryem · Peder$($Apos)e Şan · Fatima Duası</span>$IcoChevLg</summary>" +
    "<div class=`"pray-card-body`">$body</div></details>"
}) -join "`n"
$kapanisCards =
  (Pray-Card $PrayerById['selam-sana-kralice'] 'kapanis-kralice' $null) +
  (Pray-Card $PrayerById['bitiris-duasi'] 'kapanis-bitiris' $null) +
  (Pray-Card $PrayerById['hac-isareti'] 'kapanis-hac' $null)

$tespihBody = @"
<div class="wrap narrow">
  $(Crumbs 'Tesbih Duası')
  <header class="page-head center"><p class="label">Dualar</p><h1>$($Rosary.title)</h1><p class="sub" lang="en">$($Rosary.en)</p></header>
  <p class="faq-intro">$(Inline $Rosary.intro)</p>
  <h2 class="section-title" id="nasil">Tesbih nasıl dua edilir?</h2>
  <ol class="steps">$stepList</ol>
  <div class="rosary-figure">
    $diagSvg
    <ol class="rosary-legend">$rosaryLegendHtml</ol>
  </div>
  <h2 class="section-title" id="gizemler">Gizemler</h2>
  <div class="myst-grid">
$mysterySets
  </div>
  <h2 class="section-title" id="dualar">Dualar</h2>
  <p class="faq-intro">Tesbih duasında okunan bütün dualar, okundukları sıraya göre aşağıda yer alır. Her birini açmak için üzerine dokunun.</p>
  <h3 class="rosary-sub-title">Giriş</h3>
  <div class="pray-cards">$girisCards</div>
  <h3 class="rosary-sub-title">Gizemler (her biri için)</h3>
  <div class="pray-cards">
$gizemCards
  </div>
  <h3 class="rosary-sub-title">Kapanış Duaları</h3>
  <div class="pray-cards">$kapanisCards</div>
  <p class="conventions">Dua metinleri, İstanbul’daki Sant’Antuan (Aziz Antuan) Bazilikası’nda tesbih duası için kullanılan Türkçe gelenek esas alınarak düzenlenmiştir.</p>
</div>
"@
Write-Page -File 'tesbih-duasi.html' -Title "$($Rosary.title) | $SiteName" `
  -Description "Meryem Ana Tesbih Duası: duaların Türkçesi ve İngilizcesi, Sevinç, Işık, Acı ve Yücelik gizemleri ve tesbihin nasıl dua edileceği." `
  -Path 'tesbih-duasi.html' -Body $tespihBody -JsonLd @((Breadcrumb-Ld 'Tesbih Duası' 'tesbih-duasi.html'))

# ================================================================== BLOG (blog.html + one page per post)
# Each post keeps the English original ("en") shown by default, with a "Türkçe'ye çevir"
# button that swaps in the Turkish translation ("tr") — the reverse of the site's usual
# Turkish-first/English-toggle pattern, since these are the author's own English essays.
function Word-Count([string]$s) { return ([regex]::Matches($s, '\S+')).Count }
function Read-Minutes([string]$body, [string]$closing) {
  $words = Word-Count ($body + ' ' + $closing)
  return [Math]::Max(1, [Math]::Ceiling($words / 200.0))
}
function Post-Lang([string]$idSuffix, $post) {
  $enId = "post-en-$idSuffix"; $trId = "post-tr-$idSuffix"; $readId = "post-read-$idSuffix"
  $enMinutes = Read-Minutes $post.en.body $post.en.closing
  $trMinutes = Read-Minutes $post.tr.body $post.tr.closing
  $enParas = Convert-Markdown $post.en.body
  $trParas = Convert-Markdown $post.tr.body
  $enSign = ($post.en.signature | ForEach-Object { "<p>$_</p>" }) -join ''
  $trSign = ($post.tr.signature | ForEach-Object { "<p>$_</p>" }) -join ''
  $enClosing = if ($post.en.closing) { "<p class=`"post-closing`">$($post.en.closing)</p>" } else { '' }
  $trClosing = if ($post.tr.closing) { "<p class=`"post-closing`">$(Inline $post.tr.closing)</p>" } else { '' }
  $enBody = "<div class=`"post-body prose`" id=`"$enId`" lang=`"en`">$enParas$enClosing<div class=`"signature`">$enSign</div></div>"
  $trBody = "<div class=`"post-body prose`" id=`"$trId`" lang=`"tr`" hidden>$trParas$trClosing<div class=`"signature`">$trSign</div></div>"
  $toggle = "<div class=`"article-tools`"><button type=`"button`" class=`"btn lang-toggle`" data-show-en=`"$enId`" data-show-tr=`"$trId`" data-read-target=`"$readId`" data-read-en=`"$enMinutes dk okuma`" data-read-tr=`"$trMinutes dk okuma`" aria-pressed=`"false`">$IcoGlobe<span class=`"btn-label`">Türkçe$($Apos)ye çevir</span></button></div>"
  return [pscustomobject]@{ Html = "$toggle$enBody$trBody"; EnMinutes = $enMinutes; ReadId = $readId }
}
$blogCards = ($Blog.posts | ForEach-Object {
  $post = $_
  $mins = Read-Minutes $post.en.body $post.en.closing
  "<a class=`"text-link post-card`" href=`"$($post.id).html`"><span class=`"post-date label`">$($post.dateLabel) · $mins dk okuma</span><span class=`"t-title`" lang=`"en`">$($post.titleEn)</span><span class=`"t-sub`">$(Inline $post.title)</span><p class=`"post-excerpt`">$(Inline $post.excerpt)</p></a>"
}) -join "`n"
$blogBody = @"
<div class="wrap narrow">
  $(Crumbs 'Blog')
  <header class="page-head center"><p class="label">Blog</p><h1>Blog</h1><p class="sub" lang="en">Essays on the Catholic faith</p></header>
  <p class="faq-intro">Katolik inancı ve günlük hayatta imanla ilgili özgün yazılar. Yazarın kendi İngilizce metniyle birlikte, Türkçe çevirisi de bir tıkla açılır.</p>
  <div class="post-list">$blogCards</div>
</div>
"@
Write-Page -File 'blog.html' -Title "Blog | $SiteName" `
  -Description "Katolik inancı ve günlük yaşam üzerine özgün yazılar, İngilizce aslı ve Türkçe çevirisiyle bir arada." `
  -Path 'blog.html' -Body $blogBody -JsonLd @((Breadcrumb-Ld 'Blog' 'blog.html'))

$Blog.posts | ForEach-Object {
  $post = $_
  $postLang = Post-Lang $post.id $post
  $postBody = @"
<div class="read-progress" aria-hidden="true"><span class="bar"></span></div>
<div class="wrap narrow">
  $(Crumbs $post.title 'Blog' 'blog.html')
  <article class="article post" id="post">
    <header class="page-head center"><p class="label">$($post.dateLabel) · <span id="$($postLang.ReadId)">$($postLang.EnMinutes) dk okuma</span></p><h1 lang="en">$($post.titleEn)</h1><p class="sub">$(Inline $post.title)</p></header>
    $($postLang.Html)
  </article>
</div>
"@
  $postLd = '{"@context":"https://schema.org","@type":"Article","headline":' + (JStr $post.titleEn) + ',"inLanguage":"en","datePublished":"' + $post.date + '","author":{"@type":"Person","name":' + (JStr $post.author) + '},"mainEntityOfPage":' + (JStr "$SiteUrl/$($post.id).html") + '}'
  Write-Page -File "$($post.id).html" -Title "$($post.title) | $SiteName" `
    -Description (Meta-Trim $post.excerpt) -Path "$($post.id).html" -Body $postBody `
    -JsonLd @($postLd, (Breadcrumb-Ld $post.title "$($post.id).html" 'Blog' 'blog.html')) -OgType 'article'
}

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
    "<details class=`"mira-item`" id=`"$($_.id)`"><summary><span class=`"mira-ico`">$icon</span><span class=`"mira-head`"><span class=`"mira-name`">$(Inline $_.name)</span><span class=`"mira-place label`">$($_.place)</span></span>$IcoChevLg</summary><div class=`"mira-bio`">$(Blocks $_.bio)</div></details>"
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
  <header class="page-head center"><p class="label">Mucizeler</p><h1>$($Miracles.title)</h1><p class="sub" lang="en">$($Miracles.en)</p></header>
  <p class="faq-intro">$(Inline $Miracles.intro)</p>
  <nav class="faq-toc" aria-label="Kategoriler"><ul>$miraToc</ul></nav>
$miraCats
</div>
"@
Write-Page -File 'mucizeler.html' -Title "Mucizeler | $SiteName" `
  -Description "Katolik Kilisesi$($Apos)nde bilinen mucizeler: Meryem Ana görünmeleri (Fatima, Lourdes, Guadalupe, Zeytun), Torino Kefeni, Efkaristiya mucizeleri ve çürümeyen azizler." `
  -Path 'mucizeler.html' -Body $mucizelerBody -JsonLd @((Breadcrumb-Ld 'Mucizeler' 'mucizeler.html'))

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
$IcoChevDown = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9.5 12 15l6-5.5"/></svg>'
$IcoFlagEn = '<svg class="flag-en" viewBox="0 0 24 16" aria-hidden="true" focusable="false"><rect width="24" height="16" fill="#1a237e"/><path d="M0 0 24 16M24 0 0 16" stroke="#fff" stroke-width="3"/><path d="M0 0 24 16M24 0 0 16" stroke="#c8102e" stroke-width="1.2"/><path d="M12 0V16M0 8H24" stroke="#fff" stroke-width="5.4"/><path d="M12 0V16M0 8H24" stroke="#c8102e" stroke-width="2.6"/></svg>'
$IcoFlagTr = '<svg class="flag-tr" viewBox="0 0 24 16" aria-hidden="true" focusable="false"><rect width="24" height="16" fill="#e30a17"/><circle cx="9.6" cy="8" r="4.3" fill="#fff"/><circle cx="10.7" cy="8" r="3.5" fill="#e30a17"/><polygon fill="#fff" points="15.6,6.95 15.85,7.66 16.6,7.68 16.0,8.13 16.22,8.85 15.6,8.42 14.98,8.85 15.2,8.13 14.6,7.68 15.35,7.66"/></svg>'
$IcoChurch = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.6v3.1M10.6 4.1h2.8"/><path d="M5 10.8 12 6l7 4.8V21H5Z"/><path d="M9.6 21v-4.6a2.4 2.4 0 0 1 4.8 0V21"/></svg>'
$riteSelectOpts = ($Churches.rites | ForEach-Object { "<option value=`"$($_.id)`">$($_.tr) ($($_.en))</option>" }) -join ''
$riteFilterHtml = "<div class=`"rite-select-wrap`">" +
  "<select id=`"rite-select`" aria-label=`"Kilise türüne göre filtrele`"><option value=`"all`">Tüm Kiliseler (All Churches)</option>$riteSelectOpts</select>$IcoChevDown" +
"</div>"
$kiliselerToc = ($Churches.cities | ForEach-Object { "<li><a href=`"#$($_.id)`" data-city-link=`"$($_.id)`">$($_.name)</a></li>" }) -join ''
$kiliselerCities = ($Churches.cities | ForEach-Object {
  $city = $_
  $cards = ($city.churches | ForEach-Object {
    $rite = $RiteLabels[$_.rite]
    $mapQ = "$($_.name), $($_.district), $($city.name), Türkiye"
    $phoneRow = if ($_.phone) { "<p class=`"church-meta`">$IcoPhone $($_.phone)</p>" } else { '' }
    # Skip the address line entirely when the sourced data was only district-level (the address
    # field then just repeats "district, city", which the line above already shows).
    $addrRow = if ($_.address -ne "$($_.district), $($city.name)") { "<p class=`"church-meta church-address`">$(Inline $_.address)</p>" } else { '' }
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
      "<p class=`"church-actions`"><a class=`"btn`" href=`"$(Map-Url $mapQ)`" target=`"_blank`" rel=`"noopener`">Haritada Aç $IcoExternal</a>$siteLink</p>" +
    "</article>"
  }) -join "`n"
  $cityNames = (($city.churches | ForEach-Object { Inline $_.name }) -join ', ')
  "<details class=`"church-city`" id=`"$($city.id)`"><summary class=`"church-city-head`">" +
    "<span class=`"church-city-ico`">$IcoChurch</span>" +
    "<span class=`"church-city-body`"><span class=`"church-city-name`">$($city.name)</span><span class=`"church-city-names`">$cityNames</span></span>" +
    "<span class=`"church-city-more`">Tüm Liste <span class=`"en`" lang=`"en`">(Full List)</span> $IcoChevDown</span>" +
    "</summary>" +
    "<div class=`"church-list`">$cards</div></details>"
}) -join "`n"
$kiliselerBody = @"
<div class="wrap narrow">
  $(Crumbs 'Kilise Bul')
  <header class="page-head center"><p class="label">Kaynaklar</p><h1>$($Churches.title)</h1><p class="sub" lang="en">$($Churches.en)</p></header>
  <div class="kiliseler-intro">
    <div id="kiliseler-intro-tr">
      <p>$(Inline $Churches.intro)</p>
      <p>$(Inline $Churches.touristNote)</p>
    </div>
    <div id="kiliseler-intro-en" lang="en" hidden>
      <p>$(Inline $Churches.introEn)</p>
      <p>$(Inline $Churches.touristNoteEn)</p>
    </div>
    <button type="button" class="flag-toggle" data-show-en="kiliseler-intro-en" data-show-tr="kiliseler-intro-tr" aria-pressed="false">
      <span class="flag-show-en">$IcoFlagEn</span><span class="flag-show-tr" hidden>$IcoFlagTr</span>
    </button>
  </div>
  <nav class="faq-toc" aria-label="Şehirler"><ul>$kiliselerToc</ul></nav>
  $riteFilterHtml
$kiliselerCities
  <p class="conventions">$(Inline $Churches.note)</p>
  <div class="eucharist-note">
    <p><strong>Katolik kilisesi bulunamadığında:</strong> $(Inline $Churches.orthodoxNote)</p>
    <p lang="en"><strong>Where no Catholic church can be found:</strong> $(Inline $Churches.orthodoxNoteEn)</p>
  </div>
</div>
"@
Write-Page -File 'kiliseler.html' -Title "$($Churches.title) | $SiteName" `
  -Description "Türkiye$($Apos)deki etkin Katolik kiliselerinin listesi: Latin, Ermeni Katolik, Süryani Katolik ve Keldani Katolik cemaatleri, adres ve ayin saatleriyle." `
  -Path 'kiliseler.html' -Body $kiliselerBody -JsonLd @((Breadcrumb-Ld 'Kilise Bul' 'kiliseler.html'))

# ================================================================== ILETISIM (iletisim.html)
$iletisimBody = @"
<div class="wrap narrow">
  $(Crumbs 'İletişim')
  <header class="page-head center"><p class="label">Contact</p><h1>İletişim</h1></header>
  <div class="placeholder-page contact-page">
    $IcoMail
    <p class="placeholder-lead">Bize ulaşın</p>
    <p>Bu site, Toronto, Kanada$($Apos)da yaşayan David Erduran tarafından hazırlanıyor ve tek başına yürütülüyor. Bir çeviride hata fark ettiyseniz, eklenmesini istediğiniz bir konu, aziz ya da mucize varsa, ya da sadece merhaba demek isterseniz, aşağıdaki adresten yazabilirsiniz.</p>
    <p class="contact-email"><a class="btn" href="mailto:david@katolikdunyasi.com">david@katolikdunyasi.com</a></p>
    <p>Her mesajı okuyorum. Yoğunluğa göre yanıtım biraz gecikebilir, ama her geri bildirim için şimdiden teşekkür ederim.</p>
  </div>
</div>
"@
Write-Page -File 'iletisim.html' -Title "İletişim | $SiteName" `
  -Description "katolikdunyasi.com$($Apos)a nasıl ulaşabileceğiniz: çeviri düzeltmeleri, içerik önerileri ve sorularınız için e-posta adresi." `
  -Path 'iletisim.html' -Body $iletisimBody -JsonLd @((Breadcrumb-Ld 'İletişim' 'iletisim.html'))

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

# ================================================================== sitemap.xml & robots.txt
$pages = @(
  @{ p = ''; pr = '1.0' }, @{ p = 'katesizm.html'; pr = '0.9' },
  @{ p = 'iman-ikrari.html'; pr = '0.9' }, @{ p = 'kutsal-sirlar.html'; pr = '0.9' },
  @{ p = 'mesihte-yasam.html'; pr = '0.9' }, @{ p = 'hristiyan-duasi.html'; pr = '0.9' }, @{ p = 'ekler.html'; pr = '0.8' },
  @{ p = 'kutsal-kitap.html'; pr = '0.9' }, @{ p = 'tesbih-duasi.html'; pr = '0.9' }, @{ p = 'katolik-sureci.html'; pr = '0.9' },
  @{ p = 'azizler.html'; pr = '0.9' }, @{ p = 'kutsal-ayin.html'; pr = '0.9' },
  @{ p = 'sss.html'; pr = '0.9' }, @{ p = 'kiliseler.html'; pr = '0.7' }, @{ p = 'motu-proprio.html'; pr = '0.6' },
  @{ p = 'giris.html'; pr = '0.6' }, @{ p = 'blog.html'; pr = '0.5' }, @{ p = 'mucizeler.html'; pr = '0.7' },
  @{ p = 'iletisim.html'; pr = '0.4' }, @{ p = 'meseller.html'; pr = '0.9' }, @{ p = 'erisilebilirlik.html'; pr = '0.3' },
  @{ p = 'gizlilik.html'; pr = '0.3' }
) + ($Blog.posts | ForEach-Object { @{ p = "$($_.id).html"; pr = '0.6' } }) +
  ($GreatSaints.saints | ForEach-Object { @{ p = "$($_.id).html"; pr = '0.6' } })
$sm = '<?xml version="1.0" encoding="UTF-8"?>' + "`n" + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "`n" +
  (($pages | ForEach-Object { "  <url><loc>$SiteUrl/$($_.p)</loc><lastmod>$BuildDate</lastmod><changefreq>monthly</changefreq><priority>$($_.pr)</priority></url>" }) -join "`n") +
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
