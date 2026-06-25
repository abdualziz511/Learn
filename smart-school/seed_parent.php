<?php
require_once __DIR__ . '/core/Database.php';
use Core\Database;

$db = Database::getInstance();

$password_hash = password_hash('password', PASSWORD_BCRYPT);

try {
    // 1. Insert User
    $sqlUser = "INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `is_active`) 
                VALUES (?, ?, ?, 'parent', 1) 
                ON DUPLICATE KEY UPDATE `id`=LAST_INSERT_ID(`id`)";
    $db->query($sqlUser, ['ولي الأمر محمد', 'parent@test.com', $password_hash]);
    $userId = $db->query("SELECT LAST_INSERT_ID()")->fetchColumn();

    // 2. Insert Parent
    $sqlParent = "INSERT INTO `parents` (`user_id`, `phone`) VALUES (?, ?) 
                  ON DUPLICATE KEY UPDATE `user_id`=VALUES(`user_id`)";
    $db->query($sqlParent, [$userId, '777000000']);

    // 3. Update Student 4 to link with this phone if not already
    $db->query("UPDATE `students` SET `parent_phone` = '777000000' WHERE `user_id` = 4");

    echo "Parent account created: parent@test.com / password\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
