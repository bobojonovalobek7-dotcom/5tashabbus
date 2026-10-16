/**
 * Urganch Davlat Universiteti — 5 Muhim Tashabbus
 * Central Data Store
 */

const URDUDATA = {
  university: {
    name: "Abu Rayhon Beruniy nomidagi Urganch davlat universiteti",
    shortName: "UrDU",
    initiativesTitle: "5 Ta Muhim Tashabbus Markazi",
    address: "Urganch shahri, Hamid Olimjon ko'chasi, 14-uy",
    phone: "+998 (62) 224-67-00",
    email: "info@urdu.uz",
    youthUnionPhone: "+998 (62) 224-67-15",
    telegram: "@urdu_uz",
    website: "https://urdu.uz"
  },

  stats: {
    students: "18,500+",
    clubs: "85+",
    eventsYearly: "450+",
    medalsWon: "142",
    initiativesCount: "5"
  },

  initiatives: [
    {
      id: 1,
      slug: "madaniyat-sanat",
      number: "1-tashabbus",
      title: "Madaniyat, San'at va Teatr",
      shortDesc: "Musiqa, rassomlik, teatr va adabiyotga yoshlar qiziqishini oshirish, iste'dodlarni kashf etish",
      fullDesc: "Yoshlarning musiqa, rassomlik, adabiyot, teatr va san'atning boshqa turlariga qiziqishlarini oshirishga, iste'dodini yuzaga chiqarishga qaratilgan tizimli to'garaklar va festivallar markazi.",
      color: "#8B5CF6",
      gradient: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
      accentBg: "rgba(139, 92, 246, 0.12)",
      icon: "fa-solid fa-palette",
      image: "assets/images/tashabbus_1_art.jpg",
      coordinator: {
        name: "Matluba Rahimova",
        role: "Madaniyat ishlari bo'yicha koordinator, Dotsent",
        phone: "+998 (91) 420-11-22"
      },
      stats: {
        clubsCount: 18,
        activeStudents: 2450,
        awards: 38
      },
      highlights: [
        "\"Dutorchi qizlar\" milliy ansambli",
        "\"Yoshlik\" talabalar teatr-studiyasi",
        "Xorazm maqom va dostonchilik maktabi",
        "Miniatura va zamonaviy tasviriy san'at ustaxonasi"
      ]
    },
    {
      id: 2,
      slug: "sport-salomatlik",
      number: "2-tashabbus",
      title: "Sport va Jismoniy Chiniqish",
      shortDesc: "Yoshlarni jismoniy chiniqtirish, sport sohasida qobiliyatini yuksaltirish va sog'lom turmush tarzi",
      fullDesc: "Talaba-yoshlar o'rtasida ommaviy sportni rivojlantirish, sog'lom turmush tarzini qaror toptirish, universiada va jahon chempionatlariga chempionlarni tayyorlash.",
      color: "#F97316",
      gradient: "linear-gradient(135deg, #EA580C 0%, #FB923C 100%)",
      accentBg: "rgba(249, 115, 22, 0.12)",
      icon: "fa-solid fa-volleyball",
      image: "assets/images/tashabbus_2_sport.jpg",
      coordinator: {
        name: "Jasur Bobojonov",
        role: "Sport klubi raisi, O'zbekiston sport ustasi",
        phone: "+998 (90) 555-88-44"
      },
      stats: {
        clubsCount: 22,
        activeStudents: 4120,
        awards: 56
      },
      highlights: [
        "Voleybol va Mini-futbol talabalar ligasi",
        "Shaxmat & Shashka grossmeyster akademiyasi",
        "Kurash, belbog'li kurash va dzyudo maktabi",
        "UrDU zamonaviy sport majmuasi va trenajyor zallari"
      ]
    },
    {
      id: 3,
      slug: "it-texnologiyalar",
      number: "3-tashabbus",
      title: "Raqamli Texnologiyalar va IT",
      shortDesc: "Kompyuter texnologiyalari, dasturlash, kiberxavfsizlik va internetdan unumli foydalanish",
      fullDesc: "Aholi va talabalar o'rtasida kompyuter savodxonligini oshirish, dasturlash tillari, sun'iy intellekt, robototexnika va startap loyihalarni hayotga tatbiq etish.",
      color: "#06B6D4",
      gradient: "linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)",
      accentBg: "rgba(6, 182, 212, 0.12)",
      icon: "fa-solid fa-laptop-code",
      image: "assets/images/tashabbus_3_it.jpg",
      coordinator: {
        name: "Sanjarbek O'rinov",
        role: "IT Park UrDU rezidentura rahbari, PhD",
        phone: "+998 (93) 777-20-40"
      },
      stats: {
        clubsCount: 16,
        activeStudents: 3890,
        awards: 29
      },
      highlights: [
        "Full-Stack Web & Mobile dasturlash laboratoriyasi",
        "Sun'iy Intellekt (AI) va Data Science klubi",
        "Robototexnika, IoT va 3D modellash markazi",
        "\"UrDU Hackathon\" va startap inkubator"
      ]
    },
    {
      id: 4,
      slug: "kitobxonlik-manaviyat",
      number: "4-tashabbus",
      title: "Kitobxonlik va Ma'naviyat",
      shortDesc: "Kitobxonlik madaniyatini yuksaltirish, mutolaa muhitini kengaytirish va notiqlik san'ati",
      fullDesc: "Yoshlar ma'naviyatini yuksaltirish, ular o'rtasida kitobxonlikni targ'ib qilish, milliy va jahon adabiyoti durdonalarini chuqur o'rganish bo'yicha tizimli maydoncha.",
      color: "#10B981",
      gradient: "linear-gradient(135deg, #059669 0%, #34D399 100%)",
      accentBg: "rgba(16, 185, 129, 0.12)",
      icon: "fa-solid fa-book-open-reader",
      image: "assets/images/tashabbus_4_books.jpg",
      coordinator: {
        name: "Gulbahor Xudayberganova",
        role: "Axborot-resurs markazi direktori, Filologiya fanlari nomzodi",
        phone: "+998 (97) 512-33-88"
      },
      stats: {
        clubsCount: 15,
        activeStudents: 4980,
        awards: 44
      },
      highlights: [
        "\"Yosh kitobxon talaba\" ligasi va gran-pri tanlovlari",
        "UrDU E-Kutubxona: 50,000+ raqamli kitoblar bazasi",
        "Munozara va xalqaro debat klubi",
        "Adiblar xiyoboni ma'naviy-ma'rifiy uchrashuvlari"
      ]
    },
    {
      id: 5,
      slug: "xotin-qizlar-hunar",
      number: "5-tashabbus",
      title: "Xotin-qizlar Bandligi & Kasb-hunar",
      shortDesc: "Talaba qizlarni zamonaviy kasb-hunarlarga o'rgatish, tadbirkorlik va dizayn ko'nikmalari",
      fullDesc: "Talaba-qizlar va xotin-qizlarning bandligini ta'minlash, ularni milliy hunarmandchilik, kasanachilik, zamonaviy tikuvchilik, pazandachilik hamda raqamli biznesga o'rgatish.",
      color: "#EC4899",
      gradient: "linear-gradient(135deg, #DB2777 0%, #F472B6 100%)",
      accentBg: "rgba(236, 72, 153, 0.12)",
      icon: "fa-solid fa-scissors",
      image: "assets/images/tashabbus_5_crafts.jpg",
      coordinator: {
        name: "Dilnoza Jumaniyozova",
        role: "Xotin-qizlar masalalari bo'yicha dekan muovini",
        phone: "+998 (94) 310-75-90"
      },
      stats: {
        clubsCount: 14,
        activeStudents: 3120,
        awards: 25
      },
      highlights: [
        "Milliy adras va zamonaviy liboslar dizayn studiyasi",
        "Qandolatchilik va milliy taomlar pazandachilik maktabi",
        "Kasanachilik va qo'lda to'qish hunarmandchiligi",
        "\"Biznes-Ledi\" va SMM orqali daromad topish kursi"
      ]
    }
  ],

  clubs: [
    {
      id: "c1",
      name: "\"Dutorchi qizlar\" ansambli",
      initiativeId: 1,
      category: "Musiqa va Folklor",
      leader: "Mavjuda Yoqubova (O'zbekistonda xizmat ko'rsatgan artist)",
      location: "UrDU Madaniyat saroyi, 204-xona",
      schedule: "Dush, Chor, Juma 15:00 - 17:00",
      enrolled: 42,
      capacity: 50,
      badge: "Mashhur",
      desc: "Xorazm milliy dutor san'ati, maqomlar, xalq kuylarini professional o'rganish."
    },
    {
      id: "c2",
      name: "\"Nihol\" teatr-studiyasi",
      initiativeId: 1,
      category: "Teatr va Sahna",
      leader: "Rustam Otajonov (Sahnalashtiruvchi rejissyor)",
      location: "Universitet Katta zal sahnasi",
      schedule: "Sesh, Pay, Shanba 16:00 - 18:00",
      enrolled: 35,
      capacity: 40,
      badge: "Faol",
      desc: "Aktyorlik mahorati, sahna nutqi, pantomima va talabalar spektakllarini sahnalashtirish."
    },
    {
      id: "c3",
      name: "Miniatyura va Tasviriy San'at",
      initiativeId: 1,
      category: "Tasviriy San'at",
      leader: "Azizbek Matkarimov (Badiiy akademiya a'zosi)",
      location: "San'atshunoslik fakulteti, 102-ustaxona",
      schedule: "Dush, Juma 14:00 - 16:30",
      enrolled: 28,
      capacity: 30,
      badge: "Yangi",
      desc: "Sharq miniatyurasi, moybo'yoq, akvarel va zamonaviy grafik kompozitsiyalar."
    },
    {
      id: "c4",
      name: "Voleybol — UrDU Terma Jamoasi",
      initiativeId: 2,
      category: "Jamoaviy Sport",
      leader: "Mansur Ro'zmetov (Bosh murabbiy)",
      location: "UrDU Yopiq sport zali #1",
      schedule: "Dush, Chor, Juma 17:00 - 19:00",
      enrolled: 30,
      capacity: 36,
      badge: "Chempion",
      desc: "Universitet qizlar va yigitlar terma jamoasi. Universiada tayyorgarligi."
    },
    {
      id: "c5",
      name: "Grossmeyster Shaxmat Klubi",
      initiativeId: 2,
      category: "Aqliy Sport",
      leader: "Umid Shomurodov (FIDE ustasi)",
      location: "Fizika-matematika binosi, 312-xona",
      schedule: "Sesh, Pay 15:30 - 17:30",
      enrolled: 65,
      capacity: 80,
      badge: "Intellektual",
      desc: "Klassik shaxmat, rapid, blits va shaxmat tahlili bo'yicha chuqur mashg'ulotlar."
    },
    {
      id: "c6",
      name: "Milliy Kurash va Dzyudo",
      initiativeId: 2,
      category: "Yakkakurash",
      leader: "Botir Quryozov (Xalqaro toifadagi hakam)",
      location: "Yakkakurashlar sport zali",
      schedule: "Dush, Chor, Juma 16:30 - 18:30",
      enrolled: 48,
      capacity: 50,
      badge: "Ommabop",
      desc: "O'zbek milliy kurashi va xalqaro dzyudo texnikalari, jismoniy chidamlilik."
    },
    {
      id: "c7",
      name: "Web & Mobile Dasturlash (Full-Stack)",
      initiativeId: 3,
      category: "Dasturlash",
      leader: "Temur Xo'jayev (Senior Developer, Google DSC Lead)",
      location: "IT-Park UrDU Lab, 401-xona",
      schedule: "Sesh, Pay, Shanba 15:00 - 17:30",
      enrolled: 95,
      capacity: 100,
      badge: "Top Trend",
      desc: "HTML, CSS, JavaScript, React, Node.js va Flutter orqali real loyihalar yaratish."
    },
    {
      id: "c8",
      name: "Sun'iy Intellekt va Robototexnika",
      initiativeId: 3,
      category: "AI & Hardware",
      leader: "Farhod Polvonov (PhD)",
      location: "Raqamli texnologiyalar binosi, 105-xona",
      schedule: "Dush, Chor 16:00 - 18:30",
      enrolled: 54,
      capacity: 60,
      badge: "Kelajak",
      desc: "Python, TensorFlow, Arduino, sensorlar va avtomatlashtirilgan robot tizimlari."
    },
    {
      id: "c9",
      name: "Kiberxavfsizlik va Tarmoqlar",
      initiativeId: 3,
      category: "Security",
      leader: "Otabek Sodiqov (Cisco & CEH sertifikatlangan)",
      location: "IT-Park UrDU Lab, 403-xona",
      schedule: "Chor, Shanba 14:30 - 17:00",
      enrolled: 40,
      capacity: 45,
      badge: "Talabgir",
      desc: "Axborot xavfsizligi, tarmoq himoyasi, penetratsion testlar va axloqiy xakerlik."
    },
    {
      id: "c10",
      name: "\"Zukko Kitobxon\" Munozara Klubi",
      initiativeId: 4,
      category: "Kitobxonlik",
      leader: "Saida Otamurodova (ARM bo'lim boshlig'i)",
      location: "UrDU Markaziy ARM mutolaa zali",
      schedule: "Har Chorshanba 15:00 - 17:00",
      enrolled: 110,
      capacity: 120,
      badge: "Bestseller",
      desc: "Har oy 2 ta asar mutolaasi, erkin tahlil, mualliflar bilan onlayn teleko'priklar."
    },
    {
      id: "c11",
      name: "Notiqlik va Debat Akademiyasi",
      initiativeId: 4,
      category: "Liderlik",
      leader: "Sherzodbek Matkarimov (TEDx spikeri)",
      location: "Filologiya fakulteti konferens-zali",
      schedule: "Juma, Shanba 15:30 - 17:30",
      enrolled: 72,
      capacity: 80,
      badge: "Liderlik",
      desc: "Karl Popper va Britaniya parlamenti formati bo'yicha notiqlik, ritorika san'ati."
    },
    {
      id: "c12",
      name: "Liboslar Dizayni va Milliy Tikuvchilik",
      initiativeId: 5,
      category: "Moda & Hunar",
      leader: "Gulchehra Ibragimova (Dizayner-usta)",
      location: "Yoshlar markazi Tikuvchilik sexi",
      schedule: "Dush, Chor, Juma 14:30 - 17:30",
      enrolled: 55,
      capacity: 60,
      badge: "Amaliy",
      desc: "Milliy atlas va adras liboslar, zamonaviy bichim, kashtachilik va brend yaratish."
    },
    {
      id: "c13",
      name: "Pazandachilik & Qandolatchilik Sirlari",
      initiativeId: 5,
      category: "Kulinariya",
      leader: "Zilola Yusupova (Master-shef)",
      location: "Talabalar turar joyi oshxona-laboratoriyasi",
      schedule: "Sesh, Shanba 15:00 - 18:00",
      enrolled: 48,
      capacity: 50,
      badge: "Shirin San'at",
      desc: "Yevropa shirinliklari, milliy pishiriqlar, tort bezash va katering asoslari."
    },
    {
      id: "c14",
      name: "\"Biznes-Ledi\" va Raqamli Tadbirkorlik",
      initiativeId: 5,
      category: "Biznes & SMM",
      leader: "Nilufar Madaminova (Biznes-trener)",
      location: "Startap binosi, Coworking zonasi",
      schedule: "Pay, Shanba 15:00 - 17:00",
      enrolled: 62,
      capacity: 70,
      badge: "Daromad",
      desc: "O'z biznesini boshlash, ijtimoiy tarmoqlarda sotuv (SMM), moliyaviy savodxonlik."
    }
  ],

  contestsStats: {
    total: 48,
    active: 12,
    completed: 36
  },

  vocationalClubs: [
    {
      id: "voc-1",
      name: "Tikuvchilik va Liboslar Dizayni",
      initiativeId: 5,
      icon: "fa-solid fa-vest-patches",
      mentor: "Mahbuba Rajabova (Dizayner-usta)",
      location: "Xotin-qizlar markazi, 102-ustaxona",
      duration: "3 oylik amaliy kurs",
      schedule: "Dush, Chor, Juma 14:00 - 17:00",
      enrolled: 24,
      capacity: 30,
      skills: ["Bichish-tikish", "Milliy atlas", "Zamonaviy fason"],
      desc: "Milliy va zamonaviy liboslar bichish-tikish, modelyerlik asoslari hamda o'z brendini yaratish bo'yicha bepul amaliy mahorat darslari."
    },
    {
      id: "voc-2",
      name: "Zamonaviy Pazandachilik & Qandolatchilik",
      initiativeId: 5,
      icon: "fa-solid fa-cake-candles",
      mentor: "Shahlo Yoqubova (Bosh master-shef)",
      location: "Talabalar turar joyi kulinariya laboratoriyasi",
      duration: "2 oylik intensiv",
      schedule: "Sesh, Pay, Shanba 15:00 - 18:00",
      enrolled: 26,
      capacity: 30,
      skills: ["Qandolat san'ati", "Yevropa shirinliklari", "Tort bezash"],
      desc: "Klassik va zamonaviy desertlar, milliy pishiriqlar, shokolad bilan ishlash va fudsanoatda kichik biznes boshlash sirlari."
    },
    {
      id: "voc-3",
      name: "Grafik Dizayn & SMM Marketing",
      initiativeId: 5,
      icon: "fa-solid fa-wand-magic-sparkles",
      mentor: "Jasur Matyoqubov (Senior Art Director)",
      location: "IT-Park UrDU Lab, 302-xona",
      duration: "3 oylik amaliyot",
      schedule: "Dush, Payshanba 16:00 - 18:30",
      enrolled: 28,
      capacity: 30,
      skills: ["Photoshop", "Illustrator", "Figma", "SMM"],
      desc: "Brending, ijtimoiy tarmoqlar uchun vizual kontent tayyorlash, reklama bannerlari va frilansda xalqaro buyurtmalar olish."
    },
    {
      id: "voc-4",
      name: "Milliy Hunarmandchilik & Kulolchilik",
      initiativeId: 5,
      icon: "fa-solid fa-gem",
      mentor: "Anvar Omonov (Hunarmandlar uyushmasi a'zosi)",
      location: "San'atshunoslik fakulteti, Milliy ustaxona",
      duration: "4 oylik ustaxona",
      schedule: "Chor, Shanba 14:00 - 16:30",
      enrolled: 18,
      capacity: 25,
      skills: ["Xorazm kashtachiligi", "Kulolchilik", "Suvenirlar"],
      desc: "Xorazm an'anaviy kashtachiligi, zardo'zlik, suvenirlar tayyorlash va hunarmandchilik mahsulotlarini sayyohlarga sotish."
    },
    {
      id: "voc-5",
      name: "Sartaroshlik va Stilistika San'ati",
      initiativeId: 5,
      icon: "fa-solid fa-scissors",
      mentor: "Gulchehra Xudayberganova (Professional stilist)",
      location: "UrDU Go'zallik va stilistika studiyasi",
      duration: "2 oylik amaliy kurs",
      schedule: "Sesh, Juma 14:30 - 17:30",
      enrolled: 20,
      capacity: 25,
      skills: ["Soch turmaklash", "Vizaj", "Estetika"],
      desc: "Zamonaviy soch turmaklash, to'y va bayram vizaji, kosmetologiya asoslari va go'zallik salonini ochish ko'nikmalari."
    },
    {
      id: "voc-6",
      name: "Elektron Tijorat & Frilans Kursi",
      initiativeId: 5,
      icon: "fa-solid fa-cart-shopping",
      mentor: "Bekzod Rahimov (E-commerce ekspert)",
      location: "Coworking markazi, 201-xona",
      duration: "2 oylik trening",
      schedule: "Har Shanba 10:00 - 13:00",
      enrolled: 35,
      capacity: 40,
      skills: ["Uzum Market", "Upwork", "Onlayn do'kon", "Logistika"],
      desc: "Uzum Market va xalqaro platformalarda onlayn savdo yo'lga qo'yish, tovarlarni suratga olish, sotuv va moliya boshqaruvi."
    }
  ],

  latestNews: [
    {
      id: "news-1",
      title: "UrDU talabasi Respublika \"Talabalar IT-Hackathon 2026\" g'olibi bo'ldi",
      category: "3-Tashabbus (IT)",
      date: "14-Oktyabr, 2026",
      image: "assets/images/news_it_hackathon.jpg",
      excerpt: "UrDU Texnika fakulteti talabalaridan iborat jamoa 48 soatlik Respublika hakatonida sun'iy intellektga asoslangan ekologik monitoring loyihasi bilan 1-o'rinni va 30 mln so'm grantni qo'lga kiritdi.",
      content: "Abu Rayhon Beruniy nomidagi Urganch davlat universiteti Texnika va raqamli texnologiyalar fakulteti talabalari Toshkent shahrida o'tkazilgan Respublika 'Talabalar IT-Hackathon 2026' musobaqasida yuksak natija ko'rsatdilar. 48 soat davom etgan intensiv marafon davomida talabalarimiz sun'iy intellekt va IoT datchiklariga tayangan holda suv resurslaridan oqilona foydalanish bo'yicha startap prototipini himoya qildilar va mutlaq g'olib deb topildilar."
    },
    {
      id: "news-2",
      title: "\"Talabalar Teatr Studiyalari\" Respublika Festivali g'oliblari tantanali taqdirlandi",
      category: "1-Tashabbus (San'at)",
      date: "11-Oktyabr, 2026",
      image: "assets/images/news_theater_festival.jpg",
      excerpt: "Universitet Madaniyat saroyida bo'lib o'tgan festivalda \"Nihol\" talabalar teatr studiyasi \"Jaloliddin Manguberdi\" tarixiy dramasi bilan Gran-pri sohibi bo'ldi.",
      content: "5 ta muhim tashabbusning 1-yo'nalishi doirasida yoshlarning san'at, teatr va madaniyatga bo'lgan qiziqishini oshirish maqsadida o'tkazilgan festivalda viloyatdagi oliy ta'lim muassasalarining iqtidorli jamoalari bellashdilar. UrDU qoshidagi 'Nihol' teatr studiyasi o'zining yuksak mahorati va sahna nutqi bilan hakamlar hay'atining e'tirofiga sazovor bo'ldi."
    },
    {
      id: "news-3",
      title: "Xotin-qizlar uchun yangi zamonaviy kasb-hunar markazi tantanali ochildi",
      category: "5-Tashabbus (Kasb-hunar)",
      date: "08-Oktyabr, 2026",
      image: "assets/images/news_vocational_sewing.jpg",
      excerpt: "Universitetda talaba-qizlar va mahalla yoshlari uchun 12 ta zamonaviy tikuv mashinalari va kompyuterlar bilan jihozlangan bepul kasbga o'qitish markazi ish boshladi.",
      content: "5-muhim tashabbus doirasida xotin-qizlar bandligini ta'minlash, ularni zamonaviy kasb-hunarlarga o'rgatish maqsadida Urganch davlat universitetida yangi kasb-hunar o'quv ustaxonasi foydalanishga topshirildi. Bu yerda tikuvchilik, liboslar dizayni, qandolatchilik hamda grafik dizayn kurslari bepul tashkil etilmoqda."
    }
  ],

  upcomingEvents: [
    {
      id: "contest-1",
      title: "Web Dasturlash va AI Loyihalar Olimpiadasi — 2026",
      initiativeId: 3,
      date: "2026-10-25",
      time: "10:00",
      displayDate: "01.10.2026 — 25.10.2026",
      deadline: "25-Oktyabr, 2026",
      daysLeft: "9 kun qoldi",
      status: "active",
      statusText: "Qabul ochiq",
      location: "IT-Park UrDU Binosi, 401-xona",
      organizer: "Raqamli ta'lim markazi va IT-Park",
      type: "IT & Startap",
      image: "assets/images/news_it_hackathon.jpg",
      prize: "1-o'rin: 15 000 000 so'm, Diplom va planshet",
      desc: "Talabalar o'rtasida zamonaviy veb texnologiyalar, sun'iy intellekt va startap loyihalar bo'yicha eng yaxshi innovatsion g'oyalarni saralash tanlovi.",
      nizom: {
        title: "\"Web Dasturlash va AI Loyihalar Olimpiadasi — 2026\" Rasmiy Nizomi",
        purpose: "Urganch davlat universiteti iqtidorli talabalarini dasturiy injiniring va sun'iy intellekt sohalariga jalb qilish, ularning amaliy loyihalarini qo'llab-quvvatlash.",
        requirements: [
          "UrDUning barcha bakalavr va magistratura talabalari ishtirok etishi mumkin.",
          "Loyihalar yakka tartibda yoki 3 kishigacha bo'lgan jamoalarda taqdim etiladi.",
          "Loyiha kodi ochiq repozitoriyda (GitHub/GitLab) joylashgan va ishchi veb-havolaga (live demo) ega bo'lishi shart.",
          "Plagiat va tayyor shablonlardan ruxsatsiz foydalanish taqiqlanadi."
        ],
        stages: [
          "1-bosqich: Onlayn ariza topshirish va texnik hujjatlarni qabul qilish (20-oktyabrgacha).",
          "2-bosqich: Ekspertlar komissiyasi tomonidan kod sifati va g'oya tekshiruvi (22-oktyabr).",
          "3-bosqich: Final — UrDU Bosh binosida jonli loyiha taqdimoti (Demo Day, 25-oktyabr)."
        ],
        criteria: [
          "G'oyaning yangiligi va amaliy ahamiyati — 25 ball",
          "Arxitektura, toza kod va ma'lumotlar bazasi loyihasi — 30 ball",
          "Foydalanuvchi interfeysi (UI/UX) va moslashuvchanlik — 25 ball",
          "Loyiha taqdimoti va savol-javoblar — 20 ball"
        ],
        jury: "UrDU professor-o'qituvchilari hamda IT-Park rezidentlari bo'lgan Senior dasturchilar.",
        awards: "1-o'rin: 15 000 000 so'm + Diplom; 2-o'rin: 10 000 000 so'm; 3-o'rin: 5 000 000 so'm."
      }
    },
    {
      id: "contest-2",
      title: "\"Talabalar Teatr Studiyalari\" Festival-Ko'rik Tanlovi",
      initiativeId: 1,
      date: "2026-10-30",
      time: "14:00",
      displayDate: "10.10.2026 — 30.10.2026",
      deadline: "30-Oktyabr, 2026",
      daysLeft: "14 kun qoldi",
      status: "active",
      statusText: "Qabul ochiq",
      location: "UrDU Bosh Madaniyat Saroyi",
      organizer: "Yoshlar bilan ishlash bo'limi va Teatr kafedrasi",
      type: "Madaniyat & San'at",
      image: "assets/images/news_theater_festival.jpg",
      prize: "Gran-pri: 12 000 000 so'm va Respublika bosqichiga yo'llanma",
      desc: "Talaba yoshlarning aktyorlik, sahna mahorati, badiiy nutq va rejissura qobiliyatlarini namoyon etuvchi an'anaviy teatr festivali.",
      nizom: {
        title: "\"Talabalar Teatr Studiyalari Festivali\" Nizomi",
        purpose: "Yoshlar ma'naviyatini yuksaltirish, milliy va jahon mumtoz dramaturgiyasini talabalar teatr jamoalari orqali targ'ib qilish.",
        requirements: [
          "Har bir fakultetdan bitta spektakl yoki 20 daqiqalik kompozitsiya qabul qilinadi.",
          "Aktyorlar tarkibi faqat UrDU talabalaridan iborat bo'lishi lozim.",
          "Mavzular: milliy qadriyatlar, tarixiy siymolar yoki zamonaviy yoshlar muammolari."
        ],
        stages: [
          "Saralash bosqichi: Fakultetlar ichki ko'rigi (20-oktyabrgacha).",
          "Universitet final bosqichi: UrDU Madaniyat saroyi sahnasida jonli spektakllar (30-oktyabr)."
        ],
        criteria: [
          "Rejissura yechimi va g'oyaviy pishiqlik — 30 ball",
          "Aktyorlik mahorati va sahna nutqi — 30 ball",
          "Musiqiy va vizual bezak, liboslar — 20 ball",
          "Tomoshabin bilan aloqa — 20 ball"
        ],
        jury: "O'zbekistonda xizmat ko'rsatgan artistlar va teatr san'atshunoslari.",
        awards: "Gran-pri, 'Eng yaxshi erkak roli', 'Eng yaxshi ayol roli' va maxsus diplomlar."
      }
    },
    {
      id: "contest-3",
      title: "Rektor Kubogi — Fakultetlararo Voleybol va Mini-Futbol Chempionati",
      initiativeId: 2,
      date: "2026-10-28",
      time: "15:30",
      displayDate: "05.10.2026 — 28.10.2026",
      deadline: "28-Oktyabr, 2026",
      daysLeft: "12 kun qoldi",
      status: "active",
      statusText: "Qabul ochiq",
      location: "UrDU Markaziy Yopiq Sport Majmuasi",
      organizer: "Jismoniy madaniyat kafedrasi va Sport klubi",
      type: "Sport",
      image: "assets/images/contest_sport_cup.jpg",
      prize: "Rektor Kubogi, oltin medallar va 20 000 000 so'mlik sport inventarlari",
      desc: "Universitetning 12 ta fakulteti talaba-yoshlari o'rtasida sog'lom turmush tarzini targ'ib qilish va universitet terma jamoasini shakllantirish chempionati.",
      nizom: {
        title: "\"Rektor Kubogi Sport Chempionati\" Nizomi",
        purpose: "Talabalar o'rtasida ommaviy sportni rivojlantirish va terma jamoaga iqtidorlarni saralash.",
        requirements: [
          "Jamoa a'zolari UrDU talabasi ekanligini tasdiqlovchi talabalik guvohnomasiga ega bo'lishi kerak.",
          "Har bir jamoada 8 nafardan 12 nafargacha ishtirokchi ro'yxatga olinadi.",
          "Tibbiy ko'rikdan o'tganlik to'g'risida ma'lumotnoma talab etiladi."
        ],
        stages: [
          "Guruh bosqichi o'yinlari: 15-22 oktyabr kunlari.",
          "Yarim final va Final: 28-oktyabr kuni Markaziy sport zalida."
        ],
        criteria: [
          "FIVB va FIFA xalqaro rasmiy o'yin qoidalari asosida hakamlik qilinadi.",
          "O'yinlarda fair-play (halol o'yin) tamoyillari qat'iy nazoratga olinadi."
        ],
        jury: "Milliy va xalqaro toifadagi professional hakamlar hay'ati.",
        awards: "1, 2 va 3-o'rin sohiblariga medallar, diplomlar va esdalik sovg'alari."
      }
    },
    {
      id: "contest-4",
      title: "\"Eng Yaxshi Kitobxon Talaba\" Oylik Universitet Tanlovi",
      initiativeId: 4,
      date: "2026-10-20",
      time: "11:00",
      displayDate: "01.10.2026 — 20.10.2026",
      deadline: "20-Oktyabr, 2026",
      daysLeft: "4 kun qoldi",
      status: "active",
      statusText: "Qabul ochiq",
      location: "UrDU Axborot-Resurs Markazi",
      organizer: "ARM va Filologiya fakulteti",
      type: "Kitobxonlik",
      image: "assets/images/tashabbus_4_books.jpg",
      prize: "1-o'rin: 5 000 000 so'm vaucher va elektron kitoblar jamlanmasi",
      desc: "Belgilangan 10 ta o'zbek va jahon adabiyoti durdonalarini o'qib, tahliliy test va insholar orqali eng zukko kitobxon talabani aniqlash.",
      nizom: {
        title: "\"Eng Yaxshi Kitobxon Talaba\" Tanlovi Nizomi",
        purpose: "Yoshlar o'rtasida mutolaa madaniyatini yuksaltirish, badiiy tafakkur va so'zlashuv savodxonligini rivojlantirish.",
        requirements: [
          "Barcha bosqich talabalari shaxsiy arizasi bilan ishtirok etishi mumkin.",
          "Tanlov uchun tavsiya etilgan adabiyotlar ro'yxatidagi asarlarni o'qigan bo'lish lozim."
        ],
        stages: [
          "1-bosqich: Onlayn test sinovi (50 ta savol) — 15-oktyabr.",
          "2-bosqich: Insho yozish va asar tahlili bo'yicha jonli suhbat — 20-oktyabr."
        ],
        criteria: [
          "Asar mazmunini to'liq o'zlashtirganlik — 40 ball",
          "Tahliliy fikrlash va shaxsiy munosabat — 30 ball",
          "Notiqlik va adabiy til me'yorlariga rioya etish — 30 ball"
        ],
        jury: "O'zbek adabiyoti kafedrasi professorlari va taniqli yozuvchilar.",
        awards: "G'olibga noutbuk, diplom hamda maxsus kitoblar jamlanmasi."
      }
    },
    {
      id: "contest-5",
      title: "\"Tadbirkor Qiz\" Biznes-G'oyalar va Hunarmandchilik Tanlovi",
      initiativeId: 5,
      date: "2026-11-10",
      time: "11:00",
      displayDate: "15.10.2026 — 10.11.2026",
      deadline: "10-Noyabr, 2026",
      daysLeft: "25 kun qoldi",
      status: "active",
      statusText: "Qabul ochiq",
      location: "UrDU Startap va Kovorking Markazi",
      organizer: "Xotin-qizlar maslahat kengashi",
      type: "Biznes & Hunar",
      image: "assets/images/news_vocational_sewing.jpg",
      prize: "1-o'rin: 10 000 000 so'm startap granti va tikuv uskunasi",
      desc: "Talaba-qizlarning tadbirkorlik tashabbuslari, milliy hunarmandchilik va zamonaviy xizmatlar sohasidagi eng istiqbolli biznes-rejalarini qo'llab-quvvatlash.",
      nizom: {
        title: "\"Tadbirkor Qiz\" Tanlovi Nizomi",
        purpose: "Xotin-qizlarning iqtisodiy faolligini oshirish, talaba-qizlarni o'z biznesini boshlashiga grantlar orqali ko'maklashish.",
        requirements: [
          "UrDU talaba-qizlari shaxsiy biznes loyihalari bilan qatnashishi mumkin.",
          "Loyiha ijtimoiy yo'naltirilgan va yangi ish o'rinlari yaratishga qaratilgan bo'lishi maqsadga muvofiq."
        ],
        stages: [
          "1-bosqich: Biznes-reja va mahsulot namunalari qabul qilinadi (01-noyabrgacha).",
          "2-bosqich: Mentorlar ko'magida loyihalarni takomillashtirish treningi (05-noyabr).",
          "3-bosqich: Hakamlar oldida himoya qilish va ko'rgazma (10-noyabr)."
        ],
        criteria: [
          "Loyihaning iqtisodiy rentabelligi va amalga oshishi — 35 ball",
          "Ijodiy yondashuv va milliy uslub — 35 ball",
          "Moliyaviy hisob-kitoblarning to'g'riligi — 30 ball"
        ],
        jury: "Tadbirkor ayollar assotsiatsiyasi vakillari va bank ekspertlari.",
        awards: "1-o'rin: 10 mln so'mlik startap granti, zamonaviy uskunalar."
      }
    },
    {
      id: "contest-6",
      title: "Respublika Yoshlar Innovatsion Loyihalari — 2026 (Bahorgi Mavsum)",
      initiativeId: 3,
      date: "2026-05-20",
      time: "10:00",
      displayDate: "15.04.2026 — 20.05.2026",
      deadline: "20-May, 2026",
      daysLeft: "Yakunlangan",
      status: "completed",
      statusText: "Yakunlangan",
      location: "Toshkent shahri, Yoshlar Akademiyasi",
      organizer: "Innovatsion rivojlanish agentligi va UrDU",
      type: "IT & Startap",
      image: "assets/images/dostonbek_winner.jpg",
      prize: "Faxrli 2-o'rin: Dostonbek Olloquliyev (UrDU talabasi)",
      desc: "Respublika miqyosida o'tkazilgan nufuzli ko'rik-tanlovda UrDU talabasi Dostonbek Olloquliyev o'z startap loyihasi bilan faxrli 2-o'rinni egalladi.",
      nizom: {
        title: "\"Yoshlar Innovatsion Loyihalari — 2026\" Rasmiy Nizomi",
        purpose: "Mamlakatimiz yosh olim va innovatorlarining eng ilg'or ilmiy ishlanmalarini qo'llab-quvvatlash.",
        requirements: ["Respublika OTM talabalari va yosh tadqiqotchilari."],
        stages: ["Universitet bosqichi", "Viloyat bosqichi", "Respublika final bosqichi"],
        criteria: ["Ilmiy asoslanganlik", "Tijoratlashtirish imkoniyati", "Ijtimoiy samara"],
        jury: "Fanlar akademiyasi olimlari va xorijiy ekspertlar.",
        awards: "G'oliblarga maxsus mukofotlar va davlat granti ajratilgan."
      }
    }
  ],

  facultyLeaderboard: [
    { rank: 1, name: "Fizika-matematika fakulteti", points: 98.6, activeStudents: 1840, initiativesBadge: "Mutlaq yetakchi" },
    { rank: 2, name: "Texnika va raqamli texnologiyalar", points: 96.2, activeStudents: 1720, initiativesBadge: "IT yetakchisi" },
    { rank: 3, name: "Filologiya fakulteti", points: 95.4, activeStudents: 1910, initiativesBadge: "Kitobxonlik yetakchisi" },
    { rank: 4, name: "Jismoniy madaniyat fakulteti", points: 94.8, activeStudents: 1530, initiativesBadge: "Sport chempioni" },
    { rank: 5, name: "Pedagogika va san'at fakulteti", points: 92.5, activeStudents: 1640, initiativesBadge: "San'at markazi" },
    { rank: 6, name: "Tabiiy fanlar fakulteti", points: 91.0, activeStudents: 1480, initiativesBadge: "Faol ishtirokchi" },
    { rank: 7, name: "Tarix fakulteti", points: 89.7, activeStudents: 1290, initiativesBadge: "Madaniyat targ'ibotchisi" },
    { rank: 8, name: "Xorijiy filologiya fakulteti", points: 88.3, activeStudents: 1380, initiativesBadge: "Xalqaro aloqalar" }
  ],

  hallOfFame: [
    {
      id: "w1",
      name: "Alisher Axmedov",
      faculty: "Texnika va raqamli texnologiyalar",
      initiative: "3-Tashabbus (IT)",
      achievement: "Respublika Yosh dasturchilar hakatoni 1-o'rin sohibi",
      image: "assets/images/winner_1.jpg",
      quote: "\"UrDU IT-klubida o'rgangan bilimlarim orqali jamoamiz bilan birinchi millionlik startapimizni boshladik.\""
    },
    {
      id: "w2",
      name: "Dilnoza Karimova",
      faculty: "Pedagogika va san'at fakulteti",
      initiative: "1 & 5-Tashabbuslar",
      achievement: "\"Zulfiya\" nomidagi davlat mukofoti sohibasi, Dizayner",
      image: "assets/images/winner_2.jpg",
      quote: "\"Milliy merosimiz va zamonaviy san'at uyg'unligi — yangi O'zbekiston yoshlarining eng buyuk kuchi!\""
    }
  ],

  quizQuestions: [
    {
      id: 1,
      question: "Bo'sh vaqtingiz bo'lganda eng ko'p nima bilan shug'ullanish sizga rohat bag'ishlaydi?",
      options: [
        { text: "Musiqa tinglash, gitara/dutor chalish yoki chizmachilik qilish", initiativeId: 1 },
        { text: "Yugurish, to'p o'ynash, turnikda mashq qilish yoki shaxmat surish", initiativeId: 2 },
        { text: "Kompyuterda kod yozish, yangi ilovalar va texnologiyalarni sinash", initiativeId: 3 },
        { text: "Qiziqarli badiiy asar yoki ilmiy kitob o'qish, fikr almashish", initiativeId: 4 },
        { text: "Qo'l mehnati, tikuvchilik, pazandachilik yoki yangi biznes g'oyalar tuzish", initiativeId: 5 }
      ]
    },
    {
      id: 2,
      question: "Qaysi sohada erishgan yutug'ingiz sizni eng ko'p ilhomlantirgan bo'lardi?",
      options: [
        { text: "Katta sahnada tomoshabinlar olqishiga sazovor bo'lish", initiativeId: 1 },
        { text: "Chempionatda shohsupaning eng yuqori pog'onasiga chiqish", initiativeId: 2 },
        { text: "Minglab odamlar foydalanadigan dastur yoki robot yaratish", initiativeId: 3 },
        { text: "\"Eng yaxshi kitobxon\" tanlovida g'olib bo'lib kitob javonini to'ldirish", initiativeId: 4 },
        { text: "O'z shaxsiy brendim yoki qo'l mehnati mahsulotlarimni bozorga chiqarish", initiativeId: 5 }
      ]
    },
    {
      id: 3,
      question: "Qanday muhitda o'zingizni eng erkin va baxtli his qilasiz?",
      options: [
        { text: "Konsert zali, teatr sahnasi va ijodiy ustaxonada", initiativeId: 1 },
        { text: "Sport arenasi, stadion va musobaqa hayajonida", initiativeId: 2 },
        { text: "Yorug' IT-kovorking, zamonaviy kompyuter va ikkita monitor qarshisida", initiativeId: 3 },
        { text: "Shinam kutubxona, kitob hidli sokin mutolaa zalida", initiativeId: 4 },
        { text: "Moda atelesi, oshxona studiyasi yoki biznes muzokaralar xonasida", initiativeId: 5 }
      ]
    },
    {
      id: 4,
      question: "Kelgusi 1 yil ichida qaysi ko'nikmangizni 10 barobarga oshirishni xohlaysiz?",
      options: [
        { text: "Aktyorlik, vokal yoki san'at asari yaratish qobiliyatini", initiativeId: 1 },
        { text: "Jismoniy kuch, sport mahorati va temir intizomni", initiativeId: 2 },
        { text: "Dasturlash, kiberxavfsizlik va sun'iy intellekt texnologiyalarini", initiativeId: 3 },
        { text: "Notiqlik, tanqidiy fikrlash va boy so'z boyligini", initiativeId: 4 },
        { text: "Kasb-hunar, dizayn va mustaqil daromad topish yo'llarini", initiativeId: 5 }
      ]
    }
  ],

  recommendedBooks: [
    { title: "Boburnoma", author: "Zahiriddin Muhammad Bobur", category: "Tarix va Adabiyot", pages: "480", rating: "4.9" },
    { title: "O'tkan kunlar", author: "Abdulla Qodiriy", category: "Klassika", pages: "360", rating: "5.0" },
    { title: "Yulduzli tunlar", author: "Pirimqul Qodirov", category: "Tarixiy roman", pages: "520", rating: "4.9" },
    { title: "Raqamli Qal'a (Digital Fortress)", author: "Den Braun", category: "IT & Triller", pages: "440", rating: "4.8" },
    { title: "Atom Odatlar (Atomic Habits)", author: "Jeyms Klir", category: "Shaxsiy rivojlanish", pages: "320", rating: "4.9" }
  ],

  faqs: [
    {
      q: "UrDU talabalari uchun 5 tashabbus to'garaklari bepulmi?",
      a: "Ha, universitetimizning barcha talabalari uchun barcha to'garaklar, sport seksiyalari, IT laboratoriyalari va kasb-hunar kurslari 100% BEPUL tashkil etilgan."
    },
    {
      q: "Bir vaqtning o'zida bir nechta to'garakka a'zo bo'lish mumkinmi?",
      a: "Albatta! Dars jadvalingizga xalaqit bermagan holda siz 2 yoki undan ortiq to'garaklarga a'zo bo'lishingiz mumkin (masalan, IT dasturlash va Shaxmat klubi)."
    },
    {
      q: "Mashg'ulotlar qaysi paytda o'tkaziladi?",
      a: "Barcha to'garaklar talabalarning asosiy o'quv mashg'ulotlaridan so'ng — soat 14:30 dan 18:30 gacha bo'lgan qulay vaqtlarda olib boriladi."
    },
    {
      q: "To'garak a'zolari uchun qanday imtiyoz va rag'batlantirishlar mavjud?",
      a: "Faol talabalar universitet stipendiyalari, moddiy rag'batlantirish, xalqaro va respublika tanlovlariga yo'llanmalar hamda fakultet reyting ballariga ega bo'ladilar."
    },
    {
      q: "Yangi to'garak ochish yoki taklif bildirish imkoni bormi?",
      a: "Ha! Har bir talaba o'zining yangi klubi yoki tashabbusini Yoshlar ittifoqi UrDU boshlang'ich tashkilotiga taqdim etishi va qo'llab-quvvatlanishi mumkin."
    }
  ]
};

// -------------------------------------------------------------------
// Dynamic LocalStorage Sync & Dashboard CRUD Operations
// -------------------------------------------------------------------
(function syncUrDUStorage() {
  try {
    const savedClubs = localStorage.getItem('urdu_custom_clubs');
    if (savedClubs) {
      URDUDATA.clubs = JSON.parse(savedClubs);
    }
    const savedEvents = localStorage.getItem('urdu_custom_events');
    if (savedEvents) {
      URDUDATA.upcomingEvents = JSON.parse(savedEvents);
    }
    const savedStats = localStorage.getItem('urdu_custom_stats');
    if (savedStats) {
      URDUDATA.stats = Object.assign(URDUDATA.stats, JSON.parse(savedStats));
    }
  } catch (e) {
    console.warn("Storage sync error:", e);
  }
})();

URDUDATA.saveClubsState = function() {
  try {
    localStorage.setItem('urdu_custom_clubs', JSON.stringify(URDUDATA.clubs));
  } catch(e) {
    console.warn("Failed to persist clubs", e);
  }
};

URDUDATA.saveEventsState = function() {
  try {
    localStorage.setItem('urdu_custom_events', JSON.stringify(URDUDATA.upcomingEvents));
  } catch(e) {
    console.warn("Failed to persist events", e);
  }
};

URDUDATA.addClub = function(club) {
  URDUDATA.clubs.unshift(club);
  URDUDATA.saveClubsState();
};

URDUDATA.deleteClub = function(id) {
  URDUDATA.clubs = URDUDATA.clubs.filter(c => c.id !== id);
  URDUDATA.saveClubsState();
};

URDUDATA.addEvent = function(event) {
  URDUDATA.upcomingEvents.unshift(event);
  URDUDATA.saveEventsState();
};

URDUDATA.deleteEvent = function(id) {
  URDUDATA.upcomingEvents = URDUDATA.upcomingEvents.filter(e => e.id !== id);
  URDUDATA.saveEventsState();
};

URDUDATA.getRegistrations = function() {
  try {
    return JSON.parse(localStorage.getItem('urdu_5t_passes') || '[]');
  } catch(e) {
    return [];
  }
};

URDUDATA.updateRegistrationStatus = function(regId, status) {
  try {
    const list = URDUDATA.getRegistrations();
    const item = list.find(r => r.id === regId);
    if (item) {
      item.status = status;
      localStorage.setItem('urdu_5t_passes', JSON.stringify(list));
    }
  } catch(e) {
    console.warn(e);
  }
};

URDUDATA.deleteRegistration = function(regId) {
  try {
    const list = URDUDATA.getRegistrations().filter(r => r.id !== regId);
    localStorage.setItem('urdu_5t_passes', JSON.stringify(list));
  } catch(e) {
    console.warn(e);
  }
};

