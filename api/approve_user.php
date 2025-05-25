<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Kullanıcı ID eksik veya geçersiz']);
    exit;
}

$conn = new mysqli("localhost", "root", "", "eventra");
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Veritabanı bağlantı hatası: ' . $conn->connect_error]);
    exit;
}

$user_id = intval($data['user_id']);

$stmt = $conn->prepare("UPDATE users SET is_approved = 1 WHERE id = ?");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Hazırlama hatası: ' . $conn->error]);
    exit;
}

$stmt->bind_param("i", $user_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Güncelleme hatası: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
