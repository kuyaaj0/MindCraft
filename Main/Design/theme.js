// =============================
// 🌗 Global Theme Loader (Dark/Light) + Environment Sync
// =============================
(function() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  const body = document.body;

  function applyTheme(theme) {
    const containers = document.querySelectorAll(
      '.container, .settings-container, .quiz-container, .lesson-content, .language-card, header, footer, nav'
    );
    const buttons = document.querySelectorAll('button, select, a');
    const texts = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, label, option');

    // Detect specific pages
    const isStudentPage = window.location.pathname.toLowerCase().includes('student.html');
    const isAccountPage = window.location.pathname.toLowerCase().includes('account.html');

    if (theme === 'dark') {
      // 🌑 DARK MODE
      if (isStudentPage) {
        // Student Page - Forest Night Theme
        body.style.background = 'linear-gradient(180deg, #0b1a0b 0%, #1f3d1f 100%)';
        body.style.color = '#e0d6b4';
      } else if (isAccountPage) {
        // Account Page - Deep Bronze + Teal Glow Theme
        body.style.background = 'linear-gradient(180deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
        body.style.color = '#e0d6b4';
      } else {
        // Default dark theme
        body.style.background = 'linear-gradient(180deg, #0f2027, #203a43, #2c5364)';
        body.style.color = '#ffffff';
      }

      containers.forEach(c => {
        if (isAccountPage) {
          c.style.background = 'rgba(0,0,0,0.6)';
          c.style.color = '#f4e3b2';
          c.style.boxShadow = '0 0 15px rgba(29,185,84,0.5)';
          c.style.border = '1px solid rgba(255,255,255,0.1)';
        } else {
          c.style.background = 'rgba(0,0,0,0.5)';
          c.style.color = '#ffffff';
          c.style.boxShadow = '0 0 15px #1DB954';
          c.style.border = 'none';
        }
      });

      buttons.forEach(btn => {
        if (isAccountPage) {
          btn.style.background = '#1DB954';
          btn.style.color = '#fff';
          btn.style.border = 'none';
          btn.style.boxShadow = '0 4px 0 #10783a';
        } else {
          btn.style.background = '#1DB954';
          btn.style.color = '#ffffff';
          btn.style.border = 'none';
        }
      });

      texts.forEach(t => {
        t.style.color = isAccountPage ? '#f5eecf' : '#ffffff';
      });

    } else {
      // ☀️ LIGHT MODE
      if (isStudentPage) {
        // Student Page - Sky & Grass
        body.style.background = 'linear-gradient(180deg, #a0c4ff 0%, #d4edc4 100%)';
        body.style.color = '#3b2a15';
      } else if (isAccountPage) {
        // Account Page - Sky Mint Style
        body.style.background = 'linear-gradient(180deg, #c8f7b0 0%, #a0ecff 100%)';
        body.style.color = '#3b2a15';
      } else {
        // Default light theme
        body.style.background = '#f5f5f5';
        body.style.color = '#000000';
      }

      containers.forEach(c => {
        if (isAccountPage) {
          c.style.background = 'rgba(255,255,255,0.9)';
          c.style.color = '#3b2a15';
          c.style.boxShadow = '0 12px 25px rgba(0,0,0,0.15)';
          c.style.border = '1px solid rgba(0,0,0,0.05)';
        } else {
          c.style.background = '#ffffff';
          c.style.color = '#000000';
          c.style.boxShadow = '0 0 10px #aaa';
          c.style.border = '1px solid #ddd';
        }
      });

      buttons.forEach(btn => {
        if (isAccountPage) {
          btn.style.background = '#b8783d';
          btn.style.color = '#fff';
          btn.style.border = 'none';
          btn.style.boxShadow = '0 4px 0 #6b3e1a';
        } else {
          btn.style.background = '#1DB954';
          btn.style.color = '#ffffff';
          btn.style.border = 'none';
        }
      });

      texts.forEach(t => {
        t.style.color = isAccountPage ? '#3b2a15' : '#000000';
      });
    }

    // ✅ Save theme + sync
    localStorage.setItem('theme', theme);
    if (typeof window.applyEnvironment === 'function') {
      window.applyEnvironment(theme, true);
    }
  }

  // Apply theme immediately
  applyTheme(savedTheme);

  // React to theme change (e.g., via Settings)
  window.addEventListener('storage', e => {
    if (e.key === 'theme') applyTheme(e.newValue);
  });

  // Global access
  window.setTheme = applyTheme;
})();
