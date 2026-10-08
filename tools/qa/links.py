import re,os,glob,collections,sys
root=sys.argv[1]; bad=collections.Counter(); ids={}
files=glob.glob(root+'/*.html')
for f in files: ids[os.path.basename(f)]=set(re.findall(r'\bid="([^"]+)"',open(f,encoding='utf-8').read()))
for f in files:
    h=open(f,encoding='utf-8').read()
    for u in re.findall(r'(?:href|src)="([^"]+)"',h):
        if re.match(r'(https?:|mailto:|tel:|data:|javascript:)',u): 
            if 'katolikdunyasi.com' in u and 'hreflang' not in h[max(0,h.find(u)-60):h.find(u)]: bad['TRLINK '+u]+=1
            continue
        path,_,frag=u.partition('#'); path=path.split('?')[0]
        if path in ('','/'): target='index.html' if path=='/' else os.path.basename(f)
        else: target=path.lstrip('/')
        if not os.path.exists(os.path.join(root,target)): bad[target]+=1; continue
        if frag and target.endswith('.html') and frag not in ids.get(target,set()): bad[target+'#'+frag]+=1
for k,n in bad.most_common(40): print(n,k)
print('total bad',sum(bad.values()))
