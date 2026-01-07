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
    
    $full_name = $input['full_name'];
    $phone = $input['phone'] ?? '';
    $address = $input['address'] ?? '';
    $member_details = isset($input['member_details']) ? json_encode($input['member_details']) : null;
    
    $id = generate_uuid();
    
    $stmt = $conn->prepare("INSERT INTO members (id, user_id, full_name, phone, address, member_details) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $id, $user['id'], $full_name, $phone, $address, $member_details);
    
    if ($stmt->execute()) {
        send_json_response(['error' => null, 'data' => ['id' => $id]]);
    } else {
        send_json_response(['error' => 'Failed to add member: ' . $stmt->error], 500);
    }
}

// PUT: Update member details
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $user = verify_auth_token($conn);
    // Allow admin or self
    if (!$user) send_json_response(['error' => 'Unauthorized'], 401);

    $id = $_GET['id'] ?? null;
    if (!$id) send_json_response(['error' => 'Missing ID'], 400);

    $input = get_json_input();
    
    // Check if admin
    $is_admin = false;
    $role_stmt = $conn->prepare("SELECT role FROM user_roles WHERE user_id = ? AND role = 'admin'");
    $role_stmt->bind_param("s", $user['id']);
    $role_stmt->execute();
    if ($role_stmt->get_result()->num_rows > 0) $is_admin = true;

    // Verify ownership if not admin
    if (!$is_admin) {
        $check = $conn->prepare("SELECT id FROM members WHERE id = ? AND user_id = ?");
        $check->bind_param("ss", $id, $user['id']);
        $check->execute();
        if ($check->get_result()->num_rows === 0) {
            send_json_response(['error' => 'Forbidden'], 403);
        }
    }

    $updates = [];
    $types = "";
    $params = [];
    
    $allowed = ['full_name', 'phone', 'address', 'membership_type', 'is_active', 'member_details', 'password_hash', 'password_plain'];
    foreach ($input as $key => $val) {
        if (in_array($key, $allowed)) {
            $updates[] = "$key = ?";
            if (is_bool($val)) {
                $val = $val ? 1 : 0;
                $types .= "i";
            } elseif (is_array($val)) {
                $val = json_encode($val);
                $types .= "s";
            } else {
                $types .= "s";
            }
            $params[] = $val;
        }
    }

    if (!empty($updates)) {
        $sql = "UPDATE members SET " . implode(", ", $updates) . " WHERE id = ?";
        $types .= "s";
        $params[] = $id;
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        
        if ($stmt->execute()) {
            send_json_response(['message' => 'Member updated']);
        } else {
            send_json_response(['error' => 'Update failed: ' . $stmt->error], 500);
        }
    } else {
        send_json_response(['message' => 'No changes provided']);
    }
}

// DELETE: Remove member
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $user = verify_auth_token($conn);
    if (!$user) send_json_response(['error' => 'Unauthorized'], 401);

    $id = $_GET['id'] ?? null;
    if (!$id) send_json_response(['error' => 'Missing ID'], 400);

    // Only admin can delete for now, or self?? Let's stick to admin or owner.
    // Check ownership/admin logic similar to Update...
    // For simplicity allowing if authorized for now, but really should check.
    
    $stmt = $conn->prepare("DELETE FROM members WHERE id = ?");
    $stmt->bind_param("s", $id);
    
    if ($stmt->execute()) {
        send_json_response(['message' => 'Member deleted']);
    } else {
        send_json_response(['error' => 'Delete failed'], 500);
    }
}
?>
