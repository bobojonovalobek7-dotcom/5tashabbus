/**
 * Urganch Davlat Universiteti — 5 Muhim Tashabbus
 * Core Application Logic, Translations & Interactivity
 */

class UrDU5TashabbusApp {
  constructor() {
    this.currentLang = localStorage.getItem('urdu_lang') || 'uz';
    this.activeInitiativeId = 1;
    this.activeClubFilter = 'all';
    this.activeEventFilter = 'all';
    this.clubsSearchTerm = '';

    this.init();
  }

  init() {
    this.initTheme();
    this.initAccessibility();
    this.initLanguage();
    this.renderInitiativeTabs();
    this.renderInitiativeHero(1);
    this.renderClubsCatalog();
    this.renderEvents();
    this.renderLeaderboard();
    this.renderFAQ();
    this.bindGlobalEvents();
    this.initSearchOverlay();
  }

  /* -------------------------------------------------------------
     LANGUAGE SYSTEM (UZ, OZ, RU, EN)
     ------------------------------------------------------------- */
  initLanguage() {
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const selected = btn.getAttribute('data-lang');
        if (selected) {
          this.setLanguage(selected);
        }
      });
    });

    this.applyTranslations(this.currentLang, false);
  }

  setLanguage(lang) {
    if (!TRANSLATIONS[lang]) lang = 'uz';
    this.currentLang = lang;
    localStorage.setItem('urdu_lang', lang);

    this.applyTranslations(lang, true);
  }

  applyTranslations(lang, showNotification = true) {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.uz;

    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Update all static data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        el.textContent = t[key];
      }
    });

    // Update search placeholder
    const searchInput = document.getElementById('clubs-search-input');
    if (searchInput && t.clubsSearchPlaceholder) {
      searchInput.placeholder = t.clubsSearchPlaceholder;
    }

    // Re-render dynamic sections with new language
    this.renderInitiativeTabs();
    this.renderInitiativeHero(this.activeInitiativeId);
    this.renderClubsCatalog();

    if (showNotification) {
      this.showToast(t.toastLangChanged || "Til o'zgartirildi");
    }
  }

  /* -------------------------------------------------------------
     THEME (Dark / Light Mode)
     ------------------------------------------------------------- */
  initTheme() {
    const savedTheme = localStorage.getItem('urdu_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('urdu_theme', next);
        this.updateThemeIcon(next);
        this.showToast(`Mavzu: ${next === 'dark' ? 'Qorong\'i (Dark)' : 'Yorug\' (Light)'} rejimiga o'zgartirildi`);
      });
    }
  }

  updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle-btn i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }

  /* -------------------------------------------------------------
     ACCESSIBILITY PANEL (UrDU style: A-, A, A+, Contrast, Grayscale)
     ------------------------------------------------------------- */
  initAccessibility() {
    const triggers = [document.getElementById('a11y-trigger'), document.getElementById('a11y-floating-btn')].filter(Boolean);
    const panel = document.getElementById('a11y-panel');
    const closeBtn = document.getElementById('a11y-close');

    if (panel && triggers.length > 0) {
      triggers.forEach(trig => {
        trig.addEventListener('click', (e) => {
          e.stopPropagation();
          panel.classList.toggle('open');
        });
      });

      if (closeBtn) {
        closeBtn.addEventListener('click', () => panel.classList.remove('open'));
      }

      document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !triggers.includes(e.target) && !triggers.some(t => t.contains(e.target))) {
          panel.classList.remove('open');
        }
      });
    }

    // Font Sizing Buttons
    document.querySelectorAll('[data-font-size]').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.getAttribute('data-font-size');
        document.body.classList.remove('font-sm', 'font-md', 'font-lg', 'font-xl');
        document.body.classList.add(`font-${size}`);
        document.querySelectorAll('[data-font-size]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.showToast(`Shrift o'lchami o'zgartirildi`);
      });
    });

    // High Contrast Mode Toggle
    const contrastBtn = document.getElementById('a11y-contrast-toggle');
    if (contrastBtn) {
      contrastBtn.addEventListener('click', () => {
        document.body.classList.toggle('mode-contrast');
        contrastBtn.classList.toggle('active');
        this.showToast("Yuqori kontrast rejimi almashtirildi");
      });
    }

    // Grayscale Mode Toggle
    const grayscaleBtn = document.getElementById('a11y-grayscale-toggle');
    if (grayscaleBtn) {
      grayscaleBtn.addEventListener('click', () => {
        document.body.classList.toggle('mode-grayscale');
        grayscaleBtn.classList.toggle('active');
        this.showToast("Monoxrom (Oq-qora) rejimi almashtirildi");
      });
    }
  }

  /* -------------------------------------------------------------
     5 TASHABBUS TABS & IN-DEPTH SHOWCASE
     ------------------------------------------------------------- */
  getInitiativeMeta(id) {
    const t = TRANSLATIONS[this.currentLang] || TRANSLATIONS.uz;
    const transList = t.initiatives || TRANSLATIONS.uz.initiatives;
    const trans = transList.find(i => i.id === id);
    const orig = URDUDATA.initiatives.find(i => i.id === id) || URDUDATA.initiatives[0];

    return {
      ...orig,
      number: trans ? trans.number : orig.number,
      title: trans ? trans.title : orig.title
    };
  }

  renderInitiativeTabs() {
    const container = document.getElementById('tashabbus-quick-pills');
    if (!container) return;

    container.innerHTML = URDUDATA.initiatives.map(init => {
      const meta = this.getInitiativeMeta(init.id);
      return `
        <button type="button" class="quick-pill-btn ${init.id === this.activeInitiativeId ? 'active' : ''}" 
                data-id="${init.id}" onclick="window.appUI.switchInitiative(${init.id})">
          <div class="pill-icon" style="color:${init.color}">
            <i class="${init.icon}"></i>
          </div>
          <div class="pill-text">
            <span class="pill-num">${meta.number}</span>
            <span class="pill-title">${meta.title}</span>
          </div>
        </button>
      `;
    }).join('');
  }

  switchInitiative(id) {
    this.activeInitiativeId = id;
    this.renderInitiativeTabs();
    this.renderInitiativeHero(id);
  }

  renderInitiativeHero(id) {
    const container = document.getElementById('initiative-hero-target');
    if (!container) return;

    const init = this.getInitiativeMeta(id);

    const highlightsHtml = init.highlights.map(h => `
      <li><i class="fa-solid fa-circle-check"></i> <span>${h}</span></li>
    `).join('');

    const t = TRANSLATIONS[this.currentLang] || TRANSLATIONS.uz;
    const enrollText = this.currentLang === 'ru' ? 'Вступить в это направление' : (this.currentLang === 'en' ? 'Join this Initiative' : (this.currentLang === 'oz' ? 'Ушбу Ташаббусга Аъзо Бўлиш' : 'Ushbu Tashabbusga A\'zo Bo\'lish'));
    const viewClubsText = this.currentLang === 'ru' ? 'Все кружки направления' : (this.currentLang === 'en' ? 'View All Clubs' : (this.currentLang === 'oz' ? 'Барча Тўгаракларни Кўриш' : 'Barcha To\'garaklarni Ko\'rish'));

    container.innerHTML = `
      <div class="initiative-card-hero" style="border-top:4px solid ${init.color};">
        <div class="initiative-media-col">
          <img src="${init.image}" alt="${init.title}" class="initiative-img" loading="lazy">
          <div class="initiative-overlay-badge">
            <i class="${init.icon}" style="color:${init.color};"></i>
            <span>${init.stats.clubsCount} ta to'garak • ${init.stats.activeStudents.toLocaleString()} talaba</span>
          </div>
        </div>

        <div class="initiative-content-col">
          <div>
            <div class="initiative-header-badge" style="background:${init.accentBg};color:${init.color};">
              <i class="${init.icon}"></i> ${init.number}
            </div>
            <h3 class="initiative-title">${init.title}</h3>
            <p class="initiative-desc">${init.fullDesc}</p>

            <ul class="initiative-highlights-list">
              ${highlightsHtml}
            </ul>

            <div class="coordinator-card">
              <div class="coordinator-avatar" style="background:${init.color};">
                <i class="fa-solid fa-user-tie"></i>
              </div>
              <div class="coordinator-info">
                <h5>${init.coordinator.name}</h5>
                <p>${init.coordinator.role}</p>
                <a href="tel:${init.coordinator.phone}"><i class="fa-solid fa-phone"></i> ${init.coordinator.phone}</a>
              </div>
            </div>
          </div>

          <div class="initiative-card-actions">
            <button class="btn-hero-primary" style="background:${init.color};" onclick="window.registrationManager.openWithInitiative(${init.id})">
              <i class="fa-solid fa-file-pen"></i> ${enrollText}
            </button>
            <button class="btn-hero-secondary" style="color:var(--text-primary);border-color:var(--border);" onclick="window.appUI.filterClubsByInitiative(${init.id})">
              <i class="fa-solid fa-compass"></i> ${viewClubsText}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /* -------------------------------------------------------------
     CLUBS DIRECTORY (Live Search & Filter Chips)
     ------------------------------------------------------------- */
  filterClubsByInitiative(initiativeId) {
    this.activeClubFilter = initiativeId.toString();
    const section = document.getElementById('togaraklar');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
    this.renderClubsCatalog();
  }

  renderClubsCatalog() {
    const grid = document.getElementById('clubs-catalog-grid');
    const filterContainer = document.getElementById('clubs-filter-chips');
    if (!grid) return;

    const t = TRANSLATIONS[this.currentLang] || TRANSLATIONS.uz;
    const filterLabels = {
      uz: ['Barcha To\'garaklar (85+)', '1-Tashabbus (San\'at)', '2-Tashabbus (Sport)', '3-Tashabbus (IT)', '4-Tashabbus (Kitob)', '5-Tashabbus (Hunar)'],
      oz: ['Барча Тўгараклар (85+)', '1-Ташаббус (Санъат)', '2-Ташаббус (Спорт)', '3-Ташаббус (IT)', '4-Ташаббус (Китоб)', '5-Ташаббус (Ҳунар)'],
      ru: ['Все Кружки (85+)', '1-я Инициатива (Искусство)', '2-я Инициатива (Спорт)', '3-я Инициатива (IT)', '4-я Инициатива (Книги)', '5-я Инициатива (Ремесла)'],
      en: ['All Clubs (85+)', '1st Init (Arts)', '2nd Init (Sports)', '3rd Init (IT)', '4th Init (Books)', '5th Init (Skills)']
    };
    const labels = filterLabels[this.currentLang] || filterLabels.uz;

    if (filterContainer) {
      const filters = [
        { id: 'all', label: labels[0] },
        { id: '1', label: labels[1] },
        { id: '2', label: labels[2] },
        { id: '3', label: labels[3] },
        { id: '4', label: labels[4] },
        { id: '5', label: labels[5] }
      ];

      filterContainer.innerHTML = filters.map(f => `
        <button type="button" class="filter-chip-btn ${f.id === this.activeClubFilter ? 'active' : ''}" 
                data-filter="${f.id}" onclick="window.appUI.setClubFilter('${f.id}')">
          ${f.label}
        </button>
      `).join('');
    }

    // Filter Logic
    let filtered = URDUDATA.clubs;

    if (this.activeClubFilter !== 'all') {
      const initId = parseInt(this.activeClubFilter, 10);
      filtered = filtered.filter(c => c.initiativeId === initId);
    }

    if (this.clubsSearchTerm) {
      const q = this.clubsSearchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.leader.toLowerCase().includes(q) || 
        c.category.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q)
      );
    }

    const joinText = this.currentLang === 'ru' ? 'Записаться в кружок' : (this.currentLang === 'en' ? 'Join Club' : (this.currentLang === 'oz' ? 'Тўгаракка Аъзо Бўлиш' : 'To\'garakka A\'zo Bo\'lish'));

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--surface); border-radius: var(--radius-lg); border: 1px dashed var(--border);">
          <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 14px;"></i>
          <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 6px;">To'garak topilmadi</h4>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">Iltimos, boshqa kalit so'z yoki filtrni tanlab ko'ring.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(c => {
      const init = URDUDATA.initiatives.find(i => i.id === c.initiativeId) || URDUDATA.initiatives[0];
      const fillPercent = Math.round((c.enrolled / c.capacity) * 100);

      return `
        <div class="club-card" style="--club-accent:${init.color}">
          <div>
            <div class="club-card-top">
              <span class="club-category-pill">${c.category}</span>
              <span class="club-badge-tag">${c.badge}</span>
            </div>

            <h4 class="club-card-title">${c.name}</h4>
            <p class="club-card-desc">${c.desc}</p>

            <div class="club-card-meta">
              <div class="club-card-meta-item">
                <i class="fa-solid fa-user-graduate"></i>
                <span><strong>Murabbiy:</strong> ${c.leader}</span>
              </div>
              <div class="club-card-meta-item">
                <i class="fa-solid fa-location-dot"></i>
                <span>${c.location}</span>
              </div>
              <div class="club-card-meta-item">
                <i class="fa-solid fa-calendar-days"></i>
                <span>${c.schedule}</span>
              </div>
            </div>
          </div>

          <div>
            <div class="club-progress-bar-wrap">
              <div class="club-progress-info">
                <span>Bandlik: ${c.enrolled}/${c.capacity} a'zo</span>
                <span>${fillPercent}%</span>
              </div>
              <div class="club-progress-track">
                <div class="club-progress-fill" style="width:${fillPercent}%;background:${init.color}"></div>
              </div>
            </div>

            <button type="button" class="club-card-btn" onclick="window.registrationManager.openWithInitiative(${c.initiativeId}, '${c.id}')">
              <i class="fa-solid fa-signature"></i> ${joinText}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  setClubFilter(filterId) {
    this.activeClubFilter = filterId;
    this.renderClubsCatalog();
  }

  /* -------------------------------------------------------------
     UPCOMING EVENTS
     ------------------------------------------------------------- */
  renderEvents() {
    const grid = document.getElementById('events-grid-target');
    const filterContainer = document.getElementById('events-filter-bar');
    if (!grid) return;

    if (filterContainer && !filterContainer.hasChildNodes()) {
      const filters = [
        { id: 'all', label: 'Barcha Tadbirlar' },
        { id: '1', label: 'Madaniyat' },
        { id: '2', label: 'Sport' },
        { id: '3', label: 'IT & Hakaton' },
        { id: '4', label: 'Kitobxonlik' },
        { id: '5', label: 'Xotin-qizlar' }
      ];

      filterContainer.innerHTML = filters.map(f => `
        <button type="button" class="filter-chip-btn ${f.id === this.activeEventFilter ? 'active' : ''}" 
                data-event-filter="${f.id}" onclick="window.appUI.setEventFilter('${f.id}')">
          ${f.label}
        </button>
      `).join('');
    }

    let filtered = URDUDATA.upcomingEvents;
    if (this.activeEventFilter !== 'all') {
      filtered = filtered.filter(e => e.initiativeId === parseInt(this.activeEventFilter, 10));
    }

    grid.innerHTML = filtered.map(ev => {
      const d = new Date(ev.date);
      const day = d.getDate() || 24;
      const monthNames = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
      const month = monthNames[d.getMonth()] || "Okt";

      return `
        <div class="event-card">
          <div class="event-date-badge">
            <span class="event-date-day">${day}</span>
            <span class="event-date-month">${month}</span>
          </div>

          <div class="event-body">
            <div>
              <span class="event-tag">${ev.type}</span>
              <h4 class="event-title">${ev.title}</h4>
              <p class="event-desc">${ev.desc}</p>
            </div>

            <div>
              <div class="event-meta-info">
                <span><i class="fa-solid fa-clock"></i> ${ev.time}</span>
                <span><i class="fa-solid fa-map-pin"></i> ${ev.location}</span>
              </div>
              <button class="event-join-btn" onclick="window.appUI.rsvpEvent('${ev.title}')">
                <i class="fa-regular fa-bell"></i> Eslatma Qo'shish
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  setEventFilter(filterId) {
    this.activeEventFilter = filterId;
    const filterContainer = document.getElementById('events-filter-bar');
    if (filterContainer) {
      filterContainer.querySelectorAll('.filter-chip-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-event-filter') === filterId);
      });
    }
    this.renderEvents();
  }

  rsvpEvent(title) {
    this.showToast(`"${title}" tadbiri eslatmalar ro'yxatiga qo'shildi! 📅`);
  }

  /* -------------------------------------------------------------
     LEADERBOARD & HALL OF FAME
     ------------------------------------------------------------- */
  renderLeaderboard() {
    const list = document.getElementById('faculty-leaderboard-list');
    if (!list) return;

    list.innerHTML = URDUDATA.facultyLeaderboard.map((f, idx) => `
      <div class="leaderboard-item rank-${idx + 1}">
        <div class="rank-badge">${idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : idx + 1))}</div>
        <div class="faculty-info">
          <div class="faculty-name">${f.name}</div>
          <div class="faculty-meta">${f.activeStudents.toLocaleString()} nafar faol talaba • <span style="color:var(--accent);">${f.initiativesBadge}</span></div>
        </div>
        <div class="faculty-points-box">
          <div class="faculty-points-value">${f.points}</div>
          <div class="faculty-points-label">umumiy ball</div>
        </div>
      </div>
    `).join('');
  }

  /* -------------------------------------------------------------
     FAQ ACCORDION
     ------------------------------------------------------------- */
  renderFAQ() {
    const wrapper = document.getElementById('faq-accordion-target');
    if (!wrapper) return;

    wrapper.innerHTML = URDUDATA.faqs.map((item, idx) => `
      <div class="faq-item ${idx === 0 ? 'open' : ''}">
        <button type="button" class="faq-question-btn" onclick="window.appUI.toggleFaq(this)">
          <span>${item.q}</span>
          <div class="faq-icon-arrow"><i class="fa-solid fa-chevron-down"></i></div>
        </button>
        <div class="faq-answer-body">
          <p>${item.a}</p>
        </div>
      </div>
    `).join('');
  }

  toggleFaq(btn) {
    const item = btn.closest('.faq-item');
    if (item) {
      item.classList.toggle('open');
    }
  }

  /* -------------------------------------------------------------
     SEARCH OVERLAY MODAL
     ------------------------------------------------------------- */
  initSearchOverlay() {
    const modal = document.getElementById('search-overlay-modal');
    const input = document.getElementById('global-search-input');
    const results = document.getElementById('search-results-list');
    const triggers = document.querySelectorAll('.js-open-search');

    if (!modal) return;

    const openSearch = () => {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => { if (input) input.focus(); }, 150);
    };

    const closeSearch = () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      if (input) input.value = '';
      if (results) results.innerHTML = '';
    };

    triggers.forEach(t => t.addEventListener('click', openSearch));

    // Hotkey Ctrl+K / Cmd+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (modal.classList.contains('open')) closeSearch();
        else openSearch();
      }
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeSearch();
      }
    });

    const closeBtn = document.getElementById('search-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);

    // Live search input
    if (input && results) {
      input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (!query) {
          results.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:20px;">To'garak, tashabbus yoki murabbiy nomini kiriting...</p>`;
          return;
        }

        const matchedClubs = URDUDATA.clubs.filter(c => c.name.toLowerCase().includes(query) || c.leader.toLowerCase().includes(query));
        const matchedInit = URDUDATA.initiatives.filter(i => i.title.toLowerCase().includes(query));

        let out = '';
        if (matchedInit.length > 0) {
          out += `<h5 style="font-size:0.75rem;text-transform:uppercase;color:var(--primary);margin:10px 0 6px;">Tashabbuslar:</h5>`;
          matchedInit.forEach(i => {
            out += `
              <div style="padding:10px 14px;background:var(--bg-page);border-radius:8px;margin-bottom:6px;cursor:pointer;" onclick="window.appUI.switchInitiative(${i.id}); document.getElementById('search-overlay-modal').classList.remove('open');">
                <strong>${i.number}: ${i.title}</strong>
              </div>
            `;
          });
        }

        if (matchedClubs.length > 0) {
          out += `<h5 style="font-size:0.75rem;text-transform:uppercase;color:var(--primary);margin:14px 0 6px;">To'garaklar:</h5>`;
          matchedClubs.forEach(c => {
            out += `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg-page);border-radius:8px;margin-bottom:6px;">
                <div>
                  <strong>${c.name}</strong> <span style="font-size:0.8rem;color:var(--text-muted);">(${c.category})</span>
                  <div style="font-size:0.75rem;color:var(--text-secondary);">${c.leader}</div>
                </div>
                <button class="icon-btn-sm" onclick="window.registrationManager.openWithInitiative(${c.initiativeId}, '${c.id}')">A'zo bo'lish</button>
              </div>
            `;
          });
        }

        if (!out) {
          out = `<p style="text-align:center;color:var(--text-muted);padding:20px;">Hech narsa topilmadi</p>`;
        }

        results.innerHTML = out;
      });
    }
  }

  /* -------------------------------------------------------------
     GLOBAL LISTENERS & TOASTS
     ------------------------------------------------------------- */
  bindGlobalEvents() {
    // Mobile navigation toggle
    const mobileToggle = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('primary-nav-menu');

    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
      });

      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navMenu.classList.remove('open'));
      });
    }

    // Sticky Header Scroll Listener
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
      if (header) {
        if (window.scrollY > 40) {
          header.classList.add('is-stuck');
        } else {
          header.classList.remove('is-stuck');
        }
      }
    });

    // Search clubs input in catalog
    const clubSearchInput = document.getElementById('clubs-search-input');
    if (clubSearchInput) {
      clubSearchInput.addEventListener('input', (e) => {
        this.clubsSearchTerm = e.target.value.trim();
        this.renderClubsCatalog();
      });
    }

    // Modal background click to close
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    });
  }

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid fa-circle-check"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appUI = new UrDU5TashabbusApp();
});
