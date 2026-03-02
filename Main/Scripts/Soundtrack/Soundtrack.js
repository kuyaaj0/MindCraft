/* Scripts/Soundtrack/soundtrack.js
   MindCraft — Full soundtrack player (fixed & theme-aware)
   - Uses: ../Assets/Music/Soundtrack/*.mp3
           ../Assets/Image/Soundtrack/*.png|.jpg
   - Draggable, responsive, burger-dropdown for extras
   - Remembers index/position/volume/shuffle/repeat via localStorage
   - Theme-aware: responds to body.theme-dark or localStorage.theme
   - Robust cover fallback + improved SVG visibility
   - Designed so you can include this module on every page;
     it resumes from saved position (keeps playback state between pages).
*/
(function () {
  if (document.getElementById("mc-soundtrack-root")) return;

  // -----------------------
  // Configure tracks here
  // (Paths are relative to the page that loads the script — adjust if needed)
  // -----------------------
  const tracks = [
  { src: "../../Assets/Soundtrack/Music/C418 - Minecraft - MVA.mp3", title: "MindCraft", cover: "../../Assets/Image-Icon/Soundtrack/MVA.png" },
  { src: "../../Assets/Soundtrack/Music/C418 - Danny - MVA.mp3", title: "Danny", cover: "../../Assets/Image-Icon/Soundtrack/MVA.png" },
  { src: "../../Assets/Soundtrack/Music/C418 - Living Mice - MVA.mp3", title: "Living Mice", cover: "../../Assets/Image-Icon/Soundtrack/MVA.png" },
  { src: "../../Assets/Soundtrack/Music/C418 - Haggstrom - MVA.mp3", title: "Haggstrom", cover: "../../Assets/Image-Icon/Soundtrack/MVA.png" },
  { src: "../../Assets/Soundtrack/Music/C418 - Subwoofer Lullaby - MVA.mp3", title: "Subwoofer Lullaby", cover: "../../Assets/Image-Icon/Soundtrack/MVA.png" }
];

  // -----------------------
  // localStorage keys
  // -----------------------
  const LS_INDEX = "mc_soundtrack_index_v3";
  const LS_POS = "mc_soundtrack_pos_v3";
  const LS_VOL = "mc_soundtrack_vol_v3";
  const LS_SHUFFLE = "mc_soundtrack_shuffle_v3";
  const LS_REPEAT = "mc_soundtrack_repeat_v3";
  const LS_PLAYING = "mc_soundtrack_playing_v3";

  // -----------------------
  // Create root node & inject CSS
  // -----------------------
  const root = document.createElement("div");
  root.id = "mc-soundtrack-root";
  root.setAttribute("role", "region");
  root.setAttribute("aria-label", "MindCraft soundtrack player");
  document.body.appendChild(root);

  const css = `
  /* ===== MindCraft soundtrack player (injected) ===== */
  #mc-soundtrack-root {
    position: fixed;
    right: 18px;
    bottom: 18px;
    z-index: 4000;
    font-family: 'Press Start 2P', cursive;
    --bg-light: rgba(232, 244, 255, 0.95); /* gentle light card */
    --panel-border-light: rgba(139,111,71,0.12);
    --text-light: #3b2a15; /* teammate brown text */
    --accent-1: #d9b16c;
    --accent-2: #a97c4b;

    /* dark theme palette (matching your project) */
    --bg-dark: rgba(10,14,24,0.92);
    --panel-border-dark: rgba(90,121,184,0.12);
    --text-dark: #f7ead7;

    --bg: var(--bg-light);
    --panel-border: var(--panel-border-light);
    --text: var(--text-light);

    width: auto;
    user-select: none;
    touch-action: none;
  }

  /* when theme-dark is active on body, switch vars */
  body.theme-dark #mc-soundtrack-root,
  html[data-theme="dark"] #mc-soundtrack-root {
    --bg: var(--bg-dark);
    --panel-border: var(--panel-border-dark);
    --text: var(--text-dark);
    --accent-1: #263758;
    --accent-2: #5a79b8;
  }

  /* Container panel (tiny rectangle) */
  #mc-soundtrack-root .mc-panel {
    display:flex;
    gap:10px;
    align-items:center;
    padding:8px;
    background: var(--bg);
    border: 1px solid var(--panel-border);
    color: var(--text);
    min-width: 270px;
    max-width: 360px;
    height: 72px;
    border-radius: 12px;
    box-sizing: border-box;
    box-shadow: 0 8px 28px rgba(0,0,0,0.16);
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    position: relative;
  }

  /* cover */
  #mc-soundtrack-root .mc-cover {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    object-fit: cover;
    flex: 0 0 auto;
    border: 1px solid rgba(0,0,0,0.06);
    background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.03));
    display:flex;
    align-items:center;
    justify-content:center;
    overflow:hidden;
  }
  #mc-soundtrack-root .mc-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display:block;
  }
  /* fallback cover (when image missing): show text */
  #mc-soundtrack-root .mc-cover .mc-fallback {
    font-size: 0.55rem;
    color: rgba(0,0,0,0.35);
    text-align:center;
    padding:6px;
  }
  body.theme-dark #mc-soundtrack-root .mc-cover .mc-fallback { color: rgba(255,255,255,0.12); }

  /* meta (title + progress) */
  #mc-soundtrack-root .mc-meta {
    display:flex;
    flex-direction:column;
    gap:6px;
    flex: 1 1 auto;
    min-width: 0;
    padding-left:4px;
    padding-right:4px;
  }
  #mc-soundtrack-root .mc-title {
    font-size: 0.62rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text);
    margin-bottom: 0;
    line-height: 1;
  }
  #mc-soundtrack-root .mc-progress {
    height: 6px;
    width:100%;
    background: rgba(0,0,0,0.06);
    border-radius: 6px;
    overflow:hidden;
  }
  #mc-soundtrack-root .mc-progress > i {
    display:block;
    height:100%;
    width:0%;
    background: linear-gradient(90deg, var(--accent-1), var(--accent-2));
    transition: width 180ms linear;
  }

  /* controls area */
  #mc-soundtrack-root .mc-controls {
    display:flex;
    flex-direction:column;
    gap:6px;
    align-items:center;
    justify-content:center;
    flex: 0 0 auto;
  }

  #mc-soundtrack-root .mc-controls .mc-btn-row {
    display:flex;
    gap:8px;
    align-items:center;
    justify-content:center;
  }

  /* buttons */
  #mc-soundtrack-root button.mc-btn {
    appearance:none;
    -webkit-appearance:none;
    border:none;
    background: transparent;
    width:36px;
    height:36px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding:6px;
    border-radius:8px;
    cursor:pointer;
    transition: transform 120ms ease, background 120ms ease;
    color: var(--text);
  }
  #mc-soundtrack-root button.mc-btn:hover {
    transform: translateY(-3px);
    background: rgba(0,0,0,0.06);
  }
  body.theme-dark #mc-soundtrack-root button.mc-btn:hover {
    background: rgba(255,255,255,0.04);
  }

  /* big play */
  #mc-soundtrack-root button.mc-btn.play {
    width:44px;
    height:44px;
    background: linear-gradient(180deg,var(--accent-1), var(--accent-2));
    color: #fff;
    box-shadow: 0 4px 0 rgba(0,0,0,0.18);
  }

  /* svg icon visible styling */
  #mc-soundtrack-root button.mc-btn svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
    filter: drop-shadow(0 1px 0 rgba(0,0,0,0.35));
  }
  body.theme-dark #mc-soundtrack-root button.mc-btn svg { filter: drop-shadow(0 1px 0 rgba(0,0,0,0.6)); }

  /* burger dropdown (inside the rectangle) */
  #mc-soundtrack-root .mc-burger-wrapper {
    position: relative;
    display:flex;
    align-items:center;
    margin-left:6px;
  }
  #mc-soundtrack-root .mc-burger {
    width:28px;
    height:28px;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    border-radius:6px;
  }
  #mc-soundtrack-root .mc-dropdown {
    position:absolute;
    right: 0;
    top: 36px;
    background: var(--bg);
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    padding: 8px;
    display:none;
    flex-direction:column;
    min-width: 170px;
    gap:6px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
    z-index: 5000;
  }
  #mc-soundtrack-root .mc-dropdown button.mc-btn {
    width: 100%;
    height: 36px;
    justify-content:flex-start;
    gap:8px;
    padding-left:8px;
    color: var(--text);
  }
  #mc-soundtrack-root .mc-dropdown .mc-vol-row { display:flex; align-items:center; gap:8px; padding:4px 6px; }
  #mc-soundtrack-root input[type="range"].mc-range { width: 100%; -webkit-appearance:none; background:transparent; }
  #mc-soundtrack-root input[type="range"].mc-range::-webkit-slider-runnable-track { height:6px; background: rgba(0,0,0,0.06); border-radius:6px; }
  #mc-soundtrack-root input[type="range"].mc-range::-webkit-slider-thumb { -webkit-appearance:none; width:12px;height:12px;border-radius:50%; background:var(--accent-1); box-shadow:0 2px 0 rgba(0,0,0,0.15); margin-top:-3px; }

  /* compact sizes */
  @media (max-width: 600px) {
    #mc-soundtrack-root { right: 12px; bottom: 12px; }
    #mc-soundtrack-root .mc-panel { min-width: 230px; max-width: 280px; height: 68px; padding:6px; }
    #mc-soundtrack-root .mc-cover { width:50px; height:50px; }
    #mc-soundtrack-root button.mc-btn { width:32px; height:32px; }
    #mc-soundtrack-root button.mc-btn.play { width:38px; height:38px; }
  }
  @media (max-width: 401px) {
    #mc-soundtrack-root { right: 8px; bottom: 8px; }
    #mc-soundtrack-root .mc-panel { min-width: 200px; max-width: 240px; height: 64px; padding:6px; }
    #mc-soundtrack-root .mc-cover { width:44px; height:44px; }
    #mc-soundtrack-root button.mc-btn.play { width:36px; height:36px; }
    #mc-soundtrack-root .mc-dropdown { min-width: 140px; }
  }
  `;

  const style = document.createElement("style");
  style.id = "mc-soundtrack-style";
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  // -----------------------
  // SVG icon strings (use currentColor)
  // -----------------------
  const SVG = {
    prev: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6v12l8.5-6L6 6zm10 0v12h2V6h-2z"/></svg>`,
    next: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6v12l-8.5-6L16 6zm4 0v12h2V6h-2z"/></svg>`,
    play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    burger: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/></svg>`,
    shuffle: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.59 6.59L8.17 9H11c1.1 0 2 .9 2 2v1h2V11c0-1.1-.9-2-2-2H8.17l2.42-2.41L10 6 6 10l4 4 1.41-1.41L8.83 12H13c1.1 0 2-.9 2-2V9h2v1c0 1.1-.9 2-2 2h-4.17l2.42 2.41L14 18l4-4-4-4-1.41 1.41z"/></svg>`,
    repeat: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v5z"/></svg>`,
    volume: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9v6h4l5 5V4l-5 5H7z"/></svg>`
  };

  // -----------------------
  // Build DOM markup
  // -----------------------
  root.innerHTML = `
    <div class="mc-panel" id="mc-panel" tabindex="0">
      <div class="mc-cover" id="mc-cover" title="Click to play/pause">
        <img id="mc-cover-img" alt="cover" crossorigin="anonymous" />
        <div class="mc-fallback" id="mc-cover-fallback" style="display:none;">cover</div>
      </div>

      <div class="mc-meta" id="mc-meta">
        <div class="mc-title" id="mc-title">Loading…</div>
        <div class="mc-progress" id="mc-progress" title="progress"><i id="mc-progress-bar"></i></div>
      </div>

      <div class="mc-controls" id="mc-controls">
        <div class="mc-btn-row">
          <button class="mc-btn" id="mc-prev" title="Previous">${SVG.prev}</button>
          <button class="mc-btn play" id="mc-play" title="Play">${SVG.play}</button>
          <button class="mc-btn" id="mc-next" title="Next">${SVG.next}</button>
        </div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
          <div class="mc-burger-wrapper">
            <div class="mc-burger" id="mc-burger" title="More">${SVG.burger}</div>
            <div class="mc-dropdown" id="mc-dropdown" aria-hidden="true">
              <button class="mc-btn" id="mc-shuffle" title="Shuffle">${SVG.shuffle} <span style="margin-left:8px;">Shuffle</span></button>
              <button class="mc-btn" id="mc-repeat" title="Repeat">${SVG.repeat} <span style="margin-left:8px;">Repeat</span></button>
              <div class="mc-vol-row" style="padding-top:4px;">
                ${SVG.volume}
                <input aria-label="volume" class="mc-range" id="mc-vol" type="range" min="0" max="1" step="0.01" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // -----------------------
  // References
  // -----------------------
  const panel = root.querySelector("#mc-panel");
  const cover = root.querySelector("#mc-cover");
  const coverImg = root.querySelector("#mc-cover-img");
  const coverFallback = root.querySelector("#mc-cover-fallback");
  const titleEl = root.querySelector("#mc-title");
  const progressBar = root.querySelector("#mc-progress-bar");
  const btnPrev = root.querySelector("#mc-prev");
  const btnNext = root.querySelector("#mc-next");
  const btnPlay = root.querySelector("#mc-play");
  const burgerBtn = root.querySelector("#mc-burger");
  const dropdown = root.querySelector("#mc-dropdown");
  const btnShuffle = root.querySelector("#mc-shuffle");
  const btnRepeat = root.querySelector("#mc-repeat");
  const volInput = root.querySelector("#mc-vol");

  // -----------------------
  // Create audio & state
  // -----------------------
  const audio = new Audio();
  audio.preload = "auto";
  audio.crossOrigin = "anonymous";

  let idx = Number(localStorage.getItem(LS_INDEX) || 0);
  if (!Number.isFinite(idx) || idx < 0 || idx >= tracks.length) idx = 0;

  let savedPos = Number(localStorage.getItem(LS_POS) || 0);
  if (!Number.isFinite(savedPos) || savedPos < 0) savedPos = 0;

  let volume = Number(localStorage.getItem(LS_VOL));
  if (!Number.isFinite(volume)) volume = 0.8;

  let shuffle = localStorage.getItem(LS_SHUFFLE) === "1";
  let repeat = localStorage.getItem(LS_REPEAT) === "1";
  let playing = localStorage.getItem(LS_PLAYING) === "1" ? true : false;

  let lastUpdate = 0;
  let lastSavedTimer = null;

  // -----------------------
  // Helpers
  // -----------------------
  function setThemeClass() {
    const dark = document.body.classList.contains("theme-dark") || localStorage.getItem("theme") === "dark";
    if (dark) root.classList.add("theme-dark");
    else root.classList.remove("theme-dark");
  }
  // initial theme
  setThemeClass();
  // watch for changes
  const mo = new MutationObserver(setThemeClass);
  mo.observe(document.body, { attributes: true, subtree: false, attributeFilter: ["class"] });
  window.addEventListener("storage", (e) => { if (e.key === "theme") setThemeClass(); });

  // escape html safe function (small)
  function escapeHtml(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  // set UI track info and try to load cover
  function renderTrack() {
    const t = tracks[idx];
    titleEl.textContent = t.title || `Track ${idx + 1}`;
    // cover
    coverImg.src = t.cover || "";
    coverImg.alt = escapeHtml(t.title || "cover");
    coverFallback.style.display = "none";
    coverImg.style.display = "block";
    // if image fails to load, show fallback text
    coverImg.onerror = () => {
      coverImg.style.display = "none";
      coverFallback.style.display = "block";
      coverFallback.textContent = (t.title || "cover").split(" ").slice(0,2).join(" ");
    };
    coverImg.onload = () => {
      coverImg.style.display = "block";
      coverFallback.style.display = "none";
    };
  }

  // apply play/pause icons & shuffle/repeat UI
  function renderPlayState() {
    btnPlay.innerHTML = playing ? SVG.pause : SVG.play;
    btnShuffle.style.opacity = shuffle ? "1" : "0.6";
    btnRepeat.style.opacity = repeat ? "1" : "0.6";
  }

  // set audio src and optionally seek
  function setTrack(i, seek = 0, autoplay = false) {
    idx = ((i % tracks.length) + tracks.length) % tracks.length;
    const t = tracks[idx];
    audio.src = t.src;
    audio.currentTime = 0;
    try { audio.load(); } catch (e) {}
    renderTrack();
    localStorage.setItem(LS_INDEX, String(idx));
    // try to restore saved pos only if seek parameter is 0 and savedPos exists
    const globalSavedPos = Number(localStorage.getItem(LS_POS) || 0);
    if (seek > 0) {
      audio.currentTime = Math.min(seek, audio.duration || seek);
    } else if (globalSavedPos > 0) {
      // global saved pos (shared across pages) — apply but only if reasonable
      try { audio.currentTime = globalSavedPos; } catch (e) { /* ignore */ }
    }
    if (autoplay) {
      tryPlay();
    } else {
      renderPlayState();
    }
  }

  // attempt to play, respect autoplay block
  function tryPlay() {
    const p = audio.play();
    if (p !== undefined) {
      p.then(() => { playing = true; renderPlayState(); localStorage.setItem(LS_PLAYING, "1"); })
       .catch(() => { playing = false; renderPlayState(); localStorage.setItem(LS_PLAYING, "0"); });
    }
  }

  // toggle play/pause
  function togglePlay() {
    if (!audio.src) setTrack(idx, 0, false);
    if (audio.paused) {
      tryPlay();
    } else {
      audio.pause();
      playing = false;
      renderPlayState();
      localStorage.setItem(LS_PLAYING, "0");
    }
  }

  function prevTrack() {
    if (audio.currentTime > 2) {
      audio.currentTime = 0;
      return;
    }
    if (shuffle) setTrack(Math.floor(Math.random() * tracks.length), 0, true);
    else setTrack(idx - 1, 0, true);
  }

  function nextTrack() {
    if (shuffle) setTrack(Math.floor(Math.random() * tracks.length), 0, true);
    else {
      const n = idx + 1;
      if (n >= tracks.length) {
        if (repeat) setTrack(0, 0, true);
        else { audio.pause(); playing = false; renderPlayState(); localStorage.setItem(LS_PLAYING, "0"); }
      } else setTrack(n, 0, true);
    }
  }

  // -----------------------
  // Audio event handlers
  // -----------------------
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration || isNaN(audio.duration)) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = pct + "%";

    const now = Date.now();
    if (now - lastUpdate > 2000) {
      lastUpdate = now;
      // save global position (shared). If you want per-track positions, change storage design.
      try { localStorage.setItem(LS_POS, String(Math.floor(audio.currentTime))); } catch (e) {}
      if (lastSavedTimer) clearTimeout(lastSavedTimer);
      lastSavedTimer = setTimeout(() => {
        try { localStorage.setItem(LS_POS, String(Math.floor(audio.currentTime))); } catch (e) {}
      }, 1000);
    }
  }, { passive: true });

  audio.addEventListener("play", () => { playing = true; renderPlayState(); localStorage.setItem(LS_PLAYING, "1"); });
  audio.addEventListener("pause", () => { playing = false; renderPlayState(); localStorage.setItem(LS_PLAYING, "0"); });
  audio.addEventListener("ended", () => {
    if (repeat) setTrack(idx, 0, true);
    else nextTrack();
  });

  // if metadata loaded, we can apply saved seek properly
  audio.addEventListener("loadedmetadata", () => {
    // If we have a saved position in localStorage, apply it (but not beyond duration)
    const saved = Number(localStorage.getItem(LS_POS) || 0);
    if (saved > 0 && saved < (audio.duration || Infinity)) {
      try { audio.currentTime = saved; } catch (e) { /* ignore */ }
    }
  });

  // -----------------------
  // UI event wiring
  // -----------------------
  btnPlay.addEventListener("click", (e) => { e.preventDefault(); togglePlay(); });
  btnPrev.addEventListener("click", (e) => { e.preventDefault(); prevTrack(); });
  btnNext.addEventListener("click", (e) => { e.preventDefault(); nextTrack(); });

  // burger dropdown
  burgerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const isOpen = dropdown.style.display === "flex";
    dropdown.style.display = isOpen ? "none" : "flex";
    dropdown.setAttribute("aria-hidden", isOpen ? "true" : "false");
  });

  // shuffle / repeat toggle inside dropdown
  btnShuffle.addEventListener("click", (e) => {
    e.preventDefault();
    shuffle = !shuffle;
    localStorage.setItem(LS_SHUFFLE, shuffle ? "1" : "0");
    renderPlayState();
  });
  btnRepeat.addEventListener("click", (e) => {
    e.preventDefault();
    repeat = !repeat;
    localStorage.setItem(LS_REPEAT, repeat ? "1" : "0");
    renderPlayState();
  });

  // volume control in dropdown
  volInput.value = String(volume);
  audio.volume = volume;
  volInput.addEventListener("input", (e) => {
    const v = Number(e.target.value);
    if (Number.isFinite(v)) {
      audio.volume = v;
      localStorage.setItem(LS_VOL, String(v));
    }
  });

  // click cover toggles play/pause
  cover.addEventListener("click", (e) => { e.preventDefault(); togglePlay(); });

  // clicking progress to seek
  const progressWrap = root.querySelector("#mc-progress");
  progressWrap.addEventListener("click", (ev) => {
    const rect = progressWrap.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const pct = Math.min(1, Math.max(0, x / rect.width));
    if (audio.duration && !isNaN(audio.duration)) audio.currentTime = pct * audio.duration;
  });

  // keyboard support: space toggles play/pause when panel focused
  panel.addEventListener("keydown", (ev) => {
    if (ev.code === "Space" || ev.key === " ") {
      ev.preventDefault();
      togglePlay();
    }
  });

  // close dropdown when clicking outside
  document.addEventListener("click", (ev) => {
    if (!root.contains(ev.target)) {
      dropdown.style.display = "none";
      dropdown.setAttribute("aria-hidden", "true");
    }
  });

  // -----------------------
  // Dragging (pointer events to reduce lag)
  // -----------------------
  // We'll use pointer events for smooth dragging; limit reflows and avoid expensive style changes.
  let dragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  panel.addEventListener("pointerdown", (e) => {
    // only allow drag when pointer is not over an interactive control (buttons, inputs)
    const target = e.target;
    if (target.closest("button") || target.closest("input") || target.closest(".mc-dropdown")) {
      return;
    }
    dragging = true;
    panel.setPointerCapture(e.pointerId);
    const rect = root.getBoundingClientRect();
    // compute offset relative to root's top-left
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    // switch to absolute positioning for root for efficient moves
    root.style.right = "auto";
    root.style.bottom = "auto";
    // apply will-change for performance
    root.style.willChange = "transform, left, top";
    // set initial left/top if not set
    if (!root.style.left) root.style.left = rect.left + "px";
    if (!root.style.top) root.style.top = rect.top + "px";
  });

  panel.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    // compute new position
    const newLeft = e.clientX - dragOffsetX;
    const newTop = e.clientY - dragOffsetY;
    // apply position (use transform could be smoother but we set left/top for predictable bounding)
    root.style.left = `${Math.max(6, Math.min(window.innerWidth - root.offsetWidth - 6, newLeft))}px`;
    root.style.top = `${Math.max(6, Math.min(window.innerHeight - root.offsetHeight - 6, newTop))}px`;
  });

  panel.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    try { panel.releasePointerCapture(e.pointerId); } catch (e) {}
    root.style.willChange = "";
  });

  // mobile: allow touch scroll to not conflict — same handlers work via pointer events

  // -----------------------
  // Initialize & restore state
  // -----------------------
  function init() {
    renderTrack();
    // set audio volume
    audio.volume = volume;
    // set playing state: if previously playing, try to resume
    setTrack(idx, savedPos || 0, false);

    // if saved playing true, attempt to play after first user interaction (bypass autoplay)
    const previouslyPlaying = localStorage.getItem(LS_PLAYING) === "1";
    if (previouslyPlaying) {
      // Many browsers block autoplay; we'll try once user interacts.
      function onFirstInteraction() {
        tryPlay();
        window.removeEventListener("pointerdown", onFirstInteraction);
        window.removeEventListener("keydown", onFirstInteraction);
      }
      window.addEventListener("pointerdown", onFirstInteraction, { once: true });
      window.addEventListener("keydown", onFirstInteraction, { once: true });
    }
    // render UI
    renderPlayState();
  }

  // small helper: update UI when storage changes (sync across tabs/pages)
  window.addEventListener("storage", (e) => {
    try {
      if (e.key === LS_INDEX && e.newValue != null) {
        const newIdx = Number(e.newValue);
        if (Number.isFinite(newIdx) && newIdx !== idx) {
          setTrack(newIdx, 0, false);
        }
      } else if (e.key === LS_POS && e.newValue != null) {
        // another page updated position; update local bar (do not jump while playing)
        const p = Number(e.newValue);
        if (Number.isFinite(p) && !isNaN(audio.duration) && p < (audio.duration || Infinity)) {
          // only move when not seeking manually
          if (Math.abs((audio.currentTime || 0) - p) > 2) {
            try { audio.currentTime = p; } catch (err) {}
          }
        }
      } else if (e.key === LS_VOL && e.newValue != null) {
        const v = Number(e.newValue);
        if (Number.isFinite(v)) {
          audio.volume = v;
          volInput.value = String(v);
        }
      } else if ((e.key === LS_SHUFFLE) && e.newValue != null) {
        shuffle = e.newValue === "1";
        renderPlayState();
      } else if ((e.key === LS_REPEAT) && e.newValue != null) {
        repeat = e.newValue === "1";
        renderPlayState();
      }
    } catch (err) { /* ignore */ }
  });

  // Set initial UI values & start
  try {
    volInput.value = String(audio.volume = volume);
  } catch (e) {}

  init();
  // expose a tiny API for debugging/control if needed
  window.MindCraftSoundtrack = {
    play: () => { tryPlay(); },
    pause: () => { audio.pause(); },
    next: () => { nextTrack(); },
    prev: () => { prevTrack(); },
    setIndex: (i) => { setTrack(i, 0, false); },
    getState: () => ({ idx, playing, shuffle, repeat, volume: audio.volume })
  };

})();
