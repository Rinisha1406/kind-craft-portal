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
$target_user_id = $input['target_user_id'] ?? $user['id'];

if (!$password) {
    send_json_response(['error' => 'Missing password'], 400);
}

// Security Check: If updating another user, must be admin
if ($target_user_id !== $user['id']) {
    if (!is_admin($conn, $user)) {
        send_json_response(['error' => 'Forbidden: Only admins can update other users'], 403);
    }
}

// Update password in users table
$password_hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("UPDATE users SET password_hash = ?, password_plain = ? WHERE id = ?");
$stmt->bind_param("sss", $password_hash, $password, $target_user_id);
$stmt->execute();

// Also update matrimony_profiles details JSON if it exists
$stmt = $conn->prepare("SELECT details FROM matrimony_profiles WHERE user_id = ?");
$stmt->bind_param("s", $target_user_id);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $details = json_decode($row['details'], true) ?: [];
    $details['password_plain'] = $password;
    $new_details = json_encode($details);
    
    $stmt_update = $conn->prepare("UPDATE matrimony_profiles SET details = ? WHERE user_id = ?");
    $stmt_update->bind_param("ss", $new_details, $target_user_id);
    $stmt_update->execute();
}

send_json_response(['message' => 'Password updated successfully', 'error' => null]);

$conn->close();
?>
