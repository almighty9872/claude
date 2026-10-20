"""Internal links and anchors of the built Turkish site: every href, src and srcset in the top-level
pages and kilise/, the site's own absolute addresses (https://katolikdunyasi.com/...) included.
Run from the repository root after tools/build.ps1:  python3 tools/qa/links.py  (prints "total bad 0")"""
import collections, glob, html, os, re

pages = glob.glob('*.html') + glob.glob('kilise/*.html')
ids = {p: set(re.findall(r'\bid="([^"]+)"', open(p, encoding='utf-8').read())) for p in pages}
bad = collections.Counter()
for p in pages:
    h = open(p, encoding='utf-8').read()
    urls = re.findall(r'(?:href|src)="([^"]+)"', h) + [x.split()[0] for s in re.findall(r'srcset="([^"]+)"', h) for x in s.split(',')]
    for u in urls:
        u = html.unescape(u.strip())
        if re.match(r'(mailto:|tel:|data:|javascript:)', u): continue
        if re.match(r'https?://', u):
            if not re.match(r'https?://(www\.)?katolikdunyasi\.com', u): continue
            u = re.sub(r'https?://(www\.)?katolikdunyasi\.com', '', u) or '/'
        path, _, frag = u.partition('#'); path = path.split('?')[0]
        if not path: tgt = p
        elif path.startswith('/'): tgt = path.lstrip('/') or 'index.html'
        else: tgt = os.path.normpath(os.path.join(os.path.dirname(p), path))
        if tgt.endswith('/') or os.path.isdir(tgt): tgt = os.path.join(tgt, 'index.html')
        if not os.path.exists(tgt): bad[f'{p} -> {tgt}'] += 1
        elif frag and tgt.endswith('.html') and frag not in ids.get(tgt, set()): bad[f'{p} -> {tgt}#{frag}'] += 1
for k, n in bad.most_common(40): print(n, k)
print('total bad', sum(bad.values()))
