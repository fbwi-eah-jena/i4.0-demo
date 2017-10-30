-- phpMyAdmin SQL Dump
-- version 4.2.11
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Erstellungszeit: 28. Jun 2017 um 19:26
-- Server Version: 5.6.21
-- PHP-Version: 5.6.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Datenbank: `products_db`
--
CREATE DATABASE IF NOT EXISTS `products_db` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `products_db`;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `products`
--

CREATE TABLE IF NOT EXISTS `products` (
`productId` int(10) NOT NULL,
`productSingleWeight` int(10) NOT NULL,
`productWeight` int(10) NOT NULL,
`productCount` int(10) NOT NULL,
PRIMARY KEY (productId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `customer_order`
-- --
-- ALTER TABLE `products`
--  ADD PRIMARY KEY (`productId`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `products`
-- ALTER TABLE `products`
-- MODIFY `productId` int(10) NOT NULL;
--
-- /*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
-- /*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
-- /*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
