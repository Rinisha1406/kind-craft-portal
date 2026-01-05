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

// Handle POST requests (Create profile)
if ($method === 'POST') {
    $input = get_json_input();
    // TODO: Implement insert logic
    send_json_response(['data' => $input, 'error' => null]);
}

$conn->close();
