<?php
require_once 'config.php';

$conn = getDBConnection();

echo "Updating registrations table schema...\n";

// Add details column if not exists
$check = $conn->query("SHOW COLUMNS FROM registrations LIKE 'details'");
if ($check->num_rows == 0) {
    // MySQL 5.7+ supports JSON. If not, use TEXT. assuming modern MySQL/MariaDB in XAMPP.
    if ($conn->query("ALTER TABLE registrations ADD COLUMN details JSON DEFAULT NULL")) {
        echo "Added 'details' column.\n";
    } else {
        echo "Error adding 'details' column: " . $conn->error . "\n";
    }
} else {
    echo "'details' column already exists.\n";
}

// Modify email to be nullable
if ($conn->query("ALTER TABLE registrations MODIFY COLUMN email text NULL")) {
    echo "Modified 'email' column to be nullable.\n";
} else {
    echo "Error modifying 'email' column: " . $conn->error . "\n";
}

$conn->close();
?>
