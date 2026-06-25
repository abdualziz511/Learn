<?php
require_once __DIR__ . '/core/Database.php';
use Core\Database;

$db = Database::getInstance();
$teacherId = 3; // Husam
$schoolId = 4;

echo "--- Granting Full Permissions for Teacher ID $teacherId ---\n";

// Get all classes and subjects in this school to assign them to Husam
$classes = $db->fetchAll("SELECT id FROM classes WHERE grade_level_id IN (SELECT id FROM grade_levels WHERE school_id = ?)", [$schoolId]);
$subjects = $db->fetchAll("SELECT id FROM subjects");

foreach ($classes as $c) {
    foreach ($subjects as $s) {
        $db->query(
            "INSERT IGNORE INTO teacher_assignments (teacher_id, school_id, class_id, subject_id, academic_year_id) 
             VALUES (?, ?, ?, ?, 1)",
            [$teacherId, $schoolId, $c['id'], $s['id']]
        );
    }
}

echo "Done! You now have permissions for all classes and subjects in School $schoolId.\n";
