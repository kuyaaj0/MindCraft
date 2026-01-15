// ===============================
// 💾 MindCraft Global Lesson Tools
// ===============================

// === COPY BUTTON FUNCTIONALITY ===
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".code-block").forEach(block => {
    if (block.querySelector(".code-btn")) return; // Prevent duplicates

    const btn = document.createElement("button");
    btn.className = "code-btn";
    btn.textContent = "📋 Copy";

    btn.onclick = () => {
      const code = block.querySelector("pre").innerText;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = "✅ Copied!";
        setTimeout(() => (btn.textContent = "📋 Copy"), 1500);
      });
    };

    block.appendChild(btn);
  });
});

// === COPY BUTTON STYLE (Cyberpunk look) ===
const copyStyle = document.createElement("style");
copyStyle.textContent = `
  .code-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 0.8rem;
    color: #fff;
    background: #ff69b4;
    border: none;
    border-radius: 6px;
    padding: 5px 12px;
    cursor: pointer;
    font-family: 'Orbitron', sans-serif;
    box-shadow: 0 0 10px #ff69b4, 0 0 20px #ff00ff;
    transition: all 0.2s ease;
    z-index: 10;
  }
  .code-btn:hover {
    background: #ff85c1;
    box-shadow: 0 0 20px #ff85c1, 0 0 40px #ff00ff;
    transform: scale(1.05);
  }
`;
document.head.appendChild(copyStyle);


// ===============================
// ❌ EXIT BUTTON FUNCTIONALITY (with fade-out)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".exit-btn")) return;

  const exitBtn = document.createElement("button");
  exitBtn.className = "exit-btn";
  exitBtn.textContent = "❌ Exit";

  // When clicked → fade out + redirect
  exitBtn.onclick = () => {
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = "../../../Webside/Student.html";
    }, 600); // Delay matches the fade-out animation
  };

  document.body.appendChild(exitBtn);
});

// === EXIT BUTTON + FADE STYLE ===
const exitStyle = document.createElement("style");
exitStyle.textContent = `
  /* Exit button style */
  .exit-btn {
    position: fixed;
    top: 15px;
    right: 15px;
    font-size: 1rem;
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    background: #ff1493;
    color: #fff;
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 0 10px #ff00ff, 0 0 25px #ff00ff;
    font-family: 'Orbitron', monospace;
    transition: all 0.25s ease;
  }
  .exit-btn:hover {
    background: #ff66c4;
    box-shadow: 0 0 20px #ff66c4, 0 0 40px #ff00ff;
    transform: scale(1.05);
  }

  /* Fade-out animation for smooth exit */
  @keyframes fadeOutScreen {
    from { opacity: 1; filter: blur(0px); }
    to { opacity: 0; filter: blur(8px); }
  }
  body.fade-out {
    animation: fadeOutScreen 0.6s ease forwards;
  }
`;
document.head.appendChild(exitStyle);
