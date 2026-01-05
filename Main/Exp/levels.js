// ===================================
// 🎮 MindCraft Level & XP System (Main/Exp/levels.js) – Improved
// ===================================

// --- GLOBAL XP CONSTANTS ---
const XP_CAP_DEFAULT = 100;
const XP_CAP_MULTIPLIER = 1.25;

// ===================================
// 🛠️ Core XP Calculation Function (Global)
function awardXP(amount) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        console.warn("Cannot award XP: No user logged in.");
        return;
    }

    let xp = parseInt(localStorage.getItem(`${currentUser}_xp`)) || 0;
    let level = parseInt(localStorage.getItem(`${currentUser}_level`)) || 1;
    let xpMax = parseInt(localStorage.getItem(`${currentUser}_xpMax`)) || XP_CAP_DEFAULT;

    xp += amount;

    let leveledUp = false;
    while (xp >= xpMax) {
        xp -= xpMax;
        level++;
        xpMax = Math.floor(xpMax * XP_CAP_MULTIPLIER);
        leveledUp = true;
    }

    localStorage.setItem(`${currentUser}_xp`, xp);
    localStorage.setItem(`${currentUser}_level`, level);
    localStorage.setItem(`${currentUser}_xpMax`, xpMax);

    window.dispatchEvent(new Event('storage'));

    if (leveledUp) {
        // Instead of alert, show a subtle message in the UI (if exists)
        const levelMsg = document.getElementById('levelUpMessage');
        if (levelMsg) {
            levelMsg.textContent = `🎉 Congrats! You reached Level ${level}!`;
            levelMsg.style.opacity = '1';
            setTimeout(() => { levelMsg.style.opacity = '0'; }, 3500);
        } else {
            console.log(`🎉 Congrats ${currentUser}! Level ${level}`);
        }
    }
}

window.awardXP = awardXP;

// --- Helper Functions ---
window.gainLessonXP = () => awardXP(10);
window.gainQuizXP = (isCorrect) => { if (isCorrect) awardXP(5); };

// ===================================
// 🖥️ XP Display Logic
function initializeXPDisplay() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const xpValue = document.getElementById('xpValue');
    const xpBar = document.getElementById('xpBar');
    const levelValue = document.getElementById('levelValue');

    if (!xpBar || !xpValue || !levelValue) return;

    let level = parseInt(localStorage.getItem(`${currentUser}_level`)) || 1;
    let xp = parseInt(localStorage.getItem(`${currentUser}_xp`)) || 0;
    let xpMax = parseInt(localStorage.getItem(`${currentUser}_xpMax`)) || XP_CAP_DEFAULT;
    let displayedXP = xp;
    let displayedLevel = level;

    function updateLocalVars() {
        level = parseInt(localStorage.getItem(`${currentUser}_level`)) || 1;
        xp = parseInt(localStorage.getItem(`${currentUser}_xp`)) || 0;
        xpMax = parseInt(localStorage.getItem(`${currentUser}_xpMax`)) || XP_CAP_DEFAULT;
    }

    function animateXP() {
        if (displayedLevel !== level) {
            displayedXP = 0;
            displayedLevel = level;
        }

        if (displayedXP < xp) {
            displayedXP += Math.ceil((xp - displayedXP) * 0.1) || 1;
            if (displayedXP > xp) displayedXP = xp;
        } else if (displayedXP > xp) {
            displayedXP = xp;
        }

        xpValue.textContent = `${Math.floor(displayedXP)}/${xpMax}`;
        xpBar.value = displayedXP;
        xpBar.max = xpMax;
        levelValue.textContent = displayedLevel;

        requestAnimationFrame(animateXP);
    }

    function highlightXPBar() {
        xpBar.classList.add('xp-updated');
        setTimeout(() => xpBar.classList.remove('xp-updated'), 1200);
    }

    window.resetXP = function() {
        localStorage.setItem(`${currentUser}_xp`, 0);
        localStorage.setItem(`${currentUser}_level`, 1);
        localStorage.setItem(`${currentUser}_xpMax`, XP_CAP_DEFAULT);
        window.dispatchEvent(new Event('storage'));
        updateLocalVars();
    }

    window.addEventListener('storage', (e) => {
        if (e.key && (e.key.includes('_xp') || e.key.includes('_level'))) {
            updateLocalVars();
            highlightXPBar();
        }
    });

    updateLocalVars();
    animateXP();
}

// Initialize display
initializeXPDisplay();
