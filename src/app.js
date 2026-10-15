/* GenAI 16-Hour Sprint — app engine (vanilla JS, no dependencies) */
(function () {
  "use strict";
  const COURSE = window.COURSE;
  const LECT = window.LECTURES;
  const WIDGETS = window.WIDGETS || {};
  const BUDGET_MIN = 960;            // 16 hours
  const TEST_MIN = 10;               // planned minutes per section test
  const REVISION_MIN = 30;           // final revision slot
  const SESSION_MIN = 120;           // 8 sessions x 2 h
  const TOPIC_PASS = 0.8, TEST_PASS = 0.7;
  const IDLE_MS = 4 * 60 * 1000;

  /* ---------- helpers ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const strip = (s) => String(s).replace(/<[^>]+>/g, "");
  const pct = (x) => Math.round(x * 100);
  const fmtHM = (sec) => { const m = Math.floor(sec / 60); return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`; };
  const fmtMin = (sec) => { const m = Math.round(sec / 60); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`; };
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const ytLink = (n) => { const L = LECT[n]; return L ? `https://www.youtube.com/watch?v=${L[0]}&list=${window.PLAYLIST}` : "#"; };
  function shuffle(a, seed) {
    a = a.slice(); let s = seed || Math.floor(Math.random() * 1e9);
    const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const icon = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    exam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 4h6l1 2h3v15H5V6h3z"/><path d="M9 12l2 2 4-4"/></svg>',
    mock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></svg>',
    sheet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7M9 8h3"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 8l5 5M14 8l-5 5"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 14.4H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 4.6V4a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 19.4 10H20a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-.5 1z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>',
    abc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18l4-12 4 12M4.5 14h5M14 6h4a3 3 0 0 1 0 6h-4zM14 12h4.5a3 3 0 0 1 0 6H14z"/></svg>',
    play2: '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M7 4l13 8-13 8z"/></svg>'
  };

  /* ---------- store ---------- */
  const KEY = "genai16.v1";
  const fresh = () => ({ v: 1, topics: {}, tests: {}, mocks: {}, mistakes: {}, time: { total: 0, ctx: {}, day: {}, offline: 0 }, last: null, theme: null, started: null });
  let S = load();
  function load() {
    let s = fresh();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const p = JSON.parse(raw); s = Object.assign(s, p); s.time = Object.assign(fresh().time, p.time || {}); }
    } catch (e) { /* storage blocked: run in memory */ }
    return s;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }

  /* ---------- course index ---------- */
  const weeks = COURSE.weeks.slice().sort((a, b) => a.n - b.n);
  const topicById = {}, weekById = {}, flat = [];
  weeks.forEach((w) => {
    weekById[w.id] = w;
    w.topics.forEach((t, i) => { t.week = w; t.idx = i; topicById[t.id] = t; flat.push(t); });
  });
  const QBANK = {};   // id -> {q, src}
  weeks.forEach((w) => {
    w.topics.forEach((t) => (t.quiz || []).forEach((q, i) => { q.id = `${t.id}.q${i + 1}`; q.t = q.t || t.id; QBANK[q.id] = q; }));
    (w.test || []).forEach((q, i) => { q.id = `${w.id}.s${i + 1}`; QBANK[q.id] = q; });
  });
  const finals = (COURSE.finals || []).map((q, i) => { q.id = `f${i + 1}`; QBANK[q.id] = q; return q; });
  const MOCKS = [[], [], []];
  (function buildMocks() {
    const byWeek = {};
    finals.forEach((q) => { const wk = (topicById[q.t] && topicById[q.t].week.id) || "x"; (byWeek[wk] = byWeek[wk] || []).push(q); });
    let k = 0;
    Object.keys(byWeek).sort((a, b) => (weekById[a] ? weekById[a].n : 99) - (weekById[b] ? weekById[b].n : 99))
      .forEach((wk) => byWeek[wk].forEach((q) => { MOCKS[k % 3].push(q); k++; }));
  })();

  /* plan: planned minutes per topic + per week test + revision, packed into 2-hour sessions */
  const planItems = [];
  weeks.forEach((w) => {
    w.topics.forEach((t) => planItems.push({ kind: "topic", id: t.id, label: t.title, wk: w.n, min: t.min }));
    planItems.push({ kind: "test", id: w.id, label: `Week ${w.n} section test`, wk: w.n, min: TEST_MIN });
  });
  planItems.push({ kind: "rev", id: "rev", label: "Formula sheet + mistake book revision", wk: 13, min: REVISION_MIN });
  const plannedTotal = planItems.reduce((s, x) => s + x.min, 0);
  const sessions = [];
  (function pack() {
    let acc = 0;
    planItems.forEach((it) => {
      const k = Math.min(7, Math.floor(acc / SESSION_MIN));
      (sessions[k] = sessions[k] || []).push(it);
      acc += it.min;
    });
  })();
  weeks.forEach((w) => { w.planMin = w.topics.reduce((s, t) => s + t.min, 0) + TEST_MIN; });

  /* ---------- status helpers ---------- */
  const tState = (id) => S.topics[id] || {};
  const isDone = (id) => !!tState(id).passed;
  const testState = (wid) => S.tests[wid] || {};
  function itemDone(it) {
    if (it.kind === "topic") return isDone(it.id);
    if (it.kind === "test") return !!testState(it.id).passed;
    return !!S.revDone;
  }
  function weekProgress(w) {
    const parts = w.topics.length + 1;
    const done = w.topics.filter((t) => isDone(t.id)).length + (testState(w.id).passed ? 1 : 0);
    return done / parts;
  }
  function nextItem() { return planItems.find((it) => !itemDone(it)) || null; }
  function topicSec(id) { return (S.time.ctx["topic:" + id] || 0) + (S.time.ctx["quiz:" + id] || 0) + (S.time.ctx["video:" + id] || 0); }
  function weekSec(w) { return w.topics.reduce((s, t) => s + topicSec(t.id), 0) + (S.time.ctx["test:" + w.id] || 0); }
  function readiness() {
    const ts = weeks.map((w) => testState(w.id).best).filter((x) => x != null);
    const ms = [1, 2, 3].map((k) => (S.mocks[k] || {}).best).filter((x) => x != null);
    if (!ts.length && !ms.length) return null;
    const tAvg = ts.length ? ts.reduce((a, b) => a + b, 0) / weeks.length : 0;   // untested weeks count as 0
    const mAvg = ms.length ? Math.max(...ms) : null;
    return mAvg == null ? tAvg : 0.5 * tAvg + 0.5 * mAvg;
  }

  /* ---------- study clock ---------- */
  const T = { running: true, lastAct: Date.now(), ctx: "home", ticks: 0 };
  ["mousemove", "keydown", "scroll", "touchstart", "click", "wheel", "input"].forEach((ev) =>
    addEventListener(ev, () => { T.lastAct = Date.now(); }, { passive: true, capture: true }));
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") T.lastAct = Date.now(); else save(); });
  function addTime(ctx, sec, offline) {
    S.time.total += sec;
    S.time.ctx[ctx] = (S.time.ctx[ctx] || 0) + sec;
    const d = today(); S.time.day[d] = (S.time.day[d] || 0) + sec;
    if (offline) S.time.offline += sec;
    if (!S.started) S.started = d;
  }
  function tick() {
    const active = T.running && document.visibilityState === "visible" && Date.now() - T.lastAct < IDLE_MS;
    if (active) addTime(T.ctx, 1);
    const c = $(".clock");
    if (c) {
      c.classList.toggle("on", active);
      c.classList.toggle("idle", T.running && !active);
      $(".clock-read b", c).textContent = fmtHM(S.time.total) + " / 16:00";
      $(".clock-read span", c).textContent = !T.running ? "paused" : active ? `today ${fmtHM(S.time.day[today()] || 0)} · counting` : "idle — move to resume";
      $(".clock .iconbtn", c).innerHTML = T.running ? icon.pause : icon.play;
      $(".clock .iconbtn", c).setAttribute("aria-label", T.running ? "Pause study clock" : "Resume study clock");
    }
    const ex = $("#exam-timer"); if (ex && EXAM) examTick();
    if (++T.ticks % 15 === 0) save();
  }
  setInterval(tick, 1000);
  addEventListener("pagehide", save);

  /* ---------- theme ---------- */
  function applyTheme() {
    const r = document.documentElement;
    if (S.theme) r.setAttribute("data-theme", S.theme); else r.removeAttribute("data-theme");
    const b = $("#theme-btn");
    if (b) { b.innerHTML = S.theme === "dark" ? icon.moon : S.theme === "light" ? icon.sun : icon.auto; b.setAttribute("aria-label", "Theme: " + (S.theme || "system")); }
  }

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg) {
    let t = $(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600);
  }

  /* ---------- shell ---------- */
  function shell() {
    let root = document.getElementById("app");
    if (!root) { root = document.createElement("div"); root.id = "app"; document.body.appendChild(root); }
    root.innerHTML = `
      <header class="topbar">
        <button class="iconbtn menu-btn" id="menu-btn" aria-label="Open course map">${icon.menu}</button>
        <button class="brand" id="brand" aria-label="Go to dashboard">
          <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="8" fill="var(--accent)"/><path d="M8 21c3-9 6-9 8 0s5 9 8 0" stroke="var(--sheet)" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="24" cy="9" r="2.6" fill="var(--hi)"/></svg>
          <span class="brand-text"><b>GenAI 16-Hour Sprint</b><span>NPTEL · IISc · Fundamentals of GenAI &amp; LLMs</span></span>
        </button>
        <div class="spacer"></div>
        <div class="clock" title="Active study time. Pauses after 4 idle minutes or when the tab is hidden.">
          <span class="clock-dot"></span>
          <span class="clock-read"><b class="num">0:00 / 16:00</b><span>today</span></span>
          <button class="iconbtn" id="clock-btn" style="width:30px;height:30px"></button>
        </div>
        <button class="iconbtn" id="theme-btn"></button>
      </header>
      <div class="shell">
        <nav class="rail" id="rail" aria-label="Course map"></nav>
        <div class="scrim" id="scrim"></div>
        <main class="main" id="main" tabindex="-1"></main>
      </div>`;
    $("#brand").onclick = () => go("home");
    $("#menu-btn").onclick = () => document.body.classList.toggle("drawer");
    $("#scrim").onclick = () => document.body.classList.remove("drawer");
    $("#clock-btn").onclick = () => { T.running = !T.running; T.lastAct = Date.now(); tick(); toast(T.running ? "Study clock running" : "Study clock paused"); };
    $("#theme-btn").onclick = () => { S.theme = S.theme == null ? "dark" : S.theme === "dark" ? "light" : null; applyTheme(); save(); rerender(); };
    applyTheme();
  }

  function ring(frac, size = 22) {
    const r = 9, c = 2 * Math.PI * r;
    return `<svg class="ring" viewBox="0 0 22 22" width="${size}" height="${size}" aria-hidden="true"><circle cx="11" cy="11" r="${r}" fill="none" stroke="var(--rule)" stroke-width="3"/><circle cx="11" cy="11" r="${r}" fill="none" stroke="${frac >= 1 ? "var(--good)" : "var(--accent)"}" stroke-width="3" stroke-dasharray="${c * frac} ${c}" transform="rotate(-90 11 11)" stroke-linecap="${frac > 0 ? "round" : "butt"}"/></svg>`;
  }

  function renderRail() {
    const rail = $("#rail"); if (!rail) return;
    const openW = VIEW.week || (VIEW.topic && topicById[VIEW.topic] && topicById[VIEW.topic].week.id);
    const nl = (v, ic, label, extra = "") => `<button class="navlink ${VIEW.name === v ? "active" : ""}" data-go="${v}">${icon[ic]}<span>${label}</span>${extra}</button>`;
    const nMist = Object.values(S.mistakes).filter((m) => !m.fixed).length;
    rail.innerHTML = `
      <div class="rail-nav">
        ${nl("home", "home", "Dashboard &amp; plan")}
        ${nl("exam", "exam", "Exam pattern &amp; strategy")}
        ${nl("formulas", "sheet", "Formula sheet")}
        ${nl("glossary", "abc", "Word bank")}
        ${nl("mistakes", "book", "Mistake book", nMist ? `<span class="chip bad" style="margin-left:auto">${nMist}</span>` : "")}
        ${nl("mocks", "mock", "Final mock exams")}
        ${nl("settings", "gear", "Progress backup")}
      </div>
      <h4>Course map · Week 0 + 12 weeks</h4>
      ${weeks.map((w) => `
        <div class="wk ${openW === w.id ? "open" : ""}" data-wk="${w.id}">
          <button class="wk-head" data-week="${w.id}" aria-expanded="${openW === w.id}">
            <span class="wk-n">W${String(w.n).padStart(2, "0")}</span><span class="wk-t">${w.title}</span>${ring(weekProgress(w))}
          </button>
          <div class="wk-topics">
            ${w.topics.map((t) => `<button class="tlink ${VIEW.topic === t.id ? "active" : ""}" data-topic="${t.id}"><span class="tick ${isDone(t.id) ? "done" : tState(t.id).read ? "read" : ""}"></span><span>${t.title}</span></button>`).join("")}
            <button class="tlink ${VIEW.name === "test" && VIEW.week === w.id ? "active" : ""}" data-test="${w.id}"><span class="tick test ${testState(w.id).passed ? "done" : ""}"></span><span>Section test</span></button>
          </div>
        </div>`).join("")}`;
    rail.onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.go) { go(b.dataset.go); closeDrawer(); }
      else if (b.dataset.week) {
        const wk = b.closest(".wk"); const open = wk.classList.toggle("open"); b.setAttribute("aria-expanded", open);
      } else if (b.dataset.topic) { go("topic", b.dataset.topic); closeDrawer(); }
      else if (b.dataset.test) { go("week", b.dataset.test); closeDrawer(); }
    };
  }
  const closeDrawer = () => document.body.classList.remove("drawer");

  /* ---------- router ---------- */
  let VIEW = { name: "home" };
  let EXAM = null;   // active timed exam
  function go(name, arg, opts = {}) {
    if (EXAM && EXAM.live && !opts.force) {
      if (!confirmLeave(name, arg)) return;
    }
    if (name !== "mock") EXAM = null;
    VIEW = { name, arg };
    if (name === "topic") { VIEW.topic = arg; VIEW.week = topicById[arg].week.id; }
    if (name === "quiz") { VIEW.topic = arg; VIEW.week = topicById[arg].week.id; }
    if (name === "week" || name === "test") VIEW.week = arg;
    T.ctx = name === "topic" ? "topic:" + arg : name === "quiz" ? "quiz:" + arg : name === "test" ? "test:" + arg : name === "mock" ? "mock:" + arg : name;
    if (name !== "home") S.last = { name, arg };
    save();
    render(opts);
  }
  function confirmLeave(name, arg) {
    const box = $("#leave-box"); if (box) { box.hidden = false; box.scrollIntoView({ block: "center" }); box.dataset.name = name; box.dataset.arg = arg || ""; }
    return false;
  }
  function rerender() { if (EXAM && EXAM.live) return; render({ keepScroll: true }); }
  function render(opts = {}) {
    const main = $("#main"); const y = scrollY;
    const v = VIEW;
    const fn = { home: viewHome, week: viewWeek, topic: viewTopic, quiz: viewQuiz, test: viewTest, mocks: viewMocks, mock: viewMock, formulas: viewFormulas, glossary: viewGlossary, mistakes: viewMistakes, exam: viewExam, settings: viewSettings, drill: viewDrill }[v.name] || viewHome;
    main.innerHTML = ""; hideTerm();
    fn(main, v.arg, opts);
    renderRail();
    if (opts.keepScroll) scrollTo(0, y); else { scrollTo(0, 0); main.focus({ preventScroll: true }); }
  }

  /* ---------- dashboard ---------- */
  function viewHome(main) {
    const nx = nextItem();
    const doneTopics = flat.filter((t) => isDone(t.id)).length;
    const testsPassed = weeks.filter((w) => testState(w.id).passed).length;
    const spent = S.time.total, budget = BUDGET_MIN * 60;
    const rd = readiness();
    let curSess = sessions.findIndex((s) => s.some((it) => !itemDone(it))); if (curSess < 0) curSess = 8;
    const nxLabel = nx ? (nx.kind === "topic" ? topicById[nx.id].title : nx.label) : "All plan items done — sit the mocks";
    const lastBtn = S.last && S.last.name !== "home" ? `<button class="btn ghost" id="resume">Resume where you stopped</button>` : "";
    main.innerHTML = `
      <div class="page wide">
        <section class="hero">
          <div class="card hero-main">
            <span class="eyebrow">NPTEL · IISc Bangalore · 12-week course in 16 hours</span>
            <h1>Fundamentals of Generative AI &amp; Large Language Models</h1>
            <p>Every lecture in the playlist, in teaching order, condensed into ${flat.length} short topics. Each topic opens with a puzzle, teaches the idea with interactive models, and ends with a quiz that tells you exactly what to fix. Every week ends with a section test, and three full mock exams wait at the finish line.</p>
            <div class="callout acc"><span class="eyebrow">Up next</span><div style="font:600 1.08rem var(--f-display);margin-top:4px">${nxLabel}</div>
              ${nx ? `<div class="small muted">${nx.kind === "topic" ? `Week ${nx.wk} · planned ${nx.min} min` : nx.kind === "test" ? `${weekById[nx.id].test.length} questions · pass mark 70%` : "30 min"}</div>` : ""}</div>
            <div class="row">${nx ? `<button class="btn" id="go-next">${nx.kind === "test" ? "Start section test" : nx.kind === "rev" ? "Open formula sheet" : "Start topic"}</button>` : `<button class="btn" data-nav="mocks">Go to mock exams</button>`}${lastBtn}</div>
          </div>
          <div class="card hourglass">
            <span class="eyebrow">Study clock</span>
            <div class="big-time num">${fmtHM(spent)}<small> of 16:00 h</small></div>
            <div class="bar ${spent >= budget ? "good" : ""}"><i style="width:${Math.min(100, (spent / budget) * 100)}%"></i></div>
            <div class="grid2" style="gap:10px">
              <div class="kpi"><b class="num">${doneTopics}/${flat.length}</b><span>topics mastered</span></div>
              <div class="kpi"><b class="num">${testsPassed}/${weeks.length}</b><span>section tests passed</span></div>
              <div class="kpi"><b class="num">${fmtHM(S.time.day[today()] || 0)}</b><span>studied today</span></div>
              <div class="kpi"><b class="num">${rd == null ? "—" : pct(rd) + "%"}</b><span>exam readiness</span></div>
            </div>
            <p class="small muted">Pace check: planned ${Math.round((planItems.filter(itemDone).reduce((s, x) => s + x.min, 0)) / 60 * 10) / 10} h of work is done; you have used ${Math.round(spent / 360) / 10} h.</p>
          </div>
        </section>

        <section class="card">
          <div class="row" style="justify-content:space-between"><div><span class="eyebrow">The 16-hour plan</span><h2 style="margin-top:4px">Eight 2-hour sessions</h2></div>
          <span class="chip">${Math.round(plannedTotal / 6) / 10} h planned · mocks are extra</span></div>
          <p class="muted small" style="margin-top:6px">Sit one session per sitting. A session is done when every topic in it has a passed quiz. Take a 5-minute break between topics.</p>
          <div class="sessions" style="margin-top:14px">
            ${sessions.map((s, i) => {
              const d = s.every(itemDone); const tops = s.filter((x) => x.kind === "topic");
              const wks = [...new Set(s.map((x) => x.wk))].filter((x) => x <= 12);
              return `<div class="sess ${i === curSess ? "cur" : ""} ${d ? "done" : ""}">
                <span class="eyebrow"><span>Session ${i + 1}</span><span>${d ? "✓ done" : i === curSess ? "now" : ""}</span></span>
                <b style="font-family:var(--f-display)">${wks.length ? "Week " + wks.join(", ") : "Revision"}</b>
                <p class="muted">${tops.slice(0, 3).map((x) => esc(strip(x.label))).join(" · ")}${tops.length > 3 ? ` +${tops.length - 3} more` : ""}${s.some((x) => x.kind === "rev") ? " · Final revision" : ""}</p>
              </div>`; }).join("")}
          </div>
        </section>

        <section>
          <div class="row" style="justify-content:space-between;margin-bottom:12px"><h2>Course map</h2><span class="small muted">Planned minutes · your minutes · status</span></div>
          <div class="weeks">
            ${weeks.map((w) => { const ts = testState(w.id); const p = weekProgress(w);
              return `<button class="wcard" data-week="${w.id}">
                <div class="meta"><span class="eyebrow">Week ${w.n}</span>${ring(p, 26)}</div>
                <h3>${w.title}</h3>
                <span class="small muted">${w.tagline}</span>
                <div class="meta"><span class="chip num">${w.planMin} min plan · ${Math.round(weekSec(w) / 60)} used</span>
                ${ts.best != null ? `<span class="chip ${ts.passed ? "good" : "bad"}">test ${pct(ts.best)}%</span>` : `<span class="chip">${w.topics.filter((t) => isDone(t.id)).length}/${w.topics.length} topics</span>`}</div>
              </button>`; }).join("")}
          </div>
        </section>

        <section class="grid2">
          <div class="card"><span class="eyebrow">Daily study minutes · last 14 days</span><div style="margin-top:10px">${dailyChart()}</div></div>
          <div class="card"><span class="eyebrow">Time by week · plan vs actual</span><div style="margin-top:10px">${weekChart()}</div></div>
        </section>
      </div>`;
    const ng = $("#go-next", main);
    if (ng) ng.onclick = () => { if (nx.kind === "topic") go("topic", nx.id); else if (nx.kind === "test") go("test", nx.id); else go("formulas"); };
    const rs = $("#resume", main); if (rs) rs.onclick = () => go(S.last.name, S.last.arg);
    $$("[data-week]", main).forEach((b) => (b.onclick = () => go("week", b.dataset.week)));
    $$("[data-nav]", main).forEach((b) => (b.onclick = () => go(b.dataset.nav)));
  }

  function dailyChart() {
    const days = []; const d0 = new Date();
    for (let i = 13; i >= 0; i--) { const d = new Date(d0); d.setDate(d0.getDate() - i); const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; days.push([k, Math.round((S.time.day[k] || 0) / 60), d]); }
    const max = Math.max(60, ...days.map((x) => x[1])); const top = Math.ceil(max / 30) * 30;
    const W = 420, H = 170, L = 34, B = 24, bw = (W - L - 6) / 14;
    const y = (v) => H - B - (v / top) * (H - B - 10);
    let g = "";
    for (let v = 0; v <= top; v += top / 3) g += `<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)" stroke-dasharray="${v ? "3 4" : ""}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${Math.round(v)}</text>`;
    g += `<line x1="${L}" x2="${W}" y1="${y(120)}" y2="${y(120)}" stroke="var(--hi)" stroke-width="1.5"/><text x="${W - 2}" y="${y(120) - 4}" text-anchor="end">2 h session</text>`;
    days.forEach(([k, m, d], i) => {
      const x = L + 3 + i * bw; const hgt = H - B - y(m);
      g += `<rect x="${x + 2}" y="${y(m)}" width="${bw - 4}" height="${Math.max(0, hgt)}" rx="3" fill="${k === today() ? "var(--accent)" : "color-mix(in srgb, var(--accent) 45%, var(--sheet))"}"><title>${k}: ${m} min</title></rect>`;
      if (i % 2 === 1 || i === 13) g += `<text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${d.getDate()}</text>`;
    });
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Minutes studied per day">${g}</svg>`;
  }
  function weekChart() {
    const W = 420, rowH = 19, H = weeks.length * rowH + 26, L = 34;
    const max = Math.max(...weeks.map((w) => Math.max(w.planMin, weekSec(w) / 60)));
    const x = (v) => L + (v / max) * (W - L - 40);
    let g = "";
    weeks.forEach((w, i) => {
      const yy = 6 + i * rowH; const act = weekSec(w) / 60;
      g += `<text x="${L - 6}" y="${yy + 11}" text-anchor="end">W${w.n}</text>`;
      g += `<rect x="${L}" y="${yy + 2}" width="${x(w.planMin) - L}" height="12" rx="3" fill="var(--sheet-2)" stroke="var(--rule)"/>`;
      g += `<rect x="${L}" y="${yy + 5}" width="${Math.max(0, x(act) - L)}" height="6" rx="3" fill="${act > w.planMin * 1.25 ? "var(--warn)" : "var(--accent)"}"/>`;
      g += `<text x="${Math.max(x(w.planMin), x(act)) + 4}" y="${yy + 11}">${Math.round(act)}/${w.planMin}</text>`;
    });
    g += `<text x="${L}" y="${H - 4}">outline = plan · bar = you · amber = 25% over</text>`;
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Minutes per week, planned versus actual">${g}</svg>`;
  }

  /* ---------- week overview ---------- */
  function viewWeek(main, wid) {
    const w = weekById[wid]; const ts = testState(w.id);
    const allDone = w.topics.every((t) => isDone(t.id));
    main.innerHTML = `
      <div class="page">
        <div class="crumbs"><button data-nav="home">Dashboard</button><span>›</span><span>Week ${w.n}</span></div>
        <div class="topic-head"><span class="eyebrow">Week ${w.n} of ${weeks.length - 1} · ${w.planMin} min planned · ${Math.round(weekSec(w) / 60)} min used</span><h1>${w.title}</h1><p class="muted" style="max-width:65ch">${w.intro || w.tagline}</p></div>
        <div class="lesson">
          ${w.topics.map((t, i) => { const st = tState(t.id);
            return `<div class="lcard"><div class="row" style="justify-content:space-between">
              <div style="min-width:0;flex:1"><span class="eyebrow">Topic ${i + 1} · ${t.lec.length ? `Lec ${t.lec.join(", ")}` : "Maths primer"} · ${t.min} min</span><h3 style="margin-top:4px">${t.title}</h3><p class="small muted" style="margin-top:4px">${strip(t.hook)}</p></div>
              <div class="row">${st.best != null ? `<span class="chip ${st.passed ? "good" : "bad"}">quiz ${pct(st.best)}%</span>` : ""}<button class="btn ${isDone(t.id) ? "quiet" : ""} small" data-topic="${t.id}">${isDone(t.id) ? "Review" : st.read ? "Continue" : "Start"}</button></div>
            </div></div>`; }).join("")}
          <div class="lcard" style="border-color:var(--accent)"><div class="row" style="justify-content:space-between">
            <div style="flex:1;min-width:0"><span class="eyebrow">Section test · ${w.test.length} questions · pass 70%</span><h3 style="margin-top:4px">Week ${w.n} section test</h3>
            <p class="small muted" style="margin-top:4px">${allDone ? "All topics mastered. Test yourself under exam conditions." : "Recommended after all topic quizzes are passed. You can still attempt it now."}</p></div>
            <div class="row">${ts.best != null ? `<span class="chip ${ts.passed ? "good" : "bad"}">best ${pct(ts.best)}%</span>` : ""}<button class="btn small" data-test="${w.id}">${ts.attempts ? "Retake test" : "Start test"}</button></div>
          </div></div>
        </div>
      </div>`;
    $$("[data-topic]", main).forEach((b) => (b.onclick = () => go("topic", b.dataset.topic)));
    $$("[data-test]", main).forEach((b) => (b.onclick = () => go("test", b.dataset.test)));
    $$("[data-nav]", main).forEach((b) => (b.onclick = () => go(b.dataset.nav)));
  }

  /* ---------- topic page ---------- */
  function lecList(nums) {
    return `<div class="lecs">${nums.map((n) => { const L = LECT[n]; return L ? `<a class="lec" href="${ytLink(n)}" target="_blank" rel="noopener"><b>Lec ${String(n).padStart(2, "0")}</b><span>${L[1]}</span><i>${L[2]} min ${icon.play2}</i></a>` : ""; }).join("")}</div>`;
  }
  function viewTopic(main, tid, opts) {
    const t = topicById[tid]; const w = t.week; const st = tState(tid);
    const nTop = w.topics.length;
    main.innerHTML = `
      <div class="page">
        <div class="crumbs"><button data-nav="home">Dashboard</button><span>›</span><button data-week="${w.id}">Week ${w.n}: ${w.title}</button><span>›</span><span>Topic ${t.idx + 1}</span></div>
        <header class="topic-head">
          <span class="eyebrow">Week ${w.n} · Topic ${t.idx + 1} of ${nTop}</span>
          <h1>${t.title}</h1>
          <div class="topic-meta">
            <span class="chip acc">Planned ${t.min} min</span>
            <span class="chip num" id="tspent">You: ${fmtMin(topicSec(tid))}</span>
            ${t.lec.length ? `<span class="chip">Lec ${t.lec.join(", ")}</span>` : `<span class="chip">Maths primer · no lecture</span>`}
            ${st.best != null ? `<span class="chip ${st.passed ? "good" : "bad"}">Quiz best ${pct(st.best)}%</span>` : ""}
          </div>
        </header>
        <section class="hook">
          <span class="eyebrow">Puzzle before the lesson</span>
          <div class="hook-q">${t.hook}</div>
          <div class="row" style="margin-top:12px"><button class="btn small" id="reveal">I have a guess — reveal</button><span class="small muted">Commit to an answer first. A guess, even a wrong one, makes the lesson stick.</span></div>
          <div class="hook-a" id="hook-a" hidden>${t.reveal}</div>
        </section>
        <div class="lesson" id="lesson">
          ${t.cards.map((c, i) => `
            <article class="lcard" id="card-${i}">
              <div class="lcard-h"><span class="lcard-n">${String(i + 1).padStart(2, "0")}</span><h2 style="font-size:1.25rem">${c.h}</h2></div>
              <div class="prose">${c.b}</div>
              ${c.f ? figHTML(c.f) : ""}
              ${c.w ? `<div class="widget-slot" data-w="${c.w}"></div>` : ""}
              ${c.ask ? askHTML(c.ask, i) : ""}
            </article>`).join("")}
        </div>
        <section class="keys">
          <div class="card flat"><span class="eyebrow">Remember for the exam</span><ul style="margin-top:10px">${t.keys.map((k) => `<li>${k}</li>`).join("")}</ul></div>
          <div class="card flat" style="background:var(--warn-soft);border-color:transparent"><span class="eyebrow" style="color:var(--warn)">Traps examiners like</span><ul style="margin-top:10px">${t.traps.map((k) => `<li>${k}</li>`).join("")}</ul></div>
        </section>
        ${t.lec.length ? `<section class="card flat">
          <div class="row" style="justify-content:space-between"><div><span class="eyebrow">Source lectures</span><h3 style="margin-top:4px">Watch these if a card did not click</h3></div></div>
          <p class="small muted" style="margin:6px 0 12px">Video time is outside this page, so log it here and it counts toward your 16 hours.</p>
          ${lecList(t.lec)}
          <div class="row" style="margin-top:12px"><span class="small muted">I watched video for</span>${[5, 10, 20, 30].map((m) => `<button class="btn quiet small" data-log="${m}">+${m} min</button>`).join("")}</div>
        </section>` : ""}
        <div class="next-bar card">
          <div><span class="eyebrow">Checkpoint</span><div style="font:600 1.05rem var(--f-display)">Topic quiz · ${t.quiz.length} questions · pass ${pct(TOPIC_PASS)}%</div><div class="small muted">Wrong answers send you back to the exact card and lecture.</div></div>
          <button class="btn" id="to-quiz">${st.attempts ? "Retake quiz" : "Take the quiz"}</button>
        </div>
      </div>`;
    $("#reveal").onclick = (e) => { $("#hook-a").hidden = false; e.target.hidden = true; e.target.nextElementSibling.hidden = true; };
    if (window.renderMath) window.renderMath(main);
    linkTerms($$(".hook, .lcard .prose, .keys", main));
    $$(".widget-slot", main).forEach((slot) => { const f = WIDGETS[slot.dataset.w]; if (f) { try { f(slot); } catch (err) { slot.innerHTML = `<p class="small muted">Interactive model failed to load.</p>`; console.error(err); } } });
    $$(".ask", main).forEach(wireAsk);
    $$("[data-log]", main).forEach((b) => (b.onclick = () => { addTime("video:" + tid, +b.dataset.log * 60, true); save(); $("#tspent").textContent = "You: " + fmtMin(topicSec(tid)); toast(`Logged ${b.dataset.log} min of lecture video`); }));
    $("#to-quiz").onclick = () => { S.topics[tid] = Object.assign(tState(tid), { read: true }); go("quiz", tid); };
    $$("[data-nav]", main).forEach((b) => (b.onclick = () => go(b.dataset.nav)));
    $$("[data-week]", main).forEach((b) => (b.onclick = () => go("week", b.dataset.week)));
    if (!st.read) { S.topics[tid] = Object.assign(tState(tid), { opened: true }); }
    if (opts && opts.card != null) {
      const c = $("#card-" + opts.card);
      if (c) setTimeout(() => { c.scrollIntoView({ behavior: "smooth", block: "start" }); c.classList.add("flash"); }, 60);
    }
  }
  function askHTML(a, i) {
    return `<div class="ask" data-a="${a.a}"><span class="eyebrow" style="color:var(--accent)">Quick check</span><div>${a.q}</div>
      <div class="opts">${a.o.map((o, j) => `<button data-j="${j}">${o}</button>`).join("")}</div><div class="small" hidden>${a.x}</div></div>`;
  }
  function wireAsk(box) {
    const a = +box.dataset.a;
    $$(".opts button", box).forEach((b) => (b.onclick = () => {
      $$(".opts button", box).forEach((x) => (x.disabled = true));
      $$(".opts button", box)[a].classList.add("right");
      if (+b.dataset.j !== a) b.classList.add("wrong");
      const x = box.lastElementChild; x.hidden = false;
      x.innerHTML = `<b>${+b.dataset.j === a ? "Right." : "Not quite."}</b> ${x.innerHTML.replace(/^<b>.*?<\/b> /, "")}`;
    }));
  }

  /* ---------- figures ---------- */
  function figHTML(f) {
    const [name, cap] = Array.isArray(f) ? f : [f, ""];
    const fn = (window.FIGS || {})[name];
    if (!fn) return "";
    return `<figure class="fig">${fn()}${cap ? `<figcaption>${cap}</figcaption>` : ""}</figure>`;
  }

  /* ---------- glossary: tap a dotted word for a plain-English meaning ---------- */
  const GLOSS = (COURSE.glossary || []).map(([term, def, alias]) => ({ term, def, names: [term].concat(alias || []) }));
  const glossByName = {};
  GLOSS.forEach((g) => g.names.forEach((n) => (glossByName[n.toLowerCase()] = g)));
  const glossRE = GLOSS.length ? new RegExp("\\b(" + Object.keys(glossByName).sort((a, b) => b.length - a.length).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")\\b", "i") : null;
  const NOLINK = /^(A|BUTTON|CODE|H1|H2|H3|H4|SVG|TEXT|TH|LABEL|OUTPUT)$/i;
  function linkTerms(roots) {
    if (!glossRE) return;
    const seen = new Set();
    roots.forEach((root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      const nodes = []; for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n);
      nodes.forEach((n) => {
        for (let p = n.parentNode; p && p !== root; p = p.parentNode) if (NOLINK.test(p.nodeName) || (p.classList && (p.classList.contains("katex") || p.classList.contains("term") || p.classList.contains("widget-slot") || p.classList.contains("fig")))) return;
        let node = n;
        for (let guard = 0; node && guard < 20; guard++) {
          const m = glossRE.exec(node.nodeValue); if (!m) break;
          const g = glossByName[m[1].toLowerCase()];
          if (seen.has(g.term)) { const rest = node.splitText(m.index + m[1].length); node = rest; continue; }
          seen.add(g.term);
          const mid = node.splitText(m.index); const rest = mid.splitText(m[1].length);
          const b = document.createElement("button"); b.type = "button"; b.className = "term"; b.dataset.g = g.term; b.textContent = mid.nodeValue;
          mid.parentNode.replaceChild(b, mid); node = rest;
        }
      });
    });
  }
  function showTerm(btn) {
    hideTerm();
    const g = glossByName[btn.dataset.g.toLowerCase()]; if (!g) return;
    const pop = document.createElement("div"); pop.className = "termpop"; pop.setAttribute("role", "dialog");
    pop.innerHTML = `<b>${g.term}</b><div>${g.def}</div><button class="btn quiet small" data-nav-gloss>All words in the word bank</button>`;
    document.body.appendChild(pop);
    const r = btn.getBoundingClientRect(); const w = Math.min(340, innerWidth - 24);
    pop.style.width = w + "px";
    pop.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2)) + "px";
    const below = r.bottom + 8 + pop.offsetHeight < innerHeight;
    pop.style.top = (below ? r.bottom + 8 : Math.max(8, r.top - 8 - pop.offsetHeight)) + scrollY + "px";
    pop.querySelector("[data-nav-gloss]").onclick = () => { hideTerm(); go("glossary"); };
  }
  function hideTerm() { $$(".termpop").forEach((x) => x.remove()); }
  document.addEventListener("click", (e) => { const t = e.target.closest(".term"); if (t) { e.preventDefault(); showTerm(t); } else if (!e.target.closest(".termpop")) hideTerm(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hideTerm(); });

  /* ---------- question preparation & grading ---------- */
  const NOSHUF = /(all of the above|none of the above|both|neither|all the above|only)\b/i;
  function prep(q, seed) {
    const type = Array.isArray(q.a) ? "msq" : typeof q.a === "object" ? "nat" : "mcq";
    let opts = q.o ? q.o.map((o, i) => ({ o, i })) : null;
    if (opts && !q.o.some((o) => NOSHUF.test(strip(o))) && !q.fixed) opts = shuffle(opts, seed);
    return { src: q, id: q.id, type, opts, ans: null };
  }
  function correct(p, ans) {
    const q = p.src;
    if (p.type === "nat") { const v = parseFloat(ans); if (isNaN(v)) return false; const tol = q.a.tol != null ? q.a.tol : Math.max(0.01, Math.abs(q.a.n) * 0.01); return Math.abs(v - q.a.n) <= tol + 1e-9; }
    if (p.type === "msq") { const s = new Set(ans || []); return q.a.length === s.size && q.a.every((x) => s.has(x)); }
    return ans === q.a;
  }
  function answerText(q) {
    if (Array.isArray(q.a)) return q.a.map((i) => q.o[i]).join(" + ");
    if (typeof q.a === "object") return String(q.a.n);
    return q.o[q.a];
  }
  function recordMistake(id, ok) {
    if (!ok) { const m = S.mistakes[id] || { n: 0 }; m.n++; m.t = Date.now(); m.fixed = false; S.mistakes[id] = m; }
    else if (S.mistakes[id]) S.mistakes[id].fixed = true;
  }
  function optsHTML(p, chosen, reveal) {
    if (p.type === "nat") {
      return `<div class="natbox"><input type="text" inputmode="decimal" id="nat-${p.id.replace(/\W/g, "")}" class="tinput" placeholder="Type a number" value="${chosen != null ? esc(chosen) : ""}" ${reveal ? "disabled" : ""} aria-label="Numerical answer"><span class="small muted">Numerical answer type${p.src.a.tol != null ? ` · tolerance ±${p.src.a.tol}` : ""}</span></div>`;
    }
    const multi = p.type === "msq";
    return `<div class="opts" role="${multi ? "group" : "radiogroup"}">${p.opts.map(({ o, i }, k) => {
      const sel = multi ? (chosen || []).includes(i) : chosen === i;
      let cls = sel ? "sel" : "";
      if (reveal) {
        const isAns = multi ? p.src.a.includes(i) : p.src.a === i;
        cls = isAns && sel ? "right" : sel ? "wrong" : isAns ? "missed right" : "";
      }
      return `<button class="opt ${multi ? "multi" : ""} ${cls}" data-i="${i}" ${reveal ? "disabled" : ""} role="${multi ? "checkbox" : "radio"}" aria-checked="${sel}"><span class="key">${"ABCDEFGH"[k]}</span><span>${o}</span></button>`;
    }).join("")}</div>`;
  }
  const typeLabel = (p) => (p.type === "msq" ? "Multiple select — one or more correct" : p.type === "nat" ? "Numerical answer" : "Single correct");

  function remedyFor(q) {
    const t = topicById[q.t]; if (!t) return "";
    const card = q.r != null ? t.cards[q.r] : null;
    const lecs = q.l ? [].concat(q.l) : t.lec;
    return `<div class="row">
      <button class="btn quiet small" data-jump="${t.id}" data-card="${q.r != null ? q.r : ""}">Re-read: ${card ? strip(card.h) : t.title}</button>
      ${lecs.slice(0, 2).map((n) => `<a class="btn ghost small" href="${ytLink(n)}" target="_blank" rel="noopener">${icon.play2} Lec ${n}</a>`).join("")}
    </div>`;
  }
  function wireJumps(root) {
    $$("[data-jump]", root).forEach((b) => (b.onclick = () => go("topic", b.dataset.jump, { card: b.dataset.card === "" ? null : +b.dataset.card })));
  }

  /* ---------- practice quiz (topic quiz, mistake drill) ---------- */
  function practice(main, { title, eyebrow, qs, onDone, back }) {
    const seed = Date.now() % 1e9;
    const P = shuffle(qs, seed).map((q, i) => prep(q, seed + i));
    let i = 0; const answers = []; const results = [];
    function draw() {
      const p = P[i]; const done = results[i] != null;
      main.innerHTML = `
        <div class="page">
          <div class="crumbs">${back}</div>
          <div class="quiz card">
            <div class="qhead"><div><span class="eyebrow">${eyebrow}</span><h2 style="margin-top:4px">${title}</h2></div>
              <div class="qdots" aria-hidden="true">${P.map((_, k) => `<i class="${k === i ? "cur" : results[k] === true ? "ok" : results[k] === false ? "no" : ""}"></i>`).join("")}</div></div>
            <div><span class="qtype">Question ${i + 1} of ${P.length} · ${typeLabel(p)}</span><div class="qtext" style="margin-top:6px">${p.src.q}</div></div>
            ${optsHTML(p, answers[i], done)}
            ${done ? explainHTML(p, results[i]) : ""}
            <div class="row" style="justify-content:flex-end">
              ${done ? `<button class="btn" id="next">${i === P.length - 1 ? "See my result" : "Next question"}</button>` : `<button class="btn" id="check" ${answers[i] == null || (Array.isArray(answers[i]) && !answers[i].length) ? "disabled" : ""}>Check answer</button>`}
            </div>
          </div>
        </div>`;
      wireBack(main);
      if (!done) wireOpts(main, p, (v) => { answers[i] = v; const c = $("#check"); if (c) c.disabled = v == null || v === "" || (Array.isArray(v) && !v.length); });
      const c = $("#check"); if (c) c.onclick = () => { const ok = correct(p, answers[i]); results[i] = ok; recordMistake(p.id, ok); save(); draw(); };
      const n = $("#next"); if (n) n.onclick = () => { if (i < P.length - 1) { i++; draw(); scrollTo(0, 0); } else finish(); };
      wireJumps(main);
    }
    function finish() {
      const score = results.filter(Boolean).length / P.length;
      onDone(score, P, results, answers);
    }
    draw();
  }
  function explainHTML(p, ok) {
    return `<div class="explain ${ok ? "good" : "bad"}"><b class="v">${ok ? "Correct." : "Not this time."}</b>
      ${ok ? "" : `<div><b>Answer:</b> ${answerText(p.src)}</div>`}<div>${p.src.x || ""}</div>${ok ? "" : `<div class="small"><b>Fix it:</b></div>${remedyFor(p.src)}`}</div>`;
  }
  function wireOpts(root, p, onChange) {
    if (p.type === "nat") { const inp = $(".natbox input", root); inp.oninput = () => onChange(inp.value.trim() === "" ? null : inp.value.trim()); inp.focus(); return; }
    const multi = p.type === "msq";
    let cur = multi ? [] : null;
    $$(".opt", root).forEach((b) => {
      if (b.classList.contains("sel")) { const i = +b.dataset.i; if (multi) cur.push(i); else cur = i; }
      b.onclick = () => {
        const i = +b.dataset.i;
        if (multi) { cur = cur.includes(i) ? cur.filter((x) => x !== i) : cur.concat(i); b.classList.toggle("sel"); b.setAttribute("aria-checked", b.classList.contains("sel")); }
        else { cur = i; $$(".opt", root).forEach((x) => { x.classList.toggle("sel", x === b); x.setAttribute("aria-checked", x === b); }); }
        onChange(multi ? cur.slice() : cur);
      };
    });
  }
  function wireBack(root) {
    $$("[data-nav]", root).forEach((b) => (b.onclick = () => go(b.dataset.nav)));
    $$("[data-week]", root).forEach((b) => (b.onclick = () => go("week", b.dataset.week)));
    $$("[data-topicnav]", root).forEach((b) => (b.onclick = () => go("topic", b.dataset.topicnav)));
  }
  function scoreRing(frac, label) {
    const r = 58, c = 2 * Math.PI * r; const col = frac >= 0.8 ? "var(--good)" : frac >= 0.6 ? "var(--warn)" : "var(--bad)";
    return `<svg class="score-ring" viewBox="0 0 140 140" role="img" aria-label="Score ${pct(frac)} percent"><circle cx="70" cy="70" r="${r}" fill="none" stroke="var(--rule)" stroke-width="12"/><circle cx="70" cy="70" r="${r}" fill="none" stroke="${col}" stroke-width="12" stroke-dasharray="${c * frac} ${c}" transform="rotate(-90 70 70)" stroke-linecap="round"/><text x="70" y="74" text-anchor="middle">${pct(frac)}%</text><text class="sub" x="70" y="94" text-anchor="middle">${label}</text></svg>`;
  }

  function viewQuiz(main, tid) {
    const t = topicById[tid]; const w = t.week;
    practice(main, {
      title: t.title, eyebrow: `Week ${w.n} · Topic quiz`, qs: t.quiz,
      back: `<button data-nav="home">Dashboard</button><span>›</span><button data-week="${w.id}">Week ${w.n}</button><span>›</span><button data-topicnav="${t.id}">${t.title}</button><span>›</span><span>Quiz</span>`,
      onDone(score, P, results) {
        const st = tState(tid); st.read = true; st.attempts = (st.attempts || 0) + 1; st.last = score; st.best = Math.max(st.best || 0, score);
        if (score >= TOPIC_PASS) st.passed = true; S.topics[tid] = st; save();
        const pass = score >= TOPIC_PASS;
        const wrong = P.filter((_, k) => !results[k]);
        const nextT = w.topics[t.idx + 1];
        const nxt = nextT ? `<button class="btn" data-topicnav="${nextT.id}">Next topic: ${nextT.title}</button>` : `<button class="btn" id="to-test">Take the Week ${w.n} section test</button>`;
        const cards = [...new Set(wrong.map((p) => p.src.r).filter((r) => r != null))];
        main.innerHTML = `
          <div class="page">
            <div class="crumbs"><button data-nav="home">Dashboard</button><span>›</span><button data-week="${w.id}">Week ${w.n}</button><span>›</span><span>Quiz result</span></div>
            <div class="card result-head">${scoreRing(score, `${results.filter(Boolean).length} of ${P.length}`)}
              <div><span class="eyebrow">${t.title}</span>
                <h2>${pass ? (score === 1 ? "Clean sweep. Topic mastered." : "Passed. Topic mastered.") : "Not yet. Here is the repair plan."}</h2>
                <p class="muted">${pass ? (wrong.length ? "One slip below. Read its fix once, then move on. You don't need to retake." : "Move on while the momentum is high.") : `You need ${pct(TOPIC_PASS)}% to pass. Spend about ${Math.max(4, cards.length * 3)} minutes on the cards below, then retake: the questions and options are reshuffled.`}</p>
                <div class="row">${pass ? nxt : `<button class="btn" id="retake">Retake quiz</button><button class="btn ghost" data-topicnav="${t.id}">Back to the lesson</button>`}</div>
              </div></div>
            ${wrong.length ? `<section class="card"><span class="eyebrow">What went wrong and how to fix it</span><div class="fixlist" style="margin-top:12px">
              ${wrong.map((p) => `<div class="fixitem"><div><b>${p.src.q}</b></div>
                <div class="small"><b>Correct answer:</b> ${answerText(p.src)}</div><div class="small muted">${p.src.x || ""}</div>${remedyFor(p.src)}</div>`).join("")}
            </div>
            ${!pass ? `<div class="callout warn" style="margin-top:14px"><b>Study tactic:</b> close this page, explain each missed idea out loud in two sentences, then retake. If you fail twice, watch the linked lecture segment at 1.5× speed and log the time on the topic page.</div>` : ""}
            </section>` : ""}
          </div>`;
        wireBack(main); wireJumps(main);
        const r = $("#retake"); if (r) r.onclick = () => viewQuiz(main, tid);
        const tt = $("#to-test"); if (tt) tt.onclick = () => go("test", w.id);
        renderRail();
      }
    });
  }

  /* ---------- exam mode (section tests + mocks) ---------- */
  function examRun(main, { title, eyebrow, qs, minutes, back, onSubmit, mode }) {
    const seed = Date.now() % 1e9;
    const P = qs.map((q, i) => prep(q, seed + i));
    EXAM = { P, ans: P.map(() => null), mark: P.map(() => false), i: 0, end: minutes ? Date.now() + minutes * 60000 : null, start: Date.now(), live: true, onSubmit, mode };
    function draw() {
      const E = EXAM; const p = E.P[E.i];
      main.innerHTML = `
        <div class="page wide">
          <div class="crumbs">${back}</div>
          <div class="callout warn" id="leave-box" hidden><b>Leave this exam?</b> Your answers are not saved if you leave. <div class="row" style="margin-top:8px"><button class="btn small" id="leave-yes">Leave without submitting</button><button class="btn quiet small" id="leave-no">Stay</button></div></div>
          <div class="exam">
            <div class="card quiz">
              <div class="qhead"><div><span class="eyebrow">${eyebrow}</span><h2 style="margin-top:4px">${title}</h2></div></div>
              <div><span class="qtype">Question ${E.i + 1} of ${E.P.length} · ${typeLabel(p)}</span><div class="qtext" style="margin-top:6px">${p.src.q}</div></div>
              ${optsHTML(p, E.ans[E.i], false)}
              <div class="row" style="justify-content:space-between">
                <div class="row"><button class="btn quiet small" id="prev" ${E.i === 0 ? "disabled" : ""}>← Previous</button><button class="btn quiet small" id="clear">Clear response</button></div>
                <div class="row"><button class="btn ghost small" id="mark">${E.mark[E.i] ? "Unmark" : "Mark for review"}</button><button class="btn small" id="nextq">${E.i === E.P.length - 1 ? "Save" : "Save &amp; next →"}</button></div>
              </div>
            </div>
            <aside class="card palette">
              <div><span class="eyebrow">${E.end ? "Time left" : "Time taken"}</span><div class="timer" id="exam-timer">--:--</div></div>
              <div class="pal-grid">${E.P.map((_, k) => `<button class="${E.ans[k] != null && !(Array.isArray(E.ans[k]) && !E.ans[k].length) ? "ans" : ""} ${E.mark[k] ? "mark" : ""} ${k === E.i ? "cur" : ""}" data-k="${k}" aria-label="Question ${k + 1}">${k + 1}</button>`).join("")}</div>
              <div class="legend"><span><i style="background:var(--good);height:10px;width:10px"></i>answered</span><span><i style="background:var(--warn);height:10px;width:10px"></i>marked</span></div>
              <div class="small muted">${answeredCount()} of ${E.P.length} answered</div>
              <button class="btn" id="submit">Submit</button>
              <div class="callout warn confirm" id="confirm" hidden><b>Submit now?</b><div class="small">${E.P.length - answeredCount()} unanswered. NPTEL exams have no negative marking, so guess before submitting.</div><div class="row" style="margin-top:8px"><button class="btn small" id="sub-yes">Submit</button><button class="btn quiet small" id="sub-no">Keep going</button></div></div>
            </aside>
          </div>
        </div>`;
      wireOpts(main, p, (v) => { EXAM.ans[EXAM.i] = v; updatePal(); });
      $("#prev").onclick = () => { E.i--; draw(); };
      $("#nextq").onclick = () => { if (E.i < E.P.length - 1) { E.i++; draw(); } else toast("Saved. Review marked questions or submit."); };
      $("#clear").onclick = () => { E.ans[E.i] = null; draw(); };
      $("#mark").onclick = () => { E.mark[E.i] = !E.mark[E.i]; if (E.i < E.P.length - 1) E.i++; draw(); };
      $$(".pal-grid button", main).forEach((b) => (b.onclick = () => { E.i = +b.dataset.k; draw(); }));
      $("#submit").onclick = () => { $("#confirm").hidden = false; };
      $("#sub-no").onclick = () => { $("#confirm").hidden = true; };
      $("#sub-yes").onclick = submit;
      $("#leave-yes").onclick = () => { const b = $("#leave-box"); EXAM.live = false; go(b.dataset.name, b.dataset.arg || undefined, { force: true }); };
      $("#leave-no").onclick = () => { $("#leave-box").hidden = true; };
      wireBack(main);
      examTick();
    }
    function updatePal() {
      $$(".pal-grid button", main).forEach((b, k) => b.classList.toggle("ans", EXAM.ans[k] != null && !(Array.isArray(EXAM.ans[k]) && !EXAM.ans[k].length)));
      const s = $(".palette .small.muted"); if (s) s.textContent = `${answeredCount()} of ${EXAM.P.length} answered`;
    }
    function answeredCount() { return EXAM.ans.filter((a) => a != null && !(Array.isArray(a) && !a.length)).length; }
    function submit() {
      const E = EXAM; E.live = false;
      const res = E.P.map((p, k) => correct(p, E.ans[k]));
      res.forEach((ok, k) => recordMistake(E.P[k].id, ok));
      const score = res.filter(Boolean).length / E.P.length;
      const secs = Math.round((Date.now() - E.start) / 1000);
      EXAM = null; save();
      onSubmit(score, E.P, res, E.ans, secs);
    }
    EXAM.submit = submit;
    draw();
  }
  function examTick() {
    const el = $("#exam-timer"); if (!el || !EXAM) return;
    if (EXAM.end) {
      const left = Math.max(0, Math.round((EXAM.end - Date.now()) / 1000));
      el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
      el.classList.toggle("low", left < 300);
      if (left === 0 && EXAM.live) { toast("Time is up. Submitting."); EXAM.submit(); }
    } else {
      const s = Math.round((Date.now() - EXAM.start) / 1000);
      el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    }
  }

  function reviewList(P, res, ans) {
    return P.map((p, k) => `<div class="review-q">
      <div class="row" style="justify-content:space-between"><span class="qtype">Q${k + 1} · ${typeLabel(p)}${topicById[p.src.t] ? ` · W${topicById[p.src.t].week.n}: ${topicById[p.src.t].title}` : ""}</span><span class="chip ${res[k] ? "good" : "bad"}">${res[k] ? "correct" : ans[k] == null ? "skipped" : "wrong"}</span></div>
      <div>${p.src.q}</div>
      ${optsHTML(p, ans[k], true)}
      <div class="small muted">${p.src.x || ""}</div>
      ${res[k] ? "" : remedyFor(p.src)}
    </div>`).join("");
  }
  function breakdown(P, res, key) {
    const g = {};
    P.forEach((p, k) => { const t = topicById[p.src.t]; const id = t ? (key === "week" ? t.week.id : t.id) : "x"; (g[id] = g[id] || { n: 0, ok: 0 }); g[id].n++; if (res[k]) g[id].ok++; });
    return g;
  }

  function viewTest(main, wid) {
    const w = weekById[wid];
    examRun(main, {
      title: `Week ${w.n} section test`, eyebrow: `${w.title} · pass ${pct(TEST_PASS)}%`, qs: w.test, minutes: 0, mode: "test",
      back: `<button data-nav="home">Dashboard</button><span>›</span><button data-week="${w.id}">Week ${w.n}</button><span>›</span><span>Section test</span>`,
      onSubmit(score, P, res, ans, secs) {
        const ts = testState(wid); ts.attempts = (ts.attempts || 0) + 1; ts.last = score; ts.best = Math.max(ts.best || 0, score); if (score >= TEST_PASS) ts.passed = true; S.tests[wid] = ts; save();
        const g = breakdown(P, res, "topic");
        const weak = w.topics.filter((t) => g[t.id] && g[t.id].ok / g[t.id].n < 0.66);
        const pass = score >= TEST_PASS; const nw = weeks[w.n];
        main.innerHTML = `
          <div class="page">
            <div class="crumbs"><button data-nav="home">Dashboard</button><span>›</span><button data-week="${w.id}">Week ${w.n}</button><span>›</span><span>Section test result</span></div>
            <div class="card result-head">${scoreRing(score, `${res.filter(Boolean).length}/${P.length} · ${Math.round(secs / 60)} min`)}
              <div><span class="eyebrow">Week ${w.n} · ${w.title}</span><h2>${pass ? "Section cleared." : "Section not cleared yet."}</h2>
              <p class="muted">${pass ? (weak.length ? "Cleared, with one soft spot flagged below. Skim it in your final revision." : "Every topic held up under test conditions.") : "The topic breakdown shows where the marks leaked. Repair those topics first, then retake the test."}</p>
              <div class="row">${pass ? (nw ? `<button class="btn" data-week="${nw.id}">Start Week ${nw.n}: ${nw.title}</button>` : `<button class="btn" data-nav="mocks">Go to the final mocks</button>`) : `<button class="btn" id="retest">Retake test</button>`}</div></div></div>
            <section class="card"><span class="eyebrow">Topic breakdown</span>
              <div class="fixlist" style="margin-top:12px">${w.topics.map((t) => { const s = g[t.id]; if (!s) return ""; const f = s.ok / s.n;
                return `<div class="fixitem"><div class="row" style="justify-content:space-between"><b>${t.title}</b><span class="chip ${f >= 0.66 ? "good" : "bad"}">${s.ok}/${s.n}</span></div>
                <div class="bar ${f >= 0.66 ? "good" : ""}"><i style="width:${f * 100}%"></i></div>
                ${f < 0.66 ? `<div class="small"><b>Do this:</b> reopen the topic, re-read the cards linked under each missed question below, retake its topic quiz, then come back.</div><div class="row"><button class="btn quiet small" data-topicnav="${t.id}">Reopen topic</button>${t.lec.slice(0, 2).map((n) => `<a class="btn ghost small" href="${ytLink(n)}" target="_blank" rel="noopener">${icon.play2} Lec ${n}</a>`).join("")}</div>` : ""}</div>`; }).join("")}</div>
            </section>
            <section class="card"><span class="eyebrow">Answer review</span>${reviewList(P, res, ans)}</section>
          </div>`;
        wireBack(main); wireJumps(main); renderRail();
        const r = $("#retest"); if (r) r.onclick = () => viewTest(main, wid);
      }
    });
  }

  /* ---------- mocks ---------- */
  function viewMocks(main) {
    const best = (k) => (S.mocks[k] || {}).best;
    main.innerHTML = `
      <div class="page">
        <div class="topic-head"><span class="eyebrow">After the 16 hours</span><h1>Final mock exams</h1>
        <p class="muted" style="max-width:65ch">Three full-length mocks, ${MOCKS[0].length} questions each, drawn evenly from all 12 weeks and never shown anywhere else in the course. The interface copies the NPTEL exam screen: question palette, mark for review, single and multiple select, and numerical answers. These sit outside the 16-hour plan.</p></div>
        <div class="callout acc small"><b>How to use them:</b> take Mock 1 once all 12 section tests are cleared. Repair the weeks it flags, then take Mock 2 a day later and Mock 3 the evening before the exam. Aim for 75% or more, which is the silver-medal band.</div>
        <div class="grid3">${[1, 2, 3].map((k) => `
          <div class="card" style="display:flex;flex-direction:column;gap:10px">
            <span class="eyebrow">Mock ${k}</span><h3>${["Baseline", "Repair check", "Dress rehearsal"][k - 1]}</h3>
            <p class="small muted">${MOCKS[k - 1].length} questions · 75 minutes · scored out of 75 like the exam component</p>
            ${best(k) != null ? `<span class="chip ${best(k) >= 0.6 ? "good" : "bad"}">best ${pct(best(k))}% · ${Math.round(best(k) * 75)}/75</span>` : `<span class="chip">not attempted</span>`}
            <button class="btn" data-mock="${k}">${best(k) != null ? "Retake" : "Start"} Mock ${k}</button>
          </div>`).join("")}</div>
        <div class="card"><span class="eyebrow">Untimed drill</span><h3 style="margin-top:4px">20 random questions from every bank</h3><p class="small muted" style="margin:6px 0 12px">Good for a 10-minute warm-up before a session. Instant feedback after each question.</p><button class="btn ghost" id="drill">Start a drill</button></div>
      </div>`;
    $$("[data-mock]", main).forEach((b) => (b.onclick = () => go("mock", +b.dataset.mock)));
    $("#drill").onclick = () => go("drill");
  }
  function viewDrill(main) {
    const all = Object.values(QBANK);
    practice(main, { title: "Random drill", eyebrow: "Untimed practice", qs: shuffle(all).slice(0, 20), back: `<button data-nav="mocks">Mocks</button><span>›</span><span>Drill</span>`,
      onDone(score, P, res) { simpleResult(main, "Random drill", score, P, res, "mocks"); } });
  }
  function simpleResult(main, title, score, P, res, backTo) {
    main.innerHTML = `<div class="page"><div class="card result-head">${scoreRing(score, `${res.filter(Boolean).length}/${P.length}`)}<div><span class="eyebrow">${title}</span><h2>${score >= 0.8 ? "Strong." : score >= 0.6 ? "Decent, with gaps." : "Gaps to repair."}</h2><p class="muted">Missed questions were added to your mistake book.</p><div class="row"><button class="btn" data-nav="${backTo}">Back</button><button class="btn ghost" data-nav="mistakes">Open mistake book</button></div></div></div></div>`;
    wireBack(main);
  }
  function viewMock(main, k) {
    examRun(main, {
      title: `Mock exam ${k}`, eyebrow: `${MOCKS[k - 1].length} questions · 75 minutes`, qs: MOCKS[k - 1], minutes: 75, mode: "mock",
      back: `<button data-nav="mocks">Mocks</button><span>›</span><span>Mock ${k}</span>`,
      onSubmit(score, P, res, ans, secs) {
        const ms = S.mocks[k] || {}; ms.attempts = (ms.attempts || 0) + 1; ms.last = score; ms.best = Math.max(ms.best || 0, score); S.mocks[k] = ms; save();
        const g = breakdown(P, res, "week");
        const exam75 = Math.round(score * 75 * 10) / 10;
        main.innerHTML = `
          <div class="page">
            <div class="crumbs"><button data-nav="mocks">Mocks</button><span>›</span><span>Mock ${k} result</span></div>
            <div class="card result-head">${scoreRing(score, `${res.filter(Boolean).length}/${P.length} · ${Math.round(secs / 60)} min`)}
              <div><span class="eyebrow">Mock ${k}</span><h2>Exam component: ${exam75} / 75</h2>
                <div class="ctrl" style="max-width:340px"><label for="asg">My assignment score (out of 25) <output id="asg-o">20</output></label><input type="range" id="asg" min="0" max="25" step="0.5" value="20"></div>
                <div id="cert" class="callout"></div>
              </div></div>
            <section class="card"><span class="eyebrow">Week-by-week</span>
              <div class="fixlist" style="margin-top:12px">${weeks.map((w) => { const s = g[w.id]; if (!s) return ""; const f = s.ok / s.n;
                return `<div class="fixitem"><div class="row" style="justify-content:space-between"><b>W${w.n} · ${w.title}</b><span class="chip ${f >= 0.6 ? "good" : "bad"}">${s.ok}/${s.n}</span></div><div class="bar ${f >= 0.6 ? "good" : ""}"><i style="width:${f * 100}%"></i></div>
                ${f < 0.6 ? `<div class="row"><button class="btn quiet small" data-week="${w.id}">Revisit Week ${w.n}</button><button class="btn ghost small" data-test="${w.id}">Retake its section test</button></div>` : ""}</div>`; }).join("")}</div></section>
            <section class="card"><span class="eyebrow">Answer review</span>${reviewList(P, res, ans)}</section>
          </div>`;
        const upd = () => {
          const a = +$("#asg").value; $("#asg-o").textContent = a; const tot = a + exam75;
          const ok = a >= 10 && exam75 >= 30 && tot >= 40;
          const tier = !ok ? "No certificate" : tot >= 90 ? "Elite + Gold" : tot >= 75 ? "Elite + Silver" : tot >= 60 ? "Elite" : "Successfully completed";
          const c = $("#cert"); c.className = "callout " + (ok ? (tot >= 60 ? "good" : "warn") : "bad");
          c.innerHTML = `<b>Projected final score: ${Math.round(tot * 10) / 10} / 100 → ${tier}</b><div class="small">NPTEL needs assignment ≥ 10/25 and exam ≥ 30/75 and total ≥ 40. Bands: 60 Elite · 75 Silver · 90 Gold.</div>`;
        };
        $("#asg").oninput = upd; upd();
        wireBack(main); wireJumps(main);
        $$("[data-test]", main).forEach((b) => (b.onclick = () => go("test", b.dataset.test)));
      }
    });
  }

  /* ---------- mistake book ---------- */
  function viewMistakes(main) {
    const open = Object.entries(S.mistakes).filter(([id, m]) => !m.fixed && QBANK[id]).sort((a, b) => b[1].n - a[1].n);
    const fixed = Object.values(S.mistakes).filter((m) => m.fixed).length;
    main.innerHTML = `
      <div class="page">
        <div class="topic-head"><span class="eyebrow">Every question you have missed</span><h1>Mistake book</h1>
        <p class="muted">A question leaves this list once you answer it correctly. Clearing it is the highest-yield revision you can do.</p>
        <div class="row"><span class="chip bad">${open.length} open</span><span class="chip good">${fixed} fixed</span>${open.length ? `<button class="btn" id="redo">Retry all ${Math.min(open.length, 25)}${open.length > 25 ? " most-missed" : ""}</button>` : ""}</div></div>
        ${open.length ? `<div class="fixlist">${open.map(([id, m]) => { const q = QBANK[id]; const t = topicById[q.t];
          return `<div class="fixitem"><div class="row" style="justify-content:space-between"><span class="qtype">${t ? `W${t.week.n} · ${t.title}` : ""}</span><span class="chip bad">missed ×${m.n}</span></div><div>${q.q}</div><details><summary class="small">Show answer</summary><div class="small" style="margin-top:6px"><b>${answerText(q)}</b> — ${q.x || ""}</div></details>${remedyFor(q)}</div>`; }).join("")}</div>`
          : `<div class="card"><h3>Nothing here yet.</h3><p class="muted">Missed questions from quizzes, tests and mocks land here automatically.</p></div>`}
      </div>`;
    wireJumps(main);
    const r = $("#redo"); if (r) r.onclick = () => practice(main, { title: "Mistake book retry", eyebrow: "Clear your misses", qs: open.slice(0, 25).map(([id]) => QBANK[id]), back: `<button data-nav="mistakes">Mistake book</button><span>›</span><span>Retry</span>`,
      onDone(score, P, res) { save(); renderRail(); simpleResult(main, "Mistake book retry", score, P, res, "mistakes"); } });
  }

  /* ---------- formula sheet ---------- */
  function viewFormulas(main) {
    main.innerHTML = `
      <div class="page wide">
        <div class="topic-head"><span class="eyebrow">Last 30 minutes of the plan, and the night before the exam</span><h1>Formula &amp; fact sheet</h1>
        <p class="muted" style="max-width:65ch">Everything numerical or definitional that the lectures lean on, in one place. Cover the right side of each line and recite it.</p>
        <div class="row"><button class="btn ${S.revDone ? "quiet" : ""}" id="revdone">${S.revDone ? "✓ Revision marked done" : "Mark final revision done"}</button></div></div>
        <div class="fsheet">${(COURSE.formulas || []).map((f) => `<div class="card flat"><span class="eyebrow">${f.w}</span><h3>${f.h}</h3>${f.items.map(([a, b, c]) => `<div><div class="small muted">${a}</div><div class="eq">${b}${c ? `<div class="eqnote">${c}</div>` : ""}</div></div>`).join("")}</div>`).join("")}</div>
      </div>`;
    $("#revdone").onclick = () => { S.revDone = !S.revDone; save(); rerender(); };
  }

  /* ---------- word bank ---------- */
  function viewGlossary(main) {
    const items = GLOSS.slice().sort((a, b) => a.term.localeCompare(b.term, "en", { sensitivity: "base" }));
    main.innerHTML = `
      <div class="page">
        <div class="topic-head"><span class="eyebrow">Every new word in the course, in plain English</span><h1>Word bank</h1>
        <p class="muted" style="max-width:65ch">In the lessons, a word with a dotted underline is in this list: tap it to see its meaning without leaving the page. Type below to search.</p>
        <input class="tinput" id="gq" type="search" placeholder="Search a word, e.g. latent, softmax, token" aria-label="Search the word bank" style="max-width:420px"></div>
        <div class="gloss" id="gl">${items.map((g) => `<div class="gitem" data-s="${esc((g.names.join(" ") + " " + strip(g.def)).toLowerCase())}"><b>${g.term}</b>${g.names.length > 1 ? `<span class="small muted"> · also: ${g.names.slice(1).join(", ")}</span>` : ""}<div>${g.def}</div></div>`).join("")}</div>
      </div>`;
    $("#gq").oninput = (e) => { const q = e.target.value.trim().toLowerCase(); $$(".gitem", main).forEach((d) => (d.hidden = q && !d.dataset.s.includes(q))); };
  }

  /* ---------- exam pattern ---------- */
  function viewExam(main) {
    main.innerHTML = `
      <div class="page">
        <div class="topic-head"><span class="eyebrow">Know the game before you play it</span><h1>NPTEL exam pattern &amp; strategy</h1></div>
        <div class="grid2">
          <div class="card"><span class="eyebrow">How the certificate score works</span>
            <div class="tablewrap" style="margin-top:10px"><table class="prose" style="max-width:none"><tr><th>Component</th><th>Weight</th><th>Minimum</th></tr>
            <tr><td>Weekly assignments (best 8 of 12)</td><td>25</td><td>10 / 25</td></tr>
            <tr><td>Proctored final exam</td><td>75</td><td>30 / 75</td></tr>
            <tr><td><b>Total</b></td><td><b>100</b></td><td><b>40</b></td></tr></table></div>
            <p class="small muted" style="margin-top:10px">Miss either minimum and there is no certificate, even if the total crosses 40.</p></div>
          <div class="card"><span class="eyebrow">Certificate bands</span>
            <div class="tablewrap" style="margin-top:10px"><table class="prose" style="max-width:none"><tr><th>Final score</th><th>Certificate</th></tr>
            <tr><td>40 – 59</td><td>Successfully completed</td></tr><tr><td>60 – 74</td><td>Elite</td></tr><tr><td>75 – 89</td><td>Elite + Silver</td></tr><tr><td>90 – 100</td><td>Elite + Gold</td></tr></table></div></div>
        </div>
        <div class="card prose" style="max-width:none">
          <span class="eyebrow">The final exam</span>
          <ul>
            <li><b>Format:</b> computer-based, proctored at a TCS iON centre, usually 3 hours (one session, morning or afternoon).</li>
            <li><b>Question types:</b> mostly multiple-choice (one correct), with multiple-select (MSQ, one or more correct) and occasional numerical-answer questions. Check your hall ticket and the course announcements for the exact count; recent NPTEL papers run between about 50 and 100 questions.</li>
            <li><b>Marking:</b> NPTEL papers normally carry no negative marking. Never leave a question blank.</li>
            <li><b>What gets asked in this course:</b> definitions (discriminative vs generative, under/over-complete AE), "which statement is true" items, numerical forward passes (CNN output size, neuron outputs, MSE, KL in closed form, reparameterisation, GAN log-losses, temperature softmax, LoRA parameter counts) and architecture facts (U-Net, PatchGAN, CycleGAN losses, BERT vs GPT, RAG pipeline).</li>
          </ul>
          <p class="small muted">Sources: NPTEL course announcements and the published scoring policy. The pattern is the same across NPTEL courses; the question count varies.</p>
        </div>
        <div class="card prose" style="max-width:none">
          <span class="eyebrow">Strategy that fits a 16-hour preparation</span>
          <ol>
            <li><b>Breadth beats depth.</b> Every week contributes questions. A quick pass over all 12 weeks earns more marks than perfecting three.</li>
            <li><b>Numericals are free marks.</b> They follow fixed recipes. The formula sheet holds all of them; drill them until each takes under 90 seconds.</li>
            <li><b>MSQ discipline:</b> judge each option as an independent true/false statement. Partial selection usually earns nothing.</li>
            <li><b>Two-pass exam:</b> first pass answers everything you know in under a minute each and marks the rest for review. Second pass spends the remaining time on the marked ones.</li>
            <li><b>Last 24 hours:</b> Mock 3, then the mistake book, then the formula sheet. No new topics.</li>
          </ol>
        </div>
      </div>`;
  }

  /* ---------- settings / backup ---------- */
  function viewSettings(main) {
    main.innerHTML = `
      <div class="page">
        <div class="topic-head"><span class="eyebrow">Your data stays in this browser</span><h1>Progress backup</h1>
        <p class="muted" style="max-width:65ch">Progress and study time are saved in this browser only. To move to another device or browser, copy the backup code here and paste it into the same page there.</p></div>
        <div class="card" style="display:flex;flex-direction:column;gap:10px">
          <label for="bk" class="eyebrow">Backup code</label>
          <textarea id="bk" rows="5" class="tinput mono small" spellcheck="false">${esc(JSON.stringify(S))}</textarea>
          <div class="row"><button class="btn" id="copy">Copy backup code</button><button class="btn ghost" id="restore">Restore from pasted code</button></div>
          <div id="bk-msg" class="small muted"></div>
        </div>
        <div class="card" style="display:flex;flex-direction:column;gap:10px">
          <span class="eyebrow">Study clock</span>
          <p class="small muted">The clock counts while this tab is visible and you have interacted in the last 4 minutes. Logged video time so far: ${fmtMin(S.time.offline)}. First study day: ${S.started || "today"}.</p>
          <div class="row"><span class="small">Add time studied elsewhere:</span>${[15, 30, 60].map((m) => `<button class="btn quiet small" data-add="${m}">+${m} min</button>`).join("")}</div>
        </div>
        <div class="card" style="display:flex;flex-direction:column;gap:10px;border-color:var(--bad)">
          <span class="eyebrow" style="color:var(--bad)">Start over</span><p class="small muted">Erases all progress, scores and study time in this browser.</p>
          <div class="row"><button class="btn quiet" id="reset1">Reset everything</button><span id="reset2" hidden><button class="btn" style="background:var(--bad);border-color:var(--bad)" id="reset-yes">Yes, erase it all</button></span></div>
        </div>
      </div>`;
    $("#copy").onclick = () => {
      const ta = $("#bk"); ta.value = JSON.stringify(S);
      const done = () => ($("#bk-msg").textContent = "Copied. Paste it into this page on your other device.");
      try { navigator.clipboard.writeText(ta.value).then(done, () => { ta.select(); $("#bk-msg").textContent = "Copy blocked here. The code is selected: press Ctrl/Cmd + C."; }); }
      catch (e) { ta.select(); $("#bk-msg").textContent = "The code is selected: press Ctrl/Cmd + C."; }
    };
    $("#restore").onclick = () => {
      try { const p = JSON.parse($("#bk").value); if (!p || !p.time || !p.topics) throw 0; S = Object.assign(fresh(), p); S.time = Object.assign(fresh().time, p.time); save(); toast("Progress restored"); go("home"); }
      catch (e) { $("#bk-msg").textContent = "That code could not be read. Paste the full code, starting with { and ending with }."; }
    };
    $$("[data-add]", main).forEach((b) => (b.onclick = () => { addTime("offline", +b.dataset.add * 60, true); save(); toast(`Added ${b.dataset.add} min`); rerender(); }));
    $("#reset1").onclick = () => { $("#reset2").hidden = false; };
    $("#reset-yes").onclick = () => { S = fresh(); save(); toast("All progress erased"); go("home"); };
  }

  /* ---------- boot ---------- */
  shell();
  render();
  tick();
  window.__GENAI = { S: () => S, go, QBANK, MOCKS, planItems, plannedTotal };
})();
