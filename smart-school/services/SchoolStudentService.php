<?php
// services/SchoolStudentService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class SchoolStudentService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getAll(int $schoolId, int $page = 1, int $perPage = 20, ?int $classId = null, ?int $gradeLevelId = null): array
    {
        $params = [$schoolId];
        $where = "s.school_id = ?";
        
        if ($classId) {
            $where .= " AND s.class_id = ?";
            $params[] = $classId;
        }

        if ($gradeLevelId) {
            $where .= " AND s.grade_level_id = ?";
            $params[] = $gradeLevelId;
        }

        $sql = "SELECT s.*, u.name, u.name as student_name, u.email, u.is_active, 
                       cl.name as class_name, gl.name as grade_level_name
                FROM students s
                JOIN users u ON s.user_id = u.id
                LEFT JOIN classes cl ON s.class_id = cl.id
                LEFT JOIN grade_levels gl ON s.grade_level_id = gl.id
                WHERE {$where} 
                ORDER BY u.name ASC";
        
        return $this->db->paginate($sql, $params, $page, $perPage);
    }

    public function getById(int $schoolId, int $id): array
    {
        $sql = "SELECT s.*, u.name, u.email, u.phone, u.is_active, cl.name as class_name
                FROM students s
                JOIN users u ON s.user_id = u.id
                LEFT JOIN classes cl ON s.class_id = cl.id
                WHERE s.id = ? AND s.school_id = ?";
                
        $student = $this->db->fetchOne($sql, [$id, $schoolId]);
        if (!$student) {
            Response::notFound('الطالب غير موجود');
        }
        return $student;
    }

    public function create(int $schoolId, array $data): array
    {
        $studentCode = $data['student_code'] ?? 'STU-' . (time() % 100000) . rand(10, 99);

        // Current Year
        $ay = $this->db->fetchOne("SELECT id FROM academic_years WHERE school_id = ? AND is_current = 1 LIMIT 1", [$schoolId]);
        $academicYearId = $ay ? $ay['id'] : 1;

        return $this->db->transaction(function(Database $db) use ($schoolId, $academicYearId, $data, $studentCode) {
            $passwordHash = password_hash($data['password'] ?? '12345678', PASSWORD_BCRYPT, ['cost' => 12]);
            
            $userId = $db->insert('users', [
                'name'          => $data['name'],
                'email'         => $data['email'] ?? null,
                'password_hash' => $passwordHash,
                'role'          => 'student',
                'is_active'     => 1
            ]);

            $studentId = $db->insert('students', [
                'user_id'          => $userId,
                'school_id'        => $schoolId,
                'grade_level_id'   => $data['grade_level_id'] ?? null,
                'class_id'         => !empty($data['class_id']) ? $data['class_id'] : null,
                'academic_year_id' => $academicYearId,
                'student_code'     => $studentCode,
                'parent_phone'     => $data['parent_phone'] ?? '',
                'date_of_birth'    => !empty($data['date_of_birth']) ? $data['date_of_birth'] : null,
                'gender'           => $data['gender'] ?? null,
                'address'          => $data['address'] ?? null,
                'enrolled_at'      => date('Y-m-d'),
                'status'           => 'active'
            ]);

            if (!empty($data['parent_phone'])) {
                $phone = $data['parent_phone'];
                $parentUser = $db->fetchOne("SELECT id FROM users WHERE phone = ? AND role = 'parent' LIMIT 1", [$phone]);
                
                $rawPassword = $data['password'] ?? '12345678';
                $parentName = 'ولي أمر الطالب ' . $data['name'];

                if (!$parentUser) {
                    $parentPassHash = password_hash($rawPassword, PASSWORD_BCRYPT, ['cost' => 12]);
                    $parentUserId = $db->insert('users', [
                        'name'          => $parentName,
                        'phone'         => $phone,
                        'password_hash' => $parentPassHash,
                        'role'          => 'parent',
                        'is_active'     => 1
                    ]);
                    $db->insert('parents', [
                        'user_id'  => $parentUserId, 
                        'phone'    => $phone,
                        'name'     => $parentName,
                        'password' => $rawPassword
                    ]);
                }
            }

            return $this->getById($schoolId, $studentId);
        });
    }

    public function assignByRank(int $schoolId, int $gradeLevelId, int $sectionId, int $start, int $end): void
    {
        $sql = "SELECT s.id 
                FROM students s 
                JOIN users u ON s.user_id = u.id
                WHERE s.school_id = ? AND s.grade_level_id = ?
                ORDER BY u.name ASC";

        $allStudents = $this->db->fetchAll($sql, [$schoolId, $gradeLevelId]);
        
        $toUpdate = array_slice($allStudents, $start - 1, $end - $start + 1);

        foreach ($toUpdate as $stu) {
            $this->db->update('students', ['class_id' => $sectionId], ['id' => $stu['id']]);
        }
    }

    public function createBulk(int $schoolId, array $students): array
    {
        return $this->db->transaction(function(Database $db) use ($schoolId, $students) {
            $createdCount = 0;
            foreach ($students as $data) {
                // Cast all values to their correct types to avoid JSON int/string confusion
                $name        = (string)($data['name'] ?? '');
                $email       = !empty($data['email']) ? (string)$data['email'] : null;
                $phone       = (string)($data['parent_phone'] ?? '');
                $gender      = (string)($data['gender'] ?? 'male');
                $address     = !empty($data['address']) ? (string)$data['address'] : null;
                $dob         = !empty($data['date_of_birth']) ? (string)$data['date_of_birth'] : null;
                $gradeLevelId = (int)($data['grade_level_id'] ?? 0);
                $classId     = !empty($data['class_id']) ? (int)$data['class_id'] : null;

                if (empty($name)) continue;

                $studentCode  = !empty($data['student_code']) ? (string)$data['student_code'] : 'STU-' . (time() % 100000) . rand(10, 99) . $createdCount;
                $passwordHash = password_hash((string)($data['password'] ?? '12345678'), PASSWORD_BCRYPT, ['cost' => 12]);

                $userId = $db->insert('users', [
                    'name'          => $name,
                    'email'         => $email,
                    'password_hash' => $passwordHash,
                    'role'          => 'student',
                    'is_active'     => 1
                ]);

                $db->insert('students', [
                    'user_id'          => $userId,
                    'school_id'        => $schoolId,
                    'grade_level_id'   => $gradeLevelId ?: null,
                    'class_id'         => $classId,
                    'academic_year_id' => 1,
                    'student_code'     => $studentCode,
                    'parent_phone'     => $phone,
                    'gender'           => $gender,
                    'address'          => $address,
                    'enrolled_at'      => date('Y-m-d'),
                    'status'           => 'active'
                ]);

                if (!empty($phone)) {
                    $parentUser = $db->fetchOne("SELECT id FROM users WHERE phone = ? AND role = 'parent' LIMIT 1", [$phone]);
                    
                    $rawPassword = (string)($data['password'] ?? '12345678');
                    $parentName = 'ولي أمر الطالب ' . $name;

                    if (!$parentUser) {
                        $parentPassHash = password_hash($rawPassword, PASSWORD_BCRYPT, ['cost' => 12]);
                        $parentUserId = $db->insert('users', [
                            'name'          => $parentName,
                            'phone'         => $phone,
                            'password_hash' => $parentPassHash,
                            'role'          => 'parent',
                            'is_active'     => 1
                        ]);
                        $db->insert('parents', [
                            'user_id'  => $parentUserId, 
                            'phone'    => $phone,
                            'name'     => $parentName,
                            'password' => $rawPassword
                        ]);
                    }
                }
                $createdCount++;
            }
            return ['count' => $createdCount];
        });
    }

    public function update(int $schoolId, int $id, array $data): array
    {
        $student = $this->getById($schoolId, $id);
        
        $this->db->transaction(function(Database $db) use ($student, $data, $id) {
            if (isset($data['name']) || isset($data['email']) || isset($data['is_active']) || !empty($data['password'])) {
                $userUpdate = [];
                if (isset($data['name'])) $userUpdate['name'] = $data['name'];
                if (isset($data['email'])) $userUpdate['email'] = $data['email'];
                if (isset($data['is_active'])) $userUpdate['is_active'] = $data['is_active'];
                if (!empty($data['password'])) {
                    $userUpdate['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
                }
                $db->update('users', $userUpdate, ['id' => $student['user_id']]);
            }

            $studentUpdate = [];
            $fillable = ['class_id', 'student_code', 'date_of_birth', 'gender', 'parent_phone', 'address', 'status', 'grade_level_id'];
            foreach ($fillable as $f) {
                if (array_key_exists($f, $data)) $studentUpdate[$f] = $data[$f];
            }
            if (!empty($studentUpdate)) {
                $db->update('students', $studentUpdate, ['id' => $id]);
            }
        });

        return $this->getById($schoolId, $id);
    }
}
