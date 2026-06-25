<?php
// api/school-admin/teachers.php

use Core\Validator;
use Core\Response;
use Core\Auth;
use Services\SchoolTeacherService;

/** @var \Core\Request $req */

$method = $req->method();
$service = new SchoolTeacherService();
$currentUser = Auth::user($req);

$schoolId = (int)$req->query('school_id');
if (!$schoolId) {
    if (empty($currentUser['school_ids'])) Response::forbidden('ليس لديك صلاحية على أي مدرسة');
    $schoolId = $currentUser['school_ids'][0];
} else {
    Auth::requireSchool($currentUser, $schoolId);
}

try {
    $path = $req->path();
    switch ($method) {
        case 'GET':
            if (str_ends_with($path, '/assignments')) {
                $assignments = $service->getAllAssignments($schoolId);
                Response::success($assignments);
            }
            
            $id = $req->param('id');
            if ($id) {
                $teacher = $service->getById($schoolId, (int)$id);
                Response::success($teacher);
            } else {
                $page = $req->page();
                $perPage = $req->perPage();
                
                $result = $service->getAll($schoolId, $page, $perPage);
                Response::paginated($result);
            }
            break;

        case 'POST':
            // If the path contains 'assign', it's an assignment request
            if (str_ends_with($req->path(), '/assign')) {
                $id = (int)$req->param('id');
                if (!$id) Response::error('معرف المعلم مطلوب', 400);

                $v = Validator::make($req->all(), [
                    'class_id'   => 'required|integer',
                    'subject_id' => 'required|integer'
                ]);
                $v->failAndRespond();
                
                $data = $v->validated();
                $service->createOrAssign($schoolId, [
                    'email' => $service->getById($schoolId, $id)['email'], 
                    'class_id' => $data['class_id'],
                    'subject_id' => $data['subject_id']
                ]);
                Response::success(null, 'تم تعيين المعلم بنجاح');
                break;
            }

            // Otherwise it's a create/assign request
            $v = Validator::make($req->all(), [
                'name'           => 'required|string|min:3|max:150',
                'email'          => 'email|max:150',
                'phone'          => 'string|max:30',
                'password'       => 'string|min:6',
                'specialization' => 'string',
                'qualification'  => 'string',
                'hire_date'      => 'date',
                'assignments'    => 'array'
            ]);
            $v->failAndRespond();
            
            $teacher = $service->createOrAssign($schoolId, $v->validated());
            Response::created($teacher, 'تم إضافة المعلم بنجاح');
            break;

        case 'PUT':
            $id = (int)$req->param('id');
            if (!$id) Response::error('معرف المعلم مطلوب', 400);

            $v = Validator::make($req->all(), [
                'name'           => 'required|string|min:3|max:150',
                'email'          => 'email|max:150',
                'phone'          => 'string|max:30',
                'specialization' => 'string',
                'qualification'  => 'string',
                'hire_date'      => 'date',
                'assignments'    => 'array'
            ]);
            $v->failAndRespond();
            
            $teacher = $service->update($schoolId, $id, $v->validated());
            Response::success($teacher, 'تم تحديث بيانات المعلم بنجاح');
            break;

        case 'DELETE':
            $id = (int)$req->param('id');
            $assignmentId = (int)$req->query('assignment_id');
            $deleteAll = $req->query('action') === 'all';

            if (!$id) Response::error('معرف المعلم مطلوب', 400);

            if ($deleteAll) {
                $service->deleteFromSchool($schoolId, $id);
                Response::success(null, 'تم إزالة المعلم من المدرسة بنجاح');
            } else {
                if (!$assignmentId) Response::error('معرف التعيين مطلوب', 400);
                $service->removeAssignment($schoolId, $id, $assignmentId);
                Response::success(null, 'تم إلغاء التعيين بنجاح');
            }
            break;

        default:
            Response::error('Method Not Allowed', 405);
    }
} catch (\Throwable $e) {
    echo $e; // Temporary for debug
    Response::serverError($e->getMessage());
}
