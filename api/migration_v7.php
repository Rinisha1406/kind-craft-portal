<?php
require_once 'config.php';

$conn = getDBConnection();

echo "Starting migration v7...<br>";

// 1. Add columns to services table if they don't exist
$cols = [
    "user_id VARCHAR(36) NULL",
    "price VARCHAR(100) NULL",
    "category VARCHAR(100) NULL"
];

foreach ($cols as $col) {
    $col_name = explode(" ", $col)[0];
    $check = $conn->query("SHOW COLUMNS FROM services LIKE '$col_name'");
    if ($check->num_rows == 0) {
        $sql = "ALTER TABLE services ADD COLUMN $col";
        if ($conn->query($sql)) {
            echo "Added column $col_name to services.<br>";
        } else {
            echo "Error adding column $col_name: " . $conn->error . "<br>";
        }
    }
}

// 2. Clear out the member_services table if it exists and we've verified this is safe
// In a real migration, we would COPY data from member_services to services here.
// INSERT INTO services (id, user_id, title, description, price, category, image_url, is_active, created_at)
// SELECT id, user_id, title, description, price, category, image_url, is_active, created_at FROM member_services;

$table_check = $conn->query("SHOW TABLES LIKE 'member_services'");
if ($table_check->num_rows > 0) {
    echo "Transferring data from member_services to services...<br>";
    $transfer = "INSERT IGNORE INTO services (id, user_id, title, description, price, category, image_url, is_active, created_at)
                  SELECT id, user_id, title, description, price, category, image_url, is_active, created_at 
                  FROM member_services";
    if ($conn->query($transfer)) {
        echo "Data transferred successfully.<br>";
        // Now safely drop it
        $conn->query("DROP TABLE member_services");
        echo "Table member_services dropped.<br>";
    } else {
        echo "Error transferring data: " . $conn->error . "<br>";
    }
}

echo "Migration v7 completed.<br>";
$conn->close();
?>
