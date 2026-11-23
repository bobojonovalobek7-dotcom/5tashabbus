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
    const g5 = SITE.groups.find((i) => i.id === 5) || {};
    const courses = SITE.courses || [];
    // Kurslar hali kiritilmagan bo'lsa, kasb-hunar (5-yo'nalish) to'garaklari olinadi
    const auto = {
      students: { value: fmt(SITE.totals.students) },
      clubs: { value: SITE.totals.clubs, sub: SITE.totals.students, subLabel: "nafar talaba a'zo" },
      courses: courses.length
        ? { value: courses.length, sub: sum(courses, "enrolled"), subLabel: "nafar talaba o'qimoqda" }
        : { value: g5.clubsCount || 0, sub: g5.students || 0, subLabel: "nafar talaba o'qimoqda" },
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
    const active = SITE.totals.students + (courses.length ? sum(courses, "enrolled") : 0);
    const share = total ? Math.min(100, Math.round((active / total) * 100)) : 0;
    $("#home-stats").innerHTML = (head ? `
      <div class="sb-hero">
        <div class="sb-main">
          <span class="sb-kicker"><i class="fa-solid ${esc(head.icon)}"></i> ${esc(head.label)}</span>
          <strong class="sb-big">${esc(num(head.shown))}${head.unit ? `<small>${esc(head.unit)}</small>` : ""}</strong>
          ${share ? `<p class="sb-note"><b>${fmt(active)}</b> nafari to'garak va kurslarda shug'ullanadi</p>` : ""}
        </div>
        ${share ? `<div class="sb-ring" style="--p:${share}" role="img" aria-label="Talabalarning ${share} foizi faol">
          <span><b>${share}%</b><small>faol</small></span></div>` : ""}
      </div>` : "") + `
      <div class="sb-grid">${rest.map((r) => `
        <div class="sb-cell">
          <span class="sb-ic"><i class="fa-solid ${esc(r.icon)}"></i></span>
          <strong>${esc(num(r.shown))}${r.unit ? `<small>${esc(r.unit)}</small>` : ""}</strong>
          <span class="sb-label">${esc(r.label)}</span>
          ${r.subN ? `<em>${esc(num(r.subN))} ${esc(r.subLabel)}</em>` : ""}
        </div>`).join("")}
      </div>`;

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
      return i ? `${i.title} yo'nalishi sardori` : "";
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
    const { courseCard, COURSE_COLOR } = window.UI;
    const courses = SITE.courses || [];
    // Kurslar hali kiritilmagan bo'lsa, kasb-hunar (5-yo'nalish) to'garaklari ko'rsatiladi — statistikadagi kabi
    const courseItems = courses.length ? courses.map((c) => ({ c, card: courseCard })) : SITE.clubs.filter((c) => c.initiativeId === 5).map((c) => ({ c, card: clubCard }));
    const other = SITE.groups.find((g) => g.id === 6);
    const items = SITE.groups.filter((g) => g.id <= 5).map((g) => [g.title, String(g.id), g.color])
      .concat([["Kasbga o'qitish kurslari", "courses", COURSE_COLOR]])
      .concat(other ? [[other.title, "6", other.color]] : []);
    const countOf = (v) => (v === "courses" ? courseItems.length : SITE.clubs.filter((c) => c.initiativeId === Number(v)).length);
    chips.innerHTML = items.map(([label, v, color]) => chip(label, v, filter === v, color, countOf(v))).join("");

    const render = () => {
      const norm = (s) => (window.ALIFBO ? ALIFBO.norm(s) : String(s || "").toLowerCase());
      const q = norm(query.trim());
      const list = filter === "courses"
        ? courseItems
        : SITE.clubs.filter((c) =>
            (filter === "all" || c.initiativeId === Number(filter)) &&
            (!q || [c.name, c.place, c.schedule, c.mentors.join(" ")].some((f) => norm(f || "").includes(q)))
          ).map((c) => ({ c, card: clubCard }));
      $("#club-count").textContent = filter === "courses" && courses.length ? `${list.length} ta kurs` : `${list.length} ta to'garak`;
      $("#club-list").innerHTML = list.length
        ? list.map(({ c, card }) => card(c)).join("")
        : `<div class="empty"><i class="fa-regular fa-folder-open"></i>Bu bo'limda hozircha hech narsa yo'q</div>`;
      const url = new URL(location.href);
      filter === "all" ? url.searchParams.delete("t") : url.searchParams.set("t", filter);
      history.replaceState(null, "", url);
    };

    chips.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      filter = filter === b.dataset.value ? "all" : b.dataset.value;
      $$(".chip", chips).forEach((x) => x.classList.toggle("active", x.dataset.value === filter));
      render();
    });
    render();
  }

  /* ---------- Tanlovlar ---------- */
  function tanlovlar() {
    let status = "all";
    const open = SITE.contests.filter(isOpen).length;
    const done = SITE.contests.filter((c) => c.status === "completed").length;

    $("#contest-status").innerHTML =
      chip("Barchasi", "all", true, null, SITE.contests.length) +
      chip("Qabul ochiq", "open", false, null, open) +
      chip("Yakunlangan", "done", false, null, done);

    const render = () => {
      const list = SITE.contests.filter((c) =>
        (status === "all" || (status === "open" ? isOpen(c) : c.status === "completed"))
      ).sort((a, b) => Number(isOpen(b)) - Number(isOpen(a)) || a.deadline.localeCompare(b.deadline));
      $("#contest-list").innerHTML = list.length
        ? list.map(contestCard).join("")
        : `<div class="empty"><i class="fa-regular fa-calendar-xmark"></i>Bu bo'limda hozircha tanlov yo'q</div>`;
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
            <div class="book-foot">
              ${b.pages ? `<span><i class="fa-regular fa-file-lines"></i> ${b.pages} bet</span>` : ""}
              <span data-reads="${esc(b.id)}"><i class="fa-regular fa-eye"></i> ${fmt(b.reads || 0)} marta o'qilgan</span>
            </div>
            ${b.pdf
              ? `<button type="button" class="btn btn-primary book-read" data-read="${esc(b.id)}"><i class="fa-solid fa-book-open"></i> Mutolaa qilish</button>`
              : `<button type="button" class="btn book-read" disabled title="Kitob fayli hali yuklanmagan"><i class="fa-regular fa-clock"></i> Tez orada</button>`}
          </div>
        </article>`).join("");
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
        html: `<span class="map-pulse"></span><span class="map-pin"><img src="assets/images/urdu_5t_emblem.png" alt=""></span>`,
        iconSize: [56, 56], iconAnchor: [28, 56]
      });
      L.marker(UNI, { icon, title: "Urganch davlat universiteti" }).addTo(map);
      // Katta ekranda belgi manzil kartochkasi ortida qolmasin
      if (box.clientWidth > 760) map.panBy([-Math.round(box.clientWidth * 0.17), -20], { animate: false });
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
    const phones = [U.phone, U.youthPhone].filter(Boolean).map((p) => `<a href="${tel(p)}">${esc(p)}</a>`).join("<br>");
    const mails = [U.centerEmail, U.email].filter(Boolean).map((m) => `<a href="mailto:${esc(m)}">${esc(m)}</a>`).join("<br>");
    $("#contact-info").innerHTML =
      item("fa-solid fa-location-dot", "Manzil", U.address ? `<span>${esc([U.address, U.office].filter(Boolean).join(". "))}</span>` : "") +
      item("fa-solid fa-phone", "Telefonlar", phones) +
      item("fa-solid fa-envelope", "Elektron pochta", mails) +
      item("fa-regular fa-clock", "Qabul vaqti", U.hours ? `<span>${esc(U.hours)}</span>` : "");

    $("#map-address").textContent = [U.address, U.office].filter(Boolean).join(". ");
    contactMap();

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
