<?php
// api/super-admin/stats.php

use Core\Response;
use Core\Database;

/** @var \Core\Request $req */

$db = Database::getInstance();

try {
    // 1. General Totals
    $totals = [
        'schools'  => $db->count("SELECT COUNT(*) FROM schools"),
        'teachers' => $db->count("SELECT COUNT(*) FROM users WHERE role = 'teacher'"),
        'students' => $db->count("SELECT COUNT(*) FROM users WHERE role = 'student'"),
        'parents'  => $db->count("SELECT COUNT(*) FROM users WHERE role = 'parent'"),
        'admins'   => $db->count("SELECT COUNT(*) FROM users WHERE role = 'school_admin'"),
    ];

    // 2. Schools by City
    $schoolsByCity = $db->fetchAll("
        SELECT city as label, COUNT(*) as value 
        FROM schools 
        GROUP BY city 
        ORDER BY value DESC
    ");

    // 3. User Registration Growth (Last 6 months)
    $growth = $db->fetchAll("
        SELECT DATE_FORMAT(created_at, '%Y-%m') as label, COUNT(*) as value
        FROM users
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY label
        ORDER BY label ASC
    ");

    // 4. System Status (Mocking some precision data)
    $systemStatus = [
        'server_load' => 24, // percentage
        'memory_usage' => 42, // percentage
        'uptime' => '12d 4h 32m',
        'active_sessions' => 128
    ];

    Response::success([
        'totals' => $totals,
        'schoolsByCity' => $schoolsByCity,
        'growth' => $growth,
        'systemStatus' => $systemStatus
    ]);

} catch (\Exception $e) {
    Response::error($e->getMessage(), 500);
}
