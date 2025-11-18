// ============================
// 🔙 MindCraft Smart Navigation
// ============================

// Always finds your index.html at the root
function goToLobby() {
  // Find how many folders deep we are
  let depth = window.location.pathname.split('/').length - 2; // subtract 2 for domain + file
  let pathBack = '';
  for (let i = 0; i < depth - 1; i++) pathBack += '../';
  window.location.href = pathBack + 'index.html';
}
