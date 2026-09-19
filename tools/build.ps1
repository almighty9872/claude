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
$Utf8 = New-Object System.Text.UTF8Encoding $false
# Turkish suffix apostrophe (U+2019). Built from its code point on purpose: PowerShell
# treats a typographic quote as a string delimiter, so it must not appear in a literal,
# and &#8217; is no use in text that Attr() escapes. Interpolate it as $Apos instead.
$Apos = [char]0x2019
# The site is the brand now; the Compendium is one work published on it.
$SiteName = 'katolikdunyasi.com'
$SiteTag = 'Türkçe Katolik kaynakları'
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

# Page file, ordinal label and meta description per part (descriptions are for search engines only)
$PartMeta = @{
  1 = @{ file = 'iman-ikrari.html';     ord = 'Birinci Kısım';  roman = 'I';
         desc = "Katolik Kilisesi Katekizmi Özeti, Birinci Kısım: İnanç Beyanı. Vahiy, Kutsal Yazı, Kutsal Üçlü, Mesih İsa, Kutsal Ruh, Kilise, Meryem ve ebedi hayat üzerine 1–217. sorular." }
  2 = @{ file = 'kutsal-sirlar.html';   ord = 'İkinci Kısım';   roman = 'II';
         desc = "Katolik Kilisesi Katekizmi Özeti, İkinci Kısım: Hristiyan Gizeminin Kutlanması. Litürji ve yedi Kutsal Sır (Vaftiz, Konfirmasyon, Efkaristiya, Tövbe, Evlilik…) üzerine 218–356. sorular." }
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
$WorkPages = @('katesizm.html') + ($TextNav | ForEach-Object { $_.href })
$PrayerPages = @($PrayerNav | ForEach-Object { $_.href })
$ClockHtml = '<time class="clock" aria-label="Tarih ve saat"><span class="clock-date"></span><span class="clock-time">--:--:--</span></time>'
$IcoBook = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.6C10.6 5.4 8.6 4.8 6 4.8H3.6v13.4H6c2.6 0 4.6.6 6 1.8 1.4-1.2 3.4-1.8 6-1.8h2.4V4.8H18c-2.6 0-4.6.6-6 1.8z"/><path d="M12 6.6v13.4"/></svg>'
$IcoBeads = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="14.6" r="6.4"/><circle cx="12" cy="5.2" r="1.5"/><path d="M12 6.7v1.5" stroke-linecap="round"/><path d="M10.4 3.3h3.2M12 1.7v3.2" stroke-linecap="round"/></svg>'
$IcoWay = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21c3-6 3-11 0-17"/><path d="M19 21c-3-6-3-11 0-17"/><path d="M9.5 15h5M9 10h6"/><circle cx="12" cy="4" r="1.4" fill="currentColor" stroke="none"/></svg>'
$IcoInfo = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9.2"/><path d="M12 11.2v5.4"/><circle cx="12" cy="7.6" r="1.15" fill="currentColor" stroke="none"/></svg>'

function Search-Form([string]$cls, [string]$id, [string]$placeholder) {
  return "<form class=`"search $cls`" role=`"search`" data-search action=`"katesizm.html`"><div class=`"search-field`">$IcoSearch" +
    "<label class=`"visually-hidden`" for=`"$id`">Özet$($Apos)te ara (Türkçe veya İngilizce, ya da soru numarası)</label>" +
    "<input id=`"$id`" type=`"search`" name=`"q`" placeholder=`"$placeholder`" autocomplete=`"off`" enterkeyhint=`"search`"></div>" +
    "<div class=`"search-results`" hidden></div></form>"
}
function Cur([string]$href, [string]$current) { if ($href -eq $current) { return ' aria-current="page"' }; return '' }
function Header-Html([bool]$withSearch, [string]$current) {
  $search = if ($withSearch) { Search-Form 'header-search' 'q-header' '598 soruda ara…' } else { '' }
  $toggle = if ($withSearch) { "<button type=`"button`" class=`"icon-btn search-toggle`" aria-label=`"Ara`" aria-expanded=`"false`">$IcoSearch</button>" } else { '' }
  $cls = if ($withSearch) { 'site-header has-search' } else { 'site-header' }
  $inWork = $WorkPages -contains $current
  $trigCls = if ($inWork) { 'nav-link nav-trigger is-section' } else { 'nav-link nav-trigger' }
  $textMenu = ($TextNav | ForEach-Object {
    "<li><a href=`"$($_.href)`"$(Cur $_.href $current)><span class=`"nm-t`">$($_.t)</span><span class=`"nm-s`">$($_.s)</span></a></li>"
  }) -join ''
  $inPray = $PrayerPages -contains $current
  $prayCls = if ($inPray) { 'nav-link nav-trigger is-section' } else { 'nav-link nav-trigger' }
  $prayerMenu = ($PrayerNav | ForEach-Object {
    "<li><a href=`"$($_.href)`"$(Cur $_.href $current)><span class=`"nm-t`">$($_.t)</span><span class=`"nm-s`">$($_.s)</span></a></li>"
  }) -join ''
  $sheetPray = ($PrayerNav | ForEach-Object {
    "<a class=`"ns-item ns-sub`" href=`"$($_.href)`"$(Cur $_.href $current)><span class=`"ns-t`">$($_.t)</span><span class=`"ns-s`">$($_.s)</span></a>"
  }) -join ''
  $sheetText = ($TextNav | ForEach-Object {
    "<a class=`"ns-item ns-sub`" href=`"$($_.href)`"$(Cur $_.href $current)><span class=`"ns-t`">$($_.t)</span><span class=`"ns-s`">$($_.s)</span></a>"
  }) -join ''
  return @"
$Sprite
<a class="skip-link" href="#main">İçeriğe geç</a>
<header class="$cls">
  <div class="wrap">
    <div class="header-row">
      <a class="brand" href="index.html"$(Cur 'index.html' $current)>$Logo<span class="brand-name">$SiteName</span></a>
      <nav class="mainnav" aria-label="Ana menü">
        <ul>
          <li class="has-menu">
            <a class="$trigCls" href="katesizm.html" aria-expanded="false" aria-controls="nav-katesizm">Katekizm$IcoChev</a>
            <div class="nav-menu glass" id="nav-katesizm"><ul>$textMenu</ul></div>
          </li>
          <li><a class="nav-link" href="kutsal-kitap.html"$(Cur 'kutsal-kitap.html' $current)>Kutsal Kitap</a></li>
          <li class="has-menu">
            <button type="button" class="$prayCls" aria-expanded="false" aria-controls="nav-dualar" aria-haspopup="true">Dualar$IcoChev</button>
            <div class="nav-menu glass" id="nav-dualar"><ul>$prayerMenu</ul></div>
          </li>
          <li><a class="nav-link" href="sss.html"$(Cur 'sss.html' $current)>Sorular</a></li>
          <li><a class="nav-link" href="katolik-sureci.html"$(Cur 'katolik-sureci.html' $current)>Katolik Süreci</a></li>
          <li><button type="button" class="info-btn" aria-label="Bu site hakkında" aria-expanded="false" aria-controls="info-panel">$IcoInfo</button></li>
        </ul>
      </nav>
      $search
      <div class="header-tools">
        $ClockHtml
        $toggle
        <button type="button" class="theme-toggle" role="switch" aria-checked="false" aria-label="Koyu temaya geç">$IcoSun$IcoMoon<span class="knob" aria-hidden="true"></span></button>
        <button type="button" class="icon-btn menu-toggle" aria-label="Menü" aria-expanded="false" aria-controls="navsheet">$IcoList</button>
      </div>
    </div>
  </div>
</header>
<div class="info-panel glass" id="info-panel" role="note" hidden><div class="info-inner">$InfoHtml</div></div>
<div class="navsheet" id="navsheet" hidden>
  <div class="navsheet-panel glass" role="dialog" aria-modal="true" aria-label="Menü">
    <button type="button" class="navsheet-grab" aria-label="Menüyü kapat"><span aria-hidden="true"></span></button>
    <nav class="ns-nav" aria-label="Menü">
      <a class="ns-item" href="index.html"$(Cur 'index.html' $current)><span class="ns-t">Ana Sayfa</span></a>
      <p class="ns-label">Katekizm</p>
      <a class="ns-item" href="katesizm.html"$(Cur 'katesizm.html' $current)><span class="ns-t">$WorkName</span><span class="ns-s">598 soru ve yanıt</span></a>
      $sheetText
      <p class="ns-label">Kutsal Kitap</p>
      <a class="ns-item" href="kutsal-kitap.html"$(Cur 'kutsal-kitap.html' $current)><span class="ns-t">Kutsal Kitap</span><span class="ns-s">Onaylı çeviriler</span></a>
      <p class="ns-label">Dualar</p>
      $sheetPray
      <p class="ns-label">Diğer</p>
      <a class="ns-item" href="sss.html"$(Cur 'sss.html' $current)><span class="ns-t">Sorular</span><span class="ns-s">Sıkça sorulan sorular</span></a>
      <a class="ns-item" href="katolik-sureci.html"$(Cur 'katolik-sureci.html' $current)><span class="ns-t">Katolik Süreci</span><span class="ns-s">Katolik olma süreci</span></a>
      <button type="button" class="ns-item ns-info" aria-controls="info-panel" aria-expanded="false"><span class="ns-t">Hakkında</span></button>
    </nav>
    <div class="ns-foot">$ClockHtml</div>
  </div>
</div>
"@
}
$FooterHtml = @"
<footer class="site-footer">
  <div class="wrap foot-row">
    <a class="foot-brand" href="index.html">$Logo<span>$SiteName</span></a>
    <p class="foot-line">$SiteTag · Özgün metin © 2005 Libreria Editrice Vaticana</p>
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
<meta name="theme-color" content="#f5f2ea">
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
<script>document.documentElement.setAttribute('data-theme','light');try{if(localStorage.getItem('kkio-theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}</script>
$ld
<script src="assets/script.js" defer></script>
</head>
<body>
$(Header-Html $HeaderSearch $File)
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
$SmallCross = '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="currentColor">' + $CrossShapes + '</g></svg>'
$IcoAsk = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.2"/><path d="M9.3 9.2a2.8 2.8 0 1 1 3.5 3.1c-.6.2-.9.7-.9 1.3v.6"/><circle cx="12" cy="17.2" r="1.05" fill="currentColor" stroke="none"/></svg>'

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
  <p class="conventions">Kutsal Kitap göndermeleri Katolik kanonuna (Deuterokanonik kitaplar dahil) ve kaynak metindeki Katolik ayet numaralandırmasına göre verilmiştir. Türkçede farklı yazılan özel adların İngilizcesi ilk geçtikleri yerde parantez içinde verilir; ör. Petrus <span class="gloss">(Peter)</span>. İsa <span class="gloss">(Jesus)</span> ve Meryem <span class="gloss">(Mary)</span> adları sık geçtiği için yinelenmez. KKK: Katolik Kilisesi Katekizmi madde numaraları.</p>
</div>
"@
$bookLd = '{"@context":"https://schema.org","@type":"Book","name":' + (JStr $WorkName) + ',"alternateName":' + (JStr "$SiteNameEn (Türkçe)") +
  ',"inLanguage":"tr","url":' + (JStr "$SiteUrl/katesizm.html") + ',"about":{"@type":"Thing","name":"Katolik Kilisesi"},' +
  '"translationOfWork":{"@type":"Book","name":' + (JStr $SiteNameEn) + ',"inLanguage":"en","datePublished":"2005-06-28","publisher":{"@type":"Organization","name":"Libreria Editrice Vaticana"}},' +
  '"hasPart":[' + (($Parts | ForEach-Object { '{"@type":"Chapter","name":' + (JStr $_.tr) + ',"url":' + (JStr "$SiteUrl/$($PartMeta[[int]$_.part].file)") + '}' }) -join ',') + ']}'
Write-Page -File 'katesizm.html' -Title "$WorkName | $SiteName" `
  -Description "Katolik Kilisesi Katekizmi Özeti$($Apos)nin (Compendium) Türkçe çevirisi: iman, kutsal sırlar, Hristiyan ahlakı ve dua üzerine 598 soru ve yanıt, İngilizce aslıyla birlikte." `
  -Path 'katesizm.html' -Body $katesizmBody -JsonLd @($bookLd, (Breadcrumb-Ld 'Katekizm' 'katesizm.html'))

# ---------------- index.html: the site hub
$homeBody = @"
<section class="hero wrap narrow home-hero">
  $Logo
</section>
<div class="wrap narrow">
  <div class="hub">
    <a class="hub-card" href="katesizm.html">
      <span class="hub-ico">$SmallCross</span>
      <span class="hub-t">Katekizm</span>
      <span class="hub-s">$WorkName. İman, kutsal sırlar, Hristiyan ahlakı ve dua üzerine 598 soru ve yanıt, İngilizce aslıyla birlikte.</span>
      <span class="hub-go">Oku$IcoNext</span>
    </a>
    <a class="hub-card" href="kutsal-kitap.html">
      <span class="hub-ico">$IcoBook</span>
      <span class="hub-t">Kutsal Kitap</span>
      <span class="hub-s">$($KkMeta.short)</span>
      <span class="hub-go">Devamını oku$IcoNext</span>
    </a>
    <a class="hub-card" href="tesbih-duasi.html">
      <span class="hub-ico">$IcoBeads</span>
      <span class="hub-t">Tesbih Duası</span>
      <span class="hub-s">Meryem Ana Tesbih Duası: duaların Türkçesi ve İngilizcesi, bütün gizemler ve tesbihin nasıl dua edileceği.</span>
      <span class="hub-go">Oku$IcoNext</span>
    </a>
    <a class="hub-card" href="sss.html">
      <span class="hub-ico">$IcoAsk</span>
      <span class="hub-t">Sorular</span>
      <span class="hub-s">Katolik olmayanların ve inancını yeni tanıyanların en sık sorduğu sorular, Katekizm$($Apos)e dayanan yanıtlarıyla.</span>
      <span class="hub-go">Oku$IcoNext</span>
    </a>
    <a class="hub-card" href="katolik-sureci.html">
      <span class="hub-ico">$IcoWay</span>
      <span class="hub-t">Katolik Süreci</span>
      <span class="hub-s">Katolik olmak isteyenler için: OCIA süreci nedir, vaftizli ve vaftizsiz adaylar için adım adım nasıl işler.</span>
      <span class="hub-go">Oku$IcoNext</span>
    </a>
  </div>
  $(Search-Form 'hero-search' 'q-home' '598 soruda ara: Türkçe, İngilizce ya da soru numarası')
</div>
"@
$webSiteLd = '{"@context":"https://schema.org","@type":"WebSite","name":' + (JStr $SiteName) +
  ',"url":' + (JStr "$SiteUrl/") + ',"inLanguage":"tr","description":' + (JStr $SiteTag) +
  ',"potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":' +
  (JStr "$SiteUrl/katesizm.html?q={search_term_string}") + '},"query-input":"required name=search_term_string"}}'
Write-Page -File 'index.html' -Title "$SiteName | $SiteTag" `
  -Description "Türkçe Katolik kaynakları: Katolik Kilisesi Katekizmi Özeti$($Apos)nin tam çevirisi ve Katolik inancı üzerine sıkça sorulan sorular." `
  -Path '' -Body $homeBody -JsonLd @($webSiteLd) -HeaderSearch $false

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
  "Papa XVI. Benediktus$($Apos)un 28 Haziran 2005 tarihli Motu Proprio$($Apos)su: Katolik Kilisesi Katekizmi Özeti$($Apos)nin onaylanması ve yayımlanması. Türkçe çeviri ve İngilizce asıl metin." $mpLd

$in = $X.introduction
$inBody = (Parallel-Paragraphs $in.tr.paragraphs $in.en.paragraphs) +
  "<div class=`"signature`">$((($in.tr.closing | ForEach-Object { "<p>$_</p>" }) -join ''))<div class=`"en-block en-par`" lang=`"en`" hidden>$((($in.en.closing | ForEach-Object { "<p>$_</p>" }) -join ''))</div></div>" +
  "<div class=`"footnotes`">$(Parallel-Paragraphs $in.tr.footnotes $in.en.footnotes)</div>"
$inLd = '{"@context":"https://schema.org","@type":"Article","headline":"Giriş","inLanguage":"tr","datePublished":"2005-03-20","author":{"@type":"Person","name":"Kardinal Joseph Ratzinger"},"mainEntityOfPage":' + (JStr "$SiteUrl/giris.html") + '}'
Article-Page 'giris.html' 'Giriş' 'Önsöz' 'Giriş' 'Introduction' $inBody `
  "Katolik Kilisesi Katekizmi Özeti$($Apos)nin Girişi (Kardinal Joseph Ratzinger, 2005): Özet$($Apos)in hazırlanışı, üç temel özelliği ve dört kısmı. Türkçe çeviri ve İngilizce asıl metin." $inLd

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
  -Description "Katolik Kilisesi Katekizmi Özeti Ekleri: Türkçe, İngilizce ve Latince dualar (Haç İşareti, Selam Sana Meryem, Rab$($Apos)bin Meleği, Salve Regina, Magnificat, Te Deum, Tespih) ve Katolik öğretinin formülleri." `
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
      "<div class=`"faq-a`">$(Blocks $_.a)" +
        "<p class=`"faq-ref`"><span class=`"ccc`" title=`"Katolik Kilisesi Katekizmi madde numaraları`">KKK $($_.ccc)</span></p></div>" +
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
  -Description "Katolik Kilisesi hakkında sık sorulan sorular ve Katekizm$($Apos)e dayanan yanıtlar: Meryem ve azizlere saygı, Kutsal Üçlü, günah çıkarma, Efkaristiya, papalık, araf, evrim, acı ve kötülük." `
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

# ================================================================== TESBIH DUASI (tesbih-duasi.html)
# The bead ring is generated rather than hand-drawn: five decades of one large bead
# and ten small ones, with the pendant and crucifix above, mirroring a real rosary.
$cx = 180.0; $cy = 372.0; $rr = 138.0
function Bead([double]$x, [double]$y, [string]$kind, [string]$prayer) {
  $cls = if ($kind -eq 'lg') { 'bead lg' } else { 'bead sm' }
  $rad = if ($kind -eq 'lg') { '8.5' } else { '5.6' }
  return "<circle class=`"$cls`" cx=`"$x`" cy=`"$y`" r=`"$rad`" data-p=`"$prayer`"></circle>"
}
# pendant, from the crucifix down to the medal
$pend = ""
$pend += Bead 180 200 'lg' 'goklerdeki-pederimiz'
foreach ($y in 175, 152, 129) { $pend += Bead 180 $y 'sm' 'selam-sana-meryem' }
$pend += Bead 180 100 'lg' 'pedere-san'
# the ring
$ring = ""
for ($i = 0; $i -lt 55; $i++) {
  $ang = (-90.0 + (($i + 1) * 360.0 / 56.0)) * [Math]::PI / 180.0
  $x = [Math]::Round($cx + $rr * [Math]::Cos($ang), 1)
  $y = [Math]::Round($cy + $rr * [Math]::Sin($ang), 1)
  $isBig = ($i % 11) -eq 0
  $ring += Bead $x $y ($(if ($isBig) { 'lg' } else { 'sm' })) ($(if ($isBig) { 'goklerdeki-pederimiz' } else { 'selam-sana-meryem' }))
}
$rosarySvg = '<svg class="rosary" viewBox="0 0 360 560" role="img" aria-label="Tesbih">' +
  '<circle class="ring-guide" cx="180" cy="372" r="138"></circle>' +
  '<path class="ring-guide" d="M180 100 V 234"></path>' +
  '<g class="cross-g" data-p="iman-aciklamasi">' +
    '<rect class="bead cross" x="172" y="28" width="16" height="62" rx="3"></rect>' +
    '<rect class="bead cross" x="152" y="46" width="56" height="16" rx="3"></rect></g>' +
  $pend +
  '<circle class="bead medal" cx="180" cy="234" r="10" data-p="hac-isareti"></circle>' +
  $ring + '</svg>'

$mysterySets = ($Rosary.sets | ForEach-Object {
  $items = ($_.items | ForEach-Object { "<li><span class=`"m-tr`">$(Inline $_.tr)</span><span class=`"m-en`" lang=`"en`">$($_.en)</span></li>" }) -join ''
  "<article class=`"myst`" data-days=`"$($_.days -join ',')`" id=`"gizem-$($_.id)`">" +
    "<header><h3>$(Inline $_.tr)</h3><p class=`"m-day label`">$($_.dayTr)</p><p class=`"m-en-title`" lang=`"en`">$($_.en)</p></header>" +
    "<ol class=`"myst-list`">$items</ol></article>"
}) -join "`n"
$stepList = ($Rosary.steps | ForEach-Object {
  "<li><span class=`"s-tr`">$(Inline $_.tr)</span><span class=`"s-en`" lang=`"en`">$($_.en)</span></li>"
}) -join ''
$prayerList = ($Rosary.prayers | ForEach-Object {
  "<li><button type=`"button`" class=`"pray-link`" data-p=`"$($_.id)`" data-spot=`"$($_.spot)`" aria-describedby=`"prayer-panel`">$(Inline $_.tr.title)</button></li>"
}) -join ''
$prayerStore = ($Rosary.prayers | ForEach-Object {
  "<div data-pray=`"$($_.id)`"><h3>$(Inline $_.tr.title)</h3>" +
    "<p class=`"p-note`">$(Inline $_.note)</p>" +
    "<div class=`"p-tr`">$(Verse $_.tr.text)</div>" +
    "<div class=`"p-en`" lang=`"en`"><span class=`"label`">$($_.en.title)</span>$(Verse $_.en.text)</div></div>"
}) -join "`n"
$tespihBody = @"
<div class="wrap narrow">
  $(Crumbs 'Tesbih Duası')
  <header class="page-head center"><p class="label">Dualar</p><h1>$($Rosary.title)</h1><p class="sub" lang="en">$($Rosary.en)</p></header>
  <p class="faq-intro">$(Inline $Rosary.intro)</p>
  <h2 class="section-title" id="nasil">Tesbih nasıl dua edilir?</h2>
  <ol class="steps">$stepList</ol>
  <div class="rosary-wrap">
    <div class="rosary-figure">
      $rosarySvg
      <p class="rosary-cap" data-rosary-cap>Bir duanın üzerine gelin, tesbihte nerede okunduğu işaretlensin.</p>
    </div>
    <div class="rosary-side">
      <p class="label">Bugünün gizemleri</p>
      <p class="today-set" data-today-set>...</p>
      <ol class="today-list" data-today-list></ol>
      <p class="label pray-head">Dualar</p>
      <ul class="pray-list">$prayerList</ul>
    </div>
  </div>
  <h2 class="section-title" id="gizemler">Gizemler</h2>
  <div class="myst-grid">
$mysterySets
  </div>
  <p class="conventions">Dua metinleri, İstanbul’daki Sant’Antuan (Aziz Antuan) Bazilikası’nda tesbih duası için kullanılan Türkçe gelenek esas alınarak düzenlenmiştir.</p>
</div>
<div class="pray-store" hidden>
$prayerStore
</div>
<div class="hover-panel glass" id="prayer-panel" role="tooltip" hidden></div>
"@
Write-Page -File 'tesbih-duasi.html' -Title "$($Rosary.title) | $SiteName" `
  -Description "Meryem Ana Tesbih Duası: duaların Türkçesi ve İngilizcesi, Sevinç, Işık, Acı ve Yücelik gizemleri ve tesbihin nasıl dua edileceği." `
  -Path 'tesbih-duasi.html' -Body $tespihBody -JsonLd @((Breadcrumb-Ld 'Tesbih Duası' 'tesbih-duasi.html'))

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
  @{ p = ''; pr = '1.0' }, @{ p = 'katesizm.html'; pr = '0.9' },
  @{ p = 'iman-ikrari.html'; pr = '0.9' }, @{ p = 'kutsal-sirlar.html'; pr = '0.9' },
  @{ p = 'mesihte-yasam.html'; pr = '0.9' }, @{ p = 'hristiyan-duasi.html'; pr = '0.9' }, @{ p = 'ekler.html'; pr = '0.8' },
  @{ p = 'kutsal-kitap.html'; pr = '0.9' }, @{ p = 'tesbih-duasi.html'; pr = '0.9' }, @{ p = 'katolik-sureci.html'; pr = '0.9' },
  @{ p = 'sss.html'; pr = '0.9' }, @{ p = 'motu-proprio.html'; pr = '0.6' },
  @{ p = 'giris.html'; pr = '0.6' }
)
$sm = '<?xml version="1.0" encoding="UTF-8"?>' + "`n" + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "`n" +
  (($pages | ForEach-Object { "  <url><loc>$SiteUrl/$($_.p)</loc><lastmod>$BuildDate</lastmod><changefreq>monthly</changefreq><priority>$($_.pr)</priority></url>" }) -join "`n") +
  "`n</urlset>`n"
[IO.File]::WriteAllText((Join-Path $Root 'sitemap.xml'), $sm, $Utf8)
[IO.File]::WriteAllText((Join-Path $Root 'robots.txt'), "User-agent: *`nAllow: /`nDisallow: /tools/`n`nSitemap: $SiteUrl/sitemap.xml`n", $Utf8)
Write-Host "  + sitemap.xml, robots.txt"
Write-Host "Done."
