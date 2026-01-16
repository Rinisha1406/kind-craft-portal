<?php
require_once 'config.php';
require_once 'cors.php';
require_once 'utils.php';

$conn = getDBConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handle_get($conn);
        break;
    case 'POST':
        handle_post($conn);
        break;
    case 'PUT':
        handle_put($conn);
        break;
    case 'DELETE':
        handle_delete($conn);
        break;
    default:
        send_json_response(['error' => 'Method not allowed'], 405);
}

function handle_get($conn) {
    $sql = "SELECT * FROM gallery ORDER BY created_at DESC";
    $result = $conn->query($sql);
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
    send_json_response(['data' => $items, 'error' => null]);
}

function handle_post($conn) {
    $user = verify_auth_token($conn);
    if (!$user || !is_admin($conn, $user)) {
        send_json_response(['error' => 'Unauthorized'], 401);
    }

    $input = get_json_input();
    if (!$input || !isset($input['type']) || !isset($input['url'])) {
        send_json_response(['error' => 'Missing required fields'], 400);
    }

    $id = generate_uuid();
    $type = $input['type'];
    $url = $input['url'];
    $title = $input['title'] ?? null;
    $is_active = isset($input['is_active']) ? ($input['is_active'] ? 1 : 0) : 1;

    $stmt = $conn->prepare("INSERT INTO gallery (id, type, url, title, is_active) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssi", $id, $type, $url, $title, $is_active);

    if ($stmt->execute()) {
        send_json_response(['data' => ['id' => $id], 'error' => null]);
    } else {
        send_json_response(['error' => $stmt->error], 500);
    }
}

function handle_put($conn) {
    $user = verify_auth_token($conn);
    if (!$user || !is_admin($conn, $user)) {
        send_json_response(['error' => 'Unauthorized'], 401);
    }

    $input = get_json_input();
    $id = $_GET['id'] ?? null;
    if (!$id || !$input) {
        send_json_response(['error' => 'Missing ID or data'], 400);
    }

    $fields = [];
    $types = "";
    $values = [];

    if (isset($input['type'])) { $fields[] = "type=?"; $types .= "s"; $values[] = $input['type']; }
    if (isset($input['url'])) { $fields[] = "url=?"; $types .= "s"; $values[] = $input['url']; }
    if (isset($input['title'])) { $fields[] = "title=?"; $types .= "s"; $values[] = $input['title']; }
    if (isset($input['is_active'])) { $fields[] = "is_active=?"; $types .= "i"; $values[] = $input['is_active'] ? 1 : 0; }

    if (empty($fields)) {
        send_json_response(['error' => 'No fields to update'], 400);
    }

    $sql = "UPDATE gallery SET " . implode(", ", $fields) . " WHERE id=?";
    $types .= "s";
    $values[] = $id;

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$values);

    if ($stmt->execute()) {
        send_json_response(['data' => true, 'error' => null]);
    } else {
        send_json_response(['error' => $stmt->error], 500);
    }
}

function handle_delete($conn) {
    $user = verify_auth_token($conn);
    if (!$user || !is_admin($conn, $user)) {
        send_json_response(['error' => 'Unauthorized'], 401);
    }

    $id = $_GET['id'] ?? null;
    if (!$id) {
        send_json_response(['error' => 'Missing ID'], 400);
    }

    $stmt = $conn->prepare("DELETE FROM gallery WHERE id = ?");
    $stmt->bind_param("s", $id);

    if ($stmt->execute()) {
        send_json_response(['data' => true, 'error' => null]);
    } else {
        send_json_response(['error' => $stmt->error], 500);
    }
}
?>
