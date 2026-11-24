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
  const tel = (p) => "tel:" + String(p || "").replace(/[^\d+]/g, "");
  // 2026-10-14 → 14.10.2026 (eski ko'rinishdagi sanalar o'zgarishsiz qoladi)
  const dmy = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d || "") ? d.split("-").reverse().join(".") : d || "");
  const fmt = (n) => Number(n).toLocaleString("ru-RU").replace(/,/g, " ");
  // 1–5 tashabbuslar va qo'shimcha guruhlar (6 — ilmiy to'garaklar)
  // Yo'nalishi ko'rsatilmagan yozuvlar (yangi tanlov, yangilik) uchun neytral qiymat
  const NO_GROUP = { id: 0, title: "", color: "var(--brand)", icon: "fa-solid fa-star" };
  const initiative = (id) => SITE.groups.find((i) => i.id === Number(id)) || NO_GROUP;
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
    { href: "togaraklar.html", label: "To'garak va kurslar", key: "togaraklar" },
    { href: "tanlovlar.html", label: "Tanlovlar", key: "tanlovlar" },
    { href: "yangiliklar.html", label: "Yangiliklar", key: "yangiliklar" },
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
              ${item.children.map((c) => `<a href="${c.href}"${c.key === page ? ' class="active" aria-current="page"' : ""}><span>${esc(c.label)}</span></a>`).join("")}
            </div>
          </li>`;
      }
      const active = item.key === page || (item.key === "yangiliklar" && page === "yangilik");
      return `<li><a href="${item.href}" class="nav-link${active ? " active" : ""}"${active ? ' aria-current="page"' : ""}>${esc(item.label)}</a></li>`;
    }).join("");

    const html = `
      ${topbarHtml()}
      <header class="header" id="header">
        <div class="container">
          <a href="index.html" class="brand" aria-label="Bosh sahifa">
            <img class="logo-light" src="assets/images/urdu_5t_logo.png?v=2" alt="UrDU Besh muhim tashabbus markazi" width="715" height="420">
            <img class="logo-dark" src="assets/images/urdu_5t_logo_white.png?v=2" alt="" width="715" height="420">
          </a>
          <ul class="nav" id="nav">${navHtml}</ul>
          <div class="header-actions">
            <button type="button" class="icon-btn" id="search-open" aria-label="Qidiruv (Ctrl+K)"><i class="fa-solid fa-magnifying-glass"></i></button>
            <button type="button" class="icon-btn" id="theme-toggle" aria-label="Yorug'/qorong'i rejim"><i class="fa-solid fa-moon"></i></button>
            <button type="button" class="icon-btn burger" id="burger" aria-label="Menyu" aria-expanded="false"><i class="fa-solid fa-bars"></i></button>
          </div>
        </div>
      </header>`;
    document.body.insertAdjacentHTML("afterbegin", html);
    applyTheme(document.documentElement.dataset.theme);
  }

  const socialLinks = () => U.socials.map((s) =>
    `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.name)}"><i class="${esc(s.icon)}"></i></a>`).join("");

  function topbarHtml() {
    return `
      <div class="topbar">
        <div class="container">
          <div class="topbar-info">
            <span class="hide-sm"><i class="fa-solid fa-location-dot"></i>${esc(U.address)}</span>
            ${U.phone ? `<a href="${tel(U.phone)}"><i class="fa-solid fa-phone"></i>${esc(U.phone)}</a>` : ""}
          </div>
          <div class="topbar-social">${socialLinks()}</div>
        </div>
      </div>`;
  }

  function renderFooter() {
    const html = `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <img src="assets/images/urdu_5t_logo_white.png?v=2" alt="UrDU Besh muhim tashabbus markazi" width="715" height="420">
              <p>${esc(U.name)} qoshidagi Besh muhim tashabbus markazining rasmiy portali.</p>
              <div class="socials">${socialLinks()}</div>
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
                <li><a href="nizom.html">Nizom</a></li>
                <li><a href="togaraklar.html">To'garak va kurslar</a></li>
                <li><a href="reyting.html">Reyting</a></li>
                <li><a href="kutubxona.html">Kutubxona</a></li>
                <li><a href="aloqa.html">Aloqa</a></li>
              </ul>
            </div>
            <div>
              <h4>Bog'lanish</h4>
              <ul>
                <li class="contact-row"><i class="fa-solid fa-location-dot"></i><span>${esc(U.address)}</span></li>
                ${[U.phone].filter(Boolean).map((p) => `<li class="contact-row"><i class="fa-solid fa-phone"></i><a href="${tel(p)}">${esc(p)}</a></li>`).join("")}
                ${U.centerEmail ? `<li class="contact-row"><i class="fa-solid fa-envelope"></i><a href="mailto:${esc(U.centerEmail)}">${esc(U.centerEmail)}</a></li>` : ""}
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} ${esc(U.name)}</span>
          </div>
        </div>
      </footer>`;
    const old = $(".footer");
    if (old) old.outerHTML = html;
    else document.body.insertAdjacentHTML("beforeend", html);
  }

  /* Dashboard'dan yangi ma'lumot kelgach: aloqa, ijtimoiy tarmoqlar va yo'nalishlar yangilanadi */
  function refreshShell() {
    const bar = $(".topbar");
    if (bar) bar.outerHTML = topbarHtml();
    renderFooter();
    const sel = $("#j-init");
    if (sel) sel.innerHTML = SITE.groups.map((i) => `<option value="${i.id}">${i.id <= 5 ? i.id + ". " : ""}${esc(i.title)}</option>`).join("");
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
      <div class="modal modal-detail" id="detail-modal" role="dialog" aria-modal="true" aria-label="Batafsil" data-static="1">
        <div class="modal-box">
          <span class="dt-progress" aria-hidden="true"></span>
          <button type="button" class="icon-btn modal-close" aria-label="Yopish"><i class="fa-solid fa-xmark"></i></button>
          <div id="detail-content"></div>
        </div>
      </div>

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
          <p class="lead">Arizani to'ldiring — u markazga yuboriladi va sardor siz bilan bog'lanadi.</p>
          <form class="form" id="join-form">
            <input type="text" name="website" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
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
            <button type="button" class="modal-close search-x" aria-label="Yopish"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="search-results" id="search-results"></div>
        </div>
      </div>

      <button type="button" class="to-top" id="to-top" aria-label="Sahifa boshiga"><i class="fa-solid fa-arrow-up"></i></button>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
    document.body.insertAdjacentHTML("beforeend", html);
  }

  /* ---------- Murojaatni serverga yuborish (A'zo bo'lish va Aloqa shakllari) ---------- */
  async function sendRequest(form, payload) {
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const r = await fetch("api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (r.ok) return true;
      let msg = "Yuborib bo'lmadi. Keyinroq qayta urinib ko'ring.";
      try { msg = (await r.json()).error || msg; } catch (x) { /* javob bo'sh */ }
      toast(msg);
      return false;
    } catch (x) {
      toast("Internet aloqasini tekshiring va qayta yuboring.");
      return false;
    } finally {
      btn.disabled = false;
    }
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
    $("#join-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const f = new FormData(form);
      const ok = await sendRequest(form, {
        type: "join", name: f.get("name"), group: f.get("group"), phone: f.get("phone"), club: f.get("club"), website: f.get("website")
      });
      if (!ok) return;
      closeModal($("#join-modal"));
      toast("Arizangiz qabul qilindi. Sardor tez orada siz bilan bog'lanadi.");
      form.reset();
    });
  }

  /* ---------- Qidiruv ---------- */
  const PAGES = [
    ["Markaz haqida", "markaz.html", "fa-landmark"],
    ["Rahbariyat", "rahbariyat.html", "fa-user-tie"],
    ["Nizom", "nizom.html", "fa-file-lines"],
    ["Yo'riqnoma va savol-javob", "yoriqnoma.html", "fa-circle-question"],
    ["Fakultetlararo faollik reytingi", "reyting.html", "fa-ranking-star"],
    ["Kutubxona", "kutubxona.html", "fa-book"],
    ["Aloqa", "aloqa.html", "fa-envelope"]
  ];

  function runSearch(q) {
    const out = $("#search-results");
    // Eski (sh, o') va yangi (ş, ö) yozuv bir xil taqqoslanadi
    const norm = (s) => (window.ALIFBO ? ALIFBO.norm(s) : String(s || "").toLowerCase());
    const query = norm(q.trim());
    if (!query) { out.innerHTML = `<div class="none">Qidirish uchun yozishni boshlang</div>`; return; }
    const has = (...fields) => fields.some((f) => norm(f || "").includes(query));
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
      // Menyu sarlavhaning haqiqiy pastidan boshlanadi (tepadagi ko'k qator ko'rinib tursa ham)
      document.documentElement.style.setProperty("--nav-top", Math.max(0, Math.round(header.getBoundingClientRect().bottom)) + "px");
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
    const toTop = $("#to-top");
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 10);
      toTop.classList.toggle("show", window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    $("#detail-content").addEventListener("scroll", detailProgress, { passive: true });

    // Qidiruv
    $("#search-open").addEventListener("click", openSearch);
    $("#search-input").addEventListener("input", (e) => runSearch(e.target.value));

    // Modal yopish
    $$(".modal").forEach((m) => {
      m.addEventListener("click", (e) => {
        // Batafsil oyna faqat × tugmasi bilan yopiladi
        if (e.target.closest(".modal-close") || (e.target === m && !m.dataset.static)) closeModal(m);
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const m = $(".modal.open");
        if (m && !m.dataset.static) closeModal(m);
        else if (document.body.classList.contains("nav-open")) burger.click();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
      // Tanlov kartasi klaviaturadan ham ochiladi
      if (e.key === "Enter" && e.target.matches && e.target.matches("article[data-contest]")) showContest(e.target.dataset.contest);
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
    const row = (icon, txt, title) => `<li title="${esc(title || txt)}"><i class="${icon}"></i><span>${esc(txt)}</span></li>`;
    // Barcha rahbarlar va barcha telefonlar yonma-yon (raqam bosilsa — qo'ng'iroq)
    const people = `<li class="full"><i class="fa-regular fa-user"></i><span class="cc-tags">${mentors.map((m) => `<b>${esc(m)}</b>`).join("")}</span></li>`;
    const phones = c.phones.length ? `<li class="full"><i class="fa-solid fa-phone"></i><span class="cc-tags">${c.phones.map((p) =>
      p.tel ? `<a href="tel:${esc(p.tel)}">${esc(p.text)}</a>` : `<b>${esc(p.text)}</b>`).join("")}</span></li>` : "";
    return `
      <article class="card cc" style="--c:${i.color}">
        <div class="cc-body">
          <span class="cc-chip"><i class="${i.icon}"></i>${esc(i.title)}</span>
          <h3>${esc(c.name)}</h3>
          ${c.desc ? `<p class="cc-desc">${esc(richText(c.desc))}</p>` : ""}
          <ul class="cc-info">
            ${people}
            ${phones}
            ${c.schedule ? row("fa-regular fa-clock", c.schedule) : ""}
            ${c.place ? row("fa-regular fa-map", c.place) : ""}
          </ul>
        </div>
        <div class="cc-foot">
          ${c.students ? `<span class="cc-count"><b>${c.students}</b> a'zo</span>` : `<span class="cc-count">Yangi</span>`}
          <span class="cc-actions">
            <button type="button" class="cc-join" data-join="${c.id}">A'zo bo'lish <i class="fa-solid fa-arrow-right"></i></button>
          </span>
        </div>
      </article>`;
  }

  /* Kasbga o'qitish kursi kartasi (to'garak kartasi bilan bir uslubda) */
  // Kurslar yo'nalishlardan alohida: o'z rangi va ikonkasi bor
  const COURSE_COLOR = "#475569";
  const COURSE_ICON = "fa-solid fa-screwdriver-wrench";
  function courseCard(c) {
    const row = (icon, txt) => `<li title="${esc(txt)}"><i class="${icon}"></i><span>${esc(txt)}</span></li>`;
    const phone = (c.phone || "").replace(/[^\d+]/g, "");
    return `
      <article class="card cc" style="--c:${COURSE_COLOR}">
        <div class="cc-body">
          <span class="cc-chip"><i class="${COURSE_ICON}"></i>Kasbga o'qitish kursi</span>
          <h3>${esc(c.name)}</h3>
          ${c.desc ? `<p class="cc-desc">${esc(richText(c.desc))}</p>` : ""}
          <ul class="cc-info">
            ${c.teacher ? row("fa-regular fa-user", c.teacher) : ""}
            ${c.schedule ? row("fa-regular fa-clock", c.schedule) : ""}
            ${c.place ? row("fa-regular fa-map", c.place) : ""}
            ${c.audience ? row("fa-solid fa-users", c.audience) : ""}
          </ul>
        </div>
        <div class="cc-foot">
          <span class="cc-count">${c.duration ? `<b>${esc(c.duration)}</b>` : ""}</span>
          <span class="cc-actions">
            ${phone ? `<a class="cc-call" href="tel:${esc(phone)}" title="${esc(c.phone)}" aria-label="Qo'ng'iroq: ${esc(c.phone)}"><i class="fa-solid fa-phone"></i></a>` : ""}
            ${c.certificate ? `<span class="cc-status"><i class="fa-solid fa-award"></i> Sertifikat</span>` : ""}
          </span>
        </div>
      </article>`;
  }

  function daysLeft(deadline) {
    const d = Math.ceil((new Date(deadline + "T23:59:59") - new Date()) / 86400000);
    return d;
  }

  /* ---------- Formatlangan matn (admin tahrirlagichidan) ---------- */
  // Server allaqachon tozalaydi; brauzerda ham oq ro'yxat bo'yicha qayta tozalanadi (ikkinchi himoya)
  const RICH_TAGS = new Set(["B", "STRONG", "I", "EM", "U", "S", "BR", "P", "DIV", "UL", "OL", "LI", "A", "H3", "H4", "BLOCKQUOTE", "SPAN"]);
  function richHtml(v) {
    v = String(v ?? "");
    if (!/<[a-zA-Z/]/.test(v)) return esc(v).replace(/\n/g, "<br>");
    const doc = new DOMParser().parseFromString(`<div>${v}</div>`, "text/html");
    const walk = (node) => [...node.childNodes].map((n) => {
      if (n.nodeType === 3) return esc(n.nodeValue);
      if (n.nodeType !== 1) return "";
      const inner = walk(n);
      if (!RICH_TAGS.has(n.tagName)) return /^(SCRIPT|STYLE|IFRAME|OBJECT|SVG)$/.test(n.tagName) ? "" : inner;
      const t = n.tagName.toLowerCase();
      if (t === "br") return "<br>";
      if (t === "a") {
        const href = n.getAttribute("href") || "";
        return /^(https?:|mailto:|tel:)/i.test(href) ? `<a href="${esc(href)}" target="_blank" rel="noopener">${inner}</a>` : inner;
      }
      if (t === "span") {
        const cls = (n.getAttribute("class") || "").split(/\s+/).find((c) => /^fs-(s|l|xl)$/.test(c));
        return cls ? `<span class="${cls}">${inner}</span>` : inner;
      }
      return `<${t}>${inner}</${t}>`;
    }).join("");
    return walk(doc.body.firstChild);
  }
  // Kartochkalar uchun: formatlashsiz qisqa matn
  const richText = (v) => {
    const d = document.createElement("div");
    d.innerHTML = richHtml(v).replace(/<br>|<\/(p|div|li|h3|h4)>/g, " ");
    return d.textContent.replace(/\s+/g, " ").trim();
  };

  // Tanlov ochiqmi: tugash sanasi o'tmagan va yakunlangan deb belgilanmagan
  const contestOpen = (c) => c.status !== "completed" && daysLeft(c.deadline) >= 0;

  function contestCard(c) {
    const i = initiative(c.initiativeId);
    const d = daysLeft(c.deadline);
    const open = contestOpen(c);
    const status = open
      ? `<span class="tag tag-success"><i class="fa-solid fa-circle"></i> Qabul ochiq</span>`
      : `<span class="tag tag-muted"><i class="fa-solid fa-flag-checkered"></i> Tanlov tugadi</span>`;
    const hasRules = c.rules && (c.rules.purpose || (c.rules.requirements || []).length);
    const doc = c.doc
      ? `<a class="btn btn-outline btn-sm" href="${esc(c.doc)}" target="_blank" rel="noopener"><i class="fa-regular fa-file-lines"></i> Nizomi</a>`
      : hasRules ? `<button type="button" class="btn btn-outline btn-sm" data-rules="${c.id}"><i class="fa-regular fa-file-lines"></i> Nizomi</button>` : "";
    // Karta bosilsa to'liq oyna ochiladi; sana va sovrin har doim pastda, bir tekisda
    return `
      <article class="card card-hover contest-card${open ? "" : " ended"}" id="${c.id}" style="--c:${i.color}" data-contest="${esc(c.id)}" tabindex="0" role="button" aria-label="${esc(c.title)} — batafsil">
        ${mediaSlides(mediaList(c), "contest-media", i.id ? `<span class="tag"><i class="${i.icon}"></i> ${esc(i.title)}</span>` : "")}
        <div class="contest-body">
          <div class="club-top">${status}${open ? `<span class="countdown${d > 7 ? " ok" : ""}">${d === 0 ? "Bugun oxirgi kun" : `${d} kun qoldi`}</span>` : ""}</div>
          <h3>${esc(c.title)}</h3>
          ${c.desc ? `<div class="rich rich-clamp">${richHtml(c.desc)}</div>` : ""}
          <div class="contest-facts">
            <div class="meta"><div><i class="fa-regular fa-calendar"></i><span>${open ? `${esc(dmy(c.deadline))} gacha` : `${esc(dmy(c.deadline))} da tugadi`}</span></div></div>
            <div class="prize${c.prize ? "" : " empty"}"><i class="fa-solid fa-trophy"></i><span>${esc(c.prize || "Mukofot e'lon qilinadi")}</span></div>
            <div class="contest-foot">
              ${doc}
              ${open ? `<a class="btn btn-primary btn-sm" href="mailto:${esc(U.centerEmail)}?subject=${encodeURIComponent("Tanlovga ariza: " + c.title)}">Qatnashish</a>` : ""}
            </div>
          </div>
        </div>
      </article>`;
  }

  // Eski tanlovlar uchun (nizom maydonlari bilan kiritilganlar)
  function showRules(id) {
    const c = SITE.contests.find((x) => x.id === id);
    if (!c || !c.rules) return;
    const r = c.rules;
    const list = (arr) => ((arr || []).length ? `<ul class="dots">${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "");
    showInfo(`
      <h2>${esc(c.title)}</h2>
      <p class="lead">${esc(dmy(c.deadline))} gacha</p>
      ${r.purpose ? `<h4>Maqsad</h4><p>${esc(r.purpose)}</p>` : ""}
      ${(r.requirements || []).length ? `<h4>Talablar</h4>${list(r.requirements)}` : ""}
      ${(r.stages || []).length ? `<h4>Bosqichlar</h4>${list(r.stages)}` : ""}
      ${(r.criteria || []).length ? `<h4>Baholash</h4>${list(r.criteria)}` : ""}
      ${r.awards ? `<h4>Mukofotlar</h4><p>${esc(r.awards)}</p>` : ""}`);
  }

  // Karta rasmi: bir nechta bo'lsa — avtomatik slayd-shou, ‹ › tugmalari, nuqtalar, sichqoncha/barmoq bilan surish
  const mediaList = (x) => [...new Set([x.image].concat(x.gallery || []).filter(Boolean))];
  function mediaSlides(imgs, cls, extra = "") {
    const many = imgs.length > 1;
    return `<div class="${cls} mslides"${many ? ' data-slides data-i="0"' : ""}>${imgs.map((src, k) =>
      `<img src="${esc(src)}" alt="" loading="lazy" draggable="false"${k ? "" : ' class="on"'}>`).join("")}${many ? `
      <span class="ms-nav prev" data-sl="-1" role="button" aria-label="Oldingi rasm"><i class="fa-solid fa-chevron-left"></i></span>
      <span class="ms-nav next" data-sl="1" role="button" aria-label="Keyingi rasm"><i class="fa-solid fa-chevron-right"></i></span>
      <span class="ms-dots">${imgs.map((_, k) => `<i${k ? "" : ' class="on"'}></i>`).join("")}</span>` : ""}${extra}</div>`;
  }
  function slideGo(m, i) {
    const imgs = $$("img", m), dots = $$(".ms-dots i", m);
    const n = imgs.length;
    if (n < 2) return;
    i = (i + n) % n;
    m.dataset.i = i;
    imgs.forEach((im, k) => im.classList.toggle("on", k === i));
    dots.forEach((d, k) => d.classList.toggle("on", k === i));
  }
  const newsMedia = (n) => mediaSlides(mediaList(n), "news-media");

  function newsCard(n) {
    const i = initiative(n.initiativeId);
    return `
      <a href="yangilik.html?id=${encodeURIComponent(n.id)}" class="card card-hover news-card" style="--c:${i.color}">
        ${newsMedia(n)}
        <div class="news-body">
          <div class="news-meta">${i.id ? `<span class="tag"><i class="${i.icon}"></i> ${esc(i.title)}</span>` : ""}<span>${esc(dmy(n.date))}</span></div>
          <h3>${esc(n.title)}</h3>
          <p>${esc(richText(n.excerpt))}</p>
          <span class="link-arrow">Batafsil <i class="fa-solid fa-arrow-right"></i></span>
        </div>
      </a>`;
  }

  function showDetail(html) {
    const box = $("#detail-content");
    box.innerHTML = html;
    openModal("detail-modal");
    box.scrollTop = 0;
    detailProgress();
  }
  // Oyna tepasidagi ingichka chiziq: qancha o'qilganini ko'rsatadi
  function detailProgress() {
    const box = $("#detail-content"), bar = $(".dt-progress");
    if (!box || !bar) return;
    const max = box.scrollHeight - box.clientHeight;
    bar.style.transform = `scaleX(${max > 0 ? box.scrollTop / max : 0})`;
  }

  // Galereya: asosiy rasm, ← → tugmalari, kichik rasmlar, surib almashtirish
  function galleryHtml(images, alt) {
    const list = [...new Set(images.filter(Boolean))];
    if (!list.length) return "";
    return `
      <div class="dt-gallery" data-gallery data-i="0">
        <div class="dt-stage">
          ${list.map((src, k) => `<figure class="dt-slide${k ? "" : " on"}"><img class="dt-bg" src="${esc(src)}" alt="" aria-hidden="true"${k ? ' loading="lazy"' : ""} draggable="false"><img class="dt-fg" src="${esc(src)}" alt="${esc(alt)}"${k ? ' loading="lazy"' : ""} draggable="false"></figure>`).join("")}
          ${list.length > 1 ? `
            <button type="button" class="dt-nav prev" data-gal="-1" aria-label="Oldingi rasm"><i class="fa-solid fa-chevron-left"></i></button>
            <button type="button" class="dt-nav next" data-gal="1" aria-label="Keyingi rasm"><i class="fa-solid fa-chevron-right"></i></button>
            <span class="dt-count">1 / ${list.length}</span>` : ""}
        </div>
        ${list.length > 1 ? `<div class="dt-thumbs">${list.map((src, k) => `<button type="button" data-gal-to="${k}" class="${k ? "" : "on"}" aria-label="${k + 1}-rasm"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
      </div>`;
  }
  function galleryGo(g, i) {
    const imgs = $$(".dt-slide", g), thumbs = $$(".dt-thumbs button", g);
    const n = imgs.length;
    if (n < 2) return;
    i = (i + n) % n;
    g.dataset.i = i;
    imgs.forEach((im, k) => im.classList.toggle("on", k === i));
    thumbs.forEach((t, k) => t.classList.toggle("on", k === i));
    const c = $(".dt-count", g);
    if (c) c.textContent = `${i + 1} / ${n}`;
    if (thumbs[i]) thumbs[i].scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }


  // Tanlov: kartada qisqa ma'lumot, oynada to'liq
  function showContest(id) {
    const c = SITE.contests.find((x) => String(x.id) === String(id));
    if (!c) return;
    const open = contestOpen(c);
    const d = daysLeft(c.deadline);
    const hasRules = c.rules && (c.rules.purpose || (c.rules.requirements || []).length);
    showDetail(`
      <article class="dt">
        ${galleryHtml(mediaList(c), c.title)}
        <div class="dt-body">
          <div class="dt-meta">
            ${open ? `<span class="dt-tag ok"><i class="fa-solid fa-circle"></i> Qabul ochiq</span>` : `<span class="dt-tag muted"><i class="fa-solid fa-flag-checkered"></i> Tanlov tugadi</span>`}
            ${open ? `<span class="dt-left">${d === 0 ? "Bugun oxirgi kun" : `${d} kun qoldi`}</span>` : ""}
          </div>
          <h2>${esc(c.title)}</h2>
          <div class="dt-facts">
            <div><i class="fa-regular fa-calendar"></i><span><small>Tugash sanasi</small>${esc(dmy(c.deadline))}</span></div>
            ${c.prize ? `<div><i class="fa-solid fa-trophy"></i><span><small>Mukofot</small>${esc(c.prize)}</span></div>` : ""}
          </div>
          ${c.desc ? `<div class="rich rich-lead">${richHtml(c.desc)}</div>` : ""}
          ${c.body ? `<div class="rich">${richHtml(c.body)}</div>` : ""}
          <div class="dt-actions">
            ${c.doc ? `<a class="btn btn-outline" href="${esc(c.doc)}" target="_blank" rel="noopener"><i class="fa-regular fa-file-lines"></i> Nizomi</a>` : hasRules ? `<button type="button" class="btn btn-outline" data-rules="${esc(c.id)}">Nizomi</button>` : ""}
            ${open ? `<a class="btn btn-primary" href="mailto:${esc(U.centerEmail)}?subject=${encodeURIComponent("Tanlovga ariza: " + c.title)}"><i class="fa-solid fa-paper-plane"></i> Qatnashish</a>` : ""}
          </div>
        </div>
      </article>`);
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
    const sl = e.target.closest("[data-sl]");
    if (sl) {
      e.preventDefault(); // karta havola bo'lsa ham sahifa ochilib ketmasin
      const m = sl.closest("[data-slides]");
      m.dataset.t = Date.now();
      slideGo(m, Number(m.dataset.i) + Number(sl.dataset.sl));
      return;
    }
    const r = e.target.closest("[data-rules]");
    if (r) showRules(r.dataset.rules);
    const ct = e.target.closest("[data-contest]");
    if (ct && !e.target.closest("a, button")) showContest(ct.dataset.contest);
    // Galereya tugmalari
    const g = e.target.closest("[data-gallery]");
    if (g) {
      const step = e.target.closest("[data-gal]");
      const to = e.target.closest("[data-gal-to]");
      if (step || to) g.dataset.t = Date.now();
      if (step) galleryGo(g, Number(g.dataset.i) + Number(step.dataset.gal));
      if (to) galleryGo(g, Number(to.dataset.galTo));
    }
  });
  // Rasmlar 4 soniyada o'zi almashadi; foydalanuvchi o'zi almashtirsa, 8 soniya kutadi
  const step = (m, d) => (m.matches("[data-gallery]") ? galleryGo : slideGo)(m, Number(m.dataset.i || 0) + d);
  setInterval(() => {
    if (document.hidden) return;
    const now = Date.now();
    $$("[data-slides], .modal.open [data-gallery], .news-page [data-gallery]").forEach((m) => {
      if (now - Number(m.dataset.t || 0) < 8000) return;
      step(m, 1);
    });
  }, 4000);

  // Sichqoncha bilan tortib yoki barmoq bilan surib almashtirish
  let drag = null, dragged = false;
  document.addEventListener("pointerdown", (e) => {
    const m = e.button === 0 && e.target.closest("[data-slides], .dt-stage");
    drag = m ? { m: m.closest("[data-slides], [data-gallery]"), x: e.clientX, y: e.clientY } : null;
  });
  document.addEventListener("pointerup", (e) => {
    if (!drag) return;
    const { m, x, y } = drag;
    drag = null;
    const dx = e.clientX - x;
    if (!m || Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(e.clientY - y)) return;
    m.dataset.t = Date.now();
    step(m, dx < 0 ? 1 : -1);
    dragged = true; // tortishdan keyingi «bosish» kartani ochmasin
    setTimeout(() => { dragged = false; }, 350);
  });
  document.addEventListener("pointercancel", () => { drag = null; });
  document.addEventListener("click", (e) => {
    if (dragged) { dragged = false; e.preventDefault(); e.stopPropagation(); }
  }, true);

  /* ---------- Ishga tushirish ---------- */
  renderHeader();
  renderFooter();
  renderModals();
  bindEvents();

  window.UI = { $, $$, esc, tel, dmy, refreshShell, fmt,initiative, groupLabel, initials, avatar, sendRequest, richHtml, richText, contestOpen, clubCard, courseCard, COURSE_COLOR, COURSE_ICON, contestCard, newsCard, initiativeCard, galleryHtml, mediaList, daysLeft, showInfo, toast, initReveal };
})();
