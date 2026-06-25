<?php
require_once __DIR__ . '/core/Database.php';
$db = \Core\Database::getInstance();

echo "Attempting to fix corrupted tables...\n";

$queries = [
    "SET FOREIGN_KEY_CHECKS = 0;",
    "DROP TABLE IF EXISTS `assignment_submissions`;",
    "DROP TABLE IF EXISTS `assignments`;",
    
    "CREATE TABLE `assignments` (
        `id`                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `teacher_id`        INT UNSIGNED NOT NULL,
        `class_id`          INT UNSIGNED NOT NULL,
        `subject_id`        INT UNSIGNED NOT NULL,
        `academic_year_id`  INT UNSIGNED NOT NULL,
        `title`             VARCHAR(300) NOT NULL,
        `description`       TEXT,
        `type`              ENUM('homework','project','research','activity') DEFAULT 'homework',
        `due_date`          DATE NOT NULL,
        `max_score`         DECIMAL(6,2) DEFAULT NULL,
        `attachment`        VARCHAR(500) DEFAULT NULL,
        `created_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

    "CREATE TABLE `assignment_submissions` (
        `id`              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `assignment_id`   INT UNSIGNED NOT NULL,
        `student_id`      INT UNSIGNED NOT NULL,
        `submission_file` VARCHAR(500) DEFAULT NULL,
        `note`            TEXT,
        `score`           DECIMAL(6,2) DEFAULT NULL,
        `status`          ENUM('pending','submitted','graded','late') DEFAULT 'pending',
        `submitted_at`    TIMESTAMP NULL DEFAULT NULL,
        `graded_at`       TIMESTAMP NULL DEFAULT NULL,
        UNIQUE KEY `uq_submission` (`assignment_id`, `student_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

    "SET FOREIGN_KEY_CHECKS = 1;"
];

foreach ($queries as $q) {
    try {
        $db->query($q);
        echo "Executed: " . substr($q, 0, 50) . "...\n";
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}

echo "Database fix operation completed.\n";
