<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_secure', 'Off'); // HTTP için Off, HTTPS için On

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

session_start();

$conn = new mysqli('localhost', 'root', '', 'eventra');
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Veritabanı bağlantı hatası']);
    exit;
}

$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'Aktif kullanıcı yok']);
    exit;
}

$sql = "SELECT id, fullname, email, interests, is_approved, changed_password FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
    echo json_encode(['success' => true, 'user' => $user]);
} else {
    echo json_encode(['success' => false, 'message' => 'Kullanıcı bulunamadı']);
}

$stmt->close();
$conn->close();
?> 