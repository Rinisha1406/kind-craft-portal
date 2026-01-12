-- Migration: Create rasi_palan table
-- Date: 2026-01-12

CREATE TABLE IF NOT EXISTS `rasi_palan` (
  `id` char(36) NOT NULL,
  `title` text NOT NULL,
  `content` longtext NOT NULL,
  `lucky_color` text DEFAULT NULL,
  `lucky_number` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
