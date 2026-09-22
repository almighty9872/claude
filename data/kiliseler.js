/* =====================================================================
 * EN: A directory of active Catholic parishes/chapels in Turkey, across
 *     every Catholic rite present in the country (Latin, Armenian
 *     Catholic, Syriac Catholic, Chaldean Catholic). Compiled from each
 *     community's own published contact information (parish/vicariate
 *     websites, the Turkish Catholic Bishops' Conference's published
 *     Mass-time sheet, and municipal/heritage listings) rather than any
 *     single official master list, because none of the vicariates
 *     publish one jointly. It is not exhaustive — Turkey's Catholic
 *     communities are small and some chapels have no public web
 *     presence at all — and Mass times in particular change more often
 *     than this file is rebuilt. Anywhere the source material did not
 *     give a confident street-level address or a current schedule, the
 *     "hours" field says so plainly instead of guessing. "map" is a
 *     short, English-safe string (name + district + city) used to build
 *     an outbound Google Maps search link; it deliberately searches by
 *     the church's own name rather than a possibly-stale address,
 *     since these are all named, independently mappable landmarks.
 * TR: Türkiye'deki etkin Katolik kiliselerinin (Latin, Ermeni Katolik,
 *     Süryani Katolik, Keldani Katolik) bir dizini. Tek bir resmi kaynak
 *     olmadığı için her cemaatin kendi yayımladığı bilgilerden
 *     derlenmiştir; eksiksiz değildir ve özellikle ayin saatleri zamanla
 *     değişebilir. Düzenledikten sonra tools/build.ps1 çalıştırın.
 *     JSON-START / JSON-END işaretlerini silmeyin.
 * ===================================================================== */
window.CHURCHES = /*JSON-START*/{
  "title": "Kilise Bul",
  "en": "Find a Church",
  "intro": "Türkiye’de etkin olan Katolik kiliselerinin bir listesi — Latin, Ermeni Katolik, Süryani Katolik ve Keldani Katolik cemaatleri dahil. Liste, cemaatlerin kendi yayımladığı bilgilerden derlenmiştir; eksiksiz olmayabilir ve ayin saatleri değişebilir. Ziyaret etmeden önce mümkünse kiliseyle iletişime geçmenizi öneririz.",
  "note": "Bu liste internet üzerinden ulaşılabilen kaynaklardan derlenmiştir; resmi ve tam bir kilise sicili değildir. Bir bilgide hata gördüyseniz İletişim sayfasından bize bildirebilirsiniz.",
  "noteEn": "This list was compiled from publicly available sources; it is not an official or complete church registry. If you spot an error, you can let us know via the Contact page.",
  "cities": [
    {
      "id": "istanbul",
      "name": "İstanbul",
      "churches": [
        { "id": "sent-antuan",
          "name": "Sent Antuan Bazilikası", "nameEn": "St. Anthony of Padua Basilica",
          "rite": "latin", "district": "Beyoğlu",
          "address": "İstiklal Caddesi No. 325, Beyoğlu, İstanbul",
          "hours": "Ayin saatleri için kilisenin kendi sitesine bakın (sentantuan.com).",
          "hoursEn": "See the parish’s own site for current Mass times (sentantuan.com)." },
        { "id": "meryem-ana-draperis",
          "name": "Meryem Ana Draperis Kilisesi", "nameEn": "St. Mary Draperis Church",
          "rite": "latin", "district": "Beyoğlu",
          "address": "İstiklal Caddesi (merdivenli girişi ile), Beyoğlu, İstanbul",
          "hours": "Ayin saatleri için kiliseyle görüşün.",
          "hoursEn": "Contact the parish for current Mass times." },
        { "id": "sent-esprit",
          "name": "Kutsal Ruh Katedrali (Sent Esprit)", "nameEn": "Cathedral of the Holy Spirit (St. Esprit)",
          "rite": "latin", "district": "Harbiye, Şişli",
          "address": "Papa Roncalli Sokak 65A, İnönü Mah., Şişli, İstanbul",
          "hours": "İstanbul Latin Katolik Kilisesi Episkoposluğu’nun (latinkatolikkilisesiistanbul.com) katedralidir; ayin saatleri için siteye bakın.",
          "hoursEn": "Seat of the Latin Catholic Vicariate of Istanbul; see latinkatolikkilisesiistanbul.com for current Mass times.",
          "phone": "(0212) 248 07 75" },
        { "id": "meryem-ana-rosario",
          "name": "Meryem Ana Rosario Kilisesi", "nameEn": "Our Lady of the Rosary Church",
          "rite": "latin", "district": "Bakırköy",
          "address": "Bakırköy, İstanbul",
          "hours": "Ayin saatleri için kiliseyle görüşün.",
          "hoursEn": "Contact the parish for current Mass times." },
        { "id": "suryani-katolik-istanbul",
          "name": "Süryani Katolik Kilisesi", "nameEn": "Syriac Catholic Church",
          "rite": "suryani", "district": "Beyoğlu",
          "address": "Gümüşsuyu Mah., Ayazpaşa Sarayarkası Sokak No. 15, Beyoğlu, İstanbul",
          "hours": "Ayin saatleri için kiliseyle görüşün.",
          "hoursEn": "Contact the parish for current Mass times.",
          "phone": "(0212) 243 25 21" },
        { "id": "surp-yerrortutyun",
          "name": "Surp Yerrortutyun Ermeni Katolik Kilisesi", "nameEn": "Surp Yerrortutyun Armenian Catholic Church",
          "rite": "ermeni", "district": "Beyoğlu",
          "address": "İstiklal Caddesi, Perukar Çıkmazı (Odakule yanı), Beyoğlu, İstanbul",
          "hours": "Ayin saatleri için kiliseyle görüşün.",
          "hoursEn": "Contact the parish for current Mass times." },
        { "id": "keldani-istanbul",
          "name": "Keldani Katolik Kilisesi", "nameEn": "Chaldean Catholic Church",
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
          "address": "Şehit Nevres Bulvarı No. 29, Alsancak, 35210 İzmir",
          "hours": "Hafta içi: 17:30 Tespih Duası, 18:00 Kutsal Ayin (Türkçe). Cumartesi: 17:30 Tespih Duası. Pazar: 10:00 (İngilizce), 12:00 (Türkçe).",
          "hoursEn": "Weekdays: 5:30pm Rosary, 6:00pm Mass (Turkish). Saturday: 5:30pm Rosary. Sunday: 10:00am (English), 12:00pm (Turkish)." },
        { "id": "santa-maria-izmir",
          "name": "Santa Maria Katolik Kilisesi", "nameEn": "Santa Maria Catholic Church",
          "rite": "latin", "district": "Konak",
          "address": "Halit Ziya Bulvarı No. 67, Pasaport, Konak, İzmir",
          "hours": "Düzenli ayin yeri değildir; Salı, Çarşamba, Perşembe 09:00–17:00 arası ziyarete açıktır.",
          "hoursEn": "Not a regular Mass site; open for visits Tue–Thu, 9:00am–5:00pm." }
      ]
    },
    {
      "id": "ankara",
      "name": "Ankara",
      "churches": [
        { "id": "azize-tereza-ankara",
          "name": "Azize Tereza Kilisesi", "nameEn": "St. Teresa’s Church",
          "rite": "latin", "district": "Ulus, Altındağ",
          "address": "Kardeşler Sokak No. 15, 06250 Ulus, Ankara",
          "hours": "Çarşamba 18:00, Pazar 11:30. Salı ve Cumartesi 14:00–17:00 arası açık.",
          "hoursEn": "Wednesday 6:00pm, Sunday 11:30am. Open Tue & Sat, 2:00pm–5:00pm.",
          "phone": "0312 311 01 18" }
      ]
    },
    {
      "id": "mersin",
      "name": "Mersin",
      "churches": [
        { "id": "latin-mersin",
          "name": "Latin Katolik Kilisesi", "nameEn": "Latin Catholic Church",
          "rite": "latin", "district": "Mersin",
          "address": "Uray Caddesi No. 12, 33060 Mersin",
          "hours": "Ayin saatleri için kiliseyle görüşün.",
          "hoursEn": "Contact the parish for current Mass times." }
      ]
    },
    {
      "id": "adana",
      "name": "Adana",
      "churches": [
        { "id": "adana-kurtulus",
          "name": "Adana Katolik Kilisesi (Kurtuluş)", "nameEn": "Adana Catholic Church (Kurtuluş)",
          "rite": "latin", "district": "Tepebağ, Seyhan",
          "address": "Tepebağ Mah., 10. Sokak No. 13, Seyhan, Adana",
          "hours": "Pazar 11:00.",
          "hoursEn": "Sunday 11:00am." }
      ]
    },
    {
      "id": "antakya",
      "name": "Antakya (Hatay)",
      "churches": [
        { "id": "saints-pierre-paul-antakya",
          "name": "Saints Pierre et Paul Kilisesi", "nameEn": "Saints Peter and Paul Church",
          "rite": "latin", "district": "Antakya",
          "address": "Kurtuluş Caddesi, Ataman Demir Sokak No. 6, Antakya, Hatay",
          "hours": "Ayin saatleri için kiliseyle görüşün. (2023 depreminin ardından cemaat ve bina durumu değişmiş olabilir; ziyaretten önce teyit edin.)",
          "hoursEn": "Contact the parish for current Mass times. (The 2023 earthquakes may have affected the community or building; please confirm before visiting.)" }
      ]
    },
    {
      "id": "antalya",
      "name": "Antalya",
      "churches": [
        { "id": "st-nikolaus-antalya",
          "name": "St. Nikolaus Kilisesi", "nameEn": "St. Nicholas Church",
          "rite": "latin", "district": "Antalya",
          "address": "Haşim İşcan Mah., 1295 Sokak No. 27-29, Antalya",
          "hours": "Ayin saatleri için kiliseyle görüşün.",
          "hoursEn": "Contact the parish for current Mass times.",
          "phone": "(0242) 999 27 42" }
      ]
    },
    {
      "id": "diyarbakir",
      "name": "Diyarbakır",
      "churches": [
        { "id": "mar-petyun-diyarbakir",
          "name": "Mar Petyun Keldani Kilisesi", "nameEn": "Mar Petyun Chaldean Church",
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
          "name": "Meryem Ana Kilisesi (Süryani Katolik)", "nameEn": "Church of the Virgin Mary (Syriac Catholic)",
          "rite": "suryani", "district": "Mardin",
          "address": "Cumhuriyet Meydanı, Mardin",
          "hours": "Ayin saatleri için kiliseyle görüşün.",
          "hoursEn": "Contact the parish for current Mass times." }
      ]
    }
  ]
}/*JSON-END*/;
