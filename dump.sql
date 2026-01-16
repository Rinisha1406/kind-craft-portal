-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jan 16, 2026 at 06:10 AM
-- Server version: 11.8.3-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------

--
-- Table structure for table `blogs`
--

CREATE TABLE `blogs` (
  `id` char(36) NOT NULL,
  `title` text NOT NULL,
  `content` longtext NOT NULL,
  `category` enum('news','rasi_palan') NOT NULL,
  `image_url` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` char(36) NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `phone` text DEFAULT NULL,
  `subject` text DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `email`, `phone`, `subject`, `message`, `is_read`, `created_at`) VALUES
('2230e960-39d0-466e-9080-ede4172a7877', 'Rinisha', 'demo@gmail.com', '9047432544', 'test', 'lorem ipsum dolor sit', 0, '2026-01-08 13:18:01'),
('b8dae757-080c-497c-82c0-6721c07ce9f8', 'Rinisha', 'demo@gmail.com', '9047432544', 'test', 'lorem ipsum dolor sit', 0, '2026-01-08 13:18:17'),
('f44963f6-96fe-4ad4-a687-862ccbfd8846', 'riya', 'tester@gmail.com', '1234567878', 'Good Evening $name', 'lorem ipsum dolor', 0, '2026-01-07 10:30:29');

-- --------------------------------------------------------

--
-- Table structure for table `matrimony_profiles`
--

CREATE TABLE `matrimony_profiles` (
  `id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 0,
  `is_approved` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `full_name` text NOT NULL,
  `phone` text DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `password_plain` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `membership_type` text DEFAULT 'standard',
  `member_details` longtext DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`id`, `user_id`, `full_name`, `phone`, `password_hash`, `password_plain`, `address`, `membership_type`, `member_details`, `is_active`, `created_at`, `updated_at`) VALUES
('8acb3118-fde7-4520-b444-d079684da78d', '708ab764-e35d-4a3f-9797-cfbe31966717', 'Sekar', '7418094867', '$2y$10$dbiReLsfSAPyUX5jtd5nE.bz3s/vgCxf7yNLXokT58yk8eGMp8muW', '123456', '147.R. k. Mtt Road. R. A. Puram, chennai 600028', 'standard', NULL, 1, '2026-01-10 17:33:38', '2026-01-10 17:33:38');

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `id` char(36) NOT NULL,
  `title` text NOT NULL,
  `content` longtext NOT NULL,
  `image_url` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `news`
--

INSERT INTO `news` (`id`, `title`, `content`, `image_url`, `is_active`, `created_at`, `updated_at`) VALUES
('1421113d-b183-4f99-b6db-e03d04f08a2f', 'test', 'osngrio[hnea[bon[ietnhorengorgn[q', 'data:image/jpeg;base64,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', 1, '2026-01-12 09:57:36', '2026-01-12 09:57:36');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` char(36) NOT NULL,
  `name` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` enum('silver','gold','diamond','platinum','gemstone') NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `category`, `description`, `image_url`, `is_active`, `created_at`, `updated_at`, `images`) VALUES
('0313903c-b003-40f3-81df-23d4ea181d8d', 'SET', 0.00, 'gold', 'SET', '/public/uploads/1768136518346_ui2yposu6.jpeg', 1, '2026-01-11 13:02:04', '2026-01-11 13:04:44', '[\"\\/public\\/uploads\\/1768136518346_ui2yposu6.jpeg\"]'),
('049c7a6f-e5d0-42fa-8ef9-6b548f32b212', 'RING', 0.00, 'gold', 'BEST RING DESIGN', '/public/uploads/1768136003426_g2n0p57hr.jpeg', 1, '2026-01-11 12:53:23', '2026-01-11 13:00:54', '[\"\\/public\\/uploads\\/1768136003426_g2n0p57hr.jpeg\"]'),
('04f5139e-85c7-4ac6-bd46-4853585d6691', 'CHAIN', 0.00, 'gold', 'NECKLACE', '/public/uploads/1768136144676_cjaccq5wn.jpeg', 1, '2026-01-11 12:55:44', '2026-01-11 13:00:54', '[\"\\/public\\/uploads\\/1768136144676_cjaccq5wn.jpeg\"]'),
('15434634-e395-4a1e-b134-eb159b473772', 'RING', 0.00, 'gold', 'Best Ring Design ', '/public/uploads/1768135952048_0ifteherd.jpeg', 1, '2026-01-11 12:52:32', '2026-01-11 13:00:54', '[\"\\/public\\/uploads\\/1768135952048_0ifteherd.jpeg\"]'),
('1f1c9c90-28ad-4a52-b595-640eae462a2e', 'NECKLACE', 0.00, 'gold', 'NECKLACE', '/public/uploads/1768136120553_jqgccsw2e.jpeg', 1, '2026-01-11 12:55:20', '2026-01-11 13:00:54', '[\"\\/public\\/uploads\\/1768136120553_jqgccsw2e.jpeg\"]'),
('23ba6a6f-4414-408e-9cc3-f598f9c7c987', 'CHAIN', 0.00, 'gold', 'CHAIN', '/public/uploads/1768136294135_6ekmvvpn1.jpeg', 1, '2026-01-11 12:58:14', '2026-01-11 13:00:54', '[\"\\/public\\/uploads\\/1768136294135_6ekmvvpn1.jpeg\"]'),
('324568fc-743f-4333-a3ff-4bb0d2948c76', 'BANGLE', 0.00, 'gold', 'BANGLE', '/public/uploads/1768136268172_gw7r32so4.jpeg', 1, '2026-01-11 12:57:48', '2026-01-12 14:00:01', '[\"\\/public\\/uploads\\/1768136268172_gw7r32so4.jpeg\"]'),
('448da0e1-8cba-4c36-a148-663cb191ca2d', 'CHAIN', 0.00, 'gold', 'CHAIN', '/public/uploads/1768136618852_3femj1xfh.jpeg', 1, '2026-01-11 13:03:39', '2026-01-11 13:04:44', '[\"\\/public\\/uploads\\/1768136618852_3femj1xfh.jpeg\"]'),
('50937a6f-58c5-44f6-a0e3-d5efcf2c75d5', 'NECKLACE', 0.00, 'gold', 'NECKLACE', '/public/uploads/1768136096343_oc79xx16f.jpeg', 1, '2026-01-11 12:54:56', '2026-01-11 13:00:54', '[\"\\/public\\/uploads\\/1768136096343_oc79xx16f.jpeg\"]'),
('56d2dae7-151b-4249-a8b8-b42cdfc60e9e', 'SET', 0.00, 'gold', 'SET', '/public/uploads/1768136335344_80u0vqqvx.jpeg', 1, '2026-01-11 12:58:55', '2026-01-11 13:00:54', '[\"\\/public\\/uploads\\/1768136335344_80u0vqqvx.jpeg\"]'),
('99ef90cd-83c1-4c6d-a12c-1ba91d80c965', 'RING', 0.00, 'gold', 'RING', '/public/uploads/1768136199224_dbnj0810q.jpeg', 1, '2026-01-11 12:56:39', '2026-01-11 13:00:54', '[\"\\/public\\/uploads\\/1768136199224_dbnj0810q.jpeg\"]'),
('a888bfe5-18ba-42c3-9eda-e3450c26e450', 'CHAIN', 0.00, 'gold', 'CHAIN', '/public/uploads/1768136232071_31cu2v8z8.jpeg', 1, '2026-01-11 12:57:12', '2026-01-11 13:00:54', '[\"\\/public\\/uploads\\/1768136232071_31cu2v8z8.jpeg\"]'),
('b3927ce9-d9de-4505-a988-fa8495221fbf', 'CHAIN', 0.00, 'gold', 'CHAIN', '/public/uploads/1768136542596_gmuk9njm6.jpeg', 1, '2026-01-11 13:02:23', '2026-01-11 13:04:44', '[\"\\/public\\/uploads\\/1768136542596_gmuk9njm6.jpeg\"]'),
('bb09f2ed-3ba6-47e9-9a80-85fae2d609ba', 'CHAIN', 0.00, 'gold', 'CHAIN', '/public/uploads/1768136164734_ff9hdzsey.jpeg', 1, '2026-01-11 12:56:05', '2026-01-11 13:00:54', '[\"\\/public\\/uploads\\/1768136164734_ff9hdzsey.jpeg\"]');

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

CREATE TABLE `profiles` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `full_name` text DEFAULT NULL,
  `phone` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`id`, `user_id`, `full_name`, `phone`, `created_at`, `updated_at`) VALUES
('98cf5bcd-6818-4ea7-9948-5f7bd074d85f', '708ab764-e35d-4a3f-9797-cfbe31966717', 'Sekar', '7418094867', '2026-01-10 17:33:38', '2026-01-10 17:33:38');

-- --------------------------------------------------------

--
-- Table structure for table `rasi_palan`
--

CREATE TABLE `rasi_palan` (
  `id` char(36) NOT NULL,
  `title` text NOT NULL,
  `content` longtext NOT NULL,
  `lucky_color` text DEFAULT NULL,
  `lucky_number` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rasi_palan`
--

INSERT INTO `rasi_palan` (`id`, `title`, `content`, `lucky_color`, `lucky_number`, `is_active`, `created_at`, `updated_at`) VALUES
('55daf159-be2f-44e4-948c-99ea218a81b2', 'libra', 'ing;oarjgna;ergnragragnjer;', 'blue', '7', 1, '2026-01-12 09:58:23', '2026-01-12 09:58:23');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `cta_text` varchar(50) DEFAULT NULL,
  `cta_link` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` varchar(36) DEFAULT NULL,
  `price` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `title`, `description`, `icon`, `image_url`, `features`, `cta_text`, `cta_link`, `is_active`, `display_order`, `created_at`, `user_id`, `price`, `category`) VALUES
('b26aa2ce-ecf7-11f0-961d-c70ce65f29af', 'Motor Vehicle Insurance', 'Motor vehicle insurance services.', 'directions_car', '/public/uploads/696057d7da943.jpg', '[\"Motor insurance\",\"All vehicle types\",\"Policy support\"]', 'Enquire Now', '#', 1, 1, '2026-01-09 01:08:24', '1', NULL, 'Insurance'),
('b26aa534-ecf7-11f0-961d-c70ce65f29af', 'Two Wheeler Insurance', 'General insurance for two wheelers.', 'two_wheeler', '/public/uploads/6960585a5cff7.jpg', '[\"Bike insurance\",\"Scooter insurance\",\"Third party\"]', 'Enquire Now', '#', 1, 2, '2026-01-09 01:08:24', '1', NULL, 'Insurance'),
('b26aa575-ecf7-11f0-961d-c70ce65f29af', 'Four Wheeler Insurance', 'Car insurance for private vehicles.', 'directions_car_filled', '/public/uploads/6960588d7557c.avif', '[\"Car insurance\",\"Private vehicles\",\"Renewals\"]', 'Enquire Now', '#', 1, 3, '2026-01-09 01:08:24', '1', NULL, 'Insurance'),
('b26aa599-ecf7-11f0-961d-c70ce65f29af', 'Travel Vehicle Insurance', 'Insurance for T-board cars and buses.', 'airport_shuttle', '/public/uploads/696058e41d646.avif', '[\"Bus insurance\",\"Commercial vehicles\",\"Passenger cover\"]', 'Enquire Now', '#', 1, 4, '2026-01-09 01:08:24', '1', NULL, 'Insurance'),
('b26aa5bd-ecf7-11f0-961d-c70ce65f29af', 'Life Insurance', 'Life cover insurance policies.', 'favorite', '/public/uploads/69605946bfcf3.webp', '[\"Life cover\",\"Family security\",\"All ages\"]', 'Enquire Now', '#', 1, 5, '2026-01-09 01:08:24', '1', NULL, 'Insurance'),
('b26aa600-ecf7-11f0-961d-c70ce65f29af', 'Pension Plans', 'Lifetime pension plans for all age groups.', 'elderly', '/public/uploads/6960598dc9e08.jpg', '[\"Monthly pension\",\"Lifetime income\",\"Senior plans\"]', 'Enquire Now', '#', 1, 6, '2026-01-09 01:08:24', '1', NULL, 'Insurance'),
('b26aa622-ecf7-11f0-961d-c70ce65f29af', 'Regulated Insurance Services', 'Insurance policies regulated by RBI, SEBI, IRDA.', 'verified', '/public/uploads/696059d5bb921.jpg', '[\"RBI regulated\",\"SEBI approved\",\"IRDA compliant\"]', 'View Details', '#', 1, 7, '2026-01-09 01:08:24', '1', NULL, 'Finance'),
('b26aa642-ecf7-11f0-961d-c70ce65f29af', 'Utility Bill Payments', 'EB, water and gas bill payment services.', 'receipt_long', '/public/uploads/69605a3735d14.jpg', '[\"EB bill\",\"Water bill\",\"Gas bill\"]', 'Pay Now', '#', 1, 8, '2026-01-09 01:08:24', '1', NULL, 'Payments'),
('b26aa667-ecf7-11f0-961d-c70ce65f29af', 'Mobile Recharge', 'All prepaid mobile recharges.', 'smartphone', '/public/uploads/69605a6adc909.webp', '[\"All networks\",\"Prepaid only\",\"Wallet recharge\"]', 'Recharge Now', '#', 1, 9, '2026-01-09 01:08:24', '1', NULL, 'Payments'),
('b26aa687-ecf7-11f0-961d-c70ce65f29af', 'Real Estate Services', 'Property rental, buying and selling.', 'home', '/public/uploads/69605ad43ac0a.avif', '[\"Property sales\",\"Property rental\",\"Market updates\"]', 'Contact Us', '#', 1, 10, '2026-01-09 01:08:24', '1', NULL, 'Real Estate'),
('b26aa6a6-ecf7-11f0-961d-c70ce65f29af', 'Property Loan', 'Loan against property services.', 'account_balance', NULL, '[\"Property loan\",\"Low interest\",\"Quick processing\"]', 'Apply Now', '#', 1, 11, '2026-01-09 01:08:24', '1', NULL, 'Loans'),
('b26aa6c5-ecf7-11f0-961d-c70ce65f29af', 'Car Selling Updates', 'Updates for selling cars.', 'sell', NULL, '[\"Car resale\",\"Seller updates\",\"Market price\"]', 'View', '#', 1, 12, '2026-01-09 01:08:24', '1', NULL, 'Automobile'),
('b26aa6ee-ecf7-11f0-961d-c70ce65f29af', 'Car Buying Updates', 'Updates for buying cars.', 'shopping_cart', NULL, '[\"Car purchase\",\"Buyer updates\",\"Verified listings\"]', 'View', '#', 1, 13, '2026-01-09 01:08:24', '1', NULL, 'Automobile'),
('b26aa70e-ecf7-11f0-961d-c70ce65f29af', 'Bank Jewel Loan', 'Gold loan arrangements through banks.', 'diamond', NULL, '[\"Bank gold loan\",\"Secure storage\",\"Low interest\"]', 'Enquire Now', '#', 1, 14, '2026-01-09 01:08:24', '1', NULL, 'Loans'),
('b26aa72d-ecf7-11f0-961d-c70ce65f29af', 'Jewel Re-Loan', 'Re-loan services for existing jewel loans.', 'autorenew', NULL, '[\"Jewel reloan\",\"Loan renewal\",\"Better rates\"]', 'Enquire Now', '#', 1, 15, '2026-01-09 01:08:24', '1', NULL, 'Loans'),
('b26aa74b-ecf7-11f0-961d-c70ce65f29af', 'Loan Takeover', 'Takeover of jewel and property loans.', 'swap_horiz', NULL, '[\"Loan takeover\",\"Lower EMI\",\"Bank transfer\"]', 'Enquire Now', '#', 1, 16, '2026-01-09 01:08:24', '1', NULL, 'Loans'),
('b26aa76b-ecf7-11f0-961d-c70ce65f29af', 'Pawn Broker Loan Takeover', 'Jewel loan takeover from private pawn brokers.', 'security', NULL, '[\"Pawn broker loans\",\"Gold takeover\",\"Safe transfer\"]', 'Enquire Now', '#', 1, 17, '2026-01-09 01:08:24', '1', NULL, 'Loans'),
('b26aa78b-ecf7-11f0-961d-c70ce65f29af', 'Old Gold Buying', 'Buying old gold at market price.', 'payments', NULL, '[\"Old gold\",\"Instant payment\",\"Fair value\"]', 'Sell Now', '#', 1, 18, '2026-01-09 01:08:24', '1', NULL, 'Gold'),
('b26aa7ac-ecf7-11f0-961d-c70ce65f29af', 'Gold Conversion & New Designs', 'Convert old gold into new jewellery designs.', 'design_services', NULL, '[\"Gold conversion\",\"Custom design\",\"New ornaments\"]', 'Order Now', '#', 1, 19, '2026-01-09 01:08:24', '1', NULL, 'Gold'),
('b26aa7ca-ecf7-11f0-961d-c70ce65f29af', 'Diamond & Gold Jewellery', 'Diamond, gold and silver ornaments.', 'workspace_premium', NULL, '[\"Diamond jewellery\",\"18ct gold\",\"Certified products\"]', 'Order Now', '#', 1, 20, '2026-01-09 01:08:24', '1', NULL, 'Jewellery'),
('b26aa7ea-ecf7-11f0-961d-c70ce65f29af', 'Worker Registration Services', 'Registration of skilled and unskilled workers.', 'groups', NULL, '[\"Electrician\",\"Plumber\",\"Carpenter\",\"House maid\",\"Patient care\"]', 'Register Now', '#', 1, 21, '2026-01-09 01:08:24', '1', NULL, 'Services'),
('e413bc54-24da-4be2-9f7c-3ab71b44317c', 'Matrimony', 'Matrimonial ', '', '', '[]', NULL, NULL, 1, 0, '2026-01-10 17:35:25', '708ab764-e35d-4a3f-9797-cfbe31966717', '', ''),
('fd3250fb-ecf6-11f0-961d-c70ce65f29af', 'Motor Vehicle Insurance', 'Motor vehicle insurance services for all vehicle types with policy assistance and renewal support.', 'directions_car', NULL, '[\"Policy renewal\",\"New insurance\",\"Claim support\"]', 'Enquire Now', '#', 1, 1, '2026-01-09 01:03:20', '1', 'Price on Request', 'Insurance'),
('fd325467-ecf6-11f0-961d-c70ce65f29af', 'Two Wheeler Insurance', 'General insurance for all two wheelers including bikes and scooters.', 'two_wheeler', NULL, '[\"Third party\",\"Comprehensive cover\"]', 'Enquire Now', '#', 1, 2, '2026-01-09 01:03:20', '1', NULL, 'Insurance'),
('fd325503-ecf6-11f0-961d-c70ce65f29af', 'Four Wheeler Insurance', 'Car insurance services for private and commercial vehicles.', 'directions_car_filled', NULL, '[\"New policy\",\"Renewal\",\"Claims\"]', 'Enquire Now', '#', 1, 3, '2026-01-09 01:03:20', '1', NULL, 'Insurance');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `password_plain` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `phone`, `password_hash`, `password_plain`, `created_at`, `updated_at`) VALUES
('03ae6ec7-3e3a-474a-8d8d-2cb192cb3a77', '9632587410', '$2y$10$YYDYiaUK8nlMTt1glZYu6OSU47Au8C3uW2z60u8BIv3/YbAGJZBMC', 'poiuyt', '2026-01-07 11:44:01', '2026-01-07 11:44:01'),
('04a3fc5a-3406-47d1-b10c-3dca1897dfc4', '9087654321', '$2y$10$Ps431Mo8JiNCCysZ2gYtluWcjAoYCm8Jc6siszr3x8..tlSJZqunG', '2003-02-21', '2026-01-07 06:56:48', '2026-01-07 06:56:48'),
('0d361f87-4553-45bc-8b99-4459e0070005', '9876543211', '$2y$10$3J/7QdGzQUPx9Ct66aEIIucABkYGcgwbHjNWb3XvreOXWU.sNm13S', '2000-02-11', '2026-01-07 06:05:20', '2026-01-07 06:05:20'),
('2a9aee1d-25c0-422f-97af-48a4d532aa24', '06379727163', '$2y$10$X/hofC0QNwGU6uSUrcJMt.kh/jZRbNsxYCy.oHFQcDBdWKSLLuNli', '2003-04-06', '2026-01-08 15:31:21', '2026-01-08 15:31:21'),
('3cc09d59-8627-44aa-b1fa-ad10c69f060e', '6380338626', '$2y$10$RkKy1IkTomSMs8EDHNKRcuslRrV.NFcwWoF8km5F32g0MFjhZWZNa', '2025-11-30', '2026-01-08 16:12:48', '2026-01-08 16:12:48'),
('47eb375e-75b7-4b05-a797-6f1247b651f1', '9047432540', '$2y$10$L7tvNiEbnaYWq/m9yo2C0.6ynNLMkZJQpHhiMt/100eJq/At3SA/G', 'rinisha', '2026-01-08 15:33:11', '2026-01-08 15:33:11'),
('4fcdf00a-9934-4551-944b-c191ab05e114', '9876512340', '$2y$10$BiARp.Nog72/Oyd/vWlJOOpKOmKI7P.Cjy9u3Wd8bTYrcEbG92exi', 'adam12', '2026-01-07 12:24:23', '2026-01-07 12:24:23'),
('505d5fbc-cd7c-4f46-85a1-9351c35d25f3', '7418529630', '$2y$10$lp9DE.86MvwLQZtLkP7q2up2vP8TgkCDbkGVUdj9gPyc0MhQ2hwd6', '123456', '2026-01-07 11:08:01', '2026-01-07 11:08:01'),
('5cd02229-1bbb-4515-b89b-eba6da7ad1cf', '9876543222', '$2y$10$XFJvL4E1iIvjF7csqX58SujhCSVJuPlZmSr0ftP7CmH2WzsX5MAra', '1234567', '2026-01-07 10:58:54', '2026-01-07 10:58:54'),
('6e793eea-46da-46cf-aae7-b7f225bfe7c7', '1234567890', '$2y$10$6G3js9QEM.Y0GBf7.mnqhOXhejz8hnGZxg5DzQzZkW8CDtHXJhywa', NULL, '2026-01-06 18:05:49', '2026-01-06 18:05:49'),
('708ab764-e35d-4a3f-9797-cfbe31966717', '7418094867', '$2y$10$2fn6X9WeQc9yc8uvHtMZmO55g8rRRGNP9wsxaczNsjg4LU00CEUDe', '123456', '2026-01-10 17:33:38', '2026-01-16 04:02:55'),
('952d4c69-f5c6-4840-afec-41aa6554549b', '7418529633', '$2y$10$8QHFH2v4qRagFEVUMBa80OJv/Qa5RqKchYXaf6al6./kHwcm7JXHO', '098765', '2026-01-07 11:36:01', '2026-01-07 11:36:01'),
('9ab0c9d1-3438-43d5-b87f-62c0dc789712', '1234567891', '$2y$10$6KMByxxtq1nGwhRq7XWeoOnDMP.w29cl0uK/Cb1Qg6KZWJ6N9/M.i', '2003-12-21', '2026-01-07 06:22:08', '2026-01-07 06:22:08'),
('a17bfdb0-525d-4ed1-a4f7-a7e924aa02b0', 'admin', '$2y$10$4g4Mgknr3WaXqly2JDTQMOh0llLbt6TTd3y/KEqZqXzfH6VLSyjAe', 'admin123', '2026-01-06 10:42:48', '2026-01-07 10:07:08'),
('bc5043dc-e5fa-46e8-abbd-6400a7493ff7', '9638527410', '$2y$10$lnLzSXVoXuvOB2JiJkwKp.6rQjkIiBRYKv8Mkyn3pamAPalbu8B8e', '123456', '2026-01-08 10:14:13', '2026-01-08 10:14:13'),
('cc6de31a-cdb7-4773-9eb0-ccc9e8122fa5', '7871873038', '$2y$10$MuI9IowVKftFyaxpS0RCPe23PkVICq17k.dHNB1UAY2.p2nj.6uC.', 'test123', '2026-01-07 07:15:54', '2026-01-07 12:34:06'),
('d96f7126-4a74-4cef-9e64-e3116ca9f96f', '6379727163', '$2y$10$vZ/USwtb6Q4XQR2bmxNiP.XVIrCdBcHpzqkS/RjygDKtmp0C6Agx.', 'rinisha', '2026-01-07 07:13:34', '2026-01-07 10:11:23');

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `role` enum('admin','user') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role`) VALUES
('69dc1b5b-7aec-4ec1-8e5e-43df023d7c2f', '03ae6ec7-3e3a-474a-8d8d-2cb192cb3a77', 'user'),
('1905321b-3a04-44d5-a074-b9bddccee3e9', '04a3fc5a-3406-47d1-b10c-3dca1897dfc4', 'user'),
('0cb3ba8c-6f20-4cd5-a3ee-abdc49cc5d1b', '0d361f87-4553-45bc-8b99-4459e0070005', 'user'),
('7784831d-ab5e-4b30-94ff-0c22acff97ed', '2a9aee1d-25c0-422f-97af-48a4d532aa24', 'user'),
('3f95915d-fd83-4795-8215-8f2b52402ce9', '3cc09d59-8627-44aa-b1fa-ad10c69f060e', 'user'),
('6483cc2e-6355-4ef4-8131-b4e1aa1775d5', '47eb375e-75b7-4b05-a797-6f1247b651f1', 'user'),
('b77ec6aa-86ea-4f25-97ab-e64da56a6eb9', '4fcdf00a-9934-4551-944b-c191ab05e114', 'user'),
('f0fa14e4-d1d9-4108-8584-6e0f710a873e', '505d5fbc-cd7c-4f46-85a1-9351c35d25f3', 'user'),
('fdbe18dd-8d77-45be-aeb3-db1fd6eef1ef', '5cd02229-1bbb-4515-b89b-eba6da7ad1cf', 'user'),
('', '6e793eea-46da-46cf-aae7-b7f225bfe7c7', 'admin'),
('ba7038b3-3541-476e-bb21-1f6ea93981d3', '708ab764-e35d-4a3f-9797-cfbe31966717', 'user'),
('f6521edd-84c0-41a5-80ea-f47621f9fe1d', '952d4c69-f5c6-4840-afec-41aa6554549b', 'user'),
('2534d8b6-23c3-4fab-be76-fb5af84657b8', '9ab0c9d1-3438-43d5-b87f-62c0dc789712', 'user'),
('91ffe3c0-2265-4c5b-b00a-68d5f5ce9914', 'a17bfdb0-525d-4ed1-a4f7-a7e924aa02b0', 'admin'),
('98e8fc1c-afd3-41fb-8c29-55760d2ffc29', 'bc5043dc-e5fa-46e8-abbd-6400a7493ff7', 'user'),
('fe63f2c8-6261-4725-a680-ab5fc4bed6b4', 'cc6de31a-cdb7-4773-9eb0-ccc9e8122fa5', 'user'),
('c655fed6-147c-4bf4-8ddd-028517e3221c', 'd96f7126-4a74-4cef-9e64-e3116ca9f96f', 'user');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `blogs`
--
ALTER TABLE `blogs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `matrimony_profiles`
--
ALTER TABLE `matrimony_profiles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `members_user_id_fk` (`user_id`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `rasi_palan`
--
ALTER TABLE `rasi_palan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_role_unique` (`user_id`,`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `matrimony_profiles`
--
ALTER TABLE `matrimony_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `members`
--
ALTER TABLE `members`
  ADD CONSTRAINT `members_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
