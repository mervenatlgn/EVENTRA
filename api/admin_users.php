<?php 
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// DB bağlantısı
$mysqli = new mysqli("localhost", "root", "", "eventra");
if($mysqli->connect_errno) {
  die("Bağlantı hatası: " . $mysqli->connect_error);
}

// Kullanıcıları çek
$sql = "SELECT id, fullname, email, is_approved FROM users";
$result = $mysqli->query($sql);
?>

<div class="user-list">
<?php while($row = $result->fetch_assoc()): ?> //anahtar-değer dizisi
  <div class="user-card">
    <h4><?= htmlspecialchars($row['fullname']) ?></h4>
    <p>Email: <?= htmlspecialchars($row['email']) ?></p>
    <?php if($row['is_approved'] == 1): ?>
      <button disabled style="font-style: italic; background-color: gray; cursor: default;">
        Onaylı Kullanıcı
      </button>
    <?php else: ?>
      <button
        onclick="approveUser(<?= $row['id'] ?>, '<?= addslashes(htmlspecialchars($row['fullname'])) ?>', this)"
        style="background-color: #28a745; color: white; cursor: pointer;">
        Onayla
      </button>
    <?php endif; ?>
  </div>
<?php endwhile; ?>
</div>
