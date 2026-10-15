/* Game layer: a Duolingo-style learning path over the course.
   Levels (in order): for every topic a Lesson (one idea per screen) and a Practice (mastery: every question must
   end up answered correctly), then a unit Checkpoint (first-try score ≥ 80%), and finally three full Mock exams (≥ 70%).
   Mechanics: XP, daily goal, streak (+ streak freezes), hearts, gems, daily quests, combo, stars, celebrations,
   spaced-repetition review (Leitner boxes) that also refills hearts.
   app.js calls window.GAME(api) before it boots and mounts the returned views. */
(function () {
  "use strict";
  window.GAME = function (A) {
    const { $, $$, weeks, MOCKS, toast } = A;
    const DAY = 86400000;
    const INTERVALS = [0, 1, 2, 4, 8, 16]; // days per Leitner box
    const MAX_HEARTS = 5, CHECK_PASS = 0.8, MOCK_PASS = 0.7;
    const XP = { learn: 10, practice: 15, perfect: 5, check: 30, mock: 60, review: 2 };
    const GOALS = [[20, "Casual"], [50, "Regular"], [100, "Serious"], [150, "Intense"]];
    const SHOP = { freeze: 50, hearts: 40 };

    /* ---------- state ---------- */
    const S = () => A.S();
    const G = () => {
      const s = S();
      if (!s.game) s.game = { xp: 0, xpDay: {}, goal: 50, streak: 0, best: 0, lastGoalDay: null, freezes: 1, gems: 50, hearts: MAX_HEARTS, day: null, levels: {}, srs: {}, q: null, sound: true, combo: 0 };
      return s.game;
    };
    const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const today = () => ymd(new Date());
    const dayOffset = (k) => ymd(new Date(Date.now() + k * DAY));

    function daily() {
      const g = G(), t = today();
      if (g.day === t) return;
      g.hearts = MAX_HEARTS;
      if (g.lastGoalDay && g.lastGoalDay !== t && g.lastGoalDay !== dayOffset(-1)) {
        if (g.freezes > 0 && g.lastGoalDay === dayOffset(-2)) { g.freezes--; g.lastGoalDay = dayOffset(-1); g.froze = t; }
        else g.streak = 0;
      }
      g.q = { date: t, xp: 0, levels: 0, combo: 0, claimed: [] };
      g.day = t; A.save();
    }
    const quests = () => {
      const g = G();
      return [
        { k: "xp", n: g.goal, label: `Earn ${g.goal} XP` },
        { k: "levels", n: 2, label: "Complete 2 levels" },
        { k: "combo", n: 8, label: "Get 8 answers right in a row" },
      ];
    };
    function questTick() {
      const g = G();
      quests().forEach((q) => { if (!g.q.claimed.includes(q.k) && g.q[q.k] >= q.n) { g.q.claimed.push(q.k); g.gems += 10; toast(`Quest complete: ${q.label} · +10 gems`); } });
    }
    function addXP(n) {
      const g = G(), t = today();
      g.xp += n; g.xpDay[t] = (g.xpDay[t] || 0) + n; g.q.xp += n;
      let streakUp = false;
      if (g.xpDay[t] >= g.goal && g.lastGoalDay !== t) {
        g.streak = g.lastGoalDay === dayOffset(-1) ? g.streak + 1 : 1;
        g.best = Math.max(g.best, g.streak); g.lastGoalDay = t; streakUp = true;
      }
      questTick(); A.save();
      return streakUp;
    }

    /* ---------- sound ---------- */
    let AC = null;
    function beep(kind) {
      if (!G().sound) return;
      try {
        AC = AC || new (window.AudioContext || window.webkitAudioContext)();
        const seq = { ok: [[660, 0], [880, 0.09]], bad: [[220, 0], [180, 0.12]], win: [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.3]] }[kind];
        seq.forEach(([f, at]) => { const o = AC.createOscillator(), v = AC.createGain(); o.frequency.value = f; o.type = "sine"; v.gain.setValueAtTime(0.0001, AC.currentTime + at); v.gain.exponentialRampToValueAtTime(0.12, AC.currentTime + at + 0.02); v.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + at + 0.16); o.connect(v).connect(AC.destination); o.start(AC.currentTime + at); o.stop(AC.currentTime + at + 0.18); });
      } catch (e) { /* audio blocked */ }
    }

    /* ---------- levels ---------- */
    const LV = [];
    weeks.forEach((w) => {
      w.topics.forEach((t) => { LV.push({ id: "L:" + t.id, kind: "learn", w, t, label: t.title }); LV.push({ id: "P:" + t.id, kind: "practice", w, t, label: "Practice: " + t.title }); });
      LV.push({ id: "C:" + w.id, kind: "check", w, label: `Unit ${w.n} checkpoint` });
    });
    [1, 2, 3].forEach((k) => LV.push({ id: "M:" + k, kind: "mock", k, label: `Mock exam ${k}`, w: null }));
    const byId = Object.fromEntries(LV.map((l) => [l.id, l]));
    const rec = (id) => G().levels[id] || {};
    function isDone(l) {
      if (rec(l.id).done) return true;
      const s = S();
      if (l.kind === "learn") return !!(s.topics[l.t.id] || {}).read;
      if (l.kind === "practice") return !!(s.topics[l.t.id] || {}).passed;
      if (l.kind === "check") return ((s.tests[l.w.id] || {}).best || 0) >= CHECK_PASS;
      return ((s.mocks[l.k] || {}).best || 0) >= MOCK_PASS;
    }
    const currentIdx = () => { const i = LV.findIndex((l) => !isDone(l)); return i < 0 ? LV.length : i; };
    const unlocked = (l) => LV.indexOf(l) <= currentIdx();
    function complete(l, extra) { const g = G(); const r = g.levels[l.id] || {}; const first = !r.done; Object.assign(r, extra, { done: true }); g.levels[l.id] = r; if (first) g.q.levels++; questTick(); A.save(); return first; }
    function creditMocks() {
      LV.filter((l) => l.kind === "mock").forEach((l) => { const b = (S().mocks[l.k] || {}).best || 0; if (b >= MOCK_PASS && !rec(l.id).done) { complete(l, { stars: b >= 0.85 ? 3 : b >= 0.78 ? 2 : 1 }); addXP(XP.mock); G().gems += 25; } });
    }

    /* ---------- spaced repetition ---------- */
    function srsAnswer(id, ok) {
      const g = G(); const r = g.srs[id] || { b: 0, due: 0 };
      if (ok) r.b = Math.min(INTERVALS.length - 1, r.b + 1); else r.b = 0;
      r.due = Date.now() + (r.b === 0 ? 10 * 60000 : INTERVALS[r.b] * DAY);
      g.srs[id] = r;
    }
    function dueItems() {
      const g = G(), now = Date.now();
      return Object.entries(g.srs).filter(([id, r]) => A.QBANK[id] && r.due <= now).sort((a, b) => a[1].b - b[1].b || a[1].due - b[1].due).map(([id]) => A.QBANK[id]);
    }
    function reviewSet(n) {
      let d = dueItems();
      if (d.length < n) { const extra = Object.entries(G().srs).filter(([id]) => A.QBANK[id] && !d.includes(A.QBANK[id])).sort((a, b) => a[1].b - b[1].b || a[1].due - b[1].due).map(([id]) => A.QBANK[id]); d = d.concat(extra); }
      return d.slice(0, n);
    }

    /* ---------- icons ---------- */
    const ICON = {
      learn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/></svg>',
      practice: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>',
      check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>',
      mock: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18l2-11 4.5 4L12 4l2.5 7L19 7l2 11z"/><rect x="3" y="19" width="18" height="2" rx="1"/></svg>',
      lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
      fire: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9.5z"/></svg>',
      gem: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12l4 6-10 12L2 9z" opacity=".9"/></svg>',
      heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></svg>',
      bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>',
      x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
      sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg>',
      mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>',
    };
    const stars = (n) => `<span class="gstars">${[1, 2, 3].map((i) => `<i class="${i <= n ? "on" : ""}">★</i>`).join("")}</span>`;

    function statBar() {
      const g = G(), t = today(), xp = g.xpDay[t] || 0;
      return `<div class="gstats">
        <span class="gstat fire ${g.lastGoalDay === t ? "lit" : ""}" title="Streak: days in a row you met your daily goal">${ICON.fire}<b>${g.streak}</b></span>
        <span class="gstat gem" title="Gems">${ICON.gem}<b>${g.gems}</b></span>
        <span class="gstat heart" title="Hearts: you lose one per wrong answer">${ICON.heart}<b>${g.hearts}</b></span>
        <span class="gstat bolt" title="XP today / daily goal">${ICON.bolt}<b>${xp}/${g.goal}</b></span>
        <button class="iconbtn gsound" aria-label="Sound ${g.sound ? "on" : "off"}">${g.sound ? ICON.sound : ICON.mute}</button></div>`;
    }
    function wireStatBar(root) { const b = $(".gsound", root); if (b) b.onclick = () => { G().sound = !G().sound; A.save(); b.innerHTML = G().sound ? ICON.sound : ICON.mute; }; }

    /* ---------- path view ---------- */
    function viewPath(main) {
      daily(); creditMocks();
      const g = G(), cur = currentIdx(), t = today(), xpT = g.xpDay[t] || 0;
      const total = LV.length, doneN = LV.filter(isDone).length;
      const OFF = [0, 44, 66, 44, 0, -44, -66, -44];
      let k = 0;
      const unit = (w, levels, title, sub, n) => `
        <section class="gunit" data-unit="${n}">
          <div class="gbanner"><div><span class="eyebrow">${n === "E" ? "Final unit" : "Unit " + n}</span><h2>${title}</h2><p>${sub}</p></div>
            ${w ? `<button class="btn quiet small" data-notes="${w.id}">Lesson notes</button>` : ""}</div>
          <div class="gnodes">${levels.map((l) => {
            const i = LV.indexOf(l), d = isDone(l), u = i <= cur, here = i === cur, r = rec(l.id);
            const off = OFF[k++ % OFF.length];
            return `<div class="gnode-wrap" style="transform:translateX(${off}px)">
              ${here ? `<span class="gbubble">${i === 0 && !doneN ? "START" : "NEXT"}</span>` : ""}
              <button class="gnode ${l.kind} ${d ? "done" : u ? "open" : "locked"} ${here ? "here" : ""}" data-lv="${l.id}" aria-label="${A.esc(A.strip(l.label))}${d ? ", completed" : u ? "" : ", locked"}">${u || d ? ICON[l.kind] : ICON.lock}</button>
              <span class="glabel">${l.kind === "learn" ? A.strip(l.label) : l.kind === "practice" ? "Practice" : A.strip(l.label)}${d && r.stars ? stars(r.stars) : ""}</span>
            </div>`; }).join("")}</div>
        </section>`;
      const units = weeks.map((w) => unit(w, LV.filter((l) => l.w === w), w.title, w.tagline, w.n)).join("") +
        unit(null, LV.filter((l) => l.kind === "mock"), "Exam readiness", "Three full NPTEL-style mocks of questions you have never seen. Score at least 70% on each.", "E");
      const due = dueItems().length;
      main.innerHTML = `
        <div class="gpage">
          <div class="gmain">
            <div class="gtop">${statBar()}</div>
            ${units}
            <div class="gend card"><h3>${doneN === total ? "Every level complete." : `${total - doneN} levels to go`}</h3><p class="muted small">${doneN === total ? "You have mastered every topic, cleared every checkpoint and scored 70%+ on all three mocks. Submit your assignments and sit the exam." : "Finish the path to reach exam-ready."}</p></div>
          </div>
          <aside class="gside">
            <div class="card gcard"><span class="eyebrow">Daily goal</span>
              <div class="ggoal"><svg viewBox="0 0 44 44" class="gring"><circle cx="22" cy="22" r="18" fill="none" stroke="var(--rule)" stroke-width="5"/><circle cx="22" cy="22" r="18" fill="none" stroke="var(--hi)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${Math.min(1, xpT / g.goal) * 113} 113" transform="rotate(-90 22 22)"/></svg>
                <div><b>${xpT} / ${g.goal} XP</b><div class="small muted">${xpT >= g.goal ? "Goal met. Streak safe today." : "Meet it to keep your streak."}</div></div></div>
              <div class="seg gseg">${GOALS.map(([n, l]) => `<button type="button" data-goal="${n}" class="${g.goal === n ? "on" : ""}">${l} ${n}</button>`).join("")}</div>
              <p class="small muted">About 120 XP is one focused hour. Serious (100 XP/day) finishes the path in about 16 days.</p></div>
            <div class="card gcard"><span class="eyebrow">Daily quests · 10 gems each</span>
              ${quests().map((q) => { const v = Math.min(q.n, g.q[q.k] || 0); return `<div class="gquest ${g.q.claimed.includes(q.k) ? "won" : ""}"><div class="row" style="justify-content:space-between"><span>${q.label}</span><b>${v}/${q.n}</b></div><div class="bar"><i style="width:${(v / q.n) * 100}%"></i></div></div>`; }).join("")}</div>
            <div class="card gcard"><span class="eyebrow">Practice hub</span>
              <p class="small">${due ? `<b>${due}</b> question${due > 1 ? "s are" : " is"} due for review. Spaced review is what makes facts stick; each right answer also restores a heart.` : "Nothing due right now. Questions come back on a schedule (1, 2, 4, 8, 16 days) after you answer them."}</p>
              <button class="btn ${due ? "" : "quiet"} small" id="greview" ${Object.keys(g.srs).length ? "" : "disabled"}>Start a review</button></div>
            <div class="card gcard"><span class="eyebrow">Shop</span>
              <div class="row" style="justify-content:space-between"><span class="small">Streak freeze (you own ${g.freezes})</span><button class="btn quiet small" data-buy="freeze" ${g.gems < SHOP.freeze || g.freezes >= 2 ? "disabled" : ""}>${SHOP.freeze} gems</button></div>
              <div class="row" style="justify-content:space-between;margin-top:8px"><span class="small">Refill hearts</span><button class="btn quiet small" data-buy="hearts" ${g.gems < SHOP.hearts || g.hearts >= MAX_HEARTS ? "disabled" : ""}>${SHOP.hearts} gems</button></div></div>
            <div class="card gcard gpromise"><span class="eyebrow">The exam promise</span>
              <div class="row" style="justify-content:space-between"><b>${doneN} / ${total} levels</b><span class="small muted">${Math.round((doneN / total) * 100)}%</span></div><div class="bar good"><i style="width:${(doneN / total) * 100}%"></i></div>
              <p class="small muted">To finish the path you must answer every practice question correctly, score 80%+ first-try on all 13 checkpoints, and score 70%+ on three full mocks of unseen questions (about 52/75, against the 30/75 the exam requires). Assignments (10/25 minimum) are submitted on the NPTEL portal.</p></div>
            <div class="small muted">Best streak ${g.best} · total ${g.xp} XP</div>
          </aside>
        </div>`;
      wireStatBar(main);
      $$("[data-lv]", main).forEach((b) => (b.onclick = () => {
        const l = byId[b.dataset.lv];
        if (!unlocked(l)) { toast("Locked. Finish the levels before it first."); return; }
        if (l.kind === "learn") A.go("learn", l.t.id);
        else if (l.kind === "mock") A.go("mock", l.k);
        else A.go("play", l.id);
      }));
      $$("[data-notes]", main).forEach((b) => (b.onclick = () => A.go("week", b.dataset.notes)));
      $$("[data-goal]", main).forEach((b) => (b.onclick = () => { G().goal = +b.dataset.goal; A.save(); viewPath(main); }));
      $$("[data-buy]", main).forEach((b) => (b.onclick = () => { const g2 = G(), it = b.dataset.buy; g2.gems -= SHOP[it]; if (it === "freeze") g2.freezes++; else g2.hearts = MAX_HEARTS; A.save(); toast(it === "freeze" ? "Streak freeze equipped" : "Hearts refilled"); viewPath(main); }));
      const rv = $("#greview", main); if (rv) rv.onclick = () => A.go("review");
      const here = $(".gnode.here", main);
      if (here) setTimeout(() => here.scrollIntoView({ block: "center", behavior: "instant" in document.documentElement.style ? "instant" : "auto" }), 30);
    }

    /* ---------- shared session chrome ---------- */
    const chrome = (prog, right) => `<div class="gbar"><button class="iconbtn gquit" aria-label="Quit">${ICON.x}</button><div class="gprog"><i style="width:${Math.round(prog * 100)}%"></i></div>${right || ""}</div>`;
    function wireQuit(main) { const q = $(".gquit", main); if (q) q.onclick = () => A.go("path"); }

    /* ---------- lesson (one idea per screen) ---------- */
    function viewLearn(main, tid) {
      daily();
      const t = A.topicById[tid], l = byId["L:" + tid];
      const am = ACT.forTopic(t).match;
      const steps = [{ k: "hook" }].concat(t.cards.map((c, i) => ({ k: "card", c, i })), am ? [{ k: "act", a: ACT.fresh(am) }] : [], [{ k: "keys" }]);
      let i = 0, revealed = false;
      const draw = () => {
        const s = steps[i];
        let body = "";
        if (s.k === "hook") body = `<span class="eyebrow">Unit ${t.week.n} · ${A.esc(A.strip(t.title))}</span><h2 class="gq">Think first</h2><div class="hook"><div class="hook-q">${t.hook}</div>${revealed ? `<div class="hook-a">${t.reveal}</div>` : ""}</div>`;
        else if (s.k === "card") { const c = s.c; body = `<span class="eyebrow">Idea ${s.i + 1} of ${t.cards.length}</span><h2 class="gq">${c.h}</h2><div class="prose">${c.b}</div>${c.f ? A.figHTML(c.f) : ""}${c.w ? `<div class="widget-slot" data-w="${c.w}"></div>` : ""}${c.ask ? A.askHTML(c.ask, s.i) : ""}`; }
        else if (s.k === "act") body = `<span class="eyebrow">New words in this lesson</span>${ACT.html(s.a, false)}`;
        else body = `<span class="eyebrow">Before you practise</span><h2 class="gq">Remember for the exam</h2><ul class="gkeys">${t.keys.map((k) => `<li>${k}</li>`).join("")}</ul><div class="callout warn small"><b>Traps examiners like:</b><ul>${t.traps.map((k) => `<li>${k}</li>`).join("")}</ul></div>`;
        const gates = { ask: s.k === "card" && !!s.c.ask, w: s.k === "card" && !!s.c.w, act: s.k === "act" };
        const hint = () => [gates.w && "try the interactive model", gates.ask && "answer the quick check", gates.act && "match every pair"].filter(Boolean).join(" and ");
        const needAsk = gates.ask || gates.w || gates.act;
        const btn = s.k === "hook" && !revealed ? `<button class="btn gbtn" id="gnext">I have a guess. Reveal</button>` : `<button class="btn gbtn" id="gnext" ${needAsk ? "disabled" : ""}>${i === steps.length - 1 ? "Finish lesson" : "Continue"}</button>`;
        main.innerHTML = `<div class="gsession">${chrome((i + (revealed || s.k !== "hook" ? 1 : 0)) / (steps.length + 1), `<span class="small muted gcount">${i + 1}/${steps.length}</span>`)}
          <div class="gbody">${body}</div>
          <div class="gfoot"><div class="gfoot-in">${needAsk ? `<span class="small muted ghint">To continue: ${hint()}</span>` : `<span></span>`}${btn}</div></div></div>`;
        wireQuit(main);
        if (window.renderMath) window.renderMath(main);
        A.linkTerms($$(".gbody .prose, .gbody .hook, .gkeys", main));
        $$(".widget-slot", main).forEach((slot) => { const f = A.WIDGETS[slot.dataset.w]; if (f) { try { f(slot); } catch (e) { slot.innerHTML = '<p class="small muted">Interactive model failed to load.</p>'; } } });
        $$(".ask", main).forEach((box) => { A.wireAsk(box); $$(".opts button", box).forEach((b) => b.addEventListener("click", () => { const ok = +b.dataset.j === +box.dataset.a; beep(ok ? "ok" : "bad"); gates.ask = false; open(); })); });
        $$(".widget-slot", main).forEach((sl) => ["input", "click"].forEach((ev) => sl.addEventListener(ev, () => { if (gates.w) { gates.w = false; open(); } })));
        if (s.k === "act") ACT.wire(main, s.a, () => {}, () => { gates.act = false; beep("win"); open(); });
        function open() { const h = $(".ghint", main); if (h) h.textContent = hint() ? "To continue: " + hint() : ""; $("#gnext").disabled = !!hint(); }
        $("#gnext").onclick = () => {
          if (s.k === "hook" && !revealed) { revealed = true; draw(); return; }
          if (i < steps.length - 1) { i++; draw(); scrollTo(0, 0); return; }
          const s2 = S(); s2.topics[tid] = Object.assign(s2.topics[tid] || {}, { read: true, opened: true });
          const first = complete(l, {}); const su = addXP(XP.learn); if (first) G().gems += 5;
          celebrate(main, { title: "Lesson complete", xp: XP.learn, gems: first ? 5 : 0, streakUp: su, next: byId["P:" + tid], nextLabel: "Start practice" });
        };
      };
      draw();
    }

    /* ---------- interactive activities (built from each topic's own content) ----------
       match: tap a term, then its meaning (word bank)   blank: fill the gap in an exam key point with a word chip
       order: put a worked example's steps, or a pipeline (A → B → C), in the right order */
    const ACT = (() => {
      const hash = (s) => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
      const plain = (s) => A.strip(String(s)).replace(/\s+/g, " ").trim();
      const evenMath = (s) => ((String(s).match(/\$/g) || []).length % 2 === 0);
      const rx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const STOP = new Set("because between through without another however whether therefore whereas different another important example examples usually actually exactly".split(" "));
      const mix = (arr, seed) => A.shuffle(arr, seed);
      const topicText = (t) => plain([t.hook, t.reveal].concat(t.cards.map((c) => c.h + " " + c.b), t.keys).join(" ")).toLowerCase();
      const cache = {};

      function match(t) {
        const text = topicText(t), out = [];
        (window.COURSE.glossary || []).forEach(([term, def, al]) => {
          const names = [term].concat(al || []).filter((n) => n.length > 2);
          let hits = 0; names.forEach((n) => { const m = text.match(new RegExp("\\b" + rx(n.toLowerCase()) + "\\b", "g")); hits += m ? m.length : 0; });
          if (!hits) return;
          let d = plain(def); const m = d.match(/^(.{20,150}?[.!?])(\s|$)/); d = m ? m[1] : d;
          if (d.length > 170 || !evenMath(d) || out.some((o) => o.term.toLowerCase() === term.toLowerCase())) return;
          out.push({ term, def: d, hits });
        });
        out.sort((a, b) => b.hits - a.hits || hash(t.id + a.term) - hash(t.id + b.term));
        const pairs = out.slice(0, 4);
        return pairs.length >= 3 ? { act: "match", id: "am:" + t.id, pairs } : null;
      }

      function blank(t) {
        const week = t.week, cands = [], typ = (w) => (/^\d/.test(w) ? "num" : "word");
        const gl = new Set((window.COURSE.glossary || []).flatMap(([term, , al]) => [term].concat(al || [])).map((x) => x.toLowerCase()));
        const scan = (k, owner) => {
          const segs = String(k).split(/(\$\$[\s\S]+?\$\$|\$[^$]+\$|<[^>]+>)/);
          segs.forEach((sg, si) => {
            if (si % 2) return;
            const re = /\b([A-Za-z][A-Za-z-]{5,}|\d+(?:\.\d+)?%?)\b/g; let m;
            while ((m = re.exec(sg))) { const w = m[1]; if (STOP.has(w.toLowerCase())) continue; cands.push({ owner, k, si, idx: m.index, w, type: typ(w), score: typ(w) === "num" ? 3 : gl.has(w.toLowerCase()) ? 3 : w.length >= 8 ? 2 : 1 }); }
          });
        };
        week.topics.forEach((tt) => tt.keys.forEach((k) => scan(k, tt.id)));
        const mine = cands.filter((c) => c.owner === t.id).sort((a, b) => b.score - a.score || hash(t.id + a.w + a.idx) - hash(t.id + b.w + b.idx));
        for (const c of mine) {
          const same = [...new Set(cands.filter((o) => o.type === c.type && o.w.toLowerCase() !== c.w.toLowerCase() && !String(c.k).toLowerCase().includes(o.w.toLowerCase())).map((o) => o.w))];
          let opts = same.sort((a, b) => Math.abs(a.length - c.w.length) - Math.abs(b.length - c.w.length) || hash(a) - hash(b)).slice(0, 3);
          if (c.type === "num" && opts.length < 3) { const v = parseFloat(c.w), pct = c.w.endsWith("%") ? "%" : ""; [v * 2, v / 2, v + (v >= 10 ? 10 : 1)].forEach((x) => { const s = String(+x.toFixed(4)) + pct; if (opts.length < 3 && s !== c.w && !opts.includes(s)) opts.push(s); }); }
          if (opts.length < 3) continue;
          const cap = /^[A-Z]/.test(c.w) && !/^[A-Z]{2}/.test(c.w);
          opts = opts.map((o) => (/^[A-Z]{2}/.test(o) || /^\d/.test(o) ? o : cap ? o[0].toUpperCase() + o.slice(1) : o[0].toLowerCase() + o.slice(1)));
          if (new Set(opts.concat(c.w)).size < 4) continue;
          const segs = String(c.k).split(/(\$\$[\s\S]+?\$\$|\$[^$]+\$|<[^>]+>)/);
          const pre = segs.slice(0, c.si).join("") + segs[c.si].slice(0, c.idx), post = segs[c.si].slice(c.idx + c.w.length) + segs.slice(c.si + 1).join("");
          if (!evenMath(pre) || !evenMath(post)) continue;
          return { act: "blank", id: "ab:" + t.id, pre, post, answer: c.w, opts: opts.concat(c.w) };
        }
        return null;
      }

      function order(t) {
        for (const c of t.cards) {
          const m = String(c.b).match(/<div class="steps"><ol>([\s\S]*?)<\/ol>/);
          if (!m) continue;
          const li = [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x) => x[1].trim());
          const pre = {}; li.forEach((x) => { const k = A.strip(x).slice(0, 4); pre[k] = (pre[k] || 0) + 1; });
          const parallel = Math.max(...Object.values(pre)) >= Math.max(2, li.length / 2);
          if (!parallel && li.length >= 3 && li.length <= 6 && li.every((x) => x.length < 260 && evenMath(x)) && new Set(li).size === li.length) return { act: "order", id: "ao:" + t.id, title: "Put the worked example in order", sub: c.h, steps: li };
        }
        for (const k of t.keys) {
          const s = A.strip(String(k)); if (!evenMath(s)) continue;
          const chain = s.replace(/\$[^$]*\$/g, (x) => x.replace(/→/g, "\u0000")).split(/[.;]\s/).find((x) => (x.match(/→/g) || []).length >= 2);
          if (!chain) continue;
          const body = chain.includes(":") ? chain.slice(chain.indexOf(":") + 1) : chain;
          const items = body.split("→").map((x) => x.replace(/\u0000/g, "→").trim().replace(/\.$/, "")).filter(Boolean);
          if (items.length >= 3 && items.length <= 7 && new Set(items).size === items.length && items.every((x) => x.length < 60 && evenMath(x))) return { act: "order", id: "ao:" + t.id, title: "Put the steps in order", sub: chain.includes(":") ? chain.slice(0, chain.indexOf(":")) : "", steps: items };
        }
        return null;
      }

      function fresh(a) {
        const seed = Date.now() % 1e9 + hash(a.id);
        const b = Object.assign({}, a);
        if (a.act === "match") { const ix = a.pairs.map((_, i) => i); b.st = { L: mix(ix, seed), R: mix(ix, seed + 1), done: new Set(), sel: null, wrong: 0 }; }
        else if (a.act === "blank") b.st = { opts: mix(a.opts, seed), pick: null };
        else { let o = mix(a.steps.map((_, i) => i), seed); if (o.every((v, i) => v === i)) o = o.reverse(); b.st = { pool: o, seq: [] }; }
        return b;
      }
      const forTopic = (t) => { if (!cache[t.id]) cache[t.id] = { match: match(t), blank: blank(t), order: order(t) }; return cache[t.id]; };

      function inner(a, checked, ok) {
        const st = a.st;
        if (a.act === "match") return `<span class="qtype">Match the pairs</span><div class="gq">Tap a term, then its meaning</div>
          <div class="amatch"><div class="acol">${st.L.map((k) => `<button type="button" class="achip aterm ${st.done.has(k) ? "ok" : ""}" data-side="L" data-k="${k}" ${st.done.has(k) || checked ? "disabled" : ""}>${a.pairs[k].term}</button>`).join("")}</div>
          <div class="acol">${st.R.map((k) => `<button type="button" class="achip adef ${st.done.has(k) ? "ok" : ""}" data-side="R" data-k="${k}" ${st.done.has(k) || checked ? "disabled" : ""}>${a.pairs[k].def}</button>`).join("")}</div></div>`;
        if (a.act === "blank") return `<span class="qtype">Fill the blank</span><div class="gq">Complete the exam key point</div>
          <div class="ablank-s">${a.pre}<span class="ablank ${checked ? (ok ? "ok" : "no") : st.pick ? "filled" : ""}">${st.pick || "&nbsp;"}</span>${a.post}</div>
          <div class="abank">${st.opts.map((w) => `<button type="button" class="achip ${st.pick === w ? "sel" : ""}" data-w="${A.esc(w)}" data-ok="${w === a.answer ? 1 : 0}" ${checked ? "disabled" : ""}>${A.esc(w)}</button>`).join("")}</div>`;
        return `<span class="qtype">${a.title}</span>${a.sub ? `<div class="gq">${a.sub}</div>` : ""}
          <div class="aorder-ans">${st.seq.length ? st.seq.map((i, n) => `<button type="button" class="achip step placed" data-i="${i}" ${checked ? "disabled" : ""}><b>${n + 1}</b>${a.steps[i]}</button>`).join("") : '<span class="small muted">Tap the steps below in order</span>'}</div>
          <div class="aorder-pool">${st.pool.filter((i) => !st.seq.includes(i)).map((i) => `<button type="button" class="achip step" data-i="${i}" data-pos="${i}" ${checked ? "disabled" : ""}>${a.steps[i]}</button>`).join("")}</div>`;
      }
      const html = (a, checked, ok) => `<div class="aact" data-act="${a.act}">${inner(a, checked, ok)}</div>`;

      /* onReady(bool) enables Check; onAuto() fires when a match board is finished */
      function wire(root, a, onReady, onAuto) {
        const box = $(".aact", root); const st = a.st;
        const rerender = () => { box.innerHTML = inner(a, false); if (window.renderMath) window.renderMath(box); bind(); };
        const bind = () => {
          if (a.act === "match") {
            $$(".achip", box).forEach((b) => (b.onclick = () => {
              const side = b.dataset.side, k = +b.dataset.k;
              if (!st.sel || st.sel.side === side) { $$(".achip.sel", box).forEach((x) => x.classList.remove("sel")); st.sel = { side, k }; b.classList.add("sel"); return; }
              const other = $(`.achip[data-side="${st.sel.side}"][data-k="${st.sel.k}"]`, box);
              if (st.sel.k === k) { st.done.add(k); [b, other].forEach((x) => { x.classList.remove("sel"); x.classList.add("ok"); x.disabled = true; }); beep("ok"); st.sel = null; if (st.done.size === a.pairs.length) setTimeout(onAuto, 350); }
              else { st.wrong++; [b, other].forEach((x) => { x.classList.remove("sel"); x.classList.add("no"); setTimeout(() => x.classList.remove("no"), 500); }); beep("bad"); st.sel = null; }
            }));
          } else if (a.act === "blank") {
            $$(".achip", box).forEach((b) => (b.onclick = () => { st.pick = b.dataset.w; rerender(); onReady(true); }));
          } else {
            $$(".aorder-pool .achip", box).forEach((b) => (b.onclick = () => { st.seq.push(+b.dataset.i); rerender(); onReady(st.seq.length === a.steps.length); }));
            $$(".aorder-ans .achip", box).forEach((b) => (b.onclick = () => { st.seq = st.seq.filter((i) => i !== +b.dataset.i); rerender(); onReady(false); }));
          }
        };
        bind();
      }
      const correct = (a) => (a.act === "match" ? a.st.wrong === 0 : a.act === "blank" ? a.st.pick === a.answer : a.st.seq.every((v, i) => v === i));
      const fb = (a, ok) => {
        if (a.act === "match") return `<div class="explain ${ok ? "good" : "bad"}"><b class="v">${ok ? "All matched, first time." : "Matched, with " + a.st.wrong + " slip" + (a.st.wrong > 1 ? "s" : "") + "."}</b><div>${ok ? "These words will keep coming up. Tap any underlined word in a lesson to see its meaning again." : "It comes back at the end. Read each pair once more:"}</div>${ok ? "" : `<ul>${a.pairs.map((p) => `<li><b>${p.term}</b>: ${p.def}</li>`).join("")}</ul>`}</div>`;
        if (a.act === "blank") return `<div class="explain ${ok ? "good" : "bad"}"><b class="v">${ok ? "Correct." : "Not this time."}</b><div>${a.pre}<b>${A.esc(a.answer)}</b>${a.post}</div></div>`;
        return `<div class="explain ${ok ? "good" : "bad"}"><b class="v">${ok ? "Right order." : "Here is the right order:"}</b>${ok ? "" : `<ol>${a.steps.map((s) => `<li>${s}</li>`).join("")}</ol>`}</div>`;
      };
      return { forTopic, fresh, html, wire, correct, fb };
    })();

    /* ---------- question session (practice, checkpoint, review) ---------- */
    function viewPlay(main, lid) {
      daily();
      const l = byId[lid];
      if (!l) return A.go("path");
      if (l.kind === "practice") { const a = ACT.forTopic(l.t); session(main, { l, qs: l.t.quiz, mode: "practice", title: l.t.title, acts: [a.blank, a.order].filter(Boolean) }); }
      else session(main, { l, qs: l.w.test, mode: "check", title: `Unit ${l.w.n} checkpoint` });
    }
    function viewReview(main) { daily(); const qs = reviewSet(10); if (!qs.length) return A.go("path"); const tt = A.topicById[(qs.find((q) => A.topicById[q.t]) || {}).t]; const ra = tt && ACT.forTopic(tt); session(main, { l: null, qs, mode: "review", title: "Review", acts: ra ? [ra.match || ra.blank].filter(Boolean) : [] }); }

    function session(main, { l, qs, mode, title, acts }) {
      const g = G();
      if (mode !== "review" && g.hearts <= 0) return outOfHearts(main, l);
      const seed = Date.now() % 1e9;
      let queue = A.shuffle(qs, seed).map((q, i) => A.prep(q, seed + i));
      (acts || []).forEach((a, i) => queue.splice(Math.min(queue.length, 1 + i * 3), 0, ACT.fresh(a)));
      const total = queue.length, seen = new Set(), firstWrong = new Set();
      let mastered = 0, firstRight = 0, combo = 0, maxCombo = 0, answer = null, checked = false, ok = false;
      const t0 = Date.now();
      const draw = () => {
        const p = queue[0];
        main.innerHTML = `<div class="gsession">${chrome(mastered / total, mode === "review" ? `<span class="gstat heart">${ICON.heart}<b>${G().hearts}</b></span>` : `<span class="gstat heart ${checked && !ok ? "hit" : ""}">${ICON.heart}<b>${G().hearts}</b></span>`)}
          <div class="gbody">${combo >= 3 && !checked ? `<span class="gcombo">${combo} in a row</span>` : ""}<span class="eyebrow">${mode === "check" ? "Checkpoint · first try counts" : mode === "review" ? "Review" : seen.has(p.id) ? "Try again" : "Practice"} · ${A.esc(A.strip(title))}</span>
            ${p.act ? ACT.html(p, checked, ok) : `<span class="qtype" style="display:block;margin-top:6px">${A.typeLabel(p)}</span><div class="qtext gq">${p.src.q}</div>${A.optsHTML(p, answer, checked)}`}</div>
          <div class="gfoot ${checked ? (ok ? "good" : "bad") : ""}"><div class="gfoot-in">${checked ? `<div class="gfb">${p.act ? ACT.fb(p, ok) : A.explainHTML(p, ok)}</div><button class="btn gbtn" id="gcont">Continue</button>` : (p.act === "match" ? `<span class="small muted">Tap a term, then its meaning</span><span></span>` : `<span></span><button class="btn gbtn" id="gcheck" disabled>Check</button>`)}</div></div></div>`;
        wireQuit(main); A.wireJumps(main);
        if (window.renderMath) window.renderMath(main);
        if (!checked) { if (p.act) ACT.wire(main, p, (r) => { const b = $("#gcheck"); if (b) b.disabled = !r; }, () => doCheck()); else A.wireOpts(main, p, (v) => { answer = v; $("#gcheck").disabled = v == null || v === "" || (Array.isArray(v) && !v.length); }); }
        const doCheck = () => {
          ok = p.act ? ACT.correct(p) : A.correct(p, answer); checked = true;
          const first = !seen.has(p.id); seen.add(p.id);
          if (!p.act) { A.recordMistake(p.id, ok); srsAnswer(p.id, ok && first); }
          if (ok) { if (first) firstRight++; mastered += mode === "practice" || first ? 1 : 0; combo++; maxCombo = Math.max(maxCombo, combo); const gq = G().q; gq.combo = Math.max(gq.combo, combo); questTick(); if (mode === "review" && G().hearts < MAX_HEARTS) G().hearts++; beep("ok"); }
          else { combo = 0; if (first) firstWrong.add(p.id); if (mode !== "review" && first) G().hearts = Math.max(0, G().hearts - 1); if (mode !== "practice") mastered++; beep("bad"); }
          A.save(); draw();
        };
        const c = $("#gcheck"); if (c) c.onclick = doCheck;
        const n = $("#gcont"); if (n) n.onclick = () => {
          const p0 = queue.shift();
          if (!ok && mode === "practice") queue.push(p0.act ? ACT.fresh(p0) : A.prep(p0.src, Date.now() % 1e9));
          answer = null; checked = false; ok = false;
          if (mode !== "review" && G().hearts <= 0 && queue.length) return outOfHearts(main, l);
          if (!queue.length) return finish();
          draw(); scrollTo(0, 0);
        };
        const inp = $(".natbox input", main); if (inp && !checked) inp.addEventListener("keydown", (e) => { if (e.key === "Enter" && !$("#gcheck").disabled) $("#gcheck").click(); });
      };
      const finish = () => {
        const acc = firstRight / total, secs = Math.round((Date.now() - t0) / 1000);
        if (mode === "review") { const xp = XP.review * firstRight; const su = addXP(xp); return celebrate(main, { title: "Review done", xp, acc, combo: maxCombo, streakUp: su, secs }); }
        if (mode === "practice") {
          const st = firstWrong.size === 0 ? 3 : firstWrong.size <= 2 ? 2 : 1;
          const s2 = S(), ts = Object.assign(s2.topics[l.t.id] || {}, { read: true }); ts.attempts = (ts.attempts || 0) + 1; ts.last = acc; ts.best = Math.max(ts.best || 0, acc); ts.passed = true; s2.topics[l.t.id] = ts;
          const first = complete(l, { stars: Math.max(st, rec(l.id).stars || 0) });
          const xp = XP.practice + (st === 3 ? XP.perfect : 0); const su = addXP(xp); if (first) G().gems += 5;
          return celebrate(main, { title: st === 3 ? "Perfect practice" : "Practice mastered", xp, gems: first ? 5 : 0, acc, combo: maxCombo, stars: st, streakUp: su, secs, next: LV[LV.indexOf(l) + 1] });
        }
        const s2 = S(), ts = s2.tests[l.w.id] || {}; ts.attempts = (ts.attempts || 0) + 1; ts.last = acc; ts.best = Math.max(ts.best || 0, acc); if (acc >= CHECK_PASS) ts.passed = true; s2.tests[l.w.id] = ts; A.save();
        if (acc < CHECK_PASS) { beep("bad"); return checkFail(main, l, acc, firstWrong); }
        const st = acc >= 0.99 ? 3 : acc >= 0.9 ? 2 : 1;
        const first = complete(l, { stars: Math.max(st, rec(l.id).stars || 0) }); const xp = XP.check + (st === 3 ? 10 : 0); const su = addXP(xp); if (first) G().gems += 10;
        celebrate(main, { title: `Unit ${l.w.n} cleared`, xp, gems: first ? 10 : 0, acc, combo: maxCombo, stars: st, streakUp: su, secs, next: LV[LV.indexOf(l) + 1] });
      };
      draw();
    }

    function outOfHearts(main, l) {
      const g = G(); beep("bad");
      main.innerHTML = `<div class="gsession"><div class="gbody gcenter"><div class="gbig heart">${ICON.heart}</div><h2>Out of hearts</h2>
        <p class="muted">Five mistakes ends a session. That is the signal to go back to the ideas, not to guess harder. Your hearts refill tomorrow, or now by reviewing (each right answer restores one).</p>
        <div class="gcol">${l && l.t ? `<button class="btn" data-a="lesson">Re-read the lesson</button>` : ""}${Object.keys(g.srs).length ? `<button class="btn ghost" data-a="review">Review to earn hearts</button>` : ""}<button class="btn quiet" data-a="buy" ${g.gems < SHOP.hearts ? "disabled" : ""}>Refill for ${SHOP.hearts} gems (you have ${g.gems})</button><button class="btn quiet" data-a="path">Back to the path</button></div></div></div>`;
      $$("[data-a]", main).forEach((b) => (b.onclick = () => { const a = b.dataset.a; if (a === "lesson") A.go("learn", l.t.id); else if (a === "review") A.go("review"); else if (a === "buy") { g.gems -= SHOP.hearts; g.hearts = MAX_HEARTS; A.save(); A.go("play", l.id); } else A.go("path"); }));
    }
    function checkFail(main, l, acc, wrong) {
      const ts = [...new Set([...wrong].map((id) => (A.QBANK[id] || {}).t).filter(Boolean))];
      main.innerHTML = `<div class="gsession"><div class="gbody gcenter"><h2>${Math.round(acc * 100)}%: not cleared yet</h2>
        <p class="muted">Checkpoints need 80% on the first try. Re-play the practice for the topics you missed, then try again.</p>
        <div class="gcol">${ts.map((tid) => `<button class="btn quiet" data-t="${tid}">Practice: ${A.esc(A.strip(A.topicById[tid].title))}</button>`).join("")}<button class="btn" data-a="retry">Retry checkpoint</button><button class="btn ghost" data-a="path">Back to the path</button></div></div></div>`;
      $$("[data-t]", main).forEach((b) => (b.onclick = () => A.go("play", "P:" + b.dataset.t)));
      $("[data-a=retry]", main).onclick = () => A.go("play", l.id, { force: true });
      $("[data-a=path]", main).onclick = () => A.go("path");
    }

    /* ---------- celebration ---------- */
    function celebrate(main, o) {
      beep("win"); const g = G();
      const conf = Array.from({ length: 36 }, (_, i) => `<i style="left:${(i * 37) % 100}%;animation-delay:${(i % 9) * 0.07}s;background:${["var(--hi)", "var(--good)", "var(--accent)", "var(--bad)"][i % 4]}"></i>`).join("");
      const tile = (v, l2, cls) => `<div class="gtile ${cls}"><b>${v}</b><span>${l2}</span></div>`;
      main.innerHTML = `<div class="gsession"><div class="gconfetti" aria-hidden="true">${conf}</div><div class="gbody gcenter">
        ${o.stars ? `<div class="gbigstars">${stars(o.stars)}</div>` : `<div class="gbig bolt">${ICON.bolt}</div>`}
        <h2>${o.title}</h2>
        <div class="gtiles">${tile("+" + o.xp, "XP", "xp")}${o.acc != null ? tile(Math.round(o.acc * 100) + "%", "first-try accuracy", "acc") : ""}${o.combo ? tile(o.combo, "best combo", "cmb") : ""}${o.gems ? tile("+" + o.gems, "gems", "gm") : ""}</div>
        ${o.streakUp ? `<div class="callout good"><b>${ICON.fire} ${g.streak}-day streak!</b> Daily goal met.</div>` : ""}
        <div class="gcol">${o.next && o.next.kind !== "mock" ? `<button class="btn" id="gnextlv">${o.nextLabel || "Next: " + A.esc(A.strip(o.next.kind === "practice" ? "Practice" : o.next.label))}</button>` : ""}<button class="btn ${o.next && o.next.kind !== "mock" ? "ghost" : ""}" id="gpath">Back to the path</button></div></div></div>`;
      const nx = $("#gnextlv", main); if (nx) nx.onclick = () => { const l = o.next; if (l.kind === "learn") A.go("learn", l.t.id); else A.go("play", l.id); };
      $("#gpath", main).onclick = () => A.go("path");
    }

    return {
      views: { path: viewPath, learn: viewLearn, play: viewPlay, review: viewReview },
      ctx: (name, arg) => (name === "learn" ? "topic:" + arg : name === "play" && String(arg).startsWith("P:") ? "quiz:" + arg.slice(2) : name === "play" ? "test:" + String(arg).slice(2) : null),
      levels: LV, isDone, statBar, acts: ACT,
    };
  };
})();
