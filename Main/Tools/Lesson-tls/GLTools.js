// globalLessonTools.js
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".code-block").forEach((block) => {
    // === Copy Button ===
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "📋 COPY";
    copyBtn.className = "copy-btn";
    styleButton(copyBtn, "#ff00ff", "#ff66ff");
    copyBtn.addEventListener("click", () => {
      const code = block.querySelector("pre").innerText;
      navigator.clipboard.writeText(code);
      copyBtn.textContent = "✅ COPIED!";
      setTimeout(() => (copyBtn.textContent = "📋 COPY"), 1500);
    });
    block.appendChild(copyBtn);

    // === Run Button (for HTML/JS examples) ===
    const codeText = block.querySelector("pre").innerText;
    if (codeText.includes("<") && !block.classList.contains("no-run")) {
      const runBtn = document.createElement("button");
      runBtn.textContent = "▶️ RUN";
      runBtn.className = "run-btn";
      styleButton(runBtn, "#00ffff", "#66ffff");
      runBtn.style.right = "100px";
      runBtn.addEventListener("click", () => {
        const output = window.open("", "_blank", "width=700,height=500");
        output.document.write(codeText);
      });
      block.appendChild(runBtn);
    }
  });

  // === Neon button styling helper ===
  function styleButton(btn, glowColor, hoverColor) {
    btn.style.position = "absolute";
    btn.style.top = "10px";
    btn.style.right = "10px";
    btn.style.padding = "6px 14px";
    btn.style.border = "2px solid " + glowColor;
    btn.style.borderRadius = "10px";
    btn.style.background = "rgba(10,10,30,0.85)";
    btn.style.color = glowColor;
    btn.style.fontFamily = "'Orbitron', monospace";
    btn.style.fontSize = "0.75rem";
    btn.style.cursor = "pointer";
    btn.style.boxShadow = `0 0 10px ${glowColor}, inset 0 0 8px ${glowColor}44`;
    btn.style.transition = "all 0.25s ease";
    btn.addEventListener("mouseenter", () => {
      btn.style.background = hoverColor;
      btn.style.color = "#000";
      btn.style.boxShadow = `0 0 20px ${hoverColor}, 0 0 40px ${hoverColor}`;
      btn.style.transform = "scale(1.05)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.background = "rgba(10,10,30,0.85)";
      btn.style.color = glowColor;
      btn.style.boxShadow = `0 0 10px ${glowColor}, inset 0 0 8px ${glowColor}44`;
      btn.style.transform = "scale(1)";
    });
  }
});
