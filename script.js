const EMAIL = "work.vansharora@gmail.com";
const copyBtn = document.getElementById("copy");
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(EMAIL);
    copyBtn.textContent = "Copied!";
  } catch (e) {
    copyBtn.textContent = "Copy failed";
  }
  setTimeout(() => (copyBtn.textContent = "Copy email"), 2000);
});

// Rotating tech word: letters bounce in one by one, hold, then bounce out one by one
const WORDS = [
  ["Java",          "linear-gradient(90deg,#ff8a00,#ffe11a,#ff63b8,#ff8a00)"],
  ["Node.js",       "linear-gradient(90deg,#05e06a,#00d1f0,#ffe11a,#05e06a)"],
  ["React",         "linear-gradient(90deg,#00d1f0,#be7bff,#ff63b8,#00d1f0)"],
  ["MySQL",         "linear-gradient(90deg,#ffe11a,#ff8a00,#ff63b8,#ffe11a)"],
  ["MongoDB",       "linear-gradient(90deg,#05e06a,#ffe11a,#00d1f0,#05e06a)"],
  ["Docker",        "linear-gradient(90deg,#00d1f0,#05e06a,#be7bff,#00d1f0)"],
  ["System Design", "linear-gradient(90deg,#ff63b8,#be7bff,#00d1f0,#ff63b8)"],
  ["DSA",           "linear-gradient(90deg,#ffe11a,#05e06a,#00d1f0,#ffe11a)"]
];
const wordEl = document.getElementById("word");
const HOLD = 1000;        // ms the full word stays on screen (longer so the side animations can play)
let idx = 0;

function render(i) {
  const [text, grad] = WORDS[i];
  wordEl.style.setProperty("--g", grad);
  wordEl.innerHTML = "";
  [...text].forEach((ch, n) => {
    const s = document.createElement("span");
    s.className = "l";
    s.style.setProperty("--i", n);
    s.textContent = ch;
    wordEl.appendChild(s);
  });
  return text.length;
}

function cycle() {
  const n = render(idx);
  // tell the side-animation layer which skill just appeared (deferred so it works on the very first word too)
  setTimeout(() => document.dispatchEvent(new CustomEvent("skill:in", { detail: { index: idx } })), 0);
  const inTime = 80 * (n - 1) + 800;
  setTimeout(() => {
    document.dispatchEvent(new Event("skill:out"));
    wordEl.querySelectorAll(".l").forEach(l => l.classList.add("out"));
    const outTime = 50 * (n - 1) + 500;
    setTimeout(() => { idx = (idx + 1) % WORDS.length; cycle(); }, outTime + 150);
  }, inTime + HOLD);
}
cycle();


// ---------- Falcon guide: perches on a branch beside the badge, click for a project tour ----------
(() => {
  const dove = document.getElementById("dove");
  const bubble = document.getElementById("bubble");
  const bTitle = document.getElementById("bubble-title");
  const bText = document.getElementById("bubble-text");
  const bActions = document.getElementById("bubble-actions");
  const branch = document.getElementById("branch");
  const perchEl = document.getElementById("perch");
  if (!dove || !bubble || !perchEl) return;

  const reduceQ = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const cards = [...document.querySelectorAll(".projects .card")];
  const contact = document.querySelector(".contact");
  const stops = [...cards, contact].filter(Boolean);
  // One line per stop, in the same order as the cards, then the contact section.
  const LINES = [
    "ThinkBeyond helps developers understand an unfamiliar codebase without reading every file. It's still in progress.",
    "DevFlow gives a team a live view of its issues, with the right level of access for each role.",
    "Hybrid Fashion Recommender suggests fashion products by combining what an item is like with how people rate it.",
    "A remote-control car built around an ESP32-CAM. It got me selected for Tech Innovate 2026.",
    "That's the tour. If something caught your eye, the email button below is the quickest way to reach me."
  ];

  const HINT = "Click me for a tour!";
  const TAKEOFF = 260;                       // ms of crouching before the bird leaves a perch
  // [name, duration ms, weight] for the little things it does while sitting
  const ACTS = [["look", 2000, 3], ["peck", 1600, 2], ["preen", 2200, 1], ["wag", 900, 2], ["ruffle", 950, 1], ["hop", 800, 1], ["turn", 3200, 1]];
  const ACT_CLASSES = ACTS.map(a => "act-" + a[0]);

  const pos = { x: innerWidth + 110, y: 140 };   // anchor = the bird's feet, in viewport pixels
  let facing = -1, scale = 1, tilt = 0;          // facing: 1 = right, -1 = left
  let leg = null, perch = null, touring = false, hintOn = false, idleTimer = null;

  // ----- places the bird can sit -----
  const homePoint = () => { const r = perchEl.getBoundingClientRect(); return { x: r.left, y: r.top }; };
  const homePerch = { get: homePoint, home: true };
  const cardPerch = el => ({ get: () => { const r = el.getBoundingClientRect(); return { x: r.left + r.width * 0.5, y: r.top }; } });
  const flight = (to, speed, min, max) => clamp(Math.hypot(to.x - pos.x, to.y - pos.y) / speed, min, max);

  // Arc control point; usually bulges upwards so it lifts off and glides down.
  function curve(from, to) {
    const dx = to.x - from.x, dy = to.y - from.y, dist = Math.hypot(dx, dy) || 1;
    const up = dx >= 0 ? -1 : 1;
    const bend = (0.12 + Math.random() * 0.2) * dist * (Math.random() < 0.8 ? up : -up);
    return { x: (from.x + to.x) / 2 - (dy / dist) * bend, y: (from.y + to.y) / 2 + (dx / dist) * bend };
  }

  // Camera: the page scrolls in step with the flight so the falcon stays on screen.
  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const cardCam = el => () => {
    const r = el.getBoundingClientRect();
    const top = Math.min(280, Math.max(110, innerHeight - r.height - 20));   // leave room above for bird + bubble
    return clamp(scrollY + r.top - top, 0, maxScroll());
  };
  const homeCam = () => clamp(scrollY + homePoint().y - 280, 0, maxScroll());

  function bounceBranch() {
    if (!branch || reduceQ.matches) return;
    branch.classList.remove("bounce"); void branch.offsetWidth; branch.classList.add("bounce");
    document.dispatchEvent(new Event("branch-bounce"));
    setTimeout(() => branch.classList.remove("bounce"), 1000);
  }

  // Take off from wherever it is sitting (a short crouch first), or just continue from mid-air.
  function startLeg(toFn, dur, onArrive, camFn) {
    clearTimeout(idleTimer);
    dove.classList.remove(...ACT_CLASSES);
    const wasHome = !!(perch && perch.home);
    const delay = perch && !reduceQ.matches ? TAKEOFF : 0;
    leg = { from: perch ? perch.get() : { x: pos.x, y: pos.y }, fromFn: perch ? perch.get : null, c: null, toFn, camFn, camFrom: 0, camTo: null, t0: performance.now() + delay, dur, onArrive };
    perch = null;
    if (delay) {
      dove.classList.add("crouch");
      setTimeout(() => dove.classList.remove("crouch"), delay);
      if (wasHome) setTimeout(bounceBranch, delay);
    }
  }

  // ----- idle behaviour while perched -----
  function scheduleIdle(delay = 1200 + Math.random() * 2400) {
    clearTimeout(idleTimer);
    if (reduceQ.matches) return;
    idleTimer = setTimeout(idle, delay);
  }
  function idle() {
    if (!perch || leg) return;
    const total = ACTS.reduce((s, a) => s + a[2], 0);
    let r = Math.random() * total, act = ACTS[0];
    for (const a of ACTS) { r -= a[2]; if (r <= 0) { act = a; break; } }
    const [name, dur] = act;
    if (name === "turn") {
      const here = perch;
      facing = -facing;
      setTimeout(() => { if (perch === here && !leg) facing = -facing; }, dur);
    } else {
      dove.classList.add("act-" + name);
      setTimeout(() => dove.classList.remove("act-" + name), dur);
    }
    scheduleIdle(dur + 1500 + Math.random() * 3500);
  }
  function land() {
    dove.classList.remove("settle"); void dove.offsetWidth; dove.classList.add("settle");
    setTimeout(() => dove.classList.remove("settle"), 520);
    scheduleIdle();
  }

  // ----- speech bubble -----
  function placeBubble() {
    const bw = bubble.offsetWidth, bh = bubble.offsetHeight, dh = dove.offsetHeight;
    const left = clamp(pos.x - bw / 2, 12, innerWidth - bw - 12);
    let top = pos.y - dh - bh - 14, below = false;
    if (top < 10) { top = pos.y + 16; below = true; }
    top = Math.min(top, innerHeight - bh - 10);
    bubble.style.transform = `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px)`;
    bubble.style.setProperty("--ax", clamp(pos.x - left, 20, bw - 20).toFixed(1) + "px");
    bubble.classList.toggle("below", below);
    // the resting hint follows the branch, so hide it when the branch has scrolled away
    const onScreen = pos.y - dh > 70 && pos.y < innerHeight - 8;
    bubble.style.visibility = hintOn && !onScreen ? "hidden" : "visible";
  }
  function makeBtn(label, cls, fn) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "btn " + cls; b.textContent = label;
    b.addEventListener("click", fn);
    return b;
  }
  function showBubble({ title = "", text, actions = [], role = "status", hint = false }) {
    hintOn = hint;
    bubble.classList.toggle("hint", hint);
    bTitle.textContent = title; bTitle.hidden = !title;
    bText.textContent = text;
    bActions.replaceChildren(...actions);
    bubble.setAttribute("role", role);
    bubble.hidden = false;
    placeBubble();
  }
  const hideBubble = () => { hintOn = false; bubble.hidden = true; bubble.classList.remove("hint"); bubble.style.visibility = ""; };
  const showHint = () => { if (!touring) showBubble({ text: HINT, hint: true }); };

  // ----- guided tour -----
  function showStop(i) {
    const last = i === stops.length - 1;
    const title = last ? "Let's talk" : stops[i].querySelector("h3").textContent;
    const next = makeBtn(last ? "Close" : "Next", "btn-ink", () => (last ? endTour() : tourGo(i + 1)));
    const actions = last ? [next] : [next, makeBtn("End tour", "", endTour)];
    showBubble({ title, text: LINES[i], actions, role: "dialog" });
    // If the bubble would cover the card, scroll the page up a little to make room.
    const need = bubble.offsetHeight + dove.offsetHeight + 28;
    const gap = need - stops[i].getBoundingClientRect().top;
    if (gap > 0 && scrollY > 0) scrollBy({ top: -gap, behavior: reduceQ.matches ? "auto" : "smooth" });
    next.focus({ preventScroll: true });
  }

  function tourGo(i) {
    hideBubble();
    stops.forEach(s => s.classList.toggle("tour-on", s === stops[i]));
    // Leave room above the card for the bird and its speech bubble.
    const target = cardPerch(stops[i]);
    const arrive = () => { perch = target; showStop(i); land(); };
    if (reduceQ.matches) { scrollTo({ top: cardCam(stops[i])(), left: 0, behavior: "instant" }); leg = null; perch = null; Object.assign(pos, target.get()); arrive(); }
    else startLeg(target.get, flight(target.get(), 0.22, 1500, 3300), arrive, cardCam(stops[i]));
  }

  function flyHome(follow) {
    hideBubble();
    const arrive = () => { perch = homePerch; facing = -1; bounceBranch(); land(); showHint(); };
    if (reduceQ.matches) { leg = null; Object.assign(pos, homePoint()); perch = homePerch; showHint(); return; }
    startLeg(homePoint, flight(homePoint(), 0.2, 1300, 3200), arrive, follow ? homeCam : null);
  }

  function startTour() {
    if (touring || !stops.length) return;
    touring = true;
    tourGo(0);
  }
  function endTour() {
    touring = false;
    stops.forEach(s => s.classList.remove("tour-on"));
    dove.focus({ preventScroll: true });
    flyHome(true);
  }
  dove.addEventListener("click", () => { if (heldPoop) { heldPoop = false; return; } startTour(); });
  dove.addEventListener("contextmenu", e => e.preventDefault());
  bubble.addEventListener("click", () => { if (hintOn) startTour(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && touring) endTour(); });

  // ----- secret: the falcon drops a present. Long-press it for a second, or type "poop" anywhere. -----
  const SOLID = ".card, .panel, .contact, .stickers li, .badge, .stack, .btn";
  const splats = [];
  let heldPoop = false, lastDrop = 0, holdTimer = null, typed = "";

  function splat(x, y) {
    const el = document.createElement("div");
    el.className = "poop-splat"; el.setAttribute("aria-hidden", "true");
    el.style.left = (x + scrollX).toFixed(1) + "px"; el.style.top = (y + scrollY).toFixed(1) + "px";
    el.innerHTML = "<i></i><b>plop!</b>";
    document.body.appendChild(el);
    splats.push(el);
    if (splats.length > 6) splats.shift().remove();
    setTimeout(() => el.classList.add("gone"), 6500);
    setTimeout(() => { el.remove(); const i = splats.indexOf(el); if (i > -1) splats.splice(i, 1); }, 7800);
  }

  function dropPoop() {
    const now = performance.now();
    if (now - lastDrop < 700) return;
    const onScreen = pos.x > 0 && pos.x < innerWidth && pos.y > 0 && pos.y < innerHeight + dove.offsetHeight;
    if (!onScreen) return;
    lastDrop = now;
    const x = pos.x - facing * dove.offsetWidth * 0.28;       // out the back
    const y0 = pos.y - dove.offsetHeight * 0.3;
    let land = innerHeight - 12;                              // the ground, unless something is in the way
    document.querySelectorAll(SOLID).forEach(el => {
      if (el.closest(".bubble")) return;
      const r = el.getBoundingClientRect();
      if (r.width && x >= r.left + 4 && x <= r.right - 4 && r.top >= y0 && r.top < land) land = r.top;
    });
    land = Math.max(land, y0 + 20);
    if (!perch || leg) { /* mid-flight: no reaction */ } else {
      dove.classList.add("act-wag"); setTimeout(() => dove.classList.remove("act-wag"), 900);
    }
    if (reduceQ.matches) { splat(x, land); return; }
    const drop = document.createElement("div");
    drop.className = "poop-drop"; drop.setAttribute("aria-hidden", "true");
    drop.style.left = x.toFixed(1) + "px"; drop.style.top = y0.toFixed(1) + "px";
    document.body.appendChild(drop);
    const d = land - y0;
    const fall = drop.animate([{ transform: "translateY(0)" }, { transform: `translateY(${d}px)` }],
      { duration: Math.sqrt(2 * d / 2400) * 1000, easing: "cubic-bezier(.45, 0, .85, .5)", fill: "forwards" });
    fall.onfinish = () => { drop.remove(); splat(x, land); };
  }

  const cancelHold = () => clearTimeout(holdTimer);
  dove.addEventListener("pointerdown", e => {
    if (e.button) return;
    heldPoop = false; cancelHold();
    const sx = e.clientX, sy = e.clientY;
    holdTimer = setTimeout(() => { heldPoop = true; dropPoop(); }, 1000);
    const move = ev => { if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 10) cancelHold(); };
    dove.addEventListener("pointermove", move);
    const up = () => { cancelHold(); dove.removeEventListener("pointermove", move); setTimeout(() => { heldPoop = false; }, 400); };
    dove.addEventListener("pointerup", up, { once: true });
    dove.addEventListener("pointercancel", up, { once: true });
    dove.addEventListener("pointerleave", cancelHold, { once: true });
  });
  document.addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    typed = (typed + e.key.toLowerCase()).slice(-4);
    if (typed === "poop") { typed = ""; dropPoop(); }
  });

  // ----- frame loop -----
  function render() {
    const landed = reduceQ.matches || (!leg && !!perch);
    dove.style.transform = `translate3d(${(pos.x - dove.offsetWidth / 2).toFixed(1)}px, ${(pos.y - dove.offsetHeight).toFixed(1)}px, 0) rotate(${tilt.toFixed(1)}deg) scale(${(landed ? 1 : scale).toFixed(3)})`;
    dove.style.setProperty("--dir", facing);
    dove.classList.toggle("landed", landed);
  }

  function tick(now) {
    if (leg) {
      if (now < leg.t0) {
        // crouching on the perch: stay glued to it while the page moves
        if (leg.fromFn) Object.assign(pos, leg.fromFn());
        tilt *= 0.85;
      } else {
        if (!leg.c) {
          leg.from = { x: pos.x, y: pos.y }; leg.c = curve(leg.from, leg.toFn());
          if (leg.camFn) { leg.camFrom = scrollY; leg.camTo = leg.camFn(); }
        }
        const p = Math.min(1, (now - leg.t0) / leg.dur);
        const e = -(Math.cos(Math.PI * p) - 1) / 2;          // slow start, slow finish
        const to = leg.toFn(), u = 1 - e;
        const nx = u * u * leg.from.x + 2 * u * e * leg.c.x + e * e * to.x;
        const ny = u * u * leg.from.y + 2 * u * e * leg.c.y + e * e * to.y;
        if (leg.camTo !== null) scrollTo({ top: leg.camFrom + (leg.camTo - leg.camFrom) * e, left: 0, behavior: "instant" });
        const vx = nx - pos.x, vy = ny - pos.y;
        if (Math.abs(vx) > 0.15) facing = vx > 0 ? 1 : -1;
        // nose follows the climb or dive, then flares up just before touching down
        const target = p > 0.8 ? -24 * facing : clamp(vy * 4 * facing, -14, 14);
        tilt += (target - tilt) * 0.08;
        pos.x = nx; pos.y = ny;
        scale = 1 + 0.12 * Math.sin(now / 2600) * Math.min(1, p * 4, (1 - p) * 4);   // drifts nearer and farther
        if (p >= 1) { const done = leg.onArrive; leg = null; if (done) done(); }
      }
    } else if (perch) {
      Object.assign(pos, perch.get());
      tilt *= 0.85;
    }
    render();
    if (!bubble.hidden) placeBubble();
    requestAnimationFrame(tick);
  }

  render();
  requestAnimationFrame(tick);
  // Fly in from the right edge and land on the branch.
  setTimeout(() => {
    if (touring || leg || perch) return;
    if (!reduceQ.matches) Object.assign(pos, { x: innerWidth + 110, y: Math.max(90, homePoint().y - 160) });
    flyHome();
  }, 1600);   // after the load curtain has rolled away
})();


// ---------- Motion layer: intros, scroll reveals, hover physics, particles ----------
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const COLORS = ["#ffe11a", "#ff63b8", "#00d1f0", "#05e06a", "#ff8a00", "#be7bff"];

  // remove the load curtain once it has rolled away
  const curtain = $(".curtain");
  if (curtain) setTimeout(() => curtain.remove(), 2100);

  // ----- scroll progress bar + nav scroll-spy (these don't move anything, so they run for everyone) -----
  const bar = document.createElement("div");
  bar.className = "progress"; bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  const links = $$('nav a[href^="#"]');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty("--p", max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
    if (scrollY < 200) links.forEach(a => a.classList.remove("on"));
  };
  addEventListener("scroll", updateProgress, { passive: true });
  addEventListener("resize", updateProgress);
  updateProgress();
  const secs = links.map(a => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window && secs.length) {
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && scrollY >= 200) links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-40% 0px -50% 0px" });
    secs.forEach(s => spy.observe(s));
  }

  if (reduce) return;                       // everything below is motion
  document.documentElement.classList.add("js");

  // ----- particle layer -----
  const fx = document.createElement("div");
  fx.className = "fx-layer"; fx.setAttribute("aria-hidden", "true");
  document.body.appendChild(fx);

  function burst(x, y, n = 8) {
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i");
      const s = rand(6, 11);
      p.className = "fx-p";
      p.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px;background:${COLORS[i % COLORS.length]};border-radius:${Math.random() < 0.35 ? "50%" : "0"}`;
      fx.appendChild(p);
      const a = rand(0, Math.PI * 2), v = rand(40, 110), dx = Math.cos(a) * v, dy = Math.sin(a) * v, rot = rand(-260, 260);
      p.animate([
        { transform: "translate(-50%,-50%) scale(1) rotate(0deg)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${rot}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(calc(-50% + ${dx * 1.15}px), calc(-50% + ${dy + 90}px)) scale(.4) rotate(${rot * 2}deg)`, opacity: 0 }
      ], { duration: rand(650, 1100), easing: "cubic-bezier(.2,.7,.4,1)" }).onfinish = () => p.remove();
    }
  }
  document.addEventListener("click", e => { if (e.detail > 0) burst(e.clientX, e.clientY, 7); });
  const copy = $("#copy");
  if (copy) copy.addEventListener("click", () => { const r = copy.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 22); });

  // leaves that shake loose from the falcon's branch
  function spawnLeaf(source) {
    if (document.hidden) return;
    const leaves = $$("#branch .leaf");
    if (!leaves.length) return;
    const r = (source || leaves[Math.floor(Math.random() * leaves.length)]).getBoundingClientRect();
    if (r.bottom < 80 || r.top > innerHeight - 60) return;           // branch is off screen
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const el = document.createElement("div");
    el.className = "fx-leaf";
    el.style.cssText = `left:${x}px;top:${y}px`;
    el.innerHTML = `<svg width="26" height="16" viewBox="-2 -12 32 24" aria-hidden="true"><path d="M0 0 C7 -11 21 -11 28 0 C21 11 7 11 0 0 Z" fill="${["#05e06a", "#9cf06a", "#ffe11a"][Math.floor(Math.random() * 3)]}" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
    fx.appendChild(el);
    const fall = innerHeight - y + 30, drift = rand(-140, 60), amp = rand(25, 55), swings = rand(2, 3.2), steps = 14, frames = [];
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      frames.push({
        transform: `translate(${(drift * t + Math.sin(t * Math.PI * 2 * swings) * amp).toFixed(1)}px, ${(fall * t * t * 0.4 + fall * t * 0.6).toFixed(1)}px) rotate(${(Math.sin(t * Math.PI * 2 * swings + 1) * 70).toFixed(1)}deg)`,
        opacity: t < 0.85 ? 1 : (1 - t) / 0.15
      });
    }
    el.animate(frames, { duration: rand(3800, 5200), easing: "linear" }).onfinish = () => el.remove();
  }
  document.addEventListener("branch-bounce", () => { spawnLeaf(); setTimeout(spawnLeaf, 160); setTimeout(spawnLeaf, 340); setTimeout(spawnLeaf, 520); });
  setInterval(spawnLeaf, 3500);
  setInterval(() => { if (Math.random() < 0.5) spawnLeaf(); }, 5000);   // the occasional extra leaf

  // ----- hero headline: split into words so they can slam in one by one -----
  const h1 = $(".hero h1");
  if (h1) {
    let i = 0;
    const wrap = text => {
      const f = document.createDocumentFragment();
      text.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { f.appendChild(document.createTextNode(" ")); return; }
        const s = document.createElement("span");
        s.className = "wi"; s.style.setProperty("--i", i++); s.textContent = part;
        s.addEventListener("pointerenter", () => {
          if (s._w) return;
          s._w = s.animate([{ rotate: "0deg", translate: "0 0" }, { rotate: "-7deg", translate: "0 -.18em" }, { rotate: "4deg", translate: "0 0" }, { rotate: "0deg", translate: "0 0" }], { duration: 560, easing: "ease-out" });
          s._w.onfinish = () => { s._w = null; };
        });
        f.appendChild(s);
      });
      return f;
    };
    [...h1.childNodes].forEach(n => {
      if (n.nodeType === 3) n.replaceWith(wrap(n.textContent));
      else if (n.nodeType === 1) { const t = n.textContent; n.textContent = ""; n.appendChild(wrap(t)); }
    });
  }

  // ----- brand name: each tile is a little pendulum on a string -----
  (() => {
    const brand = $(".brand"), hs = $$(".hang");
    if (!brand || !hs.length) return;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const P = hs.map((h, i) => {
      const len = parseFloat(getComputedStyle(h).getPropertyValue("--len")) || 30;
      return { h, t: $(".tile", h), a: 0, v: 0, k: 1100 / (len + 20), ph: i * 0.7, x: 0, y: 0 };   // longer string = slower swing
    });
    const measure = () => P.forEach(p => { const r = p.t.getBoundingClientRect(); p.x = r.left + r.width / 2; p.y = r.top + r.height / 2; });

    // the pointer pushes tiles it brushes past, in the direction it is moving
    let lx = null, lt = 0;
    addEventListener("pointermove", e => {
      const now = performance.now(), br = brand.getBoundingClientRect();
      if (lx !== null && e.clientY > br.top - 70 && e.clientY < br.bottom + 70) {
        const vx = clamp((e.clientX - lx) / Math.max(8, now - lt) * 1000, -1800, 1800);
        measure();
        P.forEach(p => { const d = Math.hypot(e.clientX - p.x, e.clientY - p.y); if (d < 70) p.v -= vx * 0.045 * (1 - d / 70); });
      }
      lx = e.clientX; lt = now;
    }, { passive: true });

    // clicking the name sends a wave left to right
    brand.addEventListener("click", () => P.forEach((p, i) => setTimeout(() => { p.v -= 320; }, i * 55)));

    let last = performance.now();
    const tick = now => {
      const dt = Math.min(0.033, (now - last) / 1000), t = now / 1000; last = now;
      P.forEach((p, i) => {
        const l = P[i - 1] ? P[i - 1].a : p.a, r = P[i + 1] ? P[i + 1].a : p.a;
        const acc = -p.k * p.a - 1.3 * p.v + 0.3 * p.k * (l + r - 2 * p.a) + p.k * 1.6 * Math.sin(t * 0.9 + p.ph);   // gravity, drag, neighbours, breeze
        p.v += acc * dt; p.a = clamp(p.a + p.v * dt, -75, 75);
        p.h.style.rotate = p.a.toFixed(2) + "deg";
        p.t.style.rotate = clamp(-p.v * 0.05, -14, 14).toFixed(2) + "deg";            // tile lags a little behind its string
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  })();

  // ----- scroll reveals -----
  const REVEALS = [
    [".work h2", "rv-up"], [".projects .card", "rv-up"], [".stack", "rv-grow"],
    [".proof h2", "rv-up"], [".stickers li", "rv-slap"], [".proof > p", "rv-up"],
    [".about h2", "rv-up"], [".about-grid .panel:nth-child(1)", "rv-left"], [".about-grid .panel:nth-child(2)", "rv-right"], [".panel li", "rv-left"],
    [".contact", "rv-grow"], [".contact h2", "rv-up"], [".contact > p:not(.social)", "rv-up"], [".contact .actions", "rv-up"], [".social", "rv-up"]
  ];
  function countUp(li) {
    const s = $("strong", li);
    const m = s && s.textContent.trim().match(/^(\d+)(.*)$/);
    if (!m) return;
    const end = +m[1], suffix = m[2], t0 = performance.now() + 350 + (parseFloat(li.style.getPropertyValue("--d")) || 0) * 1000;
    s.style.minWidth = s.offsetWidth + "px";
    s.textContent = "0" + suffix;
    const step = now => {
      const p = Math.max(0, Math.min(1, (now - t0) / 1100));
      s.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step); else s.style.minWidth = "";
    };
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => {
      es.filter(e => e.isIntersecting).forEach((e, i) => {
        e.target.style.setProperty("--d", (i * 0.12).toFixed(2));
        e.target.classList.add("in");
        io.unobserve(e.target);
        if (e.target.matches(".stickers li")) countUp(e.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    REVEALS.forEach(([sel, cls]) => $$(sel).forEach(el => { el.classList.add("reveal", cls); io.observe(el); }));
  }

  // ----- card glare + parallax, magnetic buttons (mouse only) -----
  if (fine) {
    $$(".card, .panel, .contact").forEach(c => {
      c.addEventListener("pointermove", e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty("--mx", ((x - 0.5) * 2).toFixed(2)); c.style.setProperty("--my", ((y - 0.5) * 2).toFixed(2));
        c.style.setProperty("--gx", (x * 100).toFixed(1)); c.style.setProperty("--gy", (y * 100).toFixed(1));
      });
      c.addEventListener("pointerleave", () => { c.style.setProperty("--mx", 0); c.style.setProperty("--my", 0); });
    });
    $$(".actions .btn").forEach(b => {
      b.addEventListener("pointermove", e => {
        const r = b.getBoundingClientRect();
        b.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px`;
      });
      b.addEventListener("pointerleave", () => { b.style.translate = ""; });
    });
  }
})();

// ---------- Skill side animations: each skill gets its own scene on the left + right of the black strip ----------
(() => {
  const L = document.querySelector(".fx-left"), R = document.querySelector(".fx-right");
  if (!L || !R || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // ----- tiny helpers -----
  let timers = [], leaveT = 0;
  const ctx = {
    every(fn, ms) { timers.push(["i", setInterval(fn, ms)]); },
    after(fn, ms) { timers.push(["t", setTimeout(fn, ms)]); }
  };
  const clearAll = () => { timers.forEach(([k, t]) => (k === "i" ? clearInterval(t) : clearTimeout(t))); timers = []; };
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  // mini syntax markup: <k>keyword</k> <s>string</s> ... -> [char, class] pairs
  const parse = src => {
    const out = []; let cls = "";
    src.split(/(<\/?[a-z]>)/).forEach(p => {
      const m = p.match(/^<(\/)?([a-z])>$/);
      if (m) cls = m[1] ? "" : m[2]; else for (const ch of p) out.push([ch, cls]);
    });
    return out;
  };
  // types the code into a <pre>, holds, then starts again
  function typer(el, src, speed = 30, hold = 1500) {
    const chars = parse(src); let k = 0, waiting = false;
    const draw = () => {
      let h = "", cur = "";
      for (let i = 0; i < k; i++) {
        const [ch, c] = chars[i];
        if (c !== cur) { if (cur) h += "</span>"; if (c) h += `<span class="${c}">`; cur = c; }
        h += esc(ch);
      }
      if (cur) h += "</span>";
      el.innerHTML = h + '<i class="caret"></i>';
    };
    draw();
    ctx.every(() => {
      if (waiting) return;
      if (k < chars.length) { k++; draw(); }
      else { waiting = true; ctx.after(() => { k = 0; waiting = false; }, hold); }
    }, speed);
  }
  // adds .on to items one after another, holds, clears them, repeats
  function sequence(items, gap, hold, onStep) {
    items = [...items];
    const run = () => {
      items.forEach((it, i) => ctx.after(() => { it.classList.add("on"); if (onStep) onStep(i + 1); }, i * gap));
      ctx.after(() => { items.forEach(it => it.classList.remove("on")); if (onStep) onStep(0); }, items.length * gap + hold);
    };
    run(); ctx.every(run, items.length * gap + hold + 600);
  }
  const win = (title, a) => `<div class="fx-win" style="--a:${a}"><div class="fx-bar"><b></b><b></b><b></b><span>${title}</span></div><pre class="fx-code"></pre></div>`;
  const svg = (inner, cls = "") => `<svg class="fx-svg ${cls}" viewBox="0 0 200 280" aria-hidden="true">${inner}</svg>`;
  const box = (x, y, w, h, t, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#0d0d0d" stroke="${c}" stroke-width="2"/><text class="fx-t fx-c" x="${x + w / 2}" y="${y + h / 2 + 3.5}">${t}</text>`;
  const packet = (path, color, begin, dur = 3) => `<circle r="4.5" fill="${color}"><animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite" path="${path}"/></circle>`;
  const line = d => `<path d="${d}" fill="none" stroke="#3a3a3a" stroke-width="2"/>`;

  // ================= scenes (same order as WORDS) =================

  // ---- Java: code typing + coffee cup ----
  const JAVA = '<k>public class</k> <t>App</t> {\n  <k>void</k> <f>main</f>() {\n    <k>var</k> msg = <s>"Hello"</s>;\n    <f>print</f>(msg + <s>"!"</s>);\n  }\n}';
  const java = {
    l: win("App.java", "#ff8a00"),
    r: svg(`
      <g fill="none" stroke="#fffbe6" stroke-width="5" stroke-linecap="round">
        <path class="fx-steam" style="--d:0s"  d="M78 118 C66 98 90 88 78 66 C70 52 84 44 78 28"/>
        <path class="fx-steam" style="--d:.8s" d="M102 118 C90 96 114 86 102 62 C94 48 108 38 102 20"/>
        <path class="fx-steam" style="--d:1.6s" d="M126 118 C114 98 138 88 126 66 C118 52 132 44 126 28"/>
      </g>
      <path d="M150 150 C186 146 186 196 148 198" fill="none" stroke="#ff8a00" stroke-width="10" stroke-linecap="round"/>
      <path d="M50 134 H150 V180 C150 210 128 228 100 228 C72 228 50 210 50 180 Z" fill="#ff8a00" stroke="#000" stroke-width="3"/>
      <ellipse cx="100" cy="134" rx="50" ry="9" fill="#5e3416" stroke="#000" stroke-width="3"/>
      <text x="100" y="188" text-anchor="middle" font-size="22" font-weight="800" fill="#000" font-family="Bricolage Grotesque, sans-serif">JAVA</text>
      <ellipse cx="100" cy="236" rx="72" ry="10" fill="#ffe11a" stroke="#000" stroke-width="3"/>
      <text class="fx-t fx-c" x="100" y="268">0xCAFEBABE</text>`),
    run: l => typer(l.querySelector(".fx-code"), JAVA, 28, 1500)
  };

  // ---- Node.js: event loop + server log ----
  const NODE = '<n>$</n> node server.js\n<c>listening on :3000</c>\n<t>GET</t>  /users   <s>200</s>\n<t>POST</t> /login   <s>201</s>\n<t>GET</t>  /issues  <s>200</s>';
  const node = {
    l: svg(`
      <g transform="translate(100 118)">
        <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite"/>
          <circle r="64" fill="none" stroke="#00d1f0" stroke-width="3" stroke-dasharray="6 9"/>
          <circle cx="64" cy="0" r="7" fill="#ffe11a"/><circle cx="-32" cy="55.4" r="7" fill="#ff63b8"/><circle cx="-32" cy="-55.4" r="7" fill="#be7bff"/>
        </g>
        <g><animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="9s" repeatCount="indefinite"/>
          <circle r="46" fill="none" stroke="#3a3a3a" stroke-width="2" stroke-dasharray="3 7"/>
          <circle cx="46" cy="0" r="4" fill="#05e06a"/>
        </g>
        <polygon class="fx-pulse" points="0,-34 29,-17 29,17 0,34 -29,17 -29,-17" fill="#05e06a" stroke="#000" stroke-width="3"/>
        <text y="7" text-anchor="middle" font-size="20" font-weight="800" fill="#000" font-family="DM Mono, monospace">JS</text>
      </g>
      <text class="fx-t fx-c" x="100" y="232">event loop</text>
      <text class="fx-t fx-c fx-dim" x="100" y="250">non-blocking I/O</text>`),
    r: win("server.js", "#05e06a"),
    run: (l, r) => typer(r.querySelector(".fx-code"), NODE, 26, 1500)
  };

  // ---- React: atom + component tree re-rendering ----
  const TREE = [
    { k: "App",  x: 64,  y: 34,  w: 72, d: 0 },
    { k: "Nav",  x: 2,   y: 100, w: 58, d: 1, p: 0 },
    { k: "List", x: 71,  y: 100, w: 58, d: 1, p: 0 },
    { k: "Foot", x: 140, y: 100, w: 58, d: 1, p: 0 },
    { k: "Item", x: 40,  y: 166, w: 50, d: 2, p: 2 },
    { k: "Item", x: 110, y: 166, w: 50, d: 2, p: 2 },
    { k: "Btn",  x: 40,  y: 224, w: 50, d: 3, p: 4 }
  ];
  const react = {
    l: svg(`
      <g transform="translate(100 112)">
        <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="16s" repeatCount="indefinite"/>
          ${[0, 60, 120].map((a, i) => `<g transform="rotate(${a})"><ellipse rx="80" ry="30" fill="none" stroke="#00d1f0" stroke-width="5"/>
            <circle r="6" fill="${["#ffe11a", "#ff63b8", "#05e06a"][i]}"><animateMotion dur="${2.4 + i * .5}s" repeatCount="indefinite" path="M-80 0 a80 30 0 1 0 160 0 a80 30 0 1 0 -160 0"/></circle></g>`).join("")}
        </g>
        <circle class="fx-pulse" r="12" fill="#00d1f0"/>
      </g>
      <text class="fx-t fx-c" x="100" y="226">&lt;App /&gt;</text>
      <text class="fx-t fx-c fx-dim" x="100" y="244">component-based UI</text>`),
    r: svg(`
      <text class="fx-t fx-c fx-cnt" x="100" y="16">count = 0</text>
      ${TREE.filter(n => n.p !== undefined).map(n => { const p = TREE[n.p]; return line(`M${p.x + p.w / 2} ${p.y + 24} L${n.x + n.w / 2} ${n.y}`); }).join("")}
      ${TREE.map(n => `<g class="fx-rr" style="--d:${n.d * .2}s"><rect x="${n.x}" y="${n.y}" width="${n.w}" height="24" rx="5"/><text class="fx-t fx-c" x="${n.x + n.w / 2}" y="${n.y + 16}">${n.k}</text></g>`).join("")}
      <text class="fx-t fx-c fx-dim" x="100" y="268">setState() → re-render</text>`),
    run: (l, r) => {
      const s = r.querySelector("svg"), cnt = r.querySelector(".fx-cnt"); let n = 0;
      const fire = () => { s.classList.remove("go"); void s.getBoundingClientRect(); s.classList.add("go"); cnt.textContent = "count = " + (++n); };
      ctx.after(fire, 500); ctx.every(fire, 1700);
    }
  };

  // ---- MySQL: SQL typing + table scan ----
  const SQL = '<k>SELECT</k> name, skill\n<k>FROM</k> devs\n<k>WHERE</k> id = <n>7</n>\n<k>LIMIT</k> <n>1</n>;\n<c>-- 1 row in set</c>';
  const ROWS = [["1", "ana", "node"], ["2", "raj", "go"], ["3", "mia", "react"], ["4", "lee", "sql"], ["5", "zoe", "rust"], ["6", "kai", "c++"], ["7", "vansh", "java"]];
  const mysql = {
    l: win("query.sql", "#ffe11a"),
    r: svg(`
      <path d="M70 16 V50 C70 61 130 61 130 50 V16 Z" fill="#ffe11a" stroke="#fffbe6" stroke-width="2"/>
      <ellipse cx="100" cy="16" rx="30" ry="9" fill="#fff3a0" stroke="#fffbe6" stroke-width="2"/>
      <path d="M70 33 C70 44 130 44 130 33" fill="none" stroke="#000" stroke-width="2" opacity=".5"/>
      <rect x="8" y="70" width="184" height="22" fill="#ffe11a"/>
      <text class="fx-t" x="16" y="85" style="fill:#000;font-weight:800">id</text><text class="fx-t" x="44" y="85" style="fill:#000;font-weight:800">name</text><text class="fx-t" x="120" y="85" style="fill:#000;font-weight:800">skill</text>
      ${ROWS.map((c, i) => `<rect class="fx-row" x="8" y="${92 + i * 24}" width="184" height="24"/>
        <path d="M8 ${116 + i * 24} H192" stroke="#2c2c2c" stroke-width="1"/>
        <text class="fx-t" x="16" y="${108 + i * 24}">${c[0]}</text><text class="fx-t" x="44" y="${108 + i * 24}">${c[1]}</text><text class="fx-t" x="120" y="${108 + i * 24}">${c[2]}</text>`).join("")}
      <rect class="fx-scan" x="8" y="92" width="184" height="24" fill="rgba(0,209,240,.22)" stroke="#00d1f0" stroke-width="1.5"/>
      <rect x="8" y="70" width="184" height="190" fill="none" stroke="#ffe11a" stroke-width="2"/>`),
    run: (l, r) => {
      typer(l.querySelector(".fx-code"), SQL, 36, 1600);
      const scan = r.querySelector(".fx-scan"), rows = [...r.querySelectorAll(".fx-row")]; let i = 0;
      ctx.every(() => {
        const p = Math.min(i, 6);
        scan.style.transform = `translateY(${p * 24}px)`;
        rows[6].classList.toggle("hit", i >= 6 && i < 11);
        i = (i + 1) % 12;
      }, 380);
    }
  };

  // ---- MongoDB: JSON typing + documents dropping into a collection ----
  const JSON_SRC = '{\n  <t>"_id"</t>: <n>7</n>,\n  <t>"name"</t>: <s>"Vansh"</s>,\n  <t>"stack"</t>: [\n    <s>"node"</s>, <s>"react"</s>\n  ]\n}';
  const DOC_COL = ["#05e06a", "#ffe11a", "#00d1f0", "#ff63b8"];
  const mongo = {
    l: win("doc.json", "#05e06a"),
    r: svg(`
      <g class="fx-sway">
        <path d="M100 8 C142 36 146 84 100 108 C54 84 58 36 100 8 Z" fill="#05e06a" stroke="#000" stroke-width="3"/>
        <path d="M100 18 V124" stroke="#000" stroke-width="3" stroke-linecap="round"/>
      </g>
      ${DOC_COL.map((c, i) => `<g class="fx-doc"><rect x="16" y="${134 + i * 33}" width="168" height="28" rx="4" fill="#0d0d0d" stroke="${c}" stroke-width="2"/>
        <rect x="16" y="${134 + i * 33}" width="8" height="28" fill="${c}"/>
        <text class="fx-t" x="34" y="${152 + i * 33}">{ _id: ${i + 1} }</text></g>`).join("")}`),
    run: (l, r) => {
      typer(l.querySelector(".fx-code"), JSON_SRC, 30, 1500);
      sequence(r.querySelectorAll(".fx-doc"), 520, 1400);
    }
  };

  // ---- Docker: containers loaded onto a whale + Kubernetes helm wheel and scaling pods ----
  const CT = ["#ff63b8", "#ffe11a", "#05e06a", "#be7bff", "#ff8a00", "#00d1f0"];
  let ci = 0;
  const boxes = [[4, 18, 166], [3, 38, 142], [2, 58, 118]].map(([n, x0, y]) =>
    [...Array(n)].map((_, i) => { const x = x0 + i * 40, c = CT[ci++ % CT.length];
      return `<g class="fx-box"><rect x="${x}" y="${y}" width="38" height="24" fill="${c}" stroke="#000" stroke-width="2"/><path d="M${x + 10} ${y + 3} V${y + 21} M${x + 19} ${y + 3} V${y + 21} M${x + 28} ${y + 3} V${y + 21}" stroke="#000" stroke-width="2" opacity=".35"/></g>`; }).join("")).join("");
  const spokes = [...Array(7)].map((_, i) => { const a = (i * 360 / 7 - 90) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return `<path d="M0 0 L${(c * 40).toFixed(1)} ${(s * 40).toFixed(1)}" stroke="#00d1f0" stroke-width="4"/><circle cx="${(c * 44).toFixed(1)}" cy="${(s * 44).toFixed(1)}" r="6" fill="#00d1f0"/>`; }).join("");
  const pods = [...Array(6)].map((_, i) => { const x = 6 + (i % 3) * 67, y = 156 + Math.floor(i / 3) * 52;
    return `<g class="fx-pod"><rect x="${x}" y="${y}" width="58" height="42" rx="6" fill="#0d0d0d" stroke="#00d1f0" stroke-width="2"/>
      <circle class="fx-ok-dot" cx="${x + 11}" cy="${y + 13}" r="4" fill="#05e06a"/><text class="fx-t" x="${x + 20}" y="${y + 17}" style="font-size:10px">pod-${i + 1}</text>
      <text class="fx-t fx-dim" x="${x + 8}" y="${y + 33}" style="font-size:9px">Running</text></g>`; }).join("");
  const wave = "M-40 244 " + "q10 -8 20 0 t20 0 ".repeat(14);
  const docker = {
    l: svg(`
      <g class="fx-bob">
        ${boxes}
        <path d="M6 190 H176 C176 226 140 246 92 246 C44 246 14 226 6 190 Z" fill="#00d1f0" stroke="#000" stroke-width="3"/>
        <path d="M176 198 C190 198 196 186 193 174 C202 186 202 206 180 216 Z" fill="#00d1f0" stroke="#000" stroke-width="3"/>
        <circle cx="30" cy="212" r="3.5" fill="#000"/>
      </g>
      <path class="fx-wave" d="${wave}" fill="none" stroke="#fffbe6" stroke-width="3" stroke-linecap="round" opacity=".9"/>
      <text class="fx-t fx-c" x="100" y="272">docker compose up</text>`),
    r: svg(`
      <g transform="translate(100 58)"><g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="16s" repeatCount="indefinite"/>
        <circle r="30" fill="none" stroke="#00d1f0" stroke-width="6"/>${spokes}</g><circle r="8" fill="#00d1f0"/><circle r="3" fill="#000"/></g>
      <text class="fx-t fx-c" x="100" y="128">kubectl scale --replicas=6</text>
      <text class="fx-t fx-c fx-rep" x="100" y="144" style="fill:#ffe11a">replicas: 0/6</text>
      ${pods}`),
    run: (l, r) => {
      sequence(l.querySelectorAll(".fx-box"), 260, 1500);
      const lab = r.querySelector(".fx-rep");
      sequence(r.querySelectorAll(".fx-pod"), 450, 1500, n => { lab.textContent = `replicas: ${n}/6`; });
    }
  };

  // ---- System design: request flow through a load balancer + cache / queue / DB ----
  const sysL = {
    paths: ["M100 36 V100 L34 140 V168 L100 230", "M100 36 V230", "M100 36 V100 L166 140 V168 L100 230"],
    html: svg(`
      ${["M100 36 V72", "M100 100 L34 140", "M100 100 V140", "M100 100 L166 140", "M34 168 L100 230", "M100 168 V230", "M166 168 L100 230"].map(line).join("")}
      ${packet("M100 36 V100 L34 140 V168 L100 230", "#ff63b8", 0)}${packet("M100 36 V230", "#ffe11a", 1)}${packet("M100 36 V100 L166 140 V168 L100 230", "#00d1f0", 2)}
      ${box(65, 8, 70, 28, "client", "#ff63b8")}${box(65, 72, 70, 28, "load bal.", "#ff63b8")}
      ${box(8, 140, 52, 28, "app", "#ff63b8")}${box(74, 140, 52, 28, "app", "#ff63b8")}${box(140, 140, 52, 28, "app", "#ff63b8")}
      ${box(65, 230, 70, 28, "DB", "#ff63b8")}
      <text class="fx-t fx-c fx-dim" x="100" y="276">scale out</text>`)
  };
  const system = {
    l: sysL.html,
    r: svg(`
      ${["M100 36 L46 90", "M100 36 L154 90", "M46 118 L100 226", "M154 118 V160", "M154 188 L100 226"].map(line).join("")}
      ${packet("M100 36 L46 90 V118 L100 226", "#00d1f0", 0)}${packet("M100 36 L46 90 V118 L100 226", "#00d1f0", 1.5)}
      ${packet("M100 36 L154 90 V188 L100 226", "#ffe11a", .75)}${packet("M100 36 L154 90 V188 L100 226", "#ffe11a", 2.25)}
      ${box(65, 8, 70, 28, "API", "#be7bff")}${box(8, 90, 76, 28, "cache", "#be7bff")}${box(116, 90, 76, 28, "queue", "#be7bff")}
      ${box(116, 160, 76, 28, "worker", "#be7bff")}${box(62, 226, 76, 28, "DB", "#be7bff")}
      <text class="fx-t fx-c fx-dim" x="100" y="276">fast path · async path</text>`)
  };

  // ---- DSA: bubble sort bars + in-order tree traversal ----
  const NODES = [[100, 34], [54, 104], [146, 104], [27, 176], [81, 176], [119, 176], [173, 176]];
  const EDGES = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
  const VAL = [4, 2, 6, 1, 3, 5, 7], ORDER = [3, 1, 4, 0, 5, 2, 6];
  const dsa = {
    l: `<div class="fx-bars">${[...Array(8)].map(() => '<i class="fx-sb"></i>').join("")}</div><p class="fx-cap">bubble sort</p>`,
    r: svg(`
      ${EDGES.map(([a, b]) => line(`M${NODES[a][0]} ${NODES[a][1]} L${NODES[b][0]} ${NODES[b][1]}`)).join("")}
      ${NODES.map(([x, y], i) => `<g class="fx-nd"><circle cx="${x}" cy="${y}" r="16"/><text x="${x}" y="${y + 4.5}">${VAL[i]}</text></g>`).join("")}
      <text class="fx-t fx-c fx-dim" x="100" y="232">DFS · in-order</text>
      <text class="fx-t fx-c fx-out" x="100" y="252" style="fill:#ffe11a"> </text>`),
    run: (l, r) => {
      // bubble sort
      const bars = [...l.querySelectorAll(".fx-sb")], n = bars.length; let arr, i, j, wait;
      const place = () => arr.forEach((b, k) => { b.style.left = (k * 12.5 + 1.5) + "%"; });
      const reset = () => {
        const v = [...Array(n)].map((_, k) => k + 1);
        for (let k = n - 1; k > 0; k--) { const m = Math.floor(Math.random() * (k + 1)); [v[k], v[m]] = [v[m], v[k]]; }
        bars.forEach((b, k) => { b.dataset.v = v[k]; b.style.height = (v[k] / n * 90 + 8) + "%"; b.className = "fx-sb"; });
        arr = [...bars]; place(); i = 0; j = 0; wait = 0;
      };
      reset();
      ctx.every(() => {
        if (wait) { if (--wait === 0) reset(); return; }
        bars.forEach(b => b.classList.remove("cmp"));
        if (j < n - 1 - i) {
          const a = arr[j], b = arr[j + 1]; a.classList.add("cmp"); b.classList.add("cmp");
          if (+a.dataset.v > +b.dataset.v) { arr[j] = b; arr[j + 1] = a; place(); }
          j++;
        } else {
          arr[n - 1 - i].classList.add("ok"); i++; j = 0;
          if (i >= n - 1) { arr.forEach(b => b.classList.add("ok")); wait = 14; }
        }
      }, 85);
      // tree traversal
      const nd = [...r.querySelectorAll(".fx-nd")], out = r.querySelector(".fx-out"); let t = 0;
      ctx.every(() => {
        if (t < 7) {
          if (t > 0) nd[ORDER[t - 1]].classList.replace("cur", "vis");
          nd[ORDER[t]].classList.add("cur");
          out.textContent = ORDER.slice(0, t + 1).map(k => VAL[k]).join(" ");
        } else if (t === 7) nd[ORDER[6]].classList.replace("cur", "vis");
        else if (t === 13) { nd.forEach(x => x.classList.remove("cur", "vis")); out.textContent = " "; t = -1; }
        t++;
      }, 420);
    }
  };

  const SCENES = [java, node, react, mysql, mongo, docker, system, dsa];

  // ----- mount / unmount when the rotating word changes -----
  function mount(i) {
    clearTimeout(leaveT); clearAll();
    const s = SCENES[i]; if (!s) return;
    L.innerHTML = `<div class="fx-scene">${s.l}</div>`;
    R.innerHTML = `<div class="fx-scene">${s.r}</div>`;
    if (s.run) s.run(L.firstElementChild, R.firstElementChild);
  }
  function leave() {
    [L, R].forEach(z => z.firstElementChild && z.firstElementChild.classList.add("leave"));
    leaveT = setTimeout(() => { clearAll(); L.replaceChildren(); R.replaceChildren(); }, 450);
  }
  document.addEventListener("skill:in", e => mount(e.detail.index));
  document.addEventListener("skill:out", leave);
})();


// ---------- Drifting-car scene: hold the animation still for visitors who prefer reduced motion ----------
if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll(".car-scene svg").forEach(s => s.pauseAnimations && s.pauseAnimations());
}


// ---------- Contact avatar: pop up from the box edge the first time it scrolls into view ----------
(() => {
  const av = document.querySelector(".contact-avatar");
  if (!av || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;
  av.classList.add("av-wait");
  const io = new IntersectionObserver(es => {
    if (!es.some(e => e.isIntersecting)) return;
    av.classList.remove("av-wait"); av.classList.add("in"); io.disconnect();
  }, { threshold: 0.3 });
  io.observe(av.closest(".contact") || av);
})();

// ---------- Social hover previews: a small animated profile card appears when you hover GitHub / LinkedIn / LeetCode ----------
(() => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;      // touch screens just follow the link
  const links = [...document.querySelectorAll(".social a[data-sp]")];
  if (!links.length) return;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const icon = k => (document.querySelector(`.social a[data-sp="${k}"] .ico`) || { outerHTML: "" }).outerHTML;
  const AV = "vansh.webp";

  // last real LeetCode numbers seen on this browser, so the card shows something current instantly
  const cachedLC = (() => { try { const j = JSON.parse(localStorage.getItem("lc-stats")); return j && j.total >= 0 ? { state: "ok", ...j } : null; } catch (e) { return null; } })();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Edit these to change what each card says. GitHub's repos and numbers are replaced by live data when available.
  const DATA = {
    github: { bg: "#24292f", fg: "#fff", site: "GitHub", tag: "open source", handle: "@vansharorx", name: "Vansh Arora",
      bio: "CS student building backend and full-stack apps with Java, Node.js and React.", cta: "Open my GitHub \u2192",
      repos: [["thinkbeyond", "repo analyser"], ["devflow-backend", "Node, MySQL"], ["devflow-frontend", "React, Tailwind"]], heat: { state: "loading" } },
    linkedin: { bg: "#0a66c2", fg: "#fff", site: "LinkedIn", tag: "professional", handle: "in/vansharorx", name: "Vansh Arora",
      bio: "Backend & Full-Stack Developer. Computer science student at Chitkara University.", cta: "View my LinkedIn \u2192",
      chips: ["Open to internships", "Java \u00b7 Node.js", "React"] },
    leetcode: { bg: "#ffa116", fg: "#000", site: "LeetCode", tag: "problem solving", handle: "@vansharorx", name: "Vansh Arora",
      bio: "Practising data structures and algorithms, one problem at a time.", cta: "View my LeetCode \u2192",
      big: ["300+", "problems solved"], lc: cachedLC || { state: "loading" }, chips: ["7 weekly challenges", "5 hackathons"] }
  };

  // contribution heatmap: 7 rows (Sun-Sat), one column per week; a pulsing grey grid while loading
  const heat = h => {
    const ok = h.state === "ok";
    const cells = ok ? h.cells : Array.from({ length: 154 }, () => 0);
    const grid = cells.map((l, i) => `<i class="${l < 0 ? "x" : "l" + l}" style="--c:${Math.floor(i / 7)}"></i>`).join("");
    return `<div class="sp-heat${ok ? "" : " sk"}"><div class="sp-grid">${grid}</div><p class="sp-cap">${ok ? `${h.total} contributions \u00b7 last 21 weeks` : "loading activity\u2026"}</p></div>`;
  };

  // LeetCode: live total + easy/medium/hard bar; "..." while loading; static text if the API can't be reached
  const lc = (l, big) => {
    if (l.state === "ok") {
      const t = Math.max(1, l.e + l.m + l.h);
      const seg = n => `<i style="--w:${(n / t * 100).toFixed(1)}"></i>`;
      return `<p class="sp-big"><span data-n="${l.total}">${l.total}</span><small>problems solved</small></p>
        <div class="sp-bar stk">${seg(l.e)}${seg(l.m)}${seg(l.h)}</div>
        <p class="sp-chips"><span>Easy ${l.e}</span><span>Medium ${l.m}</span><span>Hard ${l.h}</span></p>`;
    }
    if (l.state === "loading") return `<p class="sp-big">\u2026<small>problems solved</small></p><div class="sp-bar sk"><i></i></div>`;
    return `<p class="sp-big">${esc(big[0])}<small>${esc(big[1])}</small></p>`;
  };

  const body = k => {
    const d = DATA[k];
    let x = "";
    if (d.repos) x += `<ul class="sp-list">${d.repos.map((r, i) => `<li style="--i:${i}"><span>${esc(r[0])}</span><span>${esc(r[1])}</span></li>`).join("")}</ul>`;
    if (d.heat && d.heat.state !== "fail") x += heat(d.heat);
    if (d.lc) x += lc(d.lc, d.big);
    if (d.chips && !(d.lc && d.lc.state === "ok")) x += `<p class="sp-chips">${d.chips.map(c => `<span>${esc(c)}</span>`).join("")}</p>`;
    return `<div class="sp-head" style="--bg:${d.bg};--fg:${d.fg}">${icon(k)}<span>${d.site}</span><em>${d.tag}</em></div>
      <div class="sp-body"><div class="sp-who"><span class="sp-av"><img src="${AV}" alt="" width="46" height="46"></span>
      <span><span class="sp-name">${esc(d.name)}</span><span class="sp-handle">${esc(d.handle)}</span></span></div>
      <p class="sp-bio">${esc(d.bio)}</p>${x}</div><span class="sp-cta">${d.cta}</span>`;
  };

  const count = el => {
    if (reduce) return;
    const end = +el.dataset.n, t0 = performance.now();
    const step = now => { const p = Math.min(1, (now - t0) / 800); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    el.textContent = "0"; requestAnimationFrame(step);
  };
  const paint = k => { card.innerHTML = body(k); card.querySelectorAll("[data-n]").forEach(count); };

  const card = document.createElement("a");
  card.className = "sp"; card.target = "_blank"; card.rel = "noopener"; card.setAttribute("aria-hidden", "true"); card.tabIndex = -1;
  document.body.appendChild(card);

  let cur = null, link = null, hideT = 0, ghLoaded = false, lcLoaded = false;

  // Where the card goes: above the link if possible (that's where it belongs), otherwise below. If neither side has
  // enough room, the card shrinks step by step (1: no repo list, 2: also no heatmap, 3: also no bio / chips) and, as a last resort,
  // is kept inside the window so it is never cut off.
  function place() {
    if (!link || !cur) return;
    const r = link.getBoundingClientRect(), w = card.offsetWidth, GAP = 16, PAD = 8;
    const room = { above: r.top - GAP - PAD, below: innerHeight - r.bottom - GAP - PAD };
    const heightAt = lvl => { for (let i = 1; i <= 3; i++) card.classList.toggle("c" + i, lvl >= i); return card.offsetHeight; };
    let side = null, h = 0;
    search: for (const sd of ["above", "below"]) for (let lvl = 0; lvl <= 3; lvl++) {
      const hh = heightAt(lvl);
      if (hh <= room[sd]) { side = sd; h = hh; break search; }
    }
    let top;
    if (side) top = side === "above" ? r.top - h - GAP : r.bottom + GAP;
    else {                                                     // too small a window for any side: smallest card, kept on screen
      h = heightAt(3); side = room.above >= room.below ? "above" : "below";
      top = side === "above" ? Math.max(PAD, r.top - h - GAP) : Math.min(innerHeight - h - PAD, r.bottom + GAP);
    }
    const left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    card.style.transform = `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px)`;
    card.style.setProperty("--ax", Math.max(22, Math.min(w - 22, r.left + r.width / 2 - left)).toFixed(1) + "px");
    card.classList.toggle("below", side === "below");
    card.style.setProperty("--bg", DATA[cur].bg);
  }

  function show(a) {
    clearTimeout(hideT);
    const k = a.dataset.sp;
    link = a;
    if (cur !== k || !card.classList.contains("on")) {
      cur = k; card.href = a.href; paint(k);
      card.classList.remove("on"); void card.offsetWidth;
    }
    place();
    card.classList.add("on");
    if (k === "github" && !ghLoaded) loadGitHub();
    if (k === "leetcode" && !lcLoaded) loadLeetCode();
  }
  const hide = () => { clearTimeout(hideT); hideT = setTimeout(() => card.classList.remove("on"), 140); };

  async function loadGitHub() {
    ghLoaded = true;                                           // one attempt; each part falls back on its own
    const u = "vansharorx", g = DATA.github;
    const get = url => fetch(url).then(r => r.ok ? r.json() : Promise.reject());
    const [me, repos, cal] = await Promise.allSettled([
      get("https://api.github.com/users/" + u),
      get("https://api.github.com/users/" + u + "/repos?sort=updated&per_page=3"),
      get("https://github-contributions-api.jogruber.de/v4/" + u + "?y=last")      // public contributions calendar (GitHub has no token-free API for it)
    ]);
    if (me.status === "fulfilled") { if (me.value.bio) g.bio = me.value.bio; if (me.value.name) g.name = me.value.name; }
    if (repos.status === "fulfilled" && repos.value.length) g.repos = repos.value.map(r => [r.name, r.language || "repo"]);
    try {
      const days = cal.value.contributions.slice(-147);                             // last 21 weeks
      const pad = new Date(days[0].date + "T00:00:00").getDay();                    // align the first column to Sunday
      g.heat = { state: "ok", total: days.reduce((n, d) => n + d.count, 0), cells: [...Array(pad).fill(-1), ...days.map(d => d.level)] };
    } catch (e) { g.heat = { state: "fail" }; }
    if (cur === "github" && card.classList.contains("on")) { paint("github"); place(); }
  }

  // keep the "300+ LeetCode problems solved" sticker in the Beyond the classroom section in step with the real number
  function syncSticker(total) {
    const el = document.querySelector(".stickers .s1 strong");
    if (!el) return;
    const li = el.closest("li");
    setTimeout(() => { el.textContent = total; }, li.classList.contains("in") && !reduce ? 2000 : 0);   // wait out its count-up if it is already running
  }
  if (cachedLC) syncSticker(cachedLC.total);

  async function loadLeetCode() {
    lcLoaded = true;
    const u = "vansharorx", g = DATA.leetcode;
    // public third-party mirrors of LeetCode's stats (LeetCode itself blocks browser requests from other sites); tried in order
    for (const url of ["https://leetcode-stats.tashif.codes/" + u, "https://leetcode-stats-api.herokuapp.com/" + u]) {
      try {
        const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 8000);
        const r = await fetch(url, { signal: ctl.signal }); clearTimeout(to);
        if (!r.ok) continue;
        const j = await r.json(), total = +j.totalSolved;
        if (!Number.isFinite(total) || (j.status && j.status !== "success")) continue;
        g.lc = { state: "ok", total, e: +j.easySolved || 0, m: +j.mediumSolved || 0, h: +j.hardSolved || 0 };
        try { localStorage.setItem("lc-stats", JSON.stringify({ total, e: g.lc.e, m: g.lc.m, h: g.lc.h })); } catch (e) {}
        syncSticker(total);
        if (cur === "leetcode" && card.classList.contains("on")) { paint("leetcode"); place(); }
        return;
      } catch (e) { /* try the next mirror */ }
    }
    if (g.lc.state === "loading") { g.lc = { state: "fail" }; if (cur === "leetcode" && card.classList.contains("on")) { paint("leetcode"); place(); } }
  }
  setTimeout(() => { if (!lcLoaded) loadLeetCode(); }, 2500);       // fetch quietly after load so the number is ready before anyone hovers

  links.forEach(a => {
    a.addEventListener("pointerenter", () => show(a));
    a.addEventListener("pointerleave", hide);
    a.addEventListener("focus", () => show(a));
    a.addEventListener("blur", hide);
  });
  card.addEventListener("pointerenter", () => clearTimeout(hideT));
  card.addEventListener("pointerleave", hide);
  addEventListener("scroll", () => { if (card.classList.contains("on")) place(); }, { passive: true });
  addEventListener("resize", place);
  document.addEventListener("keydown", e => { if (e.key === "Escape") card.classList.remove("on"); });
})();

// ---------- 3D Vansh in the contact banner ----------
// vansh.glb is a rigged character (Mixamo skeleton) with six animation clips inside:
//   Idle (breathing), Wave, Walk, DanceSilly, DanceHipHop, Freeze (breakdance).
// This code only decides WHEN to play them: it peeks up from the bottom edge, looks around, steps out and
// waves, then wanders, dances and reacts to the cursor / clicks, crossfading between clips. His head and neck
// are turned in code on top of the clips so he can look at your cursor. Everything pauses while the banner
// is off screen. If WebGL, the model or the CDN fails, the original still PNG is shown instead.
(() => {
  const contact = document.querySelector(".contact");
  const stage = contact && contact.querySelector(".contact-stage");
  const canvas = stage && stage.querySelector(".stage-canvas");
  const bubble = stage && stage.querySelector(".stage-bubble");
  if (!canvas || !bubble) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;           // keep the calm still image
  if (!("IntersectionObserver" in window) || !("ResizeObserver" in window)) return;
  try { const t = document.createElement("canvas"); if (!(t.getContext("webgl2") || t.getContext("webgl"))) return; } catch (e) { return; }

  const MODEL = "vansh.glb";
  contact.classList.add("stage3d");
  const giveUp = why => { console.warn("3D avatar unavailable, showing the still image.", why); contact.classList.remove("stage3d"); };

  // start fetching a little before the banner scrolls into view, so he is ready when you arrive
  let booted = false;
  const preload = new IntersectionObserver(es => {
    if (booted || !es.some(e => e.isIntersecting)) return;
    booted = true; preload.disconnect();
    boot().catch(giveUp);
  }, { rootMargin: "900px 0px" });
  preload.observe(contact);

  async function boot() {
    const THREE = await import("three");
    const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
    const { MeshoptDecoder } = await import("three/addons/libs/meshopt_decoder.module.js");
    const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(MODEL);
    const model = gltf.scene;
    model.traverse(o => { if (o.isMesh) { o.frustumCulled = false; if (o.material && o.material.map) o.material.map.anisotropy = 4; } });

    // ----- clips: line up every clip's resting hips position with Idle so crossfades never slide him sideways -----
    const clips = {}; gltf.animations.forEach(c => { clips[c.name] = c; });
    for (const n of ["Idle", "Wave", "Walk", "DanceSilly", "DanceHipHop", "Freeze"]) if (!clips[n]) throw new Error("missing clip " + n);
    const hipsTrack = c => c.tracks.find(t => /Hips\.position$/.test(t.name));
    const ref = hipsTrack(clips.Idle).values, rx = ref[0], rz = ref[2];
    for (const n in clips) {
      const v = hipsTrack(clips[n]).values, dx = rx - v[0], dz = rz - v[2];
      for (let i = 0; i < v.length; i += 3) { v[i] += dx; v[i + 2] += dz; }
    }
    const mixer = new THREE.AnimationMixer(model);
    const A = {}; for (const n in clips) A[n] = mixer.clipAction(clips[n]);
    const WALK_UNITS_PER_S = 60.87 / clips.Walk.duration;      // how far one Walk cycle carries him, in model units

    // ----- measure him in his idle pose: height, width and where his feet are -----
    A.Idle.play(); A.Idle.time = 0.4; mixer.update(0); model.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(model, true);
    const MH = bb.max.y - bb.min.y, BW = Math.max(bb.max.x - bb.min.x, 0.3 * MH);
    model.position.set(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);   // feet at the rig's origin
    const rig = new THREE.Group(); rig.add(model);
    const scene = new THREE.Scene(); scene.add(rig);
    const bone = n => model.getObjectByName(n);
    const B = { spine: bone("mixamorigSpine2"), neck: bone("mixamorigNeck"), head: bone("mixamorigHead") };

    // ----- renderer + camera in pixel units (1 world unit = 1 css px on the z = 0 plane) -----
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setClearColor(0x000000, 0);
    const FOV = 24, camera = new THREE.PerspectiveCamera(FOV, 1, 10, 10000);
    canvas.addEventListener("webglcontextlost", e => { e.preventDefault(); stop(); giveUp("webgl context lost"); });

    // ----- layout: where he can stand, and how big he is -----
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    let W = 0, H = 0, charH = 240, charW = 120, xMin = 0, xMax = 0, home = 0, canWalk = false;
    const textRect = el => {
      const r = document.createRange(); r.selectNodeContents(el);
      let right = -Infinity, bottom = -Infinity;
      for (const q of r.getClientRects()) { right = Math.max(right, q.right); bottom = Math.max(bottom, q.bottom); }
      return { right, bottom };
    };
    // The banner scales in when it is revealed (rv-grow), and getBoundingClientRect() includes that scale. So his world
    // is measured in the stage's real layout size (clientWidth / clientHeight, which transforms don't touch), and
    // pointer / element positions are converted into that same space with local().
    function local(cx, cy) {
      const r = stage.getBoundingClientRect();
      return { x: (cx - r.left) * (W / (r.width || W)), y: (cy - r.top) * (H / (r.height || H)) };
    }
    function layout() {
      if (!stage.clientWidth || !stage.clientHeight) return;
      const sr = stage.getBoundingClientRect();
      const first = W === 0, wasHome = !first && Math.abs(S.x - home) < 3;
      W = stage.clientWidth;
      const kx = W / (sr.width || W), ky = stage.clientHeight / (sr.height || stage.clientHeight);
      const narrow = W <= 900;
      if (narrow) {                                           // stacked layout: he gets a strip below the content
        charH = clamp(W * 0.46, 160, 220);
        contact.style.setProperty("--stage-pad", Math.round(charH * 0.9 + 12) + "px");
        H = stage.clientHeight;
      } else {
        contact.style.removeProperty("--stage-pad");
        H = stage.clientHeight; charH = clamp(H * 0.58, 180, 290);
      }
      const s = charH / MH;
      charW = BW * s;
      const half = charW * 0.7;                               // a little extra room for swinging arms
      let lo = half + 10;
      if (!narrow) {                                          // stay to the right of anything he would overlap
        const top = H - charH;
        const items = [...contact.querySelectorAll("h2, :scope > p:not(.social), .actions > *, .social > a")];
        for (const el of items) {
          const rr = el.matches("h2, p") ? textRect(el) : el.getBoundingClientRect();
          if ((rr.bottom - sr.top) * ky > top + 8) lo = Math.max(lo, (rr.right - sr.left) * kx + 28 + half);
        }
      }
      xMax = W - half - (narrow ? 8 : 40); xMin = Math.min(lo, xMax);
      home = xMax; canWalk = xMax - xMin > 90;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.fov = FOV;
      const dist = (H / 2) / Math.tan(FOV * Math.PI / 360);
      camera.position.set(W / 2, H / 2, dist); camera.lookAt(W / 2, H / 2, 0); camera.updateProjectionMatrix();
      S.x = first || wasHome ? home : clamp(S.x, xMin, xMax);
    }

    // ----- state, tweens and timers (all advanced by the frame loop, so they pause with it) -----
    //  x/yaw/rise move the whole body; hYaw/hPitch/hRoll turn the head; tw = how much he follows the cursor
    const S = { x: 0, rise: 0, lift: 0, yaw: 0, hYaw: 0, hPitch: 0, hRoll: 0, tw: 0, bodyTrack: 0, tx: 0, ty: 0, request: null, away: false, poked: false };
    let tweens = [], timers = [], time = 0, busy = false;
    const E = {
      io: t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
      out: t => 1 - Math.pow(1 - t, 3),
      sine: t => .5 - .5 * Math.cos(Math.PI * t),
      lin: t => t
    };
    function tween(obj, to, dur, ease = E.io) {
      return new Promise(res => {
        for (const k in to) tweens.forEach(w => { if (w.obj === obj && k in w.to) { delete w.to[k]; delete w.from[k]; } });
        const from = {}; for (const k in to) from[k] = obj[k];
        tweens.push({ obj, from, to, dur: Math.max(.001, dur), ease, t: 0, res });
      });
    }
    const wait = s => new Promise(res => timers.push({ t: 0, d: s, res }));
    function advance(dt) {
      for (let i = tweens.length - 1; i >= 0; i--) {
        const w = tweens[i]; w.t += dt;
        const p = Math.min(1, w.t / w.dur), e = w.ease(p);
        for (const k in w.to) w.obj[k] = w.from[k] + (w.to[k] - w.from[k]) * e;
        if (p >= 1) { tweens.splice(i, 1); w.res(); }
      }
      for (let i = timers.length - 1; i >= 0; i--) { const w = timers[i]; w.t += dt; if (w.t >= w.d) { timers.splice(i, 1); w.res(); } }
    }

    // ----- crossfade to a clip -----
    let cur = A.Idle;
    function go(name, fade = .35, opt = {}) {
      const next = A[name], speed = opt.speed || 1;
      if (cur === next) { next.setEffectiveTimeScale(speed); return; }
      next.reset().setEffectiveWeight(1).setEffectiveTimeScale(speed).play();
      next.time = opt.time != null ? opt.time : (speed < 0 ? next.getClip().duration - 0.001 : 0);
      next.crossFadeFrom(cur, fade, false);
      cur = next;
    }

    // ----- speech bubble -----
    let bubbleTimer = 0, bw = 0, bh = 0, lastPx = 0, lastHeadTop = 0;
    function say(text, ms = 2400) {
      bubble.textContent = text;
      bubble.classList.remove("on"); void bubble.offsetWidth; bubble.classList.add("on");
      bw = bubble.offsetWidth; bh = bubble.offsetHeight;
      placeBubble(lastPx, lastHeadTop);                       // place it before the first painted frame
      clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => bubble.classList.remove("on"), ms);
    }
    function placeBubble(px, headTop) {
      if (!bubble.classList.contains("on")) return;
      const left = clamp(px - bw * 0.25, 8, W - bw - 8);
      const top = Math.max(6, headTop - bh - 12);
      bubble.style.transform = `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px)`;
      bubble.style.setProperty("--ax", clamp(px - left, 18, bw - 18).toFixed(1) + "px");
    }

    // ----- pointer: his head follows the cursor; clicking him gets a reaction -----
    let mx = null, my = null, near = 0, inside = false;
    addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    const hideAmt = () => (1 - S.rise) * charH * 1.1 - charH * .05;
    const hit = e => {
      if (e.target.closest && e.target.closest("a, button")) return false;
      const { x: lx, y: ly } = local(e.clientX, e.clientY);
      const bottom = H + hideAmt(), top = bottom - charH;
      return Math.abs(lx - S.x) < Math.max(charW * 0.6, charH * 0.24) && ly > Math.max(top, 0) && ly < Math.min(bottom, H);
    };
    // ----- what he does, and why: nothing is random, every gesture has a trigger -----
    //   first view ............ peeks up, glances around, steps out and waves (about 2.5 s)
    //   standing around ....... breathes; his head follows your cursor
    //   hover the email ....... walks over to it and keeps an eye on it; walks back when you leave
    //   click "Copy email" .... short celebration dance
    //   hover GitHub .......... 3 push-ups ("commit streak")
    //   hover LinkedIn ........ waves ("let's connect")
    //   hover LeetCode ........ soul spin ("solved it")
    //   click him ............. waves; a quick second click starts the hip-hop dance
    //   nobody around ......... 5 s: waves "got a project?" / 10 s: Hokey Pokey / 20 s: breakdance, then repeats
    //   back after a while .... peekaboo, "welcome back"
    const q = sel => contact.querySelector(sel);                // always inside the banner (the hero has its own .actions)
    const BUSY = ["One sec, I\u2019m mid-move!", "Show\u2019s still on!", "Don\u2019t interrupt the artist \u{1F60E}", "Hold that thought\u2026"];
    let curBeh = "", clicks = 0, lastClick = -1e9, emailHover = false, leftAt = 0, comeback = false;

    // any pointer movement over the banner counts as "somebody is here" (resets the bored timer)
    contact.addEventListener("pointermove", e => { S.poked = true; const h = hit(e); if (h !== inside) { inside = h; contact.classList.toggle("stage-hover", h); } }, { passive: true });
    contact.addEventListener("pointerleave", () => { inside = false; contact.classList.remove("stage-hover"); });

    // click him: wave; a quick second click: hip-hop
    contact.addEventListener("click", e => {
      if (!hit(e) || S.rise < .9) return;
      const now = performance.now(); clicks = now - lastClick < 3200 ? clicks + 1 : 1; lastClick = now;
      const want = clicks >= 2 ? "hiphop" : "poke";
      if (!busy || (curBeh === "poke" && want === "hiphop")) S.request = want; else say(pick(BUSY), 1800);
    });

    // hover a link: a different gesture for each (each one has a 15 s cooldown so he never nags)
    const cool = {};
    function wire(el, key, name) {
      if (!el) return;
      el.addEventListener("pointerenter", () => {
        const t = performance.now();
        if (S.rise < .9 || busy || S.away || (cool[key] && t - cool[key] < 15000)) return;
        cool[key] = t; S.request = name;
      });
    }
    wire(q('.social a[data-sp="github"]'), "gh", "pushup");
    wire(q('.social a[data-sp="linkedin"]'), "li", "connect");
    wire(q('.social a[data-sp="leetcode"]'), "lc", "solved");

    // the email: he walks over to it while you hover it, and walks back afterwards
    for (const el of [q(".actions .btn-ink"), q("#copy")]) {
      if (!el) continue;
      el.addEventListener("pointerenter", () => { emailHover = true; if (S.rise > .9 && !busy && !S.away) S.request = "toEmail"; });
      el.addEventListener("pointerleave", () => { emailHover = false; });
    }
    const copyBtn = q("#copy");
    if (copyBtn) copyBtn.addEventListener("click", () => {   // queued, so it still happens after he has finished walking over
      if (S.rise < .9) return;
      if (busy) say("Copied! Nice.", 1600);
      S.request = "cheer";
    });

    // ----- head / neck: rotate bones on top of the playing clip (delta is in the character's own frame) -----
    const qa = new THREE.Quaternion(), qr = new THREE.Quaternion(), qrInv = new THREE.Quaternion(), qd = new THREE.Quaternion(), qt = new THREE.Quaternion(), eu = new THREE.Euler(0, 0, 0, "YXZ");
    function twist(b, yaw, pitch, roll) {
      if (!b || Math.abs(yaw) + Math.abs(pitch) + Math.abs(roll) < 1e-4) return;
      b.parent.getWorldQuaternion(qa);
      rig.getWorldQuaternion(qr); qrInv.copy(qr).invert();
      qd.setFromEuler(eu.set(pitch, yaw, roll));
      qt.copy(qr).multiply(qd).multiply(qrInv);                // the same turn, expressed in world space
      qt.premultiply(qa.clone().invert()).multiply(qa);        // ... then in the parent bone's space
      b.quaternion.premultiply(qt);
      b.updateWorldMatrix(false, true);
    }

    // ----- the gestures -----
    const idle = (fade = .45) => go("Idle", fade);
    const FLOOR = { Freeze: 1, PushUp: 1 };                 // clips where he ends up lying on the ground
    async function dance(name, dur, line, face = 0) {
      S.tw = 0;
      tween(S, { yaw: face, hYaw: 0, hPitch: 0, hRoll: 0 }, .5, E.sine);
      go(name, .45);
      if (FLOOR[name]) tween(S, { lift: charH * .08 }, .5, E.sine);        // floor moves: keep his head above the banner edge
      if (line) say(line, 2800);
      await wait(dur); idle(.55);
      if (S.lift) tween(S, { lift: 0 }, .6, E.sine);
      if (face) await tween(S, { yaw: 0 }, .6, E.sine);
      S.tw = 1;
    }
    async function wave(line, secs = 2.4) { say(line, 2800); go("Wave", .3); await wait(secs); idle(.5); }
    async function pushups(reps, line) {                    // side view, counts the reps in the speech bubble
      S.tw = 0;
      tween(S, { yaw: -1.45, hYaw: 0, hPitch: 0, hRoll: 0 }, .6, E.sine);
      go("PushUp", .5); tween(S, { lift: charH * .08 }, .5, E.sine);
      say(line, 1500); await wait(1.6);
      for (let i = 1; i <= reps; i++) { say(String(i), 1300); await wait(clips.PushUp.duration); }
      say("Easy.", 1400); idle(.55);
      tween(S, { lift: 0 }, .6, E.sine); await tween(S, { yaw: 0 }, .6, E.sine); S.tw = 1;
    }
    async function walkTo(x) {
      layout();
      x = clamp(x, xMin, xMax);
      const d = x - S.x; if (Math.abs(d) < 24) return;
      const dir = Math.sign(d), FACE = 1.25;
      S.tw = 0;
      go("Walk", .3);
      tween(S, { yaw: dir * FACE, hYaw: 0, hPitch: 0 }, .55, E.sine);
      const v = WALK_UNITS_PER_S * (charH / MH) * Math.sin(FACE);     // px per second that matches his footsteps
      await tween(S, { x }, Math.abs(d) / v, E.lin);
    }
    async function stopWalking() { idle(.35); await tween(S, { yaw: 0 }, .6, E.sine); }

    // ----- the first appearance: peeks up, glances left and right, steps out and says hi (about 2.5 s) -----
    async function intro() {
      S.rise = 0; S.x = home; S.tw = 0;
      await wait(.2);
      await tween(S, { rise: .45 }, .7, E.out);                          // just the hair and eyes above the edge
      await tween(S, { hYaw: -.9, yaw: -.25, hPitch: -.05 }, .4, E.sine);   // quick look left
      await tween(S, { hYaw: .9, yaw: .25 }, .55, E.sine);               // ... and right
      await tween(S, { rise: 1, hYaw: 0, yaw: 0, hPitch: 0 }, .8, E.io);    // steps out: fully up after about 2.5 s
      await wave("Hi there! \u{1F44B}", 2.4); S.tw = 1;
    }

    const BEH = {
      poke: async () => {                                  // click on him; a quick second click upgrades it to hip-hop
        say("Hey! \u{1F44B}", 2200); go("Wave", .3);
        for (let i = 0; i < 26 && !S.request; i++) await wait(.1);
        if (!S.request) idle(.5);
      },
      hiphop: () => dance("DanceHipHop", 8.5, "Okay, you asked for it \u{1F3A7}"),
      cheer: () => dance("DanceSilly", 3.2, "Copied! Now say hi. \u{1F604}"),
      pushup: () => pushups(3, "Commit streak \u{1F4AA}"),
      connect: () => wave("Let\u2019s connect! \u{1F44B}"),
      solved: () => dance("SoulSpin", 3.9, "Solved it! \u{1F57A}"),
      toEmail: async () => {                               // walks to the email button, faces it, waits there while you hover
        if (canWalk) await walkTo(xMin);
        idle(.35); S.away = true;
        await tween(S, { yaw: -1.05, hYaw: -.45 }, .8, E.sine);
        say("That\u2019s my email \u2014 say hi!", 3000);
      },
      goHome: async () => { await walkTo(home); await stopWalking(); S.away = false; },
      back: async () => {                                  // you came back to the page: peekaboo
        S.tw = 0; await tween(S, { rise: .3, yaw: 0, hYaw: 0 }, .5, E.io); await wait(.8);
        say("Welcome back! \u{1F44B}", 2400); await tween(S, { rise: 1 }, .6, E.out); go("Wave", .3); await wait(1.6); idle(.5);
      },
      // nobody around: three escalating attempts to get your attention, then it starts over
      nudge: () => wave("Psst\u2026 got a project in mind?", 2.8),
      bored: () => dance("HokeyPokey", 10.6, "Bored\u2026 Hokey Pokey time \u{1F3B6}"),
      giveup: () => dance("Freeze", 5.8, "Okay, I give up waiting \u{1F605}")
    };
    // nobody around: seconds since the last touch. Each gesture starts at its time (or as soon as the previous one has
    // finished); after the last one the count starts over.
    const PLAN = [{ at: 5, run: "nudge" }, { at: 10, run: "bored" }, { at: 20, run: "giveup" }];

    async function life() {
      await intro();
      let t0 = time, plan = 0;                              // t0 = when somebody last touched the banner (or the plan last restarted)
      for (;;) {
        let name = S.request; S.request = null;
        const user = !!name;
        if (!name && S.away && !emailHover) name = "goHome";
        else if (!name && comeback) { comeback = false; name = "back"; }
        else if (!name && time - t0 >= PLAN[plan].at) { name = PLAN[plan].run; plan++; }
        if (name && BEH[name]) {
          curBeh = name; busy = true;
          try { await BEH[name](); } catch (e) { console.warn(e); }
          busy = false; curBeh = ""; S.tw = 1;
          if (user || name === "back" || plan >= PLAN.length) { t0 = time; plan = 0; }
          continue;
        }
        await wait(.1);
        if (S.poked) { S.poked = false; t0 = time; plan = 0; }
      }
    }

    // ----- frame loop (runs only while the banner is on screen and the tab is visible) -----
    let raf = 0, last = 0, running = false, visible = false, began = false;
    function step(dt) {
      time += dt;
      advance(dt);
      mixer.update(Math.max(dt, 1e-4));
      // gaze follows the cursor when it is near the banner
      let tx = 0, ty = 0, want = 0;
      if (mx !== null) {
        const p = local(mx, my), hy = H + hideAmt() - charH * .78;
        tx = clamp((p.x - S.x) / 380, -1, 1); ty = clamp((p.y - hy) / 260, -1, 1);
        want = (p.y > -260 && p.y < H + 260) ? 1 : 0;
      }
      near += (want - near) * Math.min(1, dt * 3);
      S.tx += (tx * near - S.tx) * Math.min(1, dt * 4); S.ty += (ty * near - S.ty) * Math.min(1, dt * 4);
    }
    function draw() {
      const hide = hideAmt(), s = charH / MH;
      rig.scale.setScalar(s);
      rig.position.set(S.x, -hide + S.lift, 0);
      rig.rotation.y = S.yaw + S.bodyTrack * S.tx * .55;
      rig.updateMatrixWorld(true);
      const follow = S.tw * (S.rise > .9 ? 1 : 0);
      const yaw = S.hYaw + follow * clamp(S.tx * .85 - S.yaw, -.9, .9);
      const pitch = S.hPitch + follow * S.ty * .28 + Math.sin(time * .6) * .015;
      const roll = S.hRoll;
      twist(B.spine, yaw * .15, pitch * .1, 0);
      twist(B.neck, yaw * .35, pitch * .35, roll * .3);
      twist(B.head, yaw * .5, pitch * .55, roll * .7);
      renderer.render(scene, camera);
      lastPx = S.x; lastHeadTop = H + hide - charH;
      placeBubble(lastPx, lastHeadTop);
    }
    function frame(now) { raf = 0; if (!running) return; const dt = Math.min(.05, (now - last) / 1000); last = now; step(dt); draw(); raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); raf = 0; }
    function sync() {
      const want = visible && !document.hidden;
      if (want && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
      else if (!want) stop();
    }
    new IntersectionObserver(es => es.forEach(e => {
      visible = e.isIntersecting; sync();
      if (!e.isIntersecting) leftAt = performance.now();
      else if (began && leftAt && performance.now() - leftAt > 15000) { comeback = true; leftAt = 0; }
      if (e.intersectionRatio >= .35 && !began) { began = true; layout(); life(); }
    }), { threshold: [0, .35] }).observe(contact);
    document.addEventListener("visibilitychange", sync);
    new ResizeObserver(layout).observe(stage);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    layout(); draw();
  }
})();
