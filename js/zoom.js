/* =============================================================
   THE PAPER MEADOW - photo zoom
   Click a member photo (or the group photo) to enlarge it.
   Close with: click anywhere, the X button, or Esc.
   Self-contained: it adds its own CSS and pop-up, so nothing else
   in index.html, style.css or script.js needs to change.
   ============================================================= */
(function () {
  "use strict";

  var css = [
    ".member-shot, .hero-shot { cursor: zoom-in; }",
    ".member-shot:focus-visible, .hero-shot:focus-visible { outline: 3px solid #fff; outline-offset: -6px; }",
    ".film-hero { cursor: zoom-in; }",
    ".film-body { cursor: auto; }",
    ".zoom-btn { position: absolute; top: 14px; right: 14px; z-index: 1; font-family: var(--font-body); font-weight: 700; font-size: .8rem; padding: .4rem .9rem; border-radius: 999px; border: 1.75px solid var(--ink-line); box-shadow: 2px 3px 0 var(--ink-line); background: var(--paper); color: var(--ink); cursor: pointer; }",
    ".film-art.is-missing ~ .zoom-btn { display: none; }",
    ".zoom-dialog { border: none; background: transparent; padding: 0; max-width: 94vw; max-height: 94vh; overflow: visible; }",
    ".zoom-dialog::backdrop { background: rgba(10, 12, 25, .85); backdrop-filter: blur(4px); }",
    ".zoom-dialog figure { margin: 0; text-align: center; }",
    ".zoom-dialog img { display: block; margin: 0 auto; max-width: 92vw; max-height: 78vh; width: auto; border: 6px solid var(--photo-frame, #fff); border-radius: 10px; box-shadow: 0 20px 60px rgba(0, 0, 0, .55); cursor: zoom-out; animation: zoomIn .28s cubic-bezier(.2, .9, .3, 1.15); }",
    ".zoom-dialog figcaption { margin-top: .8rem; font-family: var(--font-hand); font-weight: 600; font-size: 1.15rem; color: #fff; text-shadow: 0 1px 6px rgba(0, 0, 0, .7); }",
    ".zoom-close { position: fixed; top: max(14px, env(safe-area-inset-top, 0px)); right: max(14px, env(safe-area-inset-right, 0px)); width: 44px; height: 44px; border-radius: 50%; border: 1.75px solid var(--ink-line); box-shadow: 2px 3px 0 var(--ink-line); background: var(--paper); color: var(--ink); font-size: 1.7rem; line-height: 1; cursor: pointer; }",
    "@keyframes zoomIn { from { opacity: 0; transform: scale(.7); } to { opacity: 1; transform: scale(1); } }",
    "@media (prefers-reduced-motion: reduce) { .zoom-dialog img { animation: none; } }"
  ].join("\n");
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var dlg = document.createElement("dialog");
  dlg.className = "zoom-dialog";
  dlg.setAttribute("aria-label", "Larger photo");
  dlg.innerHTML =
    '<button class="zoom-close" type="button" aria-label="Close">\u00d7</button>' +
    '<figure><img id="zoom-img" alt=""><figcaption id="zoom-cap"></figcaption></figure>';
  document.body.appendChild(dlg);
  if (typeof dlg.showModal !== "function") return;

  var big = dlg.querySelector("#zoom-img");
  var cap = dlg.querySelector("#zoom-cap");

  function open(slot) {
    var img = slot && slot.querySelector("img");
    if (!img || !img.complete || !img.naturalWidth) return; // placeholder only
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    cap.textContent = img.alt;
    dlg.showModal();
  }

  // 10 member photos + the group photo on the Home hero
  document.querySelectorAll(".member-shot, .hero-shot").forEach(function (slot) {
    slot.setAttribute("role", "button");
    slot.setAttribute("tabindex", "0");
    slot.setAttribute("aria-label", "Enlarge photo");
    slot.addEventListener("click", function () { open(slot); });
    slot.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(slot); }
    });
  });

  // Group photo in the Group 5 movie card: a button, or click the empty part of the hero
  document.querySelectorAll(".film-hero").forEach(function (hero) {
    var art = hero.querySelector(".film-art");
    if (!art) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "zoom-btn";
    btn.textContent = "\uD83D\uDD0D View group photo";
    art.insertAdjacentElement("afterend", btn);
    btn.addEventListener("click", function () { open(art); });
    hero.addEventListener("click", function (e) { if (e.target === hero) open(art); });
  });

  // Close: click anywhere, X, or Esc (Esc is automatic with <dialog>)
  dlg.addEventListener("click", function () { dlg.close(); });
  dlg.querySelector(".zoom-close").addEventListener("click", function (e) {
    e.stopPropagation();
    dlg.close();
  });
})();
