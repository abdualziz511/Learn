-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: smart_school
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `academic_years`
--

DROP TABLE IF EXISTS `academic_years`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `academic_years` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `school_id` int(10) unsigned NOT NULL,
  `name` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_current` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_school_year` (`school_id`,`is_current`),
  CONSTRAINT `academic_years_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_years`
--

LOCK TABLES `academic_years` WRITE;
/*!40000 ALTER TABLE `academic_years` DISABLE KEYS */;
INSERT INTO `academic_years` VALUES (1,1,'2024-2025','2024-09-01','2025-06-30',1,'2026-06-17 23:22:51');
/*!40000 ALTER TABLE `academic_years` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_analysis`
--

DROP TABLE IF EXISTS `ai_analysis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ai_analysis` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` int(10) unsigned NOT NULL,
  `academic_year_id` int(10) unsigned NOT NULL,
  `term` tinyint(4) DEFAULT 1,
  `overall_score` decimal(5,2) DEFAULT NULL,
  `attendance_rate` decimal(5,2) DEFAULT NULL,
  `strong_subjects` longtext DEFAULT NULL CHECK (json_valid(`strong_subjects`)),
  `weak_subjects` longtext DEFAULT NULL CHECK (json_valid(`weak_subjects`)),
  `recommendations` longtext DEFAULT NULL CHECK (json_valid(`recommendations`)),
  `risk_level` enum('low','medium','high') DEFAULT 'low',
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `next_analysis` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `academic_year_id` (`academic_year_id`),
  KEY `idx_student_year` (`student_id`,`academic_year_id`),
  CONSTRAINT `ai_analysis_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ai_analysis_ibfk_2` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_analysis`
--

LOCK TABLES `ai_analysis` WRITE;
/*!40000 ALTER TABLE `ai_analysis` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_analysis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment_submissions`
--

DROP TABLE IF EXISTS `assignment_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assignment_submissions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `assignment_id` int(10) unsigned NOT NULL,
  `student_id` int(10) unsigned NOT NULL,
  `submission_file` varchar(500) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `score` decimal(6,2) DEFAULT NULL,
  `status` enum('pending','submitted','graded','late') DEFAULT 'pending',
  `submitted_at` timestamp NULL DEFAULT NULL,
  `graded_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_submission` (`assignment_id`,`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_submissions`
--

LOCK TABLES `assignment_submissions` WRITE;
/*!40000 ALTER TABLE `assignment_submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignment_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assignments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `teacher_id` int(10) unsigned NOT NULL,
  `class_id` int(10) unsigned NOT NULL,
  `subject_id` int(10) unsigned NOT NULL,
  `academic_year_id` int(10) unsigned NOT NULL,
  `title` varchar(300) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('homework','project','research','activity') DEFAULT 'homework',
  `due_date` date NOT NULL,
  `max_score` decimal(6,2) DEFAULT NULL,
  `attachment` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attendance` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` int(10) unsigned NOT NULL,
  `class_id` int(10) unsigned NOT NULL,
  `subject_id` int(10) unsigned DEFAULT NULL,
  `teacher_id` int(10) unsigned NOT NULL,
  `academic_year_id` int(10) unsigned NOT NULL,
  `date` date NOT NULL,
  `status` enum('present','absent','late','excused') NOT NULL,
  `note` varchar(500) DEFAULT NULL,
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int(10) unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attendance` (`student_id`,`date`,`subject_id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `idx_date_class` (`date`,`class_id`),
  KEY `idx_student_date` (`student_id`,`date`),
  KEY `idx_approval` (`approval_status`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `school_id` int(10) unsigned DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_id` int(10) unsigned DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(300) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_action` (`user_id`,`action`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:50:00'),(2,2,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:51:59'),(3,3,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:52:43'),(4,4,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:54:12'),(5,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:56:09'),(6,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:59:15'),(7,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:59:18'),(8,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:59:21'),(9,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:59:22'),(10,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:59:24'),(11,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:59:25'),(12,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:59:26'),(13,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:00:41'),(14,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:00:43'),(15,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:00:45'),(16,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:00:46'),(17,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:00:47'),(18,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:03:58'),(19,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:00'),(20,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:01'),(21,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:06'),(22,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:08'),(23,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:09'),(24,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:10'),(25,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:12'),(26,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:13'),(27,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:14'),(28,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:16'),(29,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:17'),(30,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:18'),(31,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:20'),(32,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:21'),(33,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:22'),(34,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:39'),(35,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:41'),(36,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:43'),(37,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:26'),(38,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:28'),(39,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:29'),(40,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:31'),(41,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:32'),(42,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:50'),(43,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:52'),(44,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:53'),(45,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:55'),(46,2,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:24:05'),(47,3,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:25:08'),(48,4,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:25:49'),(49,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:26:33'),(50,5,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:40:19'),(51,5,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:41:21'),(52,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:45:43'),(53,2,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:46:08'),(54,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 15:21:34'),(55,2,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 15:23:25'),(56,3,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 15:25:04'),(57,5,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 15:26:21'),(58,4,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 15:27:47'),(59,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 15:29:05'),(60,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 17:45:30'),(61,2,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 17:51:07'),(62,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 17:54:01'),(63,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-19 19:51:53'),(64,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1',NULL,'2026-06-19 20:17:36'),(65,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-19 21:05:14'),(66,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 12:23:32'),(67,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 13:24:05'),(68,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 14:24:19'),(69,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 15:31:55');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_subjects`
--

DROP TABLE IF EXISTS `class_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_subjects` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `class_id` int(10) unsigned NOT NULL,
  `subject_id` int(10) unsigned NOT NULL,
  `academic_year_id` int(10) unsigned NOT NULL,
  `weekly_hours` tinyint(3) unsigned DEFAULT 4,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_class_subject` (`class_id`,`subject_id`,`academic_year_id`),
  KEY `subject_id` (`subject_id`),
  KEY `academic_year_id` (`academic_year_id`),
  CONSTRAINT `class_subjects_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_subjects_ibfk_3` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_subjects`
--

LOCK TABLES `class_subjects` WRITE;
/*!40000 ALTER TABLE `class_subjects` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `school_id` int(10) unsigned NOT NULL,
  `grade_level_id` int(10) unsigned NOT NULL,
  `academic_year_id` int(10) unsigned NOT NULL,
  `name` varchar(50) NOT NULL,
  `capacity` tinyint(3) unsigned DEFAULT 40,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `grade_level_id` (`grade_level_id`),
  KEY `academic_year_id` (`academic_year_id`),
  KEY `idx_school_grade` (`school_id`,`grade_level_id`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`grade_level_id`) REFERENCES `grade_levels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `classes_ibfk_3` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `educational_content`
--

DROP TABLE IF EXISTS `educational_content`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `educational_content` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `subject_id` int(10) unsigned NOT NULL,
  `school_id` int(10) unsigned NOT NULL,
  `title` varchar(300) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('curriculum','summary','reference','book','presentation','video','other') NOT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_size` int(10) unsigned DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `target_role` enum('student','teacher','both') DEFAULT 'both',
  `uploaded_by` int(10) unsigned NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `school_id` (`school_id`),
  KEY `idx_subject_type` (`subject_id`,`type`),
  CONSTRAINT `educational_content_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `educational_content_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `educational_content`
--

LOCK TABLES `educational_content` WRITE;
/*!40000 ALTER TABLE `educational_content` DISABLE KEYS */;
INSERT INTO `educational_content` VALUES (1,1,1,'ملخص اللغة العربية','ملخص المثالي','summary','/storage/uploads/summaries/1/1/00f5ea7bf519dd30e6abc6777a59cd0d.pdf',694963,'','both',1,1,'2026-06-20 14:49:13');
/*!40000 ALTER TABLE `educational_content` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_answers`
--

DROP TABLE IF EXISTS `exam_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exam_answers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `attempt_id` int(10) unsigned NOT NULL,
  `question_id` int(10) unsigned NOT NULL,
  `answer` text DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  `score` decimal(4,2) DEFAULT 0.00,
  `ai_feedback` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attempt_question` (`attempt_id`,`question_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `exam_answers_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `exam_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `exam_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_answers`
--

LOCK TABLES `exam_answers` WRITE;
/*!40000 ALTER TABLE `exam_answers` DISABLE KEYS */;
/*!40000 ALTER TABLE `exam_answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_attempts`
--

DROP TABLE IF EXISTS `exam_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exam_attempts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `exam_id` int(10) unsigned NOT NULL,
  `student_id` int(10) unsigned NOT NULL,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `submitted_at` timestamp NULL DEFAULT NULL,
  `total_score` decimal(6,2) DEFAULT NULL,
  `max_score` decimal(6,2) DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `ai_report` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ai_report`)),
  `status` enum('in_progress','submitted','graded') DEFAULT 'in_progress',
  PRIMARY KEY (`id`),
  KEY `exam_id` (`exam_id`),
  KEY `idx_student_exam` (`student_id`,`exam_id`),
  CONSTRAINT `exam_attempts_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_attempts_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_attempts`
--

LOCK TABLES `exam_attempts` WRITE;
/*!40000 ALTER TABLE `exam_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `exam_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_questions`
--

DROP TABLE IF EXISTS `exam_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exam_questions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `exam_id` int(10) unsigned NOT NULL,
  `question` text NOT NULL,
  `type` enum('mcq','true_false','short_answer','essay') NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `answer` text NOT NULL,
  `score` decimal(4,2) DEFAULT 1.00,
  `order_num` smallint(5) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exam_id` (`exam_id`),
  CONSTRAINT `exam_questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_questions`
--

LOCK TABLES `exam_questions` WRITE;
/*!40000 ALTER TABLE `exam_questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `exam_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exams`
--

DROP TABLE IF EXISTS `exams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exams` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `subject_id` int(10) unsigned NOT NULL,
  `class_id` int(10) unsigned NOT NULL,
  `title` varchar(300) NOT NULL,
  `scope` enum('topic','unit','term','full_book') NOT NULL,
  `scope_ref` varchar(200) DEFAULT NULL,
  `duration` smallint(5) unsigned DEFAULT NULL,
  `created_by` int(10) unsigned NOT NULL,
  `is_ai` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exams_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exams`
--

LOCK TABLES `exams` WRITE;
/*!40000 ALTER TABLE `exams` DISABLE KEYS */;
/*!40000 ALTER TABLE `exams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grade_levels`
--

DROP TABLE IF EXISTS `grade_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grade_levels` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `school_id` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `order_num` tinyint(3) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `school_id` (`school_id`),
  CONSTRAINT `grade_levels_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grade_levels`
--

LOCK TABLES `grade_levels` WRITE;
/*!40000 ALTER TABLE `grade_levels` DISABLE KEYS */;
INSERT INTO `grade_levels` VALUES (2,1,'الصف السابع',7,'2026-06-19 21:05:23'),(4,1,'الصف الثامن',8,'2026-06-20 14:20:59'),(6,1,'الصف التاسع',9,'2026-06-20 14:55:35'),(7,1,'الصف الاول الثانوي',10,'2026-06-20 15:11:26');
/*!40000 ALTER TABLE `grade_levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grade_types`
--

DROP TABLE IF EXISTS `grade_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grade_types` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `school_id` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `max_score` decimal(5,2) NOT NULL,
  `weight` decimal(4,2) DEFAULT 1.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `school_id` (`school_id`),
  CONSTRAINT `grade_types_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grade_types`
--

LOCK TABLES `grade_types` WRITE;
/*!40000 ALTER TABLE `grade_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `grade_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grades` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` int(10) unsigned NOT NULL,
  `teacher_id` int(10) unsigned NOT NULL,
  `subject_id` int(10) unsigned NOT NULL,
  `class_id` int(10) unsigned NOT NULL,
  `academic_year_id` int(10) unsigned NOT NULL,
  `grade_type_id` int(10) unsigned NOT NULL,
  `score` decimal(6,2) NOT NULL,
  `max_score` decimal(6,2) NOT NULL,
  `term` tinyint(4) DEFAULT 1,
  `note` text DEFAULT NULL,
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int(10) unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `subject_id` (`subject_id`),
  KEY `grade_type_id` (`grade_type_id`),
  KEY `idx_student_subject` (`student_id`,`subject_id`,`academic_year_id`),
  KEY `idx_approval` (`approval_status`),
  CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`),
  CONSTRAINT `grades_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `grades_ibfk_4` FOREIGN KEY (`grade_type_id`) REFERENCES `grade_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
/*!40000 ALTER TABLE `grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `school_id` int(10) unsigned DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `body` text NOT NULL,
  `type` enum('absence','grade','assignment','ai_recommendation','system','announcement') NOT NULL,
  `source` enum('school','teacher','ai','system') NOT NULL,
  `ref_type` varchar(50) DEFAULT NULL,
  `ref_id` int(10) unsigned DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `sent_via` set('in_app','fcm','sms') DEFAULT 'in_app',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_read` (`user_id`,`is_read`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parents`
--

DROP TABLE IF EXISTS `parents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parents` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `phone` varchar(30) NOT NULL,
  `national_id` varchar(30) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `phone` (`phone`),
  KEY `idx_phone` (`phone`),
  CONSTRAINT `parents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parents`
--

LOCK TABLES `parents` WRITE;
/*!40000 ALTER TABLE `parents` DISABLE KEYS */;
INSERT INTO `parents` VALUES (1,5,'777000000',NULL,NULL,'2026-06-18 00:35:37');
/*!40000 ALTER TABLE `parents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `refresh_tokens` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `token` varchar(512) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`),
  KEY `idx_token` (`token`),
  KEY `idx_expires` (`expires_at`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (1,1,'bc5469d86097ceba778558fe40c25662608c7a090d562cf1ebed68b1461af4db00f2697cb489277f532dff9a21ae70177da752b9ebfa2554dff480eeb95cdfde','2026-07-17 22:50:00','2026-06-17 23:50:00'),(2,2,'48d8c07561f9e94238262299869009f844bec1dbf06a1320234c36475fa8693044d04c0858ee9fdfc68498329107427bdb022b3ca3cfa510f398ad13d8dc436d','2026-07-17 22:51:59','2026-06-17 23:51:59'),(3,3,'792520134b71c88dd39dfc3b8e2819733ab409a690368edf9a4f9f81cc618534112550f4699d3fe3cd7e0def96ea07aef05b0bc1dd829b359ccdc387af084cd1','2026-07-17 22:52:43','2026-06-17 23:52:43'),(4,4,'e8caf3461da443edd02cdce93ff01719db2bf85293248bc30372698180d08c7d200af9070236c9786a93aea79b5dca6c4ec4548c3098d60055134b14dc1313e5','2026-07-17 22:54:12','2026-06-17 23:54:12'),(5,1,'90bedc4faed2946c59201b8a94c60adbbc6387b7418574836b131bb6e37cee037f0e8f8fb7ebb7d9cf74da389197329865a77207226f1ccb6067ab833417de26','2026-07-17 22:56:09','2026-06-17 23:56:09'),(6,1,'66334e9a12a5e6dfc60df8d9e9b8d3f72fb96ba8e6e9ef1850d7406b180049f24d6c6867b6fc69e246a000767d9c28120fba2d5ea9d1496c5d1170c9d634855f','2026-07-17 22:59:15','2026-06-17 23:59:15'),(7,1,'b65920daf53dc6e9b93343525684eb944be205fd915083aa75d33dae707e6f2e54145a4da9e28d523e23560f353e075678e40f58b6e7a0405f2c1e8637151028','2026-07-17 22:59:18','2026-06-17 23:59:18'),(8,1,'e92750d5776db29943aee0c83d4a21e41301f516f37600177b7970c8442078a36786b829fa4f4eaac79b756798acb74fd42c28ecccbd5c113ab7027b8e1bf64a','2026-07-17 22:59:21','2026-06-17 23:59:21'),(9,1,'d5891e62974e1a8ed0331f02bbc7b89a16116ee8f48c14ba1a37535595815875a7a148572971c9d25ba2e6589f068d9b392d10a6efb9e3553148fef6f975389f','2026-07-17 22:59:22','2026-06-17 23:59:22'),(10,1,'f054dd684a51cc9a9e45dc00d253b83297b18117ba59eade8d570c45d570499acf65010ec30f30bbb853a428691dc44b6e8e4bf31c36e946139862190f1d2fe9','2026-07-17 22:59:24','2026-06-17 23:59:24'),(11,1,'9df4f670e61828382fb8127b2f10ca042038b8730b5b7877f7fb3bab52470ef7a784f4864d6694ab8eba422b55fbe7a45ac627805a71e21237f3a3d4ab02e997','2026-07-17 22:59:25','2026-06-17 23:59:25'),(12,1,'3db3547ab89009a30cda8e03c9079519367fccee2414a985483f500394af03fd97148f3ce1718df9bdef41230c7ce3695cd2f5342c959519f2e17357174c0c07','2026-07-17 22:59:26','2026-06-17 23:59:26'),(13,1,'d27108dc827cdfdc59504b3b007dd8e17d0e197a631f7e281266e5b17a54aeca1e429428e3169c0ada7bb27f493b099fe4ae9195eafe13bbd5b5fcb8ad68b1a4','2026-07-17 23:00:41','2026-06-18 00:00:41'),(14,1,'6a5431a8e8b71932a4db90baae37cab88625dcb9f9c2f399b1e6facadefe3c7767fbd5c64b263191f5b3443b3885325aa06ac42cae6c92b23426cce98edc9625','2026-07-17 23:00:43','2026-06-18 00:00:43'),(15,1,'45fc29b613ddd4dee0793d7cbd4c7c96f3d47dbd427ead3444e86808bfbbee8cb210d2480f451e9cff74c57cfcf2bae88244f99f4fc5d3a0e33b3bf982913520','2026-07-17 23:00:45','2026-06-18 00:00:45'),(16,1,'77b43292939cd43ecdeac97a18d13e04d7f9cce12c8aa21310f4ec7324d1a0239bdbb0fd45da893f16767583d78eb7b0f2705491ac7815a2e7995ec5e64ad596','2026-07-17 23:00:46','2026-06-18 00:00:46'),(17,1,'34afd0cd712bdd71f35cfb9c5ecfde72112c9f64d8d6566a6a92de4ff76c578dc9b397a9789c0de930dc76a8b1a6cbce7fd673618be9da8952c595bf9b4f454b','2026-07-17 23:00:47','2026-06-18 00:00:47'),(18,1,'c6c590ada9d72bcd83687c9a2cccf2ab71491852a99024ccbdcce2893f1645dddf4e12d85d39df919c04c38a94715f405fd6c554835290507067c4f38fb6008e','2026-07-17 23:03:58','2026-06-18 00:03:58'),(19,1,'1d435a1fb77c095db04dab9231580ba4e24e7fdbf5eceb76ae095f5c04f2eff4b4d3152e9ce138c5385a3a50f381ddceab26e43c195e88623fe086851dc29e37','2026-07-17 23:04:00','2026-06-18 00:04:00'),(20,1,'b7d31a2b70bf1286dab751b43438799d5fb5236e24c1ccfaec27c3b2c4eaac194ff78d12f41cfd3afe58fd3e1e2ebe06fa4645cd93efca8131b6cd442788e186','2026-07-17 23:04:01','2026-06-18 00:04:01'),(21,1,'8894b19cb142012576f934a1efc7f0d3eba3a84ac94a0ab46077109843c8244ae0db4db08d613922829b26341c91430ed3d9c92361334c4b1ddac9cfa9292a58','2026-07-17 23:04:06','2026-06-18 00:04:06'),(22,1,'2c8eb98be59179254b9a9d6e3b890e9e688eb53a6dbba8628b5bb9961125471a1e7223df840de4a6073262762313b22986454c91afbbfbe6ab7da890d9d2ab5d','2026-07-17 23:04:08','2026-06-18 00:04:08'),(23,1,'f8780d4d0554ff8b20c9b9dd76bc10c46501345e3088870653a963f0e925db4a18808f1bd3a9a4ab1d906f7c53c9a36ec4b8e8d55e67ff1f7e4f969fecff165a','2026-07-17 23:04:09','2026-06-18 00:04:09'),(24,1,'b39cf66a38476c6cf1332ec70fd4255a34fcf1a05a156b8008f534af8cee597aac7b17bc4049474b8d88b5d1e0fe1aea647309f55207adf357b68ab515d620d9','2026-07-17 23:04:10','2026-06-18 00:04:10'),(25,1,'909c3853121e02f107a445035ff9281cb42b4956a8b2f132541b9c3af412dd946e34f9ac81a466fcfb938f0e4eec05da19a32d38570203797888e57da93fa9cc','2026-07-17 23:04:12','2026-06-18 00:04:12'),(26,1,'179fd6ae4c0231c9024adcb3442d545e5e3c795cb9b49a49fd83dc30462ef033226fc46399e39f5244185e3fda7dac6a178aaae9c55ace98ec1501507c839648','2026-07-17 23:04:13','2026-06-18 00:04:13'),(27,1,'409d522d522d55536a2602d7b1ba053c4e2202fdbc48298822ca42edd769fce79cca52e7c0ca04512a717c778758a07ab6bfcee26f9cfd075a30ec95148c2caf','2026-07-17 23:04:14','2026-06-18 00:04:14'),(28,1,'55d62dd14b8360aa6f80cb6f5cfb682eab497ea299c5f75b8cd73c9d181919b1202a0dced1294fb2bf6b2911c4f7dfad21f9916a8d2f8aef3a3927e88afcb09a','2026-07-17 23:04:16','2026-06-18 00:04:16'),(29,1,'a970eddf9f19bd06fcfe09ea5484c94f27f996c0d85746eaa0dbc47e7ccb9fee953cfec65df5625acc79b7e537c75f308a49c2a42df33d95ef076a570d24445e','2026-07-17 23:04:17','2026-06-18 00:04:17'),(30,1,'24f8793eb0c6232fc314eb4310d38b2c77aed78159b0a287008ade32d0bd2b21f8ec8ae3fff65cb4fcabc4eb82f72db37bd1bd0fa2e9e9859e64d6d6636351f1','2026-07-17 23:04:18','2026-06-18 00:04:18'),(31,1,'d227db6112e26816ce57e461df9e65b1f93f1d595a6886b680a13e402dea0a43e6bbb330bc2ea704ae72d4c5f084f8819c092351876fcdc51f58101a5fe0c842','2026-07-17 23:04:20','2026-06-18 00:04:20'),(32,1,'3374b9155c99244cd09bdc8ef569a6c9d25642253a55577c0ee2578717b0c1e9e4dd8d950fed302993416191c964357bf32b6b9574d85c5f0c36ad743eb753b1','2026-07-17 23:04:21','2026-06-18 00:04:21'),(33,1,'6da39388f0cd835ff0f390a90b1a850e6e0e30f2c61c7722ed159222618c9546a0dd949e2db26426e6b2683521307fc0750b31324cb823c2021a83e48e04eac0','2026-07-17 23:04:22','2026-06-18 00:04:22'),(34,1,'3620bba2f14a2d665bddf9f5e2b29f098cee2c4c74356f27f243446a0621c1f8c142f8c073c75ee77abb001869eb283edba9e405c5d4e00db95b5bab909f80b1','2026-07-17 23:04:39','2026-06-18 00:04:39'),(35,1,'b9fde6f6575b6961584d3309c193968682ad2aa22c256f4fa0c511e696499c475b5a798462357e59ef356ddc926be78656dba2fa84804205d4d06626c4102fb8','2026-07-17 23:04:41','2026-06-18 00:04:41'),(36,1,'770df3d523aba548d02e2ce2fc6d5e2af89e770916d46a31a7eca31c0a1bd13491eb655d3ec552118d28ac97175b0844c91a2efffb6c8e23501cbe8b3e6f3110','2026-07-17 23:04:43','2026-06-18 00:04:43'),(37,1,'217c3838af9ecbd23f2f00520352deaa08452585c4db45e356f6eec89e1be55f90b201e8eee159e0fdf1255ad77bbec58579bbad6538fb9dcc1b51fa4ceeece2','2026-07-17 23:05:26','2026-06-18 00:05:26'),(38,1,'70b0b35f5b62cebec27ec9698656e85558e80d0796f340f45581ad6f7fcd5fee6dc7ba2e27a131a11671a48abb73498c7fb615b6796687585a55146aaede91a5','2026-07-17 23:05:28','2026-06-18 00:05:28'),(39,1,'7b6b9dbe119e229a9c2139e9fcdd4fa538338fd01efcb324072421094b1d0d59020565be24ddbd40d65c0635654611d2a62a133c58dda3b7afbf9624a8b55dd2','2026-07-17 23:05:29','2026-06-18 00:05:29'),(40,1,'cad232b1992ab29fea9c816a5b3512d26590d07e56743f8eb96281bd802c4d42d44c6aae77b7e0b9634e5ae4f92ebe9f46213109aed37d4cbd4febc240b9d793','2026-07-17 23:05:31','2026-06-18 00:05:31'),(41,1,'e26e3fa28e029a11dd5d19edb8dac7c2ccd0a6a809072f30df43efbc0f92fbdd4c67323fcda940bd9d21809c90ced58b2860eb38e1845228097f21fbeb7d0d80','2026-07-17 23:05:32','2026-06-18 00:05:32'),(42,1,'ae9454c05ffb6aaecc45ececa1552375e395f86e9bb5bca6290341740a6728e13831a3ae6c33cae1d4151765bcb53c928c9559af52a818ef98d41d63d2c7c571','2026-07-17 23:05:50','2026-06-18 00:05:50'),(43,1,'ea0b6895c1dc1ac4f7e7ae2c8bdeba14bcfc284b875187470b27fdc44b04ed112f1e17e1ebf4da69be1b1f6f2128430e9c91f9c6876318b95667dda074c689a5','2026-07-17 23:05:52','2026-06-18 00:05:52'),(44,1,'cfa6abf9523ff47bf570ef5481f1fbea292c4e9a29b58aca82021eb89bfff1f200f89319a428d15750dfc7ad3210f89b7bfa801fa47cf5d6178388538636e0e4','2026-07-17 23:05:53','2026-06-18 00:05:53'),(45,1,'267780ce91a5843e81f00adeeb78a3ba8edc434a954a757ad03994e6f1d3837a4ad0ad46b7b05f242546ff2dc1d6bc05fbc4642b9904431d3c360a50816a2454','2026-07-17 23:05:55','2026-06-18 00:05:55'),(46,2,'8729b68668ebb20636c283e860770aae53a33cc445902f038dbc50707867d2ac57694531f578c067b6e5eaf5c6f2cfeab84ccc79fefc9c1917c1197faa865f61','2026-07-17 23:24:05','2026-06-18 00:24:05'),(47,3,'b78e024250e2053e71576eea874bf3c25dd71fa46416612c6dd80bdab8bfb2bb55c777ece5c085a21a09330d9030d5de6056e939bc51b7c93169ed3a5138e646','2026-07-17 23:25:08','2026-06-18 00:25:08'),(48,4,'81add37129c0cbcac345b2e21d8ae1f240bcef9fba1cfa740e0af1f09925bbf1ee4c4fa62a1b39033e82a1222d511b45b89bbff8b02e35496118fe0fc9ca916d','2026-07-17 23:25:49','2026-06-18 00:25:49'),(49,1,'e155a16194292e344a36fb6ea72a93338c6835d48c1875b712e99116277f2ab97fe35f32b91ac44e74bea944b107c47112a9a783f68341e12e1177e66c40c205','2026-07-17 23:26:33','2026-06-18 00:26:33'),(50,5,'1abb7e8fbe1e325da06e35088d0f97afea36c7b57de5c11aad217d4c65afa82ce37319de283087fb59b4e8d7a7943e39805c96c10ba0849bb6ed6acc42309bd5','2026-07-17 23:40:19','2026-06-18 00:40:19'),(51,5,'e27a158d0e0496ce44173fb289c42f9ce6a48d6362ebce449c4e9f3a285496eec7255b1eaef204e183b6a62023a7eeba597b3ca1b202cf6d32fd8a341f914273','2026-07-17 23:41:21','2026-06-18 00:41:21'),(52,1,'052c8df1de21f2e900745c31a6b0c7915c31bb56e11b1ecc1de54dc099139308fc2a36d073fb1dee1e5bed3f52f8f68a288c24d22b31d55064c92ed54a2fa50c','2026-07-17 23:45:43','2026-06-18 00:45:43'),(53,2,'938a224efb2385a22ae91719a9f244afa8c36bf65c753fa31d963f745971c36d0f2d0c90c2d706e4ca1af43e775c11d759cc2cc9ef258161421354bedc0409a2','2026-07-17 23:46:08','2026-06-18 00:46:08'),(54,1,'3e1a7fccaed8ca15f08bef97c5e2f364a7fa1a15e9d035b1121cf0a4e891b74da6aabecc2339f363664e09862a610d546572038f4a67706509998c64b8af8c08','2026-07-18 14:21:34','2026-06-18 15:21:34'),(55,2,'c5de6dd0502916a9e77997127ab4b0dafa9d974a543e2766916e001a5b23d111cb87fddc3a1ab14b371bf5b4dd66af6f67ba1825a900279c1b0062b6d8c3a062','2026-07-18 14:23:25','2026-06-18 15:23:25'),(56,3,'aef7b3d780800f30e97c477f600c99b2a3aee7841b9b137f89ac479d869a24a2865ebaec47e20686278f2dafba4200d056b0c3db1c70119491e319fd9afadae3','2026-07-18 14:25:04','2026-06-18 15:25:04'),(57,5,'828cf8d0bf77ebc3584683204c1585a5fd11b1539af3198fed78af9313fd54c9544c8ead628c0bb08720f018a3aa756b2cfa3d38d83574e3564799994c426c57','2026-07-18 14:26:21','2026-06-18 15:26:21'),(58,4,'093f1c7e384f0dd824a1edba9617e8ab73e653811594369354b3f6d1fc5b5f07308f9748bed36a5b2283fee4477daa4a321f6d8133a6b5b1f68e9639ea43ae04','2026-07-18 14:27:47','2026-06-18 15:27:47'),(59,1,'755490eb806eed0426cefe4bff03a153ae8c192801e59c118e90627678e67c47779e200e4c0b15b881c7db960ce3e6da3c2aa76f388627a1699aaa5597d8f335','2026-07-18 14:29:05','2026-06-18 15:29:05'),(60,1,'cd8abb95036dfcec49be8f7df25f6197635e993d57e33c4de5ba83b706d3bca7f240aac0db1b3389ba533145f7816843031394a65558c95f9b03348970ae3f72','2026-07-18 16:45:30','2026-06-18 17:45:30'),(61,2,'239c7103278efb41f74672315e504bed266f3d51535a1efa4616f2fbfcbb25788185a2dfe0064a975b862d5146d3aaa46978ec048b0c54b1720ec3d6372c6895','2026-07-18 16:51:06','2026-06-18 17:51:06'),(62,1,'0d937bd88e4ef5efa54400395675d13ca12c14799d01ff6e846de13c83ff6b86ed067d3fb38e2c735b3895796729f6bacf9eb34881f42f4854db0c0bf37ab069','2026-07-18 16:54:01','2026-06-18 17:54:01'),(63,1,'a7299473a60ca53b295199d3ec9a5532d483882cea73a528f6498d86dec1a6eafc526bb86fa844149db2ce76f0805817f2f6acb2789ada03f3f439b0b093302c','2026-07-19 18:51:53','2026-06-19 19:51:53'),(64,1,'496f802eeea658d41013efddb63cbaa94274285d7301719f6547f7590158aaf4bb2b8f466ac5aedb336d00f18ca6410234ca3726da3b5c8552520f9c7a63e3f3','2026-07-19 19:17:36','2026-06-19 20:17:36'),(65,1,'f81b5980e8c49c7ee162c9326bf46be99fe383fca193c04c8ae856cd30defe69e8f2e2835094275e1da40b2b67d416cadcd6f66e1debbb70ce2b7232c13ef451','2026-07-19 20:05:14','2026-06-19 21:05:14'),(66,1,'01fe3dc73a51eb159efbf9e27136d277c0b205d865eb5f8c677fd19aac890992000dae902ff2a7dec8a3d50125fcc1877571c5b0a0b27d40fd10b450271baefc','2026-07-20 11:23:32','2026-06-20 12:23:32'),(67,1,'1cc8e5f4db54717f18de6cbe485f84b707f089aa31dcc48c4c2e13115c213d5ef0a65161210586018da59daa024ddc2ee842c43515d54cd4bd02645605ec7238','2026-07-20 12:24:05','2026-06-20 13:24:05'),(68,1,'132fa25a3411dcae9c157fffbba95835e8c489c103b7d27aff3daf4488982ad719f3318d6bbc6aa92fbf9d490c13a9e145d0e0542789cb09191095bfb78584aa','2026-07-20 13:24:19','2026-06-20 14:24:19'),(69,1,'deda5b3391d1d44ba712510ae858ada37ffbc87b182d9e8302de03d45b5c697d258fbd666e1a193164f1e844b0c2d2ef11095bf1f91e8cabcd85edf13094ab83','2026-07-20 14:31:55','2026-06-20 15:31:55');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `school_admins`
--

DROP TABLE IF EXISTS `school_admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `school_admins` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `school_id` int(10) unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_school` (`user_id`,`school_id`),
  KEY `school_id` (`school_id`),
  CONSTRAINT `school_admins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `school_admins_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `school_admins`
--

LOCK TABLES `school_admins` WRITE;
/*!40000 ALTER TABLE `school_admins` DISABLE KEYS */;
INSERT INTO `school_admins` VALUES (5,2,4,'2026-06-20 13:55:45');
/*!40000 ALTER TABLE `school_admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schools`
--

DROP TABLE IF EXISTS `schools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schools` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `name_en` varchar(200) DEFAULT NULL,
  `logo` varchar(500) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'YE',
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `website` varchar(300) DEFAULT NULL,
  `founded_year` year(4) DEFAULT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `min_grade_id` int(10) unsigned DEFAULT NULL,
  `max_grade_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schools`
--

LOCK TABLES `schools` WRITE;
/*!40000 ALTER TABLE `schools` DISABLE KEYS */;
INSERT INTO `schools` VALUES (1,'Ù…Ø¯Ø±Ø³Ø© Ø§Ù„Ù†Ù‡Ø¶Ø© Ø§Ù„Ø­Ø¯ÙŠØ«Ø©',NULL,NULL,NULL,'ØµÙ†Ø¹Ø§Ø¡','YE',NULL,NULL,NULL,NULL,'active',NULL,'2026-06-17 23:22:51','2026-06-17 23:22:51',NULL,NULL),(2,'مدرسة الاختبار التشخيصي',NULL,NULL,NULL,'صنعاء','YE',NULL,NULL,NULL,NULL,'active','{\"theme\":\"light\"}','2026-06-19 20:17:36','2026-06-19 20:17:36',NULL,NULL),(4,'التعاون','Altaawon',NULL,'السبعين','صنعاء','YE','777000777','aaa@gmail.com','https://www.getsoft.com',2007,'active','{\"theme\":\"light\"}','2026-06-19 20:22:43','2026-06-20 14:55:46',2,6),(5,'التعاون','Altaawon',NULL,'السبعين','صنعاء','YE','777000770','aaaa@gmail.com','https://www.getsoft.com',2020,'active','{\"theme\":\"light\"}','2026-06-20 12:24:14','2026-06-20 12:24:14',NULL,NULL);
/*!40000 ALTER TABLE `schools` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `students` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `school_id` int(10) unsigned NOT NULL,
  `class_id` int(10) unsigned NOT NULL,
  `academic_year_id` int(10) unsigned NOT NULL,
  `student_code` varchar(30) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female') DEFAULT NULL,
  `parent_phone` varchar(30) NOT NULL,
  `address` text DEFAULT NULL,
  `enrolled_at` date DEFAULT NULL,
  `status` enum('active','suspended','transferred','graduated') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `student_code` (`student_code`),
  KEY `class_id` (`class_id`),
  KEY `academic_year_id` (`academic_year_id`),
  KEY `idx_parent_phone` (`parent_phone`),
  KEY `idx_school_class` (`school_id`,`class_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `students_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `students_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `students_ibfk_4` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subjects` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `school_id` int(10) unsigned NOT NULL,
  `grade_level_id` int(10) unsigned DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `term` tinyint(4) DEFAULT 1,
  `name_en` varchar(150) DEFAULT NULL,
  `code` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `color` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `school_id` (`school_id`),
  KEY `fk_subject_grade` (`grade_level_id`),
  CONSTRAINT `fk_subject_grade` FOREIGN KEY (`grade_level_id`) REFERENCES `grade_levels` (`id`) ON DELETE SET NULL,
  CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,1,2,'اللغة العربية',1,NULL,NULL,NULL,NULL,NULL,'2026-06-20 14:47:56');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_assignments`
--

DROP TABLE IF EXISTS `teacher_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teacher_assignments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `teacher_id` int(10) unsigned NOT NULL,
  `school_id` int(10) unsigned NOT NULL,
  `class_id` int(10) unsigned NOT NULL,
  `subject_id` int(10) unsigned NOT NULL,
  `academic_year_id` int(10) unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_teacher_class_subject` (`teacher_id`,`class_id`,`subject_id`,`academic_year_id`),
  KEY `school_id` (`school_id`),
  KEY `class_id` (`class_id`),
  KEY `subject_id` (`subject_id`),
  KEY `academic_year_id` (`academic_year_id`),
  CONSTRAINT `teacher_assignments_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_assignments_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_assignments_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_assignments_ibfk_4` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_assignments_ibfk_5` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_assignments`
--

LOCK TABLES `teacher_assignments` WRITE;
/*!40000 ALTER TABLE `teacher_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `teacher_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teachers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `specialization` varchar(150) DEFAULT NULL,
  `qualification` varchar(150) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES (1,3,'Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª',NULL,NULL,'2026-06-17 23:22:51');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('super_admin','school_admin','teacher','student','parent') NOT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `fcm_token` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Super Admin','admin@smartschool.com',NULL,'$2y$10$9r5qeJaTbZDRlr69JggWz.Cu0hCmTij4jsWENBkKKGmztO0ucrDTC','super_admin',NULL,NULL,1,'2026-06-20 14:31:55','2026-06-17 23:22:41','2026-06-20 15:31:55'),(2,'حسام الشراعي','school@test.com','776158797','$2y$12$YVT9Ke7h3yKz6pLFx8.9xOvV3qeeldEWWFDuM09whjrsxea0ZsnJ6','school_admin',NULL,NULL,1,'2026-06-18 16:51:06','2026-06-17 23:22:51','2026-06-20 13:55:45'),(3,'Ø§Ù„Ø£Ø³ØªØ§Ø° Ø®Ø§Ù„Ø¯','teacher@test.com',NULL,'$2y$10$9r5qeJaTbZDRlr69JggWz.Cu0hCmTij4jsWENBkKKGmztO0ucrDTC','teacher',NULL,NULL,1,'2026-06-18 14:25:04','2026-06-17 23:22:51','2026-06-18 15:25:04'),(4,'Ù…Ø­Ù…Ø¯ Ø¹Ù„ÙŠ','student@test.com',NULL,'$2y$10$9r5qeJaTbZDRlr69JggWz.Cu0hCmTij4jsWENBkKKGmztO0ucrDTC','student',NULL,NULL,1,'2026-06-18 14:27:47','2026-06-17 23:22:51','2026-06-18 15:27:47'),(5,'ولي الأمر محمد','parent@test.com',NULL,'$2y$10$QKyQ7HNBn2bfGrLPSTdamOeMCdfLT/CcpSbkH4BDgIt9QCxXy/vMu','parent',NULL,NULL,1,'2026-06-18 14:26:21','2026-06-18 00:35:37','2026-06-18 15:26:21');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-20 19:19:44
