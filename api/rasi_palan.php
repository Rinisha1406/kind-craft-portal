<?php
require_once 'config.php';
require_once 'cors.php';
require_once 'utils.php';

$conn = getDBConnection();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM rasi_palan WHERE 1=1";
    
    if (isset($_GET['is_active'])) {
        $is_active = $_GET['is_active'] === 'true' ? 1 : 0;
        $sql .= " AND is_active = $is_active";
    }

    if (isset($_GET['id'])) {
        $id = $conn->real_escape_string($_GET['id']);
        $sql .= " AND id = '$id'";
    }
    
    $sql .= " ORDER BY created_at DESC";
    
    $result = $conn->query($sql);
    if (!$result) {
        send_json_response(['error' => 'Table not found or query failed. Please run the migration script: ' . $conn->error], 500);
    }
    
    $rasi = [];
    while ($row = $result->fetch_assoc()) {
        $rasi[] = $row;
    }
    
    send_json_response(['data' => $rasi, 'error' => null]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = verify_auth_token($conn);
    if (!is_admin($conn, $user)) send_json_response(['error' => 'Forbidden'], 403);
    
    $data = get_json_input();
    
    $id = $data['id'] ?? generate_uuid();
    $title = $conn->real_escape_string($data['title']);
    $content = $conn->real_escape_string($data['content']);
    $lucky_color = $conn->real_escape_string($data['lucky_color'] ?? '');
    $lucky_number = $conn->real_escape_string($data['lucky_number'] ?? '');
    $is_active = isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1;
    
    $sql = "INSERT INTO rasi_palan (id, title, content, lucky_color, lucky_number, is_active) 
            VALUES ('$id', '$title', '$content', '$lucky_color', '$lucky_number', $is_active)";
    
    if ($conn->query($sql)) {
        send_json_response(['data' => ['id' => $id], 'error' => null], 201);
    } else {
        send_json_response(['error' => 'Failed to create rasi palan: ' . $conn->error], 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $user = verify_auth_token($conn);
    if (!is_admin($conn, $user)) send_json_response(['error' => 'Forbidden'], 403);
    
    $data = get_json_input();
    
    if (!isset($_GET['id'])) {
        send_json_response(['error' => 'Rasi Palan ID is required'], 400);
    }
    
    $id = $conn->real_escape_string($_GET['id']);
    $title = $conn->real_escape_string($data['title']);
    $content = $conn->real_escape_string($data['content']);
    $lucky_color = $conn->real_escape_string($data['lucky_color'] ?? '');
    $lucky_number = $conn->real_escape_string($data['lucky_number'] ?? '');
    $is_active = isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1;
    
    $sql = "UPDATE rasi_palan SET title = '$title', content = '$content', lucky_color = '$lucky_color', lucky_number = '$lucky_number', is_active = $is_active 
            WHERE id = '$id'";
    
    if ($conn->query($sql)) {
        send_json_response(['data' => true, 'error' => null]);
    } else {
        send_json_response(['error' => 'Failed to update rasi palan: ' . $conn->error], 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $user = verify_auth_token($conn);
    if (!is_admin($conn, $user)) send_json_response(['error' => 'Forbidden'], 403);
    
    if (!isset($_GET['id'])) {
        send_json_response(['error' => 'Rasi Palan ID is required'], 400);
    }
    
    $id = $conn->real_escape_string($_GET['id']);
    $sql = "DELETE FROM rasi_palan WHERE id = '$id'";
    
    if ($conn->query($sql)) {
        send_json_response(['data' => true, 'error' => null]);
    } else {
        send_json_response(['error' => 'Failed to delete rasi palan: ' . $conn->error], 500);
    }
}

$conn->close();
?>
