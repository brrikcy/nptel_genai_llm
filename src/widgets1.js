/* Interactive models, part 1: deep-learning foundations, autoencoders, VAEs, GANs */
(function () {
  "use strict";
  const W = (window.WIDGETS = window.WIDGETS || {});
  let UID = 0;
  const U = (W._util = {});
  U.css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  U.box = (el, title, note) => {
    el.innerHTML = `<div class="widget"><div class="widget-h"><h3>${title}</h3><span class="chip acc">Try it</span></div><div class="widget-b">${note ? `<p class="small muted">${note}</p>` : ""}</div></div>`;
    return el.querySelector(".widget-b");
  };
  U.range = (k, label, min, max, step, val) => { const id = "w" + ++UID; return `<div class="ctrl"><label for="${id}">${label}<output data-o="${k}">${val}</output></label><input type="range" id="${id}" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`; };
  U.seg = (k, opts, val) => `<div class="seg" data-seg="${k}">${opts.map(([v, l]) => `<button type="button" data-v="${v}" class="${v == val ? "on" : ""}">${l}</button>`).join("")}</div>`;
  U.bind = (root, onChange, fmt = {}) => {
    const st = {};
    root.querySelectorAll("[data-k]").forEach((inp) => {
      const k = inp.dataset.k; const o = root.querySelector(`[data-o="${k}"]`);
      const read = () => { st[k] = inp.type === "range" || inp.type === "number" ? parseFloat(inp.value) : inp.value; if (o) o.textContent = fmt[k] ? fmt[k](st[k]) : inp.value; };
      read(); inp.addEventListener("input", () => { read(); onChange(st); });
    });
    root.querySelectorAll("[data-seg]").forEach((sg) => {
      const k = sg.dataset.seg; st[k] = sg.querySelector(".on").dataset.v;
      sg.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; sg.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); st[k] = b.dataset.v; onChange(st); });
    });
    return st;
  };
  U.plot = (o) => {
    const p = Object.assign({ w: 520, h: 250, padL: 38, padR: 12, padT: 12, padB: 26 }, o);
    p.X = (x) => p.padL + ((x - p.x0) / (p.x1 - p.x0)) * (p.w - p.padL - p.padR);
    p.Y = (y) => p.h - p.padB - ((y - p.y0) / (p.y1 - p.y0)) * (p.h - p.padT - p.padB);
    p.cid = "c" + ++UID;
    p.path = (fn, n = 240) => { let d = ""; const lo = p.y0 - (p.y1 - p.y0), hi = p.y1 + (p.y1 - p.y0); for (let i = 0; i <= n; i++) { const x = p.x0 + ((p.x1 - p.x0) * i) / n; let y = fn(x); if (!isFinite(y)) continue; y = Math.max(lo, Math.min(hi, y)); d += (d ? "L" : "M") + p.X(x).toFixed(1) + "," + p.Y(y).toFixed(1); } return d; };
    p.frame = (xt, yt, xl, yl) => {
      let g = `<defs><clipPath id="${p.cid}"><rect x="${p.padL}" y="${p.padT}" width="${p.w - p.padL - p.padR}" height="${p.h - p.padT - p.padB}"/></clipPath></defs>`;
      yt.forEach((v) => (g += `<line x1="${p.padL}" x2="${p.w - p.padR}" y1="${p.Y(v)}" y2="${p.Y(v)}" stroke="var(--rule)" ${v ? 'stroke-dasharray="3 4"' : ""}/><text x="${p.padL - 6}" y="${p.Y(v) + 4}" text-anchor="end">${v}</text>`));
      xt.forEach((v) => (g += `<line x1="${p.X(v)}" x2="${p.X(v)}" y1="${p.padT}" y2="${p.h - p.padB}" stroke="var(--rule)" ${v ? 'stroke-dasharray="3 4"' : ""}/><text x="${p.X(v)}" y="${p.h - 8}" text-anchor="middle">${v}</text>`));
      if (xl) g += `<text x="${p.w - p.padR}" y="${p.h - p.padB - 6}" text-anchor="end">${xl}</text>`;
      if (yl) g += `<text x="${p.padL + 6}" y="${p.padT + 12}">${yl}</text>`;
      return g;
    };
    p.svg = (inner) => `<svg class="chart" viewBox="0 0 ${p.w} ${p.h}">${inner}</svg>`;
    p.line = (d, col, extra = "") => `<path d="${d}" fill="none" stroke="${col}" stroke-width="2.4" clip-path="url(#${p.cid})" ${extra}/>`;
    return p;
  };
  U.f = (x, d = 3) => (Math.abs(x) < 1e-12 ? "0" : Number(x).toFixed(d).replace(/\.?0+$/, "") || "0");
  U.rng = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  U.gauss = (r) => { const u = Math.max(1e-9, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  U.npdf = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (Math.sqrt(2 * Math.PI) * s);
  const C1 = "var(--accent)", C2 = "var(--hi)", C3 = "var(--good)", C4 = "var(--bad)";

  /* 1. Activation functions */
  W.activation = (el) => {
    const b = U.box(el, "Activation function explorer", R`Pick a function and move $x$. The solid line is the function, the dashed line is its slope (gradient). Notice where the slope dies to 0.`);
    b.insertAdjacentHTML("beforeend", `${U.seg("f", [["sigmoid", "Sigmoid"], ["tanh", "Tanh"], ["relu", "ReLU"], ["leaky", "Leaky ReLU"], ["elu", "ELU"], ["gelu", "GELU"], ["silu", "SiLU"], ["linear", "Linear"]], "sigmoid")}
      <div class="ctrls">${U.range("x", R`Input $x$`, -6, 6, 0.1, 2)}</div><div class="plot"></div><div class="readout"></div>`);
    const F = {
      sigmoid: [(x) => 1 / (1 + Math.exp(-x)), (x) => { const s = 1 / (1 + Math.exp(-x)); return s * (1 - s); }, R`$\sigma(x) = \frac{1}{1+e^{-x}}$ · range $(0,1)$ · max slope $0.25$ at $x=0$`, R`Output layer for yes/no answers (with BCE). Flat for $|x| > 4$ → vanishing gradient.`],
      tanh: [Math.tanh, (x) => 1 - Math.tanh(x) ** 2, R`$\tanh(x)$ · range $(-1,1)$ · centred on 0 · max slope 1`, "Centred on zero, but still flat at both ends. Used inside RNN/LSTM cells."],
      relu: [(x) => Math.max(0, x), (x) => (x > 0 ? 1 : 0), R`$\text{ReLU}(x) = \max(0, x)$ · slope 1 for $x>0$, 0 for $x \lt 0$`, R`Default for hidden layers: cheap, never flat for $x>0$. Risk: “dead” neurons when $x$ stays negative.`],
      leaky: [(x) => (x > 0 ? x : 0.01 * x), (x) => (x > 0 ? 1 : 0.01), R`$\text{LeakyReLU}(x) = \max(0.01x,\ x)$`, R`Keeps a small slope for $x \lt 0$, fixing dying ReLU. Used in CNNs, AEs, VAEs, GAN discriminators.`],
      elu: [(x) => (x > 0 ? x : Math.exp(x) - 1), (x) => (x > 0 ? 1 : Math.exp(x)), R`$\text{ELU}(x) = x$ if $x>0$, else $\alpha(e^{x} - 1)$, with $\alpha = 1$`, R`Smooth negative side that levels off at $-\alpha$. $\text{ELU}(-1) = -0.6321$.`],
      gelu: [(x) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3))), (x) => { const h = 1e-4, g = (v) => 0.5 * v * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (v + 0.044715 * v ** 3))); return (g(x + h) - g(x - h)) / (2 * h); }, R`$\text{GELU}(x) = x\,\Phi(x) \approx 0.5x\left(1 + \tanh\left(\sqrt{2/\pi}\,(x + 0.044715x^3)\right)\right)$`, R`The activation of Transformers and LLMs. $\text{GELU}(1) = 0.8413$, $\text{GELU}(-1) = -0.1587$.`],
      silu: [(x) => x / (1 + Math.exp(-x)), (x) => { const s = 1 / (1 + Math.exp(-x)); return s + x * s * (1 - s); }, R`$\text{SiLU}(x) = \text{Swish}(x) = x\,\sigma(x)$`, "Smooth, dips slightly below zero. Used in diffusion-model U-Nets."],
      linear: [(x) => x, () => 1, R`$f(x) = x$`, "Output layer for predicting real numbers (with MSE)."]
    };
    const draw = (s) => {
      const [f, df, eq, use] = F[s.f];
      const p = U.plot({ x0: -6, x1: 6, y0: -1.5, y1: 1.5 * (["relu", "leaky", "linear", "elu", "gelu", "silu"].includes(s.f) ? 4 : 1) });
      const y1 = p.y1; const yt = y1 > 2 ? [-1, 0, 2, 4, 6] : [-1, 0, 1];
      b.querySelector(".plot").innerHTML = p.svg(p.frame([-6, -3, 0, 3, 6], yt) + p.line(p.path(f), C1) + p.line(p.path(df), C2, 'stroke-dasharray="6 4"') +
        `<circle cx="${p.X(s.x)}" cy="${p.Y(f(s.x))}" r="6" fill="${C1}"/><circle cx="${p.X(s.x)}" cy="${p.Y(df(s.x))}" r="5" fill="${C2}"/>`) +
        `<div class="legend"><span><i style="background:${C1}"></i>function f(x)</span><span><i style="background:${C2}"></i>slope f′(x)</span></div>`;
      b.querySelector(".readout").innerHTML = `${eq}<br>$f(${s.x}) = ${U.f(f(s.x), 4)}$ · slope $f'(${s.x}) = ${U.f(df(s.x), 4)}$<br><span class="muted">${use}</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 2. Optimizer race on an elongated bowl */
  W.optim = (el) => {
    const b = U.box(el, "Optimizer race", R`Loss surface $f(x,y) = 0.5x^2 + 5y^2$: a long narrow valley seen from above (the rings are contour lines). All four optimizers start at the same point. Change the learning rate and watch who zig-zags and who glides.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("lr", R`Learning rate $\eta$`, 0.01, 0.25, 0.01, 0.15)}${U.range("steps", "Steps", 5, 80, 1, 30)}</div><div class="plot"></div><div class="readout"></div>`);
    const f = (x, y) => 0.5 * x * x + 5 * y * y, g = (x, y) => [x, 10 * y];
    const run = (kind, lr, n) => {
      let x = -4.5, y = 1.6, vx = 0, vy = 0, sx = 0, sy = 0, mx = 0, my = 0, t = 0; const pts = [[x, y]];
      for (let i = 0; i < n; i++) {
        const [gx, gy] = g(x, y); t++;
        if (kind === "gd") { x -= lr * gx; y -= lr * gy; }
        else if (kind === "mom") { vx = 0.9 * vx + 0.1 * gx; vy = 0.9 * vy + 0.1 * gy; x -= lr * vx; y -= lr * vy; }
        else if (kind === "rms") { sx = 0.9 * sx + 0.1 * gx * gx; sy = 0.9 * sy + 0.1 * gy * gy; x -= (lr * gx) / (Math.sqrt(sx) + 1e-8); y -= (lr * gy) / (Math.sqrt(sy) + 1e-8); }
        else { mx = 0.9 * mx + 0.1 * gx; my = 0.9 * my + 0.1 * gy; sx = 0.999 * sx + 0.001 * gx * gx; sy = 0.999 * sy + 0.001 * gy * gy; const mhx = mx / (1 - 0.9 ** t), mhy = my / (1 - 0.9 ** t), shx = sx / (1 - 0.999 ** t), shy = sy / (1 - 0.999 ** t); x -= (lr * 2 * mhx) / (Math.sqrt(shx) + 1e-8); y -= (lr * 2 * mhy) / (Math.sqrt(shy) + 1e-8); }
        if (!isFinite(x) || Math.abs(x) > 50 || Math.abs(y) > 50) { pts.push([Math.sign(x) * 50, Math.sign(y) * 50]); break; }
        pts.push([x, y]);
      }
      return pts;
    };
    const draw = (s) => {
      const p = U.plot({ x0: -5, x1: 5, y0: -2, y1: 2, h: 260 });
      let g = p.frame([-4, -2, 0, 2, 4], [-2, -1, 0, 1, 2]);
      [0.5, 2, 5, 10, 16].forEach((lv) => { const a = Math.sqrt(2 * lv), c = Math.sqrt(lv / 5); g += `<ellipse cx="${p.X(0)}" cy="${p.Y(0)}" rx="${p.X(a) - p.X(0)}" ry="${p.Y(0) - p.Y(c)}" fill="none" stroke="var(--rule)" stroke-width="1.2" clip-path="url(#${p.cid})"/>`; });
      const kinds = [["gd", "SGD", C4], ["mom", "Momentum (EWMA, β = 0.9)", C2], ["rms", "RMSProp", C3], ["adam", "Adam", C1]];
      let out = [];
      kinds.forEach(([k, name, col]) => { const pts = run(k, s.lr, s.steps); g += `<polyline points="${pts.map(([x, y]) => p.X(x).toFixed(1) + "," + p.Y(y).toFixed(1)).join(" ")}" fill="none" stroke="${col}" stroke-width="2" clip-path="url(#${p.cid})"/>`; const [x, y] = pts[pts.length - 1]; g += `<circle cx="${p.X(Math.max(-5, Math.min(5, x)))}" cy="${p.Y(Math.max(-2, Math.min(2, y)))}" r="4" fill="${col}"/>`; out.push(`${name}: loss <b>${Math.abs(x) >= 50 ? "diverged" : U.f(f(x, y), 4)}</b>`); });
      g += `<circle cx="${p.X(0)}" cy="${p.Y(0)}" r="4" fill="var(--ink)"/>`;
      b.querySelector(".plot").innerHTML = p.svg(g) + `<div class="legend">${kinds.map(([, n, c]) => `<span><i style="background:${c}"></i>${n}</span>`).join("")}</div>`;
      b.querySelector(".readout").innerHTML = out.join(" · ") + `<br><span class="muted">Plain gradient descent blows up along the steep $y$ direction once $\eta > 0.2$ (each step multiplies $y$ by $1 - 10\eta \lt -1$). RMSProp and Adam divide by a running average of slope sizes, so each direction gets its own step size.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 3. Convolution stepper */
  W.conv = (el) => {
    const b = U.box(el, "Convolution, step by step", R`A $3 \times 3$ kernel slides over a $6 \times 6$ image. Each output cell = multiply the overlapping pairs and add. Change padding and stride, then press Step.`);
    const img = [[3, 0, 1, 2, 7, 4], [1, 5, 8, 9, 3, 1], [2, 7, 2, 5, 1, 3], [0, 1, 3, 1, 7, 8], [4, 2, 1, 6, 2, 8], [2, 4, 5, 2, 3, 9]];
    const K = { vert: [[1, 0, -1], [1, 0, -1], [1, 0, -1]], horiz: [[1, 1, 1], [0, 0, 0], [-1, -1, -1]], sharp: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], box: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] };
    b.insertAdjacentHTML("beforeend", `<div class="row">${U.seg("k", [["vert", "Vertical edge"], ["horiz", "Horizontal edge"], ["sharp", "Sharpen"], ["box", "Box sum"]], "vert")}</div>
      <div class="row">${U.seg("p", [["0", "padding 0 (valid)"], ["1", "padding 1 (same)"]], "0")}${U.seg("s", [["1", "stride 1"], ["2", "stride 2"]], "1")}</div>
      <div class="row" style="align-items:flex-start;gap:20px"><div><div class="eyebrow">Input (with padding)</div><div class="gin" style="margin-top:6px"></div></div><div><div class="eyebrow">Kernel</div><div class="gk" style="margin-top:6px"></div></div><div><div class="eyebrow">Feature map</div><div class="gout" style="margin-top:6px"></div></div></div>
      <div class="row"><button class="btn small" data-act="step">Step →</button><button class="btn quiet small" data-act="all">Fill all</button><button class="btn quiet small" data-act="reset">Reset</button></div>
      <div class="readout"></div>`);
    let pos = -1, st;
    const grid = (m, cls) => `<div class="grid-cells" style="grid-template-columns:repeat(${m[0].length},30px)">${m.map((r, i) => r.map((v, j) => `<span class="${cls ? cls(i, j) : ""}">${v === null ? "" : v}</span>`).join("")).join("")}</div>`;
    const draw = () => {
      const p = +st.p, s = +st.s, k = K[st.k]; const n = 6 + 2 * p;
      const X = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i < p || j < p || i >= 6 + p || j >= 6 + p ? 0 : img[i - p][j - p])));
      const o = Math.floor((6 + 2 * p - 3) / s) + 1;
      const out = Array.from({ length: o }, () => Array(o).fill(null)); let calc = "";
      const val = (r, c) => { let sum = 0, terms = []; for (let a = 0; a < 3; a++) for (let bb = 0; bb < 3; bb++) { sum += X[r * s + a][c * s + bb] * k[a][bb]; if (k[a][bb]) terms.push(`${X[r * s + a][c * s + bb]} \\times (${k[a][bb]})`); } return [sum, terms]; };
      for (let q = 0; q <= Math.min(pos, o * o - 1); q++) { const r = Math.floor(q / o), c = q % o; out[r][c] = val(r, c)[0]; }
      let hl = null;
      if (pos >= 0 && pos < o * o) { const r = Math.floor(pos / o), c = pos % o; hl = [r * s, c * s]; const [sum, terms] = val(r, c); calc = `Output row ${r + 1}, column ${c + 1}: $${terms.join(" + ")} = ${sum}$`; }
      b.querySelector(".gin").innerHTML = grid(X, (i, j) => (hl && i >= hl[0] && i < hl[0] + 3 && j >= hl[1] && j < hl[1] + 3 ? "hl" : (i < p || j < p || i >= 6 + p || j >= 6 + p) ? "pad" : ""));
      b.querySelector(".gk").innerHTML = grid(k);
      b.querySelector(".gout").innerHTML = grid(out, (i, j) => (pos >= 0 && i * o + j === Math.min(pos, o * o - 1) ? "out" : ""));
      b.querySelector(".readout").innerHTML = `Output size $= \\left\\lfloor \\frac{n + 2p - f}{s} \\right\\rfloor + 1 = \\left\\lfloor \\frac{6 + ${2 * p} - 3}{${s}} \\right\\rfloor + 1 = ${o}$, so <b>${o} × ${o}</b>${p ? " (same as input: no border information lost)" : " (border pixels are visited fewer times)"}<br>${calc || "Press Step to slide the kernel."}`;
    };
    st = U.bind(b, () => { pos = -1; draw(); });
    b.querySelectorAll("[data-act]").forEach((x) => (x.onclick = () => { const o = Math.floor((6 + 2 * +st.p - 3) / +st.s) + 1; if (x.dataset.act === "step") pos = Math.min(pos + 1, o * o - 1); else if (x.dataset.act === "all") pos = o * o - 1; else pos = -1; draw(); }));
    draw();
  };

  /* 4. CNN parameter + pooling calculator */
  W.cnncalc = (el) => {
    const b = U.box(el, "Layer calculator: conv vs dense", "Exam numericals ask for the output shape and the parameter count. Set up the layer and read off both.");
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("n", R`Input size $n$ ($n \times n$)`, 4, 224, 1, 32)}${U.range("c", "Input channels", 1, 64, 1, 3)}${U.range("f", R`Kernel size $f$`, 1, 7, 2, 3)}${U.range("k", "Number of filters", 1, 128, 1, 16)}${U.range("p", R`Padding $p$`, 0, 3, 1, 1)}${U.range("s", R`Stride $s$`, 1, 4, 1, 1)}${U.range("pool", "Max-pool window (stride = window)", 1, 4, 1, 2)}</div><div class="readout"></div>`);
    const draw = (s) => {
      const o = Math.floor((s.n + 2 * s.p - s.f) / s.s) + 1;
      const params = (s.f * s.f * s.c + 1) * s.k;
      const po = Math.floor(o / s.pool);
      const dense = (s.n * s.n * s.c) * (o * o * s.k) + o * o * s.k;
      b.querySelector(".readout").innerHTML = String.raw`Conv output: $\left\lfloor \frac{${s.n} + ${2 * s.p} - ${s.f}}{${s.s}} \right\rfloor + 1 = ${o}$, so <b>${o} × ${o} × ${s.k}</b><br>
        Conv parameters: $(f \cdot f \cdot C_{\text{in}} + 1) \cdot K = (${s.f} \cdot ${s.f} \cdot ${s.c} + 1) \cdot ${s.k} = ${params}$ (one filter reused at every position)<br>
        After ${s.pool}×${s.pool} max-pool: <b>${po} × ${po} × ${s.k}</b> (pooling has 0 parameters; depth unchanged)<br>
        Flatten → vector of length <b>${(po * po * s.k).toLocaleString()}</b><br>
        <span class="muted">A dense layer producing the same ${o}×${o}×${s.k} output from the flattened ${s.n}×${s.n}×${s.c} input would need ≈ ${dense.toExponential(2)} parameters.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 5. Ensemble voting */
  W.ensemble = (el) => {
    const b = U.box(el, "Why ensembles work", R`$n$ independent classifiers, each correct with probability $p$, take a majority vote. How often is the vote right?`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("p", R`Single-model accuracy $p$`, 0.4, 0.95, 0.01, 0.7)}${U.range("n", R`Number of models $n$ (odd)`, 1, 21, 2, 5)}</div><div class="plot"></div><div class="readout"></div>`);
    const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };
    const maj = (p, n) => { let s = 0; for (let k = Math.ceil((n + 1) / 2); k <= n; k++) s += C(n, k) * p ** k * (1 - p) ** (n - k); return s; };
    const draw = (s) => {
      const p = U.plot({ x0: 1, x1: 21, y0: 0.3, y1: 1, h: 200 });
      let g = p.frame([1, 5, 9, 13, 17, 21], [0.4, 0.6, 0.8, 1], "models n", "ensemble accuracy");
      let d = ""; for (let n = 1; n <= 21; n += 2) d += (d ? "L" : "M") + p.X(n) + "," + p.Y(maj(s.p, n));
      g += p.line(d, C1) + `<circle cx="${p.X(s.n)}" cy="${p.Y(maj(s.p, s.n))}" r="6" fill="${C2}"/>`;
      b.querySelector(".plot").innerHTML = p.svg(g);
      b.querySelector(".readout").innerHTML = `Majority vote of ${s.n} models, each right ${Math.round(s.p * 100)}% of the time: <b>${U.f(maj(s.p, s.n) * 100, 1)}%</b><br><span class="muted">This only works when the models make different (independent) mistakes and each is right more than half the time. Below 50%, voting makes things worse.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 6. Autoencoder bottleneck (DCT-based compression of a 16x16 glyph) */
  W.bottleneck = (el) => {
    const b = U.box(el, "Squeeze it through the bottleneck", R`A $16 \times 16$ picture (256 numbers) is squeezed into $k$ code numbers and rebuilt. Small $k$ loses detail; $k = 256$ can simply copy the input. Add noise to see why a bottleneck also cleans up noise.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("k", R`Code size $k$`, 1, 256, 1, 24)}${U.range("noise", "Input noise", 0, 0.6, 0.05, 0)}</div>
      <div class="row" style="gap:18px;align-items:flex-start"><div><div class="eyebrow">Input</div><canvas width="160" height="160" class="wcanvas c-in" style="width:160px;margin-top:6px"></canvas></div><div><div class="eyebrow">Rebuilt</div><canvas width="160" height="160" class="wcanvas c-out" style="width:160px;margin-top:6px"></canvas></div></div><div class="readout"></div>`);
    const N = 16; const clean = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const x = (j - 7.5) / 7.5, y = (i - 7.5) / 7.5; const r = Math.hypot(x, y); let v = r < 0.95 && r > 0.72 ? 1 : 0; if (Math.hypot(x + 0.33, y + 0.3) < 0.13 || Math.hypot(x - 0.33, y + 0.3) < 0.13) v = 1; if (y > 0.15 && y < 0.42 && Math.abs(x) < 0.5 && Math.abs(y - (0.2 + 0.5 * x * x)) < 0.12) v = 1; clean.push(v); }
    const cosT = []; for (let k = 0; k < N; k++) for (let n = 0; n < N; n++) cosT.push(Math.cos((Math.PI * (2 * n + 1) * k) / (2 * N)) * (k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N)));
    const dct2 = (a) => { const t = new Float64Array(N * N), o = new Float64Array(N * N); for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) { let s = 0; for (let n = 0; n < N; n++) s += a[i * N + n] * cosT[k * N + n]; t[i * N + k] = s; } for (let k = 0; k < N; k++) for (let j = 0; j < N; j++) { let s = 0; for (let n = 0; n < N; n++) s += t[n * N + j] * cosT[k * N + n]; o[k * N + j] = s; } return o; };
    const idct2 = (c) => { const t = new Float64Array(N * N), o = new Float64Array(N * N); for (let k = 0; k < N; k++) for (let n = 0; n < N; n++) { let s = 0; for (let kk = 0; kk < N; kk++) s += c[kk * N + n] * cosT[kk * N + k]; t[k * N + n] = s; } for (let i = 0; i < N; i++) for (let n = 0; n < N; n++) { let s = 0; for (let kk = 0; kk < N; kk++) s += t[i * N + kk] * cosT[kk * N + n]; o[i * N + n] = s; } return o; };
    const order = []; for (let s = 0; s < 2 * N - 1; s++) for (let i = 0; i < N; i++) { const j = s - i; if (j >= 0 && j < N) order.push(i * N + j); }
    const paint = (cv, a) => { const ctx = cv.getContext("2d"); const ink = U.css("--ink"), bg = U.css("--sheet-2"); ctx.fillStyle = bg; ctx.fillRect(0, 0, 160, 160); ctx.fillStyle = ink; for (let i = 0; i < N * N; i++) { const v = Math.max(0, Math.min(1, a[i])); ctx.globalAlpha = v; ctx.fillRect((i % N) * 10, Math.floor(i / N) * 10, 10, 10); } ctx.globalAlpha = 1; };
    const draw = (s) => {
      const r = U.rng(7); const x = clean.map((v) => v + s.noise * U.gauss(r));
      const c = dct2(x); const keep = new Set(order.slice(0, s.k)); const ck = c.map((v, i) => (keep.has(i) ? v : 0)); const xh = idct2(ck);
      paint(b.querySelector(".c-in"), x); paint(b.querySelector(".c-out"), xh);
      let mseIn = 0, mseClean = 0; for (let i = 0; i < N * N; i++) { mseIn += (xh[i] - x[i]) ** 2; mseClean += (xh[i] - clean[i]) ** 2; }
      const regime = s.k < 256 ? `<b>Undercomplete</b> ($k = ${s.k} \\lt 256$): forced to keep only the most important structure.` : `<b>Code as big as the input</b>: the network can just copy, noise and all. An overcomplete AE ($k > 256$) has the same problem unless it is regularised.`;
      b.querySelector(".readout").innerHTML = `Squeezed 256 → ${s.k} numbers (${U.f(256 / s.k, 1)} times smaller)<br>MSE against the noisy input: <b>${U.f(mseIn / 256, 4)}</b> · MSE against the clean picture: <b>${U.f(mseClean / 256, 4)}</b><br>${regime}${s.noise > 0 ? `<br><span class="muted">With noise on, a medium $k$ gets closer to the clean picture than $k = 256$ does. That is the denoising idea: damage the input, rebuild the clean target.</span>` : ""}`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 7. AE forward pass numerical trainer */
  W.aenum = (el) => {
    const b = U.box(el, "Numerical drill: one neuron, then the loss", R`Exams give inputs, weights and a bias and ask for a neuron's output, or give $x$ and $\hat{x}$ and ask for the loss. Make a fresh problem, solve it on paper, then check.`);
    b.insertAdjacentHTML("beforeend", `<div class="row">${U.seg("t", [["neuron", "Neuron output (ReLU)"], ["mse", "MSE loss"], ["bce", "BCE loss"]], "neuron")}<button class="btn small" data-act="new">New problem</button></div><div class="readout prob"></div><div class="natbox"><input type="text" class="tinput" placeholder="Your answer" aria-label="Your answer"><button class="btn quiet small" data-act="check">Check</button></div><div class="small res"></div>`);
    let st, ans, sol;
    const r = U.rng(Date.now() % 100000);
    const rv = (a, bb, d = 1) => Math.round((a + (bb - a) * r()) * 10 ** d) / 10 ** d;
    const gen = () => {
      if (st.t === "neuron") {
        const x = [rv(0, 1), rv(0, 1), rv(0, 1), rv(0, 1)], w = [rv(-0.8, 0.8), rv(-0.8, 0.8), rv(-0.8, 0.8), rv(-0.8, 0.8)], bias = rv(-0.2, 0.2, 2);
        const z = x.reduce((s, v, i) => s + v * w[i], bias); ans = Math.max(0, z);
        b.querySelector(".prob").innerHTML = `$x = [${x.join(", ")}]$ · $w = [${w.join(", ")}]$ · $b = ${bias}$<br>Find $a = \\text{ReLU}(w \\cdot x + b)$. Round to 3 decimals.`;
        sol = `$z = ${x.map((v, i) => `(${v})(${w[i]})`).join(" + ")} + (${bias}) = ${U.f(z, 4)}$ → ReLU → <b>${U.f(ans, 4)}</b>`;
      } else if (st.t === "mse") {
        const x = [rv(0, 1), rv(0, 1), rv(0, 1), rv(0, 1)], xh = x.map((v) => Math.round((v + rv(-0.3, 0.3)) * 10) / 10);
        ans = x.reduce((s, v, i) => s + (v - xh[i]) ** 2, 0) / 4;
        b.querySelector(".prob").innerHTML = `$x = [${x.join(", ")}]$ · $\\hat{x} = [${xh.join(", ")}]$<br>Find the mean squared error (average over the 4 values).`;
        sol = `$\\text{MSE} = \\frac{${x.map((v, i) => `(${v} - ${xh[i]})^2`).join(" + ")}}{4} = ${U.f(ans, 4)}$`;
      } else {
        const y = [1, 0, 1, 0].sort(() => r() - 0.5), yh = y.map(() => rv(0.1, 0.9));
        ans = -y.reduce((s, v, i) => s + v * Math.log(yh[i]) + (1 - v) * Math.log(1 - yh[i]), 0) / 4;
        b.querySelector(".prob").innerHTML = `target $x = [${y.join(", ")}]$ · sigmoid output $\\hat{x} = [${yh.join(", ")}]$<br>Find the binary cross-entropy (natural log, averaged over 4).`;
        sol = `$\\text{BCE} = -\\frac{1}{4}\\sum \\big[x \\ln \\hat{x} + (1-x)\\ln(1-\\hat{x})\\big] = ${U.f(ans, 4)}$`;
      }
      b.querySelector(".res").innerHTML = ""; b.querySelector("input").value = "";
    };
    st = U.bind(b, gen);
    b.querySelector('[data-act="new"]').onclick = gen;
    b.querySelector('[data-act="check"]').onclick = () => { const v = parseFloat(b.querySelector("input").value); const ok = Math.abs(v - ans) <= Math.max(0.005, Math.abs(ans) * 0.01); b.querySelector(".res").innerHTML = `<div class="callout ${ok ? "good" : "bad"}">${ok ? "Correct. " : "Not quite. "}${sol}</div>`; };
    gen();
  };

  /* 8. KL divergence between two Gaussians */
  W.kl = (el) => {
    const b = U.box(el, "KL divergence playground", R`$P$ (blue) is the true distribution, $Q$ (gold) the approximation. Move them and watch $D_{\mathrm{KL}}(P \,\|\, Q)$ and $D_{\mathrm{KL}}(Q \,\|\, P)$. They are usually different: KL is not a distance.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("m1", R`centre $\mu_P$`, -3, 3, 0.1, 0)}${U.range("s1", R`spread $\sigma_P$`, 0.3, 3, 0.1, 1)}${U.range("m2", R`centre $\mu_Q$`, -3, 3, 0.1, 1)}${U.range("s2", R`spread $\sigma_Q$`, 0.3, 3, 0.1, 1.5)}</div><div class="plot"></div><div class="readout"></div>`);
    const KL = (m1, s1, m2, s2) => Math.log(s2 / s1) + (s1 * s1 + (m1 - m2) ** 2) / (2 * s2 * s2) - 0.5;
    const draw = (s) => {
      const top = Math.max(U.npdf(0, 0, s.s1), U.npdf(0, 0, s.s2)) * 1.1;
      const p = U.plot({ x0: -6, x1: 6, y0: 0, y1: top, h: 210 });
      const g = p.frame([-6, -3, 0, 3, 6], [0]) + `<path d="${p.path((x) => U.npdf(x, s.m1, s.s1))}L${p.X(6)},${p.Y(0)}L${p.X(-6)},${p.Y(0)}Z" fill="color-mix(in srgb, var(--accent) 18%, transparent)"/>` + p.line(p.path((x) => U.npdf(x, s.m1, s.s1)), C1) + p.line(p.path((x) => U.npdf(x, s.m2, s.s2)), C2);
      b.querySelector(".plot").innerHTML = p.svg(g) + R`<div class="legend"><span><i style="background:${C1}"></i>$P = \mathcal{N}(${s.m1}, ${s.s1}^2)$</span><span><i style="background:${C2}"></i>$Q = \mathcal{N}(${s.m2}, ${s.s2}^2)$</span></div>`;
      const a = KL(s.m1, s.s1, s.m2, s.s2), c = KL(s.m2, s.s2, s.m1, s.s1);
      b.querySelector(".readout").innerHTML = R`$D_{\mathrm{KL}}(P \,\|\, Q) = \ln\frac{\sigma_Q}{\sigma_P} + \frac{\sigma_P^2 + (\mu_P - \mu_Q)^2}{2\sigma_Q^2} - \frac{1}{2} = ${U.f(a, 4)}$ nats<br>$D_{\mathrm{KL}}(Q \,\|\, P) = ${U.f(c, 4)}$ nats ${Math.abs(a - c) < 1e-6 ? "(equal only because the spreads are equal)" : "← different: KL is not symmetric"}<br><span class="muted">Both are never negative, and both are 0 only when the two curves match exactly.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 9. Forward vs reverse KL on a bimodal target */
  W.klmodes = (el) => {
    const b = U.box(el, "Mode covering vs mode seeking", R`$P$ has two humps. We fit a single bell curve $Q$ by minimising each direction of KL. Pull the humps apart and watch the two fits disagree.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("d", "Distance between peaks", 0.5, 7, 0.1, 4)}${U.range("w", "Weight of left peak", 0.2, 0.8, 0.05, 0.5)}</div><div class="plot"></div><div class="readout"></div>`);
    const xs = []; for (let i = 0; i <= 300; i++) xs.push(-9 + (18 * i) / 300); const dx = 18 / 300;
    const draw = (s) => {
      const P = (x) => s.w * U.npdf(x, -s.d / 2, 0.7) + (1 - s.w) * U.npdf(x, s.d / 2, 0.7);
      const mean = s.w * (-s.d / 2) + (1 - s.w) * (s.d / 2); const varr = 0.49 + s.w * (s.d / 2 + mean) ** 2 * 1 + (1 - s.w) * (s.d / 2 - mean) ** 2;
      const fwd = [mean, Math.sqrt(varr)];
      let best = [0, 1, Infinity]; const pv = xs.map(P);
      for (let m = -5; m <= 5; m += 0.1) for (let sg = 0.3; sg <= 4; sg += 0.05) { let kl = 0; for (let i = 0; i < xs.length; i++) { const q = U.npdf(xs[i], m, sg); if (q > 1e-12) kl += q * (Math.log(q) - Math.log(pv[i] + 1e-300)) * dx; } if (kl < best[2]) best = [m, sg, kl]; }
      const p = U.plot({ x0: -8, x1: 8, y0: 0, y1: 0.65, h: 210 });
      const g = p.frame([-8, -4, 0, 4, 8], [0]) + `<path d="${p.path(P)}L${p.X(8)},${p.Y(0)}L${p.X(-8)},${p.Y(0)}Z" fill="color-mix(in srgb, var(--ink) 12%, transparent)"/>` + p.line(p.path(P), "var(--ink)") + p.line(p.path((x) => U.npdf(x, fwd[0], fwd[1])), C1) + p.line(p.path((x) => U.npdf(x, best[0], best[1])), C4);
      b.querySelector(".plot").innerHTML = p.svg(g) + `<div class="legend"><span><i style="background:var(--ink)"></i>target P</span><span><i style="background:${C1}"></i>best fit by forward KL (covers both)</span><span><i style="background:${C4}"></i>best fit by reverse KL (picks one)</span></div>`;
      b.querySelector(".readout").innerHTML = R`Forward KL fit: $\mu = ${U.f(fwd[0], 2)}$, $\sigma = ${U.f(fwd[1], 2)}$. It must cover everywhere $P$ has probability, so it spreads over both humps (and the empty gap).<br>Reverse KL fit: $\mu = ${U.f(best[0], 2)}$, $\sigma = ${U.f(best[1], 2)}$. It is punished for putting probability where $P \approx 0$, so it locks onto one hump.<br><span class="muted">VAEs minimise the reverse direction $D_{\mathrm{KL}}(q(z \mid x) \,\|\, p(z \mid x))$ inside the ELBO, one reason they can miss some modes.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 10. Entropy / cross-entropy */
  W.entropy = (el) => {
    const b = U.box(el, "Surprise, entropy, cross-entropy", R`Two coins. $P$ is the real coin, $Q$ is what your model believes. Watch: cross-entropy = entropy + KL.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("p", R`Real coin: $P(\text{heads})$`, 0.01, 0.99, 0.01, 0.5)}${U.range("q", R`Model believes: $Q(\text{heads})$`, 0.01, 0.99, 0.01, 0.8)}</div><div class="readout"></div>`);
    const L = Math.log2;
    const draw = (s) => {
      const H = -(s.p * L(s.p) + (1 - s.p) * L(1 - s.p)), CE = -(s.p * L(s.q) + (1 - s.p) * L(1 - s.q)), KL = CE - H;
      b.querySelector(".readout").innerHTML = R`Surprise of heads: $I = -\log_2 ${s.p} = ${U.f(-L(s.p), 3)}$ bits (rarer = more surprising)<br>Entropy $H(P) = ${U.f(H, 4)}$ bits ${Math.abs(s.p - 0.5) < 0.005 ? "(the maximum: a fair coin is the most uncertain)" : ""}<br>Cross-entropy $H(P,Q) = -\sum p \log_2 q = ${U.f(CE, 4)}$ bits<br>$D_{\mathrm{KL}}(P \,\|\, Q) = H(P,Q) - H(P) = ${U.f(KL, 4)}$ bits<br><span class="muted">With $P$ fixed, making cross-entropy small is the same as making KL small. That is why classifiers use the cross-entropy loss.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 11. Reparameterization trick sampler */
  W.reparam = (el) => {
    const b = U.box(el, "The reparameterisation trick", R`Sampling $z \sim \mathcal{N}(\mu, \sigma^2)$ directly blocks gradients. Rewrite it as $z = \mu + \sigma\varepsilon$ with $\varepsilon \sim \mathcal{N}(0,1)$: the randomness moves into $\varepsilon$, and $\mu, \sigma$ stay on a smooth path.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("m", R`$\mu$ (from the encoder)`, -2, 2, 0.1, 0.5)}${U.range("lv", R`$\log\sigma^2$ (from the encoder)`, -3, 2, 0.1, 0)}</div><div class="row"><button class="btn small" data-act="one">Draw one noise value</button><button class="btn quiet small" data-act="many">Draw 300</button><button class="btn quiet small" data-act="clr">Clear</button></div><div class="plot"></div><div class="readout"></div>`);
    let samples = []; const r = U.rng(42); let lastE = null; let st;
    const draw = () => {
      const s = st; const sg = Math.exp(s.lv / 2);
      const z = samples.map((e) => s.m + sg * e);
      const p = U.plot({ x0: -5, x1: 5, y0: 0, y1: Math.max(0.5, U.npdf(0, 0, sg) * 1.15), h: 200 });
      const bins = new Array(40).fill(0); z.forEach((v) => { const k = Math.floor((v + 5) / 0.25); if (k >= 0 && k < 40) bins[k]++; });
      let g = p.frame([-4, -2, 0, 2, 4], [0]);
      if (z.length) bins.forEach((c, k) => { const h = c / (z.length * 0.25); g += `<rect x="${p.X(-5 + k * 0.25) + 1}" y="${p.Y(h)}" width="${p.X(0.25) - p.X(0) - 2}" height="${p.Y(0) - p.Y(h)}" fill="color-mix(in srgb, var(--accent) 35%, transparent)"/>`; });
      g += p.line(p.path((x) => U.npdf(x, s.m, sg)), C1);
      if (lastE != null) g += `<line x1="${p.X(s.m + sg * lastE)}" x2="${p.X(s.m + sg * lastE)}" y1="${p.Y(0)}" y2="${p.padT}" stroke="${C2}" stroke-width="3"/>`;
      b.querySelector(".plot").innerHTML = p.svg(g);
      b.querySelector(".readout").innerHTML = R`$\sigma = e^{\frac{1}{2}\log\sigma^2} = e^{${U.f(s.lv / 2, 3)}} = ${U.f(sg, 4)}$ · variance $\sigma^2 = ${U.f(sg * sg, 4)}$<br>${lastE != null ? R`$\varepsilon = ${U.f(lastE, 3)}$ → $z = \mu + \sigma\varepsilon = ${s.m} + ${U.f(sg, 3)} \times (${U.f(lastE, 3)}) = ${U.f(s.m + sg * lastE, 4)}$<br>` : ""}$\frac{\partial z}{\partial \mu} = 1$ · $\frac{\partial z}{\partial \sigma} = \varepsilon$ (both ordinary numbers, so backprop reaches the encoder)<br><span class="muted">Why $\log\sigma^2$? The encoder's last layer has no activation, so it may output any number; $e^{x}$ turns it into a positive variance.</span>`;
    };
    st = U.bind(b, draw);
    b.querySelector('[data-act="one"]').onclick = () => { lastE = U.gauss(r); samples.push(lastE); draw(); };
    b.querySelector('[data-act="many"]').onclick = () => { for (let i = 0; i < 300; i++) samples.push(U.gauss(r)); lastE = samples[samples.length - 1]; draw(); };
    b.querySelector('[data-act="clr"]').onclick = () => { samples = []; lastE = null; draw(); };
    draw();
  };

  /* 12. VAE loss calculator */
  W.vaeloss = (el) => {
    const b = U.box(el, "VAE loss calculator", R`Type the encoder outputs and a reconstruction. The defaults are Lecture 24's worked example ($9.711 + 0.352 = 10.063$): total loss = reconstruction (MSE) + KL to $\mathcal{N}(0, I)$.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">
      <div class="ctrl"><label>$\\mu$ (separate with commas)</label><input type="text" data-k="mu" value="0.043, 0.551"></div>
      <div class="ctrl"><label>$\\log\\sigma^2$ (separate with commas)</label><input type="text" data-k="lv" value="0.732, 0.302"></div>
      <div class="ctrl"><label>Input $x$</label><input type="text" data-k="x" value="5.1, 3.5, 1.4, 0.2"></div>
      <div class="ctrl"><label>Reconstruction $\\hat{x}$</label><input type="text" data-k="xh" value="0.103, -0.028, 0.206, 0.243"></div></div><div class="readout"></div>`);
    const nums = (s) => String(s).split(/[,\s]+/).filter(Boolean).map(Number);
    const draw = (s) => {
      const mu = nums(s.mu), lv = nums(s.lv), x = nums(s.x), xh = nums(s.xh);
      if (mu.length !== lv.length || x.length !== xh.length || [...mu, ...lv, ...x, ...xh].some(isNaN)) { b.querySelector(".readout").innerHTML = R`$\mu$ and $\log\sigma^2$ need the same number of values, and so do $x$ and $\hat{x}$.`; return; }
      const mse = x.reduce((a, v, i) => a + (v - xh[i]) ** 2, 0) / x.length;
      const terms = mu.map((m, i) => m * m + Math.exp(lv[i]) - lv[i] - 1); const kl = 0.5 * terms.reduce((a, v) => a + v, 0);
      const sig = lv.map((v) => Math.exp(v / 2));
      b.querySelector(".readout").innerHTML = R`$\sigma^2 = e^{\log\sigma^2} = [${lv.map((v) => U.f(Math.exp(v), 3)).join(", ")}]$ · $\sigma = [${sig.map((v) => U.f(v, 3)).join(", ")}]$<br>
        Reconstruction (MSE) $= ${U.f(mse, 4)}$<br>
        $\text{KL} = \frac{1}{2}\sum(\mu^2 + \sigma^2 - \log\sigma^2 - 1) = \frac{1}{2}(${terms.map((t) => U.f(t, 4)).join(" + ")}) = ${U.f(kl, 4)}$<br>
        Total VAE loss $= ${U.f(mse + kl, 4)}$<br><span class="muted">KL is exactly 0 when every $\mu = 0$ and every $\log\sigma^2 = 0$, i.e. $q(z \mid x) = \mathcal{N}(0, I)$.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 13. Latent interpolation: pixel space vs latent space */
  W.interp = (el) => {
    const b = U.box(el, "Interpolate in pixel space or in latent space?", "Blend a circle into a 5-point star. Pixel blending cross-fades two images (ghosting). Latent blending changes the shape parameters, so every in-between frame is a valid shape.");
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("a", R`$\alpha$ (0 = circle, 1 = star)`, 0, 1, 0.05, 0.5)}</div><div class="row" style="gap:18px"><div><div class="eyebrow">Pixel space: blend the pictures</div><canvas width="180" height="180" class="wcanvas c1" style="width:180px;margin-top:6px"></canvas></div><div><div class="eyebrow">Latent space: blend the codes, decode</div><canvas width="180" height="180" class="wcanvas c2" style="width:180px;margin-top:6px"></canvas></div></div><div class="readout"></div>`);
    const shape = (ctx, depth, alpha) => { ctx.beginPath(); for (let i = 0; i <= 200; i++) { const t = (i / 200) * Math.PI * 2; const R = Math.max(18, 62 * (1 - depth * 0.45 * (1 - Math.cos(5 * t)))); const x = 90 + R * Math.sin(t), y = 92 - R * Math.cos(t); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.closePath(); ctx.globalAlpha = alpha; ctx.fill(); ctx.globalAlpha = 1; };
    const draw = (s) => {
      const acc = U.css("--accent"), bg = U.css("--sheet-2");
      const c1 = b.querySelector(".c1").getContext("2d"), c2 = b.querySelector(".c2").getContext("2d");
      [c1, c2].forEach((c) => { c.fillStyle = bg; c.fillRect(0, 0, 180, 180); c.fillStyle = acc; });
      shape(c1, 0, 1 - s.a); shape(c1, 1, s.a); shape(c2, s.a, 1);
      b.querySelector(".readout").innerHTML = R`Pixels: $(1-\alpha)\,x_1 + \alpha\,x_2$ overlays two pictures (ghosting).<br>Codes: $z_1 = [\text{pointiness } 0]$, $z_2 = [\text{pointiness } 1]$, $z = ${U.f(1 - s.a, 2)}\,z_1 + ${U.f(s.a, 2)}\,z_2 = [${U.f(s.a, 2)}]$, decoded into one clean shape.<br><span class="muted">This only works when the latent space is smooth and gap-free. A plain autoencoder leaves gaps between codes; the KL term of a VAE packs codes near $\mathcal{N}(0, I)$, which makes interpolation meaningful.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 14. Beta-VAE traversal */
  W.betavae = (el) => {
    const b = U.box(el, "β-VAE: entangled vs disentangled latents", R`We sweep one latent number $z_1$ from $-2$ to $+2$ and decode each step. At $\beta = 1$ it changes several features at once. As $\beta$ grows, it controls one feature only, but the pictures get blurrier.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("beta", R`$\beta$ (weight on the KL term)`, 0.5, 8, 0.5, 1)}</div><canvas width="560" height="110" class="wcanvas cv" style="aspect-ratio:560/110"></canvas><div class="readout"></div>`);
    const draw = (s) => {
      const cv = b.querySelector(".cv"), ctx = cv.getContext("2d"); const acc = U.css("--accent"), bg = U.css("--sheet-2"), ink = U.css("--ink-2");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 560, 110);
      const ent = Math.max(0, Math.min(1, (6 - s.beta) / 5)); const blur = Math.min(6, (s.beta - 1) * 0.8);
      for (let i = 0; i < 7; i++) {
        const z = -2 + (4 * i) / 6; const size = 18 + 7 * z * 1; const rot = ent * z * 0.5; const hue = ent * z * 0.35;
        ctx.save(); ctx.translate(40 + i * 80, 55); ctx.rotate(rot); ctx.filter = blur > 0 ? `blur(${blur.toFixed(1)}px)` : "none"; ctx.fillStyle = acc; ctx.globalAlpha = 0.65 + hue * 0.4; ctx.fillRect(-size / 2, -size / 2, size, size); ctx.restore();
        ctx.fillStyle = ink; ctx.font = "11px monospace"; ctx.textAlign = "center"; ctx.fillText(`z₁=${z.toFixed(1)}`, 40 + i * 80, 104);
      }
      ctx.filter = "none";
      b.querySelector(".readout").innerHTML = R`Loss $=$ reconstruction $+\ ${s.beta} \times D_{\mathrm{KL}}(q(z \mid x) \,\|\, \mathcal{N}(0, I))$<br>Changing $z_1$ alters: size${ent > 0.15 ? " + rotation + shade (entangled)" : " only (disentangled)"} · sharpness: ${s.beta <= 1.5 ? "high" : s.beta < 4 ? "medium" : "low (blurry)"}<br><span class="muted">$\beta = 1$ is the ordinary VAE. $\beta > 1$ pulls harder towards the prior, which encourages one-feature-per-latent codes.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 15. GAN losses */
  W.ganloss = (el) => {
    const b = U.box(el, "GAN loss dials", R`$D(x)$ is the discriminator's probability that a real image is real. $D(G(z))$ is its probability that a fake image is real. Move both and watch each player's loss.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("dx", R`$D(x)$ on a real image`, 0.01, 0.99, 0.01, 0.9)}${U.range("dg", R`$D(G(z))$ on a fake image`, 0.01, 0.99, 0.01, 0.1)}</div><div class="plot"></div><div class="readout"></div>`);
    const draw = (s) => {
      const p = U.plot({ x0: 0, x1: 1, y0: -5, y1: 5, h: 230 });
      const g = p.frame([0, 0.25, 0.5, 0.75, 1], [-4, -2, 0, 2, 4], "D(G(z))", "generator objective (minimise)") +
        p.line(p.path((d) => -Math.log(d)), C1) + p.line(p.path((d) => Math.log(1 - d)), C2) +
        `<circle cx="${p.X(s.dg)}" cy="${p.Y(-Math.log(s.dg))}" r="5" fill="${C1}"/><circle cx="${p.X(s.dg)}" cy="${p.Y(Math.log(1 - s.dg))}" r="5" fill="${C2}"/>`;
      b.querySelector(".plot").innerHTML = p.svg(g) + `<div class="legend"><span><i style="background:${C1}"></i>non-saturating loss</span><span><i style="background:${C2}"></i>minimax loss</span></div>`;
      const Ld = -Math.log(s.dx) - Math.log(1 - s.dg);
      b.querySelector(".readout").innerHTML = R`Discriminator: $L_D = -\log D(x) - \log(1 - D(G(z))) = ${U.f(-Math.log(s.dx), 3)} + ${U.f(-Math.log(1 - s.dg), 3)} = ${U.f(Ld, 4)}$<br>
        Value $V = \log D(x) + \log(1 - D(G(z))) = ${U.f(-Ld, 4)}$ (D pushes $V$ up, G pushes it down)<br>
        Generator, minimax form: $\log(1 - D(G(z))) = ${U.f(Math.log(1 - s.dg), 4)}$ · slope: $${U.f(-1 / (1 - s.dg), 3)}$<br>
        Generator, non-saturating form: $-\log D(G(z)) = ${U.f(-Math.log(s.dg), 4)}$ · slope: $${U.f(-1 / s.dg, 3)}$<br>
        <span class="muted">Early in training $D(G(z)) \approx 0$. The minimax curve is flat there (slope $\approx -1$), the non-saturating one is steep (slope $\approx -\frac{1}{D(G(z))}$). That is why real GANs train G with $-\log D(G(z))$. At the equilibrium $D = \frac{1}{2}$ everywhere and $V = -\log 4 \approx -1.386$.</span>`;
    };
    const st = U.bind(b, draw); draw(st);
  };

  /* 16. 1-D GAN toy with optimal discriminator */
  W.gan1d = (el) => {
    const b = U.box(el, "A 1-D GAN you can train", R`Real data is $\mathcal{N}(2, 0.6^2)$. The generator outputs $\mathcal{N}(\mu_g, \sigma_g^2)$. For any generator the best discriminator is $D^*(x) = \frac{p_{\text{data}}}{p_{\text{data}} + p_g}$. Press Train and watch $D^*$ flatten to $\frac{1}{2}$.`);
    b.insertAdjacentHTML("beforeend", `<div class="ctrls">${U.range("mg", R`Generator centre $\mu_g$`, -3, 4, 0.05, -2)}${U.range("sg", R`Generator spread $\sigma_g$`, 0.2, 2, 0.05, 1.2)}</div><div class="row"><button class="btn small" data-act="train">Train generator ×10 steps</button><button class="btn quiet small" data-act="reset">Reset</button></div><div class="plot"></div><div class="readout"></div>`);
    const md = 2, sd = 0.6; let st;
    const xs = []; for (let i = 0; i <= 400; i++) xs.push(-5 + (10 * i) / 400);
    const JSD = (m, s) => { let j = 0; const dx = 10 / 400; xs.forEach((x) => { const p = U.npdf(x, md, sd), q = U.npdf(x, m, s), mm = (p + q) / 2; if (p > 1e-12) j += 0.5 * p * Math.log(p / mm) * dx; if (q > 1e-12) j += 0.5 * q * Math.log(q / mm) * dx; }); return j; };
    const draw = () => {
      const s = st; const p = U.plot({ x0: -5, x1: 5, y0: 0, y1: 1.05, h: 220 });
      const g = p.frame([-4, -2, 0, 2, 4], [0, 0.5, 1]) + `<line x1="${p.X(-5)}" x2="${p.X(5)}" y1="${p.Y(0.5)}" y2="${p.Y(0.5)}" stroke="var(--ink-2)" stroke-dasharray="2 3"/>` +
        p.line(p.path((x) => U.npdf(x, md, sd) * 1.4), C3) + p.line(p.path((x) => U.npdf(x, s.mg, s.sg) * 1.4), C2) +
        p.line(p.path((x) => { const a = U.npdf(x, md, sd), q = U.npdf(x, s.mg, s.sg); return a + q < 1e-9 ? 0.5 : a / (a + q); }), C1, 'stroke-dasharray="6 4"');
      b.querySelector(".plot").innerHTML = p.svg(g) + `<div class="legend"><span><i style="background:${C3}"></i>real data</span><span><i style="background:${C2}"></i>generator</span><span><i style="background:${C1}"></i>best discriminator</span></div>`;
      const j = JSD(s.mg, s.sg);
      b.querySelector(".readout").innerHTML = R`JS divergence between real and generated: $${U.f(j, 4)}$ (largest possible $\ln 2 = 0.693$)<br>$V(D^*, G) = -\log 4 + 2\,\text{JSD} = ${U.f(-Math.log(4) + 2 * j, 4)}$ → lowest value $-1.386$ when the two match<br><span class="muted">${j < 0.005 ? R`Nash equilibrium: $D^* = \frac{1}{2}$ everywhere. The discriminator can no longer tell real from fake, and neither player can improve alone.` : "The generator walks this value downhill. Where the generator has no overlap with the real data, the best discriminator is about 0 or 1 and the slope vanishes, one reason plain GAN training is unstable."}</span>`;
    };
    st = U.bind(b, draw);
    const setv = (k, v) => { const inp = b.querySelector(`[data-k="${k}"]`); inp.value = v; inp.dispatchEvent(new Event("input")); };
    b.querySelector('[data-act="train"]').onclick = () => { let m = st.mg, s = st.sg; for (let i = 0; i < 10; i++) { const e = 0.02; const gm = (JSD(m + e, s) - JSD(m - e, s)) / (2 * e), gs = (JSD(m, s + e) - JSD(m, s - e)) / (2 * e); m -= 1.2 * gm + 0.08 * Math.sign(md - m) * (Math.abs(gm) < 0.01 ? 1 : 0); s = Math.max(0.2, s - 0.8 * gs); } setv("mg", Math.round(m * 100) / 100); setv("sg", Math.round(s * 100) / 100); };
    b.querySelector('[data-act="reset"]').onclick = () => { setv("mg", -2); setv("sg", 1.2); };
    draw();
  };
})();
