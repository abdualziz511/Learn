<?php
// api/teacher/dashboard.php

declare(strict_types=1);

use Core\Response;
use Core\Auth;
use Services\TeacherDashboardService;

/** @var \Core\Request $req */

// Get current user using the official system method
$user = Auth::user($req);
$userId = (int)$user['id'];

$service = new TeacherDashboardService();

try {
    $stats = $service->getTeacherStats($userId);
    $schedule = $service->getAssignedSchedule($userId);
    
    // AI Recommendations (Static for now but structured)
    $recommendations = [
        [
            'type' => 'brain',
            'title' => 'توصية الذكاء الاصطناعي',
            'body' => 'بناءً على نتائج الاختبارات الأخيرة، يُنصح بتكثيف المراجعة لمادة الرياضيات مع طلاب الصف السابع (أ).'
        ]
    ];
    
    // Notifications/Alerts
    $alerts = [
        ['type' => 'warning', 'body' => 'يرجى رصد غياب الطلاب للحصة الثالثة في مدرسة النجاح.'],
        ['type' => 'info', 'body' => 'تم تحديث الجدول الدراسي للفصل القادم.']
    ];

    // Correcting order: success(data, message)
    Response::success([
        'stats' => $stats,
        'schedule' => $schedule,
        'recommendations' => $recommendations,
        'alerts' => $alerts
    ], 'بيانات لوحة التحكم');

} catch (\Exception $e) {
    Response::error($e->getMessage());
}
