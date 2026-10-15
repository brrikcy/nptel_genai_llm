/* Interactive models, part 3: beginner-friendly models (maths toolkit and intuition builders) */
(function () {
  "use strict";
  const W = (window.WIDGETS = window.WIDGETS || {});
  const U = W._util;
  const C1 = "var(--accent)", C2 = "var(--hi)", C3 = "var(--good)", C4 = "var(--bad)";
  const f2 = (x) => U.f(x, 2), f3 = (x) => U.f(x, 3);

  /* ---------- Week 0 ---------- */

  /* Conditional probability on a grid of 100 emails */
  W.probgrid = (el) => {
    const b = U.box(el, "100 emails: count to get conditional probability", "Each square is an email. Change how many are spam and how often each kind says “WIN”. Then pick a question and watch which squares it counts.");
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("spam", "Spam emails", 5, 95, 1, 40)}${U.range("ws", "% of spam saying WIN", 0, 100, 5, 75)}${U.range("wn", "% of normal saying WIN", 0, 100, 5, 10)}</div>
      ${U.seg("q", [["a", "p(spam)"], ["b", "p(WIN | spam)"], ["c", "p(spam | WIN)"], ["d", "p(spam, WIN)"]], "c")}
      <div class="plot"></div><div class="readout"></div>`);
    const draw = (s) => {
      const S = s.spam, sw = Math.round((S * s.ws) / 100), nw = Math.round(((100 - S) * s.wn) / 100);
      const cells = [];
      for (let i = 0; i < 100; i++) { const spam = i < S; const win = spam ? i < sw : i - S < nw; cells.push({ spam, win }); }
      const inDen = { a: () => true, b: (c) => c.spam, c: (c) => c.win, d: () => true }[s.q];
      const inNum = { a: (c) => c.spam, b: (c) => c.spam && c.win, c: (c) => c.spam && c.win, d: (c) => c.spam && c.win }[s.q];
      let g = "";
      cells.forEach((c, i) => {
        const x = 8 + (i % 20) * 26, y = 8 + Math.floor(i / 20) * 26;
        const den = inDen(c), num = inNum(c);
        g += `<rect x="${x}" y="${y}" width="22" height="22" rx="4" fill="${c.spam ? "color-mix(in srgb, var(--bad) 32%, var(--sheet))" : "color-mix(in srgb, var(--good) 22%, var(--sheet))"}" stroke="${num ? C1 : den ? "var(--ink-2)" : "var(--rule)"}" stroke-width="${num ? 3 : den ? 1.5 : 1}" opacity="${den ? 1 : 0.35}"/>`;
        if (c.win) g += `<text x="${x + 11}" y="${y + 15}" text-anchor="middle" style="font:700 9px var(--f-mono);fill:var(--ink)">W</text>`;
      });
      b.querySelector(".plot").innerHTML = `<svg class="chart" viewBox="0 0 530 140">${g}</svg><div class="legend"><span><i style="background:color-mix(in srgb, var(--bad) 32%, var(--sheet))"></i>spam</span><span><i style="background:color-mix(in srgb, var(--good) 22%, var(--sheet))"></i>normal</span><span>W = says WIN</span><span><i style="background:var(--accent)"></i>counted on top</span></div>`;
      const nWin = sw + nw;
      const txt = {
        a: R`$p(\text{spam}) = \frac{${S}}{100} = ${f3(S / 100)}$`,
        b: R`$p(\text{WIN} \mid \text{spam}) = \frac{${sw}}{${S}} = ${f3(sw / S)}$ — the world shrinks to the ${S} spam emails.`,
        c: nWin ? R`$p(\text{spam} \mid \text{WIN}) = \frac{${sw}}{${nWin}} = ${f3(sw / nWin)}$ — the world shrinks to the ${nWin} emails that say WIN.` : "No email says WIN, so this probability is undefined.",
        d: R`$p(\text{spam}, \text{WIN}) = \frac{${sw}}{100} = ${f3(sw / 100)}$ — both at once, out of everything.`
      }[s.q];
      const bayes = nWin && S ? R`<br>Bayes check: $\frac{p(\text{WIN} \mid \text{spam})\,p(\text{spam})}{p(\text{WIN})} = \frac{${f3(sw / S)} \times ${f3(S / 100)}}{${f3(nWin / 100)}} = ${f3(sw / nWin)}$` : "";
      b.querySelector(".readout").innerHTML = txt + (s.q === "c" ? bayes : "");
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* Exponent and log explorer */
  W.logexp = (el) => {
    const b = U.box(el, "Exponent and log explorer", R`Move $x$. The blue curve is $e^x$, the gold curve is its mirror image, the natural log $\ln x$. Read the penalty $-\ln p$ when $x$ is a probability.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("x", "x", 0.01, 3, 0.01, 0.5)}</div><div class="plot"></div><div class="readout"></div>`);
    const draw = (s) => {
      const p = U.plot({ x0: -3, x1: 3, y0: -3, y1: 3, h: 280 });
      let g = p.frame([-3, -2, -1, 0, 1, 2, 3], [-3, -2, -1, 0, 1, 2, 3]);
      g += `<line x1="${p.X(-3)}" y1="${p.Y(-3)}" x2="${p.X(3)}" y2="${p.Y(3)}" stroke="var(--rule)" stroke-dasharray="4 4"/>`;
      g += p.line(p.path(Math.exp), C1) + p.line(p.path((x) => (x > 0 ? Math.log(x) : NaN), 600), C2);
      g += `<circle cx="${p.X(s.x)}" cy="${p.Y(Math.log(s.x))}" r="5" fill="${C2}"/><circle cx="${p.X(Math.log(s.x))}" cy="${p.Y(s.x)}" r="5" fill="${C1}"/>`;
      b.querySelector(".plot").innerHTML = p.svg(g) + `<div class="legend"><span><i style="background:${C1}"></i>e to the x</span><span><i style="background:${C2}"></i>ln x</span><span>dashed: the mirror line y = x</span></div>`;
      const pr = s.x <= 1 ? R`<br>If $x$ is a probability, the penalty is $-\ln ${f2(s.x)} = ${f3(-Math.log(s.x))}$. ${s.x > 0.8 ? "Small: the model was confident and right." : s.x < 0.2 ? "Large: the model gave the right answer a tiny chance." : ""}` : "";
      b.querySelector(".readout").innerHTML = R`$x = ${f2(s.x)}$ → $\ln x = ${f3(Math.log(s.x))}$, and $e^{\ln x} = ${f2(s.x)}$ again (log undoes exp).<br>$e^{x} = ${f3(Math.exp(s.x))}$` + pr;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* Two vectors, dot product and cosine similarity */
  W.vectors = (el) => {
    const b = U.box(el, "Dot product and cosine similarity", "Turn the two arrows. Watch the dot product: big when they point the same way, zero at a right angle, negative when they point apart.");
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("a", "Angle of a (°)", 0, 360, 5, 30)}${U.range("la", "Length of a", 0.5, 3, 0.1, 2.5)}${U.range("b", "Angle of b (°)", 0, 360, 5, 75)}${U.range("lb", "Length of b", 0.5, 3, 0.1, 2)}</div><div class="plot"></div><div class="readout"></div>`);
    const draw = (s) => {
      const ra = (s.a * Math.PI) / 180, rb = (s.b * Math.PI) / 180;
      const a = [s.la * Math.cos(ra), s.la * Math.sin(ra)], v = [s.lb * Math.cos(rb), s.lb * Math.sin(rb)];
      const dot = a[0] * v[0] + a[1] * v[1], cos = dot / (s.la * s.lb);
      const p = U.plot({ x0: -3.2, x1: 3.2, y0: -3.2, y1: 3.2, w: 320, h: 320, padL: 10, padB: 10 });
      let g = p.frame([], []) + `<line x1="${p.X(-3.2)}" y1="${p.Y(0)}" x2="${p.X(3.2)}" y2="${p.Y(0)}" stroke="var(--rule)"/><line x1="${p.X(0)}" y1="${p.Y(-3.2)}" x2="${p.X(0)}" y2="${p.Y(3.2)}" stroke="var(--rule)"/>`;
      const ar = (u, col, lab) => `<line x1="${p.X(0)}" y1="${p.Y(0)}" x2="${p.X(u[0])}" y2="${p.Y(u[1])}" stroke="${col}" stroke-width="4" stroke-linecap="round"/><circle cx="${p.X(u[0])}" cy="${p.Y(u[1])}" r="6" fill="${col}"/><text x="${p.X(u[0] * 1.12)}" y="${p.Y(u[1] * 1.12) + 4}" text-anchor="middle" style="font-weight:700">${lab}</text>`;
      g += ar(a, C1, "a") + ar(v, C4, "b");
      b.querySelector(".plot").innerHTML = `<div style="max-width:320px;margin:auto">${p.svg(g)}</div>`;
      const verdict = cos > 0.9 ? "almost the same direction: very similar" : cos > 0.2 ? "roughly the same way: somewhat similar" : cos > -0.2 ? "close to a right angle: unrelated" : "pointing apart: opposite";
      b.querySelector(".readout").innerHTML = R`$\mathbf{a} = [${f2(a[0])}, ${f2(a[1])}]$, $\mathbf{b} = [${f2(v[0])}, ${f2(v[1])}]$<br>$\mathbf{a}\cdot\mathbf{b} = ${f2(a[0])} \times ${f2(v[0])} + ${f2(a[1])} \times ${f2(v[1])} = ${f3(dot)}$<br>cosine similarity $= \frac{\mathbf{a}\cdot\mathbf{b}}{\|\mathbf{a}\|\,\|\mathbf{b}\|} = ${f3(cos)}$ → <b>${verdict}</b>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* Gradient descent on a parabola */
  W.slope = (el) => {
    const b = U.box(el, "Rolling downhill: gradient descent", R`The loss is $L(w) = w^2$. Pick a learning rate and press Step. Try 0.05 (slow), 0.4 (good), 0.9 (zig-zag) and 1.05 (blows up).`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("lr", "Learning rate", 0.05, 1.1, 0.05, 0.3)}${U.range("w0", "Starting w", -4, 4, 0.5, 3.5)}</div>
      <div class="row"><button class="btn small" data-act="step">Step</button><button class="btn quiet small" data-act="run">Run 10 steps</button><button class="btn ghost small" data-act="reset">Reset</button></div><div class="plot"></div><div class="readout"></div>`);
    let path = [];
    const draw = (s) => {
      if (!path.length) path = [s.w0];
      const p = U.plot({ x0: -5, x1: 5, y0: 0, y1: 25, h: 260 });
      let g = p.frame([-4, -2, 0, 2, 4], [0, 10, 20], "w", "loss") + p.line(p.path((x) => x * x), "var(--ink-2)");
      path.forEach((w, i) => { if (i) g += `<line x1="${p.X(path[i - 1])}" y1="${p.Y(Math.min(25, path[i - 1] ** 2))}" x2="${p.X(w)}" y2="${p.Y(Math.min(25, w * w))}" stroke="${C2}" stroke-width="2" clip-path="url(#${p.cid})"/>`; });
      const w = path[path.length - 1];
      g += `<circle cx="${p.X(Math.max(-5, Math.min(5, w)))}" cy="${p.Y(Math.min(25, w * w))}" r="8" fill="${C1}"/>`;
      b.querySelector(".plot").innerHTML = p.svg(g);
      const k = path.length - 1, sl = 2 * w;
      const msg = Math.abs(w) > 50 ? "Diverged: each step overshoots further. The learning rate is too big." : Math.abs(w) < 0.01 ? "Arrived at the bottom." : "";
      b.querySelector(".readout").innerHTML = R`step ${k}: $w = ${f3(w)}$, loss $= ${f3(w * w)}$, slope $= 2w = ${f3(sl)}$<br>next: $w - \eta \times \text{slope} = ${f3(w)} - ${f2(s.lr)} \times ${f3(sl)} = ${f3(w - s.lr * sl)}$ ${msg}`;
    };
    const st = U.bind(b, (s) => { path = []; draw(s); });
    b.addEventListener("click", (e) => {
      const a = e.target.closest("[data-act]"); if (!a) return;
      const n = a.dataset.act === "run" ? 10 : a.dataset.act === "step" ? 1 : 0;
      if (!n) path = []; else for (let i = 0; i < n; i++) { const w = path[path.length - 1]; if (Math.abs(w) > 1e6) break; path.push(w - st.lr * 2 * w); }
      draw(st);
    });
    draw(st);
  };

  /* Bell curve with sampling */
  W.bell = (el) => {
    const b = U.box(el, "The bell curve: centre, spread and sampling", R`Slide the mean and the standard deviation. Press Sample to draw 200 random values with $z = \mu + \sigma\varepsilon$ and see them pile up into the bell shape.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("mu", R`Mean $\mu$`, -3, 3, 0.1, 0)}${U.range("sd", R`Standard deviation $\sigma$`, 0.3, 2.5, 0.1, 1)}</div><div class="row"><button class="btn small" data-act="s">Sample 200</button><button class="btn ghost small" data-act="c">Clear</button></div><div class="plot"></div><div class="readout"></div>`);
    let samples = []; const r = U.rng(7);
    const draw = (s) => {
      const p = U.plot({ x0: -6, x1: 6, y0: 0, y1: 1.4, h: 250 });
      let g = p.frame([-6, -4, -2, 0, 2, 4, 6], [0, 0.5, 1]);
      if (samples.length) {
        const bins = new Array(48).fill(0); samples.forEach((x) => { const k = Math.floor((x + 6) / 0.25); if (k >= 0 && k < 48) bins[k]++; });
        bins.forEach((c, k) => { const h = c / samples.length / 0.25; g += `<rect x="${p.X(-6 + k * 0.25) + 1}" y="${p.Y(h)}" width="${p.X(0.25) - p.X(0) - 2}" height="${p.Y(0) - p.Y(h)}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width=".6"/>`; });
      }
      g += `<rect x="${p.X(s.mu - s.sd)}" y="${p.padT}" width="${p.X(s.mu + s.sd) - p.X(s.mu - s.sd)}" height="${p.h - p.padT - p.padB}" fill="${C2}" opacity=".12"/>`;
      g += p.line(p.path((x) => U.npdf(x, s.mu, s.sd)), C1);
      b.querySelector(".plot").innerHTML = p.svg(g);
      const inside = samples.filter((x) => Math.abs(x - s.mu) <= s.sd).length;
      const m = samples.length ? samples.reduce((a, x) => a + x, 0) / samples.length : 0;
      b.querySelector(".readout").innerHTML = R`$\mathcal{N}(\mu = ${f2(s.mu)},\ \sigma^2 = ${f2(s.sd * s.sd)})$. Shaded band: $\mu \pm \sigma$.` + (samples.length ? R`<br>${samples.length} samples · their average $= ${f2(m)}$ · inside the band: ${Math.round((100 * inside) / samples.length)}% (theory says about 68%)` : "");
    };
    const st = U.bind(b, (s) => { samples = []; draw(s); });
    b.addEventListener("click", (e) => { const a = e.target.closest("[data-act]"); if (!a) return; if (a.dataset.act === "c") samples = []; else for (let i = 0; i < 200; i++) samples.push(st.mu + st.sd * U.gauss(r)); draw(st); });
    draw(st);
  };

  /* ---------- Week 1 ---------- */

  /* A single neuron with two inputs */
  W.neuron = (el) => {
    const b = U.box(el, "Build one neuron", "Set the two inputs, their weights and the bias, then choose the activation. Watch the weighted sum z and the output a change.");
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("x1", R`Input $x_1$`, -3, 3, 0.5, 2)}${U.range("x2", R`Input $x_2$`, -3, 3, 0.5, 1)}${U.range("w1", R`Weight $w_1$`, -2, 2, 0.1, 0.5)}${U.range("w2", R`Weight $w_2$`, -2, 2, 0.1, -1)}${U.range("b", R`Bias $b$`, -3, 3, 0.1, 0.5)}</div>
      ${U.seg("f", [["relu", "ReLU"], ["sigmoid", "Sigmoid"], ["tanh", "Tanh"], ["linear", "Linear"]], "relu")}<div class="plot"></div><div class="readout"></div>`);
    const F = { relu: (z) => Math.max(0, z), sigmoid: (z) => 1 / (1 + Math.exp(-z)), tanh: Math.tanh, linear: (z) => z };
    const N = { relu: R`\max(0, z)`, sigmoid: R`\frac{1}{1+e^{-z}}`, tanh: R`\tanh(z)`, linear: "z" };
    const draw = (s) => {
      const z = s.w1 * s.x1 + s.w2 * s.x2 + s.b, a = F[s.f](z);
      const col = (v) => (v > 0 ? "var(--good)" : v < 0 ? "var(--bad)" : "var(--ink-2)");
      const g = `<line x1="70" y1="50" x2="240" y2="100" stroke="${col(s.w1)}" stroke-width="${1 + Math.abs(s.w1) * 3}"/><line x1="70" y1="150" x2="240" y2="100" stroke="${col(s.w2)}" stroke-width="${1 + Math.abs(s.w2) * 3}"/>
        <circle cx="50" cy="50" r="24" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="50" y="55" text-anchor="middle">${s.x1}</text>
        <circle cx="50" cy="150" r="24" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="50" y="155" text-anchor="middle">${s.x2}</text>
        <text x="150" y="62" text-anchor="middle">× ${s.w1}</text><text x="150" y="148" text-anchor="middle">× ${s.w2}</text>
        <circle cx="265" cy="100" r="32" fill="var(--hi-soft)" stroke="var(--ink)"/><text x="265" y="96" text-anchor="middle">z =</text><text x="265" y="114" text-anchor="middle">${U.f(z, 2)}</text>
        <line x1="297" y1="100" x2="360" y2="100" stroke="var(--ink-2)" stroke-width="2"/><rect x="360" y="78" width="90" height="44" rx="8" fill="var(--sheet)" stroke="var(--accent)"/><text x="405" y="105" text-anchor="middle">${s.f}</text>
        <line x1="450" y1="100" x2="490" y2="100" stroke="var(--ink-2)" stroke-width="2"/><circle cx="515" cy="100" r="24" fill="${a > 0 ? "var(--good-soft)" : "var(--sheet-2)"}" stroke="var(--ink)"/><text x="515" y="105" text-anchor="middle">${U.f(a, 2)}</text>
        <text x="265" y="160" text-anchor="middle" style="fill:var(--ink-2)">bias ${s.b}</text>`;
      b.querySelector(".plot").innerHTML = `<svg class="chart" viewBox="0 0 560 190">${g}</svg><div class="legend"><span><i style="background:var(--good)"></i>positive weight</span><span><i style="background:var(--bad)"></i>negative weight</span><span>thicker = bigger</span></div>`;
      b.querySelector(".readout").innerHTML = R`$z = w_1 x_1 + w_2 x_2 + b = (${s.w1})(${s.x1}) + (${s.w2})(${s.x2}) + (${s.b}) = ${U.f(z, 3)}$<br>$a = ${N[s.f]} = ${U.f(a, 3)}$` + (s.f === "relu" && z < 0 ? "<br>ReLU turned the negative sum into 0: this neuron is silent for these inputs." : "");
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* Softmax bar chart */
  W.softmaxbars = (el) => {
    const b = U.box(el, "Softmax: scores in, probabilities out", "Drag the four scores (logits). Softmax makes every bar positive and the bars always add up to 1. Raise one score and watch it steal probability from the others.");
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${["cat", "dog", "bird", "fish"].map((n, i) => U.range("z" + i, `Score for ${n}`, -3, 5, 0.1, [2, 1, 0, -1][i])).join("")}</div><div class="plot"></div><div class="readout"></div>`);
    const names = ["cat", "dog", "bird", "fish"];
    const draw = (s) => {
      const z = [s.z0, s.z1, s.z2, s.z3], e = z.map(Math.exp), tot = e.reduce((a, x) => a + x, 0), pr = e.map((x) => x / tot);
      let g = "";
      pr.forEach((q, i) => { const x = 40 + i * 125; g += `<rect x="${x}" y="${190 - q * 170}" width="80" height="${q * 170}" rx="4" fill="${i === pr.indexOf(Math.max(...pr)) ? "var(--accent)" : "var(--accent-soft)"}" stroke="var(--accent)"/><text x="${x + 40}" y="${183 - q * 170}" text-anchor="middle">${U.f(q, 3)}</text><text x="${x + 40}" y="208" text-anchor="middle">${names[i]}</text>`; });
      b.querySelector(".plot").innerHTML = `<svg class="chart" viewBox="0 0 540 215"><line x1="20" y1="190" x2="530" y2="190" stroke="var(--ink)"/>${g}</svg>`;
      b.querySelector(".readout").innerHTML = R`$e^{z}$: ${e.map((x) => U.f(x, 2)).join(", ")} · total $= ${U.f(tot, 2)}$<br>probabilities $= \frac{e^{z_k}}{${U.f(tot, 2)}}$ → ${pr.map((x, i) => `${names[i]} ${U.f(x, 3)}`).join(", ")} · sum $= 1$<br>Cross-entropy loss if the true answer is cat: $-\ln ${U.f(pr[0], 3)} = ${U.f(-Math.log(pr[0]), 3)}$`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* An image is a grid of numbers */
  W.pixels = (el) => {
    const b = U.box(el, "To a computer, a picture is a grid of numbers", "Click squares to paint them. Each square is one pixel: 0 = black, 255 = white. The network never sees the drawing, only the numbers on the right.");
    b.insertAdjacentHTML("beforeend", `${U.seg("v", [["255", "paint white (255)"], ["128", "paint grey (128)"], ["0", "paint black (0)"]], "255")}<div class="row" style="align-items:flex-start;gap:18px"><div class="pgrid"></div><div class="pnum"></div></div><div class="readout"></div>`);
    const n = 8; const img = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => ((r === 2 || r === 5) && c > 1 && c < 6) || (r > 1 && r < 6 && (c === 2 || c === 5)) ? 255 : 0));
    let st;
    const draw = () => {
      b.querySelector(".pgrid").innerHTML = `<svg viewBox="0 0 ${n * 26} ${n * 26}" style="width:210px;max-width:100%;cursor:pointer;border-radius:6px">${img.map((row, r) => row.map((v, c) => `<rect data-r="${r}" data-c="${c}" x="${c * 26}" y="${r * 26}" width="25" height="25" fill="rgb(${v},${v},${v})" stroke="var(--rule)"/>`).join("")).join("")}</svg>`;
      b.querySelector(".pnum").innerHTML = `<div class="grid-cells" style="grid-template-columns:repeat(${n},30px)">${img.flat().map((v) => `<span>${v}</span>`).join("")}</div>`;
      const flat = img.flat();
      b.querySelector(".readout").innerHTML = R`This $8 \times 8$ grey image is ${n * n} numbers. Flattened into one list (a vector): $[${flat.slice(0, 10).join(", ")}, \ldots]$ — dimension ${n * n}.<br>Scaled to $[0, 1]$ by dividing by 255 (what we feed a network): ${flat.slice(0, 6).map((v) => U.f(v / 255, 2)).join(", ")}, …<br>A colour photo has 3 such grids (red, green, blue): a $28 \times 28$ colour image is $28 \times 28 \times 3 = 2{,}352$ numbers.`;
    };
    st = U.bind(b, () => {});
    b.addEventListener("click", (e) => { const r = e.target.closest("rect[data-r]"); if (!r) return; img[+r.dataset.r][+r.dataset.c] = +st.v; draw(); });
    draw();
  };

  /* ---------- Week 2 ---------- */

  /* Noise types, a neighbour rule, and a repair that knows what pictures look like */
  W.noisefix = (el) => {
    const b = U.box(el, "Damage a picture, then repair it", "Pick a picture, a noise type and an amount. The middle repair uses a simple neighbour rule. The right repair imitates a trained denoising autoencoder: it has learned what the training pictures look like, so it pulls the damaged image back to the closest clean one.");
    b.insertAdjacentHTML("beforeend", `${U.seg("img", [["0", "Smile"], ["1", "Heart"], ["2", "House"], ["3", "Letter A"]], "0")} ${U.seg("t", [["mask", "Masking (set to 0)"], ["sp", "Salt-and-pepper"], ["gauss", "Gaussian"]], "sp")}<div class="ctrls">${U.range("q", "Amount of noise", 0, 0.5, 0.05, 0.25)}</div>
      <div class="row" style="gap:14px;align-items:flex-start">${[["damaged", "damaged input"], ["rule", "neighbour rule"], ["ae", "AE-style repair"]].map(([k, n]) => `<div><div class="eyebrow">${n}</div><canvas width="132" height="132" class="wcanvas c-${k}" style="width:132px;margin-top:6px"></canvas></div>`).join("")}</div><div class="readout"></div>`);
    const N = 12;
    const pics = [
      (x, y) => { const r = Math.hypot(x, y); return (r < 1 && r > 0.72) || Math.hypot(x + 0.33, y + 0.28) < 0.18 || Math.hypot(x - 0.33, y + 0.28) < 0.18 || (y > 0.1 && y < 0.6 && Math.abs(x) < 0.5 && Math.abs(y - (0.5 - 0.6 * x * x)) < 0.15); },
      (x, y) => { const yy = -y + 0.25; return (x * x + yy * yy - 0.5) ** 3 - x * x * yy ** 3 * 1.2 < 0; },
      (x, y) => (y > 0 && y < 0.9 && Math.abs(x) < 0.7 && !(Math.abs(x - 0.05) < 0.18 && y > 0.4)) || (y <= 0 && y > -0.85 && Math.abs(x) < 0.85 * (1 + y / 0.85) + 0.05),
      (x, y) => { const l = Math.abs(x - (y - 0.9) * 0.45), r = Math.abs(x + (y - 0.9) * 0.45); return y > -0.95 && y < 0.95 && (l < 0.17 || r < 0.17 || (Math.abs(y - 0.25) < 0.12 && Math.abs(x) < 0.4)); }
    ].map((f) => { const a = []; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) a.push(f((j - 5.5) / 5.5, (i - 5.5) / 5.5) ? 1 : 0); return a; });
    const C = 132 / N;
    const paint = (cv, a) => { const ctx = cv.getContext("2d"); ctx.fillStyle = U.css("--sheet-2"); ctx.fillRect(0, 0, 132, 132); ctx.fillStyle = U.css("--ink"); a.forEach((v, i) => { ctx.globalAlpha = Math.max(0, Math.min(1, v)); ctx.fillRect((i % N) * C, Math.floor(i / N) * C, C, C); }); ctx.globalAlpha = 1; };
    const mse = (a, c) => a.reduce((t, v, i) => t + (v - c[i]) ** 2, 0) / a.length;
    const draw = (s) => {
      const clean = pics[+s.img], r = U.rng(11 + +s.img);
      const noisy = clean.map((v) => s.t === "mask" ? (r() < s.q ? 0 : v) : s.t === "sp" ? (r() < s.q ? (r() < 0.5 ? 0 : 1) : v) : v + 1.2 * s.q * U.gauss(r));
      const nbs = (a, i) => { const y = Math.floor(i / N), x = i % N, nb = []; for (let d = -1; d <= 1; d++) for (let c = -1; c <= 1; c++) { if (!d && !c) continue; const yy = y + d, xx = x + c; if (yy >= 0 && yy < N && xx >= 0 && xx < N) nb.push(a[yy * N + xx]); } return nb; };
      const rule = noisy.map((v, i) => { const nb = nbs(noisy, i), on = nb.filter((u) => u > 0.5).length; if (s.t === "gauss") return Math.max(0, Math.min(1, (v + nb.reduce((t, u) => t + u, 0)) / (nb.length + 1))); return on >= nb.length - 2 ? 1 : nb.length - on >= nb.length - 2 ? 0 : Math.max(0, Math.min(1, v)); });
      const dists = pics.map((pc) => mse(noisy, pc)); const best = dists.indexOf(Math.min(...dists));
      paint(b.querySelector(".c-damaged"), noisy); paint(b.querySelector(".c-rule"), rule); paint(b.querySelector(".c-ae"), pics[best]);
      b.querySelector(".readout").innerHTML = R`Error against the clean picture (MSE): damaged $${U.f(mse(noisy, clean), 3)}$ · neighbour rule $${U.f(mse(rule, clean), 3)}$ · AE-style $${U.f(mse(pics[best], clean), 3)}$<br>` + (s.t === "mask" ? R`Masking with $q = ${s.q}$: on average $${N * N} \times ${s.q} = ${U.f(N * N * s.q, 1)}$ of the ${N * N} pixels are set to 0.` : s.t === "sp" ? "Salt-and-pepper: random pixels jump to pure white or pure black." : R`Gaussian: every pixel gets a random $\varepsilon \sim \mathcal{N}(0, \sigma^2)$ added.`) + `<br><span class="muted">The neighbour rule only knows “pixels next to each other are usually alike”. The AE-style repair knows the shapes it was trained on, which is what a denoising autoencoder learns. Push the noise very high and even it can pick the wrong picture.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* Sparsity KL penalty for one hidden unit */
  W.sparsekl = (el) => {
    const b = U.box(el, "The sparsity penalty for one unit", R`Set the target activity $\rho$ and the unit's actual average activity $\hat{\rho}$. The penalty is zero only when they match, and it grows quickly when the unit fires too often.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("rho", R`Target $\rho$`, 0.01, 0.5, 0.01, 0.1)}${U.range("rh", R`Actual $\hat{\rho}$`, 0.01, 0.99, 0.01, 0.2)}</div><div class="plot"></div><div class="readout"></div>`);
    const kl = (r, q) => r * Math.log(r / q) + (1 - r) * Math.log((1 - r) / (1 - q));
    const draw = (s) => {
      const p = U.plot({ x0: 0, x1: 1, y0: 0, y1: 2, h: 220 });
      let g = p.frame([0, 0.25, 0.5, 0.75, 1], [0, 1, 2], "actual ρ̂", "penalty") + p.line(p.path((q) => (q > 0.001 && q < 0.999 ? kl(s.rho, q) : NaN), 400), C1);
      g += `<line x1="${p.X(s.rho)}" y1="${p.padT}" x2="${p.X(s.rho)}" y2="${p.h - p.padB}" stroke="${C3}" stroke-dasharray="4 4"/><circle cx="${p.X(s.rh)}" cy="${p.Y(Math.min(2, kl(s.rho, s.rh)))}" r="6" fill="${C2}"/>`;
      b.querySelector(".plot").innerHTML = p.svg(g);
      const t1 = s.rho * Math.log(s.rho / s.rh), t2 = (1 - s.rho) * Math.log((1 - s.rho) / (1 - s.rh));
      b.querySelector(".readout").innerHTML = R`$${s.rho} \ln\frac{${s.rho}}{${s.rh}} + ${U.f(1 - s.rho, 2)} \ln\frac{${U.f(1 - s.rho, 2)}}{${U.f(1 - s.rh, 2)}} = ${U.f(t1, 4)} + ${U.f(t2, 4)} = ${U.f(t1 + t2, 4)}$`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* ---------- Week 3 ---------- */

  /* KL divergence between two discrete distributions, term by term */
  W.klbars = (el) => {
    const b = U.box(el, "KL divergence with bar charts", R`Drag the sliders to shape the true distribution $P$ (blue) and the model $Q$ (gold) over 3 outcomes. Each outcome adds $p \log_2\frac{p}{q}$ to the KL. Make $Q$ match $P$ and the KL drops to 0.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("p1", "P: outcome A", 1, 10, 1, 5)}${U.range("p2", "P: outcome B", 1, 10, 1, 3)}${U.range("p3", "P: outcome C", 1, 10, 1, 2)}${U.range("q1", "Q: outcome A", 1, 10, 1, 3)}${U.range("q2", "Q: outcome B", 1, 10, 1, 3)}${U.range("q3", "Q: outcome C", 1, 10, 1, 4)}</div><div class="plot"></div><div class="readout"></div>`);
    const draw = (s) => {
      const pr = [s.p1, s.p2, s.p3], qr = [s.q1, s.q2, s.q3]; const sp = pr.reduce((a, x) => a + x, 0), sq = qr.reduce((a, x) => a + x, 0);
      const P = pr.map((x) => x / sp), Q = qr.map((x) => x / sq);
      const terms = P.map((p, i) => p * Math.log2(p / Q[i])), kl = terms.reduce((a, x) => a + x, 0), rev = Q.reduce((a, q, i) => a + q * Math.log2(q / P[i]), 0);
      let g = `<line x1="20" y1="180" x2="540" y2="180" stroke="var(--ink)"/>`;
      ["A", "B", "C"].forEach((n, i) => { const x = 50 + i * 170; g += `<rect x="${x}" y="${180 - P[i] * 220}" width="50" height="${P[i] * 220}" fill="var(--accent)" rx="3"/><rect x="${x + 56}" y="${180 - Q[i] * 220}" width="50" height="${Q[i] * 220}" fill="var(--hi)" rx="3"/><text x="${x + 25}" y="${174 - P[i] * 220}" text-anchor="middle">${U.f(P[i], 2)}</text><text x="${x + 81}" y="${174 - Q[i] * 220}" text-anchor="middle">${U.f(Q[i], 2)}</text><text x="${x + 53}" y="198" text-anchor="middle">${n}: ${terms[i] >= 0 ? "+" : ""}${U.f(terms[i], 3)}</text>`; });
      b.querySelector(".plot").innerHTML = `<svg class="chart" viewBox="0 0 560 205">${g}</svg><div class="legend"><span><i style="background:var(--accent)"></i>P (truth)</span><span><i style="background:var(--hi)"></i>Q (model)</span><span>number under each pair: its KL term</span></div>`;
      b.querySelector(".readout").innerHTML = R`$P = [${P.map((x) => U.f(x, 2)).join(", ")}]$, $Q = [${Q.map((x) => U.f(x, 2)).join(", ")}]$ (each bar is its slider value divided by the total)<br>$D_{\mathrm{KL}}(P \,\|\, Q) = ${terms.map((x) => U.f(x, 3)).join(" + ").replace(/\+ -/g, "- ")} = ${U.f(kl, 4)}$ bits<br>$D_{\mathrm{KL}}(Q \,\|\, P) = ${U.f(rev, 4)}$ bits ${Math.abs(kl - rev) > 1e-4 ? "← a different number: KL is not symmetric" : ""}<br><span class="muted">Single terms can be negative, but the total is never below 0.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };
})();
