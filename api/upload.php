<?php
require_once 'config.php';
require_once 'cors.php';
require_once 'utils.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = verify_auth_token(getDBConnection());
    // Optional: restrict uploads to authenticated users
    // if (!$user) { send_json_response(['error' => 'Unauthorized'], 401); }

    if (!isset($_FILES['file'])) {
        send_json_response(['error' => 'No file uploaded'], 400);
    }
    
    $file = $_FILES['file'];
    $upload_dir = '../public/uploads/';
    
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    $file_ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    
    // Check if filename is provided in POST data (from frontend)
    if (isset($_POST['filename'])) {
        // Sanitize filename to prevent directory traversal
        $requested_filename = basename($_POST['filename']);
        // Ensure it has the correct extension or just use as is? 
        // Frontend sends "random.ext". trusting basename() is explicit enough for this scope.
        $new_filename = $requested_filename;
    } else {
        $new_filename = uniqid() . '.' . $file_ext;
    }
    $target_path = $upload_dir . $new_filename;
    
    if (move_uploaded_file($file['tmp_name'], $target_path)) {
        $public_url = '/uploads/' . $new_filename; // Relative URL
        send_json_response(['data' => ['publicUrl' => $public_url], 'error' => null]);
    } else {
        send_json_response(['error' => 'Failed to move uploaded file'], 500);
    }
}
?>
