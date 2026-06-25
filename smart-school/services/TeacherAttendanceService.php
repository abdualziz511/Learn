<?php
// services/TeacherAttendanceService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class TeacherAttendanceService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    private function getTeacherId(int $userId): int
    {
        $teacher = $this->db->fetchOne("SELECT id FROM teachers WHERE user_id = ?", [$userId]);
        if (!$teacher) Response::forbidden('بيانات المعلم غير مكتملة');
        return $teacher['id'];
    }

    public function getTeacherSchools(int $userId): array
    {
        $teacherId = $this->getTeacherId($userId);
        return $this->db->fetchAll(
            "SELECT DISTINCT s.id, s.name 
             FROM schools s
             JOIN teacher_assignments ta ON ta.school_id = s.id
             WHERE ta.teacher_id = ?",
            [$teacherId]
        );
    }

    public function getGradesBySchool(int $userId, int $schoolId): array
    {
        $teacherId = $this->getTeacherId($userId);
        return $this->db->fetchAll(
            "SELECT DISTINCT g.id, g.name 
             FROM grade_levels g
             JOIN classes c ON c.grade_level_id = g.id
             JOIN teacher_assignments ta ON ta.class_id = c.id
             WHERE ta.teacher_id = ? AND ta.school_id = ?
             ORDER BY g.order_num ASC",
            [$teacherId, $schoolId]
        );
    }

    public function getClassesByGrade(int $userId, int $schoolId, int $gradeId): array
    {
        $teacherId = $this->getTeacherId($userId);
        return $this->db->fetchAll(
            "SELECT DISTINCT c.id, c.name 
             FROM classes c
             JOIN teacher_assignments ta ON ta.class_id = c.id
             WHERE ta.teacher_id = ? AND ta.school_id = ? AND c.grade_level_id = ?",
            [$teacherId, $schoolId, $gradeId]
        );
    }

    public function getSubjectsByClass(int $userId, int $schoolId, int $classId): array
    {
        $teacherId = $this->getTeacherId($userId);
        return $this->db->fetchAll(
            "SELECT DISTINCT s.id, s.name, s.color 
             FROM subjects s
             JOIN teacher_assignments ta ON ta.subject_id = s.id
             WHERE ta.teacher_id = ? AND ta.school_id = ? AND ta.class_id = ?",
            [$teacherId, $schoolId, $classId]
        );
    }

    public function recordAttendance(int $userId, array $data): void
    {
        $teacherId = $this->getTeacherId($userId);

        // Verify assignment (Strict: Teacher + Class + Subject)
        $classId = (int)$data['class_id'];
        $subjectId = (int)($data['subject_id'] ?? 0);

        $valid = $this->db->fetchOne(
            "SELECT id FROM teacher_assignments WHERE teacher_id = ? AND class_id = ? AND subject_id = ? LIMIT 1",
            [$teacherId, $classId, $subjectId]
        );
        if (!$valid) Response::forbidden("ليس لديك صلاحية رصد المتابعة لهذه الشعبة (ID: $classId) والمادة (ID: $subjectId)");

        // $data['students'] is an array: [['student_id' => 1, 'status' => 'present', 'notes' => '']]
        $date = $data['date'] ?? date('Y-m-d');

        $this->db->transaction(function(Database $db) use ($teacherId, $data, $date) {
            foreach ($data['students'] as $student) {
                // Check if already recorded for this subject on this date
                $existing = $db->fetchOne(
                    "SELECT id FROM attendance WHERE student_id = ? AND date = ? AND subject_id = ?",
                    [$student['id'] ?? $student['student_id'], $date, $data['subject_id'] ?? null]
                );

                $record = [
                    'student_id'    => $student['id'] ?? $student['student_id'],
                    'class_id'      => $data['class_id'],
                    'subject_id'    => $data['subject_id'] ?? null,
                    'teacher_id'    => $teacherId,
                    'academic_year_id' => 1, // Active year
                    'date'          => $date,
                    'status'        => $student['status'] ?? 'present',
                    'homework_score' => $student['homework'] ?? $student['homework_score'] ?? 0,
                    'teacher_signed' => (bool)($student['teacher_signed'] ?? false),
                    'parent_signed' => (bool)($student['parent_signed'] ?? false),
                    'note'          => $student['note'] ?? $student['notes'] ?? null,
                    'approval_status' => $data['submit_to_director'] ? 'submitted' : ($student['approval_status'] ?? 'pending')
                ];

                if ($existing) {
                    unset($record['student_id'], $record['class_id'], $record['subject_id'], $record['academic_year_id'], $record['date']);
                    $db->update('attendance', $record, ['id' => $existing['id']]);
                } else {
                    $db->insert('attendance', $record);
                }
            }
        });

        \Services\AuditService::getInstance()->log('RECORD_ATTENDANCE', 'attendance', (int)$data['class_id'], null, ['date' => $date, 'count' => count($data['students'])]);
    }

    public function getAttendance(int $userId, int $classId, string $date, ?int $subjectId = null): array
    {
        $teacherId = $this->getTeacherId($userId);

        $valid = $this->db->fetchOne(
            "SELECT id FROM teacher_assignments WHERE teacher_id = ? AND class_id = ? LIMIT 1",
            [$teacherId, $classId]
        );
        if (!$valid) Response::forbidden('ليس لديك صلاحية على هذا الصف');

        $query = "SELECT a.id, a.student_id, a.status, a.note, a.teacher_signed, a.parent_signed, a.approval_status, u.name as student_name
                  FROM attendance a
                  JOIN students s ON a.student_id = s.id
                  JOIN users u ON s.user_id = u.id
                  WHERE a.class_id = ? AND a.date = ? AND a.teacher_id = ?";
        
        $params = [$classId, $date, $teacherId];
        
        if ($subjectId) {
            $query .= " AND a.subject_id = ?";
            $params[] = $subjectId;
        }

        $query .= " ORDER BY u.name ASC";

        return $this->db->fetchAll($query, $params);
    }

    public function getMonthlyStats(int $userId, int $classId, int $subjectId, ?string $month = null): array
    {
        $teacherId = $this->getTeacherId($userId);
        $classId = (int)$classId;
        $subjectId = (int)$subjectId;
        $month = $month ?: date('Y-m');

        // Check permission - Be more verbose for debugging
        $valid = $this->db->fetchOne(
            "SELECT id FROM teacher_assignments WHERE teacher_id = ? AND class_id = ? AND subject_id = ? LIMIT 1",
            [$teacherId, $classId, $subjectId]
        );
        
        if (!$valid) {
            Response::forbidden("المعلم ليس لديه صلاحية على الشعبة (ID: $classId) والمادة (ID: $subjectId)");
        }

        // Get all students in the class
        $students = $this->db->fetchAll(
            "SELECT st.id, st.student_code, u.name, u.avatar
             FROM students st
             JOIN users u ON st.user_id = u.id
             WHERE st.class_id = ? AND st.status = 'active'
             ORDER BY u.name ASC",
            [$classId]
        );
        
        // Fetch assignments for this class and subject and month (This is our source of truth for total count)
        $assignments = $this->db->fetchAll(
            "SELECT due_date as date, day_name, week_number, description 
             FROM assignments 
             WHERE class_id = ? AND subject_id = ? AND DATE_FORMAT(due_date, '%Y-%m') = ?
             ORDER BY due_date ASC",
            [$classId, $subjectId, $month]
        );

        $validDates = array_column($assignments, 'date');
        $totalExpected = count($validDates);

        $stats = [];
        foreach ($students as $student) {
            // Count executed assignments for THIS student and THIS subject only where teacher signed
            $executedCount = 0;
            $records = [];
            
            if ($totalExpected > 0) {
                $placeholders = implode(',', array_fill(0, count($validDates), '?'));
                $params = array_merge([$student['id'], $classId, $subjectId], $validDates);
                
                $records = $this->db->fetchAll(
                    "SELECT date, teacher_signed, parent_signed, note FROM attendance 
                     WHERE student_id = ? AND class_id = ? AND subject_id = ? 
                     AND date IN ($placeholders)",
                    $params
                );

                foreach ($records as $r) {
                    if ($r['teacher_signed']) $executedCount++;
                }
            }

            $stats[] = [
                'id' => (int)$student['id'],
                'student_code' => $student['student_code'],
                'name' => $student['name'],
                'avatar' => $student['avatar'],
                'class_id' => (int)$classId,
                'subject_id' => (int)$subjectId,
                'executed_count' => $executedCount,
                'missed_count' => max(0, $totalExpected - $executedCount),
                'total_expected' => $totalExpected,
                'attendance_records' => $records
            ];
        }

        return [
            'students' => $stats,
            'assignments' => $assignments
        ];
    }

    public function saveMonthlyGrade(int $userId, array $data): bool
    {
        $teacherId = $this->getTeacherId($userId);
        $studentId = (int)$data['student_id'];
        $classId = (int)$data['class_id'];
        $subjectId = (int)$data['subject_id'];
        $score = (float)$data['score'];
        $note = $data['note'] ?? '';
        $month = $data['month'] ?? date('Y-m');

        // Find or create "Monthly Followup" Type ID
        $type = $this->db->fetchOne("SELECT id FROM grade_types WHERE name LIKE '%متابعة شهرية%' LIMIT 1");
        $typeId = $type ? $type['id'] : 1;

        $academicYearId = 1; // Default or fetch active

        // Insert or Update the monthly grade
        $sql = "INSERT INTO grades 
                (student_id, teacher_id, subject_id, class_id, academic_year_id, grade_type_id, score, max_score, note, term) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 10, ?, 1)
                ON DUPLICATE KEY UPDATE score = VALUES(score), note = VALUES(note)";
        
        return (bool)$this->db->query($sql, [
            $studentId, $teacherId, $subjectId, $classId, $academicYearId, $typeId, $score, $note
        ]);
    }
    public function addAssignment(int $userId, array $data): array
    {
        $teacherId = $this->getTeacherId($userId);
        
        // Verify permission for class/subject - Ensure types match (int)
        $classId = (int)$data['class_id'];
        $subjectId = (int)$data['subject_id'];

        $valid = $this->db->fetchOne(
            "SELECT id FROM teacher_assignments WHERE teacher_id = ? AND class_id = ? AND subject_id = ? LIMIT 1",
            [$teacherId, $classId, $subjectId]
        );
        
        if (!$valid) {
            // For debugging: error message with sent values
            Response::forbidden("ليس لديك صلاحية على هذا الصف (ID: $classId) أو المادة (ID: $subjectId)");
        }

        $record = [
            'teacher_id'       => $teacherId,
            'class_id'         => (int)$data['class_id'],
            'subject_id'       => (int)$data['subject_id'],
            'academic_year_id' => 1,
            'title'            => 'واجب يومي - ' . ($data['day_name'] ?? ''),
            'description'      => $data['task_description'],
            'due_date'         => $data['date'],
            'day_name'         => $data['day_name'] ?? null,
            'week_number'      => (int)($data['week_number'] ?? 0),
            'type'             => 'homework'
        ];

        $id = $this->db->insert('assignments', $record);
        return ['id' => $id];
    }
}
