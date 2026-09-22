/* =====================================================================
 * EN: A directory of active Catholic parishes/chapels in Turkey, across
 *     every Catholic rite present in the country (Latin, Armenian
 *     Catholic, Syriac Catholic, Chaldean Catholic). Compiled from each
 *     community's own published contact information (parish/vicariate
 *     websites, the Turkish Catholic Bishops' Conference's published
 *     Mass-time sheet, and municipal/heritage listings) rather than any
 *     single official master list, because none of the vicariates
 *     publish one jointly. It is not exhaustive: Turkey's Catholic
 *     communities are small and some chapels have no public web
 *     presence at all, and Mass times in particular change more often
 *     than this file is rebuilt. Anywhere the source material did not
 *     give a confident schedule, the "hours" field says so plainly
 *     instead of guessing; every entry still carries the "confirm with
 *     the parish" caveat even where a schedule is given. "website" is
 *     the parish's own site where one could be found; otherwise it is
 *     left out and the page falls back to a Google search for the
 *     parish's name. "map" is built at render time from the church's
 *     own name plus district and city, not from a possibly-imprecise
 *     address, since these are all named, independently mappable
 *     landmarks; a name search resolves reliably either way.
 * TR: Türkiye'deki etkin Katolik kiliselerinin (Latin, Ermeni Katolik,
 *     Süryani Katolik, Keldani Katolik) bir dizini. Tek bir resmi kaynak
 *     olmadığı için her cemaatin kendi yayımladığı bilgilerden
 *     derlenmiştir; eksiksiz değildir ve özellikle ayin saatleri zamanla
 *     değişebilir. Düzenledikten sonra tools/build.ps1 çalıştırın.
 *     JSON-START / JSON-END işaretlerini silmeyin.
 * ===================================================================== */
window.CHURCHES = /*JSON-START*/{
  "title": "Kilise Bul",
  "en": "Find a Parish",
  "intro": "Türkiye’de etkin olan Katolik kiliselerinin bir listesi: Latin, Ermeni Katolik, Süryani Katolik ve Keldani Katolik cemaatleri dahil. Liste, cemaatlerin kendi yayımladığı bilgilerden derlenmiştir; eksiksiz olmayabilir ve ayin saatleri değişebilir. Ziyaret etmeden önce mümkünse kiliseyle ya da resmi siteleriyle teyitleşmenizi öneririz.",
  "introEn": "A directory of active Catholic parishes in Turkey, across every rite present in the country. It is not exhaustive and Mass times can change, so please confirm with the parish or its own website before visiting.",
  "touristNote": "Türkiye’yi ziyaret eden Katolik turistler de bu sayfayı kullanabilir: aşağıdaki kiliselerin çoğu, yerel cemaatin yanında farklı dillerde ayine gelen ziyaretçileri de ağırlar; birçoğunda İngilizce ya da İtalyanca bir ayin de bulunur.",
  "touristNoteEn": "Catholic tourists visiting Turkey can use this page too: most of the parishes below welcome visitors alongside their local congregation, and many hold at least one Mass in English or Italian.",
  "note": "Bu liste internet üzerinden ulaşılabilen kaynaklardan derlenmiştir; resmi ve tam bir kilise sicili değildir. Bir bilgide hata gördüyseniz İletişim sayfasından bize bildirebilirsiniz.",
  "noteEn": "This list was compiled from publicly available sources; it is not an official or complete church registry. If you spot an error, you can let us know via the Contact page.",
  "rites": [
    { "id": "latin",   "tr": "Latin Katolik",   "en": "Latin Catholic" },
    { "id": "ermeni",  "tr": "Ermeni Katolik",  "en": "Armenian Catholic" },
    { "id": "suryani", "tr": "Süryani Katolik", "en": "Syriac Catholic" },
    { "id": "keldani", "tr": "Keldani Katolik", "en": "Chaldean Catholic" }
  ],
  "cities": [
    {
      "id": "istanbul",
      "name": "İstanbul",
      "churches": [
        { "id": "sent-antuan",
          "name": "Sent Antuan Bazilikası", "nameEn": "St. Anthony of Padua Basilica",
          "rite": "latin", "district": "Beyoğlu",
          "address": "İstiklal Caddesi No. 171/A, 34433 Beyoğlu, İstanbul",
          "website": "https://www.sentantuan.com",
          "hours": "Pazartesi: 08:00 (İngilizce). Salı–Cumartesi: 08:00 (İngilizce), 19:00 (Türkçe). Salı ayrıca: 11:30 (Türkçe). Pazar: 10:00 (İngilizce), 11:30 (Lehçe ve İtalyanca), 18:00 Ekim–Mart / 19:00 Nisan–Eylül (Türkçe). Saatler değişebilir; sentantuan.com’dan teyit edin.",
          "hoursEn": "Monday: 8:00am (English). Tuesday–Saturday: 8:00am (English), 7:00pm (Turkish). Tuesday also: 11:30am (Turkish). Sunday: 10:00am (English), 11:30am (Polish & Italian), 6:00pm Oct–Mar / 7:00pm Apr–Sep (Turkish). Times change; confirm at sentantuan.com." },
        { "id": "meryem-ana-draperis",
          "name": "Meryem Ana Draperis Kilisesi (Santa Maria Draperis)", "nameEn": "St. Mary Draperis Parish",
          "rite": "latin", "district": "Beyoğlu",
          "address": "İstiklal Caddesi No. 215, 34433 Beyoğlu, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/our-churches/istanbul/santa-maria-draperis-church-beyoglu/",
          "hours": "Hafta içi ve Cumartesi: 08:00 (İtalyanca/Türkçe). Pazar: 09:00 (İtalyanca), 10:00 (Korece), 11:15 (İngilizce; ayın 1., 2. ve 3. Pazarları ayrıca 18:30 İspanyolca). Ayın son Pazarı: 10:30 (İngilizce), İspanyolca ayin yoktur. Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Weekdays & Saturday: 8:00am (Italian/Turkish). Sunday: 9:00am (Italian), 10:00am (Korean), 11:15am (English; also 6:30pm Spanish on the 1st–3rd Sunday). Last Sunday of the month: 10:30am (English), no Spanish Mass that day. Times change; confirm with the parish." },
        { "id": "sent-esprit",
          "name": "Kutsal Ruh Katedrali (Sent Esprit)", "nameEn": "Cathedral of the Holy Spirit (St. Esprit)",
          "rite": "latin", "district": "Harbiye, Şişli",
          "address": "Cumhuriyet Caddesi No. 127A, 34373 Harbiye, Şişli, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/our-churches/istanbul/basilica-cathedral-of-the-holy-spirit-harbiye-st-esprit-cathedral/",
          "hours": "Hafta içi: 18:00 (Fransızca/İngilizce), 18:30 (Türkçe). Cumartesi: 18:00 (Türkçe). Pazar: 10:00 (İngilizce), 11:30 (Fransızca). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Weekdays: 6:00pm (French/English), 6:30pm (Turkish). Saturday: 6:00pm (Turkish). Sunday: 10:00am (English), 11:30am (French). Times change; confirm with the parish.",
          "phone": "(0212) 248 09 10" },
        { "id": "meryem-ana-rosario",
          "name": "Meryem Ana Rosario Kilisesi", "nameEn": "Rosario Parish of the Virgin Mary",
          "rite": "latin", "district": "Bakırköy",
          "address": "Sakızağacı, Küçük Yalı Sokak, Meryem Ana Rosario Kilisesi D:22, 34142 Bakırköy, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/our-churches/istanbul/church-of-the-virgin-mary-rosario/",
          "hours": "Pazartesi, Çarşamba, Perşembe, Cuma: 18:30 (Türkçe). Pazar: 11:00 (Türkçe). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Monday, Wednesday, Thursday, Friday: 6:30pm (Turkish). Sunday: 11:00am (Turkish). Times change; confirm with the parish." },
        { "id": "sen-piyer-galata",
          "name": "Sen Piyer Kilisesi (Galata)", "nameEn": "St. Peter and St. Paul Parish (Galata)",
          "rite": "latin", "district": "Galata, Beyoğlu",
          "address": "Kuledibi, Galata Kulesi Sokak No. 26, Beyoğlu, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/times-of-the-month/",
          "hours": "Hafta içi: 08:00 (Türkçe/İtalyanca). Cumartesi: 19:00 (Türkçe). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Weekdays: 8:00am (Turkish/Italian). Saturday: 7:00pm (Turkish). Times change; confirm with the parish." },
        { "id": "aziz-louis-istanbul",
          "name": "Aziz Louis Kilisesi", "nameEn": "Church of St. Louis",
          "rite": "latin", "district": "Beyoğlu",
          "address": "Nane Sokak No. 10, 34433 Beyoğlu, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/times-of-the-month/",
          "hours": "Pazar: 11:00 (Fransızca). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Sunday: 11:00am (French). Times change; confirm with the parish." },
        { "id": "meryem-ana-goge-alinisi-kadikoy",
          "name": "Meryem Ana’nın Göğe Alınışı Kilisesi (Notre Dame de l’Assomption)", "nameEn": "Church of the Assumption of the Virgin Mary (Notre Dame de l’Assomption)",
          "rite": "latin", "district": "Moda, Kadıköy",
          "address": "Moda Caddesi No. 5, 34710 Kadıköy, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/times-of-the-month/",
          "hours": "Hafta içi: 18:30 (Türkçe/Fransızca). Cumartesi: 18:30 (Türkçe). Pazar: 11:30 (Türkçe/Fransızca). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Weekdays: 6:30pm (Turkish/French). Saturday: 6:30pm (Turkish). Sunday: 11:30am (Turkish/French). Times change; confirm with the parish." },
        { "id": "aziz-stefanos-kadikoy",
          "name": "Aziz Stefanos Kilisesi", "nameEn": "Church of St. Stephen",
          "rite": "latin", "district": "Yeldeğirmeni, Kadıköy",
          "address": "Yeldeğirmeni Mah., Cumhuriyet Sokak No. 8, Kadıköy, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/times-of-the-month/",
          "hours": "Pazartesi–Cumartesi: 18:00 (Türkçe). Pazar: 10:30 (Türkçe). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Monday–Saturday: 6:00pm (Turkish). Sunday: 10:30am (Turkish). Times change; confirm with the parish." },
        { "id": "polonezkoy-czestochowa",
          "name": "Polonezköy Częstochowa Meryem Ana Kilisesi", "nameEn": "Polonezköy Church of Our Lady of Częstochowa",
          "rite": "latin", "district": "Polonezköy, Beykoz",
          "address": "Polonezköy, Beykoz Caddesi No. 20, 34820 Beykoz, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/times-of-the-month/",
          "hours": "Cumartesi: 18:00 (Ekim–Mart) / 19:00 (Nisan–Eylül) (Türkçe/Lehçe). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Saturday: 6:00pm (Oct–Mar) / 7:00pm (Apr–Sep) (Turkish/Polish). Times change; confirm with the parish." },
        { "id": "buyukdere-meryem-ana-dogusu",
          "name": "Büyükdere Meryem Ana’nın Doğuşu Kilisesi", "nameEn": "Büyükdere Church of the Nativity of the Virgin Mary",
          "rite": "latin", "district": "Büyükdere, Sarıyer",
          "address": "Azizler Sokak No. 1, 34453 Büyükdere, Sarıyer, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/times-of-the-month/",
          "hours": "Hafta içi: 19:00 (Türkçe/İngilizce). Pazar: 11:00 (Türkçe/İngilizce). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Weekdays: 7:00pm (Turkish/English). Sunday: 11:00am (Turkish/English). Times change; confirm with the parish." },
        { "id": "aziz-pavlus-nisantasi",
          "name": "Aziz Pavlus Kilisesi (Nişantaşı)", "nameEn": "St. Paul’s Church",
          "rite": "latin", "district": "Nişantaşı, Şişli",
          "address": "Büyük Çiftlik Sokak No. 22, 34365 Nişantaşı, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/times-of-the-month/",
          "hours": "Ayın 1. ve 3. Pazarı: 10:30 (Almanca). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "1st and 3rd Sunday of the month: 10:30am (German). Times change; confirm with the parish." },
        { "id": "aziz-augustinus-fenerbahce",
          "name": "Aziz Augustinus Kilisesi (Fenerbahçe)", "nameEn": "Church of St. Augustine",
          "rite": "latin", "district": "Fenerbahçe, Kadıköy",
          "address": "Atlıhan Sokak No. 1, 34726 Fenerbahçe, Kadıköy, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/times-of-the-month/",
          "hours": "Pazar: 10:00 (Türkçe/Fransızca). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Sunday: 10:00am (Turkish/French). Times change; confirm with the parish." },
        { "id": "aziz-pacifico-buyukada",
          "name": "Aziz Pacifico Kilisesi (Büyükada)", "nameEn": "Church of St. Pacifico",
          "rite": "latin", "district": "Büyükada, Adalar",
          "address": "Sakarya Caddesi No. 18, Büyükada-Nizam, 34970 Adalar, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/times-of-the-month/",
          "hours": "Salı: 11:00 (Türkçe). Cumartesi (yalnızca Haziran–Eylül): 11:00 (İtalyanca/Türkçe). Pazar: 11:00 (Türkçe). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Tuesday: 11:00am (Turkish). Saturday (June–September only): 11:00am (Italian/Turkish). Sunday: 11:00am (Turkish). Times change; confirm with the parish." },
        { "id": "bomonti-lourdes",
          "name": "Bomonti Lourdes Meryem Ana Kilisesi", "nameEn": "Bomonti Our Lady of Lourdes Church",
          "rite": "latin", "district": "Bomonti, Şişli",
          "address": "Bomonti, Şişli, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/times-of-the-month/",
          "hours": "Hafta içi ve Cumartesi: 08:00 (İngilizce). Pazar: 11:15 (Türkçe). Kaynaktaki tam adres bilgisi tutarsızdı; kesin adres için kiliseyle görüşün. Saatler de değişebilir.",
          "hoursEn": "Weekdays & Saturday: 8:00am (English). Sunday: 11:15am (Turkish). The source listing's street address was inconsistent; confirm the exact address (and current times) with the parish." },
        { "id": "aziz-yorgi-kasimpasa",
          "name": "Aziz Yorgi Kilisesi (Kasımpaşa)", "nameEn": "Church of St. George",
          "rite": "latin", "district": "Kasımpaşa, Beyoğlu",
          "address": "Kaptan Çınar Sokak No. 2, 34420 Kasımpaşa, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/times-of-the-month/",
          "hours": "Salı: 18:30 (Almanca). Pazar: 10:00 (Almanca), 18:30 (Türkçe). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Tuesday: 6:30pm (German). Sunday: 10:00am (German), 6:30pm (Turkish). Times change; confirm with the parish." },
        { "id": "kutsal-yurek-bebek",
          "name": "Kutsal Yürek Kilisesi (Bebek)", "nameEn": "Church of the Sacred Heart",
          "rite": "latin", "district": "Bebek, Beşiktaş",
          "address": "Yoğurtçu Zülfü Sokak, 34342 Bebek, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/times-of-the-month/",
          "hours": "Cumartesi: 18:00 (Türkçe). Pazar: 11:00 (çok dilli). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Saturday: 6:00pm (Turkish). Sunday: 11:00am (multilingual). Times change; confirm with the parish." },
        { "id": "meryem-ana-kadikoy-latin",
          "name": "Kadıköy Meryem Ana Latin Katolik Kilisesi", "nameEn": "Kadıköy Virgin Mary Latin Catholic Church",
          "rite": "latin", "district": "Kadıköy",
          "address": "Misbah Muayyeş Sokak No. 2, 34710 Kadıköy, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/times-of-the-month/",
          "hours": "Pazar, Salı ve Perşembe: 18:00 (Türkçe). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Sunday, Tuesday and Thursday: 6:00pm (Turkish). Times change; confirm with the parish." },
        { "id": "suryani-katolik-istanbul",
          "name": "Süryani Katolik Kilisesi", "nameEn": "Syriac Catholic Parish",
          "rite": "suryani", "district": "Beyoğlu",
          "address": "Gümüşsuyu Mah., Ayazpaşa Sarayarkası Sokak No. 15, Beyoğlu, İstanbul",
          "hours": "Ayin saatleri için kiliseyle görüşün.",
          "hoursEn": "Contact the parish for current Mass times.",
          "phone": "(0212) 243 25 21" },
        { "id": "surp-yerrortutyun",
          "name": "Surp Yerrortutyun Ermeni Katolik Kilisesi", "nameEn": "Surp Yerrortutyun Armenian Catholic Parish",
          "rite": "ermeni", "district": "Beyoğlu",
          "address": "Asmalımescit, İstiklal Caddesi No. 142, 34430 Beyoğlu, İstanbul",
          "hours": "Ayin saatleri için kiliseyle görüşün.",
          "hoursEn": "Contact the parish for current Mass times." },
        { "id": "keldani-istanbul",
          "name": "Keldani Katolik Kilisesi", "nameEn": "Chaldean Catholic Parish",
          "rite": "keldani", "district": "Beyoğlu",
          "address": "Beyoğlu, İstanbul",
          "hours": "Ayin saatleri için kiliseyle görüşün; İstanbul’daki Keldani cemaati küçüktür, önceden aramanız önerilir.",
          "hoursEn": "Contact the parish for current Mass times; Istanbul’s Chaldean community is small, so calling ahead is recommended." }
      ]
    },
    {
      "id": "izmir",
      "name": "İzmir",
      "churches": [
        { "id": "aziz-yuhanna-izmir",
          "name": "Aziz Yuhanna Katedral Bazilikası", "nameEn": "St. John’s Catholic Cathedral",
          "rite": "latin", "district": "Alsancak",
          "address": "Şehit Nevres Bulvarı No. 29, 35210 Alsancak, İzmir",
          "website": "https://izmirkatolikkilisesi.com/aziz-yuhanna-kilisesi/",
          "hours": "Hafta içi: 17:30 Tespih Duası, 18:00 Kutsal Ayin (Türkçe). Cumartesi: 17:30 Tespih Duası. Pazar: 10:00 (İngilizce), 12:00 (Türkçe). Saatler değişebilir; izmirkatolikkilisesi.com’dan teyit edin.",
          "hoursEn": "Weekdays: 5:30pm Rosary, 6:00pm Mass (Turkish). Saturday: 5:30pm Rosary. Sunday: 10:00am (English), 12:00pm (Turkish). Times change; confirm at izmirkatolikkilisesi.com." },
        { "id": "santa-maria-izmir",
          "name": "Santa Maria Katolik Kilisesi", "nameEn": "Santa Maria Catholic Parish",
          "rite": "latin", "district": "Konak",
          "address": "Halit Ziya Bulvarı No. 67, Pasaport, Konak, İzmir",
          "website": "https://izmirkatolikkilisesi.com/santa-maria/",
          "hours": "Düzenli ayin yeri değildir; Salı, Çarşamba, Perşembe 09:00–17:00 arası ziyarete açıktır.",
          "hoursEn": "Not a regular Mass site; open for visits Tue–Thu, 9:00am–5:00pm." }
      ]
    },
    {
      "id": "ankara",
      "name": "Ankara",
      "churches": [
        { "id": "azize-tereza-ankara",
          "name": "Azize Tereza Kilisesi", "nameEn": "St. Teresa’s Parish",
          "rite": "latin", "district": "Ulus, Altındağ",
          "address": "Kardeşler Sokak No. 15, 06250 Ulus, Ankara",
          "website": "https://www.ankarakatolik.com",
          "hours": "Çarşamba 18:00, Pazar 11:30 (Türkçe). Salı ve Cumartesi 14:00–17:00 arası açık. Saatler değişebilir; ankarakatolik.com’dan teyit edin.",
          "hoursEn": "Wednesday 6:00pm, Sunday 11:30am (Turkish). Open Tue & Sat, 2:00pm–5:00pm. Times change; confirm at ankarakatolik.com.",
          "phone": "0312 311 01 18" },
        { "id": "meryem-ana-ankara",
          "name": "Meryem Ana Kilisesi (Ankara)", "nameEn": "Mother Mary Church of Ankara",
          "rite": "latin", "district": "Çankaya",
          "address": "Birlik Mahallesi, 428. Cadde No. 35, Çankaya, Ankara",
          "website": "https://latinkatolikkilisesiistanbul.com/en/times-of-the-month/",
          "hours": "Salı–Cuma: 08:00 ve 12:00. Cumartesi: 18:00 (Fransızca). Pazar: 10:00 (İngilizce), 11:30 (İspanyolca). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Tuesday–Friday: 8:00am and 12:00pm. Saturday: 6:00pm (French). Sunday: 10:00am (English), 11:30am (Spanish). Times change; confirm with the parish." }
      ]
    },
    {
      "id": "bursa",
      "name": "Bursa",
      "churches": [
        { "id": "aziz-meryem-bursa",
          "name": "Aziz Meryem Kilisesi (Bursa)", "nameEn": "Church of St. Mary",
          "rite": "latin", "district": "Osmangazi",
          "address": "Hüsnüzade Mah., Hakim Sokak No. 3, 16230 Osmangazi, Bursa",
          "website": "https://latinkatolikkilisesiistanbul.com/en/times-of-the-month/",
          "hours": "Ayin saatleri için kiliseyle görüşün.",
          "hoursEn": "Contact the parish for current Mass times." }
      ]
    },
    {
      "id": "mersin",
      "name": "Mersin",
      "churches": [
        { "id": "latin-mersin",
          "name": "Aziz Antuan Latin Katolik Kilisesi (Eş-Katedral)", "nameEn": "Co-Cathedral of St. Anthony of Padua",
          "rite": "latin", "district": "Mersin",
          "address": "Uray Caddesi No. 12, 33060 Mersin",
          "hours": "Pazar 11:00 (Türkçe). Rehberli ziyaret için randevuyla haftanın her günü 09:00–17:00 arası. Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Sunday 11:00am (Turkish). Guided visits by appointment, daily 9:00am–5:00pm. Times change; confirm with the parish." }
      ]
    },
    {
      "id": "adana",
      "name": "Adana",
      "churches": [
        { "id": "adana-kurtulus",
          "name": "Adana Katolik Kilisesi (Kurtuluş)", "nameEn": "Adana Catholic Parish (Kurtuluş)",
          "rite": "latin", "district": "Tepebağ, Seyhan",
          "address": "Tepebağ Mah., 10. Sokak No. 31, Seyhan, Adana",
          "website": "http://www.anadolukatolikkilisesi.org/adana/tr/index.php",
          "hours": "Pazar 11:00 (Türkçe). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Sunday 11:00am (Turkish). Times change; confirm with the parish.",
          "phone": "0322 363 52 79" }
      ]
    },
    {
      "id": "antakya",
      "name": "Antakya (Hatay)",
      "churches": [
        { "id": "saints-pierre-paul-antakya",
          "name": "Saints Pierre et Paul Kilisesi", "nameEn": "Saints Peter and Paul Parish",
          "rite": "latin", "district": "Antakya",
          "address": "Kurtuluş Caddesi, Ataman Demir Sokak No. 6, Antakya, Hatay",
          "website": "http://www.anadolukatolikkilisesi.org/antakya/tr/lachiesa.asp",
          "hours": "Ayin saatleri için kiliseyle görüşün. (2023 depreminin ardından cemaat ve bina durumu değişmiş olabilir; ziyaretten önce mutlaka teyit edin.)",
          "hoursEn": "Contact the parish for current Mass times. (The 2023 earthquakes may have affected the community or building; please confirm before visiting.)" }
      ]
    },
    {
      "id": "antalya",
      "name": "Antalya",
      "churches": [
        { "id": "st-nikolaus-antalya",
          "name": "St. Nikolaus Kilisesi", "nameEn": "St. Nicholas Parish",
          "rite": "latin", "district": "Antalya",
          "address": "Haşim İşcan Mah., 1295 Sokak No. 27-29, Antalya",
          "website": "https://www.st-nikolaus-kirche-antalya.com",
          "hours": "Ayin saatleri için kilisenin kendi sitesine bakın.",
          "hoursEn": "See the parish’s own site for current Mass times.",
          "phone": "(0242) 999 27 42" }
      ]
    },
    {
      "id": "diyarbakir",
      "name": "Diyarbakır",
      "churches": [
        { "id": "mar-petyun-diyarbakir",
          "name": "Mar Petyun Keldani Kilisesi", "nameEn": "Mar Petyun Chaldean Parish",
          "rite": "keldani", "district": "Sur",
          "address": "Sur, Diyarbakır",
          "hours": "17. yüzyıldan kalma tarihi bir kilisedir; cemaati küçüktür (yaklaşık on aile). Ziyaretten önce mutlaka önceden görüşün.",
          "hoursEn": "A historic 17th-century church with a small congregation (around ten families). Contacting ahead before visiting is essential." }
      ]
    },
    {
      "id": "mardin",
      "name": "Mardin",
      "churches": [
        { "id": "meryem-ana-mardin",
          "name": "Meryem Ana Kilisesi (Süryani Katolik)", "nameEn": "Parish of the Virgin Mary (Syriac Catholic)",
          "rite": "suryani", "district": "Mardin",
          "address": "Cumhuriyet Meydanı, Mardin",
          "hours": "Hem ibadete hem ziyarete açıktır (bitişiğindeki eski patrikhane binası artık müzedir). Ayin saatleri için kiliseyle görüşün.",
          "hoursEn": "Open for both worship and visits (the adjoining former patriarchate building is now a museum). Contact the parish for current Mass times." }
      ]
    }
  ]
}/*JSON-END*/;
