/* Scripts/Soundtrack/soundtrack.js
   MindCraft — Draggable, theme-aware soundtrack mini-player
   - Responsive
   - Persistent settings (index/pos/vol/shuffle/repeat/position)
   - Optionally keeps playing across pages by opening/reusing a background window (named)
   - Uses BroadcastChannel to sync UI across pages/windows
   - Works with your file layout:
       Assets/Music/Soundtrack/track1.mp3 ... track5.mp3
       Assets/Image/Soundtrack/cover1.png ... cover5.png
*/
(function () {
  "use strict";

  // Prevent double-init
  if (window.MindCraftSoundtrackLoaded) return;
  window.MindCraftSoundtrackLoaded = true;

  // ----- EDIT TRACK LIST (update paths as needed) -----
  // Use relative paths from pages that include this script
  const tracks = [
    { src: "../Assets/Music/Soundtrack/track1.mp3", title: "Track 1 - MindCraft", cover: "../Assets/Image/Soundtrack/cover1.png" },
    { src: "../Assets/Music/Soundtrack/track2.mp3", title: "Track 2 - Danny", cover: "../Assets/Image/Soundtrack/cover2.png" },
    { src: "../Assets/Music/Soundtrack/track3.mp3", title: "Track 3 - Living Mice", cover: "../Assets/Image/Soundtrack/cover3.png" },
    { src: "../Assets/Music/Soundtrack/track4.mp3", title: "Track 4 - Haggstrom", cover: "../Assets/Image/Soundtrack/cover4.png" },
    { src: "../Assets/Music/Soundtrack/track5.mp3", title: "Track 5 - Subwoofer Lullaby", cover: "../Assets/Image/Soundtrack/cover5.png" }
  ];
  // ----------------------------------------------------

  // LocalStorage keys
  const LS_INDEX = "mc_soundtrack_index_v2";
  const LS_POS = "mc_soundtrack_pos_v2";
  const LS_VOL = "mc_soundtrack_vol_v2";
  const LS_SHUFFLE = "mc_soundtrack_shuffle_v2";
  const LS_REPEAT = "mc_soundtrack_repeat_v2";
  const LS_UI_X = "mc_soundtrack_ui_x_v2";
  const LS_UI_Y = "mc_soundtrack_ui_y_v2";
  const LS_KEEPWIN = "mc_soundtrack_keep_win_v2"; // whether user allowed background window

  // BroadcastChannel name for cross-tab/window sync
  const BC_NAME = "mc_soundtrack_channel_v2";

  // Try BroadcastChannel, fallback to no-op object
  const bc = ("BroadcastChannel" in window) ? new BroadcastChannel(BC_NAME) : { postMessage() {}, close() {} };

  // Player window name (used to allow persistent playback across pages)
  const PLAYER_WIN_NAME = "MindCraftSoundtrack";

  // Create root container (if not present)
  if (document.getElementById("mc-soundtrack-root")) return;
  const root = document.createElement("div");
  root.id = "mc-soundtrack-root";
  root.setAttribute("role", "region");
  root.setAttribute("aria-label", "MindCraft soundtrack player");
  document.body.appendChild(root);

  // Inject CSS (theme-aware variables)
  const css = `
/* --- MindCraft Soundtrack Player (injected CSS) --- */
#mc-soundtrack-root { position: fixed; right: 18px; bottom: 18px; z-index: 3000; font-family: 'Press Start 2P', cursive; --bg: rgba(255,255,255,0.92); --panel-border: rgba(0,0,0,0.08); --text: #3b2a15; --muted: rgba(0,0,0,0.25); --accent: #d9b16c; --accent-2: #a97c4b; --shadow: 0 6px 18px rgba(0,0,0,0.18); transition: transform 180ms ease, opacity 180ms ease; border-radius: 12px; }
body.theme-dark #mc-soundtrack-root { --bg: rgba(8,12,20,0.88); --panel-border: rgba(90,121,184,0.12); --text: #f7ead7; --muted: rgba(255,255,255,0.14); --accent: #263758; --accent-2: #5a79b8; --shadow: 0 8px 30px rgba(0,0,0,0.6); }
#mc-soundtrack-root .mc-panel { display:flex; gap:10px; align-items:center; padding:8px; background:var(--bg); border:1px solid var(--panel-border); color:var(--text); min-width: 260px; max-width: 360px; height:66px; box-shadow: var(--shadow); border-radius:10px; box-sizing:border-box; }
#mc-soundtrack-root .mc-cover { width:56px; height:48px; border-radius:6px; object-fit:cover; flex:0 0 auto; border:1px solid var(--panel-border); background: linear-gradient(90deg,#eee,#ddd); }
#mc-soundtrack-root .mc-meta { display:flex; flex-direction:column; gap:4px; flex:1 1 auto; min-width:0; }
#mc-soundtrack-root .mc-title { font-size:0.62rem; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
#mc-soundtrack-root .mc-progress { height:4px; width:100%; background:rgba(0,0,0,0.06); border-radius:4px; overflow:hidden; margin-top:4px; }
#mc-soundtrack-root .mc-progress > i { display:block; height:100%; width:0%; background: linear-gradient(90deg,var(--accent), var(--accent-2)); transition: width 150ms linear; }
#mc-soundtrack-root .mc-controls { display:flex; gap:6px; align-items:center; }
#mc-soundtrack-root button.mc-btn { background:transparent; border:none; width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; padding:6px; border-radius:8px; cursor:pointer; transition: transform 120ms ease, background 120ms ease; color:var(--text); }
#mc-soundtrack-root button.mc-btn:hover { transform: translateY(-3px); background: rgba(0,0,0,0.06); }
body.theme-dark #mc-soundtrack-root button.mc-btn:hover { background: rgba(255,255,255,0.04); }
#mc-soundtrack-root button.mc-btn.play { width:44px; height:44px; background: linear-gradient(180deg,var(--accent), var(--accent-2)); color:#fff; box-shadow:0 4px 0 rgba(0,0,0,0.18); }
#mc-soundtrack-root button.mc-btn.play svg { width:18px; height:18px; }
#mc-soundtrack-root button.mc-btn svg { width:18px; height:18px; fill:currentColor; }
#mc-soundtrack-root .mc-vol { width:80px; display:flex; gap:6px; align-items:center; }
#mc-soundtrack-root input[type="range"].mc-range { width:100%; -webkit-appearance:none; background:transparent; }
#mc-soundtrack-root input[type="range"].mc-range::-webkit-slider-runnable-track { height:6px; background: rgba(0,0,0,0.08); border-radius:6px; }
#mc-soundtrack-root input[type="range"].mc-range::-webkit-slider-thumb { -webkit-appearance:none; width:12px; height:12px; border-radius:50%; background:var(--accent); box-shadow:0 2px 0 rgba(0,0,0,0.15); margin-top:-3px; }
#mc-soundtrack-root .mc-mini-handle { width:14px;height:14px;border-radius:50%;background:var(--muted);opacity:0.6; margin-left:6px; }
#mc-soundtrack-root .mc-footer-note { font-size:0.5rem; color:var(--muted); text-align:center; margin-left:6px; }

/* Draggable cursor */
#mc-soundtrack-root.dragging { cursor:grabbing !important; }

/* Compact responsive */
@media (max-width: 600px) {
  #mc-soundtrack-root .mc-panel { min-width: 230px; max-width: 300px; height:62px; padding:6px; }
  #mc-soundtrack-root .mc-cover { width:50px; height:42px; }
}
@media (max-width: 401px) {
  #mc-soundtrack-root .mc-panel { min-width: 200px; max-width: 240px; height:56px; padding:6px; }
  #mc-soundtrack-root .mc-cover { width:44px; height:40px; }
  #mc-soundtrack-root button.mc-btn { width:34px; height:34px; }
  #mc-soundtrack-root button.mc-btn.play { width:40px; height:40px; }
  #mc-soundtrack-root .mc-vol { display:none; }
  #mc-soundtrack-root .mc-footer-note { display:none; }
}

/* Make sure the node does not block other UI (small shadow but clickable) */
`;
  const style = document.createElement("style");
  style.id = "mc-soundtrack-style";
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  // SVG icons (small, accessible)
  const SVG = {
    prev: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6v12l8.5-6L6 6zm10 0v12h2V6h-2z"/></svg>`,
    next: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6v12l-8.5-6L16 6zm4 0v12h2V6h-2z"/></svg>`,
    play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    shuffle: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.59 6.59L8.17 9H11c1.1 0 2 .9 2 2v1h2V11c0-1.1-.9-2-2-2H8.17l2.42-2.41L10 6 6 10l4 4 1.41-1.41L8.83 12H13c1.1 0 2-.9 2-2V9h2v1c0 1.1-.9 2-2 2h-4.17l2.42 2.41L14 18l4-4-4-4-1.41 1.41z"/></svg>`,
    repeat: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v5z"/></svg>`,
    volume: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9v6h4l5 5V4l-5 5H7z"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>`
  };

  // Build DOM inside root
  root.innerHTML = `
    <div class="mc-panel" tabindex="0">
      <img class="mc-cover" src="${tracks[0].cover}" alt="soundtrack cover" />
      <div class="mc-meta">
        <div class="mc-title" id="mc-title">${tracks[0].title}</div>
        <div class="mc-progress" title="progress"><i id="mc-progress-bar"></i></div>
      </div>
      <div class="mc-controls" aria-hidden="false">
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
          <div style="display:flex;gap:6px;align-items:center;">
            <button class="mc-btn" id="mc-prev" title="Previous track" aria-label="Previous track">${SVG.prev}</button>
            <button class="mc-btn play" id="mc-play" title="Play/Pause" aria-label="Play or pause">${SVG.play}</button>
            <button class="mc-btn" id="mc-next" title="Next track" aria-label="Next track">${SVG.next}</button>
          </div>
          <div style="display:flex;gap:6px;align-items:center;margin-top:2px;">
            <button class="mc-btn" id="mc-shuffle" title="Shuffle" aria-pressed="false">${SVG.shuffle}</button>
            <button class="mc-btn" id="mc-repeat" title="Repeat" aria-pressed="false">${SVG.repeat}</button>
          </div>
        </div>
        <div class="mc-vol" style="margin-left:8px;">
          <button class="mc-btn" id="mc-volbtn" title="Mute/Unmute" aria-label="Mute or unmute">${SVG.volume}</button>
          <input aria-label="volume" class="mc-range" id="mc-vol" type="range" min="0" max="1" step="0.01" value="0.8" />
        </div>
      </div>
    </div>
  `;

  // Elements
  const coverEl = root.querySelector(".mc-cover");
  const titleEl = root.querySelector("#mc-title");
  const progressEl = root.querySelector("#mc-progress-bar");
  const btnPrev = root.querySelector("#mc-prev");
  const btnNext = root.querySelector("#mc-next");
  const btnPlay = root.querySelector("#mc-play");
  const btnShuffle = root.querySelector("#mc-shuffle");
  const btnRepeat = root.querySelector("#mc-repeat");
  const volInput = root.querySelector("#mc-vol");
  const volBtn = root.querySelector("#mc-volbtn");
  const panel = root.querySelector(".mc-panel");

  // Audio element & state
  // We will create audio in-page but support remote player window: the remote window will host the audio element
  let audio = new Audio();
  audio.preload = "metadata";
  audio.crossOrigin = "anonymous";

  let idx = Number(localStorage.getItem(LS_INDEX) || 0);
  if (!Number.isFinite(idx) || idx < 0 || idx >= tracks.length) idx = 0;

  let playing = false;
  let shuffle = localStorage.getItem(LS_SHUFFLE) === "1";
  let repeat = localStorage.getItem(LS_REPEAT) === "1";
  let userInteracted = false;
  let lastProgressUpdate = 0;

  // UI position (draggable)
  let savedX = Number(localStorage.getItem(LS_UI_X) || NaN);
  let savedY = Number(localStorage.getItem(LS_UI_Y) || NaN);
  if (Number.isFinite(savedX) && Number.isFinite(savedY)) {
    // apply saved position (clamped)
    requestAnimationFrame(() => {
      const maxX = Math.max(0, window.innerWidth - root.offsetWidth - 8);
      const maxY = Math.max(0, window.innerHeight - root.offsetHeight - 8);
      const x = Math.min(maxX, Math.max(8, savedX));
      const y = Math.min(maxY, Math.max(8, savedY));
      root.style.right = "auto";
      root.style.left = `${x}px`;
      root.style.bottom = "auto";
      root.style.top = `${y}px`;
    });
  }

  // helper: update UI theme class if theme changes
  function applyThemeToRoot() {
    const isDark = document.body.classList.contains("theme-dark") || localStorage.getItem("theme") === "dark";
    if (isDark) root.classList.add("theme-dark");
    else root.classList.remove("theme-dark");
  }
  applyThemeToRoot();
  // observe body class changes (theme.js toggles class on body)
  const mo = new MutationObserver(applyThemeToRoot);
  mo.observe(document.body, { attributes: true });

  // small utility to escape text
  function esc(s) { return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  // setTrack: load metadata, UI, optionally seek & autoplay
  function setTrack(i, seekTo = 0, autoplay = false) {
    i = ((i % tracks.length) + tracks.length) % tracks.length;
    idx = i;
    const t = tracks[idx];
    // update UI immediately
    titleEl.textContent = t.title;
    coverEl.src = t.cover;
    // load src
    if (playerWindow && !playerWindow.closed && playerWindow.soundtrackBridge && playerWindow.soundtrackBridge.setTrack) {
      // forward to remote player window
      playerWindow.focus?.(); // optional
      try {
        playerWindow.soundtrackBridge.setTrack(i, seekTo, autoplay);
      } catch (e) {
        // fallback to local audio
        loadLocalTrack(i, seekTo, autoplay);
      }
    } else {
      loadLocalTrack(i, seekTo, autoplay);
    }
    localStorage.setItem(LS_INDEX, String(idx));
    broadcastState();
  }

  // local audio loader
  function loadLocalTrack(i, seekTo=0, autoplay=false) {
    const t = tracks[i];
    if (!t) return;
    audio.src = t.src;
    audio.load();
    audio.currentTime = 0;
    // If browser has duration, set after metadata
    if (seekTo > 0) {
      audio.addEventListener("loadedmetadata", function once() {
        try { audio.currentTime = Math.min(seekTo, audio.duration || seekTo); } catch(e) {}
        audio.removeEventListener("loadedmetadata", once);
      });
    } else {
      // resume saved position if any and same index
      const savedPos = Number(localStorage.getItem(LS_POS) || 0);
      if (savedPos && savedPos > 0 && savedPos < 60*60*10) {
        audio.addEventListener("loadedmetadata", function once2() {
          try {
            // only resume if last saved index matches
            const savedIdx = Number(localStorage.getItem(LS_INDEX) || 0);
            if (savedIdx === i) audio.currentTime = Math.min(savedPos, audio.duration || savedPos);
          } catch(e){}
          audio.removeEventListener("loadedmetadata", once2);
        });
      }
    }
    if (autoplay) {
      const p = audio.play();
      if (p !== undefined) {
        p.then(()=> { playing = true; renderPlayState(); }).catch(()=> { playing=false; renderPlayState(); });
      }
    }
    renderPlayState();
  }

  // Render play/pause, shuffle/repeat UI
  function renderPlayState() {
    btnPlay.innerHTML = playing ? SVG.pause : SVG.play;
    btnShuffle.style.opacity = shuffle ? "1" : "0.55";
    btnShuffle.setAttribute("aria-pressed", shuffle ? "true" : "false");
    btnRepeat.style.opacity = repeat ? "1" : "0.55";
    btnRepeat.setAttribute("aria-pressed", repeat ? "true" : "false");
  }

  // try to play (respecting browser policies)
  function tryPlay() {
    userInteracted = true;
    // If remote window exists, forward to it
    if (playerWindow && !playerWindow.closed && playerWindow.soundtrackBridge && playerWindow.soundtrackBridge.play) {
      try { playerWindow.soundtrackBridge.play(); } catch (e) { localPlay(); }
      return;
    }
    localPlay();
  }

  function localPlay() {
    const p = audio.play();
    if (p !== undefined) {
      p.then(() => { playing = true; renderPlayState(); broadcastState(); })
       .catch(() => { playing = false; renderPlayState(); });
    }
  }

  function togglePlay() {
    if (playerWindow && !playerWindow.closed && playerWindow.soundtrackBridge && playerWindow.soundtrackBridge.toggle) {
      try { playerWindow.soundtrackBridge.toggle(); return; } catch(e) {}
    }
    if (playing) { audio.pause(); playing = false; }
    else { tryPlay(); }
    renderPlayState();
    broadcastState();
  }

  // prev/next
  function prevTrackHandler() {
    // if >2s then restart, else previous
    try {
      if (audio.currentTime > 2) { audio.currentTime = 0; return; }
    } catch(e){}
    if (shuffle) {
      const r = Math.floor(Math.random() * tracks.length);
      setTrack(r, 0, true);
    } else {
      setTrack(idx - 1, 0, true);
    }
  }
  function nextTrackHandler() {
    if (shuffle) {
      const r = Math.floor(Math.random() * tracks.length);
      setTrack(r, 0, true);
    } else {
      if (idx + 1 >= tracks.length) {
        if (repeat) setTrack(0, 0, true);
        else { audio.pause(); playing = false; renderPlayState(); broadcastState(); return; }
      } else setTrack(idx + 1, 0, true);
    }
  }

  // progress update event (local)
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration || isNaN(audio.duration)) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressEl.style.width = pct + "%";

    const now = Date.now();
    if (now - lastProgressUpdate > 1500) {
      lastProgressUpdate = now;
      // Save simple global last position (seconds)
      try { localStorage.setItem(LS_POS, String(Math.floor(audio.currentTime))); } catch(e){}
      // broadcast time to other pages for UI sync
      broadcastState();
    }
  });

  audio.addEventListener("play", () => { playing = true; renderPlayState(); broadcastState(); });
  audio.addEventListener("pause", () => { playing = false; renderPlayState(); broadcastState(); });
  audio.addEventListener("ended", () => {
    if (repeat) setTrack(idx, 0, true);
    else nextTrackHandler();
  });

  // Click handlers
  btnPlay.addEventListener("click", (e) => { e.preventDefault(); userInteracted=true; togglePlay(); });
  btnPrev.addEventListener("click", (e) => { e.preventDefault(); prevTrackHandler(); });
  btnNext.addEventListener("click", (e) => { e.preventDefault(); nextTrackHandler(); });

  btnShuffle.addEventListener("click", (e) => {
    e.preventDefault();
    shuffle = !shuffle;
    localStorage.setItem(LS_SHUFFLE, shuffle ? "1" : "0");
    renderPlayState();
    broadcastState();
  });

  btnRepeat.addEventListener("click", (e) => {
    e.preventDefault();
    repeat = !repeat;
    localStorage.setItem(LS_REPEAT, repeat ? "1" : "0");
    renderPlayState();
    broadcastState();
  });

  // Volume handling
  const initialVol = Number(localStorage.getItem(LS_VOL) || 0.8);
  audio.volume = initialVol;
  volInput.value = initialVol;
  volInput.addEventListener("input", (ev) => {
    const v = Number(ev.target.value);
    audio.volume = v;
    localStorage.setItem(LS_VOL, String(v));
    // If remote exists, forward
    if (playerWindow && !playerWindow.closed && playerWindow.soundtrackBridge && playerWindow.soundtrackBridge.setVolume) {
      try { playerWindow.soundtrackBridge.setVolume(v); } catch (e) {}
    }
  });
  volBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (audio.muted) { audio.muted = false; volBtn.style.opacity = "1"; } else { audio.muted = true; volBtn.style.opacity = "0.55"; }
    broadcastState();
  });

  // Seek by clicking progress
  const progressWrap = root.querySelector(".mc-progress");
  progressWrap.addEventListener("click", (ev) => {
    const rect = progressWrap.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const pct = Math.min(1, Math.max(0, x / rect.width));
    if (playerWindow && !playerWindow.closed && playerWindow.soundtrackBridge && playerWindow.soundtrackBridge.seek) {
      try { playerWindow.soundtrackBridge.seek(pct); return; } catch(e) {}
    }
    if (audio.duration && !isNaN(audio.duration)) audio.currentTime = pct * audio.duration;
    // save position
    localStorage.setItem(LS_POS, String(Math.floor(audio.currentTime)));
  });

  // keyboard space toggles when focused
  root.addEventListener("keydown", (ev) => {
    if (ev.key === " " || ev.key === "Spacebar") { ev.preventDefault(); togglePlay(); }
  });

  // Double-click removes player (optional)
  root.addEventListener("dblclick", () => {
    try { root.remove(); localStorage.removeItem(LS_POS); } catch (e) {}
  });

  // Broadcast local state to other pages/windows
  function broadcastState() {
    const state = {
      type: "mc_state",
      idx,
      playing,
      shuffle,
      repeat,
      volume: audio.volume,
      muted: audio.muted,
      pos: Math.floor(audio.currentTime || 0),
      ts: Date.now()
    };
    try { bc.postMessage(state); } catch(e){}
    // Also store a copy
    try { localStorage.setItem("mc_soundtrack_state_v2", JSON.stringify(state)); } catch(e){}
  }

  // Handler for incoming BroadcastChannel messages
  bc.onmessage = (ev) => {
    const msg = ev.data;
    if (!msg || typeof msg !== "object") return;
    if (msg.type === "mc_command") {
      // run command locally if remote not available
      handleCommand(msg.command, msg.args || {});
    } else if (msg.type === "mc_state") {
      // sync UI state: don't change playback from other page automatically
      // but update UI (title/cover/progress if provided)
      if (typeof msg.idx === "number" && msg.idx !== idx) {
        // change UI to show correct track
        titleEl.textContent = (tracks[msg.idx] && tracks[msg.idx].title) || titleEl.textContent;
        coverEl.src = (tracks[msg.idx] && tracks[msg.idx].cover) || coverEl.src;
      }
      // update buttons
      playing = !!msg.playing;
      shuffle = !!msg.shuffle;
      repeat = !!msg.repeat;
      renderPlayState();
      // update progress bar
      if (typeof msg.pos === "number" && typeof msg.volume === "number") {
        // update volume and pos
        volInput.value = Number(msg.volume);
        progressEl.style.width = Math.min(100, (msg.pos / Math.max(1, msg.duration || 1)) * 100) + "%";
      }
    } else if (msg.type === "mc_request_state") {
      // remote requested state, reply
      broadcastState();
    }
  };

  // Generic command handler invoked by BC commands
  function handleCommand(command, args) {
    switch (command) {
      case "play": tryPlay(); break;
      case "pause": audio.pause(); break;
      case "toggle": togglePlay(); break;
      case "next": nextTrackHandler(); break;
      case "prev": prevTrackHandler(); break;
      case "setIndex": setTrack(Number(args.idx || 0), Number(args.seek || 0), !!args.autoplay); break;
      case "seek": if (typeof args.pct === "number" && audio.duration) audio.currentTime = args.pct * audio.duration; break;
      case "setVolume": audio.volume = Number(args.volume || 0.8); volInput.value = audio.volume; localStorage.setItem(LS_VOL, String(audio.volume)); break;
      default: break;
    }
  }

  // Attempt to open (or reuse) a persistent player window for cross-page playback
  let playerWindow = null;
  function openOrReusePlayerWindow() {
    // The player window will load a minimal html that includes this same script
    // We try to open window with the same origin & a fixed name so pages reuse it.
    // If popup blocked, store preference so we don't repeatedly try.
    if (localStorage.getItem(LS_KEEPWIN) === "0") return null; // user previously denied
    try {
      const features = "width=420,height=120,left=100,top=100,resizable,scrollbars=no,status=no";
      // open a small, hidden-ish window (user must have interacted earlier for popup to succeed)
      const win = window.open(window.location.origin + window.location.pathname, PLAYER_WIN_NAME, features);
      return win;
    } catch (e) {
      return null;
    }
  }

  // Expose a bridge on window for remote control (player window will expose a soundtrackBridge)
  // But here we maintain playerWindow reference when found
  function tryAttachToNamedWindow() {
    try {
      const win = window.open("", PLAYER_WIN_NAME);
      if (!win || win.closed) return null;
      // if the window was opened and has our soundtrackBridge we can control it
      return win;
    } catch (e) { return null; }
  }

  // If a remote player window exists, we'll prefer forwarding audio to it.
  // If no remote player window currently, we will allow user to open one by a click/hint.
  // Try to find existing named window (may return same-origin window)
  function findPlayerWindow() {
    try {
      const w = tryAttachToNamedWindow();
      if (w && !w.closed && w.soundtrackBridge && typeof w.soundtrackBridge.ping === "function") {
        playerWindow = w;
        return true;
      }
    } catch (e) {}
    playerWindow = null;
    return false;
  }

  // When user interacts (first pointerdown or key), attempt to open a background window if user previously agreed
  function maybeOpenPersistentWindow() {
    // Don't auto-open if user previously declined
    if (localStorage.getItem(LS_KEEPWIN) === "0") return;
    // If window already exists & has bridge, keep using
    if (findPlayerWindow()) return;
    // Try to open a new player window (must be in response to user gesture)
    try {
      const win = openOrReusePlayerWindow();
      if (!win) {
        // popup blocked; remember the choice to avoid nagging
        localStorage.setItem(LS_KEEPWIN, "0");
        return;
      }
      // If the opened window is same origin, we can write into it.
      // We will attempt to create a small HTML shell inside it with a bridge that hosts audio.
      const doc = win.document;
      doc.open();
      // Basic shell that will import this same script and expose a bridge
      const html = `
<!doctype html><html><head><meta charset="utf-8"><title>MindCraft Player</title>
<style>html,body{margin:0;height:100%;background:transparent;}body{font-family:sans-serif}</style>
</head><body>
<div id="mc-player-host" style="display:none"></div>
<script>
  // small bridge created by main window for persistent playback
  (function(){
    // create audio element in this persistent window
    window._mc_persistent_audio = new Audio();
    window._mc_persistent_audio.preload = "metadata";
    window._mc_soundtrack_bridge = {
      _audio: window._mc_persistent_audio,
      setTrack: function(i, seekTo, autoplay){
        try {
          i = Number(i||0);
          var tracks = ${JSON.stringify(tracks)};
          var t = tracks[i] || tracks[0];
          window._mc_persistent_audio.src = t.src;
          window._mc_persistent_audio.crossOrigin = 'anonymous';
          window._mc_persistent_audio.load();
          if (seekTo && !isNaN(seekTo)) {
            window._mc_persistent_audio.addEventListener('loadedmetadata', function once(){ try{ window._mc_persistent_audio.currentTime = Math.min(seekTo, window._mc_persistent_audio.duration||seekTo); }catch(e){} window._mc_persistent_audio.removeEventListener('loadedmetadata', once); });
          }
          if (autoplay) window._mc_persistent_audio.play().catch(function(){});
        } catch(e){}
      },
      play: function(){ try{ window._mc_persistent_audio.play(); }catch(e){} },
      pause: function(){ try{ window._mc_persistent_audio.pause(); }catch(e){} },
      toggle: function(){ if (window._mc_persistent_audio.paused) try{ window._mc_persistent_audio.play(); }catch(e){} else window._mc_persistent_audio.pause(); },
      seek: function(pct){ try{ if (window._mc_persistent_audio.duration) window._mc_persistent_audio.currentTime = Math.max(0, Math.min(1,pct)) * window._mc_persistent_audio.duration; }catch(e){} },
      setVolume: function(v){ try{ window._mc_persistent_audio.volume = Number(v); }catch(e){} },
      ping: function(){ return true; }
    };
    // Expose for main window to call
    window.soundtrackBridge = window._mc_soundtrack_bridge;

    // also react to messages from opener via postMessage
    window.addEventListener('message', function(ev){
      try {
        var d = ev.data;
        if (!d || !d.type) return;
        if (d.type === 'mc_command' && d.cmd && window._mc_soundtrack_bridge) {
          var args = d.args || {};
          var cmd = d.cmd;
          if (cmd === 'setTrack') window._mc_soundtrack_bridge.setTrack(args.idx, args.seek, args.autoplay);
          else if (cmd === 'play') window._mc_soundtrack_bridge.play();
          else if (cmd === 'pause') window._mc_soundtrack_bridge.pause();
          else if (cmd === 'toggle') window._mc_soundtrack_bridge.toggle();
          else if (cmd === 'seek') window._mc_soundtrack_bridge.seek(args.pct || 0);
          else if (cmd === 'setVolume') window._mc_soundtrack_bridge.setVolume(args.v || 0.8);
        }
      } catch(e){}
    }, false);

    // notify opener that bridge is ready
    try { window.opener && window.opener.postMessage({ type: 'mc_persistent_ready' }, '*'); } catch(e){}
  })();
<\/script></body></html>
`;
      doc.write(html);
      doc.close();
      // set flag that user allowed a background window
      localStorage.setItem(LS_KEEPWIN, "1");
      // try attach
      setTimeout(() => {
        playerWindow = win;
        // request remote to set current track if possible
        try {
          win.postMessage({ type: "mc_command", cmd: "setTrack", args: { idx, seek: Number(localStorage.getItem(LS_POS) || 0), autoplay: playing } }, "*");
        } catch (e) { }
      }, 400);
    } catch (err) {
      localStorage.setItem(LS_KEEPWIN, "0");
    }
  }

  // Listen for messages from persistent window
  window.addEventListener("message", (ev) => {
    try {
      const d = ev.data;
      if (!d || typeof d !== "object") return;
      if (d.type === "mc_persistent_ready") {
        // persistent window says it's ready; attempt to attach
        playerWindow = tryAttachToNamedWindow();
        // forward current track/state
        if (playerWindow && !playerWindow.closed) {
          try {
            playerWindow.postMessage({ type: "mc_command", cmd: "setTrack", args: { idx, seek: Number(localStorage.getItem(LS_POS) || 0), autoplay: playing } }, "*");
            playerWindow.postMessage({ type: "mc_command", cmd: "setVolume", args: { v: Number(localStorage.getItem(LS_VOL) || 0.8) } }, "*");
          } catch (e) {}
        }
      }
    } catch (e){}
  });

  // UI drag logic
  (function makeDraggable(node) {
    let dragging = false;
    let startX = 0, startY = 0;
    let origLeft = 0, origTop = 0;
    function onPointerDown(e) {
      // only left button or touch
      if (e.type === "mousedown" && e.button !== 0) return;
      dragging = true;
      node.classList.add("dragging");
      const rect = node.getBoundingClientRect();
      // convert left/top coordinates; ensure left/top style used
      const left = rect.left;
      const top = rect.top;
      origLeft = left;
      origTop = top;
      startX = (e.clientX || (e.touches && e.touches[0].clientX) || 0);
      startY = (e.clientY || (e.touches && e.touches[0].clientY) || 0);
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
      document.addEventListener("touchmove", onPointerMove, { passive: false });
      document.addEventListener("touchend", onPointerUp);
      e.preventDefault();
    }
    function onPointerMove(e) {
      if (!dragging) return;
      const cx = (e.clientX || (e.touches && e.touches[0].clientX) || 0);
      const cy = (e.clientY || (e.touches && e.touches[0].clientY) || 0);
      const dx = cx - startX, dy = cy - startY;
      let newLeft = origLeft + dx;
      let newTop = origTop + dy;
      // clamp
      const maxLeft = Math.max(8, window.innerWidth - node.offsetWidth - 8);
      const maxTop = Math.max(8, window.innerHeight - node.offsetHeight - 8);
      newLeft = Math.min(maxLeft, Math.max(8, newLeft));
      newTop = Math.min(maxTop, Math.max(8, newTop));
      node.style.right = "auto";
      node.style.left = `${newLeft}px`;
      node.style.top = `${newTop}px`;
      node.style.bottom = "auto";
      e.preventDefault();
    }
    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      node.classList.remove("dragging");
      // store final pos
      try {
        const rect = node.getBoundingClientRect();
        localStorage.setItem(LS_UI_X, String(Math.round(rect.left)));
        localStorage.setItem(LS_UI_Y, String(Math.round(rect.top)));
      } catch (e) {}
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("touchmove", onPointerMove);
      document.removeEventListener("touchend", onPointerUp);
    }
    // pointerdown on panel header (panel)
    panel.addEventListener("pointerdown", onPointerDown, { passive: false });
    panel.addEventListener("touchstart", onPointerDown, { passive: false });
  })(root);

  // Exposure: small public API and commands from other pages
  window.MindCraftSoundtrack = {
    play: () => { tryPlay(); },
    pause: () => { audio.pause(); },
    next: () => { nextTrackHandler(); },
    prev: () => { prevTrackHandler(); },
    setIndex: (i) => { setTrack(Number(i || 0), 0, false); },
    getState: () => ({ idx, playing, shuffle, repeat, vol: audio.volume }),
    openPersistentWindow: () => { maybeOpenPersistentWindow(); },
    // internal hook for persistent window to attach to (if same origin)
    _attachPersistentBridge: function (bridge) {
      // bridge expected to be object with methods used above; if present, forward control
      // NOTE: used when persistent window and main page share same origin & script
      return false; // not used in this build
    }
  };

  // On user gesture: try opening persistent window (user may have chosen)
  function onFirstGesture() {
    if (!userInteracted) {
      userInteracted = true;
      // If user sets preference to allow persistent background, try to open one:
      // Prefer to open only if localStorage hasn't auto-declined
      if (localStorage.getItem(LS_KEEPWIN) !== "0") {
        try {
          // attempt to open popup (may be blocked)
          maybeOpenPersistentWindow();
        } catch (e) {}
      }
    }
    window.removeEventListener("pointerdown", onFirstGesture);
    window.removeEventListener("keydown", onFirstGesture);
  }
  window.addEventListener("pointerdown", onFirstGesture, { once: true });
  window.addEventListener("keydown", onFirstGesture, { once: true });

  // Try to attach to existing named window immediately (if user previously opened)
  setTimeout(() => { findPlayerWindow(); }, 300);

  // Initialize UI + track
  function init() {
    // set volume
    const vol = Number(localStorage.getItem(LS_VOL) || 0.8);
    audio.volume = vol;
    volInput.value = vol;

    shuffle = localStorage.getItem(LS_SHUFFLE) === "1";
    repeat = localStorage.getItem(LS_REPEAT) === "1";

    // load track (do NOT autoplay until user gesture)
    const savedPos = Number(localStorage.getItem(LS_POS) || 0) || 0;
    setTrack(idx, savedPos, false);

    // render initial states
    renderPlayState();

    // Ask other contexts for current state (in case persistent window is playing)
    try { bc.postMessage({ type: "mc_request_state" }); } catch (e) {}
    // if persistent window exists, try to sync
    setTimeout(() => {
      findPlayerWindow();
      if (playerWindow && !playerWindow.closed) {
        try {
          playerWindow.postMessage({ type: "mc_command", cmd: "setTrack", args: { idx, seek: savedPos, autoplay: false } }, "*");
          playerWindow.postMessage({ type: "mc_command", cmd: "setVolume", args: { v: vol } }, "*");
        } catch (e) {}
      }
    }, 600);
  }

  // Small helper to expose to console for debugging
  window._mc_soundtrack_debug = function () {
    return { idx, playing, shuffle, repeat, vol: audio.volume, playerWindow: !!playerWindow, tracks };
  };

  // Kick off
  init();

  // Ensure UI updates when window/tab gains focus (pull latest state)
  window.addEventListener("storage", (ev) => {
    if (!ev.key) return;
    if (ev.key === "mc_soundtrack_state_v2") {
      try {
        const s = JSON.parse(localStorage.getItem("mc_soundtrack_state_v2"));
        if (s && typeof s.idx === "number") {
          titleEl.textContent = (tracks[s.idx] && tracks[s.idx].title) || titleEl.textContent;
          coverEl.src = (tracks[s.idx] && tracks[s.idx].cover) || coverEl.src;
          playing = !!s.playing;
          shuffle = !!s.shuffle;
          repeat = !!s.repeat;
          renderPlayState();
        }
      } catch (e) {}
    }
  });

  // Accessibility: announce changes when track changes (visually friendly)
  audio.addEventListener("loadedmetadata", () => {
    // ensure progress shows 0 initially
    progressEl.style.width = "0%";
  });

  // If user navigates away and returns, restore UI and resume if needed
  window.addEventListener("pageshow", () => {
    try {
      const savedIdx = Number(localStorage.getItem(LS_INDEX) || 0);
      const savedPos = Number(localStorage.getItem(LS_POS) || 0);
      const savedVol = Number(localStorage.getItem(LS_VOL) || 0.8);
      volInput.value = savedVol; audio.volume = savedVol;
      if (savedIdx !== idx) setTrack(savedIdx, savedPos, false);
      // Broadcast to others our presence
      broadcastState();
    } catch (e) {}
  });

  // Small UX: prevent the player from covering bottom UI by slightly nudging up on mobile keyboards
  window.addEventListener("resize", () => {
    // clamp position if off-screen
    try {
      const left = root.getBoundingClientRect().left;
      const top = root.getBoundingClientRect().top;
      const maxX = Math.max(8, window.innerWidth - root.offsetWidth - 8);
      const maxY = Math.max(8, window.innerHeight - root.offsetHeight - 8);
      let newLeft = left, newTop = top;
      if (left > maxX) newLeft = maxX;
      if (top > maxY) newTop = maxY;
      root.style.left = `${newLeft}px`;
      root.style.top = `${newTop}px`;
    } catch(e){}
  });

  // Done. The player is ready.
})();
