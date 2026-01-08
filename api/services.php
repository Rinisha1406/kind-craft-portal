<?php
require_once 'config.php';
require_once 'cors.php';
require_once 'utils.php';

$conn = getDBConnection();

// GET: Fetch services
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = verify_auth_token($conn);
    
    $mine = isset($_GET['mine']) && $_GET['mine'] === 'true';
    $admin_view = isset($_GET['admin']) && $_GET['admin'] === 'true';
    $id_filter = $_GET['id'] ?? null;
    
    // Support is_active filter from SupabaseCompat (.eq('is_active', true))
    // Default to true (1) for public view, but allow admin/mine to see all unless specified
    $is_active_filter = isset($_GET['is_active']) ? ($_GET['is_active'] === 'true' || $_GET['is_active'] === '1' ? 1 : 0) : null;
    
    if ($id_filter) {
        $stmt = $conn->prepare("SELECT s.*, m.full_name as provider_name FROM services s LEFT JOIN members m ON s.user_id = m.user_id WHERE s.id = ?");
        $stmt->bind_param("s", $id_filter);
        $stmt->execute();
        $result = $stmt->get_result();
    } elseif ($admin_view) {
        // Admin view: Fetch ALL services (or filtered by is_active if param provided)
        if (!is_admin($conn, $user)) send_json_response(['error' => 'Unauthorized'], 403);
        
        $sql = "SELECT s.*, m.full_name as provider_name 
                FROM services s 
                LEFT JOIN members m ON s.user_id = m.user_id";
        if ($is_active_filter !== null) $sql .= " WHERE s.is_active = $is_active_filter";
        $sql .= " ORDER BY s.created_at DESC";
        $result = $conn->query($sql);
    } elseif ($mine) {
        if (!$user) send_json_response(['error' => 'Unauthorized'], 401);
        $sql = "SELECT s.*, m.full_name as provider_name FROM services s LEFT JOIN members m ON s.user_id = m.user_id WHERE s.user_id = ?";
        if ($is_active_filter !== null) $sql .= " AND s.is_active = $is_active_filter";
        $sql .= " ORDER BY s.created_at DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $user['id']);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        // Public marketplace view (only active by default)
        $active_val = ($is_active_filter !== null) ? $is_active_filter : 1;
        $sql = "SELECT s.*, m.full_name as provider_name 
                FROM services s 
                LEFT JOIN members m ON s.user_id = m.user_id 
                WHERE s.is_active = $active_val 
                ORDER BY (s.user_id IS NULL) DESC, s.created_at DESC";
        $result = $conn->query($sql);
    }
    
    $services = [];
    while ($row = $result->fetch_assoc()) {
        // Convert is_active to integer for consistency
        $row['is_active'] = (int)$row['is_active'];
        
        // Decode features if it's a string
        if (isset($row['features']) && is_string($row['features'])) {
            $row['features'] = json_decode($row['features'], true) ?: [];
        }
        
        // Nest members object for frontend compatibility (matches supabase .select("*, members(...)"))
        $row['members'] = [
            'full_name' => $row['provider_name'] ?? 'Official'
        ];
        
        $services[] = $row;
    }
    send_json_response(['data' => $services, 'error' => null]);
}

// POST: Create Service
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = verify_auth_token($conn);
    if (!$user) send_json_response(['error' => 'Unauthorized'], 401);
    
    $input = get_json_input();
    $id = generate_uuid();
    $title = $input['title'] ?? '';
    $description = $input['description'] ?? '';
    $price = $input['price'] ?? '';
    $category = $input['category'] ?? 'General';
    $image_url = $input['image_url'] ?? '';
    $features = isset($input['features']) ? json_encode($input['features']) : '[]';
    
    // Check if user is admin
    $is_admin = is_admin($conn, $user);
    
    // If Admin is posting, user_id can be NULL (platform service)
    // If a regular user is posting, check membership
    $provider_id = null;
    
    if (!$is_admin) {
        $check = $conn->prepare("SELECT id FROM members WHERE user_id = ?");
        $check->bind_param("s", $user['id']);
        $check->execute();
        if ($check->get_result()->num_rows === 0) {
            send_json_response(['error' => 'Only paid members can offer services'], 403);
        }
        $provider_id = $user['id'];
    } else {
        // Admin can specify a provider or leave it NULL
        // If no user_id is provided in input, default to the admin's own ID so they can create services as themselves
        $provider_id = $input['user_id'] ?? $user['id'];
    }
    
    $stmt = $conn->prepare("INSERT INTO services (id, user_id, title, description, price, category, image_url, features, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)");
    $stmt->bind_param("ssssssss", $id, $provider_id, $title, $description, $price, $category, $image_url, $features);
    
    if ($stmt->execute()) {
        send_json_response(['error' => null, 'data' => ['id' => $id]]);
    } else {
        send_json_response(['error' => 'Failed to create service: ' . $stmt->error], 500);
    }
}

// PUT: Update Service
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $user = verify_auth_token($conn);
    if (!$user) send_json_response(['error' => 'Unauthorized'], 401);
    
    $id = $_GET['id'] ?? null;
    if (!$id) send_json_response(['error' => 'Missing ID'], 400);
    
    $input = get_json_input();
    $is_admin = is_admin($conn, $user);
    
    // Verify ownership if not admin
    if (!$is_admin) {
        $check = $conn->prepare("SELECT id FROM services WHERE id = ? AND user_id = ?");
        $check->bind_param("ss", $id, $user['id']);
        $check->execute();
        if ($check->get_result()->num_rows === 0) {
            send_json_response(['error' => 'Forbidden'], 403);
        }
    }
    
    $updates = [];
    $types = "";
    $params = [];
    
    $allowed = ['title', 'description', 'price', 'category', 'image_url', 'is_active', 'features'];
    foreach ($input as $key => $val) {
        if (in_array($key, $allowed)) {
            $updates[] = "$key = ?";
            if ($key === 'features') {
                $val = json_encode($val);
                $types .= "s";
            } elseif ($key === 'is_active') {
                $val = (int)$val;
                $types .= "i";
            } elseif (is_bool($val)) {
                $val = $val ? 1 : 0;
                $types .= "i";
            } else {
                $types .= "s";
            }
            $params[] = $val;
        }
    }
    
    if (!empty($updates)) {
        $sql = "UPDATE services SET " . implode(", ", $updates) . " WHERE id = ?";
        $types .= "s";
        $params[] = $id;
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        
        if ($stmt->execute()) {
            send_json_response(['message' => 'Service updated']);
        } else {
            send_json_response(['error' => 'Update failed: ' . $stmt->error], 500);
        }
    } else {
        send_json_response(['message' => 'No changes provided']);
    }
}

// DELETE: Remove Service
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $user = verify_auth_token($conn);
    if (!$user) send_json_response(['error' => 'Unauthorized'], 401);
    
    $id = $_GET['id'] ?? null;
    if (!$id) send_json_response(['error' => 'Missing ID'], 400);
    
    $is_admin = is_admin($conn, $user);
    
    if ($is_admin) {
        $stmt = $conn->prepare("DELETE FROM services WHERE id = ?");
        $stmt->bind_param("s", $id);
    } else {
        $stmt = $conn->prepare("DELETE FROM services WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ss", $id, $user['id']);
    }
    
    if ($stmt->execute()) {
        send_json_response(['message' => 'Service deleted']);
    } else {
        send_json_response(['error' => 'Delete failed'], 500);
    }
}
?>
