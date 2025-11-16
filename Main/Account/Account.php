<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Account - MindCraft</title>
<link rel="stylesheet" href="../Design/style.css">
<style>
body {
  font-family: 'Poppins', sans-serif;
  text-align: center;
  background: #203a43;
  color: white;
}
.container {
  margin-top: 50px;
  background: rgba(0,0,0,0.4);
  padding: 20px;
  border-radius: 12px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}
h2 { margin-bottom: 15px; }
button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #1DB954;
  color: white;
  cursor: pointer;
  margin: 5px;
}
button:hover { background: #1ed760; }
</style>
</head>
<body>
<div class="container">
  <h2>👤 Account Information</h2>
  <p><b>Username:</b> <span id="username">Guest</span></p>
  <p><b>Level:</b> <span id="level">1</span></p>
  <p><b>XP:</b> <span id="xp">0</span></p>

  <button onclick="location.href='../Settings/settings.html'">⚙️ Settings</button>
  <button onclick="logout()">🚪 Logout</button>
</div>

<script>
// Check if user is "logged in" using localStorage
const username = localStorage.getItem('username');
if (!username) {
  alert('You must sign in first!');
  window.location.href = '../Account/signin.html';
}

// Display account info
document.getElementById('username').textContent = username || 'Guest';
document.getElementById('level').textContent = localStorage.getItem('level') || 1;
document.getElementById('xp').textContent = localStorage.getItem('xp') || 0;

// Logout function
function logout() {
  localStorage.removeItem('username');
  localStorage.removeItem('level');
  localStorage.removeItem('xp');
  window.location.href = '../Account/signin.html';
}
</script>
</body>
</html>
