<?php
require_once 'config.php';

$conn = getDBConnection();

$sql = "SELECT id, full_name, gender FROM matrimony_profiles";
$result = $conn->query($sql);

echo "--- DB CONTENT ---\n";
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "ID: " . $row["id"] . " | Name: " . $row["full_name"] . " | Gender: '" . $row["gender"] . "'\n";
    }
} else {
    echo "0 results";
}
echo "------------------\n";

$conn->close();
?>
