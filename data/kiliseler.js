/* =====================================================================
 * EN: Catholic churches in Turkey (Latin, Armenian Catholic, Syriac
 *     Catholic, Chaldean Catholic), one entry per church, grouped by the
 *     cities shown on the Kilise Bul map. Each church gets its own page
 *     (kilise/<id>.html) with its history, Mass times, visiting hours and
 *     contact details, and the sources they came from. "short" is the
 *     name shown in the map's list; "side" (Istanbul only) is the side of
 *     the Bosphorus; "status" is active, limited or closed, with "notice"
 *     explaining it. "open" on a city is the side of its dot the list opens.
 * TR: Türkiye'deki Katolik kiliseleri: her kilise için ayrı bir sayfa
 *     (kilise/<id>.html) üretilir. Ayin saatleri değişebilir; kaynaklar her
 *     kilisenin "sources" alanındadır. Düzenledikten sonra tools/build.ps1
 *     çalıştırın. JSON-START / JSON-END işaretlerini silmeyin.
 * ===================================================================== */
window.CHURCHES = /*JSON-START*/{
 "title": "Kilise Bul",
 "en": "Find a Parish",
 "updated": "Eylül 2026",
 "note": "Bu bilgiler kiliselerin kendi sitelerinden, İzmir Katolik Başepiskoposluğu’ndan, Türkiye Katolik Ruhani Reisler Kurulu’nun ayin saatleri listesinden, İstanbul Valiliği’nin Dijital İstanbul envanterinden ve başka açık kaynaklardan derlenmiştir; resmî ve eksiksiz bir kilise sicili değildir. Bir bilgide hata gördüyseniz İletişim sayfasından bize bildirebilirsiniz.",
 "orthodoxNote": "Yakınınızda Katolik kilisesi yoksa Ortodoks bir kilise olabilir. Kilise Hukuku’na göre (Kanun 844 §2), Katolik bir rahibe ulaşmak mümkün değilse ve gerçek bir ihtiyaç varsa, bir Katolik Efkaristiya’yı, Günah Çıkarma’yı ve Hastaların Meshi’ni, sırları geçerli olan Ortodoks Kilisesi’nden alabilir. Bu olağan değil, istisnai bir izindir; her cemaatin kendi disiplini vardır ve rahip her zaman komünyon vermeyebilir.",
 "rites": [
  {
   "id": "latin",
   "tr": "Latin Katolik",
   "en": "Latin Catholic"
  },
  {
   "id": "ermeni",
   "tr": "Ermeni Katolik",
   "en": "Armenian Catholic"
  },
  {
   "id": "suryani",
   "tr": "Süryani Katolik",
   "en": "Syriac Catholic"
  },
  {
   "id": "keldani",
   "tr": "Keldani Katolik",
   "en": "Chaldean Catholic"
  }
 ],
 "cities": [
  {
   "id": "istanbul",
   "name": "İstanbul",
   "lat": 41.01,
   "lon": 28.98,
   "label": [
    0,
    -13,
    "middle"
   ],
   "open": "r",
   "churches": [
    {
     "id": "sent-antuan",
     "side": "avrupa",
     "short": "Sent Antuan",
     "name": "Sent Antuan Bazilikası",
     "rite": "latin",
     "district": "Beyoğlu",
     "address": "İstiklal Caddesi No: 171, 34433 Beyoğlu, İstanbul",
     "phones": [
      "0212 244 09 35"
     ],
     "email": "info@sentantuan.com",
     "website": "https://www.sentantuan.com",
     "mass": [
      [
       "Pazar",
       "10:00 İngilizce · 11:30 İtalyanca · 11:30 Lehçe (alt kilisede) · 19:00 Türkçe (Ekim–Mart döneminde 18:00)"
      ],
      [
       "Pazartesi–Cumartesi",
       "08:00 İngilizce"
      ],
      [
       "Salı",
       "11:30 Türkçe (ilahili, org eşliğinde)"
      ],
      [
       "Salı–Cuma",
       "19:00 Türkçe"
      ],
      [
       "Cumartesi",
       "19:00 İngilizce ve İtalyanca"
      ]
     ],
     "massNote": "Kutsal Hafta ve Noel gibi büyük bayramlarda ayrı bir program yayımlanır.",
     "visits": "Kilise her gün yaklaşık 08:00–19:30 arası açıktır (pazar 09:00’dan itibaren). Salı günleri 10:00–11:30 ve 15:00–17:00 arasında günah çıkarmak isteyenler için bir rahip hazır bulunur.",
     "history": [
      "İstanbul’un en büyük Katolik kilisesi olan Sent Antuan, Padovalı Aziz Antuan’a adanmıştır ve Fransisken Konventüel rahipleri tarafından yönetilir. Fransiskenlerin şehirdeki varlığı 13. yüzyılın başına, 1221 yılına kadar uzanır.",
      "Aynı adı taşıyan ilk kilise 1725’te şehrin İtalyan cemaati tarafından yaptırıldı. Cadde boyunca döşenecek yeni tramvay hattı nedeniyle bu yapı yıkılınca, cemaat İstiklal Caddesi üzerinde yeni bir yer buldu. Temelin ilk taşı 23 Ağustos 1906’da kondu; mali sıkıntılar yüzünden bir süre duran inşaat tamamlandı ve kilise 15 Şubat 1912’de kutsanarak ibadete açıldı.",
      "Venedik yeni-gotik üslubundaki yapıyı Levanten mimar Giulio Mongeri, Eduardo de Nari ile birlikte tasarladı. Latin haçı planlı kilisenin orta nefi apsisten kapıya kadar yaklaşık 50 metre, iç yüksekliği yaklaşık 23 metredir; altında romanesk bir kripta bulunur. Caddeye bakan “St. Antoine Apartmanları”, kiliseye gelir sağlamak amacıyla yapı kompleksiyle birlikte tasarlanmıştır.",
      "Papa XI. Pius kiliseyi 1932’de küçük bazilika ilan etti. Sonradan Papa XXIII. Yuhanna olacak Angelo Giuseppe Roncalli, 1934–1944 yılları arasında Vatikan’ın Türkiye temsilcisiyken burada yıllarca vaaz verdi; avludaki heykeli bu yüzden oradadır. Papa VI. Pavlus 1967’de burada ayin yönetti. Bugün kilise Türkçe, İngilizce, İtalyanca ve Lehçe ayinlerle dört dilde bir cemaate ev sahipliği yapar."
     ],
     "sources": [
      [
       "Sent Antuan Bazilikası resmi sitesi",
       "https://www.sentantuan.com"
      ],
      [
       "Dijital İstanbul (İstanbul Valiliği): Sent Antuan Katolik Kilisesi",
       "https://dijitalistanbul.org/sent-antuan-katolik-kilisesi"
      ],
      [
       "Wikipedia: Church of St. Anthony of Padua, Istanbul",
       "https://en.wikipedia.org/wiki/Church_of_Saint_Anthony_of_Padua,_Istanbul"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "santa-maria-draperis",
     "side": "avrupa",
     "short": "Santa Maria Draperis",
     "name": "Santa Maria Draperis Kilisesi",
     "rite": "latin",
     "district": "Beyoğlu",
     "address": "İstiklal Caddesi No: 215, 34433 Beyoğlu, İstanbul",
     "phones": [],
     "email": "",
     "website": "https://www.istanbulofm.org",
     "mass": [
      [
       "Pazar",
       "09:00 İtalyanca · 10:00 Korece · 11:15 İngilizce · İspanyolca ayin akşam (Ekim–Mart 17:00, Nisan–Eylül 18:30)"
      ],
      [
       "Ayın son pazarı",
       "Tek ayin: 10:30"
      ],
      [
       "Pazartesi–Cumartesi",
       "08:00 İtalyanca"
      ]
     ],
     "massNote": "Saatler yıl içinde değişebilir; güncel programı kilisenin sitesinden kontrol edin.",
     "visits": "Gün içinde, ayin saatleri dışında genellikle ziyarete açıktır. Kilise, İstiklal Caddesi’nden merdivenle inilen avlunun dibindedir.",
     "history": [
      "Santa Maria Draperis, İstanbul’un en eski Katolik cemaatlerinden birinin kilisesidir. Hikâyesi 1453’ten kısa süre önce Fransisken rahiplerin Sirkeci’de yaptığı Servili Aziz Antuan (Sant’Antonio dei Cipressi) kilisesiyle başlar. Fetihten sonra bu kiliseyi bırakmak zorunda kalan rahipler, uzun bir yer değiştirme döneminin ardından 1584’te Galata’ya yerleşti. Levanten bir hanım olan Clara Maria Draperis onlara küçük bir şapeli olan evini bağışladı; kilise adını bu bağışçıdan alır.",
      "Şapelin sunağını, Meryem Ana’yı tasvir eden ahşap bir ikona süslüyordu. Şapel 1660 yangınında tamamen yandı, ikona ise Draperis ailesinden biri tarafından kurtarıldı. Cemaat 1678’de Pera’ya taşındı; bugünkü kilise 1767 yangınından sonra, 1769’da yeniden inşa edildi.",
      "Üç nefli, dikdörtgen planlı kilisenin beşik tonozu 1874’te süslendi. Pembe Carrara mermerinden yüksek sunak 1772 tarihlidir ve Draperis ikonası hâlâ onun üzerindedir; ikona 25 Mart 1911’de papalık tacıyla taçlandırıldı. İstiklal Caddesi’ndeki girişte, bir nişin içinde Meryem heykeli bulunan neoklasik bir cephe vardır; 1904 tarihli yenilemenin kitabesi de buradadır. Kilisenin içinde, 18. ve 19. yüzyıldan kalma, çoğu İtalyanca ve Latince mezar taşları Levanten ailelerini, piskoposları ve konsolosları anar.",
      "Kilise bugün de Küçük Kardeşler Fransiskenleri (OFM) tarafından yönetilir ve İtalyanca, İngilizce, Korece ve İspanyolca ayinlerle çok uluslu bir cemaate hizmet eder."
     ],
     "sources": [
      [
       "İstanbul OFM (Santa Maria Draperis)",
       "https://www.istanbulofm.org"
      ],
      [
       "Dijital İstanbul (İstanbul Valiliği): Santa Maria Draperis Kilisesi",
       "https://dijitalistanbul.org/santa-maria-draperis-kilisesi"
      ],
      [
       "Wikipedia: Church of Saint Mary Draperis",
       "https://en.wikipedia.org/wiki/Church_of_Saint_Mary_Draperis,_Istanbul"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ],
      [
       "Weekday Masses: İstanbul kiliseleri",
       "https://weekdaymasses.org.uk/en/area/turkey-istanbul/churches"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "sen-piyer",
     "side": "avrupa",
     "short": "Sen Piyer (Galata)",
     "name": "Sen Piyer ve Pol Kilisesi",
     "rite": "latin",
     "district": "Galata, Beyoğlu",
     "address": "Kuledibi, Galata Kulesi Sokak No: 26, 34420 Beyoğlu, İstanbul",
     "phones": [],
     "email": "info@senpiyer.org",
     "website": "https://senpiyer.org",
     "mass": [
      [
       "Pazartesi–Cuma",
       "08:00 (Türkçe / İtalyanca)"
      ],
      [
       "Cumartesi",
       "19:00"
      ]
     ],
     "massNote": "",
     "visits": "Cuma ve cumartesi 14:30–17:30 arası ziyarete açıktır.",
     "history": [
      "Galata Kulesi’nin eteğindeki Sen Piyer ve Pol Kilisesi, Dominiken rahiplerinin kilisesidir. Dominikenler İstanbul’a 13. yüzyılın başında geldiler; Galata’daki ilk büyük kiliseleri San Paolo, 1475’te camiye çevrildi (bugünkü Arap Camii). Bunun ardından rahipler bugünkü yere yerleşti; burada 1604’te Cenevizliler tarafından bir kilise yapıldı.",
      "Kilise 1660 ve 1731’de iki kez yangınla yıkıldı. Bugünkü yapı, İsviçreli-İtalyan Fossati kardeşler tarafından 1841–1843 yılları arasında neoklasik üslupta yeniden inşa edildi. Dar Galata sokaklarının arasında, dışarıdan pek fark edilmeyen bir avlunun içinde yer alır.",
      "Kilisenin en değerli eseri, Hodegetria tipinde bir Meryem Ana ikonasıdır. İkona aslen Kırım’daki Kefe (Caffa) şehrinin Dominiken kilisesindeydi ve 1731 yangınından kurtuldu. Bugün manastır, Dominiken rahiplerin yürüttüğü “Dost-i” adlı bir araştırma ve diyalog merkezine de ev sahipliği yapar."
     ],
     "sources": [
      [
       "Sen Piyer (Dominikenler)",
       "https://senpiyer.org"
      ],
      [
       "Wikipedia: Church of SS Peter and Paul, Istanbul",
       "https://en.wikipedia.org/wiki/Church_of_SS_Peter_and_Paul,_Istanbul"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "sent-esprit",
     "side": "avrupa",
     "short": "Sent Esprit Katedrali",
     "name": "Kutsal Ruh Katedrali (Sent Esprit)",
     "rite": "latin",
     "district": "Harbiye, Şişli",
     "address": "Cumhuriyet Caddesi No: 127/A, 34373 Harbiye, Şişli, İstanbul",
     "phones": [
      "0212 248 09 10"
     ],
     "email": "",
     "website": "https://www.facebook.com/kutsalruhkatedrali/",
     "mass": [
      [
       "Pazar",
       "08:00 Aramice/Arapça · 10:00 İngilizce · 11:15 Fransızca"
      ],
      [
       "Cumartesi",
       "18:00 Türkçe (pazar arifesi)"
      ],
      [
       "Hafta içi",
       "18:00 Fransızca"
      ]
     ],
     "massNote": "Kaynaklar arasında küçük farklar var (Fransızca pazar ayini 11:15 ya da 11:30 olarak geçiyor); gitmeden önce teyit edin.",
     "visits": "Ayin saatlerinde ve gün içinde genellikle açıktır.",
     "history": [
      "Kutsal Ruh Katedrali, İstanbul Latin Katolik Havarisel Vekilliği’nin katedralidir; episkoposun makamı buradadır. Taksim ile Nişantaşı arasında, Notre Dame de Sion Lisesi’nin bitişiğinde yer alır ve Sent Antuan’dan sonra şehrin en büyük ikinci Katolik kilisesidir.",
      "Barok üsluptaki bazilika, Havarisel Vekil Fransız başepiskopos Julien Hillereau’nun girişimiyle, mimar Gaspare Fossati tarafından 1846’da yapıldı. 1865 depreminde zarar gördü ve Pietro Vitalis tarafından yenilendi; 1876’da katedral oldu, 18 Mart 1909’da da küçük bazilika ilan edildi. Ana sunaktaki “Kutsal Ruh’un İnişi” tablosunu 1867’de Papa IX. Pius hediye etti.",
      "Katedralin altındaki kriptada Başepiskopos Hillereau ile Osmanlı sarayının müzik şefi Giuseppe Donizetti (Donizetti Paşa) gömülüdür. Avludaki Papa XV. Benedictus heykeli 1921’de dikildi; Birinci Dünya Savaşı sırasında milliyet ve din ayırmadan yaralılara yardım eden papayı anar. Katedral 1989’dan beri Salezyen rahiplerine emanettir.",
      "Papa VI. Pavlus, II. Jean Paul, XVI. Benedictus, Fransuva ve 28 Kasım 2025’te XIV. Leo, Türkiye ziyaretlerinde bu katedrale geldiler. Kilisenin yanındaki sokak, Papa XXIII. Yuhanna’nın anısına “Papa Roncalli Sokağı” adını taşır."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Saint Esprit Katedrali",
       "https://dijitalistanbul.org/saint-esprit-katedrali"
      ],
      [
       "Wikipedia: Cathedral of the Holy Spirit, Istanbul",
       "https://en.wikipedia.org/wiki/Cathedral_of_the_Holy_Spirit,_Istanbul"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ],
      [
       "Weekday Masses: İstanbul kiliseleri",
       "https://weekdaymasses.org.uk/en/area/turkey-istanbul/churches"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "sankt-georg",
     "side": "avrupa",
     "short": "St. Georg (Karaköy)",
     "name": "Sankt Georg Kilisesi",
     "rite": "latin",
     "district": "Karaköy, Beyoğlu",
     "address": "Kart Çınar Sokak No: 2, Bankalar Caddesi, 34420 Karaköy, İstanbul",
     "phones": [
      "0212 313 49 70",
      "0212 249 76 17"
     ],
     "email": "gemeinde@sg.org.tr",
     "website": "https://www.sg.org.tr",
     "mass": [
      [
       "Pazar",
       "10:00 Almanca"
      ],
      [
       "Salı ve perşembe",
       "18:30"
      ]
     ],
     "massNote": "Almanca konuşan Avusturya cemaatinin kilisesidir. Bazı pazarlar ayin olmaz (ortak ekümenik ayinler gibi); cemaatin takvimine bakın.",
     "visits": "Ziyaret için St. Georg Avusturya Lisesi’nin girişinden, önceden haber vererek gelinmesi önerilir.",
     "history": [
      "Sankt Georg’un adı ilk kez 1303’te geçer; kilisenin bir ayazmanın üzerine kurulduğu bilinir. İstanbul’un fethine kadar Galata’yı elinde tutan Cenevizlilerin merkez kilisesiydi. Bir inanışa göre İstanbul’un koruyucu azizelerinden Aziz İrini’nin başı bu ayazmaya atılmıştır.",
      "Kilise 1628’de içinde küçük bir okul açılmasıyla bir yerleşkeye dönüştü; 1660 yangınında tamamen yandı. 1677’de Fransa elçisi Marki de Nointel, Sultan IV. Mehmed’den izin alarak kiliseyi yeniden yaptırdı. 1696 ve 1731 yangınlarından sonra, 1732’de kısmen Fransa Kralı XV. Louis’nin bağışlarıyla onarıldı.",
      "Bir süre Avusturya-Macaristan denizcileri için hastane olarak da kullanılan yapı, 1882’de okuluyla birlikte Avusturyalı Lazaristler tarafından satın alındı. Bugünkü St. Georg Avusturya Lisesi’nin kökleri bu okula dayanır. Kilise 20. yüzyılın başında yenilendi, iç mekânı 1963’te sadeleştirildi; nefin ortasındaki kubbede Kutsal Ruh’u simgeleyen bir güvercin vardır.",
      "Kilise bugün Almanca konuşan Katolik cemaatin kilisesidir ve Lazaristler ile Hayırsever Rahibeler’in (Barmherzige Schwestern) mirasını taşır. Rahibeler 150 yılı aşkın hizmetin ardından Eylül 2025’te İstanbul’dan ayrıldı."
     ],
     "sources": [
      [
       "St. Georgs-Gemeinde Istanbul",
       "https://www.sg.org.tr"
      ],
      [
       "Dijital İstanbul (İstanbul Valiliği): Sankt Georg Katolik Kilisesi",
       "https://dijitalistanbul.org/sankt-georg-katolik-kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ],
      [
       "Weekday Masses: İstanbul kiliseleri",
       "https://weekdaymasses.org.uk/en/area/turkey-istanbul/churches"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "saint-benoit",
     "side": "avrupa",
     "short": "Saint Benoît (Karaköy)",
     "name": "Saint Benoît Kilisesi",
     "rite": "latin",
     "district": "Karaköy, Beyoğlu",
     "address": "Kemeraltı Caddesi, Saint Benoît Lisesi yerleşkesi, 34425 Karaköy, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "status": "limited",
     "notice": "Düzenli halka açık ayin yapılmamaktadır; kilise, Saint Benoît Lisesi’nin yerleşkesi içindedir ve yalnızca bazı tören ve ayinler için açılır.",
     "mass": [
      [
       "Düzenli ayin",
       "Yok; özel günlerde ve okulun törenlerinde ayin yapılır."
      ]
     ],
     "massNote": "",
     "visits": "Okul yerleşkesinde olduğu için ziyaret önceden izin almayı gerektirir.",
     "history": [
      "Saint Benoît, İstanbul’da hâlâ kullanılan en eski Katolik kiliselerinden biridir. Kökleri, 13. yüzyılın başındaki bir manastıra ve Cenevizlilerin 1362’de yaptırdığı çan kulesiyle birlikte Pera’daki Santa Maria della Cisterna manastırına dayanır. Bugün ayakta duran çan kulesi, bu 14. yüzyıl yapısıdır.",
      "Yapı grubu 1427 ile 1450 arasında Fransız Benedikten rahiplerinin eline geçti ve Aziz Benedikt’e (Saint Benoît) adandı. Fetih sırasında kilisenin rölikleri ve dinî eşyaları önce Sakız Adası’na, sonra Ceneviz’e götürüldü. 17. ve 18. yüzyıllarda kilise Cizvitlerin elindeydi; 1783’te Fransız Lazarist rahiplerine devredildi.",
      "Kilise 1686, 1696 ve 1731 yangınlarında zarar gördü ve girişindeki kitabede yazdığı gibi 1732’de bugünkü hâliyle yeniden yapıldı. Fransa elçisi Pierre de Girardin’in girişimiyle, o güne kadar yalnızca camilere tanınan bir ayrıcalıkla kubbeli olarak inşa edilmesine izin verildi; rivayete göre dönemin şeyhülislamı bugün hâlâ ayakta olan sütunları hediye etti.",
      "Lazaristlerin 1783’te burada kurduğu okul, bugünkü Saint Benoît Fransız Lisesi’dir. Yerleşke 2000’li yıllarda kapsamlı bir restorasyondan geçti."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Saint Benoit Kilisesi",
       "https://dijitalistanbul.org/saint-benoit-kilisesi"
      ],
      [
       "Vikipedi: Saint Benoît Latin Katolik Kilisesi",
       "https://tr.wikipedia.org/wiki/Saint_Beno%C3%AEt_Latin_Katolik_Kilisesi"
      ]
     ]
    },
    {
     "id": "aziz-louis",
     "side": "avrupa",
     "short": "Saint-Louis (Fransız)",
     "name": "Saint-Louis des Français Kilisesi",
     "rite": "latin",
     "district": "Beyoğlu",
     "address": "Nuri Ziya Sokak No: 10, Fransız Sarayı (Palais de France) bahçesi, 34433 Beyoğlu, İstanbul",
     "phones": [],
     "email": "",
     "website": "http://www.st-louis-des-francais-istanbul.org",
     "status": "closed",
     "notice": "Kilise, deprem riski değerlendirmelerinin ardından 1 Eylül 2025’ten bu yana kapalıdır; ayinler bir sonraki duyuruya kadar askıya alınmıştır.",
     "mass": [
      [
       "Şu anda",
       "Ayin yapılmıyor (1 Eylül 2025’ten beri kapalı)."
      ]
     ],
     "massNote": "Fransızca konuşan cemaat için diğer kiliselerdeki Fransızca ayinlere bakabilirsiniz (örneğin Kutsal Ruh Katedrali, pazar 11:15).",
     "visits": "Kapalı.",
     "history": [
      "Saint-Louis des Français, Beyoğlu’ndaki Fransız Sarayı’nın (eski Fransa Büyükelçiliği, bugün başkonsolosluk) bahçesinde bulunan kilisedir. Fransa’nın Osmanlı İmparatorluğu’ndaki elçiliğinin kilisesi olarak, İstanbul’daki Katolik varlığın en eski kurumlarından biriyle bağlantılıdır ve uzun yıllar Fransızca konuşan cemaatin buluşma yeri oldu.",
      "Kilisenin cemaati 1 Eylül 2025’te, deprem riskine ilişkin yeni değerlendirmelerin ardından ayinlerin askıya alındığını ve kilisenin kapatıldığını duyurdu. Yeniden açılış için bir tarih açıklanmadı."
     ],
     "sources": [
      [
       "Paroisse Saint-Louis-des-Français Istanbul",
       "http://www.st-louis-des-francais-istanbul.org/"
      ],
      [
       "Weekday Masses: İstanbul kiliseleri",
       "https://weekdaymasses.org.uk/en/area/turkey-istanbul/churches"
      ]
     ]
    },
    {
     "id": "bomonti-lourdes",
     "side": "avrupa",
     "short": "Notre-Dame de Lourdes (Bomonti)",
     "name": "Notre-Dame de Lourdes Gürcü Katolik Kilisesi",
     "rite": "latin",
     "district": "Bomonti, Şişli",
     "address": "Kazım Orbay Caddesi No: 29, 34373 Şişli, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Pazar",
       "11:15 Türkçe"
      ],
      [
       "Pazartesi–Cumartesi",
       "08:00"
      ]
     ],
     "massNote": "",
     "visits": "Ayin saatlerinde açıktır; başka zamanlar için kapıdan sormanız gerekir.",
     "history": [
      "Bomonti’deki Notre-Dame de Lourdes, dünyada sayısı çok az olan Gürcü Katolik kiliselerinden biridir; eski kaynaklarda “Feriköy Gürcü Katolik Kilisesi” olarak geçer. 1828–1829 Osmanlı-Rus Savaşı’ndan sonra Rusların Meshet-Cavaheti bölgesinden göçe zorladığı binlerce Katolik Gürcü İstanbul’a geldi. Göç edenlerden rahip Petre Harisçiraşvili, 1861’de bu kiliseyi ve manastırı kurdu.",
      "Manastır kısa sürede Gürcülerin kültür merkezi oldu. 1870’te kurulan matbaasında Gürcüce ve Fransızca yaklaşık 200 kitap basıldı; kız ve erkek çocuklar için okullar açıldı, 1908’de şair Akaki Tsereteli adına bir kütüphane kuruldu. Osmanlı ülkesindeki Müslüman Gürcüler için ilk okuma kitapları da burada basıldı. 1921’de Kızıl Ordu Gürcistan’ı işgal edince Noe Jordania başkanlığındaki Gürcü hükümeti ve pek çok mülteci önce buraya sığındı.",
      "Kilise 1901’de onarıldı. İçinde kurucunun Latince-Gürcüce mezar taşı, Aziz Nino tasviri ve ana sunakta Lehçe yazılı bir Meryem ikonası bulunur; bahçede Casciali Azize Rita’ya adanmış küçük bir mabet vardır. 1955’ten sonra Gürcü Katoliklerin sayısı çok azaldığından, cemaatin büyük kısmını bugün Türk ve Ermeni Katolikler oluşturur."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Notre Dame de Lourdes Gürcü Katolik Kilisesi",
       "https://dijitalistanbul.org/notre-dame-de-lourdes-gurcu-katolik-kilisesi"
      ],
      [
       "Vikipedi: Bomonti Gürcü Katolik Kilisesi",
       "https://tr.wikipedia.org/wiki/Bomonti_G%C3%BCrc%C3%BC_Katolik_Kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ],
      [
       "Weekday Masses: İstanbul kiliseleri",
       "https://weekdaymasses.org.uk/en/area/turkey-istanbul/churches"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "aziz-pavlus-nisantasi",
     "side": "avrupa",
     "short": "St. Paul (Nişantaşı)",
     "name": "Aziz Pavlus Kilisesi (St. Paul)",
     "rite": "latin",
     "district": "Nişantaşı, Şişli",
     "address": "Büyük Çiftlik Sokak No: 20-22, 34365 Nişantaşı, İstanbul",
     "phones": [],
     "email": "",
     "website": "https://www.stpaul.de",
     "mass": [
      [
       "Ayın 1. ve 3. pazarı",
       "10:30 Almanca"
      ]
     ],
     "massNote": "Almanca konuşan Katolik cemaatin buluşma yeridir.",
     "visits": "Yalnızca ayin saatlerinde açıktır.",
     "history": [
      "Nişantaşı’ndaki St. Paul, İstanbul’da yaşayan Almanca konuşan Katoliklerin cemaat merkezidir. Burada ayda iki kez Almanca ayin yapılır; cemaatin toplantıları ve etkinlikleri de bu binada düzenlenir.",
      "Kilise, Almanca konuşan Avusturya cemaatinin Karaköy’deki St. Georg Kilisesi ile birlikte çalışır; iki cemaat bayramları ve ekümenik ayinleri çoğu zaman birlikte kutlar."
     ],
     "sources": [
      [
       "St. Paul Istanbul",
       "https://www.stpaul.de"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ],
      [
       "Weekday Masses: İstanbul kiliseleri",
       "https://weekdaymasses.org.uk/en/area/turkey-istanbul/churches"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "kutsal-kalp-bebek",
     "side": "avrupa",
     "short": "Kutsal Kalp (Bebek)",
     "name": "Kutsal Kalp Kilisesi (Bebek)",
     "rite": "latin",
     "district": "Bebek, Beşiktaş",
     "address": "Yoğurtçu Zülfü Sokak No: 15/2, 34342 Bebek, Beşiktaş, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Cumartesi",
       "18:00 Türkçe (pazar arifesi)"
      ],
      [
       "Pazar",
       "11:00"
      ]
     ],
     "massNote": "",
     "visits": "Ayin saatlerinde açıktır.",
     "history": [
      "Boğaz kıyısındaki Bebek’te bulunan Kutsal Kalp Kilisesi, bölgede yaşayan Katolik aileler ile semtteki okullarda ve üniversitede bulunan yabancı öğrenci ve öğretim görevlilerine hizmet eden küçük bir cemaat kilisesidir.",
      "Kilise, İsa’nın Kutsal Kalbi’ne adanmıştır. Pazar ayinleri, farklı ülkelerden gelen cemaat nedeniyle çoğu zaman birden çok dilde okunur."
     ],
     "sources": [
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ],
      [
       "Weekday Masses: İstanbul kiliseleri",
       "https://weekdaymasses.org.uk/en/area/turkey-istanbul/churches"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "rosario-bakirkoy",
     "side": "avrupa",
     "short": "Rosario (Bakırköy)",
     "name": "Meryem Ana Rosario Kilisesi",
     "rite": "latin",
     "district": "Bakırköy",
     "address": "Rüya Sokak No: 22, 34142 Bakırköy, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Pazar",
       "11:00 Türkçe"
      ],
      [
       "Pazartesi, çarşamba, perşembe, cuma",
       "18:30"
      ]
     ],
     "massNote": "",
     "visits": "Ayin saatlerinde açıktır.",
     "history": [
      "Bakırköy’deki Meryem Ana Rosario Kilisesi, 19. yüzyılın ikinci yarısında (1849–1885) bölgedeki Latin Katolik cemaati için inşa edildi. Alınlığın ortasındaki Dominiken tarikatı simgesi, kilisenin Dominiken rahiplerle olan bağını gösterir.",
      "Yeni-barok cepheli yapı Latin haçı planlıdır; kolların kesiştiği yerde iç yüksekliği 20,48 metreyi bulan, kasnağında on kemerli pencere bulunan bir kubbe yükselir. İç mekânda kalem işi bezemeler ve pandantiflerde aziz tasvirleri vardır. Ana sunakta, Consoli Pinse imzalı 1886 tarihli “Tespihli Meryem Ana” tablosu bulunur.",
      "Kilise zaman içinde farklı cemaatlerin de kullanımına açıldı; Latin cemaatin ayinleri bugün de devam etmektedir."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Meryem Ana Rosario Kilisesi",
       "https://dijitalistanbul.org/meryem-ana-rosario-kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ],
      [
       "Weekday Masses: İstanbul kiliseleri",
       "https://weekdaymasses.org.uk/en/area/turkey-istanbul/churches"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "aziz-stefanos-yesilkoy",
     "side": "avrupa",
     "short": "Aziz Stefanos (Yeşilköy)",
     "name": "Aziz Stefanos Kilisesi (St. Etienne)",
     "rite": "latin",
     "district": "Yeşilköy, Bakırköy",
     "address": "Yeşilköy Mah., Cümbüş Sokak No: 8, 34149 Bakırköy, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Pazar",
       "10:30"
      ],
      [
       "Pazartesi–Cumartesi",
       "18:00 (cumartesi akşamı pazar arifesi ayini)"
      ]
     ],
     "massNote": "CET’in 2023 listesinde pazar ayini 09:30 olarak geçiyordu; güncel kaynaklar 10:30 veriyor.",
     "visits": "Ayin saatlerinde açıktır.",
     "history": [
      "Yeşilköy’ün 1926’ya kadarki adı San Stefano (Ayastefanos), Hristiyanlığın ilk şehidi Aziz Stefanos’a adanmış eski bir kiliseden gelir. Geleneğe göre azizin kemikleri 4. yüzyılda Filistin’den İstanbul’a getirilmiş, İtalya’ya gönderilirken gemi fırtınaya yakalanıp bugünkü Yeşilköy açıklarında karaya çıkmak zorunda kalmıştır; çadırın kurulduğu yere de Aziz Stefanos’a adanmış bir kilise yapılmıştır.",
      "Bugünkü Latin Katolik kilisesi 1865’te inşa edildi ve 1886’da resmen açıldı. 1894 depreminde taş kubbesi çöktü; yerine Avusturya’dan getirilen malzemeyle ahşap bir tavan yapıldı. Kilisenin önündeki üç heykel Fransa’dan getirilmiştir. Son tadilat ve boya çalışması 2024’te tamamlandı.",
      "Kilise Fransisken Kapuçin rahipleri tarafından yönetilir ve ayinler Türkçe ile İtalyanca yapılır. Semtte aynı azize adanmış bir Rum Ortodoks ve bir Ermeni kilisesi de bulunur."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Aziz Stefanos Latin Katolik Kilisesi",
       "https://dijitalistanbul.org/aziz-stefanos-latin-katolik-kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ],
      [
       "Weekday Masses: İstanbul kiliseleri",
       "https://weekdaymasses.org.uk/en/area/turkey-istanbul/churches"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "buyukdere-meryem-ana",
     "side": "avrupa",
     "short": "Santa Maria (Büyükdere)",
     "name": "Meryem Ana’nın Doğuşu Kilisesi (Santa Maria)",
     "rite": "latin",
     "district": "Büyükdere, Sarıyer",
     "address": "Azatlı Sokak No: 1, 34453 Büyükdere, Sarıyer, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Pazar",
       "11:00 (Türkçe / İngilizce)"
      ],
      [
       "Pazartesi–Cumartesi",
       "19:00 (Türkçe / İngilizce)"
      ]
     ],
     "massNote": "",
     "visits": "Ayin saatlerinde açıktır. 2024’teki saldırıdan beri girişte güvenlik kontrolü yapılabilir.",
     "history": [
      "Büyükdere’deki ilk Katolik kilisesi 1815’te ahşaptan yapıldı. Fransisken Konventüel rahipleri 1866’da onun yerine, Meryem Ana’nın Doğuşu’na adanmış bugünkü kâgir kiliseyi inşa etti. Barok ve yeni-gotik öğeleri birleştiren cephede bir gül pencere ve kapılarda iki melek figürü vardır.",
      "Birinci Dünya Savaşı sırasında (1915–1918) kilise kapalı kaldı ve Müslüman çocuklar için aşevi olarak kullanıldı; savaştan sonra yeniden ibadete açıldı. 1960’lara kadar ruhban okulu olarak da hizmet verdi. 1985’te Focolari hareketine devredilen yapı, 1999’da yeniden Fransisken Konventüellere döndü.",
      "İçerideki üç büyük tabloyu Giuseppe Carta, dördüncüsünü Fransisken rahip Pasquale Sarullo yaptı. 1914’te kurulan org, aslen Notre Dame de Sion Lisesi’nin şapeli için getirilmişti ve bugün hâlâ çalışır.",
      "28 Ocak 2024’te pazar ayini sırasında kiliseye silahlı bir saldırı düzenlendi ve cemaatten Tuncer Cihan hayatını kaybetti. Cemaat, saldırıdan sonra da ayinlerini sürdürmektedir."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Meryem Ana Doğuş Katolik Kilisesi",
       "https://dijitalistanbul.org/meryem-ana-dogus-katolik-kilisesi"
      ],
      [
       "Wikipedia: Church of Saint Mary of Büyükdere",
       "https://en.wikipedia.org/wiki/Church_of_Saint_Mary_of_B%C3%BCy%C3%BCkdere,_Istanbul"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ],
      [
       "Weekday Masses: İstanbul kiliseleri",
       "https://weekdaymasses.org.uk/en/area/turkey-istanbul/churches"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "surp-asdvadzadzin",
     "side": "avrupa",
     "short": "Surp Asdvadzadzin Katedrali",
     "name": "Surp Asdvadzadzin Ermeni Katolik Katedrali",
     "rite": "ermeni",
     "district": "Sakızağacı, Beyoğlu",
     "address": "Atıf Yılmaz Caddesi No: 17, 34435 Beyoğlu, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Her gün",
       "10:30"
      ]
     ],
     "massNote": "Ermeni Katolik kiliselerinde ayinler Ermenice ve Türkçe yapılır. Saatler mevsime göre değişir; bazı kiliselerde ayin yalnızca yazın ya da yalnızca kışın yapılır.",
     "visits": "Ayin saatinde açıktır.",
     "history": [
      "Sakızağacı’ndaki Surp Asdvadzadzin (Meryem Ana) Katedrali, Türkiye Ermeni Katolik Patrikliği’nin ve İstanbul’daki Ermeni Katolik topluluğunun ruhani merkezidir. Kilise, patriklik sarayı, rahip konutu, kütüphane ve matbaadan oluşan bir yerleşkenin tam ortasında yer alır.",
      "İnşası için 15 Haziran 1864’te padişah fermanı alındı. Bedros Bey Mısırlıyan’ın yaptırdığı ve mimar Andon Tülbentçiyan’ın tasarladığı kilisenin temeli Ocak 1865’te atıldı; yaklaşık 18 ayda tamamlanan yapı 6 Kasım 1866’da kutsandı.",
      "1870’teki büyük Beyoğlu yangınında patriklik binası ve müştemilatı ağır hasar gördü; 1880–1881’de kapsamlı bir onarım yapıldı. Neoklasik yapının içinde Aydınlatıcı Aziz Krikor’a (Surp Krikor Lusavoriç) ait bir rölik kutusu korunur. 26 Temmuz 1967’de Papa VI. Pavlus’un katıldığı büyük bir ayin burada kutlandı."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Surp Asdvadzadzin Ermeni Katolik Katedrali",
       "https://dijitalistanbul.org/surp-asdvadzadzin-ermeni-katolik-katedrali"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "surp-hovhan-vosgeperan",
     "side": "avrupa",
     "short": "Surp Hovhan Vosgeperan",
     "name": "Surp Hovhan Vosgeperan Ermeni Katolik Kilisesi",
     "rite": "ermeni",
     "district": "Taksim, Beyoğlu",
     "address": "Ana Çeşmesi Sokak No: 2, 34435 Taksim, Beyoğlu, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Pazar (kış)",
       "11:00"
      ]
     ],
     "massNote": "Ermeni Katolik kiliselerinde ayinler Ermenice ve Türkçe yapılır. Saatler mevsime göre değişir; bazı kiliselerde ayin yalnızca yazın ya da yalnızca kışın yapılır.",
     "visits": "Ayin saatinde açıktır.",
     "history": [
      "Taksim Meydanı’nın yakınında, Fransız Konsolosluğu’nun arkasındaki Surp Hovhan Vosgeperan (Aziz Yuhanna Hrisostomos), 600 kişilik kapasitesiyle Türkiye’deki en büyük Ermeni Katolik kilisesidir.",
      "Burada 1837’de yapılan ahşap kilise zamanla yıprandı ve yandı. 1860’ta yeni kâgir yapının temeli atıldı; mimar Garabet Tülbentçiyan’ın 1861’deki ölümünden sonra inşaatı Andon Tülbentçiyan tamamladı ve kilise 1863’te bitti. Yanına bir de okul binası yapıldı.",
      "Düzgün kesme taştan yapılan kilise dışarıdan bazilika, içeriden ise merkezî kubbeli bir rotunda görünümündedir; sekizgen kubbeyi dört paye taşır. İç mekânda yarım yuvarlak kemerler, gömme payeler ve kompozit başlıklı sütunlarla neoklasik üslup hâkimdir. Papa II. Jean Paul 1979’daki Türkiye ziyaretinde bu kiliseye geldi."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Surp Hovhan Vosgeperan Ermeni Katolik Kilisesi",
       "https://dijitalistanbul.org/surp-hovhan-vosgeperan-ermeni-katolik-kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "surp-pirgic",
     "side": "avrupa",
     "short": "Surp Pırgiç (Galata)",
     "name": "Surp Pırgiç Ermeni Katolik Kilisesi",
     "rite": "ermeni",
     "district": "Galata, Beyoğlu",
     "address": "Kuyu Sokak No: 5, 34425 Galata, Beyoğlu, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Perşembe (kış)",
       "10:30"
      ]
     ],
     "massNote": "Ermeni Katolik kiliselerinde ayinler Ermenice ve Türkçe yapılır. Saatler mevsime göre değişir; bazı kiliselerde ayin yalnızca yazın ya da yalnızca kışın yapılır.",
     "visits": "Ayin saatinde açıktır.",
     "history": [
      "Galata’daki Surp Pırgiç (Kutsal Kurtarıcı), İstanbul’da inşa edilen ilk Ermeni Katolik kilisesidir. Galata’daki Ermeni Katolik cemaati tarafından 1832–1834 yıllarında yaptırıldı ve 1850’den 1928’e kadar Ermeni Katolik patriklik makamına ev sahipliği yaptı.",
      "Rivayete göre inşaat sürerken şehirde veba salgını baş gösterdi ve 25 Mart’ta Meryem Ana ikonası sokaklarda dolaştırıldı; salgın dindikten sonra Sultan II. Mahmud’un kiliseye elmaslı bir hediye gönderdiği anlatılır.",
      "Geniş bazilika planlı yapının girişi, merdivenle çıkılan ve altı payenin arşitravla birleştiği bir “antik tapınak” cephesine sahiptir. İçeride beş sunak vardır; biri taçlı Meryem ile Çocuk İsa tasviriyle Meryem Ana’ya adanmıştır. Lübnan Emiri Beşir Şihabi’nin mezarı da bu kilisededir. 1958’de cadde genişletilirken yapının bir bölümü yıkıldı."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Surp Pirgiç Ermeni Katolik Kilisesi",
       "https://dijitalistanbul.org/surp-pirgic-ermeni-katolik-kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "anarad-higutyun",
     "side": "avrupa",
     "short": "Anarad Hığutyun (Fatih)",
     "name": "Anarad Hığutyun Ermeni Katolik Kilisesi",
     "rite": "ermeni",
     "district": "Kocamustafapaşa, Fatih",
     "address": "Org. Abdurrahman Nafiz Gürman Caddesi No: 356, 34098 Kocamustafapaşa, Fatih, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Pazar (kış)",
       "10:30"
      ]
     ],
     "massNote": "Ermeni Katolik kiliselerinde ayinler Ermenice ve Türkçe yapılır. Saatler mevsime göre değişir; bazı kiliselerde ayin yalnızca yazın ya da yalnızca kışın yapılır.",
     "visits": "Ayin saatinde açıktır.",
     "history": [
      "Anarad Hığutyun (Lekesiz Gebelik) Kilisesi, tarihî yarımadada, surların içinde bulunan az sayıdaki Ermeni Katolik kilisesinden biridir. Kökleri, Katolik Ermeni cemaatinin çocuklarını okutmak için 1845’te kurulan Mesrobyan Okulu’na dayanır.",
      "Kilise 1856’da Sultan Abdülmecid’in izniyle açıldı. Yapımını, Osmanlı topraklarından çıkan ilk Ermeni Katolik kardinal olan Patrik Andon Bedros IX Hasunyan üstlendi; mimarı, Taksim’deki Surp Hovhan Vosgeperan ile Sakızağacı’ndaki katedralin de mimarı olan Andon Tülbentçiyan’dır.",
      "Mesrobyan Okulu, yoksul Ermeni kız çocuklarının eğitimi için kurulan Anarad Hığutyun Rahibeleri Birliği’nin İstanbul’daki ilk okuluydu. Depremler ve semt yangınları kiliseyi yıprattı; yapı 1990’daki restorasyonla bugünkü hâlini aldı."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Anarad Hığutyun Ermeni Katolik Kilisesi",
       "https://dijitalistanbul.org/anarad-higutyun-ermeni-katolik-kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "surp-krikor-ortakoy",
     "side": "avrupa",
     "short": "Surp Krikor Lusavoriç (Ortaköy)",
     "name": "Surp Krikor Lusavoriç Ermeni Katolik Kilisesi",
     "rite": "ermeni",
     "district": "Ortaköy, Beşiktaş",
     "address": "Dereboyu Caddesi No: 132, 34347 Ortaköy, Beşiktaş, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Cumartesi (kış)",
       "15:00"
      ]
     ],
     "massNote": "Ermeni Katolik kiliselerinde ayinler Ermenice ve Türkçe yapılır. Saatler mevsime göre değişir; bazı kiliselerde ayin yalnızca yazın ya da yalnızca kışın yapılır.",
     "visits": "Ayin saatinde açıktır.",
     "history": [
      "Ortaköy’deki Surp Krikor Lusavoriç (Aydınlatıcı Aziz Krikor) Kilisesi’nin yapımına 5 Kasım 1837 tarihli bir fermanla izin verildi. Krikor Hekimyan’ın yaptırdığı kilise 6 Ocak 1839’da ibadete açıldı.",
      "Mimarisiyle Roma bazilikalarını andıran yapının içinde, kadınlar için üst üste iki balkon ve dört küçük sunak bulunur. Kilise bugün Ortaköy Surp Krikor Lusavoriç Ermeni Katolik Kilisesi Vakfı tarafından yönetilir."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Surp Krikor Lusavoriç Ermeni Katolik Kilisesi",
       "https://dijitalistanbul.org/surp-krikor-lusavoric-ermeni-katolik-kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "surp-bogos-buyukdere",
     "side": "avrupa",
     "short": "Surp Boğos (Büyükdere)",
     "name": "Surp Boğos Ermeni Katolik Kilisesi",
     "rite": "ermeni",
     "district": "Büyükdere, Sarıyer",
     "address": "Piyasa Caddesi No: 3, 34453 Büyükdere, Sarıyer, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Pazar (yaz)",
       "11:00"
      ]
     ],
     "massNote": "Ermeni Katolik kiliselerinde ayinler Ermenice ve Türkçe yapılır. Saatler mevsime göre değişir; bazı kiliselerde ayin yalnızca yazın ya da yalnızca kışın yapılır.",
     "visits": "Yaz aylarında ayin saatinde açıktır.",
     "history": [
      "Büyükdere’deki Surp Boğos (Aziz Pavlus) ilk olarak 1847’de ahşap bir şapel olarak yapıldı. Cemaat büyüyünce ahşap yapı yetersiz kaldı; 1882’de kaldırılarak yerine Boğos Amira Bilezikçiyan’ın yaptırdığı daha geniş kâgir kilise inşa edildi ve 1885’te ibadete açıldı.",
      "Bahçe içindeki iki katlı görünümlü kilisenin doğusunda papaz evi ve çan kulesi bulunur; yerleşkede eski bir kuyu vardır. Yapı 1978’de tescil edildi. Boğaz’ın yazlık semtlerindeki pek çok kilise gibi burada da ayin yaz aylarında yapılır."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Surp Boğos Ermeni Katolik Kilisesi",
       "https://dijitalistanbul.org/surp-bogos-ermeni-katolik-kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "surp-andon-sariyer",
     "side": "avrupa",
     "short": "Surp Andon (Sarıyer)",
     "name": "Surp Andon Ermeni Katolik Kilisesi",
     "rite": "ermeni",
     "district": "Sarıyer",
     "address": "Sarıyer, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "status": "limited",
     "notice": "Düzenli bir ayin programı yayımlanmamıştır; restorasyondan sonra kilisede ayin yeniden yapılmaya başlanmıştır. Gitmeden önce Ermeni Katolik Patrikliği’ne danışın.",
     "mass": [
      [
       "Düzenli ayin",
       "Yayımlanmış bir program yok."
      ]
     ],
     "massNote": "",
     "visits": "Önceden bilgi alarak ziyaret edin.",
     "history": [
      "Aziz Antuan’a adanmış Surp Andon Kilisesi, 1871’de Andon Tıngır Yaver Paşa tarafından yaptırıldı. Kilise ve bitişiğindeki iki bina, 1877 tarihli bir anlaşmayla Ermeni Katolik Ruhani Reisliği’nin idaresine bırakıldı.",
      "Tek nefli bazilika planlı yapıda narteks, koro, apsis ve vaftizhane bulunur; batı girişinin iki köşesinde birer kule yükselir ve dış cephe yarı gotik bir görünüm taşır. 2019’da başlayan restorasyonda bahçe, duvarlar ve mezarlık yenilendi; çalışmaların ardından kilisede uzun bir aradan sonra yeniden ayin yapıldı."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Surp Andon Ermeni Katolik Kilisesi",
       "https://dijitalistanbul.org/surp-andon-ermeni-katolik-kilisesi"
      ]
     ]
    },
    {
     "id": "suryani-katolik-gumussuyu",
     "side": "avrupa",
     "short": "Süryani Katolik (Gümüşsuyu)",
     "name": "Kutsal Kalp Süryani Katolik Kilisesi",
     "rite": "suryani",
     "district": "Gümüşsuyu, Beyoğlu",
     "address": "Ayazpaşa, Sarayarkası Sokak No: 15, 34437 Gümüşsuyu, Beyoğlu, İstanbul",
     "phones": [
      "0212 243 25 21"
     ],
     "email": "",
     "website": "https://presencet.com.tr",
     "mass": [
      [
       "Kış: pazartesi–cumartesi",
       "10:00 (Arapça-Aramice)"
      ],
      [
       "Kış: pazar",
       "11:00 (Türkçe, Arapça-Aramice)"
      ],
      [
       "Yaz: pazar",
       "09:30 (tek ayin)"
      ],
      [
       "Her ayın ilk cuması",
       "11:00 Türkçe, Kutsal Kalp onuruna"
      ]
     ],
     "massNote": "Süryani Katolik ayinleri Süryanice (Aramice), Arapça ve Türkçe yapılır.",
     "visits": "Ayin saatlerinde açıktır.",
     "history": [
      "Gümüşsuyu’ndaki Kutsal Kalp (Sacré-Cœur) Kilisesi, Türkiye Süryani Katolik Patriklik Vekâleti’nin merkez kilisesidir. Yapı 1910’da Cizvit rahipleri tarafından inşa edildi. Cizvitler Türkiye’den ayrıldıktan sonra bina ve arsası Hazine’ye geçti.",
      "1970’lerden itibaren Güneydoğu’dan İstanbul’a gelen Süryani Katolik cemaati, o dönem harap durumdaki kiliseyi onararak ibadete açtı. Yapı 1997’de 99 yıllığına bedelsiz olarak cemaatin vakfına tahsis edildi; uzun süren bir hukuki sürecin ardından 2018’de 49 yıllık bedelsiz tahsis kararı çıktı.",
      "Süryani Katolikler, Antakya’nın kadim Süryani Kilisesi’nden gelen ve 18. yüzyılda Roma ile birliğe giren bir Doğu Katolik Kilisesi’dir. Ayinlerinde, İsa’nın konuştuğu dile yakın olan Süryanice (Aramice) hâlâ kullanılır."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Gümüşsuyu Süryani Katolik Kilisesi",
       "https://dijitalistanbul.org/gumussuyu-suryani-katolik-kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "keldani-istanbul",
     "side": "avrupa",
     "short": "Keldani Katolik (Beyoğlu)",
     "name": "Keldani Katolik Kilisesi (İstanbul)",
     "rite": "keldani",
     "district": "Parmakkapı, Beyoğlu",
     "address": "Parmakkapı, Beyoğlu, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "status": "limited",
     "notice": "Kilisenin tam adresi ve ayin saatleri için güvenilir, güncel bir kaynak bulunamadı. Gitmeden önce Türkiye Keldani Katolik Patrik Vekilliği’ne danışın.",
     "mass": [
      [
       "Ayin saatleri",
       "Kiliseye danışın."
      ]
     ],
     "massNote": "",
     "visits": "Önceden görüşerek ziyaret edin.",
     "history": [
      "Keldani Katolik Kilisesi, Mezopotamya’daki kadim Doğu Kilisesi’nden gelen ve 16. yüzyılda (1552) Roma ile birliğe giren bir Doğu Katolik Kilisesi’dir. Ayinlerinde Süryanicenin doğu lehçesi kullanılır; patrikliğin merkezi bugün Bağdat’tadır.",
      "Türkiye’deki Keldani Katolik topluluğunun merkezi İstanbul’da, Beyoğlu’ndadır ve Türkiye Keldani Katolik Patrik Vekili Mgr. Fransua Yakan tarafından yönetilir. Cemaatin büyük bölümü, 20. yüzyılın ikinci yarısında Güneydoğu’dan, özellikle Şırnak, Mardin ve Diyarbakır çevresinden gelen ailelerden oluşur."
     ],
     "sources": [
      [
       "Vikipedi: Keldani Katolik Kilisesi",
       "https://tr.wikipedia.org/wiki/Keldani_Katolik_Kilisesi"
      ]
     ]
    },
    {
     "id": "assomption-moda",
     "side": "anadolu",
     "short": "Notre Dame de l’Assomption (Moda)",
     "name": "Notre Dame de l’Assomption Kilisesi",
     "rite": "latin",
     "district": "Moda, Kadıköy",
     "address": "Moda, Cem Sokak No: 5, 34710 Kadıköy, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Pazar",
       "11:30 (Türkçe / Fransızca)"
      ],
      [
       "Pazartesi–Cuma",
       "18:30 (Türkçe / Fransızca)"
      ],
      [
       "Cumartesi",
       "18:30 Türkçe"
      ]
     ],
     "massNote": "",
     "visits": "Ayin saatlerinde açıktır.",
     "history": [
      "Kadıköy’de “Fransız Kilisesi” olarak da bilinen Notre Dame de l’Assomption, Meryem Ana’nın Göğe Alınışı’na adanmıştır. 1858’de Havarisel Vekil Brunoni, rahip De Negri’yi Kadıköy’de bir kilise kurmakla görevlendirdi; Sakız Adası’ndan yeni gelen Katolik aileler inşaata somut katkı sağladı.",
      "1859 tarihli bir fermanla izin alınan kilise, mimar Giovanni Battista Barberini tarafından neoklasik üslupta tasarlandı ve 1865’te tamamlandı; cephedeki Latince yazıtta mimarın adı “Architectus Johannes Barborini” olarak geçer. Haç planlı, kubbeli yapının batı cephesinde iki çan kulesi yükselir.",
      "2 Temmuz 1895 tarihli bir papalık yazısıyla kilise ve eklentileri Assomptionist (Asumsiyonist) rahiplere devredildi ve yanına bir manastır binası eklendi. 1970’lerin ortasından beri kilise Süryani cemaati tarafından da kullanılmaktadır. Ayinler Türkçe ve Fransızca yapılır."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Notre Dame de L’Assomption Kilisesi",
       "https://dijitalistanbul.org/notre-dame-de-lassomption-kilisesi"
      ],
      [
       "Vikipedi: Kadıköy Fransız Katolik Kilisesi",
       "https://tr.wikipedia.org/wiki/Kad%C4%B1k%C3%B6y_Frans%C4%B1z_Katolik_Kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ],
      [
       "Weekday Masses: İstanbul kiliseleri",
       "https://weekdaymasses.org.uk/en/area/turkey-istanbul/churches"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "tubini-sapeli",
     "side": "anadolu",
     "short": "Tubini Şapeli (Kadıköy)",
     "name": "Meryem Ana Latin Katolik Kilisesi (Tubini Şapeli)",
     "rite": "latin",
     "district": "Kadıköy",
     "address": "Misbah Muayyeş Sokak No: 2, 34710 Kadıköy, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Salı ve perşembe",
       "18:00"
      ],
      [
       "Pazar",
       "18:00"
      ]
     ],
     "massNote": "",
     "visits": "Ayin saatlerinde açıktır.",
     "history": [
      "Kadıköy’deki bu küçük barok şapel, Hyacinthe Tubini’nin 30 Aralık 1886 tarihli vasiyetiyle aile kullanımı için yapılmasını istediği, ama aynı zamanda bütün inananlara açık olmasını şart koştuğu şapeldir. Yaklaşık 6 metre genişliğinde ve 12 metre uzunluğundaki yapı 1905’te tamamlandı ve Meryem Ana’nın Müjdesi’ne adandı.",
      "Şapel 1960’ta ve 13 Ocak 1990’da onarıldı. 2017’de yapılan bir kira sözleşmesiyle 2023’e kadar başka bir Hristiyan cemaatinin kullanımına verildi. 2023’te yeniden restore edilen şapel, 7 Aralık 2023’te kutsanarak Latin Katolik ibadetine açıldı ve bu kez Kalkedonlu Meryem Ana’ya (Santa Maria in Calcedonia) adandı; Kadıköy’ün antik adı Kalkedon’dur."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Meryem Ana Latin Katolik Kilisesi",
       "https://dijitalistanbul.org/meryem-ana-latin-katolik-kilisesi"
      ],
      [
       "Weekday Masses: İstanbul kiliseleri",
       "https://weekdaymasses.org.uk/en/area/turkey-istanbul/churches"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "aziz-augustin-fenerbahce",
     "side": "anadolu",
     "short": "Aziz Augustin (Fenerbahçe)",
     "name": "Aziz Augustin Kilisesi",
     "rite": "latin",
     "district": "Fenerbahçe, Kadıköy",
     "address": "Atlıhan Sokak No: 1, 34726 Fenerbahçe, Kadıköy, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Pazar",
       "10:00 (Türkçe / Fransızca)"
      ]
     ],
     "massNote": "",
     "visits": "Pazar ayininde açıktır.",
     "history": [
      "Fenerbahçe’deki Aziz Augustin şapeli, 1889–1892 yıllarında Assomptionist rahiplerin eğitim evi olarak inşa edilen bir yapının parçasıdır. Bina 1 Mayıs 1890’da Piskopos Bonetti tarafından kutsandı; 1892’de eklenen iki yan kanattan soldaki, Hipponlu Aziz Augustinus’a adanmış şapel olarak düzenlendi.",
      "Yapı 1890–1914 arasında sırasıyla novis evi, skolastik eğitim evi ve öğrenci yurdu olarak kullanıldı; 1895–1914 arasında papaz okulu oldu ve bu işlevini küçük ölçekte İkinci Dünya Savaşı’na kadar sürdürdü. 1914–1919 arasında hastane olarak hizmet verdi. 1920’den sonra şapel Kadıköy cemaatinin bir eklentisi hâline geldi ve Moda’daki rahipler burada düzenli ayin yapmayı sürdürdü.",
      "Bina 1982’de bir spor tesisinin parçası olarak kiraya verildi; şapel ise 2012–2013’te kapsamlı biçimde yenilendi. Semtin eski Rumca adı “Phanaraki” (küçük fener), yapının erken dönem kayıtlarında geçer."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Aziz Augustin Kilisesi",
       "https://dijitalistanbul.org/aziz-augustin-kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ],
      [
       "Weekday Masses: İstanbul kiliseleri",
       "https://weekdaymasses.org.uk/en/area/turkey-istanbul/churches"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "surp-levon-kadikoy",
     "side": "anadolu",
     "short": "Surp Levon (Kadıköy)",
     "name": "Surp Levon Ermeni Katolik Kilisesi",
     "rite": "ermeni",
     "district": "Altıyol, Kadıköy",
     "address": "Altıyol, Ali Suavi Sokak No: 1, 34714 Kadıköy, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Pazar",
       "11:30"
      ]
     ],
     "massNote": "Ermeni Katolik kiliselerinde ayinler Ermenice ve Türkçe yapılır. Saatler mevsime göre değişir; bazı kiliselerde ayin yalnızca yazın ya da yalnızca kışın yapılır.",
     "visits": "Pazar ayininde açıktır.",
     "history": [
      "Kadıköy Altıyol’daki Surp Levon Kilisesi, adını 440–461 yılları arasında papalık yapan Büyük Aziz Leo’dan (Surp Levon) alır. Burada 1890’da, Ermeni mezarlığı arazisinde ahşap bir şapel yapıldı.",
      "Ahşap yapı kaldırılarak 1908’de bugünkü kâgir kilisenin temelleri atıldı; kilise 1911’de tamamlanıp ibadete açıldı. Planı Roma bazilikalarını örnek alır. Apsisteki ana sunakta Giovanni Cingolani’nin 1890 tarihli Surp Levon tablosu bulunur; çan kulesinde farklı boyutlarda dört çan ve tepesinde bir horoz figürü vardır."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Surp Levon Ermeni Katolik Kilisesi",
       "https://dijitalistanbul.org/surp-levon-ermeni-katolik-kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "polonezkoy",
     "side": "anadolu",
     "short": "Polonezköy Meryem Ana",
     "name": "Częstochowa Meryem Ana Kilisesi (Polonezköy)",
     "rite": "latin",
     "district": "Polonezköy, Beykoz",
     "address": "Polonezköy, 34827 Beykoz, İstanbul",
     "phones": [],
     "email": "",
     "website": "http://www.duszpasterstwowstambule.pl",
     "mass": [
      [
       "Cumartesi",
       "18:00 (Ekim–Mart) · 19:00 (Nisan–Eylül), Lehçe / Türkçe"
      ]
     ],
     "massNote": "Polonya cemaatinin ayinleri için duszpasterstwowstambule.pl adresine bakabilirsiniz.",
     "visits": "Ayin saatinde ve köyün etkinlik günlerinde açıktır.",
     "history": [
      "Polonezköy (Adampol), 1842’de Polonyalı göçmenlerin kurduğu bir köydür. Köydeki ilk dinî yapı 1842’de yapılan Azize Anna Kilisesi’ydi. 1894 İstanbul depreminde bu kilise yıkıldı ve yerine 1914’te bugünkü Częstochowa Meryem Ana Kilisesi inşa edildi.",
      "Birinci Dünya Savaşı sırasında kilise Türk ordusu tarafından karargâh olarak kullanıldı; savaştan sonra 1918’de onarılarak yeniden ibadete açıldı. İçinde, Polonya’nın en önemli hac yeri olan Częstochowa’daki ünlü Meryem Ana ikonasının bir kopyası bulunur. Kilise bugün de Polonya kökenli köy halkının ve İstanbul’daki Polonyalı Katoliklerin buluşma yeridir."
     ],
     "sources": [
      [
       "Vikipedi: Czestochova Meryem Ana Kilisesi",
       "https://tr.wikipedia.org/wiki/Czestochova_Meryem_Ana_Kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "san-pacifico-buyukada",
     "side": "anadolu",
     "short": "San Pacifico (Büyükada)",
     "name": "Aziz Pasifiko Kilisesi (San Pacifico)",
     "rite": "latin",
     "district": "Büyükada, Adalar",
     "address": "Yeni Sokak No: 21, 34970 Büyükada, Adalar, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Pazar",
       "11:00 Türkçe"
      ],
      [
       "Salı",
       "11:00 Türkçe"
      ],
      [
       "Cumartesi (Nisan–Eylül)",
       "19:00 İtalyanca"
      ]
     ],
     "massNote": "",
     "visits": "Ayin saatlerinde açıktır.",
     "history": [
      "Büyükada’daki San Pacifico Kilisesi, Ignazio Corpi’nin yaptırdığı ve mimar Giacomo Leoni’nin tasarladığı yeni-gotik bir kilisedir; 1885’te inşa edildi. 1894 İstanbul depreminde kilise ve manastır hasar gördü, depremden yaklaşık bir buçuk ay sonra onarıldı.",
      "İç mekânda ahşap bir tavan ile çeşitli resim ve heykeller bulunur; girişteki haçla taçlanmış demir kapının sembolü vitraylarda da tekrarlanır. Kilisede, 1935–1944 arasında Türkiye’de papalık temsilcisi olarak bulunan ve Büyükada’yı sık sık ziyaret eden Angelo Giuseppe Roncalli (Papa XXIII. Yuhanna) ile ilişkilendirilen bir tablo da vardır."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Büyükada Aziz Pasifiko Kilisesi",
       "https://dijitalistanbul.org/buyukada-aziz-pasifiko-kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": ""
    },
    {
     "id": "verapokhumin-buyukada",
     "side": "anadolu",
     "short": "Verapokhumin (Büyükada)",
     "name": "Verapokhumin Surp Asdvadzadzin Ermeni Katolik Kilisesi",
     "rite": "ermeni",
     "district": "Büyükada, Adalar",
     "address": "Mehmetçik Sokak No: 11, 34970 Büyükada, Adalar, İstanbul",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Pazar (yaz)",
       "11:00"
      ]
     ],
     "massNote": "Ermeni Katolik kiliselerinde ayinler Ermenice ve Türkçe yapılır. Saatler mevsime göre değişir; bazı kiliselerde ayin yalnızca yazın ya da yalnızca kışın yapılır.",
     "visits": "Yaz aylarında ayin saatinde açıktır.",
     "history": [
      "Verapokhumin Surp Asdvadzadzin (Meryem Ana’nın Göğe Alınışı) Kilisesi, Adalar’daki tek Ermeni Katolik kilisesidir. Hayırsever Andon Ağa Apelyan tarafından 1856–1858 yıllarında yaptırıldı; kutsama ve açılış tarihi, Meryem Ana’nın Göğe Alınışı bayramına denk gelen 15 Ağustos 1858’dir.",
      "Kemerli tavanı sütunlarla taşınan ibadet salonunda Andon Ağa Apelyan’ı anan bir mermer plaket bulunur; Apelyan vasiyeti üzerine kilisenin içine gömülmüştür. Girişin üzerinde dairesel bir gül pencere, içeride koro balkonu ve org vardır. Çan kulesi 1895 tarihlidir; kilise 1956 ve 1985’te onarıldı."
     ],
     "sources": [
      [
       "Dijital İstanbul (İstanbul Valiliği): Verapokhumin Surp Asdvadzazni Ermeni Katolik Kilisesi",
       "https://dijitalistanbul.org/verapokhumin-surp-asdvadzazni-ermeni-katolik-kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": ""
    }
   ]
  },
  {
   "id": "izmir",
   "name": "İzmir",
   "lat": 38.42,
   "lon": 27.14,
   "label": [
    -11,
    5,
    "end"
   ],
   "open": "r",
   "churches": [
    {
     "id": "aziz-yuhanna-izmir",
     "short": "Aziz Yuhanna Katedrali",
     "name": "Aziz Yuhanna Katedral Bazilikası",
     "rite": "latin",
     "district": "Alsancak, Konak",
     "address": "Kültür Mah., Şehit Nevres Bulvarı No: 29, 35220 Alsancak, Konak, İzmir",
     "phones": [
      "0232 421 21 90"
     ],
     "email": "izmirkatedrali@gmail.com",
     "website": "https://www.izmirkatedrali.com",
     "mass": [
      [
       "Pazar",
       "10:00 İngilizce · 12:00 Türkçe · 18:00 Lehçe"
      ],
      [
       "Pazartesi–Cuma",
       "17:30 Tespih Duası · 18:00 Türkçe ayin"
      ],
      [
       "Perşembe",
       "Ayinden sonra Efkaristiya’ya Tapınma (18:30)"
      ]
     ],
     "massNote": "Her pazar ayinden sonra çay ve kahve ikram edilir. Saatler İzmir Katolik Başepiskoposluğu’nun sitesinden alınmıştır; yaz ve kış dönemlerinde değişebilir.",
     "visits": "Kişisel dua ve ziyaret için her gün 15:00–17:00 arası açıktır; pazar ve pazartesi günleri ziyarete kapalıdır.",
     "history": [
      "Aziz Yuhanna Katedral Bazilikası, İzmir Katolik Başepiskoposluğu’nun katedralidir ve Anadolu’daki en etkileyici Katolik ibadet yerlerinden biridir. Vahiy Kitabı’ndaki yedi kiliseden biri olan İzmir (Smyrna) kilisesi, İsa’nın Yuhanna aracılığıyla gönderdiği ikinci mektupta “Ölene kadar sadık kal, sana yaşam tacını vereceğim” sözleriyle övülür (Esinleme 2,8-11). Gelenek, bu topluluğun kurucusu olarak Havari Yuhanna’yı kabul eder; katedral de ona adanmıştır.",
      "İzmir kilisesinin tarihi, Yuhanna’nın öğrencisi Episkopos Polikarp’la sürer. Polikarp, 107 yılı civarında Roma’ya zincirlerle götürülen Antakyalı İgnatius’u burada karşıladı ve 155 yılı civarında, katedralden pek uzak olmayan antik stadyumda şehit edildi. Osmanlı döneminde İzmir’de piskopos oturamadığından unvan uzun süre onursal kaldı; 17. ve 19. yüzyıllar arasında bir Havarisel Vekillik vardı. 1818’de Papa VII. Pius, İzmir Başepiskoposluğu’nu yeniden kurdu; yeni bir katedral yapılana kadar Pasaport’taki Santa Maria Kilisesi 56 yıl boyunca katedral olarak kullanıldı.",
      "1857’de Başepiskopos Antonio Mussabini katedral için arazi satın aldı. İstanbul’da papalık temsilcisi olan Mussabini, Sultan Abdülaziz ile dostluğu sayesinde yalnızca izin almakla kalmadı; padişah inşaat için 11.000 altın lira da bağışladı. Mussabini’nin ölümüyle ara veren çalışmalar, halefi Vincenzo Spaccapietra’nın 25 Kasım 1862’de temel taşını kutsamasıyla yeniden başladı. On iki yıl süren ve İzmir Katoliklerinin cömert katkılarıyla yürüyen inşaatın sonunda katedral 14 Haziran 1874’te kutsandı.",
      "Sade ve zarif neoklasik yapı, antik Smyrna limanının bulunduğu yerdedir; Helenistik-Roma liman kalıntıları katedralin önündeki binaların altında kalır. Papa IX. Pius katedrale ana sunağı hediye etti; İzmirli Aziz İreneus’un piskoposu olduğu Lyon Başepiskoposluğu da minnet işareti olarak Haç Yolu’nun on dört tablosunu gönderdi. 1901’de Paris’te ressam Paul Gaudin’e yaptırılan vitrayların yalnızca biri 1922 yangınından kurtulabildi; bugün Aziz Yusuf sunağının sağındadır. Kutsal Sakrament şapelinin altındaki mahzende Mussabini, Spaccapietra, Efes’teki Meryem Ana Evi’nin bulunmasına katkı sağlayan Andrea Timoni ve Domenico Marengo gömülüdür.",
      "1922’deki büyük yangında katedral ağır hasar gördü; başepiskoposluk sarayı, idari binalar ve ilmihal salonları tamamen yandı. Yangından önce İzmir’de yaklaşık 15.000 Katolik, pek çok okul, hastane ve tarikat vardı; bu canlılık sonrasında hızla azaldı. Başepiskopos Joseph Descuffi, katedrali korumak için 1965’te onu ABD askerî topluluğuna şapel olarak kiraladı. Güvenlik önlemleri halkın kiliseye girmesini zorlaştırınca başepiskoposluk 2013’te sözleşmeyi sona erdirdi; restore edilen katedral 29 Eylül 2013’te yeniden yerel cemaate açıldı.",
      "2014’te İtalya’daki Isernia piskoposluğu, heykeltıraş Battista Marello’nun yaptığı 4 metre yüksekliğindeki bronz Aziz Yuhanna heykelini hediye etti; heykel bugün kilise bahçesindedir. 27 Aralık 2016’da Başepiskopos Lorenzo Piretto, içinde Aziz Yuhanna ve diğer havarilerin rölikleriyle Aziz Petrus’un mezarından bir parça bulunan yeni mermer sunağı kutsadı. Papa XXIII. Yuhanna, VI. Pavlus ve II. Jean Paul katedrali ziyaret etmiştir."
     ],
     "sources": [
      [
       "İzmir Katolik Başepiskoposluğu: Aziz Yuhanna Katedral Bazilikası",
       "https://izmirkatolikkilisesi.com/aziz-yuhanna-kilisesi/"
      ],
      [
       "İzmir Katedrali resmi sitesi",
       "https://www.izmirkatedrali.com"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "side": "merkez",
     "status": "active",
     "notice": ""
    },
    {
     "id": "aziz-polikarp",
     "short": "Aziz Polikarp",
     "name": "Aziz Polikarp Kilisesi (Sen Polikarp)",
     "rite": "latin",
     "district": "Pasaport, Konak",
     "address": "Necatibey Bulvarı No: 2/A, 35210 Pasaport, Konak, İzmir",
     "phones": [
      "0232 484 84 36"
     ],
     "email": "sanpolicarpo.izmir@gmail.com",
     "website": "https://senpolikarpizmir.com",
     "mass": [
      [
       "Pazartesi",
       "09:00 ayin, ardından 12:00’ye kadar Efkaristiya’ya Tapınma"
      ],
      [
       "Cumartesi ve pazar",
       "Ayin yok"
      ]
     ],
     "massNote": "Aziz Polikarp bayramı her yıl 23 Şubat’ta görkemle kutlanır; öncesinde dokuz günlük bir novena yapılır. Saatler İzmir Katolik Başepiskoposluğu’nun sitesinden alınmıştır; yaz ve kış dönemlerinde değişebilir.",
     "visits": "Pazar hariç her gün 15:00–17:00 arası ziyarete açıktır.",
     "history": [
      "Aziz Polikarp Kilisesi, İzmir’in hâlâ ayakta olan en eski kilisesidir. Adını, Havari Yuhanna’nın öğrencilerinden biri olan ve yaklaşık elli yıl İzmir episkoposluğu yapan Aziz Polikarp’tan alır. Polikarp, İsa’yı inkâr etmeyi reddettiği için 155 yılı civarında İzmir’in stadyumunda diri diri yakılmak istenmiş, alevler ona dokunmayınca bir hançerle öldürülmüştür. O zamandan beri İzmir’in koruyucu azizi sayılır.",
      "Kilisenin hikâyesi 1625’te, Osmanlı yönetiminden alınan izinle Fransa Konsolosluğu binasında açılan bir şapelle başlar. 1630’da şapelin yerine başepiskoposluğun bugünkü arazisinde bir kilise ve manastır yapıldı ve Aziz Polikarp, Fransız cemaatinin kilisesi oldu. 1688’deki büyük depremde yıkılan yapının yerine 1690’da bugünkü kilise inşa edildi.",
      "Defalarca hasar görüp onarılan kilise 1898’de genişletildi ve bugünkü görkemli süslemelerine kavuştu. 19. yüzyılın sonunda İzmir’e yerleşen genç Fransız ressam-mimar Raymond Péré, Aziz Polikarp’ın şehitliğini de anlatan freskleri yaptı. Kilisenin adı, İzmir’in simgesi Saat Kulesi ile birlikte anılır.",
      "Kiliseye yüzyıllarca Fransisken Kapuçin rahipleri hizmet etti; tarikat manastırı 1984’te bıraktı. Bugünkü manastır binası, 1922’deki büyük İzmir yangınında yıkılan eski binanın yerine 1929’da yapılmıştır."
     ],
     "sources": [
      [
       "İzmir Katolik Başepiskoposluğu: Aziz Polikarp Kilisesi",
       "https://izmirkatolikkilisesi.com/aziz-polikarpos/"
      ],
      [
       "Aziz Polikarp Katolik Kilisesi resmi sitesi",
       "https://senpolikarpizmir.com"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "side": "merkez",
     "status": "active",
     "notice": ""
    },
    {
     "id": "santo-rosario-izmir",
     "short": "Santo Rosario (Alsancak)",
     "name": "Notre Dame du Rosaire Kilisesi (Santo Rosario)",
     "rite": "latin",
     "district": "Alsancak, Konak",
     "address": "1481 Sokak No: 8, Alsancak, Konak, İzmir",
     "phones": [
      "0232 421 66 66"
     ],
     "email": "alsancakkatolikkilisesi@gmail.com",
     "website": "",
     "mass": [
      [
       "Pazar",
       "11:00 İtalyanca · 18:30 Türkçe (Ocak–Mayıs; yazın 19:00) · ayda bir 17:00 İspanyolca"
      ],
      [
       "Pazartesi, salı, çarşamba, cuma (Ocak–Mayıs)",
       "18:10 Tespih Duası · 18:30 ayin"
      ],
      [
       "Hafta içi (Haziran–Eylül)",
       "09:00"
      ],
      [
       "Perşembe",
       "10:00"
      ],
      [
       "Cumartesi (Ekim–Mayıs)",
       "17:00 Türkçe"
      ]
     ],
     "massNote": "Saatler İzmir Katolik Başepiskoposluğu’nun sitesinden alınmıştır; yaz ve kış dönemlerinde değişebilir.",
     "visits": "Ayin saatlerinde açıktır.",
     "history": [
      "Alsancak’taki Kutsal Tespih Kilisesi, İzmir’deki Latin Katolik cemaatinin merkezlerinden biridir ve kuruluşundan beri Dominiken rahiplere bağlıdır. Ermeni Dominiken rahipleri 1718’de İzmir’e geldi ve 1755’te ilk evlerini, cemaat için de bir misafirhane açtı. 1813’ten itibaren İtalyan Dominikenler cemaate hizmet etmeye başladı.",
      "1859’da Aziz Petrus ve Pavlus’a adanmış ilk kilise tamamlandı. Kutsal Tespih onuruna yapılacak yeni kilisenin temel taşı 4 Ekim 1903’te kondu ve kilise 1 Ekim 1904’te cemaate açıldı. 1922’deki büyük İzmir yangını çevredeki mahalleleri yok ederken kilise, cemaatin deyişiyle mucizevi bir şekilde, hiçbir zarar görmeden ayakta kaldı.",
      "İkinci Vatikan Konsili’nin ardından, 1965’te sunak ve çevresi yeni litürjiye göre yenilendi. Ermeni Dominikenler İzmir’e gelirken en değerli emanetlerini de yanlarında getirmişti: bugün ABD’deki bir kilisede korunan Havari Yahuda Tadday’ın kolu, Longinus’un mızrağı olarak saygı gören bir emanet ve Tespihin Meryem Ana’sının gümüş bir heykeli. Rahipler bu heykeli, İzmir’deki ilk günlerinde onları Aziz Polikarp Kilisesi’nde ağırlayan Kapuçinlere minnet hediyesi olarak verdiler."
     ],
     "sources": [
      [
       "İzmir Katolik Başepiskoposluğu: Notre Dame du Rosaire Kilisesi",
       "https://izmirkatolikkilisesi.com/santo-rosario/"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "side": "merkez",
     "status": "active",
     "notice": ""
    },
    {
     "id": "santa-maria-izmir",
     "short": "Santa Maria (Pasaport)",
     "name": "Santa Maria Kilisesi",
     "rite": "latin",
     "district": "Pasaport, Konak",
     "address": "Akdeniz Mah., Halit Ziya Bulvarı No: 67, Pasaport, Konak, İzmir",
     "phones": [],
     "email": "",
     "website": "",
     "status": "limited",
     "notice": "İzmir Katolik Başepiskoposluğu’na göre kilise şu anda Ortodoks kilisesi olarak kullanılmaktadır; Katolik ayini yapılmamaktadır. CET’in 2023 listesinde pazar 11:00 İtalyanca ayin geçiyordu; gitmeden önce teyit edin.",
     "mass": [
      [
       "Katolik ayini",
       "Şu anda yok (kilise Ortodoks ibadetine açık)."
      ]
     ],
     "massNote": "",
     "visits": "Ziyaret için önceden bilgi alın.",
     "history": [
      "Santa Maria, İzmir’in en eski Katolik kiliselerinden biridir. 14. yüzyılda İtalyan Fransisken rahipler, bugünkü yerin yakınında Meryem Ana’ya adanmış bir kilise yaptılar; bu yapı 1688 depreminde hasar gördü. 1692’de bugünkü yerde yeni bir kilise ve manastırın inşasına başlandı; Hollandalılar da inşaata katkıda bulundu. Kilise 25 Aralık 1698’de kutsandı. O dönem kıyıda olan semt, burada yaşayan Maltalı göçmenler yüzünden Maltezika diye anılıyordu.",
      "1865’e kadar İtalyan Katolikler, Raguzalılar ve Avusturyalılar kilisenin bahçesine gömüldü. 1866’da kurulan Sant’Antonio Hastanesi’ni kilisenin Fransisken rahipleri yönetti. 16 Ağustos 1889 yangınında hasar gören kilise, 1890’dan 1919’a kadar Avusturya-Macaristan’ın himayesindeydi; bu dönemde tavanı demir yapılarla güçlendirildi. Manastır binası 1922 yangınında yıkıldı.",
      "İzmir Başepiskoposluğu 1818’de yeniden kurulunca, Aziz Yuhanna Katedrali tamamlanana kadar (1874) başepiskoposun makamı olarak 56 yıl boyunca katedral görevi yaptı; Başepiskopos Mussabini geçici olarak burada gömüldü. Kilisenin orgu 1700 yılına ait, Venedik yapımıdır ve 2014’te Lucien Arkas tarafından eşi Viviana de Zandonati Arkas anısına onartıldı. Son restorasyonu, 2003–2015 arasında burada görev yapan Peder Francesco de Luca yaptırdı."
     ],
     "sources": [
      [
       "İzmir Katolik Başepiskoposluğu: Santa Maria Katolik Kilisesi",
       "https://izmirkatolikkilisesi.com/santa-maria/"
      ],
      [
       "Vikipedi: Santa Maria Katolik Kilisesi (Konak)",
       "https://tr.wikipedia.org/wiki/Santa_Maria_Katolik_Kilisesi_(Konak)"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "side": "merkez"
    },
    {
     "id": "bornova-meryemin-adi",
     "short": "Meryem’in Kutsal Adı (Bornova)",
     "name": "Meryem’in Kutsal Adı Kilisesi (Saint Nom de Marie)",
     "rite": "latin",
     "district": "Bornova",
     "address": "Erzene Mah., Kazım Karabekir Caddesi No: 4, 35040 Bornova, İzmir",
     "phones": [
      "0232 484 86 32"
     ],
     "email": "bornova@izmirsantamariakilisesi.org",
     "website": "https://www.izmirsantamariakilisesi.org",
     "mass": [
      [
       "Pazartesi–Cuma",
       "08:30 Türkçe"
      ],
      [
       "Cumartesi",
       "17:00 (kış) · 18:00 (yaz), Türkçe"
      ],
      [
       "Pazar",
       "Ayin yok"
      ]
     ],
     "massNote": "Saatler İzmir Katolik Başepiskoposluğu’nun sitesinden alınmıştır; yaz ve kış dönemlerinde değişebilir.",
     "visits": "Ayin saatlerinde açıktır.",
     "history": [
      "Bornova’daki Meryem’in Kutsal Adı Kilisesi, bu semtte yaşayan Levanten ve Katolik aileler için kurulmuştur. Burada yaklaşık yarım yüzyıldır ahşap bir ev ve şapel bulunuyordu; kilise kanonik olarak 1797’de kuruldu. O tarihten önce ayinleri yapmak için İzmir’deki Santa Maria Kilisesi’nin rahipleri gelirdi.",
      "Bugünkü kilise 1831’den beri ayaktadır ve Meryem’in Kutsal Adı’nı taşır. 1925’e kadar cemaatte 500’den fazla Katolik, üç rahip ve rahibeler vardı; cemaatin bir yetimhanesi ve Hayırsever Rahibeler’in yönettiği, 1935’te kapanan bir okulu bulunuyordu.",
      "Kilise 1918’e kadar Avusturya’nın himayesindeydi; 1960’larda yedi farklı milletten 82 Hristiyanın bulunduğu cemaatin resmî dili Fransızca oldu. Kilise kuruluşundan beri Küçük Kardeşler Fransiskenleri’ne (OFM) aittir; bugün cemaatin başında Arjantinli ve Pakistanlı iki rahip bulunur ve ayinler Türkçe yapılır."
     ],
     "sources": [
      [
       "İzmir Katolik Başepiskoposluğu: Meryem’in Kutsal Adı Kilisesi",
       "https://izmirkatolikkilisesi.com/bornova/"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "side": "merkez",
     "status": "active",
     "notice": ""
    },
    {
     "id": "buca-vaftizci-yahya",
     "short": "Vaftizci Yahya (Buca)",
     "name": "Vaftizci Aziz Yahya Kilisesi",
     "rite": "latin",
     "district": "Buca",
     "address": "Dumlupınar Mah., 81. Sokak No: 23, 35160 Buca, İzmir",
     "phones": [
      "0232 420 08 42"
     ],
     "email": "",
     "website": "",
     "mass": [
      [
       "Cumartesi",
       "18:00 Türkçe"
      ],
      [
       "Pazar",
       "11:00 Fransızca"
      ]
     ],
     "massNote": "Saatler İzmir Katolik Başepiskoposluğu’nun sitesinden alınmıştır; yaz ve kış dönemlerinde değişebilir.",
     "visits": "Ayin saatlerinde açıktır.",
     "history": [
      "Buca Kilisesi’nin kökeni, 1805’te buradaki yabancı işçiler ve yazlıkçılar için yapılan, boyutları bilinmeyen bir şapele dayanır; şapelde önce bir Fransisken, sonra bir bölge rahibi ayin yapıyordu. Buca 1828’de kanonik bir cemaat oldu.",
      "Vaftizci Yahya’ya adanan bugünkü kilise 1840’a tarihlenir ve 1866’da 64 yaşında ölen ilk bölge rahibi Don Giacomo Vitalis’in on yıllık emeğinin eseridir. Paris’teki Dışişleri arşivlerinde bulunan 1841 tarihli bir fermanın Fransızca çevirisi, kilisenin Fransız himayesindeki bir kurum olarak tanındığını gösterir. 1937–1938’de, Bornova, Samsun ve Yeşilköy kiliselerini de süsleyen Kapuçin dekoratör Peder Agostino da Modica kiliseyi süsledi.",
      "Ekim 1932’den itibaren, bölge rahibi eksikliği nedeniyle kilise İtalya’nın Parma bölgesindeki Kapuçin rahiplerine emanet edildi. 1954 ve 1976’da restorasyonlar yapıldı; org, sunaklar ve yeni papaz evi (1970) eklendi. 2022 yazının sonundan beri Enkarne Söz Rahibeleri (Verbo Incarnato) topluluğu ve bir başepiskoposluk rahibi kilisenin yanındaki binalarda yaşamaktadır."
     ],
     "sources": [
      [
       "İzmir Katolik Başepiskoposluğu: Aziz Vaftizci Yuhanna Kilisesi",
       "https://izmirkatolikkilisesi.com/buca/"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "side": "merkez",
     "status": "active",
     "notice": ""
    },
    {
     "id": "goztepe-lourdes",
     "short": "Notre-Dame de Lourdes (Göztepe)",
     "name": "Notre-Dame de Lourdes Kilisesi",
     "rite": "latin",
     "district": "Göztepe, Konak",
     "address": "81. Sokak No: 12, 35290 Göztepe, Konak, İzmir",
     "phones": [
      "0536 029 37 56"
     ],
     "email": "",
     "website": "https://ndlgoztepe.com",
     "mass": [
      [
       "Pazartesi–Cuma",
       "18:30 Tespih Duası · 19:00 Türkçe ayin"
      ],
      [
       "Cumartesi",
       "Ayin yok"
      ],
      [
       "Pazar",
       "17:00 Türkçe"
      ]
     ],
     "massNote": "Saatler İzmir Katolik Başepiskoposluğu’nun sitesinden alınmıştır; yaz ve kış dönemlerinde değişebilir.",
     "visits": "Ayin saatlerinde açıktır.",
     "history": [
      "Göztepe’deki Notre-Dame de Lourdes cemaati 1900’de Hollandalı rahip Peder Fercken tarafından kuruldu. O yıllarda Göztepe, ağırlıklı olarak Latin Hristiyanların yaşadığı küçük bir köydü. 27 Mayıs 1900’de İzmir Başepiskoposu André Timoni kilisenin açılışını yaptı ve henüz bitmemiş kilisede Lourdes Meryem Ana kardeşliğini kurdu; cemaat üyeleri inşaatın tamamlanmasına küçük katkılarıyla destek oldu.",
      "17 Ekim 1902’de, 400’den fazla üyesi olan kardeşliğin Fransa’daki Lourdes Bazilikası’nın büyük kardeşliğine bağlanması istendi. Raymond Péré’nin tasarladığı Carrara mermerinden yüksek sunak 9 Ekim 1904’te kutsandı; sunağın altında Büyük Aziz Yakup ile Azize Perpetua ve Felicitas’ın rölikleri vardır. Heykellerin ve iki çandan birinin çoğu 1904–1906 arasında bağışçılar tarafından hediye edildi.",
      "Kuruluşundan beri Fransızca konuşan cemaat, 1960’lara kadar canlılığını korudu; Hristiyan nüfusu azaldıkça küçüldü ve yıllarca Alsancak’taki Dominikenler tarafından ayakta tutuldu. 2006’dan itibaren manastır ve kilisede yapılan büyük yenileme, Afrikalı öğrencilerin gelişi ve kilisede kalan bir rahiple cemaat yeniden canlandı. Ayinler bugün Türkçe yapılır."
     ],
     "sources": [
      [
       "İzmir Katolik Başepiskoposluğu: Notre-Dame de Lourdes Kilisesi",
       "https://izmirkatolikkilisesi.com/goztepe/"
      ],
      [
       "Notre-Dame de Lourdes Göztepe",
       "https://ndlgoztepe.com"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "side": "merkez",
     "status": "active",
     "notice": ""
    },
    {
     "id": "karsiyaka-helena",
     "short": "Azize Helena (Karşıyaka)",
     "name": "Azize Helena Kilisesi (Saint Hélène)",
     "rite": "latin",
     "district": "Karşıyaka",
     "address": "Donanmacı Mah., 1729 Sokak No: 53, 35530 Karşıyaka, İzmir",
     "phones": [
      "0232 364 36 22"
     ],
     "email": "azizehelena@gmail.com",
     "website": "",
     "mass": [
      [
       "Pazar",
       "09:30 Tespih Duası · 10:00 Türkçe ayin"
      ],
      [
       "Salı–Cumartesi",
       "17:30 Tespih Duası · 18:00 Türkçe ayin"
      ],
      [
       "Pazartesi",
       "Ayin yok"
      ]
     ],
     "massNote": "Saatler İzmir Katolik Başepiskoposluğu’nun sitesinden alınmıştır; yaz ve kış dönemlerinde değişebilir.",
     "visits": "Ayin saatlerinde açıktır.",
     "history": [
      "Karşıyaka’daki ilk Katolik aileler 1880’de kayda geçti; 1882’de sayıları yirmiyi bulunca Başepiskopos Timoni, Don Valery’yi ilk rahip olarak atadı. O yıllarda cemaatin yalnızca derme çatma bir şapeli vardı.",
      "Bugünkü kilisenin inşasına 1904’te Fransız mimar Raymond Charles Péré’nin tasarımıyla başlandı ve yaklaşık on yılda tamamlandı. Yapımına Sultan II. Abdülhamid’in fermanıyla izin verildi; bu belge 1926’da Türkiye Cumhuriyeti belgesine dönüştürüldü. Kilise, İmparator I. Konstantin’in annesi ve Kudüs’te Kutsal Haç’ı bulan Azize Helena’ya adanmıştır.",
      "Bazilika planlı, üç nefli kilise, 19. yüzyılda moda olan yeni-gotik üsluptadır. Ana sunağın arkasında, taç giymiş ve Haç’ı tutan bir imparatoriçe olarak Azize Helena’nın tasviri vardır; sunağın iki yanında Aziz Yusuf ve İzmir’in koruyucu azizi Aziz Polikarp’ın heykelleri, yan sunaklarda Fatima Meryem Ana’sı ve İsa’nın Kutsal Kalbi’nin heykelleri bulunur.",
      "Kilise 1951’de Kapuçin rahiplerine emanet edildi. 1979’da cemaat yaklaşık 90 aile ve 280 kişiden oluşuyordu; yarısından fazlası Türk vatandaşıydı. Azize Helena bugün Karşıyaka’daki tek etkin kilisedir ve Konventüel Fransisken bir rahip tarafından yönetilir."
     ],
     "sources": [
      [
       "İzmir Katolik Başepiskoposluğu: Azize Helena Kilisesi",
       "https://izmirkatolikkilisesi.com/karsiyaka/"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "side": "merkez",
     "status": "active",
     "notice": ""
    },
    {
     "id": "bayrakli-antuan",
     "short": "Aziz Antuan (Bayraklı)",
     "name": "Aziz Antuan Kilisesi (Saint Antoine)",
     "rite": "latin",
     "district": "Bayraklı",
     "address": "Fuat Edip Baksı (1610) Sokak No: 5, 35540 Bayraklı, İzmir",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Pazar",
       "11:00 Türkçe"
      ],
      [
       "Pazartesi–Cuma",
       "11:00 Türkçe"
      ],
      [
       "Salı",
       "13:00 Türkçe (Padre Pio grubu)"
      ]
     ],
     "massNote": "Saatler İzmir Katolik Başepiskoposluğu’nun sitesinden alınmıştır; yaz ve kış dönemlerinde değişebilir.",
     "visits": "Ayin saatlerinde açıktır.",
     "history": [
      "1898’de Sultan II. Abdülhamid, Bayraklı tepesini Yahya Hayati Paşa ile Transibullo Pittako’ya verdi. İkili, deniz manzaralı bu yeşil tepede yeni bir köy kurmak istedi; İzmir’den gelen pek çok Katolik aile buraya yazlık evler yaptı. Köyü büyütmek isteyen kurucular Katoliklere, Ermenilere, Ortodokslara ve Müslümanlara ibadethane yapmaları için ücretsiz arazi verdi.",
      "1899’da Kapuçin rahip Giambattista da San Lorenzo, Bayraklı’daki tanıdığı bir aileyi ziyarete geldi; aileler, paşanın onlara bağışladığı araziyi bir kilise ve manastır için Kapuçinlere vermek istediklerini söyledi. 1901’de episkopos izin verdi. 29 Haziran 1902’de Mattesich ailesinin evinde, 30 kişinin katıldığı ilk Katolik ayini kutlandı.",
      "Belediyenin tereddütlerine ve padişahtan ferman bekleme sürecine rağmen kilisenin ilk taşı 14 Temmuz 1902’de, manastırınki 7 Ağustos 1902’de kondu; o sırada Bayraklı’da 300 Katolik aile yaşıyordu. İlk sürekli rahip Bernardo da Castelmine 1903’te yerleşti, aynı yıl sultanın fermanı geldi ve bir Hristiyan mezarlığı kuruldu. 1904’te manastırın yanında altı sınıflı bir İtalyan okulu açıldı. 19 Nisan 1905’te, kilisenin henüz yalnızca duvarları varken kutlanan Aziz Espedito bayramına 4000 kişi katıldı.",
      "Kilisedeki ilk resmî tören 13 Ağustos 1922’de yapıldı. Yapının eskiden iki çan kulesi vardı; biri büyük bir depremden sonra yıkıldı. Manastır ve kilise 1990’da bugünkü hâlini aldı ve bölgedeki küçük Hristiyan cemaatine hizmet etmeye devam ediyor."
     ],
     "sources": [
      [
       "İzmir Katolik Başepiskoposluğu: Aziz Antuan Kilisesi",
       "https://izmirkatolikkilisesi.com/bayrakli/"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "side": "merkez",
     "status": "active",
     "notice": ""
    },
    {
     "id": "meryem-ana-evi",
     "short": "Meryem Ana Evi",
     "name": "Meryem Ana Evi (Efes)",
     "rite": "latin",
     "district": "Bülbüldağı, Selçuk",
     "address": "Atatürk Mah., Meryem Ana Mevkii Küme Evleri, 35922 Selçuk, İzmir",
     "phones": [
      "0232 894 10 14",
      "0530 469 08 44"
     ],
     "email": "meryemanaevi@gmail.com",
     "website": "https://www.hzmeryemanaevi.com",
     "mass": [
      [
       "Pazar",
       "10:30 İngilizce"
      ],
      [
       "Pazartesi–Cumartesi",
       "Akşam ayini: 17:15 (Kasım–Mart) · 18:15 (Nisan–Ekim)"
      ]
     ],
     "massNote": "Başepiskoposluğun sitesinde hafta içi 18:15’te Tespih Duası geçiyor; CET 2023 listesi ise aynı saatlerde ayin veriyor. Hac grupları için ayin önceden ayarlanabilir.",
     "visits": "Meryem Ana Evi’nin bulunduğu alan her gün ziyaretçilere açıktır; giriş ücretlidir ve saatler mevsime göre değişir.",
     "history": [
      "Bülbüldağı’nın yamacındaki Meryem Ana Evi, geleneğe göre Meryem Ana’nın hayatının son yıllarını Havari Yuhanna ile birlikte geçirdiği evdir. Yuhanna’nın Efes’te yaşadığı ve öldüğü eski kaynaklarda anlatılır; mezarının kalıntıları bugün Selçuk’taki Aziz Yuhanna Bazilikası’ndadır.",
      "Evin yeri 19. yüzyılın sonunda, Alman mistik Anna Katharina Emmerich’in anlatılarından yola çıkan araştırmalarla belirlendi. 1891’de İzmir’deki Lazarist rahipler, Başepiskopos Andrea Timoni’nin desteğiyle yaptıkları arayışta bugünkü kalıntıları buldu. Eski temeller üzerinde yükselen küçük taş şapel restore edilerek ibadete açıldı.",
      "Meryem Ana Evi hem Hristiyanlar hem de Meryem’i saygıyla anan Müslümanlar için önemli bir ziyaret yeridir. Papa VI. Pavlus (1967), II. Jean Paul (1979) ve XVI. Benedictus (2006) burayı ziyaret etti. Şapel bugün İzmir Başepiskoposluğu’na bağlı Kapuçin rahipleri tarafından hizmet görür; her yıl 15 Ağustos’ta Meryem Ana’nın Göğe Alınışı bayramı burada kutlanır."
     ],
     "sources": [
      [
       "İzmir Katolik Başepiskoposluğu: Meryem Ana Evi Kilisesi",
       "https://izmirkatolikkilisesi.com/meryem-ana-evi/"
      ],
      [
       "Meryem Ana Evi resmi sitesi",
       "https://www.hzmeryemanaevi.com"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "side": "selcuk",
     "status": "active",
     "notice": ""
    },
    {
     "id": "selcuk-aziz-yuhanna",
     "short": "Aziz Yuhanna (Selçuk)",
     "name": "Aziz Yuhanna Katolik Kilisesi (Selçuk)",
     "rite": "latin",
     "district": "Selçuk",
     "address": "Atatürk Mah., 1050 Sokak No: 1, 35920 Selçuk, İzmir",
     "phones": [
      "0232 894 10 14"
     ],
     "email": "meryemanaevi@gmail.com",
     "website": "",
     "mass": [
      [
       "Pazar",
       "15:00 Türkçe"
      ]
     ],
     "massNote": "CET’in 2023 listesinde pazar ayini 10:00 olarak geçiyordu; başepiskoposluğun sitesi 15:00 veriyor.",
     "visits": "Ayin saatinde açıktır.",
     "history": [
      "Selçuk’taki bu küçük Katolik ibadet yeri, “Selçuk Katolik Kilisesi Derneği” adıyla kurulmuştur ve Efes’i ziyaret eden hacılar ile ilçede yaşayan Katolikler için pazar ayinleri düzenler. Kilise, Meryem Ana Evi ile aynı rahip topluluğu tarafından hizmet görür.",
      "Selçuk, Havari Yuhanna’nın hayatının son yıllarını geçirdiği ve gömüldüğü yer olarak kabul edilir; Ayasuluk Tepesi’ndeki büyük Aziz Yuhanna Bazilikası’nın kalıntıları kilisenin yakınındadır. 431’deki Efes Konsili, Meryem’in “Tanrı’nın Annesi” (Theotokos) olduğunu burada ilan etmiştir."
     ],
     "sources": [
      [
       "İzmir Katolik Başepiskoposluğu: Aziz Yuhanna Katolik Kilisesi Derneği",
       "https://izmirkatolikkilisesi.com/aziz-yuhanna-selcuk/"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "side": "selcuk",
     "status": "active",
     "notice": ""
    }
   ]
  },
  {
   "id": "bursa",
   "name": "Bursa",
   "lat": 40.19,
   "lon": 29.06,
   "label": [
    0,
    21,
    "middle"
   ],
   "open": "r",
   "churches": [
    {
     "id": "aziz-meryem-bursa",
     "short": "Aziz Meryem (Fransız Kilisesi)",
     "name": "Aziz Meryem Fransız Kilisesi",
     "rite": "latin",
     "district": "Hocaalizade, Osmangazi",
     "address": "Hocaalizade Mah., Osmangazi, Bursa",
     "phones": [],
     "email": "",
     "website": "",
     "status": "closed",
     "notice": "Kilise, Bursa Vakıflar Bölge Müdürlüğü tarafından depreme dayanıksız olduğu gerekçesiyle tahliye edildi ve kapatıldı. Son ayin 16 Şubat 2025 Pazar günü yapıldı; yeniden ne zaman açılacağı bilinmiyor. Cemaatlere başka bir kilise tahsis edilmedi; Hristiyanlar ibadetlerini şimdilik Bursa Protestan Kilisesi Yaşam ve Kültür Vakfı’nın binasında sürdürüyor.",
     "mass": [
      [
       "Şu anda",
       "Ayin yapılmıyor (kilise kapalı)."
      ]
     ],
     "massNote": "",
     "visits": "Kapalı.",
     "history": [
      "Hocaalizade semtindeki Aziz Meryem Kilisesi, 19. yüzyılın sonunda Bursa’da yaşayan Fransız kökenli tüccarlar ve Hayırsever Rahibeler (Filles de la Charité) için yapıldı; kaynaklar 1881’de gayrimüslimlerin ibadetine açıldığını belirtir. Yapının içinde bir dispanser, yetimhane ve hasta bakım yeri de bulunuyordu. Kilisenin iç süslemesi 1927’de Asumsiyonist rahip Prosper Lamerand ile bir Rus ressam tarafından yapıldı.",
      "Dikdörtgen planlı, tek nefli kilisenin cephesi sade bir gövdeye sahiptir; ana duvarların üzerinde yükselen kademeli kuleler, sivri kemerli pencereler ve gotik üslup yapıya hareket katar. Kilise 1960’tan sonra kullanılmadı; 1971’de kısa bir süre asıl işlevine döndü ve 1970’lerde İtalya’dan gelen ailelerin ibadetine açıldı.",
      "Farklı dinlerin, dillerin ve kültürlerin bir arada yaşadığı Bursa’nın bu yüzünü de yansıtmak amacıyla, kilise 2004’te Bursa Büyükşehir Belediyesi tarafından sosyal, kültürel ve dinî işlevli bir yapı olarak restore edildi. Yaklaşık yirmi yıl boyunca Katolik, Ortodoks ve Protestan cemaatlerin birlikte ibadet ettiği, dünyada eşine az rastlanır bir kilise oldu.",
      "Temmuz 2024’te Vakıflar Bölge Müdürlüğü, kilisenin hamamlar bölgesinde bulunduğunu, yeraltı su seviyesinin yüksek olduğunu, zeminde sıvılaşma riski ve fay hattı nedeniyle gerilim biriktiğini belirterek tahliye istedi. Cemaatin Jeoloji Mühendisleri Odası’na bağlı bir ofise hazırlattığı rapor ise riskin iddia edilenden çok daha düşük olduğunu söylüyordu. Mahkeme süreci tahliyeyle sonuçlandı ve son ayin 16 Şubat 2025’te yapıldı. Kilisenin kapanması, İznik Konsili’nin 1700. yıl dönümü için 2025’te bölgeye gelen Hristiyan hacılar için de önemli bir eksiklik oldu."
     ],
     "sources": [
      [
       "Agos: Bursa’nın ibadete açık tek kilisesi kapatıldı",
       "https://www.agos.com.tr/tr/haber/bursanin-ibadete-acik-tek-kilisesi-kapatildi-32298"
      ],
      [
       "ANKA: Bursa Fransız Kilisesi’nde son kez ibadet yapıldı",
       "https://ankahaber.net/haber/detay/depreme_dayaniksiz_oldugu_gerekcesiyle_tahliyesi_istenen_bursa_fransiz_kilisesinde_son_kez_ibadet_yapildi_220908"
      ],
      [
       "Kültür Portalı: Fransız Kilisesi (Bursa)",
       "https://www.kulturportali.gov.tr/turkiye/bursa/gezilecekyer/fransiz-kilisesi"
      ]
     ],
     "side": ""
    }
   ]
  },
  {
   "id": "ankara",
   "name": "Ankara",
   "lat": 39.93,
   "lon": 32.86,
   "label": [
    11,
    5,
    "start"
   ],
   "open": "r",
   "churches": [
    {
     "id": "azize-tereza-ankara",
     "short": "Azize Tereza (Ulus)",
     "name": "Azize Tereza Kilisesi",
     "rite": "latin",
     "district": "Ulus, Altındağ",
     "address": "Kale Mah., Kardeşler Sokak No: 15, 06250 Altındağ, Ankara",
     "phones": [
      "0312 311 01 18 (14:00–17:00)"
     ],
     "email": "bilgi@ankarakatolik.com",
     "website": "https://www.ankarakatolik.com/tr/",
     "mass": [
      [
       "Pazar",
       "11:30 Türkçe"
      ],
      [
       "Çarşamba",
       "18:00 Türkçe"
      ]
     ],
     "massNote": "Paskalya ve Noel gibi bayramlarda saatler değişir; kilisenin “Duyurular” sayfasında ilan edilir.",
     "visits": "Salı–cumartesi 14:00–17:00 arası ziyarete açıktır.",
     "history": [
      "Azize Tereza Kilisesi, Ankara’nın tarihî merkezi Ulus’ta, Kardeşler Sokağı’ndadır. 1915’te burada, Hristiyan Okulların Kardeşleri (Frères des Écoles Chrétiennes) tarafından yönetilen Aziz Klement Fransız Koleji bulunuyordu; bölge o dönem eski Ermeni mahallesine de yakındı. Sokak, Fransızca öğreten bu kardeşlerin anısına “Kardeşler Sokağı” adını aldı.",
      "1916’daki büyük Ankara yangınında kolej ve çevresindeki bütün semt yandı; kolejden yalnızca bir duvar kaldı. 1928’de eski kolejin arsasına, zemin katında Fransa Büyükelçiliği kançılaryasını, birinci katında ise bir salon ve küçük bir şapeli barındıran bir bina yapıldı. İlk yıllarda Fransa konsolosu burada oturdu; daireler sonraları 1962’ye kadar küçük bir Fransız okuluna verildi.",
      "Binanın en değerli bölümü, birinci kattaki ve 2002’de bütünüyle restore edilen şapeldir; restorasyonun ardından Lisieux’lü Azize Tereza’ya adandı. Ana mozaiği, Kapadokya kiliselerinden esinlenen Fransız sanatçı Hervé Vital yaptı: Davut ve Süleyman, mezardan çıkarak dirilmiş İsa’nın uzattığı ele uzanan Âdem ile Havva’yı gösterir. İki yandaki mozaiklerde kucağında Çocuk İsa ile Meryem ve bir elinde İncil tutarak kutsayan Mesih vardır. Haç Madeleine Diener’in eseridir.",
      "Sütun başlıklarındaki koç başları Eski Ahit’teki kurbanları, tavan köşelerindeki buğday başakları ve üzüm salkımları ise Efkaristiya’yı hatırlatır. Yan duvarlardaki vitrayların altısı 1914’te Bordeaux’da D. P. Dagrant tarafından yapıldı; İzmit’teki Fransız Koleji’nin şapelindeydiler, okul 1920’de kapanınca Kadıköy’de saklandılar ve 1952’de buraya takıldılar. Diziyi tamamlayan dört vitray Floransa’da yapıldı. Kilise bugün Cizvit rahipler tarafından yönetilir ve İstanbul Latin Katolik Havarisel Vekilliği’ne bağlıdır."
     ],
     "sources": [
      [
       "Azize Tereza Kilisesi resmi sitesi: Kilisemizin Tarihi",
       "https://www.ankarakatolik.com/tr/kilisemizin-tarihi/"
      ],
      [
       "Azize Tereza Kilisesi: İletişim",
       "https://www.ankarakatolik.com/tr/iletisim/"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": "",
     "side": ""
    },
    {
     "id": "meryem-ana-ankara",
     "short": "Meryem Ana (Çankaya)",
     "name": "Meryem Ana Kilisesi (Vatikan Büyükelçiliği)",
     "rite": "latin",
     "district": "Çankaya",
     "address": "Birlik Mah., 428. Cadde No: 35, Vatikan Büyükelçiliği, Çankaya, Ankara",
     "phones": [
      "0312 495 95 46 (14:00–17:00)"
     ],
     "email": "info@ankarakatolik.com",
     "website": "https://www.ankarakatolik.com/en/",
     "mass": [
      [
       "Cumartesi",
       "18:00 Fransızca"
      ],
      [
       "Pazar",
       "10:00 İngilizce · 11:30 İspanyolca"
      ],
      [
       "Her ayın üçüncü pazarı",
       "Tek ayin: 10:00 (uluslararası)"
      ],
      [
       "Pazartesi ve cuma",
       "19:00"
      ],
      [
       "Salı ve çarşamba",
       "08:00"
      ],
      [
       "Perşembe",
       "12:00"
      ]
     ],
     "massNote": "Kilise yalnızca ayin saatlerinde dışarıdan gelen cemaate açılır.",
     "visits": "Yalnızca ayin saatlerinde açıktır.",
     "history": [
      "Meryem Ana Kilisesi, Ankara’da yaşayan uluslararası Katolik topluluğunun ibadet yeridir. Vatikan’ın Türkiye Büyükelçiliği’nin (Apostolik Nunsiyatür) bahçesinde bulunur ve dünyanın dört bir yanından gelen, farklı kültür ve sosyal çevrelerden insanları bir araya getirir.",
      "Cemaatte diplomatlar, misyon görevlileri ve özellikle Afrika ülkelerinden gelen çok sayıda üniversite öğrencisi vardır. Ayinler Fransızca, İngilizce ve İspanyolca yapılır; ilmihal, çocuklar için ilk komünyon ve güçlendirme hazırlığı, koro ve gençlik grubu gibi etkinlikler cemaat konseyi tarafından yürütülür. Kilise, Ulus’taki Azize Tereza ile birlikte Ankara Katolik Kilisesi’nin iki ibadet yerinden biridir."
     ],
     "sources": [
      [
       "Meryem Ana Church (Ankara) resmi sitesi",
       "https://www.ankarakatolik.com/en/"
      ],
      [
       "Meryem Ana Church: Contact",
       "https://www.ankarakatolik.com/en/contact-us/"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": "",
     "side": ""
    }
   ]
  },
  {
   "id": "konya",
   "name": "Konya",
   "lat": 37.87,
   "lon": 32.49,
   "label": [
    0,
    21,
    "middle"
   ],
   "open": "r",
   "churches": [
    {
     "id": "aziz-pavlus-konya",
     "short": "Aziz Pavlus",
     "name": "Aziz Pavlus Kilisesi",
     "rite": "latin",
     "district": "Meram",
     "address": "Sahibiata Mah., Mimar Muzaffer Caddesi No: 18, 42040 Meram, Konya",
     "phones": [
      "0332 353 62 26"
     ],
     "email": "konya.katolik.k@gmail.com",
     "website": "",
     "mass": [
      [
       "Pazar",
       "14:00 Türkçe"
      ]
     ],
     "massNote": "Saatler İzmir Katolik Başepiskoposluğu’nun sitesinden alınmıştır. Hac grupları için ayin önceden ayarlanabilir.",
     "visits": "Önceden haber vererek ziyaret edilebilir.",
     "history": [
      "Aziz Pavlus, misyon yolculuklarında Konya’ya (antik İkonion) birkaç kez uğradı (Elçilerin İşleri 14). Kentteki bugünkü Katolik kilisesi ona adanmıştır. Asumsiyonist rahipler, İzmir Başepiskoposu André Polycarpe Timoni ile 20 Ağustos 1892’de yaptıkları anlaşmanın ardından aynı yılın Aralık ayında Konya’ya yerleşti; şehrin Rum ve Ermeni mahalleleri arasında kardeş Agapit Didier ile bir misyon evi kurdular ve bir okul açtılar. Haziran 1894’te Oblat rahibeler de geldi.",
      "1899’da rahiplerin okulunda 70, rahibelerinkinde 40 öğrenci vardı. 1903’te Barones de Gargan’ın 10.000 franklık bağışıyla küçük bir arsa ve ev satın alındı. Kilisenin inşasına izin veren ferman yedi yıl süren işlemlerden sonra Temmuz 1909’da geldi; kilise 11 Aralık 1910’da kutsandı.",
      "1915–1919 arasında papaz Peder Antoine Herbier, Ankara’dan sürülen 2000’den fazla Katoliği ve farklı mezheplerden bir düzine rahibi burada karşıladı. 1922’de Hristiyanların göçüyle Rum ve Ermeni din adamları bölgeden ayrıldı ve Aziz Pavlus Kilisesi yalnız kaldı; okul 1926’da kapandı.",
      "8 Mart 1995’te, Trento yakınlarında kurulan Dirilmiş İsa Kardeşliği’nden iki İtalyan rahibe, Aziz Pavlus’un izinden giden hacılara hizmet etmek için Konya’ya geldi ve 16 Ocak 2022’ye kadar kaldı. Kiliseye bugün Adanmış Bakireler Düzeni’nden (Ordo Virginum) Maria Grazia Zambon hizmet vermektedir."
     ],
     "sources": [
      [
       "İzmir Katolik Başepiskoposluğu: Aziz Pavlus Katolik Kilisesi",
       "https://izmirkatolikkilisesi.com/konya/"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": "",
     "side": ""
    }
   ]
  },
  {
   "id": "antalya",
   "name": "Antalya",
   "lat": 36.89,
   "lon": 30.71,
   "label": [
    0,
    21,
    "middle"
   ],
   "open": "r",
   "churches": [
    {
     "id": "st-nikolaus-antalya",
     "short": "St. Nikolaus",
     "name": "St. Nikolaus Kilisesi",
     "rite": "latin",
     "district": "Muratpaşa",
     "address": "Haşim İşcan Mah., 1295 Sokak No: 27-29, 07100 Muratpaşa, Antalya",
     "phones": [
      "0242 999 27 42",
      "0535 063 37 10"
     ],
     "email": "kircheantalya@gmail.com",
     "website": "https://kircheantalya.blogspot.com",
     "mass": [
      [
       "Pazar",
       "11:00 Almanca · 18:00 İngilizce"
      ],
      [
       "Perşembe",
       "11:00 Almanca"
      ]
     ],
     "massNote": "Bazı pazar sabahları 11:00’de ekümenik ya da Protestan ayini yapılır ve bazı perşembeler ayin olmaz; her ayın programı kilisenin sitesinde (Gottesdienste) yayımlanır. Alanya’daki Almanca ayinler için kircheinalanya.blogspot.com adresine bakın.",
     "visits": "Kilise herkese açıktır; ayin saatleri dışında ziyaret için önceden haber verin.",
     "history": [
      "St. Nikolaus Kilisesi, Antalya’daki Almanca konuşan Katolik cemaatin kilisesidir. Türk Rivierası’nda yaklaşık 10.000 Alman sürekli yaşar; her yıl gelen milyonlarca turistin önemli bir kısmı da Aziz Pavlus’un izinden gitmek ve erken Hristiyanlığın mirasını görmek ister. Cemaat bu insanlar için kuruldu.",
      "Cemaat 2004’te Türk dernekler hukukuna göre “Aziz Nikolaus Kilisesi Derneği” olarak kuruldu ve resmen tanındı. Hildesheim piskoposluğundan Prelat Rainer Korten, çalışma izni alan ilk rahip oldu ve 2013’e kadar derneğin kurucu başkanı olarak görev yaptı. Dernek tüzüğü herkesin kiliseye kontrolsüz girebilmesini, dinî yayınları, hastanelerde ve cezaevlerinde Almanca konuşanları ziyareti güvence altına alır.",
      "Alman Piskoposlar Konferansı’nın mali desteğiyle kiralanan eski bir internet kafe kiliseye dönüştürüldü. Aynı binada iki cemaat salonu ve Almanca kitaplardan oluşan geniş bir kütüphane (Nikolas Bücherei) bulunur; duvarlarla çevrili güzel bahçe ayinlerden sonra buluşma yeridir. Kilise, Atatürk Caddesi’ne paralel sokakta, Hadriyanüs Kapısı’na beş dakikalık yürüme mesafesindedir. Bugünkü rahip Peder Ludger Paskert’tir."
     ],
     "sources": [
      [
       "St. Nikolaus Kirche Antalya",
       "https://kircheantalya.blogspot.com"
      ],
      [
       "St. Nikolaus Antalya: Kontakt",
       "https://kircheantalya.blogspot.com/p/kontakt.html"
      ],
      [
       "İzmir Katolik Başepiskoposluğu: Aziz Nikola Kilisesi",
       "https://izmirkatolikkilisesi.com/antalya/"
      ]
     ],
     "status": "active",
     "notice": "",
     "side": ""
    }
   ]
  },
  {
   "id": "mersin",
   "name": "Mersin",
   "lat": 36.8,
   "lon": 34.63,
   "label": [
    -11,
    12,
    "end"
   ],
   "open": "r",
   "churches": [
    {
     "id": "aziz-antuan-mersin",
     "short": "Aziz Antuan",
     "name": "Aziz Antuan Latin Katolik Kilisesi",
     "rite": "latin",
     "district": "Akdeniz",
     "address": "Uray Caddesi No: 12, 33060 Akdeniz, Mersin",
     "phones": [],
     "email": "",
     "website": "",
     "mass": [
      [
       "Pazar",
       "11:00 Türkçe"
      ],
      [
       "Pazartesi–Cumartesi",
       "18:00 Türkçe"
      ]
     ],
     "massNote": "",
     "visits": "Önceden randevu alarak gün içinde ziyaret edilebilir.",
     "history": [
      "Mersin’in Latin Katolik kilisesi, kentin 19. yüzyılda bir liman şehri olarak hızla büyüdüğü dönemin eseridir. 1840’taki olaylardan sonra Lübnan’dan gelen Maruni Katolik aileler Mersin’e yerleşmişti. Kilise yapma kararı 1853’te alındı; Mayıs 1854’te Kapuçin rahip Antonio Mersin’e yerleşti ve Sultan Abdülmecid’in 18 Eylül 1855 tarihli fermanıyla kilise inşa edildi.",
      "Kilisenin yanında Kapuçinlerin bir manastır okulu da vardı ve 1898’de tamamlandı. Okula 1923’te el konuldu ve 1944’te Mersin Üçocak İlkokulu’na dönüştürüldü. Kilise, Padovalı Aziz Antuan’a adanmıştır ve bugün de Kapuçin rahipler tarafından yönetilmektedir."
     ],
     "sources": [
      [
       "Vikipedi: Sent Antuan Latin Katolik Kilisesi (Mersin)",
       "https://tr.wikipedia.org/wiki/Sent_Antuan_Latin_Katolik_Kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": "",
     "side": ""
    }
   ]
  },
  {
   "id": "adana",
   "name": "Adana",
   "lat": 37.0,
   "lon": 35.32,
   "label": [
    11,
    -2,
    "start"
   ],
   "open": "r",
   "churches": [
    {
     "id": "bebekli-kilise-adana",
     "short": "Aziz Pavlus (Bebekli Kilise)",
     "name": "Aziz Pavlus Kilisesi (Bebekli Kilise)",
     "rite": "latin",
     "district": "Tepebağ, Seyhan",
     "address": "Tepebağ Mah., 27046 Sokak No: 31, Seyhan, Adana",
     "phones": [
      "0545 495 19 18"
     ],
     "email": "",
     "website": "",
     "mass": [
      [
       "Pazar",
       "11:00 Türkçe"
      ]
     ],
     "massNote": "",
     "visits": "Pazartesi, çarşamba ve cumartesi günleri ziyaret edilebilir.",
     "history": [
      "Adana’nın eski Tepebağ mahallesindeki bu kilise, halk arasında “Bebekli Kilise” olarak bilinir. Adı, kulenin tepesindeki yaklaşık 2,5 metre yüksekliğindeki bronz Meryem Ana heykelinden gelir; heykel uzaktan bir bebeği andırdığı için kiliseye bu ad verilmiştir.",
      "1880’lerde İtalyan Katolikler tarafından Aziz Pavlus adına yaptırılan kilise, Tarsuslu Aziz Pavlus’un doğduğu topraklara yakınlığıyla da anlamlıdır. Kilise bugün Anadolu Havarisel Vekilliği’ne bağlıdır ve pazar günleri Türkçe ayinle cemaate hizmet verir."
     ],
     "sources": [
      [
       "Kültür Portalı: Bebekli Kilise",
       "https://www.kulturportali.gov.tr/turkiye/adana/gezilecekyer/bebekli-kilise"
      ],
      [
       "Wikipedia: Saint Paul Church, Adana",
       "https://en.wikipedia.org/wiki/Saint_Paul_Church,_Adana"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": "",
     "side": ""
    }
   ]
  },
  {
   "id": "hatay",
   "name": "Hatay",
   "lat": 36.4,
   "lon": 36.17,
   "label": [
    11,
    12,
    "start"
   ],
   "open": "r",
   "churches": [
    {
     "id": "antakya-petrus-pavlus",
     "short": "Petrus ve Pavlus (Antakya)",
     "name": "Aziz Petrus ve Pavlus Katolik Kilisesi",
     "rite": "latin",
     "district": "Antakya",
     "address": "Kurtuluş Caddesi, Ataman Demir Sokak No: 6, Antakya, Hatay",
     "phones": [
      "0326 215 67 03"
     ],
     "email": "",
     "website": "http://www.anadolukatolikkilisesi.org/antakya/",
     "status": "closed",
     "notice": "Kilise 6 Şubat 2023 depremlerinde hasar gördü ve tescilli bir kültür varlığı olarak devletin restorasyon programına alındı. Depremden önceki ayin programı şu anda geçerli değildir; cemaatin bugün nerede toplandığını öğrenmek için Anadolu Havarisel Vekilliği’ne danışın.",
     "mass": [
      [
       "Deprem öncesi program",
       "Pazartesi–cumartesi 08:30 · pazar 17:00 (Ekim–Nisan) / 18:00 (Mayıs–Eylül), Türkçe"
      ]
     ],
     "massNote": "Bu saatler depremden önceki programdır.",
     "visits": "Restorasyon sürdüğü için ziyarete kapalı olabilir.",
     "history": [
      "Antakya, Hristiyan tarihinin en önemli şehirlerinden biridir: Elçilerin İşleri’ne göre İsa’nın izleyicilerine ilk kez burada “Hristiyan” denildi (Elçilerin İşleri 11,26). Gelenek, Aziz Petrus’u Antakya Kilisesi’nin ilk önderi olarak kabul eder; şehrin dışındaki Aziz Petrus Mağara Kilisesi, ilk Hristiyanların toplandığı yer olarak saygı görür.",
      "Yaklaşık 600 yıllık bir aradan sonra, Papa IX. Pius’un isteğiyle Kapuçin rahipleri 1846’da Antakya’ya yerleşti; ilk gelen rahip Parma bölgesinden Peder Basilio Galli oldu. 1852’de Sultan Abdülmecid’den alınan izinle bir manastır yapıldı. 1939’da cemaat şehrin yeni bir mahallesine taşınmak zorunda kaldı ve bir süre eski bir şeker fabrikasında toplandı.",
      "Bugünkü kilise ve manastır, eski Antakya’nın tarihî Yahudi mahallesinde bulunan ve mimar Vilyam Azaroğlu’nun doğduğu yaklaşık 150 yıllık bir ev ile bitişiğindeki evin satın alınıp 1989–1991’de restore edilmesiyle oluştu; 1995’te bir misafirhane eklendi. Havuzlu bir avlunun çevresinde şekillenen yapı, geleneksel Antakya evlerinin özelliklerini taşır. Sarımiye Camii ve Antakya Sinagogu ile birlikte oluşturduğu “ekümenik üçgen”, ezan, çan ve hazan seslerinin bir arada duyulduğu bir hoşgörü simgesi olarak anılır."
     ],
     "sources": [
      [
       "KÜRE Ansiklopedi: Antakya Katolik Kilisesi",
       "https://kureansiklopedi.com/tr/detay/antakya-katolik-kilisesi-b62be"
      ],
      [
       "Antakya Katolik Kilisesi (eski resmi site)",
       "http://www.anadolukatolikkilisesi.org/antakya/en/"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "side": ""
    },
    {
     "id": "iskenderun-mujde",
     "short": "Müjde Katedrali (İskenderun)",
     "name": "Müjde Katedrali (İskenderun Latin Katolik Kilisesi)",
     "rite": "latin",
     "district": "İskenderun",
     "address": "Yenişehir Mah., Mithat Paşa Caddesi No: 5, İskenderun, Hatay",
     "phones": [],
     "email": "",
     "website": "",
     "status": "closed",
     "notice": "Katedral 6 Şubat 2023 depremlerinde ağır hasar gördü; büyük bölümü yıkıldı. Restorasyonu için kaynak aranmaktadır ve yapı şu anda ibadete kapalıdır.",
     "mass": [
      [
       "Deprem öncesi program",
       "Pazar 11:30"
      ]
     ],
     "massNote": "Bu saat depremden önceki programdır.",
     "visits": "Kapalı.",
     "history": [
      "Meryem Ana’nın Müjdesi’ne adanan İskenderun Katedrali, Anadolu Havarisel Vekilliği’nin katedralidir. 16. yüzyılda İspanya’da kurulan Yalınayak Karmelit tarikatının rahipleri 1858’de İskenderun’a geldi ve yeni bir kilisenin inşasına başladı.",
      "Kilise bir yangından sonra 1888–1901 yıllarında yenilenerek yeniden hizmete girdi. Toskanalı Peder Paolo Pergantino 1871’den itibaren kırk yıl boyunca burada görev yaptı; zamanla rahiplerin kalması için kiliseye bir manastır eklendi.",
      "6 Şubat 2023 depremlerinde katedralin büyük kısmı çöktü. Vekilliğin episkoposu Luigi Padovese 2010’da İskenderun’da öldürülmüştü; bugün vekilliği Cizvit piskopos Antuan İlgit yönetmektedir."
     ],
     "sources": [
      [
       "Vikipedi: İskenderun Latin Katolik Kilisesi",
       "https://tr.wikipedia.org/wiki/%C4%B0skenderun_Latin_Katolik_Kilisesi"
      ],
      [
       "Agos: İskenderun Kilisesi’nin restorasyonu için kaynak aranıyor",
       "https://www.agos.com.tr/tr/haber/iskenderun-kilisesinin-restorasyonu-icin-kaynak-araniyor-38953"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "side": ""
    }
   ]
  },
  {
   "id": "samsun",
   "name": "Samsun",
   "lat": 41.29,
   "lon": 36.33,
   "label": [
    0,
    -13,
    "middle"
   ],
   "open": "r",
   "churches": [
    {
     "id": "mater-dolorosa-samsun",
     "short": "Mater Dolorosa",
     "name": "Mater Dolorosa Katolik Kilisesi (Acı Çeken Meryem Ana)",
     "rite": "latin",
     "district": "İlkadım",
     "address": "Ulugazi Mah., 614. Sokak No: 2, 55030 İlkadım, Samsun",
     "phones": [],
     "email": "mdolorosasamsun@gmail.com",
     "website": "https://www.materdolorosakatolikkilisesi.org",
     "mass": [
      [
       "Pazar",
       "12:00"
      ],
      [
       "Cumartesi",
       "07:30"
      ],
      [
       "Pazartesi, salı, çarşamba, cuma",
       "18:00 (pazartesi, çarşamba ve cuma ayinden önce tespih)"
      ],
      [
       "Perşembe",
       "17:00 Efkaristiya’ya Tapınma, ardından ayin"
      ]
     ],
     "massNote": "Noel, Yılbaşı ve Paskalya programı için kiliseye e-postayla yazabilirsiniz.",
     "visits": "Pazartesi, salı, çarşamba ve cuma 15:30–17:30; perşembe 15:30–16:30. Cumartesi ve pazar ziyarete kapalıdır.",
     "history": [
      "1845’te Gürcistan’ı terk etmek zorunda kalan sekiz İtalyan Kapuçin rahip, Karadeniz’den geçerken kilisesi olmayan Latin Katoliklerle karşılaştı; Samsun’un yanı sıra Trabzon ve Giresun’da da böyle topluluklar vardı. 1851’de Fransız Marist rahipler bir okul açtı; İtalyan bir hanımın bağışladığı arazide ahşap bir kilise ve ev yapıldı. O yıllarda Samsun nüfusunun yaklaşık yüzde 30’u Hristiyandı.",
      "1876’da Sultan V. Murad yeni bir kilise için özel izin verdi ve 8 × 12 metrelik küçük bir kilisenin yapımına başlandı; iki yıl sonra tapusu da gönderildi. Kilise tamamlandıktan sonra 1885’te yanına bir manastır, kiralık daireler ve bir mezarlık yapıldı; duvarlar fresklerle süslendi. 1913’te binaya el konuldu ve rahipler çatısı akan iki odaya sıkıştırıldı. 1976’da belediye başkanı kilisenin yıkılıp yerine park yapılmasını istedi; papalık elçiliği ile İtalyan konsolosluğunun girişimleriyle kilise kurtuldu.",
      "1998’de Anadolu’daki Katolik kiliselerinden sorumlu Peder Ruggero Franceschini’nin önderliğinde kapsamlı bir restorasyon yapıldı. 2006’da kilisenin rahibi Peder Pierre Brunissen bıçaklı saldırıya uğradı. Kilise birkaç yıl kapalı kaldıktan sonra 2017’de Arjantinli Fransiskenlerle yeniden açıldı ve özellikle bölgedeki Katolik göçmenlere hizmet verdi.",
      "Kilise 2023 sonunda, Anadolu Havarisel Vekilliği’nin daveti üzerine Marist rahipler (Society of Mary) ve Marist Misyoner Rahibeler (SMSM) tarafından kurulan “Omnes Gentes” topluluğuyla yeniden açıldı. Dünyanın dört bir yanından gelen üyelerden oluşan cemaat bugün düzenli ayinleriyle canlı bir topluluktur."
     ],
     "sources": [
      [
       "Mater Dolorosa Katolik Kilisesi resmi sitesi",
       "https://www.materdolorosakatolikkilisesi.org"
      ],
      [
       "Mater Dolorosa: Tarih",
       "https://www.materdolorosakatolikkilisesi.org/history"
      ],
      [
       "Vikipedi: Mater Dolorosa Katolik Kilisesi",
       "https://tr.wikipedia.org/wiki/Mater_Dolorosa_Katolik_Kilisesi"
      ]
     ],
     "status": "active",
     "notice": "",
     "side": ""
    }
   ]
  },
  {
   "id": "trabzon",
   "name": "Trabzon",
   "lat": 41.0,
   "lon": 39.72,
   "label": [
    0,
    -13,
    "middle"
   ],
   "open": "l",
   "churches": [
    {
     "id": "santa-maria-trabzon",
     "short": "Santa Maria",
     "name": "Santa Maria Katolik Kilisesi",
     "rite": "latin",
     "district": "İskenderpaşa, Ortahisar",
     "address": "İskenderpaşa Mah., Sümer Sokak No: 24-26, 61100 Ortahisar, Trabzon",
     "phones": [
      "0462 321 21 92"
     ],
     "email": "info@trabzonkatolikkilisesi.com",
     "website": "https://www.trabzonkatolikkilisesi.com",
     "mass": [
      [
       "Pazar",
       "11:30"
      ]
     ],
     "massNote": "Güncel duyurular kilisenin sitesinde yayımlanır.",
     "visits": "Salı, çarşamba, perşembe, cuma ve cumartesi 15:30–17:30. Pazar ve pazartesi ziyarete kapalıdır.",
     "history": [
      "Meryem Ana’ya adanmış Santa Maria Kilisesi, Karadeniz’in çok kültürlü geçmişinden günümüze ulaşan önemli bir mirastır ve bugün Trabzon’da ibadete açık tek Katolik kilisesidir. Kilisenin yapımına, Rus yönetimindeki Tiflis’ten Karadeniz’e gelen ve aslen İtalya’nın Emilia bölgesinden olan Kapuçin rahipleri öncülük etti. Temeli 1869’da atılan kilise beş yılda tamamlandı ve 2 Şubat 1874’te bir törenle ibadete açıldı.",
      "Kapuçinlerin şehre gelirken yanlarında getirdikleri, Meryem Ana’yı yöresel kıyafetler içinde ve kucağında uyuyan Bebek İsa ile gösteren tablo, zamanla kilisenin ruhani kimliğiyle bütünleşti. Kendisine atfedilen mucizelerle bu tasvir bölgede “Santa Maria di Trebisonda” (Trabzonlu Meryem Ana) olarak anılmaya başlandı.",
      "Yeni-gotik üsluptaki yapının beden duvarları yığma taştan, iç bölme duvarları tuğladan örülmüştür. Dikdörtgen planlı, apsissiz ve üç nefli kilisenin üzeri uzun bir beşik tonozla örtülüdür; payelerle taşınan kemerli nefler oldukça yüksek tutulmuştur. Batı cephesi simetrik pencereleri ve üçgen alınlığıyla dikkat çeker.",
      "Kilisenin rahibi Don Andrea Santoro, 5 Şubat 2006’da kilisede dua ederken öldürüldü. 1945’te İtalya’nın Priverno kasabasında doğan Santoro, Roma’da papaz olarak yıllarca çalıştıktan sonra 2000’de kendi isteğiyle Türkiye’ye gelmiş, önce Şanlıurfa-Harran’da, sonra Trabzon’da görev yapmıştı. Kilise, bugün Anadolu Havarisel Vekilliği’ne bağlıdır."
     ],
     "sources": [
      [
       "Trabzon Santa Maria Katolik Kilisesi resmi sitesi",
       "https://www.trabzonkatolikkilisesi.com"
      ],
      [
       "Vikipedi: Santa Maria Katolik Kilisesi (Trabzon)",
       "https://tr.wikipedia.org/wiki/Santa_Maria_Katolik_Kilisesi_(Trabzon)"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "status": "active",
     "notice": "",
     "side": ""
    }
   ]
  },
  {
   "id": "diyarbakir",
   "name": "Diyarbakır",
   "lat": 37.91,
   "lon": 40.24,
   "label": [
    0,
    -13,
    "middle"
   ],
   "open": "l",
   "churches": [
    {
     "id": "mar-petyun-diyarbakir",
     "short": "Mar Petyun (Keldani)",
     "name": "Mar Petyun Keldani Katolik Kilisesi",
     "rite": "keldani",
     "district": "Sur",
     "address": "Sur, Diyarbakır (Dört Ayaklı Minare’nin karşısı, Surp Giragos Kilisesi’nin bitişiği)",
     "phones": [
      "0412 224 65 05"
     ],
     "email": "",
     "website": "",
     "status": "limited",
     "notice": "Kilise 2015–2016 çatışmalarında hasar gördü, devlet tarafından restore edildi ve 14 Ekim 2023’te düzenlenen ayinle yeniden açıldı. Cemaat küçüktür ve ayinler düzenli değildir; ziyaret ve ayin için önceden kiliseyi arayın.",
     "mass": [
      [
       "Ayin",
       "Düzenli bir program yok; ayinler zaman zaman, gelen din görevlileri tarafından yapılır."
      ]
     ],
     "massNote": "",
     "visits": "Diyarbakır Valiliği’nin kültür envanterine göre her gün 09:00–17:30 arası ziyarete açıktır; gitmeden önce teyit edin.",
     "history": [
      "Mar Petyun (Aziz Petyun), Diyarbakır’ın tarihî Sur ilçesinde, dört ayaklı minaresiyle tanınan Şeyh Mutahhar Camii’nin karşısında ve Surp Giragos Ermeni Kilisesi’nin hemen bitişiğindedir. Gelenek, bu yerde ilk ibadetin 498 yılında yapıldığını söyler; kilise tarih boyunca defalarca yıkılıp yeniden yapılmıştır. Bugünkü yapı 17. yüzyıla tarihlenir ve Diyarbakır’ın karakteristik siyah bazalt taşıyla inşa edilmiştir.",
      "Kilise, 1681’de Diyarbakır’da kurulan Keldani Katolik patrikliğiyle birlikte Roma ile birliğe giren Keldani topluluğunun merkezlerinden biri oldu. Bir zamanlar kalabalık olan cemaat, ailelerin büyük şehirlere ve Avrupa’ya göç etmesiyle küçüldü; bugün Diyarbakır’da 25–30 kişilik bir Keldani topluluk yaşar. 1988’den beri Diyarbakır Keldani Katolik Kilisesi Vakfı’nın başkanı olan Yusuf Karadayı, kilisede doğmuş ve ömrünü ona hizmete adamıştır.",
      "Kilise 2010–2013 yıllarında vakıf tarafından restore edildi, ancak 2015–2016’daki çatışmalarda yeniden hasar gördü. 2019’da başlayan ve Vakıflar Genel Müdürlüğü’nün denetiminde yürütülen restorasyon 2023’te tamamlandı. 14 Ekim 2023’teki açılış ayinini Türkiye Keldani Katolik Patrik Vekili Fransua Yakan ile Papa Fransuva’nın Haziran 2023’te Diyarbakır Keldani Kilisesi’ne başepiskopos olarak atadığı Uludereli Sabri Anar birlikte yönetti."
     ],
     "sources": [
      [
       "AA: Mar Petyun Keldani Kilisesi düzenlenen ayinle açıldı",
       "https://www.aa.com.tr/tr/gundem/pkkli-teroristlerce-tahrip-edilen-mar-patyun-keldani-kilisesi-duzenlenen-ayinle-acildi/3020115"
      ],
      [
       "Tigris Haber: Keldani kilisesinde 7 yıldan sonra ilk ayin",
       "https://www.tigrishaber.com/keldani-kilisesinde-7-yildan-sonra-ilk-ayin-88707h.htm"
      ],
      [
       "Vikipedi: Mar Petyun Keldani Kilisesi",
       "https://tr.wikipedia.org/wiki/Mar_Petyun_Keldani_Kilisesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "side": ""
    },
    {
     "id": "surp-hovsep-diyarbakir",
     "short": "Surp Hovsep (Ermeni Katolik)",
     "name": "Surp Hovsep Ermeni Katolik Kilisesi",
     "rite": "ermeni",
     "district": "Sur",
     "address": "Sur, Diyarbakır",
     "phones": [],
     "email": "",
     "website": "",
     "status": "limited",
     "notice": "Kilise düzenli bir ibadethane olarak kullanılmamaktadır. Restorasyonun ardından 2021 sonunda 10 yıllığına Dicle Üniversitesi’ne kültür ve sanat merkezi olarak tahsis edildi; Ermeni Katolik cemaati talep ettiğinde ayin yapma hakkını korumaktadır.",
     "mass": [
      [
       "Ayin",
       "Düzenli ayin yok; cemaatin talebiyle özel günlerde yapılabilir."
      ]
     ],
     "massNote": "",
     "visits": "Dicle Üniversitesi Kültür, Sanat, Uygulama ve Araştırma Merkezi olarak kullanıldığı için ziyaret saatlerini üniversiteden öğrenin.",
     "history": [
      "Hz. Meryem’in eşi Aziz Yusuf’a adanan Surp Hovsep, Diyarbakır’ın Sur ilçesindeki tarihî Ermeni Katolik kilisesidir. 16. yüzyılda inşa edildiği bilinen kilise, Ermeni Katolik Kilisesi’nin 18. yüzyılda Roma ile tam birliğe girmesinin ardından bölgedeki Katolik Ermeni cemaatinin ibadet merkezi oldu.",
      "Kadınlar mahfili bulunan ve düz bir damla örtülü kilisede Ermenice yazıtlar ile din görevlilerine ait mezar taşları vardır; yapının lojmanları ve bir avlusu bulunur. 20. yüzyılın ortalarından itibaren cemaat başka şehirlere ve yurt dışına göç edince kilise cemaatsiz kaldı.",
      "2015–2016’daki Sur çatışmalarında en ağır hasar gören kiliselerden biri oldu. Vakıflar Genel Müdürlüğü’nün yürüttüğü restorasyon 2021’in başında tamamlandı. Aralık 2021’de Türkiye Ermeni Katolikleri Başepiskoposu Levon Zekiyan kiliseyi kutsadı ve burada yaklaşık 100 yıl sonra ilk ayin kutlandı. Aynı dönemde kilise, mimari özelliklerinin korunması ve cemaatin ayin hakkının saklı kalması şartıyla 10 yıllığına Dicle Üniversitesi’ne tahsis edildi."
     ],
     "sources": [
      [
       "Rudaw: Diyarbakır’da restore edilen kilise Dicle Üniversitesi’ne verildi",
       "https://www.rudaw.net/turkish/kurdistan/061220212"
      ],
      [
       "Agos: Diyarbakır Surp Hovsep Kilisesi’nde ayin",
       "https://www.agos.com.tr/tr/yazi/26489/diyarbakir-surp-hovsep-kilisesi-nde-ayin"
      ],
      [
       "Vikipedi: Ermeni Katolik Kilisesi (Diyarbakır)",
       "https://tr.wikipedia.org/wiki/Ermeni_Katolik_Kilisesi_(Diyarbak%C4%B1r)"
      ]
     ],
     "side": ""
    }
   ]
  },
  {
   "id": "mardin",
   "name": "Mardin",
   "lat": 37.31,
   "lon": 40.74,
   "label": [
    0,
    21,
    "middle"
   ],
   "open": "l",
   "churches": [
    {
     "id": "meryem-ana-mardin",
     "short": "Meryem Ana Katedrali",
     "name": "Meryem Ana Süryani Katolik Katedrali",
     "rite": "suryani",
     "district": "Artuklu",
     "address": "Şar Mah., 227 Çavırlı Sokak No: 3 (Cumhuriyet Meydanı), Artuklu, Mardin",
     "phones": [],
     "email": "",
     "website": "https://presencet.com.tr",
     "status": "limited",
     "notice": "Ayin saatleri yayımlanmamıştır; cemaat küçüktür. Ayin için önceden kiliseye ya da İstanbul’daki Süryani Katolik Patrik Vekilliği’ne danışın.",
     "mass": [
      [
       "Ayin",
       "Kiliseye danışın."
      ]
     ],
     "massNote": "",
     "visits": "Kilise genellikle gün içinde ziyarete açıktır; bitişiğindeki eski patrikhane binası Mardin Müzesi’dir.",
     "history": [
      "Mardin’in Cumhuriyet Meydanı’ndaki Meryem Ana Katedrali, Süryani Katolik Kilisesi’nin tarihî merkezidir. Süryani Katolikler, 18. yüzyılda Mardin’de yapılan bir patrik seçimi sırasında kadim Süryani Kilisesi’nden ayrılarak Roma ile birliğe giren topluluktur.",
      "Katedral ve bitişiğindeki patrikhane 1895’te inşa edildi; o dönem patriklik merkezi Mardin’deydi. Patriklik daha sonra Musul’a, Halep’e ve 1929’da Lübnan’daki Şarfe Manastırı’na taşındı. Patrikhane binası bir dönem askerî amaçlarla kullanıldı, 1988’de Kültür Bakanlığı’na devredildi ve restore edilerek 1995’ten beri Mardin Müzesi olarak hizmet veriyor.",
      "Kemerli, yuvarlak taş sütunlu kilisede, patriğin Roma’dan dönerken getirdiği tablolar bulunur; bunlardan birinin Rönesans ressamı Rafael’in okuluna ait olduğu düşünülür."
     ],
     "sources": [
      [
       "Présence: Mardin Süryani Katolik Kilisesi kutsal mekânlarımız",
       "https://presencet.com.tr/mardin-suryani-katolik-kilisesi-kutsal-mekanlarimiz/"
      ],
      [
       "Kültür Portalı: Meryem Ana Kilisesi ve Patrikhanesi",
       "https://www.kulturportali.gov.tr/turkiye/mardin/gezilecekyer/meryemana-kilisesi-ve-patrikhanesi"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "side": ""
    },
    {
     "id": "mor-efrem-mardin",
     "short": "Mor Efrem",
     "name": "Mor Efrem Süryani Katolik Kilisesi",
     "rite": "suryani",
     "district": "Artuklu",
     "address": "Çabuk Mah., 241 Erdes Sokak No: 58/1, Artuklu, Mardin",
     "phones": [],
     "email": "",
     "website": "https://presencet.com.tr",
     "status": "limited",
     "notice": "Ayin saatleri yayımlanmamıştır; ziyaret ve ayin için önceden bilgi alın.",
     "mass": [
      [
       "Ayin",
       "Kiliseye danışın."
      ]
     ],
     "massNote": "",
     "visits": "Önceden bilgi alarak ziyaret edin.",
     "history": [
      "Mor Efrem Kilisesi ve manastırı, Patrik Cercis Şelhet döneminde 1884’te inşa edildi ve dönemin metropoliti Mor Yakup Matay Ahmar-Dakno tarafından kutsandı. Kilise adını, 4. yüzyılda yaşamış büyük Süryani ilahiyatçı ve şair Suriyeli Aziz Efrem’den alır.",
      "Yapı 1922’den itibaren askerî hastane ve cezaevi, yakın zamanda da briket atölyesi ve depo olarak kullanıldı; bu kullanımlar sırasında yer yer çöktü. Mardin Süryani Katolik Vakfı’nın 2012–2022 arasında yürüttüğü restorasyonla yeniden ayağa kaldırılan kilise, Süryani Katolik Patriği III. Ignatius Yusuf Younan tarafından kutsanarak yeniden ibadete açıldı."
     ],
     "sources": [
      [
       "Présence: Mardin Süryani Katolik Kilisesi kutsal mekânlarımız",
       "https://presencet.com.tr/mardin-suryani-katolik-kilisesi-kutsal-mekanlarimiz/"
      ],
      [
       "Türkiye Katolik Ruhani Reisler Kurulu (CET), 2023 ayin saatleri listesi",
       "https://www.katolik-kilisesi.org/wp-content/uploads/2023/08/2023-TURKIYE-KATOLIK-KILISELERI-AYIN-SAATLERI.pdf"
      ]
     ],
     "side": ""
    }
   ]
  }
 ]
}/*JSON-END*/;
