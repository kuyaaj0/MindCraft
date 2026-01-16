// ===============================
// 💾 MindCraft Global Lesson Tools (v2.2)
// ===============================

// === COPY BUTTON FUNCTIONALITY ===
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".code-block").forEach(block => {
    if (block.querySelector(".code-btn")) return; // prevent duplicates

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

// === COPY BUTTON STYLE (Cyberpunk look + smart placement) ===
const copyStyle = document.createElement("style");
copyStyle.textContent = `
  .code-block {
    position: relative;
    overflow-x: auto;
    scroll-padding-right: 70px;
  }

  .code-btn {
    position: absolute;
    top: 5px;
    right: 10px;
    font-size: 0.8rem;
    color: #fff;
    background: #ff69b4;
    border: none;
    border-radius: 6px;
    padding: 6px 14px;
    cursor: pointer;
    font-family: 'Orbitron', sans-serif;
    box-shadow: 0 0 10px #ff69b4, 0 0 20px #ff00ff;
    transition: all 0.25s ease;
    opacity: 0.8;
    z-index: 5;
  }

  /* Slight offset for lessons with ::before (like CODE MATRIX) */
  .code-block::before + .code-btn {
    margin-top: 20px;
  }

  .code-block:hover .code-btn {
    opacity: 1;
    transform: scale(1.05);
  }

  .code-btn:hover {
    background: #ff85c1;
    box-shadow: 0 0 25px #ff85c1, 0 0 40px #ff00ff;
  }

  /* Leave space for the button to not overlap text */
  .code-block pre {
    margin-right: 70px;
  }

  @media (max-width: 768px) {
    .code-btn {
      font-size: 1rem;
      padding: 8px 16px;
      right: 8px;
      top: 10px;
      opacity: 1; /* keep visible for touch devices */
    }
  }
`;
document.head.appendChild(copyStyle);


// ===============================
// ❌ EXIT BUTTON FUNCTIONALITY (Left side + fade-out)
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

// === EXIT BUTTON + FADE STYLE (Adjusted for large headers) ===
const exitStyle = document.createElement("style");
exitStyle.textContent = `
  .exit-btn {
    position: fixed;
    top: 25px; /* slightly lower to clear large headers */
    left: 20px;
    font-size: 1rem;
    padding: 10px 18px;
    border: none;
    border-radius: 6px;
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

  @keyframes fadeOutScreen {
    from { opacity: 1; filter: blur(0px); }
    to { opacity: 0; filter: blur(8px); }
  }
  body.fade-out {
    animation: fadeOutScreen 0.6s ease forwards;
  }

  @media (max-width: 768px) {
    .exit-btn {
      top: 15px;
      left: 15px;
      padding: 8px 14px;
    }
  }
`;
document.head.appendChild(exitStyle);
