<?php
require_once 'config.php';
require_once 'cors.php';
require_once 'utils.php';

echo "Starting Admin Setup...\n";

$conn = getDBConnection();

// 1. Ensure users table has phone column
try {
    $result = $conn->query("SHOW COLUMNS FROM users LIKE 'phone'");
    if ($result->num_rows == 0) {
        // This is a bit risky if we don't know the exact current state, but based on register.php logic, it SHOULD be there or we are migrating.
        // Let's assume for now we are fixing DATA, not SCHEMA ALTERATION via this script unless necessary.
        // But the previous analysis showed register.php uses phone, so table likely HAS phone.
        // If not, we should probably recreate it or alter it.
        // Let's check if email exists and drop it? No, let's just ensure phone exists.
        echo "Adding phone column to users table...\n";
        $conn->query("ALTER TABLE users ADD COLUMN phone VARCHAR(255) NOT NULL UNIQUE AFTER id");
        // We might need to drop email index if it conflicts or exists
    } else {
        echo "Users table already has phone column.\n";
    }
} catch (Exception $e) {
    echo "Error checking users table: " . $e->getMessage() . "\n";
}

// 2. Check for Admin User
$admin_phone = 'admin';
$admin_password = 'admin123';

$stmt = $conn->prepare("SELECT id FROM users WHERE phone = ?");
$stmt->bind_param("s", $admin_phone);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo "Admin user already exists.\n";
    $user = $result->fetch_assoc();
    $user_id = $user['id'];
} else {
    echo "Creating admin user...\n";
    $user_id = generate_uuid();
    $password_hash = password_hash($admin_password, PASSWORD_DEFAULT);
    
    // Insert into users
    $stmt = $conn->prepare("INSERT INTO users (id, phone, password_hash, password_plain) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $user_id, $admin_phone, $password_hash, $admin_password);
    if ($stmt->execute()) {
        echo "Admin user created successfully.\n";
    } else {
        die("Failed to create admin user: " . $stmt->error . "\n");
    }
    
    // Insert into profiles (optional but good for consistency)
    $profile_id = generate_uuid();
    $full_name = "System Admin";
    $stmt_prof = $conn->prepare("INSERT INTO profiles (id, user_id, phone, full_name) VALUES (?, ?, ?, ?)");
    $stmt_prof->bind_param("ssss", $profile_id, $user_id, $admin_phone, $full_name);
    $stmt_prof->execute();
}

// 3. Ensure Admin Role
$stmt = $conn->prepare("SELECT id FROM user_roles WHERE user_id = ? AND role = 'admin'");
$stmt->bind_param("s", $user_id);
$stmt->execute();
if ($stmt->get_result()->num_rows == 0) {
    echo "Assigning admin role...\n";
    $role_id = generate_uuid();
    $role = 'admin';
    $stmt_role = $conn->prepare("INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)");
    $stmt_role->bind_param("sss", $role_id, $user_id, $role);
    if ($stmt_role->execute()) {
        echo "Admin role assigned.\n";
    } else {
        echo "Failed to assign admin role: " . $stmt_role->error . "\n";
    }
} else {
    echo "User already has admin role.\n";
}

echo "Setup Complete!\n";
$conn->close();
?>
