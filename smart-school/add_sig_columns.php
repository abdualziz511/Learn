<?php
require_once __DIR__ . '/core/Database.php';
use Core\Database;

$db = Database::getInstance();
echo "--- Adding Signature Columns to Attendance Table ---\n";

try {
    $db->query("ALTER TABLE attendance ADD COLUMN teacher_signed BOOLEAN DEFAULT FALSE");
    echo "Column teacher_signed added.\n";
} catch (Exception $e) {
    echo "Column teacher_signed might already exist or error: " . $e->getMessage() . "\n";
}

try {
    $db->query("ALTER TABLE attendance ADD COLUMN parent_signed BOOLEAN DEFAULT FALSE");
    echo "Column parent_signed added.\n";
} catch (Exception $e) {
    echo "Column parent_signed might already exist or error: " . $e->getMessage() . "\n";
}

echo "Done.\n";
