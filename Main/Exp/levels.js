// ===================================
// 🎮 MindCraft Level & XP System (Main/Exp/levels.js)
// ===================================

// --- GLOBAL XP CONSTANTS ---
const XP_CAP_DEFAULT = 100;
const XP_CAP_MULTIPLIER = 1.25;

// ===================================
// 🛠️ Core XP Calculation Function (Global)
//    Called by quiz/lesson pages to grant XP.
// ===================================
function awardXP(amount) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        console.warn("Cannot award XP: No user logged in.");
        return;
    }

    // 1. Get current saved values
    let xp = parseInt(localStorage.getItem(`${currentUser}_xp`)) || 0;
    let level = parseInt(localStorage.getItem(`${currentUser}_level`)) || 1;
    let xpMax = parseInt(localStorage.getItem(`${currentUser}_xpMax`)) || XP_CAP_DEFAULT;

    // 2. Add new XP
    xp += amount;

    // 3. Handle leveling up (The crucial loop)
    let leveledUp = false;
    while (xp >= xpMax) {
        xp -= xpMax;
        level++;
        // Increase XP requirement dynamically
        xpMax = Math.floor(xpMax * XP_CAP_MULTIPLIER); 
        leveledUp = true;
    }

    // 4. Save the new, correct values
    localStorage.setItem(`${currentUser}_xp`, xp);
    localStorage.setItem(`${currentUser}_level`, level);
    localStorage.setItem(`${currentUser}_xpMax`, xpMax);

    // 5. Trigger update on all open windows/tabs (for index.html UI refresh)
    window.dispatchEvent(new Event('storage'));

    // 6. Show level up message
    if (leveledUp) {
        setTimeout(() => {
            alert(`🎉 Congratulations ${currentUser}! You reached Level ${level}!`);
        }, 300);
    }
}

// Make the core function globally accessible
window.awardXP = awardXP;

// 🧪 Helper Functions for ease of use in other files
window.gainLessonXP = function() {
    awardXP(10); // Example: XP per lesson completion
}

window.gainQuizXP = function(isCorrect) {
    if (isCorrect) awardXP(5); // Example: XP per correct quiz answer
}

// ===================================
// 🖥️ UI Display Management (Only runs on pages with XP bars/displays, like index.html)
// ===================================

function initializeXPDisplay() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    // --- UI elements ---
    const xpValue = document.getElementById('xpValue');
    const xpBar = document.getElementById('xpBar');
    const levelValue = document.getElementById('levelValue');

    // Stop if UI elements don't exist (i.e., we are on a lesson page)
    if (!xpBar || !xpValue || !levelValue) return;

    // --- Local Variables for Smooth Display ---
    let level = parseInt(localStorage.getItem(`${currentUser}_level`)) || 1;
    let xp = parseInt(localStorage.getItem(`${currentUser}_xp`)) || 0;
    let xpMax = parseInt(localStorage.getItem(`${currentUser}_xpMax`)) || XP_CAP_DEFAULT;
    let displayedXP = xp;
    let displayedLevel = level;

    // --- Helper function to retrieve and update local variables from storage ---
    function updateLocalVars() {
        level = parseInt(localStorage.getItem(`${currentUser}_level`)) || 1;
        xp = parseInt(localStorage.getItem(`${currentUser}_xp`)) || 0;
        xpMax = parseInt(localStorage.getItem(`${currentUser}_xpMax`)) || XP_CAP_DEFAULT;
    }
    
    // ===============================
    // 🔄 Animation Loop for XP bar (smooth transition)
    // ===============================
    function animateXP() {
        // ⭐ FIX: Reset displayedXP to 0 when leveling up for visual "reset" effect
        if (displayedLevel !== level) {
            displayedXP = 0; // Visually reset bar to 0 before animating to new XP
            displayedLevel = level;
        }

        // Smoothly move displayed XP towards actual saved XP
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
    
    // ===============================
    // 💡 Highlight XP bar when updated
    // ===============================
    function highlightXPBar() {
        xpBar.style.transition = 'box-shadow 0.5s ease';
        xpBar.style.boxShadow = '0 0 15px #1DB954';
        setTimeout(() => {
            xpBar.style.boxShadow = 'none';
        }, 2000);
    }

    // ===============================
    // ♻️ Reset XP (for testing/admin use)
    // ===============================
    window.resetXP = function() {
        localStorage.setItem(`${currentUser}_xp`, 0);
        localStorage.setItem(`${currentUser}_level`, 1);
        localStorage.setItem(`${currentUser}_xpMax`, XP_CAP_DEFAULT);
        window.dispatchEvent(new Event('storage')); // Trigger update
        updateLocalVars();
    }

    // --- EVENT LISTENERS ---
    // Listen for XP changes from any tab/window
    window.addEventListener('storage', (e) => {
        if (e.key && (e.key.includes('_xp') || e.key.includes('_level'))) {
            updateLocalVars();
            highlightXPBar();
        }
    });

    // --- Start Animation ---
    updateLocalVars();
    animateXP();
}

// Initialize the display logic when the script loads
initializeXPDisplay();
