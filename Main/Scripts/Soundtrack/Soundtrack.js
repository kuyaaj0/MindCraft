/* Scripts/Soundtrack/soundtrack.js
   MindCraft — compact rectangle soundtrack player with dropdown menu
   - Theme-aware (body.class 'theme-dark' or localStorage.theme)
   - Draggable, saves placement
   - Remembers last track index, per-track position, volume, shuffle, repeat
   - Burger menu holds extra controls (shuffle/repeat/volume/mute/open persistent player)
   - Responsive for <=401px and <=600px
   - Uses SVG icons only
*/

(function () {
  if (document.getElementById("mc-soundtrack-root")) return;

  /* -------------------------
     Configure your tracks here
     Use relative paths from pages that will include this script.
     ------------------------- */
  const tracks = [
    { src: "../Assets/Music/Soundtrack/track1.mp3", title: "Track 1", cover: "../Assets/Image/Soundtrack/cover1.png" },
    { src: "../Assets/Music/Soundtrack/track2.mp3", title: "Track 2", cover: "../Assets/Image/Soundtrack/cover2.png" },
    { src: "../Assets/Music/Soundtrack/track3.mp3", title: "Track 3", cover: "../Assets/Image/Soundtrack/cover3.png" },
    { src: "../Assets/Music/Soundtrack/track4.mp3", title: "Track 4", cover: "../Assets/Image/Soundtrack/cover4.png" },
    { src: "../Assets/Music/Soundtrack/track5.mp3", title: "Track 5", cover: "../Assets/Image/Soundtrack/cover5.png" }
  ];
  /* ------------------------- */

  // storage keys
  const K_INDEX = "mc_soundtrack_index_v2";
  const K_POS_PREFIX = "mc_soundtrack_pos_v2_idx_"; // per-track
  const K_VOL = "mc_soundtrack_vol_v2";
  const K_SHUFFLE = "mc_soundtrack_shuffle_v2";
  const K_REPEAT = "mc_soundtrack_repeat_v2";
  const K_PLACEMENT = "mc_soundtrack_placement_v2";
  const K_POPUP = "mc_soundtrack_persistent_popup_v2";

  // create root
  const root = document.createElement("div");
  root.id = "mc-soundtrack-root";
  root.setAttribute("role", "region");
  root.setAttribute("aria-label", "Soundtrack player");
  document.body.appendChild(root);

  // injected CSS
  const css = `
  /* --- Player container --- */
  #mc-soundtrack-root {
    position: fixed;
    right: 18px;
    bottom: 18px;
    z-index: 3000;
    font-family: 'Press Start 2P', cursive;
    --bg: rgba(255,255,255,0.95);
    --border: rgba(0,0,0,0.06);
    --text: #3b2a15;
    --muted: rgba(0,0,0,0.28);
    --accent: #d9b16c;
    --accent2: #a97c4b;
    backdrop-filter: blur(6px);
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.18);
    transition: transform 160ms ease, opacity 200ms ease;
    user-select: none;
    -webkit-user-select: none;
  }

  body.theme-dark #mc-soundtrack-root {
    --bg: rgba(8,12,20,0.88);
    --border: rgba(90,121,184,0.12);
    --text: #f7ead7;
    --muted: rgba(255,255,255,0.14);
    --accent: #263758;
    --accent2: #5a79b8;
    box-shadow: 0 8px 36px rgba(0,0,0,0.6);
  }

  /* panel */
  #mc-soundtrack-root .mc-panel {
    display:flex;
    align-items:center;
    gap:12px;
    padding:10px;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text);
    min-width: 280px;
    max-width: 360px;
    height: 72px;
    border-radius: 10px;
    box-sizing: border-box;
    position: relative;
  }

  /* cover (tiny rectangle) */
  #mc-soundtrack-root .mc-cover {
    width:56px;
    height:48px;
    border-radius:6px;
    object-fit:cover;
    flex: 0 0 auto;
    border: 1px solid var(--border);
    background: linear-gradient(90deg,#eee,#ddd);
    cursor: pointer;
  }

  /* meta */
  #mc-soundtrack-root .mc-meta {
    display:flex;
    flex-direction:column;
    gap:6px;
    flex:1 1 auto;
    min-width:0;
  }
  #mc-soundtrack-root .mc-title {
    font-size:0.62rem;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
    display:block;
    text-align:center;
    color:var(--text);
  }
  #mc-soundtrack-root .mc-progress-wrap {
    display:block;
    width:100%;
    padding:0 6px;
  }
  #mc-soundtrack-root .mc-progress {
    height:6px;
    width:100%;
    background: rgba(0,0,0,0.06);
    border-radius:6px;
    overflow:hidden;
  }
  #mc-soundtrack-root .mc-progress > i {
    display:block;
    height:100%;
    width:0%;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    transition: width 160ms linear;
  }

  /* controls column */
  #mc-soundtrack-root .mc-controls {
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:6px;
    flex: 0 0 auto;
  }
  #mc-soundtrack-root .mc-btn-row {
    display:flex;
    gap:8px;
    align-items:center;
    justify-content:center;
  }

  /* buttons */
  #mc-soundtrack-root button.mc-btn {
    background: transparent;
    border: none;
    width:36px; height:36px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding:6px;
    border-radius:8px;
    cursor:pointer;
    transition: transform 120ms ease, background 120ms ease, box-shadow 120ms ease;
    color: var(--text);
  }

  #mc-soundtrack-root button.mc-btn:hover {
    transform: translateY(-3px);
    background: rgba(0,0,0,0.06);
  }
  body.theme-dark #mc-soundtrack-root button.mc-btn:hover { background: rgba(255,255,255,0.04); }

  /* play button slightly larger but still compact */
  #mc-soundtrack-root button.mc-btn.play {
    width:42px; height:42px;
    background: linear-gradient(180deg,var(--accent), var(--accent2));
    color: #fff;
    box-shadow: 0 4px 0 rgba(0,0,0,0.18);
  }
  #mc-soundtrack-root button.mc-btn svg { width:16px;height:16px; fill: currentColor; }

  /* burger menu */
  #mc-soundtrack-root .mc-burger {
    position: absolute;
    right:8px;
    bottom:6px;
    width:34px;
    height:34px;
    border-radius:6px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    background: transparent;
    border: none;
    color: var(--text);
  }
  #mc-soundtrack-root .mc-burger:hover { background: rgba(0,0,0,0.05); }

  /* dropdown (inside the rectangle) */
  #mc-soundtrack-root .mc-dropdown {
    position: absolute;
    right: 8px;
    bottom: 46px;
    width: 220px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding:8px;
    box-shadow: 0 10px 24px rgba(0,0,0,0.18);
    display: none;
    flex-direction: column;
    gap:8px;
    z-index: 3010;
    animation: dropdownIn 180ms ease;
  }
  @keyframes dropdownIn { from { transform: translateY(6px) scale(.98); opacity:0 } to { transform: translateY(0) scale(1); opacity:1 } }

  #mc-soundtrack-root .mc-dropdown.show { display:flex; }

  .mc-dropdown .row {
    display:flex; align-items:center; justify-content:space-between; gap:8px; padding:6px; border-radius:6px;
  }
  .mc-dropdown .row .label { font-size:0.62rem; color:var(--text); }
  .mc-dropdown .row .small { font-size:0.55rem; color:var(--muted); }

  /* volume slider inside dropdown */
  .mc-dropdown input[type="range"] {
    width: 100%;
    -webkit-appearance: none;
    background: transparent;
    margin-left:6px;
  }
  .mc-dropdown input[type="range"]::-webkit-slider-runnable-track { height:6px; background: rgba(0,0,0,0.08); border-radius:6px; }
  .mc-dropdown input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; width:12px;height:12px;border-radius:50%; background:var(--accent); box-shadow:0 2px 0 rgba(0,0,0,0.15); margin-top:-3px; }

  /* mobile adapt */
  @media (max-width: 600px) {
    #mc-soundtrack-root { right: 12px; bottom: 12px; }
    #mc-soundtrack-root .mc-panel { min-width: 240px; max-width: 300px; height:66px; padding:8px; }
    #mc-soundtrack-root .mc-cover { width:50px; height:40px; }
  }
  @media (max-width: 401px) {
    #mc-soundtrack-root { right: 8px; bottom: 8px; }
    #mc-soundtrack-root .mc-panel { min-width: 200px; max-width: 240px; height:60px; padding:6px; }
    #mc-soundtrack-root .mc-cover { width:44px; height:36px; }
    #mc-soundtrack-root button.mc-btn { width:32px; height:32px; }
    #mc-soundtrack-root button.mc-btn.play { width:38px; height:38px; }
  }

  /* small tooltip-like label when hovering icons (on larger screens only) */
  #mc-soundtrack-root .mc-tooltip {
    position: absolute;
    pointer-events:none;
    background: rgba(0,0,0,0.8);
    color: #fff;
    padding:6px 8px;
    font-size:0.6rem;
    border-radius:6px;
    transform: translateY(-100%);
    white-space:nowrap;
    display:none;
    z-index: 3050;
  }
  `;

  const style = document.createElement("style");
  style.id = "mc-soundtrack-style";
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  // svg icons
  const SVG = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6v12l8.5-6L6 6zM18 6v12h2V6h-2z"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6v12l-8.5-6L16 6zM6 6v12h2V6H6z"/></svg>',
    burger: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.59 6.59L8.17 9H11c1.1 0 2 .9 2 2v1h2V11c0-1.1-.9-2-2-2H8.17l2.42-2.41z"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7z"/></svg>',
    volume: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9v6h4l5 5V4l-5 5H7z"/></svg>',
    mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 12l4.5 4.5-1.5 1.5L15 13.5 10.5 18 9 16.5 13.5 12 9 7.5 10.5 6 15 10.5l4.5-4.5L21 7.5 16.5 12z"/></svg>',
    popup: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v2H7v10h12v2H5z"/></svg>'
  };

  // build DOM structure
  root.innerHTML = `
    <div class="mc-panel" tabindex="0">
      <img class="mc-cover" src="${tracks[0].cover}" alt="cover" />
      <div class="mc-meta" aria-hidden="false">
        <div class="mc-title" id="mc-title">${tracks[0].title}</div>
        <div class="mc-progress-wrap">
          <div class="mc-progress" aria-hidden="true"><i id="mc-progress-bar"></i></div>
        </div>
      </div>

      <div class="mc-controls" aria-hidden="false">
        <div class="mc-btn-row" role="group" aria-label="Playback controls">
          <button class="mc-btn" id="mc-prev" title="Previous">${SVG.prev}</button>
          <button class="mc-btn play" id="mc-play" title="Play">${SVG.play}</button>
          <button class="mc-btn" id="mc-next" title="Next">${SVG.next}</button>
        </div>
      </div>

      <button class="mc-burger" id="mc-burger" aria-haspopup="true" aria-expanded="false" title="Menu">${SVG.burger}</button>

      <div class="mc-dropdown" id="mc-dropdown" role="menu" aria-hidden="true">
        <div class="row" id="mc-row-shuffle">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:22px;height:22px;">${SVG.shuffle}</div>
            <div class="label">Shuffle</div>
          </div>
          <div class="small"><button id="mc-toggle-shuffle" class="mc-btn" title="Toggle Shuffle" aria-pressed="false">${SVG.shuffle}</button></div>
        </div>

        <div class="row" id="mc-row-repeat">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:22px;height:22px;">${SVG.repeat}</div>
            <div class="label">Repeat</div>
          </div>
          <div class="small"><button id="mc-toggle-repeat" class="mc-btn" title="Toggle Repeat" aria-pressed="false">${SVG.repeat}</button></div>
        </div>

        <div class="row" id="mc-row-volume" style="flex-direction:column;align-items:flex-start;">
          <div style="display:flex;align-items:center;gap:8px;width:100%;">
            <div style="width:22px;height:22px;">${SVG.volume}</div>
            <div class="label">Volume</div>
            <div style="margin-left:auto;" class="small" id="mc-vol-label">80%</div>
          </div>
          <input id="mc-vol-range" type="range" min="0" max="1" step="0.01" value="0.8" />
        </div>

        <div class="row" id="mc-row-mute">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:22px;height:22px;">${SVG.mute}</div>
            <div class="label">Mute</div>
          </div>
          <div class="small"><button id="mc-toggle-mute" class="mc-btn" title="Mute/Unmute">${SVG.mute}</button></div>
        </div>

        <div class="row" id="mc-row-popup">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:22px;height:22px;">${SVG.popup}</div>
            <div class="label">Open Persistent Player</div>
          </div>
          <div class="small"><button id="mc-open-popup" class="mc-btn" title="Open persistent player">${SVG.popup}</button></div>
        </div>
      </div>

      <div class="mc-tooltip" id="mc-tooltip" aria-hidden="true"></div>
    </div>
  `;

  // references
  const coverEl = root.querySelector(".mc-cover");
  const titleEl = root.querySelector("#mc-title");
  const progressBar = root.querySelector("#mc-progress-bar");
  const btnPrev = root.querySelector("#mc-prev");
  const btnPlay = root.querySelector("#mc-play");
  const btnNext = root.querySelector("#mc-next");
  const burgerBtn = root.querySelector("#mc-burger");
  const dropdown = root.querySelector("#mc-dropdown");
  const toggleShuffleBtn = root.querySelector("#mc-toggle-shuffle");
  const toggleRepeatBtn = root.querySelector("#mc-toggle-repeat");
  const volRange = root.querySelector("#mc-vol-range");
  const volLabel = root.querySelector("#mc-vol-label");
  const toggleMuteBtn = root.querySelector("#mc-toggle-mute");
  const openPopupBtn = root.querySelector("#mc-open-popup");
  const tooltip = root.querySelector("#mc-tooltip");

  // audio setup
  const audio = new Audio();
  audio.preload = "metadata";
  audio.crossOrigin = "anonymous";

  // state
  let idx = Number(localStorage.getItem(K_INDEX) || 0);
  if (isNaN(idx) || idx < 0 || idx >= tracks.length) idx = 0;

  let shuffle = localStorage.getItem(K_SHUFFLE) === "1";
  let repeat = localStorage.getItem(K_REPEAT) === "1";
  let playing = false;
  let lastUpdate = 0;
  let autoCloseTimeout = null;
  let dragState = null;
  let popupWindow = null;

  // per-track saved positions
  function saveTrackPos(i, seconds) {
    try { localStorage.setItem(K_POS_PREFIX + String(i), String(Math.floor(seconds || 0))); } catch(e) {}
  }
  function loadTrackPos(i) {
    return Number(localStorage.getItem(K_POS_PREFIX + String(i)) || 0);
  }

  // volume init
  let initVol = Number(localStorage.getItem(K_VOL) || 0.8);
  if (isNaN(initVol) || initVol < 0 || initVol > 1) initVol = 0.8;
  audio.volume = initVol;
  volRange.value = initVol;
  volLabel.textContent = Math.round(initVol * 100) + "%";

  // Render state UI
  function renderState() {
    // title/cover
    const t = tracks[idx];
    titleEl.textContent = t.title;
    coverEl.src = t.cover;
    root.querySelector(".mc-panel").setAttribute("data-track-idx", idx);

    // progress bar width will be updated on timeupdate
    // play/pause icon
    btnPlay.innerHTML = playing ? SVG.pause : SVG.play;

    // shuffle/repeat button states (buttons inside dropdown)
    toggleShuffleBtn.style.opacity = shuffle ? "1" : "0.55";
    toggleShuffleBtn.setAttribute("aria-pressed", shuffle ? "true" : "false");
    toggleRepeatBtn.style.opacity = repeat ? "1" : "0.55";
    toggleRepeatBtn.setAttribute("aria-pressed", repeat ? "true" : "false");
  }

  function setTrack(i, seekSec, autoplay) {
    i = ((i % tracks.length) + tracks.length) % tracks.length;
    idx = i;
    const t = tracks[idx];
    audio.src = t.src;
    // attempt to set currentTime after metadata loaded
    audio.currentTime = 0;
    titleEl.textContent = t.title;
    coverEl.src = t.cover;
    localStorage.setItem(K_INDEX, String(idx));

    // try to set seek time if provided or load saved
    const saved = (typeof seekSec === "number" && seekSec > 0) ? seekSec : loadTrackPos(idx);
    if (saved && saved > 0) {
      // When metadata loads, attempt to set time
      audio.addEventListener("loadedmetadata", function _set() {
        try {
          if (audio.duration && saved < audio.duration) audio.currentTime = saved;
        } catch (e) {}
        audio.removeEventListener("loadedmetadata", _set);
      });
    }

    renderState();
    if (autoplay) tryPlay();
  }

  function tryPlay() {
    // return a promise when available
    const p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        playing = true;
        renderState();
      }).catch((err) => {
        // autoplay blocked, wait for user gesture
        playing = false;
        renderState();
      });
    } else {
      playing = true;
      renderState();
    }
  }
  function togglePlay() {
    if (playing) {
      audio.pause();
      playing = false;
    } else {
      tryPlay();
    }
    renderState();
  }

  function prevTrack() {
    if (audio.currentTime > 2 && audio.duration && audio.currentTime > 0) {
      audio.currentTime = 0;
      return;
    }
    if (shuffle) {
      const next = Math.floor(Math.random() * tracks.length);
      setTrack(next, 0, true);
    } else {
      setTrack(idx - 1, 0, true);
    }
  }
  function nextTrack() {
    if (shuffle) {
      const next = Math.floor(Math.random() * tracks.length);
      setTrack(next, 0, true);
    } else {
      const next = idx + 1;
      if (next >= tracks.length) {
        if (repeat) setTrack(0, 0, true);
        else {
          audio.pause();
          playing = false;
          renderState();
          return;
        }
      } else {
        setTrack(next, 0, true);
      }
    }
  }

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration || isNaN(audio.duration)) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = pct + "%";

    // save pos occasionally (throttle)
    const now = Date.now();
    if (now - lastUpdate > 2000) {
      lastUpdate = now;
      saveTrackPos(idx, audio.currentTime);
    }
  });

  audio.addEventListener("pause", () => { playing = false; renderState(); });
  audio.addEventListener("play", () => { playing = true; renderState(); });

  audio.addEventListener("ended", () => {
    if (repeat) setTrack(idx, 0, true);
    else nextTrack();
  });

  // controls events
  btnPlay.addEventListener("click", (e) => { e.preventDefault(); togglePlay(); });
  btnPrev.addEventListener("click", (e) => { e.preventDefault(); prevTrack(); });
  btnNext.addEventListener("click", (e) => { e.preventDefault(); nextTrack(); });

  // clicking cover toggles play/pause
  coverEl.addEventListener("click", () => togglePlay());

  // progress seek click (on progress wrapper element)
  const progressWrap = root.querySelector(".mc-progress");
  progressWrap.addEventListener("click", (ev) => {
    const rect = progressWrap.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const pct = Math.min(1, Math.max(0, x / rect.width));
    if (audio.duration && !isNaN(audio.duration)) {
      audio.currentTime = pct * audio.duration;
      saveTrackPos(idx, audio.currentTime);
    }
  });

  // burger menu toggling
  function closeDropdown() {
    dropdown.classList.remove("show");
    dropdown.setAttribute("aria-hidden", "true");
    burgerBtn.setAttribute("aria-expanded", "false");
    if (autoCloseTimeout) { clearTimeout(autoCloseTimeout); autoCloseTimeout = null; }
  }
  function openDropdown() {
    dropdown.classList.add("show");
    dropdown.setAttribute("aria-hidden", "false");
    burgerBtn.setAttribute("aria-expanded", "true");
    if (autoCloseTimeout) clearTimeout(autoCloseTimeout);
    autoCloseTimeout = setTimeout(() => closeDropdown(), 5000);
  }
  burgerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (dropdown.classList.contains("show")) closeDropdown(); else openDropdown();
  });

  // outside click closes dropdown
  document.addEventListener("pointerdown", (ev) => {
    if (!dropdown.classList.contains("show")) return;
    const within = root.contains(ev.target);
    if (!within) closeDropdown();
  });

  // toggle shuffle/repeat
  toggleShuffleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    shuffle = !shuffle;
    localStorage.setItem(K_SHUFFLE, shuffle ? "1" : "0");
    renderState();
  });
  toggleRepeatBtn.addEventListener("click", (e) => {
    e.preventDefault();
    repeat = !repeat;
    localStorage.setItem(K_REPEAT, repeat ? "1" : "0");
    renderState();
  });

  // volume controls
  volRange.addEventListener("input", (ev) => {
    const v = Number(ev.target.value);
    audio.volume = v;
    localStorage.setItem(K_VOL, String(v));
    volLabel.textContent = Math.round(v * 100) + "%";
  });
  toggleMuteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    audio.muted = !audio.muted;
    toggleMuteBtn.style.opacity = audio.muted ? "0.55" : "1";
  });

  // open popup persistent player (if user allows)
  openPopupBtn.addEventListener("click", (e) => {
    e.preventDefault();
    // open a small (persistent) window that hosts the player (same origin). This helps keep audio across navigation.
    // the popup will load the same page 'popup-player.html' if available or we open a minimal url (same origin) that also includes player.
    // We'll open about:blank and then write minimal content transferring state via localStorage.
    try {
      const w = window.open("", "mindcraft-player", "width=420,height=120");
      if (!w) {
        alert("Popup blocked. Allow popups for this site to enable persistent playback.");
        return;
      }
      // store current state in storage for popup to pick up
      const state = {
        idx, pos: Math.floor(audio.currentTime || 0), vol: audio.volume || 0.8, playing
      };
      localStorage.setItem(K_POPUP, JSON.stringify(state));

      // build a minimal HTML for the popup that reuses this same script (if accessible)
      // We'll write a minimal page that loads the same soundtrack.js from relative path (best-effort)
      const docHtml = `
        <!doctype html><html><head><meta charset="utf-8"><title>MindCraft Player</title>
        <style>html,body{margin:0;height:100%;background:#0b1220;color:#fff;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif}</style>
        </head><body>
        <div id="mc-popup-root">Persistent player starting...</div>
        <script>
          // simple bootstrap: read state and create audio element inside popup
          (function(){
            try {
              const state = JSON.parse(localStorage.getItem("${K_POPUP}") || "{}");
              const tracks = ${JSON.stringify(tracks)};
              const idx = state.idx || 0;
              const a = new Audio(tracks[idx].src);
              a.volume = state.vol || 0.8;
              a.currentTime = state.pos || 0;
              a.loop = false;
              a.play().catch(()=>{});
              // show simple UI
              document.getElementById("mc-popup-root").innerHTML =
                '<div style="padding:10px;border-radius:8px;background:rgba(255,255,255,0.06)">'+
                '<img src="'+tracks[idx].cover+'" style="width:60px;height:40px;vertical-align:middle;margin-right:8px"/>' +
                '<span style="font-family: \\'Press Start 2P\\', monospace">'+tracks[idx].title+'</span>'+
                '<div style="margin-top:8px;font-size:12px;color:#ccc">Close this window to stop persistent playback.</div>'+
                '</div>';
              // sync updates back to localStorage periodically
              setInterval(()=>{ localStorage.setItem("${K_POS_PREFIX}"+idx, Math.floor(a.currentTime)); }, 1500);
              window.addEventListener('beforeunload', ()=>{ try{ localStorage.removeItem("${K_POPUP}"); }catch(e){} });
            } catch(e) { console.error(e); }
          })();
        </script>
        </body></html>
      `;
      w.document.open();
      w.document.write(docHtml);
      w.document.close();
    } catch (e) {
      console.warn("popup failed", e);
    } finally {
      closeDropdown();
    }
  });

  // tooltip helpers for desktop hover
  const buttonsWithTitle = root.querySelectorAll("button[title]");
  buttonsWithTitle.forEach((b) => {
    b.addEventListener("mouseenter", (ev) => {
      const t = b.getAttribute("title");
      tooltip.textContent = t || "";
      tooltip.style.display = "block";
      const rect = b.getBoundingClientRect();
      tooltip.style.left = (rect.left + rect.width/2 - tooltip.offsetWidth/2) + "px";
      tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + "px";
    });
    b.addEventListener("mousemove", (ev) => {
      const rect = b.getBoundingClientRect();
      tooltip.style.left = (rect.left + rect.width/2 - tooltip.offsetWidth/2) + "px";
      tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + "px";
    });
    b.addEventListener("mouseleave", () => { tooltip.style.display = "none"; });
  });

  // drag logic
  function loadPlacement() {
    try {
      const raw = localStorage.getItem(K_PLACEMENT);
      if (!raw) return null;
      const o = JSON.parse(raw);
      return o;
    } catch(e) { return null; }
  }
  function savePlacement(x, y) {
    try { localStorage.setItem(K_PLACEMENT, JSON.stringify({x,y})); } catch(e) {}
  }

  function applyPlacement(v) {
    if (!v) return;
    try {
      root.style.right = "auto";
      root.style.left = v.x + "px";
      root.style.bottom = v.y + "px";
    } catch(e) {}
  }

  // pointer-based dragging
  root.addEventListener("pointerdown", (ev) => {
    // only start drag when clicking the panel area not interactive buttons
    const panel = root.querySelector(".mc-panel");
    if (!panel.contains(ev.target)) return;
    const isBtn = ev.target.closest("button, input, a");
    if (isBtn) return; // don't start drag when interacting with a control
    ev.preventDefault();
    dragState = {
      startX: ev.clientX,
      startY: ev.clientY,
      origLeft: root.getBoundingClientRect().left,
      origBottom: (window.innerHeight - root.getBoundingClientRect().bottom),
      width: root.getBoundingClientRect().width,
      height: root.getBoundingClientRect().height
    };
    root.setPointerCapture(ev.pointerId);
  });

  root.addEventListener("pointermove", (ev) => {
    if (!dragState) return;
    ev.preventDefault();
    const dx = ev.clientX - dragState.startX;
    const dy = ev.clientY - dragState.startY;
    let newLeft = dragState.origLeft + dx;
    let newBottom = dragState.origBottom - dy;
    // clamp within viewport
    newLeft = Math.max(8, Math.min(window.innerWidth - (dragState.width + 8), newLeft));
    newBottom = Math.max(8, Math.min(window.innerHeight - (dragState.height + 8), newBottom));
    root.style.left = newLeft + "px";
    root.style.bottom = newBottom + "px";
  });

  root.addEventListener("pointerup", (ev) => {
    if (!dragState) return;
    try { root.releasePointerCapture(ev.pointerId); } catch(e){}
    // save placement
    const left = root.getBoundingClientRect().left;
    const bottom = window.innerHeight - root.getBoundingClientRect().bottom;
    savePlacement(left, bottom);
    dragState = null;
  });

  // keyboard support: space toggles play when focused
  root.addEventListener("keydown", (ev) => {
    if (ev.key === " " || ev.key === "Spacebar") {
      ev.preventDefault(); togglePlay();
    } else if (ev.key === "ArrowRight") {
      nextTrack();
    } else if (ev.key === "ArrowLeft") {
      prevTrack();
    }
  });

  // restore placement
  const savedPlace = loadPlacement();
  if (savedPlace) applyPlacement(savedPlace);

  // load index and track
  const savedIndex = Number(localStorage.getItem(K_INDEX) || 0);
  if (!isNaN(savedIndex) && savedIndex >= 0 && savedIndex < tracks.length) idx = savedIndex;

  const savedPos = loadTrackPos(idx);
  setTrack(idx, savedPos || 0, false);

  // try autoplay on first interaction (browsers require gesture)
  function onFirstInteraction() {
    tryPlay();
    window.removeEventListener("pointerdown", onFirstInteraction);
    window.removeEventListener("keydown", onFirstInteraction);
  }
  window.addEventListener("pointerdown", onFirstInteraction, { once: true });
  window.addEventListener("keydown", onFirstInteraction, { once: true });

  // listen for theme changes (body class toggle or storage)
  function applyThemeClass() {
    const dark = document.body.classList.contains("theme-dark") || localStorage.getItem("theme") === "dark";
    if (dark) root.classList.add("theme-dark"); else root.classList.remove("theme-dark");
  }
  applyThemeClass();
  const mo = new MutationObserver(applyThemeClass);
  mo.observe(document.documentElement || document.body, { attributes: true, subtree: false, attributeFilter: ["class"] });
  window.addEventListener("storage", (ev) => {
    if (ev.key === "theme") applyThemeClass();
  });

  // expose API
  window.MindCraftSoundtrack = {
    play: () => tryPlay(),
    pause: () => { audio.pause(); },
    next: () => nextTrack(),
    prev: () => prevTrack(),
    setIndex: (i, seek = 0, autoplay = false) => setTrack(i, seek, autoplay),
    getState: () => ({ idx, playing, shuffle, repeat, vol: audio.volume }),
    openPersistentPopup: () => openPopupBtn.click()
  };

  // small accessibility: announce current track changes using live region
  const live = document.createElement("div");
  live.setAttribute("aria-live", "polite");
  live.style.position = "absolute";
  live.style.width = "1px";
  live.style.height = "1px";
  live.style.overflow = "hidden";
  live.style.clip = "rect(0 0 0 0)";
  live.style.clipPath = "inset(50%)";
  root.appendChild(live);

  audio.addEventListener("playing", () => {
    live.textContent = `Playing ${tracks[idx].title}`;
  });

  // keep UI updated
  renderState();

  // ensure we save position when page unloads
  window.addEventListener("beforeunload", () => {
    try {
      saveTrackPos(idx, audio.currentTime || 0);
      // save placement again
      const left = root.getBoundingClientRect().left;
      const bottom = window.innerHeight - root.getBoundingClientRect().bottom;
      savePlacement(left, bottom);
    } catch (e) {}
  });

  // tidy: ensure dropdown closes when resizing or orientation change
  window.addEventListener("resize", () => closeDropdown());

})();
