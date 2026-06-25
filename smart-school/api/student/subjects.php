<?php
// api/student/subjects.php

use Core\Response;
use Core\Auth;
use Services\StudentService;

/** @var \Core\Request $req */

$method = $req->method();
$service = new StudentService();
$currentUser = Auth::user($req);

try {
    if ($method === 'GET') {
        $subjectId = (int)$req->param('id');
        $path = $req->path();

        if ($subjectId) {
            if (str_ends_with($path, '/content')) {
                $term = (int)$req->query('term');
                Response::success($service->getSubjectContent($currentUser['id'], $subjectId, $term));
            } elseif (str_ends_with($path, '/assignments')) {
                Response::success($service->getSubjectAssignments($currentUser['id'], $subjectId));
            } else {
                Response::error('Action not supported', 400);
            }
        } else {
            // List all subjects
            Response::success($service->getSubjects($currentUser['id']));
        }
    } else {
        Response::error('Method Not Allowed', 405);
    }
} catch (Throwable $e) {
    Response::error($e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine(), 500);
}
