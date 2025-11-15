// --- LEVEL & XP SYSTEM ---
let level = parseInt(localStorage.getItem('level')) || 1;
let xp = parseInt(localStorage.getItem('xp')) || 0;
let xpMax = parseInt(localStorage.getItem('xpMax')) || 100;

const xpValue = document.getElementById('xpValue');
const xpBar = document.getElementById('xpBar');
const levelValue = document.getElementById('levelValue');
const xpMaxDisplay = document.getElementById('xpMax');

// For smooth animation
let displayedXP = xp;
let displayedLevel = level;

// Initialize display
updateDisplay();

// Animate XP bar and number smoothly
function animateXP() {
  if (displayedXP < xp) displayedXP += Math.ceil((xp - displayedXP) * 0.1) || 1;
  if (displayedXP > xp) displayedXP = xp;
  if (displayedLevel !== level) displayedLevel = level;

  xpValue.textContent = displayedXP;
  xpBar.value = displayedXP;
  xpBar.max = xpMax;
  levelValue.textContent = displayedLevel;
  xpMaxDisplay.textContent = xpMax;

  requestAnimationFrame(animateXP);
}
animateXP();

// Gain XP after finishing a modular lesson (50-60 mins)
function gainLessonXP() {
  addXP(10);
}

// Gain XP after quiz (true = correct, false = wrong)
function gainQuizXP(isCorrect) {
  if (isCorrect) addXP(5);
}

// Generic function to add XP and handle leveling
function addXP(amount) {
  xp += amount;

  // Handle leveling
  while (xp >= xpMax) {
    xp -= xpMax; // carry over leftover XP
    level += 1;
    xpMax = Math.floor(xpMax * 1.15); // increase XP needed per level
    alert(`🎉 Congratulations! You've reached Level ${level}!`);
  }

  // Save progress
  localStorage.setItem('xp', xp);
  localStorage.setItem('level', level);
  localStorage.setItem('xpMax', xpMax);
}

// Optional: reset progress (for testing, not in UI)
function resetXP() {
  xp = 0;
  level = 1;
  xpMax = 100;
  localStorage.setItem('xp', xp);
  localStorage.setItem('level', level);
  localStorage.setItem('xpMax', xpMax);
  updateDisplay();
}

// Update display immediately
function updateDisplay() {
  xpValue.textContent = xp;
  xpBar.value = xp;
  xpBar.max = xpMax;
  levelValue.textContent = level;
  xpMaxDisplay.textContent = xpMax;
  }
