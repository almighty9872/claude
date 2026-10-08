import sys,json; import os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))); import rwlib
p=sys.argv[1]; patch=json.load(open(sys.argv[2],encoding='utf-8'))
s,a,b,body,d=rwlib.load(p)
for path,v in patch.items():
    old=rwlib.get(d,path); assert isinstance(old,str),path
    assert v.strip(), 'empty '+path
    assert '—' not in v, 'em dash '+path
    rwlib.put(d,path,v)
out=rwlib.dump_like(d,body)
open(p,'w',encoding='utf-8').write(s[:a]+out+s[b:]); print('applied',len(patch),'to',p)
