/**
 * Umumiy qism: header, footer, menyu, qidiruv, modal oynalar, tema.
 * Har bir sahifada bir xil — shuning uchun HTML fayllarda takrorlanmaydi.
 */
(function () {
  "use strict";

  const U = SITE.university;
  const page = document.body.dataset.page || "";

  /* ---------- Yordamchi funksiyalar ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const tel = (p) => "tel:" + p.replace(/[^\d+]/g, "");
  const fmt = (n) => Number(n).toLocaleString("ru-RU").replace(/,/g, " ");
  // 1–5 tashabbuslar va qo'shimcha guruhlar (6 — ilmiy to'garaklar)
  const initiative = (id) => SITE.groups.find((i) => i.id === Number(id));
  const groupLabel = (g) => (g.id <= 5 ? `${g.id}-tashabbus` : g.title);
  const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  /* ---------- Tema (yorug' / qorong'i) ---------- */
  const THEME_KEY = "urdu5t-theme";
  function getTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const icon = $("#theme-toggle i");
    if (icon) icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }
  applyTheme(getTheme() || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

  /* ---------- Menyu ---------- */
  const NAV = [
    { href: "index.html", label: "Bosh sahifa", key: "home" },
    {
      label: "Markaz", key: "markaz", children: [
        { href: "markaz.html", label: "Markaz haqida", icon: "fa-landmark", key: "markaz" },
        { href: "rahbariyat.html", label: "Rahbariyat", icon: "fa-user-tie", key: "rahbariyat" },
        { href: "nizom.html", label: "Nizom", icon: "fa-file-lines", key: "nizom" },
        { href: "yoriqnoma.html", label: "Yo'riqnoma", icon: "fa-circle-question", key: "yoriqnoma" }
      ]
    },
    { href: "togaraklar.html", label: "To'garaklar", key: "togaraklar" },
    { href: "tanlovlar.html", label: "Tanlovlar", key: "tanlovlar" },
    { href: "reyting.html", label: "Reyting", key: "reyting" },
    { href: "kutubxona.html", label: "Kutubxona", key: "kutubxona" },
    { href: "aloqa.html", label: "Aloqa", key: "aloqa" }
  ];

  function renderHeader() {
    const navHtml = NAV.map((item) => {
      if (item.children) {
        const active = item.children.some((c) => c.key === page);
        return `
          <li class="has-dropdown">
            <button type="button" class="nav-link${active ? " active" : ""}" aria-expanded="false">
              ${esc(item.label)} <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="dropdown">
              ${item.children.map((c) => `<a href="${c.href}"${c.key === page ? ' class="active" aria-current="page"' : ""}><i class="fa-solid ${c.icon}"></i>${esc(c.label)}</a>`).join("")}
            </div>
          </li>`;
      }
      const active = item.key === page;
      return `<li><a href="${item.href}" class="nav-link${active ? " active" : ""}"${active ? ' aria-current="page"' : ""}>${esc(item.label)}</a></li>`;
    }).join("");

    const html = `
      <div class="topbar">
        <div class="container">
          <div class="topbar-info">
            <span class="hide-sm"><i class="fa-solid fa-location-dot"></i>${esc(U.address)}</span>
            <a href="${tel(U.phone)}"><i class="fa-solid fa-phone"></i>${esc(U.phone)}</a>
          </div>
          <div class="topbar-social">
            ${U.socials.map((s) => `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}"><i class="${s.icon}"></i></a>`).join("")}
          </div>
        </div>
      </div>
      <header class="header" id="header">
        <div class="container">
          <a href="index.html" class="brand" aria-label="Bosh sahifa">
            <img class="logo-light" src="assets/images/urdu_5t_logo.png" alt="UrDU Besh muhim tashabbus markazi" width="928" height="482">
            <img class="logo-dark" src="assets/images/urdu_5t_logo_white.png" alt="" width="928" height="482">
          </a>
          <ul class="nav" id="nav">${navHtml}</ul>
          <div class="header-actions">
            <button type="button" class="icon-btn" id="search-open" aria-label="Qidiruv (Ctrl+K)"><i class="fa-solid fa-magnifying-glass"></i></button>
            <button type="button" class="icon-btn" id="theme-toggle" aria-label="Yorug'/qorong'i rejim"><i class="fa-solid fa-moon"></i></button>
            <a href="${U.hemis}" class="btn btn-primary btn-sm header-cta" target="_blank" rel="noopener" title="HEMIS orqali kirish"><i class="fa-solid fa-right-to-bracket"></i><span>Kirish</span></a>
            <button type="button" class="icon-btn burger" id="burger" aria-label="Menyu" aria-expanded="false"><i class="fa-solid fa-bars"></i></button>
          </div>
        </div>
      </header>`;
    document.body.insertAdjacentHTML("afterbegin", html);
    applyTheme(document.documentElement.dataset.theme);
  }

  function renderFooter() {
    const html = `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <img src="assets/images/urdu_5t_logo_white.png" alt="UrDU 5 muhim tashabbus markazi" width="928" height="482">
              <p>${esc(U.name)} qoshidagi 5 muhim tashabbus markazining rasmiy portali.</p>
              <div class="socials">
                ${U.socials.map((s) => `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}"><i class="${s.icon}"></i></a>`).join("")}
              </div>
            </div>
            <div>
              <h4>Tashabbuslar</h4>
              <ul>
                ${SITE.initiatives.map((i) => `<li><a href="togaraklar.html?t=${i.id}">${i.id}. ${esc(i.title)}</a></li>`).join("")}
              </ul>
            </div>
            <div>
              <h4>Sahifalar</h4>
              <ul>
                <li><a href="markaz.html">Markaz haqida</a></li>
                <li><a href="rahbariyat.html">Rahbariyat</a></li>
                <li><a href="nizom.html">Nizom</a></li>
                <li><a href="yoriqnoma.html">Yo'riqnoma</a></li>
                <li><a href="${U.hemis}" target="_blank" rel="noopener">HEMIS tizimi</a></li>
              </ul>
            </div>
            <div>
              <h4>Bog'lanish</h4>
              <ul>
                <li class="contact-row"><i class="fa-solid fa-location-dot"></i><span>${esc(U.address)}</span></li>
                <li class="contact-row"><i class="fa-solid fa-phone"></i><a href="${tel(U.phone)}">${esc(U.phone)}</a></li>
                <li class="contact-row"><i class="fa-solid fa-phone"></i><a href="${tel(U.youthPhone)}">${esc(U.youthPhone)}</a></li>
                <li class="contact-row"><i class="fa-solid fa-envelope"></i><a href="mailto:${U.centerEmail}">${esc(U.centerEmail)}</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} ${esc(U.name)}</span>
            <a href="${U.website}" target="_blank" rel="noopener">urdu.uz</a>
          </div>
          <p class="footer-credit">Sayt muallifi: Bobojonov Alobek</p>
        </div>
      </footer>`;
    document.body.insertAdjacentHTML("beforeend", html);
  }

  /* ---------- Modal oynalar ---------- */
  let lastFocus = null;
  function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    lastFocus = document.activeElement;
    m.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(() => { const f = m.querySelector("input, select, textarea, button:not(.modal-close)"); if (f) f.focus(); }, 60);
  }
  function closeModal(m) {
    if (!m) return;
    m.classList.remove("open");
    if (!$(".modal.open")) document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  function showInfo(html) {
    $("#info-modal-content").innerHTML = html;
    openModal("info-modal");
  }

  function renderModals() {
    const html = `
      <div class="modal" id="info-modal" role="dialog" aria-modal="true">
        <div class="modal-box">
          <button type="button" class="icon-btn modal-close" aria-label="Yopish"><i class="fa-solid fa-xmark"></i></button>
          <div id="info-modal-content"></div>
        </div>
      </div>

      <div class="modal" id="join-modal" role="dialog" aria-modal="true" aria-labelledby="join-title">
        <div class="modal-box">
          <button type="button" class="icon-btn modal-close" aria-label="Yopish"><i class="fa-solid fa-xmark"></i></button>
          <h2 id="join-title">To'garakka a'zo bo'lish</h2>
          <p class="lead">Arizani to'ldiring — u markaz pochtasiga yuboriladi va sardor siz bilan bog'lanadi.</p>
          <form class="form" id="join-form">
            <div class="field">
              <label for="j-name">Ism va familiya</label>
              <input id="j-name" name="name" required autocomplete="name">
            </div>
            <div class="form-row">
              <div class="field">
                <label for="j-group">Fakultet va guruh</label>
                <input id="j-group" name="group" required placeholder="Masalan: Filologiya, 201-guruh">
              </div>
              <div class="field">
                <label for="j-phone">Telefon</label>
                <input id="j-phone" name="phone" type="tel" required autocomplete="tel" placeholder="+998 __ ___ __ __">
              </div>
            </div>
            <div class="form-row">
              <div class="field">
                <label for="j-init">Tashabbus</label>
                <select id="j-init" name="initiative">
                  ${SITE.groups.map((i) => `<option value="${i.id}">${i.id <= 5 ? i.id + ". " : ""}${esc(i.title)}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label for="j-club">To'garak</label>
                <select id="j-club" name="club"></select>
              </div>
            </div>
            <p class="form-hint" id="j-contact"></p>
            <button type="submit" class="btn btn-primary btn-block"><i class="fa-solid fa-paper-plane"></i> Arizani yuborish</button>
          </form>
        </div>
      </div>

      <div class="modal" id="search-modal" role="dialog" aria-modal="true" aria-label="Qidiruv">
        <div class="modal-box search-box">
          <div class="search-field">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input id="search-input" type="search" placeholder="To'garak, tanlov, kitob yoki sahifa..." autocomplete="off">
            <kbd>Esc</kbd>
          </div>
          <div class="search-results" id="search-results"></div>
        </div>
      </div>

      <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
    document.body.insertAdjacentHTML("beforeend", html);
  }

  /* ---------- A'zo bo'lish shakli ---------- */
  function fillClubs(initId, clubId) {
    const sel = $("#j-club");
    const clubs = SITE.clubs.filter((c) => c.initiativeId === Number(initId));
    sel.innerHTML = clubs.map((c) => `<option value="${c.id}"${c.id === clubId ? " selected" : ""}>${esc(c.name)}</option>`).join("");
    const leader = SITE.leaders.find((l) => l.initiativeId === Number(initId));
    $("#j-contact").innerHTML = leader
      ? `<i class="fa-solid fa-circle-info"></i> Savollar bo'yicha sardor: <strong>${esc(leader.name)}</strong>, <a href="${tel(leader.phone)}">${esc(leader.phone)}</a>`
      : "";
  }

  function openJoin(clubId) {
    const club = SITE.clubs.find((c) => c.id === clubId);
    const initId = club ? club.initiativeId : Number($("#j-init").value || 1);
    $("#j-init").value = initId;
    fillClubs(initId, clubId);
    openModal("join-modal");
  }

  function bindJoinForm() {
    $("#j-init").addEventListener("change", (e) => fillClubs(e.target.value));
    $("#join-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const init = initiative(f.get("initiative"));
      const club = SITE.clubs.find((c) => c.id === f.get("club"));
      const body = [
        `Ism: ${f.get("name")}`,
        `Fakultet/guruh: ${f.get("group")}`,
        `Telefon: ${f.get("phone")}`,
        `Tashabbus: ${init ? init.title : ""}`,
        `To'garak: ${club ? club.name : ""}`
      ].join("\n");
      const subject = `To'garakka ariza: ${club ? club.name : ""}`;
      window.location.href = `mailto:${U.centerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      closeModal($("#join-modal"));
      toast("Pochta ilovasi ochildi — xatni yuborishni unutmang.");
      e.target.reset();
    });
  }

  /* ---------- Qidiruv ---------- */
  const PAGES = [
    ["Markaz haqida", "markaz.html", "fa-landmark"],
    ["Rahbariyat", "rahbariyat.html", "fa-user-tie"],
    ["Nizom", "nizom.html", "fa-file-lines"],
    ["Yo'riqnoma va savol-javob", "yoriqnoma.html", "fa-circle-question"],
    ["Fakultetlar reytingi", "reyting.html", "fa-ranking-star"],
    ["Kutubxona", "kutubxona.html", "fa-book"],
    ["Aloqa", "aloqa.html", "fa-envelope"]
  ];

  function runSearch(q) {
    const out = $("#search-results");
    const query = q.trim().toLowerCase();
    if (!query) { out.innerHTML = `<div class="none">Qidirish uchun yozishni boshlang</div>`; return; }
    const has = (...fields) => fields.some((f) => String(f || "").toLowerCase().includes(query));
    const groups = [
      ["Sahifalar", PAGES.filter((p) => has(p[0])).map((p) => [p[1], p[2], p[0], ""])],
      ["Tashabbuslar", SITE.initiatives.filter((i) => has(i.title, i.lead)).map((i) => [`togaraklar.html?t=${i.id}`, "fa-flag", i.title, `${i.id}-tashabbus`])],
      ["To'garaklar", SITE.clubs.filter((c) => has(c.name, c.place, c.mentors.join(" "))).map((c) => [`togaraklar.html?q=${encodeURIComponent(c.name)}`, "fa-people-group", c.name, c.mentors.join(", ")])],
      ["Tanlovlar", SITE.contests.filter((c) => has(c.title, c.desc)).map((c) => [`tanlovlar.html#${c.id}`, "fa-trophy", c.title, c.period])],
      ["Kitoblar", SITE.books.filter((b) => has(b.title, b.author)).map((b) => ["kutubxona.html", "fa-book", b.title, b.author])]
    ].filter((g) => g[1].length);
    out.innerHTML = groups.length
      ? groups.map(([name, items]) => `<div class="group">${name}</div>` + items.slice(0, 6).map(([href, icon, title, sub]) =>
          `<a href="${href}"><i class="fa-solid ${icon}"></i><span><strong>${esc(title)}</strong>${sub ? `<small>${esc(sub)}</small>` : ""}</span></a>`).join("")).join("")
      : `<div class="none">"${esc(q)}" bo'yicha hech narsa topilmadi</div>`;
  }

  function openSearch() {
    $("#search-input").value = "";
    runSearch("");
    openModal("search-modal");
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>${esc(msg)}</span>`;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3800);
  }

  /* ---------- Hodisalar ---------- */
  function bindEvents() {
    // Mobil menyu
    const burger = $("#burger");
    burger.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", open);
      burger.innerHTML = `<i class="fa-solid ${open ? "fa-xmark" : "fa-bars"}"></i>`;
    });

    // Ochiladigan menyu (bosganda ham ishlaydi)
    $$(".has-dropdown > button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const li = btn.parentElement;
        const open = li.classList.toggle("open");
        btn.setAttribute("aria-expanded", open);
      });
    });
    document.addEventListener("click", (e) => {
      $$(".has-dropdown.open").forEach((li) => { if (!li.contains(e.target)) li.classList.remove("open"); });
    });

    // Tema
    $("#theme-toggle").addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* saqlab bo'lmasa ham ishlaydi */ }
    });

    // Header soyasi
    const header = $("#header");
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Qidiruv
    $("#search-open").addEventListener("click", openSearch);
    $("#search-input").addEventListener("input", (e) => runSearch(e.target.value));

    // Modal yopish
    $$(".modal").forEach((m) => {
      m.addEventListener("click", (e) => {
        if (e.target === m || e.target.closest(".modal-close")) closeModal(m);
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const m = $(".modal.open");
        if (m) closeModal(m);
        else if (document.body.classList.contains("nav-open")) burger.click();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
    });

    // "A'zo bo'lish" tugmalari (sahifaning istalgan joyida)
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-join]");
      if (btn) { e.preventDefault(); openJoin(btn.dataset.join || null); }
    });

    bindJoinForm();
  }

  /* ---------- Ko'rinish animatsiyasi ---------- */
  function initReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -40px 0px" });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Kartochka shablonlari (sahifalar uchun) ---------- */
  function avatar(name, photo) {
    return photo
      ? `<img class="avatar" src="${photo}" alt="${esc(name)}" loading="lazy">`
      : `<span class="avatar avatar-initials" aria-hidden="true">${esc(initials(name))}</span>`;
  }

  function clubCard(c) {
    const i = initiative(c.initiativeId);
    const mentors = c.mentors.length ? c.mentors : ["Rahbar belgilanmagan"];
    const phones = c.phones.map((p) => (p.tel ? `<a href="tel:${p.tel}">${esc(p.text)}</a>` : esc(p.text))).join(", ");
    return `
      <article class="card card-hover club-card" style="--c:${i.color}">
        <div class="club-top">
          <span class="tag"><i class="${i.icon}"></i> ${esc(groupLabel(i))}</span>
          ${c.students ? `<span class="tag tag-muted"><i class="fa-solid fa-users"></i> ${c.students} o'quvchi</span>` : ""}
        </div>
        <h3>${esc(c.name)}</h3>
        <div class="mentor">
          ${avatar(mentors[0])}
          <div><strong>${esc(mentors.join(", "))}</strong>${phones ? `<span>${phones}</span>` : ""}</div>
        </div>
        <div class="meta">
          ${c.schedule ? `<div><i class="fa-regular fa-clock"></i><span>${esc(c.schedule)}</span></div>` : ""}
          ${c.place ? `<div><i class="fa-solid fa-location-dot"></i><span>${esc(c.place)}</span></div>` : ""}
        </div>
        <div class="club-foot">
          <button type="button" class="btn btn-primary btn-sm" data-join="${c.id}">A'zo bo'lish</button>
        </div>
      </article>`;
  }

  function daysLeft(deadline) {
    const d = Math.ceil((new Date(deadline + "T23:59:59") - new Date()) / 86400000);
    return d;
  }

  function contestCard(c) {
    const i = initiative(c.initiativeId);
    const d = daysLeft(c.deadline);
    const open = c.status === "active" && d >= 0;
    const status = c.status === "completed"
      ? `<span class="tag tag-muted"><i class="fa-solid fa-flag-checkered"></i> Yakunlangan</span>`
      : open
        ? `<span class="tag tag-success"><i class="fa-solid fa-circle"></i> Qabul ochiq</span>`
        : `<span class="tag tag-muted"><i class="fa-solid fa-lock"></i> Qabul yopilgan</span>`;
    return `
      <article class="card card-hover contest-card" id="${c.id}" style="--c:${i.color}">
        <div class="contest-media">
          <img src="${c.image}" alt="" loading="lazy">
          <span class="tag"><i class="${i.icon}"></i> ${esc(i.title)}</span>
        </div>
        <div class="contest-body">
          <div class="club-top">${status}${open ? `<span class="countdown${d > 7 ? " ok" : ""}">${d === 0 ? "Bugun oxirgi kun" : `${d} kun qoldi`}</span>` : ""}</div>
          <h3>${esc(c.title)}</h3>
          <p>${esc(c.desc)}</p>
          <div class="meta">
            <div><i class="fa-regular fa-calendar"></i><span>${esc(c.period)}</span></div>
            <div><i class="fa-solid fa-location-dot"></i><span>${esc(c.place)}</span></div>
          </div>
          <div class="prize"><i class="fa-solid fa-trophy"></i><span>${esc(c.prize)}</span></div>
          <div class="contest-foot">
            <button type="button" class="btn btn-outline btn-sm" data-rules="${c.id}">Nizomi</button>
            ${open ? `<a class="btn btn-primary btn-sm" href="mailto:${U.centerEmail}?subject=${encodeURIComponent("Tanlovga ariza: " + c.title)}">Qatnashish</a>` : ""}
          </div>
        </div>
      </article>`;
  }

  function showRules(id) {
    const c = SITE.contests.find((x) => x.id === id);
    if (!c) return;
    const r = c.rules;
    const list = (arr) => `<ul class="dots">${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
    showInfo(`
      <h2>${esc(c.title)}</h2>
      <p class="lead">${esc(c.organizer)} · ${esc(c.period)}</p>
      <h4>Maqsad</h4><p>${esc(r.purpose)}</p>
      <h4>Talablar</h4>${list(r.requirements)}
      <h4>Bosqichlar</h4>${list(r.stages)}
      <h4>Baholash</h4>${list(r.criteria)}
      <h4>Mukofotlar</h4><p>${esc(r.awards)}</p>`);
  }

  function newsCard(n) {
    const i = initiative(n.initiativeId);
    return `
      <button type="button" class="card card-hover news-card" data-news="${n.id}" style="--c:${i.color}">
        <img src="${n.image}" alt="" loading="lazy">
        <div class="news-body">
          <div class="news-meta"><span class="tag"><i class="${i.icon}"></i> ${esc(i.title)}</span><span>${esc(n.date)}</span></div>
          <h3>${esc(n.title)}</h3>
          <p>${esc(n.excerpt)}</p>
          <span class="link-arrow">Batafsil <i class="fa-solid fa-arrow-right"></i></span>
        </div>
      </button>`;
  }

  function showNews(id) {
    const n = SITE.news.find((x) => x.id === id);
    if (!n) return;
    showInfo(`
      <img class="modal-img" src="${n.image}" alt="">
      <h2>${esc(n.title)}</h2>
      <p class="lead">${esc(n.date)} · ${esc(initiative(n.initiativeId).title)}</p>
      <p>${esc(n.excerpt)}</p><br><p>${esc(n.body)}</p>`);
  }

  function initiativeCard(i) {
    return `
      <a href="togaraklar.html?t=${i.id}" class="card card-hover init-card reveal" style="--c:${i.color}">
        <span class="num">0${i.id}</span>
        <span class="init-icon"><i class="${i.icon}"></i></span>
        <h3>${esc(i.title)}</h3>
        <p>${esc(i.lead)}</p>
        <span class="link-arrow">To'garaklar <i class="fa-solid fa-arrow-right"></i></span>
      </a>`;
  }

  // Delegatsiya: nizom va yangilik tugmalari
  document.addEventListener("click", (e) => {
    const r = e.target.closest("[data-rules]");
    if (r) showRules(r.dataset.rules);
    const n = e.target.closest("[data-news]");
    if (n) showNews(n.dataset.news);
  });

  /* ---------- Ishga tushirish ---------- */
  renderHeader();
  renderFooter();
  renderModals();
  bindEvents();

  window.UI = { $, $$, esc, tel, fmt, initiative, groupLabel, initials, avatar, clubCard, contestCard, newsCard, initiativeCard, daysLeft, showInfo, toast, initReveal };
})();
