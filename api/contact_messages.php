<?php
require_once 'config.php';
require_once 'cors.php';
require_once 'utils.php';

$conn = getDBConnection();


if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = verify_auth_token($conn);
    if (!is_admin($conn, $user)) send_json_response(['error' => 'Forbidden'], 403);
    
    $result = $conn->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
    $messages = [];
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }
    send_json_response(['data' => $messages, 'error' => null]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = get_json_input();
    $name = $input['name'] ?? '';
    $email = $input['email'] ?? '';
    $phone = $input['phone'] ?? '';
    $subject = $input['subject'] ?? 'Contact Form';
    $message = $input['message'] ?? '';
    
    if (empty($name) || empty($email) || empty($message)) {
        send_json_response(['error' => 'Missing required fields'], 400);
    }
    
    $id = generate_uuid();
    $stmt = $conn->prepare("INSERT INTO contact_messages (id, name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $id, $name, $email, $phone, $subject, $message);
    
    if ($stmt->execute()) {
        send_json_response(['error' => null, 'message' => 'Message sent']);
    } else {
        send_json_response(['error' => 'Failed'], 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $user = verify_auth_token($conn);
    if (!is_admin($conn, $user)) send_json_response(['error' => 'Forbidden'], 403);
    if (!isset($_GET['id'])) send_json_response(['error' => 'Missing ID'], 400);
    
    $input = get_json_input();
    if (isset($input['is_read'])) {
        $is_read = $input['is_read'] ? 1 : 0;
        $stmt = $conn->prepare("UPDATE contact_messages SET is_read = ? WHERE id = ?");
        $stmt->bind_param("is", $is_read, $_GET['id']);
        $stmt->execute();
    }
    send_json_response(['error' => null]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $user = verify_auth_token($conn);
    if (!is_admin($conn, $user)) send_json_response(['error' => 'Forbidden'], 403);
    if (!isset($_GET['id'])) send_json_response(['error' => 'Missing ID'], 400);
    
    $stmt = $conn->prepare("DELETE FROM contact_messages WHERE id = ?");
    $stmt->bind_param("s", $_GET['id']);
    $stmt->execute();
    send_json_response(['error' => null]);
}
?>
