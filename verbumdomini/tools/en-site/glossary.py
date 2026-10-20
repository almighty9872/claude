"""The body of the English site's glossary (glossary.html), from content/glossary-en.txt.

The text file is written for this site: a line per term, "Term: definition (CCC 123, 456)", under
a capital letter for each letter of the alphabet. build.ps1 (with -EnglishSite) runs this and sets
what it writes (to the file named on the command line) in the page: a search box, the letters as pinned links, and each letter's terms.
Italics (*...*) become <i>; another glossary term named in a definition links to it (three links
at most, the longest names first); the Catechism numbers at the end of a definition become
<p class="gl-ref" data-ccc="...">, which build.ps1 fills with its own links to vatican.va. Bible
references are left as text: build.ps1 links them as it does on every page.
"""
import html, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]          # verbumdomini/
# names too common to link every time they come up in a definition
NO_LINK = {'God', 'Jesus', 'Christ', 'Jesus Christ', 'Church', 'Catholic Church', 'Catholic', 'Christian', 'Mass', 'Lord',
           'Bible', 'Scripture', 'Council', 'Sunday'}
MAX_LINKS = 3
# a Bible reference ("John 3:16", "1 Corinthians 11:23-26"): never inside a link to another term
BIBLE = re.compile(r'(?:[1-3] )?[A-Z][a-z]+(?: of [A-Z][a-z]+)? \d+:\d+')


def esc(t): return html.escape(t, quote=False)


def slug(t):
    t = re.sub(r'\(.*?\)|\*', '', t).lower().replace('’', '').replace("'", '')
    return 't-' + re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def parse():
    """[(letter, [{'term', 'text', 'ccc'}])]"""
    out, cur = [], None
    for line in (ROOT / 'content' / 'glossary-en.txt').read_text(encoding='utf-8').split('\n'):
        s = line.strip()
        if re.fullmatch(r'[A-Z]', s):
            cur = (s, []); out.append(cur); continue
        if not s or set(s) <= set('=-') or cur is None or ': ' not in s:
            continue
        term, text = s.split(': ', 1)
        ccc = ''
        m = re.search(r'\s*\(([^()]*\bCCC\b[^()]*)\)(\.?)\s*$', text)
        if m:
            pre, _, ccc = m.group(1).partition('CCC')
            pre = pre.strip().rstrip(',').strip(); ccc = ccc.strip()
            text = text[:m.start()] + (f' ({pre})' if pre else '') + (m.group(2) or '.')
        cur[1].append({'term': term.strip(), 'text': text.strip(), 'ccc': ccc})
    return [(l, es) for l, es in out if es]


def names_of(term):
    """'Clergy / Cleric' -> Clergy, Cleric; 'Holy See (Sancta Sedes)' -> Holy See"""
    base = re.sub(r'\s*\(.*?\)', '', term).replace('*', '')
    return [n.strip() for n in base.split('/') if len(n.strip()) > 2]


def inline(text, own, index):
    spans = [(m.start(), m.end(), None) for m in BIBLE.finditer(text)]
    used = 0
    for name in sorted(index, key=len, reverse=True):
        if used >= MAX_LINKS: break
        if name in own or name in NO_LINK: continue
        m = re.search(r'(?<![\w*])' + re.escape(name) + r'(?![\w*])', text)
        if not m or any(a < m.end() and m.start() < b for a, b, _ in spans): continue
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
    total = sum(len(es) for _, es in letters)
    first, last = letters[0][1][0]['term'], letters[-1][1][-1]['term']
    have = {l for l, _ in letters}
    az = ''.join(f'<li><a href="#gl-{l}">{l}</a></li>' if l in have else f'<li><span class="gl-off" aria-hidden="true">{l}</span></li>'
                 for l in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    secs = ''
    for l, es in letters:
        items = ''
        for e in es:
            main_t, _, alt = e['term'].partition(' (')
            it = lambda t: re.sub(r'\*([^*]+)\*', r'<i>\1</i>', esc(t))
            term = it(main_t) + (f' <span class="gl-alt">({it(alt)}</span>' if alt else '')
            ref = f'<p class="gl-ref" data-ccc="{esc(e["ccc"])}"></p>' if e['ccc'] else ''
            items += (f'<div class="gl-e" id="{slug(e["term"])}"><dt><dfn>{term}</dfn></dt>'
                      f'<dd><p>{inline(e["text"], set(names_of(e["term"])), index)}</p>{ref}</dd></div>\n')
        n = len(es)
        secs += (f'<section class="gl-letter" id="gl-{l}" aria-labelledby="gl-h-{l}">'
                 f'<h2 class="gl-lh" id="gl-h-{l}"><span class="gl-big">{l}</span><span class="gl-cnt">{n} term{"s" if n != 1 else ""}</span></h2>'
                 f'<dl class="gl-list">\n{items}</dl></section>\n')
    print(f'<!--gl-count:{total}|{esc(first)}|{esc(re.sub(r" [(].*", "", last))}-->')
    # the search, its count and the letters ride together in one bar pinned under the header
    print('<div class="faq-toc is-sticky gl-az gl-bar">')
    print('<div class="gl-find" role="search"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>'
          f'<input type="search" id="gl-q" placeholder="Search {total} terms" aria-label="Search the glossary" autocomplete="off" spellcheck="false">'
          '<button type="button" class="gl-clear" id="gl-clear" aria-label="Clear the search" hidden><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>')
    print('<p class="gl-status" id="gl-status" aria-live="polite"></p>')
    print(f'<nav aria-label="Letters"><ul>{az}</ul></nav></div>')
    print(secs + '<p class="gl-none" id="gl-none" hidden>No term matches your search. Try a shorter word, or <a href="/contact.html">tell us</a> which term you would like to see added.</p>')
    pathlib.Path(out).write_text('\n'.join(put) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main(sys.argv[1])
