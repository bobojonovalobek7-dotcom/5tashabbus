/**
 * Yangi o'zbek lotin alifbosi: sahifadagi barcha ko'rinadigan matn shu yerda o'giriladi.
 *   o' → ö,  g' → ğ,  sh → ş,  ch → ç,  tutuq belgisi ' → ʼ
 *
 * Ma'lumotlar (data.js, serverdagi baza, admin kiritgan matn) eski yozuvda qolaveradi —
 * faqat ekranga chiqishda o'giriladi. Shuning uchun kod, havolalar, pochta manzillari
 * va shakllardagi qiymatlar o'zgarmaydi, admin esa istalgan yozuvda kiritishi mumkin.
 * Matnni boshqa yozuvda qoldirish kerak bo'lsa: elementga data-alifbo="off" qo'shing.
 */
(function () {
  "use strict";

  var AP = "'‘’ʻʼ`";                    // ' ‘ ’ ʻ ʼ `
  var LETTER = "A-Za-zÀ-ɏ";
  var RE_OG = new RegExp("([OoGg])[" + AP + "]", "g");
  var RE_TUTUQ = new RegExp("([" + LETTER + "])[" + AP + "](?=[" + LETTER + "])", "g");
  var OG = { O: "Ö", o: "ö", G: "Ğ", g: "ğ" };
  // Pochta, havola, domen, fayl nomi — tegilmaydi
  var NOT_TEXT = /[@\/\\_=<>{}]|:\/\/|^www\.|[A-Za-z]\.[A-Za-z]{2}/;
  // Chet so'zlar (Excel, Hackathon, Facebook, Workshop...): o'zbekchada c faqat ch'da, w va th yo'q
  var FOREIGN = /c(?!h)|w|th/i;

  function word(w) {
    if (NOT_TEXT.test(w)) return w;
    w = w.replace(RE_OG, function (_, l) { return OG[l]; });
    if (!FOREIGN.test(w)) {
      w = w.replace(/([Ss])[Hh]/g, function (_, s) { return s === "S" ? "Ş" : "ş"; })
           .replace(/([Cc])[Hh]/g, function (_, c) { return c === "C" ? "Ç" : "ç"; });
    }
    return w.replace(RE_TUTUQ, "$1ʼ");
  }

  function text(s) {
    return s == null ? s : String(s).replace(/\S+/g, word);
  }

  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, INPUT: 1, CODE: 1, PRE: 1, KBD: 1, SVG: 1, svg: 1 };
  var ATTRS = ["placeholder", "title", "aria-label", "alt"];

  function skipped(el) {
    for (; el && el.nodeType === 1; el = el.parentNode) {
      if (SKIP_TAGS[el.tagName] || el.isContentEditable || (el.getAttribute && el.getAttribute("data-alifbo") === "off")) return true;
    }
    return false;
  }

  function fixText(node) {
    var v = node.nodeValue;
    if (!v || !/[OoGgSsCc'‘’ʻ`]/.test(v) || skipped(node.parentNode)) return;
    var n = text(v);
    if (n !== v) node.nodeValue = n;
  }

  function fixAttr(el, name) {
    var v = el.getAttribute(name);
    if (!v || skipped(el)) return;
    var n = text(v);
    if (n !== v) el.setAttribute(name, n);
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { fixText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    if (root.nodeType === 1) {
      if (skipped(root)) return;
      ATTRS.forEach(function (a) { if (root.hasAttribute(a)) fixAttr(root, a); });
    }
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null);
    for (var n = tw.nextNode(); n; n = tw.nextNode()) {
      if (n.nodeType === 3) fixText(n);
      else ATTRS.forEach(function (a) { if (n.hasAttribute(a)) fixAttr(n, a); });
    }
  }

  window.ALIFBO = {
    text: text,
    // Qidiruv uchun: eski va yangi yozuv bir xil taqqoslanadi
    norm: function (s) { return text(String(s == null ? "" : s)).toLowerCase(); }
  };

  walk(document.documentElement);
  new MutationObserver(function (list) {
    list.forEach(function (m) {
      if (m.type === "characterData") fixText(m.target);
      else if (m.type === "attributes") fixAttr(m.target, m.attributeName);
      else m.addedNodes.forEach(walk);
    });
  }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  document.addEventListener("DOMContentLoaded", function () { walk(document.documentElement); });
})();
