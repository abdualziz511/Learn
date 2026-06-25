<?php
// services/SchoolTeacherService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class SchoolTeacherService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getAll(int $schoolId, int $page = 1, int $perPage = 20): array
    {
        // Teachers connected to this school via teacher_assignments
        $sql = "SELECT DISTINCT t.*, u.name, u.email, u.is_active
                FROM teachers t
                JOIN users u ON t.user_id = u.id
                JOIN teacher_assignments ta ON ta.teacher_id = t.id
                WHERE ta.school_id = ?
                ORDER BY t.id DESC";
        
        $result = $this->db->paginate($sql, [$schoolId], $page, $perPage);

        // For each teacher, fetch their specific assignments in this school
        foreach ($result['data'] as &$t) {
            $t['assignments'] = $this->db->fetchAll(
                "SELECT ta.id, ta.class_id, ta.subject_id, c.name as class_name, c.grade_level_id, s.name as subject_name
                 FROM teacher_assignments ta
                 JOIN classes c ON ta.class_id = c.id
                 JOIN subjects s ON ta.subject_id = s.id
                 WHERE ta.teacher_id = ? AND ta.school_id = ?",
                [$t['id'], $schoolId]
            );
        }

        return $result;
    }

    public function getById(int $schoolId, int $id): array
    {
        $sql = "SELECT t.*, u.name, u.email, u.is_active
                FROM teachers t
                JOIN users u ON t.user_id = u.id
                WHERE t.id = ?";
                
        $teacher = $this->db->fetchOne($sql, [$id]);
        if (!$teacher) {
            Response::notFound('المعلم غير موجود');
        }

        // Get their assignments in this school - Use LEFT JOIN for air-tight reliability
        $teacher['assignments'] = $this->db->fetchAll(
            "SELECT ta.id, ta.class_id, ta.subject_id, c.grade_level_id, 
                    c.name as class_name, s.name as subject_name
             FROM teacher_assignments ta
             JOIN classes c ON ta.class_id = c.id
             JOIN subjects s ON ta.subject_id = s.id
             WHERE ta.teacher_id = ? AND ta.school_id = ?",
            [$id, $schoolId]
        );

        return $teacher;
    }

    // Connect existing user as teacher, or create new user+teacher
    public function createOrAssign(int $schoolId, array $data): array
    {
        // If email or phone provided, check if user exists
        $userId = null;
        if (!empty($data['email'])) {
            $user = $this->db->fetchOne(
                "SELECT id, role FROM users WHERE email = :e LIMIT 1",
                ['e' => $data['email']]
            );

            if ($user) {
                if ($user['role'] !== 'teacher' && $user['role'] !== 'super_admin') {
                    Response::validationError(['user' => ['هذا الحساب موجود مسبقاً بدور مختلف']]);
                }
                $userId = $user['id'];
            }
        }

        return $this->db->transaction(function(Database $db) use ($schoolId, $data, $userId) {
            if (!$userId) {
                if (empty($data['password'])) {
                    Response::validationError(['password' => ['كلمة المرور مطلوبة لإنشاء مستخدم جديد']]);
                }
                $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
                $userId = $db->insert('users', [
                    'name'          => $data['name'],
                    'email'         => $data['email'] ?? null,
                    'phone'         => $data['phone'] ?? null,
                    'password_hash' => $passwordHash,
                    'role'          => 'teacher',
                    'is_active'     => 1
                ]);
            } else {
                // Update basic user info if needed
                $db->update('users', [
                    'name' => $data['name'],
                    'phone' => $data['phone'] ?? null
                ], ['id' => $userId]);
            }

            // check if teacher record exists
            $teacher = $db->fetchOne("SELECT id FROM teachers WHERE user_id = ?", [$userId]);
            if (!$teacher) {
                $teacherId = $db->insert('teachers', [
                    'user_id'        => $userId,
                    'phone'          => $data['phone'] ?? null,
                    'teacher_code'   => $data['teacher_code'] ?? null,
                    'specialization' => $data['specialization'] ?? null,
                    'qualification'  => $data['qualification'] ?? null,
                    'hire_date'      => $data['hire_date'] ?? date('Y-m-d')
                ]);
            } else {
                $teacherId = $teacher['id'];
                $db->update('teachers', [
                    'phone'          => $data['phone'] ?? null,
                    'specialization' => $data['specialization'] ?? null,
                    'qualification'  => $data['qualification'] ?? null,
                    'teacher_code'   => $data['teacher_code'] ?? null,
                    'hire_date'      => $data['hire_date'] ?? date('Y-m-d')
                ], ['id' => $teacherId]);
            }

            // Handle assignments
            $this->syncAssignments($db, $schoolId, $teacherId, $data['assignments'] ?? []);

            return $this->getById($schoolId, $teacherId);
        });
    }

    public function update(int $schoolId, int $id, array $data): array
    {
        return $this->db->transaction(function(Database $db) use ($schoolId, $id, $data) {
            $teacher = $db->fetchOne("SELECT user_id FROM teachers WHERE id = ?", [$id]);
            if (!$teacher) Response::notFound('المعلم غير موجود');

            // Update user
            $db->update('users', [
                'name'  => $data['name'],
                'phone' => $data['phone'] ?? null,
                'email' => $data['email'] ?? null
            ], ['id' => $teacher['user_id']]);

            // Update teacher
            $db->update('teachers', [
                'phone'          => $data['phone'] ?? null,
                'specialization' => $data['specialization'] ?? null,
                'qualification'  => $data['qualification'] ?? null,
                'teacher_code'   => $data['teacher_code'] ?? null,
                'hire_date'      => $data['hire_date'] ?? null
            ], ['id' => $id]);

            // Sync assignments
            $this->syncAssignments($db, $schoolId, $id, $data['assignments'] ?? []);

            return $this->getById($schoolId, $id);
        });
    }

    private function syncAssignments(Database $db, int $schoolId, int $teacherId, array $assignments): void
    {
        // Delete existing for this school?? 
        // User said "Teacher can teach in many schools", so we only touch this school's assignments
        $db->delete('teacher_assignments', ['teacher_id' => $teacherId, 'school_id' => $schoolId]);

        foreach ($assignments as $asn) {
            if (empty($asn['class_id']) || empty($asn['subject_id'])) continue;

            $class = $db->fetchOne("SELECT academic_year_id FROM classes WHERE id = ? AND school_id = ?", [$asn['class_id'], $schoolId]);
            if (!$class) continue;

            $db->insert('teacher_assignments', [
                'teacher_id'       => $teacherId,
                'school_id'        => $schoolId,
                'class_id'         => $asn['class_id'],
                'subject_id'       => $asn['subject_id'],
                'academic_year_id' => $class['academic_year_id']
            ]);
        }
    }

    public function removeAssignment(int $schoolId, int $teacherId, int $assignmentId): void
    {
        $old = $this->db->fetchOne("SELECT * FROM teacher_assignments WHERE id = ?", [$assignmentId]);
        $this->db->delete('teacher_assignments', [
            'id' => $assignmentId,
            'teacher_id' => $teacherId,
            'school_id' => $schoolId
        ]);
        \Services\AuditService::getInstance()->log('REMOVE_TEACHER_ASSIGNMENT', 'teacher_assignments', $assignmentId, $old);
    }

    public function getAllAssignments(int $schoolId): array
    {
        $sql = "SELECT ta.*, u.name as teacher_name, t.specialization as teacher_specialization, 
                       c.name as class_name, gl.name as grade_level_name, s.name as subject_name
                FROM teacher_assignments ta
                JOIN teachers t ON ta.teacher_id = t.id
                JOIN users u ON t.user_id = u.id
                JOIN classes c ON ta.class_id = c.id
                JOIN subjects s ON ta.subject_id = s.id
                LEFT JOIN grade_levels gl ON c.grade_level_id = gl.id
                WHERE ta.school_id = ?
                ORDER BY u.name ASC";
        
        return $this->db->fetchAll($sql, [$schoolId]);
    }

    public function deleteFromSchool(int $schoolId, int $teacherId): void
    {
        $this->db->delete('teacher_assignments', [
            'teacher_id' => $teacherId,
            'school_id'  => $schoolId
        ]);
        \Services\AuditService::getInstance()->log('REMOVE_TEACHER_FROM_SCHOOL', 'teachers', $teacherId, ['school_id' => $schoolId]);
    }
}
