#!/usr/bin/env node
/* Simulated learner: opens the built index.html in a real browser and works through the whole course in order,
   the way a student would. It reads every topic, plays with every interactive model, opens a word-bank popup,
   takes every topic quiz, every section test and all three mocks, then checks the app's own bookkeeping.
   The learner answers each question correctly with probability SKILL (default 0.85), so the wrong-answer paths
   (explanations, remedies, mistake book) are exercised too. Every answer the app marks is compared with the key.
   Usage: node tools/student-walkthrough.js [--skill=0.85] [--seed=7]
   Needs Playwright (PLAYWRIGHT_PATH or the global install). */
"use strict";
const path = require("path");
const PW = process.env.PLAYWRIGHT_PATH || "/opt/node22/lib/node_modules/playwright";
const { chromium } = require(PW);
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? +a.split("=")[1] : d; };
const SKILL = arg("skill", 0.85), SEED = arg("seed", 7);
const FILE = "file://" + path.join(__dirname, "..", "index.html");

(async () => {
  const browser = await chromium.launch();
  const report = { topics: [], tests: [], mocks: [], pages: {}, mismatches: [], phoneOverflow: [] };
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.goto(FILE);
  await page.evaluate(() => localStorage.clear());
  await page.goto(FILE);

  /* In-page helpers: a seeded coin, question lookup by rendered text, page health, answering. */
  await page.evaluate(({ SKILL, SEED }) => {
    let s = SEED >>> 0; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const norm = (x) => x.replace(/\s+/g, " ").trim();
    const textOf = (html) => { const d = document.createElement("div"); d.innerHTML = html; window.renderMath(d); d.querySelectorAll(".katex-mathml").forEach((x) => x.remove()); return norm(d.textContent); };
    const lookup = new Map();
    const add = (q) => { const k = textOf(q.q); if (!lookup.has(k)) lookup.set(k, []); if (!lookup.get(k).includes(q)) lookup.get(k).push(q); };
    Object.values(window.__GENAI.QBANK).forEach(add); window.__GENAI.MOCKS.flat().forEach(add);
    const health = (root) => {
      const m = root.cloneNode(true); m.querySelectorAll(".katex-mathml, svg, code, textarea, input, script").forEach((x) => x.remove());
      const tx = m.textContent;
      return { katexErr: root.querySelectorAll(".katex-error").length, dollars: (tx.match(/\$/g) || []).length, bare: (tx.match(/\\[a-zA-Z]{2,}/g) || []).slice(0, 3) };
    };
    const current = () => { const el = document.querySelector(".qtext"); const c = el.cloneNode(true); c.querySelectorAll(".katex-mathml").forEach((x) => x.remove()); const k = norm(c.textContent); const hit = lookup.get(k) || []; return { q: hit[0], ambiguous: hit.length > 1 && new Set(hit.map((h) => JSON.stringify(h.a))).size > 1, k }; };
    /* Answer the visible question; returns whether the learner meant to be right. */
    const answer = () => {
      const { q, ambiguous, k } = current();
      if (!q) return { missing: k.slice(0, 90) };
      const right = rnd() < SKILL;
      if (q.a && typeof q.a === "object" && !Array.isArray(q.a)) {
        const inp = document.querySelector(".natbox input");
        const v = right ? q.a.n : q.a.n + 10 * (q.a.tol || 0.01) + 1;
        inp.value = String(v); inp.dispatchEvent(new Event("input", { bubbles: true }));
      } else if (Array.isArray(q.a)) {
        const pick = right ? q.a : q.a.slice(1);
        if (!pick.length) document.querySelectorAll(".opt").forEach((b) => { if (!q.a.includes(+b.dataset.i) && !pick.length) { b.click(); pick.push(+b.dataset.i); } });
        else pick.forEach((i) => document.querySelector(`.opt[data-i="${i}"]`).click());
      } else {
        const n = q.o.length; const i = right ? q.a : (q.a + 1) % n;
        document.querySelector(`.opt[data-i="${i}"]`).click();
      }
      return { right, ambiguous, id: q.id || q.q.slice(0, 50) };
    };
    window.__SIM = { health, answer, current };
  }, { SKILL, SEED });

  const settle = () => page.waitForTimeout(120);
  const flat = await page.evaluate(() => window.__GENAI.planItems.filter((x) => x.kind === "topic").map((x) => x.id));
  const weeks = await page.evaluate(() => window.__GENAI.planItems.filter((x) => x.kind === "test").map((x) => x.id));

  for (const tid of flat) {
    const rec = { id: tid, errors: [] };
    const e0 = errs.length;
    await page.evaluate((t) => window.__GENAI.go("topic", t), tid); await settle();
    Object.assign(rec, await page.evaluate(() => window.__SIM.health(document.querySelector("#main"))));
    /* play with every model: sliders to both ends and the middle, every toggle button */
    rec.widgets = await page.evaluate(async () => {
      const ws = [...document.querySelectorAll("#main .widget")]; let moves = 0;
      for (const w of ws) {
        for (const r of w.querySelectorAll('input[type="range"]')) for (const v of [r.min, r.max, (+r.min + +r.max) / 2]) { r.value = v; r.dispatchEvent(new Event("input", { bubbles: true })); moves++; }
        for (const b of w.querySelectorAll(".seg button, button.btn")) { b.click(); moves++; }
      }
      await new Promise((r) => setTimeout(r, 150));
      return { count: ws.length, moves, after: window.__SIM.health(document.querySelector("#main")) };
    });
    /* word bank popup */
    rec.term = await page.evaluate(() => { const t = document.querySelector("#main .term"); if (!t) return "none"; t.click(); const p = document.querySelector(".termpop"); const ok = p && !p.hidden && p.textContent.trim().length > 20; document.body.click(); return ok ? "ok" : "broken"; });
    /* topic quiz */
    await page.evaluate((t) => window.__GENAI.go("quiz", t), tid); await settle();
    let n = 0, ok = 0;
    for (let guard = 0; guard < 40; guard++) {
      if (!(await page.$("#check"))) break;
      const a = await page.evaluate(() => window.__SIM.answer());
      if (a.missing) { report.mismatches.push(`${tid}: question not found: ${a.missing}`); break; }
      await page.click("#check"); await settle();
      const marked = await page.evaluate(() => document.querySelector(".explain").classList.contains("good"));
      if (marked !== a.right && !a.ambiguous) report.mismatches.push(`${tid} ${a.id}: learner was ${a.right ? "right" : "wrong"} but the app marked it ${marked ? "correct" : "wrong"}`);
      Object.assign(rec, { lastExplain: await page.evaluate(() => window.__SIM.health(document.querySelector(".explain"))) });
      n++; if (marked) ok++;
      await page.click("#next"); await settle();
    }
    rec.quiz = `${ok}/${n}`;
    rec.errors = errs.slice(e0);
    report.topics.push(rec);
  }

  async function runExam(go, label, expectN) {
    const e0 = errs.length;
    await page.evaluate(go); await settle();
    const total = await page.evaluate(() => document.querySelectorAll(".pal-grid button").length);
    let right = 0;
    for (let k = 0; k < total; k++) {
      const a = await page.evaluate(() => window.__SIM.answer());
      if (a.missing) report.mismatches.push(`${label}: question not found: ${a.missing}`); else if (a.right) right++;
      await page.click("#nextq"); await page.waitForTimeout(40);
    }
    await page.click("#submit"); await page.click("#sub-yes"); await settle();
    const shown = await page.evaluate(() => { const r = document.querySelector(".ring, .score-ring, .result-head"); return r ? r.textContent.replace(/\s+/g, " ").slice(0, 120) : ""; });
    const h = await page.evaluate(() => window.__SIM.health(document.querySelector("#main")));
    return { label, total, learnerRight: right, shown, ...h, errors: errs.slice(e0) };
  }
  for (const w of weeks) report.tests.push(await runExam(`window.__GENAI.go("test", "${w}")`, `test ${w}`));
  for (const k of [1, 2, 3]) report.mocks.push(await runExam(`window.__GENAI.go("mock", ${k})`, `mock ${k}`));

  /* bookkeeping the learner sees afterwards */
  report.progress = await page.evaluate(() => { const S = window.__GENAI.S(); return { topicsPassed: Object.values(S.topics).filter((t) => t.passed).length, testsPassed: Object.values(S.tests).filter((t) => t.passed).length, mistakes: Object.keys(S.mistakes || {}).length }; });
  for (const v of ["home", "mistakes", "formulas", "glossary", "mocks"]) {
    const e0 = errs.length; await page.evaluate((x) => window.__GENAI.go(x), v); await settle();
    report.pages[v] = { ...(await page.evaluate(() => window.__SIM.health(document.querySelector("#main")))), errors: errs.slice(e0) };
  }

  /* phone check: no sideways scrolling on any topic */
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await phone.goto(FILE);
  for (const tid of flat) {
    await phone.evaluate((t) => window.__GENAI.go("topic", t), tid); await phone.waitForTimeout(80);
    const o = await phone.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: innerWidth }));
    if (o.sw > o.w + 1) report.phoneOverflow.push(`${tid}: page is ${o.sw}px wide on a ${o.w}px screen`);
  }
  await browser.close();

  /* summary */
  const bad = (r) => r.katexErr || r.dollars || (r.bare && r.bare.length) || (r.errors && r.errors.length);
  const tp = report.topics;
  console.log(`topics visited ${tp.length} · models exercised ${tp.reduce((s, r) => s + r.widgets.count, 0)} (${tp.reduce((s, r) => s + r.widgets.moves, 0)} slider moves / clicks) · word-bank popups ${tp.filter((r) => r.term === "ok").length} ok, ${tp.filter((r) => r.term === "broken").length} broken`);
  console.log(`topic quizzes: ${tp.reduce((s, r) => s + +r.quiz.split("/")[1], 0)} questions answered`);
  console.log(`section tests: ${report.tests.map((t) => t.label.replace("test ", "") + " " + t.learnerRight + "/" + t.total).join(" · ")}`);
  console.log(`mocks: ${report.mocks.map((t) => t.label + " " + t.learnerRight + "/" + t.total).join(" · ")}`);
  console.log(`progress shown: ${JSON.stringify(report.progress)}`);
  const issues = [
    ...tp.filter(bad).map((r) => `${r.id}: maths errors ${r.katexErr}, stray $ ${r.dollars}, raw LaTeX ${r.bare}, script errors ${r.errors.join(" | ")}`),
    ...tp.filter((r) => r.widgets.after.katexErr || r.widgets.after.dollars).map((r) => `${r.id}: a model showed broken maths after interaction`),
    ...[...report.tests, ...report.mocks].filter(bad).map((r) => `${r.label}: maths errors ${r.katexErr}, stray $ ${r.dollars}, script errors ${r.errors.join(" | ")}`),
    ...["home", "mistakes", "formulas", "glossary", "mocks"].filter((v) => bad(report.pages[v])).map((v) => `${v} page: ${JSON.stringify(report.pages[v])}`),
    ...report.mismatches, ...report.phoneOverflow,
  ];
  console.log(issues.length ? `\nISSUES (${issues.length}):\n  ` + issues.join("\n  ") : "\nno issues found");
  if (process.argv.includes("--json")) require("fs").writeFileSync(path.join(__dirname, "..", "walkthrough-report.json"), JSON.stringify(report, null, 1));
  process.exitCode = issues.length ? 1 : 0;
})();
