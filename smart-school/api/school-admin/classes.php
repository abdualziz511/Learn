<?php
// api/school-admin/classes.php

declare(strict_types=1);

use Core\Response;
use Core\Auth;
use Core\Database;
use Core\Validator;

/** @var \Core\Request $req */

try {
    $db = Database::getInstance();
    $currentUser = Auth::user($req);
    $method = $req->method();

    // Securely find school ID
    $schoolId = (int)$req->query('school_id');
    if (!$schoolId) {
        if (!$currentUser || empty($currentUser['school_ids'])) {
            Response::forbidden('ليس لديك صلاحية على مدرسة محددة');
        }
        $schoolId = (int)$currentUser['school_ids'][0];
    }

    if ($method === 'GET') {
        $gradeLevelId = $req->query('grade_level_id') ? (int)$req->query('grade_level_id') : null;
        
        $params = [$schoolId];
        $where = "c.school_id = ?";
        if ($gradeLevelId) {
            $where .= " AND c.grade_level_id = ?";
            $params[] = $gradeLevelId;
        }

        $sql = "SELECT c.*, gl.name as grade_level_name,
                (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id) as student_count
                FROM classes c
                LEFT JOIN grade_levels gl ON c.grade_level_id = gl.id
                WHERE {$where}
                ORDER BY gl.order_num ASC, c.name ASC";
        
        $data = $db->fetchAll($sql, $params);
        Response::success($data);
    } 
    
    if ($method === 'POST') {
        $v = Validator::make($req->all(), [
            'name'           => 'required|string',
            'capacity'       => 'required|integer',
            'grade_level_id' => 'required|integer'
        ]);
        $v->failAndRespond();
        $data = $v->validated();

        $ay = $db->fetchOne("SELECT id FROM academic_years WHERE school_id = ? AND is_current = 1 LIMIT 1", [$schoolId]);
        
        $id = $db->insert('classes', [
            'school_id'        => $schoolId,
            'grade_level_id'   => $data['grade_level_id'],
            'academic_year_id' => $ay['id'] ?? 1,
            'name'             => $data['name'],
            'capacity'         => $data['capacity']
        ]);

        Response::created(['id' => $id]);
    }

    if ($method === 'PUT') {
        $id = (int)$req->param('id');
        $v = Validator::make($req->all(), [
            'name'     => 'string',
            'capacity' => 'integer'
        ]);
        $v->failAndRespond();
        $db->update('classes', $v->validated(), ['id' => $id, 'school_id' => $schoolId]);
        Response::success(null, 'تم التحديث بنجاح');
    }

    if ($method === 'DELETE') {
        $id = (int)$req->param('id');
        $count = $db->count("SELECT COUNT(*) FROM students WHERE class_id = ?", [$id]);
        if ($count > 0) Response::error('لا يمكن حذف الشعبة لوجود طلاب مسجلين فيها', 400);

        $db->delete('classes', ['id' => $id, 'school_id' => $schoolId]);
        Response::success(null, 'تم الحذف بنجاح');
    }
} catch (\Throwable $e) {
    Response::serverError($e->getMessage() . " in " . basename($e->getFile()) . ":" . $e->getLine());
}
