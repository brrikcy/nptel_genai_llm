#!/usr/bin/env node
/* Simulated learner for the learning path: starts from zero and plays every level in order through the real UI
   (lessons, practice with hearts, reviews to earn hearts back, checkpoints, the three timed mocks) until the path is
   complete. It answers each question correctly with probability SKILL, so mistakes, re-queued questions, lost hearts,
   failed checkpoints and reviews all happen. Checks: the path can be completed, gating holds, nothing errors.
   Usage: node tools/path-walkthrough.js [--skill=0.85] [--seed=11]     (needs Playwright) */
"use strict";
const path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "/opt/node22/lib/node_modules/playwright");
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? +a.split("=")[1] : d; };
const SKILL = arg("skill", 0.85), SEED = arg("seed", 11);
const FILE = "file://" + path.join(__dirname, "..", "index.html");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.goto(FILE); await page.evaluate(() => localStorage.clear()); await page.goto(FILE);
  await page.evaluate(({ SKILL, SEED }) => {
    let s = SEED >>> 0; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const norm = (x) => x.replace(/\s+/g, " ").trim();
    const textOf = (html) => { const d = document.createElement("div"); d.innerHTML = html; window.renderMath(d); d.querySelectorAll(".katex-mathml").forEach((x) => x.remove()); return norm(d.textContent); };
    const lookup = new Map();
    const add = (q) => { const k = textOf(q.q); if (!lookup.has(k)) lookup.set(k, q); };
    Object.values(window.__GENAI.QBANK).forEach(add); window.__GENAI.MOCKS.flat().forEach(add);
    window.__SIM = {
      answer() {
        const el = document.querySelector(".qtext"); const c = el.cloneNode(true); c.querySelectorAll(".katex-mathml").forEach((x) => x.remove());
        const q = lookup.get(norm(c.textContent)); if (!q) return { missing: norm(c.textContent).slice(0, 80) };
        const right = rnd() < SKILL;
        if (q.a && typeof q.a === "object" && !Array.isArray(q.a)) { const inp = document.querySelector(".natbox input"); inp.value = String(right ? q.a.n : q.a.n + 10 * (q.a.tol || 0.01) + 1); inp.dispatchEvent(new Event("input", { bubbles: true })); }
        else if (Array.isArray(q.a)) { const pick = right ? q.a : q.a.length > 1 ? q.a.slice(1) : [q.o.findIndex((_, i) => !q.a.includes(i))]; pick.forEach((i) => document.querySelector(`.opt[data-i="${i}"]`).click()); }
        else document.querySelector(`.opt[data-i="${right ? q.a : (q.a + 1) % q.o.length}"]`).click();
        return { right };
      },
      state() { const g = window.__GENAI.S().game || {}; const L = window.__GENAI.GAME.levels; return { done: L.filter(window.__GENAI.GAME.isDone).length, total: L.length, xp: g.xp, gems: g.gems, hearts: g.hearts, streak: g.streak }; },
    };
  }, { SKILL, SEED });

  const stats = { lessons: 0, practice: 0, checkpoints: 0, checkFails: 0, outOfHearts: 0, reviews: 0, mocks: [], answered: 0, missing: [], gating: [] };
  const has = (sel) => page.$(sel).then(Boolean);
  const click = async (sel) => { await page.click(sel); await page.waitForTimeout(25); };

  // gating: a locked node must not open
  await page.evaluate(() => window.__GENAI.go("path"));
  await page.click(".gnode.locked"); await page.waitForTimeout(50);
  if (!(await has(".gnode.here"))) stats.gating.push("clicking a locked node left the path");

  async function playSession() {
    for (let guard = 0; guard < 400; guard++) {
      if (await has("#gcheck")) { const a = await page.evaluate(() => window.__SIM.answer()); if (a.missing) { stats.missing.push(a.missing); return "missing"; } stats.answered++; await click("#gcheck"); await click("#gcont"); continue; }
      if (await has("[data-a=review]")) { stats.outOfHearts++; await click("[data-a=review]"); stats.reviews++; continue; }
      if (await has("[data-a=retry]")) { stats.checkFails++; await click("[data-a=retry]"); continue; }
      if (await has("#gpath")) { await click("#gpath"); return "done"; }
      if (await has("[data-a=path]")) { await click("[data-a=path]"); return "stuck"; }
      await page.waitForTimeout(30);
    }
    return "loop";
  }

  for (let step = 0; step < 400; step++) {
    await page.evaluate(() => window.__GENAI.go("path")); await page.waitForTimeout(40);
    const st = await page.evaluate(() => window.__SIM.state());
    if (st.done >= st.total) break;
    const kind = await page.evaluate(() => { const n = document.querySelector(".gnode.here"); return n ? [...n.classList].find((c) => ["learn", "practice", "check", "mock"].includes(c)) : null; });
    if (!kind) { stats.gating.push("no current node"); break; }
    await click(".gnode.here");
    if (kind === "learn") {
      for (let g = 0; g < 40; g++) {
        const ask = await page.$(".ask:not(.done) .opts button:not([disabled])");
        if (ask) await page.evaluate(() => { const box = document.querySelector(".ask"); box.querySelectorAll(".opts button")[+box.dataset.a].click(); box.classList.add("done"); });
        await click("#gnext");
        if (await has("#gpath")) { await click("#gpath"); stats.lessons++; break; }
      }
    } else if (kind === "mock") {
      const total = await page.evaluate(() => document.querySelectorAll(".pal-grid button").length);
      for (let k = 0; k < total; k++) { const a = await page.evaluate(() => window.__SIM.answer()); if (a.missing) stats.missing.push(a.missing); stats.answered++; await page.click("#nextq"); }
      await page.click("#submit"); await page.click("#sub-yes"); await page.waitForTimeout(80);
      stats.mocks.push(await page.evaluate(() => document.querySelector(".result-head h2").textContent));
    } else {
      const r = await playSession();
      if (r !== "done") { stats.gating.push(`${kind} session ended: ${r}`); if (r !== "stuck") break; }
      if (kind === "practice") stats.practice++; else stats.checkpoints++;
    }
  }
  const final = await page.evaluate(() => window.__SIM.state());
  await browser.close();
  console.log(JSON.stringify({ skill: SKILL, final, ...stats, errors: errs.slice(0, 5) }, null, 1));
  process.exitCode = final.done === final.total && !errs.length && !stats.missing.length && !stats.gating.length ? 0 : 1;
})();
