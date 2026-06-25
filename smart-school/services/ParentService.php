<?php
// services/ParentService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class ParentService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    private function getParentPhone(int $userId): string
    {
        $parent = $this->db->fetchOne("SELECT phone FROM parents WHERE user_id = ?", [$userId]);
        if (!$parent) {
            // fallback to user phone
            $user = $this->db->fetchOne("SELECT phone FROM users WHERE id = ?", [$userId]);
            if (!$user || !$user['phone']) Response::forbidden('رقم هاتف ولي الأمر غير مسجل');
            return $user['phone'];
        }
        return $parent['phone'];
    }

    public function getChildren(int $userId): array
    {
        $phone = $this->getParentPhone($userId);

        $students = $this->db->fetchAll(
            "SELECT s.id as id, s.id as student_id, s.student_code, s.school_id, s.class_id, u.name, c.name as grade, sch.name as school
             FROM students s
             JOIN users u ON s.user_id = u.id
             JOIN classes c ON s.class_id = c.id
             JOIN schools sch ON s.school_id = sch.id
             WHERE s.parent_phone = ?",
            [$phone]
        );

        // Fetch performance/attendance for each
        foreach ($students as &$s) {
            $stats = $this->getChildStats((int)$s['id']);
            $s['performance'] = $stats['performance'] . '%';
            $s['attendance'] = $stats['attendance'] . '%';
        }

        return $students;
    }

    public function getChildStats(int $studentId): array
    {
        // Attendance logic
        $attend = $this->db->fetchOne(
            "SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
             FROM attendance WHERE student_id = ?",
            [$studentId]
        );
        $attendance = $attend['total'] > 0 ? round(($attend['present'] / $attend['total']) * 100) : 100;

        // Performance logic (average of homework scores)
        $perf = $this->db->fetchOne(
            "SELECT AVG(homework_score) as avg_score FROM attendance WHERE student_id = ? AND homework_score IS NOT NULL",
            [$studentId]
        );
        $performance = $perf['avg_score'] ? round(($perf['avg_score'] / 5) * 100) : 0;

        return [
            'performance' => $performance,
            'attendance' => $attendance
        ];
    }

    public function getChildSummary(int $studentId): array
    {
        // Weekly summary (last 7 records)
        $summary = $this->db->fetchAll(
            "SELECT a.date, s.name as subject_name, a.status, a.participation_score, a.behavior_score, a.teacher_signed
             FROM attendance a
             JOIN subjects s ON a.subject_id = s.id
             WHERE a.student_id = ?
             ORDER BY a.date DESC LIMIT 7",
            [$studentId]
        );

        // Recent teacher note (if any)
        $note = $this->db->fetchOne(
            "SELECT note, date FROM attendance 
             WHERE student_id = ? AND note IS NOT NULL AND note != ''
             ORDER BY date DESC LIMIT 1",
            [$studentId]
        );

        return [
            'weekly_summary' => $summary,
            'latest_note' => $note
        ];
    }

    public function signAssignment(int $userId, int $studentId, string $date, int $subjectId): bool
    {
        $this->verifyChild($userId, $studentId);

        $existing = $this->db->fetchOne(
            "SELECT id FROM attendance WHERE student_id = ? AND date = ? AND subject_id = ?",
            [$studentId, $date, $subjectId]
        );

        if ($existing) {
            return (bool)$this->db->update('attendance', ['parent_signed' => 1], ['id' => $existing['id']]);
        } else {
            return (bool)$this->db->insert('attendance', [
                'student_id' => $studentId,
                'date' => $date,
                'subject_id' => $subjectId,
                'status' => 'present',
                'parent_signed' => 1,
                'academic_year_id' => 1 // default
            ]);
        }
    }

    public function getChildSubjects(int $studentId): array
    {
        $student = $this->db->fetchOne(
            "SELECT class_id FROM students WHERE id = ?",
            [$studentId]
        );
        if (!$student) return [];

        $classId = (int)$student['class_id'];

        // Get subjects for this class
        return $this->db->fetchAll(
            "SELECT s.id, s.name, u.name as teacher_name
             FROM subjects s
             JOIN classes c ON s.grade_level_id = c.grade_level_id
             LEFT JOIN teacher_assignments ta ON ta.subject_id = s.id AND ta.class_id = c.id
             LEFT JOIN teachers t ON ta.teacher_id = t.id
             LEFT JOIN users u ON t.user_id = u.id
             WHERE c.id = ?
             GROUP BY s.id",
            [$classId]
        );
    }

    public function getChildAssignments(int $studentId, int $subjectId): array
    {
        // Reuse logic but ensure verification is done
        $db = \Core\Database::getInstance();
        
        $assignments = $db->fetchAll(
            "SELECT a.id, a.title, a.description, a.due_date as date, a.day_name, a.week_number, u.name as teacher_name
             FROM assignments a
             JOIN teachers t ON a.teacher_id = t.id
             JOIN users u ON t.user_id = u.id
             WHERE a.subject_id = ? AND a.class_id = (SELECT class_id FROM students WHERE id = ?)
             ORDER BY a.due_date ASC",
            [$subjectId, $studentId]
        );

        $attendanceRecords = $db->fetchAll(
            "SELECT date, teacher_signed, parent_signed, homework_score, note
             FROM attendance 
             WHERE student_id = ? AND subject_id = ? AND MONTH(date) = MONTH(CURRENT_DATE)",
            [$studentId, $subjectId]
        );

        return [
            'assignments' => $assignments,
            'attendance_records' => $attendanceRecords
        ];
    }

    public function verifyChild(int $userId, int $studentId): void
    {
        $phone = $this->getParentPhone($userId);
        $valid = $this->db->fetchOne(
            "SELECT id FROM students WHERE id = ? AND parent_phone = ?",
            [$studentId, $phone]
        );
        if (!$valid) Response::forbidden('هذا الطالب غير مرتبط بحسابك');
    }
}
