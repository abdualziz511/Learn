<?php
// api/school-admin/subjects.php

use Core\Response;
use Core\Auth;
use Services\SubjectService;

/** @var \Core\Request $req */

$method = $req->method();
$currentUser = Auth::user($req);

// Find school ID
$schoolId = (int)$req->query('school_id');
if (!$schoolId) $schoolId = $currentUser['school_ids'][0] ?? 1;

try {
    $service = new SubjectService();

    if ($method === 'GET') {
        $gradeId = $req->query('grade_level_id') ? (int)$req->query('grade_level_id') : null;
        $term = $req->query('term') !== null ? (int)$req->query('term') : null;

        // In school-admin context, we show both central subjects (1) and school-specific ones
        // But for consistency with the user's request, we just use SubjectService which filters by school_id
        // If school_id is provided as query, we use it. School admins usually see their own + central.
        
        // Flexible fetch for subjects: show subjects linked to the grade
        $params = [];
        $sql = "SELECT s.* FROM subjects s WHERE 1=1";
        
        if ($gradeId) {
            $sql .= " AND s.grade_level_id = ?";
            $params[] = $gradeId;
        }

        $sql .= " ORDER BY s.id ASC";
        
        $db = \Core\Database::getInstance();
        Response::success($db->fetchAll($sql, $params));
    } else {
        Response::error('Method Not Allowed', 405);
    }
} catch (\Throwable $e) {
    Response::serverError($e->getMessage());
}
