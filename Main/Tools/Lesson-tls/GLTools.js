// ===============================
// 💾 MindCraft Global Lesson Tools
// ===============================

// === COPY BUTTON FUNCTIONALITY ===
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".code-block").forEach((block) => {
    if (block.querySelector(".code-btn")) return; // Prevent duplicates

    const btn = document.createElement("button");
    btn.className = "code-btn";
    btn.textContent = "📋 Copy";

    // Copy to clipboard logic
    btn.onclick = () => {
      const code = block.querySelector("pre").innerText;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = "✅ Copied!";
        setTimeout(() => (btn.textContent = "📋 Copy"), 1500);
      });
    };

    // Ensure the parent block allows sticky positioning
    block.style.position = "relative";
    block.appendChild(btn);
  });
});

// ===============================
// 💾 MindCraft Global Lesson Tools (Protected Buttons)
// ===============================

// === COPY BUTTON FUNCTIONALITY (Enhanced Sticky Version) ===
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".code-block").forEach((block) => {
    if (block.querySelector(".code-btn")) return;

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

    // Make sure the parent container supports positioning
    block.style.position = "relative";
    block.appendChild(btn);
  });
});

// === COPY BUTTON STYLE (Sticky + Protected + Large for Lessons 16–20) ===
const copyStyle = document.createElement("style");
copyStyle.textContent = `
  /* --- Copy Button Styling --- */
  .code-btn {
    all: unset; /* reset any global CSS conflicts */
    position: sticky;
    top: 10px;
    float: right;
    right: 10px;
    font-size: 0.9rem !important; /* slightly larger for lesson 16–20 */
    color: #fff !important;
    background: #ff69b4 !important;
    border-radius: 8px !important;
    padding: 8px 14px !important;
    cursor: pointer !important;
    font-family: 'Orbitron', sans-serif !important;
    box-shadow: 0 0 10px #ff69b4, 0 0 25px #ff00ff !important;
    transition: all 0.25s ease !important;
    z-index: 20;
  }

  .code-btn:hover {
    background: #ff85c1 !important;
    box-shadow: 0 0 25px #ff85c1, 0 0 45px #ff00ff !important;
    transform: scale(1.05);
  }

  .code-block {
    position: relative;
    overflow-x: auto;
    padding-top: 40px; /* extra top space for the big copy button */
  }

  /* --- Mobile view adjustments --- */
  @media (max-width: 768px) {
    .code-btn {
      position: sticky;
      top: 8px;
      right: 8px;
      font-size: 0.8rem !important;
      padding: 6px 12px !important;
    }
  }
`;
document.head.appendChild(copyStyle);


// ===============================
// ❌ EXIT BUTTON FUNCTIONALITY (Protected)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".exit-btn")) return;

  const exitBtn = document.createElement("button");
  exitBtn.className = "exit-btn";
  exitBtn.textContent = "❌ Exit";

  // Fade-out animation then redirect
  exitBtn.onclick = () => {
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = "../../../Webside/Student.html";
    }, 600);
  };

  document.body.appendChild(exitBtn);
});

// === EXIT BUTTON STYLE (Left side + Large Cyber Look) ===
const exitStyle = document.createElement("style");
exitStyle.textContent = `
  .exit-btn {
    all: unset;
    position: fixed;
    top: 15px;
    left: 15px;
    font-size: 1rem !important; /* large button for consistency */
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
