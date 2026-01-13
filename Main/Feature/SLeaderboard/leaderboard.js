// ===============================================
// 🏆 MindCraft Leaderboard System (Responsive + Top 3 Glow)
// Path: Main/Feature/SLeaderboard/leaderboard.js
// ===============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAQBwwuXwh82MCRyJ_7CBk2aWUp-n6p4DQ",
  authDomain: "mindcraft-83f81.firebaseapp.com",
  projectId: "mindcraft-83f81",
  storageBucket: "mindcraft-83f81.firebasestorage.app",
  messagingSenderId: "483019456762",
  appId: "1:483019456762:web:fdc05a2dda51c0f39a8943"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===============================================
// 🧩 Create Popup Dynamically (with Responsive Style)
// ===============================================
function createLeaderboardPopup(currentUID) {
  if (document.getElementById("leaderboardOverlay")) return; // prevent duplicates

  const overlay = document.createElement("div");
  overlay.id = "leaderboardOverlay";
  overlay.style = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.85);
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    color: #fff; font-family: 'Press Start 2P', cursive;
    z-index: 1000; padding: 20px; overflow-y: auto;
    animation: fadeIn 0.3s ease;
  `;

  const container = document.createElement("div");
  container.style = `
    background: rgba(25,25,25,0.9);
    border: 2px solid #1DB954;
    border-radius: 12px;
    padding: 20px;
    width: 95%;
    max-width: 650px;
    box-shadow: 0 0 12px #1DB95433;
    text-align: center;
  `;

  const title = document.createElement("h2");
  title.textContent = "🏆 MindCraft Leaderboard";
  title.style = `
    color: #1DB954;
    margin-bottom: 15px;
    font-size: clamp(0.9rem, 3vw, 1.1rem);
    text-shadow: 0 0 6px #1DB95455;
  `;

  const table = document.createElement("table");
  table.style = `
    width: 100%;
    border-collapse: collapse;
    color: #1DB954;
    font-size: clamp(0.5rem, 1.8vw, 0.7rem);
  `;
  table.innerHTML = `
    <thead>
      <tr style="color: #1DB954; border-bottom: 1px solid #1DB954;">
        <th style="padding: 8px;">Rank</th>
        <th style="padding: 8px;">Username</th>
        <th style="padding: 8px;">Level</th>
        <th style="padding: 8px;">XP</th>
      </tr>
    </thead>
    <tbody id="leaderboardBody">
      <tr><td colspan="4" style="padding: 10px;">Loading...</td></tr>
    </tbody>
  `;

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "❌ Close";
  closeBtn.style = `
    margin-top: 20px;
    background: #ff4d4d;
    border: none;
    border-radius: 8px;
    color: white;
    padding: 8px 16px;
    font-family: 'Press Start 2P', cursive;
    cursor: pointer;
    font-size: clamp(0.5rem, 2vw, 0.7rem);
    transition: transform 0.3s;
  `;
  closeBtn.onmouseenter = () => (closeBtn.style.transform = "scale(1.05)");
  closeBtn.onmouseleave = () => (closeBtn.style.transform = "scale(1)");
  closeBtn.onclick = () => overlay.remove();

  container.appendChild(title);
  container.appendChild(table);
  container.appendChild(closeBtn);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  loadLeaderboard(currentUID);
}

// ===============================================
// 📊 Load Data from Firestore + Add Top 3 Glow
// ===============================================
async function loadLeaderboard(currentUID) {
  const body = document.getElementById("leaderboardBody");
  if (!body) return;

  try {
    const snapshot = await getDocs(collection(db, "users"));
    const users = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        name: data.name || data.username || "Unknown",
        level: data.level || 1,
        xp: data.xp || 0
      });
    });

    // Sort by Level → XP
    users.sort((a, b) => (b.level - a.level) || (b.xp - a.xp));

    // Render rows
    body.innerHTML = users.map((u, i) => {
      const rank = i + 1;
      let glowColor = "none";

      // ✨ Soft Glow for Top 3
      if (rank === 1) glowColor = "0 0 12px rgba(255,215,0,0.35)";       // gold
      else if (rank === 2) glowColor = "0 0 10px rgba(192,192,192,0.3)"; // silver
      else if (rank === 3) glowColor = "0 0 10px rgba(205,127,50,0.25)"; // bronze

      const rowStyle = `
        background: rgba(255,255,255,0.02);
        box-shadow: ${glowColor};
        transition: background 0.3s, box-shadow 0.3s;
      `;

      const hoverStyle = `
        onmouseenter="this.style.background='rgba(255,255,255,0.06)'"
        onmouseleave="this.style.background='rgba(255,255,255,0.02)'"
      `;

      return `
        <tr style="${rowStyle}" ${hoverStyle}>
          <td style="padding: 6px;">#${rank}</td>
          <td style="padding: 6px;">${u.name}</td>
          <td style="padding: 6px;">${u.level}</td>
          <td style="padding: 6px;">${u.xp}</td>
        </tr>
      `;
    }).join("");

  } catch (err) {
    console.error("⚠️ Failed to load leaderboard:", err);
    body.innerHTML = `<tr><td colspan="4" style="padding: 10px;">⚠️ Error loading data</td></tr>`;
  }
}

// ===============================================
// 🚀 Button Trigger
// ===============================================
onAuthStateChanged(auth, (user) => {
  const btn = document.getElementById("leaderboardBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      createLeaderboardPopup(user ? user.uid : null);
    });
  }
});
