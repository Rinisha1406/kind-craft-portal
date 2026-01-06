<?php
require_once 'config.php';
require_once 'cors.php';
require_once 'utils.php';

$conn = getDBConnection();

function is_admin($conn, $user) {
    if (!$user) return false;
    $stmt = $conn->prepare("SELECT role FROM user_roles WHERE user_id = ? AND role = 'admin'");
    $stmt->bind_param("s", $user['id']);
    $stmt->execute();
    return $stmt->get_result()->num_rows > 0;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = verify_auth_token($conn);
    if (!is_admin($conn, $user)) send_json_response(['error' => 'Forbidden'], 403);
    
    $result = $conn->query("SELECT * FROM registrations ORDER BY created_at DESC");
    $regs = [];
    while ($row = $result->fetch_assoc()) {
        $regs[] = $row;
    }
    send_json_response(['data' => $regs, 'error' => null]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = get_json_input();
    $full_name = $input['full_name'] ?? '';
    $email = $input['email'] ?? null;
    $phone = $input['phone'] ?? '';
    $type = $input['registration_type'] ?? 'general';
    $details = isset($input['details']) ? json_encode($input['details']) : null;
    
    if (empty($full_name)) {
        send_json_response(['error' => 'Missing required fields (full_name)'], 400);
    }
    
    $id = generate_uuid();
    $stmt = $conn->prepare("INSERT INTO registrations (id, full_name, email, phone, registration_type, details) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $id, $full_name, $email, $phone, $type, $details);
    
    if ($stmt->execute()) {
        send_json_response(['error' => null]);
    } else {
        error_log("Registration error: " . $stmt->error);
        send_json_response(['error' => 'Failed to save registration: ' . $stmt->error], 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $user = verify_auth_token($conn);
    if (!is_admin($conn, $user)) send_json_response(['error' => 'Forbidden'], 403);
    if (!isset($_GET['id'])) send_json_response(['error' => 'Missing ID'], 400);
    
    $input = get_json_input();
    if (isset($input['status'])) {
        $stmt = $conn->prepare("UPDATE registrations SET status = ? WHERE id = ?");
        $stmt->bind_param("ss", $input['status'], $_GET['id']);
        $stmt->execute();
    }
    send_json_response(['error' => null]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $user = verify_auth_token($conn);
    if (!is_admin($conn, $user)) send_json_response(['error' => 'Forbidden'], 403);
    
    $id = $_GET['id'] ?? null;
    if (!$id) send_json_response(['error' => 'Missing ID'], 400);

    $stmt = $conn->prepare("DELETE FROM registrations WHERE id = ?");
    $stmt->bind_param("s", $id);
    
    if ($stmt->execute()) {
        send_json_response(['message' => 'Registration deleted']);
    } else {
        send_json_response(['error' => 'Delete failed: ' . $stmt->error], 500);
    }
}
?>
