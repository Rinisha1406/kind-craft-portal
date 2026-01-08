<?php
// Handle CORS
// Allow from localhost:8080 (Vite) and others for development
$allowed_origins = [
    'http://localhost:8080', 
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://localhost',
    'https://darkseagreen-ram-733578.hostingersite.com'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// DEBUG LOGGING
file_put_contents(__DIR__ . '/cors_debug.log', date('Y-m-d H:i:s') . " - Request from Origin: " . $origin . " Method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);

// Allow any origin that matches our list, or is empty (server-to-server or same-origin sometimes)
// For stricter security later, check strictly against list. For now, use the incoming origin if it's in the list.
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
} else {
    // Fallback for dev: if origin is not in list but we are in dev, maybe allow it? 
    // For now, let's log unauthorized origins
     file_put_contents(__DIR__ . '/cors_debug.log', " - BLOCKED Origin: " . $origin . "\n", FILE_APPEND);
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
