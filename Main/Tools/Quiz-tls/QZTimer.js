// ============================================
// ⏱️ MindCraft Quiz Timer System (Dynamic)
// File: Tools/Quiz-tls/QZTimer.js
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // Prevent duplicate timer
  if (document.querySelector(".quiz-timer")) return;

  // === Detect Questions ===
  const radioQuestions = document.querySelectorAll('input[type="radio"]').length;
  const textQuestions = document.querySelectorAll('input[type="text"]').length;

  // Time settings per question type
  const timePerRadio = 20; // seconds
  const timePerText = 35;  // seconds

  // Total time
  const totalSeconds = Math.max(
    (radioQuestions * timePerRadio) + (textQuestions * timePerText),
    120 // minimum of 2 minutes
  );

  // === Create Timer UI ===
  const timerContainer = document.createElement("div");
  timerContainer.className = "quiz-timer";
  timerContainer.innerHTML = `
    <div class="timer-bar"></div>
    <div class="timer-text">🕒 Loading...</div>
  `;
  document.body.appendChild(timerContainer);

  // === Start Countdown ===
  startQuizTimer(totalSeconds);
});

function startQuizTimer(duration) {
  let remaining = duration;
  const bar = document.querySelector(".timer-bar");
  const text = document.querySelector(".timer-text");
  const totalWidth = 100;

  const interval = setInterval(() => {
    remaining--;

    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;
    text.textContent = `🕒 ${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

    const progress = (remaining / duration) * totalWidth;
    bar.style.width = `${progress}%`;

    // Warning under 1 minute
    if (remaining <= 60) {
      bar.classList.add("warning");
    }

    if (remaining <= 0) {
      clearInterval(interval);
      text.textContent = "⏰ Time’s Up!";
      document.body.classList.add("timeout");

      // You can change redirect if needed
      setTimeout(() => {
        alert("Your time is up! Redirecting to Student page.");
        window.location.href = "../../../Webside/Student.html";
      }, 2000);
    }
  }, 1000);
}

// === Styles ===
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
