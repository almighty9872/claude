import os
# English twin of the prototype's text data, built from the English fields the site's data files
# already carry. Same shapes as the Turkish data, so the app can swap one for the other at start-up.
import json, re
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'data') + '/'
def load(f):
    s = open(R + f, encoding='utf-8').read()
    if '/*JSON-START*/' in s: return json.loads(s[s.index('/*JSON-START*/') + 14:s.index('/*JSON-END*/')])
    return json.loads(s[s.index('{'):s.rindex('}') + 1])
def clean(h):
    if h is None: return ''
    if isinstance(h, list): h = h[0] if h else ''
    h = re.sub(r'\[\[([^|\]]+)\|[^\]]+\]\]', r'\1', h)
    h = re.sub(r'<a\b[^>]*>(.*?)</a>', r'\1', h, flags=re.S)
    h = re.sub(r'<(?!/?(em|strong|b|i)\b)[^>]+>', '', h)
    h = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', h)
    return h.strip()
MISS = []
def pick(cur, tr, en, where=''):
    """the English for a field, prepared the same way as the Turkish one was"""
    if en is None or en == '':
        MISS.append(where); return cur
    if cur == tr: return en
    if cur == clean(tr): return clean(en)
    # the Turkish was edited by hand in the prototype; the English source still wins
    return clean(en) if '<' in str(en) or '*' in str(en) else en
def en_of(o, *keys):
    for k in keys:
        if isinstance(o, dict) and o.get(k): return o[k]
    return None

def build(D):
    E = {}
    # questions and answers
    s = load('sss.js')
    E['sss'] = [{'t': c['en'] if isinstance(c['en'], str) else c['en'].get('title', c['title']), 'items': [dict(it, q=pick(it['q'], x['q'], x.get('qEn'), 'sss q'), a=pick(it['a'], x['a'], x.get('aEn'), 'sss a'), **({'q2': None} if 'q2' in it else {})) for it, x in zip(dc['items'], c['items'])]} for dc, c in zip(D['sss'], s['categories'])]
    for dc, c in zip(E['sss'], s['categories']):
        for it in dc['items']:
            m = re.match(r'^\s*<em>\s*(?:Question|Soru)\s*:\s*(.*?)</em>\s*\n?', it['a'], re.S)
            if m: it['q2'] = re.sub(r'<[^>]+>', '', m.group(1)).strip(); it['a'] = it['a'][m.end():].lstrip()
            elif it.get('q2') is None: it.pop('q2', None)
    # the twenty great saints
    b = {x['id']: x for x in load('buyuk-azizler.js')['saints']}
    E['saints'] = []
    for x in D['saints']:
        y = b[x['id']]
        E['saints'].append(dict(x, name=y.get('en') or x['en'], ep=pick(x['ep'], y['epithet'], y.get('epithetEn')), era=pick(x['era'], y['era'], y.get('eraEn')), sum=pick(x['sum'], y['summary'], y.get('summaryEn')), body=pick(x['body'], y['body'], y.get('bodyEn'), 'saint body ' + x['id'])))
    # the calendar
    a = load('azizler.js'); RANK = {'En Büyük Bayram': 'Principal Solemnity', 'Büyük Bayram': 'Solemnity', 'Bayram': 'Feast', 'Anma Günü': 'Memorial', 'Anma': 'Commemoration', 'İhtiyari Anma Günü': 'Optional Memorial', 'Ortaçağ Batı Geleneği': 'Medieval Western Tradition', 'Roma Azizler Cetveli': 'Roman Martyrology'}
    E['days'] = {}
    for d in a['days']:
        k = '%d-%d' % (d['m'], d['d']); cur = D['days'].get(k)
        if cur is None: continue
        out = []
        for cs, x in zip([c for c in cur if 'n' in c], d['saints']):
            out.append(dict(cs, n=x.get('nameEn') or cs['n'], t=pick(cs.get('t', ''), x.get('title', ''), x.get('titleEn')) if x.get('title') else cs.get('t', ''), b=pick(cs.get('b', ''), x.get('bio', ''), x.get('bioEn'), 'day ' + k)))
        for c in cur:
            if 'rank' in c: out.append({'rank': RANK.get(c['rank'], c['rank'])})
        E['days'][k] = out
    # parables and miracles
    ms = [y for c in load('meseller.js')['categories'] for y in [dict(i, _cat=c) for i in c['items']]]
    E['mes'] = [dict(x, n=y.get('nameEn') or x['n'], ref=pick(x['ref'], y['ref'], y.get('refEn')), b=pick(x['b'], y['bio'], y.get('bioEn'), 'mes'), cat=y['_cat']['en'] if isinstance(y['_cat']['en'], str) else x['cat']) for x, y in zip(D['mes'], ms)]
    mr = [y for c in load('mucizeler.js')['categories'] for y in [dict(i, _cat=c) for i in c['items']]]
    E['mir'] = [dict(x, n=y.get('nameEn') or x['n'], p=pick(x['p'], y['place'], y.get('placeEn')), b=pick(x['b'], y['bio'], y.get('bioEn'), 'mir'), cat=y['_cat']['en'] if isinstance(y['_cat']['en'], str) else x['cat']) for x, y in zip(D['mir'], mr)]
    # confession
    g = load('gunah-cikarma.js'); gm = g['sealMartyrs']
    E['gun'] = dict(D['gun'], intro=pick(D['gun']['intro'], g['intro'], g.get('introEn')),
        steps=[dict(x, t=en_of(y.get('en'), 'title') if isinstance(y.get('en'), dict) else (y.get('en') or x['t']), x=pick(x['x'], y['text'], y.get('textEn'), 'gun step')) for x, y in zip(D['gun']['steps'], g['steps'])],
        faq=[dict(x, q=pick(x['q'], y['q'], y.get('qEn')), a=pick(x['a'], y['a'], y.get('aEn'), 'gun faq')) for x, y in zip(D['gun']['faq'], g['faq'])],
        mart=dict(D['gun']['mart'], t=gm.get('titleEn') or D['gun']['mart']['t'], intro=gm.get('introEn') or D['gun']['mart'].get('intro', ''), items=[dict(x, n=y['name'], x=y['detail']) for x, y in zip(D['gun']['mart']['items'], gm['itemsEn'])]))
    # the rosary
    t = load('tespih.js'); P = {p['id']: p for p in t['prayers']}
    E['tes'] = dict(D['tes'], prayers={k: dict(v, t=P[k]['en']['title'], x=P[k]['en']['text']) for k, v in D['tes']['prayers'].items() if k in P},
        sets=[dict(x, t=y['en'], dt=y.get('dayEn') or x['dt'], items=[i['en'] for i in y['items']]) for x, y in zip(D['tes']['sets'], t['sets'])])
    # the two debates
    for key, f in (('isl', 'islama-cevap.js'), ('ate', 'ateizme-cevap.js')):
        src = load(f); cur = D[key]
        E[key] = dict(cur, title=src['en'] if isinstance(src['en'], str) else cur['title'], lead=pick(cur['lead'], src['lead'], src.get('leadEn')),
            tldr=[dict(x, t=y.get('tEn') or x['t'], x=pick(x['x'], y['text'], y.get('textEn'))) for x, y in zip(cur['tldr'], src['tldr'])],
            parts=[dict(p, t=q.get('titleEn') or p['t'], secs=[dict(sx, t=sy.get('titleEn') or sx['t'], b=pick(sx['b'], sy['body'], sy.get('bodyEn'), key + ' sec')) for sx, sy in zip(p['secs'], q['sections'])]) for p, q in zip(cur['parts'], src['parts'])])
    # the Mass
    m = load('kutsal-ayin.js')
    E['mass'] = dict(D['mass'], intro=pick(D['mass']['intro'], m['intro'], m.get('introEn')), roles=m.get('roleLabelsEn') or D['mass']['roles'],
        parts=[dict(x, t=y['en'] if isinstance(y.get('en'), str) else x['t'], lead=pick(x['lead'], y.get('lead', ''), y.get('leadEn')), lines=[[l['role'], clean(l['en'])] for l in y['lines']]) for x, y in zip(D['mass']['parts'], m['parts'])])
    # the Katekizm
    comp = []
    for n, cur in zip(range(1, 5), D['comp']):
        d = load(f'data/compendium-{n}.js'.replace('data/', '')); items = []
        for it in d['items']:
            if it['type'] == 'heading' and it['level'] <= 4: items.append(['h', it['level'], clean(it['en'])])
            elif it['type'] == 'qa': items.append(['q', it['n'], clean(it['en']['q']), clean(it['en']['a'])])
            elif it['type'] == 'quote': items.append(['c', clean(it['en'])])
        assert len(items) == len(cur['items']), (n, len(items), len(cur['items']))
        comp.append(dict(cur, t=d['en'], items=items))
    E['comp'] = comp
    # the pages
    nk = load('neden-katoligiz.js'); tp = load('topraklarimizda-hristiyanlik.js'); tt = load('tesbih-tarihi.js'); ks = load('katolik-sureci.js')
    def L(x): return x if isinstance(x, list) else ([x] if x else [])
    pages = {}
    pages['neden'] = {'t': nk['en'] if isinstance(nk['en'], str) else D['pages']['neden']['t'], 'lead': clean(nk['introEn']), 'secs': [[t['en'] if isinstance(t.get('en'), str) else t['title'], [x for x in ['<b>' + clean(t.get('qEn', '')) + '</b>', '<em>' + clean(t.get('hookEn', '')) + '</em>', clean(t.get('ledeEn', ''))] + [clean(p) for p in L(t.get('pointsEn'))] if x and x not in ('<b></b>', '<em></em>')]] for pt in nk['parts'] for t in pt['topics']]}
    pages['topraklar'] = {'t': tp['en'], 'lead': clean(tp['introEn']), 'secs': [[s['en'] if isinstance(s.get('en'), str) else s['title'], [clean(x) for x in s['bodyEn'].split('\n') if x.strip()]] for s in tp['sections']] + [['Conclusion', [clean(tp['closingEn'])]]]}
    pages['tesbihtarihi'] = {'t': tt['en'], 'lead': clean(tt['leadEn']), 'secs': [[s['titleEn'], [clean(x) for x in s['bodyEn'].split('\n') if x.strip()]] for s in tt['sections']]}
    def flatEn(p):
        out = [clean(p.get('textEn', ''))] if p.get('textEn') else []
        return out
    pages['surec'] = {'t': ks['en'], 'lead': clean(ks['introEn']), 'secs': [[p.get('titleEn') or p.get('doorEn'), [x for x in [clean(p.get('doorSubEn', ''))] + flatEn(p) if x]] for p in ks['paths']] + [['The process, step by step', ['<b>' + (s['en'] if isinstance(s.get('en'), str) else s['title']) + '</b> ' + clean(s['textEn']) for s in ks['steps']]]] + [['Frequently asked', ['<b>' + f['qEn'] + '</b> ' + clean(f['aEn']) for f in ks['faq']]]]}
    for k in pages:
        assert len(pages[k]['secs']) == len(D['pages'][k]['secs']), (k, len(pages[k]['secs']), len(D['pages'][k]['secs']))
    E['pages'] = pages
    # churches
    k = load('kiliseler.js'); KX = {x['id']: x for c in k['cities'] for x in c['churches']}; rites = {r['id']: r.get('en') or r['tr'] for r in k['rites']}
    def ch(x):
        y = KX[x['id']]
        return dict(x, n=y.get('nameEn') or x['n'], s=y.get('shortEn') or y.get('nameEn') or x['s'], rite=rites.get(y.get('rite'), x['rite']), dist=y.get('districtEn') or x['dist'],
            mass=y.get('massEn') or x['mass'], mn=clean(y.get('massNoteEn', '')) or x['mn'], vis=clean(y.get('visitsEn', '')) or x['vis'], hist=clean(y.get('historyEn', '')) or x['hist'],
            nt=re.sub(r'<a [^>]*>(.*?)</a>', r'\1', y.get('noticeEn', '')) if x.get('nt') else x.get('nt', ''))
    E['churches'] = dict(D['churches'], note=clean(k.get('noteEn', '')) or D['churches']['note'], cities=[dict(c, n=next((cc.get('nameEn') for cc in k['cities'] if cc['id'] == c['id'] and cc.get('nameEn')), c['n']), ch=[ch(x) for x in c['ch']]) for c in D['churches']['cities']])
    # the Katekizm's front and back matter
    x = load('extras.js'); cx = D['cx']; e = {}
    mp, ig = x['motuProprio']['en'], x['introduction']['en']
    e['motu'] = dict(cx['motu'], t='Motu Proprio', sub=clean(mp['title']), by='Pope Benedict XVI, 2005', paras=[clean(p) for p in ([mp['address']] if mp.get('address') else []) + mp['paragraphs'] + L(mp.get('closing'))])
    e['giris'] = dict(cx['giris'], t='Introduction', sub='Introduction', by='Cardinal Joseph Ratzinger, 2005', paras=[clean(p) for p in ig['paragraphs'] + L(ig.get('closing'))])
    e['creeds'] = [dict(c0, t=c1['en']['title'], x=c1['en']['text']) for c0, c1 in zip(cx['creeds'], x['creeds'])]
    dec = x['decalogue']['en']; e['dec'] = dict(cx['dec'], t=dec['title'], cols=dec['cols'], rows=dec['rows'])
    e['of'] = dict(cx['of'], t=x['ourFather']['en']['title'], x=x['ourFather']['en']['text'])
    e['prayers'] = [dict(p0, t=p1['en']['title'], x=p1['en']['text']) for p0, p1 in zip(cx['prayers'], x['appendix']['prayers'])]
    e['formulas'] = [dict(f0, t=f1['en']['title'], items=f1['en']['items']) for f0, f1 in zip(cx['formulas'], x['appendix']['formulas'])]
    if len(e['motu']['paras']) != len(cx['motu']['paras']): print('note: motu paragraphs', len(e['motu']['paras']), len(cx['motu']['paras']))
    if len(e['giris']['paras']) != len(cx['giris']['paras']): print('note: giris paragraphs', len(e['giris']['paras']), len(cx['giris']['paras']))
    E['cx'] = e
    return E

if __name__ == '__main__':
    D = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data5.json')))
    E = build(D)
    print({k: len(json.dumps(v, ensure_ascii=False)) // 1024 for k, v in E.items()}, 'missing', len(MISS), MISS[:12])
