// ===============================
// 💾 MindCraft Global Lesson Tools (Stable Copy + Exit Version)
// ===============================

// === COPY BUTTON FUNCTIONALITY ===
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".code-block").forEach((block) => {
    if (block.querySelector(".code-btn")) return;

    // Create the Copy button
    const btn = document.createElement("button");
    btn.className = "code-btn";
    btn.textContent = "📋 Copy";

    // Copy text action
    btn.onclick = (e) => {
      e.stopPropagation(); // Prevent event interference with scroll
      const code = block.querySelector("pre").innerText;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = "✅ Copied!";
        setTimeout(() => (btn.textContent = "📋 Copy"), 1500);
      });
    };

    // Ensure code-block is positioned
    if (getComputedStyle(block).position === "static") {
      block.style.position = "relative";
    }

    // Append button directly inside the code block
    block.appendChild(btn);
  });
});

// === COPY BUTTON STYLE (Top-Right Sticky Inside Each Code Box) ===
const copyStyle = document.createElement("style");
copyStyle.textContent = `
  .code-btn {
    all: unset;
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 0.9rem !important;
    color: #fff !important;
    background: #ff69b4 !important;
    border-radius: 8px !important;
    padding: 8px 14px !important;
    cursor: pointer !important;
    font-family: 'Orbitron', sans-serif !important;
    box-shadow: 0 0 12px #ff69b4, 0 0 25px #ff00ff !important;
    transition: all 0.25s ease !important;
    z-index: 20;
  }

  .code-btn:hover {
    background: #ff85c1 !important;
    box-shadow: 0 0 25px #ff85c1, 0 0 45px #ff00ff !important;
    transform: scale(1.05);
  }

  .code-block {
    overflow-x: auto !important;
    position: relative !important;
    padding-top: 45px !important; /* space for button */
  }

  /* Keep touch scroll smooth */
  .code-block pre {
    white-space: pre !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
  }

  @media (max-width: 768px) {
    .code-btn {
      font-size: 0.8rem !important;
      padding: 6px 12px !important;
      top: 8px;
      right: 8px;
    }
  }
`;
document.head.appendChild(copyStyle);


// ===============================
// ❌ EXIT BUTTON FUNCTIONALITY (Protected + Neon Left)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".exit-btn")) return;

  const exitBtn = document.createElement("button");
  exitBtn.className = "exit-btn";
  exitBtn.textContent = "❌ Exit";

  exitBtn.onclick = () => {
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = "../../../Webside/Student.html";
    }, 600);
  };

  document.body.appendChild(exitBtn);
});

// === EXIT BUTTON STYLE (Top-Left + Cyber Glow) ===
const exitStyle = document.createElement("style");
exitStyle.textContent = `
  .exit-btn {
    all: unset;
    position: fixed;
    top: 15px;
    left: 15px;
    font-size: 1rem !important;
    padding: 10px 18px !important;
    border-radius: 8px !important;
    background: #ff1493 !important;
    color: #fff !important;
    cursor: pointer !important;
    font-family: 'Orbitron', sans-serif !important;
    box-shadow: 0 0 12px #ff00ff, 0 0 28px #00ffff !important;
    transition: all 0.25s ease !important;
    z-index: 9999;
  }

  .exit-btn:hover {
    background: #ff66c4 !important;
    box-shadow: 0 0 25px #ff66c4, 0 0 45px #ff00ff;
    transform: scale(1.05);
  }

  @keyframes fadeOutScreen {
    from { opacity: 1; filter: blur(0px); }
    to { opacity: 0; filter: blur(8px); }
  }

  body.fade-out {
    animation: fadeOutScreen 0.6s ease forwards;
  }

  @media (max-width: 768px) {
    .exit-btn {
      font-size: 0.9rem !important;
      padding: 8px 15px !important;
      top: 12px;
      left: 12px;
    }
  }
`;
document.head.appendChild(exitStyle);
