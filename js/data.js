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
      awards: 38
    },
    {
      id: 2,
      title: "Sport",
      lead: "Yoshlarni jismoniy chiniqtirish, sportga keng jalb etish va sog'lom turmush tarzini targ'ib qilish.",
      about: "Talabalar o'rtasida ommaviy sportni rivojlantirish, fakultetlararo chempionatlar va \"Rektor kubogi\" musobaqalarini o'tkazish, terma jamoalarni Universiadaga tayyorlash.",
      color: "#16A34A",
      icon: "fa-solid fa-volleyball",
      image: "assets/images/tashabbus_2_sport.jpg",
      awards: 56
    },
    {
      id: 3,
      title: "Axborot texnologiyalari",
      lead: "Kompyuter texnologiyalari va internetdan samarali foydalanishni tashkil etish.",
      about: "Dasturlash, sun'iy intellekt, robototexnika va kiberxavfsizlik bo'yicha amaliy laboratoriyalar. Hakatonlar, startap inkubatori va IT Park bilan hamkorlik.",
      color: "#0284C7",
      icon: "fa-solid fa-laptop-code",
      image: "assets/images/tashabbus_3_it.jpg",
      awards: 29
    },
    {
      id: 4,
      title: "Kitobxonlik",
      lead: "Kitobxonlikni keng targ'ib qilish va mutolaaga bo'lgan qiziqishni oshirish.",
      about: "Yoshlar o'rtasida mutolaa madaniyatini yuksaltirish: kitobxonlar klubi, munozara va notiqlik maktabi, \"Zakovat\" turnirlari va adiblar bilan uchrashuvlar.",
      color: "#D97706",
      icon: "fa-solid fa-book-open-reader",
      image: "assets/images/tashabbus_4_books.jpg",
      awards: 44
    },
    {
      id: 5,
      title: "Xotin-qizlar bandligi",
      lead: "Xotin-qizlar bandligini ta'minlash, ularni zamonaviy kasb-hunarga o'rgatish.",
      about: "Talaba-qizlarni milliy hunarmandchilik, tikuvchilik, pazandachilik, dizayn va raqamli tadbirkorlikka bepul o'qitish, daromad manbai yaratishga ko'maklashish.",
      color: "#DB2777",
      icon: "fa-solid fa-person-dress",
      image: "assets/images/tashabbus_5_crafts.jpg",
      awards: 25
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
     TO'GARAKLAR — "Jami to'garaklar ro'yxati.xlsx" (2026–2027 o'quv yili)
     initiativeId: 1–5 tashabbuslar, 6 — ilmiy to'garaklar.
     students — o'quvchilar soni, mentors — rahbarlar, phones — telefonlar.
     --------------------------------------------------------------- */
  extraGroups: [
    {
      id: 6,
      title: "Ilmiy to'garaklar",
      lead: "Fan, tadqiqot, til va tafakkurga oid ilmiy to'garaklar.",
      color: "#0D9488",
      icon: "fa-solid fa-flask"
    }
  ],

  clubs: [
    {"id": "t1", "initiativeId": 2, "name": "Badminton (erkaklar va ayollar)", "schedule": "Dushanba, Chorshanba, Juma · 14:00–16:00", "place": "Texnika fakulteti", "students": 377, "mentors": ["Bekchanov M.", "Sailxonova N."], "phones": [{"text": "+998 99 122-75-02", "tel": "+998991227502"}, {"text": "+998 88 887-78-08", "tel": "+998888877808"}]},
    {"id": "t2", "initiativeId": 2, "name": "Basketbol (erkaklar va ayollar)", "schedule": "Dushanba, Chorshanba, Juma · 10:00–12:00", "place": "UrDU sport zali", "students": 467, "mentors": ["Hasanov O.", "Shamurotova B.", "Egamberdiyev B."], "phones": [{"text": "+998 97 459-36-18", "tel": "+998974593618"}, {"text": "+998 91 436-96-70", "tel": "+998914369670"}, {"text": "+998 87 025-14-41", "tel": "+998870251441"}]},
    {"id": "t3", "initiativeId": 2, "name": "Voleybol (erkaklar va ayollar)", "schedule": "Dushanba, Chorshanba, Juma · 17:00–18:30", "place": "UrDU sport zali", "students": 428, "mentors": ["Masharipov F.", "Ro‘zmetov R.", "Ro‘zmetov N.", "Saforboyev N.", "Ro‘zmetov A."], "phones": [{"text": "+998 93 282-09-00", "tel": "+998932820900"}, {"text": "+998 97 513-87-88", "tel": "+998975138788"}, {"text": "+998 94 230-70-60", "tel": "+998942307060"}, {"text": "+998 90 431-01-08", "tel": "+998904310108"}, {"text": "+998 99 526-69-99", "tel": "+998995266999"}]},
    {"id": "t4", "initiativeId": 2, "name": "Qo‘l to‘pi (erkaklar va ayollar)", "schedule": "Seshanba, Payshanba, Shanba · 16:00–17:30", "place": "UrDU sport zali", "students": 409, "mentors": ["Karimova A.", "Xasanova Sh."], "phones": [{"text": "+998 93 284-17-71", "tel": "+998932841771"}, {"text": "+998 93 922-99-17", "tel": "+998939229917"}]},
    {"id": "t5", "initiativeId": 2, "name": "Yengil atletika (erkaklar va ayollar)", "schedule": "Dushanba, Seshanba, Chorshanba, Payshanba, Juma · 15:00–17:00", "place": "Yoshlik sport majmuasi", "students": 425, "mentors": ["Yusupov B.", "Sobirov M.", "Sherov Z."], "phones": [{"text": "+998 88 600-85-85", "tel": "+998886008585"}, {"text": "+998 91 861-18-00", "tel": "+998918611800"}, {"text": "+998 93 921-88-08", "tel": "+998939218808"}]},
    {"id": "t6", "initiativeId": 2, "name": "Kurash", "schedule": "Seshanba, Payshanba, Shanba · 16:00–18:00", "place": "UrDU kurash zali", "students": 318, "mentors": ["Qodirov S.", "Matvafoyev A."], "phones": [{"text": "+998 94 114-81-81", "tel": "+998941148181"}, {"text": "+998 91 431-00-07", "tel": "+998914310007"}]},
    {"id": "t7", "initiativeId": 2, "name": "Dzyudo (erkaklar va ayollar)", "schedule": "Dushanba, Chorshanba, Juma · 16:00–17:30", "place": "UrDU kurash zali", "students": 189, "mentors": ["Iskandarov N.", "Atajonova G."], "phones": [{"text": "+998 91 275-95-55", "tel": "+998912759555"}, {"text": "+998 90 559-59-75", "tel": "+998905595975"}]},
    {"id": "t8", "initiativeId": 2, "name": "Erkin kurash va yunon-rum kurashi", "schedule": "Dushanba, Chorshanba, Juma · 17:00–19:00", "place": "UrDU kurash zali", "students": 183, "mentors": ["Satipov B.", "Jumaniyazova M."], "phones": [{"text": "+998 93 093-92-29", "tel": "+998930939229"}, {"text": "+998 99 104-69-93", "tel": "+998991046993"}]},
    {"id": "t9", "initiativeId": 2, "name": "Stol tennisi", "schedule": "Dushanba, Seshanba, Chorshanba, Payshanba, Juma · 17:00", "place": "Kimyo texnologiyalari fakulteti", "students": 178, "mentors": ["Kenjayev S.", "Maxmudov Y."], "phones": [{"text": "+998 94 230-60-70", "tel": "+998942306070"}, {"text": "+998 90 430-01-00", "tel": "+998904300100"}]},
    {"id": "t10", "initiativeId": 2, "name": "Futbol", "schedule": "Dushanba, Seshanba, Chorshanba, Payshanba, Juma · 14:00", "place": "UrDU sport maydoni", "students": 497, "mentors": ["Ataniyozov B.", "Yusufboyev Sh.", "Sadullayev A."], "phones": [{"text": "+998 50 070-86-00", "tel": "+998500708600"}, {"text": "+998 91 424-95-96", "tel": "+998914249596"}, {"text": "+998 97 600-76-77", "tel": "+998976007677"}]},
    {"id": "t11", "initiativeId": 2, "name": "Shashka va shaxmat", "schedule": "Seshanba, Chorshanba, Juma · 15:00–17:00", "place": "5-son TTJ, 4-xona", "students": 165, "mentors": ["Bobojonov N."], "phones": [{"text": "+998 20 012-84-94", "tel": "+998200128494"}]},
    {"id": "t12", "initiativeId": 2, "name": "Og‘ir atletika", "schedule": "Dushanba, Chorshanba, Juma · 15:00–17:00", "place": "UrDU kurash zali", "students": 192, "mentors": ["Ozodov K."], "phones": [{"text": "+998 91 779-97-97", "tel": "+998917799797"}]},
    {"id": "t13", "initiativeId": 2, "name": "Regbi-7 (erkaklar va ayollar)", "schedule": "Dushanba, Chorshanba, Juma · 15:00–17:00", "place": "UrDU sport maydoni", "students": 389, "mentors": ["Gilijova A.", "Abdullayev Z."], "phones": [{"text": "+998 94 314-47-07", "tel": "+998943144707"}, {"text": "+998 90 713-07-99", "tel": "+998907130799"}]},
    {"id": "t14", "initiativeId": 2, "name": "Suzish", "schedule": "Seshanba, Chorshanba, Juma · 14:00–16:00", "place": "Urganch Olimpiya va Paralimpiya STM", "students": 87, "mentors": ["Raximov Q.", "Sobirova L."], "phones": [{"text": "+998 91 918-08-98", "tel": "+998919180898"}, {"text": "+998 99 134-54-52", "tel": "+998991345452"}]},
    {"id": "t15", "initiativeId": 6, "name": "Sheva materiallarini yig‘ish va tadqiq qilish", "schedule": "Dushanba · 14:00", "place": "5-son TTJ", "students": 15, "mentors": ["Norbo‘tayeva Sh.R."], "phones": [{"text": "+998 97 792-18-84", "tel": "+998977921884"}]},
    {"id": "t16", "initiativeId": 3, "name": "Kompyuter lingvistikasi", "schedule": "Juma · 10:00", "place": "313-xona", "students": 14, "mentors": ["Sultonova D.A."], "phones": [{"text": "+998 93 468-24-60", "tel": "+998934682460"}]},
    {"id": "t17", "initiativeId": 4, "name": "Arab tili", "schedule": "Har oyning 3-juma kuni · 13:00", "place": "339-xona", "students": 10, "mentors": ["Bobojonova X.K."], "phones": [{"text": "+998 99 966-23-74", "tel": "+998999662374"}]},
    {"id": "t18", "initiativeId": 4, "name": "Fors tili", "schedule": "Har oyning 3-haftasi · 14:00", "place": "324-xona", "students": 15, "mentors": ["Rajabova Umida B."], "phones": [{"text": "+998 97 221-37-27", "tel": "+998972213727"}]},
    {"id": "t19", "initiativeId": 6, "name": "Xorazm shevashunosligi", "schedule": "Chorshanba · 13:00", "place": "339-xona", "students": 15, "mentors": ["Alimova Sh."], "phones": [{"text": "+998 94 316-48-30", "tel": "+998943164830"}]},
    {"id": "t20", "initiativeId": 6, "name": "Yosh tilshunoslar", "schedule": "Juma · 13:30", "place": "5-son TTJ", "students": 14, "mentors": ["Jumaniyozova D.M."], "phones": [{"text": "+998 99 576-41-24", "tel": "+998995764124"}]},
    {"id": "t21", "initiativeId": 6, "name": "Iqtidorli yoshlar", "schedule": "Har oyning 3-payshanba kuni · 14:00", "place": "338-xona", "students": 22, "mentors": ["Boymuratova X.A."], "phones": [{"text": "+998 93 743-69-79", "tel": "+998937436979"}]},
    {"id": "t22", "initiativeId": 6, "name": "Yosh folklorshunos", "schedule": "Har oyning 3-chorshanba kuni · 14:00", "place": "5-son TTJ", "students": 15, "mentors": ["Ochilova O.B."], "phones": [{"text": "+998 99 347-89-09", "tel": "+998993478909"}]},
    {"id": "t23", "initiativeId": 3, "name": "Tarmoq xavfsizligi va veb xavfsizlik", "schedule": "Payshanba · 10:30–11:50", "place": "Intellektual ilmlar va texnologiyalar fakulteti, Inkubatsiya markazi", "students": 25, "mentors": ["Matyaqubov Og‘abek Baxrombek o‘g‘li"], "phones": [{"text": "+998 93 750-10-95", "tel": "+998937501095"}]},
    {"id": "t24", "initiativeId": 3, "name": "Python dasturlash tili", "schedule": "Chorshanba, Juma · 16:00", "place": "Intellektual ilmlar va texnologiyalar fakulteti, Inkubatsiya markazi", "students": 24, "mentors": ["Boltayev Rustam"], "phones": [{"text": "+998 91 277-99-97", "tel": "+998912779997"}]},
    {"id": "t25", "initiativeId": 3, "name": "Algoritmlar va dasturlash", "schedule": "Juma (juft hafta) 10:30; Shanba (toq hafta) 14:00", "place": "5-son TTJ, 4-xona", "students": 26, "mentors": ["Madatov X.A."], "phones": [{"text": "+998 93 922-32-72", "tel": "+998939223272"}]},
    {"id": "t26", "initiativeId": 3, "name": "Artificial Intelligence and Machine Learning", "schedule": "Seshanba, Chorshanba · 14:00", "place": "5-son TTJ, 4-xona", "students": 25, "mentors": ["Mattiyev J.M."], "phones": [{"text": "+998 99 585-42-23", "tel": "+998995854223"}]},
    {"id": "t27", "initiativeId": 3, "name": "Tarmoq administratorligi", "schedule": "Chorshanba, Juma · 16:00", "place": "Intellektual ilmlar va texnologiyalar fakulteti, Inkubatsiya markazi", "students": 24, "mentors": ["Olimov Olimboy Otabekovich"], "phones": [{"text": "+998 90 738-90-07", "tel": "+998907389007"}]},
    {"id": "t28", "initiativeId": 3, "name": "Robototexnika", "schedule": "Chorshanba, Juma · 15:00", "place": "Intellektual ilmlar va texnologiyalar fakulteti, Inkubatsiya markazi", "students": 28, "mentors": ["Omonov Ibratbek"], "phones": [{"text": "+998 97 792-94-94", "tel": "+998977929494"}]},
    {"id": "t29", "initiativeId": 3, "name": "Kompyuter tarmoqlari", "schedule": "Dushanba · 14:00", "place": "Intellektual ilmlar va texnologiyalar fakulteti, Inkubatsiya markazi", "students": 20, "mentors": ["Matsapayev Jamshidbek"], "phones": [{"text": "+998 99 967-01-27", "tel": "+998999670127"}]},
    {"id": "t30", "initiativeId": 3, "name": "Dasturlash", "schedule": "Dushanba, Payshanba · 15:00", "place": "Intellektual ilmlar va texnologiyalar fakulteti, Inkubatsiya markazi", "students": 30, "mentors": ["Ibragimov Muhiddin Faxraddin o‘g‘li"], "phones": [{"text": "+998 97 759-15-32", "tel": "+998977591532"}]},
    {"id": "t31", "initiativeId": 3, "name": "Veb dasturlash", "schedule": "Payshanba · 14:00", "place": "Intellektual ilmlar va texnologiyalar fakulteti, Inkubatsiya markazi", "students": 25, "mentors": ["Sharipov Sirojbek Ravshanbek o‘g‘li"], "phones": [{"text": "+998 90 579-09-29", "tel": "+998905790929"}]},
    {"id": "t32", "initiativeId": 5, "name": "Pazandachilik", "schedule": "Chorshanba · 16:00", "place": "Texnopark", "students": 30, "mentors": ["Ochilova S."], "phones": [{"text": "+998 93 922-09-12", "tel": "+998939220912"}]},
    {"id": "t33", "initiativeId": 1, "name": "\"Art Decor\"", "schedule": "Juma · 14:00", "place": "XTF-107", "students": 30, "mentors": ["Xudayberganov Erkavoy Xaitbayevich"], "phones": [{"text": "+998 97 090-36-12", "tel": "+998970903612"}]},
    {"id": "t34", "initiativeId": 5, "name": "Matolarga naqsh berish va pardozlash", "schedule": "Juma · 16:00", "place": "XTF-109", "students": 15, "mentors": ["Matkarimova D.B."], "phones": [{"text": "+998 93 752-18-98", "tel": "+998937521898"}]},
    {"id": "t35", "initiativeId": 5, "name": "\"Libos konstruktor texnologi\"", "schedule": "Chorshanba · 16:00", "place": "QXMT-108", "students": 30, "mentors": ["Matchanova Gulrux Xaytmatovna"], "phones": [{"text": "+998 88 857-15-11", "tel": "+998888571511"}]},
    {"id": "t36", "initiativeId": 5, "name": "Milliy dizayn", "schedule": "Juma · 16:00", "place": "QXMT-107", "students": 30, "mentors": ["Salayeva Nozima Sultanovna"], "phones": [{"text": "+998 93 465-55-60", "tel": "+998934655560"}]},
    {"id": "t37", "initiativeId": 4, "name": "\"FoodTech English Club\"", "schedule": "Seshanba, Payshanba", "place": "", "students": null, "mentors": ["Sadullayeva Maftuna"], "phones": []},
    {"id": "t38", "initiativeId": 1, "name": "Talabalar teatr studiyasi", "schedule": "Seshanba · 16:00", "place": "TTJ ma’naviyat xonasi", "students": 9, "mentors": ["Artikova Manzura Atabayevna"], "phones": [{"text": "+998 91 424-21-12", "tel": "+998914242112"}]},
    {"id": "t39", "initiativeId": 3, "name": "Kompyuter texnologiyalari", "schedule": "", "place": "", "students": null, "mentors": ["Abdukarimov Zafarbek Anvarbekovich"], "phones": []},
    {"id": "t40", "initiativeId": 4, "name": "Yosh notiqlar", "schedule": "Payshanba · 12:00", "place": "QXMT-103", "students": 15, "mentors": ["Davletova Gulnora Atanazarovna"], "phones": [{"text": "+998 99 735-74-63", "tel": "+998997357463"}]},
    {"id": "t41", "initiativeId": 4, "name": "Zakovat", "schedule": "", "place": "", "students": null, "mentors": ["Nurmetov Sardor Baxtiyorovich"], "phones": []},
    {"id": "t42", "initiativeId": 2, "name": "Mini futbol", "schedule": "Chorshanba · 15:00", "place": "Fakultet sport maydoni", "students": 30, "mentors": ["Abdukarimov Zafarbek Anvarbekovich"], "phones": [{"text": "+998 99 968-81-80", "tel": "+998999688180"}]},
    {"id": "t43", "initiativeId": 6, "name": "Yosh texnolog", "schedule": "Chorshanba · 14:00", "place": "XTF-101 (konferensiya xonasi)", "students": 10, "mentors": ["Aitova Shaxlo Kamilovna"], "phones": [{"text": "+998 93 289-82-89", "tel": "+998932898289"}]},
    {"id": "t44", "initiativeId": 4, "name": "Turk tili", "schedule": "Dushanba, Chorshanba · 13:00", "place": "QXMT-105", "students": 25, "mentors": ["Otaboyeva Gulshanbonu Inoyat qizi"], "phones": [{"text": "+998 77 877-88-38", "tel": "+998778778838"}]},
    {"id": "t45", "initiativeId": 3, "name": "Smart Process AI", "schedule": "Chorshanba · 16:00", "place": "QXMT-106", "students": 20, "mentors": ["T.S.Saitmuratov"], "phones": []},
    {"id": "t46", "initiativeId": 6, "name": "Yosh faylasuflar", "schedule": "Chorshanba · 16:00", "place": "Tarix va huquq fakulteti, ARM 1-zal", "students": 33, "mentors": ["Kamilov Abror"], "phones": [{"text": "+998 90 559-95-59", "tel": "+998905599559"}]},
    {"id": "t47", "initiativeId": 4, "name": "Tarixni ruscha o‘rganamiz", "schedule": "Dushanba, Juma · 11:00", "place": "Tarix va huquq fakulteti, Besh tashabbus xonasi", "students": 15, "mentors": ["Aliyeva Oygul"], "phones": [{"text": "+998 93 721-83-82", "tel": "+998937218382"}]},
    {"id": "t48", "initiativeId": 6, "name": "Yosh sudyalar", "schedule": "Payshanba · 17:00", "place": "Tarix va huquq fakulteti, 408-xona", "students": 22, "mentors": ["Rahimberganov Sardor"], "phones": [{"text": "+998 95 575-44-11", "tel": "+998955754411"}]},
    {"id": "t49", "initiativeId": 5, "name": "Issiqxona va parnik xo‘jaligini tashkil etish", "schedule": "Juma · 13:30", "place": "TATU issiqxonasi", "students": 24, "mentors": ["Abdullayev Dadaxon Murodbekovich", "Yoqubov Diyorbek Zafar o‘g‘li"], "phones": [{"text": "+998 50 000-75-00", "tel": "+998500007500"}]},
    {"id": "t50", "initiativeId": 5, "name": "Gulchilik", "schedule": "Seshanba · 15:30", "place": "TATU issiqxonasi", "students": 24, "mentors": ["Ismayilova Intizor", "Babajanova Hulkar Madraximovna", "Urinova Dilfuza Djumabayevna"], "phones": [{"text": "+998 91 430-30-08", "tel": "+998914303008"}, {"text": "+998 90 438-72-35", "tel": "+998904387235"}]},
    {"id": "t51", "initiativeId": 6, "name": "Didaktik ko‘rgazmalar loyihalarini yaratish", "schedule": "Chorshanba · 15:30", "place": "5-son TTJ", "students": 24, "mentors": ["Matsaidova Sayyora Xudayberganovna"], "phones": [{"text": "+998 94 111-90-94", "tel": "+998941119094"}]},
    {"id": "t52", "initiativeId": 5, "name": "Buxgalteriya hisobi va audit", "schedule": "Payshanba · 16:00", "place": "Masofaviy shaklda (Telegram):, materiallar — t.me/+HHNXv7jcuC0wNzVi, savollar — t.me/urdubuxgaltertogaragi", "students": 100, "mentors": ["Saitmuratov Saitmurat (dotsent, PhD)", "Eshniyazova Yulduz (dotsent, PhD)"], "phones": [{"text": "+998 90 951-47-30", "tel": "+998909514730"}]},
    {"id": "t53", "initiativeId": 5, "name": "Yosh gidlar", "schedule": "Seshanba, Payshanba · 10:00", "place": "Universitet binosi", "students": 40, "mentors": ["To‘rayev Og‘abek Kaxramanovich", "Kuralbayev Jo‘rabek Aybekovich"], "phones": [{"text": "+998 95 771-44-77", "tel": "+998957714477"}]},
    {"id": "t54", "initiativeId": 6, "name": "Matematika 1-guruh", "schedule": "Dushanba 13:30–14:30; Seshanba 11:30–12:30; Payshanba 13:30–14:30", "place": "S-222, S-215", "students": 25, "mentors": ["J.U.Xujamov", "S.A.Bekmetova", "B.M.Sultanov"], "phones": [{"text": "+998 94 230-44-71", "tel": "+998942304471"}, {"text": "+998 97 211-95-67", "tel": "+998972119567"}, {"text": "+998 91 992-36-36", "tel": "+998919923636"}]},
    {"id": "t55", "initiativeId": 6, "name": "Matematika 2-guruh", "schedule": "Seshanba 10:30–11:30; Chorshanba 11:30–12:30; Payshanba 11:30–12:30; Juma 11:30–12:30", "place": "S-217, S-215", "students": 25, "mentors": ["R.A.Sharipov", "M.D.Vaisova", "J.SH.Abdullayev", "S.A.Bekmetova"], "phones": [{"text": "+998 94 230-18-80", "tel": "+998942301880"}, {"text": "+998 97 603-21-75", "tel": "+998976032175"}, {"text": "+998 91 435-88-07", "tel": "+998914358807"}, {"text": "+998 97 211-95-67", "tel": "+998972119567"}]},
    {"id": "t56", "initiativeId": 6, "name": "Matematika 3-guruh", "schedule": "Dushanba 11:30–12:30; Seshanba 15:30–16:30; Chorshanba 11:30–12:30; Juma 10:00–11:00", "place": "S-217", "students": 25, "mentors": ["J.SH.Abdullayev", "R.A.Sharipov", "B.M.Sultanov", "M.D.Vaisova"], "phones": [{"text": "+998 91 435-88-07", "tel": "+998914358807"}, {"text": "+998 94 230-18-80", "tel": "+998942301880"}, {"text": "+998 91 992-36-36", "tel": "+998919923636"}, {"text": "+998 97 603-21-75", "tel": "+998976032175"}]},
    {"id": "t57", "initiativeId": 6, "name": "Fizik innovator", "schedule": "Chorshanba 11:30–12:30; Juma 12:30–13:30", "place": "S-01B", "students": 28, "mentors": ["K.M.Ruzimov", "H.Sh.Matyoqubov"], "phones": [{"text": "+998 88 600-32-80", "tel": "+998886003280"}, {"text": "+998 97 511-21-88", "tel": "+998975112188"}]},
    {"id": "t58", "initiativeId": 1, "name": "\"Tabassum\" dutorchilar ansambli", "schedule": "Seshanba, Payshanba · 15:00", "place": "214-xona", "students": 15, "mentors": ["Matyakubova Umida G‘ayibayevna"], "phones": [{"text": "+998 97 608-83-55", "tel": "+998976088355"}]},
    {"id": "t59", "initiativeId": 1, "name": "\"Feruz\" ansambli", "schedule": "Dushanba · 14:00", "place": "112-xona", "students": 14, "mentors": ["Djumaniyazov Umrbek Maxsudovich"], "phones": [{"text": "+998 99 942-12-17", "tel": "+998999421217"}]},
    {"id": "t60", "initiativeId": 1, "name": "\"Navozanda\"", "schedule": "Chorshanba · 13:00", "place": "111-xona", "students": 10, "mentors": ["Matyoqubov Ergash G‘oyibboyevich"], "phones": [{"text": "+998 97 360-96-72", "tel": "+998973609672"}]},
    {"id": "t61", "initiativeId": 1, "name": "\"Yosh rassomlar\"", "schedule": "Payshanba · 14:00", "place": "S-01A", "students": 15, "mentors": ["Karimov Xamidbek Otaxanovich"], "phones": [{"text": "+998 97 858-21-71", "tel": "+998978582171"}]},
    {"id": "t62", "initiativeId": 1, "name": "\"Grafika\"", "schedule": "Payshanba · 13:00", "place": "S-01B", "students": 15, "mentors": ["Begnazarov Shamshir Marimbayevich"], "phones": [{"text": "+998 91 430-52-50", "tel": "+998914305250"}]},
    {"id": "t63", "initiativeId": 1, "name": "\"Dastgohli rangtasvir\"", "schedule": "Juma · 13:30", "place": "S-04A", "students": 14, "mentors": ["Kalandarov Shamsiddin Sitmamatovich"], "phones": [{"text": "+998 93 922-88-10", "tel": "+998939228810"}]},
    {"id": "t64", "initiativeId": 1, "name": "\"Amaliy san’at\"", "schedule": "Seshanba · 14:00", "place": "S-04B", "students": 22, "mentors": ["Safasheva Surayyo Sadikovna"], "phones": [{"text": "+998 88 779-44-18", "tel": "+998887794418"}]},
    {"id": "t65", "initiativeId": 6, "name": "\"Yosh psixologlar 1\"", "schedule": "Dushanba · 14:00", "place": "306-xona", "students": 15, "mentors": ["Pirjonov Sarvarbek Davlatovich"], "phones": [{"text": "+998 94 230-06-16", "tel": "+998942300616"}]},
    {"id": "t66", "initiativeId": 6, "name": "\"Yosh psixologlar 2\"", "schedule": "Dushanba · 14:00", "place": "312-xona", "students": 10, "mentors": ["Atamuratova Zamira Ikromovna"], "phones": [{"text": "+998 97 788-24-39", "tel": "+998977882439"}]},
    {"id": "t67", "initiativeId": 4, "name": "\"Zakovat\"", "schedule": "Chorshanba · 14:00", "place": "312-xona", "students": 40, "mentors": ["Xudayberganov Azizbek Obidjonovich"], "phones": [{"text": "+998 93 759-76-67", "tel": "+998937597667"}]},
    {"id": "t68", "initiativeId": 4, "name": "Book club", "schedule": "Ikki haftada bir juma · 11:30–13:30", "place": "ARM 506-xona, S-306", "students": 50, "mentors": ["Tillayeva Mohiniso Oybek qizi"], "phones": [{"text": "+998 99 874-25-02", "tel": "+998998742502"}]},
    {"id": "t69", "initiativeId": 4, "name": "Adabiy tanqidchilik", "schedule": "Ikki haftada bir chorshanba · 11:30–13:30", "place": "ARM 506-xona, S-306", "students": 50, "mentors": ["Saparbayeva Gulandom Masharipovna"], "phones": [{"text": "+998 93 921-65-95", "tel": "+998939216595"}]},
    {"id": "t70", "initiativeId": 4, "name": "Erfolg hat 3 Buchstaben: TUN", "schedule": "Payshanba · 14:00", "place": "5-son TTJ, 5-xona", "students": 13, "mentors": ["Qilicheva Shahlo Marksovna"], "phones": [{"text": "93-280-99-6", "tel": ""}]},
    {"id": "t71", "initiativeId": 4, "name": "Oui, je parle français", "schedule": "Seshanba · 11:00", "place": "5-son TTJ, 5-xona", "students": 10, "mentors": ["Navruzova Mutabar"], "phones": [{"text": "+998 97 605-14-95", "tel": "+998976051495"}]},
    {"id": "t72", "initiativeId": 4, "name": "Translation studies", "schedule": "Chorshanba · 15:00", "place": "Smart-418", "students": 29, "mentors": ["Xusainova Shaxnozabonu"], "phones": [{"text": "+998 91 277-78-68", "tel": "+998912777868"}]},
    {"id": "t73", "initiativeId": 6, "name": "Grant academy", "schedule": "Seshanba 11:30; Chorshanba 13:30", "place": "Asosiy-449", "students": 25, "mentors": ["Eshchanova Mavjuda Xudayorovna"], "phones": [{"text": "+998 99 983-48-22", "tel": "+998999834822"}]},
    {"id": "t74", "initiativeId": 6, "name": "Research writers", "schedule": "Seshanba · 14:30", "place": "Asosiy-418", "students": 25, "mentors": ["Qalandarova Dilfuza"], "phones": [{"text": "+998 97 761-22-10", "tel": "+998977612210"}]},
    {"id": "t75", "initiativeId": 4, "name": "English Literature, Art and Translation", "schedule": "Juma · 11:30", "place": "ARM", "students": 20, "mentors": ["Sapayeva Bibijon Rustamovna"], "phones": [{"text": "+998 93 921-59-89", "tel": "+998939215989"}]}
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
SITE.groups = SITE.initiatives.concat(SITE.extraGroups);

/* Har bir tashabbus/guruh uchun to'garaklar va o'quvchilar soni to'garaklar ro'yxatidan hisoblanadi */
SITE.recompute = function () {
  SITE.groups.forEach((g) => {
    const list = SITE.clubs.filter((c) => c.initiativeId === g.id);
    g.clubsCount = list.length;
    g.students = list.reduce((s, c) => s + (c.students || 0), 0);
  });
  SITE.totals = {
    clubs: SITE.clubs.length,
    students: SITE.clubs.reduce((s, c) => s + (c.students || 0), 0),
    awards: SITE.initiatives.reduce((s, i) => s + i.awards, 0),
    activeContests: SITE.contests.filter((c) => c.status === "active" && new Date(c.deadline + "T23:59:59") >= new Date()).length
  };
};
SITE.recompute();

/* Serverda dashboard bo'lsa, to'garaklar va tanlovlar u yerdan olinadi.
   Server javob bermasa, shu fayldagi ro'yxat ishlatiladi. */
SITE.load = async function () {
  try {
    const get = (k) => fetch(`api/${k}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));
    const [clubs, contests] = await Promise.all([get("clubs"), get("contests")]);
    if (Array.isArray(clubs)) SITE.clubs = clubs;
    if (Array.isArray(contests)) SITE.contests = contests;
    SITE.recompute();
  } catch (e) {
    /* API yo'q (masalan, oddiy statik server) — data.js dagi ro'yxat qoladi */
  }
};
