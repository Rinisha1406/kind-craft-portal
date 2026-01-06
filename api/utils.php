<?php
// Utility functions

// Generate a UUID v4
function generate_uuid() {
    return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
        mt_rand( 0, 0xffff ),
        mt_rand( 0, 0x0fff ) | 0x4000,
        mt_rand( 0, 0x3fff ) | 0x8000,
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
    );
}

// Send JSON response
function send_json_response($data, $status_code = 200) {
    http_response_code($status_code);
    echo json_encode($data);
    exit();
}

// Get JSON input
function get_json_input() {
    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return null; // Or handle error
    }
    return $input;
}

// Verify Auth Token (Simple simulation for now, should be replaced with JWT or Session check)
function verify_auth_token($conn) {
    $headers = apache_request_headers();
    // Log all headers for debugging
    file_put_contents('../debug_auth.log', date('Y-m-d H:i:s') . " - Headers: " . json_encode($headers) . "\n", FILE_APPEND);

    if (!isset($headers['Authorization'])) {
        file_put_contents('../debug_auth.log', " - No Authorization header found\n", FILE_APPEND);
        return null;
    }
    
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    file_put_contents('../debug_auth.log', " - Token: " . $token . "\n", FILE_APPEND);
    
    $user_id = $conn->real_escape_string($token);
    $result = $conn->query("SELECT * FROM users WHERE id = '$user_id'");
    
    if ($result && $result->num_rows > 0) {
        $user = $result->fetch_assoc();
        file_put_contents('../debug_auth.log', " - User found: " . $user['id'] . "\n", FILE_APPEND);
        return $user;
    } else {
        file_put_contents('../debug_auth.log', " - User NOT found for ID: " . $user_id . "\n", FILE_APPEND);
    }
    
    return null;
}
