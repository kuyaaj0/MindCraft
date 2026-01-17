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

    // Sticky positioning inside scroll container
    btn.onclick = () => {
      const code = block.querySelector("pre").innerText;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = "✅ Copied!";
        setTimeout(() => (btn.textContent = "📋 Copy"), 1500);
      });
    };

    // make sure parent is positioned for absolute child
    block.style.position = "relative";
    block.appendChild(btn);
  });
});

// === COPY BUTTON STYLE (Stays on Top-Right Even During Scroll) ===
const copyStyle = document.createElement("style");
copyStyle.textContent = `
  .code-btn {
    position: sticky;
    top: 8px;
    float: right;
    right: 8px;
    font-size: 0.8rem;
    color: #fff;
    background: #ff69b4;
    border: none;
    border-radius: 6px;
    padding: 6px 12px;
    cursor: pointer;
    font-family: 'Orbitron', sans-serif;
    box-shadow: 0 0 10px #ff69b4, 0 0 20px #ff00ff;
    transition: all 0.2s ease;
    z-index: 20;
  }

  .code-btn:hover {
    background: #ff85c1;
    box-shadow: 0 0 20px #ff85c1, 0 0 40px #ff00ff;
    transform: scale(1.05);
  }

  /* make sure pre/code boxes scroll smoothly */
  .code-block {
    position: relative;
    overflow-x: auto;
    padding-top: 35px;
  }

  /* mobile: prevent button cutoff */
  @media (max-width: 768px) {
    .code-btn {
      position: sticky;
      top: 6px;
      right: 6px;
      font-size: 0.75rem;
      padding: 5px 10px;
    }
  }
`;
document.head.appendChild(copyStyle);


// ===============================
// ❌ EXIT BUTTON FUNCTIONALITY
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".exit-btn")) return;

  const exitBtn = document.createElement("button");
  exitBtn.className = "exit-btn";
  exitBtn.textContent = "❌ Exit";

  // Fade out animation + redirect
  exitBtn.onclick = () => {
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = "../../../Webside/Student.html";
    }, 600);
  };

  document.body.appendChild(exitBtn);
});

// === EXIT BUTTON STYLE (Left side) ===
const exitStyle = document.createElement("style");
exitStyle.textContent = `
  .exit-btn {
    position: fixed;
    top: 15px;
    left: 15px;
    font-size: 0.9rem;
    padding: 6px 14px;
    border: none;
    border-radius: 6px;
    background: #ff1493;
    color: #fff;
    cursor: pointer;
    font-family: 'Orbitron', sans-serif;
    box-shadow: 0 0 10px #ff00ff, 0 0 25px #00ffff;
    transition: all 0.25s ease;
    z-index: 9999;
  }

  .exit-btn:hover {
    background: #ff66c4;
    box-shadow: 0 0 20px #ff66c4, 0 0 40px #ff00ff;
    transform: scale(1.05);
  }

  @keyframes fadeOutScreen {
    from { opacity: 1; filter: blur(0px); }
    to { opacity: 0; filter: blur(8px); }
  }

  body.fade-out {
    animation: fadeOutScreen 0.6s ease forwards;
  }
`;
document.head.appendChild(exitStyle);
