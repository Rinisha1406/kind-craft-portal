<?php
require_once 'config.php';

$conn = getDBConnection();

echo "Migrating DB to Phone Authentication...\n";

// 1. Add phone column to users table
$check = $conn->query("SHOW COLUMNS FROM users LIKE 'phone'");
if ($check->num_rows == 0) {
    if ($conn->query("ALTER TABLE users ADD COLUMN phone VARCHAR(20) UNIQUE AFTER email")) {
        echo "Added 'phone' column to users.\n";
    } else {
        echo "Error adding 'phone' column: " . $conn->error . "\n";
    }
} else {
    echo "'phone' column already exists in users.\n";
}

// 2. Make email nullable in users table
if ($conn->query("ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NULL")) {
    echo "Modified 'email' to be nullable in users.\n";
} else {
    echo "Error modifying 'email' in users: " . $conn->error . "\n";
}

// 3. Make email nullable in profiles table
if ($conn->query("ALTER TABLE profiles MODIFY COLUMN email text NULL")) {
    echo "Modified 'email' to be nullable in profiles.\n";
} else {
    echo "Error modifying 'email' in profiles: " . $conn->error . "\n";
}

// 4. Update existing users (Optional: Set phone = email as placeholder if needed, or leave null)
// For now, we assume new users or manual migration for existing ones.

echo "Migration Complete.\n";
$conn->close();
?>
