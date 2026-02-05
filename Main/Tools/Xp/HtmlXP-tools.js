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
// 🎨 Popup Creation
// ===============================
const style = document.createElement("style");
style.textContent = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; transform: scale(0.98); }
}
.fade-in { animation: fadeIn 0.8s ease forwards; }
.fade-out { animation: fadeOut 0.8s ease forwards; }
`;
document.head.appendChild(style);

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
    <p id="xpInfoText" style="font-size:8px;color:#ccc;">Loading...</p>
    <p id="levelUpNotice" style="display:none;color:#ffd700;font-size:9px;">⬆ Level Up!</p>
    <button id="backToLobby" style="
      background:#ff6b35;color:#fff;border:none;
      border-radius:8px;padding:10px 16px;
      font-family:'Press Start 2P';cursor:pointer;
      margin-top:20px;">⬅ Back to Lobby</button>
  </div>
`;
document.body.appendChild(popup);

const xpPopup = document.getElementById("xpPopup");

// ===============================
// 🔊 Sound + Vibration Settings
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
// 🧩 XP System Link (Direct Trigger)
// ===============================
function attachXPSystem(user) {
  // Expose a function globally for quiz pages to call when finished
  window.handleQuizFinish = async ({ finalScore, totalQuestions, types }) => {
    await processXP(user, finalScore, totalQuestions, types);
  };
  console.log("✅ XP system ready — waiting for quiz completion...");
}

// ===============================
// 🧠 XP Processor Function
// ===============================
async function processXP(user, correctCount, totalCount, types) {
  // Calculate XP earned based on question type
  let xpEarned = 0;
  for (let i = 0; i < correctCount; i++) {
    const qType = types[i] || "mc";
    xpEarned += qType === "fill" ? XP_FILL : XP_MC;
  }

  if (soundEnabled) correctSound.play();
  if (vibrationEnabled && isMobile && navigator.vibrate) navigator.vibrate([120, 80, 120]);

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    let data = snap.exists() ? snap.data() : {};

    let oldXP = data.xp || 0;
    let oldLevel = data.level || 1;
    let xpMax = data.xpMax || 100;
    let completedLevels = data.completedLevels || {};

    // 🛡 Prevent farming
    let alreadyCompleted = completedLevels[CURRENT_LEVEL] === true;
    let gainedXP = alreadyCompleted ? 0 : xpEarned;

    let newXP = oldXP + gainedXP;
    let newLevel = oldLevel;
    let leveledUp = false;

    while (newXP >= xpMax) {
      newXP -= xpMax;
      newLevel++;
      xpMax = Math.floor(xpMax * 1.1);
      leveledUp = true;
    }

    completedLevels[CURRENT_LEVEL] = true;

    await updateDoc(userRef, {
      xp: newXP,
      level: newLevel,
      xpMax: xpMax,
      completedLevels: completedLevels
    });

    console.log(`✅ XP Saved: +${gainedXP} XP (Level ${newLevel})`);
    showPopup(gainedXP, alreadyCompleted, newXP, xpMax, newLevel, leveledUp);

  } catch (err) {
    console.error("⚠️ Error saving XP:", err);
  }
}

// ===============================
// ⏳ Ensure Popup Ready
// ===============================
function ensurePopupReady() {
  return new Promise(resolve => {
    const check = () => {
      const popup = document.getElementById("xpPopup");
      if (popup) resolve(true);
      else setTimeout(check, 100);
    };
    check();
  });
}

// ===============================
// 🎉 Show Popup
// ===============================
async function showPopup(xp, alreadyCompleted, currentXP, xpMax, currentLevel, leveledUp) {
  await ensurePopupReady();

  const quizContainer = document.querySelector(".quiz-container");
  if (quizContainer) {
    quizContainer.classList.add("fade-out");
  }

  setTimeout(() => {
    if (quizContainer) quizContainer.style.display = "none";

    const popupInner = document.querySelector("#xpPopup > div");
    popupInner.classList.remove("fade-out");
    popupInner.classList.add("fade-in");
    xpPopup.style.display = "flex";

    const xpGain = document.getElementById("xpGain");
    const xpBarFill = document.getElementById("xpBarFill");
    const xpInfoText = document.getElementById("xpInfoText");
    const levelUpNotice = document.getElementById("levelUpNotice");

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

    levelUpNotice.style.display = leveledUp ? "block" : "none";
  }, 600);
}

// ===============================
// 🔙 Back to Lobby Button Handler
// ===============================
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "backToLobby") {
    const xpPopup = document.getElementById("xpPopup");
    const popupInner = document.querySelector("#xpPopup > div");

    popupInner.classList.remove("fade-in");
    popupInner.classList.add("fade-out");

    setTimeout(() => {
      window.location.href = "../../../Webside/Student.html";
    }, 800);
  }
});
