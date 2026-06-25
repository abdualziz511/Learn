<?php
// services/SubjectService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class SubjectService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getAll(int $schoolId, int $page = 1, int $perPage = 20, ?int $gradeId = null): array
    {
        $params = [$schoolId];
        // Allow fetching subjects from the specific school OR central subjects (school 1)
        $where = "(gl.school_id = ? OR gl.school_id = 1)";
        
        if ($gradeId) {
            $where .= " AND s.grade_level_id = ?";
            $params[] = $gradeId;
        }

        $sql = "SELECT s.*, gl.name as grade_name 
                FROM subjects s
                JOIN grade_levels gl ON s.grade_level_id = gl.id
                WHERE {$where} 
                ORDER BY gl.order_num ASC, s.name ASC";
                
        return $this->db->paginate($sql, $params, $page, $perPage);
    }

    public function getById(int $id): array
    {
        $subject = $this->db->fetchOne("SELECT * FROM subjects WHERE id = ?", [$id]);
        if (!$subject) {
            Response::notFound('المادة الدراسية غير موجودة');
        }
        return $subject;
    }

    public function create(array $data): array
    {
        $id = $this->db->insert('subjects', [
            'grade_level_id' => $data['grade_level_id'],
            'name'           => $data['name'],
            'name_en'        => $data['name_en'] ?? null,
            'code'           => $data['code'] ?? null,
            'description'    => $data['description'] ?? null,
            'icon'           => $data['icon'] ?? null,
            'color'          => $data['color'] ?? null
        ]);

        $newRel = $this->getById($id);
        \Services\AuditService::getInstance()->log('CREATE_SUBJECT', 'subjects', $id, null, $newRel);
        return $newRel;
    }

    public function update(int $id, array $data): array
    {
        $subject = $this->getById($id);

        $updateData = [];
        $fillable = ['name', 'name_en', 'code', 'description', 'icon', 'color', 'grade_level_id', 'term'];
        
        foreach ($fillable as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
            }
        }

        if (!empty($updateData)) {
            $this->db->update('subjects', $updateData, ['id' => $id]);
        }

        $newSubject = $this->getById($id);
        \Services\AuditService::getInstance()->log('UPDATE_SUBJECT', 'subjects', $id, $subject, $newSubject);
        return $newSubject;
    }

    public function delete(int $id): void
    {
        $subject = $this->getById($id);
        $this->db->delete('subjects', ['id' => $id]);
        \Services\AuditService::getInstance()->log('DELETE_SUBJECT', 'subjects', $id, $subject);
    }
}
