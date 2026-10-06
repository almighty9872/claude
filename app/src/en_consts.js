/* ===== English: the prototype's own texts, used when the app runs in English (LANG==='en') ===== */
var I18N={s:{},rx:{}};
var EN={};
if(LANG==='en'){
  // Turkish upper-casing turns "i" into "İ"; in English the plain rules apply
  (function(){var U=String.prototype.toLocaleUpperCase,L=String.prototype.toLocaleLowerCase;
    String.prototype.toLocaleUpperCase=function(l){var s=String(this),t=I18N.s&&I18N.s[s.trim()];return U.call(t||s,l==='tr'?'en':l)};
    String.prototype.toLocaleLowerCase=function(l){return L.call(this,l==='tr'?'en':l)}})();
  EN.paint={'05franc':'Saint Francis of Assisi in Ecstasy','12magda':'The Penitent Magdalene','13fligh':'Rest on the Flight into Egypt','23conta':'The Calling of Saint Matthew','26conta':'The Inspiration of Saint Matthew','28ceras':'The Crucifixion of Saint Peter','29ceras':'The Conversion of Saint Paul','34thomas':'The Incredulity of Saint Thomas','35emmau':'Supper at Emmaus','42loreto':'Madonna of Loreto','43jerome':'Saint Jerome Writing','53mercy':'The Seven Works of Mercy','58rosar':'Madonna of the Rosary','65lazar':'The Raising of Lazarus','191captu':'The Taking of Christ','22barber':'Portrait of Maffeo Barberini','33isaac':'The Sacrifice of Isaac','37depos':'The Entombment','40baptis':'Saint John the Baptist','45death':'The Death of the Virgin','46ecceho':'Ecce Homo','47emmau':'Supper at Emmaus (Milan)','48palaf':'Madonna of the Palafrenieri','49franci':'Saint Francis in Meditation','55flagel':'The Flagellation of Christ','62behead':'The Beheading of Saint John the Baptist','64lucy':'The Burial of Saint Lucy','66annunc':'The Annunciation','67sheph':'The Adoration of the Shepherds','72denial':'The Denial of Saint Peter'};
  EN.carav=[['43jerome','Saint Jerome Writing','Galleria Borghese, Rome','07/43jerome'],['05franc','Saint Francis of Assisi in Ecstasy','Wadsworth Atheneum, Hartford','01/05franc'],['58rosar','Madonna of the Rosary','Kunsthistorisches Museum, Vienna','09/58rosar'],['12magda','The Penitent Magdalene','Galleria Doria Pamphilj, Rome','02/12magda'],['35emmau','Supper at Emmaus','National Gallery, London','06/35emmau'],['26conta','The Inspiration of Saint Matthew','San Luigi dei Francesi, Rome','04/26conta'],['34thomas','The Incredulity of Saint Thomas','Sanssouci, Potsdam','06/34thomas'],['28ceras','The Crucifixion of Saint Peter','Santa Maria del Popolo, Rome','05/28ceras'],['29ceras','The Conversion of Saint Paul','Santa Maria del Popolo, Rome','05/29ceras'],['23conta','The Calling of Saint Matthew','San Luigi dei Francesi, Rome','04/23conta'],['42loreto','Madonna of Loreto','Sant’Agostino, Rome','07/42loreto'],['53mercy','The Seven Works of Mercy','Pio Monte della Misericordia, Naples','09/53mercy'],['65lazar','The Raising of Lazarus','Museo Regionale, Messina','10/65lazar'],['13fligh','Rest on the Flight into Egypt','Galleria Doria Pamphilj, Rome','02/13fligh']];
  EN.rites=[['Latin Catholic','Latin','sent-antuan','The Latin rite of Rome; most churches in Turkey.'],['Armenian Catholic','Armenian','surp-hovhan-vosgeperan','The Armenian rite, in full communion with Rome.'],['Syriac Catholic','Syriac','suryani-katolik-gumussuyu','The Syriac liturgy of the Antiochene tradition.'],['Chaldean Catholic','Chaldean','mar-petyun-diyarbakir','The East Syriac tradition, the Church of Mesopotamia.']];
  EN.history={
   '1-5':[['1964','Paul VI and Ecumenical Patriarch Athenagoras met in Jerusalem; for the first time in centuries a pope and a patriarch of Constantinople met face to face.','acc:papa-paulus-6']],
   '2-5':[['2006','Fr. Andrea Santoro was killed while praying in the Church of Santa Maria in Trabzon.','church:santa-maria-trabzon']],
   '2-11':[['1858','The first apparition to Bernadette Soubirous at Lourdes.','post:p-mir-lourdes'],['2013','Benedict XVI announced that he would step down.','acc:papa-benedictus-16']],
   '3-13':[['2013','Francis was elected pope; the first pope from the Americas.','acc:papa-franciscus']],
   '4-2':[['2005','John Paul II died.','acc:aziz-ii-yuhanna-pavlus']],
   '4-19':[['2005','Benedict XVI was elected pope.','acc:papa-benedictus-16']],
   '4-27':[['2014','John XXIII and John Paul II were declared saints on the same day.','acc:papa-ioannes-23']],
   '5-8':[['2025','Leo XIV was elected pope; the first pope from the United States.','acc:papa-leo-14']],
   '5-13':[['1917','The first apparition to three children at Fatima.','post:p-mir-fatima'],['1981','John Paul II was shot in St. Peter’s Square; he said he owed his life to Our Lady of Fatima.','acc:aziz-ii-yuhanna-pavlus']],
   '5-15':[['1891','Leo XIII issued the encyclical Rerum Novarum, defending the rights of workers.','acc:papa-leo-13']],
   '5-20':[['325','The first ecumenical council met at Nicaea (İznik).','read:page:topraklar']],
   '5-29':[['1453','The Ottoman army took Constantinople; the Byzantine Empire came to an end.','acc:papa-nicolaus-5']],
   '6-3':[['2010','Bishop Luigi Padovese, Apostolic Vicar of Anatolia, was killed in İskenderun.','church:iskenderun-mujde']],
   '6-22':[['431','The Council of Ephesus met and declared that it is right to call Mary “Mother of God”.','read:page:topraklar']],
   '7-16':[['1054','Cardinal Humbert laid the bull of excommunication on the altar of Hagia Sophia.','acc:papa-leo-9']],
   '7-18':[['1870','The First Vatican Council defined papal infallibility.','acc:papa-pius-9']],
   '7-25':[['1967','Paul VI visited Istanbul, Ephesus and İzmir.','acc:papa-paulus-6']],
   '9-4':[['2016','Mother Teresa of Calcutta was declared a saint.','acc:kalkutali-aziz-teresa']],
   '9-12':[['1683','The siege of Vienna was lifted.','acc:papa-innocentius-11']],
   '9-24':[['787','The Seventh Ecumenical Council met at Nicaea (İznik); the veneration of icons was restored.','acc:papa-hadrianus-1']],
   '10-7':[['1571','The Battle of Lepanto; Pope Pius V made this day the feast of Our Lady of the Rosary.','acc:papa-pius-5']],
   '10-8':[['451','The Fourth Ecumenical Council met at Chalcedon (Kadıköy).','read:page:topraklar']],
   '10-11':[['1962','John XXIII opened the Second Vatican Council.','acc:papa-ioannes-23']],
   '10-13':[['1917','The “miracle of the sun” at Fatima, witnessed by tens of thousands.','post:p-mir-fatima']],
   '10-16':[['1978','John Paul II was elected pope.','acc:aziz-ii-yuhanna-pavlus']],
   '10-28':[['1958','John XXIII was elected pope.','acc:papa-ioannes-23']],
   '10-31':[['1517','Luther published his 95 theses; the Reformation began.','acc:papa-leo-10']],
   '11-1':[['1950','Pius XII defined the Assumption of Mary as a truth of faith.','acc:papa-pius-12']],
   '11-27':[['2025','Leo XIV came to Turkey for the 1700th anniversary of the Council of Nicaea.','acc:papa-leo-14']],
   '11-28':[['1979','John Paul II’s visit to Turkey began.','acc:aziz-ii-yuhanna-pavlus'],['2006','Benedict XVI’s visit to Turkey began.','acc:papa-benedictus-16']],
   '11-30':[['2014','Francis joined the feast of St. Andrew at the Ecumenical Patriarchate in Fener.','acc:papa-franciscus']],
   '12-7':[['1965','Paul VI and Patriarch Athenagoras lifted the excommunications of 1054.','acc:papa-paulus-6']],
   '12-8':[['1854','Pius IX defined the Immaculate Conception of Mary as a truth of faith.','acc:papa-pius-9'],['1965','The Second Vatican Council closed.','acc:papa-paulus-6']],
   '12-12':[['1531','The image of Mary appeared on Juan Diego’s tilma at Guadalupe.','post:p-mir-guadalupe']],
   '12-13':[['1545','The Council of Trent opened.','acc:papa-paulus-3']],
   '12-25':[['800','Leo III crowned Charlemagne emperor in Rome.','acc:papa-leo-3']]};
  // the Bible verses in the feed, in the Douay-Rheims wording the site uses for its English
  EN.verses=[
   ['Genesis 1:1','In the beginning God created heaven, and earth.','i-trinity'],
   ['Psalm 119:105','Thy word is a lamp to my feet, and a light to my paths.','43jerome'],
   ['Isaiah 32:17','And the work of justice shall be peace, and the service of justice quietness, and security for ever.','i-lamb'],
   ['Jeremiah 29:13','You shall seek me, and shall find me: when you shall seek me with all your heart.','12magda'],
   ['Psalm 51:19','A sacrifice to God is an afflicted spirit: a contrite and humbled heart, O God, thou wilt not despise.','i-prodig'],
   ['Genesis 3:15','I will put enmities between thee and the woman, and thy seed and her seed: she shall crush thy head, and thou shalt lie in wait for her heel.','i-immac'],
   ['John 1:1','In the beginning was the Word, and the Word was with God, and the Word was God.','i-pantoc'],
   ['John 1:14','And the Word was made flesh, and dwelt among us, and we saw his glory, the glory as it were of the only begotten of the Father, full of grace and truth.','i-nativ'],
   ['John 14:6','Jesus saith to him: I am the way, and the truth, and the life. No man cometh to the Father, but by me.','i-transf'],
   ['John 13:34','A new commandment I give unto you: That you love one another, as I have loved you.','i-lastsup'],
   ['John 6:55','For my flesh is meat indeed: and my blood is drink indeed.','i-bolsena'],
   ['John 8:36','If therefore the Son shall make you free, you shall be free indeed.','i-resur'],
   ['Luke 1:38','And Mary said: Behold the handmaid of the Lord; be it done to me according to thy word.','i-annunc'],
   ['Luke 1:37','Because no word shall be impossible with God.','66annunc'],
   ['Luke 23:43','And Jesus said to him: Amen I say to thee, this day thou shalt be with me in paradise.','37depos'],
   ['Matthew 5:3','Blessed are the poor in spirit: for theirs is the kingdom of heaven.','i-sermon','49franci'],
   ['Matthew 5:9','Blessed are the peacemakers: for they shall be called children of God.','i-sultan'],
   ['Matthew 7:7-8','Ask, and it shall be given you: seek, and you shall find: knock, and it shall be opened to you.','i-agony'],
   ['Matthew 16:18','Thou art Peter; and upon this rock I will build my church, and the gates of hell shall not prevail against it.','i-keys'],
   ['Matthew 25:40','Amen I say to you, as long as you did it to one of these my least brethren, you did it to me.','i-samarit'],
   ['Matthew 28:20','And behold I am with you all days, even to the consummation of the world.','i-ascens','47emmau'],
   ['1 Corinthians 13:5','Charity is not ambitious, seeketh not her own, is not provoked to anger, thinketh no evil.','i-mercy'],
   ['2 Corinthians 5:17','If then any be in Christ a new creature, the old things are passed away, behold all things are made new.','29ceras'],
   ['1 John 1:5','God is light, and in him there is no darkness.','i-pentec'],
   ['1 John 4:16','God is charity: and he that abideth in charity, abideth in God, and God in him.','i-sheart'],
   ['Revelation 21:4','And God shall wipe away all tears from their eyes: and death shall be no more, nor mourning, nor crying, nor sorrow shall be any more.','i-lastjud'],
   ['Philippians 2:8','He humbled himself, becoming obedient unto death, even to the death of the cross.','i-pieta'],
   ['Romans 12:2','And be not conformed to this world; but be reformed in the newness of your mind.','i-august'],
   ['Galatians 6:2','Bear ye one another’s burdens; and so you shall fulfil the law of Christ.','i-calvary','55flagel'],
   ['Colossians 3:14','But above all these things have charity, which is the bond of perfection.','i-coron']];
  EN.extraSq=[
   ['Saint Francis of Assisi','Lord, make me an instrument of your peace. Where there is hatred, let me sow love; where there is injury, pardon.','i-francis','assisili-aziz-francis'],
   ['Saint Teresa of Ávila','Let nothing disturb you, let nothing frighten you. All things pass; God never changes. Whoever has God lacks nothing.','i-teresa','avilali-aziz-teresa'],
   ['Saint Catherine of Siena','Be who God meant you to be and you will set the world on fire.','i-cather','sienali-aziz-catharina'],
   ['Saint Thérèse of Lisieux','For me, prayer is a surge of the heart, a simple look turned toward heaven, a cry of gratitude and love in times of trial as well as joy.','i-rosary','lisieuxlu-kucuk-teresa'],
   ['Padre Pio','Pray, hope and don’t worry. Worry is useless. God is merciful and will hear your prayer.','05franc','padre-pio'],
   ['Saint John Paul II','Do not be afraid! Open wide the doors for Christ.','i-keys','aziz-ii-yuhanna-pavlus']];
  EN.saintAcc={'Saint Augustine':'aziz-augustinus','Saint Thomas Aquinas':'aziz-thomas-aquinas','Saint Ignatius of Loyola':'aziz-ignatius-loyola','Saint Jerome':'aziz-hieronymus'};
  EN.sqPaint={'Saint Augustine':'i-august','Saint Thomas Aquinas':'i-aquinas','Saint Ignatius of Loyola':'i-trent','Saint John of the Cross':'i-pantoc','Saint Cyprian':'i-petpaul','Saint Irenaeus':'i-deesis','Saint Basil the Great':'i-michael','Saint Cyril of Jerusalem':'i-bapt','Saint Leo the Great':'i-keys','Saint Ignatius of Antioch':'i-comm','Saint Gregory of Nyssa':'i-transf','The Curé of Ars, Saint John Mary Vianney':'i-confess','Saint Gregory of Nazianzus':'i-hodeg','Saint John Chrysostom':'i-nicholas','Saint Turibius of Montenegro':'i-trinity','Blessed Elizabeth of the Trinity':'i-teresa'};
  EN.secLead={'Öğren':'The foundations of the faith: question by question, step by step.','Tartış':'Answers to objections, with reason and sources.','Keşfet':'Saints, popes, miracles and churches.','Dua Et':'A guide to the Mass, the rosary and confession.','Site':'Write to us, and manage your notes and settings.'};
  EN.secName={'Öğren':'Learn','Tartış':'Debate','Keşfet':'Explore','Dua Et':'Pray','Site':'Site'};
  EN.ext9={'kutsal-kitap.html':['The Bible','The books, the chapters and a guide to where to start reading.','i-jerome','doc:kutsalkitap'],
   'ekler.html':['Common Prayers','The Sign of the Cross, the Our Father, the Hail Mary and the other prayers said every day.','i-rosary','read:cx:ekler'],
   'iletisim.html':['Contact','Write us your question; we will answer by email.','i-paulath','contact'],
   'erisilebilirlik.html':['Accessibility','What we have done so that everyone can read the site easily.','i-lamb','doc:erisilebilirlik'],
   'gizlilik.html':['Privacy','How your data is handled on this site.','i-confess','doc:gizlilik']};
  EN.emb={'meryem-ana':'A crown of twelve stars','aziz-yusuf':'A carpenter’s square and hammer','havari-petrus':'The keys of heaven','havari-pavlus':'A sword','vaftizci-yahya':'A baptismal shell','havari-yuhanna':'An eagle','aziz-augustinus':'A flaming heart pierced with arrows','aziz-thomas-aquinas':'A sun on his breast','assisili-aziz-francis':'The tau cross','sienali-aziz-catharina':'A crown of thorns','avilali-aziz-teresa':'A book and a quill','lisieuxlu-kucuk-teresa':'Roses','aziz-ignatius-loyola':'The IHS monogram','aziz-benedictus':'A cup with a serpent','aziz-patrick':'The shamrock','padovali-aziz-antonius':'A lily','kalkutali-aziz-teresa':'The rosary','aziz-ii-yuhanna-pavlus':'The Totus Tuus coat of arms','padre-pio':'The stigmata','aziz-hieronymus':'A lion'};
  // the accounts the app builds from fixed Turkish text
  var A11={me:['Catholic World','Catholic World','katolikdunyasi.com is made to bring the basic texts and teaching of the Catholic faith within reach, in Turkish and English.'],
   bugun:['Today','Today’s feed',null],
   katekizm:['Catechism','Compendium of the Catechism of the Catholic Church','A summary of the Catholic faith: 598 questions with short, clear answers. Four parts: the Profession of Faith, the Sacraments, Life in Christ and Christian Prayer.'],
   azizler:['Saints','A saint for every day','A saint for every day from the Church’s calendar, and the twenty best-known saints of the Catholic tradition.'],
   papalar:['Popes','From Peter to Leo XIV','Popes who shaped the Church’s history: their lives, their key documents and their links to Turkey. The follower and following lists link the popes in order.'],
   tesbih:['The Rosary','Pray',null],
   gunah:['Confession','Guide · Pray','The sacrament people dread most and that frees them most. For anyone going for the first time, or after a long time away.'],
   ayin:['The Holy Mass','Pray',null],
   kilise:['Find a Church','Catholic churches in Turkey','The Catholic churches of Turkey: their addresses, Mass times and histories.'],
   islam:['Answering Islam','Debate',null],ateizm:['Answering Atheism','Debate',null],
   neden:['Why We’re Catholic','Learn',null],surec:['How to Become Catholic','Learn',null],
   meseller:['Parables','Learn','The thirty-two parables Jesus told, with short explanations.'],
   mucizeler:['Miracles','Explore','Apparitions the Church has examined, Eucharistic miracles and incorrupt saints.'],
   topraklar:['Christianity in Our Lands','Explore',null],tesbihtarihi:['History of the Rosary','Pray',null],
   sss:['Frequently Asked Questions','Learn','The questions people ask most about the Catholic faith, with short answers.']};
  Object.keys(A11).forEach(function(id){var a=ACC[id],x=A11[id];if(!a)return;a.name=x[0];a.cat=x[1];if(x[2])a.bio=x[2]});
  if(ACC.tesbih)ACC.tesbih.bio='Through the mysteries, bead by bead. Today: '+todaySet.t+'.';
  if(ACC.bugun)ACC.bugun.bio=todayLabel+', '+GUN[WD]+'.';
  EN.embTr={};D.saints.forEach(function(s){if(EN.emb[s.id]){if(s.emb)EN.embTr[s.emb]=EN.emb[s.id];s.emb=EN.emb[s.id]}});
  // the popes' names: "Papa" is "Pope" in the profile lines built from them
  POPE_LINE.forEach(function(id){var a=ACC[id];if(a&&a.pope){a.cat=a.pope.cat+(a.pope.years?' · '+a.pope.years:'')}});
}
