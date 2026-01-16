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

$user_id = null;
$user_exists = false;
$reg_type = isset($input['options']['data']['registration_type']) ? $input['options']['data']['registration_type'] : 'unknown';

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    $user_id = $user['id'];
    $user_exists = true;

    // Check for specific profile existence
    if ($reg_type === 'matrimony') {
        $stmt_mat = $conn->prepare("SELECT id FROM matrimony_profiles WHERE user_id = ?");
        $stmt_mat->bind_param("s", $user_id);
        $stmt_mat->execute();
        if ($stmt_mat->get_result()->num_rows > 0) {
            send_json_response(['error' => 'Matrimony profile already registered for this number'], 409);
        }
    } elseif ($reg_type === 'member') {
        $stmt_mem = $conn->prepare("SELECT id FROM members WHERE user_id = ?");
        $stmt_mem->bind_param("s", $user_id);
        $stmt_mem->execute();
        if ($stmt_mem->get_result()->num_rows > 0) {
            send_json_response(['error' => 'Member profile already registered for this number'], 409);
        }
    } else {
        send_json_response(['error' => 'User already exists'], 409);
    }
}

$conn->begin_transaction();

try {
    if (!$user_exists) {
        $user_id = generate_uuid();
        $password_hash = password_hash($password, PASSWORD_DEFAULT);

        // Insert user
        $stmt = $conn->prepare("INSERT INTO users (id, phone, password_hash, password_plain) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $user_id, $phone, $password_hash, $password);
        if (!$stmt->execute()) {
            throw new Exception("Failed to create user");
        }
        file_put_contents('../debug_register.log', " - User inserted\n", FILE_APPEND);

        // Insert basic profile
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
    }

    // Handle Matrimony Registration
    if ($reg_type === 'matrimony') {
        $matrimony_data = $input['options']['data'];
        
        // Extract fields
        $age = isset($matrimony_data['dob']) ? date_diff(date_create($matrimony_data['dob']), date_create('today'))->y : 0;
        $gender = $matrimony_data['gender'] ?? 'other';
        $occupation = $matrimony_data['occupation'] ?? null;
        $location = $matrimony_data['location'] ?? $matrimony_data['city'] ?? null;
        
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

        $stmt_mat = $conn->prepare("INSERT INTO matrimony_profiles (user_id, full_name, age, gender, occupation, location, contact_phone, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt_mat->bind_param("ssisssss", $user_id, $full_name, $age, $gender, $occupation, $location, $phone, $details);
        
        if (!$stmt_mat->execute()) {
             throw new Exception("Failed to create matrimony profile: " . $stmt_mat->error);
        }
        file_put_contents('../debug_register.log', " - Matrimony inserted\n", FILE_APPEND);
    }
    // Handle Member Registration
    elseif ($reg_type === 'member') {
        $member_data = $input['options']['data'] ?? [];
        $address = $member_data['address'] ?? '';
        
        // Check if member already exists for this user (additional safety)
        $stmt_check = $conn->prepare("SELECT id FROM members WHERE user_id = ?");
        $stmt_check->bind_param("s", $user_id);
        $stmt_check->execute();
        if ($stmt_check->get_result()->num_rows === 0) {
            $member_id = generate_uuid();
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt_member = $conn->prepare("INSERT INTO members (id, user_id, full_name, phone, password_hash, password_plain, address, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)");
            $stmt_member->bind_param("sssssss", $member_id, $user_id, $full_name, $phone, $password_hash, $password, $address);
            
            if (!$stmt_member->execute()) {
                throw new Exception("Failed to insert into members: " . $stmt_member->error);
            }
        }
    }

    $conn->commit();
    
    // Return success
    send_json_response([
        'data' => [
            'user' => [
                'id' => $user_id,
                'phone' => $phone,
                'role' => 'authenticated'
            ],
            'session' => [
                'access_token' => $user_id,
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
    if ($conn->connect_errno === 0) {
        $conn->rollback();
    }
    file_put_contents('../debug_register.log', " - Exception: " . $e->getMessage() . "\n", FILE_APPEND);
    send_json_response(['error' => $e->getMessage()], 500);
}

$conn->close();
?>
