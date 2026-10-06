/* ===== v10: Scripture, Qur'an, hadith and Catechism references open in a sheet, like the desktop popups ===== */
var RF_BOOKS={'Yaratılış':'Genesis','Mısır’dan Çıkış':'Exodus',"Mısır'dan Çıkış":'Exodus','Çıkış':'Exodus','Levililer':'Leviticus','Çölde Sayım':'Numbers','Sayılar':'Numbers','Yasa’nın Tekrarı':'Deuteronomy',"Yasa'nın Tekrarı":'Deuteronomy',
 'Yeşu':'Joshua','Hakimler':'Judges','Rut':'Ruth','Samuel':'Samuel','Krallar':'Kings','Tarihler':'Chronicles','Ezra':'Ezra','Nehemya':'Nehemiah','Tobit':'Tobit','Yudit':'Judith','Ester':'Esther',
 'Makabeler':'Maccabees','Makkabiler':'Maccabees','Eyüp':'Job','Mezmurlar':'Psalm','Mezmur':'Psalm','Süleyman’ın Özdeyişleri':'Proverbs',"Süleyman'ın Özdeyişleri":'Proverbs','Özdeyişler':'Proverbs','Vaiz':'Ecclesiastes',
 'Ezgiler Ezgisi':'Song of Songs','Neşideler Neşidesi':'Song of Songs','Bilgelik':'Wisdom','Sirak':'Sirach','Yeşaya':'Isaiah','Yeremya':'Jeremiah','Ağıtlar':'Lamentations','Baruk':'Baruch','Hezekiel':'Ezekiel','Daniel':'Daniel',
 'Hoşea':'Hosea','Yoel':'Joel','Amos':'Amos','Ovadya':'Obadiah','Yunus':'Jonah','Mika':'Micah','Nahum':'Nahum','Habakkuk':'Habakkuk','Sefanya':'Zephaniah','Hagay':'Haggai','Zekeriya':'Zechariah','Malaki':'Malachi',
 'Matta':'Matthew','Markos':'Mark','Luka':'Luke','Yuhanna':'John','Elçilerin İşleri':'Acts','Romalılar':'Romans','Korintliler':'Corinthians','Galatyalılar':'Galatians','Efesliler':'Ephesians','Filipililer':'Philippians',
 'Koloseliler':'Colossians','Selanikliler':'Thessalonians','Timoteos':'Timothy','Titus':'Titus','Filimon':'Philemon','İbraniler':'Hebrews','Yakup':'James','Petrus':'Peter','Yahuda':'Jude','Vahiy':'Revelation'};
var RF_HAD={'Buhari':['bukhari','Buhari'],'Müslim':['muslim','Müslim'],'Ebu Davud':['abudawud','Ebu Davud'],'Tirmizi':['tirmidhi','Tirmizi'],'İbn Mace':['ibnmajah','İbn Mace'],'Nesai':['nasai','Nesai']};
function rfEsc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
var RF_VL='\\d{1,3}(?:\\s?[-–]\\s?\\d{1,3})?(?:,\\s?\\d{1,3}(?:[-–]\\d{1,3})?(?!\\d*:))*';
var RF_BIB=new RegExp('(^|[^\\p{L}\\d’\'])(?:([1-3])\\.?\\s)?('+Object.keys(RF_BOOKS).sort(function(a,b){return b.length-a.length}).map(rfEsc).join('|')+')\\s(\\d{1,3}):('+RF_VL+')','gu');
var RF_MORE=new RegExp('^(;\\s?)(\\d{1,3}):('+RF_VL+')','u');
var RF_QUR=/(Kur’an|Kur'an|Kuran) (\d{1,3}:\d{1,3}(?:-\d{1,3})?(?:;\s?\d{1,3}:\d{1,3}(?:-\d{1,3})?)*)/g;
var RF_HDR=/(^|[^\p{L}])(Buhari|Müslim|Ebu Davud|Tirmizi|İbn Mace|Nesai) (\d{1,5}[a-z]?)(?![\d\p{L}])/gu;
var RF_KKK=/(^|[^\p{L}\d])(KKK|CCC)\s(\d{1,4}(?:\s?[-–]\s?\d{1,4})?(?:,\s?\d{1,4}(?:[-–]\d{1,4})?)*)/gu;
function bibKey(en,c,v){return en+' '+c+':'+String(v).replace(/–/g,'-').replace(/\s/g,'')}
// every reference in a piece of text, as [start, end, kind, key]
function rfFind(t){var out=[],m;
  RF_BIB.lastIndex=0;while((m=RF_BIB.exec(t))){var s=m.index+m[1].length,en=RF_BOOKS[m[3]];if(m[2])en=m[2]+' '+en;var e=m.index+m[0].length;out.push([s,e,'b',bibKey(en,m[4],m[5])]);
    var rest=t.slice(e),mm;while((mm=RF_MORE.exec(rest))){var s2=e+mm[1].length,e2=e+mm[0].length;out.push([s2,e2,'b',bibKey(en,mm[2],mm[3])]);e=e2;rest=t.slice(e)}RF_BIB.lastIndex=e}
  RF_QUR.lastIndex=0;while((m=RF_QUR.exec(t))){var pos=m.index+m[1].length+1;m[2].split(/;\s?/).forEach(function(p,i,arr){var at=t.indexOf(p,pos);out.push([at,at+p.length,'q',p]);pos=at+p.length})}
  RF_HDR.lastIndex=0;while((m=RF_HDR.exec(t))){var s3=m.index+m[1].length;out.push([s3,m.index+m[0].length,'h',RF_HAD[m[2]][0]+':'+m[3]])}
  RF_KKK.lastIndex=0;while((m=RF_KKK.exec(t))){var s4=m.index+m[1].length;out.push([s4,m.index+m[0].length,'k',m[3]])}
  out.sort(function(a,b){return a[0]-b[0]});var keep=[],last=-1;out.forEach(function(r){if(r[0]>=last&&r[0]>=0){keep.push(r);last=r[1]}});return keep}
// wraps the references in a part of the page in buttons; links, buttons and headings are left alone
function linkRefs(root){if(!root||!D.refs)return;var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){var p=n.parentNode;if(!p||p.closest('a,button,.rf9,h1,figcaption,textarea,script,style'))return NodeFilter.FILTER_REJECT;return /\d/.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),list=[],n;
  while((n=w.nextNode()))list.push(n);
  list.forEach(function(node){var t=node.nodeValue,R=rfFind(t);if(!R.length)return;var f=document.createDocumentFragment(),pos=0;
    R.forEach(function(r){if(r[0]>pos)f.appendChild(document.createTextNode(t.slice(pos,r[0])));var b=document.createElement('button');b.type='button';b.className='rf9 rf-'+r[2];b.setAttribute('data-rk',r[2]+'|'+r[3]);b.textContent=t.slice(r[0],r[1]);f.appendChild(b);pos=r[1]});
    if(pos<t.length)f.appendChild(document.createTextNode(t.slice(pos)));node.parentNode.replaceChild(f,node)})}
function cccUrl(n){var M=D.cccmap||[];for(var i=0;i<M.length;i++)if(n>=M[i].from&&n<=M[i].to)return M[i].url;return 'https://www.vatican.va/content/catechism/en.html'}
var RF_TR_BOOK={};Object.keys(RF_BOOKS).forEach(function(k){if(!RF_TR_BOOK[RF_BOOKS[k]])RF_TR_BOOK[RF_BOOKS[k]]=k});
// in English the texts cite the English book names, "Qur’an" and the English collection names
if(LANG==='en'){
  RF_BOOKS={};['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','Samuel','Kings','Chronicles','Ezra','Nehemiah','Tobit','Judith','Esther','Maccabees','Job','Psalm','Proverbs','Ecclesiastes','Song of Songs','Wisdom','Sirach','Isaiah','Jeremiah','Lamentations','Baruch','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','Corinthians','Galatians','Ephesians','Philippians','Colossians','Thessalonians','Timothy','Titus','Philemon','Hebrews','James','Peter','Jude','Revelation'].forEach(function(k){RF_BOOKS[k]=k});RF_BOOKS.Psalms='Psalm';
  RF_BIB=new RegExp('(^|[^\\p{L}\\d’\'])(?:([1-3])\\.?\\s)?('+Object.keys(RF_BOOKS).sort(function(a,b){return b.length-a.length}).map(rfEsc).join('|')+')\\s(\\d{1,3}):('+RF_VL+')','gu');
  RF_QUR=/(Qur’an|Qur'an|Quran) (\d{1,3}:\d{1,3}(?:-\d{1,3})?(?:;\s?\d{1,3}:\d{1,3}(?:-\d{1,3})?)*)/g;
  RF_HAD={'Bukhari':['bukhari','Bukhari'],'Muslim':['muslim','Muslim'],'Abu Dawud':['abudawud','Abu Dawud'],'Tirmidhi':['tirmidhi','Tirmidhi'],'Ibn Majah':['ibnmajah','Ibn Majah'],'Nasa’i':['nasai','Nasa’i'],"Nasa'i":['nasai','Nasa’i']};
  RF_HDR=/(^|[^\p{L}])(Bukhari|Muslim|Abu Dawud|Tirmidhi|Ibn Majah|Nasa’i|Nasa'i) (\d{1,5}[a-z]?)(?![\d\p{L}])/gu;
  RF_TR_BOOK={};Object.keys(RF_BOOKS).forEach(function(k){RF_TR_BOOK[RF_BOOKS[k]]=RF_BOOKS[k]});
}
function rfLabel(kind,key,txt){if(kind==='q')return (LANG==='en'?'Qur’an ':'Kur’an ')+key;if(kind==='h'){var p=key.split(':'),nm='';Object.keys(RF_HAD).forEach(function(k){if(RF_HAD[k][0]===p[0])nm=RF_HAD[k][1]});return nm+' '+p[1]}if(kind==='k')return (LANG==='en'?'CCC ':'KKK ')+key;
  if(/^\d+:/.test(txt||'')){var m=key.match(/^(?:([1-3]) )?(.+?) \d/);return (m[1]?m[1]+' ':'')+(RF_TR_BOOK[m[2]]||m[2])+' '+txt}return txt||key}
function rfVerses(list,pick){return '<p class="rf-tx">'+list.map(function(v){return (list.length>1?'<sup>'+v[0]+'</sup>':'')+esc(pick(v))}).join(' ')+'</p>'}
function rfSrc(kind){return {b:'Türkçe çeviri bize aittir. İngilizcesi: Douay-Rheims.',q:'Arapça: Tanzil. Türkçe çeviri bize aittir. İngilizcesi: Pickthall.',h:'Numaralar sunnah.com’a göredir. Türkçe ve İngilizce çeviriler bize aittir.',k:''}[kind]}
function rfOut(kind,key){if(kind==='b')return 'https://www.biblegateway.com/passage/?search='+encodeURIComponent(key)+'&version=RSVCE';if(kind==='q'){var p=key.split(':');return 'https://quran.com/'+p[0]+'/'+p[1]}if(kind==='h')return 'https://sunnah.com/'+key;return cccUrl(parseInt(key,10))}
function openRef(kind,key,label,fallback){
  if(lastToast){lastToast.remove();lastToast=null}
  var R=D.refs||{},item=kind==='b'?R.b[key]:kind==='q'?R.q[key]:kind==='h'?R.h[key]:null,html='',plainTr='';
  if(kind==='b'&&item){var bA=LANG==='en'?item.en:item.tr,bB=LANG==='en'?item.tr:item.en;html=rfVerses(bA,function(v){return v[1]})+'<details class="rf-en" data-notr><summary>'+(LANG==='en'?'Turkish':'İngilizcesi (Douay-Rheims)')+'</summary>'+rfVerses(bB,function(v){return v[1]})+'</details>';plainTr=bA.map(function(v){return v[1]}).join(' ')}
  else if(kind==='q'&&item){html='<p class="rf-ar" lang="ar" dir="rtl">'+item.map(function(v){return esc(v[1])+' <span class="rf-ay">﴿'+v[0].toLocaleString('ar-EG')+'﴾</span>'}).join(' ')+'</p>'+rfVerses(item,function(v){return v[LANG==='en'?3:2]})+'<details class="rf-en" data-notr><summary>'+(LANG==='en'?'Turkish':'İngilizcesi (Pickthall)')+'</summary>'+rfVerses(item,function(v){return v[LANG==='en'?2:3]})+'</details>';plainTr=item.map(function(v){return v[LANG==='en'?3:2]}).join(' ')}
  else if(kind==='h'&&item){html='<p class="rf-ar" lang="ar" dir="rtl">'+esc(item.ar)+'</p><p class="rf-tx">'+esc(LANG==='en'?item.en:item.tr)+'</p><details class="rf-en" data-notr><summary>'+(LANG==='en'?'Turkish':'İngilizcesi')+'</summary><p class="rf-tx" lang="'+(LANG==='en'?'tr':'en')+'">'+esc(LANG==='en'?item.tr:item.en)+'</p></details>';plainTr=LANG==='en'?item.en:item.tr}
  else if(kind==='k'){var nums=key.split(/,\s?/);html='<p class="rf-note">Katolik Kilisesi Katekizmi’nin bu paragraflarını Vatikan’ın sitesinde okuyabilirsiniz. Katekizm’in metni telif hakkıyla korunduğu için burada yer almıyor.</p><div class="rf-ccc">'+nums.map(function(x){var n=parseInt(x,10);return '<a href="'+cccUrl(n)+'" target="_blank" rel="noopener">'+ic('book')+'<span><b>'+(LANG==='en'?'CCC ':'KKK ')+esc(x.replace('-','–'))+'</b><small>vatican.va’da aç</small></span>'+ic('chevr')+'</a>'}).join('')+'</div>'}
  else if(fallback){html='<p class="rf-tx">'+esc(fallback)+'</p>';plainTr=fallback}
  else html='<p class="rf-note">Bu metin henüz koleksiyonumuzda yok. Kaynağında okuyabilirsiniz.</p>';
  var kindLab={b:'Kutsal Kitap',q:'Kur’an',h:'Hadis',k:'Katekizm'}[kind];
  var dim=h('<div class="dim"></div>'),sh=h('<div class="sheet rfsh" role="dialog" aria-label="'+esc(label)+'"><div class="gb"></div><div class="rf-hd"><small>'+kindLab+'</small><h4>'+esc(label)+'</h4></div><div class="sc">'+html
    +(item||fallback?'<p class="rf-src">'+esc(rfSrc(kind)||'')+'</p>':'')
    +'<div class="rf-bt">'+(plainTr?'<button type="button" class="pri" data-rfnote>'+ic('plusn')+' Notlara ekle</button>':'')+(kind!=='k'?'<a href="'+rfOut(kind,key)+'" target="_blank" rel="noopener">Kaynağında aç ↗</a>':'')+'</div></div></div>');
  function close(){dim.remove();sh.remove()}
  dim.addEventListener('click',close);app.appendChild(dim);app.appendChild(sh);
  var nb=sh.querySelector('[data-rfnote]');if(nb)nb.addEventListener('click',function(){addClip(plainTr+' ('+label+')',readerKey());close()});
  var f=sh.querySelector('summary,a,button');if(f)try{f.focus({preventScroll:true})}catch(e){}
}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-rk]');if(!b||!app.contains(b))return;if(window.getSelection&&!window.getSelection().isCollapsed&&!b.classList.contains('q9ref'))return;
  e.preventDefault();e.stopPropagation();var v=b.getAttribute('data-rk'),i=v.indexOf('|'),kind=v.slice(0,i),key=v.slice(i+1);
  openRef(kind,key,b.getAttribute('data-rl')||rfLabel(kind,key,b.textContent.trim()),b.getAttribute('data-rf')||'')},true);

// readers and the question-and-answer chats get tappable references
var readerExtras10=readerExtras;
readerExtras=function(){var rd=view.querySelector('article.rd');if(rd)linkRefs(rd);readerExtras10()};
var render10=render;
render=function(name,arg){render10(name,arg);if(name==='chat'||name==='church'||name==='profile'||name==='post')view.querySelectorAll('.m,.chs p,.ptpane p,.cap .txt').forEach(linkRefs)};
// in the chats, new answers arrive as the visitor scrolls
new MutationObserver(function(ms){var top=stack[stack.length-1];if(!top||top.name!=='chat')return;ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1&&n.matches&&n.matches('.m,.mrow,.msg'))linkRefs(n)})})}).observe(view,{childList:true,subtree:true});
// story sheets for posts and comments: the answers in the comment sheet
new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1&&n.classList&&n.classList.contains('sheet')&&!n.classList.contains('rfsh'))linkRefs(n.querySelector('.sc')||n)})})}).observe(app,{childList:true});

// the Bible verse posts in the feed: the reference under the verse opens the passage
var paintedSlide10=paintedSlide;
paintedSlide=function(s,i,k,p){var r=paintedSlide10(s,i,k,p);if(s.type!=='quote'||!s.bib)return r;
  var R=rfFind(s.by);if(!R.length)return r;var key=R[0][3];
  return r.replace('<span class="q9by">','<button type="button" class="q9by q9ref" data-rk="b|'+esc(key)+'" data-rl="'+esc(s.by)+'" data-rf="'+esc(s.q)+'" aria-label="'+esc(s.by)+': metni ve İngilizcesini aç">').replace(/(<button type="button" class="q9by q9ref"[^>]*>[\s\S]*?)<\/span><\/div>/,'$1</button></div>')};

/* ----- stories wait for the reader: no timer; arrows at the edges; each section is one menu ----- */
var STORY_MANUAL=true;
function storyList(L){return '<div class="slist">'+L.map(function(o){return '<button type="button" class="sli" data-act="'+esc(o.go)+'"><span class="slth'+(o.pa?' pa-'+o.pa:'')+'"></span><span class="slt"><b>'+esc(o.t)+'</b>'+(o.x?'<small>'+esc(cut(plain(o.x),70))+'</small>':'')+'</span>'+ic('chevr')+'</button>'}).join('')+'</div>'}
storySlides=(function(o){return function(id){var s=secOf(id);if(!s)return o(id);var it=secItems(s);
  return [{kick:'katolikdunyasi',title:secNm(s.g),text:s.lead,pa:pk9.apply(null,s.pa),list:it}]}})(storySlides);
