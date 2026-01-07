<?php
require_once 'config.php';

$conn = getDBConnection();

// Add is_active column
$sql = "ALTER TABLE matrimony_profiles ADD COLUMN is_active BOOLEAN DEFAULT FALSE";

if ($conn->query($sql) === TRUE) {
    echo "Column is_active added successfully.\n";
} else {
    echo "Error adding column: " . $conn->error . "\n";
}

// Add is_approved column (optional but good for admin)
$sql2 = "ALTER TABLE matrimony_profiles ADD COLUMN is_approved BOOLEAN DEFAULT FALSE";
if ($conn->query($sql2) === TRUE) {
    echo "Column is_approved added successfully.\n";
} else {
    echo "Error adding is_approved: " . $conn->error . "\n";
}

$conn->close();
?>
