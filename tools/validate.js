/* Content validator: node tools/validate.js
   Checks every lesson card, quiz, section test and mock question for structural errors. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const src = path.join(__dirname, "..", "src");
const ctx = { window: {}, console };
ctx.window.COURSE = { weeks: [], finals: [], formulas: [] };
ctx.COURSE = ctx.window.COURSE;
vm.createContext(ctx);
const files = ["lectures.js", ...Array.from({ length: 12 }, (_, i) => `content/w${String(i + 1).padStart(2, "0")}.js`), "content/finals.js", "content/formulas.js"];
files.forEach((f) => vm.runInContext(fs.readFileSync(path.join(src, f), "utf8"), ctx, { filename: f }));
const C = ctx.window.COURSE, L = ctx.window.LECTURES;
const widgetSrc = fs.readFileSync(path.join(src, "widgets1.js"), "utf8") + fs.readFileSync(path.join(src, "widgets2.js"), "utf8");
const widgets = new Set([...widgetSrc.matchAll(/W\.(\w+) = \(el\)/g)].map((m) => m[1]));

let errors = 0; const err = (m) => { errors++; console.log("✗", m); };
const topics = {};
C.weeks.forEach((w) => w.topics.forEach((t, i) => (topics[t.id] = t)));

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

let nq = 0, minutes = 0, types = { mcq: 0, msq: 0, nat: 0 };
const tally = (q) => { nq++; types[Array.isArray(q.a) ? "msq" : typeof q.a === "object" ? "nat" : "mcq"]++; };
C.weeks.forEach((w) => {
  w.topics.forEach((t) => {
    minutes += t.min;
    t.lec.forEach((n) => { if (!L[n]) err(`${t.id}: unknown lecture ${n}`); });
    t.cards.forEach((c, i) => { if (c.w && !widgets.has(c.w)) err(`${t.id} card ${i}: unknown widget ${c.w}`); if (c.ask && (c.ask.a >= c.ask.o.length)) err(`${t.id} card ${i}: ask answer out of range`); });
    if (!t.hook || !t.reveal || !t.keys || !t.traps) err(`${t.id}: missing hook/reveal/keys/traps`);
    t.quiz.forEach((q, i) => { checkQ(q, `${t.id} quiz ${i + 1}`, t); tally(q); });
  });
  (w.test || []).forEach((q, i) => { checkQ(q, `${w.id} test ${i + 1}`); tally(q); if (q.t && !q.t.startsWith(w.id + "t")) err(`${w.id} test ${i + 1}: topic ${q.t} is from another week`); });
  if ((w.test || []).length !== 10) err(`${w.id}: section test has ${(w.test || []).length} questions`);
});
C.finals.forEach((q, i) => { checkQ(q, `final ${i + 1}`); tally(q); });

const covered = new Set(); C.weeks.forEach((w) => w.topics.forEach((t) => t.lec.forEach((n) => covered.add(+n))));
for (let n = 1; n <= 74; n++) if (!covered.has(n)) err(`lecture ${n} is not mapped to any topic`);

const plan = minutes + 12 * 10 + 30;
console.log(`weeks ${C.weeks.length} · topics ${Object.keys(topics).length} · questions ${nq} (MCQ ${types.mcq}, MSQ ${types.msq}, NAT ${types.nat}) · finals ${C.finals.length}`);
console.log(`planned minutes: topics ${minutes} + tests 120 + revision 30 = ${plan} (${(plan / 60).toFixed(2)} h)`);
if (plan !== 960) err(`plan totals ${plan} min, expected 960`);
console.log(errors ? `${errors} problem(s)` : "content OK");
process.exit(errors ? 1 : 0);
