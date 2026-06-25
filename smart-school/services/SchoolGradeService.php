<?php
// services/SchoolGradeService.php

declare(strict_types=1);

namespace Services;

use Core\Database;

class SchoolGradeService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Get pending grades for approval
     */
    public function getPendingGrades(int $schoolId): array
    {
        $sql = "SELECT g.*, 
                       u.name as student_name, 
                       tu.name as teacher_name, 
                       sub.name as subject_name,
                       cl.name as class_name
                FROM student_grades g
                JOIN students s ON g.student_id = s.id
                JOIN users u ON s.user_id = u.id
                JOIN classes cl ON s.class_id = cl.id
                JOIN teachers t ON g.teacher_id = t.id
                JOIN users tu ON t.user_id = tu.id
                JOIN subjects sub ON g.subject_id = sub.id
                WHERE s.school_id = ? AND g.status = 'pending'
                ORDER BY g.created_at DESC";

        return $this->db->fetchAll($sql, [$schoolId]);
    }

    /**
     * Approve all pending grades for a school
     */
    public function approveAll(int $schoolId): int
    {
        $sql = "UPDATE student_grades g
                JOIN students s ON g.student_id = s.id
                SET g.status = 'approved', g.approved_at = NOW()
                WHERE s.school_id = ? AND g.status = 'pending'";
        
        $stmt = $this->db->query($sql, [$schoolId]);
        return $stmt->rowCount();
    }

    /**
     * Approve single grade
     */
    public function approveSingle(int $schoolId, int $gradeId): bool
    {
        $sql = "UPDATE student_grades g
                JOIN students s ON g.student_id = s.id
                SET g.status = 'approved', g.approved_at = NOW()
                WHERE g.id = ? AND s.school_id = ?";
        
        $stmt = $this->db->query($sql, [$gradeId, $schoolId]);
        return $stmt->rowCount() > 0;
    }
}
