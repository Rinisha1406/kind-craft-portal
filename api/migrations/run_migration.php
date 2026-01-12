<?php
/**
 * Migration Runner Script
 * Run this file in your browser to create the news and rasi_palan tables
 * URL: http://localhost/kind-craft-portal/api/migrations/run_migration.php
 */

require_once '../config.php';

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html>
<head>
    <title>Database Migration</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .success { color: green; padding: 10px; background: #e8f5e9; border-left: 4px solid green; margin: 10px 0; }
        .error { color: red; padding: 10px; background: #ffebee; border-left: 4px solid red; margin: 10px 0; }
        .info { color: blue; padding: 10px; background: #e3f2fd; border-left: 4px solid blue; margin: 10px 0; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Database Migration Runner</h1>
    <p>This script will create the <code>news</code> and <code>rasi_palan</code> tables.</p>
";

try {
    $conn = getDBConnection();
    
    echo "<div class='info'>Connected to database successfully.</div>";
    
    // Read and execute the combined migration
    $sql = file_get_contents(__DIR__ . '/combined_migration.sql');
    
    // Split by semicolons to execute each statement separately
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    $successCount = 0;
    $errorCount = 0;
    
    foreach ($statements as $statement) {
        if (empty($statement) || strpos($statement, '--') === 0) {
            continue; // Skip empty lines and comments
        }
        
        echo "<div class='info'>Executing: <pre>" . htmlspecialchars(substr($statement, 0, 100)) . "...</pre></div>";
        
        if ($conn->query($statement)) {
            echo "<div class='success'>✓ Statement executed successfully</div>";
            $successCount++;
        } else {
            echo "<div class='error'>✗ Error: " . htmlspecialchars($conn->error) . "</div>";
            $errorCount++;
        }
    }
    
    echo "<hr>";
    echo "<h2>Migration Summary</h2>";
    echo "<div class='info'>";
    echo "<strong>Successful statements:</strong> $successCount<br>";
    echo "<strong>Failed statements:</strong> $errorCount";
    echo "</div>";
    
    // Verify tables exist
    echo "<h2>Verification</h2>";
    
    $tables = ['news', 'rasi_palan'];
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result && $result->num_rows > 0) {
            echo "<div class='success'>✓ Table <code>$table</code> exists</div>";
        } else {
            echo "<div class='error'>✗ Table <code>$table</code> does not exist</div>";
        }
    }
    
    $conn->close();
    
    echo "<hr>";
    echo "<div class='success'><strong>Migration completed!</strong> You can now close this page and test your News and Rasi Palan admin panels.</div>";
    
} catch (Exception $e) {
    echo "<div class='error'>Fatal Error: " . htmlspecialchars($e->getMessage()) . "</div>";
}

echo "</body></html>";
?>
