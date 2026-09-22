import { React } from "uebersicht";
// --- Inlined design system (self-contained; formerly theme.js) ---
// Shared design system for the widget set: color tokens, fonts, layout, the
// common card shell, drag/resize handles, a last-known-good cache, and the
// standard data-resolution helper. Imported by every widget so they stay
// visually and behaviorally consistent.
const T = {
  // Accent tints
  tintBlue: "#296BE0",
  tintPink: "#E86E87",
  tintGreen: "#59A875",
  tintOrange: "#D9946B",
  tintPurple: "#A861DE",

  // Cards
  cardLight: "rgba(255,255,255,0.74)",
  cardDark: "rgba(33,36,43,0.88)",

  // Ink (text on light)
  ink: "#1F2129",
  inkDim: "#616670",
  inkMute: "#8C919C",

  // Text on dark
  onDark: "#F7F7FA",
  onDarkDim: "#BDBFC7",
  onDarkMute: "#8F949E",

  // Walls (desktop stand-in backgrounds)
  wall1: "#F0F2F7",
  wall2: "#DBE3ED",
  wall3: "#BFC7DB",

  // GitHub ramp
  ghEmpty: "rgba(255,255,255,0.10)",
  ghGreen1: "#9CE8A8",
  ghGreen2: "#40C463",
  ghGreen3: "#30A14F",
  ghGreen4: "#216E38",

  // Scene colors
  nightSky: "#14141A",
  cosmicBase: "#0A051A",
  cosmicViolet: "#8C338C",
  cosmicMagenta: "#D9598C",
  cosmicIndigo: "#331A66",
  shaderPurple: "#402673",
  shaderTeal: "#268C8C",
  duskBase: "#4D408C",
  duskAmber: "#D9A666",
  duskPurple: "#8C4DA6",
  duskGlow: "#F28073",
  cardCream: "#F2F0E6",
  paperGrain: "#9E8052",

  archivePalette: [
    "#D98C4D", "#A64D33", "#733326", "#E0B359",
    "#8C6640", "#B88CCC", "#594D80", "#8C73BF",
    "#8CBF8C", "#4D8059", "#598CD9", "#334D8C",
  ],

  // Layout
  radius: "24px",
  captionTracking: "1.5px",
};

// Fonts. Install Instrument Serif, Geist, and Geist Mono for the intended look;
// each stack falls back to a system font if the family is missing.
const serif = "'Instrument Serif', Georgia, serif";
const sans = "'Geist', -apple-system, BlinkMacSystemFont, sans-serif";
const mono = "'Geist Mono', 'SF Mono', ui-monospace, monospace";

// Default desktop placement [x, y] per widget. Each widget calls
// card(variant, w, h, ...LAYOUT.<key>) so widgets lay out at distinct positions
// rather than stacking at the origin. These are overridden by any saved
// position from the drag handle.
const LAYOUT = {
  nowSpinning:  [380, 40],
  musicArchive: [40, 40],
  spatial:      [380, 200],
  mosaic:       [1120, 40],
  stack:        [1120, 486],
  drop:         [1120, 708],
  swap:         [380, 672],
  aiDailyPull:  [40, 368],
  apod:         [40, 576],
  atlas:        [1280, 224],
  tarot:        [1120, 224],
};

// Shared card shell. variant is "dark" or "light"; x/y set the on-desktop
// position. The common loading/empty/stale state styles are appended so every
// widget can render those states without repeating CSS.
const card = (variant, w, h, x = 0, y = 0) => `
  position: absolute;
  left: ${x}px; top: ${y}px;
  width: ${w}px;
  height: ${h}px;
  border-radius: ${T.radius};
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,0.35);
  background: ${variant === "dark" ? T.cardDark : T.cardLight};
  backdrop-filter: blur(20px);
  color: ${variant === "dark" ? T.onDark : T.ink};
  font-family: ${sans};
  box-sizing: border-box;
  transform-origin: top left;

  /* Promote each card to its own GPU layer so a sibling widget's frequent
     refresh cannot trigger a backdrop-filter recomposite, which otherwise made
     the blur flicker on and off. */
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;

  .ws-stale { position:absolute; top:8px; right:10px; z-index:5;
              font-family:${mono}; font-size:8px; letter-spacing:1px;
              text-transform:uppercase; opacity:0.72;
              color:${variant === "dark" ? T.onDarkMute : T.inkMute}; }
  .ws-empty { position:absolute; inset:0; display:flex; align-items:center;
              justify-content:center; padding:24px; text-align:center;
              font-family:${serif}; font-style:italic; font-size:18px;
              opacity:0.6; color:${variant === "dark" ? T.onDarkDim : T.inkDim}; }
  .ws-skel  { position:absolute; inset:14px; border-radius:14px; opacity:0.18;
              animation: ws-pulse 1.6s ease-in-out infinite; }
  @keyframes ws-pulse { 0%,100% { opacity:0.10; } 50% { opacity:0.24; } }
  @media (prefers-reduced-motion: reduce) {
    .ws-skel { animation:none; opacity:0.16; }
  }

  .ws-drag  { position:absolute; top:6px; left:6px; z-index:30;
              width:18px; height:18px; border-radius:6px;
              display:flex; align-items:center; justify-content:center;
              font-size:11px; line-height:1; cursor:grab; opacity:0.42;
              transition:opacity .15s ease; user-select:none;
              -webkit-user-select:none;
              color:${variant === "dark" ? T.onDarkMute : T.inkMute};
              background:${variant === "dark"
                ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; }
  .ws-drag:hover  { opacity:0.95; }
  .ws-drag:active { cursor:grabbing; }

  .ws-resize { position:absolute; bottom:5px; right:5px; z-index:30;
               width:16px; height:16px; border-radius:5px;
               display:flex; align-items:center; justify-content:center;
               font-size:11px; line-height:1; cursor:nwse-resize; opacity:0.42;
               transition:opacity .15s ease; user-select:none;
               -webkit-user-select:none;
               color:${variant === "dark" ? T.onDarkMute : T.inkMute};
               background:${variant === "dark"
                 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; }
  .ws-resize:hover { opacity:0.95; }
`;

// Small uppercase monospace caption used for metadata labels.
const caption = (color) => `
  font-family: ${mono};
  text-transform: uppercase;
  letter-spacing: ${T.captionTracking};
  color: ${color};
`;

// State helpers, returned as React elements (this is plain JS, not JSX).
const h = React.createElement;

// Loading: an accent-tinted skeleton block.
const Skel = ({ tint = T.tintBlue }) =>
  h("div", { className: "ws-skel", style: { background: tint } });

// Empty: a single quiet line of text.
const Empty = ({ text }) => h("div", { className: "ws-empty" }, text);

// Stale: a small marker showing the time of the last successful refresh.
const Stale = ({ ts }) =>
  h("div", { className: "ws-stale" }, `stale · ${clockStamp(ts)}`);

// Drag and resize support.
//
// Übersicht renders each widget into its own absolutely-positioned `.widget`
// node, all inside a shared `#uebersicht` container. The wrapper to move is the
// nearest `.widget` ancestor of a handle — not the topmost absolute element,
// which is the shared container.
//
// DragHandle updates the wrapper's left/top. ResizeHandle scales it uniformly
// via a top-left-anchored CSS transform, keeping these fixed-layout cards crisp
// instead of clipping. Both persist to localStorage, so position and size
// survive refreshes and reboots.
const posKey = (k) => `ws:pos:${k}`;
const scaleKey = (k) => `ws:scale:${k}`;
const MIN_SCALE = 0.4, MAX_SCALE = 3;

const findWrapper = (node) => node && node.closest(".widget");

// Apply any saved position and scale. Runs on every mount, since the wrapper
// may have been recreated on refresh.
const applySaved = (wrapper, key) => {
  try {
    const pos = JSON.parse(localStorage.getItem(posKey(key)) || "null");
    if (pos && typeof pos.x === "number") {
      wrapper.style.left = pos.x + "px";
      wrapper.style.top = pos.y + "px";
    }
  } catch (e) { /* storage unavailable */ }
  try {
    const scale = parseFloat(localStorage.getItem(scaleKey(key)));
    if (scale > 0) wrapper.style.transform = `scale(${scale})`;
  } catch (e) { /* storage unavailable */ }
};

const initDrag = (node, key) => {
  if (!node) return;
  const wrapper = findWrapper(node);
  if (!wrapper) return;
  applySaved(wrapper, key);

  if (node.__wsDragWired) return; // attach listeners once per node
  node.__wsDragWired = true;

  // Keep grip clicks from reaching the card's own onClick handler.
  node.addEventListener("click", (e) => e.stopPropagation());

  node.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const cs = getComputedStyle(wrapper);
    const origX = parseFloat(wrapper.style.left || cs.left) || 0;
    const origY = parseFloat(wrapper.style.top || cs.top) || 0;
    const onMove = (ev) => {
      wrapper.style.left = origX + (ev.clientX - startX) + "px";
      wrapper.style.top = origY + (ev.clientY - startY) + "px";
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      try {
        localStorage.setItem(posKey(key), JSON.stringify({
          x: parseFloat(wrapper.style.left) || 0,
          y: parseFloat(wrapper.style.top) || 0,
        }));
      } catch (e) { /* storage unavailable */ }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Double-click the grip to snap back to the card's default LAYOUT slot.
  node.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.removeItem(posKey(key)); } catch (e) { /* ignore */ }
    wrapper.style.left = "";
    wrapper.style.top = "";
  });
};

const initResize = (node, key) => {
  if (!node) return;
  const wrapper = findWrapper(node);
  if (!wrapper) return;
  applySaved(wrapper, key);

  if (node.__wsResizeWired) return;
  node.__wsResizeWired = true;

  node.addEventListener("click", (e) => e.stopPropagation());

  node.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const cs = getComputedStyle(wrapper);
    // Layout width/height are unaffected by transform, so they stay constant.
    const baseW = parseFloat(cs.width) || 1;
    const baseH = parseFloat(cs.height) || 1;
    const m = /scale\(([^)]+)\)/.exec(wrapper.style.transform || "");
    const origScale = m ? parseFloat(m[1]) || 1 : 1;
    const onMove = (ev) => {
      const delta = (ev.clientX - startX + (ev.clientY - startY)) / (baseW + baseH);
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, origScale + delta));
      wrapper.style.transform = `scale(${next})`;
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      const m2 = /scale\(([^)]+)\)/.exec(wrapper.style.transform || "");
      try { localStorage.setItem(scaleKey(key), String(m2 ? m2[1] : 1)); }
      catch (e) { /* storage unavailable */ }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Double-click the corner to restore the card's default size.
  node.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.removeItem(scaleKey(key)); } catch (e) { /* ignore */ }
    wrapper.style.transform = "";
  });
};

// Each handle takes the widget's LAYOUT key so position and scale are stored
// per widget. DragHandle renders top-left, ResizeHandle bottom-right.
const DragHandle = ({ k }) =>
  h("div", { className: "ws-drag", title: "Drag to move · double-click to reset",
             ref: (n) => initDrag(n, k) }, "☰");

const ResizeHandle = ({ k }) =>
  h("div", { className: "ws-resize", title: "Drag to resize · double-click to reset",
             ref: (n) => initResize(n, k) }, "⤡");

// Last-known-good cache, persisted in localStorage with a timestamp.
const remember = (key, data) => {
  try { localStorage.setItem(`ws:${key}`, JSON.stringify({ data, ts: Date.now() })); }
  catch (e) { /* storage unavailable; skip */ }
};

const recall = (key) => {
  try { return JSON.parse(localStorage.getItem(`ws:${key}`)); }
  catch (e) { return null; }
};

const clockStamp = (ms) =>
  new Date(ms).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

// True before the command has produced any output (the initial load tick).
const isLoading = ({ output, error }) =>
  output === undefined && !error;

// Standard data flow for command-backed widgets. parse(output) must return a
// falsy value when there is nothing usable.
//   loading -> { loading: true }            render <Skel/>
//   success -> { data }                     cached as last-known-good
//   failure -> { data, staleTs }            last-known-good + time, render <Stale/>
//   cold    -> { data, mock: true }         mock data, nothing cached yet
const resolve = (key, props, parse, mock) => {
  if (isLoading(props)) return { loading: true };
  let data = null;
  try { data = parse(props.output); } catch (e) { data = null; }
  if (data) { remember(key, data); return { data }; }
  const cached = recall(key);
  if (cached && cached.data) return { data: cached.data, staleTs: cached.ts };
  return { data: mock, mock: true };
};
// --- End inlined design system ---

// window-pet — a small robot that lives behind your windows. It stands on their
// top edges, peeks out from beside them, rides one when you drag it, falls when
// you close the one under its feet, and sleeps on the desktop floor when
// nothing is happening. Übersicht draws every widget behind app windows, so
// the pet is a creature of the gaps: you see it wherever no window covers it.
//
// Geometry comes from a tiny daemon (setup/windowd.swift, compiled by
// install.sh) that streams window bounds over server-sent events on
// 127.0.0.1. Without it, the widget falls back to a once-a-second snapshot.
// If the agent-fleet widget is installed, the pet also reads its JSON and
// changes mood: busy while agents run, waving when one waits on you.
//
// Sprites are the WindowPet app's own frames (MIT), 4 palettes. Pick one in
// ~/.config/widgetsuite/window-pet.json: {"palette":"sakura","size":72}.

const KEY = "windowpet";
const SPR = "window-pet.widget/sprites";
const PALETTES = ["midnight", "sakura", "seafoam", "tinplate"];
const FRAMES = { idle: 3, walk: 10, look: 3, fidget: 4, blink: 1, jump: 1, fall: 2, land: 2, sleep: 2 };
const FPS = { idle: 3, walk: 12, look: 4, fidget: 6, blink: 8, jump: 1, fall: 8, land: 8, sleep: 1.2 };
const PORT = 41727;
const FONTS = "window-pet.widget/fonts";

export const command = String.raw`W="$HOME/.config/widgetsuite/windowd"; if [ -x "$W" ]; then "$W" --once; else osascript -l JavaScript <<'JXA'
// Fallback window snapshot without a compiled helper: one JSON object on stdout.
ObjC.import('CoreGraphics'); ObjC.import('AppKit');
const opts = $.kCGWindowListOptionOnScreenOnly | $.kCGWindowListExcludeDesktopElements;
const ref = $.CGWindowListCopyWindowInfo(opts, $.kCGNullWindowID);
const list = ref ? ObjC.castRefToObject(ref).js : [];
const windows = []; let z = 0;
for (const item of list) {
  const d = ObjC.deepUnwrap(item) || {};
  if (d.kCGWindowLayer !== 0) continue;
  if ((d.kCGWindowAlpha == null ? 1 : d.kCGWindowAlpha) <= 0.05) continue;
  const b = d.kCGWindowBounds; if (!b || b.Width < 120 || b.Height < 60) continue;
  windows.push({ id: d.kCGWindowNumber, pid: d.kCGWindowOwnerPID, x: b.X, y: b.Y, w: b.Width, h: b.Height, z: z++ });
}
const screens = $.NSScreen.screens; const n = screens.count; const displays = [];
const ph = screens.objectAtIndex(0).frame.size.height;
for (let i = 0; i < n; i++) {
  const s = screens.objectAtIndex(i); const f = s.frame, v = s.visibleFrame;
  displays.push({ id: i, x: f.origin.x, y: ph - (f.origin.y + f.size.height), w: f.size.width, h: f.size.height,
                  vx: v.origin.x, vy: ph - (v.origin.y + v.size.height), vw: v.size.width, vh: v.size.height, main: i === 0 });
}
JSON.stringify({ t: Date.now() / 1000, windows, displays });
JXA
fi; echo; cat "$HOME/.config/widgetsuite/fleet.json" 2>/dev/null; echo; cat "$HOME/.config/widgetsuite/window-pet.json" 2>/dev/null`;

export const refreshFrequency = 1000 * 2; // fallback cadence; the daemon stream is used when reachable

export const className = `
  position: absolute; left: 0; top: 0; width: 100vw; height: 100vh;
  overflow: hidden; pointer-events: none; z-index: 40;
  .pet { position:absolute; left:0; top:0; will-change: transform; pointer-events: auto; cursor: grab; touch-action: none; }
  .pet.held { cursor: grabbing; }
  .pet img { display:block; width:100%; height:100%; image-rendering: pixelated; -webkit-user-drag: none; }
  .pet.flip img { transform: scaleX(-1); }
  .shadow { position:absolute; left:18%; right:18%; bottom:-3px; height:6px; border-radius:50%; background: rgba(0,0,0,0.28); filter: blur(2px); }
  @font-face { font-family: "Press Start 2P"; src: url("${FONTS}/PressStart2P-400.woff2") format("woff2"); }
  .bubble { position:absolute; left:50%; bottom:100%; transform: translate(-50%, -12px); white-space:nowrap;
            font: 7px/1.5 "Press Start 2P", monospace; text-transform:uppercase; color:#1D1D1B; background:#FFF8E7; padding: 7px 9px 5px;
            box-shadow: 0 0 0 2px #1D1D1B, 0 0 0 4px #FFF8E7, 0 0 0 6px #1D1D1B, 6px 8px 0 4px rgba(0,0,0,0.35); animation: wp-pop .18s steps(3, end); }
  .bubble::after { content:""; position:absolute; left:50%; top:100%; width:6px; height:6px; margin: 6px 0 0 -3px; background:#FFF8E7; box-shadow: 0 0 0 2px #1D1D1B, 0 6px 0 -1px #1D1D1B; }
  .bubble.alert { background:#FFD98A; }
  .bubble.alert::after { background:#FFD98A; }
  @keyframes wp-pop { from { opacity:0; transform: translate(-50%, -4px); } to { opacity:1; transform: translate(-50%, -12px); } }
  .zz { position:absolute; left: 70%; bottom: 90%; font: 8px/1 "Press Start 2P", monospace; color:#FFF8E7; text-shadow: 1px 1px 0 #1D1D1B, -1px -1px 0 #1D1D1B, 1px -1px 0 #1D1D1B, -1px 1px 0 #1D1D1B; animation: wp-zz 2.4s steps(6, end) infinite; opacity:0; }
  .zz:nth-child(2) { animation-delay: .8s; } .zz:nth-child(3) { animation-delay: 1.6s; }
  @keyframes wp-zz { 0% { opacity:0; transform: translate(0,0); } 15% { opacity:1; } 100% { opacity:0; transform: translate(14px, -26px); } }
  .dust { position:absolute; bottom: -2px; left: 50%; width: 5px; height: 5px; background: rgba(230,226,216,0.9); box-shadow: 0 0 0 1px rgba(0,0,0,0.25); animation: wp-dust .45s steps(5, end) forwards; }
  @keyframes wp-dust { 0% { opacity:1; transform: translate(0, 0); } 100% { opacity:0; transform: translate(var(--dx), -10px) scale(1.6); } }
  @media (prefers-reduced-motion: reduce) { .bubble { animation:none; } }
`;

// ---------------------------------------------------------------------------
// Engine: geometry in, pet state out. Runs on requestAnimationFrame.
// ---------------------------------------------------------------------------
const Engine = (() => {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const savedCfg = (recall("windowpet-cfg") || {}).data || {};
  const cfg = { palette: savedCfg.palette || "midnight", size: savedCfg.size || 72, speed: 1 };
  const pet = { x: 300, y: 0, vx: 0, vy: 0, dir: 1, state: "fall", t: 0, anim: "fall", frame: 0, ft: 0, on: null, onWin: null, idleStreak: 0, plan: null, bubble: null, bubbleT: 0 };
  let geo = null, plats = [], floorY = 600, mood = "calm", fleet = null, moodT = 0, lastRun = 0, sse = null, sseOK = false, listeners = new Set();
  const notify = () => listeners.forEach((f) => f());

  // Map CG global coords to this widget layer (the screen minus the menu bar).
  const pick = (g) => {
    const ds = g.displays || []; if (!ds.length) return { x: 0, y: 0, mb: 0, w: innerWidth, h: innerHeight, vbottom: innerHeight };
    const mbOf = (d) => Math.max(0, d.vy - d.y);
    let d = ds.find((d) => Math.round(d.w) === innerWidth && Math.round(d.h - mbOf(d)) === innerHeight) || ds.find((d) => d.main) || ds[0];
    const mb = mbOf(d);
    return { x: d.x, y: d.y + mb, mb, w: d.w, h: d.h - mb, vbottom: (d.vy + d.vh) - (d.y + mb) };
  };
  const rebuild = () => {
    if (!geo) return;
    const m = pick(geo); const S = cfg.size;
    floorY = Math.min(innerHeight, m.vbottom);
    const wins = (geo.windows || []).map((w) => ({ id: w.id, z: w.z, x: w.x - m.x, y: w.y - m.y, w: w.w, h: w.h }));
    const out = [];
    const cut = (segs, x1, x2) => segs.flatMap(([a, b]) => (x2 <= a || x1 >= b) ? [[a, b]] : [[a, Math.max(a, x1)], [Math.min(b, x2), b]].filter(([p, q]) => q - p > S * 0.9));
    // Floor first, then every window's top edge, minus every window that would hide the body above it.
    const bands = [{ id: "floor", y: floorY, x1: 0, x2: innerWidth, win: null }].concat(
      wins.filter((w) => w.y > S * 0.5 && w.y < floorY - 4).map((w) => ({ id: w.id, y: w.y, x1: w.x, x2: w.x + w.w, win: w })));
    for (const b of bands) {
      let segs = [[Math.max(0, b.x1), Math.min(innerWidth, b.x2)]];
      for (const o of wins) {
        if (b.win && o.id === b.win.id) continue;
        if (o.y < b.y + 2 && o.y + o.h > b.y - S) segs = cut(segs, o.x, o.x + o.w);
        if (!segs.length) break;
      }
      for (const [x1, x2] of segs) if (x2 - x1 >= S * 0.9) out.push({ id: b.id, y: b.y, x1, x2, win: b.win });
    }
    plats = out;
  };
  const feed = (g) => { if (!g || !g.windows) return; geo = g; rebuild(); };
  const setFleet = (f) => {
    fleet = f; const t = f && f.totals; const next = t && t.needs ? "alert" : t && t.running ? "busy" : "calm";
    if (next !== mood) { mood = next; moodT = 0; if (mood === "alert") say(`${t.needs} waiting on you`, "alert", 9); else if (mood === "busy") say(`${t.running} agent${t.running > 1 ? "s" : ""} working`, "", 4); }
  };
  const say = (text, kind, secs) => { pet.bubble = { text, kind }; pet.bubbleT = secs; notify(); };
  const connect = () => {
    if (sse || typeof EventSource === "undefined") return;
    try {
      sse = new EventSource(`http://127.0.0.1:${PORT}/events`);
      sse.onmessage = (e) => { try { feed(JSON.parse(e.data)); sseOK = true; } catch (err) {} };
      sse.onerror = () => { sseOK = false; };
    } catch (e) { sse = null; }
  };
  const under = (x, yFrom, yTo) => plats.filter((p) => x >= p.x1 && x <= p.x2 && p.y >= yFrom - 0.01 && p.y <= yTo).sort((a, b) => a.y - b.y)[0];
  const setState = (s, anim) => { pet.state = s; pet.t = 0; if (anim && anim !== pet.anim) { pet.anim = anim; pet.frame = 0; pet.ft = 0; } };
  const findPlat = (id) => plats.find((p) => p.id === id);
  const jumpTarget = () => {
    const S = cfg.size, reach = 170, ahead = pet.dir;
    const cands = plats.filter((p) => p.id !== pet.on && Math.abs(p.y - pet.y) < 140 && ((ahead > 0 && p.x1 > pet.x - S && p.x1 < pet.x + reach) || (ahead < 0 && p.x2 < pet.x + S && p.x2 > pet.x - reach)));
    return cands[Math.floor(Math.random() * cands.length)] || null;
  };
  const speed = () => (mood === "busy" ? 92 : 58) * cfg.speed;
  const step = (dt) => {
    const S = cfg.size, G = 1150;
    pet.t += dt; pet.ft += dt; moodT += dt;
    if (pet.bubble) { pet.bubbleT -= dt; if (pet.bubbleT <= 0) { pet.bubble = null; notify(); } }
    // Ride the window we stand on; fall if it went away or moved from under us.
    if (pet.on && pet.on !== "floor") {
      const p = findPlat(pet.on);
      if (!p) { pet.on = null; setState("fall", "fall"); pet.vy = 0; pet.vx = pet.dir * 20; }
      else {
        if (pet.onWin && p.win) { pet.x += p.win.x - pet.onWin.x; pet.onWin = p.win; }
        pet.y = p.y;
        if (pet.x < p.x1 || pet.x > p.x2) { pet.on = null; setState("fall", "fall"); pet.vy = 0; pet.vx = 0; }
      }
    } else if (pet.on === "floor") { pet.y = floorY; }
    if (pet.held) { pet.anim = "look"; const n = FRAMES[pet.anim], fps = FPS[pet.anim]; if (pet.ft > 1 / fps) { pet.ft = 0; pet.frame = (pet.frame + 1) % n; } return; }
    switch (pet.state) {
      case "idle": case "look": case "fidget": case "blink": {
        pet.idleStreak += dt;
        const dur = pet.state === "idle" ? pet.plan || (pet.plan = rnd(1.4, mood === "calm" ? 4.5 : 2.5)) : pet.state === "blink" ? 0.18 : pet.state === "look" ? 1.3 : 1.7;
        if (pet.t > dur) {
          pet.plan = null;
          if (mood === "calm" && pet.idleStreak > rnd(28, 60)) { setState("sleep", "sleep"); break; }
          const r = Math.random();
          if (pet.state !== "idle") setState("idle", "idle");
          else if (r < 0.34) { pet.dir = Math.random() < 0.5 ? -1 : 1; pet.plan = rnd(0.8, 3.6); setState("walk", "walk"); }
          else if (r < 0.5) setState("look", "look");
          else if (r < 0.66) setState("fidget", "fidget");
          else if (r < 0.78) setState("blink", "blink");
          else if (mood === "alert" && r < 0.95) { setState("jump", "jump"); pet.vy = -330; pet.vx = 0; pet.on = null; }
          else setState("idle", "idle");
        }
        break;
      }
      case "sleep": {
        if (mood !== "calm" || pet.t > rnd(25, 70)) { pet.idleStreak = 0; setState("idle", "idle"); }
        break;
      }
      case "walk": {
        pet.idleStreak = 0;
        const p = pet.on === "floor" ? { x1: 0, x2: innerWidth } : findPlat(pet.on);
        if (!p) { setState("idle", "idle"); break; }
        pet.x += pet.dir * speed() * dt;
        const edge = pet.dir > 0 ? pet.x + S * 0.35 > p.x2 : pet.x - S * 0.35 < p.x1;
        if (edge) {
          pet.x = pet.dir > 0 ? p.x2 - S * 0.35 : p.x1 + S * 0.35;
          const tgt = jumpTarget(); const r = Math.random();
          if (tgt && r < 0.6) { pet.on = null; setState("jump", "jump"); pet.vx = pet.dir * (Math.min(240, Math.abs((pet.dir > 0 ? tgt.x1 + S : tgt.x2 - S) - pet.x) * 1.6) + 40); pet.vy = -Math.max(300, 330 + (pet.y - tgt.y) * 1.2); }
          else if (r < 0.75 && pet.on !== "floor") { pet.on = null; setState("fall", "fall"); pet.vx = pet.dir * 30; pet.vy = 0; }
          else { pet.dir = -pet.dir; setState("idle", "idle"); }
        } else if (pet.t > pet.plan) setState("idle", "idle");
        break;
      }
      case "jump": case "fall": {
        const py = pet.y; pet.vy += G * dt; pet.x += pet.vx * dt; pet.y += pet.vy * dt;
        if (pet.vy > 0 && pet.anim !== "fall") { pet.anim = "fall"; pet.frame = 0; }
        pet.x = Math.max(S * 0.35, Math.min(innerWidth - S * 0.35, pet.x));
        if (pet.vy > 0) {
          const land = under(pet.x, py, pet.y);
          if (land) { pet.y = land.y; pet.on = land.id; pet.onWin = land.win; pet.vx = 0; pet.vy = 0; pet.lands = (pet.lands || 0) + 1; setState("land", "land"); }
          else if (pet.y >= floorY) { pet.y = floorY; pet.on = "floor"; pet.onWin = null; pet.vx = 0; pet.vy = 0; pet.lands = (pet.lands || 0) + 1; setState("land", "land"); }
        }
        break;
      }
      case "land": { if (pet.t > 0.26) setState("idle", "idle"); break; }
    }
    // Sprite frame advance.
    const n = FRAMES[pet.anim] || 1, fps = FPS[pet.anim] || 6;
    if (pet.ft > 1 / fps) { pet.ft = 0; pet.frame = (pet.frame + 1) % n; }
    if (pet.on === "floor" && pet.state === "idle" && pet.y !== floorY) pet.y = floorY;
  };
  // A timer, not requestAnimationFrame: Übersicht's desktop WebView throttles
  // rAF when it is not the front window, and the pet must keep moving.
  let timer = null, lastT = 0;
  const loop = () => {
    const ts = performance.now(); const dt = Math.min(0.05, (ts - (lastT || ts)) / 1000); lastT = ts;
    if (!geo && !plats.length) { floorY = innerHeight; }
    step(dt); notify();
  };
  const start = () => { if (timer == null) { connect(); timer = setInterval(loop, 16); } };
  const applyCfg = (c) => { if (!c) return; if (PALETTES.includes(c.palette)) cfg.palette = c.palette; if (c.size >= 40 && c.size <= 160) cfg.size = c.size; if (c.speed > 0) cfg.speed = c.speed; remember("windowpet-cfg", { palette: cfg.palette, size: cfg.size }); rebuild(); };
  const stopStream = () => { if (sse) { sse.close(); sse = null; } sseOK = false; };
  // Interaction mode: pick the pet up and drop it, or tap it for a boop.
  const pickUp = (x, y) => { pet.held = true; pet.on = null; pet.vx = 0; pet.vy = 0; pet.x = x; pet.y = y + cfg.size / 2; setState("fall", "look"); notify(); };
  const dragTo = (x, y) => { if (!pet.held) return; pet.x = x; pet.y = y + cfg.size / 2; };
  const drop = () => { if (!pet.held) return; pet.held = false; setState("fall", "fall"); pet.vy = 0; };
  const boop = () => { if (pet.on) { pet.on = null; pet.vy = -300; pet.vx = 0; setState("jump", "jump"); } say("!", "", 1.2); pet.idleStreak = 0; };
  return { pet, cfg, feed, setFleet, applyCfg, start, stopStream, pickUp, dragTo, drop, boop, tick: (dt) => step(dt), sub: (f) => { listeners.add(f); return () => listeners.delete(f); }, get sseOK() { return sseOK; }, get mood() { return mood; }, get plats() { return plats; } };
})();

if (typeof window !== "undefined") window.__windowPet = Engine; // debug hook

// Preload every frame of the chosen palette once so animation never flickers.
const preloaded = new Set();
const preload = (pal) => { if (preloaded.has(pal)) return; preloaded.add(pal); Object.entries(FRAMES).forEach(([a, n]) => { for (let i = 0; i < n; i++) { const im = new Image(); im.src = `${SPR}/${pal}/${a}_${i}.png`; } }); };

function Pet() {
  const ref = React.useRef(null);
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    preload(Engine.cfg.palette); Engine.start();
    let lastAnim = "", lastFrame = -1, lastFlip = null, lastBubble = null, lastState = "";
    return Engine.sub(() => {
      const p = Engine.pet, S = Engine.cfg.size, el = ref.current; if (!el) return;
      el.style.width = S + "px"; el.style.height = S + "px";
      el.style.transform = `translate3d(${Math.round(p.x - S / 2)}px, ${Math.round(p.y - S)}px, 0)`;
      const flip = p.dir < 0;
      if (p.anim !== lastAnim || p.frame !== lastFrame || flip !== lastFlip || p.bubble !== lastBubble || p.state !== lastState) { lastAnim = p.anim; lastFrame = p.frame; lastFlip = flip; lastBubble = p.bubble; lastState = p.state; force(); }
    });
  }, []);
  const p = Engine.pet, pal = Engine.cfg.palette;
  const press = React.useRef(null);
  const onDown = (e) => { e.currentTarget.setPointerCapture(e.pointerId); press.current = { x: e.clientX, y: e.clientY, t: Date.now(), moved: false }; };
  const onMove = (e) => { const s = press.current; if (!s) return; if (!s.moved && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 6) { s.moved = true; Engine.pickUp(e.clientX, e.clientY); } if (s.moved) Engine.dragTo(e.clientX, e.clientY); };
  const onUp = (e) => { const s = press.current; press.current = null; if (!s) return; if (s.moved) Engine.drop(); else Engine.boop(); };
  return (
    <div className={`pet ${p.dir < 0 ? "flip" : ""} ${p.held ? "held" : ""}`} ref={ref} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      {p.on ? <div className="shadow" /> : null}
      <img src={`${SPR}/${pal}/${p.anim}_${p.frame}.png`} alt="" draggable={false} />
      {p.bubble ? <div className={`bubble ${p.bubble.kind || ""}`}>{p.bubble.text}</div> : null}
      {p.state === "sleep" ? <><span className="zz">z</span><span className="zz">z</span><span className="zz">z</span></> : null}
      {p.state === "land" ? [-16, -6, 6, 16].map((dx, i) => <i key={`${p.lands}-${i}`} className="dust" style={{ "--dx": `${dx}px`, marginLeft: `${dx / 2}px` }} />) : null}
    </div>
  );
}

// The command prints three JSON documents separated by blank lines: a window
// snapshot (only used while the daemon stream is unreachable), the fleet
// summary (if agent-fleet is installed), and the user config (if any).
const feedOutput = (out) => {
  if (!out) return;
  const docs = out.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean).map((s) => { try { return JSON.parse(s); } catch (e) { return null; } });
  for (const d of docs) {
    if (!d) continue;
    if (Array.isArray(d.windows)) { if (!Engine.sseOK) Engine.feed(d); }
    else if (Array.isArray(d.sessions)) Engine.setFleet(d);
    else if (d.palette || d.size || d.speed) Engine.applyCfg(d);
  }
};

export const render = (props) => {
  feedOutput(props.output);
  return <Pet />;
};
