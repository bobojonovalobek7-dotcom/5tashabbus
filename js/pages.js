/**
 * Har bir sahifaning dinamik qismlari (ma'lumot js/data.js dan olinadi).
 * <body data-page="..."> qiymatiga qarab kerakli funksiya ishga tushadi.
 */
(function () {
  "use strict";

  const { $, $$, esc, tel, fmt, initiative, avatar, clubCard, contestCard, newsCard, initiativeCard, daysLeft, initReveal } = window.UI;
  const U = SITE.university;
  const params = new URLSearchParams(location.search);

  const isOpen = (c) => c.status === "active" && daysLeft(c.deadline) >= 0;

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

  function chip(label, value, active, color, count) {
    return `<button type="button" class="chip${active ? " active" : ""}" data-value="${esc(value)}"${color ? ` style="--c:${color}"` : ""}>
      ${color ? '<span class="dot"></span>' : ""}${esc(label)}${count !== undefined ? ` <span class="count">${count}</span>` : ""}
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

  /* ---------- Bosh sahifa ---------- */
  function home() {
    // Yutuqlar slayderi
    const slider = $("#slider");
    if (slider && SITE.winners.length) {
      const W = SITE.winners;
      slider.innerHTML = W.map((w, idx) => `
        <div class="slide${idx === 0 ? " active" : ""}" aria-hidden="${idx !== 0}">
          <img src="${w.photo}" alt="${esc(w.name)} — ${esc(w.contest)}">
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

    // Statistika plitkalari: dashboardda qiymat yozilmagan bo'lsa, ro'yxatlardan hisoblanadi
    const groupClubs = (id) => (SITE.groups.find((i) => i.id === id) || {}).clubsCount || 0;
    const auto = {
      students: fmt(SITE.totals.students),
      clubs: SITE.totals.clubs,
      contests: SITE.contests.length,
      group5: groupClubs(5),
      group6: groupClubs(6),
      awards: SITE.totals.awards
    };
    $("#home-stats").innerHTML = SITE.stats.map((s) => `
      <div class="tile">
        <i class="fa-solid ${esc(s.icon)}"></i>
        <strong>${esc(s.value !== "" && s.value != null ? s.value : auto[s.id] ?? 0)}</strong>
        <span>${esc(s.label)}</span>
      </div>`).join("");

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
          <small><i class="fa-regular fa-clock"></i> ${isOpen(c) ? `${dmy(c.deadline)} gacha` : "Yakunlangan"}</small>
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
    const leaders = SITE.leaders;
    $("#initiative-rows").innerHTML = SITE.initiatives.map((i) => {
      const l = leaders.find((x) => x.initiativeId === i.id);
      return `
        <article class="card init-row reveal" id="t${i.id}">
          <div class="init-row-media"><img src="${i.image}" alt="${esc(i.title)}" loading="lazy"></div>
          <div class="init-row-body" style="--c:${i.color}">
            <span class="tag" style="--c:${i.color}"><i class="${i.icon}"></i> ${i.id}-tashabbus</span>
            <h3>${esc(i.title)}</h3>
            <p>${esc(i.about)}</p>
            <ul class="check-list">${SITE.clubs.filter((c) => c.initiativeId === i.id).sort((a, b) => (b.students || 0) - (a.students || 0)).slice(0, 4).map((c) => `<li><i class="fa-solid fa-circle-check"></i>${esc(c.name)}</li>`).join("")}</ul>
            <div class="mini-stats">
              <div><strong>${i.clubsCount}</strong><span>to'garak</span></div>
              <div><strong>${fmt(i.students)}</strong><span>o'quvchi</span></div>
              <div><strong>${i.awards || 0}</strong><span>sovrin</span></div>
            </div>
            ${l ? `<div class="mentor">${avatar(l.name, l.photo)}<div><strong>${esc(l.name)}</strong><span>Yo'nalish sardori</span></div></div>` : ""}
            <a class="link-arrow" href="togaraklar.html?t=${i.id}" style="color:${i.color}">To'garaklarni ko'rish <i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </article>`;
    }).join("");
  }

  /* ---------- Rahbariyat ---------- */
  function rahbariyat() {
    const card = (p, role) => `
      <div class="person-photo">${p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy">` : avatar(p.name)}</div>
      <div class="person-body">
        <h3>${esc(p.name)}</h3>
        <div class="person-role">${esc(role)}</div>
        ${p.phone ? `<div class="meta"><div><i class="fa-solid fa-phone"></i><a href="${tel(p.phone)}">${esc(p.phone)}</a></div></div>` : ""}
      </div>`;

    const h = SITE.head;
    const headEl = $("#head-card");
    if (h && h.showOnPage !== false) headEl.innerHTML = card(h, h.role || "Markaz rahbari");
    else headEl.remove();

    // Dashboardda "Rahbariyat sahifasida ko'rsatilsin" belgilangan sardorlar
    $("#leaders").innerHTML = SITE.leaders
      .filter((l) => (l.showOnPage === undefined ? l.initiativeId <= 3 : l.showOnPage))
      .map((l) => {
        const i = initiative(l.initiativeId);
        return `<article class="card head-card leader-card reveal" style="--c:${i.color}">${card(l, l.role || `${i.title} yo'nalishi sardori`)}</article>`;
      }).join("");
  }

  /* ---------- To'garaklar ---------- */
  function togaraklar() {
    let filter = params.get("t") || "all";
    let query = params.get("q") || "";
    const chips = $("#club-filters");
    const input = $("#club-search");
    input.value = query;

    chips.innerHTML = chip("Barchasi", "all", filter === "all", null, SITE.clubs.length) +
      SITE.groups.map((i) => chip(i.title, String(i.id), filter === String(i.id), i.color, SITE.clubs.filter((c) => c.initiativeId === i.id).length)).join("");

    const render = () => {
      const q = query.trim().toLowerCase();
      const list = SITE.clubs.filter((c) =>
        (filter === "all" || c.initiativeId === Number(filter)) &&
        (!q || [c.name, c.place, c.schedule, c.mentors.join(" ")].some((f) => (f || "").toLowerCase().includes(q)))
      );
      $("#club-count").textContent = `${list.length} ta to'garak topildi`;
      $("#club-list").innerHTML = list.length
        ? list.map(clubCard).join("")
        : `<div class="empty"><i class="fa-solid fa-magnifying-glass"></i>Hech narsa topilmadi. Boshqa so'z bilan qidirib ko'ring.</div>`;
      const url = new URL(location.href);
      filter === "all" ? url.searchParams.delete("t") : url.searchParams.set("t", filter);
      query ? url.searchParams.set("q", query) : url.searchParams.delete("q");
      history.replaceState(null, "", url);
    };

    bindChips(chips, (v) => { filter = v; render(); });
    input.addEventListener("input", (e) => { query = e.target.value; render(); });
    render();
  }

  /* ---------- Tanlovlar ---------- */
  function tanlovlar() {
    let status = "all";
    let init = "all";
    const open = SITE.contests.filter(isOpen).length;
    const done = SITE.contests.filter((c) => c.status === "completed").length;

    $("#contest-status").innerHTML =
      chip("Barchasi", "all", true, null, SITE.contests.length) +
      chip("Qabul ochiq", "open", false, null, open) +
      chip("Yakunlangan", "done", false, null, done);
    $("#contest-init").innerHTML = chip("Barcha yo'nalishlar", "all", true) +
      SITE.initiatives.map((i) => chip(i.title, String(i.id), false, i.color)).join("");

    const render = () => {
      const list = SITE.contests.filter((c) =>
        (status === "all" || (status === "open" ? isOpen(c) : c.status === "completed")) &&
        (init === "all" || c.initiativeId === Number(init))
      ).sort((a, b) => Number(isOpen(b)) - Number(isOpen(a)) || a.deadline.localeCompare(b.deadline));
      $("#contest-list").innerHTML = list.length
        ? list.map(contestCard).join("")
        : `<div class="empty"><i class="fa-regular fa-calendar-xmark"></i>Bu bo'limda hozircha tanlov yo'q</div>`;
    };

    bindChips($("#contest-status"), (v) => { status = v; render(); });
    bindChips($("#contest-init"), (v) => { init = v; render(); });
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

    $("#fame").innerHTML = SITE.winners.map((w) => {
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
    }).join("");
  }

  /* ---------- Kutubxona ---------- */
  function kutubxona() {
    const cats = [...new Set(SITE.books.map((b) => b.category))];
    const chips = $("#book-filters");
    chips.innerHTML = chip("Barchasi", "all", true, null, SITE.books.length) +
      cats.map((c) => chip(c, c, false, null, SITE.books.filter((b) => b.category === c).length)).join("");

    const render = (cat) => {
      const list = SITE.books.filter((b) => cat === "all" || b.category === cat);
      $("#book-list").innerHTML = list.map((b) => `
        <article class="card card-hover book-card">
          <div class="book-cover"><img src="${b.cover}" alt="${esc(b.title)} muqovasi" loading="lazy"></div>
          <div class="book-body">
            <span class="tag tag-muted" style="align-self:flex-start">${esc(b.category)}</span>
            <h3>${esc(b.title)}</h3>
            <div class="book-author">${esc(b.author)}</div>
            <p>${esc(b.desc)}</p>
            ${b.pages ? `<div class="book-foot"><span><i class="fa-regular fa-file-lines"></i> ${b.pages} bet</span></div>` : ""}
          </div>
        </article>`).join("");
    };
    bindChips(chips, render);
    render("all");

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

  /* ---------- Aloqa ---------- */
  function aloqa() {
    const item = (icon, title, body) => body ? `
      <div class="contact-item"><span class="stat-icon"><i class="${icon}"></i></span><div><strong>${title}</strong>${body}</div></div>` : "";
    const phones = [U.phone, U.youthPhone].filter(Boolean).map((p) => `<a href="${tel(p)}">${esc(p)}</a>`).join("<br>");
    const mails = [U.centerEmail, U.email].filter(Boolean).map((m) => `<a href="mailto:${esc(m)}">${esc(m)}</a>`).join("<br>");
    $("#contact-info").innerHTML =
      item("fa-solid fa-location-dot", "Manzil", U.address ? `<span>${esc([U.address, U.office].filter(Boolean).join(". "))}</span>` : "") +
      item("fa-solid fa-phone", "Telefonlar", phones) +
      item("fa-solid fa-envelope", "Elektron pochta", mails) +
      item("fa-regular fa-clock", "Qabul vaqti", U.hours ? `<span>${esc(U.hours)}</span>` : "");

    $("#contact-leaders").innerHTML = SITE.leaders.map((l) => {
      const i = initiative(l.initiativeId);
      return `
        <div class="mentor" style="--c:${i.color}">
          ${avatar(l.name, l.photo)}
          <div style="flex:1"><strong>${esc(l.name)}</strong><span>${i.id}. ${esc(i.title)}</span></div>
          <a class="icon-btn" href="${tel(l.phone)}" aria-label="${esc(l.name)} — qo'ng'iroq"><i class="fa-solid fa-phone"></i></a>
        </div>`;
    }).join("");

    $("#contact-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const body = `${f.get("message")}\n\n— ${f.get("name")}, ${f.get("phone")}`;
      location.href = `mailto:${U.centerEmail}?subject=${encodeURIComponent(f.get("topic"))}&body=${encodeURIComponent(body)}`;
      window.UI.toast("Pochta ilovasi ochildi — xatni yuborishni unutmang.");
      e.target.reset();
    });
  }

  const routes = { home, markaz, rahbariyat, togaraklar, tanlovlar, reyting, kutubxona, aloqa };
  SITE.load().then(() => {
    window.UI.refreshShell();
    const fn = routes[document.body.dataset.page];
    if (fn) fn();
    faq($("#faq"));
    initReveal();
  });
})();
