<?php
session_start();

// Redirect if not logged in
if (!isset($_SESSION['Username'])) {
    header("Location: signin.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Account - MindCraft</title>
<link rel="stylesheet" href="../Design/style.css">
<style>
body { font-family:'Poppins',sans-serif; text-align:center; background:#203a43; color:white; }
.container { margin-top:50px; background:rgba(0,0,0,0.4); padding:20px; border-radius:12px; max-width:500px; margin:auto; }
h2 { margin-bottom:15px; }
button { padding:10px 20px; border:none; border-radius:8px; background:#1DB954; color:white; cursor:pointer; }
button:hover { background:#1ed760; }
</style>
</head>
<body>
<div class="container">
  <h2>👤 Account Information</h2>
  <p><b>Username:</b> <?= $_SESSION['Username'] ?></p>
  <p><b>Level:</b> <?= $_SESSION['Level'] ?? 1 ?></p>
  <p><b>XP:</b> <?= $_SESSION['XP'] ?? 0 ?></p>

  <a href="../Settings/settings.php"><button>⚙️ Settings</button></a>
  <a href="../Settings/logout.php"><button>🚪 Logout</button></a>
</div>
</body>
</html>
