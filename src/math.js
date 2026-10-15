/* Math typesetting: turns $…$ (inline) and $$…$$ (display) in any rendered text into KaTeX.
   Content strings are written with String.raw (R`…`), so LaTeX keeps single backslashes.
   A literal dollar sign is written \$ . */
(function () {
  "use strict";
  const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "PRE", "INPUT", "SELECT", "OPTION", "svg", "SVG", "text"]);
  const RE = /\$\$([\s\S]+?)\$\$|\\\$|\$([^$\n]+?)\$/g;
  const cache = new Map();

  function tex(src, display) {
    const k = (display ? "D" : "I") + src;
    let h = cache.get(k);
    if (h == null) {
      try {
        h = window.katex.renderToString(src, { displayMode: display, throwOnError: false, strict: "ignore", output: "htmlAndMathml", trust: false });
      } catch (e) { h = `<code>${src.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))}</code>`; }
      cache.set(k, h);
    }
    return h;
  }

  function skipped(node) {
    for (let p = node.parentNode; p && p.nodeType === 1; p = p.parentNode) {
      if (SKIP.has(p.nodeName) || (p.classList && (p.classList.contains("katex") || p.classList.contains("nomath")))) return true;
    }
    return false;
  }

  function renderMath(root) {
    if (!root || !window.katex) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const hits = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.nodeValue.indexOf("$") >= 0 && !skipped(n)) hits.push(n);
    hits.forEach((n) => {
      const s = n.nodeValue; RE.lastIndex = 0;
      if (!RE.test(s)) return;
      RE.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0, m;
      while ((m = RE.exec(s))) {
        if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
        if (m[0] === "\\$") frag.appendChild(document.createTextNode("$"));
        else {
          const span = document.createElement("span");
          span.className = m[1] != null ? "mathd" : "mathi";
          span.innerHTML = tex(m[1] != null ? m[1] : m[2], m[1] != null);
          frag.appendChild(span);
        }
        last = RE.lastIndex;
      }
      if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
      n.parentNode.replaceChild(frag, n);
    });
  }
  window.renderMath = renderMath;

  /* Typeset anything that appears later (views, quiz screens, widget read-outs). */
  let pending = new Set(), scheduled = false;
  const flush = () => { scheduled = false; const roots = Array.from(pending); pending = new Set(); roots.forEach((r) => r.isConnected && renderMath(r)); };
  const obs = new MutationObserver((muts) => {
    muts.forEach((m) => {
      if (m.type === "characterData") { if (m.target.parentNode) pending.add(m.target.parentNode); return; }
      m.addedNodes.forEach((a) => { if (a.nodeType === 1) { if (!a.classList.contains("mathi") && !a.classList.contains("mathd")) pending.add(a); } else if (a.nodeType === 3 && a.parentNode) pending.add(a.parentNode); });
    });
    if (pending.size && !scheduled) { scheduled = true; (window.queueMicrotask || setTimeout)(flush); }
  });
  const start = () => { renderMath(document.body); obs.observe(document.body, { childList: true, subtree: true, characterData: true }); };
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
