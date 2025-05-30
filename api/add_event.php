<?php
// geliştirme ortamında kullanılır, hata ayıklamaya yarar.
ini_set('display_errors', 1);
error_reporting(E_ALL);
// CORS ayarları (Cross-Origin Resource Sharing)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// JSON verisini al
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Veri doğrulama
if (!$data) {
    echo json_encode(["success" => false, "message" => "Geçersiz veri formatı"]);
    exit;
}

$required_fields = ['title', 'place', 'category', 'date', 'price'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        echo json_encode(["success" => false, "message" => "$field alanı gereklidir"]);
        exit;
    }
}

try {
    $pdo = new PDO("mysql:host=localhost;dbname=eventra;charset=utf8", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->prepare("INSERT INTO events (title, place, category, date, price) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['title'],
        $data['place'],
        $data['category'],
        $data['date'],
        $data['price']
    ]);

    echo json_encode(["success" => true, "message" => "Etkinlik başarıyla eklendi"]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Veritabanı hatası: " . $e->getMessage()]);
}
?>
