<?php
// api/parent/children.php

use Core\Response;
use Core\Auth;
use Services\ParentService;
use Services\StudentService;

/** @var \Core\Request $req */

$method = $req->method();
$parentService = new ParentService();
$studentService = new StudentService();
$currentUser = Auth::user($req);

if ($method === 'GET') {
    $studentId = (int)$req->param('id');
    $path = $req->path();

    if ($studentId) {
        // Parent wants to see child details
        $parentService->verifyChild($currentUser['id'], $studentId);

        // Find child's user_id to use StudentService
        $db = \Core\Database::getInstance();
        $child = $db->fetchOne("SELECT user_id FROM students WHERE id = ?", [$studentId]);
        
        if (str_ends_with($path, '/dashboard')) {
            Response::success($studentService->getDashboard((int)$child['user_id']));
        } elseif (str_ends_with($path, '/summary')) {
            Response::success($parentService->getChildSummary($studentId));
        } elseif (str_ends_with($path, '/subjects')) {
            Response::success($parentService->getChildSubjects($studentId));
        } elseif (str_contains($path, '/subjects/') && str_ends_with($path, '/assignments')) {
            $parts = explode('/', $path);
            $subjectId = (int)$parts[count($parts)-2];
            Response::success($parentService->getChildAssignments($studentId, $subjectId));
        } elseif (str_ends_with($path, '/grades')) {
            Response::success($studentService->getGrades((int)$child['user_id']));
        } elseif (str_ends_with($path, '/attendance')) {
            Response::success($studentService->getAttendance((int)$child['user_id']));
        } else {
            Response::error('Action not supported', 400);
        }
    } else {
        // List all children
        Response::success($parentService->getChildren($currentUser['id']));
    }
} elseif ($method === 'POST') {
    $path = $req->path();
    if (str_ends_with($path, '/sign-assignment')) {
        $data = json_decode(file_get_contents('php://input'), true);
        $studentId = (int)($data['student_id'] ?? 0);
        $date = $data['date'] ?? '';
        $subjectId = (int)($data['subject_id'] ?? 0);

        if (!$studentId || !$date || !$subjectId) {
            Response::error('Missing required fields', 400);
        }

        $success = $parentService->signAssignment($currentUser['id'], $studentId, $date, $subjectId);
        if ($success) {
            Response::success(['message' => 'Signed successfully']);
        } else {
            Response::error('Failed to sign', 500);
        }
    } else {
        Response::error('Action not supported', 400);
    }
} else {
    Response::error('Method Not Allowed', 405);
}
