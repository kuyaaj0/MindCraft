// ===================================
// 🎮 MindCraft Level & XP System (Main/Exp/levels.js)
// ===================================

const XP_CAP_DEFAULT = 100;
const XP_CAP_MULTIPLIER = 1.25;
const XP_SYNC_KEY = "pendingXP"; // for offline XP cache

// ===================================
// 🏆 Award XP (Local + Firestore)
async function awardXP(amount) {
  // Wait for Firebase auth to fully initialize
  let user = typeof auth !== 'undefined' ? auth.currentUser : null;
  if (!user) {
    // Wait a moment in case auth is still initializing
    await new Promise(res => setTimeout(res, 500));
    user = typeof auth !== 'undefined' ? auth.currentUser : null;
  }

  const localID = user ? user.uid : localStorage.getItem("currentUser");
  if (!localID) {
    console.warn("⚠️ Cannot award XP: No logged-in user.");
    return;
  }

  // Local cache values
  let xp = parseInt(localStorage.getItem(`${localID}_xp`)) || 0;
  let level = parseInt(localStorage.getItem(`${localID}_level`)) || 1;
  let xpMax = parseInt(localStorage.getItem(`${localID}_xpMax`)) || XP_CAP_DEFAULT;

  xp += amount;
  let leveledUp = false;

  while (xp >= xpMax) {
    xp -= xpMax;
    level++;
    xpMax = Math.floor(xpMax * XP_CAP_MULTIPLIER);
    leveledUp = true;
  }

  // Save locally
  localStorage.setItem(`${localID}_xp`, xp);
  localStorage.setItem(`${localID}_level`, level);
  localStorage.setItem(`${localID}_xpMax`, xpMax);
  window.dispatchEvent(new Event("storage"));

  // Try Firestore sync
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
      console.log(`✅ Firestore XP synced: +${amount} XP (Total: ${newXP}, Level: ${newLevel})`);

      // Clear pending XP cache if it exists
      localStorage.removeItem(XP_SYNC_KEY);
    } catch (err) {
      console.warn("⚠️ Firestore sync failed. Caching XP locally for retry.", err);
      // Store unsynced XP in cache
      const pending = parseInt(localStorage.getItem(XP_SYNC_KEY) || "0");
      localStorage.setItem(XP_SYNC_KEY, pending + amount);
    }
  } else {
    // Offline or no auth yet → store unsynced XP
    const pending = parseInt(localStorage.getItem(XP_SYNC_KEY) || "0");
    localStorage.setItem(XP_SYNC_KEY, pending + amount);
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

// ===================================
// 🔁 Auto-sync pending XP when online
async function syncPendingXP() {
  const pending = parseInt(localStorage.getItem(XP_SYNC_KEY) || "0");
  if (pending > 0 && typeof auth !== 'undefined' && auth.currentUser) {
    console.log(`🔄 Syncing ${pending} pending XP...`);
    await awardXP(pending);
    localStorage.removeItem(XP_SYNC_KEY);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("online", syncPendingXP);
  setTimeout(syncPendingXP, 2000); // retry shortly after load
}

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

// Expose to global
window.awardXP = awardXP;
window.gainLessonXP = () => awardXP(10);
window.gainQuizXP = (isCorrect) => { if (isCorrect) awardXP(5); };
