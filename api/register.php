<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$fullname = trim($data['fullname'] ?? '');
$email = trim($data['email'] ?? '');
$password = password_hash(trim($data['password'] ?? ''), PASSWORD_DEFAULT);
// password_hash kullanarak şifreyi hashledik

if (empty($fullname) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Boş alan bırakmayın.']);
    exit;
}

$conn = new mysqli("localhost", "root", "", "eventra");

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB bağlantı hatası: ' . $conn->connect_error]);
    exit;
}

// Aynı e-posta zaten kayıtlı mı kontrol et
$check_stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check_stmt->bind_param("s", $email);
$check_stmt->execute();
$check_stmt->store_result();

if ($check_stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Bu kullanıcı kayıtlı, lütfen başka bir mail adresi ile deneyiniz.']);
    $check_stmt->close();
    $conn->close();
    exit;
}
$check_stmt->close();

// INSERT işlemi
$stmt = $conn->prepare("INSERT INTO users (fullname, email, password, is_approved, changed_password) VALUES (?, ?, ?, 0, 0)");
$stmt->bind_param("sss", $fullname, $email, $password);


if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Kayıt başarılı']);
} else {
    echo json_encode(['success' => false, 'message' => 'SQL kayıt hatası: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
