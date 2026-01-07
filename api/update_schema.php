<?php
require_once 'config.php';

$conn = getDBConnection();

$sql = "ALTER TABLE products ADD COLUMN images JSON DEFAULT NULL";

if ($conn->query($sql) === TRUE) {
    echo "Column 'images' added successfully";
} else {
    echo "Error adding column: " . $conn->error;
}

$conn->close();
?>
