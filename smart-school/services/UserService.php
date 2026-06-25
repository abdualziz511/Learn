<?php
// services/UserService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;
use Services\SystemService;

class UserService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getAll(int $page = 1, int $perPage = 20, ?string $role = null): array
    {
        $params = [];
        $where = "1=1";
        if ($role) {
            $where .= " AND role = ?";
            $params[] = $role;
        }

        $sql = "SELECT u.id, u.name, u.email, u.phone, u.role, u.is_active, u.last_login, u.created_at, sa.school_id
                FROM users u
                LEFT JOIN school_admins sa ON u.id = sa.user_id
                WHERE {$where} 
                ORDER BY u.id DESC";
        
        return $this->db->paginate($sql, $params, $page, $perPage);
    }

    public function getById(int $id): array
    {
        $user = $this->db->fetchOne("SELECT id, name, email, phone, role, is_active, avatar, last_login, created_at FROM users WHERE id = ?", [$id]);
        if (!$user) {
            Response::notFound('المستخدم غير موجود');
        }

        // Get role-specific details
        switch ($user['role']) {
            case 'school_admin':
                $user['school_admin_details'] = $this->db->fetchAll("SELECT school_id FROM school_admins WHERE user_id = ?", [$id]);
                break;
            case 'teacher':
                $user['teacher_details'] = $this->db->fetchOne("SELECT * FROM teachers WHERE user_id = ?", [$id]);
                break;
            case 'student':
                $user['student_details'] = $this->db->fetchOne("SELECT * FROM students WHERE user_id = ?", [$id]);
                break;
            case 'parent':
                $user['parent_details'] = $this->db->fetchOne("SELECT * FROM parents WHERE user_id = ?", [$id]);
                break;
        }

        return $user;
    }

    public function create(array $data): array
    {
        $this->validateUnique($data['email'] ?? null, $data['phone'] ?? null);
        $this->validatePassword($data['password'] ?? '');

        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);

        return $this->db->transaction(function(Database $db) use ($data, $passwordHash) {
            $userId = $db->insert('users', [
                'name'          => $data['name'],
                'email'         => $data['email'] ?? null,
                'phone'         => $data['phone'] ?? null,
                'password_hash' => $passwordHash,
                'role'          => $data['role'],
                'is_active'     => $data['is_active'] ?? 1
            ]);

            // Create role specific records if provided
            if ($data['role'] === 'school_admin' && !empty($data['school_id'])) {
                $db->insert('school_admins', [
                    'user_id'   => $userId,
                    'school_id' => $data['school_id']
                ]);
            }
            // More role specific logic can be added here for teacher, student, parent
            // But usually super_admin will just create the user, then assign them.

            $newU = $this->getById($userId);
            \Services\AuditService::getInstance()->log('CREATE_USER', 'users', $userId, null, $newU);
            return $newU;
        });
    }

    public function update(int $id, array $data): array
    {
        $user = $this->getById($id);
        $this->validateUnique($data['email'] ?? null, $data['phone'] ?? null, $id);

        $updateData = [];
        $fillable = ['name', 'email', 'phone', 'role', 'is_active'];
        
        foreach ($fillable as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
            }
        }

        if (!empty($data['password'])) {
            $this->validatePassword($data['password']);
            $updateData['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        }

        return $this->db->transaction(function(Database $db) use ($id, $updateData, $data, $user) {
            if (!empty($updateData)) {
                $db->update('users', $updateData, ['id' => $id]);
            }

            // Update role specific records
            if (isset($data['role']) && $data['role'] === 'school_admin' && !empty($data['school_id'])) {
                // Delete existing and insert new (simplest way for 1-to-1)
                $db->delete('school_admins', ['user_id' => $id]);
                $db->insert('school_admins', [
                    'user_id'   => $id,
                    'school_id' => $data['school_id']
                ]);
            } elseif (isset($data['school_id']) && !empty($data['school_id'])) {
                 // Even if role didn't change, we might want to update school_id
                 $user = $db->fetchOne("SELECT role FROM users WHERE id = ?", [$id]);
                 if ($user && $user['role'] === 'school_admin') {
                    $db->delete('school_admins', ['user_id' => $id]);
                    $db->insert('school_admins', [
                        'user_id'   => $id,
                        'school_id' => $data['school_id']
                    ]);
                 }
            }

            $newU = $this->getById($id);
            \Services\AuditService::getInstance()->log('UPDATE_USER', 'users', $id, $user, $newU);
            return $newU;
        });
    }

    public function delete(int $id): void
    {
        $user = $this->getById($id); // ensure exists
        // Since foreign keys are ON DELETE CASCADE, deleting the user will delete their role-specific records
        $this->db->delete('users', ['id' => $id]);
        \Services\AuditService::getInstance()->log('DELETE_USER', 'users', $id, $user);
    }

    private function validateUnique(?string $email, ?string $phone, ?int $excludeId = null): void
    {
        if ($email) {
            $sql = "SELECT id FROM users WHERE email = ?";
            $params = [$email];
            if ($excludeId) {
                $sql .= " AND id != ?";
                $params[] = $excludeId;
            }
            if ($this->db->fetchOne($sql, $params)) {
                Response::validationError(['email' => ['البريد الإلكتروني مستخدم بالفعل']]);
            }
        }

        if ($phone) {
            $sql = "SELECT id FROM users WHERE phone = ?";
            $params = [$phone];
            if ($excludeId) {
                $sql .= " AND id != ?";
                $params[] = $excludeId;
            }
            if ($this->db->fetchOne($sql, $params)) {
                Response::validationError(['phone' => ['رقم الهاتف مستخدم بالفعل']]);
            }
        }
    }

    private function validatePassword(string $password): void
    {
        $minLength = (int)SystemService::getSetting('password_min_length', 8);
        if (strlen($password) < $minLength) {
            Response::validationError(['password' => ["يجب أن لا يقل طول كلمة المرور عن {$minLength} رموز"]]);
        }
    }
}
