<?php
// config/ai.php

$defaultConfig = [
    // Python AI Microservice
    'service_url'   => getenv('AI_SERVICE_URL') ?: 'http://localhost:8000',
    'secret_key'    => getenv('AI_SECRET_KEY')  ?: 'internal-ai-secret',
    'timeout'       => 30,  // seconds

    // Analysis Schedule
    'analysis' => [
        'auto_trigger_on_grade_approve'    => true,
        'auto_trigger_on_attendance'       => true,
        'weekly_batch_enabled'             => true,
    ],

    // Exam Generation
    'exam' => [
        'default_question_count'  => 20,
        'default_duration_minutes'=> 45,
    ],
];

$settingsFile = __DIR__ . '/../storage/ai_settings.json';
if (file_exists($settingsFile)) {
    $saved = json_decode(file_get_contents($settingsFile), true);
    if (is_array($saved)) {
        $defaultConfig = array_replace_recursive($defaultConfig, $saved);
    }
}

return $defaultConfig;
