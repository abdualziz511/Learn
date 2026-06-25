<?php
// api/school-admin/students.php

use Core\Validator;
use Core\Response;
use Core\Auth;
use Services\SchoolStudentService;
use Core\Database;

/** @var \Core\Request $req */

try {
    $db = Database::getInstance();
    $service = new SchoolStudentService();
    $currentUser = Auth::user($req);
    $method = $req->method();

    $schoolId = (int)$req->query('school_id');
    if (!$schoolId) {
        if (empty($currentUser['school_ids'])) Response::forbidden('ليس لديك صلاحية على أي مدرسة');
        $schoolId = $currentUser['school_ids'][0];
    } else {
        Auth::requireSchool($currentUser, $schoolId);
    }

    switch ($method) {
        case 'GET':
            $id = $req->param('id');
            if ($id) {
                $student = $service->getById($schoolId, (int)$id);
                Response::success($student);
            } else {
                $page = $req->page();
                $perPage = $req->perPage();
                $classId = $req->query('class_id') ? (int)$req->query('class_id') : null;
                $gradeLevelId = $req->query('grade_level_id') ? (int)$req->query('grade_level_id') : null;
                
                $result = $service->getAll($schoolId, $page, $perPage, $classId, $gradeLevelId);
                Response::paginated($result);
            }
            break;

        case 'POST':
            // Check if it's a bulk import
            if (strpos($_SERVER['REQUEST_URI'], '/bulk') !== false) {
                $data = $req->all();
                if (!isset($data['students']) || !is_array($data['students'])) {
                    Response::error('بيانات الطلاب مطلوبة كصفوف', 400);
                }
                $result = $service->createBulk($schoolId, $data['students']);
                Response::success($result, "تم استيراد {$result['count']} طالب بنجاح");
                break;
            }

            $v = Validator::make($req->all(), [
                'name'           => 'required|string|min:3|max:150',
                'email'          => 'email|max:150',
                'password'       => 'required|string|min:6',
                'grade_level_id' => 'required|integer',
                'class_id'       => 'integer',
                'student_code'   => 'string|max:30',
                'parent_phone'   => 'required|string|max:30',
                'date_of_birth' => 'date',
                'gender'        => 'in:male,female',
                'address'       => 'string'
            ]);
            $v->failAndRespond();
            
            $student = $service->create($schoolId, $v->validated());
            Response::created($student, 'تم إضافة الطالب بنجاح');
            break;

        case 'PUT':
            $id = (int)$req->param('id');
            if (!$id) Response::error('معرف الطالب مطلوب', 400);

            $v = Validator::make($req->all(), [
                'name'          => 'string|min:3|max:150',
                'email'         => 'email|max:150',
                'password'      => 'string|min:6',
                'class_id'      => 'integer',
                'student_code'  => 'string|max:30',
                'parent_phone'  => 'string|max:30',
                'date_of_birth' => 'date',
                'gender'        => 'in:male,female',
                'address'       => 'string',
                'is_active'     => 'boolean',
                'status'        => 'in:active,suspended,transferred,graduated'
            ]);
            $v->failAndRespond();

            $student = $service->update($schoolId, $id, $v->validated());
            Response::success($student, 'تم تحديث بيانات الطالب بنجاح');
            break;

        case 'DELETE':
            $id = (int)$req->param('id');
            if (!$id) Response::error('معرف الطالب مطلوب', 400);
            
            $db->delete('students', ['id' => $id, 'school_id' => $schoolId]);
            Response::success(null, 'تم حذف الطالب بنجاح');
            break;

        default:
            Response::error('Method Not Allowed', 405);
    }
} catch (\Throwable $e) {
    Response::serverError($e->getMessage());
}
