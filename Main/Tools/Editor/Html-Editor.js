// Pixel HTML Editor Tool (for MindCraft Lessons)
document.addEventListener("DOMContentLoaded", () => {
  // Check if a challenge section exists
  const challengeSection = document.querySelector("#topic-4 .demo");
  if (!challengeSection) return;

  // Create editor container
  const tool = document.createElement("section");
  tool.className = "html-editor";
  tool.innerHTML = `
    <h2>🧠 Try It Yourself!</h2>
    <textarea class="editor-area" id="htmlCodeArea" placeholder="Type your HTML code here..."></textarea>
    <div class="editor-controls">
      <button id="runCodeBtn">▶ Run Code</button>
      <button id="clearCodeBtn">🗑 Clear</button>
    </div>
    <div class="editor-output">
      <iframe id="outputFrame" title="Code Output"></iframe>
    </div>
  `;

  // Append below the demo section
  challengeSection.insertAdjacentElement("afterend", tool);

  const htmlArea = tool.querySelector("#htmlCodeArea");
  const outputFrame = tool.querySelector("#outputFrame");
  const runBtn = tool.querySelector("#runCodeBtn");
  const clearBtn = tool.querySelector("#clearCodeBtn");

  // Load initial code from example above (if available)
  const codeExample = challengeSection.querySelector("pre");
  if (codeExample) htmlArea.value = codeExample.innerText.trim();

  // Run Code: inject HTML into iframe
  runBtn.addEventListener("click", () => {
    const code = htmlArea.value;
    const iframeDoc = outputFrame.contentDocument || outputFrame.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(code);
    iframeDoc.close();
  });

  // Clear code editor
  clearBtn.addEventListener("click", () => {
    htmlArea.value = "";
    const iframeDoc = outputFrame.contentDocument || outputFrame.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write("<p style='font-family:sans-serif;text-align:center;color:#888;'>Output cleared.</p>");
    iframeDoc.close();
  });
});
