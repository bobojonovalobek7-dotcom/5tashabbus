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

  // Chap menyu bo'limlari (sxemada bor, lekin bu ro'yxatda yo'q bo'limlar "Sahifalar" oxiriga qo'shiladi)
  const NAV = [
    ["Asosiy", ["dashboard", "control"]],
    ["Kontent", ["clubs", "courses", "contests", "news", "slides", "groups"]],
    ["Natijalar", ["faculties", "winners", "stats"]],
    ["Sahifalar", ["staff", "books", "faqs", "settings"]]
  ];
  const ORDER = NAV.flatMap((s) => s[1]);
  const ICONS = {
    dashboard: "fa-gauge-high", control: "fa-shield-halved",
    clubs: "fa-people-group", courses: "fa-briefcase", contests: "fa-trophy", news: "fa-newspaper", slides: "fa-images", groups: "fa-layer-group",
    faculties: "fa-ranking-star", winners: "fa-medal", stats: "fa-chart-simple",
    staff: "fa-user-tie", books: "fa-book", faqs: "fa-circle-question", settings: "fa-address-book"
  };
  // Menyudagi qisqa nomlar (bo'sh bo'lsa sxemadagi nom olinadi)
  const NAV_LABEL = { groups: "Yo'nalishlar", winners: "Shon-sharaf", staff: "Rahbariyat" };

  const state = { schema: {}, kinds: [], kind: "dashboard", items: {}, editing: null, query: "", rating: "all", metric: "students" };
  // "Bosh panel" va "Nazorat" serverda bo'lim emas: mavjud ma'lumotdan shu yerda hisoblanadi
  const DASH = { label: "Bosh panel", mode: "view", fields: [] };
  const CONTROL = { label: "Nazorat", mode: "view", fields: [] };
  const VIRTUAL = { dashboard: DASH, control: CONTROL };
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
    state.items = await api("GET", "all");
    SITE.apply(state.items);  // yo'nalish nomlari va h.k. yangilansin
    render();
  }

  // Yozuvning qatordagi qisqa izohi
  function subtitle(kind, it) {
    const g = it.initiativeId !== undefined && group(it.initiativeId);
    switch (kind) {
      case "clubs": return [g && g.title, it.students ? `${it.students} o'quvchi` : "", (it.mentors || []).join(", "), it.ratingNote];
      case "courses": return [COURSE_STATUS[it.status], it.teacher, it.capacity ? `${it.enrolled || 0} / ${it.capacity} o'rin` : it.enrolled ? `${it.enrolled} o'qiyapti` : "",
        it.graduates ? `${it.graduates} bitirgan, ${pct(it.employed, it.graduates)}% ishda` : ""];
      case "contests": return [g && g.title, it.period, it.status === "completed" ? "Yakunlangan" : "Faol"];
      case "news": return [dmy(it.date), g && g.title];
      case "staff": return [it.role, it.phone, it.telegram && it.telegram.replace(/^https:\/\/t\.me\//, "@"), it.showOnPage === false ? "sahifada ko'rinmaydi" : ""];
      case "stats": return [it.value ? `Qiymat: ${it.value}` : "Avtomatik hisoblanadi"];
      case "groups": return [Number(it.id) <= 5 ? `${it.id}-tashabbus` : "Qo'shimcha yo'nalish", it.awards ? `${it.awards} sovrin` : ""];
      case "winners": return [it.place, it.contest];
      case "faculties": return [`${it.points} ball`, it.students ? `${it.students} talaba` : "", it.note];
      case "books": return [it.author, it.category];
      case "faqs": return [String(it.a || "").slice(0, 90)];
      case "slides": return [it.caption ? "Bosh sahifa slayderi" : "Izohsiz slayd"];
      case "settings": return [it.phone, it.centerEmail, it.address];
      default: return [];
    }
  }

  function thumbOf(kind, it) {
    const f = (state.schema[kind].fields || []).find((x) => x.type === "image");
    return f ? (it[f.key] || "") : null;
  }

  const issueCount = (issues) => issues.filter((i) => i.lv !== "info").length;
  const initials = (name) => String(name || "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  /* ---------- Chap menyu va yuqori panel ---------- */
  function renderNav(issues) {
    const extra = state.kinds.filter((k) => !ORDER.includes(k));
    $("#side-nav").innerHTML = NAV.map(([title, keys], i) => {
      const list = keys.filter((k) => state.kinds.includes(k)).concat(i === NAV.length - 1 ? extra : []);
      if (!list.length) return "";
      return `<div class="nav-sec">${title}</div>` + list.map((k) => {
        const s = schemaOf(k);
        const n = k === "control" ? issueCount(issues) : (state.items[k] || []).length;
        const badge = k === "control" ? (n ? `<span class="badge gold">${n}</span>` : "") : s.mode === "list" ? `<span class="badge">${n}</span>` : "";
        const on = k === state.kind;
        return `<button type="button" class="nav-item${on ? " active" : ""}${k === "control" && n ? " alert" : ""}" data-kind="${k}"${on ? ' aria-current="page"' : ""}>
          <i class="fa-solid ${ICONS[k] || "fa-folder"}"></i><span>${esc(navLabel(k))}</span>${badge}</button>`;
      }).join("");
    }).join("");
  }

  function renderHeader() {
    const k = state.kind, s = S();
    const title = k === "dashboard" ? "Bosh panel" : navLabel(k);
    let sub = `${location.host || "5tashabbus"} · boshqaruv`;
    if (k === "control") sub = "Saytdagi ma'lumotlarning avtomatik tekshiruvi";
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
          <button type="button" class="btn btn-outline btn-sm" data-xls="clubs"><i class="fa-solid fa-file-excel"></i> Excel hisobot</button>
          <button type="button" class="btn btn-outline btn-sm" data-go="control"><i class="fa-solid fa-shield-halved"></i> Nazoratga o'tish</button></div>`
      : `<div class="notice ok"><i class="fa-solid fa-circle-check"></i>
          <span>Ma'lumotlar <b>${dmy(today())}</b> holatiga. Muhim kamchilik topilmadi.</span>
          <button type="button" class="btn btn-outline btn-sm" data-xls="clubs"><i class="fa-solid fa-file-excel"></i> Excel hisobot</button></div>`;

    const stat = (go, ic, val, label, sub, primary) => `
      <button type="button" class="stat${primary ? " primary" : ""}" data-go="${go}">
        <span class="ic"><i class="fa-solid ${ic}"></i></span><b>${val}</b><span class="lbl">${label}</span><small>${sub}</small>
      </button>`;
    // Bosh sahifadagi «Statistika» bilan bir xil manba: Jami talabalar — Statistika bo'limidan
    const statRow = (id) => (it.stats || []).find((s) => s.id === id) || {};
    const totalStudents = Number(String(statRow("students").value || "").replace(/\s/g, "")) || 0;
    const courses = it.courses || [];
    const g5 = groups.find((g) => g.id === 5) || { clubs: 0, members: 0 };
    const courseCount = courses.length || g5.clubs;
    const learners = courses.length ? sum(courses, "enrolled") : g5.members;
    const participants = sum(contests, "participants");
    const stats = `<div class="stat-grid">
      ${stat("stats", "fa-user-graduate", totalStudents ? fmtN(totalStudents) : "—", "Jami talabalar",
        totalStudents ? `${pct(members, totalStudents)}% i to'garaklarda` : "Statistika bo'limida kiriting", true)}
      ${stat("clubs", "fa-people-group", fmtN(clubs.length), "To'garaklar", `${dirs} ta yo'nalish bo'yicha`)}
      ${stat("clubs", "fa-users", fmtN(members), "To'garak a'zolari", `o'rtacha ${clubs.length ? Math.round(members / clubs.length) : 0} nafar / to'garak`)}
      ${stat(courses.length ? "courses" : "clubs", "fa-briefcase", fmtN(courseCount), "Kasbga o'qitish kurslari", `${fmtN(learners)} nafar o'qimoqda`)}
      ${stat("books", "fa-book", fmtN((it.books || []).length), "Kitoblar", "kutubxonada tavsiya etilgan")}
      ${stat("contests", "fa-trophy", active.length, "Faol tanlovlar", nearest !== undefined ? `eng yaqin muddat: ${nearest} kun` : "muddati yaqin tanlov yo'q")}
      ${stat("contests", "fa-user-check", participants ? fmtN(participants) : "—", "Tanlov ishtirokchilari", participants ? `${contests.length} ta tanlov bo'yicha` : "tanlovlarda kiritilmagan")}
      ${stat("winners", "fa-award", fmtN(awards), "Yutuqlar", `${(it.winners || []).length} ta shon-sharaf egasi`)}
      ${stat("staff", "fa-chalkboard-user", fmtN(mentors), "To'garak rahbarlari", `${staff.length} ta markaz xodimi`)}
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

    const q = norm(state.query.trim());
    let list = (state.items[state.kind] || []).filter((it) => !q || norm(JSON.stringify(it)).includes(q));
    if (state.kind === "clubs" && state.rating !== "all") list = list.filter((c) => (RATING[c.rating] ? c.rating : "none") === state.rating);
    $("#kind-extra").innerHTML = extraHtml(state.kind);
    const sortable = s.sortable && !q;
    $("#rows").innerHTML = list.length ? list.map((it, idx) => {
      const thumb = thumbOf(state.kind, it);
      return `
        <div class="card row${state.kind === "clubs" && RATING[it.rating] ? " rated-" + it.rating : ""}">
          ${thumb === null ? "<span></span>" : thumb ? `<img class="thumb" src="${esc(thumb)}" alt="" loading="lazy">` : `<span class="thumb none"><i class="fa-regular fa-image"></i></span>`}
          <div>
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
    if (kind === "clubs") return `<button type="button" class="btn btn-outline" id="auto-rate" title="Baholanmagan to'garaklarga tavsiya etilgan bahoni qo'yadi"><i class="fa-solid fa-wand-magic-sparkles"></i> Avtomatik baholash</button>${xls}`;
    if (kind === "courses") {
      const voc = vocClubs();
      return `${voc.length ? `<button type="button" class="btn btn-outline" id="import-voc" title="«Xotin-qizlar bandligi» to'garaklaridan kurs qoralamasi yaratadi"><i class="fa-solid fa-file-import"></i> To'garaklardan olish (${voc.length})</button>` : ""}${(state.items.courses || []).length ? xls : ""}`;
    }
    return "";
  }

  function extraHtml(kind) {
    if (kind === "clubs") {
      const all = state.items.clubs || [];
      const rc = ratingCounts(all);
      const chip = (k, label, icon) => `<button type="button" class="chip rate-chip ${k}${state.rating === k ? " active" : ""}" data-rating="${k}">${icon} ${label} <span class="count">${k === "all" ? all.length : rc[k]}</span></button>`;
      return `<div class="chips rate-chips">${chip("all", "Barchasi", "")}${Object.keys(RATING).map((k) => chip(k, RATING[k].l, `<i class="fa-solid ${RATING[k].ic}"></i>`)).join("")}${chip("none", "Baholanmagan", '<i class="fa-regular fa-circle"></i>')}</div>`;
    }
    if (kind === "courses") {
      const cs = state.items.courses || [];
      if (!cs.length) return "";
      const withCap = cs.filter((c) => c.capacity);
      return `<div class="kpis">
        <div class="card kpi"><strong>${cs.length}</strong><span>kurs · ${cs.filter((c) => c.status === "open").length} tasida qabul ochiq</span></div>
        <div class="card kpi"><strong>${fmtN(sum(cs, "enrolled"))}</strong><span>o'qiyapti${withCap.length ? ` · o'rinlarning ${pct(sum(withCap, "enrolled"), sum(withCap, "capacity"))}% band` : ""}</span></div>
        <div class="card kpi"><strong>${fmtN(sum(cs, "graduates"))}</strong><span>bitirgan · ${cs.filter((c) => c.certificate).length} ta kursda sertifikat</span></div>
        <div class="card kpi"><strong>${pct(sum(cs, "employed"), sum(cs, "graduates"))}%</strong><span>bandlik · ${fmtN(sum(cs, "employed"))} nafar ish topgan</span></div>
      </div>`;
    }
    return "";
  }

  const vocClubs = () => (state.items.clubs || []).filter((c) => Number(c.initiativeId) === 5 && !(state.items.courses || []).some((k) => k.name === c.name));

  async function importVoc() {
    const list = vocClubs();
    if (!list.length || !confirm(`«Xotin-qizlar bandligi» yo'nalishidagi ${list.length} ta to'garakdan kurs qoralamasi yaratilsinmi?\nKeyin har biriga o'rinlar soni, muddat va sertifikatni kiritasiz.`)) return;
    try {
      for (const c of list) {
        await api("POST", "courses", {
          name: c.name, initiativeId: 5, status: "running", schedule: c.schedule || "", place: c.place || "",
          teacher: (c.mentors || []).join(", "), phone: (c.phones || [])[0] ? c.phones[0].text : "",
          enrolled: c.students ?? "", price: "Bepul", audience: "Talaba-qizlar va mahalla yoshlari", certificate: true
        });
      }
      toast(`${list.length} ta kurs qo'shildi`);
    } catch (err) {
      alert(err.message);
    }
    await loadAll();
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

    x = contests.filter((c) => c.status !== "completed" && daysTo(c.deadline) < 0);
    add("bad", "fa-hourglass-end", `${x.length} ta tanlov muddati o'tgan, lekin «Faol»`, "Holatini «Yakunlangan»ga o'zgartiring va g'oliblarni kiriting.", refs("contests", x));
    x = contests.filter((c) => c.status !== "completed" && daysTo(c.deadline) >= 0 && daysTo(c.deadline) <= 7);
    add("info", "fa-bell", `${x.length} ta tanlov muddati 7 kun ichida tugaydi`, "Natijalarni e'lon qilishga tayyorlaning.", refs("contests", x));

    const last = (it.news || []).map((n) => toIso(n.date)).sort().pop();
    const ago = last ? -daysTo(last) : null;
    if (!last || ago > 14) I.push({ lv: "warn", ic: "fa-newspaper", t: last ? `Oxirgi yangilik ${ago} kun oldin chiqqan` : "Saytda yangilik yo'q", sub: "Saytni jonli saqlash uchun haftasiga kamida 1–2 ta yangilik joylang.", items: [{ kind: "news", add: true, label: "+ Yangilik qo'shish" }] });

    x = (it.groups || []).filter((g) => !g.image || !g.about);
    add("warn", "fa-image", `${x.length} ta yo'nalish ma'lumoti to'liq emas`, "Rasm yoki batafsil matn yetishmaydi.", refs("groups", x));
    x = (it.staff || []).filter((p) => !p.photo && p.showOnPage !== false);
    add("info", "fa-camera", `${x.length} ta xodimning rasmi yo'q`, "Rahbariyat sahifasida rasm o'rniga bosh harflar ko'rinadi.", refs("staff", x));

    x = courses.filter((c) => c.capacity && c.enrolled > c.capacity);
    add("warn", "fa-user-plus", `${x.length} ta kursda o'quvchilar o'rinlardan ko'p`, "O'rinlar sonini yangilang yoki qo'shimcha guruh oching.", refs("courses", x));
    x = courses.filter((c) => !c.teacher || !c.place);
    add("warn", "fa-chalkboard-user", `${x.length} ta kursda usta yoki joy ko'rsatilmagan`, "Kursga yozilmoqchi bo'lganlar kim bilan bog'lanishni bilmaydi.", refs("courses", x));
    x = courses.filter((c) => c.status === "finished" && (c.graduates == null || c.graduates === ""));
    add("info", "fa-user-graduate", `${x.length} ta yakunlangan kursda bitirganlar soni yo'q`, "Bandlik natijasini hisoblash uchun bitirganlar va ishga joylashganlarni kiriting.", refs("courses", x));

    const st = (it.settings || [])[0] || {};
    const empty = { phone: "Telefon", centerEmail: "Markaz pochtasi", address: "Manzil", hours: "Qabul vaqti", telegram: "Telegram", instagram: "Instagram" };
    x = Object.keys(empty).filter((k) => !st[k]);
    if (x.length) I.push({ lv: "info", ic: "fa-address-card", t: `Aloqa bo'limida ${x.length} ta maydon bo'sh`, sub: `${x.map((k) => empty[k]).join(", ")}: saytda ko'rinmaydi.`, items: [{ kind: "settings", id: st.id || "site", label: "Aloqa ma'lumotlarini ochish" }] });

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

  const BORDER = { style: "thin", color: { argb: "FFE3E7F0" } };
  function sheet(wb, name, title, cols, rows) {
    const ws = wb.addWorksheet(name, { views: [{ state: "frozen", ySplit: 3 }], pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 } });
    ws.columns = cols.map((c) => ({ key: c.k, width: c.w || 14 }));
    ws.mergeCells(1, 1, 1, cols.length);
    ws.getCell(1, 1).value = title;
    ws.getCell(1, 1).font = { bold: true, size: 14, color: { argb: "FF0B2C8F" } };
    ws.getCell(2, 1).value = `Sana: ${dmy(today())} · UrDU Besh muhim tashabbus markazi`;
    ws.getCell(2, 1).font = { italic: true, color: { argb: "FF64748B" } };
    const head = ws.getRow(3);
    head.values = cols.map((c) => c.l);
    head.height = 30;
    head.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B2C8F" } };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    });
    rows.forEach((r) => {
      const row = ws.addRow(cols.map((c) => r[c.k] ?? ""));
      row.alignment = { vertical: "top", wrapText: true };
      if (r._fill) row.getCell(r._fillCol).fill = { type: "pattern", pattern: "solid", fgColor: { argb: r._fill } };
      row.eachCell({ includeEmpty: true }, (cell) => { cell.border = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER }; });
    });
    ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: cols.length } };
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

  const RATING_FILL = { green: "FFD1FADF", yellow: "FFFEF0C7", red: "FFFEE4E2" };
  const gTitle = (id) => (group(id) || {}).title || "";
  const today = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };

  async function exportClubs() {
    await loadExcel();
    const q = state.query.trim().toLowerCase();
    const list = (state.items.clubs || []).filter((c) => (!q || JSON.stringify(c).toLowerCase().includes(q)) &&
      (state.rating === "all" || (RATING[c.rating] ? c.rating : "none") === state.rating));
    const wb = new ExcelJS.Workbook();
    wb.creator = "UrDU 5 tashabbus admin panel";
    sheet(wb, "To'garaklar", "To'garaklar ro'yxati", [
      { k: "n", l: "№", w: 5 }, { k: "name", l: "Nomi", w: 34 }, { k: "g", l: "Yo'nalish", w: 22 }, { k: "students", l: "A'zolar", w: 9 },
      { k: "schedule", l: "Jadval", w: 30 }, { k: "place", l: "Joy", w: 22 }, { k: "mentors", l: "Rahbarlar", w: 26 }, { k: "phones", l: "Telefonlar", w: 20 },
      { k: "rating", l: "Baho", w: 13 }, { k: "ratingNote", l: "Baho izohi", w: 28 }, { k: "problems", l: "Yetishmayotgan ma'lumot", w: 24 }
    ], list.map((c, i) => ({
      n: i + 1, name: c.name, g: gTitle(c.initiativeId), students: c.students ?? "", schedule: c.schedule, place: c.place,
      mentors: (c.mentors || []).join("\n"), phones: (c.phones || []).map((p) => p.text).join("\n"),
      rating: RATING[c.rating] ? RATING[c.rating].l : "Baholanmagan", ratingNote: c.ratingNote || "", problems: clubProblems(c).join(", "),
      _fill: RATING_FILL[c.rating], _fillCol: 9
    })));
    const rows = (state.items.groups || []).map((g) => {
      const cl = list.filter((c) => Number(c.initiativeId) === Number(g.id));
      return { g: g.title, clubs: cl.length, students: sum(cl, "students"), ...ratingCounts(cl) };
    }).filter((r) => r.clubs);
    rows.push({ g: "JAMI", clubs: list.length, students: sum(list, "students"), ...ratingCounts(list) });
    const ws = sheet(wb, "Xulosa", "Yo'nalishlar bo'yicha xulosa", [
      { k: "g", l: "Yo'nalish", w: 30 }, { k: "clubs", l: "To'garaklar", w: 12 }, { k: "students", l: "A'zolar", w: 12 },
      { k: "green", l: "Yashil", w: 10 }, { k: "yellow", l: "Sariq", w: 10 }, { k: "red", l: "Qizil", w: 10 }, { k: "none", l: "Baholanmagan", w: 14 }
    ], rows);
    ws.lastRow.font = { bold: true };
    await saveWb(wb, `togaraklar-${today()}.xlsx`);
  }

  async function exportCourses() {
    await loadExcel();
    const cs = state.items.courses || [];
    const wb = new ExcelJS.Workbook();
    wb.creator = "UrDU 5 tashabbus admin panel";
    const ws = sheet(wb, "Kurslar", "Kasb-hunar kurslari", [
      { k: "n", l: "№", w: 5 }, { k: "name", l: "Kurs nomi", w: 32 }, { k: "status", l: "Holati", w: 16 }, { k: "teacher", l: "Usta", w: 22 },
      { k: "period", l: "Muddat", w: 22 }, { k: "schedule", l: "Jadval", w: 26 }, { k: "place", l: "Joy", w: 20 }, { k: "price", l: "Narxi", w: 10 },
      { k: "capacity", l: "O'rinlar", w: 9 }, { k: "enrolled", l: "O'qiyotganlar", w: 12 }, { k: "graduates", l: "Bitirganlar", w: 11 },
      { k: "employed", l: "Ishga joylashgan", w: 13 }, { k: "rate", l: "Bandlik, %", w: 11 }, { k: "cert", l: "Sertifikat", w: 10 }
    ], cs.map((c, i) => ({
      n: i + 1, name: c.name, status: COURSE_STATUS[c.status] || "", teacher: c.teacher,
      period: [dmy(c.start), dmy(c.end)].filter(Boolean).join(" — ") || c.duration || "",
      schedule: c.schedule, place: c.place, price: c.price, capacity: c.capacity ?? "", enrolled: c.enrolled ?? "", graduates: c.graduates ?? "",
      employed: c.employed ?? "", rate: c.graduates ? pct(c.employed, c.graduates) : "", cert: c.certificate ? "Ha" : "Yo'q"
    })).concat([{ name: "JAMI", capacity: sum(cs, "capacity"), enrolled: sum(cs, "enrolled"), graduates: sum(cs, "graduates"),
      employed: sum(cs, "employed"), rate: pct(sum(cs, "employed"), sum(cs, "graduates")) }]));
    ws.lastRow.font = { bold: true };
    await saveWb(wb, `kasb-kurslari-${today()}.xlsx`);
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
      state.query = "";
      $("#admin-search").value = "";
      shell.classList.remove("nav-open");
      try { localStorage.setItem("urdu5t-admin-tab", state.kind); } catch (ex) { /* muhim emas */ }
      render();
    };
    const openItem = (kind, id) => {
      const item = (state.items[kind] || []).find((x) => String(x.id) === String(id));
      if (item) openEdit(item);
    };

    $("#side-nav").addEventListener("click", (e) => {
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
    $("#dash-view").addEventListener("click", async (e) => {
      const m = e.target.closest("[data-metric]");
      if (m) { state.metric = m.dataset.metric; render(); return; }
      const x = e.target.closest("[data-xls]");
      if (x && !x.disabled) {
        x.disabled = true;
        try { await exportClubs(); } catch (err) { alert(err.message); }
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
    $("#admin-search").addEventListener("input", (e) => { state.query = e.target.value; render(); });
    $("#add-btn").addEventListener("click", () => openEdit(null));

    // Baho bo'yicha saralash
    $("#kind-extra").addEventListener("click", (e) => {
      const c = e.target.closest("[data-rating]");
      if (c) { state.rating = c.dataset.rating; render(); }
    });

    // Avtomatik baholash, kurslarni import, Excel
    $("#kind-tools").addEventListener("click", async (e) => {
      const b = e.target.closest("button");
      if (!b || b.disabled) return;
      b.disabled = true;
      try {
        if (b.id === "auto-rate") {
          const todo = (state.items.clubs || []).filter((c) => !RATING[c.rating]);
          if (!todo.length) { toast("Barcha to'garaklar baholangan"); return; }
          const ratings = Object.fromEntries(todo.map((c) => [c.id, suggestRating(c)]));
          const n = ratingCounts(todo.map((c) => ({ rating: ratings[c.id] })));
          if (!confirm(`${todo.length} ta baholanmagan to'garakka tavsiya etilgan baho qo'yilsinmi?\n\nYashil: ${n.green}\nSariq: ${n.yellow}\nQizil: ${n.red}\n\nTavsiya joy, jadval, telefon va a'zolar soniga qarab beriladi. Keyin istalganini qo'lda o'zgartirasiz.`)) return;
          await rate(ratings, true);
          toast(`${todo.length} ta to'garak baholandi`);
        } else if (b.id === "import-voc") {
          await importVoc();
        } else if (b.dataset.xls === "clubs") {
          await exportClubs();
        } else if (b.dataset.xls === "courses") {
          await exportCourses();
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
      const me = await api("GET", "me");
      if (me.admin) { show("admin-view"); await loadAll(); }
      else showLogin();
    } catch (e) {
      show("offline-view");
    }
  }
  start();
})();
