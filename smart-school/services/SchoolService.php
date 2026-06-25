<?php
// services/SchoolService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class SchoolService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getAll(int $page = 1, int $perPage = 20): array
    {
        $sql = "SELECT id, name, name_en, logo, city, phone, email, status, address, country, website, founded_year, min_grade_id, max_grade_id, created_at 
                FROM schools 
                ORDER BY id DESC";
        
        return $this->db->paginate($sql, [], $page, $perPage);
    }

    public function getById(int $id): array
    {
        $school = $this->db->fetchOne("SELECT * FROM schools WHERE id = ?", [$id]);
        if (!$school) {
            Response::notFound('المدرسة غير موجودة');
        }
        return $school;
    }

    public function create(array $data): array
    {
        // Check for unique email if provided
        if (!empty($data['email'])) {
            $exists = $this->db->fetchOne("SELECT id FROM schools WHERE email = ?", [$data['email']]);
            if ($exists) {
                Response::validationError(['email' => ['البريد الإلكتروني مستخدم بالفعل']]);
            }
        }

        // Set default settings if none provided
        if (empty($data['settings'])) {
            $data['settings'] = json_encode(['theme' => 'light']);
        }

        $id = $this->db->insert('schools', [
            'name'         => $data['name'],
            'name_en'      => $data['name_en'] ?? null,
            'address'      => $data['address'] ?? null,
            'city'         => $data['city'] ?? null,
            'country'      => $data['country'] ?? 'YE',
            'phone'        => $data['phone'] ?? null,
            'email'        => $data['email'] ?? null,
            'website'      => $data['website'] ?? null,
            'founded_year' => $data['founded_year'] ?? null,
            'status'       => $data['status'] ?? 'active',
            'min_grade_id' => $data['min_grade_id'] ?? null,
            'max_grade_id' => $data['max_grade_id'] ?? null,
            'settings'     => $data['settings']
        ]);

        $newS = $this->getById($id);
        \Services\AuditService::getInstance()->log('CREATE_SCHOOL', 'schools', $id, null, $newS);
        return $newS;
    }

    public function update(int $id, array $data): array
    {
        $school = $this->getById($id);

        if (!empty($data['email']) && $data['email'] !== $school['email']) {
            $exists = $this->db->fetchOne("SELECT id FROM schools WHERE email = ? AND id != ?", [$data['email'], $id]);
            if ($exists) {
                Response::validationError(['email' => ['البريد الإلكتروني مستخدم بالفعل']]);
            }
        }

        $updateData = [];
        $fillable = ['name', 'name_en', 'address', 'city', 'country', 'phone', 'email', 'website', 'founded_year', 'status', 'min_grade_id', 'max_grade_id'];
        
        foreach ($fillable as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
            }
        }

        if (!empty($updateData)) {
            $this->db->update('schools', $updateData, ['id' => $id]);
        }

        $newS = $this->getById($id);
        \Services\AuditService::getInstance()->log('UPDATE_SCHOOL', 'schools', $id, $school, $newS);
        return $newS;
    }

    public function delete(int $id): void
    {
        $school = $this->getById($id); // ensure exists
        $this->db->delete('schools', ['id' => $id]);
        \Services\AuditService::getInstance()->log('DELETE_SCHOOL', 'schools', $id, $school);
    }
}
