/* Scripts/Soundtrack/soundtrack.js
   MindCraft — tiny rectangle soundtrack player w/ SVG icons
   - Uses Assets/Music/Soundtrack/track1.mp3 ... track5.mp3
   - Uses Assets/Image/Soundtrack/cover1.png ... cover5.png
   - Theme-aware: responds to body.theme-dark / localStorage.theme
   - Remembers last index and position in localStorage
*/
(function () {
  if (document.getElementById("mc-soundtrack-root")) return;

  // ----- EDIT TRACK LIST HERE -----
  // make sure these files exist:
  // Assets/Music/Soundtrack/track1.mp3 ... track5.mp3
  // Assets/Image/Soundtrack/cover1.png ... cover5.png
  const tracks = [
    { src: "../Assets/Soundtrack/Music/C418 - Minecraft - MVA.mp3", title: "MindCraft", cover: "../Assets/Image/Soundtrack/MVA.png" },
    { src: "../Assets/Soundtrack/Music/C418 - Danny - MVA.mp3", title: "Danny", cover: "../Assets/Image/Soundtrack/MVA.png" },
    { src: "../Assets/Soundtrack/Music/C418 - Living Mice - MVA.mp3", title: "Living Mice", cover: "../Assets/Image/Soundtrack/MVA.png" },
    { src: "../Assets/Soundtrack/Music/C418 - Haggstrom - MVA.mp3", title: "Haggstrom", cover: "../Assets/Image/Soundtrack/MVA.png" },
    { src: "../Assets/Soundtrack/Music/C418 - Subwoofer Lullaby - MVA.mp3", title: "Subwoofer Lullaby", cover: "../Assets/Image/Soundtrack/MVA.png" }
  ];
  // --------------------------------

  // storage keys
  const LS_INDEX = "mc_soundtrack_index_v1";
  const LS_POS = "mc_soundtrack_pos_v1";
  const LS_SHUFFLE = "mc_soundtrack_shuffle_v1";
  const LS_REPEAT = "mc_soundtrack_repeat_v1";

  // create root container
  const root = document.createElement("div");
  root.id = "mc-soundtrack-root";
  root.setAttribute("aria-hidden", "false");
  document.body.appendChild(root);

  // inject CSS for player
  const css = `
  /* Soundtrack player - injected */
  #mc-soundtrack-root {
    position: fixed;
    right: 18px;
    bottom: 18px;
    z-index: 3000;
    font-family: 'Press Start 2P', cursive;
    --bg: rgba(255,255,255,0.92);
    --panel-border: rgba(0,0,0,0.08);
    --text: #3b2a15;
    --muted: rgba(0,0,0,0.25);
    --accent: #d9b16c;
    --accent-2: #a97c4b;
    backdrop-filter: blur(6px);
    transition: all 240ms ease;
    box-shadow: 0 6px 18px rgba(0,0,0,0.18);
    border-radius: 12px;
  }
  body.theme-dark #mc-soundtrack-root {
    --bg: rgba(10,14,24,0.88);
    --panel-border: rgba(90,121,184,0.12);
    --text: #f7ead7;
    --muted: rgba(255,255,255,0.14);
    --accent: #263758;
    --accent-2: #5a79b8;
    box-shadow: 0 8px 30px rgba(0,0,0,0.6);
  }
  #mc-soundtrack-root .mc-panel {
    display:flex;
    gap:10px;
    align-items:center;
    padding:8px;
    background: var(--bg);
    border: 1px solid var(--panel-border);
    color: var(--text);
    min-width: 260px;
    max-width: 320px;
    height: 64px;
    border-radius: 10px;
    box-sizing: border-box;
  }
  /* cover (tiny rectangle) */
  #mc-soundtrack-root .mc-cover {
    width: 56px;
    height: 48px;
    border-radius: 6px;
    object-fit: cover;
    flex: 0 0 auto;
    border: 1px solid var(--panel-border);
    background: linear-gradient(90deg, #eee, #ddd);
  }
  #mc-soundtrack-root .mc-meta {
    display:flex;
    flex-direction:column;
    gap:4px;
    flex: 1 1 auto;
    min-width: 0;
  }
  #mc-soundtrack-root .mc-title {
    font-size: 0.6rem;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  #mc-soundtrack-root .mc-controls {
    display:flex;
    gap:6px;
    align-items:center;
  }
  /* button common */
  #mc-soundtrack-root button.mc-btn {
    background: transparent;
    border: none;
    width: 36px;
    height: 36px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding:6px;
    border-radius:8px;
    cursor:pointer;
    transition: transform 120ms ease, background 120ms ease;
  }
  #mc-soundtrack-root button.mc-btn:hover {
    transform: translateY(-3px);
    background: rgba(0,0,0,0.06);
  }
  body.theme-dark #mc-soundtrack-root button.mc-btn:hover {
    background: rgba(255,255,255,0.04);
  }

  /* large play button */
  #mc-soundtrack-root button.mc-btn.play {
    width:44px; height:44px;
    background: linear-gradient(180deg,var(--accent), var(--accent-2));
    color: #fff;
    box-shadow: 0 4px 0 rgba(0,0,0,0.18);
  }
  #mc-soundtrack-root button.mc-btn.play svg { width:18px; height:18px; }

  /* small icon style */
  #mc-soundtrack-root button.mc-btn svg {
    width:18px; height:18px; fill: currentColor;
  }

  /* progress */
  #mc-soundtrack-root .mc-progress {
    height: 4px;
    width: 100%;
    background: rgba(0,0,0,0.06);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 4px;
  }
  #mc-soundtrack-root .mc-progress > i {
    display:block;
    height:100%;
    width:0%;
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    transition: width 200ms linear;
  }

  /* volume */
  #mc-soundtrack-root .mc-vol {
    width: 70px;
    display:flex;
    gap:6px;
    align-items:center;
  }
  #mc-soundtrack-root input[type="range"].mc-range { width: 100%; -webkit-appearance:none; background:transparent; }
  #mc-soundtrack-root input[type="range"].mc-range::-webkit-slider-runnable-track { height:6px; background: rgba(0,0,0,0.08); border-radius:6px; }
  #mc-soundtrack-root input[type="range"].mc-range::-webkit-slider-thumb { -webkit-appearance:none; width:12px;height:12px;border-radius:50%; background:var(--accent); box-shadow:0 2px 0 rgba(0,0,0,0.15); margin-top:-3px; }

  /* compact for mobile */
  @media (max-width: 600px) {
    #mc-soundtrack-root { right: 12px; bottom: 12px; }
    #mc-soundtrack-root .mc-panel { min-width: 230px; max-width: 280px; height:60px; padding:6px; }
    #mc-soundtrack-root .mc-cover { width:50px; height:42px; }
  }
  @media (max-width: 401px) {
    #mc-soundtrack-root { right: 8px; bottom: 8px; }
    #mc-soundtrack-root .mc-panel { min-width: 200px; max-width: 240px; height:56px; padding:6px; }
    #mc-soundtrack-root .mc-cover { width:44px; height:40px; }
    #mc-soundtrack-root button.mc-btn { width:34px; height:34px; }
    #mc-soundtrack-root button.mc-btn.play { width:40px; height:40px; }
    #mc-soundtrack-root .mc-vol { display:none; }
  }
  `;

  const style = document.createElement("style");
  style.id = "mc-soundtrack-style";
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  // SVG icons
  const SVG = {
    prev: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6v12l8.5-6L6 6zm10 0v12h2V6h-2z"/></svg>`,
    next: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6v12l-8.5-6L16 6zm4 0v12h2V6h-2z"/></svg>`,
    play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    shuffle: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.59 6.59L8.17 9H11c1.1 0 2 .9 2 2v1h2V11c0-1.1-.9-2-2-2H8.17l2.42-2.41L10 6 6 10l4 4 1.41-1.41L8.83 12H13c1.1 0 2-.9 2-2V9h2v1c0 1.1-.9 2-2 2h-4.17l2.42 2.41L14 18l4-4-4-4-1.41 1.41z"/></svg>`,
    repeat: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v5z"/></svg>`,
    volume: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9v6h4l5 5V4l-5 5H7z"/></svg>`,
  };

  // build DOM
  root.innerHTML = `
    <div class="mc-panel" role="region" aria-label="soundtrack player">
      <img class="mc-cover" src="${tracks[0].cover}" alt="cover" />
      <div class="mc-meta">
        <div class="mc-title" id="mc-title">${tracks[0].title}</div>
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
        <div class="mc-vol" style="margin-left:8px;">
          <button class="mc-btn" id="mc-volbtn" title="Mute/Unmute">${SVG.volume}</button>
          <input aria-label="volume" class="mc-range" id="mc-vol" type="range" min="0" max="1" step="0.01" value="0.8" />
        </div>
      </div>
    </div>
  `;

  // references
  const audio = new Audio();
  let idx = Number(localStorage.getItem(LS_INDEX) || 0);
  if (isNaN(idx) || idx < 0 || idx >= tracks.length) idx = 0;
  const progressBar = root.querySelector("#mc-progress-bar");
  const titleEl = root.querySelector("#mc-title");
  const coverEl = root.querySelector(".mc-cover");
  const btnPrev = root.querySelector("#mc-prev");
  const btnNext = root.querySelector("#mc-next");
  const btnPlay = root.querySelector("#mc-play");
  const btnShuffle = root.querySelector("#mc-shuffle");
  const btnRepeat = root.querySelector("#mc-repeat");
  const volInput = root.querySelector("#mc-vol");
  const volBtn = root.querySelector("#mc-volbtn");

  // state
  let playing = false;
  let shuffle = localStorage.getItem(LS_SHUFFLE) === "1";
  let repeat = localStorage.getItem(LS_REPEAT) === "1";
  let lastUpdate = 0;
  let seeking = false;
  let lastPosSavedTimer = null;

  // helpers
  function applyThemeToPlayer() {
    // theme.js sets body.class 'theme-dark' or localStorage.theme
    const dark = document.body.classList.contains("theme-dark") || localStorage.getItem("theme") === "dark";
    if (dark) root.classList.add("theme-dark");
    else root.classList.remove("theme-dark");
  }
  applyThemeToPlayer();
  // observe theme changes (body class / storage change)
  const mo = new MutationObserver(applyThemeToPlayer);
  mo.observe(document.documentElement || document.body, { attributes: true, childList: false, subtree: false });

  window.addEventListener("storage", (e) => {
    if (e.key === "theme") applyThemeToPlayer();
  });

  function setTrack(i, seekTo = 0, autoplay = false) {
    i = ((i % tracks.length) + tracks.length) % tracks.length;
    idx = i;
    const t = tracks[idx];
    audio.src = t.src;
    audio.crossOrigin = "anonymous";
    titleEl.textContent = t.title;
    coverEl.src = t.cover;
    localStorage.setItem(LS_INDEX, String(idx));
    audio.currentTime = 0;
    if (seekTo > 0) {
      try { audio.currentTime = Math.min(seekTo, audio.duration || seekTo); } catch(e) {}
    } else {
      const savedPos = Number(localStorage.getItem(LS_POS) || 0);
      if (savedPos && savedPos > 0 && savedPos < 60*60*10) {
        // savedPos stored as seconds for this track index pattern: we store keyed by index inside LS_POS value (see savePos)
        // For simplicity last saved pos is global. If you want per-track pos, we can store per-index.
        audio.currentTime = savedPos;
      }
    }
    renderPlayState();
    if (autoplay) tryPlay();
  }

  function renderPlayState() {
    // play/pause icon
    btnPlay.innerHTML = playing ? SVG.pause : SVG.play;
    // shuffle & repeat UI
    btnShuffle.style.opacity = shuffle ? "1" : "0.55";
    btnShuffle.style.filter = shuffle ? "brightness(1.05) saturate(1.2)" : "none";
    btnRepeat.style.opacity = repeat ? "1" : "0.55";
    btnRepeat.style.filter = repeat ? "brightness(1.05) saturate(1.2)" : "none";
  }

  function tryPlay() {
    // browsers block autoplay — attempt and if blocked, leave paused
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        playing = true;
        renderPlayState();
      }).catch((e) => {
        // cannot autoplay — keep playing=false, UI ready for user interaction
        playing = false;
        renderPlayState();
      });
    }
  }

  function togglePlay() {
    if (playing) {
      audio.pause();
      playing = false;
    } else {
      tryPlay();
    }
    renderPlayState();
  }

  function prevTrack() {
    if (audio.currentTime > 2) {
      audio.currentTime = 0;
      return;
    }
    if (shuffle) {
      const nextIdx = Math.floor(Math.random() * tracks.length);
      setTrack(nextIdx, 0, true);
    } else {
      setTrack(idx - 1, 0, true);
    }
  }

  function nextTrack() {
    if (shuffle) {
      const nextIdx = Math.floor(Math.random() * tracks.length);
      setTrack(nextIdx, 0, true);
    } else {
      const nextIdx = idx + 1;
      if (nextIdx >= tracks.length) {
        if (repeat) setTrack(0, 0, true);
        else { audio.pause(); playing = false; renderPlayState(); return; }
      } else {
        setTrack(nextIdx, 0, true);
      }
    }
  }

  // progress update loop
  audio.addEventListener("timeupdate", () => {
    if (!progressBar) return;
    if (!audio.duration || isNaN(audio.duration)) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = pct + "%";

    // Save position occasionally
    const now = Date.now();
    if (now - lastUpdate > 2000) {
      lastUpdate = now;
      // Store last position in seconds
      localStorage.setItem(LS_POS, String(Math.floor(audio.currentTime)));
      // throttle occasional full save
      if (lastPosSavedTimer) clearTimeout(lastPosSavedTimer);
      lastPosSavedTimer = setTimeout(() => {
        localStorage.setItem(LS_POS, String(Math.floor(audio.currentTime)));
      }, 1000);
    }
  });

  audio.addEventListener("play", () => { playing = true; renderPlayState(); });
  audio.addEventListener("pause", () => { playing = false; renderPlayState(); });

  audio.addEventListener("ended", () => {
    // when ended, either repeat current or next
    if (repeat) {
      setTrack(idx, 0, true);
    } else {
      nextTrack();
    }
  });

  // click handlers
  btnPlay.addEventListener("click", (e) => {
    e.preventDefault();
    togglePlay();
  });
  btnPrev.addEventListener("click", (e) => { e.preventDefault(); prevTrack(); });
  btnNext.addEventListener("click", (e) => { e.preventDefault(); nextTrack(); });

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

  // volume
  const initialVol = Number(localStorage.getItem("mc_soundtrack_vol_v1") || 0.8);
  audio.volume = initialVol;
  volInput.value = initialVol;
  volInput.addEventListener("input", (ev) => {
    const v = Number(ev.target.value);
    audio.volume = v;
    localStorage.setItem("mc_soundtrack_vol_v1", String(v));
  });
  volBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (audio.muted) {
      audio.muted = false;
      volBtn.style.opacity = "1";
    } else {
      audio.muted = true;
      volBtn.style.opacity = "0.55";
    }
  });

  // clicking cover toggles play
  coverEl.addEventListener("click", () => togglePlay());

  // allow clicking progress area to seek
  const progressWrap = root.querySelector(".mc-progress");
  progressWrap.addEventListener("click", (ev) => {
    const rect = progressWrap.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const pct = Math.min(1, Math.max(0, x / rect.width));
    if (audio.duration && !isNaN(audio.duration)) {
      audio.currentTime = pct * audio.duration;
    }
  });

  // keyboard accessibility: space toggles when focused
  root.addEventListener("keydown", (ev) => {
    if (ev.key === " " || ev.key === "Spacebar") { // space
      ev.preventDefault();
      togglePlay();
    }
  });

  // escape to close (remove) player — optional safety to remove
  root.addEventListener("dblclick", () => {
    try { root.remove(); localStorage.removeItem(LS_POS); } catch (e) {}
  });

  // initialize track and try resuming position
  const savedPos = Number(localStorage.getItem(LS_POS) || 0);
  setTrack(idx, savedPos || 0, false);

  // if user interacts anywhere on page (first click), try autoplay (respects browser policy)
  function userInteractionAutoPlay() {
    tryPlay();
    window.removeEventListener("pointerdown", userInteractionAutoPlay);
    window.removeEventListener("keydown", userInteractionAutoPlay);
  }
  window.addEventListener("pointerdown", userInteractionAutoPlay, { once: true });
  window.addEventListener("keydown", userInteractionAutoPlay, { once: true });

  // Expose a small API to window for debugging/control
  window.MindCraftSoundtrack = {
    play: () => { tryPlay(); },
    pause: () => { audio.pause(); },
    next: () => nextTrack(),
    prev: () => prevTrack(),
    setIndex: (i) => { setTrack(i, 0, false); },
    getState: () => ({ idx, playing, shuffle, repeat })
  };

  // Final render
  renderPlayState();
})();
