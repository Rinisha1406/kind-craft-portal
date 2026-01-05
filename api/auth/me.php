<?php
require_once '../config.php';
require_once '../cors.php';
require_once '../utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json_response(['error' => 'Method not allowed'], 405);
}

$conn = getDBConnection();
$user = verify_auth_token($conn);

if (!$user) {
    send_json_response(['error' => 'Unauthorized'], 401);
}

// Get user roles
$role_stmt = $conn->prepare("SELECT role FROM user_roles WHERE user_id = ?");
$role_stmt->bind_param("s", $user['id']);
$role_stmt->execute();
$role_res = $role_stmt->get_result();
$roles = [];
while ($row = $role_res->fetch_assoc()) {
    $roles[] = $row['role'];
}

// Get profile
$profile_stmt = $conn->prepare("SELECT * FROM profiles WHERE user_id = ?");
$profile_stmt->bind_param("s", $user['id']);
$profile_stmt->execute();
$profile = $profile_stmt->get_result()->fetch_assoc();

send_json_response([
    'data' => [
        'id' => $user['id'],
        'email' => $user['email'],
        'app_metadata' => ['roles' => $roles],
        'user_metadata' => [
            'full_name' => $profile['full_name'] ?? ''
        ],
        'role' => 'authenticated'
    ],
    'error' => null
]);

$conn->close();
?>
