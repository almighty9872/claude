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
          "address": "İstiklal Caddesi No. 325, 34433 Beyoğlu, İstanbul",
          "website": "https://www.sentantuan.com",
          "hours": "Pazar: 10:00 (İngilizce), 11:30 (İtalyanca), 19:00 (Türkçe). Hafta içi de günlük ayin vardır. Saatler değişebilir; sentantuan.com’dan teyit edin.",
          "hoursEn": "Sunday: 10:00am (English), 11:30am (Italian), 7:00pm (Turkish). Daily Mass on weekdays too. Times change; confirm at sentantuan.com." },
        { "id": "meryem-ana-draperis",
          "name": "Meryem Ana Draperis Kilisesi (Santa Maria Draperis)", "nameEn": "St. Mary Draperis Parish",
          "rite": "latin", "district": "Beyoğlu",
          "address": "İstiklal Caddesi No. 215, Beyoğlu, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/our-churches/istanbul/santa-maria-draperis-church-beyoglu/",
          "hours": "Hafta içi ve Cumartesi: 08:00 (İtalyanca/Türkçe). Pazar: 09:00 (İtalyanca), 10:00 (Korece), 11:15 (İngilizce; ayın 1., 2. ve 3. Pazarları İspanyolca). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Weekdays & Saturday: 8:00am (Italian/Turkish). Sunday: 9:00am (Italian), 10:00am (Korean), 11:15am (English; Spanish on the 1st–3rd Sunday). Times change; confirm with the parish." },
        { "id": "sent-esprit",
          "name": "Kutsal Ruh Katedrali (Sent Esprit)", "nameEn": "Cathedral of the Holy Spirit (St. Esprit)",
          "rite": "latin", "district": "Harbiye, Şişli",
          "address": "Cumhuriyet Caddesi No. 127A, 34373 Harbiye, Şişli, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/our-churches/istanbul/basilica-cathedral-of-the-holy-spirit-harbiye-st-esprit-cathedral/",
          "hours": "Pazar: 08:00 (Aramice/Arapça), 10:00 (İngilizce), 11:30 (Fransızca). Hafta içi: 18:00 (Fransızca). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Sunday: 8:00am (Aramaic/Arabic), 10:00am (English), 11:30am (French). Weekdays: 6:00pm (French). Times change; confirm with the parish.",
          "phone": "(0212) 248 09 10" },
        { "id": "meryem-ana-rosario",
          "name": "Meryem Ana Rosario Kilisesi", "nameEn": "Rosario Parish of the Virgin Mary",
          "rite": "latin", "district": "Bakırköy",
          "address": "Sakızağacı, Küçük Yalı Sokak, Meryem Ana Rosario Kilisesi D:22, 34142 Bakırköy, İstanbul",
          "website": "https://latinkatolikkilisesiistanbul.com/en/our-churches/istanbul/church-of-the-virgin-mary-rosario/",
          "hours": "Pazartesi, Çarşamba, Perşembe, Cuma: 18:30 (Türkçe). Saatler değişebilir; kiliseyle teyit edin.",
          "hoursEn": "Monday, Wednesday, Thursday, Friday: 6:30pm (Turkish). Times change; confirm with the parish." },
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
          "phone": "0312 311 01 18" }
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
