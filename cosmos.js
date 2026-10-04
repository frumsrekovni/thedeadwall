/* cosmos.js — sprinkles a few individually twinkling stars over the page.
   No cursor interaction: some stars flicker slowly and a few drift, like the
   real night sky. Loaded on every page. Honors prefers-reduced-motion. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var layer = document.createElement("div");
  layer.className = "starlayer";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  var COUNT = 16;            // how many "live" stars
  var rnd = function (a, b) { return a + Math.random() * (b - a); };

  for (var i = 0; i < COUNT; i++) {
    var s = document.createElement("span");
    s.className = "tw";
    var size = rnd(1.5, 3.4);
    s.style.left = rnd(2, 98) + "vw";
    s.style.top = rnd(2, 96) + "vh";
    s.style.setProperty("--s", size.toFixed(1) + "px");
    s.style.setProperty("--base", rnd(0.35, 0.8).toFixed(2));
    if (!reduce) {
      // slow, staggered flicker so flares happen "every now and then"
      s.style.setProperty("--dur", rnd(7, 16).toFixed(1) + "s");
      s.style.setProperty("--delay", (-rnd(0, 16)).toFixed(1) + "s");
      // ~1 in 3 also drifts slowly across a long arc
      if (Math.random() < 0.34) {
        s.classList.add("drift");
        s.style.setProperty("--dx", rnd(-22, 22).toFixed(0) + "px");
        s.style.setProperty("--dy", rnd(-18, 18).toFixed(0) + "px");
        s.style.setProperty("--ddur", rnd(45, 80).toFixed(0) + "s");
      }
    }
    layer.appendChild(s);
  }
})();
