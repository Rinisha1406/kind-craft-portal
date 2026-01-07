<?php
require_once 'config.php';

$conn = getDBConnection();

// Check unique genders
$sql = "SELECT gender, COUNT(*) as count FROM matrimony_profiles GROUP BY gender";
$result = $conn->query($sql);

echo "Genders in Database:\n";
while ($row = $result->fetch_assoc()) {
    echo "Gender: '" . $row['gender'] . "' - Count: " . $row['count'] . "\n";
}

// Fetch a few sample profiles to see exact values
echo "\nSample Profiles:\n";
$sql = "SELECT id, full_name, gender FROM matrimony_profiles LIMIT 5";
$result = $conn->query($sql);
while ($row = $result->fetch_assoc()) {
    echo "ID: " . $row['id'] . ", Name: " . $row['full_name'] . ", Gender: '" . $row['gender'] . "'\n";
}

$conn->close();
?>
