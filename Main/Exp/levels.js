// ===================================
// 🎮 MindCraft Level & XP System (Main/Exp/levels.js)
// Compatible with normal <script> usage (no imports)
// ===================================

const XP_CAP_DEFAULT = 100;
const XP_CAP_MULTIPLIER = 1.25;

// ===================================
// 🏆 Award XP (Local + Firestore)
async function awardXP(amount) {
  // ✅ Use global auth/db from firebase.js (already loaded)
  const user = typeof auth !== 'undefined' ? auth.currentUser : null;
  const localID = localStorage.getItem("currentUser");

  if (!user && !localID) {
    console.warn("⚠️ Cannot award XP: No logged-in user.");
    return;
  }

  const key = user ? user.uid : localID;
  let xp = parseInt(localStorage.getItem(`${key}_xp`)) || 0;
  let level = parseInt(localStorage.getItem(`${key}_level`)) || 1;
  let xpMax = parseInt(localStorage.getItem(`${key}_xpMax`)) || XP_CAP_DEFAULT;

  xp += amount;
  let leveledUp = false;

  while (xp >= xpMax) {
    xp -= xpMax;
    level++;
    xpMax = Math.floor(xpMax * XP_CAP_MULTIPLIER);
    leveledUp = true;
  }

  // ✅ Save locally
  localStorage.setItem(`${key}_xp`, xp);
  localStorage.setItem(`${key}_level`, level);
  localStorage.setItem(`${key}_xpMax`, xpMax);
  window.dispatchEvent(new Event("storage"));

  // ✅ Firestore sync (only if signed in)
  if (user && typeof db !== 'undefined') {
    try {
      const { doc, getDoc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const data = snap.exists() ? snap.data() : {};

      let newXP = (data.xp || 0) + amount;
      let newLevel = data.level || 1;
      let newXpMax = data.xpMax || XP_CAP_DEFAULT;

      while (newXP >= newXpMax) {
        newXP -= newXpMax;
        newLevel++;
        newXpMax = Math.floor(newXpMax * XP_CAP_MULTIPLIER);
      }

      await updateDoc(userRef, { xp: newXP, level: newLevel, xpMax: newXpMax });
      console.log(`✅ Firestore XP updated: +${amount} XP (Total: ${newXP}, Level: ${newLevel})`);
    } catch (err) {
      console.error("⚠️ Error syncing XP:", err);
    }
  }

  // 🎉 Level-up feedback
  if (leveledUp) {
    const msg = document.getElementById("levelUpMessage");
    if (msg) {
      msg.textContent = `🎉 Level ${level} Reached!`;
      msg.style.opacity = 1;
      setTimeout(() => (msg.style.opacity = 0), 3000);
    } else {
      console.log(`🎉 Level Up → ${level}`);
    }
  }
}

window.awardXP = awardXP;
window.gainLessonXP = () => awardXP(10);
window.gainQuizXP = (isCorrect) => { if (isCorrect) awardXP(5); };

// ===================================
// 🖥️ XP Display Logic
function initializeXPDisplay() {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return;

  const xpValue = document.getElementById("xpValue");
  const xpBar = document.getElementById("xpBar");
  const levelValue = document.getElementById("levelValue");
  if (!xpBar || !xpValue || !levelValue) return;

  let xp = parseInt(localStorage.getItem(`${currentUser}_xp`)) || 0;
  let level = parseInt(localStorage.getItem(`${currentUser}_level`)) || 1;
  let xpMax = parseInt(localStorage.getItem(`${currentUser}_xpMax`)) || XP_CAP_DEFAULT;
  let displayedXP = xp;

  function updateLocal() {
    xp = parseInt(localStorage.getItem(`${currentUser}_xp`)) || 0;
    level = parseInt(localStorage.getItem(`${currentUser}_level`)) || 1;
    xpMax = parseInt(localStorage.getItem(`${currentUser}_xpMax`)) || XP_CAP_DEFAULT;
  }

  function animateXP() {
    if (displayedXP < xp) displayedXP += Math.ceil((xp - displayedXP) * 0.2);
    else if (displayedXP > xp) displayedXP = xp;

    xpValue.textContent = `${displayedXP}/${xpMax}`;
    xpBar.value = displayedXP;
    xpBar.max = xpMax;
    levelValue.textContent = level;

    requestAnimationFrame(animateXP);
  }

  window.addEventListener("storage", (e) => {
    if (e.key && (e.key.includes("_xp") || e.key.includes("_level"))) updateLocal();
  });

  animateXP();
}

initializeXPDisplay();
