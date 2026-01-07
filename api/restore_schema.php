<?php
require_once 'config.php';
$conn = getDBConnection();

echo "Restoring 'email' column to 'contact_messages'...\n";
$stm = $conn->query("SHOW COLUMNS FROM `contact_messages` LIKE 'email'");
if ($stm && $stm->num_rows === 0) {
    $sql = "ALTER TABLE `contact_messages` ADD COLUMN `email` TEXT NOT NULL AFTER `name`";
    if ($conn->query($sql)) {
        echo " - Added 'email' column successfully.\n";
    } else {
        echo " - Error adding 'email' column: " . $conn->error . "\n";
    }
} else {
    echo " - 'email' column already exists.\n";
}

echo "Done.\n";
$conn->close();
?>
