<?php
// api/teacher/assignments.php

declare(strict_types=1);

use Core\Auth;
use Core\Request;
use Core\Response;
use Services\TeacherAttendanceService;

/** @var \Core\Request $req */
$currentUser = Auth::user($req);

if (!$currentUser || $currentUser['role'] !== 'teacher') {
    Response::forbidden('غير مصرح لك بالوصول');
}

$service = new TeacherAttendanceService();

try {
    if ($req->method() === 'POST' && str_ends_with($req->path(), '/add')) {
        $data = $req->body();
        $res = $service->addAssignment($currentUser['id'], $data);
        Response::success($res, 'تم إضافة التكليف بنجاح');
    } else {
        Response::error('طلب غير مدعوم', 400);
    }
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}
