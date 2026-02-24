// ===========================================================
// 🌗 MindCraft Global Theme Loader (Dark/Light)
// File: Design/theme.js
// Unified for all pages (Landing, Settings, Account, etc.)
// ===========================================================

(function() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  const body = document.body;

  function applyTheme(theme) {
    body.classList.toggle('theme-dark', theme === 'dark');
    body.classList.toggle('theme-light', theme !== 'dark');
    const containers = document.querySelectorAll(
      '.container, .settings-container, .quiz-container, .lesson-content, .account-card'
    );
    const buttons = document.querySelectorAll('button, select, a');
    const texts = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, label, option, .title, .subtitle, .setting-label, .small-note, .info-label, .info-value, .xp-label, .xp-numbers');
    const clouds = document.querySelectorAll('.cloud');
    const suns = document.querySelectorAll('.sun');

    const accountRows = document.querySelectorAll('.info-row');
    const accountTopBars = document.querySelectorAll('.top-bar');
    const accountFooters = document.querySelectorAll('.page-footer');
    const accountRanks = document.querySelectorAll('.rank-panel');

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

      // Texts (warmer + brighter for readability against dark cards)
      texts.forEach(t => {
        t.style.color = '#f7ead7';
      });

      // Sky decor in dark mode
      clouds.forEach(cloud => {
        cloud.style.background = 'rgba(170, 190, 220, 0.35)';
        cloud.style.boxShadow = '0 6px 20px rgba(30, 45, 70, 0.45)';
        cloud.style.opacity = '0.8';
      });
      suns.forEach(sun => {
        sun.style.background = 'radial-gradient(circle at 35% 35%, #c5d8ff 0%, #8fb2ff 35%, #5c84db 70%, #3a5fb3 100%)';
        sun.style.boxShadow = '0 0 35px rgba(95, 140, 230, 0.35)';
      });

      accountRows.forEach(row => {
        row.style.background = 'rgba(18, 24, 36, 0.78)';
        row.style.border = '1px solid rgba(151, 180, 230, 0.25)';
      });
      accountTopBars.forEach(bar => {
        bar.style.background = 'linear-gradient(to bottom, #1d2a44 0%, #151f33 100%)';
        bar.style.borderBottom = '3px solid #2c3f66';
      });
      accountFooters.forEach(footer => {
        footer.style.background = 'linear-gradient(to top, #151f33, #1d2a44)';
        footer.style.color = '#f7ead7';
        footer.style.borderTop = '2px solid #2c3f66';
      });
      accountRanks.forEach(rank => {
        rank.style.background = 'linear-gradient(90deg,#24334f,#1a2740)';
        rank.style.border = '2px solid #5a79b8';
        rank.style.color = '#f7ead7';
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

      clouds.forEach(cloud => {
        cloud.style.background = 'rgba(255,255,255,0.92)';
        cloud.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
        cloud.style.opacity = '0.95';
      });
      suns.forEach(sun => {
        sun.style.background = 'radial-gradient(circle at 30% 30%, #fff9a8 0%, #fff07a 18%, #fff200 45%, #ffd800 100%)';
        sun.style.boxShadow = '0 0 40px rgba(255,204,0,0.25)';
      });

      accountRows.forEach(row => {
        row.style.background = 'rgba(255,255,255,0.7)';
        row.style.border = '1px solid rgba(0,0,0,0.06)';
      });
      accountTopBars.forEach(bar => {
        bar.style.background = 'linear-gradient(to bottom, #8b6f47 0%, #6b5636 100%)';
        bar.style.borderBottom = '3px solid #5a4a30';
      });
      accountFooters.forEach(footer => {
        footer.style.background = 'linear-gradient(to top,#6b5636,#8b6f47)';
        footer.style.color = '#f4e4c1';
        footer.style.borderTop = '2px solid #5a4a30';
      });
      accountRanks.forEach(rank => {
        rank.style.background = 'linear-gradient(90deg,#ffeaa7,#fff9e6)';
        rank.style.border = '2px solid #c18f00';
        rank.style.color = '#5a3a1a';
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
