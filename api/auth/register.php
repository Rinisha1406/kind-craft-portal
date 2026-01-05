<?php
require_once '../config.php';
require_once '../cors.php';
require_once '../utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_response(['error' => 'Method not allowed'], 405);
}

$input = get_json_input();
if (!$input || !isset($input['email']) || !isset($input['password'])) {
    send_json_response(['error' => 'Missing email or password'], 400);
}

$email = $input['email'];
$password = $input['password'];
$full_name = isset($input['options']['data']['full_name']) ? $input['options']['data']['full_name'] : '';

$conn = getDBConnection();

// Check if user exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    send_json_response(['error' => 'User already exists'], 409);
}

// Create new user
$user_id = generate_uuid();
$password_hash = password_hash($password, PASSWORD_DEFAULT);

$conn->begin_transaction();

try {
    // Insert user
    $stmt = $conn->prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $user_id, $email, $password_hash);
    if (!$stmt->execute()) {
        throw new Exception("Failed to create user");
    }

    // Insert profile
    $profile_id = generate_uuid();
    $stmt = $conn->prepare("INSERT INTO profiles (id, user_id, email, full_name) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $profile_id, $user_id, $email, $full_name);
    if (!$stmt->execute()) {
        throw new Exception("Failed to create profile");
    }
    
    // Assign default role (user)
    $role_id = generate_uuid();
    $role = 'user';
    $stmt = $conn->prepare("INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $role_id, $user_id, $role);
    if (!$stmt->execute()) {
        throw new Exception("Failed to assign role");
    }

    $conn->commit();
    
    // Return success (similar to Supabase structure)
    send_json_response([
        'data' => [
            'user' => [
                'id' => $user_id,
                'email' => $email,
                'role' => 'authenticated'
            ],
            'session' => [
                'access_token' => $user_id, // SIMPLIFIED TOKEN
                'token_type' => 'bearer',
                'user' => [
                    'id' => $user_id,
                    'email' => $email
                ]
            ]
        ],
        'error' => null
    ], 200);

} catch (Exception $e) {
    $conn->rollback();
    send_json_response(['error' => $e->getMessage()], 500);
}

$conn->close();
?>
