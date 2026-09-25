/* =====================================================================
 * EN: Catholic miracles, grouped in four categories (Marian apparitions,
 *     sacred relics, Eucharistic miracles, incorruptible saints). Original
 *     Turkish text written for this site from general historical research,
 *     not translated from any single source. Written in a warm, faith-
 *     affirming voice for a believing Catholic readership per an explicit
 *     editorial decision: it presents the pro-authenticity scientific case
 *     (STURP, Rogers 2005 on the 1988 C-14 sample, ENEA/Di Lazzaro VUV
 *     laser research, etc.) assertively and does not lead with skeptical
 *     hedging, while still not stating disputed research as unanimous
 *     scientific consensus and not misrepresenting the Church's actual
 *     (neutral) position on relics like the Shroud. Plain physical facts
 *     that would be misleading to omit (e.g. the wax/silicone masks on
 *     the "incorrupt" saints) are kept, framed warmly rather than as
 *     debunking. Private revelations are never binding on Catholic faith
 *     even when Church-approved; the page intro says so. "\n" = paragraph
 *     break, "- " starts a bullet list item.
 * TR: Katolik mucizeleri, dort kategoride. Duzenledikten sonra
 *     tools/build.ps1 calistirin. JSON-START / JSON-END isaretlerini silmeyin.
 * ===================================================================== */
window.MIRACLES = /*JSON-START*/{
 "title": "Mucizeler",
 "en": "Miracles",
 "intro": "Buradaki görünmeler ve olağanüstü olaylar “özel vahiy” sayılır: imana bir şey eklemezler, ama Kilise uzun incelemelerden sonra onları inanılmaya değer bulmuştur. Aşağıda tarihleri ve dikkat çekici bilimsel bulgularıyla yer alıyorlar.",
 "introEn": "The apparitions and extraordinary events here count as \"private revelation\": they add nothing to the faith, but after long investigation the Church has found them worthy of belief. Below are their stories and the striking scientific findings behind them.",
 "categories": [
  {
   "id": "gorunmeler",
   "icon": "apparition",
   "title": "Meryem Ana’nın Görünmeleri",
   "en": "Marian Apparitions",
   "lead": "Kilise’nin uzun incelemelerden sonra onayladığı, dünyada en çok ziyaret edilen dört görünme.",
   "leadEn": "Four of the best-known apparitions in the world, approved by the Church after long investigation.",
   "items": [
    {
     "id": "fatima",
     "name": "Fatima Meryem Ana’sı",
     "nameEn": "Our Lady of Fatima",
     "place": "Fatima, Portekiz · 1917",
     "placeEn": "Fatima, Portugal · 1917",
     "bio": "13 Mayıs 1917’de Portekiz’de koyun güden üç çocuk, Lucia, Francisco ve Jacinta, ışıkla çevrili bir kadın gördü. Kadın kendini “Tesbih’in Hanımefendisi” olarak tanıttı ve her ayın on üçünde yeniden geldi.\n13 Ekim 1917’deki son görünmede, aralarında inanmayan gazetecilerin de bulunduğu on binlerce kişi, güneşin döndüğünü, renk değiştirdiğini ve yere doğru yaklaştığını anlattı: “Güneş Mucizesi.”\nKilise görünmeleri 1930’da onayladı. Fatima bugün dünyanın en çok ziyaret edilen hac yerlerinden biridir. Fatima’yı ve Padre Pio’yu anlatan bu <a href=\"https://www.youtube.com/watch?v=tp1ivUSSz2s\" target=\"_blank\" rel=\"noopener\">İngilizce videoyu izleyebilirsiniz</a>.",
     "bioEn": "On 13 May 1917, three shepherd children in Portugal, Lucia, Francisco and Jacinta, saw a woman surrounded by light. She called herself \"Our Lady of the Rosary\" and returned on the thirteenth of each month.\nAt the last apparition on 13 October 1917, tens of thousands of people, skeptical journalists among them, reported the sun spinning, changing color and plunging toward the earth: the \"Miracle of the Sun.\"\nThe Church approved the apparitions in 1930, and Fatima is now one of the most visited shrines in the world. You can <a href=\"https://www.youtube.com/watch?v=tp1ivUSSz2s\" target=\"_blank\" rel=\"noopener\">watch this English video</a> on Fatima and Padre Pio."
    },
    {
     "id": "zeytun",
     "name": "Zeytun Meryem Ana’sı",
     "nameEn": "Our Lady of Zeitoun",
     "place": "Kahire, Mısır · 1968–1971",
     "placeEn": "Cairo, Egypt · 1968-1971",
     "bio": "2 Nisan 1968 gecesi Kahire’nin Zeytun semtindeki bir Kıpti kilisesinin kubbesinde, ışıktan bir kadın figürü görüldü. İlk tanıklar iki Müslüman otobüs tamircisiydi; birinin kubbeden atlayacağını sanıp yardım çağırdılar.\nGörünmeler üç yıl boyunca tekrarlandı; Hristiyan, Müslüman ve yabancı gazeteci, bir milyona yakın kişi kubbede ışıktan bir figür ve güvercin biçiminde ışıklar gördü. Görünmeler sessizdi, hiçbir mesaj verilmedi.\nKıpti Ortodoks Kilisesi görünmeleri resmen onayladı; Katolik Kilisesi’nin onay sürecinden geçmediler, ama iki cemaat de onları saygıyla anar.",
     "bioEn": "On the night of 2 April 1968, a figure of light appeared on the dome of a Coptic church in the Zeitoun district of Cairo. The first witnesses were two Muslim bus mechanics, who thought someone was about to jump and called for help.\nThe apparitions recurred for three years; close to a million people, Christians, Muslims and foreign journalists among them, saw a luminous figure and dove-shaped lights above the dome. They were silent, with no message.\nThe Coptic Orthodox Church formally approved them; they didn't go through the Catholic Church's approval process, but both communities honor them."
    },
    {
     "id": "guadalupe",
     "name": "Guadalupe Meryem Ana’sı",
     "nameEn": "Our Lady of Guadalupe",
     "place": "Mexico City, Meksika · 1531",
     "placeEn": "Mexico City, Mexico · 1531",
     "bio": "Aralık 1531’de, yeni vaftiz olmuş Aztek Juan Diego, Mexico City yakınındaki Tepeyac tepesinde bir kadın gördü. Kadın, Nahuatl dilinde, orada bir kilise yapılmasını istedi.\nEpiskopos bir işaret isteyince, kadın Juan Diego’yu kış ortasında tepede açmış güllere yönlendirdi. Juan Diego gülleri pelerinine (tilma) doldurup episkoposa götürdü; pelerini açtığında güller döküldü ve kumaşın üzerinde bugün de görülen Meryem Ana imgesi belirdi.\nİmge, izleyen yıllarda milyonlarca yerlinin Hristiyan olmasında büyük rol oynadı. Mexico City’deki bazilika, dünyanın en çok ziyaret edilen Meryem hac yeridir.",
     "bioEn": "In December 1531, Juan Diego, a newly baptized Aztec, saw a woman on Tepeyac hill near Mexico City. Speaking in Nahuatl, she asked for a church to be built there.\nWhen the bishop wanted a sign, she sent Juan Diego to roses blooming on the hill in midwinter. He carried them to the bishop in his cloak (tilma); when he opened it, the roses fell out and the image of Mary, still visible today, appeared on the cloth.\nThe image played a great part in millions of native people becoming Christian in the years that followed. The basilica in Mexico City is the most visited Marian shrine in the world."
    },
    {
     "id": "lourdes",
     "name": "Lourdes Meryem Ana’sı",
     "nameEn": "Our Lady of Lourdes",
     "place": "Lourdes, Fransa · 1858",
     "placeEn": "Lourdes, France · 1858",
     "bio": "11 Şubat 1858’de Fransa’nın Lourdes kasabasında yoksul ve hasta, on dört yaşındaki Bernadette Soubirous, bir mağaranın girişinde beyazlar içinde genç bir kadın gördü. On sekiz görünme boyunca kadın onu dua ve tövbeye çağırdı.\nKimliğini sorduğunda şu cevabı aldı: “Ben Günahsız Gebe Kalan’ım.” Teolojik eğitimi olmayan bir köylü kızının bilemeyeceği bu ifade, Kilise’nin görünmeleri ciddiye almasında önemli bir etken oldu.\nBernadette’in gösterdiği yerden çıkan kaynağa bugün milyonlarca hacı gelir. Binlerce şifa iddiası arasından yalnızca yetmiş kadarı, bağımsız doktorların incelemesinden sonra tıbben açıklanamaz bulunarak mucize olarak tanındı.",
     "bioEn": "On 11 February 1858, in Lourdes in southern France, Bernadette Soubirous, a poor, sickly fourteen-year-old, saw a young woman dressed in white at the entrance to a grotto. Over eighteen apparitions the woman called her to prayer and penance.\nAsked her name, she answered: \"I am the Immaculate Conception.\" A peasant girl with no theological training could hardly have known the phrase, and it weighed heavily in the Church taking the apparitions seriously.\nMillions of pilgrims now visit the spring that appeared where Bernadette pointed. Out of thousands of reported cures, only about seventy have been recognized as miracles, after independent doctors found them medically inexplicable."
    }
   ]
  },
  {
   "id": "kalintilar",
   "icon": "relic",
   "title": "Kutsal Kalıntılar ve Nesneler",
   "en": "Sacred Relics & Physical Artifacts",
   "lead": "Bilim insanlarının yüzyıllardır en çok incelediği iki nesne.",
   "leadEn": "The two objects scientists have studied most over the centuries.",
   "items": [
    {
     "id": "kefen",
     "name": "Torino Kefeni",
     "nameEn": "The Shroud of Turin",
     "place": "Torino, İtalya",
     "placeEn": "Turin, Italy",
     "bio": "Torino Kefeni, çarmıha gerilmiş bir erkeğin önden ve arkadan izini taşıyan, 4,4 metrelik bir keten kumaştır. Gelenek onu İsa’nın mezar kefeni olarak tanır. 1350’lerden beri belgelidir ve 1578’den beri Torino’da korunur.\n1898’de ilk kez fotoğraflandığında, negatif üzerinde çok net bir insan yüzü belirdi: kumaştaki iz bir fotoğraf negatifi gibi davranıyordu. 1978’de otuz kadar bilim insanından oluşan STURP ekibi, görüntünün boya, pigment ya da fırçayla yapılmadığını gösterdi. Renk, keten liflerinin yalnızca en dış yüzeyinde, ışığın dalga boyundan daha ince bir tabakadadır.\n1976’da görüntü, uzay fotoğrafları için geliştirilmiş VP-8 analizörüyle incelendiğinde, tutarlı bir üç boyutlu kabartma verdi; sıradan resimler ve fotoğraflar bunu yapmaz. Kan lekeleri gerçek insan kanıdır ve kanın altında beden görüntüsü yoktur: kan, görüntüden önce kumaşa geçmiştir.\n1988’deki radyokarbon testi kumaşı 1260-1390’a tarihledi, ama örnek, 1532 yangınından sonra onarılmış bir köşeden alınmıştı; kimyager Raymond Rogers 2005’te örnekte kefenin geri kalanında bulunmayan pamuk lifleri ve boya izleri buldu. İtalya’daki ENEA araştırmacıları, benzer bir renklenmeyi ancak çok güçlü morötesi lazer atımlarıyla üretebildiler.\nKilise kefeni resmen “özgün” ilan etmedi, çünkü bu bir iman değil, bilim konusudur; ama papalar onu derin bir saygıyla ziyaret eder.",
     "bioEn": "The Shroud of Turin is a 4.4-meter linen cloth bearing the front and back image of a crucified man. Tradition holds it to be Jesus' burial cloth. It is documented from the 1350s and has been kept in Turin since 1578.\nWhen it was first photographed in 1898, the negative showed a strikingly clear human face: the image on the cloth behaves like a photographic negative. In 1978 the STURP team of about thirty scientists showed that the image isn't made with paint, pigment or brushstrokes. The color sits only on the outermost surface of the linen fibers, in a layer thinner than a wavelength of light.\nIn 1976, analyzed with the VP-8, a device built to map space photographs, the image produced a consistent three-dimensional relief, which ordinary paintings and photos don't. The bloodstains are real human blood, and there is no image beneath them: the blood reached the cloth before the image formed.\nThe 1988 radiocarbon test dated the cloth to 1260-1390, but the sample came from a corner repaired after a fire in 1532; in 2005 chemist Raymond Rogers found cotton fibers and dye in the sample that are absent from the rest of the shroud. Researchers at Italy's ENEA could reproduce similar coloring only with extremely powerful ultraviolet laser pulses.\nThe Church hasn't declared the shroud \"authentic,\" because that is a scientific question, not a matter of faith; but popes visit it with deep reverence."
    },
    {
     "id": "tilma",
     "name": "Guadalupe Tilması",
     "nameEn": "The Guadalupe Tilma",
     "place": "Mexico City, Meksika",
     "placeEn": "Mexico City, Mexico",
     "bio": "Juan Diego’nun pelerini, maguey bitkisinin lifinden dokunmuş kaba bir kumaştır ve normalde birkaç on yılda çürümesi gerekirdi. Oysa yüzyıllarca camsız sergilenmesine rağmen imge bugün de nettir.\n1979’da biyofizikçi Philip Callahan, kızılötesi incelemede imgenin ana kısmında fırça taslağı ya da boya katmanı bulamadı; ay, melek ve ışınlar gibi bazı ayrıntıların ise sonradan eklendiğini gösterdi. Mühendis José Aste Tonsmann, Meryem’in gözbebeklerinde, canlı bir gözün yansıtacağı gibi, önündeki kişilerin küçük figürlerini gördüğünü bildirdi.\nTilma, her yıl yirmi milyonu aşkın hacının ziyaret ettiği Meksika’nın en kutsal nesnesidir.",
     "bioEn": "Juan Diego's cloak is a coarse cloth woven from maguey fiber, which normally rots within a few decades. Yet despite being displayed for centuries without glass, the image is still clear today.\nIn 1979, biophysicist Philip Callahan's infrared study found no underdrawing or layers of paint in the main part of the image, while showing that some details, such as the moon, the angel and the rays, were added later. Engineer José Aste Tonsmann reported seeing tiny figures of the people before her reflected in Mary's pupils, as a living eye would reflect them.\nThe tilma is Mexico's most sacred object, visited by more than twenty million pilgrims a year."
    }
   ]
  },
  {
   "id": "efkaristiya",
   "icon": "eucharist",
   "title": "Efkaristiya Mucizeleri",
   "en": "Eucharistic Miracles",
   "lead": "Efkaristiya’da ekmek ve şarap, görünüşleri değişmeden Mesih’in bedeni ve kanı olur. Geleneğe göre aşağıdaki üç olayda bu değişim gözle görülür hâle geldi.",
   "leadEn": "In the Eucharist, bread and wine become Christ's Body and Blood while looking unchanged. In the three events below, tradition holds, the change became visible.",
   "items": [
    {
     "id": "lanciano",
     "name": "Lanciano Mucizesi",
     "nameEn": "The Miracle of Lanciano",
     "place": "Lanciano, İtalya · 8. yüzyıl",
     "placeEn": "Lanciano, Italy · 8th century",
     "bio": "Geleneğe göre 8. yüzyılda İtalya’nın Lanciano kentinde, Efkaristiya’dan kuşku duyan bir rahip kutsama sözlerini söylediği anda ekmek ete, şarap kana dönüştü.\nEt ve kan bugün de sergilenir. 1970-71’de patolog Odoardo Linoli, etin insan kalp kası, kanın ise AB grubundan insan kanı olduğunu ve hiçbir koruyucu kullanılmadan on iki yüzyıl bozulmadan kaldığını bildirdi.\nBu mucizeyi ve Buenos Aires Mucizesi’ni anlatan bir <a href=\"https://www.youtube.com/watch?v=KHlpFltTGFs\" target=\"_blank\" rel=\"noopener\">İngilizce videoyu buradan izleyebilirsiniz</a>.",
     "bioEn": "According to tradition, in the 8th century in Lanciano, Italy, a priest who doubted the Eucharist saw the bread turn into flesh and the wine into blood as he spoke the words of consecration.\nThe flesh and blood are still on display. In 1970-71 pathologist Odoardo Linoli reported that the flesh is human heart muscle and the blood human blood of type AB, preserved for twelve centuries without any preservative.\nYou can <a href=\"https://www.youtube.com/watch?v=KHlpFltTGFs\" target=\"_blank\" rel=\"noopener\">watch an English video here</a> about this miracle and the Buenos Aires miracle."
    },
    {
     "id": "bolsena",
     "name": "Bolsena-Orvieto Mucizesi",
     "nameEn": "The Miracle of Bolsena-Orvieto",
     "place": "Bolsena / Orvieto, İtalya · 1263",
     "placeEn": "Bolsena / Orvieto, Italy · 1263",
     "bio": "1263’te, Efkaristiya’dan kuşku duyan Bohemyalı bir rahip Bolsena’da ayin yönetirken, böldüğü ekmekten sunak bezine kan sızdı.\nPapa IV. Urbanus olayı inceletti ve kanlı bezi Orvieto’ya getirtti. Ertesi yıl bütün Kilise için Corpus Christi (Mesih’in Bedeni) Bayramı’nı ilan etti ve dualarını yazmakla Aziz Thomas Aquinas’ı görevlendirdi. Bez bugün Orvieto Katedrali’nde korunur ve her yıl bayramda alayla taşınır.",
     "bioEn": "In 1263 a Bohemian priest who doubted the Eucharist was saying Mass in Bolsena when blood seeped from the host he broke onto the altar cloth.\nPope Urban IV had the event investigated and the cloth brought to Orvieto. The next year he established the feast of Corpus Christi for the whole Church and asked St. Thomas Aquinas to write its prayers. The cloth is kept in Orvieto Cathedral and carried in procession every year on the feast."
    },
    {
     "id": "buenos-aires",
     "name": "Buenos Aires Mucizesi",
     "nameEn": "The Buenos Aires Miracle",
     "place": "Buenos Aires, Arjantin · 1996",
     "placeEn": "Buenos Aires, Argentina · 1996",
     "bio": "1996’da Buenos Aires’te bir kilisede yere düşmüş kutsanmış bir ekmek, eriyip gitmesi için suya kondu. Birkaç gün sonra üzerinde kan benzeri kırmızı lekeler belirdi ve büyüdü.\nDönemin başpiskoposu, ileride Papa Franciscus olacak Jorge Mario Bergoglio olayı bilimsel olarak inceletti. 1999’da New York’ta kardiyolog Frederick Zugibe, kaynağını bilmeden incelediği örneğin iltihaplı bir kalbin sol karıncığına ait insan kalp kası olduğunu bildirdi; kan grubu AB’ydi, Lanciano’daki gibi.\nBu mucizeyi ve Lanciano Mucizesi’ni anlatan bir <a href=\"https://www.youtube.com/watch?v=KHlpFltTGFs\" target=\"_blank\" rel=\"noopener\">İngilizce videoyu buradan izleyebilirsiniz</a>.",
     "bioEn": "In 1996, in a Buenos Aires church, a consecrated host found discarded was placed in water to dissolve. A few days later red, blood-like spots appeared on it and kept growing.\nThe archbishop at the time, Jorge Mario Bergoglio, the future Pope Francis, had it studied scientifically. In 1999 in New York, cardiologist Frederick Zugibe, who wasn't told where the sample came from, reported that it was human heart muscle from the left ventricle of an inflamed heart; the blood type was AB, as at Lanciano.\nYou can <a href=\"https://www.youtube.com/watch?v=KHlpFltTGFs\" target=\"_blank\" rel=\"noopener\">watch an English video here</a> about this miracle and the Lanciano miracle."
    }
   ]
  },
  {
   "id": "curumeyen-azizler",
   "icon": "incorrupt",
   "title": "Çürümeyen Azizler",
   "en": "Incorruptible Saints",
   "lead": "Bazı azizlerin bedenleri, ölümlerinden yıllar hatta yüzyıllar sonra beklenenden çok daha az çürümüş bulunmuştur. Sergilenen bedenlerin yüzleri korunmak için çoğu zaman ince bir balmumu ya da silikon maskeyle kaplanır.",
   "leadEn": "The bodies of some saints have been found far less decayed than expected, years or even centuries after death. The faces of bodies on display are often covered with a thin wax or silicone mask to protect them.",
   "items": [
    {
     "id": "bernadette",
     "name": "Lourdesli Aziz Bernadette",
     "nameEn": "St. Bernadette of Lourdes",
     "place": "Nevers, Fransa",
     "placeEn": "Nevers, France",
     "bio": "Lourdes’un görücüsü Bernadette, 1879’da otuz beş yaşında öldü. Bedeni 1909’da çıkarıldığında, gömülmesinden otuz yıl sonra, cildi şaşırtıcı derecede doğal görünüyordu.\n1925’te beden kalıcı olarak sergilenmeye karar verilince, yüzü ve elleri ince bir balmumu maskeyle kaplandı. Bugün Nevers’de cam bir sandukada yatar; maskenin altında on yıllarca çürümeden kalmış beden durur. Bernadette 1933’te aziz ilan edildi.",
     "bioEn": "Bernadette, the visionary of Lourdes, died in 1879 at thirty-five. When her body was exhumed in 1909, thirty years after burial, her skin looked astonishingly natural.\nWhen it was decided in 1925 to display the body permanently, her face and hands were covered with a thin wax mask. Today she lies in a glass reliquary in Nevers; beneath the mask is the body that stayed incorrupt for decades. Bernadette was canonized in 1933."
    },
    {
     "id": "padre-pio",
     "name": "Aziz Padre Pio",
     "nameEn": "St. Padre Pio",
     "place": "San Giovanni Rotondo, İtalya",
     "placeEn": "San Giovanni Rotondo, Italy",
     "bio": "İtalyan Kapuçin rahibi Padre Pio, 1918’den 1968’deki ölümüne kadar ellerinde, ayaklarında ve böğründe Mesih’in yaralarına benzeyen stigmata taşıdı. Doktorların defalarca incelediği yaraların elli yıl kanadığı, hiç iltihaplanmadığı ve gül kokusu yaydığı bildirildi.\nBedeni 2008’de çıkarıldığında eller ve ayaklar iyi korunmuştu; yüzü için silikon bir maske yapıldı. San Giovanni Rotondo’daki sandukasını her yıl milyonlarca hacı ziyaret eder. Padre Pio’yu ve Fatima’yı anlatan bu <a href=\"https://www.youtube.com/watch?v=tp1ivUSSz2s\" target=\"_blank\" rel=\"noopener\">İngilizce videoyu izleyebilirsiniz</a>.",
     "bioEn": "The Italian Capuchin friar Padre Pio bore the stigmata, wounds like those of Christ on his hands, feet and side, from 1918 until his death in 1968. Examined repeatedly by doctors, the wounds were reported to bleed for fifty years without ever becoming infected, and to give off the scent of roses.\nWhen his body was exhumed in 2008, the hands and feet were well preserved; a silicone mask was made for his face. Millions of pilgrims visit his shrine in San Giovanni Rotondo every year. You can <a href=\"https://www.youtube.com/watch?v=tp1ivUSSz2s\" target=\"_blank\" rel=\"noopener\">watch this English video</a> on Padre Pio and Fatima."
    },
    {
     "id": "vianney",
     "name": "Aziz Jean-Marie Vianney (Ars Curesi)",
     "nameEn": "St. Jean-Marie Vianney (The Curé of Ars)",
     "place": "Ars, Fransa",
     "placeEn": "Ars, France",
     "bio": "Ars köyünün papazı Jean-Marie Vianney, günde on altı saate kadar günah çıkarttı; Fransa’nın her yerinden insanlar ona koştu. Bugün bütün papazların koruyucu azizidir.\n1859’da ölen Vianney’nin bedeni 1904’te çıkarıldığında kurumuş ama dağılmamıştı. Çürümemiş kalbi ayrı bir şapelde sergilenir; bedeni ise yüzü balmumu maskeyle kaplı olarak Ars’taki bazilikada yatar.",
     "bioEn": "Jean-Marie Vianney, the parish priest of Ars, heard confessions for up to sixteen hours a day, and people flocked to him from all over France. He is now the patron saint of all parish priests.\nWhen his body was exhumed in 1904, forty-five years after his death, it was dried but intact. His incorrupt heart is displayed in a separate chapel, and his body, its face covered with a wax mask, lies in the basilica at Ars."
    }
   ]
  }
 ]
}/*JSON-END*/;
