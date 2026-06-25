<?php
// api/school-admin/content.php

use Core\Response;
use Core\Auth;
use Services\ContentService;

/** @var \Core\Request $req */

$method = $req->method();
$currentUser = Auth::user($req);

try {
    $service = new ContentService();

    if ($method === 'GET') {
        $subjectId = (int)$req->query('subject_id');
        if (!$subjectId) Response::error('معرف المادة مطلوب', 400);

        // Fetch resources for this subject
        $page = $req->page();
        $perPage = $req->perPage();
        $term = $req->query('term') !== null ? (int)$req->query('term') : null;
        
        $result = $service->getAll($subjectId, $page, $perPage, null, $term);
        Response::paginated($result);
    } else {
        Response::error('Method Not Allowed', 405, ['Only GET allowed']);
    }
} catch (\Throwable $e) {
    Response::serverError($e->getMessage());
}
