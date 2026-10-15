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

  /* ---------- Week 4 ---------- */

  /* Two latent knobs controlling a face: entangled or disentangled */
  W.latentfaces = (el) => {
    const b = U.box(el, "Two knobs, one face: entangled or disentangled?", R`The decoder turns two latent numbers $z_1, z_2$ into a face. In the disentangled decoder, $z_1$ only changes the smile and $z_2$ only changes the eye size. Switch to entangled and each knob changes several things at once.`);
    b.insertAdjacentHTML("beforeend", `${U.seg("m", [["dis", "Disentangled decoder"], ["ent", "Entangled decoder"]], "dis")}<div class="ctrls">${U.range("z1", R`$z_1$`, -2, 2, 0.1, 0.5)}${U.range("z2", R`$z_2$`, -2, 2, 0.1, 0)}</div><div class="plot"></div><div class="readout"></div>`);
    const draw = (s) => {
      let smile, eye, tilt, hue;
      if (s.m === "dis") { smile = s.z1 / 2; eye = 0.1 + 0.05 * s.z2; tilt = 0; hue = 0; }
      else { smile = (s.z1 - s.z2) / 3; eye = 0.1 + 0.03 * (s.z1 + s.z2); tilt = 12 * (s.z1 + 0.5 * s.z2); hue = 0.25 * (s.z1 - s.z2); }
      const r = 70, cx = 140, cy = 100;
      const face = `<g transform="rotate(${tilt} ${cx} ${cy})"><circle cx="${cx}" cy="${cy}" r="${r}" fill="color-mix(in srgb, var(--hi) ${Math.round(80 - hue * 60)}%, var(--bad))" stroke="var(--ink)" stroke-width="2"/><circle cx="${cx - 25}" cy="${cy - 18}" r="${Math.max(3, r * eye)}" fill="var(--ink)"/><circle cx="${cx + 25}" cy="${cy - 18}" r="${Math.max(3, r * eye)}" fill="var(--ink)"/><path d="M${cx - 32} ${cy + 22} Q${cx} ${cy + 22 + smile * 50} ${cx + 32} ${cy + 22}" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/></g>`;
      const pts = `<rect x="310" y="20" width="160" height="160" fill="var(--sheet-2)" stroke="var(--rule)"/><line x1="390" y1="20" x2="390" y2="180" stroke="var(--rule)"/><line x1="310" y1="100" x2="470" y2="100" stroke="var(--rule)"/><circle cx="${390 + s.z1 * 40}" cy="${100 - s.z2 * 40}" r="7" fill="var(--accent)"/><text x="470" y="96" text-anchor="end">z₁</text><text x="396" y="34">z₂</text><text x="390" y="198" text-anchor="middle">latent space</text>`;
      b.querySelector(".plot").innerHTML = `<svg class="chart" viewBox="0 0 500 205">${face}${pts}</svg>`;
      b.querySelector(".readout").innerHTML = s.m === "dis" ? R`Disentangled: $z_1$ → smile only, $z_2$ → eye size only. Each knob means one thing, so editing is easy.` : R`Entangled: $z_1$ changes the smile <b>and</b> the head tilt <b>and</b> the colour; $z_2$ does too. Try to add a smile without tilting the head: you cannot with one knob. A $\beta$-VAE pushes towards the disentangled kind.`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* ---------- Week 5 ---------- */

  /* Rounds of GAN training: forger vs detective */
  W.ganrounds = (el) => {
    const b = U.box(el, "Watch a GAN train, round by round", R`Slide through the training rounds. Each round the discriminator gets better at spotting fakes, then the generator improves its fakes. Watch $D(x)$ on real images and $D(G(z))$ on fakes head towards $0.5$.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("r", "Training round", 0, 10, 1, 0)}</div><div class="plot"></div><div class="readout"></div>`);
    const dx = (r) => 0.98 - 0.48 * (1 - Math.exp(-r / 3)), dg = (r) => 0.03 + 0.47 * (1 - Math.exp(-r / 3));
    const draw = (s) => {
      const r = s.r, q = Math.min(1, r / 8);
      const R0 = U.rng(3); let blobs = "";
      for (let i = 0; i < 6; i++) { const jitter = (1 - q) * 14; blobs += `<circle cx="${300 + (R0() - 0.5) * jitter}" cy="${70 + (R0() - 0.5) * jitter}" r="${3 + (1 - q) * 3}" fill="var(--ink)" opacity="${0.3 + 0.7 * (1 - q) * R0()}"/>`; }
      const face = (cx, cy, k) => `<circle cx="${cx}" cy="${cy}" r="34" fill="var(--hi)" opacity="${k}" stroke="var(--ink)" stroke-opacity="${k}"/><circle cx="${cx - 11}" cy="${cy - 8}" r="4" fill="var(--ink)" opacity="${k}"/><circle cx="${cx + 11}" cy="${cy - 8}" r="4" fill="var(--ink)" opacity="${k}"/><path d="M${cx - 14} ${cy + 10} Q${cx} ${cy + 22} ${cx + 14} ${cy + 10}" fill="none" stroke="var(--ink)" stroke-opacity="${k}" stroke-width="3"/>`;
      const g = `<text x="120" y="20" text-anchor="middle">real image</text>${face(120, 70, 1)}<text x="300" y="20" text-anchor="middle">generator's fake</text>${face(300, 70, q)}${blobs}
        <rect x="40" y="130" width="160" height="16" rx="8" fill="var(--sheet-2)" stroke="var(--rule)"/><rect x="40" y="130" width="${160 * dx(r)}" height="16" rx="8" fill="var(--good)"/><text x="120" y="164" text-anchor="middle">D(real) = ${U.f(dx(r), 2)}</text>
        <rect x="220" y="130" width="160" height="16" rx="8" fill="var(--sheet-2)" stroke="var(--rule)"/><rect x="220" y="130" width="${160 * dg(r)}" height="16" rx="8" fill="var(--bad)"/><text x="300" y="164" text-anchor="middle">D(fake) = ${U.f(dg(r), 2)}</text>
        <line x1="120" y1="126" x2="120" y2="150" stroke="var(--ink)" stroke-dasharray="2 2"/><line x1="300" y1="126" x2="300" y2="150" stroke="var(--ink)" stroke-dasharray="2 2"/><text x="440" y="70" text-anchor="middle">${r === 0 ? "start" : r < 4 ? "D winning" : r < 8 ? "G catching up" : "near equilibrium"}</text>`;
      b.querySelector(".plot").innerHTML = `<svg class="chart" viewBox="0 0 520 175">${g}</svg><div class="legend"><span>dashed line = 0.5, the coin-toss point</span></div>`;
      const Ld = -Math.log(dx(r)) - Math.log(1 - dg(r)), Lg = -Math.log(dg(r));
      b.querySelector(".readout").innerHTML = R`$L_D = -\ln ${U.f(dx(r), 2)} - \ln(1 - ${U.f(dg(r), 2)}) = ${U.f(Ld, 3)}$ · $L_G = -\ln ${U.f(dg(r), 2)} = ${U.f(Lg, 3)}$<br>` + (r >= 8 ? R`Both outputs are near $0.5$: D can no longer tell real from fake. At the exact equilibrium $L_D = 2\ln 2 = 1.386$ and $L_G = \ln 2 = 0.693$.` : "D still separates real from fake, so G keeps learning from D's verdicts.");
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* ---------- Week 6 ---------- */

  /* AdaIN by hand on a 2x2 feature map */
  W.adain = (el) => {
    const b = U.box(el, "AdaIN by hand", R`Type a $2 \times 2$ feature map, then choose a style scale $y_s$ and bias $y_b$. AdaIN first wipes the map's own mean and spread, then paints the style on.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls"><div class="ctrl"><label>Feature map (4 numbers)</label><input type="text" data-k="x" value="2, 4, 6, 8"></div>${U.range("ys", R`Style scale $y_s$`, -3, 3, 0.1, 2)}${U.range("yb", R`Style bias $y_b$`, -3, 3, 0.1, 1)}</div><div class="row" style="gap:18px;align-items:flex-start"><div><div class="eyebrow">input</div><div class="g1" style="margin-top:6px"></div></div><div><div class="eyebrow">normalised</div><div class="g2" style="margin-top:6px"></div></div><div><div class="eyebrow">styled</div><div class="g3" style="margin-top:6px"></div></div></div><div class="readout"></div>`);
    const grid = (m) => `<div class="grid-cells" style="grid-template-columns:repeat(2,52px)">${m.map((v) => `<span style="width:52px">${U.f(v, 2)}</span>`).join("")}</div>`;
    const draw = (s) => {
      const x = String(s.x).split(/[,\s]+/).filter(Boolean).map(Number);
      if (x.length !== 4 || x.some(isNaN)) { b.querySelector(".readout").innerHTML = "Type exactly 4 numbers, separated by commas."; return; }
      const mu = x.reduce((a, v) => a + v, 0) / 4, sd = Math.sqrt(x.reduce((a, v) => a + (v - mu) ** 2, 0) / 4) || 1e-9;
      const xn = x.map((v) => (v - mu) / sd), y = xn.map((v) => s.ys * v + s.yb);
      b.querySelector(".g1").innerHTML = grid(x); b.querySelector(".g2").innerHTML = grid(xn); b.querySelector(".g3").innerHTML = grid(y);
      const m2 = y.reduce((a, v) => a + v, 0) / 4, s2 = Math.sqrt(y.reduce((a, v) => a + (v - m2) ** 2, 0) / 4);
      b.querySelector(".readout").innerHTML = R`$\mu = ${U.f(mu, 3)}$, $\sigma = ${U.f(sd, 3)}$ → normalised map has mean 0 and spread 1<br>styled $= ${s.ys} \times \text{normalised} + (${s.yb})$ → its mean is now $${U.f(m2, 2)}$ (= $y_b$) and its spread $${U.f(s2, 2)}$ (= $|y_s|$)<br><span class="muted">Whatever the input's own statistics were, the output's mean and spread are set entirely by the style. That is how $w$ controls each layer.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* ---------- Week 7 ---------- */
  const linSched = (T, b0, b1) => { const beta = [], abar = []; let a = 1; for (let i = 0; i < T; i++) { const b = b0 + ((b1 - b0) * i) / (T - 1); beta.push(b); a *= 1 - b; abar.push(a); } return { beta, abar }; };

  /* Covariance: drag the relationship between two variables */
  W.covar = (el) => {
    const b = U.box(el, "Covariance: do two things move together?", "Slide the link between X and Y. Each dot is one person (or one pair of neighbouring pixels). Watch the cloud tilt and the covariance change sign.");
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("rho", "Strength of the link", -0.95, 0.95, 0.05, 0.7)}${U.range("sy", "Spread of Y", 0.5, 2, 0.1, 1)}</div><div class="plot"></div><div class="readout"></div>`);
    const draw = (s) => {
      const r = U.rng(5), pts = [];
      for (let i = 0; i < 160; i++) { const a = U.gauss(r), c = U.gauss(r); pts.push([a, s.sy * (s.rho * a + Math.sqrt(1 - s.rho * s.rho) * c)]); }
      const mx = pts.reduce((t, p) => t + p[0], 0) / pts.length, my = pts.reduce((t, p) => t + p[1], 0) / pts.length;
      const vx = pts.reduce((t, p) => t + (p[0] - mx) ** 2, 0) / pts.length, vy = pts.reduce((t, p) => t + (p[1] - my) ** 2, 0) / pts.length, cv = pts.reduce((t, p) => t + (p[0] - mx) * (p[1] - my), 0) / pts.length;
      const p = U.plot({ x0: -3.5, x1: 3.5, y0: -4, y1: 4, w: 360, h: 300 });
      let g = p.frame([-3, 0, 3], [-3, 0, 3], "X", "Y");
      pts.forEach(([x, y]) => (g += `<circle cx="${p.X(x)}" cy="${p.Y(y)}" r="3.2" fill="var(--accent)" opacity=".6" clip-path="url(#${p.cid})"/>`));
      b.querySelector(".plot").innerHTML = `<div style="max-width:360px;margin:auto">${p.svg(g)}</div>`;
      b.querySelector(".readout").innerHTML = R`$\text{Var}(X) = ${U.f(vx, 2)}$, $\text{Var}(Y) = ${U.f(vy, 2)}$, $\text{Cov}(X, Y) = ${U.f(cv, 2)}$ → ${cv > 0.15 ? "positive: they rise together" : cv < -0.15 ? "negative: one rises as the other falls" : "about zero: unrelated"}<br>Covariance matrix $\Sigma = \begin{bmatrix} ${U.f(vx, 2)} & ${U.f(cv, 2)} \\ ${U.f(cv, 2)} & ${U.f(vy, 2)} \end{bmatrix}$ (symmetric)<br><span class="muted">Diffusion noise is the zero-link case: every pixel's noise is independent, so its covariance matrix is $\beta I$.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* The forward shortcut on a picture and on one pixel */
  W.noiseimg = (el) => {
    const b = U.box(el, "The shortcut, one pixel at a time", R`Pick a step $t$ (linear schedule, $T = 1000$). The strip shows the whole picture at $t = 0, 100, 300, 600, 999$, like the hands-on notebook. Below, follow one pixel: its value $x_0$, a noise draw $\varepsilon$, and the result $x_t$.`);
    b.insertAdjacentHTML("beforeend", `<canvas width="560" height="112" class="wcanvas strip" style="aspect-ratio:560/112"></canvas><div class="ctrls">${U.range("t", R`Step $t$`, 0, 999, 1, 300)}${U.range("x0", R`Pixel value $x_0$ (scaled to $[-1, 1]$)`, -1, 1, 0.1, 0.8)}${U.range("e", R`Noise draw $\varepsilon$`, -2.5, 2.5, 0.1, 0.5)}</div><div class="plot"></div><div class="readout"></div>`);
    const S = linSched(1000, 1e-4, 0.02), N = 24, r = U.rng(9), img = [], eps = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const x = (j - 11.5) / 11.5, y = (i - 11.5) / 11.5, rr = Math.hypot(x, y); let v = rr < 0.95 ? 0.6 : -0.9; if (Math.hypot(x + 0.35, y + 0.3) < 0.14 || Math.hypot(x - 0.35, y + 0.3) < 0.14) v = -0.9; if (y > 0.15 && y < 0.55 && Math.abs(x) < 0.5 && Math.abs(y - (0.5 - 0.55 * x * x)) < 0.1) v = -0.9; img.push(v); eps.push(U.gauss(r)); }
    const draw = (s) => {
      const ctx = b.querySelector(".strip").getContext("2d"); ctx.fillStyle = U.css("--sheet-2"); ctx.fillRect(0, 0, 560, 112);
      [0, 100, 300, 600, 999].forEach((tt, k) => { const ab = tt ? S.abar[tt] : 1; const d = ctx.createImageData(N, N); img.forEach((v, i) => { const x = Math.sqrt(ab) * v + Math.sqrt(1 - ab) * eps[i]; const c = Math.max(0, Math.min(255, (x + 1) * 127.5)); d.data[4 * i] = c; d.data[4 * i + 1] = c * 0.9; d.data[4 * i + 2] = c * 0.6; d.data[4 * i + 3] = 255; }); const off = document.createElement("canvas"); off.width = N; off.height = N; off.getContext("2d").putImageData(d, 0, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(off, 10 + k * 110, 4, 88, 88); ctx.fillStyle = U.css("--ink"); ctx.font = "12px monospace"; ctx.textAlign = "center"; ctx.fillText("t = " + tt, 54 + k * 110, 106); });
      const ab = s.t ? S.abar[s.t] : 1, sig = Math.sqrt(ab) * s.x0, noi = Math.sqrt(1 - ab) * s.e;
      const W0 = 220, Xc = (v) => 280 + v * 60;
      const bar = (y, v, col, lab) => `<rect x="${Math.min(Xc(0), Xc(v))}" y="${y}" width="${Math.abs(Xc(v) - Xc(0))}" height="18" fill="${col}" rx="3"/><text x="${Xc(0) - 8}" y="${y + 14}" text-anchor="end">${lab}</text><text x="${Xc(v) + (v >= 0 ? 6 : -6)}" y="${y + 14}" text-anchor="${v >= 0 ? "start" : "end"}">${U.f(v, 3)}</text>`;
      b.querySelector(".plot").innerHTML = `<svg class="chart" viewBox="0 0 560 100"><line x1="${Xc(0)}" y1="0" x2="${Xc(0)}" y2="100" stroke="var(--rule)"/>${bar(8, sig, "var(--accent)", "signal")}${bar(38, noi, "var(--hi)", "noise")}${bar(68, sig + noi, "var(--good)", "x_t")}</svg>`;
      b.querySelector(".readout").innerHTML = R`$\bar{\alpha}_{${s.t}} = ${U.f(ab, 4)}$ · $x_t = \sqrt{${U.f(ab, 3)}}\,(${s.x0}) + \sqrt{${U.f(1 - ab, 3)}}\,(${s.e}) = ${U.f(sig, 3)} + ${U.f(noi, 3)} = ${U.f(sig + noi, 3)}$<br><span class="muted">Early on the signal bar dominates; by the end the noise bar does, whatever the pixel started as.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* Reverse diffusion in 1-D: noise flows into the data's two clusters */
  W.reverse1d = (el) => {
    const b = U.box(el, "Reverse diffusion in one dimension", R`The “data” is two clusters, at $-1$ and $+1$. Start 300 points as pure noise ($t = T$) and run the reverse steps. Each step uses the ideal noise guess for this data, removes a little noise, and adds a little fresh noise (except at the end). Watch the noise split into the two clusters.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("k", "Reverse steps taken", 0, 100, 1, 0)}</div><div class="row"><button class="btn small" data-act="play">Run all steps</button><button class="btn ghost small" data-act="new">New noise</button></div><div class="plot"></div><div class="readout"></div>`);
    const T = 100, S = linSched(T, 1e-3, 0.2); let seed = 21, timer = null, st;
    const run = (k) => {
      const r = U.rng(seed); let xs = Array.from({ length: 300 }, () => U.gauss(r));
      for (let i = 0; i < k; i++) {
        const t = T - 1 - i, ab = S.abar[t], abPrev = t ? S.abar[t - 1] : 1, be = S.beta[t], al = 1 - be;
        xs = xs.map((x) => { const x0h = Math.tanh((Math.sqrt(ab) * x) / (1 - ab)); const epsh = (x - Math.sqrt(ab) * x0h) / Math.sqrt(1 - ab); const mean = (x - (be / Math.sqrt(1 - ab)) * epsh) / Math.sqrt(al); const sd = t ? Math.sqrt(((1 - abPrev) / (1 - ab)) * be) : 0; return mean + sd * U.gauss(r); });
      }
      return xs;
    };
    const draw = () => {
      const xs = run(st.k), p = U.plot({ x0: -3, x1: 3, y0: 0, y1: 1.6, h: 210 });
      const bins = new Array(48).fill(0); xs.forEach((x) => { const i = Math.floor((x + 3) / 0.125); if (i >= 0 && i < 48) bins[i]++; });
      let g = p.frame([-3, -2, -1, 0, 1, 2, 3], [0], "x", "");
      bins.forEach((c, i) => { const h = c / xs.length / 0.125; g += `<rect x="${p.X(-3 + i * 0.125) + 0.5}" y="${p.Y(Math.min(1.6, h))}" width="${p.X(0.125) - p.X(0) - 1}" height="${p.Y(0) - p.Y(Math.min(1.6, h))}" fill="var(--accent)" opacity=".7"/>`; });
      [-1, 1].forEach((m) => (g += `<line x1="${p.X(m)}" y1="${p.padT}" x2="${p.X(m)}" y2="${p.Y(0)}" stroke="var(--good)" stroke-width="2" stroke-dasharray="5 4"/>`));
      b.querySelector(".plot").innerHTML = p.svg(g) + `<div class="legend"><span><i style="background:var(--accent)"></i>the 300 points</span><span><i style="background:var(--good)"></i>where the real data lives</span></div>`;
      const t = T - st.k, near = xs.filter((x) => Math.abs(Math.abs(x) - 1) < 0.25).length;
      b.querySelector(".readout").innerHTML = R`Now at step $t = ${t}$ of ${T}. ${st.k === 0 ? R`Pure noise: $x_T \sim \mathcal{N}(0, 1)$.` : ""} Points within $0.25$ of a cluster: ${Math.round((100 * near) / xs.length)}%.<br><span class="muted">A real model does not know the ideal noise guess; the network $\varepsilon_\theta(x_t, t)$ learns to approximate it from training data.</span>`;
    };
    st = U.bind(b, draw);
    b.addEventListener("click", (e) => { const a = e.target.closest("[data-act]"); if (!a) return; if (a.dataset.act === "new") { seed++; draw(); return; } clearInterval(timer); const inp = b.querySelector("[data-k=k]"); let k = 0; timer = setInterval(() => { if (!inp.isConnected || k > 100) { clearInterval(timer); return; } inp.value = k; inp.dispatchEvent(new Event("input")); k += 4; }, 60); });
    draw();
  };

  /* ---------- Week 8 ---------- */

  /* Sinusoidal time embedding as a barcode */
  W.timeemb = (el) => {
    const b = U.box(el, "The time embedding as a barcode", R`Each row is one time step $t$; each column is one entry of its embedding, $\sin$ or $\cos$ at a different speed (left columns change fast, right columns slowly). Move $t$: no two rows look the same, so the network can always tell which step it is on.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("t", R`Time step $t$`, 0, 1000, 10, 50)}</div><canvas width="560" height="160" class="wcanvas cv" style="aspect-ratio:560/160"></canvas><div class="readout"></div>`);
    const d = 32, emb = (t) => Array.from({ length: d }, (_, j) => { const i = Math.floor(j / 2), f = t / Math.pow(10000, (2 * i) / d); return j % 2 ? Math.cos(f) : Math.sin(f); });
    const draw = (s) => {
      const ctx = b.querySelector(".cv").getContext("2d"); ctx.clearRect(0, 0, 560, 160);
      const rows = [0, 10, 50, 100, 250, 500, 750, 1000];
      rows.concat([s.t]).forEach((tt, r) => { const e = emb(tt), y = r < rows.length ? r * 16 : 136; e.forEach((v, j) => { const c = Math.round((v + 1) * 127.5); ctx.fillStyle = `rgb(${c},${Math.round(c * 0.85 + 30)},${255 - c})`; ctx.fillRect(70 + j * 15, y + 2, 14, 13); }); ctx.fillStyle = U.css("--ink"); ctx.font = "11px monospace"; ctx.textAlign = "right"; ctx.fillText(r < rows.length ? "t = " + tt : "you: " + tt, 64, y + 13); });
      const e = emb(s.t);
      b.querySelector(".readout").innerHTML = R`$\text{TE}(${s.t})$ first entries: $[${e.slice(0, 4).map((v) => U.f(v, 3)).join(", ")}, \ldots]$ (length $d = ${d}$ here; real models use 128–512).<br><span class="muted">Blue ≈ $-1$, grey ≈ $0$, yellow ≈ $+1$. The same formula is the Transformer's positional encoding (Week 10), with word position instead of time step.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* Toy cross-attention: image regions attend to prompt words */
  W.crossattn = (el) => {
    const b = U.box(el, "Cross-attention: which words does each region listen to?", "The prompt is “a yellow butterfly on a purple flower”. Click a region of the picture: its query is compared with every word's key, and softmax turns the scores into attention weights.");
    b.insertAdjacentHTML("beforeend", `${U.seg("r", [["top", "butterfly region"], ["bot", "flower region"], ["sky", "background"]], "top")}<div class="plot"></div><div class="readout"></div>`);
    const words = ["a", "yellow", "butterfly", "on", "a", "purple", "flower"];
    const scores = { top: [0.1, 2.2, 2.6, 0.2, 0.1, 0.3, 0.4], bot: [0.1, 0.3, 0.4, 0.3, 0.1, 2.3, 2.7], sky: [0.4, 0.3, 0.3, 0.5, 0.4, 0.3, 0.3] };
    const draw = (s) => {
      const sc = scores[s.r], e = sc.map(Math.exp), tot = e.reduce((a, x) => a + x, 0), w = e.map((x) => x / tot);
      const hl = { top: 'stroke="var(--accent)" stroke-width="4"', bot: "", sky: "" };
      let g = `<rect x="10" y="10" width="180" height="180" rx="8" fill="var(--sheet-2)" stroke="${s.r === "sky" ? "var(--accent)" : "var(--rule)"}" stroke-width="${s.r === "sky" ? 4 : 1}"/>
        <g ${s.r === "top" ? 'opacity="1"' : 'opacity=".55"'}><ellipse cx="80" cy="70" rx="26" ry="18" fill="#f2c200"/><ellipse cx="120" cy="70" rx="26" ry="18" fill="#f2c200"/><rect x="97" y="55" width="6" height="34" rx="3" fill="var(--ink)"/></g>
        <g ${s.r === "bot" ? 'opacity="1"' : 'opacity=".55"'}>${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="${100 + 22 * Math.cos((a * Math.PI) / 180)}" cy="${140 + 22 * Math.sin((a * Math.PI) / 180)}" rx="15" ry="11" fill="#8e44ad"/>`).join("")}<circle cx="100" cy="140" r="9" fill="#f5d76e"/></g>
        ${s.r === "top" ? '<rect x="45" y="42" width="110" height="56" rx="8" fill="none" stroke="var(--accent)" stroke-width="3"/>' : s.r === "bot" ? '<rect x="62" y="104" width="76" height="74" rx="8" fill="none" stroke="var(--accent)" stroke-width="3"/>' : ""}`;
      words.forEach((wd, i) => { const y = 18 + i * 25; g += `<text x="225" y="${y + 13}">${wd}</text><rect x="300" y="${y}" width="${w[i] * 240}" height="17" rx="3" fill="var(--accent)"/><text x="${306 + w[i] * 240}" y="${y + 13}">${U.f(w[i], 2)}</text>`; });
      b.querySelector(".plot").innerHTML = `<svg class="chart" viewBox="0 0 560 200">${g}</svg>`;
      const top2 = w.map((x, i) => [x, words[i]]).sort((a, bb) => bb[0] - a[0]).slice(0, 2).map((x) => "“" + x[1] + "”");
      b.querySelector(".readout").innerHTML = R`weights $= \text{softmax}\!\left(\frac{q \cdot k}{\sqrt{d}}\right)$ over the 7 words → this region mostly listens to ${top2.join(" and ")}.<br>The region's new features are the weighted mix of the words' values $V$, so “yellow” paints the butterfly and “purple” the flower.`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* ---------- Week 9 ---------- */

  /* Text clean-up pipeline */
  W.textpipe = (el) => {
    const b = U.box(el, "Clean up a sentence, step by step", "Type any sentence. Each row applies one more step of the course's pipeline. (The lemmatiser here only knows a small dictionary of common words.)");
    b.insertAdjacentHTML("beforeend", `<div class="ctrls"><div class="ctrl" style="grid-column:1/-1"><label>Your sentence</label><input type="text" data-k="s" value="The Quick Brown Foxes are Running!!! Visit https://example.com"></div></div><div class="readout"></div>`);
    const STOP = new Set("a an the is are was were be been am i me my you your he she it its we they them this that these those and or but of to in on at for with by from as so not no do does did have has had will would can could should visit".split(" "));
    const LEM = { foxes: "fox", running: "run", ran: "run", runs: "run", studies: "study", studied: "study", children: "child", better: "good", best: "good", mice: "mouse", went: "go", going: "go", cats: "cat", dogs: "dog", movies: "movie", loved: "love", loves: "love", loving: "love", learning: "learn", wolves: "wolf", feet: "foot", geese: "goose", women: "woman", men: "man", people: "person", was: "be", were: "be", is: "be" };
    const draw = (s) => {
      const s0 = String(s.s), s1 = s0.toLowerCase(), s2 = s1.replace(/https?:\/\/\S+/g, " ").replace(/[^a-z0-9\s']/g, " ").replace(/\s+/g, " ").trim();
      const t3 = s2 ? s2.split(" ") : [], t4 = t3.filter((w) => !STOP.has(w)), t5 = t4.map((w) => LEM[w] || w);
      const tok = (arr) => `<span class="tokens" style="display:inline-flex">${arr.map((w) => `<span class="tok" style="cursor:default">${w.replace(/[<>&]/g, "")}</span>`).join("")}</span>`;
      const esc = (x) => x.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
      b.querySelector(".readout").innerHTML = `<div class="nomath">1. lowercase: ${esc(s1)}<br>2. remove punctuation and links: ${esc(s2)}<br>3. tokenise: ${tok(t3)}<br>4. remove stop words: ${tok(t4)}<br>5. lemmatise: ${tok(t5)}</div><span class="muted">${t3.length} tokens → ${t5.length} after cleaning.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* Vanishing / exploding gradient through time */
  W.vanish = (el) => {
    const b = U.box(el, "How a gradient fades (or explodes) through time", "Backpropagation through time multiplies by roughly the same factor once per step. Pick the factor and the number of steps.");
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("f", "Factor per step", 0.5, 1.2, 0.05, 0.9)}${U.range("n", "Number of steps", 1, 60, 1, 50)}</div><div class="plot"></div><div class="readout"></div>`);
    const draw = (s) => {
      const vals = Array.from({ length: s.n + 1 }, (_, k) => s.f ** k);
      const lo = -6, hi = 3, p = U.plot({ x0: 0, x1: 60, y0: lo, y1: hi, h: 220 });
      let g = p.frame([0, 10, 20, 30, 40, 50, 60], [-6, -4, -2, 0, 2], "steps back", "log₁₀ gradient");
      g += p.line(vals.map((v, k) => (k ? "L" : "M") + p.X(k).toFixed(1) + "," + p.Y(Math.max(lo, Math.min(hi, Math.log10(v)))).toFixed(1)).join(""), s.f < 1 ? "var(--bad)" : s.f > 1 ? "var(--warn)" : "var(--good)");
      b.querySelector(".plot").innerHTML = p.svg(g);
      const v = s.f ** s.n;
      b.querySelector(".readout").innerHTML = R`$${s.f}^{${s.n}} = ${v < 1e-3 || v > 1e4 ? v.toExponential(2).replace(/e([+-]\d+)/, (m, e) => String.raw` \times 10^{${+e}}`) : U.f(v, 4)}$ → ${v < 0.01 ? "<b>vanished</b>: the first words barely affect learning." : v > 50 ? "<b>exploded</b>: training becomes unstable (gradient clipping caps this)." : "still usable."}<br><span class="muted">The LSTM's cell state lets the forget gate sit near 1, so the memory path keeps its gradient.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* ---------- Week 10 ---------- */

  /* BERT-style fill-in-the-blank: left-only vs both sides */
  W.mlm = (el) => {
    const b = U.box(el, "Fill in the blank: one side or both?", "A tiny model guesses the hidden word. Compare a reader that only sees the words on the LEFT (like GPT) with one that sees BOTH sides (like BERT).");
    const S = [
      { left: "I sat by the", right: "of the river and fished.", cand: [["bank", 1, 9], ["edge", 2, 3], ["table", 3, 0.1], ["window", 3, 0.1]] },
      { left: "The boy is", right: "football with his friends.", cand: [["playing", 1, 9], ["watching", 2, 2], ["happy", 3, 0.05], ["eating", 2, 0.1]] },
      { left: "She paid the money into the", right: "and got a receipt.", cand: [["bank", 2, 8], ["shop", 2, 2], ["river", 0.5, 0.05], ["box", 1, 0.5]] }
    ];
    b.insertAdjacentHTML("beforeend", `${U.seg("k", [["0", "River sentence"], ["1", "Football sentence"], ["2", "Money sentence"]], "0")}<div class="plot"></div><div class="readout"></div>`);
    const draw = (s) => {
      const q = S[+s.k], L = q.cand.map((c) => c[1]), B = q.cand.map((c) => c[1] * c[2]);
      const norm = (a) => { const t = a.reduce((x, y) => x + y, 0); return a.map((x) => x / t); };
      const pl = norm(L), pb = norm(B);
      let g = `<text x="10" y="22">${q.left} <tspan style="font-weight:700;fill:var(--accent)">[MASK]</tspan> <tspan style="fill:var(--ink-2)">${q.right}</tspan></text>`;
      q.cand.forEach((c, i) => { const y = 46 + i * 34; g += `<text x="10" y="${y + 14}">${c[0]}</text><rect x="90" y="${y}" width="${pl[i] * 190}" height="12" rx="3" fill="var(--hi)"/><text x="${94 + pl[i] * 190}" y="${y + 10}" style="font-size:11px">${U.f(pl[i], 2)}</text><rect x="320" y="${y}" width="${pb[i] * 190}" height="12" rx="3" fill="var(--accent)"/><text x="${324 + pb[i] * 190}" y="${y + 10}" style="font-size:11px">${U.f(pb[i], 2)}</text>`; });
      g += `<text x="90" y="40" style="font-size:12px;fill:var(--ink-2)">left side only (GPT-style)</text><text x="320" y="40" style="font-size:12px;fill:var(--ink-2)">both sides (BERT-style)</text>`;
      b.querySelector(".plot").innerHTML = `<svg class="chart" viewBox="0 0 560 190">${g}</svg>`;
      const bl = q.cand[pl.indexOf(Math.max(...pl))][0], bb = q.cand[pb.indexOf(Math.max(...pb))][0];
      b.querySelector(".readout").innerHTML = `Left-only best guess: <b>${bl}</b> (${U.f(Math.max(...pl) * 100, 0)}% sure) · both-sides best guess: <b>${bb}</b> (${U.f(Math.max(...pb) * 100, 0)}% sure).<br><span class="muted">The words after the blank carry the clue (“river”, “football”, “receipt”). BERT's masked language modelling trains exactly this skill. GPT cannot use the right side because it must write left to right.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* Autoregressive next-word generation with a tiny bigram model */
  W.nextword = (el) => {
    const b = U.box(el, "Generate text one token at a time", "A tiny model learned which word tends to follow which from a few sentences. Press “Next token”: it computes the probability of every possible next word, picks one, appends it, and repeats. That loop is how GPT writes.");
    const corpus = "the cat sat on the mat . the cat ate the fish . the dog sat on the rug . the dog ate the bone . a cat sat on a mat . the fish swam in the pond .".split(" ");
    const big = {}; for (let i = 0; i < corpus.length - 1; i++) { const a = corpus[i], c = corpus[i + 1]; big[a] = big[a] || {}; big[a][c] = (big[a][c] || 0) + 1; }
    b.insertAdjacentHTML("beforeend", `<div class="row">${U.seg("m", [["greedy", "Always pick the most likely"], ["sample", "Pick at random by probability"]], "greedy")}<button class="btn small" data-act="next">Next token</button><button class="btn ghost small" data-act="reset">Start again</button></div><div class="gen readout" style="font-size:1.05rem"></div><div class="plot"></div>`);
    let seq = ["the"], st; const r = U.rng(5);
    const draw = () => {
      const last = seq[seq.length - 1], nx = big[last] || {}, tot = Object.values(nx).reduce((a, x) => a + x, 0);
      const probs = Object.entries(nx).map(([w, c]) => [w, c / tot]).sort((a, c) => c[1] - a[1]);
      b.querySelector(".gen").innerHTML = seq.map((w, i) => `<span class="tok" style="cursor:default${i === seq.length - 1 ? ";background:var(--accent);color:var(--sheet)" : ""}">${w}</span>`).join(" ");
      b.querySelector(".plot").innerHTML = probs.length ? `<div class="small muted">P(next word | “${last}”):</div>` + probs.map(([w, p]) => `<div class="row" style="gap:8px;margin:2px 0"><span style="width:70px">${w}</span><span style="display:inline-block;height:12px;width:${p * 300}px;background:var(--hi);border-radius:3px"></span><span class="small">${U.f(p, 2)}</span></div>`).join("") : `<div class="small muted">No known next word: generation stops.</div>`;
    };
    st = U.bind(b, draw);
    b.addEventListener("click", (e) => { const a = e.target.closest("[data-act]"); if (!a) return; if (a.dataset.act === "reset") seq = ["the"]; else { const nx = big[seq[seq.length - 1]] || {}; const ent = Object.entries(nx); if (ent.length && seq.length < 24) { let w; if (st.m === "greedy") w = ent.sort((x, y) => y[1] - x[1])[0][0]; else { const tot = ent.reduce((s2, x) => s2 + x[1], 0); let u = r() * tot; w = ent[0][0]; for (const [k, c] of ent) { u -= c; if (u <= 0) { w = k; break; } } } seq.push(w); } } draw(); });
    draw();
  };

  /* ---------- Week 11 ---------- */

  /* In-context learning: the examples decide the task */
  W.icl = (el) => {
    const b = U.box(el, "Same names, different examples, different answer", "Pick which examples go in the prompt. The model's weights never change; it reads the pattern from the examples and continues it.");
    const facts = { Federer: ["Tennis", "Switzerland", "Roger"], Kohli: ["Cricket", "India", "Virat"], Messi: ["Football", "Argentina", "Lionel"], Ronaldo: ["Football", "Portugal", "Cristiano"], Sindhu: ["Badminton", "India", "P. V."] };
    b.insertAdjacentHTML("beforeend", `${U.seg("rel", [["0", "examples show the sport"], ["1", "examples show the country"], ["2", "examples show the first name"]], "0")}${U.seg("q", [["Messi", "ask about Messi"], ["Kohli", "ask about Kohli"], ["Sindhu", "ask about Sindhu"]], "Messi")}<div class="readout prompt"></div><div class="readout ans"></div>`);
    const draw = (s) => {
      const demo = Object.keys(facts).filter((n) => n !== s.q).slice(0, 2), k = +s.rel;
      b.querySelector(".prompt").innerHTML = `<div class="eyebrow">the prompt</div>${demo.map((n) => `${n} → ${facts[n][k]}`).join("<br>")}<br>${s.q} → <b>?</b>`;
      b.querySelector(".ans").innerHTML = `Model continues: <b>${facts[s.q][k]}</b><br><span class="muted">Two examples were enough to define the task (${["player → sport", "player → country", "player → first name"][k]}). This is few-shot in-context learning: nothing was trained, and the “skill” vanishes with the next prompt.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };
})();
