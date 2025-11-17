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
// 🔄 Animation for XP bar
// ===============================
function animateXP() {
  if (displayedXP < xp) displayedXP += Math.ceil((xp - displayedXP) * 0.1) || 1;
  if (displayedXP > xp) displayedXP = xp;
  if (displayedLevel !== level) displayedLevel = level;

  if (xpValue) xpValue.textContent = displayedXP;
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

  // Handle leveling
  while (xp >= xpMax) {
    xp -= xpMax;
    level += 1;
    xpMax = Math.floor(xpMax * 1.15);
    alert(`🎉 Congratulations ${currentUser}! You've reached Level ${level}!`);
  }

  // Save progress for this user
  localStorage.setItem(`${currentUser}_xp`, xp);
  localStorage.setItem(`${currentUser}_level`, level);
  localStorage.setItem(`${currentUser}_xpMax`, xpMax);

  updateDisplay();
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
  if (xpValue) xpValue.textContent = xp;
  if (xpBar) {
    xpBar.value = xp;
    xpBar.max = xpMax;
  }
  if (levelValue) levelValue.textContent = level;
}
