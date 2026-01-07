<?php
require_once 'config.php';
require_once 'utils.php';

$conn = getDBConnection();

function check_table($conn, $table) {
    echo "<h3>Table: $table</h3>";
    $result = $conn->query("SHOW COLUMNS FROM $table");
    if ($result) {
        echo "<table border='1'><tr><th>Field</th><th>Type</th></tr>";
        while ($row = $result->fetch_assoc()) {
            echo "<tr><td>" . $row['Field'] . "</td><td>" . $row['Type'] . "</td></tr>";
        }
        echo "</table>";
    } else {
        echo "Error: " . $conn->error;
    }
}

check_table($conn, 'users');
check_table($conn, 'members');
check_table($conn, 'matrimony_profiles');

$conn->close();
?>
