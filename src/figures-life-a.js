/* Pictures for the "In real life" example boxes (one file per group of weeks). Same helpers as figures.js. */
(function () {
  "use strict";
  const F = window.FIGS;
  const { svg, t, box, arrow, curve, A, H, G, B, W, INK, MUTE, RULE, SH, SOFT } = F._h;

  /* ---------- Week 0 ---------- */

  /* Conditional probability: 40 students, 8 with glasses; the front bench has 10 students, 5 with glasses. */
  F.lifeClassGrid = () => {
    const glasses = [[0, 2, 4, 6, 8], [3], [7], [1]];
    let g = box(170, 6, 220, 24, SOFT, A, 6) + t(280, 23, "🧑‍🏫 blackboard", "s");
    g += box(30, 41, 470, 38, SOFT, A, 10);
    [0, 1, 2, 3].forEach((r) => {
      const y = 60 + r * 40;
      for (let c = 0; c < 10; c++) {
        const x = 55 + c * 46, on = glasses[r].includes(c);
        g += `<circle cx="${x}" cy="${y}" r="13" fill="${on ? H : SH}" stroke="${on ? INK : RULE}" stroke-width="1.5"/>`;
        if (on) g += t(x, y + 5, "👓", "s");
      }
    });
    g += t(530, 55, "front", "s") + t(530, 68, "bench", "s");
    g += t(530, 100, "5 of 10", "b");
    g += t(280, 218, "Whole class: 8 of 40 wear glasses, so p(glasses) = 0.2", "s");
    g += t(280, 238, "Front bench only: 5 of 10, so p(glasses | front bench) = 0.5", "b");
    return svg(560, 250, g, "A class of 40 seats in 4 rows; the front row of 10 has 5 students with glasses, the other rows have 3 more");
  };

  /* Bayes: of 108 alarms, only 9 are real frauds. */
  F.lifeFraudBayes = () => {
    let g = t(280, 20, "1,000 payments: 10 frauds and 990 honest ones", "b");
    g += t(280, 40, "The alarm rings 108 times. Each square below is one alarm.", "s");
    for (let i = 0; i < 108; i++) {
      const c = i % 18, r = Math.floor(i / 18), fr = i < 9;
      g += `<rect x="${30 + c * 17}" y="${56 + r * 17}" width="14" height="14" rx="3" fill="${fr ? B : G}" opacity="${fr ? 1 : 0.5}"/>`;
    }
    g += `<rect x="350" y="70" width="14" height="14" rx="3" fill="${B}"/>` + t(372, 82, "9 frauds (90% of 10)", "s", "start");
    g += `<rect x="350" y="98" width="14" height="14" rx="3" fill="${G}" opacity="0.5"/>` + t(372, 110, "99 honest (10% of 990)", "s", "start");
    g += t(350, 142, "9 ÷ 108 ≈ 0.08", "b", "start");
    g += t(280, 190, "p(fraud | alarm) ≈ 0.08: most alarms are false, as honest payments are so common", "s");
    return svg(560, 205, g, "Grid of 108 alarm squares: 9 red frauds and 99 green honest payments");
  };

  /* Same mean, different spread. */
  F.lifeTwoBatters = () => {
    const X = (v) => 120 + v * 3.4;
    const row = (y, name, vals, sd) => {
      let g = `<line x1="${X(0)}" y1="${y}" x2="${X(100)}" y2="${y}" stroke="${RULE}" stroke-width="2"/>`;
      [0, 50, 100].forEach((v) => (g += `<line x1="${X(v)}" y1="${y - 5}" x2="${X(v)}" y2="${y + 5}" stroke="${MUTE}"/>` + t(X(v), y + 20, v, "s")));
      const seen = {};
      vals.forEach((v) => { const k = (seen[v] = (seen[v] || 0) + 1) - 1; g += `<circle cx="${X(v)}" cy="${y - 14 - k * 16}" r="7" fill="${A}"/>`; });
      return g + t(20, y + 4, name, "b", "start") + t(480, y + 4, sd, "b", "start");
    };
    let g = `<line x1="${X(50)}" y1="22" x2="${X(50)}" y2="180" stroke="${H}" stroke-width="2" stroke-dasharray="5 4"/>` + t(X(50), 16, "mean 50 for both", "s");
    g += row(85, "Batter A", [50, 50, 50], "σ = 0");
    g += row(160, "Batter B", [0, 50, 100], "σ ≈ 41");
    return svg(560, 192, g, "Batter A scores 50 three times; batter B scores 0, 50 and 100. Same mean, very different spread");
  };

  /* ---------- Week 1 ---------- */

  /* Batch vs stochastic vs mini-batch as tasting dal. */
  F.lifeTasteDal = () => {
    const pot = (cx, dots, all) => {
      let g = `<path d="M${cx - 70},70 L${cx - 60},128 Q${cx},150 ${cx + 60},128 L${cx + 70},70 Z" fill="${SH}" stroke="${INK}" stroke-width="1.5"/>`;
      g += `<line x1="${cx - 84}" y1="78" x2="${cx - 68}" y2="78" stroke="${INK}" stroke-width="3"/><line x1="${cx + 68}" y1="78" x2="${cx + 84}" y2="78" stroke="${INK}" stroke-width="3"/>`;
      g += `<ellipse cx="${cx}" cy="70" rx="70" ry="16" fill="${W}" opacity="0.55" stroke="${INK}" stroke-width="1.5"/>`;
      if (all) g += `<ellipse cx="${cx}" cy="70" rx="64" ry="12" fill="${A}" opacity="0.45"/>`;
      dots.forEach(([dx, dy]) => (g += `<circle cx="${cx + dx}" cy="${70 + dy}" r="6" fill="${A}" stroke="${INK}"/>`));
      return g;
    };
    const P = [
      [95, "Whole pot", "exact but slow", "batch gradient descent", [], true],
      [280, "One spoon", "quick but noisy", "stochastic (SGD)", [[38, 3]], false],
      [465, "A few spoons", "the usual choice", "mini-batch", [[-42, -2], [-12, 7], [18, -6], [44, 4]], false],
    ];
    let g = t(280, 22, "🥄 each dot is one spoonful tasted; shaded = the whole pot", "s");
    P.forEach(([cx, name, sub, algo, dots, all]) => {
      g += pot(cx, dots, all);
      g += t(cx, 172, name, "b") + t(cx, 190, sub, "s") + t(cx, 208, algo, "s");
    });
    return svg(560, 218, g, "Three pots of dal: tasting the whole pot, one spoon, or a few spoons from different places");
  };

  /* Convolution output size as views of a 10-coach train. */
  F.lifeTrainWindow = () => {
    const x = (i) => 20 + i * 52;
    let g = t(280, 18, "Stride 1: a 3-coach view slides 1 coach at a time, giving 10 − 3 + 1 = 8 views", "s");
    for (let i = 0; i < 10; i++) {
      g += box(x(i), 46, 46, 30, i === 0 ? SOFT : SH, INK, 5) + t(x(i) + 23, 66, i + 1, "s");
      g += `<circle cx="${x(i) + 11}" cy="80" r="4" fill="${INK}"/><circle cx="${x(i) + 35}" cy="80" r="4" fill="${INK}"/>`;
    }
    g += `<rect x="${x(0) - 5}" y="38" width="${2 * 52 + 56}" height="48" rx="8" fill="none" stroke="${A}" stroke-width="3"/>`;
    g += `<rect x="${x(1) - 3}" y="41" width="${2 * 52 + 52}" height="42" rx="8" fill="none" stroke="${A}" stroke-width="2" stroke-dasharray="5 4"/>`;
    for (let k = 0; k < 4; k++) {
      const x1 = x(2 * k), x2 = x(2 * k + 2) + 46;
      g += `<rect x="${x1}" y="${100 + k * 14}" width="${x2 - x1}" height="9" rx="4" fill="${G}" opacity="0.8"/>`;
    }
    g += t(x(9) + 23, 128, "no 5th", "s") + t(x(9) + 23, 141, "view", "s");
    g += t(280, 176, "Stride 2: views start at coaches 1, 3, 5 and 7, giving ⌊7 ÷ 2⌋ + 1 = 4 views", "s");
    return svg(560, 188, g, "A 10-coach train with a 3-coach viewing window; stride 1 gives 8 views, stride 2 gives 4");
  };
})();
