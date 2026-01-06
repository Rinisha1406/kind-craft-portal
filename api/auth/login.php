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

$stmt = $conn->prepare("SELECT id, email, phone, password_hash FROM users WHERE phone = ? OR email = ?");
$stmt->bind_param("ss", $phone, $phone);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    send_json_response(['error' => 'Invalid credentials'], 401);
}

$user = $result->fetch_assoc();

if (password_verify($password, $user['password_hash'])) {
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
                'email' => $user['email'],
                'app_metadata' => ['roles' => $roles],
                'role' => 'authenticated'
            ],
            'session' => [
                'access_token' => $user['id'], // SIMPLIFIED TOKEN
                'token_type' => 'bearer',
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email']
                ]
            ]
        ],
        'error' => null
    ]);
} else {
    send_json_response(['error' => 'Invalid credentials'], 401);
}

$conn->close();
