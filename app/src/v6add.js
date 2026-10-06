/* ================= version 6: fixes and engagement ================= */
function cleanA(s){return String(s||'').replace(/\*+(?=[\s<.,;)]|$)/g,'')}
function storyDur(s){var n=((s.title||'')+' '+(s.text||'')+' '+(s.q||'')).length;return Math.max(5000,Math.min(15000,2400+n*45))}
function fitStory(body){var p=body.querySelector('.psp'),t=body.querySelector('.pst'),fs=p?parseFloat(getComputedStyle(p).fontSize):0,n=0;
  while(body.scrollHeight>body.clientHeight+2&&n++<12){if(p&&fs>14){fs-=1;p.style.fontSize=fs+'px'}if(t){var ts=parseFloat(getComputedStyle(t).fontSize);if(ts>28)t.style.fontSize=(ts-3)+'px'}if(!p&&!t)break}}

/* ----- navigation: each tab keeps its own place, going back restores the scroll,
   the phone's back gesture and the browser's back button work, and a refresh reopens the same screen ----- */
var TABSTATE={},HIST=true,ignorePops=0,afterPop=null;;var INIT_HASH=location.hash;
try{history.replaceState({kd:0},'',location.href.split('#')[0])}catch(e){HIST=false}
function hashOf(e){return '#'+tab+(e&&e.name!==tab?'/'+e.name+(e.arg!=null?'='+encodeURIComponent(e.arg):''):'')}
function histPush(){if(!HIST)return;try{history.pushState({kd:stack.length-1},'',hashOf(stack[stack.length-1]))}catch(e){HIST=false}}
function histSync(){if(!HIST)return;try{history.replaceState({kd:stack.length-1},'',hashOf(stack[stack.length-1]))}catch(e){}}
function histReset(){
  if(!HIST)return;var kd=(history.state&&history.state.kd)||0,n=stack.length-1;
  function rebuild(){try{history.replaceState({kd:0},'',hashOf(stack[0]));for(var i=1;i<=n;i++)history.pushState({kd:i},'',hashOf(stack[i]))}catch(e){}}
  if(ignorePops){afterPop=rebuild;return}
  if(kd>0){ignorePops++;afterPop=rebuild;history.go(-kd)}else rebuild();
}
window.addEventListener('popstate',function(){
  if(ignorePops){ignorePops--;var f=afterPop;afterPop=null;if(f)f();return}
  closeOverlays();
  if(stack.length>1)backInternal();
});
function closeOverlays(){document.querySelectorAll('.ov,.sheet,.dim,.glass').forEach(function(e){e.remove()});stopSpeech()}
function restoreScroll(y){requestAnimationFrame(function(){var n=0;while(y>view.scrollHeight-view.clientHeight&&n++<40&&view.querySelector('#xs')&&XF.pos<XF.items.length)xMore(10);view.scrollTop=y})}
function go(name,arg){var top=stack[stack.length-1];if(top)top.scroll=view.scrollTop;stack.push({name:name,arg:arg,scroll:0});render(name,arg);view.scrollTop=0;histPush()}
function backInternal(){if(stack.length<2)return;stack.pop();var top=stack[stack.length-1];render(top.name,top.arg);restoreScroll(top.scroll||0)}
function back(){if(stack.length<2)return;if(HIST&&history.state&&history.state.kd>0){history.back();return}backInternal()}
function setTab(t,arg){
  if(stack.length){stack[stack.length-1].scroll=view.scrollTop;TABSTATE[tab]=stack}
  if(t===tab&&stack.length&&arg==null){ // tapping the open tab: back to its first screen, at the top
    stack=[stack[0]];render(stack[0].name,stack[0].arg);view.scrollTop=0;drawTabs();histReset();return}
  tab=t;
  if(TABSTATE[t]&&arg==null){stack=TABSTATE[t];var top=stack[stack.length-1];render(top.name,top.arg);restoreScroll(top.scroll||0)}
  else{stack=[{name:t,arg:arg,scroll:0}];render(t,arg);view.scrollTop=0}
  drawTabs();histReset();
}
// a refresh reopens the screen in the address (#tab/view=arg)
setTimeout(function(){var m=INIT_HASH.match(/^#([a-z]+)(?:\/([a-z]+)(?:=(.*))?)?$/);if(!m)return;var T=['home','explore','katekizm','kilisetab','me'];if(T.indexOf(m[1])<0)return;
  try{setTab(m[1]);if(m[2])go(m[2],m[3]!=null?decodeURIComponent(m[3]):undefined)}catch(e){setTab('home')}},0);

/* ----- sheets: Escape closes them, focus moves in and comes back ----- */
var lastFocus=null;
new MutationObserver(function(ms){ms.forEach(function(m){
  m.addedNodes.forEach(function(n){if(n.nodeType!==1||!/\b(sheet|glass|ov)\b/.test(n.className))return;lastFocus=document.activeElement;n.setAttribute('aria-modal','true');if(!n.hasAttribute('tabindex'))n.setAttribute('tabindex','-1');setTimeout(function(){if(!n.isConnected)return;var f=n.querySelector('button:not([disabled]),[href],select');(f||n).focus({preventScroll:true})},40)});
  m.removedNodes.forEach(function(n){if(n.nodeType!==1||!/\b(sheet|glass|ov)\b/.test(n.className))return;if(lastFocus&&lastFocus.isConnected&&!app.querySelector('.sheet,.glass,.ov'))try{lastFocus.focus({preventScroll:true})}catch(e){}});
})}).observe(app,{childList:true});
document.addEventListener('keydown',function(e){
  if(e.key!=='Escape')return;
  if(app.querySelector('.sheet')){var d=[].slice.call(app.querySelectorAll('.dim')).pop();if(d)d.click();else app.querySelector('.sheet').remove();return}
  var g=app.querySelector('.glass .glass-bg');if(g){g.click();return}
  var r=app.querySelector('.ov.ros .x');if(r)r.click();
});

/* ----- the logo menu: the same rows as the menu page ----- */
function segHTML(attr,opts,cur,label){return '<div class="seg" role="group" aria-label="'+label+'">'+opts.map(function(o){return '<button type="button" '+attr+'="'+o[0]+'" class="'+(String(cur)===String(o[0])?'on':'')+'" aria-pressed="'+(String(cur)===String(o[0]))+'">'+o[1]+'</button>'}).join('')+'</div>'}
function lookRows(){
  ICONS.contrast='<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>';ICONS.motion='<path d="M4 12h3l2-5 4 10 2-5h5"/>';
  function crow(icn,label,ctl,extra){return '<div class="srow sctl"'+(extra||'')+'>'+ic(icn)+'<span class="sl1">'+label+'</span>'+ctl+'</div>'}
  return crow(PREFS.theme==='dark'?'moon':'sun','Tema',segHTML('data-th',[['light','Açık'],['dark','Koyu'],['system','Sistem']],PREFS.theme,'Tema'),' data-rt')
   +crow('globe','Dil',segHTML('data-lang',[['tr','Türkçe'],['en','English']],LANG_NOTE?'en':'tr','Dil'))
   +'<p class="lnote" data-ln'+(LANG_NOTE?'':' hidden')+'>Uygulamanın İngilizce sürümü hazırlanıyor. Sitenin İngilizcesi şimdiden <a href="'+SITE+'en/" target="_blank" rel="noopener">katolikdunyasi.com/en</a> adresinde.</p>'
   +crow('type','Yazı boyutu',segHTML('data-sz',[[0,'A−'],[1,'A'],[2,'A+'],[3,'A++']],PREFS.size,'Yazı boyutu'))
   +[['contrast','contrast','Yüksek karşıtlık'],['font','book','Okunaklı yazı tipi'],['motion','motion','Animasyonları azalt']].map(function(o){return '<label class="srow sctl">'+ic(o[1])+'<span class="sl1">'+o[2]+'</span><input type="checkbox" class="sw" data-pref="'+o[0]+'"'+(PREFS[o[0]]?' checked':'')+'></label>'}).join('');
}
function wireLook(root){
  function segs(attr,fn){root.querySelectorAll('['+attr+']').forEach(function(b){b.addEventListener('click',function(){fn(b.getAttribute(attr));root.querySelectorAll('['+attr+']').forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)})})})}
  segs('data-th',function(v){PREFS.theme=v;applyPrefs();var i=root.querySelector('[data-rt] .i');if(i)i.outerHTML=ic(v==='dark'?'moon':'sun')});
  segs('data-sz',function(v){PREFS.size=+v;applyPrefs()});
  segs('data-lang',function(v){LANG_NOTE=v==='en';root.querySelectorAll('[data-ln]').forEach(function(n){n.hidden=!LANG_NOTE})});
  root.querySelectorAll('[data-pref]').forEach(function(c){c.addEventListener('change',function(){PREFS[c.getAttribute('data-pref')]=c.checked;applyPrefs()})});
}
function openSettings(){
  var el=h('<div class="glass" role="dialog" aria-label="Görünüm"><div class="glass-bg"></div><div class="gsheet gsheet6"><div class="sgrp"><h3>Görünüm</h3>'+lookRows()+'</div><button type="button" class="srow" data-all>'+ic('menu')+'<span class="sl1">Tüm ayarlar ve etkinlik</span>'+ic('chevr','chv')+'</button></div></div>');
  app.appendChild(el);requestAnimationFrame(function(){el.classList.add('in')});wireLook(el);
  function close(){el.classList.remove('in');setTimeout(function(){el.remove()},200)}
  el.querySelector('.glass-bg').addEventListener('click',close);
  el.querySelector('[data-all]').addEventListener('click',function(){close();go('settings')});
}

/* ----- the profile menu stays inside the app ----- */
function vMe(){
  vMeBase();
  var a=view.querySelector('.btns a.btn-like');if(a)a.replaceWith(h('<button type="button" data-go2="contact">İletişim</button>'));
  var MAP={'kutsal-kitap.html':['data-go2','doc:kutsalkitap'],'ekler.html':['data-go','read:cx:ekler'],'iletisim.html':['data-go2','contact'],'erisilebilirlik.html':['data-go2','doc:erisilebilirlik'],'gizlilik.html':['data-go2','doc:gizlilik']};
  view.querySelectorAll('a.mi').forEach(function(x){var k=Object.keys(MAP).filter(function(k){return x.getAttribute('href').indexOf(k)>=0})[0];if(!k)return;var ex=x.querySelector('.ext');if(ex)ex.remove();var b=h('<button type="button" class="mi"></button>');b.setAttribute(MAP[k][0],MAP[k][1]);b.innerHTML=x.innerHTML;x.replaceWith(b)});
}
DOCS.kutsalkitap=function(){return {t:'Kutsal Kitap',lead:D.docs.kkSub,body:mdDoc(D.docs.kutsalkitap)}};

/* ----- Kilise Bul: churches coloured by rite, so the grid is easy to scan ----- */
var RITE_TONE={'Latin Katolik':'gold','Ermeni Katolik':'red','Süryani Katolik':'green','Keldani Katolik':'indigo'};
function accPosts(id){
  if(id!=='kilise')return accPostsBase(id);
  var g=[];D.churches.cities.forEach(function(c){c.ch.forEach(function(x){g.push({t:x.s||x.n,sm:c.n+' · '+x.rite.replace(' Katolik',''),go:'church:'+x.id,tone:RITE_TONE[x.rite]||'orange'})})});
  return {hl:D.churches.cities.map(function(c){return c.n}),grid:g};
}

/* ----- notifications: today, feasts ahead, history, followed accounts ----- */
var REMIND=sget('remind',{});
function dayKey(d){return (d.getMonth()+1)+'-'+d.getDate()}
function upcomingFeasts(n){var out=[];for(var i=1;i<=15&&out.length<n;i++){var d=addD(now,i),r=D.days[dayKey(d)];if(!r||!r[1])continue;var rank=r[1].rank||'';if(/Bayram/.test(rank)||(rank==='Anma Günü'&&/Meryem|Havari|Aziz Yusuf/.test(r[0].n)))out.push({d:d,k:dayKey(d),n:r[0].n,rank:rank,days:i})}return out}
var HISTORY={
 '1-5':[['1964','VI. Paulus ile Ekümenik Patrik Athenagoras Kudüs’te buluştu; yüzyıllar sonra ilk kez bir papa ile Konstantinopolis patriği yüz yüze görüştü.','acc:papa-paulus-6']],
 '2-5':[['2006','Rahip Andrea Santoro, Trabzon’daki Santa Maria Kilisesi’nde dua ederken öldürüldü.','church:santa-maria-trabzon']],
 '2-11':[['1858','Lourdes’ta Bernadette Soubirous’a ilk görünme.','post:p-mir-lourdes'],['2013','XVI. Benedictus görevinden ayrılacağını açıkladı.','acc:papa-benedictus-16']],
 '3-13':[['2013','Franciscus papa seçildi; Amerika kıtasından ilk papa.','acc:papa-franciscus']],
 '4-2':[['2005','II. Ioannes Paulus hayata gözlerini yumdu.','acc:aziz-ii-yuhanna-pavlus']],
 '4-19':[['2005','XVI. Benedictus papa seçildi.','acc:papa-benedictus-16']],
 '4-27':[['2014','XXIII. Ioannes ile II. Ioannes Paulus aynı gün aziz ilan edildi.','acc:papa-ioannes-23']],
 '5-8':[['2025','XIV. Leo papa seçildi; Amerika Birleşik Devletleri’nden ilk papa.','acc:papa-leo-14']],
 '5-13':[['1917','Fatima’da üç çocuğa ilk görünme.','post:p-mir-fatima'],['1981','II. Ioannes Paulus Aziz Petrus Meydanı’nda vuruldu; hayatını Fatima Meryem Ana’sına borçlu olduğunu söyledi.','acc:aziz-ii-yuhanna-pavlus']],
 '5-15':[['1891','XIII. Leo, işçilerin haklarını savunan Rerum Novarum genelgesini yayımladı.','acc:papa-leo-13']],
 '5-20':[['325','İznik’te ilk ekümenik konsil toplandı.','read:page:topraklar']],
 '5-29':[['1453','Osmanlı ordusu Konstantinopolis’i aldı; Bizans İmparatorluğu sona erdi.','acc:papa-nicolaus-5']],
 '6-3':[['2010','Anadolu Apostolik Vikeri Piskopos Luigi Padovese İskenderun’da öldürüldü.','church:iskenderun-mujde']],
 '6-22':[['431','Efes Konsili toplandı; Meryem’e “Tanrı Anası” denmesinin doğru olduğu ilan edildi.','read:page:topraklar']],
 '7-16':[['1054','Kardinal Humbert aforoz belgesini Ayasofya’nın sunağına bıraktı.','acc:papa-leo-9']],
 '7-18':[['1870','I. Vatikan Konsili papalık yanılmazlığını tanımladı.','acc:papa-pius-9']],
 '7-25':[['1967','VI. Paulus İstanbul’u, Efes’i ve İzmir’i ziyaret etti.','acc:papa-paulus-6']],
 '9-4':[['2016','Kalkütalı Rahibe Teresa aziz ilan edildi.','acc:kalkutali-aziz-teresa']],
 '9-12':[['1683','Viyana kuşatması kalktı.','acc:papa-innocentius-11']],
 '9-24':[['787','İznik’te VII. Ekümenik Konsil toplandı; ikonalara saygı yeniden tesis edildi.','acc:papa-hadrianus-1']],
 '10-7':[['1571','İnebahtı Deniz Savaşı; Papa V. Pius bu günü Tesbih Meryemi bayramı olarak koydu.','acc:papa-pius-5']],
 '10-8':[['451','Kadıköy’de (Kalkedon) IV. Ekümenik Konsil toplandı.','read:page:topraklar']],
 '10-11':[['1962','XXIII. Ioannes II. Vatikan Konsili’ni açtı.','acc:papa-ioannes-23']],
 '10-13':[['1917','Fatima’da on binlerce kişinin tanık olduğu “güneş mucizesi”.','post:p-mir-fatima']],
 '10-16':[['1978','II. Ioannes Paulus papa seçildi.','acc:aziz-ii-yuhanna-pavlus']],
 '10-28':[['1958','XXIII. Ioannes papa seçildi.','acc:papa-ioannes-23']],
 '10-31':[['1517','Luther 95 tezini yayımladı; Reform başladı.','acc:papa-leo-10']],
 '11-1':[['1950','XII. Pius, Meryem’in göğe alınışını iman gerçeği olarak ilan etti.','acc:papa-pius-12']],
 '11-27':[['2025','XIV. Leo, İznik Konsili’nin 1700. yılı için Türkiye’ye geldi.','acc:papa-leo-14']],
 '11-28':[['1979','II. Ioannes Paulus’un Türkiye ziyareti başladı.','acc:aziz-ii-yuhanna-pavlus'],['2006','XVI. Benedictus’un Türkiye ziyareti başladı.','acc:papa-benedictus-16']],
 '11-30':[['2014','Franciscus, Fener Rum Patrikhanesi’nde Aziz Andreas bayramına katıldı.','acc:papa-franciscus']],
 '12-7':[['1965','VI. Paulus ve Patrik Athenagoras 1054 aforozlarını karşılıklı olarak kaldırdı.','acc:papa-paulus-6']],
 '12-8':[['1854','IX. Pius, Meryem’in Lekesiz Gebeliği’ni iman gerçeği olarak ilan etti.','acc:papa-pius-9'],['1965','II. Vatikan Konsili kapandı.','acc:papa-paulus-6']],
 '12-12':[['1531','Guadalupe’de Juan Diego’nun tilmasında Meryem’in sureti belirdi.','post:p-mir-guadalupe']],
 '12-13':[['1545','Trento Konsili açıldı.','acc:papa-paulus-3']],
 '12-25':[['800','III. Leo, Şarlman’ı Roma’da imparator olarak taçlandırdı.','acc:papa-leo-3']]
};
function historyToday(){var k=dayKey(now);if(HISTORY[k])return {today:true,d:now,items:HISTORY[k]};for(var i=1;i<=60;i++){var d=addD(now,i);if(HISTORY[dayKey(d)])return {today:false,d:d,items:HISTORY[dayKey(d)]}}return null}
function dateTR(d){return LANG==='en'?AYLAR[d.getMonth()]+' '+d.getDate():d.getDate()+' '+AYLAR[d.getMonth()]}
// the clock in the calendar line: 24-hour with seconds in Turkish, 12-hour with AM/PM in English
function clockStr(){var d=new Date();if(LANG==='en')return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',second:'2-digit',hour12:true});
  var p=function(n){return (n<10?'0':'')+n};return p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds())}
setInterval(function(){var e=document.querySelectorAll('.clk');for(var i=0;i<e.length;i++)e[i].textContent=clockStr()},1000);
function vNotif(){
  sset('notifseen',DAYK);
  var c=[header('Bildirimler'),'<div class="sec-t">Bugün</div>'];
  c.push('<div class="nt">'+av('cross','gold',44)+'<p><b>takvim</b> '+esc(LANG==='en'?GUN[WD]+', '+todayLabel:todayLabel+' '+GUN[WD])+' · <span class="clk" data-notr>'+clockStr()+'</span>. '+esc(SEASON.t)+'.</p></div>');
  if(REMIND[dayKey(now)])c.push('<div class="nt hl6">'+av('candle','gold',44)+'<p><b>hatırlatma</b> Bugün '+esc(REMIND[dayKey(now)])+'.</p></div>');
  c.push('<div class="nt">'+av(ACC.azizler.art,'red',44)+'<p><b>azizler</b> Bugün '+esc(todaySaint.n)+' anılıyor. <span class="t">1 sa</span></p><button type="button" class="bt" data-post="p-today">Oku</button></div>');
  c.push('<div class="nt">'+av(SET_ART[todaySet.id][0],SET_ART[todaySet.id][1],44)+'<p><b>tesbih.duasi</b> '+esc(GUN[WD])+': '+esc(todaySet.t)+' sizi bekliyor. <span class="t">2 sa</span></p><button type="button" class="bt" data-rosary>Başla</button></div>');
  c.push('<div class="nt">'+av('book','gold',44)+'<p><b>katekizm</b> Günün sorusu: '+esc(plain(cq0[2]))+' <span class="t">3 sa</span></p><button type="button" class="bt g" data-read="comp:'+CPART[cq0[1]]+'#'+cq0[1]+'">Oku</button></div>');
  var ht=historyToday();if(ht)ht.items.forEach(function(x){c.push('<div class="nt">'+av('scroll','indigo',44)+'<p><b>tarih</b> '+(ht.today?'Bugün':dateTR(ht.d))+', '+esc(x[0])+': '+esc(x[1])+'</p><button type="button" class="bt g" data-go="'+x[2]+'">Gör</button></div>')});
  var fe=upcomingFeasts(5);
  if(fe.length){c.push('<div class="sec-t">Yaklaşan bayramlar</div>');fe.forEach(function(f){var on=!!REMIND[f.k];c.push('<div class="nt"><span class="dpill"><b>'+f.d.getDate()+'</b><i>'+AYLAR[f.d.getMonth()].slice(0,3)+'</i></span><p><b>'+esc(f.n)+'</b> '+esc(f.rank)+' · '+(f.days===1?'yarın':f.days+' gün sonra')+'</p><button type="button" class="bt'+(on?' g':'')+'" data-remind="'+f.k+'" data-rn="'+esc(f.n)+'" aria-pressed="'+on+'">'+(on?'✓ Hatırlatılacak':'Hatırlat')+'</button></div>')})}
  var pr=Object.keys(progress).filter(function(k){return progress[k]>0.03&&progress[k]<0.97});
  c.push('<div class="sec-t">Okumaya devam</div>');
  if(pr.length)pr.forEach(function(k){var r=readerMeta(k);if(!r)return;c.push('<div class="nt">'+av(r.art,r.tone,44)+'<p><b>'+esc(r.handle)+'</b> Kaldığınız yer: '+esc(r.title)+'<span class="bar2"><i style="width:'+Math.round(progress[k]*100)+'%"></i></span></p><button type="button" class="bt g" data-read="'+k+'">Devam</button></div>')});
  else c.push('<p class="nempty">Bir yazıyı okumaya başladığınızda kaldığınız yer burada görünür.</p>');
  var fl=follows.filter(function(id){return ACC[id]});
  if(fl.length){c.push('<div class="sec-t">Takip ettikleriniz</div>');fl.slice(0,8).forEach(function(id,i){var a=ACC[id],p=postOf(id);
    if(a.church){var m=(a.church.mass||[])[0];c.push('<div class="nt">'+av(a.art,a.tone,44)+'<p><b>'+esc(a.handle)+'</b> '+(m?esc(m[0]+': '+m[1]):'Ayin saatleri ve ziyaret bilgileri')+'</p><button type="button" class="bt g" data-church="'+a.church.id+'">Gör</button></div>');return}
    c.push('<div class="nt">'+av(a.art,a.tone,44)+'<p><b>'+esc(a.handle)+'</b> '+(p?'paylaştı: '+esc(p.title||cut(p.cap,60)):esc(cut(a.bio,80)))+' <span class="t">'+(i+4)+' sa</span></p><button type="button" class="bt g" '+(p?'data-post="'+p.id+'"':'data-acc="'+id+'"')+'>Gör</button></div>')})}
  view.innerHTML=c.join('');
  view.querySelectorAll('[data-remind]').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();var k=b.getAttribute('data-remind');if(REMIND[k])delete REMIND[k];else REMIND[k]=b.getAttribute('data-rn');sset('remind',REMIND);var on=!!REMIND[k];b.classList.toggle('g',on);b.setAttribute('aria-pressed',on);b.textContent=on?'✓ Hatırlatılacak':'Hatırlat';toast(on?'O gün ana sayfada hatırlatacağız':'Hatırlatma kaldırıldı',on)})});
}

/* ----- home: reminder, "pick up where you left off", history card, pull to refresh, a proper end ----- */
var FEED0=FEED.slice(),feedSeed=0;
function lastRead(){var lr=sget('lastread',null);if(lr&&progress[lr.k]>0.03&&progress[lr.k]<0.97)return lr.k;var ks=Object.keys(progress).filter(function(k){return progress[k]>0.03&&progress[k]<0.97});return ks[ks.length-1]||null}
function resumeHTML(){
  var out='';
  var key='rosary.'+todaySet.id+'.'+M+'-'+Dd,ri=sget(key,0),RS=rosarySteps();
  if(ri>0&&ri<RS.length-1){var st=RS[ri],dec=st.dec!=null?st.dec+1:0;out+='<button type="button" class="resume" data-rosary><span class="rsi pa-'+(hasP(SET_PAINT[todaySet.id])||'58rosar')+'"></span><span class="rst"><small>Kaldığınız yerden</small><b>'+(dec?'Tesbihte '+dec+'. gizemdesiniz':'Tesbihe başladınız')+'</b><span class="bar2"><i style="width:'+Math.round(ri/RS.length*100)+'%"></i></span></span><em>Devam ›</em></button>'}
  var k=lastRead();if(k){var r=readerMeta(k);if(r){var pk=readerPaint(k.split('#')[0]);out+='<button type="button" class="resume" data-read="'+esc(k)+'"><span class="rsi'+(pk?' pa-'+pk:'')+'">'+(pk?'':av(r.art,r.tone,46))+'</span><span class="rst"><small>Okumaya devam · %'+Math.round(progress[k]*100)+'</small><b>'+esc(r.title)+'</b><span class="bar2"><i style="width:'+Math.round(progress[k]*100)+'%"></i></span></span><em>Devam ›</em></button>'}}
  return out?'<div class="resumes">'+out+'</div>':'';
}
function historyCardHTML(){var ht=historyToday();if(!ht)return '';var x=ht.items[0];return '<button type="button" class="hcard" data-go="'+x[2]+'"><small>'+(ht.today?'Tarihte bugün':'Yaklaşan · '+dateTR(ht.d))+'</small><b>'+esc(x[0])+'</b><span>'+esc(x[1])+'</span>'+(ht.items[1]?'<i>Ayrıca '+esc(ht.items[1][0])+': '+esc(cut(ht.items[1][1],70))+'</i>':'')+'</button>'}
function endHTML(){
  var pool=Object.keys(POSTS).filter(function(id){return FEED.indexOf(id)<0&&!hidden[id]&&paintFor(id)});
  var r=seeded(Y*1000+doy+feedSeed*97+3),pick3=shuffle(pool,r).slice(0,3);
  return '<div class="feedend"><b>Bugünlük bu kadar</b><span>Takvim yarın yenileniyor. Bu arada şunlara göz atın:</span><div class="fe3">'+pick3.map(function(id){var p=POSTS[id],k=paintFor(id);return '<button type="button" class="fe1 pa-'+k+'" data-post="'+id+'"><b>'+esc(p.title||ACC[p.acc].name)+'</b></button>'}).join('')+'</div><button type="button" class="ferf" data-refresh>'+ic('clock')+' Akışı yenile</button></div>';
}
function refreshFeed(){
  feedSeed++;var keep=FEED0.slice(0,3),pool=Object.keys(POSTS).filter(function(id){return keep.indexOf(id)<0&&!hidden[id]&&!/^p-(cq|myst|today)$/.test(id)});
  var r=seeded(Date.now()%2147483647);FEED=keep.concat(shuffle(pool,r).slice(0,14));
  vHome();view.scrollTop=0;toast('Akış yenilendi',true);
}
function vHome(){
  var un=totalUnread(),rem=REMIND[dayKey(now)];
  var html='<div class="hd hm"><span></span>'+LOGO+'<span class="r"><button type="button" class="badge" data-go="notif" aria-label="Bildirimler">'+ic('heart')+(sget('notifseen','')!==DAYK?'<i></i>':'')+'</button><button type="button" class="dmbtn" data-go="inbox" aria-label="Mesajlar'+(un?', '+un+' okunmamış sohbet':'')+'">'+ic('dm')+(un?'<span class="cnt3">'+un+'</span>':'')+'</button></span></div>';
  html+='<div class="ptr" id="ptr" aria-hidden="true"><span></span></div>';
  html+='<div class="stories">'+storyOrder().map(stoHTML).join('')+'</div>';
  if(rem&&sget('remindseen','')!==DAYK)html+='<div class="rembar">'+ic('candle')+'<span>Bugün <b>'+esc(rem)+'</b>. Hatırlatmanızı kurmuştunuz.</span><button type="button" data-remx aria-label="Kapat">'+ic('x')+'</button></div>';
  html+=resumeHTML();
  var posts=FEED.filter(function(id){return POSTS[id]&&!hidden[id]});
  posts.forEach(function(id,i){html+=postHTML(POSTS[id]);if(i===1)html+=historyCardHTML()});
  html+=endHTML();
  view.innerHTML=html;wireCarousels(view);
  view.querySelector('#logo').addEventListener('click',openSettings);
  var rx=view.querySelector('[data-remx]');if(rx)rx.addEventListener('click',function(){sset('remindseen',DAYK);rx.closest('.rembar').remove()});
  view.querySelector('[data-refresh]').addEventListener('click',refreshFeed);
}
// pull to refresh on the home feed
(function(){var y0=0,pull=0,on=false;
  view.addEventListener('touchstart',function(e){on=(stack.length===1&&stack[0].name==='home'&&view.scrollTop<=0&&e.touches.length===1&&!e.target.closest('.stories,.car'));y0=e.touches[0].clientY;pull=0},{passive:true});
  view.addEventListener('touchmove',function(e){if(!on)return;pull=Math.max(0,e.touches[0].clientY-y0);var p=view.querySelector('#ptr');if(p){p.style.height=Math.min(70,pull*.5)+'px';p.classList.toggle('ready',pull>120)}},{passive:true});
  view.addEventListener('touchend',function(){if(!on)return;on=false;var p=view.querySelector('#ptr');if(pull>120){if(p)p.classList.add('spin');setTimeout(refreshFeed,450)}else if(p)p.style.height='0'});
})();

/* ----- double tap to like ----- */
function likePost(id){liked[id]=true;sset('liked',liked);document.querySelectorAll('[data-like="'+id+'"]').forEach(function(b){b.classList.add('liked');b.setAttribute('aria-pressed','true')})}
function burst(w,x,y){var r=w.getBoundingClientRect(),b=h('<span class="burst">'+ic('heart')+'</span>');b.style.left=(x-r.left)+'px';b.style.top=(y-r.top)+'px';w.appendChild(b);setTimeout(function(){b.remove()},850)}
function wireCarousels(root){
  wireCarouselsBase(root);
  root.querySelectorAll('.car').forEach(function(c){if(!c.hasAttribute('tabindex')){c.setAttribute('tabindex','0');c.setAttribute('role','group');c.setAttribute('aria-label','Gönderi kareleri, sağa kaydırın')}});
  root.querySelectorAll('.wrapc').forEach(function(w){if(w._dt)return;w._dt=1;var last=0,lx=0,ly=0;
    w.addEventListener('pointerup',function(e){var t=Date.now(),post=w.closest('.post');if(!post)return;
      if(t-last<320&&Math.abs(e.clientX-lx)<30&&Math.abs(e.clientY-ly)<30){likePost(post.getAttribute('data-pid'));burst(w,e.clientX,e.clientY);last=0}else{last=t;lx=e.clientX;ly=e.clientY}});
  });
  fitSlides(root);
}
function fitSlides(root){root.querySelectorAll('.sl.pt.tx').forEach(function(sl){var c=sl.querySelector('.ptc'),p=sl.querySelector('.ptp'),t=sl.querySelector('.ptt2');if(!c||!p)return;var max=sl.clientHeight-64,fs=parseFloat(getComputedStyle(p).fontSize),n=0;
  while(c.offsetHeight>max&&fs>12.5&&n++<14){fs-=.75;p.style.fontSize=fs+'px';if(t)t.style.fontSize=Math.max(21,fs*1.55)+'px'}})}

/* ----- remember what was read last, for the "pick up where you left off" card ----- */
var vReader6=vReader;
vReader=function(key){vReader6(key);var k=key.split('#')[0];if(k.indexOf('doc:')!==0)sset('lastread',{k:k,t:Date.now()})};

/* ----- share a slide as an image card (painting and quote) ----- */
function wrapLines(ctx,text,maxW,maxLines){var words=String(text).split(/\s+/),lines=[],cur='';words.forEach(function(w){var t=cur?cur+' '+w:w;if(ctx.measureText(t).width>maxW&&cur){lines.push(cur);cur=w}else cur=t});if(cur)lines.push(cur);if(lines.length>maxLines){lines=lines.slice(0,maxLines);lines[maxLines-1]=lines[maxLines-1].replace(/\s*\S*$/,'')+'…'}return lines}
function shareCard(o,onDone){
  var s=o.slide||{},W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;var x=cv.getContext('2d');
  function draw(img){
    if(img){var sc=Math.max(W/img.width,H/img.height),iw=img.width*sc,ih=img.height*sc;x.drawImage(img,(W-iw)/2,(H-ih)/2,iw,ih);var g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(8,6,4,.35)');g.addColorStop(.4,'rgba(8,6,4,.2)');g.addColorStop(1,'rgba(8,6,4,.92)');x.fillStyle=g;x.fillRect(0,0,W,H);if(s.type!=='cover'&&(s.text||'').length>40){x.fillStyle='rgba(8,6,4,.45)';x.fillRect(0,0,W,H)}}
    else{var c=tone(s.tone||(o.acc&&o.acc.tone));var g2=x.createLinearGradient(0,0,W,H);g2.addColorStop(0,'#14203a');g2.addColorStop(1,'#2a3550');x.fillStyle=g2;x.fillRect(0,0,W,H)}
    var y=H-90,pad=84;x.textBaseline='alphabetic';
    // the brand at the top, the source at the bottom
    x.fillStyle='rgba(255,255,255,.85)';x.font='700 30px Inter, system-ui, sans-serif';x.fillText('katolikdunyasi.com',pad,96);
    var body=s.type==='cover'?(s.sub||''):(s.text||''),title=s.title||o.title||'';
    var lines=[];x.font='500 44px Inter, system-ui, sans-serif';if(body)lines=wrapLines(x,body,W-pad*2,s.type==='cover'?3:9);
    x.font='400 '+(title.length>30?92:118)+'px "KD Display", Impact, sans-serif';var tl=title?wrapLines(x,title.toLocaleUpperCase('tr'),W-pad*2,4):[];
    var th=title.length>30?92:118,blockH=(s.kick?60:0)+tl.length*th*.98+(lines.length?30+lines.length*60:0);y=Math.min(H-150-blockH,H-150-blockH);var cy=Math.max(170,H-130-blockH);
    if(s.kick){x.fillStyle='#f1d48f';x.font='700 30px Inter, system-ui, sans-serif';x.fillText(String(s.kick).toLocaleUpperCase('tr'),pad,cy+30);cy+=60}
    x.fillStyle='#fff';x.font='400 '+th+'px "KD Display", Impact, sans-serif';tl.forEach(function(l){cy+=th*.98;x.fillText(l,pad,cy)});
    if(lines.length){cy+=30;x.font='500 44px Inter, system-ui, sans-serif';x.fillStyle='rgba(255,255,255,.95)';lines.forEach(function(l){cy+=60;x.fillText(l,pad,cy)})}
    x.fillStyle='rgba(255,255,255,.7)';x.font='600 28px Inter, system-ui, sans-serif';x.fillText((o.acc?'@'+o.acc.handle+'  ·  ':'')+(o.paint?'Caravaggio, '+(PAINT_NAME[o.paint]||''):''),pad,H-70);
    cv.toBlob(function(blob){
      var file=null;try{file=new File([blob],'katolikdunyasi.png',{type:'image/png'})}catch(e){}
      if(file&&navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:title}).then(done,done);return}
      var url=URL.createObjectURL(blob);
      var dim=h('<div class="dim"></div>'),sh=h('<div class="sheet cardsh" role="dialog" aria-label="Görsel kart"><div class="gb"></div><h4>Görsel kart</h4><div class="sc"><img class="cardimg" alt="'+esc(title)+'" src="'+url+'"><p class="mute cardhint">Kaydetmek ya da paylaşmak için görsele basılı tutun.</p><div class="dbtns"><button type="button" data-cl>Bağlantıyı paylaş</button></div></div></div>');
      function close(){dim.remove();sh.remove();URL.revokeObjectURL(url);done()}
      sh.querySelector('[data-cl]').addEventListener('click',function(){close();share(o.url||'',title)});
      dim.addEventListener('click',close);app.appendChild(dim);app.appendChild(sh);
    },'image/png');
  }
  function done(){if(onDone)onDone()}
  var go2=function(){if(o.paint&&D.carav&&D.carav[o.paint]){var im=new Image();im.onload=function(){draw(im)};im.onerror=function(){draw(null)};im.src=D.carav[o.paint]}else draw(null)};
  if(document.fonts&&document.fonts.load)Promise.all([document.fonts.load('118px "KD Display"'),document.fonts.load('500 44px Inter')]).then(go2,go2);else go2();
}
