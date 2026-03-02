/* Scripts/Soundtrack/soundtrack.js
   MindCraft — Full-featured soundtrack mini-player (draggable, theme-aware)
   - Place in Scripts/Soundtrack/soundtrack.js
   - Tracks from: Assets/Music/Soundtrack/track1.mp3 ... track5.mp3
   - Covers from:  Assets/Image/Soundtrack/cover1.png ... cover5.png
   - Uses localStorage to remember index/position/volume/shuffle/repeat/position on-screen
   - Burger (SVG) opens menu below the player; menu auto-closes after timeout but also remains until user closes
   - Responsive and theme-aware (body.theme-dark or localStorage.theme === 'dark')
   - Drag handles included (drag anywhere on panel except interactive controls)
   - Exposes window.MindCraftSoundtrack API for debug/control
*/

(function () {
  if (document.getElementById("mc-soundtrack-root")) return;

  // ---------- CONFIG ----------
  const TRACKS = [
    { src: "Assets/Music/Soundtrack/track1.mp3", title: "Track 1", cover: "Assets/Image/Soundtrack/cover1.png" },
    { src: "Assets/Music/Soundtrack/track2.mp3", title: "Track 2", cover: "Assets/Image/Soundtrack/cover2.png" },
    { src: "Assets/Music/Soundtrack/track3.mp3", title: "Track 3", cover: "Assets/Image/Soundtrack/cover3.png" },
    { src: "Assets/Music/Soundtrack/track4.mp3", title: "Track 4", cover: "Assets/Image/Soundtrack/cover4.png" },
    { src: "Assets/Music/Soundtrack/track5.mp3", title: "Track 5", cover: "Assets/Image/Soundtrack/cover5.png" }
  ];
  // localStorage keys
  const LS = {
    INDEX: "mc_sound_idx_v2",
    POS: "mc_sound_pos_v2",
    VOL: "mc_sound_vol_v2",
    SHUFFLE: "mc_sound_shuffle_v2",
    REPEAT: "mc_sound_repeat_v2",
    LEFT: "mc_sound_left_v2",
    TOP: "mc_sound_top_v2",
    MENU_OPEN: "mc_sound_menu_open_v2"
  };

  // ---------- DOM BUILD ----------
  const root = document.createElement("div");
  root.id = "mc-soundtrack-root";
  // Accessibility
  root.setAttribute("role", "region");
  root.setAttribute("aria-label", "MindCraft soundtrack player");
  document.body.appendChild(root);

  // inject styles (theme aware variables)
  const style = document.createElement("style");
  style.id = "mc-soundtrack-style";
  style.textContent = `
  /* ===== MindCraft Soundtrack Player (injected CSS) ===== */
  #mc-soundtrack-root {
    position: fixed;
    right: 18px;
    bottom: 18px;
    z-index: 4000;
    font-family: 'Press Start 2P', cursive;
    --bg-light: rgba(236, 246, 235, 0.95); /* not plain white - soft cream */
    --panel-border-light: rgba(20, 30, 20, 0.06);
    --text-light: #3b2a15;
    --muted-light: rgba(0,0,0,0.25);
    --accent-light: linear-gradient(180deg,#d9b16c,#a97c4b);
    --accent-2-light: #a97c4b;

    --bg-dark: rgba(8,12,20,0.86);
    --panel-border-dark: rgba(90,121,184,0.08);
    --text-dark: #f7ead7;
    --muted-dark: rgba(255,255,255,0.14);
    --accent-dark: linear-gradient(180deg,#263758,#1a2742);
    --accent-2-dark: #5a79b8;

    transition: transform 160ms ease, opacity 200ms ease;
    cursor: default;
    user-select: none;
  }

  /* Light (default) */
  #mc-soundtrack-root[data-theme="light"] .mc-panel {
    background: var(--bg-light);
    border: 1px solid var(--panel-border-light);
    color: var(--text-light);
    box-shadow: 0 8px 24px rgba(0,0,0,0.14);
  }
  #mc-soundtrack-root[data-theme="light"] .mc-cover {
    background: linear-gradient(90deg,#f0f6ee,#e6efe0);
    border: 1px solid rgba(0,0,0,0.06);
  }

  /* Dark override */
  #mc-soundtrack-root[data-theme="dark"] .mc-panel {
    background: var(--bg-dark);
    border: 1px solid var(--panel-border-dark);
    color: var(--text-dark);
    box-shadow: 0 10px 40px rgba(0,0,0,0.6);
  }
  #mc-soundtrack-root[data-theme="dark"] .mc-cover {
    background: linear-gradient(180deg, rgba(20,28,40,0.7), rgba(10,14,24,0.6));
    border: 1px solid rgba(255,255,255,0.03);
  }

  .mc-panel {
    display:flex;
    gap:12px;
    align-items:center;
    padding:10px;
    min-width: 260px;
    max-width: 360px;
    height: 64px;
    border-radius: 12px;
    box-sizing: border-box;
    overflow: visible;
  }

  .mc-cover {
    width:56px;
    height:48px;
    border-radius:8px;
    object-fit:cover;
    flex:0 0 auto;
    display:block;
  }

  .mc-meta {
    display:flex;
    flex-direction:column;
    gap:6px;
    flex: 1 1 auto;
    min-width:0;
  }
  .mc-title {
    font-size: 0.62rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1;
  }
  .mc-progress {
    height: 6px;
    width: 100%;
    background: rgba(0,0,0,0.06);
    border-radius: 6px;
    overflow: hidden;
  }
  #mc-soundtrack-root[data-theme="dark"] .mc-progress { background: rgba(255,255,255,0.04); }

  .mc-progress > i {
    display:block;
    height:100%;
    width:0%;
    background: linear-gradient(90deg, #d9b16c, #a97c4b);
    transition: width 160ms linear;
  }
  #mc-soundtrack-root[data-theme="dark"] .mc-progress > i {
    background: linear-gradient(90deg, #5a79b8, #263758);
  }

  .mc-controls {
    display:flex;
    gap:8px;
    align-items:center;
    flex: 0 0 auto;
  }

  button.mc-btn {
    background: transparent;
    border: none;
    width:36px;
    height:36px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding:6px;
    border-radius:8px;
    cursor:pointer;
    transition: transform 120ms ease, background 120ms ease, box-shadow 120ms ease;
    color: inherit;
  }
  button.mc-btn:hover {
    transform: translateY(-3px);
    background: rgba(0,0,0,0.06);
  }
  #mc-soundtrack-root[data-theme="dark"] button.mc-btn:hover {
    background: rgba(255,255,255,0.03);
  }

  button.mc-btn.play {
    width:44px; height:44px;
    background: linear-gradient(180deg,#d9b16c,#a97c4b);
    color:#fff;
    box-shadow: 0 4px 0 rgba(0,0,0,0.18);
  }
  #mc-soundtrack-root[data-theme="dark"] button.mc-btn.play {
    background: linear-gradient(180deg,#263758,#1a2742);
    box-shadow: 0 4px 0 rgba(0,0,0,0.35);
  }

  button.mc-btn svg { width:18px; height:18px; fill: currentColor; }

  /* small controls row for shuffle/repeat icons below */
  .mc-small-row { display:flex; gap:8px; justify-content:center; align-items:center; }

  /* Menu (slides down beneath player) */
  .mc-menu {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + 8px);
    margin-left: 6px;
    margin-right: 6px;
    background: rgba(255,255,255,0.96);
    border-radius: 10px;
    padding: 10px;
    border: 1px solid rgba(0,0,0,0.06);
    display: none;
    transform-origin: top center;
    box-shadow: 0 8px 28px rgba(0,0,0,0.18);
    z-index: 4010;
    gap:10px;
  }
  #mc-soundtrack-root[data-theme="dark"] .mc-menu {
    background: rgba(6,10,20,0.95);
    border: 1px solid rgba(90,121,184,0.06);
    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
  }

  .mc-menu.show { display:flex; animation: mcMenuSlide 240ms ease both; }
  @keyframes mcMenuSlide {
    from { opacity: 0; transform: translateY(-6px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .mc-menu .row { display:flex; gap:8px; align-items:center; justify-content:space-between; width:100%; }
  .mc-menu .label { font-size:0.55rem; opacity:0.9; }
  .mc-menu .control { display:flex; gap:8px; align-items:center; }

  .mc-vol { width:120px; display:flex; gap:8px; align-items:center; }
  input.mc-range { width:100%; -webkit-appearance:none; background:transparent; }
  input.mc-range::-webkit-slider-runnable-track { height:6px; background: rgba(0,0,0,0.06); border-radius:6px; }
  #mc-soundtrack-root[data-theme="dark"] input.mc-range::-webkit-slider-runnable-track { background: rgba(255,255,255,0.04); }
  input.mc-range::-webkit-slider-thumb { -webkit-appearance:none; width:12px; height:12px; border-radius:50%; background:#d9b16c; box-shadow: 0 2px 0 rgba(0,0,0,0.12); margin-top:-3px; }
  #mc-soundtrack-root[data-theme="dark"] input.mc-range::-webkit-slider-thumb { background:#5a79b8; }

  /* burger */
  .mc-burger {
    width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; cursor:pointer;
  }

  /* draggable handle hint (small dot) */
  .mc-handle { position:absolute; right:8px; top:6px; width:8px; height:8px; border-radius:50%; opacity:0.9; background: rgba(0,0,0,0.12); }
  #mc-soundtrack-root[data-theme="dark"] .mc-handle { background: rgba(255,255,255,0.06); }

  /* Responsive tweaks */
  @media (max-width:600px) {
    #mc-soundtrack-root { right:12px; bottom:12px; }
    .mc-panel { min-width:220px; max-width:300px; height:60px; padding:8px; }
    .mc-cover { width:50px; height:42px; }
    .mc-vol { width:100px; }
  }
  @media (max-width:401px) {
    #mc-soundtrack-root { right:8px; bottom:8px; }
    .mc-panel { min-width:200px; max-width:240px; height:56px; padding:6px; }
    .mc-cover { width:44px; height:40px; }
    button.mc-btn { width:34px; height:34px; }
    button.mc-btn.play { width:40px; height:40px; }
    .mc-vol { display:none; }
  }
  `;
  document.head.appendChild(style);

  // SVG icons (no emojis)
  const SVG = {
    prev: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6v12l8.5-6L6 6zm10 0v12h2V6h-2z"/></svg>`,
    next: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6v12l-8.5-6L16 6zm4 0v12h2V6h-2z"/></svg>`,
    play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    shuffle: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.59 6.59L8.17 9H11c1.1 0 2 .9 2 2v1h2V11c0-1.1-.9-2-2-2H8.17l2.42-2.41L10 6 6 10l4 4 1.41-1.41L8.83 12H13c1.1 0 2-.9 2-2V9h2v1c0 1.1-.9 2-2 2h-4.17l2.42 2.41L14 18l4-4-4-4-1.41 1.41z"/></svg>`,
    repeat: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v5z"/></svg>`,
    volume: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9v6h4l5 5V4l-5 5H7z"/></svg>`,
    burger: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"/></svg>`,
    disc: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 5.5A4.5 4.5 0 1112 16a4.5 4.5 0 010-9z"/></svg>`,
    close: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 5.71L12 12l6.3 6.29-1.42 1.42L10.59 13.41 4.29 19.71 2.87 18.29 9.17 12 2.87 5.71 4.29 4.29 10.59 10.59 16.88 4.29z"/></svg>`
  };

  // render HTML
  root.innerHTML = `
    <div class="mc-panel" tabindex="0">
      <img class="mc-cover" src="${TRACKS[0].cover}" alt="cover" />
      <div class="mc-meta">
        <div class="mc-title" id="mc-title">${TRACKS[0].title}</div>
        <div class="mc-progress" title="progress"><i id="mc-progress-bar"></i></div>
      </div>

      <div class="mc-controls" aria-hidden="false">
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
          <div style="display:flex;gap:6px;align-items:center;">
            <button class="mc-btn" id="mc-prev" title="Previous">${SVG.prev}</button>
            <button class="mc-btn play" id="mc-play" title="Play">${SVG.play}</button>
            <button class="mc-btn" id="mc-next" title="Next">${SVG.next}</button>
          </div>
          <div style="display:flex;gap:6px;align-items:center;margin-top:2px;">
            <button class="mc-btn" id="mc-shuffle" title="Shuffle">${SVG.shuffle}</button>
            <button class="mc-btn" id="mc-repeat" title="Repeat">${SVG.repeat}</button>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
          <div style="display:flex;align-items:center;gap:6px;">
            <button class="mc-btn" id="mc-volbtn" title="Mute/Unmute">${SVG.volume}</button>
            <input aria-label="volume" class="mc-range" id="mc-vol" type="range" min="0" max="1" step="0.01" value="0.8" />
          </div>
          <div style="display:flex;align-items:center;">
            <div class="mc-burger" id="mc-burger" title="More">${SVG.burger}</div>
          </div>
        </div>
      </div>

      <div class="mc-handle" aria-hidden="true"></div>
    </div>

    <div class="mc-menu" id="mc-menu" role="menu" aria-hidden="true">
      <div class="row">
        <div class="label">Playback</div>
        <div class="control">
          <button class="mc-btn" id="mc-menu-prev" title="Previous">${SVG.prev}</button>
          <button class="mc-btn play" id="mc-menu-play" title="Play small">${SVG.play}</button>
          <button class="mc-btn" id="mc-menu-next" title="Next">${SVG.next}</button>
        </div>
      </div>

      <div class="row">
        <div class="label">Options</div>
        <div class="control">
          <button class="mc-btn" id="mc-menu-shuffle" title="Shuffle">${SVG.shuffle}</button>
          <button class="mc-btn" id="mc-menu-repeat" title="Repeat">${SVG.repeat}</button>
          <button class="mc-btn" id="mc-menu-disc" title="Open persistent player">${SVG.disc}</button>
        </div>
      </div>

      <div class="row">
        <div class="label">Volume</div>
        <div class="control">
          <div class="mc-vol">
            <button class="mc-btn" id="mc-menu-mute" title="Mute">${SVG.volume}</button>
            <input aria-label="menu-volume" class="mc-range" id="mc-menu-vol" type="range" min="0" max="1" step="0.01" value="0.8" />
          </div>
        </div>
      </div>
    </div>
  `;

  // ---------- refs ----------
  const panel = root.querySelector(".mc-panel");
  const coverEl = root.querySelector(".mc-cover");
  const titleEl = root.querySelector("#mc-title");
  const progressBar = root.querySelector("#mc-progress-bar");

  const btnPrev = root.querySelector("#mc-prev");
  const btnPlay = root.querySelector("#mc-play");
  const btnNext = root.querySelector("#mc-next");
  const btnShuffle = root.querySelector("#mc-shuffle");
  const btnRepeat = root.querySelector("#mc-repeat");
  const volBtn = root.querySelector("#mc-volbtn");
  const volInput = root.querySelector("#mc-vol");
  const burgerBtn = root.querySelector("#mc-burger");
  const handleEl = root.querySelector(".mc-handle");

  const menu = root.querySelector("#mc-menu");
  const menuPlay = root.querySelector("#mc-menu-play");
  const menuPrev = root.querySelector("#mc-menu-prev");
  const menuNext = root.querySelector("#mc-menu-next");
  const menuShuffle = root.querySelector("#mc-menu-shuffle");
  const menuRepeat = root.querySelector("#mc-menu-repeat");
  const menuDisc = root.querySelector("#mc-menu-disc");
  const menuMute = root.querySelector("#mc-menu-mute");
  const menuVol = root.querySelector("#mc-menu-vol");

  // ---------- audio & state ----------
  const audio = new Audio();
  audio.preload = "auto";
  audio.crossOrigin = "anonymous";

  let idx = Number(localStorage.getItem(LS.INDEX) || 0);
  if (isNaN(idx) || idx < 0 || idx >= TRACKS.length) idx = 0;
  let playing = false;
  let shuffle = localStorage.getItem(LS.SHUFFLE) === "1";
  let repeat = localStorage.getItem(LS.REPEAT) === "1";
  let menuOpen = localStorage.getItem(LS.MENU_OPEN) === "1";
  let autoCloseTimer = null;
  let menuInteraction = false;
  let positionSaveTimer = null;
  let drag = { active: false, offsetX: 0, offsetY: 0 };

  // load saved position & apply theme
  function applyTheme() {
    const dark = document.body.classList.contains("theme-dark") || localStorage.getItem("theme") === "dark";
    root.setAttribute("data-theme", dark ? "dark" : "light");
  }
  applyTheme();
  // observe storage/theme changes
  window.addEventListener("storage", (e) => { if (e.key === "theme") applyTheme(); });

  // apply initial position saved in localStorage
  function applySavedPosition() {
    const left = localStorage.getItem(LS.LEFT);
    const top = localStorage.getItem(LS.TOP);
    if (left != null && top != null) {
      // ensure within viewport
      let l = parseInt(left, 10), t = parseInt(top, 10);
      if (Number.isFinite(l) && Number.isFinite(t)) {
        // clamp
        const padding = 8;
        const maxLeft = Math.max(8, window.innerWidth - root.offsetWidth - padding);
        const maxTop = Math.max(8, window.innerHeight - root.offsetHeight - padding);
        l = Math.min(Math.max(padding, l), maxLeft);
        t = Math.min(Math.max(padding, t), maxTop);
        root.style.left = l + "px";
        root.style.top = t + "px";
        root.style.right = "auto";
        root.style.bottom = "auto";
        root.style.position = "fixed";
      }
    }
  }
  applySavedPosition();

  // ---------- helper functions ----------
  function setTrack(i, seek = 0, autoplay = false) {
    idx = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
    const t = TRACKS[idx];
    audio.src = t.src;
    titleEl.textContent = t.title;
    coverEl.src = t.cover;
    localStorage.setItem(LS.INDEX, String(idx));
    if (seek > 0) {
      audio.currentTime = Math.min(seek, audio.duration || seek);
    } else {
      // try to resume from saved pos (global)
      const saved = Number(localStorage.getItem(LS.POS) || 0);
      if (saved && saved > 0 && saved < 60 * 60 * 10) {
        try { audio.currentTime = Math.min(saved, audio.duration || saved); } catch (e) { /* ignore */ }
      } else {
        audio.currentTime = 0;
      }
    }
    renderControls();
    if (autoplay) tryPlay();
  }

  function renderControls() {
    btnPlay.innerHTML = playing ? SVG.pause : SVG.play;
    menuPlay.innerHTML = playing ? SVG.pause : SVG.play;

    btnShuffle.style.opacity = shuffle ? "1" : "0.6";
    menuShuffle.style.opacity = shuffle ? "1" : "0.6";
    btnRepeat.style.opacity = repeat ? "1" : "0.6";
    menuRepeat.style.opacity = repeat ? "1" : "0.6";

    // title ellipsis handled by CSS
  }

  function tryPlay() {
    const p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(() => { playing = true; renderControls(); })
        .catch(() => { playing = false; renderControls(); });
    } else {
      // older browsers
      playing = true;
      renderControls();
    }
  }

  function togglePlay() {
    if (playing) {
      audio.pause();
      playing = false;
    } else {
      tryPlay();
    }
    renderControls();
  }

  function prevTrack() {
    if (audio.currentTime > 2) {
      audio.currentTime = 0;
      return;
    }
    if (shuffle) {
      setTrack(Math.floor(Math.random() * TRACKS.length), 0, true);
    } else {
      setTrack(idx - 1, 0, true);
    }
  }

  function nextTrack() {
    if (shuffle) {
      setTrack(Math.floor(Math.random() * TRACKS.length), 0, true);
      return;
    }
    const next = idx + 1;
    if (next >= TRACKS.length) {
      if (repeat) setTrack(0, 0, true); else { audio.pause(); playing = false; renderControls(); }
    } else {
      setTrack(next, 0, true);
    }
  }

  // progress handler
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration || isNaN(audio.duration)) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = pct + "%";

    // throttle position saves
    if (positionSaveTimer) clearTimeout(positionSaveTimer);
    // Save every 1.5s and also when stops
    positionSaveTimer = setTimeout(() => {
      localStorage.setItem(LS.POS, String(Math.floor(audio.currentTime)));
    }, 1500);
  });

  audio.addEventListener("ended", () => {
    if (repeat) setTrack(idx, 0, true);
    else nextTrack();
  });

  audio.addEventListener("play", () => { playing = true; renderControls(); });
  audio.addEventListener("pause", () => { playing = false; renderControls(); });

  // ---------- wire UI ----------
  btnPlay.addEventListener("click", (e) => { e.preventDefault(); togglePlay(); });
  menuPlay.addEventListener("click", (e) => { e.preventDefault(); togglePlay(); });

  btnPrev.addEventListener("click", (e) => { e.preventDefault(); prevTrack(); });
  menuPrev.addEventListener("click", (e) => { e.preventDefault(); prevTrack(); });

  btnNext.addEventListener("click", (e) => { e.preventDefault(); nextTrack(); });
  menuNext.addEventListener("click", (e) => { e.preventDefault(); nextTrack(); });

  btnShuffle.addEventListener("click", (e) => { e.preventDefault(); shuffle = !shuffle; localStorage.setItem(LS.SHUFFLE, shuffle ? "1" : "0"); renderControls(); });
  menuShuffle.addEventListener("click", (e) => { e.preventDefault(); shuffle = !shuffle; localStorage.setItem(LS.SHUFFLE, shuffle ? "1" : "0"); renderControls(); });

  btnRepeat.addEventListener("click", (e) => { e.preventDefault(); repeat = !repeat; localStorage.setItem(LS.REPEAT, repeat ? "1" : "0"); renderControls(); });
  menuRepeat.addEventListener("click", (e) => { e.preventDefault(); repeat = !repeat; localStorage.setItem(LS.REPEAT, repeat ? "1" : "0"); renderControls(); });

  // volume controls
  const initialVol = Number(localStorage.getItem(LS.VOL) || 0.8);
  audio.volume = initialVol;
  volInput.value = String(initialVol);
  menuVol.value = String(initialVol);

  volInput.addEventListener("input", (ev) => {
    const v = Number(ev.target.value);
    audio.volume = v;
    localStorage.setItem(LS.VOL, String(v));
  });
  menuVol.addEventListener("input", (ev) => {
    const v = Number(ev.target.value);
    audio.volume = v;
    volInput.value = String(v);
    localStorage.setItem(LS.VOL, String(v));
  });

  volBtn.addEventListener("click", (e) => {
    e.preventDefault();
    audio.muted = !audio.muted;
    volBtn.style.opacity = audio.muted ? "0.5" : "1";
    menuMute.style.opacity = audio.muted ? "0.5" : "1";
  });
  menuMute.addEventListener("click", (e) => {
    e.preventDefault();
    audio.muted = !audio.muted;
    volBtn.style.opacity = audio.muted ? "0.5" : "1";
    menuMute.style.opacity = audio.muted ? "0.5" : "1";
  });

  // cover click toggles
  coverEl.addEventListener("click", () => togglePlay());

  // progress seek
  const progressWrap = root.querySelector(".mc-progress");
  progressWrap.addEventListener("click", (ev) => {
    const rect = progressWrap.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const pct = Math.min(1, Math.max(0, x / rect.width));
    if (audio.duration && !isNaN(audio.duration)) {
      audio.currentTime = pct * audio.duration;
    }
  });

  // ---------- menu (burger) behaviour ----------
  function openMenu() {
    menu.classList.add("show");
    menu.setAttribute("aria-hidden", "false");
    menuOpen = true;
    localStorage.setItem(LS.MENU_OPEN, "1");
    scheduleAutoClose();
  }
  function closeMenu() {
    menu.classList.remove("show");
    menu.setAttribute("aria-hidden", "true");
    menuOpen = false;
    localStorage.setItem(LS.MENU_OPEN, "0");
    clearAutoClose();
  }
  function toggleMenu() {
    if (menuOpen) closeMenu(); else openMenu();
  }
  burgerBtn.addEventListener("click", (e) => { e.preventDefault(); toggleMenu(); });

  // auto-close after 5s of no interaction; but if user toggles explicitly, still allow auto-close
  function clearAutoClose() {
    if (autoCloseTimer) { clearTimeout(autoCloseTimer); autoCloseTimer = null; }
  }
  function scheduleAutoClose() {
    clearAutoClose();
    autoCloseTimer = setTimeout(() => {
      // only auto-close if not currently interacting
      if (!menuInteraction) closeMenu();
    }, 5000);
  }
  // keep menu open while mouse inside
  menu.addEventListener("mouseenter", () => { menuInteraction = true; clearAutoClose(); });
  menu.addEventListener("mouseleave", () => { menuInteraction = false; scheduleAutoClose(); });

  // menuDisc -> optional "open persistent player" (opens small popup)
  menuDisc.addEventListener("click", (e) => {
    e.preventDefault();
    try {
      // open small window - same origin required for audio control to work smoothly
      const w = window.open(window.location.origin + window.location.pathname + "?mc_persistent_player=1", "mc_persistent_player", "width=420,height=140,menubar=no,toolbar=no");
      w && w.focus();
    } catch (err) { console.warn("popup blocked or same-origin issue:", err); }
  });

  // ---------- drag behavior ----------
  function onStartDrag(e) {
    const evt = e.touches ? e.touches[0] : e;
    drag.active = true;
    const rect = root.getBoundingClientRect();
    drag.offsetX = evt.clientX - rect.left;
    drag.offsetY = evt.clientY - rect.top;
    root.style.transition = "none";
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("touchmove", onDrag, { passive: false });
    document.addEventListener("mouseup", onEndDrag);
    document.addEventListener("touchend", onEndDrag);
  }
  function onDrag(e) {
    if (!drag.active) return;
    const evt = e.touches ? e.touches[0] : e;
    e.preventDefault && e.preventDefault();
    let left = Math.round(evt.clientX - drag.offsetX);
    let top = Math.round(evt.clientY - drag.offsetY);

    // clamp inside viewport
    const padding = 8;
    const maxLeft = window.innerWidth - root.offsetWidth - padding;
    const maxTop = window.innerHeight - root.offsetHeight - padding;
    left = Math.min(Math.max(padding, left), Math.max(padding, maxLeft));
    top = Math.min(Math.max(padding, top), Math.max(padding, maxTop));

    root.style.left = left + "px";
    root.style.top = top + "px";
    root.style.right = "auto";
    root.style.bottom = "auto";
    root.style.position = "fixed";
  }
  function onEndDrag() {
    drag.active = false;
    root.style.transition = "";
    // store
    try {
      const rect = root.getBoundingClientRect();
      localStorage.setItem(LS.LEFT, String(Math.round(rect.left)));
      localStorage.setItem(LS.TOP, String(Math.round(rect.top)));
    } catch (_) {}
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("touchmove", onDrag);
    document.removeEventListener("mouseup", onEndDrag);
    document.removeEventListener("touchend", onEndDrag);
  }

  // make panel draggable by holding panel (but not when clicking controls)
  // We ignore drag start if target is interactive control
  function isInteractive(target) {
    if (!target) return false;
    const t = target.closest && target.closest("button, input, .mc-progress, .mc-burger, .mc-cover");
    return Boolean(t);
  }
  panel.addEventListener("mousedown", (e) => { if (!isInteractive(e.target)) onStartDrag(e); });
  panel.addEventListener("touchstart", (e) => { if (!isInteractive(e.target)) onStartDrag(e); }, { passive: true });

  // also allow handle dot as drag start
  handleEl.addEventListener("mousedown", onStartDrag);
  handleEl.addEventListener("touchstart", onStartDrag, { passive: true });

  // ---------- keyboard accessibility ----------
  root.addEventListener("keydown", (ev) => {
    if (ev.key === " " || ev.key === "Spacebar") { ev.preventDefault(); togglePlay(); }
    if (ev.key === "ArrowRight") { ev.preventDefault(); nextTrack(); }
    if (ev.key === "ArrowLeft") { ev.preventDefault(); prevTrack(); }
    if (ev.key === "Escape") { if (menuOpen) closeMenu(); }
  });

  // ---------- visibility & unload ----------
  window.addEventListener("beforeunload", () => {
    // save pos
    try {
      const rect = root.getBoundingClientRect();
      localStorage.setItem(LS.LEFT, String(Math.round(rect.left)));
      localStorage.setItem(LS.TOP, String(Math.round(rect.top)));
    } catch (_) {}
    localStorage.setItem(LS.POS, String(Math.floor(audio.currentTime || 0)));
    localStorage.setItem(LS.INDEX, String(idx));
    localStorage.setItem(LS.VOL, String(audio.volume));
    localStorage.setItem(LS.SHUFFLE, shuffle ? "1" : "0");
    localStorage.setItem(LS.REPEAT, repeat ? "1" : "0");
    localStorage.setItem(LS.MENU_OPEN, menuOpen ? "1" : "0");
  });

  // ---------- init ----------
  function init() {
    applyTheme();
    // load saved settings
    const savedVol = Number(localStorage.getItem(LS.VOL));
    if (Number.isFinite(savedVol)) { audio.volume = savedVol; volInput.value = String(savedVol); menuVol.value = String(savedVol); }
    shuffle = localStorage.getItem(LS.SHUFFLE) === "1";
    repeat = localStorage.getItem(LS.REPEAT) === "1";
    menuOpen = localStorage.getItem(LS.MENU_OPEN) === "1";
    const savedPos = Number(localStorage.getItem(LS.POS) || 0);

    setTrack(idx, savedPos || 0, false);
    renderControls();
    applySavedPosition();

    if (menuOpen) openMenu(); else closeMenu();

    // try autoplay after user interaction (browsers block autoplay without interaction)
    function tryAuto() {
      tryPlay();
      window.removeEventListener("pointerdown", tryAuto);
      window.removeEventListener("keydown", tryAuto);
    }
    window.addEventListener("pointerdown", tryAuto, { once: true });
    window.addEventListener("keydown", tryAuto, { once: true });

    // show/hide based on theme changes live
    const mo = new MutationObserver(() => applyTheme());
    mo.observe(document.documentElement || document.body, { attributes: true, subtree: false });
  }
  init();

  // ---------- public API ----------
  window.MindCraftSoundtrack = {
    play: () => tryPlay(),
    pause: () => audio.pause(),
    next: () => nextTrack(),
    prev: () => prevTrack(),
    setIndex: (i) => setTrack(i, 0, false),
    getState: () => ({ idx, playing, shuffle, repeat, volume: audio.volume, pos: audio.currentTime }),
    openMenu: () => openMenu(),
    closeMenu: () => closeMenu(),
    toggleMenu: () => toggleMenu()
  };

  // ---------- small polish: reposition on resize (keep within viewport) ----------
  window.addEventListener("resize", () => {
    try {
      const rect = root.getBoundingClientRect();
      const padding = 8;
      let left = rect.left, top = rect.top;
      const maxLeft = Math.max(padding, window.innerWidth - root.offsetWidth - padding);
      const maxTop = Math.max(padding, window.innerHeight - root.offsetHeight - padding);
      if (left > maxLeft) left = maxLeft;
      if (top > maxTop) top = maxTop;
      root.style.left = left + "px";
      root.style.top = top + "px";
      localStorage.setItem(LS.LEFT, String(Math.round(left)));
      localStorage.setItem(LS.TOP, String(Math.round(top)));
    } catch (_) {}
  });

  // ---------- small accessibility: announce title changes for screen readers ----------
  const live = document.createElement("div");
  live.setAttribute("aria-live", "polite");
  live.style.position = "absolute";
  live.style.width = "1px";
  live.style.height = "1px";
  live.style.overflow = "hidden";
  live.style.clip = "rect(1px, 1px, 1px, 1px)";
  root.appendChild(live);
  const observer = new MutationObserver(() => {
    live.textContent = `Now playing ${titleEl.textContent}`;
  });
  observer.observe(titleEl, { childList: true, subtree: true });

})();
