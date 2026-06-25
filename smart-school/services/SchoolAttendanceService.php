<?php
// services/SchoolAttendanceService.php

declare(strict_types=1);

namespace Services;

use Core\Database;

class SchoolAttendanceService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Get attendance for a specific date across the school
     */
    public function getAttendance(int $schoolId, string $date): array
    {
        $sql = "SELECT a.*, 
                       u.name as student_name, 
                       cl.name as class_name, 
                       gl.name as grade_name,
                       tu.name as teacher_name,
                       sub.name as subject_name
                FROM attendance a
                JOIN students s ON a.student_id = s.id
                JOIN users u ON s.user_id = u.id
                JOIN classes cl ON a.class_id = cl.id
                JOIN grade_levels gl ON cl.grade_level_id = gl.id
                LEFT JOIN teachers t ON a.teacher_id = t.id
                LEFT JOIN users tu ON t.user_id = tu.id
                LEFT JOIN subjects sub ON a.subject_id = sub.id
                WHERE s.school_id = ? AND a.date = ?
                ORDER BY a.approval_status DESC, gl.order_num, cl.name, u.name ASC";

        return $this->db->fetchAll($sql, [$schoolId, $date]);
    }

    /**
     * Approve an attendance record
     */
    public function approveAttendance(int $schoolId, int $id): void
    {
        // Verify ownership and update
        $this->db->query(
            "UPDATE attendance a
             JOIN students s ON a.student_id = s.id
             SET a.approval_status = 'approved'
             WHERE a.id = ? AND s.school_id = ?",
            [$id, $schoolId]
        );

        // Optionally send notification to parents here via NotificationService
    }
}
