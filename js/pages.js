/**
 * Har bir sahifaning dinamik qismlari (ma'lumot js/data.js dan olinadi).
 * <body data-page="..."> qiymatiga qarab kerakli funksiya ishga tushadi.
 */
(function () {
  "use strict";

  const { $, $$, esc, tel, fmt, initiative, avatar, clubCard, contestCard, newsCard, initiativeCard, daysLeft, initReveal } = window.UI;
  const U = SITE.university;
  const params = new URLSearchParams(location.search);

  const isOpen = (c) => window.UI.contestOpen(c);

  /* ---------- Umumiy bloklar ---------- */
  function fillInitiatives(el) {
    if (el) el.innerHTML = SITE.initiatives.map(initiativeCard).join("");
  }

  function fillStats(el) {
    if (!el) return;
    const items = [
      ["fa-users", fmt(SITE.totals.students), "to'garak a'zosi"],
      ["fa-people-group", SITE.totals.clubs + "+", "to'garak va seksiya"],
      ["fa-trophy", SITE.totals.activeContests, "faol tanlov"],
      ["fa-medal", SITE.totals.awards, "sovrinli o'rin"]
    ];
    el.innerHTML = items.map(([icon, num, label]) => `
      <div class="stat reveal">
        <span class="stat-icon"><i class="fa-solid ${icon}"></i></span>
        <div><strong>${num}</strong><span>${label}</span></div>
      </div>`).join("");
  }

  function chip(label, value, active, color, count, icon) {
    return `<button type="button" class="chip${active ? " active" : ""}" data-value="${esc(value)}"${color ? ` style="--c:${color}"` : ""}>
      ${icon ? `<i class="${icon}"></i>` : color ? '<span class="dot"></span>' : ""}${esc(label)}${count !== undefined ? ` <span class="count">${count}</span>` : ""}
    </button>`;
  }

  function bindChips(container, onChange) {
    container.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      $$(".chip", container).forEach((c) => c.classList.toggle("active", c === b));
      onChange(b.dataset.value);
    });
  }

  /* ---------- Sahifalash: ro'yxatni bo'laklab ko'rsatadi, ostida ‹ 1 2 3 › ----------
     Elementlar bitta sahifaga sig'sa, raqamlar ko'rinmaydi. */
  function paginate(listEl, items, cardFn, per, emptyHtml) {
    let page = 1;
    const pages = Math.max(1, Math.ceil(items.length / per));
    let nav = listEl.nextElementSibling;
    if (!nav || !nav.classList.contains("pager")) {
      nav = document.createElement("nav");
      nav.className = "pager";
      nav.setAttribute("aria-label", "Sahifalar");
      listEl.after(nav);
      nav.addEventListener("click", (e) => {
        const b = e.target.closest("[data-page]");
        if (b && !b.disabled && nav._go) nav._go(b.dataset.page);
      });
    }
    // Ko'p sahifa bo'lsa: 1 … 4 5 6 … 12
    const nums = () => {
      if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
      const out = [1];
      if (page > 3) out.push("…");
      for (let p = Math.max(2, page - 1); p <= Math.min(pages - 1, page + 1); p++) out.push(p);
      if (page < pages - 2) out.push("…");
      out.push(pages);
      return out;
    };
    const draw = (scroll) => {
      listEl.innerHTML = items.length ? items.slice((page - 1) * per, page * per).map(cardFn).join("") : emptyHtml || "";
      nav.hidden = pages <= 1;
      nav.innerHTML = pages <= 1 ? "" : `
        <button type="button" data-page="prev" aria-label="Oldingi sahifa"${page === 1 ? " disabled" : ""}><i class="fa-solid fa-chevron-left"></i></button>
        ${nums().map((n) => (n === "…" ? `<span class="pager-gap">…</span>`
          : `<button type="button" data-page="${n}"${n === page ? ' class="on" aria-current="page"' : ""}>${n}</button>`)).join("")}
        <button type="button" data-page="next" aria-label="Keyingi sahifa"${page === pages ? " disabled" : ""}><i class="fa-solid fa-chevron-right"></i></button>`;
      listEl.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
      if (scroll) window.scrollTo({ top: listEl.getBoundingClientRect().top + scrollY - 110, behavior: "smooth" });
    };
    nav._go = (v) => {
      page = v === "prev" ? page - 1 : v === "next" ? page + 1 : Number(v);
      page = Math.min(pages, Math.max(1, page));
      draw(true);
    };
    draw(false);
  }

  /* ---------- Statistika animatsiyasi: blok ekranga kirganda raqamlar sanab chiqadi, halqa to'ladi ---------- */
  function animateCounters(root) {
    if (!root) return;
    const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const run = () => {
      root.classList.add("in-view");
      if (reduce) return;
      // Halqa 0 dan to'ladi (boshlang'ich holatda to'liq ko'rinib turadi)
      root.querySelectorAll("[data-p]").forEach((r) => {
        r.style.transition = "none";
        r.style.setProperty("--p", 0);
        void r.offsetWidth;
        r.style.transition = "";
        requestAnimationFrame(() => requestAnimationFrame(() => r.style.setProperty("--p", r.dataset.p)));
      });
      root.querySelectorAll("[data-count]").forEach((el) => {
        const target = Number(String(el.dataset.count).replace(/\s/g, ""));
        if (!isFinite(target) || target <= 0) return;
        const suffix = el.dataset.suffix || "";
        const t0 = performance.now(), dur = 1500;
        const step = (t) => {
          const k = Math.min(1, (t - t0) / dur);
          el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - k, 3)))) + suffix;
          if (k < 1) requestAnimationFrame(step);
        };
        el.textContent = "0" + suffix;
        requestAnimationFrame(step);
      });
    };
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { io.disconnect(); run(); }
    }, { threshold: 0.25 });
    io.observe(root);
  }

  /* ---------- Bosh sahifa ---------- */
  function home() {
    // Slayder: admin paneldagi «Slayder» bo'limi; u bo'sh bo'lsa — g'oliblar rasmlari
    const slider = $("#slider");
    const W = (SITE.slides || []).filter((s) => s.image).length
      ? SITE.slides.filter((s) => s.image).map((s) => ({ photo: s.image, alt: s.caption || "" }))
      : SITE.winners.filter((w) => w.photo).map((w) => ({ photo: w.photo, alt: `${w.name} — ${w.contest}` }));
    if (slider && W.length) {
      slider.innerHTML = W.map((w, idx) => `
        <div class="slide${idx === 0 ? " active" : ""}" aria-hidden="${idx !== 0}">
          <img src="${esc(w.photo)}" alt="${esc(w.alt)}"${idx ? ' loading="lazy"' : ""}>
        </div>`).join("") + `
        <div class="slider-controls">
          <button type="button" class="icon-btn" data-dir="-1" aria-label="Oldingi"><i class="fa-solid fa-chevron-left"></i></button>
          <div class="slider-dots">${W.map((_, i) => `<button type="button" aria-label="${i + 1}-slayd"${i === 0 ? ' class="active"' : ""}></button>`).join("")}</div>
          <button type="button" class="icon-btn" data-dir="1" aria-label="Keyingi"><i class="fa-solid fa-chevron-right"></i></button>
        </div>`;

      const slides = $$(".slide", slider);
      const dots = $$(".slider-dots button", slider);
      let cur = 0, timer;
      const show = (n) => {
        cur = (n + slides.length) % slides.length;
        slides.forEach((s, i) => { s.classList.toggle("active", i === cur); s.setAttribute("aria-hidden", i !== cur); });
        dots.forEach((d, i) => d.classList.toggle("active", i === cur));
      };
      const play = () => { clearInterval(timer); timer = setInterval(() => show(cur + 1), 4500); };
      dots.forEach((d, i) => d.addEventListener("click", () => { show(i); play(); }));
      $$("[data-dir]", slider).forEach((b) => b.addEventListener("click", () => { show(cur + Number(b.dataset.dir)); play(); }));
      play();
    }

    fillInitiatives($("#initiatives"));

    // Har tashabbusdan eng mashhur to'garak (+ bitta qo'shimcha) — 6 ta
    const featured = SITE.initiatives.map((i) =>
      SITE.clubs.filter((c) => c.initiativeId === i.id).sort((a, b) => (b.students || 0) - (a.students || 0))[0]
    ).filter(Boolean);
    const extra = SITE.clubs.filter((c) => c.initiativeId === 6).sort((a, b) => (b.students || 0) - (a.students || 0))[0];
    if (extra) featured.push(extra);
    $("#featured-clubs").innerHTML = featured.slice(0, 6).map(clubCard).join("");

    // Statistika plitkalari: admin panelda qiymat yozilmagan bo'lsa, ro'yxatlardan hisoblanadi
    const sum = (list, k) => list.reduce((a, x) => a + (Number(x[k]) || 0), 0);
    const courses = SITE.courses || [];
    // Kurslar hali kiritilmagan bo'lsa, kasb-hunar (5-yo'nalish) to'garaklari olinadi
    const auto = {
      students: { value: fmt(SITE.totals.students) },
      clubs: { value: SITE.totals.clubs, sub: SITE.totals.students, subLabel: "nafar talaba a'zo" },
      // Kurslar alohida bo'lim: soni kurslar ro'yxatidan, o'qiyotganlar — Statistika bo'limida qo'lda
      courses: { value: courses.length, subLabel: "nafar talaba o'qimoqda" },
      contests: { value: SITE.contests.length, sub: sum(SITE.contests, "participants"), subLabel: "nafar talaba ishtirok etmoqda" },
      books: { value: SITE.books.length }
    };
    const given = (v) => v !== "" && v != null;
    const num = (v) => (/^\d+$/.test(String(v).replace(/\s/g, "")) ? fmt(String(v).replace(/\s/g, "")) : v);
    const rows = SITE.stats.map((s) => {
      const a = auto[s.id] || {};
      return { ...s, shown: given(s.value) ? s.value : a.value ?? 0, subN: given(s.sub) ? s.sub : a.sub, subLabel: a.subLabel || "" };
    });
    // Birinchi ko'rsatkich (Jami talabalar) — katta raqam va qamrov halqasi, qolganlari ostida
    const head = rows.find((r) => r.id === "students") || rows[0];
    const rest = rows.filter((r) => r !== head);
    const toN = (v) => Number(String(v ?? "").replace(/\s/g, "")) || 0;
    const total = toN(head && head.shown);
    const active = SITE.totals.students;
    const share = total ? Math.min(100, Math.round((active / total) * 100)) : 0;
    $("#home-stats").innerHTML = (head ? `
      <div class="sb-hero">
        <div class="sb-main">
          <span class="sb-kicker"><i class="fa-solid ${esc(head.icon)}"></i> ${esc(head.label)}</span>
          <strong class="sb-big"><span data-count="${esc(head.shown)}">${esc(num(head.shown))}</span>${head.unit ? `<small>${esc(head.unit)}</small>` : ""}</strong>
          ${share ? `<p class="sb-note"><b>${fmt(active)}</b> nafari to'garak va kurslarda shug'ullanadi</p>` : ""}
        </div>
        ${share ? `<div class="sb-ring" data-p="${share}" style="--p:${share}" role="img" aria-label="Talabalarning ${share} foizi faol">
          <span><b data-count="${share}" data-suffix="%">${share}%</b><small>faol</small></span></div>` : ""}
      </div>` : "") + `
      <div class="sb-grid">${rest.map((r) => `
        <div class="sb-cell">
          <span class="sb-ic"><i class="fa-solid ${esc(r.icon)}"></i></span>
          <strong><span data-count="${esc(r.shown)}">${esc(num(r.shown))}</span>${r.unit ? `<small>${esc(r.unit)}</small>` : ""}</strong>
          <span class="sb-label">${esc(r.label)}</span>
          ${r.subN ? `<em>${esc(num(r.subN))} ${esc(r.subLabel)}</em>` : ""}
        </div>`).join("")}
      </div>`;
    animateCounters($("#home-stats"));

    // Tanlovlar ro'yxati: avval qabul ochiqlari (muddati yaqinroq), keyin yakunlanganlar
    const contests = [...SITE.contests]
      .sort((a, b) => Number(isOpen(b)) - Number(isOpen(a)) || a.deadline.localeCompare(b.deadline))
      .slice(0, 5);
    const { dmy } = window.UI;
    $("#home-contests").innerHTML = contests.map((c) => `
      <a class="contest-row" href="tanlovlar.html#${c.id}">
        <img src="${c.image}" alt="" loading="lazy">
        <span>
          <strong>${esc(c.title)}</strong>
          <small><i class="fa-regular fa-clock"></i> ${isOpen(c) ? `${dmy(c.deadline)} gacha` : "Tanlov tugadi"}</small>
        </span>
      </a>`).join("");

    // Yangiliklar: eng so'nggisi birinchi
    const isoDate = (d) => (/^\d{2}\.\d{2}\.\d{4}$/.test(d || "") ? d.split(".").reverse().join("-") : d || "");
    $("#home-news").innerHTML = [...SITE.news]
      .sort((a, b) => isoDate(b.date).localeCompare(isoDate(a.date)))
      .slice(0, 6).map(newsCard).join("");
  }

  /* ---------- Markaz haqida ---------- */
  function markaz() {
    fillStats($("#stats"));
    // Markaz yo'nalishlari: tashabbuslar, admin qo'shgan yo'nalishlar, kasbga o'qitish kurslari va boshqa turdagi to'garaklar
    const card = ({ id, title, text, color, icon, tag, link, clubs, students, extra }) => `
      <article class="card dir-card reveal" id="${id}" style="--c:${color}">
        <div class="dir-head"><span class="dir-ic"><i class="${icon}"></i></span><span class="dir-tag">${esc(tag)}</span></div>
        <h3>${esc(title)}</h3>
        <p>${esc(text || "")}</p>
        <div class="dir-stats"><span><b>${fmt(clubs)}</b> ${extra || "to'garak"}</span><span><b>${fmt(students)}</b> ${extra ? "sertifikatli" : "a'zo"}</span></div>
        <a class="link-arrow" href="${link}">Ko'rish <i class="fa-solid fa-arrow-right"></i></a>
      </article>`;
    const groups = SITE.groups.filter((g) => g.id !== 6);
    const other = SITE.groups.find((g) => g.id === 6);
    const courses = SITE.courses || [];
    const { COURSE_COLOR, COURSE_ICON } = window.UI;
    $("#initiative-rows").innerHTML = `<div class="dir-grid">${groups.map((g) => card({
        id: `t${g.id}`, title: g.title, text: g.about || g.lead, color: g.color, icon: g.icon,
        tag: g.id <= 5 ? `${g.id}-tashabbus` : "Yo'nalish", link: `togaraklar.html?t=${g.id}`, clubs: g.clubsCount || 0, students: g.students || 0
      })).join("")}
      ${card({
        id: "kurslar", title: "Kasbga o'qitish kurslari", color: COURSE_COLOR, icon: COURSE_ICON, tag: "Kurslar", link: "togaraklar.html?t=courses",
        text: "Talaba-qizlar va yoshlarni kasb-hunarga o'qitish: tikuvchilik, dizayn, pazandachilik, buxgalteriya va boshqa amaliy kurslar. Bitirganlarga sertifikat beriladi.",
        clubs: courses.length, students: courses.filter((c) => c.certificate).length, extra: "kurs"
      })}
      ${other ? card({
        id: "t6", title: other.title, color: other.color, icon: other.icon, tag: "Qo'shimcha", link: "togaraklar.html?t=6",
        text: other.about || other.lead || "Fan, til, tafakkur va boshqa qiziqishlar bo'yicha besh tashabbusdan tashqari to'garaklar.",
        clubs: other.clubsCount || 0, students: other.students || 0
      }) : ""}</div>`;
  }

  /* ---------- Rahbariyat ---------- */
  function rahbariyat() {
    const card = (p, role) => `
      <div class="person-photo">${p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy">` : avatar(p.name)}</div>
      <div class="person-body">
        <h3>${esc(p.name)}</h3>
        ${role ? `<div class="person-role">${esc(role)}</div>` : ""}
        ${p.phone || p.telegram ? `<div class="meta">
          ${p.phone ? `<div><i class="fa-solid fa-phone"></i><a href="${tel(p.phone)}">${esc(p.phone)}</a></div>` : ""}
          ${p.telegram ? `<div><i class="fa-brands fa-telegram"></i><a href="${esc(p.telegram)}" target="_blank" rel="noopener">${esc(p.telegram.replace(/^https:\/\/t\.me\//, "@"))}</a></div>` : ""}
        </div>` : ""}
      </div>`;
    const roleOf = (p) => {
      if (p.role) return p.role;
      if (p.initiativeId === 0) return "Markaz rahbari";
      const i = initiative(p.initiativeId);
      return i.id ? `${i.title} yo'nalishi sardori` : "";
    };
    const colorOf = (p) => (initiative(p.initiativeId) || {}).color || "var(--brand)";

    // Dashboarddagi tartib bo'yicha; birinchi xodim katta kartochkada
    const people = (SITE.staff || [SITE.head, ...SITE.leaders])
      .filter((p) => p && (p.showOnPage === undefined ? p.initiativeId <= 3 : p.showOnPage));
    const [first, ...rest] = people;
    const headEl = $("#head-card");
    if (first) { headEl.innerHTML = card(first, roleOf(first)); headEl.style.setProperty("--c", colorOf(first)); }
    else headEl.remove();
    $("#leaders").innerHTML = rest.map((p) =>
      `<article class="card head-card leader-card reveal" style="--c:${colorOf(p)}">${card(p, roleOf(p))}</article>`).join("");
  }

  /* ---------- To'garaklar ---------- */
  function togaraklar() {
    // Yo'nalishlar (1–5), kasbga o'qitish kurslari va boshqa turdagi to'garaklar (6).
    // Tanlangan yorliqni qayta bossangiz, filtr olib tashlanadi va hammasi ko'rinadi.
    let filter = params.get("t") || "all";
    const query = params.get("q") || "";  // sayt qidiruvidan kelgan havola uchun
    const chips = $("#club-filters");
    const { courseCard, COURSE_COLOR, COURSE_ICON } = window.UI;
    const courses = SITE.courses || [];
    // Kurslar — alohida bo'lim: faqat admin paneldagi «Kasbga o'qitish kurslari»
    const courseItems = courses.map((c) => ({ c, card: courseCard }));
    const other = SITE.groups.find((g) => g.id === 6);
    // 1–5 tashabbuslar, admin qo'shgan yo'nalishlar, kurslar va oxirida «Boshqa turdagi to'garaklar»
    const items = SITE.groups.filter((g) => g.id <= 5 || g.id >= 7).map((g) => [g.title, String(g.id), g.color])
      .concat([["Kasbga o'qitish kurslari", "courses", COURSE_COLOR, COURSE_ICON]])
      .concat(other ? [[other.title, "6", other.color]] : []);
    const countOf = (v) => (v === "courses" ? courseItems.length : SITE.clubs.filter((c) => c.initiativeId === Number(v)).length);
    chips.innerHTML = items.map(([label, v, color, icon]) => chip(label, v, filter === v, color, countOf(v), icon)).join("");

    const render = () => {
      const norm = (s) => (window.ALIFBO ? ALIFBO.norm(s) : String(s || "").toLowerCase());
      const q = norm(query.trim());
      const list = filter === "courses"
        ? courseItems
        : SITE.clubs.filter((c) =>
            (filter === "all" || c.initiativeId === Number(filter)) &&
            (!q || [c.name, c.place, c.schedule, c.mentors.join(" ")].some((f) => norm(f || "").includes(q)))
          ).map((c) => ({ c, card: clubCard }));
      $("#club-count").textContent = filter === "courses" ? `${list.length} ta kurs` : `${list.length} ta to'garak`;
      paginate($("#club-list"), list, ({ c, card }) => card(c), 9, filter === "courses"
        ? `<div class="empty"><i class="${COURSE_ICON}"></i>Kasbga o'qitish kurslari tez orada e'lon qilinadi</div>`
        : `<div class="empty"><i class="fa-regular fa-folder-open"></i>Bu bo'limda hozircha hech narsa yo'q</div>`);
      const url = new URL(location.href);
      filter === "all" ? url.searchParams.delete("t") : url.searchParams.set("t", filter);
      history.replaceState(null, "", url);
    };

    chips.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      filter = filter === b.dataset.value ? "all" : b.dataset.value;
      $$(".chip", chips).forEach((x) => x.classList.toggle("active", x.dataset.value === filter));
      b.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      render();
    });
    render();
    // URL bilan kelgan filtr yorlig'i telefonda ko'rinib tursin
    const act = $(".chip.active", chips);
    if (act) act.scrollIntoView({ block: "nearest", inline: "center" });
  }

  /* ---------- Tanlovlar ---------- */
  function tanlovlar() {
    let status = "all";
    const open = SITE.contests.filter(isOpen).length;
    const done = SITE.contests.filter((c) => !isOpen(c)).length;

    $("#contest-status").innerHTML =
      chip("Barchasi", "all", true, null, SITE.contests.length) +
      chip("Qabul ochiq", "open", false, null, open) +
      chip("Yakunlangan", "done", false, null, done);

    const render = () => {
      const list = SITE.contests.filter((c) =>
        (status === "all" || (status === "open" ? isOpen(c) : !isOpen(c)))
      ).sort((a, b) => Number(isOpen(b)) - Number(isOpen(a)) || a.deadline.localeCompare(b.deadline));
      paginate($("#contest-list"), list, contestCard, 9,
        `<div class="empty"><i class="fa-regular fa-calendar-xmark"></i>Bu bo'limda hozircha tanlov yo'q</div>`);
    };

    bindChips($("#contest-status"), (v) => { status = v; render(); });
    render();

    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    }
  }

  /* ---------- Reyting ---------- */
  function reyting() {
    const max = Math.max(...SITE.faculties.map((f) => f.points));
    $("#rank-list").innerHTML = [...SITE.faculties].sort((a, b) => b.points - a.points).map((f, idx) => `
      <div class="card rank-row reveal">
        <span class="rank-no">${idx + 1}</span>
        <div class="rank-name"><strong>${esc(f.name)}</strong><span>${fmt(f.students)} faol talaba · ${esc(f.note)}</span></div>
        <div class="rank-bar"><div class="progress"><span style="width:${(f.points / max) * 100}%"></span></div></div>
        <div class="rank-points">${f.points.toFixed(1)}<small>ball</small></div>
      </div>`).join("");

    paginate($("#fame"), SITE.winners, (w) => {
      const i = initiative(w.initiativeId);
      return `
        <article class="card fame-card reveal" style="--c:${i.color}">
          <img src="${w.photo}" alt="${esc(w.name)}" loading="lazy">
          <div class="person-body">
            <span class="tag"><i class="fa-solid fa-trophy"></i> ${esc(w.place)}</span>
            <h3>${esc(w.name)}</h3>
            <div class="person-role">${esc(w.contest)}</div>
            ${w.faculty ? `<p>${esc(w.faculty)}</p>` : ""}
            <p>${esc(w.text)}</p>
            ${w.quote ? `<blockquote>${esc(w.quote)}</blockquote>` : ""}
          </div>
        </article>`;
    }, 9);
  }

  /* ---------- Kutubxona ---------- */
  function kutubxona() {
    const cats = [...new Set(SITE.books.map((b) => b.category))];
    const chips = $("#book-filters");
    chips.innerHTML = chip("Barchasi", "all", true, null, SITE.books.length) +
      cats.map((c) => chip(c, c, false, null, SITE.books.filter((b) => b.category === c).length)).join("");

    const render = (cat) => {
      const list = SITE.books.filter((b) => cat === "all" || b.category === cat);
      paginate($("#book-list"), list, (b) => `
        <article class="card card-hover book-card">
          <div class="book-cover"><img src="${b.cover}" alt="${esc(b.title)} muqovasi" loading="lazy"></div>
          <div class="book-body">
            <span class="tag tag-muted" style="align-self:flex-start">${esc(b.category)}</span>
            <h3>${esc(b.title)}</h3>
            <div class="book-author">${esc(b.author)}</div>
            <p>${esc(b.desc)}</p>
            <div class="book-foot">
              ${b.pages ? `<span><i class="fa-regular fa-file-lines"></i> ${b.pages} bet</span>` : ""}
              <span data-reads="${esc(b.id)}"><i class="fa-regular fa-eye"></i> ${fmt(b.reads || 0)} marta o'qilgan</span>
            </div>
            ${b.pdf
              ? `<button type="button" class="btn btn-primary book-read" data-read="${esc(b.id)}"><i class="fa-solid fa-book-open"></i> Mutolaa qilish</button>`
              : `<button type="button" class="btn book-read" disabled title="Kitob fayli hali yuklanmagan"><i class="fa-regular fa-clock"></i> Tez orada</button>`}
          </div>
        </article>`, 8, `<div class="empty"><i class="fa-solid fa-book"></i>Bu turkumda hozircha kitob yo'q</div>`);
    };
    bindChips(chips, render);
    render("all");

    // Kitobni sayt ichida ochish
    $("#book-list").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-read]");
      if (!btn || !window.Reader) return;
      const b = SITE.books.find((x) => String(x.id) === btn.dataset.read);
      if (!b || !b.pdf) return;
      window.Reader.open({
        id: b.id, title: b.title, author: b.author, pdf: b.pdf,
        onRead: (n) => {
          b.reads = n;
          $$(`[data-reads="${CSS.escape(String(b.id))}"]`).forEach((s) => { s.innerHTML = `<i class="fa-regular fa-eye"></i> ${fmt(n)} marta o'qilgan`; });
        }
      });
    });

    const club = SITE.clubs.find((c) => c.id === "zukko-kitobxon");
    const btn = $("#book-club-join");
    if (btn && club) btn.dataset.join = club.id;
  }

  /* ---------- Yo'riqnoma ---------- */
  function faq(el) {
    if (!el) return;
    el.innerHTML = SITE.faqs.map((f, i) => `
      <div class="card faq-item">
        <button type="button" class="faq-q" aria-expanded="false" aria-controls="faq-${i}">${esc(f.q)}<i class="fa-solid fa-plus"></i></button>
        <div class="faq-a" id="faq-${i}"><div><p>${esc(f.a)}</p></div></div>
      </div>`).join("");
    el.addEventListener("click", (e) => {
      const q = e.target.closest(".faq-q");
      if (!q) return;
      const item = q.parentElement;
      const open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", open);
    });
  }

  /* ---------- Aloqa: xarita (Leaflet + CARTO fon xaritasi, markaz emblemali belgi) ---------- */
  const UNI = [41.5563137, 60.6065737];  // Hamid Olimjon ko'chasi, 14 (OpenStreetMap)
  const LEAFLET = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/";
  function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    return new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = LEAFLET + "leaflet.min.css";
      document.head.appendChild(css);
      const s = document.createElement("script");
      s.src = LEAFLET + "leaflet.min.js";
      s.onload = () => resolve(window.L);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function contactMap() {
    const box = $("#map");
    if (!box) return;
    loadLeaflet().then((L) => {
      const map = L.map(box, { scrollWheelZoom: false, zoomControl: false, attributionControl: true }).setView(UNI, 17);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      // OpenStreetMap kataklari (kalit talab qilmaydi); minimal tus CSS filtr bilan beriladi (.map-canvas)
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      const icon = L.divIcon({
        className: "map-marker",
        html: `<span class="map-pulse"></span><span class="map-pin"><img src="assets/images/urdu_5t_emblem.png?v=2" alt=""></span>`,
        iconSize: [56, 56], iconAnchor: [28, 56]
      });
      L.marker(UNI, { icon, title: "Urganch davlat universiteti" }).addTo(map);
      // Katta ekranda belgi manzil kartochkasi ortida qolmasin
      // Manzil kartochkasi pastda turadi: belgi undan yuqoriroqda ko'rinsin
      map.panBy([0, box.clientWidth > 520 ? 50 : 30], { animate: false });
      // Sahifani aylantirayotganda xarita kattalashmasin: bosilgandan keyin g'ildirak ishlaydi
      map.on("click focus", () => map.scrollWheelZoom.enable());
      map.on("mouseout", () => map.scrollWheelZoom.disable());
    }).catch(() => {
      box.innerHTML = `<iframe class="map-fallback" title="Xarita" loading="lazy" src="https://maps.google.com/maps?q=${UNI.join(",")}&z=17&hl=uz&output=embed"></iframe>`;
    });
  }

  /* ---------- Aloqa ---------- */
  function aloqa() {
    const item = (icon, title, body) => body ? `
      <div class="contact-item"><span class="stat-icon"><i class="${icon}"></i></span><div><strong>${title}</strong>${body}</div></div>` : "";
    const phones = [U.phone].filter(Boolean).map((p) => `<a href="${tel(p)}">${esc(p)}</a>`).join("<br>");
    const mails = [U.centerEmail].filter(Boolean).map((m) => `<a href="mailto:${esc(m)}">${esc(m)}</a>`).join("<br>");
    $("#contact-info").innerHTML =
      item("fa-solid fa-location-dot", "Manzil", U.address ? `<span>${esc([U.address, U.office].filter(Boolean).join(". "))}</span>` : "") +
      item("fa-solid fa-phone", "Telefonlar", phones) +
      item("fa-solid fa-envelope", "Elektron pochta", mails) +
      item("fa-regular fa-clock", "Qabul vaqti", U.hours ? `<span>${esc(U.hours)}</span>` : "");

    $("#map-address").textContent = [U.address, U.office].filter(Boolean).join(". ");
    contactMap();

    $("#contact-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const f = new FormData(form);
      const ok = await window.UI.sendRequest(form, {
        type: "contact", name: f.get("name"), phone: f.get("phone"), topic: f.get("topic"), message: f.get("message"), website: f.get("website")
      });
      if (!ok) return;
      window.UI.toast("Xabaringiz yuborildi. Tez orada javob beramiz.");
      form.reset();
    });
  }

  /* ---------- Yangilik sahifasi (yangilik.html?id=...) — havolasini ulashish mumkin ---------- */
  const isoDate = (d) => (/^\d{2}\.\d{2}\.\d{4}$/.test(d || "") ? d.split(".").reverse().join("-") : d || "");
  function yangilik() {
    const { dmy, richHtml, richText, galleryHtml, mediaList, newsCard, initiative } = window.UI;
    const id = new URLSearchParams(location.search).get("id");
    const all = [...SITE.news].sort((a, b) => isoDate(b.date).localeCompare(isoDate(a.date)));
    const n = all.find((x) => String(x.id) === String(id));
    const box = $("#news-article");
    if (!n) {
      box.innerHTML = `<div class="empty-state card"><i class="fa-regular fa-newspaper"></i><h2>Yangilik topilmadi</h2>
        <p>Havola noto'g'ri yoki yangilik o'chirilgan bo'lishi mumkin.</p><a href="index.html" class="btn btn-primary">Bosh sahifaga</a></div>`;
      return;
    }
    const i = initiative(n.initiativeId);
    document.title = `${n.title} — UrDU Besh muhim tashabbus`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = richText(n.excerpt || n.body || "").slice(0, 200);
    const url = location.href;
    const share = encodeURIComponent(url), title = encodeURIComponent(n.title);
    box.innerHTML = `
      <nav class="crumbs" aria-label="Yo'l"><a href="index.html">Bosh sahifa</a><i class="fa-solid fa-chevron-right"></i><a href="index.html#home-news">Yangiliklar</a><i class="fa-solid fa-chevron-right"></i><span>${esc(n.title)}</span></nav>
      <article class="news-page">
        ${galleryHtml(mediaList(n), n.title)}
        <div class="news-page-body">
          <div class="dt-meta">
            <span class="dt-tag"><i class="fa-regular fa-newspaper"></i> Yangilik</span>
            ${i.id ? `<span class="dt-tag" style="color:${i.color};background:color-mix(in srgb, ${i.color} 12%, transparent)"><i class="${i.icon}"></i> ${esc(i.title)}</span>` : ""}
            <span><i class="fa-regular fa-calendar"></i> ${esc(dmy(n.date))}</span>
          </div>
          <h1>${esc(n.title)}</h1>
          ${n.excerpt ? `<div class="rich rich-lead">${richHtml(n.excerpt)}</div>` : ""}
          ${n.body ? `<div class="rich">${richHtml(n.body)}</div>` : ""}
          <div class="share">
            <span>Ulashish:</span>
            <a class="share-btn tg" href="https://t.me/share/url?url=${share}&text=${title}" target="_blank" rel="noopener" aria-label="Telegram"><i class="fa-brands fa-telegram"></i></a>
            <a class="share-btn fb" href="https://www.facebook.com/sharer/sharer.php?u=${share}" target="_blank" rel="noopener" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
            <button type="button" class="share-btn copy" id="copy-link"><i class="fa-solid fa-link"></i> <span>Havolani nusxalash</span></button>
          </div>
        </div>
      </article>`;
    $("#copy-link").addEventListener("click", async (e) => {
      const btn = e.currentTarget; // await dan keyin currentTarget bo'sh bo'lib qoladi
      const fallback = () => { const t = document.createElement("textarea"); t.value = url; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (_) {} t.remove(); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).catch(fallback); else fallback();
      btn.classList.add("done");
      btn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Nusxalandi</span>';
      window.UI.toast("Havola nusxalandi");
      setTimeout(() => { btn.classList.remove("done"); btn.innerHTML = '<i class="fa-solid fa-link"></i> <span>Havolani nusxalash</span>'; }, 2500);
    });
    const more = all.filter((x) => x !== n).slice(0, 3);
    const wrap = $("#more-news");
    if (more.length) wrap.innerHTML = more.map((x) => `
      <a class="mini-news" href="yangilik.html?id=${encodeURIComponent(x.id)}">
        <img src="${esc(mediaList(x)[0] || "assets/images/urdu_main_building.jpg")}" alt="" loading="lazy">
        <time>${esc(dmy(x.date))}</time>
        <strong>${esc(x.title)}</strong>
      </a>`).join("");
    else wrap.closest("section").hidden = true;
  }

  const routes = { home, markaz, rahbariyat, togaraklar, tanlovlar, reyting, kutubxona, aloqa, yangilik };
  SITE.load().then(() => {
    window.UI.refreshShell();
    const fn = routes[document.body.dataset.page];
    if (fn) fn();
    faq($("#faq"));
    initReveal();
  });
})();
