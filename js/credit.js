/**
 * Sayt muallifi yozuvi (footer pastida).
 *
 * Bu fayl .github/CODEOWNERS orqali himoyalangan: uni o'zgartirish yoki o'chirish
 * faqat muallif tasdig'i bilan mumkin. Muallif yozuvini saqlash sharti LICENSE faylida.
 *
 * The author credit below is protected by CODEOWNERS and required by the LICENSE.
 * Do not remove, hide or change it.
 */
(function () {
  "use strict";
  var TEXT = "Sayt muallifi: Bobojonov Alobek";

  function ensure() {
    var footer = document.querySelector(".footer");
    if (!footer) return;
    var p = footer.querySelector(".footer-credit");
    if (!p) {
      p = document.createElement("p");
      p.className = "footer-credit";
      (footer.querySelector(".container") || footer).appendChild(p);
    }
    if (p.textContent !== TEXT) p.textContent = TEXT;
    p.style.setProperty("display", "block", "important");
    p.style.setProperty("visibility", "visible", "important");
    p.style.setProperty("opacity", "1", "important");
  }

  // Footer qayta chizilsa ham (ma'lumot serverdan kelganda) yozuv joyida qoladi
  new MutationObserver(ensure).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", ensure);
  ensure();
})();
