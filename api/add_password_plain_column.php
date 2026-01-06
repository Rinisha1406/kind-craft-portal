<?php
require_once 'config.php';

$conn = getDBConnection();
echo "Adding password_plain column to users table...\n";

// Check if column exists
$check = $conn->query("SHOW COLUMNS FROM users LIKE 'password_plain'");
if ($check->num_rows == 0) {
    if ($conn->query("ALTER TABLE users ADD COLUMN password_plain VARCHAR(255) AFTER password_hash")) {
        echo "Added 'password_plain' column to users.\n";
    } else {
        echo "Error adding 'password_plain' column: " . $conn->error . "\n";
    }
} else {
    echo "'password_plain' column already exists in users.\n";
}

$conn->close();
?>
