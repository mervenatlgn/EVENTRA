<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Veritabanı bağlantısı
$host = 'localhost';
$dbname = 'eventra';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Veritabanı bağlantısı başarısız: " . $e->getMessage()]);
    exit;
}

// POST verilerini al
$title = $_POST['title'] ?? '';
$message = $_POST['message'] ?? '';

if (trim($title) === '' || trim($message) === '') {
    echo json_encode(["success" => false, "message" => "Boş alan bırakmayınız."]);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO announcements (title, message, created_at) VALUES (?, ?, NOW())");
    $stmt->execute([$title, $message]);

    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Veritabanına kayıt sırasında hata: " . $e->getMessage()]);
}
?>
