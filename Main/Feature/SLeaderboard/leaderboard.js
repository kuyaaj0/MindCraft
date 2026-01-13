// ===============================================
// 🏆 MindCraft Live Leaderboard System (Top 3 Glow + Live Updates)
// ===============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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
// 🧩 Create Leaderboard Popup Dynamically
// ===============================================
function createLeaderboardPopup(currentUID) {
  if (document.getElementById("leaderboardOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "leaderboardOverlay";
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.85);
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    color: #fff; font-family: 'Press Start 2P', cursive;
    z-index: 1000; padding: 20px; overflow-y: auto;
  `;

  const container = document.createElement("div");
  container.style.cssText = `
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
  title.style.cssText = `
    color: #1DB954;
    margin-bottom: 15px;
    font-size: clamp(0.9rem, 3vw, 1.1rem);
    text-shadow: 0 0 6px #1DB95455;
  `;

  const table = document.createElement("table");
  table.style.cssText = `
    width: 100%;
    border-collapse: collapse;
    color: #1DB954;
    font-size: clamp(0.5rem, 1.8vw, 0.7rem);
  `;
  table.innerHTML = `
    <thead>
      <tr style="color:#1DB954; border-bottom:1px solid #1DB954">
        <th style="padding:8px;">Rank</th>
        <th style="padding:8px;">Username</th>
        <th style="padding:8px;">Level</th>
        <th style="padding:8px;">XP</th>
      </tr>
    </thead>
    <tbody id="leaderboardBody">
      <tr><td colspan="4" style="padding:10px;">Loading...</td></tr>
    </tbody>
  `;

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "❌ Close";
  closeBtn.style.cssText = `
    margin-top:20px;
    background: #ff4d4d;
    border:none;
    border-radius:8px;
    color:white;
    padding:8px 16px;
    font-family: 'Press Start 2P', cursive;
    cursor:pointer;
    font-size:clamp(0.5rem,2vw,0.7rem);
    transition: transform 0.3s;
  `;
  closeBtn.onmouseenter = () => closeBtn.style.transform = "scale(1.05)";
  closeBtn.onmouseleave = () => closeBtn.style.transform = "scale(1)";
  closeBtn.onclick = () => overlay.remove();

  container.appendChild(title);
  container.appendChild(table);
  container.appendChild(closeBtn);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  // Start live leaderboard
  liveLeaderboard(currentUID);
}

// ===============================================
// 📊 Live Leaderboard (Firestore onSnapshot)
// ===============================================
function liveLeaderboard(currentUID) {
  const leaderboardRef = collection(db, "users");

  // Listen live, order by level then XP descending
  const q = query(leaderboardRef, orderBy("level", "desc"), orderBy("xp", "desc"));

  onSnapshot(q, (snapshot) => {
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

    const body = document.getElementById("leaderboardBody");
    if (!body) return;

    body.innerHTML = users.slice(0, 100).map((u, i) => {
      const rank = i + 1;
      let glow = "";

      if (rank === 1) glow = "0 0 12px rgba(255,215,0,0.5)";
      else if (rank === 2) glow = "0 0 10px rgba(192,192,192,0.35)";
      else if (rank === 3) glow = "0 0 10px rgba(205,127,50,0.25)";

      const isCurrentUser = u.uid === currentUID;
      const pulseClass = isCurrentUser ? "rank-top" : "";

      return `
        <tr class="${pulseClass}" style="background:rgba(255,255,255,0.02); box-shadow:${glow}; transition:0.3s;">
          <td style="padding:6px;">#${rank}</td>
          <td style="padding:6px;">${u.name}</td>
          <td style="padding:6px;">${u.level}</td>
          <td style="padding:6px;">${u.xp}</td>
        </tr>
      `;
    }).join("");

    // Pulsing glow for top users
    if (!document.getElementById("glowAnimation")) {
      const style = document.createElement("style");
      style.id = "glowAnimation";
      style.textContent = `
        .rank-top { animation: glowPulse 1.7s infinite alternate; }
        @keyframes glowPulse {
          0% { box-shadow: 0 0 5px #fff; }
          50% { box-shadow: 0 0 12px #fff; }
          100% { box-shadow: 0 0 5px #fff; }
        }
      `;
      document.head.appendChild(style);
    }
  }, (err) => {
    console.error("⚠️ Live leaderboard error:", err);
  });
}

// ===============================================
// 🚀 Leaderboard Button Trigger
// ===============================================
onAuthStateChanged(auth, (user) => {
  const btn = document.getElementById("leaderboardBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      createLeaderboardPopup(user ? user.uid : null);
    });
  }
});
