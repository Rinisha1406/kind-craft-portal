<?php
require_once 'config.php';
require_once 'utils.php';

$conn = getDBConnection();

// Check if service_interested exists
$result = $conn->query("SHOW COLUMNS FROM members LIKE 'service_interested'");
if ($result->num_rows === 0) {
    if ($conn->query("ALTER TABLE members ADD COLUMN service_interested TEXT DEFAULT NULL AFTER membership_type")) {
        echo "service_interested column added successfully.<br>";
    } else {
        echo "Error adding service_interested column: " . $conn->error . "<br>";
    }
} else {
    echo "service_interested column already exists.<br>";
}

// Check if member_details exists
$result = $conn->query("SHOW COLUMNS FROM members LIKE 'member_details'");
if ($result->num_rows === 0) {
    if ($conn->query("ALTER TABLE members ADD COLUMN member_details LONGTEXT DEFAULT NULL AFTER service_interested")) {
        echo "member_details column added successfully.<br>";
    } else {
        echo "Error adding member_details column: " . $conn->error . "<br>";
    }
} else {
    echo "member_details column already exists.<br>";
}

echo "Migration completed.";
?>
