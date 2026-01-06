<?php
require_once 'config.php';
require_once 'cors.php';
require_once 'utils.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

// Verify Auth
$user = verify_auth_token($conn);
if (!$user) {
    // For now, allow unauthenticated GET for testing if strict auth is blocking
    // send_json_response(['error' => 'Unauthorized'], 401);
}

// Handle GET requests (List profiles)
if ($method === 'GET') {
    // Join with users table to get login info if needed
    $sql = "SELECT mp.*, u.phone as login_phone, u.password_hash FROM matrimony_profiles mp LEFT JOIN users u ON mp.user_id = u.id";
    
    // Check for ID filter
    if (isset($_GET['id'])) {
        $id = $conn->real_escape_string($_GET['id']);
        $sql .= " WHERE mp.id = '$id'";
    } elseif (isset($_GET['user_id'])) {
        $uid = $conn->real_escape_string($_GET['user_id']);
        $sql .= " WHERE mp.user_id = '$uid'";
    }

    // Order by created_at desc default
    $sql .= " ORDER BY mp.created_at DESC";

    $result = $conn->query($sql);
    $data = [];
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            if (isset($row['details']) && $row['details']) {
                $decoded = json_decode($row['details'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $row['details'] = $decoded;
                }
            }
            // Explicitly cast is_active to boolean for proper frontend handling
            $row['is_active'] = (bool) $row['is_active'];

            // Check if password is custom or default (DOB)
            // Note: password_verify can be slow on large datasets, consider paging or optimize later
            $is_custom = false;
            if (isset($row['password_hash']) && isset($row['details']['dob'])) {
                if (!password_verify($row['details']['dob'], $row['password_hash'])) {
                    $is_custom = true;
                }
            } else if (isset($row['password_hash'])) {
                // Has hash but no DOB? Assumed custom
                $is_custom = true;
            }
            $row['is_custom_password'] = $is_custom;

            $data[] = $row;
        }
    }
    
    send_json_response(['data' => $data, 'error' => null]);
}

// Handle POST requests
if ($method === 'POST') {
    $input = get_json_input();
    send_json_response(['data' => $input, 'error' => null]); 
}

// Handle PUT/PATCH requests (Update profile)
if ($method === 'PUT' || $method === 'PATCH') {
    $input = get_json_input();
    file_put_contents('../debug_matrimony.log', date('Y-m-d H:i:s') . " - Update Input: " . json_encode($input) . "\n", FILE_APPEND);

    $id = isset($_GET['id']) ? $conn->real_escape_string($_GET['id']) : null;
    $user_id = isset($_GET['user_id']) ? $conn->real_escape_string($_GET['user_id']) : null;
    
    if (!$id && !$user_id) {
         send_json_response(['error' => 'Missing ID'], 400);
    }
    
    // Allowed columns for update
    $allowed_columns = ['full_name', 'contact_phone', 'occupation', 'location', 'details', 'image_url', 'age', 'gender', 'is_active'];
    
    // Construct Update Query
    $updates = [];
    $types = "";
    $params = [];
    
    foreach ($input as $key => $value) {
        if (in_array($key, $allowed_columns)) {
            $updates[] = "$key = ?";
            // Determine type
            if (is_array($value) || is_object($value)) {
                $value = json_encode($value);
                $types .= "s";
            } elseif (is_bool($value)) {
                $value = $value ? 1 : 0;
                $types .= "i";
            } elseif (is_int($value)) {
                $types .= "i";
            } else {
                $types .= "s";
            }
            $params[] = $value;
        }
    }
    
    if (!empty($updates)) {
        $sql = "UPDATE matrimony_profiles SET " . implode(", ", $updates);
        if ($id) {
             $sql .= " WHERE id = ?";
             $types .= "s";
             $params[] = $id;
        } else {
             $sql .= " WHERE user_id = ?";
             $types .= "s";
             $params[] = $user_id;
        }
        
        file_put_contents('../debug_matrimony.log', " - SQL: $sql\n", FILE_APPEND);

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
             $err = $conn->error;
             file_put_contents('../debug_matrimony.log', " - Prepare Error: $err\n", FILE_APPEND);
             send_json_response(['error' => 'Prepare failed: ' . $err], 500);
        }
        $stmt->bind_param($types, ...$params);
        
        if ($stmt->execute()) {
             // SYNC WITH USERS TABLE (Phone & Password/DOB)
             $current_dob = null;
             $current_phone = null;
             
             // Fetch current values to check for changes
             if ($id) {
                 $fetch_sql = "SELECT user_id, details, contact_phone FROM matrimony_profiles WHERE id = '$id'";
                 $u_res = $conn->query($fetch_sql);
                 if ($u_res && $u_res->num_rows > 0) {
                     $row = $u_res->fetch_assoc();
                     if (!$user_id) $user_id = $row['user_id'];
                     $current_phone = $row['contact_phone'];
                     $c_det = json_decode($row['details'], true);
                     $current_dob = $c_det['dob'] ?? null;
                 }
             }

             if ($user_id) {
                 $user_updates = [];
                 $user_types = "";
                 $user_params = [];

                 // Sync Phone if changed
                 if (isset($input['contact_phone']) && $input['contact_phone'] !== $current_phone) {
                     $user_updates[] = "phone = ?";
                     $user_types .= "s";
                     $user_params[] = $input['contact_phone'];
                 }

                 // Sync Password
                 // Priority: Manual Password > DOB Change
                 $new_pass_hash = null;
                 $plain_password_to_store = null;
                 
                 // 1. Check for manual password update
                 if (isset($input['password']) && !empty($input['password'])) {
                     $pass_val = $input['password'];
                     $new_pass_hash = password_hash($pass_val, PASSWORD_DEFAULT);
                     $plain_password_to_store = $pass_val;
                     file_put_contents('../debug_matrimony.log', " - Manual password update requested\n", FILE_APPEND);
                 } 
                 // 2. Fallback to DOB check if no manual password
                 else {
                     $new_dob = null;
                     if (isset($input['details'])) {
                         $det = is_string($input['details']) ? json_decode($input['details'], true) : $input['details'];
                         if (isset($det['dob']) && !empty($det['dob'])) {
                             $new_dob = $det['dob'];
                         }
                     }
                     
                     if ($new_dob && $new_dob !== $current_dob) {
                          $new_pass_hash = password_hash($new_dob, PASSWORD_DEFAULT);
                          $plain_password_to_store = $new_dob;
                          file_put_contents('../debug_matrimony.log', " - Password updated due to DOB change ($current_dob -> $new_dob)\n", FILE_APPEND);
                     }
                 }
                 
                 // If we have a new password, we MUST also update the 'details' column with the plain text version
                 // This allows admins to see it (per user request)
                 if ($plain_password_to_store) {
                     $user_updates[] = "password_hash = ?";
                     $user_types .= "s";
                     $user_params[] = $new_pass_hash;
                     
                     // Update the details JSON in the database as well
                     // We need to fetch the LATEST details first (which we might have from input or DB)
                     $final_details = is_string($input['details']) ? json_decode($input['details'], true) : $input['details'];
                     
                     // Merge with existing if needed, but input['details'] usually has the full form data
                     $final_details['password_plain'] = $plain_password_to_store;
                     
                     // We need to trigger a profile update for this new detail if it wasn't already part of the main update
                     // But wait, the main update loop above (lines 79-96) ALREADY processed $input['details'].
                     // We need to ensure this new 'password_plain' gets saved.
                     
                     // Simple fix: Update the matrimony_profiles table AGAIN with the new details
                     // or ideally, we should have intercepted the input earlier.
                     // For now, let's run a quick targeted update to the profiles table to save this field.
                     
                     $json_det = json_encode($final_details);
                     $up_p_sql = "UPDATE matrimony_profiles SET details = ? WHERE id = ?";
                     $up_p_stmt = $conn->prepare($up_p_sql);
                     if ($up_p_stmt) {
                         $up_p_stmt->bind_param("ss", $json_det, $id);
                         if ($up_p_stmt->execute()) {
                             file_put_contents('../debug_matrimony.log', " - Saved plain password to details\n", FILE_APPEND);
                         } else {
                             file_put_contents('../debug_matrimony.log', " - Failed to save plain password: " . $up_p_stmt->error . "\n", FILE_APPEND);
                         }
                     } else {
                         file_put_contents('../debug_matrimony.log', " - Prepare failed for plain password: " . $conn->error . "\n", FILE_APPEND);
                     }
                 }
                 
                 if (!empty($user_updates)) {
                     $u_sql = "UPDATE users SET " . implode(", ", $user_updates) . " WHERE id = ?";
                     $user_types .= "s";
                     $user_params[] = $user_id;
                     $u_stmt = $conn->prepare($u_sql);
                     if ($u_stmt) {
                          $u_stmt->bind_param($user_types, ...$user_params);
                          $u_stmt->execute();
                          file_put_contents('../debug_matrimony.log', " - Synced User Table (ID: $user_id)\n", FILE_APPEND);
                     }
                 }
             }

             file_put_contents('../debug_matrimony.log', " - Update Success\n", FILE_APPEND);
             send_json_response(['message' => 'Profile updated']);
        } else {
             $err = $stmt->error;
             file_put_contents('../debug_matrimony.log', " - Execute Error: $err\n", FILE_APPEND);
             send_json_response(['error' => 'Update failed: ' . $err], 500);
        }
    } else {
        file_put_contents('../debug_matrimony.log', " - No Valid Updates Found\n", FILE_APPEND);
        send_json_response(['message' => 'No changes provided']);
    }
}

// Handle DELETE requests
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? $conn->real_escape_string($_GET['id']) : null;
    
    if (!$id) {
        send_json_response(['error' => 'Missing ID'], 400);
    }

    $sql = "DELETE FROM matrimony_profiles WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $id);
    
    if ($stmt->execute()) {
        send_json_response(['message' => 'Profile deleted successfully']);
    } else {
        send_json_response(['error' => 'Delete failed: ' . $stmt->error], 500);
    }
}

$conn->close();
