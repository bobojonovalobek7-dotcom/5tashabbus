/**
 * Kitob o'quvchi: PDF sayt ichida, kitobdek ochiladi (PDF.js).
 * Katta ekranda ikki sahifa yonma-yon (muqova alohida), telefonda bitta sahifa.
 * Boshqaruv: ← → tugmalari, klaviatura, barmoq bilan surish, sahifa slayderi, kattalashtirish.
 * Oxirgi o'qilgan sahifa brauzerda eslab qolinadi.
 *
 * Ishlatish: Reader.open({ id, title, author, pdf, onRead(count) })
 */
(function () {
  "use strict";

  const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
  // Ichiga shrift joylanmagan PDF'lar uchun standart shriftlar va kirill/arab kodlash jadvallari
  const DIST = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* muhim emas */ } }
  };

  let lib = null;
  function loadLib() {
    if (lib) return lib;
    lib = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = PDFJS + "pdf.min.js";
      s.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js";
        resolve(window.pdfjsLib);
      };
      s.onerror = () => { lib = null; reject(new Error("O'quvchi yuklanmadi. Internetni tekshiring.")); };
      document.head.appendChild(s);
    });
    return lib;
  }

  // ---------- Oyna ----------
  let el, doc = null, book = null, page = 1, zoom = 1, tasks = [], loadTask = null;

  function build() {
    el = document.createElement("div");
    el.className = "rd";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Kitob o'qish");
    el.innerHTML = `
      <div class="rd-top">
        <div class="rd-title"><strong></strong><span></span></div>
        <div class="rd-tools">
          <button type="button" class="rd-btn" data-act="zoom-out" aria-label="Kichraytirish"><i class="fa-solid fa-minus"></i></button>
          <span class="rd-zoom">100%</span>
          <button type="button" class="rd-btn" data-act="zoom-in" aria-label="Kattalashtirish"><i class="fa-solid fa-plus"></i></button>
          <button type="button" class="rd-btn rd-close" data-act="close" aria-label="Yopish"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>
      <div class="rd-stage">
        <div class="rd-book"></div>
        <div class="rd-load"><span class="rd-spin"></span><b>Kitob ochilmoqda…</b><small></small></div>
      </div>
      <button type="button" class="rd-nav rd-prev" data-act="prev" aria-label="Oldingi sahifa"><i class="fa-solid fa-chevron-left"></i></button>
      <button type="button" class="rd-nav rd-next" data-act="next" aria-label="Keyingi sahifa"><i class="fa-solid fa-chevron-right"></i></button>
      <div class="rd-bottom">
        <span class="rd-pages"></span>
        <input type="range" class="rd-range" min="1" value="1" aria-label="Sahifaga o'tish">
      </div>`;
    document.body.appendChild(el);

    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-act]");
      if (!b) return;
      const a = b.dataset.act;
      if (a === "close") close();
      else if (a === "prev") go(-1);
      else if (a === "next") go(1);
      else if (a === "zoom-in") setZoom(zoom + 0.25);
      else if (a === "zoom-out") setZoom(zoom - 0.25);
    });
    const range = el.querySelector(".rd-range");
    range.addEventListener("input", () => { page = Number(range.value); render(); });

    document.addEventListener("keydown", (e) => {
      if (!el.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
    });

    // Barmoq bilan surish (kattalashtirilmaganda)
    let x0 = null;
    const stage = el.querySelector(".rd-stage");
    stage.addEventListener("touchstart", (e) => { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      if (x0 === null || zoom > 1) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      x0 = null;
    });

    // Oyna o'lchami o'zgarsa (telefon burilishi, oyna kattalashishi) sahifalar qayta joylanadi
    let t, lastW = 0, lastH = 0;
    new ResizeObserver(() => {
      if (!el.classList.contains("open") || (stage.clientWidth === lastW && stage.clientHeight === lastH)) return;
      lastW = stage.clientWidth;
      lastH = stage.clientHeight;
      clearTimeout(t);
      t = setTimeout(render, 150);
    }).observe(stage);
  }

  // Ikki sahifali ko'rinish: muqova (1) alohida, keyin 2–3, 4–5 ...
  const spread = () => window.innerWidth >= 1000 && window.innerWidth > window.innerHeight;
  function viewPages() {
    if (!doc) return [];
    const n = doc.numPages;
    if (!spread() || page === 1) return [page];
    const left = page % 2 === 0 ? page : page - 1;
    return [left, left + 1].filter((p) => p >= 1 && p <= n);
  }
  function go(dir) {
    if (!doc) return;
    const v = viewPages();
    const next = dir > 0 ? v[v.length - 1] + 1 : v[0] - (spread() && v[0] > 2 ? 2 : 1);
    if (next < 1 || next > doc.numPages) return;
    page = next;
    render();
  }
  function setZoom(z) {
    zoom = Math.min(3, Math.max(0.5, Math.round(z * 100) / 100));
    render();
  }

  async function render() {
    if (!doc) return;
    const pages = viewPages();
    page = pages[0];
    tasks.forEach((t) => t.cancel());
    tasks = [];

    const stage = el.querySelector(".rd-stage");
    const wrap = el.querySelector(".rd-book");
    const availH = stage.clientHeight - 24;
    const availW = (stage.clientWidth - 24) / pages.length;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const canvases = pages.map(() => document.createElement("canvas"));
    wrap.className = "rd-book" + (pages.length === 2 ? " two" : "");
    wrap.replaceChildren(...canvases.map((c, i) => {
      const p = document.createElement("div");
      p.className = "rd-page" + (pages.length === 2 ? (i ? " right" : " left") : "");
      p.appendChild(c);
      return p;
    }));

    await Promise.all(pages.map(async (num, i) => {
      const pg = await doc.getPage(num);
      const base = pg.getViewport({ scale: 1 });
      const fit = Math.min(availH / base.height, availW / base.width);
      const vp = pg.getViewport({ scale: fit * zoom * dpr });
      const c = canvases[i];
      c.width = Math.floor(vp.width);
      c.height = Math.floor(vp.height);
      c.style.width = Math.floor(vp.width / dpr) + "px";
      c.style.height = Math.floor(vp.height / dpr) + "px";
      const task = pg.render({ canvasContext: c.getContext("2d"), viewport: vp });
      tasks.push(task);
      try { await task.promise; } catch (e) { /* keyingi sahifaga o'tildi */ }
    }));

    stage.classList.toggle("zoomed", zoom > 1);
    const n = doc.numPages;
    el.querySelector(".rd-pages").textContent = pages.length === 2 ? `${pages[0]}–${pages[1]} / ${n}` : `${pages[0]} / ${n}`;
    el.querySelector(".rd-zoom").textContent = Math.round(zoom * 100) + "%";
    const range = el.querySelector(".rd-range");
    range.max = n;
    range.value = pages[0];
    el.querySelector(".rd-prev").disabled = pages[0] <= 1;
    el.querySelector(".rd-next").disabled = pages[pages.length - 1] >= n;
    if (book) store.set("urdu5t-read-" + book.id, String(pages[0]));
  }

  async function open(b) {
    if (!el) build();
    book = b;
    doc = null;
    zoom = 1;
    el.querySelector(".rd-title strong").textContent = b.title || "";
    el.querySelector(".rd-title span").textContent = b.author || "";
    el.querySelector(".rd-book").replaceChildren();
    el.querySelector(".rd-pages").textContent = "";
    const load = el.querySelector(".rd-load");
    load.hidden = false;
    load.querySelector("b").textContent = "Kitob ochilmoqda…";
    load.querySelector("small").textContent = "";
    el.classList.add("open");
    document.body.style.overflow = "hidden";
    el.querySelector(".rd-close").focus();

    // O'qishlar sonini yangilaymiz (server bir kishini 6 soatda bir marta sanaydi)
    fetch(`api/books/${encodeURIComponent(b.id)}/read`, { method: "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && typeof b.onRead === "function") b.onRead(d.reads); })
      .catch(() => {});

    try {
      const pdfjs = await loadLib();
      loadTask = pdfjs.getDocument({ url: b.pdf, cMapUrl: DIST + "cmaps/", cMapPacked: true, standardFontDataUrl: DIST + "standard_fonts/" });
      loadTask.onProgress = ({ loaded, total }) => {
        if (total) load.querySelector("small").textContent = Math.round((loaded / total) * 100) + "%";
      };
      const d = await loadTask.promise;
      if (book !== b) return;  // boshqa kitob ochilgan
      doc = d;
      page = Math.min(Number(store.get("urdu5t-read-" + b.id)) || 1, doc.numPages);
      load.hidden = true;
      await render();
    } catch (e) {
      load.querySelector("b").textContent = "Kitobni ochib bo'lmadi";
      load.querySelector("small").textContent = e && e.message && !/abort/i.test(e.message) ? "Faylni tekshiring yoki keyinroq urinib ko'ring." : "";
      load.querySelector(".rd-spin").hidden = true;
    }
  }

  function close() {
    if (!el) return;
    tasks.forEach((t) => t.cancel());
    if (loadTask) { try { loadTask.destroy(); } catch (e) { /* yopildi */ } }
    if (doc) { try { doc.destroy(); } catch (e) { /* yopildi */ } }
    doc = null;
    book = null;
    el.classList.remove("open");
    el.querySelector(".rd-spin").hidden = false;
    document.body.style.overflow = "";
  }

  window.Reader = { open, close, esc };
})();
