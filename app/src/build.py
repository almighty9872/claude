import json, re, os
B = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(B, *a)
ROOT = os.path.normpath(os.path.join(B, '..', '..'))  # the repository: content/ and data/ come from the site
D = json.load(open(P('data4.json')))
exec(open(P('popes3.py')).read()); exec(open(P('popes4.py')).read()); MORE3 = MORE3 + MORE4
have = {p['ord'] for p in D['popes']}
for p in MORE3:
    if p['ord'] not in have:
        D['popes'].append(p)
D['popes'].sort(key=lambda p: p['ord'])

# in-app pages from the site's own content files
C = os.path.join(ROOT, 'content') + '/'
def md(name):
    s = open(C + name, encoding='utf-8').read()
    fm = {}
    m = re.match(r'^---\n(.*?)\n---\n', s, re.S)
    if m:
        for line in m.group(1).split('\n'):
            if ':' in line:
                k, v = line.split(':', 1); fm[k.strip()] = v.strip()
        s = s[m.end():]
    s = '\n'.join(l for l in s.split('\n') if '{{' not in l)
    return fm, s.strip()
fk, kk = md('kutsal-kitap.md'); fa, ka = md('hakkinda.md'); fg, gz = md('gizlilik.md'); fe, er = md('erisilebilirlik.md')
D['docs'] = {'about': fa.get('about', ''), 'kaynaklar': ka, 'gizlilik': gz, 'gizlilikSub': fg.get('subtitle', ''),
             'erisilebilirlik': er, 'erisSub': fe.get('subtitle', ''), 'kutsalkitap': kk, 'kkSub': fk.get('subtitle', '')}

# martyrs of the seal: the texts were missing
_g = open(os.path.join(ROOT, 'data') + '/' + 'gunah-cikarma.js', encoding='utf-8').read()
_g = json.loads(_g[_g.index('{'):_g.rindex('}') + 1])['sealMartyrs']
D['gun']['mart'] = {'t': _g['title'], 'intro': _g['intro'], 'items': [{'n': m['name'], 'x': m['detail']} for m in _g['items']]}

# FAQ answers that open with the reader's full question: that question is the visitor's message
for _c in D['sss']:
    for _x in _c['items']:
        _m = re.match(r'^\s*<em>\s*Soru\s*:\s*(.*?)</em>\s*\n?', _x['a'], re.S)
        if _m:
            _x['q2'] = re.sub(r'<[^>]+>', '', _m.group(1)).strip(); _x['a'] = _x['a'][_m.end():].lstrip()

# church coordinates (OpenStreetMap) and the city centres, for the nearest churches
_geo = P('geo', 'geo.json')
if os.path.exists(_geo):
    _gg = json.load(open(_geo)); D['chgeo'] = {k: [round(v['lat'], 5), round(v['lon'], 5)] for k, v in _gg.items() if v}
_k = open(os.path.join(ROOT, 'data') + '/' + 'kiliseler.js', encoding='utf-8').read(); _k = json.loads(_k[_k.index('{'):_k.rindex('}') + 1])
D['citygeo'] = {c['name']: [c['lat'], c['lon']] for c in _k['cities'] if c.get('lat')}
# the outline of Turkey (from the site's map data) for the city circles
_m = open(os.path.join(ROOT, 'data') + '/' + 'anadolu-harita-sekli.js', encoding='utf-8').read(); _m = json.loads(_m[_m.index('{'):_m.rindex('}') + 1])
D['trk'] = {'d': _m['turkey'], 'k': _m['k'], 'tx': _m['tx'], 'ty': _m['ty'], 'W': _m['W'], 'H': _m['H']}
# the passages behind the Scripture, Qur'an and hadith references, the same files the desktop popups use
def _refs(f):
    t = open(os.path.join(ROOT, 'data') + '/' + f, encoding='utf-8').read(); return json.loads(t[t.index('{'):t.rindex('}') + 1])
D['refs'] = {'b': _refs('refs-bible.js'), 'q': _refs('refs-quran.js'), 'h': _refs('refs-hadith.js')}
D['papalurl'] = json.load(open(P('papal_urls.json'), encoding='utf-8'))
D['cccmap'] = json.load(open(os.path.join(ROOT, 'data') + '/' + 'ccc-vatican.json', encoding='utf-8'))
# church status (closed, limited) and the warning shown with it
_st = {x['id']: (x.get('status', 'active'), re.sub(r'<a [^>]*>(.*?)</a>', r'\1', x.get('notice', ''))) for c in _k['cities'] for x in c['churches']}
for _c in D['churches']['cities']:
    for _x in _c['ch']:
        if _x['id'] in _st: _x['st'], _x['nt'] = _st[_x['id']]

# public-domain portraits
F = json.load(open(P('pd', 'final.json')))
D['carav'] = json.load(open(P('carav','carav.json')))
_ic = P('icon', 'icon.json')
if os.path.exists(_ic):
    _i = json.load(open(_ic)); D['carav'].update(_i['img']); D['artmeta'] = _i['meta']
_ch = P('ch', 'final.json')
if os.path.exists(_ch):
    _f = json.load(open(_ch)); D['chimg'] = _f['img']; D['chmap'] = _f['map']; D['chcred'] = _f['cred']
_p2 = P('pope2', 'add.json')
if os.path.exists(_p2):
    _a = json.load(open(_p2)); F['popeimg'].update(_a['img']); F['credits'] = [c for c in F['credits'] if c['n'] not in [x['n'] for x in _a['cred']]] + _a['cred']
D['popeimg'] = F['popeimg']; D['saintimg'] = F['saintimg']; D['imgcredits'] = F['credits']
# English: the same data from the site's English fields, plus the prototype's own texts in English
import gen_en
_E = gen_en.build(D)
fk2, kk2 = md('kutsal-kitap-en.md'); fa2, ka2 = md('hakkinda-en.md'); fg2, gz2 = md('gizlilik-en.md'); fe2, er2 = md('erisilebilirlik-en.md')
_E['docs'] = {'about': fa2.get('about', ''), 'kaynaklar': ka2, 'gizlilik': gz2, 'gizlilikSub': fg2.get('subtitle', ''), 'erisilebilirlik': er2, 'erisSub': fe2.get('subtitle', ''), 'kutsalkitap': kk2, 'kkSub': fk2.get('subtitle', '')}
if os.path.exists(P('en_extra.json')): _E.update(json.load(open(P('en_extra.json'))))
D['en'] = _E
open(P('data5.json'), 'w').write(json.dumps(D, ensure_ascii=False, separators=(',', ':')))

# javascript: version 4 plus version 5, with the few functions v5 wraps renamed
js = open(P('app4.js')).read()
def ren(old, new):
    global js
    assert js.count(old) == 1, (old, js.count(old)); js = js.replace(old, new)
ren('function storySlides(id){', 'function storySlidesBase(id){')
ren('function vMe(){', 'function vMeBase(){')
ren('function vReader(key){\n  var k=key.split(\'#\')[0];\n  if(k.indexOf(\'cx:\')===0){', 'function vReaderV4(key){\n  var k=key.split(\'#\')[0];\n  if(k.indexOf(\'cx:\')===0){')
ren('function readerMeta(key){\n  var k=key.split(\'#\')[0];\n  if(k.indexOf(\'cx:\')===0)', 'function readerMetaV4(key){\n  var k=key.split(\'#\')[0];\n  if(k.indexOf(\'cx:\')===0)')
ren('function accPosts(id){', 'function accPostsBase(id){')
ren('function wireCarousels(root){', 'function wireCarouselsBase(root){')
ren("PART_TONE[CPART[n]],it[2],'Katekizm · soru '+n))", "PART_TONE[CPART[n]],plain(it[2]),'Katekizm · soru '+n))")
ren("var fq=0;D.sss.forEach(function(c){c.items.forEach(function(x){if(fq<10&&norm(x.q+' '+x.a).indexOf(q)>=0){fq++;res.push(resRow('data-comments=\"sss\"'", "var fq=0;D.sss.forEach(function(c,ci){c.items.forEach(function(x,qi){if(fq<10&&norm(x.q+' '+x.a).indexOf(q)>=0){fq++;res.push(resRow('data-go=\"chat:'+ci+'#'+qi+'\"'")
ren("'<h2>'+esc(D.gun.mart.t)+'</h2>'+D.gun.mart.items", "'<h2>'+esc(D.gun.mart.t)+'</h2>'+(D.gun.mart.intro?'<p>'+esc(D.gun.mart.intro)+'</p>':'')+D.gun.mart.items")
ren("<div class=\"m out\" id=\"mq'+qi+'\">'+esc(x.q)+'</div>';", "<div class=\"m out\" id=\"mq'+qi+'\">'+esc(x.q)+'</div>'+(x.q2?'<div class=\"m out\">'+esc(x.q2)+'</div>':'');")
ren("var D=JSON.parse(document.getElementById('data').textContent);", "var D=JSON.parse(document.getElementById('data').textContent);\nvar LANG=(function(){try{return localStorage.getItem('kdig.lang')==='en'?'en':'tr'}catch(e){return 'tr'}})();if(LANG==='en'&&D.en){Object.keys(D.en).forEach(function(k){D[k]=D.en[k]})}document.documentElement.lang=LANG;")
ren("var AYLAR=['Ocak',", "var AYLAR=LANG==='en'?['January','February','March','April','May','June','July','August','September','October','November','December']:['Ocak',")
ren("var GUN=['Pazar',", "var GUN=LANG==='en'?['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']:['Pazar',")
tail = "setTab('home');\n})();"
assert js.rstrip().endswith(tail)
js = js.rstrip()[:-len(tail)] + open(P('en_consts.js')).read() + '\n' + open(P('en_dict.js')).read() + '\n' + open(P('v5add.js')).read() + '\n' + open(P('v6add.js')).read() + '\n' + open(P('v7add.js')).read() + '\n' + open(P('v8add.js')).read() + '\n' + open(P('v9add.js')).read() + '\n' + open(P('v10add.js')).read() + '\n' + open(P('v11add.js')).read() + '\n' + open(P('v12add.js')).read() + '\n' + tail + '\n'
def rep2(old, new):
    global js
    assert js.count(old) == 1, (old, js.count(old)); js = js.replace(old, new)
rep2("return [[a.ord+'.','papa',''", "return [[LANG==='en'?ORD(a.ord):a.ord+'.','papa',''")
rep2("sm:x.ord+'.',go:'acc:'+pid", "sm:(LANG==='en'?ORD(x.ord):x.ord+'.'),go:'acc:'+pid")
rep2("var PAINT_NAME={'05franc'", "var PAINT_NAME=LANG==='en'?EN.paint:{'05franc'")
rep2("var CARAV_CRED=[['43jerome'", "var CARAV_CRED=LANG==='en'?EN.carav:[['43jerome'")
rep2("var HISTORY={\n '1-5'", "var HISTORY=LANG==='en'?EN.history:{\n '1-5'")
rep2("var RITES=[['Latin Katolik'", "var RITES=LANG==='en'?EN.rites:[['Latin Katolik'")
rep2("if(/Bayram/.test(rank)||(rank==='Anma Günü'&&/Meryem|Havari|Aziz Yusuf/.test(r[0].n)))", "if(/Bayram|Solemnity|Feast/.test(rank)||((rank==='Anma Günü'||rank==='Memorial')&&/Meryem|Havari|Aziz Yusuf|Mary|Our Lady|Apostle|Saint Joseph|St\\. Joseph/.test(r[0].n)))")

# page: the published v4 page with the new data, script and styles
html = open(P('index4.html')).read()
a = html.index('<script id="data" type="application/json">') + len('<script id="data" type="application/json">')
b = html.index('</script>', a)
data = json.dumps(D, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
html = html[:a] + data + html[b:]
a = html.rindex('<script>') + len('<script>'); b = html.rindex('</script>')
html = html[:a] + '\n' + js + html[b:]
i = html.index('</style>')
A = json.load(open(P('carav','anton.json')))
css = (open(P('v5.css')).read() + open(P('v6.css')).read() + open(P('v7.css')).read() + open(P('v8.css')).read() + open(P('v9.css')).read() + open(P('v10.css')).read() + open(P('v11.css')).read() + open(P('v12.css')).read()).replace('__ANTON_EXT__', A['ext']).replace('__ANTON_LAT__', A['lat'])
html = html[:i] + css + html[i:]
# the deployable page (katolikdunyasi.com/app/): a full document around the same app
_body = re.sub(r'^\s*<title>.*?</title>', '', html, count=1, flags=re.S)
_head = ('<!doctype html><html lang="tr"><head><meta charset="utf-8">'
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  '<title>Katolik Dünyası</title><meta name="robots" content="noindex">'
  '<meta name="description" content="Katolik inancının temel metinleri, azizler, papalar, dualar ve Türkiye’deki Katolik kiliseleri.">'
  '<meta name="theme-color" content="#f7f3ea"><link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png">'
  # the page a visitor came from decides the language: /app/?p=en/mass opens in English
  '<script>try{var q=new URLSearchParams(location.search),p=q.get("p");if(p!=null)localStorage.setItem("kdig.lang",/^en(\\/|$)/.test(p)?"en":"tr")}catch(e){}</script>'
  '</head><body style="margin:0">')
open(os.environ.get('APP_OUT') or os.path.join(B, '..', 'index.html'), 'w').write(_head + _body + '</body></html>')
print('ok', len(html) // 1024, 'KB', 'popes', len(D['popes']), 'pimg', len(D['popeimg']), 'simg', len(D['saintimg']))
