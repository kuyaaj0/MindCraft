<?php
session_start();

// Redirect if not logged in
if (!isset($_SESSION['Username'])) {
    header("Location: Signin.php");
    exit;
}

// Fetch current settings from session or defaults
$theme = isset($_SESSION['theme']) ? $_SESSION['theme'] : 'dark';
$sound = isset($_SESSION['sound']) ? $_SESSION['sound'] : 'on';
$vibration = isset($_SESSION['vibration']) ? $_SESSION['vibration'] : 'on';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['theme'])) {
        $_SESSION['theme'] = $_POST['theme'];
        $theme = $_POST['theme'];
    }
    if (isset($_POST['sound'])) {
        $_SESSION['sound'] = $_POST['sound'];
        $sound = $_POST['sound'];
    }
    if (isset($_POST['vibration'])) {
        $_SESSION['vibration'] = $_POST['vibration'];
        $vibration = $_POST['vibration'];
    }
    if (isset($_POST['logout'])) {
        session_destroy();
        header("Location: Signin.php");
        exit;
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Settings - MindCraft</title>
<link rel="stylesheet" href="../Design/style.css">

<style>
body {
    font-family: 'Poppins', sans-serif;
    margin:0; padding:0;
    background: <?= $theme === 'dark' ? '#203a43' : '#f5f5f5' ?>;
    color: <?= $theme === 'dark' ? '#fff' : '#000' ?>;
    text-align: center;
}
.settings-container {
    max-width: 600px;
    margin: 50px auto;
    padding: 20px;
    background: <?= $theme === 'dark' ? 'rgba(0,0,0,0.4)' : '#eee' ?>;
    border-radius: 12px;
}
button, select {
    margin: 10px;
    padding: 10px 20px;
    font-size: 1em;
    border-radius: 10px;
    cursor: pointer;
}
button { background:#1DB954; color:#fff; border:none; }
button:hover { background:#1ed760; }
</style>
</head>
<body>

<div class="settings-container">
    <h2>Settings</h2>

    <form method="POST">
        <label>Theme:</label>
        <select name="theme" onchange="this.form.submit()">
            <option value="dark" <?= $theme==='dark'?'selected':'' ?>>Dark</option>
            <option value="light" <?= $theme==='light'?'selected':'' ?>>Light</option>
        </select>
        <br>

        <label>Sound:</label>
        <select name="sound" onchange="this.form.submit()">
            <option value="on" <?= $sound==='on'?'selected':'' ?>>On</option>
            <option value="off" <?= $sound==='off'?'selected':'' ?>>Off</option>
        </select>
        <br>

        <label>Vibration:</label>
        <select name="vibration" onchange="this.form.submit()">
            <option value="on" <?= $vibration==='on'?'selected':'' ?>>On</option>
            <option value="off" <?= $vibration==='off'?'selected':'' ?>>Off</option>
        </select>
        <br>

        <button type="submit" name="logout">Logout</button>
    </form>
</div>

<script>
// Optional: Store preferences in localStorage for JS
localStorage.setItem('theme', '<?= $theme ?>');
localStorage.setItem('sound', '<?= $sound ?>');
localStorage.setItem('vibration', '<?= $vibration ?>');
</script>

</body>
</html>
