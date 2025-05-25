<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");


// Veritabanına bağlan
$conn = new mysqli('localhost', 'root', '', 'eventra');
if ($conn->connect_error) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT id, fullname, email, is_approved FROM users";
$result = $conn->query($sql);

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode($users);
$conn->close();
?>
