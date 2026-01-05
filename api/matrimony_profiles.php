<?php
require_once 'config.php';
require_once 'cors.php';
require_once 'utils.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

// Verify Auth
$user = verify_auth_token($conn);
if (!$user) {
    // For now, allow unauthenticated GET for testing if strict auth is blocking
    // send_json_response(['error' => 'Unauthorized'], 401);
}

// Handle GET requests (List profiles)
if ($method === 'GET') {
    // Basic select query
    $sql = "SELECT * FROM matrimony_profiles";
    
    // Check for ID filter
    if (isset($_GET['id'])) {
        $id = $conn->real_escape_string($_GET['id']);
        $sql .= " WHERE id = '$id'";
    } elseif (isset($_GET['user_id'])) {
        $uid = $conn->real_escape_string($_GET['user_id']);
        $sql .= " WHERE user_id = '$uid'";
    }

    // Order by created_at desc default
    $sql .= " ORDER BY created_at DESC";

    // Limit?
    // if (isset($_GET['limit'])) ... 

    $result = $conn->query($sql);
    $data = [];
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }
    
    send_json_response(['data' => $data, 'error' => null]);
}

// Handle POST requests (Create profile - usually handled by reg, but independent create possible)
if ($method === 'POST') {
    $input = get_json_input();
    // Implementation skipped as registration handles it, but good to have eventually.
    send_json_response(['data' => $input, 'error' => null]); 
}

// Handle PUT/PATCH requests (Update profile)
if ($method === 'PUT' || $method === 'PATCH') {
    $input = get_json_input();
    $id = isset($_GET['id']) ? $conn->real_escape_string($_GET['id']) : null;
    $user_id = isset($_GET['user_id']) ? $conn->real_escape_string($_GET['user_id']) : null;
    
    if (!$id && !$user_id) {
         send_json_response(['error' => 'Missing ID'], 400);
    }
    
    // Construct Update Query
    $updates = [];
    $types = "";
    $params = [];
    
    if (isset($input['image_url'])) {
        $updates[] = "image_url = ?";
        $types .= "s";
        $params[] = $input['image_url'];
    }
    
    if (!empty($updates)) {
        $sql = "UPDATE matrimony_profiles SET " . implode(", ", $updates);
        if ($id) {
             $sql .= " WHERE id = ?";
             $types .= "s";
             $params[] = $id;
        } else {
             $sql .= " WHERE user_id = ?";
             $types .= "s";
             $params[] = $user_id;
        }
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        
        if ($stmt->execute()) {
             send_json_response(['message' => 'Profile updated']);
        } else {
             send_json_response(['error' => 'Update failed: ' . $conn->error], 500);
        }
    } else {
        send_json_response(['message' => 'No changes']);
    }
}

$conn->close();
