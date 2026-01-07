<?php
require_once 'config.php';
require_once 'cors.php';
require_once 'utils.php';

$conn = getDBConnection();

// GET: Fetch services
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = verify_auth_token($conn); // Optional for public view, but let's check for 'mine'
    
    $mine = isset($_GET['mine']) && $_GET['mine'] === 'true';
    
    if ($mine) {
        if (!$user) send_json_response(['error' => 'Unauthorized'], 401);
        $stmt = $conn->prepare("SELECT * FROM member_services WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->bind_param("s", $user['id']);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        // Public marketplace view (all active)
        $sql = "SELECT s.*, m.full_name as provider_name 
                FROM member_services s 
                LEFT JOIN members m ON s.user_id = m.user_id 
                WHERE s.is_active = 1 
                ORDER BY s.created_at DESC";
        $result = $conn->query($sql);
    }
    
    $services = [];
    while ($row = $result->fetch_assoc()) {
        $services[] = $row;
    }
    send_json_response(['data' => $services, 'error' => null]);
}

// POST: Create Service (requires membership)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = verify_auth_token($conn);
    if (!$user) send_json_response(['error' => 'Unauthorized'], 401);
    
    // Check if user is a member
    $check = $conn->prepare("SELECT id FROM members WHERE user_id = ?");
    $check->bind_param("s", $user['id']);
    $check->execute();
    if ($check->get_result()->num_rows === 0) {
        send_json_response(['error' => 'Only paid members can offer services'], 403);
    }
    
    $input = get_json_input();
    $id = generate_uuid();
    $title = $input['title'] ?? '';
    $description = $input['description'] ?? '';
    $price = $input['price'] ?? '';
    $category = $input['category'] ?? 'General';
    $image_url = $input['image_url'] ?? '';
    
    $stmt = $conn->prepare("INSERT INTO member_services (id, user_id, title, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssss", $id, $user['id'], $title, $description, $price, $category, $image_url);
    
    if ($stmt->execute()) {
        send_json_response(['error' => null, 'data' => ['id' => $id]]);
    } else {
        send_json_response(['error' => 'Failed to create service: ' . $stmt->error], 500);
    }
}

// PUT: Update Service (requires ownership)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $user = verify_auth_token($conn);
    if (!$user) send_json_response(['error' => 'Unauthorized'], 401);
    
    $id = $_GET['id'] ?? null;
    if (!$id) send_json_response(['error' => 'Missing ID'], 400);
    
    $input = get_json_input();
    
    // Verify ownership
    $check = $conn->prepare("SELECT id FROM member_services WHERE id = ? AND user_id = ?");
    $check->bind_param("ss", $id, $user['id']);
    $check->execute();
    if ($check->get_result()->num_rows === 0) {
        send_json_response(['error' => 'Forbidden'], 403);
    }
    
    $updates = [];
    $types = "";
    $params = [];
    
    $allowed = ['title', 'description', 'price', 'category', 'image_url', 'is_active'];
    foreach ($input as $key => $val) {
        if (in_array($key, $allowed)) {
            $updates[] = "$key = ?";
            if (is_bool($val)) {
                $val = $val ? 1 : 0;
                $types .= "i";
            } else {
                $types .= "s";
            }
            $params[] = $val;
        }
    }
    
    if (!empty($updates)) {
        $sql = "UPDATE member_services SET " . implode(", ", $updates) . " WHERE id = ?";
        $types .= "s";
        $params[] = $id;
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        
        if ($stmt->execute()) {
            send_json_response(['message' => 'Service updated']);
        } else {
            send_json_response(['error' => 'Update failed'], 500);
        }
    } else {
        send_json_response(['message' => 'No changes provided']);
    }
}

// DELETE: Remove Service (requires ownership)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $user = verify_auth_token($conn);
    if (!$user) send_json_response(['error' => 'Unauthorized'], 401);
    
    $id = $_GET['id'] ?? null;
    if (!$id) send_json_response(['error' => 'Missing ID'], 400);
    
    $stmt = $conn->prepare("DELETE FROM member_services WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ss", $id, $user['id']);
    
    if ($stmt->execute()) {
        send_json_response(['message' => 'Service deleted']);
    } else {
        send_json_response(['error' => 'Delete failed'], 500);
    }
}
?>
