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
      ["fa-users", fmt(SITE.totals.students), "faol talaba"],
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
    if (slider) {
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
      SITE.clubs.filter((c) => c.initiativeId === i.id).sort((a, b) => b.enrolled - a.enrolled)[0]
    ).filter(Boolean);
    const extra = SITE.clubs.filter((c) => !featured.includes(c)).sort((a, b) => b.enrolled - a.enrolled)[0];
    if (extra) featured.push(extra);
    $("#featured-clubs").innerHTML = featured.slice(0, 6).map(clubCard).join("");

    // Statistika plitkalari — raqamlar data.js dan hisoblanadi
    const vocational = SITE.initiatives.find((i) => i.id === 5);
    const tiles = [
      ["fa-users", fmt(SITE.totals.students), "Faol talabalar"],
      ["fa-people-group", SITE.totals.clubs, "To'garaklar"],
      ["fa-trophy", SITE.contests.length, "Tanlovlar"],
      ["fa-layer-group", vocational ? vocational.clubsCount : 0, "Kasb-hunar to'garaklari"],
      ["fa-building-columns", SITE.faculties.length, "Fakultetlar"],
      ["fa-award", SITE.totals.awards, "Yutuqlar"]
    ];
    $("#home-stats").innerHTML = tiles.map(([icon, num, label]) => `
      <div class="tile">
        <i class="fa-solid ${icon}"></i>
        <strong>${num}</strong>
        <span>${label}</span>
      </div>`).join("");

    // Tanlovlar ro'yxati: avval qabul ochiqlari (muddati yaqinroq), keyin yakunlanganlar
    const contests = [...SITE.contests]
      .sort((a, b) => Number(isOpen(b)) - Number(isOpen(a)) || a.deadline.localeCompare(b.deadline))
      .slice(0, 5);
    const dmy = (iso) => iso.split("-").reverse().join(".");
    $("#home-contests").innerHTML = contests.map((c) => `
      <a class="contest-row" href="tanlovlar.html#${c.id}">
        <img src="${c.image}" alt="" loading="lazy">
        <span>
          <strong>${esc(c.title)}</strong>
          <small><i class="fa-regular fa-clock"></i> ${isOpen(c) ? `${dmy(c.deadline)} gacha` : "Yakunlangan"}</small>
        </span>
      </a>`).join("");

    $("#home-news").innerHTML = SITE.news.map(newsCard).join("");
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
            <ul class="check-list">${i.highlights.map((h) => `<li><i class="fa-solid fa-circle-check"></i>${esc(h)}</li>`).join("")}</ul>
            <div class="mini-stats">
              <div><strong>${i.clubsCount}</strong><span>to'garak</span></div>
              <div><strong>${fmt(i.students)}</strong><span>talaba</span></div>
              <div><strong>${i.awards}</strong><span>sovrin</span></div>
            </div>
            ${l ? `<div class="mentor">${avatar(l.name, l.photo)}<div><strong>${esc(l.name)}</strong><span>Yo'nalish sardori</span></div></div>` : ""}
            <a class="link-arrow" href="togaraklar.html?t=${i.id}" style="color:${i.color}">To'garaklarni ko'rish <i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </article>`;
    }).join("");
  }

  /* ---------- Rahbariyat ---------- */
  function rahbariyat() {
    const h = SITE.head;
    $("#head-card").innerHTML = `
      <div class="person-photo"><img src="${h.photo}" alt="${esc(h.name)}"></div>
      <div class="person-body">
        <h3>${esc(h.name)}</h3>
        <div class="person-role">${esc(h.role)}</div>
        <div class="meta">
          <div><i class="fa-solid fa-phone"></i><a href="${tel(h.phone)}">${esc(h.phone)}</a></div>
        </div>
      </div>`;

    // Sahifada 1–3-tashabbus sardorlari ko'rsatiladi (rahbar kartasi bilan bir xil uslubda)
    $("#leaders").innerHTML = SITE.leaders.filter((l) => l.initiativeId <= 3).map((l) => {
      const i = initiative(l.initiativeId);
      return `
        <article class="card head-card leader-card reveal" style="--c:${i.color}">
          <div class="person-photo">
            <img src="${l.photo}" alt="${esc(l.name)}" loading="lazy">
          </div>
          <div class="person-body">
            <h3>${esc(l.name)}</h3>
            <div class="person-role">${esc(i.title)} yo'nalishi sardori</div>
            <div class="meta">
              <div><i class="fa-solid fa-phone"></i><a href="${tel(l.phone)}">${esc(l.phone)}</a></div>
            </div>
          </div>
        </article>`;
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
      SITE.initiatives.map((i) => chip(i.title, String(i.id), filter === String(i.id), i.color, SITE.clubs.filter((c) => c.initiativeId === i.id).length)).join("");

    const render = () => {
      const q = query.trim().toLowerCase();
      const list = SITE.clubs.filter((c) =>
        (filter === "all" || c.initiativeId === Number(filter)) &&
        (!q || [c.name, c.category, c.mentor, c.desc, c.place].some((f) => f.toLowerCase().includes(q)))
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
            <div class="book-foot"><span><i class="fa-regular fa-file-lines"></i> ${b.pages} bet</span></div>
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
  const fn = routes[document.body.dataset.page];
  if (fn) fn();
  faq($("#faq"));
  initReveal();
})();
