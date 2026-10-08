import sys,json; import os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))); import rwlib
# patch: [[path, old, new], ...]
p=sys.argv[1]; patch=json.load(open(sys.argv[2],encoding='utf-8'))
s,a,b,body,d=rwlib.load(p)
for path,o,n in patch:
    v=rwlib.get(d,path); assert isinstance(v,str),path
    assert v.count(o)==1, ('not unique/missing',path,o[:60])
    assert '—' not in n
    rwlib.put(d,path,v.replace(o,n))
open(p,'w',encoding='utf-8').write(s[:a]+rwlib.dump_like(d,body)+s[b:]); print('subbed',len(patch),'in',p)
