/* ================= version 8 ================= */
/* (as in v7: overrides are assignments, never declarations) */
ICONS.floppy='<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>';
ICONS.reset='<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>';
ICONS.rites='<path d="M7 3v8M4 6h6M17 3v8M14 6h6M7 13v8M4 16h6M17 13v8M14 16h6"/>';
ICONS.cal='<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>';
ICONS.loc='<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7.5"/>';
ICONS.idcard='<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.4"/><path d="M5.5 16.5c.8-1.6 2-2.4 3.5-2.4s2.7.8 3.5 2.4M14 10h4M14 13.5h4"/>';
ICONS.msg='<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>';
ICONS.checkall='<path d="M3 12.5l4 4L15 8.5M10 16.5l1 1 9-9.5"/>';

/* ----- a small question box over a softly blurred screen ----- */
function kModal(o){
  var m=h('<div class="kmod" role="alertdialog" aria-modal="true" aria-labelledby="kmt"><div class="kmbg"></div><div class="kmc">'+(o.i?'<span class="kmi">'+ic(o.i)+'</span>':'')+'<b id="kmt">'+esc(o.t)+'</b>'+(o.p?'<p>'+esc(o.p)+'</p>':'')+'<div class="kmb">'+o.b.map(function(x,i){return '<button type="button" data-i="'+i+'" class="'+(x.c||'')+'">'+esc(x.l)+'</button>'}).join('')+'</div></div></div>');
  function close(){m.classList.add('out');setTimeout(function(){m.remove()},150);document.removeEventListener('keydown',key)}
  function key(e){if(e.key==='Escape'){e.stopPropagation();close();if(o.cancel)o.cancel()}}
  m.querySelector('.kmbg').addEventListener('click',function(){close();if(o.cancel)o.cancel()});
  m.addEventListener('click',function(e){var b=e.target.closest('[data-i]');if(!b)return;close();var f=o.b[+b.getAttribute('data-i')].f;if(f)f()});
  document.addEventListener('keydown',key,true);app.appendChild(m);setTimeout(function(){var f=m.querySelector('.kmb button');if(f)f.focus()},30);
}

/* ----- Katekizm reading: "save and exit" instead of share; start over ----- */
function toKatRoot(){if(tab!=='katekizm')setTab('katekizm');setTab('katekizm')}
function currentQ(){var y=view.scrollTop+80,cur=null;view.querySelectorAll('.qa').forEach(function(q){if(q.offsetTop<=y)cur=q});return cur?+cur.id.slice(1):null}
function saveReading(k){
  var max=view.scrollHeight-view.clientHeight;progress[k]=max>0?Math.min(.99,view.scrollTop/max):0;sset('progress',progress);
  var n=currentQ();if(n){sset('qsave',{k:k,n:n,t:Date.now()});sset('qlast',n)}
}
function resetPart(pi){partQs(pi).forEach(function(n){delete QREAD[n]});sset('qread',QREAD);delete progress['comp:'+pi];sset('progress',progress);var s=sget('qsave',null);if(s&&CPART[s.n]===pi)sset('qsave',null)}
function resetAll(){QREAD={};sset('qread',{});sset('qsave',null);sset('qlast',0);Object.keys(progress).forEach(function(k){if(k.indexOf('comp:')===0||k.indexOf('cx:')===0)delete progress[k]});sset('progress',progress)}
var vReader8=vReader;
vReader=function(key){
  vReader8(key);
  var k=key.split('#')[0];if(k.indexOf('comp:')!==0&&k.indexOf('cx:')!==0)return;
  var sb=view.querySelector('.hd [data-share]');if(!sb)return;
  var r=sb.parentNode;sb.remove();
  if(k.indexOf('comp:')===0)r.insertAdjacentHTML('beforeend','<button type="button" class="kzrd" data-kreset aria-label="Bu kısımda baştan başla">'+ic('reset')+'</button>');
  r.insertAdjacentHTML('beforeend','<button type="button" data-ksave aria-label="Kaydet ve çık">'+ic('floppy')+'</button>');
  r.querySelector('[data-ksave]').addEventListener('click',function(){
    kModal({i:'floppy',t:'İlerlemenizi kaydedip çıkmak istiyor musunuz?',p:'Kaldığınız yer kaydedilir; Katekizm sayfasında “Devam” ile buraya dönersiniz.',b:[{l:'Evet',c:'pri',f:function(){saveReading(k);toKatRoot();toast('İlerlemeniz kaydedildi',true)}},{l:'Hayır'},{l:'Vazgeç',c:'ghost'}]});
  });
  var rb=r.querySelector('[data-kreset]');
  if(rb)rb.addEventListener('click',function(){var pi=+k.slice(5);
    kModal({i:'reset',t:'Bu kısımda baştan başlansın mı?',p:D.comp[pi].t+' kısmındaki “okundu” işaretleri ve kaldığınız yer silinir. Diğer kısımlar etkilenmez.',b:[{l:'Baştan başla',c:'warn',f:function(){resetPart(pi);view.querySelectorAll('.qa.qdone').forEach(function(q){q.classList.remove('qdone')});view.scrollTop=0;trackQuestions();toast('Bu kısım sıfırlandı')}},{l:'Vazgeç',c:'ghost'}]});
  });
};
view.addEventListener('click',function(e){var b=e.target.closest('[data-kzreset]');if(!b)return;e.stopPropagation();
  kModal({i:'reset',t:'Tüm ilerleme sıfırlansın mı?',p:'598 sorudaki “okundu” işaretleri ve kaldığınız yer silinir. Bu işlem geri alınamaz.',b:[{l:'Sıfırla',c:'warn',f:function(){resetAll();vKatekizm();toast('İlerleme sıfırlandı')}},{l:'Vazgeç',c:'ghost'}]})},true);

/* ----- Keşfet: popes from the newest; Tartış and Kiliseler get their own simple pages ----- */
var xPortraits8=xPortraits;
xPortraits=function(ids,kind){if(kind==='pope')ids=POPE_LINE.slice().reverse().slice(0,16);return xPortraits8(ids,kind)};
var RITES=[['Latin Katolik','Latin','sent-antuan','Roma’ya bağlı Latin ayini; Türkiye’deki kiliselerin çoğu.'],['Ermeni Katolik','Ermeni','surp-hovhan-vosgeperan','Ermeni ayini, Roma ile tam birlik içinde.'],['Süryani Katolik','Süryani','suryani-katolik-gumussuyu','Antakya geleneğinin Süryanice ayini.'],['Keldani Katolik','Keldani','mar-petyun-diyarbakir','Doğu Süryani geleneği, Mezopotamya’nın Kilisesi.']];
function riteChurches(r){var out=[];D.churches.cities.forEach(function(c){c.ch.forEach(function(x){if(x.rite===r)out.push({x:x,c:c})})});return out}
function openRite(r){RITE_OPEN=r;PTAB.kilise='t2';if(tab!=='kilisetab')setTab('kilisetab');setTab('kilisetab');var d=view.querySelector('.rite[data-rite="'+r+'"]');if(d)setTimeout(function(){view.scrollTo({top:d.offsetTop-60,behavior:PREFS.motion?'auto':'smooth'})},60)}
var drawX8=drawX;
drawX=function(){
  var box=view.querySelector('#xmain');if(!box)return;
  if(xCh==='Tartış'){if(xObs){xObs.disconnect();xObs=null}
    var T=[['islam','i-const',D.isl.title,D.isl.lead,'Jean Le Tavernier · Konstantinopolis Kuşatması (1453)'],['ateizm','i-paulath',D.ate.title,D.ate.lead,'Raffaello · Pavlus Atina’da Vaaz Ediyor']];
    box.innerHTML='<p class="xlead">İki tartışma, iki uzun yazı. Her biri bölümlere ayrılmış; istediğiniz yerden okuyabilirsiniz.</p>'+T.map(function(t){return '<button type="button" class="xdeb pa-'+(hasA(t[1])?t[1]:'34thomas')+'" data-go="read:'+t[0]+'"><span class="xdt"><small>Tartış</small><b>'+esc(t[2])+'</b><span>'+esc(cut(plain(t[3]),150))+'</span><em>Okumaya başla ›</em></span><i class="xcap">'+esc(t[4])+'</i></button>'}).join('');return}
  if(xCh==='Kiliseler'){if(xObs){xObs.disconnect();xObs=null}
    box.innerHTML='<button type="button" class="nearbtn" data-near>'+ic('loc')+'<span><b>Bana en yakın kiliseyi bul</b><small>Konumunuz yalnızca bu cihazda kullanılır</small></span></button><p class="xlead">Türkiye’deki Katolik kiliseler dört ayine ayrılır. Bir ayine dokunun, kiliseleri görün.</p><div class="xrites">'+RITES.map(function(r){var n=riteChurches(r[0]).length,src=chImg(r[2]);return '<button type="button" class="xrite" data-rite="'+r[0]+'" style="background-image:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.82)),url('+src+')"><b>'+r[1]+'</b><small>'+n+' kilise</small><span>'+esc(r[3])+'</span></button>'}).join('')+'</div>';return}
  drawX8();
};
view.addEventListener('click',function(e){var b=e.target.closest('.xrite[data-rite]');if(!b)return;e.stopPropagation();openRite(b.getAttribute('data-rite'))},true);

/* ----- profile tabs: the second and third tabs carry real content everywhere ----- */
var PTAB={},RITE_OPEN=null;
var FEAST={'meryem-ana':'1 Ocak','aziz-yusuf':'19 Mart','havari-petrus':'29 Haziran','havari-pavlus':'29 Haziran','vaftizci-yahya':'24 Haziran','havari-yuhanna':'27 Aralık','aziz-augustinus':'28 Ağustos','aziz-thomas-aquinas':'28 Ocak','assisili-aziz-francis':'4 Ekim','sienali-aziz-catharina':'29 Nisan','avilali-aziz-teresa':'15 Ekim','lisieuxlu-kucuk-teresa':'1 Ekim','aziz-ignatius-loyola':'31 Temmuz','aziz-benedictus':'11 Temmuz','aziz-patrick':'17 Mart','padovali-aziz-antonius':'13 Haziran','kalkutali-aziz-teresa':'5 Eylül','aziz-ii-yuhanna-pavlus':'22 Ekim','padre-pio':'23 Eylül','aziz-hieronymus':'30 Eylül'};
var MONTHS=AYLAR;
function massToday(m){
  var L=String(m[0]).toLocaleLowerCase('tr'),wd=now.getDay(),mon=now.getMonth()+1;
  if(/ayın|deprem|şu anda|^ayin|düzenli|katolik ayini|ayin saatleri/.test(L))return false;
  var winter=mon>=10||mon<=4;if(/kış/.test(L)&&!winter)return false;if(/yaz/.test(L)&&winter)return false;
  var MO=['ocak','şubat','mart','nisan','mayıs','haziran','temmuz','ağustos','eylül','ekim','kasım','aralık'],mr=L.match(/\((\S+)–(\S+?)\)/);
  if(mr){var a=MO.indexOf(mr[1]),b=MO.indexOf(mr[2]);if(a>=0&&b>=0){var mi=mon-1,in_=a<=b?(mi>=a&&mi<=b):(mi>=a||mi<=b);if(!in_)return false}}
  if(/her gün/.test(L))return true;
  if(/hafta içi/.test(L))return wd>=1&&wd<=5;
  var DN=['pazartesi','salı','çarşamba','perşembe','cuma','cumartesi','pazar'],td=(wd+6)%7;
  var words=L.replace(/\(.*?\)/g,'').replace(/^(kış|yaz):\s*/,'').split(/[^a-zçğıöşü–]+/).filter(Boolean),hit=false;
  words.forEach(function(w){if(w.indexOf('–')>0){var p=w.split('–'),a=DN.indexOf(p[0]),b=DN.indexOf(p[1]);if(a>=0&&b>=0&&td>=a&&td<=b)hit=true}else if(DN.indexOf(w)===td)hit=true});
  return hit;
}
function sectionsTOC(read){
  var k=String(read||'').split('#')[0],out=[];
  if(k.indexOf('saint:')===0){var s=D.saints.filter(function(x){return x.id===k.slice(6)})[0];if(s)sectionsOf(s.body,'').forEach(function(x,i){if(x.t)out.push([x.t,'read:'+k+'#'+i])})}
  else if(k.indexOf('pope:')===0){var a=ACC[k.slice(5)];if(a&&a.pope)a.pope.secs.forEach(function(x,i){out.push([x[0],'read:'+k+'#'+i])});if(a&&a.pope&&a.pope.docs.length)out.push(['Önemli belgeler','read:'+k+'#docs'])}
  else if(k.indexOf('page:')===0){var pg=D.pages[k.slice(5)];if(pg)pg.secs.forEach(function(x,i){out.push([x[0],'read:'+k+'#'+i])})}
  else if(k==='gunah'){D.gun.steps.forEach(function(x,i){out.push([(i+1)+'. '+x.t,'read:gunah#'+i])});out.push(['Sık sorulanlar','read:gunah']);out.push([D.gun.mart.t,'read:gunah'])}
  else if(k==='mass'){D.mass.parts.forEach(function(p,i){out.push([p.n+'. '+p.t,'read:mass#'+i])})}
  else if(k==='islam'||k==='ateizm'){var cs=k==='islam'?D.isl:D.ate,n=0;cs.parts.forEach(function(p){out.push([p.t,null]);p.secs.forEach(function(x){out.push([x.t,'read:'+k+'#'+(n++)])})})}
  return out;
}
function rowsHTML(rows,empty){return rows.length?'<div class="ptl">'+rows.map(function(r){return r[1]===null?'<h5>'+esc(r[0])+'</h5>':'<button type="button" class="ptr2" data-go="'+esc(r[1])+'"><span>'+esc(r[0])+'</span>'+(r[2]?'<small>'+esc(r[2])+'</small>':'')+ic('chevr')+'</button>'}).join('')+'</div>':'<p class="nempty">'+esc(empty||'Burada henüz bir şey yok.')+'</p>'}
function qaHTML(id){var p=postOf(id)||POSTS['p-'+id];if(!p)return '';var L=commentsFor(p);if(!L.length)return '';return '<div class="ptl">'+L.slice(0,12).map(function(x){return '<button type="button" class="ptr2 ptq" data-pqa="'+p.id+'">'+ic('comment')+'<span>'+esc(x.q)+'</span>'+ic('chevr')+'</button>'}).join('')+'</div>'}
function nearHTML(){return '<button type="button" class="nearbtn" data-near>'+ic('loc')+'<span><b>Bana en yakın kiliseyi bul</b><small>Konumunuz yalnızca bu cihazda kullanılır</small></span></button>'}
function profTabs(id){
  var a=ACC[id];if(!a)return null;
  if(id==='kilise')return {t2:['rites','Ayinler',function(){return '<div class="rites">'+RITES.map(function(r){var L=riteChurches(r[0]),cities={};L.forEach(function(o){(cities[o.c.n]=cities[o.c.n]||[]).push(o.x)});return '<details class="rite" data-rite="'+r[0]+'"'+(RITE_OPEN===r[0]?' open':'')+'><summary><span class="rimg" style="background-image:url('+chImg(r[2])+')"></span><span class="rtx"><b>'+r[1]+' Katolik</b><small>'+L.length+' kilise · '+Object.keys(cities).length+' şehir</small></span>'+ic('chevr')+'</summary><p class="rdesc">'+esc(r[3])+'</p>'+Object.keys(cities).map(function(cn){return '<h5>'+esc(cn)+'</h5>'+cities[cn].map(function(x){return '<button type="button" class="ptr2" data-church="'+x.id+'" aria-label="'+esc((x.s||x.n)+(x.dist?', '+x.dist:''))+'"><span>'+esc(x.s||x.n)+'</span><small>'+esc(x.dist||'')+'</small>'+ic('chevr')+'</button>'}).join('')}).join('')+'</details>'}).join('')+'</div>'}],
    t3:['clock','Bugün ayin',function(){var rows=[];D.churches.cities.forEach(function(c){var here=[];c.ch.forEach(function(x){var t=(x.mass||[]).filter(massToday).map(function(m){return String(m[1])}).join(' · ');if(t)here.push([x,t])});if(here.length){rows.push('<h5>'+esc(c.n)+'</h5>');here.forEach(function(o){rows.push('<button type="button" class="ptr2 pmass" data-church="'+o[0].id+'"><span>'+esc(o[0].s||o[0].n)+'<small>'+esc(o[1])+'</small></span>'+ic('chevr')+'</button>')})}});
      return '<div class="ptl"><p class="ptnote">Bugün, '+esc(todayLabel)+' '+GUN[WD]+'. Saatler değişebilir; gitmeden önce kiliseye danışın.</p>'+(rows.length?rows.join(''):'<p class="nempty">Bugün için kayıtlı bir ayin saati bulunamadı.</p>')+'</div>'}]};
  if(id==='papalar')return {t2:['list','Zaman çizelgesi',function(){var rows=[],cen=null;POPE_LINE.slice().reverse().forEach(function(pid){var p=ACC[pid],yrs=(p.pope&&p.pope.years)||({'264':'1978-2005'})[p.ord]||'',y=parseInt(String(yrs).match(/\d{2,4}/)||0,10),c=y?Math.floor((y-1)/100)+1:null;if(c&&c!==cen){cen=c;rows.push('<h5>'+c+'. yüzyıl</h5>')}rows.push('<button type="button" class="ptr2 ppope" data-acc="'+pid+'">'+av(p.art,p.tone,36)+'<span>'+esc(p.name)+'<small>'+p.ord+'. papa · '+esc(p.pope?p.pope.years:'')+'</small></span>'+ic('chevr')+'</button>')});return '<div class="ptl">'+rows.join('')+'</div>'}],
    t3:['book','Belgeler',function(){var rows=[];POPE_LINE.slice().reverse().forEach(function(pid){var p=ACC[pid];(p.pope&&p.pope.docs||[]).forEach(function(d){rows.push([d[0],'read:pope:'+pid+'#docs',d[1]+' · '+p.name])})});return rowsHTML(rows)}]};
  if(id==='azizler')return {t2:['cal',AYLAR[M-1]+' takvimi',function(){var rows=[],dim=new Date(Y,M,0).getDate();for(var d=1;d<=dim;d++){var r=D.days[M+'-'+d];if(!r||!r[0])continue;rows.push('<div class="pday'+(d===Dd?' today':'')+'"><b>'+d+'</b><span>'+esc(r[0].n)+(r[1]&&r[1].rank?'<small>'+esc(r[1].rank)+'</small>':'')+'</span>'+(d===Dd?'<button type="button" data-go="post:p-today">Bugün ›</button>':'')+'</div>')}return '<div class="ptl">'+rows.join('')+'</div>'}],
    t3:['book','Büyük azizler',function(){return rowsHTML(D.saints.map(function(s){return [s.name,'read:saint:'+s.id,s.ep]}))}]};
  if(a.saint){var s=a.saint;return {t2:['list','Hayatı',function(){return rowsHTML(sectionsTOC('saint:'+s.id),'Bu azizin hayatı tek bir bölümden oluşuyor.')}],
    t3:['idcard','Kimlik',function(){var f=FEAST[s.id]||feastOf(s.name);return '<div class="pid">'+av(a.art,a.tone,72)+'<dl><dt>Bayramı</dt><dd>'+esc(f||'Kayıtlı değil')+'</dd><dt>Dönem</dt><dd>'+esc(s.era||'')+'</dd><dt>Unvan</dt><dd>'+esc(s.ep||'')+'</dd>'+(s.emb?'<dt>Simgesi</dt><dd>'+esc(s.emb)+'</dd>':'')+'</dl><button type="button" class="pri" data-go="read:saint:'+s.id+'">Hayatını oku</button></div>'}]}}
  if(a.pope){var pp=a.pope,i=popeIdx(pp.id);return {t2:['list','Hayatı',function(){return rowsHTML(sectionsTOC('pope:'+id))}],
    t3:['book','Belgeler',function(){var rows=pp.docs.map(function(d){return [d[0],'read:pope:'+id+'#docs',d[1]]});var nav=(i>0?'<button type="button" class="ptr2" data-acc="'+POPE_LINE[i-1]+'"><span>Selefi: '+esc(ACC[POPE_LINE[i-1]].name)+'</span>'+ic('chevr')+'</button>':'')+(i<POPE_LINE.length-1?'<button type="button" class="ptr2" data-acc="'+POPE_LINE[i+1]+'"><span>Halefi: '+esc(ACC[POPE_LINE[i+1]].name)+'</span>'+ic('chevr')+'</button>':'');return rowsHTML(rows,'Bu papanın listede belgesi yok.')+'<div class="ptl">'+nav+'</div>'}]}}
  if(id==='meseller'||id==='mucizeler'){var L=id==='meseller'?D.mes:D.mir,pre=id==='meseller'?'p-mes-':'p-mir-',cats={};L.forEach(function(x){(cats[x.cat]=cats[x.cat]||[]).push(x)});
    return {t2:['list','Kategoriler',function(){var rows=[];Object.keys(cats).forEach(function(c){rows.push([c,null]);cats[c].forEach(function(x){if(POSTS[pre+x.id])rows.push([x.t||x.n||x.title||x.id,'post:'+pre+x.id])})});return rowsHTML(rows)}],t3:['comment','Sorular',function(){return qaHTML(id)||'<p class="nempty">Soru bulunamadı.</p>'}]}}
  var toc=sectionsTOC(a.read||'');
  var P=accPosts(id);
  return {t2:toc.length?['list','Bölümler',function(){return rowsHTML(toc)}]:['reels','Öne çıkanlar',function(){return P.hl.length?'<div class="ptl">'+P.hl.map(function(t,i){return '<button type="button" class="ptr2" data-hl="'+id+'" data-i="'+i+'"><span>'+esc(t||a.name)+'</span>'+ic('chevr')+'</button>'}).join('')+'</div>':'<p class="nempty">Öne çıkan bir hikâye yok.</p>'}],
    t3:['comment','Sorular',function(){return qaHTML(id)||'<p class="nempty">Bu sayfa hakkında soru bulunamadı.</p>'}]};
}
function wireProfileTabs(id){
  var T=profTabs(id),bar=view.querySelector('.ptabs'),grid=view.querySelector('.grid');if(!T||!bar||!grid)return;
  bar.setAttribute('role','tablist');
  bar.innerHTML='<button type="button" role="tab" data-pt="grid" aria-label="Gönderiler">'+ic('grid')+'</button><button type="button" role="tab" data-pt="t2" aria-label="'+esc(T.t2[1])+'">'+ic(T.t2[0])+'<span>'+esc(T.t2[1])+'</span></button><button type="button" role="tab" data-pt="t3" aria-label="'+esc(T.t3[1])+'">'+ic(T.t3[0])+'<span>'+esc(T.t3[1])+'</span></button>';
  var pane=h('<div class="ptpane" id="ptpane"></div>');grid.after(pane);
  function show(k){PTAB[id]=k;bar.querySelectorAll('[data-pt]').forEach(function(b){var on=b.getAttribute('data-pt')===k;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});grid.hidden=k!=='grid';pane.hidden=k==='grid';if(k!=='grid')pane.innerHTML=T[k][2]()}
  bar.addEventListener('click',function(e){var b=e.target.closest('[data-pt]');if(b)show(b.getAttribute('data-pt'))});
  show(PTAB[id]||'grid');
}
var vProfile8=vProfile;
vProfile=function(id){vProfile8(id);wireProfileTabs(id);if(id==='kilise'){var bt=view.querySelector('.pr .btns');if(bt)bt.insertAdjacentHTML('afterend',nearHTML())}};
view.addEventListener('click',function(e){var b=e.target.closest('[data-pqa]');if(!b)return;e.stopPropagation();openPostComments(b.getAttribute('data-pqa'))},true);

/* ----- the nearest churches: the visitor's position never leaves the device ----- */
function kmDist(a,b,c,d){var R=6371,r=Math.PI/180,x=Math.sin((c-a)*r/2),y=Math.sin((d-b)*r/2),z=x*x+Math.cos(a*r)*Math.cos(c*r)*y*y;return 2*R*Math.asin(Math.sqrt(z))}
function nearList(lat,lon,label){
  var L=[];D.churches.cities.forEach(function(c){c.ch.forEach(function(x){var g=D.chgeo&&D.chgeo[x.id];if(g)L.push({x:x,c:c,d:kmDist(lat,lon,g[0],g[1])})})});
  L.sort(function(a,b){return a.d-b.d});
  var ist=kmDist(lat,lon,41.0082,28.9784)<60,R=ist?25:50,inR=L.filter(function(o){return o.d<=R});
  var show=inR.length?inR:L.slice(0,3);
  return '<p class="ptnote">'+esc(label)+(inR.length?' · '+R+' km içinde '+inR.length+' kilise':' · '+R+' km içinde kilise yok; size en yakın üç kilise:')+'</p>'+show.map(function(o){var q=encodeURIComponent(o.x.n+', '+o.x.addr);return '<div class="nrow"><button type="button" class="ptr2" data-church="'+o.x.id+'">'+(chImg(o.x.id)?'<span class="nimg" style="background-image:url('+chImg(o.x.id)+')"></span>':'')+'<span>'+esc(o.x.s||o.x.n)+'<small><b class="nkm">'+(o.d<10?o.d.toFixed(1).replace('.',','):Math.round(o.d))+' km</b> · '+esc(o.c.n+' · '+o.x.rite.replace(' Katolik',''))+'</small></span></button><a class="ndir" href="https://www.google.com/maps/dir/?api=1&destination='+q+'" target="_blank" rel="noopener">Adres</a></div>'}).join('');
}
function openNear(){
  var dim=h('<div class="dim"></div>'),sh=h('<div class="sheet nearsh" role="dialog" aria-label="En yakın kiliseler"><div class="gb"></div><h4>En yakın kiliseler</h4><div class="sc"><div id="nearbox"><p class="ptnote">Size en yakın Katolik kiliselerini göstermek için konumunuzu kullanmamız gerekiyor. Konumunuz yalnızca bu cihazda hesaplanır, hiçbir yere gönderilmez.</p><div class="dbtns"><button type="button" class="pri" data-geo>'+ic('loc')+' Konumumu kullan</button></div><p class="ptnote">Ya da bir şehir seçin:</p><div class="ncity">'+(D.citygeo?Object.keys(D.citygeo):[]).map(function(n){return '<button type="button" data-city="'+esc(n)+'">'+esc(n)+'</button>'}).join('')+'</div></div></div></div>');
  function close(){dim.remove();sh.remove()}
  dim.addEventListener('click',close);app.appendChild(dim);app.appendChild(sh);
  var box=sh.querySelector('#nearbox');
  sh.addEventListener('click',function(e){
    var c=e.target.closest('[data-city]');if(c){var g=D.citygeo[c.getAttribute('data-city')];box.innerHTML=nearList(g[0],g[1],c.getAttribute('data-city')+' merkezine göre')+'<button type="button" class="linkbtn" data-back2>Başka bir şehir seç</button>';return}
    if(e.target.closest('[data-back2]')){close();openNear();return}
    var ch=e.target.closest('[data-church]');if(ch){close();return}
    if(e.target.closest('[data-geo]')){
      if(!navigator.geolocation){box.insertAdjacentHTML('afterbegin','<p class="nerr">Bu tarayıcı konum paylaşmayı desteklemiyor. Aşağıdan bir şehir seçebilirsiniz.</p>');return}
      box.querySelector('[data-geo]').disabled=true;box.querySelector('[data-geo]').innerHTML='<span class="spin6"></span> Konum alınıyor…';
      navigator.geolocation.getCurrentPosition(function(p){box.innerHTML=nearList(p.coords.latitude,p.coords.longitude,'Konumunuza göre')},
        function(err){var b=box.querySelector('[data-geo]');if(b){b.disabled=false;b.innerHTML=ic('loc')+' Yeniden dene'}var old=box.querySelector('.nerr');if(old)old.remove();
          box.insertAdjacentHTML('afterbegin','<p class="nerr">'+(err&&err.code===1?'Konum izni verilmedi. Tarayıcı ayarlarından izin verebilir ya da aşağıdan bir şehir seçebilirsiniz.':'Konum alınamadı. Aşağıdan bir şehir seçebilirsiniz.')+'</p>')},{enableHighAccuracy:false,timeout:12000,maximumAge:600000});
    }
  });
}
view.addEventListener('click',function(e){var b=e.target.closest('[data-near]');if(!b)return;e.stopPropagation();openNear()},true);

/* ----- our own profile: a calm index of the site, not an endless grid ----- */
var ME_SEC={'Öğren':'book','Tartış':'comment','Dua Et':'candle2','Keşfet':'search','Site':'info'};
ICONS.candle2='<path d="M12 3c1.5 2 1.5 3.2 0 4.5-1.5-1.3-1.5-2.5 0-4.5zM9 10h6v11H9z"/>';
var ME_MAP={'kutsal-kitap.html':'doc:kutsalkitap','ekler.html':'read:cx:ekler','iletisim.html':'contact','erisilebilirlik.html':'doc:erisilebilirlik','gizlilik.html':'doc:gizlilik'};
vMe=function(){
  var a=ACC.me,nProf=ORDER.length-2;
  var html='<div class="hd"><h1>katolikdunyasi <span class="ver">✓</span></h1><span class="r"><button type="button" data-go="notif" aria-label="Bildirimler">'+ic('heart')+'</button><button type="button" id="tomenu" aria-label="Menü">'+ic('menu')+'</button></span></div>'
   +'<div class="pr mepr"><div class="top"><button type="button" data-story="bugun" aria-label="Bugünün hikâyesi">'+ringAv(a,86)+'</button><div class="nums"><button type="button" data-list="all"><b>'+nProf+'</b><span>profil</span></button><button type="button" data-list="follows"><b>'+follows.length+'</b><span>takip</span></button><button type="button" data-coll="all"><b>'+Object.keys(saved).length+'</b><span>kaydedilen</span></button></div></div>'
   +'<h2>'+esc(a.name)+' <span class="ver">✓</span></h2><div class="cat">'+esc(a.cat)+'</div><p>'+esc(a.bio)+'</p>'
   +'<div class="btns"><button type="button" data-mego="settings">'+ic('gear')+' Ayarlar</button><button type="button" data-mego="contact">'+ic('mail')+' İletişim</button></div></div>'
   +'<div class="mesecs">'+MENU.map(function(g){
      return '<section class="mesec"><h3>'+ic(ME_SEC[g[0]]||'book')+g[0]+'</h3><div class="mecards">'+g[1].map(function(m){
        var ext=m[0].indexOf('ext:')===0,acc=ext?null:ACC[m[0]],tgt=ext?ME_MAP[m[0].slice(4)]:null,pk=!ext?(storyPaint(m[0])||RINGMAP[m[0]]||SPAINT[m[0]]):null;
        if(pk&&pk.indexOf('ch:')===0)pk=null;
        var attr=!ext?'data-acc="'+m[0]+'"':!tgt?'data-ext="'+m[0].slice(4)+'"':tgt.indexOf('read:')===0?'data-go="'+tgt+'"':'data-go2="'+tgt+'"';
        var sub=acc?(acc.cat||''):'';
        return '<button type="button" class="mecard'+(pk?' pa-'+pk:'')+'" '+attr+'>'+(pk?'':'<span class="mci">'+av(ext?m[2]:acc.art,ext?m[3]:acc.tone,40)+'</span>')+'<b>'+esc(m[1])+'</b></button>'}).join('')+'</div></section>'}).join('')+'</div>'
   +'<p class="mefoot"><a href="https://katolikdunyasi.com" target="_blank" rel="noopener">katolikdunyasi.com</a> · '+(LANG==='en'?'Catholic World':'Katolik Portalı')+'</p>';
  view.innerHTML=html;
  view.querySelector('#tomenu').addEventListener('click',function(){go('settings')});
};
view.addEventListener('click',function(e){var b=e.target.closest('[data-mego],[data-ext]');if(!b)return;e.stopPropagation();
  if(b.hasAttribute('data-ext'))return window.open(SITE+b.getAttribute('data-ext'),'_blank','noopener');go(b.getAttribute('data-mego'))},true);

/* ----- messages: "mark all as read" instead of empty requests; write to us ----- */
var vInbox8=vInbox;
vInbox=function(){vInbox8();
  var n=view.querySelector('.notes');if(n)n.outerHTML='<button type="button" class="dmus" data-mego="contact"><span class="dmui">'+ic('msg')+'</span><span><b>Bize mesaj gönderin</b><small>Sorunuzu yazın, e-postayla cevap verelim</small></span>'+ic('chevr')+'</button>';
  var r=view.querySelector('#reqs');if(r){var b=h('<button type="button" id="markall">'+ic('checkall')+' Tümünü okundu işaretle</button>');r.replaceWith(b);
    b.addEventListener('click',function(){D.sss.forEach(function(c,ci){c.items.forEach(function(x,qi){dmRead[ci+'-'+qi]=dmRead[ci+'-'+qi]||Date.now()})});sset('dmread',dmRead);drawChats(view.querySelector('#dmq').value||'');toast('Tüm sohbetler okundu',true)})}
};

/* ----- the home feed: a new order on every visit; tap Ana sayfa twice for another ----- */
function shuffleFeed(){
  var last=sget('lasttop',''),pool=Object.keys(POSTS).filter(function(id){return !hidden[id]&&POSTS[id].slides&&POSTS[id].slides.length}),r=seeded((Date.now()%2147483647)||7),s=shuffle(pool,r).slice(0,18);
  if(s.indexOf('p-today')<0)s.splice(Math.floor(r()*3),0,'p-today');
  if(s[0]===last&&s.length>1){var t=s[0];s[0]=s[1];s[1]=t}
  FEED=s;sset('lasttop',FEED[0]);
}
shuffleFeed();
refreshFeed=function(){shuffleFeed();vHome();view.scrollTop=0;toast('Akış yenilendi',true)};
(function(){var lt={t:null,at:0};
  tabsEl.addEventListener('click',function(e){var b=e.target.closest('[data-tab]');if(!b)return;var t=b.getAttribute('data-tab'),dbl=lt.t===t&&Date.now()-lt.at<400;lt={t:t,at:dbl?0:Date.now()};if(!dbl)return;
    if(t==='home'){var p=view.querySelector('#ptr');if(p){p.classList.add('spin')}setTimeout(refreshFeed,PREFS.motion?0:380)}
    if(t==='explore'){xCh='Tümü';kxQ='';expQ='';stack=[stack[0]];render('explore');view.scrollTop=0;histReset();toast('Filtreler temizlendi')}
  });
})();
