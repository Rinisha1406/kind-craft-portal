<?php
require_once 'config.php';
require_once 'cors.php';
require_once 'utils.php';

$conn = getDBConnection();

// GET: Fetch services
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM services WHERE 1=1";
    
    // Public filter: ?is_active=true
    if (isset($_GET['is_active']) && $_GET['is_active'] === 'true') {
        $sql .= " AND is_active = 1";
    }
    
    $sql .= " ORDER BY created_at ASC"; // Default order
    
    $result = $conn->query($sql);
    $services = [];
    
    while ($row = $result->fetch_assoc()) {
        // Decode JSON features
        $row['features'] = json_decode($row['features'] ?? '[]');
        $services[] = $row;
    }
    
    send_json_response(['data' => $services, 'error' => null]);
}

// POST: Create Service
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = verify_auth_token($conn);
    if (!is_admin($conn, $user)) send_json_response(['error' => 'Forbidden'], 403);
    
    $input = get_json_input();
    $id = generate_uuid();
    $title = $input['title'];
    $description = $input['description'] ?? '';
    // $icon = $input['icon'] ?? 'Sparkles'; // Removed
    $image_url = $input['image_url'] ?? '';
    // Features should be passed as array, store as JSON
    $features = isset($input['features']) ? json_encode($input['features']) : '[]';
    // $cta_text = $input['cta_text'] ?? ''; // Removed
    // $cta_link = $input['cta_link'] ?? ''; // Removed
    
    // Using default icon 'Sparkles' and empty CTA logic for database consistency if columns exist
    // Check if columns still exist in DB? Schema wasn't altered, so we should probably insert defaults or NULLs if they are required.
    // Looking at AdminServices, we removed them from UI. 
    // Let's just insert defaults into the DB so we don't break strict SQL if columns are NOT NULL.
    // Assuming columns are nullable or have defaults? 
    // In database.sql they are not visible? Ah, database.sql in prev turn didn't show services table?
    // Wait, view_file api/database.sql in step 43 did NOT show `services` table. 
    // But `AdminServices.tsx` uses `services` table. 
    // The user said "remove icon name, cta text, cta link".
    // I should provide defaults for now to be safe.
    
    $stmt = $conn->prepare("INSERT INTO services (id, title, description, icon, image_url, features, cta_text, cta_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $icon = 'Sparkles'; 
    $cta_text = '';
    $cta_link = '';
    $stmt->bind_param("ssssssss", $id, $title, $description, $icon, $image_url, $features, $cta_text, $cta_link);
    
    if ($stmt->execute()) {
        send_json_response(['error' => null, 'data' => ['id' => $id]]);
    } else {
        send_json_response(['error' => 'Failed to create service: ' . $stmt->error], 500);
    }
}

// PUT: Update Service
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $user = verify_auth_token($conn);
    if (!is_admin($conn, $user)) send_json_response(['error' => 'Forbidden'], 403);
    
    $input = get_json_input();
    if (!isset($_GET['id'])) send_json_response(['error' => 'Missing ID'], 400);
    $id = $_GET['id'];
    
    $fields = [];
    $types = "";
    $values = [];
    
    if (isset($input['title'])) { $fields[] = "title=?"; $types .= "s"; $values[] = $input['title']; }
    if (isset($input['description'])) { $fields[] = "description=?"; $types .= "s"; $values[] = $input['description']; }
    if (isset($input['icon'])) { 
        // Icon removed from UI, but if passed (legacy), update it? Or ignore?
        // Let's ignore or keep it but it won't be sent from UI.
        // $fields[] = "icon=?"; $types .= "s"; $values[] = $input['icon']; 
    }
    if (isset($input['image_url'])) { $fields[] = "image_url=?"; $types .= "s"; $values[] = $input['image_url']; }
    if (isset($input['features'])) { 
        $fields[] = "features=?"; 
        $types .= "s"; 
        $values[] = json_encode($input['features']); 
    }
    // Removed cta_text and cta_link updates
    if (isset($input['is_active'])) { 
        $fields[] = "is_active=?"; 
        $types .= "i"; 
        $values[] = $input['is_active'] === true ? 1 : 0; 
    }
    
    if (empty($fields)) send_json_response(['message' => 'Nothing to update']);
    
    $sql = "UPDATE services SET " . implode(", ", $fields) . " WHERE id = ?";
    $types .= "s";
    $values[] = $id;
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$values);
    
    if ($stmt->execute()) {
        send_json_response(['error' => null]);
    } else {
        send_json_response(['error' => 'Failed to update service'], 500);
    }
}

// DELETE: Delete Service
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $user = verify_auth_token($conn);
    if (!is_admin($conn, $user)) send_json_response(['error' => 'Forbidden'], 403);
    
    if (!isset($_GET['id'])) send_json_response(['error' => 'Missing ID'], 400);
    $id = $_GET['id'];
    
    $stmt = $conn->prepare("DELETE FROM services WHERE id = ?");
    $stmt->bind_param("s", $id);
    
    if ($stmt->execute()) {
        send_json_response(['error' => null]);
    } else {
        send_json_response(['error' => 'Failed to delete service'], 500);
    }
}
?>
