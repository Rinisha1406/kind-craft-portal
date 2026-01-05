<?php
require_once 'config.php';
require_once 'cors.php';
require_once 'utils.php';

$conn = getDBConnection();

// GET: Fetch members (Admin sees all, User sees self)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = verify_auth_token($conn);
    if (!$user) {
        send_json_response(['error' => 'Unauthorized'], 401);
    }
    
    $is_admin = false;
    $role_stmt = $conn->prepare("SELECT role FROM user_roles WHERE user_id = ? AND role = 'admin'");
    $role_stmt->bind_param("s", $user['id']);
    $role_stmt->execute();
    if ($role_stmt->get_result()->num_rows > 0) {
        $is_admin = true;
    }
    
    if ($is_admin) {
        $result = $conn->query("SELECT * FROM members");
        $members = [];
        while ($row = $result->fetch_assoc()) {
            $members[] = $row;
        }
        send_json_response(['data' => $members, 'error' => null]);
    } else {
        // User sees only their own membership
        $stmt = $conn->prepare("SELECT * FROM members WHERE user_id = ?");
        $stmt->bind_param("s", $user['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $members = [];
        while ($row = $result->fetch_assoc()) {
            $members[] = $row;
        }
        send_json_response(['data' => $members, 'error' => null]);
    }
}

// POST: Register as member
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = verify_auth_token($conn);
    if (!$user) {
        send_json_response(['error' => 'Unauthorized'], 401);
    }
    
    $input = get_json_input();
    $full_name = $input['full_name'];
    $email = $input['email'];
    $phone = $input['phone'] ?? '';
    $address = $input['address'] ?? '';
    
    $id = generate_uuid();
    
    $stmt = $conn->prepare("INSERT INTO members (id, user_id, full_name, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $id, $user['id'], $full_name, $email, $phone, $address);
    
    if ($stmt->execute()) {
        send_json_response(['error' => null, 'data' => ['id' => $id]]);
    } else {
        send_json_response(['error' => 'Failed to add member'], 500);
    }
}
?>
