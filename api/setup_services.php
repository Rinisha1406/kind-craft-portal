<?php
require_once 'config.php';
require_once 'utils.php';

$conn = getDBConnection();

$sql = "CREATE TABLE IF NOT EXISTS `services` (
  `id` char(36) NOT NULL,
  `title` text NOT NULL,
  `description` text DEFAULT NULL,
  `icon` text DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `features` text DEFAULT NULL,
  `cta_text` text DEFAULT NULL,
  `cta_link` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if ($conn->query($sql) === TRUE) {
    echo "Table 'services' created successfully or already exists.";
} else {
    echo "Error creating table: " . $conn->error;
}

$conn->close();
?>
