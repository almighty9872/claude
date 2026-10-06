/* ===== v12: simpler profiles, direct pages, the rosary in four posts, papal documents, ESC everywhere ===== */
var L12=LANG==='en';
var MULTI_SVG='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="13" height="13" rx="2"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/></svg>';

// ----- 1. these accounts are pages, not profiles: open their full text straight away
var DIRECT12={neden:1,gunah:1,tesbihtarihi:1,ayin:1,surec:1,islam:1,ateizm:1};
var vProfile12=vProfile;
vProfile=function(id){var a=ACC[id];
  if(DIRECT12[id]&&a&&a.read){var top=stack[stack.length-1];if(top&&top.name==='profile'){top.name='reader';top.arg=a.read}return vReader(a.read)}
  vProfile12(id);flatProfile(id)};

// ----- 2. the rosary: four posts, one for each set of mysteries, each sliding through its five mysteries
var ROS12=[];
D.tes.sets.forEach(function(st,si){var sa=SET_ART[st.id]||['beads','gold'],pid='p-ros-'+st.id,P=MYST[si][1];
  var sl=[slideCover(sa[0],sa[1],st.dt,st.t,L12?'5 mysteries':'5 gizem')];
  st.items.forEach(function(x,j){var s=slideText(sa[0],sa[1],j+1,x,'');s.pa=hasA(P[j]);sl.push(s)});
  var cp=typeof SET_PAINT!=='undefined'&&hasA(SET_PAINT[st.id]);if(!cp||P.indexOf(cp)>=0)cp=hasA('58rosar');sl[0].pa=cp||hasA(P[0]);
  addPost({id:pid,acc:'tesbih',sub:st.dt,slides:sl,cap:st.t+(L12?': swipe through the five mysteries, then start the rosary.':': kaydırarak beş gizemi okuyun, sonra tesbihe başlayın.'),meta:L12?'5 mysteries':'5 gizem',act:'rosary',kind:'dua',title:st.t});
  PAINT[pid]=hasA(P[0])||'58rosar';ROS12.push({pid:pid,t:st.t,dt:st.dt,pa:hasA(P[0])})});
// every slide of a painted post may carry its own painting
var paintedSlide12=paintedSlide;
paintedSlide=function(s,i,k,p){return paintedSlide12(s,i,(s&&s.pa)||k,p)};
var accPosts12=accPosts;
accPosts=function(id){var r=accPosts12(id);
  if(id==='tesbih')r.grid=ROS12.map(function(o){return {t:o.t,sm:L12?'5 mysteries':'5 gizem',go:'post:'+o.pid,pa:o.pa,multi:1}});
  return r};

// ----- 3. profile tabs: the rosary's second tab opens its history; the churches' rites tab gets a church
var profTabs12=profTabs;
profTabs=function(id){var T=profTabs12(id);if(!T)return T;
  if(id==='tesbih')T.t2=['scroll2',L12?'History of the Rosary':'Tesbihin Tarihi',function(){return ''}];
  if(id==='kilise'&&T.t2)T.t2[0]='church';
  return T};
view.addEventListener('click',function(e){var b=e.target.closest('[data-pt="t2"]');if(!b||!view.querySelector('.pr[data-acc12="tesbih"]'))return;
  e.preventDefault();e.stopPropagation();go('reader','page:tesbihtarihi')},true);

// ----- 4. a profile is a photo, a few numbers and a grid: stories and highlights become posts in the grid
var POPE_P12=['i-keys','i-trent','i-coron','i-pantoc','i-deesis','i-greg','i-sermon','i-pentec'];
function persPaint12(id,i){var a=ACC[id]||{},L=[];
  if(a.saint){[typeof SAINT_PAINT!=='undefined'&&SAINT_PAINT[id],typeof SAINT_STORY!=='undefined'&&SAINT_STORY[id],typeof AZ_FB!=='undefined'&&AZ_FB[id]].forEach(function(k){if(hasA(k)&&L.indexOf(k)<0)L.push(k)});['i-lamb','i-pantoc','i-deesis','i-hodeg'].forEach(function(k){if(hasA(k)&&L.indexOf(k)<0)L.push(k)})}
  else if(a.pope)POPE_P12.forEach(function(k){if(hasA(k))L.push(k)});
  return L.length?L[i%L.length]:null}
function hlPaint12(id,i){var pp=persPaint12(id,i);if(pp)return {pa:pp};var a=ACC[id],img=a&&imgSrc(a.art);if(img)return {img:img};
  var k=(typeof gridPaint==='function'&&gridPaint(id,i,''))||hasA(storyPaint(id))||hasA('i-lamb');return {pa:k||'58rosar'}}
function tile12(attr,label,sm,p){return '<button type="button" class="tile tp9 hlt'+(p.pa?' pa-'+p.pa:'')+'" '+attr+(p.img?' style="background-image:url('+p.img+')"':'')+' aria-label="'+esc(label)+'"><span class="tp9g"></span><span class="mpi">'+MULTI_SVG+'</span>'+(sm?'<small class="tp9n">'+esc(sm)+'</small>':'')+'<b class="tp9t '+(label.length>22?'s':label.length>12?'m':'l')+'">'+esc(label)+'</b></button>'}
function plainTop12(id){var top=view.querySelector('.pr .top');if(!top)return;var a=ACC[id]||{},b=top.querySelector('[data-story]');if(!b)return;
  var d=document.createElement('div');d.className='prav'+(a.pope&&POPE_LINE[POPE_LINE.length-1]===id?' curpope':'');d.innerHTML=av(a.art,a.tone,86);b.replaceWith(d)}
function flatProfile(id){var pr=view.querySelector('.pr');if(!pr)return;pr.setAttribute('data-acc12',id);plainTop12(id);
  var grid=view.querySelector('.grid'),hl=pr.querySelector('.hls'),tiles=[];
  if(hl&&id!=='tesbih'){hl.querySelectorAll('.hl').forEach(function(b){var lab=(b.lastElementChild||b).textContent.trim();
      if(b.hasAttribute('data-near')){tiles.push(tile12('data-near',lab,'',{pa:hasA('i-pilgrim')||hasA('35emmau')}));return}
      var i=+b.getAttribute('data-i'),p;
      if(id==='kilise'){var c=D.churches.cities[i],f=c&&c.ch.filter(function(x){return chImg(x.id)})[0];p=f?{img:chImg(f.id)}:{pa:'i-lamb'};tiles.push(tile12('data-hl="kilise" data-i="'+i+'"',lab,c?c.ch.length+(L12?' churches':' kilise'):'',p));return}
      tiles.push(tile12('data-hl="'+id+'" data-i="'+i+'"',lab,'',hlPaint12(id,i)))})}
  // the account's own story, which the ring used to open, is the first post
  if(id!=='tesbih'&&id!=='kilise'){var ss=[];try{ss=storySlides(id)||[]}catch(x){}if(ss.length){var a=ACC[id],sp=hasA(storyPaint(id));tiles.unshift(tile12('data-story="'+id+'"',L12?'Story':'Hikâye',ss.length+(L12?' slides':' kare'),hlPaint12(id,0)))}}
  if(hl)hl.remove();
  if(grid&&id==='tesbih')grid.querySelectorAll('.tile').forEach(function(t){if(!t.querySelector('.mpi'))t.insertAdjacentHTML('afterbegin','<span class="mpi">'+MULTI_SVG+'</span>')});
  if(grid&&(ACC[id]&&(ACC[id].saint||ACC[id].pope))){var n=tiles.length;grid.querySelectorAll('.tile:not(.tp9)').forEach(function(t,j){var k=persPaint12(id,n+j);if(!k)return;var tt=((t.querySelector('b')||{}).textContent||'').trim(),sm=((t.querySelector('small')||{}).textContent||'').trim();
      t.className='tile tp9 pa-'+k;t.removeAttribute('style');t.innerHTML='<span class="tp9g"></span>'+(sm?'<small class="tp9n">'+esc(sm)+'</small>':'')+'<b class="tp9t '+(tt.length>22?'s':tt.length>12?'m':'l')+'">'+esc(tt)+'</b>'})}
  if(grid&&tiles.length){grid.insertAdjacentHTML('afterbegin',tiles.join(''));
    // a highlight and a post about the same section become one post: keep the multi-slide one
    var seen={};grid.querySelectorAll('.tile.hlt').forEach(function(t){seen[(t.querySelector('.tp9t')||t).textContent.trim().toLowerCase()]=1});
    grid.querySelectorAll('.tile:not(.hlt)').forEach(function(t){var b=t.querySelector('.tp9t')||t.querySelector('b');if(b&&seen[b.textContent.trim().toLowerCase()])t.remove()})}}
var vMe12=vMe;
vMe=function(){vMe12();var b=view.querySelector('.pr .top [data-story]');if(b){var d=document.createElement('div');d.className='prav';d.innerHTML=av(ACC.me.art,ACC.me.tone,86);b.replaceWith(d)}
  // paintings for the cards that had only an icon: the Bible, the common prayers and Find a Church
  var put=function(sel,k,img){var c=view.querySelector(sel);if(!c||/\bpa-/.test(c.className))return;var m=c.querySelector('.mci');if(m)m.remove();
    if(img){c.classList.add('pa-photo');c.style.backgroundImage='url('+img+')'}else if(hasA(k))c.classList.add('pa-'+k)};
  put('.mecard[data-go2="doc:kutsalkitap"]','i-jerome');
  put('.mecard[data-go="read:cx:ekler"]',hasA('i-hodeg')?'i-hodeg':'i-rosary');
  put('.mecard[data-acc="kilise"]',null,chImg('sent-antuan')||chImg('santa-maria-draperis'))};
var vKatekizm12=vKatekizm;
vKatekizm=function(){vKatekizm12();var b=view.querySelector('#kmain .pr .top [data-story]');if(b){var d=document.createElement('div');d.className='prav';d.innerHTML=av(ACC.katekizm.art,ACC.katekizm.tone,86);b.replaceWith(d)}};

// ----- 5. Tesbihin Tarihi is something to learn about, so it moves from Dua Et to Öğren
(function(){var pray=null,learn=null;MENU.forEach(function(g){if(g[0]==='Dua Et')pray=g[1];if(g[0]==='Öğren')learn=g[1]});
  if(pray&&learn){var i=-1;pray.forEach(function(m,j){if(m[0]==='tesbihtarihi')i=j});if(i>=0){var m=pray.splice(i,1)[0];learn.push(m)}}
  if(ACC.tesbihtarihi)ACC.tesbihtarihi.cat=L12?'Learn':'Öğren'})();

// ----- 6. papal documents link to their text on papalencyclicals.net
var PE12='https://www.papalencyclicals.net/';
function pdocUrl(pid,i){var L=(D.papalurl||{})[pid];var u=L&&L[i];return u?PE12+u:null}
function pdocLinks(root){root.querySelectorAll('.pdoc:not([data-pe])').forEach(function(el){el.setAttribute('data-pe','1')});
  var art=root.querySelector('article.rd'),k=readerKey&&readerKey();if(!art||!k||k.indexOf('pope:')!==0)return;var pid=k.slice(5).split('#')[0];
  art.querySelectorAll('.pdoc').forEach(function(el,i){var u=pdocUrl(pid,i);if(!u||el.querySelector('.pelink'))return;var b=el.querySelector('div');
    b.insertAdjacentHTML('beforeend','<a class="pelink" href="'+u+'" target="_blank" rel="noopener">'+(L12?'Read on papalencyclicals.net':'papalencyclicals.net’te oku')+' ↗</a>')})}
var vReader12=vReader;
// the page texts keep a little Markdown from the site's source files: fold-out blocks, bullet lists and bold labels
function mdFix12(root){var art=root.querySelector('article.rd');if(!art||art.getAttribute('data-md12'))return;art.setAttribute('data-md12','1');
  art.querySelectorAll('p').forEach(function(p){p.innerHTML=p.innerHTML.replace(/\*\*?<em>([\s\S]*?)<\/em>\*?\*/g,'<strong>$1</strong>').replace(/\*\*([^*<]+)\*\*/g,'<strong>$1</strong>')});
  var box=null,list=null;
  [].slice.call(art.children).forEach(function(el){var t=el.tagName==='P'?el.textContent.trim():null;
    if(el.tagName!=='P'){list=null;if(/^H[1-4]$/.test(el.tagName))box=null;if(box)box.appendChild(el);return}
    var open=t.match(/^\[\[\+\s*(.+?)\]\]$/);
    if(open){var d=document.createElement('details');d.className='md12';d.innerHTML='<summary>'+esc(open[1])+'</summary>';el.replaceWith(d);box=d;list=null;return}
    if(/^\[\[-\]\]$/.test(t)){el.remove();box=null;list=null;return}
    if(/^[-•]\s/.test(t)){if(!list){list=document.createElement('ul');list.className='md12';(box||el.parentNode).insertBefore(list,box?null:el);if(box)box.appendChild(list)}
      var li=document.createElement('li');li.innerHTML=el.innerHTML.replace(/^\s*[-•]\s+/,'');list.appendChild(li);el.remove();return}
    list=null;if(box)box.appendChild(el)})}
vReader=function(k){vReader12(k);mdFix12(view);pdocLinks(view);tip12(k)};
// the pope's Belgeler tab: every document with a known text opens it
view.addEventListener('click',function(e){var b=e.target.closest('.ptpane .ptr2[data-go^="read:pope:"]');if(!b)return;var pid=b.getAttribute('data-go').slice(10).split('#')[0],pr=view.querySelector('.pr[data-acc12]');
  if(!pr||pr.getAttribute('data-acc12')!==pid)return;var all=[].slice.call(view.querySelectorAll('.ptpane .ptr2[data-go^="read:pope:"]')),u=pdocUrl(pid,all.indexOf(b));
  if(u){e.preventDefault();e.stopPropagation();window.open(u,'_blank','noopener')}},true);
new MutationObserver(function(){var pr=view.querySelector('.pr[data-acc12]');if(!pr)return;var pid=pr.getAttribute('data-acc12');if(!ACC[pid]||!ACC[pid].pope)return;
  view.querySelectorAll('.ptpane .ptr2[data-go^="read:pope:"]').forEach(function(b,i){if(pdocUrl(pid,i)&&!b.querySelector('.pe12'))b.querySelector('span').insertAdjacentHTML('beforeend','<small class="pe12">papalencyclicals.net ↗</small>')})})
  .observe(view,{childList:true,subtree:true});

// ----- 7. no highlighting tip on short pages
var SHORT12={'doc:kutsalkitap':1,'doc:gizlilik':1,'doc:erisilebilirlik':1,'doc:hakkinda':1,'doc:kaynaklar':1};
function tip12(){var t=view.querySelector('.hltip');if(!t)return;var k=readerKey&&readerKey(),rd=view.querySelector('article.rd');
  if((k&&SHORT12[k])||(rd&&rd.textContent.length<9000))t.remove()}
new MutationObserver(function(){if(view.querySelector('.hltip'))tip12()}).observe(view,{childList:true,subtree:true});

// ----- 8. Escape leaves any full-screen page (Settings, a profile, a reader…) once nothing is open on top of it
document.addEventListener('keydown',function(e){if(e.key!=='Escape'||e.defaultPrevented)return;
  if(document.querySelector('.app [role="dialog"],.app .ov,.app .peek,.app .sheet,.app .glass'))return;
  var t=e.target;if(t&&/^(INPUT|TEXTAREA)$/.test(t.tagName)&&t.value){return}
  if(stack.length>1){e.preventDefault();back()}},true);
// a reference button never leaves its opening bracket or closing punctuation alone at a line end
function glueRefs12(root){root.querySelectorAll('.rf9:not([data-g12])').forEach(function(b){b.setAttribute('data-g12','1');
  var pv=b.previousSibling,nx=b.nextSibling,pre='',post='';
  if(pv&&pv.nodeType===3){var m=pv.nodeValue.match(/[(\[“"‘']$/);if(m){pre=m[0];pv.nodeValue=pv.nodeValue.slice(0,-1)}}
  if(nx&&nx.nodeType===3){var m2=nx.nodeValue.match(/^[)\]”"’',.;:!?]+/);if(m2){post=m2[0];nx.nodeValue=nx.nodeValue.slice(post.length)}}
  if(!pre&&!post)return;var s=document.createElement('span');s.className='nw12';b.replaceWith(s);if(pre)s.appendChild(document.createTextNode(pre));s.appendChild(b);if(post)s.appendChild(document.createTextNode(post))})}
var glueT12=null;new MutationObserver(function(){if(glueT12)return;glueT12=setTimeout(function(){glueT12=null;glueRefs12(view)},0)}).observe(view,{childList:true,subtree:true});

// ----- 9. arriving from a page of the site (/app/?p=havari-pavlus or ?p=en/mass): open the same thing here
var ROUTE12={'':['tab','home'],index:['tab','home'],
  'neden-katoligiz':['reader','page:neden'],'why-were-catholic':['reader','page:neden'],
  'katolik-sureci':['reader','page:surec'],'becoming-catholic':['reader','page:surec'],
  'topraklarimizda-hristiyanlik':['reader','page:topraklar'],anatolia:['reader','page:topraklar'],
  'tesbih-tarihi':['reader','page:tesbihtarihi'],'history-of-the-rosary':['reader','page:tesbihtarihi'],
  'gunah-cikarma':['reader','gunah'],confession:['reader','gunah'],'kutsal-ayin':['reader','mass'],mass:['reader','mass'],
  'islama-cevap':['reader','islam'],'answering-islam':['reader','islam'],'ateizme-cevap':['reader','ateizm'],'answering-atheism':['reader','ateizm'],
  katekizm:['tab','katekizm'],katesizm:['tab','katekizm'],compendium:['tab','katekizm'],giris:['reader','cx:giris'],introduction:['reader','cx:giris'],
  'iman-ikrari':['reader','comp:0'],'profession-of-faith':['reader','comp:0'],'kutsal-sirlar':['reader','comp:1'],'celebration-of-christian-mystery':['reader','comp:1'],
  'mesihte-yasam':['reader','comp:2'],'life-in-christ':['reader','comp:2'],'hristiyan-duasi':['reader','comp:3'],'christian-prayer':['reader','comp:3'],
  ekler:['reader','cx:ekler'],appendix:['reader','cx:ekler'],'motu-proprio':['reader','cx:motu'],
  'kutsal-kitap':['reader','doc:kutsalkitap'],bible:['reader','doc:kutsalkitap'],sss:['go','inbox'],faq:['go','inbox'],
  azizler:['acc','azizler'],saints:['acc','azizler'],meseller:['acc','meseller'],parables:['acc','meseller'],mucizeler:['acc','mucizeler'],miracles:['acc','mucizeler'],
  'tesbih-duasi':['acc','tesbih'],rosary:['acc','tesbih'],kiliseler:['tab','kilisetab'],'find-a-church':['tab','kilisetab'],
  iletisim:['go','contact'],contact:['go','contact'],gizlilik:['reader','doc:gizlilik'],privacy:['reader','doc:gizlilik'],
  erisilebilirlik:['reader','doc:erisilebilirlik'],accessibility:['reader','doc:erisilebilirlik'],'kaynaklar-ve-telif':['reader','doc:kaynaklar'],'sources-and-copyright':['reader','doc:kaynaklar']};
var EN_SAINT12={'anthony-of-padua':'padovali-aziz-antonius','catherine-of-siena':'sienali-aziz-catharina','francis-of-assisi':'assisili-aziz-francis','ignatius-of-loyola':'aziz-ignatius-loyola','john-paul-ii':'aziz-ii-yuhanna-pavlus','john-the-baptist':'vaftizci-yahya',mary:'meryem-ana','mother-teresa':'kalkutali-aziz-teresa','padre-pio':'padre-pio','saint-augustine':'aziz-augustinus','saint-benedict':'aziz-benedictus','saint-jerome':'aziz-hieronymus','saint-john':'havari-yuhanna','saint-joseph':'aziz-yusuf','saint-patrick':'aziz-patrick','saint-paul':'havari-pavlus','saint-peter':'havari-petrus','teresa-of-avila':'avilali-aziz-teresa','therese-of-lisieux':'lisieuxlu-kucuk-teresa','thomas-aquinas':'aziz-thomas-aquinas'};
function route12(path){var p=String(path||'').replace(/^\/+/,'').replace(/\.html$/,'').replace(/^en\/?/,'').replace(/\/index$/,'').replace(/\/$/,'');
  var m=p.match(/^(?:kilise|church)\/([a-z0-9-]+)$/);if(m&&CH_OF[m[1]])return ['church',m[1]];
  if(ROUTE12[p])return ROUTE12[p];var sid=EN_SAINT12[p]||p;if(D.saints.some(function(s){return s.id===sid}))return ['reader','saint:'+sid];return null}
setTimeout(function(){var q;try{q=new URLSearchParams(location.search).get('p')}catch(e){}if(q==null)return;
  var r=route12(q);try{history.replaceState(history.state,'',location.pathname+location.hash)}catch(e){}
  if(!r||(r[0]==='tab'&&r[1]==='home'))return;
  if(r[0]==='tab')setTab(r[1]);else if(r[0]==='acc')openAcc(r[1]);else if(r[0]==='church')go('church',r[1]);else if(r[0]==='go')go(r[1]);else go(r[0],r[1])},0);
// the site's own pages, opened from the app, stay on the site
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-ext]');if(!b||!app.contains(b))return;
  e.preventDefault();e.stopImmediatePropagation();window.open(SITE+b.getAttribute('data-ext')+'?site=1','_blank','noopener')},true);
