<?php
// cron/cron_ai_analysis.php

declare(strict_types=1);

// Disable execution limit
set_time_limit(0);

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Basic autoloading for core classes from parent directory
spl_autoload_register(function ($class) {
    $class = str_replace('\\', '/', $class);
    $file = __DIR__ . '/../' . lcfirst($class) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

use Services\AIService;

echo "[" . date('Y-m-d H:i:s') . "] البدء في تشغيل التحليل الدوري للذكاء الاصطناعي للطلاب...\n";

try {
    $aiService = new AIService();
    $result = $aiService->runBatchAnalysis();
    
    echo "[" . date('Y-m-d H:i:s') . "] تم الانتهاء بنجاح.\n";
    echo "عدد الطلاب المعالجين: " . $result['processed'] . "\n";
    echo "عدد المحاولات الفاشلة: " . $result['failed'] . "\n";
} catch (\Throwable $e) {
    echo "[" . date('Y-m-d H:i:s') . "] خطأ فادح أثناء التشغيل: " . $e->getMessage() . "\n";
    exit(1);
}
