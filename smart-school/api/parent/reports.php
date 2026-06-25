<?php
// api/parent/reports.php

use Core\Response;
use Core\Database;

/** @var \Core\Request $req */

$method = $req->method();
$db = Database::getInstance();

if ($method === 'GET') {
    // Return some mock reports for now
    Response::success([
        [
            'id' => 1,
            'title' => 'تقرير الشهر الأول - مادة الرياضيات',
            'date' => '2026-06-01',
            'status' => 'تحسن ملحوظ',
            'child_name' => 'أحمد محمد'
        ],
        [
            'id' => 2,
            'title' => 'تقرير الغياب الأسبوعي',
            'date' => '2026-06-15',
            'status' => 'تنبيه',
            'child_name' => 'خالد محمد'
        ]
    ]);
} else {
    Response::error('Method Not Allowed', 405);
}
