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

    const isStudentPage = window.location.pathname.toLowerCase().includes('student.html');
    const isAccountPage = window.location.pathname.toLowerCase().includes('account.html');
    const isSettingsPage = window.location.pathname.toLowerCase().includes('setting.html');

    if (theme === 'dark') {
      // 🌑 DARK MODE
      if (isStudentPage) {
        // Forest Night
        body.style.background = 'linear-gradient(180deg, #0b1a0b 0%, #1f3d1f 100%)';
        body.style.color = '#e0d6b4';
      } else if (isAccountPage) {
        // Deep Bronze + Teal Glow
        body.style.background = 'linear-gradient(180deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
        body.style.color = '#f0e6c8';
      } else if (isSettingsPage) {
        // 🌌 NEW Midnight Aurora Theme
        body.style.background = 'radial-gradient(circle at top right, #2c1e4a 0%, #0b132b 60%, #03091e 100%)';
        body.style.color = '#e3e9ff';
      } else {
        // Default dark
        body.style.background = 'linear-gradient(180deg, #0f2027, #203a43, #2c5364)';
        body.style.color = '#ffffff';
      }

      containers.forEach(c => {
        if (isAccountPage) {
          c.style.background = 'rgba(0,0,0,0.6)';
          c.style.color = '#f4e3b2';
          c.style.boxShadow = '0 0 15px rgba(29,185,84,0.5)';
          c.style.border = '1px solid rgba(255,255,255,0.1)';
        } else if (isSettingsPage) {
          c.style.background = 'rgba(20, 20, 35, 0.7)';
          c.style.color = '#d6daff';
          c.style.boxShadow = '0 0 20px rgba(80,150,255,0.4)';
          c.style.border = '1px solid rgba(100,150,255,0.2)';
          c.style.backdropFilter = 'blur(8px)';
        } else {
          c.style.background = 'rgba(0,0,0,0.5)';
          c.style.color = '#ffffff';
          c.style.boxShadow = '0 0 15px #1DB954';
          c.style.border = 'none';
        }
      });

      buttons.forEach(btn => {
        if (isSettingsPage) {
          btn.style.background = 'linear-gradient(90deg, #5b68e3, #6ef2ff)';
          btn.style.color = '#fff';
          btn.style.border = 'none';
          btn.style.boxShadow = '0 4px 10px rgba(80,150,255,0.4)';
        } else if (isAccountPage) {
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
        if (isSettingsPage) {
          t.style.color = '#e3e9ff';
        } else if (isAccountPage) {
          t.style.color = '#f5eecf';
        } else {
          t.style.color = '#ffffff';
        }
      });

    } else {
      // ☀️ LIGHT MODE (unchanged)
      if (isStudentPage) {
        body.style.background = 'linear-gradient(180deg, #a0c4ff 0%, #d4edc4 100%)';
        body.style.color = '#3b2a15';
      } else if (isAccountPage) {
        body.style.background = 'linear-gradient(180deg, #c8f7b0 0%, #a0ecff 100%)';
        body.style.color = '#3b2a15';
      } else {
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

    // ✅ Save + Sync
    localStorage.setItem('theme', theme);
    if (typeof window.applyEnvironment === 'function') {
      window.applyEnvironment(theme, true);
    }
  }

  applyTheme(savedTheme);
  window.addEventListener('storage', e => {
    if (e.key === 'theme') applyTheme(e.newValue);
  });
  window.setTheme = applyTheme;
})();
