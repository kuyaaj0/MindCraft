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
const CURRENT_LEVEL = window.location.pathname.split("/").pop().replace(".html", "");

// ===============================
// 🎨 Popup Creation
// ===============================
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
    <div style="width:60%;background:#222;border-radius:8px;height:14px;overflow:hidden;margin:14px auto;position:relative;">
      <div id="xpBarFill" style="background:linear-gradient(90deg,#00ff90,#1DB954);width:0%;height:100%;transition:width 1.5s;"></div>
      <span id="xpText" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:8px;color:#fff;">0%</span>
    </div>
    <div id="levelUpNotice" style="
      display:none;
      font-size:14px;
      color:#ffd966;
      text-shadow:2px 2px #000;
      animation:pop 1s ease infinite alternate;">
      🌟 LEVEL UP! 🌟
    </div>
    <button id="backToLobby" style="
      background:#ff6b35;color:#fff;border:none;
      border-radius:8px;padding:10px 16px;
      font-family:'Press Start 2P';cursor:pointer;
      margin-top:20px;">⬅ Back to Lobby</button>
  </div>
  <style>
    @keyframes pop {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.2); opacity: 0.7; }
    }
  </style>
`;
document.body.appendChild(popup);

const xpPopup = document.getElementById("xpPopup");
const xpGain = document.getElementById("xpGain");
const xpBarFill = document.getElementById("xpBarFill");
const xpText = document.getElementById("xpText");
const backToLobby = document.getElementById("backToLobby");
const levelUpNotice = document.getElementById("levelUpNotice");

// ===============================
// 🔊 Sound + Vibration
// ===============================
const correctSound = new Audio("../../../Assets/Sounds/Correct.mp3");
const wrongSound = new Audio("../../../Assets/Sounds/Incorrect.mp3");
const levelUpSound = new Audio("../../../Assets/Sounds/LevelUp.mp3");

const soundEnabled = localStorage.getItem("sound") === "on";
const vibrationEnabled = localStorage.getItem("vibration") === "on";
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// ===============================
// 🔒 Authentication + Initialization
// ===============================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("⚠️ You must be signed in to take this quiz!");
    window.location.href = "../../../Account/signin.html";
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      // Create a new user document if missing
      await setDoc(userRef, {
        email: user.email,
        role: "student",
        xp: 0,
        level: 1,
        xpMax: 100,
        completedLevels: {}
      });
      console.log("🆕 New user document created for:", user.email);
    } else {
      // ✅ Ensure completedLevels exists
      const data = snap.data();
      if (!data.completedLevels) {
        await updateDoc(userRef, { completedLevels: {} });
        console.log("🆕 Initialized completedLevels field for:", user.email);
      }
    }

    // Verify role
    const updatedSnap = await getDoc(userRef);
    const role = updatedSnap.data().role || "student";
    if (role !== "student") {
      alert("🚫 Only students can take this quiz!");
      window.location.href = "../../../Webside/Teacher.html";
      return;
    }

    // 🧱 Ensure completedLevels exists for older accounts
try {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data();
    if (!data.completedLevels) {
      await updateDoc(userRef, { completedLevels: {} });
      console.log("🆕 Added missing completedLevels for old user:", user.email);
    }
  }
} catch (err) {
  console.error("⚠️ Error ensuring completedLevels:", err);
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
// 🧩 XP System Link
// ===============================
function attachXPSystem(user) {
  window.handleQuizFinish = async ({ finalScore, totalQuestions, types }) => {
    await processXP(user, finalScore, totalQuestions, types);
  };
  console.log("✅ XP system ready — waiting for quiz completion...");
}

// ===============================
// 🧠 XP Processor
// ===============================
async function processXP(user, correctCount, totalCount, types) {
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

    const alreadyCompleted = completedLevels[CURRENT_LEVEL] === true;
    const gainedXP = alreadyCompleted ? 0 : xpEarned;

    if (!alreadyCompleted) {
      completedLevels[CURRENT_LEVEL] = true;

      let newXP = oldXP + gainedXP;
      let newLevel = oldLevel;
      let leveledUp = false;

      while (newXP >= xpMax) {
        newXP -= xpMax;
        newLevel++;
        xpMax = Math.floor(xpMax * 1.1);
        leveledUp = true;
      }

      await updateDoc(userRef, {
        xp: newXP,
        level: newLevel,
        xpMax: xpMax,
        completedLevels: completedLevels
      });

      localStorage.setItem(`${user.uid}_xp`, newXP);
      localStorage.setItem(`${user.uid}_level`, newLevel);
      showPopup(gainedXP, false, newXP, xpMax, newLevel, leveledUp);
    } else {
      showPopup(0, true, oldXP, xpMax, oldLevel, false);
    }

  } catch (err) {
    console.error("⚠️ Error updating XP:", err);
  }
}

// ===============================
// 🎉 XP Popup Display (fixed)
// ===============================
function showPopup(xp, alreadyCompleted, currentXP, xpMax, currentLevel, leveledUp) {
  const quizContainer = document.querySelector(".quiz-container");
  if (quizContainer) {
    quizContainer.style.transition = "opacity 0.6s ease";
    quizContainer.style.opacity = "0";
  }

  setTimeout(() => {
    if (quizContainer) quizContainer.style.display = "none";

    // 🔧 Ensure popup exists & visible
    xpPopup.style.display = "flex";
    xpPopup.style.opacity = "0";
    xpPopup.style.transition = "opacity 1s ease";
    setTimeout(() => (xpPopup.style.opacity = "1"), 100);

    const xpPercent = Math.min((currentXP / xpMax) * 100, 100).toFixed(1);

    // 🎯 XP Info
    if (alreadyCompleted) {
      xpGain.textContent = "No XP gained — already completed!";
      xpGain.style.color = "#ff7575";
      xpBarFill.style.width = `${xpPercent}%`;
      xpText.textContent = `${xpPercent}%`;
    } else {
      xpGain.textContent = `+${xp} XP Gained`;
      xpGain.style.color = "#1DB954";
      setTimeout(() => {
        xpBarFill.style.width = `${xpPercent}%`;
        xpText.textContent = `${xpPercent}%`;
      }, 300);
    }

    // 🧾 Extra info below XP bar
    const info = document.createElement("p");
    info.id = "xpInfoText";
    info.style.fontSize = "8px";
    info.style.color = "#fff";
    info.style.marginTop = "8px";
    info.textContent = `Level ${currentLevel} • ${currentXP} / ${xpMax} XP`;
    const oldInfo = document.getElementById("xpInfoText");
    if (oldInfo) oldInfo.remove();
    xpGain.insertAdjacentElement("afterend", info);

    // 🌟 Level up animation
    if (leveledUp) {
      levelUpNotice.style.display = "block";
      if (soundEnabled) levelUpSound.play();
      if (vibrationEnabled && isMobile && navigator.vibrate) {
        navigator.vibrate([250, 100, 250]);
      }
    } else {
      levelUpNotice.style.display = "none";
    }
  }, 600);
}

// ===============================
// 🔙 Back to Lobby (with fade-out)
// ===============================
backToLobby.addEventListener("click", () => {
  xpPopup.style.transition = "opacity 0.8s ease";
  xpPopup.style.opacity = "0";
  setTimeout(() => (window.location.href = "../../../Webside/Student.html"), 800);
});

/*// ===============================
// 🎉 XP Popup Display
// ===============================
function showPopup(xp, alreadyCompleted, currentXP, xpMax, currentLevel, leveledUp) {
  const quizContainer = document.querySelector(".quiz-container");
  if (quizContainer) quizContainer.style.opacity = "0";

  setTimeout(() => {
    if (quizContainer) quizContainer.style.display = "none";
    xpPopup.style.display = "flex";

    const xpPercent = Math.min((currentXP / xpMax) * 100, 100).toFixed(1);

    if (alreadyCompleted) {
      xpGain.textContent = "No XP gained — already completed!";
      xpGain.style.color = "#ff7575";
      xpBarFill.style.width = `${xpPercent}%`;
      xpText.textContent = `${xpPercent}%`;
    } else {
      xpGain.textContent = `+${xp} XP Gained`;
      xpGain.style.color = "#1DB954";
      setTimeout(() => {
        xpBarFill.style.width = `${xpPercent}%`;
        xpText.textContent = `${xpPercent}%`;
      }, 300);
    }

    const info = document.createElement("p");
    info.style.fontSize = "8px";
    info.style.color = "#fff";
    info.style.marginTop = "8px";
    info.textContent = `Level ${currentLevel} • ${currentXP} / ${xpMax} XP`;
    xpGain.insertAdjacentElement("afterend", info);

    if (leveledUp) {
      levelUpNotice.style.display = "block";
      if (soundEnabled) levelUpSound.play();
      if (vibrationEnabled && isMobile && navigator.vibrate) navigator.vibrate([250, 100, 250]);
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
});*/
