<?php
require_once '../config.php';
require_once '../cors.php';
require_once '../utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_response(['error' => 'Method not allowed'], 405);
}

$input = get_json_input();
if (!$input || !isset($input['phone']) || !isset($input['password'])) {
    send_json_response(['error' => 'Missing phone or password'], 400);
}

$phone = $input['phone'];
$password = $input['password'];

$conn = getDBConnection();

$stmt = $conn->prepare("SELECT id, phone, password_hash FROM users WHERE phone = ?");
$stmt->bind_param("s", $phone);
$stmt->execute();
$result = $stmt->get_result();
file_put_contents('../debug_login_v2.log', date('Y-m-d H:i:s') . " - Login Phone: $phone\n", FILE_APPEND);

if ($result->num_rows === 0) {
    file_put_contents('../debug_login_v2.log', " - User NOT found\n", FILE_APPEND);
    send_json_response(['error' => 'Invalid credentials'], 401);
}

$user = $result->fetch_assoc();
file_put_contents('../debug_login_v2.log', " - Found User ID: " . $user['id'] . "\n", FILE_APPEND);

if (password_verify($password, $user['password_hash'])) {
    file_put_contents('../debug_login_v2.log', " - Verify SUCCESS\n", FILE_APPEND);
    // Determine Role
    $role_stmt = $conn->prepare("SELECT role FROM user_roles WHERE user_id = ?");
    $role_stmt->bind_param("s", $user['id']);
    $role_stmt->execute();
    $role_res = $role_stmt->get_result();
    $roles = [];
    while ($row = $role_res->fetch_assoc()) {
        $roles[] = $row['role'];
    }
    
    send_json_response([
        'data' => [
            'user' => [
                'id' => $user['id'],
                'phone' => $user['phone'],
                'app_metadata' => ['roles' => $roles],
                'role' => 'authenticated'
            ],
            'session' => [
                'access_token' => $user['id'], // SIMPLIFIED TOKEN
                'token_type' => 'bearer',
                'user' => [
                    'id' => $user['id'],
                    'phone' => $user['phone']
                ]
            ]
        ],
        'error' => null
    ]);
} else {
    file_put_contents('../debug_login_v2.log', " - Verify FAILED. Hash: " . substr($user['password_hash'], 0, 10) . "...\n", FILE_APPEND);
    send_json_response(['error' => 'Invalid credentials'], 401);
}

$conn->close();
