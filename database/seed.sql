-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 13, 2026 at 08:08 AM
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
-- Database: `kantin_digital`
--

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `kode_unik`, `created_at`) VALUES
(1, 'Seller Padang', 'STAN001', 'password123', 'seller', 'STAN001', '2026-05-13 04:47:11'),
(2, 'Seller Ayam Geprek', 'STAN002', 'password123', 'seller', 'STAN002', '2026-05-13 04:47:11'),
(7, 'Budi Santoso', 'budi@gmail.com', '12345678', 'buyer', NULL, '2026-05-13 04:49:54'),
(8, 'Siti Rahma', 'siti@gmail.com', '12345678', 'buyer', NULL, '2026-05-13 04:49:54');

--
-- Dumping data for table `stalls`
--

INSERT INTO `stalls` (`id`, `seller_id`, `nama_stan`, `deskripsi`, `created_at`) VALUES
(1, 1, 'Stan Padang', 'Masakan khas Minang', '2026-05-13 04:47:11'),
(2, 2, 'Stan Ayam Geprek', 'Pedas level dewa', '2026-05-13 04:47:11');

--
-- Dumping data for table `menus`
--

INSERT INTO `menus` (`id`, `stall_id`, `nama`, `harga`, `foto_url`, `stok`, `created_at`) VALUES
(1, 1, 'Nasi Rendang', 15000, 'https://dummyimage.com/rendang.jpg', 20, '2026-05-13 04:47:11'),
(2, 1, 'Ayam Gulai', 18000, 'https://dummyimage.com/gulai.jpg', 15, '2026-05-13 04:47:11'),
(3, 2, 'Ayam Geprek Level 1', 12000, 'https://dummyimage.com/geprek1.jpg', 25, '2026-05-13 04:47:11'),
(4, 2, 'Ayam Geprek Level 5', 15000, 'https://dummyimage.com/geprek5.jpg', 20, '2026-05-13 04:47:11');

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `buyer_id`, `total`, `status`, `created_at`) VALUES
(5, 7, 30000, 'paid', '2026-05-13 04:51:52'),
(6, 8, 15000, 'pending', '2026-05-13 04:51:52');

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `menu_id`, `stall_id`, `qty`, `subtotal`, `created_at`) VALUES
(5, 5, 1, 1, 2, 30000, '2026-05-13 04:53:20'),
(6, 6, 4, 2, 1, 15000, '2026-05-13 04:53:20');

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `order_id`, `jumlah`, `status`, `created_at`) VALUES
(1, 5, 30000, 'paid', '2026-05-13 04:53:20'),
(2, 6, 15000, 'unpaid', '2026-05-13 04:53:20');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
