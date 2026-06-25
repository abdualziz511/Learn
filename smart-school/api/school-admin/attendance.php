<?php
// api/school-admin/attendance.php

declare(strict_types=1);

use Core\Response;
use Core\Auth;
use Services\SchoolAttendanceService;

/** @var \Core\Request $req */

try {
    $service = new SchoolAttendanceService();
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
        $date = $req->query('date') ?? date('Y-m-d');
        $data = $service->getAttendance($schoolId, $date);
        Response::success($data);
    }

    if ($method === 'PATCH') {
        $id = (int)$req->param('id');
        if (strpos($_SERVER['REQUEST_URI'], '/approve') !== false) {
            $service->approveAttendance($schoolId, $id);
            Response::success(null, 'تم اعتماد التحضير بنجاح');
        } else {
            Response::error('Action not supported', 400);
        }
    }

} catch (\Throwable $e) {
    Response::serverError($e->getMessage());
}
