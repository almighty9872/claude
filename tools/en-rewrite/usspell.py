# Makes British spellings American in the English fields of a data file (the site's English is US).
# Usage: python3 tools/en-rewrite/usspell.py data/x.js [--dry]
import sys,os,re; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))); import rwlib
W={'honour':'honor','honours':'honors','honoured':'honored','honouring':'honoring','honourable':'honorable',
'dishonour':'dishonor','dishonoured':'dishonored','defence':'defense','defences':'defenses','colour':'color','colours':'colors','coloured':'colored',
'favour':'favor','favours':'favors','favoured':'favored','favourite':'favorite','favourites':'favorites','labour':'labor','labours':'labors','laboured':'labored',
'behaviour':'behavior','neighbour':'neighbor','neighbours':'neighbors','neighbouring':'neighboring','centre':'center','centres':'centers','centred':'centered',
'theatre':'theater','fibre':'fiber','fibres':'fibers','metre':'meter','metres':'meters','kilometre':'kilometer','kilometres':'kilometers','litre':'liter',
'jewellery':'jewelry','travelled':'traveled','travelling':'traveling','traveller':'traveler','travellers':'travelers','cancelled':'canceled',
'licence':'license','licences':'licenses','grey':'gray','sceptic':'skeptic','sceptics':'skeptics','sceptical':'skeptical','plough':'plow','ploughed':'plowed',
'catalogue':'catalog','dialogue':'dialogue','programme':'program','programmes':'programs','armour':'armor','splendour':'splendor','vigour':'vigor','rumour':'rumor','rumours':'rumors',
'fervour':'fervor','candour':'candor','saviour':'savior','harbour':'harbor','endeavour':'endeavor','odour':'odor','parlour':'parlor','valour':'valor','ardour':'ardor','clamour':'clamor',
'counselled':'counseled','counselling':'counseling','marvellous':'marvelous',
'enrol':'enroll','enrolment':'enrollment','fulfil':'fulfill','fulfilment':'fulfillment','instalment':'installment','judgement':'judgment','ageing':'aging','manoeuvre':'maneuver',
'paediatric':'pediatric','anaemia':'anemia','oesophagus':'esophagus','foetus':'fetus','haemorrhage':'hemorrhage','leukaemia':'leukemia','orthopaedic':'orthopedic','encyclopaedia':'encyclopedia',
'mediaeval':'medieval','storey':'story','tyre':'tire','pyjamas':'pajamas','moustache':'mustache','sombre':'somber','spectre':'specter','sabre':'saber','lustre':'luster','calibre':'caliber','meagre':'meager'}
IZE=r'\b(baptis|organis|recognis|realis|apologis|criticis|emphasis|summaris|canonis|beatifi|evangelis|catechis|civilis|symbolis|characteris|memoris|categoris|legalis|scandalis|sympathis|agonis|antagonis|authoris|colonis|harmonis|idolis|immortalis|itemis|mobilis|modernis|neutralis|polaris|popularis|prioritis|publicis|romanis|secularis|specialis|stabilis|standardis|stigmatis|utilis|visualis|westernis|Christianis|hellenis|latinis|moralis|rationalis|revolutionis|systematis|terroris|tyrannis|vandalis|patronis|jeopardis|minimis|maximis|optimis|recognis|scrutinis|subsidis|sterilis|traumatis|womanis|anglicis|idealis|demonis|evangelis|epitomis|eulogis|fraternis|galvanis|hypnotis|lionis|liquidis|localis|magnetis|mesmeris|monopolis|naturalis|normalis|ostracis|paralys|penalis|personalis|pressuris|proselytis|rhapsodis|sanitis|satiris|sensitis|sermonis|socialis|solemnis|tantalis|temporis|theoris|vaporis|vocalis)(e|es|ed|ing|ation|ations|er|ers)\b'
def fix(t):
    def w(m):
        x=m.group(0); r=W.get(x.lower())
        if not r: return x
        return r.capitalize() if x[0].isupper() else r
    t=re.sub(r"\b[A-Za-z]+\b",w,t)
    t=re.sub(IZE,lambda m:m.group(1)[:-1]+('z' if m.group(1)[-1]=='s' else m.group(1)[-1])+m.group(2) if m.group(1).endswith('s') else m.group(0),t,flags=re.I)
    t=re.sub(r'\banalys(e|es|ed|ing)\b',r'analyz\1',t); t=re.sub(r'\bparalys(e|ed)\b',r'paralyz\1',t)
    return t
p=sys.argv[1]; s,a,b,body,d=rwlib.load(p); n=0
for path,v in list(rwlib.walk(d)):
    if isinstance(v,str) and v and rwlib.is_en(path):
        f=fix(v)
        if f!=v:
            n+=1
            if '--dry' in sys.argv:
                import difflib
                for o,nw in zip(re.findall(r'\S+',v),re.findall(r'\S+',f)):
                    if o!=nw: print(path,o,'->',nw)
            else: rwlib.put(d,path,f)
if '--dry' not in sys.argv: open(p,'w',encoding='utf-8').write(s[:a]+rwlib.dump_like(d,body)+s[b:])
print(p,'fields changed:',n)
