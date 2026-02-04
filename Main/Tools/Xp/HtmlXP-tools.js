// ../../../Tools/XP/HtmlXP-tools.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===============================
// ⚙️ XP Settings
// ===============================
const XP_MC = 5;   // XP for multiple choice
const XP_FILL = 10; // XP for fill-in-the-blank

// Auto-detect level name from the file name (e.g., level-3.html → "level-3")
const CURRENT_LEVEL = window.location.pathname.split("/").pop().replace(".html", "");

// ===============================
// 🎨 Popup Structure
// ===============================
const resultBox = document.getElementById("resultBox");
const quizContainer = document.querySelector(".quiz-container");

const popup = document.createElement("div");
popup.id = "xpPopup";
popup.innerHTML = `
  <div style="
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:rgba(0,0,0,0.85);
    display:none;justify-content:center;align-items:center;
    flex-direction:column;z-index:999;color:#fff;
    font-family:'Press Start 2P',cursive;text-align:center;">
    
    <h2 style="color:#ffd966;">🎉 Level Complete!</h2>
    <p id="xpGain" style="color:#1DB954;font-size:10px;margin:8px 0;">+0 XP Gained</p>
    <div style="width:60%;background:#222;border-radius:8px;height:14px;overflow:hidden;margin:14px auto;">
      <div id="xpBarFill" style="background:linear-gradient(90deg,#00ff90,#1DB954);width:0%;height:100%;transition:width 1.5s;"></div>
    </div>
    <button id="backToLobby" style="
      background:#ff6b35;color:#fff;border:none;
      border-radius:8px;padding:10px 16px;
      font-family:'Press Start 2P';cursor:pointer;
      margin-top:20px;">⬅ Back to Lobby</button>
  </div>
`;
document.body.appendChild(popup);

const xpPopup = document.getElementById("xpPopup");
const xpGain = document.getElementById("xpGain");
const xpBarFill = document.getElementById("xpBarFill");
const backToLobby = document.getElementById("backToLobby");

// ===============================
// 🔊 Sound + Vibration
// ===============================
const correctSound = new Audio("../../../Assets/Sounds/Correct.mp3");
const wrongSound = new Audio("../../../Assets/Sounds/Incorrect.mp3");
const soundEnabled = localStorage.getItem("sound") === "on";
const vibrationEnabled = localStorage.getItem("vibration") === "on";
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

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
      alert("⚠️ User data not found!");
      window.location.href = "../../../Account/signin.html";
      return;
    }

    const role = snap.data().role || "student";
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
// 🧩 XP System Connection
// ===============================
function attachXPSystem(user) {
  const observer = new MutationObserver((mutations) => {
    for (let m of mutations) {
      if (m.type === "childList" && resultBox.textContent.includes("FINAL SCORE")) {
        handleQuizFinish(user);
        observer.disconnect();
        break;
      }
    }
  });
  observer.observe(resultBox, { childList: true, subtree: true });
}

// ===============================
// 🧠 Handle Quiz Finish + XP
// ===============================
async function handleQuizFinish(user) {
  const text = resultBox.textContent;
  const match = text.match(/FINAL SCORE:\s*(\d+)\s*\/\s*(\d+)/);
  if (!match) return;

  const correctCount = parseInt(match[1]);
  const totalCount = parseInt(match[2]);

  // Detect all question types from the quiz if available in window
  // (It assumes your quiz defines a global `questions` array)
  let xpEarnedRaw = 0;
  if (window.questions && Array.isArray(window.questions)) {
    // Use real types from your quiz array
    const answeredCorrectly = window.questions.slice(0, correctCount);
    for (let q of answeredCorrectly) {
      if (q.type === "fill") xpEarnedRaw += XP_FILL;
      else xpEarnedRaw += XP_MC;
    }
  } else {
    // If we can’t detect question types, fallback evenly
    const halfFill = Math.floor(totalCount / 2);
    const estXP = Math.min(correctCount, halfFill) * XP_FILL + Math.max(0, correctCount - halfFill) * XP_MC;
    xpEarnedRaw = estXP;
  }

  // Play effects
  if (soundEnabled) correctSound.play();
  if (vibrationEnabled && isMobile && navigator.vibrate) navigator.vibrate([150, 100, 150]);

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    let data = snap.exists() ? snap.data() : {};

    let oldXP = data.xp || 0;
    let oldLevel = data.level || 1;
    let xpMax = data.xpMax || 100;
    let completedLevels = data.completedLevels || {};

    // 🛡 Prevent XP farming
    let alreadyCompleted = completedLevels[CURRENT_LEVEL] === true;
    let xpEarned = alreadyCompleted ? 0 : xpEarnedRaw;

    if (!alreadyCompleted) {
      completedLevels[CURRENT_LEVEL] = true;

      let newXP = oldXP + xpEarned;
      let newLevel = oldLevel;

      while (newXP >= xpMax) {
        newXP -= xpMax;
        newLevel++;
        xpMax = Math.floor(xpMax * 1.1);
      }

      await updateDoc(userRef, {
        xp: newXP,
        level: newLevel,
        xpMax: xpMax,
        completedLevels: completedLevels
      });

      localStorage.setItem(`${user.uid}_xp`, newXP);
      localStorage.setItem(`${user.uid}_level`, newLevel);

      console.log(`✅ XP Saved: +${xpEarned} (Total: ${newXP}, Level: ${newLevel})`);
      showXPPopup(xpEarned, false);
    } else {
      console.log(`🟡 XP not added — ${CURRENT_LEVEL} already completed`);
      showXPPopup(0, true);
    }

  } catch (err) {
    console.error("⚠️ Error updating XP:", err);
  }
}

// ===============================
// 🎉 XP Popup Display
// ===============================
function showXPPopup(xpEarned, alreadyCompleted) {
  quizContainer.style.opacity = "0";
  setTimeout(() => {
    quizContainer.style.display = "none";
    xpPopup.style.display = "flex";
    if (alreadyCompleted) {
      xpGain.textContent = "No XP gained — already completed!";
      xpGain.style.color = "#ff7575";
    } else {
      xpGain.textContent = `+${xpEarned} XP Gained`;
      xpGain.style.color = "#1DB954";
      setTimeout(() => (xpBarFill.style.width = "100%"), 300);
    }
  }, 600);
}

// ===============================
// 🔙 Back to Lobby
// ===============================
backToLobby.addEventListener("click", () => {
  xpPopup.style.transition = "opacity 1s ease";
  xpPopup.style.opacity = "0";
  setTimeout(() => (window.location.href = "../../../Webside/Student.html"), 1000);
});
