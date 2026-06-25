<?php
// services/StudentService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class StudentService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    private function getStudentData(int $userId): array
    {
        $student = $this->db->fetchOne("SELECT * FROM students WHERE user_id = ?", [$userId]);
        if (!$student) Response::forbidden('بيانات الطالب غير مكتملة');
        return $student;
    }

    public function getDashboard(int $userId): array
    {
        $student = $this->getStudentData($userId);

        // Fetch AI Analysis
        $aiAnalysis = $this->db->fetchOne(
            "SELECT risk_level, strong_subjects, weak_subjects, recommendations, generated_at 
             FROM ai_analysis 
             WHERE student_id = ? 
             ORDER BY generated_at DESC LIMIT 1", 
            [$student['id']]
        );

        // Fetch recent pending assignments
        $assignments = $this->db->fetchAll(
            "SELECT id, title, due_date 
             FROM assignments 
             WHERE class_id = ? AND due_date >= CURDATE()
             ORDER BY due_date ASC LIMIT 5",
            [$student['class_id']]
        );

        return [
            'student_info' => [
                'code' => $student['student_code'],
                'school_id' => $student['school_id'],
                'class_id' => $student['class_id']
            ],
            'ai_insights' => $aiAnalysis ? [
                'risk_level' => $aiAnalysis['risk_level'],
                'strong_subjects' => json_decode($aiAnalysis['strong_subjects'] ?? '[]', true),
                'weak_subjects' => json_decode($aiAnalysis['weak_subjects'] ?? '[]', true),
                'recommendations' => json_decode($aiAnalysis['recommendations'] ?? '[]', true),
                'generated_at' => $aiAnalysis['generated_at']
            ] : null,
            'upcoming_assignments' => $assignments
        ];
    }

    public function getSubjects(int $userId): array
    {
        $student = $this->db->fetchOne(
            "SELECT s.class_id, cl.grade_level_id, s.school_id
             FROM students s 
             JOIN classes cl ON s.class_id = cl.id 
             WHERE s.user_id = ?", 
            [$userId]
        );
        
        if (!$student) Response::forbidden('البيانات غير مكتملة');

        $gradeId = (int)$student['grade_level_id'];
        $classId = (int)$student['class_id'];
        $schoolId = (int)$student['school_id'];

        // Subjects relate to grade level ONLY
        return $this->db->fetchAll(
            "SELECT DISTINCT s.id, s.name, s.name_en, s.icon, s.color, s.description, tu.name as teacher_name
             FROM subjects s
             LEFT JOIN teacher_assignments ta ON ta.subject_id = s.id AND ta.class_id = ?
             LEFT JOIN teachers th ON ta.teacher_id = th.id
             LEFT JOIN users tu ON th.user_id = tu.id
             WHERE s.grade_level_id = ?
             ORDER BY s.name ASC",
            [(int)$classId, (int)$gradeId]
        );
    }

    public function getSubjectContent(int $userId, int $subjectId, ?int $term = null): array
    {
        $student = $this->db->fetchOne("SELECT school_id FROM students WHERE user_id = ?", [$userId]);
        if (!$student) return [];
        
        $params = [(int)$subjectId, (int)$student['school_id']];
        // Allow content from specific school OR central content (school_id = 1)
        $where = "subject_id = ? AND (school_id = ? OR school_id = 1) AND target_role IN ('student', 'both') AND is_active = 1";
        
        if ($term && $term > 0) {
            $where .= " AND term = ?";
            $params[] = (int)$term;
        }

        return $this->db->fetchAll(
            "SELECT id, title, description, type, file_path, file_size 
             FROM educational_content 
             WHERE {$where}
             ORDER BY created_at DESC",
            $params
        );
    }

    public function getSubjectAssignments(int $userId, int $subjectId): array
    {
        $student = $this->getStudentData($userId);

        $assignments = $this->db->fetchAll(
            "SELECT a.id, a.title, a.description, a.attachment, a.due_date as date, a.day_name, a.week_number, u.name as teacher_name
             FROM assignments a
             JOIN teachers t ON a.teacher_id = t.id
             JOIN users u ON t.user_id = u.id
             WHERE a.subject_id = ? AND a.class_id = ?
             ORDER BY a.due_date ASC",
            [$subjectId, $student['class_id']]
        );

        // Fetch attendance/signature records for these assignments
        $attendanceRecords = $this->db->fetchAll(
            "SELECT date, teacher_signed, parent_signed, homework_score, note
             FROM attendance 
             WHERE student_id = ? AND subject_id = ? AND MONTH(date) = MONTH(CURRENT_DATE)",
            [$student['id'], $subjectId]
        );

        // Fetch monthly stats from attendance/grades table
        $stats = $this->db->fetchOne(
            "SELECT 
                COUNT(*) as total_expected,
                SUM(CASE WHEN teacher_signed = 1 THEN 1 ELSE 0 END) as executed_count
             FROM attendance 
             WHERE student_id = ? AND subject_id = ? AND MONTH(date) = MONTH(CURRENT_DATE)",
            [$student['id'], $subjectId]
        );

        // Fetch monthly assignment grade
        $grade = $this->db->fetchOne(
            "SELECT score FROM grades 
             WHERE student_id = ? AND subject_id = ? AND grade_type_id = (SELECT id FROM grade_types WHERE name LIKE '%واجب%' OR name LIKE '%homework%' LIMIT 1)
             AND academic_year_id = 1 LIMIT 1",
            [$student['id'], $subjectId]
        );

        return [
            'assignments' => $assignments,
            'attendance_records' => $attendanceRecords,
            'stats' => [
                'total_expected' => (int)($stats['total_expected'] ?? 0),
                'executed_count' => (int)($stats['executed_count'] ?? 0),
                'submitted_count' => (int)($stats['executed_count'] ?? 0),
                'missed_count' => max(0, (int)($stats['total_expected'] ?? 0) - (int)($stats['executed_count'] ?? 0)),
                'monthly_grade' => $grade ? $grade['score'] : '---'
            ]
        ];
    }

    public function getGrades(int $userId): array
    {
        $student = $this->getStudentData($userId);

        return $this->db->fetchAll(
            "SELECT g.exam_type, g.score, g.max_score, s.name as subject_name
             FROM grades g
             JOIN subjects s ON g.subject_id = s.id
             WHERE g.student_id = ? AND g.approval_status = 'approved'
             ORDER BY g.created_at DESC",
            [$student['id']]
        );
    }

    public function getAttendance(int $userId): array
    {
        $student = $this->getStudentData($userId);

        return $this->db->fetchAll(
            "SELECT date, status, notes
             FROM attendance
             WHERE student_id = ? AND approval_status = 'approved'
             ORDER BY date DESC LIMIT 30",
            [$student['id']]
        );
    }
}
