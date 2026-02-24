// ===========================================================
// 🌗 MindCraft Global Theme Loader (Dark/Light)
// File: Main/Design/theme.js
// Purpose:
// - Keep one global theme source of truth
// - Apply consistent dark/light visuals across pages
// - Preserve special account page styling (rank/title/topbar/footer)
// ===========================================================

(function () {
  const body = document.body;

  // ---------------------------------------------------------
  // Selectors: grouped so the theme logic is easy to maintain
  // ---------------------------------------------------------
  const SELECTORS = {
    containers: '.container, .settings-container, .quiz-container, .lesson-content, .account-card',
    buttons: 'button, select, a',
    texts:
      'h1, h2, h3, h4, h5, h6, p, span, label, option, ' +
      '.title, .subtitle, .setting-label, .small-note, ' +
      '.info-label, .info-value, .xp-label, .xp-numbers',
    clouds: '.cloud',
    suns: '.sun',

    // Account-specific
    accountRows: '.info-row',
    accountTopBars: '.top-bar',
    accountFooters: '.page-footer',
    accountRanks: '.rank-panel',
    accountRankTitles: '#rankTitle'
  };

  // ---------------------------------------------------------
  // Theme palette map
  // ---------------------------------------------------------
  const THEME = {
    dark: {
      bodyBg: 'radial-gradient(circle at top right, #1a1a2e 0%, #0f2027 60%, #0b132b 100%)',
      bodyColor: '#e3e9ff',
      text: '#f7ead7',

      containerBg: 'rgba(10, 15, 25, 0.65)',
      containerBorder: '1px solid rgba(100,150,255,0.2)',
      containerShadow: '0 0 20px rgba(80,150,255,0.35)',
      blur: 'blur(8px)',

      buttonBg: 'linear-gradient(to bottom, #c9945a, #a67d4a)',

      cloudBg: 'rgba(170, 190, 220, 0.35)',
      cloudShadow: '0 6px 20px rgba(30, 45, 70, 0.45)',
      cloudOpacity: '0.8',

      sunBg: 'radial-gradient(circle at 35% 35%, #c5d8ff 0%, #8fb2ff 35%, #5c84db 70%, #3a5fb3 100%)',
      sunShadow: '0 0 35px rgba(95, 140, 230, 0.35)',

      rowBg: 'rgba(18, 24, 36, 0.78)',
      rowBorder: '1px solid rgba(151, 180, 230, 0.25)',

      topBarBg: 'linear-gradient(to bottom, #1d2a44 0%, #151f33 100%)',
      topBarBorder: '3px solid #2c3f66',

      footerBg: 'linear-gradient(to top, #151f33, #1d2a44)',
      footerBorder: '2px solid #2c3f66',
      footerColor: '#f7ead7',

      rankBg: 'linear-gradient(90deg,#24334f,#1a2740)',
      rankBorder: '2px solid #5a79b8',
      rankColor: '#f7ead7',

      rankTitleColor: '#ffd36b',
      rankTitleWeight: '800',
      rankTitleShadow: '0 0 8px rgba(255,211,107,0.25)'
    },

    light: {
      bodyBg: 'linear-gradient(to bottom right, #c8f7b0, #a0ecff, #e8fff8)',
      bodyColor: '#3b2a15',
      text: '#3b2a15',

      containerBg: 'rgba(255, 255, 255, 0.9)',
      containerBorder: '1px solid rgba(0,0,0,0.05)',
      containerShadow: '0 12px 25px rgba(0,0,0,0.15)',
      blur: 'blur(6px)',

      buttonBg: 'linear-gradient(to bottom, #c9945a, #a67d4a)',

      cloudBg: 'rgba(255,255,255,0.92)',
      cloudShadow: '0 6px 18px rgba(0,0,0,0.08)',
      cloudOpacity: '0.95',

      sunBg: 'radial-gradient(circle at 30% 30%, #fff9a8 0%, #fff07a 18%, #fff200 45%, #ffd800 100%)',
      sunShadow: '0 0 40px rgba(255,204,0,0.25)',

      rowBg: 'rgba(255,255,255,0.7)',
      rowBorder: '1px solid rgba(0,0,0,0.06)',

      topBarBg: 'linear-gradient(to bottom, #8b6f47 0%, #6b5636 100%)',
      topBarBorder: '3px solid #5a4a30',

      footerBg: 'linear-gradient(to top,#6b5636,#8b6f47)',
      footerBorder: '2px solid #5a4a30',
      footerColor: '#f4e4c1',

      rankBg: 'linear-gradient(90deg,#ffeaa7,#fff9e6)',
      rankBorder: '2px solid #c18f00',
      rankColor: '#5a3a1a',

      rankTitleColor: '#5a3a1a',
      rankTitleWeight: '700',
      rankTitleShadow: 'none'
    }
  };

  function setAll(selector, applyFn) {
    document.querySelectorAll(selector).forEach(applyFn);
  }

  function applyTheme(theme) {
    const currentTheme = theme === 'dark' ? 'dark' : 'light';
    const t = THEME[currentTheme];

    body.classList.toggle('theme-dark', currentTheme === 'dark');
    body.classList.toggle('theme-light', currentTheme === 'light');
    body.style.transition = 'background 0.5s ease, color 0.5s ease';
    body.style.background = t.bodyBg;
    body.style.color = t.bodyColor;

    setAll(SELECTORS.containers, (el) => {
      el.style.background = t.containerBg;
      el.style.color = t.bodyColor;
      el.style.boxShadow = t.containerShadow;
      el.style.border = t.containerBorder;
      el.style.backdropFilter = t.blur;
    });

    setAll(SELECTORS.buttons, (el) => {
      el.style.background = t.buttonBg;
      el.style.color = '#fff';
      el.style.border = '3px solid #8a6a3a';
      el.style.boxShadow = '0 4px 0 #6b3e1a';
    });

    setAll(SELECTORS.texts, (el) => { el.style.color = t.text; });

    setAll(SELECTORS.clouds, (el) => {
      el.style.background = t.cloudBg;
      el.style.boxShadow = t.cloudShadow;
      el.style.opacity = t.cloudOpacity;
    });

    setAll(SELECTORS.suns, (el) => {
      el.style.background = t.sunBg;
      el.style.boxShadow = t.sunShadow;
    });

    // Account-specific sections
    setAll(SELECTORS.accountRows, (el) => { el.style.background = t.rowBg; el.style.border = t.rowBorder; });
    setAll(SELECTORS.accountTopBars, (el) => { el.style.background = t.topBarBg; el.style.borderBottom = t.topBarBorder; });
    setAll(SELECTORS.accountFooters, (el) => {
      el.style.background = t.footerBg;
      el.style.borderTop = t.footerBorder;
      el.style.color = t.footerColor;
    });
    setAll(SELECTORS.accountRanks, (el) => {
      el.style.background = t.rankBg;
      el.style.border = t.rankBorder;
      el.style.color = t.rankColor;
    });
    setAll(SELECTORS.accountRankTitles, (el) => {
      el.style.color = t.rankTitleColor;
      el.style.fontWeight = t.rankTitleWeight;
      el.style.textShadow = t.rankTitleShadow;
    });

    localStorage.setItem('theme', currentTheme);
    if (typeof window.applyEnvironment === 'function') {
      window.applyEnvironment(currentTheme, true);
    }
  }

  // expose globally for pages that call setTheme(...)
  window.setTheme = applyTheme;

  // initial apply
  applyTheme(localStorage.getItem('theme') || 'light');

  // cross-tab updates
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme') applyTheme(e.newValue || 'light');
  });

  // smooth page fade-in
  document.addEventListener('DOMContentLoaded', () => {
    body.style.opacity = '0';
    body.style.transition = 'opacity 0.6s ease';
    requestAnimationFrame(() => { body.style.opacity = '1'; });
  });
})();
