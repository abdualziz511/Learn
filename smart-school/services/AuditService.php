<?php
// services/AuditService.php

declare(strict_types=1);

namespace Services;

use Core\Database;

class AuditService
{
    private static ?AuditService $instance = null;
    private Database $db;

    private function __construct()
    {
        $this->db = Database::getInstance();
    }

    public static function getInstance(): AuditService
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function log(
        string $action,
        ?string $tableName = null,
        ?int $recordId = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): void {
        $user = \Core\Auth::getCurrentUser();
        $userId = $user['id'] ?? null;
        $schoolId = $user['school_id'] ?? null; // If available in current user session

        $data = [
            'user_id'    => $userId,
            'school_id'  => $schoolId,
            'action'     => strtoupper($action),
            'table_name' => $tableName,
            'record_id'  => $recordId,
            'old_values' => $oldValues ? json_encode($oldValues) : null,
            'new_values' => $newValues ? json_encode($newValues) : null,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'System',
        ];

        try {
            $this->db->insert('audit_logs', $data);
        } catch (\Exception $e) {
            // Silently fail if logging fails to not break the main app
            error_log("Audit log failed: " . $e->getMessage());
        }
    }
}
