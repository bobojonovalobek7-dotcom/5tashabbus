/**
 * Urganch Davlat Universiteti — 5 Muhim Tashabbus
 * Interactive Quiz: "Qaysi Tashabbus Sizga Mos?"
 */

class TashabbusQuiz {
  constructor() {
    this.currentStep = 0;
    this.answers = [];
    this.questions = URDUDATA.quizQuestions;

    this.container = document.getElementById('quiz-dynamic-box');
    this.progressBar = document.getElementById('quiz-progress-fill');
    this.stepCounter = document.getElementById('quiz-step-counter');

    this.init();
  }

  init() {
    if (!this.container) return;
    this.renderQuestion();
  }

  renderQuestion() {
    const q = this.questions[this.currentStep];
    const total = this.questions.length;
    const progressPercent = ((this.currentStep + 1) / total) * 100;

    if (this.progressBar) this.progressBar.style.width = `${progressPercent}%`;
    if (this.stepCounter) this.stepCounter.textContent = `${this.currentStep + 1} / ${total} - Savol`;

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
      <li style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:rgba(255,255,255,0.1);border-radius:8px;margin-bottom:6px;">
        <span><strong>${c.name}</strong> (${c.category})</span>
        <button class="icon-btn-sm" onclick="window.registrationManager.openWithInitiative(${winner.id}, '${c.id}')">Tanlash</button>
      </li>
    `).join('');

    this.container.innerHTML = `
      <div class="quiz-result-view">
        <div class="quiz-result-icon">
          <i class="${winner.icon}"></i>
        </div>
        <div class="hero-badge" style="background:${winner.color};color:#fff;margin:0 auto 12px;">
          ${winner.number} — ${winner.title}
        </div>
        <h3 class="quiz-result-title">Sizga Eng Mos Yo'nalish Topildi!</h3>
        <p class="quiz-result-desc">
          Sizning shaxsiy qiziqishingiz va intilishlaringiz UrDU <strong>${winner.number}: ${winner.title}</strong> yo'nalishiga 100% mos keladi. Quyidagi to'garaklarda siz o'z salohiyatingizni to'liq namoyon eta olasiz!
        </p>

        <div style="max-width:500px;margin:0 auto 24px;text-align:left;">
          <h5 style="font-size:0.85rem;color:#A4F1D7;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;">Sizga Tavsiya Qilingan To'garaklar:</h5>
          <ul style="list-style:none;">${clubsListHtml}</ul>
        </div>

        <div class="quiz-result-actions">
          <button class="btn-hero-primary" onclick="window.registrationManager.openWithInitiative(${winner.id})">
            <i class="fa-solid fa-file-signature"></i> Ushbu Tashabbus To'garagiga Yozilish
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
