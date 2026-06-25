<?php
// api/school-admin/stats.php

declare(strict_types=1);

use Services\SchoolStatsService;
use Core\Response;
use Core\Auth;

$statsService = new SchoolStatsService();
$user = Auth::getCurrentUser();
$schoolId = (int)($_GET['school_id'] ?? ($user['school_ids'][0] ?? 0));

if (!$schoolId) {
    Response::error('School context missing', 400);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'overview';

try {
    if ($action === 'overview') {
        Response::success($statsService->getOverview($schoolId));
    } elseif ($action === 'grade') {
        $levelId = (int)($_GET['level_id'] ?? 0);
        if (!$levelId) Response::error('Grade level ID missing', 400);
        Response::success($statsService->getGradeStats($schoolId, $levelId));
    } else {
        Response::error('Invalid action', 400);
    }
} catch (\Throwable $e) {
    Response::serverError($e->getMessage());
}
