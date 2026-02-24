// MindCraft global theme engine
(function () {
  const body = document.body;

  const SELECTORS = {
    containers: '.container, .settings-container, .quiz-container, .lesson-content, .account-card',
    buttons: 'button, select, a',
    texts: 'h1, h2, h3, h4, h5, h6, p, span, label, option, .title, .subtitle, .setting-label, .small-note, .info-label, .info-value, .xp-label, .xp-numbers',
    clouds: '.cloud',
    suns: '.sun',
    accountRows: '.info-row',
    accountTopBars: '.top-bar',
    accountFooters: '.page-footer',
    accountRanks: '.rank-panel',
    accountRankTitles: '#rankTitle'
  };

  const THEME = {
    dark: {
      bodyBg: 'radial-gradient(circle at top right, #1a1a2e 0%, #0f2027 60%, #0b132b 100%)',
      bodyColor: '#e3e9ff', text: '#f7ead7',
      containerBg: 'rgba(10, 15, 25, 0.65)', containerBorder: '1px solid rgba(100,150,255,0.2)', containerShadow: '0 0 20px rgba(80,150,255,0.35)', blur: 'blur(8px)',
      buttonBg: 'linear-gradient(to bottom, #c9945a, #a67d4a)',
      cloudBg: 'rgba(170, 190, 220, 0.35)', cloudShadow: '0 6px 20px rgba(30, 45, 70, 0.45)', cloudOpacity: '0.8',
      sunBg: 'radial-gradient(circle at 35% 35%, #c5d8ff 0%, #8fb2ff 35%, #5c84db 70%, #3a5fb3 100%)', sunShadow: '0 0 35px rgba(95, 140, 230, 0.35)',
      rowBg: 'rgba(18, 24, 36, 0.78)', rowBorder: '1px solid rgba(151, 180, 230, 0.25)',
      topBarBg: 'linear-gradient(to bottom, #1d2a44 0%, #151f33 100%)', topBarBorder: '3px solid #2c3f66',
      footerBg: 'linear-gradient(to top, #151f33, #1d2a44)', footerBorder: '2px solid #2c3f66', footerColor: '#f7ead7',
      rankBg: 'linear-gradient(90deg,#24334f,#1a2740)', rankBorder: '2px solid #5a79b8', rankColor: '#f7ead7',
      rankTitleColor: '#ffd36b', rankTitleWeight: '800', rankTitleShadow: '0 0 8px rgba(255,211,107,0.25)'
    },
    light: {
      bodyBg: 'linear-gradient(to bottom right, #c8f7b0, #a0ecff, #e8fff8)',
      bodyColor: '#3b2a15', text: '#3b2a15',
      containerBg: 'rgba(255, 255, 255, 0.9)', containerBorder: '1px solid rgba(0,0,0,0.05)', containerShadow: '0 12px 25px rgba(0,0,0,0.15)', blur: 'blur(6px)',
      buttonBg: 'linear-gradient(to bottom, #c9945a, #a67d4a)',
      cloudBg: 'rgba(255,255,255,0.92)', cloudShadow: '0 6px 18px rgba(0,0,0,0.08)', cloudOpacity: '0.95',
      sunBg: 'radial-gradient(circle at 30% 30%, #fff9a8 0%, #fff07a 18%, #fff200 45%, #ffd800 100%)', sunShadow: '0 0 40px rgba(255,204,0,0.25)',
      rowBg: 'rgba(255,255,255,0.7)', rowBorder: '1px solid rgba(0,0,0,0.06)',
      topBarBg: 'linear-gradient(to bottom, #8b6f47 0%, #6b5636 100%)', topBarBorder: '3px solid #5a4a30',
      footerBg: 'linear-gradient(to top,#6b5636,#8b6f47)', footerBorder: '2px solid #5a4a30', footerColor: '#f4e4c1',
      rankBg: 'linear-gradient(90deg,#ffeaa7,#fff9e6)', rankBorder: '2px solid #c18f00', rankColor: '#5a3a1a',
      rankTitleColor: '#5a3a1a', rankTitleWeight: '700', rankTitleShadow: 'none'
    }
  };

  const setAll = (selector, fn) => document.querySelectorAll(selector).forEach(fn);

  function applyTheme(theme) {
    const t = theme === 'dark' ? THEME.dark : THEME.light;
    body.classList.toggle('theme-dark', theme === 'dark');
    body.classList.toggle('theme-light', theme !== 'dark');
    body.style.transition = 'background 0.5s ease, color 0.5s ease';
    body.style.background = t.bodyBg;
    body.style.color = t.bodyColor;

    setAll(SELECTORS.containers, (c) => { c.style.background = t.containerBg; c.style.color = t.bodyColor; c.style.boxShadow = t.containerShadow; c.style.border = t.containerBorder; c.style.backdropFilter = t.blur; });
    setAll(SELECTORS.buttons, (b) => { b.style.background = t.buttonBg; b.style.color = '#fff'; b.style.border = '3px solid #8a6a3a'; b.style.boxShadow = '0 4px 0 #6b3e1a'; });
    setAll(SELECTORS.texts, (x) => { x.style.color = t.text; });
    setAll(SELECTORS.clouds, (c) => { c.style.background = t.cloudBg; c.style.boxShadow = t.cloudShadow; c.style.opacity = t.cloudOpacity; });
    setAll(SELECTORS.suns, (s) => { s.style.background = t.sunBg; s.style.boxShadow = t.sunShadow; });

    setAll(SELECTORS.accountRows, (r) => { r.style.background = t.rowBg; r.style.border = t.rowBorder; });
    setAll(SELECTORS.accountTopBars, (b) => { b.style.background = t.topBarBg; b.style.borderBottom = t.topBarBorder; });
    setAll(SELECTORS.accountFooters, (f) => { f.style.background = t.footerBg; f.style.borderTop = t.footerBorder; f.style.color = t.footerColor; });
    setAll(SELECTORS.accountRanks, (r) => { r.style.background = t.rankBg; r.style.border = t.rankBorder; r.style.color = t.rankColor; });
    setAll(SELECTORS.accountRankTitles, (r) => { r.style.color = t.rankTitleColor; r.style.fontWeight = t.rankTitleWeight; r.style.textShadow = t.rankTitleShadow; });

    localStorage.setItem('theme', theme);
    if (typeof window.applyEnvironment === 'function') window.applyEnvironment(theme, true);
  }

  window.setTheme = applyTheme;
  applyTheme(localStorage.getItem('theme') || 'light');
  window.addEventListener('storage', (e) => { if (e.key === 'theme') applyTheme(e.newValue || 'light'); });

  document.addEventListener('DOMContentLoaded', () => {
    body.style.opacity = '0';
    body.style.transition = 'opacity 0.6s ease';
    requestAnimationFrame(() => { body.style.opacity = '1'; });
  });
})();
