// ======================================================
// 🎶 MindCraft Dynamic Soundtrack Player (Light/Dark Mode + Responsive)
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  const tracks = [
    { title: "Adventure Begins", file: "../Assets/Music/Soundtrack/track1.mp3", cover: "../Assets/Image/Soundtrack/MVA.png" },
    { title: "MindFlow",         file: "../Assets/Music/Soundtrack/track2.mp3", cover: "../Assets/Image/Soundtrack/MVA.png" },
    { title: "Digital Dream",    file: "../Assets/Music/Soundtrack/track3.mp3", cover: "../Assets/Image/Soundtrack/MVA.png" },
    { title: "Skyline Journey",  file: "../Assets/Music/Soundtrack/track4.mp3", cover: "../Assets/Image/Soundtrack/MVA.png" },
    { title: "Peaceful Horizon", file: "../Assets/Music/Soundtrack/track5.mp3", cover: "../Assets/Image/Soundtrack/MVA.png" }
  ];

  let current = 0;
  const audio = new Audio(tracks[current].file);
  audio.volume = 0.6;

  // 🎧 Floating rectangular player box
  const player = document.createElement("div");
  player.id = "soundtrackPlayer";
  player.innerHTML = `
    <div class="st-cover-area">
      <img id="stCover" src="${tracks[current].cover}" alt="Soundtrack Cover">
    </div>
    <div class="st-info">
      <p id="stTitle">${tracks[current].title}</p>
      <div class="st-controls">
        <button id="stPrev" title="Previous">⏮️</button>
        <button id="stPlay" title="Play/Pause">▶️</button>
        <button id="stNext" title="Next">⏭️</button>
      </div>
    </div>
  `;
  document.body.appendChild(player);

  // 💅 Theme + responsive styling
  const style = document.createElement("style");
  style.textContent = `
    /* =======================
       🎨 Floating Player Style
       ======================= */
    #soundtrackPlayer {
      position: fixed;
      bottom: 25px;
      right: 25px;
      display: flex;
      align-items: center;
      background: var(--player-bg);
      border: 2px solid var(--player-border);
      border-radius: 14px;
      padding: 8px 12px;
      gap: 10px;
      width: 280px;
      height: 70px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.4);
      z-index: 9999;
      transition: all 0.4s ease;
    }

    #soundtrackPlayer .st-cover-area {
      width: 60px;
      height: 60px;
      overflow: hidden;
      border-radius: 10px;
      flex-shrink: 0;
    }

    #soundtrackPlayer img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 10px;
    }

    #soundtrackPlayer .st-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
    }

    #stTitle {
      font-family: 'Press Start 2P', cursive;
      font-size: 0.45rem;
      color: var(--player-text);
      text-shadow: var(--player-text-shadow);
      margin-bottom: 6px;
      width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .st-controls {
      display: flex;
      gap: 6px;
    }

    .st-controls button {
      background: var(--btn-bg);
      color: var(--btn-text);
      border: none;
      border-radius: 6px;
      padding: 4px 6px;
      cursor: pointer;
      font-size: 0.6rem;
      box-shadow: 0 2px 0 var(--btn-shadow);
      transition: transform 0.15s ease, background 0.25s ease;
    }

    .st-controls button:hover {
      transform: translateY(-1px);
      background: var(--btn-hover);
    }

    /* 🌞 Light Theme */
    body.theme-light {
      --player-bg: rgba(235, 240, 255, 0.85);
      --player-border: #8b6f47;
      --player-text: #3b2a15;
      --player-text-shadow: 1px 1px rgba(255,255,255,0.4);
      --btn-bg: #d4a574;
      --btn-text: #3b2a15;
      --btn-shadow: #8b6f47;
      --btn-hover: #e5c890;
    }

    /* 🌙 Dark Theme */
    body.theme-dark {
      --player-bg: rgba(18, 24, 36, 0.9);
      --player-border: #5a79b8;
      --player-text: #f7ead7;
      --player-text-shadow: none;
      --btn-bg: #5a79b8;
      --btn-text: #fff;
      --btn-shadow: #2c3f66;
      --btn-hover: #7fa4f0;
    }

    /* 📱 Mobile (≤401px) */
    @media (max-width: 401px) {
      #soundtrackPlayer {
        width: 210px;
        height: 58px;
        padding: 6px 8px;
        bottom: 20px;
        right: 10px;
        border-radius: 10px;
      }
      #soundtrackPlayer .st-cover-area {
        width: 46px;
        height: 46px;
      }
      #stTitle {
        font-size: 0.4rem;
        max-width: 130px;
      }
      .st-controls button {
        font-size: 0.55rem;
        padding: 3px 5px;
      }
    }

    /* 💻 Desktop (≥600px) */
    @media (min-width: 600px) {
      #soundtrackPlayer {
        width: 300px;
        height: 72px;
        bottom: 25px;
        right: 25px;
      }
      #soundtrackPlayer .st-cover-area {
        width: 64px;
        height: 64px;
      }
      #stTitle {
        font-size: 0.5rem;
        max-width: 190px;
      }
    }
  `;
  document.head.appendChild(style);

  // 🎚️ Player Controls
  const playBtn = player.querySelector("#stPlay");
  const nextBtn = player.querySelector("#stNext");
  const prevBtn = player.querySelector("#stPrev");
  const titleEl = player.querySelector("#stTitle");
  const coverEl = player.querySelector("#stCover");

  function playTrack() { audio.play(); playBtn.textContent = "⏸️"; }
  function pauseTrack() { audio.pause(); playBtn.textContent = "▶️"; }

  function switchTrack() {
    audio.src = tracks[current].file;
    titleEl.textContent = tracks[current].title;
    coverEl.src = tracks[current].cover;
    playTrack();
  }

  playBtn.addEventListener("click", () => audio.paused ? playTrack() : pauseTrack());
  nextBtn.addEventListener("click", () => { current = (current + 1) % tracks.length; switchTrack(); });
  prevBtn.addEventListener("click", () => { current = (current - 1 + tracks.length) % tracks.length; switchTrack(); });
  audio.addEventListener("ended", () => { current = (current + 1) % tracks.length; switchTrack(); });

  // 🌓 Theme change detection (auto updates colors)
  const observer = new MutationObserver(() => {
    document.body.classList.contains("theme-dark");
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
});
