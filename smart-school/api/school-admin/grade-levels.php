<?php
// api/school-admin/grade-levels.php

declare(strict_types=1);

use Core\Response;
use Core\Auth;
use Core\Database;

/** @var \Core\Request $req */

try {
    $db = Database::getInstance();
    $currentUser = Auth::user($req);

    $schoolId = (int)$req->query('school_id');
    if (!$schoolId) {
        if (!$currentUser || empty($currentUser['school_ids'])) {
            Response::forbidden('ليس لديك صلاحية على أي مدرسة');
        }
        $schoolId = (int)$currentUser['school_ids'][0];
    }

    // 1. Get the school's grade range from the schools table
    $school = $db->fetchOne("SELECT min_grade_id, max_grade_id FROM schools WHERE id = ?", [$schoolId]);

    if (!$school || empty($school['min_grade_id']) || empty($school['max_grade_id'])) {
        Response::success([], 'No grade range defined for this school');
        exit;
    }

    // 2. Get order_num for the bounds from the grade_levels table
    $minGrade = $db->fetchOne("SELECT order_num FROM grade_levels WHERE id = ?", [$school['min_grade_id']]);
    $maxGrade = $db->fetchOne("SELECT order_num FROM grade_levels WHERE id = ?", [$school['max_grade_id']]);

    if (!$minGrade || !$maxGrade) {
        Response::success([], 'Grade boundaries not found in system');
        exit;
    }

    // 3. Fetch all grades within the range based on order_num
    $sql = "SELECT * FROM grade_levels 
            WHERE order_num BETWEEN ? AND ? 
            ORDER BY order_num ASC";

    $results = $db->fetchAll($sql, [(int)$minGrade['order_num'], (int)$maxGrade['order_num']]);

    Response::success($results);
} catch (\Throwable $e) {
    Response::serverError($e->getMessage());
}
