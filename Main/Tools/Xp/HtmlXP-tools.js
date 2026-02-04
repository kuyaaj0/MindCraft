// ../../../Tools/XP/HtmlXP-tools.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===============================
// 🔧 Firebase Configuration
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyAQBwwuXwh82MCRyJ_7CBk2aWUp-n6p4DQ",
  authDomain: "mindcraft-83f81.firebaseapp.com",
  projectId: "mindcraft-83f81",
  storageBucket: "mindcraft-83f81.firebasestorage.app",
  messagingSenderId: "483019456762",
  appId: "1:483019456762:web:fdc05a2dda51c0f39a8943"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===============================
// ⚙️ XP Settings
// ===============================
const XP_MC = 5;   // XP for multiple choice
const XP_FILL = 10; // XP for fill-in-the-blank

// Detect level name from file (ex: level-2.html → "level-2")
const CURRENT_LEVEL = window.location.pathname.split("/").pop().replace(".html", "");

// ===============================
// 🔊 Sound + Vibration Settings
// ===============================
const correctSound = new Audio("../../../Assets/Sounds/Correct.mp3");
const levelUpSound = new Audio("../../../Assets/Sounds/LevelUp.mp3");
const soundEnabled = localStorage.getItem("sound") === "on";
const vibrationEnabled = localStorage.getItem("vibration") === "on";
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// ===============================
// 🎨 Popup Creation (safe load)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.createElement("div");
  popup.id = "xpPopup";
  popup.style.display = "none";
  popup.innerHTML = `
    <div id="xpPopupInner" style="
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,0.85);
      display:flex;flex-direction:column;
      justify-content:center;align-items:center;
      text-align:center;z-index:999;
      font-family:'Press Start 2P',cursive;color:#fff;">
      
      <h2 style="color:#ffd966;margin-bottom:10px;">🎉 Level Complete!</h2>
      <p id="xpGain" style="color:#1DB954;font-size:10px;margin:8px 0;">+0 XP Gained</p>
      <div style="width:60%;background:#222;border-radius:8px;height:14px;overflow:hidden;margin:14px auto;">
        <div id="xpBarFill" style="background:linear-gradient(90deg,#00ff90,#1DB954);width:0%;height:100%;transition:width 1.5s;"></div>
      </div>
      <p id="xpInfoText" style="font-size:8px;margin-top:8px;"></p>
      <p id="levelUpNotice" style="display:none;color:#ffd966;margin-top:10px;font-size:9px;">⭐ LEVEL UP!</p>
      <button id="backToLobby" style="
        background:#ff6b35;color:#fff;border:none;
        border-radius:8px;padding:10px 16px;
        font-family:'Press Start 2P';cursor:pointer;
        margin-top:20px;">⬅ Back to Lobby</button>
    </div>
  `;
  document.body.appendChild(popup);
});

const xpPopup = document.getElementById("xpPopup");
const xpGain = document.getElementById("xpGain");
const xpBarFill = document.getElementById("xpBarFill");
const xpInfoText = document.getElementById("xpInfoText");
const levelUpNotice = document.getElementById("levelUpNotice");
const backToLobby = document.getElementById("backToLobby");

// ===============================
// 🔒 Authentication Check
// ===============================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("⚠️ You must be signed in to take this quiz!");
    window.location.href = "../../../Account/signin.html";
    return;
  }

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        xp: 0,
        xpMax: 100,
        level: 1,
        completedLevels: {},
        createdAt: new Date(),
      });
    }

    const role = snap.data()?.role || "student";
    if (role !== "student") {
      alert("🚫 Only students can take this quiz!");
      window.location.href = "../../../Webside/Teacher.html";
      return;
    }

    console.log("✅ Authorized student:", user.email);
    attachXPSystem(user);

  } catch (err) {
    console.error("Auth check error:", err);
    alert("⚠️ Please sign in again.");
    window.location.href = "../../../Account/signin.html";
  }
});

// ===============================
// 🧩 XP System Link (Quiz trigger)
// ===============================
function attachXPSystem(user) {
  window.handleQuizFinish = async ({ finalScore, totalQuestions, types }) => {
    await processXP(user, finalScore, totalQuestions, types);
  };
  console.log("✅ XP system ready — waiting for quiz completion...");
}

// ===============================
// 🧠 XP Processor Function
// ===============================
async function processXP(user, correctCount, totalCount, types) {
  let xpEarned = 0;
  for (let i = 0; i < correctCount; i++) {
    const qType = types[i] || "mc";
    xpEarned += qType === "fill" ? XP_FILL : XP_MC;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const data = snap.exists() ? snap.data() : {};

    let oldXP = data.xp || 0;
    let oldLevel = data.level || 1;
    let xpMax = data.xpMax || 100;
    let completedLevels = data.completedLevels || {};

    // 🛡 Prevent XP farming
    const alreadyCompleted = completedLevels[CURRENT_LEVEL] === true;
    const gainedXP = alreadyCompleted ? 0 : xpEarned;

    // 🧮 Apply XP logic
    let newXP = oldXP + gainedXP;
    let newLevel = oldLevel;
    let leveledUp = false;

    while (newXP >= xpMax) {
      newXP -= xpMax;
      newLevel++;
      xpMax = Math.floor(xpMax * 1.1);
      leveledUp = true;
    }

    // 🧾 Update Firestore
    completedLevels[CURRENT_LEVEL] = true;
    await updateDoc(userRef, {
      xp: newXP,
      level: newLevel,
      xpMax: xpMax,
      completedLevels: completedLevels
    });

    // 💾 Cache locally too
    localStorage.setItem(`${user.uid}_xp`, newXP);
    localStorage.setItem(`${user.uid}_level`, newLevel);

    // 🔊 Feedback
    if (soundEnabled) correctSound.play();
    if (vibrationEnabled && isMobile && navigator.vibrate) navigator.vibrate([120, 80, 120]);

    console.log(`✅ XP Saved: +${gainedXP} (Total: ${newXP}, Level: ${newLevel})`);
    showPopup(gainedXP, alreadyCompleted, newXP, xpMax, newLevel, leveledUp);

  } catch (err) {
    console.error("⚠️ Error saving XP:", err);
  }
}

// ===============================
// 🎉 XP Popup Display (fade + fix)
// ===============================
function showPopup(xp, alreadyCompleted, currentXP, xpMax, currentLevel, leveledUp) {
  const quizContainer = document.querySelector(".quiz-container");
  if (quizContainer) {
    quizContainer.style.transition = "opacity 0.6s ease";
    quizContainer.style.opacity = "0";
  }

  setTimeout(() => {
    if (quizContainer) quizContainer.style.display = "none";

    xpPopup.style.display = "flex";
    xpPopup.style.opacity = "0";
    xpPopup.style.transition = "opacity 1s ease";
    setTimeout(() => (xpPopup.style.opacity = "1"), 100);

    const xpPercent = Math.min((currentXP / xpMax) * 100, 100).toFixed(1);

    if (alreadyCompleted) {
      xpGain.textContent = "No XP gained — already completed!";
      xpGain.style.color = "#ff7575";
    } else {
      xpGain.textContent = `+${xp} XP Gained`;
      xpGain.style.color = "#1DB954";
    }

    xpBarFill.style.width = `${xpPercent}%`;
    xpInfoText.textContent = `Level ${currentLevel} • ${currentXP} / ${xpMax} XP`;

    if (leveledUp) {
      levelUpNotice.style.display = "block";
      if (soundEnabled) levelUpSound.play();
      if (vibrationEnabled && isMobile && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    } else {
      levelUpNotice.style.display = "none";
    }
  }, 600);
}

// ===============================
// 🔙 Back to Lobby (fade-out)
// ===============================
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "backToLobby") {
    xpPopup.style.transition = "opacity 0.8s ease";
    xpPopup.style.opacity = "0";
    setTimeout(() => (window.location.href = "../../../Webside/Student.html"), 800);
  }
});
