/* ===== v9 ===== */
ICONS.note='<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4M8.5 11h7M8.5 15h7M8.5 19h4"/>';
ICONS.print='<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>';
ICONS.hlt='<path d="m9 15 7.5-7.5-3-3L6 12l-1 4z"/><path d="M4 21h16"/>';
ICONS.plusn='<path d="M5 3h10l4 4v14H5z"/><path d="M12 10v7M8.5 13.5h7"/>';
ICONS.alert='<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/>';
ICONS.bug='<path d="M8 8a4 4 0 0 1 8 0v1H8z"/><rect x="7" y="9" width="10" height="10" rx="5"/><path d="M12 13v6M3 13h4M17 13h4M4 8l3 2M20 8l-3 2M4 19l3-2M20 19l-3-2"/>';
function pk9(){for(var i=0;i<arguments.length;i++){var k=arguments[i];if(k&&D.carav&&D.carav[k])return k}return null}
function rnd9(){return seeded((Date.now()%2147483647)||11)}

/* ---------- 1. home stories: our five sections ---------- */
var SEC9=[
 {id:'sec:ogren',g:'Öğren',ic:'book',pa:['i-athens','43jerome'],lead:'İnancın temelleri: soru soru, adım adım.'},
 {id:'sec:tartis',g:'Tartış',ic:'comment',pa:['i-paulath','26conta'],lead:'İtirazlara akılla ve kaynaklarla cevap.'},
 {id:'sec:kesfet',g:'Keşfet',ic:'search',pa:['i-keys','28ceras'],lead:'Azizler, papalar, mucizeler ve kiliseler.'},
 {id:'sec:duaet',g:'Dua Et',ic:'candle2',pa:['i-rosegar','58rosar'],lead:'Ayin, tesbih ve günah çıkarma rehberi.'},
 {id:'sec:site',g:'Site',ic:'info',pa:['i-hodeg','42loreto'],lead:'Bize yazın, notlarınızı ve ayarlarınızı yönetin.'}];
var SEC_LAB={'Öğren':'Öğren','Tartış':'Tartış','Keşfet':'Keşfet','Dua Et':'Dua Et','Site':'Site'};
if(LANG==='en'){SEC_LAB=EN.secName;SEC9.forEach(function(s){s.lead=EN.secLead[s.g]})}
function secNm(g){return SEC_LAB[g]||g}
var EXT9={'kutsal-kitap.html':['Kutsal Kitap','Kitaplar, bölümler ve nereden başlayacağınıza dair bir okuma rehberi.','i-jerome','doc:kutsalkitap'],
 'ekler.html':['Sık Kullanılan Dualar','Haç işareti, Rab’bin Duası, Selam Sana Meryem ve her gün okunan diğer dualar.','i-rosary','read:cx:ekler'],
 'iletisim.html':['İletişim','Sorunuzu yazın; e-postayla cevap verelim.','i-paulath','contact'],
 'erisilebilirlik.html':['Erişilebilirlik','Sitenin herkes için kolay okunması için yaptıklarımız.','i-lamb','doc:erisilebilirlik'],
 'gizlilik.html':['Gizlilik','Bu sitede verilerinizin nasıl ele alındığı.','i-confess','doc:gizlilik']};
if(LANG==='en')EXT9=EN.ext9;
function secOf(id){for(var i=0;i<SEC9.length;i++)if(SEC9[i].id===id)return SEC9[i];return null}
function secItems(s){var g=null;MENU.forEach(function(x){if(x[0]===s.g)g=x[1]});var out=(g||[]).map(function(m){
   if(m[0].indexOf('ext:')===0){var e=EXT9[m[0].slice(4)]||[m[1],'','i-lamb','ext:'+m[0].slice(4)];return {t:e[0],x:e[1],pa:pk9(e[2]),go:e[3]}}
   var a=ACC[m[0]];return {t:m[1],x:a?a.bio:'',pa:pk9(SPAINT[m[0]],storyPaint6&&storyPaint6(m[0]),'i-lamb'),go:'acc:'+m[0]}});
  if(s.id==='sec:site')out.push({t:LANG==='en'?'My Notes':'Notlarım',x:LANG==='en'?'The notes you take and the passages you mark while reading. You can print them or send them by email.':'Okurken aldığınız notlar ve işaretlediğiniz yerler. Yazdırabilir ya da e-postayla gönderebilirsiniz.',pa:pk9('i-august','43jerome'),go:'notes'},{t:LANG==='en'?'Settings':'Ayarlar',x:LANG==='en'?'Theme, text size, reading aloud and notifications.':'Tema, yazı boyutu, sesli okuma ve bildirimler.',pa:pk9('i-trent','23conta'),go:'settings'});
  var used={};out.forEach(function(o){if(used[o.pa])o.pa=pk9('i-lamb','i-pantoc','i-deesis','i-hodeg','35emmau')||o.pa;used[o.pa]=1});
  return out}
var storyOrder9=storyOrder;
storyOrder=function(){return ['bugun'].concat(SEC9.map(function(s){return s.id})).concat(follows.filter(function(id){return ACC[id]}))};
// stories never turn grey: they are a menu, not a feed to clear
isSeen=function(){return false};
seen={};try{sset('seen',{})}catch(e){}
var storyAcc9=storyAcc;
storyAcc=function(id){var s=secOf(id);if(s)return {id:id,name:secNm(s.g),handle:secNm(s.g).toLocaleLowerCase('tr'),art:'ich',tone:'gold',url:''};return storyAcc9(id)};
var storySlides9=storySlides;
storySlides=function(id){var s=secOf(id);if(!s)return storySlides9(id);
  var it=secItems(s),S=[{kick:'katolikdunyasi',title:s.g,text:s.lead+'\n'+it.map(function(o){return o.t}).join(' · '),pa:pk9.apply(null,s.pa),dur:6000,sec:1}];
  it.forEach(function(o,i){S.push({kick:s.g+' · '+(i+1)+'/'+it.length,title:o.t,text:cut(plain(o.x),170),pa:o.pa,btn:['Aç',o.go],dur:6000})});
  return S};
var storyDur9=storyDur;storyDur=function(s){return s&&s.dur?s.dur:storyDur9(s)};
var ringPaint9=ringPaint;
ringPaint=function(id,used){var s=secOf(id);if(s)return pk9.apply(null,s.pa);return ringPaint9(id,used)};
var stoHTML9=stoHTML;
stoHTML=function(id){var s=secOf(id);
  if(!s){var r=stoHTML9(id);return r.replace(/ seen(?=["\s])/g,'').replace(' (görüldü)','')}
  var pk=pk9.apply(null,s.pa);
  return '<button type="button" class="sto sec9" data-story="'+id+'" aria-label="'+esc(secNm(s.g))+' hikâyesi"><span class="ring" style="width:70px;height:70px"><span class="in"><span class="av rpaint'+(pk?' pa-'+pk:'')+'"><span class="secic">'+ic(s.ic)+'</span></span></span></span><span>'+esc(secNm(s.g))+'</span></button>'};
var storyPaint9=storyPaint;
storyPaint=function(id){var s=secOf(id);if(s)return pk9.apply(null,s.pa);return storyPaint9(id)};
markSeen=function(){};

/* ---------- 2. the home feed: the saint of the day, coming feasts, the saints' words and Scripture ---------- */
var VERSES=[
 ['Yaratılış 1:1','Başlangıçta Tanrı gökleri ve yeri yarattı.','i-trinity'],
 ['Mezmur 119:105','Sözün adımlarım için kandil, yolum için ışıktır.','43jerome'],
 ['Yeşaya 32:17','Doğruluğun ürünü esenlik, doğruluğun sonucu da sonsuza dek huzur ve güven olacak.','i-lamb'],
 ['Yeremya 29:13','Beni arayacaksınız ve bütün yüreğinizle aradığınızda beni bulacaksınız.','12magda'],
 ['Mezmur 51:19','Tanrı’nın istediği kurban kırık bir ruhtur. Kırık ve pişman bir yüreği küçümsemezsin, ey Tanrı.','i-prodig'],
 ['Yaratılış 3:15','Seninle kadın arasına, senin soyunla onun soyu arasına düşmanlık koyacağım. O senin başını ezecek, sen onun topuğunu yaralayacaksın.','i-immac'],
 ['Yuhanna 1:1','Başlangıçta Söz vardı. Söz Tanrı’yla birlikteydi ve Söz Tanrı’ydı.','i-pantoc'],
 ['Yuhanna 1:14','Söz insan oldu ve aramızda yaşadı. O’nun yüceliğini, lütuf ve gerçekle dolu biricik Oğul’un yüceliğini gördük.','i-nativ'],
 ['Yuhanna 14:6','İsa, “Yol, gerçek ve yaşam benim” dedi. “Benim aracılığım olmadan Baba’ya kimse gelemez.”','i-transf'],
 ['Yuhanna 13:34','Size yeni bir buyruk veriyorum: Birbirinizi sevin. Sizi nasıl sevdiysem, siz de birbirinizi öyle sevin.','i-lastsup'],
 ['Yuhanna 6:55','Çünkü benim bedenim gerçek yiyecek, kanım gerçek içecektir.','i-bolsena'],
 ['Yuhanna 8:36','Eğer Oğul sizi özgür kılarsa, gerçekten özgür olursunuz.','i-resur'],
 ['Luka 1:38','Meryem, “Ben Rab’bin kuluyum” dedi. “Bana dediğin gibi olsun.”','i-annunc'],
 ['Luka 1:37','Çünkü Tanrı için imkânsız hiçbir şey yoktur.','66annunc'],
 ['Luka 23:43','İsa ona, “Sana doğrusunu söyleyeyim, sen bugün benimle birlikte cennette olacaksın” dedi.','37depos'],
 ['Matta 5:3','Ne mutlu ruhta yoksul olanlara! Çünkü Göklerin Egemenliği onlarındır.','i-sermon','49franci'],
 ['Matta 5:9','Ne mutlu barışı sağlayanlara! Çünkü onlara Tanrı’nın çocukları denecek.','i-sultan'],
 ['Matta 7:7-8','Dileyin, size verilecek; arayın, bulacaksınız; kapıyı çalın, size açılacak.','i-agony'],
 ['Matta 16:18','Sen Petrus’sun ve ben kilisemi bu kaya üzerine kuracağım. Ölüler diyarının kapıları ona karşı direnemeyecek.','i-keys'],
 ['Matta 25:40','Size doğrusunu söyleyeyim, bu en önemsiz kardeşlerimden birine yaptığınızı bana yapmış oldunuz.','i-samarit'],
 ['Matta 28:20','İşte ben, dünyanın sonuna dek her an sizinle birlikteyim.','i-ascens','47emmau'],
 ['1 Korintliler 13:5','Sevgi kaba davranmaz, kendi çıkarını aramaz, kolay kolay öfkelenmez, kötülüğün hesabını tutmaz.','i-mercy'],
 ['2 Korintliler 5:17','Bir kimse Mesih’teyse yeni yaratıktır. Eski şeyler geçmiş, her şey yeni olmuştur.','29ceras'],
 ['1 Yuhanna 1:5','Tanrı ışıktır, O’nda hiç karanlık yoktur.','i-pentec'],
 ['1 Yuhanna 4:16','Tanrı sevgidir. Sevgide yaşayan Tanrı’da yaşar, Tanrı da onda yaşar.','i-sheart'],
 ['Vahiy 21:4','Onların gözlerinden bütün yaşları silecek. Artık ölüm olmayacak. Yas, ağlayış, acı da olmayacak.','i-lastjud'],
 ['Filipililer 2:8','İnsan biçiminde görünerek ölüme, çarmıh üzerinde ölüme bile boyun eğerek kendini alçalttı.','i-pieta'],
 ['Romalılar 12:2','Bu dünyanın gidişine uymayın; düşüncenizin yenilenmesiyle değişin.','i-august'],
 ['Galatyalılar 6:2','Birbirinizin yükünü taşıyın. Böylece Mesih’in Yasası’nı yerine getirmiş olursunuz.','i-calvary','55flagel'],
 ['Koloseliler 3:14','Bütün bunların üstünde, her şeyi yetkin bir birlik içinde birbirine bağlayan sevgiyi giyinin.','i-coron']];
if(LANG==='en')VERSES=EN.verses;
// the saints' words: from the Katekizm, plus a few from the saints' own pages
var SAINT_ACC9={'Aziz Augustinus':'aziz-augustinus','Aquinolu Aziz Tomas':'aziz-thomas-aquinas','Loyolalı Aziz İgnatius':'aziz-ignatius-loyola','Aziz Hieronymus':'aziz-hieronymus'};
var SQ_PAINT={'Aziz Augustinus':'i-august','Aquinolu Aziz Tomas':'i-aquinas','Loyolalı Aziz İgnatius':'i-trent','Haç’ın Aziz Yuhannası':'i-pantoc','Aziz Kiprianus':'i-petpaul','Aziz İreneus':'i-deesis','Büyük Aziz Basileios':'i-michael','Kudüslü Aziz Kirillos':'i-bapt','Büyük Aziz Leo':'i-keys','Antakyalı Aziz İgnatius':'i-comm','Nyssalı Aziz Gregorios':'i-transf','Ars’ın Rahibi Aziz Jean-Marie Vianney':'i-confess','Nazianzoslu Aziz Gregorios':'i-hodeg','Aziz Yuhanna Hrisostomos':'i-nicholas','Mogrovejo’lu Aziz Turibius':'i-trinity','Kutsal Üçlü’nün Kutsanmış Elizabeth’i':'i-teresa'};
var EXTRA_SQ=[
 ['Assisili Aziz Fransuva','Rab’bim, beni barışının bir aracı kıl. Nefret olan yere sevgi, kırgınlık olan yere bağışlama getireyim.','i-francis','assisili-aziz-francis'],
 ['Avilalı Azize Teresa','Hiçbir şey seni kaygılandırmasın, hiçbir şey seni korkutmasın. Her şey geçer; Tanrı değişmez. Tanrı’ya sahip olana hiçbir şey eksik olmaz.','i-teresa','avilali-aziz-teresa'],
 ['Sienalı Azize Katerina','Olmanız gereken kişi olun, dünyayı ateşe vereceksiniz.','i-cather','sienali-aziz-catharina'],
 ['Lisieux’lü Küçük Teresa','Benim için dua, yüreğin bir atılışı, göğe doğru basit bir bakış, sınavın ortasında da sevinçte de bir şükran ve sevgi çığlığıdır.','i-rosary','lisieuxlu-kucuk-teresa'],
 ['Padre Pio','Dua et, umut et, kaygılanma. Kaygı işe yaramaz. Tanrı merhametlidir ve duanı işitecektir.','05franc','padre-pio'],
 ['Aziz II. Ioannes Paulus','Korkmayın! Kapılarınızı Mesih’e ardına kadar açın.','i-keys','aziz-ii-yuhanna-pavlus']];
if(LANG==='en'){EXTRA_SQ=EN.extraSq;SAINT_ACC9=EN.saintAcc;SQ_PAINT=EN.sqPaint}
function feedQuotes(){var out=[];kzQuotes().forEach(function(q,i){if(!/Aziz|Azize|Elizabeth|Saint|Blessed/.test(q.by)||/Litürji|Liturgy/.test(q.by))return;var t=q.t.replace(/^[“"]|[”"]$/g,'').replace(/\s*…\s*$/,'');
  if(t.indexOf('“')>0&&t.indexOf('“')<40&&!/^“/.test(q.t))return;out.push({id:'p-sq-'+i,by:q.by,t:t,pa:pk9(SQ_PAINT[q.by],PART_PAINT[q.pi]),acc:SAINT_ACC9[q.by]||'azizler',go:q.go})});
  EXTRA_SQ.forEach(function(x,i){out.push({id:'p-sx-'+i,by:x[0],t:x[1],pa:pk9(x[2],'05franc'),acc:ACC[x[3]]?x[3]:'azizler',go:'acc:'+x[3]})});return out}
function feastPaint(n){n=n||'';return pk9(/Noel|Doğuş/.test(n)?'i-nativ':/Göğe Alın/.test(n)?'i-assunt':/Lekesiz/.test(n)?'i-immac':/Müjde/.test(n)?'i-annunc':/Tesbih/.test(n)?'i-rosegar':/Meryem/.test(n)?'i-coron':/Yusuf/.test(n)?'i-joseph':/Mikail|Melek/.test(n)?'i-michael':/Petrus|Pavlus/.test(n)?'i-petpaul':/Havari/.test(n)?'i-pentec':/Haç/.test(n)?'i-calvary':/Kral/.test(n)?'i-pantoc':/Azizler/.test(n)?'i-lamb':/Fransuva/.test(n)?'i-francis':/Teresa/.test(n)?'i-teresa':'i-deesis','i-lamb')}
var QP9={},FEASTP9={};
(function(){
  feedQuotes().forEach(function(q){QP9[q.id]=q.pa;addPost({id:q.id,acc:q.acc,sub:'Azizlerin sözleri',kind:'soz',title:q.by,slides:[{type:'quote',q:q.t,by:q.by,pa:q.pa}],cap:'“'+q.t+'” ('+q.by+')',meta:q.by,read:null,go:q.go})});
  VERSES.forEach(function(v,i){var id='p-v-'+i;QP9[id]=pk9(v[2],v[3],'i-lamb');addPost({id:id,acc:'me',sub:'Kutsal Kitap’tan',kind:'ayet',title:v[0],slides:[{type:'quote',q:v[1],by:v[0],bib:1,pa:QP9[id]}],cap:v[1]+' ('+v[0]+')',meta:v[0]})});
  upcomingFeasts(6).forEach(function(f){var id='p-feast-'+f.k,r=D.days[f.k],x=r&&r[0]||{},dl=dateTR(f.d);FEASTP9[id]=feastPaint(f.n);
    var sl=[{type:'feast',kick:f.days===1?'Yarın':f.days+' gün sonra',title:f.n,sub:dl+(f.rank?' · '+f.rank:''),pa:FEASTP9[id]}];
    var tx=plain(x.t||x.b||'');if(tx)sl.push({type:'feastx',title:f.n,text:cut(tx,300),pa:FEASTP9[id]});
    addPost({id:id,acc:'azizler',sub:'Yaklaşan bayram · '+dl,kind:'bayram',title:f.n,slides:sl,cap:f.n+': '+dl+(tx?'. '+cut(tx,120):''),capFull:f.n+': '+dl+(tx?'. '+plain(tx):''),meta:(f.rank||'Bayram')+' · '+dl,read:'today'})});
})();
var paintFor9=paintFor;
paintFor=function(pid){if(pid&&QP9[pid])return QP9[pid];if(pid&&FEASTP9[pid])return FEASTP9[pid];return paintFor9(pid)};
var paintedSlide9=paintedSlide;
paintedSlide=function(s,i,k,p){
  if(s.type==='quote'){var n=s.q.length,sz=n>150?'qs':n>90?'qm':'ql';return '<div class="sl pt q9 pa-'+(s.pa||k)+'"><div class="q9g"></div><div class="q9c"><span class="q9m" aria-hidden="true">“</span><p class="q9t '+sz+'">'+esc(s.q)+'</p><span class="q9by">'+(s.bib?'<i>'+ic('book')+'</i>':'')+esc(s.by)+'</span></div><span class="ptb">katolikdunyasi.com</span></div>'}
  if(s.type==='feast')return '<div class="sl pt f9 pa-'+(s.pa||k)+'"><div class="ptg"></div><div class="ptc"><span class="f9k">'+ic('cal')+esc(s.kick)+'</span><h2 class="ptt '+ttSize(s.title)+'">'+esc(UP(s.title))+'</h2><span class="pts">'+esc(s.sub)+'</span></div><span class="ptb">katolikdunyasi.com</span></div>';
  if(s.type==='feastx')return paintedSlide9({type:'text',title:s.title,text:s.text,n:''},i,s.pa||k,p);
  return paintedSlide9(s,i,k,p)};
shuffleFeed=function(){
  var r=rnd9(),last=sget('lasttop',''),ids=Object.keys(POSTS);
  var q=shuffle(ids.filter(function(id){return /^p-(sq|sx|v)-/.test(id)&&!hidden[id]}),r),fe=ids.filter(function(id){return id.indexOf('p-feast-')===0&&!hidden[id]});
  var out=['p-today'],qi=0;
  // two quotes, then a feast, and so on; the feasts stay in date order
  fe.forEach(function(f){out.push(q[qi++],q[qi++],f)});
  while(qi<q.length&&out.length<24)out.push(q[qi++]);
  out=out.filter(Boolean);if(out[1]===last&&out.length>2){var t=out[1];out[1]=out[2];out[2]=t}
  FEED=out;sset('lasttop',FEED[1]||'');
};
shuffleFeed();

/* ---------- 3. Katekizm: new paintings for the first two parts, and a blur that stays behind the words ---------- */
PART_PAINT[0]=pk9('i-disputa','i-trinity');PART_PAINT[1]=pk9('i-barocci','i-eucha','i-sevens');
function blurLayers(root){(root||view).querySelectorAll('.kzp,.kph').forEach(function(p){if(!p.querySelector(':scope>.kzbl'))p.insertAdjacentHTML('afterbegin','<span class="kzbl" aria-hidden="true"></span>')})}

/* ---------- 4. notes: free text, saved passages, highlights in every long text ---------- */
var NOTES=sget('notes9',{txt:'',clips:[]});
var HLS=sget('hls9',{});
var HLC=[['sari','Sarı'],['yesil','Yeşil'],['mavi','Mavi'],['pembe','Pembe'],['mor','Mor']];
function saveNotes(){sset('notes9',NOTES)}
function notesCount(){return NOTES.clips.length+(NOTES.txt.trim()?1:0)}
function readerKey(){var t=stack[stack.length-1];return t&&t.name==='reader'?String(t.arg).split('#')[0]:null}
function readerTitle(k){var m=k&&readerMeta(k);return m?m.title:'Okuma'}
function addClip(text,k,c){text=String(text).replace(/\s+/g,' ').trim();if(!text)return;NOTES.clips.unshift({t:cut(text,1200),k:k||'',src:readerTitle(k),c:c||'',at:Date.now()});saveNotes();toast('Notlarınıza eklendi',true)}
function notesPlain(){var o='Notlarım · katolikdunyasi.com\n\n';if(NOTES.txt.trim())o+=NOTES.txt.trim()+'\n\n';NOTES.clips.slice().reverse().forEach(function(c){o+='“'+c.t+'”\n('+c.src+')\n\n'});return o.trim()}
function vNotes(){
  var html=header('Notlarım','<button type="button" data-ncopy aria-label="Notları kopyala">'+ic('copy')+'</button>')
   +'<div class="nt9"><p class="nt9l">Okurken bir yeri seçin: renkle işaretleyebilir ya da buraya ekleyebilirsiniz. Notlarınız yalnızca bu cihazda saklanır.</p>'
   +'<label class="nt9a" for="ntx"><span>Kendi notlarınız</span><textarea id="ntx" rows="6" placeholder="Bugün okuduklarım, sorularım, dualarım…">'+esc(NOTES.txt)+'</textarea><small id="nts" aria-live="polite">'+(NOTES.txt?'Kaydedildi':'Yazdıkça kaydedilir')+'</small></label>'
   +'<div class="nt9b"><button type="button" class="pri" data-nprint>'+ic('print')+' Yazdır</button><button type="button" data-nmail>'+ic('mail')+' E-postayla gönder</button></div>'
   +'<h3 class="nt9h">Eklediğiniz yerler <span>'+NOTES.clips.length+'</span></h3>'
   +(NOTES.clips.length?NOTES.clips.map(function(c,i){return '<div class="nclip'+(c.c?' hc-'+c.c:'')+'"><p>'+esc(c.t)+'</p><div class="nclb">'+(c.k?'<button type="button" data-read="'+esc(c.k)+'">'+esc(c.src)+' ›</button>':'<span>'+esc(c.src)+'</span>')+'<button type="button" class="ndel" data-ndel="'+i+'" aria-label="Bu notu sil">'+ic('trash')+'</button></div></div>'}).join(''):'<p class="nt9e">Henüz bir yer eklemediniz. Uzun yazılarda (Katekizm, Neden Katoliğiz?, İslam’a Cevap, Ateizme Cevap ve diğerleri) bir cümleyi seçip “Notlara ekle”ye dokunun.</p>')
   +(notesCount()?'<button type="button" class="nt9x" data-nclear>Tüm notları sil</button>':'')+'</div>';
  view.innerHTML=html;
  var ta=view.querySelector('#ntx'),st=view.querySelector('#nts'),tm=null;
  ta.addEventListener('input',function(){NOTES.txt=ta.value;clearTimeout(tm);st.textContent='Kaydediliyor…';tm=setTimeout(function(){saveNotes();st.textContent='Kaydedildi'},400)});
}
function printNotes(){
  var box=document.getElementById('nprint');if(box)box.remove();
  box=h('<div id="nprint"><h1>Notlarım</h1><p class="np-s">katolikdunyasi.com · '+esc(LANG==='en'?AYLAR[now.getMonth()]+' '+now.getDate()+', '+Y:now.getDate()+' '+AYLAR[now.getMonth()]+' '+Y)+'</p>'+(NOTES.txt.trim()?'<div class="np-t">'+esc(NOTES.txt).replace(/\n/g,'<br>')+'</div>':'')+NOTES.clips.slice().reverse().map(function(c){return '<blockquote>'+esc(c.t)+'<cite>'+esc(c.src)+'</cite></blockquote>'}).join('')+'</div>');
  document.body.appendChild(box);document.documentElement.classList.add('printing9');
  var done=function(){document.documentElement.classList.remove('printing9');box.remove();window.removeEventListener('afterprint',done)};
  window.addEventListener('afterprint',done);
  try{window.print()}catch(e){toast('Yazdırma bu tarayıcıda açılamadı')}
  setTimeout(function(){if(document.documentElement.classList.contains('printing9'))done()},60000);
}
function mailNotes(){var body=notesPlain();if(body.length>1800)body=body.slice(0,1800)+'\n…';
  var a=document.createElement('a');a.href='mailto:?subject='+encodeURIComponent('Notlarım · katolikdunyasi.com')+'&body='+encodeURIComponent(body);a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove()}
view.addEventListener('click',function(e){
  var b=e.target.closest('[data-nprint],[data-nmail],[data-ncopy],[data-ndel],[data-nclear]');if(!b)return;e.stopPropagation();
  if(!notesCount()&&!b.hasAttribute('data-ndel')){toast('Önce bir not yazın ya da ekleyin');return}
  if(b.hasAttribute('data-nprint'))return printNotes();
  if(b.hasAttribute('data-nmail'))return mailNotes();
  if(b.hasAttribute('data-ncopy')){try{navigator.clipboard.writeText(notesPlain()).then(function(){toast('Notlar kopyalandı',true)},function(){toast('Kopyalanamadı')})}catch(x){toast('Kopyalanamadı')}return}
  if(b.hasAttribute('data-ndel')){NOTES.clips.splice(+b.getAttribute('data-ndel'),1);saveNotes();var st=view.scrollTop;vNotes();view.scrollTop=st;return}
  if(b.hasAttribute('data-nclear'))kModal({i:'trash',t:'Tüm notlar silinsin mi?',p:'Yazdığınız notlar ve eklediğiniz yerler bu cihazdan silinir. Bu işlem geri alınamaz.',b:[{l:'Sil',c:'warn',f:function(){NOTES={txt:'',clips:[]};saveNotes();vNotes();toast('Notlar silindi')}},{l:'Vazgeç',c:'ghost'}]});
},true);

// highlights are stored as character ranges inside numbered blocks of the reader
function hlBlocks(rd){return Array.prototype.slice.call(rd.querySelectorAll('p,li,h2,h3,blockquote,.qa b,.qa .ans,dd,dt')).filter(function(b){return !b.closest('figure,.ktoc,button')&&!b.querySelector('p,li')})}
function blockOff(block,node,off){var w=document.createTreeWalker(block,NodeFilter.SHOW_TEXT),n,pos=0;while((n=w.nextNode())){if(n===node)return pos+off;pos+=n.nodeValue.length}return -1}
function wrapRange(block,s,e,c,id){var w=document.createTreeWalker(block,NodeFilter.SHOW_TEXT),n,pos=0,parts=[];
  while((n=w.nextNode())){var L=n.nodeValue.length,a=Math.max(s,pos),z=Math.min(e,pos+L);if(a<z)parts.push([n,a-pos,z-pos]);pos+=L}
  parts.forEach(function(p){var n=p[0];if(p[2]<n.nodeValue.length)n.splitText(p[2]);var t=p[1]>0?n.splitText(p[1]):n;var m=document.createElement('mark');m.className='hl9 hc-'+c;m.setAttribute('data-hlid',id);t.parentNode.insertBefore(m,t);m.appendChild(t)})}
function applyHL(){var k=readerKey(),rd=view.querySelector('article.rd');if(!k||!rd)return;var L=HLS[k]||[],B=hlBlocks(rd);
  L.forEach(function(x){var b=B[x.b];if(b&&b.textContent.slice(x.s,x.e)===x.t)wrapRange(b,x.s,x.e,x.c,x.id)})}
function addHL(c){var sel=window.getSelection(),k=readerKey(),rd=view.querySelector('article.rd');if(!sel||sel.isCollapsed||!k||!rd)return;
  var r=sel.getRangeAt(0),B=hlBlocks(rd),bi=-1,be=-1;
  B.forEach(function(b,i){if(b.contains(r.startContainer)||b===r.startContainer)bi=i;if(b.contains(r.endContainer)||b===r.endContainer)be=i});
  if(bi<0){toast('Bu kısım işaretlenemiyor');return}
  var L=HLS[k]=HLS[k]||[];
  for(var i=bi;i<=(be<0?bi:be);i++){var b=B[i],s=i===bi?blockOff(b,r.startContainer,r.startOffset):0,e=i===be?blockOff(b,r.endContainer,r.endOffset):b.textContent.length;
    if(s<0)s=0;if(e<0)e=b.textContent.length;if(e-s<1)continue;var id='h'+Date.now().toString(36)+i;L.push({b:i,s:s,e:e,t:b.textContent.slice(s,e),c:c,id:id});wrapRange(b,s,e,c,id)}
  sset('hls9',HLS);sel.removeAllRanges();hideSelBar();vib(8)}
function removeHL(id){var k=readerKey();if(!k)return;HLS[k]=(HLS[k]||[]).filter(function(x){return x.id!==id});sset('hls9',HLS);
  view.querySelectorAll('mark[data-hlid="'+id+'"]').forEach(function(m){var p=m.parentNode;while(m.firstChild)p.insertBefore(m.firstChild,m);p.removeChild(m);p.normalize()})}
var selBar=null,selT=null;
function hideSelBar(){if(selBar){selBar.remove();selBar=null}app.classList.remove('selon')}
function showSelBar(rect,mode,id){hideSelBar();var ar=app.getBoundingClientRect();
  selBar=h('<div class="selbar" role="toolbar" aria-label="'+(mode==='sel'?'Seçilen metin':'İşaretli metin')+'">'+(mode==='sel'?HLC.map(function(c){return '<button type="button" class="hcb hc-'+c[0]+'" data-hc="'+c[0]+'" aria-label="'+c[1]+' ile işaretle"></button>'}).join('')+'<span class="sbsep"></span><button type="button" class="sbn" data-sbnote>'+ic('plusn')+'<span>Notlara ekle</span></button>':'<button type="button" class="sbn" data-sbnote>'+ic('plusn')+'<span>Notlara ekle</span></button><button type="button" class="sbn" data-sbdel>'+ic('trash')+'<span>Kaldır</span></button>')+'</div>');
  // docked above the tab bar: the phone's own Copy/Look Up menu sits next to the selection, so ours never collides with it
  app.appendChild(selBar);var tb=tabsEl.getBoundingClientRect(),bottom=ar.bottom-Math.min(tb.top,ar.bottom)+12;
  selBar.style.bottom=bottom+'px';app.classList.add('selon');
  selBar.addEventListener('pointerdown',function(e){e.preventDefault()});
  selBar.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-hc'))return addHL(b.getAttribute('data-hc'));
    if(b.hasAttribute('data-sbnote')){var t=mode==='sel'?String(window.getSelection()):Array.prototype.map.call(view.querySelectorAll('mark[data-hlid="'+id+'"]'),function(m){return m.textContent}).join(' ');var cc=mode==='mark'?(view.querySelector('mark[data-hlid="'+id+'"]').className.match(/hc-(\w+)/)||[])[1]:'';addClip(t,readerKey(),cc);if(mode==='sel')window.getSelection().removeAllRanges();hideSelBar();return}
    if(b.hasAttribute('data-sbdel')){removeHL(id);hideSelBar()}});
}
document.addEventListener('selectionchange',function(){clearTimeout(selT);selT=setTimeout(function(){
  var sel=window.getSelection();if(!sel||sel.isCollapsed||!readerKey()){if(selBar&&selBar.getAttribute('aria-label')==='Seçilen metin')hideSelBar();return}
  var rd=view.querySelector('article.rd');if(!rd||!rd.contains(sel.anchorNode))return;var t=String(sel).trim();if(t.length<2)return;
  showSelBar(sel.getRangeAt(0).getBoundingClientRect(),'sel')},260)});
view.addEventListener('click',function(e){var m=e.target.closest('mark.hl9');if(!m){if(selBar&&!e.target.closest('.selbar')&&window.getSelection().isCollapsed)hideSelBar();return}
  if(!window.getSelection().isCollapsed)return;showSelBar(m.getBoundingClientRect(),'mark',m.getAttribute('data-hlid'))});
view.addEventListener('scroll',function(){if(selBar&&selBar.getAttribute('aria-label')!=='Seçilen metin')hideSelBar()},{passive:true});

// "Notlarım" in the reader's header, in Katekizm, in our profile and in the settings
function notesBtn(){return '<button type="button" class="nbtn9" data-go="notes" aria-label="Notlarım">'+ic('note')+(notesCount()?'<i>'+notesCount()+'</i>':'')+'</button>'}
function readerExtras(){var hd=view.querySelector('.hd');if(!hd||!view.querySelector('article.rd'))return;var r=hd.querySelector('.r');
  if(!r){r=h('<span class="r" style="position:absolute;right:14px"></span>');hd.appendChild(r)}if(!r.querySelector('.nbtn9'))r.insertAdjacentHTML('afterbegin',notesBtn());
  var rd=view.querySelector('article.rd');if(rd&&!rd.querySelector('.hltip')&&!sget('hltip9',0)){var t=h('<p class="hltip">'+ic('hlt')+'<span>İpucu: Bir cümleyi seçin; renkle işaretleyin ya da notlarınıza ekleyin.</span><button type="button" aria-label="İpucunu kapat">'+ic('x')+'</button></p>');var after=rd.querySelector('.lead')||rd.querySelector('h1');if(after)after.insertAdjacentElement('afterend',t);t.querySelector('button').addEventListener('click',function(){sset('hltip9',1);t.remove()})}
  applyHL()}

/* ---------- the router: notes, and the touches every view gets ---------- */
var render9=render;
render=function(name,arg){hideSelBar();
  if(name==='notes'){view.onscroll=null;stopSpeech();detachScrubber();if(xObs){xObs.disconnect();xObs=null}view.innerHTML='';vNotes();if(stack.length<2)view.querySelectorAll('.hd [data-back]').forEach(function(b){b.style.visibility='hidden'});syncPlayer();return}
  render9(name,arg);post9(name,arg)};
var openTarget9=openTarget;
openTarget=function(t){t=String(t);if(t==='notes')return go('notes');if(t==='settings')return go('settings');if(t==='contact')return go('contact');if(t.indexOf('doc:')===0)return go('reader',t);if(t.indexOf('ext:')===0)return window.open(SITE+t.slice(4),'_blank','noopener');return openTarget9(t)};
function post9(name,arg){
  blurLayers(view);markChurches(view);
  if(name==='reader')readerExtras();
  if(name==='settings'&&!view.querySelector('#r-notes')){var g=view.querySelector('.sgrp');if(g)g.insertAdjacentHTML('beforebegin','<div class="sgrp"><h3>Okuma</h3><button type="button" class="srow" id="r-notes" data-go="notes">'+ic('note')+'<span class="sl1">Notlarım</span><span class="sv2">'+(notesCount()?notesCount()+' not':'Boş')+'</span>'+ic('chevr')+'</button></div>')}
}

/* ---------- Katekizm main: "Rastgele bir soru" makes way for notes ---------- */
var vKatekizm9=vKatekizm;
vKatekizm=function(){vKatekizm9();
  var d=view.querySelector('.kzdice');if(d)d.outerHTML='<button type="button" class="kzdice kznote" data-go="notes"><span>'+ic('note')+'</span><b>Notlarım</b><small>'+(notesCount()?notesCount()+' not · yazdırın ya da e-postayla gönderin':'Okurken not alın, önemli yerleri işaretleyin')+'</small></button>';
  var r=view.querySelector('.kzhd .r');if(r&&!r.querySelector('.nbtn9'))r.insertAdjacentHTML('afterbegin',notesBtn());
  blurLayers(view)};
var vKPart9=vKPart;vKPart=function(i){vKPart9(i);blurLayers(view)};

/* ---------- our profile: Notlarım beside Ayarlar and İletişim ---------- */
var vMe9=vMe;
vMe=function(){vMe9();var bt=view.querySelector('.mepr .btns');if(bt&&!bt.querySelector('[data-go="notes"]'))bt.insertAdjacentHTML('beforeend','<button type="button" data-go="notes">'+ic('note')+' Notlarım</button>')};

/* ---------- 5. Keşfet ---------- */
XCH=['Tümü','Tartış','Azizler','Papalar','Katekizm','Kiliseler','Dualar'];
function sfy(){return rnd9()}
var XQ_PAINT=['i-disputa','i-lastsup','i-sevens','i-trinity','i-august','i-aquinas','i-jerome','i-pantoc','i-deesis','i-hodeg','i-transf','i-pentec','i-bapt','i-annunc','i-nativ','i-resur','i-agony','i-coron','i-lamb','i-keys','i-trent','i-comm','i-confess','i-sheart','43jerome','47emmau','53mercy','49franci','35emmau','23conta','34thomas','12magda'];
function xDebates(small){var T=[['islam','i-const',D.isl.title,D.isl.lead],['ateizm','i-paulath',D.ate.title,D.ate.lead]];
  return '<div class="xdeb2'+(small?' sm':'')+'">'+T.map(function(t){return '<button type="button" class="xdb pa-'+(hasA(t[1])?t[1]:'34thomas')+'" data-go="read:'+t[0]+'"><small>Tartış</small><b>'+esc(t[2])+'</b>'+(small?'':'<span>'+esc(cut(plain(t[3]),90))+'</span>')+'</button>'}).join('')+'</div>'}
function xForYou(){
  var r=sfy(),qs=[];D.sss.forEach(function(c,ci){c.items.forEach(function(x,qi){qs.push({q:x.q,t:c.t,go:'chat:'+ci+'#'+qi})})});D.gun.faq.forEach(function(f,i){qs.push({q:f.q,t:'Günah Çıkarma',go:'read:gunah'})});
  var q4=shuffle(qs,r).slice(0,4),s3=shuffle(D.saints.slice(),r).slice(0,3),m3=shuffle(D.mir.slice(),r).slice(0,3);
  var html=xHead('Tartış')+xDebates(true);
  html+=xHead('Sorular')+'<div class="xq4">'+q4.map(function(q){return '<button type="button" class="xq1" data-go="'+q.go+'"><span class="xq1i">?</span><span><b>'+esc(q.q)+'</b><small>'+esc(q.t)+'</small></span>'+ic('chevr')+'</button>'}).join('')+'</div>';
  html+=xHead('Azizler','acc:azizler')+'<div class="xs3">'+s3.map(function(s){var pk=hasA(SAINT_PAINT[s.id])||hasA(SAINT_STORY[s.id]),img=D.saintimg[s.id];return '<button type="button" class="xs1'+(img?'':' pa-'+(pk||'05franc'))+'" data-acc="'+s.id+'"'+(img?' style="background-image:url('+img+')"':'')+'><b>'+esc(s.name)+'</b><small>'+esc(s.ep)+'</small></button>'}).join('')+'</div>';
  html+=xHead('Mucizeler','acc:mucizeler')+'<div class="xm3">'+m3.map(function(m){var pk=hasA(mirPaint(m.id))||'65lazar';return '<button type="button" class="xm1 pa-'+pk+'" data-go="post:p-mir-'+m.id+'"><b>'+esc(m.n)+'</b><small>'+esc(m.p)+'</small></button>'}).join('')+'</div>';
  html+='<p class="xfoot9">Her açılışta yeni seçkiler. Yenilemek için Keşfet’e iki kez dokunun.</p>';
  return html}
function popeYears(id){var a=ACC[id],p=a&&a.pope;return p&&p.years?p.years:(id==='havari-petrus'?'?-64':'')}
function xLineage(){
  var L=POPE_LINE.slice(),cur=L[L.length-1],html='<p class="xlead">Havari Petrus’tan bugüne 267 papa. Burada, hakkında yazı bulunan '+L.length+' papa sırayla yer alıyor; aradaki papaların sayısı çizginin üzerinde.</p><ol class="lin">';
  L.forEach(function(id,i){var a=ACC[id],o=+a.ord||1,prev=i?(+ACC[L[i-1]].ord||1):0,gap=o-prev-1,isC=id===cur;
    if(gap>0)html+='<li class="lgap" aria-hidden="true"><span>'+(LANG==='en'?gap+(gap===1?' pope':' popes')+' in between':'Arada '+gap+' papa')+'</span></li>';
    html+='<li class="lnode'+(isC?' lcur':'')+'"><button type="button" data-acc="'+id+'"><span class="lav">'+av(a.art,a.tone,isC?64:52)+'</span><span class="ltx"><small>'+o+'. papa'+(popeYears(id)?' · '+esc(popeYears(id)):'')+'</small><b>'+esc(a.name)+'</b>'+(isC?'<em>Bugünkü papa</em>':'')+'</span></button></li>'});
  return html+'</ol>'}
function xKatCards(){var r=sfy(),ns=Object.keys(CQ).map(Number).filter(function(n){var q=plain(CQ[n][2]);return q.length>18&&q.length<92&&/\?$/.test(q)});var pick12=shuffle(ns,r).slice(0,12);
  return '<p class="xlead">Katekizm’den merak uyandıran sorular. Dokunun, cevabı bağlamında okuyun.</p><div class="xkc">'+pick12.map(function(n,i){var p=CPART[n],pk=hasA(XQ_PAINT[(n+i)%XQ_PAINT.length])||PART_PAINT[p];return '<button type="button" class="xk1 pa-'+pk+'" data-go="read:comp:'+p+'#'+n+'"><small>Soru '+n+' · '+esc(D.comp[p].t)+'</small><b>'+esc(plain(CQ[n][2]))+'</b></button>'}).join('')+'</div><button type="button" class="xkall" data-tab9="katekizm">Katekizm’i aç ›</button>'}
var drawX9=drawX;
drawX=function(){var box=view.querySelector('#xmain');if(!box)return;if(xObs){xObs.disconnect();xObs=null}
  if(xCh==='Tümü'){drawX9();var f=box.querySelector('.xfeed'),s=box.querySelector('#xs');if(xObs){xObs.disconnect();xObs=null}if(f)f.remove();if(s)s.remove();
    var hs=box.querySelectorAll('.xh h3');hs.forEach(function(h3){if(h3.textContent==='Sizin için')h3.parentNode.remove()});
    var oq=box.querySelector('.xq');if(oq)oq.remove();
    box.insertAdjacentHTML('beforeend','<div class="xh"><h3>Sizin için</h3></div><div class="x4u">'+xForYou()+'</div>');post9('explore');return}
  if(xCh==='Papalar'){box.innerHTML=xLineage();return}
  if(xCh==='Katekizm'){box.innerHTML=xKatCards();blurLayers(box);return}
  if(xCh==='Tartış'){drawX9();var d=box.querySelectorAll('.xdeb');return}
  drawX9();post9('explore')};
view.addEventListener('click',function(e){var b=e.target.closest('[data-tab9]');if(!b)return;e.stopPropagation();setTab(b.getAttribute('data-tab9'))},true);

// one search over the whole site, with the same rules as the Katekizm search
function gIndex(){if(gIndex.c)return gIndex.c;var I=[];function add(g,t,x,go,av2){I.push({g:g,t:t,x:x||'',go:go,av:av2,f:kqFold(t+' '+(x||''))})}
  kqIndex().forEach(function(e){add('Katekizm',e.n+'. '+e.q,e.a,'read:comp:'+e.p+'#'+e.n,['book',PART_TONE[e.p]])});
  D.saints.forEach(function(s){add('Azizler',s.name,plain(s.sum)+' '+plain(s.body),'acc:'+s.id,[s.art,s.tone])});
  POPE_LINE.forEach(function(id){var a=ACC[id];add('Papalar',a.name,a.bio+' '+(a.pope?a.pope.secs.map(function(x){return x[1]}).join(' '):''),'acc:'+id,[a.art,a.tone])});
  D.sss.forEach(function(c,ci){c.items.forEach(function(x,qi){add('Sorular',x.q,plain(x.a),'chat:'+ci+'#'+qi,['knock','orange'])})});
  D.gun.faq.forEach(function(f){add('Günah Çıkarma',f.q,plain(f.a),'read:gunah',['keys','indigo'])});D.gun.steps.forEach(function(s,i){add('Günah Çıkarma',s.t,plain(s.x),'read:gunah#'+i,['keys','indigo'])});
  D.mes.forEach(function(m){add('Meseller',m.n,m.ref+' '+plain(m.b),'post:p-mes-'+m.id,['wheat','green'])});
  D.mir.forEach(function(m){add('Mucizeler',m.n,m.p+' '+plain(m.b),'post:p-mir-'+m.id,['monstrance','purple'])});
  D.churches.cities.forEach(function(c){c.ch.forEach(function(x){add('Kiliseler',x.n,c.n+' '+x.dist+' '+x.rite+' '+x.addr+' '+plain(x.hist||''),'church:'+x.id,['church','orange'])})});
  [['islam',D.isl],['ateizm',D.ate]].forEach(function(p){var n=0;p[1].parts.forEach(function(pp){pp.secs.forEach(function(s){add('Tartış',s.t,plain(s.b).replace(/#{2,3}/g,''),'read:'+p[0]+'#'+(n++),['scroll','green'])})})});
  Object.keys(D.pages).forEach(function(k){D.pages[k].secs.forEach(function(s,i){add(D.pages[k].t,s[0],plain(s[1].join(' ')),'read:page:'+k+'#'+i,[ACC[k].art,ACC[k].tone])})});
  D.mass.parts.forEach(function(p,i){add('Kutsal Ayin',p.n+'. '+p.t,plain(p.lead),'read:mass#'+i,['chalice','purple'])});
  D.tes.sets.forEach(function(s){add('Tesbih',s.t,s.items.join(' · '),'rosary',['beads','gold'])});
  return gIndex.c=I}
drawExplore=function(){var box=view.querySelector('#exr');if(!box)return;var raw=String(expQ||'').trim(),q=kqFold(raw).replace(/[“”"]/g,''),terms=q.split(/\s+/).filter(function(t){return t.length>1||/^\d$/.test(t)});
  if(!terms.length){box.innerHTML='';return}
  var hits=gIndex().filter(function(e){return terms.every(function(t){return e.f.indexOf(t)>=0})}).map(function(e){var s=0;terms.forEach(function(t){if(kqFold(e.t).indexOf(t)>=0)s+=3});return {e:e,s:s}}).sort(function(a,b){return b.s-a.s});
  var G={},order=[];hits.forEach(function(h2){var g=h2.e.g;if(!G[g]){G[g]=[];order.push(g)}G[g].push(h2.e)});
  var qx='“'+esc(raw)+'”';
  box.innerHTML='<p class="sr-head" role="status">'+(hits.length?qx+' için '+hits.length+' sonuç':qx+' için sonuç bulunamadı.')+'</p>'+order.map(function(g){var arr=G[g];return '<section class="gsec"><h3>'+esc(g)+' <span>'+arr.length+'</span></h3>'+arr.slice(0,g==='Katekizm'?12:6).map(function(e){return '<button type="button" class="qres sr gres" data-go="'+esc(e.go)+'"><span class="gav">'+av(e.av[0],e.av[1],36)+'</span><span class="srb"><b>'+kqMark(e.t,terms)+'</b>'+(e.x?'<span>'+kqMark(kqSnip(e.x,terms,130),terms)+'</span>':'')+'</span></button>'}).join('')+(arr.length>(g==='Katekizm'?12:6)?'<p class="gmore">ve '+(arr.length-(g==='Katekizm'?12:6))+' sonuç daha</p>':'')+'</section>'}).join('')};

/* ---------- 6. popes: the living pope in colour, the others in grey ---------- */
var CUR_POPE=POPE_LINE[POPE_LINE.length-1],CUR_ORD=String(ACC[CUR_POPE].ord);
var art9=art;
art=function(k,cls){var r=art9(k,cls);if(String(k).indexOf('photo:')===0&&String(k).slice(6)!==CUR_ORD)r=r.replace('class="pimg','class="pimg pgray');return r};

/* ---------- 7-9. Kilise Bul: status, the profile's buttons, city circles with a map ---------- */
var CHX={};D.churches.cities.forEach(function(c){c.ch.forEach(function(x){CHX[x.id]={x:x,c:c}})});
var ST_LAB={closed:'Kapalı',limited:'Kısıtlı'};
function chStatus(id){var o=CHX[id];if(!o)return null;var x=o.x;if(x.st&&x.st!=='active')return {st:x.st,lab:ST_LAB[x.st]||'',nt:x.nt||''};if(x.nt)return {st:'note',lab:'Duyuru',nt:x.nt};return null}
function markChurches(root){root.querySelectorAll('[data-go^="church:"],[data-church]').forEach(function(el){if(el.querySelector('.chst'))return;var id=el.getAttribute('data-church')||el.getAttribute('data-go').slice(7),s=chStatus(id);if(!s||s.st==='note')return;
  var badge='<span class="chst st-'+s.st+'">'+esc(s.lab)+'</span>';if(el.classList.contains('tile'))el.insertAdjacentHTML('beforeend',badge);else{var b=el.querySelector('b,p,span');(b||el).insertAdjacentHTML('beforeend',' '+badge)}})}
var vChurch9=vChurch;
vChurch=function(cid){vChurch9(cid);var s=chStatus(cid);if(!s)return;var c=view.querySelector('.pr .cat');
  if(c)c.insertAdjacentHTML('afterend','<div class="chwarn st-'+s.st+'" role="note">'+ic('alert')+'<span><b>'+(s.st==='closed'?'Bu kilise şu anda kapalı':s.st==='limited'?'Ayinler düzenli değil':'Önemli duyuru')+'</b>'+esc(s.nt)+'</span></div>')};
var storySlides9b=storySlides;
storySlides=function(id){var S=storySlides9b(id),a=ACC[id];if(a&&a.church&&S.length){var s=chStatus(a.church.id);
    S.forEach(function(x){if(!x.pa)x.pa='ch:'+a.church.id});
    if(s){S[0].kick=(s.lab?s.lab.toLocaleUpperCase('tr')+' · ':'')+S[0].kick;S.splice(1,0,{kick:s.st==='closed'?'Kilise kapalı':s.st==='limited'?'Gitmeden önce':'Duyuru',title:a.church.n,text:cut(s.nt,280),pa:'ch:'+a.church.id,btn:['Profili aç','church:'+a.church.id]})}}
  return S};
openHighlight=(function(o){return function(id,i){if(id!=='kilise')return o(id,i);var city=D.churches.cities[i],S=[];
  city.ch.forEach(function(x){var s=chStatus(x.id);S.push({kick:(s&&s.lab?s.lab.toLocaleUpperCase('tr')+' · ':'')+city.n+' · '+x.rite,title:x.n,text:s&&s.st!=='note'?cut(s.nt,220):x.addr,pa:chImg(x.id)?'ch:'+x.id:'i-lamb',btn:['Kiliseyi aç','church:'+x.id]})});
  playStory([{id:'kilise',slides:S}],0)}})(openHighlight);
// a little map of Turkey for each city: the outline is drawn once and reused
(function(){var T=D.trk;if(!T)return;var s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('width','0');s.setAttribute('height','0');s.setAttribute('aria-hidden','true');s.style.position='absolute';
  s.innerHTML='<defs><symbol id="trk9" viewBox="0 0 '+T.W+' '+T.H+'"><path d="'+T.d+'"/></symbol><filter id="glow9" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';document.body.appendChild(s)})();
function cityXY(n){var g=D.citygeo&&D.citygeo[n],T=D.trk;if(!g||!T)return null;var la=g[0]*Math.PI/180,lo=g[1]*Math.PI/180;return [T.tx+T.k*lo,T.ty-T.k*Math.log(Math.tan(Math.PI/4+la/2))]}
function cityMap(n){var p=cityXY(n),T=D.trk;if(!p)return '';var S=150,x=p[0]-S/2,y=p[1]-S/2;
  return '<svg class="cmap" viewBox="'+x.toFixed(1)+' '+y.toFixed(1)+' '+S+' '+S+'" aria-hidden="true"><rect x="'+x+'" y="'+y+'" width="'+S+'" height="'+S+'" class="cmsea"/><use href="#trk9" x="0" y="0" width="'+T.W+'" height="'+T.H+'" class="cmland"/><circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" class="cmdot" filter="url(#glow9)"/><text x="'+p[0]+'" y="'+(p[1]+(p[1]-y>S*0.6?-14:24))+'" text-anchor="middle" class="cmtx" filter="url(#glow9)"'+(n.length>7?' textLength="'+(S*0.86)+'" lengthAdjust="spacingAndGlyphs"':'')+'>'+esc(n)+'</text></svg>'}
var vProfile9=vProfile;
vProfile=function(id){vProfile9(id);
  if(id==='kilise'){var nb=view.querySelector('.pr>.nearbtn');if(nb)nb.remove();
    var bt=view.querySelector('.pr .btns'),f=bt&&bt.querySelector('[data-follow]');if(f){f.outerHTML='<button type="button" class="pri" data-go="contact">Hata bildir</button>'+(bt.querySelector('[data-save]')?'':saveBtnHTML('p-kilise',true))}
    var hl=view.querySelector('.pr .hls');if(hl){hl.querySelectorAll('.hl[data-hl="kilise"]').forEach(function(b){var n=b.lastElementChild.textContent,o=b.querySelector('.o');if(o&&D.trk&&cityXY(n)){o.innerHTML='<span class="av cmav" style="width:58px;height:58px">'+cityMap(n)+'</span>';b.setAttribute('aria-label',n+' kiliseleri')}
        var cty=D.churches.cities[+b.getAttribute('data-i')];if(cty&&cty.ch.some(function(x){var s=chStatus(x.id);return s&&s.st!=='note'}))b.classList.add('hlwarn')});
      hl.insertAdjacentHTML('afterbegin','<button type="button" class="hl hlnear" data-near><span class="o"><span class="av nearav" style="width:58px;height:58px">'+ic('loc')+'</span></span><span>Kilise bul</span></button>')}}
  paintGrid(id);markChurches(view)};
if(!POSTS['p-kilise']){var _c0=D.churches.cities[0].ch[0];addPost({id:'p-kilise',acc:'kilise',kind:'kilise',title:'Kilise Bul',slides:[slideCover('church','orange','Kilise Bul','Türkiye’de Katolik kiliseler',Object.keys(CH_OF).length+' kilise · '+D.churches.cities.length+' şehir')],cap:'Türkiye’deki Katolik kiliseleri: adresleri, ayin saatleri ve tarihçeleri.',meta:'Kilise Bul',read:null})}

/* ---------- 11. profile grids: a painting and clean type on every tile ---------- */
var MASS_P=['i-lamb','i-sermon','i-eucha','i-greg','i-comm','i-ascens'];
var GUN_P=['i-confess','12magda','i-prodig','i-agony','i-mercy','72denial','i-sheart','i-shepherd'];
var NEDEN_P=['i-athens','i-trinity','i-transf','i-lastjud','i-sheart','i-pantoc','i-keys','i-resur','28ceras','i-jerome','i-sevens','i-trent','49franci','i-aquinas','i-coron','i-august','i-deesis'];
var SUREC_P=['i-bapt','i-pentec','i-sevens','i-comm'];
var TOP_P=['29ceras','i-patmos','i-trent','i-august','i-hodeg'];
var TT_P=['i-rosary','i-annunc','i-instros','58rosar','i-rosegar','i-francis','i-sultan','i-coron','i-mercy','42loreto','i-keys','i-immac','i-michael'];
var ISL_P=['i-const','i-sultan','i-pantoc','i-deesis','i-patmos','i-hodeg','i-nicholas'];
var ATE_P=['i-athens','34thomas','i-trinity','i-transf','i-aquinas','i-jerome','i-resur','i-pentec','i-lastjud','i-paulath'];
var MES_P9={'ekinci':'i-sower','kayip-koyun':'i-shepherd','iyi-samiriyeli':'i-samarit','musrif-ogul':'i-prodig','on-kiz':'i-virgins'};
var MYST=[['Sevinçli',['i-annunc','i-visit','i-nativ','i-present','i-doctors']],['Işık',['i-bapt','i-cana','i-sermon','i-transf','i-eucha']],['Kederli',['i-agony','55flagel','46ecceho','i-calvary','37depos']],['Şanlı',['i-resur','i-ascens','i-pentec','i-assunt','i-coron']]];
var accPosts9=accPosts;
accPosts=function(id){var r=accPosts9(id);
  if(id==='tesbih'){var g=[];D.tes.sets.forEach(function(s,si){s.items.forEach(function(x,j){g.push({t:x,sm:MYST[si][0]+' · '+(j+1),go:'rosary',pa:hasA(MYST[si][1][j])})})});g.push({t:'Tesbihin Tarihi',go:'acc:tesbihtarihi',pa:hasA('i-instros')});r.grid=g}
  return r};
function gridPaint(id,i,go){
  var P={ayin:MASS_P,gunah:GUN_P,neden:NEDEN_P,surec:SUREC_P,topraklar:TOP_P,tesbihtarihi:TT_P,islam:ISL_P,ateizm:ATE_P}[id];
  if(P)return hasA(P[i%P.length]);
  if(id==='meseller'){var mid=String(go).replace('post:p-mes-','');return hasA(MES_P9[mid])||hasA(mesPaint(mid))}
  if(id==='mucizeler'){var rid=String(go).replace('post:p-mir-','');return hasA(mirPaint(rid))}
  if(id==='azizler'){var sid=String(go).slice(4);return hasA(SAINT_PAINT[sid])||hasA(SAINT_STORY[sid])}
  return null}
var AZ_FB={'aziz-patrick':'i-shepherd','kalkutali-aziz-teresa':'i-mercy','aziz-ii-yuhanna-pavlus':'i-keys','aziz-benedictus':'i-greg','aziz-augustinus':'i-august','aziz-thomas-aquinas':'i-aquinas','avilali-aziz-teresa':'i-teresa','sienali-aziz-catharina':'i-cather','aziz-ignatius-loyola':'i-trent','padovali-aziz-antonius':'i-francis','lisieuxlu-kucuk-teresa':'i-rosary','aziz-yusuf':'i-joseph'};
var GRID9={ayin:1,gunah:1,meseller:1,tesbih:1,mucizeler:1,neden:1,surec:1,topraklar:1,tesbihtarihi:1,azizler:1,islam:1,ateizm:1};
function paintGrid(id){if(!GRID9[id])return;var P=accPosts(id),used={};
  view.querySelectorAll('.grid .tile').forEach(function(t,i){var g=P.grid[i],go=t.getAttribute('data-go')||(g&&g.go);if(!g)return;
    var img=id==='azizler'?D.saintimg[String(go).slice(4)]:null,pk=g.pa||gridPaint(id,i,go)||(id==='azizler'&&!img?hasA(AZ_FB[String(go).slice(4)]):null);
    if(id==='meseller'||id==='mucizeler'){if(pk&&used[pk]){var alt=hasA(XQ_PAINT[(i*7)%XQ_PAINT.length]);if(alt&&!used[alt])pk=alt}used[pk]=1}
    if(!img&&!pk)return;var tt=(t.querySelector('b')||{}).textContent||g.t,sm=(t.querySelector('small')||{}).textContent||'';
    var m=String(tt).match(/^(\d+)\s*·\s*(.*)$/);if(m){sm=sm||m[1];tt=m[2]}
    t.className='tile tp9'+(pk&&!img?' pa-'+pk:'');t.removeAttribute('style');if(img)t.style.backgroundImage='url('+img+')';
    t.innerHTML='<span class="tp9g"></span>'+(sm?'<small class="tp9n">'+esc(sm)+'</small>':'')+'<b class="tp9t '+(tt.length>34?'s':tt.length>18?'m':'l')+'">'+esc(tt)+'</b>';
    t.setAttribute('aria-label',(sm?sm+'. ':'')+tt)})}

/* ---------- 16. Katekizm: leaving a question part asks whether to keep your place ---------- */
var KLEAVE=false;
function inKatReader(){var t=stack[stack.length-1];if(!t||t.name!=='reader')return null;var k=String(t.arg).split('#')[0];return (k.indexOf('comp:')===0||k.indexOf('cx:')===0)?k:null}
function askLeave(go2){var k=inKatReader();if(!k||KLEAVE)return go2();
  kModal({i:'floppy',t:'Okumayı bırakıyorsunuz',p:'Kaldığınız yeri kaydedelim mi? Katekizm sayfasındaki “Devam” düğmesiyle buraya dönersiniz.',b:[{l:'Kaydet ve çık',c:'pri',f:function(){saveReading(k);toast('İlerlemeniz kaydedildi',true);KLEAVE=true;try{go2()}finally{KLEAVE=false}}},{l:'Kaydetmeden çık',f:function(){KLEAVE=true;try{go2()}finally{KLEAVE=false}}},{l:'Vazgeç',c:'ghost'}]})}
tabsEl.addEventListener('click',function(e){var b=e.target.closest('[data-tab]');if(!b||KLEAVE||!inKatReader())return;e.stopPropagation();e.preventDefault();askLeave(function(){b.click()})},true);
view.addEventListener('click',function(e){var b=e.target.closest('.hd [data-back]');if(!b||KLEAVE||!inKatReader())return;e.stopPropagation();e.preventDefault();askLeave(function(){back()})},true);
var backInternal9=backInternal;
backInternal=function(){var k=inKatReader();if(k&&!KLEAVE){try{saveReading(k)}catch(x){}}backInternal9()};

/* ---------- home: the glowing fish ---------- */
var vHome9=vHome;
vHome=function(){vHome9();var l=view.querySelector('.hd.hm .lg-ich');if(l)l.classList.add('glow9')};
