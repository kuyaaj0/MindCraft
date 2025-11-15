<?php
session_start();
include 'db_connect.php';

$message = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $checkUser = $conn->prepare("SELECT * FROM users WHERE username = ?");
    $checkUser->bind_param("s", $username);
    $checkUser->execute();
    $result = $checkUser->get_result();

    if ($result->num_rows > 0) {
        $message = "❌ Username already exists!";
    } else {
        $insert = $conn->prepare("INSERT INTO users (username, password, level, xp) VALUES (?, ?, 1, 0)");
        $insert->bind_param("ss", $username, $password);
        if ($insert->execute()) {
            $message = "✅ Account created! You can now sign in.";
        } else {
            $message = "❌ Error creating account.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign Up - MindCraft</title>
<link rel="stylesheet" href="../Design/style.css">
<style>
body { font-family:'Poppins',sans-serif; text-align:center; background:#203a43; color:white; }
input { padding:10px; width:70%; margin:10px; border-radius:8px; border:none; }
button { padding:10px 20px; border:none; border-radius:8px; background:#1DB954; color:white; cursor:pointer; }
button:hover { background:#1ed760; }
</style>
</head>
<body>
<h2>🧠 MindCraft - Sign Up</h2>
<form method="POST">
  <input type="text" name="username" placeholder="Enter username" required><br>
  <input type="password" name="password" placeholder="Enter password" required><br>
  <button type="submit">Create Account</button>
</form>
<p><?= $message ?></p>
<p>Already have an account? <a href="Signin.php" style="color:#1DB954;">Sign in here</a>.</p>
</body>
</html>
