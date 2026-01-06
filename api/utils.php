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
        file_put_contents('../debug_auth.log', date('Y-m-d H:i:s') . " - Headers: " . json_encode($headers) . "\n", FILE_APPEND);
    
        if (!isset($headers['Authorization'])) {
            if (isset($_SERVER['HTTP_AUTHORIZATION'])) { // Nginx or fastcgi
                $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
            } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) { // Apache rewrite
                $headers['Authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            } else {
                file_put_contents('../debug_auth.log', " - No Authorization header found in Headers or SERVER vars\n", FILE_APPEND);
                return null;
            }
        }
        
        file_put_contents('../debug_auth.log', " - RAW Authorization: '" . $headers['Authorization'] . "'\n", FILE_APPEND);
        
        $token = str_replace('Bearer ', '', $headers['Authorization']);
        $token = trim($token); // Remove any whitespace
        file_put_contents('../debug_auth.log', " - Extracted Token: '" . $token . "'\n", FILE_APPEND);
    
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

// Check is admin
function is_admin($conn, $user) {
    if (!$user || !isset($user['id'])) return false;
    
    $user_id = $user['id'];
    $stmt = $conn->prepare("SELECT role FROM user_roles WHERE user_id = ? AND role = 'admin'");
    $stmt->bind_param("s", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->num_rows > 0;
}
?>
