<#
.SYNOPSIS
  Static page generator for "Katolik Kilisesi İnanç Esasları Özeti"
  (Turkish Compendium of the Catechism of the Catholic Church).

.DESCRIPTION
  Reads the single source of truth, data/compendium-1..4.js and data/extras.js,
  and writes crawlable static HTML pages (all Q&As pre-rendered for SEO), JSON-LD
  structured data (FAQPage, WebSite, Book, Article, BreadcrumbList), sitemap.xml
  and robots.txt into the site root.

  The generated files are committed, so the site works without running this.
  Run it only after editing data/ (or to set your real domain).
  No dependencies: Windows PowerShell 5.1 or PowerShell 7+ (Windows/macOS/Linux).
  Keep this file saved as UTF-8 WITH BOM so Windows PowerShell 5.1 reads the
  Turkish text correctly, and do not use typographic quote characters in string
  literals (PowerShell treats them as quotes); use &#8220; &#8221; &#8217; instead.

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
$Utf8 = New-Object System.Text.UTF8Encoding $false
$SiteName = 'Katolik Kilisesi İnanç Esasları Özeti'
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

# Page file, ordinal label and meta description per part (descriptions are for search engines only)
$PartMeta = @{
  1 = @{ file = 'iman-ikrari.html';     ord = 'Birinci Kısım';  roman = 'I';
         desc = "Katolik Kilisesi Katekizmi Özeti, Birinci Kısım: İman İkrarı. Vahiy, Kutsal Yazı, Kutsal Üçlü, İsa Mesih, Kutsal Ruh, Kilise, Meryem ve sonsuz yaşam üzerine 1–217. sorular." }
  2 = @{ file = 'kutsal-sirlar.html';   ord = 'İkinci Kısım';   roman = 'II';
         desc = "Katolik Kilisesi Katekizmi Özeti, İkinci Kısım: Hristiyan Gizeminin Kutlanması. Litürji ve yedi Kutsal Sır (Vaftiz, Konfirmasyon, Efkaristiya, Tövbe, Evlilik…) üzerine 218–356. sorular." }
  3 = @{ file = 'mesihte-yasam.html';   ord = 'Üçüncü Kısım';   roman = 'III';
         desc = "Katolik Kilisesi Katekizmi Özeti, Üçüncü Kısım: Mesih'te Yaşam. İnsan onuru, vicdan, erdemler, günah, lütuf ve On Emir üzerine 357–533. sorular." }
  4 = @{ file = 'hristiyan-duasi.html'; ord = 'Dördüncü Kısım'; roman = 'IV';
         desc = "Katolik Kilisesi Katekizmi Özeti, Dördüncü Kısım: Hristiyan Duası. Dua ve Rab'bin Duası (Göklerdeki Babamız) üzerine 534–598. sorular." }
}

# ------------------------------------------------------------------ helpers
$GlossRx = '\[\[([^|\]]+)\|([^\]]+)\]\]'
function Inline([string]$s) { if (-not $s) { return '' }; return [regex]::Replace($s, $GlossRx, '$1<span class="gloss" lang="en"> ($2)</span>') }
function Plain([string]$s)  { if (-not $s) { return '' }; $s = [regex]::Replace($s, $GlossRx, '$1 ($2)'); return (($s -replace '<[^>]+>', '') -replace '\s+', ' ').Trim() }
function Attr([string]$s)   { return ($s -replace '&', '&amp;' -replace '"', '&quot;' -replace '<', '&lt;' -replace '>', '&gt;') }
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
    "<div class=`"qa-a`">$(Blocks $it.tr.a)</div>$note" +
    "<footer class=`"qa-foot`"><span class=`"ccc`" title=`"Katolik Kilisesi Katekizmi madde numaraları`">KKK $($it.ccc)</span>$(En-Toggle "en-$n")</footer>" +
    "<div class=`"en-block`" id=`"en-$n`" lang=`"en`" hidden><span class=`"label`" lang=`"tr`">İngilizce aslı</span><p class=`"qa-q`">$(Inline $it.en.q)</p><div class=`"qa-a`">$(Blocks $it.en.a)</div><span class=`"ccc`">CCC $($it.ccc)</span></div>" +
    "</article>"
}
function Heading-Html($it, [int]$offset) {
  $tag = HTag ([int]$it.level + $offset)
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
      'heading' { if ($it.level -gt 1) { [void]$sb.Append((Heading-Html $it 0)) }; $current = [int]$it.level }
      'qa'      { [void]$sb.Append((Qa-Html $it ($current + 1))) }
      'quote'   { [void]$sb.Append((Quote-Html $it)) }
      'special' { [void]$sb.Append((Special-Html $it.ref ($current + 1))) }
    }
    [void]$sb.Append("`n")
  }
  return $sb.ToString()
}

# ------------------------------------------------------------------ page shell
$NavItems = @(
  @{ href = 'index.html';           t = 'Ana Sayfa' },
  @{ href = 'motu-proprio.html';    t = 'Motu Proprio' },
  @{ href = 'giris.html';           t = 'Giriş' },
  @{ href = 'iman-ikrari.html';     t = 'I. İman İkrarı' },
  @{ href = 'kutsal-sirlar.html';   t = 'II. Hristiyan Gizeminin Kutlanması' },
  @{ href = 'mesihte-yasam.html';   t = "III. Mesih'te Yaşam" },
  @{ href = 'hristiyan-duasi.html'; t = 'IV. Hristiyan Duası' },
  @{ href = 'ekler.html';           t = 'Ekler' },
  @{ href = 'hakkinda.html';        t = 'Hakkında' }
)
$ClockHtml = '<time class="clock" aria-label="Tarih ve saat"><span class="clock-date"></span><span class="clock-time">--:--:--</span></time>'

function Search-Form([string]$cls, [string]$id, [string]$placeholder) {
  return "<form class=`"search $cls`" role=`"search`" data-search action=`"index.html`"><div class=`"search-field`">$IcoSearch" +
    "<label class=`"visually-hidden`" for=`"$id`">Özet'te ara (Türkçe veya İngilizce, ya da soru numarası)</label>" +
    "<input id=`"$id`" type=`"search`" name=`"q`" placeholder=`"$placeholder`" autocomplete=`"off`" enterkeyhint=`"search`"></div>" +
    "<div class=`"search-results`" hidden></div></form>"
}
function Header-Html([bool]$withSearch) {
  $search = if ($withSearch) { Search-Form 'header-search' 'q-header' '598 soruda ara…' } else { '' }
  $toggle = if ($withSearch) { "<button type=`"button`" class=`"icon-btn search-toggle`" aria-label=`"Ara`" aria-expanded=`"false`">$IcoSearch</button>" } else { '' }
  $cls = if ($withSearch) { 'site-header has-search' } else { 'site-header' }
  return @"
$Sprite
<a class="skip-link" href="#main">İçeriğe geç</a>
<header class="$cls">
  <div class="wrap">
    <div class="header-row">
      <a class="brand" href="index.html">$Logo<span class="brand-name">$SiteName</span></a>
      $search
      <div class="header-tools">
        $ClockHtml
        $toggle
        <button type="button" class="theme-toggle" role="switch" aria-checked="false" aria-label="Koyu temaya geç">$IcoSun$IcoMoon<span class="knob" aria-hidden="true"></span></button>
      </div>
    </div>
    <div class="clock-row">$ClockHtml</div>
  </div>
</header>
"@
}
$FooterHtml = @"
<footer class="site-footer">
  <div class="wrap">
    <nav aria-label="Alt menü"><ul>$(($NavItems | ForEach-Object { "<li><a href=`"$($_.href)`">$($_.t)</a></li>" }) -join '')</ul></nav>
    <p><i lang="en">$SiteNameEn</i> (2005) metninin gayriresmî Türkçe çevirisidir. Resmî metin: <a href="https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_en.html" rel="noopener">vatican.va</a>. Özgün metin © 2005 Libreria Editrice Vaticana.</p>
    <p>Kutsal Kitap göndermeleri Katolik kanonuna (Deuterokanonik kitaplar dahil) ve kaynak metindeki Katolik ayet numaralandırmasına göre verilmiştir. Türkçede farklı yazılan özel adların İngilizcesi ilk geçtikleri yerde parantez içinde verilir; ör. Petrus <span class="gloss">(Peter)</span>. İsa <span class="gloss">(Jesus)</span> ve Meryem <span class="gloss">(Mary)</span> adları sık geçtiği için yinelenmez. KKK: Katolik Kilisesi Katekizmi madde numaraları.</p>
  </div>
</footer>
"@

function Write-Page {
  param([string]$File, [string]$Title, [string]$Description, [string]$Path, [string]$Body,
        [string[]]$JsonLd = @(), [string]$OgType = 'website', [bool]$HeaderSearch = $true,
        [string]$Robots = 'index,follow,max-snippet:-1,max-image-preview:large', [bool]$Canonical = $true, [bool]$RootRelative = $false)
  $url = "$SiteUrl/$Path"
  $ld = ($JsonLd | ForEach-Object { "<script type=`"application/ld+json`">$_</script>" }) -join "`n"
  $canon = if ($Canonical) { "<link rel=`"canonical`" href=`"$url`">" } else { '' }
  $preload = if (Test-Path (Join-Path $Root 'assets/fonts/eb-garamond-latin.woff2')) { '<link rel="preload" href="assets/fonts/eb-garamond-latin.woff2" as="font" type="font/woff2" crossorigin>' } else { '' }
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
<meta name="theme-color" content="#f5f2ea" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0c1322" media="(prefers-color-scheme: dark)">
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
<link rel="stylesheet" href="assets/styles.css">
<script>try{var t=localStorage.getItem('kkio-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
$ld
<script src="assets/script.js" defer></script>
</head>
<body>
$(Header-Html $HeaderSearch)
<main id="main">
$Body
</main>
$FooterHtml
</body>
</html>
"@
  # 404.html is served for any missing URL (e.g. /a/b/c), so its links must start at the site root
  if ($RootRelative) { $html = [regex]::Replace($html, '(href|src)="(?!https?:|#|/|data:|mailto:)', '$1="/') }
  [IO.File]::WriteAllText((Join-Path $Root $File), $html, $Utf8)
  Write-Host "  + $File"
}
function Breadcrumb-Ld([string]$name, [string]$path) {
  return '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[' +
    '{"@type":"ListItem","position":1,"name":"Ana Sayfa","item":' + (JStr "$SiteUrl/") + '},' +
    '{"@type":"ListItem","position":2,"name":' + (JStr $name) + ',"item":' + (JStr "$SiteUrl/$path") + '}]}'
}
function Crumbs([string]$here) { return "<nav class=`"crumbs`" aria-label=`"Konum`"><a href=`"index.html`">Ana Sayfa</a><span aria-hidden=`"true`">›</span><span aria-current=`"page`">$here</span></nav>" }

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
  $(Crumbs $meta.ord)
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
  $faq = '{"@context":"https://schema.org","@type":"FAQPage","inLanguage":"tr","name":' + (JStr "$($p.tr) - $SiteName") +
    ',"url":' + (JStr "$SiteUrl/$($meta.file)") + ',"mainEntity":[' + (($qas | ForEach-Object {
      '{"@type":"Question","name":' + (JStr "$($_.n). $(Plain $_.tr.q)") + ',"url":' + (JStr "$SiteUrl/$($meta.file)#soru-$($_.n)") +
      ',"acceptedAnswer":{"@type":"Answer","text":' + (JStr (Plain (($_.tr.a -split "`n") -join ' '))) + '}}'
    }) -join ',') + ']}'
  Write-Page -File $meta.file -Title "$($meta.ord): $($p.tr) (Sorular $($p.from)–$($p.to)) | $SiteName" -Description $meta.desc `
    -Path $meta.file -Body $body -JsonLd @($faq, (Breadcrumb-Ld $p.tr $meta.file)) -OgType 'article'
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
$SmallCross = '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="currentColor">' + $CrossShapes + '</g></svg>'
$homeBody = @"
<section class="hero wrap narrow">
  $Logo
  <h1>$SiteName</h1>
  <p class="subtitle" lang="en">$SiteNameEn</p>
  <p class="hint">Başlıklarını görmek için bir kısmı açın ya da bir soru arayın.</p>
  $(Search-Form 'hero-search' 'q-home' '598 soruda ara: Türkçe, İngilizce ya da soru numarası')
</section>
<div class="wrap narrow">
  <div class="parts">
$acc
  </div>
  <div class="ornament">$SmallCross</div>
  <div class="more-texts">
    <a class="text-link" href="motu-proprio.html"><span class="label">Önsöz</span><span class="t-title">Motu Proprio</span><span class="t-sub">XVI. Benediktus, 28 Haziran 2005</span></a>
    <a class="text-link" href="giris.html"><span class="label">Önsöz</span><span class="t-title">Giriş</span><span class="t-sub">Kardinal Joseph Ratzinger, 20 Mart 2005</span></a>
    <a class="text-link" href="ekler.html"><span class="label">Ekler</span><span class="t-title">Dualar ve Formüller</span><span class="t-sub">A. Sık Kullanılan Dualar · B. Katolik Öğretinin Formülleri</span></a>
  </div>
  <p class="about-link"><a href="hakkinda.html">Bu site hakkında</a></p>
</div>
"@
$webSiteLd = '{"@context":"https://schema.org","@type":"WebSite","name":' + (JStr $SiteName) + ',"alternateName":' + (JStr $SiteNameEn) +
  ',"url":' + (JStr "$SiteUrl/") + ',"inLanguage":"tr","potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":' +
  (JStr "$SiteUrl/?q={search_term_string}") + '},"query-input":"required name=search_term_string"}}'
$bookLd = '{"@context":"https://schema.org","@type":"Book","name":' + (JStr $SiteName) + ',"alternateName":' + (JStr "$SiteNameEn (Türkçe)") +
  ',"inLanguage":"tr","url":' + (JStr "$SiteUrl/") + ',"about":{"@type":"Thing","name":"Katolik Kilisesi"},' +
  '"translationOfWork":{"@type":"Book","name":' + (JStr $SiteNameEn) + ',"inLanguage":"en","datePublished":"2005-06-28","publisher":{"@type":"Organization","name":"Libreria Editrice Vaticana"}},' +
  '"hasPart":[' + (($Parts | ForEach-Object { '{"@type":"Chapter","name":' + (JStr $_.tr) + ',"url":' + (JStr "$SiteUrl/$($PartMeta[[int]$_.part].file)") + '}' }) -join ',') + ']}'
Write-Page -File 'index.html' -Title "$SiteName | Katolik Kilisesi Katekizmi Özeti, 598 Soru ve Yanıt" `
  -Description "Katolik Kilisesi Katekizmi Özeti'nin (Compendium) Türkçe çevirisi: iman, kutsal sırlar, Hristiyan ahlakı ve dua üzerine 598 soru ve yanıt, İngilizce aslıyla birlikte." `
  -Path '' -Body $homeBody -JsonLd @($webSiteLd, $bookLd) -HeaderSearch $false

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
  $(Crumbs $crumb)
  <article class="article" id="article">
    <header class="page-head center"><p class="label">$label</p><h1>$h1</h1><p class="sub" lang="en">$sub</p></header>
    <div class="article-tools"><button type="button" class="btn" data-en-all="article" aria-pressed="false">$IcoGlobe<span class="btn-label">İngilizce aslını göster</span></button></div>
    <div class="body">$bodyHtml</div>
  </article>
</div>
"@
  Write-Page -File $file -Title "$h1 | $SiteName" -Description $desc -Path $file -Body $body -JsonLd @($ld, (Breadcrumb-Ld $crumb $file)) -OgType 'article'
}
$mp = $X.motuProprio
$mpBody = "<p class=`"address`">$($mp.tr.address)</p><div class=`"en-block en-par`" lang=`"en`" hidden><p class=`"address`">$($mp.en.address)</p></div>" +
  (Parallel-Paragraphs $mp.tr.paragraphs $mp.en.paragraphs) +
  "<div class=`"signature`">$((($mp.tr.closing | ForEach-Object { "<p>$(Inline $_)</p>" }) -join ''))<div class=`"en-block en-par`" lang=`"en`" hidden>$((($mp.en.closing | ForEach-Object { "<p>$_</p>" }) -join ''))</div></div>"
$mpLd = '{"@context":"https://schema.org","@type":"Article","headline":' + (JStr "Motu Proprio: $($mp.tr.title)") + ',"inLanguage":"tr","datePublished":"2005-06-28","author":{"@type":"Person","name":"Papa XVI. Benediktus"},"publisher":{"@type":"Organization","name":"Libreria Editrice Vaticana"},"mainEntityOfPage":' + (JStr "$SiteUrl/motu-proprio.html") + '}'
Article-Page 'motu-proprio.html' 'Motu Proprio' 'Motu Proprio' "Katolik Kilisesi Katekizmi Özeti'nin Onaylanması ve Yayımlanması İçin Motu Proprio" `
  'Motu Proprio for the approval and publication of the Compendium of the Catechism of the Catholic Church' $mpBody `
  "Papa XVI. Benediktus'un 28 Haziran 2005 tarihli Motu Proprio'su: Katolik Kilisesi Katekizmi Özeti'nin onaylanması ve yayımlanması. Türkçe çeviri ve İngilizce asıl metin." $mpLd

$in = $X.introduction
$inBody = (Parallel-Paragraphs $in.tr.paragraphs $in.en.paragraphs) +
  "<div class=`"signature`">$((($in.tr.closing | ForEach-Object { "<p>$_</p>" }) -join ''))<div class=`"en-block en-par`" lang=`"en`" hidden>$((($in.en.closing | ForEach-Object { "<p>$_</p>" }) -join ''))</div></div>" +
  "<div class=`"footnotes`">$(Parallel-Paragraphs $in.tr.footnotes $in.en.footnotes)</div>"
$inLd = '{"@context":"https://schema.org","@type":"Article","headline":"Giriş","inLanguage":"tr","datePublished":"2005-03-20","author":{"@type":"Person","name":"Kardinal Joseph Ratzinger"},"mainEntityOfPage":' + (JStr "$SiteUrl/giris.html") + '}'
Article-Page 'giris.html' 'Giriş' 'Önsöz' 'Giriş' 'Introduction' $inBody `
  "Katolik Kilisesi Katekizmi Özeti'nin Girişi (Kardinal Joseph Ratzinger, 2005): Özet'in hazırlanışı, üç temel özelliği ve dört kısmı. Türkçe çeviri ve İngilizce asıl metin." $inLd

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
  $(Crumbs 'Ekler')
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
  -Description "Katolik Kilisesi Katekizmi Özeti Ekleri: Türkçe, İngilizce ve Latince dualar (Haç İşareti, Selam Sana Meryem, Rab'bin Meleği, Salve Regina, Magnificat, Te Deum, Tespih) ve Katolik öğretinin formülleri." `
  -Path 'ekler.html' -Body $eklerBody -JsonLd @((Breadcrumb-Ld 'Ekler' 'ekler.html'))

# ================================================================== ABOUT PAGE (hakkinda.html) from content/hakkinda.md
# Minimal, dependency-free Markdown: # and ## headings -> <h2> (the page title is the <h1>), ### -> <h3>,
# paragraphs, **bold**, *italic*, `code`,
# [links](https://...), - / 1. lists, > quotes, --- rules. Raw HTML is escaped (shown as text).
# Optional front matter at the top of the file:
#   ---
#   title: Hakkında
#   description: One sentence for search engines
#   ---
function Md-Inline([string]$s) {
  $s = $s -replace '&', '&amp;' -replace '<', '&lt;' -replace '>', '&gt;'
  $s = [regex]::Replace($s, '`([^`]+)`', '<code>$1</code>')
  $s = [regex]::Replace($s, '\[([^\]]+)\]\(([^)\s]+)\)', [Text.RegularExpressions.MatchEvaluator]{
    param($m) $u = $m.Groups[2].Value
    $rel = if ($u -match '^https?://') { ' rel="noopener"' } else { '' }
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
$aboutFile = Join-Path (Join-Path $Root 'content') 'hakkinda.md'
$aboutMd = if (Test-Path $aboutFile) { [IO.File]::ReadAllText($aboutFile, [Text.Encoding]::UTF8) } else { "# Hakkında`n`nBu sayfa henüz yazılmadı." }
$fm = @{}
$fmMatch = [regex]::Match($aboutMd, '^\uFEFF?\s*---\s*\r?\n([\s\S]*?)\r?\n---\s*(\r?\n|$)')
if ($fmMatch.Success) {
  foreach ($line in ($fmMatch.Groups[1].Value -split "`n")) { $kv = [regex]::Match($line, '^\s*([A-Za-z_]+)\s*:\s*(.*?)\s*$'); if ($kv.Success) { $fm[$kv.Groups[1].Value.ToLower()] = $kv.Groups[2].Value.Trim('"', "'") } }
  $aboutMd = $aboutMd.Substring($fmMatch.Length)
}
if (-not $fm['title']) {   # no front matter title: use the first "# Heading"
  $h1 = [regex]::Match($aboutMd, '(?m)^#\s+(.+?)\s*$')
  if ($h1.Success) { $fm['title'] = $h1.Groups[1].Value; $aboutMd = $aboutMd.Remove($h1.Index, $h1.Length) } else { $fm['title'] = 'Hakkında' }
}
$aboutTitle = $fm['title']
$aboutDesc = if ($fm['description']) { $fm['description'] } else { "$SiteName hakkında." }
$aboutSub = if ($fm['subtitle']) { "<p class=`"sub`">$(Md-Inline $fm['subtitle'])</p>" } else { '' }
$aboutBody = @"
<div class="wrap">
  $(Crumbs 'Hakkında')
  <article class="article">
    <header class="page-head center"><p class="label">Hakkında</p><h1>$(Md-Inline $aboutTitle)</h1>$aboutSub</header>
    <div class="body prose">$(Convert-Markdown $aboutMd)</div>
  </article>
</div>
"@
Write-Page -File 'hakkinda.html' -Title "$aboutTitle | $SiteName" -Description $aboutDesc -Path 'hakkinda.html' -Body $aboutBody `
  -JsonLd @((Breadcrumb-Ld 'Hakkında' 'hakkinda.html'))

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
  -Robots 'noindex' -Canonical $false -HeaderSearch $false -RootRelative $true

# ================================================================== sitemap.xml & robots.txt
$pages = @(
  @{ p = ''; pr = '1.0' }, @{ p = 'iman-ikrari.html'; pr = '0.9' }, @{ p = 'kutsal-sirlar.html'; pr = '0.9' },
  @{ p = 'mesihte-yasam.html'; pr = '0.9' }, @{ p = 'hristiyan-duasi.html'; pr = '0.9' }, @{ p = 'ekler.html'; pr = '0.8' },
  @{ p = 'motu-proprio.html'; pr = '0.6' }, @{ p = 'giris.html'; pr = '0.6' }, @{ p = 'hakkinda.html'; pr = '0.5' }
)
$sm = '<?xml version="1.0" encoding="UTF-8"?>' + "`n" + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "`n" +
  (($pages | ForEach-Object { "  <url><loc>$SiteUrl/$($_.p)</loc><lastmod>$BuildDate</lastmod><changefreq>monthly</changefreq><priority>$($_.pr)</priority></url>" }) -join "`n") +
  "`n</urlset>`n"
[IO.File]::WriteAllText((Join-Path $Root 'sitemap.xml'), $sm, $Utf8)
[IO.File]::WriteAllText((Join-Path $Root 'robots.txt'), "User-agent: *`nAllow: /`nDisallow: /tools/`n`nSitemap: $SiteUrl/sitemap.xml`n", $Utf8)
Write-Host "  + sitemap.xml, robots.txt"
Write-Host "Done."
