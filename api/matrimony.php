<?php
require_once 'config.php';
require_once 'cors.php';
require_once 'utils.php';

$conn = getDBConnection();

// GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM matrimony_profiles WHERE is_active = 1";
    
    // User filter (my profile)
    if (isset($_GET['my_profile'])) {
        $user = verify_auth_token($conn);
        if (!$user) {
            send_json_response(['error' => 'Unauthorized'], 401);
        }
        $sql = "SELECT * FROM matrimony_profiles WHERE user_id = '" . $conn->real_escape_string($user['id']) . "'";
    }

    $result = $conn->query($sql);
    $profiles = [];
    while ($row = $result->fetch_assoc()) {
        $profiles[] = $row;
    }
    send_json_response(['data' => $profiles, 'error' => null]);
}

// POST: Create/Update profile
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = verify_auth_token($conn);
    if (!$user) {
        send_json_response(['error' => 'Unauthorized'], 401);
    }
    
    $input = get_json_input();
    
    // Logic for Create vs Update... normally handled by ID.
    // For simplicity, we assume one profile per user for 'create' or specific ID for update.
    // Let's do Insert for now.
    
    $id = generate_uuid();
    $full_name = $input['full_name'];
    $age = $input['age'];
    $gender = $input['gender'];
    $occupation = $input['occupation'] ?? '';
    $education = $input['education'] ?? '';
    $location = $input['location'] ?? '';
    $bio = $input['bio'] ?? '';
    $image_url = $input['image_url'] ?? '';
    $contact_email = $input['contact_email'] ?? '';
    $contact_phone = $input['contact_phone'] ?? '';
    
    $stmt = $conn->prepare("INSERT INTO matrimony_profiles (id, user_id, full_name, age, gender, occupation, education, location, bio, image_url, contact_email, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssissssssss", $id, $user['id'], $full_name, $age, $gender, $occupation, $education, $location, $bio, $image_url, $contact_email, $contact_phone);
    
    if ($stmt->execute()) {
        send_json_response(['error' => null, 'data' => ['id' => $id]]);
    } else {
        send_json_response(['error' => 'Failed to create profile'], 500);
    }
}
?>
