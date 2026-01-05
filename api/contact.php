<?php
require_once 'config.php';
require_once 'cors.php';
require_once 'utils.php';

$conn = getDBConnection();

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
        send_json_response(['error' => null, 'message' => 'Message sent successfully']);
    } else {
        send_json_response(['error' => 'Failed to send message'], 500);
    }
} else {
    send_json_response(['error' => 'Method not allowed'], 405);
}
?>
