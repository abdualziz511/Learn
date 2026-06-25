<?php
// api/super-admin/classes.php

use Core\Validator;
use Core\Response;
use Services\ClassService;

/** @var \Core\Request $req */

$method = $req->method();
$path = $req->path(); // to check if it's grades or classes
$classService = new ClassService();

// We map /super-admin/grades and /super-admin/classes to this file in index.php

if (str_contains($path, '/grades')) {
    // -------------------------------------------------------
    // GRADES API
    // -------------------------------------------------------
    switch ($method) {
        case 'GET':
            $schoolId = (int)$req->query('school_id');
            // If school_id is missing, we take the first available one or return everything
            Response::success($classService->getGrades($schoolId ?: null));
            break;

        case 'POST':
            $v = Validator::make($req->all(), [
                'school_id' => 'required|integer',
                'name'      => 'required|string|max:100',
                'order_num' => 'integer'
            ]);
            $v->failAndRespond();
            Response::created($classService->createGrade($v->validated()), 'تم إضافة المرحلة بنجاح');
            break;

        case 'PUT':
            $id = (int)$req->param('id');
            if (!$id) Response::error('معرف المرحلة مطلوب', 400);
            $v = Validator::make($req->all(), [
                'name'      => 'string|max:100',
                'order_num' => 'integer'
            ]);
            $v->failAndRespond();
            Response::success($classService->updateGrade($id, $v->validated()), 'تم تحديث المرحلة بنجاح');
            break;

        case 'DELETE':
            $id = (int)$req->param('id');
            if (!$id) Response::error('معرف المرحلة مطلوب', 400);
            $classService->deleteGrade($id);
            Response::success(null, 'تم حذف المرحلة بنجاح');
            break;

        default:
            Response::error('Method Not Allowed', 405);
    }
} else {
    // -------------------------------------------------------
    // CLASSES API
    // -------------------------------------------------------
    switch ($method) {
        case 'GET':
            $schoolId = (int)$req->query('school_id');
            if (!$schoolId) Response::error('معرف المدرسة (school_id) مطلوب', 400);
            $gradeId = $req->query('grade_level_id') ? (int)$req->query('grade_level_id') : null;
            Response::success($classService->getClasses($schoolId, $gradeId));
            break;

        case 'POST':
            $v = Validator::make($req->all(), [
                'school_id'        => 'required|integer',
                'grade_level_id'   => 'required|integer',
                'academic_year_id' => 'integer',
                'name'             => 'required|string|max:50',
                'capacity'         => 'integer'
            ]);
            $v->failAndRespond();
            Response::created($classService->createClass($v->validated()), 'تم إضافة الصف بنجاح');
            break;

        case 'PUT':
            $id = (int)$req->param('id');
            if (!$id) Response::error('معرف الصف مطلوب', 400);
            $v = Validator::make($req->all(), [
                'name'     => 'string|max:50',
                'capacity' => 'integer'
            ]);
            $v->failAndRespond();
            Response::success($classService->updateClass($id, $v->validated()), 'تم تحديث الصف بنجاح');
            break;

        case 'DELETE':
            $id = (int)$req->param('id');
            if (!$id) Response::error('معرف الصف مطلوب', 400);
            $classService->deleteClass($id);
            Response::success(null, 'تم حذف الصف بنجاح');
            break;

        default:
            Response::error('Method Not Allowed', 405);
    }
}
