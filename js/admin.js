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

  // Tablar tartibi (sxemada bor, lekin bu ro'yxatda yo'q bo'limlar oxiriga qo'shiladi)
  const ORDER = ["stats", "staff", "clubs", "contests", "news", "winners", "groups", "faculties", "books", "faqs", "settings"];
  const ICONS = {
    stats: "fa-chart-simple", staff: "fa-user-tie", clubs: "fa-people-group", contests: "fa-trophy", news: "fa-newspaper",
    winners: "fa-medal", groups: "fa-flag", faculties: "fa-ranking-star", books: "fa-book", faqs: "fa-circle-question", settings: "fa-address-book"
  };

  const state = { schema: {}, kinds: [], kind: "stats", items: {}, editing: null, query: "" };
  const S = () => state.schema[state.kind];

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
    $("#admin-nav").hidden = view !== "admin-view";
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
      case "clubs": return [g && g.title, it.students ? `${it.students} o'quvchi` : "", (it.mentors || []).join(", ")];
      case "contests": return [g && g.title, it.period, it.status === "completed" ? "Yakunlangan" : "Faol"];
      case "news": return [dmy(it.date), g && g.title];
      case "staff": return [Number(it.initiativeId) === 0 ? "Markaz rahbari" : g && `${g.title} yo'nalishi sardori`, it.phone, it.showOnPage ? "" : "sahifada ko'rinmaydi"];
      case "stats": return [it.value ? `Qiymat: ${it.value}` : "Avtomatik hisoblanadi"];
      case "groups": return [Number(it.id) <= 5 ? `${it.id}-tashabbus` : "Qo'shimcha yo'nalish", it.awards ? `${it.awards} sovrin` : ""];
      case "winners": return [it.place, it.contest];
      case "faculties": return [`${it.points} ball`, it.students ? `${it.students} talaba` : "", it.note];
      case "books": return [it.author, it.category];
      case "faqs": return [String(it.a || "").slice(0, 90)];
      case "settings": return [it.phone, it.centerEmail, it.address];
      default: return [];
    }
  }

  function thumbOf(kind, it) {
    const f = (state.schema[kind].fields || []).find((x) => x.type === "image");
    return f ? (it[f.key] || "") : null;
  }

  function render() {
    $("#tabs").innerHTML = state.kinds.map((k) => {
      const s = state.schema[k];
      const n = (state.items[k] || []).length;
      return `<button type="button" class="chip${k === state.kind ? " active" : ""}" data-kind="${k}">
        <i class="fa-solid ${ICONS[k] || "fa-folder"}"></i> ${esc(s.label)}${s.mode === "list" ? ` <span class="count">${n}</span>` : ""}</button>`;
    }).join("");

    const s = S();
    $("#add-btn").hidden = s.mode !== "list";
    $("#add-label").textContent = `${s.one} qo'shish`;
    $("#kind-note").hidden = !s.note;
    $("#kind-note").textContent = s.note || "";

    const q = state.query.trim().toLowerCase();
    const list = (state.items[state.kind] || []).filter((it) => !q || JSON.stringify(it).toLowerCase().includes(q));
    $("#rows").innerHTML = list.length ? list.map((it) => {
      const thumb = thumbOf(state.kind, it);
      return `
        <div class="card row">
          ${thumb === null ? "<span></span>" : thumb ? `<img class="thumb" src="${esc(thumb)}" alt="" loading="lazy">` : `<span class="thumb none"><i class="fa-regular fa-image"></i></span>`}
          <div>
            <strong>${esc(it[s.title] || it.name || it.title || "—")}</strong>
            <small>${esc(subtitle(state.kind, it).filter(Boolean).join(" · "))}</small>
          </div>
          <div class="actions">
            <button type="button" class="icon-btn" data-edit="${esc(it.id)}" aria-label="Tahrirlash"><i class="fa-solid fa-pen"></i></button>
            ${s.mode === "list" ? `<button type="button" class="icon-btn danger" data-del="${esc(it.id)}" aria-label="O'chirish"><i class="fa-solid fa-trash"></i></button>` : ""}
          </div>
        </div>`;
    }).join("") : `<div class="empty"><i class="fa-regular fa-folder-open"></i>Hech narsa topilmadi</div>`;
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
    let v = item ? getPath(item, f.key) : undefined;
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
          <p class="hint">${f.hint ? esc(f.hint) + " " : ""}JPG, PNG yoki WEBP, 4 MB gacha.</p></div>`;
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

    $("#tabs").addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      state.kind = b.dataset.kind;
      state.query = "";
      $("#admin-search").value = "";
      try { localStorage.setItem("urdu5t-admin-tab", state.kind); } catch (ex) { /* muhim emas */ }
      render();
    });
    $("#admin-search").addEventListener("input", (e) => { state.query = e.target.value; render(); });
    $("#add-btn").addEventListener("click", () => openEdit(null));

    $("#rows").addEventListener("click", async (e) => {
      const ed = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      const list = state.items[state.kind] || [];
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
      if (file.size > 4 * 1024 * 1024) { err.textContent = "Rasm 4 MB dan katta"; return; }
      try {
        const { path } = await api("POST", "upload", { data: await readFile(file) });
        setImage(input.dataset.upload, path);
      } catch (ex) {
        err.textContent = ex.message;
      }
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
      state.kinds = ORDER.filter((k) => state.schema[k]).concat(Object.keys(state.schema).filter((k) => !ORDER.includes(k)));
      let saved = null;
      try { saved = localStorage.getItem("urdu5t-admin-tab"); } catch (e) { /* muhim emas */ }
      state.kind = state.schema[saved] ? saved : state.kinds[0];
      const me = await api("GET", "me");
      if (me.admin) { show("admin-view"); await loadAll(); }
      else showLogin();
    } catch (e) {
      show("offline-view");
    }
  }
  start();
})();
