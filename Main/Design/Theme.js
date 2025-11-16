// =============================
// 🌗 Global Theme Loader (Dark/Light)
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

    if (theme === 'dark') {
      // Body
      body.style.background = '#0f2027';
      body.style.color = '#ffffff';

      // Containers and sections
      containers.forEach(c => {
        c.style.background = 'rgba(0,0,0,0.5)';
        c.style.color = '#ffffff';
        c.style.boxShadow = '0 0 15px #1DB954';
        c.style.border = 'none';
      });

      // Buttons
      buttons.forEach(btn => {
        btn.style.background = '#1DB954';
        btn.style.color = '#ffffff';
        btn.style.border = 'none';
      });

      // Text elements
      texts.forEach(t => {
        t.style.color = '#ffffff';
      });

    } else {
      // Light Mode
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
  }

  // Apply saved theme immediately
  applyTheme(savedTheme);

  // Reapply when theme changes anywhere
  window.addEventListener('storage', e => {
    if (e.key === 'theme') applyTheme(e.newValue);
  });
})();
