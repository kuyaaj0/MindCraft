// ===============================
// 🎮 MindCraft Level & XP System
// ===============================

// --- Identify current user ---
const currentUser = localStorage.getItem('currentUser');
if (!currentUser) {
  console.warn("No user logged in. XP system paused.");
}

// --- Load saved data for this user ---
let level = parseInt(localStorage.getItem(`${currentUser}_level`)) || 1;
let xp = parseInt(localStorage.getItem(`${currentUser}_xp`)) || 0;
let xpMax = parseInt(localStorage.getItem(`${currentUser}_xpMax`)) || 100;

// --- UI elements ---
const xpValue = document.getElementById('xpValue');
const xpBar = document.getElementById('xpBar');
const levelValue = document.getElementById('levelValue');

// --- Smooth display ---
let displayedXP = xp;
let displayedLevel = level;

// --- Initialize display ---
updateDisplay();
animateXP();

// ===============================
// 🔄 Animation for XP bar (smooth)
// ===============================
function animateXP() {
  if (displayedXP < xp) displayedXP += Math.ceil((xp - displayedXP) * 0.1) || 1;
  if (displayedXP > xp) displayedXP = xp;
  if (displayedLevel !== level) displayedLevel = level;

  if (xpValue) xpValue.textContent = `${displayedXP}/${xpMax}`;
  if (xpBar) {
    xpBar.value = displayedXP;
    xpBar.max = xpMax;
  }
  if (levelValue) levelValue.textContent = displayedLevel;

  requestAnimationFrame(animateXP);
}

// ===============================
// 💥 XP Gain Functions
// ===============================
function gainLessonXP() {
  addXP(10); // XP per lesson
}

function gainQuizXP(isCorrect) {
  if (isCorrect) addXP(5); // XP per correct quiz answer
}

// ===============================
// ➕ Add XP + Handle Level Up
// ===============================
function addXP(amount) {
  if (!currentUser) return;

  xp += amount;

  // Handle leveling up
  let leveledUp = false;
  while (xp >= xpMax) {
    xp -= xpMax;
    level++;
    xpMax = Math.floor(xpMax * 1.25); // Increase XP requirement
    leveledUp = true;
  }

  // Save progress
  localStorage.setItem(`${currentUser}_xp`, xp);
  localStorage.setItem(`${currentUser}_level`, level);
  localStorage.setItem(`${currentUser}_xpMax`, xpMax);

  updateDisplay();
  highlightXPBar();

  // Show level up message
  if (leveledUp) {
    setTimeout(() => {
      alert(`🎉 Congratulations ${currentUser}! You reached Level ${level}!`);
    }, 300);
  }
}

// ===============================
// 💡 Highlight XP bar when updated
// ===============================
function highlightXPBar() {
  if (xpBar) {
    xpBar.style.transition = 'box-shadow 0.5s ease';
    xpBar.style.boxShadow = '0 0 15px #1DB954';
    setTimeout(() => {
      xpBar.style.boxShadow = 'none';
    }, 2000);
  }
}

// ===============================
// ♻️ Reset XP (for testing)
// ===============================
function resetXP() {
  if (!currentUser) return;

  xp = 0;
  level = 1;
  xpMax = 100;
  localStorage.setItem(`${currentUser}_xp`, xp);
  localStorage.setItem(`${currentUser}_level`, level);
  localStorage.setItem(`${currentUser}_xpMax`, xpMax);
  updateDisplay();
}

// ===============================
// 📊 Update Display
// ===============================
function updateDisplay() {
  if (xpValue) xpValue.textContent = `${xp}/${xpMax}`;
  if (xpBar) {
    xpBar.value = xp;
    xpBar.max = xpMax;
  }
  if (levelValue) levelValue.textContent = level;
}

// ===============================
// 🔁 Sync XP display on other pages
// ===============================
function syncXPDisplay() {
  const user = localStorage.getItem('currentUser');
  if (!user) return;

  let xpNow = parseInt(localStorage.getItem(`${user}_xp`)) || 0;
  let levelNow = parseInt(localStorage.getItem(`${user}_level`)) || 1;
  let xpCap = parseInt(localStorage.getItem(`${user}_xpMax`)) || 100;

  // 🧮 Check if XP exceeds the cap (auto-level up fix)
  let leveledUp = false;
  while (xpNow >= xpCap) {
    xpNow -= xpCap;
    levelNow++;
    xpCap = Math.floor(xpCap * 1.25);
    leveledUp = true;
  }

  if (leveledUp) {
    localStorage.setItem(`${user}_xp`, xpNow);
    localStorage.setItem(`${user}_level`, levelNow);
    localStorage.setItem(`${user}_xpMax`, xpCap);
    alert(`🎉 Congratulations ${user}! You reached Level ${levelNow}!`);
  }

  // 🪄 Update global vars
  xp = xpNow;
  level = levelNow;
  xpMax = xpCap;

  updateDisplay();
  highlightXPBar();
}
