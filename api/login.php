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

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

// Admin kontrolü
if ($email === 'merve@gmail.com' && $password === '7777') {
    echo json_encode(['success' => true, 'is_admin' => true]);
    exit;
}

$conn = new mysqli("localhost", "root", "", "eventra");
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB bağlantı hatası']);
    exit;
}

$stmt = $conn->prepare("SELECT id, fullname, password, is_approved, changed_password, interests FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if (password_verify($password, $row['password'])) {
        if ($row['is_approved'] == 1) {
            // Şifre değiştirme kontrolü
            if ($row['changed_password'] == 0) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Şifre değiştirme ekranına yönlendiriliyorsunuz.',
                    'redirect' => true
                ]);
                exit;
            }

            $_SESSION['user_id'] = $row['id'];
            $_SESSION['fullname'] = $row['fullname'];
            // Sepeti sıfırla
            $conn->query("UPDATE events SET is_in_cart = 0");
            $_SESSION['active_user'] = $row['id'];

            // İlgi alanlarını diziye çevir
            $interests = !empty($row['interests']) ? explode(',', $row['interests']) : [];

            echo json_encode([
                'success' => true,
                'is_admin' => false,
                'user' => [
                    'id' => $row['id'],
                    'fullname' => $row['fullname'],
                    'email' => $email,
                    'changed_password' => $row['changed_password'],
                    'interests' => $interests
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Hesap onaylanmamış.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Şifre hatalı.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Kullanıcı bulunamadı.']);
}

$stmt->close();
$conn->close();
?>
