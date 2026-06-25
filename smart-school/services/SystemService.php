<?php
// services/SystemService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class SystemService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getLogs(int $page = 1, int $perPage = 50): array
    {
        $sql = "SELECT a.*, u.name as user_name, u.role as user_role 
                FROM audit_logs a
                LEFT JOIN users u ON a.user_id = u.id
                ORDER BY a.created_at DESC";
        
        return $this->db->paginate($sql, [], $page, $perPage);
    }

    public function getBackups(): array
    {
        $backupDir = __DIR__ . '/../storage/backups/';
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0777, true);
        }

        $files = glob($backupDir . '*.sql');
        $backups = [];
        foreach ($files as $file) {
            $backups[] = [
                'filename' => basename($file),
                'size' => filesize($file),
                'created_at' => date('Y-m-d H:i:s', filemtime($file)),
                'type' => 'Database SQL'
            ];
        }

        // Sort by date desc
        usort($backups, fn($a, $b) => $b['created_at'] <=> $a['created_at']);
        
        return $backups;
    }

    public function createBackup(): array
    {
        $backupDir = realpath(__DIR__ . '/../storage/backups/') . DIRECTORY_SEPARATOR;
        if (!$backupDir) {
            $backupDir = __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'backups' . DIRECTORY_SEPARATOR;
            if (!is_dir($backupDir)) mkdir($backupDir, 0777, true);
        }

        $filename = 'backup_' . date('Y-m-d_H-i-s') . '.sql';
        $path = $backupDir . $filename;

        $mysqldump = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
        // Using --result-file is more reliable on Windows than > redirection
        // Added --skip-lock-tables to avoid engine errors if some tables are weird
        $cmd = "\"{$mysqldump}\" --user=root --skip-lock-tables smart_school --result-file=\"{$path}\" 2>&1";
        
        exec($cmd, $output, $returnVar);

        if ($returnVar !== 0 || !file_exists($path) || filesize($path) === 0) {
            $errorMsg = !empty($output) ? implode("\n", $output) : 'Unknown error';
            Response::error('فشل إنشاء النسخة الاحتياطية: ' . $errorMsg);
        }

        return [
            'filename' => $filename,
            'size' => filesize($path),
            'created_at' => date('Y-m-d H:i:s'),
            'type' => 'Database SQL'
        ];
    }

    public function deleteBackup(string $filename): void
    {
        // Security check
        if (!str_ends_with($filename, '.sql') || str_contains($filename, '..')) {
            Response::error('اسم ملف غير صالح', 400);
        }

        $path = __DIR__ . '/../storage/backups/' . $filename;
        if (file_exists($path)) {
            unlink($path);
        } else {
            Response::error('الملف غير موجود', 404);
        }
    }

    public function restoreBackup(string $filename): void
    {
        if (!str_ends_with($filename, '.sql') || str_contains($filename, '..')) {
            Response::error('اسم ملف غير صالح', 400);
        }

        $path = realpath(__DIR__ . '/../storage/backups/' . $filename);
        if (!$path || !file_exists($path)) {
            Response::error('الملف غير موجود', 404);
        }

        $mysql = 'C:\\xampp\\mysql\\bin\\mysql.exe';
        // Command to restore: mysql -u root smart_school < filename.sql
        $cmd = "\"{$mysql}\" --user=root smart_school < \"{$path}\" 2>&1";
        
        exec($cmd, $output, $returnVar);

        if ($returnVar !== 0) {
            $errorMsg = !empty($output) ? implode("\n", $output) : 'Unknown error';
            Response::error('فشل استعادة النسخة: ' . $errorMsg);
        }
    }

    public function getSettings(?string $category = null): array
    {
        $sql = "SELECT setting_key, setting_value FROM system_settings";
        $params = [];
        if ($category) {
            $sql .= " WHERE category = ?";
            $params = [$category];
        }

        $rows = $this->db->fetchAll($sql, $params);
        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        return $settings;
    }

    public static function getSetting(string $key, $default = null)
    {
        $db = \Core\Database::getInstance();
        $row = $db->fetchOne("SELECT setting_value FROM system_settings WHERE setting_key = ?", [$key]);
        return $row ? $row['setting_value'] : $default;
    }

    public function updateSettings(array $settings): void
    {
        foreach ($settings as $key => $value) {
            $this->db->query(
                "INSERT INTO system_settings (setting_key, setting_value) 
                 VALUES (?, ?) 
                 ON DUPLICATE KEY UPDATE setting_value = ?",
                [$key, (string)$value, (string)$value]
            );
        }
    }
}
