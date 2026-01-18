// ===============================
// 💾 MindCraft Global Lesson Tools (Final Fixed Version)
// ===============================

// === COPY BUTTON FUNCTIONALITY (Fully Sticky on Scroll) ===
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".code-block").forEach((block) => {
    // Prevent duplicates
    if (block.querySelector(".code-btn")) return;

    // Create copy button
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

    // === Wrapper that floats over the scrollable area ===
    const overlay = document.createElement("div");
    overlay.className = "code-btn-overlay";
    overlay.appendChild(btn);

    // Attach overlay to block’s parent (not the block itself)
    block.parentElement.insertBefore(overlay, block.nextSibling);

    // Store reference for layout syncing
    const syncPosition = () => {
      const rect = block.getBoundingClientRect();
      overlay.style.width = `${rect.width}px`;
      overlay.style.left = `${rect.left + window.scrollX}px`;
      overlay.style.top = `${rect.top + window.scrollY + 8}px`;
    };

    syncPosition();
    window.addEventListener("scroll", syncPosition);
    window.addEventListener("resize", syncPosition);
  });
});

// === COPY BUTTON STYLE (Always Visible + Neon Glow) ===
const copyStyle = document.createElement("style");
copyStyle.textContent = `
  /* Overlay wrapper (keeps button outside the scroll zone) */
  .code-btn-overlay {
    position: absolute;
    pointer-events: none;
    z-index: 999;
  }

  /* Copy Button */
  .code-btn {
    all: unset;
    pointer-events: auto;
    float: right;
    margin-right: 15px;
    font-size: 0.9rem !important;
    color: #fff !important;
    background: #ff69b4 !important;
    border-radius: 8px !important;
    padding: 8px 14px !important;
    cursor: pointer !important;
    font-family: 'Orbitron', sans-serif !important;
    box-shadow: 0 0 12px #ff69b4, 0 0 25px #ff00ff !important;
    transition: all 0.25s ease !important;
  }

  .code-btn:hover {
    background: #ff85c1 !important;
    box-shadow: 0 0 25px #ff85c1, 0 0 45px #ff00ff !important;
    transform: scale(1.05);
  }

  /* Add top padding so button doesn't overlap label */
  .code-block {
    padding-top: 45px !important;
    position: relative;
  }

  @media (max-width: 768px) {
    .code-btn {
      font-size: 0.8rem !important;
      padding: 6px 12px !important;
      margin-right: 10px;
    }
  }
`;
document.head.appendChild(copyStyle);


// ===============================
// ❌ EXIT BUTTON FUNCTIONALITY (Protected + Neon)
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

// === EXIT BUTTON STYLE ===
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
