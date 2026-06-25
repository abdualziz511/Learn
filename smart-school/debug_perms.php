<?php
require_once __DIR__ . '/core/Database.php';
use Core\Database;

$db = Database::getInstance();
$userId = 13; 

echo "--- Detailed Debugging Teacher Assignments ---\n";

$teacher = $db->fetchOne("SELECT teachers.id, users.name FROM teachers JOIN users ON teachers.user_id = users.id WHERE users.id = ?", [$userId]);
if (!$teacher) {
    echo "No teacher found for user ID $userId\n";
    exit;
}

echo "Teacher: " . $teacher['name'] . " (ID: " . $teacher['id'] . ")\n";

$assignments = $db->fetchAll(
    "SELECT ta.*, s.name as school_name, c.name as class_name, sub.name as subject_name 
     FROM teacher_assignments ta
     LEFT JOIN schools s ON ta.school_id = s.id
     LEFT JOIN classes c ON ta.class_id = c.id
     LEFT JOIN subjects sub ON ta.subject_id = sub.id
     WHERE ta.teacher_id = ?", 
    [$teacher['id']]
);

echo "Assignments Count: " . count($assignments) . "\n";
foreach ($assignments as $a) {
    echo "School: {$a['school_name']} (ID: {$a['school_id']})\n";
    echo "Class: {$a['class_name']} (ID: {$a['class_id']})\n";
    echo "Subject: {$a['subject_name']} (ID: {$a['subject_id']})\n";
    echo "---------------------------\n";
}
