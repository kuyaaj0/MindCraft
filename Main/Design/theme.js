// =============================
// 🌗 Global Theme Loader (Dark/Light) + Environment Sync (Main/Design/theme.js)
// =============================
(function() {
  // Use 'dark' as default if nothing is saved
  const savedTheme = localStorage.getItem('theme') || 'dark';
  const body = document.body;

  function applyTheme(theme) {
    const containers = document.querySelectorAll(
      '.container, .settings-container, .quiz-container, .lesson-content, .language-card, header, footer, nav'
    );
    const buttons = document.querySelectorAll('button, select, a');
    const texts = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, label, option');

    if (theme === 'dark') {
      // Dark Mode Styles
      body.style.background = 'linear-gradient(180deg, #0f2027, #203a43, #2c5364)';
      body.style.color = '#ffffff';

      containers.forEach(c => {
        c.style.background = 'rgba(0,0,0,0.5)';
        c.style.color = '#ffffff';
        c.style.boxShadow = '0 0 15px #1DB954';
        c.style.border = 'none';
      });

      buttons.forEach(btn => {
        btn.style.background = '#1DB954';
        btn.style.color = '#ffffff';
        btn.style.border = 'none';
      });

      texts.forEach(t => {
        t.style.color = '#ffffff';
      });

    } else {
      // Light Mode Styles
      body.style.background = '#f5f5f5';
      body.style.color = '#000000';

      containers.forEach(c => {
        c.style.background = '#ffffff';
        c.style.color = '#000000';
        c.style.boxShadow = '0 0 10px #aaa';
        c.style.border = '1px solid #ddd';
      });

      buttons.forEach(btn => {
        btn.style.background = '#1DB954';
        btn.style.color = '#ffffff';
        btn.style.border = 'none';
      });

      texts.forEach(t => {
        t.style.color = '#000000';
      });
    }

    // 🔄 Save preference and sync with environment system (defined in index.html)
    localStorage.setItem('theme', theme);
    
    // Check if the environment function exists before calling it
    if (typeof window.applyEnvironment === 'function') {
      window.applyEnvironment(theme, true); 
    }
  }

  // Apply saved theme immediately
  applyTheme(savedTheme);

  // Reapply when theme changes elsewhere (e.g. Settings page)
  window.addEventListener('storage', e => {
    if (e.key === 'theme') applyTheme(e.newValue);
  });

  // Global access for Settings or any page to set the theme
  window.setTheme = applyTheme;
})();
