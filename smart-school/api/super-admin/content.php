<?php
// api/super-admin/content.php

use Core\Validator;
use Core\Response;
use Services\ContentService;

/** @var \Core\Request $req */

$method = $req->method();
$contentService = new ContentService();

switch ($method) {
    case 'GET':
        $id = $req->param('id');
        if ($id) {
            $content = $contentService->getById((int)$id);
            Response::success($content);
        } else {
            $subjectId = (int)$req->query('subject_id');
            if (!$subjectId) Response::error('معرف المادة (subject_id) مطلوب', 400);

            $page = $req->page();
            $perPage = $req->perPage();
            $type = $req->query('type');
            $term = $req->query('term') !== null ? (int)$req->query('term') : null;
            
            $result = $contentService->getAll($subjectId, $page, $perPage, $type, $term);
            Response::paginated($result);
        }
        break;

    case 'POST':
        $v = Validator::make($req->all(), [
            'subject_id'  => 'required|integer',
            'title'       => 'required|string|max:300',
            'description' => 'string',
            'type'        => 'required|in:curriculum,summary,reference,book,presentation,video,other',
            'term'        => 'integer|in:1,2',
            'target_role' => 'in:student,teacher,both',
            'is_active'   => 'boolean'
        ]);
        $v->failAndRespond();
        
        $file = $req->file('file');
        if (!$file) {
             Response::validationError(['file' => ['الملف التعليمي مطلوب']]);
        }

        $content = $contentService->create($v->validated(), $file, $req);
        Response::created($content, 'تم رفع المحتوى التعليمي بنجاح');
        break;

    case 'DELETE':
        $id = (int)$req->param('id');
        if (!$id) Response::error('معرف المحتوى مطلوب', 400);

        $contentService->delete($id);
        Response::success(null, 'تم حذف المحتوى التعليمي وملحقاته بنجاح');
        break;

    default:
        Response::error('Method Not Allowed', 405);
}
