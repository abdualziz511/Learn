<?php
// services/SchoolStatsService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Auth;
use Services\SystemService;

class SchoolStatsService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getOverview(int $schoolId): array
    {
        try {
            $studentsCount = $this->db->count("SELECT COUNT(*) FROM students WHERE school_id = ?", [$schoolId]);
            $teachersCount = $this->db->count("SELECT COUNT(DISTINCT teacher_id) FROM teacher_assignments WHERE school_id = ?", [$schoolId]);
            $classesCount  = $this->db->count("SELECT COUNT(*) FROM classes WHERE school_id = ?", [$schoolId]);

            return [
                'students_count' => $studentsCount,
                'teachers_count' => $teachersCount,
                'classes_count'  => $classesCount,
                'attendance_rate'=> $this->calculateAttendanceRate($schoolId),
                'grades_performance' => $this->getGradesPerformance($schoolId),
            ];
        } catch (\Exception $e) {
            return [
                'students_count' => 0,
                'teachers_count' => 0,
                'classes_count' => 0,
                'attendance_rate' => '0%',
                'grades_performance' => []
            ];
        }
    }

    public function getGradeStats(int $schoolId, int $levelId): array
    {
        return [
            'sections' => $this->getSectionsStats($schoolId, $levelId),
            'weak_subjects' => $this->getWeakSubjects($schoolId, $levelId),
            'attendance_by_section' => $this->getAttendanceBySection($schoolId, $levelId)
        ];
    }

    private function calculateAttendanceRate(int $schoolId): string
    {
        $sql = "SELECT 
                    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
                    COUNT(*) as total
                FROM attendance a
                JOIN students s ON a.student_id = s.id
                WHERE s.school_id = ? AND a.date >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        
        $res = $this->db->fetchOne($sql, [$schoolId]);
        if (!$res || $res['total'] == 0) return '0%';
        
        return round(($res['present'] / $res['total']) * 100) . '%';
    }

    private function getGradesPerformance(int $schoolId): array
    {
        $sql = "SELECT gl.name as grade, AVG(st.score) as average
                FROM grades st
                JOIN students s ON st.student_id = s.id
                JOIN classes c ON s.class_id = c.id
                JOIN grade_levels gl ON c.grade_level_id = gl.id
                WHERE s.school_id = ?
                GROUP BY gl.id";
        return $this->db->fetchAll($sql, [$schoolId]);
    }

    private function getSectionsStats(int $schoolId, int $levelId): array
    {
        $sql = "SELECT c.name as section, AVG(st.score) as average
                FROM grades st
                JOIN students s ON st.student_id = s.id
                JOIN classes c ON s.class_id = c.id
                WHERE c.school_id = ? AND c.grade_level_id = ?
                GROUP BY c.id";
        return $this->db->fetchAll($sql, [$schoolId, $levelId]);
    }

    private function getWeakSubjects(int $schoolId, int $levelId): array
    {
        $sql = "SELECT sub.name as subject, AVG(st.score) as average
                FROM grades st
                JOIN students s ON st.student_id = s.id
                JOIN subjects sub ON st.subject_id = sub.id
                JOIN classes c ON s.class_id = c.id
                WHERE c.school_id = ? AND c.grade_level_id = ?
                GROUP BY sub.id
                HAVING average < 60
                ORDER BY average ASC";
        return $this->db->fetchAll($sql, [$schoolId, $levelId]);
    }

    private function getAttendanceBySection(int $schoolId, int $levelId): array
    {
        $sql = "SELECT c.name as section, 
                       (SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100 as rate
                FROM attendance a
                JOIN students s ON a.student_id = s.id
                JOIN classes c ON s.class_id = c.id
                WHERE c.school_id = ? AND c.grade_level_id = ?
                GROUP BY c.id";
        return $this->db->fetchAll($sql, [$schoolId, $levelId]);
    }
}
