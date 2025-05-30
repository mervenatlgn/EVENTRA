<?php
// geliştirme ortamında kullanılır, hata ayıklamaya yarar.
ini_set('display_errors', 1);
error_reporting(E_ALL);
// CORS ayarları (Cross-Origin Resource Sharing)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "eventra");
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB bağlantı hatası']);
    exit;
}

// Kategori filtresi
$category = $_GET['category'] ?? 'all';
$sql = "SELECT * FROM events";
if ($category !== 'all') {
    $sql .= " WHERE category = ?";
}
// Tarihe göre sıralama ekle (en erken tarih en üstte)
$sql .= " ORDER BY date ASC";

$stmt = $conn->prepare($sql);
if ($category !== 'all') {
    $stmt->bind_param("s", $category);
}
$stmt->execute();
$result = $stmt->get_result();

$events = [];
while ($row = $result->fetch_assoc()) {
    $events[] = $row;
}

echo json_encode($events);

$stmt->close();
$conn->close();
