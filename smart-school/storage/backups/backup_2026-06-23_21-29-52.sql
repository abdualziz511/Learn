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
  `day_name` varchar(20) DEFAULT NULL,
  `week_number` int(11) DEFAULT NULL,
  `max_score` decimal(6,2) DEFAULT NULL,
  `attachment` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
INSERT INTO `assignments` VALUES (1,3,2,3,1,'واجب يومي - الثلاثاء','حل الاسئلة التي في الصفحة رقم 23 في كتاب المقرر','homework','2026-06-23','الثلاثاء',4,NULL,NULL,'2026-06-23 19:07:17');
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
  `homework_score` decimal(5,2) DEFAULT 0.00,
  `participation_score` decimal(5,2) DEFAULT 0.00,
  `behavior_score` decimal(5,2) DEFAULT 0.00,
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
) ENGINE=InnoDB AUTO_INCREMENT=124 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:50:00'),(2,2,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:51:59'),(3,3,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:52:43'),(4,4,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:54:12'),(5,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:56:09'),(6,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:59:15'),(7,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:59:18'),(8,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:59:21'),(9,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:59:22'),(10,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:59:24'),(11,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:59:25'),(12,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-17 23:59:26'),(13,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:00:41'),(14,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:00:43'),(15,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:00:45'),(16,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:00:46'),(17,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:00:47'),(18,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:03:58'),(19,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:00'),(20,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:01'),(21,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:06'),(22,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:08'),(23,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:09'),(24,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:10'),(25,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:12'),(26,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:13'),(27,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:14'),(28,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:16'),(29,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:17'),(30,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:18'),(31,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:20'),(32,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:21'),(33,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:22'),(34,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:39'),(35,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:41'),(36,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:04:43'),(37,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:26'),(38,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:28'),(39,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:29'),(40,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:31'),(41,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:32'),(42,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:50'),(43,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:52'),(44,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:53'),(45,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:05:55'),(46,2,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:24:05'),(47,3,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:25:08'),(48,4,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:25:49'),(49,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:26:33'),(50,5,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:40:19'),(51,5,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:41:21'),(52,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:45:43'),(53,2,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 00:46:08'),(54,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 15:21:34'),(55,2,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 15:23:25'),(56,3,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 15:25:04'),(57,5,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 15:26:21'),(58,4,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 15:27:47'),(59,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 15:29:05'),(60,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 17:45:30'),(61,2,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 17:51:07'),(62,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-18 17:54:01'),(63,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-19 19:51:53'),(64,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1',NULL,'2026-06-19 20:17:36'),(65,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-19 21:05:14'),(66,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 12:23:32'),(67,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 13:24:05'),(68,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 14:24:19'),(69,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 15:31:55'),(70,2,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 16:27:53'),(71,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 16:29:16'),(72,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 16:39:45'),(73,1,NULL,'UPDATE_SCHOOL','schools',5,'{\"id\":5,\"name\":\"\\u0627\\u0644\\u062a\\u0639\\u0627\\u0648\\u0646\",\"name_en\":\"Altaawon\",\"logo\":null,\"address\":\"\\u0627\\u0644\\u0633\\u0628\\u0639\\u064a\\u0646\",\"city\":\"\\u0635\\u0646\\u0639\\u0627\\u0621\",\"country\":\"YE\",\"phone\":\"777000777\",\"email\":\"aaaa@gmail.com\",\"website\":\"https:\\/\\/www.getsoft.com\",\"founded_year\":\"2020\",\"status\":\"active\",\"settings\":\"{\\\"theme\\\":\\\"light\\\"}\",\"created_at\":\"2026-06-20 15:24:14\",\"updated_at\":\"2026-06-20 19:41:17\",\"min_grade_id\":null,\"max_grade_id\":null}','{\"id\":5,\"name\":\"\\u0627\\u0644\\u062a\\u0639\\u0627\\u0648\\u0646\",\"name_en\":\"Altaawon\",\"logo\":null,\"address\":\"\\u0627\\u0644\\u0633\\u0628\\u0639\\u064a\\u0646\",\"city\":\"\\u0635\\u0646\\u0639\\u0627\\u0621\",\"country\":\"YE\",\"phone\":\"777000770\",\"email\":\"aaaa@gmail.com\",\"website\":\"https:\\/\\/www.getsoft.com\",\"founded_year\":\"2020\",\"status\":\"active\",\"settings\":\"{\\\"theme\\\":\\\"light\\\"}\",\"created_at\":\"2026-06-20 15:24:14\",\"updated_at\":\"2026-06-20 19:47:45\",\"min_grade_id\":null,\"max_grade_id\":null}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 16:47:45'),(74,1,NULL,'CREATE_SUBJECT','subjects',2,NULL,'{\"id\":2,\"school_id\":1,\"grade_level_id\":2,\"name\":\"\\u0627\\u0644\\u0631\\u064a\\u0627\\u0636\\u064a\\u0627\\u062a\",\"term\":1,\"name_en\":null,\"code\":null,\"description\":null,\"icon\":null,\"color\":null,\"created_at\":\"2026-06-20 19:51:10\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 16:51:10'),(75,1,NULL,'UPDATE_SUBJECT','subjects',2,'{\"id\":2,\"school_id\":1,\"grade_level_id\":2,\"name\":\"\\u0627\\u0644\\u0631\\u064a\\u0627\\u0636\\u064a\\u0627\\u062a\",\"term\":1,\"name_en\":null,\"code\":null,\"description\":null,\"icon\":null,\"color\":null,\"created_at\":\"2026-06-20 19:51:10\"}','{\"id\":2,\"school_id\":1,\"grade_level_id\":2,\"name\":\"\\u0627\\u0644\\u0631\\u064a\\u0627\\u0636\\u064a\\u0627\\u062a 1\",\"term\":1,\"name_en\":null,\"code\":null,\"description\":null,\"icon\":null,\"color\":null,\"created_at\":\"2026-06-20 19:51:10\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 16:51:49'),(76,1,NULL,'DELETE_SUBJECT','subjects',2,'{\"id\":2,\"school_id\":1,\"grade_level_id\":2,\"name\":\"\\u0627\\u0644\\u0631\\u064a\\u0627\\u0636\\u064a\\u0627\\u062a 1\",\"term\":1,\"name_en\":null,\"code\":null,\"description\":null,\"icon\":null,\"color\":null,\"created_at\":\"2026-06-20 19:51:10\"}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 16:52:02'),(77,1,NULL,'CREATE_SUBJECT','subjects',3,NULL,'{\"id\":3,\"school_id\":1,\"grade_level_id\":2,\"name\":\"\\u0627\\u0644\\u0631\\u064a\\u0627\\u0636\\u064a\\u0627\\u062a\",\"term\":1,\"name_en\":null,\"code\":null,\"description\":null,\"icon\":null,\"color\":null,\"created_at\":\"2026-06-20 19:52:14\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 16:52:14'),(78,1,NULL,'CREATE_GRADE','grade_levels',8,NULL,'{\"id\":8,\"school_id\":1,\"name\":\"\\u0627\\u0644\\u0635\\u0641 \\u0627\\u0644\\u062b\\u0627\\u0646\\u064a \\u0627\\u0644\\u062b\\u0627\\u0646\\u0648\\u064a\",\"order_num\":11,\"created_at\":\"2026-06-20 19:54:40\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 16:54:40'),(79,1,NULL,'UPDATE_GRADE','grade_levels',8,'{\"id\":8,\"school_id\":1,\"name\":\"\\u0627\\u0644\\u0635\\u0641 \\u0627\\u0644\\u062b\\u0627\\u0646\\u064a \\u0627\\u0644\\u062b\\u0627\\u0646\\u0648\\u064a\",\"order_num\":11,\"created_at\":\"2026-06-20 19:54:40\"}','{\"id\":8,\"school_id\":1,\"name\":\"\\u0627\\u0644\\u0635\\u0641 \\u0627\\u0644\\u062b\\u0627\\u0646\\u064a \\u0627\\u0644\\u062b\\u0627\\u0646\\u0648\\u064a 1\",\"order_num\":11,\"created_at\":\"2026-06-20 19:54:40\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 16:54:56'),(80,1,NULL,'DELETE_GRADE','grade_levels',8,'{\"id\":8,\"school_id\":1,\"name\":\"\\u0627\\u0644\\u0635\\u0641 \\u0627\\u0644\\u062b\\u0627\\u0646\\u064a \\u0627\\u0644\\u062b\\u0627\\u0646\\u0648\\u064a 1\",\"order_num\":11,\"created_at\":\"2026-06-20 19:54:40\"}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 16:55:07'),(81,1,NULL,'CREATE_GRADE','grade_levels',9,NULL,'{\"id\":9,\"school_id\":1,\"name\":\"\\u0627\\u0644\\u0635\\u0641 \\u0627\\u0644\\u062b\\u0627\\u0646\\u064a \\u0627\\u0644\\u062b\\u0627\\u0646\\u0648\\u064a\",\"order_num\":11,\"created_at\":\"2026-06-20 19:55:35\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 16:55:35'),(82,1,NULL,'UPDATE_USER','users',7,'{\"id\":7,\"name\":\"\\u0645\\u062d\\u0645\\u062f\",\"email\":\"mohamed@smartschool.com\",\"phone\":\"776655441\",\"role\":\"student\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-20 19:50:13\",\"student_details\":false}','{\"id\":7,\"name\":\"\\u0645\\u062d\\u0645\\u062f\",\"email\":\"mohamed@smartschool.com\",\"phone\":\"776655440\",\"role\":\"student\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-20 19:50:13\",\"student_details\":false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 16:55:59'),(83,1,NULL,'CREATE_USER','users',8,NULL,'{\"id\":8,\"name\":\"\\u0627\\u062d\\u0645\\u062f\",\"email\":\"ahmed@smartschool.com\",\"phone\":\"774411002\",\"role\":\"teacher\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-20 19:56:57\",\"teacher_details\":false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 16:56:57'),(84,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 16:58:15'),(85,1,NULL,'UPDATE_SYSTEM_SETTINGS','system_settings',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 17:10:12'),(86,1,NULL,'UPDATE_SYSTEM_SETTINGS','system_settings',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 17:10:22'),(87,1,NULL,'UPDATE_SYSTEM_SETTINGS','system_settings',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 17:12:44'),(88,1,NULL,'UPDATE_SYSTEM_SETTINGS','system_settings',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 17:12:47'),(89,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 17:13:16'),(90,1,NULL,'UPDATE_SYSTEM_SETTINGS','system_settings',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 17:18:18'),(91,1,NULL,'UPDATE_SYSTEM_SETTINGS','system_settings',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 17:18:22'),(92,1,NULL,'UPDATE_SYSTEM_SETTINGS','system_settings',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 17:19:51'),(93,1,NULL,'UPDATE_SYSTEM_SETTINGS','system_settings',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 17:19:53'),(94,1,NULL,'LOGIN',NULL,NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 17:20:32'),(95,1,NULL,'UPDATE_SYSTEM_SETTINGS','system_settings',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 17:25:39'),(96,1,NULL,'UPDATE_SYSTEM_SETTINGS','system_settings',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 17:26:39'),(97,1,NULL,'UPDATE_SYSTEM_SETTINGS','system_settings',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 17:27:32'),(98,1,NULL,'UPDATE_SYSTEM_SETTINGS','system_settings',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 17:44:01'),(99,1,NULL,'UPDATE_USER','users',8,'{\"id\":8,\"name\":\"\\u0627\\u062d\\u0645\\u062f\",\"email\":\"ahmed@smartschool.com\",\"phone\":\"774411002\",\"role\":\"teacher\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-20 19:56:57\",\"teacher_details\":false}','{\"id\":8,\"name\":\"\\u0627\\u062d\\u0645\\u062f\",\"email\":\"ahmed@smartschool.com\",\"phone\":\"774411000\",\"role\":\"teacher\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-20 19:56:57\",\"teacher_details\":false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 18:03:56'),(100,1,NULL,'UPDATE_SYSTEM_SETTINGS','system_settings',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 18:04:52'),(101,1,NULL,'UPDATE_USER','users',8,'{\"id\":8,\"name\":\"\\u0627\\u062d\\u0645\\u062f\",\"email\":\"ahmed@smartschool.com\",\"phone\":\"774411000\",\"role\":\"teacher\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-20 19:56:57\",\"teacher_details\":false}','{\"id\":8,\"name\":\"\\u0627\\u062d\\u0645\\u062f\",\"email\":\"ahmed@smartschool.com\",\"phone\":\"774411000\",\"role\":\"teacher\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-20 19:56:57\",\"teacher_details\":false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 18:18:10'),(102,1,NULL,'UPDATE_SYSTEM_SETTINGS','system_settings',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 18:22:38'),(103,1,NULL,'UPDATE_USER','users',8,'{\"id\":8,\"name\":\"\\u0627\\u062d\\u0645\\u062f\",\"email\":\"ahmed@smartschool.com\",\"phone\":\"774411000\",\"role\":\"teacher\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-20 19:56:57\",\"teacher_details\":false}','{\"id\":8,\"name\":\"\\u0627\\u062d\\u0645\\u062f\",\"email\":\"ahmed@smartschool.com\",\"phone\":\"774411000\",\"role\":\"teacher\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-20 19:56:57\",\"teacher_details\":false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 18:23:07'),(104,1,NULL,'UPDATE_SYSTEM_SETTINGS','system_settings',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 18:23:16'),(105,1,NULL,'UPDATE_USER','users',8,'{\"id\":8,\"name\":\"\\u0627\\u062d\\u0645\\u062f\",\"email\":\"ahmed@smartschool.com\",\"phone\":\"774411000\",\"role\":\"teacher\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-20 19:56:57\",\"teacher_details\":false}','{\"id\":8,\"name\":\"\\u0627\\u062d\\u0645\\u062f\",\"email\":\"ahmed@smartschool.com\",\"phone\":\"774411000\",\"role\":\"teacher\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-20 19:56:57\",\"teacher_details\":false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 18:23:38'),(106,1,NULL,'UPDATE_USER','users',8,'{\"id\":8,\"name\":\"\\u0627\\u062d\\u0645\\u062f\",\"email\":\"ahmed@smartschool.com\",\"phone\":\"774411000\",\"role\":\"teacher\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-20 19:56:57\",\"teacher_details\":false}','{\"id\":8,\"name\":\"\\u0627\\u062d\\u0645\\u062f\",\"email\":\"ahmed@smartschool.com\",\"phone\":\"774411000\",\"role\":\"teacher\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-20 19:56:57\",\"teacher_details\":false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 18:24:11'),(107,1,NULL,'UPDATE_SYSTEM_SETTINGS','system_settings',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 18:24:27'),(108,1,NULL,'UPDATE_USER','users',2,'{\"id\":2,\"name\":\"\\u062d\\u0633\\u0627\\u0645 \\u0627\\u0644\\u0634\\u0631\\u0627\\u0639\\u064a\",\"email\":\"school@test.com\",\"phone\":\"776158797\",\"role\":\"school_admin\",\"is_active\":1,\"avatar\":null,\"last_login\":\"2026-06-20 20:26:30\",\"created_at\":\"2026-06-18 02:22:51\",\"school_admin_details\":[{\"school_id\":4}]}','{\"id\":2,\"name\":\"\\u062d\\u0633\\u0627\\u0645 \\u0627\\u0644\\u0634\\u0631\\u0627\\u0639\\u064a\",\"email\":\"school@test.com\",\"phone\":\"776158797\",\"role\":\"school_admin\",\"is_active\":1,\"avatar\":null,\"last_login\":\"2026-06-20 20:26:30\",\"created_at\":\"2026-06-18 02:22:51\",\"school_admin_details\":[{\"school_id\":5}]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 18:46:18'),(109,1,NULL,'UPDATE_SCHOOL','schools',4,'{\"id\":4,\"name\":\"\\u0627\\u0644\\u062a\\u0639\\u0627\\u0648\\u0646\",\"name_en\":\"Altaawon\",\"logo\":null,\"address\":\"\\u0627\\u0644\\u0633\\u0628\\u0639\\u064a\\u0646\",\"city\":\"\\u0635\\u0646\\u0639\\u0627\\u0621\",\"country\":\"YE\",\"phone\":\"777000777\",\"email\":\"aaa@gmail.com\",\"website\":\"https:\\/\\/www.getsoft.com\",\"founded_year\":\"2007\",\"status\":\"active\",\"settings\":\"{\\\"theme\\\":\\\"light\\\"}\",\"created_at\":\"2026-06-19 23:22:43\",\"updated_at\":\"2026-06-20 17:55:46\",\"min_grade_id\":2,\"max_grade_id\":6}','{\"id\":4,\"name\":\"\\u0627\\u0644\\u062a\\u0639\\u0627\\u0648\\u0646\",\"name_en\":\"Altaawon\",\"logo\":null,\"address\":\"\\u0627\\u0644\\u0633\\u0628\\u0639\\u064a\\u0646\",\"city\":\"\\u0625\\u0628\",\"country\":\"YE\",\"phone\":\"777000777\",\"email\":\"aaa@gmail.com\",\"website\":\"https:\\/\\/www.getsoft.com\",\"founded_year\":\"2007\",\"status\":\"active\",\"settings\":\"{\\\"theme\\\":\\\"light\\\"}\",\"created_at\":\"2026-06-19 23:22:43\",\"updated_at\":\"2026-06-20 22:23:38\",\"min_grade_id\":2,\"max_grade_id\":6}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 19:23:38'),(110,1,NULL,'UPDATE_USER','users',2,'{\"id\":2,\"name\":\"\\u062d\\u0633\\u0627\\u0645 \\u0627\\u0644\\u0634\\u0631\\u0627\\u0639\\u064a\",\"email\":\"school@test.com\",\"phone\":\"776158797\",\"role\":\"school_admin\",\"is_active\":1,\"avatar\":null,\"last_login\":\"2026-06-20 20:46:32\",\"created_at\":\"2026-06-18 02:22:51\",\"school_admin_details\":[{\"school_id\":5}]}','{\"id\":2,\"name\":\"\\u062d\\u0633\\u0627\\u0645 \\u0627\\u0644\\u0634\\u0631\\u0627\\u0639\\u064a\",\"email\":\"school@test.com\",\"phone\":\"776158797\",\"role\":\"school_admin\",\"is_active\":1,\"avatar\":null,\"last_login\":\"2026-06-20 20:46:32\",\"created_at\":\"2026-06-18 02:22:51\",\"school_admin_details\":[{\"school_id\":4}]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 19:24:01'),(111,1,NULL,'CREATE_SUBJECT','subjects',4,NULL,'{\"id\":4,\"school_id\":1,\"grade_level_id\":2,\"name\":\"\\u0627\\u0644\\u0639\\u0644\\u0648\\u0645\",\"term\":1,\"name_en\":null,\"code\":null,\"description\":null,\"icon\":null,\"color\":null,\"created_at\":\"2026-06-21 01:51:51\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-20 22:51:51'),(112,2,NULL,'ASSIGN_TEACHER','teachers',3,NULL,'{\"id\":3,\"user_id\":13,\"teacher_code\":\"1111\",\"specialization\":\"IT\",\"qualification\":null,\"hire_date\":\"2026-06-21\",\"created_at\":\"2026-06-21 17:05:16\",\"name\":\"\\u062d\\u0633\\u0627\\u0645 \\u0627\\u0644\\u0634\\u0631\\u0627\\u0639\\u064a\",\"email\":\"hsamalshray359@gmail.com\",\"phone\":null,\"is_active\":1,\"assignments\":[{\"id\":1,\"class_name\":\"A\",\"subject_name\":\"\\u0627\\u0644\\u0631\\u064a\\u0627\\u0636\\u064a\\u0627\\u062a\",\"academic_year\":\"2024-2025\"}]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-21 14:05:16'),(113,1,NULL,'UPDATE_USER','users',2,'{\"id\":2,\"name\":\"\\u062d\\u0633\\u0627\\u0645 \\u0627\\u0644\\u0634\\u0631\\u0627\\u0639\\u064a\",\"email\":\"school@test.com\",\"phone\":\"776158797\",\"role\":\"school_admin\",\"is_active\":1,\"avatar\":null,\"last_login\":\"2026-06-21 16:43:08\",\"created_at\":\"2026-06-18 02:22:51\",\"school_admin_details\":[{\"school_id\":4}]}','{\"id\":2,\"name\":\"\\u062d\\u0633\\u0627\\u0645 \\u0627\\u0644\\u0634\\u0631\\u0627\\u0639\\u064a\",\"email\":\"school@test.com\",\"phone\":\"776158797\",\"role\":\"school_admin\",\"is_active\":0,\"avatar\":null,\"last_login\":\"2026-06-21 16:43:08\",\"created_at\":\"2026-06-18 02:22:51\",\"school_admin_details\":[{\"school_id\":4}]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-21 17:42:21'),(114,1,NULL,'UPDATE_USER','users',2,'{\"id\":2,\"name\":\"\\u062d\\u0633\\u0627\\u0645 \\u0627\\u0644\\u0634\\u0631\\u0627\\u0639\\u064a\",\"email\":\"school@test.com\",\"phone\":\"776158797\",\"role\":\"school_admin\",\"is_active\":0,\"avatar\":null,\"last_login\":\"2026-06-21 19:42:33\",\"created_at\":\"2026-06-18 02:22:51\",\"school_admin_details\":[{\"school_id\":4}]}','{\"id\":2,\"name\":\"\\u062d\\u0633\\u0627\\u0645 \\u0627\\u0644\\u0634\\u0631\\u0627\\u0639\\u064a\",\"email\":\"school@test.com\",\"phone\":\"776158797\",\"role\":\"school_admin\",\"is_active\":1,\"avatar\":null,\"last_login\":\"2026-06-21 19:42:33\",\"created_at\":\"2026-06-18 02:22:51\",\"school_admin_details\":[{\"school_id\":4}]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-21 17:42:46'),(115,1,NULL,'UPDATE_SYSTEM_SETTINGS','system_settings',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-21 17:58:37'),(116,1,NULL,'CREATE_SUBJECT','subjects',5,NULL,'{\"id\":5,\"grade_level_id\":4,\"name\":\"\\u0627\\u0644\\u0644\\u063a\\u0629 \\u0627\\u0644\\u0639\\u0631\\u0628\\u064a\\u0629\",\"name_en\":null,\"code\":null,\"description\":null,\"icon\":null,\"color\":null,\"created_at\":\"2026-06-22 18:31:04\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-22 15:31:04'),(117,1,NULL,'DELETE_SUBJECT','subjects',5,'{\"id\":5,\"grade_level_id\":2,\"name\":\"\\u0627\\u0644\\u0644\\u063a\\u0629 \\u0627\\u0644\\u0639\\u0631\\u0628\\u064a\\u0629\",\"name_en\":null,\"code\":null,\"description\":null,\"icon\":null,\"color\":null,\"created_at\":\"2026-06-22 18:31:04\"}',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-22 15:57:52'),(118,1,NULL,'CREATE_SUBJECT','subjects',6,NULL,'{\"id\":6,\"grade_level_id\":4,\"name\":\"\\u0627\\u0644\\u0644\\u063a\\u0629 \\u0627\\u0644\\u0627\\u0646\\u062c\\u0644\\u064a\\u0632\\u064a\\u0629\",\"name_en\":null,\"code\":null,\"description\":null,\"icon\":null,\"color\":null,\"created_at\":\"2026-06-22 18:58:12\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-06-22 15:58:12'),(119,1,NULL,'UPDATE_SCHOOL','schools',5,'{\"id\":5,\"name\":\"\\u0627\\u0644\\u062a\\u0639\\u0627\\u0648\\u0646\",\"name_en\":\"Altaawon\",\"logo\":null,\"address\":\"\\u0627\\u0644\\u0633\\u0628\\u0639\\u064a\\u0646\",\"city\":\"\\u0635\\u0646\\u0639\\u0627\\u0621\",\"country\":\"YE\",\"phone\":\"777000770\",\"email\":\"aaaa@gmail.com\",\"website\":\"https:\\/\\/www.getsoft.com\",\"founded_year\":\"2020\",\"status\":\"active\",\"settings\":\"{\\\"theme\\\":\\\"light\\\"}\",\"created_at\":\"2026-06-20 15:24:14\",\"updated_at\":\"2026-06-20 19:47:45\",\"min_grade_id\":null,\"max_grade_id\":null}','{\"id\":5,\"name\":\"\\u063a\\u0632\\u0629\",\"name_en\":\"Qaza\",\"logo\":null,\"address\":\"\\u0627\\u0644\\u0633\\u0628\\u0639\\u064a\\u0646\",\"city\":\"\\u0635\\u0646\\u0639\\u0627\\u0621\",\"country\":\"YE\",\"phone\":\"777000770\",\"email\":\"aaaa@gmail.com\",\"website\":\"https:\\/\\/www.getsoft.com\",\"founded_year\":\"2020\",\"status\":\"active\",\"settings\":\"{\\\"theme\\\":\\\"light\\\"}\",\"created_at\":\"2026-06-20 15:24:14\",\"updated_at\":\"2026-06-23 21:20:54\",\"min_grade_id\":2,\"max_grade_id\":6}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-23 18:20:54'),(120,1,NULL,'CREATE_USER','users',25,NULL,'{\"id\":25,\"name\":\"Hossam Alshraie\",\"email\":\"admin1@smartschool.com\",\"phone\":\"776158799\",\"role\":\"school_admin\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-23 21:22:20\",\"school_admin_details\":[{\"school_id\":5}]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-23 18:22:20'),(121,1,NULL,'UPDATE_USER','users',25,'{\"id\":25,\"name\":\"Hossam Alshraie\",\"email\":\"admin1@smartschool.com\",\"phone\":\"776158799\",\"role\":\"school_admin\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-23 21:22:20\",\"school_admin_details\":[{\"school_id\":5}]}','{\"id\":25,\"name\":\"Hossam Alshraie\",\"email\":\"admin1@smartschool.com\",\"phone\":\"776158799\",\"role\":\"school_admin\",\"is_active\":0,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-23 21:22:20\",\"school_admin_details\":[{\"school_id\":5}]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-23 18:23:46'),(122,1,NULL,'UPDATE_USER','users',25,'{\"id\":25,\"name\":\"Hossam Alshraie\",\"email\":\"admin1@smartschool.com\",\"phone\":\"776158799\",\"role\":\"school_admin\",\"is_active\":0,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-23 21:22:20\",\"school_admin_details\":[{\"school_id\":5}]}','{\"id\":25,\"name\":\"Hossam Alshraie\",\"email\":\"admin1@smartschool.com\",\"phone\":\"776158799\",\"role\":\"school_admin\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-23 21:22:20\",\"school_admin_details\":[{\"school_id\":5}]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-23 18:23:55'),(123,1,NULL,'UPDATE_USER','users',25,'{\"id\":25,\"name\":\"Hossam Alshraie\",\"email\":\"admin1@smartschool.com\",\"phone\":\"776158799\",\"role\":\"school_admin\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-23 21:22:20\",\"school_admin_details\":[{\"school_id\":5}]}','{\"id\":25,\"name\":\"Hossam Alshraie\",\"email\":\"admin1@smartschool.com\",\"phone\":\"776158799\",\"role\":\"school_admin\",\"is_active\":1,\"avatar\":null,\"last_login\":null,\"created_at\":\"2026-06-23 21:22:20\",\"school_admin_details\":[{\"school_id\":5}]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-23 18:24:15');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (2,4,2,1,'A',20,'2026-06-20 22:18:36'),(3,4,4,1,'A',15,'2026-06-21 19:04:53'),(4,4,4,1,'B',15,'2026-06-23 16:49:59');
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
  `term` tinyint(4) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `school_id` (`school_id`),
  KEY `idx_subject_type` (`subject_id`,`type`),
  CONSTRAINT `educational_content_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `educational_content_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `educational_content`
--

LOCK TABLES `educational_content` WRITE;
/*!40000 ALTER TABLE `educational_content` DISABLE KEYS */;
INSERT INTO `educational_content` VALUES (1,1,1,'ملخص اللغة العربية','ملخص المثالي','summary','/storage/uploads/summaries/1/1/00f5ea7bf519dd30e6abc6777a59cd0d.pdf',694963,'','both',1,1,'2026-06-20 14:49:13',1),(2,3,1,'المقرر الرئيسي','المنهج الرئيسي للمقرر','curriculum','/storage/uploads/curricula/1/3/d9c36eab416c661d4b1982f756a672d4.pdf',13736,'','both',1,1,'2026-06-20 22:44:45',1),(3,1,1,'مرجع كامل للنحو','مرجع قوي للنحو والاعراب','reference','/storage/uploads/references/1/1/579e468da88ac15473d35df476ca99ca.pdf',229516,'','both',1,1,'2026-06-20 22:49:20',1),(5,4,1,'ملخص المتميز','ملخص قوي للعلوم','summary','/storage/uploads/summaries/1/4/85371e516255eae1104d865516b51e3c.pptx',5315806,'','both',1,1,'2026-06-20 22:52:26',1),(6,4,1,'عرض تقديمي','عرض تقديمي مميز وواضح','presentation','/storage/uploads/presentations/1/4/ab9b6db2d1a74de47b322a1395640ff3.pptx',5672526,'','both',1,1,'2026-06-20 22:53:16',1),(7,3,1,'ملخص للتافضل','ملخص للتفاضل والتكامل قوي جدا ومفهوم','summary','/storage/uploads/summaries/1/3/3540f010a3fdbb53168d3c264a98a813.docx',11083,'','both',1,1,'2026-06-20 23:03:36',1),(8,1,1,'نموذج اختبار','نموذج اختبار 2025','other','/storage/uploads/other/1/1/90438109e6d3c20bbf0758867e1e6585.png',260903,'','both',1,1,'2026-06-20 23:17:59',1),(9,3,1,'ملخص','ملخص','summary','/storage/uploads/summaries/1/3/e10136e26169fd02497ea975a6383965.png',1444096,'','both',1,1,'2026-06-22 15:28:09',1),(11,6,1,'المنهج','مقرر المنهج','curriculum','/storage/uploads/curricula/1/6/1628bd3d61f708ae490003afbc3850da.png',1444096,'','both',1,1,'2026-06-22 15:58:37',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grade_levels`
--

LOCK TABLES `grade_levels` WRITE;
/*!40000 ALTER TABLE `grade_levels` DISABLE KEYS */;
INSERT INTO `grade_levels` VALUES (2,1,'الصف السابع',7,'2026-06-19 21:05:23'),(4,1,'الصف الثامن',8,'2026-06-20 14:20:59'),(6,1,'الصف التاسع',9,'2026-06-20 14:55:35'),(7,1,'الصف الاول الثانوي',10,'2026-06-20 15:11:26'),(9,1,'الصف الثاني الثانوي',11,'2026-06-20 16:55:35');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grade_types`
--

LOCK TABLES `grade_types` WRITE;
/*!40000 ALTER TABLE `grade_types` DISABLE KEYS */;
INSERT INTO `grade_types` VALUES (1,1,'ÇáãÊÇÈÚÉ ÇáÔåÑíÉ',10.00,1.00,'2026-06-23 17:54:16');
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
-- Table structure for table `login_attempts`
--

DROP TABLE IF EXISTS `login_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(45) NOT NULL,
  `attempts` int(11) DEFAULT 1,
  `locked_until` timestamp NULL DEFAULT NULL,
  `last_attempt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ip_address` (`ip_address`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_attempts`
--

LOCK TABLES `login_attempts` WRITE;
/*!40000 ALTER TABLE `login_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `login_attempts` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parents`
--

LOCK TABLES `parents` WRITE;
/*!40000 ALTER TABLE `parents` DISABLE KEYS */;
INSERT INTO `parents` VALUES (1,5,'777000000',NULL,NULL,'2026-06-18 00:35:37'),(2,12,'776677660',NULL,NULL,'2026-06-20 20:09:04'),(3,18,'501234567',NULL,NULL,'2026-06-21 19:14:01'),(4,20,'507654321',NULL,NULL,'2026-06-21 19:14:01'),(5,22,'505556667',NULL,NULL,'2026-06-21 19:14:02');
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
) ENGINE=InnoDB AUTO_INCREMENT=168 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (1,1,'bc5469d86097ceba778558fe40c25662608c7a090d562cf1ebed68b1461af4db00f2697cb489277f532dff9a21ae70177da752b9ebfa2554dff480eeb95cdfde','2026-07-17 22:50:00','2026-06-17 23:50:00'),(2,2,'48d8c07561f9e94238262299869009f844bec1dbf06a1320234c36475fa8693044d04c0858ee9fdfc68498329107427bdb022b3ca3cfa510f398ad13d8dc436d','2026-07-17 22:51:59','2026-06-17 23:51:59'),(3,3,'792520134b71c88dd39dfc3b8e2819733ab409a690368edf9a4f9f81cc618534112550f4699d3fe3cd7e0def96ea07aef05b0bc1dd829b359ccdc387af084cd1','2026-07-17 22:52:43','2026-06-17 23:52:43'),(4,4,'e8caf3461da443edd02cdce93ff01719db2bf85293248bc30372698180d08c7d200af9070236c9786a93aea79b5dca6c4ec4548c3098d60055134b14dc1313e5','2026-07-17 22:54:12','2026-06-17 23:54:12'),(5,1,'90bedc4faed2946c59201b8a94c60adbbc6387b7418574836b131bb6e37cee037f0e8f8fb7ebb7d9cf74da389197329865a77207226f1ccb6067ab833417de26','2026-07-17 22:56:09','2026-06-17 23:56:09'),(6,1,'66334e9a12a5e6dfc60df8d9e9b8d3f72fb96ba8e6e9ef1850d7406b180049f24d6c6867b6fc69e246a000767d9c28120fba2d5ea9d1496c5d1170c9d634855f','2026-07-17 22:59:15','2026-06-17 23:59:15'),(7,1,'b65920daf53dc6e9b93343525684eb944be205fd915083aa75d33dae707e6f2e54145a4da9e28d523e23560f353e075678e40f58b6e7a0405f2c1e8637151028','2026-07-17 22:59:18','2026-06-17 23:59:18'),(8,1,'e92750d5776db29943aee0c83d4a21e41301f516f37600177b7970c8442078a36786b829fa4f4eaac79b756798acb74fd42c28ecccbd5c113ab7027b8e1bf64a','2026-07-17 22:59:21','2026-06-17 23:59:21'),(9,1,'d5891e62974e1a8ed0331f02bbc7b89a16116ee8f48c14ba1a37535595815875a7a148572971c9d25ba2e6589f068d9b392d10a6efb9e3553148fef6f975389f','2026-07-17 22:59:22','2026-06-17 23:59:22'),(10,1,'f054dd684a51cc9a9e45dc00d253b83297b18117ba59eade8d570c45d570499acf65010ec30f30bbb853a428691dc44b6e8e4bf31c36e946139862190f1d2fe9','2026-07-17 22:59:24','2026-06-17 23:59:24'),(43,1,'ea0b6895c1dc1ac4f7e7ae2c8bdeba14bcfc284b875187470b27fdc44b04ed112f1e17e1ebf4da69be1b1f6f2128430e9c91f9c6876318b95667dda074c689a5','2026-07-17 23:05:52','2026-06-18 00:05:52'),(44,1,'cfa6abf9523ff47bf570ef5481f1fbea292c4e9a29b58aca82021eb89bfff1f200f89319a428d15750dfc7ad3210f89b7bfa801fa47cf5d6178388538636e0e4','2026-07-17 23:05:53','2026-06-18 00:05:53'),(45,1,'267780ce91a5843e81f00adeeb78a3ba8edc434a954a757ad03994e6f1d3837a4ad0ad46b7b05f242546ff2dc1d6bc05fbc4642b9904431d3c360a50816a2454','2026-07-17 23:05:55','2026-06-18 00:05:55'),(46,2,'8729b68668ebb20636c283e860770aae53a33cc445902f038dbc50707867d2ac57694531f578c067b6e5eaf5c6f2cfeab84ccc79fefc9c1917c1197faa865f61','2026-07-17 23:24:05','2026-06-18 00:24:05'),(47,3,'b78e024250e2053e71576eea874bf3c25dd71fa46416612c6dd80bdab8bfb2bb55c777ece5c085a21a09330d9030d5de6056e939bc51b7c93169ed3a5138e646','2026-07-17 23:25:08','2026-06-18 00:25:08'),(48,4,'81add37129c0cbcac345b2e21d8ae1f240bcef9fba1cfa740e0af1f09925bbf1ee4c4fa62a1b39033e82a1222d511b45b89bbff8b02e35496118fe0fc9ca916d','2026-07-17 23:25:49','2026-06-18 00:25:49'),(49,1,'e155a16194292e344a36fb6ea72a93338c6835d48c1875b712e99116277f2ab97fe35f32b91ac44e74bea944b107c47112a9a783f68341e12e1177e66c40c205','2026-07-17 23:26:33','2026-06-18 00:26:33'),(50,5,'1abb7e8fbe1e325da06e35088d0f97afea36c7b57de5c11aad217d4c65afa82ce37319de283087fb59b4e8d7a7943e39805c96c10ba0849bb6ed6acc42309bd5','2026-07-17 23:40:19','2026-06-18 00:40:19'),(51,5,'e27a158d0e0496ce44173fb289c42f9ce6a48d6362ebce449c4e9f3a285496eec7255b1eaef204e183b6a62023a7eeba597b3ca1b202cf6d32fd8a341f914273','2026-07-17 23:41:21','2026-06-18 00:41:21'),(52,1,'052c8df1de21f2e900745c31a6b0c7915c31bb56e11b1ecc1de54dc099139308fc2a36d073fb1dee1e5bed3f52f8f68a288c24d22b31d55064c92ed54a2fa50c','2026-07-17 23:45:43','2026-06-18 00:45:43'),(53,2,'938a224efb2385a22ae91719a9f244afa8c36bf65c753fa31d963f745971c36d0f2d0c90c2d706e4ca1af43e775c11d759cc2cc9ef258161421354bedc0409a2','2026-07-17 23:46:08','2026-06-18 00:46:08'),(54,1,'3e1a7fccaed8ca15f08bef97c5e2f364a7fa1a15e9d035b1121cf0a4e891b74da6aabecc2339f363664e09862a610d546572038f4a67706509998c64b8af8c08','2026-07-18 14:21:34','2026-06-18 15:21:34'),(55,2,'c5de6dd0502916a9e77997127ab4b0dafa9d974a543e2766916e001a5b23d111cb87fddc3a1ab14b371bf5b4dd66af6f67ba1825a900279c1b0062b6d8c3a062','2026-07-18 14:23:25','2026-06-18 15:23:25'),(56,3,'aef7b3d780800f30e97c477f600c99b2a3aee7841b9b137f89ac479d869a24a2865ebaec47e20686278f2dafba4200d056b0c3db1c70119491e319fd9afadae3','2026-07-18 14:25:04','2026-06-18 15:25:04'),(57,5,'828cf8d0bf77ebc3584683204c1585a5fd11b1539af3198fed78af9313fd54c9544c8ead628c0bb08720f018a3aa756b2cfa3d38d83574e3564799994c426c57','2026-07-18 14:26:21','2026-06-18 15:26:21'),(58,4,'093f1c7e384f0dd824a1edba9617e8ab73e653811594369354b3f6d1fc5b5f07308f9748bed36a5b2283fee4477daa4a321f6d8133a6b5b1f68e9639ea43ae04','2026-07-18 14:27:47','2026-06-18 15:27:47'),(59,1,'755490eb806eed0426cefe4bff03a153ae8c192801e59c118e90627678e67c47779e200e4c0b15b881c7db960ce3e6da3c2aa76f388627a1699aaa5597d8f335','2026-07-18 14:29:05','2026-06-18 15:29:05'),(60,1,'cd8abb95036dfcec49be8f7df25f6197635e993d57e33c4de5ba83b706d3bca7f240aac0db1b3389ba533145f7816843031394a65558c95f9b03348970ae3f72','2026-07-18 16:45:30','2026-06-18 17:45:30'),(61,2,'239c7103278efb41f74672315e504bed266f3d51535a1efa4616f2fbfcbb25788185a2dfe0064a975b862d5146d3aaa46978ec048b0c54b1720ec3d6372c6895','2026-07-18 16:51:06','2026-06-18 17:51:06'),(62,1,'0d937bd88e4ef5efa54400395675d13ca12c14799d01ff6e846de13c83ff6b86ed067d3fb38e2c735b3895796729f6bacf9eb34881f42f4854db0c0bf37ab069','2026-07-18 16:54:01','2026-06-18 17:54:01'),(63,1,'a7299473a60ca53b295199d3ec9a5532d483882cea73a528f6498d86dec1a6eafc526bb86fa844149db2ce76f0805817f2f6acb2789ada03f3f439b0b093302c','2026-07-19 18:51:53','2026-06-19 19:51:53'),(64,1,'496f802eeea658d41013efddb63cbaa94274285d7301719f6547f7590158aaf4bb2b8f466ac5aedb336d00f18ca6410234ca3726da3b5c8552520f9c7a63e3f3','2026-07-19 19:17:36','2026-06-19 20:17:36'),(65,1,'f81b5980e8c49c7ee162c9326bf46be99fe383fca193c04c8ae856cd30defe69e8f2e2835094275e1da40b2b67d416cadcd6f66e1debbb70ce2b7232c13ef451','2026-07-19 20:05:14','2026-06-19 21:05:14'),(66,1,'01fe3dc73a51eb159efbf9e27136d277c0b205d865eb5f8c677fd19aac890992000dae902ff2a7dec8a3d50125fcc1877571c5b0a0b27d40fd10b450271baefc','2026-07-20 11:23:32','2026-06-20 12:23:32'),(67,1,'1cc8e5f4db54717f18de6cbe485f84b707f089aa31dcc48c4c2e13115c213d5ef0a65161210586018da59daa024ddc2ee842c43515d54cd4bd02645605ec7238','2026-07-20 12:24:05','2026-06-20 13:24:05'),(68,1,'132fa25a3411dcae9c157fffbba95835e8c489c103b7d27aff3daf4488982ad719f3318d6bbc6aa92fbf9d490c13a9e145d0e0542789cb09191095bfb78584aa','2026-07-20 13:24:19','2026-06-20 14:24:19'),(69,1,'deda5b3391d1d44ba712510ae858ada37ffbc87b182d9e8302de03d45b5c697d258fbd666e1a193164f1e844b0c2d2ef11095bf1f91e8cabcd85edf13094ab83','2026-07-20 14:31:55','2026-06-20 15:31:55'),(70,2,'ad422324a09cb8a623a02fb082803600f075c0684798dcc18fd1561bdaebc785452886f05a4634b6fdbdb01b5491fad8a80373e00c8bc07d3872c5dc3bb6ae6c','2026-07-20 15:27:53','2026-06-20 16:27:53'),(71,1,'3d01b495c18fd6190c68edeb07046a8117ebecc3011391ddaab61f939fe8af72dd6271688faf70a36477c604ac85ed89274ee4663033fadb49efc86d15acf5e9','2026-07-20 15:29:16','2026-06-20 16:29:16'),(72,1,'fefd0eeba3c89b47b65272a1e9d9108889ef06812ad2c9eef25dc0c26aa983485d4b900c5a6c2773aff1fafefff323679bca17578342aeae4daf1f67e1b1bcde','2026-07-20 15:39:45','2026-06-20 16:39:45'),(73,1,'aceee09f450a1c18f424e88b14b1a3a8ec0193cc34f70bbd057b398c0bb03f91f2f0a22dbfb2a79bab621f853aee6c786b5fc78e1cae54d968f885c8d4ec9092','2026-07-20 15:58:15','2026-06-20 16:58:15'),(74,1,'a29542aa6721a18d7f38991c0aef53b933face4133773e632afa822d7228cd5c5ebdfbe164c32b8e9b2a5118d27f6bbb470b9d5ded32b973accf94b2b5f66a29','2026-07-20 16:13:16','2026-06-20 17:13:16'),(75,1,'1df680b74b8f1e43df6e177775eb4e9f6c39f72da969d5b663437b4c659e18b71afb2932eb700a9b0adc5c23719ad911db0557ff6db7a134575205abd481daf9','2026-07-20 16:20:32','2026-06-20 17:20:32'),(76,1,'4bebadece7974247de16dbbf6ba7b6afb2898265d2bfc9a024f2045f8d3dbe266201836ba663faf4e1e8b967819a3338c577e85703487f9a98ca0fa553fccf86','2026-07-20 16:22:47','2026-06-20 17:22:47'),(77,1,'36b56a9b75cb845f16b8d65763c4f0c4d0eef2606db18163e5d382702d552c3cf4de0b854d832f3e6afeaf8177cd6e49090c486e526ff603da8e1a1a5e0da780','2026-07-20 16:23:57','2026-06-20 17:23:57'),(78,1,'245e1f5d2f6817aefa34ad6d60433857c89b437a913efacf991a0cc6a05ec2209ff73a47050be2035e5ea06d48a8380ec167be7bf21f2ee32266e284cc4fa645','2026-07-20 16:25:28','2026-06-20 17:25:28'),(79,1,'484da38f3691986f31d4da13c45e3df85ba0aa85230d404b2f1ec7759cd06324194ba12b3549ea55eec83e23c0b9342821372ff2c0f006e4b5ae902364c53315','2026-07-20 16:26:32','2026-06-20 17:26:32'),(80,1,'c9093f1030591a6fd34c92500fdc7f9c77221789c906d08cf86c07d526a5fb8c32e4f9d8a1ccc3b26d0ada47ec0f5d8a460a260625083893cd824c9a6870a1ae','2026-07-20 16:27:12','2026-06-20 17:27:12'),(81,1,'6cbbae83b72b1f1f29b2e2e018b89dcedae4968eddb646422e0948ca7ebb995249f4a99364bd90a15be0c4ce29fccf1c9a4c17ec67f2589d78907dc6ee7995d7','2026-07-20 16:43:50','2026-06-20 17:43:50'),(82,1,'b0f66219f56a52008da9fbdaf235dc1d5c9ea87153ac74b0937be7c121950d5b60e1f15033fa24bd4ca54c310f2fb758f96ab11c369cfdfc437cceea8b200835','2026-07-20 16:49:52','2026-06-20 17:49:52'),(83,1,'199c51f155b912ded67777100e8eb9e8e7361671d14db3249dde3e539fe2948774057fbbbe2765ce9e389b5f28238cf6475c1cb4e1cbfbfd7a4e99c2b0663e76','2026-07-20 17:00:45','2026-06-20 18:00:45'),(84,1,'d4b08b023331749e8e824aebe2837b14da4d9f2ecd4c56db0904d54435c048b322697f1e2f75362ef0f8c644f098fc50a321bcf6fc55e7014c9e5deaf4ed6da3','2026-07-20 17:02:32','2026-06-20 18:02:32'),(85,1,'92da070faecb5379c1566b2c17d46b6807b58f046aa53d3c48de8f5a035062189d9a106ceb1e49c3dc9631dd019254995413913b60c366d453d862c88fcb05ce','2026-07-20 17:02:54','2026-06-20 18:02:54'),(86,2,'7797addda8136c7511385e60394332f3172b6a94af432a0bf13fe2f327ff0d796693d3ac39ad9433af9389dde3d7808dedd783f8565f54bc7e3789049620712f','2026-07-20 17:14:57','2026-06-20 18:14:57'),(87,1,'2668f73e54fc64a2eec711bad268a20b8f6a57c89eab68478ad66a0d055c3bec3916c79f05fdd9f94b45de6cc184a3ee4085dd6d458ce30f935a02b8e23ad347','2026-07-20 17:15:19','2026-06-20 18:15:19'),(88,2,'fa0b3a6b9b642f562b67749eb00cee2da87420deb31f463158d9ed0cb3dd2d5d04c7b8cc8fbb89cd8a5f42304b91f26ca58ff1a35dc40452d10f32dfa44e3d18','2026-07-20 17:26:30','2026-06-20 18:26:30'),(89,1,'bb6a8ab750827316731c68342bd1871b24609c6efb5b2c2134906e635e2bd3045225928843a0f3f226e46259bc969bb480dbe52ed15e9c91205948d67a5e3658','2026-07-20 17:45:29','2026-06-20 18:45:29'),(90,2,'bfb5ff749bc0381b8d49028e0047faedd8ffb23e49db56a408b3c3bfde95297ad547c72b7e1560adcf2754f1726c7364b688391c3a2d98130015ef086c115850','2026-07-20 17:46:32','2026-06-20 18:46:32'),(91,1,'8ed3549b373ec3ac92a57d22fe6f061a4e6c131ff24d42f6d72e9527d75b563d9183e99aa0092f3d1df29c4476513453d43fcde0b3a081e031c5abb9aafb0f6c','2026-07-20 18:23:18','2026-06-20 19:23:18'),(92,1,'3487ff00aa56ecd7e5d505bb24febfed345838835d5b7446ff45cb75e81cee395fdeece00b3391ca48812ec3e1ca2064b06fef5b00af82ac8d63440ae3f752b1','2026-07-20 18:23:52','2026-06-20 19:23:52'),(93,2,'b07be90517244cab104b8a34414929cd6d6ff625c6eea4a71cdd29f1e04a910acc5c4abae9c51eb08c34221323b44645130dfdc95137921f1ad51ea5f3b9319a','2026-07-20 18:24:14','2026-06-20 19:24:14'),(94,1,'3327f18af1f3e8821de0db066b03972bc560fbeea9d94521f37a26851aac48de28df0491788f364af07671201b227e146da77a533428fcaa33c3f6a1741031ba','2026-07-20 18:41:24','2026-06-20 19:41:24'),(95,2,'fe95a6a8c3209e000657660343df8058c0196ae0e941d0bd333e14bd41a0fcc3cb441393e947d91b0d4a418c44f33030a13b2041fa18f28796c5b7624fdd233d','2026-07-20 18:41:47','2026-06-20 19:41:47'),(96,1,'6a07ec15a7aeee15e912ab67d53a429d217cf44c0d04810bdaab4e1ce5a37678c234ee8f0d58dc841a77b0b6e8f09e0c40eaf1b1f74045ee8f8764bc8aa4b032','2026-07-20 21:16:27','2026-06-20 22:16:27'),(97,2,'8d1716db2336bfea3ebcb02fa15bd39abfee047f29077142ce774ae384c048013a2f100cd45bd20497106e19047e70d8bc0509e103f426dbc01567e91b292ba3','2026-07-20 21:16:42','2026-06-20 22:16:42'),(98,1,'432cafdb50212058bb28fa387212684d562631f6c662e95842f2cbbe542f314725d4aabe6aeadde7b5dac5c46520ae8afd35a749dadbf349b9bb49bfbd21d70b','2026-07-20 21:43:30','2026-06-20 22:43:30'),(99,2,'1b46079da6d192f33b36e7850f9b666b23f25d77a3fbd3941785c5928f4f6f031a4cd08e4ce54b70e434e52225fe4291c9af2118a6f01825e70237a457e7b9f7','2026-07-20 21:45:10','2026-06-20 22:45:10'),(100,1,'023955a061c1df4a2e7863ea8391e16f7d8c1c86b2c48930d36fa715dd9cc35a5cf6b2c07ba5d2e246bfeb85b2c4298fad32d5741488a6c9c645d29a40fcd7f2','2026-07-20 21:48:21','2026-06-20 22:48:21'),(101,2,'818238909c8cf54766dfd5ccda7d8c7e7b4db664129ae74843b55f76d1fb4536d398232003cff3e8bc81e446e303921f6f8357dba4c026cff7b098589caa825b','2026-07-20 21:49:38','2026-06-20 22:49:38'),(102,1,'5f8d4046d7e0479cd5c6d447db989262fea48f211c84406d6eb2d9071e3fe145cc1aa1562bfa9a36f144caaf6828aeb375c240d4aa65e88ff0c48c18c1b7755e','2026-07-20 21:50:39','2026-06-20 22:50:39'),(103,2,'735b8104f2be3c827621307ba132aac249f6ef4b52ff17b2815e2ce30302d16e894234e7224a3b6343487d0dbe3e8e8143d55e6cae232285576a32ddb151f27f','2026-07-20 21:53:28','2026-06-20 22:53:28'),(104,1,'372a0d8887dd462ef4672746b344321f3f0bd99beeb716481ea3af23ab8821260cfc2ca1d5772a151923c4076ed7b3092a760a6f27ec6710a82adf116046e146','2026-07-20 22:02:20','2026-06-20 23:02:20'),(105,2,'7852abcaf520d48bf31968279c030f31f2fc837fed3410fbab95eec3bba4d0e88fb0e21f601be67cc98bd652bd30cd9d090d9ebf6c21a79619289f62f39d5337','2026-07-20 22:03:52','2026-06-20 23:03:52'),(106,1,'04a73a9eb3ebf35ecdb64183e5f60f481db1c8a7159c9ffaf1f10b8356392702fd241b6a5089f063a41b8dc91ecc50881095449f279477f774327e3539efda12','2026-07-20 22:17:15','2026-06-20 23:17:15'),(107,2,'45de7f42ba4d069af379f484d50c3e9f912909e32103f51185a53e65a461072de58d89c8346ac47f991cff6f16af370ba0e00ac216e9965044293fff673042f9','2026-07-20 22:18:18','2026-06-20 23:18:18'),(108,2,'527aa9b177d2a7956ca7df8f42578e15e98f6e6af74a3e75c3bcfb6ce57372c2021d05791a5f3ddb7a2e61e28728a5c4c3022b87707dbe9d59a2983e58280f3e','2026-07-21 11:44:51','2026-06-21 12:44:51'),(109,1,'d3629e2ab097d0760674ba925f5b30b552e0a40b7cd8fec8ebe44b84b3ad7f9bdccd6cb5579d43024a8c25c13238c21bbecf52fa0a410d214221f07593551784','2026-07-21 13:42:40','2026-06-21 14:42:40'),(110,2,'28f04517764a65b8c053ee84f1b758d29ee5f411203e2dd213524916fd294b8bd33489cc0702eb761ba259092a3ab33fbee59a01138497606355924ee9d5997f','2026-07-21 13:43:08','2026-06-21 14:43:08'),(111,1,'712eaf6b971e7d7bfc1c2f023c633c8fb61d7e082710964576ac4648f6354083f41d5444bc6c4306e1335ab5d6786614738b66ab22341302476a8f5b31d0954b','2026-07-21 16:41:08','2026-06-21 17:41:08'),(112,1,'733f0dbfc52b25be3da9282df87c745f7c8e4369ea68e6a05946a161bbec7adbf34fe1237e80578ee3a543c074eb7e4a230504bee1fe02797607f613bcd771e1','2026-07-21 16:42:41','2026-06-21 17:42:41'),(113,2,'b137227d115efc4c971557e603573cc93f4e6869fe42b057ff446312088a10f3305d2e64b126b221c83a5388a582eae582462ff62cf3772a0639a72fea7949ac','2026-07-21 16:45:30','2026-06-21 17:45:30'),(114,13,'b2282361154d865464de6ee312a97ea155ed5278680eb8732b228e8108e9598c3c275d3456dc43fbb5e7f5b0aa231953c558d91b0599776dc9cd932321d830bc','2026-07-21 16:56:17','2026-06-21 17:56:17'),(115,1,'805799c231ea32fa81cd85b53dec1a9de76ecf581049ee093e33fac08b5ac27eafd264e34d0f3c3cd7c74c7c545c284a21bbff70ac4295746e77e19b0320ac54','2026-07-21 16:57:11','2026-06-21 17:57:11'),(116,2,'82a8bfdfacad7a5a42bce60e933bc3692c768a144549563341123f40182c2942b5e987bf4113945dda144c3f59f83324f469659f82463accb61eea598c3d1510','2026-07-21 16:57:40','2026-06-21 17:57:40'),(117,1,'cca3215e92cb0552074a95a994c1b7f15914588df4f1beee2ce2daf61b2328b6afb7cd4a4cf4ce16407a6615cc152cff1b561048223f9a4e8617e09d00e2cff6','2026-07-21 16:58:27','2026-06-21 17:58:27'),(118,2,'edb9f60fa4507064c0c6203bef499d82938c28c059a69c64bbeb0d5a0f248ab8bbea4f59906bbb94cf34e0ce350d5e6e45edb1024209021129322263a0b75b64','2026-07-21 16:58:47','2026-06-21 17:58:47'),(119,11,'9845d711dae931e495cf127e5f3856a7aa8303626162e211e7137bf9d68c752c63149f1d837a7abb2274e03f3e4081c55b101dcab0014c04ac8bcc35cec4472e','2026-07-21 17:03:59','2026-06-21 18:03:59'),(120,2,'dd090359af32e54f91956504697cfdf37320f97fd41f733b706610aee49ae409d61e6423263b3c9e933a2450c91dbc4e9ef5dc3c7f121f5852cb5016d09f1086','2026-07-21 17:04:59','2026-06-21 18:04:59'),(121,13,'226647c16f5698233aef6f5703824f85d79942d24b52aee6f6c03994439155e5a04a3b470cc2a518eac696e4cf1bc5a1a5a593fd9040c4e8b6203dad1acd32cf','2026-07-21 18:38:03','2026-06-21 19:38:03'),(122,11,'7d3192076576d900a61864babd9eed23ef27a168c8edcdbf2d985679b4145faad9ac3f558f81927f584d38326323bbfaa25fc78ec75bc1528adc43fca3032fb7','2026-07-21 18:39:58','2026-06-21 19:39:58'),(123,1,'e1868092b209f9deecd16037adeee720e737538fcedf4ebbee21d8596fa33eafc37476be50ded233eee6aa6de9278fb2ab93b19b03bfdc9241eccd2ad28783f3','2026-07-22 11:59:53','2026-06-22 12:59:53'),(124,11,'3d47113ef33d210700800be08422e8e34c72fdb6165548787cf6f7d25a40ee9399026891ccd2eddb418657e8e94bff5323a546a282394f56d2c1e9070901e9ca','2026-07-22 12:38:47','2026-06-22 13:38:47'),(125,2,'5f79e74e1f923533e51619aa746e23371ac44f4902e557158cad080359739480b2e6631ada4d0ace03c8217a2a1d9fa25680f5fa467f3c9193c145b78442cf8b','2026-07-22 12:39:00','2026-06-22 13:39:00'),(126,2,'34b0929f694ef5c9178cac615ce4ac23b7d7e93e27ce01a99894f2c9e0fd5fe328e4008caa06cb0f521d1edd90b66dd08a4b4460a4a4d08ace8b2dbeb2ee8f71','2026-07-22 12:43:07','2026-06-22 13:43:07'),(127,11,'93597df82d5f7f96d574d780b74799f5362338fbb1e0aee4ab4748036e23d2540c1b50067bf33bff8d787250dad4ba855ec6d333727a61c2fc9ef17c2a346bf0','2026-07-22 12:43:35','2026-06-22 13:43:35'),(128,2,'183dd39fdce3f80b9193ad2b05a200a96505ada643ab203c7304b0b38c45bfef142d7205cee4059109b62a61d895584bfefbd128d1dcdb2635072c5920d5c952','2026-07-22 13:08:18','2026-06-22 14:08:18'),(129,11,'7eaa17e48a5a6aaf6eb7c31f8a6e47860481c60f8afd18805a59c8fd18009be9dbbd9bd97f01e3f348314889d280559bb0edaa054efc3947369c71e4dd430880','2026-07-22 13:30:53','2026-06-22 14:30:53'),(130,1,'7b3b236c0b14ef0e2192153b5814f143731d56a810e4e7ae8d45877d66dcd0ed743cf33e27253d9941474397988e575a629ae7213de08f82583473d3cc4fb505','2026-07-22 14:08:23','2026-06-22 15:08:23'),(131,11,'7571c923844b3ad70d584bff8be21ad59562e0ab980ee8cd555fa859b5093e643eea92e29fce0e2f019114ca5a21512be8ec72cb67cb5fb2cd059e03b735ae7e','2026-07-22 14:09:28','2026-06-22 15:09:28'),(132,1,'5e914e312a1a1e17b80e63a08886a7eaf5cf982d5cf8c6e1dba86938bd18a17446c47762a5d0c766f8b43d8aff6bee61508841c6ca90bbcb62f194685c780af3','2026-07-22 14:11:57','2026-06-22 15:11:57'),(133,11,'4dfe28db0fd027cff9f5d1204e2fe30ae6060bcf4a7a5020a6e782b554f5e12bc4fbef1cb9c787560a3d07cb5a3651615d61815baec6e91b87d3ae3f7036db76','2026-07-22 14:12:33','2026-06-22 15:12:33'),(134,1,'a0d45aa7da12b416aaec0852f8f92db950bbf2c838a1ca80d687794a50fbb240176ab0dfb41b809469fa087e7151f263c21df52ebce6937a162c15ecd14a4649','2026-07-22 14:16:34','2026-06-22 15:16:34'),(135,2,'32a71e27ce6ec4a10c05910cdf0c832f144c9379aec3fbd610051b8f9120fac93748b7cb9ab5b30673a403899e621bc978d218187e1e75003587c905a4f96ba8','2026-07-22 14:33:21','2026-06-22 15:33:21'),(136,1,'0fde2f584037bf4a4052d061d5a6907b2f514ab543987b19f79a8378ef0fdff608d3635a46d53ac3c20ce84680f9a220980b0b2d0c5c2f301f3340486b0fb96d','2026-07-22 14:41:26','2026-06-22 15:41:26'),(137,2,'ba6964cd63bff41ebbf2979818ced1d6d3c51c4c283d50257ddd0906a2bf0a139fe14759d2106927bf8982f66d6d9fb542d30f1c1a9462d01d80f218a637137f','2026-07-22 14:44:54','2026-06-22 15:44:54'),(138,11,'c9975cfbf3ca451615eec61a893fa9dd2c8b261484cd6db872796cbffa0ea38ac357acde846bcacba44340ddabc43605a95d2ef9847f0e6702090928a8fd0bbf','2026-07-22 14:51:10','2026-06-22 15:51:10'),(139,2,'d74d8b98fdacb57f74221cf5739c60ed3ef294a57de176bef5cbecc337563896ae92bd48c32be4ab99366ad68de6f8d2915a7a44da69e14bd053864d3d585266','2026-07-22 14:53:46','2026-06-22 15:53:46'),(140,1,'b34bedfdc44353ecc4008de913b68a088e5ead03db754bc556e8146c7d6da38a330fbba9bd81e9a5184be22b77f9c920a2344d51f27e0bfe47175cf6d2035afa','2026-07-22 14:56:08','2026-06-22 15:56:08'),(141,2,'851153bd11c2e1b869d5ea460fda85bf480e51f375cf1023ba6b3fb62d8ee144c0ae8e28ad3355ad6ade9372051b3a65b87b680872aef934198fc4d4d1c5b5cd','2026-07-22 14:58:59','2026-06-22 15:58:59'),(142,11,'8a8cf5dae7b4edddde93982a194901c28c36024f42fdc186de86651aa7a0455bfbce1d636022274881716a4c34e0d26731cd3f1477ee8e7f8f99d1e9719f631d','2026-07-22 15:01:37','2026-06-22 16:01:37'),(143,2,'6fda0198dc459422c8c98702bad7691a299e957a6050f513c29f4b8f827b69645ce437a49ece948188dfd27d805a74cd37b30bbdb6cbafbdf1cb3f01274d96a9','2026-07-22 15:02:06','2026-06-22 16:02:06'),(144,11,'8a83306bebbb9b4df17dc1f1edf7183e76d44aa4213c81173a7adcfbad7a047ed62866fd437c6928852051fa90b0194b7233fa9d3865528b0e40bdf42eba0dc5','2026-07-22 15:02:27','2026-06-22 16:02:27'),(145,2,'24776af1446884cb12a0d08d5f2e866484491cb9dfbdb5c781726de210edeab38e6f730e187f5e6ebf4e566279fd6b1ff8f7a10f9b71115fda326e3a0c9e4e3c','2026-07-22 15:02:44','2026-06-22 16:02:44'),(146,11,'e5e6f3fd339910530f309097479a83dc8629b87eb7dca9a377664af9908cf69e3bf7ecf685598e71f345acc797cc8518061a471688d7faabe3bdd662ada2224b','2026-07-22 15:03:03','2026-06-22 16:03:03'),(147,2,'210b72347095818a4b7ed54bdc6cdf126f1c7184bd5568fa2a479c0adac32e63d85bd22280c7397216378119475d00b09a363e37e63639083f65bf7a1571dc05','2026-07-22 15:19:17','2026-06-22 16:19:17'),(148,11,'6359977a238bcfd427cea654487139b3c7a21b1825706080d3ff356ff0e183cc44b9c23c3d9b72257bf658d9f0b6c7dd86f4d91d5871df6c717433222c83f906','2026-07-22 15:19:56','2026-06-22 16:19:56'),(149,11,'d7a105f571b1f747feada5e96b51675408f906dcb8eec3f097d091c40be57e593408ad5698a0571bdbb0b0f0139955b82a25bd580ebdebaa63e39d55ac1843ed','2026-07-22 15:56:55','2026-06-22 16:56:55'),(150,11,'87e572b8fa31b60a017de8edfec35f21d02333eea6e0e2301f2ff55b070a5e6dd552f58c350a813f3073d7af65ad5a5c8f838021c4bb433b0f25e0aad8159654','2026-07-23 14:46:23','2026-06-23 15:46:23'),(151,2,'8766ac1342de8553baadcbed2cde6d18c6f20afcca04466bb9cb75679e77d0de334573dc5fb94a96fc1f21ae6d2a2252597de930a66a9053dd974fcdb537b7b5','2026-07-23 15:04:19','2026-06-23 16:04:19'),(152,11,'cefbdd867573888d97121fa17b4beebcc236dabbc33cb0dde568bbd6e62abd2d4c19ed73ba4eae45917d09011c32b08801a09cb00f9b352bc8b00de5929e8bb2','2026-07-23 15:06:32','2026-06-23 16:06:32'),(153,3,'7fe7e2d8f412b6061af7c4c54736427dff9c63ce16d25612305bb878707b72a8370d427fab60b9512891e0d4c881c8093658d4ac4f57bcdef929e71ecfee9890','2026-07-23 15:09:49','2026-06-23 16:09:49'),(154,13,'bd432f89ff91766c3495489a0fb37a000f96e8c9b188a70c0e70d22d49697fb092ede1c39c1b139df51de891d90c2074bf1f9c1217afe9e1b2f0582dcc58265c','2026-07-23 15:10:22','2026-06-23 16:10:22'),(155,11,'528f7dbac7ed9ef5e0722ed347092af2482aa6bead80b6ae2fe402a7e02d7ed787ad0b4fc0fa8e7ca14c574005c206eccfb858cada68705d6c3b78fc78f726dc','2026-07-23 15:19:22','2026-06-23 16:19:22'),(156,1,'675c9ef79702982bd7f94dc0c57871c61bdc99b223b6f1f46d7bfe7c755a5db9339790f37c2cdb3bcbc0c8503f839e815c25acefaba4904d4ad82aa0f2924ced','2026-07-23 15:27:25','2026-06-23 16:27:25'),(157,11,'6f477f4b4876ff252e013628b5008ab8beec5bf3ab9bfe5cb1b94fb393877bd064ba2e4e0efed6457a3b5c69185af43d027b9fecf3a706e483c0fdfb10b48b88','2026-07-23 15:36:43','2026-06-23 16:36:43'),(158,2,'aae87e762c517124644c52a70a67172e4757f3e8419730b885b36e9e00f896063182780eeb41c53db9f07aedf4d98dc49ad3dbdc8c46dab7f68d6787f6a60e7c','2026-07-23 15:44:43','2026-06-23 16:44:43'),(159,1,'30679f78da0d4044513efbdbf3341528cafb5d66a6860665dc03942413118fc7256673680dbad7057115fab68d29ce424a4d9d427cbd8c1aa7c33da35ee326c0','2026-07-23 16:01:23','2026-06-23 17:01:23'),(160,1,'214778941bb5f0649f9e8a73072c1763460402298a7ee0f4736f4985ef55a27246c539b9845d29ad87a5ed6bdfe970e3d72407411a46616aa7e34ed3a1b458f8','2026-07-23 16:21:35','2026-06-23 17:21:35'),(161,13,'a58b938590e460e5551b8ae6994e259501b4c00104618088b1ed8b1b0fa1428554105f4048b1272fff8e791513224e24e0698c820b4b0184155c65f432b77c08','2026-07-23 16:22:16','2026-06-23 17:22:16'),(162,25,'2a7fe022ab8c03e070ac3dcbbfca242c07d9bd1bba41921727e3ce4a8c9589dd1d6641ff991e5b73c14fc2baee3faf4dee3be2c799dda71a81beea697df3ebd3','2026-07-23 17:24:35','2026-06-23 18:24:35'),(163,1,'d37ec2a1eb77649f23d0626730d44f37c37b14033ba003be3f8ed960602240b9fc2d436b38e3684f75da09dd31a230066510345838145af50a5d49683a668b82','2026-07-23 17:25:48','2026-06-23 18:25:48'),(164,25,'f8e8dfcc9c7af58700116b4eaf1fcf8cb73a2729b59067f1282ca67fe16fd8992b619a96d4600d1326fed91af0a2b60bbee9d1d10391c7d36908ee47f0da74fa','2026-07-23 17:26:09','2026-06-23 18:26:09'),(165,11,'6436eec7f9b56334266874f1f348ed75b6e05d63adc7b112509a12543d6f017addde2a9c2d0480f09e9169f6b52e1cef146b64819caa94868e7462c734abe9ca','2026-07-23 18:08:41','2026-06-23 19:08:41'),(166,13,'057307e6554622991c550d12007663e765228be20b9a4efb52b414d1fae70c9b2523b7ef8a5937440dc83bdccde5a7860e9ac3bc9b1f417c6e1d15139b2eb46f','2026-07-23 18:09:10','2026-06-23 19:09:10'),(167,1,'e98d1cbd8c34754d2cf435f8ce1cb43c8b02de51fb7c7174ea649318405a4a8557854defe3b73d49c39862e41699643b1111cebc0c86a72eac3d01edb0f90fc9','2026-07-23 18:29:44','2026-06-23 19:29:44');
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `school_admins`
--

LOCK TABLES `school_admins` WRITE;
/*!40000 ALTER TABLE `school_admins` DISABLE KEYS */;
INSERT INTO `school_admins` VALUES (12,2,4,'2026-06-21 17:42:46'),(16,25,5,'2026-06-23 18:24:15');
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
INSERT INTO `schools` VALUES (1,'Ù…Ø¯Ø±Ø³Ø© Ø§Ù„Ù†Ù‡Ø¶Ø© Ø§Ù„Ø­Ø¯ÙŠØ«Ø©',NULL,NULL,NULL,'ØµÙ†Ø¹Ø§Ø¡','YE',NULL,NULL,NULL,NULL,'active',NULL,'2026-06-17 23:22:51','2026-06-17 23:22:51',NULL,NULL),(2,'مدرسة الاختبار التشخيصي',NULL,NULL,NULL,'صنعاء','YE',NULL,NULL,NULL,NULL,'active','{\"theme\":\"light\"}','2026-06-19 20:17:36','2026-06-19 20:17:36',NULL,NULL),(4,'التعاون','Altaawon',NULL,'السبعين','إب','YE','777000777','aaa@gmail.com','https://www.getsoft.com',2007,'active','{\"theme\":\"light\"}','2026-06-19 20:22:43','2026-06-20 19:23:38',2,6),(5,'غزة','Qaza',NULL,'السبعين','صنعاء','YE','777000770','aaaa@gmail.com','https://www.getsoft.com',2020,'active','{\"theme\":\"light\"}','2026-06-20 12:24:14','2026-06-23 18:20:54',2,6);
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
  `grade_level_id` int(10) unsigned DEFAULT NULL,
  `class_id` int(10) unsigned DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (3,11,4,2,2,1,'STU-8614375','2004-08-18','male','776677660','اب','2026-06-20','active','2026-06-20 20:09:04','2026-06-22 16:02:55'),(7,17,4,4,4,1,'STU-69240780',NULL,'male','501234567','الرياض - حي الياسمين','2026-06-21','active','2026-06-21 19:14:00','2026-06-23 16:50:11'),(8,19,4,4,3,1,'STU-69241721',NULL,'female','507654321','الرياض - حي الملز','2026-06-21','active','2026-06-21 19:14:01','2026-06-23 16:50:20'),(9,21,4,4,4,1,'STU-69241872',NULL,'male','505556667','الرياض - حي النرجس','2026-06-21','active','2026-06-21 19:14:02','2026-06-23 16:51:36');
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
  `grade_level_id` int(10) unsigned DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `name_en` varchar(150) DEFAULT NULL,
  `code` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `color` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_subject_grade` (`grade_level_id`),
  CONSTRAINT `fk_subject_grade` FOREIGN KEY (`grade_level_id`) REFERENCES `grade_levels` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,2,'اللغة العربية',NULL,NULL,NULL,NULL,NULL,'2026-06-20 14:47:56'),(3,2,'الرياضيات',NULL,NULL,NULL,NULL,NULL,'2026-06-20 16:52:14'),(4,2,'العلوم',NULL,NULL,NULL,NULL,NULL,'2026-06-20 22:51:51'),(6,4,'اللغة الانجليزية',NULL,NULL,NULL,NULL,NULL,'2026-06-22 15:58:12');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'password_min_length','8','security','2026-06-20 18:24:27'),(2,'password_require_special','1','security','2026-06-20 17:02:52'),(3,'session_timeout','120','security','2026-06-20 17:25:39'),(4,'max_login_attempts','50','security','2026-06-21 17:58:37'),(5,'enable_2fa','0','security','2026-06-20 17:02:52');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_assignments`
--

LOCK TABLES `teacher_assignments` WRITE;
/*!40000 ALTER TABLE `teacher_assignments` DISABLE KEYS */;
INSERT INTO `teacher_assignments` VALUES (4,3,4,2,3,1,'2026-06-21 14:57:05'),(5,4,4,2,4,1,'2026-06-23 16:05:17'),(6,5,4,2,1,1,'2026-06-23 16:06:21');
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
  `phone` varchar(30) DEFAULT NULL,
  `teacher_code` varchar(50) DEFAULT NULL,
  `specialization` varchar(150) DEFAULT NULL,
  `qualification` varchar(150) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `teacher_code` (`teacher_code`),
  CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES (1,3,NULL,NULL,'Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª',NULL,NULL,'2026-06-17 23:22:51'),(3,13,'0776158797','1111','IT','بكالوريوس تقنية معلومات','2026-06-21','2026-06-21 14:05:16'),(4,23,'772905223','2222','IT','بكالوريوس تقنية معلومات','2026-06-23','2026-06-23 16:05:17'),(5,24,'775659026','3333','IT','بكالوريوس تقنية معلومات','2026-06-23','2026-06-23 16:06:21');
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
  `failed_attempts` int(11) DEFAULT 0,
  `locked_until` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Super Admin','admin@smartschool.com',NULL,'$2y$10$9r5qeJaTbZDRlr69JggWz.Cu0hCmTij4jsWENBkKKGmztO0ucrDTC','super_admin',NULL,NULL,1,'2026-06-23 18:29:44','2026-06-17 23:22:41','2026-06-23 19:29:44',0,NULL),(2,'حسام الشراعي','school@test.com','776158797','$2y$12$GYChAicFZ6CJk9Y1fnGHYOBhE8Ca9O5PqX4DIg8.DKNnndOg1koEG','school_admin',NULL,NULL,1,'2026-06-23 15:44:43','2026-06-17 23:22:51','2026-06-23 16:44:43',0,NULL),(3,'Ø§Ù„Ø£Ø³ØªØ§Ø° Ø®Ø§Ù„Ø¯','teacher@test.com',NULL,'$2y$10$9r5qeJaTbZDRlr69JggWz.Cu0hCmTij4jsWENBkKKGmztO0ucrDTC','teacher',NULL,NULL,1,'2026-06-23 15:09:49','2026-06-17 23:22:51','2026-06-23 16:09:49',0,NULL),(4,'Ù…Ø­Ù…Ø¯ Ø¹Ù„ÙŠ','student@test.com',NULL,'$2y$10$9r5qeJaTbZDRlr69JggWz.Cu0hCmTij4jsWENBkKKGmztO0ucrDTC','student',NULL,NULL,1,'2026-06-18 14:27:47','2026-06-17 23:22:51','2026-06-18 15:27:47',0,NULL),(5,'ولي الأمر محمد','parent@test.com',NULL,'$2y$10$QKyQ7HNBn2bfGrLPSTdamOeMCdfLT/CcpSbkH4BDgIt9QCxXy/vMu','parent',NULL,NULL,1,'2026-06-18 14:26:21','2026-06-18 00:35:37','2026-06-18 15:26:21',0,NULL),(6,'سليمان المهدي','soliman@smartschool.com','776677667','$2y$12$vinRe1OvkmcICU0P1BUnsuMmNQeQtySh5pOzDg4pVu6DZTZhDfrfG','student',NULL,NULL,1,NULL,'2026-06-20 16:21:05','2026-06-20 16:48:05',0,NULL),(7,'محمد','mohamed@smartschool.com','776655440','$2y$12$XSqLA5szXqYzumwYI7i0C.HT9fliabB6H4vrEqxHEGhw7L4y8k.VG','student',NULL,NULL,1,NULL,'2026-06-20 16:50:13','2026-06-20 16:55:59',0,NULL),(8,'احمد','ahmed@smartschool.com','774411000','$2y$12$18CfcNiD8m/2JaJ1RCu9QeDPXSQu.ProgVGIDItLWI0X8ha5.rAk6','teacher',NULL,NULL,1,NULL,'2026-06-20 16:56:57','2026-06-20 18:24:11',0,NULL),(11,'حسام صادق الشراعي','hsamalshray86@gmail.com',NULL,'$2y$12$tM6N4v0GK.NzH7ge3TwQmuMsGvx2IYaZMB9lQJNh/1QBIWODrzULG','student',NULL,NULL,1,'2026-06-23 18:08:41','2026-06-20 20:09:04','2026-06-23 19:08:41',0,NULL),(12,'ولي أمر الطالب حسام صادق الشراعي',NULL,'776677660','$2y$12$JKHIdu5BqBix3n4MmTQKfe5AZSSEltMqIgkVGvU8KZbDxwp5hZ57.','parent',NULL,NULL,1,NULL,'2026-06-20 20:09:04','2026-06-20 20:09:04',0,NULL),(13,'حسام الشراعي','hsamalshray359@gmail.com','0776158797','$2y$12$iX1JToGwST5CaVJEzxr/4.8ciKTanj.qo2y4ixSGirO9MrMRWfxkm','teacher',NULL,NULL,1,'2026-06-23 18:09:10','2026-06-21 14:05:16','2026-06-23 19:09:10',0,NULL),(17,'أحمد محمد عبد الله','ahmed.test@school.com',NULL,'$2y$12$ZaFtjZKwk2IyRy7VrSkqlOr4.SzGPHm87uopOEqnputdX442299mW','student',NULL,NULL,1,NULL,'2026-06-21 19:14:00','2026-06-21 19:14:00',0,NULL),(18,'ولي أمر الطالب أحمد محمد عبد الله',NULL,'501234567','$2y$12$JcLFruo/O60n9WAQ/RRJFeCgrHVtu8r3okeH/dh4gU7tP.x8Nso.K','parent',NULL,NULL,1,NULL,'2026-06-21 19:14:01','2026-06-21 19:14:01',0,NULL),(19,'سارة محمود حسن','sara.test@school.com',NULL,'$2y$12$bXm3kSglDhg9aOU9akINWeLvwsVRF2bbgly5cMa5pxyJBd.ozbYyK','student',NULL,NULL,1,NULL,'2026-06-21 19:14:01','2026-06-21 19:14:01',0,NULL),(20,'ولي أمر الطالب سارة محمود حسن',NULL,'507654321','$2y$12$oemMvqNDrvtwCQV1Cb7qOOkqDocvleijjq7tClctzqiuDUaRnpL2q','parent',NULL,NULL,1,NULL,'2026-06-21 19:14:01','2026-06-21 19:14:01',0,NULL),(21,'علي عمر خالد','ali.test@school.com',NULL,'$2y$12$4L/eRGVEOhYnXDMyfyfODOXYbwz9Sslox1Mkah8tj4LFDoo4ZoO.2','student',NULL,NULL,1,NULL,'2026-06-21 19:14:02','2026-06-21 19:14:02',0,NULL),(22,'ولي أمر الطالب علي عمر خالد',NULL,'505556667','$2y$12$WNW99pwFcmM7NkutMG6Qb.Ae3W./FhykL8n7TDoXmkADS56xmN.A.','parent',NULL,NULL,1,NULL,'2026-06-21 19:14:02','2026-06-21 19:14:02',0,NULL),(23,'عمر','amr@gmail.com','772905223','$2y$12$MlLthzvk5rg2lFksQQPbuusFK7HBuhDiyzp/hZe8EjQi7RA/vU4tW','teacher',NULL,NULL,1,NULL,'2026-06-23 16:05:17','2026-06-23 16:05:17',0,NULL),(24,'عبدالعزيز','aziz@gmail.com','775659026','$2y$12$7IdzGoHqtuyYUtuB9R3mg.kouJr6Yfa6L6xPQau8dTkffmRlX2WVS','teacher',NULL,NULL,1,NULL,'2026-06-23 16:06:21','2026-06-23 16:06:21',0,NULL),(25,'Hossam Alshraie','admin1@smartschool.com','776158799','$2y$12$6Ib/xmB9KBzrOD7XDTZxeOvq25aWd.29dhkyscaApxYCXcHFJ3hpO','school_admin',NULL,NULL,1,'2026-06-23 17:26:09','2026-06-23 18:22:20','2026-06-23 18:26:09',0,NULL);
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

-- Dump completed on 2026-06-23 22:29:54
