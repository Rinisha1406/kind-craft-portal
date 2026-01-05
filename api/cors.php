<?php
// Handle CORS
// Allow from localhost:8080 (Vite) and others for development
$allowed_origins = ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins) || empty($origin)) {
    // Default to the first allowed origin if empty for dev safety, or simply echo back valid ones
    $allow_origin = in_array($origin, $allowed_origins) ? $origin : $allowed_origins[0];
    header("Access-Control-Allow-Origin: $allow_origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");         

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

header('Content-Type: application/json');
