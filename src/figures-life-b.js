/* Pictures for the "In real life" example boxes (one file per group of weeks). Same helpers as figures.js. */
(function () {
  "use strict";
  const F = window.FIGS;
  const { svg, t, box, arrow, curve, A, H, G, B, W, INK, MUTE, RULE, SH, SOFT } = F._h;

  /* ---------- Week 2 ---------- */
  /* BCE as a rain forecast: it rained; penalty -ln(p) for each forecast chance p. */
  F.lifeRainPenalty = () => {
    const ps = [0.9, 0.7, 0.5, 0.3, 0.1], base = 190, k = 60;
    let g = t(280, 20, "It rained. Penalty for each forecast = −ln(chance it gave rain)", "b");
    g += `<line x1="40" y1="${base}" x2="530" y2="${base}" stroke="${INK}" stroke-width="1.5"/>`;
    ps.forEach((p, i) => {
      const v = -Math.log(p), h = v * k, x = 70 + i * 95;
      g += box(x, base - h, 56, h, i === ps.length - 1 ? B : i === 0 ? G : A, "none", 4);
      g += t(x + 28, base - h - 7, v.toFixed(3), "b");
      g += t(x + 28, base + 18, Math.round(p * 100) + "% rain", "s");
    });
    g += t(280, 232, "Said 10% and it rained: about 22 times the penalty of saying 90%", "s");
    return svg(560, 245, g, "Bar chart of binary cross-entropy penalty for rain forecasts of 90, 70, 50, 30 and 10 percent");
  };

  /* Transposed convolution as rubber stamps: width 3, moved 2 at a time, so every other cell is inked twice. */
  F.lifeStampStripes = () => {
    const x0 = 70, cw = 51, n = 9, counts = [1, 1, 2, 1, 2, 1, 2, 1, 1];
    let g = "";
    for (let c = 0; c <= n; c++) g += `<line x1="${x0 + c * cw}" y1="10" x2="${x0 + c * cw}" y2="186" stroke="${RULE}" stroke-dasharray="3 4"/>`;
    for (let i = 0; i < 4; i++) {
      const y = 12 + i * 30;
      g += box(x0 + 2 * i * cw + 2, y, 3 * cw - 4, 24, SOFT, A, 6) + t(x0 - 8, y + 16, "stamp " + (i + 1), "s", "end");
    }
    g += t(x0 - 8, 154, "ink", "b", "end");
    counts.forEach((c, i) => { g += box(x0 + i * cw + 2, 132, cw - 4, 36, c === 2 ? H : SH, c === 2 ? INK : RULE, 4) + t(x0 + i * cw + cw / 2, 155, c, "b"); });
    g += t(x0 + (n * cw) / 2, 206, "Each stamp is 3 cells wide but moves only 2 cells: the overlap cells get ink twice", "s");
    g += t(x0 + (n * cw) / 2, 224, "1 1 2 1 2 1 2 1 1 → light and dark stripes (checkerboard artifacts)", "s");
    return svg(560, 235, g, "Four overlapping stamps leave every other cell inked twice");
  };

  /* Sparse AE worked table as phone battery use: two apps run far more than the allowance. */
  F.lifeBatteryBars = () => {
    const apps = [["h1", 0.3, ""], ["h2", 28.4, "📸 Instagram"], ["h3", 0.44, ""], ["h4", 0.18, ""], ["h5", 0.64, ""], ["h6", 40, "▶️ YouTube"], ["h7", 0.34, ""]];
    const base = 185, k = 3.4;
    let g = t(280, 20, "Share of the day each app runs in the background", "b");
    g += `<line x1="30" y1="${base}" x2="540" y2="${base}" stroke="${INK}" stroke-width="1.5"/>`;
    g += `<line x1="30" y1="${base - 0.5 * k - 2}" x2="540" y2="${base - 0.5 * k - 2}" stroke="${G}" stroke-width="2" stroke-dasharray="6 4"/>`;
    apps.forEach(([lab, v, name], i) => {
      const x = 48 + i * 70, h = Math.max(2, v * k), big = v > 5;
      g += box(x, base - h, 44, h, big ? B : A, "none", 3);
      g += t(x + 22, big ? base - h - 7 : base - 12, v + "%", big ? "b" : "s");
      g += t(x + 22, base + 17, lab, "s");
      if (name) g += t(x + 22, base + 33, name, "s");
    });
    g += t(20, 40, "dashed line = 0.5% allowance", "s", "start");
    return svg(560, 230, g, "Bar chart: five apps near the 0.5 percent allowance, two apps at 28.4 and 40 percent");
  };

  /* ---------- Week 3 ---------- */
  /* Bits as halvings: guess a number from 1 to 8 with 3 yes/no questions. */
  F.lifeHalving = () => {
    const rows = [["start: 1 to 8", [1, 2, 3, 4, 5, 6, 7, 8]], ["“more than 4?” yes", [5, 6, 7, 8]], ["“more than 6?” no", [5, 6]], ["“is it 6?” yes", [6]]];
    let g = "";
    rows.forEach(([q, keep], r) => {
      const y = 14 + r * 48;
      g += t(10, y + 22, q, r ? "s" : "b", "start");
      for (let n = 1; n <= 8; n++) {
        const x = 192 + (n - 1) * 44, on = keep.includes(n);
        const cell = box(x, y, 38, 34, on ? (r === 3 ? H : SOFT) : SH, on ? A : RULE, 6) + t(x + 19, y + 22, n, on ? "b" : "s");
        g += on ? cell : `<g opacity=".3">${cell}</g>`;
      }
    });
    g += t(280, 226, "8 → 4 → 2 → 1: three halvings = 3 bits = log₂ 8", "b");
    return svg(560, 240, g, "Three yes or no questions halve 8 choices down to 1");
  };

  /* Forward vs reverse KL as one ice-cream cart and two crowds on a road. */
  F.lifeTwoCrowds = () => {
    const X = (x) => 280 + x * 60, Y = (y) => 196 - y * 200;
    const N = (m, s) => (x) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
    const P = (x) => 0.5 * N(-2, 0.6)(x) + 0.5 * N(2, 0.6)(x);
    const fwd = N(0, Math.sqrt(4 + 0.36)), rev = N(2, 0.6);
    const area = `M${X(-4.2)},${Y(0)}` + curve(P, -4.2, 4.2, X, Y).replace(/^M/, "L") + `L${X(4.2)},${Y(0)}Z`;
    return svg(560, 245, `
      <path d="${area}" fill="${SOFT}" stroke="${A}" stroke-width="1.5"/>
      <path d="${curve(fwd, -4.2, 4.2, X, Y)}" fill="none" stroke="${INK}" stroke-width="2.5" stroke-dasharray="7 5"/>
      <path d="${curve(rev, 0.2, 3.8, X, Y)}" fill="none" stroke="${G}" stroke-width="3"/>
      <line x1="20" y1="${Y(0)}" x2="540" y2="${Y(0)}" stroke="${INK}" stroke-width="1.5"/>
      ${t(X(-2), 216, "🏫 school gate crowd", "s")}${t(X(0), 216, "empty stretch", "s")}${t(X(2), 216, "🏏 cricket ground crowd", "s")}
      <rect x="22" y="12" width="26" height="12" fill="${SOFT}" stroke="${A}"/>${t(56, 22, "P: where people are", "s", "start")}
      <line x1="22" y1="40" x2="48" y2="40" stroke="${INK}" stroke-width="2.5" stroke-dasharray="7 5"/>${t(56, 44, "forward KL cart: covers both, wastes time in the gap", "s", "start")}
      <line x1="22" y1="62" x2="48" y2="62" stroke="${G}" stroke-width="3"/>${t(56, 66, "reverse KL cart: parks at one crowd", "s", "start")}
      ${t(280, 238, "🚚 One cart (Q) trying to serve two crowds (P)", "b")}`, "Two-humped crowd with a wide covering curve and a narrow one-hump curve");
  };
})();
