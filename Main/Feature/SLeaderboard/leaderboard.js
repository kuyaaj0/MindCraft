// ===============================================
// 🏆 MindCraft Live Leaderboard System
// (with Smart Cleanup + Keep Newest Account)
// ===============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===============================================
// 🧹 Smart Cleanup Function (Keeps the Newest Account)
// ===============================================
async function cleanupGhostUsers() {
  const snap = await getDocs(collection(db, "users"));
  const usersByEmail = new Map();

  // Step 1: Group by email, and choose the newest doc
  for (const userDoc of snap.docs) {
    const data = userDoc.data();
    const email = data.email || "";
    const name = data.name || "";
    const createdAt = data.createdAt ? new Date(data.createdAt) : new Date(0);

    // Skip clearly invalid data
    if (!email.includes("@") || !name) continue;

    // If email already seen, compare which is newer
    if (usersByEmail.has(email)) {
      const existing = usersByEmail.get(email);
      if (createdAt > existing.createdAt) {
        // Replace with the newer one
        usersByEmail.set(email, { id: userDoc.id, createdAt });
      }
    } else {
      usersByEmail.set(email, { id: userDoc.id, createdAt });
    }
  }

  // Step 2: Delete invalid or duplicate ones (keep newest)
  const deletions = [];
  for (const userDoc of snap.docs) {
    const data = userDoc.data();
    const email = data.email || "";
    const name = data.name || "";
    const isValid = email.includes("@") && name;

    if (!isValid) {
      console.log("🧹 Removing ghost user:", userDoc.id, email);
      deletions.push(deleteDoc(doc(db, "users", userDoc.id)));
      continue;
    }

    // If this doc is not the newest by email, delete it
    const keepInfo = usersByEmail.get(email);
    if (keepInfo && userDoc.id !== keepInfo.id) {
      console.log("🧹 Removing duplicate (older):", userDoc.id, email);
      deletions.push(deleteDoc(doc(db, "users", userDoc.id)));
    }
  }

  if (deletions.length > 0) {
    await Promise.all(deletions);
    console.log(`✅ Cleanup complete — removed ${deletions.length} old/ghost entries.`);
  } else {
    console.log("✅ No ghost or duplicate users found.");
  }
}

// ===============================================
// 🧩 Create Leaderboard Popup
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
    z-index: 1000; padding: 20px;
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
    max-height: 85vh;
    display: flex;
    flex-direction: column;
  `;

  const title = document.createElement("h2");
  title.textContent = "MindCraft Leaderboard";
  title.style.cssText = `
    color: #1DB954;
    margin-bottom: 15px;
    font-size: clamp(0.9rem, 3vw, 1.1rem);
    text-shadow: 0 0 6px #1DB95455;
  `;

  const scrollArea = document.createElement("div");
  scrollArea.style.cssText = `
    overflow-y: auto;
    max-height: 60vh;
    width: 100%;
    border-top: 1px solid #1DB95455;
    border-bottom: 1px solid #1DB95455;
    scrollbar-width: thin;
    scrollbar-color: #1DB954 #111;
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
      <tr><td colspan="4" style="padding:10px;">⏳ Loading leaderboard...</td></tr>
    </tbody>
  `;

  scrollArea.appendChild(table);

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
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
  closeBtn.onmouseenter = () => (closeBtn.style.transform = "scale(1.05)");
  closeBtn.onmouseleave = () => (closeBtn.style.transform = "scale(1)");
  closeBtn.onclick = () => overlay.remove();

  container.appendChild(title);
  container.appendChild(scrollArea);
  container.appendChild(closeBtn);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  liveLeaderboard(currentUID);
}

// ===============================================
// 📊 Live Leaderboard (Real-Time Updates)
// ===============================================
function liveLeaderboard(currentUID) {
  const leaderboardRef = collection(db, "users");
  const q = query(leaderboardRef, orderBy("level", "desc"), orderBy("xp", "desc"));
  const body = document.getElementById("leaderboardBody");

  onSnapshot(
    q,
    (snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.name || !data.email) return; // Skip ghosts
        users.push({
          uid: doc.id,
          name: data.name,
          level: data.level ?? 1,
          xp: data.xp ?? 0
        });
      });

      if (users.length === 0) {
        body.innerHTML = `<tr><td colspan="4" style="padding:10px;">No users found yet.</td></tr>`;
        return;
      }

      const rows = users.slice(0, 100).map((u, i) => {
        const rank = i + 1;
        const isCurrentUser = u.uid === currentUID;
        let glow = "";
        if (rank === 1) glow = "0 0 12px rgba(255,215,0,0.5)";
        else if (rank === 2) glow = "0 0 10px rgba(192,192,192,0.35)";
        else if (rank === 3) glow = "0 0 10px rgba(205,127,50,0.25)";

        return `
          <tr style="background:rgba(255,255,255,0.02); box-shadow:${glow}; ${
          isCurrentUser ? "animation: glowPulse 1.7s infinite alternate;" : ""
        }">
            <td style="padding:6px;">#${rank}</td>
            <td style="padding:6px;">${u.name}</td>
            <td style="padding:6px;">${u.level}</td>
            <td style="padding:6px;">${u.xp}</td>
          </tr>
        `;
      }).join("");

      body.innerHTML = rows;

      if (!document.getElementById("glowAnimation")) {
        const style = document.createElement("style");
        style.id = "glowAnimation";
        style.textContent = `
          @keyframes glowPulse {
            0% { box-shadow: 0 0 5px #fff; }
            50% { box-shadow: 0 0 12px #fff; }
            100% { box-shadow: 0 0 5px #fff; }
          }
        `;
        document.head.appendChild(style);
      }
    },
    (err) => {
      console.error("⚠️ Live leaderboard error:", err);
      body.innerHTML = `<tr><td colspan="4" style="padding:10px;">Error loading leaderboard.</td></tr>`;
    }
  );
}

// ===============================================
// 🚀 Trigger Leaderboard Button
// ===============================================
onAuthStateChanged(auth, (user) => {
  const btn = document.getElementById("leaderboardBtn");
  if (btn) {
    btn.addEventListener("click", async () => {
      await cleanupGhostUsers(); // 🧹 Smart cleanup first
      createLeaderboardPopup(user ? user.uid : null);
    });
  }
});
