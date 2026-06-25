-- ============================================================
-- Smart School Management System — Full Database Schema
-- Engine: MySQL 8 | Charset: utf8mb4_unicode_ci
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. schools
-- ============================================================
CREATE TABLE IF NOT EXISTS `schools` (
    `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name`          VARCHAR(200) NOT NULL,
    `name_en`       VARCHAR(200) DEFAULT NULL,
    `logo`          VARCHAR(500) DEFAULT NULL,
    `address`       TEXT,
    `city`          VARCHAR(100) DEFAULT NULL,
    `country`       VARCHAR(100) DEFAULT 'YE',
    `phone`         VARCHAR(30) DEFAULT NULL,
    `email`         VARCHAR(150) DEFAULT NULL,
    `website`       VARCHAR(300) DEFAULT NULL,
    `founded_year`  YEAR DEFAULT NULL,
    `status`        ENUM('active','inactive','suspended') DEFAULT 'active',
    `settings`      JSON DEFAULT NULL,
    `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uq_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. users
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
    `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name`          VARCHAR(150) NOT NULL,
    `email`         VARCHAR(150) DEFAULT NULL,
    `phone`         VARCHAR(30) DEFAULT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role`          ENUM('super_admin','school_admin','teacher','student','parent') NOT NULL,
    `avatar`        VARCHAR(500) DEFAULT NULL,
    `fcm_token`     VARCHAR(500) DEFAULT NULL,
    `is_active`     TINYINT(1) DEFAULT 1,
    `last_login`    TIMESTAMP NULL DEFAULT NULL,
    `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uq_email` (`email`),
    INDEX `idx_role` (`role`),
    INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. school_admins
-- ============================================================
CREATE TABLE IF NOT EXISTS `school_admins` (
    `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id`     INT UNSIGNED NOT NULL,
    `school_id`   INT UNSIGNED NOT NULL,
    `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uq_admin_school` (`user_id`, `school_id`),
    FOREIGN KEY (`user_id`)   REFERENCES `users`(`id`)   ON DELETE CASCADE,
    FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. academic_years
-- ============================================================
CREATE TABLE IF NOT EXISTS `academic_years` (
    `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `school_id`   INT UNSIGNED NOT NULL,
    `name`        VARCHAR(50) NOT NULL,
    `start_date`  DATE NOT NULL,
    `end_date`    DATE NOT NULL,
    `is_current`  TINYINT(1) DEFAULT 0,
    `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
    INDEX `idx_school_year` (`school_id`, `is_current`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. grade_levels
-- ============================================================
CREATE TABLE IF NOT EXISTS `grade_levels` (
    `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `school_id`   INT UNSIGNED NOT NULL,
    `name`        VARCHAR(100) NOT NULL,
    `order_num`   TINYINT UNSIGNED DEFAULT NULL,
    `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. classes (شعب/فصول)
-- ============================================================
CREATE TABLE IF NOT EXISTS `classes` (
    `id`                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `school_id`         INT UNSIGNED NOT NULL,
    `grade_level_id`    INT UNSIGNED NOT NULL,
    `academic_year_id`  INT UNSIGNED NOT NULL,
    `name`              VARCHAR(50) NOT NULL,
    `capacity`          TINYINT UNSIGNED DEFAULT 40,
    `created_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`school_id`)         REFERENCES `schools`(`id`)        ON DELETE CASCADE,
    FOREIGN KEY (`grade_level_id`)    REFERENCES `grade_levels`(`id`)   ON DELETE CASCADE,
    FOREIGN KEY (`academic_year_id`)  REFERENCES `academic_years`(`id`) ON DELETE CASCADE,
    INDEX `idx_school_grade` (`school_id`, `grade_level_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. subjects
-- ============================================================
CREATE TABLE IF NOT EXISTS `subjects` (
    `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `school_id`   INT UNSIGNED NOT NULL,
    `name`        VARCHAR(150) NOT NULL,
    `name_en`     VARCHAR(150) DEFAULT NULL,
    `code`        VARCHAR(20) DEFAULT NULL,
    `description` TEXT,
    `icon`        VARCHAR(100) DEFAULT NULL,
    `color`       VARCHAR(10) DEFAULT NULL,
    `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. class_subjects
-- ============================================================
CREATE TABLE IF NOT EXISTS `class_subjects` (
    `id`                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `class_id`          INT UNSIGNED NOT NULL,
    `subject_id`        INT UNSIGNED NOT NULL,
    `academic_year_id`  INT UNSIGNED NOT NULL,
    `weekly_hours`      TINYINT UNSIGNED DEFAULT 4,
    UNIQUE KEY `uq_class_subject` (`class_id`, `subject_id`, `academic_year_id`),
    FOREIGN KEY (`class_id`)          REFERENCES `classes`(`id`)        ON DELETE CASCADE,
    FOREIGN KEY (`subject_id`)        REFERENCES `subjects`(`id`)       ON DELETE CASCADE,
    FOREIGN KEY (`academic_year_id`)  REFERENCES `academic_years`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. teachers
-- ============================================================
CREATE TABLE IF NOT EXISTS `teachers` (
    `id`              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id`         INT UNSIGNED NOT NULL UNIQUE,
    `specialization`  VARCHAR(150) DEFAULT NULL,
    `qualification`   VARCHAR(150) DEFAULT NULL,
    `hire_date`       DATE DEFAULT NULL,
    `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. students
-- ============================================================
CREATE TABLE IF NOT EXISTS `students` (
    `id`                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id`           INT UNSIGNED NOT NULL UNIQUE,
    `school_id`         INT UNSIGNED NOT NULL,
    `class_id`          INT UNSIGNED NOT NULL,
    `academic_year_id`  INT UNSIGNED NOT NULL,
    `student_code`      VARCHAR(30) NOT NULL UNIQUE,
    `date_of_birth`     DATE DEFAULT NULL,
    `gender`            ENUM('male','female') DEFAULT NULL,
    `parent_phone`      VARCHAR(30) NOT NULL,
    `address`           TEXT,
    `enrolled_at`       DATE DEFAULT NULL,
    `status`            ENUM('active','suspended','transferred','graduated') DEFAULT 'active',
    `created_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`)           REFERENCES `users`(`id`)          ON DELETE CASCADE,
    FOREIGN KEY (`school_id`)         REFERENCES `schools`(`id`)        ON DELETE CASCADE,
    FOREIGN KEY (`class_id`)          REFERENCES `classes`(`id`)        ON DELETE RESTRICT,
    FOREIGN KEY (`academic_year_id`)  REFERENCES `academic_years`(`id`) ON DELETE RESTRICT,
    INDEX `idx_parent_phone` (`parent_phone`),
    INDEX `idx_school_class` (`school_id`, `class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. parents
-- ============================================================
CREATE TABLE IF NOT EXISTS `parents` (
    `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id`       INT UNSIGNED NOT NULL UNIQUE,
    `phone`         VARCHAR(30) NOT NULL UNIQUE,
    `national_id`   VARCHAR(30) DEFAULT NULL,
    `occupation`    VARCHAR(100) DEFAULT NULL,
    `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. teacher_assignments
-- ============================================================
CREATE TABLE IF NOT EXISTS `teacher_assignments` (
    `id`                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `teacher_id`        INT UNSIGNED NOT NULL,
    `school_id`         INT UNSIGNED NOT NULL,
    `class_id`          INT UNSIGNED NOT NULL,
    `subject_id`        INT UNSIGNED NOT NULL,
    `academic_year_id`  INT UNSIGNED NOT NULL,
    `created_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uq_teacher_class_subject` (`teacher_id`, `class_id`, `subject_id`, `academic_year_id`),
    FOREIGN KEY (`teacher_id`)        REFERENCES `teachers`(`id`)       ON DELETE CASCADE,
    FOREIGN KEY (`school_id`)         REFERENCES `schools`(`id`)        ON DELETE CASCADE,
    FOREIGN KEY (`class_id`)          REFERENCES `classes`(`id`)        ON DELETE CASCADE,
    FOREIGN KEY (`subject_id`)        REFERENCES `subjects`(`id`)       ON DELETE CASCADE,
    FOREIGN KEY (`academic_year_id`)  REFERENCES `academic_years`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. attendance
-- ============================================================
CREATE TABLE IF NOT EXISTS `attendance` (
    `id`                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `student_id`        INT UNSIGNED NOT NULL,
    `class_id`          INT UNSIGNED NOT NULL,
    `subject_id`        INT UNSIGNED DEFAULT NULL,
    `teacher_id`        INT UNSIGNED NOT NULL,
    `academic_year_id`  INT UNSIGNED NOT NULL,
    `date`              DATE NOT NULL,
    `status`            ENUM('present','absent','late','excused') NOT NULL,
    `note`              VARCHAR(500) DEFAULT NULL,
    `approval_status`   ENUM('pending','approved','rejected') DEFAULT 'pending',
    `approved_by`       INT UNSIGNED DEFAULT NULL,
    `approved_at`       TIMESTAMP NULL DEFAULT NULL,
    `created_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uq_attendance` (`student_id`, `date`, `subject_id`),
    FOREIGN KEY (`student_id`)  REFERENCES `students`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`teacher_id`)  REFERENCES `teachers`(`id`) ON DELETE RESTRICT,
    INDEX `idx_date_class` (`date`, `class_id`),
    INDEX `idx_student_date` (`student_id`, `date`),
    INDEX `idx_approval` (`approval_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. grade_types
-- ============================================================
CREATE TABLE IF NOT EXISTS `grade_types` (
    `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `school_id`   INT UNSIGNED NOT NULL,
    `name`        VARCHAR(100) NOT NULL,
    `max_score`   DECIMAL(5,2) NOT NULL,
    `weight`      DECIMAL(4,2) DEFAULT 1.00,
    `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. grades
-- ============================================================
CREATE TABLE IF NOT EXISTS `grades` (
    `id`                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `student_id`        INT UNSIGNED NOT NULL,
    `teacher_id`        INT UNSIGNED NOT NULL,
    `subject_id`        INT UNSIGNED NOT NULL,
    `class_id`          INT UNSIGNED NOT NULL,
    `academic_year_id`  INT UNSIGNED NOT NULL,
    `grade_type_id`     INT UNSIGNED NOT NULL,
    `score`             DECIMAL(6,2) NOT NULL,
    `max_score`         DECIMAL(6,2) NOT NULL,
    `term`              TINYINT DEFAULT 1,
    `note`              TEXT,
    `approval_status`   ENUM('pending','approved','rejected') DEFAULT 'pending',
    `approved_by`       INT UNSIGNED DEFAULT NULL,
    `approved_at`       TIMESTAMP NULL DEFAULT NULL,
    `created_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`)    REFERENCES `students`(`id`)     ON DELETE CASCADE,
    FOREIGN KEY (`teacher_id`)    REFERENCES `teachers`(`id`)     ON DELETE RESTRICT,
    FOREIGN KEY (`subject_id`)    REFERENCES `subjects`(`id`)     ON DELETE RESTRICT,
    FOREIGN KEY (`grade_type_id`) REFERENCES `grade_types`(`id`)  ON DELETE RESTRICT,
    INDEX `idx_student_subject` (`student_id`, `subject_id`, `academic_year_id`),
    INDEX `idx_approval` (`approval_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 16. assignments
-- ============================================================
CREATE TABLE IF NOT EXISTS `assignments` (
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
    `created_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`teacher_id`)        REFERENCES `teachers`(`id`)       ON DELETE CASCADE,
    FOREIGN KEY (`class_id`)          REFERENCES `classes`(`id`)        ON DELETE CASCADE,
    FOREIGN KEY (`subject_id`)        REFERENCES `subjects`(`id`)       ON DELETE CASCADE,
    FOREIGN KEY (`academic_year_id`)  REFERENCES `academic_years`(`id`) ON DELETE CASCADE,
    INDEX `idx_class_due` (`class_id`, `due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 17. assignment_submissions
-- ============================================================
CREATE TABLE IF NOT EXISTS `assignment_submissions` (
    `id`              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `assignment_id`   INT UNSIGNED NOT NULL,
    `student_id`      INT UNSIGNED NOT NULL,
    `submission_file` VARCHAR(500) DEFAULT NULL,
    `note`            TEXT,
    `score`           DECIMAL(6,2) DEFAULT NULL,
    `status`          ENUM('pending','submitted','graded','late') DEFAULT 'pending',
    `submitted_at`    TIMESTAMP NULL DEFAULT NULL,
    `graded_at`       TIMESTAMP NULL DEFAULT NULL,
    UNIQUE KEY `uq_submission` (`assignment_id`, `student_id`),
    FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`)    REFERENCES `students`(`id`)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 18. educational_content
-- ============================================================
CREATE TABLE IF NOT EXISTS `educational_content` (
    `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `subject_id`    INT UNSIGNED NOT NULL,
    `school_id`     INT UNSIGNED NOT NULL,
    `title`         VARCHAR(300) NOT NULL,
    `description`   TEXT,
    `type`          ENUM('curriculum','summary','reference','book','presentation','video','other') NOT NULL,
    `file_path`     VARCHAR(500) DEFAULT NULL,
    `file_size`     INT UNSIGNED DEFAULT NULL,
    `mime_type`     VARCHAR(100) DEFAULT NULL,
    `target_role`   ENUM('student','teacher','both') DEFAULT 'both',
    `uploaded_by`   INT UNSIGNED NOT NULL,
    `is_active`     TINYINT(1) DEFAULT 1,
    `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`)  ON DELETE CASCADE,
    FOREIGN KEY (`school_id`)  REFERENCES `schools`(`id`)   ON DELETE CASCADE,
    INDEX `idx_subject_type` (`subject_id`, `type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 19. exams
-- ============================================================
CREATE TABLE IF NOT EXISTS `exams` (
    `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `subject_id`  INT UNSIGNED NOT NULL,
    `class_id`    INT UNSIGNED NOT NULL,
    `title`       VARCHAR(300) NOT NULL,
    `scope`       ENUM('topic','unit','term','full_book') NOT NULL,
    `scope_ref`   VARCHAR(200) DEFAULT NULL,
    `duration`    SMALLINT UNSIGNED DEFAULT NULL,
    `created_by`  INT UNSIGNED NOT NULL,
    `is_ai`       TINYINT(1) DEFAULT 0,
    `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`class_id`)   REFERENCES `classes`(`id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 20. exam_questions
-- ============================================================
CREATE TABLE IF NOT EXISTS `exam_questions` (
    `id`        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `exam_id`   INT UNSIGNED NOT NULL,
    `question`  TEXT NOT NULL,
    `type`      ENUM('mcq','true_false','short_answer','essay') NOT NULL,
    `options`   JSON DEFAULT NULL,
    `answer`    TEXT NOT NULL,
    `score`     DECIMAL(4,2) DEFAULT 1.00,
    `order_num` SMALLINT UNSIGNED DEFAULT NULL,
    FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 21. exam_attempts
-- ============================================================
CREATE TABLE IF NOT EXISTS `exam_attempts` (
    `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `exam_id`       INT UNSIGNED NOT NULL,
    `student_id`    INT UNSIGNED NOT NULL,
    `started_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `submitted_at`  TIMESTAMP NULL DEFAULT NULL,
    `total_score`   DECIMAL(6,2) DEFAULT NULL,
    `max_score`     DECIMAL(6,2) DEFAULT NULL,
    `percentage`    DECIMAL(5,2) DEFAULT NULL,
    `ai_report`     JSON DEFAULT NULL,
    `status`        ENUM('in_progress','submitted','graded') DEFAULT 'in_progress',
    FOREIGN KEY (`exam_id`)    REFERENCES `exams`(`id`)    ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
    INDEX `idx_student_exam` (`student_id`, `exam_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 22. exam_answers
-- ============================================================
CREATE TABLE IF NOT EXISTS `exam_answers` (
    `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `attempt_id`  INT UNSIGNED NOT NULL,
    `question_id` INT UNSIGNED NOT NULL,
    `answer`      TEXT,
    `is_correct`  TINYINT(1) DEFAULT NULL,
    `score`       DECIMAL(4,2) DEFAULT 0,
    `ai_feedback` TEXT,
    UNIQUE KEY `uq_attempt_question` (`attempt_id`, `question_id`),
    FOREIGN KEY (`attempt_id`)  REFERENCES `exam_attempts`(`id`)  ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `exam_questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 23. notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS `notifications` (
    `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id`     INT UNSIGNED NOT NULL,
    `school_id`   INT UNSIGNED DEFAULT NULL,
    `title`       VARCHAR(200) NOT NULL,
    `body`        TEXT NOT NULL,
    `type`        ENUM('absence','grade','assignment','ai_recommendation','system','announcement') NOT NULL,
    `source`      ENUM('school','teacher','ai','system') NOT NULL,
    `ref_type`    VARCHAR(50) DEFAULT NULL,
    `ref_id`      INT UNSIGNED DEFAULT NULL,
    `is_read`     TINYINT(1) DEFAULT 0,
    `sent_via`    SET('in_app','fcm','sms') DEFAULT 'in_app',
    `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_user_read` (`user_id`, `is_read`),
    INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 24. ai_analysis
-- ============================================================
CREATE TABLE IF NOT EXISTS `ai_analysis` (
    `id`                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `student_id`        INT UNSIGNED NOT NULL,
    `academic_year_id`  INT UNSIGNED NOT NULL,
    `term`              TINYINT DEFAULT 1,
    `overall_score`     DECIMAL(5,2) DEFAULT NULL,
    `attendance_rate`   DECIMAL(5,2) DEFAULT NULL,
    `strong_subjects`   JSON DEFAULT NULL,
    `weak_subjects`     JSON DEFAULT NULL,
    `recommendations`   JSON DEFAULT NULL,
    `risk_level`        ENUM('low','medium','high') DEFAULT 'low',
    `generated_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `next_analysis`     TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (`student_id`)       REFERENCES `students`(`id`)       ON DELETE CASCADE,
    FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE CASCADE,
    INDEX `idx_student_year` (`student_id`, `academic_year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 25. refresh_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
    `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id`     INT UNSIGNED NOT NULL,
    `token`       VARCHAR(512) NOT NULL UNIQUE,
    `expires_at`  TIMESTAMP NOT NULL,
    `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_token` (`token`),
    INDEX `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 26. audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id`          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id`     INT UNSIGNED DEFAULT NULL,
    `school_id`   INT UNSIGNED DEFAULT NULL,
    `action`      VARCHAR(100) NOT NULL,
    `table_name`  VARCHAR(100) DEFAULT NULL,
    `record_id`   INT UNSIGNED DEFAULT NULL,
    `old_values`  JSON DEFAULT NULL,
    `new_values`  JSON DEFAULT NULL,
    `ip_address`  VARCHAR(45) DEFAULT NULL,
    `user_agent`  VARCHAR(300) DEFAULT NULL,
    `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user_action` (`user_id`, `action`),
    INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Seed: Super Admin Account
-- Password: Admin@123 (bcrypt hashed)
-- ============================================================
INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `is_active`)
VALUES (
    'Super Admin',
    'admin@smartschool.com',
    '$2y$10$9r5qeJaTbZDRlr69JggWz.Cu0hCmTij4jsWENBkKKGmztO0ucrDTC',
    'super_admin',
    1
) ON DUPLICATE KEY UPDATE `name` = `name`;
