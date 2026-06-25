<?php
// services/TeacherDashboardService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class TeacherDashboardService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getTeacherStats(int $userId): array
    {
        $teacherId = $this->getTeacherId($userId);
        
        $schoolsCount = $this->db->fetchOne("SELECT COUNT(DISTINCT school_id) as count FROM teacher_assignments WHERE teacher_id = ?", [$teacherId]);
        $classesCount = $this->db->fetchOne("SELECT COUNT(DISTINCT class_id) as count FROM teacher_assignments WHERE teacher_id = ?", [$teacherId]);
        $subjectsCount = $this->db->fetchOne("SELECT COUNT(DISTINCT subject_id) as count FROM teacher_assignments WHERE teacher_id = ?", [$teacherId]);
        $studentsCount = $this->db->fetchOne("SELECT COUNT(DISTINCT st.id) as count 
                                                       FROM students st
                                                       JOIN teacher_assignments ta ON st.class_id = ta.class_id
                                                       WHERE ta.teacher_id = ?", [$teacherId]);
        $userName = $this->db->fetchOne("SELECT name FROM users WHERE id = ?", [$userId]);

        return [
            'schools_count'  => (int)($schoolsCount['count'] ?? 0),
            'classes_count'  => (int)($classesCount['count'] ?? 0),
            'subjects_count' => (int)($subjectsCount['count'] ?? 0),
            'students_count' => (int)($studentsCount['count'] ?? 0),
            'teacher_name'   => $userName['name'] ?? 'معلم'
        ];
    }

    public function getAssignedSchedule(int $userId): array
    {
        $teacherId = $this->getTeacherId($userId);
        $sql = "SELECT ta.id, ta.school_id, ta.class_id, ta.subject_id, 
                       c.name as class_name, g.name as grade_name, s.name as subject_name, sc.name as school_name, s.color
                FROM teacher_assignments ta
                JOIN classes c ON ta.class_id = c.id
                JOIN grade_levels g ON c.grade_level_id = g.id
                JOIN subjects s ON ta.subject_id = s.id
                JOIN schools sc ON ta.school_id = sc.id
                WHERE ta.teacher_id = ?
                ORDER BY sc.name, g.order_num";
        return $this->db->fetchAll($sql, [$teacherId]);
    }

    private function getTeacherId(int $userId): int
    {
        $teacher = $this->db->fetchOne("SELECT id FROM teachers WHERE user_id = ?", [$userId]);
        if (!$teacher) Response::forbidden('بيانات المعلم غير مكتملة');
        return $teacher['id'];
    }

    public function getSchools(int $userId): array
    {
        $teacherId = $this->getTeacherId($userId);
        $sql = "SELECT DISTINCT s.id, s.name, s.logo 
                FROM schools s
                JOIN teacher_assignments ta ON ta.school_id = s.id
                WHERE ta.teacher_id = ?";
        return $this->db->fetchAll($sql, [$teacherId]);
    }

    public function getMeta(int $userId, int $schoolId): array
    {
        $teacherId = $this->getTeacherId($userId);
        
        $classes = $this->getClasses($userId, $schoolId);
        
        // Get all unique subjects for this teacher in this school
        $sql = "SELECT DISTINCT s.id, s.name, s.color, s.icon
                FROM subjects s
                JOIN teacher_assignments ta ON ta.subject_id = s.id
                WHERE ta.teacher_id = ? AND ta.school_id = ?";
        $subjects = $this->db->fetchAll($sql, [$teacherId, $schoolId]);

        return [
            'classes'  => $classes,
            'subjects' => $subjects
        ];
    }

    public function getClasses(int $userId, int $schoolId): array
    {
        $teacherId = $this->getTeacherId($userId);
        
        // Ensure teacher is actually assigned to this school
        $this->verifyAssignment($teacherId, $schoolId);

        $sql = "SELECT DISTINCT c.id, c.name, g.name as grade_name
                FROM classes c
                JOIN teacher_assignments ta ON ta.class_id = c.id
                JOIN grade_levels g ON c.grade_level_id = g.id
                WHERE ta.teacher_id = ? AND ta.school_id = ?
                ORDER BY g.order_num ASC, c.name ASC";
        return $this->db->fetchAll($sql, [$teacherId, $schoolId]);
    }

    public function getSubjects(int $userId, int $schoolId, int $classId): array
    {
        $teacherId = $this->getTeacherId($userId);
        $this->verifyAssignment($teacherId, $schoolId, $classId);

        $sql = "SELECT DISTINCT s.id, s.name, s.icon, s.color
                FROM subjects s
                JOIN teacher_assignments ta ON ta.subject_id = s.id
                WHERE ta.teacher_id = ? AND ta.school_id = ? AND ta.class_id = ?";
        return $this->db->fetchAll($sql, [$teacherId, $schoolId, $classId]);
    }

    public function getStudents(int $userId, int $schoolId, int $classId, ?int $subjectId = null): array
    {
        $teacherId = $this->getTeacherId($userId);
        $this->verifyAssignment($teacherId, $schoolId, $classId, $subjectId);

        $sql = "SELECT st.id, st.student_code, u.name, u.avatar
                FROM students st
                JOIN users u ON st.user_id = u.id
                WHERE st.school_id = ? AND st.class_id = ? AND st.status = 'active'
                ORDER BY u.name ASC";
        return $this->db->fetchAll($sql, [$schoolId, $classId]);
    }

    private function verifyAssignment(int $teacherId, ?int $schoolId = null, ?int $classId = null, ?int $subjectId = null): void
    {
        $params = [$teacherId];
        $where = "teacher_id = ?";

        if ($schoolId && $schoolId > 0) {
            $where .= " AND school_id = ?";
            $params[] = $schoolId;
        }
        if ($classId) {
            $where .= " AND class_id = ?";
            $params[] = $classId;
        }
        if ($subjectId) {
            $where .= " AND subject_id = ?";
            $params[] = $subjectId;
        }

        $valid = $this->db->fetchOne("SELECT id FROM teacher_assignments WHERE {$where} LIMIT 1", $params);
        if (!$valid) {
            Response::forbidden('ليس لديك صلاحية على هذا الصف أو المادة');
        }
    }
}
