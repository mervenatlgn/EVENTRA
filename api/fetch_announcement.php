<?php
// geliştirme ortamında kullanılır, hata ayıklamaya yarar.
ini_set('display_errors', 1);
error_reporting(E_ALL);
// CORS ayarları (Cross-Origin Resouce Sharing)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$host = "localhost";
$dbname = "eventra";
$user = "root";
$pass = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query("SELECT id, title, message FROM announcements ORDER BY id DESC");
    $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // JSON olarak döndür
    echo json_encode($announcements);

} catch (PDOException $e) {
    echo json_encode([]);
}
