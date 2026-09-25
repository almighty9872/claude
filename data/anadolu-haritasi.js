/* =====================================================================
 * EN: "Anatolian Roots" interactive map on topraklarimizda-hristiyanlik.html
 *     (and en/anatolia.html): the places, each with a short history and
 *     its Scripture references. "lat"/"lon" place the marker (tools/
 *     build.ps1 projects them onto the outline in anadolu-harita-sekli.js);
 *     "lx"/"ly"/"la" nudge the name label (map units, text-anchor).
 *     "section" links to a section id of the essay on the same page.
 *     Original writing for this site; no em dashes.
 * TR: Topraklarimizda Hristiyanlik haritasi. Duzenledikten sonra
 *     tools/build.ps1 calistirin. JSON-START / JSON-END isaretlerini
 *     silmeyin.
 * ===================================================================== */
window.ANATOLIA_MAP = /*JSON-START*/{
  "title": "Anadolu’daki Kökler Haritası",
  "en": "Anatolian Roots Map",
  "lead": "Haritadaki noktaların üzerine gelin ya da dokunun: her durağın kısa tarihi ve Kutsal Kitap’taki yeri açılır. Bir noktaya tıklarsanız bilgi kartı yerinde kalır.",
  "leadEn": "Hover over or tap the points on the map to see each place’s short history and where it appears in Scripture. Click a point to keep its card open.",
  "cats": [
    { "id": "pavlus", "tr": "Pavlus’un Yolları", "en": "Paul’s Journeys" },
    { "id": "kilise", "tr": "Vahiy’in Yedi Kilisesi", "en": "Seven Churches of Revelation" },
    { "id": "konsil", "tr": "Büyük Konsiller", "en": "The Great Councils" },
    { "id": "gelenek", "tr": "Azizler ve Manastırlar", "en": "Saints and Monasteries" },
    { "id": "eski", "tr": "Eski Ahit", "en": "Old Testament" }
  ],
  "sites": [
    {
      "id": "antakya", "cat": "pavlus", "lat": 36.2021, "lon": 36.1606, "lx": 11, "ly": 4, "la": "start", "section": "pavlus",
      "tr": { "name": "Antakya", "old": "Antiokheia", "place": "Hatay",
        "text": "Kudüs’ten sonraki ilk büyük Hristiyan cemaati burada doğdu ve İsa’nın öğrencileri ilk kez burada “Hristiyan” diye anıldı. Pavlus ile Barnabas misyon yolculuklarına buradan gönderildi. Geleneğe göre Petrus da burada vaaz etti; kentin kenarındaki Sen Piyer Mağara Kilisesi bu anıyı yaşatır. “Katolik Kilisesi” tabirini ilk kullanan Aziz İgnatius da Antakya episkoposuydu.",
        "refs": ["Elçilerin İşleri 11:19-26", "Elçilerin İşleri 13:1-3", "Galatyalılar 2:11"] },
      "en": { "name": "Antioch", "old": "Antakya", "place": "Hatay province",
        "text": "After Jerusalem, the first great Christian community grew up here, and it was here that Jesus’s disciples were first called “Christians.” Paul and Barnabas were sent out on their missionary journeys from Antioch. Tradition holds that Peter preached here too; the St. Peter Cave Church on the edge of the city keeps that memory alive. St. Ignatius, the first writer to use the term “Catholic Church,” was bishop of Antioch.",
        "refs": ["Acts 11:19-26", "Acts 13:1-3", "Galatians 2:11"] }
    },
    {
      "id": "tarsus", "cat": "pavlus", "lat": 36.9177, "lon": 34.8928, "lx": -11, "ly": 4, "la": "end", "section": "pavlus",
      "tr": { "name": "Tarsus", "old": "", "place": "Mersin",
        "text": "Havari Pavlus’un doğduğu kent. Pavlus kendini “Kilikya’daki Tarsus’un, hiç de önemsiz olmayan bir kentin yurttaşı” diye tanıtır. Mesih’e döndükten sonra bir süre burada yaşadı; Barnabas onu Antakya’daki cemaate katılması için Tarsus’tan aldı. Bugün kentte Aziz Pavlus’a adanmış kilise-müze ve geleneğin onun evine bağladığı Pavlus Kuyusu ziyaret edilebilir.",
        "refs": ["Elçilerin İşleri 9:11", "Elçilerin İşleri 11:25-26", "Elçilerin İşleri 21:39", "Elçilerin İşleri 22:3"] },
      "en": { "name": "Tarsus", "old": "", "place": "Mersin province",
        "text": "The birthplace of the Apostle Paul, who introduced himself as “a citizen of Tarsus in Cilicia, no ordinary city.” After his conversion he lived here for a time, until Barnabas came to Tarsus to bring him to the community at Antioch. Today visitors can see a church museum dedicated to St. Paul and the well that tradition links to his family home.",
        "refs": ["Acts 9:11", "Acts 11:25-26", "Acts 21:39", "Acts 22:3"] }
    },
    {
      "id": "yalvac", "cat": "pavlus", "lat": 38.3060, "lon": 31.1890, "lx": 0, "ly": -12, "la": "middle", "section": "pavlus",
      "tr": { "name": "Yalvaç", "old": "Pisidia Antiokheiası", "place": "Isparta",
        "text": "Pavlus, ilk misyon yolculuğunda uğradığı bu kentin sinagogunda, Kutsal Kitap’ta kaydedilen ilk uzun vaazını verdi. Dinleyenlerin bir kısmı onu reddedince Pavlus ile Barnabas Müjde’yi artık uluslara da götüreceklerini ilan ettiler; bu an, Hristiyanlığın bütün dünyaya yayılmasının dönüm noktalarından sayılır.",
        "refs": ["Elçilerin İşleri 13:14-52", "2 Timoteos 3:11"] },
      "en": { "name": "Pisidian Antioch", "old": "Yalvaç", "lx": 11, "ly": 4, "la": "start", "place": "Isparta province",
        "text": "On his first missionary journey Paul gave his first long sermon recorded in Scripture in the synagogue of this city. When some of his hearers rejected it, Paul and Barnabas announced that they would now take the Gospel to the Gentiles as well, one of the turning points in Christianity’s spread to the whole world.",
        "refs": ["Acts 13:14-52", "2 Timothy 3:11"] }
    },
    {
      "id": "konya", "cat": "pavlus", "lat": 37.8746, "lon": 32.4932, "lx": 11, "ly": 4, "la": "start", "section": "pavlus",
      "tr": { "name": "Konya ve Listra", "label": "Konya", "old": "İkonion", "place": "Konya",
        "text": "Pavlus ile Barnabas ilk yolculuklarında İkonion’da uzun süre kalıp vaaz ettiler. Yakındaki Listra’da (bugünkü Hatunsaray yakınında) Pavlus doğuştan kötürüm bir adamı iyileştirdi; halk onları tanrı sanıp kurban sunmak istedi, kısa süre sonra da Pavlus taşlanıp ölü diye kentin dışına atıldı. Pavlus’un en yakın çalışma arkadaşı olacak Timoteos’la da bu bölgede tanıştı.",
        "refs": ["Elçilerin İşleri 14:1-20", "Elçilerin İşleri 16:1-2", "2 Timoteos 3:11"] },
      "en": { "name": "Iconium and Lystra", "label": "Iconium", "old": "Konya", "place": "Konya province",
        "text": "On their first journey Paul and Barnabas stayed a long time in Iconium, preaching. In nearby Lystra (near today’s Hatunsaray) Paul healed a man lame from birth; the crowd took the two for gods and wanted to offer sacrifice to them, and soon afterwards Paul was stoned and dragged out of the city for dead. It was also in this region that he met Timothy, who became his closest co-worker.",
        "refs": ["Acts 14:1-20", "Acts 16:1-2", "2 Timothy 3:11"] }
    },
    {
      "id": "perge", "cat": "pavlus", "lat": 36.9613, "lon": 30.8541, "lx": 11, "ly": 4, "la": "start", "section": "pavlus",
      "tr": { "name": "Perge ve Antalya", "label": "Perge", "old": "Perge ve Attaleia", "place": "Antalya",
        "text": "Kıbrıs’tan dönen Pavlus ile Barnabas, Pamfilya kıyısındaki Perge’ye geldiler; genç Markos onlardan burada ayrılıp Kudüs’e döndü. Dönüş yolunda Perge’de de vaaz eden iki havari, Attaleia’nın, yani bugünkü Antalya’nın limanından gemiyle Antakya’ya döndü.",
        "refs": ["Elçilerin İşleri 13:13-14", "Elçilerin İşleri 14:24-26"] },
      "en": { "name": "Perga and Attalia", "label": "Perga", "old": "Perge and Antalya", "place": "Antalya province",
        "text": "Sailing back from Cyprus, Paul and Barnabas came to Perga on the coast of Pamphylia, where the young John Mark left them and returned to Jerusalem. On the way home the two apostles preached in Perga as well, then sailed back to Antioch from the port of Attalia, today’s Antalya.",
        "refs": ["Acts 13:13-14", "Acts 14:24-26"] }
    },
    {
      "id": "ankara", "cat": "pavlus", "lat": 39.9334, "lon": 32.8597, "lx": 11, "ly": 4, "la": "start", "section": "pavlus",
      "tr": { "name": "Ankara", "old": "Ankyra, Galatya", "place": "Ankara",
        "text": "Ankara, Roma döneminde Galatya eyaletinin merkeziydi. Pavlus yolculuklarında Galatya bölgesinden birkaç kez geçti ve bu bölgenin kiliselerine, Mesih’teki özgürlüğü anlatan Galatyalılar’a Mektup’u yazdı; mektubun tam olarak hangi Galatya kentlerine gittiği tarihçiler arasında tartışmalıdır. Kentin ortasındaki Augustus Tapınağı sonradan kiliseye dönüştürülmüştür.",
        "refs": ["Galatyalılar 1:1-2", "Elçilerin İşleri 16:6", "Elçilerin İşleri 18:23"] },
      "en": { "name": "Ankara", "old": "Ancyra, Galatia", "place": "Ankara province",
        "text": "In Roman times Ankara was the capital of the province of Galatia. Paul passed through the Galatian region several times on his journeys and wrote to its churches the Letter to the Galatians, on freedom in Christ; which Galatian cities it was sent to is still debated by historians. The Temple of Augustus in the city centre was later turned into a church.",
        "refs": ["Galatians 1:1-2", "Acts 16:6", "Acts 18:23"] }
    },
    {
      "id": "troas", "cat": "pavlus", "lat": 39.7514, "lon": 26.1586, "lx": -11, "ly": 4, "la": "end", "section": "pavlus",
      "tr": { "name": "Troas", "old": "Aleksandreia Troas", "place": "Çanakkale",
        "text": "Pavlus ikinci yolculuğunda Troas’tayken gece bir görüm gördü: Makedonyalı bir adam ona “Makedonya’ya geç, bize yardım et!” diye yalvarıyordu. Pavlus’un buradan gemiye binmesiyle Müjde ilk kez Avrupa’ya ulaştı. Yıllar sonra yine Troas’ta, Pavlus’un gece yarısına kadar süren konuşması sırasında pencereden düşen genç Eftihos yaşama döndürüldü.",
        "refs": ["Elçilerin İşleri 16:8-11", "Elçilerin İşleri 20:6-12", "2 Timoteos 4:13"] },
      "en": { "name": "Troas", "old": "Alexandria Troas", "place": "Çanakkale province",
        "text": "On his second journey, at Troas, Paul saw a vision in the night: a man of Macedonia begging him, “Come over to Macedonia and help us!” When Paul set sail from here, the Gospel reached Europe for the first time. Years later, again at Troas, the young Eutychus fell from a window while Paul talked on until midnight, and was restored to life.",
        "refs": ["Acts 16:8-11", "Acts 20:6-12", "2 Timothy 4:13"] }
    },
    {
      "id": "demre", "cat": "pavlus", "lat": 36.2446, "lon": 29.9851, "lx": 0, "ly": 22, "la": "middle", "section": "",
      "tr": { "name": "Demre", "old": "Myra", "place": "Antalya",
        "text": "Roma’ya tutuklu olarak götürülen Pavlus, Likya’daki Myra limanında İtalya’ya giden bir gemiye aktarıldı. Dördüncü yüzyılda kentin episkoposu olan Aziz Nikolaos, yoksullara gizlice yardım etmesiyle tanınır ve Noel Baba figürünün kökeni olarak bilinir. Demre’deki Aziz Nikolaos Kilisesi bugün de hacıları ağırlar.",
        "refs": ["Elçilerin İşleri 27:5-6"] },
      "en": { "name": "Myra", "old": "Demre", "place": "Antalya province",
        "text": "Taken to Rome as a prisoner, Paul was moved onto a ship bound for Italy at the Lycian port of Myra. In the fourth century the city’s bishop was St. Nicholas, remembered for helping the poor in secret and known as the origin of the figure of Santa Claus. The Church of St. Nicholas in Demre still welcomes pilgrims today.",
        "refs": ["Acts 27:5-6"] }
    },
    {
      "id": "efes", "cat": "kilise", "lat": 37.9395, "lon": 27.3417, "lx": -11, "ly": 4, "la": "end", "section": "yedi-kilise",
      "tr": { "name": "Efes", "old": "Ephesos", "place": "Selçuk, İzmir",
        "text": "Pavlus burada iki yıldan uzun süre kalıp öğretti; gümüşçülerin “Efesliler’in Artemis’i büyüktür!” diye başlattığı ayaklanma da burada yaşandı. Vahiy Kitabı’ndaki mektupların ilki Efes kilisesine yazılmıştır. 431’de burada toplanan konsil, Meryem’in Theotokos, yani Tanrı Anası olduğunu ilan etti. Geleneğe göre Meryem Ana son yıllarını burada geçirdi; Havari Yuhanna’nın mezarı da Selçuk’taki Aziz Yuhanna Bazilikası’ndadır.",
        "refs": ["Elçilerin İşleri 19", "Elçilerin İşleri 20:17-38", "Efesliler 1:1", "Vahiy 2:1-7"] },
      "en": { "name": "Ephesus", "old": "Efes", "place": "Selçuk, İzmir province",
        "text": "Paul stayed and taught here for more than two years, and it was here that the silversmiths started the riot shouting “Great is Artemis of the Ephesians!” The first of the letters in the Book of Revelation is addressed to the church at Ephesus. The council held here in 431 proclaimed Mary Theotokos, Mother of God. By tradition the Virgin Mary spent her last years here, and the tomb of the Apostle John lies in the Basilica of St. John in Selçuk.",
        "refs": ["Acts 19", "Acts 20:17-38", "Ephesians 1:1", "Revelation 2:1-7"] }
    },
    {
      "id": "izmir", "cat": "kilise", "lat": 38.4192, "lon": 27.1287, "lx": -11, "ly": 4, "la": "end", "section": "yedi-kilise",
      "tr": { "name": "İzmir", "old": "Smyrna", "place": "İzmir",
        "text": "Vahiy Kitabı’nın ikinci mektubu İzmir kilisesine yazılmıştır ve Alaşehir’le birlikte hiç kınanmayan iki kiliseden biridir: “Ölüm pahasına sadık kal, sana yaşam tacını vereceğim.” Havari Yuhanna’nın öğrencisi olan episkopos Polikarp, 155 civarında burada şehit edildi. Bugün İzmir’de onun adını taşıyan Aziz Polikarp Kilisesi bulunur.",
        "refs": ["Vahiy 2:8-11"] },
      "en": { "name": "Smyrna", "old": "İzmir", "place": "İzmir province",
        "text": "The second letter in the Book of Revelation is addressed to the church at Smyrna, one of only two of the seven that receive no rebuke: “Be faithful unto death, and I will give you the crown of life.” Bishop Polycarp, a disciple of the Apostle John, was martyred here around 155. Today İzmir has a Church of St. Polycarp named after him.",
        "refs": ["Revelation 2:8-11"] }
    },
    {
      "id": "bergama", "cat": "kilise", "lat": 39.1215, "lon": 27.1843, "lx": -11, "ly": 4, "la": "end", "section": "yedi-kilise",
      "tr": { "name": "Bergama", "old": "Pergamon", "place": "İzmir",
        "text": "Vahiy Kitabı, Bergama kilisesine “Şeytan’ın tahtının bulunduğu yerde” yaşadığını söyler ve orada öldürülen “sadık tanığım Antipas”ı anar. Bazı yorumcular bu tahtı akropoldeki büyük Zeus Sunağı’yla, bazıları ise imparatora tapınma kültüyle ilişkilendirir. Kentteki dev Kızıl Avlu tapınağının içine sonradan bir kilise kurulmuştur.",
        "refs": ["Vahiy 2:12-17"] },
      "en": { "name": "Pergamum", "old": "Bergama", "place": "İzmir province",
        "text": "Revelation tells the church at Pergamum that it lives “where Satan’s throne is” and remembers “Antipas, my faithful witness,” who was killed there. Some interpreters link that throne with the great Altar of Zeus on the acropolis, others with the cult of emperor worship. A church was later built inside the city’s huge Red Hall temple.",
        "refs": ["Revelation 2:12-17"] }
    },
    {
      "id": "akhisar", "cat": "kilise", "lat": 38.9186, "lon": 27.8403, "lx": 11, "ly": 4, "la": "start", "section": "yedi-kilise",
      "tr": { "name": "Akhisar", "old": "Thyatira", "place": "Manisa",
        "text": "Vahiy Kitabı’nın yedi mektubundan en uzunu, küçük bir ticaret kenti olan Thyatira’ya yazılmıştır; kilisenin sevgisi, imanı ve sabrı övülür. Filipi’de Pavlus’u dinleyip Avrupa’da vaftiz edilen ilk kişi olarak bilinen mor kumaş satıcısı Lydia da bu kentten geliyordu.",
        "refs": ["Vahiy 2:18-29", "Elçilerin İşleri 16:14-15"] },
      "en": { "name": "Thyatira", "old": "Akhisar", "place": "Manisa province",
        "text": "The longest of the seven letters in Revelation is addressed to Thyatira, a small trading town; the church is praised for its love, faith and patience. Lydia, the seller of purple cloth who heard Paul at Philippi and is known as the first person baptized in Europe, came from this city.",
        "refs": ["Revelation 2:18-29", "Acts 16:14-15"] }
    },
    {
      "id": "sart", "cat": "kilise", "lat": 38.4882, "lon": 28.0406, "lx": 0, "ly": 20, "la": "middle", "section": "yedi-kilise",
      "tr": { "name": "Sart", "old": "Sardeis", "place": "Salihli, Manisa",
        "text": "Kral Krezüs’ün başkenti olan zengin Sardeis’in kilisesine sert bir uyarı yazılmıştır: “Yaşıyor diye adın var, ama ölüsün. Uyan!” Kalıntılar arasında Artemis Tapınağı’nın hemen yanında küçük bir Bizans kilisesi ve antik dünyanın en büyük sinagoglarından biri görülebilir. İkinci yüzyılda burada episkopos olan Sardeisli Melito, Paskalya üzerine yazdığı vaazıyla tanınır.",
        "refs": ["Vahiy 3:1-6"] },
      "en": { "name": "Sardis", "old": "Sart", "lx": -4, "ly": -7, "la": "end", "place": "Salihli, Manisa province",
        "text": "The church of wealthy Sardis, once the capital of King Croesus, receives a stern warning: “You have a name that you are alive, but you are dead. Wake up!” Among the ruins, a small Byzantine church stands right beside the Temple of Artemis, along with one of the largest synagogues of the ancient world. Melito of Sardis, bishop here in the second century, is known for his homily on Easter.",
        "refs": ["Revelation 3:1-6"] }
    },
    {
      "id": "alasehir", "cat": "kilise", "lat": 38.3500, "lon": 28.5167, "lx": 11, "ly": 4, "la": "start", "section": "yedi-kilise",
      "tr": { "name": "Alaşehir", "old": "Philadelphia", "place": "Manisa",
        "text": "Vahiy Kitabı’nda övgüden başka bir şey işitmeyen iki kiliseden biri: “Önüne kimsenin kapatamayacağı açık bir kapı koydum.” Kent, Batı Anadolu’da Bizans’a en uzun süre bağlı kalan yerlerden biriydi. Bugün kentin ortasında Aziz Yuhanna Bazilikası’nın dev taş ayakları hâlâ ayakta durur.",
        "refs": ["Vahiy 3:7-13"] },
      "en": { "name": "Philadelphia", "old": "Alaşehir", "place": "Manisa province",
        "text": "One of the two churches in Revelation that hear nothing but praise: “I have set before you an open door, which no one is able to shut.” The city was one of the places in western Anatolia that stayed Byzantine the longest. Today the huge stone piers of the Basilica of St. John still stand in the middle of town.",
        "refs": ["Revelation 3:7-13"] }
    },
    {
      "id": "laodikeia", "cat": "kilise", "lat": 37.8358, "lon": 29.1075, "lx": 11, "ly": 4, "la": "start", "section": "yedi-kilise",
      "tr": { "name": "Laodikeia", "old": "", "place": "Denizli",
        "text": "Vahiy Kitabı, zengin Laodikeia kilisesini “ne soğuk ne sıcak” olduğu için uyarır, ama ardından şu çağrıyı yapar: “İşte kapıda durmuş, kapıyı çalıyorum.” Pavlus’un Koloseliler’e Mektubu yakındaki Kolossai için yazılmış ve Laodikeia’da da okunması istenmiştir. Hemen yakındaki Hierapolis’te (Pamukkale), geleneğe göre Havari Filipus şehit edilmiştir.",
        "refs": ["Vahiy 3:14-22", "Koloseliler 4:13-16"] },
      "en": { "name": "Laodicea", "old": "Laodikeia", "place": "Denizli province",
        "text": "Revelation warns the wealthy church of Laodicea for being “neither cold nor hot,” then adds the invitation: “Behold, I stand at the door and knock.” Paul’s Letter to the Colossians was written for nearby Colossae, and he asked that it be read in Laodicea too. At neighbouring Hierapolis (Pamukkale), tradition holds that the Apostle Philip was martyred.",
        "refs": ["Revelation 3:14-22", "Colossians 4:13-16"] }
    },
    {
      "id": "iznik", "cat": "konsil", "lat": 40.4292, "lon": 29.7211, "lx": 11, "ly": 4, "la": "start", "section": "iznik",
      "tr": { "name": "İznik", "old": "Nikaia", "place": "Bursa",
        "text": "325’te İmparator Konstantin’in çağırdığı ilk ekümenik konsil burada toplandı ve İsa’nın Baba’yla “aynı özden” olduğunu ilan ederek bugün de her pazar okuduğumuz İman İkrarı’nın temelini attı. 787’de yine burada toplanan yedinci konsil, kutsal ikonalara saygıyı savundu. 2014’te göl kıyısında, sular altında kalmış bir bazilikanın kalıntıları bulundu.",
        "refs": ["Yuhanna 1:1-14", "Yuhanna 10:30"] },
      "en": { "name": "Nicaea", "old": "İznik", "place": "Bursa province",
        "text": "In 325 the first ecumenical council, summoned by Emperor Constantine, met here and declared Jesus “of the same substance” as the Father, laying the foundation of the Creed we still pray every Sunday. In 787 the seventh council, also held here, defended the veneration of holy icons. In 2014 the remains of a basilica were found under the waters of the lake shore.",
        "refs": ["John 1:1-14", "John 10:30"] }
    },
    {
      "id": "istanbul", "cat": "konsil", "lat": 41.0082, "lon": 28.9784, "lx": 0, "ly": -11, "la": "middle", "section": "iznik",
      "tr": { "name": "İstanbul ve Kadıköy", "label": "İstanbul", "old": "Konstantinopolis ve Khalkedon", "place": "İstanbul",
        "text": "İlk yedi ekümenik konsilin üçü Konstantinopolis’te (381, 553, 680-681), biri de karşı kıyıdaki Kadıköy’de (451) toplandı. 381’deki konsil İman İkrarı’nı Kutsal Ruh üzerine maddelerle tamamladı; Kadıköy ise İsa’nın tek kişide hem tam Tanrı hem tam insan olduğunu tanımladı. Sonradan Papa olan Aziz XXIII. Yuhanna, 1935-1944 yılları arasında burada Vatikan temsilcisi olarak görev yaptı.",
        "refs": ["Yuhanna 1:14", "Yuhanna 15:26"] },
      "en": { "name": "Constantinople and Chalcedon", "label": "Constantinople", "old": "Istanbul and Kadıköy", "place": "Istanbul",
        "text": "Three of the first seven ecumenical councils met in Constantinople (381, 553, 680-681) and one across the water in Chalcedon, today’s Kadıköy (451). The council of 381 completed the Creed with its articles on the Holy Spirit; Chalcedon defined that Jesus is fully God and fully man in one person. St. John XXIII, later Pope, served here as the Holy See’s representative from 1935 to 1944.",
        "refs": ["John 1:14", "John 15:26"] }
    },
    {
      "id": "kapadokya", "cat": "gelenek", "lat": 38.6431, "lon": 34.8289, "lx": 11, "ly": 4, "la": "start", "section": "",
      "tr": { "name": "Kapadokya", "old": "Kappadokia", "place": "Nevşehir ve Kayseri",
        "text": "Pentekost günü Kudüs’te Müjde’yi dinleyenler arasında Kapadokyalılar da vardı; Petrus’un birinci mektubu da Kapadokya’daki imanlılara seslenir. Dördüncü yüzyılda “Kapadokyalı Babalar” diye anılan Büyük Basileios (Kayseri episkoposu), Nazianzoslu Gregorios ve Nyssalı Gregorios, Kutsal Üçlü öğretisinin dilini şekillendirdi. Göreme’nin kayalara oyulmuş freskli kiliseleri bu keşiş geleneğinin tanıklarıdır.",
        "refs": ["Elçilerin İşleri 2:9", "1 Petrus 1:1"] },
      "en": { "name": "Cappadocia", "old": "Kappadokia", "place": "Nevşehir and Kayseri provinces",
        "text": "Cappadocians were among those who heard the Gospel in Jerusalem on the day of Pentecost, and Peter’s first letter is addressed in part to believers in Cappadocia. In the fourth century the “Cappadocian Fathers,” Basil the Great (bishop of Caesarea, today’s Kayseri), Gregory of Nazianzus and Gregory of Nyssa, shaped the language of the Church’s teaching on the Holy Trinity. The frescoed rock-cut churches of Göreme bear witness to this monastic tradition.",
        "refs": ["Acts 2:9", "1 Peter 1:1"] }
    },
    {
      "id": "trabzon", "cat": "gelenek", "lat": 41.0027, "lon": 39.7168, "lx": 0, "ly": -11, "la": "middle", "section": "",
      "tr": { "name": "Trabzon ve Sümela", "label": "Trabzon", "old": "Trapezus, Pontus", "place": "Trabzon",
        "text": "Pontus bölgesi, Pentekost günü Kudüs’te bulunanlar arasında anılır ve Petrus’un birinci mektubu bu bölgenin imanlılarına da seslenir. Trabzon yakınlarında sarp bir kayalığa kurulan Sümela Manastırı, geleneğe göre dördüncü yüzyılın sonunda Meryem Ana’ya adanmıştır. Kentteki Santa Maria Katolik Kilisesi’nde 2006’da öldürülen İtalyan rahip Andrea Santoro’nun anısı bugün de yaşatılır.",
        "refs": ["Elçilerin İşleri 2:9", "1 Petrus 1:1"] },
      "en": { "name": "Trabzon and Sumela", "label": "Trabzon", "old": "Trebizond, Pontus", "place": "Trabzon province",
        "text": "The region of Pontus is named among those present in Jerusalem at Pentecost, and Peter’s first letter is addressed to believers here too. Near Trabzon, the Sumela Monastery, built into a sheer cliff, was dedicated to the Virgin Mary, by tradition at the end of the fourth century. At the city’s Catholic Church of Santa Maria, the memory of the Italian priest Andrea Santoro, killed there in 2006, is kept alive.",
        "refs": ["Acts 2:9", "1 Peter 1:1"] }
    },
    {
      "id": "urfa", "cat": "gelenek", "lat": 37.1591, "lon": 38.7969, "lx": -11, "ly": 4, "la": "end", "section": "",
      "tr": { "name": "Şanlıurfa", "old": "Edessa", "place": "Şanlıurfa",
        "text": "Edessa, Süryani Hristiyanlığının ilk büyük merkezlerinden biriydi. Eski bir geleneğe göre kentin kralı Abgar, İsa’ya mektup yazıp ondan şifa istemişti. Dördüncü yüzyılda burada yaşayıp öğreten Aziz Ephrem, ilahileri yüzünden “Kutsal Ruh’un arpı” diye anılır ve Kilise Doktoru ilan edilmiştir.",
        "refs": ["Elçilerin İşleri 2:9"] },
      "en": { "name": "Edessa", "old": "Şanlıurfa", "place": "Şanlıurfa province",
        "text": "Edessa was one of the first great centres of Syriac Christianity. An ancient tradition says its king, Abgar, wrote to Jesus asking to be healed. St. Ephrem, who lived and taught here in the fourth century, is called the “Harp of the Holy Spirit” for his hymns and has been declared a Doctor of the Church.",
        "refs": ["Acts 2:9"] }
    },
    {
      "id": "mardin", "cat": "gelenek", "lat": 37.3212, "lon": 40.7245, "lx": 11, "ly": 4, "la": "start", "section": "",
      "tr": { "name": "Mardin ve Tur Abdin", "label": "Mardin", "old": "", "place": "Mardin",
        "text": "Adı “Tanrı’ya kulluk edenlerin dağı” anlamına gelen Tur Abdin, yüzyıllardır süren Süryani keşiş geleneğinin yurdudur. Midyat yakınındaki Mor Gabriel Manastırı 397’de kurulmuştur ve dünyada hâlâ faal olan en eski manastırlardan biridir. Mardin’e yakın Deyrulzafaran Manastırı da uzun yüzyıllar Süryani Ortodoks patrikliğinin merkezi oldu. Buralarda Ayin, İsa’nın konuştuğu Aramice’nin bir kolu olan Süryanice ile hâlâ kutlanır.",
        "refs": [] },
      "en": { "name": "Mardin and Tur Abdin", "label": "Mardin", "old": "", "place": "Mardin province",
        "text": "Tur Abdin, whose name means “the mountain of the servants of God,” has been home to a Syriac monastic tradition for many centuries. The Mor Gabriel Monastery near Midyat was founded in 397 and is one of the oldest monasteries in the world still in use. The nearby Deyrulzafaran Monastery was for centuries the seat of the Syriac Orthodox patriarchate. The liturgy here is still celebrated in Syriac, a branch of the Aramaic that Jesus spoke.",
        "refs": [] }
    },
    {
      "id": "akdamar", "cat": "gelenek", "lat": 38.3410, "lon": 43.0336, "lx": 0, "ly": -11, "la": "middle", "section": "",
      "tr": { "name": "Akdamar", "old": "Ahtamar", "place": "Van Gölü",
        "text": "Van Gölü’ndeki küçük adada, 915-921 yılları arasında Ermeni Kralı Gagik için inşa edilen Kutsal Haç Kilisesi yükselir. Dış duvarlarındaki taş kabartmalar Adem ile Havva’dan Yunus’a, Davut ile Golyat’a kadar Kutsal Kitap sahnelerini anlatır. Ermeni Hristiyanlığının bu topraklardaki köklü geçmişinin en güzel tanıklarından biridir.",
        "refs": ["Yaratılış 2-3", "Yunus 1-2", "1 Samuel 17"] },
      "en": { "name": "Akdamar", "old": "Aghtamar", "place": "Lake Van",
        "text": "On a small island in Lake Van stands the Church of the Holy Cross, built between 915 and 921 for the Armenian King Gagik. The stone reliefs on its outer walls tell scenes from Scripture, from Adam and Eve to Jonah, and David and Goliath. It is one of the most beautiful witnesses to the deep roots of Armenian Christianity on this land.",
        "refs": ["Genesis 2-3", "Jonah 1-2", "1 Samuel 17"] }
    },
    {
      "id": "harran", "cat": "eski", "lat": 36.8636, "lon": 39.0314, "lx": 11, "ly": 4, "la": "start", "section": "",
      "tr": { "name": "Harran", "old": "Haran", "place": "Şanlıurfa",
        "text": "Kutsal Kitap’a göre İbrahim, babası Terah’la birlikte Ur’dan çıkıp Harran’a yerleşti ve Tanrı’nın çağrısını duyduğunda, yetmiş beş yaşında buradan Kenan ülkesine yola çıktı. Torunu Yakup da kardeşi Esav’dan kaçıp dayısı Lavan’ın yanına, Harran’a sığındı ve Rahel’le burada tanıştı. Harran’ın kerpiç kümbet evleri o çok eski dünyanın izlerini bugün de taşır.",
        "refs": ["Yaratılış 11:31-12:5", "Yaratılış 28:10", "Yaratılış 29:1-20", "Elçilerin İşleri 7:2-4"] },
      "en": { "name": "Harran", "old": "Haran", "place": "Şanlıurfa province",
        "text": "According to Scripture, Abraham left Ur with his father Terah and settled in Haran, and when he heard God’s call he set out from here for the land of Canaan at the age of seventy-five. His grandson Jacob later fled from his brother Esau to his uncle Laban in Haran, and met Rachel there. Harran’s beehive mud-brick houses still carry traces of that ancient world.",
        "refs": ["Genesis 11:31-12:5", "Genesis 28:10", "Genesis 29:1-20", "Acts 7:2-4"] }
    },
    {
      "id": "agri", "cat": "eski", "lat": 39.7019, "lon": 44.2983, "lx": -11, "ly": 4, "la": "end", "section": "",
      "tr": { "name": "Ağrı Dağı", "old": "Ararat", "place": "Ağrı ve Iğdır",
        "text": "Yaratılış Kitabı’na göre Tufan’dan sonra Nuh’un gemisi “Ararat dağlarının üzerine” oturdu. Kutsal Kitap’taki Ararat adı, bugünkü Doğu Anadolu’yu da içine alan eski Urartu ülkesini anlatır; yüzyıllardır süren gelenek ise bu bölgenin en yüksek zirvesini, Türkiye’nin en yüksek dağı olan Ağrı Dağı’nı geminin oturduğu yer olarak anar.",
        "refs": ["Yaratılış 8:4"] },
      "en": { "name": "Mount Ararat", "old": "Ağrı Dağı", "place": "Ağrı and Iğdır provinces",
        "text": "According to Genesis, after the Flood Noah’s ark came to rest “upon the mountains of Ararat.” The biblical name Ararat refers to the ancient land of Urartu, which took in much of today’s eastern Anatolia; a tradition centuries old names the region’s highest peak, Mount Ararat, the highest mountain in Turkey, as the place where the ark came to rest.",
        "refs": ["Genesis 8:4"] }
    }
  ]
}/*JSON-END*/;
