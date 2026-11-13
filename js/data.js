/**
 * UrDU — 5 Muhim Tashabbus Markazi
 * Saytdagi barcha ma'lumotlar shu yerda saqlanadi.
 * Matn yoki raqamni o'zgartirish uchun faqat shu faylni tahrirlang.
 */

const SITE = {
  university: {
    name: "Abu Rayhon Beruniy nomidagi Urganch davlat universiteti",
    short: "UrDU",
    center: "5 Muhim Tashabbus Markazi",
    address: "Urganch shahri, Hamid Olimjon ko'chasi, 14-uy",
    office: "UrDU Bosh binosi, 2-qavat, 215-xona",
    phone: "+998 (94) 981-69-99",
    youthPhone: "+998 (62) 224-67-15",
    email: "info@urdu.uz",
    centerEmail: "tashabbus@urdu.uz",
    website: "https://urdu.uz",
    hemis: "https://hemis.urdu.uz",
    library: "https://arm.urdu.uz",
    socials: [
      { name: "Telegram", icon: "fa-brands fa-telegram", url: "https://t.me/Muxammad_Erimbetov" },
      { name: "Instagram", icon: "fa-brands fa-instagram", url: "https://instagram.com/muxammad.erimbetov" }
    ]
  },

  /* ---------------------------------------------------------------
     5 TASHABBUS
     --------------------------------------------------------------- */
  initiatives: [
    {
      id: 1,
      title: "Madaniyat va san'at",
      lead: "Musiqa, rassomlik, adabiyot va teatrga qiziqishni oshirish, iste'dodlarni yuzaga chiqarish.",
      about: "Talabalarning musiqa, tasviriy san'at, teatr va adabiyot sohalaridagi qobiliyatlarini rivojlantirish. Milliy cholg'u ansambllari, teatr-studiya va san'at ustaxonalari faoliyat yuritadi.",
      color: "#7C3AED",
      icon: "fa-solid fa-palette",
      image: "assets/images/tashabbus_1_art.jpg",
      clubsCount: 18,
      students: 2450,
      awards: 38,
      highlights: [
        "\"Dutorchi qizlar\" milliy ansambli",
        "\"Nihol\" talabalar teatr-studiyasi",
        "Xorazm maqom va dostonchilik maktabi",
        "Miniatyura va tasviriy san'at ustaxonasi"
      ]
    },
    {
      id: 2,
      title: "Sport",
      lead: "Yoshlarni jismoniy chiniqtirish, sportga keng jalb etish va sog'lom turmush tarzini targ'ib qilish.",
      about: "Talabalar o'rtasida ommaviy sportni rivojlantirish, fakultetlararo chempionatlar va \"Rektor kubogi\" musobaqalarini o'tkazish, terma jamoalarni Universiadaga tayyorlash.",
      color: "#16A34A",
      icon: "fa-solid fa-volleyball",
      image: "assets/images/tashabbus_2_sport.jpg",
      clubsCount: 22,
      students: 4120,
      awards: 56,
      highlights: [
        "Voleybol va mini-futbol talabalar ligasi",
        "Shaxmat va shashka klubi",
        "Milliy kurash va dzyudo maktabi",
        "Zamonaviy sport majmuasi va trenajyor zallari"
      ]
    },
    {
      id: 3,
      title: "Axborot texnologiyalari",
      lead: "Kompyuter texnologiyalari va internetdan samarali foydalanishni tashkil etish.",
      about: "Dasturlash, sun'iy intellekt, robototexnika va kiberxavfsizlik bo'yicha amaliy laboratoriyalar. Hakatonlar, startap inkubatori va IT Park bilan hamkorlik.",
      color: "#0284C7",
      icon: "fa-solid fa-laptop-code",
      image: "assets/images/tashabbus_3_it.jpg",
      clubsCount: 16,
      students: 3890,
      awards: 29,
      highlights: [
        "Web va mobil dasturlash laboratoriyasi",
        "Sun'iy intellekt va robototexnika klubi",
        "Kiberxavfsizlik va tarmoqlar",
        "\"UrDU Hackathon\" va startap inkubatori"
      ]
    },
    {
      id: 4,
      title: "Kitobxonlik",
      lead: "Kitobxonlikni keng targ'ib qilish va mutolaaga bo'lgan qiziqishni oshirish.",
      about: "Yoshlar o'rtasida mutolaa madaniyatini yuksaltirish: kitobxonlar klubi, munozara va notiqlik maktabi, \"Zakovat\" turnirlari va adiblar bilan uchrashuvlar.",
      color: "#D97706",
      icon: "fa-solid fa-book-open-reader",
      image: "assets/images/tashabbus_4_books.jpg",
      clubsCount: 15,
      students: 4980,
      awards: 44,
      highlights: [
        "\"Zukko kitobxon\" munozara klubi",
        "Notiqlik va debat akademiyasi",
        "\"Eng yaxshi kitobxon talaba\" tanlovi",
        "Adiblar bilan ma'naviy-ma'rifiy uchrashuvlar"
      ]
    },
    {
      id: 5,
      title: "Xotin-qizlar bandligi",
      lead: "Xotin-qizlar bandligini ta'minlash, ularni zamonaviy kasb-hunarga o'rgatish.",
      about: "Talaba-qizlarni milliy hunarmandchilik, tikuvchilik, pazandachilik, dizayn va raqamli tadbirkorlikka bepul o'qitish, daromad manbai yaratishga ko'maklashish.",
      color: "#DB2777",
      icon: "fa-solid fa-person-dress",
      image: "assets/images/tashabbus_5_crafts.jpg",
      clubsCount: 14,
      students: 3120,
      awards: 25,
      highlights: [
        "Liboslar dizayni va tikuvchilik studiyasi",
        "Pazandachilik va qandolatchilik maktabi",
        "Xorazm kashtachiligi va kulolchilik",
        "Grafik dizayn, SMM va onlayn savdo kurslari"
      ]
    }
  ],

  /* ---------------------------------------------------------------
     RAHBARIYAT
     --------------------------------------------------------------- */
  head: {
    name: "Muxammad Erimbetov",
    role: "Markaz rahbari",
    photo: "assets/images/leaders/muxammad_erimbetov.jpg",
    about: "Universitetdagi barcha to'garaklar, sport musobaqalari, IT loyihalar, kitobxonlik tanlovlari va xotin-qizlar kasb-hunar markazi faoliyatini muvofiqlashtiradi.",
    room: "UrDU Bosh binosi, 2-qavat, 215-xona",
    hours: "Dushanba–Juma, 14:00–17:30",
    phone: "+998 (94) 981-69-99",
    email: "tashabbus@urdu.uz"
  },

  leaders: [
    {
      initiativeId: 1,
      name: "Matluba Rahimova",
      role: "San'atshunoslik fakulteti dotsenti",
      photo: "assets/images/leaders/matluba_rahimova.jpg",
      about: "Teatr to'garaklari, maqom va vokal ijrochiligi, tasviriy san'at ko'rgazmalari hamda universitet san'at festivallarini muvofiqlashtiradi.",
      room: "San'atshunoslik fakulteti, 304-xona",
      hours: "Dushanba–Chorshanba, 14:00–17:00",
      phone: "+998 (91) 420-11-22"
    },
    {
      initiativeId: 2,
      name: "Jasur Bobojonov",
      role: "Universitet sport klubi raisi, sport ustasi",
      photo: "assets/images/leaders/jasur_bobojonov.jpg",
      about: "Sport seksiyalari, fakultetlararo chempionatlar, voleybol, mini-futbol, kurash va Universiada musobaqalarini tashkil etadi.",
      room: "Sport majmuasi, 102-xona",
      hours: "Seshanba–Payshanba, 15:00–18:00",
      phone: "+998 (90) 555-88-44"
    },
    {
      initiativeId: 3,
      name: "Sanjarbek O'rinov",
      role: "IT Park UrDU rezidentura rahbari, PhD",
      photo: "assets/images/leaders/sanjarbek_orinov.jpg",
      about: "Dasturlash, kiberxavfsizlik va sun'iy intellekt laboratoriyalari, hakatonlar hamda talabalar startap inkubatsiyasini boshqaradi.",
      room: "Fizika-matematika fakulteti, IT Lab 412",
      hours: "Dushanba–Juma, 14:00–17:30",
      phone: "+998 (93) 777-20-40"
    },
    {
      initiativeId: 4,
      name: "Gulbahor Xudayberganova",
      role: "Axborot-resurs markazi direktori, dotsent",
      photo: "assets/images/leaders/gulbahor_xudayberganova.jpg",
      about: "Kitobxonlik haftaliklari, mualliflar bilan uchrashuvlar, \"Zakovat\" intellektual o'yinlari va adabiyot klublarini tashkil qiladi.",
      room: "ARM binosi, 201-xona",
      hours: "Seshanba–Juma, 10:00–16:00",
      phone: "+998 (97) 512-33-88"
    },
    {
      initiativeId: 5,
      name: "Dilnoza Jumaniyozova",
      role: "Xotin-qizlar masalalari bo'yicha dekan muovini",
      photo: "assets/images/leaders/dilnoza_jumaniyozova.jpg",
      about: "Liboslar dizayni, pazandachilik, hunarmandchilik to'garaklari hamda talaba-qizlarni kasbga yo'naltirish loyihalariga mas'ul.",
      room: "UrDU Bosh binosi, 214-xona",
      hours: "Dushanba–Payshanba, 14:00–17:00",
      phone: "+998 (94) 310-75-90"
    }
  ],

  /* ---------------------------------------------------------------
     TO'GARAKLAR
     photo — faqat murabbiyning o'z surati bo'lsa qo'yiladi,
     aks holda ism bosh harflari ko'rsatiladi.
     --------------------------------------------------------------- */
  clubs: [
    {
      id: "dutorchi-qizlar", initiativeId: 1,
      name: "\"Dutorchi qizlar\" ansambli", category: "Musiqa",
      mentor: "Mavjuda Yoqubova", mentorRole: "O'zbekistonda xizmat ko'rsatgan artist",
      photo: "assets/images/teachers/mavjuda_yoqubova.jpg",
      place: "Madaniyat saroyi, 204-xona", schedule: "Dush, Chor, Juma · 15:00–17:00",
      enrolled: 42, capacity: 50,
      desc: "Xorazm dutor san'ati, maqomlar va xalq kuylarini professional darajada o'rganish."
    },
    {
      id: "nihol-teatr", initiativeId: 1,
      name: "\"Nihol\" teatr-studiyasi", category: "Teatr",
      mentor: "Rustam Otajonov", mentorRole: "Rejissyor",
      photo: "assets/images/teachers/rustam_otajonov.jpg",
      place: "Universitet katta zali sahnasi", schedule: "Sesh, Pay, Shan · 16:00–18:00",
      enrolled: 35, capacity: 40,
      desc: "Aktyorlik mahorati, sahna nutqi, pantomima va talabalar spektakllarini sahnalashtirish."
    },
    {
      id: "tasviriy-sanat", initiativeId: 1,
      name: "Miniatyura va tasviriy san'at", category: "Tasviriy san'at",
      mentor: "Azizbek Matkarimov", mentorRole: "Badiiy akademiya a'zosi",
      photo: "assets/images/teachers/azizbek_matkarimov.jpg",
      place: "San'atshunoslik fakulteti, 102-ustaxona", schedule: "Dush, Juma · 14:00–16:30",
      enrolled: 28, capacity: 30,
      desc: "Sharq miniatyurasi, moybo'yoq, akvarel va zamonaviy grafik kompozitsiya."
    },
    {
      id: "voleybol", initiativeId: 2,
      name: "Voleybol — UrDU terma jamoasi", category: "Jamoaviy sport",
      mentor: "Sport klubi murabbiylari", mentorRole: "Universitet sport klubi",
      place: "Yopiq sport zali №1", schedule: "Dush, Chor, Juma · 17:00–19:00",
      enrolled: 30, capacity: 36,
      desc: "Qizlar va yigitlar terma jamoasi, Universiadaga tayyorgarlik."
    },
    {
      id: "shaxmat", initiativeId: 2,
      name: "Shaxmat klubi", category: "Aqliy sport",
      mentor: "Umid Shomurodov", mentorRole: "FIDE ustasi",
      place: "Fizika-matematika binosi, 312-xona", schedule: "Sesh, Pay · 15:30–17:30",
      enrolled: 65, capacity: 80,
      desc: "Klassik shaxmat, rapid va blits, partiyalar tahlili va turnirlar."
    },
    {
      id: "kurash", initiativeId: 2,
      name: "Milliy kurash va dzyudo", category: "Yakkakurash",
      mentor: "Botir Quryozov", mentorRole: "Xalqaro toifadagi hakam",
      place: "Yakkakurashlar sport zali", schedule: "Dush, Chor, Juma · 16:30–18:30",
      enrolled: 48, capacity: 50,
      desc: "O'zbek milliy kurashi va dzyudo texnikasi, jismoniy chidamlilik."
    },
    {
      id: "web-dasturlash", initiativeId: 3,
      name: "Web va mobil dasturlash", category: "Dasturlash",
      mentor: "Temur Xo'jayev", mentorRole: "Senior dasturchi",
      photo: "assets/images/teachers/temur_xojayev.jpg",
      place: "IT Park UrDU Lab, 401-xona", schedule: "Sesh, Pay, Shan · 15:00–17:30",
      enrolled: 95, capacity: 100,
      desc: "HTML, CSS, JavaScript, React, Node.js va Flutter yordamida real loyihalar yaratish."
    },
    {
      id: "suniy-intellekt", initiativeId: 3,
      name: "Sun'iy intellekt va robototexnika", category: "AI va robototexnika",
      mentor: "Farhod Polvonov", mentorRole: "PhD",
      place: "Raqamli texnologiyalar binosi, 105-xona", schedule: "Dush, Chor · 16:00–18:30",
      enrolled: 54, capacity: 60,
      desc: "Python, mashinali o'qitish, Arduino va sensorlar asosida robot tizimlari."
    },
    {
      id: "kiberxavfsizlik", initiativeId: 3,
      name: "Kiberxavfsizlik va tarmoqlar", category: "Xavfsizlik",
      mentor: "Otabek Sodiqov", mentorRole: "Cisco va CEH sertifikatlari",
      place: "IT Park UrDU Lab, 403-xona", schedule: "Chor, Shan · 14:30–17:00",
      enrolled: 40, capacity: 45,
      desc: "Axborot xavfsizligi, tarmoq himoyasi va axloqiy xakerlik asoslari."
    },
    {
      id: "grafik-dizayn", initiativeId: 3,
      name: "Grafik dizayn va SMM", category: "Dizayn",
      mentor: "Jasur Matyoqubov", mentorRole: "Art-direktor",
      place: "IT Park UrDU Lab, 302-xona", schedule: "Dush, Pay · 16:00–18:30",
      enrolled: 28, capacity: 30,
      desc: "Brending, ijtimoiy tarmoqlar uchun kontent, Photoshop, Illustrator va Figma."
    },
    {
      id: "zukko-kitobxon", initiativeId: 4,
      name: "\"Zukko kitobxon\" klubi", category: "Kitobxonlik",
      mentor: "Saida Otamurodova", mentorRole: "ARM bo'lim boshlig'i",
      photo: "assets/images/teachers/saida_otamurodova.jpg",
      place: "ARM mutolaa zali", schedule: "Har chorshanba · 15:00–17:00",
      enrolled: 110, capacity: 120,
      desc: "Oyiga 2 ta asar mutolaasi, erkin muhokama va mualliflar bilan onlayn uchrashuvlar."
    },
    {
      id: "notiqlik", initiativeId: 4,
      name: "Notiqlik va debat akademiyasi", category: "Notiqlik",
      mentor: "Sherzodbek Matkarimov", mentorRole: "TEDx spikeri",
      place: "Filologiya fakulteti konferens-zali", schedule: "Juma, Shan · 15:30–17:30",
      enrolled: 72, capacity: 80,
      desc: "Karl Popper va Britaniya parlamenti formatlarida debat, ritorika san'ati."
    },
    {
      id: "liboslar-dizayni", initiativeId: 5,
      name: "Liboslar dizayni va tikuvchilik", category: "Tikuvchilik",
      mentor: "Gulchehra Ibragimova", mentorRole: "Dizayner-usta",
      photo: "assets/images/teachers/gulchehra_ibragimova.jpg",
      place: "Yoshlar markazi, tikuvchilik sexi", schedule: "Dush, Chor, Juma · 14:30–17:30",
      enrolled: 55, capacity: 60,
      desc: "Atlas va adras liboslar, zamonaviy bichim, kashtachilik va shaxsiy brend yaratish."
    },
    {
      id: "pazandachilik", initiativeId: 5,
      name: "Pazandachilik va qandolatchilik", category: "Kulinariya",
      mentor: "Zilola Yusupova", mentorRole: "Master-shef",
      photo: "assets/images/teachers/zilola_yusupova.jpg",
      place: "Talabalar turar joyi, oshxona-laboratoriya", schedule: "Sesh, Shan · 15:00–18:00",
      enrolled: 48, capacity: 50,
      desc: "Milliy pishiriqlar, Yevropa shirinliklari, tort bezash va katering asoslari."
    },
    {
      id: "hunarmandchilik", initiativeId: 5,
      name: "Kashtachilik va kulolchilik", category: "Hunarmandchilik",
      mentor: "Anvar Omonov", mentorRole: "Hunarmandlar uyushmasi a'zosi",
      place: "San'atshunoslik fakulteti, milliy ustaxona", schedule: "Chor, Shan · 14:00–16:30",
      enrolled: 18, capacity: 25,
      desc: "Xorazm kashtachiligi, zardo'zlik, kulolchilik va suvenirlar tayyorlash."
    },
    {
      id: "onlayn-savdo", initiativeId: 5,
      name: "Raqamli tadbirkorlik va onlayn savdo", category: "Tadbirkorlik",
      mentor: "Nilufar Madaminova", mentorRole: "Biznes-trener",
      place: "Startap markazi, kovorking", schedule: "Pay, Shan · 15:00–17:00",
      enrolled: 62, capacity: 70,
      desc: "O'z biznesini boshlash, marketpleyslarda savdo, SMM va moliyaviy savodxonlik."
    }
  ],

  /* ---------------------------------------------------------------
     TANLOVLAR
     --------------------------------------------------------------- */
  contests: [
    {
      id: "web-ai-olimpiada", initiativeId: 3, status: "active",
      title: "Web dasturlash va AI loyihalar olimpiadasi — 2026",
      period: "01.11.2026 — 05.12.2026", deadline: "2026-12-05",
      place: "IT Park UrDU, 401-xona", organizer: "Raqamli ta'lim markazi va IT Park",
      image: "assets/images/news_it_hackathon.jpg",
      prize: "1-o'rin: 15 mln so'm, diplom va planshet",
      desc: "Veb texnologiyalar, sun'iy intellekt va startaplar bo'yicha eng yaxshi g'oyalarni saralash.",
      rules: {
        purpose: "Iqtidorli talabalarni dasturiy injiniring va sun'iy intellekt sohalariga jalb qilish, amaliy loyihalarini qo'llab-quvvatlash.",
        requirements: [
          "UrDUning barcha bakalavr va magistratura talabalari qatnasha oladi.",
          "Loyiha yakka yoki 3 kishigacha jamoa bilan taqdim etiladi.",
          "Kod ochiq repozitoriyda (GitHub/GitLab) va ishlaydigan demo havolasi bilan bo'lishi shart.",
          "Plagiat va tayyor shablonlardan ruxsatsiz foydalanish taqiqlanadi."
        ],
        stages: [
          "Onlayn ariza va texnik hujjatlar — 28-noyabrgacha.",
          "Ekspertlar komissiyasi tekshiruvi — 1-dekabr.",
          "Final: jonli taqdimot (Demo Day) — 5-dekabr."
        ],
        criteria: [
          "G'oyaning yangiligi va amaliy ahamiyati — 25 ball",
          "Arxitektura va kod sifati — 30 ball",
          "Interfeys (UI/UX) — 25 ball",
          "Taqdimot va savol-javob — 20 ball"
        ],
        awards: "1-o'rin: 15 mln so'm; 2-o'rin: 10 mln so'm; 3-o'rin: 5 mln so'm."
      }
    },
    {
      id: "teatr-festivali", initiativeId: 1, status: "active",
      title: "\"Talabalar teatr studiyalari\" festival-ko'rik tanlovi",
      period: "10.11.2026 — 12.12.2026", deadline: "2026-12-12",
      place: "UrDU Madaniyat saroyi", organizer: "Yoshlar bilan ishlash bo'limi",
      image: "assets/images/news_theater_festival.jpg",
      prize: "Gran-pri: 12 mln so'm va respublika bosqichiga yo'llanma",
      desc: "Aktyorlik, sahna mahorati, badiiy nutq va rejissura qobiliyatlarini namoyon etuvchi festival.",
      rules: {
        purpose: "Milliy va jahon dramaturgiyasini talabalar teatr jamoalari orqali targ'ib qilish.",
        requirements: [
          "Har bir fakultetdan bitta spektakl yoki 20 daqiqalik kompozitsiya qabul qilinadi.",
          "Aktyorlar faqat UrDU talabalaridan iborat bo'lishi kerak.",
          "Mavzu: milliy qadriyatlar, tarixiy siymolar yoki zamonaviy yoshlar hayoti."
        ],
        stages: [
          "Fakultetlar ichki saralashi — 1-dekabrgacha.",
          "Universitet finali, Madaniyat saroyi sahnasi — 12-dekabr."
        ],
        criteria: [
          "Rejissura va g'oya — 30 ball",
          "Aktyorlik va sahna nutqi — 30 ball",
          "Musiqa, bezak va liboslar — 20 ball",
          "Tomoshabin bilan aloqa — 20 ball"
        ],
        awards: "Gran-pri, \"Eng yaxshi erkak roli\", \"Eng yaxshi ayol roli\" va maxsus diplomlar."
      }
    },
    {
      id: "rektor-kubogi", initiativeId: 2, status: "active",
      title: "Rektor kubogi — voleybol va mini-futbol chempionati",
      period: "05.11.2026 — 28.11.2026", deadline: "2026-11-28",
      place: "UrDU markaziy sport majmuasi", organizer: "Jismoniy madaniyat kafedrasi va sport klubi",
      image: "assets/images/contest_sport_cup.jpg",
      prize: "Rektor kubogi, medallar va 20 mln so'mlik sport anjomlari",
      desc: "Fakultetlar o'rtasida chempionat va universitet terma jamoasini shakllantirish.",
      rules: {
        purpose: "Ommaviy sportni rivojlantirish va terma jamoaga iqtidorlarni saralash.",
        requirements: [
          "Jamoa a'zolari talabalik guvohnomasiga ega bo'lishi kerak.",
          "Har bir jamoada 8 dan 12 nafargacha o'yinchi.",
          "Tibbiy ko'rikdan o'tganlik haqida ma'lumotnoma."
        ],
        stages: [
          "Guruh bosqichi — 15–22-noyabr.",
          "Yarim final va final — 28-noyabr."
        ],
        criteria: [
          "FIVB va FIFA rasmiy qoidalari asosida hakamlik.",
          "Fair-play tamoyillariga qat'iy rioya qilinadi."
        ],
        awards: "1–3-o'rin sohiblariga medallar, diplomlar va esdalik sovg'alari."
      }
    },
    {
      id: "eng-yaxshi-kitobxon", initiativeId: 4, status: "active",
      title: "\"Eng yaxshi kitobxon talaba\" tanlovi",
      period: "01.11.2026 — 20.11.2026", deadline: "2026-11-20",
      place: "UrDU Axborot-resurs markazi", organizer: "ARM va Filologiya fakulteti",
      image: "assets/images/tashabbus_4_books.jpg",
      prize: "1-o'rin: noutbuk va kitoblar to'plami",
      desc: "Tavsiya etilgan 10 ta asar bo'yicha test va insho orqali eng zukko kitobxonni aniqlash.",
      rules: {
        purpose: "Mutolaa madaniyatini yuksaltirish, badiiy tafakkur va nutq savodxonligini rivojlantirish.",
        requirements: [
          "Barcha kurs talabalari shaxsiy ariza bilan qatnasha oladi.",
          "Tavsiya etilgan adabiyotlar ro'yxatidagi asarlarni o'qigan bo'lish lozim."
        ],
        stages: [
          "Onlayn test (50 savol) — 15-noyabr.",
          "Insho va asar tahlili bo'yicha suhbat — 20-noyabr."
        ],
        criteria: [
          "Asar mazmunini bilish — 40 ball",
          "Tahliliy fikrlash — 30 ball",
          "Nutq madaniyati — 30 ball"
        ],
        awards: "G'olibga noutbuk, diplom va kitoblar to'plami."
      }
    },
    {
      id: "tadbirkor-qiz", initiativeId: 5, status: "active",
      title: "\"Tadbirkor qiz\" biznes-g'oyalar tanlovi",
      period: "15.11.2026 — 20.12.2026", deadline: "2026-12-20",
      place: "UrDU startap va kovorking markazi", organizer: "Xotin-qizlar maslahat kengashi",
      image: "assets/images/news_vocational_sewing.jpg",
      prize: "1-o'rin: 10 mln so'm grant va tikuv uskunasi",
      desc: "Talaba-qizlarning hunarmandchilik va xizmatlar sohasidagi biznes-rejalarini qo'llab-quvvatlash.",
      rules: {
        purpose: "Talaba-qizlarning iqtisodiy faolligini oshirish va o'z biznesini boshlashiga grant orqali ko'maklashish.",
        requirements: [
          "UrDU talaba-qizlari shaxsiy biznes loyihasi bilan qatnashadi.",
          "Loyiha yangi ish o'rinlari yaratishga yo'naltirilgan bo'lishi maqsadga muvofiq."
        ],
        stages: [
          "Biznes-reja va mahsulot namunalari — 5-dekabrgacha.",
          "Mentorlar bilan trening — 10-dekabr.",
          "Hakamlar oldida himoya va ko'rgazma — 20-dekabr."
        ],
        criteria: [
          "Iqtisodiy samaradorlik — 35 ball",
          "Ijodiy yondashuv — 35 ball",
          "Moliyaviy hisob-kitoblar — 30 ball"
        ],
        awards: "1-o'rin: 10 mln so'm startap granti va zamonaviy uskunalar."
      }
    },
    {
      id: "innovatsion-loyihalar", initiativeId: 3, status: "completed",
      title: "Respublika yoshlar innovatsion loyihalari — 2026",
      period: "15.04.2026 — 20.05.2026", deadline: "2026-05-20",
      place: "Toshkent, Yoshlar akademiyasi", organizer: "Innovatsion rivojlanish agentligi",
      image: "assets/images/dostonbek_winner.jpg",
      prize: "Faxrli 2-o'rin: Dostonbek Olloquliyev",
      desc: "Respublika ko'rik-tanlovida UrDU talabasi startap loyihasi bilan 2-o'rinni egalladi.",
      rules: {
        purpose: "Yosh innovatorlarning ilg'or ishlanmalarini qo'llab-quvvatlash.",
        requirements: ["Respublika OTM talabalari va yosh tadqiqotchilar."],
        stages: ["Universitet bosqichi", "Viloyat bosqichi", "Respublika finali"],
        criteria: ["Ilmiy asoslanganlik", "Tijoratlashtirish imkoniyati", "Ijtimoiy samara"],
        awards: "G'oliblarga mukofotlar va davlat granti."
      }
    }
  ],

  /* ---------------------------------------------------------------
     YANGILIKLAR
     --------------------------------------------------------------- */
  news: [
    {
      id: "it-hackathon",
      initiativeId: 3,
      date: "14.10.2026",
      title: "UrDU talabalari \"Talabalar IT-Hackathon 2026\" g'olibi bo'ldi",
      image: "assets/images/news_it_hackathon.jpg",
      excerpt: "48 soatlik respublika hakatonida sun'iy intellektga asoslangan ekologik monitoring loyihasi 1-o'rin va 30 mln so'm grantni qo'lga kiritdi.",
      body: "Texnika va raqamli texnologiyalar fakulteti talabalari Toshkentda o'tkazilgan respublika hakatonida suv resurslaridan oqilona foydalanish bo'yicha sun'iy intellekt va IoT datchiklariga asoslangan startap prototipini himoya qilib, mutlaq g'olib deb topildi."
    },
    {
      id: "teatr-festivali",
      initiativeId: 1,
      date: "11.10.2026",
      title: "Teatr studiyalari festivalida \"Nihol\" Gran-pri sohibi bo'ldi",
      image: "assets/images/news_theater_festival.jpg",
      excerpt: "Madaniyat saroyida o'tgan festivalda \"Nihol\" teatr-studiyasi \"Jaloliddin Manguberdi\" tarixiy dramasi bilan g'olib bo'ldi.",
      body: "Festivalda viloyatdagi oliy ta'lim muassasalarining teatr jamoalari bellashdi. \"Nihol\" teatr-studiyasi yuksak sahna mahorati va nutq madaniyati bilan hakamlar e'tirofiga sazovor bo'ldi."
    },
    {
      id: "kasb-hunar-markazi",
      initiativeId: 5,
      date: "08.10.2026",
      title: "Xotin-qizlar uchun yangi kasb-hunar markazi ochildi",
      image: "assets/images/news_vocational_sewing.jpg",
      excerpt: "12 ta zamonaviy tikuv mashinasi va kompyuterlar bilan jihozlangan bepul o'quv ustaxonasi ish boshladi.",
      body: "Ustaxonada tikuvchilik, liboslar dizayni, qandolatchilik va grafik dizayn kurslari talaba-qizlar hamda mahalla yoshlari uchun bepul tashkil etilmoqda."
    }
  ],

  /* ---------------------------------------------------------------
     YUTUQLAR (bosh sahifa slayderi va shon-sharaf doskasi)
     --------------------------------------------------------------- */
  winners: [
    {
      name: "Dostonbek Olloquliyev",
      photo: "assets/images/dostonbek_winner.jpg",
      initiativeId: 3,
      place: "2-o'rin",
      contest: "Respublika \"Innovatsion loyihalar\" tanlovi",
      text: "Istiqbolli startap loyihasi bilan respublika bosqichida faxrli 2-o'rinni egalladi."
    },
    {
      name: "Alisher Axmedov",
      photo: "assets/images/winner_1.jpg",
      initiativeId: 3,
      faculty: "Texnika va raqamli texnologiyalar",
      place: "1-o'rin",
      contest: "Talabalar IT-Challenge hakatoni",
      text: "Sun'iy intellekt asosidagi startap loyihasi bilan mutlaq g'olib bo'ldi.",
      quote: "UrDU IT-klubida o'rgangan bilimlarim bilan jamoamiz birinchi startapini boshladi."
    },
    {
      name: "Dilnoza Karimova",
      photo: "assets/images/winner_2.jpg",
      initiativeId: 5,
      faculty: "Pedagogika va san'at fakulteti",
      place: "Davlat mukofoti",
      contest: "\"Zulfiya\" nomidagi davlat mukofoti",
      text: "Milliy liboslar dizayni yo'nalishida yuksak mahorat ko'rsatib, davlat mukofotiga sazovor bo'ldi.",
      quote: "Milliy meros va zamonaviy san'at uyg'unligi — yoshlarning eng katta kuchi."
    }
  ],

  /* ---------------------------------------------------------------
     FAKULTETLAR REYTINGI
     --------------------------------------------------------------- */
  faculties: [
    { name: "Fizika-matematika fakulteti", points: 98.6, students: 1840, note: "Mutlaq yetakchi" },
    { name: "Texnika va raqamli texnologiyalar fakulteti", points: 96.2, students: 1720, note: "IT yo'nalishida yetakchi" },
    { name: "Filologiya fakulteti", points: 95.4, students: 1910, note: "Kitobxonlikda yetakchi" },
    { name: "Jismoniy madaniyat fakulteti", points: 94.8, students: 1530, note: "Sport chempioni" },
    { name: "Pedagogika va san'at fakulteti", points: 92.5, students: 1640, note: "San'atda yetakchi" },
    { name: "Tabiiy fanlar fakulteti", points: 91.0, students: 1480, note: "Faol ishtirokchi" },
    { name: "Tarix fakulteti", points: 89.7, students: 1290, note: "Faol ishtirokchi" },
    { name: "Xorijiy filologiya fakulteti", points: 88.3, students: 1380, note: "Faol ishtirokchi" }
  ],

  /* ---------------------------------------------------------------
     KUTUBXONA
     --------------------------------------------------------------- */
  books: [
    { title: "O'tkan kunlar", author: "Abdulla Qodiriy", category: "O'zbek adabiyoti", pages: 360, cover: "assets/images/books/book_otkan_kunlar.jpg",
      desc: "O'zbek romanchiligining gultoji: Otabek va Kumushning muhabbati, xonliklar davridagi millat taqdiri." },
    { title: "Boburnoma", author: "Zahiriddin Muhammad Bobur", category: "Tarix", pages: 480, cover: "assets/images/books/book_boburnoma.jpg",
      desc: "Tarix, geografiya va etnografiyaga oid jahonga mashhur memuar, Boburiylar saltanatining vujudga kelishi." },
    { title: "Yulduzli tunlar", author: "Pirimqul Qodirov", category: "Tarix", pages: 520, cover: "assets/images/books/book_yulduzli_tunlar.jpg",
      desc: "Bobur Mirzoning murakkab hayot yo'li, shohlik va shoirlik haqidagi tarixiy roman." },
    { title: "Atom odatlar", author: "Jeyms Klir", category: "Shaxsiy rivojlanish", pages: 320, cover: "assets/images/books/book_atom_odatlar.jpg",
      desc: "Kichik kundalik odatlar orqali o'qish va ishda katta natijalarga erishish usullari." },
    { title: "Raqamli qal'a", author: "Den Braun", category: "Jahon adabiyoti", pages: 440, cover: "assets/images/books/book_raqamli_qala.jpg",
      desc: "Kriptografiya, kiberxavfsizlik va buzib bo'lmas kodlar haqidagi intellektual triller." },
    { title: "Alkimyogar", author: "Paulo Koelo", category: "Jahon adabiyoti", pages: 224, cover: "assets/images/books/book_alkimyogar.jpg",
      desc: "O'z orzusi ortidan yo'lga chiqqan yosh cho'pon Santyago haqidagi falsafiy asar." }
  ],

  /* ---------------------------------------------------------------
     SAVOL-JAVOB
     --------------------------------------------------------------- */
  faqs: [
    { q: "To'garaklar pullikmi?", a: "Yo'q. 5 tashabbus doirasidagi barcha to'garaklar, sport seksiyalari va kasb-hunar kurslari UrDU talabalari uchun bepul." },
    { q: "Bir nechta to'garakka a'zo bo'lsam bo'ladimi?", a: "Ha. Dars jadvalingizga xalaqit bermasa, bir vaqtning o'zida bir nechta to'garakka qatnashishingiz mumkin." },
    { q: "Mashg'ulotlar qachon bo'ladi?", a: "Asosiy darslardan keyin, odatda 14:30 dan 18:30 gacha. Har bir to'garak jadvali uning kartochkasida ko'rsatilgan." },
    { q: "Faol qatnashganlarga qanday imtiyozlar bor?", a: "Faol talabalar va tanlov sovrindorlari rag'batlantiriladi, respublika tanlovlariga yo'llanma oladi va fakultet reytingiga ball qo'shiladi." },
    { q: "Yangi to'garak ochishni taklif qilsam bo'ladimi?", a: "Ha. Taklifingizni Aloqa sahifasidagi shakl orqali yoki markazga to'g'ridan-to'g'ri yuboring." }
  ]
};

/* Hisoblangan umumiy ko'rsatkichlar — qo'lda yozilmaydi, shuning uchun hamma joyda bir xil */
SITE.totals = {
  clubs: SITE.initiatives.reduce((s, i) => s + i.clubsCount, 0),
  students: SITE.initiatives.reduce((s, i) => s + i.students, 0),
  awards: SITE.initiatives.reduce((s, i) => s + i.awards, 0),
  activeContests: SITE.contests.filter(c => c.status === "active" && new Date(c.deadline + "T23:59:59") >= new Date()).length
};
