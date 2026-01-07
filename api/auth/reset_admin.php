<?php
require_once '../config.php';
require_once '../utils.php';

$conn = getDBConnection();

$phone = 'admin';
$new_password = 'admin123';
$password_hash = password_hash($new_password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("UPDATE users SET password_hash = ?, password_plain = ? WHERE phone = ?");
$stmt->bind_param("sss", $password_hash, $new_password, $phone);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo "Admin password reset successfully to 'admin123'. Please delete this file for security.";
    } else {
        echo "Admin user not found or password already matches.";
    }
} else {
    echo "Error resetting password: " . $stmt->error;
}

$conn->close();
?>
