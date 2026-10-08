import re
S='https://www.sefaria.org/'
V='https://www.christianunity.va/content/unitacristiani/en/commissione-per-i-rapporti-religiosi-con-l-ebraismo/commissione-per-i-rapporti-religiosi-con-l-ebraismo-crre/documenti-della-commissione/'
NA='https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_decl_19651028_nostra-aetate_en.html'
PBC='https://www.vatican.va/roman_curia/congregations/cfaith/pcb_documents/rc_con_cfaith_doc_20020212_popolo-ebraico_en.html'
JP='https://www.vatican.va/content/john-paul-ii/en/speeches/1986/april/documents/hf_jp-ii_spe_19860413_sinagoga-roma.html'
def a(href,text): return f'<a class="sref" href="{href}" target="_blank" rel="noopener">{text}</a>'
BG=lambda q:'https://www.biblegateway.com/passage/?search='+q.replace(' ','%20')+'&amp;version=RSVCE'
# (exact text, href) applied once each, in order; longest first where they overlap
RULES=[
 ('Yoma 21b',S+'Yoma.21b'),('Yoma 39b',S+'Yoma.39b'),('Yoma 5a',S+'Yoma.5a'),('Menahot 93b',S+'Menachot.93b'),
 ('Sanhedrin 97b',S+'Sanhedrin.97b'),('Sanhedrin 98a',S+'Sanhedrin.98a'),('Sanhedrin 98b',S+'Sanhedrin.98b'),
 ('Sukka 52a',S+'Sukkah.52a'),('Moed Katan 28a',S+'Moed_Katan.28a'),('Bava Batra 75b',S+'Bava_Batra.75b'),
 ('Pesahim 10:5',S+'Mishnah_Pesachim.10.5'),
 ('Yaratılış Rabba',S+'Bereshit_Rabbah.56.3'),('Levililer Rabba',S+'Vayikra_Rabbah.2.11'),
 ('Midraş Tanhuma',S+'Midrash_Tanchuma,_Toldot.14'),('Targum Yonatan',S+'Targum_Jonathan_on_Isaiah.52.13'),
 ('Zohar ise',None),
 ('Mişne Tora, Hilhot Melahim, 11. bölüm',S+'Mishneh_Torah,_Kings_and_Wars.11.4'),
 ('Nostra Aetate 4',NA),('Nostra Aetate bildirisi',NA),
 ('“Tanrı’nın Armağanları ve Çağrısı Geri Alınmaz”, 40',V+'en.html'),('“Armağanlar”, 36',V+'en.html'),('“Armağanlar”, 35',V+'en.html'),
 ('“Tanrı’nın Armağanları ve Çağrısı Geri Alınmaz”',V+'en.html'),
 ('“Hatırlıyoruz” (1998)',V+'en1.html'),('1974 Yönergeleri, I',V+'en3.html'),('yönergeleri (1974, 1985)',V+'en3.html'),
 ('Papalık Kutsal Kitap Komisyonu, 2001, 22',PBC),('Roma Sinagogu’nu ziyaret ettiğinde',JP),
 ('Yeşaya 52:13’ten 53:12’ye',BG('Isaiah 52:13-53:12')),('Yaratılış 22',BG('Genesis 22')),('Elçilerin İşleri 15',BG('Acts 15')),
 ('Yeşaya 7-11',BG('Isaiah 7-11')),('Yeşaya 49’daki',BG('Isaiah 49')),('Yeşaya 49’da',BG('Isaiah 49')),('Mezmur 22 ve Mezmur 110',None),('Mezmur 22,',None),
]
def link(s):
    if not s: return s
    for t,h in RULES:
        if t not in s: continue
        if t=='Zohar ise':
            s=s.replace(t, a(S+'Zohar%2C_Vayakhel','Zohar')+' (II, 212a) ise',1); continue
        if t=='Mezmur 22 ve Mezmur 110':
            s=s.replace(t, a(BG('Psalm 22'),'Mezmur 22')+' ve '+a(BG('Psalm 110'),'Mezmur 110')); continue
        if t=='Mezmur 22,':
            s=s.replace(t, a(BG('Psalm 22'),'Mezmur 22')+',',1); continue
        # not inside an existing link
        i=s.find(t)
        if s.rfind('<a ',0,i)>s.rfind('</a>',0,i): continue
        s=s[:i]+a(h,t)+s[i+len(t):]
    return s
def apply(D):
    D['note']=link(D['note'])
    for p in D['parts']:
        for sc in p['sections']: sc['body']=link(sc['body'])
    D['closing']['body']=link(D['closing']['body'])

# The same links in the English text
RULES_EN=[
 ('Yoma 21b',S+'Yoma.21b'),('Yoma 39b',S+'Yoma.39b'),('Yoma 5a',S+'Yoma.5a'),('Menahot 93b',S+'Menachot.93b'),
 ('Sanhedrin 97b',S+'Sanhedrin.97b'),('Sanhedrin 98a',S+'Sanhedrin.98a'),('Sanhedrin 98b',S+'Sanhedrin.98b'),
 ('Sukka 52a',S+'Sukkah.52a'),('Moed Katan 28a',S+'Moed_Katan.28a'),('Bava Batra 75b',S+'Bava_Batra.75b'),
 ('Pesahim 10:5',S+'Mishnah_Pesachim.10.5'),
 ('Genesis Rabbah',S+'Bereshit_Rabbah.56.3'),('Leviticus Rabbah',S+'Vayikra_Rabbah.2.11'),
 ('Midrash Tanhuma',S+'Midrash_Tanchuma,_Toldot.14'),('Targum Jonathan',S+'Targum_Jonathan_on_Isaiah.52.13'),
 ('the Zohar says',None),
 ('Mishneh Torah, Laws of Kings, chapter 11',S+'Mishneh_Torah,_Kings_and_Wars.11.4'),
 ('Nostra Aetate 4',NA),('declaration Nostra Aetate',NA),
 ('“The Gifts and the Calling of God Are Irrevocable”, 40',V+'en.html'),('“Gifts”, 36',V+'en.html'),('“Gifts”, 35',V+'en.html'),
 ('“The Gifts and the Calling of God Are Irrevocable”',V+'en.html'),
 ('“We Remember” (1998)',V+'en1.html'),('1974 Guidelines, I',V+'en3.html'),('(1974, 1985)',V+'en3.html'),
 ('Pontifical Biblical Commission, 2001, 22',PBC),('visited the Synagogue of Rome',JP),
 ('Isaiah 52:13 to 53:12',BG('Isaiah 52:13-53:12')),('(Genesis 22)',None),('(Acts 15)',None),
 ('Isaiah 7-11',BG('Isaiah 7-11')),('Isaiah 49,',None),('servant in Isaiah 49',None),('Psalm 22 and Psalm 110',None),('Psalm 22 is',None),
]
def link_en(s):
    if not s: return s
    for t,h in RULES_EN:
        if t not in s: continue
        if t=='the Zohar says': s=s.replace(t,'the '+a(S+'Zohar%2C_Vayakhel','Zohar')+' (II, 212a) says',1); continue
        if t=='(Genesis 22)': s=s.replace(t,'('+a(BG('Genesis 22'),'Genesis 22')+')',1); continue
        if t=='(Acts 15)': s=s.replace(t,'('+a(BG('Acts 15'),'Acts 15')+')',1); continue
        if t=='Isaiah 49,': s=s.replace(t,a(BG('Isaiah 49'),'Isaiah 49')+',',1); continue
        if t=='servant in Isaiah 49': s=s.replace(t,'servant in '+a(BG('Isaiah 49'),'Isaiah 49'),1); continue
        if t=='Psalm 22 and Psalm 110': s=s.replace(t,a(BG('Psalm 22'),'Psalm 22')+' and '+a(BG('Psalm 110'),'Psalm 110')); continue
        if t=='Psalm 22 is': s=s.replace(t,a(BG('Psalm 22'),'Psalm 22')+' is',1); continue
        i=s.find(t)
        if s.rfind('<a ',0,i)>s.rfind('</a>',0,i): continue
        s=s[:i]+a(h,t)+s[i+len(t):]
    return s
def apply_en(D):
    D['noteEn']=link_en(D['noteEn'])
    for p in D['parts']:
        for sc in p['sections']: sc['bodyEn']=link_en(sc['bodyEn'])
    D['closing']['bodyEn']=link_en(D['closing']['bodyEn'])
