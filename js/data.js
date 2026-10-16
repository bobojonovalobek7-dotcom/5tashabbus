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

  upcomingEvents: [
    {
      id: "e1",
      title: "\"UrDU Yulduzlari\" 1-Tashabbus Iqtidorlar Ko'rik-Tanlovi",
      initiativeId: 1,
      date: "2026-10-24",
      time: "14:00",
      displayDate: "24-Oktyabr, 2026",
      location: "UrDU Bosh Madaniyat Saroyi",
      organizer: "Yoshlar bilan ishlash bo'limi",
      type: "Tanlov",
      desc: "Vokal, cholg'u ijrochiligi, badiiy o'qish va tasviriy san'at yo'nalishlarida yilning eng yorqin talabasi aniqlanadi."
    },
    {
      id: "e2",
      title: "Rektor Kubogi — Universitet Mini-Futbol Chempionati",
      initiativeId: 2,
      date: "2026-10-28",
      time: "15:30",
      displayDate: "28-Oktyabr, 2026",
      location: "UrDU Markaziy Stadioni",
      organizer: "Jismoniy madaniyat kafedrasi",
      type: "Sport musobaqasi",
      desc: "12 ta fakultet jamoalari o'rtasida shiddatli chempionat. G'olib jamoaga Rektor Kubogi va qimmatbaho sovg'alar."
    },
    {
      id: "e3",
      title: "\"Khorezm CyberCode 2026\" — 36 Soatlik Hackathon",
      initiativeId: 3,
      date: "2026-11-05",
      time: "09:00",
      displayDate: "5-Noyabr, 2026",
      location: "IT-Park UrDU Binosi",
      organizer: "Raqamli ta'lim markazi",
      type: "IT & Startap",
      desc: "AI, FinTech va EduTech yo'nalishlarida innovatsion prototiplar yaratish. Mukofot jamg'armasi: 40,000,000 so'm."
    },
    {
      id: "e4",
      title: "\"Kitob — Ma'naviyat Quyoshi\" Katta Kitobxonlik Marafon",
      initiativeId: 4,
      date: "2026-11-12",
      time: "11:00",
      displayDate: "12-Noyabr, 2026",
      location: "UrDU Axborot-Resurs Markazi",
      organizer: "ARM va Filologiya fakulteti",
      type: "Ma'naviyat",
      desc: "Kitob yarmarkasi, eng ko'p kitob o'qigan 100 talabani taqdirlash va taniqli yozuvchilar bilan jonli muloqot."
    },
    {
      id: "e5",
      title: "\"Mohir Qo'llar va Ijod\" Talaba-Qizlar Ko'rgazma-Yarmarkasi",
      initiativeId: 5,
      date: "2026-11-18",
      time: "10:00",
      displayDate: "18-Noyabr, 2026",
      location: "UrDU Bosh Binosi Foyesi",
      organizer: "Xotin-qizlar maslahat kengashi",
      type: "Ko'rgazma",
      desc: "Milliy kiyimlar defilesi, hunarmandchilik mahsulotlari auksioni, yosh tadbirkor qizlar loyihalari taqdimoti."
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
