(function(){
'use strict';
var D=JSON.parse(document.getElementById('data').textContent);
var app=document.getElementById('app'), view=document.getElementById('view'), tabsEl=document.getElementById('tabs');
var SITE='https://katolikdunyasi.com/';
/* ---------- per-viewer storage (optional; the page works without it) ---------- */
function sget(k,d){try{var v=localStorage.getItem('kdig.'+k);return v?JSON.parse(v):d}catch(e){return d}}
function sset(k,v){try{localStorage.setItem('kdig.'+k,JSON.stringify(v))}catch(e){}}
var saved=sget('saved',{}), liked=sget('liked',{}), seen=sget('seen',{}), progress=sget('progress',{}), follows=sget('follows',[]);
/* ---------- helpers ---------- */
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function h(html){var t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstElementChild}
function plain(s){return String(s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim()}
function cut(s,n){s=plain(s);if(s.length<=n)return s;var c=s.slice(0,n);var k=c.lastIndexOf(' ');c=c.slice(0,k>40?k:n).replace(/[\s,;:–-]+$/,'');return /[.!?…]$/.test(c)?c:c+'…'}
function sentences(s){return plain(s).match(/[^.!?…]+[.!?…]+["”’)]*|[^.!?…]+$/g)||[]}
function chunks(text,max){var out=[],cur='';sentences(text).forEach(function(x){x=x.trim();if(!x)return;if((cur+' '+x).length>max&&cur){out.push(cur.trim());cur=x}else cur+=' '+x});if(cur.trim())out.push(cur.trim());return out}
var ICONS={
home:'<path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
reels:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M3 8.5h18M8 3l3 5.5M14 3l3 5.5"/><path d="M10 12v5l4.3-2.5z"/>',
heart:'<path d="M12 20s-7-4.4-9-8.6C1.6 8.3 3.6 5 7 5c2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3.4 0 5.4 3.3 4 6.4C19 15.6 12 20 12 20z"/>',
comment:'<path d="M20.6 16.4A8.6 8.6 0 1 0 17.3 20L21 21z"/>',
send:'<path d="M22 3 9.3 10.2M22 3l-6.6 18-4.1-8.6L3 8.7z"/>',
save:'<path d="M19 21l-7-5.2L5 21V4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5z"/>',
more:'<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>',
back:'<path d="M15 4 7 12l8 8"/>', x:'<path d="M5 5l14 14M19 5 5 19"/>',
grid:'<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
book:'<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>',
menu:'<path d="M4 7h16M4 12h16M4 17h16"/>', chev:'<path d="m6 9 6 6 6-6"/>', ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
};
function ic(n,cls){return '<svg class="i'+(cls?' '+cls:'')+'" viewBox="0 0 24 24" aria-hidden="true">'+ICONS[n]+'</svg>'}
/* the Jerusalem cross from the site's own logo */
var JC='<svg class="jc" viewBox="0 0 100 100" aria-hidden="true"><rect x="44.5" y="10" width="11" height="80" rx="1"/><rect x="10" y="44.5" width="80" height="11" rx="1"/><rect x="32" y="7" width="36" height="9" rx="1"/><rect x="32" y="84" width="36" height="9" rx="1"/><rect x="7" y="32" width="9" height="36" rx="1"/><rect x="84" y="32" width="9" height="36" rx="1"/><rect x="24.5" y="18" width="5" height="18" rx=".6"/><rect x="18" y="24.5" width="18" height="5" rx=".6"/><rect x="70.5" y="18" width="5" height="18" rx=".6"/><rect x="64" y="24.5" width="18" height="5" rx=".6"/><rect x="24.5" y="64" width="5" height="18" rx=".6"/><rect x="18" y="70.5" width="18" height="5" rx=".6"/><rect x="70.5" y="64" width="5" height="18" rx=".6"/><rect x="64" y="70.5" width="18" height="5" rx=".6"/></svg>';
D.ill.tiara='<path d="M44 96h32l-4-52c-1-13-6-22-12-22s-11 9-12 22z"/><path d="M45 82h30M47 64h26M50 46h20"/><path d="M60 22V10M55 15h10"/><path d="M48 96v12M72 96v12"/>';
function art(k,cls){if(k==='jc')return JC;return '<svg class="art'+(cls?' '+cls:'')+'" viewBox="0 0 120 120" aria-hidden="true">'+(D.ill[k]||D.ill.cross)+'</svg>'}
var TONES={gold:['#fff1c9','#9b6a10'],red:['#ffe3e8','#b42346'],blue:['#e1ecff','#2856a3'],green:['#dcf3e6','#1f7a4a'],purple:['#efe2ff','#6b3fb0'],indigo:['#e6e9ff','#3d46b8'],orange:['#ffe9d8','#b0531a'],teal:['#d9f2f2','#17706f']};
function tone(t){return TONES[t]||TONES.gold}
function av(a,t,size){var c=tone(t);return '<span class="av" style="width:'+size+'px;height:'+size+'px;background:'+c[0]+';color:'+c[1]+'">'+(a==='jc'?'<span style="width:58%;height:58%;display:block">'+JC+'</span>':art(a))+'</span>'}
function ringAv(acc,size){var c=tone(acc.tone);return '<span class="ring'+(seen[acc.id]?' seen':'')+'" style="width:'+size+'px;height:'+size+'px"><span class="in"><span class="av" style="background:'+c[0]+';color:'+c[1]+'">'+(acc.art==='jc'?'<span style="width:58%;height:58%;display:block">'+JC+'</span>':art(acc.art))+'</span></span></span>'}
var lastToast=null;function toast(msg,ok){if(lastToast)lastToast.remove();var t=lastToast=h('<div class="toast'+(ok?' ok':'')+'" role="status">'+esc(msg)+'</div>');app.appendChild(t);setTimeout(function(){t.remove()},1900)}
/* Share: the same as the site, the device's own share sheet first, else the address is copied */
function share(path,title){
  var url=SITE+(path||''); title=title||'Katolik Dünyası';
  function copy(){try{navigator.clipboard.writeText(url).then(function(){toast('Bağlantı kopyalandı',true)},function(){toast(url)})}catch(e){toast(url)}}
  if(navigator.share){navigator.share({title:title,url:url})['catch'](function(e){if(!e||e.name!=='AbortError')copy()});return}
  copy();
}
/* ---------- today and the liturgical season ---------- */
var now=new Date(), Y=now.getFullYear(), M=now.getMonth()+1, Dd=now.getDate(), WD=now.getDay();
var AYLAR=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
var GUN=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
var todayLabel=LANG==='en'?AYLAR[M-1]+' '+Dd:Dd+' '+AYLAR[M-1];
function easter(y){var a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h2=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h2-k)%7,m=Math.floor((a+11*h2+22*l)/451),mo=Math.floor((h2+l-7*m+114)/31),da=((h2+l-7*m+114)%31)+1;return new Date(y,mo-1,da)}
function addD(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x}
function day0(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function season(d){
  d=day0(d); var y=d.getFullYear(), E=easter(y);
  var xmas=new Date(y,11,25), w=xmas.getDay(), adv=addD(xmas,-(w===0?28:w+21));
  var ep=new Date(y,0,6), bapt=addD(ep,7-ep.getDay()); // the Sunday after 6 January
  if(d>=xmas||d<bapt) return {id:'noel',t:'Noel Dönemi',c:'#e2bd70',q:[103,85,87,95,104,101]};
  if(d>=adv) return {id:'advent',t:'Advent',c:'#7a4fb5',q:[102,85,86,94,96,97]};
  var ash=addD(E,-46);
  if(d>=ash&&d<addD(E,-3)) return {id:'perhiz',t:'Büyük Perhiz',c:'#7a4fb5',q:[301,300,303,112,118,122]};
  if(d>=addD(E,-3)&&d<E) return {id:'triduum',t:'Kutsal Üç Gün',c:'#b42346',q:[112,117,119,120,122,126]};
  if(d>=E&&d<=addD(E,49)) return {id:'paskalya',t:'Paskalya Dönemi',c:'#e2bd70',q:[126,127,128,129,131,144]};
  return {id:'olagan',t:'Olağan Zaman',c:'#3f9a5c',q:null};
}
var SEASON=season(now);
var dayRec=D.days[M+'-'+Dd]||D.days['1-1'];
var todaySaint=dayRec[0]; var dayRank=(dayRec[1]&&dayRec[1].rank)||'';
var todaySet=D.tes.sets.filter(function(s){return s.days.indexOf(WD)>=0})[0]||D.tes.sets[0];
var SET_ART={sevinc:['star','blue'],isik:['tabor','gold'],aci:['thorns','red'],yucelik:['dove','purple']};
function normName(s){return plain(s).toLowerCase().replace(/[’']/g,'')}
var bigOfToday=D.saints.filter(function(s){return normName(s.name)===normName(todaySaint.n)})[0];
var doy=Math.floor((now-new Date(Y,0,0))/864e5);
function pick(arr,off){return arr[(doy+(off||0))%arr.length]}
/* ---------- the Catechism (Compendium) index ---------- */
var CQ={}, CPART={}; // question number -> [n,q,a] and its part
D.comp.forEach(function(p,pi){p.items.forEach(function(it){if(it[0]==='q'){CQ[it[1]]=it;CPART[it[1]]=pi}})});
var PART_TONE=['gold','purple','green','blue'], PART_ART=['cross','chalice','tablets','candle'];
var CHAPTERS=[]; // level-3 headings with their part
D.comp.forEach(function(p,pi){var first=null;p.items.forEach(function(it,ii){if(it[0]==='h'&&it[1]===3)CHAPTERS.push({pi:pi,ii:ii,t:it[2]});if(it[0]==='q'&&first===null)first=it[1]});p.first=first});
function seededQs(n){var all=Object.keys(CQ).map(Number),out=[],x=Y*1000+doy;while(out.length<n){x=(x*9301+49297)%233280;var q=all[Math.floor(x/233280*all.length)];if(out.indexOf(q)<0)out.push(q)}return out}
var STORY_QS=SEASON.q||seededQs(6);
/* ---------- accounts ---------- */
var ACC={}, ORDER=[];
function addAcc(a){ACC[a.id]=a;ORDER.push(a.id);return a}
addAcc({id:'me',name:'Katolik Dünyası',handle:'katolikdunyasi',art:'jc',tone:'gold',cat:'Katolik Portalı',bio:'katolikdunyasi.com, Katolik inancının temel metinlerini ve öğretisini Türkçe olarak erişilebilir kılmak için hazırlanmıştır.',url:''});
addAcc({id:'bugun',name:'Bugün',handle:'bugun',art:'cross',tone:'gold',cat:'Günün akışı',bio:todayLabel+', '+GUN[WD]+'.'});
addAcc({id:'katekizm',name:'Katekizm',handle:'katekizm',art:'book',tone:'gold',cat:'Katolik Kilisesi İnanç Esasları Özeti',bio:'Katolik inancının özeti: 598 soru ve kısa, açık cevapları. Dört kısım: İnanç Beyanı, Kutsal Sırlar, Mesih’te Yaşam, Hristiyan Duası.',url:'katekizm.html',read:'comp:0'});
addAcc({id:'azizler',name:'Azizler',handle:'azizler',art:'lily',tone:'red',cat:'Her gün bir aziz',bio:'Kilise takviminden her güne bir aziz ve Katolik geleneğinde en çok bilinen yirmi aziz.',url:'azizler.html'});
addAcc({id:'papalar',name:'Papalar',handle:'papalar',art:'tiara',tone:'gold',cat:'Petrus’tan XIV. Leo’ya',bio:'Kilise tarihine yön veren papalar: hayatları, önemli belgeleri ve Türkiye ile bağları. Takipçi ve takip listeleri papaları sırasıyla birbirine bağlar.'});
addAcc({id:'tesbih',name:'Tesbih Duası',handle:'tesbih.duasi',art:'beads',tone:'gold',cat:'Dua Et',bio:'Gizemlerle birlikte, tane tane. Bugün: '+todaySet.t+'.',url:'tesbih-duasi.html'});
addAcc({id:'gunah',name:'Günah Çıkarma',handle:'gunah.cikarma',art:'keys',tone:'indigo',cat:'Rehber · Dua Et',bio:'İnsanların en çok çekindiği ama en çok özgürleştiren kutsal sır. İlk kez ya da uzun bir aradan sonra gidecekler için.',url:'gunah-cikarma.html',read:'gunah'});
addAcc({id:'ayin',name:'Kutsal Ayin',handle:'kutsal.ayin',art:'chalice',tone:'purple',cat:'Dua Et',bio:cut(D.mass.intro,160),url:'kutsal-ayin.html',read:'mass'});
addAcc({id:'kilise',name:'Kilise Bul',handle:'kilise.bul',art:'church',tone:'orange',cat:'Türkiye’de Katolik kiliseler',bio:'Türkiye’deki Katolik kiliseleri: adresleri, ayin saatleri ve tarihçeleri.',url:'kiliseler.html'});
addAcc({id:'islam',name:'İslam’a Cevap',handle:'islama.cevap',art:'scroll',tone:'green',cat:'Tartış',bio:cut(D.isl.lead,150),url:'islama-cevap.html',read:'islam'});
addAcc({id:'ateizm',name:'Ateizme Cevap',handle:'ateizme.cevap',art:'cosmos',tone:'blue',cat:'Tartış',bio:cut(D.ate.lead,150),url:'ateizme-cevap.html',read:'ateizm'});
addAcc({id:'neden',name:'Neden Katoliğiz?',handle:'neden.katoligiz',art:'door',tone:'teal',cat:'Öğren',bio:cut(D.pages.neden.lead,150),url:'neden-katoligiz.html',read:'page:neden'});
addAcc({id:'surec',name:'Katolik Olma Süreci',handle:'katolik.olmak',art:'shell',tone:'blue',cat:'Öğren',bio:cut(D.pages.surec.lead,150),url:'katolik-sureci.html',read:'page:surec'});
addAcc({id:'meseller',name:'Meseller',handle:'meseller',art:'wheat',tone:'green',cat:'Öğren',bio:'İsa’nın anlattığı otuz iki mesel, kısa açıklamalarıyla.',url:'meseller.html'});
addAcc({id:'mucizeler',name:'Mucizeler',handle:'mucizeler',art:'monstrance',tone:'purple',cat:'Keşfet',bio:'Kilise’nin incelediği görünmeler, Efkaristiya mucizeleri ve çürümeyen azizler.',url:'mucizeler.html'});
addAcc({id:'topraklar',name:'Topraklarımızda Hristiyanlık',handle:'topraklarimizda',art:'basilica',tone:'orange',cat:'Keşfet',bio:cut(D.pages.topraklar.lead,150),url:'topraklarimizda-hristiyanlik.html',read:'page:topraklar'});
addAcc({id:'tesbihtarihi',name:'Tesbihin Tarihi',handle:'tesbihin.tarihi',art:'rose',tone:'red',cat:'Dua Et',bio:cut(D.pages.tesbihtarihi.lead,150),url:'tesbih-tarihi.html',read:'page:tesbihtarihi'});
addAcc({id:'sss',name:'Sık Sorulan Sorular',handle:'sorular',art:'knock',tone:'orange',cat:'Öğren',bio:'Katolik inancı hakkında en çok sorulanlar ve kısa cevapları.',url:'sss.html'});
D.saints.forEach(function(s){addAcc({id:s.id,name:s.name,handle:s.id.replace(/-/g,'.'),art:s.art,tone:s.tone,cat:s.ep,bio:plain(s.sum),url:s.id+'.html',saint:s,ver:true,read:'saint:'+s.id})});
var POPE_LINE=[]; // ids in order
D.popes.forEach(function(p){
  if(p.link){ACC[p.id].ord=p.ord;POPE_LINE.push(p.id);return}
  addAcc({id:p.id,name:p.name,handle:p.id.replace(/-/g,'.'),art:'tiara',tone:p.tone,cat:p.cat+' · '+p.years,bio:p.bio,pope:p,ord:p.ord,ver:true,read:'pope:'+p.id,url:'azizler.html'});
  POPE_LINE.push(p.id);
});
function popeIdx(id){return POPE_LINE.indexOf(id)}
/* ---------- markdown-ish body to sections ---------- */
function sectionsOf(body,title){
  var out=[],cur={t:title||'',p:[]};
  String(body||'').split(/\n+/).forEach(function(line){line=line.trim();if(!line)return;var m=line.match(/^#{2,3}\s+(.*)/);
    if(m){if(cur.p.length||cur.t!==title)out.push(cur);cur={t:plain(m[1]),p:[]}}else cur.p.push(line.replace(/^>\s*/,''))});
  if(cur.p.length)out.push(cur);return out;
}
/* ---------- posts ---------- */
function slideCover(a,t,kick,title,sub){var c=tone(t);return {type:'cover',bg:c[0],ink:c[1],art:a,kick:kick,title:title,sub:sub}}
function slideText(a,t,n,title,text){var c=tone(t);return {type:'text',bg:c[0],ink:c[1],art:a,n:n,title:title,text:text}}
var POSTS={};
function addPost(p){POSTS[p.id]=p;return p}
D.saints.forEach(function(s){var secs=sectionsOf(s.body,'');var sl=[slideCover(s.art,s.tone,s.ep,s.name,s.era)];secs.slice(0,5).forEach(function(sec){sl.push(slideText(s.art,s.tone,'',sec.t||s.name,cut(sec.p.join(' '),300)))});addPost({id:'p-'+s.id,acc:s.id,slides:sl,cap:plain(s.sum),meta:sl.length+' kare · simgesi: '+s.emb,read:'saint:'+s.id,kind:'aziz',title:s.name})});
D.popes.forEach(function(p){if(p.link)return;var sl=[slideCover('tiara',p.tone,p.cat,p.name,p.years)];p.secs.forEach(function(s){sl.push(slideText('tiara',p.tone,'',s[0],cut(s[1],300)))});addPost({id:'p-'+p.id,acc:p.id,slides:sl,cap:p.bio,meta:p.ord+'. papa · '+p.years,read:'pope:'+p.id,kind:'papa',title:p.name})});
var tsArt=bigOfToday?bigOfToday.art:'lily', tsTone=bigOfToday?bigOfToday.tone:'red';
var tsSlides=[slideCover(tsArt,tsTone,'Bugünün azizi · '+todayLabel,todaySaint.n,todaySaint.t)];
chunks(todaySaint.b,260).slice(0,4).forEach(function(c,i){tsSlides.push(slideText(tsArt,tsTone,i+1,i?'':todaySaint.n,c))});
addPost({id:'p-today',acc:'azizler',sub:'Bugünün azizi · '+todayLabel,slides:tsSlides,cap:cut(todaySaint.b,140),capFull:plain(todaySaint.b),meta:(dayRank?dayRank+' · ':'')+tsSlides.length+' kare',read:bigOfToday?'saint:'+bigOfToday.id:'today',kind:'aziz',title:todaySaint.n});
var sa=SET_ART[todaySet.id]||['beads','gold'];
var msl=[slideCover(sa[0],sa[1],'Bugün · '+GUN[WD],todaySet.t,todaySet.dt)];
todaySet.items.forEach(function(it,i){msl.push(slideText(sa[0],sa[1],i+1,(i+1)+'. gizem',it))});
addPost({id:'p-myst',acc:'tesbih',sub:'Günün gizemi',slides:msl,cap:'Bugün '+todaySet.t+'. Kaydırarak beş gizemi okuyun, sonra tesbihe başlayın.',meta:'5 gizem · yaklaşık 20 dakika',act:'rosary',kind:'dua',title:todaySet.t});
var gsl=[slideCover('keys','indigo','Adım adım rehber','Günah Çıkarma','İlk kez ya da uzun bir aradan sonra')];
D.gun.steps.forEach(function(s,i){gsl.push(slideText('keys','indigo',i+1,s.t,cut(s.x,320)))});
addPost({id:'p-gunah',acc:'gunah',slides:gsl,cap:'Kaydırarak sırayla okuyun: hazırlıktan bağışlanmaya '+D.gun.steps.length+' adım.',meta:gsl.length+' kare · 6 dakikalık okuma',read:'gunah',kind:'dua',title:'Günah Çıkarma'});
var asl=[slideCover('chalice','purple','Ayinin sırası','Kutsal Ayin',D.mass.parts.length+' bölüm')];
D.mass.parts.forEach(function(p){asl.push(slideText('chalice','purple',p.n,p.t,cut(p.lead,300)))});
addPost({id:'p-ayin',acc:'ayin',slides:asl,cap:cut(D.mass.intro,140),capFull:plain(D.mass.intro),meta:asl.length+' kare',read:'mass',kind:'dua',title:'Kutsal Ayin'});
function casePost(id,acc,cs,a,t){var sl=[slideCover(a,t,'Kısaca',cs.title,'')];cs.tldr.forEach(function(x,i){sl.push(slideText(a,t,i+1,x.t,cut(x.x,320)))});return addPost({id:id,acc:acc,slides:sl,cap:cut(cs.lead,150),capFull:plain(cs.lead),meta:sl.length+' kare',read:acc,kind:'tartis',title:cs.title})}
casePost('p-islam','islam',D.isl,'scroll','green');
casePost('p-ateizm','ateizm',D.ate,'cosmos','blue');
['neden','topraklar','tesbihtarihi','surec'].forEach(function(k){var pg=D.pages[k],a=ACC[k];var sl=[slideCover(a.art,a.tone,a.cat,pg.t,'')];pg.secs.slice(0,6).forEach(function(s,i){sl.push(slideText(a.art,a.tone,i+1,s[0],cut(s[1].join(' '),300)))});addPost({id:'p-'+k,acc:k,slides:sl,cap:cut(pg.lead,150),capFull:plain(pg.lead),meta:sl.length+' kare',read:'page:'+k,kind:'ogren',title:pg.t})});
D.mes.forEach(function(m){var sl=[slideCover('wheat','green',m.cat,m.n,m.ref)];chunks(m.b,300).slice(0,3).forEach(function(c,i){sl.push(slideText('wheat','green','',i?'':m.n,c))});addPost({id:'p-mes-'+m.id,acc:'meseller',slides:sl,cap:cut(m.b,130),capFull:plain(m.b),meta:m.ref,kind:'ogren',title:m.n})});
D.mir.forEach(function(m){var sl=[slideCover('monstrance','purple',m.cat,m.n,m.p)];chunks(m.b,300).slice(0,4).forEach(function(c,i){sl.push(slideText('monstrance','purple','',i?'':m.n,c))});addPost({id:'p-mir-'+m.id,acc:'mucizeler',slides:sl,cap:cut(m.b,130),capFull:plain(m.b),meta:m.p,kind:'ogren',title:m.n})});
var cq0=CQ[STORY_QS[0]];
addPost({id:'p-cq',acc:'katekizm',sub:SEASON.q?SEASON.t+' · Katekizm':'Günün sorusu',slides:[slideCover('book',PART_TONE[CPART[cq0[1]]],'Soru '+cq0[1],cq0[2],'')].concat(chunks(cq0[3],300).slice(0,3).map(function(c){return slideText('book',PART_TONE[CPART[cq0[1]]],'','',c)})),cap:cut(cq0[3],140),capFull:plain(cq0[3]),meta:'Katekizm · soru '+cq0[1],read:'comp:'+CPART[cq0[1]]+'#'+cq0[1],kind:'ogren',title:'Soru '+cq0[1]});
function postOf(id){return POSTS['p-'+id]||(id==='tesbih'?POSTS['p-myst']:id==='katekizm'?POSTS['p-cq']:null)}
var FEED=['p-today','p-cq','p-myst','p-gunah',pick(D.mes.map(function(m){return 'p-mes-'+m.id})),'p-'+pick(D.popes.filter(function(p){return !p.link}),2).id,'p-islam','p-ayin','p-'+pick(D.saints,3).id,pick(D.mir.map(function(m){return 'p-mir-'+m.id})),'p-ateizm','p-neden','p-'+pick(D.saints,11).id];
/* ---------- router ---------- */
var stack=[], tab='home';
function go(name,arg){stack.push({name:name,arg:arg,scroll:view.scrollTop});render(name,arg);view.scrollTop=0}
function back(){stack.pop();var top=stack[stack.length-1];if(!top){setTab(tab);return}render(top.name,top.arg);var sc=top.scroll||0;requestAnimationFrame(function(){view.scrollTop=sc})}
function setTab(t,arg){tab=t;stack=[{name:t,arg:arg}];render(t,arg);view.scrollTop=0;drawTabs()}
function drawTabs(){
  var T=[['home',ic('home'),'Ana sayfa'],['explore',ic('search'),'Keşfet'],['katekizm',JC,'Katekizm'],['kilisetab',ic('church'),'Kilise Bul'],['me','<span class="me">'+ICH+'</span>','Katolik Dünyası profili']];
  tabsEl.innerHTML=T.map(function(x){return '<button type="button" data-tab="'+x[0]+'" class="'+(tab===x[0]?'on ':'')+(x[0]==='katekizm'?'cross':'')+'" aria-label="'+x[2]+'"'+(tab===x[0]?' aria-current="page"':'')+'>'+x[1]+'</button>'}).join('');
}
tabsEl.addEventListener('click',function(e){var b=e.target.closest('[data-tab]');if(b)setTab(b.getAttribute('data-tab'))});
function render(name,arg){
  view.onscroll=null;
  if(typeof chatObs!=='undefined'&&chatObs){chatObs.disconnect();chatObs=null}
  if(typeof detachScrubber==='function')detachScrubber();if(typeof kxObs!=='undefined'&&kxObs){kxObs.disconnect();kxObs=null}
  var fn={settings:vSettings,history:vHistory,inbox:vInbox,chat:vChat,contact:vContact,kilisetab:function(){vProfile('kilise')},home:vHome,explore:vExplore,katekizm:vKatekizm,reels:vReels,me:vMe,notif:vNotif,profile:vProfile,post:vPost,reader:vReader,coll:vColl,church:vChurch}[name];
  view.innerHTML='';fn(arg);
}
function header(title,right){return '<div class="hd c"><button class="l" type="button" data-back aria-label="Geri">'+ic('back')+'</button><h1>'+esc(title)+'</h1>'+(right?'<span style="position:absolute;right:14px" class="r">'+right+'</span>':'')+'</div>'}
function openTarget(t){ // "read:…", "post:…", "acc:…", "rosary", "notif", "comments:…", "ext:…"
  if(t==='rosary')return openRosary();
  if(t==='notif')return go('notif');
  if(t==='inbox')return go('inbox');
  var i=t.indexOf(':'),k=t.slice(0,i),v=t.slice(i+1);
  if(k==='read')return go('reader',v);
  if(k==='post')return go('post',v);
  if(k==='acc')return openAcc(v);
  if(k==='comments')return openComments(v);
  if(k==='church')return go('church',v);
  if(k==='story')return openStory(v);
}
function openAcc(id){if(id==='me')return setTab('me');if(id==='katekizm')return setTab('katekizm');if(id==='sss')return openComments('sss');go('profile',id)}
view.addEventListener('click',function(e){
  var t=e.target.closest('[data-back],[data-acc],[data-post],[data-read],[data-story],[data-like],[data-save],[data-share],[data-comments],[data-more],[data-rosary],[data-coll],[data-hl],[data-follow],[data-list],[data-go],[data-church],[data-ptab],[data-reel],[data-chat]');
  if(!t)return;
  if(t.hasAttribute('data-back'))return back();
  if(t.hasAttribute('data-chat'))return go('chat',t.getAttribute('data-chat'));
  if(t.hasAttribute('data-story'))return openStory(t.getAttribute('data-story'));
  if(t.hasAttribute('data-hl'))return openHighlight(t.getAttribute('data-hl'),+t.getAttribute('data-i'));
  if(t.hasAttribute('data-follow'))return toggleFollow(t.getAttribute('data-follow'));
  if(t.hasAttribute('data-list'))return openList(t.getAttribute('data-list'));
  if(t.hasAttribute('data-go'))return openTarget(t.getAttribute('data-go'));
  if(t.hasAttribute('data-church'))return go('church',t.getAttribute('data-church'));
  if(t.hasAttribute('data-ptab')){meTab=t.getAttribute('data-ptab');return drawMeTab()}
  if(t.hasAttribute('data-reel')){reelStart=+t.getAttribute('data-reel');return setTab('reels')}
  if(t.hasAttribute('data-acc'))return openAcc(t.getAttribute('data-acc'));
  if(t.hasAttribute('data-post'))return go('post',t.getAttribute('data-post'));
  if(t.hasAttribute('data-read'))return go('reader',t.getAttribute('data-read'));
  if(t.hasAttribute('data-rosary'))return openRosary();
  if(t.hasAttribute('data-coll'))return go('coll',t.getAttribute('data-coll'));
  if(t.hasAttribute('data-comments'))return openComments(t.getAttribute('data-comments'));
  if(t.hasAttribute('data-share'))return share(t.getAttribute('data-share'),t.getAttribute('data-title'));
  if(t.hasAttribute('data-more')){var c=t.closest('.post').querySelector('.cap .txt');c.textContent=c.getAttribute('data-full');t.remove();return}
  if(t.hasAttribute('data-like')){var id=t.getAttribute('data-like');liked[id]=!liked[id];if(!liked[id])delete liked[id];sset('liked',liked);t.classList.toggle('liked',!!liked[id]);t.setAttribute('aria-pressed',!!liked[id]);return}
  if(t.hasAttribute('data-save'))return toggleSave(t.getAttribute('data-save'));
});
/* ---------- save and follow ---------- */
function saveBtnHTML(pid,label){var on=!!saved[pid];return '<button type="button" data-save="'+pid+'" data-label="'+(label?1:'')+'" class="'+(on?'done':'')+'" aria-pressed="'+on+'">'+(on?'✓ Kaydedildi':'Kaydet')+'</button>'}
function toggleSave(pid){
  if(saved[pid])delete saved[pid];else saved[pid]=Date.now();sset('saved',saved);
  var on=!!saved[pid];
  document.querySelectorAll('[data-save="'+pid+'"]').forEach(function(b){b.setAttribute('aria-pressed',on);if(b.getAttribute('data-label')){b.classList.toggle('done',on);b.textContent=on?'✓ Kaydedildi':'Kaydet'}else b.classList.toggle('saved',on)});
  toast(on?'Kaydedildi':'Kaydedilenlerden çıkarıldı',on);
}
function isFollowing(id){return follows.indexOf(id)>=0}
function folBtnHTML(id){var on=isFollowing(id);return '<button type="button" data-follow="'+id+'" class="'+(on?'fol-on':'pri')+'" aria-pressed="'+on+'">'+(on?'Takip ediliyor ✓':'Takip et')+'</button>'}
function toggleFollow(id){
  var i=follows.indexOf(id);if(i>=0)follows.splice(i,1);else follows.unshift(id);sset('follows',follows);var on=i<0;
  document.querySelectorAll('[data-follow="'+id+'"]').forEach(function(b){b.className=(b.classList.contains('fb')?'fb ':'')+(on?(b.classList.contains('fb')?'on':'fol-on'):(b.classList.contains('fb')?'':'pri'));b.textContent=on?(b.classList.contains('fb')?'Takip ediliyor':'Takip ediliyor ✓'):'Takip et';b.setAttribute('aria-pressed',on)});
  toast(on?ACC[id].name+' hızlı erişime eklendi':'Hızlı erişimden çıkarıldı',on);
}
/* ---------- post markup ---------- */
function slideHTML(s){
  var st='background:linear-gradient(165deg,'+s.bg+',#ffffff 135%);color:'+s.ink;
  if(s.type==='cover')return '<div class="sl" style="'+st+'">'+art(s.art,'big')+'<div class="kick">'+esc(s.kick||'')+'</div><h2 style="color:#141414">'+esc(s.title)+'</h2>'+(s.sub?'<div class="sub" style="color:#262626">'+esc(s.sub)+'</div>':'')+'</div>';
  return '<div class="sl tx" style="'+st+'">'+art(s.art,'small-art')+(s.n!==''?'<div class="n">'+esc(s.n)+'</div>':'<div class="pad"></div>')+(s.title?'<h3 style="color:#141414">'+esc(s.title)+'</h3>':'')+'<p>'+esc(s.text)+'</p></div>';
}
function postHTML(p){
  var a=ACC[p.acc],n=p.slides.length,dots='';for(var i=0;i<n;i++)dots+='<i'+(i?'':' class="on"')+'></i>';
  var full=p.capFull||p.cap,short=cut(p.cap,95);
  var btn=p.read?'<button class="linkbtn" type="button" data-read="'+p.read+'">Tamamını oku</button>':(p.act==='rosary'?'<button class="linkbtn" type="button" data-rosary>Tesbihe başla</button>':'');
  return '<article class="post" data-pid="'+p.id+'"><div class="ph"><button type="button" data-story="'+a.id+'" aria-label="'+esc(a.name)+' hikâyesi">'+ringAv(a,38)+'</button><button class="who" type="button" data-acc="'+a.id+'"><b>'+esc(a.handle)+(a.ver?' <span class="ver">✓</span>':'')+'</b><small>'+esc(p.sub||a.cat)+'</small></button><button type="button" data-share="'+(a.url||'')+'" data-title="'+esc(p.title||a.name)+'" aria-label="Paylaş">'+ic('more')+'</button></div>'
   +'<div class="wrapc">'+(n>1?'<span class="cnt">1/'+n+'</span>':'')+'<div class="car">'+p.slides.map(slideHTML).join('')+'</div></div>'
   +'<div class="act"><button type="button" data-like="'+p.id+'" class="'+(liked[p.id]?'liked':'')+'" aria-pressed="'+!!liked[p.id]+'" aria-label="Beğen">'+ic('heart')+'</button><button type="button" data-comments="'+p.acc+'" aria-label="Sorular">'+ic('comment')+'</button><button type="button" data-share="'+(a.url||'')+'" data-title="'+esc(p.title||a.name)+'" aria-label="Paylaş">'+ic('send')+'</button>'+(n>1?'<div class="dots">'+dots+'</div>':'')+'<button type="button" class="sv '+(saved[p.id]?'saved':'')+'" data-save="'+p.id+'" aria-pressed="'+!!saved[p.id]+'" aria-label="Kaydet">'+ic('save')+'</button></div>'
   +'<div class="cap"><b>'+esc(a.handle)+'</b> <span class="txt" data-full="'+esc(full)+'">'+esc(full.length>short.length?short:full)+'</span>'+(full.length>short.length?' <button type="button" class="more" data-more>devamı</button>':'')+'</div>'
   +(p.meta?'<div class="meta">'+esc(p.meta)+'</div>':'')+btn+'</article>';
}
function wireCarousels(root){root.querySelectorAll('.car').forEach(function(car){var post=car.closest('.post'),cnt=post&&post.querySelector('.cnt'),dots=post&&post.querySelectorAll('.dots i'),n=car.children.length;car.addEventListener('scroll',function(){var i=Math.round(car.scrollLeft/car.clientWidth);if(cnt)cnt.textContent=(i+1)+'/'+n;if(dots)dots.forEach(function(d,j){d.classList.toggle('on',j===i)})},{passive:true})})}
/* ---------- home ---------- */
function vHome(){
  var un=totalUnread();
  var html='<div class="hd"><span class="brand">katolikdunyasi</span><span class="r"><button type="button" class="badge" data-go="notif" aria-label="Bildirimler">'+ic('heart')+'<i></i></button><button type="button" class="dmbtn" data-go="inbox" aria-label="Mesajlar'+(un?', '+un+' okunmamış sohbet':'')+'">'+ic('send')+(un?'<span class="cnt3">'+un+'</span>':'')+'</button></span></div>';
  html+='<div class="stories"><button type="button" class="sto" data-story="bugun">'+ringAv(ACC.bugun,70)+'<span>Bugün</span></button>'
    +STORY_QS.map(function(n){var pi=CPART[n];return '<button type="button" class="sto cq" data-story="q:'+n+'">'+'<span class="ring'+(seen['q:'+n]?' seen':'')+'" style="width:70px;height:70px"><span class="in"><span class="av" style="background:'+tone(PART_TONE[pi])[0]+';color:'+tone(PART_TONE[pi])[1]+'">'+art(PART_ART[pi])+'</span></span></span><span>Soru '+n+'</span></button>'}).join('')
    +follows.map(function(id){var a=ACC[id];if(!a)return'';return '<button type="button" class="sto" data-story="'+id+'">'+ringAv(a,70)+'<span>'+esc(a.handle)+'</span></button>'}).join('')+'</div>';
  html+=FEED.map(function(id){return POSTS[id]?postHTML(POSTS[id]):''}).join('');
  html+='<div class="empty">Bugünlük bu kadar. Keşfet’te daha fazlası var.</div>';
  view.innerHTML=html;wireCarousels(view);
}
/* ---------- explore ---------- */
var EXP_CH=['Tümü','Azizler','Papalar','Dualar','Tartış','Katekizm','Kiliseler','Meseller','Mucizeler'],expCh='Tümü',expQ='';
function exploreItems(){
  var it=[];
  it.push({acc:'katekizm',t:'Katekizm',a:'book',tone:'gold',k:'Katekizm'});
  it.push({acc:'tesbih',t:'Tesbih',a:'beads',tone:'gold',k:'Dualar',reel:true});
  it.push({acc:'gunah',t:'Günah Çıkarma',a:'keys',tone:'indigo',k:'Dualar'});
  it.push({acc:'ayin',t:'Kutsal Ayin',a:'chalice',tone:'purple',k:'Dualar'});
  it.push({acc:'islam',t:'İslam’a Cevap',a:'scroll',tone:'green',k:'Tartış'});
  it.push({acc:'ateizm',t:'Ateizme Cevap',a:'cosmos',tone:'blue',k:'Tartış'});
  it.push({acc:'neden',t:'Neden Katoliğiz?',a:'door',tone:'teal',k:'Tartış'});
  it.push({acc:'papalar',t:'Papalar',a:'tiara',tone:'gold',k:'Papalar'});
  it.push({acc:'kilise',t:'Kilise Bul',a:'church',tone:'orange',k:'Kiliseler'});
  D.saints.forEach(function(s){it.push({acc:s.id,t:s.name,a:s.art,tone:s.tone,k:'Azizler'})});
  D.popes.forEach(function(p){if(!p.link)it.push({acc:p.id,t:p.name.replace('Papa ',''),a:'tiara',tone:p.tone,k:'Papalar',sm:p.years})});
  CHAPTERS.forEach(function(c,i){it.push({go:'read:comp:'+c.pi+'#h'+c.ii,t:c.t.replace(/^[^:]+:\s*/,''),a:PART_ART[c.pi],tone:PART_TONE[c.pi],k:'Katekizm',only:1})});
  D.churches.cities.forEach(function(c){c.ch.forEach(function(x){it.push({church:x.id,t:x.s,a:'church',tone:'orange',k:'Kiliseler',sm:c.n,only:1})})});
  D.mes.forEach(function(m){it.push({post:'p-mes-'+m.id,t:m.n,a:'wheat',tone:'green',k:'Meseller'})});
  D.mir.forEach(function(m){it.push({post:'p-mir-'+m.id,t:m.n,a:'monstrance',tone:'purple',k:'Mucizeler'})});
  return it;
}
function vExplore(){
  view.innerHTML='<div class="hd" style="padding-bottom:0"><label class="search" style="flex:1;margin:0" for="q">'+ic('search')+'<input id="q" type="search" placeholder="Ara: aziz, papa, soru, kilise…" autocomplete="off" value="'+esc(expQ)+'"></label></div><div class="chips" style="padding-top:8px">'+EXP_CH.map(function(c){return '<button type="button" data-ch="'+c+'" class="'+(c===expCh?'on':'')+'">'+c+'</button>'}).join('')+'</div><div id="exr"></div>';
  var q=view.querySelector('#q');q.addEventListener('input',function(){expQ=q.value;drawExplore()});
  view.querySelectorAll('[data-ch]').forEach(function(b){b.addEventListener('click',function(){expCh=b.getAttribute('data-ch');view.querySelectorAll('[data-ch]').forEach(function(x){x.classList.toggle('on',x===b)});drawExplore()})});
  drawExplore();
}
function norm(s){return plain(s).toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ı/g,'i')}
function resRow(attr,a,t,title,sub){return '<button type="button" class="res" '+attr+'>'+av(a,t,44)+'<p><b>'+esc(title)+'</b><span>'+esc(sub)+'</span></p></button>'}
function drawExplore(){
  var box=view.querySelector('#exr'),q=norm(expQ.trim());
  if(q){
    var res=[];
    ORDER.forEach(function(id){var a=ACC[id];if(id==='bugun')return;if(norm(a.name+' '+a.handle+' '+a.cat).indexOf(q)>=0)res.push(resRow('data-acc="'+id+'"',a.art,a.tone,a.handle,a.name+' · '+a.cat))});
    D.churches.cities.forEach(function(c){c.ch.forEach(function(x){if(norm(x.n+' '+x.s+' '+c.n+' '+x.dist).indexOf(q)>=0)res.push(resRow('data-church="'+x.id+'"','church','orange',x.n,c.n+' · '+x.rite))})});
    D.mes.concat(D.mir).forEach(function(m){if(norm(m.n).indexOf(q)>=0){var isM=!!m.ref;res.push(resRow('data-post="'+(isM?'p-mes-':'p-mir-')+m.id+'"',isM?'wheat':'monstrance',isM?'green':'purple',m.n,isM?'Mesel · '+m.ref:'Mucize · '+m.p))}});
    var nq=0;Object.keys(CQ).forEach(function(n){var it=CQ[n];if(nq<25&&norm(it[2]+' '+it[3]).indexOf(q)>=0){nq++;res.push(resRow('data-read="comp:'+CPART[n]+'#'+n+'"',PART_ART[CPART[n]],PART_TONE[CPART[n]],it[2],'Katekizm · soru '+n))}});
    var fq=0;D.sss.forEach(function(c){c.items.forEach(function(x){if(fq<10&&norm(x.q+' '+x.a).indexOf(q)>=0){fq++;res.push(resRow('data-comments="sss"','knock','orange',x.q,'Soru · '+c.t))}})});
    box.innerHTML=res.length?res.join(''):'<div class="empty">“'+esc(expQ)+'” için bir şey bulunamadı.</div>';return;
  }
  var items=exploreItems().filter(function(x){return expCh==='Tümü'?!x.only:x.k===expCh});
  var talls={0:1,7:1,14:1,21:1,28:1,35:1};
  box.innerHTML='<div class="grid">'+items.map(function(x,i){var c=tone(x.tone);var attr=x.acc?'data-acc="'+x.acc+'"':x.post?'data-post="'+x.post+'"':x.church?'data-church="'+x.church+'"':'data-go="'+x.go+'"';return '<button type="button" class="tile'+(expCh==='Tümü'&&talls[i]?' tall':'')+'" '+attr+' style="background:linear-gradient(160deg,'+c[0]+',#fff 140%);color:'+c[1]+'">'+(x.sm?'<small>'+esc(x.sm)+'</small>':'')+art(x.a)+'<b>'+esc(x.t)+'</b>'+(x.reel?'<span class="rl">'+ic('reels')+'</span>':'')+'</button>'}).join('')+'</div>';
}
/* ---------- reels ---------- */
var reelTab='ozel',reelStart=0;
function reelList(){
  var R=[];
  R.push({acc:'tesbih',a:SET_ART[todaySet.id][0],tone:SET_ART[todaySet.id][1],t:todaySet.t,x:'Bugün '+GUN[WD]+'. Ekrana dokunarak tane tane ilerleyin; her onluğun başında gizemi okuyun.',go:'Tesbihe başla',target:'rosary',today:true,save:'p-myst'});
  R.push({acc:'azizler',a:tsArt,tone:tsTone,t:todaySaint.n,x:cut(todaySaint.b,240),go:'Hayatını oku',target:'read:'+(bigOfToday?'saint:'+bigOfToday.id:'today'),today:true,save:'p-today'});
  STORY_QS.slice(0,3).forEach(function(n){var it=CQ[n],pi=CPART[n];R.push({acc:'katekizm',a:PART_ART[pi],tone:PART_TONE[pi],t:it[2],x:plain(it[3]),go:'Katekizm’de oku',target:'read:comp:'+pi+'#'+n,today:true,save:'p-cq'})});
  D.ate.tldr.forEach(function(x){R.push({acc:'ateizm',a:'cosmos',tone:'blue',t:x.t,x:plain(x.x),go:'Devamını oku',target:'read:ateizm',save:'p-ateizm'})});
  D.isl.tldr.forEach(function(x){R.push({acc:'islam',a:'scroll',tone:'green',t:x.t,x:plain(x.x),go:'Devamını oku',target:'read:islam',save:'p-islam'})});
  D.popes.forEach(function(p){if(!p.link)R.push({acc:p.id,a:'tiara',tone:p.tone,t:p.name,x:p.bio,go:'Profili aç',target:'acc:'+p.id,save:'p-'+p.id})});
  D.mes.forEach(function(m){R.push({acc:'meseller',a:'wheat',tone:'green',t:m.n,x:plain(m.b),go:'Meseli aç',target:'post:p-mes-'+m.id,save:'p-mes-'+m.id})});
  D.mir.forEach(function(m){R.push({acc:'mucizeler',a:'monstrance',tone:'purple',t:m.n,x:plain(m.b),go:'Devamını oku',target:'post:p-mir-'+m.id,save:'p-mir-'+m.id})});
  D.gun.faq.slice(0,4).forEach(function(f){R.push({acc:'gunah',a:'keys',tone:'indigo',t:f.q,x:plain(f.a),go:'Diğer sorular',target:'comments:gunah',save:'p-gunah'})});
  if(reelTab==='bugun')return R.filter(function(r){return r.today});
  var first=R.slice(0,5),rest=R.slice(5),out=[],b={};rest.forEach(function(r){var k=r.acc.indexOf('papa-')===0?'papa':r.acc;(b[k]=b[k]||[]).push(r)});
  var keys=Object.keys(b),more=true,k=0;while(more){more=false;keys.forEach(function(key){if(k<b[key].length){out.push(b[key][k]);more=true}});k++}
  return first.concat(out);
}
var REELS=null;
function vReels(){
  var list=reelList();REELS=list;
  view.innerHTML='<div class="reels" id="reels">'+list.map(function(r,i){var a=ACC[r.acc],c=tone(r.tone),rid='r-'+i+'-'+r.acc;
   return '<section class="reel" style="background:linear-gradient(178deg,'+c[0]+' 0%,#ffffff 82%);color:'+c[1]+'">'+art(r.a,'big')+'<div class="u" style="color:#111"><button type="button" data-acc="'+a.id+'" style="display:flex;align-items:center;gap:8px">'+av(a.art,a.tone,32)+esc(a.handle)+'</button>'+(a.id==='me'?'':'<span class="fol" data-follow="'+a.id+'" role="button" tabindex="0">'+(isFollowing(a.id)?'Takip ediliyor':'Takip et')+'</span>')+'</div><h2 style="color:#111">'+esc(r.t)+'</h2><p>'+esc(r.x)+'</p><button type="button" class="go" data-go="'+r.target+'">'+esc(r.go)+'</button>'
   +'<div class="side" style="color:#111"><button type="button" data-like="'+rid+'" class="'+(liked[rid]?'liked':'')+'" aria-label="Beğen">'+ic('heart')+'Beğen</button><button type="button" data-comments="'+(r.acc==='gunah'?'gunah':'sss')+'" aria-label="Sorular">'+ic('comment')+'Sorular</button><button type="button" data-share="'+(a.url||'')+'" data-title="'+esc(r.t)+'" aria-label="Paylaş">'+ic('send')+'Paylaş</button><button type="button" class="sv'+(saved[r.save]?' saved':'')+'" data-save="'+r.save+'" aria-label="Kaydet">'+ic('save')+'Kaydet</button></div></section>'}).join('')+'</div>'
   +'<div class="rtop"><span>Reels</span><span class="tb"><button type="button" data-rt="ozel" class="'+(reelTab==='ozel'?'on':'')+'">Sana özel</button><button type="button" data-rt="bugun" class="'+(reelTab==='bugun'?'on':'')+'">Bugün</button></span><span style="width:24px"></span></div>';
  view.style.position='relative';
  view.querySelectorAll('[data-rt]').forEach(function(b){b.addEventListener('click',function(){reelTab=b.getAttribute('data-rt');reelStart=0;vReels()})});
  if(reelStart){var r=view.querySelector('#reels');var target=r.children[reelStart];if(target)requestAnimationFrame(function(){r.scrollTop=target.offsetTop});reelStart=0}
}
/* ---------- notifications ---------- */
function vNotif(){
  var c=[header('Bildirimler'),'<div class="sec-t">Bugün</div>'];
  c.push('<div class="nt">'+av('cross','gold',44)+'<p><b>takvim</b> '+esc(GUN[WD]+', '+todayLabel)+'. '+esc(SEASON.t)+(dayRank?' · '+esc(dayRank):'')+'.</p></div>');
  c.push('<div class="nt">'+av(tsArt,tsTone,44)+'<p><b>azizler</b> Bugün '+esc(todaySaint.n)+' anılıyor. <span class="t">1s</span></p><button type="button" class="bt" data-post="p-today">Oku</button></div>');
  c.push('<div class="nt">'+av(SET_ART[todaySet.id][0],SET_ART[todaySet.id][1],44)+'<p><b>tesbih.duasi</b> '+esc(GUN[WD])+': '+esc(todaySet.t)+' sizi bekliyor. <span class="t">2s</span></p><button type="button" class="bt" data-rosary>Başla</button></div>');
  c.push('<div class="nt">'+av('book','gold',44)+'<p><b>katekizm</b> Günün sorusu: '+esc(cq0[2])+' <span class="t">3s</span></p><button type="button" class="bt g" data-read="comp:'+CPART[cq0[1]]+'#'+cq0[1]+'">Oku</button></div>');
  var pr=Object.keys(progress).filter(function(k){return progress[k]>0.03&&progress[k]<0.97});
  c.push('<div class="sec-t">Okumaya devam</div>');
  if(pr.length)pr.forEach(function(k){var r=readerMeta(k);if(!r)return;c.push('<div class="nt">'+av(r.art,r.tone,44)+'<p><b>'+esc(r.handle)+'</b> Kaldığınız yer: '+esc(r.title)+'<span class="bar2"><i style="width:'+Math.round(progress[k]*100)+'%"></i></span></p><button type="button" class="bt g" data-read="'+k+'">Devam</button></div>')});
  else c.push('<p class="note">Bir yazıyı okumaya başladığınızda kaldığınız yer burada görünür.</p>');
  if(follows.length){c.push('<div class="sec-t">Takip ettikleriniz</div>');follows.slice(0,6).forEach(function(id){var a=ACC[id];if(!a)return;var p=postOf(id);c.push('<div class="nt">'+av(a.art,a.tone,44)+'<p><b>'+esc(a.handle)+'</b> '+esc(cut(a.bio,80))+'</p><button type="button" class="bt g" data-acc="'+id+'">Gör</button></div>')})}
  view.innerHTML=c.join('');
}
/* ---------- saved ---------- */
function savedPosts(filter){return Object.keys(saved).sort(function(a,b){return saved[b]-saved[a]}).map(function(k){return POSTS[k]}).filter(function(p){return p&&(!filter||filter(p))})}
var COLLS={all:['Tümü',null],dua:['Dualarım',function(p){return p.kind==='dua'}],aziz:['Azizler ve papalar',function(p){return p.kind==='aziz'||p.kind==='papa'}],ogren:['Öğrendiklerim',function(p){return p.kind==='ogren'||p.kind==='tartis'}]};
function savedHTML(){
  var c='<div class="cols">';
  Object.keys(COLLS).forEach(function(k){var ps=savedPosts(COLLS[k][1]),four=ps.slice(0,4),cells='';for(var i=0;i<4;i++){var p=four[i];if(p){var s=p.slides[0];cells+='<div style="background:'+s.bg+';color:'+s.ink+'">'+art(s.art)+'</div>'}else cells+='<div style="background:var(--chip)"></div>'}
    c+='<button type="button" class="col" data-coll="'+k+'"><div class="k">'+cells+'</div><b>'+COLLS[k][0]+'</b><small>'+ps.length+' gönderi</small></button>'});
  c+='</div>';
  var pr=Object.keys(progress).filter(function(k){return progress[k]>0.03&&progress[k]<0.97});
  if(pr.length){c+='<div class="sec-t">Okumaya devam</div>';pr.forEach(function(k){var r=readerMeta(k);if(!r)return;c+='<div class="nt">'+av(r.art,r.tone,44)+'<p><b>'+esc(r.title)+'</b><span class="bar2"><i style="width:'+Math.round(progress[k]*100)+'%"></i></span></p><button type="button" class="bt g" data-read="'+k+'">Devam</button></div>'})}
  c+='<p class="note">Kaydettikleriniz, takip ettikleriniz ve kaldığınız yerler yalnızca bu cihazda, bu tarayıcıda tutulur; hesap açmanız gerekmez.</p>';
  return c;
}
function vColl(k){var ps=savedPosts(COLLS[k][1]);view.innerHTML=header(COLLS[k][0])+(ps.length?'<div class="grid">'+ps.map(function(p){var s=p.slides[0];return '<button type="button" class="tile" data-post="'+p.id+'" style="background:'+s.bg+';color:'+s.ink+'">'+art(s.art)+'<b>'+esc(p.title||s.title)+'</b></button>'}).join('')+'</div>':'<div class="empty">Henüz bir şey kaydetmediniz. Gönderilerdeki yer imi simgesine dokunun.</div>')}
function vPost(id){var p=POSTS[id];view.innerHTML=header('Gönderi')+postHTML(p);wireCarousels(view)}
/* ---------- the main profile: Katolik Dünyası ---------- */
var MENU=[
 ['Öğren',[['neden','Neden Katoliğiz?'],['katekizm','Katekizm'],['ext:kutsal-kitap.html','Kutsal Kitap','book','blue'],['sss','Sorular'],['surec','Katolik Olma Süreci'],['meseller','Meseller']]],
 ['Tartış',[['islam','İslam’a Cevap'],['ateizm','Ateizme Cevap']]],
 ['Dua Et',[['ayin','Kutsal Ayin'],['tesbih','Tesbih Duası'],['tesbihtarihi','Tesbihin Tarihi'],['ext:ekler.html','Sık Kullanılan Dualar','candle','gold'],['gunah','Günah Çıkarma']]],
 ['Keşfet',[['azizler','Azizler'],['papalar','Papalar'],['mucizeler','Mucizeler'],['topraklar','Topraklarımızda'],['kilise','Kilise Bul']]],
 ['Site',[['ext:iletisim.html','İletişim','knock','orange'],['ext:erisilebilirlik.html','Erişilebilirlik','door','teal'],['ext:gizlilik.html','Gizlilik','shield','indigo']]]
];
var meTab='grid';
function vMe(){
  var a=ACC.me, nPosts=Object.keys(POSTS).length, nProf=ORDER.length-2;
  var html='<div class="hd"><h1>katolikdunyasi <span class="ver">✓</span></h1><span class="r"><button type="button" data-go="notif" aria-label="Bildirimler">'+ic('heart')+'</button><button type="button" id="tomenu" aria-label="Menü">'+ic('menu')+'</button></span></div>'
   +'<div class="pr"><div class="top"><button type="button" data-story="bugun" aria-label="Bugünün hikâyesi">'+ringAv(a,90)+'</button><div class="nums"><button type="button" data-ptab="grid"><b>'+nPosts+'</b><span>gönderi</span></button><button type="button" data-list="all"><b>'+nProf+'</b><span>profil</span></button><button type="button" data-list="follows"><b>'+follows.length+'</b><span>takip</span></button></div></div>'
   +'<h2>'+esc(a.name)+' <span class="ver">✓</span></h2><div class="cat">'+esc(a.cat)+'</div><p>'+esc(a.bio)+'</p><a class="link" href="https://katolikdunyasi.com" target="_blank" rel="noopener">katolikdunyasi.com</a>'
   +'<div class="btns"><button type="button" data-share="" data-title="Katolik Dünyası">Profili paylaş</button><a class="btn-like" href="'+SITE+'iletisim.html" target="_blank" rel="noopener" style="flex:1;background:var(--chip);border-radius:8px;padding:8px 6px;font:600 13.5px var(--sans);text-align:center;color:inherit;text-decoration:none">İletişim</a></div></div>'
   +'<div id="menu">'+MENU.map(function(g){return '<div class="mgrp"><h3>'+g[0]+'</h3><div class="mrow">'+g[1].map(function(m){var ext=m[0].indexOf('ext:')===0,acc=ext?null:ACC[m[0]];var ar=ext?m[2]:acc.art,tn=ext?m[3]:acc.tone;var inner='<span class="o">'+av(ar,tn,58)+'</span>'+esc(m[1])+(ext?'<span class="ext">site ↗</span>':'');return ext?'<a class="mi" href="'+SITE+m[0].slice(4)+'" target="_blank" rel="noopener" style="text-decoration:none">'+inner+'</a>':'<button type="button" class="mi" data-acc="'+m[0]+'">'+inner+'</button>'}).join('')+'</div></div>'}).join('')+'</div>'
   +'<div class="ptabs" role="tablist"><button type="button" data-ptab="grid" class="'+(meTab==='grid'?'on':'')+'" aria-label="Gönderiler">'+ic('grid')+'</button><button type="button" data-ptab="reels" class="'+(meTab==='reels'?'on':'')+'" aria-label="Reels">'+ic('reels')+'</button><button type="button" data-ptab="saved" class="'+(meTab==='saved'?'on':'')+'" aria-label="Kaydedilenler">'+ic('save')+'</button></div><div id="metab"></div>';
  view.innerHTML=html;
  view.querySelector('#tomenu').addEventListener('click',function(){go('settings')});
  drawMeTab();
}
function drawMeTab(){
  var box=view.querySelector('#metab');if(!box)return;
  view.querySelectorAll('.ptabs [data-ptab]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-ptab')===meTab)});
  if(meTab==='saved'){box.innerHTML=savedHTML();return}
  if(meTab==='reels'){var list=reelList();box.innerHTML='<div class="grid">'+list.map(function(r,i){var c=tone(r.tone);return '<button type="button" class="tile" data-reel="'+i+'" style="background:linear-gradient(175deg,'+c[0]+',#fff 140%);color:'+c[1]+';aspect-ratio:9/14"><span class="rl">'+ic('reels')+'</span>'+art(r.a)+'<b>'+esc(cut(r.t,44))+'</b></button>'}).join('')+'</div>';return}
  var ids=['p-today','p-cq','p-myst','p-gunah','p-ayin','p-islam','p-ateizm','p-neden','p-surec','p-topraklar','p-tesbihtarihi'].concat(D.popes.filter(function(p){return !p.link}).map(function(p){return 'p-'+p.id})).concat(D.saints.map(function(s){return 'p-'+s.id})).concat(D.mes.map(function(m){return 'p-mes-'+m.id})).concat(D.mir.map(function(m){return 'p-mir-'+m.id}));
  box.innerHTML='<div class="grid">'+ids.filter(function(id){return POSTS[id]}).map(function(id){var p=POSTS[id],s=p.slides[0];return '<button type="button" class="tile" data-post="'+id+'" style="background:linear-gradient(160deg,'+s.bg+',#fff 150%);color:'+s.ink+'">'+(p.slides.length>1?'<span class="rl" style="right:7px">'+'<svg class="i" viewBox="0 0 24 24" style="width:16px;height:16px"><rect x="7" y="3" width="14" height="14" rx="2"/><path d="M3 7v12a2 2 0 0 0 2 2h12"/></svg></span>':'')+art(s.art)+'<b>'+esc(cut(p.title||s.title,40))+'</b></button>'}).join('')+'</div>';
}
/* lists: profiles, follows, a pope's line */
function openList(kind){
  var ids,title;
  if(kind==='all'){ids=ORDER.filter(function(id){return id!=='me'&&id!=='bugun'});title='Profiller'}
  else if(kind==='follows'){ids=follows.slice();title='Takip ettikleriniz'}
  else{var p=kind.split(':'),i=popeIdx(p[1]);if(p[0]==='after'){ids=POPE_LINE.slice(i+1);title='Takipçiler · halefleri'}else{ids=POPE_LINE.slice(0,i).reverse();title='Takip · selefleri'}}
  var dim=h('<div class="dim"></div>'),sh=h('<div class="sheet" role="dialog" aria-label="'+esc(title)+'"><div class="gb"></div><h4>'+esc(title)+'</h4><div class="sc"></div></div>');
  var sc=sh.querySelector('.sc');
  sc.innerHTML=ids.length?ids.map(function(id){var a=ACC[id];if(!a)return'';var on=isFollowing(id);return '<div class="lst"><button type="button" data-open="'+id+'" style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;text-align:left">'+av(a.art,a.tone,48)+'<p><b>'+esc(a.handle)+(a.ver?' <span class="ver">✓</span>':'')+'</b><span class="sub">'+esc(a.name+(a.ord?' · '+a.ord+'. papa':' · '+a.cat))+'</span></p></button><button type="button" class="fb'+(on?' on':'')+'" data-follow="'+id+'">'+(on?'Takip ediliyor':'Takip et')+'</button></div>'}).join(''):'<div class="empty">Henüz kimseyi takip etmiyorsunuz. Bir profilde “Takip et”e dokunun; o profil ana sayfadaki hikâyeler satırına eklenir.</div>';
  function close(){dim.remove();sh.remove()}
  sc.addEventListener('click',function(e){var o=e.target.closest('[data-open]');if(o){close();openAcc(o.getAttribute('data-open'));return}var f=e.target.closest('[data-follow]');if(f)toggleFollow(f.getAttribute('data-follow'))});
  dim.addEventListener('click',close);app.appendChild(dim);app.appendChild(sh);
}
/* ---------- entity profiles ---------- */
function accPosts(id){
  var a=ACC[id];
  if(a.saint){var secs=sectionsOf(a.saint.body,'');return {hl:secs.map(function(s){return s.t}),grid:secs.map(function(s,i){return {t:s.t||a.name,go:'read:saint:'+id+'#'+i}})}}
  if(a.pope){var p=a.pope,g=p.secs.map(function(s,i){return {t:s[0],go:'read:pope:'+id+'#'+i}});p.docs.forEach(function(d){g.push({t:d[0],sm:d[1],go:'read:pope:'+id+'#docs',art:'scroll'})});return {hl:p.secs.map(function(s){return s[0]}),grid:g}}
  if(id==='papalar')return {hl:[],grid:POPE_LINE.map(function(pid){var x=ACC[pid];return {t:x.name.replace('Papa ',''),sm:x.ord+'.',go:'acc:'+pid,art:x.art,tone:x.tone}})};
  if(id==='gunah')return {hl:['Hazırlık','Adımlar','Sorular','Şehitler'],grid:D.gun.steps.map(function(s,i){return {t:(i+1)+' · '+s.t,go:'read:gunah#'+i}})};
  if(id==='ayin')return {hl:D.mass.parts.slice(0,6).map(function(p){return p.t}),grid:D.mass.parts.map(function(p,i){return {t:p.n+' · '+p.t,go:'read:mass#'+i}})};
  if(id==='kilise'){var g2=[];D.churches.cities.forEach(function(c){c.ch.forEach(function(x){g2.push({t:x.s,sm:c.n,go:'church:'+x.id})})});return {hl:D.churches.cities.map(function(c){return c.n}),grid:g2}}
  if(id==='tesbih')return {hl:D.tes.sets.map(function(s){return s.t}),grid:D.tes.sets.map(function(s){return {t:s.t,go:'rosary',art:SET_ART[s.id][0],tone:SET_ART[s.id][1]}}).concat([{t:'Tesbihin Tarihi',go:'acc:tesbihtarihi',art:'rose',tone:'red'}])};
  if(id==='islam'||id==='ateizm'){var cs=id==='islam'?D.isl:D.ate,gg=[];cs.parts.forEach(function(p){p.secs.forEach(function(s){gg.push({t:s.t,go:'read:'+id+'#'+gg.length})})});return {hl:cs.parts.map(function(p){return p.t}),grid:gg}}
  if(D.pages[id])return {hl:[],grid:D.pages[id].secs.map(function(s,i){return {t:s[0],go:'read:page:'+id+'#'+i}})};
  if(id==='meseller')return {hl:[],grid:D.mes.map(function(m){return {t:m.n,go:'post:p-mes-'+m.id}})};
  if(id==='mucizeler')return {hl:[],grid:D.mir.map(function(m){return {t:m.n,go:'post:p-mir-'+m.id}})};
  if(id==='azizler')return {hl:[],grid:D.saints.map(function(s){return {t:s.name,go:'acc:'+s.id,art:s.art,tone:s.tone}})};
  return {hl:[],grid:[]};
}
function profileNums(id,P){
  var a=ACC[id];
  if(a.ord){var i=popeIdx(id);return [[a.ord+'.','papa',''],[POPE_LINE.length-i-1,'takipçi','after:'+id],[i,'takip','before:'+id]]}
  if(a.saint)return [[P.grid.length,'bölüm',''],[P.hl.length,'öne çıkan',''],['20','aziz','acc:azizler']];
  if(id==='gunah')return [[D.gun.steps.length,'adım',''],[D.gun.faq.length,'soru',''],['6 dk','okuma','']];
  if(id==='tesbih')return [['4','gizem',''],['20','gizem kutusu',''],['20 dk','dua','']];
  if(id==='ayin')return [[D.mass.parts.length,'bölüm',''],['2','rol',''],['1 sa','ayin','']];
  if(id==='kilise'){var n=0;D.churches.cities.forEach(function(c){n+=c.ch.length});return [[n,'kilise',''],[D.churches.cities.length,'şehir',''],['4','ayin ritüeli','']]}
  if(id==='papalar')return [[POPE_LINE.length,'papa',''],['267','toplam papa',''],['2000','yıl','']];
  return [[P.grid.length,'gönderi',''],[P.hl.length||'-','bölüm',''],['TR','dil','']];
}
function mainAction(id){var a=ACC[id];
  if(id==='tesbih')return '<button type="button" class="pri2" data-rosary>Tesbihe başla</button>';
  if(a.read)return '<button type="button" data-read="'+a.read+'">Oku</button>';
  return '';
}
function vProfile(id){
  var a=ACC[id],P=accPosts(id),nums=profileNums(id,P),post=postOf(id);
  var html=header(a.handle)+'<div class="pr"><div class="top"><button type="button" data-story="'+id+'" aria-label="Hikâye">'+ringAv(a,90)+'</button><div class="nums">'+nums.map(function(n){var attr=n[2]?(n[2].indexOf('acc:')===0?'data-acc="'+n[2].slice(4)+'"':'data-list="'+n[2]+'"'):'';return '<button type="button" '+attr+(n[2]?'':' disabled style="cursor:default"')+'><b>'+esc(n[0])+'</b><span>'+esc(n[1])+'</span></button>'}).join('')+'</div></div>'
   +'<h2>'+esc(a.name)+(a.ver?' <span class="ver">✓</span>':'')+'</h2><div class="cat">'+esc(a.cat)+(a.saint&&a.saint.emb?' · Simgesi: '+esc(a.saint.emb):'')+(a.pope?' · Doğum yeri: '+esc(a.pope.born):'')+'</div><p>'+esc(a.bio)+'</p>'
   +'<div class="btns">'+folBtnHTML(id)+mainAction(id).replace('class="pri2"','')+(post?saveBtnHTML(post.id,true):'')+'<button type="button" class="ib" data-share="'+(a.url||'')+'" data-title="'+esc(a.name)+'" aria-label="Paylaş">'+ic('send')+'</button></div>';
  if(P.hl.length)html+='<div class="hls">'+P.hl.slice(0,13).map(function(t,i){return '<button type="button" class="hl" data-hl="'+id+'" data-i="'+i+'"><span class="o">'+av(id==='kilise'?'church':a.art,a.tone,58)+'</span><span>'+esc(t||a.name)+'</span></button>'}).join('')+'</div>';
  html+='</div><div class="ptabs"><span class="on">'+ic('grid')+'</span><span>'+ic('reels')+'</span><span>'+ic('book')+'</span></div>';
  html+='<div class="grid">'+P.grid.map(function(g){var t=tone(g.tone||a.tone);return '<button type="button" class="tile" data-go="'+g.go+'" style="background:linear-gradient(160deg,'+t[0]+',#fff 150%);color:'+t[1]+'">'+(g.sm?'<small>'+esc(g.sm)+'</small>':'')+art(g.art||(id==='kilise'?'church':a.art))+'<b>'+esc(cut(g.t,48))+'</b></button>'}).join('')+'</div>';
  view.innerHTML=html;
}
/* ---------- Katekizm tab ---------- */
var katQ='';
function vKatekizm(){
  var a=ACC.katekizm;
  var html='<div class="hd"><h1>katekizm <span class="ver">✓</span></h1><span class="r"><button type="button" data-share="katekizm.html" data-title="Katekizm" aria-label="Paylaş">'+ic('send')+'</button></span></div>'
   +'<label class="search" for="kq">'+ic('search')+'<input id="kq" type="search" placeholder="598 soru içinde ara…" autocomplete="off" value="'+esc(katQ)+'"></label><div id="kres"></div>'
   +'<div id="kmain"><div class="pr"><div class="top"><button type="button" data-story="q:'+STORY_QS[0]+'" aria-label="Günün sorusu">'+ringAv(a,90)+'</button><div class="nums"><button type="button" data-go="read:comp:0"><b>598</b><span>soru</span></button><button type="button" disabled><b>4</b><span>kısım</span></button><button type="button" disabled><b>'+CHAPTERS.length+'</b><span>başlık</span></button></div></div>'
   +'<h2>'+esc(a.name)+' <span class="ver">✓</span></h2><div class="cat">'+esc(a.cat)+'</div><p>'+esc(a.bio)+'</p>'
   +'<div class="btns">'+folBtnHTML('katekizm')+'<button type="button" data-read="comp:0">Baştan oku</button>'+saveBtnHTML('p-cq',true)+'</div>'
   +'<div class="hls">'+D.comp.map(function(p,i){return '<button type="button" class="hl" data-hl="katekizm" data-i="'+i+'"><span class="o">'+av(PART_ART[i],PART_TONE[i],58)+'</span><span>'+esc(p.t)+'</span></button>'}).join('')+'</div></div>'
   +'<div class="ptabs"><span class="on">'+ic('grid')+'</span><span>'+ic('book')+'</span></div>'
   +'<div class="grid">'+CHAPTERS.map(function(c){var t=tone(PART_TONE[c.pi]);return '<button type="button" class="tile" data-go="read:comp:'+c.pi+'#h'+c.ii+'" style="background:linear-gradient(160deg,'+t[0]+',#fff 150%);color:'+t[1]+'"><small>'+esc(D.comp[c.pi].t)+'</small>'+art(PART_ART[c.pi])+'<b>'+esc(cut(c.t.replace(/^[^:]+:\s*/,''),46))+'</b></button>'}).join('')+'</div></div>';
  view.innerHTML=html;
  var kq=view.querySelector('#kq');
  function draw(){katQ=kq.value;var q=norm(katQ.trim()),box=view.querySelector('#kres'),main=view.querySelector('#kmain');if(!q){box.innerHTML='';main.hidden=false;return}main.hidden=true;var out=[];
    var num=+katQ.trim();if(num&&CQ[num])out.push(CQ[num]);
    Object.keys(CQ).forEach(function(n){if(out.length<40&&norm(CQ[n][2]+' '+CQ[n][3]).indexOf(q)>=0&&out.indexOf(CQ[n])<0)out.push(CQ[n])});
    box.innerHTML=out.length?out.map(function(it){return '<button type="button" class="qres" data-read="comp:'+CPART[it[1]]+'#'+it[1]+'"><b>'+it[1]+'. '+esc(plain(it[2]))+'</b><span>'+esc(D.comp[CPART[it[1]]].t)+' · '+esc(cut(it[3],90))+'</span></button>'}).join(''):'<div class="empty">Bu aramayla eşleşen soru yok.</div>'}
  kq.addEventListener('input',draw);if(katQ)draw();
}
/* ---------- church page ---------- */
function findChurch(id){var r=null;D.churches.cities.forEach(function(c){c.ch.forEach(function(x){if(x.id===id)r={c:c,x:x}})});return r}
function vChurch(id){
  var r=findChurch(id),x=r.x,c=r.c;
  var maps='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(x.n+', '+x.addr);
  var html=header('kilise.bul','<button type="button" data-share="kiliseler.html" data-title="'+esc(x.n)+'" aria-label="Paylaş">'+ic('send')+'</button>')
   +'<div class="ch-h"><div style="width:76px;height:76px;margin-top:8px">'+av('church','orange',76)+'</div><div class="kick" style="font:700 11px var(--sans);letter-spacing:.14em;text-transform:uppercase;color:#b0531a;margin-top:10px">'+esc(x.rite+' · '+c.n)+'</div><h1>'+esc(x.n)+'</h1><p style="margin:0;color:var(--mute)">'+esc(x.dist)+'</p></div>'
   +'<div class="maps"><a href="'+maps+'" target="_blank" rel="noopener">Haritada aç</a>'+(x.web?'<a class="g" href="'+esc(x.web)+'" target="_blank" rel="noopener">Web sitesi</a>':'')+'</div>'
   +'<div class="kv"><div><span class="k">Adres</span><span class="v">'+esc(x.addr)+'</span></div>'+(x.ph&&x.ph.length?'<div><span class="k">Telefon</span><span class="v">'+esc(x.ph.join(' · '))+'</span></div>':'')
   +(x.mass||[]).map(function(m){return '<div><span class="k">'+esc(m[0])+'</span><span class="v">'+esc(m[1])+'</span></div>'}).join('')
   +(x.mn?'<div><span class="k">Not</span><span class="v">'+x.mn+'</span></div>':'')+(x.vis?'<div><span class="k">Ziyaret</span><span class="v">'+x.vis+'</span></div>':'')+'</div>'
   +(x.hist?'<article class="rd" style="padding-top:0"><h2>Tarihçe</h2><p>'+x.hist+'</p></article>':'')
   +'<p class="note">'+D.churches.note+'</p>';
  view.innerHTML=html;
}
/* ---------- reader ---------- */
function readerMetaBase(key){
  var k=key.split('#')[0];
  if(k.indexOf('saint:')===0){var s=D.saints.filter(function(x){return x.id===k.slice(6)})[0];if(!s)return null;return {title:s.name,handle:s.id.replace(/-/g,'.'),art:s.art,tone:s.tone}}
  if(k.indexOf('pope:')===0){var a=ACC[k.slice(5)];return a?{title:a.name,handle:a.handle,art:'tiara',tone:a.tone}:null}
  if(k.indexOf('comp:')===0){var pi=+k.slice(5);return {title:'Katekizm · '+D.comp[pi].t,handle:'katekizm',art:PART_ART[pi],tone:PART_TONE[pi]}}
  if(k.indexOf('page:')===0){var pa=ACC[k.slice(5)];return {title:D.pages[k.slice(5)].t,handle:pa.handle,art:pa.art,tone:pa.tone}}
  if(k==='mass')return {title:'Kutsal Ayin',handle:'kutsal.ayin',art:'chalice',tone:'purple'};
  if(k==='gunah')return {title:'Günah Çıkarma',handle:'gunah.cikarma',art:'keys',tone:'indigo'};
  if(k==='islam')return {title:D.isl.title,handle:'islama.cevap',art:'scroll',tone:'green'};
  if(k==='ateizm')return {title:D.ate.title,handle:'ateizme.cevap',art:'cosmos',tone:'blue'};
  if(k==='today')return {title:todaySaint.n,handle:'azizler',art:tsArt,tone:tsTone};
  return null;
}
function md(body){return String(body||'').split(/\n+/).map(function(l){l=l.trim();if(!l)return'';var m=l.match(/^(#{2,3})\s+(.*)/);if(m)return '<h3>'+m[2]+'</h3>';if(/^>\s*/.test(l))return '<blockquote>'+l.replace(/^>\s*/,'')+'</blockquote>';if(/^[-*]\s+/.test(l))return '<p>• '+l.replace(/^[-*]\s+/,'')+'</p>';return '<p>'+l+'</p>'}).join('')}
function para(t){return String(t||'').split(/\n+/).map(function(x){x=x.trim();if(!x)return'';return '<p>'+(x.indexOf('- ')===0?'• '+x.slice(2):x)+'</p>'}).join('')}
function vReaderBase(key){
  var parts=key.split('#'),k=parts[0],sec=parts[1]!=null?parts[1]:null;
  var meta=readerMeta(k),c=tone(meta.tone),body='',kick='',lead='',title=meta.title,share='';
  if(k.indexOf('saint:')===0){var s=D.saints.filter(function(x){return x.id===k.slice(6)})[0];kick=s.ep+' · '+s.era;lead=plain(s.sum);share=s.id+'.html';title=s.name;
    body=sectionsOf(s.body,'').map(function(x,i){return (x.t?'<h2 id="s'+i+'">'+esc(x.t)+'</h2>':'<span id="s'+i+'"></span>')+x.p.map(function(p){return '<p>'+p+'</p>'}).join('')}).join('')}
  else if(k.indexOf('pope:')===0){var pp=ACC[k.slice(5)].pope;kick=pp.cat+' · '+pp.years;lead=pp.bio;title=pp.name;
    body=pp.secs.map(function(x,i){return '<h2 id="s'+i+'">'+esc(x[0])+'</h2><p>'+x[1]+'</p>'}).join('')+(pp.docs.length?'<h2 id="sdocs">Önemli belgeler</h2>'+pp.docs.map(function(d){return '<div class="pdoc"><span class="y">'+esc(d[1])+'</span><div><b>'+esc(d[0])+'</b><p>'+esc(d[2])+'</p></div></div>'}).join(''):'')
    +'<p style="margin-top:22px;font:14px var(--sans);color:var(--mute)">'+(popeIdx(pp.id)>0?'Selefi: <button type="button" class="link" data-acc="'+POPE_LINE[popeIdx(pp.id)-1]+'">'+esc(ACC[POPE_LINE[popeIdx(pp.id)-1]].name)+'</button>':'')+(popeIdx(pp.id)<POPE_LINE.length-1?' · Halefi: <button type="button" class="link" data-acc="'+POPE_LINE[popeIdx(pp.id)+1]+'">'+esc(ACC[POPE_LINE[popeIdx(pp.id)+1]].name)+'</button>':'')+'<br>Bu listede yalnızca öne çıkan papalar yer alır; aradaki papalar atlanmıştır.</p>'}
  else if(k.indexOf('comp:')===0){var pi=+k.slice(5),pt=D.comp[pi];kick='Katekizm · Soru '+pt.from+'-'+pt.to;title=pt.t;share=pt.slug+'.html';
    body=pt.items.map(function(it,ii){if(it[0]==='h'){var cls=it[1]<=1?'h1x':it[1]===2?'h2x':it[1]===3?'h2x':'h3x';return '<div class="'+cls+'" id="sh'+ii+'">'+esc(it[2])+'</div>'}if(it[0]==='c')return '<div class="cq">'+it[1]+'</div>';return '<div class="qa" id="s'+it[1]+'"><span class="qn">Soru '+it[1]+'</span><h4>'+it[2]+'</h4>'+para(it[3])+'</div>'}).join('')}
  else if(k.indexOf('page:')===0){var pg=D.pages[k.slice(5)];kick=ACC[k.slice(5)].cat;lead=plain(pg.lead);share=ACC[k.slice(5)].url;
    body=pg.secs.map(function(x,i){return '<h2 id="s'+i+'">'+esc(x[0])+'</h2>'+x[1].map(function(p){return '<p>'+p+'</p>'}).join('')}).join('')}
  else if(k==='mass'){kick='Dua Et';lead=plain(D.mass.intro);share='kutsal-ayin.html';var R=D.mass.roles;
    body=D.mass.parts.map(function(p,i){return '<h2 id="s'+i+'">'+p.n+'. '+esc(p.t)+'</h2>'+(p.lead?'<p><em>'+p.lead+'</em></p>':'')+p.lines.map(function(l){if(l[0]==='N')return '<p class="ml n">'+l[1]+'</p>';return '<p class="ml '+(l[0]==='C'?'c':l[0]==='PC'?'pc':'')+'"><span class="rl">'+esc(R[l[0]]||l[0])+'</span>'+l[1]+'</p>'}).join('')}).join('')}
  else if(k==='gunah'){kick='Rehber · Dua Et';lead=plain(D.gun.intro);share='gunah-cikarma.html';body=D.gun.steps.map(function(s,i){return '<h2 id="s'+i+'">'+(i+1)+'. '+esc(s.t)+'</h2><p>'+s.x+'</p>'}).join('')+'<h2>Sık sorulanlar</h2>'+D.gun.faq.map(function(f){return '<h3>'+esc(f.q)+'</h3><p>'+f.a+'</p>'}).join('')+'<h2>'+esc(D.gun.mart.t)+'</h2>'+D.gun.mart.items.map(function(m){return '<h3>'+esc(m.n)+'</h3><p>'+m.x+'</p>'}).join('')}
  else if(k==='islam'||k==='ateizm'){var cs=k==='islam'?D.isl:D.ate;kick='Tartış';lead=plain(cs.lead);share=ACC[k].url;var n=0;body=cs.parts.map(function(p){return '<div class="kick" style="color:'+c[1]+';margin-top:30px">'+esc(p.t)+'</div>'+p.secs.map(function(s){return '<h2 id="s'+(n++)+'">'+esc(s.t)+'</h2>'+md(s.b)}).join('')}).join('')}
  else if(k==='today'){kick='Bugünün azizi · '+todayLabel;lead=todaySaint.t;share='azizler.html';body='<p>'+esc(todaySaint.b)+'</p>'}
  view.innerHTML='<div class="hd c"><button class="l" type="button" data-back aria-label="Geri">'+ic('back')+'</button><h1>'+esc(meta.handle)+'</h1><span style="position:absolute;right:14px" class="r"><button type="button" data-share="'+esc(share)+'" data-title="'+esc(title)+'" aria-label="Paylaş">'+ic('send')+'</button></span></div><div class="prog"><i id="pg"></i></div>'
    +'<article class="rd"><div style="width:76px;height:76px;margin-top:10px">'+av(meta.art,meta.tone,76)+'</div><div class="kick" style="color:'+c[1]+'">'+esc(kick)+'</div><h1>'+esc(title)+'</h1>'+(lead?'<p class="lead">'+esc(lead)+'</p>':'')+body+'</article>';
  var pg=view.querySelector('#pg');
  view.onscroll=function(){var max=view.scrollHeight-view.clientHeight,f=max>0?view.scrollTop/max:1;pg.style.width=(f*100)+'%';if(f>0.02&&!sec){progress[k]=f>0.97?1:Math.max(progress[k]||0,f);sset('progress',progress)}};
  requestAnimationFrame(function(){
    if(sec!=null){var el=view.querySelector('#s'+sec);if(el){view.scrollTop=el.offsetTop-54;if(el.classList.contains('qa')){el.classList.add('hit')}}}
    else if(progress[k]>0.03&&progress[k]<0.97){view.scrollTop=progress[k]*(view.scrollHeight-view.clientHeight);toast('Kaldığınız yerden devam')}
  });
}
/* ---------- stories ---------- */
function linkFor(id){var a=ACC[id];if(!a)return null;if(a.read)return ['Tamamını oku','read:'+a.read];if(id==='tesbih')return ['Tesbihe başla','rosary'];return ['Profili aç','acc:'+id]}
function storySlides(id){
  var S=[];
  if(id.indexOf('q:')===0){var n=+id.slice(2),it=CQ[n],pi=CPART[n],L=['Katekizm’de oku','read:comp:'+pi+'#'+n];
    S.push({kick:(SEASON.q?SEASON.t+' · ':'')+'Katekizm · Soru '+n,title:plain(it[2]),text:'',art:PART_ART[pi],tone:PART_TONE[pi],btn:L});
    chunks(it[3],230).slice(0,4).forEach(function(c){S.push({kick:'Soru '+n,title:'',text:c,art:PART_ART[pi],tone:PART_TONE[pi],btn:L})});
    return S}
  var a=ACC[id];
  if(id==='bugun'){
    S.push({kick:GUN[WD]+' · '+SEASON.t,title:todayLabel,text:dayRank?dayRank+'.':'Bugün için Kilise’den kısa bir akış.',btn:['Bugünün akışı','notif']});
    S.push({kick:'Bugünün azizi',title:todaySaint.n,text:cut(todaySaint.b,220),art:tsArt,tone:tsTone,btn:['Hayatını oku','read:'+(bigOfToday?'saint:'+bigOfToday.id:'today')]});
    S.push({kick:'Günün gizemi',title:todaySet.t,text:todaySet.items.map(function(x,i){return (i+1)+'. '+x}).join('\n'),art:SET_ART[todaySet.id][0],tone:SET_ART[todaySet.id][1],btn:['Tesbihe başla','rosary']});
    var pm=pick(D.mes);S.push({kick:'Günün meseli',title:pm.n,text:cut(pm.b,220),art:'wheat',tone:'green',stk:pm.ref,btn:['Meseli aç','post:p-mes-'+pm.id]});
  } else if(id==='katekizm'){STORY_QS.forEach(function(n){var it=CQ[n],pi=CPART[n];S.push({kick:'Soru '+n,title:plain(it[2]),text:cut(it[3],200),art:PART_ART[pi],tone:PART_TONE[pi],btn:['Katekizm’de oku','read:comp:'+pi+'#'+n]})})}
  else if(id==='azizler'){S.push({kick:'Bugünün azizi · '+todayLabel,title:todaySaint.n,text:todaySaint.t,art:tsArt,tone:tsTone});chunks(todaySaint.b,230).slice(0,4).forEach(function(x){S.push({kick:todaySaint.n,title:'',text:x,art:tsArt,tone:tsTone})});S.forEach(function(x){x.btn=['Hayatını oku','read:'+(bigOfToday?'saint:'+bigOfToday.id:'today')]})}
  else if(id==='tesbih'){S.push({kick:'Bugün · '+GUN[WD],title:todaySet.t,text:'Beş gizem, her biri bir onlukla.',art:SET_ART[todaySet.id][0],tone:SET_ART[todaySet.id][1]});todaySet.items.forEach(function(x,i){S.push({kick:(i+1)+'. gizem',title:x,text:'',art:SET_ART[todaySet.id][0],tone:SET_ART[todaySet.id][1]})});S.forEach(function(x){x.btn=['Tesbihe başla','rosary']})}
  else if(id==='gunah'){S.push({kick:'İsa başlattı',title:'Dirilişinin akşamı',text:'İsa öğrencilerine göründü, onlara üfledi ve şöyle dedi:',q:'“Kimin günahlarını bağışlarsanız, bağışlanmış olur.”',stk:'Yuhanna 20:22-23',btn:['Tamamını oku','read:gunah']});D.gun.steps.slice(0,5).forEach(function(s,i){S.push({kick:'Adım '+(i+1),title:s.t,text:cut(s.x,230),btn:['Bu adımı oku','read:gunah#'+i]})})}
  else if(id==='islam'||id==='ateizm'){var cs=id==='islam'?D.isl:D.ate;cs.tldr.slice(0,6).forEach(function(x,i){S.push({kick:'Kısaca · '+(i+1),title:x.t,text:cut(x.x,240),btn:['Tamamını oku','read:'+id]})})}
  else if(id==='meseller'){[0,8,16,24].forEach(function(o){var m=pick(D.mes,o);S.push({kick:m.cat,title:m.n,text:cut(m.b,220),stk:m.ref,btn:['Meseli aç','post:p-mes-'+m.id]})})}
  else if(id==='mucizeler'){[0,4,8].forEach(function(o){var m=pick(D.mir,o);S.push({kick:m.cat,title:m.n,text:cut(m.b,220),stk:m.p,btn:['Devamını oku','post:p-mir-'+m.id]})})}
  else if(id==='ayin'){D.mass.parts.forEach(function(p,i){S.push({kick:'Kutsal Ayin · '+p.n,title:p.t,text:cut(p.lead,220),btn:['Bu bölümü oku','read:mass#'+i]})})}
  else if(id==='kilise'){D.churches.cities.slice(0,6).forEach(function(c){var x=c.ch[0];S.push({kick:c.n+' · '+c.ch.length+' kilise',title:x.n,text:x.addr,btn:['Kiliseyi aç','church:'+x.id]})})}
  else if(id==='papalar'){POPE_LINE.slice(-6).forEach(function(pid){var x=ACC[pid];S.push({kick:x.ord+'. papa',title:x.name,text:cut(x.bio,200),art:x.art,tone:x.tone,btn:['Profili aç','acc:'+pid]})})}
  else if(a&&a.pope){var p=a.pope;S.push({kick:p.cat,title:p.name,text:p.years+' · '+p.born,btn:['Hayatını oku','read:pope:'+id]});p.secs.forEach(function(s,i){S.push({kick:p.name,title:s[0],text:cut(s[1],230),btn:['Tamamını oku','read:pope:'+id+'#'+i]})})}
  else if(a&&a.saint){var s2=a.saint;S.push({kick:s2.ep,title:s2.name,text:s2.era,btn:['Hayatını oku','read:saint:'+id]});sectionsOf(s2.body,'').slice(0,5).forEach(function(x,i){S.push({kick:s2.name,title:x.t,text:cut(x.p.join(' '),230),btn:['Tamamını oku','read:saint:'+id+'#'+i]})})}
  else if(a&&D.pages[id]){D.pages[id].secs.slice(0,6).forEach(function(x,i){S.push({kick:a.name,title:x[0],text:cut(x[1].join(' '),230),btn:['Tamamını oku','read:page:'+id+'#'+i]})})}
  else if(a){S.push({kick:a.cat,title:a.name,text:cut(a.bio,230)})}
  var dflt=linkFor(id);
  S.forEach(function(x){x.art=x.art||(a?a.art:'cross');x.tone=x.tone||(a?a.tone:'gold');if(!x.btn&&dflt)x.btn=dflt});
  return S;
}
function openHighlight(id,i){
  var a=ACC[id],S=[];
  if(id==='katekizm'){var p=D.comp[i],qs=p.items.filter(function(it){return it[0]==='q'}),step=Math.max(1,Math.floor(qs.length/6));for(var j=0;j<6&&j*step<qs.length;j++){var it=qs[j*step];S.push({kick:p.t+' · Soru '+it[1],title:plain(it[2]),text:cut(it[3],200),art:PART_ART[i],tone:PART_TONE[i],btn:['Katekizm’de oku','read:comp:'+i+'#'+it[1]]})}}
  else if(a.saint){var secs=sectionsOf(a.saint.body,''),x=secs[i];chunks(x.p.join(' '),230).slice(0,6).forEach(function(c,j){S.push({kick:a.name,title:j?'':(x.t||a.name),text:c,art:a.art,tone:a.tone,btn:['Tamamını oku','read:saint:'+id+'#'+i]})})}
  else if(a.pope){var s=a.pope.secs[i];chunks(s[1],230).forEach(function(c,j){S.push({kick:a.name,title:j?'':s[0],text:c,art:'tiara',tone:a.tone,btn:['Tamamını oku','read:pope:'+id+'#'+i]})})}
  else if(id==='gunah'){var src=i===0?[D.gun.steps[0]]:i===1?D.gun.steps:null;if(src)src.forEach(function(s,j){S.push({kick:'Adım '+(j+1),title:s.t,text:cut(s.x,230),btn:['Bu adımı oku','read:gunah#'+j]})});else if(i===2)D.gun.faq.slice(0,6).forEach(function(f){S.push({kick:'Soru',title:f.q,text:cut(f.a,230),btn:['Tüm sorular','read:gunah']})});else D.gun.mart.items.forEach(function(m){S.push({kick:D.gun.mart.t,title:m.n,text:cut(m.x,230),btn:['Tamamını oku','read:gunah']})});S.forEach(function(x){x.art='keys';x.tone='indigo'})}
  else if(id==='tesbih'){var st=D.tes.sets[i],sa2=SET_ART[st.id];S.push({kick:st.dt,title:st.t,text:'',art:sa2[0],tone:sa2[1],btn:['Tesbihe başla','rosary']});st.items.forEach(function(x,j){S.push({kick:(j+1)+'. gizem',title:x,text:'',art:sa2[0],tone:sa2[1],btn:['Tesbihe başla','rosary']})})}
  else if(id==='islam'||id==='ateizm'){var cs=id==='islam'?D.isl:D.ate,pp=cs.parts[i],base=0;for(var q=0;q<i;q++)base+=cs.parts[q].secs.length;pp.secs.forEach(function(s,j){S.push({kick:pp.t,title:s.t,text:cut(s.b.replace(/#{2,3}[^\n]*/g,''),230),art:a.art,tone:a.tone,btn:['Tamamını oku','read:'+id+'#'+(base+j)]})})}
  else if(id==='ayin'){var mp=D.mass.parts[i];S.push({kick:'Kutsal Ayin · '+mp.n,title:mp.t,text:cut(mp.lead,230),art:'chalice',tone:'purple',btn:['Bu bölümü oku','read:mass#'+i]})}
  else if(id==='kilise'){var city=D.churches.cities[i];city.ch.forEach(function(x){S.push({kick:city.n+' · '+x.rite,title:x.n,text:x.addr,art:'church',tone:'orange',btn:['Kiliseyi aç','church:'+x.id]})})}
  if(S.length)playStory([{id:id,slides:S}],0);
}
function openStory(id){
  var order=['bugun'].concat(STORY_QS.map(function(n){return 'q:'+n})).concat(follows);
  var start=order.indexOf(id);
  var seq=start>=0?order.slice(start).map(function(x){return {id:x,slides:storySlides(x)}}):[{id:id,slides:storySlides(id)}];
  playStory(seq,0);
}
function storyAcc(id){if(id.indexOf('q:')===0){var n=+id.slice(2);return {id:id,name:'Soru '+n,handle:'katekizm · soru '+n,art:PART_ART[CPART[n]],tone:PART_TONE[CPART[n]],url:'katekizm.html'}}return ACC[id]}
function playStory(seq,si){
  var cur=seq[si],a=storyAcc(cur.id),i=0,timer=null,t0=0,elapsed=0,DUR=6500,paused=false;
  var el=h('<div class="ov story" role="dialog" aria-label="'+esc(a.name)+' hikâyesi"><div class="bg"></div><div class="bars">'+cur.slides.map(function(){return '<i><b></b></i>'}).join('')+'</div><div class="sh">'+av(a.art,a.tone,32)+'<b>'+esc(a.handle)+'</b><small class="ix"></small><button type="button" class="x" aria-label="Kapat">'+ic('x')+'</button></div><div class="tapl"></div><div class="tapr"></div><div class="sbody"></div><div class="sfoot"><button type="button" class="in">Soru sor…</button><button type="button" class="lk" aria-label="Beğen">'+ic('heart')+'</button><button type="button" class="shr" aria-label="Paylaş">'+ic('send')+'</button></div></div>');
  app.appendChild(el);seen[cur.id]=1;sset('seen',seen);
  var bars=el.querySelectorAll('.bars b'),body=el.querySelector('.sbody'),bg=el.querySelector('.bg');
  function show(){
    var s=cur.slides[i],c=tone(s.tone);
    bg.style.background='linear-gradient(172deg,'+c[0]+' 0%,#ffffff 78%)';
    el.querySelector('.ix').textContent=(i+1)+'/'+cur.slides.length;body.style.color=c[1];
    body.innerHTML=art(s.art,'big')+(s.kick?'<div class="kick">'+esc(s.kick)+'</div>':'')+(s.title?'<h2 style="color:#111">'+esc(s.title)+'</h2>':'')+(s.text?'<p style="white-space:pre-line">'+esc(s.text)+'</p>':'')+(s.q?'<p class="q">'+esc(s.q)+'</p>':'')+(s.stk?'<span class="stk" style="color:#111">📖 '+esc(s.stk)+'</span>':'')+(s.btn?'<button type="button" class="slink" data-act="'+esc(s.btn[1])+'">'+esc(s.btn[0])+' ›</button>':'');
    bars.forEach(function(b,j){b.style.transition='none';b.style.width=j<i?'100%':'0%'});elapsed=0;run();
  }
  function run(){clearTimeout(timer);var b=bars[i],rest=DUR-elapsed;t0=Date.now();requestAnimationFrame(function(){b.style.transition='width '+rest+'ms linear';b.style.width='100%'});timer=setTimeout(next,rest)}
  function pause(){if(paused)return;paused=true;clearTimeout(timer);elapsed+=Date.now()-t0;var b=bars[i],w=getComputedStyle(b).width;b.style.transition='none';b.style.width=w}
  function resume(){if(!paused)return;paused=false;run()}
  function next(){if(i<cur.slides.length-1){i++;show()}else if(si<seq.length-1){close();playStory(seq,si+1)}else close()}
  function prev(){if(i>0){i--;show()}else if(si>0){close();playStory(seq,si-1)}else show()}
  function close(){clearTimeout(timer);el.remove();document.removeEventListener('keydown',key);var top=stack[stack.length-1];if(top&&top.name==='home'){var st=view.scrollTop;vHome();view.scrollTop=st}}
  function key(e){if(e.key==='Escape')close();if(e.key==='ArrowRight')next();if(e.key==='ArrowLeft')prev()}
  document.addEventListener('keydown',key);
  var downAt=0;
  ['tapl','tapr'].forEach(function(cls){var z=el.querySelector('.'+cls);z.addEventListener('pointerdown',function(){downAt=Date.now();pause()});z.addEventListener('pointerup',function(){var held=Date.now()-downAt>350;resume();if(!held){cls==='tapl'?prev():next()}});z.addEventListener('pointerleave',resume)});
  el.querySelector('.x').addEventListener('click',close);
  el.querySelector('.shr').addEventListener('click',function(){share(a.url||'',a.name)});
  el.querySelector('.lk').addEventListener('click',function(e){e.currentTarget.classList.toggle('liked')});
  el.querySelector('.in').addEventListener('click',function(){pause();openComments(cur.id==='gunah'?'gunah':'sss',resume)});
  body.addEventListener('click',function(e){var b=e.target.closest('[data-act]');if(!b)return;var act=b.getAttribute('data-act');close();openTarget(act)});
  show();
}
/* ---------- questions sheet ---------- */
function openComments(which,onClose){
  var a=ACC[which]||ACC.sss,groups=which==='gunah'?[{t:'Günah Çıkarma',items:D.gun.faq}]:D.sss;if(which!=='gunah')a=ACC.sss;
  var dim=h('<div class="dim"></div>'),sh=h('<div class="sheet" role="dialog" aria-label="Sorular"><div class="gb"></div><h4>Sorular</h4><div class="sc"></div></div>'),sc=sh.querySelector('.sc');
  var html='<div class="cm">'+av(a.art,a.tone,32)+'<p><b>'+esc(a.handle)+'</b> Aklınıza takılanlar ve kısa cevapları. Bir soruya dokunun, cevabı açılsın.<small>Sabitlendi</small></p></div>';
  groups.forEach(function(g,gi){if(groups.length>1)html+='<div class="cgrp">'+esc(g.t)+'</div>';g.items.forEach(function(x,xi){var id='a'+gi+'-'+xi;html+='<div class="cm">'+av('cross','gold',32)+'<p><b>soru</b> '+esc(x.q)+'<button type="button" class="tog" data-tog="'+id+'">Cevabı gör (1)</button></p></div><div class="cm rp" id="'+id+'" hidden>'+av(a.art,a.tone,26)+'<p><b>'+esc(a.handle)+'</b> '+x.a+'</p></div>'})});
  sc.innerHTML=html;
  sc.addEventListener('click',function(e){var b=e.target.closest('[data-tog]');if(!b)return;var r=sc.querySelector('#'+b.getAttribute('data-tog'));r.hidden=!r.hidden;b.textContent=r.hidden?'Cevabı gör (1)':'Cevabı gizle'});
  function close(){dim.remove();sh.remove();if(onClose)onClose()}
  dim.addEventListener('click',close);app.appendChild(dim);app.appendChild(sh);
}
/* ---------- rosary player ---------- */
function rosarySteps(){
  var P=D.tes.prayers,S=[];function add(id,ex){var p=P[id];S.push(Object.assign({t:p.t,x:p.x},ex||{}))}
  add('hac-isareti',{bead:'cross'});add('iman-aciklamasi',{bead:'cross'});add('goklerdeki-pederimiz',{bead:'big'});
  for(var i=0;i<3;i++)add('selam-sana-meryem',{k:i+1,of:3});add('pedere-san');
  todaySet.items.forEach(function(m,d){S.push({t:(d+1)+'. gizem',x:m,announce:true,dec:d});add('goklerdeki-pederimiz',{bead:'big',dec:d});for(var j=0;j<10;j++)add('selam-sana-meryem',{k:j+1,of:10,dec:d});add('pedere-san',{dec:d});add('fatima-duasi',{dec:d})});
  add('selam-sana-kralice');add('bitiris-duasi');add('hac-isareti',{bead:'cross'});return S;
}
function openRosary(){
  var S=rosarySteps(),key='rosary.'+todaySet.id+'.'+M+'-'+Dd,i=sget(key,0);if(i>=S.length)i=0;
  var el=h('<div class="ov ros" role="dialog" aria-label="Tesbih"><div class="sh"><span style="width:32px;height:32px">'+av('beads','gold',32)+'</span><b>tesbih.duasi</b><small class="ix"></small><button type="button" class="x" aria-label="Kapat">'+ic('x')+'</button></div><div class="bars" style="padding-top:4px"><i><b></b></i><i><b></b></i><i><b></b></i><i><b></b></i><i><b></b></i></div><button type="button" class="stage" aria-label="Sonraki dua"></button><div class="hint">Dokunun: sonraki dua · <button type="button" class="pv" style="text-decoration:underline">geri</button> · <button type="button" class="rs" style="text-decoration:underline">baştan</button></div></div>');
  app.appendChild(el);var stage=el.querySelector('.stage'),bars=el.querySelector('.bars');
  function beads(k,of){var out='';for(var j=0;j<of;j++){var ang=(j/of)*Math.PI*2-Math.PI/2,x=130+100*Math.cos(ang),y=130+100*Math.sin(ang);out+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(j<k?11:9)+'" fill="'+(j<k?'#9b6a10':'#fffaf0')+'" stroke="#9b6a10" stroke-width="2"/>'}return out}
  function show(){var s=S[i];sset(key,i);var d=s.dec!=null?s.dec:(i<7?-1:5);
    bars.querySelectorAll('b').forEach(function(b,j){b.style.width=j<d?'100%':j===d?(s.k?(s.k/10*100):s.announce?2:5)+'%':'0%'});
    el.querySelector('.ix').textContent=(i+1)+'/'+S.length;
    var inner=s.k?'<div style="position:relative;display:inline-block"><svg class="bd" viewBox="0 0 260 260" aria-hidden="true">'+beads(s.k,s.of)+'</svg><div class="cnt2"><b>'+s.k+' / '+s.of+'</b><small>'+esc(s.t)+'</small></div></div>':'<div style="width:120px;color:#9b6a10">'+art(s.announce?SET_ART[todaySet.id][0]:s.bead==='cross'?'cross':'beads','big')+'</div>';
    stage.innerHTML=inner+(s.dec!=null&&!s.announce?'<div class="myst">'+(s.dec+1)+'. gizem · '+esc(todaySet.items[s.dec])+'</div>':'<div class="myst">'+esc(todaySet.t)+'</div>')+'<h3>'+esc(s.announce?s.x:s.t)+'</h3>'+(s.k&&s.k>1?'':'<div class="ptxt">'+esc(s.announce?'':s.x)+'</div>')}
  stage.addEventListener('click',function(){if(i<S.length-1){i++;show()}else{toast('Tesbih tamamlandı. Amin.',true);el.remove()}});
  el.querySelector('.pv').addEventListener('click',function(){if(i>0){i--;show()}});
  el.querySelector('.rs').addEventListener('click',function(){i=0;show()});
  el.querySelector('.x').addEventListener('click',function(){el.remove()});
  show();
}
/* keyboard: the follow chip inside reels is a span */
view.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-follow][role=button]')){e.preventDefault();e.target.click()}});
/* ================= version 3: Direct (Sohbetler), settings menu, contact form ================= */
ICONS.church='<path d="M12 2v4M10 4h4"/><path d="M5 21V11l7-5 7 5v10"/><path d="M3 21h18"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/>';
ICONS.pen='<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>';
ICONS.gear='<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>';
ICONS.sun='<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
ICONS.moon='<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>';
ICONS.globe='<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>';
ICONS.info='<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>';
ICONS.cam='<rect x="3" y="6" width="18" height="14" rx="4"/><circle cx="12" cy="13" r="3.5"/><path d="M8.5 6l1.5-2.5h4L15.5 6"/>';
ICONS.mic='<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>';

/* ----- display preferences: theme, text size, contrast, readable font, motion ----- */
var PREFS=sget('prefs',{theme:'system',size:1,contrast:false,font:false,motion:false});
function applyPrefs(){
  var r=document.documentElement;
  if(PREFS.theme==='system')r.removeAttribute('data-theme');else r.setAttribute('data-theme',PREFS.theme);
  r.style.setProperty('--z',[0.92,1,1.12,1.25][PREFS.size]||1);
  r.toggleAttribute('data-contrast',!!PREFS.contrast);
  r.toggleAttribute('data-readable',!!PREFS.font);
  r.toggleAttribute('data-still',!!PREFS.motion);
  sset('prefs',PREFS);
}
applyPrefs();
function openSettings(){
  var el=h('<div class="glass" role="dialog" aria-label="Görünüm ve erişilebilirlik"><div class="glass-bg"></div><div class="gsheet"><div class="gb"></div>'
   +'<h4>katolikdunyasi</h4>'
   +'<div class="gsec"><div class="glab">'+ic('globe')+'Dil</div><div class="seg" role="group" aria-label="Dil"><button type="button" class="on" aria-pressed="true">Türkçe</button><a href="'+SITE+'en/" target="_blank" rel="noopener">English ↗</a></div></div>'
   +'<div class="gsec"><div class="glab">'+ic(PREFS.theme==='dark'?'moon':'sun')+'Tema</div><div class="seg" role="group" aria-label="Tema" id="segtheme">'+[['light','Açık'],['dark','Koyu'],['system','Sistem']].map(function(t){return '<button type="button" data-th="'+t[0]+'" class="'+(PREFS.theme===t[0]?'on':'')+'" aria-pressed="'+(PREFS.theme===t[0])+'">'+t[1]+'</button>'}).join('')+'</div></div>'
   +'<button type="button" class="grow" id="a11ybtn" aria-expanded="false">'+ic('gear')+'<span>Erişilebilirlik ayarları</span>'+ic('chev')+'</button>'
   +'<div class="a11y" id="a11y" hidden>'
   +'<div class="arow"><span>Yazı boyutu</span><div class="seg sm" id="segsize">'+['A-','A','A+','A++'].map(function(t,i){return '<button type="button" data-sz="'+i+'" class="'+(PREFS.size===i?'on':'')+'" aria-pressed="'+(PREFS.size===i)+'">'+t+'</button>'}).join('')+'</div></div>'
   +[['contrast','Yüksek karşıtlık'],['font','Okunaklı yazı tipi (disleksi)'],['motion','Animasyonları azalt']].map(function(o){return '<label class="arow"><span>'+o[1]+'</span><input type="checkbox" class="sw" data-pref="'+o[0]+'"'+(PREFS[o[0]]?' checked':'')+'></label>'}).join('')
   +'</div><button type="button" class="gclose">Kapat</button></div></div>');
  app.appendChild(el);
  requestAnimationFrame(function(){el.classList.add('in')});
  function close(){el.classList.remove('in');setTimeout(function(){el.remove()},220)}
  el.querySelector('.glass-bg').addEventListener('click',close);
  el.querySelector('.gclose').addEventListener('click',close);
  el.querySelector('#a11ybtn').addEventListener('click',function(){var p=el.querySelector('#a11y');p.hidden=!p.hidden;this.setAttribute('aria-expanded',!p.hidden)});
  el.querySelectorAll('[data-th]').forEach(function(b){b.addEventListener('click',function(){PREFS.theme=b.getAttribute('data-th');applyPrefs();el.querySelectorAll('[data-th]').forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)})})});
  el.querySelectorAll('[data-sz]').forEach(function(b){b.addEventListener('click',function(){PREFS.size=+b.getAttribute('data-sz');applyPrefs();el.querySelectorAll('[data-sz]').forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)})})});
  el.querySelectorAll('[data-pref]').forEach(function(c){c.addEventListener('change',function(){PREFS[c.getAttribute('data-pref')]=c.checked;applyPrefs()})});
}
/* ----- the five chats: the categories of Sık Sorulan Sorular ----- */
var CHAT_ART=[['trinity','purple'],['chalice','indigo'],['keys','gold'],['cosmos','blue'],['shield','red']];
var dmRead=sget('dmread',{});
function chatUnread(ci){var n=0;D.sss[ci].items.forEach(function(x,qi){if(!dmRead[ci+'-'+qi])n++});return n}
function totalUnread(){var n=0;D.sss.forEach(function(c,ci){if(chatUnread(ci))n++});return n}
var LIT_COLOR={olagan:'yeşil',advent:'mor',perhiz:'mor',noel:'beyaz',paskalya:'beyaz',triduum:'kırmızı'};
function firstSentence(s,n){var x=sentences(s)[0]||'';return cut(x,n||46)}
function vInbox(){
  var notes=[
    {t:'“'+firstSentence(todaySaint.b,44)+'”',a:tsArt,tn:tsTone,lab:todaySaint.n,go:'post:p-today'},
    {t:'Bugün: '+todaySet.t+' ✨',a:SET_ART[todaySet.id][0],tn:SET_ART[todaySet.id][1],lab:'tesbih.duasi',go:'rosary'},
    {t:SEASON.t+' · '+(LIT_COLOR[SEASON.id]||'')+' '+(SEASON.id==='olagan'?'🌿':SEASON.id==='advent'||SEASON.id==='perhiz'?'🟣':SEASON.id==='triduum'?'🔴':'⚪'),a:'wheat',tn:SEASON.id==='olagan'?'green':SEASON.id==='advent'||SEASON.id==='perhiz'?'purple':'gold',lab:'takvim',go:'story:bugun'}
  ];
  var html='<div class="hd dmh"><button type="button" data-tohome aria-label="Ana sayfaya dön">'+ic('back')+'</button><button type="button" class="acct" id="acct" aria-haspopup="dialog">katolikdunyasi '+ic('chev')+'</button><button type="button" data-contact aria-label="İletişim formu: yeni mesaj">'+ic('pen')+'</button></div>'
   +'<label class="search" for="dmq">'+ic('search')+'<input id="dmq" type="search" placeholder="Ara" autocomplete="off"></label>'
   +'<div class="notes">'+notes.map(function(n){return '<button type="button" class="note" data-go="'+n.go+'"><span class="bub"><span>'+esc(n.t)+'</span></span><span class="nav2">'+av(n.a,n.tn,64)+'</span><span class="nl">'+esc(n.lab)+'</span></button>'}).join('')+'</div>'
   +'<div class="dmt"><b>Sohbetler</b><button type="button" id="reqs">İstekler</button></div><div id="chats"></div>';
  view.innerHTML=html;
  drawChats('');
  view.querySelector('#acct').addEventListener('click',openSettings);
  view.querySelector('[data-tohome]').addEventListener('click',function(){setTab('home')});
  view.querySelector('[data-contact]').addEventListener('click',function(){go('contact')});
  view.querySelector('#reqs').addEventListener('click',function(){toast('Yeni mesaj isteği yok')});
  view.querySelector('#dmq').addEventListener('input',function(e){drawChats(e.target.value)});
}
function drawChats(q){
  var box=view.querySelector('#chats'),nq=norm(q.trim());
  if(nq){
    var out=[];D.sss.forEach(function(c,ci){c.items.forEach(function(x,qi){if(norm(x.q+' '+x.a).indexOf(nq)>=0)out.push('<button type="button" class="chat" data-chat="'+ci+'#'+qi+'">'+av(CHAT_ART[ci][0],CHAT_ART[ci][1],56)+'<p><b>'+esc(c.t)+'</b><span>'+esc(x.q)+'</span></p></button>')})});
    box.innerHTML=out.length?out.join(''):'<div class="empty">Sonuç yok. Kalem simgesiyle bize yazabilirsiniz.</div>';return;
  }
  box.innerHTML=D.sss.map(function(c,ci){
    var un=chatUnread(ci),tot=c.items.length,last=c.items[tot-1];
    var pre=un?(un===tot?esc(c.items[0].q):(un>=4?'4+ yeni mesaj':un+' yeni mesaj')):'Görüldü';
    var when=['1 sa','3 sa','5 sa','1 g','2 g'][ci];
    var a=CHAT_ART[ci];
    return '<button type="button" class="chat'+(un?' un':'')+'" data-chat="'+ci+'">'+(un?'<span class="ring" style="width:60px;height:60px"><span class="in">'+av(a[0],a[1],51).replace('class="av"','class="av" style="width:100%;height:100%"')+'</span></span>':av(a[0],a[1],56))
      +'<p><b>'+esc(c.t)+'</b><span>'+pre+' · '+when+'</span></p>'+(un?'<i class="udot" aria-label="Okunmamış"></i>':'')+'</button>';
  }).join('');
}
var chatObs=null;
function vChat(arg){
  var p=String(arg).split('#'),ci=+p[0],focus=p[1]!=null?+p[1]:null,c=D.sss[ci],a=CHAT_ART[ci];
  if(chatObs){chatObs.disconnect();chatObs=null}
  var html='<div class="hd dmc"><button type="button" data-back aria-label="Geri">'+ic('back')+'</button>'+av(a[0],a[1],34)+'<div class="ct"><b>'+esc(c.t)+'</b><small id="unc"></small></div><button type="button" data-share="sss.html" data-title="'+esc(c.t)+'" aria-label="Paylaş">'+ic('info')+'</button></div>'
   +'<div class="msgs" id="msgs"><div class="chead">'+av(a[0],a[1],88)+'<b>'+esc(c.t)+'</b><span>katolikdunyasi · Sık Sorulan Sorular</span><a class="vbtn" href="'+SITE+'sss.html" target="_blank" rel="noopener">Sayfayı gör</a></div>';
  var firstUn=null;
  c.items.forEach(function(x,qi){
    var id=ci+'-'+qi,un=!dmRead[id];if(un&&firstUn===null)firstUn=qi;
    if(un&&qi===firstUn&&qi>0)html+='<div class="newline"><span>Yeni mesajlar</span></div>';
    html+='<div class="tm">'+(qi===0?'Bugün':'')+'</div><div class="m out" id="mq'+qi+'">'+esc(x.q)+'</div>';
    var parts=String(x.a).split(/\n+/).filter(function(s){return s.trim()});
    html+='<div class="grp" data-mid="'+id+'">'+parts.map(function(pt,k){return '<div class="mrow2">'+(k===parts.length-1?av('jc','gold',28):'<span class="avsp"></span>')+'<div class="m in">'+pt+'</div></div>'}).join('')+'</div>';
  });
  html+='<div class="seen" id="seen"></div></div>'
   +'<form class="composer" id="comp" autocomplete="off"><span class="cbtn">'+ic('cam')+'</span><input id="cin" type="text" placeholder="Mesaj…" aria-label="Soru yazın"><button type="submit" class="sendb">Gönder</button></form>';
  view.innerHTML=html;
  function updateUnread(){var un=chatUnread(ci);view.querySelector('#unc').textContent=un?un+' okunmamış mesaj':'Tümü okundu';view.querySelector('#seen').textContent=un?'':'Görüldü'}
  updateUnread();
  chatObs=new IntersectionObserver(function(ents){ents.forEach(function(e){if(e.isIntersecting){var id=e.target.getAttribute('data-mid');if(!dmRead[id]){dmRead[id]=Date.now();sset('dmread',dmRead);e.target.classList.add('just');updateUnread()}chatObs.unobserve(e.target)}})},{root:view,threshold:0.55});
  view.querySelectorAll('.grp').forEach(function(g){if(!dmRead[g.getAttribute('data-mid')])chatObs.observe(g)});
  requestAnimationFrame(function(){var t=focus!=null?view.querySelector('#mq'+focus):firstUn!=null&&firstUn>0?view.querySelector('#mq'+firstUn):null;if(t)view.scrollTop=t.offsetTop-70});
  view.querySelector('#comp').addEventListener('submit',function(e){e.preventDefault();var inp=view.querySelector('#cin'),q=inp.value.trim();if(!q)return;inp.value='';
    var msgs=view.querySelector('#msgs');msgs.insertBefore(h('<div class="m out">'+esc(q)+'</div>'),view.querySelector('#seen'));
    var best=bestAnswer(q),reply;
    if(best)reply='<div class="mrow2">'+av('jc','gold',28)+'<div class="m in"><span class="mfrom">'+esc(best.c)+'</span><b>'+esc(best.q)+'</b><br>'+best.a+'</div></div>';
    else reply='<div class="mrow2">'+av('jc','gold',28)+'<div class="m in">Bu soruya hazır bir cevabımız yok. Sağ üstteki kalem simgesiyle bize yazabilirsiniz; size e-postayla döneriz.</div></div>';
    var tw=h('<div class="mrow2 typing">'+av('jc','gold',28)+'<div class="m in"><i></i><i></i><i></i></div></div>');msgs.insertBefore(tw,view.querySelector('#seen'));view.scrollTop=view.scrollHeight;
    setTimeout(function(){tw.remove();msgs.insertBefore(h(reply),view.querySelector('#seen'));view.scrollTop=view.scrollHeight},700);
  });
}
function bestAnswer(q){
  var words=norm(q).split(/[^a-z0-9çğöşü]+/).filter(function(w){return w.length>3});if(!words.length)return null;
  var best=null,bs=0;
  function test(c,x){var t=norm(x.q+' '+x.q+' '+x.a),s=0;words.forEach(function(w){if(t.indexOf(w.slice(0,Math.max(4,w.length-2)))>=0)s++});if(s>bs){bs=s;best={c:c,q:x.q,a:x.a}}}
  D.sss.forEach(function(c){c.items.forEach(function(x){test(c.t,x)})});D.gun.faq.forEach(function(x){test('Günah Çıkarma',x)});
  return bs>=Math.min(2,words.length)?best:null;
}
/* ----- contact form (the pen) ----- */
function vContact(){
  view.innerHTML='<div class="hd c"><button class="l" type="button" data-back aria-label="Geri">'+ic('back')+'</button><h1>Yeni mesaj</h1></div>'
   +'<div class="to"><span>Kime:</span><b>katolikdunyasi</b><span class="ver">✓</span></div>'
   +'<form class="cform" id="cf" novalidate><label for="cfn">Adınız</label><input id="cfn" name="name" autocomplete="name" required>'
   +'<label for="cfe">E-posta adresiniz</label><input id="cfe" name="email" type="email" autocomplete="email" required>'
   +'<label for="cft">Konu</label><select id="cft" name="topic"><option>Soru</option><option>Öneri</option><option>Hata bildirimi</option><option>Diğer</option></select>'
   +'<label for="cfm">Mesajınız</label><textarea id="cfm" name="message" rows="6" required></textarea>'
   +'<p class="cnote">Mesajınız doğrudan bize ulaşır; e-posta adresiniz yalnızca size cevap vermek için kullanılır. Gerçek sitede gönderimden önce kısa bir robot doğrulaması yapılır.</p>'
   +'<p class="cmsg" id="cmsg" role="status"></p><button type="submit" class="csend">Gönder</button></form>';
  view.querySelector('#cf').addEventListener('submit',function(e){e.preventDefault();var f=e.target,m=view.querySelector('#cmsg');
    if(!f.name.value.trim()||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value)||f.message.value.trim().length<5){m.className='cmsg err';m.textContent='Lütfen adınızı, geçerli bir e-posta adresini ve mesajınızı yazın.';return}
    m.className='cmsg ok';m.textContent='Bu bir test kopyası: mesaj gönderilmedi. Gerçek sitede bu form mesajı doğrudan bize iletir.';});
}

/* ================= version 4 ================= */
var ICH='<svg class="ichs" viewBox="0 0 48 24" aria-hidden="true"><path d="M3 12C13-.5 33-1 45 20.5M3 12C13 24.5 33 25 45 3.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M24 6.5v11M19.5 11h9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
ICONS.bookmark=ICONS.save;
ICONS.clock='<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';
ICONS.users='<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14a5 5 0 0 1 6 5"/>';
ICONS.type='<path d="M4 7V5h16v2M9 19h6M12 5v14"/>';
ICONS.lock='<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>';
ICONS.trash='<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>';
ICONS.mail='<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>';
ICONS.list='<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>';
ICONS.chevr='<path d="m9 6 6 6-6 6"/>';
ICONS.access='<circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5l7 1.5 7-1.5M12 10v5l-3.5 6M12 15l3.5 6"/>';
/* portraits of the popes (vatican.va) and the ichthys, wherever an avatar or drawing is drawn */
function art(k,cls){
  if(k==='jc')return JC;
  if(k==='ich')return ICH;
  if(String(k).indexOf('photo:')===0){var src=D.popeimg[k.slice(6)];if(src)return '<img class="pimg'+(cls?' '+cls:'')+'" src="'+src+'" alt="">';k='tiara'}
  return '<svg class="art'+(cls?' '+cls:'')+'" viewBox="0 0 120 120" aria-hidden="true">'+(D.ill[k]||D.ill.cross)+'</svg>';
}
function avInner(a){if(a==='jc')return '<span style="width:58%;height:58%;display:block">'+JC+'</span>';if(a==='ich')return '<span class="ichw">'+ICH+'</span>';return art(a)}
function av(a,t,size){var c=tone(t),ph=String(a).indexOf('photo:')===0;return '<span class="av'+(ph?' avp':'')+'" style="width:'+size+'px;height:'+size+'px;background:'+(ph?'transparent':c[0])+';color:'+c[1]+'">'+avInner(a)+'</span>'}
function ringAv(acc,size){var c=tone(acc.tone),ph=String(acc.art).indexOf('photo:')===0;return '<span class="ring'+(seen[acc.id]?' seen':'')+'" style="width:'+size+'px;height:'+size+'px"><span class="in"><span class="av'+(ph?' avp':'')+'" style="background:'+(ph?'transparent':c[0])+';color:'+c[1]+'">'+avInner(acc.art)+'</span></span></span>'}
ACC.me.art='ich';
POPE_LINE.forEach(function(id){var a=ACC[id];if(a&&D.popeimg[a.ord]){a.art='photo:'+a.ord;var p=POSTS['p-'+id];if(p&&a.pope)p.slides[0].art='photo:'+a.ord}});

/* ----- home: the logo in the middle opens the menu ----- */
var LOGO='<button type="button" class="logo" id="logo" aria-haspopup="dialog" aria-label="Katolik Dünyası, görünüm menüsü"><span class="lg-ich">'+ICH+'</span><span class="lg-t">KATOLİK DÜNYASI</span><svg class="i lg-ch" viewBox="0 0 24 24" aria-hidden="true">'+ICONS.chev+'</svg></button>';
function vHome(){
  var un=totalUnread();
  var html='<div class="hd hm"><span></span>'+LOGO+'<span class="r"><button type="button" class="badge" data-go="notif" aria-label="Bildirimler">'+ic('heart')+'<i></i></button><button type="button" class="dmbtn" data-go="inbox" aria-label="Mesajlar'+(un?', '+un+' okunmamış sohbet':'')+'">'+ic('send')+(un?'<span class="cnt3">'+un+'</span>':'')+'</button></span></div>';
  html+='<div class="stories"><button type="button" class="sto" data-story="bugun">'+ringAv(ACC.bugun,70)+'<span>Bugün</span></button>'
    +STORY_QS.map(function(n){var pi=CPART[n];return '<button type="button" class="sto cq" data-story="q:'+n+'"><span class="ring'+(seen['q:'+n]?' seen':'')+'" style="width:70px;height:70px"><span class="in"><span class="av" style="background:'+tone(PART_TONE[pi])[0]+';color:'+tone(PART_TONE[pi])[1]+'">'+art(PART_ART[pi])+'</span></span></span><span>Soru '+n+'</span></button>'}).join('')
    +follows.map(function(id){var a=ACC[id];if(!a)return'';return '<button type="button" class="sto" data-story="'+id+'">'+ringAv(a,70)+'<span>'+esc(a.handle)+'</span></button>'}).join('')+'</div>';
  html+=FEED.map(function(id){return POSTS[id]?postHTML(POSTS[id]):''}).join('');
  html+='<div class="empty">Bugünlük bu kadar. Keşfet’te daha fazlası var.</div>';
  view.innerHTML=html;wireCarousels(view);
  view.querySelector('#logo').addEventListener('click',openSettings);
}
/* ----- the appearance menu: drops down from the logo ----- */
function openSettings(){
  var el=h('<div class="glass" role="dialog" aria-label="Görünüm ve erişilebilirlik"><div class="glass-bg"></div><div class="gsheet">'
   +'<div class="gtitle"><span class="lg-ich">'+ICH+'</span>Görünüm</div>'
   +'<div class="gcard"><div class="gsec"><div class="glab">'+ic('globe')+'Dil</div><div class="seg" role="group" aria-label="Dil"><button type="button" class="on" aria-pressed="true">Türkçe</button><a href="'+SITE+'en/" target="_blank" rel="noopener">English ↗</a></div></div>'
   +'<div class="gsec"><div class="glab">'+ic('moon')+'Tema</div><div class="seg" role="group" aria-label="Tema">'+[['light','Açık'],['dark','Koyu'],['system','Otomatik']].map(function(t){return '<button type="button" data-th="'+t[0]+'" class="'+(PREFS.theme===t[0]?'on':'')+'" aria-pressed="'+(PREFS.theme===t[0])+'">'+t[1]+'</button>'}).join('')+'</div></div></div>'
   +'<div class="gcard"><button type="button" class="grow" id="a11ybtn" aria-expanded="false">'+ic('access')+'<span>Erişilebilirlik</span>'+ic('chev')+'</button>'
   +'<div class="a11y" id="a11y" hidden>'
   +'<div class="arow"><span>Yazı boyutu</span><div class="seg sm">'+['A-','A','A+','A++'].map(function(t,i){return '<button type="button" data-sz="'+i+'" class="'+(PREFS.size===i?'on':'')+'" aria-pressed="'+(PREFS.size===i)+'">'+t+'</button>'}).join('')+'</div></div>'
   +[['contrast','Yüksek karşıtlık'],['font','Okunaklı yazı tipi (disleksi)'],['motion','Animasyonları azalt']].map(function(o){return '<label class="arow"><span>'+o[1]+'</span><input type="checkbox" class="sw" data-pref="'+o[0]+'"'+(PREFS[o[0]]?' checked':'')+'></label>'}).join('')
   +'</div></div><button type="button" class="gclose">Bitti</button></div></div>');
  app.appendChild(el);requestAnimationFrame(function(){el.classList.add('in')});
  function close(){el.classList.remove('in');setTimeout(function(){el.remove()},220)}
  el.querySelector('.glass-bg').addEventListener('click',close);el.querySelector('.gclose').addEventListener('click',close);
  el.querySelector('#a11ybtn').addEventListener('click',function(){var p=el.querySelector('#a11y');p.hidden=!p.hidden;this.setAttribute('aria-expanded',!p.hidden)});
  function segs(attr,fn){el.querySelectorAll('['+attr+']').forEach(function(b){b.addEventListener('click',function(){fn(b.getAttribute(attr));el.querySelectorAll('['+attr+']').forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)})})})}
  segs('data-th',function(v){PREFS.theme=v;applyPrefs()});segs('data-sz',function(v){PREFS.size=+v;applyPrefs()});
  el.querySelectorAll('[data-pref]').forEach(function(c){c.addEventListener('change',function(){PREFS[c.getAttribute('data-pref')]=c.checked;applyPrefs()})});
}
if(typeof window!=='undefined'){var mq=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)')}

/* ----- Katekizm: the prefaces and appendices too ----- */
var CX_TILES=[['cx:motu','Motu Proprio','Önsöz · 2005','scroll'],['cx:giris','Giriş','Kardinal Ratzinger','book'],['cx:iman','İman Açıklamaları','Havariler ve İznik','cross'],['cx:emir','On Emir','Üç biçimde','tablets'],['cx:ekler','Ekler','Dualar ve formüller','candle']];
function vKatekizm(){
  var a=ACC.katekizm;
  var html='<div class="hd"><h1>katekizm <span class="ver">✓</span></h1><span class="r"><button type="button" data-share="katekizm.html" data-title="Katekizm" aria-label="Paylaş">'+ic('send')+'</button></span></div>'
   +'<label class="search" for="kq">'+ic('search')+'<input id="kq" type="search" placeholder="598 soru içinde ara…" autocomplete="off" value="'+esc(katQ)+'"></label><div id="kres"></div>'
   +'<div id="kmain"><div class="pr"><div class="top"><button type="button" data-story="q:'+STORY_QS[0]+'" aria-label="Günün sorusu">'+ringAv(a,90)+'</button><div class="nums"><button type="button" data-go="read:comp:0"><b>598</b><span>soru</span></button><button type="button" disabled><b>4</b><span>kısım</span></button><button type="button" data-go="read:cx:ekler"><b>'+(D.cx.prayers.length+D.cx.formulas.length)+'</b><span>ek</span></button></div></div>'
   +'<h2>'+esc(a.name)+' <span class="ver">✓</span></h2><div class="cat">'+esc(a.cat)+'</div><p>'+esc(a.bio)+' Önsöz, giriş ve ekleriyle birlikte.</p>'
   +'<div class="btns">'+folBtnHTML('katekizm')+'<button type="button" data-read="cx:motu">Baştan oku</button>'+saveBtnHTML('p-cq',true)+'</div>'
   +'<div class="hls">'+CX_TILES.slice(0,2).map(function(t){return '<button type="button" class="hl" data-go="read:'+t[0]+'"><span class="o">'+av(t[3],'gold',58)+'</span><span>'+esc(t[1])+'</span></button>'}).join('')+D.comp.map(function(p,i){return '<button type="button" class="hl" data-hl="katekizm" data-i="'+i+'"><span class="o">'+av(PART_ART[i],PART_TONE[i],58)+'</span><span>'+esc(p.t)+'</span></button>'}).join('')+'<button type="button" class="hl" data-go="read:cx:ekler"><span class="o">'+av('candle','gold',58)+'</span><span>Ekler</span></button></div></div>'
   +'<div class="ptabs"><span class="on">'+ic('grid')+'</span><span>'+ic('book')+'</span></div>'
   +'<div class="grid">'+CX_TILES.slice(0,2).map(function(t){return '<button type="button" class="tile" data-go="read:'+t[0]+'" style="background:linear-gradient(160deg,#fff1c9,#fff 150%);color:#9b6a10"><small>'+esc(t[2])+'</small>'+art(t[3])+'<b>'+esc(t[1])+'</b></button>'}).join('')
   +CHAPTERS.map(function(c){var t=tone(PART_TONE[c.pi]);return '<button type="button" class="tile" data-go="read:comp:'+c.pi+'#h'+c.ii+'" style="background:linear-gradient(160deg,'+t[0]+',#fff 150%);color:'+t[1]+'"><small>'+esc(D.comp[c.pi].t)+'</small>'+art(PART_ART[c.pi])+'<b>'+esc(cut(c.t.replace(/^[^:]+:\s*/,''),46))+'</b></button>'}).join('')
   +CX_TILES.slice(2).map(function(t){return '<button type="button" class="tile" data-go="read:'+t[0]+'" style="background:linear-gradient(160deg,#fff1c9,#fff 150%);color:#9b6a10"><small>'+esc(t[2])+'</small>'+art(t[3])+'<b>'+esc(t[1])+'</b></button>'}).join('')+'</div></div>';
  view.innerHTML=html;
  var kq=view.querySelector('#kq');
  function draw(){katQ=kq.value;var q=norm(katQ.trim()),box=view.querySelector('#kres'),main=view.querySelector('#kmain');if(!q){box.innerHTML='';main.hidden=false;return}main.hidden=true;var out=[];var num=+katQ.trim();if(num&&CQ[num])out.push(CQ[num]);
    Object.keys(CQ).forEach(function(n){if(out.length<40&&norm(CQ[n][2]+' '+CQ[n][3]).indexOf(q)>=0&&out.indexOf(CQ[n])<0)out.push(CQ[n])});
    box.innerHTML=out.length?out.map(function(it){return '<button type="button" class="qres" data-read="comp:'+CPART[it[1]]+'#'+it[1]+'"><b>'+it[1]+'. '+esc(plain(it[2]))+'</b><span>'+esc(D.comp[CPART[it[1]]].t)+' · '+esc(cut(it[3],90))+'</span></button>'}).join(''):'<div class="empty">Bu aramayla eşleşen soru yok.</div>'}
  kq.addEventListener('input',draw);if(katQ)draw();
}
function readerMeta(key){
  var k=key.split('#')[0];
  if(k.indexOf('cx:')===0){var t={motu:'Motu Proprio',giris:'Giriş',iman:'İman Açıklamaları',emir:'On Emir',ekler:'Ekler'}[k.slice(3)];return {title:t,handle:'katekizm',art:'book',tone:'gold'}}
  return readerMetaBase(key);
}
function pre(t){return '<p class="verse">'+esc(t).replace(/\n/g,'<br>')+'</p>'}
function cxBody(id){
  var X=D.cx;
  if(id==='motu'||id==='giris'){var o=X[id];return {kick:o.by,lead:o.sub,body:o.paras.filter(Boolean).map(function(p,i){return '<p id="s'+i+'">'+p+'</p>'}).join('')}}
  if(id==='iman')return {kick:'Katekizm · Ek metinler',lead:'Kilise’nin iki büyük İman Açıklaması.',body:X.creeds.map(function(c,i){return '<h2 id="s'+i+'">'+esc(c.t)+'</h2>'+pre(c.x)}).join('')+'<h2 id="s9">'+esc(X.of.t)+'</h2>'+pre(X.of.x)+'<p class="la">'+esc(X.of.la).replace(/\n/g,'<br>')+'</p>'};
  if(id==='emir')return {kick:'Katekizm · Ek metinler',lead:'On Emir, Kutsal Kitap’taki iki biçimi ve geleneksel ilmihal formülüyle.',body:X.dec.rows.map(function(r,i){return '<h2 id="s'+i+'">'+(i+1)+'. buyruk</h2>'+r.map(function(c,j){return c?'<div class="dcol"><span>'+esc(X.dec.cols[j])+'</span>'+pre(c)+'</div>':''}).join('')}).join('')};
  if(id==='ekler')return {kick:'Katekizm · Ekler',lead:'A. Ortak dualar ve B. Katolik öğretinin formülleri.',body:'<div class="h1x">A. Ortak dualar</div>'+X.prayers.map(function(p,i){return '<h2 id="s'+i+'">'+esc(p.t)+'</h2>'+pre(p.x)+(p.la?'<details class="lad"><summary>Latincesi</summary><p class="la">'+esc(p.la).replace(/\n/g,'<br>')+'</p></details>':'')}).join('')+'<div class="h1x">B. Formüller</div>'+X.formulas.map(function(f,i){return '<h2 id="sf'+i+'">'+esc(f.t)+'</h2>'+(f.plain?'<p>'+f.items.map(esc).join('<br>')+'</p>':'<ol class="fl">'+f.items.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ol>')}).join('')};
}
function vReader(key){
  var k=key.split('#')[0];
  if(k.indexOf('cx:')===0){
    var id=k.slice(3),meta=readerMeta(k),c=tone('gold'),b=cxBody(id);
    view.innerHTML='<div class="hd c"><button class="l" type="button" data-back aria-label="Geri">'+ic('back')+'</button><h1>katekizm</h1><span style="position:absolute;right:14px" class="r"><button type="button" data-share="'+(id==='ekler'?'ekler.html':id==='motu'?'motu-proprio.html':id==='giris'?'giris.html':'iman-ikrari.html')+'" data-title="'+esc(meta.title)+'" aria-label="Paylaş">'+ic('send')+'</button></span></div><div class="prog"><i id="pg"></i></div>'
      +'<article class="rd"><div style="width:76px;height:76px;margin-top:10px">'+av('book','gold',76)+'</div><div class="kick" style="color:var(--gold)">'+esc(b.kick)+'</div><h1>'+esc(meta.title)+'</h1>'+(b.lead?'<p class="lead">'+esc(b.lead)+'</p>':'')+b.body+'</article>';
    var pg=view.querySelector('#pg');view.onscroll=function(){var max=view.scrollHeight-view.clientHeight;pg.style.width=(max>0?view.scrollTop/max*100:100)+'%'};
  } else vReaderBase(key);
  attachScrubber();
}

/* ----- the section scrubber for long texts (like the date scrubber in Apple Photos) -----
   A thin gold line on the right edge appears while you scroll and fades away when you stop.
   Grab it to fly through the text; a label shows the section you are passing. A small
   "Bölümler" pill opens the list of sections. */
function sectionLabel(el){
  if(el.classList.contains('qa')){var n=el.querySelector('.qn');return (n?n.textContent:'')}
  return plain(el.textContent).slice(0,60);
}
function attachScrubber(){
  detachScrubber();
  var rd=view.querySelector('.rd');if(!rd)return;
  var marks=[].slice.call(rd.querySelectorAll('[id^="s"]')).filter(function(e){return e.id!=='s'});
  var heads=marks.filter(function(e){return /^H2$/.test(e.tagName)||e.classList.contains('h2x')||e.classList.contains('h3x')});
  if(view.scrollHeight<view.clientHeight*2.2||marks.length<3)return;
  var chapters=[].slice.call(rd.querySelectorAll('.h1x,.h2x,h2'));
  var vr=view.getBoundingClientRect(),ar=app.getBoundingClientRect();
  var top=vr.top-ar.top+56,bottom=ar.bottom-vr.bottom+14;
  var sc=h('<div class="scrub" id="scrub" style="top:'+top+'px;bottom:'+bottom+'px" aria-hidden="true"><div class="srail"></div><div class="sticks"></div><div class="sthumb"><span class="slab"></span></div></div>');
  var pill=h('<button type="button" class="secpill" id="secpill" aria-label="Bölümler listesi">'+ic('list')+'<span>Bölümler</span><b class="pc"></b></button>');
  app.appendChild(sc);app.appendChild(pill);
  var thumb=sc.querySelector('.sthumb'),lab=sc.querySelector('.slab'),ticks=sc.querySelector('.sticks');
  var H=function(){return sc.clientHeight-44};
  var max=function(){return view.scrollHeight-view.clientHeight};
  // faint markers at the larger headings
  var big=chapters.filter(function(e){return e.classList.contains('h1x')||e.classList.contains('h2x')||e.tagName==='H2'});
  if(big.length>16)big=big.filter(function(e){return !e.classList.contains('h2x')||e.textContent.length<200}).filter(function(_,i,arr){return i%Math.ceil(arr.length/14)===0});
  var lastF=-1,shown=0;ticks.innerHTML=big.map(function(e){var f=Math.min(1,e.offsetTop/Math.max(1,view.scrollHeight));var lab=(f-lastF>0.14&&shown<6);if(lab){lastF=f;shown++}return '<i style="top:'+(f*100).toFixed(2)+'%"'+(lab?' data-t="'+esc(cut(plain(e.textContent).replace(/^[^:]{0,24}:\s*/,''),26))+'"':'')+'></i>'}).join('');
  var hideT=null,drag=false,lastY=view.scrollTop;
  function current(){var y=view.scrollTop+70,cur=null,ch=null;for(var i=0;i<marks.length;i++){if(marks[i].offsetTop<=y)cur=marks[i];else break}for(var j=0;j<chapters.length;j++){if(chapters[j].offsetTop<=y)ch=chapters[j];else break}return {m:cur,ch:ch}}
  function place(){var m=max(),f=m>0?view.scrollTop/m:0;thumb.style.transform='translateY('+(f*H()).toFixed(1)+'px)';
    var c=current(),t='';if(c.m&&c.m.classList.contains('qa')){t=sectionLabel(c.m)+(c.ch?' · '+cut(plain(c.ch.textContent).replace(/^[^:]+:\s*/,''),26):'')}else if(c.ch)t=cut(plain(c.ch.textContent),40);else if(c.m)t=cut(sectionLabel(c.m),40);
    lab.textContent=t||'Başlangıç';
    var hi=heads.indexOf(c.ch),pc=pill.querySelector('.pc');pc.textContent=(heads.length?Math.max(1,(hi<0?0:hi)+1)+'/'+heads.length:'')}
  function show(){sc.classList.add('on');clearTimeout(hideT);if(!drag)hideT=setTimeout(function(){sc.classList.remove('on')},1300)}
  var onScroll=function(){place();show();var dy=view.scrollTop-lastY;if(dy<-6)pill.classList.add('on');else if(dy>12)pill.classList.remove('on');lastY=view.scrollTop};
  view.addEventListener('scroll',onScroll,{passive:true});
  function toY(clientY){var r=sc.getBoundingClientRect(),f=Math.max(0,Math.min(1,(clientY-r.top-22)/H()));view.scrollTop=f*max()}
  thumb.addEventListener('pointerdown',function(e){drag=true;sc.classList.add('drag','on');thumb.setPointerCapture(e.pointerId);e.preventDefault()});
  thumb.addEventListener('pointermove',function(e){if(drag)toY(e.clientY)});
  function end(){if(!drag)return;drag=false;sc.classList.remove('drag');show()}
  thumb.addEventListener('pointerup',end);thumb.addEventListener('pointercancel',end);
  sc.querySelector('.srail').addEventListener('click',function(e){toY(e.clientY);show()});
  pill.addEventListener('click',function(){openSections(heads)});
  place();
  detachScrubber.fn=function(){view.removeEventListener('scroll',onScroll);sc.remove();pill.remove()};
}
function detachScrubber(){if(detachScrubber.fn){detachScrubber.fn();detachScrubber.fn=null}}
function openSections(heads){
  var dim=h('<div class="dim"></div>'),sh=h('<div class="sheet" role="dialog" aria-label="Bölümler"><div class="gb"></div><h4>Bölümler</h4><div class="sc"></div></div>'),sc=sh.querySelector('.sc');
  var y=view.scrollTop+70;
  sc.innerHTML=heads.map(function(e,i){var past=e.offsetTop<=y,next=heads[i+1];var here=past&&(!next||next.offsetTop>y);var lvl=e.classList.contains('h3x')?' l3':'';return '<button type="button" class="secrow'+(here?' here':'')+(past&&!here?' past':'')+lvl+'" data-i="'+i+'"><span class="sn">'+(i+1)+'</span><span class="st">'+esc(cut(plain(e.textContent),70))+'</span>'+(here?'<span class="sh2">buradasınız</span>':'')+'</button>'}).join('');
  function close(){dim.remove();sh.remove()}
  sc.addEventListener('click',function(e){var b=e.target.closest('[data-i]');if(!b)return;var el=heads[+b.getAttribute('data-i')];close();view.scrollTop=el.offsetTop-54});
  dim.addEventListener('click',close);app.appendChild(dim);app.appendChild(sh);
  var here=sc.querySelector('.here');if(here)here.scrollIntoView({block:'center'});
}

/* ----- Keşfet: an endless, varied mosaic of the whole site ----- */
var KX_CH=['Tümü','Azizler','Papalar','Katekizm','Sorular','Kiliseler','Dualar','Tartış','Meseller','Mucizeler'];var kxCh='Tümü',kxQ='';
function seeded(seed){var x=seed%2147483647;if(x<=0)x+=2147483646;return function(){x=x*16807%2147483647;return (x-1)/2147483646}}
function shuffle(a,r){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function kxPool(){
  var T={};function add(type,cat,o){o.type=type;o.cat=cat;(T[type]=T[type]||[]).push(o)}
  D.saints.forEach(function(s){add('saint','Azizler',{t:s.name,s:s.ep,a:s.art,tone:s.tone,go:'acc:'+s.id,q:plain(s.sum)})});
  POPE_LINE.forEach(function(id){var a=ACC[id];add('pope','Papalar',{t:a.name.replace('Papa ',''),s:(a.pope?a.pope.years:a.saint?a.saint.era:'')+' · '+a.ord+'. papa',a:a.art,go:'acc:'+id,q:cut(a.bio,140)})});
  D.popes.forEach(function(p){(p.docs||[]).forEach(function(d){add('doc','Papalar',{t:d[0],s:d[1]+' · '+p.name.replace('Papa ',''),q:d[2],go:'read:pope:'+p.id+'#docs'})})});
  Object.keys(CQ).forEach(function(n){var it=CQ[n];if(n%3===0||STORY_QS.indexOf(+n)>=0)add('cq','Katekizm',{t:plain(it[2]),s:'Soru '+n,go:'read:comp:'+CPART[n]+'#'+n})});
  D.comp.forEach(function(p,pi){p.items.forEach(function(it){if(it[0]==='c'&&plain(it[1]).length<240)add('quote','Katekizm',{t:plain(it[1]),go:'read:comp:'+pi})})});
  CHAPTERS.forEach(function(c){add('chap','Katekizm',{t:c.t.replace(/^[^:]+:\s*/,''),s:D.comp[c.pi].t,a:PART_ART[c.pi],go:'read:comp:'+c.pi+'#h'+c.ii})});
  [['cx:motu','Motu Proprio','Katekizm’in önsözü'],['cx:giris','Giriş','Kardinal Ratzinger'],['cx:ekler','Ekler','Dualar ve formüller'],['cx:emir','On Emir','Üç biçimde'],['cx:iman','İman Açıklamaları','İznik ve Havariler']].forEach(function(x){add('chap','Katekizm',{t:x[1],s:x[2],a:'book',go:'read:'+x[0]})});
  D.sss.forEach(function(c,ci){c.items.forEach(function(x,qi){add('faq','Sorular',{t:x.q,s:c.t,go:'chat:'+ci+'#'+qi})})});
  D.gun.faq.forEach(function(x){add('faq','Dualar',{t:x.q,s:'Günah Çıkarma',go:'read:gunah'})});
  D.churches.cities.forEach(function(c){c.ch.forEach(function(x){add('church','Kiliseler',{t:x.s,s:c.n+' · '+x.rite,go:'church:'+x.id})})});
  D.tes.sets.forEach(function(s){add('myst','Dualar',{t:s.t,s:s.dt,items:s.items,a:SET_ART[s.id][0],go:'rosary'})});
  D.mass.parts.forEach(function(p,i){add('num','Dualar',{n:p.n,t:p.t,s:'Kutsal Ayin',go:'read:mass#'+i})});
  D.cx.prayers.slice(0,10).forEach(function(p){add('prayer','Dualar',{t:p.t,x:p.x.split('\n').slice(0,3).join(' '),go:'read:cx:ekler'})});
  D.isl.tldr.forEach(function(x){add('debate','Tartış',{t:x.t,s:'İslam’a Cevap',go:'read:islam'})});
  D.ate.tldr.forEach(function(x){add('debate','Tartış',{t:x.t,s:'Ateizme Cevap',go:'read:ateizm'})});
  D.pages.neden.secs.forEach(function(x,i){add('debate','Tartış',{t:x[0],s:'Neden Katoliğiz?',go:'read:page:neden#'+i})});
  D.mes.forEach(function(m){add('story','Meseller',{t:m.n,s:m.ref,q:cut(m.b,120),a:'wheat',go:'post:p-mes-'+m.id})});
  D.mir.forEach(function(m){add('story','Mucizeler',{t:m.n,s:m.p,q:cut(m.b,120),a:'monstrance',go:'post:p-mir-'+m.id})});
  D.pages.topraklar.secs.forEach(function(x,i){add('place','Tartış',{t:x[0],s:'Topraklarımızda Hristiyanlık',go:'read:page:topraklar#'+i})});
  D.pages.tesbihtarihi.secs.forEach(function(x,i){add('place','Dualar',{t:x[0],s:'Tesbihin Tarihi',go:'read:page:tesbihtarihi#'+i})});
  add('stat','Katekizm',{n:'598',t:'soru ve cevap',s:'Katekizm',go:'read:comp:0'});
  add('stat','Kiliseler',{n:'55',t:'kilise, 13 şehir',s:'Kilise Bul',go:'acc:kilise'});
  add('stat','Azizler',{n:'366',t:'günün her biri için bir aziz',s:'Azizler',go:'acc:azizler'});
  add('stat','Papalar',{n:'267',t:'papa, Petrus’tan XIV. Leo’ya',s:'Papalar',go:'acc:papalar'});
  add('stat','Meseller',{n:'32',t:'mesel, İsa’nın anlattığı',s:'Meseller',go:'acc:meseller'});
  add('stat','Dualar',{n:'1571',t:'İnebahtı ve tesbih',s:'Tesbihin Tarihi',go:'acc:tesbihtarihi'});
  add('stat','Tartış',{n:'325',t:'İznik Konsili',s:'Topraklarımızda',go:'acc:topraklar'});
  return T;
}
var KX={pool:null,order:null,pos:0,round:0,blocks:0,color:[]};
var BIG_TYPES=['pope','quote','saint','stat','myst','story','doc'],SMALL_TYPES=['cq','faq','church','saint','debate','num','prayer','chap','place','pope','story','doc'];
var PAL=['c0','c1','c2','c3','c0','c4','c2','c5','c1','c3','c6','c2'];
function kxReset(){
  var T=kxPool(),r=seeded(Y*1000+doy+KX.round*7919),Q={};
  Object.keys(T).forEach(function(k){var arr=T[k].filter(function(x){return kxCh==='Tümü'||x.cat===kxCh});if(arr.length)Q[k]=shuffle(arr,r)});
  KX.pool=Q;KX.ptr={};KX.colorIdx=0;KX.recent=[];
}
function kxTake(sizeBig,lastTypes){
  var Q=KX.pool,types=Object.keys(Q);if(!types.length)return null;
  var pref=(sizeBig?BIG_TYPES:SMALL_TYPES).filter(function(t){return Q[t]&&lastTypes.indexOf(t)<0});
  if(!pref.length)pref=types.filter(function(t){return lastTypes.indexOf(t)<0});
  if(!pref.length)pref=types;
  pref.sort(function(a,b){return (KX.ptr[a]||0)/Q[a].length-(KX.ptr[b]||0)/Q[b].length});
  var t=pref[Math.floor(Math.random()*Math.min(3,pref.length))],i=(KX.ptr[t]||0);
  if(i>=Q[t].length){KX.round++;i=0;KX.pool[t]=shuffle(Q[t],seeded(KX.round*31+7))}
  KX.ptr[t]=i+1;return Q[t][i];
}
function kxColor(){var c;do{c=PAL[KX.colorIdx%PAL.length];KX.colorIdx++}while(KX.recent.indexOf(c)>=0&&KX.recent.length<PAL.length);KX.recent.push(c);if(KX.recent.length>2)KX.recent.shift();return c}
function kxTile(o,size){
  var cls='kx '+size+' '+kxColor()+' k-'+o.type,inner='';
  var t=esc(o.t),s=o.s?'<span class="ks">'+esc(o.s)+'</span>':'';
  switch(o.type){
    case 'pope':inner='<span class="kport">'+art(o.a)+'</span><span class="kb"><b class="kt">'+t+'</b>'+s+(size!=='s'&&o.q?'<span class="kq">'+esc(o.q)+'</span>':'')+'</span>';break;
    case 'saint':inner='<span class="kem">'+art(o.a)+'</span><span class="kb"><b class="kt">'+t+'</b>'+s+'</span>';break;
    case 'quote':inner='<span class="kmark">“</span><span class="kquote">'+t+'</span><span class="ks">Katekizm</span>';break;
    case 'stat':inner='<span class="knum">'+esc(o.n)+'</span><span class="kt">'+t+'</span>'+s;break;
    case 'num':inner='<span class="knum sm">'+esc(o.n)+'</span><b class="kt">'+t+'</b>'+s;break;
    case 'myst':inner='<span class="kem sm">'+art(o.a)+'</span><b class="kt">'+t+'</b>'+(size!=='s'?'<ol class="kl">'+o.items.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ol>':s);break;
    case 'cq':inner='<span class="ks top">'+esc(o.s)+'</span><b class="kt q">'+t+'</b>';break;
    case 'faq':inner='<span class="kbub">'+t+'</span><span class="ks">'+esc(o.s)+'</span>';break;
    case 'church':inner='<svg class="i kic" viewBox="0 0 24 24">'+ICONS.church+'</svg><b class="kt">'+t+'</b>'+s;break;
    case 'prayer':inner='<b class="kt">'+t+'</b><span class="kq it">'+esc(o.x)+'</span>';break;
    case 'doc':inner='<span class="ks top">'+esc(o.s)+'</span><b class="kt doc">'+t+'</b>'+(size!=='s'?'<span class="kq">'+esc(o.q)+'</span>':'');break;
    case 'story':inner=(size!=='s'?'<span class="kem sm">'+art(o.a)+'</span>':'')+'<b class="kt">'+t+'</b>'+s+(size!=='s'&&o.q?'<span class="kq">'+esc(o.q)+'</span>':'');break;
    default:inner='<b class="kt">'+t+'</b>'+s;
  }
  return '<button type="button" class="'+cls+'" data-go="'+esc(o.go)+'">'+inner+'</button>';
}
var KX_BLOCKS=['tl','w','tr','b','tl','s','tr','wb'];
function kxBlock(){
  var kind=KX_BLOCKS[KX.blocks%KX_BLOCKS.length];KX.blocks++;
  var last=[];function take(big){var o=kxTake(big,last);if(o){last.push(o.type);if(last.length>3)last.shift()}return o}
  function T(o,sz,area){return o?'<div style="grid-area:'+area+'">'+kxTile(o,sz)+'</div>':''}
  var out='';
  if(kind==='tl')out=T(take(1),'t','1/1/3/2')+T(take(0),'s','1/2/2/3')+T(take(0),'s','1/3/2/4')+T(take(0),'s','2/2/3/3')+T(take(0),'s','2/3/3/4');
  else if(kind==='tr')out=T(take(0),'s','1/1/2/2')+T(take(0),'s','1/2/2/3')+T(take(0),'s','2/1/3/2')+T(take(0),'s','2/2/3/3')+T(take(1),'t','1/3/3/4');
  else if(kind==='w')out=T(take(1),'w','1/1/2/3')+T(take(0),'s','1/3/2/4')+T(take(0),'s','2/1/3/2')+T(take(0),'s','2/2/3/3')+T(take(0),'s','2/3/3/4');
  else if(kind==='wb')out=T(take(0),'s','1/1/2/2')+T(take(1),'w','1/2/2/4')+T(take(0),'s','2/1/3/2')+T(take(0),'s','2/2/3/3')+T(take(0),'s','2/3/3/4');
  else if(kind==='b')out=T(take(1),'b','1/1/3/3')+T(take(0),'s','1/3/2/4')+T(take(0),'s','2/3/3/4');
  else out=T(take(0),'s','1/1/2/2')+T(take(0),'s','1/2/2/3')+T(take(0),'s','1/3/2/4')+T(take(0),'s','2/1/3/2')+T(take(0),'s','2/2/3/3')+T(take(0),'s','2/3/3/4');
  return '<div class="kblk">'+out+'</div>';
}
var kxObs=null;
function vExplore(){
  view.innerHTML='<div class="hd" style="padding-bottom:0"><label class="search" style="flex:1;margin:0" for="q">'+ic('search')+'<input id="q" type="search" placeholder="Ara: aziz, papa, soru, kilise…" autocomplete="off" value="'+esc(kxQ)+'"></label></div><div class="chips" style="padding-top:8px">'+KX_CH.map(function(c){return '<button type="button" data-ch="'+c+'" class="'+(c===kxCh?'on':'')+'">'+c+'</button>'}).join('')+'</div><div id="exr"></div><div id="kxw" class="kxw"></div><div id="kxs" class="kxs">Yükleniyor…</div>';
  var q=view.querySelector('#q');q.addEventListener('input',function(){kxQ=q.value;expQ=q.value;var on=!!kxQ.trim();view.querySelector('#kxw').hidden=on;view.querySelector('#kxs').hidden=on;if(on)drawExplore();else view.querySelector('#exr').innerHTML=''});
  view.querySelectorAll('[data-ch]').forEach(function(b){b.addEventListener('click',function(){kxCh=b.getAttribute('data-ch');view.querySelectorAll('[data-ch]').forEach(function(x){x.classList.toggle('on',x===b)});kxStart()})});
  kxStart();
  if(kxQ.trim()){expQ=kxQ;view.querySelector('#kxw').hidden=true;view.querySelector('#kxs').hidden=true;drawExplore()}
}
function kxStart(){
  KX.blocks=0;KX.round=0;kxReset();var w=view.querySelector('#kxw');w.innerHTML='';kxMore(6);
  if(kxObs)kxObs.disconnect();
  kxObs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)kxMore(4)})},{root:view,rootMargin:'600px'});
  kxObs.observe(view.querySelector('#kxs'));
}
function kxMore(n){var w=view.querySelector('#kxw');if(!w)return;var html='';for(var i=0;i<n;i++)html+=kxBlock();w.insertAdjacentHTML('beforeend',html)}
view.addEventListener('click',function(e){var b=e.target.closest('[data-go^="chat:"]');if(!b)return;e.stopPropagation();go('chat',b.getAttribute('data-go').slice(5))},true);

/* ----- the profile's ☰: settings and activity, like Instagram ----- */
function vMeMenuButton(){var b=view.querySelector('#tomenu');if(b){var nb=b.cloneNode(true);b.parentNode.replaceChild(nb,b);nb.addEventListener('click',function(){go('settings')})}}
function rowHTML(icn,label,value,attr){if(attr&&attr.indexOf('data-ext=')===0){var u=attr.match(/"([^"]+)"/)[1];return '<a class="srow" href="'+SITE+u+'" target="_blank" rel="noopener">'+ic(icn)+'<span class="sl1">'+esc(label)+'</span>'+ic('ext','chv')+'</a>'}return '<button type="button" class="srow" '+(attr||'')+'>'+ic(icn)+'<span class="sl1">'+esc(label)+'</span>'+(value!=null?'<span class="sv1">'+esc(value)+'</span>':'')+ic('chevr','chv')+'</button>'}
function vSettings(){
  var nSaved=Object.keys(saved).length,nRead=Object.keys(progress).length,themeName={light:'Açık',dark:'Koyu',system:'Otomatik'}[PREFS.theme];
  var G=[
   ['Sizin için',[['bookmark','Kaydedilenler',nSaved,'data-coll="all"'],['users','Takip ettikleriniz',follows.length,'data-list="follows"'],['clock','Okuma geçmişi',nRead,'data-go="read-history"'],['heart','Bildirimler',null,'data-go="notif"'],['send','Mesajlar',totalUnread()?totalUnread()+' okunmamış':'Tümü okundu','data-go="inbox"']]],
   ['Görünüm',[['moon','Tema',themeName,'data-open="look"'],['globe','Dil','Türkçe','data-open="look"'],['type','Yazı boyutu',['Küçük','Normal','Büyük','Çok büyük'][PREFS.size],'data-open="look"'],['access','Erişilebilirlik',(PREFS.contrast||PREFS.font||PREFS.motion)?'Açık':'Kapalı','data-open="look"']]],
   ['Katolik Dünyası',[['info','Hakkında',null,'data-ext="hakkinda.html"'],['book','Kaynaklar ve telif',null,'data-ext="kaynaklar-ve-telif.html"'],['lock','Gizlilik politikası',null,'data-ext="gizlilik.html"'],['access','Erişilebilirlik beyanı',null,'data-ext="erisilebilirlik.html"'],['mail','İletişim',null,'data-go="contact"']]],
   ['Verileriniz',[['trash','Kaydedilenleri temizle',null,'data-wipe="saved"'],['trash','Okuma geçmişini sil',null,'data-wipe="progress"'],['trash','Sohbetleri okunmamış yap',null,'data-wipe="dmread"']]]
  ];
  view.innerHTML=header('Ayarlar ve etkinlik')+'<label class="search" for="sq">'+ic('search')+'<input id="sq" type="search" placeholder="Ara" autocomplete="off"></label><div id="sgr">'
   +G.map(function(g){return '<div class="sgrp"><h3>'+g[0]+'</h3>'+g[1].map(function(r){return rowHTML(r[0],r[1],r[2],r[3])}).join('')+'</div>'}).join('')+'</div>'
   +'<p class="note" style="text-align:center;margin-top:18px">Bu cihazda saklanır: kaydettikleriniz, takipleriniz, kaldığınız yerler ve ayarlarınız. Hesap gerekmez, hiçbir şey sunucuya gönderilmez.</p><p class="note" style="text-align:center">katolikdunyasi.com</p>';
  var sg=view.querySelector('#sgr');
  view.querySelector('#sq').addEventListener('input',function(e){var q=norm(e.target.value);sg.querySelectorAll('.srow').forEach(function(r){r.hidden=q&&norm(r.textContent).indexOf(q)<0});sg.querySelectorAll('.sgrp').forEach(function(g){g.hidden=!g.querySelector('.srow:not([hidden])')})});
  sg.addEventListener('click',function(e){var b=e.target.closest('.srow');if(!b)return;
    if(b.hasAttribute('data-open'))return openSettings();
    if(b.hasAttribute('data-ext'))return window.open?window.open(SITE+b.getAttribute('data-ext'),'_blank','noopener'):null;
    if(b.getAttribute('data-go')==='read-history')return go('history');
    if(b.getAttribute('data-go')==='contact')return go('contact');
    if(b.hasAttribute('data-wipe')){var k=b.getAttribute('data-wipe');if(b.classList.contains('confirm')){if(k==='saved')saved={};if(k==='progress')progress={};if(k==='dmread')dmRead={};sset(k,{});toast('Temizlendi',true);vSettings();return}
      b.classList.add('confirm');b.querySelector('.sl1').textContent='Emin misiniz? Onaylamak için yeniden dokunun';setTimeout(function(){if(b.isConnected){b.classList.remove('confirm');vSettings()}},3500);return}
  },true);
}
function vHistory(){
  var ks=Object.keys(progress).sort(function(a,b){return progress[b]-progress[a]});
  view.innerHTML=header('Okuma geçmişi')+(ks.length?ks.map(function(k){var r=readerMeta(k);if(!r)return'';return '<div class="nt">'+av(r.art,r.tone,44)+'<p><b>'+esc(r.title)+'</b><span class="bar2"><i style="width:'+Math.round(progress[k]*100)+'%"></i></span></p><button type="button" class="bt g" data-read="'+k+'">'+(progress[k]>=0.97?'Yeniden':'Devam')+'</button></div>'}).join(''):'<div class="empty">Henüz bir yazı okumadınız.</div>');
}

setTab('home');
})();
