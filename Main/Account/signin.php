<?php
session_start();
include 'database_connection.php';

$message = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    $query = $conn->prepare("SELECT * FROM users WHERE username = ?");
    $query->bind_param("s", $username);
    $query->execute();
    $result = $query->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            $_SESSION['Username'] = $user['username'];
            $_SESSION['Level'] = $user['level'];
            $_SESSION['XP'] = $user['xp'];
            header("Location: account.php");
            exit;
        } else {
            $message = "❌ Invalid password!";
        }
    } else {
        $message = "❌ User not found!";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign In - MindCraft</title>
<link rel="stylesheet" href="../Design/style.css">
<style>
body { font-family:'Poppins',sans-serif; text-align:center; background:#203a43; color:white; }
input { padding:10px; width:70%; margin:10px; border-radius:8px; border:none; }
button { padding:10px 20px; border:none; border-radius:8px; background:#1DB954; color:white; cursor:pointer; }
button:hover { background:#1ed760; }
</style>
</head>
<body>
<h2>🧠 MindCraft - Sign In</h2>
<form method="POST">
  <input type="text" name="username" placeholder="Enter username" required><br>
  <input type="password" name="password" placeholder="Enter password" required><br>
  <button type="submit">Sign In</button>
</form>
<p><?= $message ?></p>
<p>Don’t have an account? <a href="signup.php" style="color:#1DB954;">Sign up here</a>.</p>
</body>
</html>
