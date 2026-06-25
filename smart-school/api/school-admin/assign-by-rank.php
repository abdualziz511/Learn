<?php
// api/school-admin/assign-by-rank.php

declare(strict_types=1);

use Core\Validator;
use Core\Response;
use Core\Auth;
use Services\SchoolStudentService;

/** @var \Core\Request $req */

$method = $req->method();
if ($method !== 'POST') Response::error('Method not allowed', 405);

$service = new SchoolStudentService();
$currentUser = Auth::user($req);

$v = Validator::make($req->all(), [
    'grade_level_id' => 'required|integer',
    'section_id'     => 'required|integer',
    'from'           => 'required|integer|min:1',
    'to'             => 'required|integer|min:1'
]);
$v->failAndRespond();

$schoolId = $currentUser['school_ids'][0] ?? 0;
if (!$schoolId) Response::forbidden();

$service->assignByRank(
    $schoolId, 
    (int)$v->validated()['grade_level_id'], 
    (int)$v->validated()['section_id'], 
    (int)$v->validated()['from'], 
    (int)$v->validated()['to']
);

Response::success(null, 'تم توزيع الطلاب بنجاح');
