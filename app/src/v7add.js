/* ================= version 7: gestures, sheets, voice, sharing, Katekizm, paintings ================= */
/* NOTE: every override in this file is an assignment, never a function declaration:
   earlier layers keep references like "var vReader6=vReader", and a hoisted declaration
   here would replace what they captured. */

/* ----- small helpers ----- */
function vib(n){try{if(navigator.vibrate&&!PREFS.motion)navigator.vibrate(n||8)}catch(e){}}
function dimOf(s){var p=s.previousElementSibling;return p&&p.classList.contains('dim')?p:null}
function closeSheet(s){var d=dimOf(s);if(d)d.click();else s.remove()}
var PAINT_KEYS=Object.keys(PAINT_NAME).filter(function(k){return D.carav&&D.carav[k]});
function hashStr(s){var x=0;s=String(s);for(var i=0;i<s.length;i++)x=(x*31+s.charCodeAt(i))|0;return Math.abs(x)}

/* ----- the router: no back arrow on a tab's first screen; new views ----- */
var render6=render,NAVSTOP=false,qObs=null;
render=function(name,arg){
  if(qObs){qObs.disconnect();qObs=null}
  NAVSTOP=true;try{
    if(name==='kpart'){view.onscroll=null;detachScrubber();view.innerHTML='';vKPart(+arg)}
    else render6(name,arg);
  }finally{NAVSTOP=false}
  if(stack.length<2)view.querySelectorAll('.hd [data-back]').forEach(function(b){b.style.visibility='hidden';b.setAttribute('aria-hidden','true');b.tabIndex=-1});
  if(name==='settings')addVoiceRow();
  syncPlayer();
};
var openTarget6=openTarget;
openTarget=function(t){if(String(t).indexOf('kpart:')===0)return go('kpart',t.slice(6));if(t==='kq:random')return openRandomQ();return openTarget6(t)};
var closeOverlays6=closeOverlays;
closeOverlays=function(){NAVSTOP=true;try{closeOverlays6()}finally{NAVSTOP=false}};

/* ----- crosses instead of check marks next to names (the mark itself is drawn in CSS) ----- */

/* ----- sheets: drag the top bar (or the list when it is at the top) down to close ----- */
(function(){
  var sh=null,sc=null,sy=0,dy=0,t0=0,mode=null;
  function start(e){
    var s=e.target.closest('.sheet');if(!s||e.touches.length!==1){sh=null;return}
    var y=e.touches[0].clientY,top=s.getBoundingClientRect().top,handle=(y-top<52)||!!e.target.closest('.gb,h4');
    sc=e.target.closest('.sc,.cmlist');
    if(!handle&&(e.target.closest('input,textarea,.seg,.car,.xrow')||(sc&&sc.scrollTop>0))){sh=null;return}
    sh=s;sy=y;dy=0;t0=Date.now();mode=handle?'drag':null;
  }
  function move(e){
    if(!sh)return;var d=e.touches[0].clientY-sy;
    if(mode===null){if(Math.abs(d)<8)return;if(d<0||(sc&&sc.scrollTop>0)){sh=null;return}mode='drag';sy+=8;d-=8}
    if(mode!=='drag')return;
    if(e.cancelable)e.preventDefault();
    dy=Math.max(0,d);sh.style.transition='none';sh.style.transform='translateY('+dy+'px)';
    var dm=dimOf(sh);if(dm){dm.style.transition='none';dm.style.opacity=String(Math.max(0.15,1-dy/420))}
  }
  function end(){
    if(!sh)return;var s=sh;sh=null;if(mode!=='drag'){mode=null;return}mode=null;
    var v=dy/Math.max(1,Date.now()-t0),dm=dimOf(s);
    if(dy>110||(v>0.55&&dy>36)){s.style.transition='transform .2s ease-in';s.style.transform='translateY(105%)';if(dm){dm.style.transition='opacity .2s';dm.style.opacity='0'}setTimeout(function(){closeSheet(s)},190)}
    else{s.style.transition='transform .28s cubic-bezier(.2,.9,.3,1.15)';s.style.transform='';if(dm){dm.style.transition='opacity .2s';dm.style.opacity=''}}
  }
  app.addEventListener('touchstart',start,{passive:true});
  app.addEventListener('touchmove',move,{passive:false});
  app.addEventListener('touchend',end);app.addEventListener('touchcancel',end);
  // with a mouse: drag the bar, or click it
  app.addEventListener('pointerdown',function(e){
    if(e.pointerType==='touch')return;var g=e.target.closest('.sheet .gb');if(!g)return;
    var s=g.closest('.sheet'),y0=e.clientY,d=0;
    function mv(ev){d=Math.max(0,ev.clientY-y0);s.style.transition='none';s.style.transform='translateY('+d+'px)'}
    function up(){document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up);if(d>90||d<4){closeSheet(s)}else{s.style.transition='transform .25s';s.style.transform=''}}
    document.addEventListener('pointermove',mv);document.addEventListener('pointerup',up);
  });
  // the bar is also a button for keyboards and screen readers
  new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){
    if(n.nodeType!==1||!n.classList||!n.classList.contains('sheet'))return;var g=n.querySelector('.gb');if(!g)return;
    g.setAttribute('role','button');g.setAttribute('tabindex','0');g.setAttribute('aria-label','Kapat (aşağı kaydırın)');
    g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();closeSheet(n)}});
  })})}).observe(app,{childList:true});
})();

/* ----- stories: painted circles on the home screen ----- */
var RINGMAP={};
var Q_POOL=[['43jerome','66annunc','13fligh','46ecceho','37depos','65lazar','34thomas'],['47emmau','40baptis','35emmau','12magda','72denial','64lucy'],['53mercy','23conta','33isaac','191captu','26conta'],['49franci','05franc','58rosar','42loreto','48palaf']];
function ringPaint(id,used){
  var a=ACC[id],c=[];
  if(a&&a.church)return null;
  if(id==='bugun')c.push(paintFor('p-today'),'13fligh');
  else if(id.indexOf('q:')===0){var n=+id.slice(2),P=Q_POOL[CPART[n]]||PAINT_KEYS;for(var i=0;i<P.length;i++)c.push(P[(n+i)%P.length])}
  else{c.push(SAINT_STORY[id],SAINT_PAINT[id],SPAINT[id],storyPaint(id),POPE_PAINT[id]);if(a&&(a.ord||isPhoto(a.art))&&!c.filter(Boolean).length)return null}
  var h0=hashStr(id);for(var j=0;j<PAINT_KEYS.length;j++)c.push(PAINT_KEYS[(h0+j)%PAINT_KEYS.length]);
  c=c.filter(function(k){return k&&D.carav&&D.carav[k]});
  for(var k=0;k<c.length;k++)if(!used[c[k]])return c[k];
  return c[0]||null;
}
function buildRingMap(){var used={},m={};storyOrder().forEach(function(id){var p=ringPaint(id,used);if(p){m[id]=p;used[p]=1}});RINGMAP=m}
stoHTML=function(id){
  var s=isSeen(id),pk=RINGMAP[id],a=id.indexOf('q:')===0?null:ACC[id];
  var lab=id==='bugun'?'Bugün':id.indexOf('q:')===0?'Soru '+id.slice(2):a.handle;
  var inner;
  if(pk)inner='<span class="av rpaint pa-'+pk+'"></span>';
  else if(a&&a.church&&chImg(a.church.id))inner='<span class="av rpaint" style="background-image:url('+chImg(a.church.id)+')"></span>';
  else return stoHTMLBase(id);
  return '<button type="button" class="sto'+(s?' seen':'')+'" data-story="'+id+'" aria-label="'+esc(lab)+' hikâyesi'+(s?' (görüldü)':'')+'"><span class="ring'+(s?' seen':'')+'" style="width:70px;height:70px"><span class="in">'+inner+'</span></span><span>'+esc(lab)+'</span></button>';
};
function stoHTMLBase(id){
  var s=isSeen(id);
  if(id.indexOf('q:')===0){var n=+id.slice(2),pi=CPART[n];return '<button type="button" class="sto cq'+(s?' seen':'')+'" data-story="'+id+'"><span class="ring'+(s?' seen':'')+'" style="width:70px;height:70px"><span class="in"><span class="av" style="background:'+tone(PART_TONE[pi])[0]+';color:'+tone(PART_TONE[pi])[1]+'">'+art(PART_ART[pi])+'</span></span></span><span>Soru '+n+'</span></button>'}
  var a=ACC[id];return '<button type="button" class="sto'+(s?' seen':'')+'" data-story="'+id+'">'+ringAv(a,70)+'<span>'+esc(id==='bugun'?'Bugün':a.handle)+'</span></button>';
}
var vHome6=vHome;
vHome=function(){buildRingMap();vHome6()};
// stories open on the same painting as their circle
var storyPaint6=storyPaint;
storyPaint=function(id){var a=ACC[id];if(a&&a.church&&chImg(a.church.id))return 'ch:'+a.church.id;return storyPaint6(id)||RINGMAP[id]||null};

/* ----- the story viewer, with the gestures people know:
   tap right/left: next/previous, hold: pause and hide the controls,
   swipe left/right: next/previous account, swipe down: close, swipe up: open the link ----- */
playStory=function(seq,si,dir){
  var cur=seq[si],a=storyAcc(cur.id),i=0,timer=null,t0=0,elapsed=0,DUR=6500,paused=false,gone=false;
  var el=h('<div class="ov story'+(dir?' enter'+dir:'')+'" role="dialog" aria-label="'+esc(a.name)+' hikâyesi"><div class="bg"></div><div class="scrim"></div><div class="bars">'+cur.slides.map(function(){return '<i><b></b></i>'}).join('')+'</div><div class="sh">'+(RINGMAP[cur.id]?'<span class="av rpaint pa-'+RINGMAP[cur.id]+'" style="width:32px;height:32px"></span>':av(a.art,a.tone,32))+'<b>'+esc(a.handle)+'</b><small class="ix"></small><button type="button" class="x" aria-label="Kapat">'+ic('x')+'</button></div><div class="tapl"></div><div class="tapr"></div><button type="button" class="snav sprev" aria-label="Önceki">'+ic('back')+'</button><button type="button" class="snav snext" aria-label="Sonraki">'+ic('chevr')+'</button><div class="sbody"></div><div class="sfoot"><button type="button" class="in">Soru sor…</button><button type="button" class="lk" aria-label="Beğen">'+ic('heart')+'</button><button type="button" class="shr" aria-label="Paylaş">'+ic('send')+'</button></div></div>');
  app.appendChild(el);markSeen(cur.id);
  var bars=el.querySelectorAll('.bars b'),body=el.querySelector('.sbody'),bg=el.querySelector('.bg');var up={style:{}};
  function show(){
    var s=cur.slides[i],c=tone(s.tone),pk=s.pa||storyPaint(cur.id);DUR=storyDur(s);
    el.querySelector('.ix').textContent=(i+1)+'/'+cur.slides.length;
    if(pk){el.classList.add('pstory');
      if(pk.indexOf('ch:')===0){bg.className='bg'+(i?' pdim':'');bg.style.background='';bg.style.backgroundImage='url('+chImg(pk.slice(3))+')';bg.style.backgroundSize='cover';bg.style.backgroundPosition='center'}
      else{bg.style.background='';bg.style.backgroundImage='';bg.className='bg pa-'+pk+(i?' pdim':'')}
      body.style.color='#fff';
      body.innerHTML=(s.kick?'<div class="psk">'+esc(s.kick)+'</div>':'')+(s.title?'<h2 class="pst '+ttSize(s.title)+'">'+esc(UP(s.title))+'</h2>':'')+(s.text?'<p class="psp'+(s.title?'':' pbig')+'">'+esc(s.text)+'</p>':'')+(s.q?'<p class="psq">'+esc(s.q)+'</p>':'')+(s.stk?'<span class="stk" style="color:#111">📖 '+esc(s.stk)+'</span>':'')+(s.list?storyList(s.list):'')+(s.btn?'<button type="button" class="slink pl" data-act="'+esc(s.btn[1])+'">'+esc(s.btn[0])+' ›</button>':'');fitStory(body);
    } else {
      el.classList.remove('pstory');bg.className='bg';bg.style.backgroundImage='';
      bg.style.background='linear-gradient(172deg,'+c[0]+' 0%,#ffffff 78%)';body.style.color=c[1];
      body.innerHTML=(isPhoto(s.art)&&imgSrc(s.art)?'<span class="sport">'+art(s.art)+'</span>':art(s.art,'big'))+(s.kick?'<div class="kick">'+esc(s.kick)+'</div>':'')+(s.title?'<h2 style="color:#111">'+esc(s.title)+'</h2>':'')+(s.text?'<p style="white-space:pre-line;color:#222">'+esc(s.text)+'</p>':'')+(s.q?'<p class="q" style="color:#111">'+esc(s.q)+'</p>':'')+(s.stk?'<span class="stk" style="color:#111">📖 '+esc(s.stk)+'</span>':'')+(s.btn?'<button type="button" class="slink" data-act="'+esc(s.btn[1])+'">'+esc(s.btn[0])+' ›</button>':'');
    }
    bars.forEach(function(b,j){b.style.transition='none';b.style.width=j<i?'100%':'0%'});elapsed=0;paused=false;run();
  }
  function run(){clearTimeout(timer);var b=bars[i],rest=DUR-elapsed;if(STORY_MANUAL){b.style.transition='none';b.style.width='100%';return}t0=Date.now();requestAnimationFrame(function(){b.style.transition='width '+rest+'ms linear';b.style.width='100%'});timer=setTimeout(next,rest)}
  function pause(){if(paused)return;paused=true;clearTimeout(timer);elapsed+=Date.now()-t0;var b=bars[i],w=getComputedStyle(b).width;b.style.transition='none';b.style.width=w}
  function resume(){if(!paused||gone)return;paused=false;run()}
  function next(){if(i<cur.slides.length-1){i++;show()}else nextAcc()}
  function prev(){if(i>0){i--;show()}else prevAcc()}
  function nextAcc(){if(si<seq.length-1){close(true);playStory(seq,si+1,'R')}else close()}
  function prevAcc(){if(si>0){close(true);playStory(seq,si-1,'L')}else{i=0;show()}}
  function close(keep){if(gone)return;gone=true;clearTimeout(timer);document.removeEventListener('keydown',key);
    if(keep){el.remove();return}
    el.classList.add('leaving');setTimeout(function(){el.remove()},200);
    var top=stack[stack.length-1];if(top&&top.name==='home'){var st=view.scrollTop;vHome();view.scrollTop=st}}
  function key(e){if(e.key==='Escape')close();if(e.key==='ArrowRight')next();if(e.key==='ArrowLeft')prev();if(e.key===' '){e.preventDefault();paused?resume():pause()}}
  document.addEventListener('keydown',key);
  // touch: one handler for tap, hold and the four swipes
  var sx=0,sy2=0,mode=null,downAt=0,holdT=null,moved=false;
  el.addEventListener('pointerdown',function(e){
    if(e.target.closest('button,a,.sfoot'))return;
    sx=e.clientX;sy2=e.clientY;mode=null;moved=false;downAt=Date.now();pause();
    holdT=setTimeout(function(){if(!moved)el.classList.add('hold')},220);
    try{el.setPointerCapture(e.pointerId)}catch(x){}
  });
  el.addEventListener('pointermove',function(e){
    if(!downAt)return;var dx=e.clientX-sx,dy=e.clientY-sy2;
    if(!mode){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;moved=true;clearTimeout(holdT);el.classList.remove('hold');mode=Math.abs(dx)>Math.abs(dy)?'x':(dy>0?'down':'up')}
    el.style.transition='none';
    if(mode==='x'){var lim=(dx<0&&si>=seq.length-1)||(dx>0&&si<=0)?0.25:1;el.style.transform='translateX('+dx*lim+'px) rotateY('+(-dx/16*lim)+'deg)';el.style.transformOrigin=dx<0?'right center':'left center'}
    else if(mode==='down'){var d=Math.max(0,dy);el.style.transform='translateY('+d+'px) scale('+Math.max(.8,1-d/1400)+')';el.style.borderRadius=Math.min(24,d/6)+'px';el.style.opacity=String(Math.max(.5,1-d/900))}
    else{var u=Math.min(0,dy);up.style.transform='translateY('+(u/3)+'px)';body.style.transform='translateY('+(u/5)+'px)'}
  });
  function release(e){
    if(!downAt)return;var dx=e.clientX-sx,dy=e.clientY-sy2,held=Date.now()-downAt>350;downAt=0;clearTimeout(holdT);el.classList.remove('hold');
    el.style.transition='transform .22s ease, opacity .22s, border-radius .22s';up.style.transform='';body.style.transform='';
    if(mode==='x'){if(Math.abs(dx)>70){el.style.transform='';dx<0?nextAcc():prevAcc();return}el.style.transform='';resume();return}
    if(mode==='down'){if(dy>110){close();return}el.style.transform='';el.style.borderRadius='';el.style.opacity='';resume();return}
    if(mode==='up'){var s=cur.slides[i];if(dy<-70&&s.btn){close();openTarget(s.btn[1]);return}if(dy<-70){openAsk();return}resume();return}
    if(held){resume();return}
    var r=el.getBoundingClientRect();(e.clientX-r.left<r.width*0.3)?prev():next();
  }
  el.addEventListener('pointerup',release);
  el.addEventListener('pointercancel',function(){downAt=0;clearTimeout(holdT);el.classList.remove('hold');el.style.transform='';resume()});
  function openAsk(){pause();var pid=cur.id.indexOf('q:')===0?'p-cq':(postOf(cur.id)||{}).id;openPostComments(pid||{acc:cur.id},resume)}
  el.querySelector('.sprev').addEventListener('click',function(e){e.stopPropagation();prev()});el.querySelector('.snext').addEventListener('click',function(e){e.stopPropagation();next()});
  el.querySelector('.x').addEventListener('click',function(){close()});
  el.querySelector('.shr').addEventListener('click',function(){pause();var s=cur.slides[i];shareOpts({path:a.url||'',title:s.title||a.name,card:{slide:s,acc:a,paint:s.pa||storyPaint(cur.id),url:a.url||''},onClose:resume})});
  el.querySelector('.lk').addEventListener('click',function(e){e.currentTarget.classList.toggle('liked');vib(6)});
  el.querySelector('.in').addEventListener('click',openAsk);
  body.addEventListener('click',function(e){var b=e.target.closest('[data-act]');if(!b)return;var act=b.getAttribute('data-act');close();openTarget(act)});
  el.addEventListener('animationend',function(){el.classList.remove('enterL','enterR')});
  show();
};

/* ----- pinch to zoom a post's picture; it springs back when you let go ----- */
(function(){
  var z=null;
  function dist(t){var dx=t[0].clientX-t[1].clientX,dy=t[0].clientY-t[1].clientY;return Math.sqrt(dx*dx+dy*dy)}
  function mid(t){return {x:(t[0].clientX+t[1].clientX)/2,y:(t[0].clientY+t[1].clientY)/2}}
  view.addEventListener('touchstart',function(e){
    if(e.touches.length!==2||z)return;var w=e.target.closest('.wrapc');if(!w)return;
    var car=w.querySelector('.car'),ix=Math.round(car.scrollLeft/Math.max(1,car.clientWidth)),sl=car.children[ix];if(!sl)return;
    var r=sl.getBoundingClientRect(),ar=app.getBoundingClientRect(),cl=sl.cloneNode(true),lay=h('<div class="pz" aria-hidden="true"><div class="pzbg"></div></div>');
    cl.classList.add('pzs');cl.style.left=(r.left-ar.left)+'px';cl.style.top=(r.top-ar.top)+'px';cl.style.width=r.width+'px';cl.style.height=r.height+'px';
    lay.appendChild(cl);app.appendChild(lay);sl.style.visibility='hidden';
    var m=mid(e.touches);cl.style.transformOrigin=(m.x-r.left)+'px '+(m.y-r.top)+'px';
    z={lay:lay,cl:cl,sl:sl,d0:dist(e.touches),m0:m};
  },{passive:true});
  view.addEventListener('touchmove',function(e){
    if(!z||e.touches.length<2)return;if(e.cancelable)e.preventDefault();
    var s=Math.max(1,Math.min(4,dist(e.touches)/z.d0)),m=mid(e.touches);
    z.cl.style.transform='translate('+(m.x-z.m0.x)+'px,'+(m.y-z.m0.y)+'px) scale('+s+')';z.lay.firstChild.style.opacity=String(Math.min(.85,(s-1)*.9));
  },{passive:false});
  function end(e){if(!z||(e.touches&&e.touches.length>=2))return;var q=z;z=null;
    q.cl.style.transition='transform .25s ease';q.cl.style.transform='';q.lay.firstChild.style.transition='opacity .25s';q.lay.firstChild.style.opacity='0';
    setTimeout(function(){q.lay.remove();q.sl.style.visibility=''},260)}
  view.addEventListener('touchend',end);view.addEventListener('touchcancel',end);
})();

/* ----- hold a tile or a card for a preview; slide onto an action and let go ----- */
(function(){
  var SEL='.tile,.xc,.fe1,.kzq,.kzp,.kzc',T=null,src=null,pk=null,sx=0,sy=0,eat=false,sticky=false;
  function urlOf(go){go=String(go||'');var i=go.indexOf(':'),k=go.slice(0,i),v=go.slice(i+1);
    if(k==='acc'&&ACC[v])return ACC[v].url||'';if(k==='church')return 'kilise/'+v+'.html';
    if(k==='read'){var b=v.split('#')[0];if(b.indexOf('comp:')===0)return D.comp[+b.slice(5)].slug+'.html';if(b.indexOf('saint:')===0)return b.slice(6)+'.html';if(ACC[b])return ACC[b].url||''}
    return ''}
  function goOf(el){return el.getAttribute('data-go')||(el.getAttribute('data-read')?'read:'+el.getAttribute('data-read'):'')||(el.getAttribute('data-church')?'church:'+el.getAttribute('data-church'):'')}
  function title(el){var b=el.querySelector('b,.xtt');return plain(b?b.textContent:el.textContent).slice(0,90)}
  function open(el){
    src=el;vib(12);var r=el.getBoundingClientRect(),w=Math.min(app.clientWidth-48,340),sc=w/r.width;
    var cl=el.cloneNode(true);cl.removeAttribute('data-go');cl.classList.add('pkv');cl.style.width=r.width+'px';cl.style.height=r.height+'px';cl.style.transform='scale('+sc+')';cl.style.transformOrigin='top left';
    pk=h('<div class="peek" role="dialog" aria-label="Önizleme"><div class="pkbg"></div><div class="pkc"><div class="pkw" style="width:'+w+'px;height:'+(r.height*sc)+'px"></div><div class="pka"><button type="button" data-pk="open">'+ic('book')+'<span>Aç</span></button><button type="button" data-pk="share">'+ic('send')+'<span>Paylaş</span></button><button type="button" data-pk="copy">'+ic('copy')+'<span>Bağlantıyı kopyala</span></button></div><p class="pkh">Parmağınızı bir seçeneğe kaydırıp bırakın</p></div></div>');
    pk.querySelector('.pkw').appendChild(cl);app.appendChild(pk);
    pk.querySelector('.pkbg').addEventListener('click',close);
    pk.addEventListener('click',function(e){var b=e.target.closest('[data-pk]');if(b)act(b.getAttribute('data-pk'))});
  }
  function act(k){var el=src,go=goOf(el),u=urlOf(go),t=title(el);close();
    if(k==='open'){eat=false;el.click()}
    if(k==='share')shareOpts({path:u,title:t});
    if(k==='copy')copyLink(SITE+u)}
  function close(){if(pk){pk.remove();pk=null}sticky=false}
  function hit(x,y){if(!pk)return null;var b=document.elementFromPoint(x,y);b=b&&b.closest('[data-pk]');pk.querySelectorAll('[data-pk]').forEach(function(z){z.classList.toggle('on',z===b)});return b}
  view.addEventListener('touchstart',function(e){
    var el=e.target.closest(SEL);if(!el||e.touches.length!==1)return;
    sx=e.touches[0].clientX;sy=e.touches[0].clientY;clearTimeout(T);
    T=setTimeout(function(){T=null;eat=true;open(el)},430);
  },{passive:true});
  view.addEventListener('touchmove',function(e){
    if(T){var t=e.touches[0];if(Math.abs(t.clientX-sx)>9||Math.abs(t.clientY-sy)>9){clearTimeout(T);T=null}return}
    if(pk&&!sticky){if(e.cancelable)e.preventDefault();var t2=e.touches[0];hit(t2.clientX,t2.clientY)}
  },{passive:false});
  view.addEventListener('touchend',function(e){
    if(T){clearTimeout(T);T=null;return}
    if(pk&&!sticky){if(e.cancelable)e.preventDefault();var t=e.changedTouches[0],b=hit(t.clientX,t.clientY);if(b)act(b.getAttribute('data-pk'));else close()}
    if(eat)setTimeout(function(){eat=false},450);
  },{passive:false});
  view.addEventListener('contextmenu',function(e){var el=e.target.closest(SEL);if(!el)return;e.preventDefault();if(!pk){open(el);sticky=true}});
  view.addEventListener('click',function(e){if(eat&&e.target.closest(SEL)){e.preventDefault();e.stopPropagation();eat=false}},true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&pk)close()});
})();

/* ----- home: swipe left for messages (as on Instagram); Keşfet: tap the tab again for the search ----- */
(function(){
  var sx=0,sy=0,mode=null;
  view.addEventListener('touchstart',function(e){
    mode=null;var cr=e.target.closest('.car');if(cr&&cr.scrollWidth>cr.clientWidth+4)return;if(stack.length!==1||stack[0].name!=='home'||e.touches.length!==1||e.target.closest('.stories,.fe3,input')||app.querySelector('.ov,.sheet'))return;
    sx=e.touches[0].clientX;sy=e.touches[0].clientY;mode='wait';
  },{passive:true});
  view.addEventListener('touchmove',function(e){
    if(!mode)return;var dx=e.touches[0].clientX-sx,dy=e.touches[0].clientY-sy;
    if(mode==='wait'){if(Math.abs(dx)<12&&Math.abs(dy)<12)return;mode=(dx<0&&Math.abs(dx)>Math.abs(dy)*1.5)?'dm':null;if(mode)view.style.transition='none';return}
    if(mode==='dm')view.style.transform='translateX('+Math.min(0,dx)*.6+'px)';
  },{passive:true});
  function end(e){if(mode!=='dm'){mode=null;return}mode=null;var dx=e.changedTouches[0].clientX-sx;view.style.transition='transform .18s';view.style.transform='';
    if(dx<-90)setTimeout(function(){go('inbox')},120)}
  view.addEventListener('touchend',end);view.addEventListener('touchcancel',function(){mode=null;view.style.transform=''});
})();

/* ----- listen: sentence by sentence, with a small player; the best Turkish voice on the device ----- */
var SP={q:[],i:0,tok:0,pid:null,title:'',on:false,paused:false,u:null,rate:sget('ttsrate',1)};
function trVoices(){try{return speechSynthesis.getVoices().filter(function(v){return /^tr([-_]|$)/i.test(v.lang)})}catch(e){return []}}
function voiceScore(v){var n=v.name,s=0;if(/Natural|Neural/i.test(n))s+=60;if(/Online/i.test(n))s+=20;if(/Premium|Enhanced|Geliştirilmiş|Gelişmiş|Siri/i.test(n))s+=45;if(/Google/i.test(n))s+=30;if(/Emel|Ahmet/i.test(n))s+=5;if(/Yelda/i.test(n))s+=4;if(/Tolga|Filiz|eSpeak/i.test(n))s-=20;if(!v.localService)s+=3;return s}
function pickVoice(){var vs=trVoices(),pref=sget('voice','');if(pref){var f=vs.filter(function(v){return v.voiceURI===pref})[0];if(f)return f}return vs.sort(function(a,b){return voiceScore(b)-voiceScore(a)})[0]||null}
try{if(window.speechSynthesis&&speechSynthesis.addEventListener)speechSynthesis.addEventListener('voiceschanged',function(){var l=document.getElementById('vlist');if(l)drawVoices(l)})}catch(e){}
function ttsChunks(t){var out=[];sentences(t).forEach(function(s){s=s.trim();if(!s)return;while(s.length>220){var c=s.lastIndexOf(',',220);if(c<60)c=s.lastIndexOf(' ',220);out.push(s.slice(0,c+1));s=s.slice(c+1).trim()}if(s)out.push(s)});return out}
function ttsText(p){return [p.title?p.title+'.':'',plain(p.cap)].concat(p.slides.slice(1).map(function(s){return (s.title?s.title+'. ':'')+plain(s.text)})).join(' ').replace(/\s+/g,' ')}
speakPost=function(p){
  if(!('speechSynthesis' in window)){toast('Bu tarayıcı sesli okumayı desteklemiyor');return}
  stopSpeech(true);
  SP.tok++;SP.q=ttsChunks(ttsText(p));SP.i=0;SP.pid=p.id;SP.title=p.title||ACC[p.acc].name;SP.on=true;SP.paused=false;speaking=p.id;
  var tok=SP.tok;setTimeout(function(){speakNext(tok)},80);syncPlayer();
};
function speakNext(tok){
  if(tok!==SP.tok||!SP.on)return;
  if(SP.i>=SP.q.length){finishSpeech();return}
  var u=new SpeechSynthesisUtterance(SP.q[SP.i]),v=pickVoice(),done=false;SP.u=u;
  u.lang='tr-TR';if(v)u.voice=v;u.rate=SP.rate;u.pitch=1;
  u.onend=function(){if(done||tok!==SP.tok)return;done=true;SP.i++;syncPlayer();speakNext(tok)};
  u.onerror=function(e){if(done||tok!==SP.tok)return;done=true;if(e&&(e.error==='interrupted'||e.error==='canceled'))return;SP.i++;speakNext(tok)};
  try{speechSynthesis.speak(u)}catch(e){finishSpeech()}
  syncPlayer();
}
function finishSpeech(){SP.tok++;SP.on=false;SP.paused=false;speaking=null;try{speechSynthesis.cancel()}catch(e){}syncPlayer()}
stopSpeech=function(force){if(NAVSTOP&&!force)return;SP.tok++;SP.on=false;SP.paused=false;speaking=null;try{if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}syncPlayer()};
function ttsPause(){if(!SP.on)return;if(SP.paused){SP.paused=false;var tok=++SP.tok;try{speechSynthesis.cancel()}catch(e){}setTimeout(function(){speakNext(tok)},60)}else{SP.paused=true;SP.tok++;try{speechSynthesis.cancel()}catch(e){}}syncPlayer()}
function ttsSkip(n){if(!SP.on)return;SP.i=Math.max(0,Math.min(SP.q.length-1,SP.i+n));SP.paused=false;var tok=++SP.tok;try{speechSynthesis.cancel()}catch(e){}setTimeout(function(){speakNext(tok)},60);syncPlayer()}
function syncPlayer(){
  var bar=app.querySelector('#tts');
  if(!SP.on){if(bar)bar.remove();return}
  if(!bar){bar=h('<div class="tts" id="tts" role="region" aria-label="Sesli okuma"><button type="button" data-t="pp" class="tpp"></button><div class="tti"><b></b><small></small><i><u></u></i></div><button type="button" data-t="rate" class="trate" aria-label="Okuma hızı"></button><button type="button" data-t="next" aria-label="Sonraki cümle">'+ic('chevr')+'</button><button type="button" data-t="stop" aria-label="Durdur">'+ic('x')+'</button></div>');app.appendChild(bar);
    bar.addEventListener('click',function(e){var b=e.target.closest('[data-t]');if(!b)return;var t=b.getAttribute('data-t');
      if(t==='pp')ttsPause();if(t==='next')ttsSkip(1);if(t==='stop'){stopSpeech(true);toast('Durduruldu')}
      if(t==='rate'){var R=[0.85,1,1.15,1.3],k=R.indexOf(SP.rate);SP.rate=R[(k+1)%R.length];sset('ttsrate',SP.rate);if(!SP.paused)ttsSkip(0);syncPlayer()}});
    bar.querySelector('.tti').addEventListener('click',function(){if(SP.pid&&POSTS[SP.pid]&&POSTS[SP.pid].read)go('reader',POSTS[SP.pid].read)})}
  bar.style.bottom=((tabsEl&&tabsEl.offsetParent?tabsEl.offsetHeight:0)+8)+'px';
  var v=pickVoice();
  bar.querySelector('.tpp').innerHTML=ic(SP.paused?'play':'pause');bar.querySelector('.tpp').setAttribute('aria-label',SP.paused?'Devam et':'Duraklat');
  bar.querySelector('b').textContent=SP.title;
  bar.querySelector('small').textContent=(SP.paused?'Duraklatıldı':'Sesli dinleniyor')+' · '+(SP.i+1)+'/'+SP.q.length+(v?' · '+v.name.replace(/^(Microsoft|Google)\s+/,'').replace(/\s*\(.*$/,'').replace(/ - .*$/,''):'');
  bar.querySelector('u').style.width=(SP.q.length?Math.round(SP.i/SP.q.length*100):0)+'%';
  bar.querySelector('.trate').textContent=(SP.rate===1?'1':String(SP.rate).replace('.',','))+'×';
}
ICONS.play='<path d="M8 5l11 7-11 7z" fill="currentColor"/>';ICONS.pause='<path d="M8 5v14M16 5v14" stroke-width="3"/>';
/* the reading voice in the settings: choose, try, and how to get a better one */
function addVoiceRow(){
  var g=view.querySelector('#g-look');if(!g||g.querySelector('#r-voice'))return;
  var v=pickVoice(),r=h('<button type="button" class="srow" id="r-voice">'+ic('speak')+'<span class="sl1">Okuma sesi</span><small class="sv2">'+esc(v?v.name.replace(/\s*\(.*$/,''):'Cihaz sesi')+'</small>'+ic('chevr')+'</button>');
  g.appendChild(r);r.addEventListener('click',function(e){e.stopPropagation();openVoices()});
}
function drawVoices(l){
  var vs=trVoices().sort(function(a,b){return voiceScore(b)-voiceScore(a)}),cur=pickVoice();
  l.innerHTML=vs.length?vs.map(function(v){var on=cur&&cur.voiceURI===v.voiceURI,q=voiceScore(v)>=40;return '<div class="vrow'+(on?' on':'')+'"><button type="button" class="vpick" data-v="'+esc(v.voiceURI)+'" aria-pressed="'+on+'"><b>'+esc(v.name)+'</b><small>'+(q?'Doğal ses':'Standart ses')+(v.localService?' · cihazda':' · çevrim içi')+'</small></button><button type="button" class="vtry" data-try="'+esc(v.voiceURI)+'">Dene</button></div>'}).join(''):'<p class="mute" style="padding:0 16px">Bu cihazda Türkçe ses bulunamadı.</p>';
}
function openVoices(){
  var dim=h('<div class="dim"></div>'),sh=h('<div class="sheet vsheet" role="dialog" aria-label="Okuma sesi"><div class="gb"></div><h4>Okuma sesi</h4><div class="sc"><div id="vlist"></div>'
   +'<div class="vhelp"><b>Daha doğal bir ses için</b><p><b>iPhone, iPad:</b> Ayarlar › Erişilebilirlik › Seslendirilen İçerik › Sesler › Türkçe. “Yelda (Geliştirilmiş)” sesini indirin.</p><p><b>Android:</b> Ayarlar › Erişilebilirlik › Metin okuma. Motor olarak “Google Konuşma Hizmetleri”ni seçip Türkçe ses verisini yükleyin.</p><p><b>Windows ve Mac bilgisayar:</b> Microsoft Edge tarayıcısında “Microsoft Emel Online (Natural)” ve “Ahmet Online (Natural)” sesleri hazır gelir.</p></div></div></div>');
  function close(){dim.remove();sh.remove();try{speechSynthesis.cancel()}catch(e){}}
  dim.addEventListener('click',close);app.appendChild(dim);app.appendChild(sh);
  var l=sh.querySelector('#vlist');drawVoices(l);
  l.addEventListener('click',function(e){var p=e.target.closest('[data-v]'),t=e.target.closest('[data-try]');
    if(p){sset('voice',p.getAttribute('data-v'));drawVoices(l);var r=view.querySelector('#r-voice .sv2'),v=pickVoice();if(r&&v)r.textContent=v.name.replace(/\s*\(.*$/,'')}
    if(t){var v2=trVoices().filter(function(x){return x.voiceURI===t.getAttribute('data-try')})[0];try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance('Selam sana Meryem, lütuf dolu olan. Rab seninledir.');u.lang='tr-TR';if(v2)u.voice=v2;u.rate=SP.rate;speechSynthesis.speak(u)}catch(x){}}
  });
}

/* ----- share: the phone's own share sheet; where a page can't open it, our own sheet ----- */
function copyLink(url){function ok(){toast('Bağlantı kopyalandı',true)}try{navigator.clipboard.writeText(url).then(ok,function(){fallback()})}catch(e){fallback()}
  function fallback(){var t=document.createElement('textarea');t.value=url;t.setAttribute('readonly','');t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();var r=false;try{r=document.execCommand('copy')}catch(e){}t.remove();if(r)ok();else toast(url)}}
share=function(path,title){shareOpts({path:path,title:title})};
function shareOpts(o){
  var url=SITE+(o.path||''),title=o.title||'Katolik Dünyası';
  function own(){shareSheet(url,title,o)}
  if(navigator.share){try{navigator.share({title:title,url:url}).then(function(){if(o.onClose)o.onClose()},function(e){if(e&&e.name==='AbortError'){if(o.onClose)o.onClose();return}own()})}catch(e){own()}return}
  own();
}
ICONS.wa='<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.6-2-1-1 1c-1-.4-2-1.4-2.4-2.4l1-1-1-2z" fill="currentColor" stroke="none"/>';
ICONS.tg='<path d="M3 11.5l17-7-3 15-5-4-2.5 3v-4.5l7-6.5-9 5.5z" fill="currentColor" stroke="none"/>';
ICONS.xx='<path d="M5 4l14 16M19 4L5 20" stroke-width="2.4"/>';
ICONS.fb='<path d="M14 21v-7h3l.5-3.5H14V8.6c0-1 .4-1.6 1.7-1.6h1.9V4c-.5-.1-1.5-.2-2.7-.2-2.6 0-4.4 1.6-4.4 4.5v2.2H7.5V14h3v7z" fill="currentColor" stroke="none"/>';
ICONS.sms='<path d="M4 5h16v11H9l-5 4z"/>';
function shareSheet(url,title,o){
  var t=encodeURIComponent(title),u=encodeURIComponent(url),both=encodeURIComponent(title+' '+url);
  var T=[['copy','Bağlantıyı kopyala','#3a3f4a',null],['wa','WhatsApp','#25a35a','https://wa.me/?text='+both],['tg','Telegram','#2a9bd8','https://t.me/share/url?url='+u+'&text='+t],['xx','X','#111','https://x.com/intent/post?text='+t+'&url='+u],['fb','Facebook','#1c6fe0','https://www.facebook.com/sharer/sharer.php?u='+u],['mail','E-posta','#7a5a1e','mailto:?subject='+t+'&body='+both],['sms','Mesaj','#2fb24c','sms:?&body='+both]];
  var dim=h('<div class="dim"></div>'),sh=h('<div class="sheet shs" role="dialog" aria-label="Paylaş"><div class="gb"></div><h4>Paylaş</h4><div class="sc">'
   +'<div class="shl">'+ic('send')+'<div><b>'+esc(title)+'</b><small>'+esc(url.replace(/^https?:\/\//,''))+'</small></div></div>'
   +'<div class="shg">'+T.map(function(x){var inner='<span class="shi" style="background:'+x[2]+'">'+ic(x[0])+'</span><span>'+x[1]+'</span>';return x[3]?'<a class="sht" href="'+x[3]+'" target="_blank" rel="noopener" data-sh="'+x[0]+'">'+inner+'</a>':'<button type="button" class="sht" data-sh="'+x[0]+'">'+inner+'</button>'}).join('')
   +(o&&o.card?'<button type="button" class="sht" data-sh="card"><span class="shi" style="background:linear-gradient(135deg,#b07a1c,#5a3a0a)">'+ic('photo')+'</span><span>Görsel kart</span></button>':'')+'</div></div></div>');
  function close(){dim.remove();sh.remove();if(o&&o.onClose&&!keep)o.onClose()}
  var keep=false;
  sh.addEventListener('click',function(e){var b=e.target.closest('[data-sh]');if(!b)return;var k=b.getAttribute('data-sh');
    if(k==='copy'){e.preventDefault();copyLink(url);close()}
    else if(k==='card'){keep=true;close();shareCard(o.card,o.onClose)}
    else setTimeout(close,50)});
  dim.addEventListener('click',close);app.appendChild(dim);app.appendChild(sh);
}
// the share button under each post brings the post's own picture card along
view.addEventListener('click',function(e){var b=e.target.closest('.post .act [data-share]');if(!b)return;e.stopPropagation();e.preventDefault();
  var pid=b.closest('.post').getAttribute('data-pid'),p=POSTS[pid],a=ACC[p.acc],car=b.closest('.post').querySelector('.car'),ix=car?Math.round(car.scrollLeft/Math.max(1,car.clientWidth)):0;
  shareOpts({path:a.url||'',title:p.title||a.name,card:{slide:p.slides[ix]||p.slides[0],acc:a,paint:paintFor(pid),url:a.url||'',title:p.title}})},true);

/* ----- the picture card: the sheet opens at once, the picture follows; JPEG is far quicker than PNG ----- */
shareCard=function(o,onDone){
  var s=o.slide||{},W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;var x=cv.getContext('2d'),title=s.title||o.title||'',blob=null,url=null,closed=false;
  var dim=h('<div class="dim"></div>'),sh=h('<div class="sheet cardsh" role="dialog" aria-label="Görsel kart"><div class="gb"></div><h4>Görsel kart</h4><div class="sc"><div class="cardph"><span class="spin6"></span></div><p class="mute cardhint">Kart hazırlanıyor…</p><div class="dbtns"><button type="button" data-cs disabled>Görseli paylaş</button><button type="button" data-cl>Bağlantıyı paylaş</button></div></div></div>');
  function close(){if(closed)return;closed=true;dim.remove();sh.remove();if(url)URL.revokeObjectURL(url);if(onDone)onDone()}
  dim.addEventListener('click',close);app.appendChild(dim);app.appendChild(sh);
  sh.querySelector('[data-cl]').addEventListener('click',function(){var p=o.url||'';close();shareOpts({path:p,title:title})});
  sh.querySelector('[data-cs]').addEventListener('click',function(){if(!blob)return;var f=null;try{f=new File([blob],'katolikdunyasi.jpg',{type:'image/jpeg'})}catch(e){}
    if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:title})['catch'](function(e){if(!e||e.name!=='AbortError')toast('Görsele basılı tutup kaydedebilirsiniz')})}else toast('Görsele basılı tutup kaydedebilir ya da paylaşabilirsiniz')});
  function draw(img){
    if(closed)return;
    if(img){var sc=Math.max(W/img.width,H/img.height),iw=img.width*sc,ih=img.height*sc;x.drawImage(img,(W-iw)/2,(H-ih)/2,iw,ih);var g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(8,6,4,.35)');g.addColorStop(.4,'rgba(8,6,4,.2)');g.addColorStop(1,'rgba(8,6,4,.92)');x.fillStyle=g;x.fillRect(0,0,W,H);if(s.type!=='cover'&&(s.text||'').length>40){x.fillStyle='rgba(8,6,4,.45)';x.fillRect(0,0,W,H)}}
    else{var g2=x.createLinearGradient(0,0,W,H);g2.addColorStop(0,'#14203a');g2.addColorStop(1,'#2a3550');x.fillStyle=g2;x.fillRect(0,0,W,H)}
    var pad=84;x.textBaseline='alphabetic';x.fillStyle='rgba(255,255,255,.85)';x.font='700 30px Inter, system-ui, sans-serif';x.fillText('katolikdunyasi.com',pad,96);
    var body=s.type==='cover'?(s.sub||''):(s.text||''),lines=[];x.font='500 44px Inter, system-ui, sans-serif';if(body)lines=wrapLines(x,body,W-pad*2,s.type==='cover'?3:9);
    var th=title.length>30?92:118;x.font='400 '+th+'px "KD Display", Impact, sans-serif';var tl=title?wrapLines(x,title.toLocaleUpperCase('tr'),W-pad*2,4):[];
    var blockH=(s.kick?60:0)+tl.length*th*.98+(lines.length?30+lines.length*60:0),cy=Math.max(170,H-130-blockH);
    if(s.kick){x.fillStyle='#f1d48f';x.font='700 30px Inter, system-ui, sans-serif';x.fillText(String(s.kick).toLocaleUpperCase('tr'),pad,cy+30);cy+=60}
    x.fillStyle='#fff';x.font='400 '+th+'px "KD Display", Impact, sans-serif';tl.forEach(function(l){cy+=th*.98;x.fillText(l,pad,cy)});
    if(lines.length){cy+=30;x.font='500 44px Inter, system-ui, sans-serif';x.fillStyle='rgba(255,255,255,.95)';lines.forEach(function(l){cy+=60;x.fillText(l,pad,cy)})}
    x.fillStyle='rgba(255,255,255,.7)';x.font='600 28px Inter, system-ui, sans-serif';var pn=o.paint&&o.paint.indexOf('ch:')!==0?artBy(o.paint)+', '+(PAINT_NAME[o.paint]||''):'';x.fillText((o.acc?'@'+o.acc.handle+(pn?'  ·  ':''):'')+pn,pad,H-70);
    cv.toBlob(function(b){if(closed)return;blob=b;url=URL.createObjectURL(b);
      var ph=sh.querySelector('.cardph');ph.outerHTML='<img class="cardimg" alt="'+esc(title)+'" src="'+url+'">';
      sh.querySelector('.cardhint').textContent='Kaydetmek için görsele basılı tutun.';sh.querySelector('[data-cs]').disabled=false},'image/jpeg',0.86);
  }
  function load(){var src=o.paint&&o.paint.indexOf('ch:')===0?chImg(o.paint.slice(3)):(o.paint&&D.carav&&D.carav[o.paint]);if(!src)return draw(null);var im=new Image();im.onload=function(){draw(im)};im.onerror=function(){draw(null)};im.src=src}
  var fontsReady=!document.fonts||document.fonts.check('118px "KD Display"');
  if(fontsReady)setTimeout(load,30);
  else{var t=setTimeout(load,500);document.fonts.load('118px "KD Display"').then(function(){clearTimeout(t);load()},function(){})}
};

/* ----- the Katekizm tab: a path through the book, not a profile ----- */
var QREAD=sget('qread',{});
var PART_ROMAN=['I','II','III','IV'],PART_SUB=['Neye inanıyoruz?','Nasıl kutluyoruz?','Nasıl yaşıyoruz?','Nasıl dua ediyoruz?'].map(function(x){return x.toLocaleUpperCase('tr')});
function partQs(pi){return D.comp[pi].items.filter(function(it){return it[0]==='q'}).map(function(it){return it[1]})}
function readCount(pi){var n=0;partQs(pi).forEach(function(q){if(QREAD[q])n++});return n}
function totalRead(){return Object.keys(QREAD).length}
function nextUnread(from){for(var n=from||1;n<=598;n++)if(CQ[n]&&!QREAD[n])return n;for(var m=1;m<=598;m++)if(CQ[m]&&!QREAD[m])return m;return 1}
function lastReadQ(){return sget('qlast',0)}
function openRandomQ(){var un=[];for(var n=1;n<=598;n++)if(CQ[n]&&!QREAD[n])un.push(n);if(!un.length)un=Object.keys(CQ).map(Number);var q=un[Math.floor(Math.random()*un.length)];go('reader','comp:'+CPART[q]+'#'+q)}
function ringSVG(f,size){var r=(size-8)/2,c=2*Math.PI*r;return '<svg class="kzring" width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" aria-hidden="true"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="var(--line2)" stroke-width="5"/><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="var(--gold)" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+(c*f).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 '+size/2+' '+size/2+')"/></svg>'}
var KZ_QUOTES=null;
function kzQuotes(){if(KZ_QUOTES)return KZ_QUOTES;var out=[];D.comp.forEach(function(p,pi){var lastH=0;p.items.forEach(function(it,ii){if(it[0]==='h')lastH=ii;if(it[0]==='c'){var m=plain(it[1]).match(/^(.*)\(([^()]+)\)\s*$/);out.push({t:plain(m?m[1]:it[1]).replace(/^[“"]|[”"]$/g,''),by:m?m[2]:'',go:'read:comp:'+pi+'#h'+lastH,pi:pi})}})});KZ_QUOTES=out.filter(function(q){return q.t.length<190});return KZ_QUOTES}
vKatekizm=function(){
  var dq=STORY_QS[0],it=CQ[dq],pi=CPART[dq],tr=totalRead(),qs0=sget('qsave',null),nx=(qs0&&CQ[qs0.n])?qs0.n:nextUnread(lastReadQ()?lastReadQ()+1:1),qs=kzQuotes(),q0=doy%Math.max(1,qs.length);
  var html='<div class="hd kzhd"><h1>katekizm <span class="ver">✓</span></h1><span class="r"><button type="button" data-share="katekizm.html" data-title="Katekizm" aria-label="Paylaş">'+ic('send')+'</button></span></div>'
   +'<label class="search" for="kq">'+ic('search')+'<input id="kq" type="search" placeholder="598 soru içinde ara…" autocomplete="off" value="'+esc(katQ)+'"></label><div id="kres"></div>'
   +'<div id="kmain" class="kz">'
   // today's question: a card that turns over
   +'<div class="kzday" id="kzday"><button type="button" class="kzf pa-'+(Q_POOL[pi][dq%Q_POOL[pi].length])+'" aria-label="Günün sorusu: '+esc(plain(it[2]))+'. Cevabı görmek için dokunun"><small>Günün sorusu · '+dq+'</small><b>'+esc(UP(plain(it[2])))+'</b><span class="kzhint">'+ic('chevr')+' Cevap için dokunun</span></button>'
   +'<div class="kzb" hidden><small>Soru '+dq+' · '+esc(D.comp[pi].t)+'</small><p>'+esc(cut(plain(it[3]),330))+'</p><div class="kzbb"><button type="button" class="pri" data-go="read:comp:'+pi+'#'+dq+'">Bağlamında oku</button><button type="button" data-flip>Soruya dön</button></div></div></div>'
   // progress and where to pick up
   +'<div class="kzprog"><div class="kzr">'+ringSVG(tr/598,64)+'<b>'+Math.round(tr/598*100)+'<i>%</i></b></div><div class="kzpt"><b>'+(tr?tr+' soru okundu':'Henüz başlamadınız')+'</b><span>'+(tr?'598 sorudan '+(598-tr)+' tanesi kaldı.':'Okuduğunuz sorular burada işaretlenir.')+'</span></div><span class="kzgow"><button type="button" class="kzgo" data-go="read:comp:'+CPART[nx]+'#'+nx+'">'+(tr||qs0?'Devam':'Başla')+'<small>Soru '+nx+'</small></button>'+(tr||qs0?'<button type="button" class="kzreset" data-kzreset aria-label="İlerlemeyi sıfırla" title="Baştan başla">'+ic('reset')+'</button>':'')+'</span></div>'
   // the four parts: tall arched panels
   +'<h3 class="kzh">Dört kısım</h3><div class="kzparts">'+D.comp.map(function(p,i){var n=partQs(i).length,r=readCount(i);return '<button type="button" class="kzp pa-'+PART_PAINT[i]+'" data-go="kpart:'+i+'"><span class="kzn">'+PART_ROMAN[i]+'</span><span class="kzpb"><small>'+PART_SUB[i]+'</small><b>'+esc(p.t)+'</b><em>Soru '+p.from+'-'+p.to+'</em><span class="kzbar"><i style="width:'+Math.round(r/n*100)+'%"></i></span><span class="kzpr">'+r+'/'+n+' okundu</span></span></button>'}).join('')+'</div>'
   // before and after the questions
   +'<h3 class="kzh">Önsöz ve ekler</h3><div class="kzchips">'+CX_TILES.map(function(t){return '<button type="button" data-go="read:'+t[0]+'">'+ic(t[3]==='cross'?'book':'book')+'<span><b>'+esc(t[1])+'</b><small>'+esc(t[2])+'</small></span></button>'}).join('')+'</div>'
   // what comes next, in order
   +'<h3 class="kzh">Sıradaki sorular</h3><div class="kznext">'+[0,1,2,3].map(function(k){var n=nextUnread(nx+k===nx?nx:nx);return n}).reduce(function(acc){var last=acc.length?acc[acc.length-1]:nx-1,n=last+1;while(n<=598&&(QREAD[n]||!CQ[n]))n++;if(n<=598)acc.push(n);return acc},[]).map(function(n){var p2=CPART[n];return '<button type="button" class="kzq" data-go="read:comp:'+p2+'#'+n+'"><span class="kzqn" style="background:'+tone(PART_TONE[p2])[0]+';color:'+tone(PART_TONE[p2])[1]+'">'+n+'</span><span><b>'+esc(plain(CQ[n][2]))+'</b><small>'+esc(D.comp[p2].t)+'</small></span>'+ic('chevr')+'</button>'}).join('')+'</div>'
   +'<button type="button" class="kzdice" data-go="kq:random"><span>'+ic('dice')+'</span><b>Rastgele bir soru</b><small>Henüz okumadıklarınızdan biri</small></button>'
   // the saints' words that sit between the questions
   +(qs.length?'<h3 class="kzh">Katekizm’deki sözler</h3><div class="kzcs">'+[0,1,2,3,4,5].map(function(k){var q=qs[(q0+k*7)%qs.length];return '<button type="button" class="kzc pa-'+PART_PAINT[q.pi]+'" data-go="'+q.go+'"><span>“'+esc(q.t)+'”</span><small>'+esc(q.by)+'</small></button>'}).join('')+'</div>':'')
   +'<p class="kzfoot">Katolik Kilisesi İnanç Esasları Özeti (Compendium), 2005.</p></div>';
  view.innerHTML=html;
  var day=view.querySelector('#kzday');
  day.addEventListener('click',function(e){if(e.target.closest('[data-go]'))return;var f=day.querySelector('.kzf'),b=day.querySelector('.kzb');if(e.target.closest('.kzf')||e.target.closest('[data-flip]')){var back=!b.hidden;day.classList.add('flip');setTimeout(function(){f.hidden=!back;b.hidden=back;requestAnimationFrame(function(){day.classList.remove('flip')})},PREFS.motion?0:140)}});
  var kq=view.querySelector('#kq');
  function draw(){katQ=kq.value;var box=view.querySelector('#kres'),main=view.querySelector('#kmain'),res=kqSearch(katQ);
    if(!res.terms.length){box.innerHTML='';main.hidden=false;return}main.hidden=true;
    var n=res.hits.length,MAX=40,qx='“'+esc(katQ.trim())+'”';
    box.innerHTML='<p class="sr-head" role="status">'+(n?qx+' için '+n+' soru'+(n>MAX?' (ilk '+MAX+' gösteriliyor)':''):qx+' için sonuç bulunamadı.')+'</p>'
      +res.hits.slice(0,MAX).map(function(h){var e=h.e;return '<button type="button" class="qres sr" data-read="comp:'+e.p+'#'+e.n+'"><span class="srn">'+e.n+'</span><span class="srb"><b>'+kqMark(e.q,res.terms)+(QREAD[e.n]?' <span class="okd">okundu</span>':'')+'</b><span>'+kqMark(kqSnip(e.a,res.terms,150),res.terms)+'</span><small>'+esc(D.comp[e.p].t)+'</small></span></button>'}).join('')}
  kq.addEventListener('input',draw);if(katQ)draw();
};
/* the Katekizm search of the website: every word must match, letters without accents match
   their accented forms, questions whose title matches come first, a number opens that question */
var KQI=null;
function kqFold(s){s=String(s||'');var l=s.toLocaleLowerCase('tr');if(l.length!==s.length)l=s.toLowerCase();if(l.length!==s.length)return s;var o='';for(var i=0;i<l.length;i++){var c=l.charCodeAt(i);if(c<128){o+=l[i];continue}var m=l[i].normalize?l[i].normalize('NFD')[0]:l[i];if(m==='ı')m='i';if(m==='’'||m==='‘')m="'";o+=m}return o}
function kqIndex(){if(KQI)return KQI;KQI=[];Object.keys(CQ).forEach(function(n){var it=CQ[n],e={n:+n,p:CPART[n],q:plain(it[2]),a:plain(it[3])};e.fq=kqFold(e.q);e.fa=kqFold(e.a);KQI.push(e)});return KQI}
function kqSearch(raw){var q=kqFold(String(raw||'').trim()).replace(/[“”"]/g,''),terms=q.split(/\s+/).filter(function(t){return t.length>1||/^\d$/.test(t)});if(!terms.length)return {terms:[],hits:[]};
  var num=/^\d{1,3}$/.test(q)?parseInt(q,10):null,hits=[];
  kqIndex().forEach(function(e){function all(s){return terms.every(function(t){return s.indexOf(t)!==-1})}var sc=0;if(num!==null&&e.n===num)sc=100;else if(all(e.fq))sc=3;else if(all(e.fq+' '+e.fa))sc=2;if(sc)hits.push({e:e,score:sc})});
  hits.sort(function(a,b){return b.score-a.score||a.e.n-b.e.n});return {terms:terms,hits:hits}}
function kqMark(text,terms){var f=kqFold(text),R=[];terms.forEach(function(t){var i=f.indexOf(t);while(i!==-1){R.push([i,i+t.length]);i=f.indexOf(t,i+t.length)}});if(!R.length)return esc(text);R.sort(function(a,b){return a[0]-b[0]});var o='',pos=0;R.forEach(function(r){if(r[0]<pos){if(r[1]>pos){o+='<mark>'+esc(text.slice(pos,r[1]))+'</mark>';pos=r[1]}return}o+=esc(text.slice(pos,r[0]))+'<mark>'+esc(text.slice(r[0],r[1]))+'</mark>';pos=r[1]});return o+esc(text.slice(pos))}
function kqSnip(text,terms,len){var f=kqFold(text),at=-1;terms.forEach(function(t){var i=f.indexOf(t);if(i!==-1&&(at===-1||i<at))at=i});if(at===-1||text.length<=len)return text.length>len?text.slice(0,len).replace(/\s+\S*$/,'')+'…':text;var st=Math.max(0,at-Math.floor(len/3)),s=text.slice(st,st+len);if(st>0)s='…'+s.replace(/^\S*\s/,'');if(st+len<text.length)s=s.replace(/\s+\S*$/,'')+'…';return s}
ICONS.dice='<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1.3" fill="currentColor"/><circle cx="15" cy="15" r="1.3" fill="currentColor"/><circle cx="15" cy="9" r="1.3" fill="currentColor"/><circle cx="9" cy="15" r="1.3" fill="currentColor"/>';
/* one part, its full table of contents in order: nothing is skipped */
function partTree(pi){
  var p=D.comp[pi],T=[],b=null,t=null;
  function qn(it){return it[1]}
  p.items.forEach(function(it,ii){
    if(it[0]==='h'&&it[1]===2){b={t:it[2],ii:ii,qs:[],kids:[]};T.push(b);t=null;return}
    if(it[0]==='h'&&it[1]===3){if(!b){b={t:'',ii:ii,qs:[],kids:[]};T.push(b)}t={t:it[2],ii:ii,qs:[],subs:[]};b.kids.push(t);return}
    if(it[0]==='h'&&it[1]===4){if(!b){b={t:'',ii:ii,qs:[],kids:[]};T.push(b)}if(!t){t={t:'',ii:ii,qs:[],subs:[]};b.kids.push(t)}t.subs.push({t:it[2],ii:ii,qs:[]});return}
    if(it[0]==='q'){var n=qn(it);if(t){t.qs.push(n);if(t.subs.length)t.subs[t.subs.length-1].qs.push(n)}else if(b)b.qs.push(n)}
  });
  return T;
}
function rng(qs){return qs.length?(qs.length>1?'Soru '+qs[0]+'-'+qs[qs.length-1]:'Soru '+qs[0]):''}
function doneMark(qs){if(!qs.length)return '';var r=qs.filter(function(n){return QREAD[n]}).length;if(r===qs.length)return '<span class="kzok" aria-label="okundu">'+ic('check2')+'</span>';if(r)return '<span class="kzpart" aria-label="'+r+'/'+qs.length+' okundu"><i style="width:'+Math.round(r/qs.length*100)+'%"></i></span>';return ''}
ICONS.check2='<path d="M5 12.5l4.5 4.5L19 7.5" stroke-width="2.4"/>';
function vKPart(pi){
  var p=D.comp[pi],T=partTree(pi),n=partQs(pi).length,r=readCount(pi),nx=partQs(pi).filter(function(q){return !QREAD[q]})[0]||p.from;
  var html=header('Katekizm · '+PART_ROMAN[pi])
   +'<div class="kph pa-'+PART_PAINT[pi]+'"><span class="kzn">'+PART_ROMAN[pi]+'</span><small>'+PART_SUB[pi]+'</small><h2>'+esc(p.t)+'</h2><span class="kphm">Soru '+p.from+'-'+p.to+' · '+r+'/'+n+' okundu</span><div class="kphb"><button type="button" class="pri" data-go="read:comp:'+pi+'">Baştan oku</button>'+(r&&r<n?'<button type="button" data-go="read:comp:'+pi+'#'+nx+'">Devam: Soru '+nx+'</button>':'')+'</div></div>'
   +'<div class="ktoc">'+T.map(function(b,bi){
      var all=b.qs.concat.apply(b.qs,b.kids.map(function(t){return t.qs}));
      return '<section class="ktb"><button type="button" class="ktbh" data-go="read:comp:'+pi+'#h'+b.ii+'"><small>'+esc((b.t.match(/^[^:]+/)||[''])[0])+'</small><b>'+esc(b.t.replace(/^[^:]+:\s*/,''))+'</b><em>'+rng(all)+'</em>'+doneMark(all)+'</button>'
       +(b.qs.length?'<button type="button" class="ktr" data-go="read:comp:'+pi+'#'+b.qs[0]+'"><span class="ktn">Giriş</span><span class="ktt"><b>'+esc(plain(CQ[b.qs[0]][2]))+'</b><em>'+rng(b.qs)+'</em></span>'+doneMark(b.qs)+'</button>':'')
       +b.kids.map(function(t){
          return '<div class="ktk"><button type="button" class="ktr kth" data-go="read:comp:'+pi+'#h'+t.ii+'"><span class="ktn">'+esc(((t.t.match(/^([^:]+):/)||['',''])[1]).replace(' Başlık',''))+'</span><span class="ktt"><b>'+esc(t.t.replace(/^[^:]+:\s*/,'')||'Giriş')+'</b><em>'+rng(t.qs)+'</em></span>'+doneMark(t.qs)+'</button>'
           +(t.subs.length?'<details class="kts"><summary>'+t.subs.length+' alt başlık</summary>'+t.subs.map(function(s){return '<button type="button" class="ktr kt4" aria-label="'+esc(s.t+(s.qs.length?', '+rng(s.qs):''))+'" data-go="read:comp:'+pi+'#h'+s.ii+'"><span class="ktt"><b>'+esc(s.t)+'</b><em>'+rng(s.qs)+'</em></span>'+doneMark(s.qs)+'</button>'}).join('')+'</details>':'')+'</div>'}).join('')
       +'</section>'}).join('')+'</div>'
   +(pi<3?'<button type="button" class="kpnext pa-'+PART_PAINT[pi+1]+'" data-go="kpart:'+(pi+1)+'"><small>Sonraki kısım · '+PART_ROMAN[pi+1]+'</small><b>'+esc(D.comp[pi+1].t)+'</b></button>':'');
  view.innerHTML=html;
}

/* ----- the reader: mark the questions that were read; paintings between the sections ----- */
var vReader7=vReader;
vReader=function(key){
  if(qObs){qObs.disconnect();qObs=null}
  vReader7(key);
  var k=key.split('#')[0];
  if(k.indexOf('doc:')===0)return;
  inlinePaintings(k);
  if(k.indexOf('comp:')===0)trackQuestions();
  attachScrubber();
};
function trackQuestions(){
  var T={};
  view.querySelectorAll('.qa').forEach(function(q){var n=+q.id.slice(1);if(QREAD[n])q.classList.add('qdone')});
  if(!('IntersectionObserver' in window))return;
  qObs=new IntersectionObserver(function(es){es.forEach(function(e){var n=+e.target.id.slice(1);if(!n||QREAD[n])return;
    if(e.isIntersecting){T[n]=setTimeout(function(){QREAD[n]=Date.now();sset('qread',QREAD);sset('qlast',n);e.target.classList.add('qdone')},1600)}else{clearTimeout(T[n])}})},{root:view,threshold:0.6});
  view.querySelectorAll('.qa').forEach(function(q){qObs.observe(q)});
}
var INL={comp0:['66annunc','13fligh','67sheph','40baptis','46ecceho','55flagel','37depos','47emmau','34thomas','29ceras','45death','48palaf','65lazar'],comp1:['35emmau','40baptis','12magda','72denial','53mercy','47emmau','64lucy','28ceras','67sheph'],comp2:['53mercy','23conta','33isaac','12magda','72denial','191captu','26conta','46ecceho'],comp3:['49franci','05franc','43jerome','58rosar','42loreto','13fligh','48palaf'],
  islam:['26conta','23conta','46ecceho','29ceras','37depos','66annunc','34thomas','65lazar'],ateizm:['34thomas','65lazar','37depos','47emmau','43jerome','29ceras','33isaac','46ecceho'],gunah:['72denial','12magda','53mercy','28ceras','05franc'],mass:['35emmau','47emmau','37depos','67sheph','55flagel'],
  'page:neden':['28ceras','29ceras','23conta','26conta','46ecceho'],'page:topraklar':['29ceras','33isaac','28ceras','65lazar','45death'],'page:surec':['23conta','40baptis','12magda','47emmau'],'page:tesbihtarihi':['58rosar','42loreto','66annunc','45death','48palaf'],cx:['43jerome','26conta','23conta','49franci','58rosar']};
function inlinePaintings(k){
  var rd=view.querySelector('.rd');if(!rd)return;
  var pool=k.indexOf('comp:')===0?INL['comp'+k.slice(5)]:k.indexOf('cx:')===0?INL.cx:INL[k];
  if(!pool&&k.indexOf('saint:')!==0&&k.indexOf('pope:')!==0)pool=null;
  if(!pool)return;
  var hero=readerPaint(k),pl=pool.filter(function(x){return x!==hero&&D.carav&&D.carav[x]});if(!pl.length)return;
  var gap=Math.max(1500,view.clientHeight*(k.indexOf('comp:')===0?2.6:2)),heads=[].slice.call(rd.querySelectorAll('h2,.h1x,.h2x,.h3x')),last=rd.querySelector('.rhero')?rd.querySelector('.rhero').offsetTop:0,n=0,marks=[];
  heads.forEach(function(e){var y=e.offsetTop;if(y-last>=gap&&y<rd.offsetTop+rd.offsetHeight-600){marks.push(e);last=y}});
  marks.forEach(function(e){var pk=pl[n++%pl.length];e.parentNode.insertBefore(h('<figure class="ifig"><span class="ifi pa-'+pk+'" role="img" aria-label="'+esc(artBy(pk)+', '+(PAINT_NAME[pk]||''))+'"></span><figcaption>'+esc(artCap(pk))+'</figcaption></figure>'),e)});
}

/* ----- church photographs (free licences, credited in Kaynaklar) ----- */
function chImg(id){var k=D.chmap&&D.chmap[id];return k&&D.chimg[k]?D.chimg[k]:null}
var isPhoto6=isPhoto,imgSrc6=imgSrc;
isPhoto=function(a){a=String(a);return a.indexOf('cimg:')===0||isPhoto6(a)};
imgSrc=function(a){a=String(a);if(a.indexOf('cimg:')===0)return chImg(a.slice(5));return imgSrc6(a)};
Object.keys(CH_OF).forEach(function(cid){if(chImg(cid)){var a=ACC[CH_OF[cid]];a.art0=a.art;a.art='cimg:'+cid}});
var accPosts6=accPosts;
accPosts=function(id){var r=accPosts6(id);if(id==='kilise')r.grid.forEach(function(g){var cid=g.go.slice(7);if(chImg(cid))g.img=chImg(cid)});return r};
var vProfile7=vProfile;
vProfile=function(id){vProfile7(id);if(id!=='kilise')return;
  view.querySelectorAll('.grid .tile[data-go^="church:"]').forEach(function(t){var cid=t.getAttribute('data-go').slice(7),src=chImg(cid);if(!src)return;t.classList.add('tph');t.style.backgroundImage='linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,0) 28%,rgba(0,0,0,0) 45%,rgba(0,0,0,.8)),url('+src+')';var s=t.querySelector('svg.art');if(s)s.remove()})};
var vChurch7=vChurch;
vChurch=function(cid){vChurch7(cid);
  var src=chImg(cid),cr=D.chcred&&D.chcred[cid];
  if(src){var pr=view.querySelector('.pr');if(pr)pr.insertAdjacentHTML('beforebegin','<figure class="chero" style="background-image:url('+src+')">'+(cr?'<figcaption>'+esc(cr.gen?'Temsilî fotoğraf · ':'')+'Fotoğraf: '+esc(cr.by)+' · '+esc(cr.lic)+'</figcaption>':'')+'</figure>')}
  view.querySelectorAll('.mi[data-church]').forEach(function(b){var s2=chImg(b.getAttribute('data-church'));if(!s2)return;var o=b.querySelector('.o .av');if(o){o.style.background='transparent';o.innerHTML='<img class="pimg" alt="" src="'+s2+'">'}})};
var docCredits7=docCredits;
docCredits=function(){var c=D.chcred||{},ids=Object.keys(c);if(!ids.length)return docCredits7();
  return docCredits7()+'<h2 id="schurch">Kilise fotoğrafları</h2><p>Kilise Bul’daki fotoğraflar özgür lisanslarla paylaşılmıştır; fotoğrafçıların adları aşağıdadır. Kendi fotoğrafı bulunamayan kiliselerde temsilî bir kilise fotoğrafı kullanılmış ve bu açıkça belirtilmiştir.</p><ul class="dl cred">'+ids.map(function(id){var x=c[id],a=ACC[CH_OF[id]];return '<li><b>'+esc(a?a.name:id)+'</b>'+(x.gen?' (temsilî)':'')+': '+esc(x.t)+' · '+esc(x.by)+' · '+esc(x.lic)+' · <a href="'+esc(x.src)+'" target="_blank" rel="noopener">kaynak</a></li>'}).join('')+'</ul>'};

/* ----- sacred art beyond Caravaggio: icons, frescoes and altarpieces (public domain), each where it belongs ----- */
D.artmeta=D.artmeta||{};
Object.keys(D.artmeta).forEach(function(k){PAINT_NAME[k]=D.artmeta[k].t;if(PAINT_KEYS.indexOf(k)<0&&D.carav[k])PAINT_KEYS.push(k)});
function artBy(k){return D.artmeta[k]?D.artmeta[k].a:'Caravaggio'}
function artCap(k){return artBy(k)+' · '+(PAINT_NAME[k]||'')}
function hasA(k){return k&&D.carav&&D.carav[k]?k:null}
function setIf(o,k,v){if(hasA(v))o[k]=v}
// saints
[['meryem-ana','i-immac'],['aziz-yusuf','i-joseph'],['havari-pavlus','i-paulath'],['havari-yuhanna','i-patmos'],['aziz-augustinus','i-august'],['aziz-thomas-aquinas','i-aquinas'],['assisili-aziz-francis','i-francis'],['sienali-aziz-catharina','i-cather'],['avilali-aziz-teresa','i-teresa'],['aziz-hieronymus','i-jerome'],['havari-petrus','i-keys'],['vaftizci-yahya','i-bapt']].forEach(function(x){setIf(SAINT_PAINT,x[0],x[1])});
setIf(SAINT_STORY,'meryem-ana','i-annunc');setIf(SAINT_STORY,'havari-yuhanna','i-patmos');setIf(SAINT_STORY,'aziz-augustinus','i-august');setIf(SAINT_STORY,'aziz-thomas-aquinas','i-aquinas');setIf(SAINT_STORY,'sienali-aziz-catharina','i-cather');setIf(SAINT_STORY,'avilali-aziz-teresa','i-teresa');setIf(SAINT_STORY,'havari-pavlus','i-paulath');
// the rosary's four sets, the Katekizm's four parts, topic accounts
setIf(SET_PAINT,'isik','i-transf');setIf(SET_PAINT,'yucelik','i-assunt');setIf(SET_PAINT,'aci','i-agony');
if(hasA('i-trinity'))PART_PAINT[0]='i-trinity';if(hasA('i-sevens'))PART_PAINT[1]='i-sevens';
setIf(SPAINT,'topraklar','i-deesis');setIf(SPAINT,'tesbihtarihi','i-instros');setIf(SPAINT,'ayin','i-lastsup');setIf(SPAINT,'papalar','i-keys');setIf(SPAINT,'surec','i-bapt');setIf(SPAINT,'islam','i-sultan');
setIf(PAINT,'p-ayin','i-lastsup');setIf(PAINT,'p-topraklar','i-deesis');setIf(PAINT,'p-tesbihtarihi','i-instros');setIf(PAINT,'p-surec','i-bapt');setIf(PAINT,'p-islam','i-sultan');
// parables and miracles: the specific scene when there is one
var MES_ONE={'musrif-ogul':'i-prodig','iyi-samiriyeli':'i-samarit','on-kiz':'i-virgins','kayip-koyun':'i-shepherd','koyunlar-ve-keciler':'i-lastjud'};
var MIR_ONE={bolsena:'i-bolsena',lanciano:'i-disputa',guadalupe:'i-mercy',fatima:'i-immac',lourdes:'i-immac',zeytun:'i-hodeg'};
var mesPaint7=mesPaint,mirPaint7=mirPaint;
mesPaint=function(id){return hasA(MES_ONE[id])||mesPaint7(id)};
mirPaint=function(id){return hasA(MIR_ONE[id])||mirPaint7(id)};
Object.keys(MES_ONE).forEach(function(id){var p=POSTS['p-mes-'+id];if(p&&hasA(MES_ONE[id]))PAINT['p-mes-'+id]=MES_ONE[id]});
Object.keys(MIR_ONE).forEach(function(id){var p=POSTS['p-mir-'+id];if(p&&hasA(MIR_ONE[id]))PAINT['p-mir-'+id]=MIR_ONE[id]});
// the headers of the long readings
var readerPaint7=readerPaint;
readerPaint=function(k){var M={gunah:'i-confess',mass:'i-lastsup',islam:'i-sultan','page:topraklar':'i-deesis','page:neden':'i-keys','page:tesbihtarihi':'i-instros','page:surec':'i-bapt','cx:iman':'i-trinity','cx:emir':'i-lastjud','cx:ekler':'i-hodeg'};return hasA(M[k])||readerPaint7(k)};
readerHero=function(k){var pk=readerPaint(k),rd=view.querySelector('.rd');if(!pk||!rd)return;var first=rd.firstElementChild;if(!first||first.tagName!=='DIV'||!first.querySelector('.av'))return;
  first.replaceWith(h('<figure class="rhero pa-'+pk+'"><figcaption>'+esc(artCap(pk))+'</figcaption></figure>'))};
// pools for the paintings between sections: the icons join Caravaggio
[['comp0',['i-trinity','i-annunc','i-nativ','i-bapt','i-transf','i-agony','i-pieta','i-resur','i-pentec','i-assunt','i-lastjud','i-pantoc','i-deesis']],['comp1',['i-lastsup','i-lamb','i-agnus','i-sevens','i-confess','i-comm','i-bolsena','i-disputa','i-pentec']],['comp2',['i-keys','i-prodig','i-samarit','i-aquinas','i-lastjud','i-mercy','i-sheart']],['comp3',['i-rosary','i-hodeg','i-francis','i-teresa','i-cather','i-jerome','i-agony','i-sheart']],
 ['islam',['i-sultan','i-trinity','i-pantoc','i-deesis','i-keys']],['ateizm',['i-athens','i-paulath','i-aquinas','i-resur']],['gunah',['i-confess','i-prodig','i-keys']],['mass',['i-lastsup','i-lamb','i-agnus','i-comm','i-disputa','i-bolsena']],
 ['page:topraklar',['i-deesis','i-paulath','i-nicholas','i-patmos','i-pantoc']],['page:neden',['i-keys','i-trent','i-petpaul','i-disputa']],['page:tesbihtarihi',['i-rosegar','i-instros','i-rosary','i-mercy']],['page:surec',['i-bapt','i-pentec','i-comm']],['cx',['i-trinity','i-pantoc','i-hodeg','i-trent']]]
 .forEach(function(x){var mine=x[1].filter(hasA);if(!mine.length)return;var old=INL[x[0]]||[],out=[];for(var i=0;i<Math.max(old.length,mine.length);i++){if(mine[i])out.push(mine[i]);if(old[i])out.push(old[i])}INL[x[0]]=out});
// stories of the Katekizm questions draw from the same art
Q_POOL[0]=Q_POOL[0].concat(['i-trinity','i-pantoc','i-nativ','i-resur','i-annunc'].filter(hasA));Q_POOL[1]=Q_POOL[1].concat(['i-lastsup','i-sevens','i-lamb','i-confess'].filter(hasA));Q_POOL[2]=Q_POOL[2].concat(['i-keys','i-prodig','i-samarit'].filter(hasA));Q_POOL[3]=Q_POOL[3].concat(['i-rosary','i-hodeg','i-teresa'].filter(hasA));
// credits
var docCredits8=docCredits;
docCredits=function(){var ks=Object.keys(D.artmeta).filter(hasA);if(!ks.length)return docCredits8();
  var all=D.carav,only={};Object.keys(all).forEach(function(k){if(k.indexOf('i-')!==0)only[k]=all[k]});D.carav=only;var base;try{base=docCredits8()}finally{D.carav=all}
  return base+'<h2 id="sicon">İkonlar ve kutsal sanat</h2><p>Ikonlar, freskler ve sunak resimleri kamu malıdır; görüntüler Web Gallery of Art’tan alınmıştır.</p><ul class="dl cred">'+ks.map(function(k){var m=D.artmeta[k];return '<li><b>'+esc(m.t)+'</b>: '+esc(m.a)+' · '+esc(m.loc)+' · Kamu malı · <a href="'+esc(m.src)+'" target="_blank" rel="noopener">kaynak</a></li>'}).join('')+'</ul>'};
