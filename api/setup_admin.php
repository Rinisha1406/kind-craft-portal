<?php
require_once 'config.php';
require_once 'utils.php';

header('Content-Type: text/plain');

$conn = getDBConnection();

// Check if admin user exists
$email = 'admin'; // Using 'admin' as username
$password = 'admin123';
$userId = 'admin-user-id-' . time(); // Simple ID generation

$checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$checkStmt->bind_param("s", $email);
$checkStmt->execute();
$result = $checkStmt->get_result();

if ($result->num_rows > 0) {
    echo "Admin user 'admin' already exists.\n";
    $row = $result->fetch_assoc();
    $userId = $row['id'];
} else {
    // Create admin user
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $userId, $email, $hash);
    
    if ($stmt->execute()) {
        echo "Admin user 'admin' created successfully.\n";
    } else {
        die("Error creating user: " . $stmt->error . "\n");
    }
}

// Ensure admin role exists
$role = 'admin';
$checkRoleStmt = $conn->prepare("SELECT id FROM user_roles WHERE user_id = ? AND role = ?");
$checkRoleStmt->bind_param("ss", $userId, $role);
$checkRoleStmt->execute();
$roleResult = $checkRoleStmt->get_result();

if ($roleResult->num_rows === 0) {
    $roleId = uniqid('role_');
    $roleStmt = $conn->prepare("INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)");
    $roleStmt->bind_param("sss", $roleId, $userId, $role);
    
    if ($roleStmt->execute()) {
        echo "Admin role assigned successfully.\n";
    } else {
        echo "Error assigning role: " . $roleStmt->error . "\n";
    }
} else {
    echo "Admin role already assigned.\n";
}

$conn->close();
?>
