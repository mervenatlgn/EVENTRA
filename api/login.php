<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

// Admin kontrolü (şifre sabit olduğu için ayrı kontrol)
if ($email === 'merve@gmail.com' && $password === '7777') {
    echo json_encode(['success' => true, 'is_admin' => true]);
    exit;
}

$conn = new mysqli("localhost", "root", "", "eventra");
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB bağlantı hatası']);
    exit;
}

$stmt = $conn->prepare("SELECT id, fullname, password, is_approved, changed_password FROM users WHERE email = ?");
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

            session_start();
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['fullname'] = $row['fullname'];

            echo json_encode([
                'success' => true,
                'is_admin' => false,
                'user' => [
                    'id' => $row['id'],
                    'fullname' => $row['fullname'],
                    'email' => $email,
                    'changed_password' => $row['changed_password']
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
