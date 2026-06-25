<?php
// api/school-admin/grades.php

declare(strict_types=1);

use Core\Response;
use Core\Auth;
use Services\SchoolGradeService;

/** @var \Core\Request $req */

try {
    $service = new SchoolGradeService();
    $currentUser = Auth::user($req);
    $method = $req->method();

    // Securely find school ID
    $schoolId = (int)$req->query('school_id');
    if (!$schoolId) {
        if (!$currentUser || empty($currentUser['school_ids'])) {
            Response::forbidden('School context missing');
        }
        $schoolId = (int)$currentUser['school_ids'][0];
    }

    if ($method === 'GET') {
        $status = $req->query('status') ?? 'pending';
        if ($status === 'pending') {
            $data = $service->getPendingGrades($schoolId);
            Response::success($data);
        } else {
            Response::error('Only pending status is supported for this view', 400);
        }
    }

    if ($method === 'PATCH') {
        $path = $_SERVER['REQUEST_URI'];
        
        if (strpos($path, '/approve-all') !== false) {
            $count = $service->approveAll($schoolId);
            Response::success(['count' => $count], "تم اعتماد $count درجة بنجاح");
        } else {
            // Assume single ID at the end of path if not /approve-all
            // Handle specific ID if needed (e.g., /grades/{id}/approve)
            Response::error('Action not supported', 400);
        }
    }

} catch (\Throwable $e) {
    Response::serverError($e->getMessage());
}
