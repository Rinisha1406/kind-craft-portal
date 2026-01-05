<?php
require_once '../config.php';
require_once '../cors.php';
require_once '../utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    send_json_response(['error' => 'Method not allowed'], 405);
}

$conn = getDBConnection();
$user = verify_auth_token($conn);

if (!$user) {
    send_json_response(['error' => 'Unauthorized'], 401);
}

$input = get_json_input();
$password = $input['password'] ?? null;

if (!$password) {
    send_json_response(['error' => 'Missing password'], 400);
}

// Update password
$password_hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
$stmt->bind_param("ss", $password_hash, $user['id']);

if ($stmt->execute()) {
    send_json_response(['message' => 'Password updated successfully', 'error' => null]);
} else {
    send_json_response(['error' => 'Failed to update password'], 500);
}

$conn->close();
?>
