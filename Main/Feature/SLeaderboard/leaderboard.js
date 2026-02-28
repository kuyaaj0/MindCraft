// ===============================================
// 🏆 MindCraft Live Leaderboard System (Fixed & Optimized)
// ===============================================
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
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

// ✅ Firebase Configs
const firebaseConfig = {
  apiKey: "AIzaSyAQBwwuXwh82MCRyJ_7CBk2aWUp-n6p4DQ",
  authDomain: "mindcraft-83f81.firebaseapp.com",
  projectId: "mindcraft-83f81",
  storageBucket: "mindcraft-83f81.firebasestorage.app",
  messagingSenderId: "483019456762",
  appId: "1:483019456762:web:fdc05a2dda51c0f39a8943"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===============================================
// 🧹 Smart Cleanup — delete only broken/invalid accounts
// ===============================================
async function cleanupGhostUsers() {
  const snap = await getDocs(collection(db, "users"));
  const deletions = [];
  const byEmail = new Map();

  for (const userDoc of snap.docs) {
    const data = userDoc.data();
    const email = (data.email || "").trim().toLowerCase();
    const name = (data.name || "").trim();
    const isValid = email.includes("@") && name;

    // ❌ Only delete if name or email invalid — skip valid duplicates
    if (!isValid) {
      deletions.push(deleteDoc(doc(db, "users", userDoc.id)));
      continue;
    }

    const candidate = {
      uid: userDoc.id,
      email,
      level: Number(data.level || 0),
      xp: Number(data.xp || 0),
      createdAtMs: getTimeValue(data.createdAt)
    };

    const existing = byEmail.get(email);
    if (!existing) {
      byEmail.set(email, candidate);
      continue;
    }

    const keep = pickPreferredUser(existing, candidate);
    const remove = keep.uid === existing.uid ? candidate : existing;
    byEmail.set(email, keep);
    deletions.push(deleteDoc(doc(db, "users", remove.uid)));
  }

  if (deletions.length > 0) await Promise.all(deletions);
}

function getTimeValue(v) {
  if (!v) return 0;
  if (typeof v.toMillis === "function") return v.toMillis();

// Firestore Timestamp-like plain object
  if (typeof v === "object" && Number.isFinite(v.seconds)) {
    const nanos = Number.isFinite(v.nanoseconds) ? v.nanoseconds : 0;
    return (v.seconds * 1000) + Math.floor(nanos / 1_000_000);
  }

  // Numeric timestamps (seconds or milliseconds)
  if (typeof v === "number" && Number.isFinite(v)) {
    return v < 1e12 ? v * 1000 : v;
  }
  
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

function pickPreferredUser(a, b, currentUID = null) {
  if (currentUID && a.uid === currentUID) return a;
  if (currentUID && b.uid === currentUID) return b;

  const scoreA = (Number(a.level || 0) * 1_000_000) + Number(a.xp || 0);
  const scoreB = (Number(b.level || 0) * 1_000_000) + Number(b.xp || 0);
  if (scoreA !== scoreB) return scoreA > scoreB ? a : b;

  return (a.createdAtMs || 0) >= (b.createdAtMs || 0) ? a : b;
}

function dedupeUsersByEmail(users, currentUID = null) {
  const byEmail = new Map();
  for (const u of users) {
    const key = (u.email || "").trim().toLowerCase();
    if (!key) continue;
    if (!byEmail.has(key)) {
      byEmail.set(key, u);
      continue;
    }
    byEmail.set(key, pickPreferredUser(byEmail.get(key), u, currentUID));
  }
  return Array.from(byEmail.values());
}

function isUserActive(user, now = Date.now()) {
  //const lastSeen = Number(user.lastSeenMs || 0);
  const activeWindowMs = 5 * 60 * 1000; // 5 minutes
  const lastPresenceMs = Math.max(
    Number(user.lastSeenMs || 0),
    Number(user.lastLoginMs || 0),
    Number(user.timestampMs || 0)
  );

  // Primary rule: recent heartbeat/login means active.
  if (lastPresenceMs > 0 && now - lastPresenceMs <= activeWindowMs) return true;

  // Prevent stale `isActive: true` flags from showing users as active forever.
  return false;
}

function formatInactiveDuration(lastSeenMs, now = Date.now()) {
  if (!lastSeenMs) return "No activity data";

  const diff = now - Number(lastSeenMs);
  if (diff < 0) return "Just now";

  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const week = Math.floor(day / 7);
  const month = Math.floor(day / 30);
  const year = Math.floor(day / 365);

  if (sec < 60) return `${sec} second${sec !== 1 ? "s" : ""} ago`;
  if (min < 60) return `${min} minute${min !== 1 ? "s" : ""} ago`;
  if (hr < 24) return `${hr} hour${hr !== 1 ? "s" : ""} ago`;
  if (day < 7) return `${day} day${day !== 1 ? "s" : ""} ago`;
  if (week < 5) return `${week} week${week !== 1 ? "s" : ""} ago`;
  if (month < 12) return `${month} month${month !== 1 ? "s" : ""} ago`;
  return `${year} year${year !== 1 ? "s" : ""} ago`;
}

function getThemePalette() {
  const isDark = document.body.classList.contains("theme-dark") || localStorage.getItem("theme") === "dark";
  if (isDark) {
    return {
      overlay: "rgba(10,14,24,0.82)",
      containerBg: "rgba(20, 28, 45, 0.95)",
      border: "#5a79b8",
      text: "#f7ead7",
      row: "rgba(255,255,255,0.03)",
      headerBorder: "rgba(151,180,230,0.45)",
      closeBg: "#c04a4a",
      closeText: "#fff"
    };
  }
  return {
    overlay: "rgba(35,24,14,0.58)",
    containerBg: "linear-gradient(135deg,#f6e7d3,#eed4b5)",
    border: "#a97c4b",
    text: "#5a3a1a",
    row: "rgba(255,255,255,0.45)",
    headerBorder: "rgba(169,124,75,0.55)",
    closeBg: "#b8783d",
    closeText: "#fff"
  };
}

// ===============================================
// 🧩 Create Leaderboard Popup
// ===============================================
function createLeaderboardPopup(currentUID) {
  if (document.getElementById("leaderboardOverlay")) return;

  const palette = getThemePalette();

  const overlay = document.createElement("div");
  overlay.id = "leaderboardOverlay";
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: ${palette.overlay};
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    color: ${palette.text}; font-family: 'Press Start 2P', cursive;
    z-index: 1000; padding: 10px;
    opacity: 0; transition: opacity 0.4s ease;
  `;

  const container = document.createElement("div");
  container.style.cssText = `
    background: ${palette.containerBg};
    border: 2px solid ${palette.border};
    border-radius: 12px;
    padding: 18px;
    width: 95%;
    max-width: 650px;
    box-shadow: 0 10px 24px rgba(0,0,0,0.28);
    text-align: center;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
  `;

  const title = document.createElement("h2");
  title.textContent = "MindCraft Leaderboard";
  title.style.cssText = `
    color: ${palette.text};
    margin-bottom: 15px;
    font-size: clamp(0.9rem, 3vw, 1.1rem);
    text-shadow: none;
  `;

  const scrollArea = document.createElement("div");
  scrollArea.style.cssText = `
    overflow-y: auto;
    max-height: 60vh;
    width: 100%;
    border-top: 1px solid ${palette.text};
    border-bottom: 1px solid ${palette.text};
    scrollbar-width: thin;
    scrollbar-color: ${palette.border} rgba(0,0,0,0.2);
  `;

  const table = document.createElement("table");
  table.style.cssText = `
    width: 100%;
    border-collapse: collapse;
    color: ${palette.text};
    font-size: clamp(0.45rem, 1.8vw, 0.7rem);
  `;
  table.innerHTML = `
    <thead>
      <tr style="color:${palette.text}; border-bottom:1px solid ${palette.headerBorder}">
        <th style="padding:6px;">Rank</th>
        <th style="padding:6px;">Username</th>
        <th style="padding:6px;">Level</th>
        <th style="padding:6px;">XP</th>
        <th style="padding:6px;">Status</th>
        <th style="padding:6px;">Inactive</th>
      </tr>
    </thead>
    <tbody id="leaderboardBody">
      <tr><td colspan="6" style="padding:10px;">⏳ Loading leaderboard...</td></tr>
    </tbody>
  `;

  scrollArea.appendChild(table);

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.style.cssText = `
    margin-top: 14px;
    background: ${palette.closeBg};
    border: none;
    border-radius: 10px;
    color: ${palette.closeText};
    padding: 10px 20px;
    font-family: 'Press Start 2P', cursive;
    cursor: pointer;
    font-size: clamp(0.6rem, 2.5vw, 0.8rem);
    transition: transform 0.3s;
  `;
  closeBtn.onmouseenter = () => (closeBtn.style.transform = "scale(1.05)");
  closeBtn.onmouseleave = () => (closeBtn.style.transform = "scale(1)");
  closeBtn.onclick = () => {
    overlay.style.opacity = 0;
    setTimeout(() => overlay.remove(), 300);
  };

  container.appendChild(title);
  container.appendChild(scrollArea);
  container.appendChild(closeBtn);
  overlay.appendChild(container);
  document.body.appendChild(overlay);
  setTimeout(() => (overlay.style.opacity = 1), 10);

  // Responsive tweaks
  if (!document.getElementById("leaderboardResponsive")) {
    const style = document.createElement("style");
    style.id = "leaderboardResponsive";
    style.textContent = `
      @media (max-width: 400px) {
        #leaderboardOverlay h2 { font-size: 0.8rem !important; }
        #leaderboardOverlay table { font-size: 0.45rem !important; }
        #leaderboardOverlay button { padding: 8px 14px !important; font-size: 0.6rem !important; }
      }
      @media (min-width: 401px) and (max-width: 600px) {
        #leaderboardOverlay h2 { font-size: 0.9rem !important; }
        #leaderboardOverlay table { font-size: 0.55rem !important; }
        #leaderboardOverlay button { padding: 9px 16px !important; font-size: 0.7rem !important; }
      }
    `;
    document.head.appendChild(style);
  }

  // Start live updates
  liveLeaderboard(currentUID);
}

// ===============================================
// 📊 Live Leaderboard (Fixed)
// ===============================================
function liveLeaderboard(currentUID) {
  const palette = getThemePalette();
  const leaderboardRef = collection(db, "users");
  const q = query(leaderboardRef, orderBy("level", "desc"), orderBy("xp", "desc"));

  // Use onSnapshot to keep live updates:
  onSnapshot(
    q,
    (snapshot) => {
      try {
        const now = Date.now(); // <- FIX: define now
        const users = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          users.push({
            uid: docSnap.id,
            email: (data.email || `uid:${docSnap.id}`).trim().toLowerCase(),
            name: data.name || data.username || data.displayName || "Unknown",
            level: Number(data.level ?? 1),
            xp: Number(data.xp ?? 0),
            isActive: Boolean(data.isActive),
            lastSeenMs: getTimeValue(data.lastSeen),
            lastLoginMs: getTimeValue(data.lastLogin),
            timestampMs: getTimeValue(data.timestamp),
            createdAtMs: getTimeValue(data.createdAt)
          });
        });

        const cleanedUsers = dedupeUsersByEmail(users, currentUID);

        // Ensure the DOM element exists (popup may be closed/recreated)
        const body = document.getElementById("leaderboardBody");
        if (!body) return;

        if (cleanedUsers.length === 0) {
          body.innerHTML = `<tr><td colspan="7" style="padding:10px;">No users found yet.</td></tr>`;
          return;
        }

        const rows = cleanedUsers
          .slice(0, 100)
          .map((u, i) => {
            const rank = i + 1;
            const isCurrentUser = u.uid === currentUID;
            const active = isUserActive(u, now);
            const statusText = active ? "Active" : "Inactive";
            const inactiveText = active
              ? "0 hrs"
              : formatInactiveDuration(u.lastSeenMs || u.timestampMs || u.lastLoginMs, now);
            let glow = "";
            if (rank === 1) glow = "0 0 12px rgba(255,215,0,0.5)";
            else if (rank === 2) glow = "0 0 10px rgba(192,192,192,0.35)";
            else if (rank === 3) glow = "0 0 10px rgba(205,127,50,0.25)";

            return `
              <tr style="background:${palette.row}; box-shadow:${glow}; ${
                isCurrentUser ? "animation: glowPulse 1.7s infinite alternate;" : ""
              }">
                <td style="padding:6px;">#${rank}</td>
                <td style="padding:6px;">${escapeHtml(u.name)}</td>
                <td style="padding:6px;">${u.level}</td>
                <td style="padding:6px;">${u.xp}</td>
                <td style="padding:6px;">${statusText}</td>
                <td style="padding:6px;">${inactiveText}</td>
              </tr>
            `;
          })
          .join("");

        body.innerHTML = rows;

        if (!document.getElementById("glowAnimation")) {
          const style = document.createElement("style");
          style.id = "glowAnimation";
          style.textContent = `
            @keyframes glowPulse {
              0% { box-shadow: 0 0 4px rgba(247,234,215,0.4); }
              50% { box-shadow: 0 0 9px rgba(247,234,215,0.65); }
              100% { box-shadow: 0 0 4px rgba(247,234,215,0.4); }
            }
          `;
          document.head.appendChild(style);
        }
      } catch (err) {
        console.error("⚠️ Live leaderboard error (render):", err);
        const body = document.getElementById("leaderboardBody");
        if (body) body.innerHTML = `<tr><td colspan="7" style="padding:10px;">Error loading leaderboard.</td></tr>`;
      }
    },
    (err) => {
      console.error("⚠️ Live leaderboard error (snapshot):", err);
      const body = document.getElementById("leaderboardBody");
      if (body) body.innerHTML = `<tr><td colspan="7" style="padding:10px;">Error loading leaderboard.</td></tr>`;
    }
  );
}

// small utility to escape HTML in usernames
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ===============================================
// 🚀 Button Trigger
// ===============================================
function wireLeaderboardButton() {
  const btn = document.getElementById("leaderboardBtn");
  if (!btn || btn.dataset.lbBound === "true") return;

  btn.dataset.lbBound = "true";
  btn.addEventListener("click", async () => {
    try {
      await cleanupGhostUsers(); // Safe cleanup only removes broken/duplicate docs
    } catch (err) {
      console.warn("Cleanup skipped (permission/rules issue):", err);
    }

    const currentUID = auth.currentUser ? auth.currentUser.uid : null;
    createLeaderboardPopup(currentUID);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", wireLeaderboardButton, { once: true });
} else {
  wireLeaderboardButton();
}

// Keep auth observer only to ensure auth initializes quietly in the module lifecycle.
onAuthStateChanged(auth, () => {});
