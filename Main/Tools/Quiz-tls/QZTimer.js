// ============================================
// ⏱️ MindCraft Quiz Timer System
// File: Tools/Quiz-tls/QZTimer.js
// ============================================

// === CONFIGURATION ===
const QZTimer = {
  duration: 300, // ⏰ seconds (default 5 minutes)
  redirectURL: "../../../Webside/Student.html", // Redirect or result page after timeout
  warningAt: 60, // Warn when only 60 seconds left
};

// === CREATE TIMER UI ===
document.addEventListener("DOMContentLoaded", () => {
  // Avoid duplicate timers
  if (document.querySelector(".quiz-timer")) return;

  const timerContainer = document.createElement("div");
  timerContainer.className = "quiz-timer";

  timerContainer.innerHTML = `
    <div class="timer-bar"></div>
    <div class="timer-text">🕒 05:00</div>
  `;

  document.body.appendChild(timerContainer);
  startQuizTimer(QZTimer.duration);
});

// === TIMER FUNCTION ===
function startQuizTimer(duration) {
  let remaining = duration;
  const bar = document.querySelector(".timer-bar");
  const text = document.querySelector(".timer-text");
  const totalWidth = 100;

  const interval = setInterval(() => {
    remaining--;

    // Calculate minutes + seconds
    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;
    text.textContent = `🕒 ${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

    // Update progress bar width
    const progress = (remaining / duration) * totalWidth;
    bar.style.width = `${progress}%`;

    // Flash warning color
    if (remaining <= QZTimer.warningAt) {
      bar.classList.add("warning");
    }

    // Time finished
    if (remaining <= 0) {
      clearInterval(interval);
      text.textContent = "⏰ Time’s Up!";
      document.body.classList.add("timeout");

      // Smooth fade-out + redirect
      setTimeout(() => {
        window.location.href = QZTimer.redirectURL;
      }, 2000);
    }
  }, 1000);
}

// === STYLES ===
const style = document.createElement("style");
style.textContent = `
  .quiz-timer {
    position: fixed;
    top: 15px;
    right: 15px;
    width: 220px;
    height: 36px;
    border-radius: 10px;
    background: rgba(0,0,0,0.3);
    border: 2px solid #000;
    overflow: hidden;
    font-family: 'Press Start 2P', cursive;
    z-index: 9999;
    box-shadow: 0 0 15px rgba(0,0,0,0.25);
  }

  .timer-bar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, #00ff9d, #00bfff, #ff69b4);
    background-size: 300%;
    animation: timerShift 6s linear infinite;
    transition: width 1s linear;
  }

  .timer-text {
    position: absolute;
    width: 100%;
    text-align: center;
    top: 8px;
    font-size: 0.55rem;
    color: white;
    text-shadow: 1px 1px 0 black;
    pointer-events: none;
  }

  .timer-bar.warning {
    background: linear-gradient(90deg, #ff0000, #ff6600, #ff0000);
    animation: timerFlash 0.8s alternate infinite;
  }

  @keyframes timerShift {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }

  @keyframes timerFlash {
    from { opacity: 1; }
    to { opacity: 0.6; }
  }

  body.timeout {
    animation: fadeOutScreen 1s ease forwards;
  }

  @keyframes fadeOutScreen {
    from { opacity: 1; }
    to { opacity: 0; filter: blur(5px); }
  }

  @media (max-width: 768px) {
    .quiz-timer {
      width: 180px;
      height: 32px;
      right: 10px;
      top: 10px;
    }
    .timer-text {
      font-size: 0.5rem;
    }
  }
`;
document.head.appendChild(style);
