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
if (!$data || !isset($data['id'])) {
    echo json_encode(["success" => false, "message" => "Geçersiz veri formatı veya ID eksik"]);
    exit;
}

try {
    $pdo = new PDO("mysql:host=localhost;dbname=eventra;charset=utf8", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Önce etkinliğin var olup olmadığını kontrol et
    $check = $pdo->prepare("SELECT id FROM events WHERE id = ?");
    $check->execute([$data['id']]);
    
    if (!$check->fetch()) {
        echo json_encode(["success" => false, "message" => "Etkinlik bulunamadı"]);
        exit;
    }

    // Etkinliği sil
    $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
    $stmt->execute([$data['id']]);
    
    echo json_encode(["success" => true, "message" => "Etkinlik başarıyla silindi"]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Veritabanı hatası: " . $e->getMessage()]);
}
?>
