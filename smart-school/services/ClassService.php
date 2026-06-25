<?php
// services/ClassService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;

class ClassService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    // -------------------------------------------------------
    // Grade Levels Management
    // -------------------------------------------------------
    public function getGrades(?int $schoolId): array
    {
        // If schoolId is provided, we just get grades for that school
        if ($schoolId !== null) {
            return $this->db->fetchAll("SELECT * FROM grade_levels WHERE school_id = ? ORDER BY order_num ASC", [$schoolId]);
        }

        // If for Super Admin (schoolId is null), we get all grades with school counts
        // Logic: A school teaches a grade if G.order_num fits between school's min and max grade's order_num
        $sql = "SELECT g.*, 
                (SELECT COUNT(*) FROM schools s
                 JOIN grade_levels g_min ON s.min_grade_id = g_min.id
                 JOIN grade_levels g_max ON s.max_grade_id = g_max.id
                 WHERE g.order_num >= g_min.order_num AND g.order_num <= g_max.order_num) as school_count
                FROM grade_levels g
                ORDER BY g.order_num ASC";
        
        return $this->db->fetchAll($sql);
    }

    public function createGrade(array $data): array
    {
        $id = $this->db->insert('grade_levels', [
            'school_id' => $data['school_id'],
            'name'      => $data['name'],
            'order_num' => $data['order_num'] ?? 0
        ]);

        $newGrade = $this->db->fetchOne("SELECT * FROM grade_levels WHERE id = ?", [$id]);
        \Services\AuditService::getInstance()->log('CREATE_GRADE', 'grade_levels', $id, null, $newGrade);

        return $newGrade;
    }

    public function updateGrade(int $id, array $data): array
    {
        $updateData = [];
        if (isset($data['name'])) $updateData['name'] = $data['name'];
        if (isset($data['order_num'])) $updateData['order_num'] = (int)$data['order_num'];

        $oldGrade = $this->db->fetchOne("SELECT * FROM grade_levels WHERE id = ?", [$id]);
        if (!empty($updateData)) {
            $this->db->update('grade_levels', $updateData, ['id' => $id]);
        }
        $newGrade = $this->db->fetchOne("SELECT * FROM grade_levels WHERE id = ?", [$id]);
        \Services\AuditService::getInstance()->log('UPDATE_GRADE', 'grade_levels', $id, $oldGrade, $newGrade);
        
        return $newGrade;
    }

    public function deleteGrade(int $id): void
    {
        // 1. Check if grade is used as a range limit in any school
        // We use the order_num of the grade to see if it's within any school's range
        $grade = $this->db->fetchOne("SELECT * FROM grade_levels WHERE id = ?", [$id]);
        if (!$grade) {
            Response::notFound('الصف الدراسي غير موجود');
        }

        $sql = "SELECT COUNT(*) as school_cnt FROM schools s
                JOIN grade_levels g_min ON s.min_grade_id = g_min.id
                JOIN grade_levels g_max ON s.max_grade_id = g_max.id
                WHERE ? >= g_min.order_num AND ? <= g_max.order_num";
        
        $check = $this->db->fetchOne($sql, [$grade['order_num'], $grade['order_num']]);
        
        if ($check && (int)$check['school_cnt'] > 0) {
            Response::error('لا يمكن حذف هذا الصف نهائياً؛ لأنه مفعّل حالياً ضمن النطاق التعليمي لـ ' . $check['school_cnt'] . ' مدرسة. يجب إزالة هذا الصف من نطاق تدريس المدارس أولاً قبل الحذف.', 400);
        }

        // 2. Check for other central relations
        $hasClasses = $this->db->fetchOne("SELECT id FROM classes WHERE grade_level_id = ? LIMIT 1", [$id]);
        if ($hasClasses) {
            Response::error('فشل عملية الحذف: الصف مرتبط بفصول دراسية قائمة في النظام.', 400);
        }

        $hasSubjects = $this->db->fetchOne("SELECT id FROM subjects WHERE grade_level_id = ? LIMIT 1", [$id]);
        if ($hasSubjects) {
            Response::error('فشل عملية الحذف: الصف مرتبط بمقررات دراسية في المحتوى المركزي.', 400);
        }

        $this->db->delete('grade_levels', ['id' => $id]);
        \Services\AuditService::getInstance()->log('DELETE_GRADE', 'grade_levels', $id, $grade);
    }

    // -------------------------------------------------------
    // Classes Management
    // -------------------------------------------------------
    public function getClasses(int $schoolId, ?int $gradeId = null): array
    {
        $params = [$schoolId];
        $where = "c.school_id = ?";
        
        if ($gradeId) {
            $where .= " AND c.grade_level_id = ?";
            $params[] = $gradeId;
        }

        $sql = "SELECT c.*, g.name as grade_name 
                FROM classes c 
                JOIN grade_levels g ON c.grade_level_id = g.id 
                WHERE {$where} 
                ORDER BY g.order_num ASC, c.name ASC";

        return $this->db->fetchAll($sql, $params);
    }

    public function createClass(array $data): array
    {
        // verify grade belongs to school
        $grade = $this->db->fetchOne("SELECT school_id FROM grade_levels WHERE id = ?", [$data['grade_level_id']]);
        if (!$grade || $grade['school_id'] != $data['school_id']) {
            Response::validationError(['grade_level_id' => ['المرحلة الدراسية غير تابعة لهذه المدرسة']]);
        }

        // We assume academic_year_id is passed, or we find current year
        if (empty($data['academic_year_id'])) {
            $year = $this->db->fetchOne("SELECT id FROM academic_years WHERE school_id = ? AND is_current = 1", [$data['school_id']]);
            if (!$year) {
                Response::error('لا يوجد سنة دراسية مفعلة حالياً في هذه المدرسة', 400);
            }
            $data['academic_year_id'] = $year['id'];
        }

        $id = $this->db->insert('classes', [
            'school_id'        => $data['school_id'],
            'grade_level_id'   => $data['grade_level_id'],
            'academic_year_id' => $data['academic_year_id'],
            'name'             => $data['name'],
            'capacity'         => $data['capacity'] ?? 40
        ]);

        return $this->db->fetchOne("SELECT * FROM classes WHERE id = ?", [$id]);
    }

    public function updateClass(int $id, array $data): array
    {
        $updateData = [];
        if (isset($data['name'])) $updateData['name'] = $data['name'];
        if (isset($data['capacity'])) $updateData['capacity'] = $data['capacity'];

        if (!empty($updateData)) {
            $this->db->update('classes', $updateData, ['id' => $id]);
        }

        return $this->db->fetchOne("SELECT * FROM classes WHERE id = ?", [$id]);
    }

    public function deleteClass(int $id): void
    {
        $this->db->delete('classes', ['id' => $id]);
    }
}
