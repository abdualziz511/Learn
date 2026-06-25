<?php
// api/teacher/meta.php

declare(strict_types=1);

use Core\Response;
use Core\Auth;
use Services\TeacherDashboardService;

/** @var \Core\Request $req */

$userId = Auth::user($req)['id'];
$schoolId = (int)$req->query('school_id');

if (!$schoolId) {
    Response::error('school_id is required');
}

$service = new TeacherDashboardService();

try {
    $meta = $service->getMeta((int)$userId, $schoolId);
    Response::success($meta);
} catch (\Exception $e) {
    Response::error($e->getMessage());
}
