/**
 * Urganch Davlat Universiteti — 5 Muhim Tashabbus
 * Online Registration & Digital ID Pass Generator
 */

class RegistrationManager {
  constructor() {
    this.modal = document.getElementById('registration-modal');
    this.idCardModal = document.getElementById('idcard-modal');
    this.form = document.getElementById('registration-form');
    this.initiativeSelect = document.getElementById('reg-initiative');
    this.clubSelect = document.getElementById('reg-club');

    this.init();
  }

  init() {
    if (!this.form) return;

    this.populateInitiatives();
    this.bindEvents();
  }

  populateInitiatives() {
    if (!this.initiativeSelect) return;

    this.initiativeSelect.innerHTML = `<option value="">-- Tashabbusni tanlang --</option>` +
      URDUDATA.initiatives.map(init => `
        <option value="${init.id}">${init.number}: ${init.title}</option>
      `).join('');
  }

  populateClubs(initiativeId, preselectClubId = null) {
    if (!this.clubSelect) return;

    const filtered = URDUDATA.clubs.filter(c => c.initiativeId === parseInt(initiativeId, 10));

    if (filtered.length === 0) {
      this.clubSelect.innerHTML = `<option value="">Bu tashabbus bo'yicha to'garak tanlang</option>`;
      return;
    }

    this.clubSelect.innerHTML = `<option value="">-- To'garakni tanlang --</option>` +
      filtered.map(c => `
        <option value="${c.id}" ${preselectClubId === c.id ? 'selected' : ''}>${c.name} (${c.category})</option>
      `).join('');
  }

  bindEvents() {
    if (this.initiativeSelect) {
      this.initiativeSelect.addEventListener('change', (e) => {
        this.populateClubs(e.target.value);
      });
    }

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });
  }

  openWithInitiative(initiativeId, clubId = null) {
    this.populateInitiatives();
    if (this.initiativeSelect) {
      this.initiativeSelect.value = initiativeId;
      this.populateClubs(initiativeId, clubId);
    }
    const modalTitle = document.querySelector('#registration-modal .modal-header-banner h3');
    if (modalTitle) {
      modalTitle.innerHTML = `<i class="fa-solid fa-file-pen"></i> To'garakka Onlayn A'zo Bo'lish`;
    }
    this.openModal();
  }

  openWithContest(contestId, contestTitle, initiativeId) {
    this.populateInitiatives();
    if (this.initiativeSelect) {
      this.initiativeSelect.value = initiativeId || 3;
      this.populateClubs(initiativeId || 3);
    }
    const modalTitle = document.querySelector('#registration-modal .modal-header-banner h3');
    if (modalTitle) {
      modalTitle.innerHTML = `<i class="fa-solid fa-trophy"></i> Tanlovga Qatnashish: ${contestTitle}`;
    }
    this.openModal();
  }

  openModal() {
    if (this.modal) {
      this.modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  closeIdCardModal() {
    if (this.idCardModal) {
      this.idCardModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  handleFormSubmit() {
    const fullName = document.getElementById('reg-fullname').value.trim();
    const studentId = document.getElementById('reg-studentid').value.trim();
    const faculty = document.getElementById('reg-faculty').value;
    const course = document.getElementById('reg-course').value;
    const phone = document.getElementById('reg-phone').value.trim();
    const initiativeId = parseInt(this.initiativeSelect.value, 10);
    const clubId = this.clubSelect.value;

    if (!fullName || !phone || !initiativeId || !clubId) {
      window.appUI.showToast("Iltimos, barcha majburiy maydonlarni to'ldiring!", "error");
      return;
    }

    const initObj = URDUDATA.initiatives.find(i => i.id === initiativeId);
    const clubObj = URDUDATA.clubs.find(c => c.id === clubId);

    const registrationId = `URDU-5T-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const passData = {
      id: registrationId,
      fullName,
      studentId: studentId || "Talaba",
      faculty,
      course,
      phone,
      initiativeTitle: `${initObj.number}: ${initObj.title}`,
      clubName: clubObj.name,
      clubSchedule: clubObj.schedule,
      date: new Date().toLocaleDateString('uz-UZ'),
      status: "Tasdiqlangan"
    };

    // Save to LocalStorage
    try {
      const saved = JSON.parse(localStorage.getItem('urdu_5t_passes') || '[]');
      saved.unshift(passData);
      localStorage.setItem('urdu_5t_passes', JSON.stringify(saved));
    } catch(err) {
      console.warn("LocalStorage save error", err);
    }

    this.closeModal();
    this.form.reset();
    this.renderDigitalIdPass(passData);
    window.appUI.showToast("Tabriklaymiz! To'garakka a'zo bo'ldingiz va talabalik pass kartasi yaratildi! 🎉");
  }

  renderDigitalIdPass(data) {
    const passContainer = document.getElementById('pass-render-box');
    if (!passContainer) return;

    // Use quick QR code generator API for official presentation
    const qrText = encodeURIComponent(`URDU-5-TASHABBUS|PASS:${data.id}|TALABA:${data.fullName}|TOGARAK:${data.clubName}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrText}&color=085041`;

    passContainer.innerHTML = `
      <div class="id-card-view-wrapper" id="printable-id-card">
        <div class="student-pass-card">
          <div class="pass-card-header">
            <div class="pass-card-logo-group">
              <img src="assets/images/urdu_logo.png" alt="UrDU Logo" class="pass-card-logo">
              <div class="pass-card-titles">
                <h4>Urganch Davlat Universiteti</h4>
                <p>5 Muhim Tashabbus Markazi A'zosi</p>
              </div>
            </div>
            <div class="pass-card-chip"></div>
          </div>

          <div class="pass-card-body">
            <div>
              <h3 class="pass-student-name">${data.fullName}</h3>
              <div class="pass-meta-row"><strong>ID KODI:</strong> ${data.id}</div>
              <div class="pass-meta-row"><strong>Fakultet:</strong> ${data.faculty} (${data.course}-bosqich)</div>
              <div class="pass-meta-row"><strong>Tashabbus:</strong> ${data.initiativeTitle}</div>
              <div class="pass-meta-row"><strong>To'garak:</strong> ${data.clubName}</div>
              <div class="pass-meta-row"><strong>Dars vaqti:</strong> ${data.clubSchedule}</div>
            </div>
            <div class="pass-qr-box">
              <img src="${qrUrl}" alt="Pass QR Code" class="pass-qr-img" onerror="this.src='assets/images/urdu_logo.png'">
            </div>
          </div>

          <div class="pass-card-footer">
            <span>Berilgan sana: ${data.date}</span>
            <span style="color:#A4F1D7;font-weight:700;"><i class="fa-solid fa-circle-check"></i> Rasmiy Ro'yxatdan O'tgan</span>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:12px;justify-content:center;margin-top:18px;">
        <button class="btn-primary-action" onclick="window.print()">
          <i class="fa-solid fa-print"></i> Guvohnomani Chop Etish
        </button>
        <button class="btn-hero-secondary" style="color:var(--text-primary);border-color:var(--border);" onclick="window.registrationManager.closeIdCardModal()">
          Yopish
        </button>
      </div>
    `;

    if (this.idCardModal) {
      this.idCardModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.registrationManager = new RegistrationManager();
});
