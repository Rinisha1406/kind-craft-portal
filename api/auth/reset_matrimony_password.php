<?php
require_once '../config.php';
require_once '../cors.php';
require_once '../utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_response(['error' => 'Method not allowed'], 405);
}

$input = get_json_input();

if (!isset($input['phone']) || !isset($input['dob']) || !isset($input['new_password'])) {
    send_json_response(['error' => 'Missing required fields'], 400);
}

$phone = $input['phone'];
$dob = $input['dob']; // Expected YYYY-MM-DD
$new_password = $input['new_password'];

$conn = getDBConnection();

// 1. Verify User exists and DOB matches
// We join users and matrimony_profiles to get everything we need
$sql = "SELECT mp.id, mp.user_id, mp.details, u.id as uid 
        FROM matrimony_profiles mp 
        JOIN users u ON mp.user_id = u.id 
        WHERE mp.contact_phone = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $phone);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    send_json_response(['error' => 'No account found with this phone number'], 404);
}

$row = $result->fetch_assoc();
$profile_id = $row['id'];
$user_id = $row['user_id'];
$details = json_decode($row['details'], true) ?? [];

$stored_dob = $details['dob'] ?? null;

if (!$stored_dob) {
    send_json_response(['error' => 'Account verification failed (DOB mismatch)'], 401);
}

// Simple string comparison for DOB (YYYY-MM-DD)
if ($stored_dob !== $dob) {
    send_json_response(['error' => 'Date of Birth does not match our records'], 401);
}

// 2. Perform Password Reset
$new_hash = password_hash($new_password, PASSWORD_DEFAULT);

$conn->begin_transaction();

try {
    // Update USERS table (Login credentials)
    $u_stmt = $conn->prepare("UPDATE users SET password_hash = ?, password_plain = ? WHERE id = ?");
    $u_stmt->bind_param("sss", $new_hash, $new_password, $user_id);
    if (!$u_stmt->execute()) {
        throw new Exception("Failed to update login credentials");
    }

    // Update MATRIMONY_PROFILES table (Plain text storage for admin)
    // Update the details JSON
    $details['password_plain'] = $new_password;
    $new_details_json = json_encode($details);

    $p_stmt = $conn->prepare("UPDATE matrimony_profiles SET details = ? WHERE id = ?");
    $p_stmt->bind_param("ss", $new_details_json, $profile_id);
    if (!$p_stmt->execute()) {
        throw new Exception("Failed to update profile details");
    }

    $conn->commit();
    send_json_response(['message' => 'Password reset successful']);

} catch (Exception $e) {
    $conn->rollback();
    file_put_contents('../debug_reset.log', "Reset Error: " . $e->getMessage() . "\n", FILE_APPEND);
    send_json_response(['error' => 'Password reset failed. Please try again.'], 500);
}

$conn->close();
?>
