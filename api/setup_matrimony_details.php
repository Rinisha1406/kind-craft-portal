<?php
require_once 'config.php';

$conn = getDBConnection();

echo "Migrating DB for Matrimony Details...\n";

// Add details column to matrimony_profiles table
$check = $conn->query("SHOW COLUMNS FROM matrimony_profiles LIKE 'details'");
if ($check->num_rows == 0) {
    if ($conn->query("ALTER TABLE matrimony_profiles ADD COLUMN details JSON DEFAULT NULL AFTER location")) {
        echo "Added 'details' column to matrimony_profiles.\n";
    } else {
        echo "Error adding 'details' column: " . $conn->error . "\n";
    }
} else {
    echo "'details' column already exists in matrimony_profiles.\n";
}

echo "Migration Complete.\n";
$conn->close();
?>
