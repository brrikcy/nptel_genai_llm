/* Pictures for the "In real life" example boxes (one file per group of weeks). Same helpers as figures.js. */
(function () {
  "use strict";
  const F = window.FIGS;
  const { svg, t, box, arrow, curve, A, H, G, B, W, INK, MUTE, RULE, SH, SOFT } = F._h;

  /* ---------- Week 7 ---------- */
  /* Three small scatter plots: positive, negative and near-zero covariance. */
  F.lifeCovScatter = () => {
    const panels = [
      ["📚 study vs marks", "Cov > 0: rise together", G, [[1, 3], [2, 4], [2.5, 3.6], [3, 5.2], [4, 5.5], [4.5, 7], [5.5, 7.2], [6, 8.4], [7, 8.6], [7.5, 9.6]]],
      ["📱 screen vs sleep", "Cov < 0: one up, one down", B, [[1, 9.2], [1.8, 8.8], [2.5, 8.6], [3, 7.4], [4, 7], [4.4, 5.8], [5.5, 5.4], [6, 4.2], [7, 3.8], [7.6, 2.8]]],
      ["👟 shoe size vs marks", "Cov ≈ 0: unrelated", MUTE, [[1, 6], [1.6, 3], [2.5, 8.5], [3, 4.5], [3.8, 7], [4.4, 2.6], [5.2, 9], [5.8, 5.2], [6.6, 3.6], [7.4, 7.6]]]
    ];
    let g = "";
    panels.forEach(([title, note, col, pts], i) => {
      const ox = 12 + i * 184, X = (x) => ox + 14 + x * 19, Y = (y) => 178 - y * 14;
      g += box(ox, 28, 168, 160, SH, RULE);
      g += `<line x1="${ox + 14}" y1="178" x2="${ox + 160}" y2="178" stroke="${INK}"/><line x1="${ox + 14}" y1="178" x2="${ox + 14}" y2="40" stroke="${INK}"/>`;
      g += pts.map(([x, y]) => `<circle cx="${X(x)}" cy="${Y(y)}" r="5" fill="${col}" opacity=".85"/>`).join("");
      g += t(ox + 84, 18, title, "b") + t(ox + 84, 206, note, "s");
    });
    return svg(560, 216, g, "Scatter plots showing positive, negative and near-zero covariance");
  };

  /* Photocopy of a photocopy: each copy keeps 90% of what is left, so alpha-bar is a product. */
  F.lifePhotocopy = () => {
    const vals = [["original", 1], ["copy 1", 0.9], ["copy 2", 0.81], ["copy 3", 0.729]];
    const base = 175, top = 40, hmax = base - top;
    let g = `<line x1="30" y1="${base}" x2="540" y2="${base}" stroke="${INK}"/>`;
    vals.forEach(([lab, v], i) => {
      const x = 50 + i * 130, h = v * hmax;
      g += `<rect x="${x}" y="${base - h}" width="70" height="${h}" rx="4" fill="${i ? SOFT : A}" stroke="${A}" stroke-width="1.5" opacity="${i ? 1 : 0.8}"/>`;
      g += t(x + 35, base - h - 8, v === 1 ? "1.00" : String(v), "b") + t(x + 35, base + 18, "📄 " + lab, "s");
      if (i < 3) g += arrow(x + 76, 95, x + 124, 95, H) + t(x + 100, 86, "× 0.9", "s");
    });
    g += t(280, 212, "after 3 copies: 0.9 × 0.9 × 0.9 = 0.729 is left (a product, not a sum)", "s");
    return svg(560, 222, g, "Bars showing 1, 0.9, 0.81 and 0.729 of the original sharpness after each photocopy");
  };

  /* ---------- Week 8 ---------- */
  /* Classifier-free guidance as a spice level number line. */
  F.lifeSpiceLine = () => {
    const X = (v) => 40 + v * 40, y = 92;
    let g = `<line x1="${X(0)}" y1="${y}" x2="${X(12)}" y2="${y}" stroke="${INK}" stroke-width="2"/>`;
    for (let v = 0; v <= 12; v++) g += `<line x1="${X(v)}" y1="${y - 5}" x2="${X(v)}" y2="${y + 5}" stroke="${INK}"/>` + t(X(v), y + 22, v, "s");
    g += arrow(X(2), y - 22, X(5) - 4, y - 22, G) + arrow(X(5), y - 22, X(11) - 4, y - 22, W, "6 5");
    g += `<circle cx="${X(2)}" cy="${y}" r="8" fill="${MUTE}"/><circle cx="${X(5)}" cy="${y}" r="8" fill="${G}"/><circle cx="${X(8)}" cy="${y}" r="7" fill="${A}"/><circle cx="${X(11)}" cy="${y}" r="8" fill="${B}"/>`;
    g += t(X(2), y - 34, "🍜 plain: 2", "b") + t(X(5), y - 34, "🌶️ “spicy”: 5", "b") + t(X(11), y - 34, "🔥 11", "b");
    g += t(X(2), y + 44, "w = 0", "s") + t(X(5), y + 44, "w = 1", "s") + t(X(8), y + 44, "w = 2 → 8", "s") + t(X(11), y + 44, "w = 3: too much!", "s");
    g += t(280, 168, "guided = plain + w × (spicy − plain) = 2 + w × 3", "b");
    return svg(560, 180, g, "Number line: plain guess 2, spicy guess 5, guidance pushes to 8 and 11");
  };

  /* Latent diffusion: 48 cells of the full image versus 1 cell for the latent. */
  F.lifeShrink48 = () => {
    let g = "";
    for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) {
      const on = r === 0 && c === 0;
      g += `<rect x="${24 + c * 36}" y="${36 + r * 28}" width="34" height="26" rx="3" fill="${on ? H : SOFT}" stroke="${on ? INK : A}" stroke-width="${on ? 2 : 1}"/>`;
    }
    g += t(168, 24, "full image: 786,432 numbers = 48 cells", "b");
    g += t(168, 222, "one highlighted cell = the latent: 16,384 numbers", "s");
    g += arrow(330, 49, 380, 49, INK);
    g += box(388, 30, 160, 82, SH, A) + t(468, 56, "📚 480-page book", "b") + t(468, 76, "↓ squeeze 48×", "s") + t(468, 98, "📝 10 pages of notes", "b");
    g += box(388, 126, 160, 82, SH, G) + t(468, 150, "🧠 do the hard work", "b") + t(468, 170, "on the small version,", "s") + t(468, 190, "then expand at the end", "s");
    return svg(560, 232, g, "Grid of 48 cells with one highlighted, showing the latent is 48 times smaller");
  };

  /* ---------- Week 9 ---------- */
  /* Broken telephone: a message (gradient) halves at every child and vanishes. */
  F.lifeWhispers = () => {
    const base = 168, hmax = 120;
    let g = `<line x1="20" y1="${base}" x2="545" y2="${base}" stroke="${INK}"/>`;
    for (let k = 0; k <= 10; k++) {
      const v = Math.pow(0.5, k), x = 30 + k * 47, h = Math.max(v * hmax, 1.5);
      g += `<rect x="${x}" y="${base - h}" width="30" height="${h}" rx="3" fill="${k ? A : H}" stroke="${k ? A : INK}" opacity="${k ? 0.25 + 0.75 * Math.sqrt(v) : 1}"/>`;
      g += t(x + 15, base + 20, "🧒", "") + t(x + 15, base + 36, k, "s");
      if (k <= 3 || k === 10) g += t(x + 15, base - h - 6, k === 10 ? "0.001" : String(v), "s");
    }
    g += t(30, 26, "each child passes on half: 1 → 0.5 → 0.25 → … → 0.5¹⁰ ≈ 0.001", "b", "start");
    return svg(560, 216, g, "Bars halving across eleven children until almost nothing is left");
  };
})();
