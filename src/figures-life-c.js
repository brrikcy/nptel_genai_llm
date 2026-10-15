/* Pictures for the "In real life" example boxes (one file per group of weeks). Same helpers as figures.js. */
(function () {
  "use strict";
  const F = window.FIGS;
  const { svg, t, box, arrow, curve, A, H, G, B, W, INK, MUTE, RULE, SH, SOFT } = F._h;

  /* Week 4: linear interpolation as a train journey from Delhi (z1) to Mumbai (z2). */
  F.lifeTrainAlpha = () => {
    const X = (a) => 60 + a * 440, km = ["0", "350", "700", "1,050", "1,400"];
    let g = `<line x1="${X(0)}" y1="95" x2="${X(1)}" y2="95" stroke="${INK}" stroke-width="4"/>`;
    for (let i = 0; i <= 22; i++) g += `<line x1="${X(0) + i * 20}" y1="88" x2="${X(0) + i * 20}" y2="102" stroke="${RULE}" stroke-width="2"/>`;
    [0, 0.25, 0.5, 0.75, 1].forEach((a, i) => {
      const end = a === 0 || a === 1;
      g += `<circle cx="${X(a)}" cy="95" r="${end ? 10 : 7}" fill="${end ? A : SOFT}" stroke="${INK}" stroke-width="1.5"/>`;
      g += t(X(a), 125, "α = " + a, "b") + t(X(a), 143, "km " + km[i], "s");
    });
    g += t(X(0), 60, "Delhi = z₁", "b") + t(X(1), 60, "Mumbai = z₂", "b");
    g += `<text x="${X(0.25)}" y="80" text-anchor="middle" style="font-size:24px">🚆</text>` + t(X(0.25), 40, "stop at α = 0.25", "s");
    g += t(280, 172, "position = (1 − α) × 0 + α × 1,400   →   at α = 0.25: 350 km", "s");
    return svg(560, 185, g, "A train line from Delhi to Mumbai with stops at alpha 0, 0.25, 0.5, 0.75 and 1");
  };

  /* Week 4: slerp as a flight path over the globe versus a tunnel through it. */
  F.lifeGreatCircle = () => {
    const cx = 230, cy = 170, r = 125, s = Math.sin((55 * Math.PI) / 180), c = Math.cos((55 * Math.PI) / 180);
    const ax = cx - r * s, bx = cx + r * s, y = cy - r * c;
    return svg(560, 305, `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${SOFT}" stroke="${RULE}" stroke-width="2"/>
      <path d="M${ax.toFixed(1)},${y.toFixed(1)} A${r},${r} 0 0 1 ${bx.toFixed(1)},${y.toFixed(1)}" fill="none" stroke="${G}" stroke-width="4"/>
      <line x1="${ax}" y1="${y}" x2="${bx}" y2="${y}" stroke="${B}" stroke-width="3" stroke-dasharray="7 5"/>
      <circle cx="${cx}" cy="${cy}" r="4" fill="${INK}"/>${t(cx, cy + 18, "centre", "s")}
      <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r}" stroke="${MUTE}" stroke-width="1.5" stroke-dasharray="3 3"/>
      <circle cx="${cx}" cy="${cy - r}" r="6" fill="${G}"/><circle cx="${cx}" cy="${y}" r="6" fill="${B}"/>
      <circle cx="${ax}" cy="${y}" r="7" fill="${A}"/><circle cx="${bx}" cy="${y}" r="7" fill="${A}"/>
      ${t(ax - 10, y - 8, "Delhi = z₁", "b", "end")}${t(bx + 10, y - 8, "London = z₂", "b", "start")}
      <text x="${cx}" y="${cy - r - 12}" text-anchor="middle" style="font-size:20px">✈️</text>
      ${t(390, 40, "slerp: fly along the surface", "b", "start")}${t(390, 58, "midpoint stays at the usual", "s", "start")}${t(390, 74, "distance from the centre", "s", "start")}
      ${t(390, 150, "straight line: a tunnel", "b", "start")}${t(390, 168, "its midpoint sits much", "s", "start")}${t(390, 184, "closer to the centre", "s", "start")}
      ${arrow(385, 46, cx + r * 0.5 + 6, cy - r * 0.866 - 2, G)}${arrow(385, 156, cx + 12, y + 6, B)}
      ${t(390, 250, "the surface = the “shell”", "s", "start")}${t(390, 266, "where almost all Gaussian", "s", "start")}${t(390, 282, "codes live", "s", "start")}`, "A globe: the flight arc between two cities versus the straight tunnel between them");
  };

  /* Week 5: a batsman's correct reads fall to 50% as a spinner learns to disguise his deliveries. */
  F.lifeBatsmanGuess = () => {
    const d = [95, 92, 85, 78, 70, 63, 58, 54, 51, 50], X = (i) => 80 + i * 48, Y = (p) => 195 - (p - 40) * 2.6;
    let g = `<line x1="70" y1="${Y(40)}" x2="530" y2="${Y(40)}" stroke="${RULE}"/><line x1="70" y1="${Y(40)}" x2="70" y2="${Y(100)}" stroke="${RULE}"/>`;
    [50, 75, 100].forEach((p) => (g += t(62, Y(p) + 4, p + "%", "s", "end")));
    g += `<line x1="70" y1="${Y(50)}" x2="530" y2="${Y(50)}" stroke="${W}" stroke-width="2" stroke-dasharray="6 5"/>` + t(528, Y(50) + 18, "coin toss: 50%, like D = ½", "s", "end");
    g += `<path d="${d.map((p, i) => (i ? "L" : "M") + X(i) + "," + Y(p).toFixed(1)).join("")}" fill="none" stroke="${A}" stroke-width="3"/>`;
    g += d.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p).toFixed(1)}" r="5" fill="${i === 9 ? H : A}" stroke="${INK}" stroke-width="1"/>` + t(X(i), Y(40) + 18, i + 1, "s")).join("");
    g += t(300, 236, "over number (the spinner keeps improving his disguise)", "s") + t(80, 24, "🏏 batsman's correct reads of googly vs leg-break", "b", "start");
    return svg(560, 245, g, "Line chart: the batsman's correct guesses fall from 95 percent to 50 percent over ten overs");
  };

  /* Week 5: a transposed convolution as rubber stamps on a paper strip (n = 4, f = 4, s = 2, p = 1). */
  F.lifeStampStrip = () => {
    const x0 = 120, cw = 38, cols = [SOFT, H, SOFT, H];
    let g = t(108, 37, "4 inputs", "s", "end") + t(108, 98, "4 stamps, 4 wide,", "s", "end") + t(108, 112, "2 cells apart", "s", "end") + t(108, 179, "output strip", "s", "end");
    ["a", "b", "c", "d"].forEach((n, i) => {
      const cx = x0 + (2 * i + 2) * cw;
      g += box(cx - 19, 18, 38, 28, SH, INK, 6) + t(cx, 37, n, "b");
      g += `<line x1="${cx}" y1="46" x2="${cx}" y2="${62 + i * 20}" stroke="${MUTE}" stroke-width="1.5"/>`;
      g += `<rect x="${x0 + 2 * i * cw + 2}" y="${62 + i * 20}" width="${4 * cw - 4}" height="15" rx="4" fill="${cols[i]}" stroke="${INK}" stroke-width="1"/>`;
    });
    for (let k = 0; k < 10; k++) {
      const trim = k === 0 || k === 9;
      g += `<rect x="${x0 + k * cw}" y="162" width="${cw}" height="28" fill="${trim ? "none" : SOFT}" stroke="${trim ? B : INK}" stroke-width="1.5" ${trim ? 'stroke-dasharray="4 3"' : ""}/>`;
      g += t(x0 + k * cw + cw / 2, 181, trim ? "✂" : k, trim ? "b" : "s");
    }
    g += t(x0 + 5 * cw, 214, "(4 − 1) × 2 + 4 = 10 cells, trim 1 from each end (padding 1) → 8", "s");
    return svg(560, 225, g, "Four inputs each stamp a four-cell pattern onto a strip, two cells apart, giving ten cells; trimming one at each end leaves eight");
  };

  /* Week 6: StyleGAN's coarse, middle and fine layers as stages of building a house. */
  F.lifeHouseScales = () => {
    const house = (ox, stage) => {
      let g = `<path d="M${ox + 20},80 L${ox + 75},40 L${ox + 130},80 Z" fill="${stage === 3 ? H : "none"}" stroke="${INK}" stroke-width="2"/>`;
      g += `<rect x="${ox + 28}" y="80" width="94" height="80" fill="${stage === 3 ? SOFT : "none"}" stroke="${INK}" stroke-width="2"/><line x1="${ox + 28}" y1="120" x2="${ox + 122}" y2="120" stroke="${stage === 1 ? INK : RULE}" stroke-width="1.5"/>`;
      if (stage >= 2) {
        [[40, 90], [88, 90], [40, 130]].forEach(([x, y]) => (g += `<rect x="${ox + x}" y="${y}" width="22" height="20" fill="${SH}" stroke="${INK}" stroke-width="1.5"/>`));
        g += `<rect x="${ox + 86}" y="128" width="22" height="32" fill="${SH}" stroke="${INK}" stroke-width="1.5"/>`;
      }
      if (stage === 3) {
        [[40, 90], [88, 90], [40, 130]].forEach(([x, y]) => (g += `<path d="M${ox + x + 2},${y + 2} Q${ox + x + 7},${y + 12} ${ox + x + 3},${y + 19} M${ox + x + 20},${y + 2} Q${ox + x + 15},${y + 12} ${ox + x + 19},${y + 19}" fill="none" stroke="${B}" stroke-width="1.5"/>`));
        g += `<circle cx="${ox + 103}" cy="145" r="2.5" fill="${INK}"/>`;
      }
      return g;
    };
    return svg(560, 225, `
      ${house(15, 1)}${house(205, 2)}${house(395, 3)}
      ${arrow(165, 120, 222, 120, MUTE)}${arrow(355, 120, 412, 120, MUTE)}
      ${t(90, 185, "coarse (4² – 8²)", "b")}${t(90, 203, "shape, number of floors", "s")}
      ${t(280, 185, "middle (16² – 32²)", "b")}${t(280, 203, "doors and windows", "s")}
      ${t(470, 185, "fine (64² – 1024²)", "b")}${t(470, 203, "paint, curtains, handle", "s")}`, "Three stages of a house: outline, then doors and windows, then paint and curtains");
  };
})();
