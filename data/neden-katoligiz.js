/* =====================================================================
 * EN: "Why We're Catholic": a short case for the faith in three parts,
 *     written for readers who may not believe (Is there a God? Who is
 *     Jesus? Why the Catholic Church?). Each topic opens with a one-line
 *     "hook" the page lists; opening it shows the skeptic's question
 *     ("q"), a one-line answer ("lede"), a few key points, and the
 *     strongest objection with a reply.
 *     "chain" is the five-link summary drawn above the closing text.
 *     Original writing drawing on standard classical and Catholic
 *     apologetics (the cosmological and fine-tuning arguments, Lewis's
 *     "trilemma", the minimal-facts case for the Resurrection, etc.).
 * TR: "Neden Katoliğiz?" denemesi. Duzenledikten sonra tools/build.ps1
 *     calistirin. JSON-START / JSON-END isaretlerini silmeyin.
 * ===================================================================== */
window.WHY_CATHOLIC = /*JSON-START*/{
 "title": "Neden Katoliğiz?",
 "en": "Why We're Catholic",
 "intro": "Tanrı var mı, İsa kim, neden Katolik Kilisesi? Üç soruyu sırayla ve kısaca cevaplıyoruz.",
 "introEn": "Whether you are just discovering faith or looking for a spiritual home, our door and our hearts are wide open to you. Come and discover with us the peace, the deep-rooted tradition and the loving community of the Catholic Church.",
 "parts": [
  {
   "id": "tanri-var-mi",
   "title": "Tanrı var mı?",
   "en": "Is There a God?",
   "thesis": "Evrenin varlığı, ince ayarı, iyiyi kötüden ayırabilmemiz ve kalbimizin özlemi: en makul açıklama bir Yaratıcı’dır.",
   "thesisEn": "That the universe exists and is finely tuned, that we can tell good from evil, and that our hearts long for more all make a Creator the most reasonable explanation.",
   "topics": [
    {
     "id": "nesnel-hakikat",
     "title": "Nesnel Hakikat",
     "en": "Objective Truth",
     "hook": "“Mutlak hakikat yoktur” diyen, mutlak bir hüküm vermiş olur.",
     "hookEn": "Whoever says “there is no absolute truth” is stating an absolute truth.",
     "q": "Herkesin doğrusu kendine göre değil mi?",
     "qEn": "Isn't truth different for everyone?",
     "lede": "Zevkler kişiden kişiye değişir, gerçekler değişmez.",
     "ledeEn": "Tastes differ from person to person; facts don’t.",
     "points": [
      "“Mutlak hakikat yoktur” cümlesi, kendini mutlak bir hakikat olarak sunar. Yani kendi kendini çürütür.",
      "Kimse bir köprünün “bana göre” sağlam olmasıyla yetinmez; gerçekten sağlam olmasını ister.",
      "Çocuklara işkence etmenin “bazı kültürlere göre doğru” olduğunu kimse ciddi olarak savunmaz. Demek ki Tanrı sorusu da bir zevk meselesi değil, cevabı olan gerçek bir sorudur."
     ],
     "pointsEn": [
      "“There is no absolute truth” presents itself as an absolute truth, so it refutes itself.",
      "No one is content with a bridge being sound “for me”; we want it to be really sound.",
      "No one seriously argues that torturing children could be “right for some cultures”. So the question of God isn’t a matter of taste either, but a real question with a real answer."
     ],
     "objection": "Ama farklı toplumlar farklı ahlak kuralları benimsedi.",
     "objectionEn": "But different societies have held different moral codes.",
     "reply": "Farklılıkların çoğu, olaylara farklı bakmaktan doğar; neredeyse her kültür cesareti ve adaleti över, ihaneti kınar. Köleliğin kaldırılmasına “ilerleme” dememiz de, ölçü aldığımız gerçek bir iyinin var olduğunu gösterir.",
     "replyEn": "The differences mostly come from disagreements about facts; nearly every culture praises courage and justice and condemns betrayal. And calling the end of slavery “progress” assumes a real standard of good that we measure it by."
    },
    {
     "id": "evrenin-baslangici",
     "title": "Evrenin Başlangıcı",
     "en": "The Beginning of the Universe",
     "hook": "Büyük Patlama’yı ilk öne süren kişi bir Katolik rahipti.",
     "hookEn": "The first person to propose the Big Bang was a Catholic priest.",
     "q": "Evren kendiliğinden var olamaz mı?",
     "qEn": "Couldn't the universe just exist on its own?",
     "lede": "Bilim evrenin bir başlangıcı olduğunu söylüyor; başlayan her şeyin bir nedeni vardır.",
     "ledeEn": "Science says the universe had a beginning; and everything that begins has a cause.",
     "points": [
      "Evrenin bir başlangıç anından doğduğunu ilk öne süren kişi Belçikalı bir Katolik rahip ve fizikçiydi: Georges Lemaître (1931). Bugün buna Büyük Patlama deniyor.",
      "Zaman, uzay ve madde bu başlangıçla ortaya çıktıysa, bunların nedeni de bunların dışında olmalı: zamanın ötesinde, maddesiz ve son derece güçlü.",
      "“Hiçlik” hiçbir şey üretemez; kuantum boşluğu bile yasaları olan bir “şey”dir. Bu ilk nedenin özellikleri, dinlerin Tanrı dediği varlığın özellikleriyle örtüşür."
     ],
     "pointsEn": [
      "The first person to propose that the universe began at a single moment was a Belgian Catholic priest and physicist, Georges Lemaître (1931). Today we call it the Big Bang.",
      "If time, space and matter began there, their cause must lie outside them: timeless, immaterial and immensely powerful.",
      "“Nothing” produces nothing; even the quantum vacuum is a “something” with laws. This description of the first cause matches what religions call God."
     ],
     "objection": "Peki Tanrı’yı kim yarattı?",
     "objectionEn": "Then who created God?",
     "reply": "Argüman şunu söyler: Var olmaya başlayan her şeyin bir nedeni vardır. Evren başladı; Tanrı ise zamanın dışındadır ve hiç başlamadı. Sonsuza giden bir neden zinciri hiçbir şeyi açıklamaz. Sonunda, var olmak için başka hiçbir şeye ihtiyaç duymayan bir varlığa ulaşmak gerekir.",
     "replyEn": "The argument says “everything that begins to exist has a cause”; the universe began, but God is outside time and never began. An endless chain of causes explains nothing; somewhere you reach a being that needs nothing else in order to exist."
    },
    {
     "id": "ince-ayar",
     "title": "İnce Ayar",
     "en": "Fine-Tuning",
     "hook": "Evrenin ayarları biraz farklı olsaydı, ne yıldızlar olurdu ne de biz.",
     "hookEn": "Were the universe’s settings slightly different, there would be no stars, and no us.",
     "q": "Hayatın var olması sadece bir şans eseri olamaz mı?",
     "qEn": "Couldn't life be just a lucky accident?",
     "lede": "Evrenin temel sabitleri, hayatın var olabilmesi için inanılmaz bir hassasiyetle ayarlanmış görünüyor.",
     "ledeEn": "The basic constants of the universe seem tuned with astonishing precision to allow life.",
     "points": [
      "Güçlü nükleer kuvvet yüzde birkaç farklı olsaydı, yıldızlar yanamaz ve hayat için gereken karbon oluşamazdı.",
      "Kozmolojik sabit biraz daha büyük olsaydı hiçbir galaksi oluşamazdı.",
      "Ateist gökbilimci Fred Hoyle bile şöyle yazmıştı: “Olguların sağduyulu bir yorumu, bir üstün aklın fizikle oynadığını gösteriyor.”"
     ],
     "pointsEn": [
      "If the strong nuclear force were a few percent different, stars could not burn and the carbon life needs could not form.",
      "If the cosmological constant were a little larger, no galaxy could have formed.",
      "Even the atheist astronomer Fred Hoyle wrote: “A common sense interpretation of the facts suggests that a superintellect has monkeyed with physics.”"
     ],
     "objection": "Belki sayısız evren vardır ve biz şanslı olanındayız.",
     "objectionEn": "Maybe there are countless universes and we’re in a lucky one.",
     "reply": "Çoklu evren gözlemlenmiş bir gerçek değil, sınanamayan bir varsayımdır. Görünmeyen sonsuz sayıda evren varsaymak, tek bir Yaratıcı varsaymaktan daha büyük bir inanç sıçramasıdır. Üstelik evren üreten böyle bir “makinenin” de ince ayara ihtiyacı olur; sorun yalnızca bir adım geriye itilmiş olur.",
     "replyEn": "The multiverse isn’t an observed fact but an untestable hypothesis; positing infinitely many unseen universes is a bigger leap of faith than one Creator. And a “machine” that produces universes needs fine-tuning too: the problem only moves back a step."
    },
    {
     "id": "kotuluk-sorunu",
     "title": "Kötülük Sorunu",
     "en": "The Problem of Evil",
     "hook": "Kötülüğe öfkelenmek, iyiliğin gerçek olduğunu gösterir.",
     "hookEn": "Our anger at evil shows that goodness is real.",
     "q": "İyi bir Tanrı varsa neden bu kadar acı var?",
     "qEn": "If a good God exists, why is there so much suffering?",
     "lede": "Bu, en dürüst ve en ağır sorudur. Hristiyanlık ona bir formülle değil, çarmıhla cevap verir.",
     "ledeEn": "This is the hardest and most honest question; Christianity answers it not with a formula but with a cross.",
     "points": [
      "Tanrı bize gerçek bir özgürlük verdi, çünkü zorla sevgi olmaz. Kötülüklerin çoğu, bu özgürlüğün kötüye kullanılmasından doğar.",
      "Tanrı olmadan “kötülük” kelimesi bile anlamını yitirir: kötülüğe duyduğumuz öfke, gerçek bir iyinin var olduğunu varsayar.",
      "Hristiyanlığın Tanrısı acıya uzaktan bakmaz. Mesih’te ihanete, işkenceye ve ölüme bizzat katlandı ve ölümü dirilişle yendi."
     ],
     "pointsEn": [
      "God gave us real freedom, because love can’t be forced; most evil is the misuse of that freedom.",
      "Without God even the word “evil” loses its meaning: our outrage at evil assumes a real good.",
      "The Christian God doesn’t watch suffering from afar: in Christ he went through betrayal, torture and death, and defeated death by rising."
     ],
     "objection": "Her şeye gücü yeten bir Tanrı acıyı hemen ortadan kaldırırdı.",
     "objectionEn": "An all-powerful God would remove suffering at once.",
     "reply": "Bunun tek yolu özgür iradeyi, onunla birlikte de sevgiyi ve bağışlamayı ortadan kaldırmak olurdu. Hristiyan umudu, acının bir gün sona ereceğidir: “Gözlerinden bütün yaşları silecek. Artık ölüm olmayacak” (Vahiy 21:4).",
     "replyEn": "The only way would be to remove free will, and with it love and forgiveness. The Christian hope is that suffering will end: “He will wipe every tear from their eyes, and death shall be no more” (Revelation 21:4)."
    },
    {
     "id": "kalbin-ozlemi",
     "title": "Kalbin Özlemi",
     "en": "The Heart's Longing",
     "hook": "Susuzluk, suyun var olduğunu gösterir.",
     "hookEn": "Thirst shows that water exists.",
     "q": "Tanrı’ya gerçekten ihtiyacım var mı?",
     "qEn": "Do I really need God?",
     "lede": "Hiçbir başarı, zenginlik ya da ilişki kalbimizi tam olarak doyurmaz. Bu, başka bir şey için yaratıldığımızın işaretidir.",
     "ledeEn": "No success, wealth or relationship fully satisfies the heart, a sign that we were made for something more.",
     "points": [
      "Açlık yemeğin, susuzluk da suyun var olduğunu gösterir. Doğal arzularımızın bir karşılığı vardır.",
      "C. S. Lewis: “İçimde bu dünyanın karşılayamayacağı bir arzu buluyorsam, en olası açıklama başka bir dünya için yaratılmış olmamdır.”",
      "Augustinus: “Bizi kendin için yarattın ve kalbimiz sende huzur bulana dek huzursuzdur.”"
     ],
     "pointsEn": [
      "Hunger shows that food exists, thirst that water exists; our natural desires have something that answers them.",
      "C. S. Lewis: “If I find in myself a desire which no experience in this world can satisfy, the most probable explanation is that I was made for another world.”",
      "Augustine: “You have made us for yourself, and our heart is restless until it rests in you.”"
     ],
     "objection": "Bu sadece bir teselli ihtiyacı; insanlar dini bu yüzden uydurur.",
     "objectionEn": "That’s just a need for comfort; that’s why people invent religion.",
     "reply": "Susamamız, suyun bir hayal olduğunu kanıtlamaz. Üstelik Hristiyanlık rahat bir teselli değildir: Düşmanı sevmeyi ve kendini feda etmeyi ister. Kendini iyi hissetmek için din uyduran biri bu kadar zor bir yolu seçmezdi.",
     "replyEn": "Being thirsty doesn’t prove water is an illusion. And Christianity is no easy comfort: it asks us to love our enemies and to give ourselves for others; someone inventing a religion to feel good wouldn’t pick one this hard."
    }
   ]
  },
  {
   "id": "isa-kim",
   "title": "İsa kim?",
   "en": "Who Is Jesus?",
   "thesis": "Yaratıcı kendini tanıtmış olabilir. Hristiyanlık bunu tarihte sınanabilen bir olaya dayandırır: İsa’nın dirilişine.",
   "thesisEn": "If there is a Creator, he may have made himself known. Christianity rests this on an event we can test in history: Jesus’ resurrection.",
   "topics": [
    {
     "id": "tarihteki-isa",
     "title": "Tarihteki İsa",
     "en": "The Historical Jesus",
     "hook": "İsa’nın yaşadığından inanmayan tarihçiler bile şüphe etmez.",
     "hookEn": "Even historians who aren’t believers don’t doubt that Jesus lived.",
     "q": "İsa gerçekten yaşadı mı, yoksa bir efsane mi?",
     "qEn": "Did Jesus really live, or is he a legend?",
     "lede": "İsa’nın yaşadığı ve Pilatus döneminde çarmıha gerildiği, tarihçilerin neredeyse hepsinin kabul ettiği bir gerçektir.",
     "ledeEn": "That Jesus lived and was crucified under Pilate is accepted by almost every historian.",
     "points": [
      "Romalı tarihçi Tacitus (yaklaşık MS 116), Hristiyanların adını Pontius Pilatus’un idam ettirdiği Christus’tan aldığını yazar. Yahudi tarihçi Josephus da “Mesih denilen İsa”dan söz eder.",
      "Agnostik Yeni Ahit uzmanı Bart Ehrman bile İsa’nın yaşadığının ciddi olarak tartışılamayacağını söyler.",
      "Yeni Ahit’in 5.800’den fazla Grekçe el yazması bize ulaştı. Antik dünyadan hiçbir eser bu kadar iyi korunmadı."
     ],
     "pointsEn": [
      "The Roman historian Tacitus (around AD 116) writes that Christians took their name from Christus, executed by Pontius Pilate; the Jewish historian Josephus also mentions “Jesus, who was called the Christ”.",
      "Even the agnostic New Testament scholar Bart Ehrman treats Jesus’ existence as beyond serious dispute.",
      "More than 5,800 Greek manuscripts of the New Testament survive; no other ancient work is so well preserved."
     ],
     "objection": "İnciller İsa’dan çok sonra ve inananlar tarafından yazıldı.",
     "objectionEn": "The Gospels were written long after Jesus, by believers.",
     "reply": "İnciller, tanıklar daha hayattayken, birkaç on yıl içinde yazıldı. Büyük İskender’in en eski kapsamlı biyografileri ise ölümünden yaklaşık üç yüz yıl sonra yazıldı. Üstelik İnciller, uydurma bir hikâyede yer almayacak utandırıcı ayrıntılarla doludur: Petrus’un İsa’yı inkâr etmesi ya da boş mezarın ilk tanıklarının kadınlar olması gibi.",
     "replyEn": "They were written within a few decades, while eyewitnesses were still alive; the earliest full lives of Alexander the Great come some three hundred years after his death. And they are full of embarrassing details no invented story would include: Peter’s denial, and women as the first witnesses of the empty tomb."
    },
    {
     "id": "isanin-iddiasi",
     "title": "İsa’nın İddiası",
     "en": "Who Jesus Claimed to Be",
     "hook": "İsa ya deliydi, ya yalancıydı, ya da gerçekten Tanrı’ydı.",
     "hookEn": "Jesus was either mad, a liar, or truly God.",
     "q": "İsa sadece iyi bir öğretmen olamaz mı?",
     "qEn": "Couldn't Jesus just have been a good teacher?",
     "lede": "İsa’nın kendisi hakkında söyledikleri bu seçeneği ortadan kaldırıyor.",
     "ledeEn": "What Jesus said about himself rules that option out.",
     "points": [
      "İsa günahları bağışladı. Orada bulunanlar öfkelendi, çünkü bunun yalnızca Tanrı’ya ait bir yetki olduğunu biliyorlardı (Markos 2:5-7).",
      "“Ben ve Baba biriz” dedi (Yuhanna 10:30). Kendini, Tanrı’nın Musa’ya açıkladığı adla, “Ben’im” diye tanıttı (Yuhanna 8:58).",
      "Böyle konuşan biri ya deli ya yalancıdır ya da gerçekten söylediği kişidir. Öğretisinin derinliği ve hayatının tutarlılığı, ilk iki seçeneğe uymuyor."
     ],
     "pointsEn": [
      "He forgave sins, and those present were outraged because they knew only God has that authority (Mark 2:5-7).",
      "He said “I and the Father are one” (John 10:30) and called himself by the name God revealed to Moses, “I am” (John 8:58).",
      "Someone who talks like that is a lunatic, a liar, or who he says he is; the depth of his teaching and the integrity of his life don’t fit the first two."
     ],
     "objection": "Belki bu sözleri ona sonraki kuşaklar yakıştırdı.",
     "objectionEn": "Maybe later generations put these words in his mouth.",
     "reply": "Pavlus, İsa’nın ölümünden sonraki otuz yıl içinde yazdığı mektuplarda O’ndan, Tanrı olarak tapınılan Rab diye söz eder (Filipililer 2:6-11). Efsanelerin oluşması için kuşaklar gerekir. Burada ise tanıklar henüz hayattayken, tek Tanrı inancına en sıkı bağlı halkın içinde bir insana tapınılmaya başlanıyor.",
     "replyEn": "Paul, writing less than thirty years after Jesus’ death, already speaks of him as the Lord worshipped as God (Philippians 2:6-11). Legends take generations; here a man is worshipped while eyewitnesses are still alive, and by the people most strictly devoted to the one God."
    },
    {
     "id": "dirilis",
     "title": "Diriliş",
     "en": "The Resurrection",
     "hook": "Korkup saklanan öğrenciler, bildikleri bir yalan uğruna ölmezdi.",
     "hookEn": "Frightened disciples in hiding would not die for something they knew was a lie.",
     "q": "Ölümden dirilen bir adama nasıl inanılabilir?",
     "qEn": "How can anyone believe a man rose from the dead?",
     "lede": "Hristiyanlık, sınanabilir tarihsel bir iddiaya dayanır: “Mesih dirilmediyse imanınız boştur” (1 Korintliler 15:17).",
     "ledeEn": "Christianity rests on a testable historical claim: “If Christ has not been raised, your faith is futile” (1 Corinthians 15:17).",
     "points": [
      "Kuşkucu tarihçilerin çoğu bile şunları kabul eder: İsa çarmıhta öldü ve gömüldü, mezarı boş bulundu, öğrencileri O’nu dirilmiş gördüklerine içtenlikle inandı.",
      "1 Korintliler 15:3-8’deki inanç formülü, olaydan yalnızca birkaç yıl sonrasına uzanır ve beş yüzden fazla tanıktan söz eder.",
      "Korkup saklanan öğrenciler, birkaç hafta içinde aynı şehirde dirilişi açıkça ilan etmeye başladı. Şüpheci Yakup ve Hristiyanlara zulmeden Pavlus da inananlara katıldı."
     ],
     "pointsEn": [
      "Even most skeptical historians accept that Jesus died on the cross and was buried, that his tomb was found empty, and that his disciples sincerely believed they had seen him risen.",
      "The creed in 1 Corinthians 15:3-8 goes back to within a few years of the event and names more than five hundred witnesses.",
      "Within weeks, the same frightened disciples who had been hiding were openly proclaiming the resurrection in the same city; the skeptic James and the persecutor Paul joined them."
     ],
     "objection": "Belki halüsinasyon gördüler ya da cesedi çaldılar.",
     "objectionEn": "Maybe they hallucinated, or stole the body.",
     "reply": "Beş yüz kişi aynı halüsinasyonu görmez; halüsinasyon da mezarı boşaltmaz. Cesedi çalmış olsalardı, bildikleri bir yalan uğruna ölüme gitmiş olurlardı. Düşmanları ise cesedi göstererek her şeyi bitirebilirdi, ama bunu hiçbir zaman yapamadılar.",
     "replyEn": "Five hundred people don’t share one hallucination, and a hallucination doesn’t empty a tomb. Had they stolen the body, they would have died for something they knew was a lie; and their enemies could have ended it all by producing the body, which they never did."
    }
   ]
  },
  {
   "id": "neden-katolik",
   "title": "Neden Katolik Kilise?",
   "en": "Why the Catholic Church?",
   "thesis": "İsa dirildiyse söyledikleri önemlidir. O, havariler üzerine kurulu ve bugün de süren bir Kilise bıraktı.",
   "thesisEn": "If Jesus rose, what he said matters, and he left behind a Church built on the apostles that lasts to this day.",
   "topics": [
    {
     "id": "tek-kilise",
     "title": "Tek Kilise ve Petrus",
     "en": "One Church and Peter",
     "hook": "İsa arkasında bir kitap değil, bir Kilise bıraktı.",
     "hookEn": "Jesus left behind not a book, but a Church.",
     "q": "İsa’ya inanmak yetmez mi, neden bir Kilise?",
     "qEn": "Isn't believing in Jesus enough? Why a Church?",
     "lede": "İsa öğretisini tek tek kişilere değil, görünür ve yetkili bir topluluğa emanet etti.",
     "ledeEn": "Jesus entrusted his teaching not to scattered individuals but to a visible community with authority.",
     "points": [
      "Petrus’a “Bu kayanın üzerine kilisemi kuracağım” dedi ve ona Göklerin Egemenliği’nin anahtarlarını verdi (Matta 16:18-19).",
      "Ortak bir yetki olmadığında herkes Kutsal Kitap’ı farklı yorumlar; bugünkü binlerce ayrı topluluk bunun sonucudur. Oysa Mesih, öğrencilerinin “bir olması” için dua etti (Yuhanna 17:21). Bu, başka kiliselerdeki Hristiyanları küçümsemek demek değildir: Onlar da vaftizle Mesih’e bağlı kardeşlerimizdir ve imanlarından, tanıklıklarından öğreneceğimiz çok şey vardır (KKK 818).",
      "Bugünkü papa, Petrus’la başlayan ve iki bin yıldır kopmadan süren bir zincirin 260’tan fazla halkasından sonuncusudur."
     ],
     "pointsEn": [
      "He told Peter, “On this rock I will build my church,” and gave him the keys of the kingdom of heaven (Matthew 16:18-19).",
      "Without a shared authority everyone reads the Bible differently; the thousands of separate communities today are the result. Christ prayed that his disciples would “be one” (John 17:21). This doesn’t mean looking down on Christians in other churches: through baptism they are our brothers and sisters in Christ, and we have much to learn from their faith and witness (CCC 818).",
      "Today’s pope is the latest link in a chain of more than 260 that began with Peter and has held for two thousand years."
     ],
     "objection": "Kilise, İsa’nın sade mesajını sonradan kurumsallaştırdı.",
     "objectionEn": "The Church later turned Jesus’ simple message into an institution.",
     "reply": "Tam tersine: Kurum, Yeni Ahit’ten önce vardı. İsa kitap yazmadı; on iki havari seçti ve onlara yetki verdi. Antakyalı İgnatius, yaklaşık MS 107’de “Katolik Kilise” ifadesini kullanan ilk kişi oldu.",
     "replyEn": "It was the other way around: the institution came before the New Testament; Jesus wrote no book, but chose twelve apostles and gave them authority. Ignatius of Antioch, around AD 107, was the first to use the phrase “the Catholic Church”."
    },
    {
     "id": "kutsal-kitabi-kim-topladi",
     "title": "Kutsal Kitap ve Gelenek",
     "en": "Scripture and Tradition",
     "hook": "Kutsal Kitap’ın içindekiler listesini Kilise belirledi.",
     "hookEn": "The Church decided the Bible’s table of contents.",
     "q": "Neden sadece Kutsal Kitap yetmiyor?",
     "qEn": "Why isn't the Bible alone enough?",
     "lede": "Kutsal Kitap’ın hangi kitaplardan oluşacağına Kilise karar verdi. Yani Kutsal Kitap, Kilise’nin içinden doğdu.",
     "ledeEn": "The Church decided which books make up the Bible; the Book was born inside the Church.",
     "points": [
      "Bugünkü 27 kitaplık Yeni Ahit listesi, Hippo (393) ve Kartaca (397) konseylerinde kesinleşti.",
      "Kutsal Kitap da sözle aktarılan öğretiye sadık kalmamızı ister: “Size sözle ya da mektupla aktardığımız öğretilere sımsıkı sarılın” (2 Selanikliler 2:15).",
      "Kutsal Kitap, Kutsal Gelenek ve Kilise’nin öğretim yetkisi, aynı kaynaktan, Mesih’ten gelen tek bir bütündür.",
      "Kutsal Kitap hiçbir yerde “yalnızca Kutsal Kitap” demez. Tersine, sözle aktarılan ve güvenilir kişilere emanet edilen öğretiden söz eder (2 Timoteos 2:2). Yuhanna da İsa’nın yaptıklarının hepsinin yazılmadığını söyler (Yuhanna 21:25)."
     ],
     "pointsEn": [
      "The 27-book New Testament list was settled at the councils of Hippo (393) and Carthage (397).",
      "The Bible itself tells us to keep the teaching handed on by word of mouth: “Hold to the traditions which you were taught by us, either by word of mouth or by letter” (2 Thessalonians 2:15).",
      "Scripture, Tradition and the Church’s teaching office form one whole, coming from one source, Christ.",
      "Nowhere does the Bible say “Scripture alone.” Instead it speaks of teaching handed on by word of mouth and entrusted to faithful men (2 Timothy 2:2), and John says that not everything Jesus did was written down (John 21:25)."
     ],
     "objection": "Böylece Kilise kendini Kutsal Kitap’ın üstüne koyuyor.",
     "objectionEn": "So the Church puts itself above the Bible.",
     "reply": "Kilise kendini Kutsal Kitap’ın efendisi değil, hizmetkârı sayar. Onu korur ve açıklar, ama değiştiremez. Bunu, gerçek bir tabloyu sahtelerinden ayırt eden bir müzeye benzetebiliriz: Tabloyu müze yapmadı, ama onu tanıyıp koruyacak olan odur.",
     "replyEn": "The Church sees itself as the servant of Scripture, not its master; it guards and explains it but cannot change it. It is like a museum that can tell an original painting from its forgeries: it didn’t paint it, but it can recognize and protect it."
    },
    {
     "id": "kutsal-sirlar",
     "title": "Kutsal Sırlar",
     "en": "The Sacraments",
     "hook": "İsa “Bu benim bedenimdir” dedi, “Bu bir semboldür” demedi.",
     "hookEn": "Jesus said “This is my body,” not “This is a symbol.”",
     "q": "Su, ekmek ve yağın ruhsal bir etkisi olabilir mi?",
     "qEn": "Can water, bread and oil really have a spiritual effect?",
     "lede": "Tanrı bizi beden ve ruh olarak yarattı; lütfunu da görülebilen, dokunulabilen işaretlerle verir.",
     "ledeEn": "God made us body and soul, so he gives his grace through signs we can see and touch.",
     "points": [
      "İsa hastaları iyileştirirken onlara dokundu, çamur ve su kullandı. Öğrencilerine vaftiz etmelerini, ekmeği “beni anmak için” sunmalarını ve günahları bağışlamalarını buyurdu: “Kimin günahlarını bağışlarsanız, bağışlanmış olur” (Yuhanna 20:22-23).",
      "Yedi kutsal sır, doğumdan ölüme kadar hayatın bütün önemli anlarında bize eşlik eder.",
      "İlk Hristiyanlar Efkaristiya’yı bir sembol olarak görmedi. Antakyalı İgnatius, onun “Kurtarıcımız İsa Mesih’in bedeni” olduğunu inkâr edenleri eleştiriyordu.",
      "İsa, “Bedenim gerçek yiyecek, kanım gerçek içecektir” dedi (Yuhanna 6:55). Öğrencilerinin birçoğu bu sözü kabul edemeyip O’ndan ayrıldı, ama İsa onları geri çağırıp “Sadece bir semboldü” demedi (Yuhanna 6:66). Son Akşam Yemeği’nde de ekmeği alıp “Bu benim bedenimdir” dedi (Markos 14:22)."
     ],
     "pointsEn": [
      "Jesus touched people when he healed, used mud and water, and told his disciples to baptize, to offer the bread “in remembrance of me” and to forgive sins: “If you forgive the sins of any, they are forgiven” (John 20:22-23).",
      "The seven sacraments accompany every important moment of life, from birth to death.",
      "The first Christians didn’t treat the Eucharist as a symbol: Ignatius of Antioch criticized those who denied it was “the flesh of our Saviour Jesus Christ”.",
      "Jesus said, “My flesh is food indeed, and my blood is drink indeed” (John 6:55). Many of his disciples could not accept this and left him, yet he did not call them back to say he only meant a symbol (John 6:66). At the Last Supper he took the bread and said, “This is my body” (Mark 14:22)."
     ],
     "objection": "Bu bir tür büyü değil mi?",
     "objectionEn": "Isn’t this a kind of magic?",
     "reply": "Büyü, insanın doğaüstü güçleri kendi isteğine boyun eğdirme çabasıdır. Kutsal sırlarda ise insan hiçbir şeyi kontrol etmez; Tanrı kendi vaadini yerine getirir. Kutsal sırların etkisi rahibin kutsallığına değil, Mesih’in sözüne dayanır.",
     "replyEn": "Magic is an attempt to bend supernatural powers to one’s will; in the sacraments no one controls God; God keeps his own promise. Their power rests not on the priest’s holiness but on Christ’s word."
    },
    {
     "id": "skandallar",
     "title": "Kilise’deki Skandallar",
     "en": "Scandals in the Church",
     "hook": "Havarilerden biri de haindi; Kilise yine de ayakta.",
     "hookEn": "Even one of the apostles was a traitor; the Church still stands.",
     "q": "Bu kadar skandal varken Kilise nasıl kutsal olabilir?",
     "qEn": "How can the Church be holy with so many scandals?",
     "lede": "Kilise’nin kutsallığı üyelerinden değil, Mesih’ten gelir. Kilise azizler için bir müze değil, günahkârlar için bir hastanedir.",
     "ledeEn": "The Church’s holiness comes from Christ, not from its members; it is not a museum for saints but a hospital for sinners.",
     "points": [
      "İstismar ve örtbas gibi günahlar gerçektir, ağırdır ve utanç vericidir. Kilise bunları itiraf etmek ve mağdurlara adalet sağlamak zorundadır.",
      "İsa’nın seçtiği on iki havariden biri O’na ihanet etti, Petrus da O’nu üç kez inkâr etti. Mesih, Kilise’nin kusurlu insanlardan oluşacağını biliyordu.",
      "Kötü bir doktor tıbbı geçersiz kılmaz. Aynı Kilise, Kalkütalı Teresa’yı, Maximilian Kolbe’yi ve milyonlarca kutsal insanı da yetiştirdi."
     ],
     "pointsEn": [
      "Sins like abuse and cover-ups are real, grave and shameful; the Church must confess them and do justice to victims.",
      "One of the Twelve betrayed Jesus and Peter denied him three times; Christ knew his Church would be made of flawed people.",
      "A bad doctor doesn’t disprove medicine. The same Church also formed Teresa of Calcutta, Maximilian Kolbe and millions of holy people."
     ],
     "objection": "İki bin yıldır ayakta kalması sadece iyi örgütlenmesinden.",
     "objectionEn": "It has survived two thousand years only because it is well organized.",
     "reply": "Hiçbir insan kurumu, yöneticilerinin bu kadar hatasına, bölünmelere ve zulme rağmen aynı öğretiyi koruyarak yirmi yüzyıl ayakta kalmadı. İsa, “Ölüler diyarının kapıları ona karşı direnemeyecek” diye söz vermişti (Matta 16:18).",
     "replyEn": "No human institution has lasted twenty centuries with the same teaching despite so many failures by its own leaders, so many splits and persecutions. Jesus promised, “The gates of hell shall not prevail against it” (Matthew 16:18)."
    },
    {
     "id": "meyvelerinden",
     "title": "Meyvelerinden Tanırsınız",
     "en": "Known by Its Fruit",
     "hook": "İlk hastaneler ve üniversiteler Kilise’nin içinden doğdu.",
     "hookEn": "The first hospitals and universities grew out of the Church.",
     "q": "Din insanlığa gerçekten iyi bir şey kattı mı?",
     "qEn": "Has religion really done humanity any good?",
     "lede": "Bugün doğal karşıladığımız pek çok kurum Kilise’nin elinde doğdu.",
     "ledeEn": "Many institutions we take for granted today were born in the Church’s hands.",
     "points": [
      "Kayserili Aziz Basileios, dördüncü yüzyılda hastalar ve yoksullar için büyük bir yardım merkezi kurdu. Birçok tarihçi bunu ilk hastanelerden biri sayar.",
      "İlk büyük üniversiteler (Paris, Oxford, Bologna) Kilise’nin desteğiyle gelişti. Genetiğin kurucusu Mendel bir keşiş, Lemaître ise bir rahipti.",
      "Her insanın Tanrı’nın suretinde yaratıldığı ve eşit onura sahip olduğu fikri, insan hakları düşüncesinin köklerinden biridir."
     ],
     "pointsEn": [
      "In the fourth century St. Basil of Caesarea founded a large complex for the sick and the poor; many historians count it among the first hospitals.",
      "The first great universities (Paris, Oxford, Bologna) grew up under the Church; Mendel, the father of genetics, was a friar, and Lemaître a priest.",
      "The idea that every person is made in God’s image and has equal dignity is one of the roots of human rights."
     ],
     "objection": "Ama Haçlı Seferleri ve Engizisyon da vardı.",
     "objectionEn": "But there were the Crusades and the Inquisition.",
     "reply": "Kilise o dönemlerin günahlarını açıkça kabul etti; Aziz II. Yuhanna Pavlus 2000 yılında bunlar için af diledi. Bu kötülükleri mahkûm etmemizi sağlayan ölçü de, düşmanı bile sevmeyi emreden Mesih’in öğretisidir.",
     "replyEn": "The Church has openly admitted the sins of those times; St. John Paul II publicly asked forgiveness for them in 2000. And the standard by which we condemn them is Christ’s own teaching to love even our enemies."
    },
    {
     "id": "lutuf",
     "title": "Lütuf ve İyi İşler",
     "en": "Grace and Good Works",
     "hook": "Kurtuluş satın alınmaz, ama gerçek iman boş durmaz.",
     "hookEn": "Salvation can’t be bought, but real faith doesn’t sit idle.",
     "q": "İyi bir insan olmak cennete gitmek için yeterli mi?",
     "qEn": "Do you get to heaven by being a good person?",
     "lede": "Hayır. Kurtuluş kazanılan bir ödül değil, Tanrı’nın armağanıdır. Ama gerçek iman kendini iyi işlerle gösterir.",
     "ledeEn": "No: salvation isn’t a prize we earn but God’s gift; yet real faith shows itself in good works.",
     "points": [
      "Hiçbirimiz Tanrı’nın kusursuz iyiliğine kendi çabamızla ulaşamayız. Bu yüzden ilk adımı Tanrı attı.",
      "Hristiyanlık, Tanrı’nın insanı aramaya çıkmasının hikâyesidir; tıpkı kaybolan koyununu arayan çoban gibi (Luka 15:4-7).",
      "“Amelsiz iman ölüdür” (Yakup 2:26). İyi işler kurtuluşu satın almaz; bize gösterilen sevgiye verdiğimiz cevaptır.",
      "Kurtuluş bir anda bitmiş bir iş değil, süren bir yoldur: “Korku ve titreme içinde kurtuluşunuz için çaba gösterin” (Filipililer 2:12). Bu yüzden Vaftiz’den sonra da Günah Çıkarma vardır: Yolda düşen, tövbe edip yeniden kalkabilir."
     ],
     "pointsEn": [
      "None of us can reach God’s perfect goodness by our own effort, so God took the first step.",
      "Christianity is the story of God setting out to find us, like the shepherd looking for his lost sheep (Luke 15:4-7).",
      "“Faith without works is dead” (James 2:26): good works don’t buy salvation; they answer a love already received.",
      "Salvation is not something finished in a single moment but a road: “Work out your own salvation with fear and trembling” (Philippians 2:12). That is why, after Baptism, there is also Confession: whoever falls on the way can repent and get up again."
     ],
     "objection": "Yani kötü biri son anda tövbe edip kurtulabilir mi? Bu adil mi?",
     "objectionEn": "So a bad person can repent at the last minute and be saved? Is that fair?",
     "reply": "Evet. İsa, çarmıhtaki suçluya “Bugün benimle birlikte cennette olacaksın” dedi (Luka 23:43). Lütuf adaletin ötesindedir, çünkü hiçbirimiz onu hak etmiyoruz. Ama tövbe gerçek bir kalp değişikliği ister ve kimsenin yarını garanti değildir.",
     "replyEn": "Yes: Jesus told the criminal on the cross, “Today you will be with me in paradise” (Luke 23:43). Grace goes beyond fairness because none of us deserves it; but repentance means a real change of heart, and no one is promised tomorrow."
    },
    {
     "id": "meryem-ve-azizler",
     "title": "Meryem Ana ve Azizler",
     "en": "Mary and the Saints",
     "hook": "Arkadaşınızdan dua isteyebiliyorsanız, cennettekinden de isteyebilirsiniz.",
     "hookEn": "If you can ask a friend to pray for you, you can ask one in heaven.",
     "q": "Katolikler Meryem’e ve azizlere tapıyor mu?",
     "qEn": "Do Catholics worship Mary and the saints?",
     "lede": "Hayır. Tapınma yalnızca Tanrı’ya yapılır. Azizlerden ise, bir arkadaşımızdan ister gibi, bizim için dua etmelerini isteriz.",
     "ledeEn": "No: worship belongs to God alone; we ask the saints to pray for us, as we would ask a friend.",
     "points": [
      "“Doğru kişinin duası çok etkilidir” (Yakup 5:16). Ölüm, Mesih’te bir olanları birbirinden ayırmaz.",
      "Meryem’e duyduğumuz saygı, onun İsa’nın annesi ve ilk öğrencisi olmasından gelir. Meryem her zaman Oğlu’nu gösterir: “O size ne derse onu yapın” (Yuhanna 2:5).",
      "Azizler, Hristiyan hayatının gerçekten yaşanabileceğinin kanıtıdır. Birçoğu, Augustinus gibi, büyük bir günahkârken değişti.",
      "Meryem, “Bundan böyle bütün kuşaklar beni kutlu sayacak” dedi (Luka 1:48). Tanrı bize anne babamıza saygı göstermeyi buyurur (Mısır’dan Çıkış 20:12); kendi Oğlu’nun annesine saygı gösterilmesini elbette ister."
     ],
     "pointsEn": [
      "“The prayer of a righteous man has great power” (James 5:16); death doesn’t separate those who are one in Christ.",
      "Mary is honored as Jesus’ mother and first disciple; she always points to her Son: “Do whatever he tells you” (John 2:5).",
      "The saints prove the Christian life can really be lived; many, like Augustine, were great sinners who were changed.",
      "Mary said, “Henceforth all generations will call me blessed” (Luke 1:48). God tells us to honor our father and mother (Exodus 20:12); how much more does he want his own Son’s mother honored."
     ],
     "objection": "Neden doğrudan Tanrı’ya dua etmiyorsunuz?",
     "objectionEn": "Why not pray to God directly?",
     "reply": "Ediyoruz. Katolik duasının merkezi, Mesih aracılığıyla Baba’ya sunulan Kutsal Ayin’dir. Bir arkadaşınızdan sizin için dua etmesini istemek Tanrı’ya olan güveninizi azaltmıyorsa, cennetteki bir arkadaştan istemek de azaltmaz.",
     "replyEn": "We do; the heart of Catholic prayer is the Mass, offered to the Father through Christ. If asking a friend to pray for you doesn’t lessen your trust in God, asking a friend in heaven doesn’t either."
    },
    {
     "id": "ahlaki-hakikatler",
     "title": "Ahlaki Hakikatler",
     "en": "Moral Truths",
     "hook": "Raylar treni hapsetmez; onu gideceği yere götürür.",
     "hookEn": "Rails don’t imprison a train; they take it where it’s going.",
     "q": "Kilise’nin kuralları neden bu kadar katı?",
     "qEn": "Why are the Church's rules so strict?",
     "lede": "Kilise’nin ahlak öğretisi keyfi yasaklardan oluşmaz. İnsanın ne olduğuna dair tutarlı bir anlayışa dayanır ve amacı insanı özgür kılmaktır.",
     "ledeEn": "The Church’s moral teaching isn’t a set of arbitrary bans but a coherent view of what a person is; its aim is freedom.",
     "points": [
      "Anne karnındaki çocuktan yaşlıya kadar her insanın hayatı dokunulmazdır. İnsanın değeri, ne kadar yararlı olduğuna bağlı değildir.",
      "Beden bir aksesuar değil, kişinin kendisidir. Cinsellik de tam anlamını ömür boyu verilen sözde, yani evlilikte bulur.",
      "Raylarına bağlı bir trene “özgür değil” denmez; tren rayları sayesinde gideceği yere varır. Ahlak da insanı gerçek mutluluğa yönlendirir.",
      "Kilise öğretisini modaya göre değiştirmez. 1930’a kadar bütün büyük Hristiyan kiliseleri doğum kontrolünü ahlaken yanlış sayıyordu. O yıl Anglikan Kilisesi bazı istisnalar tanıdı ve Protestan kiliselerinin çoğu zamanla bu yolu izledi. Katolik Kilisesi ise öğretisini korudu."
     ],
     "pointsEn": [
      "Every human life, from the unborn child to the elderly, is inviolable; a person’s worth doesn’t depend on usefulness.",
      "The body isn’t an accessory but the person; so sexuality finds its full meaning in a lifelong promise, marriage.",
      "A train isn’t “unfree” because it runs on rails; the rails get it where it is going. Morality likewise leads to real happiness.",
      "The Church doesn’t change its teaching with the times. Until 1930 all the major Christian churches held contraception to be morally wrong. That year the Anglican Church allowed some exceptions, and in time most Protestant churches followed. The Catholic Church kept its teaching."
     ],
     "objection": "Kimseye zarar vermediğim sürece ne yaptığım kimseyi ilgilendirmez.",
     "objectionEn": "As long as I don’t hurt anyone, what I do is nobody’s business.",
     "reply": "Kilise zorlamaz, davet eder. Ama kendimize de zarar verebiliriz ve yaptıklarımız başkalarını fark etmediğimiz biçimlerde etkiler. Kilise zorlananları da dışlamaz: Günah Çıkarma, her düşüşten sonra yeniden başlayabilmemiz için vardır.",
     "replyEn": "The Church doesn’t force, it invites; but we can harm ourselves too, and our acts affect others in ways we don’t see. Nor does it shut out those who struggle: Confession exists so we can start again after every fall."
    },
    {
     "id": "cennet-cehennem-araf",
     "title": "Cennet, Cehennem ve Araf",
     "en": "Heaven, Hell and Purgatory",
     "hook": "Cehennemin kapıları içeriden kilitlidir.",
     "hookEn": "The doors of hell are locked from the inside.",
     "q": "Sevgi dolu bir Tanrı birini nasıl cehenneme gönderir?",
     "qEn": "How could a loving God send anyone to hell?",
     "lede": "Tanrı kimseyi zorla cennete ya da cehenneme sokmaz. Sonsuzluk, bu hayatta verdiğimiz özgür cevabın kalıcı hâlidir.",
     "ledeEn": "God forces no one into heaven or hell; eternity is the lasting form of the free answer we give in this life.",
     "points": [
      "Cennet, bütün iyiliğin ve sevginin kaynağı olan Tanrı’yla sonsuz birliktir.",
      "Cehennem, Tanrı’dan uzak kalmayı özgürce ve ısrarla seçmenin sonucudur. C. S. Lewis’in dediği gibi, cehennemin kapıları içeriden kilitlidir.",
      "Araf, Tanrı’nın lütfu içinde ölen ama henüz tam olarak arınmamış olanların cennete hazırlanmasıdır. Bir ceza değil, sevginin tamamlanmasıdır (2 Makkabiler 12:45)."
     ],
     "pointsEn": [
      "Heaven is eternal union with God, the source of all goodness and love.",
      "Hell is the result of freely and stubbornly choosing to stay away from God; as C. S. Lewis put it, its doors are locked from the inside.",
      "Purgatory is where those who die in God’s grace but are not yet fully purified are made ready for heaven; not a punishment but love brought to completion (2 Maccabees 12:45)."
     ],
     "objection": "Sonsuz bir ceza, kısa bir hayatta işlenen günahlarla orantısız değil mi?",
     "objectionEn": "Isn’t eternal punishment out of proportion to the sins of a finite life?",
     "reply": "Cehennem bir intikam değildir; Tanrı’yı sonuna kadar reddeden bir iradenin bu reddi sürdürmesidir. Tanrı kapıyı son ana kadar açık tutar ve kimsenin kaybolmasını istemez (1 Timoteos 2:4).",
     "replyEn": "Hell isn’t revenge; it is a will that rejects God to the end, remaining in that rejection. God keeps the door open to the last moment and wants no one to be lost (1 Timothy 2:4)."
    }
   ]
  }
 ],
 "chain": [
  "Gerçek bir hakikat var",
  "Evren bir Yaratıcı’ya işaret ediyor",
  "İsa dirildi",
  "O’nun Kilise’si bugün de yaşıyor",
  "Kalbimiz O’nda huzur buluyor"
 ],
 "chainEn": [
  "There is real truth",
  "The universe points to a Creator",
  "Jesus rose from the dead",
  "His Church is still alive today",
  "Our hearts find rest in him"
 ],
 "closing": "Bunlar tek başına birer matematik kanıtı değil, birbirini destekleyen ipuçlarıdır. Gerçek diye bir şey varsa onu arayabiliriz. Evren bir Yaratıcı’ya işaret ediyorsa, O kendini bize tanıtmış olabilir. İsa dirildiyse, söyledikleri doğrudur. Ve O’nun kurduğu Kilise, iki bin yıl sonra, azizleri ve günahkârlarıyla bugün de yaşıyor. İmanın son adımı yalnızca akılla atılmaz, ama akıl bizi o adımın eşiğine kadar getirebilir. Sorularınız varsa yalnız değilsiniz: Herhangi bir Katolik kilisesinin kapısını çalabilir ya da bize yazabilirsiniz.",
 "closingEn": "These aren't mathematical proofs on their own, but clues that support one another: if there is real truth, we can seek it; if the universe points to a Creator, he may have made himself known; if Jesus rose, what he said is true; and the Church he founded is still alive today, two thousand years on, with its saints and its sinners. The final step of faith isn't taken by reason alone, but reason can bring us to its threshold. If you have questions, you're not alone: you can knock on the door of any Catholic church, or write to us."
}/*JSON-END*/;
