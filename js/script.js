/* =============================================================
   THE PAPER MEADOW - e-Portfolio scripts
   1. The painted anime world behind every page (one scene per page)
   1b. Film-still backgrounds with citations (one per page, optional)
   2. Drifting leaves (day) and fireflies (night) over the painting
   3. Title letters that drop in one by one
   4. Mobile menu
   5. Live counts (members, reflections, works, tools) + count-up
   6. Page router with page-turn animation
   7. Day / night toggle
   8. Reflection tabs
   9. Scroll reveals
   10. Best Works filter + reflection pop-up
   11. Copy email button
   12. Back-to-top paper plane + reading progress line
   ============================================================= */
(function () {
  "use strict";

  var SITE = "The Paper Meadow";
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var darkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  function cssVar(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }
  function isNight() {
    return cssVar("--particle") === "firefly";
  }
  function scrollTop() {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
  }
  function listen(mql, fn) {
    if (mql.addEventListener) mql.addEventListener("change", fn);
    else if (mql.addListener) mql.addListener(fn);
  }
  function replay(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth; // restart the CSS animation
    el.classList.add(cls);
  }

  /* =============================================================
     1. THE PAINTED WORLD
     One full-screen <canvas id="world"> behind every page. Each page
     names its scene with data-scene="..." on its <div class="sky">:
     tide, dawn, twilight, moonlit or starry. The seascape is painted
     once (sky, sun, mountains, hills, trees, cottage, flowers), then
     clouds, grass, smoke and fireflies move on top. Scrolling tilts the
     "camera" up a little (parallax).
     ============================================================= */
  var world = (function () {
    var canvas = document.getElementById("world");
    if (!canvas || !canvas.getContext) return { setScene: function () {}, refresh: function () {} };
    var TAU = Math.PI * 2;

    /* Colors for each scene. Hex values can be mixed, rgba() cannot.
       sea: [far, near] water colors; glint: "r,g,b" of the sparkles on the water. */
    var HOUSE = { path: ["#eadcb4", "#c9b487"], wall: "#f7f0e2", wallShade: "#d6cab2", roof: "#c8463a", roofShade: "#8c2e27", window: "#6d93b6", windowLit: "#ffd36a", smoke: "255,255,255" };
    function withHouse(p, extra) { var k; for (k in HOUSE) if (!(k in p)) p[k] = HOUSE[k]; for (k in extra || {}) p[k] = extra[k]; return p; }
    var NIGHT_HOUSE = { path: ["#3d4a5c", "#2c3646"], wall: "#a9b0bf", wallShade: "#6f778a", roof: "#4e2a33", roofShade: "#2c1820", window: "#2e3550", smoke: "190,200,225" };
    var PAL = {
      tide: withHouse({
        sky: ["#1d5ba8", "#3d8bd0", "#8fcbe8", "#dff1f1"],
        sun: { x: .84, y: .32, r: .03, core: "#fffdf2", glow: "rgba(255,250,228,0.7)", rays: .08 },
        cloud: { light: "#ffffff", mid: "#eef5fb", shade: "#9fb8d6", under: "rgba(90,130,180,0.38)", warm: null },
        mountains: ["#7fa6c2", "#5f8eae"], haze: "rgba(214,236,244,0.75)",
        sea: ["#4aa3c8", "#145985"], seaLight: "rgba(255,255,255,0.45)", seaDark: "rgba(8,45,80,0.35)", glint: "255,252,235",
        hills: ["#9fd27a", "#7dbb55", "#5c9d3f"], grassDark: "#356b2c", grassLight: "#c4e894", rim: "rgba(246,255,220,0.8)",
        farTree: ["#4f7f6a", "#6f9f86"], tree: ["#245426", "#3a7631", "#68a646", "#a1d26c"], trunk: "#59412f",
        flowers: ["#ffffff", "#ffe27a", "#f0625a", "#bfe3ff"], shadow: "rgba(20,60,60,0.14)", motes: true
      }),
      dawn: withHouse({
        sky: ["#3a64ad", "#7aa6d8", "#e6d6cf", "#f8c8a2"],
        sun: { x: .14, y: .82, r: .034, core: "#fffaf0", glow: "rgba(255,226,190,0.8)", rays: .14 },
        cloud: { light: "#fff9f2", mid: "#f6e6dc", shade: "#a9a9c6", under: "rgba(120,120,165,0.32)", warm: "rgba(255,206,170,0.45)" },
        mountains: ["#9aaecb", "#7c93b6"], haze: "rgba(250,232,220,0.8)",
        sea: ["#8fb6cf", "#2f6788"], seaLight: "rgba(255,240,225,0.5)", seaDark: "rgba(30,60,100,0.3)", glint: "255,236,210",
        hills: ["#a8cf86", "#86b865", "#5f9447"], grassDark: "#3f6f33", grassLight: "#d6e9a8", rim: "rgba(255,240,215,0.85)",
        farTree: ["#6d8a8e", "#8aa7a8"], tree: ["#2c5a2b", "#477f37", "#78ae55", "#b3d985"], trunk: "#5d4535",
        flowers: ["#ffffff", "#fff0a8", "#f7a8bd", "#c9b7f2"], shadow: "rgba(40,50,80,0.12)", mist: "rgba(255,245,235,0.55)", motes: true
      }),
      twilight: withHouse({
        sky: ["#232a66", "#5b4f97", "#d67c96", "#f6b486"],
        sun: { x: .58, y: .97, r: .055, core: "#fff0c8", glow: "rgba(255,160,120,0.7)", rays: .14 },
        cloud: { light: "#ffd3b8", mid: "#e79fa8", shade: "#6b5a94", under: "rgba(60,50,110,0.45)", warm: "rgba(255,190,150,0.5)" },
        mountains: ["#6f5e98", "#544a80"], haze: "rgba(240,160,160,0.5)",
        sea: ["#8a6fa6", "#2a2b63"], seaLight: "rgba(255,210,190,0.5)", seaDark: "rgba(20,20,60,0.4)", glint: "255,205,160",
        hills: ["#6f8a5a", "#566f47", "#3b5233"], grassDark: "#26361f", grassLight: "#c49a72", rim: "rgba(255,180,140,0.85)",
        farTree: ["#4d4a70", "#605b86"], tree: ["#1f2a1c", "#323f27", "#56663a", "#a88a5a"], trunk: "#2a2018",
        flowers: ["#ffe2c4", "#ffb88a", "#ff8a8a", "#fff2e0"], shadow: "rgba(40,20,60,0.18)"
      }, { path: ["#b49a8c", "#8a7268"], wall: "#eedcc8", wallShade: "#b89c90", window: "#7a6b8e" }),
      moonlit: withHouse({
        sky: ["#071430", "#11305a", "#1d5878", "#2f7f8e"],
        moon: { x: .72, y: .28, r: .026, core: "#f7f3dc", glow: "rgba(200,230,255,0.32)" }, stars: .6,
        cloud: { light: "#5a7ea0", mid: "#3f6286", shade: "#1e3656", under: "rgba(5,15,35,0.5)", warm: "rgba(190,220,250,0.25)" },
        mountains: ["#1f3f5e", "#17324c"], haze: "rgba(60,110,140,0.45)",
        sea: ["#1d5a74", "#071c33"], seaLight: "rgba(210,235,255,0.35)", seaDark: "rgba(0,10,25,0.45)", glint: "225,240,255",
        hills: ["#2a4f48", "#1f3f3a", "#14302c"], grassDark: "#0d221d", grassLight: "#4f7f70", rim: "rgba(170,210,255,0.45)",
        farTree: ["#15303f", "#1d3d4e"], tree: ["#0c1c18", "#142a24", "#21423a", "#4a7a6c"], trunk: "#14100c",
        flowers: ["#cfe0ff", "#fff1ae", "#9fc0e6", "#e6f0ff"], lit: true, fireflies: true
      }, NIGHT_HOUSE),
      starry: withHouse({
        sky: ["#040919", "#0c173a", "#182a58", "#26406e"],
        moon: { x: .2, y: .22, r: .022, core: "#f7f3dc", glow: "rgba(214,226,255,0.3)" }, stars: 1,
        cloud: { light: "#3a4a78", mid: "#2c3a66", shade: "#182346", under: "rgba(5,10,30,0.5)", warm: "rgba(170,190,240,0.22)" },
        mountains: ["#1c2b52", "#152246"], haze: "rgba(50,70,120,0.45)",
        sea: ["#1a3256", "#060f24"], seaLight: "rgba(200,215,255,0.3)", seaDark: "rgba(0,5,20,0.45)", glint: "215,225,255",
        hills: ["#21403a", "#19342f", "#112723"], grassDark: "#0c1e19", grassLight: "#3f6b5c", rim: "rgba(170,200,255,0.42)",
        farTree: ["#18283a", "#22344a"], tree: ["#0b1915", "#122621", "#1e3930", "#3e6a5a"], trunk: "#130e0b",
        flowers: ["#c6d2ff", "#fff1ae", "#9daee6", "#e6ecff"], mist: "rgba(150,170,220,0.2)", lit: true, fireflies: true
      }, NIGHT_HOUSE),
      /* used for every page in night mode */
      night: withHouse({
        sky: ["#050b1f", "#0f1c42", "#1c3162", "#2f4878"],
        moon: { x: .84, y: .18, r: .026, core: "#f6f2da", glow: "rgba(214,226,255,0.28)" }, stars: 1,
        cloud: { light: "#3c4b78", mid: "#2e3c66", shade: "#1a2546", under: "rgba(5,10,30,0.5)", warm: "rgba(170,190,240,0.22)" },
        mountains: ["#22345e", "#1a2a4e"], haze: "rgba(56,76,126,0.5)",
        sea: ["#1d3a62", "#061026"], seaLight: "rgba(200,215,255,0.3)", seaDark: "rgba(0,5,20,0.45)", glint: "220,230,255",
        hills: ["#21403a", "#19342f", "#112723"], grassDark: "#0c1e19", grassLight: "#3f6b5c", rim: "rgba(170,200,255,0.42)",
        farTree: ["#18283a", "#22344a"], tree: ["#0b1915", "#122621", "#1e3930", "#3e6a5a"], trunk: "#130e0b",
        flowers: ["#c6d2ff", "#fff1ae", "#9daee6", "#e6ecff"], mist: "rgba(150,170,220,0.22)", lit: true, fireflies: true
      }, NIGHT_HOUSE)
    };

    /* What each page's painting contains. Positions are fractions of the width.
       shore: { left: x } land on the left up to x, { right: x } land from x to the right edge. */
    var LAYOUT = {
      tide:     { clouds: [{ x: .48, w: .36, a: .85, lift: 0 }, { x: .2, w: .24, a: .3, lift: 1 }, { x: .02, w: .18, a: .45, lift: .35 }, { x: .78, w: .16, a: .5, lift: .55 }],
                  islands: [{ a: .04, b: .24 }, { a: .5, b: .66 }], shore: { right: .74 }, cottage: .82, tree: { x: .69, s: .95 }, path: true, pathFrom: .93 },
      dawn:     { clouds: [{ x: .55, w: .3, a: .6, lift: .05 }, { x: .08, w: .18, a: .45, lift: .35 }, { x: .85, w: .14, a: .45, lift: .5 }],
                  islands: [{ a: .3, b: .52 }, { a: .72, b: .97 }], shore: { left: .3 }, tree: { x: .13, s: .9 }, mist: true },
      twilight: { clouds: [{ x: .25, w: .32, a: .65, lift: .04 }, { x: .72, w: .2, a: .5, lift: .3 }, { x: .02, w: .14, a: .45, lift: .55 }],
                  islands: [{ a: -.02, b: .16 }, { a: .82, b: 1.02 }], shore: { left: .16, right: .86 }, tree: { x: .92, s: 1 } },
      moonlit:  { clouds: [{ x: .3, w: .3, a: .5, lift: .1 }, { x: .82, w: .16, a: .4, lift: .35 }],
                  islands: [{ a: .06, b: .3 }], shore: { left: .26 }, tree: { x: .1, s: .85 } },
      starry:   { clouds: [{ x: .5, w: .28, a: .5, lift: .08 }, { x: .05, w: .16, a: .4, lift: .45 }],
                  islands: [{ a: .58, b: .84 }], shore: { left: .32, right: .86 }, cottage: .17, tree: { x: .93, s: .9 }, mist: true }
    };

    /* --- small helpers --- */
    function seeded(a) {
      return function () {
        a = (a + 0x6D2B79F5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    function hash(s) {
      var h = 2166136261;
      for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
      return h >>> 0;
    }
    function rgb(hex) {
      var h = hex.replace("#", "");
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    function mix(a, b, t) {
      var A = rgb(a), B = rgb(b);
      return "rgb(" + Math.round(A[0] + (B[0] - A[0]) * t) + "," + Math.round(A[1] + (B[1] - A[1]) * t) + "," + Math.round(A[2] + (B[2] - A[2]) * t) + ")";
    }
    function circle(g, x, y, r) { g.beginPath(); g.arc(x, y, Math.max(0.1, r), 0, TAU); g.fill(); }
    function oval(g, x, y, rx, ry) { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU); g.fill(); }
    function layer(W, H, dpr, paint) {
      var c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(W * dpr));
      c.height = Math.max(1, Math.round(H * dpr));
      var g = c.getContext("2d");
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(g);
      return c;
    }
    function curvePath(g, W, H, fy, step) {
      g.beginPath();
      g.moveTo(0, H + 2);
      for (var x = 0; x <= W + step; x += step) g.lineTo(x, fy(Math.min(1, x / W)));
      g.lineTo(W, H + 2);
      g.closePath();
    }
    /* sharp-peaked mountain ridge */
    function ridge(rng, base, amp, sharp) {
      var p1 = rng() * TAU, p2 = rng() * TAU, p3 = rng() * TAU;
      var f1 = 1.1 + rng() * 1.1, f2 = 2.8 + rng() * 2, f3 = 8 + rng() * 6;
      return function (t) {
        var peak = 1 - Math.abs(Math.sin(Math.PI * f1 * t + p1));
        var roll = .5 + .5 * Math.sin(TAU * f1 * .5 * t + p1);
        var m = .58 * (peak * sharp + roll * (1 - sharp)) + .28 * (.5 + .5 * Math.sin(TAU * f2 * t + p2)) + .14 * (.5 + .5 * Math.sin(TAU * f3 * t + p3));
        return base - amp * m;
      };
    }
    /* soft rolling hill */
    function hill(rng, base, amp) {
      var p1 = rng() * TAU, p2 = rng() * TAU, f1 = .5 + rng() * .7, f2 = 1.4 + rng() * 1.2;
      return function (t) {
        return base - amp * (.62 * (.5 + .5 * Math.sin(TAU * f1 * t + p1)) + .38 * (.5 + .5 * Math.sin(TAU * f2 * t + p2)));
      };
    }

    /* --- the big puffy anime cumulus --- */
    function makeCloud(rng, cw, ch, pal, dpr) {
      return layer(cw, ch, dpr, function (g) {
        var base = ch * .9, puffs = [];
        var n = Math.max(5, Math.round(cw / (ch * .2 + 1)));
        for (var i = 0; i < n; i++) {
          var t = (i + .5) / n, edge = Math.max(.45, 1 - Math.abs(t - .5) * 1.1);
          var r = ch * (.13 + rng() * .07) * edge;
          puffs.push({ x: cw * (.08 + t * .84), y: base - r * .5, r: r });
        }
        var m = n * 2 + 4;
        for (var j = 0; j < m; j++) {
          var u = rng();
          var bell = Math.exp(-Math.pow((u - .5) / .24, 2));
          var r2 = ch * (.1 + .14 * bell + rng() * .05);
          var lift = bell * (base - r2 * 1.1 - ch * .06) * (.45 + rng() * .55);
          var x2 = Math.min(cw - r2, Math.max(r2, cw * (.14 + u * .72)));
          puffs.push({ x: x2, y: Math.max(r2 + 1, base - r2 * .5 - lift), r: r2 });
        }
        // paint top puffs first so the lower, nearer billows overlap them
        puffs.sort(function (a, b) { return a.y - b.y; });
        g.save();
        g.beginPath(); g.rect(0, 0, cw, base); g.clip();
        puffs.forEach(function (p) {
          var gr = g.createRadialGradient(p.x - p.r * .35, p.y - p.r * .45, p.r * .1, p.x, p.y, p.r * 1.02);
          gr.addColorStop(0, pal.light);
          gr.addColorStop(.55, pal.mid);
          gr.addColorStop(1, pal.shade);
          g.fillStyle = gr;
          circle(g, p.x, p.y, p.r);
        });
        g.globalCompositeOperation = "source-atop";
        var ug = g.createLinearGradient(0, base - ch * .4, 0, base);
        ug.addColorStop(0, "rgba(0,0,0,0)");
        ug.addColorStop(1, pal.under);
        g.fillStyle = ug;
        g.fillRect(0, 0, cw, ch);
        if (pal.warm) {
          var wg = g.createLinearGradient(0, 0, 0, base);
          wg.addColorStop(0, pal.warm);
          wg.addColorStop(.7, "rgba(0,0,0,0)");
          g.fillStyle = wg;
          g.fillRect(0, 0, cw, ch);
        }
        g.restore();
      });
    }

    /* --- sky, stars, sun or moon, light rays --- */
    function paintSky(g, W, H, hY, pal, rng) {
      var grd = g.createLinearGradient(0, 0, 0, Math.max(10, hY + 10));
      for (var i = 0; i < pal.sky.length; i++) grd.addColorStop(i / (pal.sky.length - 1), pal.sky[i]);
      g.fillStyle = grd;
      g.fillRect(0, 0, W, H);

      if (pal.stars) {
        var n = Math.round(W * hY / 1600 * pal.stars);
        for (var s = 0; s < n; s++) {
          var sx = rng() * W, sy = rng() * hY * .95, big = rng() < .05;
          var a = (.35 + rng() * .65) * (1 - sy / hY * .55);
          g.fillStyle = "rgba(255,252,235," + a.toFixed(3) + ")";
          circle(g, sx, sy, big ? 1.5 : .45 + rng() * .7);
          if (big) {
            g.fillStyle = "rgba(255,252,235," + (a * .35).toFixed(3) + ")";
            g.fillRect(sx - 5, sy - .4, 10, .8);
            g.fillRect(sx - .4, sy - 5, .8, 10);
          }
        }
      }

      var b = pal.sun || pal.moon;
      if (!b) return;
      var bx = W * b.x, by = hY * b.y, r = Math.max(12, Math.min(W, H * 1.6) * b.r);
      if (pal.sun) {
        var glow = g.createRadialGradient(bx, by, r * .6, bx, by, r * 7);
        glow.addColorStop(0, b.glow);
        glow.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = glow;
        g.fillRect(0, 0, W, H);
        if (b.rays) {
          g.save();
          g.globalCompositeOperation = "lighter";
          var len = Math.sqrt(W * W + H * H);
          for (var k = 0; k < 7; k++) {
            var ang = Math.PI * .5 + (bx > W / 2 ? .45 : -.45) + (k - 3) * .16 + (rng() - .5) * .08;
            var spread = .025 + rng() * .04;
            var rg = g.createLinearGradient(bx, by, bx + Math.cos(ang) * len * .7, by + Math.sin(ang) * len * .7);
            rg.addColorStop(0, "rgba(255,250,225," + b.rays + ")");
            rg.addColorStop(1, "rgba(255,250,225,0)");
            g.fillStyle = rg;
            g.beginPath();
            g.moveTo(bx, by);
            g.lineTo(bx + Math.cos(ang - spread) * len, by + Math.sin(ang - spread) * len);
            g.lineTo(bx + Math.cos(ang + spread) * len, by + Math.sin(ang + spread) * len);
            g.closePath();
            g.fill();
          }
          g.restore();
        }
        g.fillStyle = b.core;
        circle(g, bx, by, r);
      } else {
        g.fillStyle = b.core;
        circle(g, bx, by, r);
        g.fillStyle = grd; // paint the sky back over part of the disc: a crescent
        circle(g, bx + r * .45, by - r * .2, r * .9);
        var mg = g.createRadialGradient(bx, by, r * .8, bx, by, r * 6);
        mg.addColorStop(0, b.glow);
        mg.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = mg;
        g.fillRect(0, 0, W, H);
      }
    }

    /* --- hills with painted grass strokes, cloud shadows and a sunlit rim --- */
    function paintHill(g, W, H, fy, color, pal, rng, strokes, len) {
      var top = H;
      for (var x = 0; x <= W; x += 16) top = Math.min(top, fy(x / W));
      var grd = g.createLinearGradient(0, top, 0, H);
      grd.addColorStop(0, color);
      grd.addColorStop(1, mix(color, pal.grassDark, .55));
      curvePath(g, W, H, fy, 5);
      g.fillStyle = grd;
      g.fill();

      g.save();
      curvePath(g, W, H, fy, 5);
      g.clip();
      for (var k = 0; k < 3; k++) {
        var ex = rng() * W, ey = top + (H - top) * (.3 + rng() * .5), erx = W * (.08 + rng() * .12), ery = (H - top) * (.12 + rng() * .15);
        if (pal.shadow) { g.fillStyle = pal.shadow; oval(g, ex, ey, erx, ery); }
      }
      for (var i = 0; i < strokes; i++) {
        var gx = rng() * W, gt = fy(Math.min(1, gx / W));
        var gy = gt + 2 + Math.pow(rng(), 1.5) * (H - gt);
        var l = len * (.5 + rng()) * (.6 + (gy - gt) / (H - gt + 1) * .9);
        g.strokeStyle = rng() < .55 ? pal.grassDark : pal.grassLight;
        g.globalAlpha = .18 + rng() * .32;
        g.lineWidth = .8 + rng() * 1.4;
        g.beginPath();
        g.moveTo(gx, gy);
        g.lineTo(gx + (rng() - .5) * l * .6, gy - l);
        g.stroke();
      }
      g.globalAlpha = 1;
      g.restore();

      g.beginPath();
      for (var rx = 0; rx <= W + 6; rx += 6) {
        var ry = fy(Math.min(1, rx / W)) + 1.2;
        if (rx === 0) g.moveTo(rx, ry); else g.lineTo(rx, ry);
      }
      g.strokeStyle = pal.rim;
      g.lineWidth = 2;
      g.stroke();
    }

    function smallTree(g, x, gy, s, pal) {
      g.fillStyle = pal.farTree[0];
      oval(g, x, gy - s * .55, s * .32, s * .55);
      g.fillStyle = pal.farTree[1];
      oval(g, x - s * .08, gy - s * .7, s * .16, s * .3);
    }
    function treeLine(g, W, fy, S, pal, rng) {
      var x = -10;
      while (x < W + 10) {
        var count = rng() < .55 ? 2 + Math.floor(rng() * 4) : 0;
        for (var i = 0; i < count; i++) {
          var sz = S * (.07 + rng() * .08);
          smallTree(g, x, fy(Math.min(1, Math.max(0, x / W))) + 2, sz, pal);
          x += sz * (.5 + rng() * .4);
        }
        x += S * (.15 + rng() * .5);
      }
    }

    /* a big round tree, shaded in four tones like a background painting */
    function drawTree(g, x, gy, size, pal, rng) {
      g.fillStyle = "rgba(10,25,10,0.22)";
      oval(g, x + size * .1, gy + 2, size * .4, size * .06);
      g.fillStyle = pal.trunk;
      g.beginPath();
      g.moveTo(x - size * .05, gy + 2);
      g.quadraticCurveTo(x - size * .02, gy - size * .3, x - size * .035, gy - size * .58);
      g.lineTo(x + size * .035, gy - size * .58);
      g.quadraticCurveTo(x + size * .03, gy - size * .3, x + size * .065, gy + 2);
      g.closePath();
      g.fill();

      var cx = x, cy = gy - size * .68, rx = size * .42, ry = size * .34, puffs = [];
      for (var i = 0; i < 16; i++) {
        var a = rng() * TAU, d = Math.sqrt(rng());
        puffs.push({ x: cx + Math.cos(a) * rx * d * .8, y: cy + Math.sin(a) * ry * d * .8, r: size * (.12 + rng() * .08), hi: rng() });
      }
      puffs.push({ x: cx, y: cy, r: size * .22, hi: 0 });
      g.fillStyle = pal.tree[0];
      puffs.forEach(function (p) { circle(g, p.x, p.y + p.r * .1, p.r * 1.05); });
      g.fillStyle = pal.tree[1];
      puffs.forEach(function (p) { circle(g, p.x - p.r * .12, p.y - p.r * .12, p.r * .88); });
      g.fillStyle = pal.tree[2];
      puffs.forEach(function (p) { if (p.y < cy + ry * .2) circle(g, p.x - p.r * .25, p.y - p.r * .28, p.r * .6); });
      g.fillStyle = pal.tree[3];
      puffs.forEach(function (p) { if (p.y < cy - ry * .1 && p.hi < .7) circle(g, p.x - p.r * .35, p.y - p.r * .4, p.r * .28); });
    }

    /* a small red-roofed cottage; returns where its chimney is */
    function drawCottage(g, x, gy, s, pal) {
      var fw = s * .62, h = s * .42, sw = s * .5, pitch = fw * .5, x0 = x - fw / 2, ov = s * .04;
      g.fillStyle = "rgba(15,30,10,0.22)";
      oval(g, x + sw * .35, gy + 1, s * .75, s * .08);
      g.fillStyle = pal.wallShade;
      g.fillRect(x0 + fw, gy - h, sw, h);
      // chimney behind the roof slope
      var chx = x0 + fw / 2 + sw * .62, chy = gy - h - pitch * .95;
      g.fillStyle = pal.roofShade;
      g.fillRect(chx, chy, s * .07, s * .2);
      g.fillStyle = pal.roof;
      g.beginPath();
      g.moveTo(x0 + fw / 2, gy - h - pitch);
      g.lineTo(x0 + fw / 2 + sw, gy - h - pitch);
      g.lineTo(x0 + fw + sw + ov, gy - h + ov);
      g.lineTo(x0 + fw + ov, gy - h + ov);
      g.closePath();
      g.fill();
      g.fillStyle = pal.wall;
      g.beginPath();
      g.moveTo(x0, gy);
      g.lineTo(x0, gy - h);
      g.lineTo(x0 + fw / 2, gy - h - pitch);
      g.lineTo(x0 + fw, gy - h);
      g.lineTo(x0 + fw, gy);
      g.closePath();
      g.fill();
      g.strokeStyle = pal.roofShade;
      g.lineWidth = Math.max(1.5, s * .05);
      g.lineJoin = "round";
      g.beginPath();
      g.moveTo(x0 - ov, gy - h + ov);
      g.lineTo(x0 + fw / 2, gy - h - pitch - 1);
      g.lineTo(x0 + fw + ov, gy - h + ov);
      g.stroke();
      g.fillStyle = pal.roofShade;
      g.fillRect(x - s * .06, gy - s * .22, s * .12, s * .22);

      var win = pal.lit ? pal.windowLit : pal.window;
      var wins = [[x0 + fw + sw * .18, gy - h * .66], [x0 + fw + sw * .6, gy - h * .66]];
      if (pal.lit) {
        g.save();
        g.globalCompositeOperation = "lighter";
        wins.concat([[x - s * .045, gy - h - pitch * .45]]).forEach(function (w) {
          var gl = g.createRadialGradient(w[0] + s * .05, w[1] + s * .06, 0, w[0] + s * .05, w[1] + s * .06, s * .3);
          gl.addColorStop(0, "rgba(255,200,90,0.45)");
          gl.addColorStop(1, "rgba(255,200,90,0)");
          g.fillStyle = gl;
          circle(g, w[0] + s * .05, w[1] + s * .06, s * .3);
        });
        g.restore();
      }
      g.fillStyle = win;
      wins.forEach(function (w) { g.fillRect(w[0], w[1], s * .1, s * .13); });
      circle(g, x, gy - h - pitch * .38, s * .045);
      return { x: chx + s * .035, y: chy };
    }

    function drawPath(g, W, H, S, dx, dy, pal, from) {
      var x0 = W * (from || .56), wB = S * .26, cx = (x0 + dx) / 2 + W * .06, cy = H - S * .22;
      var pg = g.createLinearGradient(0, dy, 0, H);
      pg.addColorStop(0, pal.path[1]);
      pg.addColorStop(1, pal.path[0]);
      g.fillStyle = pg;
      g.beginPath();
      g.moveTo(x0 - wB, H + 2);
      g.quadraticCurveTo(cx - wB * .35, cy, dx - 2, dy);
      g.lineTo(dx + 2, dy);
      g.quadraticCurveTo(cx + wB * .35, cy, x0 + wB, H + 2);
      g.closePath();
      g.fill();
    }

    function flowers(g, W, H, fy, pal, rng) {
      var n = Math.round(W * .45);
      for (var i = 0; i < n; i++) {
        var x = rng() * W, top = fy(Math.min(1, x / W));
        var y = top + 4 + Math.pow(rng(), .8) * Math.max(0, H - top - 4);
        var depth = (y - top) / (H - top + 1);
        var s = .8 + depth * 2.6 * (.6 + rng() * .6);
        g.fillStyle = pal.flowers[Math.floor(rng() * pal.flowers.length)];
        if (s > 2.6) {
          for (var p = 0; p < 5; p++) {
            var a = p / 5 * TAU;
            circle(g, x + Math.cos(a) * s * .55, y + Math.sin(a) * s * .55, s * .45);
          }
          g.fillStyle = pal.flowers[1];
          circle(g, x, y, s * .3);
        } else {
          circle(g, x, y, s * .6);
        }
      }
    }

    function mist(g, W, fy, S, rng, color) {
      for (var i = 0; i < 6; i++) {
        var x = rng() * W, y = fy(Math.min(1, x / W)) + S * (.02 + rng() * .06);
        var rx = W * (.15 + rng() * .2), ry = S * (.05 + rng() * .05);
        if (!color) continue;
        var mg = g.createRadialGradient(x, y, 0, x, y, rx);
        mg.addColorStop(0, color);
        mg.addColorStop(1, "rgba(255,255,255,0)");
        g.save();
        g.translate(x, y);
        g.scale(1, ry / rx);
        g.translate(-x, -y);
        g.fillStyle = mg;
        circle(g, x, y, rx);
        g.restore();
      }
    }

    function haze(g, W, H, y0, y1, color) {
      var hz = g.createLinearGradient(0, y0, 0, y1);
      hz.addColorStop(0, "rgba(0,0,0,0)");
      hz.addColorStop(1, color);
      g.fillStyle = hz;
      g.fillRect(0, y0, W, H - y0);
    }

    /* land along the bottom edge, on the left and/or right, sloping into the sea */
    function shoreFn(rng, H, S, side) {
      var p = rng() * TAU, f = .8 + rng() * 1.2;
      function sm(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
      return function (t) {
        var k = 0;
        if (side.left != null) k = Math.max(k, sm((side.left + .16 - t) / .16));
        if (side.right != null) k = Math.max(k, sm((t - (side.right - .16)) / .16));
        return H + 6 - k * (S * (.3 + .1 * (.5 + .5 * Math.sin(TAU * f * t + p))) + 6);
      };
    }

    /* islands on the horizon, a brushed sea with the sun or moon reflected in it, and a grassy shore */
    function paintSea(g, W, H, S, hY, pal, L, rng) {
      var isl = ridge(rng, hY + 2, S * .5, .6);
      (L.islands || []).forEach(function (sp) {
        var a = sp.a * W, b = sp.b * W;
        g.beginPath();
        g.moveTo(a, hY + 2);
        for (var x = a; x <= b; x += 3) {
          var env = Math.pow(Math.sin(Math.PI * (x - a) / (b - a)), .7);
          g.lineTo(x, hY + 2 - (hY + 2 - isl(Math.min(1, Math.max(0, x / W)))) * env);
        }
        g.lineTo(b, hY + 2);
        g.closePath();
        g.fillStyle = pal.mountains[0];
        g.fill();
        for (var tx = a + (b - a) * .2; tx < b - (b - a) * .2; tx += S * (.05 + rng() * .08)) {
          var env2 = Math.pow(Math.sin(Math.PI * (tx - a) / (b - a)), .7);
          var top = hY + 2 - (hY + 2 - isl(Math.min(1, Math.max(0, tx / W)))) * env2;
          if (rng() < .6) smallTree(g, tx, top + 3, S * (.05 + rng() * .05), pal);
        }
      });
      haze(g, W, H, hY - S * .5, hY + 3, pal.haze);

      var sg = g.createLinearGradient(0, hY, 0, H);
      sg.addColorStop(0, pal.sea[0]);
      sg.addColorStop(1, pal.sea[1]);
      g.fillStyle = sg;
      g.fillRect(0, hY + 1, W, H - hY);
      g.fillStyle = pal.seaLight;
      g.fillRect(0, hY + 1, W, 1.2);
      for (var i = 0, n = Math.round(W * .9); i < n; i++) { // brushed wave strokes
        var d = Math.pow(rng(), 1.8);
        var wy = hY + 3 + d * (H - hY - 3);
        var len = 6 + d * 40 * (.5 + rng());
        var wx = rng() * W;
        g.strokeStyle = rng() < .5 ? pal.seaLight : pal.seaDark;
        g.globalAlpha = .25 + rng() * .45;
        g.lineWidth = .6 + d * 2.2;
        g.beginPath();
        g.moveTo(wx, wy);
        g.lineTo(wx + len, wy + (rng() - .5) * 1.5);
        g.stroke();
      }
      g.globalAlpha = 1;
      var body = pal.sun || pal.moon, bx = W * body.x;
      for (var j = 0; j < 80; j++) { // the sun or moon's path on the water
        var dd = rng(), ry = hY + 3 + dd * (H - hY) * .9, spread = 6 + dd * 70;
        g.fillStyle = "rgba(" + pal.glint + "," + ((.25 + rng() * .5) * (1 - dd * .6)).toFixed(3) + ")";
        g.fillRect(bx + (rng() - .5) * spread * 2, ry, 4 + dd * 22 * rng(), .8 + dd * 1.6);
      }
      if (L.mist) mist(g, W, function () { return hY - S * .02; }, S, rng, pal.mist);

      var shore = shoreFn(rng, H, S, L.shore || { right: .7 });
      paintHill(g, W, H, shore, pal.hills[1], pal, rng, Math.round(W * .9), S * .11);
      if (L.tree) drawTree(g, W * L.tree.x, shore(L.tree.x) + 3, S * .78 * L.tree.s, pal, rng);
      var chimney = L.cottage ? drawCottage(g, W * L.cottage, shore(L.cottage) + 2, S * .34, pal) : null;
      if (L.path && L.cottage) drawPath(g, W, H, S, W * L.cottage, shore(L.cottage) + 2, pal, L.pathFrom);
      flowers(g, W, H, shore, pal, rng);
      return { chimney: chimney, ground: shore };
    }

    /* everything that does not move: mountains, hills, trees, cottage, path, flowers */
    function paintLand(g, W, H, S, hY, pal, L, rng) {
      if (L.islands) return paintSea(g, W, H, S, hY, pal, L, rng);
      var far = ridge(rng, hY + S * .16, S * .9, .75);
      curvePath(g, W, H, far, 4);
      g.fillStyle = pal.mountains[0];
      g.fill();
      haze(g, W, H, hY - S * .75, hY + S * .25, pal.haze);
      var mid = ridge(rng, hY + S * .34, S * .48, .45);
      curvePath(g, W, H, mid, 4);
      g.fillStyle = pal.mountains[1];
      g.fill();
      haze(g, W, H, hY - S * .1, hY + S * .4, pal.haze);

      var h1 = hill(rng, H - S * .56, S * .3);
      var h2 = hill(rng, H - S * .3, S * .26);
      var h3 = hill(rng, H - S * .07, S * .2);
      paintHill(g, W, H, h1, pal.hills[0], pal, rng, Math.round(W * .25), S * .05);
      if (L.treeLine) treeLine(g, W, h1, S, pal, rng);
      if (L.mist) mist(g, W, h1, S, rng, pal.mist);
      paintHill(g, W, H, h2, pal.hills[1], pal, rng, Math.round(W * .7), S * .08);
      if (L.tree) drawTree(g, W * L.tree.x, h2(L.tree.x) + 3, S * .78 * L.tree.s, pal, rng);
      var chimney = L.cottage ? drawCottage(g, W * L.cottage, h2(L.cottage) + 2, S * .34, pal) : null;
      paintHill(g, W, H, h3, pal.hills[2], pal, rng, Math.round(W * 1.2), S * .13);
      if (L.path && L.cottage) drawPath(g, W, H, S, W * L.cottage, h2(L.cottage) + 2, pal);
      flowers(g, W, H, h3, pal, rng);
      return { chimney: chimney, h2: h2 };
    }

    /* --- the live painting --- */
    var ctx = canvas.getContext("2d");
    var st = { key: null, ready: false, fade: null };
    var raf = null, last = 0, gust = 0, gustTarget = 0, nextGust = 0, timer = null;

    function build() {
      var W = canvas.offsetWidth, H = canvas.offsetHeight;
      if (!W || !H || !st.key) { st.ready = false; return; }
      var dpr = Math.min(window.devicePixelRatio || 1, W > 1400 ? 1 : 1.5);
      var key = st.key, seed = hash(key);
      var pal = isNight() ? PAL.night : (PAL[key] || PAL.tide);
      var L = LAYOUT[key] || LAYOUT.tide;
      var S = Math.max(150, Math.min(300, H * .3));
      var hY = H - S * 1.05;

      st.w = W; st.h = H; st.S = S; st.pal = pal;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      st.skyLayer = layer(W, H, dpr, function (g) { paintSky(g, W, H, hY, pal, seeded(seed + 7)); });

      var crng = seeded(seed + 13);
      st.clouds = L.clouds.map(function (c) {
        var cw = Math.max(90, W * c.w);
        var ch = Math.min(cw * c.a, Math.max(40, hY * .9));
        var baseY = hY - S * .05 - c.lift * hY * .8;
        return {
          img: makeCloud(crng, cw, ch, pal.cloud, dpr),
          x: W * c.x, y: baseY - ch * .9, w: cw, h: ch,
          speed: (3 + crng() * 5) * (1 - c.lift * .3)
        };
      });

      var info = null;
      st.landLayer = layer(W, H, dpr, function (g) { info = paintLand(g, W, H, S, hY, pal, L, seeded(seed)); });
      st.chimney = info.chimney;

      var brng = seeded(seed + 31), bn = Math.round(W / 4);
      st.blades = [];
      for (var i = 0; i < bn; i++) {
        var blade = {
          x: (i + brng()) * (W / bn), h: S * (.08 + brng() * .2), w: 1 + brng() * 1.8,
          c: mix(pal.grassDark, pal.grassLight, brng() * .55), sp: .7 + brng() * .6
        };
        // grass grows only where there is land, not on the water
        if (!info.ground || info.ground(Math.min(1, blade.x / W)) < H - S * .06) st.blades.push(blade);
      }
      st.glints = [];
      if (L.islands) {
        var grng = seeded(seed + 59), body = pal.sun || pal.moon;
        for (var q = 0; q < 46; q++) {
          var near = grng() < .5; // half of them gather in the sun or moon's path
          var gd = grng();
          st.glints.push({
            x: near ? W * body.x + (grng() - .5) * (40 + gd * 180) : grng() * W,
            y: hY + 4 + gd * (H - hY - 6), len: 3 + gd * 16, ph: grng() * TAU, sp: .6 + grng() * 1.2
          });
        }
      }
      st.glintRGB = pal.glint || "255,255,255";
      var mrng = seeded(seed + 47);
      st.motes = [];
      st.flies = [];
      for (var m = 0; m < 16; m++) {
        var mote = { x: mrng() * W, y: hY * .4 + mrng() * (H - S * .2 - hY * .4), r: .8 + mrng() * 1.6, sp: .5 + mrng(), ph: mrng() * TAU };
        if (pal.motes) st.motes.push(mote);
      }
      for (var f = 0; f < 22; f++) {
        var fly = { x: mrng() * W, y: H - S * (.1 + mrng() * .75), sp: .6 + mrng() * .8, ph: mrng() * TAU };
        if (pal.fireflies) st.flies.push(fly);
      }
      st.ready = true;
    }

    function draw(t, dt) {
      if (!st.ready) return;
      var g = ctx, W = st.w, H = st.h, S = st.S, i;
      // parallax: as you scroll, the land sinks a little and the clouds rise
      var sy = reduceMotion.matches ? 0 : (window.scrollY || 0);
      var landOff = Math.min(sy * .12, S * .6);
      var cloudOff = -Math.min(sy * .03, 36);

      g.drawImage(st.skyLayer, 0, 0, W, H);
      for (i = 0; i < st.clouds.length; i++) {
        var c = st.clouds[i];
        c.x += c.speed * dt / 1000;
        if (c.x > W + 20) c.x = -c.w - 20;
        g.drawImage(c.img, c.x, c.y + cloudOff, c.w, c.h);
      }
      g.drawImage(st.landLayer, 0, landOff, W, H);

      for (i = 0; i < st.glints.length; i++) { // sparkles on the water
        var gl = st.glints[i];
        var ga = Math.pow(Math.max(0, Math.sin(t * .0028 * gl.sp + gl.ph)), 3) * .85;
        if (ga < .02) continue;
        g.fillStyle = "rgba(" + st.glintRGB + "," + ga.toFixed(3) + ")";
        g.fillRect(gl.x + Math.sin(t * .0004 + gl.ph) * 3, gl.y + landOff, gl.len, 1.4);
      }
      if (st.chimney) { // chimney smoke
        for (i = 0; i < 4; i++) {
          var ph = ((t / 4200) + i / 4) % 1;
          var a = (ph < .15 ? ph / .15 : 1 - (ph - .15) / .85) * .7;
          g.fillStyle = "rgba(" + st.pal.smoke + "," + a.toFixed(3) + ")";
          circle(g, st.chimney.x - ph * S * .07 + Math.sin(ph * 6) * 2, st.chimney.y + landOff - ph * S * .28, S * .012 + ph * S * .045);
        }
      }
      for (i = 0; i < st.motes.length; i++) { // light dust in the sun
        var m = st.motes[i];
        m.y -= m.sp * dt * .012;
        m.x += Math.sin(t * .0006 + m.ph) * .15 + gust * .05;
        if (m.y < H * .12) { m.y = H - S * .25; m.x = Math.random() * W; }
        g.fillStyle = "rgba(255,252,230," + (.25 + .35 * (.5 + .5 * Math.sin(t * .002 + m.ph))).toFixed(3) + ")";
        circle(g, m.x, m.y, m.r);
      }
      for (i = 0; i < st.flies.length; i++) { // fireflies over the grass
        var f = st.flies[i];
        f.x += Math.sin(t * .0005 + f.ph) * .3 + gust * .1;
        f.y += Math.cos(t * .0004 + f.ph * 1.3) * .2;
        if (f.x < -10) f.x = W + 10; else if (f.x > W + 10) f.x = -10;
        f.y = Math.min(H - 6, Math.max(H - S * .95, f.y));
        var fa = .2 + .8 * Math.max(0, Math.sin(t * .002 * f.sp + f.ph));
        var fy = f.y + landOff;
        var gr = g.createRadialGradient(f.x, fy, 0, f.x, fy, 9);
        gr.addColorStop(0, "rgba(246,226,122," + fa.toFixed(3) + ")");
        gr.addColorStop(.3, "rgba(246,226,122," + (fa * .45).toFixed(3) + ")");
        gr.addColorStop(1, "rgba(246,226,122,0)");
        g.fillStyle = gr;
        circle(g, f.x, fy, 9);
      }
      var base = H + 1 + landOff;
      for (i = 0; i < st.blades.length; i++) { // grass in the wind
        var b = st.blades[i];
        var sway = Math.sin(t * .0013 * b.sp + b.x * .012) * b.h * .16 + gust * b.h * .1;
        g.fillStyle = b.c;
        g.beginPath();
        g.moveTo(b.x - b.w, base);
        g.quadraticCurveTo(b.x + sway * .35, base - b.h * .55, b.x + sway, base - b.h);
        g.quadraticCurveTo(b.x + sway * .35 + b.w * .3, base - b.h * .55, b.x + b.w, base);
        g.fill();
      }
      if (st.fade) { // cross-fade from the previous painting
        var k = (performance.now() - st.fade.start) / 1100;
        if (k >= 1) st.fade = null;
        else {
          g.globalAlpha = 1 - k * k * (3 - 2 * k);
          g.drawImage(st.fade.img, 0, 0, W, H);
          g.globalAlpha = 1;
        }
      }
    }

    function snapshot() {
      if (!st.ready || reduceMotion.matches) return;
      var snap = document.createElement("canvas");
      snap.width = canvas.width;
      snap.height = canvas.height;
      snap.getContext("2d").drawImage(canvas, 0, 0);
      st.fade = { img: snap, start: performance.now() };
    }
    function repaint() { if (!raf) draw(performance.now(), 0); }

    function loop(t) {
      var dt = last ? Math.min(64, t - last) : 16;
      last = t;
      if (!nextGust) nextGust = t + 4000;
      if (t > nextGust) {
        gustTarget = gustTarget ? 0 : 1.5 + Math.random() * 2;
        nextGust = t + (gustTarget ? 1800 + Math.random() * 1500 : 6000 + Math.random() * 7000);
      }
      gust += (gustTarget - gust) * .02;
      if (!root.classList.contains("has-still")) draw(t, dt);
      raf = window.requestAnimationFrame(loop);
    }
    function start() {
      if (raf || reduceMotion.matches || document.hidden) return;
      last = 0;
      raf = window.requestAnimationFrame(loop);
    }
    function stop() {
      if (raf) window.cancelAnimationFrame(raf);
      raf = null;
    }

    if ("ResizeObserver" in window) {
      new ResizeObserver(function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          if (st.ready && canvas.offsetWidth === st.w && canvas.offsetHeight === st.h) return;
          build();
          repaint();
        }, st.ready ? 160 : 0);
      }).observe(canvas);
    } else {
      window.addEventListener("resize", function () {
        clearTimeout(timer);
        timer = setTimeout(function () { build(); repaint(); }, 160);
      });
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    listen(reduceMotion, function () {
      if (reduceMotion.matches) { stop(); draw(0, 0); }
      else start();
    });
    start();

    return {
      // switch to another page's scene, cross-fading from the current one
      setScene: function (key, withFade) {
        key = key || "tide";
        if (key === st.key) return;
        if (withFade) snapshot();
        st.key = key;
        build();
        repaint();
      },
      // repaint the same scene (after day/night changes)
      refresh: function (withFade) {
        if (!st.key) return;
        if (withFade) snapshot();
        build();
        repaint();
      }
    };
  })();

  /* =============================================================
     1b. FILM-STILL BACKGROUNDS
     Each page can show its own still behind everything:
     <div class="sky" data-still="images/bg-home.jpg"> ... </div>
     If the file is there, it fades in (with its citation tag) and the
     page is tinted with the still's own colors. If it is missing, the
     painted world shows instead.
     ============================================================= */
  var backdrop = (function () {
    var box = document.querySelector(".backdrop");
    if (!box) return { show: function () {} };
    var layers = box.querySelectorAll(".backdrop-slide");
    var front = 0, current = null;

    function tint(img) {
      // average the top and bottom halves of the still, darkened toward night
      try {
        var c = document.createElement("canvas");
        c.width = 24; c.height = 24;
        var g = c.getContext("2d");
        g.drawImage(img, 0, 0, 24, 24);
        var d = g.getImageData(0, 0, 24, 24).data, top = [0, 0, 0], bot = [0, 0, 0];
        for (var i = 0; i < d.length; i += 4) {
          var acc = (i / 4) < 288 ? top : bot;
          acc[0] += d[i]; acc[1] += d[i + 1]; acc[2] += d[i + 2];
        }
        var rgba = function (a, k, alpha) {
          return "rgba(" + Math.round(a[0] / 288 * k) + "," + Math.round(a[1] / 288 * k) + "," + Math.round(a[2] / 288 * k) + "," + alpha + ")";
        };
        root.style.setProperty("--still-top", rgba(top, .45, .55));
        root.style.setProperty("--still-bottom", rgba(bot, .35, .82));
      } catch (e) {
        // browsers block reading pixels from local files (file://); the default tint is used
        root.style.removeProperty("--still-top");
        root.style.removeProperty("--still-bottom");
      }
    }
    function off(stage) {
      each(layers, function (l) { l.classList.remove("is-shown"); });
      root.classList.remove("has-still");
      if (stage) stage.classList.remove("still-on");
    }
    function show(src, stage) {
      current = src;
      if (!src) { off(stage); return; }
      var probe = new Image();
      probe.onload = function () {
        if (current !== src) return;
        var next = layers[1 - front], prev = layers[front];
        each(next.querySelectorAll("img"), function (im) { im.src = src; });
        next.classList.add("is-shown");
        prev.classList.remove("is-shown");
        front = 1 - front;
        root.classList.add("has-still");
        if (stage) stage.classList.add("still-on");
        tint(probe);
      };
      probe.onerror = function () { if (current === src) off(stage); };
      probe.src = src;
    }
    return { show: show };
  })();

  /* ---------- 2. Leaves + fireflies over the painting ---------- */
  var particles = (function () {
    var canvas = document.getElementById("particles");
    if (!canvas || !canvas.getContext) return { refresh: function () {} };
    var ctx = canvas.getContext("2d");
    var w = 0, h = 0, items = [], mode = "leaf", colors = [], glow = "246, 226, 122", raf = null;
    var pointer = { x: -9999, y: -9999 };
    var gust = 0, gustTarget = 0, nextGust = 0;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function make(anywhere) {
      if (mode === "firefly") {
        return {
          x: Math.random() * w, y: h * 0.25 + Math.random() * h * 0.75,
          r: 1.4 + Math.random() * 1.6, phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 0.8, dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.25
        };
      }
      return {
        x: Math.random() * w, y: anywhere ? Math.random() * h : -20,
        size: 6 + Math.random() * 7, rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.03, fall: 0.35 + Math.random() * 0.55,
        sway: Math.random() * Math.PI * 2, swaySpeed: 0.008 + Math.random() * 0.014,
        color: colors[Math.floor(Math.random() * colors.length)] || "#79b553"
      };
    }
    function populate() {
      var count = mode === "firefly" ? Math.round(Math.min(30, w / 40)) : Math.round(Math.min(16, w / 80));
      items = [];
      for (var i = 0; i < count; i++) items.push(make(true));
    }
    function drawLeaf(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.quadraticCurveTo(p.size * 0.75, 0, 0, p.size);
      ctx.quadraticCurveTo(-p.size * 0.75, 0, 0, -p.size);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, .45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.8);
      ctx.lineTo(0, p.size * 0.85);
      ctx.stroke();
      ctx.restore();
    }
    function drawFirefly(p, t) {
      var a = 0.25 + 0.75 * Math.max(0, Math.sin(t * 0.0018 * p.speed + p.phase));
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 7);
      g.addColorStop(0, "rgba(" + glow + ", " + a + ")");
      g.addColorStop(0.25, "rgba(" + glow + ", " + a * 0.5 + ")");
      g.addColorStop(1, "rgba(" + glow + ", 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 7, 0, Math.PI * 2);
      ctx.fill();
    }
    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      if (!nextGust) nextGust = t + 5000;
      if (t > nextGust) {
        gustTarget = gustTarget ? 0 : (1.5 + Math.random() * 2) * (Math.random() < 0.8 ? 1 : -1);
        nextGust = t + (gustTarget ? 1800 + Math.random() * 1500 : 6000 + Math.random() * 7000);
      }
      gust += (gustTarget - gust) * 0.02;
      for (var i = 0; i < items.length; i++) {
        var p = items[i];
        var dx = p.x - pointer.x, dy = p.y - pointer.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (mode === "firefly") {
          if (d < 220 && d > 36) { // drift toward the cursor, keep a little distance
            p.x -= (dx / d) * 0.35 * (1 - d / 220);
            p.y -= (dy / d) * 0.35 * (1 - d / 220);
          }
          p.x += p.dx + Math.sin(t * 0.0007 + p.phase) * 0.2 + gust * 0.15;
          p.y += p.dy + Math.cos(t * 0.0006 + p.phase) * 0.15;
          if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
          if (p.y < h * 0.15) p.dy = Math.abs(p.dy); else if (p.y > h + 10) p.dy = -Math.abs(p.dy);
          drawFirefly(p, t);
        } else {
          if (d < 110) { // leaves get pushed away from the cursor
            var f = 1 - d / 110;
            p.x += (dx / d) * f * 3;
            p.y += (dy / d) * f * 1.5;
            p.spin = Math.max(-0.08, Math.min(0.08, p.spin + (Math.random() - 0.5) * 0.02));
          }
          p.sway += p.swaySpeed;
          p.x += Math.sin(p.sway) * 0.6 + gust;
          p.y += p.fall;
          p.rot += p.spin + gust * 0.004;
          if (p.x > w + 30) p.x = -30; else if (p.x < -30) p.x = w + 30;
          if (p.y > h + 24) items[i] = make(false);
          drawLeaf(p);
        }
      }
      raf = window.requestAnimationFrame(frame);
    }
    function stop() {
      if (raf) window.cancelAnimationFrame(raf);
      raf = null;
    }
    function start() {
      stop();
      ctx.clearRect(0, 0, w, h);
      if (reduceMotion.matches || document.hidden) return;
      raf = window.requestAnimationFrame(frame);
    }
    function refresh() {
      mode = isNight() ? "firefly" : "leaf";
      colors = [cssVar("--leaf-1"), cssVar("--leaf-2"), cssVar("--leaf-3")].filter(Boolean);
      glow = cssVar("--firefly-rgb") || glow;
      populate();
      start();
    }

    resize();
    refresh();
    window.addEventListener("resize", function () { resize(); populate(); });
    window.addEventListener("pointermove", function (e) { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
    window.addEventListener("pointerdown", function (e) { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
    document.addEventListener("pointerleave", function () { pointer.x = pointer.y = -9999; });
    window.addEventListener("blur", function () { pointer.x = pointer.y = -9999; });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    listen(reduceMotion, start);
    return { refresh: refresh };
  })();

  /* ---------- 3. Title letters ---------- */
  var title = document.getElementById("home-title");
  if (title) {
    var text = title.textContent.trim();
    var idx = 0;
    title.setAttribute("aria-label", text);
    title.textContent = "";
    text.split(" ").forEach(function (word, wi) {
      if (wi) title.appendChild(document.createTextNode(" "));
      var wordEl = document.createElement("span");
      wordEl.className = "word";
      wordEl.setAttribute("aria-hidden", "true");
      word.split("").forEach(function (ch) {
        var s = document.createElement("span");
        var sign = idx % 2 ? 1 : -1;
        s.className = "ch";
        s.textContent = ch;
        s.style.setProperty("--i", idx);
        s.style.setProperty("--r", sign * (6 + (idx * 7) % 9) + "deg");
        s.style.setProperty("--r-hover", sign * -6 + "deg");
        wordEl.appendChild(s);
        idx++;
      });
      title.appendChild(wordEl);
    });
  }

  /* ---------- 4. Mobile menu ---------- */
  var nav = document.getElementById("site-nav");
  var menuBtn = document.getElementById("menu-toggle");

  function closeMenu() {
    if (!nav || !menuBtn) return;
    nav.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
  }
  if (nav && menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- 5. Live counts + count-up ---------- */
  var memberCount = document.querySelectorAll(".member").length;
  // a reflection counts once its writing replaces the draft prompt (no .draft paragraph left)
  function finished(scope) {
    return Array.prototype.filter.call(scope.querySelectorAll(".entry"), function (e) { return !e.querySelector(".draft"); }).length;
  }
  each(document.querySelectorAll("[data-count-for]"), function (el) {
    var panel = document.getElementById(el.getAttribute("data-count-for"));
    var n = panel ? finished(panel) : 0;
    el.textContent = n + " of " + memberCount + " members";
  });
  var tools = {};
  each(document.querySelectorAll("[data-tools]"), function (el) {
    el.getAttribute("data-tools").split(",").forEach(function (t) {
      t = t.trim().toLowerCase();
      if (t) tools[t] = true;
    });
  });
  var counts = {
    members: memberCount,
    entries: finished(document),
    works: document.querySelectorAll(".work").length,
    tools: Object.keys(tools).length
  };
  each(document.querySelectorAll("[data-count]"), function (el) {
    var key = el.getAttribute("data-count");
    if (key in counts) {
      el.setAttribute("data-target", counts[key]);
      el.textContent = counts[key];
    }
  });

  function countUp() {
    if (reduceMotion.matches) return;
    each(document.querySelectorAll(".field-stats [data-count]"), function (el) {
      var target = parseInt(el.getAttribute("data-target") || el.textContent, 10);
      if (isNaN(target)) return;
      var t0 = null;
      el.textContent = "0";
      function step(ts) {
        if (t0 === null) t0 = ts;
        var k = Math.min(1, Math.max(0, (ts - t0 - 850) / 900)); // starts as the note lands
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3))));
        if (k < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    });
  }

  /* ---------- 12a. Reading progress line ---------- */
  var header = document.querySelector(".site-header");
  function updateProgress() {
    // the veil softens the painting behind dense sections as you scroll
    root.style.setProperty("--veil", Math.min(.6, window.scrollY / 700).toFixed(3));
    if (!header) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.style.setProperty("--progress", max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : "0");
  }

  /* ---------- 6. Page router with page turn ---------- */
  var views = Array.prototype.slice.call(document.querySelectorAll(".view"));
  var viewNames = views.map(function (v) { return v.getAttribute("data-view"); });
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  var metaDesc = document.querySelector('meta[name="description"]');
  var current = null;

  function hashName() {
    try { return decodeURIComponent(window.location.hash.replace(/^#/, "")); }
    catch (e) { return ""; }
  }
  function showView(name, initial) {
    if (viewNames.indexOf(name) === -1) name = "home";
    var view = views[viewNames.indexOf(name)];
    // turning to a later page flips forward; an earlier page flips back
    var direction = current && viewNames.indexOf(name) < viewNames.indexOf(current) ? "turn-back" : "turn-fwd";

    views.forEach(function (v) {
      var on = v === view;
      v.hidden = !on;
      v.classList.remove("turn-fwd", "turn-back");
      if (on && !initial && !reduceMotion.matches) replay(v, direction);
    });
    // NEW: member profile pages keep their parent ("Reflections") highlighted in the menu
    var navName = view.getAttribute("data-nav-parent") || name;
    navLinks.forEach(function (a) {
      if (a.getAttribute("data-nav") === navName) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    document.title = name === "home" ? SITE + " · e-Portfolio" : view.getAttribute("data-title") + " · " + SITE;
    if (metaDesc && view.getAttribute("data-desc")) metaDesc.setAttribute("content", view.getAttribute("data-desc"));

    current = name;
    closeMenu();
    if (!initial) {
      window.scrollTo(0, 0);
      var heading = view.querySelector(".view-heading");
      if (heading) heading.focus({ preventScroll: true });
    }
    var stage = view.querySelector(".sky[data-scene]");
    world.setScene(stage ? stage.getAttribute("data-scene") : "tide", !initial);
    backdrop.show(stage ? stage.getAttribute("data-still") : null, stage);
    if (name === "home") countUp();
    updateProgress();
  }

  window.addEventListener("hashchange", function () {
    var n = hashName();
    if (viewNames.indexOf(n) !== -1) showView(n, false);
  });
  // A link to the page you're already on just scrolls back to the top
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    // NEW: "9 works across 3 categories" scrolls to the workbook of the open profile
    if (a.hasAttribute("data-jump")) {
      var target = a.closest(".view").querySelector(a.getAttribute("data-jump"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
        return;
      }
    }
    if (a.getAttribute("href").slice(1) === current) {
      e.preventDefault();
      closeMenu();
      scrollTop();
    }
  });
  showView(viewNames.indexOf(hashName()) !== -1 ? hashName() : "home", true);

  /* ---------- 7. Day / night toggle ---------- */
  var themeBtn = document.getElementById("theme-toggle");

  function effectiveTheme() {
    var t = root.getAttribute("data-theme");
    if (t === "dark" || t === "light") return t;
    return darkScheme.matches ? "dark" : "light";
  }
  function onThemeChange() {
    if (themeBtn) {
      themeBtn.setAttribute("aria-label", effectiveTheme() === "dark" ? "Switch to day mode" : "Switch to night mode");
    }
    particles.refresh();
    world.refresh(true); // repaint the scene as day or night, with a cross-fade
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = effectiveTheme() === "dark" ? "light" : "dark";
      if (!reduceMotion.matches) replay(themeBtn, "spin");
      root.setAttribute("data-theme", next);
      try { window.localStorage.setItem("pm-theme", next); } catch (e) { /* storage blocked: still works for this visit */ }
    });
    themeBtn.setAttribute("aria-label", effectiveTheme() === "dark" ? "Switch to day mode" : "Switch to night mode");
  }
  listen(darkScheme, onThemeChange);
  if (window.MutationObserver) {
    new MutationObserver(onThemeChange).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  }

  /* ---------- 8. Reflection tabs ---------- */
  each(document.querySelectorAll("[data-tabs]"), function (group) {
    var tabs = Array.prototype.slice.call(group.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      updateProgress();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var j = null;
        if (e.key === "ArrowRight") j = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") j = 0;
        else if (e.key === "End") j = tabs.length - 1;
        if (j !== null) { e.preventDefault(); select(tabs[j], true); }
      });
    });
  });

  /* ---------- 9. Scroll reveals ---------- */
  // [what to animate, how it arrives]
  var revealSets = [
    [".section-head", "rise"],
    [".hand-h", "rise"],
    [".film-card", "rise"],
    [".member", "drop"],
    [".inspo", "drop"],
    [".stub-grid > li", "rise"],
    [".notes > li", "stick"],
    [".letter", "drop"],
    [".entry", "deal"],
    [".work", "deal"],
    [".mp-work", "deal"], // NEW: member profile tiles
    [".declaration", "drop"],
    [".side-stack > *", "drop"],
    [".page-turn .turn", "rise"],
    [".footer-grid > *", "rise"]
  ];
  var observer = null;
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          observer.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });

    revealSets.forEach(function (set) {
      each(document.querySelectorAll(set[0]), function (el) {
        var order = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.classList.add("reveal");
        el.setAttribute("data-anim", set[1]);
        el.style.setProperty("--i", Math.min(order, 5));
        // already on screen at load: animate now instead of waiting a frame
        if (el.getClientRects().length && el.getBoundingClientRect().top < window.innerHeight * 0.94) {
          el.classList.add("in");
        } else {
          observer.observe(el);
        }
      });
    });
  }

  /* ---------- 9b. Mood board: painted placeholder until the image file is added ---------- */
  each(document.querySelectorAll(".inspo-photo > img, .photo-slot > img"), function (img) {
    var frame = img.parentNode;
    function missing() { frame.classList.add("is-missing"); }
    function found() { frame.classList.remove("is-missing"); }
    img.addEventListener("error", missing);
    img.addEventListener("load", found);
    if (img.complete) { if (img.naturalWidth) found(); else missing(); }
  });

  /* ---------- 10. Best Works filter ---------- */
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll(".filter"));
  var works = Array.prototype.slice.call(document.querySelectorAll(".work"));
  var filterStatus = document.getElementById("filter-status");

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.getAttribute("data-filter");
      var shown = 0;
      filterBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      works.forEach(function (card) {
        var on = cat === "all" || card.getAttribute("data-cat") === cat;
        card.hidden = !on;
        if (on) {
          card.style.setProperty("--i", Math.min(shown, 5));
          if (observer) replay(card, "in"); // deal the matching cards back onto the table
          shown++;
        }
      });
      if (filterStatus) {
        filterStatus.textContent = cat === "all"
          ? "Showing all " + shown + " works"
          : "Showing " + shown + " of " + works.length + " works · " + btn.textContent;
      }
      updateProgress();
    });
  });

  /* ---------- 10b. Reflection pop-up ---------- */
  var dialog = document.getElementById("work-dialog");
  var dialogTitle = document.getElementById("dialog-title");
  var dialogBody = document.getElementById("dialog-body");
  var dialogCover = document.getElementById("dialog-cover");
  var dialogEyebrow = dialog ? dialog.querySelector(".dialog-content .eyebrow") : null; // NEW
  var lastOpener = null;

  function isOpen() { return dialog && (dialog.open || dialog.hasAttribute("open")); }
  function closeDialog() {
    if (!isOpen()) return;
    if (typeof dialog.close !== "function") {
      dialog.removeAttribute("open");
      if (lastOpener) lastOpener.focus();
      return;
    }
    if (reduceMotion.matches) { dialog.close(); return; }
    if (dialog.classList.contains("is-closing")) return;
    dialog.classList.add("is-closing"); // fold the paper away, then close
    setTimeout(function () {
      dialog.classList.remove("is-closing");
      dialog.close();
    }, 190);
  }
  if (dialog) {
    each(document.querySelectorAll(".open-work"), function (btn) {
      btn.addEventListener("click", function () {
        var card = btn.closest(".work");
        var tpl = card.querySelector("template.work-detail");
        var cover = card.querySelector(".work-cover");
        dialogTitle.textContent = card.querySelector(".work-title").textContent;
        if (dialogEyebrow) dialogEyebrow.textContent = "Best work · reflection";
        dialogBody.innerHTML = "";
        if (tpl) dialogBody.appendChild(tpl.content.cloneNode(true));
        if (cover) {
          dialogCover.className = "dialog-cover " + cover.className.replace("work-cover", "").trim();
          dialogCover.innerHTML = cover.innerHTML;
        }
        lastOpener = btn;
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
      });
    });
    /* NEW 10c. Member profile tiles open the same pop-up */
    each(document.querySelectorAll(".mp-open"), function (btn) {
      btn.addEventListener("click", function () {
        var card = btn.closest(".mp-work");
        var tpl = card.querySelector("template.mp-detail");
        var cover = card.querySelector(".mp-cover");
        dialogTitle.textContent = card.querySelector(".mp-title").textContent;
        dialogBody.innerHTML = "";
        if (tpl) dialogBody.appendChild(tpl.content.cloneNode(true));
        if (cover) {
          dialogCover.className = "dialog-cover " + cover.className.replace("mp-cover", "").trim();
          dialogCover.innerHTML = cover.innerHTML;
        }
        if (dialogEyebrow) dialogEyebrow.textContent = card.getAttribute("data-label").replace("&amp;", "&") + " · reflection";
        lastOpener = btn;
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
      });
    });
    dialog.querySelector(".dialog-close").addEventListener("click", closeDialog);
    dialog.addEventListener("click", function (e) { if (e.target === dialog) closeDialog(); });
    dialog.addEventListener("cancel", function (e) { e.preventDefault(); closeDialog(); });
    dialog.addEventListener("close", function () { if (lastOpener) lastOpener.focus(); });
  }

  /* ---------- 11. Copy email ---------- */
  each(document.querySelectorAll("[data-copy]"), function (btn) {
    btn.addEventListener("click", function () {
      var src = document.querySelector(btn.getAttribute("data-copy"));
      if (!src) return;
      var box = btn.closest("div");
      var status = box ? box.querySelector(".copy-status") : null;
      var say = function (msg) { if (status) status.textContent = msg; };
      var selectIt = function () {
        var range = document.createRange();
        range.selectNodeContents(src);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        say("Email selected. Press Ctrl+C (or long-press) to copy.");
      };
      var text = src.textContent.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { say("Email copied."); }, selectIt);
      } else {
        selectIt();
      }
    });
  });

  /* ---------- 12b. Back-to-top paper plane ---------- */
  var toTop = document.getElementById("to-top");
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      if (toTop) toTop.hidden = window.scrollY < 600;
      updateProgress();
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener("resize", updateProgress);
  if (toTop) {
    toTop.addEventListener("click", function () {
      if (!reduceMotion.matches) replay(toTop, "fly");
      scrollTop();
    });
  }
})();
