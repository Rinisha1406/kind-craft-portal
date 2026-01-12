<?php
// Environment Detection & Database Configuration
$is_local = (php_sapi_name() === 'cli' || $_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['REMOTE_ADDR'] === '127.0.0.1');

if ($is_local) {
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_NAME', 'kind_craft_portal');
} else {
    define('DB_HOST', 'localhost');
    define('DB_USER', 'u891495087_kind_craft');
    define('DB_PASS', 'KindCraft8@');
    define('DB_NAME', 'u891495087_kind_craft');
}

function getDBConnection() {
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        return $conn;
    } catch (Exception $e) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        exit();
    }
}
