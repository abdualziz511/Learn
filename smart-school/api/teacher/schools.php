<?php
// api/teacher/schools.php

use Core\Response;
use Core\Auth;
use Services\TeacherDashboardService;

/** @var \Core\Request $req */

$method = $req->method();
$service = new TeacherDashboardService();
$currentUser = Auth::user($req);
$path = $req->path();

// Endpoint paths we expect based on routing:
// GET /api/teacher/schools
// GET /api/teacher/schools/{school_id}/classes
// GET /api/teacher/schools/{school_id}/classes/{class_id}/subjects
// GET /api/teacher/schools/{school_id}/classes/{class_id}/students

switch ($method) {
    case 'GET':
        $schoolId = (int)$req->param('school_id') ?: (int)$req->query('school_id');
        $classId = (int)$req->param('class_id') ?: (int)$req->query('class_id');
        $subjectId = (int)$req->query('subject_id');

        if (str_ends_with($path, '/students') || $path === '/api/teacher/students') {
            if (!$classId) Response::error('المدرسة والصف مطلوبان', 400);
            Response::success($service->getStudents($currentUser['id'], $schoolId ?: 1, $classId, $subjectId ?: null));
        } 
        elseif (str_ends_with($path, '/subjects')) {
            if (!$schoolId || !$classId) Response::error('المدرسة والصف مطلوبان', 400);
            Response::success($service->getSubjects($currentUser['id'], $schoolId, $classId));
        }
        elseif (str_ends_with($path, '/classes')) {
            if (!$schoolId) Response::error('المدرسة مطلوبة', 400);
            Response::success($service->getClasses($currentUser['id'], $schoolId));
        } 
        else {
            // Just /schools
            Response::success($service->getSchools($currentUser['id']));
        }
        break;

    default:
        Response::error('Method Not Allowed', 405);
}
