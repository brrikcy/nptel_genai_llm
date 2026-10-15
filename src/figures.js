/* Static teaching diagrams. Each entry returns an inline SVG that follows the page theme.
   Text uses the .fig svg text styles; colours use the CSS custom properties. */
(function () {
  "use strict";
  const F = (window.FIGS = window.FIGS || {});
  const A = "var(--accent)", H = "var(--hi)", G = "var(--good)", B = "var(--bad)", W = "var(--warn)", INK = "var(--ink)", MUTE = "var(--ink-2)", RULE = "var(--rule)", SH = "var(--sheet)", SOFT = "var(--accent-soft)";
  const svg = (w, h, inner, label) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label || ""}">${inner}</svg>`;
  const t = (x, y, s, cls = "", anchor = "middle") => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${s}</text>`;
  const box = (x, y, w, h, fill = SH, stroke = RULE, r = 8) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
  const arrowDef = (id, col) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${col}"/></marker></defs>`;
  let AID = 0;
  const arrow = (x1, y1, x2, y2, col = MUTE, dash = "") => { const id = "fa" + ++AID; return `${arrowDef(id, col)}<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="2" marker-end="url(#${id})" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`; };
  const curve = (fn, x0, x1, X, Y, n = 120) => { let d = ""; for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n; d += (i ? "L" : "M") + X(x).toFixed(1) + "," + Y(fn(x)).toFixed(1); } return d; };
  F._h = { svg, t, box, arrow, curve, A, H, G, B, W, INK, MUTE, RULE, SH, SOFT };

  /* ---------- Week 0 ---------- */
  F.probScale = () => svg(560, 110, `
    <line x1="40" y1="55" x2="520" y2="55" stroke="${INK}" stroke-width="3"/>
    ${[0, 0.25, 0.5, 0.75, 1].map((v) => `<line x1="${40 + v * 480}" y1="45" x2="${40 + v * 480}" y2="65" stroke="${INK}" stroke-width="2"/>${t(40 + v * 480, 85, v)}`).join("")}
    ${t(40, 30, "impossible", "s")}${t(280, 30, "50–50", "s")}${t(520, 30, "certain", "s")}
    <circle cx="${40 + 0.4 * 480}" cy="55" r="7" fill="${A}"/>${t(40 + 0.4 * 480, 105, "p(spam) = 0.4", "b")}`, "Probability scale from 0 to 1");

  F.expCurve = () => {
    const X = (x) => 60 + (x + 3) * 80, Y = (y) => 210 - y * 22;
    return svg(560, 240, `
      <line x1="40" y1="${Y(0)}" x2="540" y2="${Y(0)}" stroke="${RULE}"/><line x1="${X(0)}" y1="10" x2="${X(0)}" y2="225" stroke="${RULE}"/>
      <path d="${curve(Math.exp, -3, 2.2, X, Y)}" fill="none" stroke="${A}" stroke-width="3"/>
      ${[-3, -2, -1, 0, 1, 2].map((v) => t(X(v), 228, v, "s")).join("")}
      <circle cx="${X(0)}" cy="${Y(1)}" r="5" fill="${H}"/>${t(X(0) + 10, Y(1) - 8, "e⁰ = 1", "s", "start")}
      <circle cx="${X(1)}" cy="${Y(Math.E)}" r="5" fill="${H}"/>${t(X(1) + 10, Y(Math.E) + 4, "e¹ ≈ 2.718", "s", "start")}
      <circle cx="${X(-2)}" cy="${Y(Math.exp(-2))}" r="5" fill="${H}"/>${t(X(-2), Y(Math.exp(-2)) - 12, "e⁻² ≈ 0.14 (still above 0)", "s")}`, "Graph of e to the x");
  };

  F.vectorArrow = () => {
    const X = (x) => 60 + x * 50, Y = (y) => 220 - y * 45;
    return svg(400, 240, `
      ${[0, 1, 2, 3, 4, 5].map((v) => `<line x1="${X(v)}" y1="${Y(0)}" x2="${X(v)}" y2="${Y(4.4)}" stroke="${RULE}"/>${t(X(v), 236, v, "s")}`).join("")}
      ${[0, 1, 2, 3, 4].map((v) => `<line x1="${X(0)}" y1="${Y(v)}" x2="${X(5.5)}" y2="${Y(v)}" stroke="${RULE}"/>${t(X(0) - 12, Y(v) + 4, v, "s")}`).join("")}
      <line x1="${X(3)}" y1="${Y(0)}" x2="${X(3)}" y2="${Y(4)}" stroke="${H}" stroke-width="2" stroke-dasharray="5 4"/>
      ${arrow(X(0), Y(0), X(3), Y(4), A)}
      ${t(X(1.2), Y(2.5), "length 5", "b")}${t(X(3) + 8, Y(4) - 6, "[3, 4]", "b", "start")}${t(X(1.5), Y(0) - 6, "3", "s")}${t(X(3) + 12, Y(2), "4", "s", "start")}`, "Vector 3,4 as an arrow");
  };

  F.layerMatrix = () => {
    const ins = [0, 1, 2, 3].map((i) => 40 + i * 50), outs = [0, 1, 2].map((i) => 65 + i * 50);
    let g = "";
    ins.forEach((y) => outs.forEach((y2) => (g += `<line x1="70" y1="${y}" x2="230" y2="${y2}" stroke="${RULE}" stroke-width="1.5"/>`)));
    g += ins.map((y, i) => `<circle cx="60" cy="${y}" r="13" fill="${SOFT}" stroke="${A}"/>${t(60, y + 5, "x" + (i + 1), "s")}`).join("");
    g += outs.map((y, i) => `<circle cx="240" cy="${y}" r="13" fill="${H}" stroke="${INK}"/>${t(240, y + 5, "z" + (i + 1), "s")}`).join("");
    g += t(60, 225, "4 inputs", "s") + t(240, 225, "3 neurons", "s");
    g += box(300, 40, 230, 150, "var(--sheet-2)") + t(415, 65, "weight matrix W: 3 × 4", "b");
    [0, 1, 2].forEach((r) => [0, 1, 2, 3].forEach((c) => (g += `<rect x="${330 + c * 44}" y="${80 + r * 34}" width="38" height="28" rx="4" fill="${r === 0 ? SOFT : SH}" stroke="${RULE}"/>${t(349 + c * 44, 99 + r * 34, "w" + (r + 1) + (c + 1), "s")}`)));
    g += t(415, 210, "row 1 = neuron 1's weights", "s");
    return svg(560, 240, g, "A layer as a weight matrix");
  };

  F.slopeCurve = () => {
    const X = (x) => 280 + x * 55, Y = (y) => 220 - y * 11;
    const tan = (a, col) => { const s = 2 * a, y0 = a * a; return `<line x1="${X(a - 1.2)}" y1="${Y(y0 - 1.2 * s)}" x2="${X(a + 1.2)}" y2="${Y(y0 + 1.2 * s)}" stroke="${col}" stroke-width="2.5"/><circle cx="${X(a)}" cy="${Y(y0)}" r="6" fill="${col}"/>`; };
    return svg(560, 240, `
      <line x1="20" y1="${Y(0)}" x2="540" y2="${Y(0)}" stroke="${RULE}"/>
      <path d="${curve((x) => x * x, -4.3, 4.3, X, Y)}" fill="none" stroke="${INK}" stroke-width="2"/>
      ${tan(3, B)}${t(X(3) + 12, Y(9) + 22, "slope +6: go left", "s", "start")}
      ${tan(-2, G)}${t(X(-2) - 12, Y(4) + 24, "slope −4: go right", "s", "end")}
      ${tan(0, A)}${t(X(0), Y(0) + 16, "slope 0: bottom", "s")}
      ${t(X(-3.6), 26, "L(w) = w²", "b", "start")}`, "Tangent slopes on a parabola");
  };

  F.bellBands = () => {
    const X = (x) => 280 + x * 70, Y = (y) => 210 - y * 420;
    const pdf = (x) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
    const area = (a, b) => `M${X(a)},${Y(0)}` + curve(pdf, a, b, X, Y).replace(/^M/, "L") + `L${X(b)},${Y(0)}Z`;
    return svg(560, 240, `
      <path d="${area(-2, 2)}" fill="${SOFT}"/><path d="${area(-1, 1)}" fill="${A}" opacity=".35"/>
      <path d="${curve(pdf, -3.7, 3.7, X, Y)}" fill="none" stroke="${A}" stroke-width="3"/>
      <line x1="20" y1="${Y(0)}" x2="540" y2="${Y(0)}" stroke="${INK}"/>
      ${["μ−2σ", "μ−σ", "μ", "μ+σ", "μ+2σ"].map((s, i) => t(X(i - 2), 228, s, "s")).join("")}
      ${t(X(0), Y(0.2), "68%", "b")}${t(X(1.55), Y(0.08), "95%", "s")}${t(X(-1.55), Y(0.08), "95%", "s")}`, "Bell curve with 68 and 95 percent bands");
  };

  /* ---------- Week 1 ---------- */
  F.genVsDisc = () => {
    const r = (() => { let s = 11; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })();
    const g = () => { const u = Math.max(1e-6, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const pts = (cx, cy, n) => Array.from({ length: n }, () => [cx + g() * 22, cy + g() * 18]);
    const cats = pts(80, 80, 18), dogs = pts(185, 140, 18);
    const dots = (ox, arr, col) => arr.map(([x, y]) => `<circle cx="${ox + x}" cy="${y}" r="4.5" fill="${col}"/>`).join("");
    return svg(560, 240, `
      ${t(135, 22, "Discriminative: learns the line", "b")}${t(415, 22, "Generative: learns where data lives", "b")}
      ${dots(0, cats, A)}${dots(0, dogs, B)}<line x1="40" y1="200" x2="240" y2="35" stroke="${INK}" stroke-width="2.5" stroke-dasharray="7 5"/>
      ${t(70, 225, "cats", "s")}${t(205, 225, "dogs", "s")}
      <ellipse cx="360" cy="80" rx="58" ry="46" fill="${SOFT}" stroke="${A}"/><ellipse cx="360" cy="80" rx="30" ry="24" fill="none" stroke="${A}" stroke-dasharray="3 3"/>
      <ellipse cx="465" cy="140" rx="58" ry="46" fill="var(--bad-soft)" stroke="${B}"/><ellipse cx="465" cy="140" rx="30" ry="24" fill="none" stroke="${B}" stroke-dasharray="3 3"/>
      ${dots(280, cats, A)}${dots(280, dogs, B)}
      <circle cx="380" cy="64" r="7" fill="none" stroke="${H}" stroke-width="3"/>${t(392, 44, "new cat!", "b", "start")}
      <line x1="280" y1="10" x2="280" y2="230" stroke="${RULE}"/>`, "Discriminative versus generative");
  };
  F.courseMap = () => {
    const items = [["Autoencoders + VAEs", "W2–4", A], ["GANs", "W5–6", B], ["Diffusion", "W7–8", G], ["Language models", "W9–12", W]];
    return svg(560, 120, items.map(([n, w, c], i) => `${box(10 + i * 138, 25, 126, 70, SH, c)}${t(73 + i * 138, 55, n, "b")}${t(73 + i * 138, 77, w, "s")}${i < 3 ? arrow(137 + i * 138, 60, 147 + i * 138, 60) : ""}`).join(""), "Course map");
  };
  F.neuronDiagram = () => svg(560, 200, `
    ${["x₁ = 2", "x₂ = 1", "x₃ = 3"].map((s, i) => `<circle cx="50" cy="${45 + i * 55}" r="22" fill="${SOFT}" stroke="${A}"/>${t(50, 50 + i * 55, s.split(" ")[0])}`).join("")}
    ${["w₁", "w₂", "w₃"].map((s, i) => `${arrow(74, 45 + i * 55, 228, 100, MUTE)}${t(150, 55 + i * 30, s, "s")}`).join("")}
    <circle cx="255" cy="100" r="30" fill="${H}" stroke="${INK}"/>${t(255, 98, "Σ + b", "b")}${t(255, 114, "z", "s")}
    ${arrow(287, 100, 345, 100)}${box(348, 75, 90, 50, SH, A)}${t(393, 98, "f(z)", "b")}${t(393, 115, "activation", "s")}
    ${arrow(440, 100, 500, 100)}${t(525, 105, "a", "b")}
    ${t(255, 175, "z = w₁x₁ + w₂x₂ + w₃x₃ + b", "s")}`, "A neuron");
  F.batchSizes = () => {
    const row = (y, n, lab, sub) => `${t(10, y + 16, lab, "b", "start")}${t(10, y + 32, sub, "s", "start")}` + Array.from({ length: 24 }, (_, i) => `<rect x="${200 + i * 14}" y="${y + 6}" width="11" height="22" rx="2" fill="${i < n ? A : SH}" stroke="${RULE}"/>`).join("");
    return svg(560, 140, row(5, 24, "Batch GD", "all 24 → 1 update") + row(50, 1, "SGD", "1 → 24 updates") + row(95, 6, "Mini-batch (B = 6)", "6 → 4 updates"), "Batch sizes");
  };
  F.ewmaFig = () => {
    const gs = [5, 6, 7, -4, 6, 5, 7, -3, 6, 6, 5, 7];
    let v = 0; const vs = gs.map((x) => (v = 0.9 * v + 0.1 * x));
    const X = (i) => 40 + i * 42, Y = (y) => 120 - y * 12;
    return svg(560, 200, `<line x1="30" y1="${Y(0)}" x2="540" y2="${Y(0)}" stroke="${RULE}"/>
      <polyline points="${gs.map((g, i) => X(i) + "," + Y(g)).join(" ")}" fill="none" stroke="${MUTE}" stroke-width="1.5"/>${gs.map((g, i) => `<circle cx="${X(i)}" cy="${Y(g)}" r="4" fill="${MUTE}"/>`).join("")}
      <polyline points="${vs.map((g, i) => X(i) + "," + Y(g)).join(" ")}" fill="none" stroke="${H}" stroke-width="3.5"/>
      ${t(X(3), Y(-4) + 18, "noisy slope −4", "s")}${t(X(11) - 4, Y(vs[11]) - 10, "velocity v", "b", "end")}${t(X(0), Y(5) - 10, "slopes g", "s")}`, "Momentum smooths noisy slopes");
  };
  F.convSlide = () => {
    const img = [[3, 0, 1, 2, 7], [1, 5, 8, 9, 3], [2, 7, 2, 5, 1], [0, 1, 3, 1, 7], [4, 2, 1, 6, 2]];
    const k = [[1, 0, -1], [1, 0, -1], [1, 0, -1]];
    let g = "";
    img.forEach((row, r) => row.forEach((v, c) => (g += `<rect x="${20 + c * 34}" y="${30 + r * 34}" width="32" height="32" rx="3" fill="${r < 3 && c < 3 ? SOFT : SH}" stroke="${r < 3 && c < 3 ? A : RULE}" stroke-width="${r < 3 && c < 3 ? 2 : 1}"/>${t(36 + c * 34, 51 + r * 34, v)}`)));
    g += t(105, 20, "image (5 × 5)", "s");
    k.forEach((row, r) => row.forEach((v, c) => (g += `<rect x="${230 + c * 34}" y="${64 + r * 34}" width="32" height="32" rx="3" fill="${H}" stroke="${INK}"/>${t(246 + c * 34, 85 + r * 34, v)}`)));
    g += t(281, 55, "kernel", "s") + t(210, 120, "×", "b") + t(352, 120, "=", "b");
    const out = [0, 1, 2].map((r) => [0, 1, 2].map((c) => [0, 1, 2].reduce((s1, i) => s1 + [0, 1, 2].reduce((s2, j) => s2 + img[r + i][c + j] * k[i][j], 0), 0)));
    out.forEach((row, r) => row.forEach((v, c) => (g += `<rect x="${380 + c * 50}" y="${64 + r * 34}" width="46" height="32" rx="3" fill="${r === 0 && c === 0 ? "var(--good-soft)" : SH}" stroke="${r === 0 && c === 0 ? G : RULE}" stroke-width="${r === 0 && c === 0 ? 2 : 1}"/>${t(403 + c * 50, 85 + r * 34, v)}`)));
    g += t(453, 55, "feature map (3 × 3)", "s") + t(280, 215, "blue patch × kernel, added up = −5 (green cell)", "s");
    return svg(560, 230, g, "Convolution");
  };
  F.visionTasks = () => {
    const sheep = (ox, oy, col = INK) => `<ellipse cx="${ox}" cy="${oy}" rx="26" ry="16" fill="${col}" opacity=".85"/><circle cx="${ox + 26}" cy="${oy - 8}" r="8" fill="${col}"/>`;
    const panel = (i, title, body) => `${box(5 + i * 139, 20, 130, 150, "var(--sheet)")}${t(70 + i * 139, 190, title, "s")}<g transform="translate(${5 + i * 139},20)">${body}</g>`;
    return svg(560, 200, panel(0, "classification: ‘sheep’", sheep(45, 75) + sheep(85, 105)) +
      panel(1, "detection: boxes", sheep(45, 75) + sheep(85, 105) + `<rect x="14" y="52" width="68" height="42" fill="none" stroke="${B}" stroke-width="2"/><rect x="54" y="82" width="68" height="42" fill="none" stroke="${A}" stroke-width="2"/>`) +
      panel(2, "semantic: one colour", sheep(45, 75, G) + sheep(85, 105, G)) +
      panel(3, "instance: each one", sheep(45, 75, A) + sheep(85, 105, B)), "Vision tasks");
  };
  F.cnnPipeline = () => {
    const blk = (x, w, h, d, lab, col) => `<rect x="${x + d}" y="${100 - h / 2 - d}" width="${w}" height="${h}" fill="${SH}" stroke="${col}"/><rect x="${x}" y="${100 - h / 2}" width="${w}" height="${h}" fill="${SOFT}" stroke="${col}" stroke-width="1.5"/>${t(x + w / 2, 100 + h / 2 + 18, lab, "s")}`;
    return svg(560, 180, `${blk(10, 70, 110, 4, "image", MUTE)}${arrow(92, 100, 112, 100)}${blk(116, 56, 90, 10, "conv+ReLU", A)}${arrow(184, 100, 204, 100)}${blk(208, 40, 60, 14, "pool", A)}${arrow(264, 100, 284, 100)}${blk(288, 28, 40, 20, "conv+pool", A)}${arrow(338, 100, 358, 100)}
      <rect x="362" y="30" width="14" height="140" fill="${SOFT}" stroke="${A}"/>${t(369, 22, "flatten", "s")}${arrow(380, 100, 400, 100)}
      ${[0, 1, 2, 3, 4].map((i) => `<circle cx="420" cy="${55 + i * 22}" r="8" fill="${SH}" stroke="${A}"/>`).join("")}${t(420, 175, "dense", "s")}${arrow(432, 100, 455, 100)}
      ${["cat 0.8", "dog 0.15", "car 0.05"].map((s, i) => `${box(460, 62 + i * 26, 90, 22, i ? SH : "var(--good-soft)", i ? RULE : G, 4)}${t(505, 78 + i * 26, s, "s")}`).join("")}${t(505, 52, "softmax", "s")}`, "CNN pipeline");
  };
  F.poolingFig = () => {
    const m = [[8, 1, 6, 2], [71, 0, 6, 6], [50, 30, 7, 7], [20, 60, 13, 3]];
    const cols = [SOFT, "var(--good-soft)", "var(--warn-soft)", "var(--bad-soft)"];
    let g = "";
    m.forEach((row, r) => row.forEach((v, c) => { const q = (r >> 1) * 2 + (c >> 1); const mx = Math.max(...[0, 1].flatMap((a) => [0, 1].map((b) => m[(r >> 1) * 2 + a][(c >> 1) * 2 + b]))); g += `<rect x="${30 + c * 44}" y="${30 + r * 44}" width="42" height="42" rx="3" fill="${cols[q]}" stroke="${v === mx ? INK : RULE}" stroke-width="${v === mx ? 2.5 : 1}"/>${t(51 + c * 44, 57 + r * 44, v, v === mx ? "b" : "")}`; }));
    g += arrow(215, 118, 285, 118) + t(250, 108, "max", "s");
    [[71, 6], [60, 13]].forEach((row, r) => row.forEach((v, c) => (g += `<rect x="${300 + c * 54}" y="${70 + r * 54}" width="50" height="50" rx="3" fill="${cols[r * 2 + c]}" stroke="${INK}"/>${t(325 + c * 54, 101 + r * 54, v, "b")}`)));
    g += t(118, 222, "4 × 4 map, 2 × 2 windows, stride 2", "s") + t(354, 222, "2 × 2 result", "s");
    return svg(470, 235, g, "Max pooling");
  };
  F.overfitCurves = () => {
    const X = (e) => 50 + e * 23, Y = (l) => 180 - l * 140;
    const tr = (e) => 0.9 * Math.exp(-e / 5) + 0.05, va = (e) => 0.9 * Math.exp(-e / 5) + 0.12 + Math.max(0, e - 8) * 0.03;
    return svg(560, 210, `<line x1="50" y1="180" x2="540" y2="180" stroke="${INK}"/><line x1="50" y1="20" x2="50" y2="180" stroke="${INK}"/>
      <path d="${curve(tr, 0, 20, X, Y)}" fill="none" stroke="${A}" stroke-width="3"/><path d="${curve(va, 0, 20, X, Y)}" fill="none" stroke="${B}" stroke-width="3"/>
      <line x1="${X(8)}" y1="20" x2="${X(8)}" y2="180" stroke="${H}" stroke-width="2" stroke-dasharray="5 4"/>${t(X(8) + 6, 34, "stop here (early stopping)", "s", "start")}
      ${t(X(20), Y(tr(20)) + 18, "training loss", "s", "end")}${t(X(20), Y(va(20)) - 8, "validation loss", "s", "end")}${t(295, 200, "epochs →", "s")}${t(40, 100, "loss", "s", "end")}`, "Overfitting curves");
  };

  /* ---------- Week 2 ---------- */
  const layerCol = (x, n, col, lab, yc = 120, gap = 34) => Array.from({ length: n }, (_, i) => `<circle cx="${x}" cy="${yc + (i - (n - 1) / 2) * gap}" r="12" fill="${col}" stroke="${INK}" stroke-width="1"/>`).join("") + (lab ? t(x, yc + ((n - 1) / 2) * gap + 34, lab, "s") : "");
  const wires = (x1, n1, x2, n2, yc = 120, gap = 34) => { let g = ""; for (let i = 0; i < n1; i++) for (let j = 0; j < n2; j++) g += `<line x1="${x1}" y1="${yc + (i - (n1 - 1) / 2) * gap}" x2="${x2}" y2="${yc + (j - (n2 - 1) / 2) * gap}" stroke="${RULE}"/>`; return g; };
  F._h.layerCol = layerCol; F._h.wires = wires;
  F.aeHourglass = () => {
    const xs = [60, 160, 270, 380, 480], ns = [5, 4, 3, 4, 5];
    let g = `<path d="M30 20 L250 85 L290 85 L510 20 L510 220 L290 155 L250 155 L30 220Z" fill="${SOFT}" opacity=".45"/>`;
    for (let i = 0; i < 4; i++) g += wires(xs[i], ns[i], xs[i + 1], ns[i + 1]);
    g += layerCol(60, 5, SH, "input x") + layerCol(160, 4, SOFT, "") + layerCol(270, 3, H, "code z") + layerCol(380, 4, SOFT, "") + layerCol(480, 5, SH, "rebuilt x̂");
    g += t(110, 15, "encoder squeezes", "b") + t(430, 15, "decoder rebuilds", "b");
    return svg(540, 270, g, "Autoencoder hourglass");
  };
  F.transposedConv = () => {
    const K = [[4, 3], [2, 1]], I = [[1, 2], [0, 1]];
    const cell = (x, y, v, fill = SH, w = 30) => `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="3" fill="${fill}" stroke="${RULE}"/>${t(x + w / 2, y + w / 2 + 5, v)}`;
    let g = t(45, 20, "input", "s") + t(140, 20, "kernel", "s");
    I.forEach((r, i) => r.forEach((v, j) => (g += cell(15 + j * 32, 30 + i * 32, v, i === 0 && j === 1 ? H : SOFT))));
    K.forEach((r, i) => r.forEach((v, j) => (g += cell(110 + j * 32, 30 + i * 32, v))));
    g += t(230, 20, "input 2 stamps 2 × kernel", "s");
    [[0, 0, 0], [0, 8, 6], [0, 4, 2]].forEach((r, i) => r.forEach((v, j) => (g += cell(190 + j * 32, 30 + i * 32, v || "", v ? H : SH))));
    g += arrow(300, 78, 340, 78);
    g += t(420, 20, "all four stamps added", "s");
    [[4, 11, 6], [2, 9, 5], [0, 2, 1]].forEach((r, i) => r.forEach((v, j) => (g += cell(370 + j * 32, 30 + i * 32, v, "var(--good-soft)"))));
    g += t(270, 150, "2 × 2 input, 2 × 2 kernel, stride 1 → (2 + 2 − 1) = 3 × 3 output", "s");
    return svg(540, 165, g, "Transposed convolution");
  };
  F.daeFlow = () => {
    const face = (x, noisy) => { const r = (() => { let s = 5; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })(); let g = `<circle cx="${x}" cy="90" r="40" fill="none" stroke="${INK}" stroke-width="4"/><circle cx="${x - 14}" cy="80" r="5" fill="${INK}"/><circle cx="${x + 14}" cy="80" r="5" fill="${INK}"/><path d="M${x - 18} 102 Q${x} 120 ${x + 18} 102" fill="none" stroke="${INK}" stroke-width="4"/>`; if (noisy) for (let i = 0; i < 70; i++) g += `<rect x="${x - 50 + r() * 100}" y="${40 + r() * 100}" width="4" height="4" fill="${r() > 0.5 ? INK : SH}"/>`; return g; };
    return svg(560, 190, `${face(60, false)}${t(60, 160, "clean x", "s")}${arrow(105, 90, 140, 90)}${t(122, 80, "+ noise", "s")}
      ${face(190, true)}${t(190, 160, "damaged x̃", "s")}${arrow(235, 90, 265, 90)}
      <path d="M270 55 L330 75 L330 105 L270 125Z" fill="${SOFT}" stroke="${A}"/><path d="M335 75 L395 55 L395 125 L335 105Z" fill="${SOFT}" stroke="${A}"/>${t(332, 145, "autoencoder", "s")}
      ${arrow(400, 90, 430, 90)}${face(480, false)}${t(480, 160, "output x̂", "s")}
      <path d="M480 172 Q270 200 60 172" fill="none" stroke="${G}" stroke-width="2" stroke-dasharray="5 4"/>${t(270, 186, "loss compares x̂ with the CLEAN x", "b")}`, "Denoising autoencoder");
  };
  F.latentGaps = () => {
    const r = (() => { let s = 3; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })();
    const g2 = () => { const u = Math.max(1e-6, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const cols = [A, B, G, W];
    let g = t(135, 18, "plain AE: scattered islands", "b") + t(410, 18, "VAE: one smooth cloud", "b");
    [[60, 60], [200, 70], [90, 190], [215, 180]].forEach(([cx, cy], k) => { for (let i = 0; i < 12; i++) g += `<circle cx="${cx + g2() * 12}" cy="${cy + g2() * 10}" r="4" fill="${cols[k]}"/>`; });
    g += `<circle cx="140" cy="125" r="8" fill="none" stroke="${INK}" stroke-width="2.5"/>${t(140, 150, "random pick → smudge", "s")}`;
    g += `<circle cx="410" cy="125" r="85" fill="${SOFT}" opacity=".6"/><circle cx="410" cy="125" r="45" fill="none" stroke="${A}" stroke-dasharray="3 3"/>`;
    [[380, 100], [440, 100], [380, 150], [440, 150]].forEach(([cx, cy], k) => { for (let i = 0; i < 12; i++) g += `<circle cx="${cx + g2() * 13}" cy="${cy + g2() * 11}" r="4" fill="${cols[k]}"/>`; });
    g += `<circle cx="410" cy="125" r="8" fill="none" stroke="${INK}" stroke-width="2.5"/>${t(410, 228, "random pick from N(0, I) → sensible digit", "s")}`;
    g += `<line x1="275" y1="10" x2="275" y2="235" stroke="${RULE}"/>`;
    return svg(550, 240, g, "Latent space gaps");
  };

  /* ---------- Week 3 ---------- */
  F.vaeArch = () => svg(560, 210, `
    ${box(10, 80, 60, 50, SH, MUTE)}${t(40, 110, "x")}${arrow(72, 105, 100, 105)}
    <path d="M102 50 L170 75 L170 135 L102 160Z" fill="${SOFT}" stroke="${A}"/>${t(136, 180, "encoder", "s")}
    ${arrow(172, 88, 205, 70)}${arrow(172, 122, 205, 140)}
    ${box(207, 50, 70, 38, SH, A)}${t(242, 74, "μ", "b")}${box(207, 122, 70, 38, SH, A)}${t(242, 146, "log σ²", "b")}
    ${arrow(279, 69, 318, 100)}${arrow(279, 141, 318, 112)}
    <circle cx="345" cy="106" r="28" fill="${H}" stroke="${INK}"/>${t(345, 102, "sample", "s")}${t(345, 118, "z", "b")}
    ${t(345, 160, "z ~ N(μ, σ²)", "s")}${arrow(375, 106, 405, 106)}
    <path d="M407 75 L475 50 L475 160 L407 135Z" fill="${SOFT}" stroke="${A}"/>${t(441, 180, "decoder", "s")}
    ${arrow(477, 105, 500, 105)}${box(502, 80, 50, 50, SH, MUTE)}${t(527, 110, "x̂")}
    <ellipse cx="345" cy="30" rx="60" ry="16" fill="none" stroke="${A}" stroke-dasharray="4 3"/>${t(345, 34, "a cloud, not a point", "s")}`, "VAE architecture");
  F.reparamFig = () => {
    const node = (x, y, lab, fill = SH, col = A) => `<circle cx="${x}" cy="${y}" r="24" fill="${fill}" stroke="${col}" stroke-width="2"/>${t(x, y + 5, lab, "b")}`;
    return svg(560, 230, `${t(135, 18, "before: random step blocks gradient", "b")}${t(415, 18, "after: z = μ + σε", "b")}
      ${node(60, 70, "μ")}${node(60, 160, "σ")}${arrow(84, 80, 140, 105)}${arrow(84, 150, 140, 125)}
      <rect x="140" y="88" width="60" height="50" rx="10" fill="var(--bad-soft)" stroke="${B}" stroke-width="2"/>${t(170, 118, "z ~ N", "b")}${arrow(202, 113, 240, 113)}${t(255, 118, "loss")}
      <line x1="150" y1="155" x2="190" y2="195" stroke="${B}" stroke-width="3"/><line x1="190" y1="155" x2="150" y2="195" stroke="${B}" stroke-width="3"/>${t(170, 215, "no slope", "s")}
      <line x1="280" y1="30" x2="280" y2="220" stroke="${RULE}"/>
      ${node(330, 70, "μ")}${node(330, 160, "σ")}${node(440, 200, "ε", "var(--warn-soft)", W)}${t(495, 205, "~ N(0,1)", "s")}
      ${arrow(354, 80, 410, 105, G)}${arrow(354, 150, 410, 122, G)}${arrow(440, 175, 440, 140, W, "4 3")}
      <rect x="410" y="88" width="60" height="50" rx="10" fill="var(--good-soft)" stroke="${G}" stroke-width="2"/>${t(440, 118, "z", "b")}${arrow(472, 113, 510, 113, G)}${t(530, 118, "loss")}
      ${t(380, 50, "gradients flow ←", "s")}`, "Reparameterisation trick");
  };
  F.vaePassFig = () => {
    const st = (x, lab, val, col = A) => `${box(x, 60, 92, 70, SH, col)}${t(x + 46, 85, lab, "b")}${t(x + 46, 108, val, "s")}`;
    return svg(580, 190, `${st(2, "input x", "4 numbers", MUTE)}${arrow(96, 95, 108, 95)}${st(110, "hidden", "[1.07,1.93,0.87]")}${arrow(204, 95, 216, 95)}
      ${st(218, "μ, log σ²", "[0.043,0.551]")}${arrow(312, 95, 324, 95)}${st(326, "z = μ+σε", "[0.764,0.318]", W)}${arrow(420, 95, 432, 95)}${st(434, "decoder", "x̂ (4 numbers)")}
      ${t(290, 160, "loss = MSE 9.711 + KL 0.352 = 10.063", "b")}${t(290, 30, "ReLU → linear heads → sample → ReLU → linear output", "s")}`, "VAE worked pass");
  };
})();
