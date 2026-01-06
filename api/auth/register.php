<?php
require_once '../config.php';
require_once '../cors.php';
require_once '../utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_response(['error' => 'Method not allowed'], 405);
}

$input = get_json_input();
file_put_contents('../debug_register.log', date('Y-m-d H:i:s') . " - Input: " . file_get_contents('php://input') . "\n", FILE_APPEND);

if (!$input || !isset($input['phone']) || !isset($input['password'])) {
    file_put_contents('../debug_register.log', " - Missing fields\n", FILE_APPEND);
    send_json_response(['error' => 'Missing phone or password'], 400);
}

$phone = $input['phone'];
$password = $input['password'];
$full_name = isset($input['options']['data']['full_name']) ? $input['options']['data']['full_name'] : '';

$conn = getDBConnection();
file_put_contents('../debug_register.log', " - DB Connected\n", FILE_APPEND);

// Check if user exists
$stmt = $conn->prepare("SELECT id FROM users WHERE phone = ?");
$stmt->bind_param("s", $phone);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    send_json_response(['error' => 'User already exists'], 409);
}

// Create new user
$user_id = generate_uuid();
$password_hash = password_hash($password, PASSWORD_DEFAULT);

$conn->begin_transaction();

try {
    // Insert user
    $email = $input['email'] ?? null;
    $stmt = $conn->prepare("INSERT INTO users (id, phone, email, password_hash) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $user_id, $phone, $email, $password_hash);
    if (!$stmt->execute()) {
        throw new Exception("Failed to create user");
    }
    file_put_contents('../debug_register.log', " - User inserted\n", FILE_APPEND);

    // Insert profile
    $profile_id = generate_uuid();
    $stmt = $conn->prepare("INSERT INTO profiles (id, user_id, phone, full_name) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $profile_id, $user_id, $phone, $full_name);
    if (!$stmt->execute()) {
        throw new Exception("Failed to create profile");
    }
    
    // Assign default role (user)
    $role_id = generate_uuid();
    $role = 'user';
    $stmt = $conn->prepare("INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $role_id, $user_id, $role);
    if (!$stmt->execute()) {
        throw new Exception("Failed to assign role");
    }
    file_put_contents('../debug_register.log', " - Role assigned\n", FILE_APPEND);

    $reg_type = isset($input['options']['data']['registration_type']) ? $input['options']['data']['registration_type'] : 'unknown';

    // Handle Matrimony Registration
    if ($reg_type === 'matrimony') {
        $matrimony_data = $input['options']['data'];
        $mat_id = generate_uuid();
        
        // Extract fields
        $age = isset($matrimony_data['dob']) ? date_diff(date_create($matrimony_data['dob']), date_create('today'))->y : 0;
        $gender = $matrimony_data['gender'] ?? 'other';
        $occupation = $matrimony_data['occupation'] ?? null;
        $education = null; 
        $location = $matrimony_data['location'] ?? $matrimony_data['city'] ?? null;
        $bio = null; 
        
        // details JSON for extra fields
        $details = json_encode([
             'father_name' => $matrimony_data['father_name'] ?? $matrimony_data['fatherName'] ?? null,
             'mother_name' => $matrimony_data['mother_name'] ?? $matrimony_data['motherName'] ?? null,
             'caste' => $matrimony_data['caste'] ?? null,
             'community' => $matrimony_data['community'] ?? null,
             'salary' => $matrimony_data['salary'] ?? null,
             'dob' => $matrimony_data['dob'] ?? null,
             'password_plain' => $password
        ]);

        $stmt_mat = $conn->prepare("INSERT INTO matrimony_profiles (id, user_id, full_name, age, gender, occupation, location, contact_phone, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt_mat->bind_param("sssisssss", $mat_id, $user_id, $full_name, $age, $gender, $occupation, $location, $phone, $details);
        
        if (!$stmt_mat->execute()) {
             throw new Exception("Failed to create matrimony profile: " . $stmt_mat->error);
        }
        file_put_contents('../debug_register.log', " - Matrimony inserted\n", FILE_APPEND);
    }
    // Handle Member Registration (ensure it shows in Admin Registrations)
    elseif ($reg_type === 'member') {
        $reg_id = generate_uuid();
        $stmt_reg = $conn->prepare("INSERT INTO registrations (id, registration_type, full_name, email, phone, status) VALUES (?, ?, ?, ?, ?, 'pending')");
        $stmt_reg->bind_param("sssss", $reg_id, $reg_type, $full_name, $email, $phone);
        if (!$stmt_reg->execute()) {
             // Optional: Log error but proceed
             file_put_contents('../debug_register.log', " - Failed to insert into registrations: " . $stmt_reg->error . "\n", FILE_APPEND);
        } else {
             file_put_contents('../debug_register.log', " - Member registration inserted\n", FILE_APPEND);
        }
    }

    $conn->commit();
    
    // Return success (similar to Supabase structure)
    send_json_response([
        'data' => [
            'user' => [
                'id' => $user_id,
                'phone' => $phone,
                'role' => 'authenticated'
            ],
            'session' => [
                'access_token' => $user_id, // SIMPLIFIED TOKEN
                'token_type' => 'bearer',
                'user' => [
                    'id' => $user_id,
                    'phone' => $phone
                ]
            ]
        ],
        'error' => null
    ], 200);

} catch (Exception $e) {
    $conn->rollback();
    file_put_contents('../debug_register.log', " - Exception: " . $e->getMessage() . "\n", FILE_APPEND);
    send_json_response(['error' => $e->getMessage()], 500);
}

$conn->close();
?>
