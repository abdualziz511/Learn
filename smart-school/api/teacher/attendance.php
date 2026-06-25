<?php
// api/teacher/attendance.php

use Core\Validator;
use Core\Response;
use Core\Auth;
use Services\TeacherAttendanceService;

/** @var \Core\Request $req */

$method = $req->method();
$service = new TeacherAttendanceService();
$currentUser = Auth::user($req);

switch ($method) {
    case 'GET':
        $path = $req->path();
        
        if (str_ends_with($path, '/schools')) {
            Response::success($service->getTeacherSchools($currentUser['id']));
        }
        if (str_ends_with($path, '/grades')) {
            $schoolId = (int)$req->query('school_id');
            Response::success($service->getGradesBySchool($currentUser['id'], $schoolId));
        }
        if (str_ends_with($path, '/classes')) {
            $schoolId = (int)$req->query('school_id');
            $gradeId = (int)$req->query('grade_id');
            Response::success($service->getClassesByGrade($currentUser['id'], $schoolId, $gradeId));
        }
        if (str_ends_with($path, '/subjects')) {
            $schoolId = (int)$req->query('school_id');
            $classId = (int)$req->query('class_id');
            Response::success($service->getSubjectsByClass($currentUser['id'], $schoolId, $classId));
        }

        if (str_ends_with($path, '/monthly-stats')) {
            $classId = (int)$req->query('class_id');
            $subjectId = (int)$req->query('subject_id');
            $month = $req->query('month');
            if (!$classId || !$subjectId) Response::error('الصف والمادة مطلوبان', 400);
            Response::success($service->getMonthlyStats($currentUser['id'], $classId, $subjectId, $month));
        }

        $classId = (int)$req->query('class_id');
        $date = $req->query('date') ?: date('Y-m-d');
        if (!$classId) Response::error('الصف مطلوب', 400);

        Response::success($service->getAttendance($currentUser['id'], $classId, $date));
        break;

    case 'POST':
        $v = Validator::make($req->all(), [
            'class_id' => 'required|integer',
            'date'     => 'date',
            'students' => 'required|array'
        ]);
        $v->failAndRespond();

        // Validate each student entry
        $data = $v->validated();
        foreach ($data['students'] as $student) {
            if (!isset($student['student_id']) || !isset($student['status'])) {
                Response::validationError(['students' => ['بيانات الطالب غير مكتملة (student_id, status)']]);
            }
            if (!in_array($student['status'], ['present', 'absent', 'late', 'excused'])) {
                Response::validationError(['students' => ['حالة الحضور غير صالحة']]);
            }
        }

        $service->recordAttendance($currentUser['id'], $data);
        Response::success(null, 'تم حفظ الحضور والغياب بنجاح وبانتظار اعتماد الإدارة');
        break;

    default:
        Response::error('Method Not Allowed', 405);
}
