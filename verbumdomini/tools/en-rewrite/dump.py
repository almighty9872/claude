import sys; import os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))); import rwlib
p=sys.argv[1]; s,a,b,body,d=rwlib.load(p)
for path,v in rwlib.walk(d):
    if isinstance(v,str) and v and rwlib.is_en(path): print(path,'\t',v)
