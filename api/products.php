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

function is_admin($conn, $user) {
    if (!$user) return false;
    $stmt = $conn->prepare("SELECT role FROM user_roles WHERE user_id = ? AND role = 'admin'");
    $stmt->bind_param("s", $user['id']);
    $stmt->execute();
    return $stmt->get_result()->num_rows > 0;
}

// GET: Fetch products
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM products WHERE 1=1";
    
    // If not admin, maybe hide inactive? But existing frontend filters by is_active=true usually.
    // AdminDashboard fetches all.
    // Let's just return all.
    
    if (isset($_GET['category'])) {
        $category = $conn->real_escape_string($_GET['category']);
        $sql .= " AND category = '$category'";
    }
    // Handle is_active filter if passed
    if (isset($_GET['is_active'])) {
        $is_active = $_GET['is_active'] === 'true' ? 1 : 0;
        $sql .= " AND is_active = $is_active";
    }
    
    $result = $conn->query($sql);
    $products = [];
    
    while ($row = $result->fetch_assoc()) {
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
    
    $stmt = $conn->prepare("INSERT INTO products (id, name, price, category, description, image_url) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssdsss", $id, $name, $price, $category, $description, $image_url);
    
    if ($stmt->execute()) {
        send_json_response(['error' => null, 'data' => ['id' => $id]]);
    } else {
        send_json_response(['error' => 'Failed'], 500);
    }
}

// PUT: Update
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $user = verify_auth_token($conn);
    if (!is_admin($conn, $user)) send_json_response(['error' => 'Forbidden'], 403);
    
    $input = get_json_input();
    // Assuming ID is passed in query string ?id=... or body. 
    // Supabase .eq('id', id) sends ?id=... in my QueryBuilder logic.
    // BUT mapped to PUT request? QueryBuilder.update doesn't exist yet, need to check calling code.
    // Calling code: supabase.from('products').update({...}).eq('id', id)
    // My QueryBuilder needs to handle update() then eq() then await.
    // It likely sends PUT /products.php?id=...
    
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
        send_json_response(['error' => 'Failed'], 500);
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
