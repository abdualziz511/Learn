<?php
// api/super-admin/system.php

use Core\Response;
use Services\SystemService;

/** @var \Core\Request $req */

$method = $req->method();
$systemService = new SystemService();
$path = $req->path();

if (str_contains($path, '/settings')) {
    if ($method === 'GET') {
        $category = $req->query('category');
        Response::success($systemService->getSettings($category));
    } elseif ($method === 'POST') {
        $systemService->updateSettings($req->all());
        \Services\AuditService::getInstance()->log('UPDATE_SYSTEM_SETTINGS', 'system_settings');
        Response::success(null, 'تم تحديث الإعدادات بنجاح');
    } else {
        Response::error('Method Not Allowed', 405);
    }
} elseif (str_contains($path, '/logs')) {
    if ($method === 'GET') {
        $page = $req->page();
        $perPage = $req->perPage();
        Response::paginated($systemService->getLogs($page, $perPage));
    } else {
        Response::error('Method Not Allowed', 405);
    }
} elseif (str_contains($path, '/backups')) {
    if ($method === 'GET') {
        $filename = $req->query('filename');
        if ($filename && $req->query('download') === '1') {
            // Download logic
            $path = __DIR__ . '/../../storage/backups/' . $filename;
            if (file_exists($path)) {
                header('Content-Description: File Transfer');
                header('Content-Type: application/octet-stream');
                header('Content-Disposition: attachment; filename="' . basename($path) . '"');
                header('Expires: 0');
                header('Cache-Control: must-revalidate');
                header('Pragma: public');
                header('Content-Length: ' . filesize($path));
                readfile($path);
                exit;
            } else {
                Response::error('الملف غير موجود', 404);
            }
        }
        Response::success($systemService->getBackups());
    } elseif ($method === 'POST') {
        $backup = $systemService->createBackup();
        Response::created($backup, 'تم إنشاء النسخة الاحتياطية بنجاح');
    } elseif ($method === 'PUT') {
        $filename = $req->query('filename');
        if (!$filename) Response::error('اسم الملف مطلوب', 400);
        $systemService->restoreBackup($filename);
        Response::success(null, 'تم استعادة قاعدة البيانات بنجاح');
    } elseif ($method === 'DELETE') {
        $filename = $req->query('filename');
        if (!$filename) Response::error('اسم الملف مطلوب', 400);
        $systemService->deleteBackup($filename);
        Response::success(null, 'تم حذف النسخة الاحتياطية بنجاح');
    } else {
        Response::error('Method Not Allowed', 405);
    }
} else {
    Response::error('Invalid Endpoint', 404);
}
