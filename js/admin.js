/**
 * Admin panel: to'garaklar va tanlovlarni qo'shish, tahrirlash, o'chirish.
 * Barcha o'zgarishlar backend/server.py orqali serverdagi bazaga yoziladi.
 */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const group = (id) => SITE.groups.find((g) => g.id === Number(id));

  const state = { kind: "clubs", items: { clubs: [], contests: [] }, editing: null, query: "" };

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
    const [clubs, contests] = await Promise.all([api("GET", "clubs"), api("GET", "contests")]);
    state.items.clubs = clubs;
    state.items.contests = contests;
    render();
  }

  function render() {
    $("#count-clubs").textContent = state.items.clubs.length;
    $("#count-contests").textContent = state.items.contests.length;
    $$("#tabs .chip").forEach((c) => c.classList.toggle("active", c.dataset.kind === state.kind));
    $("#add-label").textContent = state.kind === "clubs" ? "To'garak qo'shish" : "Tanlov qo'shish";

    const q = state.query.trim().toLowerCase();
    const list = state.items[state.kind].filter((it) =>
      !q || JSON.stringify(it).toLowerCase().includes(q)
    );
    $("#rows").innerHTML = list.length ? list.map((it) => {
      const g = group(it.initiativeId);
      const sub = state.kind === "clubs"
        ? [g && g.title, it.students ? `${it.students} o'quvchi` : "", (it.mentors || []).join(", ")]
        : [g && g.title, it.period, it.status === "completed" ? "Yakunlangan" : "Faol"];
      return `
        <div class="card row">
          <div>
            <strong>${esc(it.name || it.title)}</strong>
            <small>${esc(sub.filter(Boolean).join(" · "))}</small>
          </div>
          <div class="actions">
            <button type="button" class="icon-btn" data-edit="${esc(it.id)}" aria-label="Tahrirlash"><i class="fa-solid fa-pen"></i></button>
            <button type="button" class="icon-btn danger" data-del="${esc(it.id)}" aria-label="O'chirish"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>`;
    }).join("") : `<div class="empty"><i class="fa-regular fa-folder-open"></i>Hech narsa topilmadi</div>`;
  }

  /* ---------- Shakllar ---------- */
  function fillGroups(select, onlyInitiatives) {
    const list = onlyInitiatives ? SITE.initiatives : SITE.groups;
    select.innerHTML = list.map((g) => `<option value="${g.id}">${g.id <= 5 ? g.id + ". " : ""}${esc(g.title)}</option>`).join("");
  }

  function openModal(id) { $("#" + id).classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeModals() { $$(".modal.open").forEach((m) => m.classList.remove("open")); document.body.style.overflow = ""; }

  function openClub(item) {
    state.editing = item ? item.id : null;
    const f = $("#club-form");
    f.reset();
    $("#club-error").textContent = "";
    $("#club-title").textContent = item ? "To'garakni tahrirlash" : "Yangi to'garak";
    if (item) {
      f.name.value = item.name || "";
      f.initiativeId.value = item.initiativeId;
      f.students.value = item.students ?? "";
      f.schedule.value = item.schedule || "";
      f.place.value = item.place || "";
      f.mentors.value = (item.mentors || []).join("\n");
      f.phones.value = (item.phones || []).map((p) => p.text || p).join("\n");
    }
    openModal("club-modal");
    f.name.focus();
  }

  function openContest(item) {
    state.editing = item ? item.id : null;
    const f = $("#contest-form");
    f.reset();
    $("#contest-error").textContent = "";
    $("#contest-title").textContent = item ? "Tanlovni tahrirlash" : "Yangi tanlov";
    const preview = $("#ct-preview");
    preview.style.display = "none";
    $("#ct-image").value = "";
    if (item) {
      const r = item.rules || {};
      f.title.value = item.title || "";
      f.initiativeId.value = item.initiativeId;
      f.status.value = item.status || "active";
      f.start.value = item.start || "";
      f.deadline.value = item.deadline || "";
      f.place.value = item.place || "";
      f.organizer.value = item.organizer || "";
      f.prize.value = item.prize || "";
      f.desc.value = item.desc || "";
      f.purpose.value = r.purpose || "";
      f.requirements.value = (r.requirements || []).join("\n");
      f.stages.value = (r.stages || []).join("\n");
      f.criteria.value = (r.criteria || []).join("\n");
      f.awards.value = r.awards || "";
      if (item.image) {
        $("#ct-image").value = item.image;
        preview.src = item.image;
        preview.style.display = "block";
      }
    }
    openModal("contest-modal");
    f.title.focus();
  }

  async function saveForm(e, kind) {
    e.preventDefault();
    const f = e.target;
    const errEl = $(kind === "clubs" ? "#club-error" : "#contest-error");
    errEl.textContent = "";
    const v = (n) => f.elements[n].value;
    const payload = kind === "clubs"
      ? { name: v("name"), initiativeId: v("initiativeId"), students: v("students"), schedule: v("schedule"), place: v("place"), mentors: v("mentors"), phones: v("phones") }
      : {
          title: v("title"), initiativeId: v("initiativeId"), status: v("status"), start: v("start"), deadline: v("deadline"),
          place: v("place"), organizer: v("organizer"), prize: v("prize"), desc: v("desc"), image: v("image"),
          rules: { purpose: v("purpose"), requirements: v("requirements"), stages: v("stages"), criteria: v("criteria"), awards: v("awards") }
        };
    const btn = f.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      if (state.editing) await api("PUT", `${kind}/${encodeURIComponent(state.editing)}`, payload);
      else await api("POST", kind, payload);
      closeModals();
      await loadAll();
      toast(state.editing ? "O'zgarishlar saqlandi" : "Qo'shildi");
    } catch (err) {
      errEl.textContent = err.message;
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
      render();
    });
    $("#admin-search").addEventListener("input", (e) => { state.query = e.target.value; render(); });
    $("#add-btn").addEventListener("click", () => (state.kind === "clubs" ? openClub() : openContest()));

    $("#rows").addEventListener("click", async (e) => {
      const ed = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      const list = state.items[state.kind];
      if (ed) {
        const item = list.find((x) => x.id === ed.dataset.edit);
        state.kind === "clubs" ? openClub(item) : openContest(item);
      }
      if (del) {
        const item = list.find((x) => x.id === del.dataset.del);
        if (!item || !confirm(`"${item.name || item.title}" o'chirilsinmi? Buni qaytarib bo'lmaydi.`)) return;
        try {
          await api("DELETE", `${state.kind}/${encodeURIComponent(item.id)}`);
          await loadAll();
          toast("O'chirildi");
        } catch (err) {
          alert(err.message);
        }
      }
    });

    $("#club-form").addEventListener("submit", (e) => saveForm(e, "clubs"));
    $("#contest-form").addEventListener("submit", (e) => saveForm(e, "contests"));

    $("#ct-file").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const errEl = $("#contest-error");
      errEl.textContent = "";
      if (file.size > 4 * 1024 * 1024) { errEl.textContent = "Rasm 4 MB dan katta"; return; }
      try {
        const { path } = await api("POST", "upload", { data: await readFile(file) });
        $("#ct-image").value = path;
        const p = $("#ct-preview");
        p.src = path;
        p.style.display = "block";
      } catch (err) {
        errEl.textContent = err.message;
      }
    });

    $$(".modal").forEach((m) => m.addEventListener("click", (e) => {
      if (e.target === m || e.target.closest(".modal-close")) closeModals();
    }));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModals(); });
  }

  /* ---------- Ishga tushirish ---------- */
  async function start() {
    fillGroups($("#cl-group"), false);
    fillGroups($("#ct-group"), true);
    bind();
    try {
      const me = await api("GET", "me");
      if (me.admin) { show("admin-view"); await loadAll(); }
      else showLogin();
    } catch (e) {
      show("offline-view");
    }
  }
  start();
})();
