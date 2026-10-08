import json,re
def load(p):
    s=open(p,encoding='utf-8').read()
    if '/*JSON-START*/' in s:
        a=s.index('/*JSON-START*/')+14; b=s.index('/*JSON-END*/')
    elif p.endswith('.json'):
        a,b=0,len(s)
    else:
        a=s.index('=',s.index('window.'))+1
        while s[a] in ' \n': a+=1
        b=s.rindex(';')
    body=s[a:b]
    d=json.loads(body)
    return s,a,b,body,d
def style(body):
    m=re.search(r'\n( +)"',body); ind=len(m.group(1)) if m else None
    return ind
def dump_like(d,body):
    ind=style(body)
    out=json.dumps(d,ensure_ascii=False,indent=ind) if ind else json.dumps(d,ensure_ascii=False,separators=(',',':') if ', ' not in body[:200] else None)
    if body.endswith('\n') and not out.endswith('\n'): out+='\n'
    return out
def walk(d,path=''):
    if isinstance(d,dict):
        for k,v in d.items(): yield from walk(v,path+'/'+k)
    elif isinstance(d,list):
        for i,v in enumerate(d): yield from walk(v,path+'/'+str(i))
    else: yield path,d
def get(d,path):
    for k in path.split('/')[1:]: d=d[int(k)] if isinstance(d,list) else d[k]
    return d
def put(d,path,v):
    ks=path.split('/')[1:]
    for k in ks[:-1]: d=d[int(k)] if isinstance(d,list) else d[k]
    k=ks[-1]
    if isinstance(d,list): d[int(k)]=v
    else: d[k]=v
def is_en(path):
    k=path.split('/')[-1]; ks=path.split('/')
    return k=='en' or k.endswith('En') or (len(ks)>2 and ks[-2] in('en',) ) or any(x.endswith('En') or x=='en' for x in ks[1:-1])
