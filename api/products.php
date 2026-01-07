<?php
require_once 'config.php';
require_once 'cors.php';
require_once 'utils.php';

$conn = getDBConnection();

file_put_contents('../debug_products.log', date('Y-m-d H:i:s') . " - " . $_SERVER['REQUEST_METHOD'] . " " . $_SERVER['REQUEST_URI'] . "\n", FILE_APPEND);
if ($_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    file_put_contents('../debug_products.log', " - GET params: " . json_encode($_GET) . "\n", FILE_APPEND);
    file_put_contents('../debug_products.log', " - Input: " . file_get_contents('php://input') . "\n", FILE_APPEND);
}



// GET: Fetch products
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM products WHERE 1=1";
    
    if (isset($_GET['category'])) {
        $category = $conn->real_escape_string($_GET['category']);
        $sql .= " AND category = '$category'";
    }
    // Handle is_active filter if passed
    if (isset($_GET['is_active'])) {
        $is_active = $_GET['is_active'] === 'true' ? 1 : 0;
        $sql .= " AND is_active = $is_active";
    }

    if (isset($_GET['id'])) {
        $id = $conn->real_escape_string($_GET['id']);
        $sql .= " AND id = '$id'";
    }
    
    $result = $conn->query($sql);
    $products = [];
    
    while ($row = $result->fetch_assoc()) {
        if (isset($row['images'])) {
            $row['images'] = json_decode($row['images']);
        } else {
            $row['images'] = [];
        }
        $products[] = $row;
    }
    
    send_json_response(['data' => $products, 'error' => null]);
}

// POST: Create
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = verify_auth_token($conn);
    if (!is_admin($conn, $user)) send_json_response(['error' => 'Forbidden'], 403);
    
    $input = get_json_input();
    $id = generate_uuid();
    $name = $input['name'];
    $price = $input['price'];
    $category = $input['category'];
    $description = $input['description'] ?? '';
    $image_url = $input['image_url'] ?? '';
    $images = isset($input['images']) ? json_encode($input['images']) : '[]';
    $is_active = isset($input['is_active']) ? ($input['is_active'] ? 1 : 0) : 1;
    
    $stmt = $conn->prepare("INSERT INTO products (id, name, price, category, description, image_url, images, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssdssssi", $id, $name, $price, $category, $description, $image_url, $images, $is_active);
    
    if ($stmt->execute()) {
        send_json_response(['error' => null, 'data' => ['id' => $id]]);
    } else {
        send_json_response(['error' => 'Failed: ' . $stmt->error], 500);
    }
}

// PUT: Update
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $user = verify_auth_token($conn);
    if (!is_admin($conn, $user)) send_json_response(['error' => 'Forbidden'], 403);
    
    $input = get_json_input();
    
    if (!isset($_GET['id'])) send_json_response(['error' => 'Missing ID'], 400);
    $id = $_GET['id'];
    
    // Construct dynamic update
    $fields = [];
    $types = "";
    $values = [];
    
    if (isset($input['name'])) { $fields[] = "name=?"; $types .= "s"; $values[] = $input['name']; }
    if (isset($input['price'])) { $fields[] = "price=?"; $types .= "d"; $values[] = $input['price']; }
    if (isset($input['category'])) { $fields[] = "category=?"; $types .= "s"; $values[] = $input['category']; }
    if (isset($input['description'])) { $fields[] = "description=?"; $types .= "s"; $values[] = $input['description']; }
    if (isset($input['image_url'])) { $fields[] = "image_url=?"; $types .= "s"; $values[] = $input['image_url']; }
    if (isset($input['images'])) { $fields[] = "images=?"; $types .= "s"; $values[] = json_encode($input['images']); }
    if (isset($input['is_active'])) { $fields[] = "is_active=?"; $types .= "i"; $values[] = $input['is_active'] ? 1 : 0; }
    
    if (empty($fields)) send_json_response(['message' => 'Nothing to update']);
    
    $sql = "UPDATE products SET " . implode(", ", $fields) . " WHERE id = ?";
    $types .= "s";
    $values[] = $id;
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$values);
    
    if ($stmt->execute()) {
        send_json_response(['error' => null]);
    } else {
        send_json_response(['error' => 'Failed: ' . $stmt->error], 500);
    }
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $user = verify_auth_token($conn);
    if (!is_admin($conn, $user)) send_json_response(['error' => 'Forbidden'], 403);
    
    if (!isset($_GET['id'])) send_json_response(['error' => 'Missing ID'], 400);
    $id = $_GET['id'];
    
    $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
    $stmt->bind_param("s", $id);
    
    if ($stmt->execute()) {
        send_json_response(['error' => null]);
    } else {
        send_json_response(['error' => 'Failed'], 500);
    }
}
?>
