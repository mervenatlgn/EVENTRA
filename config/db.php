<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$servername = "localhost";
$username = "root";
$password = ""; // Varsa şifreni yaz
$database = "eventra"; // Veritabanı adın

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("DB config Bağlantı hatası: " . $conn->connect_error);
}
?>
