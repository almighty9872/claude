/* =====================================================================
 * EN: The Order of Mass, adapted from a Turkish text published by
 *     Azize Tereza Kilisesi (Ankara Katolik Kilisesi, Istanbul-Ankara
 *     Latin Catholic Apostolic Vicariate), normalised to this site's
 *     terminology (Tanri -> Allah, Krallik -> Hukumdarlik where it
 *     means the Kingdom of God) per an explicit editorial decision.
 *     English column is the standard Roman Missal (2011 ICEL) text
 *     for fixed prayers (Confiteor, Gloria, Creed, Sanctus, Pater
 *     Noster, Agnus Dei) and a direct translation of the Turkish for
 *     variable/rubrical text, so the two columns match line by line.
 *     role: P = Rahip alone, C = Cemaat, PC = said together, N = rubric.
 * TR: Kutsal Ayin sirasi. Duzenledikten sonra tools/build.ps1
 *     calistirin. JSON-START / JSON-END isaretlerini silmeyin.
 * ===================================================================== */
window.MASS = /*JSON-START*/{
 "title": "Kutsal Ayin",
 "en": "The Holy Mass",
 "intro": "Kutsal Ayin, Katolik ibadetinin kalbidir. Mesih’in çarmıhta sunduğu eşsiz kurban, bu ayinde kansız bir biçimde yeniden sunulur. Aşağıda ayinin altı bölümünü Rahip (R) ve cemaat (C) diyaloglarıyla sırasıyla bulabilir, dilerseniz her bölümün İngilizcesini de açabilirsiniz.",
 "introEn": "The Mass is the heart of Catholic worship. The one sacrifice Christ offered on the cross is made present again in it, in an unbloody manner. Below you will find the six parts of the Mass in order, with the dialogue of the Priest (P) and the People (C), and you can open the Turkish text of each part if you wish.",
 "roleLabels": {
  "P": "Rahip",
  "C": "Cemaat",
  "PC": "Rahip ve Cemaat",
  "N": ""
 },
 "roleLabelsEn": {
  "P": "Priest",
  "C": "People",
  "PC": "Priest and People",
  "N": ""
 },
 "parts": [
  {
   "id": "toplanma",
   "n": 1,
   "icon": "gather",
   "title": "Cemaatin Toplanması",
   "en": "The Introductory Rites",
   "lead": "Ayin, Rahip’in sunağa yaklaşıp onu öpmesi ve haç işareti yapmasıyla başlar. Cemaat toplanır ve Allah’tan af diler.",
   "leadEn": "Mass begins as the Priest approaches the altar, venerates it with a kiss, and makes the Sign of the Cross. The people gather and ask God's forgiveness.",
   "lines": [
    {
     "role": "N",
     "tr": "Giriş sırasında Rahip sunağa doğru gider, onu öper ve haç işareti yaparak şöyle der:",
     "en": "As Mass begins, the Priest approaches the altar, venerates it with a kiss, and makes the Sign of the Cross."
    },
    {
     "role": "P",
     "tr": "Peder, Oğul ve Kutsal Ruh’un adına.",
     "en": "In the name of the Father, and of the Son, and of the Holy Spirit."
    },
    {
     "role": "C",
     "tr": "Amin.",
     "en": "Amen."
    },
    {
     "role": "N",
     "tr": "Rahip cemaati şöyle selamlar:",
     "en": "The Priest greets the people:"
    },
    {
     "role": "P",
     "tr": "Rabbimiz Mesih İsa’nın lütfu, Peder Allah’ın sevgisi ve birlik sağlayan Kutsal Ruh’un kudreti daima sizinle olsun.",
     "en": "The grace of our Lord Jesus Christ, and the love of God the Father, and the communion of the Holy Spirit be with you all."
    },
    {
     "role": "C",
     "tr": "Ve sizin ruhunuzla.",
     "en": "And with your spirit."
    },
    {
     "role": "N",
     "tr": "Selam şöyle de olabilir:",
     "en": "Or the greeting may be:"
    },
    {
     "role": "P",
     "tr": "Rab sizinle olsun.",
     "en": "The Lord be with you."
    },
    {
     "role": "C",
     "tr": "Ve sizin ruhunuzla.",
     "en": "And with your spirit."
    },
    {
     "role": "N",
     "tr": "veya:",
     "en": "or:"
    },
    {
     "role": "P",
     "tr": "Pederimiz Allah ve Efendimiz Mesih İsa sizlere barış ve kurtuluş bağışlasın.",
     "en": "May God our Father and the Lord Jesus Christ grant you peace and salvation."
    },
    {
     "role": "C",
     "tr": "Şimdi ve her zaman Allah’a şükredelim.",
     "en": "Let us give thanks to God now and always."
    },
    {
     "role": "N",
     "tr": "Rahip müminleri tövbe etmeye davet eder:",
     "en": "The Priest invites the faithful to repentance:"
    },
    {
     "role": "P",
     "tr": "Kurtuluş gizemini kutlamadan önce günahkâr olduğumuzu hatırlayalım ve pişmanlık duyarak Allah’tan af dileyelim.",
     "en": "Before we celebrate the mystery of salvation, let us call to mind our sins and, in sorrow, ask pardon of God."
    },
    {
     "role": "PC",
     "tr": "Her şeye kadir Allah’a ve size kardeşlerim, düşüncelerimle ve sözlerimle, eylemlerimle ve ihmallerimle çok günah işlediğimi itiraf ediyorum. (sağ elin parmaklarıyla hafifçe göğse dokunarak) Gerçekten günah işledim. Bu nedenle Bakire Meryem Ana’ya, Meleklere, bütün Azizlere ve size kardeşlerim, yalvarıyorum, benim için Rabbimiz Allah’a dua ediniz.",
     "en": "I confess to almighty God, and to you, my brothers and sisters, that I have greatly sinned, in my thoughts and in my words, in what I have done and in what I have failed to do, (striking the breast) through my fault, through my fault, through my most grievous fault. Therefore I ask blessed Mary ever-Virgin, all the Angels and Saints, and you, my brothers and sisters, to pray for me to the Lord our God."
    },
    {
     "role": "N",
     "tr": "Rahip, müminleri şu şekilde de tövbeye davet edebilir:",
     "en": "The Priest may also invite the faithful to repentance in this way:"
    },
    {
     "role": "P",
     "tr": "Kurtuluşumuzun gizemini kutlamadan önce günahkâr olduğumuzu hatırlayalım ve pişmanlık duyarak Allah’tan af dileyelim.",
     "en": "Before we celebrate the mystery of our salvation, let us call to mind our sins and, in sorrow, ask pardon of God."
    },
    {
     "role": "P",
     "tr": "Rabbim, yüce sevginle bizi bağışla.",
     "en": "Lord, in your great love, forgive us."
    },
    {
     "role": "C",
     "tr": "Çünkü Sana karşı günah işledik.",
     "en": "For we have sinned against you."
    },
    {
     "role": "P",
     "tr": "Rabbim, merhametini bizden esirgeme.",
     "en": "Lord, do not withhold your mercy from us."
    },
    {
     "role": "C",
     "tr": "Ve bizi selamete kavuştur.",
     "en": "And bring us to salvation."
    },
    {
     "role": "N",
     "tr": "veya:",
     "en": "or:"
    },
    {
     "role": "P",
     "tr": "İnsanları arıtmak ve kurtarmak için Peder tarafından gönderilen Rabbimiz Mesih, bize merhamet eyle.",
     "en": "You were sent to heal the contrite of heart: Lord, have mercy."
    },
    {
     "role": "C",
     "tr": "Bize merhamet eyle.",
     "en": "Lord, have mercy."
    },
    {
     "role": "P",
     "tr": "Bütün günahkârları kurtuluş yoluna çağırmak için bu dünyaya gelen Rabbimiz Mesih, bize merhamet eyle.",
     "en": "You came to call sinners: Christ, have mercy."
    },
    {
     "role": "C",
     "tr": "Bize merhamet eyle.",
     "en": "Christ, have mercy."
    },
    {
     "role": "P",
     "tr": "Göğe yükselen ve Peder’in huzurunda bizler için yalvaran Mesih, bize merhamet eyle.",
     "en": "You are seated at the right hand of the Father to intercede for us: Lord, have mercy."
    },
    {
     "role": "C",
     "tr": "Bize merhamet eyle.",
     "en": "Lord, have mercy."
    },
    {
     "role": "P",
     "tr": "Her şeye kadir Allah bize merhamet etsin, günahlarımızı affetsin ve bizi ebedi hayata kavuştursun.",
     "en": "May almighty God have mercy on us, forgive us our sins, and bring us to everlasting life."
    },
    {
     "role": "C",
     "tr": "Amin.",
     "en": "Amen."
    },
    {
     "role": "N",
     "tr": "Kyrie eleison:",
     "en": "The Kyrie:"
    },
    {
     "role": "P",
     "tr": "Rabbim, bize merhamet eyle.",
     "en": "Lord, have mercy."
    },
    {
     "role": "C",
     "tr": "Rabbim, bize merhamet eyle.",
     "en": "Lord, have mercy."
    },
    {
     "role": "P",
     "tr": "Mesih İsa, bize merhamet eyle.",
     "en": "Christ, have mercy."
    },
    {
     "role": "C",
     "tr": "Mesih İsa, bize merhamet eyle.",
     "en": "Christ, have mercy."
    },
    {
     "role": "P",
     "tr": "Rabbim, bize merhamet eyle.",
     "en": "Lord, have mercy."
    },
    {
     "role": "C",
     "tr": "Rabbim, bize merhamet eyle.",
     "en": "Lord, have mercy."
    },
    {
     "role": "N",
     "tr": "Gloria (Pazar ve bayram günlerinde):",
     "en": "The Gloria (on Sundays and feast days):"
    },
    {
     "role": "PC",
     "tr": "Göklerdeki yüce Allah’a övgüler olsun ve yeryüzünde iyi niyetli insanlara barış gelsin. Seni överiz, Seni yüceltiriz, Sana ibadet ederiz, Sana hamdederiz. Yüce Allah, göklerin kralı, her şeye kadir Peder Allah, sonsuz şanın için Sana şükrederiz. Mesih İsa, biricik Oğul, Yüce Allah, Allah’ın Kurbanı, Peder’in Oğlu, dünyanın günahlarını kaldıran Sen, bize merhamet eyle. Dünyanın günahlarını kaldıran Sen, dualarımızı kabul eyle. Yüce Allah’ın sağında oturan Sen, bize merhamet eyle. Çünkü yalnız Sen kutsalsın, yalnız Sen Rabbimizsin, yalnız Sen yücesin. Ey Mesih İsa, Kutsal Ruh’la birlikte Peder Allah’ın şanındasın. Amin.",
     "en": "Glory to God in the highest, and on earth peace to people of good will. We praise you, we bless you, we adore you, we glorify you. We give you thanks for your great glory, Lord God, heavenly King, O God, almighty Father. Lord Jesus Christ, Only Begotten Son, Lord God, Lamb of God, Son of the Father, you take away the sins of the world, have mercy on us; you take away the sins of the world, receive our prayer; you are seated at the right hand of the Father, have mercy on us. For you alone are the Holy One, you alone are the Lord, you alone are the Most High, Jesus Christ, with the Holy Spirit, in the glory of God the Father. Amen."
    },
    {
     "role": "N",
     "tr": "Rahip cemaatin adına Pazar gününe ya da bayrama ait özel duayı okur.",
     "en": "The Priest then prays the Collect proper to the Sunday or feast, on behalf of the people."
    },
    {
     "role": "P",
     "tr": "Dua edelim.",
     "en": "Let us pray."
    },
    {
     "role": "N",
     "tr": "Dua sonunda,",
     "en": "At the end of the prayer,"
    },
    {
     "role": "C",
     "tr": "Amin.",
     "en": "Amen."
    }
   ]
  },
  {
   "id": "soz-liturjisi",
   "n": 2,
   "icon": "book",
   "title": "Kutsal Kitabın Okunması",
   "en": "The Liturgy of the Word",
   "lead": "Kutsal Yazı’dan okumalar, İncil ve vaaz ile Kilise’nin öğretisi cemaate iletilir; herkes birlikte imanını açıklar.",
   "leadEn": "Readings from Scripture, the Gospel and the homily bring the Church's teaching to the people; together, all profess their faith.",
   "lines": [
    {
     "role": "N",
     "tr": "İncili yalnızca Rahip ya da diyakoz okur. Diğer okumaları yapanlar kürsüye yaklaşırken, Efkaristiya’nın bulunduğu özel alanın kutsallığına uygun davranmalı, kürsüden önce ve sonra diz çökerek ya da eğilerek selamlamalı ve okumaları açıkça anlaşılacak şekilde yapmalıdır. Okunan her parça şu sözlerle bitirilir:",
     "en": "Only the Priest or the deacon reads the Gospel. Those who proclaim the other readings approach the ambo with reverence for the sacred space where the Eucharist is kept, bow or genuflect before and after reading, and proclaim the text clearly. Each reading closes with these words:"
    },
    {
     "role": "P",
     "tr": "İşte Rabbin sözleridir.",
     "en": "The word of the Lord."
    },
    {
     "role": "C",
     "tr": "Rabbim, Sana şükürler olsun.",
     "en": "Thanks be to God."
    },
    {
     "role": "N",
     "tr": "Rahip, İncili okumadan önce alçak sesle şu duayı söyler:",
     "en": "Before proclaiming the Gospel, the Priest quietly prays:"
    },
    {
     "role": "P",
     "tr": "Her şeye kadir Allah, Kutsal İncilini Sana layık bir şekilde iletebilmem için kalbimi ve dudaklarımı arıt.",
     "en": "Cleanse my heart and my lips, almighty God, that I may worthily proclaim your holy Gospel."
    },
    {
     "role": "N",
     "tr": "sonra şöyle devam eder,",
     "en": "then continues,"
    },
    {
     "role": "P",
     "tr": "Rab sizinle olsun.",
     "en": "The Lord be with you."
    },
    {
     "role": "N",
     "tr": "herkes ayağa kalkmalıdır,",
     "en": "All stand,"
    },
    {
     "role": "C",
     "tr": "Ve sizin ruhunuzla.",
     "en": "And with your spirit."
    },
    {
     "role": "P",
     "tr": "Aziz … tarafından yazılan Mesih İsa’nın İncilinden sözler.",
     "en": "A reading from the holy Gospel according to Saint N."
    },
    {
     "role": "N",
     "tr": "Rahiple beraber herkes sağ elleriyle alınlarına, dudaklarına ve kalpleri üzerine haç işareti yaparlar.",
     "en": "Together with the Priest, all trace a small cross with the right thumb on the forehead, lips and breast."
    },
    {
     "role": "C",
     "tr": "Rabbimiz Mesih İsa, Sana övgüler olsun.",
     "en": "Glory to you, O Lord."
    },
    {
     "role": "N",
     "tr": "Rahip İncili okuduktan sonra şöyle der,",
     "en": "After the Gospel, the Priest says,"
    },
    {
     "role": "P",
     "tr": "Dinlediğimiz bu kutsal sözler için Rabbe şükredelim.",
     "en": "The Gospel of the Lord."
    },
    {
     "role": "C",
     "tr": "Rabbimiz Mesih İsa, Sana şükürler olsun.",
     "en": "Praise to you, Lord Jesus Christ."
    },
    {
     "role": "N",
     "tr": "Rahip İncili öper ve alçak sesle şöyle der,",
     "en": "The Priest kisses the Book and quietly says,"
    },
    {
     "role": "P",
     "tr": "İncilin sözleri sayesinde günahlarımız bağışlansın.",
     "en": "May the words of the Gospel wipe away our sins."
    },
    {
     "role": "N",
     "tr": "Vaazdan sonra, Pazar ve bayram günlerinde, herkes ayağa kalkıp Büyük İman Açıklaması’nı söyler:",
     "en": "After the homily, on Sundays and feast days, all stand and recite the Creed:"
    },
    {
     "role": "PC",
     "tr": "Bir tek Allah’a inanıyorum. Yerin ve göğün, görünen ve görünmeyen tüm varlıkların yaratıcısı, her şeye kadir Peder Allah’a inanıyorum. Tüm çağlardan önce Peder’den doğmuş olan, Allah’ın biricik Oğlu, bir tek Rab olan Mesih İsa’ya inanıyorum. O, Allah’tan Allah, Nur’dan Nur, gerçek Allah’tan gerçek Allah’tır. Yaratılmış olmayıp Peder ile aynı özdedir ve her şey O’nun aracılığıyla yaratılmıştır. Biz insanlar ve kurtuluşumuz için gökten inmiş, Kutsal Ruh’un kudretiyle Bakire Meryem’den vücut alıp insan olmuştur. Pontius Pilatus zamanında bizim için acı çekerek çarmıha gerilmiş, ölmüş, gömülmüş ve Kutsal Yazılara göre üç gün sonra dirilmiştir. Göğe çıkmış ve Peder’in sağında oturmaktadır. Dirileri ve ölüleri yargılamak için şanla tekrar gelecek ve O’nun hükümdarlığı son bulmayacaktır. Peygamberler aracılığıyla konuşmuş olan, Peder ve Oğul’dan çıkıp, Peder ve Oğul ile birlikte tapılan ve yüceltilen, hayatın kaynağı ve Rab olan Kutsal Ruh’a inanıyorum. Havarilerin inancına dayanan, katolik ve kutsal olan tek Kilise’ye inanıyorum. Günahların affedilmesi için tek bir vaftizi kabul ediyorum. Ölülerin dirilişini ve ebedi hayatı bekliyorum. Amin.",
     "en": "I believe in one God, the Father almighty, maker of heaven and earth, of all things visible and invisible. I believe in one Lord Jesus Christ, the Only Begotten Son of God, born of the Father before all ages. God from God, Light from Light, true God from true God, begotten, not made, consubstantial with the Father; through him all things were made. For us men and for our salvation he came down from heaven, and by the Holy Spirit was incarnate of the Virgin Mary, and became man. For our sake he was crucified under Pontius Pilate, he suffered death and was buried, and rose again on the third day in accordance with the Scriptures. He ascended into heaven and is seated at the right hand of the Father. He will come again in glory to judge the living and the dead, and his kingdom will have no end. I believe in the Holy Spirit, the Lord, the giver of life, who proceeds from the Father and the Son, who with the Father and the Son is adored and glorified, who has spoken through the prophets. I believe in one, holy, catholic and apostolic Church. I confess one Baptism for the forgiveness of sins, and I look forward to the resurrection of the dead and the life of the world to come. Amen."
    },
    {
     "role": "N",
     "tr": "Cemaatin duaları (genel dilekler) okunur; her dilekten sonra cemaat karşılık verir, örneğin:",
     "en": "The Prayer of the Faithful (General Intercessions) follows; after each petition the people respond, for example:"
    },
    {
     "role": "P",
     "tr": "Rab’be dua edelim.",
     "en": "Let us pray to the Lord."
    },
    {
     "role": "C",
     "tr": "Rabbim, duamızı işit.",
     "en": "Lord, hear our prayer."
    }
   ]
  },
  {
   "id": "sunus",
   "n": 3,
   "icon": "gifts",
   "title": "Ekmeğin ve Şarabın Sunulması",
   "en": "The Preparation of the Gifts",
   "lead": "Ekmek ve şarap sunağa getirilir; Rahip, bu adakları Allah’a sunarken cemaat adına dua eder.",
   "leadEn": "Bread and wine are brought to the altar; the Priest offers these gifts to God, praying on behalf of the people.",
   "lines": [
    {
     "role": "N",
     "tr": "Rahip ekmeği alır ve onu sunarken şöyle der:",
     "en": "The Priest takes the bread and, offering it, says:"
    },
    {
     "role": "P",
     "tr": "Ey Rabbimiz, bütün evrenin Allah’ı, Sana şükrederiz, çünkü toprağın ve insan emeğinin ürünü olan bu ekmeği bize Sen verdin. Onu yüce haşmetine sunarız. Bu ekmek bizler için hayat ekmeği olacaktır.",
     "en": "Blessed are you, Lord God of all creation, for through your goodness we have received the bread we offer you: fruit of the earth and work of human hands, it will become for us the bread of life."
    },
    {
     "role": "C",
     "tr": "Şimdi ve her zaman Allah’a şükredelim.",
     "en": "Blessed be God for ever."
    },
    {
     "role": "N",
     "tr": "Rahip şarabı kupaya döker ve ona biraz su katarak şu duayı söyler,",
     "en": "The Priest pours wine and a little water into the chalice, saying quietly,"
    },
    {
     "role": "P",
     "tr": "Nasıl bu kutsal ayin sırasında su şarapla karışıyorsa, biz de bu sevgi gizemi aracılığıyla insanlığımızı paylaşmış olan Mesih’in ilahi hayatı ile birleşelim.",
     "en": "By the mystery of this water and wine may we come to share in the divinity of Christ, who humbled himself to share in our humanity."
    },
    {
     "role": "N",
     "tr": "Rahip şarabı sunarken şu duayı söyler,",
     "en": "The Priest then offers the chalice, saying,"
    },
    {
     "role": "P",
     "tr": "Ey Rabbimiz, bütün evrenin Allah’ı, Sana şükrederiz, çünkü asmanın ve insan emeğinin ürünü olan bu şarabı bize Sen verdin. Onu yüce haşmetine sunarız. Bu şarap bizler için ebedi hayatın kaynağı olacaktır.",
     "en": "Blessed are you, Lord God of all creation, for through your goodness we have received the wine we offer you: fruit of the vine and work of human hands, it will become our spiritual drink."
    },
    {
     "role": "C",
     "tr": "Şimdi ve her zaman Allah’a şükredelim.",
     "en": "Blessed be God for ever."
    },
    {
     "role": "N",
     "tr": "Bundan sonra Rahip alçak sesle duaya şöyle devam eder,",
     "en": "Then, bowing, the Priest quietly says,"
    },
    {
     "role": "P",
     "tr": "Merhametli Allah, ne kadar alçakgönüllü ve pişman olduğumuzu gör ve bizi kabul et ki, bugün sunduğumuz bu adaklar Senin hoşnutluğunu kazansın.",
     "en": "With humble spirit and contrite heart may we be accepted by you, O Lord, and may our sacrifice in your sight this day be pleasing to you, Lord God."
    },
    {
     "role": "N",
     "tr": "Rahip ellerini yıkarken alçak sesle şu duayı söyler,",
     "en": "Washing his hands, the Priest quietly says,"
    },
    {
     "role": "P",
     "tr": "Rabbim, tüm suçlarımdan beni yıka ve her günahtan beni arıt.",
     "en": "Wash me, O Lord, from my iniquity and cleanse me from my sin."
    },
    {
     "role": "N",
     "tr": "Rahip, cemaati kendi duasına katılmaya davet eder,",
     "en": "The Priest invites the people to join in his prayer,"
    },
    {
     "role": "P",
     "tr": "Kardeşlerim, Allah’ın benim ve sizin kurbanınızı sevgiyle kabul etmesi için hep beraber dua edelim.",
     "en": "Pray, brothers and sisters, that my sacrifice and yours may be acceptable to God, the almighty Father."
    },
    {
     "role": "C",
     "tr": "Allah, kendi adının şanı ve yüceliği, bizim ve tüm Kilise’nin iyiliği için Senin ellerinden bu kurbanı kabul etsin.",
     "en": "May the Lord accept the sacrifice at your hands for the praise and glory of his name, for our good and the good of all his holy Church."
    },
    {
     "role": "N",
     "tr": "Rahip adaklar üzerine o güne ait duayı söyler. Duanın sonunda cemaat şöyle der,",
     "en": "The Priest prays the day’s prayer over the offerings. At its end the people say,"
    },
    {
     "role": "C",
     "tr": "Amin.",
     "en": "Amen."
    }
   ]
  },
  {
   "id": "sukran-duasi",
   "n": 4,
   "icon": "chalice",
   "title": "Şükran Duası",
   "en": "The Eucharistic Prayer",
   "lead": "Ayin’in kalbi: Rahip, cemaat adına Allah’a şükreder ve Kutsal Ruh’un kudretiyle ekmek ile şarap, Mesih İsa’nın gerçek bedeni ve kanı olur.",
   "leadEn": "The heart of the Mass: the Priest gives thanks to God on behalf of the people, and by the power of the Holy Spirit the bread and wine become the true Body and Blood of Christ.",
   "lines": [
    {
     "role": "P",
     "tr": "Rab sizinle olsun.",
     "en": "The Lord be with you."
    },
    {
     "role": "N",
     "tr": "Herkes ayağa kalkar,",
     "en": "All stand,"
    },
    {
     "role": "C",
     "tr": "Ve sizin ruhunuzla.",
     "en": "And with your spirit."
    },
    {
     "role": "P",
     "tr": "Kalplerimizi Allah’a yükseltelim.",
     "en": "Lift up your hearts."
    },
    {
     "role": "C",
     "tr": "Kalplerimiz Rab iledir.",
     "en": "We lift them up to the Lord."
    },
    {
     "role": "P",
     "tr": "Rabbimiz Allah’a şükredelim.",
     "en": "Let us give thanks to the Lord our God."
    },
    {
     "role": "C",
     "tr": "Gerçekten bu doğru ve gereklidir.",
     "en": "It is right and just."
    },
    {
     "role": "N",
     "tr": "Rahip o güne ait şükran duasını (Prefasyo) söyler ve sonunda cemaatle birlikte şunu söyler:",
     "en": "The Priest prays the Preface proper to the day, and at its end says together with the people:"
    },
    {
     "role": "PC",
     "tr": "Kutsal, Kutsal, Kutsal, evrenin Allah’ı. Gökler ve yer şanınla doludur. Hosanna, göklerdeki yüce Allah’a. Rab’bin adına gelen yüceltilsin. Hosanna, göklerdeki yüce Allah’a.",
     "en": "Holy, Holy, Holy Lord God of hosts. Heaven and earth are full of your glory. Hosanna in the highest. Blessed is he who comes in the name of the Lord. Hosanna in the highest."
    },
    {
     "role": "N",
     "tr": "Şükran Duaları. Herkes diz çöker,",
     "en": "The Eucharistic Prayer continues. All kneel,"
    },
    {
     "role": "P",
     "tr": "Rabbimiz, gerçekten Sen kutsalsın ve her mükemmelliğin kaynağısın. Sana yalvarıyoruz, Allahım, bu adakları Rabbimiz İsa Mesih’in bedeni ve kanı olmaları için, onları Kutsal Ruh’un kudretiyle kutsal kıl.",
     "en": "You are indeed Holy, O Lord, the fount of all holiness. Make holy, therefore, these gifts, we pray, by sending down your Spirit upon them like the dewfall, so that they may become for us the Body and Blood of our Lord Jesus Christ."
    },
    {
     "role": "N",
     "tr": "Kutsallaştırma sözleri:",
     "en": "The words of Consecration:"
    },
    {
     "role": "P",
     "tr": "Mesih İsa, ele verilip kendi iradesiyle ölüme doğru yürüdüğü zaman, ekmeği aldı, Sana şükrederek onu böldü ve Havarilerine vererek şöyle dedi: ALINIZ VE HEPİNİZ YİYİNİZ; BU SİZLER İÇİN KURBAN EDİLEN BENİM BEDENİMDİR. Aynı şekilde yemekten sonra, şarap kupasını aldı, tekrar Sana şükretti, onu Havarilerine vererek şöyle dedi: ALINIZ VE HEPİNİZ BU KUPADAN İÇİNİZ; BU BENİM KANIMDIR, YENİ VE EBEDİ AHDİN KANI. O, GÜNAHLARIN BAĞIŞLANMASI İÇİN SİZİN VE BÜTÜN İNSANLAR UĞRUNA DÖKÜLECEKTİR. BUNU BENİ ANMAK İÇİN YAPINIZ.",
     "en": "At the time he was betrayed and entered willingly into his Passion, he took bread and, giving thanks, broke it, and gave it to his disciples, saying: TAKE THIS, ALL OF YOU, AND EAT OF IT, FOR THIS IS MY BODY, WHICH WILL BE GIVEN UP FOR YOU. In a similar way, when supper was ended, he took the chalice and, once more giving thanks, he gave it to his disciples, saying: TAKE THIS, ALL OF YOU, AND DRINK FROM IT, FOR THIS IS THE CHALICE OF MY BLOOD, THE BLOOD OF THE NEW AND ETERNAL COVENANT, WHICH WILL BE POURED OUT FOR YOU AND FOR MANY FOR THE FORGIVENESS OF SINS. DO THIS IN MEMORY OF ME."
    },
    {
     "role": "P",
     "tr": "İmanın gizi büyüktür.",
     "en": "The mystery of faith."
    },
    {
     "role": "C",
     "tr": "Rabbimiz Mesih İsa, Senin ölümünü anıyoruz, dirilişini kutluyor ve şanlı gelişini bekliyoruz.",
     "en": "We proclaim your Death, O Lord, and profess your Resurrection until you come again."
    },
    {
     "role": "P",
     "tr": "Allahım, Oğlunun ölümü ve dirilişini anarak, bu ebedi hayatın ekmeğini ve kurtuluş kupasını Sana sunarak şükrediyoruz, çünkü huzurunda Sana hizmet etmeye bizleri layık gördün. Alçakgönüllülükle Sana yalvarıyoruz, Mesih İsa’nın bedenini ve kanını paylaştığımız zaman, Kutsal Ruh’un kudretiyle hepimizin toplanmasını ve birlik içinde yaşamasını sağla.",
     "en": "Therefore, O Lord, as we celebrate the memorial of the saving Passion of your Son, we, your servants and your holy people, offer to your glorious majesty this bread of life and cup of eternal salvation. Humbly we pray that, partaking of the Body and Blood of Christ, we may be gathered into one by the Holy Spirit."
    },
    {
     "role": "P",
     "tr": "Bütün dünyaya yayılmış olan Kiliseni hatırla, Rabbim; Papa … Hazretleri, episkoposumuz … ve Senin hizmetinde bulunanlarla birlikte, Kiliseni sevginle güçlendir.",
     "en": "Remember, Lord, your Church, spread throughout the world; strengthen her in charity together with N. our Pope, N. our Bishop, and all the clergy who serve you."
    },
    {
     "role": "P",
     "tr": "Her şeye kadir Peder Allah, Kutsal Ruh’un sağladığı birlik içinde, Mesih sayesinde, Mesih içinde ve Mesih’le birlikte asırlar boyunca Sana şan ve övgüler olsun.",
     "en": "Through him, and with him, and in him, O God, almighty Father, in the unity of the Holy Spirit, all glory and honor is yours, for ever and ever."
    },
    {
     "role": "C",
     "tr": "Amin.",
     "en": "Amen."
    }
   ]
  },
  {
   "id": "komunyon",
   "n": 5,
   "icon": "host",
   "title": "Komünyon",
   "en": "The Communion Rite",
   "lead": "Cemaat, Rab’bin Duası’nı söyler, birbirine barış diler ve Mesih İsa’nın gerçek bedeni ile kanını, Kutsal Efkaristiya’yı paylaşır.",
   "leadEn": "The people pray the Lord's Prayer, offer each other a sign of peace, and share the true Body and Blood of Christ in Holy Communion.",
   "lines": [
    {
     "role": "P",
     "tr": "Kurtarıcımız Mesih İsa’nın bize öğrettiği duayı iman ve güvenle söyleyelim.",
     "en": "At the Savior’s command and formed by divine teaching, we dare to say:"
    },
    {
     "role": "PC",
     "tr": "Göklerdeki Pederimiz, adın yüceltilsin, hükümdarlığın gelsin, göklerde olduğu gibi yeryüzünde de senin isteğin olsun. Günlük ekmeğimizi bugün de bize ver, bize kötülük edenleri bağışladığımız gibi Sen de bağışla suçlarımızı. Bizi günah işlemekten koru ve kötülükten kurtar.",
     "en": "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil."
    },
    {
     "role": "P",
     "tr": "Her kötülükten bizi kurtar, Allahım; günlerimizi barış ve huzur içinde geçirmemize yardım et. Merhametinle günahtan bizi kurtar. Sonsuz mutluluğun ümidi içinde yaşayan ve Kurtarıcımız Mesih İsa’nın gelişini bekleyen bizleri, yaşamdaki zorluklar karşısında koru ve kuvvetlendir.",
     "en": "Deliver us, Lord, we pray, from every evil, graciously grant peace in our days, that, by the help of your mercy, we may be always free from sin and safe from all distress, as we await the blessed hope and the coming of our Savior, Jesus Christ."
    },
    {
     "role": "C",
     "tr": "Çünkü hükümdarlık, kudret ve yücelik ebediyen Senindir.",
     "en": "For the kingdom, the power and the glory are yours, now and for ever."
    },
    {
     "role": "P",
     "tr": "Rabbimiz Mesih İsa, Havarilerine “Sizleri barış içinde bırakıyorum, size Benim huzurumu veriyorum” dedin. Günahlarımıza değil, Kilise’nin imanına bak ve ona isteğine göre birlik ve barış bağışla. Sen, Allah olarak ebediyen varsın ve hükmedersin.",
     "en": "Lord Jesus Christ, who said to your Apostles: Peace I leave you, my peace I give you; look not on our sins, but on the faith of your Church, and graciously grant her peace and unity in accordance with your will. You live and reign for ever and ever."
    },
    {
     "role": "C",
     "tr": "Amin.",
     "en": "Amen."
    },
    {
     "role": "P",
     "tr": "Rab’bin selameti daima sizinle olsun.",
     "en": "The peace of the Lord be with you always."
    },
    {
     "role": "C",
     "tr": "Ve sizin ruhunuzla.",
     "en": "And with your spirit."
    },
    {
     "role": "P",
     "tr": "Kardeşlerim, Mesih’in sevgisi içinde birbirimize barış ve huzur dileyelim.",
     "en": "Let us offer each other the sign of peace."
    },
    {
     "role": "N",
     "tr": "Rahip alçak sesle devam eder,",
     "en": "The Priest quietly continues,"
    },
    {
     "role": "P",
     "tr": "Bu kupada birleşmiş olan Mesih İsa’nın bedeni ve kanı bizler için ebedi hayatın kaynağı olsun.",
     "en": "May this mingling of the Body and Blood of our Lord Jesus Christ bring eternal life to us who receive it."
    },
    {
     "role": "N",
     "tr": "Herkes birbirine barış ve huzur diler.",
     "en": "All offer one another a sign of peace."
    },
    {
     "role": "PC",
     "tr": "Ey insanların günahlarını kaldıran Allah’ın Kuzusu, bize merhamet eyle. Ey insanların günahlarını kaldıran Allah’ın Kuzusu, bize merhamet eyle. Ey insanların günahlarını kaldıran Allah’ın Kuzusu, bize barış ve huzur bağışla.",
     "en": "Lamb of God, you take away the sins of the world, have mercy on us. Lamb of God, you take away the sins of the world, have mercy on us. Lamb of God, you take away the sins of the world, grant us peace."
    },
    {
     "role": "N",
     "tr": "Rahip kutsal ekmeği cemaate gösterir, herkes diz çöker,",
     "en": "The Priest shows the host to the people, and all kneel,"
    },
    {
     "role": "P",
     "tr": "Ne mutlu Rab’bin sofrasına davet edilenlere! İşte Allah’ın Kuzusu. Dünyayı günahlarından kurtaran budur!",
     "en": "Behold the Lamb of God, behold him who takes away the sins of the world. Blessed are those called to the supper of the Lamb."
    },
    {
     "role": "C",
     "tr": "Rabbim, bana gelmene layık değilim, ancak tek bir söz söyle, ruhum şifa bulacaktır.",
     "en": "Lord, I am not worthy that you should enter under my roof, but only say the word and my soul shall be healed."
    },
    {
     "role": "N",
     "tr": "Rahip Kutsal Ekmeği alırken şöyle der,",
     "en": "As he receives Communion, the Priest quietly says,"
    },
    {
     "role": "P",
     "tr": "Mesih’in bedeni bizi ebedi hayat için korusun.",
     "en": "May the Body of Christ keep me safe for eternal life."
    },
    {
     "role": "N",
     "tr": "Rahip kupayı alırken şöyle der,",
     "en": "As he receives from the chalice, he says,"
    },
    {
     "role": "P",
     "tr": "Mesih’in kanı bizi ebedi hayat için korusun.",
     "en": "May the Blood of Christ keep me safe for eternal life."
    },
    {
     "role": "N",
     "tr": "Rahip, kutsal ekmeği verirken “Mesih’in bedeni” der; komünyonu alan “Amin” der. Vaftiz olmamış ya da hazırlanmamış olanlar komünyon alamaz; yalnızca takdis alabilirler.",
     "en": "As he gives Communion, the Priest says, “The Body of Christ,” and the communicant answers, “Amen.” Those not baptized, or not prepared to receive, do not come forward for Communion; they may receive a blessing instead."
    },
    {
     "role": "N",
     "tr": "Komünyondan sonra dua. Rahip cemaatin adına dua eder, herkes ayağa kalkar,",
     "en": "The Prayer after Communion. The Priest prays on behalf of the people, and all stand,"
    },
    {
     "role": "P",
     "tr": "Dua edelim…",
     "en": "Let us pray…"
    },
    {
     "role": "C",
     "tr": "Amin.",
     "en": "Amen."
    }
   ]
  },
  {
   "id": "son-takdis",
   "n": 6,
   "icon": "blessing",
   "title": "Son Takdis",
   "en": "The Concluding Rites",
   "lead": "Rahip cemaati kutsar ve dünyaya, Müjde’yi yaşamak ve duyurmak üzere gönderir.",
   "leadEn": "The Priest blesses the people and sends them out into the world to live and proclaim the Gospel.",
   "lines": [
    {
     "role": "P",
     "tr": "Rab sizinle olsun.",
     "en": "The Lord be with you."
    },
    {
     "role": "C",
     "tr": "Ve sizin ruhunuzla.",
     "en": "And with your spirit."
    },
    {
     "role": "P",
     "tr": "Her şeye kadir ve tek Allah olan Peder, Oğul ve Kutsal Ruh sizleri takdis etsin.",
     "en": "May almighty God bless you, the Father, and the Son, and the Holy Spirit."
    },
    {
     "role": "N",
     "tr": "haç işareti yaparak,",
     "en": "making the Sign of the Cross,"
    },
    {
     "role": "C",
     "tr": "Amin.",
     "en": "Amen."
    },
    {
     "role": "P",
     "tr": "Allah’ın sevgisi ve barışı içinde gidiniz.",
     "en": "Go in the love and peace of God."
    },
    {
     "role": "C",
     "tr": "Allah’a şükürler olsun.",
     "en": "Thanks be to God."
    }
   ]
  }
 ]
}/*JSON-END*/;
