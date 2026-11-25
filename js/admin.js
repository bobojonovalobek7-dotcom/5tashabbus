/**
 * Admin panel: saytning barcha bo'limlarini qo'shish, tahrirlash, o'chirish.
 * Bo'limlar va ularning maydonlari serverdan (api/schema) olinadi,
 * barcha o'zgarishlar backend/server.py orqali serverdagi bazaga yoziladi.
 */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const group = (id) => SITE.groups.find((g) => g.id === Number(id));
  const dmy = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d || "") ? d.split("-").reverse().join(".") : d || "");

  // Chap menyu: bo'limlar va ochilib-yopiladigan guruhlar.
  // Sxemada bor, lekin bu yerda yo'q bo'limlar «Bo'limlar» oxiriga qo'shiladi.
  const NAV = [
    { title: "Asosiy", items: ["dashboard", "control"] },
    { title: "Bo'limlar", items: [
      { id: "g-clubs", label: "To'garak va kurslar", icon: "fa-people-group", items: ["clubs", "courses", "groups"] },
      { id: "g-news", label: "Yangilik va slayd-shou", icon: "fa-newspaper", items: ["news", "slides"] },
      "contests",
      { id: "g-results", label: "Natijalar", icon: "fa-chart-simple", items: ["faculties", "winners", "stats"] },
      "books",
      { id: "g-settings", label: "Sozlamalar", icon: "fa-gear", items: ["staff", "settings", "requests", "faqs"] }
    ] }
  ];
  const ORDER = NAV.flatMap((s) => s.items.flatMap((x) => (typeof x === "string" ? [x] : x.items)));
  const groupOf = (k) => NAV.flatMap((s) => s.items).find((x) => typeof x !== "string" && x.items.includes(k));
  const ICONS = {
    dashboard: "fa-gauge-high", control: "fa-shield-halved",
    clubs: "fa-people-group", courses: "fa-briefcase", groups: "fa-layer-group",
    news: "fa-newspaper", slides: "fa-images", contests: "fa-trophy",
    faculties: "fa-ranking-star", winners: "fa-medal", stats: "fa-chart-pie", books: "fa-book",
    staff: "fa-user-tie", settings: "fa-address-book", requests: "fa-inbox", faqs: "fa-circle-question"
  };
  // Menyudagi nomlar (bo'sh bo'lsa sxemadagi nom olinadi)
  const NAV_LABEL = {
    clubs: "To'garaklar", courses: "Kasbga o'qitish kurslari", groups: "Yo'nalishlar", news: "Yangiliklar", slides: "Slayd-shou",
    faculties: "Reyting", winners: "Shon-sharaf doskasi", books: "Kutubxona", staff: "Rahbariyat", settings: "Aloqa",
    faqs: "Ko'p beriladigan savollar"
  };

  const state = {
    schema: {}, kinds: [], kind: "dashboard", items: {}, editing: null, query: "", rating: "all", metric: "students",
    reqFilter: "all", open: new Set()
  };
  // "Bosh panel", "Nazorat" va "Murojaatlar" — sxemadagi oddiy bo'lim emas, alohida ko'rinish
  const DASH = { label: "Bosh panel", mode: "view", fields: [] };
  const CONTROL = { label: "Nazorat", mode: "view", fields: [] };
  const REQUESTS = { label: "Murojaatlar", one: "Murojaat", mode: "view", fields: [] };
  const VIRTUAL = { dashboard: DASH, control: CONTROL, requests: REQUESTS };
  const schemaOf = (k) => VIRTUAL[k] || state.schema[k];
  const S = () => schemaOf(state.kind);
  const navLabel = (k) => NAV_LABEL[k] || schemaOf(k).label;

  /* ---------- API ---------- */
  async function api(method, path, body) {
    const res = await fetch(`api/${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
      cache: "no-store"
    });
    let data = null;
    try { data = await res.json(); } catch (e) { /* bo'sh javob */ }
    if (!res.ok) {
      if (res.status === 401 && path !== "login") showLogin();
      throw new Error((data && data.error) || `Xato: ${res.status}`);
    }
    return data;
  }

  /* ---------- Ko'rinishlar ---------- */
  function show(view) {
    ["login-view", "admin-view", "offline-view"].forEach((id) => { $("#" + id).hidden = id !== view; });
  }
  function showLogin() { show("login-view"); setTimeout(() => $("#password").focus(), 50); }

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>${esc(msg)}</span>`;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
  }

  /* ---------- Ro'yxat ---------- */
  async function loadAll() {
    const [all, requests] = await Promise.all([api("GET", "all"), api("GET", "requests").catch(() => [])]);
    state.items = all;
    state.items.requests = requests || [];
    SITE.apply(state.items);  // yo'nalish nomlari va h.k. yangilansin
    render();
  }

  // Yozuvning qatordagi qisqa izohi
  function subtitle(kind, it) {
    const g = it.initiativeId !== undefined && group(it.initiativeId);
    switch (kind) {
      case "clubs": return [g && g.title, it.students ? `${it.students} o'quvchi` : "", (it.mentors || []).join(", "), it.ratingNote];
      case "courses": return [it.teacher, it.duration, it.schedule, it.certificate ? "sertifikat beriladi" : ""];
      case "contests": return [it.deadline ? `${dmy(it.deadline)} gacha` : it.period, daysTo(it.deadline) !== null && daysTo(it.deadline) < 0 ? "Yakunlangan" : "Faol", it.doc ? "Nizomi bor" : ""];
      case "news": return [dmy(it.date), g && g.title];
      case "staff": return [it.role, it.phone, it.telegram && it.telegram.replace(/^https:\/\/t\.me\//, "@"), it.showOnPage === false ? "sahifada ko'rinmaydi" : ""];
      case "stats": return [it.value ? `Qiymat: ${it.value}` : "Avtomatik hisoblanadi"];
      case "groups": return [Number(it.id) <= 5 ? `${it.id}-tashabbus` : "Qo'shimcha yo'nalish", it.awards ? `${it.awards} sovrin` : ""];
      case "winners": return [it.place, it.contest];
      case "faculties": return [`${it.points} ball`, it.students ? `${it.students} talaba` : "", it.note];
      case "books": return [it.author, it.category, it.pdf ? "PDF yuklangan" : "PDF yo'q", it.reads ? `${it.reads} marta o'qilgan` : ""];
      case "faqs": return [String(it.a || "").slice(0, 90)];
      case "slides": return [it.caption ? "Bosh sahifa slayderi" : "Izohsiz slayd"];
      case "settings": return [it.phone, it.centerEmail, it.address];
      default: return [];
    }
  }

  function thumbOf(kind, it) {
    const f = (state.schema[kind].fields || []).find((x) => x.type === "image" || x.type === "images");
    if (!f) return null;
    const v = it[f.key];
    return (Array.isArray(v) ? v[0] : v) || it.image || "";
  }

  const issueCount = (issues) => issues.filter((i) => i.lv !== "info").length;
  const initials = (name) => String(name || "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  /* ---------- Chap menyu va yuqori panel ---------- */
  const newRequests = () => (state.items.requests || []).filter((r) => r.status === "new").length;
  // Diqqat talab qiladigan son (sariq belgi): Nazorat — kamchiliklar, Murojaatlar — yangilari
  const alertCount = (k, issues) => (k === "control" ? issueCount(issues) : k === "requests" ? newRequests() : 0);

  function navItem(k, issues, sub) {
    const s = schemaOf(k);
    const alert = alertCount(k, issues);
    const n = (state.items[k] || []).length;
    const badge = alert ? `<span class="badge gold">${alert}</span>` : s.mode === "list" ? `<span class="badge">${n}</span>` : "";
    const on = k === state.kind;
    return `<button type="button" class="nav-item${sub ? " sub" : ""}${on ? " active" : ""}${alert ? " alert" : ""}" data-kind="${k}"${on ? ' aria-current="page"' : ""}>
      <i class="fa-solid ${ICONS[k] || "fa-folder"}"></i><span>${esc(navLabel(k))}</span>${badge}</button>`;
  }

  function renderNav(issues) {
    const extra = state.kinds.filter((k) => !ORDER.includes(k));
    $("#side-nav").innerHTML = NAV.map((sec, i) => {
      const items = sec.items.concat(i === NAV.length - 1 ? extra : []);
      const html = items.map((x) => {
        if (typeof x === "string") return state.kinds.includes(x) ? navItem(x, issues) : "";
        const kids = x.items.filter((k) => state.kinds.includes(k));
        if (!kids.length) return "";
        const open = state.open.has(x.id);
        const alert = kids.reduce((a, k) => a + alertCount(k, issues), 0);
        const has = kids.includes(state.kind);
        return `<button type="button" class="nav-group${has ? " has-active" : ""}" data-group="${x.id}" aria-expanded="${open}">
            <i class="fa-solid ${x.icon}"></i><span>${esc(x.label)}</span>
            ${alert && !open ? `<span class="badge gold">${alert}</span>` : ""}<i class="fa-solid fa-chevron-down chev"></i></button>
          <div class="nav-sub"${open ? "" : " hidden"}>${kids.map((k) => navItem(k, issues, true)).join("")}</div>`;
      }).join("");
      return html ? `<div class="nav-sec">${sec.title}</div>${html}` : "";
    }).join("");
  }

  // Ochiq guruhlar brauzerda eslab qolinadi; hozirgi bo'limning guruhi doim ochiq
  function saveOpen() { try { localStorage.setItem("urdu5t-admin-open", JSON.stringify([...state.open])); } catch (e) { /* muhim emas */ } }
  function loadOpen() { try { (JSON.parse(localStorage.getItem("urdu5t-admin-open")) || []).forEach((g) => state.open.add(g)); } catch (e) { /* muhim emas */ } }
  function openGroupOf(k) { const g = groupOf(k); if (g && !state.open.has(g.id)) { state.open.add(g.id); saveOpen(); } }

  function renderHeader() {
    const k = state.kind, s = S();
    const title = k === "dashboard" ? "Bosh panel" : navLabel(k);
    let sub = `${location.host || "5tashabbus"} · boshqaruv`;
    if (k === "control") sub = "Saytdagi ma'lumotlarning avtomatik tekshiruvi";
    else if (k === "requests") sub = `${(state.items.requests || []).length} ta murojaat · ${newRequests()} ta yangi`;
    else if (k !== "dashboard") sub = s.mode === "list" ? `${(state.items[k] || []).length} ta yozuv · ${s.label}` : s.label;
    $("#page-title").textContent = title;
    $("#page-sub").textContent = sub;
    document.title = `${title} — Besh muhim tashabbus boshqaruvi`;

    const staff = state.items.staff || [];
    const head = staff.find((p) => !Number(p.initiativeId)) || staff[0];
    $("#user-box").innerHTML = head
      ? `${head.photo ? `<img class="avatar" src="${esc(head.photo)}" alt="">` : `<span class="avatar">${esc(initials(head.name))}</span>`}
         <div><strong>${esc(head.name)}</strong><small>${esc(head.role || "Markaz rahbari")}</small></div>`
      : `<span class="avatar"><i class="fa-solid fa-user-shield"></i></span><div><strong>Administrator</strong><small>Boshqaruv paneli</small></div>`;
  }

  /* ---------- Bosh panel ---------- */
  function contestPill(c) {
    const d = daysTo(c.deadline);
    if (d === null) return `<span class="pill muted">muddatsiz</span>`;
    if (d < 0) return `<span class="pill late">muddati o'tgan</span>`;
    if (d === 0) return `<span class="pill soon">bugun</span>`;
    return `<span class="pill${d <= 7 ? " soon" : ""}">${d} kun</span>`;
  }
  const thumbHtml = (src) => (src ? `<img src="${esc(src)}" alt="" loading="lazy">` : `<span class="ph"><i class="fa-regular fa-image"></i></span>`);

  function dashHtml(issues) {
    const it = state.items;
    const clubs = it.clubs || [], contests = it.contests || [], staff = it.staff || [], news = it.news || [];
    const groups = SITE.groups.map((g) => {
      const cl = clubs.filter((c) => Number(c.initiativeId) === g.id);
      return { ...g, clubs: cl.length, members: sum(cl, "students") };
    }).filter((g) => g.clubs || g.id <= 5);

    const members = sum(clubs, "students");
    const dirs = new Set(clubs.map((c) => Number(c.initiativeId)).filter(Boolean)).size;
    const open = contests.filter((c) => c.status !== "completed")
      .sort((a, b) => (daysTo(a.deadline) ?? 1e9) - (daysTo(b.deadline) ?? 1e9));
    const active = open.filter((c) => daysTo(c.deadline) === null || daysTo(c.deadline) >= 0);
    const nearest = active.map((c) => daysTo(c.deadline)).find((d) => d !== null);
    const awards = sum(SITE.groups, "awards");
    const mentors = new Set(clubs.flatMap((c) => c.mentors || []).map((m) => String(m).trim().toLowerCase()).filter(Boolean)).size;
    const complete = clubs.length ? pct(clubs.filter((c) => !clubProblems(c).length).length, clubs.length) : 100;
    const nIssues = issueCount(issues), bad = issues.filter((i) => i.lv === "bad").length;

    const notice = nIssues
      ? `<div class="notice"><i class="fa-solid fa-circle-info"></i>
          <span>Ma'lumotlar <b>${dmy(today())}</b> holatiga. Nazoratda <b>${bad} ta muhim</b> va <b>${nIssues - bad} ta e'tibor talab qiladigan</b> kamchilik bor.</span>
          <button type="button" class="btn btn-outline btn-sm" data-xls="report"><i class="fa-solid fa-file-excel"></i> Excel hisobot</button>
          <button type="button" class="btn btn-outline btn-sm" data-go="control"><i class="fa-solid fa-shield-halved"></i> Nazoratga o'tish</button></div>`
      : `<div class="notice ok"><i class="fa-solid fa-circle-check"></i>
          <span>Ma'lumotlar <b>${dmy(today())}</b> holatiga. Muhim kamchilik topilmadi.</span>
          <button type="button" class="btn btn-outline btn-sm" data-xls="report"><i class="fa-solid fa-file-excel"></i> Excel hisobot</button></div>`;

    const stat = (go, ic, val, label, sub, primary) => `
      <button type="button" class="stat${primary ? " primary" : ""}" data-kpi="${go}" title="Batafsil ko'rish">
        <span class="ic"><i class="fa-solid ${ic}"></i></span><b>${val}</b><span class="lbl">${label}</span><small>${sub}</small>
      </button>`;
    // Bosh sahifadagi «Statistika» bilan bir xil manba: Jami talabalar — Statistika bo'limidan
    const statRow = (id) => (it.stats || []).find((s) => s.id === id) || {};
    const totalStudents = Number(String(statRow("students").value || "").replace(/\s/g, "")) || 0;
    const courses = it.courses || [];
    const courseCount = courses.length;
    // Tanlov ishtirokchilari — «Statistika» bo'limidagi «Tanlovlar» pastki raqami
    const participants = Number(String(statRow("contests").sub || "").replace(/\s/g, "")) || 0;
    const stats = `<div class="stat-grid">
      ${stat("students", "fa-user-graduate", totalStudents ? fmtN(totalStudents) : "—", "Jami talabalar",
        totalStudents ? `${pct(members, totalStudents)}% i to'garaklarda` : "Statistika bo'limida kiriting", true)}
      ${stat("clubs", "fa-people-group", fmtN(clubs.length), "To'garaklar", `${dirs} ta yo'nalish bo'yicha`)}
      ${stat("members", "fa-users", fmtN(members), "To'garak a'zolari", `o'rtacha ${clubs.length ? Math.round(members / clubs.length) : 0} nafar / to'garak`)}
      ${stat("courses", "fa-screwdriver-wrench", fmtN(courseCount), "Kasbga o'qitish kurslari", courseCount ? `${courses.filter((c) => c.certificate).length} tasida sertifikat` : "hali kurs kiritilmagan")}
      ${stat("books", "fa-book", fmtN((it.books || []).length), "Kitoblar", "kutubxonada tavsiya etilgan")}
      ${stat("contests", "fa-trophy", active.length, "Faol tanlovlar", nearest !== undefined ? `eng yaqin muddat: ${nearest} kun` : "muddati yaqin tanlov yo'q")}
      ${stat("participants", "fa-user-check", participants ? fmtN(participants) : "—", "Tanlov ishtirokchilari", participants ? `${contests.length} ta tanlov bo'yicha` : "Statistika bo'limida kiriting")}
      ${stat("awards", "fa-award", fmtN(awards), "Yutuqlar", `${(it.winners || []).length} ta shon-sharaf egasi`)}
      ${stat("mentors", "fa-chalkboard-user", fmtN(mentors), "To'garak rahbarlari", `${staff.length} ta markaz xodimi`)}
      ${stat("control", "fa-shield-halved", `${complete}%`, "Ma'lumotlar to'liqligi", `${nIssues} ta muammo nazoratda`)}
    </div>`;

    const m = state.metric;
    const val = (g) => (m === "clubs" ? g.clubs : g.members);
    const max = Math.max(1, ...groups.map(val));
    const bars = groups.slice().sort((a, b) => val(b) - val(a)).map((g) => `
      <button type="button" class="bar-row" style="--c:${esc(g.color || "var(--brand)")}" data-go="groups" data-id="${g.id}" title="${esc(g.title)}: tahrirlash">
        <span class="bar-name"><span class="bar-ic"><i class="${esc(g.icon || "fa-solid fa-layer-group")}"></i></span><span class="bar-title">${esc(g.title)}</span></span>
        <span class="bar-track"><span class="bar-fill" style="width:${((val(g) / max) * 100).toFixed(1)}%"></span></span>
        <span class="bar-val"><b>${fmtN(val(g))}</b><small>${m === "clubs" ? `${fmtN(g.members)} a'zo` : `${g.clubs} to'garak`}</small></span>
      </button>`).join("");
    const chart = `<div class="panel">
      <div class="panel-head">
        <div><h2>${m === "clubs" ? "To'garaklar soni" : "A'zolar soni"} — yo'nalishlar kesimida</h2><p>Har bir tashabbus bo'yicha qamrov</p></div>
        <div class="seg" role="group" aria-label="Ko'rsatkich">
          <button type="button" class="${m === "students" ? "on" : ""}" data-metric="students" aria-pressed="${m === "students"}">A'zolar</button>
          <button type="button" class="${m === "clubs" ? "on" : ""}" data-metric="clubs" aria-pressed="${m === "clubs"}">To'garaklar</button>
        </div>
      </div>
      ${bars || `<div class="empty"><i class="fa-regular fa-folder-open"></i>To'garaklar hali kiritilmagan</div>`}
    </div>`;

    const deadlines = `<div class="panel">
      <div class="panel-head"><div><h2>Tanlovlar muddati</h2><p>Faol tanlovlar, muddati bo'yicha</p></div><button type="button" class="more" data-go="contests">Barchasi →</button></div>
      ${open.slice(0, 5).map((c) => `
        <button type="button" class="li" data-go="contests" data-id="${esc(c.id)}">
          ${thumbHtml(thumbOf("contests", c))}
          <span><strong>${esc(c.title || "—")}</strong><small>${esc([gTitle(c.initiativeId), c.deadline ? `${dmy(c.deadline)} gacha` : c.period].filter(Boolean).join(" · "))}</small></span>
          ${contestPill(c)}
        </button>`).join("") || `<div class="empty"><i class="fa-solid fa-trophy"></i>Faol tanlov yo'q</div>`}
    </div>`;

    const latest = news.slice().sort((a, b) => (toIso(a.date) < toIso(b.date) ? 1 : -1)).slice(0, 4);
    const newsPanel = `<div class="panel">
      <div class="panel-head"><div><h2>Oxirgi yangiliklar</h2><p>Saytda e'lon qilingan</p></div><button type="button" class="more" data-go="news">Barchasi →</button></div>
      ${latest.map((n) => `
        <button type="button" class="li" data-go="news" data-id="${esc(n.id)}">
          ${thumbHtml(thumbOf("news", n))}
          <span><strong>${esc(n.title || "—")}</strong><small>${esc([dmy(n.date), gTitle(n.initiativeId)].filter(Boolean).join(" · "))}</small></span>
          <span></span>
        </button>`).join("") || `<div class="empty"><i class="fa-regular fa-newspaper"></i>Yangilik yo'q</div>`}
    </div>`;

    const rc = ratingCounts(clubs);
    const COLORS = { green: "var(--green)", yellow: "#E2A30B", red: "var(--red)", none: "var(--border)" };
    const NAMES = { green: "Yashil — a'lo", yellow: "Sariq — qoniqarli", red: "Qizil — qoniqarsiz", none: "Baholanmagan" };
    const ratingPanel = `<div class="panel">
      <div class="panel-head"><div><h2>To'garaklar bahosi</h2><p>Svetofor tizimi bo'yicha</p></div><button type="button" class="more" data-go="clubs">Baholash →</button></div>
      <div class="stack">${Object.keys(COLORS).map((k) => (rc[k] ? `<i style="width:${pct(rc[k], clubs.length)}%;background:${COLORS[k]}" title="${NAMES[k]}: ${rc[k]}"></i>` : "")).join("")}</div>
      <div class="legend">${Object.keys(COLORS).map((k) => `
        <button type="button" data-go="clubs" data-rating="${k}"><span class="dot" style="background:${COLORS[k]}"></span><span>${NAMES[k]}</span><b>${rc[k]}</b></button>`).join("")}
      </div>
    </div>`;

    const issuesPanel = `<div class="panel">
      <div class="panel-head"><div><h2>Nazorat</h2><p>Birinchi navbatda hal qilish kerak</p></div><button type="button" class="more" data-go="control">Barchasi →</button></div>
      ${issues.slice(0, 4).map((i) => `
        <button type="button" class="mini-issue ${i.lv}" data-go="control"><i class="fa-solid ${i.ic}"></i><span><strong>${esc(i.t)}</strong><small>${esc(i.sub)}</small></span></button>`).join("")
        || `<div class="empty"><i class="fa-solid fa-circle-check" style="color:var(--green)"></i>Kamchilik topilmadi</div>`}
    </div>`;

    return `${notice}${stats}<div class="dash-grid">${chart}${deadlines}</div><div class="dash-grid three">${newsPanel}${ratingPanel}${issuesPanel}</div>`;
  }

  /* ---------- Bosh panel: ko'rsatkich bosilganda batafsil oyna (infografika) ---------- */
  // Gorizontal ustunlar: [{ label, value, color, note }]
  function barsHtml(rows, unit) {
    const max = Math.max(1, ...rows.map((r) => r.value));
    return rows.length ? `<div class="kbars">${rows.map((r) => `
      <div class="kbar" style="--c:${esc(r.color || "var(--brand)")}">
        <span class="kbar-label" title="${esc(r.label)}">${esc(r.label)}</span>
        <span class="kbar-track"><span style="width:${((r.value / max) * 100).toFixed(1)}%"></span></span>
        <span class="kbar-val"><b>${fmtN(r.value)}</b>${unit ? ` ${unit}` : ""}${r.note ? `<small>${esc(r.note)}</small>` : ""}</span>
      </div>`).join("")}</div>` : `<p class="kmuted">Ma'lumot yo'q</p>`;
  }
  // Halqa: ulush foizda
  const ringHtml = (p, label, color) => `
    <div class="kring" style="--p:${Math.min(100, Math.max(0, p))};--c:${color || "var(--brand)"}"><span><b>${p}%</b><small>${esc(label)}</small></span></div>`;
  // Kichik raqamli kataklar
  const tilesHtml = (tiles) => `<div class="ktiles">${tiles.map(([v, l]) => `<div><b>${v}</b><span>${esc(l)}</span></div>`).join("")}</div>`;

  function kpiHtml(key) {
    const it = state.items;
    const clubs = it.clubs || [], contests = it.contests || [], books = it.books || [], courses = it.courses || [];
    const groups = SITE.groups.map((g) => {
      const cl = clubs.filter((c) => Number(c.initiativeId) === g.id);
      return { ...g, clubs: cl.length, members: sum(cl, "students") };
    }).filter((g) => g.clubs);
    const members = sum(clubs, "students");
    const statRow = (id) => (it.stats || []).find((s) => s.id === id) || {};
    const total = Number(String(statRow("students").value || "").replace(/\s/g, "")) || 0;
    const head = (ic, val, label, sub) => `
      <div class="khead"><span class="kic"><i class="fa-solid ${ic}"></i></span>
        <div><b>${val}</b><h2>${esc(label)}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}</div></div>`;
    const go = (kind, label) => `<div class="kfoot"><button type="button" class="btn btn-primary btn-sm" data-go="${kind}">${esc(label)} <i class="fa-solid fa-arrow-right"></i></button></div>`;
    const section = (title, body) => `<section class="ksec"><h3>${esc(title)}</h3>${body}</section>`;

    switch (key) {
      case "students": {
        const share = total ? pct(members, total) : 0;
        return head("fa-user-graduate", total ? fmtN(total) : "—", "Jami talabalar", "«Statistika» bo'limidagi qiymat") +
          `<div class="kgrid">${ringHtml(share, "faol")}${tilesHtml([[fmtN(members), "to'garak a'zosi"], [fmtN(Math.max(0, total - members)), "hali qatnashmagan"]])}</div>` +
          section("Yo'nalishlar bo'yicha qamrov", barsHtml(groups.map((g) => ({ label: g.title, value: g.members, color: g.color, note: total ? `${pct(g.members, total)}%` : "" })), "nafar")) +
          go("stats", "Statistikani tahrirlash");
      }
      case "clubs":
        return head("fa-people-group", fmtN(clubs.length), "To'garaklar", `${groups.length} ta yo'nalish bo'yicha`) +
          section("Yo'nalishlar kesimida", barsHtml(groups.map((g) => ({ label: g.title, value: g.clubs, color: g.color })).sort((a, b) => b.value - a.value), "ta")) +
          section("Eng ko'p a'zoli to'garaklar", barsHtml(clubs.slice().sort((a, b) => (b.students || 0) - (a.students || 0)).slice(0, 6)
            .map((c) => ({ label: c.name, value: +c.students || 0, color: (group(c.initiativeId) || {}).color })), "a'zo")) +
          go("clubs", "To'garaklarga o'tish");
      case "members": {
        const buckets = [["1–20", 0, 20], ["21–50", 21, 50], ["51–100", 51, 100], ["101–300", 101, 300], ["300+", 301, 1e9]]
          .map(([l, a, b]) => ({ label: `${l} a'zoli`, value: clubs.filter((c) => (+c.students || 0) >= a && (+c.students || 0) <= b).length }));
        return head("fa-users", fmtN(members), "To'garak a'zolari", `o'rtacha ${clubs.length ? Math.round(members / clubs.length) : 0} nafar bir to'garakda`) +
          section("Yo'nalishlar bo'yicha", barsHtml(groups.map((g) => ({ label: g.title, value: g.members, color: g.color, note: `${g.clubs} to'garak` })).sort((a, b) => b.value - a.value), "nafar")) +
          section("To'garaklar hajmi", barsHtml(buckets, "ta")) + go("clubs", "To'garaklarga o'tish");
      }
      case "courses": {
        return head("fa-screwdriver-wrench", fmtN(courses.length), "Kasbga o'qitish kurslari", courses.length ? "" : "Hali kurs kiritilmagan") +
          (courses.length ? tilesHtml([[fmtN(courses.filter((c) => c.certificate).length), "sertifikatli"], [fmtN(new Set(courses.map((c) => c.teacher).filter(Boolean)).size), "usta"]]) +
            section("Kurslar", `<ul class="klist">${courses.map((c) => `<li><span>${esc(c.name)}</span><small>${esc([c.duration, c.teacher].filter(Boolean).join(" · "))}</small></li>`).join("")}</ul>`) : "") +
          go("courses", "Kurslarga o'tish");
      }
      case "books": {
        const reads = sum(books, "reads");
        return head("fa-book", fmtN(books.length), "Kitoblar", `${fmtN(reads)} marta o'qilgan`) +
          tilesHtml([[fmtN(books.filter((b) => b.pdf).length), "saytda o'qiladi"], [fmtN(books.filter((b) => !b.pdf).length), "PDF yuklanmagan"], [fmtN(new Set(books.map((b) => b.category)).size), "turkum"]]) +
          section("Eng ko'p o'qilganlar", barsHtml(books.slice().sort((a, b) => (b.reads || 0) - (a.reads || 0)).map((b) => ({ label: b.title, value: +b.reads || 0, note: b.author })), "marta")) +
          go("books", "Kutubxonaga o'tish");
      }
      case "contests":
      case "participants": {
        const rows = contests.slice().sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)));
        const open = rows.filter((c) => daysTo(c.deadline) !== null && daysTo(c.deadline) >= 0);
        const part = Number(String(statRow("contests").sub || "").replace(/\s/g, "")) || 0;
        return head(key === "contests" ? "fa-trophy" : "fa-user-check", key === "contests" ? fmtN(open.length) : part ? fmtN(part) : "—",
          key === "contests" ? "Faol tanlovlar" : "Tanlov ishtirokchilari", key === "contests" ? `jami ${contests.length} ta tanlov` : "«Statistika» bo'limidagi «Tanlovlar» pastki raqami") +
          (contests.length ? `<div class="kgrid">${ringHtml(pct(open.length, contests.length), "ochiq", "var(--green)")}${tilesHtml([[open.length, "qabul ochiq"], [contests.length - open.length, "yakunlangan"], [contests.filter((c) => c.doc).length, "nizomi bor"]])}</div>` : "") +
          section("Muddatlar", rows.length ? `<ul class="klist">${rows.map((c) => `<li><span>${esc(c.title)}</span>${contestPill(c)}</li>`).join("")}</ul>` : `<p class="kmuted">Tanlov yo'q</p>`) +
          go(key === "contests" ? "contests" : "stats", key === "contests" ? "Tanlovlarga o'tish" : "Statistikani tahrirlash");
      }
      case "awards":
        return head("fa-award", fmtN(sum(SITE.groups, "awards")), "Yutuqlar", `${(it.winners || []).length} ta shon-sharaf egasi`) +
          section("Sovrinli o'rinlar — yo'nalishlar bo'yicha", barsHtml(SITE.groups.filter((g) => g.awards).map((g) => ({ label: g.title, value: +g.awards || 0, color: g.color })).sort((a, b) => b.value - a.value), "ta")) +
          section("Shon-sharaf doskasi", (it.winners || []).length ? `<ul class="klist">${it.winners.map((w) => `<li><span>${esc(w.name)}</span><small>${esc([w.place, w.contest].filter(Boolean).join(" · "))}</small></li>`).join("")}</ul>` : `<p class="kmuted">Hali kiritilmagan</p>`) +
          go("winners", "Shon-sharaf doskasiga o'tish");
      case "mentors": {
        const count = {};
        clubs.forEach((c) => (c.mentors || []).forEach((m) => { const k = String(m).trim(); if (k) count[k] = (count[k] || 0) + 1; }));
        const top = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value }));
        return head("fa-chalkboard-user", fmtN(Object.keys(count).length), "To'garak rahbarlari", `${(it.staff || []).length} ta markaz xodimi`) +
          tilesHtml([[fmtN(clubs.filter((c) => (c.mentors || []).length > 1).length), "bir nechta rahbarli to'garak"], [fmtN(clubs.filter((c) => !(c.mentors || []).length).length), "rahbarsiz to'garak"]]) +
          section("Eng ko'p to'garak olib boruvchilar", barsHtml(top, "to'garak")) + go("staff", "Rahbariyatga o'tish");
      }
      case "control": {
        const issues = computeIssues();
        const n = (lv) => issues.filter((i) => i.lv === lv).length;
        const complete = clubs.length ? pct(clubs.filter((c) => !clubProblems(c).length).length, clubs.length) : 100;
        return head("fa-shield-halved", `${complete}%`, "Ma'lumotlar to'liqligi", "to'garak ma'lumotlari to'liq kiritilgan ulush") +
          `<div class="kgrid">${ringHtml(complete, "to'liq", complete >= 80 ? "var(--green)" : "#E2A30B")}${tilesHtml([[n("bad"), "muhim"], [n("warn"), "e'tibor bering"], [n("info"), "maslahat"]])}</div>` +
          section("Kamchiliklar", issues.length ? `<ul class="klist">${issues.slice(0, 8).map((i) => `<li class="${i.lv}"><span><i class="fa-solid ${i.ic}"></i> ${esc(i.t)}</span></li>`).join("")}</ul>` : `<p class="kmuted">Kamchilik yo'q</p>`) +
          go("control", "Nazoratga o'tish");
      }
      default: return "";
    }
  }

  function openKpi(key) {
    const html = kpiHtml(key);
    if (!html) return;
    $("#kpi-content").innerHTML = html;
    $("#kpi-modal").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  /* ---------- Butun panel bo'ylab qidiruv ---------- */
  // Qidiruvda eski (sh, o') va yangi (ş, ö) yozuv bir xil hisoblanadi
  const norm = (s) => (window.ALIFBO ? ALIFBO.norm(s) : String(s ?? "").toLowerCase());

  function searchAll(q) {
    q = norm(q.trim());
    if (!q) return [];
    const out = [];
    state.kinds.forEach((k) => {
      if (VIRTUAL[k]) return;
      const s = state.schema[k];
      (state.items[k] || []).forEach((it) => {
        const title = String(it[s.title] || it.name || it.title || "");
        const sub = subtitle(k, it).filter(Boolean).join(" · ");
        const t = norm(title);
        if (t.includes(q) || norm(sub).includes(q)) out.push({ k, it, title, sub, score: t.startsWith(q) ? 0 : t.includes(q) ? 1 : 2 });
      });
    });
    return out.sort((a, b) => a.score - b.score).slice(0, 12);
  }

  function render() {
    const issues = computeIssues();
    renderNav(issues);
    renderHeader();
    const isDash = state.kind === "dashboard";
    $("#dash-view").hidden = !isDash;
    $("#list-view").hidden = isDash;
    if (isDash) {
      $("#dash-view").innerHTML = dashHtml(issues);
      return;
    }

    const s = S();
    const isControl = state.kind === "control";
    $("#toolbar").hidden = isControl;
    $("#add-btn").hidden = s.mode !== "list";
    $("#add-label").textContent = `${s.one} qo'shish`;
    $("#kind-note").hidden = !s.note;
    $("#kind-note").textContent = s.note || "";
    $("#kind-tools").innerHTML = toolsHtml(state.kind);
    if (isControl) {
      $("#kind-extra").innerHTML = "";
      $("#rows").innerHTML = controlHtml(issues);
      return;
    }
    if (state.kind === "requests") {
      $("#kind-extra").innerHTML = requestChipsHtml();
      $("#rows").innerHTML = requestsHtml();
      return;
    }

    const q = norm(state.query.trim());
    let list = (state.items[state.kind] || []).filter((it) => !q || norm(JSON.stringify(it)).includes(q));
    if (state.kind === "clubs" && state.rating !== "all") list = list.filter((c) => (RATING[c.rating] ? c.rating : "none") === state.rating);
    $("#kind-extra").innerHTML = extraHtml(state.kind);
    const sortable = s.sortable && !q;
    $("#rows").innerHTML = list.length ? list.map((it, idx) => {
      const thumb = thumbOf(state.kind, it);
      return `
        <div class="card row${thumb === null ? " no-thumb" : ""}${state.kind === "clubs" ? " has-lights" : ""}${state.kind === "clubs" && RATING[it.rating] ? " rated-" + it.rating : ""}">
          ${thumb === null ? "" : thumb ? `<img class="thumb" src="${esc(thumb)}" alt="" loading="lazy">` : `<span class="thumb none"><i class="fa-regular fa-image"></i></span>`}
          <div class="row-text">
            <strong>${esc(it[s.title] || it.name || it.title || "—")}</strong>
            <small>${esc(subtitle(state.kind, it).filter(Boolean).join(" · "))}</small>
          </div>
          <div class="actions">
            ${state.kind === "clubs" ? lightsHtml(it) : ""}
            ${sortable ? `<button type="button" class="icon-btn" data-move="${esc(it.id)}" data-dir="-1" aria-label="Yuqoriga"${idx === 0 ? " disabled" : ""}><i class="fa-solid fa-arrow-up"></i></button>
            <button type="button" class="icon-btn" data-move="${esc(it.id)}" data-dir="1" aria-label="Pastga"${idx === list.length - 1 ? " disabled" : ""}><i class="fa-solid fa-arrow-down"></i></button>` : ""}
            <button type="button" class="icon-btn" data-edit="${esc(it.id)}" aria-label="Tahrirlash"><i class="fa-solid fa-pen"></i></button>
            ${s.mode === "list" ? `<button type="button" class="icon-btn danger" data-del="${esc(it.id)}" aria-label="O'chirish"><i class="fa-solid fa-trash"></i></button>` : ""}
          </div>
        </div>`;
    }).join("") : `<div class="empty"><i class="fa-regular fa-folder-open"></i>Hech narsa topilmadi</div>`;
  }

  /* ---------- Baholash (svetofor) ---------- */
  const RATING = {
    green: { l: "Yashil", d: "A'lo — talabga to'liq javob beradi", ic: "fa-circle-check" },
    yellow: { l: "Sariq", d: "Qoniqarli — e'tibor va yordam kerak", ic: "fa-circle-exclamation" },
    red: { l: "Qizil", d: "Qoniqarsiz — zudlik bilan chora ko'rish kerak", ic: "fa-circle-xmark" }
  };
  const COURSE_STATUS = { open: "Qabul ochiq", running: "O'qish davom etmoqda", planned: "Rejalashtirilgan", finished: "Yakunlangan" };
  const pct = (a, b) => (b ? Math.round(((+a || 0) / b) * 100) : 0);
  const sum = (list, k) => list.reduce((acc, x) => acc + (+x[k] || 0), 0);
  const fmtN = (n) => String(Math.round(+n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  function clubProblems(c) {
    const p = [];
    if (!c.place) p.push("joy");
    if (!c.schedule) p.push("jadval");
    if (c.students == null || c.students === "") p.push("a'zolar soni");
    if (!c.phones || !c.phones.length) p.push("telefon");
    else if (c.phones.some((x) => !x.tel)) p.push("telefon formati");
    return p;
  }
  // Tavsiya: ma'lumot to'liqligi va a'zolar soniga qarab
  function suggestRating(c) {
    const n = +c.students || 0;
    if (!c.place || !c.schedule || c.students == null || c.students === "" || n < 10) return "red";
    if (clubProblems(c).length || n < 15) return "yellow";
    return "green";
  }
  const ratingCounts = (list) => list.reduce((r, c) => (r[RATING[c.rating] ? c.rating : "none"]++, r), { green: 0, yellow: 0, red: 0, none: 0 });

  function lightsHtml(c) {
    return `<span class="lights" role="group" aria-label="Baho">${Object.keys(RATING).map((k) =>
      `<button type="button" class="light ${k}${c.rating === k ? " on" : ""}" data-rate="${esc(c.id)}" data-val="${k}"
        title="${RATING[k].l}: ${RATING[k].d}${c.rating === k ? ". Qayta bossangiz, baho olib tashlanadi" : ""}" aria-pressed="${c.rating === k}"><i class="fa-solid ${RATING[k].ic}"></i></button>`).join("")}</span>`;
  }

  async function rate(ratings, auto) {
    state.items.clubs = await api("POST", "clubs/rating", { ratings, auto: !!auto });
    render();
  }

  /* ---------- Bo'lim ustidagi qo'shimcha tugmalar va xulosa ---------- */
  function toolsHtml(kind) {
    const xls = `<button type="button" class="btn btn-outline" data-xls="${kind}"><i class="fa-solid fa-file-excel"></i> Excel</button>`;
    if (kind === "requests") return (state.items.requests || []).length ? xls : "";
    if (kind === "clubs") return `<button type="button" class="btn btn-outline" id="auto-rate" title="Baholanmagan to'garaklarga tavsiya etilgan bahoni qo'yadi"><i class="fa-solid fa-wand-magic-sparkles"></i> Avtomatik baholash</button><button type="button" class="btn btn-outline" id="reset-rate" title="Barcha to'garaklardan bahoni olib tashlaydi"><i class="fa-solid fa-rotate-left"></i> Baholashni bekor qilish</button>${xls}`;
    // Excel faqat shu bo'limlarda (Bosh paneldagi «Excel hisobot» alohida)
    const EXCEL = ["clubs", "courses", "contests", "faculties", "stats", "requests"];
    if (!EXCEL.includes(kind) || (kind !== "courses" && !(state.items[kind] || []).length)) return "";
    return xls;
  }

  function extraHtml(kind) {
    if (kind === "clubs") {
      const all = state.items.clubs || [];
      const rc = ratingCounts(all);
      const chip = (k, label, icon) => `<button type="button" class="chip rate-chip ${k}${state.rating === k ? " active" : ""}" data-rating="${k}">${icon} ${label} <span class="count">${k === "all" ? all.length : rc[k]}</span></button>`;
      return `<div class="chips rate-chips">${chip("all", "Barchasi", "")}${Object.keys(RATING).map((k) => chip(k, RATING[k].l, `<i class="fa-solid ${RATING[k].ic}"></i>`)).join("")}${chip("none", "Baholanmagan", '<i class="fa-regular fa-circle"></i>')}</div>`;
    }
    return "";
  }

  /* ---------- Nazorat: saytdagi kamchiliklar ---------- */
  const daysTo = (iso) => (/^\d{4}-\d{2}-\d{2}$/.test(iso || "") ? Math.round((new Date(iso + "T00:00:00") - new Date(new Date().toDateString())) / 864e5) : null);
  const toIso = (d) => (/^\d{2}\.\d{2}\.\d{4}$/.test(d || "") ? d.split(".").reverse().join("-") : d || "");

  function computeIssues() {
    const I = [];
    const it = state.items;
    if (!it.clubs) return I;
    const titleOf = (kind, r) => r[(state.schema[kind] || {}).title] || r.name || r.title || r.id;
    const refs = (kind, list) => list.map((r) => ({ kind, id: r.id, label: titleOf(kind, r) }));
    const add = (lv, ic, t, sub, items) => { if (items.length) I.push({ lv, ic, t, sub, items }); };
    const clubs = it.clubs || [], contests = it.contests || [], courses = it.courses || [];
    let x;

    x = clubs.filter((c) => !c.place);
    add("bad", "fa-location-dot", `${x.length} ta to'garakda joy ko'rsatilmagan`, "Talabalar to'garakni topa olmaydi: saytdagi kartochkada joy bo'sh chiqadi.", refs("clubs", x));
    x = clubs.filter((c) => !c.schedule);
    add("bad", "fa-calendar-xmark", `${x.length} ta to'garakda dars jadvali yo'q`, "Jadvalsiz to'garakka ariza tushmaydi.", refs("clubs", x));
    x = clubs.filter((c) => c.students == null || c.students === "");
    add("warn", "fa-users-slash", `${x.length} ta to'garakda a'zolar soni kiritilmagan`, "Statistikada bu to'garaklar 0 deb hisoblanadi.", refs("clubs", x));
    x = clubs.filter((c) => !c.phones || !c.phones.length);
    add("warn", "fa-phone-slash", `${x.length} ta to'garakda telefon yo'q`, "Ariza bergan talaba bilan bog'lanib bo'lmaydi.", refs("clubs", x));
    x = clubs.filter((c) => (c.phones || []).some((p) => !p.tel));
    add("warn", "fa-triangle-exclamation", `${x.length} ta to'garakda telefon raqami noto'g'ri`, "Raqam +998 XX XXX-XX-XX ko'rinishida bo'lmasa, «Qo'ng'iroq» tugmasi ishlamaydi.", refs("clubs", x));
    const seen = {};
    clubs.forEach((c) => { const k = String(c.name || "").replace(/["“”«»]/g, "").trim().toLowerCase(); (seen[k] = seen[k] || []).push(c); });
    x = Object.values(seen).filter((a) => a.length > 1).flat();
    add("warn", "fa-clone", `Takrorlangan to'garak nomlari (${x.length} ta yozuv)`, "Birlashtirish yoki nomini aniqlashtirish kerak.", refs("clubs", x));
    x = clubs.filter((c) => c.rating === "red");
    add("bad", "fa-circle-xmark", `${x.length} ta to'garak «Qizil» baho olgan`, "Rahbari bilan suhbat o'tkazing, sababini aniqlang va qayta baholang.", refs("clubs", x));
    x = clubs.filter((c) => !RATING[c.rating]);
    if (x.length) I.push({ lv: "info", ic: "fa-traffic-light", t: `${x.length} ta to'garak hali baholanmagan`, sub: "To'garaklar bo'limidagi «Avtomatik baholash» tugmasi tavsiya etilgan bahoni qo'yadi.", items: [{ kind: "clubs", label: "To'garaklarga o'tish" }] });

    x = contests.filter((c) => c.status !== "completed" && daysTo(c.deadline) >= 0 && daysTo(c.deadline) <= 7);
    add("info", "fa-bell", `${x.length} ta tanlov muddati 7 kun ichida tugaydi`, "Natijalarni e'lon qilishga tayyorlaning.", refs("contests", x));

    const last = (it.news || []).map((n) => toIso(n.date)).sort().pop();
    const ago = last ? -daysTo(last) : null;
    if (!last || ago > 14) I.push({ lv: "warn", ic: "fa-newspaper", t: last ? `Oxirgi yangilik ${ago} kun oldin chiqqan` : "Saytda yangilik yo'q", sub: "Saytni jonli saqlash uchun haftasiga kamida 1–2 ta yangilik joylang.", items: [{ kind: "news", add: true, label: "+ Yangilik qo'shish" }] });

    x = (it.groups || []).filter((g) => !g.image || !g.about);
    add("warn", "fa-image", `${x.length} ta yo'nalish ma'lumoti to'liq emas`, "Rasm yoki batafsil matn yetishmaydi.", refs("groups", x));
    x = (it.staff || []).filter((p) => !p.photo && p.showOnPage !== false);
    add("info", "fa-camera", `${x.length} ta xodimning rasmi yo'q`, "Rahbariyat sahifasida rasm o'rniga bosh harflar ko'rinadi.", refs("staff", x));

    x = courses.filter((c) => !c.teacher || !c.place);
    add("warn", "fa-chalkboard-user", `${x.length} ta kursda usta yoki joy ko'rsatilmagan`, "Kursga yozilmoqchi bo'lganlar kim bilan bog'lanishni bilmaydi.", refs("courses", x));

    const st = (it.settings || [])[0] || {};
    const empty = { phone: "Telefon", centerEmail: "Markaz pochtasi", address: "Manzil", hours: "Qabul vaqti", telegram: "Telegram", instagram: "Instagram" };
    x = Object.keys(empty).filter((k) => !st[k]);
    if (x.length) I.push({ lv: "info", ic: "fa-address-card", t: `Aloqa bo'limida ${x.length} ta maydon bo'sh`, sub: `${x.map((k) => empty[k]).join(", ")}: saytda ko'rinmaydi.`, items: [{ kind: "settings", id: st.id || "site", label: "Aloqa ma'lumotlarini ochish" }] });

    const nReq = (it.requests || []).filter((r) => r.status === "new").length;
    if (nReq) I.push({ lv: "warn", ic: "fa-inbox", t: `${nReq} ta yangi murojaat javob kutmoqda`, sub: "Saytdan kelgan a'zo bo'lish arizalari va aloqa xabarlari.", items: [{ kind: "requests", label: "Murojaatlarni ochish" }] });

    const order = { bad: 0, warn: 1, info: 2 };
    return I.sort((a, b) => order[a.lv] - order[b.lv]);
  }

  function controlHtml(issues) {
    if (!issues.length) return `<div class="empty"><i class="fa-solid fa-circle-check" style="color:var(--green)"></i>Kamchilik topilmadi. Hammasi joyida!</div>`;
    const n = (lv) => issues.filter((i) => i.lv === lv).length;
    const LV = { bad: "Muhim", warn: "E'tibor bering", info: "Maslahat" };
    return `<p class="kind-note">Saytdagi ma'lumotlar avtomatik tekshirildi: <b>${n("bad")}</b> ta muhim, <b>${n("warn")}</b> ta e'tibor talab qiladigan, <b>${n("info")}</b> ta maslahat. Yozuv nomini bossangiz, tahrirlash oynasi ochiladi.</p>` +
      issues.map((i) => `
        <div class="card issue ${i.lv}">
          <span class="issue-ic"><i class="fa-solid ${i.ic}"></i></span>
          <div>
            <span class="issue-lv">${LV[i.lv]}</span>
            <strong>${esc(i.t)}</strong>
            <small>${esc(i.sub)}</small>
            <div class="issue-items">${i.items.slice(0, 40).map((r) => `<button type="button" class="link-chip" data-go="${esc(r.kind)}"${r.id ? ` data-id="${esc(r.id)}"` : ""}${r.add ? " data-add" : ""}>${esc(r.label)}</button>`).join("")}${i.items.length > 40 ? `<span class="hint">va yana ${i.items.length - 40} ta</span>` : ""}</div>
          </div>
        </div>`).join("");
  }

  /* ---------- Murojaatlar: Aloqa xabarlari va to'garakka a'zo bo'lish arizalari ---------- */
  const REQ_STATUS = {
    new: { l: "Yangi", c: "var(--brand)", ic: "fa-circle" },
    read: { l: "O'qildi", c: "#E2A30B", ic: "fa-eye" },
    done: { l: "Bajarildi", c: "var(--green)", ic: "fa-circle-check" }
  };
  // Keyingi qadam: yangi → o'qildi → bajarildi → (qayta ochish) o'qildi
  const REQ_NEXT = { new: ["read", "O'qildi", "fa-eye"], read: ["done", "Bajarildi", "fa-check"], done: ["read", "Qayta ochish", "fa-rotate-left"] };
  const reqDate = (t) => {
    if (!t) return "";
    const d = new Date(t * 1000), p = (n) => String(n).padStart(2, "0");
    return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  const reqClub = (r) => r.club || ((state.items.clubs || []).find((c) => String(c.id) === String(r.clubId)) || {}).name || "";

  function filteredRequests() {
    const q = norm(state.query.trim());
    const f = state.reqFilter;
    return (state.items.requests || []).filter((r) =>
      (f === "all" || (f === "new" ? r.status === "new" : r.type === f)) && (!q || norm(JSON.stringify(r)).includes(q)));
  }

  function requestChipsHtml() {
    const all = state.items.requests || [];
    const chip = (v, label, n, icon) => `<button type="button" class="chip${state.reqFilter === v ? " active" : ""}" data-req-filter="${v}">${icon ? `<i class="fa-solid ${icon}"></i> ` : ""}${label} <span class="count">${n}</span></button>`;
    return `<div class="chips">${chip("all", "Barchasi", all.length)}${chip("new", "Yangi", all.filter((r) => r.status === "new").length, "fa-circle")}${
      chip("join", "A'zo bo'lish arizalari", all.filter((r) => r.type === "join").length, "fa-user-plus")}${
      chip("contact", "Aloqa xabarlari", all.filter((r) => r.type === "contact").length, "fa-envelope")}</div>`;
  }

  function requestsHtml() {
    const list = filteredRequests();
    if (!list.length) {
      return (state.items.requests || []).length
        ? `<div class="empty"><i class="fa-regular fa-folder-open"></i>Bu filtrda murojaat yo'q</div>`
        : `<div class="empty"><i class="fa-solid fa-inbox"></i>Hozircha murojaat yo'q. Saytdagi «Aloqa» shakli va to'garakka «A'zo bo'lish» arizalari shu yerga tushadi.</div>`;
    }
    return list.map((r) => {
      const st = REQ_STATUS[r.status] || REQ_STATUS.new;
      const nx = REQ_NEXT[r.status] || REQ_NEXT.new;
      const join = r.type === "join";
      const telHref = String(r.phone || "").replace(/[^\d+]/g, "");
      const about = join ? [reqClub(r), r.group].filter(Boolean).join(" · ") : r.topic || "";
      return `
        <div class="card req ${r.status}" style="--c:${st.c}">
          <span class="req-ic"><i class="fa-solid ${join ? "fa-user-plus" : "fa-envelope"}"></i></span>
          <div class="req-main">
            <div class="req-head">
              <strong>${esc(r.name)}</strong>
              <span class="req-type">${join ? "A'zo bo'lish arizasi" : "Aloqa xabari"}</span>
              <span class="req-status"><i class="fa-solid ${st.ic}"></i> ${st.l}</span>
            </div>
            <div class="req-meta">
              ${r.phone ? `<a href="tel:${esc(telHref)}"><i class="fa-solid fa-phone"></i> ${esc(r.phone)}</a>` : ""}
              ${about ? `<span><i class="fa-solid ${join ? "fa-people-group" : "fa-tag"}"></i> ${esc(about)}</span>` : ""}
              <span><i class="fa-regular fa-clock"></i> ${reqDate(r.createdAt)}</span>
            </div>
            ${r.message ? `<p class="req-msg">${esc(r.message)}</p>` : ""}
          </div>
          <div class="actions">
            <button type="button" class="btn btn-outline btn-sm" data-req-status="${esc(r.id)}" data-val="${nx[0]}"><i class="fa-solid ${nx[2]}"></i> ${nx[1]}</button>
            <button type="button" class="icon-btn danger" data-req-del="${esc(r.id)}" aria-label="O'chirish"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>`;
    }).join("");
  }

  async function setRequestStatus(id, status) {
    const item = await api("PUT", `requests/${encodeURIComponent(id)}`, { status });
    state.items.requests = (state.items.requests || []).map((r) => (r.id === id ? item : r));
    render();
  }

  function requestSheet(wb, list) {
    sheet(wb, "Murojaatlar", "Murojaatlar va arizalar", [
      { k: "n", l: "№", w: 5, center: true }, { k: "date", l: "Sana", w: 17, center: true }, { k: "type", l: "Turi", w: 15 }, { k: "name", l: "Ism", w: 26 },
      { k: "phone", l: "Telefon", w: 18 }, { k: "about", l: "To'garak / mavzu", w: 30 }, { k: "group", l: "Fakultet va guruh", w: 24 },
      { k: "message", l: "Xabar", w: 50 }, { k: "status", l: "Holati", w: 12, center: true }
    ], list.map((r, i) => ({
      n: i + 1, date: reqDate(r.createdAt), type: r.type === "join" ? "A'zo bo'lish" : "Aloqa", name: r.name, phone: r.phone,
      about: r.type === "join" ? reqClub(r) : r.topic, group: r.group || "", message: r.message || "", status: (REQ_STATUS[r.status] || {}).l || "",
      _fill: r.status === "new" ? "FFE0E7FF" : null, _fillCol: 9
    })), `${list.filter((r) => r.status === "new").length} ta yangi`);
  }

  async function exportRequests() {
    await loadExcel();
    const wb = newWb();
    requestSheet(wb, filteredRequests());
    await saveWb(wb, `murojaatlar-${today()}.xlsx`);
  }

  // Bosh paneldagi «Excel hisobot»: bitta faylda umumiy ko'rsatkichlar va barcha asosiy bo'limlar
  async function exportReport() {
    await loadExcel();
    const it = state.items;
    const clubs = it.clubs || [], contests = it.contests || [], books = it.books || [], reqs = it.requests || [], courses = it.courses || [];
    const total = Number(String(((it.stats || []).find((s) => s.id === "students") || {}).value || "").replace(/\s/g, "")) || 0;
    const members = sum(clubs, "students");
    const open = contests.filter((c) => daysTo(c.deadline) !== null && daysTo(c.deadline) >= 0);
    const mentors = new Set(clubs.flatMap((c) => c.mentors || []).map((m) => String(m).trim().toLowerCase()).filter(Boolean)).size;
    const issues = computeIssues();
    const wb = newWb();
    sheet(wb, "Umumiy ko'rsatkichlar", "Umumiy hisobot", [
      { k: "n", l: "№", w: 5, center: true }, { k: "label", l: "Ko'rsatkich", w: 34 }, { k: "value", l: "Qiymat", w: 14, num: true }, { k: "note", l: "Izoh", w: 48 }
    ], [
      ["Jami talabalar", total, "«Statistika» bo'limidan"],
      ["To'garaklar", clubs.length, `${new Set(clubs.map((c) => c.initiativeId)).size} ta yo'nalish bo'yicha`],
      ["To'garak a'zolari", members, total ? `talabalarning ${pct(members, total)}% i` : ""],
      ["Kasbga o'qitish kurslari", courses.length, `${courses.filter((c) => c.certificate).length} tasida sertifikat beriladi`],
      ["Tanlovlar", contests.length, `${open.length} tasida qabul ochiq`],
      ["Yutuqlar (sovrinli o'rinlar)", sum(SITE.groups, "awards"), `${(it.winners || []).length} ta shon-sharaf egasi`],
      ["To'garak rahbarlari", mentors, `${(it.staff || []).length} ta markaz xodimi`],
      ["Kitoblar", books.length, `${books.filter((b) => b.pdf).length} tasini saytda o'qish mumkin`],
      ["Kitob o'qishlari", sum(books, "reads"), ""],
      ["Murojaatlar", reqs.length, `${reqs.filter((r) => r.status === "new").length} ta yangi`],
      ["Nazorat: kamchiliklar", issueCount(issues), `${issues.filter((i) => i.lv === "bad").length} ta muhim`]
    ].map(([label, value, note], i) => ({ n: i + 1, label, value, note })));
    clubSheets(wb, clubs);
    if (courses.length) courseSheet(wb);
    kindSheet(wb, "contests");
    kindSheet(wb, "books");
    if (reqs.length) requestSheet(wb, reqs);
    await saveWb(wb, `hisobot-${today()}.xlsx`);
  }

  /* ---------- Excel ---------- */
  let excelLoading;
  function loadExcel() {
    if (window.ExcelJS) return Promise.resolve();
    excelLoading = excelLoading || new Promise((resolve, reject) => {
      const sc = document.createElement("script");
      sc.src = "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js";
      sc.onload = resolve;
      sc.onerror = () => { excelLoading = null; reject(new Error("Excel kutubxonasi yuklanmadi. Internetni tekshiring.")); };
      document.head.appendChild(sc);
    });
    return excelLoading;
  }

  // Excel uslubi: sarlavha, izoh, ko'k sarlavha qatori, "zebra" qatorlar, raqamlar o'ngda, JAMI qatori ajratilgan
  const XL = { brand: "FF0B2C8F", zebra: "FFF7F8FC", line: "FFE3E7F0", muted: "FF64748B", total: "FFDCE4FF", headLine: "FF2A4BB0" };
  const thin = { style: "thin", color: { argb: XL.line } };
  function sheet(wb, name, title, cols, rows, note) {
    const HEAD = 4;  // 1 — sarlavha, 2 — izoh, 3 — bo'sh, 4 — ustun nomlari
    const ws = wb.addWorksheet(String(name).replace(/[\\/*?:[\]]/g, "").slice(0, 31), {
      properties: { tabColor: { argb: XL.brand } },
      views: [{ state: "frozen", ySplit: HEAD, showGridLines: false }],
      pageSetup: { orientation: cols.length > 6 ? "landscape" : "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9,
        margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } },
      headerFooter: { oddFooter: "&L&8UrDU Besh muhim tashabbus markazi&R&8&P / &N bet" }
    });
    ws.columns = cols.map((c) => ({ key: c.k, width: c.w || 14 }));
    ws.mergeCells(1, 1, 1, cols.length);
    ws.mergeCells(2, 1, 2, cols.length);
    const t = ws.getCell(1, 1);
    t.value = title;
    t.font = { bold: true, size: 16, color: { argb: XL.brand } };
    t.alignment = { vertical: "middle" };
    ws.getRow(1).height = 30;
    const count = rows.filter((r) => !r._total).length;
    const sub = ws.getCell(2, 1);
    sub.value = `UrDU Besh muhim tashabbus markazi · ${dmy(today())} holatiga · ${count} ta yozuv${note ? " · " + note : ""}`;
    sub.font = { italic: true, size: 10, color: { argb: XL.muted } };
    ws.getRow(3).height = 6;
    const head = ws.getRow(HEAD);
    head.values = cols.map((c) => c.l);
    head.height = 34;
    head.eachCell((cell) => {
      cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: XL.brand } };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = { left: { style: "thin", color: { argb: XL.headLine } }, right: { style: "thin", color: { argb: XL.headLine } } };
    });
    rows.forEach((r, i) => {
      const row = ws.addRow(cols.map((c) => r[c.k] ?? ""));
      row.font = { size: 10, bold: !!r._total };
      cols.forEach((c, j) => {
        const cell = row.getCell(j + 1);
        cell.alignment = { vertical: "top", wrapText: true, horizontal: c.num ? "right" : c.center ? "center" : "left" };
        if (c.num && typeof cell.value === "number") cell.numFmt = c.pct ? '0"%"' : "#,##0";
        cell.border = r._total ? { top: { style: "medium", color: { argb: XL.brand } }, bottom: thin } : { bottom: thin };
        const fill = r._total ? XL.total : r._fill && r._fillCol === j + 1 ? r._fill : i % 2 ? XL.zebra : null;
        if (fill) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
      });
    });
    if (rows.length) ws.autoFilter = { from: { row: HEAD, column: 1 }, to: { row: HEAD, column: cols.length } };
    ws.pageSetup.printTitlesRow = `${HEAD}:${HEAD}`;
    return ws;
  }

  async function saveWb(wb, name) {
    const buf = await wb.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  function newWb() {
    const wb = new ExcelJS.Workbook();
    wb.creator = "UrDU Besh muhim tashabbus boshqaruv paneli";
    wb.created = new Date();
    return wb;
  }

  const RATING_FILL = { green: "FFD1FADF", yellow: "FFFEF0C7", red: "FFFEE4E2" };
  const gTitle = (id) => (group(id) || {}).title || "";
  const today = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
  const plain = (v) => {
    const d = document.createElement("div");
    d.innerHTML = String(v || "").replace(/<br>|<\/(p|div|li)>/g, "\n");
    return d.textContent.replace(/\n{3,}/g, "\n\n").trim();
  };
  const num = (v) => (v === "" || v == null || isNaN(Number(v)) ? v ?? "" : Number(v));

  function clubSheets(wb, list) {
    sheet(wb, "To'garaklar", "To'garaklar ro'yxati", [
      { k: "n", l: "№", w: 5, center: true }, { k: "name", l: "Nomi", w: 34 }, { k: "g", l: "Yo'nalish", w: 22 }, { k: "students", l: "A'zolar", w: 9, num: true },
      { k: "schedule", l: "Jadval", w: 30 }, { k: "place", l: "Joy", w: 22 }, { k: "mentors", l: "Rahbarlar", w: 26 }, { k: "phones", l: "Telefonlar", w: 20 },
      { k: "rating", l: "Baho", w: 13, center: true }, { k: "ratingNote", l: "Baho izohi", w: 28 }, { k: "problems", l: "Yetishmayotgan ma'lumot", w: 24 }
    ], list.map((c, i) => ({
      n: i + 1, name: c.name, g: gTitle(c.initiativeId), students: num(c.students), schedule: c.schedule, place: c.place,
      mentors: (c.mentors || []).join("\n"), phones: (c.phones || []).map((p) => p.text).join("\n"),
      rating: RATING[c.rating] ? RATING[c.rating].l : "Baholanmagan", ratingNote: c.ratingNote || "", problems: clubProblems(c).join(", "),
      _fill: RATING_FILL[c.rating], _fillCol: 9
    })).concat(list.length ? [{ _total: true, name: "JAMI", students: sum(list, "students") }] : []));
    const rows = (state.items.groups || []).map((g) => {
      const cl = list.filter((c) => Number(c.initiativeId) === Number(g.id));
      return { g: g.title, clubs: cl.length, students: sum(cl, "students"), ...ratingCounts(cl) };
    }).filter((r) => r.clubs);
    rows.push({ _total: true, g: "JAMI", clubs: list.length, students: sum(list, "students"), ...ratingCounts(list) });
    sheet(wb, "Yo'nalishlar kesimida", "To'garaklar — yo'nalishlar kesimida", [
      { k: "g", l: "Yo'nalish", w: 32 }, { k: "clubs", l: "To'garaklar", w: 12, num: true }, { k: "students", l: "A'zolar", w: 12, num: true },
      { k: "green", l: "Yashil", w: 10, num: true }, { k: "yellow", l: "Sariq", w: 10, num: true }, { k: "red", l: "Qizil", w: 10, num: true },
      { k: "none", l: "Baholanmagan", w: 14, num: true }
    ], rows);
  }

  function courseSheet(wb) {
    const cs = state.items.courses || [];
    sheet(wb, "Kurslar", "Kasbga o'qitish kurslari", [
      { k: "n", l: "№", w: 5, center: true }, { k: "name", l: "Kurs nomi", w: 32 }, { k: "teacher", l: "Usta / o'qituvchi", w: 24 },
      { k: "duration", l: "Davomiyligi", w: 16 }, { k: "schedule", l: "Dars jadvali", w: 28 }, { k: "place", l: "Joy", w: 22 },
      { k: "phone", l: "Telefon", w: 18 }, { k: "audience", l: "Kimlar uchun", w: 26 }, { k: "cert", l: "Sertifikat", w: 11, center: true },
      { k: "desc", l: "Kurs haqida", w: 46 }
    ], cs.map((c, i) => ({
      n: i + 1, name: c.name, teacher: c.teacher, duration: c.duration, schedule: c.schedule, place: c.place, phone: c.phone,
      audience: c.audience, cert: c.certificate ? "Ha" : "Yo'q", desc: plain(c.desc)
    })));
  }

  // Har qanday bo'lim: ustunlar admin shaklidagi maydonlardan olinadi
  function kindSheet(wb, kind) {
    const s = state.schema[kind];
    const fields = s.fields.filter((f) => !["image", "images", "pdf"].includes(f.type));
    const width = (f) => ({ textarea: 46, rich: 50, lines: 28, phones: 22, int: 11, number: 11, date: 12, bool: 10, doc: 36 }[f.type] || (f.half ? 22 : 30));
    const value = (f, it) => {
      const v = getPath(it, f.key);
      if (f.type === "select") { const o = (f.options || []).find((x) => String(x.value) === String(v)); return o ? o.label : v ?? ""; }
      if (f.type === "bool") return v ? "Ha" : "Yo'q";
      if (f.type === "lines" || f.type === "phones") return (v || []).map((x) => (typeof x === "object" ? x.text : x)).join("\n");
      if (f.type === "rich") return plain(v);
      if (f.type === "date") return dmy(v);
      if (f.type === "int" || f.type === "number") return num(v);
      if (f.type === "doc" && v && !/^https?:/.test(v)) return `${location.origin}/${v}`;
      return v ?? "";
    };
    const cols = [{ k: "_n", l: "№", w: 5, center: true }]
      .concat(fields.map((f) => ({ k: f.key, l: f.label, w: width(f), num: f.type === "int" || f.type === "number", center: f.type === "bool" || f.type === "date" })))
      .concat(kind === "books" ? [{ k: "_reads", l: "O'qilgan", w: 10, num: true }] : []);
    const rows = (state.items[kind] || []).map((it, i) => {
      const r = { _n: i + 1, _reads: num(it.reads || 0) };
      fields.forEach((f) => { r[f.key] = value(f, it); });
      return r;
    });
    sheet(wb, navLabel(kind), navLabel(kind), cols, rows);
  }

  async function exportClubs() {
    await loadExcel();
    const list = (state.items.clubs || []).filter((c) => state.rating === "all" || (RATING[c.rating] ? c.rating : "none") === state.rating);
    const wb = newWb();
    clubSheets(wb, list);
    await saveWb(wb, `togaraklar-${today()}.xlsx`);
  }

  async function exportCourses() {
    await loadExcel();
    const wb = newWb();
    courseSheet(wb);
    await saveWb(wb, `kasbga-oqitish-kurslari-${today()}.xlsx`);
  }

  async function exportKind(kind) {
    await loadExcel();
    const wb = newWb();
    kindSheet(wb, kind);
    await saveWb(wb, `${kind}-${today()}.xlsx`);
  }

  /* ---------- Shakl ---------- */
  const getPath = (obj, key) => key.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  function setPath(obj, key, v) {
    const parts = key.split(".");
    let o = obj;
    parts.slice(0, -1).forEach((k) => { o = o[k] = o[k] || {}; });
    o[parts[parts.length - 1]] = v;
  }

  function fieldHtml(f, item) {
    const id = "f-" + f.key.replace(/\./g, "-");
    let v = item ? getPath(item, f.key) : f.default;
    const req = f.required ? " required" : "";
    const ph = f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : "";
    const hint = f.hint ? `<p class="hint">${esc(f.hint)}</p>` : "";
    const label = `<label for="${id}">${esc(f.label)}${f.required ? " *" : ""}</label>`;
    let input;
    switch (f.type) {
      case "textarea":
        input = `<textarea id="${id}" name="${f.key}" rows="${f.rows || 3}"${req}${ph}>${esc(v)}</textarea>`; break;
      case "lines":
      case "phones":
        v = (v || []).map((x) => (typeof x === "object" ? x.text : x)).join("\n");
        input = `<textarea class="lines" id="${id}" name="${f.key}" rows="3"${req}${ph}>${esc(v)}</textarea>`; break;
      case "select":
        input = `<select id="${id}" name="${f.key}">${f.options.map((o) =>
          `<option value="${esc(o.value)}"${String(o.value) === String(v) ? " selected" : ""}>${esc(o.label)}</option>`).join("")}</select>`; break;
      case "bool":
        return `<div class="field"><label class="check"><input type="checkbox" name="${f.key}"${v || (!item && f.type === "bool") ? " checked" : ""}> ${esc(f.label)}</label>${hint}</div>`;
      case "image":
        input = `<div class="img-field">
            <img class="img-preview" src="${esc(v || "")}" alt=""${v ? "" : " hidden"}>
            <input type="hidden" name="${f.key}" value="${esc(v || "")}">
            <label class="btn btn-outline btn-sm"><i class="fa-solid fa-upload"></i> Rasm tanlash
              <input type="file" accept="image/jpeg,image/png,image/webp" data-upload="${f.key}" hidden></label>
            <button type="button" class="btn btn-outline btn-sm" data-clear="${f.key}"${v ? "" : " hidden"}>Olib tashlash</button>
          </div>`;
        return `<div class="field" data-img="${f.key}"><label>${esc(f.label)}${f.required ? " *" : ""}</label>${input}
          <p class="hint">${f.hint ? esc(f.hint) + " " : ""}JPG, PNG yoki WEBP. Katta rasm avtomatik kichraytiriladi.</p></div>`;
      case "rich":
        return `<div class="field" data-rich="${f.key}"><label>${esc(f.label)}${f.required ? " *" : ""}</label>
          <div class="rte">
            <div class="rte-bar" role="toolbar" aria-label="Matnni formatlash">
              <button type="button" data-cmd="bold" title="Qalin"><i class="fa-solid fa-bold"></i></button>
              <button type="button" data-cmd="italic" title="Kursiv"><i class="fa-solid fa-italic"></i></button>
              <button type="button" data-cmd="underline" title="Tagiga chizilgan"><i class="fa-solid fa-underline"></i></button>
              <button type="button" data-cmd="strikeThrough" title="Ustidan chizilgan"><i class="fa-solid fa-strikethrough"></i></button>
              <span class="rte-sep"></span>
              <select data-size title="Matn o'lchami" aria-label="Matn o'lchami">
                <option value="">O'lcham</option><option value="2">Kichik</option><option value="3">Oddiy</option><option value="5">Katta</option><option value="6">Juda katta</option>
              </select>
              <span class="rte-sep"></span>
              <button type="button" data-cmd="insertUnorderedList" title="Ro'yxat"><i class="fa-solid fa-list-ul"></i></button>
              <button type="button" data-cmd="insertOrderedList" title="Raqamli ro'yxat"><i class="fa-solid fa-list-ol"></i></button>
              <button type="button" data-cmd="formatBlock" data-val="blockquote" title="Iqtibos"><i class="fa-solid fa-quote-left"></i></button>
              <button type="button" data-cmd="createLink" title="Havola"><i class="fa-solid fa-link"></i></button>
              <button type="button" data-cmd="removeFormat" title="Formatni tozalash"><i class="fa-solid fa-eraser"></i></button>
              <span class="rte-sep"></span>
              <span class="rte-emoji-wrap">
                <button type="button" data-emoji-toggle title="Emoji"><i class="fa-regular fa-face-smile"></i></button>
                <span class="rte-emoji" hidden>${EMOJI.map((e) => `<button type="button" data-emoji="${e}">${e}</button>`).join("")}</span>
              </span>
            </div>
            <div class="rte-area" contenteditable="true" data-placeholder="Matnni shu yerga yozing...">${richSafe(v)}</div>
          </div>
          <input type="hidden" name="${f.key}" value="">
          ${hint}</div>`;
      case "doc":
        return `<div class="field" data-doc="${f.key}"><label for="${id}">${esc(f.label)}</label>
          <div class="doc-field">
            <input id="${id}" name="${f.key}" type="text" value="${esc(v || "")}" placeholder="https://... yoki PDF yuklang">
            <label class="btn btn-outline btn-sm"><i class="fa-solid fa-upload"></i> PDF yuklash
              <input type="file" accept="application/pdf,.pdf" data-upload-doc="${f.key}" hidden></label>
            <span class="pdf-progress" hidden></span>
          </div>
          ${hint}</div>`;
      case "images": {
        const list = Array.isArray(v) ? v : [];
        return `<div class="field" data-imgs="${f.key}"><label>${esc(f.label)}</label>
          <div class="gal">
            ${list.map((p) => galItem(p)).join("")}
            <label class="gal-add"><i class="fa-solid fa-plus"></i><span>Rasm qo'shish</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple data-gal-upload="${f.key}" hidden></label>
          </div>
          <input type="hidden" name="${f.key}" value="${esc(list.join("\n"))}">
          <p class="hint">${f.hint ? esc(f.hint) + " " : ""}JPG, PNG yoki WEBP, bir yo'la bir nechtasini tanlash mumkin.</p></div>`;
      }
      case "pdf":
        return `<div class="field" data-pdf="${f.key}"><label>${esc(f.label)}</label>
          <div class="img-field">
            <input type="hidden" name="${f.key}" value="${esc(v || "")}">
            <a class="pdf-link" href="${esc(v || "#")}" target="_blank" rel="noopener"${v ? "" : " hidden"}><i class="fa-regular fa-file-pdf"></i> <span>${esc((v || "").split("/").pop())}</span></a>
            <label class="btn btn-outline btn-sm"><i class="fa-solid fa-upload"></i> ${v ? "Boshqa PDF" : "PDF tanlash"}
              <input type="file" accept="application/pdf,.pdf" data-upload-pdf="${f.key}" hidden></label>
            <button type="button" class="btn btn-outline btn-sm" data-clear-pdf="${f.key}"${v ? "" : " hidden"}>Olib tashlash</button>
            <span class="pdf-progress" hidden></span>
          </div>
          ${hint || `<p class="hint">Faqat PDF, 40 MB gacha.</p>`}</div>`;
      default: {
        const type = { int: "number", number: "number", date: "date", email: "email", url: "url" }[f.type] || "text";
        const step = f.type === "number" ? ' step="0.1"' : f.type === "int" ? ' step="1" min="0"' : "";
        input = `<input id="${id}" name="${f.key}" type="${type}"${step} value="${esc(v ?? "")}"${req}${ph}>`;
      }
    }
    return `<div class="field">${label}${input}${hint}</div>`;
  }

  // Yarim kenglikdagi maydonlar ikkitadan bitta qatorga joylanadi
  function formHtml(fields, item) {
    let out = "", pending = [];
    const flush = () => {
      if (pending.length) out += pending.length === 2 ? `<div class="form-row">${pending.join("")}</div>` : pending[0];
      pending = [];
    };
    fields.forEach((f) => {
      const html = fieldHtml(f, item);
      if (f.half) { pending.push(html); if (pending.length === 2) flush(); }
      else { flush(); out += html; }
    });
    flush();
    return out;
  }

  function openEdit(item) {
    const s = S();
    state.editing = item ? item.id : null;
    $("#edit-title").textContent = item ? `${s.one}: tahrirlash` : `Yangi: ${s.one.toLowerCase()}`;
    $("#edit-error").textContent = "";
    $("#edit-fields").innerHTML = formHtml(s.fields, item);
    $("#edit-modal").classList.add("open");
    document.body.style.overflow = "hidden";
    const first = $("#edit-fields input:not([type=hidden]):not([type=file]), #edit-fields textarea");
    if (first) first.focus();
  }

  function closeModals() { $$(".modal.open").forEach((m) => m.classList.remove("open")); document.body.style.overflow = ""; }

  async function save(e) {
    e.preventDefault();
    const s = S();
    const form = e.target;
    const err = $("#edit-error");
    err.textContent = "";
    // Tahrirlagichlardagi matn yashirin maydonga o'tkaziladi (server tozalaydi)
    $$("[data-rich]", form).forEach((b) => { b.querySelector("input[type=hidden]").value = b.querySelector(".rte-area").innerHTML; });
    const payload = {};
    for (const f of s.fields) {
      const el = form.elements[f.key];
      const v = f.type === "bool" ? el.checked : el.value;
      if (f.required && f.type !== "bool" && !String(v).trim()) {
        err.textContent = `«${f.label}» to'ldirilmagan`;
        return;
      }
      setPath(payload, f.key, v);
    }
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const kind = state.kind;
      if (state.editing) await api("PUT", `${kind}/${encodeURIComponent(state.editing)}`, payload);
      else await api("POST", kind, payload);
      closeModals();
      await loadAll();
      toast(state.editing ? "O'zgarishlar saqlandi" : "Qo'shildi");
    } catch (ex) {
      err.textContent = ex.message;
    } finally {
      btn.disabled = false;
    }
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  // Katta rasm (telefon kamerasi) brauzerning o'zida 1600px gacha kichraytiriladi
  const MAX_SIDE = 1600;
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Rasmni o'qib bo'lmadi. JPG, PNG yoki WEBP tanlang.")); };
      img.src = url;
    });
  }
  async function prepareImage(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Faqat JPG, PNG yoki WEBP rasm yuklash mumkin");
    const img = await loadImage(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale === 1 && file.size <= 1.5 * 1024 * 1024) return readFile(file);
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    const ctx = c.getContext("2d");
    if (file.type !== "image/png") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.86);
  }

  function setImage(key, path) {
    const box = $(`[data-img="${key}"]`);
    box.querySelector("input[type=hidden]").value = path;
    const img = box.querySelector(".img-preview");
    img.src = path;
    img.hidden = !path;
    box.querySelector("[data-clear]").hidden = !path;
  }

  /* ---------- Formatlangan matn tahrirlagichi ---------- */
  const EMOJI = ["😀", "😊", "😍", "🤩", "👏", "🙌", "👍", "💪", "🎉", "🎊", "🏆", "🥇", "🥈", "🥉", "🎓", "📚", "📖", "✍️", "💡", "🚀",
    "⭐", "🌟", "🔥", "✅", "📌", "📅", "⏰", "📍", "📢", "🎭", "🎨", "🎵", "⚽", "🏀", "🏐", "♟️", "💻", "🤝", "❤️", "🇺🇿"];
  // Bazadagi matn server tomonidan tozalangan; eski oddiy matn qatorlari <br> bo'ladi
  const richSafe = (v) => (/<[a-zA-Z/]/.test(String(v || "")) ? String(v) : esc(v || "").replace(/\n/g, "<br>"));
  let rteRange = null;  // tahrirlagichdagi oxirgi belgilangan joy (tugma bosilganda yo'qolmasin)
  function rteRestore(area) {
    area.focus();
    if (rteRange && area.contains(rteRange.commonAncestorContainer)) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(rteRange);
    }
  }
  function rteExec(area, cmd, val) {
    rteRestore(area);
    document.execCommand("styleWithCSS", false, false);
    document.execCommand(cmd, false, val);
  }

  // PDF faylni xom holda yuklaydi; foizni el ichida ko'rsatadi
  function uploadPdfFile(file, prog) {
    return new Promise((resolve, reject) => {
      if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") return reject(new Error("Faqat PDF fayl yuklash mumkin"));
      if (file.size > 40 * 1024 * 1024) return reject(new Error("PDF 40 MB dan katta"));
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "api/upload-pdf");
      xhr.setRequestHeader("Content-Type", "application/pdf");
      xhr.upload.onprogress = (ev) => { if (ev.lengthComputable && prog) prog.textContent = `Yuklanmoqda… ${Math.round((ev.loaded / ev.total) * 100)}%`; };
      xhr.onload = () => {
        let d = null;
        try { d = JSON.parse(xhr.responseText); } catch (ex) { /* bo'sh javob */ }
        if (xhr.status === 200 && d && d.path) resolve(d.path);
        else reject(new Error((d && d.error) || `Yuklab bo'lmadi (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error("Tarmoq xatosi: PDF yuklanmadi"));
      xhr.send(file);
    });
  }

  // Galereya (yangiliklarning qo'shimcha rasmlari)
  const galItem = (p) => `<span class="gal-item" data-path="${esc(p)}"><img src="${esc(p)}" alt="" loading="lazy">
    <button type="button" data-gal-del aria-label="Rasmni olib tashlash"><i class="fa-solid fa-xmark"></i></button></span>`;
  function syncGallery(box) {
    box.querySelector("input[type=hidden]").value = $$(".gal-item", box).map((x) => x.dataset.path).join("\n");
  }

  function setPdf(key, path) {
    const box = $(`[data-pdf="${key}"]`);
    box.querySelector("input[type=hidden]").value = path;
    const a = box.querySelector(".pdf-link");
    a.hidden = !path;
    a.href = path || "#";
    a.querySelector("span").textContent = path ? path.split("/").pop() : "";
    box.querySelector("[data-clear-pdf]").hidden = !path;
  }

  /* ---------- Hodisalar ---------- */
  function bind() {
    $("#login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      $("#login-error").textContent = "";
      try {
        await api("POST", "login", { password: $("#password").value });
        $("#password").value = "";
        show("admin-view");
        await loadAll();
      } catch (err) {
        $("#login-error").textContent = err.message;
      }
    });

    $("#logout").addEventListener("click", async () => {
      await api("POST", "logout").catch(() => {});
      showLogin();
    });

    const shell = $("#admin-view");
    const switchTo = (kind) => {
      if (state.kind !== kind) window.scrollTo({ top: 0, behavior: "instant" });
      state.kind = kind;
      openGroupOf(kind);
      state.query = "";
      shell.classList.remove("nav-open");
      try { localStorage.setItem("urdu5t-admin-tab", state.kind); } catch (ex) { /* muhim emas */ }
      render();
    };
    const openItem = (kind, id) => {
      const item = (state.items[kind] || []).find((x) => String(x.id) === String(id));
      if (item) openEdit(item);
    };

    $("#side-nav").addEventListener("click", (e) => {
      const g = e.target.closest("[data-group]");
      if (g) {
        const id = g.dataset.group;
        state.open.has(id) ? state.open.delete(id) : state.open.add(id);
        saveOpen();
        renderNav(computeIssues());
        return;
      }
      const b = e.target.closest("[data-kind]");
      if (b) switchTo(b.dataset.kind);
    });
    $("#burger").addEventListener("click", () => shell.classList.toggle("nav-open"));
    $("#side-shade").addEventListener("click", () => shell.classList.remove("nav-open"));

    // Tema
    const applyTheme = (t) => {
      document.documentElement.dataset.theme = t;
      $("#theme-toggle i").className = t === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    };
    applyTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    $("#theme-toggle").addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("urdu5t-theme", next); } catch (ex) { /* muhim emas */ }
    });

    // Istalgan joydagi havola: bo'limga o'tish va kerak bo'lsa yozuvni ochish
    shell.addEventListener("click", (e) => {
      const go = e.target.closest("[data-go]");
      if (!go) return;
      if (go.dataset.rating) state.rating = go.dataset.rating;
      switchTo(go.dataset.go);
      if (go.hasAttribute("data-add")) openEdit(null);
      else if (go.dataset.id) openItem(go.dataset.go, go.dataset.id);
    });

    // Bosh panel: ko'rsatkichni almashtirish, Excel
    // Ko'rsatkich oynasidagi «Bo'limga o'tish» tugmasi
    $("#kpi-modal").addEventListener("click", (e) => {
      const go = e.target.closest("[data-go]");
      if (!go) return;
      closeModals();
      switchTo(go.dataset.go);
    });

    $("#dash-view").addEventListener("click", async (e) => {
      const k = e.target.closest("[data-kpi]");
      if (k) { openKpi(k.dataset.kpi); return; }
      const m = e.target.closest("[data-metric]");
      if (m) { state.metric = m.dataset.metric; render(); return; }
      const x = e.target.closest("[data-xls]");
      if (x && !x.disabled) {
        x.disabled = true;
        try { await exportReport(); } catch (err) { alert(err.message); }
        x.disabled = false;
      }
    });

    // Butun panel bo'ylab qidiruv (Ctrl + K)
    const gs = $("#global-search"), gr = $("#global-results");
    let results = [], sel = 0;
    const closeResults = () => { gr.hidden = true; };
    const paintResults = () => {
      if (!gs.value.trim()) { closeResults(); return; }
      gr.innerHTML = results.length ? results.map((r, i) => `
        <button type="button" data-res="${i}" class="${i === sel ? "sel" : ""}">
          <i class="fa-solid ${ICONS[r.k] || "fa-folder"}"></i>
          <span><strong>${esc(r.title || "—")}</strong><small>${esc([navLabel(r.k), r.sub].filter(Boolean).join(" · "))}</small></span>
        </button>`).join("") : `<div class="none">Hech narsa topilmadi</div>`;
      gr.hidden = false;
    };
    const pick = (i) => {
      const r = results[i];
      if (!r) return;
      gs.value = "";
      closeResults();
      gs.blur();
      switchTo(r.k);
      openEdit(r.it);
    };
    gs.addEventListener("input", () => { results = searchAll(gs.value); sel = 0; paintResults(); });
    gs.addEventListener("focus", () => { if (gs.value.trim()) paintResults(); });
    gs.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!results.length) return;
        sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
        paintResults();
        const b = gr.querySelector(".sel");
        if (b) b.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        e.preventDefault();
        pick(sel);
      } else if (e.key === "Escape") {
        closeResults();
        gs.blur();
      }
    });
    gr.addEventListener("click", (e) => {
      const b = e.target.closest("[data-res]");
      if (b) pick(Number(b.dataset.res));
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".gsearch")) closeResults(); });
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k" && !$("#admin-view").hidden) {
        e.preventDefault();
        gs.focus();
        gs.select();
      }
    });
    $("#add-btn").addEventListener("click", () => openEdit(null));

    // Baho bo'yicha saralash
    $("#kind-extra").addEventListener("click", (e) => {
      const c = e.target.closest("[data-rating]");
      if (c) { state.rating = c.dataset.rating; render(); }
      const r = e.target.closest("[data-req-filter]");
      if (r) { state.reqFilter = r.dataset.reqFilter; render(); }
    });

    // Avtomatik baholash, kurslarni import, Excel
    $("#kind-tools").addEventListener("click", async (e) => {
      const b = e.target.closest("button");
      if (!b || b.disabled) return;
      b.disabled = true;
      try {
        if (b.id === "reset-rate") {
          const rated = (state.items.clubs || []).filter((c) => RATING[c.rating]);
          if (!rated.length) { toast("Baholangan to'garak yo'q"); return; }
          if (!confirm(`${rated.length} ta to'garakning bahosi olib tashlansinmi?
Keyin qayta baholash mumkin.`)) return;
          await rate(Object.fromEntries(rated.map((c) => [c.id, ""])));
          toast(`${rated.length} ta to'garakning bahosi bekor qilindi`);
        } else if (b.id === "auto-rate") {
          const todo = (state.items.clubs || []).filter((c) => !RATING[c.rating]);
          if (!todo.length) { toast("Barcha to'garaklar baholangan"); return; }
          const ratings = Object.fromEntries(todo.map((c) => [c.id, suggestRating(c)]));
          const n = ratingCounts(todo.map((c) => ({ rating: ratings[c.id] })));
          if (!confirm(`${todo.length} ta baholanmagan to'garakka tavsiya etilgan baho qo'yilsinmi?\n\nYashil: ${n.green}\nSariq: ${n.yellow}\nQizil: ${n.red}\n\nTavsiya joy, jadval, telefon va a'zolar soniga qarab beriladi. Keyin istalganini qo'lda o'zgartirasiz.`)) return;
          await rate(ratings, true);
          toast(`${todo.length} ta to'garak baholandi`);
        } else if (b.dataset.xls === "clubs") {
          await exportClubs();
        } else if (b.dataset.xls === "courses") {
          await exportCourses();
        } else if (b.dataset.xls === "requests") {
          await exportRequests();
        } else if (b.dataset.xls) {
          await exportKind(b.dataset.xls);
        }
      } catch (err) {
        alert(err.message);
      } finally {
        b.disabled = false;
      }
    });

    $("#rows").addEventListener("click", async (e) => {
      // Nazorat havolalari ([data-go]) umumiy ishlovchida
      if (e.target.closest("[data-go]")) return;
      // Murojaatlar: holat va o'chirish
      const rs = e.target.closest("[data-req-status]");
      if (rs) {
        rs.disabled = true;
        try { await setRequestStatus(rs.dataset.reqStatus, rs.dataset.val); } catch (err) { alert(err.message); rs.disabled = false; }
        return;
      }
      const rd = e.target.closest("[data-req-del]");
      if (rd) {
        const r = (state.items.requests || []).find((x) => x.id === rd.dataset.reqDel);
        if (!r || !confirm(`«${r.name}» murojaati o'chirilsinmi? Buni qaytarib bo'lmaydi.`)) return;
        try {
          await api("DELETE", `requests/${encodeURIComponent(r.id)}`);
          state.items.requests = state.items.requests.filter((x) => x.id !== r.id);
          render();
          toast("O'chirildi");
        } catch (err) { alert(err.message); }
        return;
      }
      // Svetofor: bir bosish bilan baho, qayta bosish bilan olib tashlash
      const light = e.target.closest("[data-rate]");
      if (light) {
        const club = (state.items.clubs || []).find((x) => String(x.id) === light.dataset.rate);
        if (!club) return;
        const val = club.rating === light.dataset.val ? "" : light.dataset.val;
        try { await rate({ [club.id]: val }); } catch (err) { alert(err.message); }
        return;
      }
      const ed = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      const mv = e.target.closest("[data-move]");
      const list = state.items[state.kind] || [];
      if (mv && !mv.disabled) {
        const ids = list.map((x) => String(x.id));
        const i = ids.indexOf(mv.dataset.move), j = i + Number(mv.dataset.dir);
        if (i < 0 || j < 0 || j >= ids.length) return;
        [ids[i], ids[j]] = [ids[j], ids[i]];
        const kind = state.kind;
        // Darhol ko'rsatamiz, so'ng serverga yozamiz
        state.items[kind] = ids.map((id) => list.find((x) => String(x.id) === id));
        render();
        try {
          state.items[kind] = await api("POST", `${kind}/order`, { ids });
          SITE.apply(state.items);
          render();
        } catch (err) {
          alert(err.message);
          await loadAll();
        }
        return;
      }
      if (ed) openEdit(list.find((x) => String(x.id) === ed.dataset.edit));
      if (del) {
        const item = list.find((x) => String(x.id) === del.dataset.del);
        if (!item || !confirm(`"${item[S().title] || item.id}" o'chirilsinmi? Buni qaytarib bo'lmaydi.`)) return;
        try {
          await api("DELETE", `${state.kind}/${encodeURIComponent(item.id)}`);
          await loadAll();
          toast("O'chirildi");
        } catch (err) {
          alert(err.message);
        }
      }
    });

    $("#edit-form").addEventListener("submit", save);

    $("#edit-fields").addEventListener("change", async (e) => {
      const input = e.target.closest("[data-upload]");
      if (!input || !input.files[0]) return;
      const file = input.files[0];
      const err = $("#edit-error");
      err.textContent = "";
      const box = input.closest(".img-field");
      box.classList.add("loading");
      try {
        const { path } = await api("POST", "upload", { data: await prepareImage(file) });
        setImage(input.dataset.upload, path);
      } catch (ex) {
        err.textContent = ex.message;
      }
      box.classList.remove("loading");
      input.value = "";
    });
    $("#edit-fields").addEventListener("click", (e) => {
      const c = e.target.closest("[data-clear]");
      if (c) setImage(c.dataset.clear, "");
      const p = e.target.closest("[data-clear-pdf]");
      if (p) setPdf(p.dataset.clearPdf, "");
    });

    // Formatlangan matn: tugmalar belgilangan joyni yo'qotmasligi uchun mousedown'da fokus saqlanadi
    document.addEventListener("selectionchange", () => {
      const sel = window.getSelection();
      if (sel.rangeCount && sel.anchorNode && sel.anchorNode.parentElement && sel.anchorNode.parentElement.closest(".rte-area")) rteRange = sel.getRangeAt(0).cloneRange();
    });
    $("#edit-fields").addEventListener("mousedown", (e) => { if (e.target.closest(".rte-bar button")) e.preventDefault(); });
    $("#edit-fields").addEventListener("click", (e) => {
      const rte = e.target.closest(".rte");
      if (!rte) return;
      const area = rte.querySelector(".rte-area");
      const b = e.target.closest("button");
      if (!b) return;
      if (b.hasAttribute("data-emoji-toggle")) { const p = rte.querySelector(".rte-emoji"); p.hidden = !p.hidden; return; }
      if (b.dataset.emoji) { rteExec(area, "insertText", b.dataset.emoji); rte.querySelector(".rte-emoji").hidden = true; return; }
      const cmd = b.dataset.cmd;
      if (!cmd) return;
      if (cmd === "createLink") {
        const url = prompt("Havola manzili (https://...):", "https://");
        if (!url || !/^(https?:\/\/|mailto:|tel:)/i.test(url.trim())) return;
        rteExec(area, "createLink", url.trim());
        return;
      }
      rteExec(area, cmd, b.dataset.val || null);
    });
    $("#edit-fields").addEventListener("change", (e) => {
      const size = e.target.closest("[data-size]");
      if (size) {
        if (size.value) rteExec(size.closest(".rte").querySelector(".rte-area"), "fontSize", size.value);
        size.value = "";
      }
    });

    // Galereya: bir nechta rasm ketma-ket yuklanadi, har biri kichraytirilib serverga yuboriladi
    $("#edit-fields").addEventListener("change", async (e) => {
      const input = e.target.closest("[data-gal-upload]");
      if (!input || !input.files.length) return;
      const box = input.closest("[data-imgs]");
      const add = box.querySelector(".gal-add");
      const label = add.querySelector("span");
      const save = $("#edit-form button[type=submit]");
      const files = [...input.files];
      $("#edit-error").textContent = "";
      save.disabled = true;
      add.classList.add("loading");
      try {
        for (let i = 0; i < files.length; i++) {
          label.textContent = `Yuklanmoqda ${i + 1}/${files.length}`;
          const { path } = await api("POST", "upload", { data: await prepareImage(files[i]) });
          add.insertAdjacentHTML("beforebegin", galItem(path));
        }
      } catch (err) {
        $("#edit-error").textContent = err.message;
      }
      syncGallery(box);
      label.textContent = "Rasm qo'shish";
      add.classList.remove("loading");
      save.disabled = false;
      input.value = "";
    });
    $("#edit-fields").addEventListener("click", (e) => {
      const del = e.target.closest("[data-gal-del]");
      if (!del) return;
      const box = del.closest("[data-imgs]");
      del.closest(".gal-item").remove();
      syncGallery(box);
    });

    // Galereya tartibi: rasmni bosib ushlab, boshqa joyga olib borib qo'yiladi (sichqoncha va barmoq).
    // Birinchi rasm — muqova. Saytda rasmlar shu tartibda chiqadi.
    let gd = null;
    const fields = $("#edit-fields");
    fields.addEventListener("pointerdown", (e) => {
      const item = e.target.closest(".gal-item");
      if (!item || e.target.closest("[data-gal-del]") || (e.button !== undefined && e.button !== 0)) return;
      const start = { item, x: e.clientX, y: e.clientY, id: e.pointerId, active: false, touch: e.pointerType === "touch", timer: null };
      gd = start;
      if (start.touch) start.timer = setTimeout(() => { if (gd === start) { start.active = true; item.classList.add("dragging"); navigator.vibrate && navigator.vibrate(15); } }, 220);
    });
    document.addEventListener("pointermove", (e) => {
      if (!gd) return;
      if (!gd.active) {
        const moved = Math.hypot(e.clientX - gd.x, e.clientY - gd.y);
        if (gd.touch) { if (moved > 8) { clearTimeout(gd.timer); gd = null; } return; } // barmoq: ushlab turmadi — oddiy aylantirish
        if (moved < 6) return;
        gd.active = true;
        gd.item.classList.add("dragging");
      }
      const over = document.elementFromPoint(e.clientX, e.clientY);
      const target = over && over.closest && over.closest(".gal-item");
      if (!target || target === gd.item || target.parentNode !== gd.item.parentNode) return;
      // Oldinda turgan rasm — nishondan keyin, orqada turgani — nishondan oldin qo'yiladi
      const items = [...target.parentNode.children];
      const forward = items.indexOf(gd.item) < items.indexOf(target);
      target.parentNode.insertBefore(gd.item, forward ? target.nextElementSibling : target);
    });
    const endDrag = () => {
      if (!gd) return;
      clearTimeout(gd.timer);
      if (gd.active) { gd.item.classList.remove("dragging"); syncGallery(gd.item.closest("[data-imgs]")); }
      gd = null;
    };
    document.addEventListener("pointerup", endDrag);
    document.addEventListener("pointercancel", endDrag);
    document.addEventListener("touchmove", (e) => { if (gd && gd.active) e.preventDefault(); }, { passive: false });
    fields.addEventListener("dragstart", (e) => { if (e.target.closest(".gal-item")) e.preventDefault(); });

    // «Nizomi yoki to'liq ma'lumot»: PDF yuklansa, maydonga uning manzili yoziladi
    $("#edit-fields").addEventListener("change", async (e) => {
      const input = e.target.closest("[data-upload-doc]");
      if (!input || !input.files[0]) return;
      const box = input.closest(".doc-field");
      const prog = box.querySelector(".pdf-progress");
      const save = $("#edit-form button[type=submit]");
      $("#edit-error").textContent = "";
      box.classList.add("loading");
      prog.hidden = false;
      save.disabled = true;
      try {
        box.querySelector("input[type=text]").value = await uploadPdfFile(input.files[0], prog);
      } catch (err) {
        $("#edit-error").textContent = err.message;
      }
      box.classList.remove("loading");
      prog.hidden = true;
      save.disabled = false;
      input.value = "";
    });

    // Kitob PDF fayli: xom holda yuboriladi (base64'siz), yuklanish foizi ko'rsatiladi
    $("#edit-fields").addEventListener("change", (e) => {
      const input = e.target.closest("[data-upload-pdf]");
      if (!input || !input.files[0]) return;
      const file = input.files[0];
      const err = $("#edit-error");
      const box = input.closest(".img-field");
      const prog = box.querySelector(".pdf-progress");
      err.textContent = "";
      if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") { err.textContent = "Faqat PDF fayl yuklash mumkin"; input.value = ""; return; }
      if (file.size > 40 * 1024 * 1024) { err.textContent = "PDF 40 MB dan katta"; input.value = ""; return; }
      const save = $("#edit-form button[type=submit]");
      save.disabled = true;
      box.classList.add("loading");
      prog.hidden = false;
      prog.textContent = "Yuklanmoqda… 0%";
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "api/upload-pdf");
      xhr.setRequestHeader("Content-Type", "application/pdf");
      xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) prog.textContent = `Yuklanmoqda… ${Math.round((ev.loaded / ev.total) * 100)}%`; };
      const done = () => { box.classList.remove("loading"); prog.hidden = true; save.disabled = false; input.value = ""; };
      xhr.onload = () => {
        let d = null;
        try { d = JSON.parse(xhr.responseText); } catch (ex) { /* bo'sh javob */ }
        if (xhr.status === 200 && d && d.path) setPdf(input.dataset.uploadPdf, d.path);
        else err.textContent = (d && d.error) || `Yuklab bo'lmadi (${xhr.status})`;
        done();
      };
      xhr.onerror = () => { err.textContent = "Tarmoq xatosi: PDF yuklanmadi"; done(); };
      xhr.send(file);
    });

    $$(".modal").forEach((m) => m.addEventListener("click", (e) => {
      if (e.target === m || e.target.closest(".modal-close")) closeModals();
    }));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModals(); });
  }

  /* ---------- Ishga tushirish ---------- */
  async function start() {
    bind();
    try {
      state.schema = await api("GET", "schema");
      state.kinds = ORDER.filter((k) => VIRTUAL[k] || state.schema[k]).concat(Object.keys(state.schema).filter((k) => !ORDER.includes(k)));
      let saved = null;
      try { saved = localStorage.getItem("urdu5t-admin-tab"); } catch (e) { /* muhim emas */ }
      state.kind = state.kinds.includes(saved) ? saved : state.kinds[0];
      loadOpen();
      openGroupOf(state.kind);
      const me = await api("GET", "me");
      if (me.admin) { show("admin-view"); await loadAll(); }
      else showLogin();
    } catch (e) {
      show("offline-view");
    }
  }
  start();
})();
