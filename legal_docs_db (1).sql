-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 10, 2026 at 02:23 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `legal_docs_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `number` varchar(100) NOT NULL,
  `start_date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `validity` date NOT NULL,
  `status` enum('aktif','arsip') DEFAULT 'aktif',
  `file_path` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `name`, `number`, `start_date`, `description`, `validity`, `status`, `file_path`, `created_by`, `created_at`) VALUES
(3, 'Perjanjian Kerjasama Vendor A', 'PKS/2024/001', '2026-04-30', 'Kontrak penyediaan layanan cloud selama 12 bulan.', '2026-05-30', 'aktif', '/uploads/doc-1779142223031-260114589.docx', 1, '2026-05-18 19:14:09'),
(5, 'Perjanjian Kerjasama Vendor B', 'PKS/2026/003', '2026-05-17', 'Tanda tangan kontrak', '2026-06-29', 'aktif', '/uploads/doc-1779142955884-348905100.pptx', 1, '2026-05-18 22:22:35'),
(6, 'Perjanjian Kerjasama PT Suka Maju', 'PKS/2024/002', '2026-04-30', 'Pengesahan Saham ', '2026-07-01', 'aktif', '/uploads/doc-1779239854873-489241814.pptx', 1, '2026-05-20 01:17:34'),
(8, 'Perjanjian Kerjasama dengan PT Arjuna', 'PKS/2024/090', '2026-06-20', 'Tanda Tangan Kontrak', '2026-06-28', 'aktif', '/uploads/doc-1781050048332-938147435.pdf', 6, '2026-06-10 00:01:58');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `from_user_id` int(11) NOT NULL,
  `to_user_id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `doc_id` int(11) DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `from_user_id`, `to_user_id`, `subject`, `content`, `doc_id`, `date`) VALUES
(4, 2, 1, 'revisi', 'tolong diperbaharui', 3, '2026-05-18 19:18:55'),
(5, 1, 2, 'Re: revisi', 'baik pak', 3, '2026-05-18 19:19:26'),
(6, 2, 1, 'revisi', 'tolong direvisi', 5, '2026-05-19 03:55:35'),
(7, 2, 1, 'revisi', 'tolong masaberlakunya di ubah ke 18 aug 2026', NULL, '2026-05-20 00:53:48'),
(8, 1, 2, 'Terkait: Perjanjian Kerjasama Vendor A', 'baik pak', NULL, '2026-05-20 01:04:01'),
(15, 3, 2, 'Pesan', 'halo mister', NULL, '2026-05-29 00:50:28'),
(16, 3, 2, 'Pesan', 'gg', NULL, '2026-05-29 01:15:55'),
(17, 3, 2, 'Pesan', 'halo ', NULL, '2026-06-09 22:47:42'),
(18, 2, 6, 'Perubahan waktu', 'tolong diundur ke tanggal 20', 8, '2026-06-10 00:04:55'),
(19, 6, 2, 'Terkait: undefined', 'sudah pak', 8, '2026-06-10 00:07:51');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('staff','manager','admin') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Douglass', 'douglas@company.com', '123456', 'staff', '2026-05-18 18:53:39'),
(2, 'Bullet', 'bullet@company.com', '123456', 'manager', '2026-05-18 18:53:39'),
(3, 'Jojo', 'jojo@company.com', '123456', 'admin', '2026-05-18 18:53:39'),
(4, 'jaja', 'jaja@company.com', 'jaja', 'manager', '2026-05-19 03:53:53'),
(6, 'asep', 'asep@company.com', 'asep', 'staff', '2026-06-09 23:58:24');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `number` (`number`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `from_user_id` (`from_user_id`),
  ADD KEY `to_user_id` (`to_user_id`),
  ADD KEY `doc_id` (`doc_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`doc_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
