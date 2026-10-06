/* ===== v11: the app in English. The data is already English (swapped at start-up); this turns the
   interface's own words into English as they appear, and the Dil switch reloads the app in the other language ===== */
LANG_NOTE=LANG==='en';
// the language switch, in Ayarlar and in the appearance sheet
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-lang]');if(!b)return;var v=b.getAttribute('data-lang');if(v===LANG)return;
  e.preventDefault();e.stopPropagation();try{localStorage.setItem('kdig.lang',v)}catch(x){}
  document.documentElement.classList.add('relang');setTimeout(function(){location.reload()},120)},true);
if(LANG==='en'){
  // English handles: the fixed accounts by hand, saints by hand, popes and churches from their English names
  var H_FIX={bugun:'today',katekizm:'catechism',azizler:'saints',papalar:'popes',tesbih:'rosary',gunah:'confession',ayin:'holy.mass',kilise:'find.a.church',islam:'answering.islam',ateizm:'answering.atheism',neden:'why.catholic',surec:'becoming.catholic',meseller:'parables',mucizeler:'miracles',topraklar:'in.our.lands',tesbihtarihi:'rosary.history',sss:'questions',
    'meryem-ana':'blessed.virgin.mary','aziz-yusuf':'saint.joseph','havari-petrus':'saint.peter','havari-pavlus':'saint.paul','vaftizci-yahya':'john.the.baptist','havari-yuhanna':'saint.john','aziz-augustinus':'saint.augustine','aziz-thomas-aquinas':'thomas.aquinas','assisili-aziz-francis':'francis.of.assisi','sienali-aziz-catharina':'catherine.of.siena','avilali-aziz-teresa':'teresa.of.avila','lisieuxlu-kucuk-teresa':'therese.of.lisieux','aziz-ignatius-loyola':'ignatius.of.loyola','aziz-benedictus':'saint.benedict','aziz-patrick':'saint.patrick','padovali-aziz-antonius':'anthony.of.padua','kalkutali-aziz-teresa':'mother.teresa','aziz-ii-yuhanna-pavlus':'john.paul.ii','padre-pio':'padre.pio','aziz-hieronymus':'saint.jerome'};
  var ROM={I:1,V:5,X:10,L:50,C:100};
  var romN=function(r){var n=0;for(var i=0;i<r.length;i++){var v=ROM[r[i]],w=ROM[r[i+1]]||0;n+=v<w?-v:v}return n};
  var slug=function(t){return t.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ı/g,'i').toLowerCase().replace(/\(.*?\)/g,' ').replace(/[’'`.]/g,'').replace(/[^a-z0-9]+/g,'.').replace(/^\.|\.$/g,'')};
  var HMAP={},taken={};
  Object.keys(ACC).forEach(function(id){var a=ACC[id],h=null;if(!a||!a.handle||id==='me')return;
    if(H_FIX[id])h=H_FIX[id];
    else if(a.pope||/^papa-/.test(id)){var nm=a.name.replace(/^Pope\s+/,'').replace(/^Saint\s+/,''),m=nm.match(/^(.*?)\s+([IVXLC]+)$/);h='pope.'+(m?slug(m[1])+'.'+romN(m[2]):slug(nm))}
    else if(a.church){var c=a.church;h=slug(c.s||c.n);if(taken[h])h+='.'+slug(a.city&&a.city.n||c.dist||'')}
    if(!h)return;taken[h]=1;HMAP[a.handle]=h;a.handle=h});
  Object.keys(HMAP).forEach(function(k){if(!(I18N.s[k]))I18N.s[k]=HMAP[k]});
  I18N.s['katekizm · soru']='catechism · question';
  var I18K=I18N.rx||[],I18M=new Map(Object.entries(I18N.s||{}));
  var MON={'Ocak':'January','Şubat':'February','Mart':'March','Nisan':'April','Mayıs':'May','Haziran':'June','Temmuz':'July','Ağustos':'August','Eylül':'September','Ekim':'October','Kasım':'November','Aralık':'December'};
  var tr1=function(s){if(!s||!/[^\s\d.,:;!?·()\/%+–-]/.test(s))return s;var t=s.trim();if(!t)return s;
    var hit=I18M.get(t);if(hit!=null)return s.replace(t,hit);
    var o=t;for(var i=0;i<I18K.length;i++){I18K[i][0].lastIndex=0;o=o.replace(I18K[i][0],I18K[i][1])}var h2=I18M.get(o);if(h2!=null)o=h2;
    o=o.replace(/(\d{1,2}) (Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)\b/g,function(_,d,m){return MON[m]+' '+d});
    return o===t?s:s.replace(t,o)};
  window.__tr=tr1;
  var ATTR=['aria-label','placeholder','title','data-title','alt'];
  var skipTr=function(n){var p=n.parentNode;return !p||p.nodeName==='SCRIPT'||p.nodeName==='STYLE'||(p.closest&&p.closest('textarea,[data-notr]'))};
  var walk=function(root){if(root.nodeType===3){if(!skipTr(root)){var v=tr1(root.nodeValue);if(v!==root.nodeValue)root.nodeValue=v}return}
    if(root.nodeType!==1)return;if(root.closest&&root.closest('[data-notr],script,style'))return;
    ATTR.forEach(function(a){var v=root.getAttribute&&root.getAttribute(a);if(v){var w=tr1(v);if(w!==v)root.setAttribute(a,w)}});
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT),n;
    while((n=w.nextNode())){if(n.nodeType===3){if(!skipTr(n)){var t=tr1(n.nodeValue);if(t!==n.nodeValue)n.nodeValue=t}}else ATTR.forEach(function(a){var v=n.getAttribute(a);if(v){var x=tr1(v);if(x!==v)n.setAttribute(a,x)}})}};
  var busy=false;
  new MutationObserver(function(ms){if(busy)return;busy=true;try{ms.forEach(function(m){if(m.type==='characterData')walk(m.target);else if(m.type==='attributes')walk(m.target);else m.addedNodes.forEach(walk)})}finally{busy=false}})
    .observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTR});
  walk(document.body);
  document.title='Catholic World';document.documentElement.lang='en';
  var toast11=toast;toast=function(m,ok){return toast11(tr1(String(m)),ok)};
}
