<?php
require_once __DIR__ . '/core/Database.php';
use Core\Database;

$db = Database::getInstance();
$dbname = 'smart_school';

try {
    // Fix database charset
    $db->query("ALTER DATABASE `{$dbname}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    
    // Get all tables
    $tables = $db->fetchAll("SHOW TABLES");
    foreach ($tables as $row) {
        $table = array_values($row)[0];
        echo "Updating table: {$table}\n";
        $db->query("ALTER TABLE `{$table}` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    }
    echo "Successfully updated all tables to utf8mb4\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
