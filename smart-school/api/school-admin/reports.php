<?php
// api/school-admin/reports.php

use Core\Response;
use Core\Auth;
use Services\SchoolReportService;

/** @var \Core\Request $req */

$method = $req->method();
$service = new SchoolReportService();
$currentUser = Auth::user($req);

$schoolId = (int)$req->query('school_id');
if (!$schoolId) {
    if (empty($currentUser['school_ids'])) Response::forbidden('ليس لديك صلاحية على أي مدرسة');
    $schoolId = $currentUser['school_ids'][0];
} else {
    Auth::requireSchool($currentUser, $schoolId);
}

switch ($method) {
    case 'GET':
        $type = $req->path(); // .../overview etc.
        
        if (str_ends_with($type, '/overview')) {
            $data = $service->getOverview($schoolId);
            Response::success($data);
        } elseif (str_ends_with($type, '/ai-insights')) {
            $aiService = new \Services\AIService();
            $data = $aiService->getSchoolInsights($schoolId);
            Response::success($data);
        } else {
            Response::error('Report type not found', 404);
        }
        break;

    default:
        Response::error('Method Not Allowed', 405);
}
