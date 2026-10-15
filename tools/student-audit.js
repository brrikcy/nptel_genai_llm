#!/usr/bin/env node
/* Learner audit: how readable is each topic for a Class 10 student, and does the 16-hour plan fit?
   Usage: node tools/student-audit.js [--pace=careful|brisk] [--cards] [--json]   (--cards lists the 25 hardest cards)
   - Readability: Flesch–Kincaid grade of the prose (maths replaced by a short placeholder word).
   - Time: an estimate of honest study time for a first-time learner, compared with the planned minutes.
   - Jargon: abbreviations that are neither in the word bank nor spelled out earlier in the course. */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const SRC = path.join(__dirname, "..", "src", "content");
const ctx = { R: String.raw, window: {}, COURSE: { weeks: [], finals: [], formulas: [], glossary: [] } };
vm.createContext(ctx);
const files = ["w00", "w01", "w02", "w03", "w04", "w05", "w06", "w07", "w08", "w09", "w10", "w11", "w12", "glossary"];
files.forEach((f) => vm.runInContext(fs.readFileSync(path.join(SRC, f + ".js"), "utf8"), ctx, { filename: f + ".js" }));
const { weeks, glossary } = ctx.COURSE;

/* ---------- text helpers ---------- */
const mathCount = (s) => { const d = (s.match(/\$\$[\s\S]+?\$\$/g) || []).length; const i = (s.replace(/\$\$[\s\S]+?\$\$/g, "").match(/\$[^$\n]+?\$/g) || []).length; return { d, i }; };
const prose = (s) => String(s || "").replace(/\$\$[\s\S]+?\$\$/g, " . ").replace(/\$[^$\n]+?\$/g, " x ").replace(/<\/(li|p|div|tr|h\d)>/g, ". ").replace(/<[^>]+>/g, " ").replace(/&\w+;/g, " ").replace(/[“”"]/g, "").replace(/\s+/g, " ").trim();
const syl = (w) => { w = w.toLowerCase().replace(/[^a-z]/g, ""); if (!w) return 0; if (w.length <= 3) return 1; w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, ""); const m = w.match(/[aeiouy]{1,2}/g); return Math.max(1, m ? m.length : 1); };
function stats(text) {
  const sents = text.split(/[.!?;:]+(?:\s|$)|\s[→·–]\s/).map((x) => x.trim()).filter((x) => /[a-zA-Z]/.test(x));
  const words = text.match(/[A-Za-z][A-Za-z'-]*/g) || [];
  const sy = words.reduce((a, w) => a + syl(w), 0);
  const hard = words.filter((w) => syl(w) >= 3 && !/^[A-Z]/.test(w)).length;
  const fk = words.length ? 0.39 * (words.length / Math.max(1, sents.length)) + 11.8 * (sy / words.length) - 15.59 : 0;
  return { words: words.length, sents: sents.length, fk, hard };
}

/* ---------- time model (minutes) ---------- */
/* Two learner paces. Careful: first-time reader who works every example. Brisk: confident reader. */
const PACES = { careful: { wpm: 130, inl: 4 / 60, disp: 20 / 60, fig: 0.5, wid: 2, ask: 0.6, mcq: 0.75, nat: 1.5, msq: 1 },
                brisk:   { wpm: 160, inl: 3 / 60, disp: 15 / 60, fig: 0.4, wid: 1.5, ask: 0.5, mcq: 0.5, nat: 1.25, msq: 0.75 } };
const paceArg = (process.argv.find((a) => a.startsWith("--pace=")) || "--pace=careful").slice(7);
const T = PACES[paceArg] || PACES.careful, WPM = T.wpm;

const gl = new Set(); glossary.forEach(([term, , alias]) => { gl.add(term.toLowerCase()); (alias || []).forEach((a) => gl.add(String(a).toLowerCase())); });
const seenExpanded = new Set();
const jargon = [];
const rows = [], cardRows = [];
let tot = { plan: 0, est: 0 };

weeks.forEach((w) => w.topics.forEach((t) => {
  let words = 0, est = 0, fkW = 0;
  const parts = [["hook", t.hook], ["reveal", t.reveal], ...t.cards.map((c, i) => ["card " + (i + 1) + ": " + c.h, c.b + (c.ask ? " " + c.ask.q : "")]), ["keys", (t.keys || []).join(". ")], ["traps", (t.traps || []).join(". ")]];
  parts.forEach(([name, raw]) => {
    const p = prose(raw), s = stats(p), m = mathCount(String(raw || ""));
    words += s.words; fkW += s.fk * s.words;
    est += s.words / WPM + m.i * T.inl + m.d * T.disp;
    if (name.startsWith("card") && s.words > 40) cardRows.push({ id: t.id, name, fk: s.fk, words: s.words });
    /* jargon: abbreviations used before being explained */
    const txt = String(raw || "").replace(/<[^>]+>/g, " ").replace(/\$[^$]*\$/g, " ");
    (txt.match(/\b[A-Z][A-Z0-9]{1,}[a-z]?\b(?:-\d+)?/g) || []).forEach((ab) => {
      const k = ab.toLowerCase();
      if (gl.has(k) || seenExpanded.has(k) || /^(I|II|III|AI|OK|PDF|GPU|GPUs|CPU|URL|TV|USA|UK|ID)$/.test(ab)) return;
      const re = new RegExp("\\b" + ab.replace(/[-]/g, "\\-") + "\\s*\\(|\\(\\s*" + ab + "\\s*\\)|\\b" + ab + "\\b[^.]{0,60}\\b(stands for|means|short for)|\\b" + ab + "</b>\\s*\\(", "i");
      if (re.test(String(raw))) { seenExpanded.add(k); return; }
      seenExpanded.add(k); jargon.push(`${t.id} (${name.split(":")[0]}): ${ab}`);
    });
  });
  t.cards.forEach((c) => { if (c.f) est += T.fig; if (c.w) est += T.wid; if (c.ask) est += T.ask; });
  (t.quiz || []).forEach((q) => (est += q.a && typeof q.a === "object" && !Array.isArray(q.a) ? T.nat : Array.isArray(q.a) ? T.msq : T.mcq));
  tot.plan += t.min; tot.est += est;
  rows.push({ id: t.id, title: t.title, plan: t.min, est, words, fk: words ? fkW / words : 0, figs: t.cards.filter((c) => c.f).length, wid: t.cards.filter((c) => c.w).length, quiz: (t.quiz || []).length });
}));

const pad = (s, n) => String(s).padEnd(n), num = (x, d = 1) => x.toFixed(d);
console.log(pad("topic", 7), pad("title", 52), "plan  est   words  FK   fig wid quiz");
rows.forEach((r) => console.log(pad(r.id, 7), pad(r.title.slice(0, 50), 52), pad(r.plan, 5), pad(num(r.est), 5), pad(r.words, 6), pad(num(r.fk), 4), pad(r.figs, 3), pad(r.wid, 3), r.quiz));
const fks = rows.map((r) => r.fk).sort((a, b) => a - b);
console.log(`\ntopics ${rows.length} · planned ${tot.plan} min · estimated study (${paceArg} pace) ${Math.round(tot.est)} min (${num(tot.est / tot.plan * 100, 0)}% of plan)`);
console.log(`reading grade (Flesch–Kincaid) median ${num(fks[fks.length >> 1])} · range ${num(fks[0])}–${num(fks[fks.length - 1])} · topics above grade 10: ${rows.filter((r) => r.fk > 10).length}`);
console.log(`over budget by >25%: ${rows.filter((r) => r.est > r.plan * 1.25).map((r) => r.id + " (" + num(r.est) + "/" + r.plan + ")").join(", ") || "none"}`);
console.log(`topics without a figure or model: ${rows.filter((r) => !r.figs && !r.wid).map((r) => r.id).join(", ") || "none"}`);
console.log(`\nabbreviations not in the word bank and not spelled out where first used (${jargon.length}):\n  ` + (jargon.join("\n  ") || "none"));
if (process.argv.includes("--cards")) { console.log("\nhardest cards:"); cardRows.sort((a, b) => b.fk - a.fk).slice(0, 25).forEach((c) => console.log(" ", pad(num(c.fk), 5), pad(c.id, 7), c.name.slice(0, 80), `(${c.words} words)`)); }
if (process.argv.includes("--json")) fs.writeFileSync(path.join(__dirname, "..", "audit-" + paceArg + ".json"), JSON.stringify(rows.map((r) => ({ id: r.id, plan: r.plan, est: +r.est.toFixed(2) }))));
