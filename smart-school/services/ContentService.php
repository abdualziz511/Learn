<?php
// services/ContentService.php

declare(strict_types=1);

namespace Services;

use Core\Database;
use Core\Response;
use Core\FileUpload;
use Core\Auth;
use Core\Request;

class ContentService
{
    private Database $db;
    private FileUpload $uploader;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->uploader = new FileUpload();
    }

    public function getAll(int $subjectId, int $page = 1, int $perPage = 20, ?string $type = null, ?int $term = null): array
    {
        $params = [$subjectId];
        $where = "subject_id = ?";
        if ($type) {
            $where .= " AND type = ?";
            $params[] = $type;
        }
        if ($term !== null) {
            $where .= " AND term = ?";
            $params[] = $term;
        }

        $sql = "SELECT id, title, description, type, file_path, file_size, mime_type, target_role, uploaded_by, is_active, created_at, term 
                FROM educational_content 
                WHERE {$where} 
                ORDER BY id DESC";
        
        $result = $this->db->paginate($sql, $params, $page, $perPage);
        
        // Format file sizes
        foreach ($result['data'] as &$row) {
            $row['file_size_formatted'] = $row['file_size'] ? FileUpload::formatSize((int)$row['file_size']) : null;
        }

        return $result;
    }

    public function getById(int $id): array
    {
        $content = $this->db->fetchOne("SELECT * FROM educational_content WHERE id = ?", [$id]);
        if (!$content) {
            Response::notFound('المحتوى غير موجود');
        }
        return $content;
    }

    public function create(array $data, ?array $file, Request $request): array
    {
        // verify subject exists and get its school_id via grade_level_id
        $subject = $this->db->fetchOne(
            "SELECT gl.school_id 
             FROM subjects s 
             JOIN grade_levels gl ON s.grade_level_id = gl.id 
             WHERE s.id = ?", 
            [$data['subject_id']]
        );
        if (!$subject) {
            Response::validationError(['subject_id' => ['المادة الدراسية غير موجودة']]);
        }

        $filePath = null;
        $fileSize = null;
        $mimeType = null;

        if ($file && $file['error'] !== UPLOAD_ERR_NO_FILE) {
            $subDir = match($data['type']) {
                'curriculum' => 'curricula',
                'summary' => 'summaries',
                'reference' => 'references',
                'presentation' => 'presentations',
                default => 'other'
            };
            
            // grouping files by school and subject
            $dirPath = "{$subDir}/{$subject['school_id']}/{$data['subject_id']}";
            
            $filePath = $this->uploader->upload($file, $dirPath);
            $fileSize = $file['size'];
            
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($file['tmp_name']);
        }

        $currentUser = Auth::user($request);

        $id = $this->db->insert('educational_content', [
            'subject_id'  => $data['subject_id'],
            'school_id'   => $subject['school_id'],
            'title'       => $data['title'],
            'description' => $data['description'] ?? null,
            'type'        => $data['type'],
            'term'        => $data['term'] ?? 1,
            'file_path'   => $filePath,
            'file_size'   => $fileSize,
            'mime_type'   => $mimeType,
            'target_role' => $data['target_role'] ?? 'both',
            'uploaded_by' => $currentUser['id'],
            'is_active'   => $data['is_active'] ?? 1
        ]);

        return $this->getById($id);
    }

    public function delete(int $id): void
    {
        $content = $this->getById($id);
        
        if ($content['file_path']) {
            $this->uploader->delete($content['file_path']);
        }

        $this->db->delete('educational_content', ['id' => $id]);
    }
}
