<?php
// api/super-admin/schools.php

use Core\Validator;
use Core\Response;
use Services\SchoolService;

/** @var \Core\Request $req */

$method = $req->method();
$schoolService = new SchoolService();

switch ($method) {
    case 'GET':
        $id = $req->param('id');
        if ($id) {
            // Get single school (Note: index.php route for GET /schools doesn't capture {id} yet, 
            // but we can support query param ?id= or add a specific route in index.php)
        } else {
            // Paginated list
            $page = $req->page();
            $perPage = $req->perPage();
            $result = $schoolService->getAll($page, $perPage);
            Response::paginated($result);
        }
        break;

    case 'POST':
        $v = Validator::make($req->all(), [
            'name'         => 'required|string|min:3|max:200',
            'name_en'      => 'string|max:200',
            'email'        => 'email|max:150',
            'phone'        => 'string|max:30',
            'city'         => 'string|max:100',
            'founded_year' => 'integer|min:1900|max:2100',
            'status'       => 'in:active,inactive,suspended',
            'min_grade_id' => 'integer',
            'max_grade_id' => 'integer'
        ]);
        $v->failAndRespond();
        
        $data = $v->validated();
        $school = $schoolService->create($data);
        Response::created($school, 'تم إضافة المدرسة بنجاح');
        break;

    case 'PUT':
        $id = (int)$req->param('id');
        if (!$id) Response::error('معرف المدرسة مطلوب', 400);

        $v = Validator::make($req->all(), [
            'name'         => 'string|min:3|max:200',
            'name_en'      => 'string|max:200',
            'email'        => 'email|max:150',
            'phone'        => 'string|max:30',
            'city'         => 'string|max:100',
            'founded_year' => 'integer|min:1900|max:2100',
            'status'       => 'in:active,inactive,suspended',
            'min_grade_id' => 'integer',
            'max_grade_id' => 'integer'
        ]);
        $v->failAndRespond();

        $data = $v->validated();
        $school = $schoolService->update($id, $data);
        Response::success($school, 'تم تحديث بيانات المدرسة بنجاح');
        break;

    case 'DELETE':
        $id = (int)$req->param('id');
        if (!$id) Response::error('معرف المدرسة مطلوب', 400);

        $schoolService->delete($id);
        Response::success(null, 'تم حذف المدرسة بنجاح');
        break;

    default:
        Response::error('Method Not Allowed', 405);
}
