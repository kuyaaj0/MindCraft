/* Scripts/Soundtrack/soundtrack.js
   MindCraft — Tiny rectangle soundtrack player v4 (final)
   - Light/Dark theme support
   - Draggable & smooth movement
   - Burger menu for volume/shuffle/repeat
   - Saves state in localStorage
   - Responsive for desktop/mobile
*/
(function() {
  if (document.getElementById("mc-soundtrack-root")) return;

  // ----- TRACK LIST -----
  const tracks = [
    { src: "../../Assets/Soundtrack/Music/C418 - Minecraft - MVA.mp3", title: "MindCraft", cover: "../../Assets/Images/Soundtrack/MVA.png" },
    { src: "../../Assets/Soundtrack/Music/C418 - Danny - MVA.mp3", title: "Danny", cover: "../../Assets/Images/Soundtrack/MVA.png" },
    { src: "../../Assets/Soundtrack/Music/C418 - Living Mice - MVA.mp3", title: "Living Mice", cover: "../../Assets/Images/Soundtrack/MVA.png" },
    { src: "../../Assets/Soundtrack/Music/C418 - Haggstrom - MVA.mp3", title: "Haggstrom", cover: "../../Assets/Images/Soundtrack/MVA.png" },
    { src: "../../Assets/Soundtrack/Music/C418 - Subwoofer Lullaby - MVA.mp3", title: "Subwoofer Lullaby", cover: "../../Assets/Images/Soundtrack/MVA.png" }
  ];

  // ----- STORAGE KEYS -----
  const LS_INDEX = "mc_soundtrack_index_v4";
  const LS_POS = "mc_soundtrack_pos_v4";
  const LS_SHUFFLE = "mc_soundtrack_shuffle_v4";
  const LS_REPEAT = "mc_soundtrack_repeat_v4";
  const LS_VOL = "mc_soundtrack_vol_v4";

  // ----- ROOT -----
  const root = document.createElement("div");
  root.id = "mc-soundtrack-root";
  document.body.appendChild(root);

  // ----- CSS -----
  const css = `
  #mc-soundtrack-root {
    position: fixed; right: 18px; bottom: 18px;
    z-index: 3000; font-family: 'Press Start 2P', cursive;
    --bg: rgba(54, 42, 30, 0.95);
    --panel-border: rgba(40, 30, 20, 0.2);
    --text: #f0e6d2;
    --muted: rgba(255, 255, 255, 0.25);
    --accent: #d9b16c;
    --accent-2: #a97c4b;
    backdrop-filter: blur(6px);
    border-radius: 12px;
    transition: all 240ms ease;
    user-select: none;
  }
  body.theme-dark #mc-soundtrack-root {
    --bg: rgba(10, 14, 24, 0.88);
    --panel-border: rgba(90, 121, 184, 0.12);
    --text: #f7ead7;
    --muted: rgba(255,255,255,0.14);
    --accent: #263758;
    --accent-2: #5a79b8;
  }

  #mc-soundtrack-root .mc-panel {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 6px 8px;
    background: var(--bg);
    border: 1px solid var(--panel-border);
    color: var(--text);
    min-width: 260px;
    max-width: 320px;
    border-radius: 10px;
    box-sizing: border-box;
    position: relative;
  }

  #mc-soundtrack-root .mc-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  #mc-soundtrack-root .mc-cover {
    width: 56px;
    height: 48px;
    border-radius: 6px;
    object-fit: cover;
    border: 1px solid var(--panel-border);
  }

  #mc-soundtrack-root .mc-meta {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    margin-left: 8px;
    min-width: 0;
  }

  #mc-soundtrack-root .mc-title {
    font-size: 0.65rem;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
  }

  #mc-soundtrack-root .mc-progress {
    height: 4px;
    width: 100%;
    background: rgba(0,0,0,0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 5px;
  }

  #mc-soundtrack-root .mc-progress>i {
    display: block;
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    transition: width 200ms linear;
  }

  #mc-soundtrack-root .mc-controls {
    display: flex;
    gap: 6px;
    justify-content: center;
    align-items: center;
    margin-bottom: 2px;
  }

  #mc-soundtrack-root button.mc-btn {
    background: transparent;
    border: none;
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    cursor: pointer;
    transition: transform 120ms ease, background 120ms ease;
  }

  #mc-soundtrack-root button.mc-btn:hover {
    transform: translateY(-2px);
    background: rgba(0,0,0,0.06);
  }

  body.theme-dark #mc-soundtrack-root button.mc-btn:hover {
    background: rgba(255,255,255,0.05);
  }

  #mc-soundtrack-root button.mc-btn.play {
    width: 40px;
    height: 40px;
    background: linear-gradient(180deg, var(--accent), var(--accent-2));
    color: #fff;
    box-shadow: 0 3px 0 rgba(0,0,0,0.18);
  }

  #mc-soundtrack-root button.mc-btn svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }

  #mc-soundtrack-root .mc-burger-wrapper { position: relative; }
  #mc-soundtrack-root .mc-burger {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  #mc-soundtrack-root .mc-dropdown {
    position: absolute;
    top: 34px;
    right: 0;
    background: var(--bg);
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    padding: 6px;
    display: none;
    flex-direction: column;
    min-width: 140px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.18);
  }

  #mc-soundtrack-root .mc-dropdown button.mc-btn {
    width: 100%;
    height: 28px;
    justify-content: flex-start;
  }

  #mc-soundtrack-root input.mc-range {
    width: 100%;
    -webkit-appearance: none;
    background: transparent;
  }

  #mc-soundtrack-root input.mc-range::-webkit-slider-runnable-track {
    height: 6px;
    background: rgba(0,0,0,0.08);
    border-radius: 6px;
  }

  #mc-soundtrack-root input.mc-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px; height: 12px; border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 2px 0 rgba(0,0,0,0.15);
    margin-top: -3px;
  }
  `;

  const style = document.createElement("style");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  // ----- SVG -----
  const SVG = {
    prev: `<svg viewBox="0 0 24 24"><path d="M6 19V5l8.5 7L6 19zm9-14h2v14h-2V5z"/></svg>`,
    next: `<svg viewBox="0 0 24 24"><path d="M16 5v14l-8.5-7L16 5zm-9 0h2v14H7V5z"/></svg>`,
    play: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    burger: `<svg viewBox="0 0 24 24"><path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/></svg>`,
    shuffle: `<svg viewBox="0 0 24 24"><path d="M10.59 6.59L8.17 9H11c1.1 0 2 .9 2 2v1h2V11c0-1.1-.9-2-2-2H8.17l2.42-2.41L10 6 6 10l4 4 1.41-1.41L8.83 12H13c1.1 0 2-.9 2-2V9h2v1c0 1.1-.9 2-2 2h-4.17l2.42 2.41L14 18l4-4-4-4-1.41 1.41z"/></svg>`,
    repeat: `<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v5z"/></svg>`,
    volume: `<svg viewBox="0 0 24 24"><path d="M7 9v6h4l5 5V4l-5 5H7z"/></svg>`
  };

  // ----- HTML -----
  root.innerHTML = `
  <div class="mc-panel">
    <div class="mc-row">
      <img class="mc-cover" src="${tracks[0].cover}" alt="cover"/>
      <div class="mc-meta">
        <div class="mc-title" id="mc-title">${tracks[0].title}</div>
        <div class="mc-progress" title="progress"><i id="mc-progress-bar"></i></div>
      </div>
      <div class="mc-burger-wrapper">
        <div class="mc-burger" id="mc-burger" title="More">${SVG.burger}</div>
        <div class="mc-dropdown" id="mc-dropdown">
          <button class="mc-btn" id="mc-shuffle">${SVG.shuffle} Shuffle</button>
          <button class="mc-btn" id="mc-repeat">${SVG.repeat} Repeat</button>
          <div style="display:flex;align-items:center;gap:4px;">${SVG.volume}<input class="mc-range" id="mc-vol" type="range" min="0" max="1" step="0.01" value="0.8"/></div>
        </div>
      </div>
    </div>
    <div class="mc-controls">
      <button class="mc-btn" id="mc-prev" title="Previous">${SVG.prev}</button>
      <button class="mc-btn play" id="mc-play" title="Play">${SVG.play}</button>
      <button class="mc-btn" id="mc-next" title="Next">${SVG.next}</button>
    </div>
  </div>`;

  // ----- JS Logic -----
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
  const burgerBtn = root.querySelector("#mc-burger");
  const dropdown = root.querySelector("#mc-dropdown");

  let playing = false;
  let shuffle = localStorage.getItem(LS_SHUFFLE) === "1";
  let repeat = localStorage.getItem(LS_REPEAT) === "1";

  // Theme observer
  function applyTheme() {
    const dark = document.body.classList.contains("theme-dark") || localStorage.getItem("theme") === "dark";
    if (dark) root.classList.add("theme-dark");
    else root.classList.remove("theme-dark");
  }
  applyTheme();
  new MutationObserver(applyTheme).observe(document.body, { attributes: true });

  // Set track
  function setTrack(i, autoplay = false) {
    i = ((i % tracks.length) + tracks.length) % tracks.length;
    idx = i;
    const t = tracks[idx];
    audio.src = t.src;
    titleEl.textContent = t.title;
    coverEl.src = t.cover;
    localStorage.setItem(LS_INDEX, String(idx));
    if (autoplay) tryPlay();
  }

  // Play functions
  function renderPlayState() {
    btnPlay.innerHTML = playing ? SVG.pause : SVG.play;
    btnShuffle.style.opacity = shuffle ? "1" : "0.55";
    btnRepeat.style.opacity = repeat ? "1" : "0.55";
  }

  function tryPlay() {
    audio.play().then(() => {
      playing = true;
      renderPlayState();
    }).catch((err) => {
      console.warn("Autoplay blocked, waiting for click:", err);
      document.body.addEventListener("click", () => {
        audio.play();
        playing = true;
        renderPlayState();
      }, { once: true });
    });
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
    if (audio.currentTime > 2) audio.currentTime = 0;
    else setTrack(idx - 1, true);
  }

  function nextTrack() {
    if (shuffle) setTrack(Math.floor(Math.random() * tracks.length), true);
    else if (idx + 1 < tracks.length) setTrack(idx + 1, true);
    else if (repeat) setTrack(0, true);
  }

  // Audio events
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = pct + "%";
    localStorage.setItem(LS_POS, Math.floor(audio.currentTime));
  });

  audio.addEventListener("ended", () => {
    if (repeat) setTrack(idx, true);
    else nextTrack();
  });

  // Buttons
  btnPlay.addEventListener("click", togglePlay);
  btnPrev.addEventListener("click", prevTrack);
  btnNext.addEventListener("click", nextTrack);

  burgerBtn.addEventListener("click", () => {
    dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
  });

  btnShuffle.addEventListener("click", () => {
    shuffle = !shuffle;
    localStorage.setItem(LS_SHUFFLE, shuffle ? "1" : "0");
    renderPlayState();
  });

  btnRepeat.addEventListener("click", () => {
    repeat = !repeat;
    localStorage.setItem(LS_REPEAT, repeat ? "1" : "0");
    renderPlayState();
  });

  volInput.addEventListener("input", () => {
    audio.volume = volInput.value;
    localStorage.setItem(LS_VOL, volInput.value);
  });

  // Smooth dragging
  let drag = false, dragX = 0, dragY = 0;
  let pendingX = null, pendingY = null;

  root.addEventListener("mousedown", (e) => {
    drag = true;
    dragX = e.clientX - root.getBoundingClientRect().left;
    dragY = e.clientY - root.getBoundingClientRect().top;
  });
  window.addEventListener("mouseup", () => { drag = false; });
  window.addEventListener("mousemove", (e) => {
    if (drag) {
      pendingX = e.clientX - dragX;
      pendingY = e.clientY - dragY;
    }
  });

  function animateDrag() {
    if (pendingX !== null && pendingY !== null) {
      root.style.left = pendingX + "px";
      root.style.top = pendingY + "px";
      root.style.right = "auto";
      root.style.bottom = "auto";
    }
    requestAnimationFrame(animateDrag);
  }
  requestAnimationFrame(animateDrag);

  // Initialize
  setTrack(idx, false);
  renderPlayState();
})();
