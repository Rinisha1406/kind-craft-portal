<?php
require_once 'config.php';

$conn = getDBConnection();

// Create news table
$sql_news = "CREATE TABLE IF NOT EXISTS `news` (
  `id` char(36) NOT NULL,
  `title` text NOT NULL,
  `content` longtext NOT NULL,
  `image_url` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

// Create rasi_palan table
$sql_rasi = "CREATE TABLE IF NOT EXISTS `rasi_palan` (
  `id` char(36) NOT NULL,
  `title` text NOT NULL,
  `content` longtext NOT NULL,
  `lucky_color` varchar(100) DEFAULT NULL,
  `lucky_number` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

try {
    $conn->query($sql_news);
    echo "Table 'news' created successfully.\n";
    
    $conn->query($sql_rasi);
    echo "Table 'rasi_palan' created successfully.\n";

    // Migrate data if blogs table exists
    $check_blogs = $conn->query("SHOW TABLES LIKE 'blogs'");
    if ($check_blogs->num_rows > 0) {
        // Migrate news
        $conn->query("INSERT INTO news (id, title, content, image_url, is_active, created_at, updated_at) 
                      SELECT id, title, content, image_url, is_active, created_at, updated_at 
                      FROM blogs WHERE category = 'news'");
        echo "Migrated news data.\n";

        // Migrate rasi_palan
        $conn->query("INSERT INTO rasi_palan (id, title, content, is_active, created_at, updated_at) 
                      SELECT id, title, content, is_active, created_at, updated_at 
                      FROM blogs WHERE category = 'rasi_palan'");
        echo "Migrated rasi_palan data.\n";

        // Drop blogs table
        $conn->query("DROP TABLE blogs");
        echo "Dropped legacy 'blogs' table.\n";
    }

} catch (Exception $e) {
    die("Error during migration: " . $e->getMessage());
}

$conn->close();
?>
