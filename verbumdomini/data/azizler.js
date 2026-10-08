/* =====================================================================
 * EN: Saints of the General Roman Calendar (rank: Buyuk Bayram / Bayram /
 *     Anma Gunu / Ihtiyari Anma Gunu), plus, for dates the GRC leaves
 *     open, a saint drawn from the fuller Roman Martyrology or historical
 *     Western calendar tradition (rank: "Roma Azizler Cetveli", kept
 *     visually distinct so it is not mistaken for an official GRC
 *     memorial). One truly open date (Dec 22) still uses "genel": true
 *     and the shared genelBio note rather than invented content.
 *     A separate list of Easter-relative movable feasts is resolved in
 *     JS via the Computus algorithm. Biographies are original Turkish
 *     text written from general knowledge, not translated from any
 *     single source. "\n" = paragraph break.
 * TR: Ayin takviminin azizleri. Duzenledikten sonra tools/build.ps1
 *     calistirin. JSON-START / JSON-END isaretlerini silmeyin.
 * ===================================================================== */
window.SAINTS = /*JSON-START*/{
 "title": "Azizler",
 "en": "Saints",
 "intro": "Kilise yılın her gününde en az bir azizi anar. Her biri, imanla yaşamanın mümkün olduğunu gösterir.",
 "introEn": "Every day of the year the Church remembers at least one saint: real people who showed that a life of faith can actually be lived.",
 "genelTitle": "Bugün İçin Özel Bir Aziz Yok",
 "genelTitleEn": "No Saint Listed Today",
 "genelBio": "Bu tarihe, ne Roma Genel Takvimi’nde ne de Roma Azizler Cetveli’nde, güvenle aktarabileceğimiz bir aziz yerleştirilmiş. Bu, o günün azizsiz olduğu anlamına gelmez. Kilise’nin tarih boyunca tanıdığı sayısız aziz arasında adı ve tarihi bu kadar ayrıntılı doğrulanamayan pek çok kutsal insan vardır. Böyle günlerde Kilise bizi, adlarını bilmesek de Allah’ın huzurunda olan bütün azizleri anmaya çağırır.",
 "genelBioEn": "Neither the General Roman Calendar nor the Roman Martyrology gives a saint for this date that we can name with confidence. That doesn’t mean the day has no saint. The Church knows of countless holy men and women whose names and dates are lost, so today, remember all of them: every saint in heaven, known or unknown.",
 "days": [
  {
   "m": 1,
   "d": 1,
   "rank": "Büyük Bayram",
   "saints": [
    {
     "name": "Meryem Ana",
     "title": "Tanrı Anası",
     "bio": "Yılın ilk günü Kilise, en eski Meryem bayramlarından birini kutlar: Meryem’in Theotokos, yani Tanrı Anası oluşunu. Bu unvan 431’deki Efes Konsili’nde resmen tanındı. Kilise babaları şöyle düşündü: Meryem’in Oğlu gerçekten Allah ise, Meryem de gerçekten Tanrı’nın Anası’dır. Bu gün aynı zamanda Noel’in sekizinci günüdür; Kilise yeni yılı Meryem’in duasına emanet eder.",
     "nameEn": "Mary, Mother of God",
     "titleEn": "Mother of God",
     "bioEn": "On the first day of the year, the Church celebrates one of the oldest Marian feasts: Mary's title as Theotokos, Mother of God. This title was formally recognized at the Council of Ephesus in 431; the Church Fathers argued that if Mary's Son is truly God, then Mary is truly the Mother of God. It also falls on the eighth day of Christmas, so the new year begins in Mary's care."
    }
   ]
  },
  {
   "m": 1,
   "d": 2,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Büyük Basileios",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "IV. yüzyılda Kapadokya’da, bugünkü Kayseri bölgesinde yaşadı ve Kayseri episkoposu oldu. Manastır hayatı için yazdığı kurallar, Doğu manastırcılığının temelidir. Yoksullar için hastaneleri ve barınakları olan büyük bir yardım merkezi kurdu. Kutsal Ruh’un Tanrı olduğunu savunan yazılarıyla, Arianizme karşı Kilise’nin inancını korudu.",
     "nameEn": "Basil the Great",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "A great churchman who lived in fourth-century Cappadocia (in what is now the Kayseri region of Turkey) and became bishop of Caesarea. The rules he wrote for monastic life form the foundation of Eastern monasticism; he also built a large charitable complex of hospitals and shelters for the poor. His writings defending the divinity of the Holy Spirit safeguarded the Church's faith against Arianism."
    },
    {
     "name": "Nazianzoslu Gregorios",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "Basileios’un yakın dostu ve IV. yüzyılın bir başka büyük Kapadokyalı teoloğudur. Konstantinopolis episkoposu oldu. Kutsal Üçlü üzerine verdiği vaazlar yüzünden ona “Teolog” dendi. “Kapadokyalı Babalar” diye anılan üç büyük isimden biri olarak, Mesih İsa’nın hem tam Tanrı hem tam insan olduğu öğretisinin netleşmesinde kalıcı bir iz bıraktı.",
     "nameEn": "Gregory of Nazianzus",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "A close friend of Basil, and another great fourth-century Cappadocian theologian. He served as bishop of Constantinople and earned the title \"the Theologian\" through his sermons on the Holy Trinity. As one of the Cappadocian Fathers, he did much to make Christian teaching clear, above all that Christ is fully God and fully man."
    }
   ]
  },
  {
   "m": 1,
   "d": 3,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Kutsal İsa Adı",
     "title": "",
     "bio": "Bu gün İsa adının gücünü ve tatlılığını anar. Dayanağı, Yeni Ahit’teki şu sözdür: “Göğün altında insanlara verilmiş, bizi kurtarabilecek başka hiçbir ad yoktur” (Elçilerin İşleri 4:12). Bu anmayı Orta Çağ’dan beri özellikle Fransiskenler ve Cizvitler yaydı.",
     "nameEn": "The Holy Name of Jesus",
     "titleEn": "",
     "bioEn": "An optional memorial honoring the name of Jesus itself: “There is no other name under heaven given among men by which we must be saved” (Acts 4:12). The Franciscans and later the Jesuits spread the devotion from the Middle Ages on."
    }
   ]
  },
  {
   "m": 1,
   "d": 4,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Elizabeth Ann Seton",
     "title": "Rahibe",
     "bio": "New York’ta doğdu. Dul kaldıktan sonra Katolik oldu. 1809’da Maryland’de Sisters of Charity rahibe cemaatini kurdu ve Amerika Birleşik Devletleri’nde Katolik okul sisteminin temelini attı. 1975’te aziz ilan edildi; Amerika’da doğmuş ilk azizedir.",
     "nameEn": "Elizabeth Ann Seton",
     "titleEn": "Religious",
     "bioEn": "An American born in New York who converted to Catholicism after being widowed. In 1809 she founded the Sisters of Charity in Maryland and laid the foundations of the Catholic school system in the United States. Canonized in 1975, she is the first American-born saint."
    }
   ]
  },
  {
   "m": 1,
   "d": 5,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "John Neumann",
     "title": "Episkopos",
     "bio": "Bohemya’da doğdu, Amerika Birleşik Devletleri’ne göç etti ve orada rahip oldu. Philadelphia episkoposu olarak görev yaptı. Amerika’daki ilk düzenli Katolik okul sistemini kurdu ve Kırk Saatlik Adorasyon geleneğini yaydı. Amerika’da episkoposluk yapmış ve aziz ilan edilmiş ilk erkektir.",
     "nameEn": "John Neumann",
     "titleEn": "Bishop",
     "bioEn": "Born in Bohemia, he emigrated to the United States, was ordained there and became bishop of Philadelphia. He established America's first diocesan Catholic school system and spread the tradition of the Forty Hours' Devotion. He was the first American bishop to be canonized."
    }
   ]
  },
  {
   "m": 1,
   "d": 6,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "André Bessette",
     "title": "Rahip Kardeş",
     "bio": "Kanada’nın Québec bölgesinde yoksul bir ailede doğdu. Sağlığı zayıf olduğu için hiçbir işte tutunamadı; sonunda Sainte-Croix cemaatine kapıcı olarak kabul edildi. Aziz Yusuf’a derin bir bağlılığı vardı. Ona dua isteyerek gelenlerin şifa bulduğuna dair sayısız tanıklık vardır; bugün de ziyaret edilen Montreal’deki büyük Saint Joseph Oratuvarı bu sayede kuruldu.",
     "nameEn": "André Bessette",
     "titleEn": "Religious",
     "bioEn": "Born to a poor family in Quebec, he was too frail to hold down a job until the Congregation of Holy Cross finally took him on as a doorkeeper. He had a deep devotion to Saint Joseph, and so many people reported being healed after asking for his prayers that the great Saint Joseph's Oratory was built in Montreal, where pilgrims still come today."
    }
   ]
  },
  {
   "m": 1,
   "d": 7,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Ramon de Penyafort",
     "title": "Rahip",
     "bio": "XIII. yüzyılda Katalonya’da doğan bir Dominikendir. Papa IX. Gregorius’un isteği üzerine Kilise’nin dağınık hukuk metinlerini topladı ve düzenledi; bu derleme yüzyıllarca kilise hukukunun temel kaynağı oldu. Dominiken tarikatının genel başkanlığını da yaptı. Günah çıkarma ve ahlak teolojisi üzerine yazdıklarıyla tanınır.",
     "nameEn": "Raymond of Penyafort",
     "titleEn": "Priest",
     "bioEn": "A Dominican friar born in Catalonia in the thirteenth century. At the request of Pope Gregory IX, he compiled and organized the Church's scattered canon law texts, a collection that remained the basic source of canon law for centuries. He also served as master general of the Dominican order and is known for his writings on confession and moral theology."
    }
   ]
  },
  {
   "m": 1,
   "d": 8,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Noricumlu Severinus",
     "title": "Rahip",
     "bio": "V. yüzyılda bugünkü Avusturya topraklarında (Noricum) yaşamış bir keşiştir. Anlatılana göre Roma yönetiminin bölgeden çekileceğini önceden haber verdi ve halkı barbar akınlarına karşı örgütledi. Avusturya’nın koruyucu azizlerinden biridir.",
     "nameEn": "Severinus of Noricum",
     "titleEn": "Priest",
     "bioEn": "A monk who lived in the fifth century in what is now Austria (Noricum). He is said to have foretold the withdrawal of Roman rule from the region and organized the local people against barbarian raids; he is regarded as one of the patron saints of Austria."
    }
   ]
  },
  {
   "m": 1,
   "d": 9,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Canterburyli Adrianus",
     "title": "Başrahip",
     "bio": "VII. yüzyılda Kuzey Afrika’da doğmuş bir Benedikten keşişidir. İngiltere’ye giden Tarsuslu Theodoros’a eşlik etti. Canterbury yakınındaki bir manastırın başrahibi olarak kırk yıl boyunca Latince, Yunanca ve Kutsal Kitap öğretti.",
     "nameEn": "Adrian of Canterbury",
     "titleEn": "Abbot",
     "bioEn": "A seventh-century Benedictine born in North Africa; he accompanied Theodore of Tarsus to England and, as abbot of a monastery near Canterbury, taught Latin, Greek, and Scripture for forty years."
    }
   ]
  },
  {
   "m": 1,
   "d": 10,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Bourgesli Guillaume",
     "title": "Episkopos",
     "bio": "XII-XIII. yüzyılda Fransa’da yaşadı. Önce bir Sisterciyen keşişiydi, sonra Bourges başepiskoposu oldu. Episkopos olduktan sonra da sade ve yoksul yaşamaya devam etti; adaleti ve sadeliğiyle anılır.",
     "nameEn": "William of Bourges",
     "titleEn": "Bishop",
     "bioEn": "A Cistercian monk in twelfth- and thirteenth-century France who became archbishop of Bourges. Even as a bishop he kept to his life of poverty and is remembered as an example of justice and simplicity."
    }
   ]
  },
  {
   "m": 1,
   "d": 11,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Kenobiark Theodosios",
     "title": "Başrahip",
     "bio": "V-VI. yüzyılda yaşadı. Kapadokya’da doğdu, sonra Filistin çölünde, keşişlerin birlikte yaşadığı büyük bir manastır kurdu. Farklı dillerden gelen keşişler için ayrı şapeller yaptırdı. Doğu manastırcılığının düzene girmesinde öncü oldu.",
     "nameEn": "Theodosius the Cenobiarch",
     "titleEn": "Abbot",
     "bioEn": "Born in Cappadocia in the fifth century, he went on to found a great communal monastery in the Palestinian desert. He had separate chapels built for monks of different languages, and was a pioneer in organizing Eastern communal monasticism."
    }
   ]
  },
  {
   "m": 1,
   "d": 12,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Marguerite Bourgeoys",
     "title": "Bakire",
     "bio": "XVII. yüzyılda Fransa’da doğdu ve Yeni Fransa’ya, bugünkü Montreal’e göç etti. Koloninin ilk okulunu açtı. Kızların ve yerli çocukların eğitimi için, köy köy dolaşan öğretmenlerden oluşan Notre-Dame Cemaati’ni kurdu.",
     "nameEn": "Margaret Bourgeoys",
     "titleEn": "Virgin",
     "bioEn": "A teacher born in seventeenth-century France who emigrated to New France (present-day Montreal). She founded the colony's first school and established the Congregation of Notre-Dame, a traveling teaching community for the education of girls and Indigenous children."
    }
   ]
  },
  {
   "m": 1,
   "d": 13,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Poitiersli Hilarius",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "IV. yüzyılda Galya’da, bugünkü Fransa’da, Poitiers episkoposu oldu. Arianizme karşı Mesih İsa’nın tam anlamıyla Tanrı olduğunu savunduğu için sürgüne gönderildi. Ona “Batı’nın Athanasius’u” denir. Kutsal Üçlü üzerine yazdığı eserler, Latin teolojisinin gelişiminde bir dönüm noktasıdır.",
     "nameEn": "Hilary of Poitiers",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "Bishop of Poitiers in fourth-century Gaul (modern France), exiled for defending Christ's full divinity against Arianism. Known as \"the Athanasius of the West,\" he wrote on the Holy Trinity, and his writings mark an important turning point in the development of Latin theology."
    }
   ]
  },
  {
   "m": 1,
   "d": 14,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Nolalı Felix",
     "title": "Rahip",
     "bio": "III. yüzyılda İtalya’nın Nola kentinde rahipti. Zulüm sırasında saklanarak hayatta kaldı, sonra yoksullara hizmet ederek yaşlılığına kadar yaşadı. Hayatını, ondan bir yüzyıl sonra yaşayan Nolalı Aziz Paulinus’un şiirleri sayesinde ayrıntılarıyla biliyoruz.",
     "nameEn": "Felix of Nola",
     "titleEn": "Priest",
     "bioEn": "A priest in the Italian city of Nola in the third century, who went into hiding and survived the persecution, then lived to old age serving the poor. His life is known in detail thanks to the poems of Saint Paulinus of Nola, who lived a century later."
    }
   ]
  },
  {
   "m": 1,
   "d": 15,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Tebli Pavlus",
     "title": "Münzevi",
     "bio": "Geleneğe göre III. yüzyılda Mısır çölüne çekilen ilk Hristiyan münzevidir ve orada doksan yıldan fazla tek başına yaşadı. Ölümünden kısa süre önce Mısırlı Antonius onu ziyaret etti. Efsaneye göre Antonius, iki aslanın yardımıyla onun mezarını kazdı.",
     "nameEn": "Paul of Thebes",
     "titleEn": "Hermit",
     "bioEn": "Tradition says he was the first Christian hermit to go into the Egyptian desert, in the third century; he is said to have lived alone for more than ninety years. He is known for the legend that Anthony of Egypt, who visited him shortly before his death, dug his grave with the help of two lions."
    }
   ]
  },
  {
   "m": 1,
   "d": 16,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "I. Marcellus",
     "title": "Papa ve Şehit",
     "bio": "IV. yüzyılın başında kısa bir süre papalık yaptı. İmparator Maxentius döneminde, zulüm sırasında imanını inkâr edenlerin Kilise’ye geri alınması konusunda sert davrandı. Bu yüzden sürgüne gönderildi ve sürgünde öldü.",
     "nameEn": "Marcellus I",
     "titleEn": "Pope and Martyr",
     "bioEn": "Pope for a brief period in the early fourth century. Because of his strict stance on readmitting to the Church those who had lapsed from the faith, Emperor Maxentius exiled him, and he died in exile."
    }
   ]
  },
  {
   "m": 1,
   "d": 17,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Mısırlı Büyük Antonius",
     "title": "Başrahip",
     "bio": "III. yüzyılda Mısır’da doğdu. Servetini yoksullara dağıttı ve çöle çekildi. Hristiyan manastırcılığının öncüsü sayılır. Onlarca yıl süren çöl hayatı, kendisinden sonra binlerce kişiyi manastır hayatına yöneltti. Hayatını, Aziz Athanasius’un yazdığı ve manastırcılık geleneğini derinden etkileyen biyografiden biliyoruz.",
     "nameEn": "Anthony of Egypt",
     "titleEn": "Abbot",
     "bioEn": "Born in Egypt in the third century, he gave away his wealth and withdrew into the desert; he is considered the pioneer of Christian monasticism. His decades of desert life, spent in solitude and spiritual struggle, went on to draw thousands into monastic life after him. His life is known through a biography written by Saint Athanasius, one of the most influential texts in the monastic tradition."
    }
   ]
  },
  {
   "m": 1,
   "d": 18,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Prisca",
     "title": "Bakire ve Şehit",
     "bio": "Geleneğe göre I. yüzyılda Roma’da, daha on üç yaşındayken imanı uğruna şehit edilen genç bir kızdır. Roma’nın en eski kiliselerinden biri olan Santa Prisca’nın onun evinin üzerine yapıldığına inanılır.",
     "nameEn": "Prisca",
     "titleEn": "Virgin and Martyr",
     "bioEn": "Tradition says she was a girl of only thirteen, martyred for her faith in first-century Rome. One of the oldest churches in Rome, Santa Prisca, is believed to have been built over her home."
    }
   ]
  },
  {
   "m": 1,
   "d": 19,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Danimarkalı IV. Knud",
     "title": "Kral ve Şehit",
     "bio": "XI. yüzyılda Danimarka kralıydı. İngiltere’yi yeniden fethetmeye hazırlanırken kendi soyluları ona karşı ayaklandı. Bir kilisede sunağın önünde dua ederken öldürüldü. Danimarka’nın koruyucu azizidir.",
     "nameEn": "Canute IV",
     "titleEn": "King and Martyr",
     "bioEn": "King of Denmark in the eleventh century, he faced a revolt by his own nobles while planning to reconquer England, and was killed while praying before the altar of a church. He is the patron saint of Denmark."
    }
   ]
  },
  {
   "m": 1,
   "d": 20,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Fabianus",
     "title": "Papa ve Şehit",
     "bio": "III. yüzyılda papa seçildi. Geleneğe göre seçim sırasında başına bir güvercin kondu ve halk ile rahipler onu oybirliğiyle seçti. On dört yıllık papalığı boyunca Roma Kilisesi’ni düzene soktu. İmparator Decius’un başlattığı zulüm sırasında, 250 yılında şehit edildi.",
     "nameEn": "Fabian",
     "titleEn": "Pope and Martyr",
     "bioEn": "Tradition says that when Rome gathered to elect a new pope in the third century, a dove landed on his head, and the people and clergy chose him on the spot. During his fourteen-year papacy he organized the Church of Rome, and was martyred in 250 during the persecution launched by Emperor Decius."
    },
    {
     "name": "Sebastian",
     "title": "Şehit",
     "bio": "Geleneğe göre Roma ordusunda subaydı ve gizlice Hristiyan olmuştu. İmparator Diocletianus döneminde imanı yüzünden oklarla vuruldu. Yaralı olarak hayatta kaldı, ama sonra yeniden yakalanıp öldürüldü. Sanat tarihinde en çok resmedilen şehitlerden biridir; vebaya karşı koruyucu olarak da anılır.",
     "nameEn": "Sebastian",
     "titleEn": "Martyr",
     "bioEn": "Tradition says he was an officer in the Roman army and a secret Christian, shot with arrows for his faith under Emperor Diocletian. He is said to have survived his wounds, only to be arrested again and killed. He is one of the most frequently depicted martyrs in art history, and is also venerated as a protector against plague."
    }
   ]
  },
  {
   "m": 1,
   "d": 21,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Agnes",
     "title": "Bakire ve Şehit",
     "bio": "IV. yüzyılın başında Roma’da, henüz on iki-on üç yaşındayken şehit edilen bir kızdır. Kendini Mesih İsa’ya adadığı için evlenmeyi reddetti ve bu yüzden öldürüldü. Bu kadar genç yaşta gösterdiği sarsılmaz iman, ilk yüzyıllardan beri Kilise’de büyük saygı görür. Adı, Ayin’deki en eski Efkaristiya duası olan Roma Kanunu’nda anılır.",
     "nameEn": "Agnes",
     "titleEn": "Virgin and Martyr",
     "bioEn": "A young girl martyred in early fourth-century Rome, only twelve or thirteen years old, for refusing marriage because she had consecrated her virginity to Christ. The Church has honored her courage since the first centuries; she is among the saints named in the Roman Canon of the Mass."
    }
   ]
  },
  {
   "m": 1,
   "d": 22,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Zaragozalı Vincentius",
     "title": "Diyakoz ve Şehit",
     "bio": "III. yüzyılın sonunda İspanya’da, Saragossa episkoposunun diyakozu olarak hizmet etti. İmparator Diocletianus’un zulmü sırasında ağır işkencelere rağmen imanından dönmedi ve şehit edildi. Adı çok erken dönemden beri ilahilerde ve dualarda anılır; Hristiyanlığın ilk büyük diyakoz şehitlerindendir.",
     "nameEn": "Vincent of Saragossa",
     "titleEn": "Deacon and Martyr",
     "bioEn": "Serving as deacon to the bishop of Saragossa in Spain at the end of the third century, he was martyred under Emperor Diocletian's persecution, refusing to renounce his faith despite unbearable torture. Remembered in liturgical poetry and hymns from a very early period, he is one of Christianity's first great deacon-martyrs."
    }
   ]
  },
  {
   "m": 1,
   "d": 23,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Marianne Cope",
     "title": "Rahibe",
     "bio": "Almanya’da doğdu, Amerika’ya göç etti ve Fransisken rahibesi oldu. Hawaii’deki cüzzam hastalarına bakmak için gönüllü oldu. Molokai adasındaki hasta kolonisi için hastaneler ve yetimhaneler kurdu ve otuz yıldan fazla orada hizmet etti. Aynı adada çalışan Aziz Damien öldükten sonra onun işini sürdürdü.",
     "nameEn": "Marianne Cope",
     "titleEn": "Religious",
     "bioEn": "A Franciscan sister born in Germany who emigrated to America. She volunteered to care for leprosy patients in Hawaii, founding hospitals and orphanages for the patient colony on the island of Molokai, where she served for more than thirty years. She continued the work of Saint Damien, who served on the same island, after his death."
    }
   ]
  },
  {
   "m": 1,
   "d": 24,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Fransuva de Sal",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "XVI-XVII. yüzyılda Savoy bölgesinde Cenevre episkoposuydu. Sakin ve nazik yaklaşımıyla, Protestan olmuş bölgeleri yeniden Katolik inancına kazandırdı. “Dindar Yaşama Giriş” adlı kitabında, kutsallığın yalnızca rahiplere ve rahibelere değil, her meslekten sıradan insanlara da açık olduğunu anlattı. Katolik basınının koruyucu azizidir.",
     "nameEn": "Francis de Sales",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "Bishop of Geneva in sixteenth- and seventeenth-century Savoy, his patience and gentleness won whole regions that had turned Protestant back to the Catholic faith. In his work \"Introduction to the Devout Life,\" he taught that holiness is open not only to priests and religious, but to ordinary people of every walk of life. He is considered the patron saint of the Catholic press."
    }
   ]
  },
  {
   "m": 1,
   "d": 25,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Havari Pavlus’un İmana Dönüşü",
     "title": "",
     "bio": "Bu gün, Hristiyanlara zulmeden Ferisi Saul’un Şam yolunda dirilmiş Mesih İsa ile karşılaşmasını anar. Saul kör oldu, sonra iman edip vaftiz oldu ve Pavlus adıyla anıldı. Elçilerin İşleri’nde anlatılan bu olay, Hristiyanlık tarihinin en büyük dönüşüm hikâyelerinden biridir ve Pavlus’un “Milletlerin Havarisi” olacağı yolculuğun başlangıcıdır.",
     "nameEn": "The Conversion of Saint Paul the Apostle",
     "titleEn": "",
     "bioEn": "The day Saul, a Pharisee who persecuted Christians, met the risen Christ on the road to Damascus, was struck blind, then came to faith, was baptized, and took the name Paul. Recounted in the Acts of the Apostles, it is the best-known conversion in Christian history, and marks the beginning of the journey that made Paul the Apostle to the Gentiles."
    }
   ]
  },
  {
   "m": 1,
   "d": 26,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Timoteos ve Titus",
     "title": "Episkoposlar",
     "bio": "Havari Pavlus’un en yakın iki öğrencisi ve yol arkadaşıdır. Timotheos Efes’in, Titos da Girit’in ilk episkoposu olarak anılır. Pavlus, Yeni Ahit’teki iki mektubu Timotheos’a, bir mektubu da Titos’a yazdı. Bu mektuplar, genç kiliselerin nasıl yönetileceğini ve bir episkoposun nasıl biri olması gerektiğini anlatan temel kaynaklardır.",
     "nameEn": "Timothy and Titus",
     "titleEn": "Bishops",
     "bioEn": "The two closest disciples and traveling companions of the Apostle Paul. Timothy is remembered as the first bishop of Ephesus, and Titus of Crete. Paul wrote two of the New Testament letters to Timothy and one to Titus; these letters are among the early Church's basic sources on the governance of young churches and the qualities required of bishops."
    }
   ]
  },
  {
   "m": 1,
   "d": 27,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Angela Merici",
     "title": "Bakire",
     "bio": "XV-XVI. yüzyılda İtalya’da yaşadı ve kızların eğitimine adanmış Ursula Rahibeleri topluluğunu kurdu. O dönem için alışılmadık bir şey savundu: Kadınlar manastıra kapanmadan, kendi evlerinde yaşayarak toplum içinde eğitim ve hizmet verebilirdi. Bu fikir, sonraki yüzyıllarda kadın öğretmen cemaatlerini derinden etkiledi.",
     "nameEn": "Angela Merici",
     "titleEn": "Virgin",
     "bioEn": "In fifteenth- and sixteenth-century Italy, she founded the Company of Saint Ursula (the Ursulines), devoted to the education of girls. In a way unusual for her time, she championed women living in their own homes rather than cloistered in a convent, offering education and service within society; this vision deeply influenced the development of women's teaching orders in later centuries."
    }
   ]
  },
  {
   "m": 1,
   "d": 28,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Thomas Aquinas",
     "title": "Rahip ve Kilise Doktoru",
     "bio": "XIII. yüzyılda İtalya’da yaşamış bir Dominiken rahibidir ve Kilise tarihinin en etkili teologlarından biridir. Aristoteles felsefesini Hristiyan teolojisiyle bir araya getirdiği dev eseri “Summa Theologiae”, yüzyıllarca Katolik düşüncesinin temel kaynağı oldu. “Melekî Doktor” diye anılır; Katolik okullarının koruyucu azizidir.",
     "nameEn": "Thomas Aquinas",
     "titleEn": "Priest and Doctor of the Church",
     "bioEn": "A Dominican friar who lived in thirteenth-century Italy, one of the most influential theologians in Church history. His vast work \"Summa Theologiae,\" which unites Aristotelian philosophy with Christian theology, was the basic reference point of Catholic thought for centuries. He is known as \"the Angelic Doctor\" and is the patron saint of Catholic schools."
    }
   ]
  },
  {
   "m": 1,
   "d": 29,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Bilge Gildas",
     "title": "Rahip",
     "bio": "VI. yüzyılda Britanya’da yaşamış bir keşiş ve tarihçidir. “Britanya’nın Yıkımı ve Fethi Üzerine” adlı eseri, Roma sonrası Britanya hakkında elimizdeki en eski yazılı kaynaklardan biridir.",
     "nameEn": "Gildas the Wise",
     "titleEn": "Priest",
     "bioEn": "A monk and historian who lived in sixth-century Britain. His work \"On the Ruin and Conquest of Britain\" is one of the oldest written sources we have on post-Roman Britain."
    }
   ]
  },
  {
   "m": 1,
   "d": 30,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Giacinta Marescotti",
     "title": "Bakire",
     "bio": "XVI-XVII. yüzyılda İtalya’da yaşamış bir Fransisken rahibesidir. Manastırda uzun süre rahat ve gösterişli bir hayat sürdü. Ağır bir hastalıktan sonra gerçek bir değişim yaşadı ve ömrünün geri kalanını perhiz yaparak ve yoksullara hizmet ederek geçirdi.",
     "nameEn": "Hyacintha Mariscotti",
     "titleEn": "Virgin",
     "bioEn": "A Franciscan sister in sixteenth- and seventeenth-century Italy who at first lived a comfortable, showy life in her convent, then, after a serious illness, was truly converted and spent the rest of her life in fasting and service to the poor."
    }
   ]
  },
  {
   "m": 1,
   "d": 31,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Don Bosco",
     "title": "Rahip",
     "bio": "XIX. yüzyılda İtalya’nın Turin kentinde, yoksul ve kimsesiz gençlere kendini adamış bir rahiptir. Onlara zanaat öğretmek ve oyunla, eğitimle onları sokaktan uzak tutmak için gençlik merkezleri kurdu; bu çalışmadan Salesyen tarikatı doğdu. Cezaya değil, sevgiye ve akla dayanan eğitim anlayışıyla tanınır. Gençlerin koruyucu azizidir.",
     "nameEn": "John Bosco",
     "titleEn": "Priest",
     "bioEn": "A priest in nineteenth-century Italy devoted to the poor and homeless youth of Turin. He founded oratories to teach them trades and keep them off the streets through play and education, work that led to the birth of the Salesian order. He is known for what he called the \"preventive system,\" an educational approach based on love and reason rather than punishment; he is the patron saint of youth."
    }
   ]
  },
  {
   "m": 2,
   "d": 1,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Kildareli Brigid",
     "title": "Bakire",
     "bio": "V-VI. yüzyılda İrlanda’da yaşadı ve Aziz Patrick’ten sonra İrlanda’nın en sevilen azizidir. Kildare’de kadınların ve erkeklerin ayrı bölümlerde yaşadığı bir manastır kurdu. Cömertliği hakkında sayısız halk hikâyesi anlatılır. İrlanda’nın koruyucu azizelerinden biridir.",
     "nameEn": "Brigid of Kildare",
     "titleEn": "Virgin",
     "bioEn": "A fifth- to sixth-century Irish saint, the best-loved saint in Ireland after Patrick. She founded a mixed monastery of men and women at Kildare and is remembered through countless folk legends of her generosity. She is one of the patron saints of Ireland."
    }
   ]
  },
  {
   "m": 2,
   "d": 2,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Rab’bin Mabede Takdimi",
     "title": "",
     "bio": "Musa’nın Yasası’na göre Meryem ile Yusuf, bebek İsa’yı doğumundan kırk gün sonra Kudüs’teki Tapınak’ta Allah’a sundular. Bu bayram o günü anar. Luka İncili’ne göre yaşlı Simeon İsa’yı kucağına aldı ve O’nu “uluslara ışık” diye tanıttı. Bu gün mumlar kutsandığı için bayrama “Mum Bayramı” da denir. Hayatını Allah’a adamış kişiler için de bir dua günüdür.",
     "nameEn": "The Presentation of the Lord",
     "titleEn": "",
     "bioEn": "Remembers Mary and Joseph presenting the infant Jesus in the Temple in Jerusalem forty days after his birth, as Jewish law required. According to the Gospel of Luke, the elderly Simeon takes Jesus in his arms and calls him \"a light to the nations.\" Because of the tradition of blessing candles on this feast, it is also known as Candlemas; it is also a day of prayer for those in consecrated life."
    }
   ]
  },
  {
   "m": 2,
   "d": 3,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Sivaslı Blasius",
     "title": "Episkopos ve Şehit",
     "bio": "IV. yüzyılın başında bugünkü Ermenistan topraklarında episkopostu ve Hristiyanlara yapılan zulüm sırasında şehit edildi. Geleneğe göre boğazına kılçık kaçan bir çocuğu mucizeyle iyileştirdi. Bu yüzden bugün, boğaz hastalıklarından korunmak için iki mum çapraz tutularak insanların boyunları üzerine dua edilir.",
     "nameEn": "Blaise",
     "titleEn": "Bishop and Martyr",
     "bioEn": "A bishop in what is now Armenia in the early fourth century, martyred during the persecution of Christians. Tradition says he miraculously healed a child choking on a fishbone; this is the origin of the custom of blessing throats on this day with two crossed candles."
    },
    {
     "name": "Ansgar",
     "title": "Episkopos",
     "bio": "IX. yüzyılda yaşamış Frank kökenli bir keşiştir. Danimarka’ya ve İsveç’e giderek Hristiyanlığı Kuzey Avrupa’ya taşımaya çalıştı. Hamburg-Bremen episkoposu oldu. Büyük dirençle ve başarısızlıklarla karşılaştı, ama misyon çalışmasını bırakmadı; bu yüzden “Kuzey’in Havarisi” diye anılır.",
     "nameEn": "Ansgar",
     "titleEn": "Bishop",
     "bioEn": "A ninth-century monk of Frankish origin who went to Denmark and Sweden to bring Christianity to northern Europe. He served as bishop of Hamburg-Bremen and is called \"the Apostle of the North\" for persisting in his mission despite great resistance and setbacks."
    }
   ]
  },
  {
   "m": 2,
   "d": 4,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "João de Brito",
     "title": "Rahip ve Şehit",
     "bio": "XVII. yüzyılda yaşamış Portekizli bir Cizvit misyonerdir. Hindistan’ın Madurai bölgesinde yerel kıyafetler giydi ve yerel yaşam tarzını benimseyerek vaaz etti. Sonunda yerel bir prensin emriyle şehit edildi.",
     "nameEn": "John de Britto",
     "titleEn": "Priest and Martyr",
     "bioEn": "A seventeenth-century Portuguese Jesuit missionary who preached in the Madurai region of India, adopting local dress and customs, and was finally martyred by order of a local prince."
    }
   ]
  },
  {
   "m": 2,
   "d": 5,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Agatha",
     "title": "Bakire ve Şehit",
     "bio": "III. yüzyılda Sicilya’da yaşamış, güzelliği ve soylu ailesiyle tanınan genç bir Hristiyandır. Kendini Mesih İsa’ya adadığı için, onunla evlenmek isteyen bir Roma valisinin baskılarına direndi. Bu yüzden ağır işkenceler gördü ve şehit edildi. Sicilya’da, özellikle Katanya’da, bugün de büyük saygı görür.",
     "nameEn": "Agatha",
     "titleEn": "Virgin and Martyr",
     "bioEn": "A young Christian woman of noble birth in third-century Sicily. She had consecrated her virginity to Christ, so she refused the advances of a Roman governor, and was martyred after cruel torture. She is still held in great honor in Sicily, especially in Catania, today."
    }
   ]
  },
  {
   "m": 2,
   "d": 6,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Paulus Miki ve Yoldaşları",
     "title": "Şehitler",
     "bio": "1597’de, Hristiyanlığın yasak olduğu Japonya’da çarmıha gerilerek şehit edilen yirmi altı kişiyi anarız. Aralarında Cizvit ve Fransisken rahipler, misyonerler ve sıradan Japon Hristiyanlar vardı. Paulus Miki bir Cizvit vaiziydi; geleneğe göre çarmıhtayken bile halka vaaz etmeyi sürdürdü. Japonya’nın aziz ilan edilen ilk şehitleridir.",
     "nameEn": "Paul Miki and Companions",
     "titleEn": "Martyrs",
     "bioEn": "One of twenty-six people crucified in Japan in 1597, during a period when Christianity was banned; among them were Jesuit and Franciscan priests, missionaries, and ordinary Japanese Christians. Tradition says that Miki, a Jesuit preacher, kept preaching to the crowd even from the cross. They are Japan's first canonized martyrs."
    }
   ]
  },
  {
   "m": 2,
   "d": 7,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Colette",
     "title": "Bakire",
     "bio": "XIV-XV. yüzyılda Fransa’da yaşamış bir rahibedir. Klaris rahibelerini tarikatın ilk başlardaki sıkı yoksulluk idealine geri döndürdü. Bugün de var olan Colettine Klarisler onun adını taşır.",
     "nameEn": "Colette",
     "titleEn": "Virgin",
     "bioEn": "A reforming nun in fourteenth- and fifteenth-century France who returned the Poor Clares to their original ideal of strict poverty. The Colettine Poor Clares, which still exist today, take their name from her."
    }
   ]
  },
  {
   "m": 2,
   "d": 8,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Girolamo Emiliani",
     "title": "Kurucu",
     "bio": "XVI. yüzyılda Venedik’te önce askerdi. Esir düştükten sonra hayatı değişti ve kendini yetim ve yoksul çocuklara adadı. Onlar için yetimhaneler ve hastaneler kurdu; Somasca Rahipleri Cemaati’nin temelini attı. Terk edilmiş çocukların koruyucu azizidir.",
     "nameEn": "Jerome Emiliani",
     "titleEn": "Founder",
     "bioEn": "First a soldier in sixteenth-century Venice, he underwent a conversion after being taken captive and devoted his life to orphaned and poor children. He founded orphanages and hospitals for them and laid the foundation of the Somaschi Fathers. He is the patron saint of abandoned children."
    },
    {
     "name": "Josephine Bakhita",
     "title": "Bakire",
     "bio": "Sudan’da doğdu. Çocukken köle tüccarları tarafından kaçırıldı ve yıllarca köle olarak alınıp satıldı. İtalya’ya götürüldüğünde özgürlüğüne kavuştu, Katolik oldu ve Kanossa Rahibeleri’ne katıldı. Yaşadığı bütün acılara rağmen bağışlayıcı ve neşeli biri olarak tanındı. Köleliğe karşı mücadelenin ve insan ticareti mağdurlarının koruyucu azizesidir.",
     "nameEn": "Josephine Bakhita",
     "titleEn": "Virgin",
     "bioEn": "Born in Sudan, she was kidnapped as a child by slave traders and bought and sold for years as a slave. Taken to Italy, she gained her freedom, converted to Catholicism, and became a Canossian sister. Despite all she suffered, she is known for her forgiving, joyful character; she is the patron saint of the modern movement against slavery and of victims of human trafficking."
    }
   ]
  },
  {
   "m": 2,
   "d": 9,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Apollonia",
     "title": "Bakire ve Şehit",
     "bio": "III. yüzyılda İskenderiye’de yaşamış yaşlı bir kadındır. Zulüm sırasında dişleri kırılarak söküldü. Ateşe atılmakla tehdit edilince imanını inkâr etmek yerine kendini ateşe attı. Diş ağrısı çekenlerin ve diş hekimlerinin koruyucu azizesidir.",
     "nameEn": "Apollonia",
     "titleEn": "Virgin and Martyr",
     "bioEn": "An elderly woman of third-century Alexandria. During a persecution her teeth were smashed and pulled out, and when she was threatened with being burned alive, she walked into the fire herself. She is regarded as the patron saint of those with toothache and of dentists."
    }
   ]
  },
  {
   "m": 2,
   "d": 10,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Scholastica",
     "title": "Bakire",
     "bio": "Nursialı Aziz Benedictus’un ikiz kız kardeşidir ve kadın manastırcılığının öncülerinden sayılır. Anlatılana göre kardeşiyle yılda bir kez buluşup Allah hakkında konuşurlardı. Son buluşmalarında Scholastica dua etti, bir fırtına çıktı ve kardeşi yanından ayrılamadı. Kadın Benedikten manastırcılığının kurucu figürüdür.",
     "nameEn": "Scholastica",
     "titleEn": "Virgin",
     "bioEn": "The twin sister of Saint Benedict of Nursia, considered one of the pioneers of women's monasticism. Tradition holds that the siblings met once a year to speak of God, and at their last meeting a storm arose through Scholastica's prayer to keep her brother from leaving."
    }
   ]
  },
  {
   "m": 2,
   "d": 11,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Lourdes Meryem Anası",
     "title": "",
     "bio": "1858’de Fransa’nın Lourdes kasabasında Meryem Ana, genç Bernadette Soubirous’a on sekiz kez göründü. Kilise’nin onayladığı bu görünmeleri anarız. Görünmelerin olduğu yerdeki kaynak, o zamandan beri milyonlarca hacının geldiği bir şifa ve dua merkezi oldu. Bu gün aynı zamanda Dünya Hastalar Günü’dür.",
     "nameEn": "Our Lady of Lourdes",
     "titleEn": "",
     "bioEn": "Remembers the apparitions of Mary, approved by the Church, to a young girl, Bernadette Soubirous, eighteen times in 1858 in the French town of Lourdes. The spring at the site of the apparitions has since become a center of healing and prayer visited by millions of pilgrims. This day is also celebrated as World Day of the Sick."
    }
   ]
  },
  {
   "m": 2,
   "d": 12,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Faenzalı Umiltà",
     "title": "Rahibe",
     "bio": "XIII. yüzyılda İtalya’da yaşadı. Kocasının rızasıyla evliliğini bırakıp manastıra girdi. Daha sonra Vallombrosa keşişlerine bağlı ilk kadın manastırını kurdu.",
     "nameEn": "Humility of Faenza",
     "titleEn": "Religious",
     "bioEn": "A woman of thirteenth-century Italy who, with her husband's consent, left her marriage to enter a convent, and later founded the first convent of Vallombrosan nuns."
    }
   ]
  },
  {
   "m": 2,
   "d": 13,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Caterina de’ Ricci",
     "title": "Bakire",
     "bio": "XVI. yüzyılda İtalya’da yaşamış bir Dominiken rahibesidir. Mesih İsa’nın çektiği acılara derin bir bağlılığı vardı ve her hafta saatlerce süren vecd hâlleri yaşamasıyla tanınır.",
     "nameEn": "Catherine dei Ricci",
     "titleEn": "Virgin",
     "bioEn": "A Dominican sister in sixteenth-century Italy. She is known for her deep devotion to the Passion of Christ and for weekly ecstasies that lasted for hours."
    }
   ]
  },
  {
   "m": 2,
   "d": 14,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Kyrillos ve Methodios",
     "title": "Kardeşler, Slavların Havarileri",
     "bio": "IX. yüzyılda Selanik’te doğan iki kardeştir. Slav halklarına Hristiyanlığı kendi dillerinde anlatmak için bir alfabe geliştirdiler; bugünkü Kiril alfabesi bu alfabeden doğdu. Kutsal Kitap’ı ve Ayin’i Slavcaya çevirdiler. Çalışmaları, Slav halklarının Hristiyan olmasında ve yazılı kültürlerinin doğmasında kalıcı bir iz bıraktı. Avrupa’nın koruyucu azizleri arasındadırlar.",
     "nameEn": "Cyril and Methodius",
     "titleEn": "Brothers, Apostles to the Slavs",
     "bioEn": "Two brothers born in ninth-century Thessalonica who developed a writing system, the basis of the Cyrillic alphabet, to bring Christianity to the Slavic peoples in their own language, and translated Scripture and the liturgy into that tongue. Their work left a lasting mark on the Christianization of Slavic cultures and the birth of their written culture. They are counted among the co-patron saints of Europe."
    }
   ]
  },
  {
   "m": 2,
   "d": 15,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Claude La Colombière",
     "title": "Rahip",
     "bio": "XVII. yüzyılda Fransa’da yaşamış bir Cizvit rahibidir. Azize Marguerite-Marie Alacoque’un ruhani rehberiydi ve Mesih İsa’nın Kutsal Yüreği’ne bağlılığın Kilise’ye yayılmasında önemli bir rol oynadı.",
     "nameEn": "Claude La Colombière",
     "titleEn": "Priest",
     "bioEn": "A Jesuit priest in seventeenth-century France. He became the spiritual director of Saint Margaret Mary Alacoque and played a key role in spreading devotion to the Sacred Heart of Christ throughout the Church."
    }
   ]
  },
  {
   "m": 2,
   "d": 16,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Onesimus",
     "title": "",
     "bio": "Havari Pavlus’un Filimon’a yazdığı kısa mektubun konusu olan kaçak bir köledir. Pavlus onu Hristiyanlığa kazandırdı ve sahibine geri gönderdi; Filimon’dan ona bir kardeş gibi davranmasını istedi. Geleneğe göre Onesimus sonradan episkopos oldu.",
     "nameEn": "Onesimus",
     "titleEn": "",
     "bioEn": "The runaway slave who is the subject of the Apostle Paul's short letter to Philemon; Paul brought him to Christianity and sent him back to his master, asking that he be treated as a brother. Tradition holds that Onesimus later became a bishop."
    }
   ]
  },
  {
   "m": 2,
   "d": 17,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Servi Tarikatı’nın Yedi Kurucusu",
     "title": "",
     "bio": "XIII. yüzyılda Floransa’da yaşamış yedi tüccardır. Dünyevi hayatı bırakıp Meryem Ana’ya adanmış bir hayat sürmek için bir araya geldiler. Kurdukları topluluk, Meryem Ana’nın acılarına bağlılığıyla tanınan Servi (Meryem’in Hizmetkârları) Tarikatı oldu. Birlikte anılmaları, aynı çağrıya birlikte verdikleri cevabı simgeler.",
     "nameEn": "The Seven Founders of the Servite Order",
     "titleEn": "",
     "bioEn": "Seven merchants in thirteenth-century Florence who left worldly life to live a life devoted to Mary. The community they founded became the Servite Order (Servants of Mary), known for its devotion to the Sorrows of Mary. They are remembered together because they answered the call together."
    }
   ]
  },
  {
   "m": 2,
   "d": 18,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Kudüslü Simeon",
     "title": "Episkopos ve Şehit",
     "bio": "Kudüs’ün ilk episkoposu Yakup öldükten sonra Kudüs Kilisesi’nin ikinci episkoposu oldu. Mesih İsa’nın akrabası olduğu kabul edilir. İleri yaşta, İmparator Traianus döneminde çarmıha gerilerek şehit edildi.",
     "nameEn": "Simeon of Jerusalem",
     "titleEn": "Bishop and Martyr",
     "bioEn": "After the death of James (the first bishop of Jerusalem), he became the second bishop of the Jerusalem Church, and tradition counts him a relative of Jesus. He was martyred by crucifixion at an advanced age under Emperor Trajan."
    }
   ]
  },
  {
   "m": 2,
   "d": 19,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Piacenzalı Corrado",
     "title": "Münzevi",
     "bio": "XIV. yüzyılda İtalya’da soylu bir avcıydı. Kazayla bir yangın çıkardı ve bu yangın yüzünden suçsuz bir adam suçlanıp idama mahkûm edildi. Bu olay onu derinden değiştirdi: Suçunu itiraf etti ve ömrünün geri kalanını ıssız bir yerde, inzivada geçirdi.",
     "nameEn": "Conrad of Piacenza",
     "titleEn": "Hermit",
     "bioEn": "A noble huntsman in fourteenth-century Italy who underwent a profound conversion after a fire he accidentally started led to another man being wrongly accused and executed; he spent the rest of his life in desert solitude."
    }
   ]
  },
  {
   "m": 2,
   "d": 20,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Haselburyli Wulfric",
     "title": "Münzevi",
     "bio": "XII. yüzyılda İngiltere’de bir köy papazıydı. Bir hac yolculuğundan sonra kilisesinin yanındaki küçük bir hücreye kapandı ve ömrünün geri kalanını orada geçirdi. Bilgeliği o kadar ünlendi ki krallar bile ona danışmaya geldi.",
     "nameEn": "Wulfric of Haselbury",
     "titleEn": "Hermit",
     "bioEn": "A hermit in twelfth-century England, first a village priest, who after a pilgrimage shut himself in a small cell beside his church and spent the rest of his life there, gaining such a reputation for wisdom that even kings came to consult him."
    }
   ]
  },
  {
   "m": 2,
   "d": 21,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Pietro Damiani",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "XI. yüzyılda İtalya’da önce münzevi bir keşiş olarak yaşadı, sonra kardinal ve episkopos oldu ve Kilise reformunda önemli bir rol oynadı. Din adamları arasındaki gevşekliği ve yolsuzluğu sert bir dille eleştirdi. Döneminde Kilise disiplinini yeniden sıkılaştırmaya çalışanların önde gelenlerindendir.",
     "nameEn": "Peter Damian",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "First a hermit monk in eleventh-century Italy, he later played an important role in Church reform as a cardinal-bishop. Known for his sharp criticism of laxity and abuse among the clergy, he was a leading figure in the effort to restore Church discipline in his time."
    }
   ]
  },
  {
   "m": 2,
   "d": 22,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Havari Petrus’un Kürsüsü",
     "title": "",
     "bio": "Bu bayram belirli bir kişiyi değil, Havari Petrus’a ve onun ardıllarına, yani papalara emanet edilen öğretme ve birliği koruma görevini kutlar. “Kürsü” burada gerçek bir sandalye değildir; Petrus’un Kilise’nin birliği ve inancı için taşıdığı yetkiyi simgeler. Bayram, Mesih İsa’nın Matta İncili’nde Petrus’a verdiği görevi hatırlatır.",
     "nameEn": "The Chair of Saint Peter the Apostle",
     "titleEn": "",
     "bioEn": "This feast celebrates not a particular person, but the ministry of teaching and unity entrusted to the Apostle Peter and his successors, the popes. The \"chair\" here symbolizes not a literal seat but the authority Peter carries as the lasting foundation of the Church's unity and doctrine, recalling the commission Christ gave him in the Gospel of Matthew."
    }
   ]
  },
  {
   "m": 2,
   "d": 23,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "İzmirli Polikarpos",
     "title": "Episkopos ve Şehit",
     "bio": "II. yüzyılda İzmir (Smyrna) episkoposuydu ve Havari Yuhanna’nın öğrencisi olduğu kabul edilir. İlk Kilise’nin en önemli isimlerinden biridir. Doksan yaşını geçmişken imanını inkâr etmesi için baskı yapıldı. “Seksen altı yıldır O’na hizmet ediyorum, bana hiç kötülük etmedi” diyerek reddetti ve diri diri yakılarak şehit edildi. Şehitliği, Kilise tarihindeki en eski ve en ayrıntılı şehitlik anlatılarından birinde yazılıdır.",
     "nameEn": "Polycarp",
     "titleEn": "Bishop and Martyr",
     "bioEn": "Bishop of Smyrna (modern İzmir) in the second century, one of the great figures of the early Church, held to be a disciple of the Apostle John. Over ninety years old and pressured to renounce his faith, he refused, saying, \"Eighty-six years I have served him, and he has done me no wrong,\" and was martyred by being burned alive. The account of his martyrdom is one of the oldest and most detailed in Church history."
    }
   ]
  },
  {
   "m": 2,
   "d": 24,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Rouenli Praetextatus",
     "title": "Episkopos ve Şehit",
     "bio": "VI. yüzyılda Rouen episkoposuydu. Frank kraliçesi Fredegund’un emriyle, kendi kilisesinde Ayin sırasında öldürüldü.",
     "nameEn": "Praetextatus of Rouen",
     "titleEn": "Bishop and Martyr",
     "bioEn": "Bishop of Rouen in the sixth century, killed during Mass in his own church by order of a Frankish queen, Fredegund."
    }
   ]
  },
  {
   "m": 2,
   "d": 25,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Walburga",
     "title": "Bakire",
     "bio": "VIII. yüzyılda İngiltere’de doğmuş bir Benedikten rahibesidir. Kardeşleri Willibald ve Winibald ile birlikte misyoner olarak Almanya’ya gitti ve Heidenheim manastırının başrahibesi oldu. Mezarından sızan sıvının şifa verdiğine inanılır.",
     "nameEn": "Walburga",
     "titleEn": "Virgin",
     "bioEn": "An eighth-century Benedictine nun, born in England, who went to Germany as a missionary together with her brothers Willibald and Winibald. She became abbess of the monastery at Heidenheim; a liquid said to flow from her tomb is believed to bring healing."
    }
   ]
  },
  {
   "m": 2,
   "d": 26,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Magydoslu Nestor",
     "title": "Episkopos ve Şehit",
     "bio": "III. yüzyılda bugünkü Türkiye’nin güneyinde, Pamfilya bölgesindeki Magydos’ta episkopostu. İmparator Decius’un zulmü sırasında çarmıha gerilerek şehit edildi.",
     "nameEn": "Nestor of Magydos",
     "titleEn": "Bishop and Martyr",
     "bioEn": "A bishop in the third century in what is now southern Turkey (Pamphylia, Magydos), martyred by crucifixion during Emperor Decius's persecution."
    }
   ]
  },
  {
   "m": 2,
   "d": 27,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Narekli Gregorios",
     "title": "Başrahip ve Kilise Doktoru",
     "bio": "X. yüzyılda bugünkü Ermenistan topraklarında yaşamış bir Ermeni keşiş, şair ve mistiktir. Dua ve tövbe üzerine yazdığı uzun şiir kitabı “Ağıtlar Kitabı” ile tanınır. 2015’te Papa Franciscus onu Kilise Doktoru ilan etti; Doğu ve Batı Hristiyanlığının ortak mirasını temsil eder.",
     "nameEn": "Gregory of Narek",
     "titleEn": "Abbot and Doctor of the Church",
     "bioEn": "An Armenian monk, poet, and mystical theologian who lived in the tenth century in what is now Armenia. He is known for his \"Book of Lamentations,\" a long poetic work on prayer and repentance. He was declared a Doctor of the Church by Pope Francis in 2015, representing a shared heritage between Eastern and Western Christianity."
    }
   ]
  },
  {
   "m": 2,
   "d": 28,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Condatlı Romanus",
     "title": "Başrahip",
     "bio": "V. yüzyılda Galya’da, bugünkü Fransa-İsviçre sınırındaki Jura Dağları’nda inzivaya çekildi. Zamanla çevresinde bir manastır topluluğu oluştu ve onun başrahibi oldu. Kız kardeşi de yakınlarda bir kadın manastırı kurdu.",
     "nameEn": "Romanus of Condat",
     "titleEn": "Abbot",
     "bioEn": "A monk in fifth-century Gaul (the Jura Mountains, on today's French-Swiss border) who withdrew into the wilderness and became abbot of a monastic community that grew up around him over time; his sister founded a nearby women's monastery."
    }
   ]
  },
  {
   "m": 2,
   "d": 29,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Worcesterli Oswald",
     "title": "Episkopos",
     "bio": "X. yüzyılda İngiltere’de York başepiskoposu oldu. Benedikten manastırlarını yenileyen üç öncüden (Dunstan, Aethelwold ve Oswald) biridir. Anma günü dört yılda bir gelen 29 Şubat olduğu için, genellikle 28 Şubat’ta anılır.",
     "nameEn": "Oswald of Worcester",
     "titleEn": "Bishop",
     "bioEn": "Archbishop of York in tenth-century England, one of the three pioneers of the Benedictine monastic reform (Dunstan, Aethelwold, and Oswald). Because the day of his death, February 29, comes only once every four years, his memorial is usually observed on February 28."
    }
   ]
  },
  {
   "m": 3,
   "d": 1,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Gallerli David",
     "title": "Episkopos",
     "bio": "VI. yüzyılda Galler’de yaşamış ve bölgenin en önemli manastırlarından birini kurmuş bir episkopostur. Sade bir hayat sürdü ve keşişlerine yalnızca ekmek, sebze ve suyla yetinmelerini öğütledi. Galler’in koruyucu azizidir.",
     "nameEn": "David of Wales",
     "titleEn": "Bishop",
     "bioEn": "A bishop who lived in sixth-century Wales and founded one of the region's most important monasteries. He lived simply, teaching his monks to be content with only bread, vegetables, and water. He is the patron saint of Wales."
    }
   ]
  },
  {
   "m": 3,
   "d": 2,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Mercialı Chad",
     "title": "Episkopos",
     "bio": "VII. yüzyılda İngiltere’de Mercia ve Lindsey episkoposu olan bir Anglosaksondur. Alçakgönüllülüğüyle ve her yere yaya gitmekte ısrar etmesiyle tanınır; anlatılana göre kendisine at verildiğinde bile yürümeyi tercih etti.",
     "nameEn": "Chad of Mercia",
     "titleEn": "Bishop",
     "bioEn": "An Anglo-Saxon who became bishop of Mercia and Lindsey in seventh-century England. He is known for his humility and his insistence on traveling on foot; he is said to have preferred walking even to the horse given him for his episcopal duties."
    }
   ]
  },
  {
   "m": 3,
   "d": 3,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Katharine Drexel",
     "title": "Bakire",
     "bio": "Philadelphia’da zengin bir bankacı ailesinin kızıdır. Büyük servetini kendisi için kullanmadı; onu Yerli Amerikalı ve Afrikalı Amerikalı toplulukların eğitimine adadı. Kutsal Efkaristiya Rahibeleri cemaatini kurdu ve ülke genelinde onlarca okul açtı. Amerika’da doğmuş ikinci azizedir.",
     "nameEn": "Katharine Drexel",
     "titleEn": "Virgin",
     "bioEn": "The daughter of a wealthy Philadelphia banking family, she rejected her great fortune to devote herself to the education of Native American and African American communities. She founded the Sisters of the Blessed Sacrament and opened dozens of schools across the country. She is the second American-born saint."
    }
   ]
  },
  {
   "m": 3,
   "d": 4,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Kazimierz",
     "title": "Prens",
     "bio": "XV. yüzyılda Polonya-Litvanya kraliyet ailesinden bir prensti. Kral olabilecekken derin dindarlığı ve yoksullara düşkünlüğüyle tanındı. Genç yaşta veremden öldü. Saraydaki lükse rağmen sade ve dua dolu bir hayat sürdüğü için örnek gösterilir. Polonya’nın ve Litvanya’nın koruyucu azizidir.",
     "nameEn": "Casimir",
     "titleEn": "Prince",
     "bioEn": "A prince of the Polish-Lithuanian royal family in the fifteenth century. Though he could have become king, he was known for his deep piety and devotion to the poor, and died of tuberculosis at a young age. Despite the luxury of the court, he is held up as an example for his simple, prayerful life; he is the patron saint of Poland and Lithuania."
    }
   ]
  },
  {
   "m": 3,
   "d": 5,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Giovanni Giuseppe della Croce",
     "title": "Rahip",
     "bio": "XVII-XVIII. yüzyılda İtalya’da yaşamış bir Fransisken rahibidir. Çok sıkı bir perhiz hayatı ve derin bir dua hayatı sürdü. Napoli bölgesinde büyük saygı gördü.",
     "nameEn": "John Joseph of the Cross",
     "titleEn": "Priest",
     "bioEn": "An Alcantarine Franciscan friar in seventeenth- and eighteenth-century Italy. He is known for his extreme asceticism and intense life of prayer, and was greatly venerated in the Naples region."
    }
   ]
  },
  {
   "m": 3,
   "d": 6,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Metzli Chrodegang",
     "title": "Episkopos",
     "bio": "VIII. yüzyılda Metz episkoposu olan bir Frank din adamıdır. Din adamlarının bir arada yaşaması için yazdığı kurallar, Batı’da ortak hayat süren din adamları geleneğinin temellerinden biri oldu.",
     "nameEn": "Chrodegang of Metz",
     "titleEn": "Bishop",
     "bioEn": "A Frankish churchman who became bishop of Metz in the eighth century. The rule he wrote for clergy to live in community became one of the foundations of the Western tradition of canonical life."
    }
   ]
  },
  {
   "m": 3,
   "d": 7,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Perpetua ve Felicitas",
     "title": "Şehitler",
     "bio": "203 yılında Kartaca’da, bugünkü Tunus’ta şehit edilen iki genç kadındır. Perpetua soylu bir aileden geliyordu ve bebeği olan genç bir anneydi; Felicitas ise onun kölesiydi ve hapiste doğum yaptı. İkisi de arenada vahşi hayvanların önüne atılarak öldürüldü. Perpetua’nın hapiste tuttuğu günlük, bir kadının yazdığı en eski Hristiyan metinlerinden biridir.",
     "nameEn": "Perpetua and Felicity",
     "titleEn": "Martyrs",
     "bioEn": "Two young women martyred in 203 in Carthage (in modern Tunisia). Perpetua was of noble family, a young mother with an infant; Felicity was her slave, and had given birth in prison. Both were thrown to wild beasts in the arena. The diary Perpetua kept in prison is considered one of the oldest surviving texts written by a Christian woman."
    }
   ]
  },
  {
   "m": 3,
   "d": 8,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Juan de Dios",
     "title": "Kurucu",
     "bio": "XVI. yüzyılda Portekiz’de doğdu ve İspanya’da yaşadı. Askerlik ve başıboş geçen yıllardan sonra hayatı tamamen değişti ve kendini hastalara ve yoksullara adadı. Granada’da kurduğu hastane, bugün dünyanın her yerinde hastanelerde hizmet veren Hastabakıcı Kardeşler Tarikatı’nın başlangıcı oldu. Hastanelerin ve hastaların koruyucu azizlerindendir.",
     "nameEn": "John of God",
     "titleEn": "Founder",
     "bioEn": "After years of soldiering and vagrancy in sixteenth-century Portugal and Spain, he underwent a profound conversion and devoted his life to the sick and the poor. The hospital he founded in Granada became the beginning of the Hospitaller Order (Fatebenefratelli), which still serves in hospitals worldwide today. He is among the patron saints of hospitals and the sick."
    }
   ]
  },
  {
   "m": 3,
   "d": 9,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Francesca Romana",
     "title": "Rahibe",
     "bio": "XIV-XV. yüzyılda Roma’da soylu bir aileye gelin gitti. Evli bir kadın ve anne olarak kendini yoksullara hizmete adadı. Kocası öldükten sonra, kadınların evdeki görevlerini bırakmadan dindar bir hayat sürebilmesi için bir topluluk kurdu. Roma’nın koruyucu azizesidir.",
     "nameEn": "Frances of Rome",
     "titleEn": "Religious",
     "bioEn": "A woman in fourteenth- and fifteenth-century Rome who married into a noble family, and, while remaining a wife and mother, devoted herself to serving the poor. After her husband's death, she founded a community so that married women could live a devout life without abandoning their earthly duties. She is the patron saint of the city of Rome."
    }
   ]
  },
  {
   "m": 3,
   "d": 10,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Kudüslü Makarios",
     "title": "Episkopos",
     "bio": "IV. yüzyılda Kudüs episkoposuydu ve I. İznik Konsili’ne katıldı. Anlatılana göre İmparator Konstantin’in annesi Helena’ya, İsa’nın mezarının yerini bulma çalışmalarında yol gösterdi.",
     "nameEn": "Macarius of Jerusalem",
     "titleEn": "Bishop",
     "bioEn": "Bishop of Jerusalem in the fourth century and took part in the First Council of Nicaea. He is said to have guided Helena, mother of Emperor Constantine, in her search for the site of the Holy Sepulchre."
    }
   ]
  },
  {
   "m": 3,
   "d": 11,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Kurtubalı Eulogius",
     "title": "Rahip ve Şehit",
     "bio": "IX. yüzyılda İslam yönetimindeki İspanya’da, Kurtuba’da (Kordoba) yaşamış bir rahiptir. Zulüm döneminde şehit edilen Hristiyanların hikâyelerini yazıya geçirdi. Sonunda kendisi de Hristiyan olmuş bir kızı sakladığı için idam edildi.",
     "nameEn": "Eulogius of Córdoba",
     "titleEn": "Priest and Martyr",
     "bioEn": "A priest who lived in ninth-century Muslim-ruled Spain (Córdoba). He recorded the life stories of Christians martyred during a period of persecution, and was eventually executed himself for hiding a Christian girl."
    }
   ]
  },
  {
   "m": 3,
   "d": 12,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Büyük Gregorius’un Ölüm Yıl Dönümü",
     "title": "",
     "bio": "Bu gün, 3 Eylül’de Kilise Doktoru olarak anılan Papa Büyük Gregorius’un 604’teki ölüm günüdür. Eski Roma takviminde asıl anma günü buydu; sonradan papa olarak kutsandığı gün olan 3 Eylül’e taşındı.",
     "nameEn": "The Anniversary of the Death of Gregory the Great",
     "titleEn": "",
     "bioEn": "Today, March 12, is the anniversary of the death, in 604, of Pope Gregory the Great, who is commemorated as a Doctor of the Church on September 3. This was his original commemoration in the old Roman calendar; it was later moved to the date of his episcopal ordination, September 3."
    }
   ]
  },
  {
   "m": 3,
   "d": 13,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Napolili Patricia",
     "title": "Bakire",
     "bio": "VIII. yüzyılda yaşadı ve Bizans imparatorluk ailesinden geldiğine inanılır. Servetini bırakıp Napoli’ye gitti ve orada dindar bir hayat sürdü. Napoli’nin koruyucu azizelerinden biridir; kanının da Aziz Ianuarius’unki gibi sıvılaştığına inanılır.",
     "nameEn": "Patricia of Naples",
     "titleEn": "Virgin",
     "bioEn": "An eighth-century saint believed to have come from the Byzantine imperial family, who gave up her wealth and went to Naples to live a devout life there. She is one of the patron saints of Naples; as with Saint Januarius, her blood is believed to liquefy."
    }
   ]
  },
  {
   "m": 3,
   "d": 14,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Matilda",
     "title": "Kraliçe",
     "bio": "X. yüzyılda Alman kralı I. Henricus’un eşiydi. Kocası öldükten sonra servetini manastırlar ve yoksullar için harcadı. Ailesi içindeki anlaşmazlıklara rağmen barışı korumaya çalıştı.",
     "nameEn": "Matilda",
     "titleEn": "Queen",
     "bioEn": "A tenth-century queen, wife of Henry I, king of the Germans. After her husband's death she used her wealth for monasteries and the poor, and worked to secure peace despite family disputes."
    }
   ]
  },
  {
   "m": 3,
   "d": 15,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Louise de Marillac",
     "title": "Bakire",
     "bio": "XVI-XVII. yüzyılda Fransa’da yaşadı ve Aziz Vincent de Paul ile birlikte Merhamet Kızları cemaatini kurdu. Manastıra kapanmadan, doğrudan sokaklarda ve evlerde yoksullara hizmet eden yeni bir kadın cemaati modeli geliştirdi.",
     "nameEn": "Louise de Marillac",
     "titleEn": "Virgin",
     "bioEn": "A Frenchwoman of the sixteenth and seventeenth centuries who, together with Saint Vincent de Paul, founded the Daughters of Charity. She developed a model of a women's community that served the poor directly in the streets and in homes, without being cloistered in a convent."
    }
   ]
  },
  {
   "m": 3,
   "d": 16,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Kölnlü Heribert",
     "title": "Episkopos",
     "bio": "X-XI. yüzyılda Köln başepiskoposuydu ve İmparator III. Otto’nun baş danışmanlığını yaptı; hem devlet adamı hem din adamıydı. Bir kuraklık sırasında halk için yağmur duası ettiği ve yağmurun yağdığı anlatılır.",
     "nameEn": "Heribert of Cologne",
     "titleEn": "Bishop",
     "bioEn": "A churchman and statesman who became archbishop of Cologne and chief advisor to Emperor Otto III in the tenth and eleventh centuries. Legend remembers him praying for rain for the people during a drought."
    }
   ]
  },
  {
   "m": 3,
   "d": 17,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Patrick",
     "title": "Episkopos",
     "bio": "V. yüzyılda Britanya’da doğdu. Gençken korsanlar tarafından kaçırıldı ve İrlanda’ya köle olarak götürüldü. Kaçtı, yıllar sonra rahip oldu ve kendi isteğiyle İrlanda’ya geri döndü. Adanın büyük bölümünü Hristiyanlığa kazandırdı. Geleneğe göre Kutsal Üçlü’yü üç yapraklı yonca ile anlattı. İrlanda’nın koruyucu azizidir.",
     "nameEn": "Patrick",
     "titleEn": "Bishop",
     "bioEn": "Born in Britain in the fifth century, he was kidnapped by pirates at a young age and taken to Ireland as a slave. Years after escaping, he became a priest and voluntarily returned to Ireland, largely Christianizing the island. Tradition holds that he used the three-leafed shamrock to explain the Holy Trinity. He is the patron saint of Ireland."
    }
   ]
  },
  {
   "m": 3,
   "d": 18,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Kudüslü Kyrillos",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "IV. yüzyılda Kudüs episkoposuydu. Arianizm tartışmaları yüzünden üç kez sürgüne gönderildi. Vaftiz olacaklara vaftizden önce ve sonra verdiği din dersleri günümüze ulaştı; bunlar ilk yüzyıllarda insanların Hristiyanlığa nasıl kabul edildiğini gösteren en değerli kaynaklardandır.",
     "nameEn": "Cyril of Jerusalem",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "Bishop of Jerusalem in the fourth century, exiled three times over disputes concerning Arianism. His catechetical lectures given to new Christians before and after baptism survive today as one of the most valuable sources on the early period of Christian initiation."
    }
   ]
  },
  {
   "m": 3,
   "d": 19,
   "rank": "Büyük Bayram",
   "saints": [
    {
     "name": "Yusuf",
     "title": "Meryem Ana’nın Eşi",
     "bio": "İncillere göre Meryem Ana’nın nişanlısı ve Mesih İsa’nın babalığını üstlenen kişidir; Davut soyundan bir marangozdur. Rüyasında gelen meleğin sözüne güvenip Meryem’i eşi olarak evine aldı. İsa’yı Mısır’a kaçırarak korudu ve Kutsal Aile’nin başı olarak görevini sessiz ama sarsılmaz bir sadakatle yerine getirdi. Bütün Kilise’nin koruyucu azizi ilan edilmiştir.",
     "nameEn": "Joseph",
     "titleEn": "Husband of Mary",
     "bioEn": "According to the Gospels, the betrothed of Mary and the foster father of Christ; a carpenter descended from the line of David. Trusting the word of the angel who came to him in a dream, he took Mary as his wife, and fulfilled his role as head of the Holy Family with a silent but unshakable faithfulness, fleeing with Jesus to Egypt and protecting him. He has been declared the patron saint of the Universal Church."
    }
   ]
  },
  {
   "m": 3,
   "d": 20,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Lindisfarneli Cuthbert",
     "title": "Episkopos",
     "bio": "VII. yüzyılda İngiltere’de çoban bir çocukken keşiş oldu, sonra Lindisfarne episkoposu oldu. Issız bir adada münzevi olarak yaşamayı tercih etti. Doğaya ve deniz kuşlarına olan sevgisiyle tanınır. Kuzey İngiltere’nin en sevilen azizlerinden biridir.",
     "nameEn": "Cuthbert of Lindisfarne",
     "titleEn": "Bishop",
     "bioEn": "A shepherd boy in seventh-century England who became a monk, then bishop of Lindisfarne. He preferred to live as a hermit on a remote island, and is known for his love of nature and seabirds. He is one of the most beloved saints of northern England."
    }
   ]
  },
  {
   "m": 3,
   "d": 21,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Flüeli Nikolaus",
     "title": "Münzevi",
     "bio": "XV. yüzyılda İsviçre’de on çocuklu bir çiftçiydi. Ailesinin rızasıyla münzevi olarak inzivaya çekildi. İsviçre kantonları arasındaki bir anlaşmazlıkta arabuluculuk yaparak ülkeyi iç savaştan korudu. İsviçre’nin koruyucu azizidir.",
     "nameEn": "Nicholas of Flüe",
     "titleEn": "Hermit",
     "bioEn": "A Swiss farmer and father of ten in the fifteenth century who, with his family's consent, went to live alone as a hermit. He is known for his peaceful mediation that prevented the Swiss Confederation from being drawn into civil war; he is the patron saint of Switzerland."
    }
   ]
  },
  {
   "m": 3,
   "d": 22,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Nicholas Owen",
     "title": "Rahip Kardeş ve Şehit",
     "bio": "XVI-XVII. yüzyılda İngiltere’de yaşamış bir Cizvit kardeştir. Katoliklere zulmedilen o dönemde, rahipleri saklamak için evlerde gizli bölmeler yaptı. Sonunda yakalandı ve işkence altında öldü; ama kimseyi ele vermedi.",
     "nameEn": "Nicholas Owen",
     "titleEn": "Religious and Martyr",
     "bioEn": "A Jesuit brother in sixteenth- and seventeenth-century England who built hidden compartments in houses to shelter priests during a period of persecution. He was eventually captured and died under torture, without betraying anyone."
    }
   ]
  },
  {
   "m": 3,
   "d": 23,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Toribio de Mogrovejo",
     "title": "Episkopos",
     "bio": "XVI. yüzyılda İspanyol bir hukukçuydu. Daha rahip bile değilken Peru’ya gönderildi ve Lima başepiskoposu oldu. Yirmi beş yıldan uzun bir süre, sarp And Dağları’nı aşarak piskoposluk bölgesini defalarca dolaştı. Yerli halkların dillerini öğrendi ve onların haklarını savundu. Latin Amerika episkoposlarının öncüsü sayılır.",
     "nameEn": "Turibius of Mogrovejo",
     "titleEn": "Bishop",
     "bioEn": "A lawyer sent from Spain to Peru in the sixteenth century, appointed archbishop of Lima while not yet even a priest. For more than twenty-five years he repeatedly crossed the rugged Andes to visit every corner of his diocese, learning the languages of the Indigenous peoples and defending them. He is regarded as a pioneer among the bishops of Latin America."
    }
   ]
  },
  {
   "m": 3,
   "d": 24,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "İsveçli Katarina",
     "title": "Bakire",
     "bio": "XIV. yüzyılda yaşamış, İsveçli Azize Birgitta’nın kızıdır. Annesinin Roma’ya ve hac yerlerine yaptığı yolculuklarda ona eşlik etti. Annesi öldükten sonra kurduğu tarikatın başına geçti ve tarikatın kurallarının Kilise tarafından onaylanması için çalıştı.",
     "nameEn": "Catherine of Sweden",
     "titleEn": "Virgin",
     "bioEn": "The daughter of Saint Bridget of Sweden in the fourteenth century. She accompanied her mother on her pilgrimages to Rome, and, after her mother's death, worked as abbess of the Bridgettine order to win Church approval for its rule."
    }
   ]
  },
  {
   "m": 3,
   "d": 25,
   "rank": "Büyük Bayram",
   "saints": [
    {
     "name": "Rab’bin Müjdelenmesi",
     "title": "",
     "bio": "Bu bayram, Başmelek Cebrail’in Meryem Ana’ya gelip onun Mesih İsa’nın annesi olacağını bildirmesini anar. Meryem bu çağrıyı “Bana dediğin gibi olsun” diyerek kabul etti. Bu, Tanrı’nın Sözü’nün insan bedeni aldığı andır; buna Enkarnasyon denir. Bayramın Noel’den tam dokuz ay önce olması tesadüf değildir.",
     "nameEn": "The Annunciation of the Lord",
     "titleEn": "",
     "bioEn": "Remembers the Archangel Gabriel's coming to Mary to announce that she would become the mother of Christ, and Mary's acceptance of this call with the words, \"be it done to me according to thy word.\" At that moment the Word (Logos) took on human flesh: the Incarnation. It is no coincidence that it falls nine months before Christmas."
    }
   ]
  },
  {
   "m": 3,
   "d": 26,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Ludger",
     "title": "Episkopos",
     "bio": "VIII-IX. yüzyılda Frizya ve Saksonya bölgelerinde misyonerlik yaptı ve Münster’in ilk episkoposu oldu.",
     "nameEn": "Ludger",
     "titleEn": "Bishop",
     "bioEn": "A missionary in the Frisian and Saxon regions in the eighth and ninth centuries, and became the first bishop of Münster."
    }
   ]
  },
  {
   "m": 3,
   "d": 27,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Mısırlı Yuhanna",
     "title": "Münzevi",
     "bio": "IV. yüzyılda Mısır’da elli yıldan fazla bir mağarada inzivada yaşamış bir çöl babasıdır. Geleceği önceden bilmesi ve hastaları iyileştirmesiyle ünlendi; İmparator Theodosius bile ona danışmaya adam gönderdi.",
     "nameEn": "John of Egypt",
     "titleEn": "Hermit",
     "bioEn": "A desert father in fourth-century Egypt who lived in solitude in a cave for more than fifty years, known for his gift of prophecy and healing; even Emperor Theodosius came to seek his counsel."
    }
   ]
  },
  {
   "m": 3,
   "d": 28,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "III. Sixtus",
     "title": "Papa",
     "bio": "V. yüzyılda papalık yaptı. Efes Konsili Meryem’i Tanrı Anası ilan ettikten hemen sonra, Roma’daki Santa Maria Maggiore Bazilikası’nın yeniden yapımını tamamlattı.",
     "nameEn": "Sixtus III",
     "titleEn": "Pope",
     "bioEn": "Pope in the fifth century, who had the rebuilding of the Basilica of Santa Maria Maggiore in Rome completed immediately after the Council of Ephesus declared Mary the Mother of God."
    }
   ]
  },
  {
   "m": 3,
   "d": 29,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Ionas ve Barachisius",
     "title": "Şehitler",
     "bio": "IV. yüzyılda Pers İmparatorluğu’nda yaşamış iki keşiş kardeştir. Hapisteki Hristiyanları teselli ettikleri için yakalandılar ve işkenceyle öldürüldüler.",
     "nameEn": "Jonas and Barachisius",
     "titleEn": "Martyrs",
     "bioEn": "Two monk brothers in the fourth-century Persian Empire, captured and tortured to death for comforting Christian prisoners."
    }
   ]
  },
  {
   "m": 3,
   "d": 30,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Yuhanna Klimakos",
     "title": "Rahip",
     "bio": "VI-VII. yüzyılda Sina Dağı’nda yaşamış bir keşiştir. Erdemleri otuz basamaklı bir merdiven gibi anlattığı “Cennete Çıkan Merdiven” adlı kitabı, Doğu manastırcılığının en etkili el kitaplarından biridir.",
     "nameEn": "John Climacus",
     "titleEn": "Priest",
     "bioEn": "A monk who lived on Mount Sinai in the sixth and seventh centuries. His work \"The Ladder of Divine Ascent,\" describing virtue in thirty steps, is one of the most influential manuals of Eastern monasticism."
    }
   ]
  },
  {
   "m": 3,
   "d": 31,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Benjamin",
     "title": "Diyakoz ve Şehit",
     "bio": "V. yüzyılda Pers İmparatorluğu’nda yaşamış bir diyakozdur. Bir yıl hapiste kaldıktan sonra vaaz etmeyi bırakmayı reddetti ve işkenceyle şehit edildi.",
     "nameEn": "Benjamin",
     "titleEn": "Deacon and Martyr",
     "bioEn": "A deacon in the fifth-century Persian Empire, tortured to death after a year in prison for refusing to stop preaching his faith."
    }
   ]
  },
  {
   "m": 4,
   "d": 1,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Grenoble Piskoposu Hugues",
     "title": "Episkopos",
     "bio": "XI-XII. yüzyılda Fransa’da Grenoble episkoposuydu ve elli yıldan fazla bu görevde kaldı. Aziz Bruno’ya Chartreuse bölgesinde manastır kurması için arazi verdi ve böylece Kartüzyen tarikatının doğmasına katkıda bulundu.",
     "nameEn": "Hugh of Grenoble",
     "titleEn": "Bishop",
     "bioEn": "Bishop of Grenoble in eleventh- and twelfth-century France, who held the office for more than fifty years. He provided the land for Saint Bruno to found a monastery in the Chartreuse region, contributing to the birth of the Carthusian order."
    }
   ]
  },
  {
   "m": 4,
   "d": 2,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Paolalı Francesco",
     "title": "Münzevi",
     "bio": "XV. yüzyılda İtalya’nın Kalabriya bölgesinde yaşadı. Genç yaşta bir mağaraya çekilip münzevi olarak yaşadı. Çevresinde toplanan öğrencilerle Minim Kardeşler Tarikatı’nı kurdu. Çok sıkı perhizi ve yoksul hayatıyla tanınır; bilgeliği ve mucizeleriyle o kadar ünlendi ki krallar bile ona danıştı.",
     "nameEn": "Francis of Paola",
     "titleEn": "Hermit",
     "bioEn": "A fifteenth-century hermit from Calabria, in southern Italy, who went to live in a cave as a young man and founded the Order of Minims with the disciples who gathered around him. Known for his extreme fasting and harsh poverty, he became so renowned for wisdom and miracles that even kings sought his counsel."
    }
   ]
  },
  {
   "m": 4,
   "d": 3,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Chichester Piskoposu Richard",
     "title": "Episkopos",
     "bio": "XIII. yüzyılda İngiltere’de Chichester episkoposuydu. Ona ait olduğu söylenen ünlü dua (“Seni daha açık görmek, daha çok sevmek ve daha yakından izlemek için”) bugün de çok kullanılır.",
     "nameEn": "Richard of Chichester",
     "titleEn": "Bishop",
     "bioEn": "Bishop of Chichester in thirteenth-century England. The famous prayer attributed to him (\"may I know thee more clearly, love thee more dearly, and follow thee more nearly\") is still widely used today."
    }
   ]
  },
  {
   "m": 4,
   "d": 4,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Sevillalı Isidorus",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "VI-VII. yüzyılda İspanya’da Sevilla episkoposuydu. “Etymologiae” adlı dev ansiklopedisiyle, Roma İmparatorluğu çöktükten sonra antik dünyanın bilgisini toplayıp Orta Çağ’a aktardı. Bu geniş kapsamlı çalışması yüzünden internetin ve bilgisayar kullanıcılarının koruyucu azizi olarak da anılır.",
     "nameEn": "Isidore of Seville",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "Bishop of Seville in Spain in the sixth and seventh centuries. Through his vast encyclopedic work \"Etymologiae,\" he gathered the knowledge of the ancient world after the fall of the Roman Empire and carried it into the Middle Ages. Because of it he is often called the patron saint of the internet and of computer users."
    }
   ]
  },
  {
   "m": 4,
   "d": 5,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Vicente Ferrer",
     "title": "Rahip",
     "bio": "XIV-XV. yüzyılda İspanya’da yaşamış bir Dominiken vaizidir. Avrupa’yı dolaşıp tövbe ve Mesih İsa’ya dönüş üzerine verdiği ateşli vaazlarla tanınır. Aynı anda birden fazla papanın olduğu Büyük Batı Bölünmesi döneminde Kilise’nin birliği için çalıştı. Anlatılana göre vaazlarını dinleyen binlerce kişi imana geldi.",
     "nameEn": "Vincent Ferrer",
     "titleEn": "Priest",
     "bioEn": "A Dominican preacher who lived in fourteenth- and fifteenth-century Spain. He traveled across Europe preaching fiery sermons on repentance, and worked to restore unity during the Great Western Schism. Thousands are said to have been converted by his preaching."
    }
   ]
  },
  {
   "m": 4,
   "d": 6,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Kekeme Notker",
     "title": "Rahip",
     "bio": "IX. yüzyılda İsviçre’deki Sankt Gallen Manastırı’nda yaşamış bir Benedikten keşişi, şair ve müzisyendir. Ayinde okunan bir ilahi türü olan sekansın öncülerinden sayılır.",
     "nameEn": "Notker the Stammerer",
     "titleEn": "Priest",
     "bioEn": "A Benedictine monk, poet, and musician who lived in ninth-century Switzerland (the Abbey of St. Gallen). He is considered one of the pioneers of the sequence, a form of liturgical hymn."
    }
   ]
  },
  {
   "m": 4,
   "d": 7,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Jean-Baptiste de La Salle",
     "title": "Rahip",
     "bio": "XVII-XVIII. yüzyılda Fransa’da yaşamış, soylu bir aileden gelen bir rahiptir. Servetini bırakıp kendini yoksul çocukların ücretsiz eğitimine adadı ve öğretmen yetiştiren ilk düzenli okullardan birini açtı. Kurduğu Hristiyan Okulları Kardeşleri (La Salle Kardeşleri) bugün de dünyanın her yerinde okullar işletiyor. Öğretmenlerin koruyucu azizidir.",
     "nameEn": "John Baptist de la Salle",
     "titleEn": "Priest",
     "bioEn": "A priest of noble family in seventeenth- and eighteenth-century France. He gave up his fortune to devote himself to the free education of poor children, and opened one of the first regular teacher-training institutions. The Brothers of the Christian Schools (De La Salle Brothers) he founded still run schools worldwide today; he is the patron saint of teachers."
    }
   ]
  },
  {
   "m": 4,
   "d": 8,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Julie Billiart",
     "title": "Bakire",
     "bio": "XVIII-XIX. yüzyılda Fransa’da yaşadı. Yirmi yıldan uzun süre felçli kaldıktan sonra mucizevi biçimde iyileşti. Kızların eğitimi için Notre Dame Rahibeleri cemaatini kurdu.",
     "nameEn": "Julie Billiart",
     "titleEn": "Virgin",
     "bioEn": "A Frenchwoman of the eighteenth and nineteenth centuries who was miraculously healed after more than twenty years of paralysis. She founded the Sisters of Notre Dame for the education of girls."
    }
   ]
  },
  {
   "m": 4,
   "d": 9,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Waltrude",
     "title": "Rahibe",
     "bio": "VII. yüzyılda bugünkü Belçika’da yaşamış soylu bir kadındır; kocası da aziz olarak anılır. Evliliğinden sonra manastıra çekildi. Mons şehrinin koruyucu azizesidir.",
     "nameEn": "Waltrude",
     "titleEn": "Religious",
     "bioEn": "A noblewoman in seventh-century Belgium, canonized together with her husband. After her marriage she withdrew into a convent and became the patron saint of the city of Mons."
    }
   ]
  },
  {
   "m": 4,
   "d": 10,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Chartres Piskoposu Fulbert",
     "title": "Episkopos",
     "bio": "X-XI. yüzyılda Chartres episkoposuydu ve ünlü Chartres Katedrali’nin yeniden yapımını başlattı. Bir bilgin olarak Chartres okulunu Avrupa’nın önde gelen eğitim merkezlerinden biri hâline getirdi.",
     "nameEn": "Fulbert of Chartres",
     "titleEn": "Bishop",
     "bioEn": "A scholar who became bishop of Chartres in the tenth and eleventh centuries and began the rebuilding of the famous Chartres Cathedral. He turned the school of Chartres into one of Europe's leading centers of learning."
    }
   ]
  },
  {
   "m": 4,
   "d": 11,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Stanisław",
     "title": "Episkopos ve Şehit",
     "bio": "XI. yüzyılda Polonya’da Krakov episkoposuydu. Kral II. Bolesław’ın haksızlıklarını açıkça eleştirdiği için kralın emriyle öldürüldü. Polonya’nın koruyucu azizlerinden biridir ve adaletsizliğe karşı çıkan din adamlarına örnek gösterilir.",
     "nameEn": "Stanislaus",
     "titleEn": "Bishop and Martyr",
     "bioEn": "Bishop of Kraków in eleventh-century Poland, killed by order of King Bolesław II for openly criticizing the king's injustices. He is one of the patron saints of Poland, held up as an example for clergy who stand against injustice."
    }
   ]
  },
  {
   "m": 4,
   "d": 12,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "I. Julius",
     "title": "Papa",
     "bio": "IV. yüzyılda papalık yaptı. Arianizme karşı mücadele eden Athanasius’a sürgündeyken kucak açtı ve onu savundu. Roma’da birkaç kilisenin yapımını başlattı.",
     "nameEn": "Julius I",
     "titleEn": "Pope",
     "bioEn": "Pope in the fourth century, who sheltered and defended Athanasius in exile against Arianism. He began the construction of several churches in Rome."
    }
   ]
  },
  {
   "m": 4,
   "d": 13,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "I. Martinus",
     "title": "Papa ve Şehit",
     "bio": "VII. yüzyılda papaydı. Bizans imparatorunun desteklediği Monotelizm’e, yani Mesih İsa’da yalnızca tek bir irade olduğunu söyleyen yanlış öğretiye karşı çıktı. Bu yüzden tutuklanıp Konstantinopolis’e götürüldü; kötü muamele gördü ve sürgün edildiği Kırım’da öldü. Şehit olarak anılan son papadır.",
     "nameEn": "Martin I",
     "titleEn": "Pope and Martyr",
     "bioEn": "Pope in the seventh century, arrested and taken to Constantinople for opposing the heresy of Monothelitism (the teaching that Christ has only one will), which was backed by the Byzantine emperor; he died in Crimea after mistreatment and exile. He is the last pope venerated as a martyr."
    }
   ]
  },
  {
   "m": 4,
   "d": 14,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Schiedamlı Lidwina",
     "title": "Bakire",
     "bio": "XIV-XV. yüzyılda Hollanda’da yaşadı. On beş yaşında buz pateni yaparken kaza geçirdi ve ömür boyu yatağa bağlı kaldı. Uzun yıllar süren acısını Mesih İsa’nın çektiği acılarla birleştirerek yaşadı. Kronik hastalığı olanların koruyucu azizesidir.",
     "nameEn": "Lidwina of Schiedam",
     "titleEn": "Virgin",
     "bioEn": "A Dutch girl of the fourteenth and fifteenth centuries who was left bedridden for life after an ice-skating accident at fifteen. Because she lived her long suffering in union with the Passion of Christ, she became the patron saint of the chronically ill."
    }
   ]
  },
  {
   "m": 4,
   "d": 15,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Avranches Piskoposu Paternus",
     "title": "Episkopos",
     "bio": "VI. yüzyılda Galya’da, bugünkü Fransa’da episkopostu. Episkopos olmadan önce münzevi olarak yaşamıştı.",
     "nameEn": "Paternus of Avranches",
     "titleEn": "Bishop",
     "bioEn": "A hermit who became a bishop in sixth-century Gaul (France)."
    }
   ]
  },
  {
   "m": 4,
   "d": 16,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Bernadette Soubirous",
     "title": "Bakire",
     "bio": "XIX. yüzyılda Fransa’nın Lourdes kasabasında Meryem Ana’nın kendisine göründüğü, yoksul bir değirmencinin kızıdır. Gördüklerinden şüphe edenlere karşı hep aynı sade tanıklığı verdi. Sonra bir manastıra girip sessiz bir hayat sürdü.",
     "nameEn": "Bernadette Soubirous",
     "titleEn": "Virgin",
     "bioEn": "A poor miller's daughter in nineteenth-century France, to whom Mary appeared at Lourdes. She held simply and firmly to her story in front of everyone who doubted her, and later entered a convent, where she lived quietly."
    }
   ]
  },
  {
   "m": 4,
   "d": 17,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Stephen Harding",
     "title": "Başrahip",
     "bio": "XI-XII. yüzyılda İngiltere’de doğdu. Cîteaux Manastırı’nın üçüncü başrahibi ve Sisterciyen tarikatının asıl kurucularından biridir. Tarikatın temel kuralı olan Carta Caritatis’i (Sevgi Fermanı) yazdı.",
     "nameEn": "Stephen Harding",
     "titleEn": "Abbot",
     "bioEn": "Born in eleventh- and twelfth-century England, he was the third abbot of Cîteaux Abbey and one of its true founders. He wrote the Carta Caritatis (Charter of Charity), the foundational rule of the Cistercian order."
    }
   ]
  },
  {
   "m": 4,
   "d": 18,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Milanolu Galdinus",
     "title": "Episkopos",
     "bio": "XII. yüzyılda Milano episkoposuydu. Şehirde yayılan Katarizm adlı yanlış öğretiye karşı ateşli vaazlarıyla mücadele etti ve bir vaaz verirken öldü.",
     "nameEn": "Galdinus of Milan",
     "titleEn": "Bishop",
     "bioEn": "Archbishop of Milan in the twelfth century and fought the Cathar heresy that had spread through the city with fiery sermons. He died in the pulpit."
    }
   ]
  },
  {
   "m": 4,
   "d": 19,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Canterburyli Alphege",
     "title": "Episkopos ve Şehit",
     "bio": "XI. yüzyılda Canterbury başepiskoposuydu. Viking akıncıları onu rehin aldı. Halkının daha fazla sömürülmesini istemediği için, kendisi için fidye toplanmasını yasakladı ve bu yüzden öldürüldü.",
     "nameEn": "Alphege of Canterbury",
     "titleEn": "Bishop and Martyr",
     "bioEn": "Archbishop of Canterbury in the eleventh century, taken hostage by Viking raiders and He was killed because he would not let a ransom be raised for him: he refused to see his people squeezed any further."
    }
   ]
  },
  {
   "m": 4,
   "d": 20,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Montepulcianolu Agnes",
     "title": "Bakire",
     "bio": "XIII-XIV. yüzyılda İtalya’da yaşamış bir Dominiken rahibesidir. Daha on beş yaşındayken bir manastırın başrahibesi seçildi. Mucizeleriyle ünlendi; Sienalı Azize Katerina ona büyük hayranlık duyardı.",
     "nameEn": "Agnes of Montepulciano",
     "titleEn": "Virgin",
     "bioEn": "A Dominican sister in thirteenth- and fourteenth-century Italy, elected abbess of a convent at only fifteen. She was greatly admired by Saint Catherine of Siena, and was famous for her miracles."
    }
   ]
  },
  {
   "m": 4,
   "d": 21,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Canterburyli Anselmus",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "XI-XII. yüzyılda yaşamış, İtalya kökenli bir Benedikten keşişidir. Canterbury başepiskoposu olarak, İngiltere’de kral ile Kilise arasındaki çatışmalarda Kilise’nin özgürlüğünü savundu. “Anlamak için inanıyorum” sözüyle bilinir. Allah’ın varlığına dair ünlü “ontolojik kanıtı” ile Orta Çağ felsefesinin öncülerindendir.",
     "nameEn": "Anselm of Canterbury",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "A Benedictine of Italian origin who lived in the eleventh and twelfth centuries; as archbishop of Canterbury he defended the Church's freedom in the conflicts between the king and the Church in England. His motto was \"I believe so that I may understand,\" and his famous \"ontological argument\" for the existence of God made him one of the founders of medieval philosophy."
    }
   ]
  },
  {
   "m": 4,
   "d": 22,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Montreuilli Opportuna",
     "title": "Bakire",
     "bio": "VIII. yüzyılda Normandiya’da bir manastırın başrahibesiydi. Anlatılana göre kardeşi episkopos Chrodegangus’un hac dönüşü öldürüldüğünü duyunca büyük acı çekti.",
     "nameEn": "Opportuna of Montreuil",
     "titleEn": "Virgin",
     "bioEn": "Abbess of a convent in eighth-century Normandy; she is said to have suffered great grief on hearing that her brother, Bishop Chrodegang, had died on his way back from a pilgrimage."
    }
   ]
  },
  {
   "m": 4,
   "d": 23,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Georgios",
     "title": "Şehit",
     "bio": "Geleneğe göre III-IV. yüzyılda Roma ordusunda subaydı ve Hristiyan olduğu için İmparator Diocletianus döneminde şehit edildi. Hayatı hakkında kesin tarihsel bilgi azdır, ama imanı uğruna canını vermeye hazır cesur bir asker olarak çok erken dönemden beri büyük saygı görür. Ejderha efsanesiyle özdeşleşmiştir ve birçok ülkenin koruyucu azizidir.",
     "nameEn": "George",
     "titleEn": "Martyr",
     "bioEn": "Tradition says he was an officer in the Roman army, martyred for his faith under Emperor Diocletian around the year 300. Few historical details survive, but from the earliest times he was honored as a brave soldier who gave his life for Christ. The famous legend of George and the dragon made him the patron saint of many countries."
    },
    {
     "name": "Prağlı Adalbert",
     "title": "Episkopos ve Şehit",
     "bio": "X. yüzyılda Prag episkoposuydu ve Orta ve Doğu Avrupa’da misyonerlik yaptı. Baltık kıyısındaki putperest Prusyalılara Müjde’yi anlatmaya çalışırken şehit edildi. Polonya’nın, Çekya’nın ve Macaristan’ın koruyucu azizlerindendir.",
     "nameEn": "Adalbert of Prague",
     "titleEn": "Bishop and Martyr",
     "bioEn": "Bishop of Prague in the tenth century and was a missionary in Central and Eastern Europe. He was martyred while trying to bring the Gospel to the pagan Prussians on the Baltic coast. He is one of the patron saints of Poland, the Czech Republic, and Hungary."
    }
   ]
  },
  {
   "m": 4,
   "d": 24,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Sigmaringenli Fidelis",
     "title": "Rahip ve Şehit",
     "bio": "XVI-XVII. yüzyılda Almanya’da önce avukatlık yaptı, sonra Kapuçin rahibi oldu. İsviçre’de, Protestanlarla Katolikler arasındaki gerginliğin çok yüksek olduğu bir bölgede misyonerlik yaparken öfkeli bir kalabalık tarafından öldürüldü. Kapuçin misyonerlerinin ilk şehididir.",
     "nameEn": "Fidelis of Sigmaringen",
     "titleEn": "Priest and Martyr",
     "bioEn": "First a lawyer in sixteenth- and seventeenth-century Germany, he later became a Capuchin friar. He was killed by an angry mob while doing missionary work in a Swiss region with intense Protestant-Catholic tension. He is the first martyr of the Capuchin missionaries."
    }
   ]
  },
  {
   "m": 4,
   "d": 25,
   "rank": "Bayram",
   "saints": [
    {
     "name": "İncil Yazarı Markos",
     "title": "",
     "bio": "Geleneğe göre Havari Petrus’un tercümanı ve yakın çalışma arkadaşıdır. Markos İncili’ni Petrus’un Roma’daki vaazlarına dayanarak yazdığı kabul edilir. Dört İncil’in en kısası ve büyük olasılıkla en eskisi olan bu metin, sade ve hızlı anlatımıyla tanınır. Gelenek onu İskenderiye Kilisesi’nin kurucusu sayar; simgesi kanatlı aslandır.",
     "nameEn": "Mark the Evangelist",
     "titleEn": "",
     "bioEn": "Tradition says he was the Apostle Peter's interpreter and close companion, and that he wrote his Gospel from Peter's preaching in Rome. The shortest of the four Gospels, and probably the oldest, it tells the story simply and at a fast pace. He is traditionally regarded as the founder of the Church of Alexandria; his symbol is the winged lion."
    }
   ]
  },
  {
   "m": 4,
   "d": 26,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Cletus",
     "title": "Papa ve Şehit",
     "bio": "I. yüzyılda, Havari Petrus’tan sonra Roma’nın üçüncü episkoposu, yani papası oldu. Geleneğe göre şehit edildi. Adı, Ayin’deki Roma Kanunu’nda anılan ilk papalar arasındadır.",
     "nameEn": "Cletus",
     "titleEn": "Pope and Martyr",
     "bioEn": "The third bishop of Rome (pope) after the Apostle Peter, in the first century, traditionally said to have died a martyr. He is one of the first popes named in the Roman Canon of the Mass."
    }
   ]
  },
  {
   "m": 4,
   "d": 27,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Zita",
     "title": "Bakire",
     "bio": "XIII. yüzyılda İtalya’da yaşadı. On iki yaşından ölümüne kadar aynı ailenin evinde hizmetçilik yaptı. Anlatılana göre ekmeğini yoksullarla paylaşır ve işini her zaman bir dua gibi yapardı. Ev hizmetçilerinin koruyucu azizesidir.",
     "nameEn": "Zita",
     "titleEn": "Virgin",
     "bioEn": "A girl of thirteenth-century Italy who worked as a servant in the same household from age twelve until her death. She is said to have shared her bread with the poor and always done her work as a prayer. She is the patron saint of domestic workers."
    }
   ]
  },
  {
   "m": 4,
   "d": 28,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Pierre Chanel",
     "title": "Rahip ve Şehit",
     "bio": "XIX. yüzyılda Fransa’da rahipti, sonra misyoner olarak Pasifik’teki Futuna adasına gönderildi. Adanın şefi, oğlunun vaftiz olmasından rahatsız oldu ve şefin adamları onu öldürdü. Okyanusya’nın ilk şehididir. Ölümünden kısa süre sonra adanın halkı topluca Hristiyan oldu.",
     "nameEn": "Peter Chanel",
     "titleEn": "Priest and Martyr",
     "bioEn": "A priest in nineteenth-century France, later a missionary sent to the island of Futuna in the Pacific. He was killed by the men of a local chief who was angry that his son had been baptized. He is the first martyr of Oceania; the people of his island converted to Christianity en masse shortly after his death."
    },
    {
     "name": "Louis-Marie Grignion de Montfort",
     "title": "Rahip",
     "bio": "XVII-XVIII. yüzyılda Fransa’da yoksullar arasında vaaz eden gezici bir misyonerdir. Meryem Ana aracılığıyla kendini Mesih İsa’ya adamayı anlatan “Meryem’e Gerçek Bağlılık” adlı kitabıyla tanınır. Bu kitap sonraki yüzyıllarda birçok azizi ve papayı etkiledi.",
     "nameEn": "Louis de Montfort",
     "titleEn": "Priest",
     "bioEn": "A traveling missionary in seventeenth- and eighteenth-century France who preached among the poor. He is known for his work \"True Devotion to Mary,\" on consecration to Christ through Mary; this work influenced many saints and popes in later centuries."
    }
   ]
  },
  {
   "m": 4,
   "d": 29,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Sienalı Katerina",
     "title": "Bakire ve Kilise Doktoru",
     "bio": "XIV. yüzyılda İtalya’da, yirmi beşten fazla çocuklu sıradan bir ailede doğdu. Manastıra girmeden, evinde derin bir dua hayatı sürdü. Papaların Avignon’dan Roma’ya dönmesi için çok çalıştı. Okuma yazması sınırlı olduğu hâlde, mektupları ve “Diyalog” adlı eseriyle Kilise tarihinin en etkili mistiklerinden biri sayılır. Avrupa’nın koruyucu azizelerindendir.",
     "nameEn": "Catherine of Siena",
     "titleEn": "Virgin and Doctor of the Church",
     "bioEn": "Born in fourteenth-century Italy, the daughter of an ordinary family with more than twenty-five children. Without entering a convent, she lived a deep life of prayer at home, and worked actively for the popes' return from Avignon to Rome. Although she could barely read, her letters and her book \"The Dialogue\" make her one of the most influential mystics in the Church's history. She is one of the co-patron saints of Europe."
    }
   ]
  },
  {
   "m": 4,
   "d": 30,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "V. Pius",
     "title": "Papa",
     "bio": "XVI. yüzyılda papa olan bir Dominikendir. Trento Konsili’nin kararlarını uygulamaya koydu; Roma Missali’ni (Ayin kitabı) ve Roma Katekizmi’ni yayımlattı. Papalığı, Katolik yenilenmesinin en kararlı dönemlerinden biridir.",
     "nameEn": "Pius V",
     "titleEn": "Pope",
     "bioEn": "A Dominican who became pope in the sixteenth century. He put the decrees of the Council of Trent into practice, and had the Roman Missal and the Roman Catechism published. His papacy was one of the decisive periods in carrying out the Catholic Reformation (the Counter-Reformation)."
    }
   ]
  },
  {
   "m": 5,
   "d": 1,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "İşçi Yusuf",
     "title": "",
     "bio": "Bu gün Aziz Yusuf’u marangoz olarak, yani çalışan bir insan olarak anar. Papa XII. Pius bu anmayı 1955’te, 1 Mayıs İşçi Bayramı’na karşılık olarak koydu. Çalışmanın, insanın Allah’ın yaratma işine katıldığı onurlu bir iş olduğunu ve işçilerin haklarının savunulması gerektiğini hatırlatır.",
     "nameEn": "Saint Joseph the Worker",
     "titleEn": "",
     "bioEn": "Today the Church remembers Joseph not as Mary's husband but as a working carpenter. The feast was set up in 1955 by Pope Pius XII to coincide with May Day, International Workers' Day. It reminds us that labor is a dignified activity that shares in God's work of creation, and that workers' rights must be defended."
    }
   ]
  },
  {
   "m": 5,
   "d": 2,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Athanasius",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "IV. yüzyılda İskenderiye episkoposuydu. Mesih İsa’nın Peder ile aynı özden olduğunu savunarak hayatı boyunca Arianizme karşı durmadan mücadele etti; bu yüzden beş kez sürgüne gönderildi. Kararlılığı, İznik Konsili’nin (325) iman ikrarının Kilise’de kök salmasında belirleyici oldu.",
     "nameEn": "Athanasius",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "Bishop of Alexandria in the fourth century, who fought a relentless lifelong battle against Arianism, defending the truth that Christ is of the same substance as the Father. He was exiled five times for this. His resolve was decisive in ensuring that the Creed of the Council of Nicaea (325) took root in the Church."
    }
   ]
  },
  {
   "m": 5,
   "d": 3,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Havariler Filipus ve Yakup",
     "title": "",
     "bio": "İki havariyi birlikte anarız. Filipus, Yuhanna İncili’nde İsa’ya “Bize Peder’i göster, bu bize yeter” diyen ve “Beni gören Peder’i görmüştür” cevabını alan havaridir. Yakup (Küçük Yakup) ise gelenekte Kudüs’ün ilk episkoposu ve Yakup’un Mektubu’nun yazarı sayılır.",
     "nameEn": "The Apostles Philip and James",
     "titleEn": "",
     "bioEn": "Two apostles. Philip is the apostle in the Gospel of John who says to Jesus, \"Show us the Father, and it is enough for us,\" and receives the answer, \"He that seeth me seeth the Father also.\" James (the Less) is traditionally held to be the first bishop of Jerusalem and the author of the Letter of James."
    }
   ]
  },
  {
   "m": 5,
   "d": 4,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Lorchlu Florian",
     "title": "Şehit",
     "bio": "III-IV. yüzyılda Roma ordusunda subaydı. Hristiyan olduğu için İmparator Diocletianus döneminde boynuna değirmen taşı bağlanıp nehre atıldı ve şehit edildi. Avusturya’da ve Polonya’da itfaiyecilerin koruyucu azizidir.",
     "nameEn": "Florian of Lorch",
     "titleEn": "Martyr",
     "bioEn": "An officer in the Roman army around the third to fourth century, martyred for his faith under Emperor Diocletian: he was thrown into a river with a millstone tied around his neck. He is regarded as the patron saint of firefighters in Austria and Poland."
    }
   ]
  },
  {
   "m": 5,
   "d": 5,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Arlesli Hilarius",
     "title": "Episkopos",
     "bio": "V. yüzyılda Arles episkoposu oldu. Bu göreve daha yirmi dokuz yaşındayken geldi ve etkileyici bir vaiz olarak tanındı.",
     "nameEn": "Hilary of Arles",
     "titleEn": "Bishop",
     "bioEn": "A compelling preacher who became bishop of Arles in the fifth century at only twenty-nine years old."
    }
   ]
  },
  {
   "m": 5,
   "d": 6,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Latin Kapısı Önündeki Aziz Yuhanna",
     "title": "",
     "bio": "Geleneğe göre Havari Yuhanna, İmparator Domitianus’un emriyle Roma’da kaynar yağ dolu bir kazana atıldı, ama hiçbir zarar görmeden çıktı. Bu gün o olayı anar; olay Roma’nın Latin Kapısı önünde yaşandığı için bu adla bilinir.",
     "nameEn": "Saint John Before the Latin Gate",
     "titleEn": "",
     "bioEn": "Tradition holds that the Apostle John was thrown, by order of Emperor Domitian, into a cauldron of boiling oil in Rome, but emerged unharmed; this is why he is remembered as Saint John Before the Latin Gate."
    }
   ]
  },
  {
   "m": 5,
   "d": 7,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Rosa Venerini",
     "title": "Bakire",
     "bio": "XVII-XVIII. yüzyılda İtalya’da, o dönem için alışılmadık bir şekilde kızlar için herkese açık okullar kuran bir öncüdür.",
     "nameEn": "Rose Venerini",
     "titleEn": "Virgin",
     "bioEn": "A woman of seventeenth- and eighteenth-century Italy who, unusually for her time, opened free schools for girls."
    }
   ]
  },
  {
   "m": 5,
   "d": 8,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Tarentaise Piskoposu Pierre",
     "title": "Episkopos",
     "bio": "XII. yüzyılda Fransa’nın Tarentaise bölgesinde episkopos olan bir Sisterciyen keşişidir. Anlatılana göre episkoposluğun getirdiği zenginlikten rahatsız oldu ve bir süre kimliğini gizleyerek sıradan bir keşiş gibi yaşadı.",
     "nameEn": "Peter of Tarentaise",
     "titleEn": "Bishop",
     "bioEn": "A Cistercian who served as bishop in twelfth-century France (Tarentaise). He is said to have been uncomfortable with the wealth of his office, and for a time lived incognito as an ordinary monk."
    }
   ]
  },
  {
   "m": 5,
   "d": 9,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Büyük Pakomios",
     "title": "Başrahip",
     "bio": "IV. yüzyılda Mısır’da yaşadı. Keşişlerin tek başına değil, bir topluluk hâlinde birlikte yaşadığı manastır hayatının kurucusu sayılır. Yazdığı kurallar, sonraki bütün Batı manastır kurallarını etkiledi.",
     "nameEn": "Pachomius the Great",
     "titleEn": "Abbot",
     "bioEn": "A fourth-century Egyptian monk, regarded as the founder of communal (cenobitic) monastic life, in which monks live together rather than alone. The rules he established influenced all later Western monastic rules."
    }
   ]
  },
  {
   "m": 5,
   "d": 10,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Damien de Veuster",
     "title": "Rahip",
     "bio": "Belçika’da doğmuş bir misyoner rahiptir. Hawaii’nin Molokai adasında cüzzam hastalarının zorla yaşatıldığı koloniye kendi isteğiyle gitti. On altı yıl boyunca hastalara bizzat baktı, onlar için bir kilise ve barınaklar yaptı. Sonunda kendisi de cüzzama yakalandı ve o adada öldü. Cüzzam hastalarının ve dışlanmışların koruyucu azizidir.",
     "nameEn": "Damien of Molokai",
     "titleEn": "Priest",
     "bioEn": "A missionary priest born in Belgium; he volunteered to go to the leprosy colony on the island of Molokai in Hawaii, where people with the disease were sent away and left. For sixteen years he cared for the sick with his own hands and built a church and homes for them. He eventually contracted leprosy himself and died on the island. He is the patron saint of people with leprosy and of outcasts."
    },
    {
     "name": "Juan de Ávila",
     "title": "Rahip ve Kilise Doktoru",
     "bio": "XVI. yüzyılda İspanya’nın Endülüs bölgesinde etkili bir vaiz ve ruhani rehberdi. Loyolalı İgnatius ve Avilalı Teresa gibi dönemin büyük azizlerine ruhani danışmanlık yaptı. İspanyol din adamlarının eğitiminin yenilenmesinde önemli bir rol oynadığı için “Endülüs’ün Havarisi” olarak da anılır.",
     "nameEn": "John of Ávila",
     "titleEn": "Priest and Doctor of the Church",
     "bioEn": "A powerful preacher and spiritual director in the Andalusia region of sixteenth-century Spain. He served as spiritual advisor to great saints of his time, such as Ignatius of Loyola and Teresa of Ávila. He is called \"the Apostle of the Spanish Clergy\" for the important role he played in reforming the education of Spanish priests."
    }
   ]
  },
  {
   "m": 5,
   "d": 11,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Laconili Ignazio",
     "title": "Rahip Kardeş",
     "bio": "XVII-XVIII. yüzyılda İtalya’nın Sardinya adasında yaşamış bir Kapuçin kardeşidir. Kırk yıldan fazla adanın köylerini dolaşıp sadaka topladı ve bunu yoksullara dağıttı. Alçakgönüllülüğü ve esprili konuşmasıyla çok sevildi.",
     "nameEn": "Ignatius of Laconi",
     "titleEn": "Religious",
     "bioEn": "A Capuchin brother in seventeenth- and eighteenth-century Sardinia who begged for the poor. For more than forty years he traveled the island's villages collecting alms to distribute to the poor, beloved for his humility and witty speech."
    }
   ]
  },
  {
   "m": 5,
   "d": 12,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Nereus ve Akilleus",
     "title": "Şehitler",
     "bio": "Geleneğe göre Roma ordusunda asker olan iki kişidir. Hristiyan olunca ordudan ayrıldılar ve imanları uğruna şehit edildiler. Mezarları Roma’da, onların adıyla anılan bir katakombdadır.",
     "nameEn": "Nereus and Achilleus",
     "titleEn": "Martyrs",
     "bioEn": "Two soldiers from the early Roman Church who, tradition holds, served in the Roman army, left it upon becoming Christian, and were martyred for their faith. Their tomb is in a Roman catacomb that bears their names."
    },
    {
     "name": "Pancratius",
     "title": "Şehit",
     "bio": "Geleneğe göre IV. yüzyılın başında, İmparator Diocletianus’un zulmü sırasında, henüz on dört yaşındayken Roma’da şehit edilen bir gençtir. Bu kadar genç yaşta gösterdiği iman yüzünden çok erken dönemden beri büyük saygı görür.",
     "nameEn": "Pancras",
     "titleEn": "Martyr",
     "bioEn": "Tradition says he was a young Christian martyred in Rome at only fourteen, in the early fourth century, during Emperor Diocletian's persecution. His faith at so young an age has been honored since the earliest times."
    }
   ]
  },
  {
   "m": 5,
   "d": 13,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Fatima Meryem Anası",
     "title": "",
     "bio": "1917’de Portekiz’in Fatima kasabası yakınında Meryem Ana üç çoban çocuğa altı kez göründü. Bu gün, Kilise’nin onayladığı bu görünmeleri anar. Görünmelerin çağrısı tövbe, dua ve tesbih duasıdır. Fatima o günden beri dünyada en çok ziyaret edilen Meryem hac yerlerinden biridir.",
     "nameEn": "Our Lady of Fatima",
     "titleEn": "",
     "bioEn": "Remembers the six apparitions of Mary, approved by the Church, to three shepherd children near the town of Fatima, Portugal, in 1917. Her message was a call to repentance, prayer and the Rosary. Fatima has since become one of the world's most visited Marian pilgrimage sites."
    }
   ]
  },
  {
   "m": 5,
   "d": 14,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Havari Mattias",
     "title": "",
     "bio": "Elçilerin İşleri’ne göre, İsa’ya ihanet eden Yahuda İskariot’un yerine kurayla seçilip on iki havariye katılan kişidir. İsa’nın vaftizinden göğe çıkışına kadar O’nunla birlikte olan öğrencilerden biriydi. Bunun dışında hayatı hakkında kesin bilgi azdır.",
     "nameEn": "Matthias the Apostle",
     "titleEn": "",
     "bioEn": "According to the Acts of the Apostles, he was chosen by lot among the twelve apostles to replace Judas Iscariot, who betrayed Jesus. He is noted as one of the disciples who was with Jesus from his baptism to his ascension; beyond that, little certain historical information survives about his life."
    }
   ]
  },
  {
   "m": 5,
   "d": 15,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Çiftçi Isidro",
     "title": "",
     "bio": "XI-XII. yüzyılda İspanya’da, Madrid yakınlarında sıradan bir tarım işçisiydi. Sabahları kiliseye gidip dua eder, sonra tarlada çalışır, ekmeğini yoksullarla paylaşırdı. Çiftçilerin ve tarım işçilerinin koruyucu azizidir. Kutsallığın en sıradan gündelik işlerde bile yaşanabileceğinin güzel bir örneğidir.",
     "nameEn": "Isidore the Farmer",
     "titleEn": "",
     "bioEn": "A simple Christian who lived as an ordinary farm laborer in eleventh- and twelfth-century Spain (Madrid), going to church to pray each morning before working the fields, and sharing his bread with the poor. He is considered the patron saint of farmers and farm laborers, an example that holiness can be lived even in the most ordinary daily work."
    }
   ]
  },
  {
   "m": 5,
   "d": 16,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Simon Stock",
     "title": "Rahip",
     "bio": "XIII. yüzyılda İngiltere’de Karmelit tarikatının genel başkanlığını yapmış bir keşiştir. Geleneğe göre Meryem Ana ona göründü ve kahverengi skapularyı verdi.",
     "nameEn": "Simon Stock",
     "titleEn": "Priest",
     "bioEn": "A monk who served as master general of the Carmelite order in thirteenth-century England. Tradition associates him with the vision in which Mary gave him the brown scapular."
    }
   ]
  },
  {
   "m": 5,
   "d": 17,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Pascual Baylón",
     "title": "Rahip Kardeş",
     "bio": "XVI. yüzyılda İspanya’da çobanken Fransisken kardeşi oldu. Efkaristiya’ya olan derin bağlılığıyla tanınır; Efkaristiya kongrelerinin ve derneklerinin koruyucu azizidir.",
     "nameEn": "Paschal Baylón",
     "titleEn": "Religious",
     "bioEn": "A Spanish shepherd who became a Franciscan brother in the sixteenth century. He is known for his deep devotion to the Eucharist; he has been declared the patron saint of Eucharistic congresses and associations."
    }
   ]
  },
  {
   "m": 5,
   "d": 18,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "I. Ioannes",
     "title": "Papa ve Şehit",
     "bio": "VI. yüzyılda papaydı. Ariusçu Ostrogot kralı Theodoricus onu diplomatik bir görevle Konstantinopolis’e gönderdi. Dönüşte kral ondan şüphelenip onu hapse attırdı. Hapisteki kötü koşullar yüzünden öldü ve şehit olarak anılır.",
     "nameEn": "John I",
     "titleEn": "Pope and Martyr",
     "bioEn": "Pope in the sixth century, sent to Constantinople on a diplomatic mission by the Arian Ostrogothic king Theodoric. On his return the suspicious king had him imprisoned, and he died there from the harsh conditions; he is remembered as a martyr."
    }
   ]
  },
  {
   "m": 5,
   "d": 19,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Yves Hélory",
     "title": "Rahip",
     "bio": "XIII. yüzyılda Fransa’nın Bretanya bölgesinde hem hukukçu hem de rahipti. Yoksulları ücretsiz savunduğu ve asla rüşvet almadığı için “yoksulların avukatı” diye anılır. Hukukçuların koruyucu azizidir.",
     "nameEn": "Ivo Hélory",
     "titleEn": "Priest",
     "bioEn": "A Breton (France) of the thirteenth century who was both a lawyer and a priest. He is remembered as \"the advocate of the poor\" for defending the poor without charge and refusing bribes. He is the patron saint of lawyers."
    }
   ]
  },
  {
   "m": 5,
   "d": 20,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Sienalı Bernardino",
     "title": "Rahip",
     "bio": "XIV-XV. yüzyılda İtalya’da yaşamış bir Fransisken vaizidir. Mesih İsa’nın adına bağlılığı yayan vaazlarıyla tanınır; bu adı IHS harfleriyle simgeledi. İtalya’nın birçok şehrinde binlerce kişi onu dinlemeye gelirdi; döneminin en etkili vaizlerinden biri sayılır.",
     "nameEn": "Bernardine of Siena",
     "titleEn": "Priest",
     "bioEn": "A Franciscan preacher in fourteenth- and fifteenth-century Italy. He is known for his sermons popularizing the name of Christ (symbolized by the letters IHS); he is considered one of the most influential preachers of his time, drawing thousands of listeners in many Italian cities."
    }
   ]
  },
  {
   "m": 5,
   "d": 21,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Cristóbal Magallanes ve Yoldaşları",
     "title": "Rahip, Şehit",
     "bio": "1915-1937 yılları arasında Meksika’da, hükümetin Kilise’ye zulmettiği Cristero döneminde şehit edilen yirmi beş din adamı ve sıradan Katoliği anarız. Christophorus Magallanes bir rahipti; idam edileceğini bildiği hâlde tutuklandığında bile onu öldürecekleri affetti. Bu şehitler, XX. yüzyıl Meksika’sında inanç özgürlüğü mücadelesini temsil eder.",
     "nameEn": "Christopher Magallanes and Companions",
     "titleEn": "Priest, Martyr",
     "bioEn": "One of twenty-five clergy and lay Catholics martyred in Mexico between 1915 and 1937 during a period of religious persecution by the government (the Cristero period). Magallanes was a priest; even when arrested, knowing he would be executed, he forgave his captors. This group represents twentieth-century Mexico's struggle for religious freedom."
    }
   ]
  },
  {
   "m": 5,
   "d": 22,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Cascialı Rita",
     "title": "Rahibe",
     "bio": "XIV-XV. yüzyılda İtalya’da yaşadı. Genç yaşta, şiddete eğilimli bir adamla zorla evlendirildi. Kocası ve iki oğlu öldükten sonra manastıra kabul edildi. Zor bir evlilik, yas ve hastalıkla dolu bir hayata rağmen bağışlayıcılığı ve sabrıyla tanınır. İmkânsız ve çaresiz durumların azizesi olarak anılır.",
     "nameEn": "Rita of Cascia",
     "titleEn": "Religious",
     "bioEn": "A woman of fourteenth- and fifteenth-century Italy who was forced to marry a violent man. After he and both her sons had died, she was finally allowed to enter a convent. Through a hard marriage and a life full of grief and illness, she was known for her patience and forgiveness. She is the saint of impossible causes."
    }
   ]
  },
  {
   "m": 5,
   "d": 23,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Giovanni Battista de’ Rossi",
     "title": "Rahip",
     "bio": "XVIII. yüzyılda Roma’nın sokaklarındaki evsizlere ve göçmen işçilere hizmet eden bir rahiptir. Kendisi de çok sade bir hayat sürdü.",
     "nameEn": "John Baptist Rossi",
     "titleEn": "Priest",
     "bioEn": "A priest in eighteenth-century Italy who served the homeless and migrant workers in the streets of Rome; he himself lived a humble life."
    }
   ]
  },
  {
   "m": 5,
   "d": 24,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Meryem Ana, Hristiyanların Yardımı",
     "title": "",
     "bio": "Papa VII. Pius, Napolyon tarafından hapsedildikten sonra 1814’te serbest kalıp Roma’ya döndü. Bu Meryem bayramı, o dönüşü anmak için konuldu. Özellikle Don Bosco ve kurduğu Salesyen tarikatı bu bağlılığı yaydı.",
     "nameEn": "Mary, Help of Christians",
     "titleEn": "",
     "bioEn": "A feast of Mary set up to mark the day in 1814 when Pope Pius VII, freed from Napoleon's prison, returned to Rome. Don Bosco's Salesians did much to spread it."
    }
   ]
  },
  {
   "m": 5,
   "d": 25,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Muhterem Beda",
     "title": "Rahip ve Kilise Doktoru",
     "bio": "VII-VIII. yüzyılda İngiltere’de yaşamış bir Benedikten keşişidir. “İngiliz Halkının Kilise Tarihi” adlı eseri, Anglosakson tarihinin temel kaynağıdır. Tarihlerin “Milattan Sonra” diye yazılmasını da yaygınlaştırdı. “Saygıdeğer” unvanıyla anılır ve İngiltere’nin tek Kilise Doktoru’dur.",
     "nameEn": "The Venerable Bede",
     "titleEn": "Priest and Doctor of the Church",
     "bioEn": "A Benedictine monk in seventh- and eighth-century England. His work \"Ecclesiastical History of the English People\" became the essential source for Anglo-Saxon history, and it also helped popularize the Anno Domini dating system in historical writing. He is the only English Doctor of the Church, known by the title \"the Venerable.\""
    },
    {
     "name": "VII. Gregorius",
     "title": "Papa",
     "bio": "XI. yüzyılda papaydı ve Kilise reformunun en kararlı savunucularından biridir. Episkoposları kimin atayacağı konusunda İmparator IV. Heinrich ile uzun bir mücadeleye girdi ve Kilise’nin dünyevi güçlerden bağımsız olmasını savundu.",
     "nameEn": "Gregory VII",
     "titleEn": "Pope",
     "bioEn": "Pope in the eleventh century, one of the most determined champions of Church reform. He fought a long battle with Emperor Henry IV over the appointment of bishops (the Investiture Controversy), defending the Church's independence from worldly powers."
    },
    {
     "name": "Maria Maddalena de’ Pazzi",
     "title": "Bakire",
     "bio": "XVI-XVII. yüzyılda Floransa’da yaşamış bir Karmelit rahibesidir. Yaşadığı derin mistik deneyimler ve vecd hâlleriyle tanınır; acı ve dua konusundaki yoğun deneyimleri onu döneminin en dikkat çekici mistiklerinden biri yaptı.",
     "nameEn": "Mary Magdalene de' Pazzi",
     "titleEn": "Virgin",
     "bioEn": "A Carmelite sister in sixteenth- and seventeenth-century Florence. She is known for the profound mystical visions and ecstasies she experienced; her intense experiences of suffering and prayer made her one of the most remarkable mystics of her time."
    }
   ]
  },
  {
   "m": 5,
   "d": 26,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Filippo Neri",
     "title": "Rahip",
     "bio": "XVI. yüzyılda Roma’da yaşamış, neşesi ve espri anlayışıyla tanınan bir rahiptir. Gençleri dua, müzik ve dostluk yoluyla imana çekti ve Oratoryo Cemaati’ni kurdu. “Roma’nın İkinci Havarisi” diye anılır. Kutsallığın kasvetli değil, neşeli olabileceğinin canlı bir örneğidir.",
     "nameEn": "Philip Neri",
     "titleEn": "Priest",
     "bioEn": "A priest in sixteenth-century Rome known for his joyfulness and sense of humor. He drew young people to the faith through prayer, music, and friendship, and founded the Congregation of the Oratory. He is remembered as \"the Second Apostle of Rome,\" a living example that holiness can be joyful rather than gloomy."
    }
   ]
  },
  {
   "m": 5,
   "d": 27,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Canterburyli Augustinus",
     "title": "Episkopos",
     "bio": "VI. yüzyılda Papa I. Gregorius’un misyoner olarak İngiltere’ye gönderdiği bir Benedikten keşişidir. Canterbury’de ilk episkoposluğu kurdu ve İngiltere’nin Hristiyanlaşmasında öncü oldu. “İngilizlerin Havarisi” diye anılır.",
     "nameEn": "Augustine of Canterbury",
     "titleEn": "Bishop",
     "bioEn": "A Benedictine sent as a missionary to England by Pope Gregory I in the sixth century. He established the first episcopal see at Canterbury and played a pioneering role in the Christianization of England; he is remembered as \"the Apostle of the English.\""
    }
   ]
  },
  {
   "m": 5,
   "d": 28,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Menthonlu Bernard",
     "title": "Rahip",
     "bio": "XI. yüzyılda, Alpler’i aşan hacıları korumak için dağ geçidinde bir barınak ve manastır kurdu; bugün Büyük ve Küçük Saint-Bernard geçitleri onun adını taşır. Dağcıların koruyucu azizidir.",
     "nameEn": "Bernard of Menthon",
     "titleEn": "Priest",
     "bioEn": "In the eleventh century, to protect pilgrims crossing the Alps, he founded a shelter and monastery at the mountain pass that now bears his name (the Great and Little St. Bernard Passes). He is the patron saint of mountaineers."
    }
   ]
  },
  {
   "m": 5,
   "d": 29,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "VI. Paulus",
     "title": "Papa",
     "bio": "1963-1978 yılları arasında papalık yaptı. II. Vatikan Konsili’nin büyük bölümünü yönetip sonuçlandırdı ve konsil kararlarını uygulamaya koydu. Ayin reformunu gerçekleştirdi ve Kilise’nin çağdaş dünyayla ilişkisi üzerine önemli genelgeler yazdı.",
     "nameEn": "Paul VI",
     "titleEn": "Pope",
     "bioEn": "Pope from 1963 to 1978, who led the Second Vatican Council through most of its sessions to its close and put its decisions into practice. He carried out the liturgical reform and wrote important encyclicals on the Church's relationship with the modern world."
    }
   ]
  },
  {
   "m": 5,
   "d": 30,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Jeanne d’Arc",
     "title": "Bakire",
     "bio": "XV. yüzyılda Fransa’da yaşamış genç bir köylü kızıdır. On yedi yaşında, gördüğü görümlere uyarak Yüz Yıl Savaşları’nda Fransız ordusunu zafere taşıdı. İngilizler onu yakaladı, sapkınlıkla suçladı ve diri diri yaktı. Yirmi beş yıl sonra aklandı. Fransa’nın koruyucu azizelerindendir.",
     "nameEn": "Joan of Arc",
     "titleEn": "Virgin",
     "bioEn": "A young peasant girl in fifteenth-century France who, guided by visions she received at seventeen, led the French army to victory during the Hundred Years' War. Captured by the English, she was accused of heresy and burned alive; she was exonerated twenty-five years later. She is one of the patron saints of France."
    }
   ]
  },
  {
   "m": 5,
   "d": 31,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Meryem Ana’nın Ziyareti",
     "title": "",
     "bio": "Bu bayram, İsa’ya hamile olan Meryem Ana’nın akrabası Elizabet’i ziyaret etmesini anar. Luka İncili’ne göre Elizabet karnındaki çocuğun, yani Yahya’nın, sevinçle kıpırdadığını hissetti ve Meryem’i “Kadınlar arasında kutsanmışsın” diyerek selamladı. Meryem de ünlü Magnificat ilahisiyle karşılık verdi.",
     "nameEn": "The Visitation of Mary",
     "titleEn": "",
     "bioEn": "Remembers Mary's visit to her relative Elizabeth while she was expecting Jesus. According to the Gospel of Luke, Elizabeth feels the child in her womb (John) leap for joy, and greets Mary, \"Blessed art thou among women\"; Mary answers with the famous Magnificat hymn."
    }
   ]
  },
  {
   "m": 6,
   "d": 1,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Şehit Iustinus",
     "title": "Şehit",
     "bio": "II. yüzyılda putperest bir ailede doğdu. Farklı felsefe okullarını dolaştıktan sonra Hristiyanlığı “gerçek felsefe” olarak benimsedi. Roma’da bir felsefe okulu açtı ve Hristiyan inancını putperest okurlara akılla savunan ilk apolojistlerden biri oldu. İmanı uğruna başı kesilerek şehit edildi.",
     "nameEn": "Justin Martyr",
     "titleEn": "Martyr",
     "bioEn": "A thinker born to a pagan family in the second century, who, after passing through various schools of philosophy, embraced Christianity as \"the true philosophy.\" He opened a school of philosophy in Rome and became one of the first apologists to rationally defend the Christian faith to pagan readers; he was martyred by beheading for his faith."
    }
   ]
  },
  {
   "m": 6,
   "d": 2,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Marcellinus ve Petrus",
     "title": "Şehitler",
     "bio": "IV. yüzyılın başında, İmparator Diocletianus’un zulmü sırasında Roma’da şehit edilen bir rahip (Marcellinus) ve bir şeytan kovucudur (Petrus). Şehitliklerini, Papa I. Damasus’un yazdığı bir kitabe anlatır.",
     "nameEn": "Marcellinus and Peter",
     "titleEn": "Martyrs",
     "bioEn": "A priest (Marcellinus) and an exorcist (Peter), martyred together in early fourth-century Rome during Emperor Diocletian's persecution. Pope Damasus I later recorded their martyrdom in an inscription."
    }
   ]
  },
  {
   "m": 6,
   "d": 3,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Charles Lwanga ve Yoldaşları",
     "title": "Şehitler",
     "bio": "1886’da Uganda kralı Mwanga’nın sarayında hizmet eden yirmi iki genç adamdır. Hristiyan olmuşlardı ve kral imanlarından dönmelerini istediğinde reddettiler. Diri diri yakılarak şehit edildiler. Modern dönemde aziz ilan edilen ilk Afrikalı şehitlerdir. İmanları, Hristiyanlığın Uganda’da hızla yayılmasını sağladı.",
     "nameEn": "Charles Lwanga and Companions",
     "titleEn": "Martyrs",
     "bioEn": "Twenty-two young men at the court of King Mwanga of Uganda who, having embraced Christianity, refused to renounce their faith. They were martyred in 1886 by being burned alive. They are Africa's first modern-era canonized martyrs; their faith led to the rapid spread of Christianity in Uganda."
    }
   ]
  },
  {
   "m": 6,
   "d": 4,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Francesco Caracciolo",
     "title": "Rahip",
     "bio": "XVI-XVII. yüzyılda İtalya’da yaşamış bir rahiptir. Efkaristiya’ya tapınmaya adanmış Küçük Rahipler Tarikatı’nı kurdu.",
     "nameEn": "Francis Caracciolo",
     "titleEn": "Priest",
     "bioEn": "A priest in sixteenth- and seventeenth-century Italy who founded the Minor Clerics Regular, an order devoted to Eucharistic adoration."
    }
   ]
  },
  {
   "m": 6,
   "d": 5,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Bonifatius",
     "title": "Episkopos ve Şehit",
     "bio": "VII-VIII. yüzyılda İngiltere’de doğmuş bir Benedikten keşişidir. Misyoner olarak Germen topraklarına, bugünkü Almanya’ya gitti ve putperest kabileleri Hristiyanlığa kazandırdı. Bir anlatıya göre kutsal sayılan bir meşe ağacını kesip halka putların hiçbir gücü olmadığını gösterdi. “Almanların Havarisi” diye anılır. Yaşlılığında yeniden misyona çıktı ve şehit edildi.",
     "nameEn": "Boniface",
     "titleEn": "Bishop and Martyr",
     "bioEn": "A Benedictine monk born in England in the seventh and eighth centuries; he went as a missionary to Germanic lands (modern Germany) and Christianized pagan tribes. According to legend, he cut down a sacred oak tree to show the people that the pagan gods had no power. He is remembered as \"the Apostle of the Germans\"; in old age he set out on mission again and was martyred."
    }
   ]
  },
  {
   "m": 6,
   "d": 6,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Norbert",
     "title": "Episkopos",
     "bio": "XI-XII. yüzyılda Almanya’da önce saraya bağlı bir din adamı olarak rahat bir hayat sürdü. Hayatı değiştikten sonra yoksul, gezici bir vaiz oldu. Premonstre (Norbertin) tarikatını kurdu, sonra Magdeburg episkoposu olarak Kilise reformunu savundu.",
     "nameEn": "Norbert",
     "titleEn": "Bishop",
     "bioEn": "At first a court cleric in eleventh- and twelfth-century Germany, he became a poor itinerant preacher after his conversion. He founded the Premonstratensian (Norbertine) order, then defended Church reform as bishop of Magdeburg."
    }
   ]
  },
  {
   "m": 6,
   "d": 7,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Newminsterli Robert",
     "title": "Başrahip",
     "bio": "XII. yüzyılda İngiltere’de bir Sisterciyen manastırının kurucu başrahibiydi. Sade ve sıkı bir manastır disiplini uygulamasıyla tanınır.",
     "nameEn": "Robert of Newminster",
     "titleEn": "Abbot",
     "bioEn": "The founding abbot of a Cistercian monastery in twelfth-century England, known for his simple, strict monastic discipline."
    }
   ]
  },
  {
   "m": 6,
   "d": 8,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Yorklu William",
     "title": "Episkopos",
     "bio": "XII. yüzyılda York başepiskoposuydu. Göreve gelişi tartışmalı olsa da sonradan aziz ilan edildi. Şehre dönüşünde onu karşılayan kalabalığın ağırlığıyla bir köprü çöktü, ama kimse ölmedi; bu olay onun mucizesi olarak anılır.",
     "nameEn": "William of York",
     "titleEn": "Bishop",
     "bioEn": "Archbishop of York in the twelfth century; though his appointment was disputed, he was later canonized. He is remembered for a miracle: when a bridge collapsed under the weight of the crowd welcoming him back to the city, no one died."
    }
   ]
  },
  {
   "m": 6,
   "d": 9,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Süryani Efrem",
     "title": "Diyakoz ve Kilise Doktoru",
     "bio": "IV. yüzyılda bugünkü Suriye topraklarında yaşamış Süryani bir diyakozdur. Süryanice yazdığı ilahiler ve şiir biçimindeki teolojik eserleriyle tanınır; “Kutsal Ruh’un Arpı” diye anılır. Doğu Hristiyanlığının en verimli ve etkili ilahi yazarlarından biridir.",
     "nameEn": "Ephrem the Syrian",
     "titleEn": "Deacon and Doctor of the Church",
     "bioEn": "A Syriac deacon who lived in the fourth century in what is now Syria. He is known for the hymns and poetic theological works he wrote in Syriac; he is called \"the Harp of the Holy Spirit.\" He is one of the most prolific and influential hymn writers of Eastern Christianity."
    }
   ]
  },
  {
   "m": 6,
   "d": 10,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Parisli Landry",
     "title": "Episkopos",
     "bio": "VII. yüzyılda Paris episkoposuydu. Şehirdeki ilk hastanelerden birini, bugünkü Hôtel-Dieu’nün öncülünü kurdurdu.",
     "nameEn": "Landry of Paris",
     "titleEn": "Bishop",
     "bioEn": "A bishop of Paris in the seventh century who had one of the city's first hospitals built, a forerunner of today's Hôtel-Dieu."
    }
   ]
  },
  {
   "m": 6,
   "d": 11,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Havari Barnabas",
     "title": "",
     "bio": "Elçilerin İşleri’ne göre Kıbrıslı bir Levili’dir. On iki havariden biri olmasa da ilk Kilise’de havari diye anıldı. Pavlus’u ilk Hristiyan topluluğuna tanıttı, onunla birlikte ilk misyon yolculuklarına çıktı ve Yahudilerle Yahudi olmayanların bir arada bulunduğu Antakya cemaatinin kurulmasında önemli bir rol oynadı.",
     "nameEn": "Barnabas the Apostle",
     "titleEn": "",
     "bioEn": "According to the Acts of the Apostles, a Levite from Cyprus; though not one of the Twelve, he is remembered with the title of apostle in the early Church. He introduced Paul to the first Church community, set out with him on the first missionary journey, and played an important role in founding the mixed community at Antioch."
    }
   ]
  },
  {
   "m": 6,
   "d": 12,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Juan de Sahagún",
     "title": "Rahip",
     "bio": "XV. yüzyılda İspanya’da yaşamış bir Augustinus tarikatı rahibidir. Vaazlarında yerel soyluların haksızlıklarını eleştirdi; geleneğe göre bu yüzden zehirlenerek öldürüldü.",
     "nameEn": "John of Sahagún",
     "titleEn": "Priest",
     "bioEn": "An Augustinian friar in fifteenth-century Spain. He is known for criticizing the abuses of local nobles in his sermons; tradition holds that he was poisoned for this."
    }
   ]
  },
  {
   "m": 6,
   "d": 13,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Padovalı Antuan",
     "title": "Rahip ve Kilise Doktoru",
     "bio": "Portekiz’de doğdu, XIII. yüzyılda İtalya’da yaşayan bir Fransisken rahibi oldu. Kutsal Kitap’ı çok iyi bilmesi ve etkileyici vaazlarıyla tanınır. Assisili Aziz Francis’in teoloji öğretmesine izin verdiği ilk Fransiskenlerden biridir. Kaybolan eşyaların bulunması için ona dua edilir; dünyanın her yerinde çok sevilen bir azizdir.",
     "nameEn": "Anthony of Padua",
     "titleEn": "Priest and Doctor of the Church",
     "bioEn": "A Franciscan friar born in Portugal who lived in thirteenth-century Italy. He is known for his extraordinary knowledge of Scripture and compelling preaching; he was one of the first Franciscans whom Saint Francis himself gave permission to teach theology. He is one of the most beloved saints worldwide, thanks to the tradition of praying to him to find lost things."
    }
   ]
  },
  {
   "m": 6,
   "d": 14,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "I. Methodios",
     "title": "Episkopos",
     "bio": "IX. yüzyılda Konstantinopolis episkoposuydu. İkonaları kırmak isteyenlere karşı ikonaları savunanların önde gelenlerindendi ve bu yüzden işkence gördü.",
     "nameEn": "Methodius I",
     "titleEn": "Bishop",
     "bioEn": "Bishop of Constantinople in the ninth century and played a pioneering role in defending icons during the Iconoclast controversy, for which he was tortured."
    }
   ]
  },
  {
   "m": 6,
   "d": 15,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Vitus, Modestus ve Crescentia",
     "title": "Şehitler",
     "bio": "Geleneğe göre III-IV. yüzyılda Sicilya’da yaşadılar. Vitus çocukken Hristiyan oldu ve onu büyüten dadısı Crescentia ile öğretmeni Modestus ile birlikte şehit edildi. Sinir hastalıklarına ve saraya karşı koruyucu olarak anılır.",
     "nameEn": "Vitus, Modestus, and Crescentia",
     "titleEn": "Martyrs",
     "bioEn": "Tradition holds that Vitus, who became Christian as a child in third- to fourth-century Sicily, was martyred together with his nurse Crescentia, who raised him, and his tutor Modestus. He is venerated as a protector against chorea (\"Saint Vitus' dance\") and epilepsy."
    }
   ]
  },
  {
   "m": 6,
   "d": 16,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Jean-François Régis",
     "title": "Rahip",
     "bio": "XVII. yüzyılda Fransa’nın kırsal bölgelerinde, yoksullar ve dantel işçisi kadınlar arasında yıllarca vaaz eden bir Cizvit misyonerdir.",
     "nameEn": "John Francis Regis",
     "titleEn": "Priest",
     "bioEn": "A Jesuit missionary in seventeenth-century France who preached for years among the poor and the lacemakers of the countryside."
    }
   ]
  },
  {
   "m": 6,
   "d": 17,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Pisalı Ranieri",
     "title": "Münzevi",
     "bio": "XII. yüzyılda zengin bir tüccardı. Servetini dağıtıp hacı olarak Kutsal Topraklar’ı dolaştı, sonra Pisa’ya dönüp sade bir hayat sürdü. Pisa’nın koruyucu azizidir.",
     "nameEn": "Rainerius of Pisa",
     "titleEn": "Hermit",
     "bioEn": "A wealthy merchant who gave away his fortune to travel the Holy Land as a pilgrim, and later returned to Pisa to live a simple life. He is the patron saint of Pisa."
    }
   ]
  },
  {
   "m": 6,
   "d": 18,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Marina",
     "title": "Bakire",
     "bio": "Geleneğe göre erkek kılığına girip babasıyla birlikte bir manastırda keşiş olarak yaşadı. Haksız yere bir çocuğun babası olmakla suçlandığında bile kimliğini açıklamadı ve cezayı sessizce kabul etti. Gerçek kimliği ancak ölümünden sonra anlaşıldı.",
     "nameEn": "Marina",
     "titleEn": "Virgin",
     "bioEn": "Tradition says she disguised herself as a man so that she could enter a monastery with her father and live as a monk. When falsely accused of fathering a child, she did not reveal her identity and quietly accepted the punishment; her true identity was discovered only after her death."
    }
   ]
  },
  {
   "m": 6,
   "d": 19,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Romuald",
     "title": "Başrahip",
     "bio": "X-XI. yüzyılda İtalya’da yaşamış bir Benedikten keşişidir. Gençliğinde bir şiddet olayına karıştıktan sonra manastıra çekildi. Camaldoli tarikatını kurdu ve topluluk hayatıyla münzevi hayatı bir arada yaşatan bir manastır modeli geliştirdi.",
     "nameEn": "Romuald",
     "titleEn": "Abbot",
     "bioEn": "A Benedictine in tenth- and eleventh-century Italy who withdrew to a monastery after being involved in a violent incident in his youth. He founded the Camaldolese order, developing a monastic model that combined communal and hermit life."
    }
   ]
  },
  {
   "m": 6,
   "d": 20,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Silverius",
     "title": "Papa ve Şehit",
     "bio": "VI. yüzyılda papaydı. Bizans İmparatoriçesi Theodora’nın entrikalarıyla görevden alındı ve sürgüne gönderildi. Sürgünde açlıktan öldü.",
     "nameEn": "Silverius",
     "titleEn": "Pope and Martyr",
     "bioEn": "Pope in the sixth century, deposed through the intrigues of the Byzantine Empress Theodora and sent into exile, where he died of starvation."
    }
   ]
  },
  {
   "m": 6,
   "d": 21,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Luigi Gonzaga",
     "title": "Rahip",
     "bio": "XVI. yüzyılda İtalya’da soylu bir ailede doğdu. Mirasından vazgeçip Cizvit tarikatına girdi. Roma’daki bir salgın sırasında hastalara bakarken kendisi de hastalandı ve yirmi üç yaşında öldü. Gençlerin koruyucu azizidir.",
     "nameEn": "Aloysius Gonzaga",
     "titleEn": "Priest",
     "bioEn": "A young man of noble family in sixteenth-century Italy who renounced his inheritance to enter the Jesuit order. While caring for the sick during a plague epidemic in Rome, he contracted the disease himself and died at twenty-three. He is the patron saint of young Jesuits and of youth."
    }
   ]
  },
  {
   "m": 6,
   "d": 22,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Nolalı Paulinus",
     "title": "Episkopos",
     "bio": "IV-V. yüzyılda yaşadı ve Roma’nın zengin bir senatör ailesinden geliyordu. Servetini yoksullara dağıttı ve Nola şehrinin episkoposu oldu. Döneminin büyük Hristiyan yazarlarıyla, Augustinus ve Hieronymus ile mektuplaştı.",
     "nameEn": "Paulinus of Nola",
     "titleEn": "Bishop",
     "bioEn": "Born into a rich Roman senatorial family in the fourth century, he gave away his fortune to the poor and became a bishop. He served as bishop in the city of Nola, and corresponded closely with the great Christian writers of his time (Augustine, Jerome)."
    },
    {
     "name": "John Fisher ve Thomas More",
     "title": "Episkopos ve Laik, Şehitler",
     "bio": "XVI. yüzyılda İngiltere’de yaşamış iki şehittir. Kral VIII. Henricus’un kendini Kilise’nin başı ilan etmesini ve boşanmasını kabul etmedikleri için idam edildiler. Fisher bir episkopostu. More ise kralın başbakanlığını yapmış bir hukukçu ve düşünürdü. İkisi de vicdanlarını krala teslim etmeyi reddetti ve şehit oldu.",
     "nameEn": "John Fisher and Thomas More",
     "titleEn": "Bishop and Layman, Martyrs",
     "bioEn": "Two men in sixteenth-century England executed for refusing to accept King Henry VIII's divorce and his claim to be head of the Church. Fisher was a bishop, and More a lawyer and thinker who had served as the king's chancellor. Both refused to surrender their consciences to the king and were martyred."
    }
   ]
  },
  {
   "m": 6,
   "d": 23,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Elyli Etheldreda",
     "title": "Bakire",
     "bio": "VII. yüzyılda İngiltere’de bir kraliçeydi. İki kez evlendiği hâlde kendini Allah’a adamış olarak yaşadı. Sonunda manastıra girdi ve Ely Manastırı’nı kurdu.",
     "nameEn": "Etheldreda of Ely",
     "titleEn": "Virgin",
     "bioEn": "A queen in seventh-century England who preserved her virginity despite two marriages, and eventually entered a convent and founded Ely Abbey."
    }
   ]
  },
  {
   "m": 6,
   "d": 24,
   "rank": "Büyük Bayram",
   "saints": [
    {
     "name": "Vaftizci Yahya’nın Doğumu",
     "title": "",
     "bio": "Luka İncili’ne göre yaşlı ve çocuksuz bir çift olan Zekeriya ile Elizabet, mucizevi bir şekilde bir oğul sahibi oldu: Mesih İsa’nın yolunu hazırlayacak peygamber Yahya. Bu bayram onun doğumunu anar. Kilise takviminde doğum günü kutlanan neredeyse yalnızca üç kişi vardır: İsa, Meryem Ana ve Yahya. Bu da Yahya’nın kurtuluş tarihindeki eşsiz yerini gösterir.",
     "nameEn": "The Birth of Saint John the Baptist",
     "titleEn": "",
     "bioEn": "Celebrates the miraculous birth, told in Luke's Gospel, of the prophet who would prepare the way for Christ. His parents, Zechariah and Elizabeth, were old and had never had children. The Church's calendar celebrates the birthdays of only three people, Jesus, Mary, and John; this shows John's unique place in the history of salvation."
    }
   ]
  },
  {
   "m": 6,
   "d": 25,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Vercellili Guglielmo",
     "title": "Başrahip",
     "bio": "XI-XII. yüzyılda İtalya’da, Monte Vergine’de bir manastır kuran bir keşiştir. Anlatılana göre keşişlerine çok sıkı bir disiplin uyguladığı için bazıları onu bırakıp gitti.",
     "nameEn": "William of Vercelli",
     "titleEn": "Abbot",
     "bioEn": "A monk in eleventh- and twelfth-century Italy who founded a monastery at Montevergine; his discipline toward his monks was so strict that some are said to have left him."
    }
   ]
  },
  {
   "m": 6,
   "d": 26,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Josemaría Escrivá",
     "title": "Rahip",
     "bio": "XX. yüzyılda İspanya’da yaşamış bir rahiptir. Opus Dei’yi kurdu. Bu topluluğun temel fikri şudur: Sıradan insanlar da günlük işlerini kutsallığa giden bir yol hâline getirebilir. Kutsallığın yalnızca manastırda değil, iş hayatında ve ailede de yaşanabileceğini vurguladı.",
     "nameEn": "Josemaría Escrivá",
     "titleEn": "Priest",
     "bioEn": "A priest in twentieth-century Spain who founded Opus Dei, a community based on the idea that people in ordinary professions can make their daily work a path to holiness. He emphasized that holiness can be lived not only in the monastery, but in work and family life."
    }
   ]
  },
  {
   "m": 6,
   "d": 27,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "İskenderiyeli Kyrillos",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "V. yüzyılda İskenderiye episkoposuydu. Nestorius, Meryem Ana’nın “Tanrı Anası” değil yalnızca “Mesih’in Anası” olduğunu öğretiyordu; Kyrillos buna karşı çıktı. Bu tartışma, Meryem’in Theotokos (Tanrı Anası) unvanını resmen onaylayan 431 Efes Konsili’ne yol açtı.",
     "nameEn": "Cyril of Alexandria",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "Bishop of Alexandria in the fifth century and opposed Nestorius's teaching that Mary was only the \"Mother of Christ\" and not the \"Mother of God.\" This dispute led to the Council of Ephesus in 431, which formally confirmed Mary's title of Theotokos."
    }
   ]
  },
  {
   "m": 6,
   "d": 28,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Lyonlu Irenaeus",
     "title": "Episkopos ve Şehit",
     "bio": "II. yüzyılda Küçük Asya’da, bugünkü Türkiye topraklarında doğdu, sonra Galya’da Lyon episkoposu oldu. “Sapkınlıklara Karşı” adlı büyük eseriyle, erken dönemin gnostik yanlış öğretilerine karşı havarilerden gelen imanı düzenli olarak savunan ilk büyük teologlardandır. Havari Yuhanna’nın öğrencisi Polikarp’ın öğrencisiydi. Bu zincir, havarilerden gelen geleneğin kesintisiz sürdüğünün canlı bir kanıtıdır.",
     "nameEn": "Irenaeus",
     "titleEn": "Bishop and Martyr",
     "bioEn": "Born in the second century in Asia Minor (modern Turkey), he later became bishop of Lyon (Gaul). With his great work \"Against Heresies,\" he became one of the first great theologians to defend the apostolic faith systematically against the Gnostic heresies of his day. He was a disciple of Polycarp, who was himself a disciple of the Apostle John; a living link back to the apostles."
    }
   ]
  },
  {
   "m": 6,
   "d": 29,
   "rank": "En Büyük Bayram",
   "saints": [
    {
     "name": "Havariler Petrus ve Pavlus",
     "title": "",
     "bio": "Kilise’nin iki büyük sütununu aynı gün birlikte kutlar. Petrus, Mesih İsa’nın “Sen Petrus’sun ve ben Kilise’mi bu kayanın üzerine kuracağım” dediği havarilerin başıdır ve ilk Roma episkoposu, yani ilk papa sayılır. Pavlus ise önce Hristiyanlara zulmetti, sonra imana gelip Milletlerin Havarisi oldu ve üç büyük misyon yolculuğuyla Müjde’yi Akdeniz dünyasına taşıdı. Geleneğe göre ikisi de Roma’da, Neron’un zulmü sırasında şehit edildi.",
     "nameEn": "The Apostles Peter and Paul",
     "titleEn": "",
     "bioEn": "The Church celebrates its two great pillars together on the same day. Peter is the head of the apostles to whom Christ said, \"Thou art Peter, and upon this rock I will build my church,\" and is considered the first bishop of Rome (pope). Paul, who at first persecuted Christians, converted and became the Apostle to the Gentiles, carrying the Gospel across the Mediterranean world through three great missionary journeys. Tradition holds that both were martyred in Rome under Nero's persecution."
    }
   ]
  },
  {
   "m": 6,
   "d": 30,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Roma Kilisesi’nin İlk Şehitleri",
     "title": "",
     "bio": "64 yılında Roma’daki büyük yangından sonra İmparator Neron suçu Hristiyanların üzerine attı ve onları acımasızca öldürttü. Bu gün, o ilk Hristiyan topluluğunu anar. Tacitus gibi putperest Romalı tarihçilerin bile kaydettiği bu zulüm, devletin Hristiyanlara karşı başlattığı ilk büyük baskı sayılır.",
     "nameEn": "The First Martyrs of the Church of Rome",
     "titleEn": "",
     "bioEn": "Remembers the first Christians of Rome, whom Emperor Nero blamed for the great fire of AD 64 and put to death without mercy. This persecution, recorded even by pagan Roman historians such as Tacitus, is considered the first major state-sponsored oppression of Christians."
    }
   ]
  },
  {
   "m": 7,
   "d": 1,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Junípero Serra",
     "title": "Rahip",
     "bio": "İspanya’nın Mayorka adasında doğmuş bir Fransisken misyonerdir. XVIII. yüzyılda bugünkü Kaliforniya’da dokuz misyon kurdu ve yerli halklara Müjde’yi anlattı. Hayatı ve misyonu, dönemin sömürgecilik ortamı yüzünden bugün de tartışılır; Kilise onu misyonerlik gayreti için aziz ilan etti.",
     "nameEn": "Junípero Serra",
     "titleEn": "Priest",
     "bioEn": "A Franciscan missionary born in Spanish Majorca; in the eighteenth century he founded nine missions in what is now California, bringing the Gospel to Indigenous peoples. His life and mission remain controversial today because of the colonial context of the era; the Church canonized him for his missionary zeal."
    }
   ]
  },
  {
   "m": 7,
   "d": 2,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Bernardino Realino",
     "title": "Rahip",
     "bio": "XVI-XVII. yüzyılda İtalya’da önce hukukçuydu, sonra Cizvit rahibi oldu. Lecce şehrinin ruhani rehberi olarak tanındı.",
     "nameEn": "Bernardine Realino",
     "titleEn": "Priest",
     "bioEn": "First a lawyer in sixteenth- and seventeenth-century Italy, he became a Jesuit priest and the spiritual guide of the city of Lecce."
    }
   ]
  },
  {
   "m": 7,
   "d": 3,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Havari Tomas",
     "title": "",
     "bio": "Yuhanna İncili’ne göre dirilmiş İsa’yı kendi gözleriyle görmeden inanmayacağını söyleyen havaridir. İsa ona göründüğünde yaralarını gördü ve “Rabbim ve Tanrım!” dedi; bu yüzden “Şüpheci Tomas” diye bilinir. Geleneğe göre Müjde’yi Hindistan’a götürdü ve orada şehit edildi. Hindistan’daki Aziz Tomas Hristiyanları kökenlerini ona dayandırır.",
     "nameEn": "Thomas the Apostle",
     "titleEn": "",
     "bioEn": "In the Gospel of John, the apostle who refuses to believe without seeing the risen Jesus, then, on touching his wounds, cries out, \"My Lord and my God\"; he is thus known as \"Doubting Thomas.\" Tradition holds that he carried the Gospel to India and was martyred there; the Saint Thomas Christian community of India traces its origin to him."
    }
   ]
  },
  {
   "m": 7,
   "d": 4,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Portekizli İzabel",
     "title": "Kraliçe",
     "bio": "XIII-XIV. yüzyılda Portekiz kraliçesiydi. Zor bir evlilikte bile sabrı ve barışseverliğiyle tanındı. Kocası ile oğlu arasındaki bir savaşı önlemek için bizzat araya girdi. Hayatı boyunca yoksullara ve hastalara cömertçe yardım etti. Barışı sağlamaya çalışanların koruyucu azizesidir.",
     "nameEn": "Elizabeth of Portugal",
     "titleEn": "Queen",
     "bioEn": "Queen of Portugal in the thirteenth and fourteenth centuries, known for her patience and peacemaking even in a difficult marriage. She personally intervened to prevent war between her husband and son, and generously helped the poor and sick throughout her life. She is regarded as the patron saint of peacemakers."
    }
   ]
  },
  {
   "m": 7,
   "d": 5,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Antonio Maria Zaccaria",
     "title": "Rahip",
     "bio": "XVI. yüzyılda İtalya’da önce tıp okudu, sonra rahip oldu. Barnabitler tarikatını kurdu ve halkı sık sık ve içtenlikle Efkaristiya almaya teşvik etti. Bu yönüyle Katolik yenilenmesinin öncülerinden sayılır.",
     "nameEn": "Anthony Mary Zaccaria",
     "titleEn": "Priest",
     "bioEn": "First a student of medicine in sixteenth-century Italy, he became a priest. He founded the Barnabites and encouraged the people to receive the Eucharist frequently and sincerely; for this emphasis he is counted among the pioneers of the Catholic Reformation."
    }
   ]
  },
  {
   "m": 7,
   "d": 6,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Maria Goretti",
     "title": "Bakire ve Şehit",
     "bio": "XIX-XX. yüzyılda İtalya’da yaşamış bir kız çocuğudur. Daha on bir yaşındayken, ona tecavüz etmeye çalışan bir genç tarafından bıçaklanarak öldürüldü. Ölmeden önce onu affettiğini söyledi. Yıllar sonra hapiste hayatı değişen bu adam, Maria’nın aziz ilan edildiği törende annesinin yanında bulundu. Bağışlamanın simgesi olmuştur.",
     "nameEn": "Maria Goretti",
     "titleEn": "Virgin and Martyr",
     "bioEn": "A girl in nineteenth- and twentieth-century Italy, stabbed to death at only eleven years old by a young man who tried to assault her. Before dying she said she forgave her attacker; years later, the man, who had been converted in prison, stood beside her mother at Maria's canonization. She has become a symbol of young victims and of forgiveness."
    }
   ]
  },
  {
   "m": 7,
   "d": 7,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Palladius",
     "title": "Episkopos",
     "bio": "V. yüzyılda, Aziz Patrick’ten önce Papa Celestinus’un İrlanda’ya gönderdiği ilk episkopostur. Misyonu kısa sürdü, ama İrlanda’daki ilk resmî Hristiyan misyonu sayılır.",
     "nameEn": "Palladius",
     "titleEn": "Bishop",
     "bioEn": "The first bishop sent to Ireland, by Pope Celestine in the fifth century, before Saint Patrick; though his mission was short, it is considered Ireland's first official Christian mission."
    }
   ]
  },
  {
   "m": 7,
   "d": 8,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Aquila ve Priscilla",
     "title": "",
     "bio": "Elçilerin İşleri’nde ve Pavlus’un mektuplarında adı geçen, çadırcılık yapan misyoner bir çifttir. Evlerini ilk Hristiyan topluluğuna açtılar. Korint’te ve Efes’te Pavlus’un yol arkadaşı oldular.",
     "nameEn": "Aquila and Priscilla",
     "titleEn": "",
     "bioEn": "A married pair of missionaries, tentmakers by trade, named in the Acts of the Apostles and Paul's letters, who opened their home to the early Christian community. They were Paul's companions in Corinth and Ephesus."
    }
   ]
  },
  {
   "m": 7,
   "d": 9,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Augustinus Zhao Rong ve Yoldaşları",
     "title": "Şehitler",
     "bio": "1648-1930 yılları arasında Çin’de, farklı dönemlerdeki zulümler sırasında şehit edilen yüz otuz kadar rahibi, rahibeyi ve sıradan Katoliği anarız. Augustinus Zhao Rong Çinli bir rahipti. Bu ortak anma, Çin Katolik Kilisesi’nin yüzyıllar boyunca ödediği bedeli hatırlatır.",
     "nameEn": "Augustine Zhao Rong and Companions",
     "titleEn": "Martyrs",
     "bioEn": "Remembers about a hundred and thirty priests, sisters, and lay Catholics martyred in China during various periods of persecution between 1648 and 1930. Zhao Rong was a Chinese priest. Together they stand for the price the Catholic Church in China has paid over the centuries."
    }
   ]
  },
  {
   "m": 7,
   "d": 10,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Felicitas’ın Yedi Oğlu",
     "title": "Şehitler",
     "bio": "Geleneğe göre II. yüzyılda Roma’da, anneleri Azize Felicitas ile birlikte imanları uğruna şehit edilen yedi kardeştir.",
     "nameEn": "The Seven Sons of Felicity",
     "titleEn": "Martyrs",
     "bioEn": "Tradition says they were seven brothers martyred in second-century Rome for their faith, together with their mother Saint Felicity."
    }
   ]
  },
  {
   "m": 7,
   "d": 11,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Nursialı Benedictus",
     "title": "Başrahip",
     "bio": "V-VI. yüzyılda İtalya’da yaşadı ve Batı manastırcılığının kurucusu sayılır. Monte Cassino’da bir manastır kurdu. Yazdığı “Kural”, dua ile çalışmayı (“ora et labora”, yani “dua et ve çalış”) dengeleyen ölçülü ve düzenli bir topluluk hayatı anlatır. Bu kural, sonraki bin yıl boyunca Batı manastırcılığının temeli oldu. Avrupa’nın koruyucu azizidir.",
     "nameEn": "Benedict of Nursia",
     "titleEn": "Abbot",
     "bioEn": "A fifth- and sixth-century Italian monk, regarded as the founder of Western monasticism. He founded a monastery at Monte Cassino; the Rule (Regula) he wrote sets out a measured, stable communal life that balances prayer and work (\"ora et labora\"). This rule became the basic framework of Western monasticism for the following thousand years. He is the patron saint of Europe."
    }
   ]
  },
  {
   "m": 7,
   "d": 12,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Giovanni Gualberto",
     "title": "Başrahip",
     "bio": "XI. yüzyılda İtalya’da yaşadı. Kardeşinin katilini affettikten sonra manastıra girdi. Vallombrosa tarikatını kurdu ve kilise görevlerinin parayla satılmasına karşı mücadele etti.",
     "nameEn": "John Gualbert",
     "titleEn": "Abbot",
     "bioEn": "A monk in eleventh-century Italy who entered a monastery after forgiving his brother's murderer. He founded the Vallombrosan order and fought against simony (the selling of Church offices)."
    }
   ]
  },
  {
   "m": 7,
   "d": 13,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "II. Heinrich",
     "title": "İmparator",
     "bio": "X-XI. yüzyılda Kutsal Roma-Germen İmparatoru’ydu ve gücünü Kilise’yi güçlendirmek ve yenilemek için kullandı. Eşi Azize Kunigunde ile birlikte, iktidardayken de dindarlığını koruyabilen bir hükümdar örneği olarak anılır.",
     "nameEn": "Henry II",
     "titleEn": "Emperor",
     "bioEn": "Holy Roman Emperor in the tenth and eleventh centuries, who used his power to strengthen and reform the Church. Together with his wife, Saint Cunigunde, he is remembered as proof that a ruler can hold power and stay holy."
    }
   ]
  },
  {
   "m": 7,
   "d": 14,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Camillo de Lellis",
     "title": "Rahip",
     "bio": "XVI-XVII. yüzyılda İtalya’da önce asker ve kumarbazdı. Hayatı değiştikten sonra kendini hastalara adadı. Hastalara hizmet için bir tarikat kurdu ve ekibiyle savaş alanlarında bile yaralılara baktı; ambulans hizmetinin ve hasta bakımının öncülerinden sayılır. Hastaların ve hemşirelerin koruyucu azizidir.",
     "nameEn": "Camillus de Lellis",
     "titleEn": "Priest",
     "bioEn": "First a soldier and gambler in sixteenth- and seventeenth-century Italy, after his conversion he devoted his life to the sick. He founded an order for hospital service, and with his team cared for the wounded even on battlefields; he is considered a pioneer of ambulance service and nursing care. He is the patron saint of the sick and of nurses."
    },
    {
     "name": "Kateri Tekakwitha",
     "title": "Bakire",
     "bio": "XVII. yüzyılda bugünkü New York eyaletinde, Mohawk bir baba ile Hristiyan Algonkin bir annenin kızı olarak doğdu. Çiçek hastalığı yüzünde izler bıraktı. Ailesinin tepkisine rağmen Katolik oldu ve kendini Allah’a adadı. Yirmi dört yaşında öldü. “Mohawk’ların Zambağı” diye anılır; Kuzey Amerika’da doğmuş ilk yerli azizedir.",
     "nameEn": "Kateri Tekakwitha",
     "titleEn": "Virgin",
     "bioEn": "Born in the seventeenth century in what is now New York State, to a Mohawk father and a Christian Algonquin mother. Her face was scarred by smallpox; despite her family's opposition, she converted to Catholicism and took a vow of virginity. She died at twenty-four; known as \"the Lily of the Mohawks,\" she is the first Native American saint."
    }
   ]
  },
  {
   "m": 7,
   "d": 15,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Bonaventura",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "XIII. yüzyılda İtalya’da yaşamış bir Fransisken teologdur. Fransisken tarikatının genel başkanlığını yaptı ve Assisili Aziz Francis’in resmî biyografisini yazdı. Akademik teoloji ile mistik dindarlığı bir araya getiren yaklaşımıyla “Serafik Doktor” unvanını aldı.",
     "nameEn": "Bonaventure",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "A Franciscan theologian who lived in thirteenth-century Italy. He served as master general of the Franciscan order and wrote the official life of Saint Francis. His way of joining scholarly theology with mystical devotion earned him the title \"the Seraphic Doctor.\""
    }
   ]
  },
  {
   "m": 7,
   "d": 16,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Karmel Dağı Meryem Anası",
     "title": "",
     "bio": "Bu bayram, Karmelit tarikatının Meryem Ana’ya özel bağlılığını kutlar. Geleneğe göre XIII. yüzyılda Meryem Ana, Aziz Simon Stock’a göründü ve ona kahverengi bir skapular (omuza takılan kumaş) vererek korunma sözü verdi. Bayram, Karmelit maneviyatının ve Meryem’e adanmış sade dindarlığın simgesidir.",
     "nameEn": "Our Lady of Mount Carmel",
     "titleEn": "",
     "bioEn": "The feast of the Carmelites' special love for Mary. Tradition links it to a thirteenth-century vision in which Mary appeared to Saint Simon Stock, gave him the brown scapular and promised her protection."
    }
   ]
  },
  {
   "m": 7,
   "d": 17,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Marcellina",
     "title": "Bakire",
     "bio": "IV. yüzyılda yaşadı ve Büyük Ambrosius’un ablasıdır. Papa Liberius’un elinden peçe alarak kendini Allah’a adadı. Hayatını, kardeşi Ambrosius’un ona adadığı yazılardan biliyoruz.",
     "nameEn": "Marcellina",
     "titleEn": "Virgin",
     "bioEn": "The elder sister of Ambrose the Great, in the fourth century. She consecrated herself to God, receiving the veil from Pope Liberius; we know her life from writings her brother Ambrose dedicated to her."
    }
   ]
  },
  {
   "m": 7,
   "d": 18,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Symphorosa ve Yedi Oğlu",
     "title": "Şehitler",
     "bio": "II. yüzyılda Roma yakınlarında yaşadı. Kocası şehit edildikten sonra kendisi de yedi oğluyla birlikte İmparator Hadrianus’un emriyle şehit edildi.",
     "nameEn": "Symphorosa and Her Seven Sons",
     "titleEn": "Martyrs",
     "bioEn": "A woman martyred near Rome in the second century, on Emperor Hadrian's orders, together with her seven sons, after her husband had been martyred too."
    }
   ]
  },
  {
   "m": 7,
   "d": 19,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Büyük Arsenios",
     "title": "Münzevi",
     "bio": "IV-V. yüzyılda Roma imparatorunun sarayında prenslerin öğretmeniydi. Her şeyi bırakıp Mısır çölüne çekildi. Çöl geleneğinin önemli isimlerindendir; “Kaç, sus ve sükûnet içinde ol” öğüdüyle tanınır.",
     "nameEn": "Arsenius the Great",
     "titleEn": "Hermit",
     "bioEn": "A tutor to the emperor's children at the Roman court in the fourth century, who gave it all up to go and live in the Egyptian desert. He is a major figure of the desert tradition, known for the advice \"Flee, keep silent, and be still.\""
    }
   ]
  },
  {
   "m": 7,
   "d": 20,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Apollinaris",
     "title": "Episkopos ve Şehit",
     "bio": "Geleneğe göre I. yüzyılda Havari Petrus onu Ravenna’nın ilk episkoposu olarak atadı. Uzun yıllar hizmet ettikten sonra imanı yüzünden şehit edildi; bunun hangi imparator döneminde olduğu kesin bilinmez.",
     "nameEn": "Apollinaris",
     "titleEn": "Bishop and Martyr",
     "bioEn": "Tradition says the Apostle Peter himself made him the first bishop of Ravenna in the first century. After many years as bishop he was martyred for his faith, though under which emperor is not certain."
    }
   ]
  },
  {
   "m": 7,
   "d": 21,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Brindisili Lorenzo",
     "title": "Rahip ve Kilise Doktoru",
     "bio": "XVI-XVII. yüzyılda İtalya’da yaşamış bir Kapuçin rahibidir. İbraniceyi, Yunancayı ve birçok Avrupa dilini bilmesiyle, yani olağanüstü dil yeteneğiyle tanınır. Kapuçin tarikatının genel başkanlığını yaptı; hem vaiz hem diplomat olarak Kilise’ye hizmet etti.",
     "nameEn": "Lawrence of Brindisi",
     "titleEn": "Priest and Doctor of the Church",
     "bioEn": "A Capuchin friar who lived in sixteenth- and seventeenth-century Italy. Known for his extraordinary gift for languages (Hebrew, Greek, and many European tongues), he served as master general of the Capuchin order and worked for the Church as both preacher and diplomat."
    }
   ]
  },
  {
   "m": 7,
   "d": 22,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Mecdelli Meryem",
     "title": "",
     "bio": "İncillere göre Mesih İsa’nın yedi cinden kurtardığı, O’nu Celile’den beri izleyen ve çarmıhın dibinde bulunan kadınlardan biridir. Diriliş sabahı boş mezarı ilk gören ve dirilmiş İsa ile ilk karşılaşan kişi oldu. İsa ona gidip havarilere haber vermesini söyledi; bu yüzden gelenekte “havarilerin havarisi” diye anılır.",
     "nameEn": "Mary Magdalene",
     "titleEn": "",
     "bioEn": "According to the Gospels, a woman from whom Christ cast out seven demons, who followed him from Galilee and was present at the cross. She was the first to discover the empty tomb after the Resurrection and the first to meet the risen Jesus; he told her to bring word to the apostles, and for this she is traditionally called \"the apostle to the apostles.\""
    }
   ]
  },
  {
   "m": 7,
   "d": 23,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "İsveçli Birgitta",
     "title": "Rahibe",
     "bio": "XIV. yüzyılda İsveç’te yaşamış, sekiz çocuklu soylu bir kadındır. Kocası öldükten sonra derin görümler yaşadı ve bu görümlere dayanarak Birgitta tarikatını kurdu. Papaların Roma’ya dönmesi için ısrarla çalıştı. Avrupa’nın koruyucu azizelerindendir.",
     "nameEn": "Bridget of Sweden",
     "titleEn": "Religious",
     "bioEn": "A noblewoman and mother of eight children in fourteenth-century Sweden. After her husband's death she experienced profound visions, and founded the Bridgettine order based on them. She worked persistently for the papacy's return to Rome. She is one of the co-patron saints of Europe."
    }
   ]
  },
  {
   "m": 7,
   "d": 24,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Şarbel Mahluf",
     "title": "Rahip",
     "bio": "XIX. yüzyılda Lübnan’da yaşamış bir Maruni keşişidir. Hayatının son yirmi üç yılını neredeyse tam bir sessizlik ve inziva içinde geçirdi. Ölümünden sonra mezarından ışık yayıldığı ve pek çok şifa gerçekleştiği bildirildi. Lübnan’ın en sevilen azizlerinden biridir.",
     "nameEn": "Sharbel Makhlouf",
     "titleEn": "Priest",
     "bioEn": "A Maronite monk who lived in nineteenth-century Lebanon. He spent the last twenty-three years of his life in almost complete silence and solitude. He is known for the light reported to shine from his tomb after his death and for numerous healing miracles; he is one of Lebanon's most beloved saints."
    }
   ]
  },
  {
   "m": 7,
   "d": 25,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Havari Yakup",
     "title": "",
     "bio": "Zebedi’nin oğlu, Havari Yuhanna’nın kardeşidir ve İsa’nın en yakın üç öğrencisinden biridir (Petrus, Yakup ve Yuhanna). İsa’nın dağda görünüşünün değiştiği anda ve Getsemani bahçesinde O’nun yanındaydı. Elçilerin İşleri’ne göre havarilerden şehit edilen ilk kişidir. Geleneğe göre mezarı İspanya’nın Santiago de Compostela şehrindedir; burası büyük bir hac merkezidir.",
     "nameEn": "James the Apostle",
     "titleEn": "",
     "bioEn": "The son of Zebedee, brother of John the Apostle, and one of Jesus's three closest disciples (Peter, James, and John); he is with Jesus at the Transfiguration on Mount Tabor and in the Garden of Gethsemane. According to the Acts of the Apostles, he is the first of the apostles to be martyred; the Spanish city of Santiago de Compostela is traditionally held to be the site of his tomb and is a great pilgrimage center."
    }
   ]
  },
  {
   "m": 7,
   "d": 26,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Yoakim ve Anna",
     "title": "Meryem Ana’nın Ebeveynleri",
     "bio": "Kutsal Kitap’ta adları geçmez, ama ilk Kilise geleneği Meryem Ana’nın anne ve babasını Anna ve Ioachim olarak anar. Uzun süre çocuksuz kaldıktan sonra dua ederek Meryem’i bir armağan olarak aldıklarına inanılır. Büyükannelerin ve büyükbabaların koruyucu azizleridir.",
     "nameEn": "Joachim and Anne",
     "titleEn": "Parents of Mary",
     "bioEn": "Though not named in Scripture, early Church tradition remembers Mary's parents as Joachim and Anne. They are believed to have received Mary as a gift through prayer after being childless for a long time; they are considered the patron saints of grandparents."
    }
   ]
  },
  {
   "m": 7,
   "d": 27,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Pantaleon",
     "title": "Şehit",
     "bio": "III-IV. yüzyılda Nikomedya’da, bugünkü İzmit’te, imparator sarayının hekimiydi ve sonra Hristiyan oldu. Yoksulları ücretsiz tedavi ettiği için kıskanıldı, ihbar edildi ve şehit edildi. Hekimlerin koruyucu azizlerindendir.",
     "nameEn": "Pantaleon",
     "titleEn": "Martyr",
     "bioEn": "A physician at the imperial court in Nicomedia (modern İzmit, Turkey) around the year 300 who became a Christian. Jealous rivals denounced him for treating the poor free of charge, and he was martyred. He is one of the patron saints of physicians."
    }
   ]
  },
  {
   "m": 7,
   "d": 28,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Nazarius ve Celsus",
     "title": "Şehitler",
     "bio": "Geleneğe göre I. yüzyılda Milano’da şehit edilen iki azizdir. Mezarlarını IV. yüzyılda Aziz Ambrosius buldu.",
     "nameEn": "Nazarius and Celsus",
     "titleEn": "Martyrs",
     "bioEn": "Tradition says they were two martyrs of first-century Milan, whose graves were discovered by Saint Ambrose in the fourth century."
    }
   ]
  },
  {
   "m": 7,
   "d": 29,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Marta, Meryem ve Lazar",
     "title": "",
     "bio": "Beytanya’da yaşayan ve İncillerde Mesih İsa’nın yakın dostları olarak anlatılan üç kardeştir. Marta ev işleriyle uğraşırken Meryem İsa’nın ayaklarının dibine oturup O’nu dinledi. Lazar ise İsa’nın ölümden dirilttiği kişidir. Bu aile, Mesih İsa’nın insanlarla kurduğu dostluğun ve misafirperverliğin İncil’deki en canlı örneklerinden biridir.",
     "nameEn": "Martha, Mary, and Lazarus",
     "titleEn": "",
     "bioEn": "Three siblings who lived in Bethany, named in the Gospels as close friends of Christ. While Martha was busy with housework, Mary sat at Jesus's feet to listen to him; Lazarus is the one Jesus raised from the dead. This family is one of the Gospel's most vivid examples of Christ's human friendship and of hospitality."
    }
   ]
  },
  {
   "m": 7,
   "d": 30,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Petrus Chrysologus",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "V. yüzyılda Ravenna episkoposuydu ve kısa ama özlü, parlak vaazlarıyla tanındı. “Altın sözlü” anlamına gelen Chrysologus lakabı bu üslubundan gelir. Günümüze ulaşan pek çok kısa vaazı, o dönemde halka nasıl din eğitimi verildiğini gösteren değerli bir kaynaktır.",
     "nameEn": "Peter Chrysologus",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "A preacher who became bishop of Ravenna in the fifth century, known for his short, pithy and brilliant sermons. His nickname \"Chrysologus,\" meaning \"golden-worded,\" comes from this style; the many short sermons of his that survive today are a valuable source on the popular catechesis of his time."
    }
   ]
  },
  {
   "m": 7,
   "d": 31,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Loyolalı İgnatius",
     "title": "Rahip",
     "bio": "XVI. yüzyılda İspanya’da önce askerdi. Bir savaşta ağır yaralandı; iyileşirken okuduğu dinî kitaplar hayatını değiştirdi. Cizvit tarikatını kurdu. Yazdığı “Ruhani Egzersizler” kitabı, Katolik maneviyatının en etkili metinlerinden biri oldu. Eğitim ve misyonerlik alanında Kilise tarihini derinden etkiledi.",
     "nameEn": "Ignatius of Loyola",
     "titleEn": "Priest",
     "bioEn": "First a soldier in sixteenth-century Spain, he underwent a conversion through the religious books he read while recovering from a serious battle wound. He founded the Jesuit order; the \"Spiritual Exercises\" guide he wrote became one of the most influential texts of Catholic spirituality. He deeply shaped Church history in the fields of education and missionary work."
    }
   ]
  },
  {
   "m": 8,
   "d": 1,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Alfonso Maria de’ Liguori",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "XVII-XVIII. yüzyılda İtalya’da önce avukattı, sonra rahip oldu. Redemptorist tarikatını kurdu. Ahlak teolojisinde aşırı katılık ile aşırı gevşeklik arasında dengeli bir yol izleyen yazılarıyla tanınır; ayrıca pek çok ilahi ve dua kitabı yazdı. Günah çıkarma dinleyen rahiplerin ve ahlak teologlarının koruyucu azizidir.",
     "nameEn": "Alphonsus Liguori",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "First a lawyer in seventeenth- and eighteenth-century Italy, he became a priest. He founded the Redemptorist order and is known for his writings in moral theology, which steer a balanced path between excessive rigor and excessive laxity; he also wrote many hymns and devotional books. He is the patron saint of confessors and moral theologians."
    }
   ]
  },
  {
   "m": 8,
   "d": 2,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Vercellili Eusebius",
     "title": "Episkopos",
     "bio": "IV. yüzyılda İtalya’da Vercelli episkoposuydu. Athanasius ile birlikte Arianizme karşı mücadele ettiği için sürgüne gönderildi. Batı’da rahiplerin bir arada yaşamasını teşvik eden ilk episkoposlardan biri sayılır.",
     "nameEn": "Eusebius of Vercelli",
     "titleEn": "Bishop",
     "bioEn": "Bishop of Vercelli in Italy in the fourth century, exiled for fighting Arianism alongside Athanasius. He is considered one of the first bishops in the West to encourage priests to live in community."
    },
    {
     "name": "Pierre-Julien Eymard",
     "title": "Rahip",
     "bio": "XIX. yüzyılda Fransa’da yaşamış, Efkaristiya’ya derin bir bağlılıkla bağlı bir rahiptir. Efkaristiya’ya tapınmaya adanmış tarikatlar kurdu ve Efkaristiya’nın Kilise hayatının merkezi olduğunu vurguladı.",
     "nameEn": "Peter Julian Eymard",
     "titleEn": "Priest",
     "bioEn": "A priest who lived in nineteenth-century France, known for his deep devotion to the Eucharist. He founded orders devoted to Eucharistic adoration, emphasizing that the Blessed Sacrament is the center of the Church's life."
    }
   ]
  },
  {
   "m": 8,
   "d": 3,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Filipili Lydia",
     "title": "",
     "bio": "Elçilerin İşleri’ne göre mor kumaş ticareti yapan Filipili bir kadındır. Havari Pavlus’un Avrupa’da vaftiz ettiği ilk kişidir. Evi, şehirdeki ilk Hristiyan topluluğunun buluşma yeri oldu.",
     "nameEn": "Lydia of Philippi",
     "titleEn": "",
     "bioEn": "A dealer in purple cloth from Philippi who, according to the Acts of the Apostles, was the first person the Apostle Paul baptized in Europe. Her home became the meeting place of the city's first Christian community."
    }
   ]
  },
  {
   "m": 8,
   "d": 4,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Arslı Jean-Marie Vianney",
     "title": "Rahip",
     "bio": "XVIII-XIX. yüzyılda Fransa’da yaşamış bir köylü çocuğudur. Öğrenmekte çok zorlandı ve güçlükle rahip olabildi. Ars adlı küçük bir köyün papazı oldu. Günde on altı saate varan sürelerle günah çıkarma dinledi ve binlerce kişiyi imana geri kazandırdı. Bütün papazların koruyucu azizidir.",
     "nameEn": "John Vianney",
     "titleEn": "Priest",
     "bioEn": "A peasant boy in eighteenth- and nineteenth-century France who struggled greatly to learn and became a priest only with difficulty. Appointed pastor of the small village of Ars, he heard confessions for up to sixteen hours a day, winning thousands back to the faith. He is the patron saint of all parish priests."
    }
   ]
  },
  {
   "m": 8,
   "d": 5,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Büyük Meryem Bazilikası’nın Adanması",
     "title": "",
     "bio": "Roma’daki dört büyük papalık bazilikasından biri olan Santa Maria Maggiore’nin Meryem Ana’ya adanmasını anar. Bir efsaneye göre bazilikanın yeri, IV. yüzyılda ağustos ortasında yağan bir karla belirlendi. Efes Konsili’nin Meryem’i Tanrı Anası ilan etmesinden kısa süre sonra yapılan bu bazilika, Batı’nın en eski Meryem kiliselerinden biridir.",
     "nameEn": "The Dedication of the Basilica of Saint Mary Major",
     "titleEn": "",
     "bioEn": "Remembers the dedication to Mary of Santa Maria Maggiore, one of the four great papal basilicas in Rome; a legend links its founding in the fourth century to a miraculous snowfall. The present basilica, built shortly after the Council of Ephesus declared Mary the Mother of God, is one of the oldest Marian churches in the West."
    }
   ]
  },
  {
   "m": 8,
   "d": 6,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Rab’bin Başkalaşımı",
     "title": "",
     "bio": "İsa, Petrus’u, Yakup’u ve Yuhanna’yı yanına alıp yüksek bir dağa çıktı. Orada gözlerinin önünde görünüşü değişti ve ışıl ışıl parladı. Musa ve İlyas O’nunla konuştu, Peder’in sesi de şöyle dedi: “Bu benim sevgili Oğlum’dur, O’nu dinleyin.” Bu bayram o anı anar. İsa, çektiği acılardan önce tanrısal yüceliğini havarilerine bir kez göstermiş oldu.",
     "nameEn": "The Transfiguration of the Lord",
     "titleEn": "",
     "bioEn": "Remembers how Jesus was transfigured, shining with light, on Mount Tabor before Peter, James and John: he speaks with Moses and Elijah, and the Father's voice says, \"This is my beloved Son, hear ye him.\" Here, before his Passion, Jesus reveals his divine glory to his apostles."
    }
   ]
  },
  {
   "m": 8,
   "d": 7,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "II. Sixtus ve Yoldaşları",
     "title": "Papa ve Şehitler",
     "bio": "III. yüzyılda papaydı. İmparator Valerianus’un zulmü sırasında Ayin kutlarken yakalandı ve diyakozlarıyla birlikte idam edildi. Diyakozlarından biri olan Laurentius da birkaç gün sonra şehit edildi.",
     "nameEn": "Sixtus II and Companions",
     "titleEn": "Pope and Martyrs",
     "bioEn": "A pope captured while celebrating Mass during Emperor Valerian's persecution in the third century, and executed together with his deacons. One of his deacons, Lawrence, was himself martyred a few days later."
    },
    {
     "name": "Gaetano",
     "title": "Rahip",
     "bio": "XV-XVI. yüzyılda İtalya’da yaşamış bir rahiptir. Din adamlarının hayatını yenilemek için Theatin tarikatını kurdu. Yoksullar için hastaneler ve yardım kuruluşları açtı.",
     "nameEn": "Cajetan",
     "titleEn": "Priest",
     "bioEn": "A priest who lived in fifteenth- and sixteenth-century Italy and founded the Theatine order, aimed at reforming the life of the clergy. He established hospitals and charitable institutions to serve the poor."
    }
   ]
  },
  {
   "m": 8,
   "d": 8,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Dominik",
     "title": "Rahip",
     "bio": "XII-XIII. yüzyılda İspanya’da yaşadı. Güney Fransa’da yayılan Katarizm adlı yanlış öğretiye karşı vaaz ve öğretimle mücadele etmek için Dominiken tarikatını, yani Vaizler Tarikatı’nı kurdu. Sağlam teoloji eğitimini, yoksul ve gezici bir vaizlik hayatıyla birleştiren anlayışı, Kilise’nin öğretim geleneğini derinden etkiledi.",
     "nameEn": "Dominic",
     "titleEn": "Priest",
     "bioEn": "Born in twelfth-century Spain, he founded the Dominican order (the Order of Preachers) to combat the Catharist heresy of southern France through preaching and teaching. His model, which combined sound theological training with itinerant preaching lived in poverty, deeply shaped the Church's teaching tradition."
    }
   ]
  },
  {
   "m": 8,
   "d": 9,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Edith Stein (Haçın Teresa Benedicta’sı)",
     "title": "Bakire ve Şehit",
     "bio": "Almanya’da Yahudi bir ailede doğdu ve önemli bir filozof oldu. Yetişkin yaşta Katolik oldu ve Karmelit rahibesi oldu. Nazi Almanyası’nda Yahudi kökeni yüzünden tutuklandı ve Auschwitz’te öldürüldü. Hem bir filozof hem bir şehit olarak XX. yüzyılın en dikkat çekici azizelerinden biridir. Avrupa’nın koruyucu azizelerindendir.",
     "nameEn": "Teresa Benedicta of the Cross (Edith Stein)",
     "titleEn": "Virgin and Martyr",
     "bioEn": "Edith Stein, an important phenomenologist philosopher from a German-Jewish family, converted to Catholicism as an adult and became a Carmelite nun. She was arrested in Nazi Germany for her Jewish origins and killed at Auschwitz. As both philosopher and martyr, she is one of the most remarkable saints of the twentieth century; she has been declared a co-patron saint of Europe."
    }
   ]
  },
  {
   "m": 8,
   "d": 10,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Laurentius",
     "title": "Diyakoz ve Şehit",
     "bio": "III. yüzyılda Roma Kilisesi’nin diyakozuydu; kilisenin mali işlerinden ve yoksullara yardımdan sorumluydu. Geleneğe göre Romalı yetkililer Kilise’nin hazinelerini isteyince yoksulları ve hastaları göstererek “İşte Kilise’nin gerçek hazineleri” dedi. Bu cesareti yüzünden ızgara üzerinde yakılarak şehit edildi. Roma’nın en çok saygı gören ilk dönem şehitlerinden biridir.",
     "nameEn": "Lawrence",
     "titleEn": "Deacon and Martyr",
     "bioEn": "A deacon of the Church of Rome in the third century, responsible for its finances and aid to the poor. When Roman officials demanded the Church's treasures, tradition holds that he pointed to the poor and the sick and said, \"Here are the true treasures of the Church,\" and for this boldness was martyred by being burned on a gridiron. He is one of the most venerated early martyrs of Rome."
    }
   ]
  },
  {
   "m": 8,
   "d": 11,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Assisili Klara",
     "title": "Bakire",
     "bio": "XII-XIII. yüzyılda İtalya’da soylu bir ailede doğdu. Assisili Aziz Francis’in vaazlarından etkilendi ve on sekiz yaşında evinden ayrılarak onun yolunu izledi. Kadınlar için Yoksul Kızkardeşler (Klarisler) tarikatını kurdu ve sıkı yoksulluk idealini ısrarla savundu. Anlatılana göre hastayken uzaktaki bir Ayin’i duvarda bir görüntü olarak izledi; bu yüzden televizyonun koruyucu azizesi ilan edildi.",
     "nameEn": "Clare of Assisi",
     "titleEn": "Virgin",
     "bioEn": "Born to a noble family in twelfth- and thirteenth-century Italy, moved by the preaching of Saint Francis, she left home at eighteen to follow his way. She founded the order of \"Poor Sisters\" (the Poor Clares) for women, insisting firmly on the ideal of extreme poverty. She has been declared the patron saint of television, because while ill, she is said to have \"watched\" a distant Mass through a vision on her wall."
    }
   ]
  },
  {
   "m": 8,
   "d": 12,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Jeanne-Françoise de Chantal",
     "title": "Rahibe",
     "bio": "XVI-XVII. yüzyılda Fransa’da yaşamış, dul kalmış soylu bir kadındır. Aziz Fransuva de Sal’ın ruhani rehberliğinde, dul kadınların ve başka manastırlara kabul edilmeyen kadınların da girebileceği Ziyaret Rahibeleri tarikatını kurdu.",
     "nameEn": "Jane Frances de Chantal",
     "titleEn": "Religious",
     "bioEn": "A widowed noblewoman in sixteenth- and seventeenth-century France. Under the spiritual guidance of Saint Francis de Sales, she founded the Visitation Sisters, an order for widows and women who could not otherwise be accepted into a convent."
    }
   ]
  },
  {
   "m": 8,
   "d": 13,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Pontianus ve Hippolytus",
     "title": "Papa ve Rahip, Şehitler",
     "bio": "III. yüzyılda Pontianus papayken Hippolytus kendini karşı papa ilan etmişti. İmparator Maximinus döneminde ikisi de Sardinya’daki madenlere sürgün edildi. Orada barıştılar ve birlikte acı çekerek öldüler. Bu barışma, Kilise’nin birliğinin bölünmeden daha güçlü olduğunun güzel bir örneğidir.",
     "nameEn": "Pontian and Hippolytus",
     "titleEn": "Pope and Priest, Martyrs",
     "bioEn": "In the third century, while Pontian served as pope, a rival pope (antipope) named Hippolytus had been elected; both were exiled to the mines of Sardinia under Emperor Maximinus, where they reconciled and suffered and died together. Their reconciliation shows that the Church's unity is stronger even than its divisions."
    }
   ]
  },
  {
   "m": 8,
   "d": 14,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Maximilian Kolbe",
     "title": "Rahip ve Şehit",
     "bio": "XX. yüzyılda Polonya’da yaşamış bir Fransisken rahibidir. Auschwitz toplama kampında, ailesi olan bir mahkûmun yerine kendi isteğiyle açlık hücresine girdi ve orada öldü. “Sevginin şehidi” diye anılır; ailelerin ve gazetecilerin koruyucu azizlerindendir.",
     "nameEn": "Maximilian Kolbe",
     "titleEn": "Priest and Martyr",
     "bioEn": "A Franciscan friar in twentieth-century Poland. At Auschwitz concentration camp, he volunteered to take the place of a prisoner who had a family, and died in the starvation bunker. He is remembered as \"the martyr of love\"; he is among the patron saints of families and journalists."
    }
   ]
  },
  {
   "m": 8,
   "d": 15,
   "rank": "En Büyük Bayram",
   "saints": [
    {
     "name": "Meryem Ana’nın Göğe Alınışı",
     "title": "",
     "bio": "Bu bayram, Meryem Ana’nın dünyadaki hayatının sonunda bedeni ve ruhuyla birlikte cennetin yüceliğine alınmasını kutlar. Papa XII. Pius 1950’de bunu Kilise’nin resmî öğretisi olarak ilan etti. Bayram, Meryem’in Oğlu’nun dirilişinden ilk ve tam olarak pay alan kişi olduğunu ve bütün inananların gelecekteki dirilişinin bir işareti olduğunu vurgular.",
     "nameEn": "The Assumption of Mary",
     "titleEn": "",
     "bioEn": "Celebrates Mary's being taken up, body and soul, into the glory of heaven at the end of her earthly life. Pope Pius XII defined it as a dogma in 1950. Mary is the first and fullest fruit of her Son's resurrection, and a sign of the resurrection that awaits all believers."
    }
   ]
  },
  {
   "m": 8,
   "d": 16,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Macaristanlı István",
     "title": "Kral",
     "bio": "X-XI. yüzyılda Macaristan’ın ilk kralıydı. Ülkesini Hristiyanlığa kazandırmak için episkoposluklar ve manastırlar kurdu. Krallığını papanın gönderdiği bir tacla kurması, Macaristan’ı kalıcı olarak Hristiyan Avrupa’ya bağladı. Macaristan’ın koruyucu azizidir.",
     "nameEn": "Stephen of Hungary",
     "titleEn": "King",
     "bioEn": "First king of Hungary in the tenth and eleventh centuries, who founded dioceses and monasteries to Christianize his country. By founding his kingdom under a crown received from the Pope, he bound Hungary lastingly to Christian Europe. He is the patron saint of Hungary."
    }
   ]
  },
  {
   "m": 8,
   "d": 17,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Polonyalı Jacek",
     "title": "Rahip",
     "bio": "XII-XIII. yüzyılda Polonya’da yaşadı. Aziz Dominik’in Dominiken tarikatına bizzat kabul ettiği ilk Polonyalılardan biridir. Tarikatın Orta ve Doğu Avrupa’da yayılmasında öncü oldu.",
     "nameEn": "Hyacinth of Poland",
     "titleEn": "Priest",
     "bioEn": "A Pole who, in the thirteenth century, was among the first men Saint Dominic himself received into the Dominican order. He played a pioneering role in spreading the order across Central and Eastern Europe."
    }
   ]
  },
  {
   "m": 8,
   "d": 18,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Helena",
     "title": "",
     "bio": "III-IV. yüzyılda yaşadı ve İmparator I. Konstantin’in annesidir. İleri yaşta Kutsal Topraklar’a hacca gitti. Geleneğe göre Kudüs’te İsa’nın çarmıha gerildiği gerçek Haç’ı buldu ve birçok kilisenin yapımını başlattı.",
     "nameEn": "Helena",
     "titleEn": "",
     "bioEn": "Mother of Emperor Constantine I in the third and fourth centuries. In old age she made a pilgrimage to the Holy Land, where tradition holds she found the True Cross in Jerusalem and had many churches built."
    }
   ]
  },
  {
   "m": 8,
   "d": 19,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Jean Eudes",
     "title": "Rahip",
     "bio": "XVII. yüzyılda Fransa’da, rahiplerin eğitimi için ilk düzenli seminerlerden bazılarını kuran bir rahiptir. Mesih İsa’nın ve Meryem Ana’nın Kutsal Yürekleri’ne bağlılığın öncülerindendir; bu bağlılık sonraki yüzyıllarda bütün Kilise’ye yayıldı.",
     "nameEn": "John Eudes",
     "titleEn": "Priest",
     "bioEn": "A priest in seventeenth-century France who founded the first regular seminaries for the education of priests. He is a pioneer of devotion to the Sacred Hearts of Jesus and Mary, a devotion that spread widely in the Church in later centuries."
    }
   ]
  },
  {
   "m": 8,
   "d": 20,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Bernard de Clairvaux",
     "title": "Başrahip ve Kilise Doktoru",
     "bio": "XI-XII. yüzyılda Fransa’da yaşamış bir keşiştir ve Sisterciyen tarikatını en çok yayan kişidir. Kısa sürede altmışa yakın manastır kurdurdu; papalara ve krallara danışmanlık yaptı. Meryem Ana’ya derin bağlılığı ve akıcı vaazları yüzünden “Bal Dilli Doktor” diye anılır.",
     "nameEn": "Bernard of Clairvaux",
     "titleEn": "Abbot and Doctor of the Church",
     "bioEn": "A monk in eleventh- and twelfth-century France who became the most influential promoter of the Cistercian order. In a short time he founded nearly sixty monasteries, and he advised the popes and kings of his day. He is known for his deep devotion to Mary and for the flowing preaching style that earned him the nickname \"the Mellifluous Doctor.\""
    }
   ]
  },
  {
   "m": 8,
   "d": 21,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "X. Pius",
     "title": "Papa",
     "bio": "1903-1914 yılları arasında papalık yaptı. Sade bir köylü ailesinden geliyordu. Çocukların erken yaşta ilk Komünyon almasını teşvik etti, din eğitimini yaygınlaştırdı ve Ayin müziğini yeniledi. Sade yaşamıyla da tanınır.",
     "nameEn": "Pius X",
     "titleEn": "Pope",
     "bioEn": "Pope from 1903 to 1914, who came from a simple peasant family. He encouraged children to receive First Communion at an early age, spread catechetical education, and reformed liturgical music. He always lived simply."
    }
   ]
  },
  {
   "m": 8,
   "d": 22,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Meryem Ana’nın Kraliçeliği",
     "title": "",
     "bio": "Bu bayram Meryem Ana’yı, Oğlu Mesih İsa Kral olduğu için göğün ve yerin Kraliçesi olarak onurlandırır. Meryem Ana’nın Göğe Alınışı’ndan tam bir hafta sonra kutlanır; böylece Meryem’in kraliçeliğinin göğe alınışının doğal sonucu olduğunu vurgular.",
     "nameEn": "The Queenship of Mary",
     "titleEn": "",
     "bioEn": "Honors Mary as Queen of heaven and earth, because her Son, Christ, is King. It falls a week after the Assumption, and her queenship follows naturally from it."
    }
   ]
  },
  {
   "m": 8,
   "d": 23,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Limalı Rosa",
     "title": "Bakire",
     "bio": "XVI-XVII. yüzyılda Peru’nun Lima şehrinde yaşadı. Evlenmesi için yapılan baskılara rağmen kendini Allah’a adadı. Evinin bahçesinde inzivaya çekilerek yoğun bir dua ve perhiz hayatı sürdü. Amerika kıtasında aziz ilan edilen ilk kişidir; Latin Amerika’nın koruyucu azizesidir.",
     "nameEn": "Rose of Lima",
     "titleEn": "Virgin",
     "bioEn": "A young woman of Lima, Peru, in the sixteenth and seventeenth centuries. Despite pressure to marry, she chose to remain unmarried, withdrawing into a hermitage in her home's garden to live a life of intense prayer and fasting. She is the first saint canonized from the Americas; she is regarded as the patron saint of Latin America."
    }
   ]
  },
  {
   "m": 8,
   "d": 24,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Havari Bartalmay",
     "title": "",
     "bio": "Gelenek onu, Yuhanna İncili’nde İsa’nın “içinde hile olmayan gerçek bir İsrailli” dediği Natanael ile aynı kişi sayar. Geleneğe göre Müjde’yi Ermenistan’a ve Hindistan’a götürdü ve Ermenistan’da derisi yüzülerek şehit edildi. Bu yüzden resimlerde genellikle kendi derisini elinde tutarken gösterilir.",
     "nameEn": "Bartholomew the Apostle",
     "titleEn": "",
     "bioEn": "The apostle traditionally identified with Nathanael, described in the Gospel of John as \"an Israelite indeed, in whom there is no guile.\" Tradition holds that he carried the Gospel to Armenia and India, and was martyred in Armenia by being flayed alive; for this he is usually depicted in art holding his own skin."
    }
   ]
  },
  {
   "m": 8,
   "d": 25,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "IX. Louis",
     "title": "Fransa Kralı",
     "bio": "XIII. yüzyılda Fransa kralıydı. Adaleti, dindarlığı ve yoksullara düşkünlüğüyle döneminin en saygın hükümdarlarından biri sayılır. İki kez Haçlı Seferi’ne katıldı; ikincisinde Tunus’ta hastalanarak öldü. Fransa’nın koruyucu azizidir.",
     "nameEn": "Louis IX",
     "titleEn": "King of France",
     "bioEn": "King of France in the thirteenth century, considered one of the most respected rulers of his time for his justice, piety, and devotion to the poor. He took part in two Crusades, and died of illness in Tunisia on the second. He is the patron saint of France."
    },
    {
     "name": "José de Calasanz",
     "title": "Rahip",
     "bio": "XVI-XVII. yüzyılda yaşamış İspanyol bir rahiptir. Roma’da yoksul çocuklar için Avrupa’nın ilk ücretsiz halk okullarından birini açtı. Piyarist tarikatını kurdu ve eğitimin, sınıf farkı gözetmeden her çocuğun hakkı olduğunu savundu.",
     "nameEn": "Joseph Calasanz",
     "titleEn": "Priest",
     "bioEn": "A Spanish priest of the sixteenth and seventeenth centuries who opened one of Europe's first free public schools for poor children, in Rome. He founded the Piarist order, arguing that education is every child's right, regardless of class."
    }
   ]
  },
  {
   "m": 8,
   "d": 26,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Zephyrinus",
     "title": "Papa",
     "bio": "III. yüzyılın başında yirmi yıldan fazla papalık yaptı ve dönemin teolojik tartışmalarında Kilise’nin öğretisini korumaya çalıştı.",
     "nameEn": "Zephyrinus",
     "titleEn": "Pope",
     "bioEn": "Pope for more than twenty years in the early third century, who worked to preserve the Church's teaching amid the theological disputes of his time."
    }
   ]
  },
  {
   "m": 8,
   "d": 27,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Monica",
     "title": "",
     "bio": "IV. yüzyılda Kuzey Afrika’da yaşamış bir annedir. Oğlu Augustinus’un yıllarca sürdürdüğü yanlış inançlardan ve dünyevi hayattan dönüp Hristiyan olması için yıllarca gözyaşları içinde dua etti. Oğlunun imana geldiğini gördü ve kısa süre sonra öldü. Dua eden annelerin ve zor evliliklerin koruyucu azizesidir.",
     "nameEn": "Monica",
     "titleEn": "",
     "bioEn": "A mother in fourth-century North Africa who prayed for years, in tears, for her son Augustine to turn from the wayward, worldly life he was leading and become Christian. She saw her son's conversion and died shortly after. She is the patron saint of mothers who pray and of difficult marriages."
    }
   ]
  },
  {
   "m": 8,
   "d": 28,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Hipponlu Augustinus",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "IV-V. yüzyılda Kuzey Afrika’da yaşadı. Gençliğinde zevke düşkün ve şüpheci bir hayat sürdü. Annesi Monica’nın duaları ve Ambrosius’un vaazları sayesinde otuz iki yaşında hayatı değişti. Hippo episkoposu oldu. “İtiraflar” ve “Tanrı Devleti” gibi eserleriyle Batı Hristiyan düşüncesini en derinden etkileyen teologlardan biridir.",
     "nameEn": "Augustine of Hippo",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "A fourth- and fifth-century North African who spent his youth chasing pleasure and doubting everything, and was converted at thirty-two through his mother Monica's prayers and Ambrose's preaching. He became bishop of Hippo, and through works such as \"Confessions\" and \"The City of God\" became one of the theologians who most deeply shaped Western Christian thought."
    }
   ]
  },
  {
   "m": 8,
   "d": 29,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Vaftizci Yahya’nın Şehadeti",
     "title": "",
     "bio": "Markos İncili’ne göre Yahya, Kral Hirodes Antipas’ı kardeşinin karısıyla evlendiği için açıkça eleştirdi ve bu yüzden hapse atıldı. Hirodes’in üvey kızı bir şölende dans etti; Hirodes de ona istediği her şeyi vereceğine yemin etti. Kız Yahya’nın başını istedi ve Yahya idam edildi. Bu gün, gerçeği söylediği için canını veren peygamberin ölümünü anar.",
     "nameEn": "The Martyrdom of Saint John the Baptist",
     "titleEn": "",
     "bioEn": "According to the Gospel of Mark, John was imprisoned for openly criticizing King Herod Antipas for marrying his brother's wife. When Herod's stepdaughter danced for him, he rashly promised her anything she wanted, and she asked for John's head. The Church remembers a prophet who gave his life for telling the truth."
    }
   ]
  },
  {
   "m": 8,
   "d": 30,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Fiacre",
     "title": "Münzevi",
     "bio": "VII. yüzyılda İrlanda’da doğmuş bir keşiştir. Fransa’ya gitti ve orada bir bahçe ve misafirhane kurarak yoksullara ve yolculara hizmet etti. Bahçıvanların koruyucu azizidir.",
     "nameEn": "Fiacre",
     "titleEn": "Hermit",
     "bioEn": "A monk born in seventh-century Ireland who emigrated to France, where he established a garden and guesthouse to serve the poor and travelers. He is the patron saint of gardeners."
    }
   ]
  },
  {
   "m": 8,
   "d": 31,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Ramón Nonato",
     "title": "Rahip",
     "bio": "XIII. yüzyılda İspanya’da yaşamış bir Mercedarian rahibidir. Annesi doğum sırasında öldüğü ve karnından alınarak doğduğu için “doğmamış” anlamına gelen Nonnatus lakabıyla anılır. Müslümanların elinde esir olan Hristiyanları kurtarmak için kendini rehin olarak bıraktı. Ebelerin koruyucu azizidir.",
     "nameEn": "Raymond Nonnatus",
     "titleEn": "Priest",
     "bioEn": "A Mercedarian friar in thirteenth-century Spain, known by the nickname \"Nonnatus\" (\"not born\") because he was born by cesarean section after his mother's death. He offered himself as a hostage in ransom for Christian captives held by Muslims. He is the patron saint of midwives."
    }
   ]
  },
  {
   "m": 9,
   "d": 1,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Gilles",
     "title": "Münzevi",
     "bio": "VII-VIII. yüzyılda yaşadı. Yunanistan’da doğdu, Fransa’da bir ormanda inzivaya çekildi. Geleneğe göre yaralı bir geyiği korudu. Orta Çağ’ın en sevilen on dört “yardımcı aziz”inden biri oldu. Sakatların koruyucu azizidir.",
     "nameEn": "Giles",
     "titleEn": "Hermit",
     "bioEn": "Born in Greece, he went to live as a hermit in a forest in France in the seventh or eighth century. Tradition tells how he protected a wounded deer; in the Middle Ages he became one of the most beloved of the Fourteen Holy Helpers. He is the patron saint of the disabled."
    }
   ]
  },
  {
   "m": 9,
   "d": 2,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Avignonlu Agricol",
     "title": "Episkopos",
     "bio": "VII. yüzyılda Avignon episkoposuydu. Şehri sel felaketlerinden koruduğuna inanılır. Avignon’un koruyucu azizidir.",
     "nameEn": "Agricol of Avignon",
     "titleEn": "Bishop",
     "bioEn": "Bishop of Avignon in the seventh century, believed to have saved the city from floods; he is the patron saint of Avignon."
    }
   ]
  },
  {
   "m": 9,
   "d": 3,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Büyük Gregorius (I. Gregorius)",
     "title": "Papa ve Kilise Doktoru",
     "bio": "VI-VII. yüzyılda yaşadı. Roma valiliğini bırakıp keşiş oldu, sonra papa seçildi. İngiltere’ye misyonerler gönderdi ve Ayin müziğinin düzenlenmesinde etkili oldu; Gregoryen ilahileri onun adını taşır. Kendini “Allah’ın kullarının kulu” diye tanıtan alçakgönüllülüğüyle de tanınır. İlk büyük papa-teologlardan biridir.",
     "nameEn": "Gregory I (Gregory the Great)",
     "titleEn": "Pope and Doctor of the Church",
     "bioEn": "Pope in the sixth and seventh centuries who gave up his post as prefect of Rome to become a monk, then was elected pope. He sent missionaries to England, and was influential in organizing liturgical music (Gregorian chant bears his name). He is also known for his humble description of himself as \"servant of the servants of God\"; he is one of the first great pope-theologians."
    }
   ]
  },
  {
   "m": 9,
   "d": 4,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Rosalia",
     "title": "Bakire",
     "bio": "XII. yüzyılda Sicilya’da soylu bir ailede doğdu. Genç yaşta dünyevi hayatı bırakıp bir mağarada inzivaya çekildi. 1624’teki veba salgını sırasında kemikleri bulunup şehirde taşındı; bunun salgını durdurduğuna inanılır. Palermo’nun koruyucu azizesidir.",
     "nameEn": "Rosalia",
     "titleEn": "Virgin",
     "bioEn": "A saint of noble family in twelfth-century Sicily who left worldly life at a young age to withdraw into a cave. During the 1624 plague, the discovery of her bones and their procession through the city are believed to have stopped the epidemic; she is the patron saint of Palermo."
    }
   ]
  },
  {
   "m": 9,
   "d": 5,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Kalkütalı Rahibe Teresa",
     "title": "Rahibe",
     "bio": "Arnavut kökenli bir rahibedir ve Hindistan’da hizmet etti. Kalküta’nın en yoksul ve terk edilmiş insanlarına, ölmek üzere olanlara hizmet etmek için Sevgi Misyonerleri cemaatini kurdu. 1979’da Nobel Barış Ödülü’nü aldı. “En küçüklerde” Mesih İsa’yı görme çağrısıyla XX. yüzyılın en tanınan azizelerinden biri oldu.",
     "nameEn": "Teresa of Calcutta",
     "titleEn": "Religious",
     "bioEn": "An Albanian-born sister who served in India. She founded the Missionaries of Charity to serve Calcutta's poorest and most abandoned people, and those who were dying. She received the 1979 Nobel Peace Prize, and became one of the twentieth century's most recognized saints for her call to see Christ in \"the least of these.\""
    }
   ]
  },
  {
   "m": 9,
   "d": 6,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Füssenli Magnus",
     "title": "Rahip",
     "bio": "VIII. yüzyılda bugünkü Almanya’nın Bavyera bölgesinde misyonerlik yapmış bir keşiştir. Bölgedeki ejderha efsaneleriyle birlikte anılır; çiftçilerin koruyucu azizlerindendir.",
     "nameEn": "Magnus of Füssen",
     "titleEn": "Priest",
     "bioEn": "A monk who did missionary work in eighth-century Germany (Bavaria). He is associated with local dragon legends; he is one of the patron saints of farmers."
    }
   ]
  },
  {
   "m": 9,
   "d": 7,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Regina",
     "title": "Bakire ve Şehit",
     "bio": "III. yüzyılda Galya’da, bugünkü Fransa’da yaşadı. Hristiyan olduğu için babası onu reddetti ve bir çobanın yanında büyüdü. Evlenmeyi reddettiği için genç yaşta şehit edildi.",
     "nameEn": "Regina",
     "titleEn": "Virgin and Martyr",
     "bioEn": "A young saint in third-century Gaul (France), rejected by her father for becoming Christian, then raised by a shepherd, and martyred for refusing marriage."
    }
   ]
  },
  {
   "m": 9,
   "d": 8,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Meryem Ana’nın Doğumu",
     "title": "",
     "bio": "Kutsal Kitap Meryem’in doğumunu anlatmaz, ama ilk Kilise geleneği bu olayı bu günde anar. Meryem’in doğumu, Allah’ın insanlığı kurtarma planında yeni bir umudun başlangıcı olarak kutlanır. Bayram, aralıktaki Lekesiz Gebe Kalınış bayramından tam dokuz ay sonra gelir.",
     "nameEn": "The Nativity of Mary",
     "titleEn": "",
     "bioEn": "Scripture doesn't tell of Mary's birth, but since early times the Church has celebrated it on this day. Her birth is celebrated as a new dawn of hope in God's plan to save humanity; it falls exactly nine months after the feast of the Immaculate Conception on December 8."
    }
   ]
  },
  {
   "m": 9,
   "d": 9,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Pedro Claver",
     "title": "Rahip",
     "bio": "XVI-XVII. yüzyılda yaşamış İspanyol bir Cizvit rahibidir. Bugünkü Kolombiya’daki Cartagena limanına gelen köle gemilerini karşıladı. İnsanlık dışı koşullarda taşınan Afrikalı kölelere tıbbi bakım, yiyecek ve ruhani teselli verdi. Kendini “Afrikalıların sonsuza dek kölesi” diye tanıttı. Köleleştirilmiş halkların koruyucu azizidir.",
     "nameEn": "Peter Claver",
     "titleEn": "Priest",
     "bioEn": "A Jesuit priest born in sixteenth- and seventeenth-century Spain; he met slave ships arriving at the port of Cartagena in what is now Colombia, offering medical care, food, and spiritual comfort to Africans transported in inhuman conditions. He called himself \"the slave of the slaves forever\"; he is regarded as the patron saint of enslaved peoples."
    }
   ]
  },
  {
   "m": 9,
   "d": 10,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Tolentinolu Nicola",
     "title": "Rahip",
     "bio": "XIII-XIV. yüzyılda İtalya’da yaşamış bir Augustinus tarikatı rahibidir. Araftaki ruhlar için özel bir bağlılıkla dua etti. Anlatılana göre ölüler için ekmek kutsayıp dağıtırdı.",
     "nameEn": "Nicholas of Tolentino",
     "titleEn": "Priest",
     "bioEn": "An Augustinian friar in thirteenth- and fourteenth-century Italy. He is said to have prayed with special devotion for the souls in Purgatory, blessing and distributing bread for the dead."
    }
   ]
  },
  {
   "m": 9,
   "d": 11,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Protus ve Hyacinthus",
     "title": "Şehitler",
     "bio": "III. yüzyılda Roma’da yaşamış iki kardeştir. Azize Eugenia’nın hizmetkârlarıydılar, Hristiyan oldular ve onunla birlikte şehit edildiler.",
     "nameEn": "Protus and Hyacinth",
     "titleEn": "Martyrs",
     "bioEn": "Two brothers in third-century Rome who converted to Christianity as servants of Saint Eugenia and were martyred together with her."
    }
   ]
  },
  {
   "m": 9,
   "d": 12,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Meryem Ana’nın Kutsal Adı",
     "title": "",
     "bio": "Bu gün Meryem Ana’nın adına duyulan bağlılığı kutlar. 1683’te Viyana kuşatmasının kaldırılması Meryem’in duasına bağlandı ve bu anma bütün Kilise’ye yayıldı. Bir isim, taşıyanın bütün varlığını temsil eder; bu bayram da Meryem’in kim olduğunu, yani Allah’ın lütfuyla dolu kişi olduğunu anar.",
     "nameEn": "The Holy Name of Mary",
     "titleEn": "",
     "bioEn": "This feast of the Holy Name of Mary spread to the whole Church after the lifting of the Siege of Vienna in 1683 was attributed to her intercession. In the Bible a name stands for the whole person, so this feast honors who Mary is: the one full of grace."
    }
   ]
  },
  {
   "m": 9,
   "d": 13,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Altın Ağızlı Yuhanna",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "IV-V. yüzyılda Konstantinopolis episkoposuydu. Olağanüstü vaazları yüzünden “Altın Ağızlı” anlamına gelen Chrysostomos lakabını aldı. Saraydaki ahlaksızlığı ve zenginlerin yoksullara duyarsızlığını sert bir dille eleştirdiği için sürgüne gönderildi ve sürgünde öldü. Doğu Kilisesi’nin en büyük vaizlerinden ve teologlarından biridir.",
     "nameEn": "John Chrysostom",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "Bishop of Constantinople in the fourth and fifth centuries, earning the nickname \"Chrysostom\" (\"golden-mouthed\") for his extraordinary gift of preaching. He was exiled for sharply criticizing the immorality of the court and the indifference of the rich toward the poor, and died in exile. He is considered one of the greatest preachers and theologians of the Eastern Church."
    }
   ]
  },
  {
   "m": 9,
   "d": 14,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Kutsal Haç’ın Yüceltilmesi",
     "title": "",
     "bio": "İmparator Konstantin’in annesi Azize Helena’nın, 326’da Kudüs’te Mesih İsa’nın çarmıha gerildiği gerçek Haç’ı bulduğuna inanılır. Bu bayram, o olayı ve 335’te o yerde yapılan bazilikanın kutsanmasını anar. Kilise, bir işkence aracı olan çarmıhı kurtuluşun ve zaferin işareti olarak yüceltir.",
     "nameEn": "The Exaltation of the Holy Cross",
     "titleEn": "",
     "bioEn": "Remembers the finding in Jerusalem of the True Cross on which Christ was crucified, traditionally credited to Saint Helena, mother of Emperor Constantine, in 326, and the dedication in 335 of the basilica built on that site. The Church exalts the cross, an instrument of torture, as a sign of salvation and victory."
    }
   ]
  },
  {
   "m": 9,
   "d": 15,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Acılı Meryem Ana",
     "title": "",
     "bio": "Bu gün, Meryem Ana’nın Oğlu’nun çektiği acılar boyunca yaşadığı iç acıyı anar. Gelenek yedi acı sayar: Simeon’un kehaneti, Mısır’a kaçış, kaybolan İsa’nın aranması, çarmıha giden yolda karşılaşma, çarmıhın dibinde durma, İsa’nın bedeninin kucağına verilmesi ve mezara konması. Bu anmanın, Kutsal Haç’ın Yüceltilmesi’nden bir gün sonra olması tesadüf değildir.",
     "nameEn": "Our Lady of Sorrows",
     "titleEn": "",
     "bioEn": "Remembers what Mary suffered with her Son in his Passion; tradition counts seven distinct sorrows (Simeon's prophecy, the flight into Egypt, the search for the lost Jesus, meeting him on the way to the cross, standing at the foot of the cross, receiving his body, and his burial). It is no coincidence that it is celebrated one day after the Exaltation of the Holy Cross."
    }
   ]
  },
  {
   "m": 9,
   "d": 16,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Cornelius ve Cyprianus",
     "title": "Papa ve Episkopos, Şehitler",
     "bio": "III. yüzyılda yaşamış iki dosttur. İmparator Decius’un zulmünden sonra, zulüm sırasında imanını inkâr edip Kilise’ye dönmek isteyenlerin nasıl kabul edileceği tartışmasında ikisi de ılımlı bir yol savundu. Cornelius papa, Cyprianus ise Kartaca episkoposuydu. İkisi de sonraki zulümlerde şehit edildi.",
     "nameEn": "Cornelius and Cyprian",
     "titleEn": "Pope and Bishop, Martyrs",
     "bioEn": "Two friends in the third century who together defended a moderate position on how those who wished to return to the Church after Emperor Decius's persecution should be received. Cornelius was pope, and Cyprian bishop of Carthage; both were later martyred in further persecutions."
    }
   ]
  },
  {
   "m": 9,
   "d": 17,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Roberto Bellarmino",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "XVI-XVII. yüzyılda İtalya’da yaşamış Cizvit bir kardinaldir. Protestan Reformu’na karşı Katolik inancını akılla ve düzenli bir şekilde savunan yazılarıyla tanınır. Ayrıca din eğitiminde uzun süre kullanılan, sade ve açık bir katekizm yazdı.",
     "nameEn": "Robert Bellarmine",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "A Jesuit cardinal who lived in sixteenth- and seventeenth-century Italy. He is known for his writings defending the Catholic faith rationally and systematically against the Protestant Reformation; he also wrote a simple, clear catechism used in catechetical education."
    },
    {
     "name": "Bingenli Hildegard",
     "title": "Bakire ve Kilise Doktoru",
     "bio": "XII. yüzyılda Almanya’da yaşamış bir Benedikten başrahibesidir. Mistik görümleri, teoloji, tıp, müzik ve doğa bilimleri üzerine eserler bıraktı. Bestelediği ilahiler bugün de söylenir. 2012’de Papa XVI. Benedictus onu Kilise Doktoru ilan etti.",
     "nameEn": "Hildegard of Bingen",
     "titleEn": "Virgin and Doctor of the Church",
     "bioEn": "A Benedictine abbess who lived in twelfth-century Germany; she left works on mystical visions, theology, medicine, music, and the natural sciences. The hymns she composed are still performed today. She was declared a Doctor of the Church by Pope Benedict XVI in 2012."
    }
   ]
  },
  {
   "m": 9,
   "d": 18,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Cupertinolu Giuseppe",
     "title": "Rahip",
     "bio": "XVII. yüzyılda İtalya’da yaşamış bir Fransiskendir. Çocukken beceriksiz ve dalgın biri olarak görüldü ve güçlükle rahip olabildi. Dua ederken sık sık vecde gelip yerden yükseldiği anlatılır; bu olaylar birçok tanığın önünde yaşandı ve kayıtlara geçti. Bu yüzden “Uçan Aziz” diye anılır. Havacıların, pilotların ve sınava girecek öğrencilerin koruyucu azizidir.",
     "nameEn": "Joseph of Cupertino",
     "titleEn": "Priest",
     "bioEn": "A Franciscan in seventeenth-century Italy, considered clumsy and absent-minded as a child, who became a priest only with great difficulty. He is called \"the Flying Saint\" because, as many witnesses recorded, he often rose from the ground in ecstasy during prayer. He is the patron saint of aviators, pilots, and students taking exams."
    }
   ]
  },
  {
   "m": 9,
   "d": 19,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Ianuarius",
     "title": "Episkopos ve Şehit",
     "bio": "IV. yüzyılda İtalya’da Benevento episkoposuydu ve İmparator Diocletianus’un zulmü sırasında şehit edildi. Napoli’de, onun kanı olduğuna inanılan bir şişe saklanır ve bu kanın belirli günlerde sıvılaştığı anlatılır. Napoli’nin koruyucu azizidir.",
     "nameEn": "Januarius",
     "titleEn": "Bishop and Martyr",
     "bioEn": "Bishop of Benevento in Italy in the fourth century, martyred during Emperor Diocletian's persecution. A vessel kept in Naples, believed by tradition to hold his blood, is said to liquefy on certain days; he is the patron saint of Naples."
    }
   ]
  },
  {
   "m": 9,
   "d": 20,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Andreas Kim Tae-gŏn, Paulus Chŏng Ha-sang ve Yoldaşları",
     "title": "Şehitler",
     "bio": "1839-1867 yılları arasında Kore’de, Hristiyanlığın şiddetle bastırıldığı bir dönemde şehit edilen yüz üç Koreliyi anarız. Andreas Kim Tae-gŏn Kore’nin ilk yerli rahibiydi; Paulus Chŏng Ha-sang ise öncü bir sıradan Katolikti. İmanlarından dönmeyi reddedip canlarını veren bu insanlar, bugün Kore Katolik Kilisesi’nin kökleridir.",
     "nameEn": "Andrew Kim Tae-gon, Paul Chong Ha-sang, and Companions",
     "titleEn": "Martyrs",
     "bioEn": "Remembers a hundred and three Koreans martyred between 1839 and 1867, a period when Christianity was violently suppressed in Korea. Kim Tae-gon was Korea's first native priest; Chong Ha-sang was a lay pioneer. They refused to give up their faith and paid with their lives, and they are the roots of the Catholic Church in Korea today."
    }
   ]
  },
  {
   "m": 9,
   "d": 21,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Havari ve İncil Yazarı Matta",
     "title": "",
     "bio": "İncillere göre vergi toplayıcısıydı. İsa ona “Ardımdan gel” deyince her şeyi bırakıp O’nu izledi. Gelenek onu Matta İncili’nin yazarı sayar. Bu İncil, özellikle Yahudi okurlara Mesih İsa’nın Eski Ahit peygamberliklerini yerine getirdiğini göstermeyi amaçlar.",
     "nameEn": "Matthew the Apostle and Evangelist",
     "titleEn": "",
     "bioEn": "According to the Gospels, a tax collector who left everything to follow Jesus at his call, \"Follow me.\" He is traditionally held to be the author of the Gospel of Matthew, which aims to show Jewish readers that Christ fulfilled the Old Testament prophecies."
    }
   ]
  },
  {
   "m": 9,
   "d": 22,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Tomás de Villanueva",
     "title": "Episkopos",
     "bio": "XVI. yüzyılda İspanya’da Valencia başepiskoposu olan bir Augustinus tarikatı keşişidir. Anlatılana göre gelirinin neredeyse tamamını yoksullara dağıttı ve sarayını yetimhaneye çevirdi. “Yoksulların Babası” diye anılır.",
     "nameEn": "Thomas of Villanova",
     "titleEn": "Bishop",
     "bioEn": "An Augustinian who became bishop of Valencia in sixteenth-century Spain. He is said to have given away nearly all his income to the poor and turned his palace into an orphanage; he is remembered as \"the Father of the Poor.\""
    }
   ]
  },
  {
   "m": 9,
   "d": 23,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Padre Pio (Pietrelcinalı Pio)",
     "title": "Rahip",
     "bio": "XIX-XX. yüzyılda İtalya’da yaşamış bir Kapuçin rahibidir. Elli yıldan fazla, Mesih İsa’nın çarmıh yaralarına benzeyen yaralar (stigmata) taşıdığı bildirilir. Günde saatlerce günah çıkarma dinledi ve hastalar için büyük bir hastane kurdurdu. XX. yüzyılın en sevilen azizlerinden biridir ve dünyanın her yerinde hâlâ ona büyük bir bağlılık vardır.",
     "nameEn": "Pio of Pietrelcina (Padre Pio)",
     "titleEn": "Priest",
     "bioEn": "A Capuchin friar who lived in nineteenth- and twentieth-century Italy. For more than fifty years he is reported to have borne marks resembling the wounds of Christ's crucifixion (stigmata); he spent hours a day hearing confessions and had a great hospital built for the sick. He is one of the most beloved saints of the twentieth century, still receiving intense devotion worldwide."
    }
   ]
  },
  {
   "m": 9,
   "d": 24,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Meryem Ana, Tutsakların Kurtarıcısı",
     "title": "",
     "bio": "XIII. yüzyılda Aziz Pedro Nolasco, Müslümanların elinde esir olan Hristiyanları fidye ödeyerek kurtarmak için Mercedarian tarikatını kurdu. Bu gün, tarikatın kuruluşuna yol açan görümü anar. Bu bağlılık bugün de esirlerin özgürlüğü için dua etmeye vesile olur.",
     "nameEn": "Our Lady of Ransom",
     "titleEn": "",
     "bioEn": "Remembers the vision that led Saint Peter Nolasco to found the Mercedarian order in the thirteenth century, to ransom Christians held captive by Muslims. It is still a day of prayer for all who are held captive."
    }
   ]
  },
  {
   "m": 9,
   "d": 25,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Radonejli Sergiy",
     "title": "Başrahip",
     "bio": "XIV. yüzyılda Rusya’da, bugün de önemli bir hac merkezi olan Kutsal Üçlü Manastırı’nı (Troitse-Sergiyeva Lavra) kuran bir keşiştir. Rus manastırcılığının babası ve Rusya’nın koruyucu azizlerinden biri sayılır.",
     "nameEn": "Sergius of Radonezh",
     "titleEn": "Abbot",
     "bioEn": "A monk in fourteenth-century Russia who founded the Holy Trinity-St. Sergius Lavra, still an important pilgrimage center today. He is considered the father of Russian monasticism and one of the patron saints of Russia."
    }
   ]
  },
  {
   "m": 9,
   "d": 26,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Kozmas ve Damianos",
     "title": "Şehitler",
     "bio": "Geleneğe göre III-IV. yüzyılda Küçük Asya’da, bugünkü Türkiye topraklarında yaşamış ikiz kardeşlerdir. İkisi de hekimdi ve hastaları para almadan tedavi ettikleri için “parasız hekimler” diye anılırlar. İmparator Diocletianus’un zulmü sırasında şehit edildiler. Hekimlerin ve eczacıların koruyucu azizleridir.",
     "nameEn": "Cosmas and Damian",
     "titleEn": "Martyrs",
     "bioEn": "Twin brothers trained in medicine who, tradition holds, lived around the third to fourth century in Asia Minor (modern Turkey). They are called \"the moneyless ones\" for treating the sick free of charge; they were martyred during Emperor Diocletian's persecution. They are the patron saints of physicians and pharmacists."
    }
   ]
  },
  {
   "m": 9,
   "d": 27,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Vincent de Paul",
     "title": "Rahip",
     "bio": "XVI-XVII. yüzyılda Fransa’da yaşadı. Genç bir rahipken korsanlar tarafından yakalanıp bir süre köle olarak tutuldu. Sonra hayatını yoksullara, mahkûmlara ve terk edilmiş çocuklara adadı. Rahiplerin yetiştirilmesi için Lazaristleri, kadınların yoksullara hizmet etmesi için de Merhamet Kızları’nı kurdu. Bütün yardım kuruluşlarının koruyucu azizidir.",
     "nameEn": "Vincent de Paul",
     "titleEn": "Priest",
     "bioEn": "A priest in sixteenth- and seventeenth-century France who, as a young priest, was held as a slave for a time, then devoted his life to the poor, prisoners, and abandoned children. He founded the Lazarists for the training of priests, and the Daughters of Charity for women's service to the poor. He is regarded as the patron saint of all charitable organizations."
    }
   ]
  },
  {
   "m": 9,
   "d": 28,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Václav",
     "title": "Şehit",
     "bio": "X. yüzyılda Bohemya’nın, yani bugünkü Çekya’nın dükü oldu ve ülkesinde Hristiyanlığı güçlendirmeye çalıştı. Tahtı ele geçirmek isteyen kendi kardeşi tarafından öldürüldü. Çekya’nın koruyucu azizidir ve adil, dindar bir hükümdarın simgesi olmuştur.",
     "nameEn": "Wenceslaus",
     "titleEn": "Martyr",
     "bioEn": "Duke of Bohemia (modern Czech Republic) in the tenth century, who worked to strengthen Christianity in his country and was killed by his own brother, who wanted to seize the throne. He is the patron saint of the Czech Republic, and a model of the just and devout ruler."
    },
    {
     "name": "Lorenzo Ruiz ve Yoldaşları",
     "title": "Şehitler",
     "bio": "1633-1637 yılları arasında Japonya’da şehit edilen bir grup misyoneri ve yerli Hristiyanı anarız. Aralarında Filipinli bir aile babası olan Lorenzo Ruiz de vardı. Ruiz, Filipinler’in aziz ilan edilen ilk şehididir.",
     "nameEn": "Lorenzo Ruiz and Companions",
     "titleEn": "Martyrs",
     "bioEn": "A group of missionaries and native Christians martyred in Japan between 1633 and 1637, among them Lorenzo Ruiz, a Filipino lay father. Ruiz is the first canonized martyr from the Philippines."
    }
   ]
  },
  {
   "m": 9,
   "d": 29,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Başmelekler Mikael, Cebrail ve Rafael",
     "title": "",
     "bio": "Kutsal Kitap’ta adı geçen üç başmeleği birlikte anarız. Mikael (“Allah gibisi kim?”), kötülüğe karşı Allah’ın ordularının başıdır. Cebrail, Meryem Ana’ya müjdeyi getiren habercidir. Rafael ise Tobit Kitabı’nda genç Tobiya’ya yol arkadaşlığı eden ve şifa veren melektir. Üçü de Allah’ın insanlara doğrudan yaklaştığı anlarda hizmet eder.",
     "nameEn": "The Archangels Michael, Gabriel, and Raphael",
     "titleEn": "",
     "bioEn": "Honors together the three archangels named in Scripture. Michael (\"who is like God\") leads God's armies against evil; Gabriel is the messenger who brings the Annunciation to Mary; and Raphael is the angel in the Book of Tobit who accompanies and heals the young Tobias. All three appear at moments when God speaks directly to people."
    }
   ]
  },
  {
   "m": 9,
   "d": 30,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Hieronymus",
     "title": "Rahip ve Kilise Doktoru",
     "bio": "IV-V. yüzyılda yaşamış bir bilgindir. Kutsal Kitap’ı İbranice ve Yunanca asıllarından Latinceye çevirdi. Vulgata denen bu çeviri, yüzyıllar boyunca Batı Kilisesi’nin resmî Kutsal Kitap metni oldu. Beytlehem’de inzivada yaşadı. Sert ve tartışmacı kişiliğiyle de bilinir. “Kutsal Kitap’ı bilmemek Mesih’i bilmemektir” sözü ona aittir.",
     "nameEn": "Jerome",
     "titleEn": "Priest and Doctor of the Church",
     "bioEn": "A scholar who lived in the fourth and fifth centuries and translated Scripture from its Hebrew and Greek originals into Latin; this translation (the Vulgate) was used for centuries as the official Scripture text of the Western Church. He lived in seclusion in Bethlehem. He was known for his sharp, argumentative character, and for the saying, \"ignorance of Scripture is ignorance of Christ.\""
    }
   ]
  },
  {
   "m": 10,
   "d": 1,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Lisieux’lü Küçük Teresa",
     "title": "Bakire ve Kilise Doktoru",
     "bio": "XIX. yüzyılda Fransa’da yaşamış bir Karmelit rahibesidir. On beş yaşında manastıra girdi ve yirmi dört yaşında veremden öldü. “Küçük Yol” dediği anlayışla tanınır: Büyük işler yapmak yerine, günlük küçük işleri büyük bir sevgiyle yapmak. Ölümünden sonra yayımlanan “Bir Ruhun Hikâyesi” adlı hatıraları dünyanın her yerinde büyük etki yarattı. Misyonların koruyucu azizesi ve Kilise Doktoru’dur.",
     "nameEn": "Thérèse of the Child Jesus (Thérèse of Lisieux)",
     "titleEn": "Virgin and Doctor of the Church",
     "bioEn": "A nun in nineteenth-century France who entered a Carmelite convent at fifteen and died of tuberculosis at twenty-four. She is known for what she called the \"Little Way,\" doing small daily acts with great love rather than great deeds. Her autobiography, \"The Story of a Soul,\" published after her death, has had a great worldwide impact. She is the patron saint of missions and a Doctor of the Church."
    }
   ]
  },
  {
   "m": 10,
   "d": 2,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Koruyucu Melekler",
     "title": "",
     "bio": "Allah’ın her insana onu korumak ve doğru yola yönlendirmek için bir melek verdiğine inanılır. Bu gün o melekleri anar. Dayanağı, Mesih İsa’nın küçüklerin meleklerinin gökte her zaman Peder’in yüzünü gördüğünü söylemesidir. Çocukları özellikle koruyucu meleklerine emanet etmek eski bir gelenektir.",
     "nameEn": "The Guardian Angels",
     "titleEn": "",
     "bioEn": "Honors the angel God gives to every person to protect them and keep them on the right path. It rests on Christ's words about the little ones: \"their angels... always behold the face of my Father who is in heaven.\" Traditionally, children in particular are entrusted to their guardian angels."
    }
   ]
  },
  {
   "m": 10,
   "d": 3,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Brogneli Gérard",
     "title": "Başrahip",
     "bio": "X. yüzyılda bugünkü Belçika’da yaşamış bir başrahiptir. Cluny’den bağımsız, ama ona benzer bir manastır yenileme hareketi başlattı.",
     "nameEn": "Gerard of Brogne",
     "titleEn": "Abbot",
     "bioEn": "An abbot who, in tenth-century Belgium, started a monastic reform movement similar to, but independent of, Cluny."
    }
   ]
  },
  {
   "m": 10,
   "d": 4,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Assisili Fransuva",
     "title": "",
     "bio": "XII-XIII. yüzyılda İtalya’da zengin bir tüccarın oğlu olarak doğdu. Gençliğinde savaşa katıldı ve esir düştü; bundan sonra hayatı değişti. Her şeyi bırakıp Müjde’yi yoksulluk içinde yaşamaya karar verdi. Fransisken tarikatını kurdu. Bütün yaratılışa duyduğu sevgiyle tanınır: Güneş’e “Güneş Kardeş”, suya “Su Kızkardeş” derdi. Çevrenin ve hayvanların koruyucu azizidir; İtalya’nın da koruyucu azizidir.",
     "nameEn": "Francis of Assisi",
     "titleEn": "",
     "bioEn": "Born the son of a wealthy merchant in twelfth- and thirteenth-century Italy, he underwent a conversion after war and captivity in his youth, and devoted himself to living the Gospel in poverty, giving up everything. He founded the Franciscan order, known for his love of all creation (\"Brother Sun,\" \"Sister Water\"). He is the patron saint of the environment and of animals, and the national saint of Italy."
    }
   ]
  },
  {
   "m": 10,
   "d": 5,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Faustina Kowalska",
     "title": "Rahibe",
     "bio": "XX. yüzyılda Polonya’da yaşamış bir rahibedir. Mesih İsa’nın ona göründüğü ve İlahi Merhamet mesajını dünyaya duyurmasını istediği görümlerle tanınır. “İlahi Merhamet” resmi ve ona bağlı dua, onun tuttuğu günlüğe dayanır. Papa II. Yuhanna Pavlus onu 2000 yılında aziz ilan etti ve aynı gün Paskalya’dan sonraki ilk Pazar’ı İlahi Merhamet Pazarı olarak bütün Kilise’ye verdi.",
     "nameEn": "Faustina Kowalska",
     "titleEn": "Religious",
     "bioEn": "A sister who lived in twentieth-century Poland. She is known for the visions in which Christ appeared to her and asked her to proclaim the message of Divine Mercy to the world; the \"Divine Mercy\" image and the Chaplet of Divine Mercy come from the diary she kept. Pope John Paul II canonized her in 2000 and on the same day gave the whole Church the Sunday after Easter as Divine Mercy Sunday."
    },
    {
     "name": "Plasidus ve Maurus",
     "title": "Aziz Benedictus’un öğrencileri",
     "bio": "VI. yüzyılda Roma’nın soylu ailelerinden iki çocuk olarak Subiaco’da Aziz Benedictus’un yanına verildiler. Büyük Gregorius’un anlattığına göre Plasidus göle düşüp boğulmak üzereyken Benedictus’un sözüyle Maurus suyun üzerinde koşarak onu kurtardı. Gelenek, Maurus’un Benedictus’un kuralını Fransa’ya taşıdığını anlatır.",
     "nameEn": "Placidus and Maurus",
     "titleEn": "Disciples of Saint Benedict",
     "bioEn": "Two boys from noble Roman families, they were entrusted to Saint Benedict at Subiaco in the sixth century. As Gregory the Great tells it, when Placidus fell into the lake and was about to drown, Maurus, at Benedict's word, ran across the water and pulled him out. Tradition says Maurus brought Benedict's Rule to France."
    }
   ]
  },
  {
   "m": 10,
   "d": 6,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Bruno",
     "title": "Rahip",
     "bio": "XI. yüzyılda Almanya’da doğdu ve önce ünlü bir teoloji hocasıydı. Dünyevi hayattan uzaklaşıp Fransa’nın ıssız Chartreuse bölgesinde inzivaya çekildi. Sessizliğe ve yalnızlığa dayanan Kartüzyen tarikatını kurdu.",
     "nameEn": "Bruno",
     "titleEn": "Priest",
     "bioEn": "First a renowned theology teacher in eleventh-century Germany, he withdrew from worldly life to become a hermit in the remote Chartreuse region of France. He founded the Carthusian order, based on silence and a life of solitude."
    },
    {
     "name": "Marie Rose Durocher",
     "title": "Bakire",
     "bio": "XIX. yüzyılda Kanada’da yaşadı ve kızların eğitimine adanmış İsa ve Meryem’in Kutsal Adları Rahibeleri cemaatini kurdu. Kısa ama çok verimli bir hizmet hayatı oldu.",
     "nameEn": "Marie Rose Durocher",
     "titleEn": "Virgin",
     "bioEn": "A Canadian woman of the nineteenth century who founded the Sisters of the Holy Names of Jesus and Mary, devoted to the education of girls. She led a short but intense life of service."
    }
   ]
  },
  {
   "m": 10,
   "d": 7,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Tesbih Meryem’i",
     "title": "",
     "bio": "1571’de Lepanto Deniz Savaşı’nda Hristiyan donanması beklenmedik bir zafer kazandı. Bu zafer, o gün Roma’da topluca edilen tesbih duasına bağlandı ve Papa V. Pius bu bayramı koydu. Bayram, Mesih İsa’nın hayatındaki olayları Meryem Ana ile birlikte düşünmenin bir yolu olan tesbih duasının Kilise’deki önemini vurgular.",
     "nameEn": "Our Lady of the Rosary",
     "titleEn": "",
     "bioEn": "Pope Pius V set up this feast after the Christian fleet's unexpected victory at Lepanto in 1571, which he credited to the Rosary prayed all over Rome that day. It reminds the Church that the Rosary is a way of thinking over the life of Christ together with Mary."
    }
   ]
  },
  {
   "m": 10,
   "d": 8,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Tövbekâr Pelagia",
     "title": "",
     "bio": "Geleneğe göre Antakya’da dansçıyken bir episkoposun vaazından etkilenip tövbe etti. Sonra erkek kılığına girip Kudüs yakınlarında bir mağarada inzivaya çekildi.",
     "nameEn": "Pelagia the Penitent",
     "titleEn": "",
     "bioEn": "Tradition says she was a dancer in Antioch (modern Antakya, Turkey) who repented after hearing a bishop preach, then disguised herself as a man and went to live in a cave near Jerusalem."
    }
   ]
  },
  {
   "m": 10,
   "d": 9,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "John Henry Newman",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "XIX. yüzyılda İngiltere’de önde gelen bir Anglikan din adamıydı. Uzun bir teolojik arayışın sonunda Katolik oldu ve daha sonra kardinal oldu. Vicdanın önceliği ve öğretinin zaman içindeki gelişimi üzerine yazdığı eserlerle modern Katolik düşüncesini derinden etkiledi. 2019’da aziz ilan edildi, 2025’te de Kilise Doktoru ilan edildi.",
     "nameEn": "John Henry Newman",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "A leading Anglican clergyman in nineteenth-century England who, after a long theological search, converted to Catholicism, and later became a cardinal. His writings on the primacy of conscience and the development of doctrine over time deeply influenced modern Catholic thought. He was canonized in 2019 and declared a Doctor of the Church in 2025."
    },
    {
     "name": "Dionysius ve Yoldaşları",
     "title": "Episkopos ve Şehitler",
     "bio": "III. yüzyılda Roma’dan Galya’ya, bugünkü Fransa’ya misyoner olarak gönderildi. Paris’in ilk episkoposu sayılır ve orada arkadaşlarıyla birlikte şehit edildi.",
     "nameEn": "Denis and Companions",
     "titleEn": "Bishop and Martyrs",
     "bioEn": "Sent from Rome as a missionary to Gaul (France) in the third century, he is regarded as the first bishop of Paris, and was martyred there."
    },
    {
     "name": "Giovanni Leonardi",
     "title": "Rahip",
     "bio": "XVI-XVII. yüzyılda İtalya’da yaşamış bir rahiptir. Din adamlarının yenilenmesi için Tanrı Anası Rahipleri Cemaati’ni kurdu. Halka yönelik misyonların ve misyoner yetiştirmenin öncülerinden sayılır.",
     "nameEn": "John Leonardi",
     "titleEn": "Priest",
     "bioEn": "A priest in sixteenth- and seventeenth-century Italy who founded the Clerics Regular of the Mother of God for the reform of the clergy. He is counted among the pioneers of popular missions and missionary preparation."
    }
   ]
  },
  {
   "m": 10,
   "d": 10,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Francisco de Borja",
     "title": "Rahip",
     "bio": "XVI. yüzyılda İspanya’da önce bir dük ve devlet adamıydı. İmparatoriçe Isabella’nın cenazesinde onun bozulmuş yüzünü görünce dünyevi hırslardan vazgeçti. Cizvit oldu ve tarikatın genel başkanlığına kadar yükseldi.",
     "nameEn": "Francis Borgia",
     "titleEn": "Priest",
     "bioEn": "First a duke and statesman in sixteenth-century Spain, after seeing the decaying body of Empress Isabella, he gave up worldly ambition, became a Jesuit, and rose to be superior general of the order."
    }
   ]
  },
  {
   "m": 10,
   "d": 11,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "XXIII. Ioannes",
     "title": "Papa",
     "bio": "1958-1963 yılları arasında papalık yaptı. Sade ve sevecen kişiliği yüzünden “İyi Papa Yuhanna” diye anılır. Herkesi şaşırtarak II. Vatikan Konsili’ni topladı ve Kilise’nin çağdaş dünyaya açılmasının yolunu açtı. Konsilin sonuçlarını göremeden öldü.",
     "nameEn": "John XXIII",
     "titleEn": "Pope",
     "bioEn": "Pope from 1958 to 1963, remembered as \"Good Pope John\" for his simple, warm-hearted character. Surprising everyone, he convened the Second Vatican Council, which opened the Church to the modern world. He died before seeing the council's conclusion."
    }
   ]
  },
  {
   "m": 10,
   "d": 12,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Yorklu Wilfrid",
     "title": "Episkopos",
     "bio": "VII. yüzyılda İngiltere’de York episkoposuydu. Kelt ve Roma gelenekleri arasında Paskalya’nın tarihi konusunda bir anlaşmazlık vardı. 664’teki Whitby Sinodu’nda Roma tarafını savundu ve kararda belirleyici oldu.",
     "nameEn": "Wilfrid of York",
     "titleEn": "Bishop",
     "bioEn": "Bishop of York in seventh-century England, playing a decisive role at the Synod of Whitby in 664 by defending the Roman side in the dispute over the date of Easter between the Celtic and Roman Christian traditions."
    }
   ]
  },
  {
   "m": 10,
   "d": 13,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "İtirafçı Edward",
     "title": "Kral",
     "bio": "XI. yüzyılda İngiltere kralıydı ve Westminster Manastırı’nı yeniden yaptırdı. Dindar bir hükümdar olarak tanınır. Normanlar İngiltere’yi fethetmeden önceki son Anglosakson krallarındandır.",
     "nameEn": "Edward the Confessor",
     "titleEn": "King",
     "bioEn": "A devout king of England in the eleventh century who had Westminster Abbey rebuilt. He was among the last Anglo-Saxon kings before the Norman conquest of England."
    }
   ]
  },
  {
   "m": 10,
   "d": 14,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "I. Callistus",
     "title": "Papa ve Şehit",
     "bio": "III. yüzyılda yaşadı. Gençliğinde köle ve mahkûm olarak zor bir hayat sürdü, sonra papa oldu. Roma’da bugün onun adını taşıyan büyük bir katakomb yaptırdı. Papalığı sırasında çıkan bir ayaklanmada öldürüldü ve şehit olarak anılır.",
     "nameEn": "Callixtus I",
     "titleEn": "Pope and Martyr",
     "bioEn": "As a young man he lived a hard life as a slave and a prisoner; later, in the third century, he became pope. He had a great catacomb built in Rome that still bears his name today. He was killed in a riot while he was pope."
    }
   ]
  },
  {
   "m": 10,
   "d": 15,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Avilalı Teresa",
     "title": "Bakire ve Kilise Doktoru",
     "bio": "XVI. yüzyılda İspanya’da yaşamış bir Karmelit rahibesidir. Manastırlarda disiplinin gevşediğini gördü ve Haçlı Yuhanna ile birlikte tarikatı yenilemeye girişti; on yedi yeni manastır kurdu. “İç Kale” ve “Hayatımın Kitabı” gibi eserleriyle Hristiyan mistik yazarlarının en büyüklerinden biri sayılır. Kilise Doktoru ilan edilen ilk kadındır.",
     "nameEn": "Teresa of Ávila",
     "titleEn": "Virgin and Doctor of the Church",
     "bioEn": "A Carmelite sister who lived in sixteenth-century Spain. Seeing how lax monastic discipline had become, she undertook the reform of her order together with Saint John of the Cross, founding seventeen new convents. Through works such as \"The Interior Castle\" and \"The Life,\" she is considered one of the greatest writers of Christian mystical theology; she is the first woman Doctor of the Church."
    }
   ]
  },
  {
   "m": 10,
   "d": 16,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Hedwig",
     "title": "Rahibe",
     "bio": "XII-XIII. yüzyılda Silezya düşesiydi. Kocası öldükten sonra servetini hastanelere ve manastırlara bağışladı ve sade bir hayat sürdü. Polonya’nın koruyucu azizelerinden biridir.",
     "nameEn": "Hedwig",
     "titleEn": "Religious",
     "bioEn": "Duchess of Silesia in the twelfth and thirteenth centuries; after her husband's death she gave away her fortune to hospitals and monasteries and lived a simple life. She is one of the patron saints of Poland."
    },
    {
     "name": "Marguerite-Marie Alacoque",
     "title": "Bakire",
     "bio": "XVII. yüzyılda Fransa’da yaşamış bir Ziyaret Rahibesi’dir. Mesih İsa’nın ona göründüğü ve Kutsal Yüreği’ne bağlılığı yaymasını istediği görümlerle tanınır. Bu bağlılık onun aracılığıyla bütün Kilise’ye yayıldı.",
     "nameEn": "Margaret Mary Alacoque",
     "titleEn": "Virgin",
     "bioEn": "A Visitation Sister in seventeenth-century France. She is known for the visions in which Christ appeared to her and asked her to spread devotion to his Sacred Heart; through her the devotion spread to the whole Church."
    }
   ]
  },
  {
   "m": 10,
   "d": 17,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Antakyalı İgnatius",
     "title": "Episkopos ve Şehit",
     "bio": "I-II. yüzyılda Antakya episkoposuydu. Geleneğe göre Havari Yuhanna’nın öğrencisidir. Vahşi hayvanlara atılmak üzere Roma’ya götürülürken yedi mektup yazdı. Bu mektuplar, Kilise’nin birliği, episkoposun önemi ve Efkaristiya hakkında ilk dönemden kalan en değerli tanıklıklardandır. Kendini “Allah’ın buğdayı” diye tanıttı.",
     "nameEn": "Ignatius of Antioch",
     "titleEn": "Bishop and Martyr",
     "bioEn": "Bishop of Antioch (modern Antakya, Turkey) in the first and second centuries, traditionally held to be a disciple of the Apostle John. The seven letters he wrote on his way to Rome, where he was thrown to the wild beasts, are among the most valuable early testimonies on the Church's unity, the importance of the episcopate, and the Eucharist. He described himself as \"the wheat of God.\""
    }
   ]
  },
  {
   "m": 10,
   "d": 18,
   "rank": "Bayram",
   "saints": [
    {
     "name": "İncil Yazarı Luka",
     "title": "",
     "bio": "Havari Pavlus’un yol arkadaşıdır ve geleneğe göre hekimdi. Luka İncili’ni ve Elçilerin İşleri’ni yazdı. İncili’nde Allah’ın merhameti, yoksullar ve kadınlar özellikle öne çıkar. Gelenek onu ilk ikonaları yapan kişi olarak da anar ve ikona ressamlarının koruyucusu sayar.",
     "nameEn": "Luke the Evangelist",
     "titleEn": "",
     "bioEn": "An evangelist, traditionally held to be a physician, who was a companion of the Apostle Paul. He wrote the Gospel of Luke and the Acts of the Apostles; his Gospel places a special emphasis on God's mercy, the poor, and women. He is also traditionally regarded as the patron saint of icon painters."
    }
   ]
  },
  {
   "m": 10,
   "d": 19,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Paolo della Croce",
     "title": "Rahip",
     "bio": "XVII-XVIII. yüzyılda İtalya’da yaşamış bir rahiptir. Mesih İsa’nın çektiği acılar üzerine derin bir dindarlığı yaymak için Passionist tarikatını kurdu.",
     "nameEn": "Paul of the Cross",
     "titleEn": "Priest",
     "bioEn": "A priest in seventeenth- and eighteenth-century Italy who founded the Passionist order to spread deep devotion to the Passion of Christ."
    },
    {
     "name": "Jean de Brébeuf, Isaac Jogues ve Yoldaşları",
     "title": "Şehitler",
     "bio": "XVII. yüzyılda bugünkü Kanada’da ve ABD’nin kuzeydoğusunda, Huron ve İrokua halkları arasında misyonerlik yapan Fransız Cizvitlerdir. Bölgedeki savaşlar sırasında işkenceyle şehit edildiler. Hikâyeleri, Kuzey Amerika’nın ilk misyon tarihinin en dramatik anlatılarındandır.",
     "nameEn": "John de Brébeuf, Isaac Jogues, and Companions",
     "titleEn": "Martyrs",
     "bioEn": "French Jesuits who did missionary work among the Huron and Iroquois peoples in what is now northeastern Canada and the United States in the seventeenth century. They were martyred by torture during the wars in the region. Their story is one of the most dramatic in the early missions of North America."
    }
   ]
  },
  {
   "m": 10,
   "d": 20,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Maria Bertilla Boscardin",
     "title": "Bakire",
     "bio": "XIX-XX. yüzyılda İtalya’da hastanede hemşirelik yapan bir rahibedir. I. Dünya Savaşı sırasında yaralı askerlere kendini feda edercesine baktığı için tanınır.",
     "nameEn": "Maria Bertilla Boscardin",
     "titleEn": "Virgin",
     "bioEn": "A hospital nursing sister in nineteenth- and twentieth-century Italy, known for her selfless care of wounded soldiers during the First World War."
    }
   ]
  },
  {
   "m": 10,
   "d": 21,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Ursula ve Yoldaşları",
     "title": "Bakireler ve Şehitler",
     "bio": "Geleneğe göre IV-V. yüzyılda Britanyalı bir prenses olan Ursula, ona eşlik eden genç kızlarla birlikte hacdan dönerken Köln yakınlarında Hunlar tarafından öldürüldü. Efsanenin ayrıntıları zamanla büyüdü, ama Ursula ve arkadaşları çok erken dönemden beri Köln’de büyük saygı görür.",
     "nameEn": "Ursula and Companions",
     "titleEn": "Virgins and Martyrs",
     "bioEn": "Tradition says Ursula was a British princess who, with the young women traveling with her, was massacred by the Huns near Cologne on her way back from a pilgrimage, in the fourth or fifth century. The legend grew in the telling, but Cologne has honored her since early times."
    }
   ]
  },
  {
   "m": 10,
   "d": 22,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "II. Ioannes Paulus",
     "title": "Papa",
     "bio": "1978-2005 yılları arasında papalık yaptı ve ilk Polonyalı papadır. Uzun papalığı boyunca dünyanın dört bir yanını dolaştı ve komünizmin çöküşünde etkili oldu. Dünya Gençlik Günleri aracılığıyla gençlerle özel bir bağ kurdu. Hayatının son yıllarında Parkinson hastalığıyla herkesin gözü önünde mücadele etti ve acının da anlamlı olabileceğine tanıklık etti.",
     "nameEn": "John Paul II",
     "titleEn": "Pope",
     "bioEn": "Pope from 1978 to 2005, the first Polish pope. During his long papacy he traveled to every corner of the world, was influential in the fall of communism, and formed a special bond with young people through World Youth Day. In the final years of his life, he lived his struggle with Parkinson's disease in full public view, as a witness to the meaning of suffering."
    }
   ]
  },
  {
   "m": 10,
   "d": 23,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Capestranolu Giovanni",
     "title": "Rahip",
     "bio": "XIV-XV. yüzyılda İtalya’da önce hukukçuydu, sonra Fransisken rahibi oldu. Yaşlılığında, Osmanlı ordusuna karşı Belgrad’ı savunan askerlere ruhani destek verdi ve zaferde rol oynadı. Askeri rahiplerin koruyucu azizlerindendir.",
     "nameEn": "John of Capistrano",
     "titleEn": "Priest",
     "bioEn": "First a lawyer, then a Franciscan friar, in fourteenth- and fifteenth-century Italy. In old age he rallied the soldiers defending Belgrade against the Ottoman army and helped win the victory there. He is among the patron saints of military chaplains."
    }
   ]
  },
  {
   "m": 10,
   "d": 24,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Antonio María Claret",
     "title": "Episkopos",
     "bio": "XIX. yüzyılda İspanya’da önce dokumacıydı, sonra rahip oldu ve Klaretyen tarikatını kurdu. Küba başepiskoposu olarak görev yaptı. Hayatı boyunca binlerce vaaz verdi ve çok sayıda ucuz dinî kitap bastırıp dağıttı.",
     "nameEn": "Anthony Mary Claret",
     "titleEn": "Bishop",
     "bioEn": "First a weaver in nineteenth-century Spain, he became a priest and founded the Claretian order. He served as archbishop of Cuba, preached thousands of sermons throughout his life, and had large numbers of inexpensive religious books printed and distributed."
    }
   ]
  },
  {
   "m": 10,
   "d": 25,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Chrysanthus ve Daria",
     "title": "Şehitler",
     "bio": "III. yüzyılda Roma’da yaşamış bir çift şehittir. Anlatılana göre evlendirildiler, ama ikisi de kendini Allah’a adadığı için evliliklerini ruhani bir birlik olarak yaşadılar.",
     "nameEn": "Chrysanthus and Daria",
     "titleEn": "Martyrs",
     "bioEn": "A married couple martyred together in third-century Rome; tradition says they agreed together to live their marriage in chastity."
    }
   ]
  },
  {
   "m": 10,
   "d": 26,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Cedd",
     "title": "Episkopos",
     "bio": "VII. yüzyılda İngiltere’nin Essex bölgesine Hristiyanlığı götüren Anglosakson bir misyoner ve episkopostur. Lindisfarne’de yetişti, sonra kendi bölgesinde manastırlar kurdu.",
     "nameEn": "Cedd",
     "titleEn": "Bishop",
     "bioEn": "An Anglo-Saxon missionary-bishop who brought Christianity to the Essex region of England in the seventh century; raised at Lindisfarne, he later founded monasteries in his own region."
    }
   ]
  },
  {
   "m": 10,
   "d": 27,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Frumentius",
     "title": "Episkopos",
     "bio": "IV. yüzyılda bir gemi kazasından sonra Etiyopya’ya götürülen Fenikeli bir gençti; sonra oranın ilk episkoposu oldu. Etiyopya Kilisesi’nin kurucusu sayılır ve “Etiyopya’nın Havarisi” diye anılır.",
     "nameEn": "Frumentius",
     "titleEn": "Bishop",
     "bioEn": "A Phoenician who ended up in Ethiopia after a shipwreck in the fourth century and later became its first bishop. He is remembered as the founding father of the Ethiopian Church and \"the Apostle of Ethiopia.\""
    }
   ]
  },
  {
   "m": 10,
   "d": 28,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Havariler Simun ve Yahuda",
     "title": "",
     "bio": "İki havariyi birlikte anarız. Simon “Gayretkeş” lakabıyla anılır. Yahuda ise İskariot’tan ayırt etmek için Taddeus diye de bilinir. İncil’de onun hakkında çok az şey anlatılır, ama halk arasında “umutsuz davaların azizi” olarak çok sevilir ve ona çok dua edilir.",
     "nameEn": "The Apostles Simon and Jude",
     "titleEn": "",
     "bioEn": "Two apostles. Simon is known by the nickname \"the Zealot\"; Jude (to distinguish him from Iscariot) is also known as Thaddeus, and is much loved in popular devotion as \"the saint of hopeless causes,\" Little is said of him in the Gospels, but a strong tradition of asking for his help grew up around him."
    }
   ]
  },
  {
   "m": 10,
   "d": 29,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Kudüslü Narkissos",
     "title": "Episkopos",
     "bio": "II-III. yüzyılda yüz yaşını geçene kadar Kudüs episkoposu olarak hizmet ettiği anlatılır. Paskalya gecesi lambalar için yağ bulunamayınca suyu yağa dönüştürdüğü mucizeyle anılır.",
     "nameEn": "Narcissus of Jerusalem",
     "titleEn": "Bishop",
     "bioEn": "Said to have been bishop of Jerusalem until past the age of a hundred, in the second and third centuries; he is remembered for a miracle in which the water for the Easter vigil turned into oil."
    }
   ]
  },
  {
   "m": 10,
   "d": 30,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Yüzbaşı Marcellus",
     "title": "Şehit",
     "bio": "III-IV. yüzyılda Roma ordusunda yüzbaşıydı. İmparatorun doğum günü için yapılan putperest bir törende rütbe işaretlerini yere attı ve Hristiyan olduğunu ilan etti. Bu yüzden idam edildi.",
     "nameEn": "Marcellus the Centurion",
     "titleEn": "Martyr",
     "bioEn": "A centurion in the Roman army around the year 300 who threw down his badge of rank at a pagan festival, declared himself a Christian and was executed."
    }
   ]
  },
  {
   "m": 10,
   "d": 31,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Regensburglu Wolfgang",
     "title": "Episkopos",
     "bio": "X. yüzyılda Regensburg episkoposuydu. Döneminde din eğitiminin ve manastır hayatının yenilenmesinde öncü oldu.",
     "nameEn": "Wolfgang of Regensburg",
     "titleEn": "Bishop",
     "bioEn": "Bishop of Regensburg in the tenth century, who led the way in the religious education and monastic reform of his time."
    }
   ]
  },
  {
   "m": 11,
   "d": 1,
   "rank": "En Büyük Bayram",
   "saints": [
    {
     "name": "Bütün Azizler",
     "title": "",
     "bio": "Takvimde adıyla anılan azizlerin dışında, cennette olduğuna inandığımız sayısız kutsal insanı topluca kutlar. Dayanağı, Vahiy Kitabı’ndaki şu görümdür: “Kimsenin sayamayacağı kadar büyük bir kalabalık” Allah’ın tahtı önünde durup O’nu övmektedir. Bu bayram, kutsallık çağrısının yalnızca aziz ilan edilmiş birkaç kişiye değil, herkese açık olduğunu hatırlatır.",
     "nameEn": "All Saints",
     "titleEn": "",
     "bioEn": "The feast of all the saints in heaven, not only the ones the Church's calendar names. It rests on the vision described in the Book of Revelation of \"a great multitude, which no man could number,\" standing before God's throne giving him praise. This feast reminds us that the call to holiness is open to everyone, not only to the few who have been formally canonized."
    }
   ]
  },
  {
   "m": 11,
   "d": 2,
   "rank": "Anma",
   "saints": [
    {
     "name": "Bütün Sadık Ölüler (Ölüler Günü)",
     "title": "",
     "bio": "Bu gün Kilise, Hristiyan imanıyla ölmüş ama henüz Allah’ın huzuruna tam olarak hazır olmayan bütün ölüleri anar ve onlar için dua eder. Katolik öğretisine göre araf, ruhun arınıp Allah’ın huzuruna tamamen hazır hâle geldiği durumdur. Bu gün geleneksel olarak mezarlar ziyaret edilir ve ölüler için özel Ayinler kutlanır.",
     "nameEn": "All Souls' Day (The Commemoration of All the Faithful Departed)",
     "titleEn": "",
     "bioEn": "On this day the Church remembers and prays for all souls who died in the Christian faith but are not yet fully ready for God's presence. According to Catholic teaching, Purgatory is a purification in which the soul is made fully ready to stand before God. This day is traditionally marked by visits to graves and special Masses for the dead."
    }
   ]
  },
  {
   "m": 11,
   "d": 3,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Martín de Porres",
     "title": "",
     "bio": "XVI-XVII. yüzyılda Peru’da, İspanyol soylu bir baba ile özgürlüğüne kavuşmuş Afrikalı bir annenin oğlu olarak doğdu. Döneminin ırkçı önyargılarına rağmen bir Dominiken manastırına kabul edildi. Hastalara, hayvanlara ve yoksullara gösterdiği sınırsız şefkatle tanınır. Amerika kıtasının ilk melez azizidir ve ırklar arası adaletin simgesi olmuştur.",
     "nameEn": "Martin de Porres",
     "titleEn": "",
     "bioEn": "Born in sixteenth- and seventeenth-century Peru, the son of a Spanish nobleman and a freed African woman, he was admitted to a Dominican monastery despite the racial prejudice of his time. He is known for his boundless compassion for the sick, animals, and the poor. He is the first saint of mixed race from the Americas; he is considered a symbol of racial justice."
    }
   ]
  },
  {
   "m": 11,
   "d": 4,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Carlo Borromeo",
     "title": "Episkopos",
     "bio": "XVI. yüzyılda İtalya’da genç yaşta kardinal ve Milano başepiskoposu oldu. Trento Konsili’nin kararlarının uygulanmasına öncülük etti ve seminerler kurdurdu. Veba salgını sırasında hastalara bizzat hizmet etti. Episkoposların ve din eğitiminin yenilenmesinde örnek gösterilir.",
     "nameEn": "Charles Borromeo",
     "titleEn": "Bishop",
     "bioEn": "In sixteenth-century Italy, he became a cardinal and bishop of Milan at a young age. He led the implementation of the decrees of the Council of Trent, had seminaries built, and personally served the sick during a plague epidemic. He is held up as a model for bishops and for the reform of religious education."
    }
   ]
  },
  {
   "m": 11,
   "d": 5,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Zekeriya ve Elizabet",
     "title": "",
     "bio": "Luka İncili’ne göre rahip Zekeriya ve eşi Elizabet ileri yaşa kadar çocuksuz kaldılar, sonra mucizevi bir şekilde Vaftizci Yahya’nın anne babası oldular. Zekeriya meleğin sözüne inanmadığı için dilsiz kaldı ve oğlu doğduğunda yeniden konuşmaya başladı.",
     "nameEn": "Zechariah and Elizabeth",
     "titleEn": "",
     "bioEn": "The priest Zechariah and his wife Elizabeth, recounted in the Gospel of Luke, who remained childless into old age and then miraculously became the parents of John the Baptist. Zechariah is said to have been struck mute for his doubt, and his tongue was loosed at his son's birth."
    }
   ]
  },
  {
   "m": 11,
   "d": 6,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Noblaclı Leonard",
     "title": "Münzevi",
     "bio": "VI. yüzyılda Fransa’da yaşamış bir keşiştir. Anlatılana göre bir Frank kralının vaftiz babasıydı ve kraldan, istediği her mahkûmu serbest bırakma hakkını aldı. Mahkûmların koruyucu azizidir.",
     "nameEn": "Leonard of Noblac",
     "titleEn": "Hermit",
     "bioEn": "A monk in sixth-century France said to have earned, as godfather to a Frankish king's child, the right to free any prisoner he asked the king to release. He is the patron saint of prisoners."
    }
   ]
  },
  {
   "m": 11,
   "d": 7,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Willibrord",
     "title": "Episkopos",
     "bio": "VII-VIII. yüzyılda İngiltere’de doğdu. Misyoner olarak Frizya’ya, bugünkü Hollanda’ya gitti ve Utrecht’in ilk episkoposu oldu. Hollanda’nın koruyucu azizlerindendir.",
     "nameEn": "Willibrord",
     "titleEn": "Bishop",
     "bioEn": "An Englishman of the seventh and eighth centuries who went as a missionary to Frisia (modern Netherlands) and became the first bishop of Utrecht. He is regarded as one of the patron saints of the Netherlands."
    }
   ]
  },
  {
   "m": 11,
   "d": 8,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Amiens Piskoposu Godefroy",
     "title": "Episkopos",
     "bio": "XI-XII. yüzyılda Fransa’da Amiens episkoposuydu. Din adamları arasında kilise görevlerinin parayla satılmasına karşı mücadele etti.",
     "nameEn": "Godfrey of Amiens",
     "titleEn": "Bishop",
     "bioEn": "Bishop of Amiens in eleventh- and twelfth-century France, fighting against simony (the selling of Church offices) among the clergy."
    }
   ]
  },
  {
   "m": 11,
   "d": 9,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Laterano Bazilikası’nın Adanması",
     "title": "",
     "bio": "Papa’nın Roma episkoposu olarak kendi katedrali olan Aziz Yuhanna Laterano Bazilikası’nın IV. yüzyılda kutsanmasını anar. Bu bazilika “Roma’daki ve dünyadaki bütün kiliselerin annesi ve başı” unvanını taşır. Bayram, Roma Kilisesi’nin ve papanın bütün Kilise’yi bir arada tutan rolünü hatırlatır.",
     "nameEn": "The Dedication of the Lateran Basilica",
     "titleEn": "",
     "bioEn": "Remembers the fourth-century dedication of the Basilica of Saint John Lateran, the pope's own cathedral as bishop of Rome. It is called the \"mother and head\" of all the churches of Rome, and the feast is a reminder of the part Rome and the pope play in holding the whole Church together."
    }
   ]
  },
  {
   "m": 11,
   "d": 10,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Büyük Leo (I. Leo)",
     "title": "Papa ve Kilise Doktoru",
     "bio": "V. yüzyılda papaydı. Mesih İsa’nın tek bir kişide hem tam Tanrı hem tam insan olduğunu anlatan mektubu (Tomus), 451’deki Kadıköy Konsili’nde Kilise’nin resmî öğretisi olarak kabul edildi. Anlatılana göre Roma’ya yürüyen Hun kralı Attila’yı bizzat karşıladı ve onu şehri yağmalamaktan vazgeçirdi.",
     "nameEn": "Leo I (Leo the Great)",
     "titleEn": "Pope and Doctor of the Church",
     "bioEn": "Pope in the fifth century, whose letter (the Tome) on the single person of Christ, fully divine and fully human, was accepted as official Church teaching at the Council of Chalcedon in 451. Legend holds that he personally met the Hun king Attila as he marched on Rome and persuaded him to give up plundering the city."
    }
   ]
  },
  {
   "m": 11,
   "d": 11,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Tourslu Martinus",
     "title": "Episkopos",
     "bio": "IV. yüzyılda Roma ordusunda askerdi. Anlatılana göre kışın ortasında soğuktan donmak üzere olan bir dilenciyle pelerinini ikiye bölüp paylaştı. O gece rüyasında o dilencinin Mesih İsa olduğunu gördü. Bundan sonra vaftiz oldu, askerliği bıraktı ve sonra Tours episkoposu oldu. Fransa’nın kırsal bölgelerinde Hristiyanlığın yayılmasında öncü oldu.",
     "nameEn": "Martin of Tours",
     "titleEn": "Bishop",
     "bioEn": "While serving as a soldier in the Roman army in the fourth century, he is said to have shared half his cloak with a beggar freezing in the middle of winter, then to have learned in a dream that night that the beggar was Christ. After that he was baptized and left the army, later becoming bishop of Tours. He played a pioneering role in spreading Christianity across rural France."
    }
   ]
  },
  {
   "m": 11,
   "d": 12,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Josafat Kunceviç",
     "title": "Episkopos ve Şehit",
     "bio": "XVI-XVII. yüzyılda bugünkü Ukrayna ve Belarus topraklarında, Bizans ayinini izleyen Katolik bir episkopostu. Roma ile birlik içindeki Doğu Kilisesi’nin birliğini savunurken, bu birliğe karşı çıkan bir kalabalık tarafından öldürüldü. Doğu ve Batı Hristiyanlığı arasındaki birliğin şehidi olarak anılır.",
     "nameEn": "Josaphat",
     "titleEn": "Bishop and Martyr",
     "bioEn": "A bishop of the Byzantine-rite Catholic Church in what is now Ukraine in the sixteenth and seventeenth centuries, killed by a mob that opposed his defense of the unity of the Eastern Church in communion with Rome. He is remembered as the martyr of unity between Eastern and Western Christianity."
    }
   ]
  },
  {
   "m": 11,
   "d": 13,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Francesca Saverio Cabrini",
     "title": "Bakire",
     "bio": "İtalya’da doğdu ve Amerika’ya göç eden bir rahibedir. İtalyan göçmenler için hastaneler, yetimhaneler ve okullar kurmak amacıyla Kutsal Yürek Misyoner Rahibeleri’ni kurdu ve Amerika kıtasını defalarca dolaştı. ABD vatandaşı olan ilk azizedir ve göçmenlerin koruyucu azizesidir.",
     "nameEn": "Frances Xavier Cabrini",
     "titleEn": "Virgin",
     "bioEn": "A sister born in Italy who emigrated to America. She founded the Missionary Sisters of the Sacred Heart to build hospitals, orphanages, and schools for Italian immigrants, traveling across the Americas many times. She is the first American citizen to be canonized; she is regarded as the patron saint of immigrants."
    }
   ]
  },
  {
   "m": 11,
   "d": 14,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Laurence O’Toole",
     "title": "Episkopos",
     "bio": "XII. yüzyılda İrlanda’da Dublin başepiskoposuydu. İngilizlerin İrlanda’yı istilası sırasında halkı için arabuluculuk yapmaya çalıştı.",
     "nameEn": "Lawrence O'Toole",
     "titleEn": "Bishop",
     "bioEn": "Archbishop of Dublin in twelfth-century Ireland, who tried to make peace on behalf of his people during the English invasion."
    }
   ]
  },
  {
   "m": 11,
   "d": 15,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Büyük Albertus",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "XIII. yüzyılda Almanya’da yaşamış bir Dominiken bilginidir. Hem teoloji hem de doğa bilimleri alanında çok büyük bir eser bıraktı. Thomas Aquinas’ın hocasıydı ve Aristoteles felsefesinin Hristiyan düşüncesine kazandırılmasında öncü oldu. Doğa bilimcilerinin koruyucu azizidir.",
     "nameEn": "Albert the Great",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "A Dominican scholar who lived in thirteenth-century Germany, leaving a vast body of work in both theology and the natural sciences. He was the teacher of Thomas Aquinas and played a pioneering role in bringing Aristotelian philosophy into Christian thought. He is considered the patron saint of natural scientists."
    }
   ]
  },
  {
   "m": 11,
   "d": 16,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "İskoçyalı Margaret",
     "title": "Kraliçe",
     "bio": "XI. yüzyılda İskoç kralı III. Malcolm ile evlenen İngiliz bir prensestir. Yoksullara cömertliği, Kilise’nin yenilenmesini desteklemesi ve sekiz çocuğunu dindar bir şekilde yetiştirmesiyle tanınır. İskoçya’nın koruyucu azizesidir.",
     "nameEn": "Margaret of Scotland",
     "titleEn": "Queen",
     "bioEn": "An English princess who became the wife of King Malcolm III of Scotland in the eleventh century. She is known for her generosity to the poor, her support of Church reform, and raising her eight children devoutly. She is the patron saint of Scotland."
    },
    {
     "name": "Büyük Gertrud",
     "title": "Bakire",
     "bio": "XIII. yüzyılda Almanya’da yaşamış bir Benedikten rahibesidir. Mesih İsa’nın Kutsal Yüreği’ne duyduğu derin mistik bağlılıkla tanınır; bu konudaki yazıları, sonraki yüzyıllarda Kutsal Yürek bağlılığının gelişmesini etkiledi.",
     "nameEn": "Gertrude the Great",
     "titleEn": "Virgin",
     "bioEn": "A Benedictine nun in thirteenth-century Germany. She is known for her deep mystical devotion to the Sacred Heart of Christ; her writings in this area influenced the development of devotion to the Sacred Heart in later centuries."
    }
   ]
  },
  {
   "m": 11,
   "d": 17,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Macaristanlı Elizabeth",
     "title": "",
     "bio": "XIII. yüzyılda Macaristan kralının kızı olarak doğdu ve genç yaşta Thüringen hükümdarı ile evlendirildi. Kocası öldükten sonra servetini yoksullara ve hastalara dağıttı, bir hastane kurdu ve kendisi de sade bir hayat sürerek hastalara bizzat baktı. Yirmi dört yaşında öldü. Yardım işlerinin ve Fransisken üçüncü tarikat üyelerinin koruyucu azizesidir.",
     "nameEn": "Elizabeth of Hungary",
     "titleEn": "",
     "bioEn": "Born in the thirteenth century, a daughter of the king of Hungary, she was married at a young age to the Landgrave of Thuringia. After her husband's death she distributed her fortune to the poor and sick, founded a hospital, and personally cared for the sick while living a simple life herself. She died at twenty-four; she is the patron saint of charitable works and of Franciscan tertiaries."
    }
   ]
  },
  {
   "m": 11,
   "d": 18,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Aziz Petrus ve Pavlus Bazilikalarının Adanması",
     "title": "",
     "bio": "Roma’da iki büyük havarinin mezarları üzerine yapılmış iki bazilikanın, Aziz Petrus Bazilikası’nın ve Surlar Dışındaki Aziz Pavlus Bazilikası’nın kutsanmasını anar. Bu iki yapı, iki büyük havarinin şehitliğini ve Roma Kilisesi’nin havarilere dayanan köklerini somut olarak hatırlatır.",
     "nameEn": "The Dedication of the Basilicas of Saints Peter and Paul",
     "titleEn": "",
     "bioEn": "Remembers the dedication of the basilicas built over the tombs of the two great apostles in Rome: St. Peter's Basilica and the Basilica of St. Paul Outside the Walls. The two churches stand as reminders of the martyrdom of the two great apostles and of the apostolic roots of the Church of Rome."
    },
    {
     "name": "Rose Philippine Duchesne",
     "title": "Bakire",
     "bio": "Fransa’da doğmuş bir rahibedir ve XIX. yüzyılda misyoner olarak Amerika’ya gitti. Kızların eğitimi için okullar kurdu. Yaşlılığında bile yerli halklar arasında çalışmak istedi. Yerliler, sessizce ve uzun uzun dua ettiği için ona “her zaman dua eden kadın” adını verdi.",
     "nameEn": "Rose Philippine Duchesne",
     "titleEn": "Virgin",
     "bioEn": "A sister born in France who went to America as a missionary in the nineteenth century. She founded schools for the education of girls, and even in old age wanted to do mission work among Native American peoples; they gave her the name \"the woman who always prays\" for her silent prayer."
    }
   ]
  },
  {
   "m": 11,
   "d": 19,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Büyük Nerses",
     "title": "Episkopos",
     "bio": "IV. yüzyılda Ermeni Kilisesi’nin patriğiydi. Hastaneler ve yetimhaneler kurdurdu; toplumsal reformlarıyla tanınır.",
     "nameEn": "Nerses I the Great",
     "titleEn": "Bishop",
     "bioEn": "Patriarch of the Armenian Church in the fourth century, known for his social reforms, founding hospitals and orphanages."
    }
   ]
  },
  {
   "m": 11,
   "d": 20,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Edmund",
     "title": "Kral ve Şehit",
     "bio": "IX. yüzyılda İngiltere’de Doğu Anglia kralıydı. İstilacı Vikinglere teslim olmayı ve onların tanrılarına tapmayı reddetti. Oklarla vuruldu ve başı kesilerek şehit edildi. Orta Çağ İngiltere’sinin en sevilen azizlerinden biriydi.",
     "nameEn": "Edmund",
     "titleEn": "King and Martyr",
     "bioEn": "King of East Anglia in ninth-century England, martyred by being shot with arrows and beheaded for refusing to surrender to invading Vikings and worship their idols. He was one of the most beloved saints of medieval England."
    }
   ]
  },
  {
   "m": 11,
   "d": 21,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Meryem Ana’nın Mabede Takdimi",
     "title": "",
     "bio": "Kutsal Kitap’ta geçmez, ama ilk Hristiyan geleneğine göre küçük Meryem’in anne babası onu Kudüs’teki Tapınak’ta Allah’a adadı. Bu gün o olayı anar. Bu gelenek, Meryem’in daha çocukluğundan itibaren bütün hayatının tamamen Allah’a adanmış olduğunu anlatır.",
     "nameEn": "The Presentation of Mary",
     "titleEn": "",
     "bioEn": "An early tradition, not found in Scripture, tells how Mary's parents brought her as a small child to the Temple in Jerusalem and dedicated her to God. It expresses the belief that Mary belonged wholly to God from her earliest years."
    }
   ]
  },
  {
   "m": 11,
   "d": 22,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Cecilia",
     "title": "Bakire ve Şehit",
     "bio": "İlk yüzyıllarda Roma’da yaşadı. Geleneğe göre soylu bir aileden geliyordu ve kendini Mesih İsa’ya adamıştı. Evlendirildiğinde eşini de imana kazandırdı. Şehitliğiyle ilgili anlatılar zamanla efsaneleşti. Geleneğe göre şehit edilirken yüreğinde Allah’a ilahiler söylüyordu; bu yüzden kilise müziğinin koruyucu azizesidir.",
     "nameEn": "Cecilia",
     "titleEn": "Virgin and Martyr",
     "bioEn": "A young Roman woman of the early centuries, traditionally of noble family, who consecrated her virginity to Christ and, after her marriage, won her husband over to the faith and to respecting that vow. The accounts of her martyrdom became legendary over time. She is regarded as the patron saint of Church music; tradition says that while the musicians played at her wedding, she sang to God in her heart."
    }
   ]
  },
  {
   "m": 11,
   "d": 23,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "I. Clemens",
     "title": "Papa ve Şehit",
     "bio": "I. yüzyılın sonunda papaydı; geleneğe göre Havari Petrus’un ardıllarından biridir. Korint Kilisesi’ndeki bölünmeler üzerine yazdığı mektup (Clemens’in Birinci Mektubu), Yeni Ahit dışında yazılmış en eski Hristiyan metinlerinden biridir.",
     "nameEn": "Clement I",
     "titleEn": "Pope and Martyr",
     "bioEn": "Pope at the end of the first century, one of the first successors of the Apostle Peter. His letter on the divisions in the Church of Corinth (the First Letter of Clement) is considered one of the oldest Christian texts written outside the New Testament."
    },
    {
     "name": "Miguel Agustín Pro",
     "title": "Rahip ve Şehit",
     "bio": "XX. yüzyılda Meksika’da, Kilise’ye zulmedildiği bir dönemde gizlice rahiplik yapan bir Cizvittir. Yakalandı ve kurşuna dizilerek idam edildi. Anlatılana göre idam edilirken kollarını haç gibi açtı ve “Yaşasın Mesih Kral!” diye haykırdı.",
     "nameEn": "Miguel Agustín Pro",
     "titleEn": "Priest and Martyr",
     "bioEn": "A Jesuit priest in twentieth-century Mexico, captured and executed by firing squad while secretly ministering as a priest during a period of religious persecution. He is said to have spread his arms in the form of a cross before being shot, crying out, \"Long live Christ the King.\""
    },
    {
     "name": "Columbanus",
     "title": "Başrahip",
     "bio": "VI-VII. yüzyılda İrlanda’dan Avrupa’ya giden bir misyoner keşiştir. Bugünkü Fransa, İsviçre ve İtalya’da manastırlar kurdu. İrlanda manastırcılığının Avrupa’ya taşınmasında öncü oldu.",
     "nameEn": "Columbanus",
     "titleEn": "Abbot",
     "bioEn": "A missionary monk who traveled from Ireland to continental Europe in the sixth and seventh centuries, founding monasteries in what is now France, Switzerland, and Italy. He played a pioneering role in carrying Irish monasticism to continental Europe."
    }
   ]
  },
  {
   "m": 11,
   "d": 24,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Andreas Dung-Lac ve Yoldaşları",
     "title": "Şehitler",
     "bio": "XVIII-XIX. yüzyıllarda Vietnam’da, Hristiyanlara yapılan zulümler sırasında şehit edilen yüz on yedi kişiyi anarız; aralarında Vietnamlı rahip Andreas Dung-Lac de vardır. Bu şehitler, Vietnam Katolik Kilisesi’nin ağır bedeller ödeyerek büyüyen tarihini temsil eder.",
     "nameEn": "Andrew Dung-Lac and Companions",
     "titleEn": "Martyrs",
     "bioEn": "Remembers a hundred and seventeen people martyred in Vietnam during periodic persecutions of Christianity in the eighteenth and nineteenth centuries, among them the native priest Andrew Dung-Lac. Their story is the story of the Catholic Church in Vietnam, which grew at a heavy price."
    }
   ]
  },
  {
   "m": 11,
   "d": 25,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "İskenderiyeli Katerina",
     "title": "Bakire ve Şehit",
     "bio": "Geleneğe göre IV. yüzyılın başında İskenderiye’de yaşamış, bilgisiyle tanınan soylu bir genç kadındır. Anlatılana göre Hristiyanlığa karşı çıkan filozofları tartışmada susturdu ve bu yüzden İmparator Maxentius’un emriyle şehit edildi. Orta Çağ boyunca öğrencilerin ve filozofların koruyucu azizesi olarak büyük saygı gördü.",
     "nameEn": "Catherine of Alexandria",
     "titleEn": "Virgin and Martyr",
     "bioEn": "Tradition says she was a brilliant young noblewoman of Alexandria in the early fourth century. She is said to have silenced in debate the philosophers who opposed Christianity, and for this was martyred by order of Emperor Maxentius. She was held in great honor throughout the Middle Ages as the patron saint of students and philosophers."
    }
   ]
  },
  {
   "m": 11,
   "d": 26,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Silvestro Gozzolini",
     "title": "Başrahip",
     "bio": "XIII. yüzyılda İtalya’da yaşadı. Kırk yaşından sonra kariyerini bırakıp inzivaya çekildi ve daha sonra Benedikten tarikatının Silvestrin kolunu kurdu.",
     "nameEn": "Sylvester Gozzolini",
     "titleEn": "Abbot",
     "bioEn": "A thirteenth-century Italian who, past the age of forty, left his career to live in solitude, and later founded the Sylvestrine branch of the Benedictines."
    }
   ]
  },
  {
   "m": 11,
   "d": 27,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Salzburglu Virgilius",
     "title": "Episkopos",
     "bio": "VIII. yüzyılda İrlanda’da doğmuş, Salzburg episkoposu olmuş bir bilgindir. Dünyanın yuvarlak olduğunu ve Dünya’nın öbür yarısında da insanların yaşayabileceğini savunduğu için döneminin bazı din adamlarıyla tartışmaya girdi.",
     "nameEn": "Virgilius of Salzburg",
     "titleEn": "Bishop",
     "bioEn": "A scholar born in Ireland who became bishop of Salzburg in the eighth century; he came into conflict with some clergy of his time for arguing that the Earth is spherical and that people could live in the southern hemisphere too."
    }
   ]
  },
  {
   "m": 11,
   "d": 28,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Giacomo della Marca",
     "title": "Rahip",
     "bio": "XV. yüzyılda İtalya’da yaşamış bir Fransisken vaizidir. Capistranolu Aziz Yuhanna ile birlikte, Fransiskenler arasında kuralı daha sıkı uygulamayı savunan yenilenme hareketinin öncülerindendir.",
     "nameEn": "James of the Marches",
     "titleEn": "Priest",
     "bioEn": "A Franciscan preacher in fifteenth-century Italy; together with Saint John of Capistrano, he was a pioneer of the Franciscan Observant reform."
    }
   ]
  },
  {
   "m": 11,
   "d": 29,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Toulouse Piskoposu Saturninus",
     "title": "Episkopos ve Şehit",
     "bio": "III. yüzyılda Fransa’daki Toulouse’un ilk episkoposuydu. Putperest bir tapınağın önünden geçerken yakalandı. Kurban sunmayı reddedince bir boğaya bağlanıp sürüklendi ve şehit edildi.",
     "nameEn": "Saturninus of Toulouse",
     "titleEn": "Bishop and Martyr",
     "bioEn": "The first bishop of Toulouse (France), in the third century. When he refused to sacrifice at a pagan temple, he was tied to a bull and dragged to death."
    }
   ]
  },
  {
   "m": 11,
   "d": 30,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Havari Andreas",
     "title": "",
     "bio": "Havari Petrus’un kardeşidir ve İsa’nın çağırdığı ilk öğrencilerden biridir. Yuhanna İncili’ne göre önce Vaftizci Yahya’nın öğrencisiydi, sonra İsa’yı izlemeye başladı ve kardeşi Petrus’u da O’nunla tanıştırdı. Geleneğe göre Müjde’yi Karadeniz kıyılarına ve Yunanistan’a götürdü ve X biçiminde bir çarmıhta şehit edildi.",
     "nameEn": "Andrew the Apostle",
     "titleEn": "",
     "bioEn": "The brother of the Apostle Peter and one of the first disciples Jesus called; according to the Gospel of John, he was first a disciple of John the Baptist before following Jesus, and then introduced his brother to him as well. Tradition holds that he carried the Gospel to the Black Sea coast and Greece, and was martyred on an X-shaped cross."
    }
   ]
  },
  {
   "m": 12,
   "d": 1,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Eligius",
     "title": "Episkopos",
     "bio": "VII. yüzyılda Fransa’da önce ünlü bir kuyumcu ve sarayın hazinedarıydı. Sonra rahip ve Noyon episkoposu oldu. Kuyumcuların ve nalbantların koruyucu azizidir.",
     "nameEn": "Eligius",
     "titleEn": "Bishop",
     "bioEn": "A famous goldsmith and royal treasurer in seventh-century France who became a priest and then bishop of Noyon. He is the patron saint of goldsmiths and blacksmiths."
    }
   ]
  },
  {
   "m": 12,
   "d": 2,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Bibiana",
     "title": "Bakire ve Şehit",
     "bio": "IV. yüzyılda Roma’da yaşadı. Anlatılana göre ailesiyle birlikte zulüm gördü ve kırbaçlanarak şehit edildi.",
     "nameEn": "Bibiana",
     "titleEn": "Virgin and Martyr",
     "bioEn": "A young woman of fourth-century Rome, said to have been persecuted together with her family and martyred by flogging."
    }
   ]
  },
  {
   "m": 12,
   "d": 3,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Fransuva Ksaviyer",
     "title": "Rahip",
     "bio": "XVI. yüzyılda İspanya’nın Bask bölgesinde doğdu. Paris’te Loyolalı İgnatius’un ilk arkadaşlarından biri ve Cizvit tarikatının kurucu üyelerinden oldu. Hindistan’da, Endonezya adalarında ve Japonya’da on yıl boyunca yorulmak bilmeden misyonerlik yaptı ve on binlerce kişiyi vaftiz etti. Çin’e girmeyi beklerken bir adada öldü. Bütün misyonların koruyucu azizidir.",
     "nameEn": "Francis Xavier",
     "titleEn": "Priest",
     "bioEn": "Born in sixteenth-century Spain (the Basque Country), he was one of Saint Ignatius of Loyola's first companions in Paris and a founding member of the Jesuit order. He did tireless missionary work for ten years in India, the islands of Indonesia, and Japan, baptizing tens of thousands of people. He died on an island while waiting to enter China. He is the patron saint of all foreign missions."
    }
   ]
  },
  {
   "m": 12,
   "d": 4,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Şamlı Yuhanna",
     "title": "Rahip ve Kilise Doktoru",
     "bio": "VII-VIII. yüzyılda İslam halifeliğinin yönetimindeki Şam’da önce yüksek bir devlet görevlisiydi, sonra keşiş oldu. Kutsal ikonaları savunan yazıları ve Doğu teolojisini düzenli bir şekilde özetleyen eseriyle, Doğu Hristiyanlığının son büyük Kilise Babası sayılır.",
     "nameEn": "John Damascene",
     "titleEn": "Priest and Doctor of the Church",
     "bioEn": "A high official at the caliph's court in Damascus who became a monk, in the seventh and eighth centuries. Through his defense of icons (sacred images) and his writings offering a systematic summary of Eastern theology, he is considered the last great Church Father of Eastern Christianity."
    }
   ]
  },
  {
   "m": 12,
   "d": 5,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Sabas",
     "title": "Başrahip",
     "bio": "V-VI. yüzyılda Filistin çölünde, bugün de faal olan Mar Saba Manastırı’nı kurdu. Doğu Kilisesi’nin ayin geleneğinin şekillenmesinde büyük etkisi oldu.",
     "nameEn": "Sabbas the Sanctified",
     "titleEn": "Abbot",
     "bioEn": "The fifth- and sixth-century monk who founded Mar Saba Monastery in the Palestinian desert, still active today. He had a great influence on shaping the liturgical tradition of the Eastern Church."
    }
   ]
  },
  {
   "m": 12,
   "d": 6,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Myralı Nikolaos (Noel Baba)",
     "title": "Episkopos",
     "bio": "IV. yüzyılda bugünkü Antalya’nın Demre ilçesinde, eski adıyla Myra’da episkopostu. Anlatılana göre çeyiz parası olmadığı için köle olarak satılma tehlikesiyle karşı karşıya kalan üç kızın evine gece gizlice altın attı. Bu hikâye onu gizli cömertliğin simgesi yaptı ve Noel Baba figürünün kökeni oldu. Çocukların, denizcilerin ve Anadolu’nun koruyucu azizlerindendir.",
     "nameEn": "Nicholas",
     "titleEn": "Bishop",
     "bioEn": "Bishop of Myra (modern Demre, Turkey) in the fourth century. He is the model of secret giving: the story goes that he threw gold into a house at night so that three sisters with no dowry would not be sold into slavery. That story is where Santa Claus comes from. He is one of the patron saints of children, sailors, and Anatolia."
    }
   ]
  },
  {
   "m": 12,
   "d": 7,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Milanolu Ambrosius",
     "title": "Episkopos ve Kilise Doktoru",
     "bio": "IV. yüzyılda Milano’da Roma valisiydi. Henüz vaftiz bile olmamışken halkın ısrarıyla episkopos seçildi. Vaazları, Augustinus’un imana gelmesinde belirleyici oldu. Kilise’nin özgürlüğünü cesaretle savundu: İmparator Theodosius’u bile, yaptırdığı bir katliam yüzünden kilise kapısında tövbe etmeye zorladı.",
     "nameEn": "Ambrose",
     "titleEn": "Bishop and Doctor of the Church",
     "bioEn": "While serving as Roman governor of Milan in the fourth century, he was elected bishop by popular demand before even being baptized. His sermons played a decisive role in Augustine's conversion. He was a courageous defender of the Church's freedom, bold enough to compel even Emperor Theodosius to do penance at the church door for a massacre."
    }
   ]
  },
  {
   "m": 12,
   "d": 8,
   "rank": "En Büyük Bayram",
   "saints": [
    {
     "name": "Meryem Ana’nın Lekesiz Gebeliği",
     "title": "",
     "bio": "Bu bayram, Meryem Ana’nın Mesih İsa’nın annesi olacağı için, ana rahmine düştüğü ilk andan itibaren özel bir lütufla asli günahtan korunduğunu kutlar. Papa IX. Pius 1854’te bunu Kilise’nin resmî öğretisi olarak ilan etti. Meryem bu ayrıcalıkla, Oğlu’nun kurtarışından ilk ve tam olarak pay alan kişi oldu.",
     "nameEn": "The Immaculate Conception of Mary",
     "titleEn": "",
     "bioEn": "Celebrates the truth that Mary, who was to be the mother of Christ, was kept free by a special grace from all stain of original sin from the first moment of her existence. Pope Pius IX defined it as a dogma in 1854. It makes Mary the first and fullest fruit of her Son's saving work."
    }
   ]
  },
  {
   "m": 12,
   "d": 9,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Juan Diego Cuauhtlatoatzin",
     "title": "",
     "bio": "XVI. yüzyılda bugünkü Meksika’da yaşamış, yeni Katolik olmuş Nahuatl bir yerlidir. Geleneğe göre 1531’de Guadalupe Meryem Anası ona birkaç kez göründü ve episkoposa bir mesaj iletmesini istedi. Bunun kanıtı olarak pelerininde mucizevi bir Meryem resmi belirdi. Bu görünme, Latin Amerika’nın Hristiyanlaşmasında çok büyük bir etki yaptı.",
     "nameEn": "Juan Diego Cuauhtlatoatzin",
     "titleEn": "",
     "bioEn": "A recently converted Nahua man who lived in sixteenth-century Mexico. Tradition holds that in 1531 Our Lady of Guadalupe appeared to him repeatedly and asked him to deliver a message to the bishop; as proof, a miraculous image of Mary appeared on his cloak. This apparition had a great impact on the Christianization of Latin America."
    }
   ]
  },
  {
   "m": 12,
   "d": 10,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Loreto Meryem Anası",
     "title": "",
     "bio": "Geleneğe göre Nasıra’daki Kutsal Aile’nin evi XIII. yüzyılda İtalya’nın Loreto kasabasına taşındı. Bu gün, bu inanca bağlı Meryem bağlılığını anar. Evin havadan taşındığı anlatıldığı için Loreto Meryem Anası havacıların koruyucusu olarak da anılır.",
     "nameEn": "Our Lady of Loreto",
     "titleEn": "",
     "bioEn": "A feast of Mary based on the tradition that the stones of the Holy Family's house in Nazareth were carried to the Italian town of Loreto in the thirteenth century. Because of the legend, Our Lady of Loreto is the patron saint of aviation."
    }
   ]
  },
  {
   "m": 12,
   "d": 11,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "I. Damasus",
     "title": "Papa",
     "bio": "IV. yüzyılda papaydı. Roma’daki şehit mezarlarını onarttı ve üzerlerine yazıtlar yazdırdı. Aziz Hieronymus’u Kutsal Kitap’ı Latinceye çevirmekle (Vulgata) görevlendirdi. Roma’nın Hristiyan kimliğinin güçlenmesine önemli katkılarda bulundu.",
     "nameEn": "Damasus I",
     "titleEn": "Pope",
     "bioEn": "Pope in the fourth century, who had the graves of Rome's martyrs restored and marked with inscriptions, and commissioned Saint Jerome to make the Latin translation of Scripture (the Vulgate). He made important contributions to consolidating Rome's Christian identity."
    }
   ]
  },
  {
   "m": 12,
   "d": 12,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Guadalupe Meryem Anası",
     "title": "",
     "bio": "1531’de Meksika’da Juan Diego’ya yerli bir kadın görünümünde gelen Meryem Ana’yı kutlar. Bu görünmeden sonra, İspanyol fethinin acısını yaşayan yerli halklar kitleler hâlinde Hristiyan oldu. Guadalupe Meryem Anası bütün Amerika kıtasının koruyucusudur.",
     "nameEn": "Our Lady of Guadalupe",
     "titleEn": "",
     "bioEn": "Celebrates the apparition of Mary to Juan Diego in Mexico in 1531, in which she appeared as an Indigenous woman. This apparition led to the mass conversion to Christianity of Indigenous peoples traumatized by the Spanish conquest. Our Lady of Guadalupe is honored as the patroness of the Americas."
    }
   ]
  },
  {
   "m": 12,
   "d": 13,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Sirakuzalı Lucia",
     "title": "Bakire ve Şehit",
     "bio": "IV. yüzyılın başında Sicilya’da yaşamış genç bir kızdır. Kendini Mesih İsa’ya adamıştı; onunla evlenmek isteyen bir adam onu ihbar etti ve İmparator Diocletianus’un zulmü sırasında şehit edildi. Adı “ışık” anlamına gelen kelimeden türediği için gözlerin koruyucu azizesi olarak da anılır. Kuzey Avrupa’da onun günü ışık şenlikleriyle kutlanır.",
     "nameEn": "Lucy of Syracuse",
     "titleEn": "Virgin and Martyr",
     "bioEn": "A young woman martyred in Sicily in the early fourth century, during Emperor Diocletian's persecution. She had consecrated her virginity to Christ, and a suitor she turned down denounced her. Because her name comes from the word for \"light,\" she is also venerated as the patron saint of the eyes; in northern Europe her day is celebrated with festivals of light."
    }
   ]
  },
  {
   "m": 12,
   "d": 14,
   "rank": "Anma Günü",
   "saints": [
    {
     "name": "Haçlı Yuhanna",
     "title": "Rahip ve Kilise Doktoru",
     "bio": "XVI. yüzyılda İspanya’da yaşamış bir rahiptir. Avilalı Teresa ile birlikte Karmelit tarikatını yenilemeye girişti. Yenilenmeye karşı çıkanlar onu hapsetti ve işkence etti. Hapiste yazdığı şiirler, Hristiyan mistik edebiyatının en büyük eserleri arasında sayılır. “Ruhun Karanlık Gecesi” kavramıyla tanınır.",
     "nameEn": "John of the Cross",
     "titleEn": "Priest and Doctor of the Church",
     "bioEn": "A priest in sixteenth-century Spain who undertook the reform of the Carmelite order together with Saint Teresa of Ávila. He was imprisoned and tortured by opponents of the reform; the poems he wrote in prison are counted among the greatest works of Christian mystical literature. He is known for the concept of \"the dark night of the soul.\""
    }
   ]
  },
  {
   "m": 12,
   "d": 15,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Virginia Centurione Bracelli",
     "title": "Bakire",
     "bio": "XVI-XVII. yüzyılda İtalya’da yaşadı ve genç yaşta dul kaldı. Servetini savaştan ve kıtlıktan etkilenen kadınlara ve kızlara yardım etmek için kullandı.",
     "nameEn": "Virginia Centurione Bracelli",
     "titleEn": "Virgin",
     "bioEn": "A woman of sixteenth- and seventeenth-century Italy who was widowed young and used her fortune to help women and girls who were victims of war and famine."
    }
   ]
  },
  {
   "m": 12,
   "d": 16,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Adelaide",
     "title": "İmparatoriçe",
     "bio": "X. yüzyılda Kutsal Roma İmparatoriçesi’ydi. Dul kaldıktan sonra manastırlar kurdurdu ve torunu III. Otto çocukken onun yerine ülkeyi yönetti.",
     "nameEn": "Adelaide",
     "titleEn": "Empress",
     "bioEn": "Holy Roman Empress in the tenth century. After she was widowed she founded monasteries and ruled as regent for her grandson, Otto III."
    }
   ]
  },
  {
   "m": 12,
   "d": 17,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Jean de Matha",
     "title": "Rahip",
     "bio": "XII-XIII. yüzyılda Fransa’da yaşamış bir rahiptir. Müslümanların elinde esir olan Hristiyanları fidye ödeyerek kurtarmak için Trinitarian tarikatını kurdu.",
     "nameEn": "John of Matha",
     "titleEn": "Priest",
     "bioEn": "A priest in twelfth- and thirteenth-century France who founded the Trinitarian order to ransom Christian captives held by Muslims."
    }
   ]
  },
  {
   "m": 12,
   "d": 18,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Tourslu Gatianus",
     "title": "Episkopos",
     "bio": "III. yüzyılda Fransa’daki Tours’un ilk episkoposuydu ve Roma’dan gönderilen ilk misyonerlerdendir.",
     "nameEn": "Gatian of Tours",
     "titleEn": "Bishop",
     "bioEn": "The first bishop of Tours (France) in the third century, one of the first missionaries sent from Rome."
    }
   ]
  },
  {
   "m": 12,
   "d": 19,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "I. Anastasius",
     "title": "Papa",
     "bio": "IV-V. yüzyılda kısa bir süre papalık yaptı. Aziz Hieronymus mektuplarında ondan övgüyle söz eder.",
     "nameEn": "Anastasius I",
     "titleEn": "Pope",
     "bioEn": "Pope for a short time around the year 400, praised in the letters of Saint Jerome."
    }
   ]
  },
  {
   "m": 12,
   "d": 20,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Domingo de Silos",
     "title": "Başrahip",
     "bio": "XI. yüzyılda İspanya’da bir manastırı yeniden canlandıran bir başrahiptir. Dominiken tarikatının kurucusu Aziz Dominik’in annesi, onun türbesinde dua ettikten sonra hamile kaldığına inanır; Dominik’in adı buradan gelir.",
     "nameEn": "Dominic of Silos",
     "titleEn": "Abbot",
     "bioEn": "An abbot in eleventh-century Spain who revived a monastery; his name is also linked to the birth of Saint Dominic (founder of the Dominican order), whose mother is believed to have conceived after praying at his shrine."
    }
   ]
  },
  {
   "m": 12,
   "d": 21,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Petrus Canisius",
     "title": "Rahip ve Kilise Doktoru",
     "bio": "XVI. yüzyılda bugünkü Hollanda’da doğmuş bir Cizvittir. Almanca konuşulan topraklarda Protestan Reformu karşısında Katolik inancını korumak için bir katekizm yazdı; bu kitap iki yüzyıl boyunca din eğitiminde temel kaynak olarak kullanıldı.",
     "nameEn": "Peter Canisius",
     "titleEn": "Priest and Doctor of the Church",
     "bioEn": "A Jesuit born in what is now the Netherlands in the sixteenth century. The catechism he wrote to preserve the Catholic faith against the Protestant Reformation in German-speaking lands became a basic educational tool used for two centuries."
    }
   ]
  },
  {
   "m": 12,
   "d": 22,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Francesca Saverio Cabrini",
     "title": "Bakire",
     "bio": "İtalya’da doğmuş bir öğretmendir. Gençliğinde sağlığı zayıf görüldüğü için manastırlara kabul edilmedi; bunun üzerine Kutsal Yürek Misyoner Rahibeleri’ni kendisi kurdu. Amerika’ya göç eden İtalyanlara hizmet etmek için okyanusu otuz kez aştı ve dört kıtada altmıştan fazla yetimhane, okul ve hastane kurdurdu. 1946’da aziz ilan edildi, 1950’de de bütün göçmenlerin koruyucu azizesi ilan edildi. ABD vatandaşı olan ilk azizedir.",
     "nameEn": "Frances Xavier Cabrini",
     "titleEn": "Virgin",
     "bioEn": "An Italian teacher who, turned away by convents as a young woman because of her poor health, founded the Missionary Sisters of the Sacred Heart instead. She crossed the ocean thirty times to serve Italian immigrants in America, and had more than sixty orphanages, schools, and hospitals built across four continents. She was canonized in 1946, and in 1950 declared the heavenly patron saint of all immigrants; she is the first American citizen to be canonized."
    }
   ]
  },
  {
   "m": 12,
   "d": 23,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Jan Kanty",
     "title": "Rahip",
     "bio": "XIV-XV. yüzyılda Polonya’da üniversite hocası olan bir rahiptir. Kazandığı parayı hep yoksullara dağıttığı için çoğu zaman kendisinin elinde neredeyse hiçbir şey kalmazdı. Alçakgönüllülüğü ve cömertliğiyle tanınır.",
     "nameEn": "John Cantius",
     "titleEn": "Priest",
     "bioEn": "A university professor in fourteenth- and fifteenth-century Poland who constantly gave away his earnings to the poor, so that he himself was often left with almost nothing. He is known for his humility and generosity."
    }
   ]
  },
  {
   "m": 12,
   "d": 24,
   "rank": "Ortaçağ Batı Geleneği",
   "saints": [
    {
     "name": "Adem ile Havva",
     "title": "",
     "bio": "Orta Çağ’da Batı Avrupa’nın halk takviminde bu gün, Yaratılış kitabındaki ilk insan çiftini anma günüydü. O gün kiliselerde oynanan “Cennet Oyunu”nda üzerine elmalar asılmış bir çam ağacı, yani “Cennet Ağacı” kullanılırdı. Bugün dünyanın her yerinde süslenen Noel ağacının kökeni büyük ölçüde bu unutulmuş geleneğe dayanır.",
     "nameEn": "Adam and Eve",
     "titleEn": "",
     "bioEn": "In the popular calendar of medieval Western Europe, this was the feast of Adam and Eve; the \"Paradise Play\" staged in churches that day used a fir tree hung with apples (the Tree of Paradise). Today's Christmas tree largely goes back to this forgotten custom."
    }
   ]
  },
  {
   "m": 12,
   "d": 25,
   "rank": "En Büyük Bayram",
   "saints": [
    {
     "name": "Rab’bin Doğuşu (Noel)",
     "title": "",
     "bio": "Allah’ın Oğlu’nun Beytlehem’de Meryem Ana’dan insan olarak doğmasını kutlar. Hristiyanlığın en temel sırlarından biri olan Enkarnasyon’u, yani sonsuz Allah’ın insan doğasını üstlenmesini anar. Paskalya’dan sonra Kilise’nin en önemli bayramıdır; dört haftalık hazırlık dönemi olan Advent ile bu güne varılır.",
     "nameEn": "The Nativity of the Lord (Christmas)",
     "titleEn": "",
     "bioEn": "Celebrates the birth of the Son of God as a man, from Mary, in Bethlehem: the Incarnation, one of the deepest mysteries of the faith, in which the infinite God takes on a finite human nature. It is the Church's most important feast after Easter, and is preceded by Advent, a four-week season of preparation."
    }
   ]
  },
  {
   "m": 12,
   "d": 26,
   "rank": "Bayram",
   "saints": [
    {
     "name": "İstefanos",
     "title": "İlk Şehit",
     "bio": "Elçilerin İşleri’ne göre ilk Kilise’de yoksullara hizmet için seçilen yedi diyakozdan biridir. Yüksek Kurul önünde yaptığı ateşli konuşma yüzünden taşlanarak öldürüldü. Ölürken onu öldürenleri affetti. Olaya, sonradan Pavlus olacak genç bir Ferisi olan Saul da tanık oldu. Kilise’nin ilk şehididir.",
     "nameEn": "Stephen",
     "titleEn": "The First Martyr",
     "bioEn": "According to the Acts of the Apostles, one of the seven deacons chosen to serve the poor in the early Church. He was stoned to death for the fiery speech he gave before the Sanhedrin; as he died he forgave his killers, and among the witnesses was the young Pharisee Saul (later Paul). He is the Church's first martyr."
    }
   ]
  },
  {
   "m": 12,
   "d": 27,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Havari ve İncil Yazarı Yuhanna",
     "title": "",
     "bio": "Zebedi’nin oğludur ve İsa’nın en çok sevdiği öğrenci olarak anılır. Yuhanna İncili’ni, üç mektubu ve geleneğe göre Vahiy Kitabı’nı yazdı. İsa çarmıhtayken Meryem Ana’yı ona emanet etti. On iki havari arasında şehit edilmeden, ileri yaşta eceliyle ölen tek kişi olduğu kabul edilir.",
     "nameEn": "John the Apostle and Evangelist",
     "titleEn": "",
     "bioEn": "The son of Zebedee, the apostle remembered as Jesus's most beloved disciple. He wrote the Gospel of John, three epistles, and, tradition holds, the Book of Revelation. The Gospel tells that Jesus entrusted Mary to him from the cross. He is held to be the only one of the twelve apostles who died a natural death in old age, without being martyred."
    }
   ]
  },
  {
   "m": 12,
   "d": 28,
   "rank": "Bayram",
   "saints": [
    {
     "name": "Masum Çocuklar",
     "title": "Şehitler",
     "bio": "Matta İncili’ne göre Kral Hirodes, yeni doğan İsa’yı öldürmek için Beytlehem ve çevresindeki iki yaşından küçük bütün erkek çocukları öldürttü. Bu gün o masum çocukları anar. Daha konuşamayacak yaştaydılar, ama Mesih İsa uğruna canlarını veren ilk şehitler sayılırlar.",
     "nameEn": "The Holy Innocents",
     "titleEn": "Martyrs",
     "bioEn": "Remembers the boys of Bethlehem and the villages around it, two years old and under, whom King Herod had killed in his attempt to put the newborn Jesus to death (Matthew 2). These innocent children, too young even to speak, are honored as the first martyrs to die for Christ."
    }
   ]
  },
  {
   "m": 12,
   "d": 29,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "Thomas Becket",
     "title": "Episkopos ve Şehit",
     "bio": "XII. yüzyılda İngiltere’de önce kralın yakın dostu ve başbakanıydı. Canterbury başepiskoposu olunca, Kilise’nin haklarını Kral II. Henricus’un müdahalelerine karşı savunmaya başladı. Bu yüzden kralın adamları onu kendi katedralinde öldürdü. Kilise’nin özgürlüğü için canını veren episkoposların simgesi olmuştur.",
     "nameEn": "Thomas Becket",
     "titleEn": "Bishop and Martyr",
     "bioEn": "First a close friend and chancellor of the king in twelfth-century England, once he became archbishop of Canterbury he defended the Church's rights against the king, Henry II. For this he was killed by the king's men in his own cathedral. He became a symbol of bishops who gave their lives for the Church's freedom."
    }
   ]
  },
  {
   "m": 12,
   "d": 30,
   "rank": "Roma Azizler Cetveli",
   "saints": [
    {
     "name": "Selanikli Anysia",
     "title": "Bakire ve Şehit",
     "bio": "III-IV. yüzyılda Yunanistan’daki Selanik’te yaşamış genç bir kızdır. Zulüm döneminde gizlenmeye çalışırken bir Roma askeri onu fark etti ve öldürdü.",
     "nameEn": "Anysia",
     "titleEn": "Virgin and Martyr",
     "bioEn": "A young woman of Thessalonica (Greece) around the year 300, killed by a Roman soldier who spotted her while she was hiding during a persecution."
    }
   ]
  },
  {
   "m": 12,
   "d": 31,
   "rank": "İhtiyari Anma Günü",
   "saints": [
    {
     "name": "I. Silvester",
     "title": "Papa",
     "bio": "IV. yüzyılın başında yirmi yıldan fazla Roma episkoposu olarak görev yaptı. Papalığı, Hristiyanlığın Roma İmparatorluğu’nda serbest bırakıldığı 313 tarihli Milano Fermanı’ndan hemen sonraki döneme denk gelir. Bu dönemde Roma’da, Lateran Bazilikası ve eski Aziz Petrus Bazilikası dahil ilk büyük bazilikalar yapılmaya başlandı. 325’teki I. İznik Konsili’ne temsilciler gönderdi. Yıl onun anmasıyla kapanır; Batı’da yılbaşı gecesi geleneksel olarak onun adıyla anılır.",
     "nameEn": "Sylvester I",
     "titleEn": "Pope",
     "bioEn": "He served as bishop of Rome for more than twenty years from the early fourth century. His papacy falls in the period immediately following the Edict of Milan of 313, which freed Christianity within the Roman Empire; during this time the first great basilicas of Rome, including the Lateran and the old St. Peter's Basilica, began to be built. He sent representatives to the First Council of Nicaea in 325. The year closes with his feast; in the West, New Year's Eve is traditionally named after him."
    }
   ]
  }
 ],
 "movable": [
  {
   "id": "kul-carsambasi",
   "offset": -46,
   "title": "Kül Çarşambası",
   "rank": "Büyük Perhiz Başlangıcı",
   "bio": "Büyük Perhiz’in ilk günüdür. Ayin sırasında alına sürülen kül, insanın ölümlü olduğunu ve tövbeye çağrıldığını hatırlatır: “Toprak olduğunu ve toprağa döneceğini unutma.” Bu günden Paskalya’ya kadar kırk günlük bir hazırlık dönemi sürer. Oruç, dua ve sadaka bu dönemin üç temel uygulamasıdır.",
   "titleEn": "Ash Wednesday",
   "rankEn": "The Beginning of Lent",
   "bioEn": "The first day of Lent. The ashes placed on the forehead during Mass recall human mortality and the call to repentance: \"Remember that thou art dust, and unto dust thou shalt return.\" A forty-day period of preparation continues from this day until Easter; fasting, prayer, and almsgiving are the three basic practices of this season."
  },
  {
   "id": "hurma-pazari",
   "offset": -7,
   "title": "Hurma Pazarı",
   "rank": "Büyük Bayram",
   "bio": "Mesih İsa’nın Kudüs’e girişini, halkın O’nu hurma dallarıyla karşılamasını anar ve Kutsal Hafta’yı açar. Ayin sevinçli bir alayla başlar, sonra İsa’nın çektiği acıların anlatıldığı İncil bölümü okunur ve hava birden ağırlaşır. Bu karşıtlık, Kutsal Hafta’nın bütün ruhunu özetler.",
   "titleEn": "Palm Sunday",
   "rankEn": "Solemnity",
   "bioEn": "Remembers Christ's entry into Jerusalem, welcomed by the people with palm branches, and opens Holy Week. The Mass begins with a joyful procession, then suddenly turns solemn with the reading of Christ's Passion; this contrast sums up the whole character of Holy Week."
  },
  {
   "id": "kutsal-persembe",
   "offset": -3,
   "title": "Kutsal Perşembe",
   "rank": "Büyük Bayram",
   "bio": "Son Akşam Yemeği’ni, Efkaristiya’nın ve rahipliğin kurulmasını anar. Bazı kiliselerde Ayin sırasında ayak yıkama töreni yapılır; bu, Mesih İsa’nın havarilerinin ayaklarını yıkayarak verdiği alçakgönüllü hizmet örneğini hatırlatır. Kutsal Perşembe akşamıyla Paskalya’nın üç kutsal günü başlar.",
   "titleEn": "Holy Thursday",
   "rankEn": "Solemnity",
   "bioEn": "Remembers the Last Supper, and the institution of the Eucharist and the Sacrament of Holy Orders. During Mass, some churches hold a washing of the feet; this recalls the example of humble service Christ gave by washing his apostles' feet. Holy Thursday begins the Easter Triduum."
  },
  {
   "id": "kutsal-cuma",
   "offset": -2,
   "title": "Kutsal Cuma",
   "rank": "Büyük Bayram",
   "bio": "Mesih İsa’nın çarmıhta çektiği acıları ve ölümünü anar. Kilise’nin Ayin kutlamadığı tek gündür. Bu günkü tören, İsa’nın acılarının anlatıldığı İncil bölümünün okunmasını, bütün insanlık için edilen büyük duaları, haça saygı gösterilmesini ve bir gün önce kutsanmış ekmekle komünyonu içerir. Oruç ve etten perhiz günüdür.",
   "titleEn": "Good Friday",
   "rankEn": "Solemnity",
   "bioEn": "Remembers Christ's Passion and death on the cross. It is the only day of the year on which the Church does not celebrate Mass. The service includes the reading of the Passion in the Liturgy of the Word, great intercessory prayers for all humanity, the veneration of the cross, and Communion with hosts consecrated beforehand. It is a day of fasting and abstinence."
  },
  {
   "id": "kutsal-cumartesi",
   "offset": -1,
   "title": "Kutsal Cumartesi",
   "rank": "Büyük Bayram",
   "bio": "Mesih İsa’nın mezarda kaldığı günü ve Kilise’nin sessiz, umut dolu bekleyişini anar. Gündüz Ayin kutlanmaz. Gece Paskalya Nöbeti ile Diriliş kutlanmaya başlar. Nöbette ateş ve Paskalya mumu kutsanır, Kutsal Kitap’tan uzun okumalar yapılır, vaftiz suyu kutsanır ve genellikle yeni üyeler vaftiz edilir ya da Kilise’ye kabul edilir.",
   "titleEn": "Holy Saturday",
   "rankEn": "Solemnity",
   "bioEn": "Remembers Christ's rest in the tomb, and the Church's silent, hopeful waiting. No Mass is celebrated during the day; at night the celebration of the Resurrection begins with the Easter Vigil. The Vigil includes the blessing of the fire and the Paschal candle, a long series of Scripture readings, the blessing of the baptismal water, and usually the baptism of new members or their reception into the Church."
  },
  {
   "id": "paskalya",
   "offset": 0,
   "title": "Paskalya, Rab’bin Dirilişi",
   "rank": "En Büyük Bayram",
   "bio": "Hristiyan inancının kalbidir: Mesih İsa’nın ölümden dirilişi. Kilise’nin en eski ve en büyük bayramıdır; bütün ayin yılı bu bayramın etrafında şekillenir. Elli günlük Paskalya dönemi bu günden Pentekost’a kadar sürer.",
   "titleEn": "Easter, the Resurrection of the Lord",
   "rankEn": "Principal Solemnity",
   "bioEn": "The heart of the Christian faith: the resurrection of Christ from the dead. It is the Church's oldest and greatest feast; the entire liturgical year is shaped around it. The fifty-day Easter season runs from this day until Pentecost."
  },
  {
   "id": "ilahi-merhamet",
   "offset": 7,
   "title": "İlahi Merhamet Pazarı",
   "rank": "En Büyük Bayram",
   "bio": "Paskalya’nın sekizinci günü kutlanır ve dirilmiş Mesih İsa’nın havarilere görünüp Tomas’ın şüphesini gidermesini anar. Azize Faustina Kowalska’nın görümlerine dayanan bu anmayı Papa II. Yuhanna Pavlus 2000 yılında bütün Kilise için ilan etti. Allah’ın sonsuz merhametini vurgular.",
   "titleEn": "Divine Mercy Sunday",
   "rankEn": "Principal Solemnity",
   "bioEn": "Celebrated on the eighth day of Easter, it remembers Christ appearing to the apostles and putting Thomas's doubts to rest. In response to the visions of Saint Faustina Kowalska, Pope John Paul II made it a feast for the whole Church in 2000, to celebrate God's infinite mercy."
  },
  {
   "id": "goge-cikis",
   "offset": 39,
   "title": "Rab’bin Göğe Çıkışı",
   "rank": "En Büyük Bayram",
   "bio": "Mesih İsa’nın dirilişinden kırk gün sonra, havarilerinin gözü önünde göğe yükselişini anar. İncil’e göre İsa onlara Kutsal Ruh’u göndereceğini söyledi ve Müjde’yi bütün uluslara duyurma görevini verdi. Bu bayram, Mesih İsa’nın insan doğasının da Allah’ın yanındaki yüceliğe girişini kutlar.",
   "titleEn": "The Ascension of the Lord",
   "rankEn": "Principal Solemnity",
   "bioEn": "Remembers Christ's ascension into heaven before his apostles' eyes, forty days after the Resurrection. According to the Gospel, he promised them he would send the Holy Spirit and gave them the task of spreading the Gospel to all nations. The feast celebrates Christ's human nature entering the glory of God."
  },
  {
   "id": "pentekost",
   "offset": 49,
   "title": "Pentekost",
   "rank": "En Büyük Bayram",
   "bio": "Paskalya’dan elli gün sonra Kutsal Ruh’un, Meryem Ana’nın ve havarilerin üzerine ateşten diller gibi inişini anar. Elçilerin İşleri’ne göre bu olay Kilise’nin doğuşudur; havariler o günden itibaren korkmadan vaaz etmeye başladı. Paskalya dönemi bu bayramla sona erer.",
   "titleEn": "Pentecost",
   "rankEn": "Principal Solemnity",
   "bioEn": "Remembers the Holy Spirit coming down as tongues of fire upon Mary and the apostles, fifty days after Easter. According to the Acts of the Apostles, this event is the birth of the Church; from that day the apostles began to preach fearlessly. It marks the end of the Easter season."
  },
  {
   "id": "kutsal-uclu",
   "offset": 56,
   "title": "Kutsal Üçlü Birlik",
   "rank": "En Büyük Bayram",
   "bio": "Hristiyan inancının merkezindeki sırrı kutlar: Tek Allah’ın Peder, Oğul ve Kutsal Ruh olarak üç kişide var olması. Bu sır akılla tam olarak kavranamaz; Kilise bu gerçeği, Mesih İsa’nın kendisini, Peder’i ve Kutsal Ruh’u bize açıklamasıyla bilir. Pentekost’tan sonraki ilk pazar kutlanır.",
   "titleEn": "The Holy Trinity",
   "rankEn": "Principal Solemnity",
   "bioEn": "Celebrates the central mystery of the Christian faith: the one God existing in three persons, Father, Son, and Holy Spirit. This mystery cannot be fully grasped by reason; the Church knows this truth through what Christ revealed about himself and his relationship with the Father and the Holy Spirit. It is celebrated on the first Sunday after Pentecost."
  },
  {
   "id": "kutsal-beden-kan",
   "offset": 60,
   "title": "Mesih İsa’nın Kutsal Bedeni ve Kanı (Corpus Christi)",
   "rank": "En Büyük Bayram",
   "bio": "Efkaristiya’da, ekmek ve şarap görünümü altında gerçekten bulunan Mesih İsa’nın Bedeni’ni ve Kanı’nı kutlar. Birçok ülkede bu gün Kutsal Efkaristiya sokaklarda alayla taşınır. Kutsal Üçlü pazarından sonraki perşembe günü kutlanır; birçok ülkede ise ondan sonraki pazara alınır.",
   "titleEn": "The Body and Blood of Christ (Corpus Christi)",
   "rankEn": "Principal Solemnity",
   "bioEn": "Celebrates the Body and Blood of Christ, truly present under the appearance of bread and wine in the Eucharist. In many countries this day is celebrated with a traditional ceremony in which the Blessed Sacrament is carried in procession through the streets. It is celebrated on the Thursday after Trinity Sunday."
  },
  {
   "id": "kutsal-yurek",
   "offset": 68,
   "title": "Mesih İsa’nın Kutsal Yüreği",
   "rank": "En Büyük Bayram",
   "bio": "Mesih İsa’nın insanlığa duyduğu sonsuz ve kendini feda eden sevgisini, yüreği simgesiyle kutlar. Bu bağlılık özellikle XVII. yüzyılda Azize Marguerite-Marie Alacoque’un gördüğü görümlerle yaygınlaştı. Corpus Christi bayramından sonraki cuma günü kutlanır; aynı zamanda rahiplerin kutsallığı için dua günüdür.",
   "titleEn": "The Sacred Heart of Jesus",
   "rankEn": "Principal Solemnity",
   "bioEn": "Celebrates, through the symbol of his heart, Christ's infinite and self-sacrificing love for humanity. This devotion spread widely especially through the visions given to Saint Margaret Mary Alacoque in the seventeenth century. It is celebrated on the Friday after the feast of Corpus Christi, and is also observed as a day of prayer for the sanctification of priests."
  },
  {
   "id": "meryem-kalbi",
   "offset": 69,
   "title": "Meryem Ana’nın Lekesiz Yüreği",
   "rank": "Anma Günü",
   "bio": "Meryem Ana’nın Allah’a ve Oğlu’na duyduğu kusursuz sevgiyi, imanını ve iç dünyasını anar. Luka İncili’nde Meryem’in “bütün bunları yüreğinde saklayıp derin derin düşündüğü” yazar. Kutsal Yürek bayramından bir gün sonra, onunla birlikte kutlanır.",
   "titleEn": "The Immaculate Heart of Mary",
   "rankEn": "Memorial",
   "bioEn": "Honors Mary's perfect love for God and her Son, her faith, and her interior life. The Gospel of Luke says that Mary \"kept all these things, pondering them in her heart.\" It is paired with the feast of the Sacred Heart and celebrated the day after it."
  }
 ]
}/*JSON-END*/;
