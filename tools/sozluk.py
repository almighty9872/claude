"""The body of the Turkish glossary (sozluk.html), from content/glossary-tr.txt.

The Turkish port of the English site's glossary (verbumdomini/tools/en-site/glossary.py). The text
file has a line per term, "Terim (English/Latin): tanım (Kutsal Kitap, KKK 123, 456)", under a capital
letter of the Turkish alphabet. build.ps1 runs this and sets what it writes (to the file named on the
command line) in the page: a search box, the letters as pinned links, and each letter's terms.
Italics (*...*) become <i>; another glossary term named in a definition links to it (three links at
most, the longest names first); the Catechism numbers at the end of a definition become
<p class="gl-ref" data-ccc="...">, which build.ps1 fills with its own links to vatican.va. Bible
references are left as text: build.ps1 links them as it does on every page.
"""
import html, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
ALPHABET = 'A B C Ç D E F G Ğ H I İ J K L M N O Ö P R S Ş T U Ü V Y Z'.split()
# names too common to link every time they come up in a definition
NO_LINK = {'Allah', 'Tanrı', 'İsa', 'Mesih', 'İsa Mesih', 'Kilise', 'Katolik Kilisesi', 'Katolik', 'Hristiyan', 'Kutsal Ayin',
           'Rab', 'Kutsal Kitap', 'Kutsal Yazılar', 'Konsil', 'Pazar'}
MAX_LINKS = 3
# terms that are also everyday words ("kişi", "biçim", "ilahi" as divine): linked only as the term itself,
# capitalized and without an ending, as the English glossary links only "Form", never "form"
STRICT = {'İlahi', 'Kişi', 'Biçim', 'Madde', 'İncelik', 'Kusur', 'Yetki', 'Kutsallığı', 'Topluluk', 'Toplantı', 'Görünme',
          'Makam', 'Simge', 'Sevgi', 'Saygı', 'Hizmet', 'Dönüş'}
# a name at least this long also links with the endings Turkish adds to a noun ("vaftizde", "Ayinler",
# "piskoposların"): plural, possessive and case, but not the suffixes that make another word
# ("sadakat" is not Sadaka, "yetkinlik" not Yetki)
SUFFIX_MIN = 4
ENDING = (r'(?:’|\')?(?:lar|ler)?(?:ları|leri|ımız|imiz|umuz|ümüz|ınız|iniz|unuz|ünüz|sı|si|su|sü|ı|i|u|ü)?'
          r'(?:nın|nin|nun|nün|ın|in|un|ün|yı|yi|yu|yü|nı|ni|nu|nü|ya|ye|na|ne|a|e|nda|nde|da|de|ta|te|ndan|nden|dan|den|tan|ten'
          r'|yla|yle|la|le|daki|deki|ndaki|ndeki|taki|teki|dır|dir|dur|dür|tır|tir|tur|tür)?')
# never inside a link to another term: a bracket with a number (Bible and Catechism references), a Bible
# reference in the running text with the words before it ("Mısır’dan Çıkış 3:14"), or an italic
SHIELD = re.compile(r'\([^()]*\d[^()]*\)|(?:[1-3]\.?\s)?[\w’\']+(?:\s[\w’\']+){0,2}\s\d{1,3}:\d|\*[^*]+\*')
ASCII = str.maketrans('çğıöşüâîû', 'cgiosuaiu')


def esc(t): return html.escape(t, quote=False)


def tr_lower(t): return t.replace('I', 'ı').replace('İ', 'i').lower()


def slug(t):
    t = tr_lower(re.sub(r'\(.*?\)|\*', '', t)).replace('’', '').replace("'", '').translate(ASCII)
    return 't-' + re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def letter_id(l): return 'gl-' + tr_lower(l).translate(ASCII) + ('2' if l in 'ÇĞİÖŞÜ' else '')


def parse():
    """[(letter, [{'term', 'text', 'ccc'}])]"""
    out, cur = [], None
    for line in (ROOT / 'content' / 'glossary-tr.txt').read_text(encoding='utf-8').split('\n'):
        s = line.strip()
        if s in ALPHABET:
            cur = (s, []); out.append(cur); continue
        if not s or set(s) <= set('=-') or cur is None or ': ' not in s:
            continue
        term, text = s.split(': ', 1)
        ccc = ''
        m = re.search(r'\s*\(([^()]*\bKKK\b[^()]*)\)(\.?)\s*$', text)
        if m:
            pre, _, ccc = m.group(1).partition('KKK')
            pre = pre.strip().rstrip(',').strip(); ccc = ccc.strip()
            text = text[:m.start()] + (f' ({pre})' if pre else '') + (m.group(2) or '.')
        cur[1].append({'term': term.strip(), 'text': text.strip(), 'ccc': ccc})
    return [(l, es) for l, es in out if es]


def names_of(term):
    """'Haç / Krusifiks' -> Haç, Krusifiks; 'Ayin (Litürji)' -> Ayin"""
    base = re.sub(r'\s*\(.*?\)', '', term).replace('*', '')
    return [n.strip() for n in base.split('/') if len(n.strip()) > 2]


def name_rx(name):
    """the name as it stands in a sentence: its first letter in either case (İ/i, I/ı), and a long
    name with the suffix it takes in Turkish ("vaftizde"), which goes into the link"""
    if name in STRICT: return re.compile(r'(?<![\w*])' + re.escape(name) + r'(?![\w*])')
    first = {'İ': '[İi]', 'I': '[Iı]', 'i': '[İi]', 'ı': '[Iı]'}.get(name[0], '[' + re.escape(name[0].upper() + name[0].lower()) + ']')
    tail = ENDING if len(name) >= SUFFIX_MIN else ''
    return re.compile(r'(?<![\w*])' + first + re.escape(name[1:]) + tail + r'(?![\w*])')


def inline(text, own, index, rxs):
    spans = [(m.start(), m.end(), None) for m in SHIELD.finditer(text)]
    used = 0
    for name in sorted(index, key=len, reverse=True):
        if used >= MAX_LINKS: break
        if name in own or name in NO_LINK: continue
        m = next((m for m in rxs[name].finditer(text) if not any(a < m.end() and m.start() < b for a, b, _ in spans)), None)
        if not m: continue
        spans.append((m.start(), m.end(), f'<a class="gl-x" href="#{index[name]}">{esc(m.group(0))}</a>')); used += 1
    out, i = '', 0
    for a, b, h in sorted(spans):
        if h is None: continue
        out += esc(text[i:a]) + h; i = b
    out += esc(text[i:])
    return re.sub(r'\*([^*]+)\*', r'<i>\1</i>', out)


def main(out):
    put = []
    print = put.append
    letters = parse()
    index = {}
    for _, es in letters:
        for e in es:
            for n in names_of(e['term']): index.setdefault(n, slug(e['term']))
    slugs = [slug(e['term']) for _, es in letters for e in es]
    dup = {s for s in slugs if slugs.count(s) > 1}
    if dup: sys.exit('sozluk.py: two terms share an anchor: ' + ', '.join(sorted(dup)))
    rxs = {n: name_rx(n) for n in index}
    total = sum(len(es) for _, es in letters)
    first, last = letters[0][1][0]['term'], letters[-1][1][-1]['term']
    have = {l for l, _ in letters}
    az = ''.join(f'<li><a href="#{letter_id(l)}">{l}</a></li>' if l in have else f'<li><span class="gl-off" aria-hidden="true">{l}</span></li>'
                 for l in ALPHABET)
    secs = ''
    for l, es in letters:
        items = ''
        for e in es:
            main_t, _, alt = e['term'].partition(' (')
            it = lambda t: re.sub(r'\*([^*]+)\*', r'<i>\1</i>', esc(t))
            term = it(main_t) + (f' <span class="gl-alt">({it(alt)}</span>' if alt else '')
            ref = f'<p class="gl-ref" data-ccc="{esc(e["ccc"])}"></p>' if e['ccc'] else ''
            items += (f'<div class="gl-e" id="{slug(e["term"])}"><dt><dfn>{term}</dfn></dt>'
                      f'<dd><p>{inline(e["text"], set(names_of(e["term"])), index, rxs)}</p>{ref}</dd></div>\n')
        lid = letter_id(l)
        secs += (f'<section class="gl-letter" id="{lid}" aria-labelledby="{lid}-h">'
                 f'<h2 class="gl-lh" id="{lid}-h"><span class="gl-big">{l}</span><span class="gl-cnt">{len(es)} terim</span></h2>'
                 f'<dl class="gl-list">\n{items}</dl></section>\n')
    print(f'<!--gl-count:{total}|{esc(re.sub(r" [(].*", "", first))}|{esc(re.sub(r" [(].*", "", last))}-->')
    # the search, its count and the letters ride together in one bar pinned under the header
    print('<div class="faq-toc is-sticky gl-az gl-bar">')
    print('<div class="gl-find" role="search"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>'
          '<input type="search" id="gl-q" placeholder="Sözlükte ara…" aria-label="Sözlükte ara" autocomplete="off" spellcheck="false">'
          '<button type="button" class="gl-clear" id="gl-clear" aria-label="Aramayı temizle" hidden><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>')
    print('<p class="gl-status" id="gl-status" aria-live="polite"></p>')
    print(f'<nav aria-label="Harfler"><ul>{az}</ul></nav></div>')
    print(secs + '<p class="gl-none" id="gl-none" hidden>Sonuç bulunamadı. Daha kısa bir kelime deneyin ya da eklenmesini istediğiniz terimi <a href="iletisim.html">bize yazın</a>.</p>')
    pathlib.Path(out).write_text('\n'.join(put) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main(sys.argv[1])
