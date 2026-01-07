<?php
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

$conn = getDBConnection();

$gender = $_GET['gender'] ?? '';
$exclude_id = $_GET['exclude_id'] ?? '';

if (!$gender) {
    echo json_encode(['error' => 'Missing gender']);
    exit;
}

// Determine target gender (simple case-insensitive toggle)
$current_gender = strtolower($gender);
$target_gender = '';

if ($current_gender == 'male') {
    $target_gender = 'female';
} elseif ($current_gender == 'female') {
    $target_gender = 'male';
} else {
    // If gender is unknown/other, maybe return all others? Or none.
    // For now, let's return none to be safe.
    echo json_encode([]);
    exit;
}

// Prepare Query
// We use ILIKE logic by just using the standardized string since we normalized input.
// Note: In database, gender might be 'Female', 'female', 'Male', 'male'. 
// MySQL comparisons are case-insensitive by default for non-binary strings, so 'female' = 'Female'.
$sql = "SELECT * FROM matrimony_profiles WHERE gender = ?";
$types = "s";
$params = [$target_gender];

if ($exclude_id) {
    $sql .= " AND id != ?";
    $types .= "s";
    $params[] = $exclude_id;
}

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$matches = [];
while ($row = $result->fetch_assoc()) {
    // Decode 'details' JSON column if it exists and is a string
    if (isset($row['details']) && is_string($row['details'])) {
        $decoded = json_decode($row['details'], true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $row['details'] = $decoded;
        }
    }
    $matches[] = $row;
}

echo json_encode($matches);

$conn->close();
?>
