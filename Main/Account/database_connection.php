<?php
$host = "localhost";     // or your host
$user = "root";          // your MySQL username
$pass = "";              // your MySQL password
$dbname = "mindcraft_db"; // your database name

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
?>
