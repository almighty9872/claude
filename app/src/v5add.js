/* ================= version 5 ================= */
/* The paper plane now means only "messages" (the FAQ chats). Everything that shares a link
   gets the share icon (a box with an arrow), so ic('send') draws the share icon and ic('dm')
   the paper plane. */
ICONS.dm=ICONS.send;
ICONS.send='<path d="M12 3.5v11"/><path d="m7.8 7.6 4.2-4.1 4.2 4.1"/><path d="M8 10.5H6.5A1.5 1.5 0 0 0 5 12v7.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V12a1.5 1.5 0 0 0-1.5-1.5H16"/>';
ICONS.speak='<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11"/>';
ICONS.stop='<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>';
ICONS.eyeoff='<path d="M3 3l18 18"/><path d="M10.6 5.6A9.6 9.6 0 0 1 12 5.5c5 0 8.5 4.6 9.5 6.5-.5.9-1.5 2.4-3 3.7M6.6 6.7C4.6 8 3.2 10 2.5 12c1 1.9 4.5 6.5 9.5 6.5 1.6 0 3-.4 4.3-1.1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>';
ICONS.user='<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>';
ICONS.qm='<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.6M12 16.8v.2"/>';
ICONS.pin='<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>';
ICONS.phone='<path d="M5 4h3.5l1.6 4-2.1 1.3a11 11 0 0 0 4.7 4.7l1.3-2.1 4 1.6V17a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>';
ICONS.copy='<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>';
ICONS.door='<path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21M3.5 21h17"/><circle cx="14.5" cy="12" r=".9" fill="currentColor"/>';
ICONS.scroll2='<path d="M7 4h11a2 2 0 0 1 2 2v1h-4M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7"/><path d="M8.5 9h6M8.5 12.5h6M8.5 16h4"/>';
ICONS.photo='<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>';
var DAYK=Y+'-'+M+'-'+Dd;

/* ----- public-domain portraits (popes and saints) ----- */
D.saintimg=D.saintimg||{};
function isPhoto(a){a=String(a);return a.indexOf('photo:')===0||a.indexOf('simg:')===0}
function imgSrc(a){a=String(a);if(a.indexOf('photo:')===0)return D.popeimg[a.slice(6)];if(a.indexOf('simg:')===0)return D.saintimg[a.slice(5)];return null}
function art(k,cls){
  if(k==='jc')return JC;
  if(k==='ich')return ICH;
  k=String(k);
  if(isPhoto(k)){var src=imgSrc(k);if(src)return '<img class="pimg'+(cls?' '+cls:'')+'" src="'+src+'" alt="" decoding="async">';k=k.indexOf('photo:')===0?'tiara':((ACC[k.slice(5)]||{}).art0||'lily')}
  return '<svg class="art'+(cls?' '+cls:'')+'" viewBox="0 0 120 120" aria-hidden="true">'+(D.ill[k]||D.ill.cross)+'</svg>';
}
function av(a,t,size){var c=tone(t),ph=isPhoto(a)&&imgSrc(a);return '<span class="av'+(ph?' avp':'')+'" style="width:'+size+'px;height:'+size+'px;background:'+(ph?'transparent':c[0])+';color:'+c[1]+'">'+avInner(a)+'</span>'}
function isSeen(id){return seen[id]===DAYK}
function markSeen(id){seen[id]=DAYK;sset('seen',seen)}
function ringAv(acc,size){var c=tone(acc.tone),ph=isPhoto(acc.art)&&imgSrc(acc.art);return '<span class="ring'+(isSeen(acc.id)?' seen':'')+'" style="width:'+size+'px;height:'+size+'px"><span class="in"><span class="av'+(ph?' avp':'')+'" style="background:'+(ph?'transparent':c[0])+';color:'+c[1]+'">'+avInner(acc.art)+'</span></span></span>'}
D.saints.forEach(function(s){if(!D.saintimg[s.id])return;var a=ACC[s.id];if(a&&!a.ord){a.art0=a.art;a.art='simg:'+s.id}var p=POSTS['p-'+s.id];if(p)p.slides[0].art='simg:'+s.id});
if(bigOfToday&&D.saintimg[bigOfToday.id]){POSTS['p-today'].slides[0].art='simg:'+bigOfToday.id}

/* ----- churches: every church is a profile of its own ----- */
var CH_OF={};
D.churches.cities.forEach(function(c){c.ch.forEach(function(x){
  var id='k-'+x.id;CH_OF[x.id]=id;
  addAcc({id:id,name:x.n,handle:x.id.replace(/-/g,'.'),art:'church',tone:'orange',cat:x.rite+' · '+c.n,bio:x.hist?firstSentence(x.hist,170):x.addr,church:x,city:c,url:'kilise/'+x.id+'.html'});
})});
function openAcc(id){
  if(id==='me')return setTab('me');if(id==='katekizm')return setTab('katekizm');
  if(id==='sss')return go('inbox');
  var a=ACC[id];if(a&&a.church)return go('church',a.church.id);
  go('profile',id);
}
function massCount(x){var n=0;(x.mass||[]).forEach(function(m){n+=String(m[1]).split(/·|,/).filter(function(s){return /\d{1,2}[:.]\d{2}/.test(s)}).length});return n}
function vChurch(cid){
  var r=findChurch(cid),x=r.x,c=r.c,id=CH_OF[cid],a=ACC[id];
  var q=encodeURIComponent(x.n+', '+x.addr);
  var dir='https://www.google.com/maps/dir/?api=1&destination='+q,map='https://www.google.com/maps/search/?api=1&query='+q;
  var same=c.ch.filter(function(y){return y.id!==cid});
  var HL=[['c-ayin','Ayin','chalice']].concat(x.vis?[['c-ziyaret','Ziyaret','door']]:[]).concat(x.hist?[['c-tarih','Tarihçe','scroll']]:[]).concat([['c-iletisim','İletişim','church']]).concat(same.length?[['c-yakin',c.n,'basilica']]:[]);
  var html=header(a.handle,'<button type="button" data-share="'+esc(a.url)+'" data-title="'+esc(x.n)+'" aria-label="Paylaş">'+ic('send')+'</button>')
   +'<div class="pr"><div class="top"><button type="button" data-story="'+id+'" aria-label="'+esc(x.n)+' hikâyesi">'+ringAv(a,90)+'</button><div class="nums">'
   +'<button type="button" data-jump="c-ayin"><b>'+(massCount(x)||(x.mass||[]).length||'-')+'</b><span>haftalık ayin</span></button>'
   +'<button type="button" data-jump="c-yakin"><b>'+c.ch.length+'</b><span>'+esc(c.n)+'</span></button>'
   +'<button type="button" data-acc="kilise"><b>'+Object.keys(CH_OF).length+'</b><span>kilise</span></button></div></div>'
   +'<h2>'+esc(x.n)+'</h2><div class="cat">'+esc(x.rite+' · '+x.dist)+'</div>'+(x.hist?'<p>'+esc(firstSentence(x.hist,200))+'</p>':'')
   +'<div class="btns">'+folBtnHTML(id)+'<a class="bt2" href="'+dir+'" target="_blank" rel="noopener">Adres</a>'+(x.web?'<a class="bt2" href="'+esc(x.web)+'" target="_blank" rel="noopener">Web sitesi</a>':'')+'<button type="button" class="ib" data-share="'+esc(a.url)+'" data-title="'+esc(x.n)+'" aria-label="Paylaş">'+ic('send')+'</button></div>'
   +'<div class="hls">'+HL.map(function(t){return '<button type="button" class="hl" data-jump="'+t[0]+'"><span class="o">'+av(t[2],'orange',58)+'</span><span>'+esc(t[1])+'</span></button>'}).join('')+'</div></div>'
   +'<section class="chs" id="c-ayin"><h3>'+ic('clock')+'Ayin saatleri</h3>'+((x.mass||[]).length?(x.mass||[]).map(function(m){return '<div class="mrow3"><b>'+esc(m[0])+'</b><span>'+String(m[1]).split(' · ').map(function(t){return '<i>'+esc(t)+'</i>'}).join('')+'</span></div>'}).join(''):'<p class="mute">Ayin saatleri için kiliseye danışın.</p>')+(x.mn?'<p class="mn">'+x.mn+'</p>':'')+'</section>'
   +(x.vis?'<section class="chs" id="c-ziyaret"><h3>'+ic('door')+'Ziyaret</h3><p>'+x.vis+'</p></section>':'')
   +(x.hist?'<section class="chs" id="c-tarih"><h3>'+ic('scroll2')+'Tarihçe</h3><p>'+x.hist+'</p></section>':'')
   +'<section class="chs" id="c-iletisim"><h3>'+ic('pin')+'Adres ve iletişim</h3>'
   +'<a class="crow" href="'+map+'" target="_blank" rel="noopener">'+ic('pin')+'<span>'+esc(x.addr)+'<small>Haritada aç</small></span></a>'
   +(x.ph||[]).map(function(p){return '<a class="crow" href="tel:'+esc(p.replace(/[^\d+]/g,''))+'">'+ic('phone')+'<span>'+esc(p)+'<small>Ara</small></span></a>'}).join('')
   +(x.web?'<a class="crow" href="'+esc(x.web)+'" target="_blank" rel="noopener">'+ic('globe')+'<span>'+esc(x.web.replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,''))+'<small>Web sitesi</small></span></a>':'')
   +'</section>'
   +(same.length?'<section class="chs" id="c-yakin"><h3>'+ic('church')+'Aynı şehirde: '+esc(c.n)+'</h3><div class="mrow">'+same.map(function(y){return '<button type="button" class="mi" data-church="'+y.id+'"><span class="o">'+av('church','orange',58)+'</span>'+esc(y.s||y.n)+'<span class="ext">'+esc(y.rite.replace(' Katolik',''))+'</span></button>'}).join('')+'</div></section>':'')
   +'<p class="note2">'+D.churches.note+'</p>';
  view.innerHTML=html;
}
view.addEventListener('click',function(e){var j=e.target.closest('[data-jump]');if(!j)return;var t=view.querySelector('#'+j.getAttribute('data-jump'));if(t){e.stopPropagation();view.scrollTo({top:t.offsetTop-54,behavior:PREFS.motion?'auto':'smooth'})}},true);

/* ----- home: seen stories turn grey and move to the right of the unseen ones ----- */
function storyOrder(){
  var all=['bugun'].concat(STORY_QS.map(function(n){return 'q:'+n})).concat(follows.filter(function(id){return ACC[id]}));
  return all.filter(function(id){return !isSeen(id)}).concat(all.filter(isSeen));
}
var hidden=sget('hidden',{});
function stoHTML(id){
  var s=isSeen(id);
  if(id.indexOf('q:')===0){var n=+id.slice(2),pi=CPART[n];return '<button type="button" class="sto cq'+(s?' seen':'')+'" data-story="'+id+'"><span class="ring'+(s?' seen':'')+'" style="width:70px;height:70px"><span class="in"><span class="av" style="background:'+tone(PART_TONE[pi])[0]+';color:'+tone(PART_TONE[pi])[1]+'">'+art(PART_ART[pi])+'</span></span></span><span>Soru '+n+'</span></button>'}
  var a=ACC[id];return '<button type="button" class="sto'+(s?' seen':'')+'" data-story="'+id+'">'+ringAv(a,70)+'<span>'+esc(id==='bugun'?'Bugün':a.handle)+'</span></button>';
}
function vHome(){
  var un=totalUnread();
  var html='<div class="hd hm"><span></span>'+LOGO+'<span class="r"><button type="button" class="badge" data-go="notif" aria-label="Bildirimler">'+ic('heart')+(sget('notifseen','')!==DAYK?'<i></i>':'')+'</button><button type="button" class="dmbtn" data-go="inbox" aria-label="Mesajlar'+(un?', '+un+' okunmamış sohbet':'')+'">'+ic('dm')+(un?'<span class="cnt3">'+un+'</span>':'')+'</button></span></div>';
  html+='<div class="stories">'+storyOrder().map(stoHTML).join('')+'</div>';
  html+=FEED.filter(function(id){return POSTS[id]&&!hidden[id]}).map(function(id){return postHTML(POSTS[id])}).join('');
  html+='<div class="empty">Bugünlük bu kadar. Keşfet’te daha fazlası var.</div>';
  view.innerHTML=html;wireCarousels(view);
  view.querySelector('#logo').addEventListener('click',openSettings);
}
function openStory(id){
  var order=storyOrder(),start=order.indexOf(id);
  var seq=start>=0?order.slice(start).map(function(x){return {id:x,slides:storySlides(x)}}):[{id:id,slides:storySlides(id)}];
  playStory(seq,0);
}
function storySlides(id){
  var a=ACC[id];
  if(a&&a.church){var x=a.church,S=[];
    S.push({kick:x.rite+' · '+a.city.n,title:x.n,text:x.dist,art:'church',tone:'orange',btn:['Profili aç','church:'+x.id]});
    (x.mass||[]).slice(0,3).forEach(function(m){S.push({kick:'Ayin saatleri',title:m[0],text:String(m[1]).split(' · ').join('\n'),art:'chalice',tone:'orange',btn:['Tüm saatler','church:'+x.id]})});
    if(x.hist)chunks(x.hist,230).slice(0,2).forEach(function(t,i){S.push({kick:'Tarihçe',title:i?'':x.n,text:t,art:'basilica',tone:'orange',btn:['Profili aç','church:'+x.id]})});
    return S}
  var S=storySlidesBase(id);paintSlides(id,S);return S;
}
/* the story viewer, with a dark band behind the top bar so the name and the close button
   stay readable on every background, light or dark theme */
function playStory(seq,si){
  var cur=seq[si],a=storyAcc(cur.id),i=0,timer=null,t0=0,elapsed=0,DUR=6500,paused=false;
  var el=h('<div class="ov story" role="dialog" aria-label="'+esc(a.name)+' hikâyesi"><div class="bg"></div><div class="scrim"></div><div class="bars">'+cur.slides.map(function(){return '<i><b></b></i>'}).join('')+'</div><div class="sh">'+av(a.art,a.tone,32)+'<b>'+esc(a.handle)+'</b><small class="ix"></small><button type="button" class="x" aria-label="Kapat">'+ic('x')+'</button></div><div class="tapl"></div><div class="tapr"></div><div class="sbody"></div><div class="sfoot"><button type="button" class="in">Soru sor…</button><button type="button" class="lk" aria-label="Beğen">'+ic('heart')+'</button><button type="button" class="shr" aria-label="Paylaş">'+ic('send')+'</button></div></div>');
  app.appendChild(el);markSeen(cur.id);
  var bars=el.querySelectorAll('.bars b'),body=el.querySelector('.sbody'),bg=el.querySelector('.bg');
  function show(){
    var s=cur.slides[i],c=tone(s.tone),pk=s.pa||storyPaint(cur.id);DUR=storyDur(s);
    if(pk){el.classList.add('pstory');bg.style.background='';bg.className='bg pa-'+pk+(i?' pdim':'');el.querySelector('.ix').textContent=(i+1)+'/'+cur.slides.length;body.style.color='#fff';
      body.innerHTML=(s.kick?'<div class="psk">'+esc(s.kick)+'</div>':'')+(s.title?'<h2 class="pst '+ttSize(s.title)+'">'+esc(UP(s.title))+'</h2>':'')+(s.text?'<p class="psp'+(s.title?'':' pbig')+'">'+esc(s.text)+'</p>':'')+(s.q?'<p class="psq">'+esc(s.q)+'</p>':'')+(s.stk?'<span class="stk" style="color:#111">📖 '+esc(s.stk)+'</span>':'')+(s.btn?'<button type="button" class="slink pl" data-act="'+esc(s.btn[1])+'">'+esc(s.btn[0])+' ›</button>':'');fitStory(body);
      bars.forEach(function(b,j){b.style.transition='none';b.style.width=j<i?'100%':'0%'});elapsed=0;run();return}
    el.classList.remove('pstory');bg.className='bg';
    bg.style.background='linear-gradient(172deg,'+c[0]+' 0%,#ffffff 78%)';
    el.querySelector('.ix').textContent=(i+1)+'/'+cur.slides.length;body.style.color=c[1];
    body.innerHTML=(isPhoto(s.art)&&imgSrc(s.art)?'<span class="sport">'+art(s.art)+'</span>':art(s.art,'big'))+(s.kick?'<div class="kick">'+esc(s.kick)+'</div>':'')+(s.title?'<h2 style="color:#111">'+esc(s.title)+'</h2>':'')+(s.text?'<p style="white-space:pre-line;color:#222">'+esc(s.text)+'</p>':'')+(s.q?'<p class="q" style="color:#111">'+esc(s.q)+'</p>':'')+(s.stk?'<span class="stk" style="color:#111">📖 '+esc(s.stk)+'</span>':'')+(s.btn?'<button type="button" class="slink" data-act="'+esc(s.btn[1])+'">'+esc(s.btn[0])+' ›</button>':'');
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
  el.querySelector('.shr').addEventListener('click',function(){pause();shareCard({slide:cur.slides[i],acc:a,paint:cur.slides[i].pa||storyPaint(cur.id),url:a.url||''},resume)});
  el.querySelector('.lk').addEventListener('click',function(e){e.currentTarget.classList.toggle('liked')});
  el.querySelector('.in').addEventListener('click',function(){pause();var pid=cur.id.indexOf('q:')===0?'p-cq':(postOf(cur.id)||{}).id;openPostComments(pid||{acc:cur.id},resume)});
  body.addEventListener('click',function(e){var b=e.target.closest('[data-act]');if(!b)return;var act=b.getAttribute('data-act');close();openTarget(act)});
  show();
}

/* ----- posts: the share icon, the "…" menu and the comment bubble ----- */
function postHTML(p){
  var a=ACC[p.acc],n=p.slides.length,dots='';for(var i=0;i<n;i++)dots+='<i'+(i?'':' class="on"')+'></i>';
  var full=p.capFull||p.cap,short=cut(p.cap,95),nc=commentsFor(p).length;
  var btn=p.read?'<button class="linkbtn" type="button" data-read="'+p.read+'">Tamamını oku</button>':(p.act==='rosary'?'<button class="linkbtn" type="button" data-rosary>Tesbihe başla</button>':'');
  return '<article class="post" data-pid="'+p.id+'"><div class="ph"><button type="button" data-story="'+a.id+'" aria-label="'+esc(a.name)+' hikâyesi">'+ringAv(a,38)+'</button><button class="who" type="button" data-acc="'+a.id+'"><b>'+esc(a.handle)+(a.ver?' <span class="ver">✓</span>':'')+'</b><small>'+esc(p.sub||a.cat)+'</small></button><button type="button" data-pmenu="'+p.id+'" aria-label="Diğer seçenekler" aria-haspopup="dialog">'+ic('more')+'</button></div>'
   +'<div class="wrapc">'+(n>1?'<span class="cnt">1/'+n+'</span>':'')+'<div class="car">'+p.slides.map(slideHTML).join('')+'</div></div>'
   +'<div class="act"><button type="button" data-like="'+p.id+'" class="'+(liked[p.id]?'liked':'')+'" aria-pressed="'+!!liked[p.id]+'" aria-label="Beğen">'+ic('heart')+'</button><button type="button" data-pc="'+p.id+'" aria-label="Sorular ve cevaplar ('+nc+')">'+ic('comment')+'</button><button type="button" data-share="'+(a.url||'')+'" data-title="'+esc(p.title||a.name)+'" aria-label="Paylaş">'+ic('send')+'</button>'+(n>1?'<div class="dots">'+dots+'</div>':'')+'<button type="button" class="sv '+(saved[p.id]?'saved':'')+'" data-save="'+p.id+'" aria-pressed="'+!!saved[p.id]+'" aria-label="Kaydet">'+ic('save')+'</button></div>'
   +'<div class="cap"><b>'+esc(a.handle)+'</b> <span class="txt" data-full="'+esc(full)+'">'+esc(full.length>short.length?short:full)+'</span>'+(full.length>short.length?' <button type="button" class="more" data-more>devamı</button>':'')+'</div>'
   +(nc?'<button type="button" class="pcl" data-pc="'+p.id+'">'+nc+' sorunun tümünü gör</button>':'')
   +(p.meta?'<div class="meta">'+esc(p.meta)+'</div>':'')+btn+'</article>';
}
function slideHTML(s){
  var st='background:linear-gradient(165deg,'+s.bg+',#ffffff 135%);color:'+s.ink;
  if(s.type==='cover'){var ph=isPhoto(s.art)&&imgSrc(s.art);return '<div class="sl'+(ph?' slp':'')+'" style="'+st+'">'+(ph?'<span class="cport">'+art(s.art)+'</span>':art(s.art,'big'))+'<div class="kick">'+esc(s.kick||'')+'</div><h2 style="color:#141414">'+esc(s.title)+'</h2>'+(s.sub?'<div class="sub" style="color:#262626">'+esc(s.sub)+'</div>':'')+'</div>'}
  return '<div class="sl tx" style="'+st+'">'+art(isPhoto(s.art)?'cross':s.art,'small-art')+(s.n!==''?'<div class="n">'+esc(s.n)+'</div>':'<div class="pad"></div>')+(s.title?'<h3 style="color:#141414">'+esc(s.title)+'</h3>':'')+'<p>'+esc(s.text)+'</p></div>';
}
view.addEventListener('click',function(e){
  var t=e.target.closest('[data-pmenu],[data-pc],[data-unhide]');if(!t)return;e.stopPropagation();
  if(t.hasAttribute('data-pmenu'))return openPostMenu(t.getAttribute('data-pmenu'));
  if(t.hasAttribute('data-pc'))return openPostComments(t.getAttribute('data-pc'));
  if(t.hasAttribute('data-unhide')){var id=t.getAttribute('data-unhide');delete hidden[id];sset('hidden',hidden);var ph=t.closest('.hidpost');ph.replaceWith(h(postHTML(POSTS[id])));wireCarousels(view);return}
},true);

/* the "…" menu: listen, save, follow, go to the profile, read, share, hide, why */
var speaking=null;
function stopSpeech(){try{if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}speaking=null}
function speakPost(p){
  if(!('speechSynthesis' in window)){toast('Bu tarayıcı sesli okumayı desteklemiyor');return}
  stopSpeech();
  var txt=[p.title||'',plain(p.cap)].concat(p.slides.slice(1).map(function(s){return (s.title?s.title+'. ':'')+plain(s.text)})).join('. ');
  var u=new SpeechSynthesisUtterance(txt);u.lang='tr-TR';u.rate=0.95;
  var v=speechSynthesis.getVoices().filter(function(v){return /^tr/i.test(v.lang)})[0];if(v)u.voice=v;
  u.onend=function(){speaking=null};speaking=p.id;speechSynthesis.speak(u);toast('Sesli okunuyor · durdurmak için yeniden dokunun');
}
function whyText(p){
  if(isFollowing(p.acc))return 'Bu gönderiyi '+ACC[p.acc].name+' profilini takip ettiğiniz için görüyorsunuz.';
  if(p.id==='p-today')return 'Bugün ('+todayLabel+') Kilise takviminde '+todaySaint.n+' anılıyor. Ana sayfanın ilk gönderisi her gün günün azizidir.';
  if(p.id==='p-cq')return SEASON.q?SEASON.t+' dönemindeyiz; Katekizm’den bu döneme uygun sorular seçildi.':'Katekizm’den her gün başka bir soru seçilir.';
  if(p.id==='p-myst')return GUN[WD]+' günleri tesbihte '+todaySet.t+' okunur.';
  return 'Ana sayfa her gün takvime göre yenilenir: dualar, Katekizm, azizler, papalar ve tartışma yazıları dönüşümlü olarak gösterilir. Hiçbir kişisel veri kullanılmaz.';
}
function openPostMenu(pid){
  var p=POSTS[pid],a=ACC[p.acc],fol=isFollowing(p.acc),sv=!!saved[pid];
  var dim=h('<div class="dim"></div>'),sh=h('<div class="sheet pmenu" role="dialog" aria-label="Gönderi seçenekleri"><div class="gb"></div><div class="pmtop">'
   +'<button type="button" data-m="save">'+ic('save')+'<span>'+(sv?'Kaydedildi':'Kaydet')+'</span></button>'
   +'<button type="button" data-m="speak">'+ic(speaking===pid?'stop':'speak')+'<span>'+(speaking===pid?'Durdur':'Sesli dinle')+'</span></button>'
   +'<button type="button" data-m="share">'+ic('send')+'<span>Paylaş</span></button></div><div class="sc pml">'
   +(p.read?'<button type="button" data-m="read">'+ic('book')+'<span>Tamamını oku</span></button>':'')
   +(p.act==='rosary'?'<button type="button" data-m="rosary">'+ic('book')+'<span>Tesbihe başla</span></button>':'')
   +'<button type="button" data-m="card">'+ic('photo')+'<span>Görsel kart olarak paylaş</span></button>'
   +'<button type="button" data-m="acc">'+ic('user')+'<span>'+esc(a.handle)+' profiline git</span></button>'
   +(p.acc!=='me'?'<button type="button" data-m="follow">'+ic('users')+'<span>'+(fol?'Takibi bırak':'Takip et')+'</span></button>':'')
   +'<button type="button" data-m="why">'+ic('qm')+'<span>Bunu neden görüyorum?</span></button>'
   +'<button type="button" data-m="hide" class="warn">'+ic('eyeoff')+'<span>Bu gönderiyi gizle</span></button>'
   +'</div></div>');
  function close(){dim.remove();sh.remove()}
  sh.addEventListener('click',function(e){var b=e.target.closest('[data-m]');if(!b)return;var m=b.getAttribute('data-m');
    if(m==='why'){b.outerHTML='<p class="why">'+esc(whyText(p))+'</p>';return}
    close();
    if(m==='save')return toggleSave(pid);
    if(m==='speak'){if(speaking===pid){stopSpeech();toast('Durduruldu')}else speakPost(p);return}
    if(m==='share')return share(a.url||'',p.title||a.name);
    if(m==='card'){var car=view.querySelector('.post[data-pid="'+pid+'"] .car'),ix=car?Math.round(car.scrollLeft/Math.max(1,car.clientWidth)):0;return shareCard({slide:p.slides[ix]||p.slides[0],acc:a,paint:paintFor(pid),url:a.url||'',title:p.title})}
    if(m==='read')return go('reader',p.read);
    if(m==='rosary')return openRosary();
    if(m==='acc')return openAcc(p.acc);
    if(m==='follow')return toggleFollow(p.acc);
    if(m==='hide'){hidden[pid]=Date.now();sset('hidden',hidden);var art2=view.querySelector('.post[data-pid="'+pid+'"]');if(art2)art2.replaceWith(h('<div class="hidpost"><b>Gönderi gizlendi</b><span>Bu gönderi ana sayfanızda artık görünmeyecek.</span><button type="button" data-unhide="'+pid+'">Geri al</button></div>'));return}
  });
  dim.addEventListener('click',close);app.appendChild(dim);app.appendChild(sh);
}

/* ----- comments: the questions and answers about this very post ----- */
var CMLIKE=sget('cmlike',{});
function feastOf(name){var nn=normName(name),out=null;Object.keys(D.days).forEach(function(k){var r=D.days[k][0];if(!out&&r&&normName(r.n)===nn)out=k});if(!out)return null;var p=out.split('-');return LANG==='en'?AYLAR[+p[0]-1]+' '+(+p[1]):(+p[1])+' '+AYLAR[+p[0]-1]}
var STOP={aziz:1,azize:1,havari:1,kutsal:1,papa:1,ana:1,'küçük':1,'büyük':1,ile:1,olan:1,'için':1,gibi:1,daha:1,'çok':1,'neden':1,bir:1,'nasıl':1,'nedir':1};
function keyTerms(p){
  var a=ACC[p.acc],T=[];
  function add(s){norm(s).split(/[^a-z0-9çğöşü]+/).forEach(function(w){if(w.length>3&&!STOP[w]&&T.indexOf(w)<0)T.push(w)})}
  if(a.saint){add(a.saint.name);if(a.saint.id==='meryem-ana')T.push('meryem','bakire');if(a.saint.id==='aziz-yusuf')T.push('yusuf');if(/petrus/.test(a.saint.id))T.push('petrus','kaya');}
  else if(a.pope){T.push('papa','petrus','halef');}
  else{var M={gunah:['tövbe','günah','bağışla','itiraf'],ayin:['efkaristiya','ayin','komünyon','ekmek'],tesbih:['meryem','tesbih','dua'],tesbihtarihi:['meryem','tesbih','dua'],islam:['muhammed','kuran','islam','teslis'],ateizm:['tanrı','yaratılış','dirili','akıl'],neden:['kilise','petrus','gelenek','katolik'],surec:['vaftiz','katekümen','iman','kilise'],topraklar:['konsil','iznik','efes','antakya'],meseller:['mesel','krallık','egemenliği'],mucizeler:['mucize','diriliş','efkaristiya'],azizler:['aziz','kutsallık','azizler'],katekizm:[],kilise:['kilise','ayin']};T=(M[p.acc]||[]).slice();if(p.title)add(p.title)}
  return T.slice(0,6);
}
function matchQA(terms,limit){
  if(!terms.length)return [];
  var res=[];
  function score(q,a){var tq=norm(q),ta=norm(a),s=0;terms.forEach(function(w){var st=w.slice(0,Math.max(4,w.length-2));if(tq.indexOf(st)>=0)s+=3;else if(ta.indexOf(st)>=0)s+=1});return s}
  Object.keys(CQ).forEach(function(n){var it=CQ[n],s=score(plain(it[2]),plain(it[3]));if(s>=3)res.push({s:s+0.1,q:plain(it[2]),a:cut(it[3],420),src:'Katekizm · Soru '+n,go:'read:comp:'+CPART[n]+'#'+n})});
  D.sss.forEach(function(c,ci){c.items.forEach(function(x,qi){var s=score(x.q,x.a);if(s>=3)res.push({s:s+0.3,q:x.q,a:cut(x.a,420),src:'Sorular · '+c.t,go:'chat:'+ci+'#'+qi})})});
  D.gun.faq.forEach(function(x){var s=score(x.q,x.a);if(s>=3)res.push({s:s+0.2,q:x.q,a:cut(x.a,420),src:'Günah Çıkarma',go:'read:gunah'})});
  res.sort(function(x,y){return y.s-x.s});return res.slice(0,limit||5);
}
var CM_CACHE={};
function commentsFor(p){
  if(!p)return [];
  if(CM_CACHE[p.id])return CM_CACHE[p.id];
  var a=ACC[p.acc],L=[];
  function add(q,ans,src,go){L.push({q:q,a:cleanA(ans),src:src||'',go:go||''})}
  if(a.saint&&(p.id==='p-'+a.id||p.id==='p-today')){var s=a.saint,f=feastOf(s.name);
    if(f)add('Bayramı ne zaman?',f+'. Kilise takviminde '+s.name+' o gün anılır.','Azizler takvimi','acc:azizler');
    add('Ne zaman yaşadı?',s.era+'.');
    if(s.emb)add('Resimlerde nasıl tanınır?','Simgesi: '+s.emb+'.');
    add('Neden “'+s.ep+'” diye anılır?',cut(plain(s.sum),300),'',p.read?'read:'+p.read:'');}
  else if(p.id==='p-today'){add('Bugün kimi anıyoruz?',todaySaint.n+'. '+cut(todaySaint.t||todaySaint.b,260),'Azizler takvimi','acc:azizler')}
  if(a.pope){var pp=a.pope,i=popeIdx(a.id);
    add('Kaçıncı papa?',pp.ord+'. papa. Papalığı: '+pp.years+'.');
    add('Nerede doğdu?',pp.born+'.');
    if(pp.docs&&pp.docs.length)add('Önemli belgeleri hangileri?',pp.docs.map(function(d){return d[0]+' ('+d[1]+'): '+d[2]}).join(' '),'',p.read?'read:'+p.read+'#docs':'');
    if(i>0||i<POPE_LINE.length-1)add('Bu listede öncesinde ve sonrasında kim var?',(i>0?'Öncesinde '+ACC[POPE_LINE[i-1]].name:'')+(i>0&&i<POPE_LINE.length-1?', sonrasında ':'')+(i<POPE_LINE.length-1?(i>0?'':'Sonrasında ')+ACC[POPE_LINE[i+1]].name:'')+'. Listede yalnızca öne çıkan papalar yer alır.','','acc:papalar');}
  if(p.id==='p-myst'){add('Bugün neden bu gizemler?',GUN[WD]+' günleri '+todaySet.t+' okunur ('+todaySet.dt+').');add('Tesbih ne kadar sürer?','Beş gizemle yaklaşık 20 dakika. Her gizemde bir Göklerdeki Pederimiz, on Selam Sana Meryem ve bir Peder’e Şan okunur.','Tesbih Duası','rosary')}
  if(p.id==='p-cq'){var cq=CQ[STORY_QS[0]],n0=cq[1];add('Bu soru Katekizm’in neresinde?',D.comp[CPART[n0]].t+' bölümünde, '+n0+'. soru.','Katekizm','read:comp:'+CPART[n0]+'#'+n0);[n0-1,n0+1].forEach(function(n){if(CQ[n])add(plain(CQ[n][2]),cut(CQ[n][3],380),'Katekizm · Soru '+n,'read:comp:'+CPART[n]+'#'+n)})}
  if(p.id.indexOf('p-mes-')===0){var m=D.mes.filter(function(x){return 'p-mes-'+x.id===p.id})[0];if(m){add('Kutsal Kitap’ta nerede geçer?',m.ref+'.');add('Hangi gruptan bir mesel?',m.cat+'.','','acc:meseller')}}
  if(p.id.indexOf('p-mir-')===0){var mr=D.mir.filter(function(x){return 'p-mir-'+x.id===p.id})[0];if(mr){add('Nerede ve ne zaman oldu?',mr.p+'.');add('Kilise bu olaylara nasıl yaklaşır?','Kilise olağanüstü olayları uzun ve dikkatli incelemelerden sonra tanır; tanınan özel görünmelere inanmak bile kimse için zorunlu değildir. İmanın temeli Mesih’in açınlamasıdır.','','acc:mucizeler')}}
  if(p.id==='p-gunah')D.gun.faq.slice(0,4).forEach(function(x){add(x.q,cut(x.a,420),'Günah Çıkarma','read:gunah')});
  if(p.id==='p-islam'||p.id==='p-ateizm'){var cs=p.id==='p-islam'?D.isl:D.ate;cs.tldr.slice(0,4).forEach(function(x){add(x.t,cut(x.x,420),cs.title,'read:'+p.acc)})}
  if(p.id==='p-ayin')D.mass.parts.slice(0,3).forEach(function(mp,i){add(mp.t+' nedir?',cut(mp.lead,380),'Kutsal Ayin','read:mass#'+i)});
  matchQA(keyTerms(p),Math.max(2,7-L.length)).forEach(function(x){if(!L.some(function(y){return norm(y.q)===norm(x.q)}))add(x.q,x.a,x.src,x.go)});
  CM_CACHE[p.id]=L;return L;
}
function bestAnswerAll(q,extra){
  var words=norm(q).split(/[^a-z0-9çğöşü]+/).filter(function(w){return w.length>3&&!STOP[w]});if(!words.length)return null;
  var pool=(extra||[]).map(function(x){return {q:x.q,a:x.a,src:x.src,go:x.go}});
  var m=matchQA(words,1);if(m.length)pool.push(m[0]);
  var best=null,bs=0;pool.forEach(function(x){var t=norm(x.q+' '+x.q+' '+x.a),s=0;words.forEach(function(w){if(t.indexOf(w.slice(0,Math.max(4,w.length-2)))>=0)s++});if(s>bs){bs=s;best=x}});
  return bs>=Math.min(2,words.length)?best:null;
}
function openPostComments(pid,onClose){
  var p=typeof pid==='string'?POSTS[pid]:null,acc=p?ACC[p.acc]:ACC[(pid||{}).acc]||ACC.me;
  var L=p?commentsFor(p):matchQA(keyTerms({acc:acc.id,title:acc.name}),6).map(function(x){x.a=cleanA(x.a);return x});
  var dim=h('<div class="dim"></div>'),sh=h('<div class="sheet cms" role="dialog" aria-label="Sorular ve cevaplar"><div class="gb"></div><h4>Sorular ve cevaplar</h4><div class="sc"></div><form class="cmf" autocomplete="off"><span class="cmav">'+av(acc.art,acc.tone,32)+'</span><input type="text" placeholder="Bir soru sorun…" aria-label="Soru yazın"><button type="submit">Sor</button></form></div>'),sc=sh.querySelector('.sc');
  function item(x,i,mine){var id='c'+i,lk=!!CMLIKE[(p?p.id:acc.id)+'|'+x.q];
    return '<div class="cm2'+(mine?' mine':'')+'"><span class="cav">'+(mine?'<span class="av" style="width:32px;height:32px;background:var(--chip);color:var(--mute)">'+ic('user')+'</span>':'<span class="av" style="width:32px;height:32px;background:var(--chip);color:var(--gold)">'+ic('qm')+'</span>')+'</span><div class="cb"><p><b>'+(mine?'siz':'sık.sorulan')+'</b> '+esc(x.q)+'</p><div class="cmeta">'+(mine?'<span>şimdi</span>':'')+'<button type="button" data-rep="'+id+'"'+(mine?' hidden':'')+'>Yanıtı gör (1)</button></div>'
      +'<div class="rp2" id="'+id+'"'+(mine?'':' hidden')+'>'+(x.a?'<span class="cav">'+av(acc.art,acc.tone,26)+'</span><div><p><b>'+esc(acc.handle)+'</b> <span class="ver">✓</span> '+x.a+'</p>'+(x.src||x.go?'<div class="cmeta">'+(x.src?'<span>'+esc(x.src)+'</span>':'')+(x.go?'<button type="button" data-cgo="'+esc(x.go)+'">Kaynağa git ›</button>':'')+'</div>':'')+'</div>':'<div><p class="mute">Bu soruya hazır bir cevabımız yok. Mesajlar’daki kalem simgesiyle bize yazabilirsiniz.</p></div>')+'</div></div>'
      +'<button type="button" class="clk'+(lk?' liked':'')+'" data-clk="'+esc(x.q)+'" aria-label="Beğen" aria-pressed="'+lk+'">'+ic('heart')+'</button></div>'}
  var head='<div class="cm2 cap2"><span class="cav">'+av(acc.art,acc.tone,32)+'</span><div class="cb"><p><b>'+esc(acc.handle)+'</b> '+esc(p?cut(p.cap,200):acc.bio)+'</p><div class="cmeta"><span>Bu gönderiyle ilgili sorular. Bir soruya dokunun, cevabı açılsın.</span></div></div></div>';
  sc.innerHTML=head+(L.length?L.map(function(x,i){return item(x,i)}).join(''):'<div class="empty">Henüz soru yok. İlk soruyu siz sorun.</div>');
  var n=L.length;
  sc.addEventListener('click',function(e){
    var r=e.target.closest('[data-rep]');if(r){var b=sc.querySelector('#'+r.getAttribute('data-rep'));b.hidden=!b.hidden;r.textContent=b.hidden?'Yanıtı gör (1)':'Yanıtı gizle';return}
    var l=e.target.closest('[data-clk]');if(l){var k=(p?p.id:acc.id)+'|'+l.getAttribute('data-clk');if(CMLIKE[k])delete CMLIKE[k];else CMLIKE[k]=1;sset('cmlike',CMLIKE);l.classList.toggle('liked',!!CMLIKE[k]);l.setAttribute('aria-pressed',!!CMLIKE[k]);return}
    var g=e.target.closest('[data-cgo]');if(g){var t=g.getAttribute('data-cgo');close();if(t.indexOf('chat:')===0)return go('chat',t.slice(5));return openTarget(t)}
  });
  sh.querySelector('.cmf').addEventListener('submit',function(e){e.preventDefault();var inp=e.target.querySelector('input'),q=inp.value.trim();if(!q)return;inp.value='';
    var best=bestAnswerAll(q,L),x={q:q,a:best?'<b>'+esc(best.q)+'</b><br>'+best.a:'',src:best?best.src:'',go:best?best.go:''};
    var em=sc.querySelector('.empty');if(em)em.remove();
    sc.insertAdjacentHTML('beforeend',item(x,n++,true));sc.scrollTop=sc.scrollHeight});
  function close(){dim.remove();sh.remove();if(onClose)onClose()}
  dim.addEventListener('click',close);app.appendChild(dim);app.appendChild(sh);
}

/* ----- the menu page: appearance first and set right here, then "Sizin için" ----- */
var LANG_NOTE=false;
function vSettings(){
  var nSaved=Object.keys(saved).length,nRead=Object.keys(progress).length,un=totalUnread();
  function seg(attr,opts,cur,label){return '<div class="seg" role="group" aria-label="'+label+'">'+opts.map(function(o){return '<button type="button" '+attr+'="'+o[0]+'" class="'+(String(cur)===String(o[0])?'on':'')+'" aria-pressed="'+(String(cur)===String(o[0]))+'">'+o[1]+'</button>'}).join('')+'</div>'}
  ICONS.contrast='<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>';ICONS.motion='<path d="M4 12h3l2-5 4 10 2-5h5"/>';
  function crow(icn,label,ctl,extra){return '<div class="srow sctl"'+(extra||'')+'>'+ic(icn)+'<span class="sl1">'+label+'</span>'+ctl+'</div>'}
  var look='<div class="sgrp" id="g-look"><h3>Görünüm</h3>'
   +crow(PREFS.theme==='dark'?'moon':'sun','Tema',seg('data-th',[['light','Açık'],['dark','Koyu'],['system','Sistem']],PREFS.theme,'Tema'),' id="r-theme"')
   +crow('globe','Dil',seg('data-lang',[['tr','Türkçe'],['en','English']],LANG_NOTE?'en':'tr','Dil'))
   +'<p class="lnote" id="lnote"'+(LANG_NOTE?'':' hidden')+'>Uygulamanın İngilizce sürümü hazırlanıyor. Sitenin İngilizcesi şimdiden <a href="'+SITE+'en/" target="_blank" rel="noopener">katolikdunyasi.com/en</a> adresinde.</p>'
   +crow('type','Yazı boyutu',seg('data-sz',[[0,'A−'],[1,'A'],[2,'A+'],[3,'A++']],PREFS.size,'Yazı boyutu'))
   +[['contrast','contrast','Yüksek karşıtlık'],['font','book','Okunaklı yazı tipi'],['motion','motion','Animasyonları azalt']].map(function(o){return '<label class="srow sctl">'+ic(o[1])+'<span class="sl1">'+o[2]+'</span><input type="checkbox" class="sw" data-pref="'+o[0]+'"'+(PREFS[o[0]]?' checked':'')+'></label>'}).join('')
   +'</div>';
  var G=[
   ['Sizin için',[['bookmark','Kaydedilenler',nSaved,'data-coll="all"'],['users','Takip ettikleriniz',follows.length,'data-list="follows"'],['clock','Okuma geçmişi',nRead,'data-sgo="history"'],['heart','Bildirimler',null,'data-sgo="notif"'],['dm','Mesajlar',un?un+' okunmamış':'Tümü okundu','data-sgo="inbox"'],['eyeoff','Gizlenen gönderiler',Object.keys(hidden).length,'data-sgo="hidden"']]],
   ['Katolik Dünyası',[['info','Hakkında',null,'data-doc="hakkinda"'],['book','Kaynaklar ve telif',null,'data-doc="kaynaklar"'],['lock','Gizlilik politikası',null,'data-doc="gizlilik"'],['access','Erişilebilirlik beyanı',null,'data-doc="erisilebilirlik"'],['mail','İletişim',null,'data-sgo="contact"']]],
   ['Verileriniz',[['trash','Kaydedilenleri temizle',null,'data-wipe="saved"'],['trash','Okuma geçmişini sil',null,'data-wipe="progress"'],['trash','Sohbetleri okunmamış yap',null,'data-wipe="dmread"'],['trash','Gizlenen gönderileri geri getir',null,'data-wipe="hidden"']]]
  ];
  view.innerHTML=header('Ayarlar ve etkinlik')+'<label class="search" for="sq">'+ic('search')+'<input id="sq" type="search" placeholder="Ara" autocomplete="off"></label><div id="sgr">'+look
   +G.map(function(g){return '<div class="sgrp"><h3>'+g[0]+'</h3>'+g[1].map(function(r){return rowHTML(r[0],r[1],r[2],r[3])}).join('')+'</div>'}).join('')+'</div>';
  var sg=view.querySelector('#sgr');
  view.querySelector('#sq').addEventListener('input',function(e){var q=norm(e.target.value);sg.querySelectorAll('.srow').forEach(function(r){r.hidden=q&&norm(r.textContent).indexOf(q)<0});sg.querySelectorAll('.sgrp').forEach(function(g){g.hidden=!g.querySelector('.srow:not([hidden])')})});
  function segs(attr,fn){sg.querySelectorAll('['+attr+']').forEach(function(b){b.addEventListener('click',function(){fn(b.getAttribute(attr));sg.querySelectorAll('['+attr+']').forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)})})})}
  segs('data-th',function(v){PREFS.theme=v;applyPrefs();var i=sg.querySelector('#r-theme .i');if(i)i.outerHTML=ic(v==='dark'?'moon':'sun')});
  segs('data-sz',function(v){PREFS.size=+v;applyPrefs()});
  segs('data-lang',function(v){LANG_NOTE=v==='en';sg.querySelector('#lnote').hidden=!LANG_NOTE});
  sg.querySelectorAll('[data-pref]').forEach(function(c){c.addEventListener('change',function(){PREFS[c.getAttribute('data-pref')]=c.checked;applyPrefs()})});
  sg.addEventListener('click',function(e){var b=e.target.closest('.srow');if(!b)return;
    if(b.hasAttribute('data-doc')){e.stopPropagation();return go('reader','doc:'+b.getAttribute('data-doc'))}
    if(b.hasAttribute('data-sgo')){e.stopPropagation();var g=b.getAttribute('data-sgo');if(g==='hidden')return openHiddenList();return go(g)}
    if(b.hasAttribute('data-wipe')){e.stopPropagation();var k=b.getAttribute('data-wipe');if(b.classList.contains('confirm')){if(k==='saved')saved={};if(k==='progress')progress={};if(k==='dmread')dmRead={};if(k==='hidden')hidden={};sset(k,{});toast('Temizlendi',true);vSettings();return}
      b.classList.add('confirm');b.querySelector('.sl1').textContent='Emin misiniz? Onaylamak için yeniden dokunun';setTimeout(function(){if(b.isConnected){b.classList.remove('confirm');vSettings()}},3500);return}
  },true);
}
function openHiddenList(){
  var ids=Object.keys(hidden).filter(function(k){return POSTS[k]});
  var dim=h('<div class="dim"></div>'),sh=h('<div class="sheet" role="dialog" aria-label="Gizlenen gönderiler"><div class="gb"></div><h4>Gizlenen gönderiler</h4><div class="sc">'+(ids.length?ids.map(function(k){var p=POSTS[k],a=ACC[p.acc];return '<div class="lst">'+av(a.art,a.tone,44)+'<p><b>'+esc(p.title||a.name)+'</b><span class="sub">'+esc(a.handle)+'</span></p><button type="button" class="fb" data-uh="'+k+'">Geri getir</button></div>'}).join(''):'<div class="empty">Gizlediğiniz bir gönderi yok. Bir gönderinin “…” menüsünden gizleyebilirsiniz.</div>')+'</div></div>');
  function close(){dim.remove();sh.remove()}
  sh.addEventListener('click',function(e){var b=e.target.closest('[data-uh]');if(!b)return;delete hidden[b.getAttribute('data-uh')];sset('hidden',hidden);b.closest('.lst').remove();toast('Ana sayfaya geri getirildi',true)});
  dim.addEventListener('click',close);app.appendChild(dim);app.appendChild(sh);
}

/* ----- About, sources, privacy and accessibility open inside the app ----- */
function mdInline(s){
  return esc(s).replace(/\[([^\]]+)\]\(([^)]+)\)/g,function(_,t,u){if(u==='iletisim.html')return '<button type="button" class="link" data-go2="contact">'+t+'</button>';if(!/^https?:/.test(u))u=SITE+u;return '<a href="'+u+'" target="_blank" rel="noopener">'+t+'</a>'})
    .replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\*([^*]+)\*/g,'<i>$1</i>');
}
function mdDoc(src){
  var out=[],list=null,i=0;
  String(src).split('\n').forEach(function(l){
    var t=l.trim();
    if(/^[-*]\s+/.test(t)){if(!list){list=[];}list.push('<li>'+mdInline(t.replace(/^[-*]\s+/,''))+'</li>');return}
    if(list){out.push('<ul class="dl">'+list.join('')+'</ul>');list=null}
    if(!t)return;
    var m=t.match(/^(#{2,3})\s+(.*?)(\s*\{#[^}]+\})?$/);if(m){out.push('<h2 id="s'+(i++)+'">'+mdInline(m[2])+'</h2>');return}
    out.push('<p>'+mdInline(t)+'</p>');
  });
  if(list)out.push('<ul class="dl">'+list.join('')+'</ul>');
  return out.join('');
}
function docCredits(){
  var C=D.imgcredits||[];if(!C.length)return '';
  return '<h2 id="sgorsel">Görseller</h2><p>Papaların ve azizlerin portreleri, telif süresi dolmuş (kamu malı) ya da CC0 ile serbest bırakılmış eserlerdir; Wikimedia Commons’tan alınmış, daire biçiminde kırpılmıştır. Papaların çoğu, Roma’daki Surların Dışındaki Aziz Pavlus Bazilikası’nın mozaik madalyonlarıdır.</p><ul class="dl cred">'
   +C.map(function(c){return '<li><b>'+esc(c.n)+'</b>: '+esc(c.d)+' · '+esc(c.l)+' · <a href="'+esc(c.u)+'" target="_blank" rel="noopener">kaynak</a></li>'}).join('')+'</ul>';
}
var DOCS={
  hakkinda:function(){var nCh=Object.keys(CH_OF).length;return {t:'Hakkında',lead:D.docs.about,body:'<h2 id="s0">Bu uygulamada</h2><ul class="dl"><li><b>Katekizm:</b> Katolik Kilisesi Katekizmi Özeti’nin 598 sorusu, önsözü, girişi ve ekleriyle.</li><li><b>Azizler:</b> yılın her günü için bir aziz ve en bilinen '+D.saints.length+' azizin hayatı.</li><li><b>Papalar:</b> Petrus’tan XIV. Leo’ya kadar öne çıkan '+POPE_LINE.length+' papa.</li><li><b>Kilise Bul:</b> Türkiye’deki '+nCh+' Katolik kilisenin ayin saatleri, adresleri ve tarihçeleri.</li><li><b>Dualar:</b> Tesbih Duası, Kutsal Ayin ve Günah Çıkarma rehberi.</li><li><b>Öğren ve Tartış:</b> meseller, mucizeler, Neden Katoliğiz?, İslam’a Cevap, Ateizme Cevap.</li></ul>'
      +'<h2 id="s1">Nasıl çalışır?</h2><p>Hesap gerekmez. Kaydettikleriniz, takip ettikleriniz, kaldığınız yerler ve görünüm ayarlarınız yalnızca bu cihazda saklanır; hiçbiri bir sunucuya gönderilmez.</p>'
      +'<h2 id="s2">Kimin?</h2><p>Bu site resmî bir Kilise yayını değildir; kişisel bir girişimdir. Bir hata görürseniz ya da bir öneriniz varsa bize yazın.</p>'
      +'<div class="dbtns"><button type="button" data-go2="doc:kaynaklar">Kaynaklar ve telif</button><button type="button" data-go2="contact">İletişim</button></div>'}},
  kaynaklar:function(){return {t:'Kaynaklar ve Telif',lead:'Sitedeki metinlerin, çevirilerin ve görsellerin kaynakları.',body:mdDoc(D.docs.kaynaklar)+docCredits()}},
  gizlilik:function(){return {t:'Gizlilik Politikası',lead:D.docs.gizlilikSub,body:mdDoc(D.docs.gizlilik)}},
  erisilebilirlik:function(){return {t:'Erişilebilirlik Beyanı',lead:D.docs.erisSub,body:mdDoc(D.docs.erisilebilirlik)}}
};
function vDoc(id){
  var d=DOCS[id]();
  view.innerHTML='<div class="hd c"><button class="l" type="button" data-back aria-label="Geri">'+ic('back')+'</button><h1>katolikdunyasi</h1></div><div class="prog"><i id="pg"></i></div>'
   +'<article class="rd doc"><div style="width:64px;height:64px;margin-top:10px">'+av('ich','gold',64)+'</div><div class="kick" style="color:var(--gold)">Katolik Dünyası</div><h1>'+esc(d.t)+'</h1>'+(d.lead?'<p class="lead">'+esc(d.lead)+'</p>':'')+d.body+'</article>';
  var pg=view.querySelector('#pg');view.onscroll=function(){var max=view.scrollHeight-view.clientHeight;pg.style.width=(max>0?view.scrollTop/max*100:100)+'%'};
}
view.addEventListener('click',function(e){var b=e.target.closest('[data-go2]');if(!b)return;e.stopPropagation();e.preventDefault();var t=b.getAttribute('data-go2');if(t==='contact')return go('contact');if(t.indexOf('doc:')===0)return go('reader',t)},true);
function readerMeta(key){var k=key.split('#')[0];if(k.indexOf('doc:')===0){var d=DOCS[k.slice(4)];return d?{title:d().t,handle:'katolikdunyasi',art:'ich',tone:'gold'}:null}return readerMetaV4(key)}
function vReader(key){var k=key.split('#')[0];if(k.indexOf('doc:')===0){vDoc(k.slice(4));return}vReaderV4(key);readerHero(k)}

/* ----- the profile page of the site itself: İletişim opens the in-app form ----- */
function vMe(){vMeBase();var a=view.querySelector('.btns a.btn-like');if(a){var b=h('<button type="button" data-go2="contact">İletişim</button>');a.replaceWith(b)}}

/* ----- Keşfet: calm and simple. A featured card, portraits, topics, one question, then a quiet feed ----- */
var XCH=['Tümü','Azizler','Papalar','Katekizm','Kiliseler','Dualar','Tartış'],xCh='Tümü',xObs=null;
var XLAB={saint:'Aziz',pope:'Papa',doc:'Papalık belgesi',cq:'Katekizm',quote:'Katekizm’den',chap:'Katekizm',faq:'Soru',church:'Kilise',myst:'Tesbih',num:'Kutsal Ayin',prayer:'Dua',debate:'Tartış',story:'Hikâye',place:'Tarih',stat:'Bir sayı'};
function xTopics(){
  var nCh=Object.keys(CH_OF).length;
  return [['katekizm','Katekizm','598 soru','book'],['kilise','Kilise Bul',nCh+' kilise','church'],['tesbih','Tesbih Duası','4 gizem','beads'],['ayin','Kutsal Ayin',D.mass.parts.length+' bölüm','chalice'],['gunah','Günah Çıkarma',D.gun.steps.length+' adım','keys'],['meseller','Meseller',D.mes.length+' mesel','wheat'],['mucizeler','Mucizeler',D.mir.length+' olay','monstrance'],['neden','Neden Katoliğiz?',D.pages.neden.secs.length+' bölüm','door']];
}
function vExplore(){
  view.innerHTML='<div class="hd" style="padding-bottom:0"><label class="search" style="flex:1;margin:0" for="q">'+ic('search')+'<input id="q" type="search" placeholder="Ara: aziz, papa, soru, kilise…" autocomplete="off" value="'+esc(kxQ)+'"></label></div>'
   +'<div class="chips xchips">'+XCH.map(function(c){return '<button type="button" data-ch="'+c+'" class="'+(c===xCh?'on':'')+'">'+c+'</button>'}).join('')+'</div><div id="exr"></div><div id="xmain"></div>';
  var q=view.querySelector('#q');
  q.addEventListener('input',function(){kxQ=q.value;expQ=q.value;var on=!!kxQ.trim();view.querySelector('#xmain').hidden=on;if(on)drawExplore();else view.querySelector('#exr').innerHTML=''});
  view.querySelectorAll('[data-ch]').forEach(function(b){b.addEventListener('click',function(){xCh=b.getAttribute('data-ch');view.querySelectorAll('[data-ch]').forEach(function(x){x.classList.toggle('on',x===b)});drawX();view.scrollTop=0})});
  drawX();
  if(kxQ.trim()){expQ=kxQ;view.querySelector('#xmain').hidden=true;drawExplore()}
}
function xPortraits(ids,kind){return '<div class="xrow">'+ids.map(function(id){var a=ACC[id],nm=kind==='pope'?a.name.replace(/^Papa\s+/,''):a.name.replace(/^(Aziz|Azize|Havari)\s+/,'');return '<button type="button" class="xpp" data-acc="'+id+'">'+av(a.art,a.tone,66)+'<b>'+esc(nm)+'</b><small>'+esc(kind==='pope'?a.ord+'. papa':(a.saint?a.saint.ep:''))+'</small></button>'}).join('')+'</div>'}
function xHead(t,go){return '<div class="xh"><h3>'+esc(t)+'</h3>'+(go?'<button type="button" data-go="'+go+'">Tümü</button>':'')+'</div>'}
function drawX(){
  var box=view.querySelector('#xmain');if(!box)return;if(xObs){xObs.disconnect();xObs=null}
  var html='';
  if(xCh==='Tümü'){
    var sid=bigOfToday?bigOfToday.id:null,sa=sid?ACC[sid]:null;
    var hp=paintFor('p-today');html+='<button type="button" class="xhero'+(hp?' xpaint pa-'+hp:'')+'" data-go="post:p-today"><span class="xhp">'+(sa?av(sa.art,sa.tone,92):av(tsArt,tsTone,92))+'</span><span class="xht"><small>Bugünün azizi · '+esc(todayLabel)+'</small><b>'+esc(todaySaint.n)+'</b><span>'+esc(cut(todaySaint.t||todaySaint.b,110))+'</span><em>Hayatını oku ›</em></span></button>';
    var popes=POPE_LINE.slice().reverse(),pw=popes.filter(function(id){return isPhoto(ACC[id].art)&&imgSrc(ACC[id].art)});popes=pw.concat(popes.filter(function(id){return pw.indexOf(id)<0}));
    html+=xHead('Papalar','acc:papalar')+xPortraits(popes,'pope');
    html+=xHead('Konular')+'<div class="xtop">'+xTopics().map(function(t){return '<button type="button" class="xt" data-acc="'+t[0]+'"><span class="xti">'+art(t[3])+'</span><span><b>'+esc(t[1])+'</b><small>'+esc(t[2])+'</small></span></button>'}).join('')+'</div>';
    var withImg=D.saints.filter(function(s){return D.saintimg[s.id]}).map(function(s){return s.id}),rest=D.saints.filter(function(s){return !D.saintimg[s.id]}).map(function(s){return s.id});
    html+=xHead('Azizler','acc:azizler')+xPortraits(withImg.concat(rest),'saint');
    var qi=0,all=[];D.sss.forEach(function(c,ci){c.items.forEach(function(x,j){all.push([ci,j])})});var qq=pick(all,5),qx=D.sss[qq[0]].items[qq[1]];
    html+='<div class="xq"><small>Günün sorusu · '+esc(D.sss[qq[0]].t)+'</small><b>'+esc(qx.q)+'</b><div class="xqa" hidden>'+qx.a+'</div><div class="xqb"><button type="button" class="xqt" aria-expanded="false">Cevabı göster</button><button type="button" data-go="chat:'+qq[0]+'#'+qq[1]+'">Sohbette aç ›</button></div></div>';
    html+=xHead('Sizin için');
  }
  html+='<div class="xfeed"><div class="xcol"></div><div class="xcol"></div></div><div class="kxs" id="xs">Yükleniyor…</div>';
  box.innerHTML=html;
  var t=box.querySelector('.xqt');if(t)t.addEventListener('click',function(){var a=box.querySelector('.xqa');a.hidden=!a.hidden;t.textContent=a.hidden?'Cevabı göster':'Cevabı gizle';t.setAttribute('aria-expanded',!a.hidden)});
  xStart();
}
var XF={items:[],pos:0};
function xStart(){
  var T=kxPool(),r=seeded(Y*1000+doy+7),items=[];
  Object.keys(T).forEach(function(k){if(k==='stat')return;T[k].forEach(function(o){if(xCh==='Tümü'||o.cat===xCh||(xCh==='Tartış'&&o.cat==='Tartış'))items.push(o)})});
  // interleave types so the feed stays varied but calm
  var by={};shuffle(items,r).forEach(function(o){(by[o.type]=by[o.type]||[]).push(o)});var keys=Object.keys(by),out=[],more=true;
  while(more){more=false;keys.forEach(function(k){if(by[k].length){out.push(by[k].shift());more=true}})}
  XF.items=out;XF.pos=0;xMore(12);
  xObs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)xMore(10)})},{root:view,rootMargin:'500px'});
  var s=view.querySelector('#xs');if(s)xObs.observe(s);
}
function xCard(o){
  var lab=XLAB[o.type]||'',img='';
  if(o.go&&o.go.indexOf('acc:')===0){var a=ACC[o.go.slice(4)];if(a&&isPhoto(a.art)&&imgSrc(a.art))img='<span class="xci">'+av(a.art,a.tone,54)+'</span>'}
  var t=o.type==='quote'?(/^[“"]/.test(o.t)?cut(o.t,150):'“'+cut(o.t,150)+'”'):cut(o.t,96);
  return '<button type="button" class="xc'+(img?' wimg':'')+(o.type==='quote'?' xquote':'')+'" data-go="'+esc(o.go)+'">'+img+'<span class="xk">'+esc(lab)+'</span><b class="xtt">'+esc(t)+'</b>'+(o.s?'<span class="xs">'+esc(o.s)+'</span>':'')+'</button>';
}
function xMore(n){
  var cols=view.querySelectorAll('.xcol');if(!cols.length)return;
  for(var i=0;i<n&&XF.pos<XF.items.length;i++){var c=cols[0].offsetHeight<=cols[1].offsetHeight?cols[0]:cols[1];c.insertAdjacentHTML('beforeend',xCard(XF.items[XF.pos++]))}
  if(XF.pos>=XF.items.length){var s=view.querySelector('#xs');if(s)s.textContent='Hepsi bu kadar.';if(xObs)xObs.disconnect()}
}

/* ----- router: the new views and the cleanup between them ----- */
function render(name,arg){
  view.onscroll=null;stopSpeech();
  if(typeof chatObs!=='undefined'&&chatObs){chatObs.disconnect();chatObs=null}
  detachScrubber();if(kxObs){kxObs.disconnect();kxObs=null}if(xObs){xObs.disconnect();xObs=null}
  var fn={settings:vSettings,history:vHistory,inbox:vInbox,chat:vChat,contact:vContact,kilisetab:function(){vProfile('kilise')},home:vHome,explore:vExplore,katekizm:vKatekizm,reels:vReels,me:vMe,notif:vNotif,profile:vProfile,post:vPost,reader:vReader,coll:vColl,church:vChurch}[name];
  view.innerHTML='';fn(arg);
}

/* ----- painted posts and stories: Caravaggio's scenes behind large modern type ----- */
var PAINT={'p-today':'05franc','p-cq':'43jerome','p-myst':'58rosar','p-gunah':'12magda','p-ayin':'35emmau','p-islam':'26conta','p-ateizm':'34thomas','p-neden':'28ceras','p-topraklar':'29ceras','p-surec':'23conta','p-tesbihtarihi':'42loreto'};
var SPAINT={bugun:'13fligh',katekizm:'43jerome',azizler:'05franc',tesbih:'58rosar',gunah:'12magda',ayin:'35emmau',islam:'26conta',ateizm:'34thomas',neden:'28ceras',topraklar:'29ceras',surec:'23conta',tesbihtarihi:'42loreto',meseller:'53mercy',mucizeler:'65lazar',sss:'23conta'};
function paintFor(pid){if(!D.carav)return null;if(PAINT[pid])return PAINT[pid];if(pid.indexOf('p-mes-')===0)return '53mercy';if(pid.indexOf('p-mir-')===0)return '65lazar';return null}
function storyPaint(id){if(!D.carav)return null;if(id.indexOf('q:')===0)return '43jerome';return SPAINT[id]||null}
(function(){if(!D.carav)return;var css=Object.keys(D.carav).map(function(k){return '.app .pa-'+k+'{background-image:url('+D.carav[k]+')}'}).join('');var st=document.createElement('style');st.textContent=css;document.head.appendChild(st)})();
function UP(s){return String(s||'').toLocaleUpperCase('tr')}
function ttSize(t){var n=String(t).length;return n>48?'xs':n>32?'s':n>18?'m':'l'}
function paintedSlide(s,i,k,p){
  if(s.type==='cover')return '<div class="sl pt pa-'+k+'"><div class="ptg"></div><div class="ptc"><span class="ptk">'+esc(s.kick||'')+'</span><h2 class="ptt '+ttSize(s.title)+'">'+esc(UP(s.title))+'</h2>'+(s.sub?'<span class="pts">'+esc(s.sub)+'</span>':'')+'</div><span class="ptb">katolikdunyasi.com</span></div>';
  return '<div class="sl pt tx pa-'+k+'"><div class="ptd"></div><div class="ptc">'+(s.n!==''&&s.n!=null?'<span class="ptn">'+esc(s.n)+'</span>':'')+(s.title?'<h3 class="ptt2">'+esc(UP(s.title))+'</h3>':'')+'<p class="ptp">'+esc(s.text)+'</p></div><span class="ptb">katolikdunyasi.com</span></div>';
}
var postHTML0=postHTML;
postHTML=function(p){
  var k=paintFor(p.id),html=postHTML0(p);if(!k)return html;
  var a=html.indexOf('<div class="car">')+17,b=html.indexOf('</div></div><div class="act">');
  return html.slice(0,a)+p.slides.map(function(s,i){return paintedSlide(s,i,k,p)}).join('')+html.slice(b);
};
var CARAV_CRED=[['43jerome','Yazı Yazan Aziz Hieronymus','Galleria Borghese, Roma','07/43jerome'],['05franc','Esrime Dalmış Aziz Fransuva','Wadsworth Atheneum, Hartford','01/05franc'],['58rosar','Tesbih Meryemi','Kunsthistorisches Museum, Viyana','09/58rosar'],['12magda','Tövbekâr Mecdelli Meryem','Galleria Doria Pamphilj, Roma','02/12magda'],['35emmau','Emmaus’ta Akşam Yemeği','National Gallery, Londra','06/35emmau'],['26conta','Aziz Matta’nın İlhamı','San Luigi dei Francesi, Roma','04/26conta'],['34thomas','Kuşkucu Tomas','Sanssouci, Potsdam','06/34thomas'],['28ceras','Aziz Petrus’un Çarmıha Gerilişi','Santa Maria del Popolo, Roma','05/28ceras'],['29ceras','Şam Yolunda Pavlus’un Dönüşü','Santa Maria del Popolo, Roma','05/29ceras'],['23conta','Aziz Matta’nın Çağrılışı','San Luigi dei Francesi, Roma','04/23conta'],['42loreto','Loreto Meryemi','Sant’Agostino, Roma','07/42loreto'],['53mercy','Yedi Merhamet İşi','Pio Monte della Misericordia, Napoli','09/53mercy'],['65lazar','Lazar’ın Dirilişi','Museo Regionale, Messina','10/65lazar'],['13fligh','Mısır’a Kaçışta Mola','Galleria Doria Pamphilj, Roma','02/13fligh']];
var docCreditsBase=docCredits;
docCredits=function(){return docCreditsBase()+'<h2 id="scarav">Akıştaki tablolar</h2><p>Ana sayfadaki ve hikâyelerdeki sahneler Caravaggio’nun (1571-1610) tablolarıdır; eserler kamu malıdır. Görüntüler Web Gallery of Art’tan alınmıştır.</p><ul class="dl cred">'+CARAV_CRED.map(function(c){return '<li><b>'+esc(c[1])+'</b>: '+esc(c[2])+' · Kamu malı · <a href="https://www.wga.hu/html/c/caravagg/'+c[3].split('/')[0]+'/index.html" target="_blank" rel="noopener">kaynak</a></li>'}).join('')+'</ul>'};

/* ----- more paintings, each chosen for its subject ----- */
var SAINT_PAINT={'meryem-ana':'48palaf','aziz-yusuf':'13fligh','havari-petrus':'28ceras','havari-pavlus':'29ceras','vaftizci-yahya':'40baptis','havari-yuhanna':'37depos','aziz-hieronymus':'43jerome','assisili-aziz-francis':'49franci','padre-pio':'05franc'};
var SAINT_STORY={'meryem-ana':'66annunc','vaftizci-yahya':'62behead','assisili-aziz-francis':'05franc','padre-pio':'49franci'};
var SET_PAINT={sevinc:'66annunc',isik:'47emmau',aci:'55flagel',yucelik:'45death'};
var MES_PAINT={'Hükümdarlık Meselleri':'67sheph','Merhamet ve Bağışlama Meselleri':'53mercy','Sorumluluk ve Yönetim Meselleri':'23conta','Uyanıklık, Hazırlık ve Bilgelik Meselleri':'72denial','Hükümdarlığa Çağrı ve Hesap Verme Meselleri':'191captu','Dua ve Sebat Meselleri':'49franci'};
var MIR_PAINT={'Meryem Ana’nın Görünmeleri':'42loreto','Kutsal Kalıntılar ve Nesneler':'37depos','Efkaristiya Mucizeleri':'47emmau','Çürümeyen Azizler':'64lucy'};
var PART_PAINT=['43jerome','47emmau','53mercy','49franci'];
var POPE_PAINT={'papa-urbanus-8':'22barber'};
function hasP(k){return k&&D.carav&&D.carav[k]?k:null}
function mesPaint(id){var m=D.mes.filter(function(x){return x.id===id})[0];return m?MES_PAINT[m.cat]:null}
function mirPaint(id){if(id==='padre-pio')return '05franc';var m=D.mir.filter(function(x){return x.id===id})[0];return m?MIR_PAINT[m.cat]:null}
var PAINT={'p-cq':'43jerome','p-gunah':'12magda','p-ayin':'35emmau','p-islam':'26conta','p-ateizm':'34thomas','p-neden':'28ceras','p-topraklar':'29ceras','p-surec':'23conta','p-tesbihtarihi':'42loreto'};
function paintFor(pid){
  if(!D.carav||!pid)return null;
  if(pid==='p-today')return hasP(bigOfToday&&SAINT_PAINT[bigOfToday.id])||'05franc';
  if(pid==='p-myst')return hasP(SET_PAINT[todaySet.id])||'58rosar';
  if(pid==='p-cq')return hasP(PART_PAINT[CPART[STORY_QS[0]]])||'43jerome';
  if(PAINT[pid])return hasP(PAINT[pid]);
  if(pid.indexOf('p-mes-')===0)return hasP(mesPaint(pid.slice(6)))||'53mercy';
  if(pid.indexOf('p-mir-')===0)return hasP(mirPaint(pid.slice(6)))||'65lazar';
  var id=pid.slice(2);return hasP(SAINT_PAINT[id])||hasP(POPE_PAINT[id]);
}
var SPAINT={bugun:'13fligh',katekizm:'43jerome',azizler:'05franc',tesbih:'58rosar',gunah:'72denial',ayin:'47emmau',islam:'46ecceho',ateizm:'34thomas',neden:'28ceras',topraklar:'33isaac',surec:'23conta',tesbihtarihi:'42loreto',meseller:'53mercy',mucizeler:'65lazar',sss:'23conta',papalar:'28ceras'};
function storyPaint(id){
  if(!D.carav)return null;
  if(id.indexOf('q:')===0)return hasP(PART_PAINT[CPART[+id.slice(2)]])||'43jerome';
  if(id==='tesbih')return hasP(SET_PAINT[todaySet.id])||'58rosar';
  return hasP(SPAINT[id])||hasP(SAINT_STORY[id])||hasP(SAINT_PAINT[id])||hasP(POPE_PAINT[id]);
}
function paintSlides(id,S){
  if(id==='bugun'){var sp=hasP(bigOfToday&&SAINT_PAINT[bigOfToday.id])||'05franc';S.forEach(function(s,i){
    var b=s.btn&&s.btn[1]||'';
    s.pa=i===0?'13fligh':b.indexOf('read:saint:')===0||b==='read:today'?sp:b==='rosary'?(hasP(SET_PAINT[todaySet.id])||'58rosar'):b.indexOf('post:p-mes-')===0?(hasP(mesPaint(b.slice(11)))||'53mercy'):null})}
  if(id==='mucizeler'||id==='meseller')S.forEach(function(s){var b=s.btn&&s.btn[1]||'';if(b.indexOf('post:p-mes-')===0)s.pa=hasP(mesPaint(b.slice(11)));if(b.indexOf('post:p-mir-')===0)s.pa=hasP(mirPaint(b.slice(11)))});
}
var PAINT_NAME={'05franc':'Esrime Dalmış Aziz Fransuva','12magda':'Tövbekâr Mecdelli Meryem','13fligh':'Mısır’a Kaçışta Mola','23conta':'Aziz Matta’nın Çağrılışı','26conta':'Aziz Matta’nın İlhamı','28ceras':'Aziz Petrus’un Çarmıha Gerilişi','29ceras':'Şam Yolunda Pavlus’un Dönüşü','34thomas':'Kuşkucu Tomas','35emmau':'Emmaus’ta Akşam Yemeği','42loreto':'Loreto Meryemi','43jerome':'Yazı Yazan Aziz Hieronymus','53mercy':'Yedi Merhamet İşi','58rosar':'Tesbih Meryemi','65lazar':'Lazar’ın Dirilişi','191captu':'İsa’nın Tutuklanması','22barber':'Maffeo Barberini’nin Portresi','33isaac':'İshak’ın Kurban Edilmesi','37depos':'Mezara Konuluş','40baptis':'Vaftizci Yahya','45death':'Meryem’in Ölümü','46ecceho':'Ecce Homo','47emmau':'Emmaus’ta Akşam Yemeği (Milano)','48palaf':'Palafrenieri Meryemi','49franci':'Tefekkür Eden Aziz Fransuva','55flagel':'Kırbaçlanma','62behead':'Vaftizci Yahya’nın Başının Kesilişi','64lucy':'Azize Lucia’nın Defni','66annunc':'Müjde','67sheph':'Çobanların Tapınması','72denial':'Petrus’un İnkârı'};
function readerPaint(k){
  if(k.indexOf('comp:')===0)return hasP(PART_PAINT[+k.slice(5)]);
  if(k.indexOf('cx:')===0)return '43jerome';
  if(k.indexOf('saint:')===0)return hasP(SAINT_PAINT[k.slice(6)]);
  if(k.indexOf('pope:')===0)return hasP(POPE_PAINT[k.slice(5)]);
  var M={gunah:'72denial',mass:'35emmau',islam:'26conta',ateizm:'34thomas','page:neden':'28ceras','page:topraklar':'29ceras','page:surec':'23conta','page:tesbihtarihi':'42loreto',today:paintFor('p-today')};
  return hasP(M[k]);
}
function readerHero(k){
  var pk=readerPaint(k),rd=view.querySelector('.rd');if(!pk||!rd)return;
  var first=rd.firstElementChild;if(!first||first.tagName!=='DIV'||!first.querySelector('.av'))return;
  first.replaceWith(h('<figure class="rhero pa-'+pk+'"><figcaption>Caravaggio · '+esc(PAINT_NAME[pk]||'')+'</figcaption></figure>'));
}
/* credits for every painting in use */
docCredits=function(){var used={};Object.keys(D.carav||{}).forEach(function(k){used[k]=1});var MUS={'05franc':'Wadsworth Atheneum, Hartford','12magda':'Galleria Doria Pamphilj, Roma','13fligh':'Galleria Doria Pamphilj, Roma','23conta':'San Luigi dei Francesi, Roma','26conta':'San Luigi dei Francesi, Roma','28ceras':'Santa Maria del Popolo, Roma','29ceras':'Santa Maria del Popolo, Roma','34thomas':'Sanssouci, Potsdam','35emmau':'National Gallery, Londra','42loreto':'Sant’Agostino, Roma','43jerome':'Galleria Borghese, Roma','53mercy':'Pio Monte della Misericordia, Napoli','58rosar':'Kunsthistorisches Museum, Viyana','65lazar':'Museo Regionale, Messina','191captu':'National Gallery of Ireland, Dublin','22barber':'Özel koleksiyon','33isaac':'Uffizi, Floransa','37depos':'Vatikan Pinakotekası','40baptis':'Galleria Corsini, Roma','45death':'Louvre, Paris','46ecceho':'Palazzo Bianco, Cenova','47emmau':'Pinacoteca di Brera, Milano','48palaf':'Galleria Borghese, Roma','49franci':'Museo Civico, Cremona','55flagel':'Museo di Capodimonte, Napoli','62behead':'Valletta Katedrali, Malta','64lucy':'Santa Lucia alla Badia, Siraküza','66annunc':'Musée des Beaux-Arts, Nancy','67sheph':'Museo Regionale, Messina','72denial':'Metropolitan Museum of Art, New York'};
  return docCreditsBase()+'<h2 id="scarav">Tablolar</h2><p>Ana sayfadaki, hikâyelerdeki ve yazıların başındaki sahneler Caravaggio’nun (1571-1610) ve atölyesinin tablolarıdır; eserler kamu malıdır. Görüntüler Web Gallery of Art’tan alınmıştır.</p><ul class="dl cred">'+Object.keys(used).map(function(k){return '<li><b>'+esc(PAINT_NAME[k]||k)+'</b>: '+esc(MUS[k]||'')+' · Kamu malı · <a href="https://www.wga.hu/html/c/caravagg/index.html" target="_blank" rel="noopener">kaynak</a></li>'}).join('')+'</ul>'};

/* ----- swipe back: drag the page to the right, the previous page is underneath ----- */
(function(){
  var sx=0,sy=0,dx=0,mode=null,edge=false;
  function blocked(t){return document.querySelector('.ov,.sheet,.glass')||stack.length<2}
  view.addEventListener('touchstart',function(e){
    if(e.touches.length!==1||blocked()){mode='off';return}
    var t=e.touches[0],x=t.clientX-app.getBoundingClientRect().left;
    edge=x<30;sx=t.clientX;sy=t.clientY;dx=0;
    mode=(!edge&&e.target.closest('.car,.xrow,.hls,.mrow,.chips,.stories,.scrub,.seg,input,textarea'))?'off':null;
  },{passive:true});
  view.addEventListener('touchmove',function(e){
    if(mode==='off')return;var t=e.touches[0],ddx=t.clientX-sx,ddy=t.clientY-sy;
    if(mode===null){if(Math.abs(ddx)<10&&Math.abs(ddy)<10)return;mode=(ddx>0&&Math.abs(ddx)>Math.abs(ddy)*1.4)?'swipe':'off';if(mode==='swipe'){view.style.transition='none';app.classList.add('swiping')}}
    if(mode==='swipe'){dx=Math.max(0,ddx);view.style.transform='translateX('+dx+'px)'}
  },{passive:true});
  function end(){
    if(mode!=='swipe'){mode=null;return}mode=null;
    var w=view.clientWidth;view.style.transition='transform .2s ease-out';
    if(dx>Math.min(110,w*0.3)){view.style.transform='translateX('+w+'px)';setTimeout(function(){view.style.transition='none';view.style.transform='';app.classList.remove('swiping');back()},190)}
    else{view.style.transform='';setTimeout(function(){app.classList.remove('swiping')},200)}
  }
  view.addEventListener('touchend',end);view.addEventListener('touchcancel',end);
})();
/* a few more painted posts in the daily feed */
(function(){var extra=['p-surec','p-topraklar','p-tesbihtarihi',pick(D.mes.map(function(m){return 'p-mes-'+m.id}),9),pick(D.mir.map(function(m){return 'p-mir-'+m.id}),5)];
  extra.forEach(function(id,i){if(POSTS[id]&&FEED.indexOf(id)<0)FEED.splice(Math.min(FEED.length,3+i*3),0,id)})})();
