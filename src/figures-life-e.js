/* Pictures for the "In real life" example boxes (one file per group of weeks). Same helpers as figures.js. */
(function () {
  "use strict";
  const F = window.FIGS;
  const { svg, t, box, arrow, curve, A, H, G, B, W, INK, MUTE, RULE, SH, SOFT } = F._h;

  /* ---------- Week 11: LoRA as "a column times a row" ---------- */
  F.lifeLowRank = () => {
    const col = [1, 2, 3], row = [2, 5, 1, 3], items = ["🥟", "🧃", "🍪", "🥪"];
    let g = t(40, 30, "portions", "s");
    col.forEach((v, i) => (g += box(20, 50 + i * 40, 40, 32, SOFT, A, 6) + t(40, 71 + i * 40, v, "b")));
    g += t(40, 192, "B (3 × 1)", "s") + t(85, 115, "×", "b");
    g += t(205, 30, "price rise (₹)", "s");
    row.forEach((v, j) => (g += box(110 + j * 48, 50, 42, 32, SOFT, H, 6) + t(131 + j * 48, 71, v, "b") + t(131 + j * 48, 104, items[j])));
    g += t(205, 130, "A (1 × 4)", "s") + t(322, 115, "=", "b");
    col.forEach((c, i) => row.forEach((r, j) => (g += box(345 + j * 48, 50 + i * 40, 42, 32, SH, RULE, 6) + t(366 + j * 48, 71 + i * 40, c * r))));
    g += t(441, 30, "extra cost table BA", "s") + t(441, 192, "12 cells from just 7 numbers", "s");
    return svg(560, 205, g, "A column of 3 numbers times a row of 4 numbers fills a 3 by 4 table");
  };

  /* ---------- Week 12: temperature changes the chances ---------- */
  F.lifeTempBars = () => {
    const z = [3, 2, 1], names = ["poha", "upma", "idli"], cols = [A, H, G];
    const Ts = [[0.5, "rushed day"], [1, "normal day"], [2, "Sunday"]];
    let g = "";
    Ts.forEach(([T, lab], k) => {
      const e = z.map((v) => Math.exp(v / T)), s = e.reduce((a, b) => a + b, 0), p = e.map((v) => v / s);
      const x0 = 30 + k * 180;
      g += `<line x1="${x0 - 6}" y1="170" x2="${x0 + 152}" y2="170" stroke="${RULE}" stroke-width="1.5"/>`;
      p.forEach((v, i) => {
        const h = v * 130, x = x0 + i * 52;
        g += `<rect x="${x}" y="${(170 - h).toFixed(1)}" width="42" height="${h.toFixed(1)}" rx="4" fill="${cols[i]}"/>`;
        g += t(x + 21, (164 - h).toFixed(1), Math.round(v * 100) + "%", "s") + t(x + 21, 187, names[i], "s");
      });
      g += t(x0 + 73, 212, "T = " + T + " (" + lab + ")", "b");
    });
    return svg(560, 225, g, "Breakfast chances at temperatures 0.5, 1 and 2");
  };

  /* ---------- Week 12: sampling as a lucky wheel and a 0-to-1 ruler ---------- */
  F.lifeSpinWheel = () => {
    const sl = [[0.5, "🍫", A], [0.3, "🖊️", H], [0.15, "🔑", G], [0.05, "🧸", W]];
    const cx = 110, cy = 112, r = 88, U = 0.83;
    const pt = (u, rr) => [cx + rr * Math.sin(2 * Math.PI * u), cy - rr * Math.cos(2 * Math.PI * u)];
    let g = "", c = 0;
    sl.forEach(([p, em, col]) => {
      const [x0, y0] = pt(c, r), [x1, y1] = pt(c + p, r), [lx, ly] = pt(c + p / 2, r * 0.62);
      g += `<path d="M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${p > 0.5 ? 1 : 0} 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z" fill="${col}" stroke="${SH}" stroke-width="2"/>`;
      g += t(lx.toFixed(1), (ly + 6).toFixed(1), em);
      c += p;
    });
    const [px, py] = pt(U, r - 6);
    g += arrow(cx, cy, px.toFixed(1), py.toFixed(1), INK) + `<circle cx="${cx}" cy="${cy}" r="5" fill="${INK}"/>`;
    const X = (u) => 250 + u * 280;
    c = 0;
    sl.forEach(([p, em, col]) => { g += `<rect x="${X(c)}" y="110" width="${p * 280}" height="26" fill="${col}" stroke="${SH}"/>` + t(X(c + p / 2), 129, em); c += p; });
    [[0, 156], [0.5, 156], [0.8, 156], [0.95, 172], [1, 156]].forEach(([u, y]) => (g += `<line x1="${X(u)}" y1="106" x2="${X(u)}" y2="140" stroke="${INK}"/>` + t(X(u), y, u, "s")));
    g += `<path d="M${X(U)},106 l-6,-14 h12 z" fill="${INK}"/>` + t(X(U) - 40, 80, "U = 0.83 → keychain", "b");
    g += t(390, 40, "running totals on a 0-to-1 ruler", "s");
    return svg(560, 210, g, "A lucky wheel and the same chances laid out on a ruler from 0 to 1");
  };

  /* ---------- Week 12: word overlap behind precision, recall and F1 ---------- */
  F.lifeWordOverlap = () => {
    const pred = ["the", "city", "of", "new", "delhi"], X = (i) => 150 + i * 78;
    let g = t(20, 60, "prediction (5)", "s", "start") + t(20, 140, "reference (2)", "s", "start");
    pred.forEach((w, i) => {
      const hit = i >= 3;
      g += box(X(i), 38, 70, 32, hit ? SOFT : SH, hit ? A : RULE, 8) + t(X(i) + 35, 59, w, hit ? "b" : "");
      if (hit) g += `<line x1="${X(i) + 35}" y1="72" x2="${X(i) + 35}" y2="116" stroke="${A}" stroke-width="2" stroke-dasharray="5 4"/>` + box(X(i), 118, 70, 32, SOFT, A, 8) + t(X(i) + 35, 139, w, "b");
    });
    g += t(280, 185, "2 shared words:  P = 2/5 = 0.4   ·   R = 2/2 = 1   ·   F1 ≈ 0.57", "b");
    return svg(560, 200, g, "Prediction words compared with reference words");
  };

  /* ---------- Week 12: two fairness checks on the same trials ---------- */
  F.lifeFairBars = () => {
    const groups = [["selection rate", "(all who tried)", 40, 20], ["true-positive rate", "(only those who qualify)", 90, 60]];
    let g = `<line x1="40" y1="170" x2="520" y2="170" stroke="${RULE}" stroke-width="1.5"/>`;
    groups.forEach(([name, sub, b, gl], k) => {
      const x0 = 90 + k * 250;
      [[b, A, "👦 boys"], [gl, H, "👧 girls"]].forEach(([v, col, lab], i) => {
        const h = v * 1.3, x = x0 + i * 80;
        g += `<rect x="${x}" y="${170 - h}" width="60" height="${h}" rx="4" fill="${col}"/>` + t(x + 30, 164 - h, v + "%", "b") + t(x + 30, 187, lab, "s");
      });
      g += t(x0 + 70, 207, name, "b") + t(x0 + 70, 222, sub, "s");
    });
    return svg(560, 232, g, "Selection rates and true-positive rates for boys and girls");
  };
})();
