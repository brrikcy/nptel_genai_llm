/* Interactive models, part 2: diffusion, sequence models, transformers, LLMs, RAG, evaluation */
(function () {
  "use strict";
  const W = window.WIDGETS; const U = W._util;
  const C1 = "var(--accent)", C2 = "var(--hi)", C3 = "var(--good)", C4 = "var(--bad)";

  /* schedules */
  const schedule = (kind, T) => {
    const beta = [], abar = []; let prod = 1;
    if (kind === "linear") { for (let t = 1; t <= T; t++) { const b = 1e-4 + ((0.02 - 1e-4) * (t - 1)) / (T - 1); beta.push(b); prod *= 1 - b; abar.push(prod); } }
    else { const f = (t) => Math.cos(((t / T + 0.008) / 1.008) * (Math.PI / 2)) ** 2; for (let t = 1; t <= T; t++) { const a = f(t) / f(0); abar.push(a); beta.push(Math.min(0.999, 1 - a / (t === 1 ? 1 : f(t - 1) / f(0)))); } }
    return { beta, abar };
  };

  /* 17. Forward diffusion */
  W.diffusion = (el) => {
    const b = U.box(el, "Forward diffusion: ruin an image on schedule", R`$x_t = \sqrt{\bar{\alpha}_t}\,x_0 + \sqrt{1 - \bar{\alpha}_t}\,\varepsilon$. Slide $t$ from 0 to $T = 1000$ and compare the linear and cosine noise schedules.`);
    b.insertAdjacentHTML("beforeend", `<div class="row">${U.seg("s", [["linear", "Linear β schedule"], ["cosine", "Cosine schedule"]], "linear")}</div><div class="ctrls">${U.range("t", R`Time step $t$`, 0, 1000, 10, 250)}</div>
      <div class="row" style="gap:18px;align-items:flex-start"><div><div class="eyebrow">noisy image</div><canvas width="128" height="128" class="wcanvas cv" style="width:168px;margin-top:6px;image-rendering:pixelated"></canvas></div><div style="flex:1;min-width:240px"><div class="eyebrow">alpha-bar (signal kept) over time</div><div class="plot"></div></div></div><div class="readout"></div>`);
    const N = 32; const x0 = []; const r = U.rng(11); const eps = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { let v = -0.85; if (i > 18) v = 0.2; if (Math.hypot(i - 9, j - 22) < 5) v = 0.95; if (i > 12 && i <= 18 && Math.abs(j - 10) < 7 - (18 - i) * 0 && j > 3 && j < 17) v = 0.6; if (i > 6 && i <= 12 && Math.abs(j - 10) < i - 5) v = 0.85; x0.push(v); eps.push(U.gauss(r)); }
    const S = { linear: schedule("linear", 1000), cosine: schedule("cosine", 1000) };
    const draw = (s) => {
      const sc = S[s.s]; const t = Math.max(0, s.t); const ab = t === 0 ? 1 : sc.abar[t - 1]; const bt = t === 0 ? 0 : sc.beta[t - 1];
      const cv = b.querySelector(".cv"), ctx = cv.getContext("2d"); const img = ctx.createImageData(N, N);
      for (let k = 0; k < N * N; k++) { const v = Math.sqrt(ab) * x0[k] + Math.sqrt(1 - ab) * eps[k]; const c = Math.max(0, Math.min(255, (v + 1) * 127.5)); img.data[4 * k] = c * 0.75; img.data[4 * k + 1] = c * 0.85; img.data[4 * k + 2] = c; img.data[4 * k + 3] = 255; }
      const off = document.createElement("canvas"); off.width = N; off.height = N; off.getContext("2d").putImageData(img, 0, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(off, 0, 0, 128, 128);
      const p = U.plot({ x0: 0, x1: 1000, y0: 0, y1: 1, h: 170 });
      let dL = "", dC = ""; for (let k = 0; k <= 1000; k += 10) { const a1 = k ? S.linear.abar[k - 1] : 1, a2 = k ? S.cosine.abar[k - 1] : 1; dL += (dL ? "L" : "M") + p.X(k) + "," + p.Y(a1); dC += (dC ? "L" : "M") + p.X(k) + "," + p.Y(a2); }
      b.querySelector(".plot").innerHTML = p.svg(p.frame([0, 250, 500, 750, 1000], [0, 0.5, 1]) + p.line(dL, C1, s.s === "linear" ? "" : 'opacity="0.35"') + p.line(dC, C2, s.s === "cosine" ? "" : 'opacity="0.35"') + `<line x1="${p.X(t)}" x2="${p.X(t)}" y1="${p.padT}" y2="${p.Y(0)}" stroke="var(--ink)" stroke-dasharray="3 3"/>`) + `<div class="legend"><span><i style="background:${C1}"></i>linear</span><span><i style="background:${C2}"></i>cosine</span></div>`;
      b.querySelector(".readout").innerHTML = R`$t = ${t}$ · $\beta_t = ${U.f(bt, 5)}$ · $\bar{\alpha}_t = \prod_s (1 - \beta_s) = ${U.f(ab, 4)}$<br>signal weight $\sqrt{\bar{\alpha}_t} = ${U.f(Math.sqrt(ab), 3)}$ · noise weight $\sqrt{1-\bar{\alpha}_t} = ${U.f(Math.sqrt(1 - ab), 3)}$ · $\text{SNR} = \frac{\bar{\alpha}_t}{1-\bar{\alpha}_t} = ${ab >= 1 ? "\\infty" : U.f(ab / (1 - ab), 3)}$<br><span class="muted">The forward process has no learned parts. Thanks to the shortcut formula you can jump straight to any $t$. The cosine schedule ruins information more evenly, so fewer late steps are wasted on pure noise.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 18. Guidance scale */
  W.cfg = (el) => {
    const b = U.box(el, "Classifier-free guidance as arrows", "The same U-Net guesses the noise twice: with the prompt and with an empty prompt. Guidance keeps going along the difference between the two arrows.");
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("w", R`Guidance scale $w$`, 0, 12, 0.5, 7.5)}</div><div class="plot"></div><div class="readout"></div>`);
    const draw = (s) => {
      const p = U.plot({ x0: -1, x1: 9, y0: -1, y1: 5, h: 230 });
      const u = [1.5, 0.8], c = [2.4, 1.6]; const g = [u[0] + s.w * (c[0] - u[0]), u[1] + s.w * (c[1] - u[1])];
      const clamp = (v, a, bb) => Math.max(a, Math.min(bb, v));
      const arrow = (a, col, label) => `<line x1="${p.X(0)}" y1="${p.Y(0)}" x2="${p.X(clamp(a[0], -1, 9))}" y2="${p.Y(clamp(a[1], -1, 5))}" stroke="${col}" stroke-width="3" marker-end="url(#ah)"/><text x="${p.X(clamp(a[0], -1, 8.6)) + 6}" y="${p.Y(clamp(a[1], -1, 4.8)) - 6}" style="fill:${col};font-weight:700">${label}</text>`;
      const svg = `<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ink-2)"/></marker></defs>` + p.frame([0, 2, 4, 6, 8], [0, 2, 4]) + arrow(u, C2, "without prompt") + arrow(c, C3, "with prompt") + arrow(g, C1, "guided");
      b.querySelector(".plot").innerHTML = p.svg(svg);
      const msg = s.w === 0 ? R`$w = 0$: purely unconditional, the prompt is ignored.` : s.w === 1 ? R`$w = 1$: the plain conditional guess, no extra push.` : s.w < 1 ? R`$0 \lt w \lt 1$: in between the two guesses.` : s.w <= 9 ? R`$w > 1$: pushes past the conditional guess. Pictures follow the prompt more closely; variety drops. Stable Diffusion's default is about $7.5$.` : R`Very large $w$: over-saturated, distorted pictures with little variety.`;
      b.querySelector(".readout").innerHTML = R`$\tilde{\varepsilon} = \varepsilon(x_t, \varnothing) + w\,\big(\varepsilon(x_t, y) - \varepsilon(x_t, \varnothing)\big) = [${U.f(g[0], 2)}, ${U.f(g[1], 2)}]$<br>${msg}<br>The course writes the same thing as $\hat{\varepsilon} = (1 + s)\,\varepsilon_{\text{cond}} - s\,\varepsilon_{\text{uncond}}$, so $w = 1 + s$; here $s = ${U.f(s.w - 1, 2)}$.<br><span class="muted">Classifier guidance needs a separately trained noisy-image classifier. Classifier-free guidance needs none: the prompt is randomly dropped (about 10–20% of the time) during training so one network learns both guesses.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 19. U-Net explorer */
  W.unet = (el) => {
    const b = U.box(el, "Tour the U-Net", "Click a block to see what it does. Pix2Pix uses this shape as its generator; diffusion models (Week 7) use it to predict noise.");
    const blocks = {
      in: ["Input image", R`The noisy image $x_t$ at step $t$, the same height and width as the output.`],
      t: ["Time embedding", R`The step number $t$ is turned into a list of sine and cosine values, passed through a small network and added inside every block, so one network knows how much noise to expect.`],
      e1: ["Encoder block 1", "Convolution blocks (with GroupNorm), then shrink the image. Picks up edges and fine texture."],
      e2: ["Encoder block 2", "Fewer pixels, more channels. Picks up larger shapes."],
      bn: ["Bottleneck", "Smallest image, most channels. Self-attention here lets distant regions coordinate. In Stable Diffusion, cross-attention to the text prompt enters at these attention layers."],
      d2: ["Decoder block 2", "Grow the image and join on the matching encoder features (skip connection)."],
      d1: ["Decoder block 1", "Grow back to full size, again with a skip connection, so fine detail lost in the bottleneck comes back."],
      out: ["Output noise", R`The predicted noise $\hat{\varepsilon}_\theta(x_t, t)$, the same shape as $x_t$. The training loss is $\|\varepsilon - \hat{\varepsilon}_\theta(x_t, t)\|^2$.`],
      skip: ["Skip connections", "Copy encoder feature maps straight across to the decoder. This is the defining feature of the U-Net (first designed for medical image segmentation; Pix2Pix uses it as its generator too)."]
    };
    b.insertAdjacentHTML("beforeend", `<svg viewBox="0 0 560 230" class="chart" style="max-width:560px">
      <defs><marker id="ua" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--ink-2)"/></marker></defs>
      ${[["in", 10, 20, 70, 40], ["e1", 50, 75, 80, 40], ["e2", 120, 130, 80, 40], ["bn", 220, 175, 120, 40], ["d2", 360, 130, 80, 40], ["d1", 430, 75, 80, 40], ["out", 480, 20, 70, 40], ["t", 230, 20, 100, 36]].map(([k, x, y, w, h]) => `<g data-b="${k}" style="cursor:pointer"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="var(--sheet-2)" stroke="var(--accent)" stroke-width="1.5"/><text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" style="fill:var(--ink);font:600 11px var(--f-mono)">${blocks[k][0].split(" ").slice(0, 2).join(" ")}</text></g>`).join("")}
      <path d="M45 60 L80 75 M110 115 L150 130 M180 170 L230 175 M330 175 L390 170 M420 130 L460 115 M490 75 L515 60" stroke="var(--ink-2)" stroke-width="1.5" fill="none" marker-end="url(#ua)"/>
      <g data-b="skip" style="cursor:pointer"><path d="M130 85 L430 85 M200 140 L360 140" stroke="var(--hi)" stroke-width="3" stroke-dasharray="7 5" fill="none" marker-end="url(#ua)"/><text x="280" y="80" text-anchor="middle" style="fill:var(--ink-2);font:11px var(--f-mono)">skip connections</text></g>
      <path d="M280 56 L280 172" stroke="var(--good)" stroke-width="1.5" stroke-dasharray="3 3" fill="none" marker-end="url(#ua)"/>
    </svg><div class="readout info">Click any block.</div>`);
    b.querySelectorAll("[data-b]").forEach((g) => (g.onclick = () => { const [t, d] = blocks[g.dataset.b]; b.querySelector(".info").innerHTML = `<b>${t}</b><br>${d}`; }));
  };

  /* 20. Word embeddings */
  W.w2v = (el) => {
    const b = U.box(el, "Word vectors and analogies", R`Toy 2-D embeddings arranged the way Word2Vec and GloVe arrange real ones: directions carry meaning. Compute $A - B + C$ and find the nearest word.`);
    const E = { king: [4.2, 3.6], queen: [4.0, 1.2], man: [1.6, 3.4], woman: [1.4, 1.0], prince: [3.2, 3.9], princess: [3.0, 1.5], boy: [0.8, 3.7], girl: [0.6, 1.3], paris: [-3.2, 2.8], france: [-1.6, 3.6], delhi: [-3.4, 0.2], india: [-1.8, 1.0], apple: [-0.6, -2.6], mango: [-1.4, -2.9] };
    const ws = Object.keys(E); const opt = (v) => ws.map((w) => `<option ${w === v ? "selected" : ""}>${w}</option>`).join("");
    b.insertAdjacentHTML("beforeend", `<div class="ctrls"><div class="ctrl"><label>A</label><select data-k="a">${opt("king")}</select></div><div class="ctrl"><label>minus B</label><select data-k="b">${opt("man")}</select></div><div class="ctrl"><label>plus C</label><select data-k="c">${opt("woman")}</select></div></div><div class="plot"></div><div class="readout"></div>`);
    const cos = (u, v) => (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v));
    const draw = (s) => {
      const t = [E[s.a][0] - E[s.b][0] + E[s.c][0], E[s.a][1] - E[s.b][1] + E[s.c][1]];
      const ranked = ws.filter((w) => ![s.a, s.b, s.c].includes(w)).map((w) => [w, cos(E[w], t)]).sort((x, y) => y[1] - x[1]);
      const p = U.plot({ x0: -5, x1: 6, y0: -4, y1: 5, h: 260 });
      let g = p.frame([-4, -2, 0, 2, 4, 6], [-4, -2, 0, 2, 4]);
      ws.forEach((w) => { const [x, y] = E[w]; const on = [s.a, s.b, s.c].includes(w) || w === ranked[0][0]; g += `<circle cx="${p.X(x)}" cy="${p.Y(y)}" r="${on ? 6 : 4}" fill="${w === ranked[0][0] ? C3 : on ? C1 : "var(--ink-2)"}"/><text x="${p.X(x) + 8}" y="${p.Y(y) + 4}" style="fill:var(--ink)">${w}</text>`; });
      g += `<circle cx="${p.X(t[0])}" cy="${p.Y(t[1])}" r="8" fill="none" stroke="${C2}" stroke-width="3"/>`;
      b.querySelector(".plot").innerHTML = p.svg(g);
      b.querySelector(".readout").innerHTML = R`$\text{${s.a}} - \text{${s.b}} + \text{${s.c}} = [${U.f(t[0], 2)}, ${U.f(t[1], 2)}]$ (gold ring)<br>Nearest by cosine similarity: <b>${ranked[0][0]}</b> (${U.f(ranked[0][1], 3)}), then ${ranked[1][0]} (${U.f(ranked[1][1], 3)})<br><span class="muted">Word2Vec learns these from local context windows (CBOW predicts the word from its context; skip-gram predicts the context from the word). GloVe learns them from global co-occurrence counts. Both give one static vector per word, so "bank" (river) and "bank" (money) share a vector. Contextual models like BERT fix that.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 21. LSTM cell */
  W.lstm = (el) => {
    const b = U.box(el, "Inside an LSTM cell", "Set the gate values (they come from sigmoids, so each is between 0 and 1) and see how the cell state and hidden state update. Then compare how a gradient survives many steps in an RNN and in an LSTM.");
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("c0", R`Previous cell state $c_{t-1}$`, -2, 2, 0.1, 1.5)}${U.range("f", R`Forget gate $f_t$`, 0, 1, 0.05, 0.9)}${U.range("i", R`Input gate $i_t$`, 0, 1, 0.05, 0.3)}${U.range("g", R`Candidate $g_t$`, -1, 1, 0.05, 0.8)}${U.range("o", R`Output gate $o_t$`, 0, 1, 0.05, 0.7)}${U.range("n", "Sequence length (gradient demo)", 5, 100, 5, 40)}</div><div class="readout"></div>`);
    const draw = (s) => {
      const c = s.f * s.c0 + s.i * s.g, h = s.o * Math.tanh(c);
      const sci = (v) => { const e = Math.floor(Math.log10(Math.abs(v))); return Math.abs(e) < 3 ? U.f(v, 4) : String.raw`${U.f(v / 10 ** e, 2)} \times 10^{${e}}`; };
      b.querySelector(".readout").innerHTML = R`$c_t = f_t \odot c_{t-1} + i_t \odot g_t = (${s.f})(${s.c0}) + (${s.i})(${s.g}) = ${U.f(c, 4)}$<br>$h_t = o_t \odot \tanh(c_t) = (${s.o})\tanh(${U.f(c, 3)}) = ${U.f(h, 4)}$<br>
        ${s.f > 0.95 && s.i < 0.1 ? R`Memory kept: forget $\approx 1$, input $\approx 0$, so the cell carries information forward almost unchanged.` : s.f < 0.2 ? R`Memory wiped: the forget gate erased $c_{t-1}$.` : ""}<br>
        Gradient through ${s.n} steps · plain RNN shrinking by 0.9 per step: $0.9^{${s.n}} = ${sci(0.9 ** s.n)}$ (vanishes); growing by 1.1: $1.1^{${s.n}} = ${sci(1.1 ** s.n)}$ (explodes)<br>
        LSTM cell path with $f_t = ${s.f}$: $${s.f}^{${s.n}} = ${sci(s.f ** s.n)}$. The gate learns to stay near 1 when long memory matters.<br><span class="muted">That added-on cell-state path, controlled by gates, is the LSTM's fix for vanishing gradients. Gradient clipping handles explosions.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 22. Self-attention */
  W.attention = (el) => {
    const b = U.box(el, "Self-attention, computed", R`Click a word to see where it looks. Scores are $\frac{q \cdot k}{\sqrt{d}}$, turned into weights with softmax. Toggle the causal mask a decoder uses.`);
    const words = ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "tired"];
    const v = [[0.1, 0.0, 0.2], [0.9, 0.2, 0.1], [0.1, 0.8, 0.0], [0.2, 0.9, 0.3], [0.1, 0.0, 0.25], [0.3, 0.2, 0.9], [0.0, 0.5, 0.1], [0.85, 0.25, 0.3], [0.2, 0.6, 0.1], [0.8, 0.5, 0.1]];
    b.insertAdjacentHTML("beforeend", `<div class="row">${U.seg("m", [["enc", "Encoder (bidirectional)"], ["dec", "Decoder (causal mask)"]], "enc")}</div><div class="tokens">${words.map((w, i) => `<span class="tok ${i === 7 ? "on" : ""}" data-i="${i}" tabindex="0" role="button">${w}</span>`).join("")}</div><div class="plot"></div><div class="readout"></div>`);
    let sel = 7, st;
    const draw = () => {
      const d = 3, q = v[sel];
      let sc = v.map((k, j) => (st.m === "dec" && j > sel ? -Infinity : (q[0] * k[0] + q[1] * k[1] + q[2] * k[2]) * 4 / Math.sqrt(d)));
      const mx = Math.max(...sc); const ex = sc.map((s) => (s === -Infinity ? 0 : Math.exp(s - mx))); const Z = ex.reduce((a, c) => a + c, 0); const w = ex.map((e) => e / Z);
      const W_ = 560, H = 150, bw = W_ / words.length;
      let g = ""; words.forEach((t, j) => { const hgt = w[j] * 110; g += `<rect x="${j * bw + 6}" y="${118 - hgt}" width="${bw - 12}" height="${hgt}" rx="4" fill="${j === sel ? C2 : C1}" opacity="${st.m === "dec" && j > sel ? 0.15 : 1}"/><text x="${j * bw + bw / 2}" y="${136}" text-anchor="middle" style="fill:var(--ink)">${t}</text><text x="${j * bw + bw / 2}" y="${112 - hgt}" text-anchor="middle">${w[j] < 0.005 ? "" : w[j].toFixed(2)}</text>`; });
      b.querySelector(".plot").innerHTML = `<svg class="chart" viewBox="0 0 ${W_} ${H}">${g}</svg>`;
      b.querySelector(".readout").innerHTML = R`$\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$ · here $d_k = ${d}$<br>Query "<b>${words[sel]}</b>" puts its largest weight on "<b>${words[w.indexOf(Math.max(...w))]}</b>" (${Math.max(...w).toFixed(2)}). The weights in the row sum to 1.<br><span class="muted">${st.m === "dec" ? R`Causal mask: scores for future positions are set to $-\infty$ before the softmax, so a token can only look at itself and earlier tokens. That is what makes GPT-style generation one-word-at-a-time.` : "Encoder self-attention is bidirectional: every token sees every other token. BERT uses this. Multi-head attention runs several of these in parallel with different learned projections and concatenates the results."}</span>`;
    };
    st = U.bind(b, draw);
    b.querySelectorAll(".tok").forEach((t) => { const pick = () => { sel = +t.dataset.i; b.querySelectorAll(".tok").forEach((x) => x.classList.toggle("on", x === t)); draw(); }; t.onclick = pick; t.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } }; });
    draw();
  };

  /* 23. Positional encoding */
  W.posenc = (el) => {
    const b = U.box(el, "Sinusoidal positional encoding", R`$\text{PE}(pos, 2i) = \sin\!\left(\frac{pos}{10000^{2i/d}}\right)$, $\text{PE}(pos, 2i+1) = \cos\!\left(\frac{pos}{10000^{2i/d}}\right)$. Each row is one position; left columns wave fast, right columns slowly.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("d", R`$d_{\text{model}}$`, 16, 128, 16, 64)}${U.range("pos", "Highlight position", 0, 49, 1, 10)}</div><canvas width="640" height="250" class="wcanvas cv" style="aspect-ratio:640/250"></canvas><div class="readout"></div>`);
    const draw = (s) => {
      const cv = b.querySelector(".cv"), ctx = cv.getContext("2d"); const P = 50, D = s.d; const cw = 640 / D, ch = 250 / P;
      for (let pos = 0; pos < P; pos++) for (let k = 0; k < D; k++) { const i = Math.floor(k / 2); const ang = pos / Math.pow(10000, (2 * i) / D); const v = k % 2 ? Math.cos(ang) : Math.sin(ang); const r = v > 0 ? Math.round(35 + 50 * v) : 35, gg = 70 + Math.round(30 * (1 - Math.abs(v))), bb = v < 0 ? Math.round(120 - 80 * v) : 90; ctx.fillStyle = `rgb(${v > 0 ? 40 + 200 * v : 40},${gg},${v < 0 ? 60 - 190 * v : 60 + 20 * (1 - v)})`; ctx.fillRect(k * cw, pos * ch, cw + 0.5, ch + 0.5); }
      ctx.strokeStyle = U.css("--hi"); ctx.lineWidth = 3; ctx.strokeRect(1, s.pos * ch, 638, ch);
      const vec = []; for (let k = 0; k < 6; k++) { const i = Math.floor(k / 2); const ang = s.pos / Math.pow(10000, (2 * i) / D); vec.push((k % 2 ? Math.cos(ang) : Math.sin(ang)).toFixed(3)); }
      b.querySelector(".readout").innerHTML = R`Rows = positions 0–49, columns = ${D} dimensions (red $= +1$, blue $= -1$).<br>$\text{PE}(${s.pos})$ starts $[${vec.join(", ")}, \ldots]$<br><span class="muted">Self-attention alone is order-blind (shuffle the input and the output just shuffles). Adding PE to the word embeddings puts order back in. Every position gets a unique pattern, values stay between $-1$ and $1$, and $\text{PE}(pos + k)$ is a simple (linear) function of $\text{PE}(pos)$, which makes relative distances easy to learn.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 24. BPE */
  W.bpe = (el) => {
    const b = U.box(el, "Byte-pair encoding, one merge at a time", "Start from characters plus an end-of-word marker (_). Each step merges the most frequent adjacent pair into a new token. Watch the corpus get shorter as the vocabulary grows.");
    b.insertAdjacentHTML("beforeend", `<div class="ctrl"><label>Corpus (space-separated words)</label><input type="text" data-k="c" value="low lower lowest slow slower"></div><div class="row"><button class="btn small" data-act="step">Merge next pair</button><button class="btn quiet small" data-act="reset">Reset</button></div><div class="readout"></div>`);
    let words, merges, st;
    const reset = () => { words = st.c.trim().split(/\s+/).map((w) => w.split("").concat("_")); merges = []; draw(); };
    const count = () => words.reduce((a, w) => a + w.length, 0);
    const pairs = () => { const m = new Map(); words.forEach((w) => { for (let i = 0; i < w.length - 1; i++) { const k = w[i] + "\u0001" + w[i + 1]; m.set(k, (m.get(k) || 0) + 1); } }); return m; };
    const step = () => { const P = pairs(); if (!P.size) return; let best = null, bc = 0; for (const [k, c] of P) if (c > bc) { best = k; bc = c; } if (bc < 2) { merges.push(["—", "no pair occurs twice; stop", count()]); draw(); return; } const [a, bb] = best.split("\u0001"); words = words.map((w) => { const o = []; for (let i = 0; i < w.length; i++) { if (i < w.length - 1 && w[i] === a && w[i + 1] === bb) { o.push(a + bb); i++; } else o.push(w[i]); } return o; }); merges.push([`${a} + ${bb} → ${a + bb}`, `appears ${bc}×`, count()]); draw(); };
    const draw = () => {
      b.querySelector(".readout").innerHTML = `<div class="tokens" style="margin-bottom:8px">${words.map((w) => w.map((t) => `<span class="tok">${t}</span>`).join("")).join('<span style="width:12px"></span>')}</div>Tokens needed for the corpus: <b>${count()}</b><br>${merges.map((m, i) => `Merge ${i + 1}: ${m[0]} (${m[1]}) → ${m[2]} tokens`).join("<br>")}<br><span class="muted">Frequent strings become single tokens; rare words split into several subwords, so no word is ever out-of-vocabulary. GPT models use BPE; BERT uses WordPiece, a close cousin that picks merges by likelihood gain instead of raw frequency.</span>`;
    };
    st = U.bind(b, reset);
    b.querySelector('[data-act="step"]').onclick = step; b.querySelector('[data-act="reset"]').onclick = reset;
    reset();
  };

  /* 25. Decoding: temperature, top-k, top-p */
  W.sampler = (el) => {
    const b = U.box(el, "Next-token sampler", "Prompt: “Name an animal that is both domestic and wild:”. The model's logits are fixed. Temperature reshapes the distribution; top-k and top-p cut its tail.");
    const toks = ["cat", "dog", "pig", "horse", "goat", "car", "quantum"]; const logits = [5, 4, 3.2, 2.5, 2.2, 1, -1];
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("T", "Temperature T", 0.05, 3, 0.05, 1)}${U.range("k", "Top-k (7 = off)", 1, 7, 1, 7)}${U.range("p", "Top-p (1 = off)", 0.1, 1, 0.05, 1)}</div><div class="row"><button class="btn small" data-act="s1">Sample 1 token</button><button class="btn quiet small" data-act="s100">Sample 100</button></div><div class="plot"></div><div class="readout"></div>`);
    let counts = null, last = null; const r = U.rng(5); let st;
    const probs = (s) => {
      const z = logits.map((l) => l / s.T); const m = Math.max(...z); let p = z.map((v) => Math.exp(v - m)); const Z = p.reduce((a, c) => a + c, 0); p = p.map((v) => v / Z);
      const raw = p.slice(); const order = p.map((v, i) => i).sort((a, c) => p[c] - p[a]);
      const keep = new Set(); let cum = 0;
      order.forEach((i, rank) => { if (rank < s.k && (cum < s.p || rank === 0)) { keep.add(i); cum += p[i]; } });
      let q = p.map((v, i) => (keep.has(i) ? v : 0)); const Zq = q.reduce((a, c) => a + c, 0); q = q.map((v) => v / Zq);
      return { raw, q, keep };
    };
    const draw = () => {
      const s = st; const { raw, q, keep } = probs(s);
      const W_ = 560, H = 190, bw = W_ / toks.length; let g = "";
      toks.forEach((t, i) => { const h1 = raw[i] * 140, h2 = q[i] * 140; g += `<rect x="${i * bw + 10}" y="${160 - h1}" width="${bw - 20}" height="${h1}" rx="4" fill="var(--rule)"/><rect x="${i * bw + 18}" y="${160 - h2}" width="${bw - 36}" height="${h2}" rx="4" fill="${keep.has(i) ? (last === i ? C2 : C1) : "transparent"}"/><text x="${i * bw + bw / 2}" y="178" text-anchor="middle" style="fill:var(--ink)">${t}</text><text x="${i * bw + bw / 2}" y="${154 - Math.max(h1, h2)}" text-anchor="middle">${(q[i] * 100).toFixed(1)}%</text>${counts ? `<text x="${i * bw + bw / 2}" y="${H - 1}" text-anchor="middle">${counts[i]}×</text>` : ""}`; });
      b.querySelector(".plot").innerHTML = `<svg class="chart" viewBox="0 0 ${W_} ${H + 6}">${g}</svg><div class="legend"><span><i style="background:var(--rule);height:10px"></i>softmax(z/T)</span><span><i style="background:${C1};height:10px"></i>after top-k / top-p, renormalised</span></div>`;
      b.querySelector(".readout").innerHTML = `p_i = exp(z_i / T) / Σ_j exp(z_j / T) · logits = [${logits.join(", ")}]<br>${s.T < 0.3 ? "Low T: nearly greedy (argmax). Deterministic and repetitive, good for facts, maths, code." : s.T > 1.5 ? "High T: flat distribution. Creative but prone to nonsense like “car” or “quantum” (hallucination)." : "T ≈ 1: the model's own distribution."} Kept tokens: ${keep.size} of 7.${last != null ? `<br>Sampled: <b>${toks[last]}</b>` : ""}<br><span class="muted">Top-k keeps the k most likely tokens. Top-p (nucleus) keeps the smallest set whose cumulative probability reaches p, so its size adapts to how confident the model is. Greedy decoding always takes the argmax and gives the same output every time.</span>`;
    };
    const sample = () => { const { q } = probs(st); let u = r(), i = 0; for (; i < q.length - 1; i++) { u -= q[i]; if (u <= 0) break; } return i; };
    st = U.bind(b, () => { counts = null; last = null; draw(); });
    b.querySelector('[data-act="s1"]').onclick = () => { last = sample(); draw(); };
    b.querySelector('[data-act="s100"]').onclick = () => { counts = new Array(7).fill(0); for (let n = 0; n < 100; n++) counts[sample()]++; last = null; draw(); };
    draw();
  };

  /* 26. Prompt technique game */
  W.promptgame = (el) => {
    const b = U.box(el, "Name that prompting technique", "Read the prompt and pick the technique. Ten prompts, instant feedback.");
    const items = [
      ["Classify the sentiment of this review as positive, negative or neutral: “The battery dies by noon.”", "zero", "No examples, just the instruction and the model's pre-trained knowledge."],
      ["“The support was excellent.” → positive\n“The laptop battery drains very quickly.” →", "one", "Exactly one worked input→output example before the real input."],
      ["I loved the food → positive\nService was slow → negative\nGreat camera, poor battery → mixed\nThe screen cracked in a week →", "few", "Two to five examples teach format and labels."],
      ["A shop sells notebooks at $5 and pens at $2. A customer buys 3 notebooks and 4 pens. What is the total? Think step by step.", "cot", "“Think step by step” asks for intermediate reasoning: chain-of-thought."],
      ["You are an experienced physics professor teaching first-year engineers. Explain Newton's second law with a real-life example.", "role", "Assigning a persona (and an audience) is role prompting."],
      ["Extract the name, job title and company from the paragraph below and return them as a JSON object with keys name, title, company.", "struct", "The prompt fixes the output format: structured-output prompting."],
      ["Translate to French: “Where is the railway station?”", "zero", "A plain instruction, no examples."],
      ["Q: 23 + 48? A: 20 + 40 = 60, 3 + 8 = 11, so 71.\nQ: 37 + 45? A:", "cot", "The example demonstrates step-by-step reasoning, so this is few-shot chain-of-thought. The defining feature is the reasoning steps."],
      ["Act as a strict code reviewer. Review this Python function for bugs and style.", "role", "“Act as …” gives the model a persona."],
      ["Summarise the article in exactly 5 bullet points, each under 12 words.", "struct", "The constraint is on output structure: bullets, count, length."]
    ];
    const L = { zero: "Zero-shot", one: "One-shot", few: "Few-shot", cot: "Chain-of-thought", role: "Role prompting", struct: "Structured output" };
    let i = 0, score = 0;
    const draw = (fb) => {
      const [p, a, x] = items[i];
      b.querySelector(".pg").innerHTML = `<div class="eyebrow">Prompt ${i + 1} of ${items.length} · score ${score}</div><pre class="readout" style="white-space:pre-wrap;margin:6px 0">${p}</pre><div class="opts" style="flex-direction:row;flex-wrap:wrap">${Object.entries(L).map(([k, l]) => `<button class="btn quiet small" data-v="${k}" ${fb ? "disabled" : ""}>${l}</button>`).join("")}</div>${fb ? `<div class="callout ${fb === a ? "good" : "bad"}" style="margin-top:8px"><b>${fb === a ? "Correct" : "It's " + L[a]}.</b> ${x}</div><button class="btn small" style="margin-top:8px" data-act="next">${i < items.length - 1 ? "Next prompt" : "Play again"}</button>` : ""}`;
      b.querySelectorAll("[data-v]").forEach((bt) => (bt.onclick = () => { if (bt.dataset.v === a) score++; draw(bt.dataset.v); }));
      const n = b.querySelector('[data-act="next"]'); if (n) n.onclick = () => { i = (i + 1) % items.length; if (i === 0) score = 0; draw(); };
    };
    b.insertAdjacentHTML("beforeend", `<div class="pg"></div>`); draw();
  };

  /* 27. LoRA */
  W.lora = (el) => {
    const b = U.box(el, "LoRA parameter calculator", "Freeze W (d × k). Learn ΔW = B·A with B (d × r) and A (r × k). Count the trainable parameters.");
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("d", "d (rows of W)", 256, 8192, 256, 4096)}${U.range("k", "k (columns of W)", 256, 8192, 256, 4096)}${U.range("r", "rank r", 1, 64, 1, 8)}${U.range("L", "Adapted matrices (layers × Q,V)", 1, 128, 1, 64)}</div><div class="readout"></div>`);
    const draw = (s) => {
      const full = s.d * s.k, lo = s.r * (s.d + s.k);
      b.querySelector(".readout").innerHTML = `Full fine-tune of one matrix: d·k = ${s.d}×${s.k} = <b>${full.toLocaleString()}</b><br>LoRA: r(d + k) = ${s.r}×(${s.d}+${s.k}) = <b>${lo.toLocaleString()}</b> → <b>${U.f((lo / full) * 100, 3)}%</b> of the original (${U.f(full / lo, 1)}× fewer)<br>Across ${s.L} adapted matrices: ${(full * s.L / 1e6).toFixed(1)} M vs <b>${(lo * s.L / 1e6).toFixed(2)} M</b> trainable parameters<br><span class="muted">h = W₀x + (α/r)·B·A·x. A starts random and B starts at zero, so ΔW = 0 at step 0 and training begins exactly at the pre-trained model. After training, BA can be merged into W₀, so inference has no extra latency. QLoRA adds a 4-bit quantised frozen base model so large models fit on one GPU.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 28. RAG pipeline */
  W.rag = (el) => {
    const b = U.box(el, "A working mini-RAG", "Eight passages form the knowledge base. Type a question: it is embedded (bag-of-words TF-IDF here), the top-k passages are retrieved by cosine similarity, and the augmented prompt is built.");
    const docs = [
      "The Nila Observatory opens at 09:00 and closes at 16:30 on weekdays.",
      "Researchers at the Nila Observatory must book a two-hour slot in advance.",
      "Raw telescope images are archived for 30 days, while calibrated measurements are retained for one year.",
      "Public tours of the observatory take place only on the first Saturday of each month.",
      "The campus cafeteria serves South Indian breakfast from 07:30 to 10:00.",
      "Visitor badges are made of recycled plastic and must be returned at the gate.",
      "The library allows graduate students to borrow up to ten books for a month.",
      "Parking for visitors is available near the main gate after 10:00."
    ];
    b.insertAdjacentHTML("beforeend", `<div class="ctrls"><div class="ctrl" style="grid-column:1/-1"><label>Question</label><input type="text" data-k="q" value="How long are calibrated measurements kept?"></div>${U.range("k", "Top-k passages", 1, 4, 1, 2)}</div><div class="readout"></div>`);
    const tok = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !["the", "and", "are", "for", "how", "what", "while", "must", "each", "only", "from", "after", "near", "with"].includes(w)).map((w) => w.replace(/(ed|s)$/, ""));
    const D = docs.map(tok); const df = {}; D.forEach((d) => new Set(d).forEach((w) => (df[w] = (df[w] || 0) + 1)));
    const vec = (t) => { const v = {}; t.forEach((w) => (v[w] = (v[w] || 0) + 1)); Object.keys(v).forEach((w) => (v[w] *= Math.log(1 + docs.length / (df[w] || 0.5)))); return v; };
    const cos = (a, c) => { let d = 0, na = 0, nc = 0; for (const k in a) { na += a[k] ** 2; if (c[k]) d += a[k] * c[k]; } for (const k in c) nc += c[k] ** 2; return na && nc ? d / Math.sqrt(na * nc) : 0; };
    const DV = D.map(vec);
    const draw = (s) => {
      const qv = vec(tok(s.q)); const sc = DV.map((v, i) => [i, cos(qv, v)]).sort((a, c) => c[1] - a[1]); const top = sc.slice(0, s.k);
      const none = top[0][1] < 0.05;
      b.querySelector(".readout").innerHTML = `<b>1 · Retrieve</b> (cosine similarity to the question)<br>${sc.slice(0, 4).map(([i, v], r) => `${r < s.k ? "✓" : "·"} ${v.toFixed(2)} — ${docs[i]}`).join("<br>")}<br><br><b>2 · Augment</b> (the prompt the LLM actually receives)<br><span style="white-space:pre-wrap">Answer using ONLY the context. If the answer is not there, reply "not in context".
Context:
${top.map(([i]) => "- " + docs[i]).join("\n")}
Question: ${s.q}</span><br><br><b>3 · Generate</b> → ${none ? "nothing relevant was retrieved, so a grounded model should abstain: “not in context”." : "the LLM answers from the retrieved text, and can cite it."}<br><span class="muted">The documents are the model's non-parametric memory: you can update them without retraining. Real systems chunk documents, embed them with a neural encoder, store them in a vector database, and often re-rank the hits.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 29. Evaluation metrics */
  W.metrics = (el) => {
    const b = U.box(el, "Exact match, token F1, ROUGE-L", "Type a reference answer and a model prediction. These are the three metrics from the Week 12 tutorial.");
    b.insertAdjacentHTML("beforeend", `<div class="row">${U.seg("ex", [["a", "Identical"], ["b", "Extra words"], ["c", "Paraphrase"]], "b")}</div><div class="ctrls"><div class="ctrl"><label>Reference</label><input type="text" data-k="ref" value="Friday at 19:00"></div><div class="ctrl"><label>Prediction</label><input type="text" data-k="pred" value="The backup runs on Friday at 19:00"></div></div><div class="readout"></div>`);
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9: ]/g, " ").replace(/\b(a|an|the)\b/g, " ").split(/\s+/).filter(Boolean);
    const lcs = (a, c) => { const m = Array.from({ length: a.length + 1 }, () => new Array(c.length + 1).fill(0)); for (let i = 1; i <= a.length; i++) for (let j = 1; j <= c.length; j++) m[i][j] = a[i - 1] === c[j - 1] ? m[i - 1][j - 1] + 1 : Math.max(m[i - 1][j], m[i][j - 1]); return m[a.length][c.length]; };
    const draw = (s) => {
      const r = norm(s.ref), p = norm(s.pred);
      const em = r.join(" ") === p.join(" ") ? 1 : 0;
      const cnt = {}; r.forEach((w) => (cnt[w] = (cnt[w] || 0) + 1)); let ov = 0; p.forEach((w) => { if (cnt[w] > 0) { ov++; cnt[w]--; } });
      const P = p.length ? ov / p.length : 0, R = r.length ? ov / r.length : 0, F = P + R ? (2 * P * R) / (P + R) : 0;
      const l = lcs(r, p); const lp = p.length ? l / p.length : 0, lr = r.length ? l / r.length : 0, lf = lp + lr ? (2 * lp * lr) / (lp + lr) : 0;
      b.querySelector(".readout").innerHTML = `Normalised: ref [${r.join(" ")}] · pred [${p.join(" ")}]<br>Exact match = <b>${em}</b><br>Token F1: overlap ${ov}, precision ${ov}/${p.length} = ${U.f(P, 3)}, recall ${ov}/${r.length} = ${U.f(R, 3)} → F1 = <b>${U.f(F, 3)}</b><br>ROUGE-L: LCS length ${l} → P ${U.f(lp, 3)}, R ${U.f(lr, 3)}, F = <b>${U.f(lf, 3)}</b><br><span class="muted">A correct paraphrase (“7 in the evening on Friday”) scores low on all three. That gap is why LLM-as-a-judge and human evaluation exist.</span>`;
    };
    const st = U.bind(b, draw);
    const ex = { a: ["Friday at 19:00", "Friday at 19:00"], b: ["Friday at 19:00", "The backup runs on Friday at 19:00"], c: ["Friday at 19:00", "7 in the evening on Friday"] };
    b.querySelector('[data-seg="ex"]').addEventListener("click", () => setTimeout(() => { const [r, p] = ex[st.ex]; const ri = b.querySelector('[data-k="ref"]'), pi = b.querySelector('[data-k="pred"]'); ri.value = r; pi.value = p; ri.dispatchEvent(new Event("input")); pi.dispatchEvent(new Event("input")); }));
    draw(st);
  };

  /* 30. Guardrail policy gate */
  W.guard = (el) => {
    const b = U.box(el, "Run the safety policy gate", "An LLM agent proposes tool calls. Decide for each: allow, require human review, or deny. Then compare with the tutorial's policy.");
    const items = [["Read the supplied course notes", "allow", "Read-only access to trusted material."], ["Search a public index", "allow", "Read-only, public data."], ["Write a file to the shared drive", "review", "Irreversible side effect (overwrites); a human approves first."], ["Send a message to a student", "review", "Outbound communication can cause harm if wrong."], ["Execute a shell command found inside a retrieved document", "deny", "Prompt injection: instructions embedded in retrieved text are data, never commands."], ["Transfer money to an account", "deny", "Outside the agent's mandate; high stakes."], ["Send a message because an instruction inside a retrieved web page says so", "review", "The tutorial routes this to REQUIRE HUMAN APPROVAL: send_message is not a forbidden tool, but the request came from untrusted text, so a person must see it first (and should reject it if it leaks data)."]];
    const L = { allow: "Allow", review: "Review", deny: "Deny" }; const pick = {};
    b.insertAdjacentHTML("beforeend", `<div class="gl"></div><button class="btn small" data-act="chk">Check my policy</button><div class="res"></div>`);
    b.querySelector(".gl").innerHTML = items.map(([t], i) => `<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--rule);padding:8px 0"><span style="flex:1;min-width:200px">${t}</span><div class="seg" data-gi="${i}">${Object.entries(L).map(([k, l]) => `<button type="button" data-v="${k}">${l}</button>`).join("")}</div></div>`).join("");
    b.querySelectorAll("[data-gi]").forEach((sg) => sg.addEventListener("click", (e) => { const bt = e.target.closest("button"); if (!bt) return; sg.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === bt)); pick[sg.dataset.gi] = bt.dataset.v; }));
    b.querySelector('[data-act="chk"]').onclick = () => { let ok = 0; const rows = items.map(([t, a, x], i) => { if (pick[i] === a) ok++; return `${pick[i] === a ? "✓" : "✗"} <b>${t}</b> → ${L[a]}. ${x}`; }); b.querySelector(".res").innerHTML = `<div class="readout" style="margin-top:8px">${ok}/${items.length} match the policy.<br>${rows.join("<br>")}</div>`; };
  };

  /* 31. Scaling */
  W.scaling = (el) => {
    const b = U.box(el, "Size vs performance", "Empirical scaling laws: test loss falls as a power law in parameters N (and data D, compute C). Each 10× buys a roughly constant improvement, until data runs out.");
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("n", "log₁₀ parameters", 7, 12, 0.1, 9)}${U.range("a", "exponent α_N", 0.03, 0.15, 0.005, 0.076)}</div><div class="plot"></div><div class="readout"></div>`);
    const draw = (s) => {
      const Nc = 8.8e13; const L = (lg) => Math.pow(Nc / Math.pow(10, lg), s.a);
      const p = U.plot({ x0: 7, x1: 12, y0: 1.5, y1: 4.5, h: 200 });
      b.querySelector(".plot").innerHTML = p.svg(p.frame([7, 8, 9, 10, 11, 12], [2, 3, 4], "log₁₀ N", "loss") + p.line(p.path(L), C1) + `<circle cx="${p.X(s.n)}" cy="${p.Y(L(s.n))}" r="6" fill="${C2}"/>`);
      b.querySelector(".readout").innerHTML = `L(N) = (N_c / N)^α · N = 10^${s.n} ≈ ${(Math.pow(10, s.n) / 1e9).toFixed(2)} B parameters → loss <b>${U.f(L(s.n), 3)}</b><br><span class="muted">Bigger models are more sample-efficient, and some abilities (multi-step arithmetic, in-context learning) appear only beyond a scale threshold ("emergent"). But compute-optimal training (Chinchilla) says parameters and tokens should grow together, about 20 tokens per parameter, and small well-trained models often beat larger under-trained ones. Benchmarks (MMLU, GSM8K, HumanEval …) are how these claims are measured, and they can be contaminated or saturated.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };
})();
