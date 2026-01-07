<?php
require_once 'config.php';

$conn = getDBConnection();

// Drop table if exists
$sql_drop = "DROP TABLE IF EXISTS matrimony_profiles";
if ($conn->query($sql_drop) === TRUE) {
    echo "Table matrimony_profiles dropped successfully.\n";
} else {
    echo "Error dropping table: " . $conn->error . "\n";
}

// Create table with Auto Increment ID
$sql_create = "CREATE TABLE matrimony_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    age INT,
    gender VARCHAR(50),
    occupation VARCHAR(255),
    location VARCHAR(255),
    contact_phone VARCHAR(50),
    image_url TEXT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql_create) === TRUE) {
    echo "Table matrimony_profiles created successfully with Auto-Increment ID.\n";
} else {
    echo "Error creating table: " . $conn->error . "\n";
}

$conn->close();
?>
