<?php
// api/super-admin/subjects.php

use Core\Validator;
use Core\Response;
use Services\SubjectService;

/** @var \Core\Request $req */

$method = $req->method();
$subjectService = new SubjectService();

switch ($method) {
    case 'GET':
        $id = $req->param('id');
        if ($id) {
            $subject = $subjectService->getById((int)$id);
            Response::success($subject);
        } else {
            $schoolId = (int)$req->query('school_id') ?: 1; // Default to central
            $gradeId = $req->query('grade_id') ? (int)$req->query('grade_id') : null;
            $term = $req->query('term') !== null ? (int)$req->query('term') : null;

            $page = $req->page();
            $perPage = $req->perPage();
            
            $result = $subjectService->getAll($schoolId, $page, $perPage, $gradeId, $term);
            Response::paginated($result);
        }
        break;

    case 'POST':
        $v = Validator::make($req->all(), [
            'school_id'      => 'integer',
            'grade_level_id' => 'integer',
            'term'           => 'integer',
            'name'           => 'required|string|max:150',
            'name_en'        => 'string|max:150',
            'code'           => 'string|max:20'
        ]);
        $v->failAndRespond();
        
        $data = $v->validated();
        if (!isset($data['school_id'])) $data['school_id'] = 1;

        $subject = $subjectService->create($data);
        Response::created($subject, 'تم إضافة المادة بنجاح');
        break;

    case 'PUT':
        $id = (int)$req->param('id');
        if (!$id) Response::error('معرف المادة مطلوب', 400);

        $v = Validator::make($req->all(), [
            'name'           => 'string|max:150',
            'grade_level_id' => 'integer',
            'term'           => 'integer',
            'name_en'        => 'string|max:150',
            'code'           => 'string|max:20'
        ]);
        $v->failAndRespond();

        $subject = $subjectService->update($id, $v->validated());
        Response::success($subject, 'تم تحديث بيانات المادة بنجاح');
        break;

    case 'DELETE':
        $id = (int)$req->param('id');
        if (!$id) Response::error('معرف المادة مطلوب', 400);

        $subjectService->delete($id);
        Response::success(null, 'تم حذف المادة بنجاح');
        break;

    default:
        Response::error('Method Not Allowed', 405);
}
