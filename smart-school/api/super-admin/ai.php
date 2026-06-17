<?php
// api/super-admin/ai.php

use Core\Validator;
use Core\Response;
use Services\AIService;

/** @var \Core\Request $req */

$method = $req->method();
$aiService = new AIService();

switch ($method) {
    case 'GET':
        // Fetch current settings
        $configFile = __DIR__ . '/../../config/ai.php';
        $currentSettings = require $configFile;
        
        $settingsFile = __DIR__ . '/../../storage/ai_settings.json';
        if (file_exists($settingsFile)) {
            $saved = json_decode(file_get_contents($settingsFile), true);
            if (is_array($saved)) {
                $currentSettings = array_replace_recursive($currentSettings, $saved);
            }
        }
        
        Response::success($currentSettings);
        break;

    case 'PUT':
        // Validate settings input
        $v = Validator::make($req->all(), [
            'service_url' => 'required|url',
            'secret_key'  => 'required|string',
            'timeout'     => 'integer',
            'analysis'    => 'array',
            'exam'        => 'array'
        ]);
        $v->failAndRespond();

        $settings = $v->validated();
        
        // Save to JSON storage file
        $settingsFile = __DIR__ . '/../../storage/ai_settings.json';
        
        // Ensure storage directory exists
        if (!is_dir(dirname($settingsFile))) {
            mkdir(dirname($settingsFile), 0777, true);
        }
        
        file_put_contents($settingsFile, json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        
        Response::success($settings, 'تم تحديث إعدادات الذكاء الاصطناعي بنجاح');
        break;

    case 'POST':
        $action = $req->param('id'); // e.g., analyze, run-batch
        
        if ($action === 'run-batch') {
            $schoolId = $req->query('school_id') ? (int)$req->query('school_id') : null;
            $res = $aiService->runBatchAnalysis($schoolId);
            Response::success($res, 'تم تشغيل التحليل الجماعي بنجاح');
        } elseif ($action === 'analyze') {
            $studentId = (int)$req->query('student_id');
            if (!$studentId) {
                Response::error('معرف الطالب (student_id) مطلوب للتحليل الفردي', 400);
            }

            // Get current active academic year
            $db = \Core\Database::getInstance();
            $currentYear = $db->fetchOne("SELECT id FROM academic_years WHERE is_current = 1 LIMIT 1");
            if (!$currentYear) {
                Response::error('لا يوجد عام دراسي فعال حالياً في النظام', 400);
            }

            $term = $req->query('term') ? (int)$req->query('term') : 1;
            
            $result = $aiService->analyzeStudent($studentId, (int)$currentYear['id'], $term);
            Response::success($result, 'تم إنهاء تحليل الطالب بنجاح');
        } else {
            Response::error('الإجراء المطلوب غير مدعوم', 404);
        }
        break;

    default:
        Response::error('Method Not Allowed', 405);
}
