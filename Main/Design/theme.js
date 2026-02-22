// ===========================================================
// 🌗 MindCraft Global Theme Loader (Dark/Light)
// File: Design/theme.js
// Unified for all pages (Landing, Settings, Account, etc.)
// ===========================================================

(function() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  const body = document.body;

  function applyTheme(theme) {
    const containers = document.querySelectorAll(
      '.container, .settings-container, .quiz-container, .lesson-content, .language-card, header, footer, nav'
    );
    const buttons = document.querySelectorAll('button, select, a');
    const texts = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, label, option');

    // ======================================================
    // 🌑 DARK MODE (Aurora Night with Transparent Glow)
    // ======================================================
    if (theme === 'dark') {
      body.style.transition = 'background 0.5s ease, color 0.5s ease';
      body.style.background = 'radial-gradient(circle at top right, #1a1a2e 0%, #0f2027 60%, #0b132b 100%)';
      body.style.color = '#e3e9ff';

      // Containers – keep transparency for visible sky/cloud background
      containers.forEach(c => {
        c.style.transition = 'all 0.4s ease';
        c.style.background = 'rgba(10, 15, 25, 0.65)'; // transparent dark bluish
        c.style.color = '#e3e9ff';
        c.style.boxShadow = '0 0 20px rgba(80,150,255,0.35)';
        c.style.border = '1px solid rgba(100,150,255,0.2)';
        c.style.backdropFilter = 'blur(8px)';
      });

      // Buttons – keep golden brown design
      buttons.forEach(btn => {
        btn.style.transition = 'all 0.3s ease';
        btn.style.background = 'linear-gradient(to bottom, #c9945a, #a67d4a)';
        btn.style.color = '#fff';
        btn.style.border = '3px solid #8a6a3a';
        btn.style.boxShadow = '0 4px 0 #6b3e1a';
      });

      // Texts
      texts.forEach(t => {
        t.style.color = '#e3e9ff';
      });
    }

    // ======================================================
    // ☀️ LIGHT MODE (Sky-Mint Cloud Style)
    // ======================================================
    else {
      body.style.transition = 'background 0.5s ease, color 0.5s ease';
      body.style.background = 'linear-gradient(to bottom right, #c8f7b0, #a0ecff, #e8fff8)';
      body.style.color = '#3b2a15';

      containers.forEach(c => {
        c.style.transition = 'all 0.4s ease';
        c.style.background = 'rgba(255, 255, 255, 0.9)';
        c.style.color = '#3b2a15';
        c.style.boxShadow = '0 12px 25px rgba(0,0,0,0.15)';
        c.style.border = '1px solid rgba(0,0,0,0.05)';
        c.style.backdropFilter = 'blur(6px)';
      });

      buttons.forEach(btn => {
        btn.style.transition = 'all 0.3s ease';
        btn.style.background = 'linear-gradient(to bottom, #c9945a, #a67d4a)';
        btn.style.color = '#fff';
        btn.style.border = '3px solid #8a6a3a';
        btn.style.boxShadow = '0 4px 0 #6b3e1a';
      });

      texts.forEach(t => {
        t.style.color = '#3b2a15';
      });
    }

    // ======================================================
    // 💾 Save preference + Environment Sync
    // ======================================================
    localStorage.setItem('theme', theme);
    if (typeof window.applyEnvironment === 'function') {
      window.applyEnvironment(theme, true);
    }
  }

  // Apply immediately
  applyTheme(savedTheme);

  // React to theme changes
  window.addEventListener('storage', e => {
    if (e.key === 'theme') applyTheme(e.newValue);
  });

  // Global access for theme switch
  window.setTheme = applyTheme;

  // Fade-in for smooth page load
  document.addEventListener('DOMContentLoaded', () => {
    body.style.opacity = '0';
    body.style.transition = 'opacity 0.6s ease';
    requestAnimationFrame(() => { body.style.opacity = '1'; });
  });

})();
