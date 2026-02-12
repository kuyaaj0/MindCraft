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

    // ✅ Special background only for Student.html
    const isStudentPage = window.location.pathname.toLowerCase().includes('student.html');

    if (theme === 'dark') {
      // 🌑 DARK MODE
      if (isStudentPage) {
        // Dark forest/earthy look for Student page
        body.style.background = 'linear-gradient(180deg, #1a1a1a 0%, #2e4d2e 100%)';
        body.style.color = '#e0d6b4';
      } else {
        // Default dark mode for other pages
        body.style.background = 'linear-gradient(180deg, #0f2027, #203a43, #2c5364)';
        body.style.color = '#ffffff';
      }

      containers.forEach(c => {
        c.style.background = isStudentPage ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.5)';
        c.style.color = isStudentPage ? '#e0d6b4' : '#ffffff';
        c.style.boxShadow = isStudentPage ? '0 0 12px #5c915c' : '0 0 15px #1DB954';
        c.style.border = 'none';
      });

      buttons.forEach(btn => {
        btn.style.background = isStudentPage ? '#5c915c' : '#1DB954';
        btn.style.color = '#fff';
        btn.style.border = 'none';
      });

      texts.forEach(t => {
        t.style.color = isStudentPage ? '#e0d6b4' : '#ffffff';
      });

    } else {
      // ☀️ LIGHT MODE
      if (isStudentPage) {
        // Student page sky + grass theme
        body.style.background = 'linear-gradient(180deg, #a0c4ff 0%, #d4edc4 100%)';
        body.style.color = '#3b2a15';
      } else {
        // Default light theme for other pages
        body.style.background = '#f5f5f5';
        body.style.color = '#000000';
      }

      containers.forEach(c => {
        c.style.background = isStudentPage ? '#d4e0c7' : '#ffffff';
        c.style.color = isStudentPage ? '#3b2a15' : '#000';
        c.style.boxShadow = isStudentPage ? '0 8px 0 #5c915c' : '0 0 10px #aaa';
        c.style.border = isStudentPage ? '4px solid #5c915c' : '1px solid #ddd';
      });

      buttons.forEach(btn => {
        btn.style.background = isStudentPage ? '#d9b16c' : '#1DB954';
        btn.style.color = isStudentPage ? '#3b2a15' : '#fff';
        btn.style.border = isStudentPage ? '3px solid #a97c4b' : 'none';
      });

      texts.forEach(t => {
        t.style.color = isStudentPage ? '#3b2a15' : '#000000';
      });
    }

    // Save theme + sync across environment
    localStorage.setItem('theme', theme);
    if (typeof window.applyEnvironment === 'function') {
      window.applyEnvironment(theme, true);
    }
  }

  // Apply on load
  applyTheme(savedTheme);

  // Update on change
  window.addEventListener('storage', e => {
    if (e.key === 'theme') applyTheme(e.newValue);
  });

  // Global access
  window.setTheme = applyTheme;
})();
