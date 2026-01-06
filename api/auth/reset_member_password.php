<?php
require_once '../config.php';
require_once '../cors.php';
require_once '../utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_response(['error' => 'Method not allowed'], 405);
}

$input = get_json_input();
if (!$input || !isset($input['email']) || !isset($input['phone']) || !isset($input['new_password'])) {
    send_json_response(['error' => 'Missing email, phone, or new password'], 400);
}

$email = $input['email'];
$phone = $input['phone'];
$new_password = $input['new_password'];

$conn = getDBConnection();

// Verify user exists with matching phone AND email
$stmt = $conn->prepare("SELECT id FROM users WHERE phone = ? AND email = ?");
$stmt->bind_param("ss", $phone, $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    send_json_response(['error' => 'No account found with this Email and Phone number combo.'], 404);
}

$user = $result->fetch_assoc();
$user_id = $user['id'];

// Update Password
$new_hash = password_hash($new_password, PASSWORD_DEFAULT);

$update_stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
$update_stmt->bind_param("ss", $new_hash, $user_id);

if ($update_stmt->execute()) {
    // Optionally update details['password_plain'] if we had a dedicated profiles table for members like matrimony
    // For now, members are generic users. We didn't promise admin visibility for generic member passwords, 
    // but if we did, we'd need a 'member_profiles' table with details column.
    // The current 'registrations' table has no details/password column.
    
    send_json_response(['message' => 'Password updated successfully']);
} else {
    send_json_response(['error' => 'Failed to update password'], 500);
}

$conn->close();
?>
