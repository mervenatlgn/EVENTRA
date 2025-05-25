<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data['email'] ?? '');
$current_password = trim($data['current_password'] ?? '');
$new_password = trim($data['new_password'] ?? '');

if (!$email || !$current_password || !$new_password) {
    echo json_encode(['success' => false, 'message' => 'Tüm alanlar gereklidir.']);
    exit;
}

$conn = new mysqli("localhost", "root", "", "eventra");

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Veritabanı bağlantı hatası.']);
    exit;
}

// Kullanıcıyı al
$stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
    if (!password_verify($current_password, $user['password'])) {
        echo json_encode(['success' => false, 'message' => 'Mevcut şifre yanlış.']);
        exit;
    }

    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

    // Şifreyi güncelle
    $update = $conn->prepare("UPDATE users SET password = ?, changed_password = 1 WHERE id = ?");
    $update->bind_param("si", $hashed_password, $user['id']);

    if ($update->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Şifre güncellenemedi.']);
    }

    $update->close();

} else {
    echo json_encode(['success' => false, 'message' => 'Kullanıcı bulunamadı.']);
}

$stmt->close();
$conn->close();
?>
