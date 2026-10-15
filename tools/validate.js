/* Content validator: node tools/validate.js
   Checks every lesson card, quiz, section test and mock question for structural errors,
   and type-checks every $…$ equation with KaTeX. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const katex = require(path.join(__dirname, "..", "vendor", "katex", "katex.min.js"));

const src = path.join(__dirname, "..", "src");
const ctx = { window: {}, console, R: String.raw };
ctx.window.COURSE = { weeks: [], finals: [], formulas: [], glossary: [] };
ctx.COURSE = ctx.window.COURSE;
vm.createContext(ctx);
const files = ["lectures.js", ...Array.from({ length: 13 }, (_, i) => `content/w${String(i).padStart(2, "0")}.js`), "content/finals.js", "content/formulas.js", "content/glossary.js", "figures.js", ..."abcde".split("").map((g) => `figures-life-${g}.js`)];
files.forEach((f) => vm.runInContext(fs.readFileSync(path.join(src, f), "utf8"), ctx, { filename: f }));
const C = ctx.window.COURSE, L = ctx.window.LECTURES, FIGS = ctx.window.FIGS || {};
const widgetSrc = ["widgets1.js", "widgets2.js", "widgets3.js"].map((f) => fs.readFileSync(path.join(src, f), "utf8")).join("\n");
const widgets = new Set([...widgetSrc.matchAll(/W\.(\w+) = \(el\)/g)].map((m) => m[1]));

let errors = 0; const err = (m) => { errors++; console.log("✗", m.replace(/\s+/g, " ")); };
const topics = {};
C.weeks.forEach((w) => w.topics.forEach((t) => (topics[t.id] = t)));

/* ---------- math checks on every string in the course ---------- */
const MATH = /\$\$([\s\S]+?)\$\$|\\\$|\$([^$\n]+?)\$/g;
const BARE = /(^|[^\\a-zA-Z])(frac|sqrt|sigma|theta|alpha|beta|gamma|lambda|epsilon|varepsilon|mu|nabla|partial|cdot|times|mathbb|mathcal|mathrm|text|hat|tilde|mid|approx|infty|sum|prod|log|exp|left|right|odot|leq|geq|neq|lt|gt|in|to|quad|operatorname|boldsymbol|underbrace|overbrace|lfloor|rfloor|max|min|arg|sim|pi|phi|psi|omega|Sigma|Delta|delta|eta|tau|rho|kappa|xi|zeta|tanh|ell)\s*[{_^(\\]/;
let nMath = 0;
function checkString(s, where) {
  if (/[\f\b\v\r]/.test(s)) err(`${where}: control character in text (a single backslash before f/b/v/r in a non-raw string?)`);
  const noMath = s.replace(MATH, " ");
  if (noMath.includes("$")) err(`${where}: unpaired $ in "${s.slice(0, 80)}…"`);
  let m; MATH.lastIndex = 0;
  while ((m = MATH.exec(s))) {
    if (m[0] === "\\$") continue;
    const t = m[1] != null ? m[1] : m[2]; nMath++;
    try { katex.renderToString(t, { throwOnError: true, displayMode: m[1] != null, strict: "ignore" }); }
    catch (e) { err(`${where}: KaTeX cannot parse "${t}" — ${e.message.split("\n")[0]}`); }
    if (/<[a-zA-Z\/]/.test(t)) err(`${where}: HTML tag or raw "<" inside math "${t}" (use \\lt)`);
    if (/\\\\[a-zA-Z]/.test(t)) err(`${where}: double backslash before a command in "${t}"`);
    if (BARE.test(t)) err(`${where}: LaTeX command without backslash in "${t}"`);
    if (/[\t]/.test(t)) err(`${where}: tab inside math "${t}" (\\t in a non-raw string?)`);
  }
  // plain-text maths that should be typeset
  const prose = noMath.replace(/<code>[\s\S]*?<\/code>/g, "").replace(/<svg[\s\S]*?<\/svg>/g, "");
  if (/\d\/\(|\)\/\d|\be\^\(|\^\(|sqrt\(|_\{|\^\{/.test(prose)) err(`${where}: equation written as plain text: "${prose.slice(0, 100)}…"`);
  const uni = prose.match(/[Σ∑√∂∇∫∏₀-₉ᵗ²³⁻ⁿ‖θσμβαεγλφψωπηΔδ≈≤≥≠×−]/);
  if (uni) err(`${where}: math symbol "${uni[0]}" outside $…$ in "${prose.slice(Math.max(0, uni.index - 40), uni.index + 40)}"`);
}
function walk(o, where) {
  if (typeof o === "string") return checkString(o, where);
  if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${where}[${i}]`));
  if (o && typeof o === "object") Object.keys(o).forEach((k) => { if (k !== "week") walk(o[k], `${where}.${k}`); });
}

function checkQ(q, where, topic) {
  if (!q.q) err(`${where}: missing question text`);
  if (Array.isArray(q.a)) {
    if (!q.o) err(`${where}: MSQ without options`);
    else q.a.forEach((i) => { if (i < 0 || i >= q.o.length) err(`${where}: MSQ answer index ${i} out of range`); });
    if (q.a.length < 1) err(`${where}: empty MSQ answer`);
  } else if (typeof q.a === "object") {
    if (typeof q.a.n !== "number") err(`${where}: NAT without numeric answer`);
    if (q.o) err(`${where}: NAT should not have options`);
  } else if (typeof q.a === "number") {
    if (!q.o || q.a < 0 || q.a >= q.o.length) err(`${where}: MCQ answer index out of range`);
  } else err(`${where}: bad answer`);
  if (!q.x) err(`${where}: missing explanation`);
  const t = topic || topics[q.t];
  if (!t) err(`${where}: unknown topic ${q.t}`);
  else if (q.r != null && (q.r < 0 || q.r >= t.cards.length)) err(`${where}: card ref ${q.r} out of range (topic ${t.id} has ${t.cards.length})`);
}

let nEx = 0, nCards = 0, nCtx = 0, nq = 0, minutes = 0, types = { mcq: 0, msq: 0, nat: 0 };
const tally = (q) => { nq++; types[Array.isArray(q.a) ? "msq" : typeof q.a === "object" ? "nat" : "mcq"]++; };
C.weeks.forEach((w) => {
  w.topics.forEach((t) => {
    minutes += t.min;
    t.lec.forEach((n) => { if (!L[n]) err(`${t.id}: unknown lecture ${n}`); });
    t.cards.forEach((c, i) => {
      if (c.w && !widgets.has(c.w)) err(`${t.id} card ${i}: unknown widget ${c.w}`);
      if (c.f) { const n = Array.isArray(c.f) ? c.f[0] : c.f; if (!FIGS[n]) err(`${t.id} card ${i}: unknown figure ${n}`); }
      if (c.ask && (c.ask.a >= c.ask.o.length)) err(`${t.id} card ${i}: ask answer out of range`);
      if (c.ex) { nEx++; if (!c.ex.h || !c.ex.b) err(`${t.id} card ${i}: example needs h and b`); if (c.ex.f) { const n = Array.isArray(c.ex.f) ? c.ex.f[0] : c.ex.f; if (!FIGS[n]) err(`${t.id} card ${i}: unknown example figure ${n}`); } if (c.ex.s && (!Array.isArray(c.ex.s) || c.ex.s.length < 2 || c.ex.s.length > 5)) err(`${t.id} card ${i}: example strip needs 2-5 steps`); }
      nCards++;
    });
    if (t.ctx) nCtx++;
    if (!t.hook || !t.reveal || !t.keys || !t.traps) err(`${t.id}: missing hook/reveal/keys/traps`);
    if (/\$/.test(t.title)) err(`${t.id}: keep maths out of topic titles`);
    t.quiz.forEach((q, i) => { checkQ(q, `${t.id} quiz ${i + 1}`, t); tally(q); });
  });
  (w.test || []).forEach((q, i) => { checkQ(q, `${w.id} test ${i + 1}`); tally(q); if (q.t && !q.t.startsWith(w.id + "t")) err(`${w.id} test ${i + 1}: topic ${q.t} is from another week`); });
  if ((w.test || []).length < 10) err(`${w.id}: section test has ${(w.test || []).length} questions`);
  walk(w, w.id);
});
C.finals.forEach((q, i) => { checkQ(q, `final ${i + 1}`); tally(q); });
walk(C.finals, "finals"); walk(C.formulas, "formulas"); walk(C.glossary, "glossary");
Object.keys(FIGS).filter((k) => k[0] !== "_").forEach((k) => { try { const s = FIGS[k](); if (!/^<svg[\s\S]*<\/svg>$/.test(s.trim())) err(`figure ${k}: not an <svg>`); } catch (e) { err(`figure ${k}: ${e.message}`); } });
const gnames = new Set(); C.glossary.forEach((g, i) => { if (!g[0] || !g[1]) err(`glossary ${i}: missing term or definition`); [g[0]].concat(g[2] || []).forEach((n) => { if (gnames.has(n.toLowerCase())) err(`glossary: duplicate name ${n}`); gnames.add(n.toLowerCase()); }); });

const covered = new Set(); C.weeks.forEach((w) => w.topics.forEach((t) => t.lec.forEach((n) => covered.add(+n))));
for (let n = 1; n <= 74; n++) if (!covered.has(n)) err(`lecture ${n} is not mapped to any topic`);

const plan = minutes + C.weeks.length * 10 + 30;
console.log(`relatable examples ${nEx}/${nCards} cards · context ${nCtx}/${Object.keys(topics).length} topics`);
console.log(`weeks ${C.weeks.length} · topics ${Object.keys(topics).length} · questions ${nq} (MCQ ${types.mcq}, MSQ ${types.msq}, NAT ${types.nat}) · finals ${C.finals.length} · equations ${nMath} · glossary ${C.glossary.length} · figures ${Object.keys(FIGS).filter((k) => k[0] !== "_").length} · widgets ${widgets.size}`);
console.log(`planned minutes: topics ${minutes} + tests ${C.weeks.length * 10} + revision 30 = ${plan} (${(plan / 60).toFixed(2)} h)`);
if (plan !== 960) err(`plan totals ${plan} min, expected 960`);
console.log(errors ? `${errors} problem(s)` : "content OK");
process.exit(errors ? 1 : 0);
