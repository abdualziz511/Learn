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
        $student = $this->getStudentData($userId);

        // Subjects that are assigned to this student's class
        return $this->db->fetchAll(
            "SELECT DISTINCT s.id, s.name, s.icon, s.color, t.name as teacher_name
             FROM subjects s
             JOIN teacher_assignments ta ON ta.subject_id = s.id
             JOIN teachers th ON ta.teacher_id = th.id
             JOIN users t ON th.user_id = t.id
             WHERE ta.class_id = ?",
            [$student['class_id']]
        );
    }

    public function getSubjectContent(int $userId, int $subjectId): array
    {
        $student = $this->getStudentData($userId);

        // Curricula, summaries, etc.
        return $this->db->fetchAll(
            "SELECT id, title, description, type, file_path, file_size 
             FROM educational_content 
             WHERE subject_id = ? AND school_id = ? AND target_role IN ('student', 'both') AND is_active = 1
             ORDER BY created_at DESC",
            [$subjectId, $student['school_id']]
        );
    }

    public function getSubjectAssignments(int $userId, int $subjectId): array
    {
        $student = $this->getStudentData($userId);

        return $this->db->fetchAll(
            "SELECT a.id, a.title, a.description, a.file_path, a.due_date, a.created_at, u.name as teacher_name
             FROM assignments a
             JOIN teachers t ON a.teacher_id = t.id
             JOIN users u ON t.user_id = u.id
             WHERE a.subject_id = ? AND a.class_id = ?
             ORDER BY a.due_date DESC",
            [$subjectId, $student['class_id']]
        );
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
