<?php
require_once __DIR__ . '/core/Database.php';
$db = \Core\Database::getInstance();
$tables = ['users', 'students', 'classes', 'assignments'];
foreach ($tables as $t) {
    try {
        $count = $db->fetchOne("SELECT COUNT(*) as cnt FROM $t");
        echo "$t count: " . $count['cnt'] . "\n";
    } catch (Exception $e) {
        echo "Error in $t: " . $e->getMessage() . "\n";
    }
}
