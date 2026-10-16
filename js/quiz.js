/**
 * Urganch Davlat Universiteti — 5 Muhim Tashabbus
 * Interactive Quiz: "Qaysi Tashabbus Sizga Mos?" (Multi-language UZ, OZ, RU, EN)
 */

class TashabbusQuiz {
  constructor() {
    this.currentStep = 0;
    this.answers = [];
    this.currentLang = localStorage.getItem('urdu_lang') || 'uz';

    this.container = document.getElementById('quiz-dynamic-box');
    this.progressBar = document.getElementById('quiz-progress-fill');
    this.stepCounter = document.getElementById('quiz-step-counter');

    this.translations = {
      uz: [
        {
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
          question: "Universitetda qanday yutuqqa erishish siz uchun eng faxrli bo'lar edi?",
          options: [
            { text: "Katta sahnada rol ijro etish yoki ko'rgazmada o'z asarimni namoyish qilish", initiativeId: 1 },
            { text: "Universiada chempioni bo'lish va universitet bayrog'ini baland ko'tarish", initiativeId: 2 },
            { text: "Innovatsion startap yaratib, Respublika hakatonida g'olib bo'lish", initiativeId: 3 },
            { text: "\"Eng faol kitobxon talaba\" unvoniga erishish va shaxsiy kutubxona yaratish", initiativeId: 4 },
            { text: "O'z shaxsiy brendimni yaratish va talabalik davridayoq daromadga chiqish", initiativeId: 5 }
          ]
        },
        {
          question: "Do'stlaringiz sizni odatda qaysi xususiyatingiz uchun ko'proq qadrlashadi?",
          options: [
            { text: "Ijodkorlik, nozik did va badiiy his-tuyg'ularim uchun", initiativeId: 1 },
            { text: "Harakatchanlik, iroda va jamoaviy birdamligim uchun", initiativeId: 2 },
            { text: "Mantiqiy fikrlash, texnik masalalarni oson yecha olishim uchun", initiativeId: 3 },
            { text: "Keng dunyoqarash, ko'p kitob o'qiganim va chiroyli so'zlay olishim uchun", initiativeId: 4 },
            { text: "Pishiq-puxtalik, tejamkorlik va amaliy foydali narsalar yarata olishim uchun", initiativeId: 5 }
          ]
        },
        {
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
      ru: [
        {
          question: "Чем вам больше всего нравится заниматься в свободное время?",
          options: [
            { text: "Слушать музыку, играть на инструментах или рисовать", initiativeId: 1 },
            { text: "Бегать, играть в футбол/волейбол или играть в шахматы", initiativeId: 2 },
            { text: "Писать код на компьютере, тестировать новые приложения и технологии", initiativeId: 3 },
            { text: "Читать художественные или научные книги, делиться мнениями", initiativeId: 4 },
            { text: "Рукоделие, кулинария, дизайн или создание бизнес-идей", initiativeId: 5 }
          ]
        },
        {
          question: "Какое достижение в университете было бы для вас самым почетным?",
          options: [
            { text: "Выступить на большой сцене или выставить свои картины", initiativeId: 1 },
            { text: "Стать чемпионом Универсиады и поднять флаг университета", initiativeId: 2 },
            { text: "Создать инновационный стартап и победить в Республиканском хакатоне", initiativeId: 3 },
            { text: "Получить звание «Самый активный читатель» университета", initiativeId: 4 },
            { text: "Создать собственный бренд и начать зарабатывать уже в студенческие годы", initiativeId: 5 }
          ]
        },
        {
          question: "За какое качество ваши друзья ценят вас больше всего?",
          options: [
            { text: "Творческий подход, хороший вкус и артистизм", initiativeId: 1 },
            { text: "Энергичность, целеустремленность и командный дух", initiativeId: 2 },
            { text: "Логическое мышление и умение решать технические задачи", initiativeId: 3 },
            { text: "Широкий кругозор, эрудицию и грамотную речь", initiativeId: 4 },
            { text: "Практичность, аккуратность и полезные практические навыки", initiativeId: 5 }
          ]
        },
        {
          question: "Какой навык вы хотите развить в 10 раз за ближайший год?",
          options: [
            { text: "Актерское мастерство, вокал или создание произведений искусства", initiativeId: 1 },
            { text: "Физическую силу, спортивное мастерство и дисциплину", initiativeId: 2 },
            { text: "Программирование, кибербезопасность и искусственный интеллект", initiativeId: 3 },
            { text: "Ораторское искусство, критическое мышление и богатый словарный запас", initiativeId: 4 },
            { text: "Ремесло, современный дизайн и предпринимательство", initiativeId: 5 }
          ]
        }
      ],
      en: [
        {
          question: "What do you enjoy doing the most during your free time?",
          options: [
            { text: "Listening to music, playing instruments or sketching artwork", initiativeId: 1 },
            { text: "Running, playing sports, fitness workouts or chess", initiativeId: 2 },
            { text: "Coding software, exploring AI and testing new tech apps", initiativeId: 3 },
            { text: "Reading fiction, philosophy or science books and discussing ideas", initiativeId: 4 },
            { text: "Crafting, culinary arts, fashion design or crafting business ideas", initiativeId: 5 }
          ]
        },
        {
          question: "Which achievement at the university would make you proudest?",
          options: [
            { text: "Performing on a big stage or exhibiting your own artwork", initiativeId: 1 },
            { text: "Becoming a sports champion representing UrDU internationally", initiativeId: 2 },
            { text: "Launching a tech startup and winning a national hackathon", initiativeId: 3 },
            { text: "Earning the title of Top Book Reader and orator of the year", initiativeId: 4 },
            { text: "Building an independent business brand while still a student", initiativeId: 5 }
          ]
        },
        {
          question: "What trait do your friends appreciate about you the most?",
          options: [
            { text: "Creativity, artistic sensitivity and distinct taste", initiativeId: 1 },
            { text: "High energy, determination and strong team spirit", initiativeId: 2 },
            { text: "Sharp analytical thinking and problem-solving skills", initiativeId: 3 },
            { text: "Vast knowledge, articulacy and love for books", initiativeId: 4 },
            { text: "Practicality, craftsmanship and useful hands-on abilities", initiativeId: 5 }
          ]
        },
        {
          question: "Which skill would you like to multiply 10x over the next year?",
          options: [
            { text: "Acting, vocal arts or fine arts mastery", initiativeId: 1 },
            { text: "Athletic performance, physical fitness and discipline", initiativeId: 2 },
            { text: "Software engineering, cybersecurity and Artificial Intelligence", initiativeId: 3 },
            { text: "Public speaking, debate rhetoric and extensive vocabulary", initiativeId: 4 },
            { text: "Professional craftsmanship, fashion design and business revenue", initiativeId: 5 }
          ]
        }
      ],
      oz: [
        {
          question: "Бўш вақтингиз бўлганда энг кўп нима билан шуғулланиш сизга роҳат бағишлайди?",
          options: [
            { text: "Мусиқа тинглаш, гитара/дутор чалиш ёки чизмачилик қилиш", initiativeId: 1 },
            { text: "Югуриш, тўп ўйнаш, турникда машқ қилиш ёки шахмат суриш", initiativeId: 2 },
            { text: "Компьютерда код ёзиш, янги иловалар ва технологияларни синаш", initiativeId: 3 },
            { text: "Қизиқарли бадиий асар ёки илмий китоб ўқиш, фикр алмашиш", initiativeId: 4 },
            { text: "Қўл меҳнати, тикувчилик, пазандачилик ёки янги бизнес ғоялар тузиш", initiativeId: 5 }
          ]
        },
        {
          question: "Университетда қандай ютуққа эришиш сиз учун энг фахрли бўлар эди?",
          options: [
            { text: "Катта саҳнада рол ижро этиш ёки кўргазмада ўз асаримни намойиш қилиш", initiativeId: 1 },
            { text: "Универсиада чемпиони бўлиш ва университет байроғини баланд кўтариш", initiativeId: 2 },
            { text: "Инновацион стартап яратиб, Республика хакатонида ғолиб бўлиш", initiativeId: 3 },
            { text: "«Энг фаол китобхон талаба» унвонига эришиш ва шахсий кутубхона яратиш", initiativeId: 4 },
            { text: "Ўз шахсий брендимни яратиш ва талабалик давридаёқ даромадга чиқиш", initiativeId: 5 }
          ]
        },
        {
          question: "Дўстларингиз сизни одатда қайси хусусиятингиз учун кўпроқ қадрлашади?",
          options: [
            { text: "Ижодкорлик, нозик дид ва бадиий ҳис-туйғуларим учун", initiativeId: 1 },
            { text: "Ҳаракатчанлик, ирода ва жамоавий бирдамлигим учун", initiativeId: 2 },
            { text: "Мантиқий фикрлаш, техник масалаларни осон еча олишим учун", initiativeId: 3 },
            { text: "Кенг дунёқараш, кўп китоб ўқиганим ва чиройли сўзлай олишим учун", initiativeId: 4 },
            { text: "Пишиқ-пухталик, тежамкорлик ва амалий фойдали нарсалар ярата олишим учун", initiativeId: 5 }
          ]
        },
        {
          question: "Келгуси 1 йил ичида қайси кўникмангизни 10 баробарга оширишни хоҳлайсиз?",
          options: [
            { text: "Актёрлик, вокал ёки санъат асари яратиш қобилиятини", initiativeId: 1 },
            { text: "Жисмоний куч, спорт маҳорати ва темир интизомни", initiativeId: 2 },
            { text: "Дастурлаш, киберхавфсизлик ва сунъий интеллект технологияларини", initiativeId: 3 },
            { text: "Нотиқлик, танқидий фикрлаш ва бой сўз бойлигини", initiativeId: 4 },
            { text: "Касб-ҳунар, дизайн ва мустақил даромад топиш йўлларини", initiativeId: 5 }
          ]
        }
      ]
    };

    this.init();
  }

  get questions() {
    return this.translations[this.currentLang] || this.translations.uz;
  }

  setLanguage(lang) {
    this.currentLang = lang;
    this.renderQuestion();
  }

  init() {
    if (!this.container) return;
    this.renderQuestion();
  }

  renderQuestion() {
    if (!this.container) return;
    const qList = this.questions;
    const q = qList[this.currentStep] || qList[0];
    const total = qList.length;
    const progressPercent = ((this.currentStep + 1) / total) * 100;

    const labelMap = {
      uz: { step: "Savol", accuracy: "Aniqlik darajasi: Yuqori" },
      oz: { step: "Савол", accuracy: "Аниқлик даражаси: Юқори" },
      ru: { step: "Вопрос", accuracy: "Точность: Высокая" },
      en: { step: "Question", accuracy: "Accuracy: High" }
    };
    const labels = labelMap[this.currentLang] || labelMap.uz;

    if (this.progressBar) this.progressBar.style.width = `${progressPercent}%`;
    if (this.stepCounter) this.stepCounter.textContent = `${this.currentStep + 1} / ${total} - ${labels.step}`;

    let optionsHtml = q.options.map((opt, idx) => `
      <button type="button" class="quiz-option-btn" data-initiative="${opt.initiativeId}" onclick="window.quizInstance.selectOption(${opt.initiativeId})">
        <span class="quiz-option-marker">${String.fromCharCode(65 + idx)}</span>
        <span class="quiz-option-text">${opt.text}</span>
      </button>
    `).join('');

    this.container.innerHTML = `
      <div class="quiz-step-box">
        <h4 class="quiz-question-title">${q.question}</h4>
        <div class="quiz-options-list">
          ${optionsHtml}
        </div>
      </div>
    `;
  }

  selectOption(initiativeId) {
    this.answers.push(initiativeId);

    if (this.currentStep < this.questions.length - 1) {
      this.currentStep++;
      this.renderQuestion();
    } else {
      this.showResult();
    }
  }

  calculateBestInitiative() {
    const counts = {};
    this.answers.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    });

    let bestId = 1;
    let maxCount = 0;
    for (const [id, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        bestId = parseInt(id, 10);
      }
    }
    return URDUDATA.initiatives.find(init => init.id === bestId) || URDUDATA.initiatives[0];
  }

  showResult() {
    const winner = this.calculateBestInitiative();
    const recommendedClubs = URDUDATA.clubs.filter(c => c.initiativeId === winner.id).slice(0, 2);

    if (this.progressBar) this.progressBar.style.width = `100%`;
    if (this.stepCounter) this.stepCounter.textContent = "Natija Tayyor! 🎉";

    let clubsListHtml = recommendedClubs.map(c => `
      <li style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.1);border-radius:8px;margin-bottom:8px;">
        <span><strong>${c.name}</strong> (${c.category})</span>
        <button class="btn-primary-action" style="padding:4px 12px;font-size:0.8rem;" onclick="window.registrationManager.openWithInitiative(${winner.id}, '${c.id}')">Tanlash</button>
      </li>
    `).join('');

    this.container.innerHTML = `
      <div class="quiz-result-view">
        <div class="quiz-result-icon">
          <i class="${winner.icon}"></i>
        </div>
        <div class="hero-badge" style="background:${winner.color};color:#fff;margin:0 auto 12px;display:inline-block;padding:6px 16px;border-radius:9999px;">
          ${winner.number} — ${winner.title}
        </div>
        <h3 class="quiz-result-title">Sizga Eng Mos Yo'nalish Aniqlanildi!</h3>
        <p class="quiz-result-desc">
          Sizning shaxsiy qiziqishingiz va intilishlaringiz UrDU <strong>${winner.number}: ${winner.title}</strong> yo'nalishiga 100% mos keladi. Quyidagi to'garaklarda o'z iste'dodingizni to'liq ro'yobga chiqarishingiz mumkin!
        </p>

        <div style="max-width:540px;margin:0 auto 24px;text-align:left;">
          <h5 style="font-size:0.85rem;color:#A4F1D7;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.05em;">Sizga Tavsiya Qilingan To'garaklar:</h5>
          <ul style="list-style:none;padding:0;">${clubsListHtml}</ul>
        </div>

        <div class="quiz-result-actions" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <button class="btn-hero-primary" onclick="window.registrationManager.openWithInitiative(${winner.id})">
            <i class="fa-solid fa-file-signature"></i> To'garakka A'zo Bo'lish
          </button>
          <button class="btn-hero-secondary" onclick="window.quizInstance.restart()">
            <i class="fa-solid fa-arrow-rotate-right"></i> Qaytadan Sinash
          </button>
        </div>
      </div>
    `;
  }

  restart() {
    this.currentStep = 0;
    this.answers = [];
    this.renderQuestion();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.quizInstance = new TashabbusQuiz();
});
